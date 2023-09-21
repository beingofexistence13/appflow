/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/common/search"], function (require, exports, arrays_1, async_1, cancellation_1, errorMessage_1, network_1, path, resources, uri_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BatchedCollector = exports.extensionResultIsMatch = exports.TextSearchResultsCollector = exports.TextSearchManager = void 0;
    class TextSearchManager {
        constructor(query, provider, fileUtils, processType) {
            this.query = query;
            this.provider = provider;
            this.fileUtils = fileUtils;
            this.processType = processType;
            this.collector = null;
            this.isLimitHit = false;
            this.resultCount = 0;
        }
        search(onProgress, token) {
            const folderQueries = this.query.folderQueries || [];
            const tokenSource = new cancellation_1.CancellationTokenSource(token);
            return new Promise((resolve, reject) => {
                this.collector = new TextSearchResultsCollector(onProgress);
                let isCanceled = false;
                const onResult = (result, folderIdx) => {
                    if (isCanceled) {
                        return;
                    }
                    if (!this.isLimitHit) {
                        const resultSize = this.resultSize(result);
                        if (extensionResultIsMatch(result) && typeof this.query.maxResults === 'number' && this.resultCount + resultSize > this.query.maxResults) {
                            this.isLimitHit = true;
                            isCanceled = true;
                            tokenSource.cancel();
                            result = this.trimResultToSize(result, this.query.maxResults - this.resultCount);
                        }
                        const newResultSize = this.resultSize(result);
                        this.resultCount += newResultSize;
                        if (newResultSize > 0 || !extensionResultIsMatch(result)) {
                            this.collector.add(result, folderIdx);
                        }
                    }
                };
                // For each root folder
                Promise.all(folderQueries.map((fq, i) => {
                    return this.searchInFolder(fq, r => onResult(r, i), tokenSource.token);
                })).then(results => {
                    tokenSource.dispose();
                    this.collector.flush();
                    const someFolderHitLImit = results.some(result => !!result && !!result.limitHit);
                    resolve({
                        limitHit: this.isLimitHit || someFolderHitLImit,
                        messages: (0, arrays_1.flatten)(results.map(result => {
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
                            type: this.processType
                        }
                    });
                }, (err) => {
                    tokenSource.dispose();
                    const errMsg = (0, errorMessage_1.toErrorMessage)(err);
                    reject(new Error(errMsg));
                });
            });
        }
        resultSize(result) {
            if (extensionResultIsMatch(result)) {
                return Array.isArray(result.ranges) ?
                    result.ranges.length :
                    1;
            }
            else {
                // #104400 context lines shoudn't count towards result count
                return 0;
            }
        }
        trimResultToSize(result, size) {
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
        async searchInFolder(folderQuery, onResult, token) {
            const queryTester = new search_1.QueryGlobTester(this.query, folderQuery);
            const testingPs = [];
            const progress = {
                report: (result) => {
                    if (!this.validateProviderResult(result)) {
                        return;
                    }
                    const hasSibling = folderQuery.folder.scheme === network_1.Schemas.file ?
                        (0, search_1.hasSiblingPromiseFn)(() => {
                            return this.fileUtils.readdir(resources.dirname(result.uri));
                        }) :
                        undefined;
                    const relativePath = resources.relativePath(folderQuery.folder, result.uri);
                    if (relativePath) {
                        // This method is only async when the exclude contains sibling clauses
                        const included = queryTester.includedInQuery(relativePath, path.basename(relativePath), hasSibling);
                        if ((0, async_1.isThenable)(included)) {
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
            const searchOptions = this.getSearchOptionsForFolder(folderQuery);
            const result = await this.provider.provideTextSearchResults(patternInfoToQuery(this.query.contentPattern), searchOptions, progress, token);
            if (testingPs.length) {
                await Promise.all(testingPs);
            }
            return result;
        }
        validateProviderResult(result) {
            if (extensionResultIsMatch(result)) {
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
        getSearchOptionsForFolder(fq) {
            const includes = (0, search_1.resolvePatternsForProvider)(this.query.includePattern, fq.includePattern);
            const excludes = (0, search_1.resolvePatternsForProvider)(this.query.excludePattern, fq.excludePattern);
            const options = {
                folder: uri_1.URI.from(fq.folder),
                excludes,
                includes,
                useIgnoreFiles: !fq.disregardIgnoreFiles,
                useGlobalIgnoreFiles: !fq.disregardGlobalIgnoreFiles,
                useParentIgnoreFiles: !fq.disregardParentIgnoreFiles,
                followSymlinks: !fq.ignoreSymlinks,
                encoding: fq.fileEncoding && this.fileUtils.toCanonicalName(fq.fileEncoding),
                maxFileSize: this.query.maxFileSize,
                maxResults: this.query.maxResults,
                previewOptions: this.query.previewOptions,
                afterContext: this.query.afterContext,
                beforeContext: this.query.beforeContext
            };
            options.usePCRE2 = this.query.usePCRE2;
            return options;
        }
    }
    exports.TextSearchManager = TextSearchManager;
    function patternInfoToQuery(patternInfo) {
        return {
            isCaseSensitive: patternInfo.isCaseSensitive || false,
            isRegExp: patternInfo.isRegExp || false,
            isWordMatch: patternInfo.isWordMatch || false,
            isMultiline: patternInfo.isMultiline || false,
            pattern: patternInfo.pattern
        };
    }
    class TextSearchResultsCollector {
        constructor(_onResult) {
            this._onResult = _onResult;
            this._currentFolderIdx = -1;
            this._currentFileMatch = null;
            this._batchedCollector = new BatchedCollector(512, items => this.sendItems(items));
        }
        add(data, folderIdx) {
            // Collects TextSearchResults into IInternalFileMatches and collates using BatchedCollector.
            // This is efficient for ripgrep which sends results back one file at a time. It wouldn't be efficient for other search
            // providers that send results in random order. We could do this step afterwards instead.
            if (this._currentFileMatch && (this._currentFolderIdx !== folderIdx || !resources.isEqual(this._currentUri, data.uri))) {
                this.pushToCollector();
                this._currentFileMatch = null;
            }
            if (!this._currentFileMatch) {
                this._currentFolderIdx = folderIdx;
                this._currentFileMatch = {
                    resource: data.uri,
                    results: []
                };
            }
            this._currentFileMatch.results.push(extensionResultToFrontendResult(data));
        }
        pushToCollector() {
            const size = this._currentFileMatch && this._currentFileMatch.results ?
                this._currentFileMatch.results.length :
                0;
            this._batchedCollector.addItem(this._currentFileMatch, size);
        }
        flush() {
            this.pushToCollector();
            this._batchedCollector.flush();
        }
        sendItems(items) {
            this._onResult(items);
        }
    }
    exports.TextSearchResultsCollector = TextSearchResultsCollector;
    function extensionResultToFrontendResult(data) {
        // Warning: result from RipgrepTextSearchEH has fake Range. Don't depend on any other props beyond these...
        if (extensionResultIsMatch(data)) {
            return {
                preview: {
                    matches: (0, arrays_1.mapArrayOrNot)(data.preview.matches, m => ({
                        startLineNumber: m.start.line,
                        startColumn: m.start.character,
                        endLineNumber: m.end.line,
                        endColumn: m.end.character
                    })),
                    text: data.preview.text
                },
                ranges: (0, arrays_1.mapArrayOrNot)(data.ranges, r => ({
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
    function extensionResultIsMatch(data) {
        return !!data.preview;
    }
    exports.extensionResultIsMatch = extensionResultIsMatch;
    /**
     * Collects items that have a size - before the cumulative size of collected items reaches START_BATCH_AFTER_COUNT, the callback is called for every
     * set of items collected.
     * But after that point, the callback is called with batches of maxBatchSize.
     * If the batch isn't filled within some time, the callback is also called.
     */
    class BatchedCollector {
        static { this.TIMEOUT = 4000; }
        // After START_BATCH_AFTER_COUNT items have been collected, stop flushing on timeout
        static { this.START_BATCH_AFTER_COUNT = 50; }
        constructor(maxBatchSize, cb) {
            this.maxBatchSize = maxBatchSize;
            this.cb = cb;
            this.totalNumberCompleted = 0;
            this.batch = [];
            this.batchSize = 0;
        }
        addItem(item, size) {
            if (!item) {
                return;
            }
            this.addItemToBatch(item, size);
        }
        addItems(items, size) {
            if (!items) {
                return;
            }
            this.addItemsToBatch(items, size);
        }
        addItemToBatch(item, size) {
            this.batch.push(item);
            this.batchSize += size;
            this.onUpdate();
        }
        addItemsToBatch(item, size) {
            this.batch = this.batch.concat(item);
            this.batchSize += size;
            this.onUpdate();
        }
        onUpdate() {
            if (this.totalNumberCompleted < BatchedCollector.START_BATCH_AFTER_COUNT) {
                // Flush because we aren't batching yet
                this.flush();
            }
            else if (this.batchSize >= this.maxBatchSize) {
                // Flush because the batch is full
                this.flush();
            }
            else if (!this.timeoutHandle) {
                // No timeout running, start a timeout to flush
                this.timeoutHandle = setTimeout(() => {
                    this.flush();
                }, BatchedCollector.TIMEOUT);
            }
        }
        flush() {
            if (this.batchSize) {
                this.totalNumberCompleted += this.batchSize;
                this.cb(this.batch);
                this.batch = [];
                this.batchSize = 0;
                if (this.timeoutHandle) {
                    clearTimeout(this.timeoutHandle);
                    this.timeoutHandle = 0;
                }
            }
        }
    }
    exports.BatchedCollector = BatchedCollector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL2NvbW1vbi90ZXh0U2VhcmNoTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsaUJBQWlCO1FBTzdCLFlBQW9CLEtBQWlCLEVBQVUsUUFBNEIsRUFBVSxTQUFxQixFQUFVLFdBQXFDO1lBQXJJLFVBQUssR0FBTCxLQUFLLENBQVk7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUFVLGNBQVMsR0FBVCxTQUFTLENBQVk7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBMEI7WUFMakosY0FBUyxHQUFzQyxJQUFJLENBQUM7WUFFcEQsZUFBVSxHQUFHLEtBQUssQ0FBQztZQUNuQixnQkFBVyxHQUFHLENBQUMsQ0FBQztRQUVxSSxDQUFDO1FBRTlKLE1BQU0sQ0FBQyxVQUEyQyxFQUFFLEtBQXdCO1lBQzNFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQztZQUNyRCxNQUFNLFdBQVcsR0FBRyxJQUFJLHNDQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXZELE9BQU8sSUFBSSxPQUFPLENBQXVCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM1RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksMEJBQTBCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTVELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDdkIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUF3QixFQUFFLFNBQWlCLEVBQUUsRUFBRTtvQkFDaEUsSUFBSSxVQUFVLEVBQUU7d0JBQ2YsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTt3QkFDckIsTUFB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