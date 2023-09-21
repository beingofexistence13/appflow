/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewModel"], function (require, exports, assert, utils_1, range_1, lineDecorations_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor ViewLayout - ViewLineParts', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Bug 9827:Overlapping inline decorations can cause wrong inline class to be applied', () => {
            const result = lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 11, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c2 c1', 0),
                new lineDecorations_1.DecorationSegment(3, 9, 'c1', 0),
            ]);
        });
        test('issue #3462: no whitespace shown at the end of a decorated line', () => {
            const result = lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(15, 21, 'mtkw', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(20, 21, 'inline-folded', 0 /* InlineDecorationType.Regular */),
            ]);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.DecorationSegment(14, 18, 'mtkw', 0),
                new lineDecorations_1.DecorationSegment(19, 19, 'mtkw inline-folded', 0)
            ]);
        });
        test('issue #3661: Link decoration bleeds to next line when wrapping', () => {
            const result = lineDecorations_1.LineDecoration.filter([
                new viewModel_1.InlineDecoration(new range_1.Range(2, 12, 3, 30), 'detected-link', 0 /* InlineDecorationType.Regular */)
            ], 3, 12, 500);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.LineDecoration(12, 30, 'detected-link', 0 /* InlineDecorationType.Regular */),
            ]);
        });
        test('issue #37401: Allow both before and after decorations on empty line', () => {
            const result = lineDecorations_1.LineDecoration.filter([
                new viewModel_1.InlineDecoration(new range_1.Range(4, 1, 4, 2), 'before', 1 /* InlineDecorationType.Before */),
                new viewModel_1.InlineDecoration(new range_1.Range(4, 0, 4, 1), 'after', 2 /* InlineDecorationType.After */),
            ], 4, 1, 500);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.LineDecoration(1, 2, 'before', 1 /* InlineDecorationType.Before */),
                new lineDecorations_1.LineDecoration(0, 1, 'after', 2 /* InlineDecorationType.After */),
            ]);
        });
        test('ViewLineParts', () => {
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 2, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 0, 'c1', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 3, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c1 c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1 c1*', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c1 c1* c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1**', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1 c1* c1**', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c1 c1* c1** c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1**', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2*', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1 c1* c1**', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c1 c1* c1** c2 c2*', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.LineDecorationsNormalizer.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.LineDecoration(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 4, 'c1**', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 4, 'c2', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(3, 5, 'c2*', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.DecorationSegment(0, 1, 'c1 c1* c1**', 0),
                new lineDecorations_1.DecorationSegment(2, 2, 'c1 c1* c1** c2 c2*', 0),
                new lineDecorations_1.DecorationSegment(3, 3, 'c2*', 0)
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZURlY29yYXRpb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vdmlld0xheW91dC9saW5lRGVjb3JhdGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1FBRS9DLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsb0ZBQW9GLEVBQUUsR0FBRyxFQUFFO1lBRS9GLE1BQU0sTUFBTSxHQUFHLDJDQUF5QixDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsRUFBRTtnQkFDcEYsSUFBSSxnQ0FBYyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSx1Q0FBK0I7Z0JBQzdELElBQUksZ0NBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksdUNBQStCO2FBQzVELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO2dCQUM5QixJQUFJLG1DQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxtQ0FBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksbUNBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3BDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlFQUFpRSxFQUFFLEdBQUcsRUFBRTtZQUU1RSxNQUFNLE1BQU0sR0FBRywyQ0FBeUIsQ0FBQyxTQUFTLENBQUMsZ0NBQWdDLEVBQUU7Z0JBQ3BGLElBQUksZ0NBQWMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sdUNBQStCO2dC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