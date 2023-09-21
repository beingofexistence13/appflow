/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewModel"], function (require, exports, assert, utils_1, range_1, lineDecorations_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor ViewLayout - ViewLineParts', () => {
        (0, utils_1.$bT)();
        test('Bug 9827:Overlapping inline decorations can cause wrong inline class to be applied', () => {
            const result = lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 11, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.$NW(0, 1, 'c1', 0),
                new lineDecorations_1.$NW(2, 2, 'c2 c1', 0),
                new lineDecorations_1.$NW(3, 9, 'c1', 0),
            ]);
        });
        test('issue #3462: no whitespace shown at the end of a decorated line', () => {
            const result = lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(15, 21, 'mtkw', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(20, 21, 'inline-folded', 0 /* InlineDecorationType.Regular */),
            ]);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.$NW(14, 18, 'mtkw', 0),
                new lineDecorations_1.$NW(19, 19, 'mtkw inline-folded', 0)
            ]);
        });
        test('issue #3661: Link decoration bleeds to next line when wrapping', () => {
            const result = lineDecorations_1.$MW.filter([
                new viewModel_1.$bV(new range_1.$ks(2, 12, 3, 30), 'detected-link', 0 /* InlineDecorationType.Regular */)
            ], 3, 12, 500);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.$MW(12, 30, 'detected-link', 0 /* InlineDecorationType.Regular */),
            ]);
        });
        test('issue #37401: Allow both before and after decorations on empty line', () => {
            const result = lineDecorations_1.$MW.filter([
                new viewModel_1.$bV(new range_1.$ks(4, 1, 4, 2), 'before', 1 /* InlineDecorationType.Before */),
                new viewModel_1.$bV(new range_1.$ks(4, 0, 4, 1), 'after', 2 /* InlineDecorationType.After */),
            ], 4, 1, 500);
            assert.deepStrictEqual(result, [
                new lineDecorations_1.$MW(1, 2, 'before', 1 /* InlineDecorationType.Before */),
                new lineDecorations_1.$MW(0, 1, 'after', 2 /* InlineDecorationType.After */),
            ]);
        });
        test('ViewLineParts', () => {
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 2, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 0, 'c1', 0),
                new lineDecorations_1.$NW(2, 2, 'c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 3, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 1, 'c1', 0),
                new lineDecorations_1.$NW(2, 2, 'c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 1, 'c1', 0),
                new lineDecorations_1.$NW(2, 2, 'c1 c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 1, 'c1 c1*', 0),
                new lineDecorations_1.$NW(2, 2, 'c1 c1* c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1**', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 1, 'c1 c1* c1**', 0),
                new lineDecorations_1.$NW(2, 2, 'c1 c1* c1** c2', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1**', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2*', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 1, 'c1 c1* c1**', 0),
                new lineDecorations_1.$NW(2, 2, 'c1 c1* c1** c2 c2*', 0)
            ]);
            assert.deepStrictEqual(lineDecorations_1.$OW.normalize('abcabcabcabcabcabcabcabcabcabc', [
                new lineDecorations_1.$MW(1, 4, 'c1', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1*', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(1, 4, 'c1**', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 4, 'c2', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.$MW(3, 5, 'c2*', 0 /* InlineDecorationType.Regular */)
            ]), [
                new lineDecorations_1.$NW(0, 1, 'c1 c1* c1**', 0),
                new lineDecorations_1.$NW(2, 2, 'c1 c1* c1** c2 c2*', 0),
                new lineDecorations_1.$NW(3, 3, 'c2*', 0)
            ]);
        });
    });
});
//# sourceMappingURL=lineDecorations.test.js.map