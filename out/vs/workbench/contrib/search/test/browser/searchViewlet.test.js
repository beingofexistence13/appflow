define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/fileService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/services/search/common/search", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService"], function (require, exports, assert, uri_1, languageConfigurationRegistry_1, model_1, modelService_1, testLanguageConfigurationService_1, configuration_1, testConfigurationService_1, fileService_1, instantiationServiceMock_1, label_1, log_1, themeService_1, testThemeService_1, uriIdentity_1, uriIdentityService_1, workspace_1, testWorkspace_1, searchModel_1, mockLabelService_1, search_1, workbenchTestServices_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_2, notebookEditorServiceImpl_1, searchTestCommon_1, contextkey_1, mockKeybindingService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Search - Viewlet', () => {
        let instantiation;
        setup(() => {
            instantiation = new instantiationServiceMock_1.TestInstantiationService();
            instantiation.stub(languageConfigurationRegistry_1.ILanguageConfigurationService, testLanguageConfigurationService_1.TestLanguageConfigurationService);
            instantiation.stub(model_1.IModelService, stubModelService(instantiation));
            instantiation.stub(notebookEditorService_1.INotebookEditorService, stubNotebookEditorService(instantiation));
            instantiation.set(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace));
            instantiation.stub(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(new fileService_1.FileService(new log_1.NullLogService())));
            instantiation.stub(label_1.ILabelService, new mockLabelService_1.MockLabelService());
            instantiation.stub(log_1.ILogService, new log_1.NullLogService());
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
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)()
                    }]
            };
            result.add([{
                    resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/foo'),
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
            assert.strictEqual(fileMatch.id(), uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/foo`).toString());
            assert.strictEqual(lineMatch.id(), `${uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/foo`).toString()}>[2,1 -> 2,2]b`);
        });
        test('Comparer', () => {
            const fileMatch1 = aFileMatch('/foo');
            const fileMatch2 = aFileMatch('/with/path');
            const fileMatch3 = aFileMatch('/with/path/foo');
            const lineMatch1 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(0, 1, 1));
            const lineMatch2 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            const lineMatch3 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch2) < 0);
            assert((0, searchModel_1.searchMatchComparer)(fileMatch2, fileMatch1) > 0);
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch1) === 0);
            assert((0, searchModel_1.searchMatchComparer)(fileMatch2, fileMatch3) < 0);
            assert((0, searchModel_1.searchMatchComparer)(lineMatch1, lineMatch2) < 0);
            assert((0, searchModel_1.searchMatchComparer)(lineMatch2, lineMatch1) > 0);
            assert((0, searchModel_1.searchMatchComparer)(lineMatch2, lineMatch3) === 0);
        });
        test('Advanced Comparer', () => {
            const fileMatch1 = aFileMatch('/with/path/foo10');
            const fileMatch2 = aFileMatch('/with/path2/foo1');
            const fileMatch3 = aFileMatch('/with/path/bar.a');
            const fileMatch4 = aFileMatch('/with/path/bar.b');
            // By default, path < path2
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch2) < 0);
            // By filenames, foo10 > foo1
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch2, "fileNames" /* SearchSortOrder.FileNames */) > 0);
            // By type, bar.a < bar.b
            assert((0, searchModel_1.searchMatchComparer)(fileMatch3, fileMatch4, "type" /* SearchSortOrder.Type */) < 0);
        });
        test('Cross-type Comparer', () => {
            const searchResult = aSearchResult();
            const folderMatch1 = aFolderMatch('/voo', 0, searchResult);
            const folderMatch2 = aFolderMatch('/with', 1, searchResult);
            const fileMatch1 = aFileMatch('/voo/foo.a', folderMatch1);
            const fileMatch2 = aFileMatch('/with/path.c', folderMatch2);
            const fileMatch3 = aFileMatch('/with/path/bar.b', folderMatch2);
            const lineMatch1 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(0, 1, 1));
            const lineMatch2 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            const lineMatch3 = new searchModel_1.Match(fileMatch2, ['barfoo'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(0, 1, 1));
            const lineMatch4 = new searchModel_1.Match(fileMatch2, ['fooooo'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            const lineMatch5 = new searchModel_1.Match(fileMatch3, ['foobar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
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
            assert((0, searchModel_1.searchComparer)(fileMatch1, fileMatch3) < 0);
            assert((0, searchModel_1.searchComparer)(fileMatch2, fileMatch3) < 0);
            assert((0, searchModel_1.searchComparer)(folderMatch2, fileMatch2) < 0);
            assert((0, searchModel_1.searchComparer)(lineMatch4, lineMatch5) < 0);
            assert((0, searchModel_1.searchComparer)(lineMatch1, lineMatch3) < 0);
            assert((0, searchModel_1.searchComparer)(lineMatch2, folderMatch2) < 0);
            // travel up hierarchy and order of folders take precedence. "voo < with" in indices
            assert((0, searchModel_1.searchComparer)(fileMatch1, fileMatch3, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // bar.b < path.c
            assert((0, searchModel_1.searchComparer)(fileMatch3, fileMatch2, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // lineMatch4's parent is fileMatch2, "bar.b < path.c"
            assert((0, searchModel_1.searchComparer)(fileMatch3, lineMatch4, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // bar.b < path.c
            assert((0, searchModel_1.searchComparer)(fileMatch3, fileMatch2, "type" /* SearchSortOrder.Type */) < 0);
            // lineMatch4's parent is fileMatch2, "bar.b < path.c"
            assert((0, searchModel_1.searchComparer)(fileMatch3, lineMatch4, "type" /* SearchSortOrder.Type */) < 0);
        });
        function aFileMatch(path, parentFolder, ...lineMatches) {
            const rawMatch = {
                resource: uri_1.URI.file('/' + path),
                results: lineMatches
            };
            return instantiation.createInstance(searchModel_1.FileMatch, {
                pattern: ''
            }, undefined, undefined, parentFolder ?? aFolderMatch('', 0), rawMatch, null, '');
        }
        function aFolderMatch(path, index, parent) {
            const searchModel = instantiation.createInstance(searchModel_1.SearchModel);
            return instantiation.createInstance(searchModel_1.FolderMatch, (0, searchTestCommon_1.createFileUriFromPathFromRoot)(path), path, index, {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            }, parent ?? aSearchResult().folderMatches()[0], searchModel.searchResult, null);
        }
        function aSearchResult() {
            const searchModel = instantiation.createInstance(searchModel_1.SearchModel);
            searchModel.searchResult.query = {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            };
            return searchModel.searchResult;
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            const config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('search', { searchOnType: true });
            instantiationService.stub(configuration_1.IConfigurationService, config);
            return instantiationService.createInstance(modelService_1.ModelService);
        }
        function stubNotebookEditorService(instantiationService) {
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, new workbenchTestServices_2.TestEditorGroupsService());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(editorService_1.IEditorService, new workbenchTestServices_2.TestEditorService());
            return instantiationService.createInstance(notebookEditorServiceImpl_1.NotebookEditorWidgetService);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoVmlld2xldC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL3Rlc3QvYnJvd3Nlci9zZWFyY2hWaWV3bGV0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBbUNBLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsSUFBSSxhQUF1QyxDQUFDO1FBRTVDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixhQUFhLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1lBQy9DLGFBQWEsQ0FBQyxJQUFJLENBQUMsNkRBQTZCLEVBQUUsbUVBQWdDLENBQUMsQ0FBQztZQUNwRixhQUFhLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNuRSxhQUFhLENBQUMsSUFBSSxDQUFDLDhDQUFzQixFQUFFLHlCQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFFckYsYUFBYSxDQUFDLEdBQUcsQ0FBQyxvQ0FBd0IsRUFBRSxJQUFJLDBDQUFrQixDQUFDLDZCQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ25GLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUNBQW1CLEVBQUUsSUFBSSx1Q0FBa0IsQ0FBQyxJQUFJLHlCQUFXLENBQUMsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkcsYUFBYSxDQUFDLElBQUksQ0FBQyxxQkFBYSxFQUFFLElBQUksbUNBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQzFELGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQVcsRUFBRSxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6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TSxDQUFDLElBQUEsaUNBQW1CLEVBQUMsVUFBVSxFQUFFLFVBQVUsb0NBQXVCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1lBRWhDLE1BQU0sWUFBWSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzNELE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRTVELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDMUQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM1RCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFaEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEcsTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEcsTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0csTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0csTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0c7Ozs7Ozs7Ozs7Ozs7O2VBY0c7WUFFSCxvQ0FBb0M7WUFDcEMsTUFBTSxDQUFDLElBQUEsNEJBQWMsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLElBQUEsNEJBQWMsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLElBQUEsNEJBQWMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLElBQUEsNEJBQWMsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLElBQUEsNEJBQWMsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLElBQUEsNEJBQWMsRUFBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7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