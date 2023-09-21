/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "./length"], function (require, exports, range_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JA = exports.$IA = void 0;
    class $IA {
        static fromModelContentChanges(changes) {
            // Must be sorted in ascending order
            const edits = changes.map(c => {
                const range = range_1.$ks.lift(c.range);
                return new $IA((0, length_1.$Dt)(range.getStartPosition()), (0, length_1.$Dt)(range.getEndPosition()), (0, length_1.$Ht)(c.text));
            }).reverse();
            return edits;
        }
        constructor(startOffset, endOffset, newLength) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.newLength = newLength;
        }
        toString() {
            return `[${(0, length_1.$st)(this.startOffset)}...${(0, length_1.$st)(this.endOffset)}) -> ${(0, length_1.$st)(this.newLength)}`;
        }
    }
    exports.$IA = $IA;
    class $JA {
        /**
         * @param edits Must be sorted by offset in ascending order.
        */
        constructor(edits) {
            this.a = 0;
            this.b = 0;
            this.d = 0;
            this.e = -1;
            this.f = edits.map(edit => TextEditInfoCache.from(edit));
        }
        /**
         * @param offset Must be equal to or greater than the last offset this method has been called with.
        */
        getOffsetBeforeChange(offset) {
            this.i(offset);
            return this.h(offset);
        }
        /**
         * @param offset Must be equal to or greater than the last offset this method has been called with.
         * Returns null if there is no edit anymore.
        */
        getDistanceToNextChange(offset) {
            this.i(offset);
            const nextEdit = this.f[this.a];
            const nextChangeOffset = nextEdit ? this.g(nextEdit.offsetObj) : null;
            if (nextChangeOffset === null) {
                return null;
            }
            return (0, length_1.$yt)(offset, nextChangeOffset);
        }
        g(oldOffsetObj) {
            if (oldOffsetObj.lineCount === this.e) {
                return (0, length_1.$rt)(oldOffsetObj.lineCount + this.b, oldOffsetObj.columnCount + this.d);
            }
            else {
                return (0, length_1.$rt)(oldOffsetObj.lineCount + this.b, oldOffsetObj.columnCount);
            }
        }
        h(newOffset) {
            const offsetObj = (0, length_1.$st)(newOffset);
            if (offsetObj.lineCount - this.b === this.e) {
                return (0, length_1.$rt)(offsetObj.lineCount - this.b, offsetObj.columnCount - this.d);
            }
            else {
                return (0, length_1.$rt)(offsetObj.lineCount - this.b, offsetObj.columnCount);
            }
        }
        i(offset) {
            while (this.a < this.f.length) {
                const nextEdit = this.f[this.a];
                // After applying the edit, what is its end offset (considering all previous edits)?
                const nextEditEndOffsetInCur = this.g(nextEdit.endOffsetAfterObj);
                if ((0, length_1.$At)(nextEditEndOffsetInCur, offset)) {
                    // We are after the edit, skip it
                    this.a++;
                    const nextEditEndOffsetInCurObj = (0, length_1.$st)(nextEditEndOffsetInCur);
                    // Before applying the edit, what is its end offset (considering all previous edits)?
                    const nextEditEndOffsetBeforeInCurObj = (0, length_1.$st)(this.g(nextEdit.endOffsetBeforeObj));
                    const lineDelta = nextEditEndOffsetInCurObj.lineCount - nextEditEndOffsetBeforeInCurObj.lineCount;
                    this.b += lineDelta;
                    const previousColumnDelta = this.e === nextEdit.endOffsetBeforeObj.lineCount ? this.d : 0;
                    const columnDelta = nextEditEndOffsetInCurObj.columnCount - nextEditEndOffsetBeforeInCurObj.columnCount;
                    this.d = previousColumnDelta + columnDelta;
                    this.e = nextEdit.endOffsetBeforeObj.lineCount;
                }
                else {
                    // We are in or before the edit.
                    break;
                }
            }
        }
    }
    exports.$JA = $JA;
    class TextEditInfoCache {
        static from(edit) {
            return new TextEditInfoCache(edit.startOffset, edit.endOffset, edit.newLength);
        }
        constructor(startOffset, endOffset, textLength) {
            this.endOffsetBeforeObj = (0, length_1.$st)(endOffset);
            this.endOffsetAfterObj = (0, length_1.$st)((0, length_1.$vt)(startOffset, textLength));
            this.offsetObj = (0, length_1.$st)(startOffset);
        }
    }
});
//# sourceMappingURL=beforeEditPositionMapper.js.map