/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/cursor/cursorAtomicMoveOperations"], function (require, exports, assert, utils_1, cursorAtomicMoveOperations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Cursor move command test', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Test whitespaceVisibleColumn', () => {
            const testCases = [
                {
                    lineContent: '        ',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, 0, 0, 0, 0, 4, 4, 4, 4, -1],
                    expectedPrevTabStopVisibleColumn: [-1, 0, 0, 0, 0, 4, 4, 4, 4, -1],
                    expectedVisibleColumn: [0, 1, 2, 3, 4, 5, 6, 7, 8, -1],
                },
                {
                    lineContent: '  ',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, 0, 0, -1],
                    expectedPrevTabStopVisibleColumn: [-1, 0, 0, -1],
                    expectedVisibleColumn: [0, 1, 2, -1],
                },
                {
                    lineContent: '\t',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, 0, -1],
                    expectedPrevTabStopVisibleColumn: [-1, 0, -1],
                    expectedVisibleColumn: [0, 4, -1],
                },
                {
                    lineContent: '\t ',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, 0, 1, -1],
                    expectedPrevTabStopVisibleColumn: [-1, 0, 4, -1],
                    expectedVisibleColumn: [0, 4, 5, -1],
                },
                {
                    lineContent: ' \t\t ',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, 0, 0, 2, 3, -1],
                    expectedPrevTabStopVisibleColumn: [-1, 0, 0, 4, 8, -1],
                    expectedVisibleColumn: [0, 1, 4, 8, 9, -1],
                },
                {
                    lineContent: ' \tA',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, 0, 0, -1, -1],
                    expectedPrevTabStopVisibleColumn: [-1, 0, 0, -1, -1],
                    expectedVisibleColumn: [0, 1, 4, -1, -1],
                },
                {
                    lineContent: 'A',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, -1, -1],
                    expectedPrevTabStopVisibleColumn: [-1, -1, -1],
                    expectedVisibleColumn: [0, -1, -1],
                },
                {
                    lineContent: '',
                    tabSize: 4,
                    expectedPrevTabStopPosition: [-1, -1],
                    expectedPrevTabStopVisibleColumn: [-1, -1],
                    expectedVisibleColumn: [0, -1],
                },
            ];
            for (const testCase of testCases) {
                const maxPosition = testCase.expectedVisibleColumn.length;
                for (let position = 0; position < maxPosition; position++) {
                    const actual = cursorAtomicMoveOperations_1.AtomicTabMoveOperations.whitespaceVisibleColumn(testCase.lineContent, position, testCase.tabSize);
                    const expected = [
                        testCase.expectedPrevTabStopPosition[position],
                        testCase.expectedPrevTabStopVisibleColumn[position],
                        testCase.expectedVisibleColumn[position]
                    ];
                    assert.deepStrictEqual(actual, expected);
                }
            }
        });
        test('Test atomicPosition', () => {
            const testCases = [
                {
                    lineContent: '        ',
                    tabSize: 4,
                    expectedLeft: [-1, 0, 0, 0, 0, 4, 4, 4, 4, -1],
                    expectedRight: [4, 4, 4, 4, 8, 8, 8, 8, -1, -1],
                    expectedNearest: [0, 0, 0, 4, 4, 4, 4, 8, 8, -1],
                },
                {
                    lineContent: ' \t',
                    tabSize: 4,
                    expectedLeft: [-1, 0, 0, -1],
                    expectedRight: [2, 2, -1, -1],
                    expectedNearest: [0, 0, 2, -1],
                },
                {
                    lineContent: '\t ',
                    tabSize: 4,
                    expectedLeft: [-1, 0, -1, -1],
                    expectedRight: [1, -1, -1, -1],
                    expectedNearest: [0, 1, -1, -1],
                },
                {
                    lineContent: ' \t ',
                    tabSize: 4,
                    expectedLeft: [-1, 0, 0, -1, -1],
                    expectedRight: [2, 2, -1, -1, -1],
                    expectedNearest: [0, 0, 2, -1, -1],
                },
                {
                    lineContent: '        A',
                    tabSize: 4,
                    expectedLeft: [-1, 0, 0, 0, 0, 4, 4, 4, 4, -1, -1],
                    expectedRight: [4, 4, 4, 4, 8, 8, 8, 8, -1, -1, -1],
                    expectedNearest: [0, 0, 0, 4, 4, 4, 4, 8, 8, -1, -1],
                },
                {
                    lineContent: '      foo',
                    tabSize: 4,
                    expectedLeft: [-1, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1],
                    expectedRight: [4, 4, 4, 4, -1, -1, -1, -1, -1, -1, -1],
                    expectedNearest: [0, 0, 0, 4, 4, -1, -1, -1, -1, -1, -1],
                },
            ];
            for (const testCase of testCases) {
                for (const { direction, expected } of [
                    {
                        direction: 0 /* Direction.Left */,
                        expected: testCase.expectedLeft,
                    },
                    {
                        direction: 1 /* Direction.Right */,
                        expected: testCase.expectedRight,
                    },
                    {
                        direction: 2 /* Direction.Nearest */,
                        expected: testCase.expectedNearest,
                    },
                ]) {
                    const actual = expected.map((_, i) => cursorAtomicMoveOperations_1.AtomicTabMoveOperations.atomicPosition(testCase.lineContent, i, testCase.tabSize, direction));
                    assert.deepStrictEqual(actual, expected);
                }
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQXRvbWljTW92ZU9wZXJhdGlvbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9jb250cm9sbGVyL2N1cnNvckF0b21pY01vdmVPcGVyYXRpb25zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtRQUV0QyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtZQUN6QyxNQUFNLFNBQVMsR0FBRztnQkFDakI7b0JBQ0MsV0FBVyxFQUFFLFVBQVU7b0JBQ3ZCLE9BQU8sRUFBRSxDQUFDO29CQUNWLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0QsZ0NBQWdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxxQkFBcUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN0RDtnQkFDRDtvQkFDQyxXQUFXLEVBQUUsSUFBSTtvQkFDakIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUs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