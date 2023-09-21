/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/languages/supports", "vs/editor/common/languages/supports/richEditBrackets"], function (require, exports, arrays_1, supports_1, richEditBrackets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketElectricCharacterSupport = void 0;
    class BracketElectricCharacterSupport {
        constructor(richEditBrackets) {
            this._richEditBrackets = richEditBrackets;
        }
        getElectricCharacters() {
            const result = [];
            if (this._richEditBrackets) {
                for (const bracket of this._richEditBrackets.brackets) {
                    for (const close of bracket.close) {
                        const lastChar = close.charAt(close.length - 1);
                        result.push(lastChar);
                    }
                }
            }
            return (0, arrays_1.distinct)(result);
        }
        onElectricCharacter(character, context, column) {
            if (!this._richEditBrackets || this._richEditBrackets.brackets.length === 0) {
                return null;
            }
            const tokenIndex = context.findTokenIndexAtOffset(column - 1);
            if ((0, supports_1.ignoreBracketsInToken)(context.getStandardTokenType(tokenIndex))) {
                return null;
            }
            const reversedBracketRegex = this._richEditBrackets.reversedRegex;
            const text = context.getLineContent().substring(0, column - 1) + character;
            const r = richEditBrackets_1.BracketsUtils.findPrevBracketInRange(reversedBracketRegex, 1, text, 0, text.length);
            if (!r) {
                return null;
            }
            const bracketText = text.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
            const isOpen = this._richEditBrackets.textIsOpenBracket[bracketText];
            if (isOpen) {
                return null;
            }
            const textBeforeBracket = context.getActualLineContentBefore(r.startColumn - 1);
            if (!/^\s*$/.test(textBeforeBracket)) {
                // There is other text on the line before the bracket
                return null;
            }
            return {
                matchOpenBracket: bracketText
            };
        }
    }
    exports.BracketElectricCharacterSupport = BracketElectricCharacterSupport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3RyaWNDaGFyYWN0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9zdXBwb3J0cy9lbGVjdHJpY0NoYXJhY3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQWEsK0JBQStCO1FBSTNDLFlBQVksZ0JBQXlDO1lBQ3BELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMzQyxDQUFDO1FBRU0scUJBQXFCO1lBQzNCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUU1QixJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDM0IsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFO29CQUN0RCxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7d0JBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDdEI7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sSUFBQSxpQkFBUSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxTQUFpQixFQUFFLE9BQXlCLEVBQUUsTUFBYztZQUN0RixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUUsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDOUQsSUFBSSxJQUFBLGdDQUFxQixFQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNwRSxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDO1lBQ2xFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7WUFFM0UsTUFBTSxDQUFDLEdBQUcsZ0NBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDUCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXJGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyRSxJQUFJLE1BQU0sRUFBRTtnQkFDWCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNyQyxxREFBcUQ7Z0JBQ3JELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPO2dCQUNOLGdCQUFnQixFQUFFLFdBQVc7YUFDN0IsQ0FBQztRQUNILENBQUM7S0FDRDtJQTFERCwwRUEwREMifQ==