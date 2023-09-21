/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TabFocus = void 0;
    class TabFocusImpl {
        constructor() {
            this._tabFocus = false;
            this._onDidChangeTabFocus = new event_1.Emitter();
            this.onDidChangeTabFocus = this._onDidChangeTabFocus.event;
        }
        getTabFocusMode() {
            return this._tabFocus;
        }
        setTabFocusMode(tabFocusMode) {
            this._tabFocus = tabFocusMode;
            this._onDidChangeTabFocus.fire(this._tabFocus);
        }
    }
    /**
     * Control what pressing Tab does.
     * If it is false, pressing Tab or Shift-Tab will be handled by the editor.
     * If it is true, pressing Tab or Shift-Tab will move the browser focus.
     * Defaults to false.
     */
    exports.TabFocus = new TabFocusImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiRm9jdXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9jb25maWcvdGFiRm9jdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQU0sWUFBWTtRQUFsQjtZQUNTLGNBQVMsR0FBWSxLQUFLLENBQUM7WUFDbEIseUJBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQVcsQ0FBQztZQUMvQyx3QkFBbUIsR0FBbUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztRQVV2RixDQUFDO1FBUk8sZUFBZTtZQUNyQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVNLGVBQWUsQ0FBQyxZQUFxQjtZQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztZQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRCxDQUFDO0tBQ0Q7SUFFRDs7Ozs7T0FLRztJQUNVLFFBQUEsUUFBUSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUMifQ==