/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event"], function (require, exports, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r$b = exports.$q$b = void 0;
    class $q$b {
        constructor() {
            this.onBeforeShutdown = event_1.Event.None;
            this.a = new event_1.$fd();
            this.onWillShutdown = this.a.event;
            this.onWillLoadWindow = event_1.Event.None;
            this.onBeforeCloseWindow = event_1.Event.None;
            this.wasRestarted = false;
            this.quitRequested = false;
            this.phase = 2 /* LifecycleMainPhase.Ready */;
        }
        async fireOnWillShutdown() {
            const joiners = [];
            this.a.fire({
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
    exports.$q$b = $q$b;
    class $r$b {
        constructor() {
            this.a = new Map();
        }
        setItem(key, data) {
            this.a.set(key, data);
        }
        setItems(items) {
            for (const { key, data } of items) {
                this.a.set(key, data);
            }
        }
        getItem(key) {
            return this.a.get(key);
        }
        removeItem(key) {
            this.a.delete(key);
        }
        async close() { }
    }
    exports.$r$b = $r$b;
});
//# sourceMappingURL=workbenchTestServices.js.map