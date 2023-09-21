/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys"], function (require, exports, codicons_1, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LIb = exports.$KIb = exports.$JIb = void 0;
    exports.$JIb = 'workbench.action.quickchat.toggle';
    function $KIb() {
        (0, actions_1.$Xu)(QuickChatGlobalAction);
        (0, actions_1.$Xu)(class OpenInChatViewAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.openInChatView',
                    title: {
                        value: (0, nls_1.localize)(0, null),
                        original: 'Open in Chat View'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.commentDiscussion,
                    menu: {
                        id: actions_1.$Ru.ChatInputSide,
                        group: 'navigation',
                        order: 10
                    }
                });
            }
            run(accessor) {
                const quickChatService = accessor.get(chat_1.$Oqb);
                quickChatService.openInChatView();
            }
        });
        (0, actions_1.$Xu)(class CloseQuickChatAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.close',
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Close Quick Chat'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    icon: codicons_1.$Pj.close,
                    menu: {
                        id: actions_1.$Ru.ChatInputSide,
                        group: 'navigation',
                        order: 20
                    }
                });
            }
            run(accessor) {
                const quickChatService = accessor.get(chat_1.$Oqb);
                quickChatService.close();
            }
        });
    }
    exports.$KIb = $KIb;
    class QuickChatGlobalAction extends actions_1.$Wu {
        constructor() {
            super({
                id: exports.$JIb,
                title: { value: (0, nls_1.localize)(2, null), original: 'Quick Chat' },
                precondition: chatContextKeys_1.$LGb,
                icon: codicons_1.$Pj.commentDiscussion,
                f1: false,
                category: chatActions_1.$DIb,
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
            const quickChatService = accessor.get(chat_1.$Oqb);
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
    function $LIb(id, label) {
        return class AskQuickChatAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: `workbench.action.openQuickChat.${id}`,
                    category: chatActions_1.$DIb,
                    title: { value: (0, nls_1.localize)(3, null, label), original: `Open Quick Chat (${label})` },
                    f1: true
                });
            }
            run(accessor, query) {
                const quickChatService = accessor.get(chat_1.$Oqb);
                quickChatService.toggle(id, query);
            }
        };
    }
    exports.$LIb = $LIb;
});
//# sourceMappingURL=chatQuickInputActions.js.map