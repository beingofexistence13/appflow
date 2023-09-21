/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/uint"], function (require, exports, arrays_1, uint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lu = exports.$Ku = exports.$Ju = void 0;
    class $Ju {
        constructor(values) {
            this.a = values;
            this.b = new Uint32Array(values.length);
            this.c = new Int32Array(1);
            this.c[0] = -1;
        }
        getCount() {
            return this.a.length;
        }
        insertValues(insertIndex, insertValues) {
            insertIndex = (0, uint_1.$le)(insertIndex);
            const oldValues = this.a;
            const oldPrefixSum = this.b;
            const insertValuesLen = insertValues.length;
            if (insertValuesLen === 0) {
                return false;
            }
            this.a = new Uint32Array(oldValues.length + insertValuesLen);
            this.a.set(oldValues.subarray(0, insertIndex), 0);
            this.a.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
            this.a.set(insertValues, insertIndex);
            if (insertIndex - 1 < this.c[0]) {
                this.c[0] = insertIndex - 1;
            }
            this.b = new Uint32Array(this.a.length);
            if (this.c[0] >= 0) {
                this.b.set(oldPrefixSum.subarray(0, this.c[0] + 1));
            }
            return true;
        }
        setValue(index, value) {
            index = (0, uint_1.$le)(index);
            value = (0, uint_1.$le)(value);
            if (this.a[index] === value) {
                return false;
            }
            this.a[index] = value;
            if (index - 1 < this.c[0]) {
                this.c[0] = index - 1;
            }
            return true;
        }
        removeValues(startIndex, count) {
            startIndex = (0, uint_1.$le)(startIndex);
            count = (0, uint_1.$le)(count);
            const oldValues = this.a;
            const oldPrefixSum = this.b;
            if (startIndex >= oldValues.length) {
                return false;
            }
            const maxCount = oldValues.length - startIndex;
            if (count >= maxCount) {
                count = maxCount;
            }
            if (count === 0) {
                return false;
            }
            this.a = new Uint32Array(oldValues.length - count);
            this.a.set(oldValues.subarray(0, startIndex), 0);
            this.a.set(oldValues.subarray(startIndex + count), startIndex);
            this.b = new Uint32Array(this.a.length);
            if (startIndex - 1 < this.c[0]) {
                this.c[0] = startIndex - 1;
            }
            if (this.c[0] >= 0) {
                this.b.set(oldPrefixSum.subarray(0, this.c[0] + 1));
            }
            return true;
        }
        getTotalSum() {
            if (this.a.length === 0) {
                return 0;
            }
            return this.d(this.a.length - 1);
        }
        /**
         * Returns the sum of the first `index + 1` many items.
         * @returns `SUM(0 <= j <= index, values[j])`.
         */
        getPrefixSum(index) {
            if (index < 0) {
                return 0;
            }
            index = (0, uint_1.$le)(index);
            return this.d(index);
        }
        d(index) {
            if (index <= this.c[0]) {
                return this.b[index];
            }
            let startIndex = this.c[0] + 1;
            if (startIndex === 0) {
                this.b[0] = this.a[0];
                startIndex++;
            }
            if (index >= this.a.length) {
                index = this.a.length - 1;
            }
            for (let i = startIndex; i <= index; i++) {
                this.b[i] = this.b[i - 1] + this.a[i];
            }
            this.c[0] = Math.max(this.c[0], index);
            return this.b[index];
        }
        getIndexOf(sum) {
            sum = Math.floor(sum);
            // Compute all sums (to get a fully valid prefixSum)
            this.getTotalSum();
            let low = 0;
            let high = this.a.length - 1;
            let mid = 0;
            let midStop = 0;
            let midStart = 0;
            while (low <= high) {
                mid = low + ((high - low) / 2) | 0;
                midStop = this.b[mid];
                midStart = midStop - this.a[mid];
                if (sum < midStart) {
                    high = mid - 1;
                }
                else if (sum >= midStop) {
                    low = mid + 1;
                }
                else {
                    break;
                }
            }
            return new $Lu(mid, sum - midStart);
        }
    }
    exports.$Ju = $Ju;
    /**
     * {@link getIndexOf} has an amortized runtime complexity of O(1).
     *
     * ({@link $Ju.getIndexOf} is just  O(log n))
    */
    class $Ku {
        constructor(values) {
            this.a = values;
            this.b = false;
            this.c = -1;
            this.d = [];
            this.e = [];
        }
        /**
         * @returns SUM(0 <= j < values.length, values[j])
         */
        getTotalSum() {
            this.g();
            return this.e.length;
        }
        /**
         * Returns the sum of the first `count` many items.
         * @returns `SUM(0 <= j < count, values[j])`.
         */
        getPrefixSum(count) {
            this.g();
            if (count === 0) {
                return 0;
            }
            return this.d[count - 1];
        }
        /**
         * @returns `result`, such that `getPrefixSum(result.index) + result.remainder = sum`
         */
        getIndexOf(sum) {
            this.g();
            const idx = this.e[sum];
            const viewLinesAbove = idx > 0 ? this.d[idx - 1] : 0;
            return new $Lu(idx, sum - viewLinesAbove);
        }
        removeValues(start, deleteCount) {
            this.a.splice(start, deleteCount);
            this.f(start);
        }
        insertValues(insertIndex, insertArr) {
            this.a = (0, arrays_1.$Ub)(this.a, insertIndex, insertArr);
            this.f(insertIndex);
        }
        f(index) {
            this.b = false;
            this.c = Math.min(this.c, index - 1);
        }
        g() {
            if (this.b) {
                return;
            }
            for (let i = this.c + 1, len = this.a.length; i < len; i++) {
                const value = this.a[i];
                const sumAbove = i > 0 ? this.d[i - 1] : 0;
                this.d[i] = sumAbove + value;
                for (let j = 0; j < value; j++) {
                    this.e[sumAbove + j] = i;
                }
            }
            // trim things
            this.d.length = this.a.length;
            this.e.length = this.d[this.d.length - 1];
            // mark as valid
            this.b = true;
            this.c = this.a.length - 1;
        }
        setValue(index, value) {
            if (this.a[index] === value) {
                // no change
                return;
            }
            this.a[index] = value;
            this.f(index);
        }
    }
    exports.$Ku = $Ku;
    class $Lu {
        constructor(index, remainder) {
            this.index = index;
            this.remainder = remainder;
            this._prefixSumIndexOfResultBrand = undefined;
            this.index = index;
            this.remainder = remainder;
        }
    }
    exports.$Lu = $Lu;
});
//# sourceMappingURL=prefixSumComputer.js.map