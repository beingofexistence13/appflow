/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/mime", "vs/editor/browser/services/bulkEditService", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/notification/common/notification", "vs/editor/common/editorContextKeys", "vs/platform/configuration/common/configuration"], function (require, exports, keyCodes_1, mime_1, bulkEditService_1, nls_1, actions_1, contextkey_1, contextkeys_1, bulkCellEdits_1, cellOperations_1, coreActions_1, notebookBrowser_1, notebookContextKeys_1, icons, notebookCommon_1, notification_1, editorContextKeys_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Move/Copy cells
    const MOVE_CELL_UP_COMMAND_ID = 'notebook.cell.moveUp';
    const MOVE_CELL_DOWN_COMMAND_ID = 'notebook.cell.moveDown';
    const COPY_CELL_UP_COMMAND_ID = 'notebook.cell.copyUp';
    const COPY_CELL_DOWN_COMMAND_ID = 'notebook.cell.copyDown';
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: MOVE_CELL_UP_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.moveCellUp', "Move Cell Up"),
                    original: 'Move Cell Up'
                },
                icon: icons.moveUpIcon,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.equals('config.notebook.dragAndDropEnabled', false),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 14
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.moveCellRange)(context, 'up');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: MOVE_CELL_DOWN_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.moveCellDown', "Move Cell Down"),
                    original: 'Move Cell Down'
                },
                icon: icons.moveDownIcon,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.equals('config.notebook.dragAndDropEnabled', false),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 14
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.moveCellRange)(context, 'down');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: COPY_CELL_UP_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.copyCellUp', "Copy Cell Up"),
                    original: 'Copy Cell Up'
                },
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.copyCellRange)(context, 'up');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: COPY_CELL_DOWN_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.copyCellDown', "Copy Cell Down"),
                    original: 'Copy Cell Down'
                },
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 13
                }
            });
        }
        async runWithContext(accessor, context) {
            return (0, cellOperations_1.copyCellRange)(context, 'down');
        }
    });
    //#endregion
    //#region Join/Split
    const SPLIT_CELL_COMMAND_ID = 'notebook.cell.split';
    const JOIN_SELECTED_CELLS_COMMAND_ID = 'notebook.cell.joinSelected';
    const JOIN_CELL_ABOVE_COMMAND_ID = 'notebook.cell.joinAbove';
    const JOIN_CELL_BELOW_COMMAND_ID = 'notebook.cell.joinBelow';
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: SPLIT_CELL_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.splitCell', "Split Cell"),
                    original: 'Split Cell'
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_INPUT_COLLAPSED.toNegated()),
                    order: 4 /* CellToolbarOrder.SplitCell */,
                    group: coreActions_1.CELL_TITLE_CELL_GROUP_ID
                },
                icon: icons.splitCellIcon,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            if (context.notebookEditor.isReadOnly) {
                return;
            }
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            const cell = context.cell;
            const index = context.notebookEditor.getCellIndex(cell);
            const splitPoints = cell.focusMode === notebookBrowser_1.CellFocusMode.Container ? [{ lineNumber: 1, column: 1 }] : cell.getSelectionsStartPosition();
            if (splitPoints && splitPoints.length > 0) {
                await cell.resolveTextModel();
                if (!cell.hasModel()) {
                    return;
                }
                const newLinesContents = (0, cellOperations_1.computeCellLinesContents)(cell, splitPoints);
                if (newLinesContents) {
                    const language = cell.language;
                    const kind = cell.cellKind;
                    const mime = cell.mime;
                    const textModel = await cell.resolveTextModel();
                    await bulkEditService.apply([
                        new bulkEditService_1.ResourceTextEdit(cell.uri, { range: textModel.getFullModelRange(), text: newLinesContents[0] }),
                        new bulkCellEdits_1.ResourceNotebookCellEdit(context.notebookEditor.textModel.uri, {
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
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: JOIN_CELL_ABOVE_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.joinCellAbove', "Join With Previous Cell"),
                    original: 'Join With Previous Cell'
                },
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 40 /* KeyCode.KeyJ */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 10
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            return (0, cellOperations_1.joinCellsWithSurrounds)(bulkEditService, context, 'above');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: JOIN_CELL_BELOW_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.joinCellBelow', "Join With Next Cell"),
                    original: 'Join With Next Cell'
                },
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 40 /* KeyCode.KeyJ */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 11
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            return (0, cellOperations_1.joinCellsWithSurrounds)(bulkEditService, context, 'below');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: JOIN_SELECTED_CELLS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.joinSelectedCells', "Join Selected Cells"),
                    original: 'Join Selected Cells'
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                    order: 12
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            const notificationService = accessor.get(notification_1.INotificationService);
            return (0, cellOperations_1.joinSelectedCells)(bulkEditService, notificationService, context);
        }
    });
    //#endregion
    //#region Change Cell Type
    const CHANGE_CELL_TO_CODE_COMMAND_ID = 'notebook.cell.changeToCode';
    const CHANGE_CELL_TO_MARKDOWN_COMMAND_ID = 'notebook.cell.changeToMarkdown';
    (0, actions_1.registerAction2)(class ChangeCellToCodeAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: CHANGE_CELL_TO_CODE_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.changeCellToCode', "Change Cell to Code"),
                    original: 'Change Cell to Code'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey), notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED.toNegated()),
                    primary: 55 /* KeyCode.KeyY */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                }
            });
        }
        async runWithContext(accessor, context) {
            await (0, cellOperations_1.changeCellToKind)(notebookCommon_1.CellKind.Code, context);
        }
    });
    (0, actions_1.registerAction2)(class ChangeCellToMarkdownAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: CHANGE_CELL_TO_MARKDOWN_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.changeCellToMarkdown', "Change Cell to Markdown"),
                    original: 'Change Cell to Markdown'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey), notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED.toNegated()),
                    primary: 43 /* KeyCode.KeyM */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('code')),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('code')),
                    group: "3_edit" /* CellOverflowToolbarGroups.Edit */,
                }
            });
        }
        async runWithContext(accessor, context) {
            await (0, cellOperations_1.changeCellToKind)(notebookCommon_1.CellKind.Markup, context, 'markdown', mime_1.Mimes.markdown);
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
    (0, actions_1.registerAction2)(class CollapseCellInputAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: COLLAPSE_CELL_INPUT_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.collapseCellInput', "Collapse Cell Input"),
                    original: 'Collapse Cell Input'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookContextKeys_1.NOTEBOOK_CELL_INPUT_COLLAPSED.toNegated(), contextkeys_1.InputFocusedContext.toNegated()),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
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
    (0, actions_1.registerAction2)(class ExpandCellInputAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.EXPAND_CELL_INPUT_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.expandCellInput', "Expand Cell Input"),
                    original: 'Expand Cell Input'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookContextKeys_1.NOTEBOOK_CELL_INPUT_COLLAPSED),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
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
    (0, actions_1.registerAction2)(class CollapseCellOutputAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: COLLAPSE_CELL_OUTPUT_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.collapseCellOutput', "Collapse Cell Output"),
                    original: 'Collapse Cell Output'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookContextKeys_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED.toNegated(), contextkeys_1.InputFocusedContext.toNegated(), notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 50 /* KeyCode.KeyT */),
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
    (0, actions_1.registerAction2)(class ExpandCellOuputAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.EXPAND_CELL_OUTPUT_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.expandCellOutput', "Expand Cell Output"),
                    original: 'Expand Cell Output'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookContextKeys_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 50 /* KeyCode.KeyT */),
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
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: TOGGLE_CELL_OUTPUTS_COMMAND_ID,
                precondition: notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED,
                title: {
                    value: (0, nls_1.localize)('notebookActions.toggleOutputs', "Toggle Outputs"),
                    original: 'Toggle Outputs'
                },
                description: {
                    description: (0, nls_1.localize)('notebookActions.toggleOutputs', "Toggle Outputs"),
                    args: coreActions_1.cellExecutionArgs
                }
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
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
    (0, actions_1.registerAction2)(class CollapseAllCellInputsAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: COLLAPSE_ALL_CELL_INPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.collapseAllCellInput', "Collapse All Cell Inputs"),
                    original: 'Collapse All Cell Inputs'
                },
                f1: true,
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isInputCollapsed = true);
        }
    });
    (0, actions_1.registerAction2)(class ExpandAllCellInputsAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXPAND_ALL_CELL_INPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.expandAllCellInput', "Expand All Cell Inputs"),
                    original: 'Expand All Cell Inputs'
                },
                f1: true
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isInputCollapsed = false);
        }
    });
    (0, actions_1.registerAction2)(class CollapseAllCellOutputsAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: COLLAPSE_ALL_CELL_OUTPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.collapseAllCellOutput', "Collapse All Cell Outputs"),
                    original: 'Collapse All Cell Outputs'
                },
                f1: true,
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isOutputCollapsed = true);
        }
    });
    (0, actions_1.registerAction2)(class ExpandAllCellOutputsAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXPAND_ALL_CELL_OUTPUTS_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.expandAllCellOutput', "Expand All Cell Outputs"),
                    original: 'Expand All Cell Outputs'
                },
                f1: true
            });
        }
        async runWithContext(accessor, context) {
            forEachCell(context.notebookEditor, cell => cell.isOutputCollapsed = false);
        }
    });
    (0, actions_1.registerAction2)(class ToggleCellOutputScrolling extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: TOGGLE_CELL_OUTPUT_SCROLLING,
                title: {
                    value: (0, nls_1.localize)('notebookActions.toggleScrolling', "Toggle Scroll Cell Output"),
                    original: 'Toggle Scroll Cell Output'
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated(), notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 55 /* KeyCode.KeyY */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        toggleOutputScrolling(viewModel, globalScrollSetting, collapsed) {
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
            const globalScrolling = accessor.get(configuration_1.IConfigurationService).getValue(notebookCommon_1.NotebookSetting.outputScrolling);
            if (context.ui) {
                context.cell.outputsViewModels.forEach((viewModel) => {
                    this.toggleOutputScrolling(viewModel, globalScrolling, context.cell.isOutputCollapsed);
                });
                context.cell.isOutputCollapsed = false;
            }
            else {
                context.selectedCells.forEach(cell => {
                    cell.outputsViewModels.forEach((viewModel) => {
                        this.toggleOutputScrolling(viewModel, globalScrolling, cell.isOutputCollapsed);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2NlbGxDb21tYW5kcy9jZWxsQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFzQmhHLHlCQUF5QjtJQUN6QixNQUFNLHVCQUF1QixHQUFHLHNCQUFzQixDQUFDO0lBQ3ZELE1BQU0seUJBQXlCLEdBQUcsd0JBQXdCLENBQUM7SUFDM0QsTUFBTSx1QkFBdUIsR0FBRyxzQkFBc0IsQ0FBQztJQUN2RCxNQUFNLHlCQUF5QixHQUFHLHdCQUF3QixDQUFDO0lBRTNELElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsZ0NBQWtCO1FBQy9DO1lBQ0MsS0FBSyxDQUNKO2dCQUNDLEVBQUUsRUFBRSx1QkFBdUI7Z0JBQzNCLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsY0FBYyxDQUFDO29CQUM3RCxRQUFRLEVBQUUsY0FBYztpQkFDeEI7Z0JBQ0QsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dCQUN0QixVQUFVLEVBQUU7b0JBQ1gsT0FBTyxFQUFFLCtDQUE0QjtvQkFDckMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDZDQUF1QixFQUFFLGlDQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNsRixNQUFNLDZDQUFtQztpQkFDekM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGlCQUFpQjtvQkFDNUIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxFQUFFLEtBQUssQ0FBQztvQkFDeEUsS0FBSywrQ0FBZ0M7b0JBQ3JDLEtBQUssRUFBRSxFQUFFO2lCQUNUO2FBQ0QsQ0FBQyxDQUFDO1FBQ0ws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