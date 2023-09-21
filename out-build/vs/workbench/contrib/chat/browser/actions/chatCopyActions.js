/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatCopyActions", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, nls_1, actions_1, clipboardService_1, chatActions_1, chat_1, chatContextKeys_1, chatViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IIb = void 0;
    function $IIb() {
        (0, actions_1.$Xu)(class CopyAllAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyAll',
                    title: {
                        value: (0, nls_1.localize)(0, null),
                        original: 'Copy All'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    menu: {
                        id: actions_1.$Ru.ChatContext
                    }
                });
            }
            run(accessor, ...args) {
                const clipboardService = accessor.get(clipboardService_1.$UZ);
                const chatWidgetService = accessor.get(chat_1.$Nqb);
                const widget = chatWidgetService.lastFocusedWidget;
                if (widget) {
                    const viewModel = widget.viewModel;
                    const sessionAsText = viewModel?.getItems()
                        .filter((item) => (0, chatViewModel_1.$Hqb)(item) || (0, chatViewModel_1.$Iqb)(item))
                        .map(stringifyItem)
                        .join('\n\n');
                    if (sessionAsText) {
                        clipboardService.writeText(sessionAsText);
                    }
                }
            }
        });
        (0, actions_1.$Xu)(class CopyItemAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyItem',
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Copy'
                    },
                    f1: false,
                    category: chatActions_1.$DIb,
                    menu: {
                        id: actions_1.$Ru.ChatContext
                    },
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                        when: chatContextKeys_1.$KGb
                    }
                });
            }
            run(accessor, ...args) {
                let item = args[0];
                if (!(0, chatViewModel_1.$Hqb)(item) && !(0, chatViewModel_1.$Iqb)(item)) {
                    const widgetService = accessor.get(chat_1.$Nqb);
                    item = widgetService.lastFocusedWidget?.getFocus();
                    if (!(0, chatViewModel_1.$Hqb)(item) && !(0, chatViewModel_1.$Iqb)(item)) {
                        return;
                    }
                }
                const clipboardService = accessor.get(clipboardService_1.$UZ);
                const text = stringifyItem(item);
                clipboardService.writeText(text);
            }
        });
    }
    exports.$IIb = $IIb;
    function stringifyItem(item) {
        return (0, chatViewModel_1.$Hqb)(item) ?
            `${item.username}: ${item.messageText}` : `${item.username}: ${item.response.asString()}`;
    }
});
//# sourceMappingURL=chatCopyActions.js.map