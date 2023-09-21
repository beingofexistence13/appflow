/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/contrib/folding/browser/foldingRanges", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/test/common/testTextModel"], function (require, exports, assert, foldingRanges_1, indentRangeProvider_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const markers = {
        start: /^#region$/,
        end: /^#endregion$/
    };
    suite('FoldingRanges', () => {
        const foldRange = (from, to, collapsed = undefined, source = 0 /* FoldSource.provider */, type = undefined) => ({
            startLineNumber: from,
            endLineNumber: to,
            type: type,
            isCollapsed: collapsed || false,
            source
        });
        const assertEqualRanges = (range1, range2, msg) => {
            assert.strictEqual(range1.startLineNumber, range2.startLineNumber, msg + ' start');
            assert.strictEqual(range1.endLineNumber, range2.endLineNumber, msg + ' end');
            assert.strictEqual(range1.type, range2.type, msg + ' type');
            assert.strictEqual(range1.isCollapsed, range2.isCollapsed, msg + ' collapsed');
            assert.strictEqual(range1.source, range2.source, msg + ' source');
        };
        test('test max folding regions', () => {
            const lines = [];
            const nRegions = foldingRanges_1.$$7;
            const collector = new indentRangeProvider_1.$q8({ limit: foldingRanges_1.$$7, update: () => { } });
            for (let i = 0; i < nRegions; i++) {
                const startLineNumber = lines.length;
                lines.push('#region');
                const endLineNumber = lines.length;
                lines.push('#endregion');
                collector.insertFirst(startLineNumber, endLineNumber, 0);
            }
            const model = (0, testTextModel_1.$O0b)(lines.join('\n'));
            const actual = collector.toIndentRanges(model);
            assert.strictEqual(actual.length, nRegions, 'len');
            model.dispose();
        });
        test('findRange', () => {
            const lines = [
                /* 1*/ '#region',
                /* 2*/ '#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            const textModel = (0, testTextModel_1.$O0b)(lines.join('\n'));
            try {
                const actual = (0, indentRangeProvider_1.$r8)(textModel, false, markers);
                // let r0 = r(1, 2);
                // let r1 = r(3, 12);
                // let r2 = r(4, 11);
                // let r3 = r(5, 6);
                // let r4 = r(9, 10);
                assert.strictEqual(actual.findRange(1), 0, '1');
                assert.strictEqual(actual.findRange(2), 0, '2');
                assert.strictEqual(actual.findRange(3), 1, '3');
                assert.strictEqual(actual.findRange(4), 2, '4');
                assert.strictEqual(actual.findRange(5), 3, '5');
                assert.strictEqual(actual.findRange(6), 3, '6');
                assert.strictEqual(actual.findRange(7), 2, '7');
                assert.strictEqual(actual.findRange(8), 2, '8');
                assert.strictEqual(actual.findRange(9), 4, '9');
                assert.strictEqual(actual.findRange(10), 4, '10');
                assert.strictEqual(actual.findRange(11), 2, '11');
                assert.strictEqual(actual.findRange(12), 1, '12');
                assert.strictEqual(actual.findRange(13), -1, '13');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapsed', () => {
            const lines = [];
            const nRegions = 500;
            for (let i = 0; i < nRegions; i++) {
                lines.push('#region');
            }
            for (let i = 0; i < nRegions; i++) {
                lines.push('#endregion');
            }
            const model = (0, testTextModel_1.$O0b)(lines.join('\n'));
            const actual = (0, indentRangeProvider_1.$r8)(model, false, markers);
            assert.strictEqual(actual.length, nRegions, 'len');
            for (let i = 0; i < nRegions; i++) {
                actual.setCollapsed(i, i % 3 === 0);
            }
            for (let i = 0; i < nRegions; i++) {
                assert.strictEqual(actual.isCollapsed(i), i % 3 === 0, 'line' + i);
            }
            model.dispose();
        });
        test('sanitizeAndMerge1', () => {
            const regionSet1 = [
                foldRange(0, 100),
                foldRange(1, 100, false, 0 /* FoldSource.provider */, 'A'),
                foldRange(1, 100, false, 0 /* FoldSource.provider */, 'Z'),
                foldRange(10, 10, false),
                foldRange(20, 80, false, 0 /* FoldSource.provider */, 'C1'),
                foldRange(22, 80, true, 0 /* FoldSource.provider */, 'D1'),
                foldRange(90, 101), // invalid, should be removed
            ];
            const regionSet2 = [
                foldRange(20, 80, true),
                foldRange(18, 80, true),
                foldRange(21, 81, true, 0 /* FoldSource.provider */, 'Z'),
                foldRange(22, 80, true, 0 /* FoldSource.provider */, 'D2'), // should merge with D1
            ];
            const result = foldingRanges_1.$a8.sanitizeAndMerge(regionSet1, regionSet2, 100);
            assert.strictEqual(result.length, 3, 'result length1');
            assertEqualRanges(result[0], foldRange(1, 100, false, 0 /* FoldSource.provider */, 'A'), 'A1');
            assertEqualRanges(result[1], foldRange(20, 80, true, 0 /* FoldSource.provider */, 'C1'), 'C1');
            assertEqualRanges(result[2], foldRange(22, 80, true, 0 /* FoldSource.provider */, 'D1'), 'D1');
        });
        test('sanitizeAndMerge2', () => {
            const regionSet1 = [
                foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'),
                foldRange(2, 100, false, 0 /* FoldSource.provider */, 'a2'),
                foldRange(3, 19, false, 0 /* FoldSource.provider */, 'a3'),
                foldRange(20, 71, false, 0 /* FoldSource.provider */, 'a4'),
                foldRange(21, 29, false, 0 /* FoldSource.provider */, 'a5'),
                foldRange(81, 91, false, 0 /* FoldSource.provider */, 'a6'), // overlaps b4
            ];
            const regionSet2 = [
                foldRange(30, 39, true, 0 /* FoldSource.provider */, 'b1'),
                foldRange(40, 49, true, 1 /* FoldSource.userDefined */, 'b2'),
                foldRange(50, 100, true, 1 /* FoldSource.userDefined */, 'b3'),
                foldRange(80, 90, true, 1 /* FoldSource.userDefined */, 'b4'),
                foldRange(92, 100, true, 1 /* FoldSource.userDefined */, 'b5'), // valid
            ];
            const result = foldingRanges_1.$a8.sanitizeAndMerge(regionSet1, regionSet2, 100);
            assert.strictEqual(result.length, 9, 'result length1');
            assertEqualRanges(result[0], foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'), 'P1');
            assertEqualRanges(result[1], foldRange(2, 100, false, 0 /* FoldSource.provider */, 'a2'), 'P2');
            assertEqualRanges(result[2], foldRange(3, 19, false, 0 /* FoldSource.provider */, 'a3'), 'P3');
            assertEqualRanges(result[3], foldRange(21, 29, false, 0 /* FoldSource.provider */, 'a5'), 'P4');
            assertEqualRanges(result[4], foldRange(30, 39, true, 2 /* FoldSource.recovered */, 'b1'), 'P5');
            assertEqualRanges(result[5], foldRange(40, 49, true, 1 /* FoldSource.userDefined */, 'b2'), 'P6');
            assertEqualRanges(result[6], foldRange(50, 100, true, 1 /* FoldSource.userDefined */, 'b3'), 'P7');
            assertEqualRanges(result[7], foldRange(80, 90, true, 1 /* FoldSource.userDefined */, 'b4'), 'P8');
            assertEqualRanges(result[8], foldRange(92, 100, true, 1 /* FoldSource.userDefined */, 'b5'), 'P9');
        });
        test('sanitizeAndMerge3', () => {
            const regionSet1 = [
                foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'),
                foldRange(10, 29, false, 0 /* FoldSource.provider */, 'a2'),
                foldRange(35, 39, true, 2 /* FoldSource.recovered */, 'a3'), // valid
            ];
            const regionSet2 = [
                foldRange(10, 29, true, 2 /* FoldSource.recovered */, 'b1'),
                foldRange(20, 28, true, 0 /* FoldSource.provider */, 'b2'),
                foldRange(30, 39, true, 2 /* FoldSource.recovered */, 'b3'), // should remain
            ];
            const result = foldingRanges_1.$a8.sanitizeAndMerge(regionSet1, regionSet2, 100);
            assert.strictEqual(result.length, 5, 'result length3');
            assertEqualRanges(result[0], foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'), 'R1');
            assertEqualRanges(result[1], foldRange(10, 29, true, 0 /* FoldSource.provider */, 'a2'), 'R2');
            assertEqualRanges(result[2], foldRange(20, 28, true, 2 /* FoldSource.recovered */, 'b2'), 'R3');
            assertEqualRanges(result[3], foldRange(30, 39, true, 2 /* FoldSource.recovered */, 'b3'), 'R3');
            assertEqualRanges(result[4], foldRange(35, 39, true, 2 /* FoldSource.recovered */, 'a3'), 'R4');
        });
        test('sanitizeAndMerge4', () => {
            const regionSet1 = [
                foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'), // valid
            ];
            const regionSet2 = [
                foldRange(20, 28, true, 0 /* FoldSource.provider */, 'b1'),
                foldRange(30, 38, true, 0 /* FoldSource.provider */, 'b2'), // hidden
            ];
            const result = foldingRanges_1.$a8.sanitizeAndMerge(regionSet1, regionSet2, 100);
            assert.strictEqual(result.length, 3, 'result length4');
            assertEqualRanges(result[0], foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'), 'R1');
            assertEqualRanges(result[1], foldRange(20, 28, true, 2 /* FoldSource.recovered */, 'b1'), 'R2');
            assertEqualRanges(result[2], foldRange(30, 38, true, 2 /* FoldSource.recovered */, 'b2'), 'R3');
        });
    });
});
//# sourceMappingURL=foldingRanges.test.js.map