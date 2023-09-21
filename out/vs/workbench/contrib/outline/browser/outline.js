/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ctxAllCollapsed = exports.ctxSortMode = exports.ctxFilterOnType = exports.ctxFollowsCursor = exports.IOutlinePane = exports.OutlineSortOrder = void 0;
    var OutlineSortOrder;
    (function (OutlineSortOrder) {
        OutlineSortOrder[OutlineSortOrder["ByPosition"] = 0] = "ByPosition";
        OutlineSortOrder[OutlineSortOrder["ByName"] = 1] = "ByName";
        OutlineSortOrder[OutlineSortOrder["ByKind"] = 2] = "ByKind";
    })(OutlineSortOrder || (exports.OutlineSortOrder = OutlineSortOrder = {}));
    var IOutlinePane;
    (function (IOutlinePane) {
        IOutlinePane.Id = 'outline';
    })(IOutlinePane || (exports.IOutlinePane = IOutlinePane = {}));
    // --- context keys
    exports.ctxFollowsCursor = new contextkey_1.RawContextKey('outlineFollowsCursor', false);
    exports.ctxFilterOnType = new contextkey_1.RawContextKey('outlineFiltersOnType', false);
    exports.ctxSortMode = new contextkey_1.RawContextKey('outlineSortMode', 0 /* OutlineSortOrder.ByPosition */);
    exports.ctxAllCollapsed = new contextkey_1.RawContextKey('outlineAllCollapsed', false);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL291dGxpbmUvYnJvd3Nlci9vdXRsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxJQUFrQixnQkFJakI7SUFKRCxXQUFrQixnQkFBZ0I7UUFDakMsbUVBQVUsQ0FBQTtRQUNWLDJEQUFNLENBQUE7UUFDTiwyREFBTSxDQUFBO0lBQ1AsQ0FBQyxFQUppQixnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQUlqQztJQVFELElBQWlCLFlBQVksQ0FFNUI7SUFGRCxXQUFpQixZQUFZO1FBQ2YsZUFBRSxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDLEVBRmdCLFlBQVksNEJBQVosWUFBWSxRQUU1QjtJQVFELG1CQUFtQjtJQUVOLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdFLFFBQUEsZUFBZSxHQUFHLElBQUksMEJBQWEsQ0FBVSxzQkFBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RSxRQUFBLFdBQVcsR0FBRyxJQUFJLDBCQUFhLENBQW1CLGlCQUFpQixzQ0FBOEIsQ0FBQztJQUNsRyxRQUFBLGVBQWUsR0FBRyxJQUFJLDBCQUFhLENBQVUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUMifQ==