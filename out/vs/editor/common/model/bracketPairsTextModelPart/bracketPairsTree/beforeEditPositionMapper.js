/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "./length"], function (require, exports, range_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BeforeEditPositionMapper = exports.TextEditInfo = void 0;
    class TextEditInfo {
        static fromModelContentChanges(changes) {
            // Must be sorted in ascending order
            const edits = changes.map(c => {
                const range = range_1.Range.lift(c.range);
                return new TextEditInfo((0, length_1.positionToLength)(range.getStartPosition()), (0, length_1.positionToLength)(range.getEndPosition()), (0, length_1.lengthOfString)(c.text));
            }).reverse();
            return edits;
        }
        constructor(startOffset, endOffset, newLength) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.newLength = newLength;
        }
        toString() {
            return `[${(0, length_1.lengthToObj)(this.startOffset)}...${(0, length_1.lengthToObj)(this.endOffset)}) -> ${(0, length_1.lengthToObj)(this.newLength)}`;
        }
    }
    exports.TextEditInfo = TextEditInfo;
    class BeforeEditPositionMapper {
        /**
         * @param edits Must be sorted by offset in ascending order.
        */
        constructor(edits) {
            this.nextEditIdx = 0;
            this.deltaOldToNewLineCount = 0;
            this.deltaOldToNewColumnCount = 0;
            this.deltaLineIdxInOld = -1;
            this.edits = edits.map(edit => TextEditInfoCache.from(edit));
        }
        /**
         * @param offset Must be equal to or greater than the last offset this method has been called with.
        */
        getOffsetBeforeChange(offset) {
            this.adjustNextEdit(offset);
            return this.translateCurToOld(offset);
        }
        /**
         * @param offset Must be equal to or greater than the last offset this method has been called with.
         * Returns null if there is no edit anymore.
        */
        getDistanceToNextChange(offset) {
            this.adjustNextEdit(offset);
            const nextEdit = this.edits[this.nextEditIdx];
            const nextChangeOffset = nextEdit ? this.translateOldToCur(nextEdit.offsetObj) : null;
            if (nextChangeOffset === null) {
                return null;
            }
            return (0, length_1.lengthDiffNonNegative)(offset, nextChangeOffset);
        }
        translateOldToCur(oldOffsetObj) {
            if (oldOffsetObj.lineCount === this.deltaLineIdxInOld) {
                return (0, length_1.toLength)(oldOffsetObj.lineCount + this.deltaOldToNewLineCount, oldOffsetObj.columnCount + this.deltaOldToNewColumnCount);
            }
            else {
                return (0, length_1.toLength)(oldOffsetObj.lineCount + this.deltaOldToNewLineCount, oldOffsetObj.columnCount);
            }
        }
        translateCurToOld(newOffset) {
            const offsetObj = (0, length_1.lengthToObj)(newOffset);
            if (offsetObj.lineCount - this.deltaOldToNewLineCount === this.deltaLineIdxInOld) {
                return (0, length_1.toLength)(offsetObj.lineCount - this.deltaOldToNewLineCount, offsetObj.columnCount - this.deltaOldToNewColumnCount);
            }
            else {
                return (0, length_1.toLength)(offsetObj.lineCount - this.deltaOldToNewLineCount, offsetObj.columnCount);
            }
        }
        adjustNextEdit(offset) {
            while (this.nextEditIdx < this.edits.length) {
                const nextEdit = this.edits[this.nextEditIdx];
                // After applying the edit, what is its end offset (considering all previous edits)?
                const nextEditEndOffsetInCur = this.translateOldToCur(nextEdit.endOffsetAfterObj);
                if ((0, length_1.lengthLessThanEqual)(nextEditEndOffsetInCur, offset)) {
                    // We are after the edit, skip it
                    this.nextEditIdx++;
                    const nextEditEndOffsetInCurObj = (0, length_1.lengthToObj)(nextEditEndOffsetInCur);
                    // Before applying the edit, what is its end offset (considering all previous edits)?
                    const nextEditEndOffsetBeforeInCurObj = (0, length_1.lengthToObj)(this.translateOldToCur(nextEdit.endOffsetBeforeObj));
                    const lineDelta = nextEditEndOffsetInCurObj.lineCount - nextEditEndOffsetBeforeInCurObj.lineCount;
                    this.deltaOldToNewLineCount += lineDelta;
                    const previousColumnDelta = this.deltaLineIdxInOld === nextEdit.endOffsetBeforeObj.lineCount ? this.deltaOldToNewColumnCount : 0;
                    const columnDelta = nextEditEndOffsetInCurObj.columnCount - nextEditEndOffsetBeforeInCurObj.columnCount;
                    this.deltaOldToNewColumnCount = previousColumnDelta + columnDelta;
                    this.deltaLineIdxInOld = nextEdit.endOffsetBeforeObj.lineCount;
                }
                else {
                    // We are in or before the edit.
                    break;
                }
            }
        }
    }
    exports.BeforeEditPositionMapper = BeforeEditPositionMapper;
    class TextEditInfoCache {
        static from(edit) {
            return new TextEditInfoCache(edit.startOffset, edit.endOffset, edit.newLength);
        }
        constructor(startOffset, endOffset, textLength) {
            this.endOffsetBeforeObj = (0, length_1.lengthToObj)(endOffset);
            this.endOffsetAfterObj = (0, length_1.lengthToObj)((0, length_1.lengthAdd)(startOffset, textLength));
            this.offsetObj = (0, length_1.lengthToObj)(startOffset);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVmb3JlRWRpdFBvc2l0aW9uTWFwcGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9icmFja2V0UGFpcnNUZXh0TW9kZWxQYXJ0L2JyYWNrZXRQYWlyc1RyZWUvYmVmb3JlRWRpdFBvc2l0aW9uTWFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLFlBQVk7UUFDakIsTUFBTSxDQUFDLHVCQUF1QixDQUFDLE9BQThCO1lBQ25FLG9DQUFvQztZQUNwQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM3QixNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxJQUFJLFlBQVksQ0FDdEIsSUFBQSx5QkFBZ0IsRUFBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUMxQyxJQUFBLHlCQUFnQixFQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUN4QyxJQUFBLHVCQUFjLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUN0QixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxZQUNpQixXQUFtQixFQUNuQixTQUFpQixFQUNqQixTQUFpQjtZQUZqQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFFbEMsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLElBQUksSUFBQSxvQkFBVyxFQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFBLG9CQUFXLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FB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