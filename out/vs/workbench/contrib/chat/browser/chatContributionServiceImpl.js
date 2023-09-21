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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/chatViewPane", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, codicons_1, lifecycle_1, resources, nls_1, actions_1, contextkey_1, descriptors_1, platform_1, viewPaneContainer_1, contributions_1, views_1, chatActions_1, chatClearActions_1, chatMoveActions_1, chatQuickInputActions_1, chatViewPane_1, chatContributionService_1, extensionsRegistry) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatContributionService = exports.ChatExtensionPointHandler = void 0;
    const chatExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'interactiveSession',
        jsonSchema: {
            description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession', 'Contributes an Interactive Session provider'),
            type: 'array',
            items: {
                additionalProperties: false,
                type: 'object',
                defaultSnippets: [{ body: { id: '', program: '', runtime: '' } }],
                required: ['id', 'label'],
                properties: {
                    id: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.id', "Unique identifier for this Interactive Session provider."),
                        type: 'string'
                    },
                    label: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.label', "Display name for this Interactive Session provider."),
                        type: 'string'
                    },
                    icon: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.icon', "An icon for this Interactive Session provider."),
                        type: 'string'
                    },
                    when: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.interactiveSession.when', "A condition which must be true to enable this Interactive Session provider."),
                        type: 'string'
                    },
                }
            }
        },
        activationEventsGenerator: (contributions, result) => {
            for (const contrib of contributions) {
                result.push(`onInteractiveSession:${contrib.id}`);
            }
        },
    });
    let ChatExtensionPointHandler = class ChatExtensionPointHandler {
        constructor(_chatContributionService) {
            this._chatContributionService = _chatContributionService;
            this._registrationDisposables = new Map();
            this._viewContainer = this.registerViewContainer();
            this.handleAndRegisterChatExtensions();
        }
        handleAndRegisterChatExtensions() {
            chatExtensionPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionDisposable = new lifecycle_1.DisposableStore();
                    for (const providerDescriptor of extension.value) {
                        this.registerChatProvider(providerDescriptor);
                        const extensionIcon = extension.description.icon ?
                            resources.joinPath(extension.description.extensionLocation, extension.description.icon) :
                            undefined;
                        this._chatContributionService.registerChatProvider({
                            ...providerDescriptor,
                            extensionIcon
                        });
                    }
                    this._registrationDisposables.set(extension.description.identifier.value, extensionDisposable);
                }
                for (const extension of delta.removed) {
                    const registration = this._registrationDisposables.get(extension.description.identifier.value);
                    if (registration) {
                        registration.dispose();
                        this._registrationDisposables.delete(extension.description.identifier.value);
                    }
                    for (const providerDescriptor of extension.value) {
                        this._chatContributionService.deregisterChatProvider(providerDescriptor.id);
                    }
                }
            });
        }
        registerViewContainer() {
            // Register View Container
            const title = (0, nls_1.localize)('chat.viewContainer.label', "Chat");
            const icon = codicons_1.Codicon.commentDiscussion;
            const viewContainerId = chatViewPane_1.CHAT_SIDEBAR_PANEL_ID;
            const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: viewContainerId,
                title: { value: title, original: 'Chat' },
                icon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [viewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
                storageId: viewContainerId,
                hideIfEmpty: true,
                order: 100,
            }, 0 /* ViewContainerLocation.Sidebar */);
            return viewContainer;
        }
        registerChatProvider(providerDescriptor) {
            // Register View
            const viewId = this._chatContributionService.getViewIdForProvider(providerDescriptor.id);
            const viewDescriptor = [{
                    id: viewId,
                    containerIcon: this._viewContainer.icon,
                    containerTitle: this._viewContainer.title.value,
                    name: providerDescriptor.label,
                    canToggleVisibility: false,
                    canMoveView: true,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(chatViewPane_1.ChatViewPane, [{ providerId: providerDescriptor.id }]),
                    when: contextkey_1.ContextKeyExpr.deserialize(providerDescriptor.when)
                }];
            platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews(viewDescriptor, this._viewContainer);
            // Per-provider actions
            // Actions in view title
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, actions_1.registerAction2)((0, chatActions_1.getHistoryAction)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.registerAction2)((0, chatClearActions_1.getClearAction)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.registerAction2)((0, chatMoveActions_1.getMoveToEditorAction)(viewId, providerDescriptor.id)));
            // "Open Chat" Actions
            disposables.add((0, actions_1.registerAction2)((0, chatActions_1.getOpenChatEditorAction)(providerDescriptor.id, providerDescriptor.label, providerDescriptor.when)));
            disposables.add((0, actions_1.registerAction2)((0, chatQuickInputActions_1.getQuickChatActionForProvider)(providerDescriptor.id, providerDescriptor.label)));
            return {
                dispose: () => {
                    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).deregisterViews(viewDescriptor, this._viewContainer);
                    platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).deregisterViewContainer(this._viewContainer);
                    disposables.dispose();
                }
            };
        }
    };
    exports.ChatExtensionPointHandler = ChatExtensionPointHandler;
    exports.ChatExtensionPointHandler = ChatExtensionPointHandler = __decorate([
        __param(0, chatContributionService_1.IChatContributionService)
    ], ChatExtensionPointHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ChatExtensionPointHandler, 1 /* LifecyclePhase.Starting */);
    class ChatContributionService {
        constructor() {
            this._registeredProviders = new Map();
        }
        getViewIdForProvider(providerId) {
            return chatViewPane_1.ChatViewPane.ID + '.' + providerId;
        }
        registerChatProvider(provider) {
            this._registeredProviders.set(provider.id, provider);
        }
        deregisterChatProvider(providerId) {
            this._registeredProviders.delete(providerId);
        }
        get registeredProviders() {
            return Array.from(this._registeredProviders.values());
        }
    }
    exports.ChatContributionService = ChatContributionService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENvbnRyaWJ1dGlvblNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRDb250cmlidXRpb25TZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QmhHLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQWlDO1FBQ3ZILGNBQWMsRUFBRSxvQkFBb0I7UUFDcEMsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGlEQUFpRCxFQUFFLDZDQUE2QyxDQUFDO1lBQ3ZILElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFO2dCQUNOLG9CQUFvQixFQUFFLEtBQUs7Z0JBQzNCLElBQUksRUFBRSxRQUFRO2dCQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUNqRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2dCQUN6QixVQUFVLEVBQUU7b0JBQ1gsRUFBRSxFQUFFO3dCQUNILFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxvREFBb0QsRUFBRSwwREFBMEQsQ0FBQzt3QkFDdkksSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsS0FBSyxFQUFFO3dCQUNOLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyx1REFBdUQsRUFBRSxxREFBcUQsQ0FBQzt3QkFDckksSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsSUFBSSxFQUFFO3dCQUNMLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxzREFBc0QsRUFBRSxnREFBZ0QsQ0FB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