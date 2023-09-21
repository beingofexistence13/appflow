/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/tokens/lineTokens"], function (require, exports, arrays, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GC = void 0;
    /**
     * Represents sparse tokens in a text model.
     */
    class $GC {
        constructor(languageIdCodec) {
            this.c = [];
            this.d = false;
            this.e = languageIdCodec;
        }
        flush() {
            this.c = [];
            this.d = false;
        }
        isEmpty() {
            return (this.c.length === 0);
        }
        set(pieces, isComplete) {
            this.c = pieces || [];
            this.d = isComplete;
        }
        setPartial(_range, pieces) {
            // console.log(`setPartial ${_range} ${pieces.map(p => p.toString()).join(', ')}`);
            let range = _range;
            if (pieces.length > 0) {
                const _firstRange = pieces[0].getRange();
                const _lastRange = pieces[pieces.length - 1].getRange();
                if (!_firstRange || !_lastRange) {
                    return _range;
                }
                range = _range.plusRange(_firstRange).plusRange(_lastRange);
            }
            let insertPosition = null;
            for (let i = 0, len = this.c.length; i < len; i++) {
                const piece = this.c[i];
                if (piece.endLineNumber < range.startLineNumber) {
                    // this piece is before the range
                    continue;
                }
                if (piece.startLineNumber > range.endLineNumber) {
                    // this piece is after the range, so mark the spot before this piece
                    // as a good insertion position and stop looping
                    insertPosition = insertPosition || { index: i };
                    break;
                }
                // this piece might intersect with the range
                piece.removeTokens(range);
                if (piece.isEmpty()) {
                    // remove the piece if it became empty
                    this.c.splice(i, 1);
                    i--;
                    len--;
                    continue;
                }
                if (piece.endLineNumber < range.startLineNumber) {
                    // after removal, this piece is before the range
                    continue;
                }
                if (piece.startLineNumber > range.endLineNumber) {
                    // after removal, this piece is after the range
                    insertPosition = insertPosition || { index: i };
                    continue;
                }
                // after removal, this piece contains the range
                const [a, b] = piece.split(range);
                if (a.isEmpty()) {
                    // this piece is actually after the range
                    insertPosition = insertPosition || { index: i };
                    continue;
                }
                if (b.isEmpty()) {
                    // this piece is actually before the range
                    continue;
                }
                this.c.splice(i, 1, a, b);
                i++;
                len++;
                insertPosition = insertPosition || { index: i };
            }
            insertPosition = insertPosition || { index: this.c.length };
            if (pieces.length > 0) {
                this.c = arrays.$Ub(this.c, insertPosition.index, pieces);
            }
            // console.log(`I HAVE ${this._pieces.length} pieces`);
            // console.log(`${this._pieces.map(p => p.toString()).join('\n')}`);
            return range;
        }
        isComplete() {
            return this.d;
        }
        addSparseTokens(lineNumber, aTokens) {
            if (aTokens.getLineContent().length === 0) {
                // Don't do anything for empty lines
                return aTokens;
            }
            const pieces = this.c;
            if (pieces.length === 0) {
                return aTokens;
            }
            const pieceIndex = $GC.f(pieces, lineNumber);
            const bTokens = pieces[pieceIndex].getLineTokens(lineNumber);
            if (!bTokens) {
                return aTokens;
            }
            const aLen = aTokens.getCount();
            const bLen = bTokens.getCount();
            let aIndex = 0;
            const result = [];
            let resultLen = 0;
            let lastEndOffset = 0;
            const emitToken = (endOffset, metadata) => {
                if (endOffset === lastEndOffset) {
                    return;
                }
                lastEndOffset = endOffset;
                result[resultLen++] = endOffset;
                result[resultLen++] = metadata;
            };
            for (let bIndex = 0; bIndex < bLen; bIndex++) {
                const bStartCharacter = bTokens.getStartCharacter(bIndex);
                const bEndCharacter = bTokens.getEndCharacter(bIndex);
                const bMetadata = bTokens.getMetadata(bIndex);
                const bMask = (((bMetadata & 1 /* MetadataConsts.SEMANTIC_USE_ITALIC */) ? 2048 /* MetadataConsts.ITALIC_MASK */ : 0)
                    | ((bMetadata & 2 /* MetadataConsts.SEMANTIC_USE_BOLD */) ? 4096 /* MetadataConsts.BOLD_MASK */ : 0)
                    | ((bMetadata & 4 /* MetadataConsts.SEMANTIC_USE_UNDERLINE */) ? 8192 /* MetadataConsts.UNDERLINE_MASK */ : 0)
                    | ((bMetadata & 8 /* MetadataConsts.SEMANTIC_USE_STRIKETHROUGH */) ? 16384 /* MetadataConsts.STRIKETHROUGH_MASK */ : 0)
                    | ((bMetadata & 16 /* MetadataConsts.SEMANTIC_USE_FOREGROUND */) ? 16744448 /* MetadataConsts.FOREGROUND_MASK */ : 0)
                    | ((bMetadata & 32 /* MetadataConsts.SEMANTIC_USE_BACKGROUND */) ? 4278190080 /* MetadataConsts.BACKGROUND_MASK */ : 0)) >>> 0;
                const aMask = (~bMask) >>> 0;
                // push any token from `a` that is before `b`
                while (aIndex < aLen && aTokens.getEndOffset(aIndex) <= bStartCharacter) {
                    emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
                    aIndex++;
                }
                // push the token from `a` if it intersects the token from `b`
                if (aIndex < aLen && aTokens.getStartOffset(aIndex) < bStartCharacter) {
                    emitToken(bStartCharacter, aTokens.getMetadata(aIndex));
                }
                // skip any tokens from `a` that are contained inside `b`
                while (aIndex < aLen && aTokens.getEndOffset(aIndex) < bEndCharacter) {
                    emitToken(aTokens.getEndOffset(aIndex), (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                    aIndex++;
                }
                if (aIndex < aLen) {
                    emitToken(bEndCharacter, (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                    if (aTokens.getEndOffset(aIndex) === bEndCharacter) {
                        // `a` ends exactly at the same spot as `b`!
                        aIndex++;
                    }
                }
                else {
                    const aMergeIndex = Math.min(Math.max(0, aIndex - 1), aLen - 1);
                    // push the token from `b`
                    emitToken(bEndCharacter, (aTokens.getMetadata(aMergeIndex) & aMask) | (bMetadata & bMask));
                }
            }
            // push the remaining tokens from `a`
            while (aIndex < aLen) {
                emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
                aIndex++;
            }
            return new lineTokens_1.$Xs(new Uint32Array(result), aTokens.getLineContent(), this.e);
        }
        static f(pieces, lineNumber) {
            let low = 0;
            let high = pieces.length - 1;
            while (low < high) {
                let mid = low + Math.floor((high - low) / 2);
                if (pieces[mid].endLineNumber < lineNumber) {
                    low = mid + 1;
                }
                else if (pieces[mid].startLineNumber > lineNumber) {
                    high = mid - 1;
                }
                else {
                    while (mid > low && pieces[mid - 1].startLineNumber <= lineNumber && lineNumber <= pieces[mid - 1].endLineNumber) {
                        mid--;
                    }
                    return mid;
                }
            }
            return low;
        }
        acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            for (const piece of this.c) {
                piece.acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode);
            }
        }
    }
    exports.$GC = $GC;
});
//# sourceMappingURL=sparseTokensStore.js.map