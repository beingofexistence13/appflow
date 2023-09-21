/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/assert", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/rangeUtils"], function (require, exports, arrays_1, assert_1, types_1, position_1, range_1, length_1, mapping_1, rangeUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAlignments = void 0;
    function getAlignments(m) {
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
                if (m.length.isGreaterThan(new length_1.LengthObj(1, 0))) {
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
        (0, assert_1.assertFn)(() => (0, assert_1.checkAdjacentItems)(result.map(r => r[0]).filter(types_1.isDefined), (a, b) => a < b)
            && (0, assert_1.checkAdjacentItems)(result.map(r => r[1]).filter(types_1.isDefined), (a, b) => a <= b)
            && (0, assert_1.checkAdjacentItems)(result.map(r => r[2]).filter(types_1.isDefined), (a, b) => a < b)
            && result.every(alignment => alignment.filter(types_1.isDefined).length >= 2));
        return result;
    }
    exports.getAlignments = getAlignments;
    function toEqualRangeMappings(diffs, inputRange, outputRange) {
        const result = [];
        let equalRangeInputStart = inputRange.getStartPosition();
        let equalRangeOutputStart = outputRange.getStartPosition();
        for (const d of diffs) {
            const equalRangeMapping = new mapping_1.RangeMapping(range_1.Range.fromPositions(equalRangeInputStart, d.inputRange.getStartPosition()), range_1.Range.fromPositions(equalRangeOutputStart, d.outputRange.getStartPosition()));
            (0, assert_1.assertFn)(() => (0, rangeUtils_1.lengthOfRange)(equalRangeMapping.inputRange).equals((0, rangeUtils_1.lengthOfRange)(equalRangeMapping.outputRange)));
            if (!equalRangeMapping.inputRange.isEmpty()) {
                result.push(equalRangeMapping);
            }
            equalRangeInputStart = d.inputRange.getEndPosition();
            equalRangeOutputStart = d.outputRange.getEndPosition();
        }
        const equalRangeMapping = new mapping_1.RangeMapping(range_1.Range.fromPositions(equalRangeInputStart, inputRange.getEndPosition()), range_1.Range.fromPositions(equalRangeOutputStart, outputRange.getEndPosition()));
        (0, assert_1.assertFn)(() => (0, rangeUtils_1.lengthOfRange)(equalRangeMapping.inputRange).equals((0, rangeUtils_1.lengthOfRange)(equalRangeMapping.outputRange)));
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
        events.sort((0, arrays_1.compareBy)((m) => m.inputPos, position_1.Position.compare));
        const starts = [undefined, undefined];
        let lastInputPos;
        for (const event of events) {
            if (lastInputPos && starts.some(s => !!s)) {
                const length = (0, rangeUtils_1.lengthBetweenPositions)(lastInputPos, event.inputPos);
                if (!length.isZero()) {
                    result.push({
                        inputPos: lastInputPos,
                        length,
                        output1Pos: starts[0],
                        output2Pos: starts[1]
                    });
                    if (starts[0]) {
                        starts[0] = (0, rangeUtils_1.addLength)(starts[0], length);
                    }
                    if (starts[1]) {
                        starts[1] = (0, rangeUtils_1.addLength)(starts[1], length);
                    }
                }
            }
            starts[event.input] = event.start ? event.outputPos : undefined;
            lastInputPos = event.inputPos;
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZUFsaWdubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvdmlldy9saW5lQWxpZ25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxTQUFnQixhQUFhLENBQUMsQ0FBb0I7UUFDakQsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDdkksTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFdkksTUFBTSxZQUFZLEdBQUcsK0JBQStCLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWpGLElBQUksTUFBTSxHQUFvQixFQUFFLENBQUM7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsZUFBZSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVySCxTQUFTLFVBQVUsQ0FBQyxhQUE0QjtZQUMvQyxPQUFPLGFBQWEsQ0FBQyxLQUFL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