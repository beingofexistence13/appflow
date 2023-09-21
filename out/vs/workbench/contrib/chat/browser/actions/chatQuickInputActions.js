/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys"], function (require, exports, codicons_1, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getQuickChatActionForProvider = exports.registerQuickChatActions = exports.ASK_QUICK_QUESTION_ACTION_ID = void 0;
    exports.ASK_QUICK_QUESTION_ACTION_ID = 'workbench.action.quickchat.toggle';
    function registerQuickChatActions() {
        (0, actions_1.registerAction2)(QuickChatGlobalAction);
        (0, actions_1.registerAction2)(class OpenInChatViewAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.openInChatView',
                    title: {
                        value: (0, nls_1.localize)('chat.openInChatView.label', "Open in Chat View"),
                        original: 'Open in Chat View'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.commentDiscussion,
                    menu: {
                        id: actions_1.MenuId.ChatInputSide,
                        group: 'navigation',
                        order: 10
                    }
                });
            }
            run(accessor) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                quickChatService.openInChatView();
            }
        });
        (0, actions_1.registerAction2)(class CloseQuickChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.close',
                    title: {
                        value: (0, nls_1.localize)('chat.closeQuickChat.label', "Close Quick Chat"),
                        original: 'Close Quick Chat'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.close,
                    menu: {
                        id: actions_1.MenuId.ChatInputSide,
                        group: 'navigation',
                        order: 20
                    }
                });
            }
            run(accessor) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                quickChatService.close();
            }
        });
    }
    exports.registerQuickChatActions = registerQuickChatActions;
    class QuickChatGlobalAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.ASK_QUICK_QUESTION_ACTION_ID,
                title: { value: (0, nls_1.localize)('quickChat', "Quick Chat"), original: 'Quick Chat' },
                precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                icon: codicons_1.Codicon.commentDiscussion,
                f1: false,
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */,
                    linux: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */
                    }
                }
            });
        }
        run(accessor, query) {
            const quickChatService = accessor.get(chat_1.IQuickChatService);
            quickChatService.toggle(undefined, query);
        }
    }
    /**
     * Returns a provider specific action that will open the quick chat for that provider.
     * This is used to include the provider label in the action title so it shows up in
     * the command palette.
     * @param id The id of the provider
     * @param label The label of the provider
     * @returns An action that will open the quick chat for this provider
     */
    function getQuickChatActionForProvider(id, label) {
        return class AskQuickChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.openQuickChat.${id}`,
                    category: chatActions_1.CHAT_CATEGORY,
                    title: { value: (0, nls_1.localize)('interactiveSession.open', "Open Quick Chat ({0})", label), original: `Open Quick Chat (${label})` },
                    f1: true
                });
            }
            run(accessor, query) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                quickChatService.toggle(id, query);
            }
        };
    }
    exports.getQuickChatActionForProvider = getQuickChatActionForProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFF1aWNrSW5wdXRBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdFF1aWNrSW5wdXRBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVluRixRQUFBLDRCQUE0QixHQUFHLG1DQUFtQyxDQUFDO0lBQ2hGLFNBQWdCLHdCQUF3QjtRQUN2QyxJQUFBLHlCQUFlLEVBQUMscUJBQXFCLENBQUMsQ0FBQztRQUV2QyxJQUFBLHlCQUFlLEVBQUMsTUFBTSxvQkFBcUIsU0FBUSxpQkFBTztZQUN6RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLDJDQUEyQztvQkFDL0MsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSxtQkFBbUIsQ0FBQzt3QkFDakUsUUFBUSxFQUFFLG1CQUFtQjtxQkFDN0I7b0JBQ0QsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxpQkFBaUI7b0JBQy9CLElBQUksRUFBRTt3QkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLEVBQUU7cUJBQ1Q7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxRQUEwQjtnQkFDN0IsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFpQixDQUFDLENBQUM7Z0JBQ3pELGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25DLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxvQkFBcUIsU0FBUSxpQkFBTztZQUN6RDtnQkFD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