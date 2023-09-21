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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/network", "vs/base/common/numbers", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri", "vs/nls!vs/workbench/api/common/extHostWorkspace", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/workspace/common/workspace", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/services/search/common/search", "./extHost.protocol"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, lifecycle_1, ternarySearchTree_1, network_1, numbers_1, resources_1, strings_1, uri_1, nls_1, instantiation_1, log_1, notification_1, workspace_1, extHostFileSystemInfo_1, extHostInitDataService_1, extHostRpcService_1, extHostTypeConverters_1, extHostTypes_1, extHostUriTransformerService_1, search_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jbc = exports.$ibc = void 0;
    function isFolderEqual(folderA, folderB, extHostFileSystemInfo) {
        return new resources_1.$0f(uri => ignorePathCasing(uri, extHostFileSystemInfo)).isEqual(folderA, folderB);
    }
    function compareWorkspaceFolderByUri(a, b, extHostFileSystemInfo) {
        return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? 0 : (0, strings_1.$Fe)(a.uri.toString(), b.uri.toString());
    }
    function compareWorkspaceFolderByUriAndNameAndIndex(a, b, extHostFileSystemInfo) {
        if (a.index !== b.index) {
            return a.index < b.index ? -1 : 1;
        }
        return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? (0, strings_1.$Fe)(a.name, b.name) : (0, strings_1.$Fe)(a.uri.toString(), b.uri.toString());
    }
    function delta(oldFolders, newFolders, compare, extHostFileSystemInfo) {
        const oldSortedFolders = oldFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
        const newSortedFolders = newFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
        return (0, arrays_1.$Cb)(oldSortedFolders, newSortedFolders, (a, b) => compare(a, b, extHostFileSystemInfo));
    }
    function ignorePathCasing(uri, extHostFileSystemInfo) {
        const capabilities = extHostFileSystemInfo.getCapabilities(uri.scheme);
        return !(capabilities && (capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
    }
    class ExtHostWorkspaceImpl extends workspace_1.$Uh {
        static toExtHostWorkspace(data, previousConfirmedWorkspace, previousUnconfirmedWorkspace, extHostFileSystemInfo) {
            if (!data) {
                return { workspace: null, added: [], removed: [] };
            }
            const { id, name, folders, configuration, transient, isUntitled } = data;
            const newWorkspaceFolders = [];
            // If we have an existing workspace, we try to find the folders that match our
            // data and update their properties. It could be that an extension stored them
            // for later use and we want to keep them "live" if they are still present.
            const oldWorkspace = previousConfirmedWorkspace;
            if (previousConfirmedWorkspace) {
                folders.forEach((folderData, index) => {
                    const folderUri = uri_1.URI.revive(folderData.uri);
                    const existingFolder = ExtHostWorkspaceImpl.o(previousUnconfirmedWorkspace || previousConfirmedWorkspace, folderUri, extHostFileSystemInfo);
                    if (existingFolder) {
                        existingFolder.name = folderData.name;
                        existingFolder.index = folderData.index;
                        newWorkspaceFolders.push(existingFolder);
                    }
                    else {
                        newWorkspaceFolders.push({ uri: folderUri, name: folderData.name, index });
                    }
                });
            }
            else {
                newWorkspaceFolders.push(...folders.map(({ uri, name, index }) => ({ uri: uri_1.URI.revive(uri), name, index })));
            }
            // make sure to restore sort order based on index
            newWorkspaceFolders.sort((f1, f2) => f1.index < f2.index ? -1 : 1);
            const workspace = new ExtHostWorkspaceImpl(id, name, newWorkspaceFolders, !!transient, configuration ? uri_1.URI.revive(configuration) : null, !!isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo));
            const { added, removed } = delta(oldWorkspace ? oldWorkspace.workspaceFolders : [], workspace.workspaceFolders, compareWorkspaceFolderByUri, extHostFileSystemInfo);
            return { workspace, added, removed };
        }
        static o(workspace, folderUriToFind, extHostFileSystemInfo) {
            for (let i = 0; i < workspace.folders.length; i++) {
                const folder = workspace.workspaceFolders[i];
                if (isFolderEqual(folder.uri, folderUriToFind, extHostFileSystemInfo)) {
                    return folder;
                }
            }
            return undefined;
        }
        constructor(id, t, folders, transient, configuration, u, ignorePathCasing) {
            super(id, folders.map(f => new workspace_1.$Vh(f)), transient, configuration, ignorePathCasing);
            this.t = t;
            this.u = u;
            this.q = [];
            this.s = ternarySearchTree_1.$Hh.forUris(ignorePathCasing);
            // setup the workspace folder data structure
            folders.forEach(folder => {
                this.q.push(folder);
                this.s.set(folder.uri, folder);
            });
        }
        get name() {
            return this.t;
        }
        get isUntitled() {
            return this.u;
        }
        get workspaceFolders() {
            return this.q.slice(0);
        }
        getWorkspaceFolder(uri, resolveParent) {
            if (resolveParent && this.s.get(uri)) {
                // `uri` is a workspace folder so we check for its parent
                uri = (0, resources_1.$hg)(uri);
            }
            return this.s.findSubstr(uri);
        }
        resolveWorkspaceFolder(uri) {
            return this.s.get(uri);
        }
    }
    let $ibc = class $ibc {
        constructor(extHostRpc, initData, extHostFileSystemInfo, logService, uriTransformerService) {
            this.c = new event_1.$fd();
            this.onDidChangeWorkspace = this.c.event;
            this.g = new event_1.$fd();
            this.onDidGrantWorkspaceTrust = this.g.event;
            this.u = [];
            this.v = false;
            this.w = new Map();
            // --- edit sessions ---
            this.z = 0;
            this.A = new event_1.$hd();
            // --- canonical uri identity ---
            this.B = new Map();
            this.h = logService;
            this.s = extHostFileSystemInfo;
            this.t = uriTransformerService;
            this.j = new numbers_1.$Jl();
            this.k = new async_1.$Fg();
            this.o = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadWorkspace);
            this.q = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadMessageService);
            const data = initData.workspace;
            this.l = data ? new ExtHostWorkspaceImpl(data.id, data.name, [], !!data.transient, data.configuration ? uri_1.URI.revive(data.configuration) : null, !!data.isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo)) : undefined;
        }
        $initializeWorkspace(data, trusted) {
            this.v = trusted;
            this.$acceptWorkspaceData(data);
            this.k.open();
        }
        waitForInitializeCall() {
            return this.k.wait();
        }
        // --- workspace ---
        get workspace() {
            return this.x;
        }
        get name() {
            return this.x ? this.x.name : undefined;
        }
        get workspaceFile() {
            if (this.x) {
                if (this.x.configuration) {
                    if (this.x.isUntitled) {
                        return uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: (0, resources_1.$fg)((0, resources_1.$hg)(this.x.configuration)) }); // Untitled Workspace: return untitled URI
                    }
                    return this.x.configuration; // Workspace: return the configuration location
                }
            }
            return undefined;
        }
        get x() {
            return this.n || this.l;
        }
        getWorkspaceFolders() {
            if (!this.x) {
                return undefined;
            }
            return this.x.workspaceFolders.slice(0);
        }
        async getWorkspaceFolders2() {
            await this.k.wait();
            if (!this.x) {
                return undefined;
            }
            return this.x.workspaceFolders.slice(0);
        }
        updateWorkspaceFolders(extension, index, deleteCount, ...workspaceFoldersToAdd) {
            const validatedDistinctWorkspaceFoldersToAdd = [];
            if (Array.isArray(workspaceFoldersToAdd)) {
                workspaceFoldersToAdd.forEach(folderToAdd => {
                    if (uri_1.URI.isUri(folderToAdd.uri) && !validatedDistinctWorkspaceFoldersToAdd.some(f => isFolderEqual(f.uri, folderToAdd.uri, this.s))) {
                        validatedDistinctWorkspaceFoldersToAdd.push({ uri: folderToAdd.uri, name: folderToAdd.name || (0, resources_1.$eg)(folderToAdd.uri) });
                    }
                });
            }
            if (!!this.n) {
                return false; // prevent accumulated calls without a confirmed workspace
            }
            if ([index, deleteCount].some(i => typeof i !== 'number' || i < 0)) {
                return false; // validate numbers
            }
            if (deleteCount === 0 && validatedDistinctWorkspaceFoldersToAdd.length === 0) {
                return false; // nothing to delete or add
            }
            const currentWorkspaceFolders = this.x ? this.x.workspaceFolders : [];
            if (index + deleteCount > currentWorkspaceFolders.length) {
                return false; // cannot delete more than we have
            }
            // Simulate the updateWorkspaceFolders method on our data to do more validation
            const newWorkspaceFolders = currentWorkspaceFolders.slice(0);
            newWorkspaceFolders.splice(index, deleteCount, ...validatedDistinctWorkspaceFoldersToAdd.map(f => ({ uri: f.uri, name: f.name || (0, resources_1.$eg)(f.uri), index: undefined /* fixed later */ })));
            for (let i = 0; i < newWorkspaceFolders.length; i++) {
                const folder = newWorkspaceFolders[i];
                if (newWorkspaceFolders.some((otherFolder, index) => index !== i && isFolderEqual(folder.uri, otherFolder.uri, this.s))) {
                    return false; // cannot add the same folder multiple times
                }
            }
            newWorkspaceFolders.forEach((f, index) => f.index = index); // fix index
            const { added, removed } = delta(currentWorkspaceFolders, newWorkspaceFolders, compareWorkspaceFolderByUriAndNameAndIndex, this.s);
            if (added.length === 0 && removed.length === 0) {
                return false; // nothing actually changed
            }
            // Trigger on main side
            if (this.o) {
                const extName = extension.displayName || extension.name;
                this.o.$updateWorkspaceFolders(extName, index, deleteCount, validatedDistinctWorkspaceFoldersToAdd).then(undefined, error => {
                    // in case of an error, make sure to clear out the unconfirmed workspace
                    // because we cannot expect the acknowledgement from the main side for this
                    this.n = undefined;
                    // show error to user
                    const options = { source: { identifier: extension.identifier, label: extension.displayName || extension.name } };
                    this.q.$showMessage(notification_1.Severity.Error, (0, nls_1.localize)(0, null, extName, error.toString()), options, []);
                });
            }
            // Try to accept directly
            this.y(newWorkspaceFolders);
            return true;
        }
        getWorkspaceFolder(uri, resolveParent) {
            if (!this.x) {
                return undefined;
            }
            return this.x.getWorkspaceFolder(uri, resolveParent);
        }
        async getWorkspaceFolder2(uri, resolveParent) {
            await this.k.wait();
            if (!this.x) {
                return undefined;
            }
            return this.x.getWorkspaceFolder(uri, resolveParent);
        }
        async resolveWorkspaceFolder(uri) {
            await this.k.wait();
            if (!this.x) {
                return undefined;
            }
            return this.x.resolveWorkspaceFolder(uri);
        }
        getPath() {
            // this is legacy from the days before having
            // multi-root and we keep it only alive if there
            // is just one workspace folder.
            if (!this.x) {
                return undefined;
            }
            const { folders } = this.x;
            if (folders.length === 0) {
                return undefined;
            }
            // #54483 @Joh Why are we still using fsPath?
            return folders[0].uri.fsPath;
        }
        getRelativePath(pathOrUri, includeWorkspace) {
            let resource;
            let path = '';
            if (typeof pathOrUri === 'string') {
                resource = uri_1.URI.file(pathOrUri);
                path = pathOrUri;
            }
            else if (typeof pathOrUri !== 'undefined') {
                resource = pathOrUri;
                path = pathOrUri.fsPath;
            }
            if (!resource) {
                return path;
            }
            const folder = this.getWorkspaceFolder(resource, true);
            if (!folder) {
                return path;
            }
            if (typeof includeWorkspace === 'undefined' && this.x) {
                includeWorkspace = this.x.folders.length > 1;
            }
            let result = (0, resources_1.$kg)(folder.uri, resource);
            if (includeWorkspace && folder.name) {
                result = `${folder.name}/${result}`;
            }
            return result;
        }
        y(folders) {
            // Update directly here. The workspace is unconfirmed as long as we did not get an
            // acknowledgement from the main side (via $acceptWorkspaceData)
            if (this.x) {
                this.n = ExtHostWorkspaceImpl.toExtHostWorkspace({
                    id: this.x.id,
                    name: this.x.name,
                    configuration: this.x.configuration,
                    folders,
                    isUntitled: this.x.isUntitled
                }, this.x, undefined, this.s).workspace || undefined;
            }
        }
        $acceptWorkspaceData(data) {
            const { workspace, added, removed } = ExtHostWorkspaceImpl.toExtHostWorkspace(data, this.l, this.n, this.s);
            // Update our workspace object. We have a confirmed workspace, so we drop our
            // unconfirmed workspace.
            this.l = workspace || undefined;
            this.n = undefined;
            // Events
            this.c.fire(Object.freeze({
                added,
                removed,
            }));
        }
        // --- search ---
        /**
         * Note, null/undefined have different and important meanings for "exclude"
         */
        findFiles(include, exclude, maxResults, extensionId, token = cancellation_1.CancellationToken.None) {
            this.h.trace(`extHostWorkspace#findFiles: fileSearch, extension: ${extensionId.value}, entryPoint: findFiles`);
            let excludePatternOrDisregardExcludes = undefined;
            if (exclude === null) {
                excludePatternOrDisregardExcludes = false;
            }
            else if (exclude) {
                if (typeof exclude === 'string') {
                    excludePatternOrDisregardExcludes = exclude;
                }
                else {
                    excludePatternOrDisregardExcludes = exclude.pattern;
                }
            }
            if (token && token.isCancellationRequested) {
                return Promise.resolve([]);
            }
            const { includePattern, folder } = parseSearchInclude(extHostTypeConverters_1.GlobPattern.from(include));
            return this.o.$startFileSearch(includePattern ?? null, folder ?? null, excludePatternOrDisregardExcludes ?? null, maxResults ?? null, token)
                .then(data => Array.isArray(data) ? data.map(d => uri_1.URI.revive(d)) : []);
        }
        async findTextInFiles(query, options, callback, extensionId, token = cancellation_1.CancellationToken.None) {
            this.h.trace(`extHostWorkspace#findTextInFiles: textSearch, extension: ${extensionId.value}, entryPoint: findTextInFiles`);
            const requestId = this.j.getNext();
            const previewOptions = typeof options.previewOptions === 'undefined' ?
                {
                    matchLines: 100,
                    charsPerLine: 10000
                } :
                options.previewOptions;
            const { includePattern, folder } = parseSearchInclude(extHostTypeConverters_1.GlobPattern.from(options.include));
            const excludePattern = (typeof options.exclude === 'string') ? options.exclude :
                options.exclude ? options.exclude.pattern : undefined;
            const queryOptions = {
                ignoreSymlinks: typeof options.followSymlinks === 'boolean' ? !options.followSymlinks : undefined,
                disregardIgnoreFiles: typeof options.useIgnoreFiles === 'boolean' ? !options.useIgnoreFiles : undefined,
                disregardGlobalIgnoreFiles: typeof options.useGlobalIgnoreFiles === 'boolean' ? !options.useGlobalIgnoreFiles : undefined,
                disregardParentIgnoreFiles: typeof options.useParentIgnoreFiles === 'boolean' ? !options.useParentIgnoreFiles : undefined,
                disregardExcludeSettings: typeof options.useDefaultExcludes === 'boolean' ? !options.useDefaultExcludes : true,
                fileEncoding: options.encoding,
                maxResults: options.maxResults,
                previewOptions,
                afterContext: options.afterContext,
                beforeContext: options.beforeContext,
                includePattern: includePattern,
                excludePattern: excludePattern
            };
            const isCanceled = false;
            this.u[requestId] = p => {
                if (isCanceled) {
                    return;
                }
                const uri = uri_1.URI.revive(p.resource);
                p.results.forEach(result => {
                    if ((0, search_1.$pI)(result)) {
                        callback({
                            uri,
                            preview: {
                                text: result.preview.text,
                                matches: (0, arrays_1.$Zb)(result.preview.matches, m => new extHostTypes_1.$5J(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn))
                            },
                            ranges: (0, arrays_1.$Zb)(result.ranges, r => new extHostTypes_1.$5J(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn))
                        });
                    }
                    else {
                        callback({
                            uri,
                            text: result.text,
                            lineNumber: result.lineNumber
                        });
                    }
                });
            };
            if (token.isCancellationRequested) {
                return {};
            }
            try {
                const result = await this.o.$startTextSearch(query, folder ?? null, queryOptions, requestId, token);
                delete this.u[requestId];
                return result || {};
            }
            catch (err) {
                delete this.u[requestId];
                throw err;
            }
        }
        $handleTextSearchResult(result, requestId) {
            this.u[requestId]?.(result);
        }
        async save(uri) {
            const result = await this.o.$save(uri, { saveAs: false });
            return uri_1.URI.revive(result);
        }
        async saveAs(uri) {
            const result = await this.o.$save(uri, { saveAs: true });
            return uri_1.URI.revive(result);
        }
        saveAll(includeUntitled) {
            return this.o.$saveAll(includeUntitled);
        }
        resolveProxy(url) {
            return this.o.$resolveProxy(url);
        }
        // --- trust ---
        get trusted() {
            return this.v;
        }
        requestWorkspaceTrust(options) {
            return this.o.$requestWorkspaceTrust(options);
        }
        $onDidGrantWorkspaceTrust() {
            if (!this.v) {
                this.v = true;
                this.g.fire();
            }
        }
        // called by ext host
        registerEditSessionIdentityProvider(scheme, provider) {
            if (this.w.has(scheme)) {
                throw new Error(`A provider has already been registered for scheme ${scheme}`);
            }
            this.w.set(scheme, provider);
            const outgoingScheme = this.t.transformOutgoingScheme(scheme);
            const handle = this.z++;
            this.o.$registerEditSessionIdentityProvider(handle, outgoingScheme);
            return (0, lifecycle_1.$ic)(() => {
                this.w.delete(scheme);
                this.o.$unregisterEditSessionIdentityProvider(handle);
            });
        }
        // called by main thread
        async $getEditSessionIdentifier(workspaceFolder, cancellationToken) {
            this.h.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (!folder) {
                this.h.warn('Unable to resolve workspace folder');
                return undefined;
            }
            this.h.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
            const provider = this.w.get(folder.uri.scheme);
            this.h.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideEditSessionIdentity(folder, cancellationToken);
            this.h.info('Provider returned edit session identifier: ', result);
            if (!result) {
                return undefined;
            }
            return result;
        }
        async $provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
            this.h.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (!folder) {
                this.h.warn('Unable to resolve workspace folder');
                return undefined;
            }
            this.h.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
            const provider = this.w.get(folder.uri.scheme);
            this.h.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideEditSessionIdentityMatch?.(identity1, identity2, cancellationToken);
            this.h.info('Provider returned edit session identifier match result: ', result);
            if (!result) {
                return undefined;
            }
            return result;
        }
        getOnWillCreateEditSessionIdentityEvent(extension) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return this.A.event(wrappedListener, undefined, disposables);
            };
        }
        // main thread calls this to trigger participants
        async $onWillCreateEditSessionIdentity(workspaceFolder, token, timeout) {
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (folder === undefined) {
                throw new Error('Unable to resolve workspace folder');
            }
            await this.A.fireAsync({ workspaceFolder: folder }, token, async (thenable, listener) => {
                const now = Date.now();
                await Promise.resolve(thenable);
                if (Date.now() - now > timeout) {
                    this.h.warn('SLOW edit session create-participant', listener.extension.identifier);
                }
            });
            if (token.isCancellationRequested) {
                return undefined;
            }
        }
        // called by ext host
        registerCanonicalUriProvider(scheme, provider) {
            if (this.B.has(scheme)) {
                throw new Error(`A provider has already been registered for scheme ${scheme}`);
            }
            this.B.set(scheme, provider);
            const outgoingScheme = this.t.transformOutgoingScheme(scheme);
            const handle = this.z++;
            this.o.$registerCanonicalUriProvider(handle, outgoingScheme);
            return (0, lifecycle_1.$ic)(() => {
                this.B.delete(scheme);
                this.o.$unregisterCanonicalUriProvider(handle);
            });
        }
        async provideCanonicalUri(uri, options, cancellationToken) {
            const provider = this.B.get(uri.scheme);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideCanonicalUri?.(uri_1.URI.revive(uri), options, cancellationToken);
            if (!result) {
                return undefined;
            }
            return result;
        }
        // called by main thread
        async $provideCanonicalUri(uri, targetScheme, cancellationToken) {
            return this.provideCanonicalUri(uri_1.URI.revive(uri), { targetScheme }, cancellationToken);
        }
    };
    exports.$ibc = $ibc;
    exports.$ibc = $ibc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, extHostFileSystemInfo_1.$9ac),
        __param(3, log_1.$5i),
        __param(4, extHostUriTransformerService_1.$gbc)
    ], $ibc);
    exports.$jbc = (0, instantiation_1.$Bh)('IExtHostWorkspace');
    function parseSearchInclude(include) {
        let includePattern;
        let includeFolder;
        if (include) {
            if (typeof include === 'string') {
                includePattern = include;
            }
            else {
                includePattern = include.pattern;
                includeFolder = uri_1.URI.revive(include.baseUri);
            }
        }
        return {
            includePattern,
            folder: includeFolder
        };
    }
});
//# sourceMappingURL=extHostWorkspace.js.map