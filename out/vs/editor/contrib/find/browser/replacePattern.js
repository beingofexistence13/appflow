/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/search"], function (require, exports, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseReplaceString = exports.ReplacePiece = exports.ReplacePattern = void 0;
    var ReplacePatternKind;
    (function (ReplacePatternKind) {
        ReplacePatternKind[ReplacePatternKind["StaticValue"] = 0] = "StaticValue";
        ReplacePatternKind[ReplacePatternKind["DynamicPieces"] = 1] = "DynamicPieces";
    })(ReplacePatternKind || (ReplacePatternKind = {}));
    /**
     * Assigned when the replace pattern is entirely static.
     */
    class StaticValueReplacePattern {
        constructor(staticValue) {
            this.staticValue = staticValue;
            this.kind = 0 /* ReplacePatternKind.StaticValue */;
        }
    }
    /**
     * Assigned when the replace pattern has replacement patterns.
     */
    class DynamicPiecesReplacePattern {
        constructor(pieces) {
            this.pieces = pieces;
            this.kind = 1 /* ReplacePatternKind.DynamicPieces */;
        }
    }
    class ReplacePattern {
        static fromStaticValue(value) {
            return new ReplacePattern([ReplacePiece.staticValue(value)]);
        }
        get hasReplacementPatterns() {
            return (this._state.kind === 1 /* ReplacePatternKind.DynamicPieces */);
        }
        constructor(pieces) {
            if (!pieces || pieces.length === 0) {
                this._state = new StaticValueReplacePattern('');
            }
            else if (pieces.length === 1 && pieces[0].staticValue !== null) {
                this._state = new StaticValueReplacePattern(pieces[0].staticValue);
            }
            else {
                this._state = new DynamicPiecesReplacePattern(pieces);
            }
        }
        buildReplaceString(matches, preserveCase) {
            if (this._state.kind === 0 /* ReplacePatternKind.StaticValue */) {
                if (preserveCase) {
                    return (0, search_1.buildReplaceStringWithCasePreserved)(matches, this._state.staticValue);
                }
                else {
                    return this._state.staticValue;
                }
            }
            let result = '';
            for (let i = 0, len = this._state.pieces.length; i < len; i++) {
                const piece = this._state.pieces[i];
                if (piece.staticValue !== null) {
                    // static value ReplacePiece
                    result += piece.staticValue;
                    continue;
                }
                // match index ReplacePiece
                let match = ReplacePattern._substitute(piece.matchIndex, matches);
                if (piece.caseOps !== null && piece.caseOps.length > 0) {
                    const repl = [];
                    const lenOps = piece.caseOps.length;
                    let opIdx = 0;
                    for (let idx = 0, len = match.length; idx < len; idx++) {
                        if (opIdx >= lenOps) {
                            repl.push(match.slice(idx));
                            break;
                        }
                        switch (piece.caseOps[opIdx]) {
                            case 'U':
                                repl.push(match[idx].toUpperCase());
                                break;
                            case 'u':
                                repl.push(match[idx].toUpperCase());
                                opIdx++;
                                break;
                            case 'L':
                                repl.push(match[idx].toLowerCase());
                                break;
                            case 'l':
                                repl.push(match[idx].toLowerCase());
                                opIdx++;
                                break;
                            default:
                                repl.push(match[idx]);
                        }
                    }
                    match = repl.join('');
                }
                result += match;
            }
            return result;
        }
        static _substitute(matchIndex, matches) {
            if (matches === null) {
                return '';
            }
            if (matchIndex === 0) {
                return matches[0];
            }
            let remainder = '';
            while (matchIndex > 0) {
                if (matchIndex < matches.length) {
                    // A match can be undefined
                    const match = (matches[matchIndex] || '');
                    return match + remainder;
                }
                remainder = String(matchIndex % 10) + remainder;
                matchIndex = Math.floor(matchIndex / 10);
            }
            return '$' + remainder;
        }
    }
    exports.ReplacePattern = ReplacePattern;
    /**
     * A replace piece can either be a static string or an index to a specific match.
     */
    class ReplacePiece {
        static staticValue(value) {
            return new ReplacePiece(value, -1, null);
        }
        static matchIndex(index) {
            return new ReplacePiece(null, index, null);
        }
        static caseOps(index, caseOps) {
            return new ReplacePiece(null, index, caseOps);
        }
        constructor(staticValue, matchIndex, caseOps) {
            this.staticValue = staticValue;
            this.matchIndex = matchIndex;
            if (!caseOps || caseOps.length === 0) {
                this.caseOps = null;
            }
            else {
                this.caseOps = caseOps.slice(0);
            }
        }
    }
    exports.ReplacePiece = ReplacePiece;
    class ReplacePieceBuilder {
        constructor(source) {
            this._source = source;
            this._lastCharIndex = 0;
            this._result = [];
            this._resultLen = 0;
            this._currentStaticPiece = '';
        }
        emitUnchanged(toCharIndex) {
            this._emitStatic(this._source.substring(this._lastCharIndex, toCharIndex));
            this._lastCharIndex = toCharIndex;
        }
        emitStatic(value, toCharIndex) {
            this._emitStatic(value);
            this._lastCharIndex = toCharIndex;
        }
        _emitStatic(value) {
            if (value.length === 0) {
                return;
            }
            this._currentStaticPiece += value;
        }
        emitMatchIndex(index, toCharIndex, caseOps) {
            if (this._currentStaticPiece.length !== 0) {
                this._result[this._resultLen++] = ReplacePiece.staticValue(this._currentStaticPiece);
                this._currentStaticPiece = '';
            }
            this._result[this._resultLen++] = ReplacePiece.caseOps(index, caseOps);
            this._lastCharIndex = toCharIndex;
        }
        finalize() {
            this.emitUnchanged(this._source.length);
            if (this._currentStaticPiece.length !== 0) {
                this._result[this._resultLen++] = ReplacePiece.staticValue(this._currentStaticPiece);
                this._currentStaticPiece = '';
            }
            return new ReplacePattern(this._result);
        }
    }
    /**
     * \n			=> inserts a LF
     * \t			=> inserts a TAB
     * \\			=> inserts a "\".
     * \u			=> upper-cases one character in a match.
     * \U			=> upper-cases ALL remaining characters in a match.
     * \l			=> lower-cases one character in a match.
     * \L			=> lower-cases ALL remaining characters in a match.
     * $$			=> inserts a "$".
     * $& and $0	=> inserts the matched substring.
     * $n			=> Where n is a non-negative integer lesser than 100, inserts the nth parenthesized submatch string
     * everything else stays untouched
     *
     * Also see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
     */
    function parseReplaceString(replaceString) {
        if (!replaceString || replaceString.length === 0) {
            return new ReplacePattern(null);
        }
        const caseOps = [];
        const result = new ReplacePieceBuilder(replaceString);
        for (let i = 0, len = replaceString.length; i < len; i++) {
            const chCode = replaceString.charCodeAt(i);
            if (chCode === 92 /* CharCode.Backslash */) {
                // move to next char
                i++;
                if (i >= len) {
                    // string ends with a \
                    break;
                }
                const nextChCode = replaceString.charCodeAt(i);
                // let replaceWithCharacter: string | null = null;
                switch (nextChCode) {
                    case 92 /* CharCode.Backslash */:
                        // \\ => inserts a "\"
                        result.emitUnchanged(i - 1);
                        result.emitStatic('\\', i + 1);
                        break;
                    case 110 /* CharCode.n */:
                        // \n => inserts a LF
                        result.emitUnchanged(i - 1);
                        result.emitStatic('\n', i + 1);
                        break;
                    case 116 /* CharCode.t */:
                        // \t => inserts a TAB
                        result.emitUnchanged(i - 1);
                        result.emitStatic('\t', i + 1);
                        break;
                    // Case modification of string replacements, patterned after Boost, but only applied
                    // to the replacement text, not subsequent content.
                    case 117 /* CharCode.u */:
                    // \u => upper-cases one character.
                    case 85 /* CharCode.U */:
                    // \U => upper-cases ALL following characters.
                    case 108 /* CharCode.l */:
                    // \l => lower-cases one character.
                    case 76 /* CharCode.L */:
                        // \L => lower-cases ALL following characters.
                        result.emitUnchanged(i - 1);
                        result.emitStatic('', i + 1);
                        caseOps.push(String.fromCharCode(nextChCode));
                        break;
                }
                continue;
            }
            if (chCode === 36 /* CharCode.DollarSign */) {
                // move to next char
                i++;
                if (i >= len) {
                    // string ends with a $
                    break;
                }
                const nextChCode = replaceString.charCodeAt(i);
                if (nextChCode === 36 /* CharCode.DollarSign */) {
                    // $$ => inserts a "$"
                    result.emitUnchanged(i - 1);
                    result.emitStatic('$', i + 1);
                    continue;
                }
                if (nextChCode === 48 /* CharCode.Digit0 */ || nextChCode === 38 /* CharCode.Ampersand */) {
                    // $& and $0 => inserts the matched substring.
                    result.emitUnchanged(i - 1);
                    result.emitMatchIndex(0, i + 1, caseOps);
                    caseOps.length = 0;
                    continue;
                }
                if (49 /* CharCode.Digit1 */ <= nextChCode && nextChCode <= 57 /* CharCode.Digit9 */) {
                    // $n
                    let matchIndex = nextChCode - 48 /* CharCode.Digit0 */;
                    // peek next char to probe for $nn
                    if (i + 1 < len) {
                        const nextNextChCode = replaceString.charCodeAt(i + 1);
                        if (48 /* CharCode.Digit0 */ <= nextNextChCode && nextNextChCode <= 57 /* CharCode.Digit9 */) {
                            // $nn
                            // move to next char
                            i++;
                            matchIndex = matchIndex * 10 + (nextNextChCode - 48 /* CharCode.Digit0 */);
                            result.emitUnchanged(i - 2);
                            result.emitMatchIndex(matchIndex, i + 1, caseOps);
                            caseOps.length = 0;
                            continue;
                        }
                    }
                    result.emitUnchanged(i - 1);
                    result.emitMatchIndex(matchIndex, i + 1, caseOps);
                    caseOps.length = 0;
                    continue;
                }
            }
        }
        return result.finalize();
    }
    exports.parseReplaceString = parseReplaceString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZVBhdHRlcm4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9maW5kL2Jyb3dzZXIvcmVwbGFjZVBhdHRlcm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLElBQVcsa0JBR1Y7SUFIRCxXQUFXLGtCQUFrQjtRQUM1Qix5RUFBZSxDQUFBO1FBQ2YsNkVBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUhVLGtCQUFrQixLQUFsQixrQkFBa0IsUUFHNUI7SUFFRDs7T0FFRztJQUNILE1BQU0seUJBQXlCO1FBRTlCLFlBQTRCLFdBQW1CO1lBQW5CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBRC9CLFNBQUksMENBQWtDO1FBQ0gsQ0FBQztLQUNwRDtJQUVEOztPQUVHO0lBQ0gsTUFBTSwyQkFBMkI7UUFFaEMsWUFBNEIsTUFBc0I7WUFBdEIsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7WUFEbEMsU0FBSSw0Q0FBb0M7UUFDRixDQUFDO0tBQ3ZEO0lBRUQsTUFBYSxjQUFjO1FBRW5CLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBYTtZQUMxQyxPQUFPLElBQUksY0FBYyxDQUFDLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUlELElBQVcsc0JBQXNCO1lBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksNkNBQXFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsWUFBWSxNQUE2QjtZQUN4QyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUkseUJBQXlCLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDaEQ7aUJBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFL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