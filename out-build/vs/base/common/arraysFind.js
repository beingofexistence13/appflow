/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pb = exports.$ob = exports.$nb = exports.$mb = exports.$lb = exports.$kb = exports.$jb = exports.$ib = exports.$hb = exports.$gb = exports.$fb = exports.$eb = exports.$db = void 0;
    function $db(array, predicate, fromIdx) {
        const idx = $eb(array, predicate);
        if (idx === -1) {
            return undefined;
        }
        return array[idx];
    }
    exports.$db = $db;
    function $eb(array, predicate, fromIndex = array.length - 1) {
        for (let i = fromIndex; i >= 0; i--) {
            const element = array[i];
            if (predicate(element)) {
                return i;
            }
        }
        return -1;
    }
    exports.$eb = $eb;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `undefined` if no item matches, otherwise the last item that matches the predicate.
     */
    function $fb(array, predicate) {
        const idx = $gb(array, predicate);
        return idx === -1 ? undefined : array[idx];
    }
    exports.$fb = $fb;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `startIdx - 1` if predicate is false for all items, otherwise the index of the last item that matches the predicate.
     */
    function $gb(array, predicate, startIdx = 0, endIdxEx = array.length) {
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
    exports.$gb = $gb;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `undefined` if no item matches, otherwise the first item that matches the predicate.
     */
    function $hb(array, predicate) {
        const idx = $ib(array, predicate);
        return idx === array.length ? undefined : array[idx];
    }
    exports.$hb = $hb;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `endIdxEx` if predicate is false for all items, otherwise the index of the first item that matches the predicate.
     */
    function $ib(array, predicate, startIdx = 0, endIdxEx = array.length) {
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
    exports.$ib = $ib;
    function $jb(array, predicate, startIdx = 0, endIdxEx = array.length) {
        const idx = $ib(array, predicate, startIdx, endIdxEx);
        return idx === array.length ? -1 : idx;
    }
    exports.$jb = $jb;
    /**
     * Use this when
     * * You have a sorted array
     * * You query this array with a monotonous predicate to find the last item that has a certain property.
     * * You query this array multiple times with monotonous predicates that get weaker and weaker.
     */
    class $kb {
        static { this.assertInvariants = false; }
        constructor(e) {
            this.e = e;
            this.c = 0;
        }
        /**
         * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
         * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
         */
        findLastMonotonous(predicate) {
            if ($kb.assertInvariants) {
                if (this.d) {
                    for (const item of this.e) {
                        if (this.d(item) && !predicate(item)) {
                            throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
                        }
                    }
                }
                this.d = predicate;
            }
            const idx = $gb(this.e, predicate, this.c);
            this.c = idx + 1;
            return idx === -1 ? undefined : this.e[idx];
        }
    }
    exports.$kb = $kb;
    /**
     * Returns the first item that is equal to or greater than every other item.
    */
    function $lb(array, comparator) {
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
    exports.$lb = $lb;
    /**
     * Returns the last item that is equal to or greater than every other item.
    */
    function $mb(array, comparator) {
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
    exports.$mb = $mb;
    /**
     * Returns the first item that is equal to or less than every other item.
    */
    function $nb(array, comparator) {
        return $lb(array, (a, b) => -comparator(a, b));
    }
    exports.$nb = $nb;
    function $ob(array, comparator) {
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
    exports.$ob = $ob;
    /**
     * Returns the first mapped value of the array which is not undefined.
     */
    function $pb(items, mapFn) {
        for (const value of items) {
            const mapped = mapFn(value);
            if (mapped !== undefined) {
                return mapped;
            }
        }
        return undefined;
    }
    exports.$pb = $pb;
});
//# sourceMappingURL=arraysFind.js.map