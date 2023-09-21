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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/chat/browser/chat.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatCodeblockActions", "vs/workbench/contrib/chat/browser/actions/chatCopyActions", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/actions/chatTitleActions", "vs/workbench/contrib/chat/browser/actions/chatImportExport", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatContributionServiceImpl", "vs/workbench/contrib/chat/browser/chatEditor", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatServiceImpl", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/browser/chatAccessibilityService", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatProvider", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/platform/commands/common/commands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/browser/actions/chatFileTreeActions", "vs/workbench/contrib/chat/browser/chatQuick", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/browser/contrib/chatInputEditorContrib", "vs/workbench/contrib/chat/browser/contrib/chatHistoryVariables", "../common/chatColors"], function (require, exports, lifecycle_1, network_1, platform_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_2, editor_1, contributions_1, editor_2, chatActions_1, chatCodeblockActions_1, chatCopyActions_1, chatExecuteActions_1, chatQuickInputActions_1, chatTitleActions_1, chatImportExport_1, chat_1, chatContributionServiceImpl_1, chatEditor_1, chatEditorInput_1, chatWidget_1, chatContributionService_1, chatService_1, chatServiceImpl_1, chatWidgetHistoryService_1, editorResolverService_1, chatMoveActions_1, chatClearActions_1, accessibleView_1, chatViewModel_1, chatContextKeys_1, chatAccessibilityService_1, codeEditorService_1, chatModel_1, chatProvider_1, chatSlashCommands_1, accessibilityContributions_1, accessibleViewActions_1, commands_1, chatVariables_1, chatFileTreeActions_1, chatQuick_1, chatAgents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register configuration
    const configurationRegistry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'chatSidebar',
        title: nls.localize(0, null),
        type: 'object',
        properties: {
            'chat.editor.fontSize': {
                type: 'number',
                description: nls.localize(1, null),
                default: platform_1.$j ? 12 : 14,
            },
            'chat.editor.fontFamily': {
                type: 'string',
                description: nls.localize(2, null),
                default: 'default'
            },
            'chat.editor.fontWeight': {
                type: 'string',
                description: nls.localize(3, null),
                default: 'default'
            },
            'chat.editor.wordWrap': {
                type: 'string',
                description: nls.localize(4, null),
                default: 'off',
                enum: ['on', 'off']
            },
            'chat.editor.lineHeight': {
                type: 'number',
                description: nls.localize(5, null),
                default: 0
            }
        }
    });
    platform_2.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(chatEditor_1.$CIb, chatEditorInput_1.$yGb.EditorID, nls.localize(6, null)), [
        new descriptors_1.$yh(chatEditorInput_1.$yGb)
    ]);
    let ChatResolverContribution = class ChatResolverContribution extends lifecycle_1.$kc {
        constructor(editorResolverService, instantiationService) {
            super();
            this.B(editorResolverService.registerEditor(`${network_1.Schemas.vscodeChatSesssion}:**/**`, {
                id: chatEditorInput_1.$yGb.EditorID,
                label: nls.localize(7, null),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {
                singlePerResource: true,
                canSupportResource: resource => resource.scheme === network_1.Schemas.vscodeChatSesssion
            }, {
                createEditorInput: ({ resource, options }) => {
                    return { editor: instantiationService.createInstance(chatEditorInput_1.$yGb, resource, options), options };
                }
            }));
        }
    };
    ChatResolverContribution = __decorate([
        __param(0, editorResolverService_1.$pbb),
        __param(1, instantiation_1.$Ah)
    ], ChatResolverContribution);
    class ChatAccessibleViewContribution extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$uGb.addImplementation(100, 'panelChat', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const widgetService = accessor.get(chat_1.$Nqb);
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
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
                    const isWelcome = focusedItem instanceof chatModel_1.$BH;
                    let responseContent = (0, chatViewModel_1.$Iqb)(focusedItem) ? focusedItem.response.asString() : undefined;
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
                    const responses = verifiedWidget.viewModel?.getItems().filter(i => (0, chatViewModel_1.$Iqb)(i));
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
                            (0, accessibilityContributions_1.$fJb)(responseIndex, length, 'next');
                            renderAccessibleView(accessibleViewService, widgetService, codeEditorService);
                        },
                        previous() {
                            verifiedWidget.moveFocus(focusedItem, 'previous');
                            (0, accessibilityContributions_1.$fJb)(responseIndex, length, 'previous');
                            renderAccessibleView(accessibleViewService, widgetService, codeEditorService);
                        },
                        options: { type: "view" /* AccessibleViewType.View */ }
                    });
                    return true;
                }
            }, chatContextKeys_1.$JGb));
        }
    }
    let ChatSlashStaticSlashCommandsContribution = class ChatSlashStaticSlashCommandsContribution extends lifecycle_1.$kc {
        constructor(slashCommandService, commandService) {
            super();
            this.q.add(slashCommandService.registerSlashCommand({
                command: 'clear',
                detail: nls.localize(8, null),
                sortText: 'z_clear',
                executeImmediately: true
            }, async () => {
                commandService.executeCommand(chatClearActions_1.$OIb);
            }));
        }
    };
    ChatSlashStaticSlashCommandsContribution = __decorate([
        __param(0, chatSlashCommands_1.$WJ),
        __param(1, commands_1.$Fr)
    ], ChatSlashStaticSlashCommandsContribution);
    const workbenchContributionsRegistry = platform_2.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatResolverContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatSlashStaticSlashCommandsContribution, 4 /* LifecyclePhase.Eventually */);
    platform_2.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(chatEditorInput_1.$yGb.TypeID, chatEditorInput_1.$AGb);
    (0, chatActions_1.$FIb)();
    (0, chatCopyActions_1.$IIb)();
    (0, chatCodeblockActions_1.$UGb)();
    (0, chatFileTreeActions_1.$hJb)();
    (0, chatTitleActions_1.$MIb)();
    (0, chatExecuteActions_1.$OGb)();
    (0, chatQuickInputActions_1.$KIb)();
    (0, chatImportExport_1.$NIb)();
    (0, chatMoveActions_1.$SIb)();
    (0, chatClearActions_1.$PIb)();
    (0, extensions_1.$mr)(chatService_1.$FH, chatServiceImpl_1.$YIb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chatContributionService_1.$fsb, chatContributionServiceImpl_1.$UIb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chat_1.$Nqb, chatWidget_1.$AIb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chat_1.$Oqb, chatQuick_1.$iJb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chat_1.$Pqb, chatAccessibilityService_1.$ZIb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chatWidgetHistoryService_1.$QGb, chatWidgetHistoryService_1.$RGb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chatProvider_1.$oH, chatProvider_1.$pH, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chatSlashCommands_1.$WJ, chatSlashCommands_1.$XJ, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chatAgents_1.$rH, chatAgents_1.$sH, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(chatVariables_1.$DH, chatVariables_1.$EH, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=chat.contribution.js.map