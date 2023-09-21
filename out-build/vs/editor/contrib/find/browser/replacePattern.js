/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/search"], function (require, exports, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x7 = exports.$w7 = exports.$v7 = void 0;
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
    class $v7 {
        static fromStaticValue(value) {
            return new $v7([$w7.staticValue(value)]);
        }
        get hasReplacementPatterns() {
            return (this.a.kind === 1 /* ReplacePatternKind.DynamicPieces */);
        }
        constructor(pieces) {
            if (!pieces || pieces.length === 0) {
                this.a = new StaticValueReplacePattern('');
            }
            else if (pieces.length === 1 && pieces[0].staticValue !== null) {
                this.a = new StaticValueReplacePattern(pieces[0].staticValue);
            }
            else {
                this.a = new DynamicPiecesReplacePattern(pieces);
            }
        }
        buildReplaceString(matches, preserveCase) {
            if (this.a.kind === 0 /* ReplacePatternKind.StaticValue */) {
                if (preserveCase) {
                    return (0, search_1.$MS)(matches, this.a.staticValue);
                }
                else {
                    return this.a.staticValue;
                }
            }
            let result = '';
            for (let i = 0, len = this.a.pieces.length; i < len; i++) {
                const piece = this.a.pieces[i];
                if (piece.staticValue !== null) {
                    // static value ReplacePiece
                    result += piece.staticValue;
                    continue;
                }
                // match index ReplacePiece
                let match = $v7.b(piece.matchIndex, matches);
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
        static b(matchIndex, matches) {
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
    exports.$v7 = $v7;
    /**
     * A replace piece can either be a static string or an index to a specific match.
     */
    class $w7 {
        static staticValue(value) {
            return new $w7(value, -1, null);
        }
        static matchIndex(index) {
            return new $w7(null, index, null);
        }
        static caseOps(index, caseOps) {
            return new $w7(null, index, caseOps);
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
    exports.$w7 = $w7;
    class ReplacePieceBuilder {
        constructor(source) {
            this.a = source;
            this.b = 0;
            this.c = [];
            this.d = 0;
            this.e = '';
        }
        emitUnchanged(toCharIndex) {
            this.f(this.a.substring(this.b, toCharIndex));
            this.b = toCharIndex;
        }
        emitStatic(value, toCharIndex) {
            this.f(value);
            this.b = toCharIndex;
        }
        f(value) {
            if (value.length === 0) {
                return;
            }
            this.e += value;
        }
        emitMatchIndex(index, toCharIndex, caseOps) {
            if (this.e.length !== 0) {
                this.c[this.d++] = $w7.staticValue(this.e);
                this.e = '';
            }
            this.c[this.d++] = $w7.caseOps(index, caseOps);
            this.b = toCharIndex;
        }
        finalize() {
            this.emitUnchanged(this.a.length);
            if (this.e.length !== 0) {
                this.c[this.d++] = $w7.staticValue(this.e);
                this.e = '';
            }
            return new $v7(this.c);
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
    function $x7(replaceString) {
        if (!replaceString || replaceString.length === 0) {
            return new $v7(null);
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
    exports.$x7 = $x7;
});
//# sourceMappingURL=replacePattern.js.map