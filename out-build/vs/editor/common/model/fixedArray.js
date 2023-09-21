/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays"], function (require, exports, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xC = void 0;
    /**
     * An array that avoids being sparse by always
     * filling up unused indices with a default value.
     */
    class $xC {
        constructor(b) {
            this.b = b;
            this.a = [];
        }
        get(index) {
            if (index < this.a.length) {
                return this.a[index];
            }
            return this.b;
        }
        set(index, value) {
            while (index >= this.a.length) {
                this.a[this.a.length] = this.b;
            }
            this.a[index] = value;
        }
        replace(index, oldLength, newLength) {
            if (index >= this.a.length) {
                return;
            }
            if (oldLength === 0) {
                this.insert(index, newLength);
                return;
            }
            else if (newLength === 0) {
                this.delete(index, oldLength);
                return;
            }
            const before = this.a.slice(0, index);
            const after = this.a.slice(index + oldLength);
            const insertArr = arrayFill(newLength, this.b);
            this.a = before.concat(insertArr, after);
        }
        delete(deleteIndex, deleteCount) {
            if (deleteCount === 0 || deleteIndex >= this.a.length) {
                return;
            }
            this.a.splice(deleteIndex, deleteCount);
        }
        insert(insertIndex, insertCount) {
            if (insertCount === 0 || insertIndex >= this.a.length) {
                return;
            }
            const arr = [];
            for (let i = 0; i < insertCount; i++) {
                arr[i] = this.b;
            }
            this.a = (0, arrays_1.$Ub)(this.a, insertIndex, arr);
        }
    }
    exports.$xC = $xC;
    function arrayFill(length, value) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr[i] = value;
        }
        return arr;
    }
});
//# sourceMappingURL=fixedArray.js.map