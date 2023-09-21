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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurations", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/configuration/common/configurationEditing", "vs/workbench/services/configuration/browser/configuration", "vs/base/common/performance", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/errorMessage", "vs/platform/workspace/common/workspaceTrust", "vs/base/common/arrays", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/assignment/common/assignmentService", "vs/base/common/types", "vs/nls!vs/workbench/services/configuration/browser/configurationService", "vs/platform/policy/common/policy", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/common/configuration"], function (require, exports, uri_1, event_1, map_1, objects_1, lifecycle_1, async_1, jsonContributionRegistry_1, workspace_1, configurationModels_1, configuration_1, configurations_1, configurationModels_2, configuration_2, platform_1, configurationRegistry_1, workspaces_1, configurationEditing_1, configuration_3, performance_1, environmentService_1, contributions_1, lifecycle_2, errorMessage_1, workspaceTrust_1, arrays_1, extensions_1, assignmentService_1, types_1, nls_1, policy_1, jsonEditing_1, configuration_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v2b = void 0;
    function getLocalUserConfigurationScopes(userDataProfile, hasRemote) {
        return (userDataProfile.isDefault || userDataProfile.useDefaultFlags?.settings)
            ? hasRemote ? configuration_2.$eE : undefined
            : hasRemote ? configuration_2.$dE : configuration_2.$cE;
    }
    class Workspace extends workspace_1.$Uh {
        constructor() {
            super(...arguments);
            this.initialized = false;
        }
    }
    class $v2b extends lifecycle_1.$kc {
        get restrictedSettings() { return this.M; }
        constructor({ remoteAuthority, configurationCache }, environmentService, R, S, U, W, X, Y, policyService) {
            super();
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.n = false;
            this.t = null;
            this.y = null;
            this.F = this.B(new event_1.$fd());
            this.onDidChangeConfiguration = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onWillChangeWorkspaceFolders = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onDidChangeWorkspaceFolders = this.H.event;
            this.I = this.B(new event_1.$fd());
            this.onDidChangeWorkspaceName = this.I.event;
            this.J = this.B(new event_1.$fd());
            this.onDidChangeWorkbenchState = this.J.event;
            this.L = true;
            this.M = { default: [] };
            this.N = this.B(new event_1.$fd());
            this.onDidChangeRestrictedSettings = this.N.event;
            this.O = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            this.g = new async_1.$Fg();
            this.h = new async_1.$Fg();
            this.r = this.B(new configuration_3.$p2b(configurationCache, environmentService));
            this.s = policyService instanceof policy_1.$_m ? new configurations_1.$xn() : this.B(new configurations_1.$yn(this.r, policyService, Y));
            this.j = configurationCache;
            this.m = new configurationModels_2.$m2b(this.r.configurationModel, this.s.configurationModel, new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new map_1.$zi(), new configurationModels_1.$qn(), new map_1.$zi(), this.c);
            this.u = this.B(new lifecycle_1.$jc());
            this.Z();
            this.w = this.B(new configuration_3.$r2b(R.currentProfile.settingsResource, R.currentProfile.tasksResource, { scopes: getLocalUserConfigurationScopes(R.currentProfile, !!remoteAuthority) }, U, X, Y));
            this.C = new map_1.$zi();
            this.B(this.w.onDidChangeConfiguration(userConfiguration => this.wb(userConfiguration)));
            if (remoteAuthority) {
                const remoteUserConfiguration = this.y = this.B(new configuration_3.$s2b(remoteAuthority, configurationCache, U, X, W));
                this.B(remoteUserConfiguration.onDidInitialize(remoteUserConfigurationModel => {
                    this.B(remoteUserConfiguration.onDidChangeConfiguration(remoteUserConfigurationModel => this.xb(remoteUserConfigurationModel)));
                    this.xb(remoteUserConfigurationModel);
                    this.g.open();
                }));
            }
            else {
                this.g.open();
            }
            this.z = this.B(new configuration_3.$t2b(configurationCache, U, X, Y));
            this.B(this.z.onDidUpdateConfiguration(fromCache => {
                this.yb(fromCache).then(() => {
                    this.c.initialized = this.z.initialized;
                    this.gb(fromCache);
                });
            }));
            this.B(this.r.onDidChangeConfiguration(({ properties, defaults }) => this.tb(defaults, properties)));
            this.B(this.s.onDidChangeConfiguration(configurationModel => this.ub(configurationModel)));
            this.B(R.onDidChangeCurrentProfile(e => this.sb(e)));
            this.D = new async_1.$Ng();
        }
        Z() {
            this.u.clear();
            if (this.R.currentProfile.isDefault || this.R.currentProfile.useDefaultFlags?.settings) {
                this.t = null;
            }
            else {
                this.t = this.u.add(this.B(new configuration_3.$q2b(this.S, this.U, this.X)));
                this.u.add(this.t.onDidChangeConfiguration(configurationModel => this.vb(configurationModel)));
            }
        }
        // Workspace Context Service Impl
        async getCompleteWorkspace() {
            await this.h.wait();
            return this.getWorkspace();
        }
        getWorkspace() {
            return this.c;
        }
        getWorkbenchState() {
            // Workspace has configuration file
            if (this.c.configuration) {
                return 3 /* WorkbenchState.WORKSPACE */;
            }
            // Folder has single root
            if (this.c.folders.length === 1) {
                return 2 /* WorkbenchState.FOLDER */;
            }
            // Empty
            return 1 /* WorkbenchState.EMPTY */;
        }
        getWorkspaceFolder(resource) {
            return this.c.getFolder(resource);
        }
        addFolders(foldersToAdd, index) {
            return this.updateFolders(foldersToAdd, [], index);
        }
        removeFolders(foldersToRemove) {
            return this.updateFolders([], foldersToRemove);
        }
        async updateFolders(foldersToAdd, foldersToRemove, index) {
            return this.D.queue(() => this.$(foldersToAdd, foldersToRemove, index));
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
                    else if ((0, workspace_1.$Lh)(workspaceIdOrFolder)) {
                        folderUri = workspaceIdOrFolder.uri;
                    }
                    return uri_1.URI.isUri(folderUri) && this.X.extUri.isEqual(folderUri, this.c.folders[0].uri);
                }
                case 3 /* WorkbenchState.WORKSPACE */:
                    return (0, workspace_1.$Qh)(workspaceIdOrFolder) && this.c.id === workspaceIdOrFolder.id;
            }
            return false;
        }
        async $(foldersToAdd, foldersToRemove, index) {
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
                if (!(0, workspaces_1.$jU)(folder)) {
                    return true; // keep entries which are unrelated
                }
                return !this.bb(foldersToRemove, currentWorkspaceFolders[index].uri); // keep entries which are unrelated
            });
            foldersHaveChanged = currentWorkspaceFolders.length !== newStoredFolders.length;
            // Add afterwards (if any)
            if (foldersToAdd.length) {
                // Recompute current workspace folders if we have folders to add
                const workspaceConfigPath = this.getWorkspace().configuration;
                const workspaceConfigFolder = this.X.extUri.dirname(workspaceConfigPath);
                currentWorkspaceFolders = (0, workspaces_1.$lU)(newStoredFolders, workspaceConfigPath, this.X.extUri);
                const currentWorkspaceFolderUris = currentWorkspaceFolders.map(folder => folder.uri);
                const storedFoldersToAdd = [];
                for (const folderToAdd of foldersToAdd) {
                    const folderURI = folderToAdd.uri;
                    if (this.bb(currentWorkspaceFolderUris, folderURI)) {
                        continue; // already existing
                    }
                    try {
                        const result = await this.U.stat(folderURI);
                        if (!result.isDirectory) {
                            continue;
                        }
                    }
                    catch (e) { /* Ignore */ }
                    storedFoldersToAdd.push((0, workspaces_1.$kU)(folderURI, false, folderToAdd.name, workspaceConfigFolder, this.X.extUri));
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
                return this.ab(newStoredFolders);
            }
            return Promise.resolve(undefined);
        }
        async ab(folders) {
            if (!this.P) {
                throw new Error('Cannot update workspace folders because workspace service is not yet ready to accept writes.');
            }
            await this.P.invokeFunction(accessor => this.z.setFolders(folders, accessor.get(jsonEditing_1.$$fb)));
            return this.yb(false);
        }
        bb(resources, toCheck) {
            return resources.some(resource => this.X.extUri.isEqual(resource, toCheck));
        }
        // Workspace Configuration Service Impl
        getConfigurationData() {
            return this.m.toData();
        }
        getValue(arg1, arg2) {
            const section = typeof arg1 === 'string' ? arg1 : undefined;
            const overrides = (0, configuration_1.$9h)(arg1) ? arg1 : (0, configuration_1.$9h)(arg2) ? arg2 : undefined;
            return this.m.getValue(section, overrides);
        }
        async updateValue(key, value, arg3, arg4, options) {
            const overrides = (0, configuration_1.$0h)(arg3) ? arg3
                : (0, configuration_1.$9h)(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : undefined } : undefined;
            const target = overrides ? arg4 : arg3;
            const targets = target ? [target] : [];
            if (overrides?.overrideIdentifiers) {
                overrides.overrideIdentifiers = (0, arrays_1.$Kb)(overrides.overrideIdentifiers);
                overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : undefined;
            }
            if (!targets.length) {
                if (overrides?.overrideIdentifiers && overrides.overrideIdentifiers.length > 1) {
                    throw new Error('Configuration Target is required while updating the value for multiple override identifiers');
                }
                const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : undefined });
                targets.push(...this.Ib(key, value, inspect));
                // Remove the setting, if the value is same as default value and is updated only in user target
                if ((0, objects_1.$Zm)(value, inspect.defaultValue) && targets.length === 1 && (targets[0] === 2 /* ConfigurationTarget.USER */ || targets[0] === 3 /* ConfigurationTarget.USER_LOCAL */)) {
                    value = undefined;
                }
            }
            await async_1.Promises.settled(targets.map(target => this.Hb(key, value, target, overrides, options)));
        }
        async reloadConfiguration(target) {
            if (target === undefined) {
                this.kb();
                const application = await this.lb(true);
                const { local, remote } = await this.mb();
                await this.ob();
                await this.qb(application, local, remote, true);
                return;
            }
            if ((0, workspace_1.$Th)(target)) {
                await this.pb(target);
                return;
            }
            switch (target) {
                case 7 /* ConfigurationTarget.DEFAULT */:
                    this.kb();
                    return;
                case 2 /* ConfigurationTarget.USER */: {
                    const { local, remote } = await this.mb();
                    await this.qb(this.m.applicationConfiguration, local, remote, true);
                    return;
                }
                case 3 /* ConfigurationTarget.USER_LOCAL */:
                    await this.reloadLocalUserConfiguration();
                    return;
                case 4 /* ConfigurationTarget.USER_REMOTE */:
                    await this.nb();
                    return;
                case 5 /* ConfigurationTarget.WORKSPACE */:
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                    await this.ob();
                    return;
            }
        }
        hasCachedConfigurationDefaultsOverrides() {
            return this.r.hasCachedConfigurationDefaultsOverrides();
        }
        inspect(key, overrides) {
            return this.m.inspect(key, overrides);
        }
        keys() {
            return this.m.keys();
        }
        async whenRemoteConfigurationLoaded() {
            await this.g.wait();
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
            const trigger = this.n;
            this.n = false;
            const workspace = await this.cb(arg);
            await this.hb(workspace, trigger);
            this.gb(false);
            (0, performance_1.mark)('code/didInitWorkspaceService');
        }
        updateWorkspaceTrust(trusted) {
            if (this.L !== trusted) {
                this.L = trusted;
                const data = this.m.toData();
                const folderConfigurationModels = [];
                for (const folder of this.c.folders) {
                    const folderConfiguration = this.C.get(folder.uri);
                    let configurationModel;
                    if (folderConfiguration) {
                        configurationModel = folderConfiguration.updateWorkspaceTrust(this.L);
                        this.m.updateFolderConfiguration(folder.uri, configurationModel);
                    }
                    folderConfigurationModels.push(configurationModel);
                }
                if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    if (folderConfigurationModels[0]) {
                        this.m.updateWorkspaceConfiguration(folderConfigurationModels[0]);
                    }
                }
                else {
                    this.m.updateWorkspaceConfiguration(this.z.updateWorkspaceTrust(this.L));
                }
                this.zb();
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
                keys = (0, arrays_1.$Kb)(keys);
                if (keys.length) {
                    this.Jb({ keys, overrides: [] }, { data, workspace: this.c }, 5 /* ConfigurationTarget.WORKSPACE */);
                }
            }
        }
        acquireInstantiationService(instantiationService) {
            this.P = instantiationService;
        }
        isSettingAppliedForAllProfiles(key) {
            if (this.O.getConfigurationProperties()[key]?.scope === 1 /* ConfigurationScope.APPLICATION */) {
                return true;
            }
            const allProfilesSettings = this.getValue(configuration_2.$oE) ?? [];
            return Array.isArray(allProfilesSettings) && allProfilesSettings.includes(key);
        }
        async cb(arg) {
            if ((0, workspace_1.$Qh)(arg)) {
                return this.db(arg);
            }
            if ((0, workspace_1.$Lh)(arg)) {
                return this.eb(arg);
            }
            return this.fb(arg);
        }
        async db(workspaceIdentifier) {
            await this.z.initialize({ id: workspaceIdentifier.id, configPath: workspaceIdentifier.configPath }, this.L);
            const workspaceConfigPath = workspaceIdentifier.configPath;
            const workspaceFolders = (0, workspaces_1.$lU)(this.z.getFolders(), workspaceConfigPath, this.X.extUri);
            const workspaceId = workspaceIdentifier.id;
            const workspace = new Workspace(workspaceId, workspaceFolders, this.z.isTransient(), workspaceConfigPath, uri => this.X.extUri.ignorePathCasing(uri));
            workspace.initialized = this.z.initialized;
            return workspace;
        }
        eb(singleFolderWorkspaceIdentifier) {
            const workspace = new Workspace(singleFolderWorkspaceIdentifier.id, [(0, workspace_1.$Wh)(singleFolderWorkspaceIdentifier.uri)], false, null, uri => this.X.extUri.ignorePathCasing(uri));
            workspace.initialized = true;
            return workspace;
        }
        fb(emptyWorkspaceIdentifier) {
            const workspace = new Workspace(emptyWorkspaceIdentifier.id, [], false, null, uri => this.X.extUri.ignorePathCasing(uri));
            workspace.initialized = true;
            return Promise.resolve(workspace);
        }
        gb(fromCache) {
            if (!this.h.isOpen() && this.c.initialized) {
                this.h.open();
                this.Fb(fromCache);
            }
        }
        async hb(workspace, trigger) {
            const hasWorkspaceBefore = !!this.c;
            let previousState;
            let previousWorkspacePath;
            let previousFolders = [];
            if (hasWorkspaceBefore) {
                previousState = this.getWorkbenchState();
                previousWorkspacePath = this.c.configuration ? this.c.configuration.fsPath : undefined;
                previousFolders = this.c.folders;
                this.c.update(workspace);
            }
            else {
                this.c = workspace;
            }
            await this.jb(trigger);
            // Trigger changes after configuration initialization so that configuration is up to date.
            if (hasWorkspaceBefore) {
                const newState = this.getWorkbenchState();
                if (previousState && newState !== previousState) {
                    this.J.fire(newState);
                }
                const newWorkspacePath = this.c.configuration ? this.c.configuration.fsPath : undefined;
                if (previousWorkspacePath && newWorkspacePath !== previousWorkspacePath || newState !== previousState) {
                    this.I.fire();
                }
                const folderChanges = this.ib(previousFolders, this.c.folders);
                if (folderChanges && (folderChanges.added.length || folderChanges.removed.length || folderChanges.changed.length)) {
                    await this.Bb(folderChanges, false);
                    this.H.fire(folderChanges);
                }
            }
            if (!this.w.hasTasksLoaded) {
                // Reload local user configuration again to load user tasks
                this.B((0, async_1.$Wg)(() => this.reloadLocalUserConfiguration()));
            }
        }
        ib(currentFolders, newFolders) {
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
        async jb(trigger) {
            await this.r.initialize();
            const initPolicyConfigurationPromise = this.s.initialize();
            const initApplicationConfigurationPromise = this.t ? this.t.initialize() : Promise.resolve(new configurationModels_1.$qn());
            const initUserConfiguration = async () => {
                (0, performance_1.mark)('code/willInitUserConfiguration');
                const result = await Promise.all([this.w.initialize(), this.y ? this.y.initialize() : Promise.resolve(new configurationModels_1.$qn())]);
                if (this.t) {
                    const applicationConfigurationModel = await initApplicationConfigurationPromise;
                    result[0] = this.w.reparse({ exclude: applicationConfigurationModel.getValue(configuration_2.$oE) });
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
            await this.qb(application, local, remote, trigger);
            (0, performance_1.mark)('code/didInitWorkspaceConfiguration');
        }
        kb() {
            this.tb(this.r.reload());
        }
        async lb(donotTrigger) {
            if (!this.t) {
                return new configurationModels_1.$qn();
            }
            const model = await this.t.loadConfiguration();
            if (!donotTrigger) {
                this.vb(model);
            }
            return model;
        }
        async mb() {
            const [local, remote] = await Promise.all([this.reloadLocalUserConfiguration(true), this.nb(true)]);
            return { local, remote };
        }
        async reloadLocalUserConfiguration(donotTrigger) {
            const model = await this.w.reload();
            if (!donotTrigger) {
                this.wb(model);
            }
            return model;
        }
        async nb(donotTrigger) {
            if (this.y) {
                const model = await this.y.reload();
                if (!donotTrigger) {
                    this.xb(model);
                }
                return model;
            }
            return new configurationModels_1.$qn();
        }
        async ob() {
            const workbenchState = this.getWorkbenchState();
            if (workbenchState === 2 /* WorkbenchState.FOLDER */) {
                return this.Cb(this.c.folders[0]);
            }
            if (workbenchState === 3 /* WorkbenchState.WORKSPACE */) {
                return this.z.reload().then(() => this.yb(false));
            }
        }
        pb(folder) {
            return this.Cb(folder);
        }
        async qb(applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, trigger) {
            // reset caches
            this.C = new map_1.$zi();
            const folders = this.c.folders;
            const folderConfigurations = await this.Eb(folders);
            const workspaceConfiguration = this.rb(folderConfigurations);
            const folderConfigurationModels = new map_1.$zi();
            folderConfigurations.forEach((folderConfiguration, index) => folderConfigurationModels.set(folders[index].uri, folderConfiguration));
            const currentConfiguration = this.m;
            this.m = new configurationModels_2.$m2b(this.r.configurationModel, this.s.configurationModel, applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, workspaceConfiguration, folderConfigurationModels, new configurationModels_1.$qn(), new map_1.$zi(), this.c);
            this.n = true;
            if (trigger) {
                const change = this.m.compare(currentConfiguration);
                this.Jb(change, { data: currentConfiguration.toData(), workspace: this.c }, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            this.zb();
        }
        rb(folderConfigurations) {
            switch (this.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */:
                    return folderConfigurations[0];
                case 3 /* WorkbenchState.WORKSPACE */:
                    return this.z.getConfiguration();
                default:
                    return new configurationModels_1.$qn();
            }
        }
        sb(e) {
            e.join((async () => {
                const promises = [];
                promises.push(this.w.reset(e.profile.settingsResource, e.profile.tasksResource, { scopes: getLocalUserConfigurationScopes(e.profile, !!this.y) }));
                if (e.previous.isDefault !== e.profile.isDefault
                    || !!e.previous.useDefaultFlags?.settings !== !!e.profile.useDefaultFlags?.settings) {
                    this.Z();
                    if (this.t) {
                        promises.push(this.lb(true));
                    }
                }
                let [localUser, application] = await Promise.all(promises);
                application = application ?? this.m.applicationConfiguration;
                if (this.t) {
                    localUser = this.w.reparse({ exclude: application.getValue(configuration_2.$oE) });
                }
                await this.qb(application, localUser, this.m.remoteUserConfiguration, true);
            })());
        }
        tb(configurationModel, properties) {
            if (this.c) {
                const previousData = this.m.toData();
                const change = this.m.compareAndUpdateDefaultConfiguration(configurationModel, properties);
                if (this.t) {
                    this.m.updateApplicationConfiguration(this.t.reparse());
                }
                if (this.y) {
                    this.m.updateLocalUserConfiguration(this.w.reparse());
                    this.m.updateRemoteUserConfiguration(this.y.reparse());
                }
                if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    const folderConfiguration = this.C.get(this.c.folders[0].uri);
                    if (folderConfiguration) {
                        this.m.updateWorkspaceConfiguration(folderConfiguration.reparse());
                        this.m.updateFolderConfiguration(this.c.folders[0].uri, folderConfiguration.reparse());
                    }
                }
                else {
                    this.m.updateWorkspaceConfiguration(this.z.reparseWorkspaceSettings());
                    for (const folder of this.c.folders) {
                        const folderConfiguration = this.C.get(folder.uri);
                        if (folderConfiguration) {
                            this.m.updateFolderConfiguration(folder.uri, folderConfiguration.reparse());
                        }
                    }
                }
                this.Jb(change, { data: previousData, workspace: this.c }, 7 /* ConfigurationTarget.DEFAULT */);
                this.zb();
            }
        }
        ub(policyConfiguration) {
            const previous = { data: this.m.toData(), workspace: this.c };
            const change = this.m.compareAndUpdatePolicyConfiguration(policyConfiguration);
            this.Jb(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
        }
        vb(applicationConfiguration) {
            const previous = { data: this.m.toData(), workspace: this.c };
            const previousAllProfilesSettings = this.m.applicationConfiguration.getValue(configuration_2.$oE) ?? [];
            const change = this.m.compareAndUpdateApplicationConfiguration(applicationConfiguration);
            const currentAllProfilesSettings = this.getValue(configuration_2.$oE) ?? [];
            const configurationProperties = this.O.getConfigurationProperties();
            const changedKeys = [];
            for (const changedKey of change.keys) {
                if (configurationProperties[changedKey]?.scope === 1 /* ConfigurationScope.APPLICATION */) {
                    changedKeys.push(changedKey);
                    if (changedKey === configuration_2.$oE) {
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
            if (change.keys.includes(configuration_2.$oE)) {
                this.m.updateLocalUserConfiguration(this.w.reparse({ exclude: currentAllProfilesSettings }));
            }
            this.Jb(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        wb(userConfiguration) {
            const previous = { data: this.m.toData(), workspace: this.c };
            const change = this.m.compareAndUpdateLocalUserConfiguration(userConfiguration);
            this.Jb(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        xb(userConfiguration) {
            const previous = { data: this.m.toData(), workspace: this.c };
            const change = this.m.compareAndUpdateRemoteUserConfiguration(userConfiguration);
            this.Jb(change, previous, 2 /* ConfigurationTarget.USER */);
        }
        async yb(fromCache) {
            if (this.c && this.c.configuration) {
                let newFolders = (0, workspaces_1.$lU)(this.z.getFolders(), this.c.configuration, this.X.extUri);
                // Validate only if workspace is initialized
                if (this.c.initialized) {
                    const { added, removed, changed } = this.ib(this.c.folders, newFolders);
                    /* If changed validate new folders */
                    if (added.length || removed.length || changed.length) {
                        newFolders = await this.Gb(newFolders);
                    }
                    /* Otherwise use existing */
                    else {
                        newFolders = this.c.folders;
                    }
                }
                await this.Ab(newFolders, this.z.getConfiguration(), fromCache);
            }
        }
        zb() {
            const changed = [];
            const allProperties = this.O.getConfigurationProperties();
            const defaultRestrictedSettings = Object.keys(allProperties).filter(key => allProperties[key].restricted).sort((a, b) => a.localeCompare(b));
            const defaultDelta = (0, arrays_1.$Cb)(defaultRestrictedSettings, this.M.default, (a, b) => a.localeCompare(b));
            changed.push(...defaultDelta.added, ...defaultDelta.removed);
            const application = (this.t?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
            const applicationDelta = (0, arrays_1.$Cb)(application, this.M.application || [], (a, b) => a.localeCompare(b));
            changed.push(...applicationDelta.added, ...applicationDelta.removed);
            const userLocal = this.w.getRestrictedSettings().sort((a, b) => a.localeCompare(b));
            const userLocalDelta = (0, arrays_1.$Cb)(userLocal, this.M.userLocal || [], (a, b) => a.localeCompare(b));
            changed.push(...userLocalDelta.added, ...userLocalDelta.removed);
            const userRemote = (this.y?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
            const userRemoteDelta = (0, arrays_1.$Cb)(userRemote, this.M.userRemote || [], (a, b) => a.localeCompare(b));
            changed.push(...userRemoteDelta.added, ...userRemoteDelta.removed);
            const workspaceFolderMap = new map_1.$zi();
            for (const workspaceFolder of this.c.folders) {
                const cachedFolderConfig = this.C.get(workspaceFolder.uri);
                const folderRestrictedSettings = (cachedFolderConfig?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
                if (folderRestrictedSettings.length) {
                    workspaceFolderMap.set(workspaceFolder.uri, folderRestrictedSettings);
                }
                const previous = this.M.workspaceFolder?.get(workspaceFolder.uri) || [];
                const workspaceFolderDelta = (0, arrays_1.$Cb)(folderRestrictedSettings, previous, (a, b) => a.localeCompare(b));
                changed.push(...workspaceFolderDelta.added, ...workspaceFolderDelta.removed);
            }
            const workspace = this.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? this.z.getRestrictedSettings().sort((a, b) => a.localeCompare(b))
                : this.c.folders[0] ? (workspaceFolderMap.get(this.c.folders[0].uri) || []) : [];
            const workspaceDelta = (0, arrays_1.$Cb)(workspace, this.M.workspace || [], (a, b) => a.localeCompare(b));
            changed.push(...workspaceDelta.added, ...workspaceDelta.removed);
            if (changed.length) {
                this.M = {
                    default: defaultRestrictedSettings,
                    application: application.length ? application : undefined,
                    userLocal: userLocal.length ? userLocal : undefined,
                    userRemote: userRemote.length ? userRemote : undefined,
                    workspace: workspace.length ? workspace : undefined,
                    workspaceFolder: workspaceFolderMap.size ? workspaceFolderMap : undefined,
                };
                this.N.fire(this.restrictedSettings);
            }
        }
        async Ab(workspaceFolders, configuration, fromCache) {
            const previous = { data: this.m.toData(), workspace: this.c };
            const change = this.m.compareAndUpdateWorkspaceConfiguration(configuration);
            const changes = this.ib(this.c.folders, workspaceFolders);
            if (changes.added.length || changes.removed.length || changes.changed.length) {
                this.c.folders = workspaceFolders;
                const change = await this.Db();
                await this.Bb(changes, fromCache);
                this.Jb(change, previous, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
                this.H.fire(changes);
            }
            else {
                this.Jb(change, previous, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            this.zb();
        }
        async Bb(changes, fromCache) {
            const joiners = [];
            this.G.fire({
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
        async Cb(folder) {
            const [folderConfiguration] = await this.Eb([folder]);
            const previous = { data: this.m.toData(), workspace: this.c };
            const folderConfigurationChange = this.m.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration);
            if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceConfigurationChange = this.m.compareAndUpdateWorkspaceConfiguration(folderConfiguration);
                this.Jb((0, configurationModels_1.$un)(folderConfigurationChange, workspaceConfigurationChange), previous, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            else {
                this.Jb(folderConfigurationChange, previous, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            }
            this.zb();
        }
        async Db() {
            const changes = [];
            // Remove the configurations of deleted folders
            for (const key of this.C.keys()) {
                if (!this.c.folders.filter(folder => folder.uri.toString() === key.toString())[0]) {
                    const folderConfiguration = this.C.get(key);
                    folderConfiguration.dispose();
                    this.C.delete(key);
                    changes.push(this.m.compareAndDeleteFolderConfiguration(key));
                }
            }
            const toInitialize = this.c.folders.filter(folder => !this.C.has(folder.uri));
            if (toInitialize.length) {
                const folderConfigurations = await this.Eb(toInitialize);
                folderConfigurations.forEach((folderConfiguration, index) => {
                    changes.push(this.m.compareAndUpdateFolderConfiguration(toInitialize[index].uri, folderConfiguration));
                });
            }
            return (0, configurationModels_1.$un)(...changes);
        }
        Eb(folders) {
            return Promise.all([...folders.map(folder => {
                    let folderConfiguration = this.C.get(folder.uri);
                    if (!folderConfiguration) {
                        folderConfiguration = new configuration_3.$u2b(!this.n, folder, configuration_2.$3D, this.getWorkbenchState(), this.L, this.U, this.X, this.Y, this.j);
                        this.B(folderConfiguration.onDidChange(() => this.Cb(folder)));
                        this.C.set(folder.uri, this.B(folderConfiguration));
                    }
                    return folderConfiguration.loadConfiguration();
                })]);
        }
        async Fb(fromCache) {
            const validWorkspaceFolders = await this.Gb(this.c.folders);
            const { removed } = this.ib(this.c.folders, validWorkspaceFolders);
            if (removed.length) {
                await this.Ab(validWorkspaceFolders, this.z.getConfiguration(), fromCache);
            }
        }
        // Filter out workspace folders which are files (not directories)
        // Workspace folders those cannot be resolved are not filtered because they are handled by the Explorer.
        async Gb(workspaceFolders) {
            const validWorkspaceFolders = [];
            for (const workspaceFolder of workspaceFolders) {
                try {
                    const result = await this.U.stat(workspaceFolder.uri);
                    if (!result.isDirectory) {
                        continue;
                    }
                }
                catch (e) {
                    this.Y.warn(`Ignoring the error while validating workspace folder ${workspaceFolder.uri.toString()} - ${(0, errorMessage_1.$mi)(e)}`);
                }
                validWorkspaceFolders.push(workspaceFolder);
            }
            return validWorkspaceFolders;
        }
        async Hb(key, value, target, overrides, options) {
            if (!this.P) {
                throw new Error('Cannot write configuration because the configuration service is not yet ready to accept writes.');
            }
            if (target === 7 /* ConfigurationTarget.DEFAULT */) {
                throw new Error('Invalid configuration target');
            }
            if (target === 8 /* ConfigurationTarget.MEMORY */) {
                const previous = { data: this.m.toData(), workspace: this.c };
                this.m.updateValue(key, value, overrides);
                this.Jb({ keys: overrides?.overrideIdentifiers?.length ? [(0, configurationRegistry_1.$mn)(overrides.overrideIdentifiers), key] : [key], overrides: overrides?.overrideIdentifiers?.length ? overrides.overrideIdentifiers.map(overrideIdentifier => ([overrideIdentifier, [key]])) : [] }, previous, target);
                return;
            }
            const editableConfigurationTarget = this.Lb(target, key);
            if (!editableConfigurationTarget) {
                throw new Error('Invalid configuration target');
            }
            if (editableConfigurationTarget === 2 /* EditableConfigurationTarget.USER_REMOTE */ && !this.y) {
                throw new Error('Invalid configuration target');
            }
            // Use same instance of ConfigurationEditing to make sure all writes go through the same queue
            this.Q = this.Q ?? this.P.createInstance(configurationEditing_1.$o2b, (await this.W.getEnvironment())?.settingsPath ?? null);
            await this.Q.writeConfiguration(editableConfigurationTarget, { key, value }, { scopes: overrides, ...options });
            switch (editableConfigurationTarget) {
                case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                    if (this.t && this.isSettingAppliedForAllProfiles(key)) {
                        await this.lb();
                    }
                    else {
                        await this.reloadLocalUserConfiguration();
                    }
                    return;
                case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                    return this.nb().then(() => undefined);
                case 3 /* EditableConfigurationTarget.WORKSPACE */:
                    return this.ob();
                case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                    const workspaceFolder = overrides && overrides.resource ? this.c.getFolder(overrides.resource) : null;
                    if (workspaceFolder) {
                        return this.pb(workspaceFolder);
                    }
                }
            }
        }
        Ib(key, value, inspect) {
            if ((0, objects_1.$Zm)(value, inspect.value)) {
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
        Jb(change, previous, target) {
            if (change.keys.length) {
                if (target !== 7 /* ConfigurationTarget.DEFAULT */) {
                    this.Y.debug(`Configuration keys changed in ${(0, configuration_1.$$h)(target)} target`, ...change.keys);
                }
                const configurationChangeEvent = new configurationModels_1.$vn(change, previous, this.m, this.c);
                configurationChangeEvent.source = target;
                configurationChangeEvent.sourceConfig = this.Kb(target);
                this.F.fire(configurationChangeEvent);
            }
        }
        Kb(target) {
            switch (target) {
                case 7 /* ConfigurationTarget.DEFAULT */:
                    return this.m.defaults.contents;
                case 2 /* ConfigurationTarget.USER */:
                    return this.m.userConfiguration.contents;
                case 5 /* ConfigurationTarget.WORKSPACE */:
                    return this.m.workspaceConfiguration.contents;
            }
            return {};
        }
        Lb(target, key) {
            if (target === 2 /* ConfigurationTarget.USER */) {
                if (this.y) {
                    const scope = this.O.getConfigurationProperties()[key]?.scope;
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
    exports.$v2b = $v2b;
    let RegisterConfigurationSchemasContribution = class RegisterConfigurationSchemasContribution extends lifecycle_1.$kc {
        constructor(c, g, h, extensionService, lifecycleService) {
            super();
            this.c = c;
            this.g = g;
            this.h = h;
            extensionService.whenInstalledExtensionsRegistered().then(() => {
                this.j();
                const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
                const delayer = this.B(new async_1.$Dg(50));
                this.B(event_1.Event.any(configurationRegistry.onDidUpdateConfiguration, configurationRegistry.onDidSchemaChange, h.onDidChangeTrust)(() => delayer.trigger(() => this.j(), lifecycleService.phase === 4 /* LifecyclePhase.Eventually */ ? undefined : 2500 /* delay longer in early phases */)));
            });
        }
        j() {
            const allSettingsSchema = {
                properties: configurationRegistry_1.$bn.properties,
                patternProperties: configurationRegistry_1.$bn.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const userSettingsSchema = this.g.remoteAuthority ?
                {
                    properties: Object.assign({}, configurationRegistry_1.$cn.properties, configurationRegistry_1.$fn.properties, configurationRegistry_1.$gn.properties),
                    patternProperties: configurationRegistry_1.$bn.patternProperties,
                    additionalProperties: true,
                    allowTrailingCommas: true,
                    allowComments: true
                }
                : allSettingsSchema;
            const profileSettingsSchema = {
                properties: Object.assign({}, configurationRegistry_1.$dn.properties, configurationRegistry_1.$en.properties, configurationRegistry_1.$fn.properties, configurationRegistry_1.$gn.properties),
                patternProperties: configurationRegistry_1.$bn.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const machineSettingsSchema = {
                properties: Object.assign({}, configurationRegistry_1.$dn.properties, configurationRegistry_1.$en.properties, configurationRegistry_1.$fn.properties, configurationRegistry_1.$gn.properties),
                patternProperties: configurationRegistry_1.$bn.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const workspaceSettingsSchema = {
                properties: Object.assign({}, this.n(configurationRegistry_1.$en.properties), this.n(configurationRegistry_1.$fn.properties), this.n(configurationRegistry_1.$gn.properties)),
                patternProperties: configurationRegistry_1.$bn.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const defaultSettingsSchema = {
                properties: Object.keys(configurationRegistry_1.$bn.properties).reduce((result, key) => {
                    result[key] = Object.assign({ deprecationMessage: undefined }, configurationRegistry_1.$bn.properties[key]);
                    return result;
                }, {}),
                patternProperties: Object.keys(configurationRegistry_1.$bn.patternProperties).reduce((result, key) => {
                    result[key] = Object.assign({ deprecationMessage: undefined }, configurationRegistry_1.$bn.patternProperties[key]);
                    return result;
                }, {}),
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            const folderSettingsSchema = 3 /* WorkbenchState.WORKSPACE */ === this.c.getWorkbenchState() ?
                {
                    properties: Object.assign({}, this.n(configurationRegistry_1.$en.properties), this.n(configurationRegistry_1.$gn.properties)),
                    patternProperties: configurationRegistry_1.$bn.patternProperties,
                    additionalProperties: true,
                    allowTrailingCommas: true,
                    allowComments: true
                } : workspaceSettingsSchema;
            const configDefaultsSchema = {
                type: 'object',
                description: (0, nls_1.localize)(0, null),
                properties: Object.assign({}, configurationRegistry_1.$en.properties, configurationRegistry_1.$fn.properties, configurationRegistry_1.$gn.properties),
                patternProperties: {
                    [configurationRegistry_1.$jn]: {
                        type: 'object',
                        default: {},
                        $ref: configurationRegistry_1.$hn,
                    }
                },
                additionalProperties: false
            };
            this.m({
                defaultSettingsSchema,
                userSettingsSchema,
                profileSettingsSchema,
                machineSettingsSchema,
                workspaceSettingsSchema,
                folderSettingsSchema,
                configDefaultsSchema,
            });
        }
        m(schemas) {
            const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
            jsonRegistry.registerSchema(configuration_2.$6D, schemas.defaultSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.$7D, schemas.userSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.$8D, schemas.profileSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.$9D, schemas.machineSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.$0D, schemas.workspaceSettingsSchema);
            jsonRegistry.registerSchema(configuration_2.$$D, schemas.folderSettingsSchema);
            jsonRegistry.registerSchema(configurationRegistry_1.$in, schemas.configDefaultsSchema);
        }
        n(properties) {
            if (this.h.isWorkspaceTrusted()) {
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
        __param(0, workspace_1.$Kh),
        __param(1, environmentService_1.$hJ),
        __param(2, workspaceTrust_1.$$z),
        __param(3, extensions_1.$MF),
        __param(4, lifecycle_2.$7y)
    ], RegisterConfigurationSchemasContribution);
    let ResetConfigurationDefaultsOverridesCache = class ResetConfigurationDefaultsOverridesCache extends lifecycle_1.$kc {
        constructor(configurationService, extensionService) {
            super();
            if (configurationService.hasCachedConfigurationDefaultsOverrides()) {
                extensionService.whenInstalledExtensionsRegistered().then(() => configurationService.reloadConfiguration(7 /* ConfigurationTarget.DEFAULT */));
            }
        }
    };
    ResetConfigurationDefaultsOverridesCache = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, extensions_1.$MF)
    ], ResetConfigurationDefaultsOverridesCache);
    let UpdateExperimentalSettingsDefaults = class UpdateExperimentalSettingsDefaults extends lifecycle_1.$kc {
        constructor(h) {
            super();
            this.h = h;
            this.c = new Set();
            this.g = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            this.j(Object.keys(this.g.getConfigurationProperties()));
            this.B(this.g.onDidUpdateConfiguration(({ properties }) => this.j(properties)));
        }
        async j(properties) {
            const overrides = {};
            const allProperties = this.g.getConfigurationProperties();
            for (const property of properties) {
                const schema = allProperties[property];
                if (!schema?.tags?.includes('experimental')) {
                    continue;
                }
                if (this.c.has(property)) {
                    continue;
                }
                this.c.add(property);
                try {
                    const value = await this.h.getTreatment(`config.${property}`);
                    if (!(0, types_1.$qf)(value) && !(0, objects_1.$Zm)(value, schema.default)) {
                        overrides[property] = value;
                    }
                }
                catch (error) { /*ignore */ }
            }
            if (Object.keys(overrides).length) {
                this.g.registerDefaultConfigurations([{ overrides, source: (0, nls_1.localize)(1, null) }]);
            }
        }
    };
    UpdateExperimentalSettingsDefaults = __decorate([
        __param(0, assignmentService_1.$drb)
    ], UpdateExperimentalSettingsDefaults);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(RegisterConfigurationSchemasContribution, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ResetConfigurationDefaultsOverridesCache, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(UpdateExperimentalSettingsDefaults, 3 /* LifecyclePhase.Restored */);
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_4.$$y,
        properties: {
            [configuration_2.$oE]: {
                'type': 'array',
                description: (0, nls_1.localize)(2, null),
                'default': [],
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                additionalProperties: true,
                uniqueItems: true,
            }
        }
    });
});
//# sourceMappingURL=configurationService.js.map