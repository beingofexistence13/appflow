/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, codicons_1, nls_1, actions_1, chatActions_1, chatContextKeys_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatExecuteActions = exports.SubmitAction = exports.isExecuteActionContext = void 0;
    function isExecuteActionContext(thing) {
        return typeof thing === 'object' && thing !== null && 'widget' in thing;
    }
    exports.isExecuteActionContext = isExecuteActionContext;
    class SubmitAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.submit'; }
        constructor() {
            super({
                id: SubmitAction.ID,
                title: {
                    value: (0, nls_1.localize)('interactive.submit.label', "Submit"),
                    original: 'Submit'
                },
                f1: false,
                category: chatActions_1.CHAT_CATEGORY,
                icon: codicons_1.Codicon.send,
                precondition: chatContextKeys_1.CONTEXT_CHAT_INPUT_HAS_TEXT,
                menu: {
                    id: actions_1.MenuId.ChatExecute,
                    when: chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(),
                    group: 'navigation',
                }
            });
        }
        run(accessor, ...args) {
            const context = args[0];
            if (!isExecuteActionContext(context)) {
                return;
            }
            context.widget.acceptInput(context.inputValue);
        }
    }
    exports.SubmitAction = SubmitAction;
    function registerChatExecuteActions() {
        (0, actions_1.registerAction2)(SubmitAction);
        (0, actions_1.registerAction2)(class CancelAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.cancel',
                    title: {
                        value: (0, nls_1.localize)('interactive.cancel.label', "Cancel"),
                        original: 'Cancel'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.debugStop,
                    menu: {
                        id: actions_1.MenuId.ChatExecute,
                        when: chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS,
                        group: 'navigation',
                    }
                });
            }
            run(accessor, ...args) {
                const context = args[0];
                if (!isExecuteActionContext(context)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                if (context.widget.viewModel) {
                    chatService.cancelCurrentRequestForSession(context.widget.viewModel.sessionId);
                }
            }
        });
    }
    exports.registerChatExecuteActions = registerChatExecuteActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEV4ZWN1dGVBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdEV4ZWN1dGVBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsU0FBZ0Isc0JBQXNCLENBQUMsS0FBYztRQUNwRCxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLFFBQVEsSUFBSSxLQUFLLENBQUM7SUFDekUsQ0FBQztJQUZELHdEQUVDO0lBRUQsTUFBYSxZQUFhLFNBQVEsaUJBQU87aUJBQ3hCLE9BQUUsR0FBRyw4QkFBOEIsQ0FBQztRQUVwRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQ25CLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDO29CQUNyRCxRQUFRLEVBQUUsUUFBUTtpQkFDbEI7Z0JBQ0QsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsUUFBUSxFQUFFLDJCQUFhO2dCQUN2QixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxJQUFJO2dCQUNsQixZQUFZLEVBQUUsNkNBQTJCO2dCQUN6QyxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVztvQkFDdEIsSUFBSSxFQUFFLGtEQUFnQyxDQUFDLE1BQU0sRUFBRTtvQkFDL0MsS0FBSyxFQUFFLFlBQVk7aUJBQ25CO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztZQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyQyxPQUFPO2FBQ1A7WUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQzs7SUE3QkYsb0NBOEJDO0lBRUQsU0FBZ0IsMEJBQTBCO1FBQ3pDLElBQUEseUJBQWUsRUFBQyxZQUFZLENBQUMsQ0FBQztRQUU5QixJQUFBLHlCQUFlLEVBQUMsTUFBTSxZQUFhLFNBQVEsaUJBQU87WUFDakQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSw4QkFBOEI7b0JBQ2xDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDO3dCQUNyRCxRQUFRLEVBQUUsUUFBUTtxQkFDbEI7b0JBQ0QsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxTQUFTO29CQUN2QixJQUFJLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVzt3QkFDdEIsSUFBSSxFQUFFLGtEQUFnQzt3QkFDdEMsS0FBSyxFQUFFLFlBQVk7cUJBQ25CO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNyQyxPQUFPO2lCQUNQO2dCQUVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO29CQUM3QixXQUFXLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQy9FO1lBQ0YsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFsQ0QsZ0VBa0NDIn0=