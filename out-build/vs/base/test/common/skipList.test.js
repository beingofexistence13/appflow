/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/skipList", "vs/base/common/stopwatch"], function (require, exports, assert, arrays_1, skipList_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SkipList', function () {
        function assertValues(list, expected) {
            assert.strictEqual(list.size, expected.length);
            assert.deepStrictEqual([...list.values()], expected);
            const valuesFromEntries = [...list.entries()].map(entry => entry[1]);
            assert.deepStrictEqual(valuesFromEntries, expected);
            const valuesFromIter = [...list].map(entry => entry[1]);
            assert.deepStrictEqual(valuesFromIter, expected);
            let i = 0;
            list.forEach((value, _key, map) => {
                assert.ok(map === list);
                assert.deepStrictEqual(value, expected[i++]);
            });
        }
        function assertKeys(list, expected) {
            assert.strictEqual(list.size, expected.length);
            assert.deepStrictEqual([...list.keys()], expected);
            const keysFromEntries = [...list.entries()].map(entry => entry[0]);
            assert.deepStrictEqual(keysFromEntries, expected);
            const keysFromIter = [...list].map(entry => entry[0]);
            assert.deepStrictEqual(keysFromIter, expected);
            let i = 0;
            list.forEach((_value, key, map) => {
                assert.ok(map === list);
                assert.deepStrictEqual(key, expected[i++]);
            });
        }
        test('set/get/delete', function () {
            const list = new skipList_1.$or((a, b) => a - b);
            assert.strictEqual(list.get(3), undefined);
            list.set(3, 1);
            assert.strictEqual(list.get(3), 1);
            assertValues(list, [1]);
            list.set(3, 3);
            assertValues(list, [3]);
            list.set(1, 1);
            list.set(4, 4);
            assert.strictEqual(list.get(3), 3);
            assert.strictEqual(list.get(1), 1);
            assert.strictEqual(list.get(4), 4);
            assertValues(list, [1, 3, 4]);
            assert.strictEqual(list.delete(17), false);
            assert.strictEqual(list.delete(1), true);
            assert.strictEqual(list.get(1), undefined);
            assert.strictEqual(list.get(3), 3);
            assert.strictEqual(list.get(4), 4);
            assertValues(list, [3, 4]);
        });
        test('Figure 3', function () {
            const list = new skipList_1.$or((a, b) => a - b);
            list.set(3, true);
            list.set(6, true);
            list.set(7, true);
            list.set(9, true);
            list.set(12, true);
            list.set(19, true);
            list.set(21, true);
            list.set(25, true);
            assertKeys(list, [3, 6, 7, 9, 12, 19, 21, 25]);
            list.set(17, true);
            assert.deepStrictEqual(list.size, 9);
            assertKeys(list, [3, 6, 7, 9, 12, 17, 19, 21, 25]);
        });
        test('capacity max', function () {
            const list = new skipList_1.$or((a, b) => a - b, 10);
            list.set(1, true);
            list.set(2, true);
            list.set(3, true);
            list.set(4, true);
            list.set(5, true);
            list.set(6, true);
            list.set(7, true);
            list.set(8, true);
            list.set(9, true);
            list.set(10, true);
            list.set(11, true);
            list.set(12, true);
            assertKeys(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        });
        const cmp = (a, b) => {
            if (a < b) {
                return -1;
            }
            else if (a > b) {
                return 1;
            }
            else {
                return 0;
            }
        };
        function insertArraySorted(array, element) {
            let idx = (0, arrays_1.$ub)(array, element, cmp);
            if (idx >= 0) {
                array[idx] = element;
            }
            else {
                idx = ~idx;
                // array = array.slice(0, idx).concat(element, array.slice(idx));
                array.splice(idx, 0, element);
            }
            return array;
        }
        function delArraySorted(array, element) {
            const idx = (0, arrays_1.$ub)(array, element, cmp);
            if (idx >= 0) {
                // array = array.slice(0, idx).concat(array.slice(idx));
                array.splice(idx, 1);
            }
            return array;
        }
        test.skip('perf', function () {
            // data
            const max = 2 ** 16;
            const values = new Set();
            for (let i = 0; i < max; i++) {
                const value = Math.floor(Math.random() * max);
                values.add(value);
            }
            console.log(values.size);
            // init
            const list = new skipList_1.$or(cmp, max);
            let sw = new stopwatch_1.$bd();
            values.forEach(value => list.set(value, true));
            sw.stop();
            console.log(`[LIST] ${list.size} elements after ${sw.elapsed()}ms`);
            let array = [];
            sw = new stopwatch_1.$bd();
            values.forEach(value => array = insertArraySorted(array, value));
            sw.stop();
            console.log(`[ARRAY] ${array.length} elements after ${sw.elapsed()}ms`);
            // get
            sw = new stopwatch_1.$bd();
            const someValues = [...values].slice(0, values.size / 4);
            someValues.forEach(key => {
                const value = list.get(key); // find
                console.assert(value, '[LIST] must have ' + key);
                list.get(-key); // miss
            });
            sw.stop();
            console.log(`[LIST] retrieve ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`);
            sw = new stopwatch_1.$bd();
            someValues.forEach(key => {
                const idx = (0, arrays_1.$ub)(array, key, cmp); // find
                console.assert(idx >= 0, '[ARRAY] must have ' + key);
                (0, arrays_1.$ub)(array, -key, cmp); // miss
            });
            sw.stop();
            console.log(`[ARRAY] retrieve ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`);
            // insert
            sw = new stopwatch_1.$bd();
            someValues.forEach(key => {
                list.set(-key, false);
            });
            sw.stop();
            console.log(`[LIST] insert ${sw.elapsed()}ms (${(sw.elapsed() / someValues.length).toPrecision(4)}ms/op)`);
            sw = new stopwatch_1.$bd();
            someValues.forEach(key => {
                array = insertArraySorted(array, -key);
            });
            sw.stop();
            console.log(`[ARRAY] insert ${sw.elapsed()}ms (${(sw.elapsed() / someValues.length).toPrecision(4)}ms/op)`);
            // delete
            sw = new stopwatch_1.$bd();
            someValues.forEach(key => {
                list.delete(key); // find
                list.delete(-key); // miss
            });
            sw.stop();
            console.log(`[LIST] delete ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`);
            sw = new stopwatch_1.$bd();
            someValues.forEach(key => {
                array = delArraySorted(array, key); // find
                array = delArraySorted(array, -key); // miss
            });
            sw.stop();
            console.log(`[ARRAY] delete ${sw.elapsed()}ms (${(sw.elapsed() / (someValues.length * 2)).toPrecision(4)}ms/op)`);
        });
    });
});
//# sourceMappingURL=skipList.test.js.map