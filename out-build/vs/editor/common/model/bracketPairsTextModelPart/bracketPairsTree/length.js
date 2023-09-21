/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, strings_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kt = exports.$Jt = exports.$It = exports.$Ht = exports.$Gt = exports.$Ft = exports.$Et = exports.$Dt = exports.$Ct = exports.$Bt = exports.$At = exports.$zt = exports.$yt = exports.$xt = exports.$wt = exports.$vt = exports.$ut = exports.$tt = exports.$st = exports.$rt = exports.$qt = exports.$pt = exports.$ot = exports.$nt = void 0;
    /**
     * Represents a non-negative length in terms of line and column count.
     * Prefer using {@link Length} for performance reasons.
    */
    class $nt {
        static { this.zero = new $nt(0, 0); }
        static lengthDiffNonNegative(start, end) {
            if (end.isLessThan(start)) {
                return $nt.zero;
            }
            if (start.lineCount === end.lineCount) {
                return new $nt(0, end.columnCount - start.columnCount);
            }
            else {
                return new $nt(end.lineCount - start.lineCount, end.columnCount);
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
            return $rt(this.lineCount, this.columnCount);
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
                return new $nt(this.lineCount, this.columnCount + other.columnCount);
            }
            else {
                return new $nt(this.lineCount + other.lineCount, other.columnCount);
            }
        }
        toString() {
            return `${this.lineCount},${this.columnCount}`;
        }
    }
    exports.$nt = $nt;
    /**
     * The end must be greater than or equal to the start.
    */
    function $ot(startLineCount, startColumnCount, endLineCount, endColumnCount) {
        return (startLineCount !== endLineCount)
            ? $rt(endLineCount - startLineCount, endColumnCount)
            : $rt(0, endColumnCount - startColumnCount);
    }
    exports.$ot = $ot;
    exports.$pt = 0;
    function $qt(length) {
        return length === 0;
    }
    exports.$qt = $qt;
    /*
     * We have 52 bits available in a JS number.
     * We use the upper 26 bits to store the line and the lower 26 bits to store the column.
     */
    ///*
    const factor = 2 ** 26;
    /*/
    const factor = 1000000;
    // */
    function $rt(lineCount, columnCount) {
        // llllllllllllllllllllllllllcccccccccccccccccccccccccc (52 bits)
        //       line count (26 bits)    column count (26 bits)
        // If there is no overflow (all values/sums below 2^26 = 67108864),
        // we have `toLength(lns1, cols1) + toLength(lns2, cols2) = toLength(lns1 + lns2, cols1 + cols2)`.
        return (lineCount * factor + columnCount);
    }
    exports.$rt = $rt;
    function $st(length) {
        const l = length;
        const lineCount = Math.floor(l / factor);
        const columnCount = l - lineCount * factor;
        return new $nt(lineCount, columnCount);
    }
    exports.$st = $st;
    function $tt(length) {
        return Math.floor(length / factor);
    }
    exports.$tt = $tt;
    /**
     * Returns the amount of columns of the given length, assuming that it does not span any line.
    */
    function $ut(length) {
        return length;
    }
    exports.$ut = $ut;
    function $vt(l1, l2) {
        let r = l1 + l2;
        if (l2 >= factor) {
            r = r - (l1 % factor);
        }
        return r;
    }
    exports.$vt = $vt;
    function $wt(items, lengthFn) {
        return items.reduce((a, b) => $vt(a, lengthFn(b)), exports.$pt);
    }
    exports.$wt = $wt;
    function $xt(length1, length2) {
        return length1 === length2;
    }
    exports.$xt = $xt;
    /**
     * Returns a non negative length `result` such that `lengthAdd(length1, result) = length2`, or zero if such length does not exist.
     */
    function $yt(length1, length2) {
        const l1 = length1;
        const l2 = length2;
        const diff = l2 - l1;
        if (diff <= 0) {
            // line-count of length1 is higher than line-count of length2
            // or they are equal and column-count of length1 is higher than column-count of length2
            return exports.$pt;
        }
        const lineCount1 = Math.floor(l1 / factor);
        const lineCount2 = Math.floor(l2 / factor);
        const colCount2 = l2 - lineCount2 * factor;
        if (lineCount1 === lineCount2) {
            const colCount1 = l1 - lineCount1 * factor;
            return $rt(0, colCount2 - colCount1);
        }
        else {
            return $rt(lineCount2 - lineCount1, colCount2);
        }
    }
    exports.$yt = $yt;
    function $zt(length1, length2) {
        // First, compare line counts, then column counts.
        return length1 < length2;
    }
    exports.$zt = $zt;
    function $At(length1, length2) {
        return length1 <= length2;
    }
    exports.$At = $At;
    function $Bt(length1, length2) {
        return length1 >= length2;
    }
    exports.$Bt = $Bt;
    function $Ct(length) {
        const l = length;
        const lineCount = Math.floor(l / factor);
        const colCount = l - lineCount * factor;
        return new position_1.$js(lineCount + 1, colCount + 1);
    }
    exports.$Ct = $Ct;
    function $Dt(position) {
        return $rt(position.lineNumber - 1, position.column - 1);
    }
    exports.$Dt = $Dt;
    function $Et(lengthStart, lengthEnd) {
        const l = lengthStart;
        const lineCount = Math.floor(l / factor);
        const colCount = l - lineCount * factor;
        const l2 = lengthEnd;
        const lineCount2 = Math.floor(l2 / factor);
        const colCount2 = l2 - lineCount2 * factor;
        return new range_1.$ks(lineCount + 1, colCount + 1, lineCount2 + 1, colCount2 + 1);
    }
    exports.$Et = $Et;
    function $Ft(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new $nt(0, range.endColumn - range.startColumn);
        }
        else {
            return new $nt(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
        }
    }
    exports.$Ft = $Ft;
    function $Gt(length1, length2) {
        const l1 = length1;
        const l2 = length2;
        return l1 - l2;
    }
    exports.$Gt = $Gt;
    function $Ht(str) {
        const lines = (0, strings_1.$Ae)(str);
        return $rt(lines.length - 1, lines[lines.length - 1].length);
    }
    exports.$Ht = $Ht;
    function $It(str) {
        const lines = (0, strings_1.$Ae)(str);
        return new $nt(lines.length - 1, lines[lines.length - 1].length);
    }
    exports.$It = $It;
    /**
     * Computes a numeric hash of the given length.
    */
    function $Jt(length) {
        return length;
    }
    exports.$Jt = $Jt;
    function $Kt(length1, length2) {
        return length1 > length2 ? length1 : length2;
    }
    exports.$Kt = $Kt;
});
//# sourceMappingURL=length.js.map