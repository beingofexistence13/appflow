/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/platform", "vs/base/test/common/utils", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/contrib/find/browser/findController", "vs/editor/contrib/find/browser/findModel", "vs/editor/test/browser/testCodeEditor", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage"], function (require, exports, assert, async_1, platform, utils_1, editOperation_1, position_1, range_1, selection_1, findController_1, findModel_1, testCodeEditor_1, clipboardService_1, contextkey_1, serviceCollection_1, notification_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let TestFindController = class TestFindController extends findController_1.$W7 {
        constructor(editor, contextKeyService, storageService, clipboardService, notificationService) {
            super(editor, contextKeyService, storageService, clipboardService, notificationService);
            this.delayUpdateHistory = false;
            this.y = findModel_1.$A7.bindTo(contextKeyService);
            this.f = new async_1.$Dg(50);
            this.hasFocus = false;
        }
        async w(opts) {
            await super.w(opts);
            if (opts.shouldFocus !== 0 /* FindStartFocusAction.NoFocusChange */) {
                this.hasFocus = true;
            }
            const inputFocused = opts.shouldFocus === 1 /* FindStartFocusAction.FocusFindInput */;
            this.y.set(inputFocused);
        }
    };
    TestFindController = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, storage_1.$Vo),
        __param(3, clipboardService_1.$UZ),
        __param(4, notification_1.$Yu)
    ], TestFindController);
    function fromSelection(slc) {
        return [slc.startLineNumber, slc.startColumn, slc.endLineNumber, slc.endColumn];
    }
    function executeAction(instantiationService, editor, action, args) {
        return instantiationService.invokeFunction((accessor) => {
            return Promise.resolve(action.runEditorCommand(accessor, editor, args));
        });
    }
    suite('FindController', () => {
        (0, utils_1.$bT)();
        let clipboardState = '';
        const serviceCollection = new serviceCollection_1.$zh();
        serviceCollection.set(storage_1.$Vo, new storage_1.$Zo());
        if (platform.$j) {
            serviceCollection.set(clipboardService_1.$UZ, {
                readFindText: () => clipboardState,
                writeFindText: (value) => { clipboardState = value; }
            });
        }
        /* test('stores to the global clipboard buffer on start find action', async () => {
            await withAsyncTestCodeEditor([
                'ABC',
                'ABC',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                if (!platform.isMacintosh) {
                    assert.ok(true);
                    return;
                }
                let findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                let startFindAction = new StartFindAction();
                // I select ABC on the first line
                editor.setSelection(new Selection(1, 1, 1, 4));
                // I hit Ctrl+F to show the Find dialog
                startFindAction.run(null, editor);
    
                assert.deepStrictEqual(findController.getGlobalBufferTerm(), findController.getState().searchString);
                findController.dispose();
            });
        });
    
        test('reads from the global clipboard buffer on next find action if buffer exists', async () => {
            await withAsyncTestCodeEditor([
                'ABC',
                'ABC',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = 'ABC';
    
                if (!platform.isMacintosh) {
                    assert.ok(true);
                    return;
                }
    
                let findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                let findState = findController.getState();
                let nextMatchFindAction = new NextMatchFindAction();
    
                nextMatchFindAction.run(null, editor);
                assert.strictEqual(findState.searchString, 'ABC');
    
                assert.deepStrictEqual(fromSelection(editor.getSelection()!), [1, 1, 1, 4]);
    
                findController.dispose();
            });
        });
    
        test('writes to the global clipboard buffer when text changes', async () => {
            await withAsyncTestCodeEditor([
                'ABC',
                'ABC',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                if (!platform.isMacintosh) {
                    assert.ok(true);
                    return;
                }
    
                let findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                let findState = findController.getState();
    
                findState.change({ searchString: 'ABC' }, true);
    
                assert.deepStrictEqual(findController.getGlobalBufferTerm(), 'ABC');
    
                findController.dispose();
            });
        }); */
        test('issue #1857: F3, Find Next, acts like "Find Under Cursor"', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'ABC',
                'ABC',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                // The cursor is at the very top, of the file, at the first ABC
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const findState = findController.getState();
                const nextMatchFindAction = new findController_1.$37();
                // I hit Ctrl+F to show the Find dialog
                await executeAction(instantiationService, editor, findController_1.$Y7);
                // I type ABC.
                findState.change({ searchString: 'A' }, true);
                findState.change({ searchString: 'AB' }, true);
                findState.change({ searchString: 'ABC' }, true);
                // The first ABC is highlighted.
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 1, 1, 4]);
                // I hit Esc to exit the Find dialog.
                findController.closeFindWidget();
                findController.hasFocus = false;
                // The cursor is now at end of the first line, with ABC on that line highlighted.
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 1, 1, 4]);
                // I hit delete to remove it and change the text to XYZ.
                editor.pushUndoStop();
                editor.executeEdits('test', [editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 4))]);
                editor.executeEdits('test', [editOperation_1.$ls.insert(new position_1.$js(1, 1), 'XYZ')]);
                editor.pushUndoStop();
                // At this point the text editor looks like this:
                //   XYZ
                //   ABC
                //   XYZ
                //   ABC
                assert.strictEqual(editor.getModel().getLineContent(1), 'XYZ');
                // The cursor is at end of the first line.
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 4, 1, 4]);
                // I hit F3 to "Find Next" to find the next occurrence of ABC, but instead it searches for XYZ.
                await nextMatchFindAction.run(null, editor);
                assert.strictEqual(findState.searchString, 'ABC');
                assert.strictEqual(findController.hasFocus, false);
                findController.dispose();
            });
        });
        test('issue #3090: F3 does not loop with two matches on a single line', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'import nls = require(\'vs/nls\');'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextMatchFindAction = new findController_1.$37();
                editor.setPosition({
                    lineNumber: 1,
                    column: 9
                });
                await nextMatchFindAction.run(null, editor);
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 26, 1, 29]);
                await nextMatchFindAction.run(null, editor);
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 8, 1, 11]);
                findController.dispose();
            });
        });
        test('issue #6149: Auto-escape highlighted text for search and replace regex mode', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3  * 5)',
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextMatchFindAction = new findController_1.$37();
                editor.setSelection(new selection_1.$ms(1, 9, 1, 13));
                findController.toggleRegex();
                await executeAction(instantiationService, editor, findController_1.$Y7);
                await nextMatchFindAction.run(null, editor);
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 9, 2, 13]);
                await nextMatchFindAction.run(null, editor);
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 9, 1, 13]);
                findController.dispose();
            });
        });
        test('issue #41027: Don\'t replace find input value on replace action if find input is active', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'test',
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                const testRegexString = 'tes.';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextMatchFindAction = new findController_1.$37();
                findController.toggleRegex();
                findController.setSearchString(testRegexString);
                await findController.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
                    shouldAnimate: false,
                    updateSearchScope: false,
                    loop: true
                });
                await nextMatchFindAction.run(null, editor);
                await executeAction(instantiationService, editor, findController_1.$97);
                assert.strictEqual(findController.getState().searchString, testRegexString);
                findController.dispose();
            });
        });
        test('issue #9043: Clear search scope when find widget is hidden', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await findController.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: false,
                    updateSearchScope: false,
                    loop: true
                });
                assert.strictEqual(findController.getState().searchScope, null);
                findController.getState().change({
                    searchScope: [new range_1.$ks(1, 1, 1, 5)]
                }, false);
                assert.deepStrictEqual(findController.getState().searchScope, [new range_1.$ks(1, 1, 1, 5)]);
                findController.closeFindWidget();
                assert.strictEqual(findController.getState().searchScope, null);
            });
        });
        test('issue #18111: Regex replace with single space replaces with no space', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'HRESULT OnAmbientPropertyChange(DISPID   dispid);'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await executeAction(instantiationService, editor, findController_1.$Y7);
                findController.getState().change({ searchString: '\\b\\s{3}\\b', replaceString: ' ', isRegex: true }, false);
                findController.moveToNextMatch();
                assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
                    [1, 39, 1, 42]
                ]);
                findController.replace();
                assert.deepStrictEqual(editor.getValue(), 'HRESULT OnAmbientPropertyChange(DISPID dispid);');
                findController.dispose();
            });
        });
        test('issue #24714: Regular expression with ^ in search & replace', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                '',
                'line2',
                'line3'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await executeAction(instantiationService, editor, findController_1.$Y7);
                findController.getState().change({ searchString: '^', replaceString: 'x', isRegex: true }, false);
                findController.moveToNextMatch();
                assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
                    [2, 1, 2, 1]
                ]);
                findController.replace();
                assert.deepStrictEqual(editor.getValue(), '\nxline2\nline3');
                findController.dispose();
            });
        });
        test('issue #38232: Find Next Selection, regex enabled', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                '([funny]',
                '',
                '([funny]'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextSelectionMatchFindAction = new findController_1.$77();
                // toggle regex
                findController.getState().change({ isRegex: true }, false);
                // change selection
                editor.setSelection(new selection_1.$ms(1, 1, 1, 9));
                // cmd+f3
                await nextSelectionMatchFindAction.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
                    [3, 1, 3, 9]
                ]);
                findController.dispose();
            });
        });
        test('issue #38232: Find Next Selection, regex enabled, find widget open', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                '([funny]',
                '',
                '([funny]'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextSelectionMatchFindAction = new findController_1.$77();
                // cmd+f - open find widget
                await executeAction(instantiationService, editor, findController_1.$Y7);
                // toggle regex
                findController.getState().change({ isRegex: true }, false);
                // change selection
                editor.setSelection(new selection_1.$ms(1, 1, 1, 9));
                // cmd+f3
                await nextSelectionMatchFindAction.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
                    [3, 1, 3, 9]
                ]);
                findController.dispose();
            });
        });
        test('issue #47400, CMD+E supports feeding multiple line of text into the find widget', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'ABC',
                'ABC',
                'XYZ',
                'ABC',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                // change selection
                editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                // cmd+f - open find widget
                await executeAction(instantiationService, editor, findController_1.$Y7);
                editor.setSelection(new selection_1.$ms(1, 1, 2, 4));
                const startFindWithSelectionAction = new findController_1.$17();
                await startFindWithSelectionAction.run(null, editor);
                const findState = findController.getState();
                assert.deepStrictEqual(findState.searchString.split(/\r\n|\r|\n/g), ['ABC', 'ABC']);
                editor.setSelection(new selection_1.$ms(3, 1, 3, 1));
                await startFindWithSelectionAction.run(null, editor);
                findController.dispose();
            });
        });
        test('issue #109756, CMD+E with empty cursor should always work', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'ABC',
                'ABC',
                'XYZ',
                'ABC',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                editor.setSelection(new selection_1.$ms(1, 2, 1, 2));
                const startFindWithSelectionAction = new findController_1.$17();
                startFindWithSelectionAction.run(null, editor);
                const findState = findController.getState();
                assert.deepStrictEqual(findState.searchString, 'ABC');
                findController.dispose();
            });
        });
    });
    suite('FindController query options persistence', () => {
        (0, utils_1.$bT)();
        const serviceCollection = new serviceCollection_1.$zh();
        const storageService = new storage_1.$Zo();
        storageService.store('editor.isRegex', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        storageService.store('editor.matchCase', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        storageService.store('editor.wholeWord', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        serviceCollection.set(storage_1.$Vo, storageService);
        test('matchCase', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'abc',
                'ABC',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                storageService.store('editor.matchCase', true, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
                // The cursor is at the very top, of the file, at the first ABC
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const findState = findController.getState();
                // I hit Ctrl+F to show the Find dialog
                await executeAction(instantiationService, editor, findController_1.$Y7);
                // I type ABC.
                findState.change({ searchString: 'ABC' }, true);
                // The second ABC is highlighted as matchCase is true.
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 1, 2, 4]);
                findController.dispose();
            });
        });
        storageService.store('editor.matchCase', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        storageService.store('editor.wholeWord', true, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        test('wholeWord', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'ABC',
                'AB',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                // The cursor is at the very top, of the file, at the first ABC
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const findState = findController.getState();
                // I hit Ctrl+F to show the Find dialog
                await executeAction(instantiationService, editor, findController_1.$Y7);
                // I type AB.
                findState.change({ searchString: 'AB' }, true);
                // The second AB is highlighted as wholeWord is true.
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 1, 2, 3]);
                findController.dispose();
            });
        });
        test('toggling options is saved', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'ABC',
                'AB',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                // The cursor is at the very top, of the file, at the first ABC
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                findController.toggleRegex();
                assert.strictEqual(storageService.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */), true);
                findController.dispose();
            });
        });
        test('issue #27083: Update search scope once find widget becomes visible', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'always', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const findConfig = {
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: false,
                    updateSearchScope: true,
                    loop: true
                };
                editor.setSelection(new range_1.$ks(1, 1, 2, 1));
                findController.start(findConfig);
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.$ms(1, 1, 2, 1)]);
                findController.closeFindWidget();
                editor.setSelections([new selection_1.$ms(1, 1, 2, 1), new selection_1.$ms(2, 1, 2, 5)]);
                findController.start(findConfig);
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.$ms(1, 1, 2, 1), new selection_1.$ms(2, 1, 2, 5)]);
            });
        });
        test('issue #58604: Do not update searchScope if it is empty', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'always', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                editor.setSelection(new range_1.$ks(1, 2, 1, 2));
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await findController.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: false,
                    updateSearchScope: true,
                    loop: true
                });
                assert.deepStrictEqual(findController.getState().searchScope, null);
            });
        });
        test('issue #58604: Update searchScope if it is not empty', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'always', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                editor.setSelection(new range_1.$ks(1, 2, 1, 3));
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await findController.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: false,
                    updateSearchScope: true,
                    loop: true
                });
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.$ms(1, 2, 1, 3)]);
            });
        });
        test('issue #27083: Find in selection when multiple lines are selected', async () => {
            await (0, testCodeEditor_1.$Y0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'multiline', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                editor.setSelection(new range_1.$ks(1, 6, 2, 1));
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await findController.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: false,
                    updateSearchScope: true,
                    loop: true
                });
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.$ms(1, 6, 2, 1)]);
            });
        });
    });
});
//# sourceMappingURL=findController.test.js.map