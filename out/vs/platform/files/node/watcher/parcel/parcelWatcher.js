/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "@parcel/watcher", "fs", "os", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/node/extpath", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib", "vs/platform/files/common/watcher"], function (require, exports, parcelWatcher, fs_1, os_1, async_1, cancellation_1, errorMessage_1, event_1, extpath_1, glob_1, lifecycle_1, ternarySearchTree_1, normalization_1, path_1, platform_1, extpath_2, nodejsWatcherLib_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ParcelWatcher = void 0;
    class ParcelWatcher extends lifecycle_1.Disposable {
        static { this.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE = new Map([
            ['create', 1 /* FileChangeType.ADDED */],
            ['update', 0 /* FileChangeType.UPDATED */],
            ['delete', 2 /* FileChangeType.DELETED */]
        ]); }
        static { this.PARCEL_WATCHER_BACKEND = platform_1.isWindows ? 'windows' : platform_1.isLinux ? 'inotify' : 'fs-events'; }
        // A delay for collecting file changes from Parcel
        // before collecting them for coalescing and emitting.
        // Parcel internally uses 50ms as delay, so we use 75ms,
        // to schedule sufficiently after Parcel.
        //
        // Note: since Parcel 2.0.7, the very first event is
        // emitted without delay if no events occured over a
        // duration of 500ms. But we always want to aggregate
        // events to apply our coleasing logic.
        //
        static { this.FILE_CHANGES_HANDLER_DELAY = 75; }
        constructor() {
            super();
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidLogMessage = this._register(new event_1.Emitter());
            this.onDidLogMessage = this._onDidLogMessage.event;
            this._onDidError = this._register(new event_1.Emitter());
            this.onDidError = this._onDidError.event;
            this.watchers = new Map();
            // Reduce likelyhood of spam from file events via throttling.
            // (https://github.com/microsoft/vscode/issues/124723)
            this.throttledFileChangesEmitter = this._register(new async_1.ThrottledWorker({
                maxWorkChunkSize: 500,
                throttleDelay: 200,
                maxBufferedWork: 30000 // ...but never buffering more than 30000 events in memory
            }, events => this._onDidChangeFile.fire(events)));
            this.verboseLogging = false;
            this.enospcErrorLogged = false;
            this.registerListeners();
        }
        registerListeners() {
            // Error handling on process
            process.on('uncaughtException', error => this.onUnexpectedError(error));
            process.on('unhandledRejection', error => this.onUnexpectedError(error));
        }
        async watch(requests) {
            // Figure out duplicates to remove from the requests
            const normalizedRequests = this.normalizeRequests(requests);
            // Gather paths that we should start watching
            const requestsToStartWatching = normalizedRequests.filter(request => {
                const watcher = this.watchers.get(request.path);
                if (!watcher) {
                    return true; // not yet watching that path
                }
                // Re-watch path if excludes/includes have changed or polling interval
                return !(0, glob_1.patternsEquals)(watcher.request.excludes, request.excludes) || !(0, glob_1.patternsEquals)(watcher.request.includes, request.includes) || watcher.request.pollingInterval !== request.pollingInterval;
            });
            // Gather paths that we should stop watching
            const pathsToStopWatching = Array.from(this.watchers.values()).filter(({ request }) => {
                return !normalizedRequests.find(normalizedRequest => {
                    return normalizedRequest.path === request.path &&
                        (0, glob_1.patternsEquals)(normalizedRequest.excludes, request.excludes) &&
                        (0, glob_1.patternsEquals)(normalizedRequest.includes, request.includes) &&
                        normalizedRequest.pollingInterval === request.pollingInterval;
                });
            }).map(({ request }) => request.path);
            // Logging
            if (requestsToStartWatching.length) {
                this.trace(`Request to start watching: ${requestsToStartWatching.map(request => `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : '<none>'}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : '<all>'})`).join(',')}`);
            }
            if (pathsToStopWatching.length) {
                this.trace(`Request to stop watching: ${pathsToStopWatching.join(',')}`);
            }
            // Stop watching as instructed
            for (const pathToStopWatching of pathsToStopWatching) {
                await this.stopWatching(pathToStopWatching);
            }
            // Start watching as instructed
            for (const request of requestsToStartWatching) {
                if (request.pollingInterval) {
                    this.startPolling(request, request.pollingInterval);
                }
                else {
                    this.startWatching(request);
                }
            }
        }
        startPolling(request, pollingInterval, restarts = 0) {
            const cts = new cancellation_1.CancellationTokenSource();
            const instance = new async_1.DeferredPromise();
            const snapshotFile = (0, extpath_1.randomPath)((0, os_1.tmpdir)(), 'vscode-watcher-snapshot');
            // Remember as watcher instance
            const watcher = {
                request,
                ready: instance.p,
                restarts,
                token: cts.token,
                worker: new async_1.RunOnceWorker(events => this.handleParcelEvents(events, watcher), ParcelWatcher.FILE_CHANGES_HANDLER_DELAY),
                stop: async () => {
                    cts.dispose(true);
                    watcher.worker.flush();
                    watcher.worker.dispose();
                    pollingWatcher.dispose();
                    (0, fs_1.unlinkSync)(snapshotFile);
                }
            };
            this.watchers.set(request.path, watcher);
            // Path checks for symbolic links / wrong casing
            const { realPath, realPathDiffers, realPathLength } = this.normalizePath(request);
            // Warm up include patterns for usage
            const includePatterns = request.includes ? (0, watcher_1.parseWatcherPatterns)(request.path, request.includes) : undefined;
            this.trace(`Started watching: '${realPath}' with polling interval '${pollingInterval}'`);
            let counter = 0;
            const pollingWatcher = new async_1.RunOnceScheduler(async () => {
                counter++;
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // We already ran before, check for events since
                if (counter > 1) {
                    const parcelEvents = await parcelWatcher.getEventsSince(realPath, snapshotFile, { ignore: request.excludes, backend: ParcelWatcher.PARCEL_WATCHER_BACKEND });
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    // Handle & emit events
                    this.onParcelEvents(parcelEvents, watcher, includePatterns, realPathDiffers, realPathLength);
                }
                // Store a snapshot of files to the snapshot file
                await parcelWatcher.writeSnapshot(realPath, snapshotFile, { ignore: request.excludes, backend: ParcelWatcher.PARCEL_WATCHER_BACKEND });
                // Signal we are ready now when the first snapshot was written
                if (counter === 1) {
                    instance.complete();
                }
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Schedule again at the next interval
                pollingWatcher.schedule();
            }, pollingInterval);
            pollingWatcher.schedule(0);
        }
        startWatching(request, restarts = 0) {
            const cts = new cancellation_1.CancellationTokenSource();
            const instance = new async_1.DeferredPromise();
            // Remember as watcher instance
            const watcher = {
                request,
                ready: instance.p,
                restarts,
                token: cts.token,
                worker: new async_1.RunOnceWorker(events => this.handleParcelEvents(events, watcher), ParcelWatcher.FILE_CHANGES_HANDLER_DELAY),
                stop: async () => {
                    cts.dispose(true);
                    watcher.worker.flush();
                    watcher.worker.dispose();
                    const watcherInstance = await instance.p;
                    await watcherInstance?.unsubscribe();
                }
            };
            this.watchers.set(request.path, watcher);
            // Path checks for symbolic links / wrong casing
            const { realPath, realPathDiffers, realPathLength } = this.normalizePath(request);
            // Warm up include patterns for usage
            const includePatterns = request.includes ? (0, watcher_1.parseWatcherPatterns)(request.path, request.includes) : undefined;
            parcelWatcher.subscribe(realPath, (error, parcelEvents) => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // In any case of an error, treat this like a unhandled exception
                // that might require the watcher to restart. We do not really know
                // the state of parcel at this point and as such will try to restart
                // up to our maximum of restarts.
                if (error) {
                    this.onUnexpectedError(error, watcher);
                }
                // Handle & emit events
                this.onParcelEvents(parcelEvents, watcher, includePatterns, realPathDiffers, realPathLength);
            }, {
                backend: ParcelWatcher.PARCEL_WATCHER_BACKEND,
                ignore: watcher.request.excludes
            }).then(parcelWatcher => {
                this.trace(`Started watching: '${realPath}' with backend '${ParcelWatcher.PARCEL_WATCHER_BACKEND}'`);
                instance.complete(parcelWatcher);
            }).catch(error => {
                this.onUnexpectedError(error, watcher);
                instance.complete(undefined);
            });
        }
        onParcelEvents(parcelEvents, watcher, includes, realPathDiffers, realPathLength) {
            if (parcelEvents.length === 0) {
                return;
            }
            // Normalize events: handle NFC normalization and symlinks
            // It is important to do this before checking for includes
            // to check on the original path.
            this.normalizeEvents(parcelEvents, watcher.request, realPathDiffers, realPathLength);
            // Check for includes
            const includedEvents = this.handleIncludes(parcelEvents, includes);
            // Add to event aggregator for later processing
            for (const includedEvent of includedEvents) {
                watcher.worker.work(includedEvent);
            }
        }
        handleIncludes(parcelEvents, includes) {
            const events = [];
            for (const { path, type: parcelEventType } of parcelEvents) {
                const type = ParcelWatcher.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE.get(parcelEventType);
                if (this.verboseLogging) {
                    this.trace(`${type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${path}`);
                }
                // Apply include filter if any
                if (includes && includes.length > 0 && !includes.some(include => include(path))) {
                    if (this.verboseLogging) {
                        this.trace(` >> ignored (not included) ${path}`);
                    }
                }
                else {
                    events.push({ type, path });
                }
            }
            return events;
        }
        handleParcelEvents(parcelEvents, watcher) {
            // Coalesce events: merge events of same kind
            const coalescedEvents = (0, watcher_1.coalesceEvents)(parcelEvents);
            // Filter events: check for specific events we want to exclude
            const { events: filteredEvents, rootDeleted } = this.filterEvents(coalescedEvents, watcher);
            // Broadcast to clients
            this.emitEvents(filteredEvents);
            // Handle root path deletes
            if (rootDeleted) {
                this.onWatchedPathDeleted(watcher);
            }
        }
        emitEvents(events) {
            if (events.length === 0) {
                return;
            }
            // Logging
            if (this.verboseLogging) {
                for (const event of events) {
                    this.trace(` >> normalized ${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.path}`);
                }
            }
            // Broadcast to clients via throttler
            const worked = this.throttledFileChangesEmitter.work(events);
            // Logging
            if (!worked) {
                this.warn(`started ignoring events due to too many file change events at once (incoming: ${events.length}, most recent change: ${events[0].path}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
            }
            else {
                if (this.throttledFileChangesEmitter.pending > 0) {
                    this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${events[0].path}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                }
            }
        }
        normalizePath(request) {
            let realPath = request.path;
            let realPathDiffers = false;
            let realPathLength = request.path.length;
            try {
                // First check for symbolic link
                realPath = (0, extpath_2.realpathSync)(request.path);
                // Second check for casing difference
                // Note: this will be a no-op on Linux platforms
                if (request.path === realPath) {
                    realPath = (0, extpath_2.realcaseSync)(request.path) ?? request.path;
                }
                // Correct watch path as needed
                if (request.path !== realPath) {
                    realPathLength = realPath.length;
                    realPathDiffers = true;
                    this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
                }
            }
            catch (error) {
                // ignore
            }
            return { realPath, realPathDiffers, realPathLength };
        }
        normalizeEvents(events, request, realPathDiffers, realPathLength) {
            for (const event of events) {
                // Mac uses NFD unicode form on disk, but we want NFC
                if (platform_1.isMacintosh) {
                    event.path = (0, normalization_1.normalizeNFC)(event.path);
                }
                // Workaround for https://github.com/parcel-bundler/watcher/issues/68
                // where watching root drive letter adds extra backslashes.
                if (platform_1.isWindows) {
                    if (request.path.length <= 3) { // for ex. c:, C:\
                        event.path = (0, path_1.normalize)(event.path);
                    }
                }
                // Convert paths back to original form in case it differs
                if (realPathDiffers) {
                    event.path = request.path + event.path.substr(realPathLength);
                }
            }
        }
        filterEvents(events, watcher) {
            const filteredEvents = [];
            let rootDeleted = false;
            for (const event of events) {
                if (event.type === 2 /* FileChangeType.DELETED */ && event.path === watcher.request.path) {
                    // Explicitly exclude changes to root if we have any
                    // to avoid VS Code closing all opened editors which
                    // can happen e.g. in case of network connectivity
                    // issues
                    // (https://github.com/microsoft/vscode/issues/136673)
                    rootDeleted = true;
                }
                else {
                    filteredEvents.push(event);
                }
            }
            return { events: filteredEvents, rootDeleted };
        }
        onWatchedPathDeleted(watcher) {
            this.warn('Watcher shutdown because watched path got deleted', watcher);
            const parentPath = (0, path_1.dirname)(watcher.request.path);
            if ((0, fs_1.existsSync)(parentPath)) {
                const nodeWatcher = new nodejsWatcherLib_1.NodeJSFileWatcherLibrary({ path: parentPath, excludes: [], recursive: false }, changes => {
                    if (watcher.token.isCancellationRequested) {
                        return; // return early when disposed
                    }
                    // Watcher path came back! Restart watching...
                    for (const { path, type } of changes) {
                        if (path === watcher.request.path && (type === 1 /* FileChangeType.ADDED */ || type === 0 /* FileChangeType.UPDATED */)) {
                            this.warn('Watcher restarts because watched path got created again', watcher);
                            // Stop watching that parent folder
                            nodeWatcher.dispose();
                            // Restart the file watching
                            this.restartWatching(watcher);
                            break;
                        }
                    }
                }, msg => this._onDidLogMessage.fire(msg), this.verboseLogging);
                // Make sure to stop watching when the watcher is disposed
                watcher.token.onCancellationRequested(() => nodeWatcher.dispose());
            }
        }
        onUnexpectedError(error, watcher) {
            const msg = (0, errorMessage_1.toErrorMessage)(error);
            // Specially handle ENOSPC errors that can happen when
            // the watcher consumes so many file descriptors that
            // we are running into a limit. We only want to warn
            // once in this case to avoid log spam.
            // See https://github.com/microsoft/vscode/issues/7950
            if (msg.indexOf('No space left on device') !== -1) {
                if (!this.enospcErrorLogged) {
                    this.error('Inotify limit reached (ENOSPC)', watcher);
                    this.enospcErrorLogged = true;
                }
            }
            // Any other error is unexpected and we should try to
            // restart the watcher as a result to get into healthy
            // state again if possible and if not attempted too much
            else {
                this.error(`Unexpected error: ${msg} (EUNKNOWN)`, watcher);
                this._onDidError.fire(msg);
            }
        }
        async stop() {
            for (const [path] of this.watchers) {
                await this.stopWatching(path);
            }
            this.watchers.clear();
        }
        restartWatching(watcher, delay = 800) {
            // Restart watcher delayed to accomodate for
            // changes on disk that have triggered the
            // need for a restart in the first place.
            const scheduler = new async_1.RunOnceScheduler(async () => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // Await the watcher having stopped, as this is
                // needed to properly re-watch the same path
                await this.stopWatching(watcher.request.path);
                // Start watcher again counting the restarts
                if (watcher.request.pollingInterval) {
                    this.startPolling(watcher.request, watcher.request.pollingInterval, watcher.restarts + 1);
                }
                else {
                    this.startWatching(watcher.request, watcher.restarts + 1);
                }
            }, delay);
            scheduler.schedule();
            watcher.token.onCancellationRequested(() => scheduler.dispose());
        }
        async stopWatching(path) {
            const watcher = this.watchers.get(path);
            if (watcher) {
                this.trace(`stopping file watcher on ${watcher.request.path}`);
                this.watchers.delete(path);
                try {
                    await watcher.stop();
                }
                catch (error) {
                    this.error(`Unexpected error stopping watcher: ${(0, errorMessage_1.toErrorMessage)(error)}`, watcher);
                }
            }
        }
        normalizeRequests(requests, validatePaths = true) {
            const requestTrie = ternarySearchTree_1.TernarySearchTree.forPaths(!platform_1.isLinux);
            // Sort requests by path length to have shortest first
            // to have a way to prevent children to be watched if
            // parents exist.
            requests.sort((requestA, requestB) => requestA.path.length - requestB.path.length);
            // Only consider requests for watching that are not
            // a child of an existing request path to prevent
            // duplication. In addition, drop any request where
            // everything is excluded (via `**` glob).
            //
            // However, allow explicit requests to watch folders
            // that are symbolic links because the Parcel watcher
            // does not allow to recursively watch symbolic links.
            for (const request of requests) {
                if (request.excludes.includes(glob_1.GLOBSTAR)) {
                    continue; // path is ignored entirely (via `**` glob exclude)
                }
                // Check for overlapping requests
                if (requestTrie.findSubstr(request.path)) {
                    try {
                        const realpath = (0, extpath_2.realpathSync)(request.path);
                        if (realpath === request.path) {
                            this.trace(`ignoring a path for watching who's parent is already watched: ${request.path}`);
                            continue;
                        }
                    }
                    catch (error) {
                        this.trace(`ignoring a path for watching who's realpath failed to resolve: ${request.path} (error: ${error})`);
                        continue;
                    }
                }
                // Check for invalid paths
                if (validatePaths) {
                    try {
                        const stat = (0, fs_1.statSync)(request.path);
                        if (!stat.isDirectory()) {
                            this.trace(`ignoring a path for watching that is a file and not a folder: ${request.path}`);
                            continue;
                        }
                    }
                    catch (error) {
                        this.trace(`ignoring a path for watching who's stat info failed to resolve: ${request.path} (error: ${error})`);
                        continue;
                    }
                }
                requestTrie.set(request.path, request);
            }
            return Array.from(requestTrie).map(([, request]) => request);
        }
        async setVerboseLogging(enabled) {
            this.verboseLogging = enabled;
        }
        trace(message) {
            if (this.verboseLogging) {
                this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message) });
            }
        }
        warn(message, watcher) {
            this._onDidLogMessage.fire({ type: 'warn', message: this.toMessage(message, watcher) });
        }
        error(message, watcher) {
            this._onDidLogMessage.fire({ type: 'error', message: this.toMessage(message, watcher) });
        }
        toMessage(message, watcher) {
            return watcher ? `[File Watcher (parcel)] ${message} (path: ${watcher.request.path})` : `[File Watcher (parcel)] ${message}`;
        }
    }
    exports.ParcelWatcher = ParcelWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyY2VsV2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvd2F0Y2hlci9wYXJjZWwvcGFyY2VsV2F0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3RGhHLE1BQWEsYUFBYyxTQUFRLHNCQUFVO2lCQUVwQiw2Q0FBd0MsR0FBRyxJQUFJLEdBQUcsQ0FDekU7WUFDQyxDQUFDLFFBQVEsK0JBQXVCO1lBQ2hDLENBQUMsUUFBUSxpQ0FBeUI7WUFDbEMsQ0FBQyxRQUFRLGlDQUF5QjtTQUNsQyxDQUNELEFBTitELENBTTlEO2lCQUVzQiwyQkFBc0IsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxBQUE1RCxDQUE2RDtRQWEzRyxrREFBa0Q7UUFDbEQsc0RBQXNEO1FBQ3RELHdEQUF3RDtRQUN4RCx5Q0FBeUM7UUFDekMsRUFBRTtRQUNGLG9EQUFvRDtRQUNwRCxvREFBb0Q7UUFDcEQscURBQXFEO1FBQ3JELHVDQUF1QztRQUN2QyxFQUFFO2lCQUNzQiwrQkFBMEIsR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQWdCeEQ7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQXRDUSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDNUUsb0JBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBRXRDLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWUsQ0FBQyxDQUFDO1lBQ3RFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUV0QyxnQkFBVyxHQUFHLElBQUks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