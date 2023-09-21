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
    exports.$_Mb = void 0;
    let NotebookDataCache = class NotebookDataCache {
        // private _serializer: INotebookSerializer | undefined;
        constructor(b, c, d, f) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = new map_1.$zi(uri => this.b.extUri.getComparisonKey(uri));
        }
        async g(notebookUri) {
            const registeredEditorInfo = this.f.getEditors(notebookUri);
            const priorityEditorInfo = registeredEditorInfo.reduce((acc, val) => (0, editorResolverService_1.$rbb)(acc.priority) > (0, editorResolverService_1.$rbb)(val.priority) ? acc : val);
            const info = await this.d.withNotebookDataProvider(priorityEditorInfo.id);
            if (!(info instanceof notebookService_1.$vbb)) {
                return undefined;
            }
            return info.serializer;
        }
        async getNotebookData(notebookUri) {
            const mTime = (await this.c.stat(notebookUri)).mtime;
            const entry = this.a.get(notebookUri);
            if (entry && entry.mTime === mTime) {
                return entry.notebookData;
            }
            else {
                let _data = {
                    metadata: {},
                    cells: []
                };
                const content = await this.c.readFileStream(notebookUri);
                const bytes = await (0, buffer_1.$Rd)(content.value);
                const serializer = await this.g(notebookUri);
                if (!serializer) {
                    //unsupported
                    throw new Error(`serializer not initialized`);
                }
                _data = await serializer.dataToNotebook(bytes);
                this.a.set(notebookUri, { notebookData: _data, mTime });
                return _data;
            }
        }
    };
    NotebookDataCache = __decorate([
        __param(0, uriIdentity_1.$Ck),
        __param(1, files_1.$6j),
        __param(2, notebookService_1.$ubb),
        __param(3, editorResolverService_1.$pbb)
    ], NotebookDataCache);
    let $_Mb = class $_Mb {
        constructor(b, c, d, f, g, h, i) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.a = this.b.createInstance(NotebookDataCache);
        }
        async j(includes, token, textQuery) {
            const promises = includes.map(include => {
                const query = {
                    type: 1 /* QueryType.File */,
                    filePattern: include,
                    folderQueries: textQuery.folderQueries,
                    maxResults: textQuery.maxResults,
                };
                return this.h.fileSearch(query, token);
            });
            const result = (await Promise.all(promises)).map(sc => sc.results.map(fm => fm.resource)).flat();
            const uris = new map_1.$Ai(result, uri => this.c.extUri.getComparisonKey(uri));
            return Array.from(uris.keys());
        }
        notebookSearch(query, token, searchInstanceID, onProgress) {
            if (query.type !== 2 /* QueryType.Text */) {
                return {
                    openFilesToScan: new map_1.$Ai(),
                    completeData: Promise.resolve({
                        messages: [],
                        limitHit: false,
                        results: [],
                    }),
                    allScannedFiles: Promise.resolve(new map_1.$Ai()),
                };
            }
            const localNotebookWidgets = this.m();
            const localNotebookFiles = localNotebookWidgets.map(widget => widget.viewModel.uri);
            const getAllResults = () => {
                const searchStart = Date.now();
                const localResultPromise = this.l(query, token ?? cancellation_1.CancellationToken.None, localNotebookWidgets, searchInstanceID);
                const searchLocalEnd = Date.now();
                const experimentalNotebooksEnabled = this.i.getValue('search').experimental?.closedNotebookRichContentResults ?? false;
                let closedResultsPromise = Promise.resolve(undefined);
                if (experimentalNotebooksEnabled) {
                    closedResultsPromise = this.k(query, new map_1.$Ai(localNotebookFiles, uri => this.c.extUri.getComparisonKey(uri)), token ?? cancellation_1.CancellationToken.None);
                }
                const promise = Promise.all([localResultPromise, closedResultsPromise]);
                return {
                    completeData: promise.then(resolvedPromise => {
                        const resolved = resolvedPromise.filter((e) => !!e);
                        const resultArray = resolved.map(elem => elem.results);
                        const results = arrays.$Fb(resultArray.flatMap(map => Array.from(map.values())));
                        if (onProgress) {
                            results.forEach(onProgress);
                        }
                        this.f.trace(`local notebook search time | ${searchLocalEnd - searchStart}ms`);
                        return {
                            messages: [],
                            limitHit: resolved.reduce((prev, cur) => prev || cur.limitHit, false),
                            results,
                        };
                    }),
                    allScannedFiles: promise.then(resolvedPromise => {
                        const resolved = resolvedPromise.filter((e) => !!e);
                        const resultArray = resolved.map(elem => elem.results);
                        return new map_1.$Ai(resultArray.flatMap(map => Array.from(map.keys())), uri => this.c.extUri.getComparisonKey(uri));
                    })
                };
            };
            const promiseResults = getAllResults();
            return {
                openFilesToScan: new map_1.$Ai(localNotebookFiles),
                completeData: promiseResults.completeData,
                allScannedFiles: promiseResults.allScannedFiles
            };
        }
        async k(textQuery, scannedFiles, token) {
            const infoProviders = this.g.getContributedNotebookTypes();
            const includes = infoProviders.flatMap((provider) => {
                return provider.selectors.map((selector) => {
                    const globPattern = selector.include || selector;
                    return globPattern.toString();
                });
            });
            const results = new map_1.$zi(uri => this.c.extUri.getComparisonKey(uri));
            const start = Date.now();
            const filesToScan = await this.j(includes, token, textQuery);
            const deserializedNotebooks = new map_1.$zi();
            const textModels = this.g.getNotebookTextModels();
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
                    const notebook = deserializedNotebooks.get(uri) ?? (await this.a.getNotebookData(uri));
                    const cells = notebook.cells;
                    if (token.isCancellationRequested) {
                        return;
                    }
                    cells.forEach((cell, index) => {
                        const target = textQuery.contentPattern.pattern;
                        const cellModel = cell instanceof notebookCellTextModel_1.$HH ? new searchNotebookHelpers_1.$KMb('', cell.textBuffer, cell.outputs.flatMap(value => value.outputs), uri, index) : new searchNotebookHelpers_1.$KMb(cell.source, undefined, cell.outputs.flatMap(value => value.outputs), uri, index);
                        const inputMatches = cellModel.findInInputs(target);
                        const outputMatches = cellModel.findInOutputs(target);
                        const webviewResults = outputMatches
                            .flatMap(outputMatch => (0, searchNotebookHelpers_1.$HMb)(outputMatch.matches, outputMatch.textBuffer, cellModel))
                            .map((textMatch, index) => {
                            textMatch.webviewIndex = index;
                            return textMatch;
                        });
                        if (inputMatches.length > 0 || outputMatches.length > 0) {
                            const cellMatch = {
                                cell: cellModel,
                                index: index,
                                contentResults: (0, searchNotebookHelpers_1.$GMb)(inputMatches, cellModel),
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
                    this.f.info('error: ' + e);
                    return;
                }
            });
            await Promise.all(promises);
            const end = Date.now();
            this.f.trace(`query: ${textQuery.contentPattern.pattern}`);
            this.f.trace(`closed notebook search time | ${end - start}ms`);
            return {
                results: results,
                limitHit: false
            };
        }
        async l(query, token, widgets, searchID) {
            const localResults = new map_1.$zi(uri => this.c.extUri.getComparisonKey(uri));
            let limitHit = false;
            for (const widget of widgets) {
                if (!widget.viewModel) {
                    continue;
                }
                const askMax = (0, types_1.$nf)(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
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
                        const contentResults = (0, searchNotebookHelpers_1.$GMb)(match.contentMatches, match.cell);
                        const webviewResults = (0, searchNotebookHelpers_1.$IMb)(match.webviewMatches);
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
        m() {
            const notebookWidgets = this.d.retrieveAllExistingWidgets();
            return notebookWidgets
                .map(widget => widget.value)
                .filter((val) => !!val && !!(val.viewModel));
        }
    };
    exports.$_Mb = $_Mb;
    exports.$_Mb = $_Mb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, uriIdentity_1.$Ck),
        __param(2, notebookEditorService_1.$1rb),
        __param(3, log_1.$5i),
        __param(4, notebookService_1.$ubb),
        __param(5, search_1.$oI),
        __param(6, configuration_1.$8h)
    ], $_Mb);
});
//# sourceMappingURL=notebookSearchService.js.map