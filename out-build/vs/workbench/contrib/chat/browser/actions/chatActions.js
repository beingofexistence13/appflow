/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/workbench/common/contributions", "vs/editor/common/editorContextKeys", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/workbench/contrib/accessibility/browser/accessibleViewActions"], function (require, exports, codicons_1, lifecycle_1, themables_1, editorExtensions_1, codeEditorService_1, contributions_1, editorContextKeys_1, nls_1, actions_1, contextkey_1, quickInput_1, viewPane_1, chatAccessibilityHelp_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatService_1, chatWidgetHistoryService_1, editorService_1, platform_1, accessibleViewActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HIb = exports.$GIb = exports.$FIb = exports.$EIb = exports.$DIb = void 0;
    exports.$DIb = { value: (0, nls_1.localize)(0, null), original: 'Chat' };
    exports.$EIb = 'workbench.action.chat.open';
    class QuickChatGlobalAction extends actions_1.$Wu {
        constructor() {
            super({
                id: exports.$EIb,
                title: { value: (0, nls_1.localize)(1, null), original: 'Quick Chat' },
                precondition: chatContextKeys_1.$LGb,
                icon: codicons_1.$Pj.commentDiscussion,
                f1: false,
                category: exports.$DIb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 39 /* KeyCode.KeyI */
                    }
                }
            });
        }
        async run(accessor, query) {
            const chatService = accessor.get(chatService_1.$FH);
            const chatWidgetService = accessor.get(chat_1.$Nqb);
            const providers = chatService.getProviderInfos();
            if (!providers.length) {
                return;
            }
            const chatWidget = await chatWidgetService.revealViewForProvider(providers[0].id);
            if (!chatWidget) {
                return;
            }
            if (query) {
                chatWidget.acceptInput(query);
            }
            chatWidget.focusInput();
        }
    }
    function $FIb() {
        (0, actions_1.$Xu)(QuickChatGlobalAction);
        (0, editorExtensions_1.$xV)(class ChatAcceptInput extends editorExtensions_1.$sV {
            constructor() {
                super({
                    id: 'chat.action.acceptInput',
                    label: (0, nls_1.localize)(2, null),
                    alias: 'Accept Chat Input',
                    precondition: chatContextKeys_1.$IGb,
                    kbOpts: {
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }
                });
            }
            run(accessor, editor) {
                const editorUri = editor.getModel()?.uri;
                if (editorUri) {
                    const widgetService = accessor.get(chat_1.$Nqb);
                    widgetService.getWidgetByInputUri(editorUri)?.acceptInput();
                }
            }
        });
        (0, actions_1.$Xu)(class ClearChatHistoryAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chatEditor.clearHistory',
                    title: {
                        value: (0, nls_1.localize)(3, null),
                        original: 'Clear Input History'
                    },
                    precondition: chatContextKeys_1.$LGb,
                    category: exports.$DIb,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const historyService = accessor.get(chatWidgetHistoryService_1.$QGb);
                historyService.clearHistory();
            }
        });
        (0, actions_1.$Xu)(class FocusChatAction extends editorExtensions_1.$uV {
            constructor() {
                super({
                    id: 'chat.action.focus',
                    title: { value: (0, nls_1.localize)(4, null), original: 'Focus Chat List' },
                    precondition: chatContextKeys_1.$IGb,
                    category: exports.$DIb,
                    keybinding: {
                        when: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }
                });
            }
            runEditorCommand(accessor, editor) {
                const editorUri = editor.getModel()?.uri;
                if (editorUri) {
                    const widgetService = accessor.get(chat_1.$Nqb);
                    widgetService.getWidgetByInputUri(editorUri)?.focusLastMessage();
                }
            }
        });
        class ChatAccessibilityHelpContribution extends lifecycle_1.$kc {
            constructor() {
                super();
                this.B(accessibleViewActions_1.$tGb.addImplementation(105, 'panelChat', async (accessor) => {
                    const codeEditor = accessor.get(codeEditorService_1.$nV).getActiveCodeEditor() || accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
                    (0, chatAccessibilityHelp_1.$xGb)(accessor, codeEditor ?? undefined, 'panelChat');
                }, contextkey_1.$Ii.or(chatContextKeys_1.$JGb, chatContextKeys_1.$FGb, chatContextKeys_1.$GGb)));
            }
        }
        const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(ChatAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
        (0, actions_1.$Xu)(class FocusChatInputAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.focusInput',
                    title: {
                        value: (0, nls_1.localize)(5, null),
                        original: 'Focus Chat Input'
                    },
                    f1: false,
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.$Ii.and(chatContextKeys_1.$JGb, contextkey_1.$Ii.not(editorContextKeys_1.EditorContextKeys.focus.key))
                    }
                });
            }
            run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.$Nqb);
                widgetService.lastFocusedWidget?.focusInput();
            }
        });
    }
    exports.$FIb = $FIb;
    function $GIb(id, label, when) {
        return class OpenChatEditor extends actions_1.$Wu {
            constructor() {
                super({
                    id: `workbench.action.openChat.${id}`,
                    title: { value: (0, nls_1.localize)(6, null, label), original: `Open Editor (${label})` },
                    f1: true,
                    category: exports.$DIb,
                    precondition: contextkey_1.$Ii.deserialize(when)
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.$9C);
                await editorService.openEditor({ resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { providerId: id }, pinned: true } });
            }
        };
    }
    exports.$GIb = $GIb;
    const getHistoryChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        viewId,
        id: `workbench.action.chat.${providerId}.history`,
        title: {
            value: (0, nls_1.localize)(7, null),
            original: 'Show History'
        },
        menu: {
            id: actions_1.$Ru.ViewTitle,
            when: contextkey_1.$Ii.equals('view', viewId),
            group: 'navigation',
            order: 0
        },
        category: exports.$DIb,
        icon: codicons_1.$Pj.history,
        f1: false
    });
    function $HIb(viewId, providerId) {
        return class HistoryAction extends viewPane_1.$Keb {
            constructor() {
                super(getHistoryChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                const chatService = accessor.get(chatService_1.$FH);
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const editorService = accessor.get(editorService_1.$9C);
                const items = chatService.getHistory();
                const picks = items.map(i => ({
                    label: i.title,
                    chat: i,
                    buttons: [{
                            iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.x),
                            tooltip: (0, nls_1.localize)(8, null),
                        }]
                }));
                const selection = await quickInputService.pick(picks, {
                    placeHolder: (0, nls_1.localize)(9, null),
                    onDidTriggerItemButton: context => {
                        chatService.removeHistoryEntry(context.item.chat.sessionId);
                        context.removeItem();
                    }
                });
                if (selection) {
                    const sessionId = selection.chat.sessionId;
                    await editorService.openEditor({
                        resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { sessionId }, pinned: true }
                    });
                }
            }
        };
    }
    exports.$HIb = $HIb;
});
//# sourceMappingURL=chatActions.js.map