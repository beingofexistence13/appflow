/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing"], function (require, exports, assert, range_1, rangeMapping_1, offsetRange_1, defaultLinesDiffComputer_1, linesSliceCharSequence_1, myersDiffAlgorithm_1, dynamicProgrammingDiffing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('myers', () => {
        test('1', () => {
            const s1 = new linesSliceCharSequence_1.LinesSliceCharSequence(['hello world'], new offsetRange_1.OffsetRange(0, 1), true);
            const s2 = new linesSliceCharSequence_1.LinesSliceCharSequence(['hallo welt'], new offsetRange_1.OffsetRange(0, 1), true);
            const a = true ? new myersDiffAlgorithm_1.MyersDiffAlgorithm() : new dynamicProgrammingDiffing_1.DynamicProgrammingDiffing();
            a.compute(s1, s2);
        });
    });
    suite('lineRangeMapping', () => {
        test('Simple', () => {
            assert.deepStrictEqual((0, defaultLinesDiffComputer_1.getLineRangeMapping)(new rangeMapping_1.RangeMapping(new range_1.Range(2, 1, 3, 1), new range_1.Range(2, 1, 2, 1)), [
                'const abc = "helloworld".split("");',
                '',
                ''
            ], [
                'const asciiLower = "helloworld".split("");',
                ''
            ]).toString(), "{[2,3)->[2,2)}");
        });
        test('Empty Lines', () => {
            assert.deepStrictEqual((0, defaultLinesDiffComputer_1.getLineRangeMapping)(new rangeMapping_1.RangeMapping(new range_1.Range(2, 1, 2, 1), new range_1.Range(2, 1, 4, 1)), [
                '',
                '',
            ], [
                '',
                '',
                '',
                '',
            ]).toString(), "{[2,2)->[2,4)}");
        });
    });
    suite('LinesSliceCharSequence', () => {
        const sequence = new linesSliceCharSequence_1.LinesSliceCharSequence([
            'line1: foo',
            'line2: fizzbuzz',
            'line3: barr',
            'line4: hello world',
            'line5: bazz',
        ], new offsetRange_1.OffsetRange(1, 4), true);
        test('translateOffset', () => {
            assert.deepStrictEqual({ result: offsetRange_1.OffsetRange.ofLength(sequence.length).map(offset => sequence.translateOffset(offset).toString()) }, ({
                result: [
                    "(2,1)", "(2,2)", "(2,3)", "(2,4)", "(2,5)", "(2,6)", "(2,7)", "(2,8)", "(2,9)", "(2,10)", "(2,11)",
                    "(2,12)", "(2,13)", "(2,14)", "(2,15)", "(2,16)",
                    "(3,1)", "(3,2)", "(3,3)", "(3,4)", "(3,5)", "(3,6)", "(3,7)", "(3,8)", "(3,9)", "(3,10)", "(3,11)", "(3,12)",
                    "(4,1)", "(4,2)", "(4,3)", "(4,4)", "(4,5)", "(4,6)", "(4,7)", "(4,8)", "(4,9)",
                    "(4,10)", "(4,11)", "(4,12)", "(4,13)", "(4,14)", "(4,15)", "(4,16)", "(4,17)",
                    "(4,18)", "(4,19)"
                ]
            }));
        });
        test('extendToFullLines', () => {
            assert.deepStrictEqual({ result: sequence.getText(sequence.extendToFullLines(new offsetRange_1.OffsetRange(20, 25))) }, ({ result: "line3: barr\n" }));
            assert.deepStrictEqual({ result: sequence.getText(sequence.extendToFullLines(new offsetRange_1.OffsetRange(20, 45))) }, ({ result: "line3: barr\nline4: hello world\n" }));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9ub2RlL2RpZmZpbmcvZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFXaEcsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDbkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7WUFDZCxNQUFNLEVBQUUsR0FBRyxJQUFJLCtDQUFzQixDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSx5QkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRixNQUFNLEVBQUUsR0FBRyxJQUFJLCtDQUFzQixDQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSx5QkFBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVuRixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxxREFBeUIsRUFBRSxDQUFDO1lBQzVFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1FBQzlCLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsOENBQW1CLEVBQ2xCLElBQUksMkJBQVksQ0FDZixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDckIsSUFB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