/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DenseKeyProvider = exports.identityKeyProvider = exports.SmallImmutableSet = void 0;
    const emptyArr = [];
    /**
     * Represents an immutable set that works best for a small number of elements (less than 32).
     * It uses bits to encode element membership efficiently.
    */
    class SmallImmutableSet {
        static { this.cache = new Array(129); }
        static create(items, additionalItems) {
            if (items <= 128 && additionalItems.length === 0) {
                // We create a cache of 128=2^7 elements to cover all sets with up to 7 (dense) elements.
                let cached = SmallImmutableSet.cache[items];
                if (!cached) {
                    cached = new SmallImmutableSet(items, additionalItems);
                    SmallImmutableSet.cache[items] = cached;
                }
                return cached;
            }
            return new SmallImmutableSet(items, additionalItems);
        }
        static { this.empty = SmallImmutableSet.create(0, emptyArr); }
        static getEmpty() {
            return this.empty;
        }
        constructor(items, additionalItems) {
            this.items = items;
            this.additionalItems = additionalItems;
        }
        add(value, keyProvider) {
            const key = keyProvider.getKey(value);
            let idx = key >> 5; // divided by 32
            if (idx === 0) {
                // fast path
                const newItem = (1 << key) | this.items;
                if (newItem === this.items) {
                    return this;
                }
                return SmallImmutableSet.create(newItem, this.additionalItems);
            }
            idx--;
            const newItems = this.additionalItems.slice(0);
            while (newItems.length < idx) {
                newItems.push(0);
            }
            newItems[idx] |= 1 << (key & 31);
            return SmallImmutableSet.create(this.items, newItems);
        }
        has(value, keyProvider) {
            const key = keyProvider.getKey(value);
            let idx = key >> 5; // divided by 32
            if (idx === 0) {
                // fast path
                return (this.items & (1 << key)) !== 0;
            }
            idx--;
            return ((this.additionalItems[idx] || 0) & (1 << (key & 31))) !== 0;
        }
        merge(other) {
            const merged = this.items | other.items;
            if (this.additionalItems === emptyArr && other.additionalItems === emptyArr) {
                // fast path
                if (merged === this.items) {
                    return this;
                }
                if (merged === other.items) {
                    return other;
                }
                return SmallImmutableSet.create(merged, emptyArr);
            }
            // This can be optimized, but it's not a common case
            const newItems = [];
            for (let i = 0; i < Math.max(this.additionalItems.length, other.additionalItems.length); i++) {
                const item1 = this.additionalItems[i] || 0;
                const item2 = other.additionalItems[i] || 0;
                newItems.push(item1 | item2);
            }
            return SmallImmutableSet.create(merged, newItems);
        }
        intersects(other) {
            if ((this.items & other.items) !== 0) {
                return true;
            }
            for (let i = 0; i < Math.min(this.additionalItems.length, other.additionalItems.length); i++) {
                if ((this.additionalItems[i] & other.additionalItems[i]) !== 0) {
                    return true;
                }
            }
            return false;
        }
        equals(other) {
            if (this.items !== other.items) {
                return false;
            }
            if (this.additionalItems.length !== other.additionalItems.length) {
                return false;
            }
            for (let i = 0; i < this.additionalItems.length; i++) {
                if (this.additionalItems[i] !== other.additionalItems[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.SmallImmutableSet = SmallImmutableSet;
    exports.identityKeyProvider = {
        getKey(value) {
            return value;
        }
    };
    /**
     * Assigns values a unique incrementing key.
    */
    class DenseKeyProvider {
        constructor() {
            this.items = new Map();
        }
        getKey(value) {
            let existing = this.items.get(value);
            if (existing === undefined) {
                existing = this.items.size;
                this.items.set(value, existing);
            }
            return existing;
        }
        reverseLookup(value) {
            return [...this.items].find(([_key, v]) => v === value)?.[0];
        }
        reverseLookupSet(set) {
            const result = [];
            for (const [key] of this.items) {
                if (set.has(key, this)) {
                    result.push(key);
                }
            }
            return result;
        }
        keys() {
            return this.items.keys();
        }
    }
    exports.DenseKeyProvider = DenseKeyProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21hbGxJbW11dGFibGVTZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyc1RleHRNb2RlbFBhcnQvYnJhY2tldFBhaXJzVHJlZS9zbWFsbEltbXV0YWJsZVNldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO0lBRTlCOzs7TUFHRTtJQUNGLE1BQWEsaUJBQWlCO2lCQUNkLFVBQUssR0FBRyxJQUFJLEtBQUssQ0FBeUIsR0FBRyxDQUFDLENBQUM7UUFFdEQsTUFBTSxDQUFDLE1BQU0sQ0FBSSxLQUFhLEVBQUUsZUFBa0M7WUFDekUsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNqRCx5RkFBeUY7Z0JBQ3pGLElBQUksTUFBTSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUM7b0JBQ3ZELGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUM7aUJBQ3hDO2dCQUNELE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFFRCxPQUFPLElBQUksaUJBQWlCLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7aUJBRWMsVUFBSyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLFFBQVE7WUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxZQUNrQixLQUFhLEVBQ2IsZUFB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