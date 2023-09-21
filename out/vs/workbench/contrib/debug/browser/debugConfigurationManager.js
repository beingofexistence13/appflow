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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSchemas", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/history/common/history", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, json, lifecycle_1, objects, resources, uri_1, nls, configuration_1, contextkey_1, files_1, instantiation_1, jsonContributionRegistry_1, quickInput_1, platform_1, storage_1, themables_1, uriIdentity_1, workspace_1, debugIcons_1, debug_1, debugSchemas_1, debugUtils_1, configuration_2, editorService_1, extensions_1, history_1, preferences_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationManager = void 0;
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    jsonRegistry.registerSchema(configuration_2.launchSchemaId, debugSchemas_1.launchSchema);
    const DEBUG_SELECTED_CONFIG_NAME_KEY = 'debug.selectedconfigname';
    const DEBUG_SELECTED_ROOT = 'debug.selectedroot';
    // Debug type is only stored if a dynamic configuration is used for better restore
    const DEBUG_SELECTED_TYPE = 'debug.selectedtype';
    const DEBUG_RECENT_DYNAMIC_CONFIGURATIONS = 'debug.recentdynamicconfigurations';
    let ConfigurationManager = class ConfigurationManager {
        constructor(adapterManager, contextService, configurationService, quickInputService, instantiationService, storageService, extensionService, historyService, uriIdentityService, contextKeyService) {
            this.adapterManager = adapterManager;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.historyService = historyService;
            this.uriIdentityService = uriIdentityService;
            this.getSelectedConfig = () => Promise.resolve(undefined);
            this.selectedDynamic = false;
            this._onDidSelectConfigurationName = new event_1.Emitter();
            this.configProviders = [];
            this.toDispose = [];
            this.initLaunches();
            this.setCompoundSchemaValues();
            this.registerListeners();
            const previousSelectedRoot = this.storageService.get(DEBUG_SELECTED_ROOT, 1 /* StorageScope.WORKSPACE */);
            const previousSelectedType = this.storageService.get(DEBUG_SELECTED_TYPE, 1 /* StorageScope.WORKSPACE */);
            const previousSelectedLaunch = this.launches.find(l => l.uri.toString() === previousSelectedRoot);
            const previousSelectedName = this.storageService.get(DEBUG_SELECTED_CONFIG_NAME_KEY, 1 /* StorageScope.WORKSPACE */);
            this.debugConfigurationTypeContext = debug_1.CONTEXT_DEBUG_CONFIGURATION_TYPE.bindTo(contextKeyService);
            const dynamicConfig = previousSelectedType ? { type: previousSelectedType } : undefined;
            if (previousSelectedLaunch && previousSelectedLaunch.getConfigurationNames().length) {
                this.selectConfiguration(previousSelectedLaunch, previousSelectedName, undefined, dynamicConfig);
            }
            else if (this.launches.length > 0) {
                this.selectConfiguration(undefined, previousSelectedName, undefined, dynamicConfig);
            }
        }
        registerDebugConfigurationProvider(debugConfigurationProvider) {
            this.configProviders.push(debugConfigurationProvider);
            return {
                dispose: () => {
                    this.unregisterDebugConfigurationProvider(debugConfigurationProvider);
                }
            };
        }
        unregisterDebugConfigurationProvider(debugConfigurationProvider) {
            const ix = this.configProviders.indexOf(debugConfigurationProvider);
            if (ix >= 0) {
                this.configProviders.splice(ix, 1);
            }
        }
        /**
         * if scope is not specified,a value of DebugConfigurationProvideTrigger.Initial is assumed.
         */
        hasDebugConfigurationProvider(debugType, triggerKind) {
            if (triggerKind === undefined) {
                triggerKind = debug_1.DebugConfigurationProviderTriggerKind.Initial;
            }
            // check if there are providers for the given type that contribute a provideDebugConfigurations method
            const provider = this.configProviders.find(p => p.provideDebugConfigurations && (p.type === debugType) && (p.triggerKind === triggerKind));
            return !!provider;
        }
        async resolveConfigurationByProviders(folderUri, type, config, token) {
            const resolveDebugConfigurationForType = async (type, config) => {
                if (type !== '*') {
                    await this.adapterManager.activateDebuggers('onDebugResolve', type);
                }
                for (const p of this.configProviders) {
                    if (p.type === type && p.resolveDebugConfiguration && config) {
                        config = await p.resolveDebugConfiguration(folderUri, config, token);
                    }
                }
                return config;
            };
            let resolvedType = config.type ?? type;
            let result = config;
            for (let seen = new Set(); result && !seen.has(resolvedType);) {
                seen.add(resolvedType);
                result = await resolveDebugConfigurationForType(resolvedType, result);
                result = await resolveDebugConfigurationForType('*', result);
                resolvedType = result?.type ?? type;
            }
            return result;
        }
        async resolveDebugConfigurationWithSubstitutedVariables(folderUri, type, config, token) {
            // pipe the config through the promises sequentially. Append at the end the '*' types
            const providers = this.configProviders.filter(p => p.type === type && p.resolveDebugConfigurationWithSubstitutedVariables)
                .concat(this.configProviders.filter(p => p.type === '*' && p.resolveDebugConfigurationWithSubstitutedVariables));
            let result = config;
            await (0, async_1.sequence)(providers.map(provider => async () => {
                // If any provider returned undefined or null make sure to respect that and do not pass the result to more resolver
                if (result) {
                    result = await provider.resolveDebugConfigurationWithSubstitutedVariables(folderUri, result, token);
                }
            }));
            return result;
        }
        async provideDebugConfigurations(folderUri, type, token) {
            await this.adapterManager.activateDebuggers('onDebugInitialConfigurations');
            const results = await Promise.all(this.configProviders.filter(p => p.type === type && p.triggerKind === debug_1.DebugConfigurationProviderTriggerKind.Initial && p.provideDebugConfigurations).map(p => p.provideDebugConfigurations(folderUri, token)));
            return results.reduce((first, second) => first.concat(second), []);
        }
        async getDynamicProviders() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const onDebugDynamicConfigurationsName = 'onDebugDynamicConfigurations';
            const debugDynamicExtensionsTypes = this.extensionService.extensions.reduce((acc, e) => {
                if (!e.activationEvents) {
                    return acc;
                }
                const explicitTypes = [];
                let hasGenericEvent = false;
                for (const event of e.activationEvents) {
                    if (event === onDebugDynamicConfigurationsName) {
                        hasGenericEvent = true;
                    }
                    else if (event.startsWith(`${onDebugDynamicConfigurationsName}:`)) {
                        explicitTypes.push(event.slice(onDebugDynamicConfigurationsName.length + 1));
                    }
                }
                if (explicitTypes.length) {
                    return acc.concat(explicitTypes);
                }
                if (hasGenericEvent) {
                    const debuggerType = e.contributes?.debuggers?.[0].type;
                    return debuggerType ? acc.concat(debuggerType) : acc;
                }
                return acc;
            }, []);
            return debugDynamicExtensionsTypes.map(type => {
                return {
                    label: this.adapterManager.getDebuggerLabel(type),
                    getProvider: async () => {
                        await this.adapterManager.activateDebuggers(onDebugDynamicConfigurationsName, type);
                        return this.configProviders.find(p => p.type === type && p.triggerKind === debug_1.DebugConfigurationProviderTriggerKind.Dynamic && p.provideDebugConfigurations);
                    },
                    type,
                    pick: async () => {
                        // Do a late 'onDebugDynamicConfigurationsName' activation so extensions are not activated too early #108578
                        await this.adapterManager.activateDebuggers(onDebugDynamicConfigurationsName, type);
                        const token = new cancellation_1.CancellationTokenSource();
                        const picks = [];
                        const provider = this.configProviders.find(p => p.type === type && p.triggerKind === debug_1.DebugConfigurationProviderTriggerKind.Dynamic && p.provideDebugConfigurations);
                        this.getLaunches().forEach(launch => {
                            if (launch.workspace && provider) {
                                picks.push(provider.provideDebugConfigurations(launch.workspace.uri, token.token).then(configurations => configurations.map(config => ({
                                    label: config.name,
                                    description: launch.name,
                                    config,
                                    buttons: [{
                                            iconClass: themables_1.ThemeIcon.asClassName(debugIcons_1.debugConfigure),
                                            tooltip: nls.localize('editLaunchConfig', "Edit Debug Configuration in launch.json")
                                        }],
                                    launch
                                }))));
                            }
                        });
                        const disposables = new lifecycle_1.DisposableStore();
                        const input = disposables.add(this.quickInputService.createQuickPick());
                        input.busy = true;
                        input.placeholder = nls.localize('selectConfiguration', "Select Launch Configuration");
                        const chosenPromise = new Promise(resolve => {
                            disposables.add(input.onDidAccept(() => resolve(input.activeItems[0])));
                            disposables.add(input.onDidTriggerItemButton(async (context) => {
                                resolve(undefined);
                                const { launch, config } = context.item;
                                await launch.openConfigFile({ preserveFocus: false, type: config.type, suppressInitialConfigs: true });
                                // Only Launch have a pin trigger button
                                await launch.writeConfiguration(config);
                                await this.selectConfiguration(launch, config.name);
                                this.removeRecentDynamicConfigurations(config.name, config.type);
                            }));
                        });
                        const nestedPicks = await Promise.all(picks);
                        const items = (0, arrays_1.flatten)(nestedPicks);
                        input.items = items;
                        input.busy = false;
                        input.show();
                        const chosen = await chosenPromise;
                        disposables.dispose();
                        if (!chosen) {
                            // User canceled quick input we should notify the provider to cancel computing configurations
                            token.cancel();
                            return;
                        }
                        return chosen;
                    }
                };
            });
        }
        getAllConfigurations() {
            const all = [];
            for (const l of this.launches) {
                for (const name of l.getConfigurationNames()) {
                    const config = l.getConfiguration(name) || l.getCompound(name);
                    if (config) {
                        all.push({ launch: l, name, presentation: config.presentation });
                    }
                }
            }
            return (0, debugUtils_1.getVisibleAndSorted)(all);
        }
        removeRecentDynamicConfigurations(name, type) {
            const remaining = this.getRecentDynamicConfigurations().filter(c => c.name !== name || c.type !== type);
            this.storageService.store(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, JSON.stringify(remaining), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            if (this.selectedConfiguration.name === name && this.selectedType === type && this.selectedDynamic) {
                this.selectConfiguration(undefined, undefined);
            }
            else {
                this._onDidSelectConfigurationName.fire();
            }
        }
        getRecentDynamicConfigurations() {
            return JSON.parse(this.storageService.get(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, 1 /* StorageScope.WORKSPACE */, '[]'));
        }
        registerListeners() {
            this.toDispose.push(event_1.Event.any(this.contextService.onDidChangeWorkspaceFolders, this.contextService.onDidChangeWorkbenchState)(() => {
                this.initLaunches();
                this.selectConfiguration(undefined);
                this.setCompoundSchemaValues();
            }));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration('launch')) {
                    // A change happen in the launch.json. If there is already a launch configuration selected, do not change the selection.
                    await this.selectConfiguration(undefined);
                    this.setCompoundSchemaValues();
                }
            }));
            this.toDispose.push(this.adapterManager.onDidDebuggersExtPointRead(() => {
                this.setCompoundSchemaValues();
            }));
        }
        initLaunches() {
            this.launches = this.contextService.getWorkspace().folders.map(folder => this.instantiationService.createInstance(Launch, this, this.adapterManager, folder));
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                this.launches.push(this.instantiationService.createInstance(WorkspaceLaunch, this, this.adapterManager));
            }
            this.launches.push(this.instantiationService.createInstance(UserLaunch, this, this.adapterManager));
            if (this.selectedLaunch && this.launches.indexOf(this.selectedLaunch) === -1) {
                this.selectConfiguration(undefined);
            }
        }
        setCompoundSchemaValues() {
            const compoundConfigurationsSchema = debugSchemas_1.launchSchema.properties['compounds'].items.properties['configurations'];
            const launchNames = this.launches.map(l => l.getConfigurationNames(true)).reduce((first, second) => first.concat(second), []);
            compoundConfigurationsSchema.items.oneOf[0].enum = launchNames;
            compoundConfigurationsSchema.items.oneOf[1].properties.name.enum = launchNames;
            const folderNames = this.contextService.getWorkspace().folders.map(f => f.name);
            compoundConfigurationsSchema.items.oneOf[1].properties.folder.enum = folderNames;
            jsonRegistry.registerSchema(configuration_2.launchSchemaId, debugSchemas_1.launchSchema);
        }
        getLaunches() {
            return this.launches;
        }
        getLaunch(workspaceUri) {
            if (!uri_1.URI.isUri(workspaceUri)) {
                return undefined;
            }
            return this.launches.find(l => l.workspace && this.uriIdentityService.extUri.isEqual(l.workspace.uri, workspaceUri));
        }
        get selectedConfiguration() {
            return {
                launch: this.selectedLaunch,
                name: this.selectedName,
                getConfig: this.getSelectedConfig,
                type: this.selectedType
            };
        }
        get onDidSelectConfiguration() {
            return this._onDidSelectConfigurationName.event;
        }
        getWorkspaceLaunch() {
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                return this.launches[this.launches.length - 1];
            }
            return undefined;
        }
        async selectConfiguration(launch, name, config, dynamicConfig) {
            if (typeof launch === 'undefined') {
                const rootUri = this.historyService.getLastActiveWorkspaceRoot();
                launch = this.getLaunch(rootUri);
                if (!launch || launch.getConfigurationNames().length === 0) {
                    launch = this.launches.find(l => !!(l && l.getConfigurationNames().length)) || launch || this.launches[0];
                }
            }
            const previousLaunch = this.selectedLaunch;
            const previousName = this.selectedName;
            const previousSelectedDynamic = this.selectedDynamic;
            this.selectedLaunch = launch;
            if (this.selectedLaunch) {
                this.storageService.store(DEBUG_SELECTED_ROOT, this.selectedLaunch.uri.toString(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_SELECTED_ROOT, 1 /* StorageScope.WORKSPACE */);
            }
            const names = launch ? launch.getConfigurationNames() : [];
            this.getSelectedConfig = () => {
                const selected = this.selectedName ? launch?.getConfiguration(this.selectedName) : undefined;
                return Promise.resolve(selected || config);
            };
            let type = config?.type;
            if (name && names.indexOf(name) >= 0) {
                this.setSelectedLaunchName(name);
            }
            else if (dynamicConfig && dynamicConfig.type) {
                // We could not find the previously used name and config is not passed. We should get all dynamic configurations from providers
                // And potentially auto select the previously used dynamic configuration #96293
                type = dynamicConfig.type;
                if (!config) {
                    const providers = (await this.getDynamicProviders()).filter(p => p.type === type);
                    this.getSelectedConfig = async () => {
                        const activatedProviders = await Promise.all(providers.map(p => p.getProvider()));
                        const provider = activatedProviders.length > 0 ? activatedProviders[0] : undefined;
                        if (provider && launch && launch.workspace) {
                            const token = new cancellation_1.CancellationTokenSource();
                            const dynamicConfigs = await provider.provideDebugConfigurations(launch.workspace.uri, token.token);
                            const dynamicConfig = dynamicConfigs.find(c => c.name === name);
                            if (dynamicConfig) {
                                return dynamicConfig;
                            }
                        }
                        return undefined;
                    };
                }
                this.setSelectedLaunchName(name);
                let recentDynamicProviders = this.getRecentDynamicConfigurations();
                if (name && dynamicConfig.type) {
                    // We need to store the recently used dynamic configurations to be able to show them in UI #110009
                    recentDynamicProviders.unshift({ name, type: dynamicConfig.type });
                    recentDynamicProviders = (0, arrays_1.distinct)(recentDynamicProviders, t => `${t.name} : ${t.type}`);
                    this.storageService.store(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, JSON.stringify(recentDynamicProviders), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            }
            else if (!this.selectedName || names.indexOf(this.selectedName) === -1) {
                // We could not find the configuration to select, pick the first one, or reset the selection if there is no launch configuration
                const nameToSet = names.length ? names[0] : undefined;
                this.setSelectedLaunchName(nameToSet);
            }
            if (!config && launch && this.selectedName) {
                config = launch.getConfiguration(this.selectedName);
                type = config?.type;
            }
            this.selectedType = dynamicConfig?.type || config?.type;
            this.selectedDynamic = !!dynamicConfig;
            // Only store the selected type if we are having a dynamic configuration. Otherwise restoring this configuration from storage might be misindentified as a dynamic configuration
            this.storageService.store(DEBUG_SELECTED_TYPE, dynamicConfig ? this.selectedType : undefined, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            if (type) {
                this.debugConfigurationTypeContext.set(type);
            }
            else {
                this.debugConfigurationTypeContext.reset();
            }
            if (this.selectedLaunch !== previousLaunch || this.selectedName !== previousName || previousSelectedDynamic !== this.selectedDynamic) {
                this._onDidSelectConfigurationName.fire();
            }
        }
        setSelectedLaunchName(selectedName) {
            this.selectedName = selectedName;
            if (this.selectedName) {
                this.storageService.store(DEBUG_SELECTED_CONFIG_NAME_KEY, this.selectedName, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_SELECTED_CONFIG_NAME_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
        dispose() {
            this.toDispose = (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.ConfigurationManager = ConfigurationManager;
    exports.ConfigurationManager = ConfigurationManager = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, storage_1.IStorageService),
        __param(6, extensions_1.IExtensionService),
        __param(7, history_1.IHistoryService),
        __param(8, uriIdentity_1.IUriIdentityService),
        __param(9, contextkey_1.IContextKeyService)
    ], ConfigurationManager);
    class AbstractLaunch {
        constructor(configurationManager, adapterManager) {
            this.configurationManager = configurationManager;
            this.adapterManager = adapterManager;
        }
        getCompound(name) {
            const config = this.getConfig();
            if (!config || !config.compounds) {
                return undefined;
            }
            return config.compounds.find(compound => compound.name === name);
        }
        getConfigurationNames(ignoreCompoundsAndPresentation = false) {
            const config = this.getConfig();
            if (!config || (!Array.isArray(config.configurations) && !Array.isArray(config.compounds))) {
                return [];
            }
            else {
                const configurations = [];
                if (config.configurations) {
                    configurations.push(...config.configurations.filter(cfg => cfg && typeof cfg.name === 'string'));
                }
                if (ignoreCompoundsAndPresentation) {
                    return configurations.map(c => c.name);
                }
                if (config.compounds) {
                    configurations.push(...config.compounds.filter(compound => typeof compound.name === 'string' && compound.configurations && compound.configurations.length));
                }
                return (0, debugUtils_1.getVisibleAndSorted)(configurations).map(c => c.name);
            }
        }
        getConfiguration(name) {
            // We need to clone the configuration in order to be able to make changes to it #42198
            const config = objects.deepClone(this.getConfig());
            if (!config || !config.configurations) {
                return undefined;
            }
            const configuration = config.configurations.find(config => config && config.name === name);
            if (configuration) {
                if (this instanceof UserLaunch) {
                    configuration.__configurationTarget = 2 /* ConfigurationTarget.USER */;
                }
                else if (this instanceof WorkspaceLaunch) {
                    configuration.__configurationTarget = 5 /* ConfigurationTarget.WORKSPACE */;
                }
                else {
                    configuration.__configurationTarget = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            return configuration;
        }
        async getInitialConfigurationContent(folderUri, type, useInitialConfigs, token) {
            let content = '';
            const adapter = type ? this.adapterManager.getEnabledDebugger(type) : await this.adapterManager.guessDebugger(true);
            if (adapter) {
                const initialConfigs = useInitialConfigs ?
                    await this.configurationManager.provideDebugConfigurations(folderUri, adapter.type, token || cancellation_1.CancellationToken.None) :
                    [];
                content = await adapter.getInitialConfigurationContent(initialConfigs);
            }
            return content;
        }
        get hidden() {
            return false;
        }
    }
    let Launch = class Launch extends AbstractLaunch {
        constructor(configurationManager, adapterManager, workspace, fileService, textFileService, editorService, configurationService) {
            super(configurationManager, adapterManager);
            this.workspace = workspace;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.configurationService = configurationService;
        }
        get uri() {
            return resources.joinPath(this.workspace.uri, '/.vscode/launch.json');
        }
        get name() {
            return this.workspace.name;
        }
        getConfig() {
            return this.configurationService.inspect('launch', { resource: this.workspace.uri }).workspaceFolderValue;
        }
        async openConfigFile({ preserveFocus, type, suppressInitialConfigs }, token) {
            const resource = this.uri;
            let created = false;
            let content = '';
            try {
                const fileContent = await this.fileService.readFile(resource);
                content = fileContent.value.toString();
            }
            catch {
                // launch.json not found: create one by collecting launch configs from debugConfigProviders
                content = await this.getInitialConfigurationContent(this.workspace.uri, type, !suppressInitialConfigs, token);
                if (!content) {
                    // Cancelled
                    return { editor: null, created: false };
                }
                created = true; // pin only if config file is created #8727
                try {
                    await this.textFileService.write(resource, content);
                }
                catch (error) {
                    throw new Error(nls.localize('DebugConfig.failed', "Unable to create 'launch.json' file inside the '.vscode' folder ({0}).", error.message));
                }
            }
            const index = content.indexOf(`"${this.configurationManager.selectedConfiguration.name}"`);
            let startLineNumber = 1;
            for (let i = 0; i < index; i++) {
                if (content.charAt(i) === '\n') {
                    startLineNumber++;
                }
            }
            const selection = startLineNumber > 1 ? { startLineNumber, startColumn: 4 } : undefined;
            const editor = await this.editorService.openEditor({
                resource,
                options: {
                    selection,
                    preserveFocus,
                    pinned: created,
                    revealIfVisible: true
                },
            }, editorService_1.ACTIVE_GROUP);
            return ({
                editor: editor ?? null,
                created
            });
        }
        async writeConfiguration(configuration) {
            const fullConfig = objects.deepClone(this.getConfig());
            if (!fullConfig.configurations) {
                fullConfig.configurations = [];
            }
            fullConfig.configurations.push(configuration);
            await this.configurationService.updateValue('launch', fullConfig, { resource: this.workspace.uri }, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
        }
    };
    Launch = __decorate([
        __param(3, files_1.IFileService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, editorService_1.IEditorService),
        __param(6, configuration_1.IConfigurationService)
    ], Launch);
    let WorkspaceLaunch = class WorkspaceLaunch extends AbstractLaunch {
        constructor(configurationManager, adapterManager, editorService, configurationService, contextService) {
            super(configurationManager, adapterManager);
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.contextService = contextService;
        }
        get workspace() {
            return undefined;
        }
        get uri() {
            return this.contextService.getWorkspace().configuration;
        }
        get name() {
            return nls.localize('workspace', "workspace");
        }
        getConfig() {
            return this.configurationService.inspect('launch').workspaceValue;
        }
        async openConfigFile({ preserveFocus, type, useInitialConfigs }, token) {
            const launchExistInFile = !!this.getConfig();
            if (!launchExistInFile) {
                // Launch property in workspace config not found: create one by collecting launch configs from debugConfigProviders
                const content = await this.getInitialConfigurationContent(undefined, type, useInitialConfigs, token);
                if (content) {
                    await this.configurationService.updateValue('launch', json.parse(content), 5 /* ConfigurationTarget.WORKSPACE */);
                }
                else {
                    return { editor: null, created: false };
                }
            }
            const editor = await this.editorService.openEditor({
                resource: this.contextService.getWorkspace().configuration,
                options: { preserveFocus }
            }, editorService_1.ACTIVE_GROUP);
            return ({
                editor: editor ?? null,
                created: false
            });
        }
    };
    WorkspaceLaunch = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], WorkspaceLaunch);
    let UserLaunch = class UserLaunch extends AbstractLaunch {
        constructor(configurationManager, adapterManager, configurationService, preferencesService) {
            super(configurationManager, adapterManager);
            this.configurationService = configurationService;
            this.preferencesService = preferencesService;
        }
        get workspace() {
            return undefined;
        }
        get uri() {
            return this.preferencesService.userSettingsResource;
        }
        get name() {
            return nls.localize('user settings', "user settings");
        }
        get hidden() {
            return true;
        }
        getConfig() {
            return this.configurationService.inspect('launch').userValue;
        }
        async openConfigFile({ preserveFocus, type, useInitialContent }) {
            const editor = await this.preferencesService.openUserSettings({ jsonEditor: true, preserveFocus, revealSetting: { key: 'launch' } });
            return ({
                editor: editor ?? null,
                created: false
            });
        }
    };
    UserLaunch = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, preferences_1.IPreferencesService)
    ], UserLaunch);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb25maWd1cmF0aW9uTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdDb25maWd1cmF0aW9uTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQ2hHLE1BQU0sWUFBWSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUE0QixxQ0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDN0YsWUFBWSxDQUFDLGNBQWMsQ0FBQyw4QkFBYyxFQUFFLDJCQUFZLENBQUMsQ0FBQztJQUUxRCxNQUFNLDhCQUE4QixHQUFHLDBCQUEwQixDQUFDO0lBQ2xFLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUM7SUFDakQsa0ZBQWtGO0lBQ2xGLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUM7SUFDakQsTUFBTSxtQ0FBbUMsR0FBRyxtQ0FBbUMsQ0FBQztJQUl6RSxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtRQVloQyxZQUNrQixjQUErQixFQUN0QixjQUF5RCxFQUM1RCxvQkFBNEQsRUFDL0QsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUNsRSxjQUFnRCxFQUM5QyxnQkFBb0QsRUFDdEQsY0FBZ0QsRUFDNUMsa0JBQXdELEVBQ3pELGlCQUFxQztZQVR4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDTCxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM5QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDakQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDckMsbUJBQWMsR0FBZCxj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