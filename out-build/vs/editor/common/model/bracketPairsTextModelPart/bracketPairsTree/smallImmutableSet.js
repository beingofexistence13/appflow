/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nt = exports.$Mt = exports.$Lt = void 0;
    const emptyArr = [];
    /**
     * Represents an immutable set that works best for a small number of elements (less than 32).
     * It uses bits to encode element membership efficiently.
    */
    class $Lt {
        static { this.a = new Array(129); }
        static b(items, additionalItems) {
            if (items <= 128 && additionalItems.length === 0) {
                // We create a cache of 128=2^7 elements to cover all sets with up to 7 (dense) elements.
                let cached = $Lt.a[items];
                if (!cached) {
                    cached = new $Lt(items, additionalItems);
                    $Lt.a[items] = cached;
                }
                return cached;
            }
            return new $Lt(items, additionalItems);
        }
        static { this.c = $Lt.b(0, emptyArr); }
        static getEmpty() {
            return this.c;
        }
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        add(value, keyProvider) {
            const key = keyProvider.getKey(value);
            let idx = key >> 5; // divided by 32
            if (idx === 0) {
                // fast path
                const newItem = (1 << key) | this.d;
                if (newItem === this.d) {
                    return this;
                }
                return $Lt.b(newItem, this.e);
            }
            idx--;
            const newItems = this.e.slice(0);
            while (newItems.length < idx) {
                newItems.push(0);
            }
            newItems[idx] |= 1 << (key & 31);
            return $Lt.b(this.d, newItems);
        }
        has(value, keyProvider) {
            const key = keyProvider.getKey(value);
            let idx = key >> 5; // divided by 32
            if (idx === 0) {
                // fast path
                return (this.d & (1 << key)) !== 0;
            }
            idx--;
            return ((this.e[idx] || 0) & (1 << (key & 31))) !== 0;
        }
        merge(other) {
            const merged = this.d | other.d;
            if (this.e === emptyArr && other.e === emptyArr) {
                // fast path
                if (merged === this.d) {
                    return this;
                }
                if (merged === other.d) {
                    return other;
                }
                return $Lt.b(merged, emptyArr);
            }
            // This can be optimized, but it's not a common case
            const newItems = [];
            for (let i = 0; i < Math.max(this.e.length, other.e.length); i++) {
                const item1 = this.e[i] || 0;
                const item2 = other.e[i] || 0;
                newItems.push(item1 | item2);
            }
            return $Lt.b(merged, newItems);
        }
        intersects(other) {
            if ((this.d & other.d) !== 0) {
                return true;
            }
            for (let i = 0; i < Math.min(this.e.length, other.e.length); i++) {
                if ((this.e[i] & other.e[i]) !== 0) {
                    return true;
                }
            }
            return false;
        }
        equals(other) {
            if (this.d !== other.d) {
                return false;
            }
            if (this.e.length !== other.e.length) {
                return false;
            }
            for (let i = 0; i < this.e.length; i++) {
                if (this.e[i] !== other.e[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.$Lt = $Lt;
    exports.$Mt = {
        getKey(value) {
            return value;
        }
    };
    /**
     * Assigns values a unique incrementing key.
    */
    class $Nt {
        constructor() {
            this.a = new Map();
        }
        getKey(value) {
            let existing = this.a.get(value);
            if (existing === undefined) {
                existing = this.a.size;
                this.a.set(value, existing);
            }
            return existing;
        }
        reverseLookup(value) {
            return [...this.a].find(([_key, v]) => v === value)?.[0];
        }
        reverseLookupSet(set) {
            const result = [];
            for (const [key] of this.a) {
                if (set.has(key, this)) {
                    result.push(key);
                }
            }
            return result;
        }
        keys() {
            return this.a.keys();
        }
    }
    exports.$Nt = $Nt;
});
//# sourceMappingURL=smallImmutableSet.js.map