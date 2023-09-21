/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CU = void 0;
    class TabFocusImpl {
        constructor() {
            this.a = false;
            this.b = new event_1.$fd();
            this.onDidChangeTabFocus = this.b.event;
        }
        getTabFocusMode() {
            return this.a;
        }
        setTabFocusMode(tabFocusMode) {
            this.a = tabFocusMode;
            this.b.fire(this.a);
        }
    }
    /**
     * Control what pressing Tab does.
     * If it is false, pressing Tab or Shift-Tab will be handled by the editor.
     * If it is true, pressing Tab or Shift-Tab will move the browser focus.
     * Defaults to false.
     */
    exports.$CU = new TabFocusImpl();
});
//# sourceMappingURL=tabFocus.js.map