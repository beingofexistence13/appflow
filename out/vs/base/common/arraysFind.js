/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapFindFirst = exports.findMaxIdxBy = exports.findFirstMinBy = exports.findLastMaxBy = exports.findFirstMaxBy = exports.MonotonousArray = exports.findFirstIdxMonotonous = exports.findFirstIdxMonotonousOrArrLen = exports.findFirstMonotonous = exports.findLastIdxMonotonous = exports.findLastMonotonous = exports.findLastIdx = exports.findLast = void 0;
    function findLast(array, predicate, fromIdx) {
        const idx = findLastIdx(array, predicate);
        if (idx === -1) {
            return undefined;
        }
        return array[idx];
    }
    exports.findLast = findLast;
    function findLastIdx(array, predicate, fromIndex = array.length - 1) {
        for (let i = fromIndex; i >= 0; i--) {
            const element = array[i];
            if (predicate(element)) {
                return i;
            }
        }
        return -1;
    }
    exports.findLastIdx = findLastIdx;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `undefined` if no item matches, otherwise the last item that matches the predicate.
     */
    function findLastMonotonous(array, predicate) {
        const idx = findLastIdxMonotonous(array, predicate);
        return idx === -1 ? undefined : array[idx];
    }
    exports.findLastMonotonous = findLastMonotonous;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `startIdx - 1` if predicate is false for all items, otherwise the index of the last item that matches the predicate.
     */
    function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                i = k + 1;
            }
            else {
                j = k;
            }
        }
        return i - 1;
    }
    exports.findLastIdxMonotonous = findLastIdxMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `undefined` if no item matches, otherwise the first item that matches the predicate.
     */
    function findFirstMonotonous(array, predicate) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
        return idx === array.length ? undefined : array[idx];
    }
    exports.findFirstMonotonous = findFirstMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `endIdxEx` if predicate is false for all items, otherwise the index of the first item that matches the predicate.
     */
    function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                j = k;
            }
            else {
                i = k + 1;
            }
        }
        return i;
    }
    exports.findFirstIdxMonotonousOrArrLen = findFirstIdxMonotonousOrArrLen;
    function findFirstIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
        return idx === array.length ? -1 : idx;
    }
    exports.findFirstIdxMonotonous = findFirstIdxMonotonous;
    /**
     * Use this when
     * * You have a sorted array
     * * You query this array with a monotonous predicate to find the last item that has a certain property.
     * * You query this array multiple times with monotonous predicates that get weaker and weaker.
     */
    class MonotonousArray {
        static { this.assertInvariants = false; }
        constructor(_array) {
            this._array = _array;
            this._findLastMonotonousLastIdx = 0;
        }
        /**
         * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
         * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
         */
        findLastMonotonous(predicate) {
            if (MonotonousArray.assertInvariants) {
                if (this._prevFindLastPredicate) {
                    for (const item of this._array) {
                        if (this._prevFindLastPredicate(item) && !predicate(item)) {
                            throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
                        }
                    }
                }
                this._prevFindLastPredicate = predicate;
            }
            const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
            this._findLastMonotonousLastIdx = idx + 1;
            return idx === -1 ? undefined : this._array[idx];
        }
    }
    exports.MonotonousArray = MonotonousArray;
    /**
     * Returns the first item that is equal to or greater than every other item.
    */
    function findFirstMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) > 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findFirstMaxBy = findFirstMaxBy;
    /**
     * Returns the last item that is equal to or greater than every other item.
    */
    function findLastMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) >= 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findLastMaxBy = findLastMaxBy;
    /**
     * Returns the first item that is equal to or less than every other item.
    */
    function findFirstMinBy(array, comparator) {
        return findFirstMaxBy(array, (a, b) => -comparator(a, b));
    }
    exports.findFirstMinBy = findFirstMinBy;
    function findMaxIdxBy(array, comparator) {
        if (array.length === 0) {
            return -1;
        }
        let maxIdx = 0;
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, array[maxIdx]) > 0) {
                maxIdx = i;
            }
        }
        return maxIdx;
    }
    exports.findMaxIdxBy = findMaxIdxBy;
    /**
     * Returns the first mapped value of the array which is not undefined.
     */
    function mapFindFirst(items, mapFn) {
        for (const value of items) {
            const mapped = mapFn(value);
            if (mapped !== undefined) {
                return mapped;
            }
        }
        return undefined;
    }
    exports.mapFindFirst = mapFindFirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlzRmluZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2FycmF5c0ZpbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLFNBQWdCLFFBQVEsQ0FBSSxLQUFtQixFQUFFLFNBQStCLEVBQUUsT0FBZ0I7UUFDakcsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNmLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQU5ELDRCQU1DO0lBRUQsU0FBZ0IsV0FBVyxDQUFJLEtBQW1CLEVBQUUsU0FBK0IsRUFBRSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ2hILEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpCLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN2QixPQUFPLENBQUMsQ0FBQzthQUNUO1NBQ0Q7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQVZELGtDQVVDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixrQkFBa0IsQ0FBSSxLQUFtQixFQUFFLFNBQStCO1FBQ3pGLE1BQU0sR0FBRyxHQUFHLHFCQUFxQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENB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