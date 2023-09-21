/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/tokens/lineTokens"], function (require, exports, arrays, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SparseTokensStore = void 0;
    /**
     * Represents sparse tokens in a text model.
     */
    class SparseTokensStore {
        constructor(languageIdCodec) {
            this._pieces = [];
            this._isComplete = false;
            this._languageIdCodec = languageIdCodec;
        }
        flush() {
            this._pieces = [];
            this._isComplete = false;
        }
        isEmpty() {
            return (this._pieces.length === 0);
        }
        set(pieces, isComplete) {
            this._pieces = pieces || [];
            this._isComplete = isComplete;
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
            for (let i = 0, len = this._pieces.length; i < len; i++) {
                const piece = this._pieces[i];
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
                    this._pieces.splice(i, 1);
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
                this._pieces.splice(i, 1, a, b);
                i++;
                len++;
                insertPosition = insertPosition || { index: i };
            }
            insertPosition = insertPosition || { index: this._pieces.length };
            if (pieces.length > 0) {
                this._pieces = arrays.arrayInsert(this._pieces, insertPosition.index, pieces);
            }
            // console.log(`I HAVE ${this._pieces.length} pieces`);
            // console.log(`${this._pieces.map(p => p.toString()).join('\n')}`);
            return range;
        }
        isComplete() {
            return this._isComplete;
        }
        addSparseTokens(lineNumber, aTokens) {
            if (aTokens.getLineContent().length === 0) {
                // Don't do anything for empty lines
                return aTokens;
            }
            const pieces = this._pieces;
            if (pieces.length === 0) {
                return aTokens;
            }
            const pieceIndex = SparseTokensStore._findFirstPieceWithLine(pieces, lineNumber);
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
            return new lineTokens_1.LineTokens(new Uint32Array(result), aTokens.getLineContent(), this._languageIdCodec);
        }
        static _findFirstPieceWithLine(pieces, lineNumber) {
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
            for (const piece of this._pieces) {
                piece.acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode);
            }
        }
    }
    exports.SparseTokensStore = SparseTokensStore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcnNlVG9rZW5zU3RvcmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3Rva2Vucy9zcGFyc2VUb2tlbnNTdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEc7O09BRUc7SUFDSCxNQUFhLGlCQUFpQjtRQU03QixZQUFZLGVBQWlDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDekMsQ0FBQztRQUVNLEtBQUs7WUFDWCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBRU0sT0FBTztZQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRU0sR0FBRyxDQUFDLE1BQXNDLEVBQUUsVUFBbUI7WUFDckUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQy9CLENBQUM7UUFFTSxVQUFVLENBQUMsTUFBYSxFQUFFLE1BQStCO1lBQy9ELG1GQUFtRjtZQUVuRixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDbkIsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN6QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxR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