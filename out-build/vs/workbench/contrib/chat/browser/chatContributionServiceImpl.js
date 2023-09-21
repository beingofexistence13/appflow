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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/nls!vs/workbench/contrib/chat/browser/chatContributionServiceImpl", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/chatViewPane", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, codicons_1, lifecycle_1, resources, nls_1, actions_1, contextkey_1, descriptors_1, platform_1, viewPaneContainer_1, contributions_1, views_1, chatActions_1, chatClearActions_1, chatMoveActions_1, chatQuickInputActions_1, chatViewPane_1, chatContributionService_1, extensionsRegistry) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UIb = exports.$TIb = void 0;
    const chatExtensionPoint = extensionsRegistry.$2F.registerExtensionPoint({
        extensionPoint: 'interactiveSession',
        jsonSchema: {
            description: (0, nls_1.localize)(0, null),
            type: 'array',
            items: {
                additionalProperties: false,
                type: 'object',
                defaultSnippets: [{ body: { id: '', program: '', runtime: '' } }],
                required: ['id', 'label'],
                properties: {
                    id: {
                        description: (0, nls_1.localize)(1, null),
                        type: 'string'
                    },
                    label: {
                        description: (0, nls_1.localize)(2, null),
                        type: 'string'
                    },
                    icon: {
                        description: (0, nls_1.localize)(3, null),
                        type: 'string'
                    },
                    when: {
                        description: (0, nls_1.localize)(4, null),
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
    let $TIb = class $TIb {
        constructor(_chatContributionService) {
            this._chatContributionService = _chatContributionService;
            this.b = new Map();
            this.a = this.d();
            this.c();
        }
        c() {
            chatExtensionPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionDisposable = new lifecycle_1.$jc();
                    for (const providerDescriptor of extension.value) {
                        this.e(providerDescriptor);
                        const extensionIcon = extension.description.icon ?
                            resources.$ig(extension.description.extensionLocation, extension.description.icon) :
                            undefined;
                        this._chatContributionService.registerChatProvider({
                            ...providerDescriptor,
                            extensionIcon
                        });
                    }
                    this.b.set(extension.description.identifier.value, extensionDisposable);
                }
                for (const extension of delta.removed) {
                    const registration = this.b.get(extension.description.identifier.value);
                    if (registration) {
                        registration.dispose();
                        this.b.delete(extension.description.identifier.value);
                    }
                    for (const providerDescriptor of extension.value) {
                        this._chatContributionService.deregisterChatProvider(providerDescriptor.id);
                    }
                }
            });
        }
        d() {
            // Register View Container
            const title = (0, nls_1.localize)(5, null);
            const icon = codicons_1.$Pj.commentDiscussion;
            const viewContainerId = chatViewPane_1.$xIb;
            const viewContainer = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: viewContainerId,
                title: { value: title, original: 'Chat' },
                icon,
                ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [viewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
                storageId: viewContainerId,
                hideIfEmpty: true,
                order: 100,
            }, 0 /* ViewContainerLocation.Sidebar */);
            return viewContainer;
        }
        e(providerDescriptor) {
            // Register View
            const viewId = this._chatContributionService.getViewIdForProvider(providerDescriptor.id);
            const viewDescriptor = [{
                    id: viewId,
                    containerIcon: this.a.icon,
                    containerTitle: this.a.title.value,
                    name: providerDescriptor.label,
                    canToggleVisibility: false,
                    canMoveView: true,
                    ctorDescriptor: new descriptors_1.$yh(chatViewPane_1.$yIb, [{ providerId: providerDescriptor.id }]),
                    when: contextkey_1.$Ii.deserialize(providerDescriptor.when)
                }];
            platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews(viewDescriptor, this.a);
            // Per-provider actions
            // Actions in view title
            const disposables = new lifecycle_1.$jc();
            disposables.add((0, actions_1.$Xu)((0, chatActions_1.$HIb)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.$Xu)((0, chatClearActions_1.$QIb)(viewId, providerDescriptor.id)));
            disposables.add((0, actions_1.$Xu)((0, chatMoveActions_1.$RIb)(viewId, providerDescriptor.id)));
            // "Open Chat" Actions
            disposables.add((0, actions_1.$Xu)((0, chatActions_1.$GIb)(providerDescriptor.id, providerDescriptor.label, providerDescriptor.when)));
            disposables.add((0, actions_1.$Xu)((0, chatQuickInputActions_1.$LIb)(providerDescriptor.id, providerDescriptor.label)));
            return {
                dispose: () => {
                    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).deregisterViews(viewDescriptor, this.a);
                    platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).deregisterViewContainer(this.a);
                    disposables.dispose();
                }
            };
        }
    };
    exports.$TIb = $TIb;
    exports.$TIb = $TIb = __decorate([
        __param(0, chatContributionService_1.$fsb)
    ], $TIb);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($TIb, 1 /* LifecyclePhase.Starting */);
    class $UIb {
        constructor() {
            this.a = new Map();
        }
        getViewIdForProvider(providerId) {
            return chatViewPane_1.$yIb.ID + '.' + providerId;
        }
        registerChatProvider(provider) {
            this.a.set(provider.id, provider);
        }
        deregisterChatProvider(providerId) {
            this.a.delete(providerId);
        }
        get registeredProviders() {
            return Array.from(this.a.values());
        }
    }
    exports.$UIb = $UIb;
});
//# sourceMappingURL=chatContributionServiceImpl.js.map