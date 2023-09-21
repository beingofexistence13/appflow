/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/viewModel", "vs/editor/test/browser/viewModel/testViewModel"], function (require, exports, assert, utils_1, range_1, viewModel_1, testViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ViewModelDecorations', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('getDecorationsViewportData', () => {
            const text = [
                'hello world, this is a buffer that will be wrapped'
            ];
            const opts = {
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 13
            };
            (0, testViewModel_1.testViewModel)(text, opts, (viewModel, model) => {
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
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 3), createOpts('dec1'));
                    // starts before viewport, ends at viewport start
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 14), createOpts('dec2'));
                    // starts before viewport, ends inside viewport
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 15), createOpts('dec3'));
                    // starts before viewport, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 36), createOpts('dec4'));
                    // starts before viewport, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 51), createOpts('dec5'));
                    // starts at viewport start, ends at viewport start (will not be visible on view line 2)
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 14), createOpts('dec6'));
                    // starts at viewport start, ends inside viewport
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 16), createOpts('dec7'));
                    // starts at viewport start, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 36), createOpts('dec8'));
                    // starts at viewport start, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 51), createOpts('dec9'));
                    // starts inside viewport, ends inside viewport
                    accessor.addDecoration(new range_1.Range(1, 16, 1, 18), createOpts('dec10'));
                    // starts inside viewport, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 16, 1, 36), createOpts('dec11'));
                    // starts inside viewport, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 16, 1, 51), createOpts('dec12'));
                    // starts at viewport end, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 36, 1, 36), createOpts('dec13'));
                    // starts at viewport end, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 36, 1, 51), createOpts('dec14'));
                    // starts after viewport, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 40, 1, 51), createOpts('dec15'));
                });
                const actualDecorations = viewModel.getDecorationsInViewport(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))).map((dec) => {
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
                const inlineDecorations1 = viewModel.getViewportViewLineRenderingData(new range_1.Range(1, viewModel.getLineMinColumn(1), 2, viewModel.getLineMaxColumn(2)), 1).inlineDecorations;
                // view line 1: (1,1 -> 1,14)
                assert.deepStrictEqual(inlineDecorations1, [
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 3), 'i-dec1', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 2), 'b-dec1', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 3, 1, 3), 'a-dec1', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 14), 'i-dec2', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 2), 'b-dec2', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 14, 1, 14), 'a-dec2', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 2, 2), 'i-dec3', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 2), 'b-dec3', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 3, 13), 'i-dec4', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 2), 'b-dec4', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 5, 8), 'i-dec5', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 1, 2), 'b-dec5', 1 /* InlineDecorationType.Before */),
                ]);
                const inlineDecorations2 = viewModel.getViewportViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 2).inlineDecorations;
                // view line 2: (1,14 -> 1,24)
                assert.deepStrictEqual(inlineDecorations2, [
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 2, 2), 'i-dec3', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 2, 2, 2), 'a-dec3', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 3, 13), 'i-dec4', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 5, 8), 'i-dec5', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 1), 'i-dec6', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 1), 'b-dec6', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 1), 'a-dec6', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 3), 'i-dec7', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 1), 'b-dec7', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 2, 3), 'a-dec7', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 3, 13), 'i-dec8', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 1), 'b-dec8', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 5, 8), 'i-dec9', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 2, 1), 'b-dec9', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 2, 5), 'i-dec10', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 2, 3), 'b-dec10', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 5, 2, 5), 'a-dec10', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 3, 13), 'i-dec11', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 2, 3), 'b-dec11', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 5, 8), 'i-dec12', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 2, 3), 'b-dec12', 1 /* InlineDecorationType.Before */),
                ]);
                const inlineDecorations3 = viewModel.getViewportViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 3).inlineDecorations;
                // view line 3 (24 -> 36)
                assert.deepStrictEqual(inlineDecorations3, [
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 3, 13), 'i-dec4', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(3, 13, 3, 13), 'a-dec4', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 2, 5, 8), 'i-dec5', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 3, 13), 'i-dec8', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(3, 13, 3, 13), 'a-dec8', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 1, 5, 8), 'i-dec9', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 3, 13), 'i-dec11', 0 /* InlineDecorationType.Regular */),
                    new viewModel_1.InlineDecoration(new range_1.Range(3, 13, 3, 13), 'a-dec11', 2 /* InlineDecorationType.After */),
                    new viewModel_1.InlineDecoration(new range_1.Range(2, 3, 5, 8), 'i-dec12', 0 /* InlineDecorationType.Regular */),
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
            (0, testViewModel_1.testViewModel)(text, opts, (viewModel, model) => {
                assert.strictEqual(viewModel.getLineContent(1), 'hello world, ');
                assert.strictEqual(viewModel.getLineContent(2), 'this is a ');
                assert.strictEqual(viewModel.getLineContent(3), 'buffer that ');
                assert.strictEqual(viewModel.getLineContent(4), 'will be ');
                assert.strictEqual(viewModel.getLineContent(5), 'wrapped');
                model.changeDecorations((accessor) => {
                    accessor.addDecoration(new range_1.Range(1, 50, 1, 51), {
                        description: 'test',
                        beforeContentClassName: 'dec1'
                    });
                });
                const decorations = viewModel.getDecorationsInViewport(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))).filter(x => Boolean(x.options.beforeContentClassName));
                assert.deepStrictEqual(decorations, []);
                const inlineDecorations1 = viewModel.getViewportViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 2).inlineDecorations;
                assert.deepStrictEqual(inlineDecorations1, []);
                const inlineDecorations2 = viewModel.getViewportViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 3).inlineDecorations;
                assert.deepStrictEqual(inlineDecorations2, []);
            });
        });
        test('issue #37401: Allow both before and after decorations on empty line', () => {
            const text = [
                ''
            ];
            (0, testViewModel_1.testViewModel)(text, {}, (viewModel, model) => {
                model.changeDecorations((accessor) => {
                    accessor.addDecoration(new range_1.Range(1, 1, 1, 1), {
                        description: 'test',
                        beforeContentClassName: 'before1',
                        afterContentClassName: 'after1'
                    });
                });
                const inlineDecorations = viewModel.getViewportViewLineRenderingData(new range_1.Range(1, 1, 1, 1), 1).inlineDecorations;
                assert.deepStrictEqual(inlineDecorations, [
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 1, 1, 1), 'before1', 1 /* InlineDecorationType.Before */),
                    new viewModel_1.InlineDecoration(new range_1.Range(1, 1, 1, 1), 'after1', 2 /* InlineDecorationType.After */)
                ]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsRGVjb3JhdGlvbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2Jyb3dzZXIvdmlld01vZGVsL3ZpZXdNb2RlbERlY29yYXRpb25zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUVsQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUN2QyxNQUFNLElBQUksR0FBRztnQkFDWixvREFBb0Q7YUFDcEQsQ0FBQztZQUNGLE1BQU0sSUFBSSxHQUFtQjtnQkFDNUIsUUFBUSxFQUFFLGdCQUFnQjtnQkFDMUIsY0FBYyxFQUFFLEVBQUU7YUFDbEIsQ0FBQztZQUNGLElBQUEsNkJBQWEsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM5QyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFF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QVEsdUNBQStCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEscUNBQTZCO29CQUNqRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsdUNBQStCO29CQUNwRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsdUNBQStCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsdUNBQStCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsc0NBQThCO29CQUNsRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEscUNBQTZCO29CQUNqRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsdUNBQStCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsc0NBQThCO29CQUNsRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEscUNBQTZCO29CQUNqRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsdUNBQStCO29CQUNwRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsc0NBQThCO29CQUNsRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsdUNBQStCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsc0NBQThCO29CQUNsRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsdUNBQStCO29CQUNwRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsc0NBQThCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMscUNBQTZCO29CQUNsRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFNBQVMsdUNBQStCO29CQUNyRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsc0NBQThCO29CQUNuRixJQUFJLDRCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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