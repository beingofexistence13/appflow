define(["require", "exports", "assert", "sinon", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/uri", "vs/workbench/services/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelService", "vs/editor/common/services/model", "vs/workbench/contrib/search/browser/replace", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService"], function (require, exports, assert, sinon, instantiationServiceMock_1, searchModel_1, uri_1, search_1, telemetry_1, telemetryUtils_1, range_1, configuration_1, testConfigurationService_1, modelService_1, model_1, replace_1, themeService_1, testThemeService_1, uriIdentity_1, uriIdentityService_1, fileService_1, log_1, label_1, mockLabelService_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_1, notebookEditorServiceImpl_1, notebookCommon_1, searchTestCommon_1, contextkey_1, mockKeybindingService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lineOneRange = new search_1.$vI(1, 0, 1);
    suite('SearchResult', () => {
        let instantiationService;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(model_1.$yA, stubModelService(instantiationService));
            instantiationService.stub(notebookEditorService_1.$1rb, stubNotebookEditorService(instantiationService));
            instantiationService.stub(uriIdentity_1.$Ck, new uriIdentityService_1.$pr(new fileService_1.$Dp(new log_1.$fj())));
            instantiationService.stubPromise(replace_1.$8Mb, {});
            instantiationService.stub(replace_1.$8Mb, 'replace', () => Promise.resolve(null));
            instantiationService.stub(label_1.$Vz, new mockLabelService_1.$Ufc());
            instantiationService.stub(log_1.$5i, new log_1.$fj());
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('Line Match', function () {
            const fileMatch = aFileMatch('folder/file.txt', null);
            const lineMatch = new searchModel_1.$PMb(fileMatch, ['0 foo bar'], new search_1.$vI(0, 2, 5), new search_1.$vI(1, 0, 5));
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
            const fileMatch = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo bar', new search_1.$vI(1, 0, 3)));
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
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo', new search_1.$vI(1, 0, 3)), new search_1.$tI('bar', new search_1.$vI(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.strictEqual(testObject.matches()[0], testObject.getSelectedMatch());
        });
        test('File Match: Select non existing match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo', new search_1.$vI(1, 0, 3)), new search_1.$tI('bar', new search_1.$vI(1, 5, 3)));
            const target = testObject.matches()[0];
            testObject.remove(target);
            testObject.setSelectedMatch(target);
            assert.strictEqual(testObject.getSelectedMatch(), null);
        });
        test('File Match: isSelected return true for selected match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo', new search_1.$vI(1, 0, 3)), new search_1.$tI('bar', new search_1.$vI(1, 5, 3)));
            const target = testObject.matches()[0];
            testObject.setSelectedMatch(target);
            assert.ok(testObject.isMatchSelected(target));
        });
        test('File Match: isSelected return false for un-selected match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo', new search_1.$vI(1, 0, 3)), new search_1.$tI('bar', new search_1.$vI(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.ok(!testObject.isMatchSelected(testObject.matches()[1]));
        });
        test('File Match: unselect', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo', new search_1.$vI(1, 0, 3)), new search_1.$tI('bar', new search_1.$vI(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            testObject.setSelectedMatch(null);
            assert.strictEqual(null, testObject.getSelectedMatch());
        });
        test('File Match: unselect when not selected', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.$tI('foo', new search_1.$vI(1, 0, 3)), new search_1.$tI('bar', new search_1.$vI(1, 5, 3)));
            testObject.setSelectedMatch(null);
            assert.strictEqual(null, testObject.getSelectedMatch());
        });
        test('Match -> FileMatch -> SearchResult hierarchy exists', function () {
            const searchModel = instantiationService.createInstance(searchModel_1.$2Mb);
            const searchResult = instantiationService.createInstance(searchModel_1.$1Mb, searchModel);
            const fileMatch = aFileMatch('far/boo', searchResult);
            const lineMatch = new searchModel_1.$PMb(fileMatch, ['foo bar'], new search_1.$vI(0, 0, 3), new search_1.$vI(1, 0, 3));
            assert(lineMatch.parent() === fileMatch);
            assert(fileMatch.parent() === searchResult.folderMatches()[0]);
        });
        test('Adding a raw match will add a file match with line matches', function () {
            const testObject = aSearchResult();
            const target = [aRawMatch('/1', new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)), new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11)), new search_1.$tI('preview 2', lineOneRange))];
            (0, searchTestCommon_1.$Tfc)(testObject, target);
            assert.strictEqual(3, testObject.count());
            const actual = testObject.matches();
            assert.strictEqual(1, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.$Qfc)()}/1`).toString(), actual[0].resource.toString());
            const actuaMatches = actual[0].matches();
            assert.strictEqual(3, actuaMatches.length);
            assert.strictEqual('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.$ks(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.strictEqual('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.$ks(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            assert.strictEqual('preview 2', actuaMatches[2].text());
            assert.ok(new range_1.$ks(2, 1, 2, 2).equalsRange(actuaMatches[2].range()));
        });
        test('Adding multiple raw matches', function () {
            const testObject = aSearchResult();
            const target = [
                aRawMatch('/1', new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)), new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11))),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
            ];
            (0, searchTestCommon_1.$Tfc)(testObject, target);
            assert.strictEqual(3, testObject.count());
            const actual = testObject.matches();
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
        test('Test that notebook matches get added correctly', function () {
            const testObject = aSearchResult();
            const cell1 = { cellKind: notebookCommon_1.CellKind.Code };
            const cell2 = { cellKind: notebookCommon_1.CellKind.Code };
            sinon.stub(searchModel_1.$QMb.prototype, 'addContext');
            const addFileMatch = sinon.spy(searchModel_1.$TMb.prototype, "addFileMatch");
            const fileMatch1 = aRawFileMatchWithCells('/1', {
                cell: cell1,
                index: 0,
                contentResults: [
                    new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)),
                ],
                webviewResults: [
                    new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11)),
                    new search_1.$tI('preview 2', lineOneRange)
                ]
            });
            const fileMatch2 = aRawFileMatchWithCells('/2', {
                cell: cell2,
                index: 0,
                contentResults: [
                    new search_1.$tI('preview 1', new search_1.$vI(1, 1, 4)),
                ],
                webviewResults: [
                    new search_1.$tI('preview 1', new search_1.$vI(1, 4, 11)),
                    new search_1.$tI('preview 2', lineOneRange)
                ]
            });
            const target = [fileMatch1, fileMatch2];
            (0, searchTestCommon_1.$Tfc)(testObject, target);
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
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
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
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange))
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
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
            ]);
            const arrayToRemove = testObject.matches();
            testObject.onChange(target);
            testObject.remove(arrayToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: arrayToRemove, removed: true }], target.args[0]);
        });
        test('Removing all line matches and adding back will add file back to result', function () {
            const testObject = aSearchResult();
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange))
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
            instantiationService.stub(replace_1.$8Mb, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange))
            ]);
            testObject.replace(testObject.matches()[0]);
            return voidPromise.then(() => assert.ok(testObject.isEmpty()));
        });
        test('replace should trigger the change event', function () {
            const target = sinon.spy();
            const voidPromise = Promise.resolve(null);
            instantiationService.stub(replace_1.$8Mb, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange))
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
            instantiationService.stubPromise(replace_1.$8Mb, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/1', new search_1.$tI('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.$tI('preview 2', lineOneRange))
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
            instantiationService.stub(replace_1.$8Mb, 'replace', (arg) => {
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
            return instantiationService.createInstance(searchModel_1.$SMb, {
                pattern: ''
            }, undefined, undefined, root, rawMatch, null, '');
        }
        function aSearchResult() {
            const searchModel = instantiationService.createInstance(searchModel_1.$2Mb);
            searchModel.searchResult.query = {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.$Pfc)() }], contentPattern: {
                    pattern: ''
                }
            };
            return searchModel.searchResult;
        }
        function aRawMatch(resource, ...results) {
            return { resource: (0, searchTestCommon_1.$Pfc)(resource), results };
        }
        function aRawFileMatchWithCells(resource, ...cellMatches) {
            return {
                resource: (0, searchTestCommon_1.$Pfc)(resource),
                cellResults: cellMatches
            };
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
        function getPopulatedSearchResult() {
            const testObject = aSearchResult();
            testObject.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.$Pfc)('/voo')
                    },
                    { folder: (0, searchTestCommon_1.$Pfc)('/with') },
                ]
            };
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/voo/foo.a', new search_1.$tI('preview 1', lineOneRange), new search_1.$tI('preview 2', lineOneRange)),
                aRawMatch('/with/path/bar.b', new search_1.$tI('preview 3', lineOneRange)),
                aRawMatch('/with/path.c', new search_1.$tI('preview 4', lineOneRange), new search_1.$tI('preview 5', lineOneRange)),
            ]);
            return testObject;
        }
        function getPopulatedSearchResultForTreeTesting() {
            const testObject = aSearchResult();
            testObject.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.$Pfc)('/voo')
                    },
                    {
                        folder: (0, searchTestCommon_1.$Pfc)('/with')
                    },
                    {
                        folder: (0, searchTestCommon_1.$Pfc)('/with/test')
                    },
                    {
                        folder: (0, searchTestCommon_1.$Pfc)('/eep')
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
            (0, searchTestCommon_1.$Tfc)(testObject, [
                aRawMatch('/voo/foo.a', new search_1.$tI('preview 1', lineOneRange), new search_1.$tI('preview 2', lineOneRange)),
                aRawMatch('/voo/beep/foo.c', new search_1.$tI('preview 1', lineOneRange), new search_1.$tI('preview 2', lineOneRange)),
                aRawMatch('/voo/beep/boop.c', new search_1.$tI('preview 3', lineOneRange)),
                aRawMatch('/with/path.c', new search_1.$tI('preview 4', lineOneRange), new search_1.$tI('preview 5', lineOneRange)),
                aRawMatch('/with/path/bar.b', new search_1.$tI('preview 3', lineOneRange)),
                aRawMatch('/with/test/woo.c', new search_1.$tI('preview 3', lineOneRange)),
                aRawMatch('/eep/bar/goo/foo/here.txt', new search_1.$tI('preview 6', lineOneRange), new search_1.$tI('preview 7', lineOneRange)),
                aRawMatch('/eep/bar/goo/ooo/there.txt', new search_1.$tI('preview 6', lineOneRange), new search_1.$tI('preview 7', lineOneRange)),
                aRawMatch('/eep/eyy.y', new search_1.$tI('preview 6', lineOneRange), new search_1.$tI('preview 7', lineOneRange))
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
//# sourceMappingURL=searchResult.test.js.map