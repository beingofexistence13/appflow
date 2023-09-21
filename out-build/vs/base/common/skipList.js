/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$or = void 0;
    class Node {
        constructor(level, key, value) {
            this.level = level;
            this.key = key;
            this.value = value;
            this.forward = [];
        }
    }
    const NIL = undefined;
    class $or {
        /**
         *
         * @param capacity Capacity at which the list performs best
         */
        constructor(comparator, capacity = 2 ** 16) {
            this.comparator = comparator;
            this[_a] = 'SkipList';
            this.d = 0;
            this.f = 0;
            this.c = Math.max(1, Math.log2(capacity) | 0);
            this.e = new Node(this.c, NIL, NIL);
        }
        get size() {
            return this.f;
        }
        clear() {
            this.e = new Node(this.c, NIL, NIL);
        }
        has(key) {
            return Boolean($or.g(this, key, this.comparator));
        }
        get(key) {
            return $or.g(this, key, this.comparator)?.value;
        }
        set(key, value) {
            if ($or.h(this, key, value, this.comparator)) {
                this.f += 1;
            }
            return this;
        }
        delete(key) {
            const didDelete = $or.k(this, key, this.comparator);
            if (didDelete) {
                this.f -= 1;
            }
            return didDelete;
        }
        // --- iteration
        forEach(callbackfn, thisArg) {
            let node = this.e.forward[0];
            while (node) {
                callbackfn.call(thisArg, node.value, node.key, this);
                node = node.forward[0];
            }
        }
        [(_a = Symbol.toStringTag, Symbol.iterator)]() {
            return this.entries();
        }
        *entries() {
            let node = this.e.forward[0];
            while (node) {
                yield [node.key, node.value];
                node = node.forward[0];
            }
        }
        *keys() {
            let node = this.e.forward[0];
            while (node) {
                yield node.key;
                node = node.forward[0];
            }
        }
        *values() {
            let node = this.e.forward[0];
            while (node) {
                yield node.value;
                node = node.forward[0];
            }
        }
        toString() {
            // debug string...
            let result = '[SkipList]:';
            let node = this.e.forward[0];
            while (node) {
                result += `node(${node.key}, ${node.value}, lvl:${node.level})`;
                node = node.forward[0];
            }
            return result;
        }
        // from https://www.epaperpress.com/sortsearch/download/skiplist.pdf
        static g(list, searchKey, comparator) {
            let x = list.e;
            for (let i = list.d - 1; i >= 0; i--) {
                while (x.forward[i] && comparator(x.forward[i].key, searchKey) < 0) {
                    x = x.forward[i];
                }
            }
            x = x.forward[0];
            if (x && comparator(x.key, searchKey) === 0) {
                return x;
            }
            return undefined;
        }
        static h(list, searchKey, value, comparator) {
            const update = [];
            let x = list.e;
            for (let i = list.d - 1; i >= 0; i--) {
                while (x.forward[i] && comparator(x.forward[i].key, searchKey) < 0) {
                    x = x.forward[i];
                }
                update[i] = x;
            }
            x = x.forward[0];
            if (x && comparator(x.key, searchKey) === 0) {
                // update
                x.value = value;
                return false;
            }
            else {
                // insert
                const lvl = $or.j(list);
                if (lvl > list.d) {
                    for (let i = list.d; i < lvl; i++) {
                        update[i] = list.e;
                    }
                    list.d = lvl;
                }
                x = new Node(lvl, searchKey, value);
                for (let i = 0; i < lvl; i++) {
                    x.forward[i] = update[i].forward[i];
                    update[i].forward[i] = x;
                }
                return true;
            }
        }
        static j(list, p = 0.5) {
            let lvl = 1;
            while (Math.random() < p && lvl < list.c) {
                lvl += 1;
            }
            return lvl;
        }
        static k(list, searchKey, comparator) {
            const update = [];
            let x = list.e;
            for (let i = list.d - 1; i >= 0; i--) {
                while (x.forward[i] && comparator(x.forward[i].key, searchKey) < 0) {
                    x = x.forward[i];
                }
                update[i] = x;
            }
            x = x.forward[0];
            if (!x || comparator(x.key, searchKey) !== 0) {
                // not found
                return false;
            }
            for (let i = 0; i < list.d; i++) {
                if (update[i].forward[i] !== x) {
                    break;
                }
                update[i].forward[i] = x.forward[i];
            }
            while (list.d > 0 && list.e.forward[list.d - 1] === NIL) {
                list.d -= 1;
            }
            return true;
        }
    }
    exports.$or = $or;
});
//# sourceMappingURL=skipList.js.map