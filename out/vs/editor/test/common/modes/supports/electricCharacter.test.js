/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/supports/electricCharacter", "vs/editor/common/languages/supports/richEditBrackets", "vs/editor/test/common/modesTestUtils"], function (require, exports, assert, utils_1, electricCharacter_1, richEditBrackets_1, modesTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fakeLanguageId = 'test';
    suite('Editor Modes - Auto Indentation', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function _testOnElectricCharacter(electricCharacterSupport, line, character, offset) {
            return electricCharacterSupport.onElectricCharacter(character, (0, modesTestUtils_1.createFakeScopedLineTokens)(line), offset);
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
            const sup = new electricCharacter_1.BracketElectricCharacterSupport(new richEditBrackets_1.RichEditBrackets(fakeLanguageId, [
                ['{', '}'],
                ['(', ')']
            ]));
            assert.deepStrictEqual(sup.getElectricCharacters(), ['}', ')']);
        });
        test('matchOpenBracket', () => {
            const sup = new electricCharacter_1.BracketElectricCharacterSupport(new richEditBrackets_1.RichEditBrackets(fakeLanguageId, [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3RyaWNDaGFyYWN0ZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2Rlcy9zdXBwb3J0cy9lbGVjdHJpY0NoYXJhY3Rlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQztJQUU5QixLQUFLLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO1FBRTdDLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxTQUFTLHdCQUF3QixDQUFDLHdCQUF5RCxFQUFFLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxNQUFjO1lBQ2hKLE9BQU8sd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUEsMkNBQTBCLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUcsQ0FBQztRQUVELFNBQVMsZUFBZSxDQUFDLHdCQUF5RCxFQUFFLElBQWlCLEVBQUUsU0FBaUIsRUFBRSxNQUFjO1lBQ3ZJLE1BQU0sTUFBTSxHQUFHLHdCQUF3QixDQUFDLHdCQUF3QixFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0YsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELFNBQVMsZ0JBQWdCLENBQUMsd0JBQXlELEVBQUUsSUFBaUIsRUFBRSxTQUFpQixFQUFFLE1BQWMsRUFBRSxnQkFBd0I7WUFDbEssTUFBTSxNQUFNLEdBQUcsd0JBQXdCLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzRixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtZQUM5RCxNQUFNLEdBQUcsR0FBRyxJQUFJLG1EQUErQixDQUM5QyxJQUFJLG1DQUFnQixDQUFDLGNBQWMsRUFBRTtnQkFDcEMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzthQUNWLENBQUMsQ0FDRixDQUFDO1lBRUYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLG1EQUErQixDQUM5QyxJQUFJLG1DQUFnQixDQUFDLGNBQWMsRUFBRTtnQkFDcEMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzthQUNWLENBQUMsQ0FDRixDQUFDO1lBRUYsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLGlDQUF5QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEYsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLGlDQUF5QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEYsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLGlDQUF5QixFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEYsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLGlDQUF5QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEYsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLGlDQUF5QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEYsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksaUNBQXlCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkYsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9