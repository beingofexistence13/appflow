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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensions/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/workbench/services/extensions/common/extensions", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, event_1, lifecycle_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, workspace_1, storage_1, environmentService_1, extensions_1, configuration_1, extensions_2, extensionEnablementService_1, extensions_3, userDataSyncAccount_1, userDataSync_1, lifecycle_2, notification_1, host_1, extensionBisect_1, workspaceTrust_1, extensionManifestPropertiesService_1, virtualWorkspace_1, log_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEnablementService = void 0;
    const SOURCE = 'IWorkbenchExtensionEnablementService';
    let ExtensionEnablementService = class ExtensionEnablementService extends lifecycle_1.Disposable {
        constructor(storageService, globalExtensionEnablementService, contextService, environmentService, extensionManagementService, configurationService, extensionManagementServerService, userDataSyncEnablementService, userDataSyncAccountService, lifecycleService, notificationService, hostService, extensionBisectService, workspaceTrustManagementService, workspaceTrustRequestService, extensionManifestPropertiesService, instantiationService) {
            super();
            this.globalExtensionEnablementService = globalExtensionEnablementService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataSyncAccountService = userDataSyncAccountService;
            this.lifecycleService = lifecycleService;
            this.notificationService = notificationService;
            this.extensionBisectService = extensionBisectService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this._onEnablementChanged = new event_1.Emitter();
            this.onEnablementChanged = this._onEnablementChanged.event;
            this.storageManger = this._register(new extensionEnablementService_1.StorageManager(storageService));
            const uninstallDisposable = this._register(event_1.Event.filter(extensionManagementService.onDidUninstallExtension, e => !e.error)(({ identifier }) => this._reset(identifier)));
            let isDisposed = false;
            this._register((0, lifecycle_1.toDisposable)(() => isDisposed = true));
            this.extensionsManager = this._register(instantiationService.createInstance(ExtensionsManager));
            this.extensionsManager.whenInitialized().then(() => {
                if (!isDisposed) {
                    this._register(this.extensionsManager.onDidChangeExtensions(({ added, removed, isProfileSwitch }) => this._onDidChangeExtensions(added, removed, isProfileSwitch)));
                    uninstallDisposable.dispose();
                }
            });
            this._register(this.globalExtensionEnablementService.onDidChangeEnablement(({ extensions, source }) => this._onDidChangeGloballyDisabledExtensions(extensions, source)));
            // delay notification for extensions disabled until workbench restored
            if (this.allUserExtensionsDisabled) {
                this.lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => {
                    this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('extensionsDisabled', "All installed extensions are temporarily disabled."), [{
                            label: (0, nls_1.localize)('Reload', "Reload and Enable Extensions"),
                            run: () => hostService.reload({ disableExtensions: false })
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                });
            }
        }
        get hasWorkspace() {
            return this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
        }
        get allUserExtensionsDisabled() {
            return this.environmentService.disableExtensions === true;
        }
        getEnablementState(extension) {
            return this._computeEnablementState(extension, this.extensionsManager.extensions, this.getWorkspaceType());
        }
        getEnablementStates(extensions, workspaceTypeOverrides = {}) {
            const extensionsEnablements = new Map();
            const workspaceType = { ...this.getWorkspaceType(), ...workspaceTypeOverrides };
            return extensions.map(extension => this._computeEnablementState(extension, extensions, workspaceType, extensionsEnablements));
        }
        getDependenciesEnablementStates(extension) {
            return (0, extensionManagementUtil_1.getExtensionDependencies)(this.extensionsManager.extensions, extension).map(e => [e, this.getEnablementState(e)]);
        }
        canChangeEnablement(extension) {
            try {
                this.throwErrorIfCannotChangeEnablement(extension);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        canChangeWorkspaceEnablement(extension) {
            if (!this.canChangeEnablement(extension)) {
                return false;
            }
            try {
                this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        throwErrorIfCannotChangeEnablement(extension, donotCheckDependencies) {
            if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                throw new Error((0, nls_1.localize)('cannot disable language pack extension', "Cannot change enablement of {0} extension because it contributes language packs.", extension.manifest.displayName || extension.identifier.id));
            }
            if (this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account &&
                (0, extensions_1.isAuthenticationProviderExtension)(extension.manifest) && extension.manifest.contributes.authentication.some(a => a.id === this.userDataSyncAccountService.account.authenticationProviderId)) {
                throw new Error((0, nls_1.localize)('cannot disable auth extension', "Cannot change enablement {0} extension because Settings Sync depends on it.", extension.manifest.displayName || extension.identifier.id));
            }
            if (this._isEnabledInEnv(extension)) {
                throw new Error((0, nls_1.localize)('cannot change enablement environment', "Cannot change enablement of {0} extension because it is enabled in environment", extension.manifest.displayName || extension.identifier.id));
            }
            this.throwErrorIfEnablementStateCannotBeChanged(extension, this.getEnablementState(extension), donotCheckDependencies);
        }
        throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, donotCheckDependencies) {
            switch (enablementStateOfExtension) {
                case 2 /* EnablementState.DisabledByEnvironment */:
                    throw new Error((0, nls_1.localize)('cannot change disablement environment', "Cannot change enablement of {0} extension because it is disabled in environment", extension.manifest.displayName || extension.identifier.id));
                case 4 /* EnablementState.DisabledByVirtualWorkspace */:
                    throw new Error((0, nls_1.localize)('cannot change enablement virtual workspace', "Cannot change enablement of {0} extension because it does not support virtual workspaces", extension.manifest.displayName || extension.identifier.id));
                case 1 /* EnablementState.DisabledByExtensionKind */:
                    throw new Error((0, nls_1.localize)('cannot change enablement extension kind', "Cannot change enablement of {0} extension because of its extension kind", extension.manifest.displayName || extension.identifier.id));
                case 5 /* EnablementState.DisabledByExtensionDependency */:
                    if (donotCheckDependencies) {
                        break;
                    }
                    // Can be changed only when all its dependencies enablements can be changed
                    for (const dependency of (0, extensionManagementUtil_1.getExtensionDependencies)(this.extensionsManager.extensions, extension)) {
                        if (this.isEnabled(dependency)) {
                            continue;
                        }
                        try {
                            this.throwErrorIfCannotChangeEnablement(dependency, true);
                        }
                        catch (error) {
                            throw new Error((0, nls_1.localize)('cannot change enablement dependency', "Cannot enable '{0}' extension because it depends on '{1}' extension that cannot be enabled", extension.manifest.displayName || extension.identifier.id, dependency.manifest.displayName || dependency.identifier.id));
                        }
                    }
            }
        }
        throwErrorIfCannotChangeWorkspaceEnablement(extension) {
            if (!this.hasWorkspace) {
                throw new Error((0, nls_1.localize)('noWorkspace', "No workspace."));
            }
            if ((0, extensions_1.isAuthenticationProviderExtension)(extension.manifest)) {
                throw new Error((0, nls_1.localize)('cannot disable auth extension in workspace', "Cannot change enablement of {0} extension in workspace because it contributes authentication providers", extension.manifest.displayName || extension.identifier.id));
            }
        }
        async setEnablement(extensions, newState) {
            await this.extensionsManager.whenInitialized();
            if (newState === 8 /* EnablementState.EnabledGlobally */ || newState === 9 /* EnablementState.EnabledWorkspace */) {
                extensions.push(...this.getExtensionsToEnableRecursively(extensions, this.extensionsManager.extensions, newState, { dependencies: true, pack: true }));
            }
            const workspace = newState === 7 /* EnablementState.DisabledWorkspace */ || newState === 9 /* EnablementState.EnabledWorkspace */;
            for (const extension of extensions) {
                if (workspace) {
                    this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
                }
                else {
                    this.throwErrorIfCannotChangeEnablement(extension);
                }
            }
            const result = [];
            for (const extension of extensions) {
                const enablementState = this.getEnablementState(extension);
                if (enablementState === 0 /* EnablementState.DisabledByTrustRequirement */
                    /* All its disabled dependencies are disabled by Trust Requirement */
                    || (enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.getDependenciesEnablementStates(extension).every(([, e]) => this.isEnabledEnablementState(e) || e === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                    const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust();
                    result.push(trustState ?? false);
                }
                else {
                    result.push(await this._setUserEnablementState(extension, newState));
                }
            }
            const changedExtensions = extensions.filter((e, index) => result[index]);
            if (changedExtensions.length) {
                this._onEnablementChanged.fire(changedExtensions);
            }
            return result;
        }
        getExtensionsToEnableRecursively(extensions, allExtensions, enablementState, options, checked = []) {
            if (!options.dependencies && !options.pack) {
                return [];
            }
            const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
            if (!toCheck.length) {
                return [];
            }
            for (const extension of toCheck) {
                checked.push(extension);
            }
            const extensionsToEnable = [];
            for (const extension of allExtensions) {
                // Extension is already checked
                if (checked.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))) {
                    continue;
                }
                const enablementStateOfExtension = this.getEnablementState(extension);
                // Extension is enabled
                if (this.isEnabledEnablementState(enablementStateOfExtension)) {
                    continue;
                }
                // Skip if dependency extension is disabled by extension kind
                if (enablementStateOfExtension === 1 /* EnablementState.DisabledByExtensionKind */) {
                    continue;
                }
                // Check if the extension is a dependency or in extension pack
                if (extensions.some(e => (options.dependencies && e.manifest.extensionDependencies?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)))
                    || (options.pack && e.manifest.extensionPack?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier))))) {
                    const index = extensionsToEnable.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier));
                    // Extension is not added to the disablement list so add it
                    if (index === -1) {
                        extensionsToEnable.push(extension);
                    }
                    // Extension is there already in the disablement list.
                    else {
                        try {
                            // Replace only if the enablement state can be changed
                            this.throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, true);
                            extensionsToEnable.splice(index, 1, extension);
                        }
                        catch (error) { /*Do not add*/ }
                    }
                }
            }
            if (extensionsToEnable.length) {
                extensionsToEnable.push(...this.getExtensionsToEnableRecursively(extensionsToEnable, allExtensions, enablementState, options, checked));
            }
            return extensionsToEnable;
        }
        _setUserEnablementState(extension, newState) {
            const currentState = this._getUserEnablementState(extension.identifier);
            if (currentState === newState) {
                return Promise.resolve(false);
            }
            switch (newState) {
                case 8 /* EnablementState.EnabledGlobally */:
                    this._enableExtension(extension.identifier);
                    break;
                case 6 /* EnablementState.DisabledGlobally */:
                    this._disableExtension(extension.identifier);
                    break;
                case 9 /* EnablementState.EnabledWorkspace */:
                    this._enableExtensionInWorkspace(extension.identifier);
                    break;
                case 7 /* EnablementState.DisabledWorkspace */:
                    this._disableExtensionInWorkspace(extension.identifier);
                    break;
            }
            return Promise.resolve(true);
        }
        isEnabled(extension) {
            const enablementState = this.getEnablementState(extension);
            return this.isEnabledEnablementState(enablementState);
        }
        isEnabledEnablementState(enablementState) {
            return enablementState === 3 /* EnablementState.EnabledByEnvironment */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ || enablementState === 8 /* EnablementState.EnabledGlobally */;
        }
        isDisabledGlobally(extension) {
            return this._isDisabledGlobally(extension.identifier);
        }
        _computeEnablementState(extension, extensions, workspaceType, computedEnablementStates) {
            computedEnablementStates = computedEnablementStates ?? new Map();
            let enablementState = computedEnablementStates.get(extension);
            if (enablementState !== undefined) {
                return enablementState;
            }
            enablementState = this._getUserEnablementState(extension.identifier);
            if (this.extensionBisectService.isDisabledByBisect(extension)) {
                enablementState = 2 /* EnablementState.DisabledByEnvironment */;
            }
            else if (this._isDisabledInEnv(extension)) {
                enablementState = 2 /* EnablementState.DisabledByEnvironment */;
            }
            else if (this._isDisabledByVirtualWorkspace(extension, workspaceType)) {
                enablementState = 4 /* EnablementState.DisabledByVirtualWorkspace */;
            }
            else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByWorkspaceTrust(extension, workspaceType)) {
                enablementState = 0 /* EnablementState.DisabledByTrustRequirement */;
            }
            else if (this._isDisabledByExtensionKind(extension)) {
                enablementState = 1 /* EnablementState.DisabledByExtensionKind */;
            }
            else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates)) {
                enablementState = 5 /* EnablementState.DisabledByExtensionDependency */;
            }
            else if (!this.isEnabledEnablementState(enablementState) && this._isEnabledInEnv(extension)) {
                enablementState = 3 /* EnablementState.EnabledByEnvironment */;
            }
            computedEnablementStates.set(extension, enablementState);
            return enablementState;
        }
        _isDisabledInEnv(extension) {
            if (this.allUserExtensionsDisabled) {
                return !extension.isBuiltin && !(0, extensions_1.isResolverExtension)(extension.manifest, this.environmentService.remoteAuthority);
            }
            const disabledExtensions = this.environmentService.disableExtensions;
            if (Array.isArray(disabledExtensions)) {
                return disabledExtensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier));
            }
            // Check if this is the better merge extension which was migrated to a built-in extension
            if ((0, extensionManagementUtil_1.areSameExtensions)({ id: extensionManagementUtil_1.BetterMergeId.value }, extension.identifier)) {
                return true;
            }
            return false;
        }
        _isEnabledInEnv(extension) {
            const enabledExtensions = this.environmentService.enableExtensions;
            if (Array.isArray(enabledExtensions)) {
                return enabledExtensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier));
            }
            return false;
        }
        _isDisabledByVirtualWorkspace(extension, workspaceType) {
            // Not a virtual workspace
            if (!workspaceType.virtual) {
                return false;
            }
            // Supports virtual workspace
            if (this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) !== false) {
                return false;
            }
            // Web extension from web extension management server
            if (this.extensionManagementServerService.getExtensionManagementServer(extension) === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWeb(extension.manifest)) {
                return false;
            }
            return true;
        }
        _isDisabledByExtensionKind(extension) {
            if (this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
                const installLocation = this.extensionManagementServerService.getExtensionInstallLocation(extension);
                for (const extensionKind of this.extensionManifestPropertiesService.getExtensionKind(extension.manifest)) {
                    if (extensionKind === 'ui') {
                        if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                            return false;
                        }
                    }
                    if (extensionKind === 'workspace') {
                        if (installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                            return false;
                        }
                    }
                    if (extensionKind === 'web') {
                        if (this.extensionManagementServerService.webExtensionManagementServer /* web */) {
                            if (installLocation === 3 /* ExtensionInstallLocation.Web */ || installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                                return false;
                            }
                        }
                        else if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                            const enableLocalWebWorker = this.configurationService.getValue(extensions_3.webWorkerExtHostConfig);
                            if (enableLocalWebWorker === true || enableLocalWebWorker === 'auto') {
                                // Web extensions are enabled on all configurations
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            return false;
        }
        _isDisabledByWorkspaceTrust(extension, workspaceType) {
            if (workspaceType.trusted) {
                return false;
            }
            return this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) === false;
        }
        _isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates) {
            // Find dependencies from the same server as of the extension
            const dependencyExtensions = extension.manifest.extensionDependencies
                ? extensions.filter(e => extension.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }) && this.extensionManagementServerService.getExtensionManagementServer(e) === this.extensionManagementServerService.getExtensionManagementServer(extension)))
                : [];
            if (!dependencyExtensions.length) {
                return false;
            }
            const hasEnablementState = computedEnablementStates.has(extension);
            if (!hasEnablementState) {
                // Placeholder to handle cyclic deps
                computedEnablementStates.set(extension, 8 /* EnablementState.EnabledGlobally */);
            }
            try {
                for (const dependencyExtension of dependencyExtensions) {
                    const enablementState = this._computeEnablementState(dependencyExtension, extensions, workspaceType, computedEnablementStates);
                    if (!this.isEnabledEnablementState(enablementState) && enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                        return true;
                    }
                }
            }
            finally {
                if (!hasEnablementState) {
                    // remove the placeholder
                    computedEnablementStates.delete(extension);
                }
            }
            return false;
        }
        _getUserEnablementState(identifier) {
            if (this.hasWorkspace) {
                if (this._getWorkspaceEnabledExtensions().filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier))[0]) {
                    return 9 /* EnablementState.EnabledWorkspace */;
                }
                if (this._getWorkspaceDisabledExtensions().filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier))[0]) {
                    return 7 /* EnablementState.DisabledWorkspace */;
                }
            }
            if (this._isDisabledGlobally(identifier)) {
                return 6 /* EnablementState.DisabledGlobally */;
            }
            return 8 /* EnablementState.EnabledGlobally */;
        }
        _isDisabledGlobally(identifier) {
            return this.globalExtensionEnablementService.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier));
        }
        _enableExtension(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
            return this.globalExtensionEnablementService.enableExtension(identifier, SOURCE);
        }
        _disableExtension(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
            return this.globalExtensionEnablementService.disableExtension(identifier, SOURCE);
        }
        _enableExtensionInWorkspace(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._addToWorkspaceEnabledExtensions(identifier);
        }
        _disableExtensionInWorkspace(identifier) {
            this._addToWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
        }
        _addToWorkspaceDisabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return Promise.resolve(false);
            }
            const disabledExtensions = this._getWorkspaceDisabledExtensions();
            if (disabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                disabledExtensions.push(identifier);
                this._setDisabledExtensions(disabledExtensions);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
        async _removeFromWorkspaceDisabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            const disabledExtensions = this._getWorkspaceDisabledExtensions();
            for (let index = 0; index < disabledExtensions.length; index++) {
                const disabledExtension = disabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this._setDisabledExtensions(disabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _addToWorkspaceEnabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            const enabledExtensions = this._getWorkspaceEnabledExtensions();
            if (enabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                enabledExtensions.push(identifier);
                this._setEnabledExtensions(enabledExtensions);
                return true;
            }
            return false;
        }
        _removeFromWorkspaceEnabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            const enabledExtensions = this._getWorkspaceEnabledExtensions();
            for (let index = 0; index < enabledExtensions.length; index++) {
                const disabledExtension = enabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    enabledExtensions.splice(index, 1);
                    this._setEnabledExtensions(enabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _getWorkspaceEnabledExtensions() {
            return this._getExtensions(extensionManagement_1.ENABLED_EXTENSIONS_STORAGE_PATH);
        }
        _setEnabledExtensions(enabledExtensions) {
            this._setExtensions(extensionManagement_1.ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions);
        }
        _getWorkspaceDisabledExtensions() {
            return this._getExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH);
        }
        _setDisabledExtensions(disabledExtensions) {
            this._setExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
        }
        _getExtensions(storageId) {
            if (!this.hasWorkspace) {
                return [];
            }
            return this.storageManger.get(storageId, 1 /* StorageScope.WORKSPACE */);
        }
        _setExtensions(storageId, extensions) {
            this.storageManger.set(storageId, extensions, 1 /* StorageScope.WORKSPACE */);
        }
        async _onDidChangeGloballyDisabledExtensions(extensionIdentifiers, source) {
            if (source !== SOURCE) {
                await this.extensionsManager.whenInitialized();
                const extensions = this.extensionsManager.extensions.filter(installedExtension => extensionIdentifiers.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, installedExtension.identifier)));
                this._onEnablementChanged.fire(extensions);
            }
        }
        _onDidChangeExtensions(added, removed, isProfileSwitch) {
            const disabledExtensions = added.filter(e => !this.isEnabledEnablementState(this.getEnablementState(e)));
            if (disabledExtensions.length) {
                this._onEnablementChanged.fire(disabledExtensions);
            }
            if (!isProfileSwitch) {
                removed.forEach(({ identifier }) => this._reset(identifier));
            }
        }
        async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
            await this.extensionsManager.whenInitialized();
            const computeEnablementStates = (workspaceType) => {
                const extensionsEnablements = new Map();
                return this.extensionsManager.extensions.map(extension => [extension, this._computeEnablementState(extension, this.extensionsManager.extensions, workspaceType, extensionsEnablements)]);
            };
            const workspaceType = this.getWorkspaceType();
            const enablementStatesWithTrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: true });
            const enablementStatesWithUntrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: false });
            const enablementChangedExtensionsBecauseOfTrust = enablementStatesWithTrustedWorkspace.filter(([, enablementState], index) => enablementState !== enablementStatesWithUntrustedWorkspace[index][1]).map(([extension]) => extension);
            if (enablementChangedExtensionsBecauseOfTrust.length) {
                this._onEnablementChanged.fire(enablementChangedExtensionsBecauseOfTrust);
            }
        }
        getWorkspaceType() {
            return { trusted: this.workspaceTrustManagementService.isWorkspaceTrusted(), virtual: (0, virtualWorkspace_1.isVirtualWorkspace)(this.contextService.getWorkspace()) };
        }
        _reset(extension) {
            this._removeFromWorkspaceDisabledExtensions(extension);
            this._removeFromWorkspaceEnabledExtensions(extension);
            this.globalExtensionEnablementService.enableExtension(extension);
        }
    };
    exports.ExtensionEnablementService = ExtensionEnablementService;
    exports.ExtensionEnablementService = ExtensionEnablementService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, extensionManagement_2.IExtensionManagementServerService),
        __param(7, userDataSync_1.IUserDataSyncEnablementService),
        __param(8, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(9, lifecycle_2.ILifecycleService),
        __param(10, notification_1.INotificationService),
        __param(11, host_1.IHostService),
        __param(12, extensionBisect_1.IExtensionBisectService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(15, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(16, instantiation_1.IInstantiationService)
    ], ExtensionEnablementService);
    let ExtensionsManager = class ExtensionsManager extends lifecycle_1.Disposable {
        get extensions() { return this._extensions; }
        constructor(extensionManagementService, extensionManagementServerService, logService) {
            super();
            this.extensionManagementService = extensionManagementService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.logService = logService;
            this._extensions = [];
            this._onDidChangeExtensions = this._register(new event_1.Emitter());
            this.onDidChangeExtensions = this._onDidChangeExtensions.event;
            this.disposed = false;
            this._register((0, lifecycle_1.toDisposable)(() => this.disposed = true));
            this.initializePromise = this.initialize();
        }
        whenInitialized() {
            return this.initializePromise;
        }
        async initialize() {
            try {
                this._extensions = await this.extensionManagementService.getInstalled();
                if (this.disposed) {
                    return;
                }
                this._onDidChangeExtensions.fire({ added: this.extensions, removed: [], isProfileSwitch: false });
            }
            catch (error) {
                this.logService.error(error);
            }
            this._register(this.extensionManagementService.onDidInstallExtensions(e => this.updateExtensions(e.reduce((result, { local, operation }) => {
                if (local && operation !== 4 /* InstallOperation.Migrate */) {
                    result.push(local);
                }
                return result;
            }, []), [], undefined, false)));
            this._register(event_1.Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error))(e => this.updateExtensions([], [e.identifier], e.server, false)));
            this._register(this.extensionManagementService.onDidChangeProfile(({ added, removed, server }) => {
                this.updateExtensions(added, removed.map(({ identifier }) => identifier), server, true);
            }));
        }
        updateExtensions(added, identifiers, server, isProfileSwitch) {
            if (added.length) {
                this._extensions.push(...added);
            }
            const removed = [];
            for (const identifier of identifiers) {
                const index = this._extensions.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier) && this.extensionManagementServerService.getExtensionManagementServer(e) === server);
                if (index !== -1) {
                    removed.push(...this._extensions.splice(index, 1));
                }
            }
            if (added.length || removed.length) {
                this._onDidChangeExtensions.fire({ added, removed, isProfileSwitch });
            }
        }
    };
    ExtensionsManager = __decorate([
        __param(0, extensionManagement_2.IWorkbenchExtensionManagementService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, log_1.ILogService)
    ], ExtensionsManager);
    (0, extensions_2.registerSingleton)(extensionManagement_2.IWorkbenchExtensionEnablementService, ExtensionEnablementService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRW5hYmxlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9icm93c2VyL2V4dGVuc2lvbkVuYWJsZW1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRCaEcsTUFBTSxNQUFNLEdBQUcsc0NBQXNDLENBQUM7SUFJL0MsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQVV6RCxZQUNrQixjQUErQixFQUNiLGdDQUFzRixFQUMvRixjQUF5RCxFQUNyRCxrQkFBaUUsRUFDbEUsMEJBQXVELEVBQzdELG9CQUE0RCxFQUNoRCxnQ0FBb0YsRUFDdkYsNkJBQThFLEVBQ2pGLDBCQUF3RSxFQUNsRixnQkFBb0QsRUFDakQsbUJBQTBELEVBQ2xFLFdBQXlCLEVBQ2Qsc0JBQWdFLEVBQ3ZELCtCQUFrRixFQUNyRiw0QkFBNEUsRUFDdEUsa0NBQXdGLEVBQ3RHLG9CQUEyQztZQUVsRSxLQUFLLEVBQUUsQ0FBQztZQWpCOEMscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUM5RSxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUV2RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQy9CLHFDQUFnQyxHQUFoQyxnQ0FBZ0MsQ0FBbUM7WUFDdEUsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUNoRSwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQ2pFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDaEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUV0QywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQ3RDLG9DQUErQixHQUEv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