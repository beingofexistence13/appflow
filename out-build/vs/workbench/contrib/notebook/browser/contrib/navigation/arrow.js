/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/registry/common/platform", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, async_1, editorExtensions_1, editorContextKeys_1, nls_1, accessibility_1, actions_1, configurationRegistry_1, contextkey_1, contextkeys_1, platform_1, inlineChatController_1, inlineChat_1, coreActions_1, notebookBrowser_1, notebookCommon_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sFb = void 0;
    const NOTEBOOK_FOCUS_TOP = 'notebook.focusTop';
    const NOTEBOOK_FOCUS_BOTTOM = 'notebook.focusBottom';
    const NOTEBOOK_FOCUS_PREVIOUS_EDITOR = 'notebook.focusPreviousEditor';
    const NOTEBOOK_FOCUS_NEXT_EDITOR = 'notebook.focusNextEditor';
    const FOCUS_IN_OUTPUT_COMMAND_ID = 'notebook.cell.focusInOutput';
    const FOCUS_OUT_OUTPUT_COMMAND_ID = 'notebook.cell.focusOutOutput';
    exports.$sFb = 'notebook.centerActiveCell';
    const NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID = 'notebook.cell.cursorPageUp';
    const NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID = 'notebook.cell.cursorPageUpSelect';
    const NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID = 'notebook.cell.cursorPageDown';
    const NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID = 'notebook.cell.cursorPageDownSelect';
    (0, actions_1.$Xu)(class FocusNextCellAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_NEXT_EDITOR,
                title: (0, nls_1.localize)(0, null),
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.$Ii.and(contextkey_1.$Ii.has(contextkeys_1.$83), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.$3H.notEqualsTo('top'), notebookCommon_1.$3H.notEqualsTo('none')), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: coreActions_1.$0ob, // code cell keybinding, focus inside editor: lower weight to not override suggest widget
                    },
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.$Ii.and(notebookContextKeys_1.$_nb.isEqualTo('markup'), notebookContextKeys_1.$dob.isEqualTo(false), notebookContextKeys_1.$9nb), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */, // markdown keybinding, focus on list: higher weight to override list.focusDown
                    },
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$1nb),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        mac: { primary: 256 /* KeyMod.WinCtrl */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.$Ii.and(contextkey_1.$Ii.has(contextkeys_1.$83), notebookCommon_1.$3H.notEqualsTo('top'), notebookCommon_1.$3H.notEqualsTo('none')), inlineChat_1.$iz, inlineChat_1.$mz, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 0 /* KeybindingWeight.EditorCore */
                    },
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.$Ii.and(notebookContextKeys_1.$_nb.isEqualTo('markup'), notebookContextKeys_1.$dob.isEqualTo(false), notebookContextKeys_1.$9nb), inlineChat_1.$iz, inlineChat_1.$mz, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
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
            const foundEditor = targetCell ? (0, coreActions_1.$apb)(context, targetCell) : undefined;
            if (foundEditor && foundEditor.hasTextFocus() && inlineChatController_1.$Qqb.get(foundEditor)?.getWidgetPosition()?.lineNumber === focusEditorLine) {
                inlineChatController_1.$Qqb.get(foundEditor)?.focus();
            }
            else {
                const newCell = editor.cellAt(idx + 1);
                const newFocusMode = newCell.cellKind === notebookCommon_1.CellKind.Markup && newCell.getEditState() === notebookBrowser_1.CellEditState.Preview ? 'container' : 'editor';
                await editor.focusNotebookCell(newCell, newFocusMode, { focusEditorLine: 1 });
            }
        }
    });
    (0, actions_1.$Xu)(class FocusPreviousCellAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_PREVIOUS_EDITOR,
                title: (0, nls_1.localize)(1, null),
                precondition: accessibility_1.$2r.negate(),
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.$Ii.and(contextkey_1.$Ii.has(contextkeys_1.$83), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.$3H.notEqualsTo('bottom'), notebookCommon_1.$3H.notEqualsTo('none')), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 16 /* KeyCode.UpArrow */,
                        weight: coreActions_1.$0ob, // code cell keybinding, focus inside editor: lower weight to not override suggest widget
                    },
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true), contextkey_1.$Ii.and(notebookContextKeys_1.$_nb.isEqualTo('markup'), notebookContextKeys_1.$dob.isEqualTo(false), notebookContextKeys_1.$9nb), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
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
            const foundEditor = (0, coreActions_1.$apb)(context, newCell);
            if (foundEditor && inlineChatController_1.$Qqb.get(foundEditor)?.getWidgetPosition()?.lineNumber === focusEditorLine) {
                inlineChatController_1.$Qqb.get(foundEditor)?.focus();
            }
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$bpb {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_TOP,
                title: (0, nls_1.localize)(2, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
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
    (0, actions_1.$Xu)(class extends coreActions_1.$bpb {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_BOTTOM,
                title: (0, nls_1.localize)(3, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
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
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: FOCUS_IN_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)(4, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$hob),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            return (0, async_1.$Hg)(0).then(() => editor.focusNotebookCell(activeCell, 'output'));
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: FOCUS_OUT_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)(5, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$1nb),
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
    (0, actions_1.$Xu)(class CenterActiveCellAction extends coreActions_1.$dpb {
        constructor() {
            super({
                id: exports.$sFb,
                title: (0, nls_1.localize)(6, null),
                keybinding: {
                    when: notebookContextKeys_1.$Ynb,
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
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEUP_COMMAND_ID,
                title: (0, nls_1.localize)(7, null),
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.has(contextkeys_1.$83), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 11 /* KeyCode.PageUp */,
                        weight: coreActions_1.$0ob
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageUp').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEUP_SELECT_COMMAND_ID,
                title: (0, nls_1.localize)(8, null),
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.has(contextkeys_1.$83), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                        weight: coreActions_1.$0ob
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageUpSelect').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEDOWN_COMMAND_ID,
                title: (0, nls_1.localize)(9, null),
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.has(contextkeys_1.$83), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 12 /* KeyCode.PageDown */,
                        weight: coreActions_1.$0ob
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            editorExtensions_1.EditorExtensionsRegistry.getEditorCommand('cursorPageDown').runCommand(accessor, { pageSize: getPageSize(context) });
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: NOTEBOOK_CURSOR_PAGEDOWN_SELECT_COMMAND_ID,
                title: (0, nls_1.localize)(10, null),
                keybinding: [
                    {
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.has(contextkeys_1.$83), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                        primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                        weight: coreActions_1.$0ob
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
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.navigation.allowNavigateToSurroundingCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)(11, null)
            }
        }
    });
});
//# sourceMappingURL=arrow.js.map