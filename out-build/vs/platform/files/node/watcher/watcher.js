/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/files/node/watcher/parcel/parcelWatcher", "vs/platform/files/node/watcher/nodejs/nodejsWatcher", "vs/base/common/async"], function (require, exports, lifecycle_1, event_1, parcelWatcher_1, nodejsWatcher_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x$b = void 0;
    class $x$b extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new parcelWatcher_1.$w$b());
            this.b = this.B(new nodejsWatcher_1.$1p());
            this.onDidChangeFile = event_1.Event.any(this.a.onDidChangeFile, this.b.onDidChangeFile);
            this.onDidLogMessage = event_1.Event.any(this.a.onDidLogMessage, this.b.onDidLogMessage);
            this.onDidError = event_1.Event.any(this.a.onDidError, this.b.onDidError);
        }
        async watch(requests) {
            const recursiveWatchRequests = [];
            const nonRecursiveWatchRequests = [];
            for (const request of requests) {
                if (request.recursive) {
                    recursiveWatchRequests.push(request);
                }
                else {
                    nonRecursiveWatchRequests.push(request);
                }
            }
            await async_1.Promises.settled([
                this.a.watch(recursiveWatchRequests),
                this.b.watch(nonRecursiveWatchRequests)
            ]);
        }
        async setVerboseLogging(enabled) {
            await async_1.Promises.settled([
                this.a.setVerboseLogging(enabled),
                this.b.setVerboseLogging(enabled)
            ]);
        }
        async stop() {
            await async_1.Promises.settled([
                this.a.stop(),
                this.b.stop()
            ]);
        }
    }
    exports.$x$b = $x$b;
});
//# sourceMappingURL=watcher.js.map