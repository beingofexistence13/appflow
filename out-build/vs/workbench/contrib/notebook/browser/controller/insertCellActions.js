/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/notebook/browser/controller/insertCellActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, codicons_1, language_1, nls_1, actions_1, contextkey_1, contextkeys_1, cellOperations_1, coreActions_1, notebookContextKeys_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const INSERT_CODE_CELL_ABOVE_COMMAND_ID = 'notebook.cell.insertCodeCellAbove';
    const INSERT_CODE_CELL_BELOW_COMMAND_ID = 'notebook.cell.insertCodeCellBelow';
    const INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID = 'notebook.cell.insertCodeCellAboveAndFocusContainer';
    const INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID = 'notebook.cell.insertCodeCellBelowAndFocusContainer';
    const INSERT_CODE_CELL_AT_TOP_COMMAND_ID = 'notebook.cell.insertCodeCellAtTop';
    const INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID = 'notebook.cell.insertMarkdownCellAbove';
    const INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID = 'notebook.cell.insertMarkdownCellBelow';
    const INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID = 'notebook.cell.insertMarkdownCellAtTop';
    class InsertCellCommand extends coreActions_1.$bpb {
        constructor(desc, a, b, d) {
            super(desc);
            this.a = a;
            this.b = b;
            this.d = d;
        }
        async runWithContext(accessor, context) {
            let newCell = null;
            if (context.ui) {
                context.notebookEditor.focus();
            }
            const languageService = accessor.get(language_1.$ct);
            if (context.cell) {
                const idx = context.notebookEditor.getCellIndex(context.cell);
                newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, idx, this.a, this.b, undefined, true);
            }
            else {
                const focusRange = context.notebookEditor.getFocus();
                const next = Math.max(focusRange.end - 1, 0);
                newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, next, this.a, this.b, undefined, true);
            }
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, this.d ? 'editor' : 'container');
            }
        }
    }
    (0, actions_1.$Xu)(class InsertCodeCellAboveAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(0, null),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, contextkeys_1.$93.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellInsert,
                    order: 0
                }
            }, notebookCommon_1.CellKind.Code, 'above', true);
        }
    });
    (0, actions_1.$Xu)(class InsertCodeCellAboveAndFocusContainerAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID,
                title: (0, nls_1.localize)(1, null)
            }, notebookCommon_1.CellKind.Code, 'above', false);
        }
    });
    (0, actions_1.$Xu)(class InsertCodeCellBelowAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)(2, null),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Znb, contextkeys_1.$93.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.$Ru.NotebookCellInsert,
                    order: 1
                }
            }, notebookCommon_1.CellKind.Code, 'below', true);
        }
    });
    (0, actions_1.$Xu)(class InsertCodeCellBelowAndFocusContainerAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID,
                title: (0, nls_1.localize)(3, null),
            }, notebookCommon_1.CellKind.Code, 'below', false);
        }
    });
    (0, actions_1.$Xu)(class InsertMarkdownCellAboveAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(4, null),
                menu: {
                    id: actions_1.$Ru.NotebookCellInsert,
                    order: 2
                }
            }, notebookCommon_1.CellKind.Markup, 'above', true);
        }
    });
    (0, actions_1.$Xu)(class InsertMarkdownCellBelowAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)(5, null),
                menu: {
                    id: actions_1.$Ru.NotebookCellInsert,
                    order: 3
                }
            }, notebookCommon_1.CellKind.Markup, 'below', true);
        }
    });
    (0, actions_1.$Xu)(class InsertCodeCellAtTopAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)(6, null),
                f1: false
            });
        }
        async run(accessor, context) {
            context = context ?? this.getEditorContextFromArgsOrActive(accessor);
            if (context) {
                this.runWithContext(accessor, context);
            }
        }
        async runWithContext(accessor, context) {
            const languageService = accessor.get(language_1.$ct);
            const newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Code, 'above', undefined, true);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    (0, actions_1.$Xu)(class InsertMarkdownCellAtTopAction extends coreActions_1.$bpb {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)(7, null),
                f1: false
            });
        }
        async run(accessor, context) {
            context = context ?? this.getEditorContextFromArgsOrActive(accessor);
            if (context) {
                this.runWithContext(accessor, context);
            }
        }
        async runWithContext(accessor, context) {
            const languageService = accessor.get(language_1.$ct);
            const newCell = (0, cellOperations_1.$5pb)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Markup, 'above', undefined, true);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)(8, null),
            tooltip: (0, nls_1.localize)(9, null)
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: (0, nls_1.localize)(10, null),
            icon: codicons_1.$Pj.add,
            tooltip: (0, nls_1.localize)(11, null)
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.equals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookToolbar, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            icon: codicons_1.$Pj.add,
            title: (0, nls_1.localize)(12, null),
            tooltip: (0, nls_1.localize)(13, null)
        },
        order: -5,
        group: 'navigation/add',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.$Ii.notEquals('config.notebook.insertToolbarLocation', 'hidden'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)(14, null),
            tooltip: (0, nls_1.localize)(15, null)
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: (0, nls_1.localize)(16, null),
            icon: codicons_1.$Pj.add,
            tooltip: (0, nls_1.localize)(17, null)
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.equals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellBetween, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)(18, null),
            tooltip: (0, nls_1.localize)(19, null)
        },
        order: 1,
        group: 'inline',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookToolbar, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            icon: codicons_1.$Pj.add,
            title: (0, nls_1.localize)(20, null),
            tooltip: (0, nls_1.localize)(21, null)
        },
        order: -5,
        group: 'navigation/add',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.$Ii.notEquals('config.notebook.insertToolbarLocation', 'hidden'), contextkey_1.$Ii.notEquals(`config.${notebookCommon_1.$7H.globalToolbarShowLabel}`, false), contextkey_1.$Ii.notEquals(`config.${notebookCommon_1.$7H.globalToolbarShowLabel}`, 'never'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NotebookCellListTop, {
        command: {
            id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)(22, null),
            tooltip: (0, nls_1.localize)(23, null)
        },
        order: 1,
        group: 'inline',
        when: contextkey_1.$Ii.and(notebookContextKeys_1.$3nb.isEqualTo(true), contextkey_1.$Ii.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
});
//# sourceMappingURL=insertCellActions.js.map