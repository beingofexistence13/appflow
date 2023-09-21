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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/network", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/memento", "vs/workbench/services/environment/common/environmentService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/files/common/files"], function (require, exports, event_1, lifecycle_1, linkedList_1, network_1, uri_1, configuration_1, extensions_1, remoteAuthorityResolver_1, remoteHosts_1, virtualWorkspace_1, storage_1, workspace_1, workspaceTrust_1, memento_1, environmentService_1, uriIdentity_1, resources_1, platform_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustRequestService = exports.WorkspaceTrustManagementService = exports.WorkspaceTrustEnablementService = exports.CanonicalWorkspace = exports.WORKSPACE_TRUST_STORAGE_KEY = exports.WORKSPACE_TRUST_EXTENSION_SUPPORT = exports.WORKSPACE_TRUST_EMPTY_WINDOW = exports.WORKSPACE_TRUST_UNTRUSTED_FILES = exports.WORKSPACE_TRUST_BANNER = exports.WORKSPACE_TRUST_STARTUP_PROMPT = exports.WORKSPACE_TRUST_ENABLED = void 0;
    exports.WORKSPACE_TRUST_ENABLED = 'security.workspace.trust.enabled';
    exports.WORKSPACE_TRUST_STARTUP_PROMPT = 'security.workspace.trust.startupPrompt';
    exports.WORKSPACE_TRUST_BANNER = 'security.workspace.trust.banner';
    exports.WORKSPACE_TRUST_UNTRUSTED_FILES = 'security.workspace.trust.untrustedFiles';
    exports.WORKSPACE_TRUST_EMPTY_WINDOW = 'security.workspace.trust.emptyWindow';
    exports.WORKSPACE_TRUST_EXTENSION_SUPPORT = 'extensions.supportUntrustedWorkspaces';
    exports.WORKSPACE_TRUST_STORAGE_KEY = 'content.trust.model.key';
    class CanonicalWorkspace {
        constructor(originalWorkspace, canonicalFolderUris, canonicalConfiguration) {
            this.originalWorkspace = originalWorkspace;
            this.canonicalFolderUris = canonicalFolderUris;
            this.canonicalConfiguration = canonicalConfiguration;
        }
        get folders() {
            return this.originalWorkspace.folders.map((folder, index) => {
                return {
                    index: folder.index,
                    name: folder.name,
                    toResource: folder.toResource,
                    uri: this.canonicalFolderUris[index]
                };
            });
        }
        get transient() {
            return this.originalWorkspace.transient;
        }
        get configuration() {
            return this.canonicalConfiguration ?? this.originalWorkspace.configuration;
        }
        get id() {
            return this.originalWorkspace.id;
        }
    }
    exports.CanonicalWorkspace = CanonicalWorkspace;
    let WorkspaceTrustEnablementService = class WorkspaceTrustEnablementService extends lifecycle_1.Disposable {
        constructor(configurationService, environmentService) {
            super();
            this.configurationService = configurationService;
            this.environmentService = environmentService;
        }
        isWorkspaceTrustEnabled() {
            if (this.environmentService.disableWorkspaceTrust) {
                return false;
            }
            return !!this.configurationService.getValue(exports.WORKSPACE_TRUST_ENABLED);
        }
    };
    exports.WorkspaceTrustEnablementService = WorkspaceTrustEnablementService;
    exports.WorkspaceTrustEnablementService = WorkspaceTrustEnablementService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], WorkspaceTrustEnablementService);
    let WorkspaceTrustManagementService = class WorkspaceTrustManagementService extends lifecycle_1.Disposable {
        constructor(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, workspaceService, workspaceTrustEnablementService, fileService) {
            super();
            this.configurationService = configurationService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.storageService = storageService;
            this.uriIdentityService = uriIdentityService;
            this.environmentService = environmentService;
            this.workspaceService = workspaceService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.fileService = fileService;
            this.storageKey = exports.WORKSPACE_TRUST_STORAGE_KEY;
            this._onDidChangeTrust = this._register(new event_1.Emitter());
            this.onDidChangeTrust = this._onDidChangeTrust.event;
            this._onDidChangeTrustedFolders = this._register(new event_1.Emitter());
            this.onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
            this._canonicalStartupFiles = [];
            this._canonicalUrisResolved = false;
            this._canonicalWorkspace = this.workspaceService.getWorkspace();
            this._workspaceResolvedPromise = new Promise((resolve) => {
                this._workspaceResolvedPromiseResolve = resolve;
            });
            this._workspaceTrustInitializedPromise = new Promise((resolve) => {
                this._workspaceTrustInitializedPromiseResolve = resolve;
            });
            this._storedTrustState = new WorkspaceTrustMemento(platform_1.isWeb && this.isEmptyWorkspace() ? undefined : this.storageService);
            this._trustTransitionManager = this._register(new WorkspaceTrustTransitionManager());
            this._trustStateInfo = this.loadTrustInfo();
            this._isTrusted = this.calculateWorkspaceTrust();
            this.initializeWorkspaceTrust();
            this.registerListeners();
        }
        //#region initialize
        initializeWorkspaceTrust() {
            // Resolve canonical Uris
            this.resolveCanonicalUris()
                .then(async () => {
                this._canonicalUrisResolved = true;
                await this.updateWorkspaceTrust();
            })
                .finally(() => {
                this._workspaceResolvedPromiseResolve();
                if (!this.environmentService.remoteAuthority) {
                    this._workspaceTrustInitializedPromiseResolve();
                }
            });
            // Remote - resolve remote authority
            if (this.environmentService.remoteAuthority) {
                this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority)
                    .then(async (result) => {
                    this._remoteAuthority = result;
                    await this.fileService.activateProvider(network_1.Schemas.vscodeRemote);
                    await this.updateWorkspaceTrust();
                })
                    .finally(() => {
                    this._workspaceTrustInitializedPromiseResolve();
                });
            }
            // Empty workspace - save initial state to memento
            if (this.isEmptyWorkspace()) {
                this._workspaceTrustInitializedPromise.then(() => {
                    if (this._storedTrustState.isEmptyWorkspaceTrusted === undefined) {
                        this._storedTrustState.isEmptyWorkspaceTrusted = this.isWorkspaceTrusted();
                    }
                });
            }
        }
        //#endregion
        //#region private interface
        registerListeners() {
            this._register(this.workspaceService.onDidChangeWorkspaceFolders(async () => await this.updateWorkspaceTrust()));
            this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this.storageKey, this._register(new lifecycle_1.DisposableStore()))(async () => {
                /* This will only execute if storage was changed by a user action in a separate window */
                if (JSON.stringify(this._trustStateInfo) !== JSON.stringify(this.loadTrustInfo())) {
                    this._trustStateInfo = this.loadTrustInfo();
                    this._onDidChangeTrustedFolders.fire();
                    await this.updateWorkspaceTrust();
                }
            }));
        }
        async getCanonicalUri(uri) {
            let canonicalUri = uri;
            if (this.environmentService.remoteAuthority && uri.scheme === network_1.Schemas.vscodeRemote) {
                canonicalUri = await this.remoteAuthorityResolverService.getCanonicalURI(uri);
            }
            else if (uri.scheme === 'vscode-vfs') {
                const index = uri.authority.indexOf('+');
                if (index !== -1) {
                    canonicalUri = uri.with({ authority: uri.authority.substr(0, index) });
                }
            }
            // ignore query and fragent section of uris always
            return canonicalUri.with({ query: null, fragment: null });
        }
        async resolveCanonicalUris() {
            // Open editors
            const filesToOpen = [];
            if (this.environmentService.filesToOpenOrCreate) {
                filesToOpen.push(...this.environmentService.filesToOpenOrCreate);
            }
            if (this.environmentService.filesToDiff) {
                filesToOpen.push(...this.environmentService.filesToDiff);
            }
            if (this.environmentService.filesToMerge) {
                filesToOpen.push(...this.environmentService.filesToMerge);
            }
            if (filesToOpen.length) {
                const filesToOpenOrCreateUris = filesToOpen.filter(f => !!f.fileUri).map(f => f.fileUri);
                const canonicalFilesToOpen = await Promise.all(filesToOpenOrCreateUris.map(uri => this.getCanonicalUri(uri)));
                this._canonicalStartupFiles.push(...canonicalFilesToOpen.filter(uri => this._canonicalStartupFiles.every(u => !this.uriIdentityService.extUri.isEqual(uri, u))));
            }
            // Workspace
            const workspaceUris = this.workspaceService.getWorkspace().folders.map(f => f.uri);
            const canonicalWorkspaceFolders = await Promise.all(workspaceUris.map(uri => this.getCanonicalUri(uri)));
            let canonicalWorkspaceConfiguration = this.workspaceService.getWorkspace().configuration;
            if (canonicalWorkspaceConfiguration && (0, workspace_1.isSavedWorkspace)(canonicalWorkspaceConfiguration, this.environmentService)) {
                canonicalWorkspaceConfiguration = await this.getCanonicalUri(canonicalWorkspaceConfiguration);
            }
            this._canonicalWorkspace = new CanonicalWorkspace(this.workspaceService.getWorkspace(), canonicalWorkspaceFolders, canonicalWorkspaceConfiguration);
        }
        loadTrustInfo() {
            const infoAsString = this.storageService.get(this.storageKey, -1 /* StorageScope.APPLICATION */);
            let result;
            try {
                if (infoAsString) {
                    result = JSON.parse(infoAsString);
                }
            }
            catch { }
            if (!result) {
                result = {
                    uriTrustInfo: []
                };
            }
            if (!result.uriTrustInfo) {
                result.uriTrustInfo = [];
            }
            result.uriTrustInfo = result.uriTrustInfo.map(info => { return { uri: uri_1.URI.revive(info.uri), trusted: info.trusted }; });
            result.uriTrustInfo = result.uriTrustInfo.filter(info => info.trusted);
            return result;
        }
        async saveTrustInfo() {
            this.storageService.store(this.storageKey, JSON.stringify(this._trustStateInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._onDidChangeTrustedFolders.fire();
            await this.updateWorkspaceTrust();
        }
        getWorkspaceUris() {
            const workspaceUris = this._canonicalWorkspace.folders.map(f => f.uri);
            const workspaceConfiguration = this._canonicalWorkspace.configuration;
            if (workspaceConfiguration && (0, workspace_1.isSavedWorkspace)(workspaceConfiguration, this.environmentService)) {
                workspaceUris.push(workspaceConfiguration);
            }
            return workspaceUris;
        }
        calculateWorkspaceTrust() {
            // Feature is disabled
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return true;
            }
            // Canonical Uris not yet resolved
            if (!this._canonicalUrisResolved) {
                return false;
            }
            // Remote - resolver explicitly sets workspace trust to TRUE
            if (this.environmentService.remoteAuthority && this._remoteAuthority?.options?.isTrusted) {
                return this._remoteAuthority.options.isTrusted;
            }
            // Empty workspace - use memento, open ediors, or user setting
            if (this.isEmptyWorkspace()) {
                // Use memento if present
                if (this._storedTrustState.isEmptyWorkspaceTrusted !== undefined) {
                    return this._storedTrustState.isEmptyWorkspaceTrusted;
                }
                // Startup files
                if (this._canonicalStartupFiles.length) {
                    return this.getUrisTrust(this._canonicalStartupFiles);
                }
                // User setting
                return !!this.configurationService.getValue(exports.WORKSPACE_TRUST_EMPTY_WINDOW);
            }
            return this.getUrisTrust(this.getWorkspaceUris());
        }
        async updateWorkspaceTrust(trusted) {
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return;
            }
            if (trusted === undefined) {
                await this.resolveCanonicalUris();
                trusted = this.calculateWorkspaceTrust();
            }
            if (this.isWorkspaceTrusted() === trusted) {
                return;
            }
            // Update workspace trust
            this.isTrusted = trusted;
            // Run workspace trust transition participants
            await this._trustTransitionManager.participate(trusted);
            // Fire workspace trust change event
            this._onDidChangeTrust.fire(trusted);
        }
        getUrisTrust(uris) {
            let state = true;
            for (const uri of uris) {
                const { trusted } = this.doGetUriTrustInfo(uri);
                if (!trusted) {
                    state = trusted;
                    return state;
                }
            }
            return state;
        }
        doGetUriTrustInfo(uri) {
            // Return trusted when workspace trust is disabled
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return { trusted: true, uri };
            }
            if (this.isTrustedVirtualResource(uri)) {
                return { trusted: true, uri };
            }
            if (this.isTrustedByRemote(uri)) {
                return { trusted: true, uri };
            }
            let resultState = false;
            let maxLength = -1;
            let resultUri = uri;
            for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
                if (this.uriIdentityService.extUri.isEqualOrParent(uri, trustInfo.uri)) {
                    const fsPath = trustInfo.uri.fsPath;
                    if (fsPath.length > maxLength) {
                        maxLength = fsPath.length;
                        resultState = trustInfo.trusted;
                        resultUri = trustInfo.uri;
                    }
                }
            }
            return { trusted: resultState, uri: resultUri };
        }
        async doSetUrisTrust(uris, trusted) {
            let changed = false;
            for (const uri of uris) {
                if (trusted) {
                    if (this.isTrustedVirtualResource(uri)) {
                        continue;
                    }
                    if (this.isTrustedByRemote(uri)) {
                        continue;
                    }
                    const foundItem = this._trustStateInfo.uriTrustInfo.find(trustInfo => this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
                    if (!foundItem) {
                        this._trustStateInfo.uriTrustInfo.push({ uri, trusted: true });
                        changed = true;
                    }
                }
                else {
                    const previousLength = this._trustStateInfo.uriTrustInfo.length;
                    this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter(trustInfo => !this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
                    if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
                        changed = true;
                    }
                }
            }
            if (changed) {
                await this.saveTrustInfo();
            }
        }
        isEmptyWorkspace() {
            if (this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return true;
            }
            const workspace = this.workspaceService.getWorkspace();
            if (workspace) {
                return (0, workspace_1.isTemporaryWorkspace)(this.workspaceService.getWorkspace()) && workspace.folders.length === 0;
            }
            return false;
        }
        isTrustedVirtualResource(uri) {
            return (0, virtualWorkspace_1.isVirtualResource)(uri) && uri.scheme !== 'vscode-vfs';
        }
        isTrustedByRemote(uri) {
            if (!this.environmentService.remoteAuthority) {
                return false;
            }
            if (!this._remoteAuthority) {
                return false;
            }
            return ((0, resources_1.isEqualAuthority)((0, remoteHosts_1.getRemoteAuthority)(uri), this._remoteAuthority.authority.authority)) && !!this._remoteAuthority.options?.isTrusted;
        }
        set isTrusted(value) {
            this._isTrusted = value;
            // Reset acceptsOutOfWorkspaceFiles
            if (!value) {
                this._storedTrustState.acceptsOutOfWorkspaceFiles = false;
            }
            // Empty workspace - save memento
            if (this.isEmptyWorkspace()) {
                this._storedTrustState.isEmptyWorkspaceTrusted = value;
            }
        }
        //#endregion
        //#region public interface
        get workspaceResolved() {
            return this._workspaceResolvedPromise;
        }
        get workspaceTrustInitialized() {
            return this._workspaceTrustInitializedPromise;
        }
        get acceptsOutOfWorkspaceFiles() {
            return this._storedTrustState.acceptsOutOfWorkspaceFiles;
        }
        set acceptsOutOfWorkspaceFiles(value) {
            this._storedTrustState.acceptsOutOfWorkspaceFiles = value;
        }
        isWorkspaceTrusted() {
            return this._isTrusted;
        }
        isWorkspaceTrustForced() {
            // Remote - remote authority explicitly sets workspace trust
            if (this.environmentService.remoteAuthority && this._remoteAuthority && this._remoteAuthority.options?.isTrusted !== undefined) {
                return true;
            }
            // All workspace uris are trusted automatically
            const workspaceUris = this.getWorkspaceUris().filter(uri => !this.isTrustedVirtualResource(uri));
            if (workspaceUris.length === 0) {
                return true;
            }
            return false;
        }
        canSetParentFolderTrust() {
            const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this._canonicalWorkspace);
            if (!(0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return false;
            }
            if (workspaceIdentifier.uri.scheme !== network_1.Schemas.file && workspaceIdentifier.uri.scheme !== network_1.Schemas.vscodeRemote) {
                return false;
            }
            const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
            if (this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, parentFolder)) {
                return false;
            }
            return true;
        }
        async setParentFolderTrust(trusted) {
            if (this.canSetParentFolderTrust()) {
                const workspaceUri = (0, workspace_1.toWorkspaceIdentifier)(this._canonicalWorkspace).uri;
                const parentFolder = this.uriIdentityService.extUri.dirname(workspaceUri);
                await this.setUrisTrust([parentFolder], trusted);
            }
        }
        canSetWorkspaceTrust() {
            // Remote - remote authority not yet resolved, or remote authority explicitly sets workspace trust
            if (this.environmentService.remoteAuthority && (!this._remoteAuthority || this._remoteAuthority.options?.isTrusted !== undefined)) {
                return false;
            }
            // Empty workspace
            if (this.isEmptyWorkspace()) {
                return true;
            }
            // All workspace uris are trusted automatically
            const workspaceUris = this.getWorkspaceUris().filter(uri => !this.isTrustedVirtualResource(uri));
            if (workspaceUris.length === 0) {
                return false;
            }
            // Untrusted workspace
            if (!this.isWorkspaceTrusted()) {
                return true;
            }
            // Trusted workspaces
            // Can only untrusted in the single folder scenario
            const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this._canonicalWorkspace);
            if (!(0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return false;
            }
            // Can only be untrusted in certain schemes
            if (workspaceIdentifier.uri.scheme !== network_1.Schemas.file && workspaceIdentifier.uri.scheme !== 'vscode-vfs') {
                return false;
            }
            // If the current folder isn't trusted directly, return false
            const trustInfo = this.doGetUriTrustInfo(workspaceIdentifier.uri);
            if (!trustInfo.trusted || !this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, trustInfo.uri)) {
                return false;
            }
            // Check if the parent is also trusted
            if (this.canSetParentFolderTrust()) {
                const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
                const parentPathTrustInfo = this.doGetUriTrustInfo(parentFolder);
                if (parentPathTrustInfo.trusted) {
                    return false;
                }
            }
            return true;
        }
        async setWorkspaceTrust(trusted) {
            // Empty workspace
            if (this.isEmptyWorkspace()) {
                await this.updateWorkspaceTrust(trusted);
                return;
            }
            const workspaceFolders = this.getWorkspaceUris();
            await this.setUrisTrust(workspaceFolders, trusted);
        }
        async getUriTrustInfo(uri) {
            // Return trusted when workspace trust is disabled
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return { trusted: true, uri };
            }
            // Uri is trusted automatically by the remote
            if (this.isTrustedByRemote(uri)) {
                return { trusted: true, uri };
            }
            return this.doGetUriTrustInfo(await this.getCanonicalUri(uri));
        }
        async setUrisTrust(uris, trusted) {
            this.doSetUrisTrust(await Promise.all(uris.map(uri => this.getCanonicalUri(uri))), trusted);
        }
        getTrustedUris() {
            return this._trustStateInfo.uriTrustInfo.map(info => info.uri);
        }
        async setTrustedUris(uris) {
            this._trustStateInfo.uriTrustInfo = [];
            for (const uri of uris) {
                const canonicalUri = await this.getCanonicalUri(uri);
                const cleanUri = this.uriIdentityService.extUri.removeTrailingPathSeparator(canonicalUri);
                let added = false;
                for (const addedUri of this._trustStateInfo.uriTrustInfo) {
                    if (this.uriIdentityService.extUri.isEqual(addedUri.uri, cleanUri)) {
                        added = true;
                        break;
                    }
                }
                if (added) {
                    continue;
                }
                this._trustStateInfo.uriTrustInfo.push({
                    trusted: true,
                    uri: cleanUri
                });
            }
            await this.saveTrustInfo();
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(participant);
        }
    };
    exports.WorkspaceTrustManagementService = WorkspaceTrustManagementService;
    exports.WorkspaceTrustManagementService = WorkspaceTrustManagementService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(2, storage_1.IStorageService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(7, files_1.IFileService)
    ], WorkspaceTrustManagementService);
    let WorkspaceTrustRequestService = class WorkspaceTrustRequestService extends lifecycle_1.Disposable {
        constructor(configurationService, workspaceTrustManagementService) {
            super();
            this.configurationService = configurationService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this._onDidInitiateOpenFilesTrustRequest = this._register(new event_1.Emitter());
            this.onDidInitiateOpenFilesTrustRequest = this._onDidInitiateOpenFilesTrustRequest.event;
            this._onDidInitiateWorkspaceTrustRequest = this._register(new event_1.Emitter());
            this.onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
            this._onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new event_1.Emitter());
            this.onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
        }
        //#region Open file(s) trust request
        get untrustedFilesSetting() {
            return this.configurationService.getValue(exports.WORKSPACE_TRUST_UNTRUSTED_FILES);
        }
        set untrustedFilesSetting(value) {
            this.configurationService.updateValue(exports.WORKSPACE_TRUST_UNTRUSTED_FILES, value);
        }
        async completeOpenFilesTrustRequest(result, saveResponse) {
            if (!this._openFilesTrustRequestResolver) {
                return;
            }
            // Set acceptsOutOfWorkspaceFiles
            if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles = true;
            }
            // Save response
            if (saveResponse) {
                if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                    this.untrustedFilesSetting = 'open';
                }
                if (result === 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */) {
                    this.untrustedFilesSetting = 'newWindow';
                }
            }
            // Resolve promise
            this._openFilesTrustRequestResolver(result);
            this._openFilesTrustRequestResolver = undefined;
            this._openFilesTrustRequestPromise = undefined;
        }
        async requestOpenFilesTrust(uris) {
            // If workspace is untrusted, there is no conflict
            if (!this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            const openFilesTrustInfo = await Promise.all(uris.map(uri => this.workspaceTrustManagementService.getUriTrustInfo(uri)));
            // If all uris are trusted, there is no conflict
            if (openFilesTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            // If user has setting, don't need to ask
            if (this.untrustedFilesSetting !== 'prompt') {
                if (this.untrustedFilesSetting === 'newWindow') {
                    return 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */;
                }
                if (this.untrustedFilesSetting === 'open') {
                    return 1 /* WorkspaceTrustUriResponse.Open */;
                }
            }
            // If we already asked the user, don't need to ask again
            if (this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            // Create/return a promise
            if (!this._openFilesTrustRequestPromise) {
                this._openFilesTrustRequestPromise = new Promise(resolve => {
                    this._openFilesTrustRequestResolver = resolve;
                });
            }
            else {
                return this._openFilesTrustRequestPromise;
            }
            this._onDidInitiateOpenFilesTrustRequest.fire();
            return this._openFilesTrustRequestPromise;
        }
        //#endregion
        //#region Workspace trust request
        resolveWorkspaceTrustRequest(trusted) {
            if (this._workspaceTrustRequestResolver) {
                this._workspaceTrustRequestResolver(trusted ?? this.workspaceTrustManagementService.isWorkspaceTrusted());
                this._workspaceTrustRequestResolver = undefined;
                this._workspaceTrustRequestPromise = undefined;
            }
        }
        cancelWorkspaceTrustRequest() {
            if (this._workspaceTrustRequestResolver) {
                this._workspaceTrustRequestResolver(undefined);
                this._workspaceTrustRequestResolver = undefined;
                this._workspaceTrustRequestPromise = undefined;
            }
        }
        async completeWorkspaceTrustRequest(trusted) {
            if (trusted === undefined || trusted === this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                this.resolveWorkspaceTrustRequest(trusted);
                return;
            }
            // Register one-time event handler to resolve the promise when workspace trust changed
            event_1.Event.once(this.workspaceTrustManagementService.onDidChangeTrust)(trusted => this.resolveWorkspaceTrustRequest(trusted));
            // Update storage, transition workspace state
            await this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
        }
        async requestWorkspaceTrust(options) {
            // Trusted workspace
            if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                return this.workspaceTrustManagementService.isWorkspaceTrusted();
            }
            // Modal request
            if (!this._workspaceTrustRequestPromise) {
                // Create promise
                this._workspaceTrustRequestPromise = new Promise(resolve => {
                    this._workspaceTrustRequestResolver = resolve;
                });
            }
            else {
                // Return existing promise
                return this._workspaceTrustRequestPromise;
            }
            this._onDidInitiateWorkspaceTrustRequest.fire(options);
            return this._workspaceTrustRequestPromise;
        }
        requestWorkspaceTrustOnStartup() {
            if (!this._workspaceTrustRequestPromise) {
                // Create promise
                this._workspaceTrustRequestPromise = new Promise(resolve => {
                    this._workspaceTrustRequestResolver = resolve;
                });
            }
            this._onDidInitiateWorkspaceTrustRequestOnStartup.fire();
        }
    };
    exports.WorkspaceTrustRequestService = WorkspaceTrustRequestService;
    exports.WorkspaceTrustRequestService = WorkspaceTrustRequestService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], WorkspaceTrustRequestService);
    class WorkspaceTrustTransitionManager extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.participants = new linkedList_1.LinkedList();
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            const remove = this.participants.push(participant);
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        async participate(trusted) {
            for (const participant of this.participants) {
                await participant.participate(trusted);
            }
        }
        dispose() {
            this.participants.clear();
        }
    }
    class WorkspaceTrustMemento {
        constructor(storageService) {
            this._acceptsOutOfWorkspaceFilesKey = 'acceptsOutOfWorkspaceFiles';
            this._isEmptyWorkspaceTrustedKey = 'isEmptyWorkspaceTrusted';
            if (storageService) {
                this._memento = new memento_1.Memento('workspaceTrust', storageService);
                this._mementoObject = this._memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this._mementoObject = {};
            }
        }
        get acceptsOutOfWorkspaceFiles() {
            return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] ?? false;
        }
        set acceptsOutOfWorkspaceFiles(value) {
            this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value;
            this._memento?.saveMemento();
        }
        get isEmptyWorkspaceTrusted() {
            return this._mementoObject[this._isEmptyWorkspaceTrustedKey];
        }
        set isEmptyWorkspaceTrusted(value) {
            this._mementoObject[this._isEmptyWorkspaceTrustedKey] = value;
            this._memento?.saveMemento();
        }
    }
    (0, extensions_1.registerSingleton)(workspaceTrust_1.IWorkspaceTrustRequestService, WorkspaceTrustRequestService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya3NwYWNlcy9jb21tb24vd29ya3NwYWNlVHJ1c3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUJuRixRQUFBLHVCQUF1QixHQUFHLGtDQUFrQyxDQUFDO0lBQzdELFFBQUEsOEJBQThCLEdBQUcsd0NBQXdDLENBQUM7SUFDMUUsUUFBQSxzQkFBc0IsR0FBRyxpQ0FBaUMsQ0FBQztJQUMzRCxRQUFBLCtCQUErQixHQUFHLHlDQUF5QyxDQUFDO0lBQzVFLFFBQUEsNEJBQTRCLEdBQUcsc0NBQXNDLENBQUM7SUFDdEUsUUFBQSxpQ0FBaUMsR0FBRyx1Q0FBdUMsQ0FBQztJQUM1RSxRQUFBLDJCQUEyQixHQUFHLHlCQUF5QixDQUFDO0lBRXJFLE1BQWEsa0JBQWtCO1FBQzlCLFlBQ2tCLGlCQUE2QixFQUM3QixtQkFBMEIsRUFDMUIsc0JBQThDO1lBRjlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBWTtZQUM3Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQU87WUFDMUIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM1RCxDQUFDO1FBR0wsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDM0QsT0FBTztvQkFDTixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7b0JBQ25CLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtvQkFDakIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO29CQUM3QixHQUFHLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztpQkFDcEMsQ0FBQztZQUNILENBQUMsQ0FB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