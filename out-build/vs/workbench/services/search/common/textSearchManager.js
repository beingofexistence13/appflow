/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/common/search"], function (require, exports, arrays_1, async_1, cancellation_1, errorMessage_1, network_1, path, resources, uri_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ycc = exports.$xcc = exports.$wcc = exports.$vcc = void 0;
    class $vcc {
        constructor(d, e, f, g) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = null;
            this.b = false;
            this.c = 0;
        }
        search(onProgress, token) {
            const folderQueries = this.d.folderQueries || [];
            const tokenSource = new cancellation_1.$pd(token);
            return new Promise((resolve, reject) => {
                this.a = new $wcc(onProgress);
                let isCanceled = false;
                const onResult = (result, folderIdx) => {
                    if (isCanceled) {
                        return;
                    }
                    if (!this.b) {
                        const resultSize = this.h(result);
                        if ($xcc(result) && typeof this.d.maxResults === 'number' && this.c + resultSize > this.d.maxResults) {
                            this.b = true;
                            isCanceled = true;
                            tokenSource.cancel();
                            result = this.j(result, this.d.maxResults - this.c);
                        }
                        const newResultSize = this.h(result);
                        this.c += newResultSize;
                        if (newResultSize > 0 || !$xcc(result)) {
                            this.a.add(result, folderIdx);
                        }
                    }
                };
                // For each root folder
                Promise.all(folderQueries.map((fq, i) => {
                    return this.k(fq, r => onResult(r, i), tokenSource.token);
                })).then(results => {
                    tokenSource.dispose();
                    this.a.flush();
                    const someFolderHitLImit = results.some(result => !!result && !!result.limitHit);
                    resolve({
                        limitHit: this.b || someFolderHitLImit,
                        messages: (0, arrays_1.$Pb)(results.map(result => {
                            if (!result?.message) {
                                return [];
                            }
                            if (Array.isArray(result.message)) {
                                return result.message;
                            }
                            else {
                                return [result.message];
                            }
                        })),
                        stats: {
                            type: this.g
                        }
                    });
                }, (err) => {
                    tokenSource.dispose();
                    const errMsg = (0, errorMessage_1.$mi)(err);
                    reject(new Error(errMsg));
                });
            });
        }
        h(result) {
            if ($xcc(result)) {
                return Array.isArray(result.ranges) ?
                    result.ranges.length :
                    1;
            }
            else {
                // #104400 context lines shoudn't count towards result count
                return 0;
            }
        }
        j(result, size) {
            const rangesArr = Array.isArray(result.ranges) ? result.ranges : [result.ranges];
            const matchesArr = Array.isArray(result.preview.matches) ? result.preview.matches : [result.preview.matches];
            return {
                ranges: rangesArr.slice(0, size),
                preview: {
                    matches: matchesArr.slice(0, size),
                    text: result.preview.text
                },
                uri: result.uri
            };
        }
        async k(folderQuery, onResult, token) {
            const queryTester = new search_1.$HI(this.d, folderQuery);
            const testingPs = [];
            const progress = {
                report: (result) => {
                    if (!this.l(result)) {
                        return;
                    }
                    const hasSibling = folderQuery.folder.scheme === network_1.Schemas.file ?
                        (0, search_1.$II)(() => {
                            return this.f.readdir(resources.$hg(result.uri));
                        }) :
                        undefined;
                    const relativePath = resources.$kg(folderQuery.folder, result.uri);
                    if (relativePath) {
                        // This method is only async when the exclude contains sibling clauses
                        const included = queryTester.includedInQuery(relativePath, path.$ae(relativePath), hasSibling);
                        if ((0, async_1.$tg)(included)) {
                            testingPs.push(included.then(isIncluded => {
                                if (isIncluded) {
                                    onResult(result);
                                }
                            }));
                        }
                        else if (included) {
                            onResult(result);
                        }
                    }
                }
            };
            const searchOptions = this.n(folderQuery);
            const result = await this.e.provideTextSearchResults(patternInfoToQuery(this.d.contentPattern), searchOptions, progress, token);
            if (testingPs.length) {
                await Promise.all(testingPs);
            }
            return result;
        }
        l(result) {
            if ($xcc(result)) {
                if (Array.isArray(result.ranges)) {
                    if (!Array.isArray(result.preview.matches)) {
                        console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same type.');
                        return false;
                    }
                    if (result.preview.matches.length !== result.ranges.length) {
                        console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same length.');
                        return false;
                    }
                }
                else {
                    if (Array.isArray(result.preview.matches)) {
                        console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same length.');
                        return false;
                    }
                }
            }
            return true;
        }
        n(fq) {
            const includes = (0, search_1.$GI)(this.d.includePattern, fq.includePattern);
            const excludes = (0, search_1.$GI)(this.d.excludePattern, fq.excludePattern);
            const options = {
                folder: uri_1.URI.from(fq.folder),
                excludes,
                includes,
                useIgnoreFiles: !fq.disregardIgnoreFiles,
                useGlobalIgnoreFiles: !fq.disregardGlobalIgnoreFiles,
                useParentIgnoreFiles: !fq.disregardParentIgnoreFiles,
                followSymlinks: !fq.ignoreSymlinks,
                encoding: fq.fileEncoding && this.f.toCanonicalName(fq.fileEncoding),
                maxFileSize: this.d.maxFileSize,
                maxResults: this.d.maxResults,
                previewOptions: this.d.previewOptions,
                afterContext: this.d.afterContext,
                beforeContext: this.d.beforeContext
            };
            options.usePCRE2 = this.d.usePCRE2;
            return options;
        }
    }
    exports.$vcc = $vcc;
    function patternInfoToQuery(patternInfo) {
        return {
            isCaseSensitive: patternInfo.isCaseSensitive || false,
            isRegExp: patternInfo.isRegExp || false,
            isWordMatch: patternInfo.isWordMatch || false,
            isMultiline: patternInfo.isMultiline || false,
            pattern: patternInfo.pattern
        };
    }
    class $wcc {
        constructor(e) {
            this.e = e;
            this.b = -1;
            this.d = null;
            this.a = new $ycc(512, items => this.g(items));
        }
        add(data, folderIdx) {
            // Collects TextSearchResults into IInternalFileMatches and collates using BatchedCollector.
            // This is efficient for ripgrep which sends results back one file at a time. It wouldn't be efficient for other search
            // providers that send results in random order. We could do this step afterwards instead.
            if (this.d && (this.b !== folderIdx || !resources.$bg(this.c, data.uri))) {
                this.f();
                this.d = null;
            }
            if (!this.d) {
                this.b = folderIdx;
                this.d = {
                    resource: data.uri,
                    results: []
                };
            }
            this.d.results.push(extensionResultToFrontendResult(data));
        }
        f() {
            const size = this.d && this.d.results ?
                this.d.results.length :
                0;
            this.a.addItem(this.d, size);
        }
        flush() {
            this.f();
            this.a.flush();
        }
        g(items) {
            this.e(items);
        }
    }
    exports.$wcc = $wcc;
    function extensionResultToFrontendResult(data) {
        // Warning: result from RipgrepTextSearchEH has fake Range. Don't depend on any other props beyond these...
        if ($xcc(data)) {
            return {
                preview: {
                    matches: (0, arrays_1.$Zb)(data.preview.matches, m => ({
                        startLineNumber: m.start.line,
                        startColumn: m.start.character,
                        endLineNumber: m.end.line,
                        endColumn: m.end.character
                    })),
                    text: data.preview.text
                },
                ranges: (0, arrays_1.$Zb)(data.ranges, r => ({
                    startLineNumber: r.start.line,
                    startColumn: r.start.character,
                    endLineNumber: r.end.line,
                    endColumn: r.end.character
                }))
            };
        }
        else {
            return {
                text: data.text,
                lineNumber: data.lineNumber
            };
        }
    }
    function $xcc(data) {
        return !!data.preview;
    }
    exports.$xcc = $xcc;
    /**
     * Collects items that have a size - before the cumulative size of collected items reaches START_BATCH_AFTER_COUNT, the callback is called for every
     * set of items collected.
     * But after that point, the callback is called with batches of maxBatchSize.
     * If the batch isn't filled within some time, the callback is also called.
     */
    class $ycc {
        static { this.a = 4000; }
        // After START_BATCH_AFTER_COUNT items have been collected, stop flushing on timeout
        static { this.b = 50; }
        constructor(g, h) {
            this.g = g;
            this.h = h;
            this.c = 0;
            this.d = [];
            this.e = 0;
        }
        addItem(item, size) {
            if (!item) {
                return;
            }
            this.j(item, size);
        }
        addItems(items, size) {
            if (!items) {
                return;
            }
            this.k(items, size);
        }
        j(item, size) {
            this.d.push(item);
            this.e += size;
            this.l();
        }
        k(item, size) {
            this.d = this.d.concat(item);
            this.e += size;
            this.l();
        }
        l() {
            if (this.c < $ycc.b) {
                // Flush because we aren't batching yet
                this.flush();
            }
            else if (this.e >= this.g) {
                // Flush because the batch is full
                this.flush();
            }
            else if (!this.f) {
                // No timeout running, start a timeout to flush
                this.f = setTimeout(() => {
                    this.flush();
                }, $ycc.a);
            }
        }
        flush() {
            if (this.e) {
                this.c += this.e;
                this.h(this.d);
                this.d = [];
                this.e = 0;
                if (this.f) {
                    clearTimeout(this.f);
                    this.f = 0;
                }
            }
        }
    }
    exports.$ycc = $ycc;
});
//# sourceMappingURL=textSearchManager.js.map