/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SH = exports.$RH = exports.$QH = exports.$PH = exports.$OH = exports.$NH = void 0;
    function $NH(candidate) {
        if (!candidate || typeof candidate !== 'object') {
            return false;
        }
        return typeof candidate.start === 'number'
            && typeof candidate.end === 'number';
    }
    exports.$NH = $NH;
    function $OH(indexes) {
        indexes.sort((a, b) => a - b);
        const first = indexes.shift();
        if (first === undefined) {
            return [];
        }
        return indexes.reduce(function (ranges, num) {
            if (num <= ranges[0][1]) {
                ranges[0][1] = num + 1;
            }
            else {
                ranges.unshift([num, num + 1]);
            }
            return ranges;
        }, [[first, first + 1]]).reverse().map(val => ({ start: val[0], end: val[1] }));
    }
    exports.$OH = $OH;
    function $PH(ranges) {
        const indexes = ranges.reduce((a, b) => {
            for (let i = b.start; i < b.end; i++) {
                a.push(i);
            }
            return a;
        }, []);
        return indexes;
    }
    exports.$PH = $PH;
    function $QH(ranges) {
        const sorted = ranges.sort((a, b) => a.start - b.start);
        const first = sorted[0];
        if (!first) {
            return [];
        }
        return sorted.reduce((prev, curr) => {
            const last = prev[prev.length - 1];
            if (last.end >= curr.start) {
                last.end = Math.max(last.end, curr.end);
            }
            else {
                prev.push(curr);
            }
            return prev;
        }, [first]);
    }
    exports.$QH = $QH;
    function $RH(a, b) {
        a = $QH(a);
        b = $QH(b);
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
                return false;
            }
        }
        return true;
    }
    exports.$RH = $RH;
    /**
     * todo@rebornix test and sort
     * @param range
     * @param other
     * @returns
     */
    function $SH(range, other) {
        return other.start >= range.start && other.end <= range.end;
    }
    exports.$SH = $SH;
});
//# sourceMappingURL=notebookRange.js.map