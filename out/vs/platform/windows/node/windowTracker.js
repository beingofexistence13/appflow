/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, async_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActiveWindowManager = void 0;
    class ActiveWindowManager extends lifecycle_1.Disposable {
        constructor({ onDidOpenWindow, onDidFocusWindow, getActiveWindowId }) {
            super();
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            // remember last active window id upon events
            const onActiveWindowChange = event_1.Event.latch(event_1.Event.any(onDidOpenWindow, onDidFocusWindow));
            onActiveWindowChange(this.setActiveWindow, this, this.disposables);
            // resolve current active window
            this.firstActiveWindowIdPromise = (0, async_1.createCancelablePromise)(() => getActiveWindowId());
            (async () => {
                try {
                    const windowId = await this.firstActiveWindowIdPromise;
                    this.activeWindowId = (typeof this.activeWindowId === 'number') ? this.activeWindowId : windowId;
                }
                catch (error) {
                    // ignore
                }
                finally {
                    this.firstActiveWindowIdPromise = undefined;
                }
            })();
        }
        setActiveWindow(windowId) {
            if (this.firstActiveWindowIdPromise) {
                this.firstActiveWindowIdPromise.cancel();
                this.firstActiveWindowIdPromise = undefined;
            }
            this.activeWindowId = windowId;
        }
        async getActiveClientId() {
            const id = this.firstActiveWindowIdPromise ? (await this.firstActiveWindowIdPromise) : this.activeWindowId;
            return `window:${id}`;
        }
    }
    exports.ActiveWindowManager = ActiveWindowManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93VHJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dpbmRvd3Mvbm9kZS93aW5kb3dUcmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLG1CQUFvQixTQUFRLHNCQUFVO1FBT2xELFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBSWpFO1lBQ0EsS0FBSyxFQUFFLENBQUM7WUFWUSxnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVlwRSw2Q0FBNkM7WUFDN0MsTUFBTSxvQkFBb0IsR0FBRyxhQUFLLENBQUMsS0FBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN2RixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFbkUsZ0NBQWdDO1lBQ2hDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFBLCtCQUF1QixFQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNyRixDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNYLElBQUk7b0JBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxPQUFPLElBQUksQ0FBQyxjQUFjLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztpQkFDakc7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2YsU0FBUztpQkFDVDt3QkFBUztvQkFDVCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsU0FBUyxDQUFDO2lCQUM1QztZQUNGLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTixDQUFDO1FBRU8sZUFBZSxDQUFDLFFBQTRCO1lBQ25ELElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNwQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxTQUFTLENBQUM7YUFDNUM7WUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztRQUNoQyxDQUFDO1FBRUQsS0FBSyxDQUFDLGlCQUFpQjtZQUN0QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUUzRyxPQUFPLFVBQVUsRUFBRSxFQUFFLENBQUM7UUFDdkIsQ0FBQztLQUNEO0lBOUNELGtEQThDQyJ9