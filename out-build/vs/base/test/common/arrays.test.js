define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/arraysFind"], function (require, exports, assert, arrays, arraysFind) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Arrays', () => {
        test('removeFastWithoutKeepingOrder', () => {
            const array = [1, 4, 5, 7, 55, 59, 60, 61, 64, 69];
            arrays.$tb(array, 1);
            assert.deepStrictEqual(array, [1, 69, 5, 7, 55, 59, 60, 61, 64]);
            arrays.$tb(array, 0);
            assert.deepStrictEqual(array, [64, 69, 5, 7, 55, 59, 60, 61]);
            arrays.$tb(array, 7);
            assert.deepStrictEqual(array, [64, 69, 5, 7, 55, 59, 60]);
        });
        test('findFirst', () => {
            const array = [1, 4, 5, 7, 55, 59, 60, 61, 64, 69];
            let idx = arraysFind.$ib(array, e => e >= 0);
            assert.strictEqual(array[idx], 1);
            idx = arraysFind.$ib(array, e => e > 1);
            assert.strictEqual(array[idx], 4);
            idx = arraysFind.$ib(array, e => e >= 8);
            assert.strictEqual(array[idx], 55);
            idx = arraysFind.$ib(array, e => e >= 61);
            assert.strictEqual(array[idx], 61);
            idx = arraysFind.$ib(array, e => e >= 69);
            assert.strictEqual(array[idx], 69);
            idx = arraysFind.$ib(array, e => e >= 70);
            assert.strictEqual(idx, array.length);
            idx = arraysFind.$ib([], e => e >= 0);
            assert.strictEqual(array[idx], 1);
        });
        test('quickSelect', () => {
            function assertMedian(expexted, data, nth = Math.floor(data.length / 2)) {
                const compare = (a, b) => a - b;
                const actual1 = arrays.$wb(nth, data, compare);
                assert.strictEqual(actual1, expexted);
                const actual2 = data.slice().sort(compare)[nth];
                assert.strictEqual(actual2, expexted);
            }
            assertMedian(5, [9, 1, 0, 2, 3, 4, 6, 8, 7, 10, 5]);
            assertMedian(8, [9, 1, 0, 2, 3, 4, 6, 8, 7, 10, 5], 8);
            assertMedian(8, [13, 4, 8]);
            assertMedian(4, [13, 4, 8, 4, 4]);
            assertMedian(13, [13, 4, 8], 2);
        });
        test('sortedDiff', () => {
            function compare(a, b) {
                return a - b;
            }
            let d = arrays.$Bb([1, 2, 4], [], compare);
            assert.deepStrictEqual(d, [
                { start: 0, deleteCount: 3, toInsert: [] }
            ]);
            d = arrays.$Bb([], [1, 2, 4], compare);
            assert.deepStrictEqual(d, [
                { start: 0, deleteCount: 0, toInsert: [1, 2, 4] }
            ]);
            d = arrays.$Bb([1, 2, 4], [1, 2, 4], compare);
            assert.deepStrictEqual(d, []);
            d = arrays.$Bb([1, 2, 4], [2, 3, 4, 5], compare);
            assert.deepStrictEqual(d, [
                { start: 0, deleteCount: 1, toInsert: [] },
                { start: 2, deleteCount: 0, toInsert: [3] },
                { start: 3, deleteCount: 0, toInsert: [5] },
            ]);
            d = arrays.$Bb([2, 3, 4, 5], [1, 2, 4], compare);
            assert.deepStrictEqual(d, [
                { start: 0, deleteCount: 0, toInsert: [1] },
                { start: 1, deleteCount: 1, toInsert: [] },
                { start: 3, deleteCount: 1, toInsert: [] },
            ]);
            d = arrays.$Bb([1, 3, 5, 7], [5, 9, 11], compare);
            assert.deepStrictEqual(d, [
                { start: 0, deleteCount: 2, toInsert: [] },
                { start: 3, deleteCount: 1, toInsert: [9, 11] }
            ]);
            d = arrays.$Bb([1, 3, 7], [5, 9, 11], compare);
            assert.deepStrictEqual(d, [
                { start: 0, deleteCount: 3, toInsert: [5, 9, 11] }
            ]);
        });
        test('delta sorted arrays', function () {
            function compare(a, b) {
                return a - b;
            }
            let d = arrays.$Cb([1, 2, 4], [], compare);
            assert.deepStrictEqual(d.removed, [1, 2, 4]);
            assert.deepStrictEqual(d.added, []);
            d = arrays.$Cb([], [1, 2, 4], compare);
            assert.deepStrictEqual(d.removed, []);
            assert.deepStrictEqual(d.added, [1, 2, 4]);
            d = arrays.$Cb([1, 2, 4], [1, 2, 4], compare);
            assert.deepStrictEqual(d.removed, []);
            assert.deepStrictEqual(d.added, []);
            d = arrays.$Cb([1, 2, 4], [2, 3, 4, 5], compare);
            assert.deepStrictEqual(d.removed, [1]);
            assert.deepStrictEqual(d.added, [3, 5]);
            d = arrays.$Cb([2, 3, 4, 5], [1, 2, 4], compare);
            assert.deepStrictEqual(d.removed, [3, 5]);
            assert.deepStrictEqual(d.added, [1]);
            d = arrays.$Cb([1, 3, 5, 7], [5, 9, 11], compare);
            assert.deepStrictEqual(d.removed, [1, 3, 7]);
            assert.deepStrictEqual(d.added, [9, 11]);
            d = arrays.$Cb([1, 3, 7], [5, 9, 11], compare);
            assert.deepStrictEqual(d.removed, [1, 3, 7]);
            assert.deepStrictEqual(d.added, [5, 9, 11]);
        });
        test('binarySearch', () => {
            function compare(a, b) {
                return a - b;
            }
            const array = [1, 4, 5, 7, 55, 59, 60, 61, 64, 69];
            assert.strictEqual(arrays.$ub(array, 1, compare), 0);
            assert.strictEqual(arrays.$ub(array, 5, compare), 2);
            // insertion point
            assert.strictEqual(arrays.$ub(array, 0, compare), ~0);
            assert.strictEqual(arrays.$ub(array, 6, compare), ~3);
            assert.strictEqual(arrays.$ub(array, 70, compare), ~10);
        });
        test('binarySearch2', () => {
            function compareTo(key) {
                return (index) => {
                    return array[index] - key;
                };
            }
            const array = [1, 4, 5, 7, 55, 59, 60, 61, 64, 69];
            assert.strictEqual(arrays.$vb(10, compareTo(1)), 0);
            assert.strictEqual(arrays.$vb(10, compareTo(5)), 2);
            // insertion point
            assert.strictEqual(arrays.$vb(10, compareTo(0)), ~0);
            assert.strictEqual(arrays.$vb(10, compareTo(6)), ~3);
            assert.strictEqual(arrays.$vb(10, compareTo(70)), ~10);
            assert.strictEqual(arrays.$vb(2, compareTo(5)), ~2);
        });
        test('distinct', () => {
            function compare(a) {
                return a;
            }
            assert.deepStrictEqual(arrays.$Kb(['32', '4', '5'], compare), ['32', '4', '5']);
            assert.deepStrictEqual(arrays.$Kb(['32', '4', '5', '4'], compare), ['32', '4', '5']);
            assert.deepStrictEqual(arrays.$Kb(['32', 'constructor', '5', '1'], compare), ['32', 'constructor', '5', '1']);
            assert.deepStrictEqual(arrays.$Kb(['32', 'constructor', 'proto', 'proto', 'constructor'], compare), ['32', 'constructor', 'proto']);
            assert.deepStrictEqual(arrays.$Kb(['32', '4', '5', '32', '4', '5', '32', '4', '5', '5'], compare), ['32', '4', '5']);
        });
        test('top', () => {
            const cmp = (a, b) => {
                assert.strictEqual(typeof a, 'number', 'typeof a');
                assert.strictEqual(typeof b, 'number', 'typeof b');
                return a - b;
            };
            assert.deepStrictEqual(arrays.top([], cmp, 1), []);
            assert.deepStrictEqual(arrays.top([1], cmp, 0), []);
            assert.deepStrictEqual(arrays.top([1, 2], cmp, 1), [1]);
            assert.deepStrictEqual(arrays.top([2, 1], cmp, 1), [1]);
            assert.deepStrictEqual(arrays.top([1, 3, 2], cmp, 2), [1, 2]);
            assert.deepStrictEqual(arrays.top([3, 2, 1], cmp, 3), [1, 2, 3]);
            assert.deepStrictEqual(arrays.top([4, 6, 2, 7, 8, 3, 5, 1], cmp, 3), [1, 2, 3]);
        });
        test('topAsync', async () => {
            const cmp = (a, b) => {
                assert.strictEqual(typeof a, 'number', 'typeof a');
                assert.strictEqual(typeof b, 'number', 'typeof b');
                return a - b;
            };
            await testTopAsync(cmp, 1);
            return testTopAsync(cmp, 2);
        });
        async function testTopAsync(cmp, m) {
            {
                const result = await arrays.$Eb([], cmp, 1, m);
                assert.deepStrictEqual(result, []);
            }
            {
                const result = await arrays.$Eb([1], cmp, 0, m);
                assert.deepStrictEqual(result, []);
            }
            {
                const result = await arrays.$Eb([1, 2], cmp, 1, m);
                assert.deepStrictEqual(result, [1]);
            }
            {
                const result = await arrays.$Eb([2, 1], cmp, 1, m);
                assert.deepStrictEqual(result, [1]);
            }
            {
                const result = await arrays.$Eb([1, 3, 2], cmp, 2, m);
                assert.deepStrictEqual(result, [1, 2]);
            }
            {
                const result = await arrays.$Eb([3, 2, 1], cmp, 3, m);
                assert.deepStrictEqual(result, [1, 2, 3]);
            }
            {
                const result = await arrays.$Eb([4, 6, 2, 7, 8, 3, 5, 1], cmp, 3, m);
                assert.deepStrictEqual(result, [1, 2, 3]);
            }
        }
        test('coalesce', () => {
            const a = arrays.$Fb([null, 1, null, 2, 3]);
            assert.strictEqual(a.length, 3);
            assert.strictEqual(a[0], 1);
            assert.strictEqual(a[1], 2);
            assert.strictEqual(a[2], 3);
            arrays.$Fb([null, 1, null, undefined, undefined, 2, 3]);
            assert.strictEqual(a.length, 3);
            assert.strictEqual(a[0], 1);
            assert.strictEqual(a[1], 2);
            assert.strictEqual(a[2], 3);
            let b = [];
            b[10] = 1;
            b[20] = 2;
            b[30] = 3;
            b = arrays.$Fb(b);
            assert.strictEqual(b.length, 3);
            assert.strictEqual(b[0], 1);
            assert.strictEqual(b[1], 2);
            assert.strictEqual(b[2], 3);
            let sparse = [];
            sparse[0] = 1;
            sparse[1] = 1;
            sparse[17] = 1;
            sparse[1000] = 1;
            sparse[1001] = 1;
            assert.strictEqual(sparse.length, 1002);
            sparse = arrays.$Fb(sparse);
            assert.strictEqual(sparse.length, 5);
        });
        test('coalesce - inplace', function () {
            let a = [null, 1, null, 2, 3];
            arrays.$Gb(a);
            assert.strictEqual(a.length, 3);
            assert.strictEqual(a[0], 1);
            assert.strictEqual(a[1], 2);
            assert.strictEqual(a[2], 3);
            a = [null, 1, null, undefined, undefined, 2, 3];
            arrays.$Gb(a);
            assert.strictEqual(a.length, 3);
            assert.strictEqual(a[0], 1);
            assert.strictEqual(a[1], 2);
            assert.strictEqual(a[2], 3);
            const b = [];
            b[10] = 1;
            b[20] = 2;
            b[30] = 3;
            arrays.$Gb(b);
            assert.strictEqual(b.length, 3);
            assert.strictEqual(b[0], 1);
            assert.strictEqual(b[1], 2);
            assert.strictEqual(b[2], 3);
            const sparse = [];
            sparse[0] = 1;
            sparse[1] = 1;
            sparse[17] = 1;
            sparse[1000] = 1;
            sparse[1001] = 1;
            assert.strictEqual(sparse.length, 1002);
            arrays.$Gb(sparse);
            assert.strictEqual(sparse.length, 5);
        });
        test('insert, remove', function () {
            const array = [];
            const remove = arrays.$Sb(array, 'foo');
            assert.strictEqual(array[0], 'foo');
            remove();
            assert.strictEqual(array.length, 0);
        });
        test('splice', function () {
            // negative start index, absolute value greater than the length
            let array = [1, 2, 3, 4, 5];
            arrays.$4b(array, -6, 3, [6, 7]);
            assert.strictEqual(array.length, 4);
            assert.strictEqual(array[0], 6);
            assert.strictEqual(array[1], 7);
            assert.strictEqual(array[2], 4);
            assert.strictEqual(array[3], 5);
            // negative start index, absolute value less than the length
            array = [1, 2, 3, 4, 5];
            arrays.$4b(array, -3, 3, [6, 7]);
            assert.strictEqual(array.length, 4);
            assert.strictEqual(array[0], 1);
            assert.strictEqual(array[1], 2);
            assert.strictEqual(array[2], 6);
            assert.strictEqual(array[3], 7);
            // Start index less than the length
            array = [1, 2, 3, 4, 5];
            arrays.$4b(array, 3, 3, [6, 7]);
            assert.strictEqual(array.length, 5);
            assert.strictEqual(array[0], 1);
            assert.strictEqual(array[1], 2);
            assert.strictEqual(array[2], 3);
            assert.strictEqual(array[3], 6);
            assert.strictEqual(array[4], 7);
            // Start index greater than the length
            array = [1, 2, 3, 4, 5];
            arrays.$4b(array, 6, 3, [6, 7]);
            assert.strictEqual(array.length, 7);
            assert.strictEqual(array[0], 1);
            assert.strictEqual(array[1], 2);
            assert.strictEqual(array[2], 3);
            assert.strictEqual(array[3], 4);
            assert.strictEqual(array[4], 5);
            assert.strictEqual(array[5], 6);
            assert.strictEqual(array[6], 7);
        });
        test('findMaxBy', () => {
            const array = [{ v: 3 }, { v: 5 }, { v: 2 }, { v: 2 }, { v: 2 }, { v: 5 }];
            assert.strictEqual(array.indexOf(arraysFind.$lb(array, arrays.$5b(v => v.v, arrays.$7b))), 1);
        });
        test('findLastMaxBy', () => {
            const array = [{ v: 3 }, { v: 5 }, { v: 2 }, { v: 2 }, { v: 2 }, { v: 5 }];
            assert.strictEqual(array.indexOf(arraysFind.$mb(array, arrays.$5b(v => v.v, arrays.$7b))), 5);
        });
        test('findMinBy', () => {
            const array = [{ v: 3 }, { v: 5 }, { v: 2 }, { v: 2 }, { v: 2 }, { v: 5 }];
            assert.strictEqual(array.indexOf(arraysFind.$nb(array, arrays.$5b(v => v.v, arrays.$7b))), 2);
        });
        suite('ArrayQueue', () => {
            suite('takeWhile/takeFromEndWhile', () => {
                test('TakeWhile 1', () => {
                    const queue1 = new arrays.$0b([9, 8, 1, 7, 6]);
                    assert.deepStrictEqual(queue1.takeWhile(x => x > 5), [9, 8]);
                    assert.deepStrictEqual(queue1.takeWhile(x => x < 7), [1]);
                    assert.deepStrictEqual(queue1.takeWhile(x => true), [7, 6]);
                });
                test('TakeFromEndWhile 1', () => {
                    const queue1 = new arrays.$0b([9, 8, 1, 7, 6]);
                    assert.deepStrictEqual(queue1.takeFromEndWhile(x => x > 5), [7, 6]);
                    assert.deepStrictEqual(queue1.takeFromEndWhile(x => x < 2), [1]);
                    assert.deepStrictEqual(queue1.takeFromEndWhile(x => true), [9, 8]);
                });
            });
            suite('takeWhile/takeFromEndWhile monotonous', () => {
                function testMonotonous(array, predicate) {
                    function normalize(arr) {
                        if (arr.length === 0) {
                            return null;
                        }
                        return arr;
                    }
                    const negatedPredicate = (a) => !predicate(a);
                    {
                        const queue1 = new arrays.$0b(array);
                        assert.deepStrictEqual(queue1.takeWhile(predicate), normalize(array.filter(predicate)));
                        assert.deepStrictEqual(queue1.length, array.length - array.filter(predicate).length);
                        assert.deepStrictEqual(queue1.takeWhile(() => true), normalize(array.filter(negatedPredicate)));
                    }
                    {
                        const queue3 = new arrays.$0b(array);
                        assert.deepStrictEqual(queue3.takeFromEndWhile(negatedPredicate), normalize(array.filter(negatedPredicate)));
                        assert.deepStrictEqual(queue3.length, array.length - array.filter(negatedPredicate).length);
                        assert.deepStrictEqual(queue3.takeFromEndWhile(() => true), normalize(array.filter(predicate)));
                    }
                }
                const array = [1, 1, 1, 2, 5, 5, 7, 8, 8];
                test('TakeWhile 1', () => testMonotonous(array, value => value <= 1));
                test('TakeWhile 2', () => testMonotonous(array, value => value < 5));
                test('TakeWhile 3', () => testMonotonous(array, value => value <= 5));
                test('TakeWhile 4', () => testMonotonous(array, value => true));
                test('TakeWhile 5', () => testMonotonous(array, value => false));
                const array2 = [1, 1, 1, 2, 5, 5, 7, 8, 8, 9, 9, 9, 9, 10, 10];
                test('TakeWhile 6', () => testMonotonous(array2, value => value < 10));
                test('TakeWhile 7', () => testMonotonous(array2, value => value < 7));
                test('TakeWhile 8', () => testMonotonous(array2, value => value < 5));
                test('TakeWhile Empty', () => testMonotonous([], value => value <= 5));
            });
        });
    });
});
//# sourceMappingURL=arrays.test.js.map