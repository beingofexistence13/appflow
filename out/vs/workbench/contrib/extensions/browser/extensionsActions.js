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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/json", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/configuration/common/jsonEditing", "vs/editor/common/services/resolverService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/base/browser/ui/aria/aria", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/label/common/label", "vs/workbench/services/textfile/common/textfiles", "vs/platform/product/common/productService", "vs/platform/dialogs/common/dialogs", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/errors", "vs/platform/userDataSync/common/userDataSync", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/log/common/log", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/base/common/platform", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/htmlContent", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/arrays", "vs/base/common/date", "vs/workbench/services/preferences/common/preferences", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/base/common/types", "vs/workbench/services/log/common/logConstants", "vs/platform/telemetry/common/telemetry", "vs/css!./media/extensionActions"], function (require, exports, nls_1, actions_1, async_1, DOM, event_1, json, contextView_1, lifecycle_1, extensions_1, extensionsFileTemplate_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensions_2, instantiation_1, files_1, workspace_1, host_1, extensions_3, uri_1, commands_1, configuration_1, themeService_1, themables_1, colorRegistry_1, jsonEditing_1, resolverService_1, contextkey_1, actions_2, workspaceCommands_1, notification_1, opener_1, editorService_1, quickInput_1, cancellation_1, aria_1, workbenchThemeService_1, label_1, textfiles_1, productService_1, dialogs_1, progress_1, actionViewItems_1, workspaceExtensionsConfig_1, errors_1, userDataSync_1, dropdownActionViewItem_1, log_1, extensionsIcons_1, platform_1, extensionManifestPropertiesService_1, workspaceTrust_1, virtualWorkspace_1, htmlContent_1, panecomposite_1, arrays_1, date_1, preferences_1, languagePacks_1, locale_1, types_1, logConstants_1, telemetry_1) {
    "use strict";
    var InstallAction_1, InstallInOtherServerAction_1, UninstallAction_1, MigrateDeprecatedExtensionAction_1, ManageExtensionAction_1, SwitchToPreReleaseVersionAction_1, SwitchToReleasedVersionAction_1, InstallAnotherVersionAction_1, EnableForWorkspaceAction_1, EnableGloballyAction_1, DisableForWorkspaceAction_1, DisableGloballyAction_1, ReloadAction_1, SetColorThemeAction_1, SetFileIconThemeAction_1, SetProductIconThemeAction_1, SetLanguageAction_1, ClearLanguageAction_1, ShowRecommendedExtensionAction_1, InstallRecommendedExtensionAction_1, IgnoreExtensionRecommendationAction_1, UndoIgnoreExtensionRecommendationAction_1, ExtensionStatusLabelAction_1, ToggleSyncExtensionAction_1, ExtensionStatusAction_1, ReinstallAction_1, InstallSpecificVersionOfExtensionAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extensionButtonProminentBackground = exports.InstallRemoteExtensionsInLocalAction = exports.InstallLocalExtensionsInRemoteAction = exports.AbstractInstallExtensionsInServerAction = exports.InstallSpecificVersionOfExtensionAction = exports.ReinstallAction = exports.ExtensionStatusAction = exports.ToggleSyncExtensionAction = exports.ExtensionStatusLabelAction = exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = exports.ConfigureWorkspaceRecommendedExtensionsAction = exports.AbstractConfigureRecommendedExtensionsAction = exports.SearchExtensionsAction = exports.UndoIgnoreExtensionRecommendationAction = exports.IgnoreExtensionRecommendationAction = exports.InstallRecommendedExtensionAction = exports.ShowRecommendedExtensionAction = exports.ClearLanguageAction = exports.SetLanguageAction = exports.SetProductIconThemeAction = exports.SetFileIconThemeAction = exports.SetColorThemeAction = exports.ReloadAction = exports.DisableDropDownAction = exports.EnableDropDownAction = exports.DisableGloballyAction = exports.DisableForWorkspaceAction = exports.EnableGloballyAction = exports.EnableForWorkspaceAction = exports.InstallAnotherVersionAction = exports.SwitchToReleasedVersionAction = exports.SwitchToPreReleaseVersionAction = exports.MenuItemExtensionAction = exports.ExtensionEditorManageExtensionAction = exports.ManageExtensionAction = exports.getContextMenuActions = exports.DropDownMenuActionViewItem = exports.ExtensionDropDownAction = exports.ExtensionActionWithDropdownActionViewItem = exports.MigrateDeprecatedExtensionAction = exports.SkipUpdateAction = exports.UpdateAction = exports.UninstallAction = exports.WebInstallAction = exports.LocalInstallAction = exports.RemoteInstallAction = exports.InstallInOtherServerAction = exports.InstallingLabelAction = exports.InstallDropdownAction = exports.InstallAction = exports.ActionWithDropDownAction = exports.ExtensionAction = exports.PromptExtensionInstallFailureAction = void 0;
    let PromptExtensionInstallFailureAction = class PromptExtensionInstallFailureAction extends actions_1.Action {
        constructor(extension, version, installOperation, error, productService, openerService, notificationService, dialogService, commandService, logService, extensionManagementServerService, instantiationService, galleryService, extensionManifestPropertiesService) {
            super('extension.promptExtensionInstallFailure');
            this.extension = extension;
            this.version = version;
            this.installOperation = installOperation;
            this.error = error;
            this.productService = productService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            this.logService = logService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.instantiationService = instantiationService;
            this.galleryService = galleryService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        }
        async run() {
            if ((0, errors_1.isCancellationError)(this.error)) {
                return;
            }
            this.logService.error(this.error);
            if (this.error.name === extensionManagement_1.ExtensionManagementErrorCode.Unsupported) {
                const productName = platform_1.isWeb ? (0, nls_1.localize)('VS Code for Web', "{0} for the Web", this.productService.nameLong) : this.productService.nameLong;
                const message = (0, nls_1.localize)('cannot be installed', "The '{0}' extension is not available in {1}. Click 'More Information' to learn more.", this.extension.displayName || this.extension.identifier.id, productName);
                const { confirmed } = await this.dialogService.confirm({
                    type: notification_1.Severity.Info,
                    message,
                    primaryButton: (0, nls_1.localize)({ key: 'more information', comment: ['&& denotes a mnemonic'] }, "&&More Information"),
                    cancelButton: (0, nls_1.localize)('close', "Close")
                });
                if (confirmed) {
                    this.openerService.open(platform_1.isWeb ? uri_1.URI.parse('https://aka.ms/vscode-web-extensions-guide') : uri_1.URI.parse('https://aka.ms/vscode-remote'));
                }
                return;
            }
            if ([extensionManagement_1.ExtensionManagementErrorCode.Incompatible, extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform, extensionManagement_1.ExtensionManagementErrorCode.Malicious, extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound, extensionManagement_1.ExtensionManagementErrorCode.Deprecated].includes(this.error.name)) {
                await this.dialogService.info((0, errors_1.getErrorMessage)(this.error));
                return;
            }
            if (extensionManagement_1.ExtensionManagementErrorCode.Signature === this.error.name) {
                await this.dialogService.prompt({
                    type: 'error',
                    message: (0, nls_1.localize)('signature verification failed', "{0} cannot verify the '{1}' extension. Are you sure you want to install it?", this.productService.nameLong, this.extension.displayName || this.extension.identifier.id),
                    buttons: [{
                            label: (0, nls_1.localize)('install anyway', "Install Anyway"),
                            run: () => {
                                const installAction = this.instantiationService.createInstance(InstallAction, { donotVerifySignature: true });
                                installAction.extension = this.extension;
                                return installAction.run();
                            }
                        }],
                    cancelButton: (0, nls_1.localize)('cancel', "Cancel")
                });
                return;
            }
            const operationMessage = this.installOperation === 3 /* InstallOperation.Update */ ? (0, nls_1.localize)('update operation', "Error while updating '{0}' extension.", this.extension.displayName || this.extension.identifier.id)
                : (0, nls_1.localize)('install operation', "Error while installing '{0}' extension.", this.extension.displayName || this.extension.identifier.id);
            let additionalMessage;
            const promptChoices = [];
            const downloadUrl = await this.getDownloadUrl();
            if (downloadUrl) {
                additionalMessage = (0, nls_1.localize)('check logs', "Please check the [log]({0}) for more details.", `command:${logConstants_1.showWindowLogActionId}`);
                promptChoices.push({
                    label: (0, nls_1.localize)('download', "Try Downloading Manually..."),
                    run: () => this.openerService.open(downloadUrl).then(() => {
                        this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('install vsix', 'Once downloaded, please manually install the downloaded VSIX of \'{0}\'.', this.extension.identifier.id), [{
                                label: (0, nls_1.localize)('installVSIX', "Install from VSIX..."),
                                run: () => this.commandService.executeCommand(extensions_1.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID)
                            }]);
                    })
                });
            }
            const message = `${operationMessage}${additionalMessage ? ` ${additionalMessage}` : ''}`;
            this.notificationService.prompt(notification_1.Severity.Error, message, promptChoices);
        }
        async getDownloadUrl() {
            if (platform_1.isIOS) {
                return undefined;
            }
            if (!this.extension.gallery) {
                return undefined;
            }
            if (!this.productService.extensionsGallery) {
                return undefined;
            }
            if (!this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer) {
                return undefined;
            }
            let targetPlatform = this.extension.gallery.properties.targetPlatform;
            if (targetPlatform !== "universal" /* TargetPlatform.UNIVERSAL */ && targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ && this.extensionManagementServerService.remoteExtensionManagementServer) {
                try {
                    const manifest = await this.galleryService.getManifest(this.extension.gallery, cancellation_1.CancellationToken.None);
                    if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(manifest)) {
                        targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
                    }
                }
                catch (error) {
                    this.logService.error(error);
                    return undefined;
                }
            }
            if (targetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
                return undefined;
            }
            return uri_1.URI.parse(`${this.productService.extensionsGallery.serviceUrl}/publishers/${this.extension.publisher}/vsextensions/${this.extension.name}/${this.version}/vspackage${targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ ? `?targetPlatform=${targetPlatform}` : ''}`);
        }
    };
    exports.PromptExtensionInstallFailureAction = PromptExtensionInstallFailureAction;
    exports.PromptExtensionInstallFailureAction = PromptExtensionInstallFailureAction = __decorate([
        __param(4, productService_1.IProductService),
        __param(5, opener_1.IOpenerService),
        __param(6, notification_1.INotificationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, commands_1.ICommandService),
        __param(9, log_1.ILogService),
        __param(10, extensionManagement_2.IExtensionManagementServerService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, extensionManagement_1.IExtensionGalleryService),
        __param(13, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], PromptExtensionInstallFailureAction);
    class ExtensionAction extends actions_1.Action {
        constructor() {
            super(...arguments);
            this._extension = null;
        }
        static { this.EXTENSION_ACTION_CLASS = 'extension-action'; }
        static { this.TEXT_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} text`; }
        static { this.LABEL_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} label`; }
        static { this.ICON_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} icon`; }
        get extension() { return this._extension; }
        set extension(extension) { this._extension = extension; this.update(); }
    }
    exports.ExtensionAction = ExtensionAction;
    class ActionWithDropDownAction extends ExtensionAction {
        get menuActions() { return [...this._menuActions]; }
        get extension() {
            return super.extension;
        }
        set extension(extension) {
            this.extensionActions.forEach(a => a.extension = extension);
            super.extension = extension;
        }
        constructor(id, label, actionsGroups) {
            super(id, label);
            this.actionsGroups = actionsGroups;
            this._menuActions = [];
            this.extensionActions = (0, arrays_1.flatten)(actionsGroups);
            this.update();
            this._register(event_1.Event.any(...this.extensionActions.map(a => a.onDidChange))(() => this.update(true)));
            this.extensionActions.forEach(a => this._register(a));
        }
        update(donotUpdateActions) {
            if (!donotUpdateActions) {
                this.extensionActions.forEach(a => a.update());
            }
            const enabledActionsGroups = this.actionsGroups.map(actionsGroup => actionsGroup.filter(a => a.enabled));
            let actions = [];
            for (const enabledActions of enabledActionsGroups) {
                if (enabledActions.length) {
                    actions = [...actions, ...enabledActions, new actions_1.Separator()];
                }
            }
            actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
            this.action = actions[0];
            this._menuActions = actions.length > 1 ? actions : [];
            this.enabled = !!this.action;
            if (this.action) {
                this.label = this.getLabel(this.action);
                this.tooltip = this.action.tooltip;
            }
            let clazz = (this.action || this.extensionActions[0])?.class || '';
            clazz = clazz ? `${clazz} action-dropdown` : 'action-dropdown';
            if (this._menuActions.length === 0) {
                clazz += ' action-dropdown';
            }
            this.class = clazz;
        }
        run() {
            const enabledActions = this.extensionActions.filter(a => a.enabled);
            return enabledActions[0].run();
        }
        getLabel(action) {
            return action.label;
        }
    }
    exports.ActionWithDropDownAction = ActionWithDropDownAction;
    let InstallAction = class InstallAction extends ExtensionAction {
        static { InstallAction_1 = this; }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`; }
        set manifest(manifest) {
            this._manifest = manifest;
            this.updateLabel();
        }
        constructor(options, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService, telemetryService) {
            super('extensions.install', (0, nls_1.localize)('install', "Install"), InstallAction_1.Class, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.instantiationService = instantiationService;
            this.runtimeExtensionService = runtimeExtensionService;
            this.workbenchThemeService = workbenchThemeService;
            this.labelService = labelService;
            this.dialogService = dialogService;
            this.preferencesService = preferencesService;
            this.telemetryService = telemetryService;
            this._manifest = null;
            this.updateThrottler = new async_1.Throttler();
            this.options = { ...options, isMachineScoped: false };
            this.update();
            this._register(this.labelService.onDidChangeFormatters(() => this.updateLabel(), this));
        }
        update() {
            this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
        }
        async computeAndUpdateEnablement() {
            this.enabled = false;
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                return;
            }
            if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.state === 3 /* ExtensionState.Uninstalled */ && await this.extensionsWorkbenchService.canInstall(this.extension)) {
                this.enabled = this.options.installPreReleaseVersion ? this.extension.hasPreReleaseVersion : this.extension.hasReleaseVersion;
                this.updateLabel();
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            if (this.extension.deprecationInfo) {
                let detail = (0, nls_1.localize)('deprecated message', "This extension is deprecated as it is no longer being maintained.");
                let DeprecationChoice;
                (function (DeprecationChoice) {
                    DeprecationChoice[DeprecationChoice["InstallAnyway"] = 0] = "InstallAnyway";
                    DeprecationChoice[DeprecationChoice["ShowAlternateExtension"] = 1] = "ShowAlternateExtension";
                    DeprecationChoice[DeprecationChoice["ConfigureSettings"] = 2] = "ConfigureSettings";
                    DeprecationChoice[DeprecationChoice["Cancel"] = 3] = "Cancel";
                })(DeprecationChoice || (DeprecationChoice = {}));
                const buttons = [
                    {
                        label: (0, nls_1.localize)('install anyway', "Install Anyway"),
                        run: () => DeprecationChoice.InstallAnyway
                    }
                ];
                if (this.extension.deprecationInfo.extension) {
                    detail = (0, nls_1.localize)('deprecated with alternate extension message', "This extension is deprecated. Use the {0} extension instead.", this.extension.deprecationInfo.extension.displayName);
                    const alternateExtension = this.extension.deprecationInfo.extension;
                    buttons.push({
                        label: (0, nls_1.localize)({ key: 'Show alternate extension', comment: ['&& denotes a mnemonic'] }, "&&Open {0}", this.extension.deprecationInfo.extension.displayName),
                        run: async () => {
                            const [extension] = await this.extensionsWorkbenchService.getExtensions([{ id: alternateExtension.id, preRelease: alternateExtension.preRelease }], cancellation_1.CancellationToken.None);
                            await this.extensionsWorkbenchService.open(extension);
                            return DeprecationChoice.ShowAlternateExtension;
                        }
                    });
                }
                else if (this.extension.deprecationInfo.settings) {
                    detail = (0, nls_1.localize)('deprecated with alternate settings message', "This extension is deprecated as this functionality is now built-in to VS Code.");
                    const settings = this.extension.deprecationInfo.settings;
                    buttons.push({
                        label: (0, nls_1.localize)({ key: 'configure in settings', comment: ['&& denotes a mnemonic'] }, "&&Configure Settings"),
                        run: async () => {
                            await this.preferencesService.openSettings({ query: settings.map(setting => `@id:${setting}`).join(' ') });
                            return DeprecationChoice.ConfigureSettings;
                        }
                    });
                }
                else if (this.extension.deprecationInfo.additionalInfo) {
                    detail = new htmlContent_1.MarkdownString(`${detail} ${this.extension.deprecationInfo.additionalInfo}`);
                }
                const { result } = await this.dialogService.prompt({
                    type: notification_1.Severity.Warning,
                    message: (0, nls_1.localize)('install confirmation', "Are you sure you want to install '{0}'?", this.extension.displayName),
                    detail: (0, types_1.isString)(detail) ? detail : undefined,
                    custom: (0, types_1.isString)(detail) ? undefined : {
                        markdownDetails: [{
                                markdown: detail
                            }]
                    },
                    buttons,
                    cancelButton: {
                        run: () => DeprecationChoice.Cancel
                    }
                });
                if (result !== DeprecationChoice.InstallAnyway) {
                    return;
                }
            }
            this.extensionsWorkbenchService.open(this.extension, { showPreReleaseVersion: this.options.installPreReleaseVersion });
            (0, aria_1.alert)((0, nls_1.localize)('installExtensionStart', "Installing extension {0} started. An editor is now open with more details on this extension", this.extension.displayName));
            /* __GDPR__
                "extensions:action:install" : {
                    "owner": "sandy081",
                    "actionId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            this.telemetryService.publicLog('extensions:action:install', { ...this.extension.telemetryData, actionId: this.id });
            const extension = await this.install(this.extension);
            if (extension?.local) {
                (0, aria_1.alert)((0, nls_1.localize)('installExtensionComplete', "Installing extension {0} is completed.", this.extension.displayName));
                const runningExtension = await this.getRunningExtension(extension.local);
                if (runningExtension && !(runningExtension.activationEvents && runningExtension.activationEvents.some(activationEent => activationEent.startsWith('onLanguage')))) {
                    const action = await this.getThemeAction(extension);
                    if (action) {
                        action.extension = extension;
                        try {
                            return action.run({ showCurrentTheme: true, ignoreFocusLost: true });
                        }
                        finally {
                            action.dispose();
                        }
                    }
                }
            }
        }
        async getThemeAction(extension) {
            const colorThemes = await this.workbenchThemeService.getColorThemes();
            if (colorThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.instantiationService.createInstance(SetColorThemeAction);
            }
            const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
            if (fileIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.instantiationService.createInstance(SetFileIconThemeAction);
            }
            const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
            if (productIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.instantiationService.createInstance(SetProductIconThemeAction);
            }
            return undefined;
        }
        async install(extension) {
            try {
                return await this.extensionsWorkbenchService.install(extension, this.options);
            }
            catch (error) {
                await this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* InstallOperation.Install */, error).run();
                return undefined;
            }
        }
        async getRunningExtension(extension) {
            const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
            if (runningExtension) {
                return runningExtension;
            }
            if (this.runtimeExtensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension))) {
                return new Promise((c, e) => {
                    const disposable = this.runtimeExtensionService.onDidChangeExtensions(async () => {
                        const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
                        if (runningExtension) {
                            disposable.dispose();
                            c(runningExtension);
                        }
                    });
                });
            }
            return null;
        }
        updateLabel() {
            this.label = this.getLabel();
        }
        getLabel(primary) {
            /* install pre-release version */
            if (this.options.installPreReleaseVersion && this.extension?.hasPreReleaseVersion) {
                return primary ? (0, nls_1.localize)('install pre-release', "Install Pre-Release") : (0, nls_1.localize)('install pre-release version', "Install Pre-Release Version");
            }
            /* install released version that has a pre release version */
            if (this.extension?.hasPreReleaseVersion) {
                return primary ? (0, nls_1.localize)('install', "Install") : (0, nls_1.localize)('install release version', "Install Release Version");
            }
            return (0, nls_1.localize)('install', "Install");
        }
    };
    exports.InstallAction = InstallAction;
    exports.InstallAction = InstallAction = InstallAction_1 = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, extensions_3.IExtensionService),
        __param(4, workbenchThemeService_1.IWorkbenchThemeService),
        __param(5, label_1.ILabelService),
        __param(6, dialogs_1.IDialogService),
        __param(7, preferences_1.IPreferencesService),
        __param(8, telemetry_1.ITelemetryService)
    ], InstallAction);
    let InstallDropdownAction = class InstallDropdownAction extends ActionWithDropDownAction {
        set manifest(manifest) {
            this.extensionActions.forEach(a => a.manifest = manifest);
            this.update();
        }
        constructor(instantiationService, extensionsWorkbenchService) {
            super(`extensions.installActions`, '', [
                [
                    instantiationService.createInstance(InstallAction, { installPreReleaseVersion: extensionsWorkbenchService.preferPreReleases }),
                    instantiationService.createInstance(InstallAction, { installPreReleaseVersion: !extensionsWorkbenchService.preferPreReleases }),
                ]
            ]);
        }
        getLabel(action) {
            return action.getLabel(true);
        }
    };
    exports.InstallDropdownAction = InstallDropdownAction;
    exports.InstallDropdownAction = InstallDropdownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], InstallDropdownAction);
    class InstallingLabelAction extends ExtensionAction {
        static { this.LABEL = (0, nls_1.localize)('installing', "Installing"); }
        static { this.CLASS = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`; }
        constructor() {
            super('extension.installing', InstallingLabelAction.LABEL, InstallingLabelAction.CLASS, false);
        }
        update() {
            this.class = `${InstallingLabelAction.CLASS}${this.extension && this.extension.state === 0 /* ExtensionState.Installing */ ? '' : ' hide'}`;
        }
    }
    exports.InstallingLabelAction = InstallingLabelAction;
    let InstallInOtherServerAction = class InstallInOtherServerAction extends ExtensionAction {
        static { InstallInOtherServerAction_1 = this; }
        static { this.INSTALL_LABEL = (0, nls_1.localize)('install', "Install"); }
        static { this.INSTALLING_LABEL = (0, nls_1.localize)('installing', "Installing"); }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`; }
        static { this.InstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`; }
        constructor(id, server, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(id, InstallInOtherServerAction_1.INSTALL_LABEL, InstallInOtherServerAction_1.Class, false);
            this.server = server;
            this.canInstallAnyWhere = canInstallAnyWhere;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.updateWhenCounterExtensionChanges = true;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = InstallInOtherServerAction_1.Class;
            if (this.canInstall()) {
                const extensionInOtherServer = this.extensionsWorkbenchService.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server === this.server)[0];
                if (extensionInOtherServer) {
                    // Getting installed in other server
                    if (extensionInOtherServer.state === 0 /* ExtensionState.Installing */ && !extensionInOtherServer.local) {
                        this.enabled = true;
                        this.label = InstallInOtherServerAction_1.INSTALLING_LABEL;
                        this.class = InstallInOtherServerAction_1.InstallingClass;
                    }
                }
                else {
                    // Not installed in other server
                    this.enabled = true;
                    this.label = this.getInstallLabel();
                }
            }
        }
        canInstall() {
            // Disable if extension is not installed or not an user extension
            if (!this.extension
                || !this.server
                || !this.extension.local
                || this.extension.state !== 1 /* ExtensionState.Installed */
                || this.extension.type !== 1 /* ExtensionType.User */
                || this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */ || this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ || this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                return false;
            }
            if ((0, extensions_2.isLanguagePackExtension)(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on UI
            if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Workspace
            if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Web
            if (this.server === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWeb(this.extension.local.manifest)) {
                return true;
            }
            if (this.canInstallAnyWhere) {
                // Can run on UI
                if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnUI(this.extension.local.manifest)) {
                    return true;
                }
                // Can run on Workspace
                if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWorkspace(this.extension.local.manifest)) {
                    return true;
                }
            }
            return false;
        }
        async run() {
            if (!this.extension?.local) {
                return;
            }
            if (!this.extension?.server) {
                return;
            }
            if (!this.server) {
                return;
            }
            this.extensionsWorkbenchService.open(this.extension);
            (0, aria_1.alert)((0, nls_1.localize)('installExtensionStart', "Installing extension {0} started. An editor is now open with more details on this extension", this.extension.displayName));
            return this.extensionsWorkbenchService.installInServer(this.extension, this.server);
        }
    };
    exports.InstallInOtherServerAction = InstallInOtherServerAction;
    exports.InstallInOtherServerAction = InstallInOtherServerAction = InstallInOtherServerAction_1 = __decorate([
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], InstallInOtherServerAction);
    let RemoteInstallAction = class RemoteInstallAction extends InstallInOtherServerAction {
        constructor(canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.remoteinstall`, extensionManagementServerService.remoteExtensionManagementServer, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return this.extensionManagementServerService.remoteExtensionManagementServer
                ? (0, nls_1.localize)({ key: 'install in remote', comment: ['This is the name of the action to install an extension in remote server. Placeholder is for the name of remote server.'] }, "Install in {0}", this.extensionManagementServerService.remoteExtensionManagementServer.label)
                : InstallInOtherServerAction.INSTALL_LABEL;
        }
    };
    exports.RemoteInstallAction = RemoteInstallAction;
    exports.RemoteInstallAction = RemoteInstallAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IExtensionManagementServerService),
        __param(3, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], RemoteInstallAction);
    let LocalInstallAction = class LocalInstallAction extends InstallInOtherServerAction {
        constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.localinstall`, extensionManagementServerService.localExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return (0, nls_1.localize)('install locally', "Install Locally");
        }
    };
    exports.LocalInstallAction = LocalInstallAction;
    exports.LocalInstallAction = LocalInstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], LocalInstallAction);
    let WebInstallAction = class WebInstallAction extends InstallInOtherServerAction {
        constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.webInstall`, extensionManagementServerService.webExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return (0, nls_1.localize)('install browser', "Install in Browser");
        }
    };
    exports.WebInstallAction = WebInstallAction;
    exports.WebInstallAction = WebInstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], WebInstallAction);
    let UninstallAction = class UninstallAction extends ExtensionAction {
        static { UninstallAction_1 = this; }
        static { this.UninstallLabel = (0, nls_1.localize)('uninstallAction', "Uninstall"); }
        static { this.UninstallingLabel = (0, nls_1.localize)('Uninstalling', "Uninstalling"); }
        static { this.UninstallClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall`; }
        static { this.UnInstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall uninstalling`; }
        constructor(extensionsWorkbenchService) {
            super('extensions.uninstall', UninstallAction_1.UninstallLabel, UninstallAction_1.UninstallClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            if (!this.extension) {
                this.enabled = false;
                return;
            }
            const state = this.extension.state;
            if (state === 2 /* ExtensionState.Uninstalling */) {
                this.label = UninstallAction_1.UninstallingLabel;
                this.class = UninstallAction_1.UnInstallingClass;
                this.enabled = false;
                return;
            }
            this.label = UninstallAction_1.UninstallLabel;
            this.class = UninstallAction_1.UninstallClass;
            this.tooltip = UninstallAction_1.UninstallLabel;
            if (state !== 1 /* ExtensionState.Installed */) {
                this.enabled = false;
                return;
            }
            if (this.extension.isBuiltin) {
                this.enabled = false;
                return;
            }
            this.enabled = true;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)('uninstallExtensionStart', "Uninstalling extension {0} started.", this.extension.displayName));
            return this.extensionsWorkbenchService.uninstall(this.extension).then(() => {
                (0, aria_1.alert)((0, nls_1.localize)('uninstallExtensionComplete', "Please reload Visual Studio Code to complete the uninstallation of the extension {0}.", this.extension.displayName));
            });
        }
    };
    exports.UninstallAction = UninstallAction;
    exports.UninstallAction = UninstallAction = UninstallAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], UninstallAction);
    class AbstractUpdateAction extends ExtensionAction {
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent update`; }
        static { this.DisabledClass = `${AbstractUpdateAction.EnabledClass} disabled`; }
        constructor(id, label, extensionsWorkbenchService) {
            super(id, label, AbstractUpdateAction.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.updateThrottler = new async_1.Throttler();
            this.update();
        }
        update() {
            this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
        }
        async computeAndUpdateEnablement() {
            this.enabled = false;
            this.class = UpdateAction.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (this.extension.deprecationInfo) {
                return;
            }
            const canInstall = await this.extensionsWorkbenchService.canInstall(this.extension);
            const isInstalled = this.extension.state === 1 /* ExtensionState.Installed */;
            this.enabled = canInstall && isInstalled && this.extension.outdated;
            this.class = this.enabled ? AbstractUpdateAction.EnabledClass : AbstractUpdateAction.DisabledClass;
        }
    }
    let UpdateAction = class UpdateAction extends AbstractUpdateAction {
        constructor(verbose, extensionsWorkbenchService, instantiationService) {
            super(`extensions.update`, (0, nls_1.localize)('update', "Update"), extensionsWorkbenchService);
            this.verbose = verbose;
            this.instantiationService = instantiationService;
        }
        update() {
            super.update();
            if (this.extension) {
                this.label = this.verbose ? (0, nls_1.localize)('update to', "Update to v{0}", this.extension.latestVersion) : (0, nls_1.localize)('update', "Update");
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)('updateExtensionStart', "Updating extension {0} to version {1} started.", this.extension.displayName, this.extension.latestVersion));
            return this.install(this.extension);
        }
        async install(extension) {
            try {
                await this.extensionsWorkbenchService.install(extension, extension.local?.preRelease ? { installPreReleaseVersion: true } : undefined);
                (0, aria_1.alert)((0, nls_1.localize)('updateExtensionComplete', "Updating extension {0} to version {1} completed.", extension.displayName, extension.latestVersion));
            }
            catch (err) {
                this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 3 /* InstallOperation.Update */, err).run();
            }
        }
    };
    exports.UpdateAction = UpdateAction;
    exports.UpdateAction = UpdateAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, instantiation_1.IInstantiationService)
    ], UpdateAction);
    let SkipUpdateAction = class SkipUpdateAction extends AbstractUpdateAction {
        constructor(extensionsWorkbenchService) {
            super(`extensions.ignoreUpdates`, (0, nls_1.localize)('ignoreUpdates', "Ignore Updates"), extensionsWorkbenchService);
        }
        update() {
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                this.enabled = false;
                return;
            }
            super.update();
            this._checked = this.extension.pinned;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)('ignoreExtensionUpdate', "Ignoring {0} updates", this.extension.displayName));
            const newIgnoresAutoUpdates = !this.extension.pinned;
            await this.extensionsWorkbenchService.pinExtension(this.extension, newIgnoresAutoUpdates);
        }
    };
    exports.SkipUpdateAction = SkipUpdateAction;
    exports.SkipUpdateAction = SkipUpdateAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], SkipUpdateAction);
    let MigrateDeprecatedExtensionAction = class MigrateDeprecatedExtensionAction extends ExtensionAction {
        static { MigrateDeprecatedExtensionAction_1 = this; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} migrate`; }
        static { this.DisabledClass = `${MigrateDeprecatedExtensionAction_1.EnabledClass} disabled`; }
        constructor(small, extensionsWorkbenchService) {
            super('extensionsAction.migrateDeprecatedExtension', (0, nls_1.localize)('migrateExtension', "Migrate"), MigrateDeprecatedExtensionAction_1.DisabledClass, false);
            this.small = small;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = MigrateDeprecatedExtensionAction_1.DisabledClass;
            if (!this.extension?.local) {
                return;
            }
            if (this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            if (!this.extension.deprecationInfo?.extension) {
                return;
            }
            const id = this.extension.deprecationInfo.extension.id;
            if (this.extensionsWorkbenchService.local.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }))) {
                return;
            }
            this.enabled = true;
            this.class = MigrateDeprecatedExtensionAction_1.EnabledClass;
            this.tooltip = (0, nls_1.localize)('migrate to', "Migrate to {0}", this.extension.deprecationInfo.extension.displayName);
            this.label = this.small ? (0, nls_1.localize)('migrate', "Migrate") : this.tooltip;
        }
        async run() {
            if (!this.extension?.deprecationInfo?.extension) {
                return;
            }
            const local = this.extension.local;
            await this.extensionsWorkbenchService.uninstall(this.extension);
            const [extension] = await this.extensionsWorkbenchService.getExtensions([{ id: this.extension.deprecationInfo.extension.id, preRelease: this.extension.deprecationInfo?.extension?.preRelease }], cancellation_1.CancellationToken.None);
            await this.extensionsWorkbenchService.install(extension, { isMachineScoped: local?.isMachineScoped });
        }
    };
    exports.MigrateDeprecatedExtensionAction = MigrateDeprecatedExtensionAction;
    exports.MigrateDeprecatedExtensionAction = MigrateDeprecatedExtensionAction = MigrateDeprecatedExtensionAction_1 = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], MigrateDeprecatedExtensionAction);
    class ExtensionActionWithDropdownActionViewItem extends dropdownActionViewItem_1.ActionWithDropdownActionViewItem {
        constructor(action, options, contextMenuProvider) {
            super(null, action, options, contextMenuProvider);
        }
        render(container) {
            super.render(container);
            this.updateClass();
        }
        updateClass() {
            super.updateClass();
            if (this.element && this.dropdownMenuActionViewItem && this.dropdownMenuActionViewItem.element) {
                this.element.classList.toggle('empty', this._action.menuActions.length === 0);
                this.dropdownMenuActionViewItem.element.classList.toggle('hide', this._action.menuActions.length === 0);
            }
        }
    }
    exports.ExtensionActionWithDropdownActionViewItem = ExtensionActionWithDropdownActionViewItem;
    let ExtensionDropDownAction = class ExtensionDropDownAction extends ExtensionAction {
        constructor(id, label, cssClass, enabled, instantiationService) {
            super(id, label, cssClass, enabled);
            this.instantiationService = instantiationService;
            this._actionViewItem = null;
        }
        createActionViewItem() {
            this._actionViewItem = this.instantiationService.createInstance(DropDownMenuActionViewItem, this);
            return this._actionViewItem;
        }
        run({ actionGroups, disposeActionsOnHide }) {
            this._actionViewItem?.showMenu(actionGroups, disposeActionsOnHide);
            return Promise.resolve();
        }
    };
    exports.ExtensionDropDownAction = ExtensionDropDownAction;
    exports.ExtensionDropDownAction = ExtensionDropDownAction = __decorate([
        __param(4, instantiation_1.IInstantiationService)
    ], ExtensionDropDownAction);
    let DropDownMenuActionViewItem = class DropDownMenuActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action, contextMenuService) {
            super(null, action, { icon: true, label: true });
            this.contextMenuService = contextMenuService;
        }
        showMenu(menuActionGroups, disposeActionsOnHide) {
            if (this.element) {
                const actions = this.getActions(menuActionGroups);
                const elementPosition = DOM.getDomNodePagePosition(this.element);
                const anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    getActions: () => actions,
                    actionRunner: this.actionRunner,
                    onHide: () => { if (disposeActionsOnHide) {
                        (0, lifecycle_1.disposeIfDisposable)(actions);
                    } }
                });
            }
        }
        getActions(menuActionGroups) {
            let actions = [];
            for (const menuActions of menuActionGroups) {
                actions = [...actions, ...menuActions, new actions_1.Separator()];
            }
            return actions.length ? actions.slice(0, actions.length - 1) : actions;
        }
    };
    exports.DropDownMenuActionViewItem = DropDownMenuActionViewItem;
    exports.DropDownMenuActionViewItem = DropDownMenuActionViewItem = __decorate([
        __param(1, contextView_1.IContextMenuService)
    ], DropDownMenuActionViewItem);
    async function getContextMenuActionsGroups(extension, contextKeyService, instantiationService) {
        return instantiationService.invokeFunction(async (accessor) => {
            const extensionsWorkbenchService = accessor.get(extensions_1.IExtensionsWorkbenchService);
            const menuService = accessor.get(actions_2.IMenuService);
            const extensionRecommendationsService = accessor.get(extensionRecommendations_1.IExtensionRecommendationsService);
            const extensionIgnoredRecommendationsService = accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService);
            const workbenchThemeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const cksOverlay = [];
            if (extension) {
                cksOverlay.push(['extension', extension.identifier.id]);
                cksOverlay.push(['isBuiltinExtension', extension.isBuiltin]);
                cksOverlay.push(['isDefaultApplicationScopedExtension', extension.local && (0, extensions_2.isApplicationScopedExtension)(extension.local.manifest)]);
                cksOverlay.push(['isApplicationScopedExtension', extension.local && extension.local.isApplicationScoped]);
                cksOverlay.push(['extensionHasConfiguration', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.configuration]);
                cksOverlay.push(['extensionHasKeybindings', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.keybindings]);
                cksOverlay.push(['extensionHasCommands', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes?.commands]);
                cksOverlay.push(['isExtensionRecommended', !!extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]]);
                cksOverlay.push(['isExtensionWorkspaceRecommended', extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]?.reasonId === 0 /* ExtensionRecommendationReason.Workspace */]);
                cksOverlay.push(['isUserIgnoredRecommendation', extensionIgnoredRecommendationsService.globalIgnoredRecommendations.some(e => e === extension.identifier.id.toLowerCase())]);
                if (extension.state === 1 /* ExtensionState.Installed */) {
                    cksOverlay.push(['extensionStatus', 'installed']);
                }
                cksOverlay.push(['installedExtensionIsPreReleaseVersion', !!extension.local?.isPreReleaseVersion]);
                cksOverlay.push(['installedExtensionIsOptedTpPreRelease', !!extension.local?.preRelease]);
                cksOverlay.push(['galleryExtensionIsPreReleaseVersion', !!extension.gallery?.properties.isPreReleaseVersion]);
                cksOverlay.push(['extensionHasPreReleaseVersion', extension.hasPreReleaseVersion]);
                cksOverlay.push(['extensionHasReleaseVersion', extension.hasReleaseVersion]);
                const [colorThemes, fileIconThemes, productIconThemes] = await Promise.all([workbenchThemeService.getColorThemes(), workbenchThemeService.getFileIconThemes(), workbenchThemeService.getProductIconThemes()]);
                cksOverlay.push(['extensionHasColorThemes', colorThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['extensionHasFileIconThemes', fileIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['extensionHasProductIconThemes', productIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['canSetLanguage', extensionsWorkbenchService.canSetLanguage(extension)]);
                cksOverlay.push(['isActiveLanguagePackExtension', extension.gallery && platform_1.language === (0, languagePacks_1.getLocale)(extension.gallery)]);
            }
            const menu = menuService.createMenu(actions_2.MenuId.ExtensionContext, contextKeyService.createOverlay(cksOverlay));
            const actionsGroups = menu.getActions({ shouldForwardArgs: true });
            menu.dispose();
            return actionsGroups;
        });
    }
    function toActions(actionsGroups, instantiationService) {
        const result = [];
        for (const [, actions] of actionsGroups) {
            result.push(actions.map(action => {
                if (action instanceof actions_1.SubmenuAction) {
                    return action;
                }
                return instantiationService.createInstance(MenuItemExtensionAction, action);
            }));
        }
        return result;
    }
    async function getContextMenuActions(extension, contextKeyService, instantiationService) {
        const actionsGroups = await getContextMenuActionsGroups(extension, contextKeyService, instantiationService);
        return toActions(actionsGroups, instantiationService);
    }
    exports.getContextMenuActions = getContextMenuActions;
    let ManageExtensionAction = class ManageExtensionAction extends ExtensionDropDownAction {
        static { ManageExtensionAction_1 = this; }
        static { this.ID = 'extensions.manage'; }
        static { this.Class = `${ExtensionAction.ICON_ACTION_CLASS} manage ` + themables_1.ThemeIcon.asClassName(extensionsIcons_1.manageExtensionIcon); }
        static { this.HideManageExtensionClass = `${ManageExtensionAction_1.Class} hide`; }
        constructor(instantiationService, extensionService, contextKeyService) {
            super(ManageExtensionAction_1.ID, '', '', true, instantiationService);
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.tooltip = (0, nls_1.localize)('manage', "Manage");
            this.update();
        }
        async getActionGroups() {
            const groups = [];
            const contextMenuActionsGroups = await getContextMenuActionsGroups(this.extension, this.contextKeyService, this.instantiationService);
            const themeActions = [], installActions = [], otherActionGroups = [];
            for (const [group, actions] of contextMenuActionsGroups) {
                if (group === extensions_1.INSTALL_ACTIONS_GROUP) {
                    installActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
                }
                else if (group === extensions_1.THEME_ACTIONS_GROUP) {
                    themeActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
                }
                else {
                    otherActionGroups.push(...toActions([[group, actions]], this.instantiationService));
                }
            }
            if (themeActions.length) {
                groups.push(themeActions);
            }
            groups.push([
                this.instantiationService.createInstance(EnableGloballyAction),
                this.instantiationService.createInstance(EnableForWorkspaceAction)
            ]);
            groups.push([
                this.instantiationService.createInstance(DisableGloballyAction),
                this.instantiationService.createInstance(DisableForWorkspaceAction)
            ]);
            groups.push([
                ...(installActions.length ? installActions : []),
                this.instantiationService.createInstance(InstallAnotherVersionAction),
                this.instantiationService.createInstance(UninstallAction),
            ]);
            otherActionGroups.forEach(actions => groups.push(actions));
            groups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof ExtensionAction) {
                    extensionAction.extension = this.extension;
                }
            }));
            return groups;
        }
        async run() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            return super.run({ actionGroups: await this.getActionGroups(), disposeActionsOnHide: true });
        }
        update() {
            this.class = ManageExtensionAction_1.HideManageExtensionClass;
            this.enabled = false;
            if (this.extension) {
                const state = this.extension.state;
                this.enabled = state === 1 /* ExtensionState.Installed */;
                this.class = this.enabled || state === 2 /* ExtensionState.Uninstalling */ ? ManageExtensionAction_1.Class : ManageExtensionAction_1.HideManageExtensionClass;
            }
        }
    };
    exports.ManageExtensionAction = ManageExtensionAction;
    exports.ManageExtensionAction = ManageExtensionAction = ManageExtensionAction_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, extensions_3.IExtensionService),
        __param(2, contextkey_1.IContextKeyService)
    ], ManageExtensionAction);
    class ExtensionEditorManageExtensionAction extends ExtensionDropDownAction {
        constructor(contextKeyService, instantiationService) {
            super('extensionEditor.manageExtension', '', `${ExtensionAction.ICON_ACTION_CLASS} manage ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.manageExtensionIcon)}`, true, instantiationService);
            this.contextKeyService = contextKeyService;
            this.tooltip = (0, nls_1.localize)('manage', "Manage");
        }
        update() { }
        async run() {
            const actionGroups = [];
            (await getContextMenuActions(this.extension, this.contextKeyService, this.instantiationService)).forEach(actions => actionGroups.push(actions));
            actionGroups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof ExtensionAction) {
                    extensionAction.extension = this.extension;
                }
            }));
            return super.run({ actionGroups, disposeActionsOnHide: true });
        }
    }
    exports.ExtensionEditorManageExtensionAction = ExtensionEditorManageExtensionAction;
    let MenuItemExtensionAction = class MenuItemExtensionAction extends ExtensionAction {
        constructor(action, extensionsWorkbenchService) {
            super(action.id, action.label);
            this.action = action;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
        }
        update() {
            if (!this.extension) {
                return;
            }
            if (this.action.id === extensions_1.TOGGLE_IGNORE_EXTENSION_ACTION_ID) {
                this.checked = !this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
            }
            else {
                this.checked = this.action.checked;
            }
        }
        async run() {
            if (this.extension) {
                await this.action.run(this.extension.local ? (0, extensionManagementUtil_1.getExtensionId)(this.extension.local.manifest.publisher, this.extension.local.manifest.name)
                    : this.extension.gallery ? (0, extensionManagementUtil_1.getExtensionId)(this.extension.gallery.publisher, this.extension.gallery.name)
                        : this.extension.identifier.id);
            }
        }
    };
    exports.MenuItemExtensionAction = MenuItemExtensionAction;
    exports.MenuItemExtensionAction = MenuItemExtensionAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], MenuItemExtensionAction);
    let SwitchToPreReleaseVersionAction = class SwitchToPreReleaseVersionAction extends ExtensionAction {
        static { SwitchToPreReleaseVersionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.switchToPreReleaseVersion'; }
        static { this.TITLE = { value: (0, nls_1.localize)('switch to pre-release version', "Switch to Pre-Release Version"), original: 'Switch to  Pre-Release Version' }; }
        constructor(icon, commandService) {
            super(SwitchToPreReleaseVersionAction_1.ID, icon ? '' : SwitchToPreReleaseVersionAction_1.TITLE.value, `${icon ? ExtensionAction.ICON_ACTION_CLASS + ' ' + themables_1.ThemeIcon.asClassName(extensionsIcons_1.preReleaseIcon) : ExtensionAction.LABEL_ACTION_CLASS} hide-when-disabled switch-to-prerelease`, true);
            this.commandService = commandService;
            this.tooltip = (0, nls_1.localize)('switch to pre-release version tooltip', "Switch to Pre-Release version of this extension");
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && !this.extension.local?.isPreReleaseVersion && !this.extension.local?.preRelease && this.extension.hasPreReleaseVersion && this.extension.state === 1 /* ExtensionState.Installed */;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            return this.commandService.executeCommand(SwitchToPreReleaseVersionAction_1.ID, this.extension?.identifier.id);
        }
    };
    exports.SwitchToPreReleaseVersionAction = SwitchToPreReleaseVersionAction;
    exports.SwitchToPreReleaseVersionAction = SwitchToPreReleaseVersionAction = SwitchToPreReleaseVersionAction_1 = __decorate([
        __param(1, commands_1.ICommandService)
    ], SwitchToPreReleaseVersionAction);
    let SwitchToReleasedVersionAction = class SwitchToReleasedVersionAction extends ExtensionAction {
        static { SwitchToReleasedVersionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.switchToReleaseVersion'; }
        static { this.TITLE = { value: (0, nls_1.localize)('switch to release version', "Switch to Release Version"), original: 'Switch to Release Version' }; }
        constructor(icon, commandService) {
            super(SwitchToReleasedVersionAction_1.ID, icon ? '' : SwitchToReleasedVersionAction_1.TITLE.value, `${icon ? ExtensionAction.ICON_ACTION_CLASS + ' ' + themables_1.ThemeIcon.asClassName(extensionsIcons_1.preReleaseIcon) : ExtensionAction.LABEL_ACTION_CLASS} hide-when-disabled switch-to-released`);
            this.commandService = commandService;
            this.tooltip = (0, nls_1.localize)('switch to release version tooltip', "Switch to Release version of this extension");
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && this.extension.state === 1 /* ExtensionState.Installed */ && !!this.extension.local?.isPreReleaseVersion && !!this.extension.hasReleaseVersion;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            return this.commandService.executeCommand(SwitchToReleasedVersionAction_1.ID, this.extension?.identifier.id);
        }
    };
    exports.SwitchToReleasedVersionAction = SwitchToReleasedVersionAction;
    exports.SwitchToReleasedVersionAction = SwitchToReleasedVersionAction = SwitchToReleasedVersionAction_1 = __decorate([
        __param(1, commands_1.ICommandService)
    ], SwitchToReleasedVersionAction);
    let InstallAnotherVersionAction = class InstallAnotherVersionAction extends ExtensionAction {
        static { InstallAnotherVersionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.install.anotherVersion'; }
        static { this.LABEL = (0, nls_1.localize)('install another version', "Install Another Version..."); }
        constructor(extensionsWorkbenchService, extensionGalleryService, quickInputService, instantiationService, dialogService) {
            super(InstallAnotherVersionAction_1.ID, InstallAnotherVersionAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionGalleryService = extensionGalleryService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.dialogService = dialogService;
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && !!this.extension.gallery && !!this.extension.local && !!this.extension.server && this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.deprecationInfo;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            const targetPlatform = await this.extension.server.extensionManagementService.getTargetPlatform();
            const allVersions = await this.extensionGalleryService.getAllCompatibleVersions(this.extension.gallery, this.extension.local.preRelease, targetPlatform);
            if (!allVersions.length) {
                await this.dialogService.info((0, nls_1.localize)('no versions', "This extension has no other versions."));
                return;
            }
            const picks = allVersions.map((v, i) => {
                return {
                    id: v.version,
                    label: v.version,
                    description: `${(0, date_1.fromNow)(new Date(Date.parse(v.date)), true)}${v.isPreReleaseVersion ? ` (${(0, nls_1.localize)('pre-release', "pre-release")})` : ''}${v.version === this.extension.version ? ` (${(0, nls_1.localize)('current', "current")})` : ''}`,
                    latest: i === 0,
                    ariaLabel: `${v.isPreReleaseVersion ? 'Pre-Release version' : 'Release version'} ${v.version}`,
                    isPreReleaseVersion: v.isPreReleaseVersion
                };
            });
            const pick = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('selectVersion', "Select Version to Install"),
                matchOnDetail: true
            });
            if (pick) {
                if (this.extension.version === pick.id) {
                    return;
                }
                try {
                    if (pick.latest) {
                        await this.extensionsWorkbenchService.install(this.extension, { installPreReleaseVersion: pick.isPreReleaseVersion });
                    }
                    else {
                        await this.extensionsWorkbenchService.installVersion(this.extension, pick.id, { installPreReleaseVersion: pick.isPreReleaseVersion });
                    }
                }
                catch (error) {
                    this.instantiationService.createInstance(PromptExtensionInstallFailureAction, this.extension, pick.latest ? this.extension.latestVersion : pick.id, 2 /* InstallOperation.Install */, error).run();
                }
            }
            return null;
        }
    };
    exports.InstallAnotherVersionAction = InstallAnotherVersionAction;
    exports.InstallAnotherVersionAction = InstallAnotherVersionAction = InstallAnotherVersionAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, dialogs_1.IDialogService)
    ], InstallAnotherVersionAction);
    let EnableForWorkspaceAction = class EnableForWorkspaceAction extends ExtensionAction {
        static { EnableForWorkspaceAction_1 = this; }
        static { this.ID = 'extensions.enableForWorkspace'; }
        static { this.LABEL = (0, nls_1.localize)('enableForWorkspaceAction', "Enable (Workspace)"); }
        constructor(extensionsWorkbenchService, extensionEnablementService) {
            super(EnableForWorkspaceAction_1.ID, EnableForWorkspaceAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)('enableForWorkspaceActionToolTip', "Enable this extension only in this workspace");
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && !this.extensionEnablementService.isEnabled(this.extension.local)
                    && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 9 /* EnablementState.EnabledWorkspace */);
        }
    };
    exports.EnableForWorkspaceAction = EnableForWorkspaceAction;
    exports.EnableForWorkspaceAction = EnableForWorkspaceAction = EnableForWorkspaceAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], EnableForWorkspaceAction);
    let EnableGloballyAction = class EnableGloballyAction extends ExtensionAction {
        static { EnableGloballyAction_1 = this; }
        static { this.ID = 'extensions.enableGlobally'; }
        static { this.LABEL = (0, nls_1.localize)('enableGloballyAction', "Enable"); }
        constructor(extensionsWorkbenchService, extensionEnablementService) {
            super(EnableGloballyAction_1.ID, EnableGloballyAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)('enableGloballyActionToolTip', "Enable this extension");
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && this.extensionEnablementService.isDisabledGlobally(this.extension.local)
                    && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 8 /* EnablementState.EnabledGlobally */);
        }
    };
    exports.EnableGloballyAction = EnableGloballyAction;
    exports.EnableGloballyAction = EnableGloballyAction = EnableGloballyAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], EnableGloballyAction);
    let DisableForWorkspaceAction = class DisableForWorkspaceAction extends ExtensionAction {
        static { DisableForWorkspaceAction_1 = this; }
        static { this.ID = 'extensions.disableForWorkspace'; }
        static { this.LABEL = (0, nls_1.localize)('disableForWorkspaceAction', "Disable (Workspace)"); }
        constructor(workspaceContextService, extensionsWorkbenchService, extensionEnablementService, extensionService) {
            super(DisableForWorkspaceAction_1.ID, DisableForWorkspaceAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.workspaceContextService = workspaceContextService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionService = extensionService;
            this.tooltip = (0, nls_1.localize)('disableForWorkspaceActionToolTip', "Disable this extension only in this workspace");
            this.update();
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this.extensionService.extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 7 /* EnablementState.DisabledWorkspace */);
        }
    };
    exports.DisableForWorkspaceAction = DisableForWorkspaceAction;
    exports.DisableForWorkspaceAction = DisableForWorkspaceAction = DisableForWorkspaceAction_1 = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(3, extensions_3.IExtensionService)
    ], DisableForWorkspaceAction);
    let DisableGloballyAction = class DisableGloballyAction extends ExtensionAction {
        static { DisableGloballyAction_1 = this; }
        static { this.ID = 'extensions.disableGlobally'; }
        static { this.LABEL = (0, nls_1.localize)('disableGloballyAction', "Disable"); }
        constructor(extensionsWorkbenchService, extensionEnablementService, extensionService) {
            super(DisableGloballyAction_1.ID, DisableGloballyAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionService = extensionService;
            this.tooltip = (0, nls_1.localize)('disableGloballyActionToolTip', "Disable this extension");
            this.update();
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this.extensionService.extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 6 /* EnablementState.DisabledGlobally */);
        }
    };
    exports.DisableGloballyAction = DisableGloballyAction;
    exports.DisableGloballyAction = DisableGloballyAction = DisableGloballyAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(2, extensions_3.IExtensionService)
    ], DisableGloballyAction);
    let EnableDropDownAction = class EnableDropDownAction extends ActionWithDropDownAction {
        constructor(instantiationService) {
            super('extensions.enable', (0, nls_1.localize)('enableAction', "Enable"), [
                [
                    instantiationService.createInstance(EnableGloballyAction),
                    instantiationService.createInstance(EnableForWorkspaceAction)
                ]
            ]);
        }
    };
    exports.EnableDropDownAction = EnableDropDownAction;
    exports.EnableDropDownAction = EnableDropDownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], EnableDropDownAction);
    let DisableDropDownAction = class DisableDropDownAction extends ActionWithDropDownAction {
        constructor(instantiationService) {
            super('extensions.disable', (0, nls_1.localize)('disableAction', "Disable"), [[
                    instantiationService.createInstance(DisableGloballyAction),
                    instantiationService.createInstance(DisableForWorkspaceAction)
                ]]);
        }
    };
    exports.DisableDropDownAction = DisableDropDownAction;
    exports.DisableDropDownAction = DisableDropDownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], DisableDropDownAction);
    let ReloadAction = class ReloadAction extends ExtensionAction {
        static { ReloadAction_1 = this; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} reload`; }
        static { this.DisabledClass = `${ReloadAction_1.EnabledClass} disabled`; }
        constructor(hostService, extensionService) {
            super('extensions.reload', (0, nls_1.localize)('reloadAction', "Reload"), ReloadAction_1.DisabledClass, false);
            this.hostService = hostService;
            this.extensionService = extensionService;
            this.updateWhenCounterExtensionChanges = true;
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = false;
            this.tooltip = '';
            if (!this.extension) {
                return;
            }
            const state = this.extension.state;
            if (state === 0 /* ExtensionState.Installing */ || state === 2 /* ExtensionState.Uninstalling */) {
                return;
            }
            if (this.extension.local && this.extension.local.manifest && this.extension.local.manifest.contributes && this.extension.local.manifest.contributes.localizations && this.extension.local.manifest.contributes.localizations.length > 0) {
                return;
            }
            const reloadTooltip = this.extension.reloadRequiredStatus;
            this.enabled = reloadTooltip !== undefined;
            this.label = reloadTooltip !== undefined ? (0, nls_1.localize)('reload required', 'Reload Required') : '';
            this.tooltip = reloadTooltip !== undefined ? reloadTooltip : '';
            this.class = this.enabled ? ReloadAction_1.EnabledClass : ReloadAction_1.DisabledClass;
        }
        run() {
            return Promise.resolve(this.hostService.reload());
        }
    };
    exports.ReloadAction = ReloadAction;
    exports.ReloadAction = ReloadAction = ReloadAction_1 = __decorate([
        __param(0, host_1.IHostService),
        __param(1, extensions_3.IExtensionService)
    ], ReloadAction);
    function isThemeFromExtension(theme, extension) {
        return !!(extension && theme.extensionData && extensions_2.ExtensionIdentifier.equals(theme.extensionData.extensionId, extension.identifier.id));
    }
    function getQuickPickEntries(themes, currentTheme, extension, showCurrentTheme) {
        const picks = [];
        for (const theme of themes) {
            if (isThemeFromExtension(theme, extension) && !(showCurrentTheme && theme === currentTheme)) {
                picks.push({ label: theme.label, id: theme.id });
            }
        }
        if (showCurrentTheme) {
            picks.push({ type: 'separator', label: (0, nls_1.localize)('current', "current") });
            picks.push({ label: currentTheme.label, id: currentTheme.id });
        }
        return picks;
    }
    let SetColorThemeAction = class SetColorThemeAction extends ExtensionAction {
        static { SetColorThemeAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setColorTheme'; }
        static { this.TITLE = { value: (0, nls_1.localize)('workbench.extensions.action.setColorTheme', "Set Color Theme"), original: 'Set Color Theme' }; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`; }
        static { this.DisabledClass = `${SetColorThemeAction_1.EnabledClass} disabled`; }
        constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
            super(SetColorThemeAction_1.ID, SetColorThemeAction_1.TITLE.value, SetColorThemeAction_1.DisabledClass, false);
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidColorThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.workbenchThemeService.getColorThemes().then(colorThemes => {
                this.enabled = this.computeEnablement(colorThemes);
                this.class = this.enabled ? SetColorThemeAction_1.EnabledClass : SetColorThemeAction_1.DisabledClass;
            });
        }
        computeEnablement(colorThemes) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemes.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const colorThemes = await this.workbenchThemeService.getColorThemes();
            if (!this.computeEnablement(colorThemes)) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getColorTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(colorThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('select color theme', "Select Color Theme"),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setColorTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setColorTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.SetColorThemeAction = SetColorThemeAction;
    exports.SetColorThemeAction = SetColorThemeAction = SetColorThemeAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], SetColorThemeAction);
    let SetFileIconThemeAction = class SetFileIconThemeAction extends ExtensionAction {
        static { SetFileIconThemeAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setFileIconTheme'; }
        static { this.TITLE = { value: (0, nls_1.localize)('workbench.extensions.action.setFileIconTheme', "Set File Icon Theme"), original: 'Set File Icon Theme' }; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`; }
        static { this.DisabledClass = `${SetFileIconThemeAction_1.EnabledClass} disabled`; }
        constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
            super(SetFileIconThemeAction_1.ID, SetFileIconThemeAction_1.TITLE.value, SetFileIconThemeAction_1.DisabledClass, false);
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidFileIconThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.workbenchThemeService.getFileIconThemes().then(fileIconThemes => {
                this.enabled = this.computeEnablement(fileIconThemes);
                this.class = this.enabled ? SetFileIconThemeAction_1.EnabledClass : SetFileIconThemeAction_1.DisabledClass;
            });
        }
        computeEnablement(colorThemfileIconThemess) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemfileIconThemess.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
            if (!this.computeEnablement(fileIconThemes)) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getFileIconTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(fileIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('select file icon theme', "Select File Icon Theme"),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setFileIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setFileIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.SetFileIconThemeAction = SetFileIconThemeAction;
    exports.SetFileIconThemeAction = SetFileIconThemeAction = SetFileIconThemeAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], SetFileIconThemeAction);
    let SetProductIconThemeAction = class SetProductIconThemeAction extends ExtensionAction {
        static { SetProductIconThemeAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setProductIconTheme'; }
        static { this.TITLE = { value: (0, nls_1.localize)('workbench.extensions.action.setProductIconTheme', "Set Product Icon Theme"), original: 'Set Product Icon Theme' }; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`; }
        static { this.DisabledClass = `${SetProductIconThemeAction_1.EnabledClass} disabled`; }
        constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
            super(SetProductIconThemeAction_1.ID, SetProductIconThemeAction_1.TITLE.value, SetProductIconThemeAction_1.DisabledClass, false);
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidProductIconThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.workbenchThemeService.getProductIconThemes().then(productIconThemes => {
                this.enabled = this.computeEnablement(productIconThemes);
                this.class = this.enabled ? SetProductIconThemeAction_1.EnabledClass : SetProductIconThemeAction_1.DisabledClass;
            });
        }
        computeEnablement(productIconThemes) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && productIconThemes.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
            if (!this.computeEnablement(productIconThemes)) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getProductIconTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(productIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('select product icon theme', "Select Product Icon Theme"),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setProductIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setProductIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.SetProductIconThemeAction = SetProductIconThemeAction;
    exports.SetProductIconThemeAction = SetProductIconThemeAction = SetProductIconThemeAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], SetProductIconThemeAction);
    let SetLanguageAction = class SetLanguageAction extends ExtensionAction {
        static { SetLanguageAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setDisplayLanguage'; }
        static { this.TITLE = { value: (0, nls_1.localize)('workbench.extensions.action.setDisplayLanguage', "Set Display Language"), original: 'Set Display Language' }; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`; }
        static { this.DisabledClass = `${SetLanguageAction_1.EnabledClass} disabled`; }
        constructor(extensionsWorkbenchService) {
            super(SetLanguageAction_1.ID, SetLanguageAction_1.TITLE.value, SetLanguageAction_1.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = SetLanguageAction_1.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && platform_1.language === (0, languagePacks_1.getLocale)(this.extension.gallery)) {
                return;
            }
            this.enabled = true;
            this.class = SetLanguageAction_1.EnabledClass;
        }
        async run() {
            return this.extension && this.extensionsWorkbenchService.setLanguage(this.extension);
        }
    };
    exports.SetLanguageAction = SetLanguageAction;
    exports.SetLanguageAction = SetLanguageAction = SetLanguageAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], SetLanguageAction);
    let ClearLanguageAction = class ClearLanguageAction extends ExtensionAction {
        static { ClearLanguageAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.clearLanguage'; }
        static { this.TITLE = { value: (0, nls_1.localize)('workbench.extensions.action.clearLanguage', "Clear Display Language"), original: 'Clear Display Language' }; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`; }
        static { this.DisabledClass = `${ClearLanguageAction_1.EnabledClass} disabled`; }
        constructor(extensionsWorkbenchService, localeService) {
            super(ClearLanguageAction_1.ID, ClearLanguageAction_1.TITLE.value, ClearLanguageAction_1.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.localeService = localeService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = ClearLanguageAction_1.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && platform_1.language !== (0, languagePacks_1.getLocale)(this.extension.gallery)) {
                return;
            }
            this.enabled = true;
            this.class = ClearLanguageAction_1.EnabledClass;
        }
        async run() {
            return this.extension && this.localeService.clearLocalePreference();
        }
    };
    exports.ClearLanguageAction = ClearLanguageAction;
    exports.ClearLanguageAction = ClearLanguageAction = ClearLanguageAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, locale_1.ILocaleService)
    ], ClearLanguageAction);
    let ShowRecommendedExtensionAction = class ShowRecommendedExtensionAction extends actions_1.Action {
        static { ShowRecommendedExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.showRecommendedExtension'; }
        static { this.LABEL = (0, nls_1.localize)('showRecommendedExtension', "Show Recommended Extension"); }
        constructor(extensionId, paneCompositeService, extensionWorkbenchService) {
            super(ShowRecommendedExtensionAction_1.ID, ShowRecommendedExtensionAction_1.LABEL, undefined, false);
            this.paneCompositeService = paneCompositeService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionId = extensionId;
        }
        async run() {
            const paneComposite = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const paneContainer = paneComposite?.getViewPaneContainer();
            paneContainer.search(`@id:${this.extensionId}`);
            paneContainer.focus();
            const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: 'install-recommendation' }, cancellation_1.CancellationToken.None);
            if (extension) {
                return this.extensionWorkbenchService.open(extension);
            }
            return null;
        }
    };
    exports.ShowRecommendedExtensionAction = ShowRecommendedExtensionAction;
    exports.ShowRecommendedExtensionAction = ShowRecommendedExtensionAction = ShowRecommendedExtensionAction_1 = __decorate([
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, extensions_1.IExtensionsWorkbenchService)
    ], ShowRecommendedExtensionAction);
    let InstallRecommendedExtensionAction = class InstallRecommendedExtensionAction extends actions_1.Action {
        static { InstallRecommendedExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.installRecommendedExtension'; }
        static { this.LABEL = (0, nls_1.localize)('installRecommendedExtension', "Install Recommended Extension"); }
        constructor(extensionId, paneCompositeService, instantiationService, extensionWorkbenchService) {
            super(InstallRecommendedExtensionAction_1.ID, InstallRecommendedExtensionAction_1.LABEL, undefined, false);
            this.paneCompositeService = paneCompositeService;
            this.instantiationService = instantiationService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionId = extensionId;
        }
        async run() {
            const viewlet = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const viewPaneContainer = viewlet?.getViewPaneContainer();
            viewPaneContainer.search(`@id:${this.extensionId}`);
            viewPaneContainer.focus();
            const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: 'install-recommendation' }, cancellation_1.CancellationToken.None);
            if (extension) {
                await this.extensionWorkbenchService.open(extension);
                try {
                    await this.extensionWorkbenchService.install(extension);
                }
                catch (err) {
                    this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* InstallOperation.Install */, err).run();
                }
            }
        }
    };
    exports.InstallRecommendedExtensionAction = InstallRecommendedExtensionAction;
    exports.InstallRecommendedExtensionAction = InstallRecommendedExtensionAction = InstallRecommendedExtensionAction_1 = __decorate([
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, extensions_1.IExtensionsWorkbenchService)
    ], InstallRecommendedExtensionAction);
    let IgnoreExtensionRecommendationAction = class IgnoreExtensionRecommendationAction extends actions_1.Action {
        static { IgnoreExtensionRecommendationAction_1 = this; }
        static { this.ID = 'extensions.ignore'; }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} ignore`; }
        constructor(extension, extensionRecommendationsManagementService) {
            super(IgnoreExtensionRecommendationAction_1.ID, 'Ignore Recommendation');
            this.extension = extension;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.class = IgnoreExtensionRecommendationAction_1.Class;
            this.tooltip = (0, nls_1.localize)('ignoreExtensionRecommendation', "Do not recommend this extension again");
            this.enabled = true;
        }
        run() {
            this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, true);
            return Promise.resolve();
        }
    };
    exports.IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction;
    exports.IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction_1 = __decorate([
        __param(1, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], IgnoreExtensionRecommendationAction);
    let UndoIgnoreExtensionRecommendationAction = class UndoIgnoreExtensionRecommendationAction extends actions_1.Action {
        static { UndoIgnoreExtensionRecommendationAction_1 = this; }
        static { this.ID = 'extensions.ignore'; }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} undo-ignore`; }
        constructor(extension, extensionRecommendationsManagementService) {
            super(UndoIgnoreExtensionRecommendationAction_1.ID, 'Undo');
            this.extension = extension;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.class = UndoIgnoreExtensionRecommendationAction_1.Class;
            this.tooltip = (0, nls_1.localize)('undo', "Undo");
            this.enabled = true;
        }
        run() {
            this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, false);
            return Promise.resolve();
        }
    };
    exports.UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction;
    exports.UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction_1 = __decorate([
        __param(1, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], UndoIgnoreExtensionRecommendationAction);
    let SearchExtensionsAction = class SearchExtensionsAction extends actions_1.Action {
        constructor(searchValue, paneCompositeService) {
            super('extensions.searchExtensions', (0, nls_1.localize)('search recommendations', "Search Extensions"), undefined, true);
            this.searchValue = searchValue;
            this.paneCompositeService = paneCompositeService;
        }
        async run() {
            const viewPaneContainer = (await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            viewPaneContainer.search(this.searchValue);
            viewPaneContainer.focus();
        }
    };
    exports.SearchExtensionsAction = SearchExtensionsAction;
    exports.SearchExtensionsAction = SearchExtensionsAction = __decorate([
        __param(1, panecomposite_1.IPaneCompositePartService)
    ], SearchExtensionsAction);
    let AbstractConfigureRecommendedExtensionsAction = class AbstractConfigureRecommendedExtensionsAction extends actions_1.Action {
        constructor(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label);
            this.contextService = contextService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.jsonEditingService = jsonEditingService;
            this.textModelResolverService = textModelResolverService;
        }
        openExtensionsFile(extensionsFileResource) {
            return this.getOrCreateExtensionsFile(extensionsFileResource)
                .then(({ created, content }) => this.getSelectionPosition(content, extensionsFileResource, ['recommendations'])
                .then(selection => this.editorService.openEditor({
                resource: extensionsFileResource,
                options: {
                    pinned: created,
                    selection
                }
            })), error => Promise.reject(new Error((0, nls_1.localize)('OpenExtensionsFile.failed', "Unable to create 'extensions.json' file inside the '.vscode' folder ({0}).", error))));
        }
        openWorkspaceConfigurationFile(workspaceConfigurationFile) {
            return this.getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile)
                .then(content => this.getSelectionPosition(content.value.toString(), content.resource, ['extensions', 'recommendations']))
                .then(selection => this.editorService.openEditor({
                resource: workspaceConfigurationFile,
                options: {
                    selection,
                    forceReload: true // because content has changed
                }
            }));
        }
        getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile) {
            return Promise.resolve(this.fileService.readFile(workspaceConfigurationFile))
                .then(content => {
                const workspaceRecommendations = json.parse(content.value.toString())['extensions'];
                if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
                    return this.jsonEditingService.write(workspaceConfigurationFile, [{ path: ['extensions'], value: { recommendations: [] } }], true)
                        .then(() => this.fileService.readFile(workspaceConfigurationFile));
                }
                return content;
            });
        }
        getSelectionPosition(content, resource, path) {
            const tree = json.parseTree(content);
            const node = json.findNodeAtLocation(tree, path);
            if (node && node.parent && node.parent.children) {
                const recommendationsValueNode = node.parent.children[1];
                const lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
                const offset = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
                return Promise.resolve(this.textModelResolverService.createModelReference(resource))
                    .then(reference => {
                    const position = reference.object.textEditorModel.getPositionAt(offset);
                    reference.dispose();
                    return {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    };
                });
            }
            return Promise.resolve(undefined);
        }
        getOrCreateExtensionsFile(extensionsFileResource) {
            return Promise.resolve(this.fileService.readFile(extensionsFileResource)).then(content => {
                return { created: false, extensionsFileResource, content: content.value.toString() };
            }, err => {
                return this.textFileService.write(extensionsFileResource, extensionsFileTemplate_1.ExtensionsConfigurationInitialContent).then(() => {
                    return { created: true, extensionsFileResource, content: extensionsFileTemplate_1.ExtensionsConfigurationInitialContent };
                });
            });
        }
    };
    exports.AbstractConfigureRecommendedExtensionsAction = AbstractConfigureRecommendedExtensionsAction;
    exports.AbstractConfigureRecommendedExtensionsAction = AbstractConfigureRecommendedExtensionsAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, files_1.IFileService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService)
    ], AbstractConfigureRecommendedExtensionsAction);
    let ConfigureWorkspaceRecommendedExtensionsAction = class ConfigureWorkspaceRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
        static { this.ID = 'workbench.extensions.action.configureWorkspaceRecommendedExtensions'; }
        static { this.LABEL = (0, nls_1.localize)('configureWorkspaceRecommendedExtensions', "Configure Recommended Extensions (Workspace)"); }
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.update(), this));
            this.update();
        }
        update() {
            this.enabled = this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
        }
        run() {
            switch (this.contextService.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */:
                    return this.openExtensionsFile(this.contextService.getWorkspace().folders[0].toResource(workspaceExtensionsConfig_1.EXTENSIONS_CONFIG));
                case 3 /* WorkbenchState.WORKSPACE */:
                    return this.openWorkspaceConfigurationFile(this.contextService.getWorkspace().configuration);
            }
            return Promise.resolve();
        }
    };
    exports.ConfigureWorkspaceRecommendedExtensionsAction = ConfigureWorkspaceRecommendedExtensionsAction;
    exports.ConfigureWorkspaceRecommendedExtensionsAction = ConfigureWorkspaceRecommendedExtensionsAction = __decorate([
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService)
    ], ConfigureWorkspaceRecommendedExtensionsAction);
    let ConfigureWorkspaceFolderRecommendedExtensionsAction = class ConfigureWorkspaceFolderRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
        static { this.ID = 'workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions'; }
        static { this.LABEL = (0, nls_1.localize)('configureWorkspaceFolderRecommendedExtensions', "Configure Recommended Extensions (Workspace Folder)"); }
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService, commandService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this.commandService = commandService;
        }
        run() {
            const folderCount = this.contextService.getWorkspace().folders.length;
            const pickFolderPromise = folderCount === 1 ? Promise.resolve(this.contextService.getWorkspace().folders[0]) : this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
            return Promise.resolve(pickFolderPromise)
                .then(workspaceFolder => {
                if (workspaceFolder) {
                    return this.openExtensionsFile(workspaceFolder.toResource(workspaceExtensionsConfig_1.EXTENSIONS_CONFIG));
                }
                return null;
            });
        }
    };
    exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = ConfigureWorkspaceFolderRecommendedExtensionsAction;
    exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = ConfigureWorkspaceFolderRecommendedExtensionsAction = __decorate([
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService),
        __param(8, commands_1.ICommandService)
    ], ConfigureWorkspaceFolderRecommendedExtensionsAction);
    let ExtensionStatusLabelAction = class ExtensionStatusLabelAction extends actions_1.Action {
        static { ExtensionStatusLabelAction_1 = this; }
        static { this.ENABLED_CLASS = `${ExtensionAction.TEXT_ACTION_CLASS} extension-status-label`; }
        static { this.DISABLED_CLASS = `${ExtensionStatusLabelAction_1.ENABLED_CLASS} hide`; }
        get extension() { return this._extension; }
        set extension(extension) {
            if (!(this._extension && extension && (0, extensionManagementUtil_1.areSameExtensions)(this._extension.identifier, extension.identifier))) {
                // Different extension. Reset
                this.initialStatus = null;
                this.status = null;
                this.enablementState = null;
            }
            this._extension = extension;
            this.update();
        }
        constructor(extensionService, extensionManagementServerService, extensionEnablementService) {
            super('extensions.action.statusLabel', '', ExtensionStatusLabelAction_1.DISABLED_CLASS, false);
            this.extensionService = extensionService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionEnablementService = extensionEnablementService;
            this.initialStatus = null;
            this.status = null;
            this.version = null;
            this.enablementState = null;
            this._extension = null;
        }
        update() {
            const label = this.computeLabel();
            this.label = label || '';
            this.class = label ? ExtensionStatusLabelAction_1.ENABLED_CLASS : ExtensionStatusLabelAction_1.DISABLED_CLASS;
        }
        computeLabel() {
            if (!this.extension) {
                return null;
            }
            const currentStatus = this.status;
            const currentVersion = this.version;
            const currentEnablementState = this.enablementState;
            this.status = this.extension.state;
            this.version = this.extension.version;
            if (this.initialStatus === null) {
                this.initialStatus = this.status;
            }
            this.enablementState = this.extension.enablementState;
            const canAddExtension = () => {
                const runningExtension = this.extensionService.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                if (this.extension.local) {
                    if (runningExtension && this.extension.version === runningExtension.version) {
                        return true;
                    }
                    return this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(this.extension.local));
                }
                return false;
            };
            const canRemoveExtension = () => {
                if (this.extension.local) {
                    if (this.extensionService.extensions.every(e => !((0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(e))))) {
                        return true;
                    }
                    return this.extensionService.canRemoveExtension((0, extensions_3.toExtensionDescription)(this.extension.local));
                }
                return false;
            };
            if (currentStatus !== null) {
                if (currentStatus === 0 /* ExtensionState.Installing */ && this.status === 1 /* ExtensionState.Installed */) {
                    return canAddExtension() ? this.initialStatus === 1 /* ExtensionState.Installed */ && this.version !== currentVersion ? (0, nls_1.localize)('updated', "Updated") : (0, nls_1.localize)('installed', "Installed") : null;
                }
                if (currentStatus === 2 /* ExtensionState.Uninstalling */ && this.status === 3 /* ExtensionState.Uninstalled */) {
                    this.initialStatus = this.status;
                    return canRemoveExtension() ? (0, nls_1.localize)('uninstalled', "Uninstalled") : null;
                }
            }
            if (currentEnablementState !== null) {
                const currentlyEnabled = this.extensionEnablementService.isEnabledEnablementState(currentEnablementState);
                const enabled = this.extensionEnablementService.isEnabledEnablementState(this.enablementState);
                if (!currentlyEnabled && enabled) {
                    return canAddExtension() ? (0, nls_1.localize)('enabled', "Enabled") : null;
                }
                if (currentlyEnabled && !enabled) {
                    return canRemoveExtension() ? (0, nls_1.localize)('disabled', "Disabled") : null;
                }
            }
            return null;
        }
        run() {
            return Promise.resolve();
        }
    };
    exports.ExtensionStatusLabelAction = ExtensionStatusLabelAction;
    exports.ExtensionStatusLabelAction = ExtensionStatusLabelAction = ExtensionStatusLabelAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], ExtensionStatusLabelAction);
    let ToggleSyncExtensionAction = class ToggleSyncExtensionAction extends ExtensionDropDownAction {
        static { ToggleSyncExtensionAction_1 = this; }
        static { this.IGNORED_SYNC_CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-sync ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.syncIgnoredIcon)}`; }
        static { this.SYNC_CLASS = `${ToggleSyncExtensionAction_1.ICON_ACTION_CLASS} extension-sync ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.syncEnabledIcon)}`; }
        constructor(configurationService, extensionsWorkbenchService, userDataSyncEnablementService, instantiationService) {
            super('extensions.sync', '', ToggleSyncExtensionAction_1.SYNC_CLASS, false, instantiationService);
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredExtensions'))(() => this.update()));
            this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = !!this.extension && this.userDataSyncEnablementService.isEnabled() && this.extension.state === 1 /* ExtensionState.Installed */;
            if (this.extension) {
                const isIgnored = this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
                this.class = isIgnored ? ToggleSyncExtensionAction_1.IGNORED_SYNC_CLASS : ToggleSyncExtensionAction_1.SYNC_CLASS;
                this.tooltip = isIgnored ? (0, nls_1.localize)('ignored', "This extension is ignored during sync") : (0, nls_1.localize)('synced', "This extension is synced");
            }
        }
        async run() {
            return super.run({
                actionGroups: [
                    [
                        new actions_1.Action('extensions.syncignore', this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension) ? (0, nls_1.localize)('sync', "Sync this extension") : (0, nls_1.localize)('do not sync', "Do not sync this extension"), undefined, true, () => this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(this.extension))
                    ]
                ], disposeActionsOnHide: true
            });
        }
    };
    exports.ToggleSyncExtensionAction = ToggleSyncExtensionAction;
    exports.ToggleSyncExtensionAction = ToggleSyncExtensionAction = ToggleSyncExtensionAction_1 = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, userDataSync_1.IUserDataSyncEnablementService),
        __param(3, instantiation_1.IInstantiationService)
    ], ToggleSyncExtensionAction);
    let ExtensionStatusAction = class ExtensionStatusAction extends ExtensionAction {
        static { ExtensionStatusAction_1 = this; }
        static { this.CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-status`; }
        get status() { return this._status; }
        constructor(extensionManagementServerService, labelService, commandService, workspaceTrustEnablementService, workspaceTrustService, extensionsWorkbenchService, extensionService, extensionManifestPropertiesService, contextService, productService, workbenchExtensionEnablementService) {
            super('extensions.status', '', `${ExtensionStatusAction_1.CLASS} hide`, false);
            this.extensionManagementServerService = extensionManagementServerService;
            this.labelService = labelService;
            this.commandService = commandService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.workspaceTrustService = workspaceTrustService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionService = extensionService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.contextService = contextService;
            this.productService = productService;
            this.workbenchExtensionEnablementService = workbenchExtensionEnablementService;
            this.updateWhenCounterExtensionChanges = true;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this.updateThrottler = new async_1.Throttler();
            this._register(this.labelService.onDidChangeFormatters(() => this.update(), this));
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
            this.update();
        }
        update() {
            this.updateThrottler.queue(() => this.computeAndUpdateStatus());
        }
        async computeAndUpdateStatus() {
            this.updateStatus(undefined, true);
            this.enabled = false;
            if (!this.extension) {
                return;
            }
            if (this.extension.isMalicious) {
                this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('malicious tooltip', "This extension was reported to be problematic.")) }, true);
                return;
            }
            if (this.extension.deprecationInfo) {
                if (this.extension.deprecationInfo.extension) {
                    const link = `[${this.extension.deprecationInfo.extension.displayName}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.extension.id]))}`)})`;
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('deprecated with alternate extension tooltip', "This extension is deprecated. Use the {0} extension instead.", link)) }, true);
                }
                else if (this.extension.deprecationInfo.settings) {
                    const link = `[${(0, nls_1.localize)('settings', "settings")}](${uri_1.URI.parse(`command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.settings.map(setting => `@id:${setting}`).join(' ')]))}`)})`;
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('deprecated with alternate settings tooltip', "This extension is deprecated as this functionality is now built-in to VS Code. Configure these {0} to use this functionality.", link)) }, true);
                }
                else {
                    const message = new htmlContent_1.MarkdownString((0, nls_1.localize)('deprecated tooltip', "This extension is deprecated as it is no longer being maintained."));
                    if (this.extension.deprecationInfo.additionalInfo) {
                        message.appendMarkdown(` ${this.extension.deprecationInfo.additionalInfo}`);
                    }
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                }
                return;
            }
            if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && this.extension.state === 3 /* ExtensionState.Uninstalled */ && !await this.extensionsWorkbenchService.canInstall(this.extension)) {
                if (this.extensionManagementServerService.localExtensionManagementServer || this.extensionManagementServerService.remoteExtensionManagementServer) {
                    const targetPlatform = await (this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform() : this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform());
                    const message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('incompatible platform', "The '{0}' extension is not available in {1} for {2}.", this.extension.displayName || this.extension.identifier.id, this.productService.nameLong, (0, extensionManagement_1.TargetPlatformToString)(targetPlatform))} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-platform-specific-extensions)`);
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                    return;
                }
                if (this.extensionManagementServerService.webExtensionManagementServer) {
                    const productName = (0, nls_1.localize)('VS Code for Web', "{0} for the Web", this.productService.nameLong);
                    const message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('not web tooltip', "The '{0}' extension is not available in {1}.", this.extension.displayName || this.extension.identifier.id, productName)} [${(0, nls_1.localize)('learn why', "Learn Why")}](https://aka.ms/vscode-web-extensions-guide)`);
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                    return;
                }
            }
            if (!this.extension.local ||
                !this.extension.server ||
                this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            // Extension is disabled by environment
            if (this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */) {
                this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('disabled by environment', "This extension is disabled by the environment.")) }, true);
                return;
            }
            // Extension is enabled by environment
            if (this.extension.enablementState === 3 /* EnablementState.EnabledByEnvironment */) {
                this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('enabled by environment', "This extension is enabled because it is required in the current environment.")) }, true);
                return;
            }
            // Extension is disabled by virtual workspace
            if (this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                const details = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.virtualWorkspaces);
                this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(details ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(details) : (0, nls_1.localize)('disabled because of virtual workspace', "This extension has been disabled because it does not support virtual workspaces.")) }, true);
                return;
            }
            // Limited support in Virtual Workspace
            if ((0, virtualWorkspace_1.isVirtualWorkspace)(this.contextService.getWorkspace())) {
                const virtualSupportType = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(this.extension.local.manifest);
                const details = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.virtualWorkspaces);
                if (virtualSupportType === 'limited' || details) {
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString(details ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(details) : (0, nls_1.localize)('extension limited because of virtual workspace', "This extension has limited features because the current workspace is virtual.")) }, true);
                    return;
                }
            }
            // Extension is disabled by untrusted workspace
            if (this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ ||
                // All disabled dependencies of the extension are disabled by untrusted workspace
                (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.workbenchExtensionEnablementService.getDependenciesEnablementStates(this.extension.local).every(([, enablementState]) => this.workbenchExtensionEnablementService.isEnabledEnablementState(enablementState) || enablementState === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                this.enabled = true;
                const untrustedDetails = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
                this.updateStatus({ icon: extensionsIcons_1.trustIcon, message: new htmlContent_1.MarkdownString(untrustedDetails ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(untrustedDetails) : (0, nls_1.localize)('extension disabled because of trust requirement', "This extension has been disabled because the current workspace is not trusted.")) }, true);
                return;
            }
            // Limited support in Untrusted Workspace
            if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() && !this.workspaceTrustService.isWorkspaceTrusted()) {
                const untrustedSupportType = this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(this.extension.local.manifest);
                const untrustedDetails = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
                if (untrustedSupportType === 'limited' || untrustedDetails) {
                    this.enabled = true;
                    this.updateStatus({ icon: extensionsIcons_1.trustIcon, message: new htmlContent_1.MarkdownString(untrustedDetails ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(untrustedDetails) : (0, nls_1.localize)('extension limited because of trust requirement', "This extension has limited features because the current workspace is not trusted.")) }, true);
                    return;
                }
            }
            // Extension is disabled by extension kind
            if (this.extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                if (!this.extensionsWorkbenchService.installed.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                    let message;
                    // Extension on Local Server
                    if (this.extensionManagementServerService.localExtensionManagementServer === this.extension.server) {
                        if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                                message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Install in remote server to enable', "This extension is disabled in this workspace because it is defined to run in the Remote Extension Host. Please install the extension in '{0}' to enable.", this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                        }
                    }
                    // Extension on Remote Server
                    else if (this.extensionManagementServerService.remoteExtensionManagementServer === this.extension.server) {
                        if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                            if (this.extensionManagementServerService.localExtensionManagementServer) {
                                message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Install in local server to enable', "This extension is disabled in this workspace because it is defined to run in the Local Extension Host. Please install the extension locally to enable.", this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                            else if (platform_1.isWeb) {
                                message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Defined to run in desktop', "This extension is disabled because it is defined to run only in {0} for the Desktop.", this.productService.nameLong)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                        }
                    }
                    // Extension on Web Server
                    else if (this.extensionManagementServerService.webExtensionManagementServer === this.extension.server) {
                        message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Cannot be enabled', "This extension is disabled because it is not supported in {0} for the Web.", this.productService.nameLong)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                    }
                    if (message) {
                        this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                    }
                    return;
                }
            }
            // Remote Workspace
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                if ((0, extensions_2.isLanguagePackExtension)(this.extension.local.manifest)) {
                    if (!this.extensionsWorkbenchService.installed.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                        const message = this.extension.server === this.extensionManagementServerService.localExtensionManagementServer
                            ? new htmlContent_1.MarkdownString((0, nls_1.localize)('Install language pack also in remote server', "Install the language pack extension on '{0}' to enable it there also.", this.extensionManagementServerService.remoteExtensionManagementServer.label))
                            : new htmlContent_1.MarkdownString((0, nls_1.localize)('Install language pack also locally', "Install the language pack extension locally to enable it there also."));
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message }, true);
                    }
                    return;
                }
                const runningExtension = this.extensionService.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                const runningExtensionServer = runningExtension ? this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension)) : null;
                if (this.extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('enabled remotely', "This extension is enabled in the Remote Extension Host because it prefers to run there.")} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
                if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('enabled locally', "This extension is enabled in the Local Extension Host because it prefers to run there.")} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
                if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.webExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.canExecuteOnWeb(this.extension.local.manifest)) {
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('enabled in web worker', "This extension is enabled in the Web Worker Extension Host because it prefers to run there.")} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
            }
            // Extension is disabled by its dependency
            if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */) {
                this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('extension disabled because of dependency', "This extension has been disabled because it depends on an extension that is disabled.")) }, true);
                return;
            }
            const isEnabled = this.workbenchExtensionEnablementService.isEnabled(this.extension.local);
            const isRunning = this.extensionService.extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier));
            if (isEnabled && isRunning) {
                if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                    if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                        this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('extension enabled on remote', "Extension is enabled on '{0}'", this.extension.server.label)) }, true);
                        return;
                    }
                }
                if (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('globally enabled', "This extension is enabled globally.")) }, true);
                    return;
                }
                if (this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('workspace enabled', "This extension is enabled for this workspace by the user.")) }, true);
                    return;
                }
            }
            if (!isEnabled && !isRunning) {
                if (this.extension.enablementState === 6 /* EnablementState.DisabledGlobally */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('globally disabled', "This extension is disabled globally by the user.")) }, true);
                    return;
                }
                if (this.extension.enablementState === 7 /* EnablementState.DisabledWorkspace */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('workspace disabled', "This extension is disabled for this workspace by the user.")) }, true);
                    return;
                }
            }
            if (isEnabled && !isRunning && !this.extension.local.isValid) {
                const errors = this.extension.local.validations.filter(([severity]) => severity === notification_1.Severity.Error).map(([, message]) => message);
                this.updateStatus({ icon: extensionsIcons_1.errorIcon, message: new htmlContent_1.MarkdownString(errors.join(' ').trim()) }, true);
            }
        }
        updateStatus(status, updateClass) {
            if (this._status === status) {
                return;
            }
            if (this._status && status && this._status.message === status.message && this._status.icon?.id === status.icon?.id) {
                return;
            }
            this._status = status;
            if (updateClass) {
                if (this._status?.icon === extensionsIcons_1.errorIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} extension-status-error ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.errorIcon)}`;
                }
                else if (this._status?.icon === extensionsIcons_1.warningIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} extension-status-warning ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.warningIcon)}`;
                }
                else if (this._status?.icon === extensionsIcons_1.infoIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} extension-status-info ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.infoIcon)}`;
                }
                else if (this._status?.icon === extensionsIcons_1.trustIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.trustIcon)}`;
                }
                else {
                    this.class = `${ExtensionStatusAction_1.CLASS} hide`;
                }
            }
            this._onDidChangeStatus.fire();
        }
        async run() {
            if (this._status?.icon === extensionsIcons_1.trustIcon) {
                return this.commandService.executeCommand('workbench.trust.manage');
            }
        }
    };
    exports.ExtensionStatusAction = ExtensionStatusAction;
    exports.ExtensionStatusAction = ExtensionStatusAction = ExtensionStatusAction_1 = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, label_1.ILabelService),
        __param(2, commands_1.ICommandService),
        __param(3, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(4, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(5, extensions_1.IExtensionsWorkbenchService),
        __param(6, extensions_3.IExtensionService),
        __param(7, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, productService_1.IProductService),
        __param(10, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], ExtensionStatusAction);
    let ReinstallAction = class ReinstallAction extends actions_1.Action {
        static { ReinstallAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.reinstall'; }
        static { this.LABEL = (0, nls_1.localize)('reinstall', "Reinstall Extension..."); }
        constructor(id = ReinstallAction_1.ID, label = ReinstallAction_1.LABEL, extensionsWorkbenchService, extensionManagementServerService, quickInputService, notificationService, hostService, instantiationService, extensionService) {
            super(id, label);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
        }
        get enabled() {
            return this.extensionsWorkbenchService.local.filter(l => !l.isBuiltin && l.local).length > 0;
        }
        run() {
            return this.quickInputService.pick(this.getEntries(), { placeHolder: (0, nls_1.localize)('selectExtensionToReinstall', "Select Extension to Reinstall") })
                .then(pick => pick && this.reinstallExtension(pick.extension));
        }
        getEntries() {
            return this.extensionsWorkbenchService.queryLocal()
                .then(local => {
                const entries = local
                    .filter(extension => !extension.isBuiltin && extension.server !== this.extensionManagementServerService.webExtensionManagementServer)
                    .map(extension => {
                    return {
                        id: extension.identifier.id,
                        label: extension.displayName,
                        description: extension.identifier.id,
                        extension,
                    };
                });
                return entries;
            });
        }
        reinstallExtension(extension) {
            return this.instantiationService.createInstance(SearchExtensionsAction, '@installed ').run()
                .then(() => {
                return this.extensionsWorkbenchService.reinstall(extension)
                    .then(extension => {
                    const requireReload = !(extension.local && this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                    const message = requireReload ? (0, nls_1.localize)('ReinstallAction.successReload', "Please reload Visual Studio Code to complete reinstalling the extension {0}.", extension.identifier.id)
                        : (0, nls_1.localize)('ReinstallAction.success', "Reinstalling the extension {0} is completed.", extension.identifier.id);
                    const actions = requireReload ? [{
                            label: (0, nls_1.localize)('InstallVSIXAction.reloadNow', "Reload Now"),
                            run: () => this.hostService.reload()
                        }] : [];
                    this.notificationService.prompt(notification_1.Severity.Info, message, actions, { sticky: true });
                }, error => this.notificationService.error(error));
            });
        }
    };
    exports.ReinstallAction = ReinstallAction;
    exports.ReinstallAction = ReinstallAction = ReinstallAction_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, extensionManagement_2.IExtensionManagementServerService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, notification_1.INotificationService),
        __param(6, host_1.IHostService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, extensions_3.IExtensionService)
    ], ReinstallAction);
    let InstallSpecificVersionOfExtensionAction = class InstallSpecificVersionOfExtensionAction extends actions_1.Action {
        static { InstallSpecificVersionOfExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.install.specificVersion'; }
        static { this.LABEL = (0, nls_1.localize)('install previous version', "Install Specific Version of Extension..."); }
        constructor(id = InstallSpecificVersionOfExtensionAction_1.ID, label = InstallSpecificVersionOfExtensionAction_1.LABEL, extensionsWorkbenchService, quickInputService, instantiationService, extensionEnablementService) {
            super(id, label);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.extensionEnablementService = extensionEnablementService;
        }
        get enabled() {
            return this.extensionsWorkbenchService.local.some(l => this.isEnabled(l));
        }
        async run() {
            const extensionPick = await this.quickInputService.pick(this.getExtensionEntries(), { placeHolder: (0, nls_1.localize)('selectExtension', "Select Extension"), matchOnDetail: true });
            if (extensionPick && extensionPick.extension) {
                const action = this.instantiationService.createInstance(InstallAnotherVersionAction);
                action.extension = extensionPick.extension;
                await action.run();
                await this.instantiationService.createInstance(SearchExtensionsAction, extensionPick.extension.identifier.id).run();
            }
        }
        isEnabled(extension) {
            const action = this.instantiationService.createInstance(InstallAnotherVersionAction);
            action.extension = extension;
            return action.enabled && !!extension.local && this.extensionEnablementService.isEnabled(extension.local);
        }
        async getExtensionEntries() {
            const installed = await this.extensionsWorkbenchService.queryLocal();
            const entries = [];
            for (const extension of installed) {
                if (this.isEnabled(extension)) {
                    entries.push({
                        id: extension.identifier.id,
                        label: extension.displayName || extension.identifier.id,
                        description: extension.identifier.id,
                        extension,
                    });
                }
            }
            return entries.sort((e1, e2) => e1.extension.displayName.localeCompare(e2.extension.displayName));
        }
    };
    exports.InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction;
    exports.InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], InstallSpecificVersionOfExtensionAction);
    let AbstractInstallExtensionsInServerAction = class AbstractInstallExtensionsInServerAction extends actions_1.Action {
        constructor(id, extensionsWorkbenchService, quickInputService, notificationService, progressService) {
            super(id);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.progressService = progressService;
            this.extensions = undefined;
            this.update();
            this.extensionsWorkbenchService.queryLocal().then(() => this.updateExtensions());
            this._register(this.extensionsWorkbenchService.onChange(() => {
                if (this.extensions) {
                    this.updateExtensions();
                }
            }));
        }
        updateExtensions() {
            this.extensions = this.extensionsWorkbenchService.local;
            this.update();
        }
        update() {
            this.enabled = !!this.extensions && this.getExtensionsToInstall(this.extensions).length > 0;
            this.tooltip = this.label;
        }
        async run() {
            return this.selectAndInstallExtensions();
        }
        async queryExtensionsToInstall() {
            const local = await this.extensionsWorkbenchService.queryLocal();
            return this.getExtensionsToInstall(local);
        }
        async selectAndInstallExtensions() {
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.busy = true;
            const disposable = quickPick.onDidAccept(() => {
                disposable.dispose();
                quickPick.hide();
                quickPick.dispose();
                this.onDidAccept(quickPick.selectedItems);
            });
            quickPick.show();
            const localExtensionsToInstall = await this.queryExtensionsToInstall();
            quickPick.busy = false;
            if (localExtensionsToInstall.length) {
                quickPick.title = this.getQuickPickTitle();
                quickPick.placeholder = (0, nls_1.localize)('select extensions to install', "Select extensions to install");
                quickPick.canSelectMany = true;
                localExtensionsToInstall.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                quickPick.items = localExtensionsToInstall.map(extension => ({ extension, label: extension.displayName, description: extension.version }));
            }
            else {
                quickPick.hide();
                quickPick.dispose();
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)('no local extensions', "There are no extensions to install.")
                });
            }
        }
        async onDidAccept(selectedItems) {
            if (selectedItems.length) {
                const localExtensionsToInstall = selectedItems.filter(r => !!r.extension).map(r => r.extension);
                if (localExtensionsToInstall.length) {
                    await this.progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)('installing extensions', "Installing Extensions...")
                    }, () => this.installExtensions(localExtensionsToInstall));
                    this.notificationService.info((0, nls_1.localize)('finished installing', "Successfully installed extensions."));
                }
            }
        }
    };
    exports.AbstractInstallExtensionsInServerAction = AbstractInstallExtensionsInServerAction;
    exports.AbstractInstallExtensionsInServerAction = AbstractInstallExtensionsInServerAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, notification_1.INotificationService),
        __param(4, progress_1.IProgressService)
    ], AbstractInstallExtensionsInServerAction);
    let InstallLocalExtensionsInRemoteAction = class InstallLocalExtensionsInRemoteAction extends AbstractInstallExtensionsInServerAction {
        constructor(extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, instantiationService, fileService, logService) {
            super('workbench.extensions.actions.installLocalExtensionsInRemote', extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.logService = logService;
        }
        get label() {
            if (this.extensionManagementServerService && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return (0, nls_1.localize)('select and install local extensions', "Install Local Extensions in '{0}'...", this.extensionManagementServerService.remoteExtensionManagementServer.label);
            }
            return '';
        }
        getQuickPickTitle() {
            return (0, nls_1.localize)('install local extensions title', "Install Local Extensions in '{0}'", this.extensionManagementServerService.remoteExtensionManagementServer.label);
        }
        getExtensionsToInstall(local) {
            return local.filter(extension => {
                const action = this.instantiationService.createInstance(RemoteInstallAction, true);
                action.extension = extension;
                return action.enabled;
            });
        }
        async installExtensions(localExtensionsToInstall) {
            const galleryExtensions = [];
            const vsixs = [];
            const targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
            await async_1.Promises.settled(localExtensionsToInstall.map(async (extension) => {
                if (this.extensionGalleryService.isEnabled()) {
                    const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0];
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            try {
                await async_1.Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.install(vsix)));
            }
            finally {
                try {
                    await Promise.allSettled(vsixs.map(vsix => this.fileService.del(vsix)));
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
    };
    exports.InstallLocalExtensionsInRemoteAction = InstallLocalExtensionsInRemoteAction;
    exports.InstallLocalExtensionsInRemoteAction = InstallLocalExtensionsInRemoteAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, progress_1.IProgressService),
        __param(3, notification_1.INotificationService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, extensionManagement_1.IExtensionGalleryService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, files_1.IFileService),
        __param(8, log_1.ILogService)
    ], InstallLocalExtensionsInRemoteAction);
    let InstallRemoteExtensionsInLocalAction = class InstallRemoteExtensionsInLocalAction extends AbstractInstallExtensionsInServerAction {
        constructor(id, extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, fileService, logService) {
            super(id, extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.fileService = fileService;
            this.logService = logService;
        }
        get label() {
            return (0, nls_1.localize)('select and install remote extensions', "Install Remote Extensions Locally...");
        }
        getQuickPickTitle() {
            return (0, nls_1.localize)('install remote extensions', "Install Remote Extensions Locally");
        }
        getExtensionsToInstall(local) {
            return local.filter(extension => extension.type === 1 /* ExtensionType.User */ && extension.server !== this.extensionManagementServerService.localExtensionManagementServer
                && !this.extensionsWorkbenchService.installed.some(e => e.server === this.extensionManagementServerService.localExtensionManagementServer && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier)));
        }
        async installExtensions(extensions) {
            const galleryExtensions = [];
            const vsixs = [];
            const targetPlatform = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform();
            await async_1.Promises.settled(extensions.map(async (extension) => {
                if (this.extensionGalleryService.isEnabled()) {
                    const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0];
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            try {
                await async_1.Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.install(vsix)));
            }
            finally {
                try {
                    await Promise.allSettled(vsixs.map(vsix => this.fileService.del(vsix)));
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
    };
    exports.InstallRemoteExtensionsInLocalAction = InstallRemoteExtensionsInLocalAction;
    exports.InstallRemoteExtensionsInLocalAction = InstallRemoteExtensionsInLocalAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, progress_1.IProgressService),
        __param(4, notification_1.INotificationService),
        __param(5, extensionManagement_2.IExtensionManagementServerService),
        __param(6, extensionManagement_1.IExtensionGalleryService),
        __param(7, files_1.IFileService),
        __param(8, log_1.ILogService)
    ], InstallRemoteExtensionsInLocalAction);
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsForLanguage', function (accessor, fileExtension) {
        const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
        return paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => {
            viewlet.search(`ext:${fileExtension.replace(/^\./, '')}`);
            viewlet.focus();
        });
    });
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsWithIds', function (accessor, extensionIds) {
        const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
        return paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => {
            const query = extensionIds
                .map(id => `@id:${id}`)
                .join(' ');
            viewlet.search(query);
            viewlet.focus();
        });
    });
    (0, colorRegistry_1.registerColor)('extensionButton.background', {
        dark: colorRegistry_1.buttonBackground,
        light: colorRegistry_1.buttonBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonBackground', "Button background color for extension actions."));
    (0, colorRegistry_1.registerColor)('extensionButton.foreground', {
        dark: colorRegistry_1.buttonForeground,
        light: colorRegistry_1.buttonForeground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonForeground', "Button foreground color for extension actions."));
    (0, colorRegistry_1.registerColor)('extensionButton.hoverBackground', {
        dark: colorRegistry_1.buttonHoverBackground,
        light: colorRegistry_1.buttonHoverBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonHoverBackground', "Button background hover color for extension actions."));
    (0, colorRegistry_1.registerColor)('extensionButton.separator', {
        dark: colorRegistry_1.buttonSeparator,
        light: colorRegistry_1.buttonSeparator,
        hcDark: colorRegistry_1.buttonSeparator,
        hcLight: colorRegistry_1.buttonSeparator
    }, (0, nls_1.localize)('extensionButtonSeparator', "Button separator color for extension actions"));
    exports.extensionButtonProminentBackground = (0, colorRegistry_1.registerColor)('extensionButton.prominentBackground', {
        dark: colorRegistry_1.buttonBackground,
        light: colorRegistry_1.buttonBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonProminentBackground', "Button background color for extension actions that stand out (e.g. install button)."));
    (0, colorRegistry_1.registerColor)('extensionButton.prominentForeground', {
        dark: colorRegistry_1.buttonForeground,
        light: colorRegistry_1.buttonForeground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonProminentForeground', "Button foreground color for extension actions that stand out (e.g. install button)."));
    (0, colorRegistry_1.registerColor)('extensionButton.prominentHoverBackground', {
        dark: colorRegistry_1.buttonHoverBackground,
        light: colorRegistry_1.buttonHoverBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonProminentHoverBackground', "Button background hover color for extension actions that stand out (e.g. install button)."));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const errorColor = theme.getColor(colorRegistry_1.editorErrorForeground);
        if (errorColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)} { color: ${errorColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)} { color: ${errorColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)} { color: ${errorColor}; }`);
        }
        const warningColor = theme.getColor(colorRegistry_1.editorWarningForeground);
        if (warningColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.warningIcon)} { color: ${warningColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.warningIcon)} { color: ${warningColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.warningIcon)} { color: ${warningColor}; }`);
        }
        const infoColor = theme.getColor(colorRegistry_1.editorInfoForeground);
        if (infoColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.infoIcon)} { color: ${infoColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.infoIcon)} { color: ${infoColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.infoIcon)} { color: ${infoColor}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uc0FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXVFekYsSUFBTSxtQ0FBbUMsR0FBekMsTUFBTSxtQ0FBb0MsU0FBUSxnQkFBTTtRQUU5RCxZQUNrQixTQUFxQixFQUNyQixPQUFlLEVBQ2YsZ0JBQWtDLEVBQ2xDLEtBQVksRUFDSyxjQUErQixFQUNoQyxhQUE2QixFQUN2QixtQkFBeUMsRUFDL0MsYUFBNkIsRUFDNUIsY0FBK0IsRUFDbkMsVUFBdUIsRUFDRCxnQ0FBbUUsRUFDL0Usb0JBQTJDLEVBQ3hDLGNBQXdDLEVBQzdCLGtDQUF1RTtZQUU3SCxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztZQWZoQyxjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQ3JCLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFDZixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2xDLFVBQUssR0FBTCxLQUFLLENBQU87WUFDSyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDaEMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3ZCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDL0Msa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ0QscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUMvRSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3hDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUM3Qix1Q0FBa0MsR0FBbEMsa0NBQWtDLENBQXFDO1FBRzlILENBQUM7UUFFUSxLQUFLLENBQUMsR0FB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