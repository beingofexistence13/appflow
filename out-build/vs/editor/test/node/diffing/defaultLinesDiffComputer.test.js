/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing"], function (require, exports, assert, range_1, rangeMapping_1, offsetRange_1, defaultLinesDiffComputer_1, linesSliceCharSequence_1, myersDiffAlgorithm_1, dynamicProgrammingDiffing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('myers', () => {
        test('1', () => {
            const s1 = new linesSliceCharSequence_1.$OY(['hello world'], new offsetRange_1.$rs(0, 1), true);
            const s2 = new linesSliceCharSequence_1.$OY(['hallo welt'], new offsetRange_1.$rs(0, 1), true);
            const a = true ? new myersDiffAlgorithm_1.$NY() : new dynamicProgrammingDiffing_1.$MY();
            a.compute(s1, s2);
        });
    });
    suite('lineRangeMapping', () => {
        test('Simple', () => {
            assert.deepStrictEqual((0, defaultLinesDiffComputer_1.$YY)(new rangeMapping_1.$xs(new range_1.$ks(2, 1, 3, 1), new range_1.$ks(2, 1, 2, 1)), [
                'const abc = "helloworld".split("");',
                '',
                ''
            ], [
                'const asciiLower = "helloworld".split("");',
                ''
            ]).toString(), "{[2,3)->[2,2)}");
        });
        test('Empty Lines', () => {
            assert.deepStrictEqual((0, defaultLinesDiffComputer_1.$YY)(new rangeMapping_1.$xs(new range_1.$ks(2, 1, 2, 1), new range_1.$ks(2, 1, 4, 1)), [
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
        const sequence = new linesSliceCharSequence_1.$OY([
            'line1: foo',
            'line2: fizzbuzz',
            'line3: barr',
            'line4: hello world',
            'line5: bazz',
        ], new offsetRange_1.$rs(1, 4), true);
        test('translateOffset', () => {
            assert.deepStrictEqual({ result: offsetRange_1.$rs.ofLength(sequence.length).map(offset => sequence.translateOffset(offset).toString()) }, ({
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
            assert.deepStrictEqual({ result: sequence.getText(sequence.extendToFullLines(new offsetRange_1.$rs(20, 25))) }, ({ result: "line3: barr\n" }));
            assert.deepStrictEqual({ result: sequence.getText(sequence.extendToFullLines(new offsetRange_1.$rs(20, 45))) }, ({ result: "line3: barr\nline4: hello world\n" }));
        });
    });
});
//# sourceMappingURL=defaultLinesDiffComputer.test.js.map