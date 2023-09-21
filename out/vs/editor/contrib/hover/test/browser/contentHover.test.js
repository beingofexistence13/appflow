/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/hover/browser/contentHover", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, position_1, range_1, contentHover_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Content Hover', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #151235: Gitlens hover shows up in the wrong place', () => {
            const text = 'just some text';
            (0, testCodeEditor_1.withTestCodeEditor)(text, {}, (editor) => {
                const actual = contentHover_1.ContentHoverController.computeHoverRanges(editor, new range_1.Range(5, 5, 5, 5), [{ range: new range_1.Range(4, 1, 5, 6) }]);
                assert.deepStrictEqual(actual, {
                    showAtPosition: new position_1.Position(5, 5),
                    showAtSecondaryPosition: new position_1.Position(5, 5),
                    highlightRange: new range_1.Range(4, 1, 5, 6)
                });
            });
        });
        test('issue #95328: Hover placement with word-wrap', () => {
            const text = 'just some text';
            const opts = { wordWrap: 'wordWrapColumn', wordWrapColumn: 6 };
            (0, testCodeEditor_1.withTestCodeEditor)(text, opts, (editor) => {
                const actual = contentHover_1.ContentHoverController.computeHoverRanges(editor, new range_1.Range(1, 8, 1, 8), [{ range: new range_1.Range(1, 1, 1, 15) }]);
                assert.deepStrictEqual(actual, {
                    showAtPosition: new position_1.Position(1, 8),
                    showAtSecondaryPosition: new position_1.Position(1, 6),
                    highlightRange: new range_1.Range(1, 1, 1, 15)
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudEhvdmVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9ob3Zlci90ZXN0L2Jyb3dzZXIvY29udGVudEhvdmVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFFM0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQywwREFBMEQsRUFBRSxHQUFHLEVBQUU7WUFDckUsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7WUFDOUIsSUFBQSxtQ0FBa0IsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ3ZDLE1BQU0sTUFBTSxHQUFHLHFDQUFzQixDQUFDLGtCQUFrQixDQUN2RCxNQUFNLEVBQ04sSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3JCLENBQWEsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUM5QyxDQUFDO2dCQUNGLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLE1BQU0sRUFDTjtvQkFDQyxjQUFjLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xDLHVCQUF1QixFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMzQyxjQUFjLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNyQyxDQUNELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDhDQUE4QyxFQUFFLEdBQUcsRUFBRTtZQUN6RCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztZQUM5QixNQUFNLElBQUksR0FBdUMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25HLElBQUEsbUNBQWtCLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUN6QyxNQUFNLE1BQU0sR0FBRyxxQ0FBc0IsQ0FBQyxrQkFBa0IsQ0FDdkQsTUFBTSxFQUNOLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNyQixDQUFhLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FDL0MsQ0FBQztnQkFDRixNQUFNLENBQUMsZUFBZSxDQUNyQixNQUFNLEVBQ047b0JBQ0MsY0FBYyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyx1QkFBdUIsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDM0MsY0FBYyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztpQkFDdEMsQ0FDRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=