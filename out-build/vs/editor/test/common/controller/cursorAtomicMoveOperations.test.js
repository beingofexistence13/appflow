/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/cursor/cursorAtomicMoveOperations"], function (require, exports, assert, utils_1, cursorAtomicMoveOperations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Cursor move command test', () => {
        (0, utils_1.$bT)();
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
                    const actual = cursorAtomicMoveOperations_1.$ZV.whitespaceVisibleColumn(testCase.lineContent, position, testCase.tabSize);
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
                    const actual = expected.map((_, i) => cursorAtomicMoveOperations_1.$ZV.atomicPosition(testCase.lineContent, i, testCase.tabSize, direction));
                    assert.deepStrictEqual(actual, expected);
                }
            }
        });
    });
});
//# sourceMappingURL=cursorAtomicMoveOperations.test.js.map