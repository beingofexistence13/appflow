/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/supports/electricCharacter", "vs/editor/common/languages/supports/richEditBrackets", "vs/editor/test/common/modesTestUtils"], function (require, exports, assert, utils_1, electricCharacter_1, richEditBrackets_1, modesTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fakeLanguageId = 'test';
    suite('Editor Modes - Auto Indentation', () => {
        (0, utils_1.$bT)();
        function _testOnElectricCharacter(electricCharacterSupport, line, character, offset) {
            return electricCharacterSupport.onElectricCharacter(character, (0, modesTestUtils_1.$h$b)(line), offset);
        }
        function testDoesNothing(electricCharacterSupport, line, character, offset) {
            const actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
            assert.deepStrictEqual(actual, null);
        }
        function testMatchBracket(electricCharacterSupport, line, character, offset, matchOpenBracket) {
            const actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
            assert.deepStrictEqual(actual, { matchOpenBracket: matchOpenBracket });
        }
        test('getElectricCharacters uses all sources and dedups', () => {
            const sup = new electricCharacter_1.$St(new richEditBrackets_1.$Qt(fakeLanguageId, [
                ['{', '}'],
                ['(', ')']
            ]));
            assert.deepStrictEqual(sup.getElectricCharacters(), ['}', ')']);
        });
        test('matchOpenBracket', () => {
            const sup = new electricCharacter_1.$St(new richEditBrackets_1.$Qt(fakeLanguageId, [
                ['{', '}'],
                ['(', ')']
            ]));
            testDoesNothing(sup, [{ text: '\t{', type: 0 /* StandardTokenType.Other */ }], '\t', 1);
            testDoesNothing(sup, [{ text: '\t{', type: 0 /* StandardTokenType.Other */ }], '\t', 2);
            testDoesNothing(sup, [{ text: '\t\t', type: 0 /* StandardTokenType.Other */ }], '{', 3);
            testDoesNothing(sup, [{ text: '\t}', type: 0 /* StandardTokenType.Other */ }], '\t', 1);
            testDoesNothing(sup, [{ text: '\t}', type: 0 /* StandardTokenType.Other */ }], '\t', 2);
            testMatchBracket(sup, [{ text: '\t\t', type: 0 /* StandardTokenType.Other */ }], '}', 3, '}');
        });
    });
});
//# sourceMappingURL=electricCharacter.test.js.map