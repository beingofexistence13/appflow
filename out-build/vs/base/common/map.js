/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var _a, _b, _c;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ei = exports.$Di = exports.$Ci = exports.$Bi = exports.Touch = exports.$Ai = exports.$zi = exports.$yi = exports.$xi = exports.$wi = void 0;
    function $wi(map, key, value) {
        let result = map.get(key);
        if (result === undefined) {
            result = value;
            map.set(key, result);
        }
        return result;
    }
    exports.$wi = $wi;
    function $xi(map) {
        const entries = [];
        map.forEach((value, key) => {
            entries.push(`${key} => ${value}`);
        });
        return `Map(${map.size}) {${entries.join(', ')}}`;
    }
    exports.$xi = $xi;
    function $yi(set) {
        const entries = [];
        set.forEach(value => {
            entries.push(value);
        });
        return `Set(${set.size}) {${entries.join(', ')}}`;
    }
    exports.$yi = $yi;
    class ResourceMapEntry {
        constructor(uri, value) {
            this.uri = uri;
            this.value = value;
        }
    }
    function isEntries(arg) {
        return Array.isArray(arg);
    }
    class $zi {
        static { this.a = (resource) => resource.toString(); }
        constructor(arg, toKey) {
            this[_a] = 'ResourceMap';
            if (arg instanceof $zi) {
                this.b = new Map(arg.b);
                this.c = toKey ?? $zi.a;
            }
            else if (isEntries(arg)) {
                this.b = new Map();
                this.c = toKey ?? $zi.a;
                for (const [resource, value] of arg) {
                    this.set(resource, value);
                }
            }
            else {
                this.b = new Map();
                this.c = arg ?? $zi.a;
            }
        }
        set(resource, value) {
            this.b.set(this.c(resource), new ResourceMapEntry(resource, value));
            return this;
        }
        get(resource) {
            return this.b.get(this.c(resource))?.value;
        }
        has(resource) {
            return this.b.has(this.c(resource));
        }
        get size() {
            return this.b.size;
        }
        clear() {
            this.b.clear();
        }
        delete(resource) {
            return this.b.delete(this.c(resource));
        }
        forEach(clb, thisArg) {
            if (typeof thisArg !== 'undefined') {
                clb = clb.bind(thisArg);
            }
            for (const [_, entry] of this.b) {
                clb(entry.value, entry.uri, this);
            }
        }
        *values() {
            for (const entry of this.b.values()) {
                yield entry.value;
            }
        }
        *keys() {
            for (const entry of this.b.values()) {
                yield entry.uri;
            }
        }
        *entries() {
            for (const entry of this.b.values()) {
                yield [entry.uri, entry.value];
            }
        }
        *[(_a = Symbol.toStringTag, Symbol.iterator)]() {
            for (const [, entry] of this.b) {
                yield [entry.uri, entry.value];
            }
        }
    }
    exports.$zi = $zi;
    class $Ai {
        constructor(entriesOrKey, toKey) {
            this[_b] = 'ResourceSet';
            if (!entriesOrKey || typeof entriesOrKey === 'function') {
                this.a = new $zi(entriesOrKey);
            }
            else {
                this.a = new $zi(toKey);
                entriesOrKey.forEach(this.add, this);
            }
        }
        get size() {
            return this.a.size;
        }
        add(value) {
            this.a.set(value, value);
            return this;
        }
        clear() {
            this.a.clear();
        }
        delete(value) {
            return this.a.delete(value);
        }
        forEach(callbackfn, thisArg) {
            this.a.forEach((_value, key) => callbackfn.call(thisArg, key, key, this));
        }
        has(value) {
            return this.a.has(value);
        }
        entries() {
            return this.a.entries();
        }
        keys() {
            return this.a.keys();
        }
        values() {
            return this.a.keys();
        }
        [(_b = Symbol.toStringTag, Symbol.iterator)]() {
            return this.keys();
        }
    }
    exports.$Ai = $Ai;
    var Touch;
    (function (Touch) {
        Touch[Touch["None"] = 0] = "None";
        Touch[Touch["AsOld"] = 1] = "AsOld";
        Touch[Touch["AsNew"] = 2] = "AsNew";
    })(Touch || (exports.Touch = Touch = {}));
    class $Bi {
        constructor() {
            this[_c] = 'LinkedMap';
            this.a = new Map();
            this.b = undefined;
            this.c = undefined;
            this.d = 0;
            this.e = 0;
        }
        clear() {
            this.a.clear();
            this.b = undefined;
            this.c = undefined;
            this.d = 0;
            this.e++;
        }
        isEmpty() {
            return !this.b && !this.c;
        }
        get size() {
            return this.d;
        }
        get first() {
            return this.b?.value;
        }
        get last() {
            return this.c?.value;
        }
        has(key) {
            return this.a.has(key);
        }
        get(key, touch = 0 /* Touch.None */) {
            const item = this.a.get(key);
            if (!item) {
                return undefined;
            }
            if (touch !== 0 /* Touch.None */) {
                this.j(item, touch);
            }
            return item.value;
        }
        set(key, value, touch = 0 /* Touch.None */) {
            let item = this.a.get(key);
            if (item) {
                item.value = value;
                if (touch !== 0 /* Touch.None */) {
                    this.j(item, touch);
                }
            }
            else {
                item = { key, value, next: undefined, previous: undefined };
                switch (touch) {
                    case 0 /* Touch.None */:
                        this.h(item);
                        break;
                    case 1 /* Touch.AsOld */:
                        this.g(item);
                        break;
                    case 2 /* Touch.AsNew */:
                        this.h(item);
                        break;
                    default:
                        this.h(item);
                        break;
                }
                this.a.set(key, item);
                this.d++;
            }
            return this;
        }
        delete(key) {
            return !!this.remove(key);
        }
        remove(key) {
            const item = this.a.get(key);
            if (!item) {
                return undefined;
            }
            this.a.delete(key);
            this.i(item);
            this.d--;
            return item.value;
        }
        shift() {
            if (!this.b && !this.c) {
                return undefined;
            }
            if (!this.b || !this.c) {
                throw new Error('Invalid list');
            }
            const item = this.b;
            this.a.delete(item.key);
            this.i(item);
            this.d--;
            return item.value;
        }
        forEach(callbackfn, thisArg) {
            const state = this.e;
            let current = this.b;
            while (current) {
                if (thisArg) {
                    callbackfn.bind(thisArg)(current.value, current.key, this);
                }
                else {
                    callbackfn(current.value, current.key, this);
                }
                if (this.e !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                current = current.next;
            }
        }
        keys() {
            const map = this;
            const state = this.e;
            let current = this.b;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map.e !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.key, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        values() {
            const map = this;
            const state = this.e;
            let current = this.b;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map.e !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.value, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        entries() {
            const map = this;
            const state = this.e;
            let current = this.b;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map.e !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: [current.key, current.value], done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        [(_c = Symbol.toStringTag, Symbol.iterator)]() {
            return this.entries();
        }
        f(newSize) {
            if (newSize >= this.size) {
                return;
            }
            if (newSize === 0) {
                this.clear();
                return;
            }
            let current = this.b;
            let currentSize = this.size;
            while (current && currentSize > newSize) {
                this.a.delete(current.key);
                current = current.next;
                currentSize--;
            }
            this.b = current;
            this.d = currentSize;
            if (current) {
                current.previous = undefined;
            }
            this.e++;
        }
        g(item) {
            // First time Insert
            if (!this.b && !this.c) {
                this.c = item;
            }
            else if (!this.b) {
                throw new Error('Invalid list');
            }
            else {
                item.next = this.b;
                this.b.previous = item;
            }
            this.b = item;
            this.e++;
        }
        h(item) {
            // First time Insert
            if (!this.b && !this.c) {
                this.b = item;
            }
            else if (!this.c) {
                throw new Error('Invalid list');
            }
            else {
                item.previous = this.c;
                this.c.next = item;
            }
            this.c = item;
            this.e++;
        }
        i(item) {
            if (item === this.b && item === this.c) {
                this.b = undefined;
                this.c = undefined;
            }
            else if (item === this.b) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.next) {
                    throw new Error('Invalid list');
                }
                item.next.previous = undefined;
                this.b = item.next;
            }
            else if (item === this.c) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.previous) {
                    throw new Error('Invalid list');
                }
                item.previous.next = undefined;
                this.c = item.previous;
            }
            else {
                const next = item.next;
                const previous = item.previous;
                if (!next || !previous) {
                    throw new Error('Invalid list');
                }
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = undefined;
            this.e++;
        }
        j(item, touch) {
            if (!this.b || !this.c) {
                throw new Error('Invalid list');
            }
            if ((touch !== 1 /* Touch.AsOld */ && touch !== 2 /* Touch.AsNew */)) {
                return;
            }
            if (touch === 1 /* Touch.AsOld */) {
                if (item === this.b) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item
                if (item === this.c) {
                    // previous must be defined since item was not head but is tail
                    // So there are more than on item in the map
                    previous.next = undefined;
                    this.c = previous;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                // Insert the node at head
                item.previous = undefined;
                item.next = this.b;
                this.b.previous = item;
                this.b = item;
                this.e++;
            }
            else if (touch === 2 /* Touch.AsNew */) {
                if (item === this.c) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item.
                if (item === this.b) {
                    // next must be defined since item was not tail but is head
                    // So there are more than on item in the map
                    next.previous = undefined;
                    this.b = next;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                item.next = undefined;
                item.previous = this.c;
                this.c.next = item;
                this.c = item;
                this.e++;
            }
        }
        toJSON() {
            const data = [];
            this.forEach((value, key) => {
                data.push([key, value]);
            });
            return data;
        }
        fromJSON(data) {
            this.clear();
            for (const [key, value] of data) {
                this.set(key, value);
            }
        }
    }
    exports.$Bi = $Bi;
    class $Ci extends $Bi {
        constructor(limit, ratio = 1) {
            super();
            this.k = limit;
            this.l = Math.min(Math.max(0, ratio), 1);
        }
        get limit() {
            return this.k;
        }
        set limit(limit) {
            this.k = limit;
            this.m();
        }
        get ratio() {
            return this.l;
        }
        set ratio(ratio) {
            this.l = Math.min(Math.max(0, ratio), 1);
            this.m();
        }
        get(key, touch = 2 /* Touch.AsNew */) {
            return super.get(key, touch);
        }
        peek(key) {
            return super.get(key, 0 /* Touch.None */);
        }
        set(key, value) {
            super.set(key, value, 2 /* Touch.AsNew */);
            this.m();
            return this;
        }
        m() {
            if (this.size > this.k) {
                this.f(Math.round(this.k * this.l));
            }
        }
    }
    exports.$Ci = $Ci;
    class $Di {
        constructor() {
            this.a = new Map();
        }
        add(value) {
            this.a.set(value, (this.a.get(value) || 0) + 1);
            return this;
        }
        delete(value) {
            let counter = this.a.get(value) || 0;
            if (counter === 0) {
                return false;
            }
            counter--;
            if (counter === 0) {
                this.a.delete(value);
            }
            else {
                this.a.set(value, counter);
            }
            return true;
        }
        has(value) {
            return this.a.has(value);
        }
    }
    exports.$Di = $Di;
    /**
     * A map that allows access both by keys and values.
     * **NOTE**: values need to be unique.
     */
    class $Ei {
        constructor(entries) {
            this.a = new Map();
            this.b = new Map();
            if (entries) {
                for (const [key, value] of entries) {
                    this.set(key, value);
                }
            }
        }
        clear() {
            this.a.clear();
            this.b.clear();
        }
        set(key, value) {
            this.a.set(key, value);
            this.b.set(value, key);
        }
        get(key) {
            return this.a.get(key);
        }
        getKey(value) {
            return this.b.get(value);
        }
        delete(key) {
            const value = this.a.get(key);
            if (value === undefined) {
                return false;
            }
            this.a.delete(key);
            this.b.delete(value);
            return true;
        }
        forEach(callbackfn, thisArg) {
            this.a.forEach((value, key) => {
                callbackfn.call(thisArg, value, key, this);
            });
        }
        keys() {
            return this.a.keys();
        }
        values() {
            return this.a.values();
        }
    }
    exports.$Ei = $Ei;
});
//# sourceMappingURL=map.js.map