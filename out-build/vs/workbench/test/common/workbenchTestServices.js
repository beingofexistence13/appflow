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
define(["require", "exports", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/platform/workspace/test/common/testWorkspace", "vs/base/common/platform", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/product/common/product", "vs/platform/log/common/log"], function (require, exports, path_1, resources_1, uri_1, event_1, configuration_1, testWorkspace_1, platform_1, storage_1, extensions_1, lifecycle_1, product_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gec = exports.$fec = exports.$eec = exports.$dec = exports.$cec = exports.$bec = exports.$aec = exports.mock = exports.$$dc = exports.$0dc = exports.$9dc = exports.$8dc = exports.$7dc = exports.$6dc = exports.$5dc = exports.$4dc = void 0;
    class $4dc extends log_1.$dj {
        constructor(logsHome) {
            super(log_1.LogLevel.Info, logsHome ?? uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }));
        }
        s() { return new log_1.$ej(); }
    }
    exports.$4dc = $4dc;
    let $5dc = class $5dc {
        constructor(a) {
            this.a = a;
        }
        getEOL(resource, language) {
            const eol = this.a.getValue('files.eol', { overrideIdentifier: language, resource });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            return (platform_1.$k || platform_1.$j) ? '\n' : '\r\n';
        }
    };
    exports.$5dc = $5dc;
    exports.$5dc = $5dc = __decorate([
        __param(0, configuration_1.$8h)
    ], $5dc);
    class $6dc {
        get onDidChangeWorkspaceName() { return this.c.event; }
        get onWillChangeWorkspaceFolders() { return this.d.event; }
        get onDidChangeWorkspaceFolders() { return this.e.event; }
        get onDidChangeWorkbenchState() { return this.f.event; }
        constructor(workspace = testWorkspace_1.$$0b, options = null) {
            this.a = workspace;
            this.b = options || Object.create(null);
            this.c = new event_1.$fd();
            this.d = new event_1.$fd();
            this.e = new event_1.$fd();
            this.f = new event_1.$fd();
        }
        getFolders() {
            return this.a ? this.a.folders : [];
        }
        getWorkbenchState() {
            if (this.a.configuration) {
                return 3 /* WorkbenchState.WORKSPACE */;
            }
            if (this.a.folders.length) {
                return 2 /* WorkbenchState.FOLDER */;
            }
            return 1 /* WorkbenchState.EMPTY */;
        }
        getCompleteWorkspace() {
            return Promise.resolve(this.getWorkspace());
        }
        getWorkspace() {
            return this.a;
        }
        getWorkspaceFolder(resource) {
            return this.a.getFolder(resource);
        }
        setWorkspace(workspace) {
            this.a = workspace;
        }
        getOptions() {
            return this.b;
        }
        updateOptions() { }
        isInsideWorkspace(resource) {
            if (resource && this.a) {
                return (0, resources_1.$cg)(resource, this.a.folders[0].uri);
            }
            return false;
        }
        toResource(workspaceRelativePath) {
            return uri_1.URI.file((0, path_1.$9d)('C:\\', workspaceRelativePath));
        }
        isCurrentWorkspace(workspaceIdOrFolder) {
            return uri_1.URI.isUri(workspaceIdOrFolder) && (0, resources_1.$bg)(this.a.folders[0].uri, workspaceIdOrFolder);
        }
    }
    exports.$6dc = $6dc;
    class $7dc extends storage_1.$Zo {
        testEmitWillSaveState(reason) {
            super.w(reason);
        }
    }
    exports.$7dc = $7dc;
    class $8dc {
        constructor(a) {
            this.a = a;
        }
        async reopenLastClosedEditor() { }
        async goForward() { }
        async goBack() { }
        async goPrevious() { }
        async goLast() { }
        removeFromHistory(_input) { }
        clear() { }
        clearRecentlyOpened() { }
        getHistory() { return []; }
        async openNextRecentlyUsedEditor(group) { }
        async openPreviouslyUsedEditor(group) { }
        getLastActiveWorkspaceRoot(_schemeFilter) { return this.a; }
        getLastActiveFile(_schemeFilter) { return undefined; }
    }
    exports.$8dc = $8dc;
    class $9dc extends lifecycle_1.$kc {
        constructor(resource, isDirty = false, typeId = 'testWorkingCopyType') {
            super();
            this.resource = resource;
            this.typeId = typeId;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeContent = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidSave = this.c.event;
            this.capabilities = 0 /* WorkingCopyCapabilities.None */;
            this.name = (0, resources_1.$fg)(this.resource);
            this.f = false;
            this.f = isDirty;
        }
        setDirty(dirty) {
            if (this.f !== dirty) {
                this.f = dirty;
                this.a.fire();
            }
        }
        setContent(content) {
            this.b.fire();
        }
        isDirty() {
            return this.f;
        }
        isModified() {
            return this.isDirty();
        }
        async save(options, stat) {
            this.c.fire({ reason: options?.reason ?? 1 /* SaveReason.EXPLICIT */, stat: stat ?? $0dc(this.resource), source: options?.source });
            return true;
        }
        async revert(options) {
            this.setDirty(false);
        }
        async backup(token) {
            return {};
        }
    }
    exports.$9dc = $9dc;
    function $0dc(resource, readonly = false) {
        return {
            resource,
            etag: Date.now().toString(),
            mtime: Date.now(),
            ctime: Date.now(),
            size: 42,
            isFile: true,
            isDirectory: false,
            isSymbolicLink: false,
            readonly,
            locked: false,
            name: (0, resources_1.$fg)(resource),
            children: undefined
        };
    }
    exports.$0dc = $0dc;
    class $$dc {
        constructor() {
            this.onWillRunWorkingCopyFileOperation = event_1.Event.None;
            this.onDidFailWorkingCopyFileOperation = event_1.Event.None;
            this.onDidRunWorkingCopyFileOperation = event_1.Event.None;
            this.hasSaveParticipants = false;
        }
        addFileOperationParticipant(participant) { return lifecycle_1.$kc.None; }
        addSaveParticipant(participant) { return lifecycle_1.$kc.None; }
        async runSaveParticipants(workingCopy, context, token) { }
        async delete(operations, token, undoInfo) { }
        registerWorkingCopyProvider(provider) { return lifecycle_1.$kc.None; }
        getDirty(resource) { return []; }
        create(operations, token, undoInfo) { throw new Error('Method not implemented.'); }
        createFolder(operations, token, undoInfo) { throw new Error('Method not implemented.'); }
        move(operations, token, undoInfo) { throw new Error('Method not implemented.'); }
        copy(operations, token, undoInfo) { throw new Error('Method not implemented.'); }
    }
    exports.$$dc = $$dc;
    function mock() {
        return function () { };
    }
    exports.mock = mock;
    class $aec extends extensions_1.$VF {
    }
    exports.$aec = $aec;
    exports.$bec = { _serviceBrand: undefined, ...product_1.default };
    class $cec {
        showViewContainerActivity(viewContainerId, badge) {
            return this;
        }
        showViewActivity(viewId, badge) {
            return this;
        }
        showAccountsActivity(activity) {
            return this;
        }
        showGlobalActivity(activity) {
            return this;
        }
        dispose() { }
    }
    exports.$cec = $cec;
    exports.$dec = new class {
        constructor() {
            this.onAutoSaveConfigurationChange = event_1.Event.None;
            this.onReadonlyChange = event_1.Event.None;
            this.onFilesAssociationChange = event_1.Event.None;
            this.isHotExitEnabled = false;
            this.hotExitConfiguration = undefined;
        }
        getAutoSaveConfiguration() { throw new Error('Method not implemented.'); }
        getAutoSaveMode() { throw new Error('Method not implemented.'); }
        toggleAutoSave() { throw new Error('Method not implemented.'); }
        isReadonly(resource, stat) { return false; }
        async updateReadonly(resource, readonly) { }
        preventSaveConflicts(resource, language) { throw new Error('Method not implemented.'); }
    };
    class $eec {
        constructor(a = true) {
            this.a = a;
        }
        isWorkspaceTrustEnabled() {
            return this.a;
        }
    }
    exports.$eec = $eec;
    class $fec extends lifecycle_1.$kc {
        constructor(f = true) {
            super();
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeTrust = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeTrustedFolders = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidInitiateWorkspaceTrustRequestOnStartup = this.c.event;
        }
        get acceptsOutOfWorkspaceFiles() {
            throw new Error('Method not implemented.');
        }
        set acceptsOutOfWorkspaceFiles(value) {
            throw new Error('Method not implemented.');
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            throw new Error('Method not implemented.');
        }
        getTrustedUris() {
            throw new Error('Method not implemented.');
        }
        setParentFolderTrust(trusted) {
            throw new Error('Method not implemented.');
        }
        getUriTrustInfo(uri) {
            throw new Error('Method not implemented.');
        }
        async setTrustedUris(folders) {
            throw new Error('Method not implemented.');
        }
        async setUrisTrust(uris, trusted) {
            throw new Error('Method not implemented.');
        }
        canSetParentFolderTrust() {
            throw new Error('Method not implemented.');
        }
        canSetWorkspaceTrust() {
            throw new Error('Method not implemented.');
        }
        isWorkspaceTrusted() {
            return this.f;
        }
        isWorkspaceTrustForced() {
            return false;
        }
        get workspaceTrustInitialized() {
            return Promise.resolve();
        }
        get workspaceResolved() {
            return Promise.resolve();
        }
        async setWorkspaceTrust(trusted) {
            if (this.f !== trusted) {
                this.f = trusted;
                this.a.fire(this.f);
            }
        }
    }
    exports.$fec = $fec;
    class $gec extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidInitiateOpenFilesTrustRequest = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidInitiateWorkspaceTrustRequest = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidInitiateWorkspaceTrustRequestOnStartup = this.c.event;
            this.requestOpenUrisHandler = async (uris) => {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            };
        }
        requestOpenFilesTrust(uris) {
            return this.requestOpenUrisHandler(uris);
        }
        async completeOpenFilesTrustRequest(result, saveResponse) {
            throw new Error('Method not implemented.');
        }
        cancelWorkspaceTrustRequest() {
            throw new Error('Method not implemented.');
        }
        async completeWorkspaceTrustRequest(trusted) {
            throw new Error('Method not implemented.');
        }
        async requestWorkspaceTrust(options) {
            return this.f;
        }
        requestWorkspaceTrustOnStartup() {
            throw new Error('Method not implemented.');
        }
    }
    exports.$gec = $gec;
});
//# sourceMappingURL=workbenchTestServices.js.map