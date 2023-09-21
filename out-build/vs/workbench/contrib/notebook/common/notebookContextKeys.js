/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, contextkey_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rob = exports.$qob = exports.$pob = exports.$oob = exports.$nob = exports.$mob = exports.$lob = exports.$kob = exports.$job = exports.$iob = exports.$hob = exports.$gob = exports.$fob = exports.$eob = exports.$dob = exports.$cob = exports.$bob = exports.$aob = exports.$_nb = exports.$$nb = exports.$0nb = exports.$9nb = exports.$8nb = exports.$7nb = exports.$6nb = exports.$5nb = exports.$4nb = exports.$3nb = exports.$2nb = exports.$1nb = exports.$Znb = exports.$Ynb = exports.$Xnb = exports.$Wnb = exports.$Vnb = exports.$Unb = exports.$Tnb = void 0;
    //#region Context Keys
    exports.$Tnb = new contextkey_1.$2i('userHasOpenedNotebook', false);
    exports.$Unb = new contextkey_1.$2i('notebookFindWidgetFocused', false);
    exports.$Vnb = new contextkey_1.$2i('interactiveWindowOpen', false);
    // Is Notebook
    exports.$Wnb = contextkey_1.$Ii.equals('activeEditor', notebookCommon_1.$TH);
    exports.$Xnb = contextkey_1.$Ii.equals('activeEditor', notebookCommon_1.$VH);
    // Editor keys
    exports.$Ynb = new contextkey_1.$2i('notebookEditorFocused', false);
    exports.$Znb = new contextkey_1.$2i('notebookCellListFocused', false);
    exports.$1nb = new contextkey_1.$2i('notebookOutputFocused', false);
    exports.$2nb = new contextkey_1.$2i('notebookOutputInputFocused', false);
    exports.$3nb = new contextkey_1.$2i('notebookEditable', true);
    exports.$4nb = new contextkey_1.$2i('notebookHasRunningCell', false);
    exports.$5nb = new contextkey_1.$2i('notebookHasSomethingRunning', false);
    exports.$6nb = new contextkey_1.$2i('notebookUseConsolidatedOutputButton', false);
    exports.$7nb = new contextkey_1.$2i('notebookBreakpointMargin', false);
    exports.$8nb = new contextkey_1.$2i('notebookCellToolbarLocation', 'left');
    exports.$9nb = new contextkey_1.$2i('notebookCursorNavigationMode', false);
    exports.$0nb = new contextkey_1.$2i('notebookLastCellFailed', false);
    // Cell keys
    exports.$$nb = new contextkey_1.$2i('notebookType', undefined);
    exports.$_nb = new contextkey_1.$2i('notebookCellType', undefined);
    exports.$aob = new contextkey_1.$2i('notebookCellEditable', false);
    exports.$bob = new contextkey_1.$2i('notebookCellFocused', false);
    exports.$cob = new contextkey_1.$2i('notebookCellEditorFocused', false);
    exports.$dob = new contextkey_1.$2i('notebookCellMarkdownEditMode', false);
    exports.$eob = new contextkey_1.$2i('notebookCellLineNumbers', 'inherit');
    exports.$fob = new contextkey_1.$2i('notebookCellExecutionState', undefined);
    exports.$gob = new contextkey_1.$2i('notebookCellExecuting', false); // This only exists to simplify a context key expression, see #129625
    exports.$hob = new contextkey_1.$2i('notebookCellHasOutputs', false);
    exports.$iob = new contextkey_1.$2i('notebookCellInputIsCollapsed', false);
    exports.$job = new contextkey_1.$2i('notebookCellOutputIsCollapsed', false);
    exports.$kob = new contextkey_1.$2i('notebookCellResource', '');
    // Kernels
    exports.$lob = new contextkey_1.$2i('notebookKernel', undefined);
    exports.$mob = new contextkey_1.$2i('notebookKernelCount', 0);
    exports.$nob = new contextkey_1.$2i('notebookKernelSourceCount', 0);
    exports.$oob = new contextkey_1.$2i('notebookKernelSelected', false);
    exports.$pob = new contextkey_1.$2i('notebookInterruptibleKernel', false);
    exports.$qob = new contextkey_1.$2i('notebookMissingKernelExtension', false);
    exports.$rob = new contextkey_1.$2i('notebookHasOutputs', false);
});
//#endregion
//# sourceMappingURL=notebookContextKeys.js.map