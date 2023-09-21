/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, dom, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GlobalPointerMoveMonitor = void 0;
    class GlobalPointerMoveMonitor {
        constructor() {
            this._hooks = new lifecycle_1.DisposableStore();
            this._pointerMoveCallback = null;
            this._onStopCallback = null;
        }
        dispose() {
            this.stopMonitoring(false);
            this._hooks.dispose();
        }
        stopMonitoring(invokeStopCallback, browserEvent) {
            if (!this.isMonitoring()) {
                // Not monitoring
                return;
            }
            // Unhook
            this._hooks.clear();
            this._pointerMoveCallback = null;
            const onStopCallback = this._onStopCallback;
            this._onStopCallback = null;
            if (invokeStopCallback && onStopCallback) {
                onStopCallback(browserEvent);
            }
        }
        isMonitoring() {
            return !!this._pointerMoveCallback;
        }
        startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
            if (this.isMonitoring()) {
                this.stopMonitoring(false);
            }
            this._pointerMoveCallback = pointerMoveCallback;
            this._onStopCallback = onStopCallback;
            let eventSource = initialElement;
            try {
                initialElement.setPointerCapture(pointerId);
                this._hooks.add((0, lifecycle_1.toDisposable)(() => {
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
            this._hooks.add(dom.addDisposableListener(eventSource, dom.EventType.POINTER_MOVE, (e) => {
                if (e.buttons !== initialButtons) {
                    // Buttons state has changed in the meantime
                    this.stopMonitoring(true);
                    return;
                }
                e.preventDefault();
                this._pointerMoveCallback(e);
            }));
            this._hooks.add(dom.addDisposableListener(eventSource, dom.EventType.POINTER_UP, (e) => this.stopMonitoring(true)));
        }
    }
    exports.GlobalPointerMoveMonitor = GlobalPointerMoveMonitor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsUG9pbnRlck1vdmVNb25pdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2dsb2JhbFBvaW50ZXJNb3ZlTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBYSx3QkFBd0I7UUFBckM7WUFFa0IsV0FBTSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3hDLHlCQUFvQixHQUFnQyxJQUFJLENBQUM7WUFDekQsb0JBQWUsR0FBMkIsSUFBSSxDQUFDO1FBMkZ4RCxDQUFDO1FBekZPLE9BQU87WUFDYixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVNLGNBQWMsQ0FBQyxrQkFBMkIsRUFBRSxZQUEyQztZQUM3RixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUN6QixpQkFBaUI7Z0JBQ2pCLE9BQU87YUFDUDtZQUVELFNBQVM7WUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7WUFDakMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUM1QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUU1QixJQUFJLGtCQUFrQixJQUFJLGNBQWMsRUFBRTtnQkFDekMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVNLFlBQVk7WUFDbEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLENBQUM7UUFFTSxlQUFlLENBQ3JCLGNBQXVCLEVBQ3ZCLFNBQWlCLEVBQ2pCLGNBQXNCLEVBQ3RCLG1CQUF5QyxFQUN6QyxjQUErQjtZQUUvQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtZQUNELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztZQUNoRCxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztZQUV0QyxJQUFJLFdBQVcsR0FBcUIsY0FBYyxDQUFDO1lBRW5ELElBQUk7Z0JBQ0gsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO29CQUNqQyxJQUFJO3dCQUNILGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDaEQ7b0JBQUMsT0FBTyxHQUFHLEVBQUU7d0JBQ2Isd0RBQXdEO3dCQUN4RCxFQUFFO3dCQUNGLGlGQUFpRjt3QkFDakYsNEVBQTRFO3dCQUM1RSxvREFBb0Q7d0JBQ3BELEVBQUU7d0JBQ0Ysb0RBQW9EO3FCQUNwRDtnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYix3REFBd0Q7Z0JBQ3hELHdEQUF3RDtnQkFDeEQseURBQXlEO2dCQUN6RCxtREFBbUQ7Z0JBQ25ELG1EQUFtRDtnQkFDbkQsd0VBQXdFO2dCQUN4RSxvREFBb0Q7Z0JBQ3BELDBEQUEwRDtnQkFDMUQsV0FBVyxHQUFHLE1BQU0sQ0FBQzthQUNyQjtZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FDeEMsV0FBVyxFQUNYLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUMxQixDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNMLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxjQUFjLEVBQUU7b0JBQ2pDLDRDQUE0QztvQkFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUIsT0FBTztpQkFDUDtnQkFFRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxvQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUN4QyxXQUFXLEVBQ1gsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQ3hCLENBQUMsQ0FBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUM5QyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUEvRkQsNERBK0ZDIn0=