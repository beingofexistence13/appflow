/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls_1, actions_1, contextkey_1, viewPane_1, contextkeys_1, views_1, chatActions_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatContributionService_1, chatService_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerMoveActions = exports.getMoveToEditorAction = void 0;
    const getMoveToEditorChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        id: `workbench.action.chat.${providerId}.openInEditor`,
        title: {
            value: (0, nls_1.localize)('chat.openInEditor.label', "Open Session In Editor"),
            original: 'Open Session In Editor'
        },
        category: chatActions_1.CHAT_CATEGORY,
        precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
        f1: false,
        viewId,
        menu: {
            id: actions_1.MenuId.ViewTitle,
            when: contextkey_1.ContextKeyExpr.equals('view', viewId),
            order: 0
        },
    });
    function getMoveToEditorAction(viewId, providerId) {
        return class MoveToEditorAction extends viewPane_1.ViewAction {
            constructor() {
                super(getMoveToEditorChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                const viewModel = view.widget.viewModel;
                if (!viewModel) {
                    return;
                }
                const editorService = accessor.get(editorService_1.IEditorService);
                view.clear();
                await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { sessionId: viewModel.sessionId }, pinned: true } });
            }
        };
    }
    exports.getMoveToEditorAction = getMoveToEditorAction;
    async function moveToSidebar(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const chatContribService = accessor.get(chatContributionService_1.IChatContributionService);
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const chatEditorInput = editorService.activeEditor;
        if (chatEditorInput instanceof chatEditorInput_1.ChatEditorInput && chatEditorInput.sessionId && chatEditorInput.providerId) {
            await editorService.closeEditor({ editor: chatEditorInput, groupId: editorGroupService.activeGroup.id });
            const viewId = chatContribService.getViewIdForProvider(chatEditorInput.providerId);
            const view = await viewsService.openView(viewId);
            view.loadSession(chatEditorInput.sessionId);
        }
        else {
            const chatService = accessor.get(chatService_1.IChatService);
            const providerId = chatService.getProviderInfos()[0].id;
            const viewId = chatContribService.getViewIdForProvider(providerId);
            await viewsService.openView(viewId);
        }
    }
    function registerMoveActions() {
        (0, actions_1.registerAction2)(class GlobalMoveToEditorAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.chat.openInEditor`,
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.openInEditor.label', "Open Session In Editor"),
                        original: 'Open Session In Editor'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true
                });
            }
            async run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                const viewService = accessor.get(views_1.IViewsService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const chatService = accessor.get(chatService_1.IChatService);
                const widget = widgetService.lastFocusedWidget;
                if (!widget || !('viewId' in widget.viewContext)) {
                    const providerId = chatService.getProviderInfos()[0].id;
                    await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { providerId }, pinned: true } });
                    return;
                }
                const viewModel = widget.viewModel;
                if (!viewModel) {
                    return;
                }
                const sessionId = viewModel.sessionId;
                const view = await viewService.openView(widget.viewContext.viewId);
                view.clear();
                await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { sessionId: sessionId }, pinned: true } });
            }
        });
        (0, actions_1.registerAction2)(class GlobalMoveToSidebarAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.chat.openInSidebar`,
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.openInSidebar.label', "Open Session In Sidebar"),
                        original: 'Open Session In Sidebar'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    menu: [{
                            id: actions_1.MenuId.EditorTitle,
                            order: 0,
                            when: contextkeys_1.ActiveEditorContext.isEqualTo(chatEditorInput_1.ChatEditorInput.EditorID),
                        }]
                });
            }
            async run(accessor, ...args) {
                return moveToSidebar(accessor);
            }
        });
    }
    exports.registerMoveActions = registerMoveActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE1vdmVBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdE1vdmVBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsTUFBTSwrQ0FBK0MsR0FBRyxDQUFDLE1BQWMsRUFBRSxVQUFrQixFQUFrRCxFQUFFLENBQUMsQ0FBQztRQUNoSixFQUFFLEVBQUUseUJBQXlCLFVBQVUsZUFBZTtRQUN0RCxLQUFLLEVBQUU7WUFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsd0JBQXdCLENBQUM7WUFDcEUsUUFBUSxFQUFFLHdCQUF3QjtTQUNsQztRQUNELFFBQVEsRUFBRSwyQkFBYTtRQUN2QixZQUFZLEVBQUUseUNBQXVCO1FBQ3JDLEVBQUUsRUFBRSxLQUFLO1FBQ1QsTUFBTTtRQUNOLElBQUksRUFBRTtZQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7WUFDcEIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDM0MsS0FBSyxFQUFFLENBQUM7U0FDUjtLQUNELENBQUMsQ0FBQztJQUVILFNBQWdCLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxVQUFrQjtRQUN2RSxPQUFPLE1BQU0sa0JBQW1CLFNBQVEscUJBQXdCO1lBQy9EO2dCQUNDLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RSxDQUFDO1lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUEwQixFQUFFLElBQWtCO2dCQUM3RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPO2lCQUNQO2dCQUVELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2IsTUFBTSxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLGlDQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFzQixFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1SyxDQUFDO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFqQkQsc0RBaUJDO0lBRUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxRQUEwQjtRQUN0RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0RBQXdCLENBQUMsQ0FBQztRQUNsRSxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMENBQW9CLENBQUMsQ0FBQztRQUU5RCxNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDO1FBQ25ELElBQUksZUFBZSxZQUFZLGlDQUFlLElBQUksZUFBZSxDQUFDLFNBQVMsSUFBSSxlQUFlLENBQUMsVUFBVSxFQUFFO1lBQzFHLE1BQU0sYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRixNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFpQixDQUFDO1lBQ2pFLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVDO2FBQU07WUFDTixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFZLENBQUMsQ0FBQztZQUMvQyxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDeEQsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkUsTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3BDO0lBQ0YsQ0FBQztJQUVELFNBQWdCLG1CQUFtQjtRQUNsQyxJQUFBLHlCQUFlLEVBQUMsTUFBTSx3QkFBeUIsU0FBUSxpQkFBTztZQUM3RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLG9DQUFvQztvQkFDeEMsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx1Q0FBdUMsRUFBRSx3QkFBd0IsQ0FBQzt3QkFDbEYsUUFBUSxFQUFFLHdCQUF3QjtxQkFDbEM7b0JBQ0QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixZQUFZLEVBQUUseUNBQXVCO29CQUNyQyxFQUFFLEVBQUUsSUFBSTtpQkFDUixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDbkQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO2dCQUUvQyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ2pELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDeEQsTUFBTSxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLGlDQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFzQixFQUFFLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3ZKLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPO2lCQUNQO2dCQUVELE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBaUIsQ0FBQztnQkFDbkYsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNiLE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQ0FBZSxDQUFDLGVBQWUsRUFBRSxFQUFFLE9BQU8sRUFBc0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsSyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0seUJBQTBCLFNBQVEsaUJBQU87WUFDOUQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSxxQ0FBcUM7b0JBQ3pDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0NBQXdDLEVBQUUseUJBQXlCLENBQUM7d0JBQ3BGLFFBQVEsRUFBRSx5QkFBeUI7cUJBQ25DO29CQUNELFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsWUFBWSxFQUFFLHlDQUF1QjtvQkFDckMsRUFBRSxFQUFFLElBQUk7b0JBQ1IsSUFBSSxFQUFFLENBQUM7NEJBQ04sRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVzs0QkFDdEIsS0FBSyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxFQUFFLGlDQUFtQixDQUFDLFNBQVMsQ0FBQyxpQ0FBZSxDQUFDLFFBQVEsQ0FBQzt5QkFDN0QsQ0FBQztpQkFDRixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDbkQsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUEvREQsa0RBK0RDIn0=