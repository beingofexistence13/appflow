define(["require", "exports", "assert", "sinon", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/contrib/search/browser/searchModel", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/label/common/label", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/workbench/contrib/search/browser/searchNotebookHelpers", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/model", "vs/base/common/map", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/search/common/notebookSearch", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService"], function (require, exports, assert, sinon, arrays, async_1, cancellation_1, uri_1, range_1, model_1, modelService_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, search_1, telemetry_1, telemetryUtils_1, searchModel_1, themeService_1, testThemeService_1, fileService_1, log_1, uriIdentity_1, uriIdentityService_1, label_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_1, notebookEditorServiceImpl_1, searchTestCommon_1, searchNotebookHelpers_1, notebookCommon_1, model_2, map_1, notebookService_1, notebookSearch_1, contextkey_1, mockKeybindingService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nullEvent = new class {
        constructor() {
            this.id = -1;
        }
        stop() {
            return;
        }
        timeTaken() {
            return -1;
        }
    };
    const lineOneRange = new search_1.$vI(1, 0, 1);
    suite('SearchModel', () => {
        let instantiationService;
        const testSearchStats = {
            fromCache: false,
            resultCount: 1,
            type: 'searchProcess',
            detailStats: {
                fileWalkTime: 0,
                cmdTime: 0,
                cmdResultCount: 0,
                directoriesWalked: 2,
                filesWalked: 3
            }
        };
        const folderQueries = [
            { folder: (0, searchTestCommon_1.$Pfc)() }
        ];
        setup(() => {
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(label_1.$Vz, { getUriBasenameLabel: (uri) => '' });
            instantiationService.stub(notebookService_1.$ubb, { getNotebookTextModels: () => [] });
            instantiationService.stub(model_1.$yA, stubModelService(instantiationService));
            instantiationService.stub(notebookEditorService_1.$1rb, stubNotebookEditorService(instantiationService));
            instantiationService.stub(search_1.$oI, {});
            instantiationService.stub(search_1.$oI, 'textSearch', Promise.resolve({ results: [] }));
            instantiationService.stub(uriIdentity_1.$Ck, new uriIdentityService_1.$pr(new fileService_1.$Dp(new log_1.$fj())));
            instantiationService.stub(log_1.$5i, new log_1.$fj());
        });
        teardown(() => sinon.restore());
        function searchServiceWithResults(results, complete = null) {
            return {
                textSearch(query, token, onProgress, notebookURIs) {
                    return new Promise(resolve => {
                        queueMicrotask(() => {
                            results.forEach(onProgress);
                            resolve(complete);
                        });
                    });
                },
                fileSearch(query, token) {
                    return new Promise(resolve => {
                        queueMicrotask(() => {
                            resolve({ results: results, messages: [] });
                        });
                    });
                },
                textSearchSplitSyncAsync(query, token, onProgress) {
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: new Promise(resolve => {
                            queueMicrotask(() => {
                                results.forEach(onProgress);
                                resolve(complete);
                            });
                        })
                    };
                }
            };
        }
        function searchServiceWithError(error) {
            return {
                textSearch(query, token, onProgress) {
                    return new Promise((resolve, reject) => {
                        reject(error);
                    });
                },
                fileSearch(query, token) {
                    return new Promise((resolve, reject) => {
                        queueMicrotask(() => {
                            reject(error);
                        });
                    });
                },
                textSearchSplitSyncAsync(query, token, onProgress) {
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: new Promise((resolve, reject) => {
                            reject(error);
                        })
                    };
                }
            };
        }
        function canceleableSearchService(tokenSource) {
            return {
                textSearch(query, token, onProgress) {
                    token?.onCancellationRequested(() => tokenSource.cancel());
                    return this.textSearchSplitSyncAsync(query, token, onProgress).asyncResults;
                },
                fileSearch(query, token) {
                    token?.onCancellationRequested(() => tokenSource.cancel());
                    return new Promise(resolve => {
                        queueMicrotask(() => {
                            resolve({});
                        });
                    });
                },
                textSearchSplitSyncAsync(query, token, onProgress) {
                    token?.onCancellationRequested(() => tokenSource.cancel());
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: new Promise(resolve => {
                            queueMicrotask(() => {
                                resolve({
                                    results: [],
                                    messages: []
                                });
                            });
                        })
                    };
                }
            };
        }
        function searchServiceWithDeferredPromise(p) {
            return {
                textSearchSplitSyncAsync(query, token, onProgress) {
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: p,
                    };
                }
            };
        }
        function notebookSearchServiceWithInfo(results, tokenSource) {
            return {
                _serviceBrand: undefined,
                notebookSearch(query, token, searchInstanceID, onProgress) {
                    token?.onCancellationRequested(() => tokenSource?.cancel());
                    const localResults = new map_1.$zi(uri => uri.path);
                    results.forEach(r => {
                        localResults.set(r.resource, r);
                    });
                    if (onProgress) {
                        arrays.$Fb([...localResults.values()]).forEach(onProgress);
                    }
                    return {
                        openFilesToScan: new map_1.$Ai([...localResults.keys()]),
                        completeData: Promise.resolve({
                            messages: [],
                            results: arrays.$Fb([...localResults.values()]),
                            limitHit: false
                        }),
                        allScannedFiles: Promise.resolve(new map_1.$Ai()),
                    };
                }
            };
        }
        test('Search Model: Search adds to results', async () => {
            const results = [
                aRawMatch('/1', new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)), new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11))),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
            ];
            instantiationService.stub(search_1.$oI, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            await testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            const actual = testObject.searchResult.matches();
            assert.strictEqual(2, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/1`).toString(), actual[0].resource.toString());
            let actuaMatches = actual[0].matches();
            assert.strictEqual(2, actuaMatches.length);
            assert.strictEqual('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.$ks(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.strictEqual('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.$ks(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            actuaMatches = actual[1].matches();
            assert.strictEqual(1, actuaMatches.length);
            assert.strictEqual('preview 2', actuaMatches[0].text());
            assert.ok(new range_1.$ks(2, 1, 2, 2).equalsRange(actuaMatches[0].range()));
        });
        test('Search Model: Search can return notebook results', async () => {
            const results = [
                aRawMatch('/2', new search_1.$tI('test', new search_1.$vI(1, 1, 5)), new search_1.$tI('this is a test', new search_1.$vI(1, 11, 15))),
                aRawMatch('/3', new search_1.$tI('test', lineOneRange))
            ];
            instantiationService.stub(search_1.$oI, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            sinon.stub(searchModel_1.$QMb.prototype, 'addContext');
            const mdInputCell = {
                cellKind: notebookCommon_1.CellKind.Markup, textBuffer: {
                    getLineContent(lineNumber) {
                        if (lineNumber === 1) {
                            return '# Test';
                        }
                        else {
                            return '';
                        }
                    }
                },
                id: 'mdInputCell'
            };
            const findMatchMds = [new model_2.$Bu(new range_1.$ks(1, 3, 1, 7), ['Test'])];
            const codeCell = {
                cellKind: notebookCommon_1.CellKind.Code, textBuffer: {
                    getLineContent(lineNumber) {
                        if (lineNumber === 1) {
                            return 'print("test! testing!!")';
                        }
                        else {
                            return '';
                        }
                    }
                },
                id: 'codeCell'
            };
            const findMatchCodeCells = [new model_2.$Bu(new range_1.$ks(1, 8, 1, 12), ['test']),
                new model_2.$Bu(new range_1.$ks(1, 14, 1, 18), ['test']),
            ];
            const webviewMatches = [{
                    index: 0,
                    searchPreviewInfo: {
                        line: 'test! testing!!',
                        range: {
                            start: 1,
                            end: 5
                        }
                    }
                },
                {
                    index: 1,
                    searchPreviewInfo: {
                        line: 'test! testing!!',
                        range: {
                            start: 7,
                            end: 11
                        }
                    }
                }
            ];
            const cellMatchMd = {
                cell: mdInputCell,
                index: 0,
                contentResults: (0, searchNotebookHelpers_1.$GMb)(findMatchMds, mdInputCell),
                webviewResults: []
            };
            const cellMatchCode = {
                cell: codeCell,
                index: 1,
                contentResults: (0, searchNotebookHelpers_1.$GMb)(findMatchCodeCells, codeCell),
                webviewResults: (0, searchNotebookHelpers_1.$IMb)(webviewMatches),
            };
            const notebookSearchService = instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([aRawMatchWithCells('/1', cellMatchMd, cellMatchCode)], undefined));
            const notebookSearch = sinon.spy(notebookSearchService, "notebookSearch");
            const model = instantiationService.createInstance(searchModel_1.$2Mb);
            await model.search({ contentPattern: { pattern: 'test' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            const actual = model.searchResult.matches();
            assert(notebookSearch.calledOnce);
            assert.strictEqual(3, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/1`).toString(), actual[0].resource.toString());
            const notebookFileMatches = actual[0].matches();
            assert.ok(notebookFileMatches[0].range().equalsRange(new range_1.$ks(1, 3, 1, 7)));
            assert.ok(notebookFileMatches[1].range().equalsRange(new range_1.$ks(1, 8, 1, 12)));
            assert.ok(notebookFileMatches[2].range().equalsRange(new range_1.$ks(1, 14, 1, 18)));
            assert.ok(notebookFileMatches[3].range().equalsRange(new range_1.$ks(1, 2, 1, 6)));
            assert.ok(notebookFileMatches[4].range().equalsRange(new range_1.$ks(1, 8, 1, 12)));
            notebookFileMatches.forEach(match => match instanceof searchModel_1.$RMb);
            // assert(notebookFileMatches[0] instanceof MatchInNotebook);
            assert(notebookFileMatches[0].cell.id === 'mdInputCell');
            assert(notebookFileMatches[1].cell.id === 'codeCell');
            assert(notebookFileMatches[2].cell.id === 'codeCell');
            assert(notebookFileMatches[3].cell.id === 'codeCell');
            assert(notebookFileMatches[4].cell.id === 'codeCell');
            const mdCellMatchProcessed = notebookFileMatches[0].cellParent;
            const codeCellMatchProcessed = notebookFileMatches[1].cellParent;
            assert(mdCellMatchProcessed.contentMatches.length === 1);
            assert(codeCellMatchProcessed.contentMatches.length === 2);
            assert(codeCellMatchProcessed.webviewMatches.length === 2);
            assert(mdCellMatchProcessed.contentMatches[0] === notebookFileMatches[0]);
            assert(codeCellMatchProcessed.contentMatches[0] === notebookFileMatches[1]);
            assert(codeCellMatchProcessed.contentMatches[1] === notebookFileMatches[2]);
            assert(codeCellMatchProcessed.webviewMatches[0] === notebookFileMatches[3]);
            assert(codeCellMatchProcessed.webviewMatches[1] === notebookFileMatches[4]);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/2`).toString(), actual[1].resource.toString());
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/3`).toString(), actual[2].resource.toString());
        });
        test('Search Model: Search reports telemetry on search completed', async () => {
            const target = instantiationService.spy(telemetry_1.$9k, 'publicLog');
            const results = [
                aRawMatch('/1', new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)), new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11))),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
            ];
            instantiationService.stub(search_1.$oI, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            await testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            assert.ok(target.calledThrice);
            assert.ok(target.calledWith('searchResultsFirstRender'));
            assert.ok(target.calledWith('searchResultsFinished'));
        });
        test('Search Model: Search reports timed telemetry on search when progress is not called', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.$9k, 'publicLog', target1);
            instantiationService.stub(search_1.$oI, searchServiceWithResults([], { limitHit: false, messages: [], results: [] }));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            return result.then(() => {
                return (0, async_1.$Hg)(1).then(() => {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                });
            });
        });
        test('Search Model: Search reports timed telemetry on search when progress is called', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.$9k, 'publicLog', target1);
            instantiationService.stub(search_1.$oI, searchServiceWithResults([aRawMatch('/1', new search_1.$tI('some preview', lineOneRange))], { results: [], stats: testSearchStats, messages: [] }));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            return result.then(() => {
                return (0, async_1.$Hg)(1).then(() => {
                    // timeout because promise handlers may run in a different order. We only care that these
                    // are fired at some point.
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.strictEqual(1, target2.callCount);
                });
            });
        });
        test('Search Model: Search reports timed telemetry on search when error is called', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.$9k, 'publicLog', target1);
            instantiationService.stub(search_1.$oI, searchServiceWithError(new Error('This error should be thrown by this test.')));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            return result.then(() => { }, () => {
                return (0, async_1.$Hg)(1).then(() => {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                });
            });
        });
        test('Search Model: Search reports timed telemetry on search when error is cancelled error', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.$9k, 'publicLog', target1);
            const deferredPromise = new async_1.$2g();
            instantiationService.stub(search_1.$oI, searchServiceWithDeferredPromise(deferredPromise.p));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            deferredPromise.cancel();
            return result.then(() => { }, async () => {
                return (0, async_1.$Hg)(1).then(() => {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.ok(target2.calledOnce);
                });
            });
        });
        test('Search Model: Search results are cleared during search', async () => {
            const results = [
                aRawMatch('/1', new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)), new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11))),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
            ];
            instantiationService.stub(search_1.$oI, searchServiceWithResults(results, { limitHit: false, messages: [], results: [] }));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            await testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            assert.ok(!testObject.searchResult.isEmpty());
            instantiationService.stub(search_1.$oI, searchServiceWithResults([]));
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries });
            assert.ok(testObject.searchResult.isEmpty());
        });
        test('Search Model: Previous search is cancelled when new search is called', async () => {
            const tokenSource = new cancellation_1.$pd();
            instantiationService.stub(search_1.$oI, canceleableSearchService(tokenSource));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], tokenSource));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries });
            instantiationService.stub(search_1.$oI, searchServiceWithResults([]));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries });
            assert.ok(tokenSource.token.isCancellationRequested);
        });
        test('getReplaceString returns proper replace string for regExpressions', async () => {
            const results = [
                aRawMatch('/1', new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)), new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11)))
            ];
            instantiationService.stub(search_1.$oI, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            instantiationService.stub(notebookSearch_1.$LMb, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.$2Mb);
            await testObject.search({ contentPattern: { pattern: 're' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            testObject.replaceString = 'hello';
            let match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 're', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 're(?:vi)', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 'r(e)(?:vi)', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 'r(e)(?:vi)', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            testObject.replaceString = 'hello$1';
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('helloe', match.replaceString);
        });
        function aRawMatch(resource, ...results) {
            return { resource: (0, searchTestCommon_1.$Pfc)(resource), results };
        }
        function aRawMatchWithCells(resource, ...cells) {
            return { resource: (0, searchTestCommon_1.$Pfc)(resource), cellResults: cells };
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
            const config = new testConfigurationService_1.$G0b();
            config.setUserConfiguration('search', { searchOnType: true });
            instantiationService.stub(configuration_1.$8h, config);
            return instantiationService.createInstance(modelService_1.$4yb);
        }
        function stubNotebookEditorService(instantiationService) {
            instantiationService.stub(editorGroupsService_1.$5C, new workbenchTestServices_1.$Bec());
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(editorService_1.$9C, new workbenchTestServices_1.$Eec());
            return instantiationService.createInstance(notebookEditorServiceImpl_1.$6Eb);
        }
    });
});
//# sourceMappingURL=searchModel.test.js.map