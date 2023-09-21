/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/assert", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/rangeUtils"], function (require, exports, arrays_1, assert_1, types_1, position_1, range_1, length_1, mapping_1, rangeUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$USb = void 0;
    function $USb(m) {
        const equalRanges1 = toEqualRangeMappings(m.input1Diffs.flatMap(d => d.rangeMappings), m.baseRange.toRange(), m.input1Range.toRange());
        const equalRanges2 = toEqualRangeMappings(m.input2Diffs.flatMap(d => d.rangeMappings), m.baseRange.toRange(), m.input2Range.toRange());
        const commonRanges = splitUpCommonEqualRangeMappings(equalRanges1, equalRanges2);
        let result = [];
        result.push([m.input1Range.startLineNumber - 1, m.baseRange.startLineNumber - 1, m.input2Range.startLineNumber - 1]);
        function isFullSync(lineAlignment) {
            return lineAlignment.every((i) => i !== undefined);
        }
        // One base line has either up to one full sync or up to two half syncs.
        for (const m of commonRanges) {
            const lineAlignment = [m.output1Pos?.lineNumber, m.inputPos.lineNumber, m.output2Pos?.lineNumber];
            const alignmentIsFullSync = isFullSync(lineAlignment);
            let shouldAdd = true;
            if (alignmentIsFullSync) {
                const isNewFullSyncAlignment = !result.some(r => isFullSync(r) && r.some((v, idx) => v !== undefined && v === lineAlignment[idx]));
                if (isNewFullSyncAlignment) {
                    // Remove half syncs
                    result = result.filter(r => !r.some((v, idx) => v !== undefined && v === lineAlignment[idx]));
                }
                shouldAdd = isNewFullSyncAlignment;
            }
            else {
                const isNew = !result.some(r => r.some((v, idx) => v !== undefined && v === lineAlignment[idx]));
                shouldAdd = isNew;
            }
            if (shouldAdd) {
                result.push(lineAlignment);
            }
            else {
                if (m.length.isGreaterThan(new length_1.$nt(1, 0))) {
                    result.push([
                        m.output1Pos ? m.output1Pos.lineNumber + 1 : undefined,
                        m.inputPos.lineNumber + 1,
                        m.output2Pos ? m.output2Pos.lineNumber + 1 : undefined
                    ]);
                }
            }
        }
        const finalLineAlignment = [m.input1Range.endLineNumberExclusive, m.baseRange.endLineNumberExclusive, m.input2Range.endLineNumberExclusive];
        result = result.filter(r => r.every((v, idx) => v !== finalLineAlignment[idx]));
        result.push(finalLineAlignment);
        (0, assert_1.$xc)(() => (0, assert_1.$yc)(result.map(r => r[0]).filter(types_1.$rf), (a, b) => a < b)
            && (0, assert_1.$yc)(result.map(r => r[1]).filter(types_1.$rf), (a, b) => a <= b)
            && (0, assert_1.$yc)(result.map(r => r[2]).filter(types_1.$rf), (a, b) => a < b)
            && result.every(alignment => alignment.filter(types_1.$rf).length >= 2));
        return result;
    }
    exports.$USb = $USb;
    function toEqualRangeMappings(diffs, inputRange, outputRange) {
        const result = [];
        let equalRangeInputStart = inputRange.getStartPosition();
        let equalRangeOutputStart = outputRange.getStartPosition();
        for (const d of diffs) {
            const equalRangeMapping = new mapping_1.$sjb(range_1.$ks.fromPositions(equalRangeInputStart, d.inputRange.getStartPosition()), range_1.$ks.fromPositions(equalRangeOutputStart, d.outputRange.getStartPosition()));
            (0, assert_1.$xc)(() => (0, rangeUtils_1.$kjb)(equalRangeMapping.inputRange).equals((0, rangeUtils_1.$kjb)(equalRangeMapping.outputRange)));
            if (!equalRangeMapping.inputRange.isEmpty()) {
                result.push(equalRangeMapping);
            }
            equalRangeInputStart = d.inputRange.getEndPosition();
            equalRangeOutputStart = d.outputRange.getEndPosition();
        }
        const equalRangeMapping = new mapping_1.$sjb(range_1.$ks.fromPositions(equalRangeInputStart, inputRange.getEndPosition()), range_1.$ks.fromPositions(equalRangeOutputStart, outputRange.getEndPosition()));
        (0, assert_1.$xc)(() => (0, rangeUtils_1.$kjb)(equalRangeMapping.inputRange).equals((0, rangeUtils_1.$kjb)(equalRangeMapping.outputRange)));
        if (!equalRangeMapping.inputRange.isEmpty()) {
            result.push(equalRangeMapping);
        }
        return result;
    }
    /**
     * It is `result[i][0].inputRange.equals(result[i][1].inputRange)`.
    */
    function splitUpCommonEqualRangeMappings(equalRangeMappings1, equalRangeMappings2) {
        const result = [];
        const events = [];
        for (const [input, rangeMappings] of [[0, equalRangeMappings1], [1, equalRangeMappings2]]) {
            for (const rangeMapping of rangeMappings) {
                events.push({
                    input: input,
                    start: true,
                    inputPos: rangeMapping.inputRange.getStartPosition(),
                    outputPos: rangeMapping.outputRange.getStartPosition()
                });
                events.push({
                    input: input,
                    start: false,
                    inputPos: rangeMapping.inputRange.getEndPosition(),
                    outputPos: rangeMapping.outputRange.getEndPosition()
                });
            }
        }
        events.sort((0, arrays_1.$5b)((m) => m.inputPos, position_1.$js.compare));
        const starts = [undefined, undefined];
        let lastInputPos;
        for (const event of events) {
            if (lastInputPos && starts.some(s => !!s)) {
                const length = (0, rangeUtils_1.$ljb)(lastInputPos, event.inputPos);
                if (!length.isZero()) {
                    result.push({
                        inputPos: lastInputPos,
                        length,
                        output1Pos: starts[0],
                        output2Pos: starts[1]
                    });
                    if (starts[0]) {
                        starts[0] = (0, rangeUtils_1.$mjb)(starts[0], length);
                    }
                    if (starts[1]) {
                        starts[1] = (0, rangeUtils_1.$mjb)(starts[1], length);
                    }
                }
            }
            starts[event.input] = event.start ? event.outputPos : undefined;
            lastInputPos = event.inputPos;
        }
        return result;
    }
});
//# sourceMappingURL=lineAlignment.js.map