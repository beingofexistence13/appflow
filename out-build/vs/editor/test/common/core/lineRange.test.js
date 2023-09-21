/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/lineRange"], function (require, exports, assert, utils_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LineRange', () => {
        (0, utils_1.$bT)();
        test('contains', () => {
            const r = new lineRange_1.$ts(2, 3);
            assert.deepStrictEqual(r.contains(1), false);
            assert.deepStrictEqual(r.contains(2), true);
            assert.deepStrictEqual(r.contains(3), false);
            assert.deepStrictEqual(r.contains(4), false);
        });
    });
    suite('LineRangeSet', () => {
        (0, utils_1.$bT)();
        test('addRange', () => {
            const set = new lineRange_1.$us();
            set.addRange(new lineRange_1.$ts(2, 3));
            set.addRange(new lineRange_1.$ts(3, 4));
            set.addRange(new lineRange_1.$ts(10, 20));
            assert.deepStrictEqual(set.toString(), '[2,4), [10,20)');
            set.addRange(new lineRange_1.$ts(3, 21));
            assert.deepStrictEqual(set.toString(), '[2,21)');
        });
        test('getUnion', () => {
            const set1 = new lineRange_1.$us([
                new lineRange_1.$ts(2, 3),
                new lineRange_1.$ts(5, 7),
                new lineRange_1.$ts(10, 20)
            ]);
            const set2 = new lineRange_1.$us([
                new lineRange_1.$ts(3, 4),
                new lineRange_1.$ts(6, 8),
                new lineRange_1.$ts(9, 11)
            ]);
            const union = set1.getUnion(set2);
            assert.deepStrictEqual(union.toString(), '[2,4), [5,8), [9,20)');
        });
        test('intersects', () => {
            const set1 = new lineRange_1.$us([
                new lineRange_1.$ts(2, 3),
                new lineRange_1.$ts(5, 7),
                new lineRange_1.$ts(10, 20)
            ]);
            assert.deepStrictEqual(set1.intersects(new lineRange_1.$ts(1, 2)), false);
            assert.deepStrictEqual(set1.intersects(new lineRange_1.$ts(1, 3)), true);
            assert.deepStrictEqual(set1.intersects(new lineRange_1.$ts(3, 5)), false);
        });
    });
});
//# sourceMappingURL=lineRange.test.js.map