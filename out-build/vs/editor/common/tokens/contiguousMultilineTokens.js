/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer", "vs/editor/common/core/position", "vs/editor/common/core/eolCounter", "vs/editor/common/tokens/contiguousTokensEditing", "vs/editor/common/core/lineRange"], function (require, exports, arrays, buffer_1, position_1, eolCounter_1, contiguousTokensEditing_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2s = void 0;
    /**
     * Represents contiguous tokens over a contiguous range of lines.
     */
    class $2s {
        static deserialize(buff, offset, result) {
            const view32 = new Uint32Array(buff.buffer);
            const startLineNumber = (0, buffer_1.$Jd)(buff, offset);
            offset += 4;
            const count = (0, buffer_1.$Jd)(buff, offset);
            offset += 4;
            const tokens = [];
            for (let i = 0; i < count; i++) {
                const byteCount = (0, buffer_1.$Jd)(buff, offset);
                offset += 4;
                tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
                offset += byteCount;
            }
            result.push(new $2s(startLineNumber, tokens));
            return offset;
        }
        /**
         * (Inclusive) start line number for these tokens.
         */
        get startLineNumber() {
            return this.a;
        }
        /**
         * (Inclusive) end line number for these tokens.
         */
        get endLineNumber() {
            return this.a + this.b.length - 1;
        }
        constructor(startLineNumber, tokens) {
            this.a = startLineNumber;
            this.b = tokens;
        }
        getLineRange() {
            return new lineRange_1.$ts(this.a, this.a + this.b.length);
        }
        /**
         * @see {@link b}
         */
        getLineTokens(lineNumber) {
            return this.b[lineNumber - this.a];
        }
        appendLineTokens(lineTokens) {
            this.b.push(lineTokens);
        }
        serializeSize() {
            let result = 0;
            result += 4; // 4 bytes for the start line number
            result += 4; // 4 bytes for the line count
            for (let i = 0; i < this.b.length; i++) {
                const lineTokens = this.b[i];
                if (!(lineTokens instanceof Uint32Array)) {
                    throw new Error(`Not supported!`);
                }
                result += 4; // 4 bytes for the byte count
                result += lineTokens.byteLength;
            }
            return result;
        }
        serialize(destination, offset) {
            (0, buffer_1.$Kd)(destination, this.a, offset);
            offset += 4;
            (0, buffer_1.$Kd)(destination, this.b.length, offset);
            offset += 4;
            for (let i = 0; i < this.b.length; i++) {
                const lineTokens = this.b[i];
                if (!(lineTokens instanceof Uint32Array)) {
                    throw new Error(`Not supported!`);
                }
                (0, buffer_1.$Kd)(destination, lineTokens.byteLength, offset);
                offset += 4;
                destination.set(new Uint8Array(lineTokens.buffer), offset);
                offset += lineTokens.byteLength;
            }
            return offset;
        }
        applyEdit(range, text) {
            const [eolCount, firstLineLength] = (0, eolCounter_1.$Ws)(text);
            this.c(range);
            this.d(new position_1.$js(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
        }
        c(range) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            const firstLineIndex = range.startLineNumber - this.a;
            const lastLineIndex = range.endLineNumber - this.a;
            if (lastLineIndex < 0) {
                // this deletion occurs entirely before this block, so we only need to adjust line numbers
                const deletedLinesCount = lastLineIndex - firstLineIndex;
                this.a -= deletedLinesCount;
                return;
            }
            if (firstLineIndex >= this.b.length) {
                // this deletion occurs entirely after this block, so there is nothing to do
                return;
            }
            if (firstLineIndex < 0 && lastLineIndex >= this.b.length) {
                // this deletion completely encompasses this block
                this.a = 0;
                this.b = [];
                return;
            }
            if (firstLineIndex === lastLineIndex) {
                // a delete on a single line
                this.b[firstLineIndex] = contiguousTokensEditing_1.$Zs.delete(this.b[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
                return;
            }
            if (firstLineIndex >= 0) {
                // The first line survives
                this.b[firstLineIndex] = contiguousTokensEditing_1.$Zs.deleteEnding(this.b[firstLineIndex], range.startColumn - 1);
                if (lastLineIndex < this.b.length) {
                    // The last line survives
                    const lastLineTokens = contiguousTokensEditing_1.$Zs.deleteBeginning(this.b[lastLineIndex], range.endColumn - 1);
                    // Take remaining text on last line and append it to remaining text on first line
                    this.b[firstLineIndex] = contiguousTokensEditing_1.$Zs.append(this.b[firstLineIndex], lastLineTokens);
                    // Delete middle lines
                    this.b.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
                }
                else {
                    // The last line does not survive
                    // Take remaining text on last line and append it to remaining text on first line
                    this.b[firstLineIndex] = contiguousTokensEditing_1.$Zs.append(this.b[firstLineIndex], null);
                    // Delete lines
                    this.b = this.b.slice(0, firstLineIndex + 1);
                }
            }
            else {
                // The first line does not survive
                const deletedBefore = -firstLineIndex;
                this.a -= deletedBefore;
                // Remove beginning from last line
                this.b[lastLineIndex] = contiguousTokensEditing_1.$Zs.deleteBeginning(this.b[lastLineIndex], range.endColumn - 1);
                // Delete lines
                this.b = this.b.slice(lastLineIndex);
            }
        }
        d(position, eolCount, firstLineLength) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - this.a;
            if (lineIndex < 0) {
                // this insertion occurs before this block, so we only need to adjust line numbers
                this.a += eolCount;
                return;
            }
            if (lineIndex >= this.b.length) {
                // this insertion occurs after this block, so there is nothing to do
                return;
            }
            if (eolCount === 0) {
                // Inserting text on one line
                this.b[lineIndex] = contiguousTokensEditing_1.$Zs.insert(this.b[lineIndex], position.column - 1, firstLineLength);
                return;
            }
            this.b[lineIndex] = contiguousTokensEditing_1.$Zs.deleteEnding(this.b[lineIndex], position.column - 1);
            this.b[lineIndex] = contiguousTokensEditing_1.$Zs.insert(this.b[lineIndex], position.column - 1, firstLineLength);
            this.e(position.lineNumber, eolCount);
        }
        e(insertIndex, insertCount) {
            if (insertCount === 0) {
                return;
            }
            const lineTokens = [];
            for (let i = 0; i < insertCount; i++) {
                lineTokens[i] = null;
            }
            this.b = arrays.$Ub(this.b, insertIndex, lineTokens);
        }
    }
    exports.$2s = $2s;
});
//# sourceMappingURL=contiguousMultilineTokens.js.map