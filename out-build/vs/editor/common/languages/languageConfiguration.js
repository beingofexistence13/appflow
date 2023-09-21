/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ht = exports.$gt = exports.IndentAction = void 0;
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
    class $gt {
        constructor(source) {
            this.e = null;
            this.f = false;
            this.open = source.open;
            this.close = source.close;
            // initially allowed in all tokens
            this.b = true;
            this.c = true;
            this.d = true;
            if (Array.isArray(source.notIn)) {
                for (let i = 0, len = source.notIn.length; i < len; i++) {
                    const notIn = source.notIn[i];
                    switch (notIn) {
                        case 'string':
                            this.b = false;
                            break;
                        case 'comment':
                            this.c = false;
                            break;
                        case 'regex':
                            this.d = false;
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
                    return this.c;
                case 2 /* StandardTokenType.String */:
                    return this.b;
                case 3 /* StandardTokenType.RegEx */:
                    return this.d;
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
        g(fromCharCode, toCharCode) {
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
            if (!this.f) {
                this.f = true;
                if (!this.e) {
                    this.e = this.g(48 /* CharCode.Digit0 */, 57 /* CharCode.Digit9 */);
                }
                if (!this.e) {
                    this.e = this.g(97 /* CharCode.a */, 122 /* CharCode.z */);
                }
                if (!this.e) {
                    this.e = this.g(65 /* CharCode.A */, 90 /* CharCode.Z */);
                }
            }
            return this.e;
        }
    }
    exports.$gt = $gt;
    /**
     * @internal
     */
    class $ht {
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
    exports.$ht = $ht;
    function appendEntry(target, key, value) {
        if (target.has(key)) {
            target.get(key).push(value);
        }
        else {
            target.set(key, [value]);
        }
    }
});
//# sourceMappingURL=languageConfiguration.js.map