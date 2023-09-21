/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/navigator"], function (require, exports, navigator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qR = exports.$pR = void 0;
    class $pR {
        constructor(history = [], limit = 10) {
            this.h(history);
            this.b = limit;
            this.d();
        }
        getHistory() {
            return this.j;
        }
        add(t) {
            this.a.delete(t);
            this.a.add(t);
            this.d();
        }
        next() {
            // This will navigate past the end of the last element, and in that case the input should be cleared
            return this.c.next();
        }
        previous() {
            if (this.g() !== 0) {
                return this.c.previous();
            }
            return null;
        }
        current() {
            return this.c.current();
        }
        first() {
            return this.c.first();
        }
        last() {
            return this.c.last();
        }
        isFirst() {
            return this.g() === 0;
        }
        isLast() {
            return this.g() >= this.j.length - 1;
        }
        isNowhere() {
            return this.c.current() === null;
        }
        has(t) {
            return this.a.has(t);
        }
        clear() {
            this.h([]);
            this.d();
        }
        d() {
            this.f();
            const elements = this.j;
            this.c = new navigator_1.$oR(elements, 0, elements.length, elements.length);
        }
        f() {
            const data = this.j;
            if (data.length > this.b) {
                this.h(data.slice(data.length - this.b));
            }
        }
        g() {
            const currentElement = this.c.current();
            if (!currentElement) {
                return -1;
            }
            return this.j.indexOf(currentElement);
        }
        h(history) {
            this.a = new Set();
            for (const entry of history) {
                this.a.add(entry);
            }
        }
        get j() {
            const elements = [];
            this.a.forEach(e => elements.push(e));
            return elements;
        }
    }
    exports.$pR = $pR;
    class $qR {
        get size() { return this.f; }
        constructor(history, g = 10) {
            this.g = g;
            if (history.length < 1) {
                throw new Error('not supported');
            }
            this.f = 1;
            this.b = this.c = this.d = {
                value: history[0],
                previous: undefined,
                next: undefined
            };
            this.a = new Set([history[0]]);
            for (let i = 1; i < history.length; i++) {
                this.add(history[i]);
            }
        }
        add(value) {
            const node = {
                value,
                previous: this.c,
                next: undefined
            };
            this.c.next = node;
            this.c = node;
            this.d = this.c;
            this.f++;
            if (this.a.has(value)) {
                this.h(value);
            }
            else {
                this.a.add(value);
            }
            while (this.f > this.g) {
                this.a.delete(this.b.value);
                this.b = this.b.next;
                this.b.previous = undefined;
                this.f--;
            }
        }
        /**
         * @returns old last value
         */
        replaceLast(value) {
            if (this.c.value === value) {
                return value;
            }
            const oldValue = this.c.value;
            this.a.delete(oldValue);
            this.c.value = value;
            if (this.a.has(value)) {
                this.h(value);
            }
            else {
                this.a.add(value);
            }
            return oldValue;
        }
        prepend(value) {
            if (this.f === this.g || this.a.has(value)) {
                return;
            }
            const node = {
                value,
                previous: undefined,
                next: this.b
            };
            this.b.previous = node;
            this.b = node;
            this.f++;
            this.a.add(value);
        }
        isAtEnd() {
            return this.d === this.c;
        }
        current() {
            return this.d.value;
        }
        previous() {
            if (this.d.previous) {
                this.d = this.d.previous;
            }
            return this.d.value;
        }
        next() {
            if (this.d.next) {
                this.d = this.d.next;
            }
            return this.d.value;
        }
        has(t) {
            return this.a.has(t);
        }
        resetCursor() {
            this.d = this.c;
            return this.d.value;
        }
        *[Symbol.iterator]() {
            let node = this.b;
            while (node) {
                yield node.value;
                node = node.next;
            }
        }
        h(value) {
            let temp = this.b;
            while (temp !== this.c) {
                if (temp.value === value) {
                    if (temp === this.b) {
                        this.b = this.b.next;
                        this.b.previous = undefined;
                    }
                    else {
                        temp.previous.next = temp.next;
                        temp.next.previous = temp.previous;
                    }
                    this.f--;
                }
                temp = temp.next;
            }
        }
    }
    exports.$qR = $qR;
});
//# sourceMappingURL=history.js.map