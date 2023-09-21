/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/nls!vs/platform/contextkey/common/scanner"], function (require, exports, errors_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fi = exports.TokenType = void 0;
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["LParen"] = 0] = "LParen";
        TokenType[TokenType["RParen"] = 1] = "RParen";
        TokenType[TokenType["Neg"] = 2] = "Neg";
        TokenType[TokenType["Eq"] = 3] = "Eq";
        TokenType[TokenType["NotEq"] = 4] = "NotEq";
        TokenType[TokenType["Lt"] = 5] = "Lt";
        TokenType[TokenType["LtEq"] = 6] = "LtEq";
        TokenType[TokenType["Gt"] = 7] = "Gt";
        TokenType[TokenType["GtEq"] = 8] = "GtEq";
        TokenType[TokenType["RegexOp"] = 9] = "RegexOp";
        TokenType[TokenType["RegexStr"] = 10] = "RegexStr";
        TokenType[TokenType["True"] = 11] = "True";
        TokenType[TokenType["False"] = 12] = "False";
        TokenType[TokenType["In"] = 13] = "In";
        TokenType[TokenType["Not"] = 14] = "Not";
        TokenType[TokenType["And"] = 15] = "And";
        TokenType[TokenType["Or"] = 16] = "Or";
        TokenType[TokenType["Str"] = 17] = "Str";
        TokenType[TokenType["QuotedStr"] = 18] = "QuotedStr";
        TokenType[TokenType["Error"] = 19] = "Error";
        TokenType[TokenType["EOF"] = 20] = "EOF";
    })(TokenType || (exports.TokenType = TokenType = {}));
    function hintDidYouMean(...meant) {
        switch (meant.length) {
            case 1:
                return (0, nls_1.localize)(0, null, meant[0]);
            case 2:
                return (0, nls_1.localize)(1, null, meant[0], meant[1]);
            case 3:
                return (0, nls_1.localize)(2, null, meant[0], meant[1], meant[2]);
            default: // we just don't expect that many
                return undefined;
        }
    }
    const hintDidYouForgetToOpenOrCloseQuote = (0, nls_1.localize)(3, null);
    const hintDidYouForgetToEscapeSlash = (0, nls_1.localize)(4, null);
    /**
     * A simple scanner for context keys.
     *
     * Example:
     *
     * ```ts
     * const scanner = new Scanner().reset('resourceFileName =~ /docker/ && !config.docker.enabled');
     * const tokens = [...scanner];
     * if (scanner.errorTokens.length > 0) {
     *     scanner.errorTokens.forEach(err => console.error(`Unexpected token at ${err.offset}: ${err.lexeme}\nHint: ${err.additional}`));
     * } else {
     *     // process tokens
     * }
     * ```
     */
    class $Fi {
        constructor() {
            this.c = '';
            this.d = 0;
            this.e = 0;
            this.f = [];
            this.g = [];
            // u - unicode, y - sticky // TODO@ulugbekna: we accept double quotes as part of the string rather than as a delimiter (to preserve old parser's behavior)
            this.m = /[a-zA-Z0-9_<>\-\./\\:\*\?\+\[\]\^,#@;"%\$\p{L}-]+/uy;
        }
        static getLexeme(token) {
            switch (token.type) {
                case 0 /* TokenType.LParen */:
                    return '(';
                case 1 /* TokenType.RParen */:
                    return ')';
                case 2 /* TokenType.Neg */:
                    return '!';
                case 3 /* TokenType.Eq */:
                    return token.isTripleEq ? '===' : '==';
                case 4 /* TokenType.NotEq */:
                    return token.isTripleEq ? '!==' : '!=';
                case 5 /* TokenType.Lt */:
                    return '<';
                case 6 /* TokenType.LtEq */:
                    return '<=';
                case 7 /* TokenType.Gt */:
                    return '>=';
                case 8 /* TokenType.GtEq */:
                    return '>=';
                case 9 /* TokenType.RegexOp */:
                    return '=~';
                case 10 /* TokenType.RegexStr */:
                    return token.lexeme;
                case 11 /* TokenType.True */:
                    return 'true';
                case 12 /* TokenType.False */:
                    return 'false';
                case 13 /* TokenType.In */:
                    return 'in';
                case 14 /* TokenType.Not */:
                    return 'not';
                case 15 /* TokenType.And */:
                    return '&&';
                case 16 /* TokenType.Or */:
                    return '||';
                case 17 /* TokenType.Str */:
                    return token.lexeme;
                case 18 /* TokenType.QuotedStr */:
                    return token.lexeme;
                case 19 /* TokenType.Error */:
                    return token.lexeme;
                case 20 /* TokenType.EOF */:
                    return 'EOF';
                default:
                    throw (0, errors_1.$6)(`unhandled token type: ${JSON.stringify(token)}; have you forgotten to add a case?`);
            }
        }
        static { this.a = new Set(['i', 'g', 's', 'm', 'y', 'u'].map(ch => ch.charCodeAt(0))); }
        static { this.b = new Map([
            ['not', 14 /* TokenType.Not */],
            ['in', 13 /* TokenType.In */],
            ['false', 12 /* TokenType.False */],
            ['true', 11 /* TokenType.True */],
        ]); }
        get errors() {
            return this.g;
        }
        reset(value) {
            this.c = value;
            this.d = 0;
            this.e = 0;
            this.f = [];
            this.g = [];
            return this;
        }
        scan() {
            while (!this.r()) {
                this.d = this.e;
                const ch = this.i();
                switch (ch) {
                    case 40 /* CharCode.OpenParen */:
                        this.k(0 /* TokenType.LParen */);
                        break;
                    case 41 /* CharCode.CloseParen */:
                        this.k(1 /* TokenType.RParen */);
                        break;
                    case 33 /* CharCode.ExclamationMark */:
                        if (this.h(61 /* CharCode.Equals */)) {
                            const isTripleEq = this.h(61 /* CharCode.Equals */); // eat last `=` if `!==`
                            this.f.push({ type: 4 /* TokenType.NotEq */, offset: this.d, isTripleEq });
                        }
                        else {
                            this.k(2 /* TokenType.Neg */);
                        }
                        break;
                    case 39 /* CharCode.SingleQuote */:
                        this.o();
                        break;
                    case 47 /* CharCode.Slash */:
                        this.q();
                        break;
                    case 61 /* CharCode.Equals */:
                        if (this.h(61 /* CharCode.Equals */)) { // support `==`
                            const isTripleEq = this.h(61 /* CharCode.Equals */); // eat last `=` if `===`
                            this.f.push({ type: 3 /* TokenType.Eq */, offset: this.d, isTripleEq });
                        }
                        else if (this.h(126 /* CharCode.Tilde */)) {
                            this.k(9 /* TokenType.RegexOp */);
                        }
                        else {
                            this.l(hintDidYouMean('==', '=~'));
                        }
                        break;
                    case 60 /* CharCode.LessThan */:
                        this.k(this.h(61 /* CharCode.Equals */) ? 6 /* TokenType.LtEq */ : 5 /* TokenType.Lt */);
                        break;
                    case 62 /* CharCode.GreaterThan */:
                        this.k(this.h(61 /* CharCode.Equals */) ? 8 /* TokenType.GtEq */ : 7 /* TokenType.Gt */);
                        break;
                    case 38 /* CharCode.Ampersand */:
                        if (this.h(38 /* CharCode.Ampersand */)) {
                            this.k(15 /* TokenType.And */);
                        }
                        else {
                            this.l(hintDidYouMean('&&'));
                        }
                        break;
                    case 124 /* CharCode.Pipe */:
                        if (this.h(124 /* CharCode.Pipe */)) {
                            this.k(16 /* TokenType.Or */);
                        }
                        else {
                            this.l(hintDidYouMean('||'));
                        }
                        break;
                    // TODO@ulugbekna: 1) rewrite using a regex 2) reconsider what characters are considered whitespace, including unicode, nbsp, etc.
                    case 32 /* CharCode.Space */:
                    case 13 /* CharCode.CarriageReturn */:
                    case 9 /* CharCode.Tab */:
                    case 10 /* CharCode.LineFeed */:
                    case 160 /* CharCode.NoBreakSpace */: // &nbsp
                        break;
                    default:
                        this.n();
                }
            }
            this.d = this.e;
            this.k(20 /* TokenType.EOF */);
            return Array.from(this.f);
        }
        h(expected) {
            if (this.r()) {
                return false;
            }
            if (this.c.charCodeAt(this.e) !== expected) {
                return false;
            }
            this.e++;
            return true;
        }
        i() {
            return this.c.charCodeAt(this.e++);
        }
        j() {
            return this.r() ? 0 /* CharCode.Null */ : this.c.charCodeAt(this.e);
        }
        k(type) {
            this.f.push({ type, offset: this.d });
        }
        l(additional) {
            const offset = this.d;
            const lexeme = this.c.substring(this.d, this.e);
            const errToken = { type: 19 /* TokenType.Error */, offset: this.d, lexeme };
            this.g.push({ offset, lexeme, additionalInfo: additional });
            this.f.push(errToken);
        }
        n() {
            this.m.lastIndex = this.d;
            const match = this.m.exec(this.c);
            if (match) {
                this.e = this.d + match[0].length;
                const lexeme = this.c.substring(this.d, this.e);
                const keyword = $Fi.b.get(lexeme);
                if (keyword) {
                    this.k(keyword);
                }
                else {
                    this.f.push({ type: 17 /* TokenType.Str */, lexeme, offset: this.d });
                }
            }
        }
        // captures the lexeme without the leading and trailing '
        o() {
            while (this.j() !== 39 /* CharCode.SingleQuote */ && !this.r()) { // TODO@ulugbekna: add support for escaping ' ?
                this.i();
            }
            if (this.r()) {
                this.l(hintDidYouForgetToOpenOrCloseQuote);
                return;
            }
            // consume the closing '
            this.i();
            this.f.push({ type: 18 /* TokenType.QuotedStr */, lexeme: this.c.substring(this.d + 1, this.e - 1), offset: this.d + 1 });
        }
        /*
         * Lexing a regex expression: /.../[igsmyu]*
         * Based on https://github.com/microsoft/TypeScript/blob/9247ef115e617805983740ba795d7a8164babf89/src/compiler/scanner.ts#L2129-L2181
         *
         * Note that we want slashes within a regex to be escaped, e.g., /file:\\/\\/\\// should match `file:///`
         */
        q() {
            let p = this.e;
            let inEscape = false;
            let inCharacterClass = false;
            while (true) {
                if (p >= this.c.length) {
                    this.e = p;
                    this.l(hintDidYouForgetToEscapeSlash);
                    return;
                }
                const ch = this.c.charCodeAt(p);
                if (inEscape) { // parsing an escape character
                    inEscape = false;
                }
                else if (ch === 47 /* CharCode.Slash */ && !inCharacterClass) { // end of regex
                    p++;
                    break;
                }
                else if (ch === 91 /* CharCode.OpenSquareBracket */) {
                    inCharacterClass = true;
                }
                else if (ch === 92 /* CharCode.Backslash */) {
                    inEscape = true;
                }
                else if (ch === 93 /* CharCode.CloseSquareBracket */) {
                    inCharacterClass = false;
                }
                p++;
            }
            // Consume flags // TODO@ulugbekna: use regex instead
            while (p < this.c.length && $Fi.a.has(this.c.charCodeAt(p))) {
                p++;
            }
            this.e = p;
            const lexeme = this.c.substring(this.d, this.e);
            this.f.push({ type: 10 /* TokenType.RegexStr */, lexeme, offset: this.d });
        }
        r() {
            return this.e >= this.c.length;
        }
    }
    exports.$Fi = $Fi;
});
//# sourceMappingURL=scanner.js.map