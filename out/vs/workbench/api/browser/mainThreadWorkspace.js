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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/request/common/request", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/workspaces/common/workspaceEditing", "../common/extHost.protocol", "vs/platform/workspace/common/editSessions", "vs/workbench/common/editor", "vs/base/common/arrays", "vs/platform/workspace/common/canonicalUri"], function (require, exports, errors_1, lifecycle_1, platform_1, uri_1, nls_1, environment_1, files_1, instantiation_1, label_1, notification_1, request_1, workspaceTrust_1, workspace_1, extHostCustomers_1, workspaceContains_1, queryBuilder_1, editorService_1, search_1, workspaceEditing_1, extHost_protocol_1, editSessions_1, editor_1, arrays_1, canonicalUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadWorkspace = void 0;
    let MainThreadWorkspace = class MainThreadWorkspace {
        constructor(extHostContext, _searchService, _contextService, _editSessionIdentityService, _canonicalUriService, _editorService, _workspaceEditingService, _notificationService, _requestService, _instantiationService, _labelService, _environmentService, fileService, _workspaceTrustManagementService, _workspaceTrustRequestService) {
            this._searchService = _searchService;
            this._contextService = _contextService;
            this._editSessionIdentityService = _editSessionIdentityService;
            this._canonicalUriService = _canonicalUriService;
            this._editorService = _editorService;
            this._workspaceEditingService = _workspaceEditingService;
            this._notificationService = _notificationService;
            this._requestService = _requestService;
            this._instantiationService = _instantiationService;
            this._labelService = _labelService;
            this._environmentService = _environmentService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._activeCancelTokens = Object.create(null);
            this._queryBuilder = this._instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            // --- edit sessions ---
            this.registeredEditSessionProviders = new Map();
            // --- canonical uri identities ---
            this.registeredCanonicalUriProviders = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWorkspace);
            const workspace = this._contextService.getWorkspace();
            // The workspace file is provided be a unknown file system provider. It might come
            // from the extension host. So initialize now knowing that `rootPath` is undefined.
            if (workspace.configuration && !platform_1.isNative && !fileService.hasProvider(workspace.configuration)) {
                this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted());
            }
            else {
                this._contextService.getCompleteWorkspace().then(workspace => this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted()));
            }
            this._contextService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspace, this, this._toDispose);
            this._contextService.onDidChangeWorkbenchState(this._onDidChangeWorkspace, this, this._toDispose);
            this._workspaceTrustManagementService.onDidChangeTrust(this._onDidGrantWorkspaceTrust, this, this._toDispose);
        }
        dispose() {
            this._toDispose.dispose();
            for (const requestId in this._activeCancelTokens) {
                const tokenSource = this._activeCancelTokens[requestId];
                tokenSource.cancel();
            }
        }
        // --- workspace ---
        $updateWorkspaceFolders(extensionName, index, deleteCount, foldersToAdd) {
            const workspaceFoldersToAdd = foldersToAdd.map(f => ({ uri: uri_1.URI.revive(f.uri), name: f.name }));
            // Indicate in status message
            this._notificationService.status(this.getStatusMessage(extensionName, workspaceFoldersToAdd.length, deleteCount), { hideAfter: 10 * 1000 /* 10s */ });
            return this._workspaceEditingService.updateFolders(index, deleteCount, workspaceFoldersToAdd, true);
        }
        getStatusMessage(extensionName, addCount, removeCount) {
            let message;
            const wantsToAdd = addCount > 0;
            const wantsToDelete = removeCount > 0;
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                if (addCount === 1) {
                    message = (0, nls_1.localize)('folderStatusMessageAddSingleFolder', "Extension '{0}' added 1 folder to the workspace", extensionName);
                }
                else {
                    message = (0, nls_1.localize)('folderStatusMessageAddMultipleFolders', "Extension '{0}' added {1} folders to the workspace", extensionName, addCount);
                }
            }
            // Delete Folders
            else if (wantsToDelete && !wantsToAdd) {
                if (removeCount === 1) {
                    message = (0, nls_1.localize)('folderStatusMessageRemoveSingleFolder', "Extension '{0}' removed 1 folder from the workspace", extensionName);
                }
                else {
                    message = (0, nls_1.localize)('folderStatusMessageRemoveMultipleFolders', "Extension '{0}' removed {1} folders from the workspace", extensionName, removeCount);
                }
            }
            // Change Folders
            else {
                message = (0, nls_1.localize)('folderStatusChangeFolder', "Extension '{0}' changed folders of the workspace", extensionName);
            }
            return message;
        }
        _onDidChangeWorkspace() {
            this._proxy.$acceptWorkspaceData(this.getWorkspaceData(this._contextService.getWorkspace()));
        }
        getWorkspaceData(workspace) {
            if (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return null;
            }
            return {
                configuration: workspace.configuration || undefined,
                isUntitled: workspace.configuration ? (0, workspace_1.isUntitledWorkspace)(workspace.configuration, this._environmentService) : false,
                folders: workspace.folders,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            };
        }
        // --- search ---
        $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
            const includeFolder = uri_1.URI.revive(_includeFolder);
            const workspace = this._contextService.getWorkspace();
            const query = this._queryBuilder.file(includeFolder ? [includeFolder] : workspace.folders, {
                maxResults: maxResults ?? undefined,
                disregardExcludeSettings: (excludePatternOrDisregardExcludes === false) || undefined,
                disregardSearchExcludeSettings: true,
                disregardIgnoreFiles: true,
                includePattern: includePattern ?? undefined,
                excludePattern: typeof excludePatternOrDisregardExcludes === 'string' ? excludePatternOrDisregardExcludes : undefined,
                _reason: 'startFileSearch'
            });
            return this._searchService.fileSearch(query, token).then(result => {
                return result.results.map(m => m.resource);
            }, err => {
                if (!(0, errors_1.isCancellationError)(err)) {
                    return Promise.reject(err);
                }
                return null;
            });
        }
        $startTextSearch(pattern, _folder, options, requestId, token) {
            const folder = uri_1.URI.revive(_folder);
            const workspace = this._contextService.getWorkspace();
            const folders = folder ? [folder] : workspace.folders.map(folder => folder.uri);
            const query = this._queryBuilder.text(pattern, folders, options);
            query._reason = 'startTextSearch';
            const onProgress = (p) => {
                if (p.results) {
                    this._proxy.$handleTextSearchResult(p, requestId);
                }
            };
            const search = this._searchService.textSearch(query, token, onProgress).then(result => {
                return { limitHit: result.limitHit };
            }, err => {
                if (!(0, errors_1.isCancellationError)(err)) {
                    return Promise.reject(err);
                }
                return null;
            });
            return search;
        }
        $checkExists(folders, includes, token) {
            return this._instantiationService.invokeFunction((accessor) => (0, workspaceContains_1.checkGlobFileExists)(accessor, folders, includes, token));
        }
        // --- save & edit resources ---
        async $save(uriComponents, options) {
            const uri = uri_1.URI.revive(uriComponents);
            const editors = [...this._editorService.findEditors(uri, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })];
            const result = await this._editorService.save(editors, {
                reason: 1 /* SaveReason.EXPLICIT */,
                saveAs: options.saveAs,
                force: !options.saveAs
            });
            return (0, arrays_1.firstOrDefault)(this._saveResultToUris(result));
        }
        _saveResultToUris(result) {
            if (!result.success) {
                return [];
            }
            return (0, arrays_1.coalesce)(result.editors.map(editor => editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })));
        }
        $saveAll(includeUntitled) {
            return this._editorService.saveAll({ includeUntitled }).then(res => res.success);
        }
        $resolveProxy(url) {
            return this._requestService.resolveProxy(url);
        }
        // --- trust ---
        $requestWorkspaceTrust(options) {
            return this._workspaceTrustRequestService.requestWorkspaceTrust(options);
        }
        isWorkspaceTrusted() {
            return this._workspaceTrustManagementService.isWorkspaceTrusted();
        }
        _onDidGrantWorkspaceTrust() {
            this._proxy.$onDidGrantWorkspaceTrust();
        }
        $registerEditSessionIdentityProvider(handle, scheme) {
            const disposable = this._editSessionIdentityService.registerEditSessionIdentityProvider({
                scheme: scheme,
                getEditSessionIdentifier: async (workspaceFolder, token) => {
                    return this._proxy.$getEditSessionIdentifier(workspaceFolder.uri, token);
                },
                provideEditSessionIdentityMatch: async (workspaceFolder, identity1, identity2, token) => {
                    return this._proxy.$provideEditSessionIdentityMatch(workspaceFolder.uri, identity1, identity2, token);
                }
            });
            this.registeredEditSessionProviders.set(handle, disposable);
            this._toDispose.add(disposable);
        }
        $unregisterEditSessionIdentityProvider(handle) {
            const disposable = this.registeredEditSessionProviders.get(handle);
            disposable?.dispose();
            this.registeredEditSessionProviders.delete(handle);
        }
        $registerCanonicalUriProvider(handle, scheme) {
            const disposable = this._canonicalUriService.registerCanonicalUriProvider({
                scheme: scheme,
                provideCanonicalUri: async (uri, targetScheme, token) => {
                    const result = await this._proxy.$provideCanonicalUri(uri, targetScheme, token);
                    if (result) {
                        return uri_1.URI.revive(result);
                    }
                    return result;
                }
            });
            this.registeredCanonicalUriProviders.set(handle, disposable);
            this._toDispose.add(disposable);
        }
        $unregisterCanonicalUriProvider(handle) {
            const disposable = this.registeredCanonicalUriProviders.get(handle);
            disposable?.dispose();
            this.registeredCanonicalUriProviders.delete(handle);
        }
    };
    exports.MainThreadWorkspace = MainThreadWorkspace;
    exports.MainThreadWorkspace = MainThreadWorkspace = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadWorkspace),
        __param(1, search_1.ISearchService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, editSessions_1.IEditSessionIdentityService),
        __param(4, canonicalUri_1.ICanonicalUriService),
        __param(5, editorService_1.IEditorService),
        __param(6, workspaceEditing_1.IWorkspaceEditingService),
        __param(7, notification_1.INotificationService),
        __param(8, request_1.IRequestService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, label_1.ILabelService),
        __param(11, environment_1.IEnvironmentService),
        __param(12, files_1.IFileService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], MainThreadWorkspace);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkV29ya3NwYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBbUI7UUFPL0IsWUFDQyxjQUErQixFQUNmLGNBQStDLEVBQ3JDLGVBQTBELEVBQ3ZELDJCQUF5RSxFQUNoRixvQkFBMkQsRUFDakUsY0FBK0MsRUFDckMsd0JBQW1FLEVBQ3ZFLG9CQUEyRCxFQUNoRSxlQUFpRCxFQUMzQyxxQkFBNkQsRUFDckUsYUFBNkMsRUFDdkMsbUJBQXlELEVBQ2hFLFdBQXlCLEVBQ0wsZ0NBQW1GLEVBQ3RGLDZCQUE2RTtZQWIzRSxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDcEIsb0JBQWUsR0FBZixlQUFlLENBQTBCO1lBQ3RDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7WUFDL0QseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNoRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDcEIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUN0RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQy9DLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUMxQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ3RCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFFM0IscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFrQztZQUNyRSxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1lBcEI1RixlQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDbkMsd0JBQW1CLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENB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