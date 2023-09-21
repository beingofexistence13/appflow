/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/workbench/common/contributions", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/workbench/contrib/accessibility/browser/accessibleViewActions"], function (require, exports, codicons_1, lifecycle_1, themables_1, editorExtensions_1, codeEditorService_1, contributions_1, editorContextKeys_1, nls_1, actions_1, contextkey_1, quickInput_1, viewPane_1, chatAccessibilityHelp_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatService_1, chatWidgetHistoryService_1, editorService_1, platform_1, accessibleViewActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHistoryAction = exports.getOpenChatEditorAction = exports.registerChatActions = exports.CHAT_OPEN_ACTION_ID = exports.CHAT_CATEGORY = void 0;
    exports.CHAT_CATEGORY = { value: (0, nls_1.localize)('chat.category', "Chat"), original: 'Chat' };
    exports.CHAT_OPEN_ACTION_ID = 'workbench.action.chat.open';
    class QuickChatGlobalAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.CHAT_OPEN_ACTION_ID,
                title: { value: (0, nls_1.localize)('quickChat', "Quick Chat"), original: 'Quick Chat' },
                precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                icon: codicons_1.Codicon.commentDiscussion,
                f1: false,
                category: exports.CHAT_CATEGORY,
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
            const chatService = accessor.get(chatService_1.IChatService);
            const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
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
    function registerChatActions() {
        (0, actions_1.registerAction2)(QuickChatGlobalAction);
        (0, editorExtensions_1.registerEditorAction)(class ChatAcceptInput extends editorExtensions_1.EditorAction {
            constructor() {
                super({
                    id: 'chat.action.acceptInput',
                    label: (0, nls_1.localize)({ key: 'actions.chat.acceptInput', comment: ['Apply input from the chat input box'] }, "Accept Chat Input"),
                    alias: 'Accept Chat Input',
                    precondition: chatContextKeys_1.CONTEXT_IN_CHAT_INPUT,
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
                    const widgetService = accessor.get(chat_1.IChatWidgetService);
                    widgetService.getWidgetByInputUri(editorUri)?.acceptInput();
                }
            }
        });
        (0, actions_1.registerAction2)(class ClearChatHistoryAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chatEditor.clearHistory',
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.clearHistory.label', "Clear Input History"),
                        original: 'Clear Input History'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    category: exports.CHAT_CATEGORY,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const historyService = accessor.get(chatWidgetHistoryService_1.IChatWidgetHistoryService);
                historyService.clearHistory();
            }
        });
        (0, actions_1.registerAction2)(class FocusChatAction extends editorExtensions_1.EditorAction2 {
            constructor() {
                super({
                    id: 'chat.action.focus',
                    title: { value: (0, nls_1.localize)('actions.interactiveSession.focus', "Focus Chat List"), original: 'Focus Chat List' },
                    precondition: chatContextKeys_1.CONTEXT_IN_CHAT_INPUT,
                    category: exports.CHAT_CATEGORY,
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
                    const widgetService = accessor.get(chat_1.IChatWidgetService);
                    widgetService.getWidgetByInputUri(editorUri)?.focusLastMessage();
                }
            }
        });
        class ChatAccessibilityHelpContribution extends lifecycle_1.Disposable {
            constructor() {
                super();
                this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'panelChat', async (accessor) => {
                    const codeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor() || accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                    (0, chatAccessibilityHelp_1.runAccessibilityHelpAction)(accessor, codeEditor ?? undefined, 'panelChat');
                }, contextkey_1.ContextKeyExpr.or(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, chatContextKeys_1.CONTEXT_RESPONSE, chatContextKeys_1.CONTEXT_REQUEST)));
            }
        }
        const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(ChatAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
        (0, actions_1.registerAction2)(class FocusChatInputAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.focusInput',
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.focusInput.label', "Focus Chat Input"),
                        original: 'Focus Chat Input'
                    },
                    f1: false,
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, contextkey_1.ContextKeyExpr.not(editorContextKeys_1.EditorContextKeys.focus.key))
                    }
                });
            }
            run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                widgetService.lastFocusedWidget?.focusInput();
            }
        });
    }
    exports.registerChatActions = registerChatActions;
    function getOpenChatEditorAction(id, label, when) {
        return class OpenChatEditor extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.openChat.${id}`,
                    title: { value: (0, nls_1.localize)('interactiveSession.open', "Open Editor ({0})", label), original: `Open Editor (${label})` },
                    f1: true,
                    category: exports.CHAT_CATEGORY,
                    precondition: contextkey_1.ContextKeyExpr.deserialize(when)
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.IEditorService);
                await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { providerId: id }, pinned: true } });
            }
        };
    }
    exports.getOpenChatEditorAction = getOpenChatEditorAction;
    const getHistoryChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        viewId,
        id: `workbench.action.chat.${providerId}.history`,
        title: {
            value: (0, nls_1.localize)('interactiveSession.history.label', "Show History"),
            original: 'Show History'
        },
        menu: {
            id: actions_1.MenuId.ViewTitle,
            when: contextkey_1.ContextKeyExpr.equals('view', viewId),
            group: 'navigation',
            order: 0
        },
        category: exports.CHAT_CATEGORY,
        icon: codicons_1.Codicon.history,
        f1: false
    });
    function getHistoryAction(viewId, providerId) {
        return class HistoryAction extends viewPane_1.ViewAction {
            constructor() {
                super(getHistoryChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                const chatService = accessor.get(chatService_1.IChatService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const items = chatService.getHistory();
                const picks = items.map(i => ({
                    label: i.title,
                    chat: i,
                    buttons: [{
                            iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.x),
                            tooltip: (0, nls_1.localize)('interactiveSession.history.delete', "Delete"),
                        }]
                }));
                const selection = await quickInputService.pick(picks, {
                    placeHolder: (0, nls_1.localize)('interactiveSession.history.pick', "Select a chat session to restore"),
                    onDidTriggerItemButton: context => {
                        chatService.removeHistoryEntry(context.item.chat.sessionId);
                        context.removeItem();
                    }
                });
                if (selection) {
                    const sessionId = selection.chat.sessionId;
                    await editorService.openEditor({
                        resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { sessionId }, pinned: true }
                    });
                }
            }
        };
    }
    exports.getHistoryAction = getHistoryAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE4Qm5GLFFBQUEsYUFBYSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDL0UsUUFBQSxtQkFBbUIsR0FBRyw0QkFBNEIsQ0FBQztJQUVoRSxNQUFNLHFCQUFzQixTQUFRLGlCQUFPO1FBQzFDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwyQkFBbUI7Z0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRTtnQkFDN0UsWUFBWSxFQUFFLHlDQUF1QjtnQkFDckMsSUFBSSxFQUFFLGtCQUFPLENBQUMsaUJBQWlCO2dCQUMvQixFQUFFLEVBQUUsS0FBSztnQkFDVCxRQUFRLEVBQUUscUJBQWE7Z0JBQ3ZCLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsT0FBTyxFQUFFLGdEQUEyQix3QkFBZTtvQkFDbkQsR0FBRyxFQUFFO3dCQUNKLE9BQU8sRUFBRSxvREFBK0Isd0JBQWU7cUJBQ3ZEO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxLQUFjO1lBQzVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FB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