/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b8 = exports.$a8 = exports.$_7 = exports.$$7 = exports.$07 = exports.FoldSource = void 0;
    var FoldSource;
    (function (FoldSource) {
        FoldSource[FoldSource["provider"] = 0] = "provider";
        FoldSource[FoldSource["userDefined"] = 1] = "userDefined";
        FoldSource[FoldSource["recovered"] = 2] = "recovered";
    })(FoldSource || (exports.FoldSource = FoldSource = {}));
    exports.$07 = {
        [0 /* FoldSource.provider */]: ' ',
        [1 /* FoldSource.userDefined */]: 'u',
        [2 /* FoldSource.recovered */]: 'r',
    };
    exports.$$7 = 0xFFFF;
    exports.$_7 = 0xFFFFFF;
    const MASK_INDENT = 0xFF000000;
    class BitField {
        constructor(size) {
            const numWords = Math.ceil(size / 32);
            this.a = new Uint32Array(numWords);
        }
        get(index) {
            const arrayIndex = (index / 32) | 0;
            const bit = index % 32;
            return (this.a[arrayIndex] & (1 << bit)) !== 0;
        }
        set(index, newState) {
            const arrayIndex = (index / 32) | 0;
            const bit = index % 32;
            const value = this.a[arrayIndex];
            if (newState) {
                this.a[arrayIndex] = value | (1 << bit);
            }
            else {
                this.a[arrayIndex] = value & ~(1 << bit);
            }
        }
    }
    class $a8 {
        constructor(startIndexes, endIndexes, types) {
            if (startIndexes.length !== endIndexes.length || startIndexes.length > exports.$$7) {
                throw new Error('invalid startIndexes or endIndexes size');
            }
            this.a = startIndexes;
            this.b = endIndexes;
            this.c = new BitField(startIndexes.length);
            this.d = new BitField(startIndexes.length);
            this.e = new BitField(startIndexes.length);
            this.g = types;
            this.f = false;
        }
        h() {
            if (!this.f) {
                this.f = true;
                const parentIndexes = [];
                const isInsideLast = (startLineNumber, endLineNumber) => {
                    const index = parentIndexes[parentIndexes.length - 1];
                    return this.getStartLineNumber(index) <= startLineNumber && this.getEndLineNumber(index) >= endLineNumber;
                };
                for (let i = 0, len = this.a.length; i < len; i++) {
                    const startLineNumber = this.a[i];
                    const endLineNumber = this.b[i];
                    if (startLineNumber > exports.$_7 || endLineNumber > exports.$_7) {
                        throw new Error('startLineNumber or endLineNumber must not exceed ' + exports.$_7);
                    }
                    while (parentIndexes.length > 0 && !isInsideLast(startLineNumber, endLineNumber)) {
                        parentIndexes.pop();
                    }
                    const parentIndex = parentIndexes.length > 0 ? parentIndexes[parentIndexes.length - 1] : -1;
                    parentIndexes.push(i);
                    this.a[i] = startLineNumber + ((parentIndex & 0xFF) << 24);
                    this.b[i] = endLineNumber + ((parentIndex & 0xFF00) << 16);
                }
            }
        }
        get length() {
            return this.a.length;
        }
        getStartLineNumber(index) {
            return this.a[index] & exports.$_7;
        }
        getEndLineNumber(index) {
            return this.b[index] & exports.$_7;
        }
        getType(index) {
            return this.g ? this.g[index] : undefined;
        }
        hasTypes() {
            return !!this.g;
        }
        isCollapsed(index) {
            return this.c.get(index);
        }
        setCollapsed(index, newState) {
            this.c.set(index, newState);
        }
        j(index) {
            return this.d.get(index);
        }
        k(index, newState) {
            return this.d.set(index, newState);
        }
        l(index) {
            return this.e.get(index);
        }
        m(index, newState) {
            return this.e.set(index, newState);
        }
        getSource(index) {
            if (this.j(index)) {
                return 1 /* FoldSource.userDefined */;
            }
            else if (this.l(index)) {
                return 2 /* FoldSource.recovered */;
            }
            return 0 /* FoldSource.provider */;
        }
        setSource(index, source) {
            if (source === 1 /* FoldSource.userDefined */) {
                this.k(index, true);
                this.m(index, false);
            }
            else if (source === 2 /* FoldSource.recovered */) {
                this.k(index, false);
                this.m(index, true);
            }
            else {
                this.k(index, false);
                this.m(index, false);
            }
        }
        setCollapsedAllOfType(type, newState) {
            let hasChanged = false;
            if (this.g) {
                for (let i = 0; i < this.g.length; i++) {
                    if (this.g[i] === type) {
                        this.setCollapsed(i, newState);
                        hasChanged = true;
                    }
                }
            }
            return hasChanged;
        }
        toRegion(index) {
            return new $b8(this, index);
        }
        getParentIndex(index) {
            this.h();
            const parent = ((this.a[index] & MASK_INDENT) >>> 24) + ((this.b[index] & MASK_INDENT) >>> 16);
            if (parent === exports.$$7) {
                return -1;
            }
            return parent;
        }
        contains(index, line) {
            return this.getStartLineNumber(index) <= line && this.getEndLineNumber(index) >= line;
        }
        n(line) {
            let low = 0, high = this.a.length;
            if (high === 0) {
                return -1; // no children
            }
            while (low < high) {
                const mid = Math.floor((low + high) / 2);
                if (line < this.getStartLineNumber(mid)) {
                    high = mid;
                }
                else {
                    low = mid + 1;
                }
            }
            return low - 1;
        }
        findRange(line) {
            let index = this.n(line);
            if (index >= 0) {
                const endLineNumber = this.getEndLineNumber(index);
                if (endLineNumber >= line) {
                    return index;
                }
                index = this.getParentIndex(index);
                while (index !== -1) {
                    if (this.contains(index, line)) {
                        return index;
                    }
                    index = this.getParentIndex(index);
                }
            }
            return -1;
        }
        toString() {
            const res = [];
            for (let i = 0; i < this.length; i++) {
                res[i] = `[${exports.$07[this.getSource(i)]}${this.isCollapsed(i) ? '+' : '-'}] ${this.getStartLineNumber(i)}/${this.getEndLineNumber(i)}`;
            }
            return res.join(', ');
        }
        toFoldRange(index) {
            return {
                startLineNumber: this.a[index] & exports.$_7,
                endLineNumber: this.b[index] & exports.$_7,
                type: this.g ? this.g[index] : undefined,
                isCollapsed: this.isCollapsed(index),
                source: this.getSource(index)
            };
        }
        static fromFoldRanges(ranges) {
            const rangesLength = ranges.length;
            const startIndexes = new Uint32Array(rangesLength);
            const endIndexes = new Uint32Array(rangesLength);
            let types = [];
            let gotTypes = false;
            for (let i = 0; i < rangesLength; i++) {
                const range = ranges[i];
                startIndexes[i] = range.startLineNumber;
                endIndexes[i] = range.endLineNumber;
                types.push(range.type);
                if (range.type) {
                    gotTypes = true;
                }
            }
            if (!gotTypes) {
                types = undefined;
            }
            const regions = new $a8(startIndexes, endIndexes, types);
            for (let i = 0; i < rangesLength; i++) {
                if (ranges[i].isCollapsed) {
                    regions.setCollapsed(i, true);
                }
                regions.setSource(i, ranges[i].source);
            }
            return regions;
        }
        /**
         * Two inputs, each a FoldingRegions or a FoldRange[], are merged.
         * Each input must be pre-sorted on startLineNumber.
         * The first list is assumed to always include all regions currently defined by range providers.
         * The second list only contains the previously collapsed and all manual ranges.
         * If the line position matches, the range of the new range is taken, and the range is no longer manual
         * When an entry in one list overlaps an entry in the other, the second list's entry "wins" and
         * overlapping entries in the first list are discarded.
         * Invalid entries are discarded. An entry is invalid if:
         * 		the start and end line numbers aren't a valid range of line numbers,
         * 		it is out of sequence or has the same start line as a preceding entry,
         * 		it overlaps a preceding entry and is not fully contained by that entry.
         */
        static sanitizeAndMerge(rangesA, rangesB, maxLineNumber) {
            maxLineNumber = maxLineNumber ?? Number.MAX_VALUE;
            const getIndexedFunction = (r, limit) => {
                return Array.isArray(r)
                    ? ((i) => { return (i < limit) ? r[i] : undefined; })
                    : ((i) => { return (i < limit) ? r.toFoldRange(i) : undefined; });
            };
            const getA = getIndexedFunction(rangesA, rangesA.length);
            const getB = getIndexedFunction(rangesB, rangesB.length);
            let indexA = 0;
            let indexB = 0;
            let nextA = getA(0);
            let nextB = getB(0);
            const stackedRanges = [];
            let topStackedRange;
            let prevLineNumber = 0;
            const resultRanges = [];
            while (nextA || nextB) {
                let useRange = undefined;
                if (nextB && (!nextA || nextA.startLineNumber >= nextB.startLineNumber)) {
                    if (nextA && nextA.startLineNumber === nextB.startLineNumber) {
                        if (nextB.source === 1 /* FoldSource.userDefined */) {
                            // a user defined range (possibly unfolded)
                            useRange = nextB;
                        }
                        else {
                            // a previously folded range or a (possibly unfolded) recovered range
                            useRange = nextA;
                            useRange.isCollapsed = nextB.isCollapsed && nextA.endLineNumber === nextB.endLineNumber;
                            useRange.source = 0 /* FoldSource.provider */;
                        }
                        nextA = getA(++indexA); // not necessary, just for speed
                    }
                    else {
                        useRange = nextB;
                        if (nextB.isCollapsed && nextB.source === 0 /* FoldSource.provider */) {
                            // a previously collapsed range
                            useRange.source = 2 /* FoldSource.recovered */;
                        }
                    }
                    nextB = getB(++indexB);
                }
                else {
                    // nextA is next. The user folded B set takes precedence and we sometimes need to look
                    // ahead in it to check for an upcoming conflict.
                    let scanIndex = indexB;
                    let prescanB = nextB;
                    while (true) {
                        if (!prescanB || prescanB.startLineNumber > nextA.endLineNumber) {
                            useRange = nextA;
                            break; // no conflict, use this nextA
                        }
                        if (prescanB.source === 1 /* FoldSource.userDefined */ && prescanB.endLineNumber > nextA.endLineNumber) {
                            // we found a user folded range, it wins
                            break; // without setting nextResult, so this nextA gets skipped
                        }
                        prescanB = getB(++scanIndex);
                    }
                    nextA = getA(++indexA);
                }
                if (useRange) {
                    while (topStackedRange
                        && topStackedRange.endLineNumber < useRange.startLineNumber) {
                        topStackedRange = stackedRanges.pop();
                    }
                    if (useRange.endLineNumber > useRange.startLineNumber
                        && useRange.startLineNumber > prevLineNumber
                        && useRange.endLineNumber <= maxLineNumber
                        && (!topStackedRange
                            || topStackedRange.endLineNumber >= useRange.endLineNumber)) {
                        resultRanges.push(useRange);
                        prevLineNumber = useRange.startLineNumber;
                        if (topStackedRange) {
                            stackedRanges.push(topStackedRange);
                        }
                        topStackedRange = useRange;
                    }
                }
            }
            return resultRanges;
        }
    }
    exports.$a8 = $a8;
    class $b8 {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        get startLineNumber() {
            return this.a.getStartLineNumber(this.b);
        }
        get endLineNumber() {
            return this.a.getEndLineNumber(this.b);
        }
        get regionIndex() {
            return this.b;
        }
        get parentIndex() {
            return this.a.getParentIndex(this.b);
        }
        get isCollapsed() {
            return this.a.isCollapsed(this.b);
        }
        containedBy(range) {
            return range.startLineNumber <= this.startLineNumber && range.endLineNumber >= this.endLineNumber;
        }
        containsLine(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber;
        }
        hidesLine(lineNumber) {
            return this.startLineNumber < lineNumber && lineNumber <= this.endLineNumber;
        }
    }
    exports.$b8 = $b8;
});
//# sourceMappingURL=foldingRanges.js.map