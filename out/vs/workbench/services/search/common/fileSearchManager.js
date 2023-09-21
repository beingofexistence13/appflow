/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/glob", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/workbench/services/search/common/search"], function (require, exports, path, cancellation_1, errorMessage_1, glob, resources, stopwatch_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileSearchManager = void 0;
    class FileSearchEngine {
        constructor(config, provider, sessionToken) {
            this.config = config;
            this.provider = provider;
            this.sessionToken = sessionToken;
            this.isLimitHit = false;
            this.resultCount = 0;
            this.isCanceled = false;
            this.filePattern = config.filePattern;
            this.includePattern = config.includePattern && glob.parse(config.includePattern);
            this.maxResults = config.maxResults || undefined;
            this.exists = config.exists;
            this.activeCancellationTokens = new Set();
            this.globalExcludePattern = config.excludePattern && glob.parse(config.excludePattern);
        }
        cancel() {
            this.isCanceled = true;
            this.activeCancellationTokens.forEach(t => t.cancel());
            this.activeCancellationTokens = new Set();
        }
        search(_onResult) {
            const folderQueries = this.config.folderQueries || [];
            return new Promise((resolve, reject) => {
                const onResult = (match) => {
                    this.resultCount++;
                    _onResult(match);
                };
                // Support that the file pattern is a full path to a file that exists
                if (this.isCanceled) {
                    return resolve({ limitHit: this.isLimitHit });
                }
                // For each extra file
                if (this.config.extraFileResources) {
                    this.config.extraFileResources
                        .forEach(extraFile => {
                        const extraFileStr = extraFile.toString(); // ?
                        const basename = path.basename(extraFileStr);
                        if (this.globalExcludePattern && this.globalExcludePattern(extraFileStr, basename)) {
                            return; // excluded
                        }
                        // File: Check for match on file pattern and include pattern
                        this.matchFile(onResult, { base: extraFile, basename });
                    });
                }
                // For each root folder
                Promise.all(folderQueries.map(fq => {
                    return this.searchInFolder(fq, onResult);
                })).then(stats => {
                    resolve({
                        limitHit: this.isLimitHit,
                        stats: stats[0] || undefined // Only looking at single-folder workspace stats...
                    });
                }, (err) => {
                    reject(new Error((0, errorMessage_1.toErrorMessage)(err)));
                });
            });
        }
        async searchInFolder(fq, onResult) {
            const cancellation = new cancellation_1.CancellationTokenSource();
            const options = this.getSearchOptionsForFolder(fq);
            const tree = this.initDirectoryTree();
            const queryTester = new search_1.QueryGlobTester(this.config, fq);
            const noSiblingsClauses = !queryTester.hasSiblingExcludeClauses();
            let providerSW;
            try {
                this.activeCancellationTokens.add(cancellation);
                providerSW = stopwatch_1.StopWatch.create();
                const results = await this.provider.provideFileSearchResults({
                    pattern: this.config.filePattern || ''
                }, options, cancellation.token);
                const providerTime = providerSW.elapsed();
                const postProcessSW = stopwatch_1.StopWatch.create();
                if (this.isCanceled && !this.isLimitHit) {
                    return null;
                }
                if (results) {
                    results.forEach(result => {
                        const relativePath = path.posix.relative(fq.folder.path, result.path);
                        if (noSiblingsClauses) {
                            const basename = path.basename(result.path);
                            this.matchFile(onResult, { base: fq.folder, relativePath, basename });
                            return;
                        }
                        // TODO: Optimize siblings clauses with ripgrep here.
                        this.addDirectoryEntries(tree, fq.folder, relativePath, onResult);
                    });
                }
                if (this.isCanceled && !this.isLimitHit) {
                    return null;
                }
                this.matchDirectoryTree(tree, queryTester, onResult);
                return {
                    providerTime,
                    postProcessTime: postProcessSW.elapsed()
                };
            }
            finally {
                cancellation.dispose();
                this.activeCancellationTokens.delete(cancellation);
            }
        }
        getSearchOptionsForFolder(fq) {
            const includes = (0, search_1.resolvePatternsForProvider)(this.config.includePattern, fq.includePattern);
            const excludes = (0, search_1.resolvePatternsForProvider)(this.config.excludePattern, fq.excludePattern);
            return {
                folder: fq.folder,
                excludes,
                includes,
                useIgnoreFiles: !fq.disregardIgnoreFiles,
                useGlobalIgnoreFiles: !fq.disregardGlobalIgnoreFiles,
                useParentIgnoreFiles: !fq.disregardParentIgnoreFiles,
                followSymlinks: !fq.ignoreSymlinks,
                maxResults: this.config.maxResults,
                session: this.sessionToken
            };
        }
        initDirectoryTree() {
            const tree = {
                rootEntries: [],
                pathToEntries: Object.create(null)
            };
            tree.pathToEntries['.'] = tree.rootEntries;
            return tree;
        }
        addDirectoryEntries({ pathToEntries }, base, relativeFile, onResult) {
            // Support relative paths to files from a root resource (ignores excludes)
            if (relativeFile === this.filePattern) {
                const basename = path.basename(this.filePattern);
                this.matchFile(onResult, { base: base, relativePath: this.filePattern, basename });
            }
            function add(relativePath) {
                const basename = path.basename(relativePath);
                const dirname = path.dirname(relativePath);
                let entries = pathToEntries[dirname];
                if (!entries) {
                    entries = pathToEntries[dirname] = [];
                    add(dirname);
                }
                entries.push({
                    base,
                    relativePath,
                    basename
                });
            }
            add(relativeFile);
        }
        matchDirectoryTree({ rootEntries, pathToEntries }, queryTester, onResult) {
            const self = this;
            const filePattern = this.filePattern;
            function matchDirectory(entries) {
                const hasSibling = (0, search_1.hasSiblingFn)(() => entries.map(entry => entry.basename));
                for (let i = 0, n = entries.length; i < n; i++) {
                    const entry = entries[i];
                    const { relativePath, basename } = entry;
                    // Check exclude pattern
                    // If the user searches for the exact file name, we adjust the glob matching
                    // to ignore filtering by siblings because the user seems to know what they
                    // are searching for and we want to include the result in that case anyway
                    if (queryTester.matchesExcludesSync(relativePath, basename, filePattern !== basename ? hasSibling : undefined)) {
                        continue;
                    }
                    const sub = pathToEntries[relativePath];
                    if (sub) {
                        matchDirectory(sub);
                    }
                    else {
                        if (relativePath === filePattern) {
                            continue; // ignore file if its path matches with the file pattern because that is already matched above
                        }
                        self.matchFile(onResult, entry);
                    }
                    if (self.isLimitHit) {
                        break;
                    }
                }
            }
            matchDirectory(rootEntries);
        }
        matchFile(onResult, candidate) {
            if (!this.includePattern || (candidate.relativePath && this.includePattern(candidate.relativePath, candidate.basename))) {
                if (this.exists || (this.maxResults && this.resultCount >= this.maxResults)) {
                    this.isLimitHit = true;
                    this.cancel();
                }
                if (!this.isLimitHit) {
                    onResult(candidate);
                }
            }
        }
    }
    class FileSearchManager {
        constructor() {
            this.sessions = new Map();
        }
        static { this.BATCH_SIZE = 512; }
        fileSearch(config, provider, onBatch, token) {
            const sessionTokenSource = this.getSessionTokenSource(config.cacheKey);
            const engine = new FileSearchEngine(config, provider, sessionTokenSource && sessionTokenSource.token);
            let resultCount = 0;
            const onInternalResult = (batch) => {
                resultCount += batch.length;
                onBatch(batch.map(m => this.rawMatchToSearchItem(m)));
            };
            return this.doSearch(engine, FileSearchManager.BATCH_SIZE, onInternalResult, token).then(result => {
                return {
                    limitHit: result.limitHit,
                    stats: {
                        fromCache: false,
                        type: 'fileSearchProvider',
                        resultCount,
                        detailStats: result.stats
                    }
                };
            });
        }
        clearCache(cacheKey) {
            const sessionTokenSource = this.getSessionTokenSource(cacheKey);
            sessionTokenSource?.cancel();
        }
        getSessionTokenSource(cacheKey) {
            if (!cacheKey) {
                return undefined;
            }
            if (!this.sessions.has(cacheKey)) {
                this.sessions.set(cacheKey, new cancellation_1.CancellationTokenSource());
            }
            return this.sessions.get(cacheKey);
        }
        rawMatchToSearchItem(match) {
            if (match.relativePath) {
                return {
                    resource: resources.joinPath(match.base, match.relativePath)
                };
            }
            else {
                // extraFileResources
                return {
                    resource: match.base
                };
            }
        }
        doSearch(engine, batchSize, onResultBatch, token) {
            const listener = token.onCancellationRequested(() => {
                engine.cancel();
            });
            const _onResult = (match) => {
                if (match) {
                    batch.push(match);
                    if (batchSize > 0 && batch.length >= batchSize) {
                        onResultBatch(batch);
                        batch = [];
                    }
                }
            };
            let batch = [];
            return engine.search(_onResult).then(result => {
                if (batch.length) {
                    onResultBatch(batch);
                }
                listener.dispose();
                return result;
            }, error => {
                if (batch.length) {
                    onResultBatch(batch);
                }
                listener.dispose();
                return Promise.reject(error);
            });
        }
    }
    exports.FileSearchManager = FileSearchManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVNlYXJjaE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL2NvbW1vbi9maWxlU2VhcmNoTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErQmhHLE1BQU0sZ0JBQWdCO1FBYXJCLFlBQW9CLE1BQWtCLEVBQVUsUUFBNEIsRUFBVSxZQUFnQztZQUFsRyxXQUFNLEdBQU4sTUFBTSxDQUFZO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7WUFSOUcsZUFBVSxHQUFHLEtBQUssQ0FBQztZQUNuQixnQkFBVyxHQUFHLENBQUMsQ0FBQztZQUNoQixlQUFVLEdBQUcsS0FBSyxDQUFDO1lBTzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUN0QyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQztZQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDNUIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO1lBRW5FLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBOEM7WUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDO1lBRXRELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3RDLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBeUIsRUFBRSxFQUFFO29CQUM5QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25CLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDO2dCQUVGLHFFQUFxRTtnQkFDckUsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNwQixPQUFPLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztpQkFDOUM7Z0JBRUQsc0JBQXNCO2dCQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCO3lCQUM1QixPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7d0JBQ3BCLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUk7d0JBQy9DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQzdDLElBQUksSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUU7NEJBQ25GLE9BQU8sQ0FBQyxXQUFXO3lCQUNuQjt3QkFFRCw0REFBNEQ7d0JBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUN6RCxDQUFDLENBQUMsQ0FBQztpQkFDSjtnQkFFRCx1QkFBdUI7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDbEMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2hCLE9BQU8sQ0FBQzt3QkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVU7d0JBQ3pCLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLG1EQUFtRDtxQkFDaEYsQ0FBQyxDQUFDO2dCQUNKLENBQUMsRUFBRSxDQUFDLEdBQVUsRUFBRSxFQUFFO29CQUNqQixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQXFCLEVBQUUsUUFBNkM7WUFDaEcsTUFBTSxZQUFZLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBQ25ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUV0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLHdCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCxNQUFNLGlCQUFpQixHQUFHLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFFbEUsSUFBSSxVQUFxQixDQUFDO1lBRTFCLElBQUk7Z0JBQ0gsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFaEQsVUFBVSxHQUFHLHFCQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FDM0Q7b0JBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUU7aUJBQ3RDLEVBQ0QsT0FBTyxFQUNQLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckIsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQyxNQUFNLGFBQWEsR0FBRyxxQkFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUV6QyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUN4QyxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxJQUFJLE9BQU8sRUFBRTtvQkFDWixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN4QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRXRFLElBQUksaUJBQWlCLEVBQUU7NEJBQ3RCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDOzRCQUV0RSxPQUFPO3lCQUNQO3dCQUVELHFEQUFxRDt3QkFDckQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDbkUsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDeEMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3JELE9BQWlDO29CQUNoQyxZQUFZO29CQUNaLGVBQWUsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFO2lCQUN4QyxDQUFDO2FBQ0Y7b0JBQVM7Z0JBQ1QsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ25EO1FBQ0YsQ0FBQztRQUVPLHlCQUF5QixDQUFDLEVBQXFCO1lBQ3RELE1BQU0sUUFBUSxHQUFHLElBQUEsbUNBQTBCLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzNGLE1BQU0sUUFBUSxHQUFHLElBQUEsbUNBQTBCLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTNGLE9BQU87Z0JBQ04sTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNO2dCQUNqQixRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLG9CQUFvQjtnQkFDeEMsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsMEJBQTBCO2dCQUNwRCxvQkFBb0IsRUFBRSxDQUFDLEVBQUUsQ0FBQywwQkFBMEI7Z0JBQ3BELGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFjO2dCQUNsQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dCQUNsQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDMUIsQ0FBQztRQUNILENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsTUFBTSxJQUFJLEdBQW1CO2dCQUM1QixXQUFXLEVBQUUsRUFBRTtnQkFDZixhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDbEMsQ0FBQztZQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxFQUFFLGFBQWEsRUFBa0IsRUFBRSxJQUFTLEVBQUUsWUFBb0IsRUFBRSxRQUE4QztZQUM3SSwwRUFBMEU7WUFDMUUsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDdEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ25GO1lBRUQsU0FBUyxHQUFHLENBQUMsWUFBb0I7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzNDLElBQUksT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixPQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDdEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNiO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1osSUFBSTtvQkFDSixZQUFZO29CQUNaLFFBQVE7aUJBQ1IsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBRU8sa0JBQWtCLENBQUMsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFrQixFQUFFLFdBQTRCLEVBQUUsUUFBOEM7WUFDdEosTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDckMsU0FBUyxjQUFjLENBQUMsT0FBMEI7Z0JBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQy9DLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekIsTUFBTSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUM7b0JBRXpDLHdCQUF3QjtvQkFDeEIsNEVBQTRFO29CQUM1RSwyRUFBMkU7b0JBQzNFLDBFQUEwRTtvQkFDMUUsSUFBSSxXQUFXLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUMvRyxTQUFTO3FCQUNUO29CQUVELE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxHQUFHLEVBQUU7d0JBQ1IsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNwQjt5QkFBTTt3QkFDTixJQUFJLFlBQVksS0FBSyxXQUFXLEVBQUU7NEJBQ2pDLFNBQVMsQ0FBQyw4RkFBOEY7eUJBQ3hHO3dCQUVELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUNoQztvQkFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ3BCLE1BQU07cUJBQ047aUJBQ0Q7WUFDRixDQUFDO1lBQ0QsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFTyxTQUFTLENBQUMsUUFBOEMsRUFBRSxTQUE2QjtZQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO2dCQUN4SCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUM1RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNkO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNyQixRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3BCO2FBQ0Q7UUFDRixDQUFDO0tBQ0Q7SUFPRCxNQUFhLGlCQUFpQjtRQUE5QjtZQUlrQixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7UUF3RnhFLENBQUM7aUJBMUZ3QixlQUFVLEdBQUcsR0FBRyxBQUFOLENBQU87UUFJekMsVUFBVSxDQUFDLE1BQWtCLEVBQUUsUUFBNEIsRUFBRSxPQUF3QyxFQUFFLEtBQXdCO1lBQzlILE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsa0JBQWtCLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFdEcsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUEyQixFQUFFLEVBQUU7Z0JBQ3hELFdBQVcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUN2RixNQUFNLENBQUMsRUFBRTtnQkFDUixPQUE2QjtvQkFDNUIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO29CQUN6QixLQUFLLEVBQUU7d0JBQ04sU0FBUyxFQUFFLEtBQUs7d0JBQ2hCLElBQUksRUFBRSxvQkFBb0I7d0JBQzFCLFdBQVc7d0JBQ1gsV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLO3FCQUN6QjtpQkFDRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsVUFBVSxDQUFDLFFBQWdCO1lBQzFCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxRQUE0QjtZQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDLENBQUM7YUFDM0Q7WUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxLQUF5QjtZQUNyRCxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLE9BQU87b0JBQ04sUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDO2lCQUM1RCxDQUFDO2FBQ0Y7aUJBQU07Z0JBQ04scUJBQXFCO2dCQUNyQixPQUFPO29CQUNOLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSTtpQkFDcEIsQ0FBQzthQUNGO1FBQ0YsQ0FBQztRQUVPLFFBQVEsQ0FBQyxNQUF3QixFQUFFLFNBQWlCLEVBQUUsYUFBc0QsRUFBRSxLQUF3QjtZQUM3SSxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO2dCQUNuRCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQXlCLEVBQUUsRUFBRTtnQkFDL0MsSUFBSSxLQUFLLEVBQUU7b0JBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFFO3dCQUMvQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3JCLEtBQUssR0FBRyxFQUFFLENBQUM7cUJBQ1g7aUJBQ0Q7WUFDRixDQUFDLENBQUM7WUFFRixJQUFJLEtBQUssR0FBeUIsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzdDLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtvQkFDakIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQjtnQkFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNWLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtvQkFDakIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQjtnQkFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7O0lBM0ZGLDhDQTRGQyJ9