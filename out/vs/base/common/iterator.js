/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Iterable = void 0;
    var Iterable;
    (function (Iterable) {
        function is(thing) {
            return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
        }
        Iterable.is = is;
        const _empty = Object.freeze([]);
        function empty() {
            return _empty;
        }
        Iterable.empty = empty;
        function* single(element) {
            yield element;
        }
        Iterable.single = single;
        function wrap(iterableOrElement) {
            if (is(iterableOrElement)) {
                return iterableOrElement;
            }
            else {
                return single(iterableOrElement);
            }
        }
        Iterable.wrap = wrap;
        function from(iterable) {
            return iterable || _empty;
        }
        Iterable.from = from;
        function* reverse(array) {
            for (let i = array.length - 1; i >= 0; i--) {
                yield array[i];
            }
        }
        Iterable.reverse = reverse;
        function isEmpty(iterable) {
            return !iterable || iterable[Symbol.iterator]().next().done === true;
        }
        Iterable.isEmpty = isEmpty;
        function first(iterable) {
            return iterable[Symbol.iterator]().next().value;
        }
        Iterable.first = first;
        function some(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return true;
                }
            }
            return false;
        }
        Iterable.some = some;
        function find(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return element;
                }
            }
            return undefined;
        }
        Iterable.find = find;
        function* filter(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    yield element;
                }
            }
        }
        Iterable.filter = filter;
        function* map(iterable, fn) {
            let index = 0;
            for (const element of iterable) {
                yield fn(element, index++);
            }
        }
        Iterable.map = map;
        function* concat(...iterables) {
            for (const iterable of iterables) {
                for (const element of iterable) {
                    yield element;
                }
            }
        }
        Iterable.concat = concat;
        function reduce(iterable, reducer, initialValue) {
            let value = initialValue;
            for (const element of iterable) {
                value = reducer(value, element);
            }
            return value;
        }
        Iterable.reduce = reduce;
        /**
         * Returns an iterable slice of the array, with the same semantics as `array.slice()`.
         */
        function* slice(arr, from, to = arr.length) {
            if (from < 0) {
                from += arr.length;
            }
            if (to < 0) {
                to += arr.length;
            }
            else if (to > arr.length) {
                to = arr.length;
            }
            for (; from < to; from++) {
                yield arr[from];
            }
        }
        Iterable.slice = slice;
        /**
         * Consumes `atMost` elements from iterable and returns the consumed elements,
         * and an iterable for the rest of the elements.
         */
        function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
            const consumed = [];
            if (atMost === 0) {
                return [consumed, iterable];
            }
            const iterator = iterable[Symbol.iterator]();
            for (let i = 0; i < atMost; i++) {
                const next = iterator.next();
                if (next.done) {
                    return [consumed, Iterable.empty()];
                }
                consumed.push(next.value);
            }
            return [consumed, { [Symbol.iterator]() { return iterator; } }];
        }
        Iterable.consume = consume;
    })(Iterable || (exports.Iterable = Iterable = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmF0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9pdGVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsSUFBaUIsUUFBUSxDQTJJeEI7SUEzSUQsV0FBaUIsUUFBUTtRQUV4QixTQUFnQixFQUFFLENBQVUsS0FBVTtZQUNyQyxPQUFPLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFVBQVUsQ0FBQztRQUMzRixDQUFDO1FBRmUsV0FBRSxLQUVqQixDQUFBO1FBRUQsTUFBTSxNQUFNLEdBQWtCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEQsU0FBZ0IsS0FBSztZQUNwQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFGZSxjQUFLLFFBRXBCLENBQUE7UUFFRCxRQUFlLENBQUMsQ0FBQyxNQUFNLENBQUksT0FBVTtZQUNwQyxNQUFNLE9BQU8sQ0FBQztRQUNmLENBQUM7UUFGZ0IsZUFBTSxTQUV0QixDQUFBO1FBRUQsU0FBZ0IsSUFBSSxDQUFJLGlCQUFrQztZQUN6RCxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUMxQixPQUFPLGlCQUFpQixDQUFDO2FBQ3pCO2lCQUFNO2dCQUNOLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDakM7UUFDRixDQUFDO1FBTmUsYUFBSSxPQU1uQixDQUFBO1FBRUQsU0FBZ0IsSUFBSSxDQUFJLFFBQXdDO1lBQy9ELE9BQU8sUUFBUSxJQUFJLE1BQU0sQ0FBQztRQUMzQixDQUFDO1FBRmUsYUFBSSxPQUVuQixDQUFBO1FBRUQsUUFBZSxDQUFDLENBQUMsT0FBTyxDQUFJLEtBQWU7WUFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxL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