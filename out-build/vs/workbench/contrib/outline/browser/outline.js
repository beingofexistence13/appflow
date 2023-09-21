/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DZb = exports.$CZb = exports.$BZb = exports.$AZb = exports.IOutlinePane = exports.OutlineSortOrder = void 0;
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
    exports.$AZb = new contextkey_1.$2i('outlineFollowsCursor', false);
    exports.$BZb = new contextkey_1.$2i('outlineFiltersOnType', false);
    exports.$CZb = new contextkey_1.$2i('outlineSortMode', 0 /* OutlineSortOrder.ByPosition */);
    exports.$DZb = new contextkey_1.$2i('outlineAllCollapsed', false);
});
//# sourceMappingURL=outline.js.map