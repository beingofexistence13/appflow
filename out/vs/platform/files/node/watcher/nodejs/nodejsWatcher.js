/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib"], function (require, exports, event_1, glob_1, lifecycle_1, platform_1, nodejsWatcherLib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeJSWatcher = void 0;
    class NodeJSWatcher extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidLogMessage = this._register(new event_1.Emitter());
            this.onDidLogMessage = this._onDidLogMessage.event;
            this.onDidError = event_1.Event.None;
            this.watchers = new Map();
            this.verboseLogging = false;
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
                // Re-watch path if excludes or includes have changed
                return !(0, glob_1.patternsEquals)(watcher.request.excludes, request.excludes) || !(0, glob_1.patternsEquals)(watcher.request.includes, request.includes);
            });
            // Gather paths that we should stop watching
            const pathsToStopWatching = Array.from(this.watchers.values()).filter(({ request }) => {
                return !normalizedRequests.find(normalizedRequest => normalizedRequest.path === request.path && (0, glob_1.patternsEquals)(normalizedRequest.excludes, request.excludes) && (0, glob_1.patternsEquals)(normalizedRequest.includes, request.includes));
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
                this.stopWatching(pathToStopWatching);
            }
            // Start watching as instructed
            for (const request of requestsToStartWatching) {
                this.startWatching(request);
            }
        }
        startWatching(request) {
            // Start via node.js lib
            const instance = new nodejsWatcherLib_1.NodeJSFileWatcherLibrary(request, changes => this._onDidChangeFile.fire(changes), msg => this._onDidLogMessage.fire(msg), this.verboseLogging);
            // Remember as watcher instance
            const watcher = { request, instance };
            this.watchers.set(request.path, watcher);
        }
        async stop() {
            for (const [path] of this.watchers) {
                this.stopWatching(path);
            }
            this.watchers.clear();
        }
        stopWatching(path) {
            const watcher = this.watchers.get(path);
            if (watcher) {
                this.watchers.delete(path);
                watcher.instance.dispose();
            }
        }
        normalizeRequests(requests) {
            const requestsMap = new Map();
            // Ignore requests for the same paths
            for (const request of requests) {
                const path = platform_1.isLinux ? request.path : request.path.toLowerCase(); // adjust for case sensitivity
                requestsMap.set(path, request);
            }
            return Array.from(requestsMap.values());
        }
        async setVerboseLogging(enabled) {
            this.verboseLogging = enabled;
            for (const [, watcher] of this.watchers) {
                watcher.instance.setVerboseLogging(enabled);
            }
        }
        trace(message) {
            if (this.verboseLogging) {
                this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message) });
            }
        }
        toMessage(message, watcher) {
            return watcher ? `[File Watcher (node.js)] ${message} (path: ${watcher.request.path})` : `[File Watcher (node.js)] ${message}`;
        }
    }
    exports.NodeJSWatcher = NodeJSWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZWpzV2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvd2F0Y2hlci9ub2RlanMvbm9kZWpzV2F0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLE1BQWEsYUFBYyxTQUFRLHNCQUFVO1FBQTdDOztZQUVrQixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDNUUsb0JBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBRXRDLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWUsQ0FBQyxDQUFDO1lBQ3RFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUU5QyxlQUFVLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUVkLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztZQUVoRSxtQkFBYyxHQUFHLEtBQUssQ0FBQztRQW9HaEMsQ0FBQztRQWxHQSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQXFDO1lBRWhELG9EQUFvRDtZQUNwRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1RCw2Q0FBNkM7WUFDN0MsTUFBTSx1QkFBdUIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixPQUFPLElBQUksQ0FBQyxDQUFDLDZCQUE2QjtpQkFDMUM7Z0JBRUQscURBQXFE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