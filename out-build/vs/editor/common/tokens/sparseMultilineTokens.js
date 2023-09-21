/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/eolCounter"], function (require, exports, position_1, range_1, eolCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vu = exports.$uu = void 0;
    /**
     * Represents sparse tokens over a contiguous range of lines.
     */
    class $uu {
        static create(startLineNumber, tokens) {
            return new $uu(startLineNumber, new SparseMultilineTokensStorage(tokens));
        }
        /**
         * (Inclusive) start line number for these tokens.
         */
        get startLineNumber() {
            return this.c;
        }
        /**
         * (Inclusive) end line number for these tokens.
         */
        get endLineNumber() {
            return this.d;
        }
        constructor(startLineNumber, tokens) {
            this.c = startLineNumber;
            this.e = tokens;
            this.d = this.c + this.e.getMaxDeltaLine();
        }
        toString() {
            return this.e.toString(this.c);
        }
        f() {
            this.d = this.c + this.e.getMaxDeltaLine();
        }
        isEmpty() {
            return this.e.isEmpty();
        }
        getLineTokens(lineNumber) {
            if (this.c <= lineNumber && lineNumber <= this.d) {
                return this.e.getLineTokens(lineNumber - this.c);
            }
            return null;
        }
        getRange() {
            const deltaRange = this.e.getRange();
            if (!deltaRange) {
                return deltaRange;
            }
            return new range_1.$ks(this.c + deltaRange.startLineNumber, deltaRange.startColumn, this.c + deltaRange.endLineNumber, deltaRange.endColumn);
        }
        removeTokens(range) {
            const startLineIndex = range.startLineNumber - this.c;
            const endLineIndex = range.endLineNumber - this.c;
            this.c += this.e.removeTokens(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
            this.f();
        }
        split(range) {
            // split tokens to two:
            // a) all the tokens before `range`
            // b) all the tokens after `range`
            const startLineIndex = range.startLineNumber - this.c;
            const endLineIndex = range.endLineNumber - this.c;
            const [a, b, bDeltaLine] = this.e.split(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
            return [new $uu(this.c, a), new $uu(this.c + bDeltaLine, b)];
        }
        applyEdit(range, text) {
            const [eolCount, firstLineLength, lastLineLength] = (0, eolCounter_1.$Ws)(text);
            this.acceptEdit(range, eolCount, firstLineLength, lastLineLength, text.length > 0 ? text.charCodeAt(0) : 0 /* CharCode.Null */);
        }
        acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            this.g(range);
            this.h(new position_1.$js(range.startLineNumber, range.startColumn), eolCount, firstLineLength, lastLineLength, firstCharCode);
            this.f();
        }
        g(range) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            const firstLineIndex = range.startLineNumber - this.c;
            const lastLineIndex = range.endLineNumber - this.c;
            if (lastLineIndex < 0) {
                // this deletion occurs entirely before this block, so we only need to adjust line numbers
                const deletedLinesCount = lastLineIndex - firstLineIndex;
                this.c -= deletedLinesCount;
                return;
            }
            const tokenMaxDeltaLine = this.e.getMaxDeltaLine();
            if (firstLineIndex >= tokenMaxDeltaLine + 1) {
                // this deletion occurs entirely after this block, so there is nothing to do
                return;
            }
            if (firstLineIndex < 0 && lastLineIndex >= tokenMaxDeltaLine + 1) {
                // this deletion completely encompasses this block
                this.c = 0;
                this.e.clear();
                return;
            }
            if (firstLineIndex < 0) {
                const deletedBefore = -firstLineIndex;
                this.c -= deletedBefore;
                this.e.acceptDeleteRange(range.startColumn - 1, 0, 0, lastLineIndex, range.endColumn - 1);
            }
            else {
                this.e.acceptDeleteRange(0, firstLineIndex, range.startColumn - 1, lastLineIndex, range.endColumn - 1);
            }
        }
        h(position, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - this.c;
            if (lineIndex < 0) {
                // this insertion occurs before this block, so we only need to adjust line numbers
                this.c += eolCount;
                return;
            }
            const tokenMaxDeltaLine = this.e.getMaxDeltaLine();
            if (lineIndex >= tokenMaxDeltaLine + 1) {
                // this insertion occurs after this block, so there is nothing to do
                return;
            }
            this.e.acceptInsertText(lineIndex, position.column - 1, eolCount, firstLineLength, lastLineLength, firstCharCode);
        }
    }
    exports.$uu = $uu;
    class SparseMultilineTokensStorage {
        constructor(tokens) {
            this.c = tokens;
            this.d = tokens.length / 4;
        }
        toString(startLineNumber) {
            const pieces = [];
            for (let i = 0; i < this.d; i++) {
                pieces.push(`(${this.f(i) + startLineNumber},${this.g(i)}-${this.h(i)})`);
            }
            return `[${pieces.join(',')}]`;
        }
        getMaxDeltaLine() {
            const tokenCount = this.e();
            if (tokenCount === 0) {
                return -1;
            }
            return this.f(tokenCount - 1);
        }
        getRange() {
            const tokenCount = this.e();
            if (tokenCount === 0) {
                return null;
            }
            const startChar = this.g(0);
            const maxDeltaLine = this.f(tokenCount - 1);
            const endChar = this.h(tokenCount - 1);
            return new range_1.$ks(0, startChar + 1, maxDeltaLine, endChar + 1);
        }
        e() {
            return this.d;
        }
        f(tokenIndex) {
            return this.c[4 * tokenIndex];
        }
        g(tokenIndex) {
            return this.c[4 * tokenIndex + 1];
        }
        h(tokenIndex) {
            return this.c[4 * tokenIndex + 2];
        }
        isEmpty() {
            return (this.e() === 0);
        }
        getLineTokens(deltaLine) {
            let low = 0;
            let high = this.e() - 1;
            while (low < high) {
                const mid = low + Math.floor((high - low) / 2);
                const midDeltaLine = this.f(mid);
                if (midDeltaLine < deltaLine) {
                    low = mid + 1;
                }
                else if (midDeltaLine > deltaLine) {
                    high = mid - 1;
                }
                else {
                    let min = mid;
                    while (min > low && this.f(min - 1) === deltaLine) {
                        min--;
                    }
                    let max = mid;
                    while (max < high && this.f(max + 1) === deltaLine) {
                        max++;
                    }
                    return new $vu(this.c.subarray(4 * min, 4 * max + 4));
                }
            }
            if (this.f(low) === deltaLine) {
                return new $vu(this.c.subarray(4 * low, 4 * low + 4));
            }
            return null;
        }
        clear() {
            this.d = 0;
        }
        removeTokens(startDeltaLine, startChar, endDeltaLine, endChar) {
            const tokens = this.c;
            const tokenCount = this.d;
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
            this.d = newTokenCount;
            return firstDeltaLine;
        }
        split(startDeltaLine, startChar, endDeltaLine, endChar) {
            const tokens = this.c;
            const tokenCount = this.d;
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
            const tokens = this.c;
            const tokenCount = this.d;
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
            this.d = newTokenCount;
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
            const tokens = this.c;
            const tokenCount = this.d;
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
    class $vu {
        constructor(tokens) {
            this.c = tokens;
        }
        getCount() {
            return this.c.length / 4;
        }
        getStartCharacter(tokenIndex) {
            return this.c[4 * tokenIndex + 1];
        }
        getEndCharacter(tokenIndex) {
            return this.c[4 * tokenIndex + 2];
        }
        getMetadata(tokenIndex) {
            return this.c[4 * tokenIndex + 3];
        }
    }
    exports.$vu = $vu;
});
//# sourceMappingURL=sparseMultilineTokens.js.map