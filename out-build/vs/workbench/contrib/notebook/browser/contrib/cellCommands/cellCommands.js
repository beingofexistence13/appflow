/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/mime", "vs/editor/browser/services/bulkEditService", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/notification/common/notification", "vs/editor/common/editorContextKeys", "vs/platform/configuration/common/configuration"], function (require, exports, keyCodes_1, mime_1, bulkEditService_1, nls_1, actions_1, contextkey_1, contextkeys_1, bulkCellEdits_1, cellOperations_1, coreActions_1, notebookBrowser_1, notebookContextKeys_1, icons, notebookCommon_1, notification_1, editorContextKeys_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Move/Copy cells
    const MOVE_CELL_UP_COMMAND_ID = 'notebook.cell.moveUp';
    const MOVE_CELL_DOWN_COMMAND_ID = 'notebook.cell.moveDown';
    const COPY_CELL_UP_COMMAND_ID = 'notebook.cell.copyUp';
    const COPY_CELL_DOWN_COMMAND_ID = 'notebook.cell.copyDown';
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: MOVE_CELL_UP_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Move Cell Up'
                },
                icon: icons.$Cpb,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkeys_1.$93.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.equals('config.notebook.dragAndDropEnabled', false),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 14
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.$Ypb)(context, 'up');
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: MOVE_CELL_DOWN_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Move Cell Down'
                },
                icon: icons.$Dpb,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkeys_1.$93.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.equals('config.notebook.dragAndDropEnabled', false),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 14
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.$Ypb)(context, 'down');
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: COPY_CELL_UP_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(2, null),
                    original: 'Copy Cell Up'
                },
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkeys_1.$93.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.$Zpb)(context, 'up');
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: COPY_CELL_DOWN_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(3, null),
                    original: 'Copy Cell Down'
                },
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkeys_1.$93.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 13
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.$Zpb)(context, 'down');
        }
    });
    //#endregion
    //#region Join/Split
    const SPLIT_CELL_COMMAND_ID = 'notebook.cell.split';
    const JOIN_SELECTED_CELLS_COMMAND_ID = 'notebook.cell.joinSelected';
    const JOIN_CELL_ABOVE_COMMAND_ID = 'notebook.cell.joinAbove';
    const JOIN_CELL_BELOW_COMMAND_ID = 'notebook.cell.joinBelow';
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: SPLIT_CELL_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(4, null),
                    original: 'Split Cell'
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob, notebookContextKeys_1.$iob.toNegated()),
                    order: 4 /* CellToolbarOrder.SplitCell */,
                    group: coreActions_1.$8ob
                },
                icon: icons.$Fpb,
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            if (context.notebookEditor.isReadOnly) {
                return;
            }
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            const cell = context.cell;
            const index = context.notebookEditor.getCellIndex(cell);
            const splitPoints = cell.focusMode === notebookBrowser_1.CellFocusMode.Container ? [{ lineNumber: 1, column: 1 }] : cell.getSelectionsStartPosition();
            if (splitPoints && splitPoints.length > 0) {
                await cell.resolveTextModel();
                if (!cell.hasModel()) {
                    return;
                }
                const newLinesContents = (0, cellOperations_1.$4pb)(cell, splitPoints);
                if (newLinesContents) {
                    const language = cell.language;
                    const kind = cell.cellKind;
                    const mime = cell.mime;
                    const textModel = await cell.resolveTextModel();
                    await bulkEditService.apply([
                        new bulkEditService_1.$p1(cell.uri, { range: textModel.getFullModelRange(), text: newLinesContents[0] }),
                        new bulkCellEdits_1.$3bb(context.notebookEditor.textModel.uri, {
                            editType: 1 /* CellEditType.Replace */,
                            index: index + 1,
                            count: 0,
                            cells: newLinesContents.slice(1).map(line => ({
                                cellKind: kind,
                                language,
                                mime,
                                source: line,
                                outputs: [],
                                metadata: {}
                            }))
                        })
                    ], { quotableLabel: 'Split Notebook Cell' });
                }
            }
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: JOIN_CELL_ABOVE_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(5, null),
                    original: 'Join With Previous Cell'
                },
                keybinding: {
                    when: notebookContextKeys_1.$Ynb,
                    primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 40 /* KeyCode.KeyJ */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 10
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            return (0, cellOperations_1.$3pb)(bulkEditService, context, 'above');
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: JOIN_CELL_BELOW_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(6, null),
                    original: 'Join With Next Cell'
                },
                keybinding: {
                    when: notebookContextKeys_1.$Ynb,
                    primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 40 /* KeyCode.KeyJ */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 11
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            return (0, cellOperations_1.$3pb)(bulkEditService, context, 'below');
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: JOIN_SELECTED_CELLS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(7, null),
                    original: 'Join Selected Cells'
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 12
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.$n1);
            const notificationService = accessor.get(notification_1.$Yu);
            return (0, cellOperations_1.$1pb)(bulkEditService, notificationService, context);
        }
    });
    //#endregion
    //#region Change Cell Type
    const CHANGE_CELL_TO_CODE_COMMAND_ID = 'notebook.cell.changeToCode';
    const CHANGE_CELL_TO_MARKDOWN_COMMAND_ID = 'notebook.cell.changeToMarkdown';
    (0, actions_1.$Xu)(class ChangeCellToCodeAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: CHANGE_CELL_TO_CODE_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Change Cell to Code'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83), notebookContextKeys_1.$1nb.toNegated()),
                    primary: 55 /* KeyCode.KeyY */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$_nb.isEqualTo('markup')),
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob, notebookContextKeys_1.$_nb.isEqualTo('markup')),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                }
            });
        }
        async runWithContext(accessor, context) {
            await (0, cellOperations_1.$Wpb)(notebookCommon_1.CellKind.Code, context);
        }
    });
    (0, actions_1.$Xu)(class ChangeCellToMarkdownAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: CHANGE_CELL_TO_MARKDOWN_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(9, null),
                    original: 'Change Cell to Markdown'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83), notebookContextKeys_1.$1nb.toNegated()),
                    primary: 43 /* KeyCode.KeyM */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$_nb.isEqualTo('code')),
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob, notebookContextKeys_1.$_nb.isEqualTo('code')),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                }
            });
        }
        async runWithContext(accessor, context) {
            await (0, cellOperations_1.$Wpb)(notebookCommon_1.CellKind.Markup, context, 'markdown', mime_1.$Hr.markdown);
        }
    });
    //#endregion
    //#region Collapse Cell
    const COLLAPSE_CELL_INPUT_COMMAND_ID = 'notebook.cell.collapseCellInput';
    const COLLAPSE_CELL_OUTPUT_COMMAND_ID = 'notebook.cell.collapseCellOutput';
    const COLLAPSE_ALL_CELL_INPUTS_COMMAND_ID = 'notebook.cell.collapseAllCellInputs';
    const EXPAND_ALL_CELL_INPUTS_COMMAND_ID = 'notebook.cell.expandAllCellInputs';
    const COLLAPSE_ALL_CELL_OUTPUTS_COMMAND_ID = 'notebook.cell.collapseAllCellOutputs';
    const EXPAND_ALL_CELL_OUTPUTS_COMMAND_ID = 'notebook.cell.expandAllCellOutputs';
    const TOGGLE_CELL_OUTPUTS_COMMAND_ID = 'notebook.cell.toggleOutputs';
    const TOGGLE_CELL_OUTPUT_SCROLLING = 'notebook.cell.toggleOutputScrolling';
    (0, actions_1.$Xu)(class CollapseCellInputAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: COLLAPSE_CELL_INPUT_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(10, null),
                    original: 'Collapse Cell Input'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, notebookContextKeys_1.$iob.toNegated(), contextkeys_1.$93.toNegated()),
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                context.cell.isInputCollapsed = true;
            }
            else {
                context.selectedCells.forEach(cell => cell.isInputCollapsed = true);
            }
        }
    });
    (0, actions_1.$Xu)(class ExpandCellInputAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: notebookBrowser_1.$Pbb,
                title: {
                    value: (0, nls_1.localize)(11, null),
                    original: 'Expand Cell Input'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, notebookContextKeys_1.$iob),
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                context.cell.isInputCollapsed = false;
            }
            else {
                context.selectedCells.forEach(cell => cell.isInputCollapsed = false);
            }
        }
    });
    (0, actions_1.$Xu)(class CollapseCellOutputAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: COLLAPSE_CELL_OUTPUT_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(12, null),
                    original: 'Collapse Cell Output'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, notebookContextKeys_1.$job.toNegated(), contextkeys_1.$93.toNegated(), notebookContextKeys_1.$hob),
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 50 /* KeyCode.KeyT */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                context.cell.isOutputCollapsed = true;
            }
            else {
                context.selectedCells.forEach(cell => cell.isOutputCollapsed = true);
            }
        }
    });
    (0, actions_1.$Xu)(class ExpandCellOuputAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: notebookBrowser_1.$Ubb,
                title: {
                    value: (0, nls_1.localize)(13, null),
                    original: 'Expand Cell Output'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, notebookContextKeys_1.$job),
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 50 /* KeyCode.KeyT */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                context.cell.isOutputCollapsed = false;
            }
            else {
                context.selectedCells.forEach(cell => cell.isOutputCollapsed = false);
            }
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$cpb {
        constructor() {
            super({
                id: TOGGLE_CELL_OUTPUTS_COMMAND_ID,
                precondition: notebookContextKeys_1.$Znb,
                title: {
                    value: (0, nls_1.localize)(14, null),
                    original: 'Toggle Outputs'
                },
                description: {
                    description: (0, nls_1.localize)(15, null),
                    args: coreActions_1.$hpb
                }
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            let cells = [];
            if (context.ui) {
                cells = [context.cell];
            }
            else if (context.selectedCells) {
                cells = context.selectedCells;
            }
            for (const cell of cells) {
                cell.isOutputCollapsed = !cell.isOutputCollapsed;
            }
        }
    });
    (0, actions_1.$Xu)(class CollapseAllCellInputsAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: COLLAPSE_ALL_CELL_INPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(16, null),
                    original: 'Collapse All Cell Inputs'
                },
                f1: true,
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isInputCollapsed = true);
        }
    });
    (0, actions_1.$Xu)(class ExpandAllCellInputsAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: EXPAND_ALL_CELL_INPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(17, null),
                    original: 'Expand All Cell Inputs'
                },
                f1: true
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isInputCollapsed = false);
        }
    });
    (0, actions_1.$Xu)(class CollapseAllCellOutputsAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: COLLAPSE_ALL_CELL_OUTPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(18, null),
                    original: 'Collapse All Cell Outputs'
                },
                f1: true,
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isOutputCollapsed = true);
        }
    });
    (0, actions_1.$Xu)(class ExpandAllCellOutputsAction extends coreActions_1.$cpb {
        constructor() {
            super({
                id: EXPAND_ALL_CELL_OUTPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(19, null),
                    original: 'Expand All Cell Outputs'
                },
                f1: true
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isOutputCollapsed = false);
        }
    });
    (0, actions_1.$Xu)(class ToggleCellOutputScrolling extends coreActions_1.$cpb {
        constructor() {
            super({
                id: TOGGLE_CELL_OUTPUT_SCROLLING,
                title: {
                    value: (0, nls_1.localize)(20, null),
                    original: 'Toggle Scroll Cell Output'
                },
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, contextkeys_1.$93.toNegated(), notebookContextKeys_1.$hob),
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 55 /* KeyCode.KeyY */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        c(viewModel, globalScrollSetting, collapsed) {
            const cellMetadata = viewModel.model.metadata;
            // TODO: when is cellMetadata undefined? Is that a case we need to support? It is currently a read-only property.
            if (cellMetadata) {
                const currentlyEnabled = cellMetadata['scrollable'] !== undefined ? cellMetadata['scrollable'] : globalScrollSetting;
                const shouldEnableScrolling = collapsed || !currentlyEnabled;
                cellMetadata['scrollable'] = shouldEnableScrolling;
                viewModel.resetRenderer();
            }
        }
        async runWithContext(accessor, context) {
            const globalScrolling = accessor.get(configuration_1.$8h).getValue(notebookCommon_1.$7H.outputScrolling);
            if (context.ui) {
                context.cell.outputsViewModels.forEach((viewModel) => {
                    this.c(viewModel, globalScrolling, context.cell.isOutputCollapsed);
                });
                context.cell.isOutputCollapsed = false;
            }
            else {
                context.selectedCells.forEach(cell => {
                    cell.outputsViewModels.forEach((viewModel) => {
                        this.c(viewModel, globalScrolling, cell.isOutputCollapsed);
                    });
                    cell.isOutputCollapsed = false;
                });
            }
        }
    });
    //#endregion
    function forEachCell(editor, callback) {
        for (let i = 0; i < editor.getLength(); i++) {
            const cell = editor.cellAt(i);
            callback(cell, i);
        }
    }
});
//# sourceMappingURL=cellCommands.js.map