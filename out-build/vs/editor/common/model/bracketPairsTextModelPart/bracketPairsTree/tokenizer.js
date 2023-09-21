/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/encodedTokenAttributes", "./ast", "./length", "./smallImmutableSet"], function (require, exports, errors_1, encodedTokenAttributes_1, ast_1, length_1, smallImmutableSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$au = exports.$_t = exports.$$t = exports.TokenKind = void 0;
    var TokenKind;
    (function (TokenKind) {
        TokenKind[TokenKind["Text"] = 0] = "Text";
        TokenKind[TokenKind["OpeningBracket"] = 1] = "OpeningBracket";
        TokenKind[TokenKind["ClosingBracket"] = 2] = "ClosingBracket";
    })(TokenKind || (exports.TokenKind = TokenKind = {}));
    class $$t {
        constructor(length, kind, 
        /**
         * If this token is an opening bracket, this is the id of the opening bracket.
         * If this token is a closing bracket, this is the id of the first opening bracket that is closed by this bracket.
         * Otherwise, it is -1.
         */
        bracketId, 
        /**
         * If this token is an opening bracket, this just contains `bracketId`.
         * If this token is a closing bracket, this lists all opening bracket ids, that it closes.
         * Otherwise, it is empty.
         */
        bracketIds, astNode) {
            this.length = length;
            this.kind = kind;
            this.bracketId = bracketId;
            this.bracketIds = bracketIds;
            this.astNode = astNode;
        }
    }
    exports.$$t = $$t;
    class $_t {
        constructor(d, e) {
            this.d = d;
            this.e = e;
            this.c = new NonPeekableTextBufferTokenizer(this.d, this.e);
            this.f = length_1.$pt;
            this.g = false;
            this.h = null;
            this.a = d.getLineCount();
            this.b = d.getLineLength(this.a);
        }
        get offset() {
            return this.f;
        }
        get length() {
            return (0, length_1.$rt)(this.a - 1, this.b);
        }
        getText() {
            return this.d.getValue();
        }
        skip(length) {
            this.g = false;
            this.f = (0, length_1.$vt)(this.f, length);
            const obj = (0, length_1.$st)(this.f);
            this.c.setPosition(obj.lineCount, obj.columnCount);
        }
        read() {
            let token;
            if (this.h) {
                this.g = false;
                token = this.h;
            }
            else {
                token = this.c.read();
            }
            if (token) {
                this.f = (0, length_1.$vt)(this.f, token.length);
            }
            return token;
        }
        peek() {
            if (!this.g) {
                this.h = this.c.read();
                this.g = true;
            }
            return this.h;
        }
    }
    exports.$_t = $_t;
    /**
     * Does not support peek.
    */
    class NonPeekableTextBufferTokenizer {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.e = 0;
            this.f = null;
            this.g = 0;
            this.h = null;
            this.j = 0;
            /** Must be a zero line token. The end of the document cannot be peeked. */
            this.k = null;
            this.a = c.getLineCount();
            this.b = c.getLineLength(this.a);
        }
        setPosition(lineIdx, column) {
            // We must not jump into a token!
            if (lineIdx === this.e) {
                this.g = column;
                if (this.f !== null) {
                    this.j = this.g === 0 ? 0 : this.h.findTokenIndexAtOffset(this.g);
                }
            }
            else {
                this.e = lineIdx;
                this.g = column;
                this.f = null;
            }
            this.k = null;
        }
        read() {
            if (this.k) {
                const token = this.k;
                this.k = null;
                this.g += (0, length_1.$ut)(token.length);
                return token;
            }
            if (this.e > this.a - 1 || (this.e === this.a - 1 && this.g >= this.b)) {
                // We are after the end
                return null;
            }
            if (this.f === null) {
                this.h = this.c.tokenization.getLineTokens(this.e + 1);
                this.f = this.h.getLineContent();
                this.j = this.g === 0 ? 0 : this.h.findTokenIndexAtOffset(this.g);
            }
            const startLineIdx = this.e;
            const startLineCharOffset = this.g;
            // limits the length of text tokens.
            // If text tokens get too long, incremental updates will be slow
            let lengthHeuristic = 0;
            while (true) {
                const lineTokens = this.h;
                const tokenCount = lineTokens.getCount();
                let peekedBracketToken = null;
                if (this.j < tokenCount) {
                    const tokenMetadata = lineTokens.getMetadata(this.j);
                    while (this.j + 1 < tokenCount && tokenMetadata === lineTokens.getMetadata(this.j + 1)) {
                        // Skip tokens that are identical.
                        // Sometimes, (bracket) identifiers are split up into multiple tokens.
                        this.j++;
                    }
                    const isOther = encodedTokenAttributes_1.$Us.getTokenType(tokenMetadata) === 0 /* StandardTokenType.Other */;
                    const containsBracketType = encodedTokenAttributes_1.$Us.containsBalancedBrackets(tokenMetadata);
                    const endOffset = lineTokens.getEndOffset(this.j);
                    // Is there a bracket token next? Only consume text.
                    if (containsBracketType && isOther && this.g < endOffset) {
                        const languageId = lineTokens.getLanguageId(this.j);
                        const text = this.f.substring(this.g, endOffset);
                        const brackets = this.d.getSingleLanguageBracketTokens(languageId);
                        const regexp = brackets.regExpGlobal;
                        if (regexp) {
                            regexp.lastIndex = 0;
                            const match = regexp.exec(text);
                            if (match) {
                                peekedBracketToken = brackets.getToken(match[0]);
                                if (peekedBracketToken) {
                                    // Consume leading text of the token
                                    this.g += match.index;
                                }
                            }
                        }
                    }
                    lengthHeuristic += endOffset - this.g;
                    if (peekedBracketToken) {
                        // Don't skip the entire token, as a single token could contain multiple brackets.
                        if (startLineIdx !== this.e || startLineCharOffset !== this.g) {
                            // There is text before the bracket
                            this.k = peekedBracketToken;
                            break;
                        }
                        else {
                            // Consume the peeked token
                            this.g += (0, length_1.$ut)(peekedBracketToken.length);
                            return peekedBracketToken;
                        }
                    }
                    else {
                        // Skip the entire token, as the token contains no brackets at all.
                        this.j++;
                        this.g = endOffset;
                    }
                }
                else {
                    if (this.e === this.a - 1) {
                        break;
                    }
                    this.e++;
                    this.h = this.c.tokenization.getLineTokens(this.e + 1);
                    this.j = 0;
                    this.f = this.h.getLineContent();
                    this.g = 0;
                    lengthHeuristic += 33; // max 1000/33 = 30 lines
                    // This limits the amount of work to recompute min-indentation
                    if (lengthHeuristic > 1000) {
                        // only break (automatically) at the end of line.
                        break;
                    }
                }
                if (lengthHeuristic > 1500) {
                    // Eventually break regardless of the line length so that
                    // very long lines do not cause bad performance.
                    // This effective limits max indentation to 500, as
                    // indentation is not computed across multiple text nodes.
                    break;
                }
            }
            // If a token contains some proper indentation, it also contains \n{INDENTATION+}(?!{INDENTATION}),
            // unless the line is too long.
            // Thus, the min indentation of the document is the minimum min indentation of every text node.
            const length = (0, length_1.$ot)(startLineIdx, startLineCharOffset, this.e, this.g);
            return new $$t(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.$Lt.getEmpty(), new ast_1.$du(length));
        }
    }
    class $au {
        constructor(d, brackets) {
            this.d = d;
            this.a = length_1.$pt;
            this.c = 0;
            const regExpStr = brackets.getRegExpStr();
            const regexp = regExpStr ? new RegExp(regExpStr + '|\n', 'gi') : null;
            const tokens = [];
            let match;
            let curLineCount = 0;
            let lastLineBreakOffset = 0;
            let lastTokenEndOffset = 0;
            let lastTokenEndLine = 0;
            const smallTextTokens0Line = [];
            for (let i = 0; i < 60; i++) {
                smallTextTokens0Line.push(new $$t((0, length_1.$rt)(0, i), 0 /* TokenKind.Text */, -1, smallImmutableSet_1.$Lt.getEmpty(), new ast_1.$du((0, length_1.$rt)(0, i))));
            }
            const smallTextTokens1Line = [];
            for (let i = 0; i < 60; i++) {
                smallTextTokens1Line.push(new $$t((0, length_1.$rt)(1, i), 0 /* TokenKind.Text */, -1, smallImmutableSet_1.$Lt.getEmpty(), new ast_1.$du((0, length_1.$rt)(1, i))));
            }
            if (regexp) {
                regexp.lastIndex = 0;
                // If a token contains indentation, it also contains \n{INDENTATION+}(?!{INDENTATION})
                while ((match = regexp.exec(d)) !== null) {
                    const curOffset = match.index;
                    const value = match[0];
                    if (value === '\n') {
                        curLineCount++;
                        lastLineBreakOffset = curOffset + 1;
                    }
                    else {
                        if (lastTokenEndOffset !== curOffset) {
                            let token;
                            if (lastTokenEndLine === curLineCount) {
                                const colCount = curOffset - lastTokenEndOffset;
                                if (colCount < smallTextTokens0Line.length) {
                                    token = smallTextTokens0Line[colCount];
                                }
                                else {
                                    const length = (0, length_1.$rt)(0, colCount);
                                    token = new $$t(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.$Lt.getEmpty(), new ast_1.$du(length));
                                }
                            }
                            else {
                                const lineCount = curLineCount - lastTokenEndLine;
                                const colCount = curOffset - lastLineBreakOffset;
                                if (lineCount === 1 && colCount < smallTextTokens1Line.length) {
                                    token = smallTextTokens1Line[colCount];
                                }
                                else {
                                    const length = (0, length_1.$rt)(lineCount, colCount);
                                    token = new $$t(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.$Lt.getEmpty(), new ast_1.$du(length));
                                }
                            }
                            tokens.push(token);
                        }
                        // value is matched by regexp, so the token must exist
                        tokens.push(brackets.getToken(value));
                        lastTokenEndOffset = curOffset + value.length;
                        lastTokenEndLine = curLineCount;
                    }
                }
            }
            const offset = d.length;
            if (lastTokenEndOffset !== offset) {
                const length = (lastTokenEndLine === curLineCount)
                    ? (0, length_1.$rt)(0, offset - lastTokenEndOffset)
                    : (0, length_1.$rt)(curLineCount - lastTokenEndLine, offset - lastLineBreakOffset);
                tokens.push(new $$t(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.$Lt.getEmpty(), new ast_1.$du(length)));
            }
            this.length = (0, length_1.$rt)(curLineCount, offset - lastLineBreakOffset);
            this.b = tokens;
        }
        get offset() {
            return this.a;
        }
        read() {
            return this.b[this.c++] || null;
        }
        peek() {
            return this.b[this.c] || null;
        }
        skip(length) {
            throw new errors_1.$0();
        }
        getText() {
            return this.d;
        }
    }
    exports.$au = $au;
});
//# sourceMappingURL=tokenizer.js.map