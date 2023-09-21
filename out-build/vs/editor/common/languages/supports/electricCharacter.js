/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/languages/supports", "vs/editor/common/languages/supports/richEditBrackets"], function (require, exports, arrays_1, supports_1, richEditBrackets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$St = void 0;
    class $St {
        constructor(richEditBrackets) {
            this.a = richEditBrackets;
        }
        getElectricCharacters() {
            const result = [];
            if (this.a) {
                for (const bracket of this.a.brackets) {
                    for (const close of bracket.close) {
                        const lastChar = close.charAt(close.length - 1);
                        result.push(lastChar);
                    }
                }
            }
            return (0, arrays_1.$Kb)(result);
        }
        onElectricCharacter(character, context, column) {
            if (!this.a || this.a.brackets.length === 0) {
                return null;
            }
            const tokenIndex = context.findTokenIndexAtOffset(column - 1);
            if ((0, supports_1.$ft)(context.getStandardTokenType(tokenIndex))) {
                return null;
            }
            const reversedBracketRegex = this.a.reversedRegex;
            const text = context.getLineContent().substring(0, column - 1) + character;
            const r = richEditBrackets_1.$Rt.findPrevBracketInRange(reversedBracketRegex, 1, text, 0, text.length);
            if (!r) {
                return null;
            }
            const bracketText = text.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
            const isOpen = this.a.textIsOpenBracket[bracketText];
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
    exports.$St = $St;
});
//# sourceMappingURL=electricCharacter.js.map