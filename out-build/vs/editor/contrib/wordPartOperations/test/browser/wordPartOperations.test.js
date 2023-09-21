/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/wordOperations/test/browser/wordTestUtils", "vs/editor/contrib/wordPartOperations/browser/wordPartOperations", "vs/editor/contrib/wordPartOperations/test/browser/utils", "vs/editor/test/common/modes/testLanguageConfigurationService"], function (require, exports, assert, utils_1, position_1, languageConfigurationRegistry_1, wordTestUtils_1, wordPartOperations_1, utils_2, testLanguageConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WordPartOperations', () => {
        (0, utils_1.$bT)();
        const _deleteWordPartLeft = new wordPartOperations_1.$J$();
        const _deleteWordPartRight = new wordPartOperations_1.$K$();
        const _cursorWordPartLeft = new wordPartOperations_1.$M$();
        const _cursorWordPartLeftSelect = new wordPartOperations_1.$N$();
        const _cursorWordPartRight = new wordPartOperations_1.$P$();
        const _cursorWordPartRightSelect = new wordPartOperations_1.$Q$();
        const serviceAccessor = new utils_2.$e$b().withService(languageConfigurationRegistry_1.$2t, new testLanguageConfigurationService_1.$D0b());
        function runEditorCommand(editor, command) {
            command.runEditorCommand(serviceAccessor, editor, null);
        }
        function cursorWordPartLeft(editor, inSelectionmode = false) {
            runEditorCommand(editor, inSelectionmode ? _cursorWordPartLeftSelect : _cursorWordPartLeft);
        }
        function cursorWordPartRight(editor, inSelectionmode = false) {
            runEditorCommand(editor, inSelectionmode ? _cursorWordPartRightSelect : _cursorWordPartRight);
        }
        function deleteWordPartLeft(editor) {
            runEditorCommand(editor, _deleteWordPartLeft);
        }
        function deleteWordPartRight(editor) {
            runEditorCommand(editor, _deleteWordPartRight);
        }
        test('cursorWordPartLeft - basic', () => {
            const EXPECTED = [
                '|start| |line|',
                '|this|Is|A|Camel|Case|Var|  |this_|is_|a_|snake_|case_|var| |THIS_|IS_|CAPS_|SNAKE| |this_|IS|Mixed|Use|',
                '|end| |line'
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartLeft - issue #53899: whitespace', () => {
            const EXPECTED = '|myvar| |=| |\'|demonstration|     |of| |selection| |with| |space|\'';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartLeft - issue #53899: underscores', () => {
            const EXPECTED = '|myvar| |=| |\'|demonstration_____|of| |selection| |with| |space|\'';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - basic', () => {
            const EXPECTED = [
                'start| |line|',
                '|this|Is|A|Camel|Case|Var|  |this|_is|_a|_snake|_case|_var| |THIS|_IS|_CAPS|_SNAKE| |this|_IS|Mixed|Use|',
                '|end| |line|'
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(3, 9)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - issue #53899: whitespace', () => {
            const EXPECTED = 'myvar| |=| |\'|demonstration|     |of| |selection| |with| |space|\'|';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 52)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - issue #53899: underscores', () => {
            const EXPECTED = 'myvar| |=| |\'|demonstration|_____of| |selection| |with| |space|\'|';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 52)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - issue #53899: second case', () => {
            const EXPECTED = [
                ';| |--| |1|',
                '|;|        |--| |2|',
                '|;|    |#|3|',
                '|;|   |#|4|'
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(4, 7)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #93239 - cursorWordPartRight', () => {
            const EXPECTED = [
                'foo|_bar|',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 8)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #93239 - cursorWordPartLeft', () => {
            const EXPECTED = [
                '|foo_|bar',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 8), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)));
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordPartLeft - basic', () => {
            const EXPECTED = '|   |/*| |Just| |some| |text| |a|+=| |3| |+|5|-|3| |*/|  |this|Is|A|Camel|Case|Var|  |this_|is_|a_|snake_|case_|var| |THIS_|IS_|CAPS_|SNAKE| |this_|IS|Mixed|Use';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1000), ed => deleteWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordPartRight - basic', () => {
            const EXPECTED = '   |/*| |Just| |some| |text| |a|+=| |3| |+|5|-|3| |*/|  |this|Is|A|Camel|Case|Var|  |this|_is|_a|_snake|_case|_var| |THIS|_IS|_CAPS|_SNAKE| |this|_IS|Mixed|Use|';
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => deleteWordPartRight(ed), ed => new position_1.$js(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: cursorWordPartLeft stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                '|this-|is-|a-|kebab-|case-|var| |THIS-|IS-|CAPS-|KEBAB| |this-|IS|Mixed|Use',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 1)), { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: cursorWordPartRight stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                'this|-is|-a|-kebab|-case|-var| |THIS|-IS|-CAPS|-KEBAB| |this|-IS|Mixed|Use|',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.$js(1, 60)), { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: deleteWordPartLeft stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                '|this-|is-|a-|kebab-|case-|var| |THIS-|IS-|CAPS-|KEBAB| |this-|IS|Mixed|Use',
            ].join(' ');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1000, 1000), ed => deleteWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0, { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: deleteWordPartRight stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                'this|-is|-a|-kebab|-case|-var| |THIS|-IS|-CAPS|-KEBAB| |this|-IS|Mixed|Use|',
            ].join(' ');
            const [text,] = (0, wordTestUtils_1.$b$b)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.$d$b)(text, new position_1.$js(1, 1), ed => deleteWordPartRight(ed), ed => new position_1.$js(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0, { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.$c$b)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
    });
});
//# sourceMappingURL=wordPartOperations.test.js.map