define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/contrib/find/browser/findController", "vs/editor/contrib/multicursor/browser/multicursor", "vs/editor/test/browser/testCodeEditor", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage"], function (require, exports, assert, utils_1, selection_1, findController_1, multicursor_1, testCodeEditor_1, serviceCollection_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Multicursor', () => {
        (0, utils_1.$bT)();
        test('issue #26393: Multiple cursors + Word wrap', () => {
            (0, testCodeEditor_1.$X0b)([
                'a'.repeat(20),
                'a'.repeat(20),
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 10 }, (editor, viewModel) => {
                const addCursorDownAction = new multicursor_1.$89();
                addCursorDownAction.run(null, editor, {});
                assert.strictEqual(viewModel.getCursorStates().length, 2);
                assert.strictEqual(viewModel.getCursorStates()[0].viewState.position.lineNumber, 1);
                assert.strictEqual(viewModel.getCursorStates()[1].viewState.position.lineNumber, 3);
                editor.setPosition({ lineNumber: 4, column: 1 });
                const addCursorUpAction = new multicursor_1.$79();
                addCursorUpAction.run(null, editor, {});
                assert.strictEqual(viewModel.getCursorStates().length, 2);
                assert.strictEqual(viewModel.getCursorStates()[0].viewState.position.lineNumber, 4);
                assert.strictEqual(viewModel.getCursorStates()[1].viewState.position.lineNumber, 2);
            });
        });
        test('issue #2205: Multi-cursor pastes in reverse order', () => {
            (0, testCodeEditor_1.$X0b)([
                'abc',
                'def'
            ], {}, (editor, viewModel) => {
                const addCursorUpAction = new multicursor_1.$79();
                editor.setSelection(new selection_1.$ms(2, 1, 2, 1));
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
            (0, testCodeEditor_1.$X0b)([
                'abc'
            ], {}, (editor, viewModel) => {
                const addCursorDownAction = new multicursor_1.$89();
                addCursorDownAction.run(null, editor, {});
                assert.strictEqual(viewModel.getSelections().length, 1);
            });
        });
    });
    function fromRange(rng) {
        return [rng.startLineNumber, rng.startColumn, rng.endLineNumber, rng.endColumn];
    }
    suite('Multicursor selection', () => {
        const serviceCollection = new serviceCollection_1.$zh();
        serviceCollection.set(storage_1.$Vo, new storage_1.$Zo());
        test('issue #8817: Cursor position changes when you cancel multicursor', () => {
            (0, testCodeEditor_1.$X0b)([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.$W7.ID, findController_1.$W7);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.$$9.ID, multicursor_1.$$9);
                const selectHighlightsAction = new multicursor_1.$e0();
                editor.setSelection(new selection_1.$ms(2, 9, 2, 16));
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
            (0, testCodeEditor_1.$X0b)([
                'something',
                'someething',
                'someeething',
                'nothing'
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.$W7.ID, findController_1.$W7);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.$$9.ID, multicursor_1.$$9);
                const selectHighlightsAction = new multicursor_1.$e0();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
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
            (0, testCodeEditor_1.$X0b)([
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
                const findController = editor.registerAndInstantiateContribution(findController_1.$W7.ID, findController_1.$W7);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.$$9.ID, multicursor_1.$$9);
                const addSelectionToNextFindMatch = new multicursor_1.$a0();
                editor.setSelection(new selection_1.$ms(2, 1, 3, 4));
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
            (0, testCodeEditor_1.$X0b)([
                'abcabc',
                'abc',
                'abcabc',
            ], { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.$W7.ID, findController_1.$W7);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.$$9.ID, multicursor_1.$$9);
                const addSelectionToNextFindMatch = new multicursor_1.$a0();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 4));
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
            (0, testCodeEditor_1.$X0b)([
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
                const findController = editor.registerAndInstantiateContribution(findController_1.$W7.ID, findController_1.$W7);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.$$9.ID, multicursor_1.$$9);
                const addSelectionToNextFindMatch = new multicursor_1.$a0();
                editor.setSelection(new selection_1.$ms(2, 1, 3, 4));
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
            (0, testCodeEditor_1.$X0b)(text, { serviceCollection: serviceCollection }, (editor) => {
                const findController = editor.registerAndInstantiateContribution(findController_1.$W7.ID, findController_1.$W7);
                const multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.$$9.ID, multicursor_1.$$9);
                callback(editor, findController);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        }
        function testAddSelectionToNextFindMatchAction(text, callback) {
            testMulticursor(text, (editor, findController) => {
                const action = new multicursor_1.$a0();
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
                    new selection_1.$ms(1, 2, 1, 2),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
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
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 2, 2, 2),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
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
                    new selection_1.$ms(1, 2, 1, 2),
                    new selection_1.$ms(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
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
                    new selection_1.$ms(1, 2, 1, 2),
                    new selection_1.$ms(2, 2, 2, 2),
                    new selection_1.$ms(3, 1, 3, 1),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 4),
                    new selection_1.$ms(2, 1, 2, 4),
                    new selection_1.$ms(3, 1, 3, 4),
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
                    new selection_1.$ms(1, 6, 1, 6),
                    new selection_1.$ms(2, 6, 2, 6),
                    new selection_1.$ms(3, 6, 3, 6),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 5, 1, 10),
                    new selection_1.$ms(2, 5, 2, 10),
                    new selection_1.$ms(3, 5, 3, 8),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 5, 1, 10),
                    new selection_1.$ms(2, 5, 2, 10),
                    new selection_1.$ms(3, 5, 3, 8),
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
                    new selection_1.$ms(1, 1, 1, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 5),
                    new selection_1.$ms(2, 1, 2, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 5),
                    new selection_1.$ms(2, 1, 2, 5),
                    new selection_1.$ms(3, 1, 3, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 5),
                    new selection_1.$ms(2, 1, 2, 5),
                    new selection_1.$ms(3, 1, 3, 5),
                    new selection_1.$ms(4, 1, 4, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 5),
                    new selection_1.$ms(2, 1, 2, 5),
                    new selection_1.$ms(3, 1, 3, 5),
                    new selection_1.$ms(4, 1, 4, 5),
                    new selection_1.$ms(5, 1, 5, 5),
                ]);
                action.run(null, editor);
                assert.deepStrictEqual(editor.getSelections(), [
                    new selection_1.$ms(1, 1, 1, 5),
                    new selection_1.$ms(2, 1, 2, 5),
                    new selection_1.$ms(3, 1, 3, 5),
                    new selection_1.$ms(4, 1, 4, 5),
                    new selection_1.$ms(5, 1, 5, 5),
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
                        new selection_1.$ms(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                        new selection_1.$ms(4, 1, 4, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                        new selection_1.$ms(4, 1, 4, 4),
                        new selection_1.$ms(6, 2, 6, 5),
                    ]);
                });
            });
            test('leaves mode when selection changes', () => {
                testAddSelectionToNextFindMatchAction(text, (editor, action, findController) => {
                    editor.setSelections([
                        new selection_1.$ms(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                        new selection_1.$ms(4, 1, 4, 4),
                    ]);
                    // change selection
                    editor.setSelections([
                        new selection_1.$ms(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                        new selection_1.$ms(2, 1, 2, 4),
                    ]);
                });
            });
            test('Select Highlights respects mode ', () => {
                testMulticursor(text, (editor, findController) => {
                    const action = new multicursor_1.$e0();
                    editor.setSelections([
                        new selection_1.$ms(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                        new selection_1.$ms(4, 1, 4, 4),
                        new selection_1.$ms(6, 2, 6, 5),
                    ]);
                    action.run(null, editor);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 1, 1, 4),
                        new selection_1.$ms(4, 1, 4, 4),
                        new selection_1.$ms(6, 2, 6, 5),
                    ]);
                });
            });
        });
    });
});
//# sourceMappingURL=multicursor.test.js.map