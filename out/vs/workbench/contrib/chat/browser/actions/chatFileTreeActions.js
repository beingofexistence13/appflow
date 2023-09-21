/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1, chatViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatFileTreeActions = void 0;
    function registerChatFileTreeActions() {
        (0, actions_1.registerAction2)(class NextFileTreeAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.nextFileTree',
                    title: {
                        value: (0, nls_1.localize)('interactive.nextFileTree.label', "Next File Tree"),
                        original: 'Next File Tree'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateTrees(accessor, false);
            }
        });
        (0, actions_1.registerAction2)(class PreviousFileTreeAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.previousFileTree',
                    title: {
                        value: (0, nls_1.localize)('interactive.previousFileTree.label', "Previous File Tree"),
                        original: 'Previous File Tree'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateTrees(accessor, true);
            }
        });
    }
    exports.registerChatFileTreeActions = registerChatFileTreeActions;
    function navigateTrees(accessor, reverse) {
        const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
        const focusedResponse = (0, chatViewModel_1.isResponseVM)(focused) ? focused : undefined;
        const currentResponse = focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => (0, chatViewModel_1.isResponseVM)(item));
        if (!currentResponse) {
            return;
        }
        widget.reveal(currentResponse);
        const responseFileTrees = widget.getFileTreeInfosForResponse(currentResponse);
        const lastFocusedFileTree = widget.getLastFocusedFileTreeForResponse(currentResponse);
        const focusIdx = lastFocusedFileTree ?
            (lastFocusedFileTree.treeIndex + (reverse ? -1 : 1) + responseFileTrees.length) % responseFileTrees.length :
            reverse ? responseFileTrees.length - 1 : 0;
        responseFileTrees[focusIdx]?.focus();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEZpbGVUcmVlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9hY3Rpb25zL2NoYXRGaWxlVHJlZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLFNBQWdCLDJCQUEyQjtRQUMxQyxJQUFBLHlCQUFlLEVBQUMsTUFBTSxrQkFBbUIsU0FBUSxpQkFBTztZQUN2RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLG9DQUFvQztvQkFDeEMsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsQ0FBQzt3QkFDbkUsUUFBUSxFQUFFLGdCQUFnQjtxQkFDMUI7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLE9BQU8sRUFBRSwrQ0FBMkI7d0JBQ3BDLE1BQU0sNkNBQW1DO3dCQUN6QyxJQUFJLEVBQUUseUNBQXVCO3FCQUM3QjtvQkFDRCxZQUFZLEVBQUUseUNBQXVCO29CQUNyQyxFQUFFLEVBQUUsSUFBSTtvQkFDUixRQUFRLEVBQUUsMkJBQWE7aUJBQ3ZCLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQzdDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEMsQ0FBQztTQUNELENBQUMsQ0FBQztRQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLHNCQUF1QixTQUFRLGlCQUFPO1lBQzNEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsd0NBQXdDO29CQUM1QyxLQUFLLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLG9DQUFvQyxFQUFFLG9CQUFvQixDQUFDO3dCQUMzRSxRQUFRLEVBQUUsb0JBQW9CO3FCQUM5QjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1gsT0FBTyxFQUFFLG1EQUE2QixzQkFBYTt3QkFDbkQsTUFBTSw2Q0FBbUM7d0JBQ3pDLElBQUksRUFBRSx5Q0FBdUI7cUJBQzdCO29CQUNELFlBQVksRUFBRSx5Q0FBdUI7b0JBQ3JDLEVBQUUsRUFBRSxJQUFJO29CQUNSLFFBQVEsRUFBRSwyQkFBYTtpQkFDdkIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDN0MsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWhERCxrRUFnREM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxRQUEwQixFQUFFLE9BQWdCO1FBQ2xFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO1FBQzNELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDO1FBQ25ELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWixPQUFPO1NBQ1A7UUFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFFLE1BQU0sZUFBZSxHQUFHLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFcEUsTUFBTSxlQUFlLEdBQUcsZUFBZSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFrQyxFQUFFLENBQUMsSUFBQSw0QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckosSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixPQUFPO1NBQ1A7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQy9CLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLDJCQUEyQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGlDQUFpQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLENBQUM7WUFDckMsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RyxPQUFPLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU1QyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN0QyxDQUFDIn0=