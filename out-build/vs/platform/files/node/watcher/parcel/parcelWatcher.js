/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "@parcel/watcher", "fs", "os", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/node/extpath", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib", "vs/platform/files/common/watcher"], function (require, exports, parcelWatcher, fs_1, os_1, async_1, cancellation_1, errorMessage_1, event_1, extpath_1, glob_1, lifecycle_1, ternarySearchTree_1, normalization_1, path_1, platform_1, extpath_2, nodejsWatcherLib_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w$b = void 0;
    class $w$b extends lifecycle_1.$kc {
        static { this.a = new Map([
            ['create', 1 /* FileChangeType.ADDED */],
            ['update', 0 /* FileChangeType.UPDATED */],
            ['delete', 2 /* FileChangeType.DELETED */]
        ]); }
        static { this.b = platform_1.$i ? 'windows' : platform_1.$k ? 'inotify' : 'fs-events'; }
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
        static { this.j = 75; }
        constructor() {
            super();
            this.c = this.B(new event_1.$fd());
            this.onDidChangeFile = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidLogMessage = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidError = this.g.event;
            this.h = new Map();
            // Reduce likelyhood of spam from file events via throttling.
            // (https://github.com/microsoft/vscode/issues/124723)
            this.m = this.B(new async_1.$Vg({
                maxWorkChunkSize: 500,
                throttleDelay: 200,
                maxBufferedWork: 30000 // ...but never buffering more than 30000 events in memory
            }, events => this.c.fire(events)));
            this.n = false;
            this.r = false;
            this.s();
        }
        s() {
            // Error handling on process
            process.on('uncaughtException', error => this.I(error));
            process.on('unhandledRejection', error => this.I(error));
        }
        async watch(requests) {
            // Figure out duplicates to remove from the requests
            const normalizedRequests = this.M(requests);
            // Gather paths that we should start watching
            const requestsToStartWatching = normalizedRequests.filter(request => {
                const watcher = this.h.get(request.path);
                if (!watcher) {
                    return true; // not yet watching that path
                }
                // Re-watch path if excludes/includes have changed or polling interval
                return !(0, glob_1.$vj)(watcher.request.excludes, request.excludes) || !(0, glob_1.$vj)(watcher.request.includes, request.includes) || watcher.request.pollingInterval !== request.pollingInterval;
            });
            // Gather paths that we should stop watching
            const pathsToStopWatching = Array.from(this.h.values()).filter(({ request }) => {
                return !normalizedRequests.find(normalizedRequest => {
                    return normalizedRequest.path === request.path &&
                        (0, glob_1.$vj)(normalizedRequest.excludes, request.excludes) &&
                        (0, glob_1.$vj)(normalizedRequest.includes, request.includes) &&
                        normalizedRequest.pollingInterval === request.pollingInterval;
                });
            }).map(({ request }) => request.path);
            // Logging
            if (requestsToStartWatching.length) {
                this.N(`Request to start watching: ${requestsToStartWatching.map(request => `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : '<none>'}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : '<all>'})`).join(',')}`);
            }
            if (pathsToStopWatching.length) {
                this.N(`Request to stop watching: ${pathsToStopWatching.join(',')}`);
            }
            // Stop watching as instructed
            for (const pathToStopWatching of pathsToStopWatching) {
                await this.L(pathToStopWatching);
            }
            // Start watching as instructed
            for (const request of requestsToStartWatching) {
                if (request.pollingInterval) {
                    this.t(request, request.pollingInterval);
                }
                else {
                    this.u(request);
                }
            }
        }
        t(request, pollingInterval, restarts = 0) {
            const cts = new cancellation_1.$pd();
            const instance = new async_1.$2g();
            const snapshotFile = (0, extpath_1.$Qf)((0, os_1.tmpdir)(), 'vscode-watcher-snapshot');
            // Remember as watcher instance
            const watcher = {
                request,
                ready: instance.p,
                restarts,
                token: cts.token,
                worker: new async_1.$Ug(events => this.z(events, watcher), $w$b.j),
                stop: async () => {
                    cts.dispose(true);
                    watcher.worker.flush();
                    watcher.worker.dispose();
                    pollingWatcher.dispose();
                    (0, fs_1.unlinkSync)(snapshotFile);
                }
            };
            this.h.set(request.path, watcher);
            // Path checks for symbolic links / wrong casing
            const { realPath, realPathDiffers, realPathLength } = this.D(request);
            // Warm up include patterns for usage
            const includePatterns = request.includes ? (0, watcher_1.$Lp)(request.path, request.includes) : undefined;
            this.N(`Started watching: '${realPath}' with polling interval '${pollingInterval}'`);
            let counter = 0;
            const pollingWatcher = new async_1.$Sg(async () => {
                counter++;
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // We already ran before, check for events since
                if (counter > 1) {
                    const parcelEvents = await parcelWatcher.getEventsSince(realPath, snapshotFile, { ignore: request.excludes, backend: $w$b.b });
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    // Handle & emit events
                    this.w(parcelEvents, watcher, includePatterns, realPathDiffers, realPathLength);
                }
                // Store a snapshot of files to the snapshot file
                await parcelWatcher.writeSnapshot(realPath, snapshotFile, { ignore: request.excludes, backend: $w$b.b });
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
        u(request, restarts = 0) {
            const cts = new cancellation_1.$pd();
            const instance = new async_1.$2g();
            // Remember as watcher instance
            const watcher = {
                request,
                ready: instance.p,
                restarts,
                token: cts.token,
                worker: new async_1.$Ug(events => this.z(events, watcher), $w$b.j),
                stop: async () => {
                    cts.dispose(true);
                    watcher.worker.flush();
                    watcher.worker.dispose();
                    const watcherInstance = await instance.p;
                    await watcherInstance?.unsubscribe();
                }
            };
            this.h.set(request.path, watcher);
            // Path checks for symbolic links / wrong casing
            const { realPath, realPathDiffers, realPathLength } = this.D(request);
            // Warm up include patterns for usage
            const includePatterns = request.includes ? (0, watcher_1.$Lp)(request.path, request.includes) : undefined;
            parcelWatcher.subscribe(realPath, (error, parcelEvents) => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // In any case of an error, treat this like a unhandled exception
                // that might require the watcher to restart. We do not really know
                // the state of parcel at this point and as such will try to restart
                // up to our maximum of restarts.
                if (error) {
                    this.I(error, watcher);
                }
                // Handle & emit events
                this.w(parcelEvents, watcher, includePatterns, realPathDiffers, realPathLength);
            }, {
                backend: $w$b.b,
                ignore: watcher.request.excludes
            }).then(parcelWatcher => {
                this.N(`Started watching: '${realPath}' with backend '${$w$b.b}'`);
                instance.complete(parcelWatcher);
            }).catch(error => {
                this.I(error, watcher);
                instance.complete(undefined);
            });
        }
        w(parcelEvents, watcher, includes, realPathDiffers, realPathLength) {
            if (parcelEvents.length === 0) {
                return;
            }
            // Normalize events: handle NFC normalization and symlinks
            // It is important to do this before checking for includes
            // to check on the original path.
            this.F(parcelEvents, watcher.request, realPathDiffers, realPathLength);
            // Check for includes
            const includedEvents = this.y(parcelEvents, includes);
            // Add to event aggregator for later processing
            for (const includedEvent of includedEvents) {
                watcher.worker.work(includedEvent);
            }
        }
        y(parcelEvents, includes) {
            const events = [];
            for (const { path, type: parcelEventType } of parcelEvents) {
                const type = $w$b.a.get(parcelEventType);
                if (this.n) {
                    this.N(`${type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${path}`);
                }
                // Apply include filter if any
                if (includes && includes.length > 0 && !includes.some(include => include(path))) {
                    if (this.n) {
                        this.N(` >> ignored (not included) ${path}`);
                    }
                }
                else {
                    events.push({ type, path });
                }
            }
            return events;
        }
        z(parcelEvents, watcher) {
            // Coalesce events: merge events of same kind
            const coalescedEvents = (0, watcher_1.$Jp)(parcelEvents);
            // Filter events: check for specific events we want to exclude
            const { events: filteredEvents, rootDeleted } = this.G(coalescedEvents, watcher);
            // Broadcast to clients
            this.C(filteredEvents);
            // Handle root path deletes
            if (rootDeleted) {
                this.H(watcher);
            }
        }
        C(events) {
            if (events.length === 0) {
                return;
            }
            // Logging
            if (this.n) {
                for (const event of events) {
                    this.N(` >> normalized ${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.path}`);
                }
            }
            // Broadcast to clients via throttler
            const worked = this.m.work(events);
            // Logging
            if (!worked) {
                this.O(`started ignoring events due to too many file change events at once (incoming: ${events.length}, most recent change: ${events[0].path}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
            }
            else {
                if (this.m.pending > 0) {
                    this.N(`started throttling events due to large amount of file change events at once (pending: ${this.m.pending}, most recent change: ${events[0].path}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                }
            }
        }
        D(request) {
            let realPath = request.path;
            let realPathDiffers = false;
            let realPathLength = request.path.length;
            try {
                // First check for symbolic link
                realPath = (0, extpath_2.$Xp)(request.path);
                // Second check for casing difference
                // Note: this will be a no-op on Linux platforms
                if (request.path === realPath) {
                    realPath = (0, extpath_2.$Up)(request.path) ?? request.path;
                }
                // Correct watch path as needed
                if (request.path !== realPath) {
                    realPathLength = realPath.length;
                    realPathDiffers = true;
                    this.N(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
                }
            }
            catch (error) {
                // ignore
            }
            return { realPath, realPathDiffers, realPathLength };
        }
        F(events, request, realPathDiffers, realPathLength) {
            for (const event of events) {
                // Mac uses NFD unicode form on disk, but we want NFC
                if (platform_1.$j) {
                    event.path = (0, normalization_1.$hl)(event.path);
                }
                // Workaround for https://github.com/parcel-bundler/watcher/issues/68
                // where watching root drive letter adds extra backslashes.
                if (platform_1.$i) {
                    if (request.path.length <= 3) { // for ex. c:, C:\
                        event.path = (0, path_1.$7d)(event.path);
                    }
                }
                // Convert paths back to original form in case it differs
                if (realPathDiffers) {
                    event.path = request.path + event.path.substr(realPathLength);
                }
            }
        }
        G(events, watcher) {
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
        H(watcher) {
            this.O('Watcher shutdown because watched path got deleted', watcher);
            const parentPath = (0, path_1.$_d)(watcher.request.path);
            if ((0, fs_1.existsSync)(parentPath)) {
                const nodeWatcher = new nodejsWatcherLib_1.$Yp({ path: parentPath, excludes: [], recursive: false }, changes => {
                    if (watcher.token.isCancellationRequested) {
                        return; // return early when disposed
                    }
                    // Watcher path came back! Restart watching...
                    for (const { path, type } of changes) {
                        if (path === watcher.request.path && (type === 1 /* FileChangeType.ADDED */ || type === 0 /* FileChangeType.UPDATED */)) {
                            this.O('Watcher restarts because watched path got created again', watcher);
                            // Stop watching that parent folder
                            nodeWatcher.dispose();
                            // Restart the file watching
                            this.J(watcher);
                            break;
                        }
                    }
                }, msg => this.f.fire(msg), this.n);
                // Make sure to stop watching when the watcher is disposed
                watcher.token.onCancellationRequested(() => nodeWatcher.dispose());
            }
        }
        I(error, watcher) {
            const msg = (0, errorMessage_1.$mi)(error);
            // Specially handle ENOSPC errors that can happen when
            // the watcher consumes so many file descriptors that
            // we are running into a limit. We only want to warn
            // once in this case to avoid log spam.
            // See https://github.com/microsoft/vscode/issues/7950
            if (msg.indexOf('No space left on device') !== -1) {
                if (!this.r) {
                    this.P('Inotify limit reached (ENOSPC)', watcher);
                    this.r = true;
                }
            }
            // Any other error is unexpected and we should try to
            // restart the watcher as a result to get into healthy
            // state again if possible and if not attempted too much
            else {
                this.P(`Unexpected error: ${msg} (EUNKNOWN)`, watcher);
                this.g.fire(msg);
            }
        }
        async stop() {
            for (const [path] of this.h) {
                await this.L(path);
            }
            this.h.clear();
        }
        J(watcher, delay = 800) {
            // Restart watcher delayed to accomodate for
            // changes on disk that have triggered the
            // need for a restart in the first place.
            const scheduler = new async_1.$Sg(async () => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // Await the watcher having stopped, as this is
                // needed to properly re-watch the same path
                await this.L(watcher.request.path);
                // Start watcher again counting the restarts
                if (watcher.request.pollingInterval) {
                    this.t(watcher.request, watcher.request.pollingInterval, watcher.restarts + 1);
                }
                else {
                    this.u(watcher.request, watcher.restarts + 1);
                }
            }, delay);
            scheduler.schedule();
            watcher.token.onCancellationRequested(() => scheduler.dispose());
        }
        async L(path) {
            const watcher = this.h.get(path);
            if (watcher) {
                this.N(`stopping file watcher on ${watcher.request.path}`);
                this.h.delete(path);
                try {
                    await watcher.stop();
                }
                catch (error) {
                    this.P(`Unexpected error stopping watcher: ${(0, errorMessage_1.$mi)(error)}`, watcher);
                }
            }
        }
        M(requests, validatePaths = true) {
            const requestTrie = ternarySearchTree_1.$Hh.forPaths(!platform_1.$k);
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
                if (request.excludes.includes(glob_1.$nj)) {
                    continue; // path is ignored entirely (via `**` glob exclude)
                }
                // Check for overlapping requests
                if (requestTrie.findSubstr(request.path)) {
                    try {
                        const realpath = (0, extpath_2.$Xp)(request.path);
                        if (realpath === request.path) {
                            this.N(`ignoring a path for watching who's parent is already watched: ${request.path}`);
                            continue;
                        }
                    }
                    catch (error) {
                        this.N(`ignoring a path for watching who's realpath failed to resolve: ${request.path} (error: ${error})`);
                        continue;
                    }
                }
                // Check for invalid paths
                if (validatePaths) {
                    try {
                        const stat = (0, fs_1.statSync)(request.path);
                        if (!stat.isDirectory()) {
                            this.N(`ignoring a path for watching that is a file and not a folder: ${request.path}`);
                            continue;
                        }
                    }
                    catch (error) {
                        this.N(`ignoring a path for watching who's stat info failed to resolve: ${request.path} (error: ${error})`);
                        continue;
                    }
                }
                requestTrie.set(request.path, request);
            }
            return Array.from(requestTrie).map(([, request]) => request);
        }
        async setVerboseLogging(enabled) {
            this.n = enabled;
        }
        N(message) {
            if (this.n) {
                this.f.fire({ type: 'trace', message: this.Q(message) });
            }
        }
        O(message, watcher) {
            this.f.fire({ type: 'warn', message: this.Q(message, watcher) });
        }
        P(message, watcher) {
            this.f.fire({ type: 'error', message: this.Q(message, watcher) });
        }
        Q(message, watcher) {
            return watcher ? `[File Watcher (parcel)] ${message} (path: ${watcher.request.path})` : `[File Watcher (parcel)] ${message}`;
        }
    }
    exports.$w$b = $w$b;
});
//# sourceMappingURL=parcelWatcher.js.map