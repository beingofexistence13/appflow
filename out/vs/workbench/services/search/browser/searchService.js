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
define(["require", "exports", "vs/editor/common/services/model", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/worker/simpleWorker", "vs/base/common/lifecycle", "vs/base/browser/defaultWorkerFactory", "vs/platform/instantiation/common/extensions", "vs/base/common/decorators", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/event", "vs/nls", "vs/platform/files/browser/webFileSystemAccess"], function (require, exports, model_1, files_1, instantiation_1, log_1, telemetry_1, editorService_1, extensions_1, search_1, searchService_1, uriIdentity_1, simpleWorker_1, lifecycle_1, defaultWorkerFactory_1, extensions_2, decorators_1, network_1, uri_1, event_1, nls_1, webFileSystemAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalFileSearchWorkerClient = exports.RemoteSearchService = void 0;
    let RemoteSearchService = class RemoteSearchService extends searchService_1.SearchService {
        constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, instantiationService, uriIdentityService) {
            super(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService);
            this.instantiationService = instantiationService;
            const searchProvider = this.instantiationService.createInstance(LocalFileSearchWorkerClient);
            this.registerSearchResultProvider(network_1.Schemas.file, 0 /* SearchProviderType.file */, searchProvider);
            this.registerSearchResultProvider(network_1.Schemas.file, 1 /* SearchProviderType.text */, searchProvider);
        }
    };
    exports.RemoteSearchService = RemoteSearchService;
    exports.RemoteSearchService = RemoteSearchService = __decorate([
        __param(0, model_1.IModelService),
        __param(1, editorService_1.IEditorService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, log_1.ILogService),
        __param(4, extensions_1.IExtensionService),
        __param(5, files_1.IFileService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, uriIdentity_1.IUriIdentityService)
    ], RemoteSearchService);
    let LocalFileSearchWorkerClient = class LocalFileSearchWorkerClient extends lifecycle_1.Disposable {
        constructor(fileService, uriIdentityService) {
            super();
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this._onDidReceiveTextSearchMatch = new event_1.Emitter();
            this.onDidReceiveTextSearchMatch = this._onDidReceiveTextSearchMatch.event;
            this.queryId = 0;
            this._worker = null;
            this._workerFactory = new defaultWorkerFactory_1.DefaultWorkerFactory('localFileSearchWorker');
        }
        sendTextSearchMatch(match, queryId) {
            this._onDidReceiveTextSearchMatch.fire({ match, queryId });
        }
        get fileSystemProvider() {
            return this.fileService.getProvider(network_1.Schemas.file);
        }
        async cancelQuery(queryId) {
            const proxy = await this._getOrCreateWorker().getProxyObject();
            proxy.cancelQuery(queryId);
        }
        async textSearch(query, onProgress, token) {
            try {
                const queryDisposables = new lifecycle_1.DisposableStore();
                const proxy = await this._getOrCreateWorker().getProxyObject();
                const results = [];
                let limitHit = false;
                await Promise.all(query.folderQueries.map(async (fq) => {
                    const queryId = this.queryId++;
                    queryDisposables.add(token?.onCancellationRequested(e => this.cancelQuery(queryId)) || lifecycle_1.Disposable.None);
                    const handle = await this.fileSystemProvider.getHandle(fq.folder);
                    if (!handle || !webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                        console.error('Could not get directory handle for ', fq);
                        return;
                    }
                    const reviveMatch = (result) => ({
                        resource: uri_1.URI.revive(result.resource),
                        results: result.results
                    });
                    queryDisposables.add(this.onDidReceiveTextSearchMatch(e => {
                        if (e.queryId === queryId) {
                            onProgress?.(reviveMatch(e.match));
                        }
                    }));
                    const ignorePathCasing = this.uriIdentityService.extUri.ignorePathCasing(fq.folder);
                    const folderResults = await proxy.searchDirectory(handle, query, fq, ignorePathCasing, queryId);
                    for (const folderResult of folderResults.results) {
                        results.push(reviveMatch(folderResult));
                    }
                    if (folderResults.limitHit) {
                        limitHit = true;
                    }
                }));
                queryDisposables.dispose();
                const result = { messages: [], results, limitHit };
                return result;
            }
            catch (e) {
                console.error('Error performing web worker text search', e);
                return {
                    results: [],
                    messages: [{
                            text: (0, nls_1.localize)('errorSearchText', "Unable to search with Web Worker text searcher"), type: search_1.TextSearchCompleteMessageType.Warning
                        }],
                };
            }
        }
        async fileSearch(query, token) {
            try {
                const queryDisposables = new lifecycle_1.DisposableStore();
                let limitHit = false;
                const proxy = await this._getOrCreateWorker().getProxyObject();
                const results = [];
                await Promise.all(query.folderQueries.map(async (fq) => {
                    const queryId = this.queryId++;
                    queryDisposables.add(token?.onCancellationRequested(e => this.cancelQuery(queryId)) || lifecycle_1.Disposable.None);
                    const handle = await this.fileSystemProvider.getHandle(fq.folder);
                    if (!handle || !webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                        console.error('Could not get directory handle for ', fq);
                        return;
                    }
                    const caseSensitive = this.uriIdentityService.extUri.ignorePathCasing(fq.folder);
                    const folderResults = await proxy.listDirectory(handle, query, fq, caseSensitive, queryId);
                    for (const folderResult of folderResults.results) {
                        results.push({ resource: uri_1.URI.joinPath(fq.folder, folderResult) });
                    }
                    if (folderResults.limitHit) {
                        limitHit = true;
                    }
                }));
                queryDisposables.dispose();
                const result = { messages: [], results, limitHit };
                return result;
            }
            catch (e) {
                console.error('Error performing web worker file search', e);
                return {
                    results: [],
                    messages: [{
                            text: (0, nls_1.localize)('errorSearchFile', "Unable to search with Web Worker file searcher"), type: search_1.TextSearchCompleteMessageType.Warning
                        }],
                };
            }
        }
        async clearCache(cacheKey) {
            if (this.cache?.key === cacheKey) {
                this.cache = undefined;
            }
        }
        _getOrCreateWorker() {
            if (!this._worker) {
                try {
                    this._worker = this._register(new simpleWorker_1.SimpleWorkerClient(this._workerFactory, 'vs/workbench/services/search/worker/localFileSearch', this));
                }
                catch (err) {
                    (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                    throw err;
                }
            }
            return this._worker;
        }
    };
    exports.LocalFileSearchWorkerClient = LocalFileSearchWorkerClient;
    __decorate([
        decorators_1.memoize
    ], LocalFileSearchWorkerClient.prototype, "fileSystemProvider", null);
    exports.LocalFileSearchWorkerClient = LocalFileSearchWorkerClient = __decorate([
        __param(0, files_1.IFileService),
        __param(1, uriIdentity_1.IUriIdentityService)
    ], LocalFileSearchWorkerClient);
    (0, extensions_2.registerSingleton)(search_1.ISearchService, RemoteSearchService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvYnJvd3Nlci9zZWFyY2hTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSw2QkFBYTtRQUNyRCxZQUNnQixZQUEyQixFQUMxQixhQUE2QixFQUMxQixnQkFBbUMsRUFDekMsVUFBdUIsRUFDakIsZ0JBQW1DLEVBQ3hDLFdBQXlCLEVBQ0Msb0JBQTJDLEVBQzlELGtCQUF1QztZQUU1RCxLQUFLLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFINUUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUluRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDN0YsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGlCQUFPLENBQUMsSUFBSSxtQ0FBMkIsY0FBYyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGlCQUFPLENBQUMsSUFBSSxtQ0FBMkIsY0FBYyxDQUFDLENBQUM7UUFDMUYsQ0FBQztLQUNELENBQUE7SUFoQlksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUFFN0IsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLDhCQUFpQixDQUFBO1FBQ2pCLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxp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