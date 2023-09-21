/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoClosingPairs = exports.StandardAutoClosingPairConditional = exports.IndentAction = void 0;
    /**
     * Describes what to do with the indentation when pressing Enter.
     */
    var IndentAction;
    (function (IndentAction) {
        /**
         * Insert new line and copy the previous line's indentation.
         */
        IndentAction[IndentAction["None"] = 0] = "None";
        /**
         * Insert new line and indent once (relative to the previous line's indentation).
         */
        IndentAction[IndentAction["Indent"] = 1] = "Indent";
        /**
         * Insert two new lines:
         *  - the first one indented which will hold the cursor
         *  - the second one at the same indentation level
         */
        IndentAction[IndentAction["IndentOutdent"] = 2] = "IndentOutdent";
        /**
         * Insert new line and outdent once (relative to the previous line's indentation).
         */
        IndentAction[IndentAction["Outdent"] = 3] = "Outdent";
    })(IndentAction || (exports.IndentAction = IndentAction = {}));
    /**
     * @internal
     */
    class StandardAutoClosingPairConditional {
        constructor(source) {
            this._neutralCharacter = null;
            this._neutralCharacterSearched = false;
            this.open = source.open;
            this.close = source.close;
            // initially allowed in all tokens
            this._inString = true;
            this._inComment = true;
            this._inRegEx = true;
            if (Array.isArray(source.notIn)) {
                for (let i = 0, len = source.notIn.length; i < len; i++) {
                    const notIn = source.notIn[i];
                    switch (notIn) {
                        case 'string':
                            this._inString = false;
                            break;
                        case 'comment':
                            this._inComment = false;
                            break;
                        case 'regex':
                            this._inRegEx = false;
                            break;
                    }
                }
            }
        }
        isOK(standardToken) {
            switch (standardToken) {
                case 0 /* StandardTokenType.Other */:
                    return true;
                case 1 /* StandardTokenType.Comment */:
                    return this._inComment;
                case 2 /* StandardTokenType.String */:
                    return this._inString;
                case 3 /* StandardTokenType.RegEx */:
                    return this._inRegEx;
            }
        }
        shouldAutoClose(context, column) {
            // Always complete on empty line
            if (context.getTokenCount() === 0) {
                return true;
            }
            const tokenIndex = context.findTokenIndexAtOffset(column - 2);
            const standardTokenType = context.getStandardTokenType(tokenIndex);
            return this.isOK(standardTokenType);
        }
        _findNeutralCharacterInRange(fromCharCode, toCharCode) {
            for (let charCode = fromCharCode; charCode <= toCharCode; charCode++) {
                const character = String.fromCharCode(charCode);
                if (!this.open.includes(character) && !this.close.includes(character)) {
                    return character;
                }
            }
            return null;
        }
        /**
         * Find a character in the range [0-9a-zA-Z] that does not appear in the open or close
         */
        findNeutralCharacter() {
            if (!this._neutralCharacterSearched) {
                this._neutralCharacterSearched = true;
                if (!this._neutralCharacter) {
                    this._neutralCharacter = this._findNeutralCharacterInRange(48 /* CharCode.Digit0 */, 57 /* CharCode.Digit9 */);
                }
                if (!this._neutralCharacter) {
                    this._neutralCharacter = this._findNeutralCharacterInRange(97 /* CharCode.a */, 122 /* CharCode.z */);
                }
                if (!this._neutralCharacter) {
                    this._neutralCharacter = this._findNeutralCharacterInRange(65 /* CharCode.A */, 90 /* CharCode.Z */);
                }
            }
            return this._neutralCharacter;
        }
    }
    exports.StandardAutoClosingPairConditional = StandardAutoClosingPairConditional;
    /**
     * @internal
     */
    class AutoClosingPairs {
        constructor(autoClosingPairs) {
            this.autoClosingPairsOpenByStart = new Map();
            this.autoClosingPairsOpenByEnd = new Map();
            this.autoClosingPairsCloseByStart = new Map();
            this.autoClosingPairsCloseByEnd = new Map();
            this.autoClosingPairsCloseSingleChar = new Map();
            for (const pair of autoClosingPairs) {
                appendEntry(this.autoClosingPairsOpenByStart, pair.open.charAt(0), pair);
                appendEntry(this.autoClosingPairsOpenByEnd, pair.open.charAt(pair.open.length - 1), pair);
                appendEntry(this.autoClosingPairsCloseByStart, pair.close.charAt(0), pair);
                appendEntry(this.autoClosingPairsCloseByEnd, pair.close.charAt(pair.close.length - 1), pair);
                if (pair.close.length === 1 && pair.open.length === 1) {
                    appendEntry(this.autoClosingPairsCloseSingleChar, pair.close, pair);
                }
            }
        }
    }
    exports.AutoClosingPairs = AutoClosingPairs;
    function appendEntry(target, key, value) {
        if (target.has(key)) {
            target.get(key).push(value);
        }
        else {
            target.set(key, [value]);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VDb25maWd1cmF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMvbGFuZ3VhZ2VDb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlNaEc7O09BRUc7SUFDSCxJQUFZLFlBbUJYO0lBbkJELFdBQVksWUFBWTtRQUN2Qjs7V0FFRztRQUNILCtDQUFRLENBQUE7UUFDUjs7V0FFRztRQUNILG1EQUFVLENBQUE7UUFDVjs7OztXQUlHO1FBQ0gsaUVBQWlCLENBQUE7UUFDakI7O1dBRUc7UUFDSCxxREFBVyxDQUFBO0lBQ1osQ0FBQyxFQW5CVyxZQUFZLDRCQUFaLFlBQVksUUFtQnZCO0lBMENEOztPQUVHO0lBQ0gsTUFBYSxrQ0FBa0M7UUFVOUMsWUFBWSxNQUFtQztZQUh2QyxzQkFBaUIsR0FBa0IsSUFBSSxDQUFDO1lBQ3hDLDhCQUF5QixHQUFZLEtBQUssQ0FBQztZQUdsRCxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBRTFCLGtDQUFrQztZQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUVyQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEQsTUFBTSxLQUFLLEdB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