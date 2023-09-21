/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KS = void 0;
    const unset = Symbol('unset');
    /**
     * A simple prefix tree implementation where a value is stored based on
     * well-defined prefix segments.
     */
    class $KS {
        constructor() {
            this.a = new Node();
            this.b = 0;
        }
        get size() {
            return this.b;
        }
        /** Inserts a new value in the prefix tree. */
        insert(key, value) {
            this.c(key, n => n.value = value);
        }
        /** Mutates a value in the prefix tree. */
        mutate(key, mutate) {
            this.c(key, n => n.value = mutate(n.value === unset ? undefined : n.value));
        }
        /** Deletes a node from the prefix tree, returning the value it contained. */
        delete(key) {
            const path = [{ part: '', node: this.a }];
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
            this.b--;
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
            let node = this.a;
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
            let node = this.a;
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
            let node = this.a;
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
            let node = this.a;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                node = next;
            }
            return node.value !== unset;
        }
        c(key, fn) {
            let node = this.a;
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
                this.b++;
            }
            fn(node);
        }
        /** Returns an iterable of the tree values in no defined order. */
        *values() {
            const stack = [this.a];
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
    exports.$KS = $KS;
    class Node {
        constructor() {
            this.value = unset;
        }
    }
});
//# sourceMappingURL=prefixTree.js.map