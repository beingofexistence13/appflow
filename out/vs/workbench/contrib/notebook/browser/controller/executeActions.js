/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/resources", "vs/base/common/themables", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, iterator_1, resources_1, themables_1, language_1, nls_1, actions_1, configuration_1, contextkey_1, debug_1, inlineChatController_1, inlineChat_1, cellOperations_1, coreActions_1, notebookBrowser_1, icons, notebookCommon_1, notebookContextKeys_1, notebookEditorInput_1, notebookExecutionStateService_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.executeThisCellCondition = exports.executeCondition = void 0;
    const EXECUTE_NOTEBOOK_COMMAND_ID = 'notebook.execute';
    const CANCEL_NOTEBOOK_COMMAND_ID = 'notebook.cancelExecution';
    const INTERRUPT_NOTEBOOK_COMMAND_ID = 'notebook.interruptExecution';
    const CANCEL_CELL_COMMAND_ID = 'notebook.cell.cancelExecution';
    const EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID = 'notebook.cell.executeAndFocusContainer';
    const EXECUTE_CELL_SELECT_BELOW = 'notebook.cell.executeAndSelectBelow';
    const EXECUTE_CELL_INSERT_BELOW = 'notebook.cell.executeAndInsertBelow';
    const EXECUTE_CELL_AND_BELOW = 'notebook.cell.executeCellAndBelow';
    const EXECUTE_CELLS_ABOVE = 'notebook.cell.executeCellsAbove';
    const RENDER_ALL_MARKDOWN_CELLS = 'notebook.renderAllMarkdownCells';
    const REVEAL_RUNNING_CELL = 'notebook.revealRunningCell';
    const REVEAL_LAST_FAILED_CELL = 'notebook.revealLastFailedCell';
    // If this changes, update getCodeCellExecutionContextKeyService to match
    exports.executeCondition = contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('code'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_COUNT.key, 0), contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0), notebookContextKeys_1.NOTEBOOK_MISSING_KERNEL_EXTENSION));
    exports.executeThisCellCondition = contextkey_1.ContextKeyExpr.and(exports.executeCondition, notebookContextKeys_1.NOTEBOOK_CELL_EXECUTING.toNegated());
    function renderAllMarkdownCells(context) {
        for (let i = 0; i < context.notebookEditor.getLength(); i++) {
            const cell = context.notebookEditor.cellAt(i);
            if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'renderAllMarkdownCells');
            }
        }
    }
    async function runCell(editorGroupsService, context) {
        const group = editorGroupsService.activeGroup;
        if (group) {
            if (group.activeEditor) {
                group.pinEditor(group.activeEditor);
            }
        }
        if (context.ui && context.cell) {
            await context.notebookEditor.executeNotebookCells(iterator_1.Iterable.single(context.cell));
            if (context.autoReveal) {
                const cellIndex = context.notebookEditor.getCellIndex(context.cell);
                context.notebookEditor.revealCellRangeInView({ start: cellIndex, end: cellIndex + 1 });
            }
        }
        else if (context.selectedCells) {
            await context.notebookEditor.executeNotebookCells(context.selectedCells);
            const firstCell = context.selectedCells[0];
            if (firstCell && context.autoReveal) {
                const cellIndex = context.notebookEditor.getCellIndex(firstCell);
                context.notebookEditor.revealCellRangeInView({ start: cellIndex, end: cellIndex + 1 });
            }
        }
        let foundEditor = undefined;
        for (const [, codeEditor] of context.notebookEditor.codeEditors) {
            if ((0, resources_1.isEqual)(codeEditor.getModel()?.uri, (context.cell ?? context.selectedCells?.[0])?.uri)) {
                foundEditor = codeEditor;
                break;
            }
        }
        if (!foundEditor) {
            return;
        }
        const controller = inlineChatController_1.InlineChatController.get(foundEditor);
        if (!controller) {
            return;
        }
        controller.createSnapshot();
    }
    (0, actions_1.registerAction2)(class RenderAllMarkdownCellsAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: RENDER_ALL_MARKDOWN_CELLS,
                title: (0, nls_1.localize)('notebookActions.renderMarkdown', "Render All Markdown Cells"),
            });
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
        }
    });
    (0, actions_1.registerAction2)(class ExecuteNotebookAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: EXECUTE_NOTEBOOK_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.executeNotebook', "Run All"),
                icon: icons.executeAllIcon,
                description: {
                    description: (0, nls_1.localize)('notebookActions.executeNotebook', "Run All"),
                    args: [
                        {
                            name: 'uri',
                            description: 'The document uri'
                        }
                    ]
                },
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, coreActions_1.executeNotebookCondition, contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING.toNegated()), contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.ContextKeyExpr.and(coreActions_1.executeNotebookCondition, contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING.toNegated()), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated())?.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true))
                    }
                ]
            });
        }
        getEditorContextFromArgsOrActive(accessor, context) {
            return (0, coreActions_1.getContextFromUri)(accessor, context) ?? (0, coreActions_1.getContextFromActiveEditor)(accessor.get(editorService_1.IEditorService));
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).find(editor => editor.editor instanceof notebookEditorInput_1.NotebookEditorInput && editor.editor.viewType === context.notebookEditor.textModel.viewType && editor.editor.resource.toString() === context.notebookEditor.textModel.uri.toString());
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (editor) {
                const group = editorGroupService.getGroup(editor.groupId);
                group?.pinEditor(editor.editor);
            }
            return context.notebookEditor.executeNotebookCells();
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCell extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.EXECUTE_CELL_COMMAND_ID,
                precondition: exports.executeThisCellCondition,
                title: (0, nls_1.localize)('notebookActions.execute', "Execute Cell"),
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                    win: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                    },
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellExecutePrimary,
                    when: exports.executeThisCellCondition,
                    group: 'inline'
                },
                description: {
                    description: (0, nls_1.localize)('notebookActions.execute', "Execute Cell"),
                    args: coreActions_1.cellExecutionArgs
                },
                icon: icons.executeIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            await runCell(editorGroupsService, context);
        }
    });
    (0, actions_1.registerAction2)(class ExecuteAboveCells extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXECUTE_CELLS_ABOVE,
                precondition: exports.executeCondition,
                title: (0, nls_1.localize)('notebookActions.executeAbove', "Execute Above Cells"),
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellExecute,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, true))
                    },
                    {
                        id: actions_1.MenuId.NotebookCellTitle,
                        order: 1 /* CellToolbarOrder.ExecuteAboveCells */,
                        group: coreActions_1.CELL_TITLE_CELL_GROUP_ID,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, false))
                    }
                ],
                icon: icons.executeAboveIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            let endCellIdx = undefined;
            if (context.ui) {
                endCellIdx = context.notebookEditor.getCellIndex(context.cell);
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            else {
                endCellIdx = Math.min(...context.selectedCells.map(cell => context.notebookEditor.getCellIndex(cell)));
            }
            if (typeof endCellIdx === 'number') {
                const range = { start: 0, end: endCellIdx };
                const cells = context.notebookEditor.getCellsInRange(range);
                context.notebookEditor.executeNotebookCells(cells);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellAndBelow extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_AND_BELOW,
                precondition: exports.executeCondition,
                title: (0, nls_1.localize)('notebookActions.executeBelow', "Execute Cell and Below"),
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellExecute,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, true))
                    },
                    {
                        id: actions_1.MenuId.NotebookCellTitle,
                        order: 2 /* CellToolbarOrder.ExecuteCellAndBelow */,
                        group: coreActions_1.CELL_TITLE_CELL_GROUP_ID,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, false))
                    }
                ],
                icon: icons.executeBelowIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            let startCellIdx = undefined;
            if (context.ui) {
                startCellIdx = context.notebookEditor.getCellIndex(context.cell);
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            else {
                startCellIdx = Math.min(...context.selectedCells.map(cell => context.notebookEditor.getCellIndex(cell)));
            }
            if (typeof startCellIdx === 'number') {
                const range = { start: startCellIdx, end: context.notebookEditor.getLength() };
                const cells = context.notebookEditor.getCellsInRange(range);
                context.notebookEditor.executeNotebookCells(cells);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellFocusContainer extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID,
                precondition: exports.executeThisCellCondition,
                title: (0, nls_1.localize)('notebookActions.executeAndFocusContainer', "Execute Cell and Focus Container"),
                description: {
                    description: (0, nls_1.localize)('notebookActions.executeAndFocusContainer', "Execute Cell and Focus Container"),
                    args: coreActions_1.cellExecutionArgs
                },
                icon: icons.executeIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            else {
                const firstCell = context.selectedCells[0];
                if (firstCell) {
                    await context.notebookEditor.focusNotebookCell(firstCell, 'container', { skipReveal: true });
                }
            }
            await runCell(editorGroupsService, context);
        }
    });
    const cellCancelCondition = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals(notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'executing'), contextkey_1.ContextKeyExpr.equals(notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'pending'));
    (0, actions_1.registerAction2)(class CancelExecuteCell extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: CANCEL_CELL_COMMAND_ID,
                precondition: cellCancelCondition,
                title: (0, nls_1.localize)('notebookActions.cancel', "Stop Cell Execution"),
                icon: icons.stopIcon,
                menu: {
                    id: actions_1.MenuId.NotebookCellExecutePrimary,
                    when: cellCancelCondition,
                    group: 'inline'
                },
                description: {
                    description: (0, nls_1.localize)('notebookActions.cancel', "Stop Cell Execution"),
                    args: [
                        {
                            name: 'options',
                            description: 'The cell range options',
                            schema: {
                                'type': 'object',
                                'required': ['ranges'],
                                'properties': {
                                    'ranges': {
                                        'type': 'array',
                                        items: [
                                            {
                                                'type': 'object',
                                                'required': ['start', 'end'],
                                                'properties': {
                                                    'start': {
                                                        'type': 'number'
                                                    },
                                                    'end': {
                                                        'type': 'number'
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    'document': {
                                        'type': 'object',
                                        'description': 'The document uri',
                                    }
                                }
                            }
                        }
                    ]
                },
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
                return context.notebookEditor.cancelNotebookCells(iterator_1.Iterable.single(context.cell));
            }
            else {
                return context.notebookEditor.cancelNotebookCells(context.selectedCells);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellSelectBelow extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_SELECT_BELOW,
                precondition: contextkey_1.ContextKeyExpr.or(exports.executeThisCellCondition, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                title: (0, nls_1.localize)('notebookActions.executeAndSelectBelow', "Execute Notebook Cell and Select Below"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED.negate()),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const idx = context.notebookEditor.getCellIndex(context.cell);
            if (typeof idx !== 'number') {
                return;
            }
            const languageService = accessor.get(language_1.ILanguageService);
            const config = accessor.get(configuration_1.IConfigurationService);
            const scrollBehavior = config.getValue(notebookCommon_1.NotebookSetting.cellExecutionScroll);
            let focusOptions;
            if (scrollBehavior === 'none') {
                focusOptions = { skipReveal: true };
            }
            else {
                focusOptions = {
                    revealBehavior: scrollBehavior === 'fullCell' ? notebookBrowser_1.ScrollToRevealBehavior.fullCell : notebookBrowser_1.ScrollToRevealBehavior.firstLine
                };
            }
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                const nextCell = context.notebookEditor.cellAt(idx + 1);
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, EXECUTE_CELL_SELECT_BELOW);
                if (nextCell) {
                    await context.notebookEditor.focusNotebookCell(nextCell, 'container', focusOptions);
                }
                else {
                    const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, notebookCommon_1.CellKind.Markup, 'below');
                    if (newCell) {
                        await context.notebookEditor.focusNotebookCell(newCell, 'editor', focusOptions);
                    }
                }
                return;
            }
            else {
                const nextCell = context.notebookEditor.cellAt(idx + 1);
                if (nextCell) {
                    await context.notebookEditor.focusNotebookCell(nextCell, 'container', focusOptions);
                }
                else {
                    const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, notebookCommon_1.CellKind.Code, 'below');
                    if (newCell) {
                        await context.notebookEditor.focusNotebookCell(newCell, 'editor', focusOptions);
                    }
                }
                return runCell(editorGroupsService, context);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellInsertBelow extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_INSERT_BELOW,
                precondition: contextkey_1.ContextKeyExpr.or(exports.executeThisCellCondition, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                title: (0, nls_1.localize)('notebookActions.executeAndInsertBelow', "Execute Notebook Cell and Insert Below"),
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const idx = context.notebookEditor.getCellIndex(context.cell);
            const languageService = accessor.get(language_1.ILanguageService);
            const newFocusMode = context.cell.focusMode === notebookBrowser_1.CellFocusMode.Editor ? 'editor' : 'container';
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, context.cell.cellKind, 'below');
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, newFocusMode);
            }
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, EXECUTE_CELL_INSERT_BELOW);
            }
            else {
                runCell(editorGroupsService, context);
            }
        }
    });
    class CancelNotebook extends coreActions_1.NotebookAction {
        getEditorContextFromArgsOrActive(accessor, context) {
            return (0, coreActions_1.getContextFromUri)(accessor, context) ?? (0, coreActions_1.getContextFromActiveEditor)(accessor.get(editorService_1.IEditorService));
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.cancelNotebookCells();
        }
    }
    (0, actions_1.registerAction2)(class CancelAllNotebook extends CancelNotebook {
        constructor() {
            super({
                id: CANCEL_NOTEBOOK_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.cancelNotebook', "Stop Execution"),
                    original: 'Stop Execution'
                },
                icon: icons.stopIcon,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true))
                    }
                ]
            });
        }
    });
    (0, actions_1.registerAction2)(class InterruptNotebook extends CancelNotebook {
        constructor() {
            super({
                id: INTERRUPT_NOTEBOOK_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.interruptNotebook', "Interrupt"),
                    original: 'Interrupt'
                },
                precondition: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL),
                icon: icons.stopIcon,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL, contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.InteractiveToolbar,
                        group: 'navigation/execute'
                    }
                ]
            });
        }
    });
    (0, actions_1.registerAction2)(class RevealRunningCellAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: REVEAL_RUNNING_CELL,
                title: (0, nls_1.localize)('revealRunningCell', "Go to Running Cell"),
                tooltip: (0, nls_1.localize)('revealRunningCell', "Go to Running Cell"),
                shortTitle: (0, nls_1.localize)('revealRunningCellShort', "Go To"),
                precondition: notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL, contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 20
                    },
                    {
                        id: actions_1.MenuId.InteractiveToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL, contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive')),
                        group: 'navigation',
                        order: 10
                    }
                ],
                icon: themables_1.ThemeIcon.modify(icons.executingStateIcon, 'spin')
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
            const notebook = context.notebookEditor.textModel.uri;
            const executingCells = notebookExecutionStateService.getCellExecutionsForNotebook(notebook);
            if (executingCells[0]) {
                const topStackFrameCell = this.findCellAtTopFrame(accessor, notebook);
                const focusHandle = topStackFrameCell ?? executingCells[0].cellHandle;
                const cell = context.notebookEditor.getCellByHandle(focusHandle);
                if (cell) {
                    context.notebookEditor.focusNotebookCell(cell, 'container');
                }
            }
        }
        findCellAtTopFrame(accessor, notebook) {
            const debugService = accessor.get(debug_1.IDebugService);
            for (const session of debugService.getModel().getSessions()) {
                for (const thread of session.getAllThreads()) {
                    const sf = thread.getTopStackFrame();
                    if (sf) {
                        const parsed = notebookCommon_1.CellUri.parse(sf.source.uri);
                        if (parsed && parsed.notebook.toString() === notebook.toString()) {
                            return parsed.handle;
                        }
                    }
                }
            }
            return undefined;
        }
    });
    (0, actions_1.registerAction2)(class RevealLastFailedCellAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: REVEAL_LAST_FAILED_CELL,
                title: (0, nls_1.localize)('revealLastFailedCell', "Go to Most Recently Failed Cell"),
                tooltip: (0, nls_1.localize)('revealLastFailedCell', "Go to Most Recently Failed Cell"),
                shortTitle: (0, nls_1.localize)('revealLastFailedCellShort', "Go To"),
                precondition: notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL.toNegated(), contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 20
                    },
                ],
                icon: icons.errorStateIcon,
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
            const notebook = context.notebookEditor.textModel.uri;
            const lastFailedCellHandle = notebookExecutionStateService.getLastFailedCellForNotebook(notebook);
            if (lastFailedCellHandle !== undefined) {
                const lastFailedCell = context.notebookEditor.getCellByHandle(lastFailedCellHandle);
                if (lastFailedCell) {
                    context.notebookEditor.focusNotebookCell(lastFailedCell, 'container');
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0ZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvZXhlY3V0ZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkJoRyxNQUFNLDJCQUEyQixHQUFHLGtCQUFrQixDQUFDO0lBQ3ZELE1BQU0sMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7SUFDOUQsTUFBTSw2QkFBNkIsR0FBRyw2QkFBNkIsQ0FBQztJQUNwRSxNQUFNLHNCQUFzQixHQUFHLCtCQUErQixDQUFDO0lBQy9ELE1BQU0sdUNBQXVDLEdBQUcsd0NBQXdDLENBQUM7SUFDekYsTUFBTSx5QkFBeUIsR0FBRyxxQ0FBcUMsQ0FBQztJQUN4RSxNQUFNLHlCQUF5QixHQUFHLHFDQUFxQyxDQUFDO0lBQ3hFLE1BQU0sc0JBQXNCLEdBQUcsbUNBQW1DLENBQUM7SUFDbkUsTUFBTSxtQkFBbUIsR0FBRyxpQ0FBaUMsQ0FBQztJQUM5RCxNQUFNLHlCQUF5QixHQUFHLGlDQUFpQyxDQUFDO0lBQ3BFLE1BQU0sbUJBQW1CLEdBQUcsNEJBQTRCLENBQUM7SUFDekQsTUFBTSx1QkFBdUIsR0FBRywrQkFBK0IsQ0FBQztJQUVoRSx5RUFBeUU7SUFDNUQsUUFBQSxnQkFBZ0IsR0FBRywyQkFBYyxDQUFDLEdBQUcsQ0FDakQsd0NBQWtCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUNwQywyQkFBYyxDQUFDLEVBQUUsQ0FDaEIsMkJBQWMsQ0FBQyxPQUFPLENBQUMsMkNBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUNwRCwyQkFBYyxDQUFDLE9BQU8sQ0FBQyxrREFBNEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQzNELHVEQUFpQyxDQUNqQyxDQUFDLENBQUM7SUFFUyxRQUFBLHdC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