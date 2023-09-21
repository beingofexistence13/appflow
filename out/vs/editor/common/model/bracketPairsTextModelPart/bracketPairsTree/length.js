/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, strings_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lengthMax = exports.lengthHash = exports.lengthOfStringObj = exports.lengthOfString = exports.lengthCompare = exports.lengthOfRange = exports.lengthsToRange = exports.positionToLength = exports.lengthToPosition = exports.lengthGreaterThanEqual = exports.lengthLessThanEqual = exports.lengthLessThan = exports.lengthDiffNonNegative = exports.lengthEquals = exports.sumLengths = exports.lengthAdd = exports.lengthGetColumnCountIfZeroLineCount = exports.lengthGetLineCount = exports.lengthToObj = exports.toLength = exports.lengthIsZero = exports.lengthZero = exports.lengthDiff = exports.LengthObj = void 0;
    /**
     * Represents a non-negative length in terms of line and column count.
     * Prefer using {@link Length} for performance reasons.
    */
    class LengthObj {
        static { this.zero = new LengthObj(0, 0); }
        static lengthDiffNonNegative(start, end) {
            if (end.isLessThan(start)) {
                return LengthObj.zero;
            }
            if (start.lineCount === end.lineCount) {
                return new LengthObj(0, end.columnCount - start.columnCount);
            }
            else {
                return new LengthObj(end.lineCount - start.lineCount, end.columnCount);
            }
        }
        constructor(lineCount, columnCount) {
            this.lineCount = lineCount;
            this.columnCount = columnCount;
        }
        isZero() {
            return this.lineCount === 0 && this.columnCount === 0;
        }
        toLength() {
            return toLength(this.lineCount, this.columnCount);
        }
        isLessThan(other) {
            if (this.lineCount !== other.lineCount) {
                return this.lineCount < other.lineCount;
            }
            return this.columnCount < other.columnCount;
        }
        isGreaterThan(other) {
            if (this.lineCount !== other.lineCount) {
                return this.lineCount > other.lineCount;
            }
            return this.columnCount > other.columnCount;
        }
        equals(other) {
            return this.lineCount === other.lineCount && this.columnCount === other.columnCount;
        }
        compare(other) {
            if (this.lineCount !== other.lineCount) {
                return this.lineCount - other.lineCount;
            }
            return this.columnCount - other.columnCount;
        }
        add(other) {
            if (other.lineCount === 0) {
                return new LengthObj(this.lineCount, this.columnCount + other.columnCount);
            }
            else {
                return new LengthObj(this.lineCount + other.lineCount, other.columnCount);
            }
        }
        toString() {
            return `${this.lineCount},${this.columnCount}`;
        }
    }
    exports.LengthObj = LengthObj;
    /**
     * The end must be greater than or equal to the start.
    */
    function lengthDiff(startLineCount, startColumnCount, endLineCount, endColumnCount) {
        return (startLineCount !== endLineCount)
            ? toLength(endLineCount - startLineCount, endColumnCount)
            : toLength(0, endColumnCount - startColumnCount);
    }
    exports.lengthDiff = lengthDiff;
    exports.lengthZero = 0;
    function lengthIsZero(length) {
        return length === 0;
    }
    exports.lengthIsZero = lengthIsZero;
    /*
     * We have 52 bits available in a JS number.
     * We use the upper 26 bits to store the line and the lower 26 bits to store the column.
     */
    ///*
    const factor = 2 ** 26;
    /*/
    const factor = 1000000;
    // */
    function toLength(lineCount, columnCount) {
        // llllllllllllllllllllllllllcccccccccccccccccccccccccc (52 bits)
        //       line count (26 bits)    column count (26 bits)
        // If there is no overflow (all values/sums below 2^26 = 67108864),
        // we have `toLength(lns1, cols1) + toLength(lns2, cols2) = toLength(lns1 + lns2, cols1 + cols2)`.
        return (lineCount * factor + columnCount);
    }
    exports.toLength = toLength;
    function lengthToObj(length) {
        const l = length;
        const lineCount = Math.floor(l / factor);
        const columnCount = l - lineCount * factor;
        return new LengthObj(lineCount, columnCount);
    }
    exports.lengthToObj = lengthToObj;
    function lengthGetLineCount(length) {
        return Math.floor(length / factor);
    }
    exports.lengthGetLineCount = lengthGetLineCount;
    /**
     * Returns the amount of columns of the given length, assuming that it does not span any line.
    */
    function lengthGetColumnCountIfZeroLineCount(length) {
        return length;
    }
    exports.lengthGetColumnCountIfZeroLineCount = lengthGetColumnCountIfZeroLineCount;
    function lengthAdd(l1, l2) {
        let r = l1 + l2;
        if (l2 >= factor) {
            r = r - (l1 % factor);
        }
        return r;
    }
    exports.lengthAdd = lengthAdd;
    function sumLengths(items, lengthFn) {
        return items.reduce((a, b) => lengthAdd(a, lengthFn(b)), exports.lengthZero);
    }
    exports.sumLengths = sumLengths;
    function lengthEquals(length1, length2) {
        return length1 === length2;
    }
    exports.lengthEquals = lengthEquals;
    /**
     * Returns a non negative length `result` such that `lengthAdd(length1, result) = length2`, or zero if such length does not exist.
     */
    function lengthDiffNonNegative(length1, length2) {
        const l1 = length1;
        const l2 = length2;
        const diff = l2 - l1;
        if (diff <= 0) {
            // line-count of length1 is higher than line-count of length2
            // or they are equal and column-count of length1 is higher than column-count of length2
            return exports.lengthZero;
        }
        const lineCount1 = Math.floor(l1 / factor);
        const lineCount2 = Math.floor(l2 / factor);
        const colCount2 = l2 - lineCount2 * factor;
        if (lineCount1 === lineCount2) {
            const colCount1 = l1 - lineCount1 * factor;
            return toLength(0, colCount2 - colCount1);
        }
        else {
            return toLength(lineCount2 - lineCount1, colCount2);
        }
    }
    exports.lengthDiffNonNegative = lengthDiffNonNegative;
    function lengthLessThan(length1, length2) {
        // First, compare line counts, then column counts.
        return length1 < length2;
    }
    exports.lengthLessThan = lengthLessThan;
    function lengthLessThanEqual(length1, length2) {
        return length1 <= length2;
    }
    exports.lengthLessThanEqual = lengthLessThanEqual;
    function lengthGreaterThanEqual(length1, length2) {
        return length1 >= length2;
    }
    exports.lengthGreaterThanEqual = lengthGreaterThanEqual;
    function lengthToPosition(length) {
        const l = length;
        const lineCount = Math.floor(l / factor);
        const colCount = l - lineCount * factor;
        return new position_1.Position(lineCount + 1, colCount + 1);
    }
    exports.lengthToPosition = lengthToPosition;
    function positionToLength(position) {
        return toLength(position.lineNumber - 1, position.column - 1);
    }
    exports.positionToLength = positionToLength;
    function lengthsToRange(lengthStart, lengthEnd) {
        const l = lengthStart;
        const lineCount = Math.floor(l / factor);
        const colCount = l - lineCount * factor;
        const l2 = lengthEnd;
        const lineCount2 = Math.floor(l2 / factor);
        const colCount2 = l2 - lineCount2 * factor;
        return new range_1.Range(lineCount + 1, colCount + 1, lineCount2 + 1, colCount2 + 1);
    }
    exports.lengthsToRange = lengthsToRange;
    function lengthOfRange(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new LengthObj(0, range.endColumn - range.startColumn);
        }
        else {
            return new LengthObj(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
        }
    }
    exports.lengthOfRange = lengthOfRange;
    function lengthCompare(length1, length2) {
        const l1 = length1;
        const l2 = length2;
        return l1 - l2;
    }
    exports.lengthCompare = lengthCompare;
    function lengthOfString(str) {
        const lines = (0, strings_1.splitLines)(str);
        return toLength(lines.length - 1, lines[lines.length - 1].length);
    }
    exports.lengthOfString = lengthOfString;
    function lengthOfStringObj(str) {
        const lines = (0, strings_1.splitLines)(str);
        return new LengthObj(lines.length - 1, lines[lines.length - 1].length);
    }
    exports.lengthOfStringObj = lengthOfStringObj;
    /**
     * Computes a numeric hash of the given length.
    */
    function lengthHash(length) {
        return length;
    }
    exports.lengthHash = lengthHash;
    function lengthMax(length1, length2) {
        return length1 > length2 ? length1 : length2;
    }
    exports.lengthMax = lengthMax;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVuZ3RoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9icmFja2V0UGFpcnNUZXh0TW9kZWxQYXJ0L2JyYWNrZXRQYWlyc1RyZWUvbGVuZ3RoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRzs7O01BR0U7SUFDRixNQUFhLFNBQVM7aUJBQ1AsU0FBSSxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVsQyxNQUFNLENBQUMscUJBQXFCLENBQUMsS0FBZ0IsRUFBRSxHQUFjO1lBQ25FLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDO2FBQ3RCO1lBQ0QsSUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLEdBQUcsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RDLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzdEO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN2RTtRQUNGLENBQUM7UUFFRCxZQUNpQixTQUFpQixFQUNqQixXQUFtQjtZQURuQixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ2hDLENBQUM7UUFFRSxNQUFNO1lBQ1osT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFT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