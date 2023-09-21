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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensions.contribution", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/common/contributions", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/workbench/contrib/extensions/browser/extensionsViewlet", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/editor", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/extensionsActivationProgress", "vs/base/common/errors", "vs/workbench/contrib/extensions/browser/extensionsDependencyChecker", "vs/base/common/cancellation", "vs/workbench/common/views", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/common/preferences", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/extensions/browser/extensionsQuickAccess", "vs/workbench/contrib/extensions/browser/extensionRecommendationsService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/editor/contrib/clipboard/browser/clipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/action/common/actionCommonCategories", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/common/contextkeys", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/network", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/base/common/async", "vs/workbench/common/editor", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider", "vs/platform/quickinput/common/quickInput", "vs/base/common/event", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/extensions/browser/unsupportedExtensionsMigrationContribution", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/storage/common/storage", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/extensions/browser/deprecatedExtensionsChecker"], function (require, exports, nls_1, platform_1, actions_1, extensions_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, contributions_1, descriptors_1, extensions_2, extensionsActions_1, extensionsInput_1, extensionEditor_1, extensionsViewlet_1, configurationRegistry_1, jsonContributionRegistry, extensionsFileTemplate_1, commands_1, instantiation_1, extensionsUtils_1, extensionManagementUtil_1, editor_1, uri_1, extensionsActivationProgress_1, errors_1, extensionsDependencyChecker_1, cancellation_1, views_1, clipboardService_1, preferences_1, contextkey_1, quickAccess_1, extensionsQuickAccess_1, extensionRecommendationsService_1, userDataSync_1, clipboard_1, editorService_1, extensionsWorkbenchService_1, actionCommonCategories_1, extensionRecommendations_2, extensionRecommendationNotificationService_1, extensions_3, notification_1, host_1, contextkeys_1, workspaceExtensionsConfig_1, network_1, abstractRuntimeExtensionsEditor_1, extensionEnablementWorkspaceTrustTransitionParticipant_1, extensionsIcons_1, extensions_4, lifecycle_1, configuration_1, dialogs_1, labels_1, extensionQuery_1, async_1, editor_2, workspaceTrust_1, extensionsCompletionItemsProvider_1, quickInput_1, event_1, panecomposite_1, unsupportedExtensionsMigrationContribution_1, platform_2, extensionStorage_1, storage_1, preferences_2, deprecatedExtensionsChecker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cVb = exports.$bVb = exports.$aVb = void 0;
    // Singletons
    (0, extensions_1.$mr)(extensions_2.$Pfb, extensionsWorkbenchService_1.$3Ub, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extensionRecommendations_2.$TUb, extensionRecommendationNotificationService_1.$4Ub, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(extensionRecommendations_1.$9fb, extensionRecommendationsService_1.$1Ub, 0 /* InstantiationType.Eager */);
    // Quick Access
    platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: extensionsQuickAccess_1.$OUb,
        prefix: extensionsQuickAccess_1.$OUb.PREFIX,
        placeholder: (0, nls_1.localize)(0, null),
        helpEntries: [{ description: (0, nls_1.localize)(1, null) }]
    });
    // Editor
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(extensionEditor_1.$AUb, extensionEditor_1.$AUb.ID, (0, nls_1.localize)(2, null)), [
        new descriptors_1.$yh(extensionsInput_1.$Nfb)
    ]);
    platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: extensions_2.$Ofb,
        title: { value: (0, nls_1.localize)(3, null), original: 'Extensions' },
        openCommandActionDescriptor: {
            id: extensions_2.$Ofb,
            mnemonicTitle: (0, nls_1.localize)(4, null),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 54 /* KeyCode.KeyX */ },
            order: 4,
        },
        ctorDescriptor: new descriptors_1.$yh(extensionsViewlet_1.$IUb),
        icon: extensionsIcons_1.$Ygb,
        order: 4,
        rejectAddedViews: true,
        alwaysUseContainerInfo: true,
    }, 0 /* ViewContainerLocation.Sidebar */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration({
        id: 'extensions',
        order: 30,
        title: (0, nls_1.localize)(5, null),
        type: 'object',
        properties: {
            'extensions.autoUpdate': {
                enum: [true, 'onlyEnabledExtensions', false,],
                enumItemLabels: [
                    (0, nls_1.localize)(6, null),
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                ],
                enumDescriptions: [
                    (0, nls_1.localize)(9, null),
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null),
                ],
                description: (0, nls_1.localize)(12, null),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.autoCheckUpdates': {
                type: 'boolean',
                description: (0, nls_1.localize)(13, null),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.ignoreRecommendations': {
                type: 'boolean',
                description: (0, nls_1.localize)(14, null),
                default: false
            },
            'extensions.showRecommendationsOnlyOnDemand': {
                type: 'boolean',
                deprecationMessage: (0, nls_1.localize)(15, null),
                default: false,
                tags: ['usesOnlineServices']
            },
            'extensions.closeExtensionDetailsOnViewChange': {
                type: 'boolean',
                description: (0, nls_1.localize)(16, null),
                default: false
            },
            'extensions.confirmedUriHandlerExtensionIds': {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: (0, nls_1.localize)(17, null),
                default: [],
                scope: 1 /* ConfigurationScope.APPLICATION */
            },
            'extensions.webWorker': {
                type: ['boolean', 'string'],
                enum: [true, false, 'auto'],
                enumDescriptions: [
                    (0, nls_1.localize)(18, null),
                    (0, nls_1.localize)(19, null),
                    (0, nls_1.localize)(20, null),
                ],
                description: (0, nls_1.localize)(21, null),
                default: 'auto'
            },
            'extensions.supportVirtualWorkspaces': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)(22, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'boolean',
                        default: false
                    }
                },
                additionalProperties: false,
                default: {},
                defaultSnippets: [{
                        'body': {
                            'pub.name': false
                        }
                    }]
            },
            'extensions.experimental.affinity': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)(23, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'integer',
                        default: 1
                    }
                },
                additionalProperties: false,
                default: {},
                defaultSnippets: [{
                        'body': {
                            'pub.name': 1
                        }
                    }]
            },
            [workspaceTrust_1.$pcb]: {
                type: 'object',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                markdownDescription: (0, nls_1.localize)(24, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'object',
                        properties: {
                            'supported': {
                                type: ['boolean', 'string'],
                                enum: [true, false, 'limited'],
                                enumDescriptions: [
                                    (0, nls_1.localize)(25, null),
                                    (0, nls_1.localize)(26, null),
                                    (0, nls_1.localize)(27, null),
                                ],
                                description: (0, nls_1.localize)(28, null),
                            },
                            'version': {
                                type: 'string',
                                description: (0, nls_1.localize)(29, null),
                            }
                        }
                    }
                }
            },
            'extensions.experimental.deferredStartupFinishedActivation': {
                type: 'boolean',
                description: (0, nls_1.localize)(30, null),
                default: false
            }
        }
    });
    const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry.$9m.JSONContribution);
    jsonRegistry.registerSchema(extensionsFileTemplate_1.$6fb, extensionsFileTemplate_1.$7fb);
    // Register Commands
    commands_1.$Gr.registerCommand('_extensions.manage', (accessor, extensionId, tab, preserveFocus) => {
        const extensionService = accessor.get(extensions_2.$Pfb);
        const extension = extensionService.local.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id: extensionId }));
        if (extension) {
            extensionService.open(extension, { tab, preserveFocus });
        }
        else {
            throw new Error((0, nls_1.localize)(31, null, extensionId));
        }
    });
    commands_1.$Gr.registerCommand('extension.open', async (accessor, extensionId, tab, preserveFocus) => {
        const extensionService = accessor.get(extensions_2.$Pfb);
        const commandService = accessor.get(commands_1.$Fr);
        const [extension] = await extensionService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None);
        if (extension) {
            return extensionService.open(extension, { tab, preserveFocus });
        }
        return commandService.executeCommand('_extensions.manage', extensionId, tab, preserveFocus);
    });
    commands_1.$Gr.registerCommand({
        id: 'workbench.extensions.installExtension',
        description: {
            description: (0, nls_1.localize)(32, null),
            args: [
                {
                    name: 'extensionIdOrVSIXUri',
                    description: (0, nls_1.localize)(33, null),
                    constraint: (value) => typeof value === 'string' || value instanceof uri_1.URI,
                },
                {
                    name: 'options',
                    description: '(optional) Options for installing the extension. Object with the following properties: ' +
                        '`installOnlyNewlyAddedFromExtensionPackVSIX`: When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only when installing VSIX. ',
                    isOptional: true,
                    schema: {
                        'type': 'object',
                        'properties': {
                            'installOnlyNewlyAddedFromExtensionPackVSIX': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)(34, null),
                                default: false
                            },
                            'installPreReleaseVersion': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)(35, null),
                                default: false
                            },
                            'donotSync': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)(36, null),
                                default: false
                            },
                            'context': {
                                'type': 'object',
                                'description': (0, nls_1.localize)(37, null),
                            }
                        }
                    }
                }
            ]
        },
        handler: async (accessor, arg, options) => {
            const extensionsWorkbenchService = accessor.get(extensions_2.$Pfb);
            const extensionManagementService = accessor.get(extensionManagement_2.$hcb);
            try {
                if (typeof arg === 'string') {
                    const [id, version] = (0, extensionManagementUtil_1.$ro)(arg);
                    const [extension] = await extensionsWorkbenchService.getExtensions([{ id, preRelease: options?.installPreReleaseVersion }], cancellation_1.CancellationToken.None);
                    if (extension) {
                        const installOptions = {
                            isMachineScoped: options?.donotSync ? true : undefined,
                            installPreReleaseVersion: options?.installPreReleaseVersion,
                            installGivenVersion: !!version,
                            context: options?.context
                        };
                        if (extension.gallery && extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                            await extensionManagementService.installFromGallery(extension.gallery, installOptions);
                            return;
                        }
                        if (version) {
                            await extensionsWorkbenchService.installVersion(extension, version, installOptions);
                        }
                        else {
                            await extensionsWorkbenchService.install(extension, installOptions);
                        }
                    }
                    else {
                        throw new Error((0, nls_1.localize)(38, null, arg));
                    }
                }
                else {
                    const vsix = uri_1.URI.revive(arg);
                    await extensionsWorkbenchService.install(vsix, { installOnlyNewlyAddedFromExtensionPack: options?.installOnlyNewlyAddedFromExtensionPackVSIX });
                }
            }
            catch (e) {
                (0, errors_1.$Y)(e);
                throw e;
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'workbench.extensions.uninstallExtension',
        description: {
            description: (0, nls_1.localize)(39, null),
            args: [
                {
                    name: (0, nls_1.localize)(40, null),
                    schema: {
                        'type': 'string'
                    }
                }
            ]
        },
        handler: async (accessor, id) => {
            if (!id) {
                throw new Error((0, nls_1.localize)(41, null));
            }
            const extensionManagementService = accessor.get(extensionManagement_1.$2n);
            const installed = await extensionManagementService.getInstalled();
            const [extensionToUninstall] = installed.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id }));
            if (!extensionToUninstall) {
                throw new Error((0, nls_1.localize)(42, null, id));
            }
            if (extensionToUninstall.isBuiltin) {
                throw new Error((0, nls_1.localize)(43, null, id));
            }
            try {
                await extensionManagementService.uninstall(extensionToUninstall);
            }
            catch (e) {
                (0, errors_1.$Y)(e);
                throw e;
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'workbench.extensions.search',
        description: {
            description: (0, nls_1.localize)(44, null),
            args: [
                {
                    name: (0, nls_1.localize)(45, null),
                    schema: { 'type': 'string' }
                }
            ]
        },
        handler: async (accessor, query = '') => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = await paneCompositeService.openPaneComposite(extensions_2.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
            if (!viewlet) {
                return;
            }
            viewlet.getViewPaneContainer().search(query);
            viewlet.focus();
        }
    });
    function overrideActionForActiveExtensionEditorWebview(command, f) {
        command?.addImplementation(105, 'extensions-editor', (accessor) => {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = editorService.activeEditorPane;
            if (editor instanceof extensionEditor_1.$AUb) {
                if (editor.activeWebview?.isFocused) {
                    f(editor.activeWebview);
                    return true;
                }
            }
            return false;
        });
    }
    overrideActionForActiveExtensionEditorWebview(clipboard_1.$i1, webview => webview.copy());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.$h1, webview => webview.cut());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.$j1, webview => webview.paste());
    // Contexts
    exports.$aVb = new contextkey_1.$2i('hasLocalServer', false);
    exports.$bVb = new contextkey_1.$2i('hasRemoteServer', false);
    exports.$cVb = new contextkey_1.$2i('hasWebServer', false);
    async function runAction(action) {
        try {
            await action.run();
        }
        finally {
            if ((0, lifecycle_1.$ec)(action)) {
                action.dispose();
            }
        }
    }
    let ExtensionsContributions = class ExtensionsContributions extends lifecycle_1.$kc {
        constructor(a, extensionGalleryService, contextKeyService, b, c, g, h, j, m) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            const hasGalleryContext = extensions_2.$3fb.bindTo(contextKeyService);
            if (extensionGalleryService.isEnabled()) {
                hasGalleryContext.set(true);
            }
            const hasLocalServerContext = exports.$aVb.bindTo(contextKeyService);
            if (this.a.localExtensionManagementServer) {
                hasLocalServerContext.set(true);
            }
            const hasRemoteServerContext = exports.$bVb.bindTo(contextKeyService);
            if (this.a.remoteExtensionManagementServer) {
                hasRemoteServerContext.set(true);
            }
            const hasWebServerContext = exports.$cVb.bindTo(contextKeyService);
            if (this.a.webExtensionManagementServer) {
                hasWebServerContext.set(true);
            }
            this.r();
            this.s();
            this.n();
        }
        n() {
            if (this.a.localExtensionManagementServer
                || this.a.remoteExtensionManagementServer
                || this.a.webExtensionManagementServer) {
                platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
                    ctor: extensionsQuickAccess_1.$NUb,
                    prefix: extensionsQuickAccess_1.$NUb.PREFIX,
                    placeholder: (0, nls_1.localize)(46, null),
                    helpEntries: [{ description: (0, nls_1.localize)(47, null) }]
                });
            }
        }
        // Global actions
        r() {
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarPreferencesMenu, {
                command: {
                    id: extensions_2.$Ofb,
                    title: (0, nls_1.localize)(48, null)
                },
                group: '2_configuration',
                order: 3
            }));
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                command: {
                    id: extensions_2.$Ofb,
                    title: (0, nls_1.localize)(49, null)
                },
                group: '2_configuration',
                order: 3
            }));
            this.t({
                id: 'workbench.extensions.action.focusExtensionsView',
                title: { value: (0, nls_1.localize)(50, null), original: 'Focus on Extensions View' },
                category: extensionManagement_1.$8n,
                f1: true,
                run: async (accessor) => {
                    await accessor.get(panecomposite_1.$Yeb).openPaneComposite(extensions_2.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
                }
            });
            this.t({
                id: 'workbench.extensions.action.installExtensions',
                title: { value: (0, nls_1.localize)(51, null), original: 'Install Extensions' },
                category: extensionManagement_1.$8n,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(extensions_2.$3fb, contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb))
                },
                run: async (accessor) => {
                    accessor.get(views_1.$$E).openViewContainer(extensions_2.$Ofb, true);
                }
            });
            this.t({
                id: 'workbench.extensions.action.showRecommendedKeymapExtensions',
                title: { value: (0, nls_1.localize)(52, null), original: 'Keymaps' },
                category: extensionManagement_1.$9n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: extensions_2.$3fb
                    }, {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(preferences_2.$kCb, extensions_2.$3fb),
                        group: '2_keyboard_discover_actions'
                    }],
                menuTitles: {
                    [actions_1.$Ru.EditorTitle.id]: (0, nls_1.localize)(53, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@recommended:keymaps '))
            });
            this.t({
                id: 'workbench.extensions.action.showLanguageExtensions',
                title: { value: (0, nls_1.localize)(54, null), original: 'Language Extensions' },
                category: extensionManagement_1.$9n,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: extensions_2.$3fb
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@recommended:languages '))
            });
            this.t({
                id: 'workbench.extensions.action.checkForUpdates',
                title: { value: (0, nls_1.localize)(55, null), original: 'Check for Extension Updates' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.and(extensions_2.$3fb, contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb))
                    }, {
                        id: actions_1.$Ru.ViewContainerTitle,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb), extensions_2.$3fb),
                        group: '1_updates',
                        order: 1
                    }],
                run: async () => {
                    await this.c.checkForUpdates();
                    const outdated = this.c.outdated;
                    if (outdated.length) {
                        return runAction(this.h.createInstance(extensionsActions_1.$3hb, '@outdated '));
                    }
                    else {
                        return this.j.info((0, nls_1.localize)(56, null));
                    }
                }
            });
            const autoUpdateExtensionsSubMenu = new actions_1.$Ru('autoUpdateExtensionsSubMenu');
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.ViewContainerTitle, {
                submenu: autoUpdateExtensionsSubMenu,
                title: (0, nls_1.localize)(57, null),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb), extensions_2.$3fb),
                group: '1_updates',
                order: 5,
            });
            this.t({
                id: 'configureExtensionsAutoUpdate.all',
                title: (0, nls_1.localize)(58, null),
                toggled: contextkey_1.$Ii.and(contextkey_1.$Ii.has(`config.${extensions_2.$Rfb}`), contextkey_1.$Ii.notEquals(`config.${extensions_2.$Rfb}`, 'onlyEnabledExtensions')),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 1,
                    }],
                run: (accessor) => accessor.get(configuration_1.$8h).updateValue(extensions_2.$Rfb, true)
            });
            this.t({
                id: 'configureExtensionsAutoUpdate.enabled',
                title: (0, nls_1.localize)(59, null),
                toggled: contextkey_1.$Ii.equals(`config.${extensions_2.$Rfb}`, 'onlyEnabledExtensions'),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 2,
                    }],
                run: (accessor) => accessor.get(configuration_1.$8h).updateValue(extensions_2.$Rfb, 'onlyEnabledExtensions')
            });
            this.t({
                id: 'configureExtensionsAutoUpdate.none',
                title: (0, nls_1.localize)(60, null),
                toggled: contextkey_1.$Ii.equals(`config.${extensions_2.$Rfb}`, false),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 3,
                    }],
                run: (accessor) => accessor.get(configuration_1.$8h).updateValue(extensions_2.$Rfb, false)
            });
            this.t({
                id: 'workbench.extensions.action.updateAllExtensions',
                title: { value: (0, nls_1.localize)(61, null), original: 'Update All Extensions' },
                category: extensionManagement_1.$8n,
                precondition: extensions_2.$2fb,
                menu: [
                    {
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.and(extensions_2.$3fb, contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb))
                    }, {
                        id: actions_1.$Ru.ViewContainerTitle,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb), contextkey_1.$Ii.or(contextkey_1.$Ii.has(`config.${extensions_2.$Rfb}`).negate(), contextkey_1.$Ii.equals(`config.${extensions_2.$Rfb}`, 'onlyEnabledExtensions'))),
                        group: '1_updates',
                        order: 2
                    }, {
                        id: actions_1.$Ru.ViewTitle,
                        when: contextkey_1.$Ii.equals('view', extensions_2.$Wfb),
                        group: 'navigation',
                        order: 1
                    }
                ],
                icon: extensionsIcons_1.$5gb,
                run: () => {
                    return Promise.all(this.c.outdated.map(async (extension) => {
                        try {
                            await this.c.install(extension, extension.local?.preRelease ? { installPreReleaseVersion: true } : undefined);
                        }
                        catch (err) {
                            runAction(this.h.createInstance(extensionsActions_1.$ohb, extension, extension.latestVersion, 3 /* InstallOperation.Update */, err));
                        }
                    }));
                }
            });
            this.t({
                id: 'workbench.extensions.action.disableAutoUpdate',
                title: { value: (0, nls_1.localize)(62, null), original: 'Disable Auto Update for All Extensions' },
                category: extensionManagement_1.$8n,
                f1: true,
                precondition: extensions_2.$3fb,
                run: (accessor) => accessor.get(configuration_1.$8h).updateValue(extensions_2.$Rfb, false)
            });
            this.t({
                id: 'workbench.extensions.action.enableAutoUpdate',
                title: { value: (0, nls_1.localize)(63, null), original: 'Enable Auto Update for All Extensions' },
                category: extensionManagement_1.$8n,
                f1: true,
                precondition: extensions_2.$3fb,
                run: (accessor) => accessor.get(configuration_1.$8h).updateValue(extensions_2.$Rfb, true)
            });
            this.t({
                id: 'workbench.extensions.action.enableAll',
                title: { value: (0, nls_1.localize)(64, null), original: 'Enable All Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb)
                    }, {
                        id: actions_1.$Ru.ViewContainerTitle,
                        when: contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb),
                        group: '2_enablement',
                        order: 1
                    }],
                run: async () => {
                    const extensionsToEnable = this.c.local.filter(e => !!e.local && this.g.canChangeEnablement(e.local) && !this.g.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.c.setEnablement(extensionsToEnable, 8 /* EnablementState.EnabledGlobally */);
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.enableAllWorkspace',
                title: { value: (0, nls_1.localize)(65, null), original: 'Enable All Extensions for this Workspace' },
                category: extensionManagement_1.$8n,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('empty'), contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb))
                },
                run: async () => {
                    const extensionsToEnable = this.c.local.filter(e => !!e.local && this.g.canChangeEnablement(e.local) && !this.g.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.c.setEnablement(extensionsToEnable, 9 /* EnablementState.EnabledWorkspace */);
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.disableAll',
                title: { value: (0, nls_1.localize)(66, null), original: 'Disable All Installed Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb)
                    }, {
                        id: actions_1.$Ru.ViewContainerTitle,
                        when: contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb),
                        group: '2_enablement',
                        order: 2
                    }],
                run: async () => {
                    const extensionsToDisable = this.c.local.filter(e => !e.isBuiltin && !!e.local && this.g.isEnabled(e.local) && this.g.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.c.setEnablement(extensionsToDisable, 6 /* EnablementState.DisabledGlobally */);
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.disableAllWorkspace',
                title: { value: (0, nls_1.localize)(67, null), original: 'Disable All Installed Extensions for this Workspace' },
                category: extensionManagement_1.$8n,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('empty'), contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb))
                },
                run: async () => {
                    const extensionsToDisable = this.c.local.filter(e => !e.isBuiltin && !!e.local && this.g.isEnabled(e.local) && this.g.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.c.setEnablement(extensionsToDisable, 7 /* EnablementState.DisabledWorkspace */);
                    }
                }
            });
            this.t({
                id: extensions_2.$Yfb,
                title: { value: (0, nls_1.localize)(68, null), original: 'Install from VSIX...' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb)
                    }, {
                        id: actions_1.$Ru.ViewContainerTitle,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb), contextkey_1.$Ii.or(exports.$aVb, exports.$bVb)),
                        group: '3_install',
                        order: 1
                    }],
                run: async (accessor) => {
                    const fileDialogService = accessor.get(dialogs_1.$qA);
                    const commandService = accessor.get(commands_1.$Fr);
                    const vsixPaths = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)(69, null),
                        filters: [{ name: 'VSIX Extensions', extensions: ['vsix'] }],
                        canSelectFiles: true,
                        canSelectMany: true,
                        openLabel: (0, labels_1.$lA)((0, nls_1.localize)(70, null))
                    });
                    if (vsixPaths) {
                        await commandService.executeCommand(extensions_2.$Zfb, vsixPaths);
                    }
                }
            });
            this.t({
                id: extensions_2.$Zfb,
                title: (0, nls_1.localize)(71, null),
                menu: [{
                        id: actions_1.$Ru.ExplorerContext,
                        group: 'extensions',
                        when: contextkey_1.$Ii.and(contextkeys_1.$Kdb.Extension.isEqualTo('.vsix'), contextkey_1.$Ii.or(exports.$aVb, exports.$bVb)),
                    }],
                run: async (accessor, resources) => {
                    const extensionService = accessor.get(extensions_3.$MF);
                    const extensionsWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const hostService = accessor.get(host_1.$VT);
                    const notificationService = accessor.get(notification_1.$Yu);
                    const extensions = Array.isArray(resources) ? resources : [resources];
                    await async_1.Promises.settled(extensions.map(async (vsix) => await extensionsWorkbenchService.install(vsix)))
                        .then(async (extensions) => {
                        for (const extension of extensions) {
                            const requireReload = !(extension.local && extensionService.canAddExtension((0, extensions_3.$UF)(extension.local)));
                            const message = requireReload ? (0, nls_1.localize)(72, null, extension.displayName || extension.name)
                                : (0, nls_1.localize)(73, null, extension.displayName || extension.name);
                            const actions = requireReload ? [{
                                    label: (0, nls_1.localize)(74, null),
                                    run: () => hostService.reload()
                                }] : [];
                            notificationService.prompt(notification_1.Severity.Info, message, actions);
                        }
                    });
                }
            });
            this.t({
                id: 'workbench.extensions.action.installExtensionFromLocation',
                title: { value: (0, nls_1.localize)(75, null), original: 'Install Extension from Location...' },
                category: actionCommonCategories_1.$Nl.Developer,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$cVb, exports.$aVb)
                    }],
                run: async (accessor) => {
                    const extensionManagementService = accessor.get(extensionManagement_2.$hcb);
                    if (platform_2.$o) {
                        const quickInputService = accessor.get(quickInput_1.$Gq);
                        const disposables = new lifecycle_1.$jc();
                        const quickPick = disposables.add(quickInputService.createQuickPick());
                        quickPick.title = (0, nls_1.localize)(76, null);
                        quickPick.customButton = true;
                        quickPick.customLabel = (0, nls_1.localize)(77, null);
                        quickPick.placeholder = (0, nls_1.localize)(78, null);
                        quickPick.ignoreFocusOut = true;
                        disposables.add(event_1.Event.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
                            quickPick.hide();
                            if (quickPick.value) {
                                extensionManagementService.installFromLocation(uri_1.URI.parse(quickPick.value));
                            }
                        }));
                        disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                        quickPick.show();
                    }
                    else {
                        const fileDialogService = accessor.get(dialogs_1.$qA);
                        const extensionLocation = await fileDialogService.showOpenDialog({
                            canSelectFolders: true,
                            canSelectFiles: false,
                            canSelectMany: false,
                            title: (0, nls_1.localize)(79, null),
                        });
                        if (extensionLocation?.[0]) {
                            extensionManagementService.installFromLocation(extensionLocation[0]);
                        }
                    }
                }
            });
            const extensionsFilterSubMenu = new actions_1.$Ru('extensionsFilterSubMenu');
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.ViewContainerTitle, {
                submenu: extensionsFilterSubMenu,
                title: (0, nls_1.localize)(80, null),
                when: contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb),
                group: 'navigation',
                order: 1,
                icon: extensionsIcons_1.$3gb,
            });
            const showFeaturedExtensionsId = 'extensions.filter.featured';
            this.t({
                id: showFeaturedExtensionsId,
                title: { value: (0, nls_1.localize)(81, null), original: 'Show Featured Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: extensions_2.$3fb
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.$3fb,
                        group: '1_predefined',
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(82, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@featured '))
            });
            this.t({
                id: 'workbench.extensions.action.showPopularExtensions',
                title: { value: (0, nls_1.localize)(83, null), original: 'Show Popular Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: extensions_2.$3fb
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.$3fb,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(84, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@popular '))
            });
            this.t({
                id: 'workbench.extensions.action.showRecommendedExtensions',
                title: { value: (0, nls_1.localize)(85, null), original: 'Show Recommended Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: extensions_2.$3fb
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.$3fb,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(86, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@recommended '))
            });
            this.t({
                id: 'workbench.extensions.action.recentlyPublishedExtensions',
                title: { value: (0, nls_1.localize)(87, null), original: 'Show Recently Published Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: extensions_2.$3fb
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.$3fb,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(88, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@recentlyPublished '))
            });
            const extensionsCategoryFilterSubMenu = new actions_1.$Ru('extensionsCategoryFilterSubMenu');
            actions_1.$Tu.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsCategoryFilterSubMenu,
                title: (0, nls_1.localize)(89, null),
                when: extensions_2.$3fb,
                group: '2_categories',
                order: 1,
            });
            extensions_4.$Ul.map((category, index) => {
                this.t({
                    id: `extensions.actions.searchByCategory.${category}`,
                    title: category,
                    menu: [{
                            id: extensionsCategoryFilterSubMenu,
                            when: extensions_2.$3fb,
                            order: index,
                        }],
                    run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, `@category:"${category.toLowerCase()}"`))
                });
            });
            this.t({
                id: 'workbench.extensions.action.listBuiltInExtensions',
                title: { value: (0, nls_1.localize)(90, null), original: 'Show Built-in Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(91, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@builtin '))
            });
            this.t({
                id: 'workbench.extensions.action.extensionUpdates',
                title: { value: (0, nls_1.localize)(92, null), original: 'Show Extension Updates' },
                category: extensionManagement_1.$8n,
                precondition: extensions_2.$3fb,
                f1: true,
                menu: [{
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        when: extensions_2.$3fb,
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(93, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@updates'))
            });
            this.t({
                id: extensions_2.$1fb,
                title: { value: (0, nls_1.localize)(94, null), original: 'Show Extensions Unsupported By Workspace' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb),
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 5,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb),
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(95, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@workspaceUnsupported'))
            });
            this.t({
                id: 'workbench.extensions.action.showEnabledExtensions',
                title: { value: (0, nls_1.localize)(96, null), original: 'Show Enabled Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 3,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(97, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@enabled '))
            });
            this.t({
                id: 'workbench.extensions.action.showDisabledExtensions',
                title: { value: (0, nls_1.localize)(98, null), original: 'Show Disabled Extensions' },
                category: extensionManagement_1.$8n,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 4,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(99, null)
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$3hb, '@disabled '))
            });
            const extensionsSortSubMenu = new actions_1.$Ru('extensionsSortSubMenu');
            actions_1.$Tu.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsSortSubMenu,
                title: (0, nls_1.localize)(100, null),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(extensions_2.$3fb, extensionsViewlet_1.$BUb)),
                group: '4_sort',
                order: 1,
            });
            [
                { id: 'installs', title: (0, nls_1.localize)(101, null), precondition: extensionsViewlet_1.$FUb.negate() },
                { id: 'rating', title: (0, nls_1.localize)(102, null), precondition: extensionsViewlet_1.$FUb.negate() },
                { id: 'name', title: (0, nls_1.localize)(103, null), precondition: extensionsViewlet_1.$FUb.negate() },
                { id: 'publishedDate', title: (0, nls_1.localize)(104, null), precondition: extensionsViewlet_1.$FUb.negate() },
                { id: 'updateDate', title: (0, nls_1.localize)(105, null), precondition: contextkey_1.$Ii.and(extensionsViewlet_1.$DUb.negate(), extensionsViewlet_1.$GUb.negate(), extensionsViewlet_1.$FUb.negate()) },
            ].map(({ id, title, precondition }, index) => {
                this.t({
                    id: `extensions.sort.${id}`,
                    title,
                    precondition: precondition,
                    menu: [{
                            id: extensionsSortSubMenu,
                            when: contextkey_1.$Ii.or(extensions_2.$3fb, extensionsViewlet_1.$BUb),
                            order: index,
                        }],
                    toggled: extensionsViewlet_1.$CUb.isEqualTo(id),
                    run: async () => {
                        const viewlet = await this.b.openPaneComposite(extensions_2.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
                        const extensionsViewPaneContainer = viewlet?.getViewPaneContainer();
                        const currentQuery = extensionQuery_1.$$Tb.parse(extensionsViewPaneContainer.searchValue || '');
                        extensionsViewPaneContainer.search(new extensionQuery_1.$$Tb(currentQuery.value, id, currentQuery.groupBy).toString());
                        extensionsViewPaneContainer.focus();
                    }
                });
            });
            this.t({
                id: 'workbench.extensions.action.clearExtensionsSearchResults',
                title: { value: (0, nls_1.localize)(106, null), original: 'Clear Extensions Search Results' },
                category: extensionManagement_1.$8n,
                icon: extensionsIcons_1.$1gb,
                f1: true,
                precondition: extensionsViewlet_1.$EUb,
                menu: {
                    id: actions_1.$Ru.ViewContainerTitle,
                    when: contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb),
                    group: 'navigation',
                    order: 3,
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(views_1.$$E).getActiveViewPaneContainerWithId(extensions_2.$Ofb);
                    if (viewPaneContainer) {
                        const extensionsViewPaneContainer = viewPaneContainer;
                        extensionsViewPaneContainer.search('');
                        extensionsViewPaneContainer.focus();
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.refreshExtension',
                title: { value: (0, nls_1.localize)(107, null), original: 'Refresh' },
                category: extensionManagement_1.$8n,
                icon: extensionsIcons_1.$2gb,
                f1: true,
                menu: {
                    id: actions_1.$Ru.ViewContainerTitle,
                    when: contextkey_1.$Ii.equals('viewContainer', extensions_2.$Ofb),
                    group: 'navigation',
                    order: 2
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(views_1.$$E).getActiveViewPaneContainerWithId(extensions_2.$Ofb);
                    if (viewPaneContainer) {
                        await viewPaneContainer.refresh();
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.installWorkspaceRecommendedExtensions',
                title: (0, nls_1.localize)(108, null),
                icon: extensionsIcons_1.$5gb,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    when: contextkey_1.$Ii.equals('view', extensions_2.$Vfb),
                    group: 'navigation',
                    order: 1
                },
                run: async (accessor) => {
                    const view = accessor.get(views_1.$$E).getActiveViewWithId(extensions_2.$Vfb);
                    return view.installWorkspaceRecommendations();
                }
            });
            this.t({
                id: extensionsActions_1.$6hb.ID,
                title: extensionsActions_1.$6hb.LABEL,
                icon: extensionsIcons_1.$6gb,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkeys_1.$Pcb.notEqualsTo('empty'),
                    }, {
                        id: actions_1.$Ru.ViewTitle,
                        when: contextkey_1.$Ii.equals('view', extensions_2.$Vfb),
                        group: 'navigation',
                        order: 2
                    }],
                run: () => runAction(this.h.createInstance(extensionsActions_1.$6hb, extensionsActions_1.$6hb.ID, extensionsActions_1.$6hb.LABEL))
            });
            this.t({
                id: extensionsActions_1.$$hb.ID,
                title: { value: extensionsActions_1.$$hb.LABEL, original: 'Install Specific Version of Extension...' },
                category: extensionManagement_1.$8n,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(extensions_2.$3fb, contextkey_1.$Ii.or(exports.$aVb, exports.$bVb, exports.$cVb))
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$$hb, extensionsActions_1.$$hb.ID, extensionsActions_1.$$hb.LABEL))
            });
            this.t({
                id: extensionsActions_1.$0hb.ID,
                title: { value: extensionsActions_1.$0hb.LABEL, original: 'Reinstall Extension...' },
                category: actionCommonCategories_1.$Nl.Developer,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(extensions_2.$3fb, contextkey_1.$Ii.or(exports.$aVb, exports.$bVb))
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$0hb, extensionsActions_1.$0hb.ID, extensionsActions_1.$0hb.LABEL))
            });
        }
        // Extension Context Menu
        s() {
            this.t({
                id: extensionsActions_1.$Thb.ID,
                title: extensionsActions_1.$Thb.TITLE,
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$4fb,
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.not('inExtensionEditor'), contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.has('extensionHasColorThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const instantiationService = accessor.get(instantiation_1.$Ah);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.$Thb);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.t({
                id: extensionsActions_1.$Uhb.ID,
                title: extensionsActions_1.$Uhb.TITLE,
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$4fb,
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.not('inExtensionEditor'), contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.has('extensionHasFileIconThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const instantiationService = accessor.get(instantiation_1.$Ah);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.$Uhb);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.t({
                id: extensionsActions_1.$Vhb.ID,
                title: extensionsActions_1.$Vhb.TITLE,
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$4fb,
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.not('inExtensionEditor'), contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.has('extensionHasProductIconThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const instantiationService = accessor.get(instantiation_1.$Ah);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.$Vhb);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.showPreReleaseVersion',
                title: { value: (0, nls_1.localize)(109, null), original: 'Show Pre-Release Version' },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$5fb,
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('inExtensionEditor'), contextkey_1.$Ii.has('extensionHasPreReleaseVersion'), contextkey_1.$Ii.not('showPreReleaseVersion'), contextkey_1.$Ii.not('isBuiltinExtension'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    extensionWorkbenchService.open(extension, { showPreReleaseVersion: true });
                }
            });
            this.t({
                id: 'workbench.extensions.action.showReleasedVersion',
                title: { value: (0, nls_1.localize)(110, null), original: 'Show Release Version' },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$5fb,
                    order: 1,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('inExtensionEditor'), contextkey_1.$Ii.has('extensionHasPreReleaseVersion'), contextkey_1.$Ii.has('extensionHasReleaseVersion'), contextkey_1.$Ii.has('showPreReleaseVersion'), contextkey_1.$Ii.not('isBuiltinExtension'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    extensionWorkbenchService.open(extension, { showPreReleaseVersion: false });
                }
            });
            this.t({
                id: extensionsActions_1.$Jhb.ID,
                title: extensionsActions_1.$Jhb.TITLE,
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$5fb,
                    order: 2,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.not('installedExtensionIsPreReleaseVersion'), contextkey_1.$Ii.not('installedExtensionIsOptedTpPreRelease'), contextkey_1.$Ii.has('extensionHasPreReleaseVersion'), contextkey_1.$Ii.not('inExtensionEditor'), contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.not('isBuiltinExtension'))
                },
                run: async (accessor, id) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id }));
                    if (extension) {
                        extensionWorkbenchService.open(extension, { showPreReleaseVersion: true });
                        await extensionWorkbenchService.install(extension, { installPreReleaseVersion: true });
                    }
                }
            });
            this.t({
                id: extensionsActions_1.$Khb.ID,
                title: extensionsActions_1.$Khb.TITLE,
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$5fb,
                    order: 3,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('installedExtensionIsPreReleaseVersion'), contextkey_1.$Ii.has('extensionHasPreReleaseVersion'), contextkey_1.$Ii.has('extensionHasReleaseVersion'), contextkey_1.$Ii.not('inExtensionEditor'), contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.not('isBuiltinExtension'))
                },
                run: async (accessor, id) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id }));
                    if (extension) {
                        extensionWorkbenchService.open(extension, { showPreReleaseVersion: false });
                        await extensionWorkbenchService.install(extension, { installPreReleaseVersion: false });
                    }
                }
            });
            this.t({
                id: extensionsActions_1.$Xhb.ID,
                title: extensionsActions_1.$Xhb.TITLE,
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: extensions_2.$5fb,
                    order: 0,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.not('inExtensionEditor'), contextkey_1.$Ii.has('canSetLanguage'), contextkey_1.$Ii.has('isActiveLanguagePackExtension'))
                },
                run: async (accessor, extensionId) => {
                    const instantiationService = accessor.get(instantiation_1.$Ah);
                    const extensionsWorkbenchService = accessor.get(extensions_2.$Pfb);
                    const extension = (await extensionsWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    const action = instantiationService.createInstance(extensionsActions_1.$Xhb);
                    action.extension = extension;
                    return action.run();
                }
            });
            this.t({
                id: 'workbench.extensions.action.copyExtension',
                title: { value: (0, nls_1.localize)(111, null), original: 'Copy' },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, extensionId) => {
                    const clipboardService = accessor.get(clipboardService_1.$UZ);
                    const extension = this.c.local.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id: extensionId }))[0]
                        || (await this.c.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    if (extension) {
                        const name = (0, nls_1.localize)(112, null, extension.displayName);
                        const id = (0, nls_1.localize)(113, null, extensionId);
                        const description = (0, nls_1.localize)(114, null, extension.description);
                        const verision = (0, nls_1.localize)(115, null, extension.version);
                        const publisher = (0, nls_1.localize)(116, null, extension.publisherDisplayName);
                        const link = extension.url ? (0, nls_1.localize)(117, null, `${extension.url}`) : null;
                        const clipboardStr = `${name}\n${id}\n${description}\n${verision}\n${publisher}${link ? '\n' + link : ''}`;
                        await clipboardService.writeText(clipboardStr);
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.copyExtensionId',
                title: { value: (0, nls_1.localize)(118, null), original: 'Copy Extension ID' },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, id) => accessor.get(clipboardService_1.$UZ).writeText(id)
            });
            this.t({
                id: 'workbench.extensions.action.configure',
                title: { value: (0, nls_1.localize)(119, null), original: 'Extension Settings' },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.has('extensionHasConfiguration')),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(preferences_1.$BE).openSettings({ jsonEditor: false, query: `@ext:${id}` })
            });
            this.t({
                id: 'workbench.extensions.action.configureKeybindings',
                title: { value: (0, nls_1.localize)(120, null), original: 'Extension Keyboard Shortcuts' },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.has('extensionHasKeybindings')),
                    order: 2
                },
                run: async (accessor, id) => accessor.get(preferences_1.$BE).openGlobalKeybindingSettings(false, { query: `@ext:${id}` })
            });
            this.t({
                id: 'workbench.extensions.action.toggleApplyToAllProfiles',
                title: { value: (0, nls_1.localize)(121, null), original: `Apply Extension to all Profiles` },
                toggled: contextkey_1.$Ii.has('isApplicationScopedExtension'),
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('extensionStatus', 'installed'), contextkey_1.$Ii.has('isDefaultApplicationScopedExtension').negate(), contextkey_1.$Ii.has('isBuiltinExtension').negate()),
                    order: 3
                },
                run: async (accessor, id) => {
                    const extension = this.c.local.find(e => (0, extensionManagementUtil_1.$po)({ id }, e.identifier));
                    if (extension) {
                        return this.c.toggleApplyExtensionToAllProfiles(extension);
                    }
                }
            });
            this.t({
                id: extensions_2.$Xfb,
                title: { value: (0, nls_1.localize)(122, null), original: `Sync This Extension` },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.$Ii.and(userDataSync_1.$QAb, contextkey_1.$Ii.has('inExtensionEditor').negate()),
                    order: 4
                },
                run: async (accessor, id) => {
                    const extension = this.c.local.find(e => (0, extensionManagementUtil_1.$po)({ id }, e.identifier));
                    if (extension) {
                        return this.c.toggleExtensionIgnoredToSync(extension);
                    }
                }
            });
            this.t({
                id: 'workbench.extensions.action.ignoreRecommendation',
                title: { value: (0, nls_1.localize)(123, null), original: `Ignore Recommendation` },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.$Ii.has('isExtensionRecommended'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.$0fb).toggleGlobalIgnoredRecommendation(id, true)
            });
            this.t({
                id: 'workbench.extensions.action.undoIgnoredRecommendation',
                title: { value: (0, nls_1.localize)(124, null), original: `Undo Ignored Recommendation` },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.$Ii.has('isUserIgnoredRecommendation'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.$0fb).toggleGlobalIgnoredRecommendation(id, false)
            });
            this.t({
                id: 'workbench.extensions.action.addExtensionToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)(125, null), original: `Add to Workspace Recommendations` },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('empty'), contextkey_1.$Ii.has('isBuiltinExtension').negate(), contextkey_1.$Ii.has('isExtensionWorkspaceRecommended').negate(), contextkey_1.$Ii.has('isUserIgnoredRecommendation').negate()),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.$qgb).toggleRecommendation(id)
            });
            this.t({
                id: 'workbench.extensions.action.removeExtensionFromWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)(126, null), original: `Remove from Workspace Recommendations` },
                menu: {
                    id: actions_1.$Ru.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('empty'), contextkey_1.$Ii.has('isBuiltinExtension').negate(), contextkey_1.$Ii.has('isExtensionWorkspaceRecommended')),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.$qgb).toggleRecommendation(id)
            });
            this.t({
                id: 'workbench.extensions.action.addToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)(127, null), original: `Add Extension to Workspace Recommendations` },
                category: (0, nls_1.localize)(128, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('workspace'), contextkey_1.$Ii.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.$9C);
                    const workspaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.$qgb);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.$Nfb)) {
                        return;
                    }
                    const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
                    const recommendations = await workspaceExtensionsConfigService.getRecommendations();
                    if (recommendations.includes(extensionId)) {
                        return;
                    }
                    await workspaceExtensionsConfigService.toggleRecommendation(extensionId);
                }
            });
            this.t({
                id: 'workbench.extensions.action.addToWorkspaceFolderRecommendations',
                title: { value: (0, nls_1.localize)(129, null), original: `Add Extension to Workspace Folder Recommendations` },
                category: (0, nls_1.localize)(130, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('folder'), contextkey_1.$Ii.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.m.executeCommand('workbench.extensions.action.addToWorkspaceRecommendations')
            });
            this.t({
                id: 'workbench.extensions.action.addToWorkspaceIgnoredRecommendations',
                title: { value: (0, nls_1.localize)(131, null), original: `Add Extension to Workspace Ignored Recommendations` },
                category: (0, nls_1.localize)(132, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('workspace'), contextkey_1.$Ii.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.$9C);
                    const workspaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.$qgb);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.$Nfb)) {
                        return;
                    }
                    const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
                    const unwantedRecommendations = await workspaceExtensionsConfigService.getUnwantedRecommendations();
                    if (unwantedRecommendations.includes(extensionId)) {
                        return;
                    }
                    await workspaceExtensionsConfigService.toggleUnwantedRecommendation(extensionId);
                }
            });
            this.t({
                id: 'workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations',
                title: { value: (0, nls_1.localize)(133, null), original: `Add Extension to Workspace Folder Ignored Recommendations` },
                category: (0, nls_1.localize)(134, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('folder'), contextkey_1.$Ii.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.m.executeCommand('workbench.extensions.action.addToWorkspaceIgnoredRecommendations')
            });
            this.t({
                id: extensionsActions_1.$5hb.ID,
                title: { value: extensionsActions_1.$5hb.LABEL, original: 'Configure Recommended Extensions (Workspace)' },
                category: (0, nls_1.localize)(135, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkeys_1.$Pcb.isEqualTo('workspace'),
                },
                run: () => runAction(this.h.createInstance(extensionsActions_1.$5hb, extensionsActions_1.$5hb.ID, extensionsActions_1.$5hb.LABEL))
            });
        }
        t(extensionActionOptions) {
            const menus = extensionActionOptions.menu ? Array.isArray(extensionActionOptions.menu) ? extensionActionOptions.menu : [extensionActionOptions.menu] : [];
            let menusWithOutTitles = [];
            const menusWithTitles = [];
            if (extensionActionOptions.menuTitles) {
                for (let index = 0; index < menus.length; index++) {
                    const menu = menus[index];
                    const menuTitle = extensionActionOptions.menuTitles[menu.id.id];
                    if (menuTitle) {
                        menusWithTitles.push({ id: menu.id, item: { ...menu, command: { id: extensionActionOptions.id, title: menuTitle } } });
                    }
                    else {
                        menusWithOutTitles.push(menu);
                    }
                }
            }
            else {
                menusWithOutTitles = menus;
            }
            const disposables = new lifecycle_1.$jc();
            disposables.add((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        ...extensionActionOptions,
                        menu: menusWithOutTitles
                    });
                }
                run(accessor, ...args) {
                    return extensionActionOptions.run(accessor, ...args);
                }
            }));
            if (menusWithTitles.length) {
                disposables.add(actions_1.$Tu.appendMenuItems(menusWithTitles));
            }
            return disposables;
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionManagement_2.$fcb),
        __param(1, extensionManagement_1.$Zn),
        __param(2, contextkey_1.$3i),
        __param(3, panecomposite_1.$Yeb),
        __param(4, extensions_2.$Pfb),
        __param(5, extensionManagement_2.$icb),
        __param(6, instantiation_1.$Ah),
        __param(7, dialogs_1.$oA),
        __param(8, commands_1.$Fr)
    ], ExtensionsContributions);
    let ExtensionStorageCleaner = class ExtensionStorageCleaner {
        constructor(extensionManagementService, storageService) {
            extensionStorage_1.$Uz.removeOutdatedExtensionVersions(extensionManagementService, storageService);
        }
    };
    ExtensionStorageCleaner = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, storage_1.$Vo)
    ], ExtensionStorageCleaner);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.$JUb, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.$KUb, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsUtils_1.$kGb, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.$HUb, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsActivationProgress_1.$LUb, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsDependencyChecker_1.$MUb, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionEnablementWorkspaceTrustTransitionParticipant_1.$8Ub, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsCompletionItemsProvider_1.$9Ub, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(unsupportedExtensionsMigrationContribution_1.$$Ub, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(deprecatedExtensionsChecker_1.$_Ub, 4 /* LifecyclePhase.Eventually */);
    if (platform_2.$o) {
        workbenchRegistry.registerWorkbenchContribution(ExtensionStorageCleaner, 4 /* LifecyclePhase.Eventually */);
    }
    // Running Extensions
    (0, actions_1.$Xu)(abstractRuntimeExtensionsEditor_1.$7Ub);
});
//# sourceMappingURL=extensions.contribution.js.map