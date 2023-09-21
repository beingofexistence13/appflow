/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/glob", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/workbench/services/search/common/search"], function (require, exports, path, cancellation_1, errorMessage_1, glob, resources, stopwatch_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ucc = void 0;
    class FileSearchEngine {
        constructor(k, l, o) {
            this.k = k;
            this.l = l;
            this.o = o;
            this.e = false;
            this.f = 0;
            this.g = false;
            this.a = k.filePattern;
            this.b = k.includePattern && glob.$rj(k.includePattern);
            this.c = k.maxResults || undefined;
            this.d = k.exists;
            this.h = new Set();
            this.j = k.excludePattern && glob.$rj(k.excludePattern);
        }
        cancel() {
            this.g = true;
            this.h.forEach(t => t.cancel());
            this.h = new Set();
        }
        search(_onResult) {
            const folderQueries = this.k.folderQueries || [];
            return new Promise((resolve, reject) => {
                const onResult = (match) => {
                    this.f++;
                    _onResult(match);
                };
                // Support that the file pattern is a full path to a file that exists
                if (this.g) {
                    return resolve({ limitHit: this.e });
                }
                // For each extra file
                if (this.k.extraFileResources) {
                    this.k.extraFileResources
                        .forEach(extraFile => {
                        const extraFileStr = extraFile.toString(); // ?
                        const basename = path.$ae(extraFileStr);
                        if (this.j && this.j(extraFileStr, basename)) {
                            return; // excluded
                        }
                        // File: Check for match on file pattern and include pattern
                        this.v(onResult, { base: extraFile, basename });
                    });
                }
                // For each root folder
                Promise.all(folderQueries.map(fq => {
                    return this.p(fq, onResult);
                })).then(stats => {
                    resolve({
                        limitHit: this.e,
                        stats: stats[0] || undefined // Only looking at single-folder workspace stats...
                    });
                }, (err) => {
                    reject(new Error((0, errorMessage_1.$mi)(err)));
                });
            });
        }
        async p(fq, onResult) {
            const cancellation = new cancellation_1.$pd();
            const options = this.q(fq);
            const tree = this.r();
            const queryTester = new search_1.$HI(this.k, fq);
            const noSiblingsClauses = !queryTester.hasSiblingExcludeClauses();
            let providerSW;
            try {
                this.h.add(cancellation);
                providerSW = stopwatch_1.$bd.create();
                const results = await this.l.provideFileSearchResults({
                    pattern: this.k.filePattern || ''
                }, options, cancellation.token);
                const providerTime = providerSW.elapsed();
                const postProcessSW = stopwatch_1.$bd.create();
                if (this.g && !this.e) {
                    return null;
                }
                if (results) {
                    results.forEach(result => {
                        const relativePath = path.$6d.relative(fq.folder.path, result.path);
                        if (noSiblingsClauses) {
                            const basename = path.$ae(result.path);
                            this.v(onResult, { base: fq.folder, relativePath, basename });
                            return;
                        }
                        // TODO: Optimize siblings clauses with ripgrep here.
                        this.s(tree, fq.folder, relativePath, onResult);
                    });
                }
                if (this.g && !this.e) {
                    return null;
                }
                this.u(tree, queryTester, onResult);
                return {
                    providerTime,
                    postProcessTime: postProcessSW.elapsed()
                };
            }
            finally {
                cancellation.dispose();
                this.h.delete(cancellation);
            }
        }
        q(fq) {
            const includes = (0, search_1.$GI)(this.k.includePattern, fq.includePattern);
            const excludes = (0, search_1.$GI)(this.k.excludePattern, fq.excludePattern);
            return {
                folder: fq.folder,
                excludes,
                includes,
                useIgnoreFiles: !fq.disregardIgnoreFiles,
                useGlobalIgnoreFiles: !fq.disregardGlobalIgnoreFiles,
                useParentIgnoreFiles: !fq.disregardParentIgnoreFiles,
                followSymlinks: !fq.ignoreSymlinks,
                maxResults: this.k.maxResults,
                session: this.o
            };
        }
        r() {
            const tree = {
                rootEntries: [],
                pathToEntries: Object.create(null)
            };
            tree.pathToEntries['.'] = tree.rootEntries;
            return tree;
        }
        s({ pathToEntries }, base, relativeFile, onResult) {
            // Support relative paths to files from a root resource (ignores excludes)
            if (relativeFile === this.a) {
                const basename = path.$ae(this.a);
                this.v(onResult, { base: base, relativePath: this.a, basename });
            }
            function add(relativePath) {
                const basename = path.$ae(relativePath);
                const dirname = path.$_d(relativePath);
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
        u({ rootEntries, pathToEntries }, queryTester, onResult) {
            const self = this;
            const filePattern = this.a;
            function matchDirectory(entries) {
                const hasSibling = (0, search_1.$JI)(() => entries.map(entry => entry.basename));
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
                        self.v(onResult, entry);
                    }
                    if (self.e) {
                        break;
                    }
                }
            }
            matchDirectory(rootEntries);
        }
        v(onResult, candidate) {
            if (!this.b || (candidate.relativePath && this.b(candidate.relativePath, candidate.basename))) {
                if (this.d || (this.c && this.f >= this.c)) {
                    this.e = true;
                    this.cancel();
                }
                if (!this.e) {
                    onResult(candidate);
                }
            }
        }
    }
    class $ucc {
        constructor() {
            this.b = new Map();
        }
        static { this.a = 512; }
        fileSearch(config, provider, onBatch, token) {
            const sessionTokenSource = this.c(config.cacheKey);
            const engine = new FileSearchEngine(config, provider, sessionTokenSource && sessionTokenSource.token);
            let resultCount = 0;
            const onInternalResult = (batch) => {
                resultCount += batch.length;
                onBatch(batch.map(m => this.d(m)));
            };
            return this.e(engine, $ucc.a, onInternalResult, token).then(result => {
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
            const sessionTokenSource = this.c(cacheKey);
            sessionTokenSource?.cancel();
        }
        c(cacheKey) {
            if (!cacheKey) {
                return undefined;
            }
            if (!this.b.has(cacheKey)) {
                this.b.set(cacheKey, new cancellation_1.$pd());
            }
            return this.b.get(cacheKey);
        }
        d(match) {
            if (match.relativePath) {
                return {
                    resource: resources.$ig(match.base, match.relativePath)
                };
            }
            else {
                // extraFileResources
                return {
                    resource: match.base
                };
            }
        }
        e(engine, batchSize, onResultBatch, token) {
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
    exports.$ucc = $ucc;
});
//# sourceMappingURL=fileSearchManager.js.map