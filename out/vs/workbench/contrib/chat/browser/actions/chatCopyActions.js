/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, nls_1, actions_1, clipboardService_1, chatActions_1, chat_1, chatContextKeys_1, chatViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatCopyActions = void 0;
    function registerChatCopyActions() {
        (0, actions_1.registerAction2)(class CopyAllAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyAll',
                    title: {
                        value: (0, nls_1.localize)('interactive.copyAll.label', "Copy All"),
                        original: 'Copy All'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    menu: {
                        id: actions_1.MenuId.ChatContext
                    }
                });
            }
            run(accessor, ...args) {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
                const widget = chatWidgetService.lastFocusedWidget;
                if (widget) {
                    const viewModel = widget.viewModel;
                    const sessionAsText = viewModel?.getItems()
                        .filter((item) => (0, chatViewModel_1.isRequestVM)(item) || (0, chatViewModel_1.isResponseVM)(item))
                        .map(stringifyItem)
                        .join('\n\n');
                    if (sessionAsText) {
                        clipboardService.writeText(sessionAsText);
                    }
                }
            }
        });
        (0, actions_1.registerAction2)(class CopyItemAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyItem',
                    title: {
                        value: (0, nls_1.localize)('interactive.copyItem.label', "Copy"),
                        original: 'Copy'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    menu: {
                        id: actions_1.MenuId.ChatContext
                    },
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_LIST
                    }
                });
            }
            run(accessor, ...args) {
                let item = args[0];
                if (!(0, chatViewModel_1.isRequestVM)(item) && !(0, chatViewModel_1.isResponseVM)(item)) {
                    const widgetService = accessor.get(chat_1.IChatWidgetService);
                    item = widgetService.lastFocusedWidget?.getFocus();
                    if (!(0, chatViewModel_1.isRequestVM)(item) && !(0, chatViewModel_1.isResponseVM)(item)) {
                        return;
                    }
                }
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const text = stringifyItem(item);
                clipboardService.writeText(text);
            }
        });
    }
    exports.registerChatCopyActions = registerChatCopyActions;
    function stringifyItem(item) {
        return (0, chatViewModel_1.isRequestVM)(item) ?
            `${item.username}: ${item.messageText}` : `${item.username}: ${item.response.asString()}`;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENvcHlBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdENvcHlBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxTQUFnQix1QkFBdUI7UUFDdEMsSUFBQSx5QkFBZSxFQUFDLE1BQU0sYUFBYyxTQUFRLGlCQUFPO1lBQ2xEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsK0JBQStCO29CQUNuQyxLQUFLLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLFVBQVUsQ0FBQzt3QkFDeEQsUUFBUSxFQUFFLFVBQVU7cUJBQ3BCO29CQUNELEVBQUUsRUFBRSxLQUFLO29CQUNULFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFdBQVc7cUJBQ3RCO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWtCLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7Z0JBQ25ELElBQUksTUFBTSxFQUFFO29CQUNYLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7b0JBQ25DLE1BQU0sYUFBYSxHQUFHLFNBQVMsRUFBRSxRQUFRLEVBQUU7eUJBQ3pDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBNEQsRUFBRSxDQUFDLElBQUEsMkJBQVcsRUFBQyxJQUFJLENBQUMsSUFBSSxJQUFBLDRCQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ25ILEdBQUcsQ0FBQyxhQUFhLENBQUM7eUJBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDZixJQUFJLGFBQWEsRUFBRTt3QkFDbEIsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUMxQztpQkFDRDtZQUNGLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxjQUFlLFNBQVEsaUJBQU87WUFDbkQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSxnQ0FBZ0M7b0JBQ3BDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDO3dCQUNyRCxRQUFRLEVBQUUsTUFBTTtxQkFDaEI7b0JBQ0QsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixJQUFJLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVztxQkFDdEI7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLE1BQU0sNkNBQW1DO3dCQUN6QyxPQUFPLEVBQUUsaURBQTZCO3dCQUN0QyxJQUFJLEVBQUUsc0NBQW9CO3FCQUMxQjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO2dCQUM3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxJQUFBLDJCQUFXLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFBLDRCQUFZLEVBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzlDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWtCLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLElBQUEsMkJBQVcsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUEsNEJBQVksRUFBQyxJQUFJLENBQUMsRUFBRTt3QkFDOUMsT0FBTztxQkFDUDtpQkFDRDtnQkFFRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0NBQWlCLENBQUMsQ0FBQztnQkFDekQsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUF0RUQsMERBc0VDO0lBRUQsU0FBUyxhQUFhLENBQUMsSUFBb0Q7UUFDMUUsT0FBTyxJQUFBLDJCQUFXLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QixHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO0lBQzVGLENBQUMifQ==