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
    let TestFindController = class TestFindController extends findController_1.CommonFindController {
        constructor(editor, contextKeyService, storageService, clipboardService, notificationService) {
            super(editor, contextKeyService, storageService, clipboardService, notificationService);
            this.delayUpdateHistory = false;
            this._findInputFocused = findModel_1.CONTEXT_FIND_INPUT_FOCUSED.bindTo(contextKeyService);
            this._updateHistoryDelayer = new async_1.Delayer(50);
            this.hasFocus = false;
        }
        async _start(opts) {
            await super._start(opts);
            if (opts.shouldFocus !== 0 /* FindStartFocusAction.NoFocusChange */) {
                this.hasFocus = true;
            }
            const inputFocused = opts.shouldFocus === 1 /* FindStartFocusAction.FocusFindInput */;
            this._findInputFocused.set(inputFocused);
        }
    };
    TestFindController = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, notification_1.INotificationService)
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let clipboardState = '';
        const serviceCollection = new serviceCollection_1.ServiceCollection();
        serviceCollection.set(storage_1.IStorageService, new storage_1.InMemoryStorageService());
        if (platform.isMacintosh) {
            serviceCollection.set(clipboardService_1.IClipboardService, {
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'ABC',
                'ABC',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                // The cursor is at the very top, of the file, at the first ABC
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const findState = findController.getState();
                const nextMatchFindAction = new findController_1.NextMatchFindAction();
                // I hit Ctrl+F to show the Find dialog
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
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
                editor.executeEdits('test', [editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 4))]);
                editor.executeEdits('test', [editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'XYZ')]);
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'import nls = require(\'vs/nls\');'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextMatchFindAction = new findController_1.NextMatchFindAction();
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3  * 5)',
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextMatchFindAction = new findController_1.NextMatchFindAction();
                editor.setSelection(new selection_1.Selection(1, 9, 1, 13));
                findController.toggleRegex();
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
                await nextMatchFindAction.run(null, editor);
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 9, 2, 13]);
                await nextMatchFindAction.run(null, editor);
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 9, 1, 13]);
                findController.dispose();
            });
        });
        test('issue #41027: Don\'t replace find input value on replace action if find input is active', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'test',
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                const testRegexString = 'tes.';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextMatchFindAction = new findController_1.NextMatchFindAction();
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
                await executeAction(instantiationService, editor, findController_1.StartFindReplaceAction);
                assert.strictEqual(findController.getState().searchString, testRegexString);
                findController.dispose();
            });
        });
        test('issue #9043: Clear search scope when find widget is hidden', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
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
                    searchScope: [new range_1.Range(1, 1, 1, 5)]
                }, false);
                assert.deepStrictEqual(findController.getState().searchScope, [new range_1.Range(1, 1, 1, 5)]);
                findController.closeFindWidget();
                assert.strictEqual(findController.getState().searchScope, null);
            });
        });
        test('issue #18111: Regex replace with single space replaces with no space', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'HRESULT OnAmbientPropertyChange(DISPID   dispid);'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                '',
                'line2',
                'line3'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                '([funny]',
                '',
                '([funny]'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextSelectionMatchFindAction = new findController_1.NextSelectionMatchFindAction();
                // toggle regex
                findController.getState().change({ isRegex: true }, false);
                // change selection
                editor.setSelection(new selection_1.Selection(1, 1, 1, 9));
                // cmd+f3
                await nextSelectionMatchFindAction.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
                    [3, 1, 3, 9]
                ]);
                findController.dispose();
            });
        });
        test('issue #38232: Find Next Selection, regex enabled, find widget open', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                '([funny]',
                '',
                '([funny]'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const nextSelectionMatchFindAction = new findController_1.NextSelectionMatchFindAction();
                // cmd+f - open find widget
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
                // toggle regex
                findController.getState().change({ isRegex: true }, false);
                // change selection
                editor.setSelection(new selection_1.Selection(1, 1, 1, 9));
                // cmd+f3
                await nextSelectionMatchFindAction.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
                    [3, 1, 3, 9]
                ]);
                findController.dispose();
            });
        });
        test('issue #47400, CMD+E supports feeding multiple line of text into the find widget', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'ABC',
                'ABC',
                'XYZ',
                'ABC',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                // change selection
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                // cmd+f - open find widget
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
                editor.setSelection(new selection_1.Selection(1, 1, 2, 4));
                const startFindWithSelectionAction = new findController_1.StartFindWithSelectionAction();
                await startFindWithSelectionAction.run(null, editor);
                const findState = findController.getState();
                assert.deepStrictEqual(findState.searchString.split(/\r\n|\r|\n/g), ['ABC', 'ABC']);
                editor.setSelection(new selection_1.Selection(3, 1, 3, 1));
                await startFindWithSelectionAction.run(null, editor);
                findController.dispose();
            });
        });
        test('issue #109756, CMD+E with empty cursor should always work', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'ABC',
                'ABC',
                'XYZ',
                'ABC',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor) => {
                clipboardState = '';
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                editor.setSelection(new selection_1.Selection(1, 2, 1, 2));
                const startFindWithSelectionAction = new findController_1.StartFindWithSelectionAction();
                startFindWithSelectionAction.run(null, editor);
                const findState = findController.getState();
                assert.deepStrictEqual(findState.searchString, 'ABC');
                findController.dispose();
            });
        });
    });
    suite('FindController query options persistence', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const serviceCollection = new serviceCollection_1.ServiceCollection();
        const storageService = new storage_1.InMemoryStorageService();
        storageService.store('editor.isRegex', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        storageService.store('editor.matchCase', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        storageService.store('editor.wholeWord', false, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        serviceCollection.set(storage_1.IStorageService, storageService);
        test('matchCase', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
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
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'ABC',
                'AB',
                'XYZ',
                'ABC'
            ], { serviceCollection: serviceCollection }, async (editor, _, instantiationService) => {
                // The cursor is at the very top, of the file, at the first ABC
                const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
                const findState = findController.getState();
                // I hit Ctrl+F to show the Find dialog
                await executeAction(instantiationService, editor, findController_1.StartFindAction);
                // I type AB.
                findState.change({ searchString: 'AB' }, true);
                // The second AB is highlighted as wholeWord is true.
                assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 1, 2, 3]);
                findController.dispose();
            });
        });
        test('toggling options is saved', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
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
                editor.setSelection(new range_1.Range(1, 1, 2, 1));
                findController.start(findConfig);
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.Selection(1, 1, 2, 1)]);
                findController.closeFindWidget();
                editor.setSelections([new selection_1.Selection(1, 1, 2, 1), new selection_1.Selection(2, 1, 2, 5)]);
                findController.start(findConfig);
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.Selection(1, 1, 2, 1), new selection_1.Selection(2, 1, 2, 5)]);
            });
        });
        test('issue #58604: Do not update searchScope if it is empty', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'always', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                editor.setSelection(new range_1.Range(1, 2, 1, 2));
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
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'always', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                editor.setSelection(new range_1.Range(1, 2, 1, 3));
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
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.Selection(1, 2, 1, 3)]);
            });
        });
        test('issue #27083: Find in selection when multiple lines are selected', async () => {
            await (0, testCodeEditor_1.withAsyncTestCodeEditor)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection, find: { autoFindInSelection: 'multiline', globalFindClipboard: false } }, async (editor) => {
                // clipboardState = '';
                editor.setSelection(new range_1.Range(1, 6, 2, 1));
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
                assert.deepStrictEqual(findController.getState().searchScope, [new selection_1.Selection(1, 6, 2, 1)]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZENvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZpbmQvdGVzdC9icm93c2VyL2ZpbmRDb250cm9sbGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEscUNBQW9CO1FBT3BELFlBQ0MsTUFBbUIsRUFDQyxpQkFBcUMsRUFDeEMsY0FBK0IsRUFDN0IsZ0JBQW1DLEVBQ2hDLG1CQUF5QztZQUUvRCxLQUFLLENBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBWGxGLHVCQUFrQixHQUFZLEtBQUssQ0FBQztZQVkxQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsc0NBQTBCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksZUFBTyxDQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7UUFFa0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUF1QjtZQUN0RCxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFekIsSUFBSSxJQUFJLENBQUMsV0FBVywrQ0FBdUMsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7YUFDckI7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxnREFBd0MsQ0FBQztZQUM5RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUM7S0FDRCxDQUFBO0lBOUJLLGtCQUFrQjtR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