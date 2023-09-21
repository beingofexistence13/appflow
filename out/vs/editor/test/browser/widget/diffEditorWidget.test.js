/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/browser/widget/diffEditor/diffEditorViewModel", "vs/editor/common/core/lineRange", "vs/editor/common/diff/rangeMapping"], function (require, exports, assert, utils_1, diffEditorViewModel_1, lineRange_1, rangeMapping_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DiffEditorWidget2', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('UnchangedRegion', () => {
            function serialize(regions) {
                return regions.map(r => `${r.originalUnchangedRange} - ${r.modifiedUnchangedRange}`);
            }
            test('Everything changed', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.UnchangedRegion.fromDiffs([new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(1, 10), new lineRange_1.LineRange(1, 10), [])], 10, 10, 3, 3)), []);
            });
            test('Nothing changed', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.UnchangedRegion.fromDiffs([], 10, 10, 3, 3)), [
                    "[1,11) - [1,11)"
                ]);
            });
            test('Change in the middle', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.UnchangedRegion.fromDiffs([new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(50, 60), new lineRange_1.LineRange(50, 60), [])], 100, 100, 3, 3)), ([
                    '[1,47) - [1,47)',
                    '[63,101) - [63,101)'
                ]));
            });
            test('Change at the end', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.UnchangedRegion.fromDiffs([new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(99, 100), new lineRange_1.LineRange(100, 100), [])], 100, 100, 3, 3)), (["[1,96) - [1,96)"]));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvcldpZGdldC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvcldpZGdldC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFFL0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7WUFDN0IsU0FBUyxTQUFTLENBQUMsT0FBMEI7Z0JBQzVDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLHNCQUFzQixNQUFNLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7WUFDdEYsQ0FBQztZQUVELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLHFDQUFlLENBQUMsU0FBUyxDQUN6RCxDQUFDLElBQUksdUNBQXdCLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQzlFLEVBQUUsRUFDRixFQUFFLEVBQ0YsQ0FBQyxFQUNELENBQUMsQ0FDRCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLHFDQUFlLENBQUMsU0FBUyxDQUN6RCxFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixDQUFDLEVBQ0QsQ0FBQyxDQUNELENBQUMsRUFBRTtvQkFDSCxpQkFBaUI7aUJBQ2pCLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMscUNBQWUsQ0FBQyxTQUFTLENBQ3pELENBQUMsSUFBSSx1Q0FBd0IsQ0FBQyxJQUFJLHFCQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDaEYsR0FBRyxFQUNILEdBQUcsRUFDSCxDQUFDLEVBQ0QsQ0FBQyxDQUNELENBQUMsRUFBRSxDQUFDO29CQUNKLGlCQUFpQjtvQkFDakIscUJBQXFCO2lCQUNyQixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtnQkFDOUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMscUNBQWUsQ0FBQyxTQUFTLENBQ3pELENBQUMsSUFBSSx1Q0FBd0IsQ0FBQyxJQUFJLHFCQUFTLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUkscUJBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDbkYsR0FBRyxFQUNILEdBQUcsRUFDSCxDQUFDLEVBQ0QsQ0FBQyxDQUNELENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=