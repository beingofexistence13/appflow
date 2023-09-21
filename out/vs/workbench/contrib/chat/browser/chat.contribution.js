/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatCodeblockActions", "vs/workbench/contrib/chat/browser/actions/chatCopyActions", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/actions/chatTitleActions", "vs/workbench/contrib/chat/browser/actions/chatImportExport", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatContributionServiceImpl", "vs/workbench/contrib/chat/browser/chatEditor", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatServiceImpl", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/browser/chatAccessibilityService", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatProvider", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/platform/commands/common/commands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/browser/actions/chatFileTreeActions", "vs/workbench/contrib/chat/browser/chatQuick", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/browser/contrib/chatInputEditorContrib", "vs/workbench/contrib/chat/browser/contrib/chatHistoryVariables", "../common/chatColors"], function (require, exports, lifecycle_1, network_1, platform_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_2, editor_1, contributions_1, editor_2, chatActions_1, chatCodeblockActions_1, chatCopyActions_1, chatExecuteActions_1, chatQuickInputActions_1, chatTitleActions_1, chatImportExport_1, chat_1, chatContributionServiceImpl_1, chatEditor_1, chatEditorInput_1, chatWidget_1, chatContributionService_1, chatService_1, chatServiceImpl_1, chatWidgetHistoryService_1, editorResolverService_1, chatMoveActions_1, chatClearActions_1, accessibleView_1, chatViewModel_1, chatContextKeys_1, chatAccessibilityService_1, codeEditorService_1, chatModel_1, chatProvider_1, chatSlashCommands_1, accessibilityContributions_1, accessibleViewActions_1, commands_1, chatVariables_1, chatFileTreeActions_1, chatQuick_1, chatAgents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register configuration
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'chatSidebar',
        title: nls.localize('interactiveSessionConfigurationTitle', "Chat"),
        type: 'object',
        properties: {
            'chat.editor.fontSize': {
                type: 'number',
                description: nls.localize('interactiveSession.editor.fontSize', "Controls the font size in pixels in chat codeblocks."),
                default: platform_1.isMacintosh ? 12 : 14,
            },
            'chat.editor.fontFamily': {
                type: 'string',
                description: nls.localize('interactiveSession.editor.fontFamily', "Controls the font family in chat codeblocks."),
                default: 'default'
            },
            'chat.editor.fontWeight': {
                type: 'string',
                description: nls.localize('interactiveSession.editor.fontWeight', "Controls the font weight in chat codeblocks."),
                default: 'default'
            },
            'chat.editor.wordWrap': {
                type: 'string',
                description: nls.localize('interactiveSession.editor.wordWrap', "Controls whether lines should wrap in chat codeblocks."),
                default: 'off',
                enum: ['on', 'off']
            },
            'chat.editor.lineHeight': {
                type: 'number',
                description: nls.localize('interactiveSession.editor.lineHeight', "Controls the line height in pixels in chat codeblocks. Use 0 to compute the line height from the font size."),
                default: 0
            }
        }
    });
    platform_2.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(chatEditor_1.ChatEditor, chatEditorInput_1.ChatEditorInput.EditorID, nls.localize('chat', "Chat")), [
        new descriptors_1.SyncDescriptor(chatEditorInput_1.ChatEditorInput)
    ]);
    let ChatResolverContribution = class ChatResolverContribution extends lifecycle_1.Disposable {
        constructor(editorResolverService, instantiationService) {
            super();
            this._register(editorResolverService.registerEditor(`${network_1.Schemas.vscodeChatSesssion}:**/**`, {
                id: chatEditorInput_1.ChatEditorInput.EditorID,
                label: nls.localize('chat', "Chat"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {
                singlePerResource: true,
                canSupportResource: resource => resource.scheme === network_1.Schemas.vscodeChatSesssion
            }, {
                createEditorInput: ({ resource, options }) => {
                    return { editor: instantiationService.createInstance(chatEditorInput_1.ChatEditorInput, resource, options), options };
                }
            }));
        }
    };
    ChatResolverContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, instantiation_1.IInstantiationService)
    ], ChatResolverContribution);
    class ChatAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(100, 'panelChat', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                return renderAccessibleView(accessibleViewService, widgetService, codeEditorService, true);
                function renderAccessibleView(accessibleViewService, widgetService, codeEditorService, initialRender) {
                    const widget = widgetService.lastFocusedWidget;
                    if (!widget) {
                        return false;
                    }
                    const chatInputFocused = initialRender && !!codeEditorService.getFocusedCodeEditor();
                    if (initialRender && chatInputFocused) {
                        widget.focusLastMessage();
                    }
                    if (!widget) {
                        return false;
                    }
                    const verifiedWidget = widget;
                    const focusedItem = verifiedWidget.getFocus();
                    if (!focusedItem) {
                        return false;
                    }
                    widget.focus(focusedItem);
                    const isWelcome = focusedItem instanceof chatModel_1.ChatWelcomeMessageModel;
                    let responseContent = (0, chatViewModel_1.isResponseVM)(focusedItem) ? focusedItem.response.asString() : undefined;
                    if (isWelcome) {
                        const welcomeReplyContents = [];
                        for (const content of focusedItem.content) {
                            if (Array.isArray(content)) {
                                welcomeReplyContents.push(...content.map(m => m.message));
                            }
                            else {
                                welcomeReplyContents.push(content.value);
                            }
                        }
                        responseContent = welcomeReplyContents.join('\n');
                    }
                    if (!responseContent) {
                        return false;
                    }
                    const responses = verifiedWidget.viewModel?.getItems().filter(i => (0, chatViewModel_1.isResponseVM)(i));
                    const length = responses?.length;
                    const responseIndex = responses?.findIndex(i => i === focusedItem);
                    accessibleViewService.show({
                        verbositySettingKey: "accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */,
                        provideContent() { return responseContent; },
                        onClose() {
                            verifiedWidget.reveal(focusedItem);
                            if (chatInputFocused) {
                                verifiedWidget.focusInput();
                            }
                            else {
                                verifiedWidget.focus(focusedItem);
                            }
                        },
                        next() {
                            verifiedWidget.moveFocus(focusedItem, 'next');
                            (0, accessibilityContributions_1.alertFocusChange)(responseIndex, length, 'next');
                            renderAccessibleView(accessibleViewService, widgetService, codeEditorService);
                        },
                        previous() {
                            verifiedWidget.moveFocus(focusedItem, 'previous');
                            (0, accessibilityContributions_1.alertFocusChange)(responseIndex, length, 'previous');
                            renderAccessibleView(accessibleViewService, widgetService, codeEditorService);
                        },
                        options: { type: "view" /* AccessibleViewType.View */ }
                    });
                    return true;
                }
            }, chatContextKeys_1.CONTEXT_IN_CHAT_SESSION));
        }
    }
    let ChatSlashStaticSlashCommandsContribution = class ChatSlashStaticSlashCommandsContribution extends lifecycle_1.Disposable {
        constructor(slashCommandService, commandService) {
            super();
            this._store.add(slashCommandService.registerSlashCommand({
                command: 'clear',
                detail: nls.localize('clear', "Clear the session"),
                sortText: 'z_clear',
                executeImmediately: true
            }, async () => {
                commandService.executeCommand(chatClearActions_1.ACTION_ID_CLEAR_CHAT);
            }));
        }
    };
    ChatSlashStaticSlashCommandsContribution = __decorate([
        __param(0, chatSlashCommands_1.IChatSlashCommandService),
        __param(1, commands_1.ICommandService)
    ], ChatSlashStaticSlashCommandsContribution);
    const workbenchContributionsRegistry = platform_2.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatResolverContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatSlashStaticSlashCommandsContribution, 4 /* LifecyclePhase.Eventually */);
    platform_2.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(chatEditorInput_1.ChatEditorInput.TypeID, chatEditorInput_1.ChatEditorInputSerializer);
    (0, chatActions_1.registerChatActions)();
    (0, chatCopyActions_1.registerChatCopyActions)();
    (0, chatCodeblockActions_1.registerChatCodeBlockActions)();
    (0, chatFileTreeActions_1.registerChatFileTreeActions)();
    (0, chatTitleActions_1.registerChatTitleActions)();
    (0, chatExecuteActions_1.registerChatExecuteActions)();
    (0, chatQuickInputActions_1.registerQuickChatActions)();
    (0, chatImportExport_1.registerChatExportActions)();
    (0, chatMoveActions_1.registerMoveActions)();
    (0, chatClearActions_1.registerClearActions)();
    (0, extensions_1.registerSingleton)(chatService_1.IChatService, chatServiceImpl_1.ChatService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatContributionService_1.IChatContributionService, chatContributionServiceImpl_1.ChatContributionService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chat_1.IChatWidgetService, chatWidget_1.ChatWidgetService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chat_1.IQuickChatService, chatQuick_1.QuickChatService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chat_1.IChatAccessibilityService, chatAccessibilityService_1.ChatAccessibilityService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatWidgetHistoryService_1.IChatWidgetHistoryService, chatWidgetHistoryService_1.ChatWidgetHistoryService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatProvider_1.IChatProviderService, chatProvider_1.ChatProviderService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatSlashCommands_1.IChatSlashCommandService, chatSlashCommands_1.ChatSlashCommandService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatAgents_1.IChatAgentService, chatAgents_1.ChatAgentService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatVariables_1.IChatVariablesService, chatVariables_1.ChatVariablesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvY2hhdC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUF1RGhHLHlCQUF5QjtJQUN6QixNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN6RyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQztRQUMzQyxFQUFFLEVBQUUsYUFBYTtRQUNqQixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxNQUFNLENBQUM7UUFDbkUsSUFBSSxFQUFFLFFBQVE7UUFDZCxVQUFVLEVBQUU7WUFDWCxzQkFBc0IsRUFBRTtnQkFDdkIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEVBQUUsc0RBQXNELENBQUM7Z0JBQ3ZILE9BQU8sRUFBRSxzQkFBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7YUFDOUI7WUFDRCx3QkFBd0IsRUFBRTtnQkFDekIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUUsOENBQThDLENBQUM7Z0JBQ2pILE9BQU8sRUFBRSxTQUFTO2FBQ2xCO1lBQ0Qsd0JBQXdCLEVBQUU7Z0JBQ3pCLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLDhDQUE4QyxDQUFDO2dCQUNqSCxPQUFPLEVBQUUsU0FBUzthQUNsQjtZQUNELHNCQUFzQixFQUFFO2dCQUN2QixJQUFJLEVBQUUsUUFBUTtn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