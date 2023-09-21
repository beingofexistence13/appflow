var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/search/browser/searchNotebookHelpers", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/search/common/search", "vs/base/common/arrays", "vs/base/common/types"], function (require, exports, buffer_1, cancellation_1, map_1, configuration_1, files_1, instantiation_1, log_1, uriIdentity_1, notebookEditorService_1, notebookCellTextModel_1, notebookService_1, searchNotebookHelpers_1, editorResolverService_1, search_1, arrays, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookSearchService = void 0;
    let NotebookDataCache = class NotebookDataCache {
        // private _serializer: INotebookSerializer | undefined;
        constructor(uriIdentityService, fileService, notebookService, editorResolverService) {
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.notebookService = notebookService;
            this.editorResolverService = editorResolverService;
            this._entries = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
        }
        async getSerializer(notebookUri) {
            const registeredEditorInfo = this.editorResolverService.getEditors(notebookUri);
            const priorityEditorInfo = registeredEditorInfo.reduce((acc, val) => (0, editorResolverService_1.priorityToRank)(acc.priority) > (0, editorResolverService_1.priorityToRank)(val.priority) ? acc : val);
            const info = await this.notebookService.withNotebookDataProvider(priorityEditorInfo.id);
            if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
                return undefined;
            }
            return info.serializer;
        }
        async getNotebookData(notebookUri) {
            const mTime = (await this.fileService.stat(notebookUri)).mtime;
            const entry = this._entries.get(notebookUri);
            if (entry && entry.mTime === mTime) {
                return entry.notebookData;
            }
            else {
                let _data = {
                    metadata: {},
                    cells: []
                };
                const content = await this.fileService.readFileStream(notebookUri);
                const bytes = await (0, buffer_1.streamToBuffer)(content.value);
                const serializer = await this.getSerializer(notebookUri);
                if (!serializer) {
                    //unsupported
                    throw new Error(`serializer not initialized`);
                }
                _data = await serializer.dataToNotebook(bytes);
                this._entries.set(notebookUri, { notebookData: _data, mTime });
                return _data;
            }
        }
    };
    NotebookDataCache = __decorate([
        __param(0, uriIdentity_1.IUriIdentityService),
        __param(1, files_1.IFileService),
        __param(2, notebookService_1.INotebookService),
        __param(3, editorResolverService_1.IEditorResolverService)
    ], NotebookDataCache);
    let NotebookSearchService = class NotebookSearchService {
        constructor(instantiationService, uriIdentityService, notebookEditorService, logService, notebookService, searchService, configurationService) {
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this.notebookEditorService = notebookEditorService;
            this.logService = logService;
            this.notebookService = notebookService;
            this.searchService = searchService;
            this.configurationService = configurationService;
            this._notebookDataCache = this.instantiationService.createInstance(NotebookDataCache);
        }
        async runFileQueries(includes, token, textQuery) {
            const promises = includes.map(include => {
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: include,
                    folderQueries: textQuery.folderQueries,
                    maxResults: textQuery.maxResults,
                };
                return this.searchService.fileSearch(query, token);
            });
            const result = (await Promise.all(promises)).map(sc => sc.results.map(fm => fm.resource)).flat();
            const uris = new map_1.ResourceSet(result, uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            return Array.from(uris.keys());
        }
        notebookSearch(query, token, searchInstanceID, onProgress) {
            if (query.type !== 2 /* QueryType.Text */) {
                return {
                    openFilesToScan: new map_1.ResourceSet(),
                    completeData: Promise.resolve({
                        messages: [],
                        limitHit: false,
                        results: [],
                    }),
                    allScannedFiles: Promise.resolve(new map_1.ResourceSet()),
                };
            }
            const localNotebookWidgets = this.getLocalNotebookWidgets();
            const localNotebookFiles = localNotebookWidgets.map(widget => widget.viewModel.uri);
            const getAllResults = () => {
                const searchStart = Date.now();
                const localResultPromise = this.getLocalNotebookResults(query, token ?? cancellation_1.CancellationToken.None, localNotebookWidgets, searchInstanceID);
                const searchLocalEnd = Date.now();
                const experimentalNotebooksEnabled = this.configurationService.getValue('search').experimental?.closedNotebookRichContentResults ?? false;
                let closedResultsPromise = Promise.resolve(undefined);
                if (experimentalNotebooksEnabled) {
                    closedResultsPromise = this.getClosedNotebookResults(query, new map_1.ResourceSet(localNotebookFiles, uri => this.uriIdentityService.extUri.getComparisonKey(uri)), token ?? cancellation_1.CancellationToken.None);
                }
                const promise = Promise.all([localResultPromise, closedResultsPromise]);
                return {
                    completeData: promise.then(resolvedPromise => {
                        const resolved = resolvedPromise.filter((e) => !!e);
                        const resultArray = resolved.map(elem => elem.results);
                        const results = arrays.coalesce(resultArray.flatMap(map => Array.from(map.values())));
                        if (onProgress) {
                            results.forEach(onProgress);
                        }
                        this.logService.trace(`local notebook search time | ${searchLocalEnd - searchStart}ms`);
                        return {
                            messages: [],
                            limitHit: resolved.reduce((prev, cur) => prev || cur.limitHit, false),
                            results,
                        };
                    }),
                    allScannedFiles: promise.then(resolvedPromise => {
                        const resolved = resolvedPromise.filter((e) => !!e);
                        const resultArray = resolved.map(elem => elem.results);
                        return new map_1.ResourceSet(resultArray.flatMap(map => Array.from(map.keys())), uri => this.uriIdentityService.extUri.getComparisonKey(uri));
                    })
                };
            };
            const promiseResults = getAllResults();
            return {
                openFilesToScan: new map_1.ResourceSet(localNotebookFiles),
                completeData: promiseResults.completeData,
                allScannedFiles: promiseResults.allScannedFiles
            };
        }
        async getClosedNotebookResults(textQuery, scannedFiles, token) {
            const infoProviders = this.notebookService.getContributedNotebookTypes();
            const includes = infoProviders.flatMap((provider) => {
                return provider.selectors.map((selector) => {
                    const globPattern = selector.include || selector;
                    return globPattern.toString();
                });
            });
            const results = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            const start = Date.now();
            const filesToScan = await this.runFileQueries(includes, token, textQuery);
            const deserializedNotebooks = new map_1.ResourceMap();
            const textModels = this.notebookService.getNotebookTextModels();
            for (const notebook of textModels) {
                deserializedNotebooks.set(notebook.uri, notebook);
            }
            const promises = filesToScan.map(async (uri) => {
                const cellMatches = [];
                if (scannedFiles.has(uri)) {
                    return;
                }
                try {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    const notebook = deserializedNotebooks.get(uri) ?? (await this._notebookDataCache.getNotebookData(uri));
                    const cells = notebook.cells;
                    if (token.isCancellationRequested) {
                        return;
                    }
                    cells.forEach((cell, index) => {
                        const target = textQuery.contentPattern.pattern;
                        const cellModel = cell instanceof notebookCellTextModel_1.NotebookCellTextModel ? new searchNotebookHelpers_1.CellSearchModel('', cell.textBuffer, cell.outputs.flatMap(value => value.outputs), uri, index) : new searchNotebookHelpers_1.CellSearchModel(cell.source, undefined, cell.outputs.flatMap(value => value.outputs), uri, index);
                        const inputMatches = cellModel.findInInputs(target);
                        const outputMatches = cellModel.findInOutputs(target);
                        const webviewResults = outputMatches
                            .flatMap(outputMatch => (0, searchNotebookHelpers_1.genericCellMatchesToTextSearchMatches)(outputMatch.matches, outputMatch.textBuffer, cellModel))
                            .map((textMatch, index) => {
                            textMatch.webviewIndex = index;
                            return textMatch;
                        });
                        if (inputMatches.length > 0 || outputMatches.length > 0) {
                            const cellMatch = {
                                cell: cellModel,
                                index: index,
                                contentResults: (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(inputMatches, cellModel),
                                webviewResults
                            };
                            cellMatches.push(cellMatch);
                        }
                    });
                    const fileMatch = cellMatches.length > 0 ? {
                        resource: uri, cellResults: cellMatches
                    } : null;
                    results.set(uri, fileMatch);
                    return;
                }
                catch (e) {
                    this.logService.info('error: ' + e);
                    return;
                }
            });
            await Promise.all(promises);
            const end = Date.now();
            this.logService.trace(`query: ${textQuery.contentPattern.pattern}`);
            this.logService.trace(`closed notebook search time | ${end - start}ms`);
            return {
                results: results,
                limitHit: false
            };
        }
        async getLocalNotebookResults(query, token, widgets, searchID) {
            const localResults = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            let limitHit = false;
            for (const widget of widgets) {
                if (!widget.viewModel) {
                    continue;
                }
                const askMax = (0, types_1.isNumber)(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
                let matches = await widget
                    .find(query.contentPattern.pattern, {
                    regex: query.contentPattern.isRegExp,
                    wholeWord: query.contentPattern.isWordMatch,
                    caseSensitive: query.contentPattern.isCaseSensitive,
                    includeMarkupInput: query.contentPattern.notebookInfo?.isInNotebookMarkdownInput ?? true,
                    includeMarkupPreview: query.contentPattern.notebookInfo?.isInNotebookMarkdownPreview ?? true,
                    includeCodeInput: query.contentPattern.notebookInfo?.isInNotebookCellInput ?? true,
                    includeOutput: query.contentPattern.notebookInfo?.isInNotebookCellOutput ?? true,
                }, token, false, true, searchID);
                if (matches.length) {
                    if (askMax && matches.length >= askMax) {
                        limitHit = true;
                        matches = matches.slice(0, askMax - 1);
                    }
                    const cellResults = matches.map(match => {
                        const contentResults = (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(match.contentMatches, match.cell);
                        const webviewResults = (0, searchNotebookHelpers_1.webviewMatchesToTextSearchMatches)(match.webviewMatches);
                        return {
                            cell: match.cell,
                            index: match.index,
                            contentResults: contentResults,
                            webviewResults: webviewResults,
                        };
                    });
                    const fileMatch = {
                        resource: widget.viewModel.uri, cellResults: cellResults
                    };
                    localResults.set(widget.viewModel.uri, fileMatch);
                }
                else {
                    localResults.set(widget.viewModel.uri, null);
                }
            }
            return {
                results: localResults,
                limitHit
            };
        }
        getLocalNotebookWidgets() {
            const notebookWidgets = this.notebookEditorService.retrieveAllExistingWidgets();
            return notebookWidgets
                .map(widget => widget.value)
                .filter((val) => !!val && !!(val.viewModel));
        }
    };
    exports.NotebookSearchService = NotebookSearchService;
    exports.NotebookSearchService = NotebookSearchService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, notebookEditorService_1.INotebookEditorService),
        __param(3, log_1.ILogService),
        __param(4, notebookService_1.INotebookService),
        __param(5, search_1.ISearchService),
        __param(6, configuration_1.IConfigurationService)
    ], NotebookSearchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZWFyY2hTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvbm90ZWJvb2tTZWFyY2hTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFxQ0EsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7UUFFdEIsd0RBQXdEO1FBRXhELFlBQ3VDLGtCQUF1QyxFQUM5QyxXQUF5QixFQUNyQixlQUFpQyxFQUMzQixxQkFBNkM7WUFIaEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNyQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDM0IsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUV0RixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQVcsQ0FBd0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsV0FBZ0I7WUFDM0MsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQ25FLElBQUEsc0NBQWMsRUFBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBQSxzQ0FBYyxFQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ3ZFLENBQUM7WUFDRixNQUFNLElBQUksR0FBRyxNQUFN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