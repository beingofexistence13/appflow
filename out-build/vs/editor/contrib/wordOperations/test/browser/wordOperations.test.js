/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/wordOperations/browser/wordOperations", "vs/editor/contrib/wordOperations/test/browser/wordTestUtils", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, coreCommands_1, position_1, selection_1, language_1, languageConfigurationRegistry_1, wordOperations_1, wordTestUtils_1, testCodeEditor_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WordOperations', () => {
        const _cursorWordStartLeft = new wordOperations_1.$j$();
        const _cursorWordEndLeft = new wordOperations_1.$k$();
        const _cursorWordLeft = new wordOperations_1.$l$();
        const _cursorWordStartLeftSelect = new wordOperations_1.$m$();
        const _cursorWordEndLeftSelect = new wordOperations_1.$n$();
        const _cursorWordLeftSelect = new wordOperations_1.$o$();
        const _cursorWordStartRight = new wordOperations_1.$r$();
        const _cursorWordEndRight = new wordOperations_1.$s$();
        const _cursorWordRight = new wordOperations_1.$t$();
        const _cursorWordStartRightSelect = new wordOperations_1.$u$();
        const _cursorWordEndRightSelect = new wordOperations_1.$v$();
        const _cursorWordRightSelect = new wordOperations_1.$w$();
        const _cursorWordAccessibilityLeft = new wordOperations_1.$p$();
        const _cursorWordAccessibilityLeftSelect = new wordOperations_1.$q$();
        const _cursorWordAccessibilityRight = new wordOperations_1.$x$();
        const _cursorWordAccessibilityRightSelect = new wordOperations_1.$y$();
        const _deleteWordLeft = new wordOperations_1.$E$();
        const _deleteWordStartLeft = new wordOperations_1.$C$();
        const _deleteWordEndLeft = new wordOperations_1.$D$();
        const _deleteWordRight = new wordOperations_1.$H$();
        const _deleteWordStartRight = new wordOperations_1.$F$();
        const _deleteWordEndRight = new wordOperations_1.$G$();
        const _deleteInsideWord = new wordOperations_1.$I$();
        let disposables;
        let instantiationService;
        let languageConfigurationService;
        let languageService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testCodeEditor_1.$Z0b)(disposables);
            languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            languageService = instantiationService.get(language_1.$ct);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        function runEditorCommand(editor, command) {
            instantiationService.invokeFunction((accessor) => {
                command.runEditorCommand(accessor, editor, null);
            });
        }
        function cursorWordLeft(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordLeftSelect : _cursorWordLeft);
        }
        function cursorWordAccessibilityLeft(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordAccessibilityLeft : _cursorWordAccessibilityLeftSelect);
        }
        function cursorWordAccessibilityRight(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordAccessibilityRightSelect : _cursorWordAccessibilityRight);
        }
        function cursorWordStartLeft(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordStartLeftSelect : _cursorWordStartLeft);
        }
        function cursorWordEndLeft(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordEndLeftSelect : _cursorWordEndLeft);
        }
        function cursorWordRight(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordRightSelect : _cursorWordRight);
        }
        function moveWordEndRight(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordEndRightSelect : _cursorWordEndRight);
        }
        function moveWordStartRight(editor, inSelectionMode = false) {
            runEditorCommand(editor, inSelectionMode ? _cursorWordStartRightSelect : _cursorWordStartRight);
        }
        function deleteWordLeft(editor) {
            runEditorCommand(editor, _deleteWordLeft);
        }
        function deleteWordStartLeft(editor) {
            runEditorCommand(editor, _deleteWordStartLeft);
        }
        function deleteWordEndLeft(editor) {
            runEditorCommand(editor, _deleteWordEndLeft);
        }
        function deleteWordRight(editor) {
            runEditorCommand(editor, _deleteWordRight);
        }
        function deleteWordStartRight(editor) {
            runEditorCommand(editor, _deleteWordStartRight);
        }
        function deleteWordEndRight(editor) {
            runEditorCommand(editor, _deleteWordEndRight);
        }
        function deleteInsideWord(editor) {
            _deleteInsideWord.run(null, editor, null);
        }
        test('cursorWordLeft - simple', () => {
            const EXPECTED = [
                '|    \t|My |First |Line\t ',
                '|\t|My |Second |Line',
                '|    |Third |Line🐶',
                '|',
                '|1',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordLeft - with selection', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor) => {
                editor.setPosition(new position_1.$js(5, 2));
                cursorWordLeft(editor, true);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(5, 2, 5, 1));
            });
        });
        test('cursorWordLeft - issue #832', () => {
            const EXPECTED = ['|   |/* |Just |some   |more   |text |a|+= |3 |+|5-|3 |+ |7 |*/  '].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordLeft - issue #48046: Word selection doesn\'t work as usual', () => {
            const EXPECTED = [
                '|deep.|object.|property',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 21), ed => cursorWordLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordLeftSelect - issue #74369: cursorWordLeft and cursorWordLeftSelect do not behave consistently', () => {
            const EXPECTED = [
                '|this.|is.|a.|test',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 15), ed => cursorWordLeft(ed, true), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordStartLeft', () => {
            // This is the behaviour observed in Visual Studio, please do not touch test
            const EXPECTED = ['|   |/* |Just |some   |more   |text |a|+= |3 |+|5|-|3 |+ |7 |*/  '].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordStartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordStartLeft - issue #51119: regression makes VS compatibility impossible', () => {
            // This is the behaviour observed in Visual Studio, please do not touch test
            const EXPECTED = ['|this|.|is|.|a|.|test'].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordStartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #51275 - cursorWordStartLeft does not push undo/redo stack element', () => {
            function type(viewModel, text) {
                for (let i = 0; i < text.length; i++) {
                    viewModel.type(text.charAt(i), 'keyboard');
                }
            }
            (0, testCodeEditor_1.$X0b)('', {}, (editor, viewModel) => {
                type(viewModel, 'foo bar baz');
                assert.strictEqual(editor.getValue(), 'foo bar baz');
                cursorWordStartLeft(editor);
                cursorWordStartLeft(editor);
                type(viewModel, 'q');
                assert.strictEqual(editor.getValue(), 'foo qbar baz');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(editor.getValue(), 'foo bar baz');
            });
        });
        test('cursorWordEndLeft', () => {
            const EXPECTED = ['|   /*| Just| some|   more|   text| a|+=| 3| +|5|-|3| +| 7| */|  '].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordEndLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordRight - simple', () => {
            const EXPECTED = [
                '    \tMy| First| Line|\t |',
                '\tMy| Second| Line|',
                '    Third| Line🐶|',
                '|',
                '1|',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(5, 2)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordRight - selection', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                editor.setPosition(new position_1.$js(1, 1));
                cursorWordRight(editor, true);
                assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 1, 1, 8));
            });
        });
        test('cursorWordRight - issue #832', () => {
            const EXPECTED = [
                '   /*| Just| some|   more|   text| a|+=| 3| +5|-3| +| 7| */|  |',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 50)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordRight - issue #41199', () => {
            const EXPECTED = [
                'console|.log|(err|)|',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 17)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('moveWordEndRight', () => {
            const EXPECTED = [
                '   /*| Just| some|   more|   text| a|+=| 3| +5|-3| +| 7| */|  |',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => moveWordEndRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 50)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('moveWordStartRight', () => {
            // This is the behaviour observed in Visual Studio, please do not touch test
            const EXPECTED = [
                '   |/* |Just |some   |more   |text |a|+= |3 |+|5|-|3 |+ |7 |*/  |',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => moveWordStartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 50)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #51119: cursorWordStartRight regression makes VS compatibility impossible', () => {
            // This is the behaviour observed in Visual Studio, please do not touch test
            const EXPECTED = ['this|.|is|.|a|.|test|'].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => moveWordStartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 15)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #64810: cursorWordStartRight skips first word after newline', () => {
            // This is the behaviour observed in Visual Studio, please do not touch test
            const EXPECTED = ['Hello |World|', '|Hei |mailman|'].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => moveWordStartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(2, 12)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordAccessibilityLeft', () => {
            const EXPECTED = ['|   /* |Just |some   |more   |text |a+= |3 +|5-|3 + |7 */  '].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordAccessibilityLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordAccessibilityRight', () => {
            const EXPECTED = ['   /* |Just |some   |more   |text |a+= |3 +|5-|3 + |7 */  |'].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordAccessibilityRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 50)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordLeft for non-empty selection', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setSelection(new selection_1.$ms(3, 7, 3, 9));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(3), '    Thd Line🐶');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(3, 7));
            });
        });
        test('deleteWordLeft for cursor at beginning of document', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 1));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(1), '    \tMy First Line\t ');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 1));
            });
        });
        test('deleteWordLeft for cursor at end of whitespace', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(3, 11));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(3), '    Line🐶');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(3, 5));
            });
        });
        test('deleteWordLeft for cursor just behind a word', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 11));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(2), '\tMy  Line');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(2, 5));
            });
        });
        test('deleteWordLeft for cursor inside of a word', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 12));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(1), '    \tMy st Line\t ');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 9));
            });
        });
        test('deleteWordRight for non-empty selection', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setSelection(new selection_1.$ms(3, 7, 3, 9));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(3), '    Thd Line🐶');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(3, 7));
            });
        });
        test('deleteWordRight for cursor at end of document', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(5, 3));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(5), '1');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(5, 2));
            });
        });
        test('deleteWordRight for cursor at beggining of whitespace', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(3, 1));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(3), 'Third Line🐶');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(3, 1));
            });
        });
        test('deleteWordRight for cursor just before a word', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 5));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(2), '\tMy  Line');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(2, 5));
            });
        });
        test('deleteWordRight for cursor inside of a word', () => {
            (0, testCodeEditor_1.$X0b)([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 11));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(1), '    \tMy Fi Line\t ');
                assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 11));
            });
        });
        test('deleteWordLeft - issue #832', () => {
            const EXPECTED = [
                '|   |/* |Just |some |text |a|+= |3 |+|5 |*/|  ',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 10000), ed => deleteWordLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordStartLeft', () => {
            const EXPECTED = [
                '|   |/* |Just |some |text |a|+= |3 |+|5 |*/  ',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 10000), ed => deleteWordStartLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordEndLeft', () => {
            const EXPECTED = [
                '|   /*| Just| some| text| a|+=| 3| +|5| */|  ',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 10000), ed => deleteWordEndLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordLeft - issue #24947', () => {
            (0, testCodeEditor_1.$X0b)([
                '{',
                '}'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 1));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(1), '{}');
            });
            (0, testCodeEditor_1.$X0b)([
                '{',
                '}'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 1));
                deleteWordStartLeft(editor);
                assert.strictEqual(model.getLineContent(1), '{}');
            });
            (0, testCodeEditor_1.$X0b)([
                '{',
                '}'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 1));
                deleteWordEndLeft(editor);
                assert.strictEqual(model.getLineContent(1), '{}');
            });
        });
        test('deleteWordRight - issue #832', () => {
            const EXPECTED = '   |/*| Just| some| text| a|+=| 3| +|5|-|3| */|  |';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => deleteWordRight(ed), ed => new position_1.$js(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordRight - issue #3882', () => {
            (0, testCodeEditor_1.$X0b)([
                'public void Add( int x,',
                '                 int y )'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 24));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(1), 'public void Add( int x,int y )', '001');
            });
        });
        test('deleteWordStartRight - issue #3882', () => {
            (0, testCodeEditor_1.$X0b)([
                'public void Add( int x,',
                '                 int y )'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 24));
                deleteWordStartRight(editor);
                assert.strictEqual(model.getLineContent(1), 'public void Add( int x,int y )', '001');
            });
        });
        test('deleteWordEndRight - issue #3882', () => {
            (0, testCodeEditor_1.$X0b)([
                'public void Add( int x,',
                '                 int y )'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 24));
                deleteWordEndRight(editor);
                assert.strictEqual(model.getLineContent(1), 'public void Add( int x,int y )', '001');
            });
        });
        test('deleteWordStartRight', () => {
            const EXPECTED = '   |/* |Just |some |text |a|+= |3 |+|5|-|3 |*/  |';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => deleteWordStartRight(ed), ed => new position_1.$js(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordEndRight', () => {
            const EXPECTED = '   /*| Just| some| text| a|+=| 3| +|5|-|3| */|  |';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => deleteWordEndRight(ed), ed => new position_1.$js(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordRight - issue #3882 (1): Ctrl+Delete removing entire line when used at the end of line', () => {
            (0, testCodeEditor_1.$X0b)([
                'A line with text.',
                '   And another one'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 18));
                deleteWordRight(editor);
                assert.strictEqual(model.getLineContent(1), 'A line with text.And another one', '001');
            });
        });
        test('deleteWordLeft - issue #3882 (2): Ctrl+Delete removing entire line when used at the end of line', () => {
            (0, testCodeEditor_1.$X0b)([
                'A line with text.',
                '   And another one'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 1));
                deleteWordLeft(editor);
                assert.strictEqual(model.getLineContent(1), 'A line with text.   And another one', '001');
            });
        });
        test('deleteWordLeft - issue #91855: Matching (quote, bracket, paren) doesn\'t get deleted when hitting Ctrl+Backspace', () => {
            const languageId = 'myTestMode';
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languageConfigurationService.register(languageId, {
                autoClosingPairs: [
                    { open: '\"', close: '\"' }
                ]
            }));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'a ""', languageId));
            const editor = disposables.add((0, testCodeEditor_1.$20b)(instantiationService, model, { autoClosingDelete: 'always' }));
            editor.setPosition(new position_1.$js(1, 4));
            deleteWordLeft(editor);
            assert.strictEqual(model.getLineContent(1), 'a ');
        });
        test('deleteInsideWord - empty line', () => {
            (0, testCodeEditor_1.$X0b)([
                'Line1',
                '',
                'Line2'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(2, 1));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'Line1\nLine2');
            });
        });
        test('deleteInsideWord - in whitespace 1', () => {
            (0, testCodeEditor_1.$X0b)([
                'Just  some text.'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 6));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'Justsome text.');
            });
        });
        test('deleteInsideWord - in whitespace 2', () => {
            (0, testCodeEditor_1.$X0b)([
                'Just     some text.'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 6));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'Justsome text.');
            });
        });
        test('deleteInsideWord - in whitespace 3', () => {
            (0, testCodeEditor_1.$X0b)([
                'Just     "some text.'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 6));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'Just"some text.');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '"some text.');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'some text.');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'text.');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '.');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
            });
        });
        test('deleteInsideWord - in non-words', () => {
            (0, testCodeEditor_1.$X0b)([
                'x=3+4+5+6'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 7));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'x=3+45+6');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'x=3++6');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'x=36');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'x=');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'x');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
            });
        });
        test('deleteInsideWord - in words 1', () => {
            (0, testCodeEditor_1.$X0b)([
                'This is interesting'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 7));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'This interesting');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'This');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
            });
        });
        test('deleteInsideWord - in words 2', () => {
            (0, testCodeEditor_1.$X0b)([
                'This  is  interesting'
            ], {}, (editor, _) => {
                const model = editor.getModel();
                editor.setPosition(new position_1.$js(1, 7));
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'This  interesting');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), 'This');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
                deleteInsideWord(editor);
                assert.strictEqual(model.getValue(), '');
            });
        });
    });
});
//# sourceMappingURL=wordOperations.test.js.map