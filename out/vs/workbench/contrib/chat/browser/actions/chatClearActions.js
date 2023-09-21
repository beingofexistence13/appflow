/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatClear", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys"], function (require, exports, codicons_1, nls_1, actions_1, contextkey_1, viewPane_1, contextkeys_1, chatActions_1, chatClear_1, chat_1, chatEditorInput_1, chatContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getClearAction = exports.registerClearActions = exports.ACTION_ID_CLEAR_CHAT = void 0;
    exports.ACTION_ID_CLEAR_CHAT = `workbench.action.chat.clear`;
    function registerClearActions() {
        (0, actions_1.registerAction2)(class ClearEditorAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chatEditor.clear',
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.clear.label', "Clear"),
                        original: 'Clear'
                    },
                    icon: codicons_1.Codicon.clearAll,
                    f1: false,
                    menu: [{
                            id: actions_1.MenuId.EditorTitle,
                            group: 'navigation',
                            order: 0,
                            when: contextkeys_1.ActiveEditorContext.isEqualTo(chatEditorInput_1.ChatEditorInput.EditorID),
                        }]
                });
            }
            async run(accessor, ...args) {
                await (0, chatClear_1.clearChatEditor)(accessor);
            }
        });
        (0, actions_1.registerAction2)(class GlobalClearChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.ACTION_ID_CLEAR_CHAT,
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.clear.label', "Clear"),
                        original: 'Clear'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.clearAll,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */,
                        mac: {
                            primary: 256 /* KeyMod.WinCtrl */ | 42 /* KeyCode.KeyL */
                        },
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION
                    }
                });
            }
            run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                const widget = widgetService.lastFocusedWidget;
                if (!widget) {
                    return;
                }
                widget.clear();
            }
        });
    }
    exports.registerClearActions = registerClearActions;
    const getClearChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        viewId,
        id: `workbench.action.chat.${providerId}.clear`,
        title: {
            value: (0, nls_1.localize)('interactiveSession.clear.label', "Clear"),
            original: 'Clear'
        },
        menu: {
            id: actions_1.MenuId.ViewTitle,
            when: contextkey_1.ContextKeyExpr.equals('view', viewId),
            group: 'navigation',
            order: 0
        },
        category: chatActions_1.CHAT_CATEGORY,
        icon: codicons_1.Codicon.clearAll,
        f1: false
    });
    function getClearAction(viewId, providerId) {
        return class ClearAction extends viewPane_1.ViewAction {
            constructor() {
                super(getClearChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                await view.clear();
            }
        };
    }
    exports.getClearAction = getClearAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENsZWFyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9hY3Rpb25zL2NoYXRDbGVhckFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JuRixRQUFBLG9CQUFvQixHQUFHLDZCQUE2QixDQUFDO0lBRWxFLFNBQWdCLG9CQUFvQjtRQUVuQyxJQUFBLHlCQUFlLEVBQUMsTUFBTSxpQkFBa0IsU0FBUSxpQkFBTztZQUN0RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLG1DQUFtQztvQkFDdkMsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSxPQUFPLENBQUM7d0JBQzFELFFBQVEsRUFBRSxPQUFPO3FCQUNqQjtvQkFDRCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxRQUFRO29CQUN0QixFQUFFLEVBQUUsS0FBSztvQkFDVCxJQUFJLEVBQUUsQ0FBQzs0QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXOzRCQUN0QixLQUFLLEVBQUUsWUFBWTs0QkFDbkIsS0FBSyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxFQUFFLGlDQUFtQixDQUFDLFNBQVMsQ0FBQyxpQ0FBZSxDQUFDLFFBQVEsQ0FBQzt5QkFDN0QsQ0FBQztpQkFDRixDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDbkQsTUFBTSxJQUFBLDJCQUFlLEVBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsQ0FBQztTQUNELENBQUMsQ0FBQztRQUdILElBQUEseUJBQWUsRUFBQyxNQUFNLHFCQUFzQixTQUFRLGlCQUFPO1lBQzFEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsNEJBQW9CO29CQUN4QixLQUFLLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLE9BQU8sQ0FBQzt3QkFDMUQsUUFBUSxFQUFFLE9BQU87cUJBQ2pCO29CQUNELFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsSUFBSSxFQUFFLGtCQUFPLENBQUMsUUFBUTtvQkFDdEIsWUFBWSxFQUFFLHlDQUF1QjtvQkFDckMsRUFBRSxFQUFFLElBQUk7b0JBQ1IsVUFBVSxFQUFFO3dCQUNYLE1BQU0sNkNBQW1DO3dCQUN6QyxPQUFPLEVBQUUsaURBQTZCO3dCQUN0QyxHQUFHLEVBQUU7NEJBQ0osT0FBTyxFQUFFLGdEQUE2Qjt5QkFDdEM7d0JBQ0QsSUFBSSxFQUFFLHlDQUF1QjtxQkFDN0I7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDN0MsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO2dCQUV2RCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osT0FBTztpQkFDUDtnQkFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUE1REQsb0RBNERDO0lBRUQsTUFBTSx3Q0FBd0MsR0FBRyxDQUFDLE1BQWMsRUFBRSxVQUFrQixFQUFrRCxFQUFFLENBQUMsQ0FBQztRQUN6SSxNQUFNO1FBQ04sRUFBRSxFQUFFLHlCQUF5QixVQUFVLFFBQVE7UUFDL0MsS0FBSyxFQUFFO1lBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLE9BQU8sQ0FBQztZQUMxRCxRQUFRLEVBQUUsT0FBTztTQUNqQjtRQUNELElBQUksRUFBRTtZQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7WUFDcEIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDM0MsS0FBSyxFQUFFLFlBQVk7WUFDbkIsS0FBSyxFQUFFLENBQUM7U0FDUjtRQUNELFFBQVEsRUFBRSwyQkFBYTtRQUN2QixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxRQUFRO1FBQ3RCLEVBQUUsRUFBRSxLQUFLO0tBQ1QsQ0FBQyxDQUFDO0lBRUgsU0FBZ0IsY0FBYyxDQUFDLE1BQWMsRUFBRSxVQUFrQjtRQUNoRSxPQUFPLE1BQU0sV0FBWSxTQUFRLHFCQUF3QjtZQUN4RDtnQkFDQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBMEIsRUFBRSxJQUFrQjtnQkFDN0QsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBVkQsd0NBVUMifQ==