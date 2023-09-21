define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/fileService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/services/search/common/search", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService"], function (require, exports, assert, uri_1, languageConfigurationRegistry_1, model_1, modelService_1, testLanguageConfigurationService_1, configuration_1, testConfigurationService_1, fileService_1, instantiationServiceMock_1, label_1, log_1, themeService_1, testThemeService_1, uriIdentity_1, uriIdentityService_1, workspace_1, testWorkspace_1, searchModel_1, mockLabelService_1, search_1, workbenchTestServices_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_2, notebookEditorServiceImpl_1, searchTestCommon_1, contextkey_1, mockKeybindingService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Search - Viewlet', () => {
        let instantiation;
        setup(() => {
            instantiation = new instantiationServiceMock_1.$L0b();
            instantiation.stub(languageConfigurationRegistry_1.$2t, testLanguageConfigurationService_1.$D0b);
            instantiation.stub(model_1.$yA, stubModelService(instantiation));
            instantiation.stub(notebookEditorService_1.$1rb, stubNotebookEditorService(instantiation));
            instantiation.set(workspace_1.$Kh, new workbenchTestServices_1.$6dc(testWorkspace_1.$$0b));
            instantiation.stub(uriIdentity_1.$Ck, new uriIdentityService_1.$pr(new fileService_1.$Dp(new log_1.$fj())));
            instantiation.stub(label_1.$Vz, new mockLabelService_1.$Ufc());
            instantiation.stub(log_1.$5i, new log_1.$fj());
        });
        teardown(() => {
            instantiation.dispose();
        });
        test('Data Source', function () {
            const result = aSearchResult();
            result.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.$Pfc)()
                    }]
            };
            result.add([{
                    resource: (0, searchTestCommon_1.$Pfc)('/foo'),
                    results: [{
                            preview: {
                                text: 'bar',
                                matches: {
                                    startLineNumber: 0,
                                    startColumn: 0,
                                    endLineNumber: 0,
                                    endColumn: 1
                                }
                            },
                            ranges: {
                                startLineNumber: 1,
                                startColumn: 0,
                                endLineNumber: 1,
                                endColumn: 1
                            }
                        }]
                }], '');
            const fileMatch = result.matches()[0];
            const lineMatch = fileMatch.matches()[0];
            assert.strictEqual(fileMatch.id(), uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/foo`).toString());
            assert.strictEqual(lineMatch.id(), `${uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/foo`).toString()}>[2,1 -> 2,2]b`);
        });
        test('Comparer', () => {
            const fileMatch1 = aFileMatch('/foo');
            const fileMatch2 = aFileMatch('/with/path');
            const fileMatch3 = aFileMatch('/with/path/foo');
            const lineMatch1 = new searchModel_1.$PMb(fileMatch1, ['bar'], new search_1.$vI(0, 1, 1), new search_1.$vI(0, 1, 1));
            const lineMatch2 = new searchModel_1.$PMb(fileMatch1, ['bar'], new search_1.$vI(0, 1, 1), new search_1.$vI(2, 1, 1));
            const lineMatch3 = new searchModel_1.$PMb(fileMatch1, ['bar'], new search_1.$vI(0, 1, 1), new search_1.$vI(2, 1, 1));
            assert((0, searchModel_1.$XMb)(fileMatch1, fileMatch2) < 0);
            assert((0, searchModel_1.$XMb)(fileMatch2, fileMatch1) > 0);
            assert((0, searchModel_1.$XMb)(fileMatch1, fileMatch1) === 0);
            assert((0, searchModel_1.$XMb)(fileMatch2, fileMatch3) < 0);
            assert((0, searchModel_1.$XMb)(lineMatch1, lineMatch2) < 0);
            assert((0, searchModel_1.$XMb)(lineMatch2, lineMatch1) > 0);
            assert((0, searchModel_1.$XMb)(lineMatch2, lineMatch3) === 0);
        });
        test('Advanced Comparer', () => {
            const fileMatch1 = aFileMatch('/with/path/foo10');
            const fileMatch2 = aFileMatch('/with/path2/foo1');
            const fileMatch3 = aFileMatch('/with/path/bar.a');
            const fileMatch4 = aFileMatch('/with/path/bar.b');
            // By default, path < path2
            assert((0, searchModel_1.$XMb)(fileMatch1, fileMatch2) < 0);
            // By filenames, foo10 > foo1
            assert((0, searchModel_1.$XMb)(fileMatch1, fileMatch2, "fileNames" /* SearchSortOrder.FileNames */) > 0);
            // By type, bar.a < bar.b
            assert((0, searchModel_1.$XMb)(fileMatch3, fileMatch4, "type" /* SearchSortOrder.Type */) < 0);
        });
        test('Cross-type Comparer', () => {
            const searchResult = aSearchResult();
            const folderMatch1 = aFolderMatch('/voo', 0, searchResult);
            const folderMatch2 = aFolderMatch('/with', 1, searchResult);
            const fileMatch1 = aFileMatch('/voo/foo.a', folderMatch1);
            const fileMatch2 = aFileMatch('/with/path.c', folderMatch2);
            const fileMatch3 = aFileMatch('/with/path/bar.b', folderMatch2);
            const lineMatch1 = new searchModel_1.$PMb(fileMatch1, ['bar'], new search_1.$vI(0, 1, 1), new search_1.$vI(0, 1, 1));
            const lineMatch2 = new searchModel_1.$PMb(fileMatch1, ['bar'], new search_1.$vI(0, 1, 1), new search_1.$vI(2, 1, 1));
            const lineMatch3 = new searchModel_1.$PMb(fileMatch2, ['barfoo'], new search_1.$vI(0, 1, 1), new search_1.$vI(0, 1, 1));
            const lineMatch4 = new searchModel_1.$PMb(fileMatch2, ['fooooo'], new search_1.$vI(0, 1, 1), new search_1.$vI(2, 1, 1));
            const lineMatch5 = new searchModel_1.$PMb(fileMatch3, ['foobar'], new search_1.$vI(0, 1, 1), new search_1.$vI(2, 1, 1));
            /***
             * Structure would take the following form:
             *
             *	folderMatch1 (voo)
             *		> fileMatch1 (/foo.a)
             *			>> lineMatch1
             *			>> lineMatch2
             *	folderMatch2 (with)
             *		> fileMatch2 (/path.c)
             *			>> lineMatch4
             *			>> lineMatch5
             *		> fileMatch3 (/path/bar.b)
             *			>> lineMatch3
             *
             */
            // for these, refer to diagram above
            assert((0, searchModel_1.$ZMb)(fileMatch1, fileMatch3) < 0);
            assert((0, searchModel_1.$ZMb)(fileMatch2, fileMatch3) < 0);
            assert((0, searchModel_1.$ZMb)(folderMatch2, fileMatch2) < 0);
            assert((0, searchModel_1.$ZMb)(lineMatch4, lineMatch5) < 0);
            assert((0, searchModel_1.$ZMb)(lineMatch1, lineMatch3) < 0);
            assert((0, searchModel_1.$ZMb)(lineMatch2, folderMatch2) < 0);
            // travel up hierarchy and order of folders take precedence. "voo < with" in indices
            assert((0, searchModel_1.$ZMb)(fileMatch1, fileMatch3, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // bar.b < path.c
            assert((0, searchModel_1.$ZMb)(fileMatch3, fileMatch2, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // lineMatch4's parent is fileMatch2, "bar.b < path.c"
            assert((0, searchModel_1.$ZMb)(fileMatch3, lineMatch4, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // bar.b < path.c
            assert((0, searchModel_1.$ZMb)(fileMatch3, fileMatch2, "type" /* SearchSortOrder.Type */) < 0);
            // lineMatch4's parent is fileMatch2, "bar.b < path.c"
            assert((0, searchModel_1.$ZMb)(fileMatch3, lineMatch4, "type" /* SearchSortOrder.Type */) < 0);
        });
        function aFileMatch(path, parentFolder, ...lineMatches) {
            const rawMatch = {
                resource: uri_1.URI.file('/' + path),
                results: lineMatches
            };
            return instantiation.createInstance(searchModel_1.$SMb, {
                pattern: ''
            }, undefined, undefined, parentFolder ?? aFolderMatch('', 0), rawMatch, null, '');
        }
        function aFolderMatch(path, index, parent) {
            const searchModel = instantiation.createInstance(searchModel_1.$2Mb);
            return instantiation.createInstance(searchModel_1.$TMb, (0, searchTestCommon_1.$Pfc)(path), path, index, {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.$Pfc)() }], contentPattern: {
                    pattern: ''
                }
            }, parent ?? aSearchResult().folderMatches()[0], searchModel.searchResult, null);
        }
        function aSearchResult() {
            const searchModel = instantiation.createInstance(searchModel_1.$2Mb);
            searchModel.searchResult.query = {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.$Pfc)() }], contentPattern: {
                    pattern: ''
                }
            };
            return searchModel.searchResult;
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
            const config = new testConfigurationService_1.$G0b();
            config.setUserConfiguration('search', { searchOnType: true });
            instantiationService.stub(configuration_1.$8h, config);
            return instantiationService.createInstance(modelService_1.$4yb);
        }
        function stubNotebookEditorService(instantiationService) {
            instantiationService.stub(editorGroupsService_1.$5C, new workbenchTestServices_2.$Bec());
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(editorService_1.$9C, new workbenchTestServices_2.$Eec());
            return instantiationService.createInstance(notebookEditorServiceImpl_1.$6Eb);
        }
    });
});
//# sourceMappingURL=searchViewlet.test.js.map