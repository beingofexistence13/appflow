/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNodeType = exports.stripComments = exports.visit = exports.findNodeAtOffset = exports.contains = exports.getNodeValue = exports.getNodePath = exports.findNodeAtLocation = exports.parseTree = exports.parse = exports.getLocation = exports.createScanner = exports.ParseOptions = exports.ParseErrorCode = exports.SyntaxKind = exports.ScanError = void 0;
    var ScanError;
    (function (ScanError) {
        ScanError[ScanError["None"] = 0] = "None";
        ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
        ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
        ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
        ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
        ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
        ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
    })(ScanError || (exports.ScanError = ScanError = {}));
    var SyntaxKind;
    (function (SyntaxKind) {
        SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
        SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
        SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
        SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
        SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
        SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
        SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
        SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
        SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
        SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
        SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
        SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
        SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
        SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
        SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
        SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
        SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
    })(SyntaxKind || (exports.SyntaxKind = SyntaxKind = {}));
    var ParseErrorCode;
    (function (ParseErrorCode) {
        ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
        ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
        ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
        ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
        ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
        ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
        ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
        ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
        ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
        ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
        ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
        ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
        ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
    })(ParseErrorCode || (exports.ParseErrorCode = ParseErrorCode = {}));
    var ParseOptions;
    (function (ParseOptions) {
        ParseOptions.DEFAULT = {
            allowTrailingComma: true
        };
    })(ParseOptions || (exports.ParseOptions = ParseOptions = {}));
    /**
     * Creates a JSON scanner on the given text.
     * If ignoreTrivia is set, whitespaces or comments are ignored.
     */
    function createScanner(text, ignoreTrivia = false) {
        let pos = 0;
        const len = text.length;
        let value = '';
        let tokenOffset = 0;
        let token = 16 /* SyntaxKind.Unknown */;
        let scanError = 0 /* ScanError.None */;
        function scanHexDigits(count) {
            let digits = 0;
            let hexValue = 0;
            while (digits < count) {
                const ch = text.charCodeAt(pos);
                if (ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */) {
                    hexValue = hexValue * 16 + ch - 48 /* CharacterCodes._0 */;
                }
                else if (ch >= 65 /* CharacterCodes.A */ && ch <= 70 /* CharacterCodes.F */) {
                    hexValue = hexValue * 16 + ch - 65 /* CharacterCodes.A */ + 10;
                }
                else if (ch >= 97 /* CharacterCodes.a */ && ch <= 102 /* CharacterCodes.f */) {
                    hexValue = hexValue * 16 + ch - 97 /* CharacterCodes.a */ + 10;
                }
                else {
                    break;
                }
                pos++;
                digits++;
            }
            if (digits < count) {
                hexValue = -1;
            }
            return hexValue;
        }
        function setPosition(newPosition) {
            pos = newPosition;
            value = '';
            tokenOffset = 0;
            token = 16 /* SyntaxKind.Unknown */;
            scanError = 0 /* ScanError.None */;
        }
        function scanNumber() {
            const start = pos;
            if (text.charCodeAt(pos) === 48 /* CharacterCodes._0 */) {
                pos++;
            }
            else {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            if (pos < text.length && text.charCodeAt(pos) === 46 /* CharacterCodes.dot */) {
                pos++;
                if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                        pos++;
                    }
                }
                else {
                    scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                    return text.substring(start, pos);
                }
            }
            let end = pos;
            if (pos < text.length && (text.charCodeAt(pos) === 69 /* CharacterCodes.E */ || text.charCodeAt(pos) === 101 /* CharacterCodes.e */)) {
                pos++;
                if (pos < text.length && text.charCodeAt(pos) === 43 /* CharacterCodes.plus */ || text.charCodeAt(pos) === 45 /* CharacterCodes.minus */) {
                    pos++;
                }
                if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                        pos++;
                    }
                    end = pos;
                }
                else {
                    scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                }
            }
            return text.substring(start, end);
        }
        function scanString() {
            let result = '', start = pos;
            while (true) {
                if (pos >= len) {
                    result += text.substring(start, pos);
                    scanError = 2 /* ScanError.UnexpectedEndOfString */;
                    break;
                }
                const ch = text.charCodeAt(pos);
                if (ch === 34 /* CharacterCodes.doubleQuote */) {
                    result += text.substring(start, pos);
                    pos++;
                    break;
                }
                if (ch === 92 /* CharacterCodes.backslash */) {
                    result += text.substring(start, pos);
                    pos++;
                    if (pos >= len) {
                        scanError = 2 /* ScanError.UnexpectedEndOfString */;
                        break;
                    }
                    const ch2 = text.charCodeAt(pos++);
                    switch (ch2) {
                        case 34 /* CharacterCodes.doubleQuote */:
                            result += '\"';
                            break;
                        case 92 /* CharacterCodes.backslash */:
                            result += '\\';
                            break;
                        case 47 /* CharacterCodes.slash */:
                            result += '/';
                            break;
                        case 98 /* CharacterCodes.b */:
                            result += '\b';
                            break;
                        case 102 /* CharacterCodes.f */:
                            result += '\f';
                            break;
                        case 110 /* CharacterCodes.n */:
                            result += '\n';
                            break;
                        case 114 /* CharacterCodes.r */:
                            result += '\r';
                            break;
                        case 116 /* CharacterCodes.t */:
                            result += '\t';
                            break;
                        case 117 /* CharacterCodes.u */: {
                            const ch3 = scanHexDigits(4);
                            if (ch3 >= 0) {
                                result += String.fromCharCode(ch3);
                            }
                            else {
                                scanError = 4 /* ScanError.InvalidUnicode */;
                            }
                            break;
                        }
                        default:
                            scanError = 5 /* ScanError.InvalidEscapeCharacter */;
                    }
                    start = pos;
                    continue;
                }
                if (ch >= 0 && ch <= 0x1F) {
                    if (isLineBreak(ch)) {
                        result += text.substring(start, pos);
                        scanError = 2 /* ScanError.UnexpectedEndOfString */;
                        break;
                    }
                    else {
                        scanError = 6 /* ScanError.InvalidCharacter */;
                        // mark as error but continue with string
                    }
                }
                pos++;
            }
            return result;
        }
        function scanNext() {
            value = '';
            scanError = 0 /* ScanError.None */;
            tokenOffset = pos;
            if (pos >= len) {
                // at the end
                tokenOffset = len;
                return token = 17 /* SyntaxKind.EOF */;
            }
            let code = text.charCodeAt(pos);
            // trivia: whitespace
            if (isWhitespace(code)) {
                do {
                    pos++;
                    value += String.fromCharCode(code);
                    code = text.charCodeAt(pos);
                } while (isWhitespace(code));
                return token = 15 /* SyntaxKind.Trivia */;
            }
            // trivia: newlines
            if (isLineBreak(code)) {
                pos++;
                value += String.fromCharCode(code);
                if (code === 13 /* CharacterCodes.carriageReturn */ && text.charCodeAt(pos) === 10 /* CharacterCodes.lineFeed */) {
                    pos++;
                    value += '\n';
                }
                return token = 14 /* SyntaxKind.LineBreakTrivia */;
            }
            switch (code) {
                // tokens: []{}:,
                case 123 /* CharacterCodes.openBrace */:
                    pos++;
                    return token = 1 /* SyntaxKind.OpenBraceToken */;
                case 125 /* CharacterCodes.closeBrace */:
                    pos++;
                    return token = 2 /* SyntaxKind.CloseBraceToken */;
                case 91 /* CharacterCodes.openBracket */:
                    pos++;
                    return token = 3 /* SyntaxKind.OpenBracketToken */;
                case 93 /* CharacterCodes.closeBracket */:
                    pos++;
                    return token = 4 /* SyntaxKind.CloseBracketToken */;
                case 58 /* CharacterCodes.colon */:
                    pos++;
                    return token = 6 /* SyntaxKind.ColonToken */;
                case 44 /* CharacterCodes.comma */:
                    pos++;
                    return token = 5 /* SyntaxKind.CommaToken */;
                // strings
                case 34 /* CharacterCodes.doubleQuote */:
                    pos++;
                    value = scanString();
                    return token = 10 /* SyntaxKind.StringLiteral */;
                // comments
                case 47 /* CharacterCodes.slash */: {
                    const start = pos - 1;
                    // Single-line comment
                    if (text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                        pos += 2;
                        while (pos < len) {
                            if (isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        value = text.substring(start, pos);
                        return token = 12 /* SyntaxKind.LineCommentTrivia */;
                    }
                    // Multi-line comment
                    if (text.charCodeAt(pos + 1) === 42 /* CharacterCodes.asterisk */) {
                        pos += 2;
                        const safeLength = len - 1; // For lookahead.
                        let commentClosed = false;
                        while (pos < safeLength) {
                            const ch = text.charCodeAt(pos);
                            if (ch === 42 /* CharacterCodes.asterisk */ && text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                                pos += 2;
                                commentClosed = true;
                                break;
                            }
                            pos++;
                        }
                        if (!commentClosed) {
                            pos++;
                            scanError = 1 /* ScanError.UnexpectedEndOfComment */;
                        }
                        value = text.substring(start, pos);
                        return token = 13 /* SyntaxKind.BlockCommentTrivia */;
                    }
                    // just a single slash
                    value += String.fromCharCode(code);
                    pos++;
                    return token = 16 /* SyntaxKind.Unknown */;
                }
                // numbers
                case 45 /* CharacterCodes.minus */:
                    value += String.fromCharCode(code);
                    pos++;
                    if (pos === len || !isDigit(text.charCodeAt(pos))) {
                        return token = 16 /* SyntaxKind.Unknown */;
                    }
                // found a minus, followed by a number so
                // we fall through to proceed with scanning
                // numbers
                case 48 /* CharacterCodes._0 */:
                case 49 /* CharacterCodes._1 */:
                case 50 /* CharacterCodes._2 */:
                case 51 /* CharacterCodes._3 */:
                case 52 /* CharacterCodes._4 */:
                case 53 /* CharacterCodes._5 */:
                case 54 /* CharacterCodes._6 */:
                case 55 /* CharacterCodes._7 */:
                case 56 /* CharacterCodes._8 */:
                case 57 /* CharacterCodes._9 */:
                    value += scanNumber();
                    return token = 11 /* SyntaxKind.NumericLiteral */;
                // literals and unknown symbols
                default:
                    // is a literal? Read the full word.
                    while (pos < len && isUnknownContentCharacter(code)) {
                        pos++;
                        code = text.charCodeAt(pos);
                    }
                    if (tokenOffset !== pos) {
                        value = text.substring(tokenOffset, pos);
                        // keywords: true, false, null
                        switch (value) {
                            case 'true': return token = 8 /* SyntaxKind.TrueKeyword */;
                            case 'false': return token = 9 /* SyntaxKind.FalseKeyword */;
                            case 'null': return token = 7 /* SyntaxKind.NullKeyword */;
                        }
                        return token = 16 /* SyntaxKind.Unknown */;
                    }
                    // some
                    value += String.fromCharCode(code);
                    pos++;
                    return token = 16 /* SyntaxKind.Unknown */;
            }
        }
        function isUnknownContentCharacter(code) {
            if (isWhitespace(code) || isLineBreak(code)) {
                return false;
            }
            switch (code) {
                case 125 /* CharacterCodes.closeBrace */:
                case 93 /* CharacterCodes.closeBracket */:
                case 123 /* CharacterCodes.openBrace */:
                case 91 /* CharacterCodes.openBracket */:
                case 34 /* CharacterCodes.doubleQuote */:
                case 58 /* CharacterCodes.colon */:
                case 44 /* CharacterCodes.comma */:
                case 47 /* CharacterCodes.slash */:
                    return false;
            }
            return true;
        }
        function scanNextNonTrivia() {
            let result;
            do {
                result = scanNext();
            } while (result >= 12 /* SyntaxKind.LineCommentTrivia */ && result <= 15 /* SyntaxKind.Trivia */);
            return result;
        }
        return {
            setPosition: setPosition,
            getPosition: () => pos,
            scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
            getToken: () => token,
            getTokenValue: () => value,
            getTokenOffset: () => tokenOffset,
            getTokenLength: () => pos - tokenOffset,
            getTokenError: () => scanError
        };
    }
    exports.createScanner = createScanner;
    function isWhitespace(ch) {
        return ch === 32 /* CharacterCodes.space */ || ch === 9 /* CharacterCodes.tab */ || ch === 11 /* CharacterCodes.verticalTab */ || ch === 12 /* CharacterCodes.formFeed */ ||
            ch === 160 /* CharacterCodes.nonBreakingSpace */ || ch === 5760 /* CharacterCodes.ogham */ || ch >= 8192 /* CharacterCodes.enQuad */ && ch <= 8203 /* CharacterCodes.zeroWidthSpace */ ||
            ch === 8239 /* CharacterCodes.narrowNoBreakSpace */ || ch === 8287 /* CharacterCodes.mathematicalSpace */ || ch === 12288 /* CharacterCodes.ideographicSpace */ || ch === 65279 /* CharacterCodes.byteOrderMark */;
    }
    function isLineBreak(ch) {
        return ch === 10 /* CharacterCodes.lineFeed */ || ch === 13 /* CharacterCodes.carriageReturn */ || ch === 8232 /* CharacterCodes.lineSeparator */ || ch === 8233 /* CharacterCodes.paragraphSeparator */;
    }
    function isDigit(ch) {
        return ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */;
    }
    var CharacterCodes;
    (function (CharacterCodes) {
        CharacterCodes[CharacterCodes["nullCharacter"] = 0] = "nullCharacter";
        CharacterCodes[CharacterCodes["maxAsciiCharacter"] = 127] = "maxAsciiCharacter";
        CharacterCodes[CharacterCodes["lineFeed"] = 10] = "lineFeed";
        CharacterCodes[CharacterCodes["carriageReturn"] = 13] = "carriageReturn";
        CharacterCodes[CharacterCodes["lineSeparator"] = 8232] = "lineSeparator";
        CharacterCodes[CharacterCodes["paragraphSeparator"] = 8233] = "paragraphSeparator";
        // REVIEW: do we need to support this?  The scanner doesn't, but our IText does.  This seems
        // like an odd disparity?  (Or maybe it's completely fine for them to be different).
        CharacterCodes[CharacterCodes["nextLine"] = 133] = "nextLine";
        // Unicode 3.0 space characters
        CharacterCodes[CharacterCodes["space"] = 32] = "space";
        CharacterCodes[CharacterCodes["nonBreakingSpace"] = 160] = "nonBreakingSpace";
        CharacterCodes[CharacterCodes["enQuad"] = 8192] = "enQuad";
        CharacterCodes[CharacterCodes["emQuad"] = 8193] = "emQuad";
        CharacterCodes[CharacterCodes["enSpace"] = 8194] = "enSpace";
        CharacterCodes[CharacterCodes["emSpace"] = 8195] = "emSpace";
        CharacterCodes[CharacterCodes["threePerEmSpace"] = 8196] = "threePerEmSpace";
        CharacterCodes[CharacterCodes["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
        CharacterCodes[CharacterCodes["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
        CharacterCodes[CharacterCodes["figureSpace"] = 8199] = "figureSpace";
        CharacterCodes[CharacterCodes["punctuationSpace"] = 8200] = "punctuationSpace";
        CharacterCodes[CharacterCodes["thinSpace"] = 8201] = "thinSpace";
        CharacterCodes[CharacterCodes["hairSpace"] = 8202] = "hairSpace";
        CharacterCodes[CharacterCodes["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
        CharacterCodes[CharacterCodes["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
        CharacterCodes[CharacterCodes["ideographicSpace"] = 12288] = "ideographicSpace";
        CharacterCodes[CharacterCodes["mathematicalSpace"] = 8287] = "mathematicalSpace";
        CharacterCodes[CharacterCodes["ogham"] = 5760] = "ogham";
        CharacterCodes[CharacterCodes["_"] = 95] = "_";
        CharacterCodes[CharacterCodes["$"] = 36] = "$";
        CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
        CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
        CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
        CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
        CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
        CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
        CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
        CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
        CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
        CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
        CharacterCodes[CharacterCodes["a"] = 97] = "a";
        CharacterCodes[CharacterCodes["b"] = 98] = "b";
        CharacterCodes[CharacterCodes["c"] = 99] = "c";
        CharacterCodes[CharacterCodes["d"] = 100] = "d";
        CharacterCodes[CharacterCodes["e"] = 101] = "e";
        CharacterCodes[CharacterCodes["f"] = 102] = "f";
        CharacterCodes[CharacterCodes["g"] = 103] = "g";
        CharacterCodes[CharacterCodes["h"] = 104] = "h";
        CharacterCodes[CharacterCodes["i"] = 105] = "i";
        CharacterCodes[CharacterCodes["j"] = 106] = "j";
        CharacterCodes[CharacterCodes["k"] = 107] = "k";
        CharacterCodes[CharacterCodes["l"] = 108] = "l";
        CharacterCodes[CharacterCodes["m"] = 109] = "m";
        CharacterCodes[CharacterCodes["n"] = 110] = "n";
        CharacterCodes[CharacterCodes["o"] = 111] = "o";
        CharacterCodes[CharacterCodes["p"] = 112] = "p";
        CharacterCodes[CharacterCodes["q"] = 113] = "q";
        CharacterCodes[CharacterCodes["r"] = 114] = "r";
        CharacterCodes[CharacterCodes["s"] = 115] = "s";
        CharacterCodes[CharacterCodes["t"] = 116] = "t";
        CharacterCodes[CharacterCodes["u"] = 117] = "u";
        CharacterCodes[CharacterCodes["v"] = 118] = "v";
        CharacterCodes[CharacterCodes["w"] = 119] = "w";
        CharacterCodes[CharacterCodes["x"] = 120] = "x";
        CharacterCodes[CharacterCodes["y"] = 121] = "y";
        CharacterCodes[CharacterCodes["z"] = 122] = "z";
        CharacterCodes[CharacterCodes["A"] = 65] = "A";
        CharacterCodes[CharacterCodes["B"] = 66] = "B";
        CharacterCodes[CharacterCodes["C"] = 67] = "C";
        CharacterCodes[CharacterCodes["D"] = 68] = "D";
        CharacterCodes[CharacterCodes["E"] = 69] = "E";
        CharacterCodes[CharacterCodes["F"] = 70] = "F";
        CharacterCodes[CharacterCodes["G"] = 71] = "G";
        CharacterCodes[CharacterCodes["H"] = 72] = "H";
        CharacterCodes[CharacterCodes["I"] = 73] = "I";
        CharacterCodes[CharacterCodes["J"] = 74] = "J";
        CharacterCodes[CharacterCodes["K"] = 75] = "K";
        CharacterCodes[CharacterCodes["L"] = 76] = "L";
        CharacterCodes[CharacterCodes["M"] = 77] = "M";
        CharacterCodes[CharacterCodes["N"] = 78] = "N";
        CharacterCodes[CharacterCodes["O"] = 79] = "O";
        CharacterCodes[CharacterCodes["P"] = 80] = "P";
        CharacterCodes[CharacterCodes["Q"] = 81] = "Q";
        CharacterCodes[CharacterCodes["R"] = 82] = "R";
        CharacterCodes[CharacterCodes["S"] = 83] = "S";
        CharacterCodes[CharacterCodes["T"] = 84] = "T";
        CharacterCodes[CharacterCodes["U"] = 85] = "U";
        CharacterCodes[CharacterCodes["V"] = 86] = "V";
        CharacterCodes[CharacterCodes["W"] = 87] = "W";
        CharacterCodes[CharacterCodes["X"] = 88] = "X";
        CharacterCodes[CharacterCodes["Y"] = 89] = "Y";
        CharacterCodes[CharacterCodes["Z"] = 90] = "Z";
        CharacterCodes[CharacterCodes["ampersand"] = 38] = "ampersand";
        CharacterCodes[CharacterCodes["asterisk"] = 42] = "asterisk";
        CharacterCodes[CharacterCodes["at"] = 64] = "at";
        CharacterCodes[CharacterCodes["backslash"] = 92] = "backslash";
        CharacterCodes[CharacterCodes["bar"] = 124] = "bar";
        CharacterCodes[CharacterCodes["caret"] = 94] = "caret";
        CharacterCodes[CharacterCodes["closeBrace"] = 125] = "closeBrace";
        CharacterCodes[CharacterCodes["closeBracket"] = 93] = "closeBracket";
        CharacterCodes[CharacterCodes["closeParen"] = 41] = "closeParen";
        CharacterCodes[CharacterCodes["colon"] = 58] = "colon";
        CharacterCodes[CharacterCodes["comma"] = 44] = "comma";
        CharacterCodes[CharacterCodes["dot"] = 46] = "dot";
        CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
        CharacterCodes[CharacterCodes["equals"] = 61] = "equals";
        CharacterCodes[CharacterCodes["exclamation"] = 33] = "exclamation";
        CharacterCodes[CharacterCodes["greaterThan"] = 62] = "greaterThan";
        CharacterCodes[CharacterCodes["lessThan"] = 60] = "lessThan";
        CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
        CharacterCodes[CharacterCodes["openBrace"] = 123] = "openBrace";
        CharacterCodes[CharacterCodes["openBracket"] = 91] = "openBracket";
        CharacterCodes[CharacterCodes["openParen"] = 40] = "openParen";
        CharacterCodes[CharacterCodes["percent"] = 37] = "percent";
        CharacterCodes[CharacterCodes["plus"] = 43] = "plus";
        CharacterCodes[CharacterCodes["question"] = 63] = "question";
        CharacterCodes[CharacterCodes["semicolon"] = 59] = "semicolon";
        CharacterCodes[CharacterCodes["singleQuote"] = 39] = "singleQuote";
        CharacterCodes[CharacterCodes["slash"] = 47] = "slash";
        CharacterCodes[CharacterCodes["tilde"] = 126] = "tilde";
        CharacterCodes[CharacterCodes["backspace"] = 8] = "backspace";
        CharacterCodes[CharacterCodes["formFeed"] = 12] = "formFeed";
        CharacterCodes[CharacterCodes["byteOrderMark"] = 65279] = "byteOrderMark";
        CharacterCodes[CharacterCodes["tab"] = 9] = "tab";
        CharacterCodes[CharacterCodes["verticalTab"] = 11] = "verticalTab";
    })(CharacterCodes || (CharacterCodes = {}));
    /**
     * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
     */
    function getLocation(text, position) {
        const segments = []; // strings or numbers
        const earlyReturnException = new Object();
        let previousNode = undefined;
        const previousNodeInst = {
            value: {},
            offset: 0,
            length: 0,
            type: 'object',
            parent: undefined
        };
        let isAtPropertyKey = false;
        function setPreviousNode(value, offset, length, type) {
            previousNodeInst.value = value;
            previousNodeInst.offset = offset;
            previousNodeInst.length = length;
            previousNodeInst.type = type;
            previousNodeInst.colonOffset = undefined;
            previousNode = previousNodeInst;
        }
        try {
            visit(text, {
                onObjectBegin: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    isAtPropertyKey = position > offset;
                    segments.push(''); // push a placeholder (will be replaced)
                },
                onObjectProperty: (name, offset, length) => {
                    if (position < offset) {
                        throw earlyReturnException;
                    }
                    setPreviousNode(name, offset, length, 'property');
                    segments[segments.length - 1] = name;
                    if (position <= offset + length) {
                        throw earlyReturnException;
                    }
                },
                onObjectEnd: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.pop();
                },
                onArrayBegin: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.push(0);
                },
                onArrayEnd: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.pop();
                },
                onLiteralValue: (value, offset, length) => {
                    if (position < offset) {
                        throw earlyReturnException;
                    }
                    setPreviousNode(value, offset, length, getNodeType(value));
                    if (position <= offset + length) {
                        throw earlyReturnException;
                    }
                },
                onSeparator: (sep, offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    if (sep === ':' && previousNode && previousNode.type === 'property') {
                        previousNode.colonOffset = offset;
                        isAtPropertyKey = false;
                        previousNode = undefined;
                    }
                    else if (sep === ',') {
                        const last = segments[segments.length - 1];
                        if (typeof last === 'number') {
                            segments[segments.length - 1] = last + 1;
                        }
                        else {
                            isAtPropertyKey = true;
                            segments[segments.length - 1] = '';
                        }
                        previousNode = undefined;
                    }
                }
            });
        }
        catch (e) {
            if (e !== earlyReturnException) {
                throw e;
            }
        }
        return {
            path: segments,
            previousNode,
            isAtPropertyKey,
            matches: (pattern) => {
                let k = 0;
                for (let i = 0; k < pattern.length && i < segments.length; i++) {
                    if (pattern[k] === segments[i] || pattern[k] === '*') {
                        k++;
                    }
                    else if (pattern[k] !== '**') {
                        return false;
                    }
                }
                return k === pattern.length;
            }
        };
    }
    exports.getLocation = getLocation;
    /**
     * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
     * Therefore always check the errors list to find out if the input was valid.
     */
    function parse(text, errors = [], options = ParseOptions.DEFAULT) {
        let currentProperty = null;
        let currentParent = [];
        const previousParents = [];
        function onValue(value) {
            if (Array.isArray(currentParent)) {
                currentParent.push(value);
            }
            else if (currentProperty !== null) {
                currentParent[currentProperty] = value;
            }
        }
        const visitor = {
            onObjectBegin: () => {
                const object = {};
                onValue(object);
                previousParents.push(currentParent);
                currentParent = object;
                currentProperty = null;
            },
            onObjectProperty: (name) => {
                currentProperty = name;
            },
            onObjectEnd: () => {
                currentParent = previousParents.pop();
            },
            onArrayBegin: () => {
                const array = [];
                onValue(array);
                previousParents.push(currentParent);
                currentParent = array;
                currentProperty = null;
            },
            onArrayEnd: () => {
                currentParent = previousParents.pop();
            },
            onLiteralValue: onValue,
            onError: (error, offset, length) => {
                errors.push({ error, offset, length });
            }
        };
        visit(text, visitor, options);
        return currentParent[0];
    }
    exports.parse = parse;
    /**
     * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
     */
    function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
        let currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: undefined }; // artificial root
        function ensurePropertyComplete(endOffset) {
            if (currentParent.type === 'property') {
                currentParent.length = endOffset - currentParent.offset;
                currentParent = currentParent.parent;
            }
        }
        function onValue(valueNode) {
            currentParent.children.push(valueNode);
            return valueNode;
        }
        const visitor = {
            onObjectBegin: (offset) => {
                currentParent = onValue({ type: 'object', offset, length: -1, parent: currentParent, children: [] });
            },
            onObjectProperty: (name, offset, length) => {
                currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
                currentParent.children.push({ type: 'string', value: name, offset, length, parent: currentParent });
            },
            onObjectEnd: (offset, length) => {
                currentParent.length = offset + length - currentParent.offset;
                currentParent = currentParent.parent;
                ensurePropertyComplete(offset + length);
            },
            onArrayBegin: (offset, length) => {
                currentParent = onValue({ type: 'array', offset, length: -1, parent: currentParent, children: [] });
            },
            onArrayEnd: (offset, length) => {
                currentParent.length = offset + length - currentParent.offset;
                currentParent = currentParent.parent;
                ensurePropertyComplete(offset + length);
            },
            onLiteralValue: (value, offset, length) => {
                onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
                ensurePropertyComplete(offset + length);
            },
            onSeparator: (sep, offset, length) => {
                if (currentParent.type === 'property') {
                    if (sep === ':') {
                        currentParent.colonOffset = offset;
                    }
                    else if (sep === ',') {
                        ensurePropertyComplete(offset);
                    }
                }
            },
            onError: (error, offset, length) => {
                errors.push({ error, offset, length });
            }
        };
        visit(text, visitor, options);
        const result = currentParent.children[0];
        if (result) {
            delete result.parent;
        }
        return result;
    }
    exports.parseTree = parseTree;
    /**
     * Finds the node at the given path in a JSON DOM.
     */
    function findNodeAtLocation(root, path) {
        if (!root) {
            return undefined;
        }
        let node = root;
        for (const segment of path) {
            if (typeof segment === 'string') {
                if (node.type !== 'object' || !Array.isArray(node.children)) {
                    return undefined;
                }
                let found = false;
                for (const propertyNode of node.children) {
                    if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                        node = propertyNode.children[1];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return undefined;
                }
            }
            else {
                const index = segment;
                if (node.type !== 'array' || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                    return undefined;
                }
                node = node.children[index];
            }
        }
        return node;
    }
    exports.findNodeAtLocation = findNodeAtLocation;
    /**
     * Gets the JSON path of the given JSON DOM node
     */
    function getNodePath(node) {
        if (!node.parent || !node.parent.children) {
            return [];
        }
        const path = getNodePath(node.parent);
        if (node.parent.type === 'property') {
            const key = node.parent.children[0].value;
            path.push(key);
        }
        else if (node.parent.type === 'array') {
            const index = node.parent.children.indexOf(node);
            if (index !== -1) {
                path.push(index);
            }
        }
        return path;
    }
    exports.getNodePath = getNodePath;
    /**
     * Evaluates the JavaScript object of the given JSON DOM node
     */
    function getNodeValue(node) {
        switch (node.type) {
            case 'array':
                return node.children.map(getNodeValue);
            case 'object': {
                const obj = Object.create(null);
                for (const prop of node.children) {
                    const valueNode = prop.children[1];
                    if (valueNode) {
                        obj[prop.children[0].value] = getNodeValue(valueNode);
                    }
                }
                return obj;
            }
            case 'null':
            case 'string':
            case 'number':
            case 'boolean':
                return node.value;
            default:
                return undefined;
        }
    }
    exports.getNodeValue = getNodeValue;
    function contains(node, offset, includeRightBound = false) {
        return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
    }
    exports.contains = contains;
    /**
     * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
     */
    function findNodeAtOffset(node, offset, includeRightBound = false) {
        if (contains(node, offset, includeRightBound)) {
            const children = node.children;
            if (Array.isArray(children)) {
                for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                    const item = findNodeAtOffset(children[i], offset, includeRightBound);
                    if (item) {
                        return item;
                    }
                }
            }
            return node;
        }
        return undefined;
    }
    exports.findNodeAtOffset = findNodeAtOffset;
    /**
     * Parses the given text and invokes the visitor functions for each object, array and literal reached.
     */
    function visit(text, visitor, options = ParseOptions.DEFAULT) {
        const _scanner = createScanner(text, false);
        function toNoArgVisit(visitFunction) {
            return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
        }
        function toOneArgVisit(visitFunction) {
            return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
        }
        const onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
        const disallowComments = options && options.disallowComments;
        const allowTrailingComma = options && options.allowTrailingComma;
        function scanNext() {
            while (true) {
                const token = _scanner.scan();
                switch (_scanner.getTokenError()) {
                    case 4 /* ScanError.InvalidUnicode */:
                        handleError(14 /* ParseErrorCode.InvalidUnicode */);
                        break;
                    case 5 /* ScanError.InvalidEscapeCharacter */:
                        handleError(15 /* ParseErrorCode.InvalidEscapeCharacter */);
                        break;
                    case 3 /* ScanError.UnexpectedEndOfNumber */:
                        handleError(13 /* ParseErrorCode.UnexpectedEndOfNumber */);
                        break;
                    case 1 /* ScanError.UnexpectedEndOfComment */:
                        if (!disallowComments) {
                            handleError(11 /* ParseErrorCode.UnexpectedEndOfComment */);
                        }
                        break;
                    case 2 /* ScanError.UnexpectedEndOfString */:
                        handleError(12 /* ParseErrorCode.UnexpectedEndOfString */);
                        break;
                    case 6 /* ScanError.InvalidCharacter */:
                        handleError(16 /* ParseErrorCode.InvalidCharacter */);
                        break;
                }
                switch (token) {
                    case 12 /* SyntaxKind.LineCommentTrivia */:
                    case 13 /* SyntaxKind.BlockCommentTrivia */:
                        if (disallowComments) {
                            handleError(10 /* ParseErrorCode.InvalidCommentToken */);
                        }
                        else {
                            onComment();
                        }
                        break;
                    case 16 /* SyntaxKind.Unknown */:
                        handleError(1 /* ParseErrorCode.InvalidSymbol */);
                        break;
                    case 15 /* SyntaxKind.Trivia */:
                    case 14 /* SyntaxKind.LineBreakTrivia */:
                        break;
                    default:
                        return token;
                }
            }
        }
        function handleError(error, skipUntilAfter = [], skipUntil = []) {
            onError(error);
            if (skipUntilAfter.length + skipUntil.length > 0) {
                let token = _scanner.getToken();
                while (token !== 17 /* SyntaxKind.EOF */) {
                    if (skipUntilAfter.indexOf(token) !== -1) {
                        scanNext();
                        break;
                    }
                    else if (skipUntil.indexOf(token) !== -1) {
                        break;
                    }
                    token = scanNext();
                }
            }
        }
        function parseString(isValue) {
            const value = _scanner.getTokenValue();
            if (isValue) {
                onLiteralValue(value);
            }
            else {
                onObjectProperty(value);
            }
            scanNext();
            return true;
        }
        function parseLiteral() {
            switch (_scanner.getToken()) {
                case 11 /* SyntaxKind.NumericLiteral */: {
                    let value = 0;
                    try {
                        value = JSON.parse(_scanner.getTokenValue());
                        if (typeof value !== 'number') {
                            handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                            value = 0;
                        }
                    }
                    catch (e) {
                        handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                    }
                    onLiteralValue(value);
                    break;
                }
                case 7 /* SyntaxKind.NullKeyword */:
                    onLiteralValue(null);
                    break;
                case 8 /* SyntaxKind.TrueKeyword */:
                    onLiteralValue(true);
                    break;
                case 9 /* SyntaxKind.FalseKeyword */:
                    onLiteralValue(false);
                    break;
                default:
                    return false;
            }
            scanNext();
            return true;
        }
        function parseProperty() {
            if (_scanner.getToken() !== 10 /* SyntaxKind.StringLiteral */) {
                handleError(3 /* ParseErrorCode.PropertyNameExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                return false;
            }
            parseString(false);
            if (_scanner.getToken() === 6 /* SyntaxKind.ColonToken */) {
                onSeparator(':');
                scanNext(); // consume colon
                if (!parseValue()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                }
            }
            else {
                handleError(5 /* ParseErrorCode.ColonExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
            }
            return true;
        }
        function parseObject() {
            onObjectBegin();
            scanNext(); // consume open brace
            let needsComma = false;
            while (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
                if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                    if (!needsComma) {
                        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                    }
                    onSeparator(',');
                    scanNext(); // consume comma
                    if (_scanner.getToken() === 2 /* SyntaxKind.CloseBraceToken */ && allowTrailingComma) {
                        break;
                    }
                }
                else if (needsComma) {
                    handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
                }
                if (!parseProperty()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                }
                needsComma = true;
            }
            onObjectEnd();
            if (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */) {
                handleError(7 /* ParseErrorCode.CloseBraceExpected */, [2 /* SyntaxKind.CloseBraceToken */], []);
            }
            else {
                scanNext(); // consume close brace
            }
            return true;
        }
        function parseArray() {
            onArrayBegin();
            scanNext(); // consume open bracket
            let needsComma = false;
            while (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
                if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                    if (!needsComma) {
                        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                    }
                    onSeparator(',');
                    scanNext(); // consume comma
                    if (_scanner.getToken() === 4 /* SyntaxKind.CloseBracketToken */ && allowTrailingComma) {
                        break;
                    }
                }
                else if (needsComma) {
                    handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
                }
                if (!parseValue()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [4 /* SyntaxKind.CloseBracketToken */, 5 /* SyntaxKind.CommaToken */]);
                }
                needsComma = true;
            }
            onArrayEnd();
            if (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */) {
                handleError(8 /* ParseErrorCode.CloseBracketExpected */, [4 /* SyntaxKind.CloseBracketToken */], []);
            }
            else {
                scanNext(); // consume close bracket
            }
            return true;
        }
        function parseValue() {
            switch (_scanner.getToken()) {
                case 3 /* SyntaxKind.OpenBracketToken */:
                    return parseArray();
                case 1 /* SyntaxKind.OpenBraceToken */:
                    return parseObject();
                case 10 /* SyntaxKind.StringLiteral */:
                    return parseString(true);
                default:
                    return parseLiteral();
            }
        }
        scanNext();
        if (_scanner.getToken() === 17 /* SyntaxKind.EOF */) {
            if (options.allowEmptyContent) {
                return true;
            }
            handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
            return false;
        }
        if (!parseValue()) {
            handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
            return false;
        }
        if (_scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
            handleError(9 /* ParseErrorCode.EndOfFileExpected */, [], []);
        }
        return true;
    }
    exports.visit = visit;
    /**
     * Takes JSON with JavaScript-style comments and remove
     * them. Optionally replaces every none-newline character
     * of comments with a replaceCharacter
     */
    function stripComments(text, replaceCh) {
        const _scanner = createScanner(text);
        const parts = [];
        let kind;
        let offset = 0;
        let pos;
        do {
            pos = _scanner.getPosition();
            kind = _scanner.scan();
            switch (kind) {
                case 12 /* SyntaxKind.LineCommentTrivia */:
                case 13 /* SyntaxKind.BlockCommentTrivia */:
                case 17 /* SyntaxKind.EOF */:
                    if (offset !== pos) {
                        parts.push(text.substring(offset, pos));
                    }
                    if (replaceCh !== undefined) {
                        parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
                    }
                    offset = _scanner.getPosition();
                    break;
            }
        } while (kind !== 17 /* SyntaxKind.EOF */);
        return parts.join('');
    }
    exports.stripComments = stripComments;
    function getNodeType(value) {
        switch (typeof value) {
            case 'boolean': return 'boolean';
            case 'number': return 'number';
            case 'string': return 'string';
            case 'object': {
                if (!value) {
                    return 'null';
                }
                else if (Array.isArray(value)) {
                    return 'array';
                }
                return 'object';
            }
            default: return 'null';
        }
    }
    exports.getNodeType = getNodeType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLElBQWtCLFNBUWpCO0lBUkQsV0FBa0IsU0FBUztRQUMxQix5Q0FBUSxDQUFBO1FBQ1IsNkVBQTBCLENBQUE7UUFDMUIsMkVBQXlCLENBQUE7UUFDekIsMkVBQXlCLENBQUE7UUFDekIsNkRBQWtCLENBQUE7UUFDbEIsNkVBQTBCLENBQUE7UUFDMUIsaUVBQW9CLENBQUE7SUFDckIsQ0FBQyxFQVJpQixTQUFTLHlCQUFULFNBQVMsUUFRMUI7SUFFRCxJQUFrQixVQWtCakI7SUFsQkQsV0FBa0IsVUFBVTtRQUMzQiwrREFBa0IsQ0FBQTtRQUNsQixpRUFBbUIsQ0FBQTtRQUNuQixtRUFBb0IsQ0FBQTtRQUNwQixxRUFBcUIsQ0FBQTtRQUNyQix1REFBYyxDQUFBO1FBQ2QsdURBQWMsQ0FBQTtRQUNkLHlEQUFlLENBQUE7UUFDZix5REFBZSxDQUFBO1FBQ2YsMkRBQWdCLENBQUE7UUFDaEIsOERBQWtCLENBQUE7UUFDbEIsZ0VBQW1CLENBQUE7UUFDbkIsc0VBQXNCLENBQUE7UUFDdEIsd0VBQXVCLENBQUE7UUFDdkIsa0VBQW9CLENBQUE7UUFDcEIsZ0RBQVcsQ0FBQTtRQUNYLGtEQUFZLENBQUE7UUFDWiwwQ0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQWxCaUIsVUFBVSwwQkFBVixVQUFVLFFBa0IzQjtJQWdERCxJQUFrQixjQWlCakI7SUFqQkQsV0FBa0IsY0FBYztRQUMvQixxRUFBaUIsQ0FBQTtRQUNqQixpRkFBdUIsQ0FBQTtRQUN2QixtRkFBd0IsQ0FBQTtRQUN4QixxRUFBaUIsQ0FBQTtRQUNqQixxRUFBaUIsQ0FBQTtRQUNqQixxRUFBaUIsQ0FBQTtRQUNqQiwrRUFBc0IsQ0FBQTtRQUN0QixtRkFBd0IsQ0FBQTtR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LDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFDUiwrQ0FBUSxDQUFBO1FBQ1IsK0NBQVEsQ0FBQTtRQUNSLCtDQUFRLENBQUE7UUFFUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUNSLDhDQUFRLENBQUE7UUFDUiw4Q0FBUSxDQUFBO1FBQ1IsOENBQVEsQ0FBQTtRQUVSLDhEQUFnQixDQUFBO1FBQ2hCLDREQUFlLENBQUE7UUFDZixnREFBUyxDQUFBO1FBQ1QsOERBQWdCLENBQUE7UUFDaEIsbURBQVUsQ0FBQTtRQUNW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