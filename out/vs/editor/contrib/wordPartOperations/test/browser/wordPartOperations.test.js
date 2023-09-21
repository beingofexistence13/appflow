/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/wordOperations/test/browser/wordTestUtils", "vs/editor/contrib/wordPartOperations/browser/wordPartOperations", "vs/editor/contrib/wordPartOperations/test/browser/utils", "vs/editor/test/common/modes/testLanguageConfigurationService"], function (require, exports, assert, utils_1, position_1, languageConfigurationRegistry_1, wordTestUtils_1, wordPartOperations_1, utils_2, testLanguageConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WordPartOperations', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const _deleteWordPartLeft = new wordPartOperations_1.DeleteWordPartLeft();
        const _deleteWordPartRight = new wordPartOperations_1.DeleteWordPartRight();
        const _cursorWordPartLeft = new wordPartOperations_1.CursorWordPartLeft();
        const _cursorWordPartLeftSelect = new wordPartOperations_1.CursorWordPartLeftSelect();
        const _cursorWordPartRight = new wordPartOperations_1.CursorWordPartRight();
        const _cursorWordPartRightSelect = new wordPartOperations_1.CursorWordPartRightSelect();
        const serviceAccessor = new utils_2.StaticServiceAccessor().withService(languageConfigurationRegistry_1.ILanguageConfigurationService, new testLanguageConfigurationService_1.TestLanguageConfigurationService());
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
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 1)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartLeft - issue #53899: whitespace', () => {
            const EXPECTED = '|myvar| |=| |\'|demonstration|     |of| |selection| |with| |space|\'';
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 1)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartLeft - issue #53899: underscores', () => {
            const EXPECTED = '|myvar| |=| |\'|demonstration_____|of| |selection| |with| |space|\'';
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 1)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - basic', () => {
            const EXPECTED = [
                'start| |line|',
                '|this|Is|A|Camel|Case|Var|  |this|_is|_a|_snake|_case|_var| |THIS|_IS|_CAPS|_SNAKE| |this|_IS|Mixed|Use|',
                '|end| |line|'
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(3, 9)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - issue #53899: whitespace', () => {
            const EXPECTED = 'myvar| |=| |\'|demonstration|     |of| |selection| |with| |space|\'|';
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 52)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - issue #53899: underscores', () => {
            const EXPECTED = 'myvar| |=| |\'|demonstration|_____of| |selection| |with| |space|\'|';
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 52)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('cursorWordPartRight - issue #53899: second case', () => {
            const EXPECTED = [
                ';| |--| |1|',
                '|;|        |--| |2|',
                '|;|    |#|3|',
                '|;|   |#|4|'
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(4, 7)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #93239 - cursorWordPartRight', () => {
            const EXPECTED = [
                'foo|_bar|',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 8)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #93239 - cursorWordPartLeft', () => {
            const EXPECTED = [
                '|foo_|bar',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 8), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 1)));
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordPartLeft - basic', () => {
            const EXPECTED = '|   |/*| |Just| |some| |text| |a|+=| |3| |+|5|-|3| |*/|  |this|Is|A|Camel|Case|Var|  |this_|is_|a_|snake_|case_|var| |THIS_|IS_|CAPS_|SNAKE| |this_|IS|Mixed|Use';
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1000), ed => deleteWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('deleteWordPartRight - basic', () => {
            const EXPECTED = '   |/*| |Just| |some| |text| |a|+=| |3| |+|5|-|3| |*/|  |this|Is|A|Camel|Case|Var|  |this|_is|_a|_snake|_case|_var| |THIS|_IS|_CAPS|_SNAKE| |this|_IS|Mixed|Use|';
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => deleteWordPartRight(ed), ed => new position_1.Position(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0);
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: cursorWordPartLeft stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                '|this-|is-|a-|kebab-|case-|var| |THIS-|IS-|CAPS-|KEBAB| |this-|IS|Mixed|Use',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1000, 1000), ed => cursorWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 1)), { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: cursorWordPartRight stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                'this|-is|-a|-kebab|-case|-var| |THIS|-IS|-CAPS|-KEBAB| |this|-IS|Mixed|Use|',
            ].join('\n');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => cursorWordPartRight(ed), ed => ed.getPosition(), ed => ed.getPosition().equals(new position_1.Position(1, 60)), { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: deleteWordPartLeft stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                '|this-|is-|a-|kebab-|case-|var| |THIS-|IS-|CAPS-|KEBAB| |this-|IS|Mixed|Use',
            ].join(' ');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1000, 1000), ed => deleteWordPartLeft(ed), ed => ed.getPosition(), ed => ed.getValue().length === 0, { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
        test('issue #158667: deleteWordPartRight stops at "-" even when "-" is not in word separators', () => {
            const EXPECTED = [
                'this|-is|-a|-kebab|-case|-var| |THIS|-IS|-CAPS|-KEBAB| |this|-IS|Mixed|Use|',
            ].join(' ');
            const [text,] = (0, wordTestUtils_1.deserializePipePositions)(EXPECTED);
            const actualStops = (0, wordTestUtils_1.testRepeatedActionAndExtractPositions)(text, new position_1.Position(1, 1), ed => deleteWordPartRight(ed), ed => new position_1.Position(1, text.length - ed.getValue().length + 1), ed => ed.getValue().length === 0, { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}·" } // default characters sans '$-%~' plus '·'
            );
            const actual = (0, wordTestUtils_1.serializePipePositions)(text, actualStops);
            assert.deepStrictEqual(actual, EXPECTED);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZFBhcnRPcGVyYXRpb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi93b3JkUGFydE9wZXJhdGlvbnMvdGVzdC9icm93c2VyL3dvcmRQYXJ0T3BlcmF0aW9ucy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFFaEMsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSx1Q0FBa0IsRUFBRSxDQUFDO1FBQ3JELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSx3Q0FBbUIsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSx1Q0FBa0IsRUFBRSxDQUFDO1FBQ3JELE1BQU0seUJBQXlCLEdBQUcsSUFBSSw2Q0FBd0IsRUFBRSxDQUFDO1FBQ2pFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSx3Q0FBbUIsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sMEJBQTBCLEdBQUcsSUFBSSw4Q0FBeUIsRUFBRSxDQUFDO1FBRW5FLE1BQU0sZUFBZSxHQUFHLElBQUksNkJBQXFCLEVBQUUsQ0FBQyxXQUFXLENBQzlELDZEQUE2QixFQUM3QixJQUFJLG1FQUFnQyxFQUFFLENBQ3RDLENBQUM7UUFFRixTQUFTLGdCQUFnQixDQUFDLE1BQW1CLEVBQUUsT0FBc0I7WUFDcEUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNELFNBQVMsa0JBQWtCLENBQUMsTUFBbUIsRUFBRSxrQkFBMkIsS0FBSztZQUNoRixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FB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