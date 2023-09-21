/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoScope = exports.GoFilter = exports.IHistoryService = void 0;
    exports.IHistoryService = (0, instantiation_1.createDecorator)('historyService');
    /**
     * Limit editor navigation to certain kinds.
     */
    var GoFilter;
    (function (GoFilter) {
        /**
         * Navigate between editor navigation history
         * entries from any kind of navigation source.
         */
        GoFilter[GoFilter["NONE"] = 0] = "NONE";
        /**
         * Only navigate between editor navigation history
         * entries that were resulting from edits.
         */
        GoFilter[GoFilter["EDITS"] = 1] = "EDITS";
        /**
         * Only navigate between editor navigation history
         * entries that were resulting from navigations, such
         * as "Go to definition".
         */
        GoFilter[GoFilter["NAVIGATION"] = 2] = "NAVIGATION";
    })(GoFilter || (exports.GoFilter = GoFilter = {}));
    /**
     * Limit editor navigation to certain scopes.
     */
    var GoScope;
    (function (GoScope) {
        /**
         * Navigate across all editors and editor groups.
         */
        GoScope[GoScope["DEFAULT"] = 0] = "DEFAULT";
        /**
         * Navigate only in editors of the active editor group.
         */
        GoScope[GoScope["EDITOR_GROUP"] = 1] = "EDITOR_GROUP";
        /**
         * Navigate only in the active editor.
         */
        GoScope[GoScope["EDITOR"] = 2] = "EDITOR";
    })(GoScope || (exports.GoScope = GoScope = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9oaXN0b3J5L2NvbW1vbi9oaXN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFuRixRQUFBLGVBQWUsR0FBRyxJQUFBLCtCQUFlLEVBQWtCLGdCQUFnQixDQUFDLENBQUM7SUFFbEY7O09BRUc7SUFDSCxJQUFrQixRQW9CakI7SUFwQkQsV0FBa0IsUUFBUTtRQUV6Qjs7O1dBR0c7UUFDSCx1Q0FBSSxDQUFBO1FBRUo7OztXQUdHO1FBQ0gseUNBQUssQ0FBQTtRQUVMOzs7O1dBSUc7UUFDSCxtREFBVSxDQUFBO0lBQ1gsQ0FBQyxFQXBCaUIsUUFBUSx3QkFBUixRQUFRLFFBb0J6QjtJQUVEOztPQUVHO0lBQ0gsSUFBa0IsT0FnQmpCO0lBaEJELFdBQWtCLE9BQU87UUFFeEI7O1dBRUc7UUFDSCwyQ0FBTyxDQUFBO1FBRVA7O1dBRUc7UUFDSCxxREFBWSxDQUFBO1FBRVo7O1dBRUc7UUFDSCx5Q0FBTSxDQUFBO0lBQ1AsQ0FBQyxFQWhCaUIsT0FBTyx1QkFBUCxPQUFPLFFBZ0J4QiJ9