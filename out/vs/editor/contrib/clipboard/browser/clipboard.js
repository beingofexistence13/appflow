/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/platform", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey"], function (require, exports, browser, dom_1, platform, textAreaInput_1, editorExtensions_1, codeEditorService_1, editorContextKeys_1, nls, actions_1, clipboardService_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PasteAction = exports.CopyAction = exports.CutAction = void 0;
    const CLIPBOARD_CONTEXT_MENU_GROUP = '9_cutcopypaste';
    const supportsCut = (platform.isNative || document.queryCommandSupported('cut'));
    const supportsCopy = (platform.isNative || document.queryCommandSupported('copy'));
    // Firefox only supports navigator.clipboard.readText() in browser extensions.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#Browser_compatibility
    // When loading over http, navigator.clipboard can be undefined. See https://github.com/microsoft/monaco-editor/issues/2313
    const supportsPaste = (typeof navigator.clipboard === 'undefined' || browser.isFirefox) ? document.queryCommandSupported('paste') : true;
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.CutAction = supportsCut ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardCutAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind cut keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */, secondary: [1024 /* KeyMod.Shift */ | 20 /* KeyCode.Delete */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "Cu&&t"),
                order: 1
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.cutLabel', "Cut"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize('actions.clipboard.cutLabel', "Cut"),
                order: 1
            }, {
                menuId: actions_1.MenuId.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.cutLabel', "Cut"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }]
    })) : undefined;
    exports.CopyAction = supportsCopy ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardCopyAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind copy keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, secondary: [2048 /* KeyMod.CtrlCmd */ | 19 /* KeyCode.Insert */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
                order: 2
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.copyLabel', "Copy"),
                order: 2,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize('actions.clipboard.copyLabel', "Copy"),
                order: 1
            }, {
                menuId: actions_1.MenuId.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.copyLabel', "Copy"),
                order: 2,
            }]
    })) : undefined;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarEditMenu, { submenu: actions_1.MenuId.MenubarCopy, title: { value: nls.localize('copy as', "Copy As"), original: 'Copy As', }, group: '2_ccp', order: 3 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, { submenu: actions_1.MenuId.EditorContextCopy, title: { value: nls.localize('copy as', "Copy As"), original: 'Copy As', }, group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, { submenu: actions_1.MenuId.EditorContextShare, title: { value: nls.localize('share', "Share"), original: 'Share', }, group: '11_share', order: -1, when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('resourceScheme', 'output'), editorContextKeys_1.EditorContextKeys.editorTextFocus) });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { submenu: actions_1.MenuId.EditorTitleContextShare, title: { value: nls.localize('share', "Share"), original: 'Share', }, group: '11_share', order: -1 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, { submenu: actions_1.MenuId.ExplorerContextShare, title: { value: nls.localize('share', "Share"), original: 'Share', }, group: '11_share', order: -1 });
    exports.PasteAction = supportsPaste ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardPasteAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind paste keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
            linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"),
                order: 4
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                order: 1
            }, {
                menuId: actions_1.MenuId.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }]
    })) : undefined;
    class ExecCommandCopyWithSyntaxHighlightingAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
                label: nls.localize('actions.clipboard.copyWithSyntaxHighlightingLabel', "Copy With Syntax Highlighting"),
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
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = true;
            editor.focus();
            editor.getContainerDomNode().ownerDocument.execCommand('copy');
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = false;
        }
    }
    function registerExecCommandImpl(target, browserCommand) {
        if (!target) {
            return;
        }
        // 1. handle case when focus is in editor.
        target.addImplementation(10000, 'code-editor', (accessor, args) => {
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
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
            (0, dom_1.getActiveDocument)().execCommand(browserCommand);
            return true;
        });
    }
    registerExecCommandImpl(exports.CutAction, 'cut');
    registerExecCommandImpl(exports.CopyAction, 'copy');
    if (exports.PasteAction) {
        // 1. Paste: handle case when focus is in editor.
        exports.PasteAction.addImplementation(10000, 'code-editor', (accessor, args) => {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = codeEditorService.getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                const result = focusedEditor.getContainerDomNode().ownerDocument.execCommand('paste');
                // Use the clipboard service if document.execCommand('paste') was not successful
                if (!result && platform.isWeb) {
                    return (async () => {
                        const clipboardText = await clipboardService.readText();
                        if (clipboardText !== '') {
                            const metadata = textAreaInput_1.InMemoryClipboardMetadataManager.INSTANCE.get(clipboardText);
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
        exports.PasteAction.addImplementation(0, 'generic-dom', (accessor, args) => {
            (0, dom_1.getActiveDocument)().execCommand('paste');
            return true;
        });
    }
    if (supportsCopy) {
        (0, editorExtensions_1.registerEditorAction)(ExecCommandCopyWithSyntaxHighlightingAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY2xpcGJvYXJkL2Jyb3dzZXIvY2xpcGJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsTUFBTSw0QkFBNEIsR0FBRyxnQkFBZ0IsQ0FBQztJQUV0RCxNQUFNLFdBQVcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25GLDhFQUE4RTtJQUM5RSxnR0FBZ0c7SUFDaEcsMkhBQTJIO0lBQzNILE1BQU0sYUFBYSxHQUFHLENBQUMsT0FBTyxTQUFTLENBQUMsU0FBUyxLQUFLLFdBQVcsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXpJLFNBQVMsZUFBZSxDQUFvQixPQUFVO1FBQ3JELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBRVksUUFBQSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSwrQkFBWSxDQUFDO1FBQ3ZFLEVBQUUsRUFBRSxrQ0FBa0M7UUFDdEMsWUFBWSxFQUFFLFNBQVM7UUFDdkIsTUFBTSxFQUFFO1FBQ1AsOENBQThDO1FBQzlDLCtEQUErRDtRQUMvRCxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuQixPQUFPLEVBQUUsaURBQTZCO1lBQ3RDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxpREFBNkIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxpREFBNkIsQ0FBQyxFQUFFO1lBQzNGLE1BQU0sMENBQWdDO1NBQ3RDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDYjtRQUNELFFBQVEsRUFBRSxDQUFDO2dCQUNWLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGVBQWU7Z0JBQzlCLEtBQUssRUFBRSxPQUFPO2dCQUNkLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDO2dCQUNsRixLQUFLLEVBQUUsQ0FBQzthQUNSLEVBQUU7Z0JBQ0YsTUFBTSxFQUFFLGdCQUFNLENBQUMsYUFBYTtnQkFDNUIsS0FBSyxFQUFFLDRCQUE0QjtnQkFDbkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO2dCQUN4RCxJQUFJLEVBQUUscUNBQWlCLENBQUMsUUFBUTtnQkFDaEMsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFO2dCQUNGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGNBQWM7Z0JBQzdCLEtBQUssRUFBRSxFQUFFO2dCQUNULEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQztnQkFDeEQsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFO2dCQUNGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtnQkFDbEMsS0FBSyxFQUFFLDRCQUE0QjtnQkFDbkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO2dCQUN4RCxJQUFJLEVBQUUscUNBQWlCLENBQUMsUUFBUTtnQkFDaEMsS0FBSyxFQUFFLENBQUM7YUFDUixDQUFDO0tBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUVILFFBQUEsVUFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksK0JBQVksQ0FBQztRQUN6RSxFQUFFLEVBQUUsbUNBQW1DO1FBQ3ZDLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE1BQU0sRUFBRTtRQUNQLCtDQUErQztRQUMvQywrREFBK0Q7UUFDL0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkIsT0FBTyxFQUFFLGlEQUE2QjtZQUN0QyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsaURBQTZCLEVBQUUsU0FBUyxFQUFFLENBQUMsbURBQStCLENBQUMsRUFBRTtZQUM3RixNQUFNLDBDQUFnQztTQUN0QyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQ2I7UUFDRCxRQUFRLEVBQUUsQ0FBQztnQkFDVixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO2dCQUM5QixLQUFLLEVBQUUsT0FBTztnQkFDZCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQztnQkFDcEYsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFO2dCQUNGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGFBQWE7Z0JBQzVCLEtBQUssRUFBRSw0QkFBNEI7Z0JBQ25DLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLE1BQU0sQ0FBQztnQkFDMUQsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFO2dCQUNGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGNBQWM7Z0JBQzdCLEtBQUssRUFBRSxFQUFFO2dCQUNULEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLE1BQU0sQ0FBQztnQkFDMUQsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFO2dCQUNGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtnQkFDbEMsS0FBSyxFQUFFLDRCQUE0QjtnQkFDbkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDO2dCQUMxRCxLQUFLLEVBQUUsQ0FBQzthQUNSLENBQUM7S0FDRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRWhCLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFFLGdCQUFNLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzTCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBRSxnQkFBTSxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxHQUFHLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BOLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFFLGdCQUFNLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQWMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLEVBQUUscUNBQWlCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pULHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4TSxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLE9BQU8sRUFBRSxnQkFBTSxDQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJMLFFBQUEsV0FBVyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksK0JBQVksQ0FBQztRQUMzRSxFQUFFLEVBQUUsb0NBQW9DO1FBQ3hDLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE1BQU0sRUFBRTtRQUNQLGdEQUFnRDtRQUNoRCwrREFBK0Q7UUFDL0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkIsT0FBTyxFQUFFLGlEQUE2QjtZQUN0QyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsaURBQTZCLEVBQUUsU0FBUyxFQUFFLENBQUMsaURBQTZCLENBQUMsRUFBRTtZQUMzRixLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsaURBQTZCLEVBQUUsU0FBUyxFQUFFLENBQUMsaURBQTZCLENBQUMsRUFBRTtZQUM3RixNQUFNLDBDQUFnQztTQUN0QyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQ2I7UUFDRCxRQUFRLEVBQUUsQ0FBQztnQkFDVixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO2dCQUM5QixLQUFLLEVBQUUsT0FBTztnQkFDZCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQztnQkFDdEYsS0FBSyxFQUFFLENBQUM7YUFDUixFQUFFO2dCQUNGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGFBQWE7Z0JBQzVCLEtBQUssRUFBRSw0QkFBNEI7Z0JBQ25DLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLE9BQU8sQ0FBQztnQkFDNUQsSUFBSSxFQUFFLHFDQUFpQixDQUFDLFFBQVE7Z0JBQ2hDLEtBQUssRUFBRSxDQUFDO2FBQ1IsRUFBRTtnQkFDRixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxjQUFjO2dCQUM3QixLQUFLLEVBQUUsRUFBRTtnQkFDVCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxPQUFPLENBQUM7Z0JBQzVELEtBQUssRUFBRSxDQUFDO2FBQ1IsRUFBRTtnQkFDRixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxtQkFBbUI7Z0JBQ2xDLEtBQUssRUFBRSw0QkFBNEI7Z0JBQ25DLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLE9BQU8sQ0FBQztnQkFDNUQsSUFBSSxFQUFFLHFDQUFpQixDQUFDLFFBQVE7Z0JBQ2hDLEtBQUssRUFBRSxDQUFDO2FBQ1IsQ0FBQztLQUNGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFaEIsTUFBTSwyQ0FBNEMsU0FBUSwrQkFBWTtRQUVyRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUseURBQXlEO2dCQUM3RCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtREFBbUQsRUFBRSwrQkFBK0IsQ0FBQztnQkFDekcsS0FBSyxFQUFFLCtCQUErQjtnQkFDdEMsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUscUNBQWlCLENBQUMsY0FBYztvQkFDeEMsT0FBTyxFQUFFLENBQUM7b0JBQ1YsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE1BQW1CO1lBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU87YUFDUDtZQUVELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDLFNBQVMsK0NBQXNDLENBQUM7WUFFdkYsSUFBSSxDQUFDLHVCQUF1QixJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDaEUsT0FBTzthQUNQO1lBRUQsMkJBQVcsQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUM7WUFDbkQsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2YsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvRCwyQkFBVyxDQUFDLCtCQUErQixHQUFHLEtBQUssQ0FBQztRQUNyRCxDQUFDO0tBQ0Q7SUFFRCxTQUFTLHVCQUF1QixDQUFDLE1BQWdDLEVBQUUsY0FBOEI7UUFDaEcsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNaLE9BQU87U0FDUDtRQUVELDBDQUEwQztRQUMxQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQTBCLEVBQUUsSUFBUyxFQUFFLEVBQUU7WUFDeEYsbUVBQW1FO1lBQ25FLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlFLElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDbEQsK0VBQStFO2dCQUMvRSxNQUFNLHVCQUF1QixHQUFHLGFBQWEsQ0FBQyxTQUFTLCtDQUFzQyxDQUFDO2dCQUM5RixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQy9DLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFO29CQUNqRSxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFDRCxhQUFhLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM5RSxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILHlEQUF5RDtRQUN6RCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQTBCLEVBQUUsSUFBUyxFQUFFLEVBQUU7WUFDcEYsSUFBQSx1QkFBaUIsR0FBRSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELHVCQUF1QixDQUFDLGlCQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsdUJBQXVCLENBQUMsa0JBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU1QyxJQUFJLG1CQUFXLEVBQUU7UUFDaEIsaURBQWlEO1FBQ2pELG1CQUFXLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQTBCLEVBQUUsSUFBUyxFQUFFLEVBQUU7WUFDN0YsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7WUFFekQsbUVBQW1FO1lBQ25FLE1BQU0sYUFBYSxHQUFHLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDL0QsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUNsRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0RixnRkFBZ0Y7Z0JBQ2hGLElBQUksQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtvQkFDOUIsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNsQixNQUFNLGFBQWEsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUN4RCxJQUFJLGFBQWEsS0FBSyxFQUFFLEVBQUU7NEJBQ3pCLE1BQU0sUUFBUSxHQUFHLGdEQUFnQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQzlFLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQzs0QkFDM0IsSUFBSSxlQUFlLEdBQW9CLElBQUksQ0FBQzs0QkFDNUMsSUFBSSxJQUFJLEdBQWtCLElBQUksQ0FBQzs0QkFDL0IsSUFBSSxRQUFRLEVBQUU7Z0NBQ2IsY0FBYyxHQUFHLENBQUMsYUFBYSxDQUFDLFNBQVMsK0NBQXNDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dDQUNwSCxlQUFlLEdBQUcsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxlQUFlLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDdEcsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7NkJBQ3JCOzRCQUNELGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSwrQkFBaUI7Z0NBQ2hELElBQUksRUFBRSxhQUFhO2dDQUNuQixjQUFjO2dDQUNkLGVBQWU7Z0NBQ2YsSUFBSTs2QkFDSixDQUFDLENBQUM7eUJBQ0g7b0JBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQztpQkFDTDtnQkFDRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILGdFQUFnRTtRQUNoRSxtQkFBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUEwQixFQUFFLElBQVMsRUFBRSxFQUFFO1lBQ3pGLElBQUEsdUJBQWlCLEdBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztLQUNIO0lBRUQsSUFBSSxZQUFZLEVBQUU7UUFDakIsSUFBQSx1Q0FBb0IsRUFBQywyQ0FBMkMsQ0FBQyxDQUFDO0tBQ2xFIn0=