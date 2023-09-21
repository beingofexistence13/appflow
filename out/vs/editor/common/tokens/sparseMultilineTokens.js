/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/eolCounter"], function (require, exports, position_1, range_1, eolCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SparseLineTokens = exports.SparseMultilineTokens = void 0;
    /**
     * Represents sparse tokens over a contiguous range of lines.
     */
    class SparseMultilineTokens {
        static create(startLineNumber, tokens) {
            return new SparseMultilineTokens(startLineNumber, new SparseMultilineTokensStorage(tokens));
        }
        /**
         * (Inclusive) start line number for these tokens.
         */
        get startLineNumber() {
            return this._startLineNumber;
        }
        /**
         * (Inclusive) end line number for these tokens.
         */
        get endLineNumber() {
            return this._endLineNumber;
        }
        constructor(startLineNumber, tokens) {
            this._startLineNumber = startLineNumber;
            this._tokens = tokens;
            this._endLineNumber = this._startLineNumber + this._tokens.getMaxDeltaLine();
        }
        toString() {
            return this._tokens.toString(this._startLineNumber);
        }
        _updateEndLineNumber() {
            this._endLineNumber = this._startLineNumber + this._tokens.getMaxDeltaLine();
        }
        isEmpty() {
            return this._tokens.isEmpty();
        }
        getLineTokens(lineNumber) {
            if (this._startLineNumber <= lineNumber && lineNumber <= this._endLineNumber) {
                return this._tokens.getLineTokens(lineNumber - this._startLineNumber);
            }
            return null;
        }
        getRange() {
            const deltaRange = this._tokens.getRange();
            if (!deltaRange) {
                return deltaRange;
            }
            return new range_1.Range(this._startLineNumber + deltaRange.startLineNumber, deltaRange.startColumn, this._startLineNumber + deltaRange.endLineNumber, deltaRange.endColumn);
        }
        removeTokens(range) {
            const startLineIndex = range.startLineNumber - this._startLineNumber;
            const endLineIndex = range.endLineNumber - this._startLineNumber;
            this._startLineNumber += this._tokens.removeTokens(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
            this._updateEndLineNumber();
        }
        split(range) {
            // split tokens to two:
            // a) all the tokens before `range`
            // b) all the tokens after `range`
            const startLineIndex = range.startLineNumber - this._startLineNumber;
            const endLineIndex = range.endLineNumber - this._startLineNumber;
            const [a, b, bDeltaLine] = this._tokens.split(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
            return [new SparseMultilineTokens(this._startLineNumber, a), new SparseMultilineTokens(this._startLineNumber + bDeltaLine, b)];
        }
        applyEdit(range, text) {
            const [eolCount, firstLineLength, lastLineLength] = (0, eolCounter_1.countEOL)(text);
            this.acceptEdit(range, eolCount, firstLineLength, lastLineLength, text.length > 0 ? text.charCodeAt(0) : 0 /* CharCode.Null */);
        }
        acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            this._acceptDeleteRange(range);
            this._acceptInsertText(new position_1.Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength, lastLineLength, firstCharCode);
            this._updateEndLineNumber();
        }
        _acceptDeleteRange(range) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            const firstLineIndex = range.startLineNumber - this._startLineNumber;
            const lastLineIndex = range.endLineNumber - this._startLineNumber;
            if (lastLineIndex < 0) {
                // this deletion occurs entirely before this block, so we only need to adjust line numbers
                const deletedLinesCount = lastLineIndex - firstLineIndex;
                this._startLineNumber -= deletedLinesCount;
                return;
            }
            const tokenMaxDeltaLine = this._tokens.getMaxDeltaLine();
            if (firstLineIndex >= tokenMaxDeltaLine + 1) {
                // this deletion occurs entirely after this block, so there is nothing to do
                return;
            }
            if (firstLineIndex < 0 && lastLineIndex >= tokenMaxDeltaLine + 1) {
                // this deletion completely encompasses this block
                this._startLineNumber = 0;
                this._tokens.clear();
                return;
            }
            if (firstLineIndex < 0) {
                const deletedBefore = -firstLineIndex;
                this._startLineNumber -= deletedBefore;
                this._tokens.acceptDeleteRange(range.startColumn - 1, 0, 0, lastLineIndex, range.endColumn - 1);
            }
            else {
                this._tokens.acceptDeleteRange(0, firstLineIndex, range.startColumn - 1, lastLineIndex, range.endColumn - 1);
            }
        }
        _acceptInsertText(position, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - this._startLineNumber;
            if (lineIndex < 0) {
                // this insertion occurs before this block, so we only need to adjust line numbers
                this._startLineNumber += eolCount;
                return;
            }
            const tokenMaxDeltaLine = this._tokens.getMaxDeltaLine();
            if (lineIndex >= tokenMaxDeltaLine + 1) {
                // this insertion occurs after this block, so there is nothing to do
                return;
            }
            this._tokens.acceptInsertText(lineIndex, position.column - 1, eolCount, firstLineLength, lastLineLength, firstCharCode);
        }
    }
    exports.SparseMultilineTokens = SparseMultilineTokens;
    class SparseMultilineTokensStorage {
        constructor(tokens) {
            this._tokens = tokens;
            this._tokenCount = tokens.length / 4;
        }
        toString(startLineNumber) {
            const pieces = [];
            for (let i = 0; i < this._tokenCount; i++) {
                pieces.push(`(${this._getDeltaLine(i) + startLineNumber},${this._getStartCharacter(i)}-${this._getEndCharacter(i)})`);
            }
            return `[${pieces.join(',')}]`;
        }
        getMaxDeltaLine() {
            const tokenCount = this._getTokenCount();
            if (tokenCount === 0) {
                return -1;
            }
            return this._getDeltaLine(tokenCount - 1);
        }
        getRange() {
            const tokenCount = this._getTokenCount();
            if (tokenCount === 0) {
                return null;
            }
            const startChar = this._getStartCharacter(0);
            const maxDeltaLine = this._getDeltaLine(tokenCount - 1);
            const endChar = this._getEndCharacter(tokenCount - 1);
            return new range_1.Range(0, startChar + 1, maxDeltaLine, endChar + 1);
        }
        _getTokenCount() {
            return this._tokenCount;
        }
        _getDeltaLine(tokenIndex) {
            return this._tokens[4 * tokenIndex];
        }
        _getStartCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 1];
        }
        _getEndCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 2];
        }
        isEmpty() {
            return (this._getTokenCount() === 0);
        }
        getLineTokens(deltaLine) {
            let low = 0;
            let high = this._getTokenCount() - 1;
            while (low < high) {
                const mid = low + Math.floor((high - low) / 2);
                const midDeltaLine = this._getDeltaLine(mid);
                if (midDeltaLine < deltaLine) {
                    low = mid + 1;
                }
                else if (midDeltaLine > deltaLine) {
                    high = mid - 1;
                }
                else {
                    let min = mid;
                    while (min > low && this._getDeltaLine(min - 1) === deltaLine) {
                        min--;
                    }
                    let max = mid;
                    while (max < high && this._getDeltaLine(max + 1) === deltaLine) {
                        max++;
                    }
                    return new SparseLineTokens(this._tokens.subarray(4 * min, 4 * max + 4));
                }
            }
            if (this._getDeltaLine(low) === deltaLine) {
                return new SparseLineTokens(this._tokens.subarray(4 * low, 4 * low + 4));
            }
            return null;
        }
        clear() {
            this._tokenCount = 0;
        }
        removeTokens(startDeltaLine, startChar, endDeltaLine, endChar) {
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            let newTokenCount = 0;
            let hasDeletedTokens = false;
            let firstDeltaLine = 0;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 4 * i;
                const tokenDeltaLine = tokens[srcOffset];
                const tokenStartCharacter = tokens[srcOffset + 1];
                const tokenEndCharacter = tokens[srcOffset + 2];
                const tokenMetadata = tokens[srcOffset + 3];
                if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))
                    && (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
                    hasDeletedTokens = true;
                }
                else {
                    if (newTokenCount === 0) {
                        firstDeltaLine = tokenDeltaLine;
                    }
                    if (hasDeletedTokens) {
                        // must move the token to the left
                        const destOffset = 4 * newTokenCount;
                        tokens[destOffset] = tokenDeltaLine - firstDeltaLine;
                        tokens[destOffset + 1] = tokenStartCharacter;
                        tokens[destOffset + 2] = tokenEndCharacter;
                        tokens[destOffset + 3] = tokenMetadata;
                    }
                    newTokenCount++;
                }
            }
            this._tokenCount = newTokenCount;
            return firstDeltaLine;
        }
        split(startDeltaLine, startChar, endDeltaLine, endChar) {
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            const aTokens = [];
            const bTokens = [];
            let destTokens = aTokens;
            let destOffset = 0;
            let destFirstDeltaLine = 0;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 4 * i;
                const tokenDeltaLine = tokens[srcOffset];
                const tokenStartCharacter = tokens[srcOffset + 1];
                const tokenEndCharacter = tokens[srcOffset + 2];
                const tokenMetadata = tokens[srcOffset + 3];
                if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))) {
                    if ((tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
                        // this token is touching the range
                        continue;
                    }
                    else {
                        // this token is after the range
                        if (destTokens !== bTokens) {
                            // this token is the first token after the range
                            destTokens = bTokens;
                            destOffset = 0;
                            destFirstDeltaLine = tokenDeltaLine;
                        }
                    }
                }
                destTokens[destOffset++] = tokenDeltaLine - destFirstDeltaLine;
                destTokens[destOffset++] = tokenStartCharacter;
                destTokens[destOffset++] = tokenEndCharacter;
                destTokens[destOffset++] = tokenMetadata;
            }
            return [new SparseMultilineTokensStorage(new Uint32Array(aTokens)), new SparseMultilineTokensStorage(new Uint32Array(bTokens)), destFirstDeltaLine];
        }
        acceptDeleteRange(horizontalShiftForFirstLineTokens, startDeltaLine, startCharacter, endDeltaLine, endCharacter) {
            // This is a bit complex, here are the cases I used to think about this:
            //
            // 1. The token starts before the deletion range
            // 1a. The token is completely before the deletion range
            //               -----------
            //                          xxxxxxxxxxx
            // 1b. The token starts before, the deletion range ends after the token
            //               -----------
            //                      xxxxxxxxxxx
            // 1c. The token starts before, the deletion range ends precisely with the token
            //               ---------------
            //                      xxxxxxxx
            // 1d. The token starts before, the deletion range is inside the token
            //               ---------------
            //                    xxxxx
            //
            // 2. The token starts at the same position with the deletion range
            // 2a. The token starts at the same position, and ends inside the deletion range
            //               -------
            //               xxxxxxxxxxx
            // 2b. The token starts at the same position, and ends at the same position as the deletion range
            //               ----------
            //               xxxxxxxxxx
            // 2c. The token starts at the same position, and ends after the deletion range
            //               -------------
            //               xxxxxxx
            //
            // 3. The token starts inside the deletion range
            // 3a. The token is inside the deletion range
            //                -------
            //             xxxxxxxxxxxxx
            // 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
            //                ----------
            //             xxxxxxxxxxxxx
            // 3c. The token starts inside the deletion range, and ends after the deletion range
            //                ------------
            //             xxxxxxxxxxx
            //
            // 4. The token starts after the deletion range
            //                  -----------
            //          xxxxxxxx
            //
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            const deletedLineCount = (endDeltaLine - startDeltaLine);
            let newTokenCount = 0;
            let hasDeletedTokens = false;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 4 * i;
                let tokenDeltaLine = tokens[srcOffset];
                let tokenStartCharacter = tokens[srcOffset + 1];
                let tokenEndCharacter = tokens[srcOffset + 2];
                const tokenMetadata = tokens[srcOffset + 3];
                if (tokenDeltaLine < startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter <= startCharacter)) {
                    // 1a. The token is completely before the deletion range
                    // => nothing to do
                    newTokenCount++;
                    continue;
                }
                else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter < startCharacter) {
                    // 1b, 1c, 1d
                    // => the token survives, but it needs to shrink
                    if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                        // 1d. The token starts before, the deletion range is inside the token
                        // => the token shrinks by the deletion character count
                        tokenEndCharacter -= (endCharacter - startCharacter);
                    }
                    else {
                        // 1b. The token starts before, the deletion range ends after the token
                        // 1c. The token starts before, the deletion range ends precisely with the token
                        // => the token shrinks its ending to the deletion start
                        tokenEndCharacter = startCharacter;
                    }
                }
                else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter === startCharacter) {
                    // 2a, 2b, 2c
                    if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                        // 2c. The token starts at the same position, and ends after the deletion range
                        // => the token shrinks by the deletion character count
                        tokenEndCharacter -= (endCharacter - startCharacter);
                    }
                    else {
                        // 2a. The token starts at the same position, and ends inside the deletion range
                        // 2b. The token starts at the same position, and ends at the same position as the deletion range
                        // => the token is deleted
                        hasDeletedTokens = true;
                        continue;
                    }
                }
                else if (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter < endCharacter)) {
                    // 3a, 3b, 3c
                    if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                        // 3c. The token starts inside the deletion range, and ends after the deletion range
                        // => the token moves to continue right after the deletion
                        tokenDeltaLine = startDeltaLine;
                        tokenStartCharacter = startCharacter;
                        tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
                    }
                    else {
                        // 3a. The token is inside the deletion range
                        // 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
                        // => the token is deleted
                        hasDeletedTokens = true;
                        continue;
                    }
                }
                else if (tokenDeltaLine > endDeltaLine) {
                    // 4. (partial) The token starts after the deletion range, on a line below...
                    if (deletedLineCount === 0 && !hasDeletedTokens) {
                        // early stop, there is no need to walk all the tokens and do nothing...
                        newTokenCount = tokenCount;
                        break;
                    }
                    tokenDeltaLine -= deletedLineCount;
                }
                else if (tokenDeltaLine === endDeltaLine && tokenStartCharacter >= endCharacter) {
                    // 4. (continued) The token starts after the deletion range, on the last line where a deletion occurs
                    if (horizontalShiftForFirstLineTokens && tokenDeltaLine === 0) {
                        tokenStartCharacter += horizontalShiftForFirstLineTokens;
                        tokenEndCharacter += horizontalShiftForFirstLineTokens;
                    }
                    tokenDeltaLine -= deletedLineCount;
                    tokenStartCharacter -= (endCharacter - startCharacter);
                    tokenEndCharacter -= (endCharacter - startCharacter);
                }
                else {
                    throw new Error(`Not possible!`);
                }
                const destOffset = 4 * newTokenCount;
                tokens[destOffset] = tokenDeltaLine;
                tokens[destOffset + 1] = tokenStartCharacter;
                tokens[destOffset + 2] = tokenEndCharacter;
                tokens[destOffset + 3] = tokenMetadata;
                newTokenCount++;
            }
            this._tokenCount = newTokenCount;
        }
        acceptInsertText(deltaLine, character, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            // Here are the cases I used to think about this:
            //
            // 1. The token is completely before the insertion point
            //            -----------   |
            // 2. The token ends precisely at the insertion point
            //            -----------|
            // 3. The token contains the insertion point
            //            -----|------
            // 4. The token starts precisely at the insertion point
            //            |-----------
            // 5. The token is completely after the insertion point
            //            |   -----------
            //
            const isInsertingPreciselyOneWordCharacter = (eolCount === 0
                && firstLineLength === 1
                && ((firstCharCode >= 48 /* CharCode.Digit0 */ && firstCharCode <= 57 /* CharCode.Digit9 */)
                    || (firstCharCode >= 65 /* CharCode.A */ && firstCharCode <= 90 /* CharCode.Z */)
                    || (firstCharCode >= 97 /* CharCode.a */ && firstCharCode <= 122 /* CharCode.z */)));
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            for (let i = 0; i < tokenCount; i++) {
                const offset = 4 * i;
                let tokenDeltaLine = tokens[offset];
                let tokenStartCharacter = tokens[offset + 1];
                let tokenEndCharacter = tokens[offset + 2];
                if (tokenDeltaLine < deltaLine || (tokenDeltaLine === deltaLine && tokenEndCharacter < character)) {
                    // 1. The token is completely before the insertion point
                    // => nothing to do
                    continue;
                }
                else if (tokenDeltaLine === deltaLine && tokenEndCharacter === character) {
                    // 2. The token ends precisely at the insertion point
                    // => expand the end character only if inserting precisely one character that is a word character
                    if (isInsertingPreciselyOneWordCharacter) {
                        tokenEndCharacter += 1;
                    }
                    else {
                        continue;
                    }
                }
                else if (tokenDeltaLine === deltaLine && tokenStartCharacter < character && character < tokenEndCharacter) {
                    // 3. The token contains the insertion point
                    if (eolCount === 0) {
                        // => just expand the end character
                        tokenEndCharacter += firstLineLength;
                    }
                    else {
                        // => cut off the token
                        tokenEndCharacter = character;
                    }
                }
                else {
                    // 4. or 5.
                    if (tokenDeltaLine === deltaLine && tokenStartCharacter === character) {
                        // 4. The token starts precisely at the insertion point
                        // => grow the token (by keeping its start constant) only if inserting precisely one character that is a word character
                        // => otherwise behave as in case 5.
                        if (isInsertingPreciselyOneWordCharacter) {
                            continue;
                        }
                    }
                    // => the token must move and keep its size constant
                    if (tokenDeltaLine === deltaLine) {
                        tokenDeltaLine += eolCount;
                        // this token is on the line where the insertion is taking place
                        if (eolCount === 0) {
                            tokenStartCharacter += firstLineLength;
                            tokenEndCharacter += firstLineLength;
                        }
                        else {
                            const tokenLength = tokenEndCharacter - tokenStartCharacter;
                            tokenStartCharacter = lastLineLength + (tokenStartCharacter - character);
                            tokenEndCharacter = tokenStartCharacter + tokenLength;
                        }
                    }
                    else {
                        tokenDeltaLine += eolCount;
                    }
                }
                tokens[offset] = tokenDeltaLine;
                tokens[offset + 1] = tokenStartCharacter;
                tokens[offset + 2] = tokenEndCharacter;
            }
        }
    }
    class SparseLineTokens {
        constructor(tokens) {
            this._tokens = tokens;
        }
        getCount() {
            return this._tokens.length / 4;
        }
        getStartCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 1];
        }
        getEndCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 2];
        }
        getMetadata(tokenIndex) {
            return this._tokens[4 * tokenIndex + 3];
        }
    }
    exports.SparseLineTokens = SparseLineTokens;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcnNlTXVsdGlsaW5lVG9rZW5zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi90b2tlbnMvc3BhcnNlTXVsdGlsaW5lVG9rZW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRzs7T0FFRztJQUNILE1BQWEscUJBQXFCO1FBRTFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBdUIsRUFBRSxNQUFtQjtZQUNoRSxPQUFPLElBQUkscUJBQXFCLENBQUMsZUFBZSxFQUFFLElBQUksNEJBQTRCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBTUQ7O1dBRUc7UUFDSCxJQUFXLGVBQWU7WUFDekIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsQ0FBQztRQUVEOztXQUVHO1FBQ0gsSUFBVyxhQUFhO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO1FBRUQsWUFBb0IsZUFBdUIsRUFBRSxNQUFvQztZQUNoRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDOUUsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTyxvQkFBb0I7WUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM5RSxDQUFDO1FBRU0sT0FBTztZQUNiLE9B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