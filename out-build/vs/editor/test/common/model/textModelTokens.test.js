/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/offsetRange", "vs/editor/common/model/textModelTokens"], function (require, exports, assert, utils_1, offsetRange_1, textModelTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RangePriorityQueueImpl', () => {
        (0, utils_1.$bT)();
        test('addRange', () => {
            const ranges = [];
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(0, 2), ranges);
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(10, 13), ranges);
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(20, 24), ranges);
            assert.deepStrictEqual(ranges.map(r => r.toString()), (['[0, 2)', '[10, 13)', '[20, 24)']));
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(2, 10), ranges);
            assert.deepStrictEqual(ranges.map(r => r.toString()), (['[0, 13)', '[20, 24)']));
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(14, 19), ranges);
            assert.deepStrictEqual(ranges.map(r => r.toString()), (['[0, 13)', '[14, 19)', '[20, 24)']));
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(10, 22), ranges);
            assert.deepStrictEqual(ranges.map(r => r.toString()), (['[0, 24)']));
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(-1, 29), ranges);
            assert.deepStrictEqual(ranges.map(r => r.toString()), (['[-1, 29)']));
            offsetRange_1.$rs.addRange(new offsetRange_1.$rs(-10, -5), ranges);
            assert.deepStrictEqual(ranges.map(r => r.toString()), (['[-10, -5)', '[-1, 29)']));
        });
        test('addRangeAndResize', () => {
            const queue = new textModelTokens_1.$DC();
            queue.addRange(new offsetRange_1.$rs(0, 20));
            queue.addRange(new offsetRange_1.$rs(100, 120));
            queue.addRange(new offsetRange_1.$rs(200, 220));
            // disjoint
            queue.addRangeAndResize(new offsetRange_1.$rs(25, 27), 0);
            assert.deepStrictEqual(queue.getRanges().map(r => r.toString()), (['[0, 20)', '[98, 118)', '[198, 218)']));
            queue.addRangeAndResize(new offsetRange_1.$rs(19, 20), 0);
            assert.deepStrictEqual(queue.getRanges().map(r => r.toString()), (['[0, 19)', '[97, 117)', '[197, 217)']));
            queue.addRangeAndResize(new offsetRange_1.$rs(19, 97), 0);
            assert.deepStrictEqual(queue.getRanges().map(r => r.toString()), (['[0, 39)', '[119, 139)']));
            queue.addRangeAndResize(new offsetRange_1.$rs(-1000, 1000), 0);
            assert.deepStrictEqual(queue.getRanges().map(r => r.toString()), ([]));
        });
    });
});
//# sourceMappingURL=textModelTokens.test.js.map