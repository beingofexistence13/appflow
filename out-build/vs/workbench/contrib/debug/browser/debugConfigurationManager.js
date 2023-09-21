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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/debug/browser/debugConfigurationManager", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSchemas", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/history/common/history", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, json, lifecycle_1, objects, resources, uri_1, nls, configuration_1, contextkey_1, files_1, instantiation_1, jsonContributionRegistry_1, quickInput_1, platform_1, storage_1, themables_1, uriIdentity_1, workspace_1, debugIcons_1, debug_1, debugSchemas_1, debugUtils_1, configuration_2, editorService_1, extensions_1, history_1, preferences_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PRb = void 0;
    const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    jsonRegistry.registerSchema(configuration_2.$_D, debugSchemas_1.$NRb);
    const DEBUG_SELECTED_CONFIG_NAME_KEY = 'debug.selectedconfigname';
    const DEBUG_SELECTED_ROOT = 'debug.selectedroot';
    // Debug type is only stored if a dynamic configuration is used for better restore
    const DEBUG_SELECTED_TYPE = 'debug.selectedtype';
    const DEBUG_RECENT_DYNAMIC_CONFIGURATIONS = 'debug.recentdynamicconfigurations';
    let $PRb = class $PRb {
        constructor(q, r, s, u, v, w, x, y, z, contextKeyService) {
            this.q = q;
            this.r = r;
            this.s = s;
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.g = () => Promise.resolve(undefined);
            this.j = false;
            this.m = new event_1.$fd();
            this.n = [];
            this.k = [];
            this.B();
            this.C();
            this.A();
            const previousSelectedRoot = this.w.get(DEBUG_SELECTED_ROOT, 1 /* StorageScope.WORKSPACE */);
            const previousSelectedType = this.w.get(DEBUG_SELECTED_TYPE, 1 /* StorageScope.WORKSPACE */);
            const previousSelectedLaunch = this.a.find(l => l.uri.toString() === previousSelectedRoot);
            const previousSelectedName = this.w.get(DEBUG_SELECTED_CONFIG_NAME_KEY, 1 /* StorageScope.WORKSPACE */);
            this.o = debug_1.$tG.bindTo(contextKeyService);
            const dynamicConfig = previousSelectedType ? { type: previousSelectedType } : undefined;
            if (previousSelectedLaunch && previousSelectedLaunch.getConfigurationNames().length) {
                this.selectConfiguration(previousSelectedLaunch, previousSelectedName, undefined, dynamicConfig);
            }
            else if (this.a.length > 0) {
                this.selectConfiguration(undefined, previousSelectedName, undefined, dynamicConfig);
            }
        }
        registerDebugConfigurationProvider(debugConfigurationProvider) {
            this.n.push(debugConfigurationProvider);
            return {
                dispose: () => {
                    this.unregisterDebugConfigurationProvider(debugConfigurationProvider);
                }
            };
        }
        unregisterDebugConfigurationProvider(debugConfigurationProvider) {
            const ix = this.n.indexOf(debugConfigurationProvider);
            if (ix >= 0) {
                this.n.splice(ix, 1);
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
            const provider = this.n.find(p => p.provideDebugConfigurations && (p.type === debugType) && (p.triggerKind === triggerKind));
            return !!provider;
        }
        async resolveConfigurationByProviders(folderUri, type, config, token) {
            const resolveDebugConfigurationForType = async (type, config) => {
                if (type !== '*') {
                    await this.q.activateDebuggers('onDebugResolve', type);
                }
                for (const p of this.n) {
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
            const providers = this.n.filter(p => p.type === type && p.resolveDebugConfigurationWithSubstitutedVariables)
                .concat(this.n.filter(p => p.type === '*' && p.resolveDebugConfigurationWithSubstitutedVariables));
            let result = config;
            await (0, async_1.$Jg)(providers.map(provider => async () => {
                // If any provider returned undefined or null make sure to respect that and do not pass the result to more resolver
                if (result) {
                    result = await provider.resolveDebugConfigurationWithSubstitutedVariables(folderUri, result, token);
                }
            }));
            return result;
        }
        async provideDebugConfigurations(folderUri, type, token) {
            await this.q.activateDebuggers('onDebugInitialConfigurations');
            const results = await Promise.all(this.n.filter(p => p.type === type && p.triggerKind === debug_1.DebugConfigurationProviderTriggerKind.Initial && p.provideDebugConfigurations).map(p => p.provideDebugConfigurations(folderUri, token)));
            return results.reduce((first, second) => first.concat(second), []);
        }
        async getDynamicProviders() {
            await this.x.whenInstalledExtensionsRegistered();
            const onDebugDynamicConfigurationsName = 'onDebugDynamicConfigurations';
            const debugDynamicExtensionsTypes = this.x.extensions.reduce((acc, e) => {
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
                    label: this.q.getDebuggerLabel(type),
                    getProvider: async () => {
                        await this.q.activateDebuggers(onDebugDynamicConfigurationsName, type);
                        return this.n.find(p => p.type === type && p.triggerKind === debug_1.DebugConfigurationProviderTriggerKind.Dynamic && p.provideDebugConfigurations);
                    },
                    type,
                    pick: async () => {
                        // Do a late 'onDebugDynamicConfigurationsName' activation so extensions are not activated too early #108578
                        await this.q.activateDebuggers(onDebugDynamicConfigurationsName, type);
                        const token = new cancellation_1.$pd();
                        const picks = [];
                        const provider = this.n.find(p => p.type === type && p.triggerKind === debug_1.DebugConfigurationProviderTriggerKind.Dynamic && p.provideDebugConfigurations);
                        this.getLaunches().forEach(launch => {
                            if (launch.workspace && provider) {
                                picks.push(provider.provideDebugConfigurations(launch.workspace.uri, token.token).then(configurations => configurations.map(config => ({
                                    label: config.name,
                                    description: launch.name,
                                    config,
                                    buttons: [{
                                            iconClass: themables_1.ThemeIcon.asClassName(debugIcons_1.$mnb),
                                            tooltip: nls.localize(0, null)
                                        }],
                                    launch
                                }))));
                            }
                        });
                        const disposables = new lifecycle_1.$jc();
                        const input = disposables.add(this.u.createQuickPick());
                        input.busy = true;
                        input.placeholder = nls.localize(1, null);
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
                        const items = (0, arrays_1.$Pb)(nestedPicks);
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
            for (const l of this.a) {
                for (const name of l.getConfigurationNames()) {
                    const config = l.getConfiguration(name) || l.getCompound(name);
                    if (config) {
                        all.push({ launch: l, name, presentation: config.presentation });
                    }
                }
            }
            return (0, debugUtils_1.$sF)(all);
        }
        removeRecentDynamicConfigurations(name, type) {
            const remaining = this.getRecentDynamicConfigurations().filter(c => c.name !== name || c.type !== type);
            this.w.store(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, JSON.stringify(remaining), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            if (this.selectedConfiguration.name === name && this.h === type && this.j) {
                this.selectConfiguration(undefined, undefined);
            }
            else {
                this.m.fire();
            }
        }
        getRecentDynamicConfigurations() {
            return JSON.parse(this.w.get(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, 1 /* StorageScope.WORKSPACE */, '[]'));
        }
        A() {
            this.k.push(event_1.Event.any(this.r.onDidChangeWorkspaceFolders, this.r.onDidChangeWorkbenchState)(() => {
                this.B();
                this.selectConfiguration(undefined);
                this.C();
            }));
            this.k.push(this.s.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration('launch')) {
                    // A change happen in the launch.json. If there is already a launch configuration selected, do not change the selection.
                    await this.selectConfiguration(undefined);
                    this.C();
                }
            }));
            this.k.push(this.q.onDidDebuggersExtPointRead(() => {
                this.C();
            }));
        }
        B() {
            this.a = this.r.getWorkspace().folders.map(folder => this.v.createInstance(Launch, this, this.q, folder));
            if (this.r.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                this.a.push(this.v.createInstance(WorkspaceLaunch, this, this.q));
            }
            this.a.push(this.v.createInstance(UserLaunch, this, this.q));
            if (this.d && this.a.indexOf(this.d) === -1) {
                this.selectConfiguration(undefined);
            }
        }
        C() {
            const compoundConfigurationsSchema = debugSchemas_1.$NRb.properties['compounds'].items.properties['configurations'];
            const launchNames = this.a.map(l => l.getConfigurationNames(true)).reduce((first, second) => first.concat(second), []);
            compoundConfigurationsSchema.items.oneOf[0].enum = launchNames;
            compoundConfigurationsSchema.items.oneOf[1].properties.name.enum = launchNames;
            const folderNames = this.r.getWorkspace().folders.map(f => f.name);
            compoundConfigurationsSchema.items.oneOf[1].properties.folder.enum = folderNames;
            jsonRegistry.registerSchema(configuration_2.$_D, debugSchemas_1.$NRb);
        }
        getLaunches() {
            return this.a;
        }
        getLaunch(workspaceUri) {
            if (!uri_1.URI.isUri(workspaceUri)) {
                return undefined;
            }
            return this.a.find(l => l.workspace && this.z.extUri.isEqual(l.workspace.uri, workspaceUri));
        }
        get selectedConfiguration() {
            return {
                launch: this.d,
                name: this.b,
                getConfig: this.g,
                type: this.h
            };
        }
        get onDidSelectConfiguration() {
            return this.m.event;
        }
        getWorkspaceLaunch() {
            if (this.r.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                return this.a[this.a.length - 1];
            }
            return undefined;
        }
        async selectConfiguration(launch, name, config, dynamicConfig) {
            if (typeof launch === 'undefined') {
                const rootUri = this.y.getLastActiveWorkspaceRoot();
                launch = this.getLaunch(rootUri);
                if (!launch || launch.getConfigurationNames().length === 0) {
                    launch = this.a.find(l => !!(l && l.getConfigurationNames().length)) || launch || this.a[0];
                }
            }
            const previousLaunch = this.d;
            const previousName = this.b;
            const previousSelectedDynamic = this.j;
            this.d = launch;
            if (this.d) {
                this.w.store(DEBUG_SELECTED_ROOT, this.d.uri.toString(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.w.remove(DEBUG_SELECTED_ROOT, 1 /* StorageScope.WORKSPACE */);
            }
            const names = launch ? launch.getConfigurationNames() : [];
            this.g = () => {
                const selected = this.b ? launch?.getConfiguration(this.b) : undefined;
                return Promise.resolve(selected || config);
            };
            let type = config?.type;
            if (name && names.indexOf(name) >= 0) {
                this.D(name);
            }
            else if (dynamicConfig && dynamicConfig.type) {
                // We could not find the previously used name and config is not passed. We should get all dynamic configurations from providers
                // And potentially auto select the previously used dynamic configuration #96293
                type = dynamicConfig.type;
                if (!config) {
                    const providers = (await this.getDynamicProviders()).filter(p => p.type === type);
                    this.g = async () => {
                        const activatedProviders = await Promise.all(providers.map(p => p.getProvider()));
                        const provider = activatedProviders.length > 0 ? activatedProviders[0] : undefined;
                        if (provider && launch && launch.workspace) {
                            const token = new cancellation_1.$pd();
                            const dynamicConfigs = await provider.provideDebugConfigurations(launch.workspace.uri, token.token);
                            const dynamicConfig = dynamicConfigs.find(c => c.name === name);
                            if (dynamicConfig) {
                                return dynamicConfig;
                            }
                        }
                        return undefined;
                    };
                }
                this.D(name);
                let recentDynamicProviders = this.getRecentDynamicConfigurations();
                if (name && dynamicConfig.type) {
                    // We need to store the recently used dynamic configurations to be able to show them in UI #110009
                    recentDynamicProviders.unshift({ name, type: dynamicConfig.type });
                    recentDynamicProviders = (0, arrays_1.$Kb)(recentDynamicProviders, t => `${t.name} : ${t.type}`);
                    this.w.store(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, JSON.stringify(recentDynamicProviders), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            }
            else if (!this.b || names.indexOf(this.b) === -1) {
                // We could not find the configuration to select, pick the first one, or reset the selection if there is no launch configuration
                const nameToSet = names.length ? names[0] : undefined;
                this.D(nameToSet);
            }
            if (!config && launch && this.b) {
                config = launch.getConfiguration(this.b);
                type = config?.type;
            }
            this.h = dynamicConfig?.type || config?.type;
            this.j = !!dynamicConfig;
            // Only store the selected type if we are having a dynamic configuration. Otherwise restoring this configuration from storage might be misindentified as a dynamic configuration
            this.w.store(DEBUG_SELECTED_TYPE, dynamicConfig ? this.h : undefined, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            if (type) {
                this.o.set(type);
            }
            else {
                this.o.reset();
            }
            if (this.d !== previousLaunch || this.b !== previousName || previousSelectedDynamic !== this.j) {
                this.m.fire();
            }
        }
        D(selectedName) {
            this.b = selectedName;
            if (this.b) {
                this.w.store(DEBUG_SELECTED_CONFIG_NAME_KEY, this.b, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.w.remove(DEBUG_SELECTED_CONFIG_NAME_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
        dispose() {
            this.k = (0, lifecycle_1.$fc)(this.k);
        }
    };
    exports.$PRb = $PRb;
    exports.$PRb = $PRb = __decorate([
        __param(1, workspace_1.$Kh),
        __param(2, configuration_1.$8h),
        __param(3, quickInput_1.$Gq),
        __param(4, instantiation_1.$Ah),
        __param(5, storage_1.$Vo),
        __param(6, extensions_1.$MF),
        __param(7, history_1.$SM),
        __param(8, uriIdentity_1.$Ck),
        __param(9, contextkey_1.$3i)
    ], $PRb);
    class AbstractLaunch {
        constructor(b, d) {
            this.b = b;
            this.d = d;
        }
        getCompound(name) {
            const config = this.a();
            if (!config || !config.compounds) {
                return undefined;
            }
            return config.compounds.find(compound => compound.name === name);
        }
        getConfigurationNames(ignoreCompoundsAndPresentation = false) {
            const config = this.a();
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
                return (0, debugUtils_1.$sF)(configurations).map(c => c.name);
            }
        }
        getConfiguration(name) {
            // We need to clone the configuration in order to be able to make changes to it #42198
            const config = objects.$Vm(this.a());
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
            const adapter = type ? this.d.getEnabledDebugger(type) : await this.d.guessDebugger(true);
            if (adapter) {
                const initialConfigs = useInitialConfigs ?
                    await this.b.provideDebugConfigurations(folderUri, adapter.type, token || cancellation_1.CancellationToken.None) :
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
        constructor(configurationManager, adapterManager, workspace, g, h, j, k) {
            super(configurationManager, adapterManager);
            this.workspace = workspace;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
        }
        get uri() {
            return resources.$ig(this.workspace.uri, '/.vscode/launch.json');
        }
        get name() {
            return this.workspace.name;
        }
        a() {
            return this.k.inspect('launch', { resource: this.workspace.uri }).workspaceFolderValue;
        }
        async openConfigFile({ preserveFocus, type, suppressInitialConfigs }, token) {
            const resource = this.uri;
            let created = false;
            let content = '';
            try {
                const fileContent = await this.g.readFile(resource);
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
                    await this.h.write(resource, content);
                }
                catch (error) {
                    throw new Error(nls.localize(2, null, error.message));
                }
            }
            const index = content.indexOf(`"${this.b.selectedConfiguration.name}"`);
            let startLineNumber = 1;
            for (let i = 0; i < index; i++) {
                if (content.charAt(i) === '\n') {
                    startLineNumber++;
                }
            }
            const selection = startLineNumber > 1 ? { startLineNumber, startColumn: 4 } : undefined;
            const editor = await this.j.openEditor({
                resource,
                options: {
                    selection,
                    preserveFocus,
                    pinned: created,
                    revealIfVisible: true
                },
            }, editorService_1.$0C);
            return ({
                editor: editor ?? null,
                created
            });
        }
        async writeConfiguration(configuration) {
            const fullConfig = objects.$Vm(this.a());
            if (!fullConfig.configurations) {
                fullConfig.configurations = [];
            }
            fullConfig.configurations.push(configuration);
            await this.k.updateValue('launch', fullConfig, { resource: this.workspace.uri }, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
        }
    };
    Launch = __decorate([
        __param(3, files_1.$6j),
        __param(4, textfiles_1.$JD),
        __param(5, editorService_1.$9C),
        __param(6, configuration_1.$8h)
    ], Launch);
    let WorkspaceLaunch = class WorkspaceLaunch extends AbstractLaunch {
        constructor(configurationManager, adapterManager, g, h, j) {
            super(configurationManager, adapterManager);
            this.g = g;
            this.h = h;
            this.j = j;
        }
        get workspace() {
            return undefined;
        }
        get uri() {
            return this.j.getWorkspace().configuration;
        }
        get name() {
            return nls.localize(3, null);
        }
        a() {
            return this.h.inspect('launch').workspaceValue;
        }
        async openConfigFile({ preserveFocus, type, useInitialConfigs }, token) {
            const launchExistInFile = !!this.a();
            if (!launchExistInFile) {
                // Launch property in workspace config not found: create one by collecting launch configs from debugConfigProviders
                const content = await this.getInitialConfigurationContent(undefined, type, useInitialConfigs, token);
                if (content) {
                    await this.h.updateValue('launch', json.$Lm(content), 5 /* ConfigurationTarget.WORKSPACE */);
                }
                else {
                    return { editor: null, created: false };
                }
            }
            const editor = await this.g.openEditor({
                resource: this.j.getWorkspace().configuration,
                options: { preserveFocus }
            }, editorService_1.$0C);
            return ({
                editor: editor ?? null,
                created: false
            });
        }
    };
    WorkspaceLaunch = __decorate([
        __param(2, editorService_1.$9C),
        __param(3, configuration_1.$8h),
        __param(4, workspace_1.$Kh)
    ], WorkspaceLaunch);
    let UserLaunch = class UserLaunch extends AbstractLaunch {
        constructor(configurationManager, adapterManager, g, h) {
            super(configurationManager, adapterManager);
            this.g = g;
            this.h = h;
        }
        get workspace() {
            return undefined;
        }
        get uri() {
            return this.h.userSettingsResource;
        }
        get name() {
            return nls.localize(4, null);
        }
        get hidden() {
            return true;
        }
        a() {
            return this.g.inspect('launch').userValue;
        }
        async openConfigFile({ preserveFocus, type, useInitialContent }) {
            const editor = await this.h.openUserSettings({ jsonEditor: true, preserveFocus, revealSetting: { key: 'launch' } });
            return ({
                editor: editor ?? null,
                created: false
            });
        }
    };
    UserLaunch = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, preferences_1.$BE)
    ], UserLaunch);
});
//# sourceMappingURL=debugConfigurationManager.js.map