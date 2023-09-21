/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isMenubarMenuItemAction = exports.isMenubarMenuItemRecentAction = exports.isMenubarMenuItemSeparator = exports.isMenubarMenuItemSubmenu = void 0;
    function isMenubarMenuItemSubmenu(menuItem) {
        return menuItem.submenu !== undefined;
    }
    exports.isMenubarMenuItemSubmenu = isMenubarMenuItemSubmenu;
    function isMenubarMenuItemSeparator(menuItem) {
        return menuItem.id === 'vscode.menubar.separator';
    }
    exports.isMenubarMenuItemSeparator = isMenubarMenuItemSeparator;
    function isMenubarMenuItemRecentAction(menuItem) {
        return menuItem.uri !== undefined;
    }
    exports.isMenubarMenuItemRecentAction = isMenubarMenuItemRecentAction;
    function isMenubarMenuItemAction(menuItem) {
        return !isMenubarMenuItemSubmenu(menuItem) && !isMenubarMenuItemSeparator(menuItem) && !isMenubarMenuItemRecentAction(menuItem);
    }
    exports.isMenubarMenuItemAction = isMenubarMenuItemAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL21lbnViYXIvY29tbW9uL21lbnViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0RoRyxTQUFnQix3QkFBd0IsQ0FBQyxRQUF5QjtRQUNqRSxPQUFpQyxRQUFTLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztJQUNsRSxDQUFDO0lBRkQsNERBRUM7SUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxRQUF5QjtRQUNuRSxPQUFtQyxRQUFTLENBQUMsRUFBRSxLQUFLLDBCQUEwQixDQUFDO0lBQ2hGLENBQUM7SUFGRCxnRUFFQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLFFBQXlCO1FBQ3RFLE9BQXNDLFFBQVMsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDO0lBQ25FLENBQUM7SUFGRCxzRUFFQztJQUVELFNBQWdCLHVCQUF1QixDQUFDLFFBQXlCO1FBQ2hFLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakksQ0FBQztJQUZELDBEQUVDIn0=