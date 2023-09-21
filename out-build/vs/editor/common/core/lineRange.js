/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/core/offsetRange", "vs/editor/common/core/range", "vs/base/common/arraysFind"], function (require, exports, errors_1, offsetRange_1, range_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$us = exports.$ts = void 0;
    /**
     * A range of lines (1-based).
     */
    class $ts {
        static fromRange(range) {
            return new $ts(range.startLineNumber, range.endLineNumber);
        }
        static subtract(a, b) {
            if (!b) {
                return [a];
            }
            if (a.startLineNumber < b.startLineNumber && b.endLineNumberExclusive < a.endLineNumberExclusive) {
                return [
                    new $ts(a.startLineNumber, b.startLineNumber),
                    new $ts(b.endLineNumberExclusive, a.endLineNumberExclusive)
                ];
            }
            else if (b.startLineNumber <= a.startLineNumber && a.endLineNumberExclusive <= b.endLineNumberExclusive) {
                return [];
            }
            else if (b.endLineNumberExclusive < a.endLineNumberExclusive) {
                return [new $ts(Math.max(b.endLineNumberExclusive, a.startLineNumber), a.endLineNumberExclusive)];
            }
            else {
                return [new $ts(a.startLineNumber, Math.min(b.startLineNumber, a.endLineNumberExclusive))];
            }
        }
        /**
         * @param lineRanges An array of sorted line ranges.
         */
        static joinMany(lineRanges) {
            if (lineRanges.length === 0) {
                return [];
            }
            let result = new $us(lineRanges[0].slice());
            for (let i = 1; i < lineRanges.length; i++) {
                result = result.getUnion(new $us(lineRanges[i].slice()));
            }
            return result.ranges;
        }
        static ofLength(startLineNumber, length) {
            return new $ts(startLineNumber, startLineNumber + length);
        }
        /**
         * @internal
         */
        static deserialize(lineRange) {
            return new $ts(lineRange[0], lineRange[1]);
        }
        constructor(startLineNumber, endLineNumberExclusive) {
            if (startLineNumber > endLineNumberExclusive) {
                throw new errors_1.$ab(`startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`);
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
            return new $ts(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
        }
        deltaLength(offset) {
            return new $ts(this.startLineNumber, this.endLineNumberExclusive + offset);
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
            return new $ts(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive));
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
                return new $ts(startLineNumber, endLineNumberExclusive);
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
            return new range_1.$ks(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER);
        }
        toExclusiveRange() {
            return new range_1.$ks(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
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
            return new offsetRange_1.$rs(this.startLineNumber - 1, this.endLineNumberExclusive - 1);
        }
    }
    exports.$ts = $ts;
    class $us {
        constructor(
        /**
         * Sorted by start line number.
         * No two line ranges are touching or intersecting.
         */
        c = []) {
            this.c = c;
        }
        get ranges() {
            return this.c;
        }
        addRange(range) {
            if (range.length === 0) {
                return;
            }
            // Idea: Find joinRange such that:
            // replaceRange = _normalizedRanges.replaceRange(joinRange, range.joinAll(joinRange.map(idx => this._normalizedRanges[idx])))
            // idx of first element that touches range or that is after range
            const joinRangeStartIdx = (0, arraysFind_1.$ib)(this.c, r => r.endLineNumberExclusive >= range.startLineNumber);
            // idx of element after { last element that touches range or that is before range }
            const joinRangeEndIdxExclusive = (0, arraysFind_1.$gb)(this.c, r => r.startLineNumber <= range.endLineNumberExclusive) + 1;
            if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
                // If there is no element that touches range, then joinRangeStartIdx === joinRangeEndIdxExclusive and that value is the index of the element after range
                this.c.splice(joinRangeStartIdx, 0, range);
            }
            else if (joinRangeStartIdx === joinRangeEndIdxExclusive - 1) {
                // Else, there is an element that touches range and in this case it is both the first and last element. Thus we can replace it
                const joinRange = this.c[joinRangeStartIdx];
                this.c[joinRangeStartIdx] = joinRange.join(range);
            }
            else {
                // First and last element are different - we need to replace the entire range
                const joinRange = this.c[joinRangeStartIdx].join(this.c[joinRangeEndIdxExclusive - 1]).join(range);
                this.c.splice(joinRangeStartIdx, joinRangeEndIdxExclusive - joinRangeStartIdx, joinRange);
            }
        }
        contains(lineNumber) {
            const rangeThatStartsBeforeEnd = (0, arraysFind_1.$fb)(this.c, r => r.startLineNumber <= lineNumber);
            return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > lineNumber;
        }
        intersects(range) {
            const rangeThatStartsBeforeEnd = (0, arraysFind_1.$fb)(this.c, r => r.startLineNumber < range.endLineNumberExclusive);
            return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > range.startLineNumber;
        }
        getUnion(other) {
            if (this.c.length === 0) {
                return other;
            }
            if (other.c.length === 0) {
                return this;
            }
            const result = [];
            let i1 = 0;
            let i2 = 0;
            let current = null;
            while (i1 < this.c.length || i2 < other.c.length) {
                let next = null;
                if (i1 < this.c.length && i2 < other.c.length) {
                    const lineRange1 = this.c[i1];
                    const lineRange2 = other.c[i2];
                    if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
                        next = lineRange1;
                        i1++;
                    }
                    else {
                        next = lineRange2;
                        i2++;
                    }
                }
                else if (i1 < this.c.length) {
                    next = this.c[i1];
                    i1++;
                }
                else {
                    next = other.c[i2];
                    i2++;
                }
                if (current === null) {
                    current = next;
                }
                else {
                    if (current.endLineNumberExclusive >= next.startLineNumber) {
                        // merge
                        current = new $ts(current.startLineNumber, Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive));
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
            return new $us(result);
        }
        /**
         * Subtracts all ranges in this set from `range` and returns the result.
         */
        subtractFrom(range) {
            // idx of first element that touches range or that is after range
            const joinRangeStartIdx = (0, arraysFind_1.$ib)(this.c, r => r.endLineNumberExclusive >= range.startLineNumber);
            // idx of element after { last element that touches range or that is before range }
            const joinRangeEndIdxExclusive = (0, arraysFind_1.$gb)(this.c, r => r.startLineNumber <= range.endLineNumberExclusive) + 1;
            if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
                return new $us([range]);
            }
            const result = [];
            let startLineNumber = range.startLineNumber;
            for (let i = joinRangeStartIdx; i < joinRangeEndIdxExclusive; i++) {
                const r = this.c[i];
                if (r.startLineNumber > startLineNumber) {
                    result.push(new $ts(startLineNumber, r.startLineNumber));
                }
                startLineNumber = r.endLineNumberExclusive;
            }
            if (startLineNumber < range.endLineNumberExclusive) {
                result.push(new $ts(startLineNumber, range.endLineNumberExclusive));
            }
            return new $us(result);
        }
        toString() {
            return this.c.map(r => r.toString()).join(', ');
        }
        getIntersection(other) {
            const result = [];
            let i1 = 0;
            let i2 = 0;
            while (i1 < this.c.length && i2 < other.c.length) {
                const r1 = this.c[i1];
                const r2 = other.c[i2];
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
            return new $us(result);
        }
        getWithDelta(value) {
            return new $us(this.c.map(r => r.delta(value)));
        }
    }
    exports.$us = $us;
});
//# sourceMappingURL=lineRange.js.map