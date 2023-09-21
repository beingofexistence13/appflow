/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/model/textModel", "vs/editor/common/modelLineProjectionData"], function (require, exports, assert, utils_1, textModel_1, modelLineProjectionData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor ViewModel - LineBreakData', () => {
        (0, utils_1.$bT)();
        test('Basic', () => {
            const data = new modelLineProjectionData_1.$FU([], [], [100], [0], 10);
            assert.strictEqual(data.translateToInputOffset(0, 50), 50);
            assert.strictEqual(data.translateToInputOffset(1, 60), 150);
        });
        function sequence(length, start = 0) {
            const result = new Array();
            for (let i = 0; i < length; i++) {
                result.push(i + start);
            }
            return result;
        }
        function testInverse(data) {
            for (let i = 0; i < 100; i++) {
                const output = data.translateToOutputPosition(i);
                assert.deepStrictEqual(data.translateToInputOffset(output.outputLineIndex, output.outputOffset), i);
            }
        }
        function getInputOffsets(data, outputLineIdx) {
            return sequence(20).map(i => data.translateToInputOffset(outputLineIdx, i));
        }
        function getOutputOffsets(data, affinity) {
            return sequence(25).map(i => data.translateToOutputPosition(i, affinity).toString());
        }
        function mapTextToInjectedTextOptions(arr) {
            return arr.map(e => textModel_1.$QC.from({ content: e }));
        }
        suite('Injected Text 1', () => {
            const data = new modelLineProjectionData_1.$FU([2, 3, 10], mapTextToInjectedTextOptions(['1', '22', '333']), [10, 100], [], 10);
            test('getInputOffsetOfOutputPosition', () => {
                // For every view model position, what is the model position?
                assert.deepStrictEqual(getInputOffsets(data, 0), ([0, 1, 2, 2, 3, 3, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, 12, 13]));
                assert.deepStrictEqual(getInputOffsets(data, 1), ([7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 9, 10, 10, 10, 10, 11, 12, 13]));
            });
            test('getOutputPositionOfInputOffset', () => {
                data.translateToOutputPosition(20);
                assert.deepStrictEqual(getOutputOffsets(data, 2 /* PositionAffinity.None */), [
                    '0:0',
                    '0:1',
                    '0:2',
                    '0:4',
                    '0:7',
                    '0:8',
                    '0:9',
                    '1:10',
                    '1:11',
                    '1:12',
                    '1:13',
                    '1:17',
                    '1:18',
                    '1:19',
                    '1:20',
                    '1:21',
                    '1:22',
                    '1:23',
                    '1:24',
                    '1:25',
                    '1:26',
                    '1:27',
                    '1:28',
                    '1:29',
                    '1:30',
                ]);
                assert.deepStrictEqual(getOutputOffsets(data, 0 /* PositionAffinity.Left */), [
                    '0:0',
                    '0:1',
                    '0:2',
                    '0:4',
                    '0:7',
                    '0:8',
                    '0:9',
                    '0:10',
                    '1:11',
                    '1:12',
                    '1:13',
                    '1:17',
                    '1:18',
                    '1:19',
                    '1:20',
                    '1:21',
                    '1:22',
                    '1:23',
                    '1:24',
                    '1:25',
                    '1:26',
                    '1:27',
                    '1:28',
                    '1:29',
                    '1:30',
                ]);
                assert.deepStrictEqual(getOutputOffsets(data, 1 /* PositionAffinity.Right */), [
                    '0:0',
                    '0:1',
                    '0:3',
                    '0:6',
                    '0:7',
                    '0:8',
                    '0:9',
                    '1:10',
                    '1:11',
                    '1:12',
                    '1:16',
                    '1:17',
                    '1:18',
                    '1:19',
                    '1:20',
                    '1:21',
                    '1:22',
                    '1:23',
                    '1:24',
                    '1:25',
                    '1:26',
                    '1:27',
                    '1:28',
                    '1:29',
                    '1:30',
                ]);
            });
            test('getInputOffsetOfOutputPosition is inverse of getOutputPositionOfInputOffset', () => {
                testInverse(data);
            });
            test('normalization', () => {
                assert.deepStrictEqual(sequence(25)
                    .map((v) => data.normalizeOutputPosition(1, v, 1 /* PositionAffinity.Right */))
                    .map((s) => s.toString()), [
                    '1:0',
                    '1:1',
                    '1:2',
                    '1:3',
                    '1:4',
                    '1:5',
                    '1:6',
                    '1:7',
                    '1:8',
                    '1:9',
                    '1:10',
                    '1:11',
                    '1:12',
                    '1:16',
                    '1:16',
                    '1:16',
                    '1:16',
                    '1:17',
                    '1:18',
                    '1:19',
                    '1:20',
                    '1:21',
                    '1:22',
                    '1:23',
                    '1:24',
                ]);
            });
        });
        suite('Injected Text 2', () => {
            const data = new modelLineProjectionData_1.$FU([2, 2, 6], mapTextToInjectedTextOptions(['1', '22', '333']), [10, 100], [], 0);
            test('getInputOffsetOfOutputPosition', () => {
                assert.deepStrictEqual(getInputOffsets(data, 0), [0, 1, 2, 2, 2, 2, 3, 4, 5, 6, 6, 6, 6, 7, 8, 9, 10, 11, 12, 13]);
                assert.deepStrictEqual(getInputOffsets(data, 1), [
                    6, 6, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                    23,
                ]);
            });
            test('getInputOffsetOfOutputPosition is inverse of getOutputPositionOfInputOffset', () => {
                testInverse(data);
            });
        });
        suite('Injected Text 3', () => {
            const data = new modelLineProjectionData_1.$FU([2, 2, 7], mapTextToInjectedTextOptions(['1', '22', '333']), [10, 100], [], 0);
            test('getInputOffsetOfOutputPosition', () => {
                assert.deepStrictEqual(getInputOffsets(data, 0), [0, 1, 2, 2, 2, 2, 3, 4, 5, 6, 7, 7, 7, 7, 8, 9, 10, 11, 12, 13]);
                assert.deepStrictEqual(getInputOffsets(data, 1), [
                    7, 7, 7, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
                    23,
                ]);
            });
            test('getInputOffsetOfOutputPosition is inverse of getOutputPositionOfInputOffset', () => {
                testInverse(data);
            });
        });
    });
});
//# sourceMappingURL=lineBreakData.test.js.map