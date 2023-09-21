define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, assert, utils_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Core - Range', () => {
        (0, utils_1.$bT)();
        test('empty range', () => {
            const s = new range_1.$ks(1, 1, 1, 1);
            assert.strictEqual(s.startLineNumber, 1);
            assert.strictEqual(s.startColumn, 1);
            assert.strictEqual(s.endLineNumber, 1);
            assert.strictEqual(s.endColumn, 1);
            assert.strictEqual(s.isEmpty(), true);
        });
        test('swap start and stop same line', () => {
            const s = new range_1.$ks(1, 2, 1, 1);
            assert.strictEqual(s.startLineNumber, 1);
            assert.strictEqual(s.startColumn, 1);
            assert.strictEqual(s.endLineNumber, 1);
            assert.strictEqual(s.endColumn, 2);
            assert.strictEqual(s.isEmpty(), false);
        });
        test('swap start and stop', () => {
            const s = new range_1.$ks(2, 1, 1, 2);
            assert.strictEqual(s.startLineNumber, 1);
            assert.strictEqual(s.startColumn, 2);
            assert.strictEqual(s.endLineNumber, 2);
            assert.strictEqual(s.endColumn, 1);
            assert.strictEqual(s.isEmpty(), false);
        });
        test('no swap same line', () => {
            const s = new range_1.$ks(1, 1, 1, 2);
            assert.strictEqual(s.startLineNumber, 1);
            assert.strictEqual(s.startColumn, 1);
            assert.strictEqual(s.endLineNumber, 1);
            assert.strictEqual(s.endColumn, 2);
            assert.strictEqual(s.isEmpty(), false);
        });
        test('no swap', () => {
            const s = new range_1.$ks(1, 1, 2, 1);
            assert.strictEqual(s.startLineNumber, 1);
            assert.strictEqual(s.startColumn, 1);
            assert.strictEqual(s.endLineNumber, 2);
            assert.strictEqual(s.endColumn, 1);
            assert.strictEqual(s.isEmpty(), false);
        });
        test('compareRangesUsingEnds', () => {
            let a, b;
            a = new range_1.$ks(1, 1, 1, 3);
            b = new range_1.$ks(1, 2, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) < 0, 'a.start < b.start, a.end < b.end');
            a = new range_1.$ks(1, 1, 1, 3);
            b = new range_1.$ks(1, 1, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) < 0, 'a.start = b.start, a.end < b.end');
            a = new range_1.$ks(1, 2, 1, 3);
            b = new range_1.$ks(1, 1, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) < 0, 'a.start > b.start, a.end < b.end');
            a = new range_1.$ks(1, 1, 1, 4);
            b = new range_1.$ks(1, 2, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) < 0, 'a.start < b.start, a.end = b.end');
            a = new range_1.$ks(1, 1, 1, 4);
            b = new range_1.$ks(1, 1, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) === 0, 'a.start = b.start, a.end = b.end');
            a = new range_1.$ks(1, 2, 1, 4);
            b = new range_1.$ks(1, 1, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) > 0, 'a.start > b.start, a.end = b.end');
            a = new range_1.$ks(1, 1, 1, 5);
            b = new range_1.$ks(1, 2, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) > 0, 'a.start < b.start, a.end > b.end');
            a = new range_1.$ks(1, 1, 2, 4);
            b = new range_1.$ks(1, 1, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) > 0, 'a.start = b.start, a.end > b.end');
            a = new range_1.$ks(1, 2, 5, 1);
            b = new range_1.$ks(1, 1, 1, 4);
            assert.ok(range_1.$ks.compareRangesUsingEnds(a, b) > 0, 'a.start > b.start, a.end > b.end');
        });
        test('containsPosition', () => {
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(1, 3)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(2, 1)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(2, 2)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(2, 3)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(3, 1)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(5, 9)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(5, 10)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(5, 11)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsPosition(new position_1.$js(6, 1)), false);
        });
        test('containsRange', () => {
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(1, 3, 2, 2)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(2, 1, 2, 2)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(2, 2, 5, 11)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(2, 2, 6, 1)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(5, 9, 6, 1)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(5, 10, 6, 1)), false);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(2, 2, 5, 10)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(2, 3, 5, 9)), true);
            assert.strictEqual(new range_1.$ks(2, 2, 5, 10).containsRange(new range_1.$ks(3, 100, 4, 100)), true);
        });
        test('areIntersecting', () => {
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(2, 2, 3, 2), new range_1.$ks(4, 2, 5, 2)), false);
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(4, 2, 5, 2), new range_1.$ks(2, 2, 3, 2)), false);
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(4, 2, 5, 2), new range_1.$ks(5, 2, 6, 2)), false);
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(5, 2, 6, 2), new range_1.$ks(4, 2, 5, 2)), false);
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(2, 2, 2, 7), new range_1.$ks(2, 4, 2, 6)), true);
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(2, 2, 2, 7), new range_1.$ks(2, 4, 2, 9)), true);
            assert.strictEqual(range_1.$ks.areIntersecting(new range_1.$ks(2, 4, 2, 9), new range_1.$ks(2, 2, 2, 7)), true);
        });
    });
});
//# sourceMappingURL=range.test.js.map