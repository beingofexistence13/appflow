/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/core/offsetRange", "vs/editor/common/core/range", "vs/base/common/arraysFind"], function (require, exports, errors_1, offsetRange_1, range_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineRangeSet = exports.LineRange = void 0;
    /**
     * A range of lines (1-based).
     */
    class LineRange {
        static fromRange(range) {
            return new LineRange(range.startLineNumber, range.endLineNumber);
        }
        static subtract(a, b) {
            if (!b) {
                return [a];
            }
            if (a.startLineNumber < b.startLineNumber && b.endLineNumberExclusive < a.endLineNumberExclusive) {
                return [
                    new LineRange(a.startLineNumber, b.startLineNumber),
                    new LineRange(b.endLineNumberExclusive, a.endLineNumberExclusive)
                ];
            }
            else if (b.startLineNumber <= a.startLineNumber && a.endLineNumberExclusive <= b.endLineNumberExclusive) {
                return [];
            }
            else if (b.endLineNumberExclusive < a.endLineNumberExclusive) {
                return [new LineRange(Math.max(b.endLineNumberExclusive, a.startLineNumber), a.endLineNumberExclusive)];
            }
            else {
                return [new LineRange(a.startLineNumber, Math.min(b.startLineNumber, a.endLineNumberExclusive))];
            }
        }
        /**
         * @param lineRanges An array of sorted line ranges.
         */
        static joinMany(lineRanges) {
            if (lineRanges.length === 0) {
                return [];
            }
            let result = new LineRangeSet(lineRanges[0].slice());
            for (let i = 1; i < lineRanges.length; i++) {
                result = result.getUnion(new LineRangeSet(lineRanges[i].slice()));
            }
            return result.ranges;
        }
        static ofLength(startLineNumber, length) {
            return new LineRange(startLineNumber, startLineNumber + length);
        }
        /**
         * @internal
         */
        static deserialize(lineRange) {
            return new LineRange(lineRange[0], lineRange[1]);
        }
        constructor(startLineNumber, endLineNumberExclusive) {
            if (startLineNumber > endLineNumberExclusive) {
                throw new errors_1.BugIndicatingError(`startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`);
            }
            this.startLineNumber = startLineNumber;
            this.endLineNumberExclusive = endLineNumberExclusive;
        }
        /**
         * Indicates if this line range contains the given line number.
         */
        contains(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
        }
        /**
         * Indicates if this line range is empty.
         */
        get isEmpty() {
            return this.startLineNumber === this.endLineNumberExclusive;
        }
        /**
         * Moves this line range by the given offset of line numbers.
         */
        delta(offset) {
            return new LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
        }
        deltaLength(offset) {
            return new LineRange(this.startLineNumber, this.endLineNumberExclusive + offset);
        }
        /**
         * The number of lines this line range spans.
         */
        get length() {
            return this.endLineNumberExclusive - this.startLineNumber;
        }
        /**
         * Creates a line range that combines this and the given line range.
         */
        join(other) {
            return new LineRange(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive));
        }
        toString() {
            return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
        }
        /**
         * The resulting range is empty if the ranges do not intersect, but touch.
         * If the ranges don't even touch, the result is undefined.
         */
        intersect(other) {
            const startLineNumber = Math.max(this.startLineNumber, other.startLineNumber);
            const endLineNumberExclusive = Math.min(this.endLineNumberExclusive, other.endLineNumberExclusive);
            if (startLineNumber <= endLineNumberExclusive) {
                return new LineRange(startLineNumber, endLineNumberExclusive);
            }
            return undefined;
        }
        intersectsStrict(other) {
            return this.startLineNumber < other.endLineNumberExclusive && other.startLineNumber < this.endLineNumberExclusive;
        }
        overlapOrTouch(other) {
            return this.startLineNumber <= other.endLineNumberExclusive && other.startLineNumber <= this.endLineNumberExclusive;
        }
        equals(b) {
            return this.startLineNumber === b.startLineNumber && this.endLineNumberExclusive === b.endLineNumberExclusive;
        }
        toInclusiveRange() {
            if (this.isEmpty) {
                return null;
            }
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER);
        }
        toExclusiveRange() {
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
        }
        mapToLineArray(f) {
            const result = [];
            for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
                result.push(f(lineNumber));
            }
            return result;
        }
        forEach(f) {
            for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
                f(lineNumber);
            }
        }
        /**
         * @internal
         */
        serialize() {
            return [this.startLineNumber, this.endLineNumberExclusive];
        }
        includes(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
        }
        /**
         * Converts this 1-based line range to a 0-based offset range (subtracts 1!).
         * @internal
         */
        toOffsetRange() {
            return new offsetRange_1.OffsetRange(this.startLineNumber - 1, this.endLineNumberExclusive - 1);
        }
    }
    exports.LineRange = LineRange;
    class LineRangeSet {
        constructor(
        /**
         * Sorted by start line number.
         * No two line ranges are touching or intersecting.
         */
        _normalizedRanges = []) {
            this._normalizedRanges = _normalizedRanges;
        }
        get ranges() {
            return this._normalizedRanges;
        }
        addRange(range) {
            if (range.length === 0) {
                return;
            }
            // Idea: Find joinRange such that:
            // replaceRange = _normalizedRanges.replaceRange(joinRange, range.joinAll(joinRange.map(idx => this._normalizedRanges[idx])))
            // idx of first element that touches range or that is after range
            const joinRangeStartIdx = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(this._normalizedRanges, r => r.endLineNumberExclusive >= range.startLineNumber);
            // idx of element after { last element that touches range or that is before range }
            const joinRangeEndIdxExclusive = (0, arraysFind_1.findLastIdxMonotonous)(this._normalizedRanges, r => r.startLineNumber <= range.endLineNumberExclusive) + 1;
            if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
                // If there is no element that touches range, then joinRangeStartIdx === joinRangeEndIdxExclusive and that value is the index of the element after range
                this._normalizedRanges.splice(joinRangeStartIdx, 0, range);
            }
            else if (joinRangeStartIdx === joinRangeEndIdxExclusive - 1) {
                // Else, there is an element that touches range and in this case it is both the first and last element. Thus we can replace it
                const joinRange = this._normalizedRanges[joinRangeStartIdx];
                this._normalizedRanges[joinRangeStartIdx] = joinRange.join(range);
            }
            else {
                // First and last element are different - we need to replace the entire range
                const joinRange = this._normalizedRanges[joinRangeStartIdx].join(this._normalizedRanges[joinRangeEndIdxExclusive - 1]).join(range);
                this._normalizedRanges.splice(joinRangeStartIdx, joinRangeEndIdxExclusive - joinRangeStartIdx, joinRange);
            }
        }
        contains(lineNumber) {
            const rangeThatStartsBeforeEnd = (0, arraysFind_1.findLastMonotonous)(this._normalizedRanges, r => r.startLineNumber <= lineNumber);
            return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > lineNumber;
        }
        intersects(range) {
            const rangeThatStartsBeforeEnd = (0, arraysFind_1.findLastMonotonous)(this._normalizedRanges, r => r.startLineNumber < range.endLineNumberExclusive);
            return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > range.startLineNumber;
        }
        getUnion(other) {
            if (this._normalizedRanges.length === 0) {
                return other;
            }
            if (other._normalizedRanges.length === 0) {
                return this;
            }
            const result = [];
            let i1 = 0;
            let i2 = 0;
            let current = null;
            while (i1 < this._normalizedRanges.length || i2 < other._normalizedRanges.length) {
                let next = null;
                if (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
                    const lineRange1 = this._normalizedRanges[i1];
                    const lineRange2 = other._normalizedRanges[i2];
                    if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
                        next = lineRange1;
                        i1++;
                    }
                    else {
                        next = lineRange2;
                        i2++;
                    }
                }
                else if (i1 < this._normalizedRanges.length) {
                    next = this._normalizedRanges[i1];
                    i1++;
                }
                else {
                    next = other._normalizedRanges[i2];
                    i2++;
                }
                if (current === null) {
                    current = next;
                }
                else {
                    if (current.endLineNumberExclusive >= next.startLineNumber) {
                        // merge
                        current = new LineRange(current.startLineNumber, Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive));
                    }
                    else {
                        // push
                        result.push(current);
                        current = next;
                    }
                }
            }
            if (current !== null) {
                result.push(current);
            }
            return new LineRangeSet(result);
        }
        /**
         * Subtracts all ranges in this set from `range` and returns the result.
         */
        subtractFrom(range) {
            // idx of first element that touches range or that is after range
            const joinRangeStartIdx = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(this._normalizedRanges, r => r.endLineNumberExclusive >= range.startLineNumber);
            // idx of element after { last element that touches range or that is before range }
            const joinRangeEndIdxExclusive = (0, arraysFind_1.findLastIdxMonotonous)(this._normalizedRanges, r => r.startLineNumber <= range.endLineNumberExclusive) + 1;
            if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
                return new LineRangeSet([range]);
            }
            const result = [];
            let startLineNumber = range.startLineNumber;
            for (let i = joinRangeStartIdx; i < joinRangeEndIdxExclusive; i++) {
                const r = this._normalizedRanges[i];
                if (r.startLineNumber > startLineNumber) {
                    result.push(new LineRange(startLineNumber, r.startLineNumber));
                }
                startLineNumber = r.endLineNumberExclusive;
            }
            if (startLineNumber < range.endLineNumberExclusive) {
                result.push(new LineRange(startLineNumber, range.endLineNumberExclusive));
            }
            return new LineRangeSet(result);
        }
        toString() {
            return this._normalizedRanges.map(r => r.toString()).join(', ');
        }
        getIntersection(other) {
            const result = [];
            let i1 = 0;
            let i2 = 0;
            while (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
                const r1 = this._normalizedRanges[i1];
                const r2 = other._normalizedRanges[i2];
                const i = r1.intersect(r2);
                if (i && !i.isEmpty) {
                    result.push(i);
                }
                if (r1.endLineNumberExclusive < r2.endLineNumberExclusive) {
                    i1++;
                }
                else {
                    i2++;
                }
            }
            return new LineRangeSet(result);
        }
        getWithDelta(value) {
            return new LineRangeSet(this._normalizedRanges.map(r => r.delta(value)));
        }
    }
    exports.LineRangeSet = LineRangeSet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVJhbmdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb3JlL2xpbmVSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7O09BRUc7SUFDSCxNQUFhLFNBQVM7UUFDZCxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQVk7WUFDbkMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFZLEVBQUUsQ0FBd0I7WUFDNUQsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDUCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDWDtZQUNELElBQUksQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2pHLE9BQU87b0JBQ04sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDO29CQUNuRCxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDO2lCQUNqRSxDQUFDO2FBQ0Y7aUJBQU0sSUFBSSxDQUFDLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLHNCQUFzQixJQUFJLENBQUMsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDMUcsT0FBTyxFQUFFLENBQUM7YUFDVjtpQkFBTSxJQUFJLENBQUMsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsc0JBQXNCLEVBQUU7Z0JBQy9ELE9BQU8sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FB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