/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED = exports.NOTEBOOK_DIFF_CELL_PROPERTY = exports.NOTEBOOK_DIFF_CELL_INPUT = exports.DIFF_CELL_MARGIN = exports.DiffSide = void 0;
    var DiffSide;
    (function (DiffSide) {
        DiffSide[DiffSide["Original"] = 0] = "Original";
        DiffSide[DiffSide["Modified"] = 1] = "Modified";
    })(DiffSide || (exports.DiffSide = DiffSide = {}));
    exports.DIFF_CELL_MARGIN = 16;
    exports.NOTEBOOK_DIFF_CELL_INPUT = new contextkey_1.RawContextKey('notebookDiffCellInputChanged', false);
    exports.NOTEBOOK_DIFF_CELL_PROPERTY = new contextkey_1.RawContextKey('notebookDiffCellPropertyChanged', false);
    exports.NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED = new contextkey_1.RawContextKey('notebookDiffCellPropertyExpanded', false);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmRWRpdG9yQnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvZGlmZi9ub3RlYm9va0RpZmZFZGl0b3JCcm93c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsSUFBWSxRQUdYO0lBSEQsV0FBWSxRQUFRO1FBQ25CLCtDQUFZLENBQUE7UUFDWiwrQ0FBWSxDQUFBO0lBQ2IsQ0FBQyxFQUhXLFFBQVEsd0JBQVIsUUFBUSxRQUduQjtJQW9HWSxRQUFBLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUN0QixRQUFBLHdCQUF3QixHQUFHLElBQUksMEJBQWEsQ0FBVSw4QkFBOEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RixRQUFBLDJCQUEyQixHQUFHLElBQUksMEJBQWEsQ0FBVSxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRyxRQUFBLG9DQUFvQyxHQUFHLElBQUksMEJBQWEsQ0FBVSxrQ0FBa0MsRUFBRSxLQUFLLENBQUMsQ0FBQyJ9