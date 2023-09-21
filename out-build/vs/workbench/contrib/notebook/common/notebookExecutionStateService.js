/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_H = exports.NotebookExecutionType = void 0;
    var NotebookExecutionType;
    (function (NotebookExecutionType) {
        NotebookExecutionType[NotebookExecutionType["cell"] = 0] = "cell";
        NotebookExecutionType[NotebookExecutionType["notebook"] = 1] = "notebook";
    })(NotebookExecutionType || (exports.NotebookExecutionType = NotebookExecutionType = {}));
    exports.$_H = (0, instantiation_1.$Bh)('INotebookExecutionStateService');
});
//# sourceMappingURL=notebookExecutionStateService.js.map