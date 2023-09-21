/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/node/extpath", "vs/base/node/pfs", "vs/platform/files/common/watcher"], function (require, exports, fs_1, async_1, cancellation_1, extpath_1, lifecycle_1, normalization_1, path_1, platform_1, extpath_2, pfs_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.watchFileContents = exports.NodeJSFileWatcherLibrary = void 0;
    class NodeJSFileWatcherLibrary extends lifecycle_1.Disposable {
        // A delay in reacting to file deletes to support
        // atomic save operations where a tool may chose
        // to delete a file before creating it again for
        // an update.
        static { this.FILE_DELETE_HANDLER_DELAY = 100; }
        // A delay for collecting file changes from node.js
        // before collecting them for coalescing and emitting
        // Same delay as used for the recursive watcher.
        static { this.FILE_CHANGES_HANDLER_DELAY = 75; }
        constructor(request, onDidFilesChange, onLogMessage, verboseLogging) {
            super();
            this.request = request;
            this.onDidFilesChange = onDidFilesChange;
            this.onLogMessage = onLogMessage;
            this.verboseLogging = verboseLogging;
            // Reduce likelyhood of spam from file events via throttling.
            // These numbers are a bit more aggressive compared to the
            // recursive watcher because we can have many individual
            // node.js watchers per request.
            // (https://github.com/microsoft/vscode/issues/124723)
            this.throttledFileChangesEmitter = this._register(new async_1.ThrottledWorker({
                maxWorkChunkSize: 100,
                throttleDelay: 200,
                maxBufferedWork: 10000 // ...but never buffering more than 10000 events in memory
            }, events => this.onDidFilesChange(events)));
            // Aggregate file changes over FILE_CHANGES_HANDLER_DELAY
            // to coalesce events and reduce spam.
            this.fileChangesAggregator = this._register(new async_1.RunOnceWorker(events => this.handleFileChanges(events), NodeJSFileWatcherLibrary.FILE_CHANGES_HANDLER_DELAY));
            this.excludes = (0, watcher_1.parseWatcherPatterns)(this.request.path, this.request.excludes);
            this.includes = this.request.includes ? (0, watcher_1.parseWatcherPatterns)(this.request.path, this.request.includes) : undefined;
            this.cts = new cancellation_1.CancellationTokenSource();
            this.ready = this.watch();
        }
        async watch() {
            try {
                const realPath = await this.normalizePath(this.request);
                if (this.cts.token.isCancellationRequested) {
                    return;
                }
                // Watch via node.js
                const stat = await pfs_1.Promises.stat(realPath);
                this._register(await this.doWatch(realPath, stat.isDirectory()));
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    this.error(error);
                }
                else {
                    this.trace(error);
                }
            }
        }
        async normalizePath(request) {
            let realPath = request.path;
            try {
                // First check for symbolic link
                realPath = await pfs_1.Promises.realpath(request.path);
                // Second check for casing difference
                // Note: this will be a no-op on Linux platforms
                if (request.path === realPath) {
                    realPath = await (0, extpath_2.realcase)(request.path) ?? request.path;
                }
                // Correct watch path as needed
                if (request.path !== realPath) {
                    this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
                }
            }
            catch (error) {
                // ignore
            }
            return realPath;
        }
        async doWatch(path, isDirectory) {
            // macOS: watching samba shares can crash VSCode so we do
            // a simple check for the file path pointing to /Volumes
            // (https://github.com/microsoft/vscode/issues/106879)
            // TODO@electron this needs a revisit when the crash is
            // fixed or mitigated upstream.
            if (platform_1.isMacintosh && (0, extpath_1.isEqualOrParent)(path, '/Volumes/', true)) {
                this.error(`Refusing to watch ${path} for changes using fs.watch() for possibly being a network share where watching is unreliable and unstable.`);
                return lifecycle_1.Disposable.None;
            }
            const cts = new cancellation_1.CancellationTokenSource(this.cts.token);
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const pathBasename = (0, path_1.basename)(path);
                // Creating watcher can fail with an exception
                const watcher = (0, fs_1.watch)(path);
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    watcher.removeAllListeners();
                    watcher.close();
                }));
                this.trace(`Started watching: '${path}'`);
                // Folder: resolve children to emit proper events
                const folderChildren = new Set();
                if (isDirectory) {
                    try {
                        for (const child of await pfs_1.Promises.readdir(path)) {
                            folderChildren.add(child);
                        }
                    }
                    catch (error) {
                        this.error(error);
                    }
                }
                const mapPathToStatDisposable = new Map();
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    for (const [, disposable] of mapPathToStatDisposable) {
                        disposable.dispose();
                    }
                    mapPathToStatDisposable.clear();
                }));
                watcher.on('error', (code, signal) => {
                    this.error(`Failed to watch ${path} for changes using fs.watch() (${code}, ${signal})`);
                    // The watcher is no longer functional reliably
                    // so we go ahead and dispose it
                    this.dispose();
                });
                watcher.on('change', (type, raw) => {
                    if (cts.token.isCancellationRequested) {
                        return; // ignore if already disposed
                    }
                    this.trace(`[raw] ["${type}"] ${raw}`);
                    // Normalize file name
                    let changedFileName = '';
                    if (raw) { // https://github.com/microsoft/vscode/issues/38191
                        changedFileName = raw.toString();
                        if (platform_1.isMacintosh) {
                            // Mac: uses NFD unicode form on disk, but we want NFC
                            // See also https://github.com/nodejs/node/issues/2165
                            changedFileName = (0, normalization_1.normalizeNFC)(changedFileName);
                        }
                    }
                    if (!changedFileName || (type !== 'change' && type !== 'rename')) {
                        return; // ignore unexpected events
                    }
                    // Folder
                    if (isDirectory) {
                        // Folder child added/deleted
                        if (type === 'rename') {
                            // Cancel any previous stats for this file if existing
                            mapPathToStatDisposable.get(changedFileName)?.dispose();
                            // Wait a bit and try see if the file still exists on disk
                            // to decide on the resulting event
                            const timeoutHandle = setTimeout(async () => {
                                mapPathToStatDisposable.delete(changedFileName);
                                // Depending on the OS the watcher runs on, there
                                // is different behaviour for when the watched
                                // folder path is being deleted:
                                //
                                // -   macOS: not reported but events continue to
                                //            work even when the folder is brought
                                //            back, though it seems every change
                                //            to a file is reported as "rename"
                                // -   Linux: "rename" event is reported with the
                                //            name of the folder and events stop
                                //            working
                                // - Windows: an EPERM error is thrown that we
                                //            handle from the `on('error')` event
                                //
                                // We do not re-attach the watcher after timeout
                                // though as we do for file watches because for
                                // file watching specifically we want to handle
                                // the atomic-write cases where the file is being
                                // deleted and recreated with different contents.
                                //
                                // Same as with recursive watching, we do not
                                // emit a delete event in this case.
                                if (changedFileName === pathBasename && !await pfs_1.Promises.exists(path)) {
                                    this.warn('Watcher shutdown because watched path got deleted');
                                    // The watcher is no longer functional reliably
                                    // so we go ahead and dispose it
                                    this.dispose();
                                    return;
                                }
                                // In order to properly detect renames on a case-insensitive
                                // file system, we need to use `existsChildStrictCase` helper
                                // because otherwise we would wrongly assume a file exists
                                // when it was renamed to same name but different case.
                                const fileExists = await this.existsChildStrictCase((0, path_1.join)(path, changedFileName));
                                if (cts.token.isCancellationRequested) {
                                    return; // ignore if disposed by now
                                }
                                // Figure out the correct event type:
                                // File Exists: either 'added' or 'updated' if known before
                                // File Does not Exist: always 'deleted'
                                let type;
                                if (fileExists) {
                                    if (folderChildren.has(changedFileName)) {
                                        type = 0 /* FileChangeType.UPDATED */;
                                    }
                                    else {
                                        type = 1 /* FileChangeType.ADDED */;
                                        folderChildren.add(changedFileName);
                                    }
                                }
                                else {
                                    folderChildren.delete(changedFileName);
                                    type = 2 /* FileChangeType.DELETED */;
                                }
                                this.onFileChange({ path: (0, path_1.join)(this.request.path, changedFileName), type });
                            }, NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
                            mapPathToStatDisposable.set(changedFileName, (0, lifecycle_1.toDisposable)(() => clearTimeout(timeoutHandle)));
                        }
                        // Folder child changed
                        else {
                            // Figure out the correct event type: if this is the
                            // first time we see this child, it can only be added
                            let type;
                            if (folderChildren.has(changedFileName)) {
                                type = 0 /* FileChangeType.UPDATED */;
                            }
                            else {
                                type = 1 /* FileChangeType.ADDED */;
                                folderChildren.add(changedFileName);
                            }
                            this.onFileChange({ path: (0, path_1.join)(this.request.path, changedFileName), type });
                        }
                    }
                    // File
                    else {
                        // File added/deleted
                        if (type === 'rename' || changedFileName !== pathBasename) {
                            // Depending on the OS the watcher runs on, there
                            // is different behaviour for when the watched
                            // file path is being deleted:
                            //
                            // -   macOS: "rename" event is reported and events
                            //            stop working
                            // -   Linux: "rename" event is reported and events
                            //            stop working
                            // - Windows: "rename" event is reported and events
                            //            continue to work when file is restored
                            //
                            // As opposed to folder watching, we re-attach the
                            // watcher after brief timeout to support "atomic save"
                            // operations where a tool may decide to delete a file
                            // and then create it with the updated contents.
                            //
                            // Different to folder watching, we emit a delete event
                            // though we never detect when the file is brought back
                            // because the watcher is disposed then.
                            const timeoutHandle = setTimeout(async () => {
                                const fileExists = await pfs_1.Promises.exists(path);
                                if (cts.token.isCancellationRequested) {
                                    return; // ignore if disposed by now
                                }
                                // File still exists, so emit as change event and reapply the watcher
                                if (fileExists) {
                                    this.onFileChange({ path: this.request.path, type: 0 /* FileChangeType.UPDATED */ }, true /* skip excludes/includes (file is explicitly watched) */);
                                    disposables.add(await this.doWatch(path, false));
                                }
                                // File seems to be really gone, so emit a deleted event and dispose
                                else {
                                    this.onFileChange({ path: this.request.path, type: 2 /* FileChangeType.DELETED */ }, true /* skip excludes/includes (file is explicitly watched) */);
                                    // Important to flush the event delivery
                                    // before disposing the watcher, otherwise
                                    // we will loose this event.
                                    this.fileChangesAggregator.flush();
                                    this.dispose();
                                }
                            }, NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
                            // Very important to dispose the watcher which now points to a stale inode
                            // and wire in a new disposable that tracks our timeout that is installed
                            disposables.clear();
                            disposables.add((0, lifecycle_1.toDisposable)(() => clearTimeout(timeoutHandle)));
                        }
                        // File changed
                        else {
                            this.onFileChange({ path: this.request.path, type: 0 /* FileChangeType.UPDATED */ }, true /* skip excludes/includes (file is explicitly watched) */);
                        }
                    }
                });
            }
            catch (error) {
                if (await pfs_1.Promises.exists(path) && !cts.token.isCancellationRequested) {
                    this.error(`Failed to watch ${path} for changes using fs.watch() (${error.toString()})`);
                }
            }
            return (0, lifecycle_1.toDisposable)(() => {
                cts.dispose(true);
                disposables.dispose();
            });
        }
        onFileChange(event, skipIncludeExcludeChecks = false) {
            if (this.cts.token.isCancellationRequested) {
                return;
            }
            // Logging
            if (this.verboseLogging) {
                this.trace(`${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.path}`);
            }
            // Add to aggregator unless excluded or not included (not if explicitly disabled)
            if (!skipIncludeExcludeChecks && this.excludes.some(exclude => exclude(event.path))) {
                if (this.verboseLogging) {
                    this.trace(` >> ignored (excluded) ${event.path}`);
                }
            }
            else if (!skipIncludeExcludeChecks && this.includes && this.includes.length > 0 && !this.includes.some(include => include(event.path))) {
                if (this.verboseLogging) {
                    this.trace(` >> ignored (not included) ${event.path}`);
                }
            }
            else {
                this.fileChangesAggregator.work(event);
            }
        }
        handleFileChanges(fileChanges) {
            // Coalesce events: merge events of same kind
            const coalescedFileChanges = (0, watcher_1.coalesceEvents)(fileChanges);
            if (coalescedFileChanges.length > 0) {
                // Logging
                if (this.verboseLogging) {
                    for (const event of coalescedFileChanges) {
                        this.trace(`>> normalized ${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.path}`);
                    }
                }
                // Broadcast to clients via throttled emitter
                const worked = this.throttledFileChangesEmitter.work(coalescedFileChanges);
                // Logging
                if (!worked) {
                    this.warn(`started ignoring events due to too many file change events at once (incoming: ${coalescedFileChanges.length}, most recent change: ${coalescedFileChanges[0].path}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                }
                else {
                    if (this.throttledFileChangesEmitter.pending > 0) {
                        this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${coalescedFileChanges[0].path}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                    }
                }
            }
        }
        async existsChildStrictCase(path) {
            if (platform_1.isLinux) {
                return pfs_1.Promises.exists(path);
            }
            try {
                const pathBasename = (0, path_1.basename)(path);
                const children = await pfs_1.Promises.readdir((0, path_1.dirname)(path));
                return children.some(child => child === pathBasename);
            }
            catch (error) {
                this.trace(error);
                return false;
            }
        }
        setVerboseLogging(verboseLogging) {
            this.verboseLogging = verboseLogging;
        }
        error(error) {
            if (!this.cts.token.isCancellationRequested) {
                this.onLogMessage?.({ type: 'error', message: `[File Watcher (node.js)] ${error}` });
            }
        }
        warn(message) {
            if (!this.cts.token.isCancellationRequested) {
                this.onLogMessage?.({ type: 'warn', message: `[File Watcher (node.js)] ${message}` });
            }
        }
        trace(message) {
            if (!this.cts.token.isCancellationRequested && this.verboseLogging) {
                this.onLogMessage?.({ type: 'trace', message: `[File Watcher (node.js)] ${message}` });
            }
        }
        dispose() {
            this.trace(`stopping file watcher on ${this.request.path}`);
            this.cts.dispose(true);
            super.dispose();
        }
    }
    exports.NodeJSFileWatcherLibrary = NodeJSFileWatcherLibrary;
    /**
     * Watch the provided `path` for changes and return
     * the data in chunks of `Uint8Array` for further use.
     */
    async function watchFileContents(path, onData, onReady, token, bufferSize = 512) {
        const handle = await pfs_1.Promises.open(path, 'r');
        const buffer = Buffer.allocUnsafe(bufferSize);
        const cts = new cancellation_1.CancellationTokenSource(token);
        let error = undefined;
        let isReading = false;
        const request = { path, excludes: [], recursive: false };
        const watcher = new NodeJSFileWatcherLibrary(request, changes => {
            (async () => {
                for (const { type } of changes) {
                    if (type === 0 /* FileChangeType.UPDATED */) {
                        if (isReading) {
                            return; // return early if we are already reading the output
                        }
                        isReading = true;
                        try {
                            // Consume the new contents of the file until finished
                            // everytime there is a change event signalling a change
                            while (!cts.token.isCancellationRequested) {
                                const { bytesRead } = await pfs_1.Promises.read(handle, buffer, 0, bufferSize, null);
                                if (!bytesRead || cts.token.isCancellationRequested) {
                                    break;
                                }
                                onData(buffer.slice(0, bytesRead));
                            }
                        }
                        catch (err) {
                            error = new Error(err);
                            cts.dispose(true);
                        }
                        finally {
                            isReading = false;
                        }
                    }
                }
            })();
        });
        await watcher.ready;
        onReady();
        return new Promise((resolve, reject) => {
            cts.token.onCancellationRequested(async () => {
                watcher.dispose();
                try {
                    await pfs_1.Promises.close(handle);
                }
                catch (err) {
                    error = new Error(err);
                }
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    exports.watchFileContents = watchFileContents;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZWpzV2F0Y2hlckxpYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvd2F0Y2hlci9ub2RlanMvbm9kZWpzV2F0Y2hlckxpYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSx3QkFBeUIsU0FBUSxzQkFBVTtRQUV2RCxpREFBaUQ7UUFDakQsZ0RBQWdEO1FBQ2hELGdEQUFnRDtRQUNoRCxhQUFhO2lCQUNXLDhCQUF5QixHQUFHLEdBQUcsQUFBTixDQUFPO1FBRXhELG1EQUFtRDtRQUNuRCxxREFBcUQ7UUFDckQsZ0RBQWdEO2lCQUN4QiwrQkFBMEIsR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQTJCeEQsWUFDUyxPQUFrQyxFQUNsQyxnQkFBc0QsRUFDdEQsWUFBeUMsRUFDekMsY0FBd0I7WUFFaEMsS0FBSyxFQUFFLENBQUM7WUFMQSxZQUFPLEdBQVAsT0FBTyxDQUEyQjtZQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXNDO1lBQ3RELGlCQUFZLEdBQVosWUFBWSxDQUE2QjtZQUN6QyxtQkFBYyxHQUFkLGNBQWMsQ0FBVTtZQTdCakMsNkRBQTZEO1lBQzdELDBEQUEwRDtZQUMxRCx3REFBd0Q7WUFDeEQsZ0NBQWdDO1lBQ2hDLHNEQUFzRDtZQUNyQyxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWUsQ0FDaEY7Z0JBQ0MsZ0JBQWdCLEVBQUUsR0FBRztnQkFDckIsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLGVBQWUsRUFBRSxLQUFLLENBQUUsMERBQTBEO2FBQ2xGLEVBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQ3ZDLENBQUMsQ0FBQztZQUVILHlEQUF5RDtZQUN6RCxzQ0FBc0M7WUFDckIsMEJBQXFCLEdBQUcsSUFB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