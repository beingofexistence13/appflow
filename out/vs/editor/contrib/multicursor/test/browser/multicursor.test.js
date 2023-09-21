define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/contrib/find/browser/findController", "vs/editor/contrib/multicursor/browser/multicursor", "vs/editor/test/browser/testCodeEditor", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage"], function (require, exports, assert, utils_1, selection_1, findController_1, multicursor_1, testCodeEditor_1, serviceCollection_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Multicursor', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #26393: Multiple cursors + Word wrap', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'a'.repeat(20),
                'a'.repeat(20),
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 10 }, (editor, viewModel) => {
                const addCursorDownAction = new multicursor_1.InsertCursorBelow();
                addCursorDownAction.run(null, editor, {});
                assert.strictEqual(viewModel.getCursorStates().length, 2);
                assert.strictEqual(viewModel.getCursorStates()[0].viewState.position.lineNumber, 1);
                assert.strictEqual(viewModel.getCursorStates()[1].viewState.position.lineNumber, 3);
                editor.setPosition({ lineNumber: 4, column: 1 });
                const addCursorUpAction = new multicursor_1.InsertCursorAbove();
                addCursorUpAction.run(null, editor, {});
                assert.strictEqual(viewModel.getCursorStates().length, 2);
                assert.strictEqual(viewModel.getCursorStates()[0].viewState.position.lineNumber, 4);
                assert.strictEqual(viewModel.getCursorStates()[1].viewState.position.lineNumber, 2);
            });
        });
        test('issue #2205: Multi-cursor pastes in reverse order', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'abc',
                'def'
            ], {}, (editor, viewModel) => {
                const addCursorUpAction = new multicursor_1.InsertCursorAbove();
                editor.setSelection(new selection_1.Selection(2, 1, 2, 1));
                addCursorUpAction.run(null, editor, {});
                assert.strictEqual(viewModel.getSelections().length, 2);
                editor.trigger('test', "paste" /* Handler.Paste */, {
                    text: '1\n2',
                    multicursorText: [
                        '1',
                        '2'
                    ]
                });
                assert.strictEqual(editor.getModel().getLineContent(1), '1abc');
                assert.strictEqual(editor.getModel().getLineContent(2), '2def');
            });
        });
        test('issue #1336: Insert cursor below on last line adds a cursor to the end of the current line', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'abc'
            ], {}, (editor, viewModel) => {
                const addCursorDownAction = new multicursor_1.InsertCursorBelow();
                addCursorDownAction.run(null, editor, {});
                assert.strictEqual(viewModel.getSelections().length, 1);
            });
        });
    });
    function fromRange(rng) {
        return [rng.startLineNumber, rng.startColumn, rng.endLineNumber, rng.endColumn];
    }
    suite('Multicursor selection', () => {
        const serviceCollection = new serviceCollection_1.ServiceCollection();
        serviceCollection.set(storage_1.IStorageService, new storage_1.InMemoryStorageService());
        test('issue #8817: Cursor position changes when you cancel multicursor', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController.ID, findController_1.CommonFindController);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController.ID, multicursor_1.MultiCursorSelectionController);
                const selectHighlightsAction = new multicursor_1.SelectHighlightsAction();
                editor.setSelection(new selection_1.Selection(2, 9, 2, 16));
                selectHighlightsAction.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [2, 9, 2, 16],
                    [1, 9, 1, 16],
                    [3, 9, 3, 16],
                ]);
                editor.trigger('test', 'removeSecondaryCursors', null);
                assert.deepStrictEqual(fromRange(editor.getSelection()), [2, 9, 2, 16]);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('issue #5400: "Select All Occurrences of Find Match" does not select all if find uses regex', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'something',
                'someething',
                'someeething',
                'nothing'
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController.ID, findController_1.CommonFindController);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController.ID, multicursor_1.MultiCursorSelectionController);
                const selectHighlightsAction = new multicursor_1.SelectHighlightsAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                findController.getState().change({ searchString: 'some+thing', isRegex: true, isRevealed: true }, false);
                selectHighlightsAction.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [1, 1, 1, 10],
                    [2, 1, 2, 11],
                    [3, 1, 3, 12],
                ]);
                assert.strictEqual(findController.getState().searchString, 'some+thing');
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('AddSelectionToNextFindMatchAction can work with multiline', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                '',
                'qwe',
                'rty',
                '',
                'qwe',
                '',
                'rty',
                'qwe',
                'rty'
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController.ID, findController_1.CommonFindController);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController.ID, multicursor_1.MultiCursorSelectionController);
                const addSelectionToNextFindMatch = new multicursor_1.AddSelectionToNextFindMatchAction();
                editor.setSelection(new selection_1.Selection(2, 1, 3, 4));
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [2, 1, 3, 4],
                    [8, 1, 9, 4]
                ]);
                editor.trigger('test', 'removeSecondaryCursors', null);
                assert.deepStrictEqual(fromRange(editor.getSelection()), [2, 1, 3, 4]);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('issue #6661: AddSelectionToNextFindMatchAction can work with touching ranges', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'abcabc',
                'abc',
                'abcabc',
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController.ID, findController_1.CommonFindController);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController.ID, multicursor_1.MultiCursorSelectionController);
                const addSelectionToNextFindMatch = new multicursor_1.AddSelectionToNextFindMatchAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 4));
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [1, 1, 1, 4],
                    [1, 4, 1, 7]
                ]);
                addSelectionToNextFindMatch.run(null, editor);
                addSelectionToNextFindMatch.run(null, editor);
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [1, 1, 1, 4],
                    [1, 4, 1, 7],
                    [2, 1, 2, 4],
                    [3, 1, 3, 4],
                    [3, 4, 3, 7]
                ]);
                editor.trigger('test', "type" /* Handler.Type */, { text: 'z' });
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [1, 2, 1, 2],
                    [1, 3, 1, 3],
                    [2, 2, 2, 2],
                    [3, 2, 3, 2],
                    [3, 3, 3, 3]
                ]);
                assert.strictEqual(editor.getValue(), [
                    'zz',
                    'z',
                    'zz',
                ].join('\n'));
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('issue #23541: Multiline Ctrl+D does not work in CRLF files', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                '',
                'qwe',
                'rty',
                '',
                'qwe',
                '',
                'rty',
                'qwe',
                'rty'
            ], { serviceCollection: serviceCollection }, (editor) => {
                editor.getModel().setEOL(1 /* EndOfLineSequence.CRLF */);
                const findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController.ID, findController_1.CommonFindController);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController.ID, multicursor_1.MultiCursorSelectionController);
                const addSelectionToNextFindMatch = new multicursor_1.AddSelectionToNextFindMatchAction();
                editor.setSelection(new selection_1.Selection(2, 1, 3, 4));
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepStrictEqual(editor.getSelections().map(fromRange), [
                    [2, 1, 3, 4],
                    [8, 1, 9, 4]
                ]);
                editor.trigger('test', 'removeSecondaryCursors', null);
                assert.deepStrictEqual(fromRange(editor.getSelection()), [2, 1, 3, 4]);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        function testMulticursor(text, callback) {
            (0, testCodeEditor_1.withTestCodeEditor)(text, { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController.ID, findController_1.CommonFindController);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController.ID, multicursor_1.MultiCursorSelectionController);
                callback(editor, findController);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        }
        function testAddSelectionToNextFindMatchAction(text, callback) {
            testMulticursor(text, (editor, findController) => {
                const action = new multicursor_1.AddSelectionToNextFindMatchAction();
                callback(editor, action, findController);
            });
        }
        test('AddSelectionToNextFindMatchAction starting with single collapsed selection', () => {
            const text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                editor.setSelections([
                    new selection_1.Selection(1, 2, 1, 2),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with two selections, one being collapsed 1)', () => {
            const text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 2, 2, 2),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with two selections, one being collapsed 2)', () => {
            const text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                editor.setSelections([
                    new selection_1.Selection(1, 2, 1, 2),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with all collapsed selections', () => {
            const text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                editor.setSelections([
                    new selection_1.Selection(1, 2, 1, 2),
                    new selection_1.Selection(2, 2, 2, 2),
                    new selection_1.Selection(3, 1, 3, 1),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with all collapsed selections on different words', () => {
            const text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                editor.setSelections([
                    new selection_1.Selection(1, 6, 1, 6),
                    new selection_1.Selection(2, 6, 2, 6),
                    new selection_1.Selection(3, 6, 3, 6),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 5, 1, 10),
                    new selection_1.Selection(2, 5, 2, 10),
                    new selection_1.Selection(3, 5, 3, 8),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 5, 1, 10),
                    new selection_1.Selection(2, 5, 2, 10),
                    new selection_1.Selection(3, 5, 3, 8),
                ]);
            });
        });
        test('issue #20651: AddSelectionToNextFindMatchAction case insensitive', () => {
            const text = [
                'test',
                'testte',
                'Test',
                'testte',
                'test'
            ];
            testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                    new selection_1.Selection(5, 1, 5, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                    new selection_1.Selection(5, 1, 5, 5),
                ]);
            });
        });
        suite('Find state disassociation', () => {
            const text = [
                'app',
                'apples',
                'whatsapp',
                'app',
                'App',
                ' app'
            ];
            test('enters mode', () => {
                testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                    editor.setSelections([
                        new selection_1.Selection(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                        new selection_1.Selection(6, 2, 6, 5),
                    ]);
                });
            });
            test('leaves mode when selection changes', () => {
                testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                    editor.setSelections([
                        new selection_1.Selection(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                    ]);
                    // change selection
                    editor.setSelections([
                        new selection_1.Selection(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(2, 1, 2, 4),
                    ]);
                });
            });
            test('Select Highlights respects mode ', () => {
                testMulticursor(text, (editor, findController) => {
                    const action = new multicursor_1.SelectHighlightsAction();
                    editor.setSelections([
                        new selection_1.Selection(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                        new selection_1.Selection(6, 2, 6, 5),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                        new selection_1.Selection(6, 2, 6, 5),
                    ]);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGljdXJzb3IudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL211bHRpY3Vyc29yL3Rlc3QvYnJvd3Nlci9tdWx0aWN1cnNvci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUV6QixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtZQUN2RCxJQUFBLG1DQUFrQixFQUFDO2dCQUNsQixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDZCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQzthQUNkLEVBQUUsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUM1RSxNQUFNLG1CQUFtQixHQUFHLElBQUksK0JBQWlCLEVBQUUsQ0FBQztnQkFDcEQsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRTNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFMUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BGLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVwRixN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Q0FBQyxhQUFhLENBQUM7b0JBQ3BCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzlDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzlDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzlDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFD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Q0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzlDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzlDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzlDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxD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Q0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFO29CQUM5QyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFO29CQUM5QyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFO29CQUM5QyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFO29CQUM5QyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN6QixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtZQUV2QyxNQUFNLElBQUksR0FBRztnQkFDWixLQUFLO2dCQUNMLFFBQVE7Z0JBQ1IsVUFBVTtnQkFDVixLQUFLO2dCQUNMLEtBQUs7Z0JBQ0wsTUFBTTthQUNOLENBQUM7WUFFRixJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtnQkFDeEIscUNBQXFDLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsRUFBRTtvQkFDOUUsTUFBTSxDQUFDLGFBQWEsQ0FBQzt3QkFDcEIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekIsQ0FBQyxDQUFDO29CQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMxQixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTt3QkFDOUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekIsQ0FBQyxDQUFDO29CQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMxQixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTt3QkFDOUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekIsQ0FBQyxDQUFDO29CQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMxQixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTt3QkFDOUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekIsQ0FBQyxDQUFD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