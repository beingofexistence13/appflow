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
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(model_1.$yA, (0, searchTestCommon_1.$Rfc)(instantiationService));
            instantiationService.stub(notebookEditorService_1.$1rb, (0, searchTestCommon_1.$Sfc)(instantiationService));
            instantiationService.stub(keybinding_1.$2D, {});
            instantiationService.stub(label_1.$Vz, { getUriBasenameLabel: (uri) => '' });
            instantiationService.stub(keybinding_1.$2D, 'resolveKeybinding', (keybinding) => usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(keybinding, platform_1.OS));
            instantiationService.stub(keybinding_1.$2D, 'lookupKeybinding', (id) => null);
            instantiationService.stub(keybinding_1.$2D, 'lookupKeybinding', (id) => null);
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
            const actual = (0, searchActionsRemoveReplace_1.$cPb)(tree, target, [target]);
            assert.strictEqual(data[4], actual);
        });
        test('get next element to focus after removing a match when it is the only match', function () {
            const fileMatch1 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1)];
            const tree = aTree(data);
            const target = data[1];
            const actual = (0, searchActionsRemoveReplace_1.$cPb)(tree, target, [target]);
            assert.strictEqual(undefined, actual);
        });
        test('get next element to focus after removing a file match when it has next sibling', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const fileMatch3 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            const tree = aTree(data);
            const target = data[2];
            const actual = (0, searchActionsRemoveReplace_1.$cPb)(tree, target, []);
            assert.strictEqual(data[4], actual);
        });
        test('Find last FileMatch in Tree', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const fileMatch3 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            const tree = aTree(data);
            const actual = (0, searchActionsRemoveReplace_1.$dPb)(tree, fileMatch1);
            assert.strictEqual(fileMatch3, actual);
        });
        test('Find last Match in Tree', function () {
            const fileMatch1 = aFileMatch();
            const fileMatch2 = aFileMatch();
            const fileMatch3 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            const tree = aTree(data);
            const actual = (0, searchActionsRemoveReplace_1.$dPb)(tree, aMatch(fileMatch1));
            assert.strictEqual(data[5], actual);
        });
        test('get next element to focus after removing a file match when it is only match', function () {
            const fileMatch1 = aFileMatch();
            const data = [fileMatch1, aMatch(fileMatch1)];
            const tree = aTree(data);
            const target = data[0];
            // const testObject: ReplaceAction = instantiationService.createInstance(ReplaceAction, tree, target, null);
            const actual = (0, searchActionsRemoveReplace_1.$cPb)(tree, target, []);
            assert.strictEqual(undefined, actual);
        });
        function aFileMatch() {
            const rawMatch = {
                resource: uri_1.URI.file('somepath' + ++counter),
                results: []
            };
            const searchModel = instantiationService.createInstance(searchModel_1.$2Mb);
            const folderMatch = instantiationService.createInstance(searchModel_1.$TMb, uri_1.URI.file('somepath'), '', 0, {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.$Pfc)() }], contentPattern: {
                    pattern: ''
                }
            }, searchModel.searchResult, searchModel.searchResult, null);
            return instantiationService.createInstance(searchModel_1.$SMb, {
                pattern: ''
            }, undefined, undefined, folderMatch, rawMatch, null, '');
        }
        function aMatch(fileMatch) {
            const line = ++counter;
            const match = new searchModel_1.$PMb(fileMatch, ['some match'], {
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
            return new mockSearchTree_1.$Ofc(elements);
        }
    });
});
//# sourceMappingURL=searchActions.test.js.map