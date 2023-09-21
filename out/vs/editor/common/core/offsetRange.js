/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OffsetRangeSet = exports.OffsetRange = void 0;
    /**
     * A range of offsets (0-based).
    */
    class OffsetRange {
        static addRange(range, sortedRanges) {
            let i = 0;
            while (i < sortedRanges.length && sortedRanges[i].endExclusive < range.start) {
                i++;
            }
            let j = i;
            while (j < sortedRanges.length && sortedRanges[j].start <= range.endExclusive) {
                j++;
            }
            if (i === j) {
                sortedRanges.splice(i, 0, range);
            }
            else {
                const start = Math.min(range.start, sortedRanges[i].start);
                const end = Math.max(range.endExclusive, sortedRanges[j - 1].endExclusive);
                sortedRanges.splice(i, j - i, new OffsetRange(start, end));
            }
        }
        static tryCreate(start, endExclusive) {
            if (start > endExclusive) {
                return undefined;
            }
            return new OffsetRange(start, endExclusive);
        }
        static ofLength(length) {
            return new OffsetRange(0, length);
        }
        constructor(start, endExclusive) {
            this.start = start;
            this.endExclusive = endExclusive;
            if (start > endExclusive) {
                throw new errors_1.BugIndicatingError(`Invalid range: ${this.toString()}`);
            }
        }
        get isEmpty() {
            return this.start === this.endExclusive;
        }
        delta(offset) {
            return new OffsetRange(this.start + offset, this.endExclusive + offset);
        }
        deltaStart(offset) {
            return new OffsetRange(this.start + offset, this.endExclusive);
        }
        deltaEnd(offset) {
            return new OffsetRange(this.start, this.endExclusive + offset);
        }
        get length() {
            return this.endExclusive - this.start;
        }
        toString() {
            return `[${this.start}, ${this.endExclusive})`;
        }
        equals(other) {
            return this.start === other.start && this.endExclusive === other.endExclusive;
        }
        containsRange(other) {
            return this.start <= other.start && other.endExclusive <= this.endExclusive;
        }
        contains(offset) {
            return this.start <= offset && offset < this.endExclusive;
        }
        /**
         * for all numbers n: range1.contains(n) or range2.contains(n) => range1.join(range2).contains(n)
         * The joined range is the smallest range that contains both ranges.
         */
        join(other) {
            return new OffsetRange(Math.min(this.start, other.start), Math.max(this.endExclusive, other.endExclusive));
        }
        /**
         * for all numbers n: range1.contains(n) and range2.contains(n) <=> range1.intersect(range2).contains(n)
         *
         * The resulting range is empty if the ranges do not intersect, but touch.
         * If the ranges don't even touch, the result is undefined.
         */
        intersect(other) {
            const start = Math.max(this.start, other.start);
            const end = Math.min(this.endExclusive, other.endExclusive);
            if (start <= end) {
                return new OffsetRange(start, end);
            }
            return undefined;
        }
        intersectsOrTouches(other) {
            const start = Math.max(this.start, other.start);
            const end = Math.min(this.endExclusive, other.endExclusive);
            return start <= end;
        }
        slice(arr) {
            return arr.slice(this.start, this.endExclusive);
        }
        /**
         * Returns the given value if it is contained in this instance, otherwise the closest value that is contained.
         * The range must not be empty.
         */
        clip(value) {
            if (this.isEmpty) {
                throw new errors_1.BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
            }
            return Math.max(this.start, Math.min(this.endExclusive - 1, value));
        }
        /**
         * Returns `r := value + k * length` such that `r` is contained in this range.
         * The range must not be empty.
         *
         * E.g. `[5, 10).clipCyclic(10) === 5`, `[5, 10).clipCyclic(11) === 6` and `[5, 10).clipCyclic(4) === 9`.
         */
        clipCyclic(value) {
            if (this.isEmpty) {
                throw new errors_1.BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
            }
            if (value < this.start) {
                return this.endExclusive - ((this.start - value) % this.length);
            }
            if (value >= this.endExclusive) {
                return this.start + ((value - this.start) % this.length);
            }
            return value;
        }
        map(f) {
            const result = [];
            for (let i = this.start; i < this.endExclusive; i++) {
                result.push(f(i));
            }
            return result;
        }
        forEach(f) {
            for (let i = this.start; i < this.endExclusive; i++) {
                f(i);
            }
        }
    }
    exports.OffsetRange = OffsetRange;
    class OffsetRangeSet {
        constructor() {
            this._sortedRanges = [];
        }
        addRange(range) {
            let i = 0;
            while (i < this._sortedRanges.length && this._sortedRanges[i].endExclusive < range.start) {
                i++;
            }
            let j = i;
            while (j < this._sortedRanges.length && this._sortedRanges[j].start <= range.endExclusive) {
                j++;
            }
            if (i === j) {
                this._sortedRanges.splice(i, 0, range);
            }
            else {
                const start = Math.min(range.start, this._sortedRanges[i].start);
                const end = Math.max(range.endExclusive, this._sortedRanges[j - 1].endExclusive);
                this._sortedRanges.splice(i, j - i, new OffsetRange(start, end));
            }
        }
        toString() {
            return this._sortedRanges.map(r => r.toString()).join(', ');
        }
        /**
         * Returns of there is a value that is contained in this instance and the given range.
         */
        intersectsStrict(other) {
            // TODO use binary search
            let i = 0;
            while (i < this._sortedRanges.length && this._sortedRanges[i].endExclusive <= other.start) {
                i++;
            }
            return i < this._sortedRanges.length && this._sortedRanges[i].start < other.endExclusive;
        }
        intersectWithRange(other) {
            // TODO use binary search + slice
            const result = new OffsetRangeSet();
            for (const range of this._sortedRanges) {
                const intersection = range.intersect(other);
                if (intersection) {
                    result.addRange(intersection);
                }
            }
            return result;
        }
        intersectWithRangeLength(other) {
            return this.intersectWithRange(other).length;
        }
        get length() {
            return this._sortedRanges.reduce((prev, cur) => prev + cur.length, 0);
        }
    }
    exports.OffsetRangeSet = OffsetRangeSet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2Zmc2V0UmFuZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2NvcmUvb2Zmc2V0UmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHOztNQUVFO0lBQ0YsTUFBYSxXQUFXO1FBQ2hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBa0IsRUFBRSxZQUEyQjtZQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDN0UsQ0FBQyxFQUFFLENBQUM7YUFDSjtZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNWLE9BQU8sQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFO2dCQUM5RSxDQUFDLEVBQUUsQ0FBQzthQUNKO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNaLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNqQztpQkFBTTtnQkFDTixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDM0UsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVB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