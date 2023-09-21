/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Af = exports.$zf = exports.$yf = exports.$xf = exports.$wf = exports.$vf = exports.$uf = exports.$tf = exports.$sf = exports.$rf = exports.$qf = exports.$pf = exports.$of = exports.$nf = exports.$mf = exports.$lf = exports.$kf = exports.$jf = void 0;
    /**
     * @returns whether the provided parameter is a JavaScript String or not.
     */
    function $jf(str) {
        return (typeof str === 'string');
    }
    exports.$jf = $jf;
    /**
     * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
     */
    function $kf(value) {
        return Array.isArray(value) && value.every(elem => $jf(elem));
    }
    exports.$kf = $kf;
    /**
     * @returns whether the provided parameter is of type `object` but **not**
     *	`null`, an `array`, a `regexp`, nor a `date`.
     */
    function $lf(obj) {
        // The method can't do a type cast since there are type (like strings) which
        // are subclasses of any put not positvely matched by the function. Hence type
        // narrowing results in wrong results.
        return typeof obj === 'object'
            && obj !== null
            && !Array.isArray(obj)
            && !(obj instanceof RegExp)
            && !(obj instanceof Date);
    }
    exports.$lf = $lf;
    /**
     * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
     */
    function $mf(obj) {
        const TypedArray = Object.getPrototypeOf(Uint8Array);
        return typeof obj === 'object'
            && obj instanceof TypedArray;
    }
    exports.$mf = $mf;
    /**
     * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
     * @returns whether the provided parameter is a JavaScript Number or not.
     */
    function $nf(obj) {
        return (typeof obj === 'number' && !isNaN(obj));
    }
    exports.$nf = $nf;
    /**
     * @returns whether the provided parameter is an Iterable, casting to the given generic
     */
    function $of(obj) {
        return !!obj && typeof obj[Symbol.iterator] === 'function';
    }
    exports.$of = $of;
    /**
     * @returns whether the provided parameter is a JavaScript Boolean or not.
     */
    function $pf(obj) {
        return (obj === true || obj === false);
    }
    exports.$pf = $pf;
    /**
     * @returns whether the provided parameter is undefined.
     */
    function $qf(obj) {
        return (typeof obj === 'undefined');
    }
    exports.$qf = $qf;
    /**
     * @returns whether the provided parameter is defined.
     */
    function $rf(arg) {
        return !$sf(arg);
    }
    exports.$rf = $rf;
    /**
     * @returns whether the provided parameter is undefined or null.
     */
    function $sf(obj) {
        return ($qf(obj) || obj === null);
    }
    exports.$sf = $sf;
    function $tf(condition, type) {
        if (!condition) {
            throw new Error(type ? `Unexpected type, expected '${type}'` : 'Unexpected type');
        }
    }
    exports.$tf = $tf;
    /**
     * Asserts that the argument passed in is neither undefined nor null.
     */
    function $uf(arg) {
        if ($sf(arg)) {
            throw new Error('Assertion Failed: argument is undefined or null');
        }
        return arg;
    }
    exports.$uf = $uf;
    function $vf(...args) {
        const result = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if ($sf(arg)) {
                throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
            }
            result.push(arg);
        }
        return result;
    }
    exports.$vf = $vf;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * @returns whether the provided parameter is an empty JavaScript Object or not.
     */
    function $wf(obj) {
        if (!$lf(obj)) {
            return false;
        }
        for (const key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    exports.$wf = $wf;
    /**
     * @returns whether the provided parameter is a JavaScript Function or not.
     */
    function $xf(obj) {
        return (typeof obj === 'function');
    }
    exports.$xf = $xf;
    /**
     * @returns whether the provided parameters is are JavaScript Function or not.
     */
    function $yf(...objects) {
        return objects.length > 0 && objects.every($xf);
    }
    exports.$yf = $yf;
    function $zf(args, constraints) {
        const len = Math.min(args.length, constraints.length);
        for (let i = 0; i < len; i++) {
            $Af(args[i], constraints[i]);
        }
    }
    exports.$zf = $zf;
    function $Af(arg, constraint) {
        if ($jf(constraint)) {
            if (typeof arg !== constraint) {
                throw new Error(`argument does not match constraint: typeof ${constraint}`);
            }
        }
        else if ($xf(constraint)) {
            try {
                if (arg instanceof constraint) {
                    return;
                }
            }
            catch {
                // ignore
            }
            if (!$sf(arg) && arg.constructor === constraint) {
                return;
            }
            if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
                return;
            }
            throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
        }
    }
    exports.$Af = $Af;
});
//# sourceMappingURL=types.js.map