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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/common/contributions", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/workbench/contrib/extensions/browser/extensionsViewlet", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/editor", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/extensionsActivationProgress", "vs/base/common/errors", "vs/workbench/contrib/extensions/browser/extensionsDependencyChecker", "vs/base/common/cancellation", "vs/workbench/common/views", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/common/preferences", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/extensions/browser/extensionsQuickAccess", "vs/workbench/contrib/extensions/browser/extensionRecommendationsService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/editor/contrib/clipboard/browser/clipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/action/common/actionCommonCategories", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/common/contextkeys", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/network", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/base/common/async", "vs/workbench/common/editor", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider", "vs/platform/quickinput/common/quickInput", "vs/base/common/event", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/extensions/browser/unsupportedExtensionsMigrationContribution", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/storage/common/storage", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/extensions/browser/deprecatedExtensionsChecker"], function (require, exports, nls_1, platform_1, actions_1, extensions_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, contributions_1, descriptors_1, extensions_2, extensionsActions_1, extensionsInput_1, extensionEditor_1, extensionsViewlet_1, configurationRegistry_1, jsonContributionRegistry, extensionsFileTemplate_1, commands_1, instantiation_1, extensionsUtils_1, extensionManagementUtil_1, editor_1, uri_1, extensionsActivationProgress_1, errors_1, extensionsDependencyChecker_1, cancellation_1, views_1, clipboardService_1, preferences_1, contextkey_1, quickAccess_1, extensionsQuickAccess_1, extensionRecommendationsService_1, userDataSync_1, clipboard_1, editorService_1, extensionsWorkbenchService_1, actionCommonCategories_1, extensionRecommendations_2, extensionRecommendationNotificationService_1, extensions_3, notification_1, host_1, contextkeys_1, workspaceExtensionsConfig_1, network_1, abstractRuntimeExtensionsEditor_1, extensionEnablementWorkspaceTrustTransitionParticipant_1, extensionsIcons_1, extensions_4, lifecycle_1, configuration_1, dialogs_1, labels_1, extensionQuery_1, async_1, editor_2, workspaceTrust_1, extensionsCompletionItemsProvider_1, quickInput_1, event_1, panecomposite_1, unsupportedExtensionsMigrationContribution_1, platform_2, extensionStorage_1, storage_1, preferences_2, deprecatedExtensionsChecker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONTEXT_HAS_WEB_SERVER = exports.CONTEXT_HAS_REMOTE_SERVER = exports.CONTEXT_HAS_LOCAL_SERVER = void 0;
    // Singletons
    (0, extensions_1.registerSingleton)(extensions_2.IExtensionsWorkbenchService, extensionsWorkbenchService_1.ExtensionsWorkbenchService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(extensionRecommendations_2.IExtensionRecommendationNotificationService, extensionRecommendationNotificationService_1.ExtensionRecommendationNotificationService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(extensionRecommendations_1.IExtensionRecommendationsService, extensionRecommendationsService_1.ExtensionRecommendationsService, 0 /* InstantiationType.Eager */);
    // Quick Access
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: extensionsQuickAccess_1.ManageExtensionsQuickAccessProvider,
        prefix: extensionsQuickAccess_1.ManageExtensionsQuickAccessProvider.PREFIX,
        placeholder: (0, nls_1.localize)('manageExtensionsQuickAccessPlaceholder', "Press Enter to manage extensions."),
        helpEntries: [{ description: (0, nls_1.localize)('manageExtensionsHelp', "Manage Extensions") }]
    });
    // Editor
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(extensionEditor_1.ExtensionEditor, extensionEditor_1.ExtensionEditor.ID, (0, nls_1.localize)('extension', "Extension")), [
        new descriptors_1.SyncDescriptor(extensionsInput_1.ExtensionsInput)
    ]);
    platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: extensions_2.VIEWLET_ID,
        title: { value: (0, nls_1.localize)('extensions', "Extensions"), original: 'Extensions' },
        openCommandActionDescriptor: {
            id: extensions_2.VIEWLET_ID,
            mnemonicTitle: (0, nls_1.localize)({ key: 'miViewExtensions', comment: ['&& denotes a mnemonic'] }, "E&&xtensions"),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 54 /* KeyCode.KeyX */ },
            order: 4,
        },
        ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViewlet_1.ExtensionsViewPaneContainer),
        icon: extensionsIcons_1.extensionsViewIcon,
        order: 4,
        rejectAddedViews: true,
        alwaysUseContainerInfo: true,
    }, 0 /* ViewContainerLocation.Sidebar */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'extensions',
        order: 30,
        title: (0, nls_1.localize)('extensionsConfigurationTitle', "Extensions"),
        type: 'object',
        properties: {
            'extensions.autoUpdate': {
                enum: [true, 'onlyEnabledExtensions', false,],
                enumItemLabels: [
                    (0, nls_1.localize)('all', "All Extensions"),
                    (0, nls_1.localize)('enabled', "Only Enabled Extensions"),
                    (0, nls_1.localize)('none', "None"),
                ],
                enumDescriptions: [
                    (0, nls_1.localize)('extensions.autoUpdate.true', 'Download and install updates automatically for all extensions except for those updates are ignored.'),
                    (0, nls_1.localize)('extensions.autoUpdate.enabled', 'Download and install updates automatically only for enabled extensions except for those updates are ignored. Disabled extensions are not updated automatically.'),
                    (0, nls_1.localize)('extensions.autoUpdate.false', 'Extensions are not automatically updated.'),
                ],
                description: (0, nls_1.localize)('extensions.autoUpdate', "Controls the automatic update behavior of extensions. The updates are fetched from a Microsoft online service."),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.autoCheckUpdates': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsCheckUpdates', "When enabled, automatically checks extensions for updates. If an extension has an update, it is marked as outdated in the Extensions view. The updates are fetched from a Microsoft online service."),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.ignoreRecommendations': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsIgnoreRecommendations', "When enabled, the notifications for extension recommendations will not be shown."),
                default: false
            },
            'extensions.showRecommendationsOnlyOnDemand': {
                type: 'boolean',
                deprecationMessage: (0, nls_1.localize)('extensionsShowRecommendationsOnlyOnDemand_Deprecated', "This setting is deprecated. Use extensions.ignoreRecommendations setting to control recommendation notifications. Use Extensions view's visibility actions to hide Recommended view by default."),
                default: false,
                tags: ['usesOnlineServices']
            },
            'extensions.closeExtensionDetailsOnViewChange': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsCloseExtensionDetailsOnViewChange', "When enabled, editors with extension details will be automatically closed upon navigating away from the Extensions View."),
                default: false
            },
            'extensions.confirmedUriHandlerExtensionIds': {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: (0, nls_1.localize)('handleUriConfirmedExtensions', "When an extension is listed here, a confirmation prompt will not be shown when that extension handles a URI."),
                default: [],
                scope: 1 /* ConfigurationScope.APPLICATION */
            },
            'extensions.webWorker': {
                type: ['boolean', 'string'],
                enum: [true, false, 'auto'],
                enumDescriptions: [
                    (0, nls_1.localize)('extensionsWebWorker.true', "The Web Worker Extension Host will always be launched."),
                    (0, nls_1.localize)('extensionsWebWorker.false', "The Web Worker Extension Host will never be launched."),
                    (0, nls_1.localize)('extensionsWebWorker.auto', "The Web Worker Extension Host will be launched when a web extension needs it."),
                ],
                description: (0, nls_1.localize)('extensionsWebWorker', "Enable web worker extension host."),
                default: 'auto'
            },
            'extensions.supportVirtualWorkspaces': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('extensions.supportVirtualWorkspaces', "Override the virtual workspaces support of an extension."),
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
                markdownDescription: (0, nls_1.localize)('extensions.affinity', "Configure an extension to execute in a different extension host process."),
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
            [workspaceTrust_1.WORKSPACE_TRUST_EXTENSION_SUPPORT]: {
                type: 'object',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                markdownDescription: (0, nls_1.localize)('extensions.supportUntrustedWorkspaces', "Override the untrusted workspace support of an extension. Extensions using `true` will always be enabled. Extensions using `limited` will always be enabled, and the extension will hide functionality that requires trust. Extensions using `false` will only be enabled only when the workspace is trusted."),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'object',
                        properties: {
                            'supported': {
                                type: ['boolean', 'string'],
                                enum: [true, false, 'limited'],
                                enumDescriptions: [
                                    (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.true', "Extension will always be enabled."),
                                    (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.false', "Extension will only be enabled only when the workspace is trusted."),
                                    (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.limited', "Extension will always be enabled, and the extension will hide functionality requiring trust."),
                                ],
                                description: (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.supported', "Defines the untrusted workspace support setting for the extension."),
                            },
                            'version': {
                                type: 'string',
                                description: (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.version', "Defines the version of the extension for which the override should be applied. If not specified, the override will be applied independent of the extension version."),
                            }
                        }
                    }
                }
            },
            'extensions.experimental.deferredStartupFinishedActivation': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsDeferredStartupFinishedActivation', "When enabled, extensions which declare the `onStartupFinished` activation event will be activated after a timeout."),
                default: false
            }
        }
    });
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(extensionsFileTemplate_1.ExtensionsConfigurationSchemaId, extensionsFileTemplate_1.ExtensionsConfigurationSchema);
    // Register Commands
    commands_1.CommandsRegistry.registerCommand('_extensions.manage', (accessor, extensionId, tab, preserveFocus) => {
        const extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        const extension = extensionService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
        if (extension) {
            extensionService.open(extension, { tab, preserveFocus });
        }
        else {
            throw new Error((0, nls_1.localize)('notFound', "Extension '{0}' not found.", extensionId));
        }
    });
    commands_1.CommandsRegistry.registerCommand('extension.open', async (accessor, extensionId, tab, preserveFocus) => {
        const extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        const commandService = accessor.get(commands_1.ICommandService);
        const [extension] = await extensionService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None);
        if (extension) {
            return extensionService.open(extension, { tab, preserveFocus });
        }
        return commandService.executeCommand('_extensions.manage', extensionId, tab, preserveFocus);
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.installExtension',
        description: {
            description: (0, nls_1.localize)('workbench.extensions.installExtension.description', "Install the given extension"),
            args: [
                {
                    name: 'extensionIdOrVSIXUri',
                    description: (0, nls_1.localize)('workbench.extensions.installExtension.arg.decription', "Extension id or VSIX resource uri"),
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
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.installOnlyNewlyAddedFromExtensionPackVSIX', "When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only while installing a VSIX."),
                                default: false
                            },
                            'installPreReleaseVersion': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.installPreReleaseVersion', "When enabled, VS Code installs the pre-release version of the extension if available."),
                                default: false
                            },
                            'donotSync': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.donotSync', "When enabled, VS Code do not sync this extension when Settings Sync is on."),
                                default: false
                            },
                            'context': {
                                'type': 'object',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.context', "Context for the installation. This is a JSON object that can be used to pass any information to the installation handlers. i.e. `{skipWalkthrough: true}` will skip opening the walkthrough upon install."),
                            }
                        }
                    }
                }
            ]
        },
        handler: async (accessor, arg, options) => {
            const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
            const extensionManagementService = accessor.get(extensionManagement_2.IWorkbenchExtensionManagementService);
            try {
                if (typeof arg === 'string') {
                    const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(arg);
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
                        throw new Error((0, nls_1.localize)('notFound', "Extension '{0}' not found.", arg));
                    }
                }
                else {
                    const vsix = uri_1.URI.revive(arg);
                    await extensionsWorkbenchService.install(vsix, { installOnlyNewlyAddedFromExtensionPack: options?.installOnlyNewlyAddedFromExtensionPackVSIX });
                }
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                throw e;
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.uninstallExtension',
        description: {
            description: (0, nls_1.localize)('workbench.extensions.uninstallExtension.description', "Uninstall the given extension"),
            args: [
                {
                    name: (0, nls_1.localize)('workbench.extensions.uninstallExtension.arg.name', "Id of the extension to uninstall"),
                    schema: {
                        'type': 'string'
                    }
                }
            ]
        },
        handler: async (accessor, id) => {
            if (!id) {
                throw new Error((0, nls_1.localize)('id required', "Extension id required."));
            }
            const extensionManagementService = accessor.get(extensionManagement_1.IExtensionManagementService);
            const installed = await extensionManagementService.getInstalled();
            const [extensionToUninstall] = installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
            if (!extensionToUninstall) {
                throw new Error((0, nls_1.localize)('notInstalled', "Extension '{0}' is not installed. Make sure you use the full extension ID, including the publisher, e.g.: ms-dotnettools.csharp.", id));
            }
            if (extensionToUninstall.isBuiltin) {
                throw new Error((0, nls_1.localize)('builtin', "Extension '{0}' is a Built-in extension and cannot be installed", id));
            }
            try {
                await extensionManagementService.uninstall(extensionToUninstall);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                throw e;
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.search',
        description: {
            description: (0, nls_1.localize)('workbench.extensions.search.description', "Search for a specific extension"),
            args: [
                {
                    name: (0, nls_1.localize)('workbench.extensions.search.arg.name', "Query to use in search"),
                    schema: { 'type': 'string' }
                }
            ]
        },
        handler: async (accessor, query = '') => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = await paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            if (!viewlet) {
                return;
            }
            viewlet.getViewPaneContainer().search(query);
            viewlet.focus();
        }
    });
    function overrideActionForActiveExtensionEditorWebview(command, f) {
        command?.addImplementation(105, 'extensions-editor', (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = editorService.activeEditorPane;
            if (editor instanceof extensionEditor_1.ExtensionEditor) {
                if (editor.activeWebview?.isFocused) {
                    f(editor.activeWebview);
                    return true;
                }
            }
            return false;
        });
    }
    overrideActionForActiveExtensionEditorWebview(clipboard_1.CopyAction, webview => webview.copy());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.CutAction, webview => webview.cut());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.PasteAction, webview => webview.paste());
    // Contexts
    exports.CONTEXT_HAS_LOCAL_SERVER = new contextkey_1.RawContextKey('hasLocalServer', false);
    exports.CONTEXT_HAS_REMOTE_SERVER = new contextkey_1.RawContextKey('hasRemoteServer', false);
    exports.CONTEXT_HAS_WEB_SERVER = new contextkey_1.RawContextKey('hasWebServer', false);
    async function runAction(action) {
        try {
            await action.run();
        }
        finally {
            if ((0, lifecycle_1.isDisposable)(action)) {
                action.dispose();
            }
        }
    }
    let ExtensionsContributions = class ExtensionsContributions extends lifecycle_1.Disposable {
        constructor(extensionManagementServerService, extensionGalleryService, contextKeyService, paneCompositeService, extensionsWorkbenchService, extensionEnablementService, instantiationService, dialogService, commandService) {
            super();
            this.extensionManagementServerService = extensionManagementServerService;
            this.paneCompositeService = paneCompositeService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.instantiationService = instantiationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            const hasGalleryContext = extensions_2.CONTEXT_HAS_GALLERY.bindTo(contextKeyService);
            if (extensionGalleryService.isEnabled()) {
                hasGalleryContext.set(true);
            }
            const hasLocalServerContext = exports.CONTEXT_HAS_LOCAL_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                hasLocalServerContext.set(true);
            }
            const hasRemoteServerContext = exports.CONTEXT_HAS_REMOTE_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                hasRemoteServerContext.set(true);
            }
            const hasWebServerContext = exports.CONTEXT_HAS_WEB_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                hasWebServerContext.set(true);
            }
            this.registerGlobalActions();
            this.registerContextMenuActions();
            this.registerQuickAccessProvider();
        }
        registerQuickAccessProvider() {
            if (this.extensionManagementServerService.localExtensionManagementServer
                || this.extensionManagementServerService.remoteExtensionManagementServer
                || this.extensionManagementServerService.webExtensionManagementServer) {
                platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
                    ctor: extensionsQuickAccess_1.InstallExtensionQuickAccessProvider,
                    prefix: extensionsQuickAccess_1.InstallExtensionQuickAccessProvider.PREFIX,
                    placeholder: (0, nls_1.localize)('installExtensionQuickAccessPlaceholder', "Type the name of an extension to install or search."),
                    helpEntries: [{ description: (0, nls_1.localize)('installExtensionQuickAccessHelp', "Install or Search Extensions") }]
                });
            }
        }
        // Global actions
        registerGlobalActions() {
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id: extensions_2.VIEWLET_ID,
                    title: (0, nls_1.localize)({ key: 'miPreferencesExtensions', comment: ['&& denotes a mnemonic'] }, "&&Extensions")
                },
                group: '2_configuration',
                order: 3
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                command: {
                    id: extensions_2.VIEWLET_ID,
                    title: (0, nls_1.localize)('showExtensions', "Extensions")
                },
                group: '2_configuration',
                order: 3
            }));
            this.registerExtensionAction({
                id: 'workbench.extensions.action.focusExtensionsView',
                title: { value: (0, nls_1.localize)('focusExtensions', "Focus on Extensions View"), original: 'Focus on Extensions View' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                run: async (accessor) => {
                    await accessor.get(panecomposite_1.IPaneCompositePartService).openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installExtensions',
                title: { value: (0, nls_1.localize)('installExtensions', "Install Extensions"), original: 'Install Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: async (accessor) => {
                    accessor.get(views_1.IViewsService).openViewContainer(extensions_2.VIEWLET_ID, true);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showRecommendedKeymapExtensions',
                title: { value: (0, nls_1.localize)('showRecommendedKeymapExtensionsShort', "Keymaps"), original: 'Keymaps' },
                category: extensionManagement_1.PreferencesLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(preferences_2.CONTEXT_KEYBINDINGS_EDITOR, extensions_2.CONTEXT_HAS_GALLERY),
                        group: '2_keyboard_discover_actions'
                    }],
                menuTitles: {
                    [actions_1.MenuId.EditorTitle.id]: (0, nls_1.localize)('importKeyboardShortcutsFroms', "Migrate Keyboard Shortcuts from...")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended:keymaps '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showLanguageExtensions',
                title: { value: (0, nls_1.localize)('showLanguageExtensionsShort', "Language Extensions"), original: 'Language Extensions' },
                category: extensionManagement_1.PreferencesLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: extensions_2.CONTEXT_HAS_GALLERY
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended:languages '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.checkForUpdates',
                title: { value: (0, nls_1.localize)('checkForUpdates', "Check for Extension Updates"), original: 'Check for Extension Updates' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), extensions_2.CONTEXT_HAS_GALLERY),
                        group: '1_updates',
                        order: 1
                    }],
                run: async () => {
                    await this.extensionsWorkbenchService.checkForUpdates();
                    const outdated = this.extensionsWorkbenchService.outdated;
                    if (outdated.length) {
                        return runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@outdated '));
                    }
                    else {
                        return this.dialogService.info((0, nls_1.localize)('noUpdatesAvailable', "All extensions are up to date."));
                    }
                }
            });
            const autoUpdateExtensionsSubMenu = new actions_1.MenuId('autoUpdateExtensionsSubMenu');
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
                submenu: autoUpdateExtensionsSubMenu,
                title: (0, nls_1.localize)('configure auto updating extensions', "Auto Update Extensions"),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), extensions_2.CONTEXT_HAS_GALLERY),
                group: '1_updates',
                order: 5,
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.all',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.all', "All Extensions"),
                toggled: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(`config.${extensions_2.AutoUpdateConfigurationKey}`), contextkey_1.ContextKeyExpr.notEquals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions')),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 1,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, true)
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.enabled',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.enabled', "Only Enabled Extensions"),
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions'),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 2,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, 'onlyEnabledExtensions')
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.none',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.none', "None"),
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, false),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 3,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.updateAllExtensions',
                title: { value: (0, nls_1.localize)('updateAll', "Update All Extensions"), original: 'Update All Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                precondition: extensions_2.HasOutdatedExtensionsContext,
                menu: [
                    {
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has(`config.${extensions_2.AutoUpdateConfigurationKey}`).negate(), contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions'))),
                        group: '1_updates',
                        order: 2
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyExpr.equals('view', extensions_2.OUTDATED_EXTENSIONS_VIEW_ID),
                        group: 'navigation',
                        order: 1
                    }
                ],
                icon: extensionsIcons_1.installWorkspaceRecommendedIcon,
                run: () => {
                    return Promise.all(this.extensionsWorkbenchService.outdated.map(async (extension) => {
                        try {
                            await this.extensionsWorkbenchService.install(extension, extension.local?.preRelease ? { installPreReleaseVersion: true } : undefined);
                        }
                        catch (err) {
                            runAction(this.instantiationService.createInstance(extensionsActions_1.PromptExtensionInstallFailureAction, extension, extension.latestVersion, 3 /* InstallOperation.Update */, err));
                        }
                    }));
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAutoUpdate',
                title: { value: (0, nls_1.localize)('disableAutoUpdate', "Disable Auto Update for All Extensions"), original: 'Disable Auto Update for All Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                precondition: extensions_2.CONTEXT_HAS_GALLERY,
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAutoUpdate',
                title: { value: (0, nls_1.localize)('enableAutoUpdate', "Enable Auto Update for All Extensions"), original: 'Enable Auto Update for All Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                precondition: extensions_2.CONTEXT_HAS_GALLERY,
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, true)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAll',
                title: { value: (0, nls_1.localize)('enableAll', "Enable All Extensions"), original: 'Enable All Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                        group: '2_enablement',
                        order: 1
                    }],
                run: async () => {
                    const extensionsToEnable = this.extensionsWorkbenchService.local.filter(e => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 8 /* EnablementState.EnabledGlobally */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAllWorkspace',
                title: { value: (0, nls_1.localize)('enableAllWorkspace', "Enable All Extensions for this Workspace"), original: 'Enable All Extensions for this Workspace' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: async () => {
                    const extensionsToEnable = this.extensionsWorkbenchService.local.filter(e => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 9 /* EnablementState.EnabledWorkspace */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAll',
                title: { value: (0, nls_1.localize)('disableAll', "Disable All Installed Extensions"), original: 'Disable All Installed Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                        group: '2_enablement',
                        order: 2
                    }],
                run: async () => {
                    const extensionsToDisable = this.extensionsWorkbenchService.local.filter(e => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 6 /* EnablementState.DisabledGlobally */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAllWorkspace',
                title: { value: (0, nls_1.localize)('disableAllWorkspace', "Disable All Installed Extensions for this Workspace"), original: 'Disable All Installed Extensions for this Workspace' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: async () => {
                    const extensionsToDisable = this.extensionsWorkbenchService.local.filter(e => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 7 /* EnablementState.DisabledWorkspace */);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
                title: { value: (0, nls_1.localize)('InstallFromVSIX', "Install from VSIX..."), original: 'Install from VSIX...' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER)
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER)),
                        group: '3_install',
                        order: 1
                    }],
                run: async (accessor) => {
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const commandService = accessor.get(commands_1.ICommandService);
                    const vsixPaths = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)('installFromVSIX', "Install from VSIX"),
                        filters: [{ name: 'VSIX Extensions', extensions: ['vsix'] }],
                        canSelectFiles: true,
                        canSelectMany: true,
                        openLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)({ key: 'installButton', comment: ['&& denotes a mnemonic'] }, "&&Install"))
                    });
                    if (vsixPaths) {
                        await commandService.executeCommand(extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixPaths);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
                title: (0, nls_1.localize)('installVSIX', "Install Extension VSIX"),
                menu: [{
                        id: actions_1.MenuId.ExplorerContext,
                        group: 'extensions',
                        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.Extension.isEqualTo('.vsix'), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER)),
                    }],
                run: async (accessor, resources) => {
                    const extensionService = accessor.get(extensions_3.IExtensionService);
                    const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const hostService = accessor.get(host_1.IHostService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const extensions = Array.isArray(resources) ? resources : [resources];
                    await async_1.Promises.settled(extensions.map(async (vsix) => await extensionsWorkbenchService.install(vsix)))
                        .then(async (extensions) => {
                        for (const extension of extensions) {
                            const requireReload = !(extension.local && extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                            const message = requireReload ? (0, nls_1.localize)('InstallVSIXAction.successReload', "Completed installing {0} extension from VSIX. Please reload Visual Studio Code to enable it.", extension.displayName || extension.name)
                                : (0, nls_1.localize)('InstallVSIXAction.success', "Completed installing {0} extension from VSIX.", extension.displayName || extension.name);
                            const actions = requireReload ? [{
                                    label: (0, nls_1.localize)('InstallVSIXAction.reloadNow', "Reload Now"),
                                    run: () => hostService.reload()
                                }] : [];
                            notificationService.prompt(notification_1.Severity.Info, message, actions);
                        }
                    });
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installExtensionFromLocation',
                title: { value: (0, nls_1.localize)('installExtensionFromLocation', "Install Extension from Location..."), original: 'Install Extension from Location...' },
                category: actionCommonCategories_1.Categories.Developer,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_WEB_SERVER, exports.CONTEXT_HAS_LOCAL_SERVER)
                    }],
                run: async (accessor) => {
                    const extensionManagementService = accessor.get(extensionManagement_2.IWorkbenchExtensionManagementService);
                    if (platform_2.isWeb) {
                        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                        const disposables = new lifecycle_1.DisposableStore();
                        const quickPick = disposables.add(quickInputService.createQuickPick());
                        quickPick.title = (0, nls_1.localize)('installFromLocation', "Install Extension from Location");
                        quickPick.customButton = true;
                        quickPick.customLabel = (0, nls_1.localize)('install button', "Install");
                        quickPick.placeholder = (0, nls_1.localize)('installFromLocationPlaceHolder', "Location of the web extension");
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
                        const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                        const extensionLocation = await fileDialogService.showOpenDialog({
                            canSelectFolders: true,
                            canSelectFiles: false,
                            canSelectMany: false,
                            title: (0, nls_1.localize)('installFromLocation', "Install Extension from Location"),
                        });
                        if (extensionLocation?.[0]) {
                            extensionManagementService.installFromLocation(extensionLocation[0]);
                        }
                    }
                }
            });
            const extensionsFilterSubMenu = new actions_1.MenuId('extensionsFilterSubMenu');
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
                submenu: extensionsFilterSubMenu,
                title: (0, nls_1.localize)('filterExtensions', "Filter Extensions..."),
                when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                group: 'navigation',
                order: 1,
                icon: extensionsIcons_1.filterIcon,
            });
            const showFeaturedExtensionsId = 'extensions.filter.featured';
            this.registerExtensionAction({
                id: showFeaturedExtensionsId,
                title: { value: (0, nls_1.localize)('showFeaturedExtensions', "Show Featured Extensions"), original: 'Show Featured Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('featured filter', "Featured")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@featured '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showPopularExtensions',
                title: { value: (0, nls_1.localize)('showPopularExtensions', "Show Popular Extensions"), original: 'Show Popular Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('most popular filter', "Most Popular")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@popular '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showRecommendedExtensions',
                title: { value: (0, nls_1.localize)('showRecommendedExtensions', "Show Recommended Extensions"), original: 'Show Recommended Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('most popular recommended', "Recommended")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.recentlyPublishedExtensions',
                title: { value: (0, nls_1.localize)('recentlyPublishedExtensions', "Show Recently Published Extensions"), original: 'Show Recently Published Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('recently published filter', "Recently Published")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recentlyPublished '))
            });
            const extensionsCategoryFilterSubMenu = new actions_1.MenuId('extensionsCategoryFilterSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsCategoryFilterSubMenu,
                title: (0, nls_1.localize)('filter by category', "Category"),
                when: extensions_2.CONTEXT_HAS_GALLERY,
                group: '2_categories',
                order: 1,
            });
            extensions_4.EXTENSION_CATEGORIES.map((category, index) => {
                this.registerExtensionAction({
                    id: `extensions.actions.searchByCategory.${category}`,
                    title: category,
                    menu: [{
                            id: extensionsCategoryFilterSubMenu,
                            when: extensions_2.CONTEXT_HAS_GALLERY,
                            order: index,
                        }],
                    run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, `@category:"${category.toLowerCase()}"`))
                });
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.listBuiltInExtensions',
                title: { value: (0, nls_1.localize)('showBuiltInExtensions', "Show Built-in Extensions"), original: 'Show Built-in Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('builtin filter', "Built-in")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@builtin '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.extensionUpdates',
                title: { value: (0, nls_1.localize)('extensionUpdates', "Show Extension Updates"), original: 'Show Extension Updates' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                precondition: extensions_2.CONTEXT_HAS_GALLERY,
                f1: true,
                menu: [{
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('extension updates filter', "Updates")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@updates'))
            });
            this.registerExtensionAction({
                id: extensions_2.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
                title: { value: (0, nls_1.localize)('showWorkspaceUnsupportedExtensions', "Show Extensions Unsupported By Workspace"), original: 'Show Extensions Unsupported By Workspace' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER),
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 5,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER),
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('workspace unsupported filter', "Workspace Unsupported")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@workspaceUnsupported'))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showEnabledExtensions',
                title: { value: (0, nls_1.localize)('showEnabledExtensions', "Show Enabled Extensions"), original: 'Show Enabled Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 3,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('enabled filter', "Enabled")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@enabled '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showDisabledExtensions',
                title: { value: (0, nls_1.localize)('showDisabledExtensions', "Show Disabled Extensions"), original: 'Show Disabled Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 4,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('disabled filter', "Disabled")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@disabled '))
            });
            const extensionsSortSubMenu = new actions_1.MenuId('extensionsSortSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsSortSubMenu,
                title: (0, nls_1.localize)('sorty by', "Sort By"),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(extensions_2.CONTEXT_HAS_GALLERY, extensionsViewlet_1.DefaultViewsContext)),
                group: '4_sort',
                order: 1,
            });
            [
                { id: 'installs', title: (0, nls_1.localize)('sort by installs', "Install Count"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'rating', title: (0, nls_1.localize)('sort by rating', "Rating"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'name', title: (0, nls_1.localize)('sort by name', "Name"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'publishedDate', title: (0, nls_1.localize)('sort by published date', "Published Date"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'updateDate', title: (0, nls_1.localize)('sort by update date', "Updated Date"), precondition: contextkey_1.ContextKeyExpr.and(extensionsViewlet_1.SearchMarketplaceExtensionsContext.negate(), extensionsViewlet_1.RecommendedExtensionsContext.negate(), extensionsViewlet_1.BuiltInExtensionsContext.negate()) },
            ].map(({ id, title, precondition }, index) => {
                this.registerExtensionAction({
                    id: `extensions.sort.${id}`,
                    title,
                    precondition: precondition,
                    menu: [{
                            id: extensionsSortSubMenu,
                            when: contextkey_1.ContextKeyExpr.or(extensions_2.CONTEXT_HAS_GALLERY, extensionsViewlet_1.DefaultViewsContext),
                            order: index,
                        }],
                    toggled: extensionsViewlet_1.ExtensionsSortByContext.isEqualTo(id),
                    run: async () => {
                        const viewlet = await this.paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                        const extensionsViewPaneContainer = viewlet?.getViewPaneContainer();
                        const currentQuery = extensionQuery_1.Query.parse(extensionsViewPaneContainer.searchValue || '');
                        extensionsViewPaneContainer.search(new extensionQuery_1.Query(currentQuery.value, id, currentQuery.groupBy).toString());
                        extensionsViewPaneContainer.focus();
                    }
                });
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.clearExtensionsSearchResults',
                title: { value: (0, nls_1.localize)('clearExtensionsSearchResults', "Clear Extensions Search Results"), original: 'Clear Extensions Search Results' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                icon: extensionsIcons_1.clearSearchResultsIcon,
                f1: true,
                precondition: extensionsViewlet_1.SearchHasTextContext,
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                    group: 'navigation',
                    order: 3,
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(views_1.IViewsService).getActiveViewPaneContainerWithId(extensions_2.VIEWLET_ID);
                    if (viewPaneContainer) {
                        const extensionsViewPaneContainer = viewPaneContainer;
                        extensionsViewPaneContainer.search('');
                        extensionsViewPaneContainer.focus();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.refreshExtension',
                title: { value: (0, nls_1.localize)('refreshExtension', "Refresh"), original: 'Refresh' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                icon: extensionsIcons_1.refreshIcon,
                f1: true,
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                    group: 'navigation',
                    order: 2
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(views_1.IViewsService).getActiveViewPaneContainerWithId(extensions_2.VIEWLET_ID);
                    if (viewPaneContainer) {
                        await viewPaneContainer.refresh();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installWorkspaceRecommendedExtensions',
                title: (0, nls_1.localize)('installWorkspaceRecommendedExtensions', "Install Workspace Recommended Extensions"),
                icon: extensionsIcons_1.installWorkspaceRecommendedIcon,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.equals('view', extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID),
                    group: 'navigation',
                    order: 1
                },
                run: async (accessor) => {
                    const view = accessor.get(views_1.IViewsService).getActiveViewWithId(extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID);
                    return view.installWorkspaceRecommendations();
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
                title: extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL,
                icon: extensionsIcons_1.configureRecommendedIcon,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'),
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyExpr.equals('view', extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID),
                        group: 'navigation',
                        order: 2
                    }],
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction, extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.ID, extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL))
            });
            this.registerExtensionAction({
                id: extensionsActions_1.InstallSpecificVersionOfExtensionAction.ID,
                title: { value: extensionsActions_1.InstallSpecificVersionOfExtensionAction.LABEL, original: 'Install Specific Version of Extension...' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.InstallSpecificVersionOfExtensionAction, extensionsActions_1.InstallSpecificVersionOfExtensionAction.ID, extensionsActions_1.InstallSpecificVersionOfExtensionAction.LABEL))
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ReinstallAction.ID,
                title: { value: extensionsActions_1.ReinstallAction.LABEL, original: 'Reinstall Extension...' },
                category: actionCommonCategories_1.Categories.Developer,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER))
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ReinstallAction, extensionsActions_1.ReinstallAction.ID, extensionsActions_1.ReinstallAction.LABEL))
            });
        }
        // Extension Context Menu
        registerContextMenuActions() {
            this.registerExtensionAction({
                id: extensionsActions_1.SetColorThemeAction.ID,
                title: extensionsActions_1.SetColorThemeAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.THEME_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasColorThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.SetColorThemeAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.SetFileIconThemeAction.ID,
                title: extensionsActions_1.SetFileIconThemeAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.THEME_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasFileIconThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.SetFileIconThemeAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.SetProductIconThemeAction.ID,
                title: extensionsActions_1.SetProductIconThemeAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.THEME_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasProductIconThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.SetProductIconThemeAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showPreReleaseVersion',
                title: { value: (0, nls_1.localize)('show pre-release version', "Show Pre-Release Version"), original: 'Show Pre-Release Version' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('inExtensionEditor'), contextkey_1.ContextKeyExpr.has('extensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('showPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    extensionWorkbenchService.open(extension, { showPreReleaseVersion: true });
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showReleasedVersion',
                title: { value: (0, nls_1.localize)('show released version', "Show Release Version"), original: 'Show Release Version' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('inExtensionEditor'), contextkey_1.ContextKeyExpr.has('extensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.has('extensionHasReleaseVersion'), contextkey_1.ContextKeyExpr.has('showPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    extensionWorkbenchService.open(extension, { showPreReleaseVersion: false });
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.SwitchToPreReleaseVersionAction.ID,
                title: extensionsActions_1.SwitchToPreReleaseVersionAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('installedExtensionIsPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('installedExtensionIsOptedTpPreRelease'), contextkey_1.ContextKeyExpr.has('extensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, id) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                    if (extension) {
                        extensionWorkbenchService.open(extension, { showPreReleaseVersion: true });
                        await extensionWorkbenchService.install(extension, { installPreReleaseVersion: true });
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.SwitchToReleasedVersionAction.ID,
                title: extensionsActions_1.SwitchToReleasedVersionAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 3,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('installedExtensionIsPreReleaseVersion'), contextkey_1.ContextKeyExpr.has('extensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.has('extensionHasReleaseVersion'), contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, id) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                    if (extension) {
                        extensionWorkbenchService.open(extension, { showPreReleaseVersion: false });
                        await extensionWorkbenchService.install(extension, { installPreReleaseVersion: false });
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ClearLanguageAction.ID,
                title: extensionsActions_1.ClearLanguageAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.has('canSetLanguage'), contextkey_1.ContextKeyExpr.has('isActiveLanguagePackExtension'))
                },
                run: async (accessor, extensionId) => {
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = (await extensionsWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    const action = instantiationService.createInstance(extensionsActions_1.ClearLanguageAction);
                    action.extension = extension;
                    return action.run();
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.copyExtension',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.copyExtension', "Copy"), original: 'Copy' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, extensionId) => {
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    const extension = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }))[0]
                        || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    if (extension) {
                        const name = (0, nls_1.localize)('extensionInfoName', 'Name: {0}', extension.displayName);
                        const id = (0, nls_1.localize)('extensionInfoId', 'Id: {0}', extensionId);
                        const description = (0, nls_1.localize)('extensionInfoDescription', 'Description: {0}', extension.description);
                        const verision = (0, nls_1.localize)('extensionInfoVersion', 'Version: {0}', extension.version);
                        const publisher = (0, nls_1.localize)('extensionInfoPublisher', 'Publisher: {0}', extension.publisherDisplayName);
                        const link = extension.url ? (0, nls_1.localize)('extensionInfoVSMarketplaceLink', 'VS Marketplace Link: {0}', `${extension.url}`) : null;
                        const clipboardStr = `${name}\n${id}\n${description}\n${verision}\n${publisher}${link ? '\n' + link : ''}`;
                        await clipboardService.writeText(clipboardStr);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.copyExtensionId',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.copyExtensionId', "Copy Extension ID"), original: 'Copy Extension ID' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, id) => accessor.get(clipboardService_1.IClipboardService).writeText(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.configure',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.configure', "Extension Settings"), original: 'Extension Settings' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasConfiguration')),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: `@ext:${id}` })
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.configureKeybindings',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.configureKeybindings', "Extension Keyboard Shortcuts"), original: 'Extension Keyboard Shortcuts' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasKeybindings')),
                    order: 2
                },
                run: async (accessor, id) => accessor.get(preferences_1.IPreferencesService).openGlobalKeybindingSettings(false, { query: `@ext:${id}` })
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.toggleApplyToAllProfiles',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.toggleApplyToAllProfiles', "Apply Extension to all Profiles"), original: `Apply Extension to all Profiles` },
                toggled: contextkey_1.ContextKeyExpr.has('isApplicationScopedExtension'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('isDefaultApplicationScopedExtension').negate(), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate()),
                    order: 3
                },
                run: async (accessor, id) => {
                    const extension = this.extensionsWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier));
                    if (extension) {
                        return this.extensionsWorkbenchService.toggleApplyExtensionToAllProfiles(extension);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.TOGGLE_IGNORE_EXTENSION_ACTION_ID,
                title: { value: (0, nls_1.localize)('workbench.extensions.action.toggleIgnoreExtension', "Sync This Extension"), original: `Sync This Extension` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(userDataSync_1.CONTEXT_SYNC_ENABLEMENT, contextkey_1.ContextKeyExpr.has('inExtensionEditor').negate()),
                    order: 4
                },
                run: async (accessor, id) => {
                    const extension = this.extensionsWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier));
                    if (extension) {
                        return this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(extension);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.ignoreRecommendation',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.ignoreRecommendation', "Ignore Recommendation"), original: `Ignore Recommendation` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.has('isExtensionRecommended'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, true)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.undoIgnoredRecommendation',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.undoIgnoredRecommendation', "Undo Ignored Recommendation"), original: `Undo Ignored Recommendation` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.has('isUserIgnoredRecommendation'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addExtensionToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addExtensionToWorkspaceRecommendations', "Add to Workspace Recommendations"), original: `Add to Workspace Recommendations` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate(), contextkey_1.ContextKeyExpr.has('isExtensionWorkspaceRecommended').negate(), contextkey_1.ContextKeyExpr.has('isUserIgnoredRecommendation').negate()),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService).toggleRecommendation(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.removeExtensionFromWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.removeExtensionFromWorkspaceRecommendations', "Remove from Workspace Recommendations"), original: `Remove from Workspace Recommendations` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate(), contextkey_1.ContextKeyExpr.has('isExtensionWorkspaceRecommended')),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService).toggleRecommendation(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceRecommendations', "Add Extension to Workspace Recommendations"), original: `Add Extension to Workspace Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const workspaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.ExtensionsInput)) {
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
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceFolderRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceFolderRecommendations', "Add Extension to Workspace Folder Recommendations"), original: `Add Extension to Workspace Folder Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.commandService.executeCommand('workbench.extensions.action.addToWorkspaceRecommendations')
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceIgnoredRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceIgnoredRecommendations', "Add Extension to Workspace Ignored Recommendations"), original: `Add Extension to Workspace Ignored Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const workspaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.ExtensionsInput)) {
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
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations', "Add Extension to Workspace Folder Ignored Recommendations"), original: `Add Extension to Workspace Folder Ignored Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.commandService.executeCommand('workbench.extensions.action.addToWorkspaceIgnoredRecommendations')
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.ID,
                title: { value: extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.LABEL, original: 'Configure Recommended Extensions (Workspace)' },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'),
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction, extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.ID, extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.LABEL))
            });
        }
        registerExtensionAction(extensionActionOptions) {
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
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, actions_1.registerAction2)(class extends actions_1.Action2 {
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
                disposables.add(actions_1.MenuRegistry.appendMenuItems(menusWithTitles));
            }
            return disposables;
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, panecomposite_1.IPaneCompositePartService),
        __param(4, extensions_2.IExtensionsWorkbenchService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, commands_1.ICommandService)
    ], ExtensionsContributions);
    let ExtensionStorageCleaner = class ExtensionStorageCleaner {
        constructor(extensionManagementService, storageService) {
            extensionStorage_1.ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
        }
    };
    ExtensionStorageCleaner = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, storage_1.IStorageService)
    ], ExtensionStorageCleaner);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.StatusUpdater, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.MaliciousExtensionChecker, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsUtils_1.KeymapExtensions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.ExtensionsViewletViewsContribution, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsActivationProgress_1.ExtensionActivationProgress, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsDependencyChecker_1.ExtensionDependencyChecker, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionEnablementWorkspaceTrustTransitionParticipant_1.ExtensionEnablementWorkspaceTrustTransitionParticipant, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsCompletionItemsProvider_1.ExtensionsCompletionItemsProvider, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(unsupportedExtensionsMigrationContribution_1.UnsupportedExtensionsMigrationContrib, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(deprecatedExtensionsChecker_1.DeprecatedExtensionsChecker, 4 /* LifecyclePhase.Eventually */);
    if (platform_2.isWeb) {
        workbenchRegistry.registerWorkbenchContribution(ExtensionStorageCleaner, 4 /* LifecyclePhase.Eventually */);
    }
    // Running Extensions
    (0, actions_1.registerAction2)(abstractRuntimeExtensionsEditor_1.ShowRuntimeExtensionsAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEVoRyxhQUFhO0lBQ2IsSUFBQSw4QkFBaUIsRUFBQyx3Q0FBMkIsRUFBRSx1REFBMEIsa0NBQXdELENBQUM7SUFDbEksSUFBQSw4QkFBaUIsRUFBQyxzRUFBMkMsRUFBRSx1RkFBMEMsb0NBQTRCLENBQUM7SUFDdEksSUFBQSw4QkFBaUIsRUFBQywyREFBZ0MsRUFBRSxpRUFBK0Isa0NBQTBFLENBQUM7SUFFOUosZUFBZTtJQUNmLG1CQUFRLENBQUMsRUFBRSxDQUF1Qix3QkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDO1FBQ3JGLElBQUksRUFBRSwyREFBbUM7UUFDekMsTUFBTSxFQUFFLDJEQUFtQyxDQUFDLE1BQU07UUFDbEQsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHdDQUF3QyxFQUFFLG1DQUFtQyxDQUFDO1FBQ3BHLFdBQVcsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztLQUNyRixDQUFDLENBQUM7SUFFSCxTQUFTO0lBQ1QsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLGlDQUFlLEVBQ2YsaUNBQWUsQ0FBQyxFQUFFLEVBQ2xCLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FDbEMsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxpQ0FBZSxDQUFDO0tB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