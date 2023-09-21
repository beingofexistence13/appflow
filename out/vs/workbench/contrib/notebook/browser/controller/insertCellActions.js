/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, codicons_1, language_1, nls_1, actions_1, contextkey_1, contextkeys_1, cellOperations_1, coreActions_1, notebookContextKeys_1, notebookCommon_1) {
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
    class InsertCellCommand extends coreActions_1.NotebookAction {
        constructor(desc, kind, direction, focusEditor) {
            super(desc);
            this.kind = kind;
            this.direction = direction;
            this.focusEditor = focusEditor;
        }
        async runWithContext(accessor, context) {
            let newCell = null;
            if (context.ui) {
                context.notebookEditor.focus();
            }
            const languageService = accessor.get(language_1.ILanguageService);
            if (context.cell) {
                const idx = context.notebookEditor.getCellIndex(context.cell);
                newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, this.kind, this.direction, undefined, true);
            }
            else {
                const focusRange = context.notebookEditor.getFocus();
                const next = Math.max(focusRange.end - 1, 0);
                newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, next, this.kind, this.direction, undefined, true);
            }
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, this.focusEditor ? 'editor' : 'container');
            }
        }
    }
    (0, actions_1.registerAction2)(class InsertCodeCellAboveAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellAbove', "Insert Code Cell Above"),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 0
                }
            }, notebookCommon_1.CellKind.Code, 'above', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellAboveAndFocusContainerAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellAboveAndFocusContainer', "Insert Code Cell Above and Focus Container")
            }, notebookCommon_1.CellKind.Code, 'above', false);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellBelowAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellBelow', "Insert Code Cell Below"),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 1
                }
            }, notebookCommon_1.CellKind.Code, 'below', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellBelowAndFocusContainerAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellBelowAndFocusContainer', "Insert Code Cell Below and Focus Container"),
            }, notebookCommon_1.CellKind.Code, 'below', false);
        }
    });
    (0, actions_1.registerAction2)(class InsertMarkdownCellAboveAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertMarkdownCellAbove', "Insert Markdown Cell Above"),
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 2
                }
            }, notebookCommon_1.CellKind.Markup, 'above', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertMarkdownCellBelowAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertMarkdownCellBelow', "Insert Markdown Cell Below"),
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 3
                }
            }, notebookCommon_1.CellKind.Markup, 'below', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellAtTopAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellAtTop', "Add Code Cell At Top"),
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
            const languageService = accessor.get(language_1.ILanguageService);
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Code, 'above', undefined, true);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    (0, actions_1.registerAction2)(class InsertMarkdownCellAtTopAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertMarkdownCellAtTop', "Add Markdown Cell At Top"),
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
            const languageService = accessor.get(language_1.ILanguageService);
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Markup, 'above', undefined, true);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertCode', "Code"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.minimalToolbar', "Add Code"),
            icon: codicons_1.Codicon.add,
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.equals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookToolbar, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            icon: codicons_1.Codicon.add,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.ontoolbar', "Code"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: -5,
        group: 'navigation/add',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'hidden'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertCode', "Code"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.minimaltoolbar', "Add Code"),
            icon: codicons_1.Codicon.add,
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.equals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertMarkdown', "Markdown"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.tooltip', "Add Markdown Cell")
        },
        order: 1,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookToolbar, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            icon: codicons_1.Codicon.add,
            title: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.ontoolbar', "Markdown"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.tooltip', "Add Markdown Cell")
        },
        order: -5,
        group: 'navigation/add',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'hidden'), contextkey_1.ContextKeyExpr.notEquals(`config.${notebookCommon_1.NotebookSetting.globalToolbarShowLabel}`, false), contextkey_1.ContextKeyExpr.notEquals(`config.${notebookCommon_1.NotebookSetting.globalToolbarShowLabel}`, 'never'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertMarkdown', "Markdown"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.tooltip', "Add Markdown Cell")
        },
        order: 1,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXJ0Q2VsbEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvaW5zZXJ0Q2VsbEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQmhHLE1BQU0saUNBQWlDLEdBQUcsbUNBQW1DLENBQUM7SUFDOUUsTUFBTSxpQ0FBaUMsR0FBRyxtQ0FBbUMsQ0FBQztJQUM5RSxNQUFNLHFEQUFxRCxHQUFHLG9EQUFvRCxDQUFDO0lBQ25ILE1BQU0scURBQXFELEdBQUcsb0RBQW9ELENBQUM7SUFDbkgsTUFBTSxrQ0FBa0MsR0FBRyxtQ0FBbUMsQ0FBQztJQUMvRSxNQUFNLHFDQUFxQyxHQUFHLHVDQUF1QyxDQUFDO0lBQ3RGLE1BQU0scUNBQXFDLEdBQUcsdUNBQXVDLENBQUM7SUFDdEYsTUFBTSxzQ0FBc0MsR0FBRyx1Q0FBdUMsQ0FBQztJQUV2RixNQUFlLGlCQUFrQixTQUFRLDRCQUFjO1FBQ3RELFlBQ0MsSUFBK0IsRUFDdkIsSUFBYyxFQUNkLFNBQTRCLEVBQzVCLFdBQW9CO1lBRTVCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUpKLFNBQUksR0FBSixJQUFJLENBQVU7WUFDZCxjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUc3QixDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUEwQixFQUFFLE9BQStCO1lBQy9FLElBQUksT0FBTyxHQUF5QixJQUFJLENBQUM7WUFDekMsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDL0I7WUFFRCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDdkQsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNqQixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlELE9BQU8sR0FBRyxJQUFBLDJCQUFVLEVBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDL0c7aUJBQU07Z0JBQ04sTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDckQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0MsT0FBTyxHQUFHLElBQUEsMkJBQVUsRUFBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNoSDtZQUVELElBQUksT0FBTyxFQUFFO2dCQUNaLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNuRztRQUNGLENBQUM7S0FDRDtJQUVELElBQUEseUJBQWUsRUFBQyxNQUFNLHlCQUEwQixTQUFRLGlCQUFpQjtRQUN4RTtZQUNDLEtBQUssQ0FDSjtnQkFDQyxFQUFFLEVBQUUsaUNBQWlDO2dCQUNyQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMscUNBQXFDLEVBQUUsd0JBQXdCLENBQUM7Z0JBQ2hGLFVBQVUsRUFBRTtvQkFDWCxPQUFPLEVBQUUsbURBQTZCLHdCQUFnQjtvQkFDdEQsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGdEQUEwQixFQUFFLGlDQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNyRixNQUFNLDZDQUFtQztpQkFDekM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGtCQUFrQjtvQkFDN0IsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxFQUNELHlCQUFRLENBQUMsSUFBSSxFQUNiLE9BQU8sRUFDUCxJQUFJLENBQUMsQ0FBQztRQUNSLENBQUM7S0FDRCxDQUFDLENBQUM7SUFJSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSwwQ0FBMkMsU0FBUSxpQkFBaUI7UUFDekY7WUFDQyxLQUFLLENBQ0o7Z0JBQ0MsRUFBRSxFQUFFLHFEQUFxRDtnQkFDekQsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHNEQUFzRCxFQUFFLDRDQUE0QyxDQUFDO2FBQ3JILEVBQ0QseUJBQVEsQ0FBQyxJQUFJLEVBQ2IsT0FBTyxFQUNQLEtBQUssQ0FBQyxDQUFDO1FBQ1QsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLHlCQUEwQixTQUFRLGlCQUFpQjtRQUN4RTtZQUNDLEtBQUssQ0FDSjtnQkFDQyxFQUFFLEVBQUUsaUNBQWlDO2dCQUNyQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMscUNBQXFDLEVBQUUsd0JBQXdCLENBQUM7Z0JBQ2hGLFVBQVUsRUFBRTtvQkFDWCxPQUFPLEVBQUUsaURBQThCO29CQUN2QyxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsZ0RBQTBCLEVBQUUsaUNBQW1CLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3JGLE1BQU0sNkNBQW1DO2lCQUN6QztnQkFDRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsa0JBQWtCO29CQUM3QixLQUFLLEVBQUUsQ0FBQztpQkFDUjthQUNELEVBQ0QseUJBQVEsQ0FBQyxJQUFJLEVBQ2IsT0FBTyxFQUNQLElBQUksQ0FBQyxDQUFDO1FBQ1IsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLDBDQUEyQyxTQUFRLGlCQUFpQjtRQUN6RjtZQUNDLEtBQUssQ0FDSjtnQkFDQyxFQUFFLEVBQUUscURBQXFEO2dCQUN6RCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0RBQXNELEVBQUUsNENBQTRDLENBQUM7YUFDckgsRUFDRCx5QkFBUSxDQUFDLElBQUksRUFDYixPQUFPLEVBQ1AsS0FBSyxDQUFDLENBQUM7UUFDVCxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBR0gsSUFBQSx5QkFBZSxFQUFDLE1BQU0sNkJBQThCLFNBQVEsaUJBQWlCO1FBQzVFO1lBQ0MsS0FBSyxDQUNKO2dCQUNDLEVBQUUsRUFBRSxxQ0FBcUM7Z0JBQ3pDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5Q0FBeUMsRUFBRSw0QkFBNEIsQ0FBQztnQkFDeEYsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGtCQUFrQjtvQkFDN0IsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxFQUNELHlCQUFRLENBQUMsTUFBTSxFQUNmLE9BQU8sRUFDUCxJQUFJLENBQUMsQ0FBQztRQUNSLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSw2QkFBOEIsU0FBUSxpQkFBaUI7UUFDNUU7WUFDQyxLQUFLLENBQ0o7Z0JBQ0MsRUFBRSxFQUFFLHFDQUFxQztnQkFDekMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLDRCQUE0QixDQUFDO2dCQUN4RixJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsa0JBQWtCO29CQUM3QixLQUFLLEVBQUUsQ0FBQztpQkFDUjthQUNELEVBQ0QseUJBQVEsQ0FBQyxNQUFNLEVBQ2YsT0FBTyxFQUNQLElBQUksQ0FBQyxDQUFDO1FBQ1IsQ0FBQztLQUNELENBQUMsQ0FBQztJQUdILElBQUEseUJBQWUsRUFBQyxNQUFNLHlCQUEwQixTQUFRLDRCQUFjO1FBQ3JFO1lBQ0MsS0FBSyxDQUNKO2dCQUNDLEVBQUUsRUFBRSxrQ0FBa0M7Z0JBQ3RDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxxQ0FBcUMsRUFBRSxzQkFBc0IsQ0FBQztnQkFDOUUsRUFBRSxFQUFFLEtBQUs7YUFDVCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE9BQWdDO1lBQzlFLE9BQU8sR0FBRyxPQUFPLElBQUksSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JFLElBQUksT0FBTyxFQUFFO2dCQUNaLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBMEIsRUFBRSxPQUErQjtZQUMvRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDdkQsTUFBTSxPQUFPLEdBQUcsSUFBQSwyQkFBVSxFQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSx5QkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWhILElBQUksT0FBTyxFQUFFO2dCQUNaLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDbEU7UUFDRixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sNkJBQThCLFNBQVEsNEJBQWM7UUFDekU7WUFDQyxLQUFLLENBQ0o7Z0JBQ0MsRUFBRSxFQUFFLHNDQUFzQztnQkFDMUMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLDBCQUEwQixDQUFDO2dCQUN0RixFQUFFLEVBQUUsS0FBSzthQUNULENBQUMsQ0FBQztRQUNMLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsT0FBZ0M7WUFDOUUsT0FBTyxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckUsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDdkM7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUEwQixFQUFFLE9BQStCO1lBQy9FLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztZQUN2RCxNQUFNLE9BQU8sR0FBRyxJQUFBLDJCQUFVLEVBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLHlCQUFRLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbEgsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsRTtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLG1CQUFtQixFQUFFO1FBQ3ZELE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSxpQ0FBaUM7WUFDckMsS0FBSyxFQUFFLFNBQVMsR0FBRyxJQUFBLGNBQVEsRUFBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUM7WUFDdEUsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLGVBQWUsQ0FBQztTQUM3RTtRQUNELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLFFBQVE7UUFDZixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3ZCLDhDQUF3QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDeEMsMkJBQWMsQ0FBQyxTQUFTLENBQUMscURBQXFELEVBQUUsTUFBTSxDQUFDLENBQ3ZGO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsRUFBRTtRQUN2RCxPQUFPLEVBQUU7WUFDUixFQUFFLEVBQUUsaUNBQWlDO1lBQ3JDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnREFBZ0QsRUFBRSxVQUFVLENBQUM7WUFDN0UsSUFBSSxFQUFFLGtCQUFPLENBQUMsR0FBRztZQUNqQixPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMseUNBQXlDLEVBQUUsZUFBZSxDQUFDO1NBQzdFO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsUUFBUTtRQUNmLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FDdkIsOENBQXdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUN4QywyQkFBYyxDQUFDLE1BQU0sQ0FBQyxxREFBcUQsRUFBRSxNQUFNLENBQUMsQ0FDcEY7S0FDRCxDQUFDLENBQUM7SUFFSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGVBQWUsRUFBRTtRQUNuRCxPQUFPLEVBQUU7WUFDUixFQUFFLEVBQUUsaUNBQWlDO1lBQ3JDLElBQUksRUFBRSxrQkFBTyxDQUFDLEdBQUc7WUFDakIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJDQUEyQyxFQUFFLE1BQU0sQ0FBQztZQUNwRSxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMseUNBQXlDLEVBQUUsZUFBZSxDQUFDO1NBQzdFO1FBQ0QsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNULEtBQUssRUFBRSxnQkFBZ0I7UUFDdkIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUN2Qiw4Q0FBd0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ3hDLDJCQUFjLENBQUMsU0FBUyxDQUFDLHVDQUF1QyxFQUFFLGNBQWMsQ0FBQyxFQUNqRiwyQkFBYyxDQUFDLFNBQVMsQ0FBQyx1Q0FBdUMsRUFBRSxRQUFRLENBQUMsQ0FDM0U7S0FDRCxDQUFDLENBQUM7SUFFSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLG1CQUFtQixFQUFFO1FBQ3ZELE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSxrQ0FBa0M7WUFDdEMsS0FBSyxFQUFFLFNBQVMsR0FBRyxJQUFBLGNBQVEsRUFBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUM7WUFDdEUsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLGVBQWUsQ0FBQztTQUM3RTtRQUNELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLFFBQVE7UUFDZixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3ZCLDhDQUF3QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDeEMsMkJBQWMsQ0FBQyxTQUFTLENBQUMscURBQXFELEVBQUUsTUFBTSxDQUFDLENBQ3ZGO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsRUFBRTtRQUN2RCxPQUFPLEVBQUU7WUFDUixFQUFFLEVBQUUsa0NBQWtDO1lBQ3RDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnREFBZ0QsRUFBRSxVQUFVLENBQUM7WUFDN0UsSUFBSSxFQUFFLGtCQUFPLENBQUMsR0FBRztZQUNqQixPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMseUNBQXlDLEVBQUUsZUFBZSxDQUFDO1NBQzdFO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsUUFBUTtRQUNmLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FDdkIsOENBQXdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUN4QywyQkFBYyxDQUFDLE1BQU0sQ0FBQyxxREFBcUQsRUFBRSxNQUFNLENBQUMsQ0FDcEY7S0FDRCxDQUFDLENBQUM7SUFHSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLG1CQUFtQixFQUFFO1FBQ3ZELE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSxxQ0FBcUM7WUFDekMsS0FBSyxFQUFFLFNBQVMsR0FBRyxJQUFBLGNBQVEsRUFBQyxxQ0FBcUMsRUFBRSxVQUFVLENBQUM7WUFDOUUsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLDZDQUE2QyxFQUFFLG1CQUFtQixDQUFDO1NBQ3JGO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsUUFBUTtRQUNmLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FDdkIsOENBQXdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUN4QywyQkFBYyxDQUFDLFNBQVMsQ0FBQyxxREFBcUQsRUFBRSxNQUFNLENBQUMsQ0FDdkY7S0FDRCxDQUFDLENBQUM7SUFFSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGVBQWUsRUFBRTtRQUNuRCxPQUFPLEVBQUU7WUFDUixFQUFFLEVBQUUscUNBQXFDO1lBQ3pDLElBQUksRUFBRSxrQkFBTyxDQUFDLEdBQUc7WUFDakIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLCtDQUErQyxFQUFFLFVBQVUsQ0FBQztZQUM1RSxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsNkNBQTZDLEVBQUUsbUJBQW1CLENBQUM7U0FDckY7UUFDRCxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3ZCLDhDQUF3QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDeEMsMkJBQWMsQ0FBQyxTQUFTLENBQUMsdUNBQXVDLEVBQUUsY0FBYyxDQUFDLEVBQ2pGLDJCQUFjLENBQUMsU0FBUyxDQUFDLHVDQUF1QyxFQUFFLFFBQVEsQ0FBQyxFQUMzRSwyQkFBYyxDQUFDLFNBQVMsQ0FBQyxVQUFVLGdDQUFlLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFDbkYsMkJBQWMsQ0FBQyxTQUFTLENBQUMsVUFBVSxnQ0FBZSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ3JGO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsRUFBRTtRQUN2RCxPQUFPLEVBQUU7WUFDUixFQUFFLEVBQUUsc0NBQXNDO1lBQzFDLEtBQUssRUFBRSxTQUFTLEdBQUcsSUFBQSxjQUFRLEVBQUMscUNBQXFDLEVBQUUsVUFBVSxDQUFDO1lBQzlFLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyw2Q0FBNkMsRUFBRSxtQkFBbUIsQ0FBQztTQUNyRjtRQUNELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLFFBQVE7UUFDZixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3ZCLDhDQUF3QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDeEMsMkJBQWMsQ0FBQyxTQUFTLENBQUMscURBQXFELEVBQUUsTUFBTSxDQUFDLENBQ3ZGO0tBQ0QsQ0FBQyxDQUFDIn0=