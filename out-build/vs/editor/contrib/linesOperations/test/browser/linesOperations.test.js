define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/contrib/linesOperations/browser/linesOperations", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, coreCommands_1, position_1, selection_1, linesOperations_1, testCodeEditor_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertSelection(editor, expected) {
        if (!Array.isArray(expected)) {
            expected = [expected];
        }
        assert.deepStrictEqual(editor.getSelections(), expected);
    }
    function executeAction(action, editor) {
        action.run(null, editor, undefined);
    }
    suite('Editor Contrib - Line Operations', () => {
        (0, utils_1.$bT)();
        suite('SortLinesAscendingAction', () => {
            test('should sort selected lines in ascending order', function () {
                (0, testCodeEditor_1.$X0b)([
                    'omicron',
                    'beta',
                    'alpha'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const sortLinesAscendingAction = new linesOperations_1.$C9();
                    editor.setSelection(new selection_1.$ms(1, 1, 3, 5));
                    executeAction(sortLinesAscendingAction, editor);
                    assert.deepStrictEqual(model.getLinesContent(), [
                        'alpha',
                        'beta',
                        'omicron'
                    ]);
                    assertSelection(editor, new selection_1.$ms(1, 1, 3, 7));
                });
            });
            test('should sort multiple selections in ascending order', function () {
                (0, testCodeEditor_1.$X0b)([
                    'omicron',
                    'beta',
                    'alpha',
                    '',
                    'omicron',
                    'beta',
                    'alpha'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const sortLinesAscendingAction = new linesOperations_1.$C9();
                    editor.setSelections([new selection_1.$ms(1, 1, 3, 5), new selection_1.$ms(5, 1, 7, 5)]);
                    executeAction(sortLinesAscendingAction, editor);
                    assert.deepStrictEqual(model.getLinesContent(), [
                        'alpha',
                        'beta',
                        'omicron',
                        '',
                        'alpha',
                        'beta',
                        'omicron'
                    ]);
                    const expectedSelections = [
                        new selection_1.$ms(1, 1, 3, 7),
                        new selection_1.$ms(5, 1, 7, 7)
                    ];
                    editor.getSelections().forEach((actualSelection, index) => {
                        assert.deepStrictEqual(actualSelection.toString(), expectedSelections[index].toString());
                    });
                });
            });
        });
        suite('SortLinesDescendingAction', () => {
            test('should sort selected lines in descending order', function () {
                (0, testCodeEditor_1.$X0b)([
                    'alpha',
                    'beta',
                    'omicron'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const sortLinesDescendingAction = new linesOperations_1.$D9();
                    editor.setSelection(new selection_1.$ms(1, 1, 3, 7));
                    executeAction(sortLinesDescendingAction, editor);
                    assert.deepStrictEqual(model.getLinesContent(), [
                        'omicron',
                        'beta',
                        'alpha'
                    ]);
                    assertSelection(editor, new selection_1.$ms(1, 1, 3, 5));
                });
            });
            test('should sort multiple selections in descending order', function () {
                (0, testCodeEditor_1.$X0b)([
                    'alpha',
                    'beta',
                    'omicron',
                    '',
                    'alpha',
                    'beta',
                    'omicron'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const sortLinesDescendingAction = new linesOperations_1.$D9();
                    editor.setSelections([new selection_1.$ms(1, 1, 3, 7), new selection_1.$ms(5, 1, 7, 7)]);
                    executeAction(sortLinesDescendingAction, editor);
                    assert.deepStrictEqual(model.getLinesContent(), [
                        'omicron',
                        'beta',
                        'alpha',
                        '',
                        'omicron',
                        'beta',
                        'alpha'
                    ]);
                    const expectedSelections = [
                        new selection_1.$ms(1, 1, 3, 5),
                        new selection_1.$ms(5, 1, 7, 5)
                    ];
                    editor.getSelections().forEach((actualSelection, index) => {
                        assert.deepStrictEqual(actualSelection.toString(), expectedSelections[index].toString());
                    });
                });
            });
        });
        suite('DeleteDuplicateLinesAction', () => {
            test('should remove duplicate lines', function () {
                (0, testCodeEditor_1.$X0b)([
                    'alpha',
                    'beta',
                    'beta',
                    'beta',
                    'alpha',
                    'omicron',
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteDuplicateLinesAction = new linesOperations_1.$E9();
                    editor.setSelection(new selection_1.$ms(1, 3, 6, 4));
                    executeAction(deleteDuplicateLinesAction, editor);
                    assert.deepStrictEqual(model.getLinesContent(), [
                        'alpha',
                        'beta',
                        'omicron',
                    ]);
                    assertSelection(editor, new selection_1.$ms(1, 1, 3, 7));
                });
            });
            test('should remove duplicate lines in multiple selections', function () {
                (0, testCodeEditor_1.$X0b)([
                    'alpha',
                    'beta',
                    'beta',
                    'omicron',
                    '',
                    'alpha',
                    'alpha',
                    'beta'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteDuplicateLinesAction = new linesOperations_1.$E9();
                    editor.setSelections([new selection_1.$ms(1, 2, 4, 3), new selection_1.$ms(6, 2, 8, 3)]);
                    executeAction(deleteDuplicateLinesAction, editor);
                    assert.deepStrictEqual(model.getLinesContent(), [
                        'alpha',
                        'beta',
                        'omicron',
                        '',
                        'alpha',
                        'beta'
                    ]);
                    const expectedSelections = [
                        new selection_1.$ms(1, 1, 3, 7),
                        new selection_1.$ms(5, 1, 6, 4)
                    ];
                    editor.getSelections().forEach((actualSelection, index) => {
                        assert.deepStrictEqual(actualSelection.toString(), expectedSelections[index].toString());
                    });
                });
            });
        });
        suite('DeleteAllLeftAction', () => {
            test('should delete to the left of the cursor', function () {
                (0, testCodeEditor_1.$X0b)([
                    'one',
                    'two',
                    'three'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteAllLeftAction = new linesOperations_1.$L9();
                    editor.setSelection(new selection_1.$ms(1, 2, 1, 2));
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'ne');
                    editor.setSelections([new selection_1.$ms(2, 2, 2, 2), new selection_1.$ms(3, 2, 3, 2)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(2), 'wo');
                    assert.strictEqual(model.getLineContent(3), 'hree');
                });
            });
            test('should jump to the previous line when on first column', function () {
                (0, testCodeEditor_1.$X0b)([
                    'one',
                    'two',
                    'three'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteAllLeftAction = new linesOperations_1.$L9();
                    editor.setSelection(new selection_1.$ms(2, 1, 2, 1));
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'onetwo');
                    editor.setSelections([new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(2, 1, 2, 1)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLinesContent()[0], 'onetwothree');
                    assert.strictEqual(model.getLinesContent().length, 1);
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLinesContent()[0], 'onetwothree');
                });
            });
            test('should keep deleting lines in multi cursor mode', function () {
                (0, testCodeEditor_1.$X0b)([
                    'hi my name is Carlos Matos',
                    'BCC',
                    'waso waso waso',
                    'my wife doesnt believe in me',
                    'nonononono',
                    'bitconneeeect'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteAllLeftAction = new linesOperations_1.$L9();
                    const beforeSecondWasoSelection = new selection_1.$ms(3, 5, 3, 5);
                    const endOfBCCSelection = new selection_1.$ms(2, 4, 2, 4);
                    const endOfNonono = new selection_1.$ms(5, 11, 5, 11);
                    editor.setSelections([beforeSecondWasoSelection, endOfBCCSelection, endOfNonono]);
                    executeAction(deleteAllLeftAction, editor);
                    let selections = editor.getSelections();
                    assert.strictEqual(model.getLineContent(2), '');
                    assert.strictEqual(model.getLineContent(3), ' waso waso');
                    assert.strictEqual(model.getLineContent(5), '');
                    assert.deepStrictEqual([
                        selections[0].startLineNumber,
                        selections[0].startColumn,
                        selections[0].endLineNumber,
                        selections[0].endColumn
                    ], [3, 1, 3, 1]);
                    assert.deepStrictEqual([
                        selections[1].startLineNumber,
                        selections[1].startColumn,
                        selections[1].endLineNumber,
                        selections[1].endColumn
                    ], [2, 1, 2, 1]);
                    assert.deepStrictEqual([
                        selections[2].startLineNumber,
                        selections[2].startColumn,
                        selections[2].endLineNumber,
                        selections[2].endColumn
                    ], [5, 1, 5, 1]);
                    executeAction(deleteAllLeftAction, editor);
                    selections = editor.getSelections();
                    assert.strictEqual(model.getLineContent(1), 'hi my name is Carlos Matos waso waso');
                    assert.strictEqual(selections.length, 2);
                    assert.deepStrictEqual([
                        selections[0].startLineNumber,
                        selections[0].startColumn,
                        selections[0].endLineNumber,
                        selections[0].endColumn
                    ], [1, 27, 1, 27]);
                    assert.deepStrictEqual([
                        selections[1].startLineNumber,
                        selections[1].startColumn,
                        selections[1].endLineNumber,
                        selections[1].endColumn
                    ], [2, 29, 2, 29]);
                });
            });
            test('should work in multi cursor mode', function () {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world',
                    'hello world',
                    'hello',
                    'bonjour',
                    'hola',
                    'world',
                    'hello world',
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteAllLeftAction = new linesOperations_1.$L9();
                    editor.setSelections([new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(1, 4, 1, 4)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'lo');
                    editor.setSelections([new selection_1.$ms(2, 2, 2, 2), new selection_1.$ms(2, 4, 2, 5)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(2), 'd');
                    editor.setSelections([new selection_1.$ms(3, 2, 3, 5), new selection_1.$ms(3, 7, 3, 7)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(3), 'world');
                    editor.setSelections([new selection_1.$ms(4, 3, 4, 3), new selection_1.$ms(4, 5, 5, 4)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(4), 'jour');
                    editor.setSelections([new selection_1.$ms(5, 3, 6, 3), new selection_1.$ms(6, 5, 7, 5), new selection_1.$ms(7, 7, 7, 7)]);
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(5), 'world');
                });
            });
            test('issue #36234: should push undo stop', () => {
                (0, testCodeEditor_1.$X0b)([
                    'one',
                    'two',
                    'three'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const deleteAllLeftAction = new linesOperations_1.$L9();
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'Typing some text here on line ' });
                    assert.strictEqual(model.getLineContent(1), 'Typing some text here on line one');
                    assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 31, 1, 31));
                    executeAction(deleteAllLeftAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'one');
                    assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 1, 1));
                    coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                    assert.strictEqual(model.getLineContent(1), 'Typing some text here on line one');
                    assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 31, 1, 31));
                });
            });
        });
        suite('JoinLinesAction', () => {
            test('should join lines and insert space if necessary', function () {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world',
                    'hello ',
                    'world',
                    'hello		',
                    '	world',
                    'hello   ',
                    '	world',
                    '',
                    '',
                    'hello world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const joinLinesAction = new linesOperations_1.$N9();
                    editor.setSelection(new selection_1.$ms(1, 2, 1, 2));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'hello world');
                    assertSelection(editor, new selection_1.$ms(1, 6, 1, 6));
                    editor.setSelection(new selection_1.$ms(2, 2, 2, 2));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(2), 'hello world');
                    assertSelection(editor, new selection_1.$ms(2, 7, 2, 7));
                    editor.setSelection(new selection_1.$ms(3, 2, 3, 2));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(3), 'hello world');
                    assertSelection(editor, new selection_1.$ms(3, 7, 3, 7));
                    editor.setSelection(new selection_1.$ms(4, 2, 5, 3));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(4), 'hello world');
                    assertSelection(editor, new selection_1.$ms(4, 2, 4, 8));
                    editor.setSelection(new selection_1.$ms(5, 1, 7, 3));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(5), 'hello world');
                    assertSelection(editor, new selection_1.$ms(5, 1, 5, 3));
                });
            });
            test('#50471 Join lines at the end of document', function () {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const joinLinesAction = new linesOperations_1.$N9();
                    editor.setSelection(new selection_1.$ms(2, 1, 2, 1));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'hello');
                    assert.strictEqual(model.getLineContent(2), 'world');
                    assertSelection(editor, new selection_1.$ms(2, 6, 2, 6));
                });
            });
            test('should work in multi cursor mode', function () {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world',
                    'hello ',
                    'world',
                    'hello		',
                    '	world',
                    'hello   ',
                    '	world',
                    '',
                    '',
                    'hello world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const joinLinesAction = new linesOperations_1.$N9();
                    editor.setSelections([
                        /** primary cursor */
                        new selection_1.$ms(5, 2, 5, 2),
                        new selection_1.$ms(1, 2, 1, 2),
                        new selection_1.$ms(3, 2, 4, 2),
                        new selection_1.$ms(5, 4, 6, 3),
                        new selection_1.$ms(7, 5, 8, 4),
                        new selection_1.$ms(10, 1, 10, 1)
                    ]);
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLinesContent().join('\n'), 'hello world\nhello world\nhello world\nhello world\n\nhello world');
                    assertSelection(editor, [
                        /** primary cursor */
                        new selection_1.$ms(3, 4, 3, 8),
                        new selection_1.$ms(1, 6, 1, 6),
                        new selection_1.$ms(2, 2, 2, 8),
                        new selection_1.$ms(4, 5, 4, 9),
                        new selection_1.$ms(6, 1, 6, 1)
                    ]);
                });
            });
            test('should push undo stop', function () {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const joinLinesAction = new linesOperations_1.$N9();
                    editor.setSelection(new selection_1.$ms(1, 6, 1, 6));
                    editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' my dear' });
                    assert.strictEqual(model.getLineContent(1), 'hello my dear');
                    assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 14, 1, 14));
                    executeAction(joinLinesAction, editor);
                    assert.strictEqual(model.getLineContent(1), 'hello my dear world');
                    assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 14, 1, 14));
                    coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                    assert.strictEqual(model.getLineContent(1), 'hello my dear');
                    assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 14, 1, 14));
                });
            });
        });
        test('transpose', () => {
            (0, testCodeEditor_1.$X0b)([
                'hello world',
                '',
                '',
                '   ',
            ], {}, (editor) => {
                const model = editor.getModel();
                const transposeAction = new linesOperations_1.$O9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(1), 'hello world');
                assertSelection(editor, new selection_1.$ms(1, 2, 1, 2));
                editor.setSelection(new selection_1.$ms(1, 6, 1, 6));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(1), 'hell oworld');
                assertSelection(editor, new selection_1.$ms(1, 7, 1, 7));
                editor.setSelection(new selection_1.$ms(1, 12, 1, 12));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(1), 'hell oworl');
                assertSelection(editor, new selection_1.$ms(2, 2, 2, 2));
                editor.setSelection(new selection_1.$ms(3, 1, 3, 1));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(3), '');
                assertSelection(editor, new selection_1.$ms(4, 1, 4, 1));
                editor.setSelection(new selection_1.$ms(4, 2, 4, 2));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(4), '   ');
                assertSelection(editor, new selection_1.$ms(4, 3, 4, 3));
            });
            // fix #16633
            (0, testCodeEditor_1.$X0b)([
                '',
                '',
                'hello',
                'world',
                '',
                'hello world',
                '',
                'hello world'
            ], {}, (editor) => {
                const model = editor.getModel();
                const transposeAction = new linesOperations_1.$O9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(2), '');
                assertSelection(editor, new selection_1.$ms(2, 1, 2, 1));
                editor.setSelection(new selection_1.$ms(3, 6, 3, 6));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(4), 'oworld');
                assertSelection(editor, new selection_1.$ms(4, 2, 4, 2));
                editor.setSelection(new selection_1.$ms(6, 12, 6, 12));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(7), 'd');
                assertSelection(editor, new selection_1.$ms(7, 2, 7, 2));
                editor.setSelection(new selection_1.$ms(8, 12, 8, 12));
                executeAction(transposeAction, editor);
                assert.strictEqual(model.getLineContent(8), 'hello world');
                assertSelection(editor, new selection_1.$ms(8, 12, 8, 12));
            });
        });
        test('toggle case', function () {
            (0, testCodeEditor_1.$X0b)([
                'hello world',
                'öçşğü',
                'parseHTMLString',
                'getElementById',
                'insertHTML',
                'PascalCase',
                'CSSSelectorsList',
                'iD',
                'tEST',
                'öçşÖÇŞğüĞÜ',
                'audioConverter.convertM4AToMP3();',
                'snake_case',
                'Capital_Snake_Case',
                `function helloWorld() {
				return someGlobalObject.printHelloWorld("en", "utf-8");
				}
				helloWorld();`.replace(/^\s+/gm, ''),
                `'JavaScript'`,
                'parseHTML4String',
                '_accessor: ServicesAccessor'
            ], {}, (editor) => {
                const model = editor.getModel();
                const uppercaseAction = new linesOperations_1.$Q9();
                const lowercaseAction = new linesOperations_1.$R9();
                const titlecaseAction = new linesOperations_1.$S9();
                const snakecaseAction = new linesOperations_1.$T9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 12));
                executeAction(uppercaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'HELLO WORLD');
                assertSelection(editor, new selection_1.$ms(1, 1, 1, 12));
                editor.setSelection(new selection_1.$ms(1, 1, 1, 12));
                executeAction(lowercaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'hello world');
                assertSelection(editor, new selection_1.$ms(1, 1, 1, 12));
                editor.setSelection(new selection_1.$ms(1, 3, 1, 3));
                executeAction(uppercaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'HELLO world');
                assertSelection(editor, new selection_1.$ms(1, 3, 1, 3));
                editor.setSelection(new selection_1.$ms(1, 4, 1, 4));
                executeAction(lowercaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'hello world');
                assertSelection(editor, new selection_1.$ms(1, 4, 1, 4));
                editor.setSelection(new selection_1.$ms(1, 1, 1, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'Hello World');
                assertSelection(editor, new selection_1.$ms(1, 1, 1, 12));
                editor.setSelection(new selection_1.$ms(2, 1, 2, 6));
                executeAction(uppercaseAction, editor);
                assert.strictEqual(model.getLineContent(2), 'ÖÇŞĞÜ');
                assertSelection(editor, new selection_1.$ms(2, 1, 2, 6));
                editor.setSelection(new selection_1.$ms(2, 1, 2, 6));
                executeAction(lowercaseAction, editor);
                assert.strictEqual(model.getLineContent(2), 'öçşğü');
                assertSelection(editor, new selection_1.$ms(2, 1, 2, 6));
                editor.setSelection(new selection_1.$ms(2, 1, 2, 6));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(2), 'Öçşğü');
                assertSelection(editor, new selection_1.$ms(2, 1, 2, 6));
                editor.setSelection(new selection_1.$ms(3, 1, 3, 16));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(3), 'parse_html_string');
                assertSelection(editor, new selection_1.$ms(3, 1, 3, 18));
                editor.setSelection(new selection_1.$ms(4, 1, 4, 15));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(4), 'get_element_by_id');
                assertSelection(editor, new selection_1.$ms(4, 1, 4, 18));
                editor.setSelection(new selection_1.$ms(5, 1, 5, 11));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(5), 'insert_html');
                assertSelection(editor, new selection_1.$ms(5, 1, 5, 12));
                editor.setSelection(new selection_1.$ms(6, 1, 6, 11));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(6), 'pascal_case');
                assertSelection(editor, new selection_1.$ms(6, 1, 6, 12));
                editor.setSelection(new selection_1.$ms(7, 1, 7, 17));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(7), 'css_selectors_list');
                assertSelection(editor, new selection_1.$ms(7, 1, 7, 19));
                editor.setSelection(new selection_1.$ms(8, 1, 8, 3));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(8), 'i_d');
                assertSelection(editor, new selection_1.$ms(8, 1, 8, 4));
                editor.setSelection(new selection_1.$ms(9, 1, 9, 5));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(9), 't_est');
                assertSelection(editor, new selection_1.$ms(9, 1, 9, 6));
                editor.setSelection(new selection_1.$ms(10, 1, 10, 11));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(10), 'öçş_öç_şğü_ğü');
                assertSelection(editor, new selection_1.$ms(10, 1, 10, 14));
                editor.setSelection(new selection_1.$ms(11, 1, 11, 34));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(11), 'audio_converter.convert_m4a_to_mp3();');
                assertSelection(editor, new selection_1.$ms(11, 1, 11, 38));
                editor.setSelection(new selection_1.$ms(12, 1, 12, 11));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(12), 'snake_case');
                assertSelection(editor, new selection_1.$ms(12, 1, 12, 11));
                editor.setSelection(new selection_1.$ms(13, 1, 13, 19));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(13), 'capital_snake_case');
                assertSelection(editor, new selection_1.$ms(13, 1, 13, 19));
                editor.setSelection(new selection_1.$ms(14, 1, 17, 14));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getValueInRange(new selection_1.$ms(14, 1, 17, 15)), `function hello_world() {
					return some_global_object.print_hello_world("en", "utf-8");
				}
				hello_world();`.replace(/^\s+/gm, ''));
                assertSelection(editor, new selection_1.$ms(14, 1, 17, 15));
                editor.setSelection(new selection_1.$ms(18, 1, 18, 13));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(18), `'java_script'`);
                assertSelection(editor, new selection_1.$ms(18, 1, 18, 14));
                editor.setSelection(new selection_1.$ms(19, 1, 19, 17));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(19), 'parse_html4_string');
                assertSelection(editor, new selection_1.$ms(19, 1, 19, 19));
                editor.setSelection(new selection_1.$ms(20, 1, 20, 28));
                executeAction(snakecaseAction, editor);
                assert.strictEqual(model.getLineContent(20), '_accessor: services_accessor');
                assertSelection(editor, new selection_1.$ms(20, 1, 20, 29));
            });
            (0, testCodeEditor_1.$X0b)([
                'foO baR BaZ',
                'foO\'baR\'BaZ',
                'foO[baR]BaZ',
                'foO`baR~BaZ',
                'foO^baR%BaZ',
                'foO$baR!BaZ',
                '\'physician\'s assistant\''
            ], {}, (editor) => {
                const model = editor.getModel();
                const titlecaseAction = new linesOperations_1.$S9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'Foo Bar Baz');
                editor.setSelection(new selection_1.$ms(2, 1, 2, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(2), 'Foo\'bar\'baz');
                editor.setSelection(new selection_1.$ms(3, 1, 3, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(3), 'Foo[Bar]Baz');
                editor.setSelection(new selection_1.$ms(4, 1, 4, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(4), 'Foo`Bar~Baz');
                editor.setSelection(new selection_1.$ms(5, 1, 5, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(5), 'Foo^Bar%Baz');
                editor.setSelection(new selection_1.$ms(6, 1, 6, 12));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(6), 'Foo$Bar!Baz');
                editor.setSelection(new selection_1.$ms(7, 1, 7, 23));
                executeAction(titlecaseAction, editor);
                assert.strictEqual(model.getLineContent(7), '\'Physician\'s Assistant\'');
            });
            (0, testCodeEditor_1.$X0b)([
                'camel from words',
                'from_snake_case',
                'from-kebab-case',
                'alreadyCamel',
                'ReTain_any_CAPitalization',
                'my_var.test_function()',
                'öçş_öç_şğü_ğü'
            ], {}, (editor) => {
                const model = editor.getModel();
                const camelcaseAction = new linesOperations_1.$U9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 18));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'camelFromWords');
                editor.setSelection(new selection_1.$ms(2, 1, 2, 15));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(2), 'fromSnakeCase');
                editor.setSelection(new selection_1.$ms(3, 1, 3, 15));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(3), 'fromKebabCase');
                editor.setSelection(new selection_1.$ms(4, 1, 4, 12));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(4), 'alreadyCamel');
                editor.setSelection(new selection_1.$ms(5, 1, 5, 26));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(5), 'ReTainAnyCAPitalization');
                editor.setSelection(new selection_1.$ms(6, 1, 6, 23));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(6), 'myVar.testFunction()');
                editor.setSelection(new selection_1.$ms(7, 1, 7, 14));
                executeAction(camelcaseAction, editor);
                assert.strictEqual(model.getLineContent(7), 'öçşÖçŞğüĞü');
            });
            (0, testCodeEditor_1.$X0b)([
                '',
                '   '
            ], {}, (editor) => {
                const model = editor.getModel();
                const uppercaseAction = new linesOperations_1.$Q9();
                const lowercaseAction = new linesOperations_1.$R9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                executeAction(uppercaseAction, editor);
                assert.strictEqual(model.getLineContent(1), '');
                assertSelection(editor, new selection_1.$ms(1, 1, 1, 1));
                editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                executeAction(lowercaseAction, editor);
                assert.strictEqual(model.getLineContent(1), '');
                assertSelection(editor, new selection_1.$ms(1, 1, 1, 1));
                editor.setSelection(new selection_1.$ms(2, 2, 2, 2));
                executeAction(uppercaseAction, editor);
                assert.strictEqual(model.getLineContent(2), '   ');
                assertSelection(editor, new selection_1.$ms(2, 2, 2, 2));
                editor.setSelection(new selection_1.$ms(2, 2, 2, 2));
                executeAction(lowercaseAction, editor);
                assert.strictEqual(model.getLineContent(2), '   ');
                assertSelection(editor, new selection_1.$ms(2, 2, 2, 2));
            });
            (0, testCodeEditor_1.$X0b)([
                'hello world',
                'öçşğü',
                'parseHTMLString',
                'getElementById',
                'PascalCase',
                'öçşÖÇŞğüĞÜ',
                'audioConverter.convertM4AToMP3();',
                'Capital_Snake_Case',
                'parseHTML4String',
                '_accessor: ServicesAccessor',
                'Kebab-Case',
            ], {}, (editor) => {
                const model = editor.getModel();
                const kebabCaseAction = new linesOperations_1.$V9();
                editor.setSelection(new selection_1.$ms(1, 1, 1, 12));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(1), 'hello world');
                assertSelection(editor, new selection_1.$ms(1, 1, 1, 12));
                editor.setSelection(new selection_1.$ms(2, 1, 2, 6));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(2), 'öçşğü');
                assertSelection(editor, new selection_1.$ms(2, 1, 2, 6));
                editor.setSelection(new selection_1.$ms(3, 1, 3, 16));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(3), 'parse-html-string');
                assertSelection(editor, new selection_1.$ms(3, 1, 3, 18));
                editor.setSelection(new selection_1.$ms(4, 1, 4, 15));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(4), 'get-element-by-id');
                assertSelection(editor, new selection_1.$ms(4, 1, 4, 18));
                editor.setSelection(new selection_1.$ms(5, 1, 5, 11));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(5), 'pascal-case');
                assertSelection(editor, new selection_1.$ms(5, 1, 5, 12));
                editor.setSelection(new selection_1.$ms(6, 1, 6, 11));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(6), 'öçş-öç-şğü-ğü');
                assertSelection(editor, new selection_1.$ms(6, 1, 6, 14));
                editor.setSelection(new selection_1.$ms(7, 1, 7, 34));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(7), 'audio-converter.convert-m4a-to-mp3();');
                assertSelection(editor, new selection_1.$ms(7, 1, 7, 38));
                editor.setSelection(new selection_1.$ms(8, 1, 8, 19));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(8), 'capital-snake-case');
                assertSelection(editor, new selection_1.$ms(8, 1, 8, 19));
                editor.setSelection(new selection_1.$ms(9, 1, 9, 17));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(9), 'parse-html4-string');
                assertSelection(editor, new selection_1.$ms(9, 1, 9, 19));
                editor.setSelection(new selection_1.$ms(10, 1, 10, 28));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(10), '_accessor: services-accessor');
                assertSelection(editor, new selection_1.$ms(10, 1, 10, 29));
                editor.setSelection(new selection_1.$ms(11, 1, 11, 11));
                executeAction(kebabCaseAction, editor);
                assert.strictEqual(model.getLineContent(11), 'kebab-case');
                assertSelection(editor, new selection_1.$ms(11, 1, 11, 11));
            });
        });
        suite('DeleteAllRightAction', () => {
            test('should be noop on empty', () => {
                (0, testCodeEditor_1.$X0b)([''], {}, (editor) => {
                    const model = editor.getModel();
                    const action = new linesOperations_1.$M9();
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 1, 1, 1)]);
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 1, 1, 1)]);
                    editor.setSelections([new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(1, 1, 1, 1)]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 1, 1, 1)]);
                });
            });
            test('should delete selected range', () => {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const action = new linesOperations_1.$M9();
                    editor.setSelection(new selection_1.$ms(1, 2, 1, 5));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['ho', 'world']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 2, 1, 2)]);
                    editor.setSelection(new selection_1.$ms(1, 1, 2, 4));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['ld']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 1, 1, 1)]);
                    editor.setSelection(new selection_1.$ms(1, 1, 1, 3));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 1, 1, 1)]);
                });
            });
            test('should delete to the right of the cursor', () => {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const action = new linesOperations_1.$M9();
                    editor.setSelection(new selection_1.$ms(1, 3, 1, 3));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['he', 'world']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 3, 1, 3)]);
                    editor.setSelection(new selection_1.$ms(2, 1, 2, 1));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['he', '']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(2, 1, 2, 1)]);
                });
            });
            test('should join two lines, if at the end of the line', () => {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const action = new linesOperations_1.$M9();
                    editor.setSelection(new selection_1.$ms(1, 6, 1, 6));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['helloworld']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 6, 1, 6)]);
                    editor.setSelection(new selection_1.$ms(1, 6, 1, 6));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['hello']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 6, 1, 6)]);
                    editor.setSelection(new selection_1.$ms(1, 6, 1, 6));
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['hello']);
                    assert.deepStrictEqual(editor.getSelections(), [new selection_1.$ms(1, 6, 1, 6)]);
                });
            });
            test('should work with multiple cursors', () => {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'there',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const action = new linesOperations_1.$M9();
                    editor.setSelections([
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(1, 6, 1, 6),
                        new selection_1.$ms(3, 4, 3, 4),
                    ]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['hethere', 'wor']);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(2, 4, 2, 4)
                    ]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['he', 'wor']);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(2, 4, 2, 4)
                    ]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['hewor']);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(1, 6, 1, 6)
                    ]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['he']);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3)
                    ]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['he']);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3)
                    ]);
                });
            });
            test('should work with undo/redo', () => {
                (0, testCodeEditor_1.$X0b)([
                    'hello',
                    'there',
                    'world'
                ], {}, (editor) => {
                    const model = editor.getModel();
                    const action = new linesOperations_1.$M9();
                    editor.setSelections([
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(1, 6, 1, 6),
                        new selection_1.$ms(3, 4, 3, 4),
                    ]);
                    executeAction(action, editor);
                    assert.deepStrictEqual(model.getLinesContent(), ['hethere', 'wor']);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(2, 4, 2, 4)
                    ]);
                    coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(1, 6, 1, 6),
                        new selection_1.$ms(3, 4, 3, 4)
                    ]);
                    coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                    assert.deepStrictEqual(editor.getSelections(), [
                        new selection_1.$ms(1, 3, 1, 3),
                        new selection_1.$ms(2, 4, 2, 4)
                    ]);
                });
            });
        });
        test('InsertLineBeforeAction', () => {
            function testInsertLineBefore(lineNumber, column, callback) {
                const TEXT = [
                    'First line',
                    'Second line',
                    'Third line'
                ];
                (0, testCodeEditor_1.$X0b)(TEXT, {}, (editor, viewModel) => {
                    editor.setPosition(new position_1.$js(lineNumber, column));
                    const insertLineBeforeAction = new linesOperations_1.$I9();
                    executeAction(insertLineBeforeAction, editor);
                    callback(editor.getModel(), viewModel);
                });
            }
            testInsertLineBefore(1, 3, (model, viewModel) => {
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.$ms(1, 1, 1, 1));
                assert.strictEqual(model.getLineContent(1), '');
                assert.strictEqual(model.getLineContent(2), 'First line');
                assert.strictEqual(model.getLineContent(3), 'Second line');
                assert.strictEqual(model.getLineContent(4), 'Third line');
            });
            testInsertLineBefore(2, 3, (model, viewModel) => {
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.$ms(2, 1, 2, 1));
                assert.strictEqual(model.getLineContent(1), 'First line');
                assert.strictEqual(model.getLineContent(2), '');
                assert.strictEqual(model.getLineContent(3), 'Second line');
                assert.strictEqual(model.getLineContent(4), 'Third line');
            });
            testInsertLineBefore(3, 3, (model, viewModel) => {
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.$ms(3, 1, 3, 1));
                assert.strictEqual(model.getLineContent(1), 'First line');
                assert.strictEqual(model.getLineContent(2), 'Second line');
                assert.strictEqual(model.getLineContent(3), '');
                assert.strictEqual(model.getLineContent(4), 'Third line');
            });
        });
        test('InsertLineAfterAction', () => {
            function testInsertLineAfter(lineNumber, column, callback) {
                const TEXT = [
                    'First line',
                    'Second line',
                    'Third line'
                ];
                (0, testCodeEditor_1.$X0b)(TEXT, {}, (editor, viewModel) => {
                    editor.setPosition(new position_1.$js(lineNumber, column));
                    const insertLineAfterAction = new linesOperations_1.$J9();
                    executeAction(insertLineAfterAction, editor);
                    callback(editor.getModel(), viewModel);
                });
            }
            testInsertLineAfter(1, 3, (model, viewModel) => {
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.$ms(2, 1, 2, 1));
                assert.strictEqual(model.getLineContent(1), 'First line');
                assert.strictEqual(model.getLineContent(2), '');
                assert.strictEqual(model.getLineContent(3), 'Second line');
                assert.strictEqual(model.getLineContent(4), 'Third line');
            });
            testInsertLineAfter(2, 3, (model, viewModel) => {
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.$ms(3, 1, 3, 1));
                assert.strictEqual(model.getLineContent(1), 'First line');
                assert.strictEqual(model.getLineContent(2), 'Second line');
                assert.strictEqual(model.getLineContent(3), '');
                assert.strictEqual(model.getLineContent(4), 'Third line');
            });
            testInsertLineAfter(3, 3, (model, viewModel) => {
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.$ms(4, 1, 4, 1));
                assert.strictEqual(model.getLineContent(1), 'First line');
                assert.strictEqual(model.getLineContent(2), 'Second line');
                assert.strictEqual(model.getLineContent(3), 'Third line');
                assert.strictEqual(model.getLineContent(4), '');
            });
        });
        test('Bug 18276:[editor] Indentation broken when selection is empty', () => {
            const model = (0, testTextModel_1.$O0b)([
                'function baz() {'
            ].join('\n'), undefined, {
                insertSpaces: false,
            });
            (0, testCodeEditor_1.$X0b)(model, {}, (editor) => {
                const indentLinesAction = new linesOperations_1.$H9();
                editor.setPosition(new position_1.$js(1, 2));
                executeAction(indentLinesAction, editor);
                assert.strictEqual(model.getLineContent(1), '\tfunction baz() {');
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 3, 1, 3));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '\tf\tunction baz() {');
            });
            model.dispose();
        });
        test('issue #80736: Indenting while the cursor is at the start of a line of text causes the added spaces or tab to be selected', () => {
            const model = (0, testTextModel_1.$O0b)([
                'Some text'
            ].join('\n'), undefined, {
                insertSpaces: false,
            });
            (0, testCodeEditor_1.$X0b)(model, {}, (editor) => {
                const indentLinesAction = new linesOperations_1.$H9();
                editor.setPosition(new position_1.$js(1, 1));
                executeAction(indentLinesAction, editor);
                assert.strictEqual(model.getLineContent(1), '\tSome text');
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 2, 1, 2));
            });
            model.dispose();
        });
        test('Indenting on empty line should move cursor', () => {
            const model = (0, testTextModel_1.$O0b)([
                ''
            ].join('\n'));
            (0, testCodeEditor_1.$X0b)(model, { useTabStops: false }, (editor) => {
                const indentLinesAction = new linesOperations_1.$H9();
                editor.setPosition(new position_1.$js(1, 1));
                executeAction(indentLinesAction, editor);
                assert.strictEqual(model.getLineContent(1), '    ');
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 5, 1, 5));
            });
            model.dispose();
        });
        test('issue #62112: Delete line does not work properly when multiple cursors are on line', () => {
            const TEXT = [
                'a',
                'foo boo',
                'too',
                'c',
            ];
            (0, testCodeEditor_1.$X0b)(TEXT, {}, (editor) => {
                editor.setSelections([
                    new selection_1.$ms(2, 4, 2, 4),
                    new selection_1.$ms(2, 8, 2, 8),
                    new selection_1.$ms(3, 4, 3, 4),
                ]);
                const deleteLinesAction = new linesOperations_1.$G9();
                executeAction(deleteLinesAction, editor);
                assert.strictEqual(editor.getValue(), 'a\nc');
            });
        });
        function testDeleteLinesCommand(initialText, _initialSelections, resultingText, _resultingSelections) {
            const initialSelections = Array.isArray(_initialSelections) ? _initialSelections : [_initialSelections];
            const resultingSelections = Array.isArray(_resultingSelections) ? _resultingSelections : [_resultingSelections];
            (0, testCodeEditor_1.$X0b)(initialText, {}, (editor) => {
                editor.setSelections(initialSelections);
                const deleteLinesAction = new linesOperations_1.$G9();
                executeAction(deleteLinesAction, editor);
                assert.strictEqual(editor.getValue(), resultingText.join('\n'));
                assert.deepStrictEqual(editor.getSelections(), resultingSelections);
            });
        }
        test('empty selection in middle of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 3, 2, 3), [
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 3, 2, 3));
        });
        test('empty selection at top of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5), [
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('empty selection at end of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 2, 5, 2), [
                'first',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.$ms(4, 2, 4, 2));
        });
        test('with selection in middle of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 3, 2, 2), [
                'first',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 2, 2, 2));
        });
        test('with selection at top of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 1, 5), [
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('with selection at end of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 1, 5, 2), [
                'first',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.$ms(4, 2, 4, 2));
        });
        test('with full line selection in middle of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 1, 2, 1), [
                'first',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 2, 1));
        });
        test('with full line selection at top of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 5), [
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 5, 1, 5));
        });
        test('with full line selection at end of lines', function () {
            testDeleteLinesCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 1, 5, 2), [
                'first',
                'second line',
                'third line'
            ], new selection_1.$ms(3, 2, 3, 2));
        });
        test('multicursor 1', function () {
            testDeleteLinesCommand([
                'class P {',
                '',
                '    getA() {',
                '        if (true) {',
                '            return "a";',
                '        }',
                '    }',
                '',
                '    getB() {',
                '        if (true) {',
                '            return "b";',
                '        }',
                '    }',
                '',
                '    getC() {',
                '        if (true) {',
                '            return "c";',
                '        }',
                '    }',
                '}',
            ], [
                new selection_1.$ms(4, 1, 5, 1),
                new selection_1.$ms(10, 1, 11, 1),
                new selection_1.$ms(16, 1, 17, 1),
            ], [
                'class P {',
                '',
                '    getA() {',
                '            return "a";',
                '        }',
                '    }',
                '',
                '    getB() {',
                '            return "b";',
                '        }',
                '    }',
                '',
                '    getC() {',
                '            return "c";',
                '        }',
                '    }',
                '}',
            ], [
                new selection_1.$ms(4, 1, 4, 1),
                new selection_1.$ms(9, 1, 9, 1),
                new selection_1.$ms(14, 1, 14, 1),
            ]);
        });
    });
});
//# sourceMappingURL=linesOperations.test.js.map