/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event"], function (require, exports, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InMemoryTestStateMainService = exports.TestLifecycleMainService = void 0;
    class TestLifecycleMainService {
        constructor() {
            this.onBeforeShutdown = event_1.Event.None;
            this._onWillShutdown = new event_1.Emitter();
            this.onWillShutdown = this._onWillShutdown.event;
            this.onWillLoadWindow = event_1.Event.None;
            this.onBeforeCloseWindow = event_1.Event.None;
            this.wasRestarted = false;
            this.quitRequested = false;
            this.phase = 2 /* LifecycleMainPhase.Ready */;
        }
        async fireOnWillShutdown() {
            const joiners = [];
            this._onWillShutdown.fire({
                reason: 1 /* ShutdownReason.QUIT */,
                join(id, promise) {
                    joiners.push(promise);
                }
            });
            await async_1.Promises.settled(joiners);
        }
        registerWindow(window) { }
        async reload(window, cli) { }
        async unload(window, reason) { return true; }
        setRelaunchHandler(handler) { }
        async relaunch(options) { }
        async quit(willRestart) { return true; }
        async kill(code) { }
        async when(phase) { }
    }
    exports.TestLifecycleMainService = TestLifecycleMainService;
    class InMemoryTestStateMainService {
        constructor() {
            this.data = new Map();
        }
        setItem(key, data) {
            this.data.set(key, data);
        }
        setItems(items) {
            for (const { key, data } of items) {
                this.data.set(key, data);
            }
        }
        getItem(key) {
            return this.data.get(key);
        }
        removeItem(key) {
            this.data.delete(key);
        }
        async close() { }
    }
    exports.InMemoryTestStateMainService = InMemoryTestStateMainService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVzdC9lbGVjdHJvbi1tYWluL3dvcmtiZW5jaFRlc3RTZXJ2aWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSx3QkFBd0I7UUFBckM7WUFJQyxxQkFBZ0IsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBRWIsb0JBQWUsR0FBRyxJQUFJLGVBQU8sRUFBaUIsQ0FBQztZQUN2RCxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBZXJELHFCQUFnQixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDOUIsd0JBQW1CLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUVqQyxpQkFBWSxHQUFHLEtBQUssQ0FBQztZQUNyQixrQkFBYSxHQUFHLEtBQUssQ0FBQztZQUV0QixVQUFLLG9DQUE0QjtRQVVsQyxDQUFDO1FBN0JBLEtBQUssQ0FBQyxrQkFBa0I7WUFDdkIsTUFBTSxPQUFPLEdBQW9CLEVBQUUsQ0FBQztZQUVwQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztnQkFDekIsTUFBTSw2QkFBcUI7Z0JBQzNCLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTztvQkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsTUFBTSxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBVUQsY0FBYyxDQUFDLE1BQW1CLElBQVUsQ0FBQztRQUM3QyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQW1CLEVBQUUsR0FBc0IsSUFBbUIsQ0FBQztRQUM1RSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQW1CLEVBQUUsTUFBb0IsSUFBc0IsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFGLGtCQUFrQixDQUFDLE9BQXlCLElBQVUsQ0FBQztRQUN2RCxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQStFLElBQW1CLENBQUM7UUFDbEgsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFxQixJQUFzQixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFhLElBQW1CLENBQUM7UUFDNUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUF5QixJQUFtQixDQUFDO0tBQ3hEO0lBdENELDREQXNDQztJQUVELE1BQWEsNEJBQTRCO1FBQXpDO1lBSWtCLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBaUUsQ0FBQztRQXFCbEcsQ0FBQztRQW5CQSxPQUFPLENBQUMsR0FBVyxFQUFFLElBQTREO1lBQ2hGLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRUQsUUFBUSxDQUFDLEtBQStGO1lBQ3ZHLEtBQUssTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN6QjtRQUNGLENBQUM7UUFFRCxPQUFPLENBQUksR0FBVztZQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBa0IsQ0FBQztRQUM1QyxDQUFDO1FBRUQsVUFBVSxDQUFDLEdBQVc7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVELEtBQUssQ0FBQyxLQUFLLEtBQW9CLENBQUM7S0FDaEM7SUF6QkQsb0VBeUJDIn0=