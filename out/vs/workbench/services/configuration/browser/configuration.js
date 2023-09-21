/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/files/common/files", "vs/platform/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/objects", "vs/base/common/hash", "vs/base/common/resources", "vs/platform/registry/common/platform", "vs/base/common/types", "vs/platform/configuration/common/configurations"], function (require, exports, event_1, errors, lifecycle_1, async_1, files_1, configurationModels_1, configurationModels_2, configuration_1, configurationRegistry_1, objects_1, hash_1, resources_1, platform_1, types_1, configurations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FolderConfiguration = exports.WorkspaceConfiguration = exports.RemoteUserConfiguration = exports.UserConfiguration = exports.ApplicationConfiguration = exports.DefaultConfiguration = void 0;
    class DefaultConfiguration extends configurations_1.DefaultConfiguration {
        static { this.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY = 'DefaultOverridesCacheExists'; }
        constructor(configurationCache, environmentService) {
            super();
            this.configurationCache = configurationCache;
            this.configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            this.cachedConfigurationDefaultsOverrides = {};
            this.cacheKey = { type: 'defaults', key: 'configurationDefaultsOverrides' };
            this.updateCache = false;
            if (environmentService.options?.configurationDefaults) {
                this.configurationRegistry.registerDefaultConfigurations([{ overrides: environmentService.options.configurationDefaults }]);
            }
        }
        getConfigurationDefaultOverrides() {
            return this.cachedConfigurationDefaultsOverrides;
        }
        async initialize() {
            await this.initializeCachedConfigurationDefaultsOverrides();
            return super.initialize();
        }
        reload() {
            this.updateCache = true;
            this.cachedConfigurationDefaultsOverrides = {};
            this.updateCachedConfigurationDefaultsOverrides();
            return super.reload();
        }
        hasCachedConfigurationDefaultsOverrides() {
            return !(0, types_1.isEmptyObject)(this.cachedConfigurationDefaultsOverrides);
        }
        initializeCachedConfigurationDefaultsOverrides() {
            if (!this.initiaizeCachedConfigurationDefaultsOverridesPromise) {
                this.initiaizeCachedConfigurationDefaultsOverridesPromise = (async () => {
                    try {
                        // Read only when the cache exists
                        if (window.localStorage.getItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY)) {
                            const content = await this.configurationCache.read(this.cacheKey);
                            if (content) {
                                this.cachedConfigurationDefaultsOverrides = JSON.parse(content);
                            }
                        }
                    }
                    catch (error) { /* ignore */ }
                    this.cachedConfigurationDefaultsOverrides = (0, types_1.isObject)(this.cachedConfigurationDefaultsOverrides) ? this.cachedConfigurationDefaultsOverrides : {};
                })();
            }
            return this.initiaizeCachedConfigurationDefaultsOverridesPromise;
        }
        onDidUpdateConfiguration(properties, defaultsOverrides) {
            super.onDidUpdateConfiguration(properties, defaultsOverrides);
            if (defaultsOverrides) {
                this.updateCachedConfigurationDefaultsOverrides();
            }
        }
        async updateCachedConfigurationDefaultsOverrides() {
            if (!this.updateCache) {
                return;
            }
            const cachedConfigurationDefaultsOverrides = {};
            const configurationDefaultsOverrides = this.configurationRegistry.getConfigurationDefaultsOverrides();
            for (const [key, value] of configurationDefaultsOverrides) {
                if (!configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key) && value.value !== undefined) {
                    cachedConfigurationDefaultsOverrides[key] = value.value;
                }
            }
            try {
                if (Object.keys(cachedConfigurationDefaultsOverrides).length) {
                    window.localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
                    await this.configurationCache.write(this.cacheKey, JSON.stringify(cachedConfigurationDefaultsOverrides));
                }
                else {
                    window.localStorage.removeItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY);
                    await this.configurationCache.remove(this.cacheKey);
                }
            }
            catch (error) { /* Ignore error */ }
        }
    }
    exports.DefaultConfiguration = DefaultConfiguration;
    class ApplicationConfiguration extends configurationModels_1.UserSettings {
        constructor(userDataProfilesService, fileService, uriIdentityService) {
            super(userDataProfilesService.defaultProfile.settingsResource, { scopes: [1 /* ConfigurationScope.APPLICATION */] }, uriIdentityService.extUri, fileService);
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._register(this.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.loadConfiguration().then(configurationModel => this._onDidChangeConfiguration.fire(configurationModel)), 50));
        }
        async initialize() {
            return this.loadConfiguration();
        }
        async loadConfiguration() {
            const model = await super.loadConfiguration();
            const value = model.getValue(configuration_1.APPLY_ALL_PROFILES_SETTING);
            const allProfilesSettings = Array.isArray(value) ? value : [];
            return this.parseOptions.include || allProfilesSettings.length
                ? this.reparse({ ...this.parseOptions, include: allProfilesSettings })
                : model;
        }
    }
    exports.ApplicationConfiguration = ApplicationConfiguration;
    class UserConfiguration extends lifecycle_1.Disposable {
        get hasTasksLoaded() { return this.userConfiguration.value instanceof FileServiceBasedConfiguration; }
        constructor(settingsResource, tasksResource, configurationParseOptions, fileService, uriIdentityService, logService) {
            super();
            this.settingsResource = settingsResource;
            this.tasksResource = tasksResource;
            this.configurationParseOptions = configurationParseOptions;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this.userConfiguration = this._register(new lifecycle_1.MutableDisposable());
            this.userConfigurationChangeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.userConfiguration.value = new configurationModels_1.UserSettings(settingsResource, this.configurationParseOptions, uriIdentityService.extUri, this.fileService);
            this.userConfigurationChangeDisposable.value = this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule());
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.userConfiguration.value.loadConfiguration().then(configurationModel => this._onDidChangeConfiguration.fire(configurationModel)), 50));
        }
        async reset(settingsResource, tasksResource, configurationParseOptions) {
            this.settingsResource = settingsResource;
            this.tasksResource = tasksResource;
            this.configurationParseOptions = configurationParseOptions;
            const folder = this.uriIdentityService.extUri.dirname(this.settingsResource);
            const standAloneConfigurationResources = this.tasksResource ? [[configuration_1.TASKS_CONFIGURATION_KEY, this.tasksResource]] : [];
            const fileServiceBasedConfiguration = new FileServiceBasedConfiguration(folder.toString(), this.settingsResource, standAloneConfigurationResources, this.configurationParseOptions, this.fileService, this.uriIdentityService, this.logService);
            const configurationModel = await fileServiceBasedConfiguration.loadConfiguration();
            this.userConfiguration.value = fileServiceBasedConfiguration;
            // Check for value because userConfiguration might have been disposed.
            if (this.userConfigurationChangeDisposable.value) {
                this.userConfigurationChangeDisposable.value = this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule());
            }
            return configurationModel;
        }
        async initialize() {
            return this.userConfiguration.value.loadConfiguration();
        }
        async reload() {
            if (this.hasTasksLoaded) {
                return this.userConfiguration.value.loadConfiguration();
            }
            return this.reset(this.settingsResource, this.tasksResource, this.configurationParseOptions);
        }
        reparse(parseOptions) {
            this.configurationParseOptions = { ...this.configurationParseOptions, ...parseOptions };
            return this.userConfiguration.value.reparse(this.configurationParseOptions);
        }
        getRestrictedSettings() {
            return this.userConfiguration.value.getRestrictedSettings();
        }
    }
    exports.UserConfiguration = UserConfiguration;
    class FileServiceBasedConfiguration extends lifecycle_1.Disposable {
        constructor(name, settingsResource, standAloneConfigurationResources, configurationParseOptions, fileService, uriIdentityService, logService) {
            super();
            this.settingsResource = settingsResource;
            this.standAloneConfigurationResources = standAloneConfigurationResources;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.allResources = [this.settingsResource, ...this.standAloneConfigurationResources.map(([, resource]) => resource)];
            this._register((0, lifecycle_1.combinedDisposable)(...this.allResources.map(resource => (0, lifecycle_1.combinedDisposable)(this.fileService.watch(uriIdentityService.extUri.dirname(resource)), 
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.fileService.watch(resource)))));
            this._folderSettingsModelParser = new configurationModels_1.ConfigurationModelParser(name);
            this._folderSettingsParseOptions = configurationParseOptions;
            this._standAloneConfigurations = [];
            this._cache = new configurationModels_1.ConfigurationModel();
            this._register(event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(this.fileService.onDidFilesChange, e => this.handleFileChangesEvent(e)), event_1.Event.filter(this.fileService.onDidRunOperation, e => this.handleFileOperationEvent(e))), () => undefined, 100)(() => this._onDidChange.fire()));
        }
        async resolveContents() {
            const resolveContents = async (resources) => {
                return Promise.all(resources.map(async (resource) => {
                    try {
                        const content = await this.fileService.readFile(resource, { atomic: true });
                        return content.value.toString();
                    }
                    catch (error) {
                        this.logService.trace(`Error while resolving configuration file '${resource.toString()}': ${errors.getErrorMessage(error)}`);
                        if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */
                            && error.fileOperationResult !== 9 /* FileOperationResult.FILE_NOT_DIRECTORY */) {
                            this.logService.error(error);
                        }
                    }
                    return '{}';
                }));
            };
            const [[settingsContent], standAloneConfigurationContents] = await Promise.all([
                resolveContents([this.settingsResource]),
                resolveContents(this.standAloneConfigurationResources.map(([, resource]) => resource)),
            ]);
            return [settingsContent, standAloneConfigurationContents.map((content, index) => ([this.standAloneConfigurationResources[index][0], content]))];
        }
        async loadConfiguration() {
            const [settingsContent, standAloneConfigurationContents] = await this.resolveContents();
            // reset
            this._standAloneConfigurations = [];
            this._folderSettingsModelParser.parse('', this._folderSettingsParseOptions);
            // parse
            if (settingsContent !== undefined) {
                this._folderSettingsModelParser.parse(settingsContent, this._folderSettingsParseOptions);
            }
            for (let index = 0; index < standAloneConfigurationContents.length; index++) {
                const contents = standAloneConfigurationContents[index][1];
                if (contents !== undefined) {
                    const standAloneConfigurationModelParser = new configurationModels_2.StandaloneConfigurationModelParser(this.standAloneConfigurationResources[index][1].toString(), this.standAloneConfigurationResources[index][0]);
                    standAloneConfigurationModelParser.parse(contents);
                    this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
                }
            }
            // Consolidate (support *.json files in the workspace settings folder)
            this.consolidate();
            return this._cache;
        }
        getRestrictedSettings() {
            return this._folderSettingsModelParser.restrictedConfigurations;
        }
        reparse(configurationParseOptions) {
            const oldContents = this._folderSettingsModelParser.configurationModel.contents;
            this._folderSettingsParseOptions = configurationParseOptions;
            this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
            if (!(0, objects_1.equals)(oldContents, this._folderSettingsModelParser.configurationModel.contents)) {
                this.consolidate();
            }
            return this._cache;
        }
        consolidate() {
            this._cache = this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations);
        }
        handleFileChangesEvent(event) {
            // One of the resources has changed
            if (this.allResources.some(resource => event.contains(resource))) {
                return true;
            }
            // One of the resource's parent got deleted
            if (this.allResources.some(resource => event.contains(this.uriIdentityService.extUri.dirname(resource), 2 /* FileChangeType.DELETED */))) {
                return true;
            }
            return false;
        }
        handleFileOperationEvent(event) {
            // One of the resources has changed
            if ((event.isOperation(0 /* FileOperation.CREATE */) || event.isOperation(3 /* FileOperation.COPY */) || event.isOperation(1 /* FileOperation.DELETE */) || event.isOperation(4 /* FileOperation.WRITE */))
                && this.allResources.some(resource => this.uriIdentityService.extUri.isEqual(event.resource, resource))) {
                return true;
            }
            // One of the resource's parent got deleted
            if (event.isOperation(1 /* FileOperation.DELETE */) && this.allResources.some(resource => this.uriIdentityService.extUri.isEqual(event.resource, this.uriIdentityService.extUri.dirname(resource)))) {
                return true;
            }
            return false;
        }
    }
    class RemoteUserConfiguration extends lifecycle_1.Disposable {
        constructor(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService) {
            super();
            this._userConfigurationInitializationPromise = null;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._onDidInitialize = this._register(new event_1.Emitter());
            this.onDidInitialize = this._onDidInitialize.event;
            this._fileService = fileService;
            this._userConfiguration = this._cachedConfiguration = new CachedRemoteUserConfiguration(remoteAuthority, configurationCache, { scopes: configuration_1.REMOTE_MACHINE_SCOPES });
            remoteAgentService.getEnvironment().then(async (environment) => {
                if (environment) {
                    const userConfiguration = this._register(new FileServiceBasedRemoteUserConfiguration(environment.settingsPath, { scopes: configuration_1.REMOTE_MACHINE_SCOPES }, this._fileService, uriIdentityService));
                    this._register(userConfiguration.onDidChangeConfiguration(configurationModel => this.onDidUserConfigurationChange(configurationModel)));
                    this._userConfigurationInitializationPromise = userConfiguration.initialize();
                    const configurationModel = await this._userConfigurationInitializationPromise;
                    this._userConfiguration.dispose();
                    this._userConfiguration = userConfiguration;
                    this.onDidUserConfigurationChange(configurationModel);
                    this._onDidInitialize.fire(configurationModel);
                }
            });
        }
        async initialize() {
            if (this._userConfiguration instanceof FileServiceBasedRemoteUserConfiguration) {
                return this._userConfiguration.initialize();
            }
            // Initialize cached configuration
            let configurationModel = await this._userConfiguration.initialize();
            if (this._userConfigurationInitializationPromise) {
                // Use user configuration
                configurationModel = await this._userConfigurationInitializationPromise;
                this._userConfigurationInitializationPromise = null;
            }
            return configurationModel;
        }
        reload() {
            return this._userConfiguration.reload();
        }
        reparse() {
            return this._userConfiguration.reparse({ scopes: configuration_1.REMOTE_MACHINE_SCOPES });
        }
        getRestrictedSettings() {
            return this._userConfiguration.getRestrictedSettings();
        }
        onDidUserConfigurationChange(configurationModel) {
            this.updateCache();
            this._onDidChangeConfiguration.fire(configurationModel);
        }
        async updateCache() {
            if (this._userConfiguration instanceof FileServiceBasedRemoteUserConfiguration) {
                let content;
                try {
                    content = await this._userConfiguration.resolveContent();
                }
                catch (error) {
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        return;
                    }
                }
                await this._cachedConfiguration.updateConfiguration(content);
            }
        }
    }
    exports.RemoteUserConfiguration = RemoteUserConfiguration;
    class FileServiceBasedRemoteUserConfiguration extends lifecycle_1.Disposable {
        constructor(configurationResource, configurationParseOptions, fileService, uriIdentityService) {
            super();
            this.configurationResource = configurationResource;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this.fileWatcherDisposable = lifecycle_1.Disposable.None;
            this.directoryWatcherDisposable = lifecycle_1.Disposable.None;
            this.parser = new configurationModels_1.ConfigurationModelParser(this.configurationResource.toString());
            this.parseOptions = configurationParseOptions;
            this._register(fileService.onDidFilesChange(e => this.handleFileChangesEvent(e)));
            this._register(fileService.onDidRunOperation(e => this.handleFileOperationEvent(e)));
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(configurationModel => this._onDidChangeConfiguration.fire(configurationModel)), 50));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.stopWatchingResource();
                this.stopWatchingDirectory();
            }));
        }
        watchResource() {
            this.fileWatcherDisposable = this.fileService.watch(this.configurationResource);
        }
        stopWatchingResource() {
            this.fileWatcherDisposable.dispose();
            this.fileWatcherDisposable = lifecycle_1.Disposable.None;
        }
        watchDirectory() {
            const directory = this.uriIdentityService.extUri.dirname(this.configurationResource);
            this.directoryWatcherDisposable = this.fileService.watch(directory);
        }
        stopWatchingDirectory() {
            this.directoryWatcherDisposable.dispose();
            this.directoryWatcherDisposable = lifecycle_1.Disposable.None;
        }
        async initialize() {
            const exists = await this.fileService.exists(this.configurationResource);
            this.onResourceExists(exists);
            return this.reload();
        }
        async resolveContent() {
            const content = await this.fileService.readFile(this.configurationResource, { atomic: true });
            return content.value.toString();
        }
        async reload() {
            try {
                const content = await this.resolveContent();
                this.parser.parse(content, this.parseOptions);
                return this.parser.configurationModel;
            }
            catch (e) {
                return new configurationModels_1.ConfigurationModel();
            }
        }
        reparse(configurationParseOptions) {
            this.parseOptions = configurationParseOptions;
            this.parser.reparse(this.parseOptions);
            return this.parser.configurationModel;
        }
        getRestrictedSettings() {
            return this.parser.restrictedConfigurations;
        }
        handleFileChangesEvent(event) {
            // Find changes that affect the resource
            let affectedByChanges = event.contains(this.configurationResource, 0 /* FileChangeType.UPDATED */);
            if (event.contains(this.configurationResource, 1 /* FileChangeType.ADDED */)) {
                affectedByChanges = true;
                this.onResourceExists(true);
            }
            else if (event.contains(this.configurationResource, 2 /* FileChangeType.DELETED */)) {
                affectedByChanges = true;
                this.onResourceExists(false);
            }
            if (affectedByChanges) {
                this.reloadConfigurationScheduler.schedule();
            }
        }
        handleFileOperationEvent(event) {
            if ((event.isOperation(0 /* FileOperation.CREATE */) || event.isOperation(3 /* FileOperation.COPY */) || event.isOperation(1 /* FileOperation.DELETE */) || event.isOperation(4 /* FileOperation.WRITE */))
                && this.uriIdentityService.extUri.isEqual(event.resource, this.configurationResource)) {
                this.reloadConfigurationScheduler.schedule();
            }
        }
        onResourceExists(exists) {
            if (exists) {
                this.stopWatchingDirectory();
                this.watchResource();
            }
            else {
                this.stopWatchingResource();
                this.watchDirectory();
            }
        }
    }
    class CachedRemoteUserConfiguration extends lifecycle_1.Disposable {
        constructor(remoteAuthority, configurationCache, configurationParseOptions) {
            super();
            this.configurationCache = configurationCache;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.key = { type: 'user', key: remoteAuthority };
            this.parser = new configurationModels_1.ConfigurationModelParser('CachedRemoteUserConfiguration');
            this.parseOptions = configurationParseOptions;
            this.configurationModel = new configurationModels_1.ConfigurationModel();
        }
        getConfigurationModel() {
            return this.configurationModel;
        }
        initialize() {
            return this.reload();
        }
        reparse(configurationParseOptions) {
            this.parseOptions = configurationParseOptions;
            this.parser.reparse(this.parseOptions);
            this.configurationModel = this.parser.configurationModel;
            return this.configurationModel;
        }
        getRestrictedSettings() {
            return this.parser.restrictedConfigurations;
        }
        async reload() {
            try {
                const content = await this.configurationCache.read(this.key);
                const parsed = JSON.parse(content);
                if (parsed.content) {
                    this.parser.parse(parsed.content, this.parseOptions);
                    this.configurationModel = this.parser.configurationModel;
                }
            }
            catch (e) { /* Ignore error */ }
            return this.configurationModel;
        }
        async updateConfiguration(content) {
            if (content) {
                return this.configurationCache.write(this.key, JSON.stringify({ content }));
            }
            else {
                return this.configurationCache.remove(this.key);
            }
        }
    }
    class WorkspaceConfiguration extends lifecycle_1.Disposable {
        get initialized() { return this._initialized; }
        constructor(configurationCache, fileService, uriIdentityService, logService) {
            super();
            this.configurationCache = configurationCache;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._workspaceConfigurationDisposables = this._register(new lifecycle_1.DisposableStore());
            this._workspaceIdentifier = null;
            this._isWorkspaceTrusted = false;
            this._onDidUpdateConfiguration = this._register(new event_1.Emitter());
            this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
            this._initialized = false;
            this.fileService = fileService;
            this._workspaceConfiguration = this._cachedConfiguration = new CachedWorkspaceConfiguration(configurationCache);
        }
        async initialize(workspaceIdentifier, workspaceTrusted) {
            this._workspaceIdentifier = workspaceIdentifier;
            this._isWorkspaceTrusted = workspaceTrusted;
            if (!this._initialized) {
                if (this.configurationCache.needsCaching(this._workspaceIdentifier.configPath)) {
                    this._workspaceConfiguration = this._cachedConfiguration;
                    this.waitAndInitialize(this._workspaceIdentifier);
                }
                else {
                    this.doInitialize(new FileServiceBasedWorkspaceConfiguration(this.fileService, this.uriIdentityService, this.logService));
                }
            }
            await this.reload();
        }
        async reload() {
            if (this._workspaceIdentifier) {
                await this._workspaceConfiguration.load(this._workspaceIdentifier, { scopes: configuration_1.WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
            }
        }
        getFolders() {
            return this._workspaceConfiguration.getFolders();
        }
        setFolders(folders, jsonEditingService) {
            if (this._workspaceIdentifier) {
                return jsonEditingService.write(this._workspaceIdentifier.configPath, [{ path: ['folders'], value: folders }], true)
                    .then(() => this.reload());
            }
            return Promise.resolve();
        }
        isTransient() {
            return this._workspaceConfiguration.isTransient();
        }
        getConfiguration() {
            return this._workspaceConfiguration.getWorkspaceSettings();
        }
        updateWorkspaceTrust(trusted) {
            this._isWorkspaceTrusted = trusted;
            return this.reparseWorkspaceSettings();
        }
        reparseWorkspaceSettings() {
            this._workspaceConfiguration.reparseWorkspaceSettings({ scopes: configuration_1.WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
            return this.getConfiguration();
        }
        getRestrictedSettings() {
            return this._workspaceConfiguration.getRestrictedSettings();
        }
        async waitAndInitialize(workspaceIdentifier) {
            await (0, files_1.whenProviderRegistered)(workspaceIdentifier.configPath, this.fileService);
            if (!(this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration)) {
                const fileServiceBasedWorkspaceConfiguration = this._register(new FileServiceBasedWorkspaceConfiguration(this.fileService, this.uriIdentityService, this.logService));
                await fileServiceBasedWorkspaceConfiguration.load(workspaceIdentifier, { scopes: configuration_1.WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
                this.doInitialize(fileServiceBasedWorkspaceConfiguration);
                this.onDidWorkspaceConfigurationChange(false, true);
            }
        }
        doInitialize(fileServiceBasedWorkspaceConfiguration) {
            this._workspaceConfigurationDisposables.clear();
            this._workspaceConfiguration = this._workspaceConfigurationDisposables.add(fileServiceBasedWorkspaceConfiguration);
            this._workspaceConfigurationDisposables.add(this._workspaceConfiguration.onDidChange(e => this.onDidWorkspaceConfigurationChange(true, false)));
            this._initialized = true;
        }
        isUntrusted() {
            return !this._isWorkspaceTrusted;
        }
        async onDidWorkspaceConfigurationChange(reload, fromCache) {
            if (reload) {
                await this.reload();
            }
            this.updateCache();
            this._onDidUpdateConfiguration.fire(fromCache);
        }
        async updateCache() {
            if (this._workspaceIdentifier && this.configurationCache.needsCaching(this._workspaceIdentifier.configPath) && this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration) {
                const content = await this._workspaceConfiguration.resolveContent(this._workspaceIdentifier);
                await this._cachedConfiguration.updateWorkspace(this._workspaceIdentifier, content);
            }
        }
    }
    exports.WorkspaceConfiguration = WorkspaceConfiguration;
    class FileServiceBasedWorkspaceConfiguration extends lifecycle_1.Disposable {
        constructor(fileService, uriIdentityService, logService) {
            super();
            this.fileService = fileService;
            this.logService = logService;
            this._workspaceIdentifier = null;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser('');
            this.workspaceSettings = new configurationModels_1.ConfigurationModel();
            this._register(event_1.Event.any(event_1.Event.filter(this.fileService.onDidFilesChange, e => !!this._workspaceIdentifier && e.contains(this._workspaceIdentifier.configPath)), event_1.Event.filter(this.fileService.onDidRunOperation, e => !!this._workspaceIdentifier && (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */) || e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(4 /* FileOperation.WRITE */)) && uriIdentityService.extUri.isEqual(e.resource, this._workspaceIdentifier.configPath)))(() => this.reloadConfigurationScheduler.schedule()));
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this._onDidChange.fire(), 50));
            this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
        }
        get workspaceIdentifier() {
            return this._workspaceIdentifier;
        }
        async resolveContent(workspaceIdentifier) {
            const content = await this.fileService.readFile(workspaceIdentifier.configPath, { atomic: true });
            return content.value.toString();
        }
        async load(workspaceIdentifier, configurationParseOptions) {
            if (!this._workspaceIdentifier || this._workspaceIdentifier.id !== workspaceIdentifier.id) {
                this._workspaceIdentifier = workspaceIdentifier;
                this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser(this._workspaceIdentifier.id);
                (0, lifecycle_1.dispose)(this.workspaceConfigWatcher);
                this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
            }
            let contents = '';
            try {
                contents = await this.resolveContent(this._workspaceIdentifier);
            }
            catch (error) {
                const exists = await this.fileService.exists(this._workspaceIdentifier.configPath);
                if (exists) {
                    this.logService.error(error);
                }
            }
            this.workspaceConfigurationModelParser.parse(contents, configurationParseOptions);
            this.consolidate();
        }
        getConfigurationModel() {
            return this.workspaceConfigurationModelParser.configurationModel;
        }
        getFolders() {
            return this.workspaceConfigurationModelParser.folders;
        }
        isTransient() {
            return this.workspaceConfigurationModelParser.transient;
        }
        getWorkspaceSettings() {
            return this.workspaceSettings;
        }
        reparseWorkspaceSettings(configurationParseOptions) {
            this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
            this.consolidate();
            return this.getWorkspaceSettings();
        }
        getRestrictedSettings() {
            return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
        }
        consolidate() {
            this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
        }
        watchWorkspaceConfigurationFile() {
            return this._workspaceIdentifier ? this.fileService.watch(this._workspaceIdentifier.configPath) : lifecycle_1.Disposable.None;
        }
    }
    class CachedWorkspaceConfiguration {
        constructor(configurationCache) {
            this.configurationCache = configurationCache;
            this.onDidChange = event_1.Event.None;
            this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser('');
            this.workspaceSettings = new configurationModels_1.ConfigurationModel();
        }
        async load(workspaceIdentifier, configurationParseOptions) {
            try {
                const key = this.getKey(workspaceIdentifier);
                const contents = await this.configurationCache.read(key);
                const parsed = JSON.parse(contents);
                if (parsed.content) {
                    this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser(key.key);
                    this.workspaceConfigurationModelParser.parse(parsed.content, configurationParseOptions);
                    this.consolidate();
                }
            }
            catch (e) {
            }
        }
        get workspaceIdentifier() {
            return null;
        }
        getConfigurationModel() {
            return this.workspaceConfigurationModelParser.configurationModel;
        }
        getFolders() {
            return this.workspaceConfigurationModelParser.folders;
        }
        isTransient() {
            return this.workspaceConfigurationModelParser.transient;
        }
        getWorkspaceSettings() {
            return this.workspaceSettings;
        }
        reparseWorkspaceSettings(configurationParseOptions) {
            this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
            this.consolidate();
            return this.getWorkspaceSettings();
        }
        getRestrictedSettings() {
            return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
        }
        consolidate() {
            this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
        }
        async updateWorkspace(workspaceIdentifier, content) {
            try {
                const key = this.getKey(workspaceIdentifier);
                if (content) {
                    await this.configurationCache.write(key, JSON.stringify({ content }));
                }
                else {
                    await this.configurationCache.remove(key);
                }
            }
            catch (error) {
            }
        }
        getKey(workspaceIdentifier) {
            return {
                type: 'workspaces',
                key: workspaceIdentifier.id
            };
        }
    }
    class CachedFolderConfiguration {
        constructor(folder, configFolderRelativePath, configurationParseOptions, configurationCache) {
            this.configurationCache = configurationCache;
            this.onDidChange = event_1.Event.None;
            this.key = { type: 'folder', key: (0, hash_1.hash)((0, resources_1.joinPath)(folder, configFolderRelativePath).toString()).toString(16) };
            this._folderSettingsModelParser = new configurationModels_1.ConfigurationModelParser('CachedFolderConfiguration');
            this._folderSettingsParseOptions = configurationParseOptions;
            this._standAloneConfigurations = [];
            this.configurationModel = new configurationModels_1.ConfigurationModel();
        }
        async loadConfiguration() {
            try {
                const contents = await this.configurationCache.read(this.key);
                const { content: configurationContents } = JSON.parse(contents.toString());
                if (configurationContents) {
                    for (const key of Object.keys(configurationContents)) {
                        if (key === configuration_1.FOLDER_SETTINGS_NAME) {
                            this._folderSettingsModelParser.parse(configurationContents[key], this._folderSettingsParseOptions);
                        }
                        else {
                            const standAloneConfigurationModelParser = new configurationModels_2.StandaloneConfigurationModelParser(key, key);
                            standAloneConfigurationModelParser.parse(configurationContents[key]);
                            this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
                        }
                    }
                }
                this.consolidate();
            }
            catch (e) {
            }
            return this.configurationModel;
        }
        async updateConfiguration(settingsContent, standAloneConfigurationContents) {
            const content = {};
            if (settingsContent) {
                content[configuration_1.FOLDER_SETTINGS_NAME] = settingsContent;
            }
            standAloneConfigurationContents.forEach(([key, contents]) => {
                if (contents) {
                    content[key] = contents;
                }
            });
            if (Object.keys(content).length) {
                await this.configurationCache.write(this.key, JSON.stringify({ content }));
            }
            else {
                await this.configurationCache.remove(this.key);
            }
        }
        getRestrictedSettings() {
            return this._folderSettingsModelParser.restrictedConfigurations;
        }
        reparse(configurationParseOptions) {
            this._folderSettingsParseOptions = configurationParseOptions;
            this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
            this.consolidate();
            return this.configurationModel;
        }
        consolidate() {
            this.configurationModel = this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations);
        }
        getUnsupportedKeys() {
            return [];
        }
    }
    class FolderConfiguration extends lifecycle_1.Disposable {
        constructor(useCache, workspaceFolder, configFolderRelativePath, workbenchState, workspaceTrusted, fileService, uriIdentityService, logService, configurationCache) {
            super();
            this.workspaceFolder = workspaceFolder;
            this.workbenchState = workbenchState;
            this.workspaceTrusted = workspaceTrusted;
            this.configurationCache = configurationCache;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.scopes = 3 /* WorkbenchState.WORKSPACE */ === this.workbenchState ? configuration_1.FOLDER_SCOPES : configuration_1.WORKSPACE_SCOPES;
            this.configurationFolder = uriIdentityService.extUri.joinPath(workspaceFolder.uri, configFolderRelativePath);
            this.cachedFolderConfiguration = new CachedFolderConfiguration(workspaceFolder.uri, configFolderRelativePath, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, configurationCache);
            if (useCache && this.configurationCache.needsCaching(workspaceFolder.uri)) {
                this.folderConfiguration = this.cachedFolderConfiguration;
                (0, files_1.whenProviderRegistered)(workspaceFolder.uri, fileService)
                    .then(() => {
                    this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
                    this._register(this.folderConfiguration.onDidChange(e => this.onDidFolderConfigurationChange()));
                    this.onDidFolderConfigurationChange();
                });
            }
            else {
                this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
                this._register(this.folderConfiguration.onDidChange(e => this.onDidFolderConfigurationChange()));
            }
        }
        loadConfiguration() {
            return this.folderConfiguration.loadConfiguration();
        }
        updateWorkspaceTrust(trusted) {
            this.workspaceTrusted = trusted;
            return this.reparse();
        }
        reparse() {
            const configurationModel = this.folderConfiguration.reparse({ scopes: this.scopes, skipRestricted: this.isUntrusted() });
            this.updateCache();
            return configurationModel;
        }
        getRestrictedSettings() {
            return this.folderConfiguration.getRestrictedSettings();
        }
        isUntrusted() {
            return !this.workspaceTrusted;
        }
        onDidFolderConfigurationChange() {
            this.updateCache();
            this._onDidChange.fire();
        }
        createFileServiceBasedConfiguration(fileService, uriIdentityService, logService) {
            const settingsResource = uriIdentityService.extUri.joinPath(this.configurationFolder, `${configuration_1.FOLDER_SETTINGS_NAME}.json`);
            const standAloneConfigurationResources = [configuration_1.TASKS_CONFIGURATION_KEY, configuration_1.LAUNCH_CONFIGURATION_KEY].map(name => ([name, uriIdentityService.extUri.joinPath(this.configurationFolder, `${name}.json`)]));
            return new FileServiceBasedConfiguration(this.configurationFolder.toString(), settingsResource, standAloneConfigurationResources, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, fileService, uriIdentityService, logService);
        }
        async updateCache() {
            if (this.configurationCache.needsCaching(this.configurationFolder) && this.folderConfiguration instanceof FileServiceBasedConfiguration) {
                const [settingsContent, standAloneConfigurationContents] = await this.folderConfiguration.resolveContents();
                this.cachedFolderConfiguration.updateConfiguration(settingsContent, standAloneConfigurationContents);
            }
        }
    }
    exports.FolderConfiguration = FolderConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uL2Jyb3dzZXIvY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0QmhHLE1BQWEsb0JBQXFCLFNBQVEscUNBQXdCO2lCQUVqRCx1Q0FBa0MsR0FBRyw2QkFBNkIsQUFBaEMsQ0FBaUM7UUFRbkYsWUFDa0Isa0JBQXVDLEVBQ3hELGtCQUF1RDtZQUV2RCxLQUFLLEVBQUUsQ0FBQztZQUhTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFQeEMsMEJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDL0YseUNBQW9DLEdBQTJCLEVBQUUsQ0FBQztZQUN6RCxhQUFRLEdBQXFCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQztZQUVsRyxnQkFBVyxHQUFZLEtBQUssQ0FBQztZQU9wQyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzVIO1FBQ0YsQ0FBQztRQUVrQixnQ0FBZ0M7WUFDbEQsT0FBTyxJQUFJLENBQUMsb0NBQW9DLENBQUM7UUFDbEQsQ0FBQztRQUVRLEtBQUssQ0FBQyxVQUFVO1lBQ3hCLE1BQU0sSUFBSSxDQUFDLDhDQUE4QyxFQUFFLENBQUM7WUFDNUQsT0FBTyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVRLE1BQU07WUFDZCxJQUFJLENB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