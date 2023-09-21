/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, DOM, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewWindowDragMonitor = void 0;
    /**
     * Allows webviews to monitor when an element in the VS Code editor is being dragged/dropped.
     *
     * This is required since webview end up eating the drag event. VS Code needs to see this
     * event so it can handle editor element drag drop.
     */
    class WebviewWindowDragMonitor extends lifecycle_1.Disposable {
        constructor(getWebview) {
            super();
            this._register(DOM.addDisposableListener(window, DOM.EventType.DRAG_START, () => {
                getWebview()?.windowDidDragStart();
            }));
            const onDragEnd = () => {
                getWebview()?.windowDidDragEnd();
            };
            this._register(DOM.addDisposableListener(window, DOM.EventType.DRAG_END, onDragEnd));
            this._register(DOM.addDisposableListener(window, DOM.EventType.MOUSE_MOVE, currentEvent => {
                if (currentEvent.buttons === 0) {
                    onDragEnd();
                }
            }));
        }
    }
    exports.WebviewWindowDragMonitor = WebviewWindowDragMonitor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1dpbmRvd0RyYWdNb25pdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlldy9icm93c2VyL3dlYnZpZXdXaW5kb3dEcmFnTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEc7Ozs7O09BS0c7SUFDSCxNQUFhLHdCQUF5QixTQUFRLHNCQUFVO1FBQ3ZELFlBQVksVUFBc0M7WUFDakQsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO2dCQUMvRSxVQUFVLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7Z0JBQ3RCLFVBQVUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLENBQUM7WUFDbEMsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUN6RixJQUFJLFlBQVksQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFO29CQUMvQixTQUFTLEVBQUUsQ0FBQztpQkFDWjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Q7SUFuQkQsNERBbUJDIn0=