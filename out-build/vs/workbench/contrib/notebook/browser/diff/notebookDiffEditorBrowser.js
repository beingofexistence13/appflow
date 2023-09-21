/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BEb = exports.$AEb = exports.$zEb = exports.$yEb = exports.DiffSide = void 0;
    var DiffSide;
    (function (DiffSide) {
        DiffSide[DiffSide["Original"] = 0] = "Original";
        DiffSide[DiffSide["Modified"] = 1] = "Modified";
    })(DiffSide || (exports.DiffSide = DiffSide = {}));
    exports.$yEb = 16;
    exports.$zEb = new contextkey_1.$2i('notebookDiffCellInputChanged', false);
    exports.$AEb = new contextkey_1.$2i('notebookDiffCellPropertyChanged', false);
    exports.$BEb = new contextkey_1.$2i('notebookDiffCellPropertyExpanded', false);
});
//# sourceMappingURL=notebookDiffEditorBrowser.js.map