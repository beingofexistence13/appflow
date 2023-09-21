/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/registry/common/platform", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, async_1, editorExtensions_1, editorContextKeys_1, nls_1, accessibility_1, actions_1, configurationRegistry_1, contextkey_1, contextkeys_1, platform_1, inlineChatController_1, inlineChat_1, coreActions_1, notebookBrowser_1, notebookCommon_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CENTER_ACTIVE_CELL = void 0;
    const NOTEBOOK_FOCUS_TOP = 'notebook.focusTop';
    const NOTEBOOK_FOCUS_BOTTOM = 'notebook.focusBottom';
    const NOTEBOOK_FOCUS_PREVIOUS_EDITOR = 'notebook.focusPreviousEditor';
    const NOTEBOOK_FOCUS_NEXT_EDITOR = 'notebook.focusNextEditor';
    const FOCUS_IN_OUTPUT_COMMAND_ID = 'notebook.cell.focusInOutput';
    const FOCUS_OUT_OUTPUT_COMMAND_ID = 'notebook.cell.focusOutOutput';
    exports.CENTER_ACTIVE_CELL = 'notebook.centerActiveCell';
    const NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID = 'notebook.cell.cursorPageUp';
    const NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID = 'notebook.cell.cursorPageUpSelect';
    const NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID = 'notebook.cell.cursorPageDown';
    const NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID = 'notebook.cell.cursorPageDownSelect';
    (0, actions_1.registerAction2)(class FocusNextCellAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_NEXT_EDITOR,
                title: (0, nls_1.localize)('cursorMoveDown', 'Focus Next Cell Editor'),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('top'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none')), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, // code cell keybinding, focus inside editor: lower weight to not override suggest widget
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup'), notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.isEqualTo(false), notebookContextKeys_1.NOTEBOOK_CURSOR_NAVIGATION_MODE), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */, // markdown keybinding, focus on list: higher weight to override list.focusDown
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        mac: { primary: 256 /* KeyMod.WinCtrl */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('top'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none')), inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 0 /* KeybindingWeight.EditorCore */
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup'), notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.isEqualTo(false), notebookContextKeys_1.NOTEBOOK_CURSOR_NAVIGATION_MODE), inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 0 /* KeybindingWeight.EditorCore */
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            const idx = editor.getCellIndex(activeCell);
            if (typeof idx !== 'number') {
                return;
            }
            if (idx >= editor.getLength() - 1) {
                // last one
                return;
            }
            const focusEditorLine = activeCell.textBuffer.getLineCount();
            const targetCell = (context.cell ?? context.selectedCells?.[0]);
            const foundEditor = targetCell ? (0, coreActions_1.findTargetCellEditor)(context, targetCell) : undefined;
            if (foundEditor && foundEditor.hasTextFocus() && inlineChatController_1.InlineChatController.get(foundEditor)?.getWidgetPosition()?.lineNumber === focusEditorLine) {
                inlineChatController_1.InlineChatController.get(foundEditor)?.focus();
            }
            else {
                const newCell = editor.cellAt(idx + 1);
                const newFocusMode = newCell.cellKind === notebookCommon_1.CellKind.Markup && newCell.getEditState() === notebookBrowser_1.CellEditState.Preview ? 'container' : 'editor';
                await editor.focusNotebookCell(newCell, newFocusMode, { focusEditorLine: 1 });
            }
        }
    });
    (0, actions_1.registerAction2)(class FocusPreviousCellAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_PREVIOUS_EDITOR,
                title: (0, nls_1.localize)('cursorMoveUp', 'Focus Previous Cell Editor'),
                precondition: accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('bottom'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none')), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 16 /* KeyCode.UpArrow */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT, // code cell keybinding, focus inside editor: lower weight to not override suggest widget
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup'), notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.isEqualTo(false), notebookContextKeys_1.NOTEBOOK_CURSOR_NAVIGATION_MODE), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 16 /* KeyCode.UpArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */, // markdown keybinding, focus on list: higher weight to override list.focusDown
                    }
                ],
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            const idx = editor.getCellIndex(activeCell);
            if (typeof idx !== 'number') {
                return;
            }
            if (idx < 1 || editor.getLength() === 0) {
                // we don't do loop
                return;
            }
            const newCell = editor.cellAt(idx - 1);
            const newFocusMode = newCell.cellKind === notebookCommon_1.CellKind.Markup && newCell.getEditState() === notebookBrowser_1.CellEditState.Preview ? 'container' : 'editor';
            const focusEditorLine = newCell.textBuffer.getLineCount();
            await editor.focusNotebookCell(newCell, newFocusMode, { focusEditorLine: focusEditorLine });
            const foundEditor = (0, coreActions_1.findTargetCellEditor)(context, newCell);
            if (foundEditor && inlineChatController_1.InlineChatController.get(foundEditor)?.getWidgetPosition()?.lineNumber === focusEditorLine) {
                inlineChatController_1.InlineChatController.get(foundEditor)?.focus();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_TOP,
                title: (0, nls_1.localize)('focusFirstCell', 'Focus First Cell'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            if (editor.getLength() === 0) {
                return;
            }
            const firstCell = editor.cellAt(0);
            await editor.focusNotebookCell(firstCell, 'container');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_BOTTOM,
                title: (0, nls_1.localize)('focusLastCell', 'Focus Last Cell'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            if (!editor.hasModel() || editor.getLength() === 0) {
                return;
            }
            const lastIdx = editor.getLength() - 1;
            const lastVisibleIdx = editor.getPreviousVisibleCellIndex(lastIdx);
            if (lastVisibleIdx) {
                const cell = editor.cellAt(lastVisibleIdx);
                await editor.focusNotebookCell(cell, 'container');
            }
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: FOCUS_IN_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)('focusOutput', 'Focus In Active Cell Output'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            return (0, async_1.timeout)(0).then(() => editor.focusNotebookCell(activeCell, 'output'));
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: FOCUS_OUT_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)('focusOutputOut', 'Focus Out Active Cell Output'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            await editor.focusNotebookCell(activeCell, 'editor');
        }
    });
    (0, actions_1.registerAction2)(class CenterActiveCellAction extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: exports.CENTER_ACTIVE_CELL,
                title: (0, nls_1.localize)('notebookActions.centerActiveCell', "Center Active Cell"),
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 42 /* KeyCode.KeyL */,
                    },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.revealInCenter(context.cell);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID,
                title: (0, nls_1.localize)('cursorPageUp', "Cell Cursor Page Up"),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 11 /* KeyCode.PageUp */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageUp').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID,
                title: (0, nls_1.localize)('cursorPageUpSelect', "Cell Cursor Page Up Select"),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageUpSelect').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID,
                title: (0, nls_1.localize)('cursorPageDown', "Cell Cursor Page Down"),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 12 /* KeyCode.PageDown */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageDown').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID,
                title: (0, nls_1.localize)('cursorPageDownSelect', "Cell Cursor Page Down Select"),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageDownSelect').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    function getPageSize(context) {
        const editor = context.notebookEditor;
        const layoutInfo = editor.getViewModel().layoutInfo;
        const lineHeight = layoutInfo?.fontInfo.lineHeight || 17;
        return Math.max(1, Math.floor((layoutInfo?.height || 0) / lineHeight) - 2);
    }
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.navigation.allowNavigateToSurroundingCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)('notebook.navigation.allowNavigateToSurroundingCells', "When enabled cursor can navigate to the next/previous cell when the current cursor in the cell editor is at the first/last line.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyb3cuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvbmF2aWdhdGlvbi9hcnJvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQU0sa0JBQWtCLEdBQUcsbUJBQW1CLENBQUM7SUFDL0MsTUFBTSxxQkFBcUIsR0FBRyxzQkFBc0IsQ0FBQztJQUNyRCxNQUFNLDhCQUE4QixHQUFHLDhCQUE4QixDQUFDO0lBQ3RFLE1BQU0sMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7SUFDOUQsTUFBTSwwQkFBMEIsR0FBRyw2QkFBNkIsQ0FBQztJQUNqRSxNQUFNLDJCQUEyQixHQUFHLDhCQUE4QixDQUFDO0lBQ3RELFFBQUEsa0JBQWtCLEdBQUcsMkJBQTJCLENBQUM7SUFDOUQsTUFBTSxpQ0FBaUMsR0FBRyw0QkFBNEIsQ0FBQztJQUN2RSxNQUFNLHdDQUF3QyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3BGLE1BQU0sbUNBQW1DLEdBQUcsOEJBQThCLENBQUM7SUFDM0UsTUFBTSwwQ0FBMEMsR0FBRyxvQ0FBb0MsQ0FBQztJQUV4RixJQUFBLHlCQUFlLEVBQUMsTUFBTSxtQkFBb0IsU0FBUSxnQ0FBa0I7UUFDbkU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDBCQUEwQjtnQkFDOUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLHdCQUF3QixDQUFDO2dCQUMzRCxVQUFVLEVBQUU7b0JBQ1g7d0JBQ0MsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUN2Qiw2Q0FBdUIsRUFDdkIsa0RBQWtDLENBQUMsTUFBTSxFQUFFLEVBQzNDLDJCQUFjLENBQUMsTUFBTSxDQUFDLDREQUE0RCxFQUFFLElBQUksQ0FBQyxFQUN6RiwyQkFBYyxDQUFDLEdBQUcsQ0FD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