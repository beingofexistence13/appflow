/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/files/common/files", "vs/platform/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/objects", "vs/base/common/hash", "vs/base/common/resources", "vs/platform/registry/common/platform", "vs/base/common/types", "vs/platform/configuration/common/configurations"], function (require, exports, event_1, errors, lifecycle_1, async_1, files_1, configurationModels_1, configurationModels_2, configuration_1, configurationRegistry_1, objects_1, hash_1, resources_1, platform_1, types_1, configurations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u2b = exports.$t2b = exports.$s2b = exports.$r2b = exports.$q2b = exports.$p2b = void 0;
    class $p2b extends configurations_1.$wn {
        static { this.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY = 'DefaultOverridesCacheExists'; }
        constructor(s, environmentService) {
            super();
            this.s = s;
            this.j = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            this.m = {};
            this.n = { type: 'defaults', key: 'configurationDefaultsOverrides' };
            this.r = false;
            if (environmentService.options?.configurationDefaults) {
                this.j.registerDefaultConfigurations([{ overrides: environmentService.options.configurationDefaults }]);
            }
        }
        f() {
            return this.m;
        }
        async initialize() {
            await this.w();
            return super.initialize();
        }
        reload() {
            this.r = true;
            this.m = {};
            this.z();
            return super.reload();
        }
        hasCachedConfigurationDefaultsOverrides() {
            return !(0, types_1.$wf)(this.m);
        }
        w() {
            if (!this.u) {
                this.u = (async () => {
                    try {
                        // Read only when the cache exists
                        if (window.localStorage.getItem($p2b.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY)) {
                            const content = await this.s.read(this.n);
                            if (content) {
                                this.m = JSON.parse(content);
                            }
                        }
                    }
                    catch (error) { /* ignore */ }
                    this.m = (0, types_1.$lf)(this.m) ? this.m : {};
                })();
            }
            return this.u;
        }
        c(properties, defaultsOverrides) {
            super.c(properties, defaultsOverrides);
            if (defaultsOverrides) {
                this.z();
            }
        }
        async z() {
            if (!this.r) {
                return;
            }
            const cachedConfigurationDefaultsOverrides = {};
            const configurationDefaultsOverrides = this.j.getConfigurationDefaultsOverrides();
            for (const [key, value] of configurationDefaultsOverrides) {
                if (!configurationRegistry_1.$kn.test(key) && value.value !== undefined) {
                    cachedConfigurationDefaultsOverrides[key] = value.value;
                }
            }
            try {
                if (Object.keys(cachedConfigurationDefaultsOverrides).length) {
                    window.localStorage.setItem($p2b.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, 'yes');
                    await this.s.write(this.n, JSON.stringify(cachedConfigurationDefaultsOverrides));
                }
                else {
                    window.localStorage.removeItem($p2b.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY);
                    await this.s.remove(this.n);
                }
            }
            catch (error) { /* Ignore error */ }
        }
    }
    exports.$p2b = $p2b;
    class $q2b extends configurationModels_1.$sn {
        constructor(userDataProfilesService, fileService, uriIdentityService) {
            super(userDataProfilesService.defaultProfile.settingsResource, { scopes: [1 /* ConfigurationScope.APPLICATION */] }, uriIdentityService.extUri, fileService);
            this.h = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.h.event;
            this.B(this.onDidChange(() => this.j.schedule()));
            this.j = this.B(new async_1.$Sg(() => this.loadConfiguration().then(configurationModel => this.h.fire(configurationModel)), 50));
        }
        async initialize() {
            return this.loadConfiguration();
        }
        async loadConfiguration() {
            const model = await super.loadConfiguration();
            const value = model.getValue(configuration_1.$oE);
            const allProfilesSettings = Array.isArray(value) ? value : [];
            return this.f.include || allProfilesSettings.length
                ? this.reparse({ ...this.f, include: allProfilesSettings })
                : model;
        }
    }
    exports.$q2b = $q2b;
    class $r2b extends lifecycle_1.$kc {
        get hasTasksLoaded() { return this.b.value instanceof FileServiceBasedConfiguration; }
        constructor(g, h, j, m, n, r) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.a.event;
            this.b = this.B(new lifecycle_1.$lc());
            this.c = this.B(new lifecycle_1.$lc());
            this.b.value = new configurationModels_1.$sn(g, this.j, n.extUri, this.m);
            this.c.value = this.b.value.onDidChange(() => this.f.schedule());
            this.f = this.B(new async_1.$Sg(() => this.b.value.loadConfiguration().then(configurationModel => this.a.fire(configurationModel)), 50));
        }
        async reset(settingsResource, tasksResource, configurationParseOptions) {
            this.g = settingsResource;
            this.h = tasksResource;
            this.j = configurationParseOptions;
            const folder = this.n.extUri.dirname(this.g);
            const standAloneConfigurationResources = this.h ? [[configuration_1.$iE, this.h]] : [];
            const fileServiceBasedConfiguration = new FileServiceBasedConfiguration(folder.toString(), this.g, standAloneConfigurationResources, this.j, this.m, this.n, this.r);
            const configurationModel = await fileServiceBasedConfiguration.loadConfiguration();
            this.b.value = fileServiceBasedConfiguration;
            // Check for value because userConfiguration might have been disposed.
            if (this.c.value) {
                this.c.value = this.b.value.onDidChange(() => this.f.schedule());
            }
            return configurationModel;
        }
        async initialize() {
            return this.b.value.loadConfiguration();
        }
        async reload() {
            if (this.hasTasksLoaded) {
                return this.b.value.loadConfiguration();
            }
            return this.reset(this.g, this.h, this.j);
        }
        reparse(parseOptions) {
            this.j = { ...this.j, ...parseOptions };
            return this.b.value.reparse(this.j);
        }
        getRestrictedSettings() {
            return this.b.value.getRestrictedSettings();
        }
    }
    exports.$r2b = $r2b;
    class FileServiceBasedConfiguration extends lifecycle_1.$kc {
        constructor(name, j, m, configurationParseOptions, n, r, s) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.h = this.B(new event_1.$fd());
            this.onDidChange = this.h.event;
            this.a = [this.j, ...this.m.map(([, resource]) => resource)];
            this.B((0, lifecycle_1.$hc)(...this.a.map(resource => (0, lifecycle_1.$hc)(this.n.watch(r.extUri.dirname(resource)), 
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.n.watch(resource)))));
            this.b = new configurationModels_1.$rn(name);
            this.c = configurationParseOptions;
            this.f = [];
            this.g = new configurationModels_1.$qn();
            this.B(event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(this.n.onDidFilesChange, e => this.u(e)), event_1.Event.filter(this.n.onDidRunOperation, e => this.w(e))), () => undefined, 100)(() => this.h.fire()));
        }
        async resolveContents() {
            const resolveContents = async (resources) => {
                return Promise.all(resources.map(async (resource) => {
                    try {
                        const content = await this.n.readFile(resource, { atomic: true });
                        return content.value.toString();
                    }
                    catch (error) {
                        this.s.trace(`Error while resolving configuration file '${resource.toString()}': ${errors.$8(error)}`);
                        if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */
                            && error.fileOperationResult !== 9 /* FileOperationResult.FILE_NOT_DIRECTORY */) {
                            this.s.error(error);
                        }
                    }
                    return '{}';
                }));
            };
            const [[settingsContent], standAloneConfigurationContents] = await Promise.all([
                resolveContents([this.j]),
                resolveContents(this.m.map(([, resource]) => resource)),
            ]);
            return [settingsContent, standAloneConfigurationContents.map((content, index) => ([this.m[index][0], content]))];
        }
        async loadConfiguration() {
            const [settingsContent, standAloneConfigurationContents] = await this.resolveContents();
            // reset
            this.f = [];
            this.b.parse('', this.c);
            // parse
            if (settingsContent !== undefined) {
                this.b.parse(settingsContent, this.c);
            }
            for (let index = 0; index < standAloneConfigurationContents.length; index++) {
                const contents = standAloneConfigurationContents[index][1];
                if (contents !== undefined) {
                    const standAloneConfigurationModelParser = new configurationModels_2.$l2b(this.m[index][1].toString(), this.m[index][0]);
                    standAloneConfigurationModelParser.parse(contents);
                    this.f.push(standAloneConfigurationModelParser.configurationModel);
                }
            }
            // Consolidate (support *.json files in the workspace settings folder)
            this.t();
            return this.g;
        }
        getRestrictedSettings() {
            return this.b.restrictedConfigurations;
        }
        reparse(configurationParseOptions) {
            const oldContents = this.b.configurationModel.contents;
            this.c = configurationParseOptions;
            this.b.reparse(this.c);
            if (!(0, objects_1.$Zm)(oldContents, this.b.configurationModel.contents)) {
                this.t();
            }
            return this.g;
        }
        t() {
            this.g = this.b.configurationModel.merge(...this.f);
        }
        u(event) {
            // One of the resources has changed
            if (this.a.some(resource => event.contains(resource))) {
                return true;
            }
            // One of the resource's parent got deleted
            if (this.a.some(resource => event.contains(this.r.extUri.dirname(resource), 2 /* FileChangeType.DELETED */))) {
                return true;
            }
            return false;
        }
        w(event) {
            // One of the resources has changed
            if ((event.isOperation(0 /* FileOperation.CREATE */) || event.isOperation(3 /* FileOperation.COPY */) || event.isOperation(1 /* FileOperation.DELETE */) || event.isOperation(4 /* FileOperation.WRITE */))
                && this.a.some(resource => this.r.extUri.isEqual(event.resource, resource))) {
                return true;
            }
            // One of the resource's parent got deleted
            if (event.isOperation(1 /* FileOperation.DELETE */) && this.a.some(resource => this.r.extUri.isEqual(event.resource, this.r.extUri.dirname(resource)))) {
                return true;
            }
            return false;
        }
    }
    class $s2b extends lifecycle_1.$kc {
        constructor(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService) {
            super();
            this.f = null;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidInitialize = this.h.event;
            this.b = fileService;
            this.c = this.a = new CachedRemoteUserConfiguration(remoteAuthority, configurationCache, { scopes: configuration_1.$fE });
            remoteAgentService.getEnvironment().then(async (environment) => {
                if (environment) {
                    const userConfiguration = this.B(new FileServiceBasedRemoteUserConfiguration(environment.settingsPath, { scopes: configuration_1.$fE }, this.b, uriIdentityService));
                    this.B(userConfiguration.onDidChangeConfiguration(configurationModel => this.j(configurationModel)));
                    this.f = userConfiguration.initialize();
                    const configurationModel = await this.f;
                    this.c.dispose();
                    this.c = userConfiguration;
                    this.j(configurationModel);
                    this.h.fire(configurationModel);
                }
            });
        }
        async initialize() {
            if (this.c instanceof FileServiceBasedRemoteUserConfiguration) {
                return this.c.initialize();
            }
            // Initialize cached configuration
            let configurationModel = await this.c.initialize();
            if (this.f) {
                // Use user configuration
                configurationModel = await this.f;
                this.f = null;
            }
            return configurationModel;
        }
        reload() {
            return this.c.reload();
        }
        reparse() {
            return this.c.reparse({ scopes: configuration_1.$fE });
        }
        getRestrictedSettings() {
            return this.c.getRestrictedSettings();
        }
        j(configurationModel) {
            this.m();
            this.g.fire(configurationModel);
        }
        async m() {
            if (this.c instanceof FileServiceBasedRemoteUserConfiguration) {
                let content;
                try {
                    content = await this.c.resolveContent();
                }
                catch (error) {
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        return;
                    }
                }
                await this.a.updateConfiguration(content);
            }
        }
    }
    exports.$s2b = $s2b;
    class FileServiceBasedRemoteUserConfiguration extends lifecycle_1.$kc {
        constructor(j, configurationParseOptions, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.f.event;
            this.g = lifecycle_1.$kc.None;
            this.h = lifecycle_1.$kc.None;
            this.a = new configurationModels_1.$rn(this.j.toString());
            this.b = configurationParseOptions;
            this.B(m.onDidFilesChange(e => this.w(e)));
            this.B(m.onDidRunOperation(e => this.y(e)));
            this.c = this.B(new async_1.$Sg(() => this.reload().then(configurationModel => this.f.fire(configurationModel)), 50));
            this.B((0, lifecycle_1.$ic)(() => {
                this.s();
                this.u();
            }));
        }
        r() {
            this.g = this.m.watch(this.j);
        }
        s() {
            this.g.dispose();
            this.g = lifecycle_1.$kc.None;
        }
        t() {
            const directory = this.n.extUri.dirname(this.j);
            this.h = this.m.watch(directory);
        }
        u() {
            this.h.dispose();
            this.h = lifecycle_1.$kc.None;
        }
        async initialize() {
            const exists = await this.m.exists(this.j);
            this.z(exists);
            return this.reload();
        }
        async resolveContent() {
            const content = await this.m.readFile(this.j, { atomic: true });
            return content.value.toString();
        }
        async reload() {
            try {
                const content = await this.resolveContent();
                this.a.parse(content, this.b);
                return this.a.configurationModel;
            }
            catch (e) {
                return new configurationModels_1.$qn();
            }
        }
        reparse(configurationParseOptions) {
            this.b = configurationParseOptions;
            this.a.reparse(this.b);
            return this.a.configurationModel;
        }
        getRestrictedSettings() {
            return this.a.restrictedConfigurations;
        }
        w(event) {
            // Find changes that affect the resource
            let affectedByChanges = event.contains(this.j, 0 /* FileChangeType.UPDATED */);
            if (event.contains(this.j, 1 /* FileChangeType.ADDED */)) {
                affectedByChanges = true;
                this.z(true);
            }
            else if (event.contains(this.j, 2 /* FileChangeType.DELETED */)) {
                affectedByChanges = true;
                this.z(false);
            }
            if (affectedByChanges) {
                this.c.schedule();
            }
        }
        y(event) {
            if ((event.isOperation(0 /* FileOperation.CREATE */) || event.isOperation(3 /* FileOperation.COPY */) || event.isOperation(1 /* FileOperation.DELETE */) || event.isOperation(4 /* FileOperation.WRITE */))
                && this.n.extUri.isEqual(event.resource, this.j)) {
                this.c.schedule();
            }
        }
        z(exists) {
            if (exists) {
                this.u();
                this.r();
            }
            else {
                this.s();
                this.t();
            }
        }
    }
    class CachedRemoteUserConfiguration extends lifecycle_1.$kc {
        constructor(remoteAuthority, h, configurationParseOptions) {
            super();
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = { type: 'user', key: remoteAuthority };
            this.c = new configurationModels_1.$rn('CachedRemoteUserConfiguration');
            this.f = configurationParseOptions;
            this.g = new configurationModels_1.$qn();
        }
        getConfigurationModel() {
            return this.g;
        }
        initialize() {
            return this.reload();
        }
        reparse(configurationParseOptions) {
            this.f = configurationParseOptions;
            this.c.reparse(this.f);
            this.g = this.c.configurationModel;
            return this.g;
        }
        getRestrictedSettings() {
            return this.c.restrictedConfigurations;
        }
        async reload() {
            try {
                const content = await this.h.read(this.b);
                const parsed = JSON.parse(content);
                if (parsed.content) {
                    this.c.parse(parsed.content, this.f);
                    this.g = this.c.configurationModel;
                }
            }
            catch (e) { /* Ignore error */ }
            return this.g;
        }
        async updateConfiguration(content) {
            if (content) {
                return this.h.write(this.b, JSON.stringify({ content }));
            }
            else {
                return this.h.remove(this.b);
            }
        }
    }
    class $t2b extends lifecycle_1.$kc {
        get initialized() { return this.j; }
        constructor(m, n, r, s) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.c = this.B(new lifecycle_1.$jc());
            this.f = null;
            this.g = false;
            this.h = this.B(new event_1.$fd());
            this.onDidUpdateConfiguration = this.h.event;
            this.j = false;
            this.n = n;
            this.b = this.a = new CachedWorkspaceConfiguration(m);
        }
        async initialize(workspaceIdentifier, workspaceTrusted) {
            this.f = workspaceIdentifier;
            this.g = workspaceTrusted;
            if (!this.j) {
                if (this.m.needsCaching(this.f.configPath)) {
                    this.b = this.a;
                    this.t(this.f);
                }
                else {
                    this.u(new FileServiceBasedWorkspaceConfiguration(this.n, this.r, this.s));
                }
            }
            await this.reload();
        }
        async reload() {
            if (this.f) {
                await this.b.load(this.f, { scopes: configuration_1.$gE, skipRestricted: this.w() });
            }
        }
        getFolders() {
            return this.b.getFolders();
        }
        setFolders(folders, jsonEditingService) {
            if (this.f) {
                return jsonEditingService.write(this.f.configPath, [{ path: ['folders'], value: folders }], true)
                    .then(() => this.reload());
            }
            return Promise.resolve();
        }
        isTransient() {
            return this.b.isTransient();
        }
        getConfiguration() {
            return this.b.getWorkspaceSettings();
        }
        updateWorkspaceTrust(trusted) {
            this.g = trusted;
            return this.reparseWorkspaceSettings();
        }
        reparseWorkspaceSettings() {
            this.b.reparseWorkspaceSettings({ scopes: configuration_1.$gE, skipRestricted: this.w() });
            return this.getConfiguration();
        }
        getRestrictedSettings() {
            return this.b.getRestrictedSettings();
        }
        async t(workspaceIdentifier) {
            await (0, files_1.$zk)(workspaceIdentifier.configPath, this.n);
            if (!(this.b instanceof FileServiceBasedWorkspaceConfiguration)) {
                const fileServiceBasedWorkspaceConfiguration = this.B(new FileServiceBasedWorkspaceConfiguration(this.n, this.r, this.s));
                await fileServiceBasedWorkspaceConfiguration.load(workspaceIdentifier, { scopes: configuration_1.$gE, skipRestricted: this.w() });
                this.u(fileServiceBasedWorkspaceConfiguration);
                this.y(false, true);
            }
        }
        u(fileServiceBasedWorkspaceConfiguration) {
            this.c.clear();
            this.b = this.c.add(fileServiceBasedWorkspaceConfiguration);
            this.c.add(this.b.onDidChange(e => this.y(true, false)));
            this.j = true;
        }
        w() {
            return !this.g;
        }
        async y(reload, fromCache) {
            if (reload) {
                await this.reload();
            }
            this.z();
            this.h.fire(fromCache);
        }
        async z() {
            if (this.f && this.m.needsCaching(this.f.configPath) && this.b instanceof FileServiceBasedWorkspaceConfiguration) {
                const content = await this.b.resolveContent(this.f);
                await this.a.updateWorkspace(this.f, content);
            }
        }
    }
    exports.$t2b = $t2b;
    class FileServiceBasedWorkspaceConfiguration extends lifecycle_1.$kc {
        constructor(g, uriIdentityService, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = null;
            this.f = this.B(new event_1.$fd());
            this.onDidChange = this.f.event;
            this.workspaceConfigurationModelParser = new configurationModels_2.$k2b('');
            this.workspaceSettings = new configurationModels_1.$qn();
            this.B(event_1.Event.any(event_1.Event.filter(this.g.onDidFilesChange, e => !!this.a && e.contains(this.a.configPath)), event_1.Event.filter(this.g.onDidRunOperation, e => !!this.a && (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */) || e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(4 /* FileOperation.WRITE */)) && uriIdentityService.extUri.isEqual(e.resource, this.a.configPath)))(() => this.c.schedule()));
            this.c = this.B(new async_1.$Sg(() => this.f.fire(), 50));
            this.b = this.B(this.m());
        }
        get workspaceIdentifier() {
            return this.a;
        }
        async resolveContent(workspaceIdentifier) {
            const content = await this.g.readFile(workspaceIdentifier.configPath, { atomic: true });
            return content.value.toString();
        }
        async load(workspaceIdentifier, configurationParseOptions) {
            if (!this.a || this.a.id !== workspaceIdentifier.id) {
                this.a = workspaceIdentifier;
                this.workspaceConfigurationModelParser = new configurationModels_2.$k2b(this.a.id);
                (0, lifecycle_1.$fc)(this.b);
                this.b = this.B(this.m());
            }
            let contents = '';
            try {
                contents = await this.resolveContent(this.a);
            }
            catch (error) {
                const exists = await this.g.exists(this.a.configPath);
                if (exists) {
                    this.h.error(error);
                }
            }
            this.workspaceConfigurationModelParser.parse(contents, configurationParseOptions);
            this.j();
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
            this.j();
            return this.getWorkspaceSettings();
        }
        getRestrictedSettings() {
            return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
        }
        j() {
            this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
        }
        m() {
            return this.a ? this.g.watch(this.a.configPath) : lifecycle_1.$kc.None;
        }
    }
    class CachedWorkspaceConfiguration {
        constructor(a) {
            this.a = a;
            this.onDidChange = event_1.Event.None;
            this.workspaceConfigurationModelParser = new configurationModels_2.$k2b('');
            this.workspaceSettings = new configurationModels_1.$qn();
        }
        async load(workspaceIdentifier, configurationParseOptions) {
            try {
                const key = this.c(workspaceIdentifier);
                const contents = await this.a.read(key);
                const parsed = JSON.parse(contents);
                if (parsed.content) {
                    this.workspaceConfigurationModelParser = new configurationModels_2.$k2b(key.key);
                    this.workspaceConfigurationModelParser.parse(parsed.content, configurationParseOptions);
                    this.b();
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
            this.b();
            return this.getWorkspaceSettings();
        }
        getRestrictedSettings() {
            return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
        }
        b() {
            this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
        }
        async updateWorkspace(workspaceIdentifier, content) {
            try {
                const key = this.c(workspaceIdentifier);
                if (content) {
                    await this.a.write(key, JSON.stringify({ content }));
                }
                else {
                    await this.a.remove(key);
                }
            }
            catch (error) {
            }
        }
        c(workspaceIdentifier) {
            return {
                type: 'workspaces',
                key: workspaceIdentifier.id
            };
        }
    }
    class CachedFolderConfiguration {
        constructor(folder, configFolderRelativePath, configurationParseOptions, g) {
            this.g = g;
            this.onDidChange = event_1.Event.None;
            this.f = { type: 'folder', key: (0, hash_1.$pi)((0, resources_1.$ig)(folder, configFolderRelativePath).toString()).toString(16) };
            this.a = new configurationModels_1.$rn('CachedFolderConfiguration');
            this.b = configurationParseOptions;
            this.c = [];
            this.d = new configurationModels_1.$qn();
        }
        async loadConfiguration() {
            try {
                const contents = await this.g.read(this.f);
                const { content: configurationContents } = JSON.parse(contents.toString());
                if (configurationContents) {
                    for (const key of Object.keys(configurationContents)) {
                        if (key === configuration_1.$4D) {
                            this.a.parse(configurationContents[key], this.b);
                        }
                        else {
                            const standAloneConfigurationModelParser = new configurationModels_2.$l2b(key, key);
                            standAloneConfigurationModelParser.parse(configurationContents[key]);
                            this.c.push(standAloneConfigurationModelParser.configurationModel);
                        }
                    }
                }
                this.h();
            }
            catch (e) {
            }
            return this.d;
        }
        async updateConfiguration(settingsContent, standAloneConfigurationContents) {
            const content = {};
            if (settingsContent) {
                content[configuration_1.$4D] = settingsContent;
            }
            standAloneConfigurationContents.forEach(([key, contents]) => {
                if (contents) {
                    content[key] = contents;
                }
            });
            if (Object.keys(content).length) {
                await this.g.write(this.f, JSON.stringify({ content }));
            }
            else {
                await this.g.remove(this.f);
            }
        }
        getRestrictedSettings() {
            return this.a.restrictedConfigurations;
        }
        reparse(configurationParseOptions) {
            this.b = configurationParseOptions;
            this.a.reparse(this.b);
            this.h();
            return this.d;
        }
        h() {
            this.d = this.a.configurationModel.merge(...this.c);
        }
        getUnsupportedKeys() {
            return [];
        }
    }
    class $u2b extends lifecycle_1.$kc {
        constructor(useCache, workspaceFolder, configFolderRelativePath, h, j, fileService, uriIdentityService, logService, m) {
            super();
            this.workspaceFolder = workspaceFolder;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.c = 3 /* WorkbenchState.WORKSPACE */ === this.h ? configuration_1.$hE : configuration_1.$gE;
            this.f = uriIdentityService.extUri.joinPath(workspaceFolder.uri, configFolderRelativePath);
            this.g = new CachedFolderConfiguration(workspaceFolder.uri, configFolderRelativePath, { scopes: this.c, skipRestricted: this.n() }, m);
            if (useCache && this.m.needsCaching(workspaceFolder.uri)) {
                this.b = this.g;
                (0, files_1.$zk)(workspaceFolder.uri, fileService)
                    .then(() => {
                    this.b = this.B(this.s(fileService, uriIdentityService, logService));
                    this.B(this.b.onDidChange(e => this.r()));
                    this.r();
                });
            }
            else {
                this.b = this.B(this.s(fileService, uriIdentityService, logService));
                this.B(this.b.onDidChange(e => this.r()));
            }
        }
        loadConfiguration() {
            return this.b.loadConfiguration();
        }
        updateWorkspaceTrust(trusted) {
            this.j = trusted;
            return this.reparse();
        }
        reparse() {
            const configurationModel = this.b.reparse({ scopes: this.c, skipRestricted: this.n() });
            this.t();
            return configurationModel;
        }
        getRestrictedSettings() {
            return this.b.getRestrictedSettings();
        }
        n() {
            return !this.j;
        }
        r() {
            this.t();
            this.a.fire();
        }
        s(fileService, uriIdentityService, logService) {
            const settingsResource = uriIdentityService.extUri.joinPath(this.f, `${configuration_1.$4D}.json`);
            const standAloneConfigurationResources = [configuration_1.$iE, configuration_1.$jE].map(name => ([name, uriIdentityService.extUri.joinPath(this.f, `${name}.json`)]));
            return new FileServiceBasedConfiguration(this.f.toString(), settingsResource, standAloneConfigurationResources, { scopes: this.c, skipRestricted: this.n() }, fileService, uriIdentityService, logService);
        }
        async t() {
            if (this.m.needsCaching(this.f) && this.b instanceof FileServiceBasedConfiguration) {
                const [settingsContent, standAloneConfigurationContents] = await this.b.resolveContents();
                this.g.updateConfiguration(settingsContent, standAloneConfigurationContents);
            }
        }
    }
    exports.$u2b = $u2b;
});
//# sourceMappingURL=configuration.js.map