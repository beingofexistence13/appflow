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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurations", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/configuration/common/configurationEditing", "vs/workbench/services/configuration/browser/configuration", "vs/base/common/performance", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/errorMessage", "vs/platform/workspace/common/workspaceTrust", "vs/base/common/arrays", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/assignment/common/assignmentService", "vs/base/common/types", "vs/nls", "vs/platform/policy/common/policy", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/common/configuration"], function (require, exports, uri_1, event_1, map_1, objects_1, lifecycle_1, async_1, jsonContributionRegistry_1, workspace_1, configurationModels_1, configuration_1, configurations_1, configurationModels_2, configuration_2, platform_1, configurationRegistry_1, workspaces_1, configurationEditing_1, configuration_3, performance_1, environmentService_1, contributions_1, lifecycle_2, errorMessage_1, workspaceTrust_1, arrays_1, extensions_1, assignmentService_1, types_1, nls_1, policy_1, jsonEditing_1, configuration_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceService = void 0;
    function getLocalUserConfigurationScopes(userDataProfile, hasRemote) {
        return (userDataProfile.isDefault || userDataProfile.useDefaultFlags?.settings)
            ? hasRemote ? configuration_2.LOCAL_MACHINE_SCOPES : undefined
            : hasRemote ? configuration_2.LOCAL_MACHINE_PROFILE_SCOPES : configuration_2.PROFILE_SCOPES;
    }
    class Workspace extends workspace_1.Workspace {
        constructor() {
            super(...arguments);
            this.initialized = false;
        }
    }
    class WorkspaceService extends lifecycle_1.Disposable {
        get restrictedSettings() { return this._restrictedSettings; }
        constructor({ remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.fileService = fileService;
            this.remoteAgentService = remoteAgentService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.initialized = false;
            this.applicationConfiguration = null;
            this.remoteUserConfiguration = null;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._onWillChangeWorkspaceFolders = this._register(new event_1.Emitter());
            this.onWillChangeWorkspaceFolders = this._onWillChangeWorkspaceFolders.event;
            this._onDidChangeWorkspaceFolders = this._register(new event_1.Emitter());
            this.onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
            this._onDidChangeWorkspaceName = this._register(new event_1.Emitter());
            this.onDidChangeWorkspaceName = this._onDidChangeWorkspaceName.event;
            this._onDidChangeWorkbenchState = this._register(new event_1.Emitter());
            this.onDidChangeWorkbenchState = this._onDidChangeWorkbenchState.event;
            this.isWorkspaceTrusted = true;
            this._restrictedSettings = { default: [] };
            this._onDidChangeRestrictedSettings = this._register(new event_1.Emitter());
            this.onDidChangeRestrictedSettings = this._onDidChangeRestrictedSettings.event;
            this.configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            this.initRemoteUserConfigurationBarrier = new async_1.Barrier();
            this.completeWorkspaceBarrier = new async_1.Barrier();
            this.defaultConfiguration = this._register(new configuration_3.DefaultConfiguration(configurationCache, environmentService));
            this.policyConfiguration = policyService instanceof policy_1.NullPolicyService ? new configurations_1.NullPolicyConfiguration() : this._register(new configurations_1.PolicyConfiguration(this.defaultConfiguration, policyService, logService));
            this.configurationCache = configurationCache;
            this._configuration = new configurationModels_2.Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, new configurationModels_1.ConfigurationModel(), new configurationModels_1.ConfigurationModel(), new configurationModels_1.ConfigurationModel(), new configurationModels_1.ConfigurationModel(), new map_1.ResourceMap(), new configurationModels_1.ConfigurationModel(), new map_1.ResourceMap(), this.workspace);
            this.applicationConfigurationDisposables = this._register(new lifecycle_1.DisposableStore());
            this.createApplicationConfiguration();
            this.localUserConfiguration = this._register(new configuration_3.UserConfiguration(userDataProfileService.currentProfile.settingsResource, userDataProfileService.currentProfile.tasksResource, { scopes: getLocalUserConfigurationScopes(userDataProfileService.currentProfile, !!remoteAuthority) }, fileService, uriIdentityService, logService));
            this.cachedFolderConfigs = new map_1.ResourceMap();
            this._register(this.localUserConfiguration.onDidChangeConfiguration(userConfiguration => this.onLocalUserConfigurationChanged(userConfiguration)));
            if (remoteAuthority) {
                const remoteUserConfiguration = this.remoteUserConfiguration = this._register(new configuration_3.RemoteUserConfiguration(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService));
                this._register(remoteUserConfiguration.onDidInitialize(remoteUserConfigurationModel => {
                    this._register(remoteUserConfiguration.onDidChangeConfiguration(remoteUserConfigurationModel => this.onRemoteUserConfigurationChanged(remoteUserConfigurationModel)));
                    this.onRemoteUserConfigurationChanged(remoteUserConfigurationModel);
                    this.initRemoteUserConfigurationBarrier.open();
                }));
            }
            else {
                this.initRemoteUserConfigurationBarrier.open();
            }
            this.workspaceConfiguration = this._register(new configuration_3.WorkspaceConfiguration(configurationCache, fileService, uriIdentityService, logService));
            this._register(this.workspaceConfiguration.onDidUpdateConfiguration(fromCache => {
                this.onWorkspaceConfigurationChanged(fromCache).then(() => {
                    this.workspace.initialized = this.workspaceConfiguration.initialized;
                    this.checkAndMarkWorkspaceComplete(fromCache);
                });
            }));
            this._register(this.defaultConfiguration.onDidChangeConfiguration(({ properties, defaults }) => this.onDefaultConfigurationChanged(defaults, properties)));
            this._register(this.policyConfiguration.onDidChangeConfiguration(configurationModel => this.onPolicyConfigurationChanged(configurationModel)));
            this._register(userDataProfileService.onDidChangeCurrentProfile(e => this.onUserDataProfileChanged(e)));
            this.workspaceEditingQueue = new async_1.Queue();
        }
        createApplicationConfiguration() {
            this.applicationConfigurationDisposables.clear();
            if (this.userDataProfileService.currentProfile.isDefault || this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
                this.applicationConfiguration = null;
            }
            else {
                this.applicationConfiguration = this.applicationConfigurationDisposables.add(this._register(new configuration_3.ApplicationConfiguration(this.userDataProfilesService, this.fileService, this.uriIdentityService)));
                this.applicationConfigurationDisposables.add(this.applicationConfiguration.onDidChangeConfiguration(configurationModel => this.onApplicationConfigurationChanged(configurationModel)));
            }
        }
        // Workspace Context Service Impl
        async getCompleteWorkspace() {
            await this.completeWorkspaceBarrier.wait();
            return this.getWorkspace();
        }
        getWorkspace() {
            return this.workspace;
        }
        getWorkbenchState() {
            // Workspace has configuration file
            if (this.workspace.configuration) {
                return 3 /* WorkbenchState.WORKSPACE */;
            }
            // Folder has single root
            if (this.workspace.folders.length === 1) {
                return 2 /* WorkbenchState.FOLDER */;
            }
            // Empty
            return 1 /* WorkbenchState.EMPTY */;
        }
        getWorkspaceFolder(resource) {
            return this.workspace.getFolder(resource);
        }
        addFolders(foldersToAdd, index) {
            return this.updateFolders(foldersToAdd, [], index);
        }
        removeFolders(foldersToRemove) {
            return this.updateFolders([], foldersToRemove);
        }
        async updateFolders(foldersToAdd, foldersToRemove, index) {
            return this.workspaceEditingQueue.queue(() => this.doUpdateFolders(foldersToAdd, foldersToRemove, index));
        }
        isInsideWorkspace(resource) {
            return !!this.getWorkspaceFolder(resource);
        }
        isCurrentWorkspace(workspaceIdOrFolder) {
            switch (this.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */: {
                    let folderUri = undefined;
                    if (uri_1.URI.isUri(workspaceIdOrFolder)) {
                        folderUri = workspaceIdOrFolder;
                    }
                    else if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdOrFolder)) {
                        folderUri = workspaceIdOrFolder.uri;
                    }
                    return uri_1.URI.isUri(folderUri) && this.uriIdentityService.extUri.isEqual(folderUri, this.workspace.folders[0].uri);
                }
                case 3 /* WorkbenchState.WORKSPACE */:
                    return (0, workspace_1.isWorkspaceIdentifier)(workspaceIdOrFolder) && this.workspace.id === workspaceIdOrFolder.id;
            }
            return false;
        }
        async doUpdateFolders(foldersToAdd, foldersToRemove, index) {
            if (this.getWorkbenchState() !== 3 /* WorkbenchState.WORKSPACE */) {
                return Promise.resolve(undefined); // we need a workspace to begin with
            }
            if (foldersToAdd.length + foldersToRemove.length === 0) {
                return Promise.resolve(undefined); // nothing to do
            }
            let foldersHaveChanged = false;
            // Remove first (if any)
            let currentWorkspaceFolders = this.getWorkspace().folders;
            let newStoredFolders = currentWorkspaceFolders.map(f => f.raw).filter((folder, index) => {
                if (!(0, workspaces_1.isStoredWorkspaceFolder)(folder)) {
                    return true; // keep entries which are unrelated
                }
                return !this.contains(foldersToRemove, currentWorkspaceFolders[index].uri); // keep entries which are unrelated
            });
            foldersHaveChanged = currentWorkspaceFolders.length !== newStoredFolders.length;
            // Add afterwards (if any)
            if (foldersToAdd.length) {
                // Recompute current workspace folders if we have folders to add
                const workspaceConfigPath = this.getWorkspace().configuration;
                const workspaceConfigFolder = this.uriIdentityService.extUri.dirname(workspaceConfigPath);
                currentWorkspaceFolders = (0, workspaces_1.toWorkspaceFolders)(newStoredFolders, workspaceConfigPath, this.uriIdentityService.extUri);
                const currentWorkspaceFolderUris = currentWorkspaceFolders.map(folder => folder.uri);
                const storedFoldersToAdd = [];
                for (const folderToAdd of foldersToAdd) {
                    const folderURI = folderToAdd.uri;
                    if (this.contains(currentWorkspaceFolderUris, folderURI)) {
                        continue; // already existing
                    }
                    try {
                        const result = await this.fileService.stat(folderURI);
                        if (!result.isDirectory) {
                            continue;
                        }
                    }
                    catch (e) { /* Ignore */ }
                    storedFoldersToAdd.push((0, workspaces_1.getStoredWorkspaceFolder)(folderURI, false, folderToAdd.name, workspaceConfigFolder, this.uriIdentityService.extUri));
                }
                // Apply to array of newStoredFolders
                if (storedFoldersToAdd.length > 0) {
                    foldersHaveChanged = true;
                    if (typeof index === 'number' && index >= 0 && index < newStoredFolders.length) {
                        newStoredFolders = newStoredFolders.slice(0);
                        newStoredFolders.splice(index, 0, ...storedFoldersToAdd);
                    }
                    else {
                        newStoredFolders = [...newStoredFolders, ...storedFoldersToAdd];
                    }
                }
            }
            // Set folders if we recorded a change
            if (foldersHaveChanged) {
                return this.setFolders(newStoredFolders);
            }
            return Promise.resolve(undefined);
        }
        async setFolders(folders) {
            if (!this.instantiationService) {
                throw new Error('Cannot update workspace folders because workspace service is not yet ready to accept writes.');
            }
            await this.instantiationService.invokeFunction(accessor => this.workspaceConfiguration.setFolders(folders, accessor.get(jsonEditing_1.IJSONEditingService)));
            return this.onWorkspaceConfigurationChanged(false);
        }
        contains(resources, toCheck) {
            return resources.some(resource => this.uriIdentityService.extUri.isEqual(resource, toCheck));
        }
        // Workspace Configuration Service Impl
        getConfigurationData() {
            return this._configuration.toData();
        }
        getValue(arg1, arg2) {
            const section = typeof arg1 === 'string' ? arg1 : undefined;
            const overrides = (0, configuration_1.isConfigurationOverrides)(arg1) ? arg1 : (0, configuration_1.isConfigurationOverrides)(arg2) ? arg2 : undefined;
            return this._configuration.getValue(section, overrides);
        }
        async updateValue(key, value, arg3, arg4, options) {
            const overrides = (0, configuration_1.isConfigurationUpdateOverrides)(arg3) ? arg3
                : (0, configuration_1.isConfigurationOverrides)(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : undefined } : undefined;
            const target = overrides ? arg4 : arg3;
            const targets = target ? [target] : [];
            if (overrides?.overrideIdentifiers) {
                overrides.overrideIdentifiers = (0, arrays_1.distinct)(overrides.overrideIdentifiers);
                overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : undefined;
            }
            if (!targets.length) {
                if (overrides?.overrideIdentifiers && overrides.overrideIdentifiers.length > 1) {
                    throw new Error('Configuration Target is required while updating the value for multiple override identifiers');
                }
                const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : undefined });
                targets.push(...this.deriveConfigurationTargets(key, value, inspect));
                // Remove the setting, if the value is same as default value and is updated only in user target
                if ((0, objects_1.equals)(value, inspect.defaultValue) && targets.length === 1 && (targets[0] === 2 /* ConfigurationTarget.USER */ || targets[0] === 3 /* ConfigurationTarget.USER_LOCAL */)) {
                    value = undefined;
                }
            }
            await async_1.Promises.settled(targets.map(target => this.writeConfigurationValue(key, value, target, overrides, options)));
        }
        async reloadConfiguration(target) {
            if (target === undefined) {
                this.reloadDefaultConfiguration();
                const application = await this.reloadApplicationConfiguration(true);
                const { local, remote } = await this.reloadUserConfiguration();
                await this.reloadWorkspaceConfiguration();
                await this.loadConfiguration(application, local, remote, true);
                return;
            }
            if ((0, workspace_1.isWorkspaceFolder)(target)) {
                await this.reloadWorkspaceFolderConfiguration(target);
                return;
            }
            switch (target) {
                case 7 /* ConfigurationTarget.DEFAULT */:
                    this.reloadDefaultConfiguration();
                    return;
                case 2 /* ConfigurationTarget.USER */: {
                    const { local, remote } = await this.reloadUserConfiguration();
                    await this.loadConfiguration(this._configuration.applicationConfiguration, local, remote, true);
                    return;
                }
                case 3 /* ConfigurationTarget.USER_LOCAL */:
                    await this.reloadLocalUserConfiguration();
                    return;
                case 4 /* ConfigurationTarget.USER_REMOTE */:
                    await this.reloadRemoteUserConfiguration();
                    return;
                case 5 /* ConfigurationTarget.WORKSPACE */:
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    await this.reloadWorkspaceConfiguration();
                    return;
            }
        }
        hasCachedConfigurationDefaultsOverrides() {
            return this.defaultConfiguration.hasCachedConfigurationDefaultsOverrides();
        }
        inspect(key, overrides) {
            return this._configuration.inspect(key, overrides);
        }
        keys() {
            return this._configuration.keys();
        }
        async whenRemoteConfigurationLoaded() {
            await this.initRemoteUserConfigurationBarrier.wait();
        }
        /**
         * At present, all workspaces (empty, single-folder, multi-root) in local and remote
         * can be initialized without requiring extension host except following case:
         *
         * A multi root workspace with .code-workspace file that has to be resolved by an extension.
         * Because of readonly `rootPath` property in extension API we have to resolve multi root workspace
         * before extension host starts so that `rootPath` can be set to first folder.
         *
         * This restriction is lifted partially for web in `MainThreadWorkspace`.
         * In web, we start extension host with empty `rootPath` in this case.
         *
         * Related root path issue discussion is being tracked here - https://github.com/microsoft/vscode/issues/69335
         */
        async initialize(arg) {
            (0, performance_1.mark)('code/willInitWorkspaceService');
            const trigger = this.initialized;
            this.initialized = false;
            const workspace = await this.createWorkspace(arg);
            await this.updateWorkspaceAndInitializeConfiguration(workspace, trigger);
            this.checkAndMarkWorkspaceComplete(false);
            (0, performance_1.mark)('code/didInitWorkspaceService');
        }
        updateWorkspaceTrust(trusted) {
            if (this.isWorkspaceTrusted !== trusted) {
                this.isWorkspaceTrusted = trusted;
                const data = this._configuration.toData();
                const folderConfigurationModels = [];
                for (const folder of this.workspace.folders) {
                    const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                    let configurationModel;
                    if (folderConfiguration) {
                        configurationModel = folderConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted);
                        this._configuration.updateFolderConfiguration(folder.uri, configurationModel);
                    }
                    folderConfigurationModels.push(configurationModel);
                }
                if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    if (folderConfigurationModels[0]) {
                        this._configuration.updateWorkspaceConfiguration(folderConfigurationModels[0]);
                    }
                }
                else {
                    this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted));
                }
                this.updateRestrictedSettings();
                let keys = [];
                if (this.restrictedSettings.userLocal) {
                    keys.push(...this.restrictedSettings.userLocal);
                }
                if (this.restrictedSettings.userRemote) {
                    keys.push(...this.restrictedSettings.userRemote);
                }
                if (this.restrictedSettings.workspace) {
                    keys.push(...this.restrictedSettings.workspace);
                }
                this.restrictedSettings.workspaceFolder?.forEach((value) => keys.push(...value));
                keys = (0, arrays_1.distinct)(keys);
                if (keys.length) {
                    this.triggerConfigurationChange({ keys, overrides: [] }, { data, workspace: this.workspace }, 5 /* ConfigurationTarget.WORKSPACE */);
                }
            }
        }
        acquireInstantiationService(instantiationService) {
            this.instantiationService = instantiationService;
        }
        isSettingAppliedForAllProfiles(key) {
            if (this.configurationRegistry.getConfigurationProperties()[key]?.scope === 1 /* ConfigurationScope.APPLICATION */) {
                return true;
            }
            const allProfilesSettings = this.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) ?? [];
            return Array.isArray(allProfilesSettings) && allProfilesSettings.includes(key);
        }
        async createWorkspace(arg) {
            if ((0, workspace_1.isWorkspaceIdentifier)(arg)) {
                return this.createMultiFolderWorkspace(arg);
            }
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(arg)) {
                return this.createSingleFolderWorkspace(arg);
            }
            return this.createEmptyWorkspace(arg);
        }
        async createMultiFolderWorkspace(workspaceIdentifier) {
            await this.workspaceConfiguration.initialize({ id: workspaceIdentifier.id, configPath: workspaceIdentifier.configPath }, this.isWorkspaceTrusted);
            const workspaceConfigPath = workspaceIdentifier.configPath;
            const workspaceFolders = (0, workspaces_1.toWorkspaceFolders)(this.workspaceConfiguration.getFolders(), workspaceConfigPath, this.uriIdentityService.extUri);
            const workspaceId = workspaceIdentifier.id;
            const workspace = new Workspace(workspaceId, workspaceFolders, this.workspaceConfiguration.isTransient(), workspaceConfigPath, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
            workspace.initialized = this.workspaceConfiguration.initialized;
            return workspace;
        }
        createSingleFolderWorkspace(singleFolderWorkspaceIdentifier) {
            const workspace = new Workspace(singleFolderWorkspaceIdentifier.id, [(0, workspace_1.toWorkspaceFolder)(singleFolderWorkspaceIdentifier.uri)], false, null, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
            workspace.initialized = true;
            return workspace;
        }
        createEmptyWorkspace(emptyWorkspaceIdentifier) {
            const workspace = new Workspace(emptyWorkspaceIdentifier.id, [], false, null, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
            workspace.initialized = true;
            return Promise.resolve(workspace);
        }
        checkAndMarkWorkspaceComplete(fromCache) {
            if (!this.completeWorkspaceBarrier.isOpen() && this.workspace.initialized) {
                this.completeWorkspaceBarrier.open();
                this.validateWorkspaceFoldersAndReload(fromCache);
            }
        }
        async updateWorkspaceAndInitializeConfiguration(workspace, trigger) {
            const hasWorkspaceBefore = !!this.workspace;
            let previousState;
            let previousWorkspacePath;
            let previousFolders = [];
            if (hasWorkspaceBefore) {
                previousState = this.getWorkbenchState();
                previousWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : undefined;
                previousFolders = this.workspace.folders;
                this.workspace.update(workspace);
            }
            else {
                this.workspace = workspace;
            }
            await this.initializeConfiguration(trigger);
            // Trigger changes after configuration initialization so that configuration is up to date.
            if (hasWorkspaceBefore) {
                const newState = this.getWorkbenchState();
                if (previousState && newState !== previousState) {
                    this._onDidChangeWorkbenchState.fire(newState);
                }
                const newWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : undefined;
                if (previousWorkspacePath && newWorkspacePath !== previousWorkspacePath || newState !== previousState) {
                    this._onDidChangeWorkspaceName.fire();
                }
                const folderChanges = this.compareFolders(previousFolders, this.workspace.folders);
                if (folderChanges && (folderChanges.added.length || folderChanges.removed.length || folderChanges.changed.length)) {
                    await this.handleWillChangeWorkspaceFolders(folderChanges, false);
                    this._onDidChangeWorkspaceFolders.fire(folderChanges);
                }
            }
            if (!this.localUserConfiguration.hasTasksLoaded) {
                // Reload local user configuration again to load user tasks
                this._register((0, async_1.runWhenIdle)(() => this.reloadLocalUserConfiguration()));
            }
        }
        compareFolders(currentFolders, newFolders) {
            const result = { added: [], removed: [], changed: [] };
            result.added = newFolders.filter(newFolder => !currentFolders.some(currentFolder => newFolder.uri.toString() === currentFolder.uri.toString()));
            for (let currentIndex = 0; currentIndex < currentFolders.length; currentIndex++) {
                const currentFolder = currentFolders[currentIndex];
                let newIndex = 0;
                for (newIndex = 0; newIndex < newFolders.length && currentFolder.uri.toString() !== newFolders[newIndex].uri.toString(); newIndex++) { }
                if (newIndex < newFolders.length) {
                    if (currentIndex !== newIndex || currentFolder.name !== newFolders[newIndex].name) {
                        result.changed.push(currentFolder);
                    }
                }
                else {
                    result.removed.push(currentFolder);
                }
            }
            return result;
        }
        async initializeConfiguration(trigger) {
            await this.defaultConfiguration.initialize();
            const initPolicyConfigurationPromise = this.policyConfiguration.initialize();
            const initApplicationConfigurationPromise = this.applicationConfiguration ? this.applicationConfiguration.initialize() : Promise.resolve(new configurationModels_1.ConfigurationModel());
            const initUserConfiguration = async () => {
                (0, performance_1.mark)('code/willInitUserConfiguration');
                const result = await Promise.all([this.localUserConfiguration.initialize(), this.remoteUserConfiguration ? this.remoteUserConfiguration.initialize() : Promise.resolve(new configurationModels_1.ConfigurationModel())]);
                if (this.applicationConfiguration) {
                    const applicationConfigurationModel = await initApplicationConfigurationPromise;
                    result[0] = this.localUserConfiguration.reparse({ exclude: applicationConfigurationModel.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) });
                }
                (0, performance_1.mark)('code/didInitUserConfiguration');
                return result;
            };
            const [, application, [local, remote]] = await Promise.all([
                initPolicyConfigurationPromise,
                initApplicationConfigurationPromise,
                initUserConfiguration()
            ]);
            (0, performance_1.mark)('code/willInitWorkspaceConfiguration');
            await this.loadConfiguration(application, local, remote, trigger);
            (0, performance_1.mark)('code/didInitWorkspaceConfiguration');
        }
        reloadDefaultConfiguration() {
            this.onDefaultConfigurationChanged(this.defaultConfiguration.reload());
        }
        async reloadApplicationConfiguration(donotTrigger) {
            if (!this.applicationConfiguration) {
                return new configurationModels_1.ConfigurationModel();
            }
            const model = await this.applicationConfiguration.loadConfiguration();
            if (!donotTrigger) {
                this.onApplicationConfigurationChanged(model);
            }
            return model;
        }
        async reloadUserConfiguration() {
            const [local, remote] = await Promise.all([this.reloadLocalUserConfiguration(true), this.reloadRemoteUserConfiguration(true)]);
            return { local, remote };
        }
        async reloadLocalUserConfiguration(donotTrigger) {
            const model = await this.localUserConfiguration.reload();
            if (!donotTrigger) {
                this.onLocalUserConfigurationChanged(model);
            }
            return model;
        }
        async reloadRemoteUserConfiguration(donotTrigger) {
            if (this.remoteUserConfiguration) {
                const model = await this.remoteUserConfiguration.reload();
                if (!donotTrigger) {
                    this.onRemoteUserConfigurationChanged(model);
                }
                return model;
            }
            return new configurationModels_1.ConfigurationModel();
        }
        async reloadWorkspaceConfiguration() {
            const workbenchState = this.getWorkbenchState();
            if (workbenchState === 2 /* WorkbenchState.FOLDER */) {
                return this.onWorkspaceFolderConfigurationChanged(this.workspace.folders[0]);
            }
            if (workbenchState === 3 /* WorkbenchState.WORKSPACE */) {
                return this.workspaceConfiguration.reload().then(() => this.onWorkspaceConfigurationChanged(false));
            }
        }
        reloadWorkspaceFolderConfiguration(folder) {
            return this.onWorkspaceFolderConfigurationChanged(folder);
        }
        async loadConfiguration(applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, trigger) {
            // reset caches
            this.cachedFolderConfigs = new map_1.ResourceMap();
            const folders = this.workspace.folders;
            const folderConfigurations = await this.loadFolderConfigurations(folders);
            const workspaceConfiguration = this.getWorkspaceConfigurationModel(folderConfigurations);
            const folderConfigurationModels = new map_1.ResourceMap();
            folderConfigurations.forEach((folderConfiguration, index) => folderConfigurationModels.set(folders[index].uri, folderConfiguration));
            const currentConfiguration = this._configuration;
            this._configuration = new configurationModels_2.Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, workspaceConfiguration, folderConfigurationModels, new configurationModels_1.ConfigurationModel(), new map_1.ResourceMap(), this.workspace);
            this.initialized = true;
            if (trigger) {
                const change = this._configuration.compare(currentConfiguration);
                this.triggerConfigurationChange(change, { data: currentConfiguration.toData(), workspace: this.workspace }, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            this.updateRestrictedSettings();
        }
        getWorkspaceConfigurationModel(folderConfigurations) {
            switch (this.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */:
                    return folderConfigurations[0];
                case 3 /* WorkbenchState.WORKSPACE */:
                    return this.workspaceConfiguration.getConfiguration();
                default:
                    return new configurationModels_1.ConfigurationModel();
            }
        }
        onUserDataProfileChanged(e) {
            e.join((async () => {
                const promises = [];
                promises.push(this.localUserConfiguration.reset(e.profile.settingsResource, e.profile.tasksResource, { scopes: getLocalUserConfigurationScopes(e.profile, !!this.remoteUserConfiguration) }));
                if (e.previous.isDefault !== e.profile.isDefault
                    || !!e.previous.useDefaultFlags?.settings !== !!e.profile.useDefaultFlags?.settings) {
                    this.createApplicationConfiguration();
                    if (this.applicationConfiguration) {
                        promises.push(this.reloadApplicationConfiguration(true));
                    }
                }
                let [localUser, application] = await Promise.all(promises);
                application = application ?? this._configuration.applicationConfiguration;
                if (this.applicationConfiguration) {
                    localUser = this.localUserConfiguration.reparse({ exclude: application.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) });
                }
                await this.loadConfiguration(application, localUser, this._configuration.remoteUserConfiguration, true);
            })());
        }
        onDefaultConfigurationChanged(configurationModel, properties) {
            if (this.workspace) {
                const previousData = this._configuration.toData();
                const change = this._configuration.compareAndUpdateDefaultConfiguration(configurationModel, properties);
                if (this.applicationConfiguration) {
                    this._configuration.updateApplicationConfiguration(this.applicationConfiguration.reparse());
                }
                if (this.remoteUserConfiguration) {
                    this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse());
                    this._configuration.updateRemoteUserConfiguration(this.remoteUserConfiguration.reparse());
                }
                if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    const folderConfiguration = this.cachedFolderConfigs.get(this.workspace.folders[0].uri);
                    if (folderConfiguration) {
                        this._configuration.updateWorkspaceConfiguration(folderConfiguration.reparse());
                        this._configuration.updateFolderConfiguration(this.workspace.folders[0].uri, folderConfiguration.reparse());
                    }
                }
                else {
                    this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.reparseWorkspaceSettings());
                    for (const folder of this.workspace.folders) {
                        const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                        if (folderConfiguration) {
                            this._configuration.updateFolderConfiguration(folder.uri, folderConfiguration.reparse());
                        }
                    }
                }
                this.triggerConfigurationChange(change, { data: previousData, workspace: this.workspace }, 7 /* ConfigurationTarget.DEFAULT */);
                this.updateRestrictedSettings();
            }
        }
        onPolicyConfigurationChanged(policyConfiguration) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            const change = this._configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
            this.triggerConfigurationChange(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
        }
        onApplicationConfigurationChanged(applicationConfiguration) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            const previousAllProfilesSettings = this._configuration.applicationConfiguration.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) ?? [];
            const change = this._configuration.compareAndUpdateApplicationConfiguration(applicationConfiguration);
            const currentAllProfilesSettings = this.getValue(configuration_2.APPLY_ALL_PROFILES_SETTING) ?? [];
            const configurationProperties = this.configurationRegistry.getConfigurationProperties();
            const changedKeys = [];
            for (const changedKey of change.keys) {
                if (configurationProperties[changedKey]?.scope === 1 /* ConfigurationScope.APPLICATION */) {
                    changedKeys.push(changedKey);
                    if (changedKey === configuration_2.APPLY_ALL_PROFILES_SETTING) {
                        for (const previousAllProfileSetting of previousAllProfilesSettings) {
                            if (!currentAllProfilesSettings.includes(previousAllProfileSetting)) {
                                changedKeys.push(previousAllProfileSetting);
                            }
                        }
                        for (const currentAllProfileSetting of currentAllProfilesSettings) {
                            if (!previousAllProfilesSettings.includes(currentAllProfileSetting)) {
                                changedKeys.push(currentAllProfileSetting);
                            }
                        }
                    }
                }
                else if (currentAllProfilesSettings.includes(changedKey)) {
                    changedKeys.push(changedKey);
                }
            }
            change.keys = changedKeys;
            if (change.keys.includes(configuration_2.APPLY_ALL_PROFILES_SETTING)) {
                this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse({ exclude: currentAllProfilesSettings }));
            }
            this.triggerConfigurationChange(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        onLocalUserConfigurationChanged(userConfiguration) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            const change = this._configuration.compareAndUpdateLocalUserConfiguration(userConfiguration);
            this.triggerConfigurationChange(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        onRemoteUserConfigurationChanged(userConfiguration) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            const change = this._configuration.compareAndUpdateRemoteUserConfiguration(userConfiguration);
            this.triggerConfigurationChange(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        async onWorkspaceConfigurationChanged(fromCache) {
            if (this.workspace && this.workspace.configuration) {
                let newFolders = (0, workspaces_1.toWorkspaceFolders)(this.workspaceConfiguration.getFolders(), this.workspace.configuration, this.uriIdentityService.extUri);
                // Validate only if workspace is initialized
                if (this.workspace.initialized) {
                    const { added, removed, changed } = this.compareFolders(this.workspace.folders, newFolders);
                    /* If changed validate new folders */
                    if (added.length || removed.length || changed.length) {
                        newFolders = await this.toValidWorkspaceFolders(newFolders);
                    }
                    /* Otherwise use existing */
                    else {
                        newFolders = this.workspace.folders;
                    }
                }
                await this.updateWorkspaceConfiguration(newFolders, this.workspaceConfiguration.getConfiguration(), fromCache);
            }
        }
        updateRestrictedSettings() {
            const changed = [];
            const allProperties = this.configurationRegistry.getConfigurationProperties();
            const defaultRestrictedSettings = Object.keys(allProperties).filter(key => allProperties[key].restricted).sort((a, b) => a.localeCompare(b));
            const defaultDelta = (0, arrays_1.delta)(defaultRestrictedSettings, this._restrictedSettings.default, (a, b) => a.localeCompare(b));
            changed.push(...defaultDelta.added, ...defaultDelta.removed);
            const application = (this.applicationConfiguration?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
            const applicationDelta = (0, arrays_1.delta)(application, this._restrictedSettings.application || [], (a, b) => a.localeCompare(b));
            changed.push(...applicationDelta.added, ...applicationDelta.removed);
            const userLocal = this.localUserConfiguration.getRestrictedSettings().sort((a, b) => a.localeCompare(b));
            const userLocalDelta = (0, arrays_1.delta)(userLocal, this._restrictedSettings.userLocal || [], (a, b) => a.localeCompare(b));
            changed.push(...userLocalDelta.added, ...userLocalDelta.removed);
            const userRemote = (this.remoteUserConfiguration?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
            const userRemoteDelta = (0, arrays_1.delta)(userRemote, this._restrictedSettings.userRemote || [], (a, b) => a.localeCompare(b));
            changed.push(...userRemoteDelta.added, ...userRemoteDelta.removed);
            const workspaceFolderMap = new map_1.ResourceMap();
            for (const workspaceFolder of this.workspace.folders) {
                const cachedFolderConfig = this.cachedFolderConfigs.get(workspaceFolder.uri);
                const folderRestrictedSettings = (cachedFolderConfig?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
                if (folderRestrictedSettings.length) {
                    workspaceFolderMap.set(workspaceFolder.uri, folderRestrictedSettings);
                }
                const previous = this._restrictedSettings.workspaceFolder?.get(workspaceFolder.uri) || [];
                const workspaceFolderDelta = (0, arrays_1.delta)(folderRestrictedSettings, previous, (a, b) => a.localeCompare(b));
                changed.push(...workspaceFolderDelta.added, ...workspaceFolderDelta.removed);
            }
            const workspace = this.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? this.workspaceConfiguration.getRestrictedSettings().sort((a, b) => a.localeCompare(b))
                : this.workspace.folders[0] ? (workspaceFolderMap.get(this.workspace.folders[0].uri) || []) : [];
            const workspaceDelta = (0, arrays_1.delta)(workspace, this._restrictedSettings.workspace || [], (a, b) => a.localeCompare(b));
            changed.push(...workspaceDelta.added, ...workspaceDelta.removed);
            if (changed.length) {
                this._restrictedSettings = {
                    default: defaultRestrictedSettings,
                    application: application.length ? application : undefined,
                    userLocal: userLocal.length ? userLocal : undefined,
                    userRemote: userRemote.length ? userRemote : undefined,
                    workspace: workspace.length ? workspace : undefined,
                    workspaceFolder: workspaceFolderMap.size ? workspaceFolderMap : undefined,
                };
                this._onDidChangeRestrictedSettings.fire(this.restrictedSettings);
            }
        }
        async updateWorkspaceConfiguration(workspaceFolders, configuration, fromCache) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            const change = this._configuration.compareAndUpdateWorkspaceConfiguration(configuration);
            const changes = this.compareFolders(this.workspace.folders, workspaceFolders);
            if (changes.added.length || changes.removed.length || changes.changed.length) {
                this.workspace.folders = workspaceFolders;
                const change = await this.onFoldersChanged();
                await this.handleWillChangeWorkspaceFolders(changes, fromCache);
                this.triggerConfigurationChange(change, previous, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
                this._onDidChangeWorkspaceFolders.fire(changes);
            }
            else {
                this.triggerConfigurationChange(change, previous, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            this.updateRestrictedSettings();
        }
        async handleWillChangeWorkspaceFolders(changes, fromCache) {
            const joiners = [];
            this._onWillChangeWorkspaceFolders.fire({
                join(updateWorkspaceTrustStatePromise) {
                    joiners.push(updateWorkspaceTrustStatePromise);
                },
                changes,
                fromCache
            });
            try {
                await async_1.Promises.settled(joiners);
            }
            catch (error) { /* Ignore */ }
        }
        async onWorkspaceFolderConfigurationChanged(folder) {
            const [folderConfiguration] = await this.loadFolderConfigurations([folder]);
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            const folderConfigurationChange = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration);
            if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceConfigurationChange = this._configuration.compareAndUpdateWorkspaceConfiguration(folderConfiguration);
                this.triggerConfigurationChange((0, configurationModels_1.mergeChanges)(folderConfigurationChange, workspaceConfigurationChange), previous, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            else {
                this.triggerConfigurationChange(folderConfigurationChange, previous, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            }
            this.updateRestrictedSettings();
        }
        async onFoldersChanged() {
            const changes = [];
            // Remove the configurations of deleted folders
            for (const key of this.cachedFolderConfigs.keys()) {
                if (!this.workspace.folders.filter(folder => folder.uri.toString() === key.toString())[0]) {
                    const folderConfiguration = this.cachedFolderConfigs.get(key);
                    folderConfiguration.dispose();
                    this.cachedFolderConfigs.delete(key);
                    changes.push(this._configuration.compareAndDeleteFolderConfiguration(key));
                }
            }
            const toInitialize = this.workspace.folders.filter(folder => !this.cachedFolderConfigs.has(folder.uri));
            if (toInitialize.length) {
                const folderConfigurations = await this.loadFolderConfigurations(toInitialize);
                folderConfigurations.forEach((folderConfiguration, index) => {
                    changes.push(this._configuration.compareAndUpdateFolderConfiguration(toInitialize[index].uri, folderConfiguration));
                });
            }
            return (0, configurationModels_1.mergeChanges)(...changes);
        }
        loadFolderConfigurations(folders) {
            return Promise.all([...folders.map(folder => {
                    let folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                    if (!folderConfiguration) {
                        folderConfiguration = new configuration_3.FolderConfiguration(!this.initialized, folder, configuration_2.FOLDER_CONFIG_FOLDER_NAME, this.getWorkbenchState(), this.isWorkspaceTrusted, this.fileService, this.uriIdentityService, this.logService, this.configurationCache);
                        this._register(folderConfiguration.onDidChange(() => this.onWorkspaceFolderConfigurationChanged(folder)));
                        this.cachedFolderConfigs.set(folder.uri, this._register(folderConfiguration));
                    }
                    return folderConfiguration.loadConfiguration();
                })]);
        }
        async validateWorkspaceFoldersAndReload(fromCache) {
            const validWorkspaceFolders = await this.toValidWorkspaceFolders(this.workspace.folders);
            const { removed } = this.compareFolders(this.workspace.folders, validWorkspaceFolders);
            if (removed.length) {
                await this.updateWorkspaceConfiguration(validWorkspaceFolders, this.workspaceConfiguration.getConfiguration(), fromCache);
            }
        }
        // Filter out workspace folders which are files (not directories)
        // Workspace folders those cannot be resolved are not filtered because they are handled by the Explorer.
        async toValidWorkspaceFolders(workspaceFolders) {
            const validWorkspaceFolders = [];
            for (const workspaceFolder of workspaceFolders) {
                try {
                    const result = await this.fileService.stat(workspaceFolder.uri);
                    if (!result.isDirectory) {
                        continue;
                    }
                }
                catch (e) {
                    this.logService.warn(`Ignoring the error while validating workspace folder ${workspaceFolder.uri.toString()} - ${(0, errorMessage_1.toErrorMessage)(e)}`);
                }
                validWorkspaceFolders.push(workspaceFolder);
            }
            return validWorkspaceFolders;
        }
        async writeConfigurationValue(key, value, target, overrides, options) {
            if (!this.instantiationService) {
                throw new Error('Cannot write configuration because the configuration service is not yet ready to accept writes.');
            }
            if (target === 7 /* ConfigurationTarget.DEFAULT */) {
                throw new Error('Invalid configuration target');
            }
            if (target === 8 /* ConfigurationTarget.MEMORY */) {
                const previous = { data: this._configuration.toData(), workspace: this.workspace };
                this._configuration.updateValue(key, value, overrides);
                this.triggerConfigurationChange({ keys: overrides?.overrideIdentifiers?.length ? [(0, configurationRegistry_1.keyFromOverrideIdentifiers)(overrides.overrideIdentifiers), key] : [key], overrides: overrides?.overrideIdentifiers?.length ? overrides.overrideIdentifiers.map(overrideIdentifier => ([overrideIdentifier, [key]])) : [] }, previous, target);
                return;
            }
            const editableConfigurationTarget = this.toEditableConfigurationTarget(target, key);
            if (!editableConfigurationTarget) {
                throw new Error('Invalid configuration target');
            }
            if (editableConfigurationTarget === 2 /* EditableConfigurationTarget.USER_REMOTE */ && !this.remoteUserConfiguration) {
                throw new Error('Invalid configuration target');
            }
            // Use same instance of ConfigurationEditing to make sure all writes go through the same queue
            this.configurationEditing = this.configurationEditing ?? this.instantiationService.createInstance(configurationEditing_1.ConfigurationEditing, (await this.remoteAgentService.getEnvironment())?.settingsPath ?? null);
            await this.configurationEditing.writeConfiguration(editableConfigurationTarget, { key, value }, { scopes: overrides, ...options });
            switch (editableConfigurationTarget) {
                case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                    if (this.applicationConfiguration && this.isSettingAppliedForAllProfiles(key)) {
                        await this.reloadApplicationConfiguration();
                    }
                    else {
                        await this.reloadLocalUserConfiguration();
                    }
                    return;
                case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                    return this.reloadRemoteUserConfiguration().then(() => undefined);
                case 3 /* EditableConfigurationTarget.WORKSPACE */:
                    return this.reloadWorkspaceConfiguration();
                case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                    const workspaceFolder = overrides && overrides.resource ? this.workspace.getFolder(overrides.resource) : null;
                    if (workspaceFolder) {
                        return this.reloadWorkspaceFolderConfiguration(workspaceFolder);
                    }
                }
            }
        }
        deriveConfigurationTargets(key, value, inspect) {
            if ((0, objects_1.equals)(value, inspect.value)) {
                return [];
            }
            const definedTargets = [];
            if (inspect.workspaceFolderValue !== undefined) {
                definedTargets.push(6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            }
            if (inspect.workspaceValue !== undefined) {
                definedTargets.push(5 /* ConfigurationTarget.WORKSPACE */);
            }
            if (inspect.userRemoteValue !== undefined) {
                definedTargets.push(4 /* ConfigurationTarget.USER_REMOTE */);
            }
            if (inspect.userLocalValue !== undefined) {
                definedTargets.push(3 /* ConfigurationTarget.USER_LOCAL */);
            }
            if (value === undefined) {
                // Remove the setting in all defined targets
                return definedTargets;
            }
            return [definedTargets[0] || 2 /* ConfigurationTarget.USER */];
        }
        triggerConfigurationChange(change, previous, target) {
            if (change.keys.length) {
                if (target !== 7 /* ConfigurationTarget.DEFAULT */) {
                    this.logService.debug(`Configuration keys changed in ${(0, configuration_1.ConfigurationTargetToString)(target)} target`, ...change.keys);
                }
                const configurationChangeEvent = new configurationModels_1.ConfigurationChangeEvent(change, previous, this._configuration, this.workspace);
                configurationChangeEvent.source = target;
                configurationChangeEvent.sourceConfig = this.getTargetConfiguration(target);
                this._onDidChangeConfiguration.fire(configurationChangeEvent);
            }
        }
        getTargetConfiguration(target) {
            switch (target) {
                case 7 /* ConfigurationTarget.DEFAULT */:
                    return this._configuration.defaults.contents;
                case 2 /* ConfigurationTarget.USER */:
                    return this._configuration.userConfiguration.contents;
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this._configuration.workspaceConfiguration.contents;
            }
            return {};
        }
        toEditableConfigurationTarget(target, key) {
            if (target === 2 /* ConfigurationTarget.USER */) {
                if (this.remoteUserConfiguration) {
                    const scope = this.configurationRegistry.getConfigurationProperties()[key]?.scope;
                    if (scope === 2 /* ConfigurationScope.MACHINE */ || scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */) {
                        return 2 /* EditableConfigurationTarget.USER_REMOTE */;
                    }
                    if (this.inspect(key).userRemoteValue !== undefined) {
                        return 2 /* EditableConfigurationTarget.USER_REMOTE */;
                    }
                }
                return 1 /* EditableConfigurationTarget.USER_LOCAL */;
            }
            if (target === 3 /* ConfigurationTarget.USER_LOCAL */) {
                return 1 /* EditableConfigurationTarget.USER_LOCAL */;
            }
            if (target === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return 2 /* EditableConfigurationTarget.USER_REMOTE */;
            }
            if (target === 5 /* ConfigurationTarget.WORKSPACE */) {
                return 3 /* EditableConfigurationTarget.WORKSPACE */;
            }
            if (target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
                return 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */;
            }
            return null;
        }
    }
    exports.WorkspaceService = WorkspaceService;
    let RegisterConfigurationSchemasContribution = class RegisterConfigurationSchemasContribution extends lifecycle_1.Disposable {
        constructor(workspaceContextService, environmentService, workspaceTrustManagementService, extensionService, lifecycleService) {
            super();
            this.workspaceContextService = workspaceContextService;
            this.environmentService = environmentService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            extensionService.whenInstalledExtensionsRegistered().then(() => {
                this.registerConfigurationSchemas();
                const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
                const delayer = this._register(new async_1.Delayer(50));
                this._register(event_1.Event.any(configurationRegistry.onDidUpdateConfiguration, configurationRegistry.onDidSchemaChange, workspaceTrustManagementService.onDidChangeTrust)(() => delayer.trigger(() => this.registerConfigurationSchemas(), lifecycleService.phase === 4 /* LifecyclePhase.Eventually */ ? undefined : 2500 /* delay longer in early phases */)));
            });
        }
        registerConfigurationSchemas() {
            const allSettingsSchema = {
                properties: configurationRegistry_1.allSettings.properties,
                patternProperties: configurationRegistry_1.allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const userSettingsSchema = this.environmentService.remoteAuthority ?
                {
                    properties: Object.assign({}, configurationRegistry_1.applicationSettings.properties, configurationRegistry_1.windowSettings.properties, configurationRegistry_1.resourceSettings.properties),
                    patternProperties: configurationRegistry_1.allSettings.patternProperties,
                    additionalProperties: true,
                    allowTrailingCommas: true,
                    allowComments: true
                }
                : allSettingsSchema;
            const profileSettingsSchema = {
                properties: Object.assign({}, configurationRegistry_1.machineSettings.properties, configurationRegistry_1.machineOverridableSettings.properties, configurationRegistry_1.windowSettings.properties, configurationRegistry_1.resourceSettings.properties),
                patternProperties: configurationRegistry_1.allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const machineSettingsSchema = {
                properties: Object.assign({}, configurationRegistry_1.machineSettings.properties, configurationRegistry_1.machineOverridableSettings.properties, configurationRegistry_1.windowSettings.properties, configurationRegistry_1.resourceSettings.properties),
                patternProperties: configurationRegistry_1.allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const workspaceSettingsSchema = {
                properties: Object.assign({}, this.checkAndFilterPropertiesRequiringTrust(configurationRegistry_1.machineOverridableSettings.properties), this.checkAndFilterPropertiesRequiringTrust(configurationRegistry_1.windowSettings.properties), this.checkAndFilterPropertiesRequiringTrust(configurationRegistry_1.resourceSettings.properties)),
                patternProperties: configurationRegistry_1.allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const defaultSettingsSchema = {
                properties: Object.keys(configurationRegistry_1.allSettings.properties).reduce((result, key) => {
                    result[key] = Object.assign({ deprecationMessage: undefined }, configurationRegistry_1.allSettings.properties[key]);
                    return result;
                }, {}),
                patternProperties: Object.keys(configurationRegistry_1.allSettings.patternProperties).reduce((result, key) => {
                    result[key] = Object.assign({ deprecationMessage: undefined }, configurationRegistry_1.allSettings.patternProperties[key]);
                    return result;
                }, {}),
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const folderSettingsSchema = 3 /* WorkbenchState.WORKSPACE */ === this.workspaceContextService.getWorkbenchState() ?
                {
                    properties: Object.assign({}, this.checkAndFilterPropertiesRequiringTrust(configurationRegistry_1.machineOverridableSettings.properties), this.checkAndFilterPropertiesRequiringTrust(configurationRegistry_1.resourceSettings.properties)),
                    patternProperties: configurationRegistry_1.allSettings.patternProperties,
                    additionalProperties: true,
                    allowTrailingCommas: true,
                    allowComments: true
                } : workspaceSettingsSchema;
            const configDefaultsSchema = {
                type: 'object',
                description: (0, nls_1.localize)('configurationDefaults.description', 'Contribute defaults for configurations'),
                properties: Object.assign({}, configurationRegistry_1.machineOverridableSettings.properties, configurationRegistry_1.windowSettings.properties, configurationRegistry_1.resourceSettings.properties),
                patternProperties: {
                    [configurationRegistry_1.OVERRIDE_PROPERTY_PATTERN]: {
                        type: 'object',
                        default: {},
                        $ref: configurationRegistry_1.resourceLanguageSettingsSchemaId,
                    }
                },
                additionalProperties: false
            };
            this.registerSchemas({
                defaultSettingsSchema,
                userSettingsSchema,
                profileSettingsSchema,
                machineSettingsSchema,
                workspaceSettingsSchema,
                folderSettingsSchema,
                configDefaultsSchema,
            });
        }
        registerSchemas(schemas) {
            const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            jsonRegistry.registerSchema(configuration_2.defaultSettingsSchemaId, schemas.defaultSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.userSettingsSchemaId, schemas.userSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.profileSettingsSchemaId, schemas.profileSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.machineSettingsSchemaId, schemas.machineSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.workspaceSettingsSchemaId, schemas.workspaceSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.folderSettingsSchemaId, schemas.folderSettingsSchema);
            jsonRegistry.registerSchema(configurationRegistry_1.configurationDefaultsSchemaId, schemas.configDefaultsSchema);
        }
        checkAndFilterPropertiesRequiringTrust(properties) {
            if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                return properties;
            }
            const result = {};
            Object.entries(properties).forEach(([key, value]) => {
                if (!value.restricted) {
                    result[key] = value;
                }
            });
            return result;
        }
    };
    RegisterConfigurationSchemasContribution = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, extensions_1.IExtensionService),
        __param(4, lifecycle_2.ILifecycleService)
    ], RegisterConfigurationSchemasContribution);
    let ResetConfigurationDefaultsOverridesCache = class ResetConfigurationDefaultsOverridesCache extends lifecycle_1.Disposable {
        constructor(configurationService, extensionService) {
            super();
            if (configurationService.hasCachedConfigurationDefaultsOverrides()) {
                extensionService.whenInstalledExtensionsRegistered().then(() => configurationService.reloadConfiguration(7 /* ConfigurationTarget.DEFAULT */));
            }
        }
    };
    ResetConfigurationDefaultsOverridesCache = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionService)
    ], ResetConfigurationDefaultsOverridesCache);
    let UpdateExperimentalSettingsDefaults = class UpdateExperimentalSettingsDefaults extends lifecycle_1.Disposable {
        constructor(workbenchAssignmentService) {
            super();
            this.workbenchAssignmentService = workbenchAssignmentService;
            this.processedExperimentalSettings = new Set();
            this.configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            this.processExperimentalSettings(Object.keys(this.configurationRegistry.getConfigurationProperties()));
            this._register(this.configurationRegistry.onDidUpdateConfiguration(({ properties }) => this.processExperimentalSettings(properties)));
        }
        async processExperimentalSettings(properties) {
            const overrides = {};
            const allProperties = this.configurationRegistry.getConfigurationProperties();
            for (const property of properties) {
                const schema = allProperties[property];
                if (!schema?.tags?.includes('experimental')) {
                    continue;
                }
                if (this.processedExperimentalSettings.has(property)) {
                    continue;
                }
                this.processedExperimentalSettings.add(property);
                try {
                    const value = await this.workbenchAssignmentService.getTreatment(`config.${property}`);
                    if (!(0, types_1.isUndefined)(value) && !(0, objects_1.equals)(value, schema.default)) {
                        overrides[property] = value;
                    }
                }
                catch (error) { /*ignore */ }
            }
            if (Object.keys(overrides).length) {
                this.configurationRegistry.registerDefaultConfigurations([{ overrides, source: (0, nls_1.localize)('experimental', "Experiments") }]);
            }
        }
    };
    UpdateExperimentalSettingsDefaults = __decorate([
        __param(0, assignmentService_1.IWorkbenchAssignmentService)
    ], UpdateExperimentalSettingsDefaults);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(RegisterConfigurationSchemasContribution, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ResetConfigurationDefaultsOverridesCache, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(UpdateExperimentalSettingsDefaults, 3 /* LifecyclePhase.Restored */);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_4.workbenchConfigurationNodeBase,
        properties: {
            [configuration_2.APPLY_ALL_PROFILES_SETTING]: {
                'type': 'array',
                description: (0, nls_1.localize)('setting description', "Configure settings to be applied for all profiles."),
                'default': [],
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                additionalProperties: true,
                uniqueItems: true,
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvY29uZmlndXJhdGlvbi9icm93c2VyL2NvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZDaEcsU0FBUywrQkFBK0IsQ0FBQyxlQUFpQyxFQUFFLFNBQWtCO1FBQzdGLE9BQU8sQ0FBQyxlQUFlLENBQUMsU0FBUyxJQUFJLGVBQWUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO1lBQzlFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG9DQUFvQixDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzlDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDRDQUE0QixDQUFDLENBQUMsQ0FBQyw4QkFBYyxDQUFDO0lBQzlELENBQUM7SUFFRCxNQUFNLFNBQVUsU0FBUSxxQkFBYTtRQUFyQzs7WUFDQyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM5QixDQUFDO0tBQUE7SUFFRCxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO1FBc0MvQyxJQUFJLGtCQUFrQixLQUFLLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQVM3RCxZQUNDLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUF5RSxFQUM5RyxrQkFBdUQsRUFDdEMsc0JBQStDLEVBQy9DLHVCQUFpRCxFQUNqRCxXQUF5QixFQUN6QixrQkFBdUMsRUFDdkMsa0JBQXVDLEVBQ3ZDLFVBQXVCLEVBQ3hDLGFBQTZCO1lBRTdCLEtBQUssRUFBRSxDQUFDO1lBUlMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMvQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ2pELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3pCLHVCQUFr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