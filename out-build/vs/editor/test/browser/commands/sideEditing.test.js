/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, editOperation_1, position_1, range_1, selection_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testCommand(lines, selections, edits, expectedLines, expectedSelections) {
        (0, testCodeEditor_1.$X0b)(lines, {}, (editor, viewModel) => {
            const model = editor.getModel();
            viewModel.setSelections('tests', selections);
            model.applyEdits(edits);
            assert.deepStrictEqual(model.getLinesContent(), expectedLines);
            const actualSelections = viewModel.getSelections();
            assert.deepStrictEqual(actualSelections.map(s => s.toString()), expectedSelections.map(s => s.toString()));
        });
    }
    suite('Editor Side Editing - collapsed selection', () => {
        (0, utils_1.$bT)();
        test('replace at selection', () => {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 1, 1, 1)], [
                editOperation_1.$ls.replace(new selection_1.$ms(1, 1, 1, 1), 'something ')
            ], [
                'something first',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 11, 1, 11)]);
        });
        test('replace at selection 2', () => {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 1, 1, 6)], [
                editOperation_1.$ls.replace(new selection_1.$ms(1, 1, 1, 6), 'something')
            ], [
                'something',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 1, 1, 10)]);
        });
        test('insert at selection', () => {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 1, 1, 1)], [
                editOperation_1.$ls.insert(new position_1.$js(1, 1), 'something ')
            ], [
                'something first',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 11, 1, 11)]);
        });
        test('insert at selection sitting on max column', () => {
            testCommand([
                'first',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(1, 6, 1, 6)], [
                editOperation_1.$ls.insert(new position_1.$js(1, 6), ' something\nnew ')
            ], [
                'first something',
                'new ',
                'second line',
                'third line',
                'fourth'
            ], [new selection_1.$ms(2, 5, 2, 5)]);
        });
        test('issue #3994: replace on top of selection', () => {
            testCommand([
                '$obj = New-Object "system.col"'
            ], [new selection_1.$ms(1, 30, 1, 30)], [
                editOperation_1.$ls.replaceMove(new range_1.$ks(1, 19, 1, 31), '"System.Collections"')
            ], [
                '$obj = New-Object "System.Collections"'
            ], [new selection_1.$ms(1, 39, 1, 39)]);
        });
        test('issue #15267: Suggestion that adds a line - cursor goes to the wrong line ', () => {
            testCommand([
                'package main',
                '',
                'import (',
                '	"fmt"',
                ')',
                '',
                'func main(',
                '	fmt.Println(strings.Con)',
                '}'
            ], [new selection_1.$ms(8, 25, 8, 25)], [
                editOperation_1.$ls.replaceMove(new range_1.$ks(5, 1, 5, 1), '\t\"strings\"\n')
            ], [
                'package main',
                '',
                'import (',
                '	"fmt"',
                '	"strings"',
                ')',
                '',
                'func main(',
                '	fmt.Println(strings.Con)',
                '}'
            ], [new selection_1.$ms(9, 25, 9, 25)]);
        });
        test('issue #15236: Selections broke after deleting text using vscode.TextEditor.edit ', () => {
            testCommand([
                'foofoofoo, foofoofoo, bar'
            ], [new selection_1.$ms(1, 1, 1, 10), new selection_1.$ms(1, 12, 1, 21)], [
                editOperation_1.$ls.replace(new range_1.$ks(1, 1, 1, 10), ''),
                editOperation_1.$ls.replace(new range_1.$ks(1, 12, 1, 21), ''),
            ], [
                ', , bar'
            ], [new selection_1.$ms(1, 1, 1, 1), new selection_1.$ms(1, 3, 1, 3)]);
        });
    });
    suite('SideEditing', () => {
        (0, utils_1.$bT)();
        const LINES = [
            'My First Line',
            'My Second Line',
            'Third Line'
        ];
        function _runTest(selection, editRange, editText, editForceMoveMarkers, expected, msg) {
            (0, testCodeEditor_1.$X0b)(LINES.join('\n'), {}, (editor, viewModel) => {
                viewModel.setSelections('tests', [selection]);
                editor.getModel().applyEdits([{
                        range: editRange,
                        text: editText,
                        forceMoveMarkers: editForceMoveMarkers
                    }]);
                const actual = viewModel.getSelection();
                assert.deepStrictEqual(actual.toString(), expected.toString(), msg);
            });
        }
        function runTest(selection, editRange, editText, expected) {
            const sel1 = new selection_1.$ms(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
            _runTest(sel1, editRange, editText, false, expected[0][0], '0-0-regular-no-force');
            _runTest(sel1, editRange, editText, true, expected[1][0], '1-0-regular-force');
            // RTL selection
            const sel2 = new selection_1.$ms(selection.endLineNumber, selection.endColumn, selection.startLineNumber, selection.startColumn);
            _runTest(sel2, editRange, editText, false, expected[0][1], '0-1-inverse-no-force');
            _runTest(sel2, editRange, editText, true, expected[1][1], '1-1-inverse-force');
        }
        suite('insert', () => {
            suite('collapsed sel', () => {
                test('before', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 3), 'xx', [
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                    ]);
                });
                test('equal', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), 'xx', [
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                    ]);
                });
                test('after', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 5), 'xx', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('before', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 3), 'xx', [
                        [new selection_1.$ms(1, 6, 1, 11), new selection_1.$ms(1, 11, 1, 6)],
                        [new selection_1.$ms(1, 6, 1, 11), new selection_1.$ms(1, 11, 1, 6)],
                    ]);
                });
                test('start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 4), 'xx', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 6, 1, 11), new selection_1.$ms(1, 11, 1, 6)],
                    ]);
                });
                test('inside', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 5), 'xx', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                    ]);
                });
                test('end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 9), 'xx', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                    ]);
                });
                test('after', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 10), 'xx', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
            });
        });
        suite('delete', () => {
            suite('collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 1, 1, 3), '', [
                        [new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(1, 2, 1, 2)],
                        [new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(1, 2, 1, 2)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 2, 1, 4), '', [
                        [new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(1, 2, 1, 2)],
                        [new selection_1.$ms(1, 2, 1, 2), new selection_1.$ms(1, 2, 1, 2)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 5), '', [
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start >= range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 6), '', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 7), '', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 1, 1, 3), '', [
                        [new selection_1.$ms(1, 2, 1, 7), new selection_1.$ms(1, 7, 1, 2)],
                        [new selection_1.$ms(1, 2, 1, 7), new selection_1.$ms(1, 7, 1, 2)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 2, 1, 4), '', [
                        [new selection_1.$ms(1, 2, 1, 7), new selection_1.$ms(1, 7, 1, 2)],
                        [new selection_1.$ms(1, 2, 1, 7), new selection_1.$ms(1, 7, 1, 2)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 5), '', [
                        [new selection_1.$ms(1, 3, 1, 7), new selection_1.$ms(1, 7, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 7), new selection_1.$ms(1, 7, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 9), '', [
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 10), '', [
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 6), '', [
                        [new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(1, 7, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(1, 7, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), '', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 10), '', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 7), '', [
                        [new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(1, 7, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(1, 7, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 9), '', [
                        [new selection_1.$ms(1, 4, 1, 5), new selection_1.$ms(1, 5, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 5), new selection_1.$ms(1, 5, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 10), '', [
                        [new selection_1.$ms(1, 4, 1, 5), new selection_1.$ms(1, 5, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 5), new selection_1.$ms(1, 5, 1, 4)],
                    ]);
                });
                test('edit.start == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 11), '', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 11), '', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
            });
        });
        suite('replace short', () => {
            suite('collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 1, 1, 3), 'c', [
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 2, 1, 4), 'c', [
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 3), new selection_1.$ms(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 5), 'c', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start >= range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 6), 'c', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 5, 1, 5), new selection_1.$ms(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 7), 'c', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 1, 1, 3), 'c', [
                        [new selection_1.$ms(1, 3, 1, 8), new selection_1.$ms(1, 8, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 8), new selection_1.$ms(1, 8, 1, 3)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 2, 1, 4), 'c', [
                        [new selection_1.$ms(1, 3, 1, 8), new selection_1.$ms(1, 8, 1, 3)],
                        [new selection_1.$ms(1, 3, 1, 8), new selection_1.$ms(1, 8, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 5), 'c', [
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 9), 'c', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 10), 'c', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 6), 'c', [
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                        [new selection_1.$ms(1, 5, 1, 8), new selection_1.$ms(1, 8, 1, 5)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), 'c', [
                        [new selection_1.$ms(1, 4, 1, 5), new selection_1.$ms(1, 5, 1, 4)],
                        [new selection_1.$ms(1, 5, 1, 5), new selection_1.$ms(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 10), 'c', [
                        [new selection_1.$ms(1, 4, 1, 5), new selection_1.$ms(1, 5, 1, 4)],
                        [new selection_1.$ms(1, 5, 1, 5), new selection_1.$ms(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 7), 'c', [
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 9), 'c', [
                        [new selection_1.$ms(1, 4, 1, 6), new selection_1.$ms(1, 6, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 6), new selection_1.$ms(1, 6, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 10), 'c', [
                        [new selection_1.$ms(1, 4, 1, 6), new selection_1.$ms(1, 6, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 6), new selection_1.$ms(1, 6, 1, 4)],
                    ]);
                });
                test('edit.start == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 11), 'c', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 10), new selection_1.$ms(1, 10, 1, 4)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 11), 'c', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
            });
        });
        suite('replace long', () => {
            suite('collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 1, 1, 3), 'cccc', [
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 2, 1, 4), 'cccc', [
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                        [new selection_1.$ms(1, 6, 1, 6), new selection_1.$ms(1, 6, 1, 6)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 5), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 7, 1, 7), new selection_1.$ms(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start >= range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 6), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 8, 1, 8), new selection_1.$ms(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 7), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 4), new selection_1.$ms(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 1, 1, 3), 'cccc', [
                        [new selection_1.$ms(1, 6, 1, 11), new selection_1.$ms(1, 11, 1, 6)],
                        [new selection_1.$ms(1, 6, 1, 11), new selection_1.$ms(1, 11, 1, 6)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 2, 1, 4), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 6, 1, 11), new selection_1.$ms(1, 11, 1, 6)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 5), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 7, 1, 11), new selection_1.$ms(1, 11, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 9), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(1, 7, 1, 4)],
                        [new selection_1.$ms(1, 7, 1, 7), new selection_1.$ms(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 10), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 7), new selection_1.$ms(1, 7, 1, 4)],
                        [new selection_1.$ms(1, 7, 1, 7), new selection_1.$ms(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 6), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 8, 1, 11), new selection_1.$ms(1, 11, 1, 8)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                        [new selection_1.$ms(1, 8, 1, 8), new selection_1.$ms(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 10), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 8), new selection_1.$ms(1, 8, 1, 4)],
                        [new selection_1.$ms(1, 8, 1, 8), new selection_1.$ms(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 7), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 11), new selection_1.$ms(1, 11, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 9), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 10), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
                test('edit.start == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 11), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 13), new selection_1.$ms(1, 13, 1, 4)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 11), 'cccc', [
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                        [new selection_1.$ms(1, 4, 1, 9), new selection_1.$ms(1, 9, 1, 4)],
                    ]);
                });
            });
        });
    });
});
//# sourceMappingURL=sideEditing.test.js.map