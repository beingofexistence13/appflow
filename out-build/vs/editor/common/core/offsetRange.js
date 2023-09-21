/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ss = exports.$rs = void 0;
    /**
     * A range of offsets (0-based).
    */
    class $rs {
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
                sortedRanges.splice(i, j - i, new $rs(start, end));
            }
        }
        static tryCreate(start, endExclusive) {
            if (start > endExclusive) {
                return undefined;
            }
            return new $rs(start, endExclusive);
        }
        static ofLength(length) {
            return new $rs(0, length);
        }
        constructor(start, endExclusive) {
            this.start = start;
            this.endExclusive = endExclusive;
            if (start > endExclusive) {
                throw new errors_1.$ab(`Invalid range: ${this.toString()}`);
            }
        }
        get isEmpty() {
            return this.start === this.endExclusive;
        }
        delta(offset) {
            return new $rs(this.start + offset, this.endExclusive + offset);
        }
        deltaStart(offset) {
            return new $rs(this.start + offset, this.endExclusive);
        }
        deltaEnd(offset) {
            return new $rs(this.start, this.endExclusive + offset);
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
            return new $rs(Math.min(this.start, other.start), Math.max(this.endExclusive, other.endExclusive));
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
                return new $rs(start, end);
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
                throw new errors_1.$ab(`Invalid clipping range: ${this.toString()}`);
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
                throw new errors_1.$ab(`Invalid clipping range: ${this.toString()}`);
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
    exports.$rs = $rs;
    class $ss {
        constructor() {
            this.a = [];
        }
        addRange(range) {
            let i = 0;
            while (i < this.a.length && this.a[i].endExclusive < range.start) {
                i++;
            }
            let j = i;
            while (j < this.a.length && this.a[j].start <= range.endExclusive) {
                j++;
            }
            if (i === j) {
                this.a.splice(i, 0, range);
            }
            else {
                const start = Math.min(range.start, this.a[i].start);
                const end = Math.max(range.endExclusive, this.a[j - 1].endExclusive);
                this.a.splice(i, j - i, new $rs(start, end));
            }
        }
        toString() {
            return this.a.map(r => r.toString()).join(', ');
        }
        /**
         * Returns of there is a value that is contained in this instance and the given range.
         */
        intersectsStrict(other) {
            // TODO use binary search
            let i = 0;
            while (i < this.a.length && this.a[i].endExclusive <= other.start) {
                i++;
            }
            return i < this.a.length && this.a[i].start < other.endExclusive;
        }
        intersectWithRange(other) {
            // TODO use binary search + slice
            const result = new $ss();
            for (const range of this.a) {
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
            return this.a.reduce((prev, cur) => prev + cur.length, 0);
        }
    }
    exports.$ss = $ss;
});
//# sourceMappingURL=offsetRange.js.map