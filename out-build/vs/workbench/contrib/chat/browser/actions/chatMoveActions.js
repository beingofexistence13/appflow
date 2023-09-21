/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls_1, actions_1, contextkey_1, viewPane_1, contextkeys_1, views_1, chatActions_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatContributionService_1, chatService_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SIb = exports.$RIb = void 0;
    const getMoveToEditorChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        id: `workbench.action.chat.${providerId}.openInEditor`,
        title: {
            value: (0, nls_1.localize)(0, null),
            original: 'Open Session In Editor'
        },
        category: chatActions_1.$DIb,
        precondition: chatContextKeys_1.$LGb,
        f1: false,
        viewId,
        menu: {
            id: actions_1.$Ru.ViewTitle,
            when: contextkey_1.$Ii.equals('view', viewId),
            order: 0
        },
    });
    function $RIb(viewId, providerId) {
        return class MoveToEditorAction extends viewPane_1.$Keb {
            constructor() {
                super(getMoveToEditorChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                const viewModel = view.widget.viewModel;
                if (!viewModel) {
                    return;
                }
                const editorService = accessor.get(editorService_1.$9C);
                view.clear();
                await editorService.openEditor({ resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { sessionId: viewModel.sessionId }, pinned: true } });
            }
        };
    }
    exports.$RIb = $RIb;
    async function moveToSidebar(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const editorService = accessor.get(editorService_1.$9C);
        const chatContribService = accessor.get(chatContributionService_1.$fsb);
        const editorGroupService = accessor.get(editorGroupsService_1.$5C);
        const chatEditorInput = editorService.activeEditor;
        if (chatEditorInput instanceof chatEditorInput_1.$yGb && chatEditorInput.sessionId && chatEditorInput.providerId) {
            await editorService.closeEditor({ editor: chatEditorInput, groupId: editorGroupService.activeGroup.id });
            const viewId = chatContribService.getViewIdForProvider(chatEditorInput.providerId);
            const view = await viewsService.openView(viewId);
            view.loadSession(chatEditorInput.sessionId);
        }
        else {
            const chatService = accessor.get(chatService_1.$FH);
            const providerId = chatService.getProviderInfos()[0].id;
            const viewId = chatContribService.getViewIdForProvider(providerId);
            await viewsService.openView(viewId);
        }
    }
    function $SIb() {
        (0, actions_1.$Xu)(class GlobalMoveToEditorAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: `workbench.action.chat.openInEditor`,
                    title: {
                        value: (0, nls_1.localize)(1, null),
                        original: 'Open Session In Editor'
                    },
                    category: chatActions_1.$DIb,
                    precondition: chatContextKeys_1.$LGb,
                    f1: true
                });
            }
            async run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.$Nqb);
                const viewService = accessor.get(views_1.$$E);
                const editorService = accessor.get(editorService_1.$9C);
                const chatService = accessor.get(chatService_1.$FH);
                const widget = widgetService.lastFocusedWidget;
                if (!widget || !('viewId' in widget.viewContext)) {
                    const providerId = chatService.getProviderInfos()[0].id;
                    await editorService.openEditor({ resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { providerId }, pinned: true } });
                    return;
                }
                const viewModel = widget.viewModel;
                if (!viewModel) {
                    return;
                }
                const sessionId = viewModel.sessionId;
                const view = await viewService.openView(widget.viewContext.viewId);
                view.clear();
                await editorService.openEditor({ resource: chatEditorInput_1.$yGb.getNewEditorUri(), options: { target: { sessionId: sessionId }, pinned: true } });
            }
        });
        (0, actions_1.$Xu)(class GlobalMoveToSidebarAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: `workbench.action.chat.openInSidebar`,
                    title: {
                        value: (0, nls_1.localize)(2, null),
                        original: 'Open Session In Sidebar'
                    },
                    category: chatActions_1.$DIb,
                    precondition: chatContextKeys_1.$LGb,
                    f1: true,
                    menu: [{
                            id: actions_1.$Ru.EditorTitle,
                            order: 0,
                            when: contextkeys_1.$$cb.isEqualTo(chatEditorInput_1.$yGb.EditorID),
                        }]
                });
            }
            async run(accessor, ...args) {
                return moveToSidebar(accessor);
            }
        });
    }
    exports.$SIb = $SIb;
});
//# sourceMappingURL=chatMoveActions.js.map