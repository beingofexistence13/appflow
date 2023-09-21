/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/encodedTokenAttributes"], function (require, exports, encodedTokenAttributes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xs = void 0;
    class $Xs {
        static { this.defaultTokenMetadata = ((0 /* FontStyle.None */ << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
            | (1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
            | (2 /* ColorId.DefaultBackground */ << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0; }
        static createEmpty(lineContent, decoder) {
            const defaultMetadata = $Xs.defaultTokenMetadata;
            const tokens = new Uint32Array(2);
            tokens[0] = lineContent.length;
            tokens[1] = defaultMetadata;
            return new $Xs(tokens, lineContent, decoder);
        }
        constructor(tokens, text, decoder) {
            this._lineTokensBrand = undefined;
            this.a = tokens;
            this.b = (this.a.length >>> 1);
            this.c = text;
            this.d = decoder;
        }
        equals(other) {
            if (other instanceof $Xs) {
                return this.slicedEquals(other, 0, this.b);
            }
            return false;
        }
        slicedEquals(other, sliceFromTokenIndex, sliceTokenCount) {
            if (this.c !== other.c) {
                return false;
            }
            if (this.b !== other.b) {
                return false;
            }
            const from = (sliceFromTokenIndex << 1);
            const to = from + (sliceTokenCount << 1);
            for (let i = from; i < to; i++) {
                if (this.a[i] !== other.a[i]) {
                    return false;
                }
            }
            return true;
        }
        getLineContent() {
            return this.c;
        }
        getCount() {
            return this.b;
        }
        getStartOffset(tokenIndex) {
            if (tokenIndex > 0) {
                return this.a[(tokenIndex - 1) << 1];
            }
            return 0;
        }
        getMetadata(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return metadata;
        }
        getLanguageId(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            const languageId = encodedTokenAttributes_1.$Us.getLanguageId(metadata);
            return this.d.decodeLanguageId(languageId);
        }
        getStandardTokenType(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.$Us.getTokenType(metadata);
        }
        getForeground(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.$Us.getForeground(metadata);
        }
        getClassName(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.$Us.getClassNameFromMetadata(metadata);
        }
        getInlineStyle(tokenIndex, colorMap) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.$Us.getInlineStyleFromMetadata(metadata, colorMap);
        }
        getPresentation(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.$Us.getPresentationFromMetadata(metadata);
        }
        getEndOffset(tokenIndex) {
            return this.a[tokenIndex << 1];
        }
        /**
         * Find the token containing offset `offset`.
         * @param offset The search offset
         * @return The index of the token containing the offset.
         */
        findTokenIndexAtOffset(offset) {
            return $Xs.findIndexInTokensArray(this.a, offset);
        }
        inflate() {
            return this;
        }
        sliceAndInflate(startOffset, endOffset, deltaOffset) {
            return new SliceLineTokens(this, startOffset, endOffset, deltaOffset);
        }
        static convertToEndOffset(tokens, lineTextLength) {
            const tokenCount = (tokens.length >>> 1);
            const lastTokenIndex = tokenCount - 1;
            for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
                tokens[tokenIndex << 1] = tokens[(tokenIndex + 1) << 1];
            }
            tokens[lastTokenIndex << 1] = lineTextLength;
        }
        static findIndexInTokensArray(tokens, desiredIndex) {
            if (tokens.length <= 2) {
                return 0;
            }
            let low = 0;
            let high = (tokens.length >>> 1) - 1;
            while (low < high) {
                const mid = low + Math.floor((high - low) / 2);
                const endOffset = tokens[(mid << 1)];
                if (endOffset === desiredIndex) {
                    return mid + 1;
                }
                else if (endOffset < desiredIndex) {
                    low = mid + 1;
                }
                else if (endOffset > desiredIndex) {
                    high = mid;
                }
            }
            return low;
        }
        /**
         * @pure
         * @param insertTokens Must be sorted by offset.
        */
        withInserted(insertTokens) {
            if (insertTokens.length === 0) {
                return this;
            }
            let nextOriginalTokenIdx = 0;
            let nextInsertTokenIdx = 0;
            let text = '';
            const newTokens = new Array();
            let originalEndOffset = 0;
            while (true) {
                const nextOriginalTokenEndOffset = nextOriginalTokenIdx < this.b ? this.a[nextOriginalTokenIdx << 1] : -1;
                const nextInsertToken = nextInsertTokenIdx < insertTokens.length ? insertTokens[nextInsertTokenIdx] : null;
                if (nextOriginalTokenEndOffset !== -1 && (nextInsertToken === null || nextOriginalTokenEndOffset <= nextInsertToken.offset)) {
                    // original token ends before next insert token
                    text += this.c.substring(originalEndOffset, nextOriginalTokenEndOffset);
                    const metadata = this.a[(nextOriginalTokenIdx << 1) + 1];
                    newTokens.push(text.length, metadata);
                    nextOriginalTokenIdx++;
                    originalEndOffset = nextOriginalTokenEndOffset;
                }
                else if (nextInsertToken) {
                    if (nextInsertToken.offset > originalEndOffset) {
                        // insert token is in the middle of the next token.
                        text += this.c.substring(originalEndOffset, nextInsertToken.offset);
                        const metadata = this.a[(nextOriginalTokenIdx << 1) + 1];
                        newTokens.push(text.length, metadata);
                        originalEndOffset = nextInsertToken.offset;
                    }
                    text += nextInsertToken.text;
                    newTokens.push(text.length, nextInsertToken.tokenMetadata);
                    nextInsertTokenIdx++;
                }
                else {
                    break;
                }
            }
            return new $Xs(new Uint32Array(newTokens), text, this.d);
        }
    }
    exports.$Xs = $Xs;
    class SliceLineTokens {
        constructor(source, startOffset, endOffset, deltaOffset) {
            this.a = source;
            this.b = startOffset;
            this.c = endOffset;
            this.d = deltaOffset;
            this.e = source.findTokenIndexAtOffset(startOffset);
            this.f = 0;
            for (let i = this.e, len = source.getCount(); i < len; i++) {
                const tokenStartOffset = source.getStartOffset(i);
                if (tokenStartOffset >= endOffset) {
                    break;
                }
                this.f++;
            }
        }
        getMetadata(tokenIndex) {
            return this.a.getMetadata(this.e + tokenIndex);
        }
        getLanguageId(tokenIndex) {
            return this.a.getLanguageId(this.e + tokenIndex);
        }
        getLineContent() {
            return this.a.getLineContent().substring(this.b, this.c);
        }
        equals(other) {
            if (other instanceof SliceLineTokens) {
                return (this.b === other.b
                    && this.c === other.c
                    && this.d === other.d
                    && this.a.slicedEquals(other.a, this.e, this.f));
            }
            return false;
        }
        getCount() {
            return this.f;
        }
        getForeground(tokenIndex) {
            return this.a.getForeground(this.e + tokenIndex);
        }
        getEndOffset(tokenIndex) {
            const tokenEndOffset = this.a.getEndOffset(this.e + tokenIndex);
            return Math.min(this.c, tokenEndOffset) - this.b + this.d;
        }
        getClassName(tokenIndex) {
            return this.a.getClassName(this.e + tokenIndex);
        }
        getInlineStyle(tokenIndex, colorMap) {
            return this.a.getInlineStyle(this.e + tokenIndex, colorMap);
        }
        getPresentation(tokenIndex) {
            return this.a.getPresentation(this.e + tokenIndex);
        }
        findTokenIndexAtOffset(offset) {
            return this.a.findTokenIndexAtOffset(offset + this.b - this.d) - this.e;
        }
    }
});
//# sourceMappingURL=lineTokens.js.map