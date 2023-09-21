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
    exports.$d3b = void 0;
    let $d3b = class $d3b extends lifecycle_1.$kc {
        constructor(j, m, n, r, s, t, u) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.a = new Map();
            this.b = new Map();
            this.f = new Map();
            this.g = new Map();
            this.h = new Set();
        }
        registerSearchResultProvider(scheme, type, provider) {
            let list;
            let deferredMap;
            if (type === 0 /* SearchProviderType.file */) {
                list = this.a;
                deferredMap = this.f;
            }
            else if (type === 1 /* SearchProviderType.text */) {
                list = this.b;
                deferredMap = this.g;
            }
            else {
                throw new Error('Unknown SearchProviderType');
            }
            list.set(scheme, provider);
            if (deferredMap.has(scheme)) {
                deferredMap.get(scheme).complete(provider);
                deferredMap.delete(scheme);
            }
            return (0, lifecycle_1.$ic)(() => {
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
            const openEditorResults = this.H(query);
            if (onProgress) {
                arrays.$Fb([...openEditorResults.results.values()]).filter(e => !(notebookFilesToIgnore && notebookFilesToIgnore.has(e.resource))).forEach(onProgress);
            }
            const syncResults = {
                results: arrays.$Fb([...openEditorResults.results.values()]),
                limitHit: openEditorResults.limitHit ?? false,
                messages: []
            };
            const getAsyncResults = async () => {
                const resolvedAsyncNotebookFilesToIgnore = await asyncNotebookFilesToIgnore ?? new map_1.$Ai();
                const onProviderProgress = (progress) => {
                    if ((0, search_1.$qI)(progress)) {
                        // Match
                        if (!openEditorResults.results.has(progress.resource) && !resolvedAsyncNotebookFilesToIgnore.has(progress.resource) && onProgress) { // don't override open editor results
                            onProgress(progress);
                        }
                    }
                    else if (onProgress) {
                        // Progress
                        onProgress(progress);
                    }
                    if ((0, search_1.$rI)(progress)) {
                        this.r.debug('SearchService#search', progress.message);
                    }
                };
                return await this.w(query, token, onProviderProgress);
            };
            return {
                syncResults,
                asyncResults: getAsyncResults()
            };
        }
        fileSearch(query, token) {
            return this.w(query, token);
        }
        w(query, token, onProgress) {
            this.r.trace('SearchService#search', JSON.stringify(query));
            const schemesInQuery = this.z(query);
            const providerActivations = [Promise.resolve(null)];
            schemesInQuery.forEach(scheme => providerActivations.push(this.s.activateByEvent(`onSearch:${scheme}`)));
            providerActivations.push(this.s.activateByEvent('onSearch:file'));
            const providerPromise = (async () => {
                await Promise.all(providerActivations);
                await this.s.whenInstalledExtensionsRegistered();
                // Cancel faster if search was canceled while waiting for extensions
                if (token && token.isCancellationRequested) {
                    return Promise.reject(new errors_1.$3());
                }
                const progressCallback = (item) => {
                    if (token && token.isCancellationRequested) {
                        return;
                    }
                    onProgress?.(item);
                };
                const exists = await Promise.all(query.folderQueries.map(query => this.t.exists(query.folder)));
                query.folderQueries = query.folderQueries.filter((_, i) => exists[i]);
                let completes = await this.D(query, progressCallback, token);
                completes = arrays.$Fb(completes);
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
                    messages: arrays.$Fb(arrays.$Pb(completes.map(i => i.messages))).filter(arrays.$Lb(message => message.type + message.text + message.trusted)),
                    results: arrays.$Pb(completes.map((c) => c.results))
                };
            })();
            return new Promise((resolve, reject) => {
                if (token) {
                    token.onCancellationRequested(() => {
                        reject(new errors_1.$3());
                    });
                }
                providerPromise.then(resolve, reject);
            });
        }
        z(query) {
            const schemes = new Set();
            query.folderQueries?.forEach(fq => schemes.add(fq.folder.scheme));
            query.extraFileResources?.forEach(extraFile => schemes.add(extraFile.scheme));
            return schemes;
        }
        async C(queryType, scheme) {
            const deferredMap = queryType === 1 /* QueryType.File */ ?
                this.f :
                this.g;
            if (deferredMap.has(scheme)) {
                return deferredMap.get(scheme).p;
            }
            else {
                const deferred = new async_1.$2g();
                deferredMap.set(scheme, deferred);
                return deferred.p;
            }
        }
        async D(query, onProviderProgress, token) {
            const e2eSW = stopwatch_1.$bd.create(false);
            const searchPs = [];
            const fqs = this.F(query);
            const someSchemeHasProvider = [...fqs.keys()].some(scheme => {
                return query.type === 1 /* QueryType.File */ ?
                    this.a.has(scheme) :
                    this.b.has(scheme);
            });
            await Promise.all([...fqs.keys()].map(async (scheme) => {
                const schemeFQs = fqs.get(scheme);
                let provider = query.type === 1 /* QueryType.File */ ?
                    this.a.get(scheme) :
                    this.b.get(scheme);
                if (!provider) {
                    if (someSchemeHasProvider) {
                        if (!this.h.has(scheme)) {
                            this.r.warn(`No search provider registered for scheme: ${scheme}. Another scheme has a provider, not waiting for ${scheme}`);
                            this.h.add(scheme);
                        }
                        return;
                    }
                    else {
                        if (!this.h.has(scheme)) {
                            this.r.warn(`No search provider registered for scheme: ${scheme}, waiting`);
                            this.h.add(scheme);
                        }
                        provider = await this.C(query.type, scheme);
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
                this.r.trace(`SearchService#search: ${endToEndTime}ms`);
                completes.forEach(complete => {
                    this.G(query, endToEndTime, complete);
                });
                return completes;
            }, err => {
                const endToEndTime = e2eSW.elapsed();
                this.r.trace(`SearchService#search: ${endToEndTime}ms`);
                const searchError = (0, search_1.$zI)(err);
                this.r.trace(`SearchService#searchError: ${searchError.message}`);
                this.G(query, endToEndTime, undefined, searchError);
                throw searchError;
            });
        }
        F(query) {
            const queries = new Map();
            query.folderQueries.forEach(fq => {
                const schemeFQs = queries.get(fq.folder.scheme) || [];
                schemeFQs.push(fq);
                queries.set(fq.folder.scheme, schemeFQs);
            });
            return queries;
        }
        G(query, endToEndTime, complete, err) {
            const fileSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme === network_1.Schemas.file);
            const otherSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme !== network_1.Schemas.file);
            const scheme = fileSchemeOnly ? network_1.Schemas.file :
                otherSchemeOnly ? 'other' :
                    'mixed';
            if (query.type === 1 /* QueryType.File */ && complete && complete.stats) {
                const fileSearchStats = complete.stats;
                if (fileSearchStats.fromCache) {
                    const cacheStats = fileSearchStats.detailStats;
                    this.n.publicLog2('cachedSearchComplete', {
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
                    this.n.publicLog2('searchComplete', {
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
                this.n.publicLog2('textSearchComplete', {
                    reason: query._reason,
                    workspaceFolderCount: query.folderQueries.length,
                    endToEndTime: endToEndTime,
                    scheme,
                    error: errorType,
                });
            }
        }
        H(query) {
            const openEditorResults = new map_1.$zi(uri => this.u.extUri.getComparisonKey(uri));
            let limitHit = false;
            if (query.type === 2 /* QueryType.Text */) {
                const canonicalToOriginalResources = new map_1.$zi();
                for (const editorInput of this.m.editors) {
                    const canonical = editor_1.$3E.getCanonicalUri(editorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    const original = editor_1.$3E.getOriginalUri(editorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    if (canonical) {
                        canonicalToOriginalResources.set(canonical, original ?? canonical);
                    }
                }
                const models = this.j.getModels();
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
                    if (model.getLanguageId() === search_1.$mI && !(query.includePattern && query.includePattern['**/*.code-search'])) {
                        // TODO: untitled search editors will be excluded from search even when include *.code-search is specified
                        return;
                    }
                    // Block walkthrough, webview, etc.
                    if (originalResource.scheme !== network_1.Schemas.untitled && !this.t.hasProvider(originalResource)) {
                        return;
                    }
                    // Exclude files from the git FileSystemProvider, e.g. to prevent open staged files from showing in search results
                    if (originalResource.scheme === 'git') {
                        return;
                    }
                    if (!this.I(originalResource, query)) {
                        return; // respect user filters
                    }
                    // Use editor API to find matches
                    const askMax = (0, types_1.$nf)(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
                    let matches = model.findMatches(query.contentPattern.pattern, false, !!query.contentPattern.isRegExp, !!query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch ? query.contentPattern.wordSeparators : null, false, askMax);
                    if (matches.length) {
                        if (askMax && matches.length >= askMax) {
                            limitHit = true;
                            matches = matches.slice(0, askMax - 1);
                        }
                        const fileMatch = new search_1.$sI(originalResource);
                        openEditorResults.set(originalResource, fileMatch);
                        const textSearchResults = (0, searchHelpers_1.$NMb)(matches, model, query.previewOptions);
                        fileMatch.results = (0, searchHelpers_1.$OMb)(textSearchResults, model, query);
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
        I(resource, query) {
            return (0, search_1.$xI)(query, resource.fsPath);
        }
        async clearCache(cacheKey) {
            const clearPs = Array.from(this.a.values())
                .map(provider => provider && provider.clearCache(cacheKey));
            await Promise.all(clearPs);
        }
    };
    exports.$d3b = $d3b;
    exports.$d3b = $d3b = __decorate([
        __param(0, model_1.$yA),
        __param(1, editorService_1.$9C),
        __param(2, telemetry_1.$9k),
        __param(3, log_1.$5i),
        __param(4, extensions_1.$MF),
        __param(5, files_1.$6j),
        __param(6, uriIdentity_1.$Ck)
    ], $d3b);
});
//# sourceMappingURL=searchService.js.map