/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L = exports.$K = exports.$J = exports.$I = void 0;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function $I(data, groupFn) {
        const result = Object.create(null);
        for (const element of data) {
            const key = groupFn(element);
            let target = result[key];
            if (!target) {
                target = result[key] = [];
            }
            target.push(element);
        }
        return result;
    }
    exports.$I = $I;
    function $J(before, after) {
        const removed = [];
        const added = [];
        for (const element of before) {
            if (!after.has(element)) {
                removed.push(element);
            }
        }
        for (const element of after) {
            if (!before.has(element)) {
                added.push(element);
            }
        }
        return { removed, added };
    }
    exports.$J = $J;
    function $K(before, after) {
        const removed = [];
        const added = [];
        for (const [index, value] of before) {
            if (!after.has(index)) {
                removed.push(value);
            }
        }
        for (const [index, value] of after) {
            if (!before.has(index)) {
                added.push(value);
            }
        }
        return { removed, added };
    }
    exports.$K = $K;
    class $L {
        constructor() {
            this.a = new Map();
        }
        add(key, value) {
            let values = this.a.get(key);
            if (!values) {
                values = new Set();
                this.a.set(key, values);
            }
            values.add(value);
        }
        delete(key, value) {
            const values = this.a.get(key);
            if (!values) {
                return;
            }
            values.delete(value);
            if (values.size === 0) {
                this.a.delete(key);
            }
        }
        forEach(key, fn) {
            const values = this.a.get(key);
            if (!values) {
                return;
            }
            values.forEach(fn);
        }
        get(key) {
            const values = this.a.get(key);
            if (!values) {
                return new Set();
            }
            return values;
        }
    }
    exports.$L = $L;
});
//# sourceMappingURL=collections.js.map