/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/editor/common/core/range"], function (require, exports, arrays_1, errors_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineRange = void 0;
    class LineRange {
        static { this.compareByStart = (0, arrays_1.compareBy)(l => l.startLineNumber, arrays_1.numberComparator); }
        static join(ranges) {
            if (ranges.length === 0) {
                return undefined;
            }
            let startLineNumber = Number.MAX_SAFE_INTEGER;
            let endLineNumber = 0;
            for (const range of ranges) {
                startLineNumber = Math.min(startLineNumber, range.startLineNumber);
                endLineNumber = Math.max(endLineNumber, range.startLineNumber + range.lineCount);
            }
            return new LineRange(startLineNumber, endLineNumber - startLineNumber);
        }
        static fromLineNumbers(startLineNumber, endExclusiveLineNumber) {
            return new LineRange(startLineNumber, endExclusiveLineNumber - startLineNumber);
        }
        constructor(startLineNumber, lineCount) {
            this.startLineNumber = startLineNumber;
            this.lineCount = lineCount;
            if (lineCount < 0) {
                throw new errors_1.BugIndicatingError();
            }
        }
        join(other) {
            return new LineRange(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive) - this.startLineNumber);
        }
        get endLineNumberExclusive() {
            return this.startLineNumber + this.lineCount;
        }
        get isEmpty() {
            return this.lineCount === 0;
        }
        /**
         * Returns false if there is at least one line between `this` and `other`.
        */
        touches(other) {
            return (this.endLineNumberExclusive >= other.startLineNumber &&
                other.endLineNumberExclusive >= this.startLineNumber);
        }
        isAfter(range) {
            return this.startLineNumber >= range.endLineNumberExclusive;
        }
        isBefore(range) {
            return range.startLineNumber >= this.endLineNumberExclusive;
        }
        delta(lineDelta) {
            return new LineRange(this.startLineNumber + lineDelta, this.lineCount);
        }
        toString() {
            return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
        }
        equals(originalRange) {
            return this.startLineNumber === originalRange.startLineNumber && this.lineCount === originalRange.lineCount;
        }
        contains(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
        }
        deltaEnd(delta) {
            return new LineRange(this.startLineNumber, this.lineCount + delta);
        }
        deltaStart(lineDelta) {
            return new LineRange(this.startLineNumber + lineDelta, this.lineCount - lineDelta);
        }
        getLines(model) {
            const result = new Array(this.lineCount);
            for (let i = 0; i < this.lineCount; i++) {
                result[i] = model.getLineContent(this.startLineNumber + i);
            }
            return result;
        }
        containsRange(range) {
            return this.startLineNumber <= range.startLineNumber && range.endLineNumberExclusive <= this.endLineNumberExclusive;
        }
        toRange() {
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
        }
        toInclusiveRange() {
            if (this.isEmpty) {
                return undefined;
            }
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        }
        toInclusiveRangeOrEmpty() {
            if (this.isEmpty) {
                return new range_1.Range(this.startLineNumber, 1, this.startLineNumber, 1);
            }
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        }
        intersects(lineRange) {
            return this.startLineNumber <= lineRange.endLineNumberExclusive
                && lineRange.startLineNumber <= this.endLineNumberExclusive;
        }
    }
    exports.LineRange = LineRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVJhbmdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci9tb2RlbC9saW5lUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsU0FBUztpQkFDRSxtQkFBYyxHQUEwQixJQUFBLGtCQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLHlCQUFnQixDQUFDLENBQUM7UUFFNUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFtQjtZQUNyQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUM5QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdEIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7Z0JBQzNCLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ25FLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNqRjtZQUNELE9BQU8sSUFBSSxTQUFTLENBQUMsZUFBZSxFQUFFLGFBQWEsR0FBRyxlQUFlLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUF1QixFQUFFLHNCQUE4QjtZQUM3RSxPQUFPLElBQUksU0FBUyxDQUFDLGVBQWUsRUFBRSxzQkFBc0IsR0FBRyxlQUFlLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsWUFDaUIsZUFBdUIsRUFDdkIsU0FBaUI7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