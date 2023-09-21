/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldingRegion = exports.FoldingRegions = exports.MAX_LINE_NUMBER = exports.MAX_FOLDING_REGIONS = exports.foldSourceAbbr = exports.FoldSource = void 0;
    var FoldSource;
    (function (FoldSource) {
        FoldSource[FoldSource["provider"] = 0] = "provider";
        FoldSource[FoldSource["userDefined"] = 1] = "userDefined";
        FoldSource[FoldSource["recovered"] = 2] = "recovered";
    })(FoldSource || (exports.FoldSource = FoldSource = {}));
    exports.foldSourceAbbr = {
        [0 /* FoldSource.provider */]: ' ',
        [1 /* FoldSource.userDefined */]: 'u',
        [2 /* FoldSource.recovered */]: 'r',
    };
    exports.MAX_FOLDING_REGIONS = 0xFFFF;
    exports.MAX_LINE_NUMBER = 0xFFFFFF;
    const MASK_INDENT = 0xFF000000;
    class BitField {
        constructor(size) {
            const numWords = Math.ceil(size / 32);
            this._states = new Uint32Array(numWords);
        }
        get(index) {
            const arrayIndex = (index / 32) | 0;
            const bit = index % 32;
            return (this._states[arrayIndex] & (1 << bit)) !== 0;
        }
        set(index, newState) {
            const arrayIndex = (index / 32) | 0;
            const bit = index % 32;
            const value = this._states[arrayIndex];
            if (newState) {
                this._states[arrayIndex] = value | (1 << bit);
            }
            else {
                this._states[arrayIndex] = value & ~(1 << bit);
            }
        }
    }
    class FoldingRegions {
        constructor(startIndexes, endIndexes, types) {
            if (startIndexes.length !== endIndexes.length || startIndexes.length > exports.MAX_FOLDING_REGIONS) {
                throw new Error('invalid startIndexes or endIndexes size');
            }
            this._startIndexes = startIndexes;
            this._endIndexes = endIndexes;
            this._collapseStates = new BitField(startIndexes.length);
            this._userDefinedStates = new BitField(startIndexes.length);
            this._recoveredStates = new BitField(startIndexes.length);
            this._types = types;
            this._parentsComputed = false;
        }
        ensureParentIndices() {
            if (!this._parentsComputed) {
                this._parentsComputed = true;
                const parentIndexes = [];
                const isInsideLast = (startLineNumber, endLineNumber) => {
                    const index = parentIndexes[parentIndexes.length - 1];
                    return this.getStartLineNumber(index) <= startLineNumber && this.getEndLineNumber(index) >= endLineNumber;
                };
                for (let i = 0, len = this._startIndexes.length; i < len; i++) {
                    const startLineNumber = this._startIndexes[i];
                    const endLineNumber = this._endIndexes[i];
                    if (startLineNumber > exports.MAX_LINE_NUMBER || endLineNumber > exports.MAX_LINE_NUMBER) {
                        throw new Error('startLineNumber or endLineNumber must not exceed ' + exports.MAX_LINE_NUMBER);
                    }
                    while (parentIndexes.length > 0 && !isInsideLast(startLineNumber, endLineNumber)) {
                        parentIndexes.pop();
                    }
                    const parentIndex = parentIndexes.length > 0 ? parentIndexes[parentIndexes.length - 1] : -1;
                    parentIndexes.push(i);
                    this._startIndexes[i] = startLineNumber + ((parentIndex & 0xFF) << 24);
                    this._endIndexes[i] = endLineNumber + ((parentIndex & 0xFF00) << 16);
                }
            }
        }
        get length() {
            return this._startIndexes.length;
        }
        getStartLineNumber(index) {
            return this._startIndexes[index] & exports.MAX_LINE_NUMBER;
        }
        getEndLineNumber(index) {
            return this._endIndexes[index] & exports.MAX_LINE_NUMBER;
        }
        getType(index) {
            return this._types ? this._types[index] : undefined;
        }
        hasTypes() {
            return !!this._types;
        }
        isCollapsed(index) {
            return this._collapseStates.get(index);
        }
        setCollapsed(index, newState) {
            this._collapseStates.set(index, newState);
        }
        isUserDefined(index) {
            return this._userDefinedStates.get(index);
        }
        setUserDefined(index, newState) {
            return this._userDefinedStates.set(index, newState);
        }
        isRecovered(index) {
            return this._recoveredStates.get(index);
        }
        setRecovered(index, newState) {
            return this._recoveredStates.set(index, newState);
        }
        getSource(index) {
            if (this.isUserDefined(index)) {
                return 1 /* FoldSource.userDefined */;
            }
            else if (this.isRecovered(index)) {
                return 2 /* FoldSource.recovered */;
            }
            return 0 /* FoldSource.provider */;
        }
        setSource(index, source) {
            if (source === 1 /* FoldSource.userDefined */) {
                this.setUserDefined(index, true);
                this.setRecovered(index, false);
            }
            else if (source === 2 /* FoldSource.recovered */) {
                this.setUserDefined(index, false);
                this.setRecovered(index, true);
            }
            else {
                this.setUserDefined(index, false);
                this.setRecovered(index, false);
            }
        }
        setCollapsedAllOfType(type, newState) {
            let hasChanged = false;
            if (this._types) {
                for (let i = 0; i < this._types.length; i++) {
                    if (this._types[i] === type) {
                        this.setCollapsed(i, newState);
                        hasChanged = true;
                    }
                }
            }
            return hasChanged;
        }
        toRegion(index) {
            return new FoldingRegion(this, index);
        }
        getParentIndex(index) {
            this.ensureParentIndices();
            const parent = ((this._startIndexes[index] & MASK_INDENT) >>> 24) + ((this._endIndexes[index] & MASK_INDENT) >>> 16);
            if (parent === exports.MAX_FOLDING_REGIONS) {
                return -1;
            }
            return parent;
        }
        contains(index, line) {
            return this.getStartLineNumber(index) <= line && this.getEndLineNumber(index) >= line;
        }
        findIndex(line) {
            let low = 0, high = this._startIndexes.length;
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
            let index = this.findIndex(line);
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
                res[i] = `[${exports.foldSourceAbbr[this.getSource(i)]}${this.isCollapsed(i) ? '+' : '-'}] ${this.getStartLineNumber(i)}/${this.getEndLineNumber(i)}`;
            }
            return res.join(', ');
        }
        toFoldRange(index) {
            return {
                startLineNumber: this._startIndexes[index] & exports.MAX_LINE_NUMBER,
                endLineNumber: this._endIndexes[index] & exports.MAX_LINE_NUMBER,
                type: this._types ? this._types[index] : undefined,
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
            const regions = new FoldingRegions(startIndexes, endIndexes, types);
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
    exports.FoldingRegions = FoldingRegions;
    class FoldingRegion {
        constructor(ranges, index) {
            this.ranges = ranges;
            this.index = index;
        }
        get startLineNumber() {
            return this.ranges.getStartLineNumber(this.index);
        }
        get endLineNumber() {
            return this.ranges.getEndLineNumber(this.index);
        }
        get regionIndex() {
            return this.index;
        }
        get parentIndex() {
            return this.ranges.getParentIndex(this.index);
        }
        get isCollapsed() {
            return this.ranges.isCollapsed(this.index);
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
    exports.FoldingRegion = FoldingRegion;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ1Jhbmdlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZvbGRpbmcvYnJvd3Nlci9mb2xkaW5nUmFuZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxJQUFrQixVQUlqQjtJQUpELFdBQWtCLFVBQVU7UUFDM0IsbURBQVksQ0FBQTtRQUNaLHlEQUFlLENBQUE7UUFDZixxREFBYSxDQUFBO0lBQ2QsQ0FBQyxFQUppQixVQUFVLDBCQUFWLFVBQVUsUUFJM0I7SUFFWSxRQUFBLGNBQWMsR0FBRztRQUM3Qiw2QkFBcUIsRUFBRSxHQUFHO1FBQzFCLGdDQUF3QixFQUFFLEdBQUc7UUFDN0IsOEJBQXNCLEVBQUUsR0FBRztLQUMzQixDQUFDO0lBVVcsUUFBQSxtQkFBbUIsR0FBRyxNQUFNLENBQUM7SUFDN0IsUUFBQSxlQUFlLEdBQUcsUUFBUSxDQUFDO0lBRXhDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUUvQixNQUFNLFFBQVE7UUFFYixZQUFZLElBQVk7WUFDdkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU0sR0FBRyxDQUFDLEtBQWE7WUFDdkIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQztR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