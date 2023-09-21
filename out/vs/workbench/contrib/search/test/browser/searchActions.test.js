/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/workbench/contrib/search/browser/searchActionsRemoveReplace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/search/test/browser/mockSearchTree", "vs/platform/label/common/label", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/search/test/browser/searchTestCommon"], function (require, exports, assert, platform_1, uri_1, model_1, instantiationServiceMock_1, keybinding_1, usLayoutResolvedKeybinding_1, searchActionsRemoveReplace_1, searchModel_1, mockSearchTree_1, label_1, notebookEditorService_1, searchTestCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Search Actions', () => {
        let instantiationService;
        let counter;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(model_1.IModelService, (0, searchTestCommon_1.stubModelService)(instantiationService));
            instantiationService.stub(notebookEditorService_1.INotebookEditorService, (0, searchTestCommon_1.stubNotebookEditorService)(instantiationService));
            instantiationService.stub(keybinding_1.IKeybindingService, {});
            instantiationService.stub(label_1.ILabelService, { getUriBasenameLabel: (uri) => '' });
            instantiationService.stub(keybinding_1.IKeybindingService, 'resolveKeybinding', (keybinding) => usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, platform_1.OS));
            instantiationService.stub(keybinding_1.IKeybindingService, 'lookupKeybinding', (id) => null);
            instantiationService.stub(keybinding_1.IKeybindingService, 'lookupKeybinding', (id) => null);
            counter = 0;
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('get next element to focus after removing a match when it has next sibling file', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), aMatch(fileMatch2)];
            const tree = aTree(data);
            const target = data[2];
            const actual = (0, searchActionsRemoveReplace_1.getElementToFocusAfterRemoved)(tree, target, [target]);
            assert.strictEqual(data[4], actual);
        });
        test('get next element to focus after removing a match when it is the only match', function () {
            const fileMatch1 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1)];
            const tree = aTree(data);
            const target = data[1];
            const actual = (0, searchActionsRemoveReplace_1.getElementToFocusAfterRemoved)(tree, target, [target]);
            assert.strictEqual(undefined, actual);
        });
        test('get next element to focus after removing a file match when it has next sibling', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const fileMatch3 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            const tree = aTree(data);
            const target = data[2];
            const actual = (0, searchActionsRemoveReplace_1.getElementToFocusAfterRemoved)(tree, target, []);
            assert.strictEqual(data[4], actual);
        });
        test('Find last FileMatch in Tree', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const fileMatch3 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            const tree = aTree(data);
            const actual = (0, searchActionsRemoveReplace_1.getLastNodeFromSameType)(tree, fileMatch1);
            assert.strictEqual(fileMatch3, actual);
        });
        test('Find last Match in Tree', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const fileMatch3 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            const tree = aTree(data);
            const actual = (0, searchActionsRemoveReplace_1.getLastNodeFromSameType)(tree, aMatch(fileMatch1));
            assert.strictEqual(data[5], actual);
        });
        test('get next element to focus after removing a file match when it is only match', function () {
            const fileMatch1 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1)];
            const tree = aTree(data);
            const target = data[0];
            // const testObject: ReplaceAction = instantiationService.createInstance(ReplaceAction, tree, target, null);
            const actual = (0, searchActionsRemoveReplace_1.getElementToFocusAfterRemoved)(tree, target, []);
            assert.strictEqual(undefined, actual);
        });
        function aFileMatch() {
            const rawMatch = {
                resource: uri_1.URI.file('somepath' + ++counter),
                results: []
            };
            const searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            const folderMatch = instantiationService.createInstance(searchModel_1.FolderMatch, uri_1.URI.file('somepath'), '', 0, {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            }, searchModel.searchResult, searchModel.searchResult, null);
            return instantiationService.createInstance(searchModel_1.FileMatch, {
                pattern: ''
            }, undefined, undefined, folderMatch, rawMatch, null, '');
        }
        function aMatch(fileMatch) {
            const line = ++counter;
            const match = new searchModel_1.Match(fileMatch, ['some match'], {
                startLineNumber: 0,
                startColumn: 0,
                endLineNumber: 0,
                endColumn: 2
            }, {
                startLineNumber: line,
                startColumn: 0,
                endLineNumber: line,
                endColumn: 2
            });
            fileMatch.add(match);
            return match;
        }
        function aTree(elements) {
            return new mockSearchTree_1.MockObjectTree(elements);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9ucy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL3Rlc3QvYnJvd3Nlci9zZWFyY2hBY3Rpb25zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFrQmhHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFFNUIsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLE9BQWUsQ0FBQztRQUVwQixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysb0JBQW9CLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1lBQ3RELG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQkFBYSxFQUFFLElBQUEsbUNBQWdCLEVBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLG9CQUFvQixDQUFDLElBQUksQ0FBQyw4Q0FBc0IsRUFBRSxJQUFBLDRDQUF5QixFQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNuRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsK0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwRixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsK0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxVQUFzQixFQUFFLEVBQUUsQ0FBQyx1REFBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsYUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3SixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsK0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hGLG9C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