/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/viewModel", "vs/editor/test/browser/viewModel/testViewModel"], function (require, exports, assert, utils_1, range_1, viewModel_1, testViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ViewModelDecorations', () => {
        (0, utils_1.$bT)();
        test('getDecorationsViewportData', () => {
            const text = [
                'hello world, this is a buffer that will be wrapped'
            ];
            const opts = {
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 13
            };
            (0, testViewModel_1.$g$b)(text, opts, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineContent(1), 'hello world, ');
                assert.strictEqual(viewModel.getLineContent(2), 'this is a ');
                assert.strictEqual(viewModel.getLineContent(3), 'buffer that ');
                assert.strictEqual(viewModel.getLineContent(4), 'will be ');
                assert.strictEqual(viewModel.getLineContent(5), 'wrapped');
                model.changeDecorations((accessor) => {
                    const createOpts = (id) => {
                        return {
                            description: 'test',
                            className: id,
                            inlineClassName: 'i-' + id,
                            beforeContentClassName: 'b-' + id,
                            afterContentClassName: 'a-' + id
                        };
                    };
                    // VIEWPORT will be (1,14) -> (1,36)
                    // completely before viewport
                    accessor.addDecoration(new range_1.$ks(1, 2, 1, 3), createOpts('dec1'));
                    // starts before viewport, ends at viewport start
                    accessor.addDecoration(new range_1.$ks(1, 2, 1, 14), createOpts('dec2'));
                    // starts before viewport, ends inside viewport
                    accessor.addDecoration(new range_1.$ks(1, 2, 1, 15), createOpts('dec3'));
                    // starts before viewport, ends at viewport end
                    accessor.addDecoration(new range_1.$ks(1, 2, 1, 36), createOpts('dec4'));
                    // starts before viewport, ends after viewport
                    accessor.addDecoration(new range_1.$ks(1, 2, 1, 51), createOpts('dec5'));
                    // starts at viewport start, ends at viewport start (will not be visible on view line 2)
                    accessor.addDecoration(new range_1.$ks(1, 14, 1, 14), createOpts('dec6'));
                    // starts at viewport start, ends inside viewport
                    accessor.addDecoration(new range_1.$ks(1, 14, 1, 16), createOpts('dec7'));
                    // starts at viewport start, ends at viewport end
                    accessor.addDecoration(new range_1.$ks(1, 14, 1, 36), createOpts('dec8'));
                    // starts at viewport start, ends after viewport
                    accessor.addDecoration(new range_1.$ks(1, 14, 1, 51), createOpts('dec9'));
                    // starts inside viewport, ends inside viewport
                    accessor.addDecoration(new range_1.$ks(1, 16, 1, 18), createOpts('dec10'));
                    // starts inside viewport, ends at viewport end
                    accessor.addDecoration(new range_1.$ks(1, 16, 1, 36), createOpts('dec11'));
                    // starts inside viewport, ends after viewport
                    accessor.addDecoration(new range_1.$ks(1, 16, 1, 51), createOpts('dec12'));
                    // starts at viewport end, ends at viewport end
                    accessor.addDecoration(new range_1.$ks(1, 36, 1, 36), createOpts('dec13'));
                    // starts at viewport end, ends after viewport
                    accessor.addDecoration(new range_1.$ks(1, 36, 1, 51), createOpts('dec14'));
                    // starts after viewport, ends after viewport
                    accessor.addDecoration(new range_1.$ks(1, 40, 1, 51), createOpts('dec15'));
                });
                const actualDecorations = viewModel.getDecorationsInViewport(new range_1.$ks(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))).map((dec) => {
                    return dec.options.className;
                }).filter(Boolean);
                assert.deepStrictEqual(actualDecorations, [
                    'dec1',
                    'dec2',
                    'dec3',
                    'dec4',
                    'dec5',
                    'dec6',
                    'dec7',
                    'dec8',
                    'dec9',
                    'dec10',
                    'dec11',
                    'dec12',
                    'dec13',
                    'dec14',
                ]);
                const inlineDecorations1 = viewModel.getViewportViewLineRenderingData(new range_1.$ks(1, viewModel.getLineMinColumn(1), 2, viewModel.getLineMaxColumn(2)), 1).inlineDecorations;
                // view line 1: (1,1 -> 1,14)
                assert.deepStrictEqual(inlineDecorations1, [
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 3), 'i-dec1', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 2), 'b-dec1', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(1, 3, 1, 3), 'a-dec1', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 14), 'i-dec2', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 2), 'b-dec2', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(1, 14, 1, 14), 'a-dec2', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 2, 2), 'i-dec3', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 2), 'b-dec3', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 3, 13), 'i-dec4', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 2), 'b-dec4', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 5, 8), 'i-dec5', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 1, 2), 'b-dec5', 1 /* InlineDecorationType.Before */),
                ]);
                const inlineDecorations2 = viewModel.getViewportViewLineRenderingData(new range_1.$ks(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 2).inlineDecorations;
                // view line 2: (1,14 -> 1,24)
                assert.deepStrictEqual(inlineDecorations2, [
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 2, 2), 'i-dec3', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 2, 2, 2), 'a-dec3', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 3, 13), 'i-dec4', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 5, 8), 'i-dec5', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 1), 'i-dec6', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 1), 'b-dec6', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 1), 'a-dec6', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 3), 'i-dec7', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 1), 'b-dec7', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 2, 3), 'a-dec7', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 3, 13), 'i-dec8', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 1), 'b-dec8', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 5, 8), 'i-dec9', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 2, 1), 'b-dec9', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 2, 5), 'i-dec10', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 2, 3), 'b-dec10', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(2, 5, 2, 5), 'a-dec10', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 3, 13), 'i-dec11', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 2, 3), 'b-dec11', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 5, 8), 'i-dec12', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 2, 3), 'b-dec12', 1 /* InlineDecorationType.Before */),
                ]);
                const inlineDecorations3 = viewModel.getViewportViewLineRenderingData(new range_1.$ks(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 3).inlineDecorations;
                // view line 3 (24 -> 36)
                assert.deepStrictEqual(inlineDecorations3, [
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 3, 13), 'i-dec4', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(3, 13, 3, 13), 'a-dec4', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(1, 2, 5, 8), 'i-dec5', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 3, 13), 'i-dec8', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(3, 13, 3, 13), 'a-dec8', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(2, 1, 5, 8), 'i-dec9', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 3, 13), 'i-dec11', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.$bV(new range_1.$ks(3, 13, 3, 13), 'a-dec11', 2 /* InlineDecorationType.After */),
                    new viewModel_1.$bV(new range_1.$ks(2, 3, 5, 8), 'i-dec12', 0 /* InlineDecorationType.Regular */),
                ]);
            });
        });
        test('issue #17208: Problem scrolling in 1.8.0', () => {
            const text = [
                'hello world, this is a buffer that will be wrapped'
            ];
            const opts = {
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 13
            };
            (0, testViewModel_1.$g$b)(text, opts, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineContent(1), 'hello world, ');
                assert.strictEqual(viewModel.getLineContent(2), 'this is a ');
                assert.strictEqual(viewModel.getLineContent(3), 'buffer that ');
                assert.strictEqual(viewModel.getLineContent(4), 'will be ');
                assert.strictEqual(viewModel.getLineContent(5), 'wrapped');
                model.changeDecorations((accessor) => {
                    accessor.addDecoration(new range_1.$ks(1, 50, 1, 51), {
                        description: 'test',
                        beforeContentClassName: 'dec1'
                    });
                });
                const decorations = viewModel.getDecorationsInViewport(new range_1.$ks(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))).filter(x => Boolean(x.options.beforeContentClassName));
                assert.deepStrictEqual(decorations, []);
                const inlineDecorations1 = viewModel.getViewportViewLineRenderingData(new range_1.$ks(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 2).inlineDecorations;
                assert.deepStrictEqual(inlineDecorations1, []);
                const inlineDecorations2 = viewModel.getViewportViewLineRenderingData(new range_1.$ks(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 3).inlineDecorations;
                assert.deepStrictEqual(inlineDecorations2, []);
            });
        });
        test('issue #37401: Allow both before and after decorations on empty line', () => {
            const text = [
                ''
            ];
            (0, testViewModel_1.$g$b)(text, {}, (viewModel, model) => {
                model.changeDecorations((accessor) => {
                    accessor.addDecoration(new range_1.$ks(1, 1, 1, 1), {
                        description: 'test',
                        beforeContentClassName: 'before1',
                        afterContentClassName: 'after1'
                    });
                });
                const inlineDecorations = viewModel.getViewportViewLineRenderingData(new range_1.$ks(1, 1, 1, 1), 1).inlineDecorations;
                assert.deepStrictEqual(inlineDecorations, [
                    new viewModel_1.$bV(new range_1.$ks(1, 1, 1, 1), 'before1', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.$bV(new range_1.$ks(1, 1, 1, 1), 'after1', 2 /* InlineDecorationType.After */)
                ]);
            });
        });
    });
});
//# sourceMappingURL=viewModelDecorations.test.js.map