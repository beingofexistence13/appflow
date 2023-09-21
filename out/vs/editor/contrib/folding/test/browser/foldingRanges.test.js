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
            const nRegions = foldingRanges_1.MAX_FOLDING_REGIONS;
            const collector = new indentRangeProvider_1.RangesCollector({ limit: foldingRanges_1.MAX_FOLDING_REGIONS, update: () => { } });
            for (let i = 0; i < nRegions; i++) {
                const startLineNumber = lines.length;
                lines.push('#region');
                const endLineNumber = lines.length;
                lines.push('#endregion');
                collector.insertFirst(startLineNumber, endLineNumber, 0);
            }
            const model = (0, testTextModel_1.createTextModel)(lines.join('\n'));
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
            const textModel = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            try {
                const actual = (0, indentRangeProvider_1.computeRanges)(textModel, false, markers);
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
            const model = (0, testTextModel_1.createTextModel)(lines.join('\n'));
            const actual = (0, indentRangeProvider_1.computeRanges)(model, false, markers);
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
            const result = foldingRanges_1.FoldingRegions.sanitizeAndMerge(regionSet1, regionSet2, 100);
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
            const result = foldingRanges_1.FoldingRegions.sanitizeAndMerge(regionSet1, regionSet2, 100);
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
            const result = foldingRanges_1.FoldingRegions.sanitizeAndMerge(regionSet1, regionSet2, 100);
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
            const result = foldingRanges_1.FoldingRegions.sanitizeAndMerge(regionSet1, regionSet2, 100);
            assert.strictEqual(result.length, 3, 'result length4');
            assertEqualRanges(result[0], foldRange(1, 100, false, 0 /* FoldSource.provider */, 'a1'), 'R1');
            assertEqualRanges(result[1], foldRange(20, 28, true, 2 /* FoldSource.recovered */, 'b1'), 'R2');
            assertEqualRanges(result[2], foldRange(30, 38, true, 2 /* FoldSource.recovered */, 'b2'), 'R3');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ1Jhbmdlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZm9sZGluZy90ZXN0L2Jyb3dzZXIvZm9sZGluZ1Jhbmdlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLE1BQU0sT0FBTyxHQUFtQjtRQUMvQixLQUFLLEVBQUUsV0FBVztRQUNsQixHQUFHLEVBQUUsY0FBYztLQUNuQixDQUFDO0lBRUYsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFFM0IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBVSxFQUFFLFlBQWlDLFNBQVMsRUFBRSxvQ0FBd0MsRUFBRSxPQUEyQixTQUFTLEVBQUUsRUFBRSxDQUMxSyxDQUFXO1lBQ1YsZUFBZSxFQUFFLElBQUk7WUFDckIsYUFBYSxFQUFFLEVBQUU7WUFDakIsSUFBSSxFQUFFLElBQUk7WUFDVixXQUFXLEVBQUUsU0FBUyxJQUFJLEtBQUs7WUFDL0IsTUFBTTtTQUNOLENBQUEsQ0FBQztRQUNILE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxNQUFpQixFQUFFLE1BQWlCLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDL0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlLEVBQUUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUM3RSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO1lBQ3JDLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztZQUMzQixNQUFNLFFBQVEsR0FBRyxtQ0FBbUIsQ0FBQztZQUNyQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHFDQUFlLENBQUMsRUFBRSxLQUFLLEVBQUUsbUNBQW1CLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbEMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDckMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDekIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQkFBZSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWpCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7WUFDdEIsTUFBTSxLQUFLLEdBQUc7Z0JBQ2QsTUFBTSxDQUFDLFNBQVM7Z0JBQ2hCLE1BQU0sQ0FBQyxZQUFZO2dCQUNuQixNQUFNLENBQUMsV0FBVztnQkFDbEIsTUFBTSxDQUFDLGdCQUFnQjtnQkFDdkIsTUFBTSxDQUFDLGlCQUFpQjtnQkFDeEIsTUFBTSxDQUFDLGlCQUFpQjtnQkFDeEIsTUFBTSxDQUFDLE9BQU87Z0JBQ2QsTUFBTSxDQUFDLEVBQUU7Z0JBQ1QsTUFBTSxDQUFDLGlCQUFpQjtnQkFDeEIsT0FBTyxDQUFDLGVBQWU7Z0JBQ3ZCLE9BQU8sQ0FBQyxPQUFPO2dCQUNmLE9BQU8sQ0FBQyxLQUFLO2dCQUNiLE9BQU8sQ0FBQyxHQUFHO2FBQUMsQ0FBQztZQUViLE1BQU0sU0FBUyxHQUFHLElBQUEsK0JBQWUsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEQsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxJQUFBLG1DQUFhLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDeEQsb0JBQW9CO2dCQUNwQixxQkFBcUI7Z0JBQ3JCLHFCQUFxQjtnQkFDckIsb0JBQW9CO2dCQUNwQixxQkFBcUI7Z0JBRXJCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNuRDtvQkFBUztnQkFDVCxTQUFTLENBQUMsT0FBTyxF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