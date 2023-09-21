/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WellDefinedPrefixTree = void 0;
    const unset = Symbol('unset');
    /**
     * A simple prefix tree implementation where a value is stored based on
     * well-defined prefix segments.
     */
    class WellDefinedPrefixTree {
        constructor() {
            this.root = new Node();
            this._size = 0;
        }
        get size() {
            return this._size;
        }
        /** Inserts a new value in the prefix tree. */
        insert(key, value) {
            this.opNode(key, n => n.value = value);
        }
        /** Mutates a value in the prefix tree. */
        mutate(key, mutate) {
            this.opNode(key, n => n.value = mutate(n.value === unset ? undefined : n.value));
        }
        /** Deletes a node from the prefix tree, returning the value it contained. */
        delete(key) {
            const path = [{ part: '', node: this.root }];
            let i = 0;
            for (const part of key) {
                const node = path[i].node.children?.get(part);
                if (!node) {
                    return undefined; // node not in tree
                }
                path.push({ part, node });
                i++;
            }
            const value = path[i].node.value;
            if (value === unset) {
                return; // not actually a real node
            }
            this._size--;
            for (; i > 0; i--) {
                const parent = path[i - 1];
                parent.node.children.delete(path[i].part);
                if (parent.node.children.size > 0 || parent.node.value !== unset) {
                    break;
                }
            }
            return value;
        }
        /** Gets a value from the tree. */
        find(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return undefined;
                }
                node = next;
            }
            return node.value === unset ? undefined : node.value;
        }
        /** Gets whether the tree has the key, or a parent of the key, already inserted. */
        hasKeyOrParent(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                if (next.value !== unset) {
                    return true;
                }
                node = next;
            }
            return false;
        }
        /** Gets whether the tree has the given key or any children. */
        hasKeyOrChildren(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                node = next;
            }
            return true;
        }
        /** Gets whether the tree has the given key. */
        hasKey(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                node = next;
            }
            return node.value !== unset;
        }
        opNode(key, fn) {
            let node = this.root;
            for (const part of key) {
                if (!node.children) {
                    const next = new Node();
                    node.children = new Map([[part, next]]);
                    node = next;
                }
                else if (!node.children.has(part)) {
                    const next = new Node();
                    node.children.set(part, next);
                    node = next;
                }
                else {
                    node = node.children.get(part);
                }
            }
            if (node.value === unset) {
                this._size++;
            }
            fn(node);
        }
        /** Returns an iterable of the tree values in no defined order. */
        *values() {
            const stack = [this.root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node.value !== unset) {
                    yield node.value;
                }
                if (node.children) {
                    for (const child of node.children.values()) {
                        stack.push(child);
                    }
                }
            }
        }
    }
    exports.WellDefinedPrefixTree = WellDefinedPrefixTree;
    class Node {
        constructor() {
            this.value = unset;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4VHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL3ByZWZpeFRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUU5Qjs7O09BR0c7SUFDSCxNQUFhLHFCQUFxQjtRQUFsQztZQUNrQixTQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUssQ0FBQztZQUM5QixVQUFLLEdBQUcsQ0FBQyxDQUFDO1FBcUpuQixDQUFDO1FBbkpBLElBQVcsSUFBSTtZQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsOENBQThDO1FBQzlDLE1BQU0sQ0FBQyxHQUFxQixFQUFFLEtBQVE7WUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCwwQ0FBMEM7UUFDMUMsTUFBTSxDQUFDLEdBQXFCLEVBQUUsTUFBd0I7WUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsNkVBQTZFO1FBQzdFLE1BQU0sQ0FBQyxHQUFxQjtZQUMzQixNQUFNLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEdB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