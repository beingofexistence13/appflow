/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/resources", "vs/base/common/themables", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/notebook/browser/controller/executeActions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, iterator_1, resources_1, themables_1, language_1, nls_1, actions_1, configuration_1, contextkey_1, debug_1, inlineChatController_1, inlineChat_1, cellOperations_1, coreActions_1, notebookBrowser_1, icons, notebookCommon_1, notebookContextKeys_1, notebookEditorInput_1, notebookExecutionStateService_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Eb = exports.$0Eb = void 0;
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
    exports.$0Eb = contextkey_1.$Ii.and(notebookContextKeys_1.$_nb.isEqualTo('code'), contextkey_1.$Ii.or(contextkey_1.$Ii.greater(notebookContextKeys_1.$mob.key, 0), contextkey_1.$Ii.greater(notebookContextKeys_1.$nob.key, 0), notebookContextKeys_1.$qob));
    exports.$$Eb = contextkey_1.$Ii.and(exports.$0Eb, notebookContextKeys_1.$gob.toNegated());
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
            if ((0, resources_1.$bg)(codeEditor.getModel()?.uri, (context.cell ?? context.selectedCells?.[0])?.uri)) {
                foundEditor = codeEditor;
                break;
            }
        }
        if (!foundEditor) {
            return;
        }
        const controller = inlineChatController_1.$Qqb.get(foundEditor);
        if (!controller) {
            return;
        }
        controller.createSnapshot();
    }
    (0, actions_1.$Xu)(class RenderAllMarkdownCellsAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: RENDER_ALL_MARKDOWN_CELLS,
                title: (0, nls_1.localize)(0, null),
            });
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
        }
    });
    (0, actions_1.$Xu)(class ExecuteNotebookAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: EXECUTE_NOTEBOOK_COMMAND_ID,
                title: (0, nls_1.localize)(1, null),
                icon: icons.$zpb,
                description: {
                    description: (0, nls_1.localize)(2, null),
                    args: [
                        {
                            name: 'uri',
                            description: 'The document uri'
                        }
                    ]
                },
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, coreActions_1.$epb, contextkey_1.$Ii.or(notebookContextKeys_1.$pob.toNegated(), notebookContextKeys_1.$5nb.toNegated()), contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.$Ii.and(coreActions_1.$epb, contextkey_1.$Ii.or(notebookContextKeys_1.$pob.toNegated(), notebookContextKeys_1.$5nb.toNegated()), contextkey_1.$Ii.and(notebookContextKeys_1.$5nb, notebookContextKeys_1.$pob.toNegated())?.negate(), contextkey_1.$Ii.equals('config.notebook.globalToolbar', true))
                    }
                ]
            });
        }
        getEditorContextFromArgsOrActive(accessor, context) {
            return (0, coreActions_1.$_ob)(accessor, context) ?? (0, coreActions_1.$$ob)(accessor.get(editorService_1.$9C));
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
            const editorService = accessor.get(editorService_1.$9C);
            const editor = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).find(editor => editor.editor instanceof notebookEditorInput_1.$zbb && editor.editor.viewType === context.notebookEditor.textModel.viewType && editor.editor.resource.toString() === context.notebookEditor.textModel.uri.toString());
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            if (editor) {
                const group = editorGroupService.getGroup(editor.groupId);
                group?.pinEditor(editor.editor);
            }
            return context.notebookEditor.executeNotebookCells();
        }
    });
    (0, actions_1.$Xu)(class ExecuteCell extends coreActions_1.$cpb {
        constructor() {
            super({
                id: notebookBrowser_1.$Qbb,
                precondition: exports.$$Eb,
                title: (0, nls_1.localize)(3, null),
                keybinding: {
                    when: notebookContextKeys_1.$Znb,
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                    win: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                    },
                    weight: coreActions_1.$0ob
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellExecutePrimary,
                    when: exports.$$Eb,
                    group: 'inline'
                },
                description: {
                    description: (0, nls_1.localize)(4, null),
                    args: coreActions_1.$hpb
                },
                icon: icons.$upb
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            await runCell(editorGroupsService, context);
        }
    });
    (0, actions_1.$Xu)(class ExecuteAboveCells extends coreActions_1.$cpb {
        constructor() {
            super({
                id: EXECUTE_CELLS_ABOVE,
                precondition: exports.$0Eb,
                title: (0, nls_1.localize)(5, null),
                menu: [
                    {
                        id: actions_1.$Ru.NotebookCellExecute,
                        when: contextkey_1.$Ii.and(exports.$0Eb, contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.consolidatedRunButton}`, true))
                    },
                    {
                        id: actions_1.$Ru.NotebookCellTitle,
                        order: 1 /* CellToolbarOrder.ExecuteAboveCells */,
                        group: coreActions_1.$8ob,
                        when: contextkey_1.$Ii.and(exports.$0Eb, contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.consolidatedRunButton}`, false))
                    }
                ],
                icon: icons.$vpb
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
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
    (0, actions_1.$Xu)(class ExecuteCellAndBelow extends coreActions_1.$cpb {
        constructor() {
            super({
                id: EXECUTE_CELL_AND_BELOW,
                precondition: exports.$0Eb,
                title: (0, nls_1.localize)(6, null),
                menu: [
                    {
                        id: actions_1.$Ru.NotebookCellExecute,
                        when: contextkey_1.$Ii.and(exports.$0Eb, contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.consolidatedRunButton}`, true))
                    },
                    {
                        id: actions_1.$Ru.NotebookCellTitle,
                        order: 2 /* CellToolbarOrder.ExecuteCellAndBelow */,
                        group: coreActions_1.$8ob,
                        when: contextkey_1.$Ii.and(exports.$0Eb, contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.consolidatedRunButton}`, false))
                    }
                ],
                icon: icons.$wpb
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
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
    (0, actions_1.$Xu)(class ExecuteCellFocusContainer extends coreActions_1.$cpb {
        constructor() {
            super({
                id: EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID,
                precondition: exports.$$Eb,
                title: (0, nls_1.localize)(7, null),
                description: {
                    description: (0, nls_1.localize)(8, null),
                    args: coreActions_1.$hpb
                },
                icon: icons.$upb
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.$gpb)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
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
    const cellCancelCondition = contextkey_1.$Ii.or(contextkey_1.$Ii.equals(notebookContextKeys_1.$fob.key, 'executing'), contextkey_1.$Ii.equals(notebookContextKeys_1.$fob.key, 'pending'));
    (0, actions_1.$Xu)(class CancelExecuteCell extends coreActions_1.$cpb {
        constructor() {
            super({
                id: CANCEL_CELL_COMMAND_ID,
                precondition: cellCancelCondition,
                title: (0, nls_1.localize)(9, null),
                icon: icons.$xpb,
                menu: {
                    id: actions_1.$Ru.NotebookCellExecutePrimary,
                    when: cellCancelCondition,
                    group: 'inline'
                },
                description: {
                    description: (0, nls_1.localize)(10, null),
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
            return (0, coreActions_1.$gpb)(accessor, ...args);
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
    (0, actions_1.$Xu)(class ExecuteCellSelectBelow extends coreActions_1.$dpb {
        constructor() {
            super({
                id: EXECUTE_CELL_SELECT_BELOW,
                precondition: contextkey_1.$Ii.or(exports.$$Eb, notebookContextKeys_1.$_nb.isEqualTo('markup')),
                title: (0, nls_1.localize)(11, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, inlineChat_1.$iz.negate()),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: coreActions_1.$0ob
                },
            });
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            const idx = context.notebookEditor.getCellIndex(context.cell);
            if (typeof idx !== 'number') {
                return;
            }
            const languageService = accessor.get(language_1.$ct);
            const config = accessor.get(configuration_1.$8h);
            const scrollBehavior = config.getValue(notebookCommon_1.$7H.cellExecutionScroll);
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
                    const newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, idx, notebookCommon_1.CellKind.Markup, 'below');
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
                    const newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, idx, notebookCommon_1.CellKind.Code, 'below');
                    if (newCell) {
                        await context.notebookEditor.focusNotebookCell(newCell, 'editor', focusOptions);
                    }
                }
                return runCell(editorGroupsService, context);
            }
        }
    });
    (0, actions_1.$Xu)(class ExecuteCellInsertBelow extends coreActions_1.$dpb {
        constructor() {
            super({
                id: EXECUTE_CELL_INSERT_BELOW,
                precondition: contextkey_1.$Ii.or(exports.$$Eb, notebookContextKeys_1.$_nb.isEqualTo('markup')),
                title: (0, nls_1.localize)(12, null),
                keybinding: {
                    when: notebookContextKeys_1.$Znb,
                    primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                    weight: coreActions_1.$0ob
                },
            });
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.$5C);
            const idx = context.notebookEditor.getCellIndex(context.cell);
            const languageService = accessor.get(language_1.$ct);
            const newFocusMode = context.cell.focusMode === notebookBrowser_1.CellFocusMode.Editor ? 'editor' : 'container';
            const newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, idx, context.cell.cellKind, 'below');
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
    class CancelNotebook extends coreActions_1.$bpb {
        getEditorContextFromArgsOrActive(accessor, context) {
            return (0, coreActions_1.$_ob)(accessor, context) ?? (0, coreActions_1.$$ob)(accessor.get(editorService_1.$9C));
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.cancelNotebookCells();
        }
    }
    (0, actions_1.$Xu)(class CancelAllNotebook extends CancelNotebook {
        constructor() {
            super({
                id: CANCEL_NOTEBOOK_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(13, null),
                    original: 'Stop Execution'
                },
                icon: icons.$xpb,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$5nb, notebookContextKeys_1.$pob.toNegated(), contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$5nb, notebookContextKeys_1.$pob.toNegated(), contextkey_1.$Ii.equals('config.notebook.globalToolbar', true))
                    }
                ]
            });
        }
    });
    (0, actions_1.$Xu)(class InterruptNotebook extends CancelNotebook {
        constructor() {
            super({
                id: INTERRUPT_NOTEBOOK_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)(14, null),
                    original: 'Interrupt'
                },
                precondition: contextkey_1.$Ii.and(notebookContextKeys_1.$5nb, notebookContextKeys_1.$pob),
                icon: icons.$xpb,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$5nb, notebookContextKeys_1.$pob, contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$5nb, notebookContextKeys_1.$pob, contextkey_1.$Ii.equals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.$Ru.InteractiveToolbar,
                        group: 'navigation/execute'
                    }
                ]
            });
        }
    });
    (0, actions_1.$Xu)(class RevealRunningCellAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: REVEAL_RUNNING_CELL,
                title: (0, nls_1.localize)(15, null),
                tooltip: (0, nls_1.localize)(16, null),
                shortTitle: (0, nls_1.localize)(17, null),
                precondition: notebookContextKeys_1.$4nb,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$4nb, contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$4nb, contextkey_1.$Ii.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 20
                    },
                    {
                        id: actions_1.$Ru.InteractiveToolbar,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$4nb, contextkey_1.$Ii.equals('activeEditor', 'workbench.editor.interactive')),
                        group: 'navigation',
                        order: 10
                    }
                ],
                icon: themables_1.ThemeIcon.modify(icons.$Jpb, 'spin')
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.$_H);
            const notebook = context.notebookEditor.textModel.uri;
            const executingCells = notebookExecutionStateService.getCellExecutionsForNotebook(notebook);
            if (executingCells[0]) {
                const topStackFrameCell = this.a(accessor, notebook);
                const focusHandle = topStackFrameCell ?? executingCells[0].cellHandle;
                const cell = context.notebookEditor.getCellByHandle(focusHandle);
                if (cell) {
                    context.notebookEditor.focusNotebookCell(cell, 'container');
                }
            }
        }
        a(accessor, notebook) {
            const debugService = accessor.get(debug_1.$nH);
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
    (0, actions_1.$Xu)(class RevealLastFailedCellAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: REVEAL_LAST_FAILED_CELL,
                title: (0, nls_1.localize)(18, null),
                tooltip: (0, nls_1.localize)(19, null),
                shortTitle: (0, nls_1.localize)(20, null),
                precondition: notebookContextKeys_1.$0nb,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$0nb, notebookContextKeys_1.$4nb.toNegated(), contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.$Ru.NotebookToolbar,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, notebookContextKeys_1.$0nb, notebookContextKeys_1.$4nb.toNegated(), contextkey_1.$Ii.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 20
                    },
                ],
                icon: icons.$Hpb,
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.$_H);
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
//# sourceMappingURL=executeActions.js.map