/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/navigator"], function (require, exports, navigator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HistoryNavigator2 = exports.HistoryNavigator = void 0;
    class HistoryNavigator {
        constructor(history = [], limit = 10) {
            this._initialize(history);
            this._limit = limit;
            this._onChange();
        }
        getHistory() {
            return this._elements;
        }
        add(t) {
            this._history.delete(t);
            this._history.add(t);
            this._onChange();
        }
        next() {
            // This will navigate past the end of the last element, and in that case the input should be cleared
            return this._navigator.next();
        }
        previous() {
            if (this._currentPosition() !== 0) {
                return this._navigator.previous();
            }
            return null;
        }
        current() {
            return this._navigator.current();
        }
        first() {
            return this._navigator.first();
        }
        last() {
            return this._navigator.last();
        }
        isFirst() {
            return this._currentPosition() === 0;
        }
        isLast() {
            return this._currentPosition() >= this._elements.length - 1;
        }
        isNowhere() {
            return this._navigator.current() === null;
        }
        has(t) {
            return this._history.has(t);
        }
        clear() {
            this._initialize([]);
            this._onChange();
        }
        _onChange() {
            this._reduceToLimit();
            const elements = this._elements;
            this._navigator = new navigator_1.ArrayNavigator(elements, 0, elements.length, elements.length);
        }
        _reduceToLimit() {
            const data = this._elements;
            if (data.length > this._limit) {
                this._initialize(data.slice(data.length - this._limit));
            }
        }
        _currentPosition() {
            const currentElement = this._navigator.current();
            if (!currentElement) {
                return -1;
            }
            return this._elements.indexOf(currentElement);
        }
        _initialize(history) {
            this._history = new Set();
            for (const entry of history) {
                this._history.add(entry);
            }
        }
        get _elements() {
            const elements = [];
            this._history.forEach(e => elements.push(e));
            return elements;
        }
    }
    exports.HistoryNavigator = HistoryNavigator;
    class HistoryNavigator2 {
        get size() { return this._size; }
        constructor(history, capacity = 10) {
            this.capacity = capacity;
            if (history.length < 1) {
                throw new Error('not supported');
            }
            this._size = 1;
            this.head = this.tail = this.cursor = {
                value: history[0],
                previous: undefined,
                next: undefined
            };
            this.valueSet = new Set([history[0]]);
            for (let i = 1; i < history.length; i++) {
                this.add(history[i]);
            }
        }
        add(value) {
            const node = {
                value,
                previous: this.tail,
                next: undefined
            };
            this.tail.next = node;
            this.tail = node;
            this.cursor = this.tail;
            this._size++;
            if (this.valueSet.has(value)) {
                this._deleteFromList(value);
            }
            else {
                this.valueSet.add(value);
            }
            while (this._size > this.capacity) {
                this.valueSet.delete(this.head.value);
                this.head = this.head.next;
                this.head.previous = undefined;
                this._size--;
            }
        }
        /**
         * @returns old last value
         */
        replaceLast(value) {
            if (this.tail.value === value) {
                return value;
            }
            const oldValue = this.tail.value;
            this.valueSet.delete(oldValue);
            this.tail.value = value;
            if (this.valueSet.has(value)) {
                this._deleteFromList(value);
            }
            else {
                this.valueSet.add(value);
            }
            return oldValue;
        }
        prepend(value) {
            if (this._size === this.capacity || this.valueSet.has(value)) {
                return;
            }
            const node = {
                value,
                previous: undefined,
                next: this.head
            };
            this.head.previous = node;
            this.head = node;
            this._size++;
            this.valueSet.add(value);
        }
        isAtEnd() {
            return this.cursor === this.tail;
        }
        current() {
            return this.cursor.value;
        }
        previous() {
            if (this.cursor.previous) {
                this.cursor = this.cursor.previous;
            }
            return this.cursor.value;
        }
        next() {
            if (this.cursor.next) {
                this.cursor = this.cursor.next;
            }
            return this.cursor.value;
        }
        has(t) {
            return this.valueSet.has(t);
        }
        resetCursor() {
            this.cursor = this.tail;
            return this.cursor.value;
        }
        *[Symbol.iterator]() {
            let node = this.head;
            while (node) {
                yield node.value;
                node = node.next;
            }
        }
        _deleteFromList(value) {
            let temp = this.head;
            while (temp !== this.tail) {
                if (temp.value === value) {
                    if (temp === this.head) {
                        this.head = this.head.next;
                        this.head.previous = undefined;
                    }
                    else {
                        temp.previous.next = temp.next;
                        temp.next.previous = temp.previous;
                    }
                    this._size--;
                }
                temp = temp.next;
            }
        }
    }
    exports.HistoryNavigator2 = HistoryNavigator2;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2hpc3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQWEsZ0JBQWdCO1FBTTVCLFlBQVksVUFBd0IsRUFBRSxFQUFFLFFBQWdCLEVBQUU7WUFDekQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVNLFVBQVU7WUFDaEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxHQUFHLENBQUMsQ0FBSTtZQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBRU0sSUFBSTtZQUNWLG9HQUFvRztZQUNwRyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVNLFFBQVE7WUFDZCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDbEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2xDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sT0FBTztZQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRU0sS0FBSztZQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxDQUFD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