/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, dom, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HP = void 0;
    class $HP {
        constructor() {
            this.a = new lifecycle_1.$jc();
            this.b = null;
            this.c = null;
        }
        dispose() {
            this.stopMonitoring(false);
            this.a.dispose();
        }
        stopMonitoring(invokeStopCallback, browserEvent) {
            if (!this.isMonitoring()) {
                // Not monitoring
                return;
            }
            // Unhook
            this.a.clear();
            this.b = null;
            const onStopCallback = this.c;
            this.c = null;
            if (invokeStopCallback && onStopCallback) {
                onStopCallback(browserEvent);
            }
        }
        isMonitoring() {
            return !!this.b;
        }
        startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
            if (this.isMonitoring()) {
                this.stopMonitoring(false);
            }
            this.b = pointerMoveCallback;
            this.c = onStopCallback;
            let eventSource = initialElement;
            try {
                initialElement.setPointerCapture(pointerId);
                this.a.add((0, lifecycle_1.$ic)(() => {
                    try {
                        initialElement.releasePointerCapture(pointerId);
                    }
                    catch (err) {
                        // See https://github.com/microsoft/vscode/issues/161731
                        //
                        // `releasePointerCapture` sometimes fails when being invoked with the exception:
                        //     DOMException: Failed to execute 'releasePointerCapture' on 'Element':
                        //     No active pointer with the given id is found.
                        //
                        // There's no need to do anything in case of failure
                    }
                }));
            }
            catch (err) {
                // See https://github.com/microsoft/vscode/issues/144584
                // See https://github.com/microsoft/vscode/issues/146947
                // `setPointerCapture` sometimes fails when being invoked
                // from a `mousedown` listener on macOS and Windows
                // and it always fails on Linux with the exception:
                //     DOMException: Failed to execute 'setPointerCapture' on 'Element':
                //     No active pointer with the given id is found.
                // In case of failure, we bind the listeners on the window
                eventSource = window;
            }
            this.a.add(dom.$nO(eventSource, dom.$3O.POINTER_MOVE, (e) => {
                if (e.buttons !== initialButtons) {
                    // Buttons state has changed in the meantime
                    this.stopMonitoring(true);
                    return;
                }
                e.preventDefault();
                this.b(e);
            }));
            this.a.add(dom.$nO(eventSource, dom.$3O.POINTER_UP, (e) => this.stopMonitoring(true)));
        }
    }
    exports.$HP = $HP;
});
//# sourceMappingURL=globalPointerMoveMonitor.js.map