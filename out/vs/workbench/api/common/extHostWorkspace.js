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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/network", "vs/base/common/numbers", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/workspace/common/workspace", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/services/search/common/search", "./extHost.protocol"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, lifecycle_1, ternarySearchTree_1, network_1, numbers_1, resources_1, strings_1, uri_1, nls_1, instantiation_1, log_1, notification_1, workspace_1, extHostFileSystemInfo_1, extHostInitDataService_1, extHostRpcService_1, extHostTypeConverters_1, extHostTypes_1, extHostUriTransformerService_1, search_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostWorkspace = exports.ExtHostWorkspace = void 0;
    function isFolderEqual(folderA, folderB, extHostFileSystemInfo) {
        return new resources_1.ExtUri(uri => ignorePathCasing(uri, extHostFileSystemInfo)).isEqual(folderA, folderB);
    }
    function compareWorkspaceFolderByUri(a, b, extHostFileSystemInfo) {
        return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? 0 : (0, strings_1.compare)(a.uri.toString(), b.uri.toString());
    }
    function compareWorkspaceFolderByUriAndNameAndIndex(a, b, extHostFileSystemInfo) {
        if (a.index !== b.index) {
            return a.index < b.index ? -1 : 1;
        }
        return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? (0, strings_1.compare)(a.name, b.name) : (0, strings_1.compare)(a.uri.toString(), b.uri.toString());
    }
    function delta(oldFolders, newFolders, compare, extHostFileSystemInfo) {
        const oldSortedFolders = oldFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
        const newSortedFolders = newFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
        return (0, arrays_1.delta)(oldSortedFolders, newSortedFolders, (a, b) => compare(a, b, extHostFileSystemInfo));
    }
    function ignorePathCasing(uri, extHostFileSystemInfo) {
        const capabilities = extHostFileSystemInfo.getCapabilities(uri.scheme);
        return !(capabilities && (capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
    }
    class ExtHostWorkspaceImpl extends workspace_1.Workspace {
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
                    const existingFolder = ExtHostWorkspaceImpl._findFolder(previousUnconfirmedWorkspace || previousConfirmedWorkspace, folderUri, extHostFileSystemInfo);
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
        static _findFolder(workspace, folderUriToFind, extHostFileSystemInfo) {
            for (let i = 0; i < workspace.folders.length; i++) {
                const folder = workspace.workspaceFolders[i];
                if (isFolderEqual(folder.uri, folderUriToFind, extHostFileSystemInfo)) {
                    return folder;
                }
            }
            return undefined;
        }
        constructor(id, _name, folders, transient, configuration, _isUntitled, ignorePathCasing) {
            super(id, folders.map(f => new workspace_1.WorkspaceFolder(f)), transient, configuration, ignorePathCasing);
            this._name = _name;
            this._isUntitled = _isUntitled;
            this._workspaceFolders = [];
            this._structure = ternarySearchTree_1.TernarySearchTree.forUris(ignorePathCasing);
            // setup the workspace folder data structure
            folders.forEach(folder => {
                this._workspaceFolders.push(folder);
                this._structure.set(folder.uri, folder);
            });
        }
        get name() {
            return this._name;
        }
        get isUntitled() {
            return this._isUntitled;
        }
        get workspaceFolders() {
            return this._workspaceFolders.slice(0);
        }
        getWorkspaceFolder(uri, resolveParent) {
            if (resolveParent && this._structure.get(uri)) {
                // `uri` is a workspace folder so we check for its parent
                uri = (0, resources_1.dirname)(uri);
            }
            return this._structure.findSubstr(uri);
        }
        resolveWorkspaceFolder(uri) {
            return this._structure.get(uri);
        }
    }
    let ExtHostWorkspace = class ExtHostWorkspace {
        constructor(extHostRpc, initData, extHostFileSystemInfo, logService, uriTransformerService) {
            this._onDidChangeWorkspace = new event_1.Emitter();
            this.onDidChangeWorkspace = this._onDidChangeWorkspace.event;
            this._onDidGrantWorkspaceTrust = new event_1.Emitter();
            this.onDidGrantWorkspaceTrust = this._onDidGrantWorkspaceTrust.event;
            this._activeSearchCallbacks = [];
            this._trusted = false;
            this._editSessionIdentityProviders = new Map();
            // --- edit sessions ---
            this._providerHandlePool = 0;
            this._onWillCreateEditSessionIdentityEvent = new event_1.AsyncEmitter();
            // --- canonical uri identity ---
            this._canonicalUriProviders = new Map();
            this._logService = logService;
            this._extHostFileSystemInfo = extHostFileSystemInfo;
            this._uriTransformerService = uriTransformerService;
            this._requestIdProvider = new numbers_1.Counter();
            this._barrier = new async_1.Barrier();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadWorkspace);
            this._messageService = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadMessageService);
            const data = initData.workspace;
            this._confirmedWorkspace = data ? new ExtHostWorkspaceImpl(data.id, data.name, [], !!data.transient, data.configuration ? uri_1.URI.revive(data.configuration) : null, !!data.isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo)) : undefined;
        }
        $initializeWorkspace(data, trusted) {
            this._trusted = trusted;
            this.$acceptWorkspaceData(data);
            this._barrier.open();
        }
        waitForInitializeCall() {
            return this._barrier.wait();
        }
        // --- workspace ---
        get workspace() {
            return this._actualWorkspace;
        }
        get name() {
            return this._actualWorkspace ? this._actualWorkspace.name : undefined;
        }
        get workspaceFile() {
            if (this._actualWorkspace) {
                if (this._actualWorkspace.configuration) {
                    if (this._actualWorkspace.isUntitled) {
                        return uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: (0, resources_1.basename)((0, resources_1.dirname)(this._actualWorkspace.configuration)) }); // Untitled Workspace: return untitled URI
                    }
                    return this._actualWorkspace.configuration; // Workspace: return the configuration location
                }
            }
            return undefined;
        }
        get _actualWorkspace() {
            return this._unconfirmedWorkspace || this._confirmedWorkspace;
        }
        getWorkspaceFolders() {
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.workspaceFolders.slice(0);
        }
        async getWorkspaceFolders2() {
            await this._barrier.wait();
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.workspaceFolders.slice(0);
        }
        updateWorkspaceFolders(extension, index, deleteCount, ...workspaceFoldersToAdd) {
            const validatedDistinctWorkspaceFoldersToAdd = [];
            if (Array.isArray(workspaceFoldersToAdd)) {
                workspaceFoldersToAdd.forEach(folderToAdd => {
                    if (uri_1.URI.isUri(folderToAdd.uri) && !validatedDistinctWorkspaceFoldersToAdd.some(f => isFolderEqual(f.uri, folderToAdd.uri, this._extHostFileSystemInfo))) {
                        validatedDistinctWorkspaceFoldersToAdd.push({ uri: folderToAdd.uri, name: folderToAdd.name || (0, resources_1.basenameOrAuthority)(folderToAdd.uri) });
                    }
                });
            }
            if (!!this._unconfirmedWorkspace) {
                return false; // prevent accumulated calls without a confirmed workspace
            }
            if ([index, deleteCount].some(i => typeof i !== 'number' || i < 0)) {
                return false; // validate numbers
            }
            if (deleteCount === 0 && validatedDistinctWorkspaceFoldersToAdd.length === 0) {
                return false; // nothing to delete or add
            }
            const currentWorkspaceFolders = this._actualWorkspace ? this._actualWorkspace.workspaceFolders : [];
            if (index + deleteCount > currentWorkspaceFolders.length) {
                return false; // cannot delete more than we have
            }
            // Simulate the updateWorkspaceFolders method on our data to do more validation
            const newWorkspaceFolders = currentWorkspaceFolders.slice(0);
            newWorkspaceFolders.splice(index, deleteCount, ...validatedDistinctWorkspaceFoldersToAdd.map(f => ({ uri: f.uri, name: f.name || (0, resources_1.basenameOrAuthority)(f.uri), index: undefined /* fixed later */ })));
            for (let i = 0; i < newWorkspaceFolders.length; i++) {
                const folder = newWorkspaceFolders[i];
                if (newWorkspaceFolders.some((otherFolder, index) => index !== i && isFolderEqual(folder.uri, otherFolder.uri, this._extHostFileSystemInfo))) {
                    return false; // cannot add the same folder multiple times
                }
            }
            newWorkspaceFolders.forEach((f, index) => f.index = index); // fix index
            const { added, removed } = delta(currentWorkspaceFolders, newWorkspaceFolders, compareWorkspaceFolderByUriAndNameAndIndex, this._extHostFileSystemInfo);
            if (added.length === 0 && removed.length === 0) {
                return false; // nothing actually changed
            }
            // Trigger on main side
            if (this._proxy) {
                const extName = extension.displayName || extension.name;
                this._proxy.$updateWorkspaceFolders(extName, index, deleteCount, validatedDistinctWorkspaceFoldersToAdd).then(undefined, error => {
                    // in case of an error, make sure to clear out the unconfirmed workspace
                    // because we cannot expect the acknowledgement from the main side for this
                    this._unconfirmedWorkspace = undefined;
                    // show error to user
                    const options = { source: { identifier: extension.identifier, label: extension.displayName || extension.name } };
                    this._messageService.$showMessage(notification_1.Severity.Error, (0, nls_1.localize)('updateerror', "Extension '{0}' failed to update workspace folders: {1}", extName, error.toString()), options, []);
                });
            }
            // Try to accept directly
            this.trySetWorkspaceFolders(newWorkspaceFolders);
            return true;
        }
        getWorkspaceFolder(uri, resolveParent) {
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
        }
        async getWorkspaceFolder2(uri, resolveParent) {
            await this._barrier.wait();
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
        }
        async resolveWorkspaceFolder(uri) {
            await this._barrier.wait();
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.resolveWorkspaceFolder(uri);
        }
        getPath() {
            // this is legacy from the days before having
            // multi-root and we keep it only alive if there
            // is just one workspace folder.
            if (!this._actualWorkspace) {
                return undefined;
            }
            const { folders } = this._actualWorkspace;
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
            if (typeof includeWorkspace === 'undefined' && this._actualWorkspace) {
                includeWorkspace = this._actualWorkspace.folders.length > 1;
            }
            let result = (0, resources_1.relativePath)(folder.uri, resource);
            if (includeWorkspace && folder.name) {
                result = `${folder.name}/${result}`;
            }
            return result;
        }
        trySetWorkspaceFolders(folders) {
            // Update directly here. The workspace is unconfirmed as long as we did not get an
            // acknowledgement from the main side (via $acceptWorkspaceData)
            if (this._actualWorkspace) {
                this._unconfirmedWorkspace = ExtHostWorkspaceImpl.toExtHostWorkspace({
                    id: this._actualWorkspace.id,
                    name: this._actualWorkspace.name,
                    configuration: this._actualWorkspace.configuration,
                    folders,
                    isUntitled: this._actualWorkspace.isUntitled
                }, this._actualWorkspace, undefined, this._extHostFileSystemInfo).workspace || undefined;
            }
        }
        $acceptWorkspaceData(data) {
            const { workspace, added, removed } = ExtHostWorkspaceImpl.toExtHostWorkspace(data, this._confirmedWorkspace, this._unconfirmedWorkspace, this._extHostFileSystemInfo);
            // Update our workspace object. We have a confirmed workspace, so we drop our
            // unconfirmed workspace.
            this._confirmedWorkspace = workspace || undefined;
            this._unconfirmedWorkspace = undefined;
            // Events
            this._onDidChangeWorkspace.fire(Object.freeze({
                added,
                removed,
            }));
        }
        // --- search ---
        /**
         * Note, null/undefined have different and important meanings for "exclude"
         */
        findFiles(include, exclude, maxResults, extensionId, token = cancellation_1.CancellationToken.None) {
            this._logService.trace(`extHostWorkspace#findFiles: fileSearch, extension: ${extensionId.value}, entryPoint: findFiles`);
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
            return this._proxy.$startFileSearch(includePattern ?? null, folder ?? null, excludePatternOrDisregardExcludes ?? null, maxResults ?? null, token)
                .then(data => Array.isArray(data) ? data.map(d => uri_1.URI.revive(d)) : []);
        }
        async findTextInFiles(query, options, callback, extensionId, token = cancellation_1.CancellationToken.None) {
            this._logService.trace(`extHostWorkspace#findTextInFiles: textSearch, extension: ${extensionId.value}, entryPoint: findTextInFiles`);
            const requestId = this._requestIdProvider.getNext();
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
            this._activeSearchCallbacks[requestId] = p => {
                if (isCanceled) {
                    return;
                }
                const uri = uri_1.URI.revive(p.resource);
                p.results.forEach(result => {
                    if ((0, search_1.resultIsMatch)(result)) {
                        callback({
                            uri,
                            preview: {
                                text: result.preview.text,
                                matches: (0, arrays_1.mapArrayOrNot)(result.preview.matches, m => new extHostTypes_1.Range(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn))
                            },
                            ranges: (0, arrays_1.mapArrayOrNot)(result.ranges, r => new extHostTypes_1.Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn))
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
                const result = await this._proxy.$startTextSearch(query, folder ?? null, queryOptions, requestId, token);
                delete this._activeSearchCallbacks[requestId];
                return result || {};
            }
            catch (err) {
                delete this._activeSearchCallbacks[requestId];
                throw err;
            }
        }
        $handleTextSearchResult(result, requestId) {
            this._activeSearchCallbacks[requestId]?.(result);
        }
        async save(uri) {
            const result = await this._proxy.$save(uri, { saveAs: false });
            return uri_1.URI.revive(result);
        }
        async saveAs(uri) {
            const result = await this._proxy.$save(uri, { saveAs: true });
            return uri_1.URI.revive(result);
        }
        saveAll(includeUntitled) {
            return this._proxy.$saveAll(includeUntitled);
        }
        resolveProxy(url) {
            return this._proxy.$resolveProxy(url);
        }
        // --- trust ---
        get trusted() {
            return this._trusted;
        }
        requestWorkspaceTrust(options) {
            return this._proxy.$requestWorkspaceTrust(options);
        }
        $onDidGrantWorkspaceTrust() {
            if (!this._trusted) {
                this._trusted = true;
                this._onDidGrantWorkspaceTrust.fire();
            }
        }
        // called by ext host
        registerEditSessionIdentityProvider(scheme, provider) {
            if (this._editSessionIdentityProviders.has(scheme)) {
                throw new Error(`A provider has already been registered for scheme ${scheme}`);
            }
            this._editSessionIdentityProviders.set(scheme, provider);
            const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
            const handle = this._providerHandlePool++;
            this._proxy.$registerEditSessionIdentityProvider(handle, outgoingScheme);
            return (0, lifecycle_1.toDisposable)(() => {
                this._editSessionIdentityProviders.delete(scheme);
                this._proxy.$unregisterEditSessionIdentityProvider(handle);
            });
        }
        // called by main thread
        async $getEditSessionIdentifier(workspaceFolder, cancellationToken) {
            this._logService.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (!folder) {
                this._logService.warn('Unable to resolve workspace folder');
                return undefined;
            }
            this._logService.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
            const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
            this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideEditSessionIdentity(folder, cancellationToken);
            this._logService.info('Provider returned edit session identifier: ', result);
            if (!result) {
                return undefined;
            }
            return result;
        }
        async $provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
            this._logService.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (!folder) {
                this._logService.warn('Unable to resolve workspace folder');
                return undefined;
            }
            this._logService.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
            const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
            this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideEditSessionIdentityMatch?.(identity1, identity2, cancellationToken);
            this._logService.info('Provider returned edit session identifier match result: ', result);
            if (!result) {
                return undefined;
            }
            return result;
        }
        getOnWillCreateEditSessionIdentityEvent(extension) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return this._onWillCreateEditSessionIdentityEvent.event(wrappedListener, undefined, disposables);
            };
        }
        // main thread calls this to trigger participants
        async $onWillCreateEditSessionIdentity(workspaceFolder, token, timeout) {
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (folder === undefined) {
                throw new Error('Unable to resolve workspace folder');
            }
            await this._onWillCreateEditSessionIdentityEvent.fireAsync({ workspaceFolder: folder }, token, async (thenable, listener) => {
                const now = Date.now();
                await Promise.resolve(thenable);
                if (Date.now() - now > timeout) {
                    this._logService.warn('SLOW edit session create-participant', listener.extension.identifier);
                }
            });
            if (token.isCancellationRequested) {
                return undefined;
            }
        }
        // called by ext host
        registerCanonicalUriProvider(scheme, provider) {
            if (this._canonicalUriProviders.has(scheme)) {
                throw new Error(`A provider has already been registered for scheme ${scheme}`);
            }
            this._canonicalUriProviders.set(scheme, provider);
            const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
            const handle = this._providerHandlePool++;
            this._proxy.$registerCanonicalUriProvider(handle, outgoingScheme);
            return (0, lifecycle_1.toDisposable)(() => {
                this._canonicalUriProviders.delete(scheme);
                this._proxy.$unregisterCanonicalUriProvider(handle);
            });
        }
        async provideCanonicalUri(uri, options, cancellationToken) {
            const provider = this._canonicalUriProviders.get(uri.scheme);
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
    exports.ExtHostWorkspace = ExtHostWorkspace;
    exports.ExtHostWorkspace = ExtHostWorkspace = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostFileSystemInfo_1.IExtHostFileSystemInfo),
        __param(3, log_1.ILogService),
        __param(4, extHostUriTransformerService_1.IURITransformerService)
    ], ExtHostWorkspace);
    exports.IExtHostWorkspace = (0, instantiation_1.createDecorator)('IExtHostWorkspace');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RXb3Jrc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUNoRyxTQUFTLGFBQWEsQ0FBQyxPQUFZLEVBQUUsT0FBWSxFQUFFLHFCQUE2QztRQUMvRixPQUFPLElBQUksa0JBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRUQsU0FBUywyQkFBMkIsQ0FBQyxDQUF5QixFQUFFLENBQXlCLEVBQUUscUJBQTZDO1FBQ3ZJLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsaUJBQU8sRUFBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RyxDQUFDO0lBRUQsU0FBUywwQ0FBMEMsQ0FBQyxDQUF5QixFQUFFLENBQXlCLEVBQUUscUJBQTZDO1FBQ3RKLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FB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