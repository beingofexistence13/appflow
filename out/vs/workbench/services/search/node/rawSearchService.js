/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/fuzzyScorer", "vs/base/common/path", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/fileSearch", "vs/workbench/services/search/node/textSearchAdapter"], function (require, exports, arrays, async_1, errors_1, event_1, fuzzyScorer_1, path_1, stopwatch_1, uri_1, files_1, search_1, fileSearch_1, textSearchAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchService = void 0;
    class SearchService {
        static { this.BATCH_SIZE = 512; }
        constructor(processType = 'searchProcess') {
            this.processType = processType;
            this.caches = Object.create(null);
        }
        fileSearch(config) {
            let promise;
            const query = reviveQuery(config);
            const emitter = new event_1.Emitter({
                onDidAddFirstListener: () => {
                    promise = (0, async_1.createCancelablePromise)(token => {
                        return this.doFileSearchWithEngine(fileSearch_1.Engine, query, p => emitter.fire(p), token);
                    });
                    promise.then(c => emitter.fire(c), err => emitter.fire({ type: 'error', error: { message: err.message, stack: err.stack } }));
                },
                onDidRemoveLastListener: () => {
                    promise.cancel();
                }
            });
            return emitter.event;
        }
        textSearch(rawQuery) {
            let promise;
            const query = reviveQuery(rawQuery);
            const emitter = new event_1.Emitter({
                onDidAddFirstListener: () => {
                    promise = (0, async_1.createCancelablePromise)(token => {
                        return this.ripgrepTextSearch(query, p => emitter.fire(p), token);
                    });
                    promise.then(c => emitter.fire(c), err => emitter.fire({ type: 'error', error: { message: err.message, stack: err.stack } }));
                },
                onDidRemoveLastListener: () => {
                    promise.cancel();
                }
            });
            return emitter.event;
        }
        ripgrepTextSearch(config, progressCallback, token) {
            config.maxFileSize = this.getPlatformFileLimits().maxFileSize;
            const engine = new textSearchAdapter_1.TextSearchEngineAdapter(config);
            return engine.search(token, progressCallback, progressCallback);
        }
        getPlatformFileLimits() {
            return {
                maxFileSize: process.arch === 'ia32' ? 300 * files_1.ByteSize.MB : 16 * files_1.ByteSize.GB
            };
        }
        doFileSearch(config, progressCallback, token) {
            return this.doFileSearchWithEngine(fileSearch_1.Engine, config, progressCallback, token);
        }
        doFileSearchWithEngine(EngineClass, config, progressCallback, token, batchSize = SearchService.BATCH_SIZE) {
            let resultCount = 0;
            const fileProgressCallback = progress => {
                if (Array.isArray(progress)) {
                    resultCount += progress.length;
                    progressCallback(progress.map(m => this.rawMatchToSearchItem(m)));
                }
                else if (progress.relativePath) {
                    resultCount++;
                    progressCallback(this.rawMatchToSearchItem(progress));
                }
                else {
                    progressCallback(progress);
                }
            };
            if (config.sortByScore) {
                let sortedSearch = this.trySortedSearchFromCache(config, fileProgressCallback, token);
                if (!sortedSearch) {
                    const walkerConfig = config.maxResults ? Object.assign({}, config, { maxResults: null }) : config;
                    const engine = new EngineClass(walkerConfig);
                    sortedSearch = this.doSortedSearch(engine, config, progressCallback, fileProgressCallback, token);
                }
                return new Promise((c, e) => {
                    sortedSearch.then(([result, rawMatches]) => {
                        const serializedMatches = rawMatches.map(rawMatch => this.rawMatchToSearchItem(rawMatch));
                        this.sendProgress(serializedMatches, progressCallback, batchSize);
                        c(result);
                    }, e);
                });
            }
            const engine = new EngineClass(config);
            return this.doSearch(engine, fileProgressCallback, batchSize, token).then(complete => {
                return {
                    limitHit: complete.limitHit,
                    type: 'success',
                    stats: {
                        detailStats: complete.stats,
                        type: this.processType,
                        fromCache: false,
                        resultCount,
                        sortingTime: undefined
                    }
                };
            });
        }
        rawMatchToSearchItem(match) {
            return { path: match.base ? (0, path_1.join)(match.base, match.relativePath) : match.relativePath };
        }
        doSortedSearch(engine, config, progressCallback, fileProgressCallback, token) {
            const emitter = new event_1.Emitter();
            let allResultsPromise = (0, async_1.createCancelablePromise)(token => {
                let results = [];
                const innerProgressCallback = progress => {
                    if (Array.isArray(progress)) {
                        results = progress;
                    }
                    else {
                        fileProgressCallback(progress);
                        emitter.fire(progress);
                    }
                };
                return this.doSearch(engine, innerProgressCallback, -1, token)
                    .then(result => {
                    return [result, results];
                });
            });
            let cache;
            if (config.cacheKey) {
                cache = this.getOrCreateCache(config.cacheKey);
                const cacheRow = {
                    promise: allResultsPromise,
                    event: emitter.event,
                    resolved: false
                };
                cache.resultsToSearchCache[config.filePattern || ''] = cacheRow;
                allResultsPromise.then(() => {
                    cacheRow.resolved = true;
                }, err => {
                    delete cache.resultsToSearchCache[config.filePattern || ''];
                });
                allResultsPromise = this.preventCancellation(allResultsPromise);
            }
            return allResultsPromise.then(([result, results]) => {
                const scorerCache = cache ? cache.scorerCache : Object.create(null);
                const sortSW = (typeof config.maxResults !== 'number' || config.maxResults > 0) && stopwatch_1.StopWatch.create(false);
                return this.sortResults(config, results, scorerCache, token)
                    .then(sortedResults => {
                    // sortingTime: -1 indicates a "sorted" search that was not sorted, i.e. populating the cache when quickaccess is opened.
                    // Contrasting with findFiles which is not sorted and will have sortingTime: undefined
                    const sortingTime = sortSW ? sortSW.elapsed() : -1;
                    return [{
                            type: 'success',
                            stats: {
                                detailStats: result.stats,
                                sortingTime,
                                fromCache: false,
                                type: this.processType,
                                workspaceFolderCount: config.folderQueries.length,
                                resultCount: sortedResults.length
                            },
                            messages: result.messages,
                            limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults
                        }, sortedResults];
                });
            });
        }
        getOrCreateCache(cacheKey) {
            const existing = this.caches[cacheKey];
            if (existing) {
                return existing;
            }
            return this.caches[cacheKey] = new Cache();
        }
        trySortedSearchFromCache(config, progressCallback, token) {
            const cache = config.cacheKey && this.caches[config.cacheKey];
            if (!cache) {
                return undefined;
            }
            const cached = this.getResultsFromCache(cache, config.filePattern || '', progressCallback, token);
            if (cached) {
                return cached.then(([result, results, cacheStats]) => {
                    const sortSW = stopwatch_1.StopWatch.create(false);
                    return this.sortResults(config, results, cache.scorerCache, token)
                        .then(sortedResults => {
                        const sortingTime = sortSW.elapsed();
                        const stats = {
                            fromCache: true,
                            detailStats: cacheStats,
                            type: this.processType,
                            resultCount: results.length,
                            sortingTime
                        };
                        return [
                            {
                                type: 'success',
                                limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults,
                                stats
                            },
                            sortedResults
                        ];
                    });
                });
            }
            return undefined;
        }
        sortResults(config, results, scorerCache, token) {
            // we use the same compare function that is used later when showing the results using fuzzy scoring
            // this is very important because we are also limiting the number of results by config.maxResults
            // and as such we want the top items to be included in this result set if the number of items
            // exceeds config.maxResults.
            const query = (0, fuzzyScorer_1.prepareQuery)(config.filePattern || '');
            const compare = (matchA, matchB) => (0, fuzzyScorer_1.compareItemsByFuzzyScore)(matchA, matchB, query, true, FileMatchItemAccessor, scorerCache);
            const maxResults = typeof config.maxResults === 'number' ? config.maxResults : Number.MAX_VALUE;
            return arrays.topAsync(results, compare, maxResults, 10000, token);
        }
        sendProgress(results, progressCb, batchSize) {
            if (batchSize && batchSize > 0) {
                for (let i = 0; i < results.length; i += batchSize) {
                    progressCb(results.slice(i, i + batchSize));
                }
            }
            else {
                progressCb(results);
            }
        }
        getResultsFromCache(cache, searchValue, progressCallback, token) {
            const cacheLookupSW = stopwatch_1.StopWatch.create(false);
            // Find cache entries by prefix of search value
            const hasPathSep = searchValue.indexOf(path_1.sep) >= 0;
            let cachedRow;
            for (const previousSearch in cache.resultsToSearchCache) {
                // If we narrow down, we might be able to reuse the cached results
                if (searchValue.startsWith(previousSearch)) {
                    if (hasPathSep && previousSearch.indexOf(path_1.sep) < 0 && previousSearch !== '') {
                        continue; // since a path character widens the search for potential more matches, require it in previous search too
                    }
                    const row = cache.resultsToSearchCache[previousSearch];
                    cachedRow = {
                        promise: this.preventCancellation(row.promise),
                        event: row.event,
                        resolved: row.resolved
                    };
                    break;
                }
            }
            if (!cachedRow) {
                return null;
            }
            const cacheLookupTime = cacheLookupSW.elapsed();
            const cacheFilterSW = stopwatch_1.StopWatch.create(false);
            const listener = cachedRow.event(progressCallback);
            if (token) {
                token.onCancellationRequested(() => {
                    listener.dispose();
                });
            }
            return cachedRow.promise.then(([complete, cachedEntries]) => {
                if (token && token.isCancellationRequested) {
                    throw (0, errors_1.canceled)();
                }
                // Pattern match on results
                const results = [];
                const normalizedSearchValueLowercase = (0, fuzzyScorer_1.prepareQuery)(searchValue).normalizedLowercase;
                for (const entry of cachedEntries) {
                    // Check if this entry is a match for the search value
                    if (!(0, search_1.isFilePatternMatch)(entry, normalizedSearchValueLowercase)) {
                        continue;
                    }
                    results.push(entry);
                }
                return [complete, results, {
                        cacheWasResolved: cachedRow.resolved,
                        cacheLookupTime,
                        cacheFilterTime: cacheFilterSW.elapsed(),
                        cacheEntryCount: cachedEntries.length
                    }];
            });
        }
        doSearch(engine, progressCallback, batchSize, token) {
            return new Promise((c, e) => {
                let batch = [];
                token?.onCancellationRequested(() => engine.cancel());
                engine.search((match) => {
                    if (match) {
                        if (batchSize) {
                            batch.push(match);
                            if (batchSize > 0 && batch.length >= batchSize) {
                                progressCallback(batch);
                                batch = [];
                            }
                        }
                        else {
                            progressCallback(match);
                        }
                    }
                }, (progress) => {
                    progressCallback(progress);
                }, (error, complete) => {
                    if (batch.length) {
                        progressCallback(batch);
                    }
                    if (error) {
                        e(error);
                    }
                    else {
                        c(complete);
                    }
                });
            });
        }
        clearCache(cacheKey) {
            delete this.caches[cacheKey];
            return Promise.resolve(undefined);
        }
        /**
         * Return a CancelablePromise which is not actually cancelable
         * TODO@rob - Is this really needed?
         */
        preventCancellation(promise) {
            return new class {
                get [Symbol.toStringTag]() { return this.toString(); }
                cancel() {
                    // Do nothing
                }
                then(resolve, reject) {
                    return promise.then(resolve, reject);
                }
                catch(reject) {
                    return this.then(undefined, reject);
                }
                finally(onFinally) {
                    return promise.finally(onFinally);
                }
            };
        }
    }
    exports.SearchService = SearchService;
    class Cache {
        constructor() {
            this.resultsToSearchCache = Object.create(null);
            this.scorerCache = Object.create(null);
        }
    }
    const FileMatchItemAccessor = new class {
        getItemLabel(match) {
            return (0, path_1.basename)(match.relativePath); // e.g. myFile.txt
        }
        getItemDescription(match) {
            return (0, path_1.dirname)(match.relativePath); // e.g. some/path/to/file
        }
        getItemPath(match) {
            return match.relativePath; // e.g. some/path/to/file/myFile.txt
        }
    };
    function reviveQuery(rawQuery) {
        return {
            ...rawQuery,
            ...{
                folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
                extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(components => uri_1.URI.revive(components))
            }
        };
    }
    function reviveFolderQuery(rawFolderQuery) {
        return {
            ...rawFolderQuery,
            folder: uri_1.URI.revive(rawFolderQuery.folder)
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3U2VhcmNoU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvbm9kZS9yYXdTZWFyY2hTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1CaEcsTUFBYSxhQUFhO2lCQUVELGVBQVUsR0FBRyxHQUFHLEFBQU4sQ0FBTztRQUl6QyxZQUE2QixjQUF3QyxlQUFlO1lBQXZELGdCQUFXLEdBQVgsV0FBVyxDQUE0QztZQUY1RSxXQUFNLEdBQWtDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFb0IsQ0FBQztRQUV6RixVQUFVLENBQUMsTUFBcUI7WUFDL0IsSUFBSSxPQUFvRCxDQUFDO1lBRXpELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQU8sQ0FBNEQ7Z0JBQ3RGLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtvQkFDM0IsT0FBTyxHQUFHLElBQUEsK0JBQXVCLEVBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ3pDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLG1CQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzFGLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxJQUFJLENBQ1gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNwQixHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxF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