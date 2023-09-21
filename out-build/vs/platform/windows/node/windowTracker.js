/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, async_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X6b = void 0;
    class $X6b extends lifecycle_1.$kc {
        constructor({ onDidOpenWindow, onDidFocusWindow, getActiveWindowId }) {
            super();
            this.a = this.B(new lifecycle_1.$jc());
            // remember last active window id upon events
            const onActiveWindowChange = event_1.Event.latch(event_1.Event.any(onDidOpenWindow, onDidFocusWindow));
            onActiveWindowChange(this.f, this, this.a);
            // resolve current active window
            this.b = (0, async_1.$ug)(() => getActiveWindowId());
            (async () => {
                try {
                    const windowId = await this.b;
                    this.c = (typeof this.c === 'number') ? this.c : windowId;
                }
                catch (error) {
                    // ignore
                }
                finally {
                    this.b = undefined;
                }
            })();
        }
        f(windowId) {
            if (this.b) {
                this.b.cancel();
                this.b = undefined;
            }
            this.c = windowId;
        }
        async getActiveClientId() {
            const id = this.b ? (await this.b) : this.c;
            return `window:${id}`;
        }
    }
    exports.$X6b = $X6b;
});
//# sourceMappingURL=windowTracker.js.map