/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tc = void 0;
    class Node {
        static { this.Undefined = new Node(undefined); }
        constructor(element) {
            this.element = element;
            this.next = Node.Undefined;
            this.prev = Node.Undefined;
        }
    }
    class $tc {
        constructor() {
            this.a = Node.Undefined;
            this.b = Node.Undefined;
            this.c = 0;
        }
        get size() {
            return this.c;
        }
        isEmpty() {
            return this.a === Node.Undefined;
        }
        clear() {
            let node = this.a;
            while (node !== Node.Undefined) {
                const next = node.next;
                node.prev = Node.Undefined;
                node.next = Node.Undefined;
                node = next;
            }
            this.a = Node.Undefined;
            this.b = Node.Undefined;
            this.c = 0;
        }
        unshift(element) {
            return this.d(element, false);
        }
        push(element) {
            return this.d(element, true);
        }
        d(element, atTheEnd) {
            const newNode = new Node(element);
            if (this.a === Node.Undefined) {
                this.a = newNode;
                this.b = newNode;
            }
            else if (atTheEnd) {
                // push
                const oldLast = this.b;
                this.b = newNode;
                newNode.prev = oldLast;
                oldLast.next = newNode;
            }
            else {
                // unshift
                const oldFirst = this.a;
                this.a = newNode;
                newNode.next = oldFirst;
                oldFirst.prev = newNode;
            }
            this.c += 1;
            let didRemove = false;
            return () => {
                if (!didRemove) {
                    didRemove = true;
                    this.e(newNode);
                }
            };
        }
        shift() {
            if (this.a === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this.a.element;
                this.e(this.a);
                return res;
            }
        }
        pop() {
            if (this.b === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this.b.element;
                this.e(this.b);
                return res;
            }
        }
        e(node) {
            if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
                // middle
                const anchor = node.prev;
                anchor.next = node.next;
                node.next.prev = anchor;
            }
            else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
                // only node
                this.a = Node.Undefined;
                this.b = Node.Undefined;
            }
            else if (node.next === Node.Undefined) {
                // last
                this.b = this.b.prev;
                this.b.next = Node.Undefined;
            }
            else if (node.prev === Node.Undefined) {
                // first
                this.a = this.a.next;
                this.a.prev = Node.Undefined;
            }
            // done
            this.c -= 1;
        }
        *[Symbol.iterator]() {
            let node = this.a;
            while (node !== Node.Undefined) {
                yield node.element;
                node = node.next;
            }
        }
    }
    exports.$tc = $tc;
});
//# sourceMappingURL=linkedList.js.map