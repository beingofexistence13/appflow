/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/platform", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/contrib/clipboard/browser/clipboard", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey"], function (require, exports, browser, dom_1, platform, textAreaInput_1, editorExtensions_1, codeEditorService_1, editorContextKeys_1, nls, actions_1, clipboardService_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$j1 = exports.$i1 = exports.$h1 = void 0;
    const CLIPBOARD_CONTEXT_MENU_GROUP = '9_cutcopypaste';
    const supportsCut = (platform.$m || document.queryCommandSupported('cut'));
    const supportsCopy = (platform.$m || document.queryCommandSupported('copy'));
    // Firefox only supports navigator.clipboard.readText() in browser extensions.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#Browser_compatibility
    // When loading over http, navigator.clipboard can be undefined. See https://github.com/microsoft/monaco-editor/issues/2313
    const supportsPaste = (typeof navigator.clipboard === 'undefined' || browser.$5N) ? document.queryCommandSupported('paste') : true;
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.$h1 = supportsCut ? registerCommand(new editorExtensions_1.$pV({
        id: 'editor.action.clipboardCutAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind cut keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.$m ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */, secondary: [1024 /* KeyMod.Shift */ | 20 /* KeyCode.Delete */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.$Ru.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize(0, null),
                order: 1
            }, {
                menuId: actions_1.$Ru.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(1, null),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }, {
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: nls.localize(2, null),
                order: 1
            }, {
                menuId: actions_1.$Ru.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(3, null),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }]
    })) : undefined;
    exports.$i1 = supportsCopy ? registerCommand(new editorExtensions_1.$pV({
        id: 'editor.action.clipboardCopyAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind copy keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.$m ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, secondary: [2048 /* KeyMod.CtrlCmd */ | 19 /* KeyCode.Insert */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.$Ru.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize(4, null),
                order: 2
            }, {
                menuId: actions_1.$Ru.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(5, null),
                order: 2,
            }, {
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: nls.localize(6, null),
                order: 1
            }, {
                menuId: actions_1.$Ru.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(7, null),
                order: 2,
            }]
    })) : undefined;
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarEditMenu, { submenu: actions_1.$Ru.MenubarCopy, title: { value: nls.localize(8, null), original: 'Copy As', }, group: '2_ccp', order: 3 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, { submenu: actions_1.$Ru.EditorContextCopy, title: { value: nls.localize(9, null), original: 'Copy As', }, group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, { submenu: actions_1.$Ru.EditorContextShare, title: { value: nls.localize(10, null), original: 'Share', }, group: '11_share', order: -1, when: contextkey_1.$Ii.and(contextkey_1.$Ii.notEquals('resourceScheme', 'output'), editorContextKeys_1.EditorContextKeys.editorTextFocus) });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { submenu: actions_1.$Ru.EditorTitleContextShare, title: { value: nls.localize(11, null), original: 'Share', }, group: '11_share', order: -1 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, { submenu: actions_1.$Ru.ExplorerContextShare, title: { value: nls.localize(12, null), original: 'Share', }, group: '11_share', order: -1 });
    exports.$j1 = supportsPaste ? registerCommand(new editorExtensions_1.$pV({
        id: 'editor.action.clipboardPasteAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind paste keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.$m ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
            linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.$Ru.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize(13, null),
                order: 4
            }, {
                menuId: actions_1.$Ru.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(14, null),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }, {
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: nls.localize(15, null),
                order: 1
            }, {
                menuId: actions_1.$Ru.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(16, null),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }]
    })) : undefined;
    class ExecCommandCopyWithSyntaxHighlightingAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
                label: nls.localize(17, null),
                alias: 'Copy With Syntax Highlighting',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const emptySelectionClipboard = editor.getOption(37 /* EditorOption.emptySelectionClipboard */);
            if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
                return;
            }
            textAreaInput_1.$0W.forceCopyWithSyntaxHighlighting = true;
            editor.focus();
            editor.getContainerDomNode().ownerDocument.execCommand('copy');
            textAreaInput_1.$0W.forceCopyWithSyntaxHighlighting = false;
        }
    }
    function registerExecCommandImpl(target, browserCommand) {
        if (!target) {
            return;
        }
        // 1. handle case when focus is in editor.
        target.addImplementation(10000, 'code-editor', (accessor, args) => {
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                // Do not execute if there is no selection and empty selection clipboard is off
                const emptySelectionClipboard = focusedEditor.getOption(37 /* EditorOption.emptySelectionClipboard */);
                const selection = focusedEditor.getSelection();
                if (selection && selection.isEmpty() && !emptySelectionClipboard) {
                    return true;
                }
                focusedEditor.getContainerDomNode().ownerDocument.execCommand(browserCommand);
                return true;
            }
            return false;
        });
        // 2. (default) handle case when focus is somewhere else.
        target.addImplementation(0, 'generic-dom', (accessor, args) => {
            (0, dom_1.$WO)().execCommand(browserCommand);
            return true;
        });
    }
    registerExecCommandImpl(exports.$h1, 'cut');
    registerExecCommandImpl(exports.$i1, 'copy');
    if (exports.$j1) {
        // 1. Paste: handle case when focus is in editor.
        exports.$j1.addImplementation(10000, 'code-editor', (accessor, args) => {
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = codeEditorService.getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                const result = focusedEditor.getContainerDomNode().ownerDocument.execCommand('paste');
                // Use the clipboard service if document.execCommand('paste') was not successful
                if (!result && platform.$o) {
                    return (async () => {
                        const clipboardText = await clipboardService.readText();
                        if (clipboardText !== '') {
                            const metadata = textAreaInput_1.$$W.INSTANCE.get(clipboardText);
                            let pasteOnNewLine = false;
                            let multicursorText = null;
                            let mode = null;
                            if (metadata) {
                                pasteOnNewLine = (focusedEditor.getOption(37 /* EditorOption.emptySelectionClipboard */) && !!metadata.isFromEmptySelection);
                                multicursorText = (typeof metadata.multicursorText !== 'undefined' ? metadata.multicursorText : null);
                                mode = metadata.mode;
                            }
                            focusedEditor.trigger('keyboard', "paste" /* Handler.Paste */, {
                                text: clipboardText,
                                pasteOnNewLine,
                                multicursorText,
                                mode
                            });
                        }
                    })();
                }
                return true;
            }
            return false;
        });
        // 2. Paste: (default) handle case when focus is somewhere else.
        exports.$j1.addImplementation(0, 'generic-dom', (accessor, args) => {
            (0, dom_1.$WO)().execCommand('paste');
            return true;
        });
    }
    if (supportsCopy) {
        (0, editorExtensions_1.$xV)(ExecCommandCopyWithSyntaxHighlightingAction);
    }
});
//# sourceMappingURL=clipboard.js.map