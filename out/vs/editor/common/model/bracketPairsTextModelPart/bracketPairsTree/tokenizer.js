/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/encodedTokenAttributes", "./ast", "./length", "./smallImmutableSet"], function (require, exports, errors_1, encodedTokenAttributes_1, ast_1, length_1, smallImmutableSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FastTokenizer = exports.TextBufferTokenizer = exports.Token = exports.TokenKind = void 0;
    var TokenKind;
    (function (TokenKind) {
        TokenKind[TokenKind["Text"] = 0] = "Text";
        TokenKind[TokenKind["OpeningBracket"] = 1] = "OpeningBracket";
        TokenKind[TokenKind["ClosingBracket"] = 2] = "ClosingBracket";
    })(TokenKind || (exports.TokenKind = TokenKind = {}));
    class Token {
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
    exports.Token = Token;
    class TextBufferTokenizer {
        constructor(textModel, bracketTokens) {
            this.textModel = textModel;
            this.bracketTokens = bracketTokens;
            this.reader = new NonPeekableTextBufferTokenizer(this.textModel, this.bracketTokens);
            this._offset = length_1.lengthZero;
            this.didPeek = false;
            this.peeked = null;
            this.textBufferLineCount = textModel.getLineCount();
            this.textBufferLastLineLength = textModel.getLineLength(this.textBufferLineCount);
        }
        get offset() {
            return this._offset;
        }
        get length() {
            return (0, length_1.toLength)(this.textBufferLineCount - 1, this.textBufferLastLineLength);
        }
        getText() {
            return this.textModel.getValue();
        }
        skip(length) {
            this.didPeek = false;
            this._offset = (0, length_1.lengthAdd)(this._offset, length);
            const obj = (0, length_1.lengthToObj)(this._offset);
            this.reader.setPosition(obj.lineCount, obj.columnCount);
        }
        read() {
            let token;
            if (this.peeked) {
                this.didPeek = false;
                token = this.peeked;
            }
            else {
                token = this.reader.read();
            }
            if (token) {
                this._offset = (0, length_1.lengthAdd)(this._offset, token.length);
            }
            return token;
        }
        peek() {
            if (!this.didPeek) {
                this.peeked = this.reader.read();
                this.didPeek = true;
            }
            return this.peeked;
        }
    }
    exports.TextBufferTokenizer = TextBufferTokenizer;
    /**
     * Does not support peek.
    */
    class NonPeekableTextBufferTokenizer {
        constructor(textModel, bracketTokens) {
            this.textModel = textModel;
            this.bracketTokens = bracketTokens;
            this.lineIdx = 0;
            this.line = null;
            this.lineCharOffset = 0;
            this.lineTokens = null;
            this.lineTokenOffset = 0;
            /** Must be a zero line token. The end of the document cannot be peeked. */
            this.peekedToken = null;
            this.textBufferLineCount = textModel.getLineCount();
            this.textBufferLastLineLength = textModel.getLineLength(this.textBufferLineCount);
        }
        setPosition(lineIdx, column) {
            // We must not jump into a token!
            if (lineIdx === this.lineIdx) {
                this.lineCharOffset = column;
                if (this.line !== null) {
                    this.lineTokenOffset = this.lineCharOffset === 0 ? 0 : this.lineTokens.findTokenIndexAtOffset(this.lineCharOffset);
                }
            }
            else {
                this.lineIdx = lineIdx;
                this.lineCharOffset = column;
                this.line = null;
            }
            this.peekedToken = null;
        }
        read() {
            if (this.peekedToken) {
                const token = this.peekedToken;
                this.peekedToken = null;
                this.lineCharOffset += (0, length_1.lengthGetColumnCountIfZeroLineCount)(token.length);
                return token;
            }
            if (this.lineIdx > this.textBufferLineCount - 1 || (this.lineIdx === this.textBufferLineCount - 1 && this.lineCharOffset >= this.textBufferLastLineLength)) {
                // We are after the end
                return null;
            }
            if (this.line === null) {
                this.lineTokens = this.textModel.tokenization.getLineTokens(this.lineIdx + 1);
                this.line = this.lineTokens.getLineContent();
                this.lineTokenOffset = this.lineCharOffset === 0 ? 0 : this.lineTokens.findTokenIndexAtOffset(this.lineCharOffset);
            }
            const startLineIdx = this.lineIdx;
            const startLineCharOffset = this.lineCharOffset;
            // limits the length of text tokens.
            // If text tokens get too long, incremental updates will be slow
            let lengthHeuristic = 0;
            while (true) {
                const lineTokens = this.lineTokens;
                const tokenCount = lineTokens.getCount();
                let peekedBracketToken = null;
                if (this.lineTokenOffset < tokenCount) {
                    const tokenMetadata = lineTokens.getMetadata(this.lineTokenOffset);
                    while (this.lineTokenOffset + 1 < tokenCount && tokenMetadata === lineTokens.getMetadata(this.lineTokenOffset + 1)) {
                        // Skip tokens that are identical.
                        // Sometimes, (bracket) identifiers are split up into multiple tokens.
                        this.lineTokenOffset++;
                    }
                    const isOther = encodedTokenAttributes_1.TokenMetadata.getTokenType(tokenMetadata) === 0 /* StandardTokenType.Other */;
                    const containsBracketType = encodedTokenAttributes_1.TokenMetadata.containsBalancedBrackets(tokenMetadata);
                    const endOffset = lineTokens.getEndOffset(this.lineTokenOffset);
                    // Is there a bracket token next? Only consume text.
                    if (containsBracketType && isOther && this.lineCharOffset < endOffset) {
                        const languageId = lineTokens.getLanguageId(this.lineTokenOffset);
                        const text = this.line.substring(this.lineCharOffset, endOffset);
                        const brackets = this.bracketTokens.getSingleLanguageBracketTokens(languageId);
                        const regexp = brackets.regExpGlobal;
                        if (regexp) {
                            regexp.lastIndex = 0;
                            const match = regexp.exec(text);
                            if (match) {
                                peekedBracketToken = brackets.getToken(match[0]);
                                if (peekedBracketToken) {
                                    // Consume leading text of the token
                                    this.lineCharOffset += match.index;
                                }
                            }
                        }
                    }
                    lengthHeuristic += endOffset - this.lineCharOffset;
                    if (peekedBracketToken) {
                        // Don't skip the entire token, as a single token could contain multiple brackets.
                        if (startLineIdx !== this.lineIdx || startLineCharOffset !== this.lineCharOffset) {
                            // There is text before the bracket
                            this.peekedToken = peekedBracketToken;
                            break;
                        }
                        else {
                            // Consume the peeked token
                            this.lineCharOffset += (0, length_1.lengthGetColumnCountIfZeroLineCount)(peekedBracketToken.length);
                            return peekedBracketToken;
                        }
                    }
                    else {
                        // Skip the entire token, as the token contains no brackets at all.
                        this.lineTokenOffset++;
                        this.lineCharOffset = endOffset;
                    }
                }
                else {
                    if (this.lineIdx === this.textBufferLineCount - 1) {
                        break;
                    }
                    this.lineIdx++;
                    this.lineTokens = this.textModel.tokenization.getLineTokens(this.lineIdx + 1);
                    this.lineTokenOffset = 0;
                    this.line = this.lineTokens.getLineContent();
                    this.lineCharOffset = 0;
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
            const length = (0, length_1.lengthDiff)(startLineIdx, startLineCharOffset, this.lineIdx, this.lineCharOffset);
            return new Token(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.SmallImmutableSet.getEmpty(), new ast_1.TextAstNode(length));
        }
    }
    class FastTokenizer {
        constructor(text, brackets) {
            this.text = text;
            this._offset = length_1.lengthZero;
            this.idx = 0;
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
                smallTextTokens0Line.push(new Token((0, length_1.toLength)(0, i), 0 /* TokenKind.Text */, -1, smallImmutableSet_1.SmallImmutableSet.getEmpty(), new ast_1.TextAstNode((0, length_1.toLength)(0, i))));
            }
            const smallTextTokens1Line = [];
            for (let i = 0; i < 60; i++) {
                smallTextTokens1Line.push(new Token((0, length_1.toLength)(1, i), 0 /* TokenKind.Text */, -1, smallImmutableSet_1.SmallImmutableSet.getEmpty(), new ast_1.TextAstNode((0, length_1.toLength)(1, i))));
            }
            if (regexp) {
                regexp.lastIndex = 0;
                // If a token contains indentation, it also contains \n{INDENTATION+}(?!{INDENTATION})
                while ((match = regexp.exec(text)) !== null) {
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
                                    const length = (0, length_1.toLength)(0, colCount);
                                    token = new Token(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.SmallImmutableSet.getEmpty(), new ast_1.TextAstNode(length));
                                }
                            }
                            else {
                                const lineCount = curLineCount - lastTokenEndLine;
                                const colCount = curOffset - lastLineBreakOffset;
                                if (lineCount === 1 && colCount < smallTextTokens1Line.length) {
                                    token = smallTextTokens1Line[colCount];
                                }
                                else {
                                    const length = (0, length_1.toLength)(lineCount, colCount);
                                    token = new Token(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.SmallImmutableSet.getEmpty(), new ast_1.TextAstNode(length));
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
            const offset = text.length;
            if (lastTokenEndOffset !== offset) {
                const length = (lastTokenEndLine === curLineCount)
                    ? (0, length_1.toLength)(0, offset - lastTokenEndOffset)
                    : (0, length_1.toLength)(curLineCount - lastTokenEndLine, offset - lastLineBreakOffset);
                tokens.push(new Token(length, 0 /* TokenKind.Text */, -1, smallImmutableSet_1.SmallImmutableSet.getEmpty(), new ast_1.TextAstNode(length)));
            }
            this.length = (0, length_1.toLength)(curLineCount, offset - lastLineBreakOffset);
            this.tokens = tokens;
        }
        get offset() {
            return this._offset;
        }
        read() {
            return this.tokens[this.idx++] || null;
        }
        peek() {
            return this.tokens[this.idx] || null;
        }
        skip(length) {
            throw new errors_1.NotSupportedError();
        }
        getText() {
            return this.text;
        }
    }
    exports.FastTokenizer = FastTokenizer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9icmFja2V0UGFpcnNUZXh0TW9kZWxQYXJ0L2JyYWNrZXRQYWlyc1RyZWUvdG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsSUFBa0IsU0FJakI7SUFKRCxXQUFrQixTQUFTO1FBQzFCLHlDQUFRLENBQUE7UUFDUiw2REFBa0IsQ0FBQTtRQUNsQiw2REFBa0IsQ0FBQTtJQUNuQixDQUFDLEVBSmlCLFNBQVMseUJBQVQsU0FBUyxRQUkxQjtJQUlELE1BQWEsS0FBSztRQUNqQixZQUNVLE1BQWMsRUFDZCxJQUFlO1FBQ3hCOzs7O1dBSUc7UUFDTSxTQUEyQjtRQUNwQzs7OztXQUlHO1FBQ00sVUFBK0MsRUFDL0MsT0FBaUQ7WUFkakQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLFNBQUksR0FBSixJQUFJLENBQVc7WUFNZixjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQU0zQixlQUFVLEdBQVYsVUFBVSxDQUFxQztZQUMvQyxZQUFPLEdBQVAsT0FBTyxDQUEwQztRQUN2RCxDQUFDO0tBQ0w7SUFsQkQsc0JBa0JDO0lBWUQsTUFBYSxtQkFBbUI7UUFNL0IsWUFDa0IsU0FBMkIsRUFDM0IsYUFBNEM7WUFENUMsY0FBUyxHQUFULFNBQVMsQ0FBa0I7WUFDM0Isa0JBQWEsR0FBYixhQUFhLENBQStCO1lBSjdDLFdBQU0sR0FBRyxJQUFJLDhCQUE4QixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBVXpGLFlBQU8sR0FBVyxtQkFBVSxDQUFDO1lBcUI3QixZQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2hCLFdBQU0sR0FBaUIsSUFBSSxDQUFDO1lBMUJuQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxD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