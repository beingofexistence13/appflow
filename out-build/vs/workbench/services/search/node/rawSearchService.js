/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/fuzzyScorer", "vs/base/common/path", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/fileSearch", "vs/workbench/services/search/node/textSearchAdapter"], function (require, exports, arrays, async_1, errors_1, event_1, fuzzyScorer_1, path_1, stopwatch_1, uri_1, files_1, search_1, fileSearch_1, textSearchAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Idc = void 0;
    class $Idc {
        static { this.a = 512; }
        constructor(d = 'searchProcess') {
            this.d = d;
            this.b = Object.create(null);
        }
        fileSearch(config) {
            let promise;
            const query = reviveQuery(config);
            const emitter = new event_1.$fd({
                onDidAddFirstListener: () => {
                    promise = (0, async_1.$ug)(token => {
                        return this.doFileSearchWithEngine(fileSearch_1.$ydc, query, p => emitter.fire(p), token);
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
            const emitter = new event_1.$fd({
                onDidAddFirstListener: () => {
                    promise = (0, async_1.$ug)(token => {
                        return this.f(query, p => emitter.fire(p), token);
                    });
                    promise.then(c => emitter.fire(c), err => emitter.fire({ type: 'error', error: { message: err.message, stack: err.stack } }));
                },
                onDidRemoveLastListener: () => {
                    promise.cancel();
                }
            });
            return emitter.event;
        }
        f(config, progressCallback, token) {
            config.maxFileSize = this.g().maxFileSize;
            const engine = new textSearchAdapter_1.$Hdc(config);
            return engine.search(token, progressCallback, progressCallback);
        }
        g() {
            return {
                maxFileSize: process.arch === 'ia32' ? 300 * files_1.$Ak.MB : 16 * files_1.$Ak.GB
            };
        }
        doFileSearch(config, progressCallback, token) {
            return this.doFileSearchWithEngine(fileSearch_1.$ydc, config, progressCallback, token);
        }
        doFileSearchWithEngine(EngineClass, config, progressCallback, token, batchSize = $Idc.a) {
            let resultCount = 0;
            const fileProgressCallback = progress => {
                if (Array.isArray(progress)) {
                    resultCount += progress.length;
                    progressCallback(progress.map(m => this.h(m)));
                }
                else if (progress.relativePath) {
                    resultCount++;
                    progressCallback(this.h(progress));
                }
                else {
                    progressCallback(progress);
                }
            };
            if (config.sortByScore) {
                let sortedSearch = this.l(config, fileProgressCallback, token);
                if (!sortedSearch) {
                    const walkerConfig = config.maxResults ? Object.assign({}, config, { maxResults: null }) : config;
                    const engine = new EngineClass(walkerConfig);
                    sortedSearch = this.j(engine, config, progressCallback, fileProgressCallback, token);
                }
                return new Promise((c, e) => {
                    sortedSearch.then(([result, rawMatches]) => {
                        const serializedMatches = rawMatches.map(rawMatch => this.h(rawMatch));
                        this.o(serializedMatches, progressCallback, batchSize);
                        c(result);
                    }, e);
                });
            }
            const engine = new EngineClass(config);
            return this.r(engine, fileProgressCallback, batchSize, token).then(complete => {
                return {
                    limitHit: complete.limitHit,
                    type: 'success',
                    stats: {
                        detailStats: complete.stats,
                        type: this.d,
                        fromCache: false,
                        resultCount,
                        sortingTime: undefined
                    }
                };
            });
        }
        h(match) {
            return { path: match.base ? (0, path_1.$9d)(match.base, match.relativePath) : match.relativePath };
        }
        j(engine, config, progressCallback, fileProgressCallback, token) {
            const emitter = new event_1.$fd();
            let allResultsPromise = (0, async_1.$ug)(token => {
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
                return this.r(engine, innerProgressCallback, -1, token)
                    .then(result => {
                    return [result, results];
                });
            });
            let cache;
            if (config.cacheKey) {
                cache = this.k(config.cacheKey);
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
                allResultsPromise = this.s(allResultsPromise);
            }
            return allResultsPromise.then(([result, results]) => {
                const scorerCache = cache ? cache.scorerCache : Object.create(null);
                const sortSW = (typeof config.maxResults !== 'number' || config.maxResults > 0) && stopwatch_1.$bd.create(false);
                return this.n(config, results, scorerCache, token)
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
                                type: this.d,
                                workspaceFolderCount: config.folderQueries.length,
                                resultCount: sortedResults.length
                            },
                            messages: result.messages,
                            limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults
                        }, sortedResults];
                });
            });
        }
        k(cacheKey) {
            const existing = this.b[cacheKey];
            if (existing) {
                return existing;
            }
            return this.b[cacheKey] = new Cache();
        }
        l(config, progressCallback, token) {
            const cache = config.cacheKey && this.b[config.cacheKey];
            if (!cache) {
                return undefined;
            }
            const cached = this.q(cache, config.filePattern || '', progressCallback, token);
            if (cached) {
                return cached.then(([result, results, cacheStats]) => {
                    const sortSW = stopwatch_1.$bd.create(false);
                    return this.n(config, results, cache.scorerCache, token)
                        .then(sortedResults => {
                        const sortingTime = sortSW.elapsed();
                        const stats = {
                            fromCache: true,
                            detailStats: cacheStats,
                            type: this.d,
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
        n(config, results, scorerCache, token) {
            // we use the same compare function that is used later when showing the results using fuzzy scoring
            // this is very important because we are also limiting the number of results by config.maxResults
            // and as such we want the top items to be included in this result set if the number of items
            // exceeds config.maxResults.
            const query = (0, fuzzyScorer_1.$oq)(config.filePattern || '');
            const compare = (matchA, matchB) => (0, fuzzyScorer_1.$nq)(matchA, matchB, query, true, FileMatchItemAccessor, scorerCache);
            const maxResults = typeof config.maxResults === 'number' ? config.maxResults : Number.MAX_VALUE;
            return arrays.$Eb(results, compare, maxResults, 10000, token);
        }
        o(results, progressCb, batchSize) {
            if (batchSize && batchSize > 0) {
                for (let i = 0; i < results.length; i += batchSize) {
                    progressCb(results.slice(i, i + batchSize));
                }
            }
            else {
                progressCb(results);
            }
        }
        q(cache, searchValue, progressCallback, token) {
            const cacheLookupSW = stopwatch_1.$bd.create(false);
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
                        promise: this.s(row.promise),
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
            const cacheFilterSW = stopwatch_1.$bd.create(false);
            const listener = cachedRow.event(progressCallback);
            if (token) {
                token.onCancellationRequested(() => {
                    listener.dispose();
                });
            }
            return cachedRow.promise.then(([complete, cachedEntries]) => {
                if (token && token.isCancellationRequested) {
                    throw (0, errors_1.$4)();
                }
                // Pattern match on results
                const results = [];
                const normalizedSearchValueLowercase = (0, fuzzyScorer_1.$oq)(searchValue).normalizedLowercase;
                for (const entry of cachedEntries) {
                    // Check if this entry is a match for the search value
                    if (!(0, search_1.$EI)(entry, normalizedSearchValueLowercase)) {
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
        r(engine, progressCallback, batchSize, token) {
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
            delete this.b[cacheKey];
            return Promise.resolve(undefined);
        }
        /**
         * Return a CancelablePromise which is not actually cancelable
         * TODO@rob - Is this really needed?
         */
        s(promise) {
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
    exports.$Idc = $Idc;
    class Cache {
        constructor() {
            this.resultsToSearchCache = Object.create(null);
            this.scorerCache = Object.create(null);
        }
    }
    const FileMatchItemAccessor = new class {
        getItemLabel(match) {
            return (0, path_1.$ae)(match.relativePath); // e.g. myFile.txt
        }
        getItemDescription(match) {
            return (0, path_1.$_d)(match.relativePath); // e.g. some/path/to/file
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
//# sourceMappingURL=rawSearchService.js.map