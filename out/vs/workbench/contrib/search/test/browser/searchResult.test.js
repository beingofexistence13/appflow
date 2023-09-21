define(["require", "exports", "assert", "sinon", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/uri", "vs/workbench/services/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelService", "vs/editor/common/services/model", "vs/workbench/contrib/search/browser/replace", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService"], function (require, exports, assert, sinon, instantiationServiceMock_1, searchModel_1, uri_1, search_1, telemetry_1, telemetryUtils_1, range_1, configuration_1, testConfigurationService_1, modelService_1, model_1, replace_1, themeService_1, testThemeService_1, uriIdentity_1, uriIdentityService_1, fileService_1, log_1, label_1, mockLabelService_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_1, notebookEditorServiceImpl_1, notebookCommon_1, searchTestCommon_1, contextkey_1, mockKeybindingService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lineOneRange = new search_1.OneLineRange(1, 0, 1);
    suite('SearchResult', () => {
        let instantiationService;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(model_1.IModelService, stubModelService(instantiationService));
            instantiationService.stub(notebookEditorService_1.INotebookEditorService, stubNotebookEditorService(instantiationService));
            instantiationService.stub(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(new fileService_1.FileService(new log_1.NullLogService())));
            instantiationService.stubPromise(replace_1.IReplaceService, {});
            instantiationService.stub(replace_1.IReplaceService, 'replace', () => Promise.resolve(null));
            instantiationService.stub(label_1.ILabelService, new mockLabelService_1.MockLabelService());
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('Line Match', function () {
            const fileMatch = aFileMatch('folder/file.txt', null);
            const lineMatch = new searchModel_1.Match(fileMatch, ['0 foo bar'], new search_1.OneLineRange(0, 2, 5), new search_1.OneLineRange(1, 0, 5));
            assert.strictEqual(lineMatch.text(), '0 foo bar');
            assert.strictEqual(lineMatch.range().startLineNumber, 2);
            assert.strictEqual(lineMatch.range().endLineNumber, 2);
            assert.strictEqual(lineMatch.range().startColumn, 1);
            assert.strictEqual(lineMatch.range().endColumn, 6);
            assert.strictEqual(lineMatch.id(), 'file:///folder/file.txt>[2,1 -> 2,6]foo');
            assert.strictEqual(lineMatch.fullMatchText(), 'foo');
            assert.strictEqual(lineMatch.fullMatchText(true), '0 foo bar');
        });
        test('Line Match - Remove', function () {
            const fileMatch = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo bar', new search_1.OneLineRange(1, 0, 3)));
            const lineMatch = fileMatch.matches()[0];
            fileMatch.remove(lineMatch);
            assert.strictEqual(fileMatch.matches().length, 0);
        });
        test('File Match', function () {
            let fileMatch = aFileMatch('folder/file.txt', aSearchResult());
            assert.strictEqual(fileMatch.matches().length, 0);
            assert.strictEqual(fileMatch.resource.toString(), 'file:///folder/file.txt');
            assert.strictEqual(fileMatch.name(), 'file.txt');
            fileMatch = aFileMatch('file.txt', aSearchResult());
            assert.strictEqual(fileMatch.matches().length, 0);
            assert.strictEqual(fileMatch.resource.toString(), 'file:///file.txt');
            assert.strictEqual(fileMatch.name(), 'file.txt');
        });
        test('File Match: Select an existing match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.strictEqual(testObject.matches()[0], testObject.getSelectedMatch());
        });
        test('File Match: Select non existing match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            const target = testObject.matches()[0];
            testObject.remove(target);
            testObject.setSelectedMatch(target);
            assert.strictEqual(testObject.getSelectedMatch(), null);
        });
        test('File Match: isSelected return true for selected match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            const target = testObject.matches()[0];
            testObject.setSelectedMatch(target);
            assert.ok(testObject.isMatchSelected(target));
        });
        test('File Match: isSelected return false for un-selected match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.ok(!testObject.isMatchSelected(testObject.matches()[1]));
        });
        test('File Match: unselect', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            testObject.setSelectedMatch(null);
            assert.strictEqual(null, testObject.getSelectedMatch());
        });
        test('File Match: unselect when not selected', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(null);
            assert.strictEqual(null, testObject.getSelectedMatch());
        });
        test('Match -> FileMatch -> SearchResult hierarchy exists', function () {
            const searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            const searchResult = instantiationService.createInstance(searchModel_1.SearchResult, searchModel);
            const fileMatch = aFileMatch('far/boo', searchResult);
            const lineMatch = new searchModel_1.Match(fileMatch, ['foo bar'], new search_1.OneLineRange(0, 0, 3), new search_1.OneLineRange(1, 0, 3));
            assert(lineMatch.parent() === fileMatch);
            assert(fileMatch.parent() === searchResult.folderMatches()[0]);
        });
        test('Adding a raw match will add a file match with line matches', function () {
            const testObject = aSearchResult();
            const target = [aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)), new search_1.TextSearchMatch('preview 2', lineOneRange))];
            (0, searchTestCommon_1.addToSearchResult)(testObject, target);
            assert.strictEqual(3, testObject.count());
            const actual = testObject.matches();
            assert.strictEqual(1, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/1`).toString(), actual[0].resource.toString());
            const actuaMatches = actual[0].matches();
            assert.strictEqual(3, actuaMatches.length);
            assert.strictEqual('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.strictEqual('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            assert.strictEqual('preview 2', actuaMatches[2].text());
            assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[2].range()));
        });
        test('Adding multiple raw matches', function () {
            const testObject = aSearchResult();
            const target = [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11))),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ];
            (0, searchTestCommon_1.addToSearchResult)(testObject, target);
            assert.strictEqual(3, testObject.count());
            const actual = testObject.matches();
            assert.strictEqual(2, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/1`).toString(), actual[0].resource.toString());
            let actuaMatches = actual[0].matches();
            assert.strictEqual(2, actuaMatches.length);
            assert.strictEqual('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.strictEqual('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            actuaMatches = actual[1].matches();
            assert.strictEqual(1, actuaMatches.length);
            assert.strictEqual('preview 2', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[0].range()));
        });
        test('Test that notebook matches get added correctly', function () {
            const testObject = aSearchResult();
            const cell1 = { cellKind: notebookCommon_1.CellKind.Code };
            const cell2 = { cellKind: notebookCommon_1.CellKind.Code };
            sinon.stub(searchModel_1.CellMatch.prototype, 'addContext');
            const addFileMatch = sinon.spy(searchModel_1.FolderMatch.prototype, "addFileMatch");
            const fileMatch1 = aRawFileMatchWithCells('/1', {
                cell: cell1,
                index: 0,
                contentResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)),
                ],
                webviewResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)),
                    new search_1.TextSearchMatch('preview 2', lineOneRange)
                ]
            });
            const fileMatch2 = aRawFileMatchWithCells('/2', {
                cell: cell2,
                index: 0,
                contentResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)),
                ],
                webviewResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)),
                    new search_1.TextSearchMatch('preview 2', lineOneRange)
                ]
            });
            const target = [fileMatch1, fileMatch2];
            (0, searchTestCommon_1.addToSearchResult)(testObject, target);
            assert.strictEqual(6, testObject.count());
            assert.deepStrictEqual(fileMatch1.cellResults[0].contentResults, addFileMatch.getCall(0).args[0][0].cellResults[0].contentResults);
            assert.deepStrictEqual(fileMatch1.cellResults[0].webviewResults, addFileMatch.getCall(0).args[0][0].cellResults[0].webviewResults);
            assert.deepStrictEqual(fileMatch2.cellResults[0].contentResults, addFileMatch.getCall(0).args[0][1].cellResults[0].contentResults);
            assert.deepStrictEqual(fileMatch2.cellResults[0].webviewResults, addFileMatch.getCall(0).args[0][1].cellResults[0].webviewResults);
        });
        test('Dispose disposes matches', function () {
            const target1 = sinon.spy();
            const target2 = sinon.spy();
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ]);
            testObject.matches()[0].onDispose(target1);
            testObject.matches()[1].onDispose(target2);
            testObject.dispose();
            assert.ok(testObject.isEmpty());
            assert.ok(target1.calledOnce);
            assert.ok(target2.calledOnce);
        });
        test('remove triggers change event', function () {
            const target = sinon.spy();
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            const objectToRemove = testObject.matches()[0];
            testObject.onChange(target);
            testObject.remove(objectToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: [objectToRemove], removed: true }], target.args[0]);
        });
        test('remove array triggers change event', function () {
            const target = sinon.spy();
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ]);
            const arrayToRemove = testObject.matches();
            testObject.onChange(target);
            testObject.remove(arrayToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: arrayToRemove, removed: true }], target.args[0]);
        });
        test('Removing all line matches and adding back will add file back to result', function () {
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            const target = testObject.matches()[0];
            const matchToRemove = target.matches()[0];
            target.remove(matchToRemove);
            assert.ok(testObject.isEmpty());
            target.add(matchToRemove, true);
            assert.strictEqual(1, testObject.fileCount());
            assert.strictEqual(target, testObject.matches()[0]);
        });
        test('replace should remove the file match', function () {
            const voidPromise = Promise.resolve(null);
            instantiationService.stub(replace_1.IReplaceService, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            testObject.replace(testObject.matches()[0]);
            return voidPromise.then(() => assert.ok(testObject.isEmpty()));
        });
        test('replace should trigger the change event', function () {
            const target = sinon.spy();
            const voidPromise = Promise.resolve(null);
            instantiationService.stub(replace_1.IReplaceService, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            testObject.onChange(target);
            const objectToRemove = testObject.matches()[0];
            testObject.replace(objectToRemove);
            return voidPromise.then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual([{ elements: [objectToRemove], removed: true }], target.args[0]);
            });
        });
        test('replaceAll should remove all file matches', function () {
            const voidPromise = Promise.resolve(null);
            instantiationService.stubPromise(replace_1.IReplaceService, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ]);
            testObject.replaceAll(null);
            return voidPromise.then(() => assert.ok(testObject.isEmpty()));
        });
        test('batchRemove should trigger the onChange event correctly', function () {
            const target = sinon.spy();
            const testObject = getPopulatedSearchResult();
            const folderMatch = testObject.folderMatches()[0];
            const fileMatch = testObject.folderMatches()[1].allDownstreamFileMatches()[0];
            const match = testObject.folderMatches()[1].allDownstreamFileMatches()[1].matches()[0];
            const arrayToRemove = [folderMatch, fileMatch, match];
            const expectedArrayResult = folderMatch.allDownstreamFileMatches().concat([fileMatch, match.parent()]);
            testObject.onChange(target);
            testObject.batchRemove(arrayToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: expectedArrayResult, removed: true, added: false }], target.args[0]);
        });
        test('batchReplace should trigger the onChange event correctly', async function () {
            const replaceSpy = sinon.spy();
            instantiationService.stub(replace_1.IReplaceService, 'replace', (arg) => {
                if (Array.isArray(arg)) {
                    replaceSpy(arg[0]);
                }
                else {
                    replaceSpy(arg);
                }
                return Promise.resolve();
            });
            const target = sinon.spy();
            const testObject = getPopulatedSearchResult();
            const folderMatch = testObject.folderMatches()[0];
            const fileMatch = testObject.folderMatches()[1].allDownstreamFileMatches()[0];
            const match = testObject.folderMatches()[1].allDownstreamFileMatches()[1].matches()[0];
            const firstExpectedMatch = folderMatch.allDownstreamFileMatches()[0];
            const arrayToRemove = [folderMatch, fileMatch, match];
            testObject.onChange(target);
            await testObject.batchReplace(arrayToRemove);
            assert.ok(target.calledOnce);
            sinon.assert.calledThrice(replaceSpy);
            sinon.assert.calledWith(replaceSpy.firstCall, firstExpectedMatch);
            sinon.assert.calledWith(replaceSpy.secondCall, fileMatch);
            sinon.assert.calledWith(replaceSpy.thirdCall, match);
        });
        test('Creating a model with nested folders should create the correct structure', function () {
            const testObject = getPopulatedSearchResultForTreeTesting();
            const root0 = testObject.folderMatches()[0];
            const root1 = testObject.folderMatches()[1];
            const root2 = testObject.folderMatches()[2];
            const root3 = testObject.folderMatches()[3];
            const root0DownstreamFiles = root0.allDownstreamFileMatches();
            assert.deepStrictEqual(root0DownstreamFiles, [...root0.fileMatchesIterator(), ...getFolderMatchAtIndex(root0, 0).fileMatchesIterator()]);
            assert.deepStrictEqual(getFolderMatchAtIndex(root0, 0).allDownstreamFileMatches(), Array.from(getFolderMatchAtIndex(root0, 0).fileMatchesIterator()));
            assert.deepStrictEqual(getFileMatchAtIndex(getFolderMatchAtIndex(root0, 0), 0).parent(), getFolderMatchAtIndex(root0, 0));
            assert.deepStrictEqual(getFolderMatchAtIndex(root0, 0).parent(), root0);
            assert.deepStrictEqual(getFolderMatchAtIndex(root0, 0).closestRoot, root0);
            root0DownstreamFiles.forEach((e) => {
                assert.deepStrictEqual(e.closestRoot, root0);
            });
            const root1DownstreamFiles = root1.allDownstreamFileMatches();
            assert.deepStrictEqual(root1.allDownstreamFileMatches(), [...root1.fileMatchesIterator(), ...getFolderMatchAtIndex(root1, 0).fileMatchesIterator()]); // excludes the matches from nested root
            assert.deepStrictEqual(getFileMatchAtIndex(getFolderMatchAtIndex(root1, 0), 0).parent(), getFolderMatchAtIndex(root1, 0));
            root1DownstreamFiles.forEach((e) => {
                assert.deepStrictEqual(e.closestRoot, root1);
            });
            const root2DownstreamFiles = root2.allDownstreamFileMatches();
            assert.deepStrictEqual(root2DownstreamFiles, Array.from(root2.fileMatchesIterator()));
            assert.deepStrictEqual(getFileMatchAtIndex(root2, 0).parent(), root2);
            assert.deepStrictEqual(getFileMatchAtIndex(root2, 0).closestRoot, root2);
            const root3DownstreamFiles = root3.allDownstreamFileMatches();
            const root3Level3Folder = getFolderMatchAtIndex(getFolderMatchAtIndex(root3, 0), 0);
            assert.deepStrictEqual(root3DownstreamFiles, [...root3.fileMatchesIterator(), ...getFolderMatchAtIndex(root3Level3Folder, 0).fileMatchesIterator(), ...getFolderMatchAtIndex(root3Level3Folder, 1).fileMatchesIterator()].flat());
            assert.deepStrictEqual(root3Level3Folder.allDownstreamFileMatches(), getFolderMatchAtIndex(root3, 0).allDownstreamFileMatches());
            assert.deepStrictEqual(getFileMatchAtIndex(getFolderMatchAtIndex(root3Level3Folder, 1), 0).parent(), getFolderMatchAtIndex(root3Level3Folder, 1));
            assert.deepStrictEqual(getFolderMatchAtIndex(root3Level3Folder, 1).parent(), root3Level3Folder);
            assert.deepStrictEqual(root3Level3Folder.parent(), getFolderMatchAtIndex(root3, 0));
            root3DownstreamFiles.forEach((e) => {
                assert.deepStrictEqual(e.closestRoot, root3);
            });
        });
        test('Removing an intermediate folder should call OnChange() on all downstream file matches', function () {
            const target = sinon.spy();
            const testObject = getPopulatedSearchResultForTreeTesting();
            const folderMatch = getFolderMatchAtIndex(getFolderMatchAtIndex(getFolderMatchAtIndex(testObject.folderMatches()[3], 0), 0), 0);
            const expectedArrayResult = folderMatch.allDownstreamFileMatches();
            testObject.onChange(target);
            testObject.remove(folderMatch);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: expectedArrayResult, removed: true, added: false, clearingAll: false }], target.args[0]);
        });
        test('Replacing an intermediate folder should remove all downstream folders and file matches', async function () {
            const target = sinon.spy();
            const testObject = getPopulatedSearchResultForTreeTesting();
            const folderMatch = getFolderMatchAtIndex(testObject.folderMatches()[3], 0);
            const expectedArrayResult = folderMatch.allDownstreamFileMatches();
            testObject.onChange(target);
            await testObject.batchReplace([folderMatch]);
            assert.deepStrictEqual([{ elements: expectedArrayResult, removed: true, added: false }], target.args[0]);
        });
        function aFileMatch(path, searchResult, ...lineMatches) {
            if (!searchResult) {
                searchResult = aSearchResult();
            }
            const rawMatch = {
                resource: uri_1.URI.file('/' + path),
                results: lineMatches
            };
            const root = searchResult?.folderMatches()[0];
            return instantiationService.createInstance(searchModel_1.FileMatch, {
                pattern: ''
            }, undefined, undefined, root, rawMatch, null, '');
        }
        function aSearchResult() {
            const searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            searchModel.searchResult.query = {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            };
            return searchModel.searchResult;
        }
        function aRawMatch(resource, ...results) {
            return { resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)(resource), results };
        }
        function aRawFileMatchWithCells(resource, ...cellMatches) {
            return {
                resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)(resource),
                cellResults: cellMatches
            };
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            const config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('search', { searchOnType: true });
            instantiationService.stub(configuration_1.IConfigurationService, config);
            return instantiationService.createInstance(modelService_1.ModelService);
        }
        function stubNotebookEditorService(instantiationService) {
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, new workbenchTestServices_1.TestEditorGroupsService());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(editorService_1.IEditorService, new workbenchTestServices_1.TestEditorService());
            return instantiationService.createInstance(notebookEditorServiceImpl_1.NotebookEditorWidgetService);
        }
        function getPopulatedSearchResult() {
            const testObject = aSearchResult();
            testObject.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/voo')
                    },
                    { folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/with') },
                ]
            };
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/voo/foo.a', new search_1.TextSearchMatch('preview 1', lineOneRange), new search_1.TextSearchMatch('preview 2', lineOneRange)),
                aRawMatch('/with/path/bar.b', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/with/path.c', new search_1.TextSearchMatch('preview 4', lineOneRange), new search_1.TextSearchMatch('preview 5', lineOneRange)),
            ]);
            return testObject;
        }
        function getPopulatedSearchResultForTreeTesting() {
            const testObject = aSearchResult();
            testObject.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/voo')
                    },
                    {
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/with')
                    },
                    {
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/with/test')
                    },
                    {
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/eep')
                    },
                ]
            };
            /***
             * file structure looks like:
             * *voo/
             * |- foo.a
             * |- beep
             *    |- foo.c
             * 	  |- boop.c
             * *with/
             * |- path
             *    |- bar.b
             * |- path.c
             * |- *test/
             *    |- woo.c
             * eep/
             *    |- bar
             *       |- goo
             *           |- foo
             *              |- here.txt
             * 			 |- ooo
             *              |- there.txt
             *    |- eyy.y
             */
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/voo/foo.a', new search_1.TextSearchMatch('preview 1', lineOneRange), new search_1.TextSearchMatch('preview 2', lineOneRange)),
                aRawMatch('/voo/beep/foo.c', new search_1.TextSearchMatch('preview 1', lineOneRange), new search_1.TextSearchMatch('preview 2', lineOneRange)),
                aRawMatch('/voo/beep/boop.c', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/with/path.c', new search_1.TextSearchMatch('preview 4', lineOneRange), new search_1.TextSearchMatch('preview 5', lineOneRange)),
                aRawMatch('/with/path/bar.b', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/with/test/woo.c', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/eep/bar/goo/foo/here.txt', new search_1.TextSearchMatch('preview 6', lineOneRange), new search_1.TextSearchMatch('preview 7', lineOneRange)),
                aRawMatch('/eep/bar/goo/ooo/there.txt', new search_1.TextSearchMatch('preview 6', lineOneRange), new search_1.TextSearchMatch('preview 7', lineOneRange)),
                aRawMatch('/eep/eyy.y', new search_1.TextSearchMatch('preview 6', lineOneRange), new search_1.TextSearchMatch('preview 7', lineOneRange))
            ]);
            return testObject;
        }
        function getFolderMatchAtIndex(parent, index) {
            return Array.from(parent.folderMatchesIterator())[index];
        }
        function getFileMatchAtIndex(parent, index) {
            return Array.from(parent.fileMatchesIterator())[index];
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoUmVzdWx0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvdGVzdC9icm93c2VyL3NlYXJjaFJlc3VsdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQXNDQSxNQUFNLFlBQVksR0FBRyxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUvQyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtRQUUxQixJQUFJLG9CQUE4QyxDQUFDO1FBRW5ELEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDdEQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDZCQUFpQixFQUFFLHFDQUFvQixDQUFDLENBQUM7WUFDbkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLG9CQUFvQixDQUFDLElBQUksQ0FBQyw4Q0FBc0IsRUFBRSx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDbkcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlDQUFtQixFQUFFLElBQUksdUNBQWtCLENBQUMsSUFBSSx5QkFBVyxDQUFDLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyx5QkFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELG9CQUFvQixDQUFDLElBQUksQ0FBQyx5QkFBZSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsSUFB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