/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, DOM, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$afb = void 0;
    /**
     * Allows webviews to monitor when an element in the VS Code editor is being dragged/dropped.
     *
     * This is required since webview end up eating the drag event. VS Code needs to see this
     * event so it can handle editor element drag drop.
     */
    class $afb extends lifecycle_1.$kc {
        constructor(getWebview) {
            super();
            this.B(DOM.$nO(window, DOM.$3O.DRAG_START, () => {
                getWebview()?.windowDidDragStart();
            }));
            const onDragEnd = () => {
                getWebview()?.windowDidDragEnd();
            };
            this.B(DOM.$nO(window, DOM.$3O.DRAG_END, onDragEnd));
            this.B(DOM.$nO(window, DOM.$3O.MOUSE_MOVE, currentEvent => {
                if (currentEvent.buttons === 0) {
                    onDragEnd();
                }
            }));
        }
    }
    exports.$afb = $afb;
});
//# sourceMappingURL=webviewWindowDragMonitor.js.map