/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SkipList = void 0;
    class Node {
        constructor(level, key, value) {
            this.level = level;
            this.key = key;
            this.value = value;
            this.forward = [];
        }
    }
    const NIL = undefined;
    class SkipList {
        /**
         *
         * @param capacity Capacity at which the list performs best
         */
        constructor(comparator, capacity = 2 ** 16) {
            this.comparator = comparator;
            this[_a] = 'SkipList';
            this._level = 0;
            this._size = 0;
            this._maxLevel = Math.max(1, Math.log2(capacity) | 0);
            this._header = new Node(this._maxLevel, NIL, NIL);
        }
        get size() {
            return this._size;
        }
        clear() {
            this._header = new Node(this._maxLevel, NIL, NIL);
        }
        has(key) {
            return Boolean(SkipList._search(this, key, this.comparator));
        }
        get(key) {
            return SkipList._search(this, key, this.comparator)?.value;
        }
        set(key, value) {
            if (SkipList._insert(this, key, value, this.comparator)) {
                this._size += 1;
            }
            return this;
        }
        delete(key) {
            const didDelete = SkipList._delete(this, key, this.comparator);
            if (didDelete) {
                this._size -= 1;
            }
            return didDelete;
        }
        // --- iteration
        forEach(callbackfn, thisArg) {
            let node = this._header.forward[0];
            while (node) {
                callbackfn.call(thisArg, node.value, node.key, this);
                node = node.forward[0];
            }
        }
        [(_a = Symbol.toStringTag, Symbol.iterator)]() {
            return this.entries();
        }
        *entries() {
            let node = this._header.forward[0];
            while (node) {
                yield [node.key, node.value];
                node = node.forward[0];
            }
        }
        *keys() {
            let node = this._header.forward[0];
            while (node) {
                yield node.key;
                node = node.forward[0];
            }
        }
        *values() {
            let node = this._header.forward[0];
            while (node) {
                yield node.value;
                node = node.forward[0];
            }
        }
        toString() {
            // debug string...
            let result = '[SkipList]:';
            let node = this._header.forward[0];
            while (node) {
                result += `node(${node.key}, ${node.value}, lvl:${node.level})`;
                node = node.forward[0];
            }
            return result;
        }
        // from https://www.epaperpress.com/sortsearch/download/skiplist.pdf
        static _search(list, searchKey, comparator) {
            let x = list._header;
            for (let i = list._level - 1; i >= 0; i--) {
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
        static _insert(list, searchKey, value, comparator) {
            const update = [];
            let x = list._header;
            for (let i = list._level - 1; i >= 0; i--) {
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
                const lvl = SkipList._randomLevel(list);
                if (lvl > list._level) {
                    for (let i = list._level; i < lvl; i++) {
                        update[i] = list._header;
                    }
                    list._level = lvl;
                }
                x = new Node(lvl, searchKey, value);
                for (let i = 0; i < lvl; i++) {
                    x.forward[i] = update[i].forward[i];
                    update[i].forward[i] = x;
                }
                return true;
            }
        }
        static _randomLevel(list, p = 0.5) {
            let lvl = 1;
            while (Math.random() < p && lvl < list._maxLevel) {
                lvl += 1;
            }
            return lvl;
        }
        static _delete(list, searchKey, comparator) {
            const update = [];
            let x = list._header;
            for (let i = list._level - 1; i >= 0; i--) {
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
            for (let i = 0; i < list._level; i++) {
                if (update[i].forward[i] !== x) {
                    break;
                }
                update[i].forward[i] = x.forward[i];
            }
            while (list._level > 0 && list._header.forward[list._level - 1] === NIL) {
                list._level -= 1;
            }
            return true;
        }
    }
    exports.SkipList = SkipList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tpcExpc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9za2lwTGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7O0lBR2hHLE1BQU0sSUFBSTtRQUVULFlBQXFCLEtBQWEsRUFBVyxHQUFNLEVBQVMsS0FBUTtZQUEvQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVcsUUFBRyxHQUFILEdBQUcsQ0FBRztZQUFTLFVBQUssR0FBTCxLQUFLLENBQUc7WUFDbkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBRUQsTUFBTSxHQUFHLEdBQWMsU0FBUyxDQUFDO0lBTWpDLE1BQWEsUUFBUTtRQVNwQjs7O1dBR0c7UUFDSCxZQUNVLFVBQWtDLEVBQzNDLFdBQW1CLENBQUMsSUFBSSxFQUFFO1lBRGpCLGVBQVUsR0FBVixVQUFVLENBQXdCO1lBWm5DLFFBQW9CLEdBQUcsVUFBVSxDQUFDO1lBR25DLFdBQU0sR0FBVyxDQUFDLENBQUM7WUFFbkIsVUFBSyxHQUFXLENBQUMsQ0FBQztZQVV6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLE9BQU8sR0FBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLE9BQU8sR0FBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMs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