/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types"], function (require, exports, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7m = exports.$6m = exports.$5m = exports.$4m = exports.$3m = exports.$2m = exports.$1m = exports.$Zm = exports.$Ym = exports.$Xm = exports.$Wm = exports.$Vm = void 0;
    function $Vm(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof RegExp) {
            return obj;
        }
        const result = Array.isArray(obj) ? [] : {};
        Object.entries(obj).forEach(([key, value]) => {
            result[key] = value && typeof value === 'object' ? $Vm(value) : value;
        });
        return result;
    }
    exports.$Vm = $Vm;
    function $Wm(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        const stack = [obj];
        while (stack.length > 0) {
            const obj = stack.shift();
            Object.freeze(obj);
            for (const key in obj) {
                if (_hasOwnProperty.call(obj, key)) {
                    const prop = obj[key];
                    if (typeof prop === 'object' && !Object.isFrozen(prop) && !(0, types_1.$mf)(prop)) {
                        stack.push(prop);
                    }
                }
            }
        }
        return obj;
    }
    exports.$Wm = $Wm;
    const _hasOwnProperty = Object.prototype.hasOwnProperty;
    function $Xm(obj, changer) {
        return _cloneAndChange(obj, changer, new Set());
    }
    exports.$Xm = $Xm;
    function _cloneAndChange(obj, changer, seen) {
        if ((0, types_1.$sf)(obj)) {
            return obj;
        }
        const changed = changer(obj);
        if (typeof changed !== 'undefined') {
            return changed;
        }
        if (Array.isArray(obj)) {
            const r1 = [];
            for (const e of obj) {
                r1.push(_cloneAndChange(e, changer, seen));
            }
            return r1;
        }
        if ((0, types_1.$lf)(obj)) {
            if (seen.has(obj)) {
                throw new Error('Cannot clone recursive data-structure');
            }
            seen.add(obj);
            const r2 = {};
            for (const i2 in obj) {
                if (_hasOwnProperty.call(obj, i2)) {
                    r2[i2] = _cloneAndChange(obj[i2], changer, seen);
                }
            }
            seen.delete(obj);
            return r2;
        }
        return obj;
    }
    /**
     * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
     * if existing properties on the destination should be overwritten or not. Defaults to true (overwrite).
     */
    function $Ym(destination, source, overwrite = true) {
        if (!(0, types_1.$lf)(destination)) {
            return source;
        }
        if ((0, types_1.$lf)(source)) {
            Object.keys(source).forEach(key => {
                if (key in destination) {
                    if (overwrite) {
                        if ((0, types_1.$lf)(destination[key]) && (0, types_1.$lf)(source[key])) {
                            $Ym(destination[key], source[key], overwrite);
                        }
                        else {
                            destination[key] = source[key];
                        }
                    }
                }
                else {
                    destination[key] = source[key];
                }
            });
        }
        return destination;
    }
    exports.$Ym = $Ym;
    function $Zm(one, other) {
        if (one === other) {
            return true;
        }
        if (one === null || one === undefined || other === null || other === undefined) {
            return false;
        }
        if (typeof one !== typeof other) {
            return false;
        }
        if (typeof one !== 'object') {
            return false;
        }
        if ((Array.isArray(one)) !== (Array.isArray(other))) {
            return false;
        }
        let i;
        let key;
        if (Array.isArray(one)) {
            if (one.length !== other.length) {
                return false;
            }
            for (i = 0; i < one.length; i++) {
                if (!$Zm(one[i], other[i])) {
                    return false;
                }
            }
        }
        else {
            const oneKeys = [];
            for (key in one) {
                oneKeys.push(key);
            }
            oneKeys.sort();
            const otherKeys = [];
            for (key in other) {
                otherKeys.push(key);
            }
            otherKeys.sort();
            if (!$Zm(oneKeys, otherKeys)) {
                return false;
            }
            for (i = 0; i < oneKeys.length; i++) {
                if (!$Zm(one[oneKeys[i]], other[oneKeys[i]])) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.$Zm = $Zm;
    /**
     * Calls `JSON.Stringify` with a replacer to break apart any circular references.
     * This prevents `JSON`.stringify` from throwing the exception
     *  "Uncaught TypeError: Converting circular structure to JSON"
     */
    function $1m(obj) {
        const seen = new Set();
        return JSON.stringify(obj, (key, value) => {
            if ((0, types_1.$lf)(value) || Array.isArray(value)) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                else {
                    seen.add(value);
                }
            }
            return value;
        });
    }
    exports.$1m = $1m;
    /**
     * Returns an object that has keys for each value that is different in the base object. Keys
     * that do not exist in the target but in the base object are not considered.
     *
     * Note: This is not a deep-diffing method, so the values are strictly taken into the resulting
     * object if they differ.
     *
     * @param base the object to diff against
     * @param obj the object to use for diffing
     */
    function $2m(base, target) {
        const result = Object.create(null);
        if (!base || !target) {
            return result;
        }
        const targetKeys = Object.keys(target);
        targetKeys.forEach(k => {
            const baseValue = base[k];
            const targetValue = target[k];
            if (!$Zm(baseValue, targetValue)) {
                result[k] = targetValue;
            }
        });
        return result;
    }
    exports.$2m = $2m;
    function $3m(target, key) {
        const lowercaseKey = key.toLowerCase();
        const equivalentKey = Object.keys(target).find(k => k.toLowerCase() === lowercaseKey);
        return equivalentKey ? target[equivalentKey] : target[key];
    }
    exports.$3m = $3m;
    function $4m(obj, predicate) {
        const result = Object.create(null);
        for (const [key, value] of Object.entries(obj)) {
            if (predicate(key, value)) {
                result[key] = value;
            }
        }
        return result;
    }
    exports.$4m = $4m;
    function $5m(obj) {
        let res = [];
        while (Object.prototype !== obj) {
            res = res.concat(Object.getOwnPropertyNames(obj));
            obj = Object.getPrototypeOf(obj);
        }
        return res;
    }
    exports.$5m = $5m;
    function $6m(obj) {
        const methods = [];
        for (const prop of $5m(obj)) {
            if (typeof obj[prop] === 'function') {
                methods.push(prop);
            }
        }
        return methods;
    }
    exports.$6m = $6m;
    function $7m(methodNames, invoke) {
        const createProxyMethod = (method) => {
            return function () {
                const args = Array.prototype.slice.call(arguments, 0);
                return invoke(method, args);
            };
        };
        const result = {};
        for (const methodName of methodNames) {
            result[methodName] = createProxyMethod(methodName);
        }
        return result;
    }
    exports.$7m = $7m;
});
//# sourceMappingURL=objects.js.map