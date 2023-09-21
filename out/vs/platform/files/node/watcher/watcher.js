/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/files/node/watcher/parcel/parcelWatcher", "vs/platform/files/node/watcher/nodejs/nodejsWatcher", "vs/base/common/async"], function (require, exports, lifecycle_1, event_1, parcelWatcher_1, nodejsWatcher_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniversalWatcher = void 0;
    class UniversalWatcher extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.recursiveWatcher = this._register(new parcelWatcher_1.ParcelWatcher());
            this.nonRecursiveWatcher = this._register(new nodejsWatcher_1.NodeJSWatcher());
            this.onDidChangeFile = event_1.Event.any(this.recursiveWatcher.onDidChangeFile, this.nonRecursiveWatcher.onDidChangeFile);
            this.onDidLogMessage = event_1.Event.any(this.recursiveWatcher.onDidLogMessage, this.nonRecursiveWatcher.onDidLogMessage);
            this.onDidError = event_1.Event.any(this.recursiveWatcher.onDidError, this.nonRecursiveWatcher.onDidError);
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
                this.recursiveWatcher.watch(recursiveWatchRequests),
                this.nonRecursiveWatcher.watch(nonRecursiveWatchRequests)
            ]);
        }
        async setVerboseLogging(enabled) {
            await async_1.Promises.settled([
                this.recursiveWatcher.setVerboseLogging(enabled),
                this.nonRecursiveWatcher.setVerboseLogging(enabled)
            ]);
        }
        async stop() {
            await async_1.Promises.settled([
                this.recursiveWatcher.stop(),
                this.nonRecursiveWatcher.stop()
            ]);
        }
    }
    exports.UniversalWatcher = UniversalWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvd2F0Y2hlci93YXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO1FBQWhEOztZQUVrQixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWEsRUFBRSxDQUFDLENBQUM7WUFDdkQsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFhLEVBQUUsQ0FBQyxDQUFDO1lBRWxFLG9CQUFlLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3RyxvQkFBZSxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0csZUFBVSxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFpQ3hHLENBQUM7UUEvQkEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFrQztZQUM3QyxNQUFNLHNCQUFzQixHQUE2QixFQUFFLENBQUM7WUFDNUQsTUFBTSx5QkFBeUIsR0FBZ0MsRUFBRSxDQUFDO1lBRWxFLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO2dCQUMvQixJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7b0JBQ3RCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDckM7cUJBQU07b0JBQ04seUJBQXlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN4QzthQUNEO1lBRUQsTUFBTSxnQkFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQzthQUN6RCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE9BQWdCO1lBQ3ZDLE1BQU0sZ0JBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7YUFDbkQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJO1lBQ1QsTUFBTSxnQkFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRTtnQkFDNUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRTthQUMvQixDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUF4Q0QsNENBd0NDIn0=