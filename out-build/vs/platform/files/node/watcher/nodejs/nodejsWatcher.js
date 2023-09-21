/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib"], function (require, exports, event_1, glob_1, lifecycle_1, platform_1, nodejsWatcherLib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1p = void 0;
    class $1p extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeFile = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidLogMessage = this.b.event;
            this.onDidError = event_1.Event.None;
            this.c = new Map();
            this.f = false;
        }
        async watch(requests) {
            // Figure out duplicates to remove from the requests
            const normalizedRequests = this.j(requests);
            // Gather paths that we should start watching
            const requestsToStartWatching = normalizedRequests.filter(request => {
                const watcher = this.c.get(request.path);
                if (!watcher) {
                    return true; // not yet watching that path
                }
                // Re-watch path if excludes or includes have changed
                return !(0, glob_1.$vj)(watcher.request.excludes, request.excludes) || !(0, glob_1.$vj)(watcher.request.includes, request.includes);
            });
            // Gather paths that we should stop watching
            const pathsToStopWatching = Array.from(this.c.values()).filter(({ request }) => {
                return !normalizedRequests.find(normalizedRequest => normalizedRequest.path === request.path && (0, glob_1.$vj)(normalizedRequest.excludes, request.excludes) && (0, glob_1.$vj)(normalizedRequest.includes, request.includes));
            }).map(({ request }) => request.path);
            // Logging
            if (requestsToStartWatching.length) {
                this.m(`Request to start watching: ${requestsToStartWatching.map(request => `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : '<none>'}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : '<all>'})`).join(',')}`);
            }
            if (pathsToStopWatching.length) {
                this.m(`Request to stop watching: ${pathsToStopWatching.join(',')}`);
            }
            // Stop watching as instructed
            for (const pathToStopWatching of pathsToStopWatching) {
                this.h(pathToStopWatching);
            }
            // Start watching as instructed
            for (const request of requestsToStartWatching) {
                this.g(request);
            }
        }
        g(request) {
            // Start via node.js lib
            const instance = new nodejsWatcherLib_1.$Yp(request, changes => this.a.fire(changes), msg => this.b.fire(msg), this.f);
            // Remember as watcher instance
            const watcher = { request, instance };
            this.c.set(request.path, watcher);
        }
        async stop() {
            for (const [path] of this.c) {
                this.h(path);
            }
            this.c.clear();
        }
        h(path) {
            const watcher = this.c.get(path);
            if (watcher) {
                this.c.delete(path);
                watcher.instance.dispose();
            }
        }
        j(requests) {
            const requestsMap = new Map();
            // Ignore requests for the same paths
            for (const request of requests) {
                const path = platform_1.$k ? request.path : request.path.toLowerCase(); // adjust for case sensitivity
                requestsMap.set(path, request);
            }
            return Array.from(requestsMap.values());
        }
        async setVerboseLogging(enabled) {
            this.f = enabled;
            for (const [, watcher] of this.c) {
                watcher.instance.setVerboseLogging(enabled);
            }
        }
        m(message) {
            if (this.f) {
                this.b.fire({ type: 'trace', message: this.n(message) });
            }
        }
        n(message, watcher) {
            return watcher ? `[File Watcher (node.js)] ${message} (path: ${watcher.request.path})` : `[File Watcher (node.js)] ${message}`;
        }
    }
    exports.$1p = $1p;
});
//# sourceMappingURL=nodejsWatcher.js.map