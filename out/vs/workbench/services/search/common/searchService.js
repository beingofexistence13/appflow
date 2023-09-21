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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/stopwatch", "vs/base/common/types", "vs/editor/common/services/model", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchHelpers"], function (require, exports, arrays, async_1, errors_1, lifecycle_1, map_1, network_1, stopwatch_1, types_1, model_1, files_1, log_1, telemetry_1, uriIdentity_1, editor_1, editorService_1, extensions_1, search_1, searchHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchService = void 0;
    let SearchService = class SearchService extends lifecycle_1.Disposable {
        constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService) {
            super();
            this.modelService = modelService;
            this.editorService = editorService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.extensionService = extensionService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.fileSearchProviders = new Map();
            this.textSearchProviders = new Map();
            this.deferredFileSearchesByScheme = new Map();
            this.deferredTextSearchesByScheme = new Map();
            this.loggedSchemesMissingProviders = new Set();
        }
        registerSearchResultProvider(scheme, type, provider) {
            let list;
            let deferredMap;
            if (type === 0 /* SearchProviderType.file */) {
                list = this.fileSearchProviders;
                deferredMap = this.deferredFileSearchesByScheme;
            }
            else if (type === 1 /* SearchProviderType.text */) {
                list = this.textSearchProviders;
                deferredMap = this.deferredTextSearchesByScheme;
            }
            else {
                throw new Error('Unknown SearchProviderType');
            }
            list.set(scheme, provider);
            if (deferredMap.has(scheme)) {
                deferredMap.get(scheme).complete(provider);
                deferredMap.delete(scheme);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                list.delete(scheme);
            });
        }
        async textSearch(query, token, onProgress) {
            const results = this.textSearchSplitSyncAsync(query, token, onProgress);
            const openEditorResults = results.syncResults;
            const otherResults = await results.asyncResults;
            return {
                limitHit: otherResults.limitHit || openEditorResults.limitHit,
                results: [...otherResults.results, ...openEditorResults.results],
                messages: [...otherResults.messages, ...openEditorResults.messages]
            };
        }
        textSearchSplitSyncAsync(query, token, onProgress, notebookFilesToIgnore, asyncNotebookFilesToIgnore) {
            // Get open editor results from dirty/untitled
            const openEditorResults = this.getOpenEditorResults(query);
            if (onProgress) {
                arrays.coalesce([...openEditorResults.results.values()]).filter(e => !(notebookFilesToIgnore && notebookFilesToIgnore.has(e.resource))).forEach(onProgress);
            }
            const syncResults = {
                results: arrays.coalesce([...openEditorResults.results.values()]),
                limitHit: openEditorResults.limitHit ?? false,
                messages: []
            };
            const getAsyncResults = async () => {
                const resolvedAsyncNotebookFilesToIgnore = await asyncNotebookFilesToIgnore ?? new map_1.ResourceSet();
                const onProviderProgress = (progress) => {
                    if ((0, search_1.isFileMatch)(progress)) {
                        // Match
                        if (!openEditorResults.results.has(progress.resource) && !resolvedAsyncNotebookFilesToIgnore.has(progress.resource) && onProgress) { // don't override open editor results
                            onProgress(progress);
                        }
                    }
                    else if (onProgress) {
                        // Progress
                        onProgress(progress);
                    }
                    if ((0, search_1.isProgressMessage)(progress)) {
                        this.logService.debug('SearchService#search', progress.message);
                    }
                };
                return await this.doSearch(query, token, onProviderProgress);
            };
            return {
                syncResults,
                asyncResults: getAsyncResults()
            };
        }
        fileSearch(query, token) {
            return this.doSearch(query, token);
        }
        doSearch(query, token, onProgress) {
            this.logService.trace('SearchService#search', JSON.stringify(query));
            const schemesInQuery = this.getSchemesInQuery(query);
            const providerActivations = [Promise.resolve(null)];
            schemesInQuery.forEach(scheme => providerActivations.push(this.extensionService.activateByEvent(`onSearch:${scheme}`)));
            providerActivations.push(this.extensionService.activateByEvent('onSearch:file'));
            const providerPromise = (async () => {
                await Promise.all(providerActivations);
                await this.extensionService.whenInstalledExtensionsRegistered();
                // Cancel faster if search was canceled while waiting for extensions
                if (token && token.isCancellationRequested) {
                    return Promise.reject(new errors_1.CancellationError());
                }
                const progressCallback = (item) => {
                    if (token && token.isCancellationRequested) {
                        return;
                    }
                    onProgress?.(item);
                };
                const exists = await Promise.all(query.folderQueries.map(query => this.fileService.exists(query.folder)));
                query.folderQueries = query.folderQueries.filter((_, i) => exists[i]);
                let completes = await this.searchWithProviders(query, progressCallback, token);
                completes = arrays.coalesce(completes);
                if (!completes.length) {
                    return {
                        limitHit: false,
                        results: [],
                        messages: [],
                    };
                }
                return {
                    limitHit: completes[0] && completes[0].limitHit,
                    stats: completes[0].stats,
                    messages: arrays.coalesce(arrays.flatten(completes.map(i => i.messages))).filter(arrays.uniqueFilter(message => message.type + message.text + message.trusted)),
                    results: arrays.flatten(completes.map((c) => c.results))
                };
            })();
            return new Promise((resolve, reject) => {
                if (token) {
                    token.onCancellationRequested(() => {
                        reject(new errors_1.CancellationError());
                    });
                }
                providerPromise.then(resolve, reject);
            });
        }
        getSchemesInQuery(query) {
            const schemes = new Set();
            query.folderQueries?.forEach(fq => schemes.add(fq.folder.scheme));
            query.extraFileResources?.forEach(extraFile => schemes.add(extraFile.scheme));
            return schemes;
        }
        async waitForProvider(queryType, scheme) {
            const deferredMap = queryType === 1 /* QueryType.File */ ?
                this.deferredFileSearchesByScheme :
                this.deferredTextSearchesByScheme;
            if (deferredMap.has(scheme)) {
                return deferredMap.get(scheme).p;
            }
            else {
                const deferred = new async_1.DeferredPromise();
                deferredMap.set(scheme, deferred);
                return deferred.p;
            }
        }
        async searchWithProviders(query, onProviderProgress, token) {
            const e2eSW = stopwatch_1.StopWatch.create(false);
            const searchPs = [];
            const fqs = this.groupFolderQueriesByScheme(query);
            const someSchemeHasProvider = [...fqs.keys()].some(scheme => {
                return query.type === 1 /* QueryType.File */ ?
                    this.fileSearchProviders.has(scheme) :
                    this.textSearchProviders.has(scheme);
            });
            await Promise.all([...fqs.keys()].map(async (scheme) => {
                const schemeFQs = fqs.get(scheme);
                let provider = query.type === 1 /* QueryType.File */ ?
                    this.fileSearchProviders.get(scheme) :
                    this.textSearchProviders.get(scheme);
                if (!provider) {
                    if (someSchemeHasProvider) {
                        if (!this.loggedSchemesMissingProviders.has(scheme)) {
                            this.logService.warn(`No search provider registered for scheme: ${scheme}. Another scheme has a provider, not waiting for ${scheme}`);
                            this.loggedSchemesMissingProviders.add(scheme);
                        }
                        return;
                    }
                    else {
                        if (!this.loggedSchemesMissingProviders.has(scheme)) {
                            this.logService.warn(`No search provider registered for scheme: ${scheme}, waiting`);
                            this.loggedSchemesMissingProviders.add(scheme);
                        }
                        provider = await this.waitForProvider(query.type, scheme);
                    }
                }
                const oneSchemeQuery = {
                    ...query,
                    ...{
                        folderQueries: schemeFQs
                    }
                };
                searchPs.push(query.type === 1 /* QueryType.File */ ?
                    provider.fileSearch(oneSchemeQuery, token) :
                    provider.textSearch(oneSchemeQuery, onProviderProgress, token));
            }));
            return Promise.all(searchPs).then(completes => {
                const endToEndTime = e2eSW.elapsed();
                this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
                completes.forEach(complete => {
                    this.sendTelemetry(query, endToEndTime, complete);
                });
                return completes;
            }, err => {
                const endToEndTime = e2eSW.elapsed();
                this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
                const searchError = (0, search_1.deserializeSearchError)(err);
                this.logService.trace(`SearchService#searchError: ${searchError.message}`);
                this.sendTelemetry(query, endToEndTime, undefined, searchError);
                throw searchError;
            });
        }
        groupFolderQueriesByScheme(query) {
            const queries = new Map();
            query.folderQueries.forEach(fq => {
                const schemeFQs = queries.get(fq.folder.scheme) || [];
                schemeFQs.push(fq);
                queries.set(fq.folder.scheme, schemeFQs);
            });
            return queries;
        }
        sendTelemetry(query, endToEndTime, complete, err) {
            const fileSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme === network_1.Schemas.file);
            const otherSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme !== network_1.Schemas.file);
            const scheme = fileSchemeOnly ? network_1.Schemas.file :
                otherSchemeOnly ? 'other' :
                    'mixed';
            if (query.type === 1 /* QueryType.File */ && complete && complete.stats) {
                const fileSearchStats = complete.stats;
                if (fileSearchStats.fromCache) {
                    const cacheStats = fileSearchStats.detailStats;
                    this.telemetryService.publicLog2('cachedSearchComplete', {
                        reason: query._reason,
                        resultCount: fileSearchStats.resultCount,
                        workspaceFolderCount: query.folderQueries.length,
                        endToEndTime: endToEndTime,
                        sortingTime: fileSearchStats.sortingTime,
                        cacheWasResolved: cacheStats.cacheWasResolved,
                        cacheLookupTime: cacheStats.cacheLookupTime,
                        cacheFilterTime: cacheStats.cacheFilterTime,
                        cacheEntryCount: cacheStats.cacheEntryCount,
                        scheme
                    });
                }
                else {
                    const searchEngineStats = fileSearchStats.detailStats;
                    this.telemetryService.publicLog2('searchComplete', {
                        reason: query._reason,
                        resultCount: fileSearchStats.resultCount,
                        workspaceFolderCount: query.folderQueries.length,
                        endToEndTime: endToEndTime,
                        sortingTime: fileSearchStats.sortingTime,
                        fileWalkTime: searchEngineStats.fileWalkTime,
                        directoriesWalked: searchEngineStats.directoriesWalked,
                        filesWalked: searchEngineStats.filesWalked,
                        cmdTime: searchEngineStats.cmdTime,
                        cmdResultCount: searchEngineStats.cmdResultCount,
                        scheme
                    });
                }
            }
            else if (query.type === 2 /* QueryType.Text */) {
                let errorType;
                if (err) {
                    errorType = err.code === search_1.SearchErrorCode.regexParseError ? 'regex' :
                        err.code === search_1.SearchErrorCode.unknownEncoding ? 'encoding' :
                            err.code === search_1.SearchErrorCode.globParseError ? 'glob' :
                                err.code === search_1.SearchErrorCode.invalidLiteral ? 'literal' :
                                    err.code === search_1.SearchErrorCode.other ? 'other' :
                                        err.code === search_1.SearchErrorCode.canceled ? 'canceled' :
                                            'unknown';
                }
                this.telemetryService.publicLog2('textSearchComplete', {
                    reason: query._reason,
                    workspaceFolderCount: query.folderQueries.length,
                    endToEndTime: endToEndTime,
                    scheme,
                    error: errorType,
                });
            }
        }
        getOpenEditorResults(query) {
            const openEditorResults = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            let limitHit = false;
            if (query.type === 2 /* QueryType.Text */) {
                const canonicalToOriginalResources = new map_1.ResourceMap();
                for (const editorInput of this.editorService.editors) {
                    const canonical = editor_1.EditorResourceAccessor.getCanonicalUri(editorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    const original = editor_1.EditorResourceAccessor.getOriginalUri(editorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    if (canonical) {
                        canonicalToOriginalResources.set(canonical, original ?? canonical);
                    }
                }
                const models = this.modelService.getModels();
                models.forEach((model) => {
                    const resource = model.uri;
                    if (!resource) {
                        return;
                    }
                    if (limitHit) {
                        return;
                    }
                    const originalResource = canonicalToOriginalResources.get(resource);
                    if (!originalResource) {
                        return;
                    }
                    // Skip search results
                    if (model.getLanguageId() === search_1.SEARCH_RESULT_LANGUAGE_ID && !(query.includePattern && query.includePattern['**/*.code-search'])) {
                        // TODO: untitled search editors will be excluded from search even when include *.code-search is specified
                        return;
                    }
                    // Block walkthrough, webview, etc.
                    if (originalResource.scheme !== network_1.Schemas.untitled && !this.fileService.hasProvider(originalResource)) {
                        return;
                    }
                    // Exclude files from the git FileSystemProvider, e.g. to prevent open staged files from showing in search results
                    if (originalResource.scheme === 'git') {
                        return;
                    }
                    if (!this.matches(originalResource, query)) {
                        return; // respect user filters
                    }
                    // Use editor API to find matches
                    const askMax = (0, types_1.isNumber)(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
                    let matches = model.findMatches(query.contentPattern.pattern, false, !!query.contentPattern.isRegExp, !!query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch ? query.contentPattern.wordSeparators : null, false, askMax);
                    if (matches.length) {
                        if (askMax && matches.length >= askMax) {
                            limitHit = true;
                            matches = matches.slice(0, askMax - 1);
                        }
                        const fileMatch = new search_1.FileMatch(originalResource);
                        openEditorResults.set(originalResource, fileMatch);
                        const textSearchResults = (0, searchHelpers_1.editorMatchesToTextSearchResults)(matches, model, query.previewOptions);
                        fileMatch.results = (0, searchHelpers_1.addContextToEditorMatches)(textSearchResults, model, query);
                    }
                    else {
                        openEditorResults.set(originalResource, null);
                    }
                });
            }
            return {
                results: openEditorResults,
                limitHit
            };
        }
        matches(resource, query) {
            return (0, search_1.pathIncludedInQuery)(query, resource.fsPath);
        }
        async clearCache(cacheKey) {
            const clearPs = Array.from(this.fileSearchProviders.values())
                .map(provider => provider && provider.clearCache(cacheKey));
            await Promise.all(clearPs);
        }
    };
    exports.SearchService = SearchService;
    exports.SearchService = SearchService = __decorate([
        __param(0, model_1.IModelService),
        __param(1, editorService_1.IEditorService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, log_1.ILogService),
        __param(4, extensions_1.IExtensionService),
        __param(5, files_1.IFileService),
        __param(6, uriIdentity_1.IUriIdentityService)
    ], SearchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvY29tbW9uL3NlYXJjaFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUJ6RixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFZNUMsWUFDZ0IsWUFBNEMsRUFDM0MsYUFBOEMsRUFDM0MsZ0JBQW9ELEVBQzFELFVBQXdDLEVBQ2xDLGdCQUFvRCxFQUN6RCxXQUEwQyxFQUNuQyxrQkFBd0Q7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUFSd0IsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDMUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNqQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3hDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFmN0Qsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFDL0Qsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFFeEUsaUNBQTRCLEdBQUcsSUFBSSxHQUFHLEVBQWtELENBQUM7WUFDekYsaUNBQTRCLEdBQUcsSUFBSSxHQUFHLEVBQWtELENBQUM7WUFFekYsa0NBQTZCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQVkxRCxDQUFDO1FBRUQsNEJBQTRCLENBQUMsTUFBYyxFQUFFLElBQXdCLEVBQUUsUUFBK0I7WUFDckcsSUFBSSxJQUF3QyxDQUFDO1lBQzdDLElBQUksV0FBZ0UsQ0FBQztZQUNyRSxJQUFJLElBQUksb0NBQTRCLEVBQUU7Z0JBQ3JDLElBQUksR0FB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