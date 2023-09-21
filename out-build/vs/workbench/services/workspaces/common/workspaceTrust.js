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
    exports.$ucb = exports.$tcb = exports.$scb = exports.$rcb = exports.$qcb = exports.$pcb = exports.$ocb = exports.$ncb = exports.$mcb = exports.$lcb = exports.$kcb = void 0;
    exports.$kcb = 'security.workspace.trust.enabled';
    exports.$lcb = 'security.workspace.trust.startupPrompt';
    exports.$mcb = 'security.workspace.trust.banner';
    exports.$ncb = 'security.workspace.trust.untrustedFiles';
    exports.$ocb = 'security.workspace.trust.emptyWindow';
    exports.$pcb = 'extensions.supportUntrustedWorkspaces';
    exports.$qcb = 'content.trust.model.key';
    class $rcb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        get folders() {
            return this.a.folders.map((folder, index) => {
                return {
                    index: folder.index,
                    name: folder.name,
                    toResource: folder.toResource,
                    uri: this.b[index]
                };
            });
        }
        get transient() {
            return this.a.transient;
        }
        get configuration() {
            return this.c ?? this.a.configuration;
        }
        get id() {
            return this.a.id;
        }
    }
    exports.$rcb = $rcb;
    let $scb = class $scb extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        isWorkspaceTrustEnabled() {
            if (this.b.disableWorkspaceTrust) {
                return false;
            }
            return !!this.a.getValue(exports.$kcb);
        }
    };
    exports.$scb = $scb;
    exports.$scb = $scb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, environmentService_1.$hJ)
    ], $scb);
    let $tcb = class $tcb extends lifecycle_1.$kc {
        constructor(D, F, G, H, I, J, L, M) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.a = exports.$qcb;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeTrust = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeTrustedFolders = this.m.event;
            this.n = [];
            this.s = false;
            this.r = this.J.getWorkspace();
            this.b = new Promise((resolve) => {
                this.c = resolve;
            });
            this.g = new Promise((resolve) => {
                this.h = resolve;
            });
            this.z = new WorkspaceTrustMemento(platform_1.$o && this.ab() ? undefined : this.G);
            this.C = this.B(new WorkspaceTrustTransitionManager());
            this.w = this.R();
            this.t = this.W();
            this.N();
            this.O();
        }
        //#region initialize
        N() {
            // Resolve canonical Uris
            this.Q()
                .then(async () => {
                this.s = true;
                await this.X();
            })
                .finally(() => {
                this.c();
                if (!this.I.remoteAuthority) {
                    this.h();
                }
            });
            // Remote - resolve remote authority
            if (this.I.remoteAuthority) {
                this.F.resolveAuthority(this.I.remoteAuthority)
                    .then(async (result) => {
                    this.y = result;
                    await this.M.activateProvider(network_1.Schemas.vscodeRemote);
                    await this.X();
                })
                    .finally(() => {
                    this.h();
                });
            }
            // Empty workspace - save initial state to memento
            if (this.ab()) {
                this.g.then(() => {
                    if (this.z.isEmptyWorkspaceTrusted === undefined) {
                        this.z.isEmptyWorkspaceTrusted = this.isWorkspaceTrusted();
                    }
                });
            }
        }
        //#endregion
        //#region private interface
        O() {
            this.B(this.J.onDidChangeWorkspaceFolders(async () => await this.X()));
            this.B(this.G.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this.a, this.B(new lifecycle_1.$jc()))(async () => {
                /* This will only execute if storage was changed by a user action in a separate window */
                if (JSON.stringify(this.w) !== JSON.stringify(this.R())) {
                    this.w = this.R();
                    this.m.fire();
                    await this.X();
                }
            }));
        }
        async P(uri) {
            let canonicalUri = uri;
            if (this.I.remoteAuthority && uri.scheme === network_1.Schemas.vscodeRemote) {
                canonicalUri = await this.F.getCanonicalURI(uri);
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
        async Q() {
            // Open editors
            const filesToOpen = [];
            if (this.I.filesToOpenOrCreate) {
                filesToOpen.push(...this.I.filesToOpenOrCreate);
            }
            if (this.I.filesToDiff) {
                filesToOpen.push(...this.I.filesToDiff);
            }
            if (this.I.filesToMerge) {
                filesToOpen.push(...this.I.filesToMerge);
            }
            if (filesToOpen.length) {
                const filesToOpenOrCreateUris = filesToOpen.filter(f => !!f.fileUri).map(f => f.fileUri);
                const canonicalFilesToOpen = await Promise.all(filesToOpenOrCreateUris.map(uri => this.P(uri)));
                this.n.push(...canonicalFilesToOpen.filter(uri => this.n.every(u => !this.H.extUri.isEqual(uri, u))));
            }
            // Workspace
            const workspaceUris = this.J.getWorkspace().folders.map(f => f.uri);
            const canonicalWorkspaceFolders = await Promise.all(workspaceUris.map(uri => this.P(uri)));
            let canonicalWorkspaceConfiguration = this.J.getWorkspace().configuration;
            if (canonicalWorkspaceConfiguration && (0, workspace_1.$6h)(canonicalWorkspaceConfiguration, this.I)) {
                canonicalWorkspaceConfiguration = await this.P(canonicalWorkspaceConfiguration);
            }
            this.r = new $rcb(this.J.getWorkspace(), canonicalWorkspaceFolders, canonicalWorkspaceConfiguration);
        }
        R() {
            const infoAsString = this.G.get(this.a, -1 /* StorageScope.APPLICATION */);
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
        async S() {
            this.G.store(this.a, JSON.stringify(this.w), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this.m.fire();
            await this.X();
        }
        U() {
            const workspaceUris = this.r.folders.map(f => f.uri);
            const workspaceConfiguration = this.r.configuration;
            if (workspaceConfiguration && (0, workspace_1.$6h)(workspaceConfiguration, this.I)) {
                workspaceUris.push(workspaceConfiguration);
            }
            return workspaceUris;
        }
        W() {
            // Feature is disabled
            if (!this.L.isWorkspaceTrustEnabled()) {
                return true;
            }
            // Canonical Uris not yet resolved
            if (!this.s) {
                return false;
            }
            // Remote - resolver explicitly sets workspace trust to TRUE
            if (this.I.remoteAuthority && this.y?.options?.isTrusted) {
                return this.y.options.isTrusted;
            }
            // Empty workspace - use memento, open ediors, or user setting
            if (this.ab()) {
                // Use memento if present
                if (this.z.isEmptyWorkspaceTrusted !== undefined) {
                    return this.z.isEmptyWorkspaceTrusted;
                }
                // Startup files
                if (this.n.length) {
                    return this.Y(this.n);
                }
                // User setting
                return !!this.D.getValue(exports.$ocb);
            }
            return this.Y(this.U());
        }
        async X(trusted) {
            if (!this.L.isWorkspaceTrustEnabled()) {
                return;
            }
            if (trusted === undefined) {
                await this.Q();
                trusted = this.W();
            }
            if (this.isWorkspaceTrusted() === trusted) {
                return;
            }
            // Update workspace trust
            this.db = trusted;
            // Run workspace trust transition participants
            await this.C.participate(trusted);
            // Fire workspace trust change event
            this.j.fire(trusted);
        }
        Y(uris) {
            let state = true;
            for (const uri of uris) {
                const { trusted } = this.Z(uri);
                if (!trusted) {
                    state = trusted;
                    return state;
                }
            }
            return state;
        }
        Z(uri) {
            // Return trusted when workspace trust is disabled
            if (!this.L.isWorkspaceTrustEnabled()) {
                return { trusted: true, uri };
            }
            if (this.bb(uri)) {
                return { trusted: true, uri };
            }
            if (this.cb(uri)) {
                return { trusted: true, uri };
            }
            let resultState = false;
            let maxLength = -1;
            let resultUri = uri;
            for (const trustInfo of this.w.uriTrustInfo) {
                if (this.H.extUri.isEqualOrParent(uri, trustInfo.uri)) {
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
        async $(uris, trusted) {
            let changed = false;
            for (const uri of uris) {
                if (trusted) {
                    if (this.bb(uri)) {
                        continue;
                    }
                    if (this.cb(uri)) {
                        continue;
                    }
                    const foundItem = this.w.uriTrustInfo.find(trustInfo => this.H.extUri.isEqual(trustInfo.uri, uri));
                    if (!foundItem) {
                        this.w.uriTrustInfo.push({ uri, trusted: true });
                        changed = true;
                    }
                }
                else {
                    const previousLength = this.w.uriTrustInfo.length;
                    this.w.uriTrustInfo = this.w.uriTrustInfo.filter(trustInfo => !this.H.extUri.isEqual(trustInfo.uri, uri));
                    if (previousLength !== this.w.uriTrustInfo.length) {
                        changed = true;
                    }
                }
            }
            if (changed) {
                await this.S();
            }
        }
        ab() {
            if (this.J.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return true;
            }
            const workspace = this.J.getWorkspace();
            if (workspace) {
                return (0, workspace_1.$3h)(this.J.getWorkspace()) && workspace.folders.length === 0;
            }
            return false;
        }
        bb(uri) {
            return (0, virtualWorkspace_1.$tJ)(uri) && uri.scheme !== 'vscode-vfs';
        }
        cb(uri) {
            if (!this.I.remoteAuthority) {
                return false;
            }
            if (!this.y) {
                return false;
            }
            return ((0, resources_1.$ng)((0, remoteHosts_1.$Ok)(uri), this.y.authority.authority)) && !!this.y.options?.isTrusted;
        }
        set db(value) {
            this.t = value;
            // Reset acceptsOutOfWorkspaceFiles
            if (!value) {
                this.z.acceptsOutOfWorkspaceFiles = false;
            }
            // Empty workspace - save memento
            if (this.ab()) {
                this.z.isEmptyWorkspaceTrusted = value;
            }
        }
        //#endregion
        //#region public interface
        get workspaceResolved() {
            return this.b;
        }
        get workspaceTrustInitialized() {
            return this.g;
        }
        get acceptsOutOfWorkspaceFiles() {
            return this.z.acceptsOutOfWorkspaceFiles;
        }
        set acceptsOutOfWorkspaceFiles(value) {
            this.z.acceptsOutOfWorkspaceFiles = value;
        }
        isWorkspaceTrusted() {
            return this.t;
        }
        isWorkspaceTrustForced() {
            // Remote - remote authority explicitly sets workspace trust
            if (this.I.remoteAuthority && this.y && this.y.options?.isTrusted !== undefined) {
                return true;
            }
            // All workspace uris are trusted automatically
            const workspaceUris = this.U().filter(uri => !this.bb(uri));
            if (workspaceUris.length === 0) {
                return true;
            }
            return false;
        }
        canSetParentFolderTrust() {
            const workspaceIdentifier = (0, workspace_1.$Ph)(this.r);
            if (!(0, workspace_1.$Lh)(workspaceIdentifier)) {
                return false;
            }
            if (workspaceIdentifier.uri.scheme !== network_1.Schemas.file && workspaceIdentifier.uri.scheme !== network_1.Schemas.vscodeRemote) {
                return false;
            }
            const parentFolder = this.H.extUri.dirname(workspaceIdentifier.uri);
            if (this.H.extUri.isEqual(workspaceIdentifier.uri, parentFolder)) {
                return false;
            }
            return true;
        }
        async setParentFolderTrust(trusted) {
            if (this.canSetParentFolderTrust()) {
                const workspaceUri = (0, workspace_1.$Ph)(this.r).uri;
                const parentFolder = this.H.extUri.dirname(workspaceUri);
                await this.setUrisTrust([parentFolder], trusted);
            }
        }
        canSetWorkspaceTrust() {
            // Remote - remote authority not yet resolved, or remote authority explicitly sets workspace trust
            if (this.I.remoteAuthority && (!this.y || this.y.options?.isTrusted !== undefined)) {
                return false;
            }
            // Empty workspace
            if (this.ab()) {
                return true;
            }
            // All workspace uris are trusted automatically
            const workspaceUris = this.U().filter(uri => !this.bb(uri));
            if (workspaceUris.length === 0) {
                return false;
            }
            // Untrusted workspace
            if (!this.isWorkspaceTrusted()) {
                return true;
            }
            // Trusted workspaces
            // Can only untrusted in the single folder scenario
            const workspaceIdentifier = (0, workspace_1.$Ph)(this.r);
            if (!(0, workspace_1.$Lh)(workspaceIdentifier)) {
                return false;
            }
            // Can only be untrusted in certain schemes
            if (workspaceIdentifier.uri.scheme !== network_1.Schemas.file && workspaceIdentifier.uri.scheme !== 'vscode-vfs') {
                return false;
            }
            // If the current folder isn't trusted directly, return false
            const trustInfo = this.Z(workspaceIdentifier.uri);
            if (!trustInfo.trusted || !this.H.extUri.isEqual(workspaceIdentifier.uri, trustInfo.uri)) {
                return false;
            }
            // Check if the parent is also trusted
            if (this.canSetParentFolderTrust()) {
                const parentFolder = this.H.extUri.dirname(workspaceIdentifier.uri);
                const parentPathTrustInfo = this.Z(parentFolder);
                if (parentPathTrustInfo.trusted) {
                    return false;
                }
            }
            return true;
        }
        async setWorkspaceTrust(trusted) {
            // Empty workspace
            if (this.ab()) {
                await this.X(trusted);
                return;
            }
            const workspaceFolders = this.U();
            await this.setUrisTrust(workspaceFolders, trusted);
        }
        async getUriTrustInfo(uri) {
            // Return trusted when workspace trust is disabled
            if (!this.L.isWorkspaceTrustEnabled()) {
                return { trusted: true, uri };
            }
            // Uri is trusted automatically by the remote
            if (this.cb(uri)) {
                return { trusted: true, uri };
            }
            return this.Z(await this.P(uri));
        }
        async setUrisTrust(uris, trusted) {
            this.$(await Promise.all(uris.map(uri => this.P(uri))), trusted);
        }
        getTrustedUris() {
            return this.w.uriTrustInfo.map(info => info.uri);
        }
        async setTrustedUris(uris) {
            this.w.uriTrustInfo = [];
            for (const uri of uris) {
                const canonicalUri = await this.P(uri);
                const cleanUri = this.H.extUri.removeTrailingPathSeparator(canonicalUri);
                let added = false;
                for (const addedUri of this.w.uriTrustInfo) {
                    if (this.H.extUri.isEqual(addedUri.uri, cleanUri)) {
                        added = true;
                        break;
                    }
                }
                if (added) {
                    continue;
                }
                this.w.uriTrustInfo.push({
                    trusted: true,
                    uri: cleanUri
                });
            }
            await this.S();
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            return this.C.addWorkspaceTrustTransitionParticipant(participant);
        }
    };
    exports.$tcb = $tcb;
    exports.$tcb = $tcb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, remoteAuthorityResolver_1.$Jk),
        __param(2, storage_1.$Vo),
        __param(3, uriIdentity_1.$Ck),
        __param(4, environmentService_1.$hJ),
        __param(5, workspace_1.$Kh),
        __param(6, workspaceTrust_1.$0z),
        __param(7, files_1.$6j)
    ], $tcb);
    let $ucb = class $ucb extends lifecycle_1.$kc {
        constructor(n, r) {
            super();
            this.n = n;
            this.r = r;
            this.h = this.B(new event_1.$fd());
            this.onDidInitiateOpenFilesTrustRequest = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidInitiateWorkspaceTrustRequest = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidInitiateWorkspaceTrustRequestOnStartup = this.m.event;
        }
        //#region Open file(s) trust request
        get s() {
            return this.n.getValue(exports.$ncb);
        }
        set s(value) {
            this.n.updateValue(exports.$ncb, value);
        }
        async completeOpenFilesTrustRequest(result, saveResponse) {
            if (!this.b) {
                return;
            }
            // Set acceptsOutOfWorkspaceFiles
            if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                this.r.acceptsOutOfWorkspaceFiles = true;
            }
            // Save response
            if (saveResponse) {
                if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                    this.s = 'open';
                }
                if (result === 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */) {
                    this.s = 'newWindow';
                }
            }
            // Resolve promise
            this.b(result);
            this.b = undefined;
            this.a = undefined;
        }
        async requestOpenFilesTrust(uris) {
            // If workspace is untrusted, there is no conflict
            if (!this.r.isWorkspaceTrusted()) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            const openFilesTrustInfo = await Promise.all(uris.map(uri => this.r.getUriTrustInfo(uri)));
            // If all uris are trusted, there is no conflict
            if (openFilesTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            // If user has setting, don't need to ask
            if (this.s !== 'prompt') {
                if (this.s === 'newWindow') {
                    return 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */;
                }
                if (this.s === 'open') {
                    return 1 /* WorkspaceTrustUriResponse.Open */;
                }
            }
            // If we already asked the user, don't need to ask again
            if (this.r.acceptsOutOfWorkspaceFiles) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            // Create/return a promise
            if (!this.a) {
                this.a = new Promise(resolve => {
                    this.b = resolve;
                });
            }
            else {
                return this.a;
            }
            this.h.fire();
            return this.a;
        }
        //#endregion
        //#region Workspace trust request
        t(trusted) {
            if (this.g) {
                this.g(trusted ?? this.r.isWorkspaceTrusted());
                this.g = undefined;
                this.c = undefined;
            }
        }
        cancelWorkspaceTrustRequest() {
            if (this.g) {
                this.g(undefined);
                this.g = undefined;
                this.c = undefined;
            }
        }
        async completeWorkspaceTrustRequest(trusted) {
            if (trusted === undefined || trusted === this.r.isWorkspaceTrusted()) {
                this.t(trusted);
                return;
            }
            // Register one-time event handler to resolve the promise when workspace trust changed
            event_1.Event.once(this.r.onDidChangeTrust)(trusted => this.t(trusted));
            // Update storage, transition workspace state
            await this.r.setWorkspaceTrust(trusted);
        }
        async requestWorkspaceTrust(options) {
            // Trusted workspace
            if (this.r.isWorkspaceTrusted()) {
                return this.r.isWorkspaceTrusted();
            }
            // Modal request
            if (!this.c) {
                // Create promise
                this.c = new Promise(resolve => {
                    this.g = resolve;
                });
            }
            else {
                // Return existing promise
                return this.c;
            }
            this.j.fire(options);
            return this.c;
        }
        requestWorkspaceTrustOnStartup() {
            if (!this.c) {
                // Create promise
                this.c = new Promise(resolve => {
                    this.g = resolve;
                });
            }
            this.m.fire();
        }
    };
    exports.$ucb = $ucb;
    exports.$ucb = $ucb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, workspaceTrust_1.$$z)
    ], $ucb);
    class WorkspaceTrustTransitionManager extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = new linkedList_1.$tc();
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            const remove = this.a.push(participant);
            return (0, lifecycle_1.$ic)(() => remove());
        }
        async participate(trusted) {
            for (const participant of this.a) {
                await participant.participate(trusted);
            }
        }
        dispose() {
            this.a.clear();
        }
    }
    class WorkspaceTrustMemento {
        constructor(storageService) {
            this.c = 'acceptsOutOfWorkspaceFiles';
            this.d = 'isEmptyWorkspaceTrusted';
            if (storageService) {
                this.a = new memento_1.$YT('workspaceTrust', storageService);
                this.b = this.a.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.b = {};
            }
        }
        get acceptsOutOfWorkspaceFiles() {
            return this.b[this.c] ?? false;
        }
        set acceptsOutOfWorkspaceFiles(value) {
            this.b[this.c] = value;
            this.a?.saveMemento();
        }
        get isEmptyWorkspaceTrusted() {
            return this.b[this.d];
        }
        set isEmptyWorkspaceTrusted(value) {
            this.b[this.d] = value;
            this.a?.saveMemento();
        }
    }
    (0, extensions_1.$mr)(workspaceTrust_1.$_z, $ucb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceTrust.js.map