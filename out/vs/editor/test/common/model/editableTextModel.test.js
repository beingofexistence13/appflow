/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/model/mirrorTextModel", "vs/editor/test/common/model/editableTextModelTestUtils", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, range_1, mirrorTextModel_1, editableTextModelTestUtils_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorModel - EditableTextModel.applyEdits updates mightContainRTL', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function testApplyEdits(original, edits, before, after) {
            const model = (0, testTextModel_1.createTextModel)(original.join('\n'));
            model.setEOL(0 /* EndOfLineSequence.LF */);
            assert.strictEqual(model.mightContainRTL(), before);
            model.applyEdits(edits);
            assert.strictEqual(model.mightContainRTL(), after);
            model.dispose();
        }
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n')
            };
        }
        test('start with RTL, insert LTR', () => {
            testApplyEdits(['Hello,\nזוהי עובדה מבוססת שדעתו'], [editOp(1, 1, 1, 1, ['hello'])], true, true);
        });
        test('start with RTL, delete RTL', () => {
            testApplyEdits(['Hello,\nזוהי עובדה מבוססת שדעתו'], [editOp(1, 1, 10, 10, [''])], true, true);
        });
        test('start with RTL, insert RTL', () => {
            testApplyEdits(['Hello,\nזוהי עובדה מבוססת שדעתו'], [editOp(1, 1, 1, 1, ['هناك حقيقة مثبتة منذ زمن طويل'])], true, true);
        });
        test('start with LTR, insert LTR', () => {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['hello'])], false, false);
        });
        test('start with LTR, insert RTL 1', () => {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['هناك حقيقة مثبتة منذ زمن طويل'])], false, true);
        });
        test('start with LTR, insert RTL 2', () => {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['זוהי עובדה מבוססת שדעתו'])], false, true);
        });
    });
    suite('EditorModel - EditableTextModel.applyEdits updates mightContainNonBasicASCII', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function testApplyEdits(original, edits, before, after) {
            const model = (0, testTextModel_1.createTextModel)(original.join('\n'));
            model.setEOL(0 /* EndOfLineSequence.LF */);
            assert.strictEqual(model.mightContainNonBasicASCII(), before);
            model.applyEdits(edits);
            assert.strictEqual(model.mightContainNonBasicASCII(), after);
            model.dispose();
        }
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n')
            };
        }
        test('start with NON-ASCII, insert ASCII', () => {
            testApplyEdits(['Hello,\nZürich'], [editOp(1, 1, 1, 1, ['hello', 'second line'])], true, true);
        });
        test('start with NON-ASCII, delete NON-ASCII', () => {
            testApplyEdits(['Hello,\nZürich'], [editOp(1, 1, 10, 10, [''])], true, true);
        });
        test('start with NON-ASCII, insert NON-ASCII', () => {
            testApplyEdits(['Hello,\nZürich'], [editOp(1, 1, 1, 1, ['Zürich'])], true, true);
        });
        test('start with ASCII, insert ASCII', () => {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['hello', 'second line'])], false, false);
        });
        test('start with ASCII, insert NON-ASCII', () => {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['Zürich', 'Zürich'])], false, true);
        });
    });
    suite('EditorModel - EditableTextModel.applyEdits', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n'),
                forceMoveMarkers: false
            };
        }
        test('high-low surrogates 1', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 2, 1, 2, ['a'])
            ], [
                'a📚some',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('high-low surrogates 2', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 2, 1, 3, ['a'])
            ], [
                'asome',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('high-low surrogates 3', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 1, 1, 2, ['a'])
            ], [
                'asome',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('high-low surrogates 4', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 1, 1, 3, ['a'])
            ], [
                'asome',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('Bug 19872: Undo is funky', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'something',
                ' A',
                '',
                ' B',
                'something else'
            ], [
                editOp(2, 1, 2, 2, ['']),
                editOp(3, 1, 4, 2, [''])
            ], [
                'something',
                'A',
                'B',
                'something else'
            ]);
        });
        test('Bug 19872: Undo is funky (2)', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'something',
                'A',
                'B',
                'something else'
            ], [
                editOp(2, 1, 2, 1, [' ']),
                editOp(3, 1, 3, 1, ['', ' '])
            ], [
                'something',
                ' A',
                '',
                ' B',
                'something else'
            ]);
        });
        test('insert empty text', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 1, [''])
            ], [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('last op is no-op', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(4, 1, 4, 1, [''])
            ], [
                'y First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text without newline 1', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 1, ['foo '])
            ], [
                'foo My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text without newline 2', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, [' foo'])
            ], [
                'My foo First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert one newline', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 4, 1, 4, ['', ''])
            ], [
                'My ',
                'First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text with one newline', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, [' new line', 'No longer'])
            ], [
                'My new line',
                'No longer First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text with two newlines', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, [' new line', 'One more line in the middle', 'No longer'])
            ], [
                'My new line',
                'One more line in the middle',
                'No longer First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text with many newlines', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, ['', '', '', '', ''])
            ], [
                'My',
                '',
                '',
                '',
                ' First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert multiple newlines', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, ['', '', '', '', '']),
                editOp(3, 15, 3, 15, ['a', 'b'])
            ], [
                'My',
                '',
                '',
                '',
                ' First Line',
                '\t\tMy Second Line',
                '    Third Linea',
                'b',
                '',
                '1'
            ]);
        });
        test('delete empty text', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 1, [''])
            ], [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from one line', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 2, [''])
            ], [
                'y First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from one line 2', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 3, ['a'])
            ], [
                'a First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete all text from a line', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 14, [''])
            ], [
                '',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from two lines', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 4, 2, 6, [''])
            ], [
                'My Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from many lines', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 4, 3, 5, [''])
            ], [
                'My Third Line',
                '',
                '1'
            ]);
        });
        test('delete everything', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 5, 2, [''])
            ], [
                ''
            ]);
        });
        test('two unrelated edits', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], [
                editOp(2, 1, 2, 3, ['\t']),
                editOp(3, 1, 3, 5, [''])
            ], [
                'My First Line',
                '\tMy Second Line',
                'Third Line',
                '',
                '123'
            ]);
        });
        test('two edits on one line', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], [
                editOp(5, 3, 5, 7, ['']),
                editOp(5, 12, 5, 16, [''])
            ], [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ]);
        });
        test('many edits', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '{"x" : 1}'
            ], [
                editOp(1, 2, 1, 2, ['\n  ']),
                editOp(1, 5, 1, 6, ['']),
                editOp(1, 9, 1, 9, ['\n'])
            ], [
                '{',
                '  "x": 1',
                '}'
            ]);
        });
        test('many edits reversed', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '{',
                '  "x": 1',
                '}'
            ], [
                editOp(1, 2, 2, 3, ['']),
                editOp(2, 6, 2, 6, [' ']),
                editOp(2, 9, 3, 1, [''])
            ], [
                '{"x" : 1}'
            ]);
        });
        test('replacing newlines 1', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '{',
                '"a": true,',
                '',
                '"b": true',
                '}'
            ], [
                editOp(1, 2, 2, 1, ['', '\t']),
                editOp(2, 11, 4, 1, ['', '\t'])
            ], [
                '{',
                '\t"a": true,',
                '\t"b": true',
                '}'
            ]);
        });
        test('replacing newlines 2', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'some text',
                'some more text',
                'now comes an empty line',
                '',
                'after empty line',
                'and the last line'
            ], [
                editOp(1, 5, 3, 1, [' text', 'some more text', 'some more text']),
                editOp(3, 2, 4, 1, ['o more lines', 'asd', 'asd', 'asd']),
                editOp(5, 1, 5, 6, ['zzzzzzzz']),
                editOp(5, 11, 6, 16, ['1', '2', '3', '4'])
            ], [
                'some text',
                'some more text',
                'some more textno more lines',
                'asd',
                'asd',
                'asd',
                'zzzzzzzz empt1',
                '2',
                '3',
                '4ne'
            ]);
        });
        test('advanced 1', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                ' {       "d": [',
                '             null',
                '        ] /*comment*/',
                '        ,"e": /*comment*/ [null] }',
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(1, 3, 1, 10, ['', '  ']),
                editOp(1, 16, 2, 14, ['', '    ']),
                editOp(2, 18, 3, 9, ['', '  ']),
                editOp(3, 22, 4, 9, ['']),
                editOp(4, 10, 4, 10, ['', '  ']),
                editOp(4, 28, 4, 28, ['', '    ']),
                editOp(4, 32, 4, 32, ['', '  ']),
                editOp(4, 33, 4, 34, ['', ''])
            ], [
                '{',
                '  "d": [',
                '    null',
                '  ] /*comment*/,',
                '  "e": /*comment*/ [',
                '    null',
                '  ]',
                '}',
            ]);
        });
        test('advanced simplified', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                '   abc',
                ' ,def'
            ], [
                editOp(1, 1, 1, 4, ['']),
                editOp(1, 7, 2, 2, ['']),
                editOp(2, 3, 2, 3, ['', ''])
            ], [
                'abc,',
                'def'
            ]);
        });
        test('issue #144', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'package caddy',
                '',
                'func main() {',
                '\tfmt.Println("Hello World! :)")',
                '}',
                ''
            ], [
                editOp(1, 1, 6, 1, [
                    'package caddy',
                    '',
                    'import "fmt"',
                    '',
                    'func main() {',
                    '\tfmt.Println("Hello World! :)")',
                    '}',
                    ''
                ])
            ], [
                'package caddy',
                '',
                'import "fmt"',
                '',
                'func main() {',
                '\tfmt.Println("Hello World! :)")',
                '}',
                ''
            ]);
        });
        test('issue #2586 Replacing selected end-of-line with newline locks up the document', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'something',
                'interesting'
            ], [
                editOp(1, 10, 2, 1, ['', ''])
            ], [
                'something',
                'interesting'
            ]);
        });
        test('issue #3980', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'class A {',
                '    someProperty = false;',
                '    someMethod() {',
                '    this.someMethod();',
                '    }',
                '}',
            ], [
                editOp(1, 8, 1, 9, ['', '']),
                editOp(3, 17, 3, 18, ['', '']),
                editOp(3, 18, 3, 18, ['    ']),
                editOp(4, 5, 4, 5, ['    ']),
            ], [
                'class A',
                '{',
                '    someProperty = false;',
                '    someMethod()',
                '    {',
                '        this.someMethod();',
                '    }',
                '}',
            ]);
        });
        function testApplyEditsFails(original, edits) {
            const model = (0, testTextModel_1.createTextModel)(original.join('\n'));
            let hasThrown = false;
            try {
                model.applyEdits(edits);
            }
            catch (err) {
                hasThrown = true;
            }
            assert.ok(hasThrown, 'expected model.applyEdits to fail.');
            model.dispose();
        }
        test('touching edits: two inserts at the same position', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'hello world'
            ], [
                editOp(1, 1, 1, 1, ['a']),
                editOp(1, 1, 1, 1, ['b']),
            ], [
                'abhello world'
            ]);
        });
        test('touching edits: insert and replace touching', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'hello world'
            ], [
                editOp(1, 1, 1, 1, ['b']),
                editOp(1, 1, 1, 3, ['ab']),
            ], [
                'babllo world'
            ]);
        });
        test('overlapping edits: two overlapping replaces', () => {
            testApplyEditsFails([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['b']),
                editOp(1, 1, 1, 3, ['ab']),
            ]);
        });
        test('overlapping edits: two overlapping deletes', () => {
            testApplyEditsFails([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(1, 1, 1, 3, ['']),
            ]);
        });
        test('touching edits: two touching replaces', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['H']),
                editOp(1, 2, 1, 3, ['E']),
            ], [
                'HEllo world'
            ]);
        });
        test('touching edits: two touching deletes', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(1, 2, 1, 3, ['']),
            ], [
                'llo world'
            ]);
        });
        test('touching edits: insert and replace', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'hello world'
            ], [
                editOp(1, 1, 1, 1, ['H']),
                editOp(1, 1, 1, 3, ['e']),
            ], [
                'Hello world'
            ]);
        });
        test('touching edits: replace and insert', () => {
            (0, editableTextModelTestUtils_1.testApplyEditsWithSyncedModels)([
                'hello world'
            ], [
                editOp(1, 1, 1, 3, ['H']),
                editOp(1, 3, 1, 3, ['e']),
            ], [
                'Hello world'
            ]);
        });
        test('change while emitting events 1', () => {
            let disposable;
            (0, editableTextModelTestUtils_1.assertSyncedModels)('Hello', (model, assertMirrorModels) => {
                model.applyEdits([{
                        range: new range_1.Range(1, 6, 1, 6),
                        text: ' world!',
                        // forceMoveMarkers: false
                    }]);
                assertMirrorModels();
            }, (model) => {
                let isFirstTime = true;
                disposable = model.onDidChangeContent(() => {
                    if (!isFirstTime) {
                        return;
                    }
                    isFirstTime = false;
                    model.applyEdits([{
                            range: new range_1.Range(1, 13, 1, 13),
                            text: ' How are you?',
                            // forceMoveMarkers: false
                        }]);
                });
            });
            disposable.dispose();
        });
        test('change while emitting events 2', () => {
            let disposable;
            (0, editableTextModelTestUtils_1.assertSyncedModels)('Hello', (model, assertMirrorModels) => {
                model.applyEdits([{
                        range: new range_1.Range(1, 6, 1, 6),
                        text: ' world!',
                        // forceMoveMarkers: false
                    }]);
                assertMirrorModels();
            }, (model) => {
                let isFirstTime = true;
                disposable = model.onDidChangeContent((e) => {
                    if (!isFirstTime) {
                        return;
                    }
                    isFirstTime = false;
                    model.applyEdits([{
                            range: new range_1.Range(1, 13, 1, 13),
                            text: ' How are you?',
                            // forceMoveMarkers: false
                        }]);
                });
            });
            disposable.dispose();
        });
        test('issue #1580: Changes in line endings are not correctly reflected in the extension host, leading to invalid offsets sent to external refactoring tools', () => {
            const model = (0, testTextModel_1.createTextModel)('Hello\nWorld!');
            assert.strictEqual(model.getEOL(), '\n');
            const mirrorModel2 = new mirrorTextModel_1.MirrorTextModel(null, model.getLinesContent(), model.getEOL(), model.getVersionId());
            let mirrorModel2PrevVersionId = model.getVersionId();
            const disposable = model.onDidChangeContent((e) => {
                const versionId = e.versionId;
                if (versionId < mirrorModel2PrevVersionId) {
                    console.warn('Model version id did not advance between edits (2)');
                }
                mirrorModel2PrevVersionId = versionId;
                mirrorModel2.onEvents(e);
            });
            const assertMirrorModels = () => {
                assert.strictEqual(mirrorModel2.getText(), model.getValue(), 'mirror model 2 text OK');
                assert.strictEqual(mirrorModel2.version, model.getVersionId(), 'mirror model 2 version OK');
            };
            model.setEOL(1 /* EndOfLineSequence.CRLF */);
            assertMirrorModels();
            disposable.dispose();
            model.dispose();
            mirrorModel2.dispose();
        });
        test('issue #47733: Undo mangles unicode characters', () => {
            const model = (0, testTextModel_1.createTextModel)('\'👁\'');
            model.applyEdits([
                { range: new range_1.Range(1, 1, 1, 1), text: '"' },
                { range: new range_1.Range(1, 2, 1, 2), text: '"' },
            ]);
            assert.strictEqual(model.getValue(1 /* EndOfLinePreference.LF */), '"\'"👁\'');
            assert.deepStrictEqual(model.validateRange(new range_1.Range(1, 3, 1, 4)), new range_1.Range(1, 3, 1, 4));
            model.applyEdits([
                { range: new range_1.Range(1, 1, 1, 2), text: null },
                { range: new range_1.Range(1, 3, 1, 4), text: null },
            ]);
            assert.strictEqual(model.getValue(1 /* EndOfLinePreference.LF */), '\'👁\'');
            model.dispose();
        });
        test('issue #48741: Broken undo stack with move lines up with multiple cursors', () => {
            const model = (0, testTextModel_1.createTextModel)([
                'line1',
                'line2',
                'line3',
                '',
            ].join('\n'));
            const undoEdits = model.applyEdits([
                { range: new range_1.Range(4, 1, 4, 1), text: 'line3', },
                { range: new range_1.Range(3, 1, 3, 6), text: null, },
                { range: new range_1.Range(2, 1, 3, 1), text: null, },
                { range: new range_1.Range(3, 6, 3, 6), text: '\nline2' }
            ], true);
            model.applyEdits(undoEdits);
            assert.deepStrictEqual(model.getValue(), 'line1\nline2\nline3\n');
            model.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdGFibGVUZXh0TW9kZWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2RlbC9lZGl0YWJsZVRleHRNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQyxvRUFBb0UsRUFBRSxHQUFHLEVBQUU7UUFFaEYsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLFNBQVMsY0FBYyxDQUFDLFFBQWtCLEVBQUUsS0FBNkIsRUFBRSxNQUFlLEVBQUUsS0FBYztZQUN6RyxNQUFNLEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25ELEtBQUssQ0FBQyxNQUFNLDhCQUFzQixDQUFDO1lBRW5DLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXBELEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxTQUFTLE1BQU0sQ0FBQyxlQUF1QixFQUFFLFdBQW1CLEVBQUUsYUFBcUIsRUFBRSxTQUFpQixFQUFFLElBQWM7WUFDckgsT0FBTztnQkFDTixLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsZUFBZSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDO2dCQUN4RSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDckIsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsNEJBQTRCLEVBQUUsR0FB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