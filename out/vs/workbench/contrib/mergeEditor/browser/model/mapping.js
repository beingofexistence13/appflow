/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/assert", "vs/base/common/errors", "vs/editor/common/core/range", "vs/workbench/contrib/mergeEditor/browser/utils", "./editing", "./lineRange", "vs/workbench/contrib/mergeEditor/browser/model/rangeUtils"], function (require, exports, arrays_1, arraysFind_1, assert_1, errors_1, range_1, utils_1, editing_1, lineRange_1, rangeUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentRangeMap = exports.RangeMapping = exports.DetailedLineRangeMapping = exports.MappingAlignment = exports.DocumentLineRangeMap = exports.LineRangeMapping = void 0;
    /**
     * Represents a mapping of an input line range to an output line range.
    */
    class LineRangeMapping {
        static join(mappings) {
            return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, undefined);
        }
        constructor(inputRange, outputRange) {
            this.inputRange = inputRange;
            this.outputRange = outputRange;
        }
        extendInputRange(extendedInputRange) {
            if (!extendedInputRange.containsRange(this.inputRange)) {
                throw new errors_1.BugIndicatingError();
            }
            const startDelta = extendedInputRange.startLineNumber - this.inputRange.startLineNumber;
            const endDelta = extendedInputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
            return new LineRangeMapping(extendedInputRange, new lineRange_1.LineRange(this.outputRange.startLineNumber + startDelta, this.outputRange.lineCount - startDelta + endDelta));
        }
        join(other) {
            return new LineRangeMapping(this.inputRange.join(other.inputRange), this.outputRange.join(other.outputRange));
        }
        get resultingDeltaFromOriginalToModified() {
            return this.outputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
        }
        toString() {
            return `${this.inputRange.toString()} -> ${this.outputRange.toString()}`;
        }
        addOutputLineDelta(delta) {
            return new LineRangeMapping(this.inputRange, this.outputRange.delta(delta));
        }
        addInputLineDelta(delta) {
            return new LineRangeMapping(this.inputRange.delta(delta), this.outputRange);
        }
        reverse() {
            return new LineRangeMapping(this.outputRange, this.inputRange);
        }
    }
    exports.LineRangeMapping = LineRangeMapping;
    /**
    * Represents a total monotonous mapping of line ranges in one document to another document.
    */
    class DocumentLineRangeMap {
        static betweenOutputs(inputToOutput1, inputToOutput2, inputLineCount) {
            const alignments = MappingAlignment.compute(inputToOutput1, inputToOutput2);
            const mappings = alignments.map((m) => new LineRangeMapping(m.output1Range, m.output2Range));
            return new DocumentLineRangeMap(mappings, inputLineCount);
        }
        constructor(
        /**
         * The line range mappings that define this document mapping.
         * The space between two input ranges must equal the space between two output ranges.
         * These holes act as dense sequence of 1:1 line mappings.
        */
        lineRangeMappings, inputLineCount) {
            this.lineRangeMappings = lineRangeMappings;
            this.inputLineCount = inputLineCount;
            (0, assert_1.assertFn)(() => {
                return (0, assert_1.checkAdjacentItems)(lineRangeMappings, (m1, m2) => m1.inputRange.isBefore(m2.inputRange) && m1.outputRange.isBefore(m2.outputRange) &&
                    m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive);
            });
        }
        project(lineNumber) {
            const lastBefore = (0, arraysFind_1.findLast)(this.lineRangeMappings, r => r.inputRange.startLineNumber <= lineNumber);
            if (!lastBefore) {
                return new LineRangeMapping(new lineRange_1.LineRange(lineNumber, 1), new lineRange_1.LineRange(lineNumber, 1));
            }
            if (lastBefore.inputRange.contains(lineNumber)) {
                return lastBefore;
            }
            const containingRange = new lineRange_1.LineRange(lineNumber, 1);
            const mappedRange = new lineRange_1.LineRange(lineNumber +
                lastBefore.outputRange.endLineNumberExclusive -
                lastBefore.inputRange.endLineNumberExclusive, 1);
            return new LineRangeMapping(containingRange, mappedRange);
        }
        get outputLineCount() {
            const last = (0, arrays_1.lastOrDefault)(this.lineRangeMappings);
            const diff = last ? last.outputRange.endLineNumberExclusive - last.inputRange.endLineNumberExclusive : 0;
            return this.inputLineCount + diff;
        }
        reverse() {
            return new DocumentLineRangeMap(this.lineRangeMappings.map(r => r.reverse()), this.outputLineCount);
        }
    }
    exports.DocumentLineRangeMap = DocumentLineRangeMap;
    /**
     * Aligns two mappings with a common input range.
     */
    class MappingAlignment {
        static compute(fromInputToOutput1, fromInputToOutput2) {
            const compareByStartLineNumber = (0, arrays_1.compareBy)((d) => d.inputRange.startLineNumber, arrays_1.numberComparator);
            const combinedDiffs = (0, utils_1.concatArrays)(fromInputToOutput1.map((diff) => ({ source: 0, diff })), fromInputToOutput2.map((diff) => ({ source: 1, diff }))).sort((0, arrays_1.compareBy)((d) => d.diff, compareByStartLineNumber));
            const currentDiffs = [new Array(), new Array()];
            const deltaFromBaseToInput = [0, 0];
            const alignments = new Array();
            function pushAndReset(inputRange) {
                const mapping1 = LineRangeMapping.join(currentDiffs[0]) || new LineRangeMapping(inputRange, inputRange.delta(deltaFromBaseToInput[0]));
                const mapping2 = LineRangeMapping.join(currentDiffs[1]) || new LineRangeMapping(inputRange, inputRange.delta(deltaFromBaseToInput[1]));
                alignments.push(new MappingAlignment(currentInputRange, mapping1.extendInputRange(currentInputRange).outputRange, currentDiffs[0], mapping2.extendInputRange(currentInputRange).outputRange, currentDiffs[1]));
                currentDiffs[0] = [];
                currentDiffs[1] = [];
            }
            let currentInputRange;
            for (const diff of combinedDiffs) {
                const range = diff.diff.inputRange;
                if (currentInputRange && !currentInputRange.touches(range)) {
                    pushAndReset(currentInputRange);
                    currentInputRange = undefined;
                }
                deltaFromBaseToInput[diff.source] =
                    diff.diff.resultingDeltaFromOriginalToModified;
                currentInputRange = currentInputRange ? currentInputRange.join(range) : range;
                currentDiffs[diff.source].push(diff.diff);
            }
            if (currentInputRange) {
                pushAndReset(currentInputRange);
            }
            return alignments;
        }
        constructor(inputRange, output1Range, output1LineMappings, output2Range, output2LineMappings) {
            this.inputRange = inputRange;
            this.output1Range = output1Range;
            this.output1LineMappings = output1LineMappings;
            this.output2Range = output2Range;
            this.output2LineMappings = output2LineMappings;
        }
        toString() {
            return `${this.output1Range} <- ${this.inputRange} -> ${this.output2Range}`;
        }
    }
    exports.MappingAlignment = MappingAlignment;
    /**
     * A line range mapping with inner range mappings.
    */
    class DetailedLineRangeMapping extends LineRangeMapping {
        static join(mappings) {
            return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, undefined);
        }
        constructor(inputRange, inputTextModel, outputRange, outputTextModel, rangeMappings) {
            super(inputRange, outputRange);
            this.inputTextModel = inputTextModel;
            this.outputTextModel = outputTextModel;
            this.rangeMappings = rangeMappings || [new RangeMapping(this.inputRange.toRange(), this.outputRange.toRange())];
        }
        addOutputLineDelta(delta) {
            return new DetailedLineRangeMapping(this.inputRange, this.inputTextModel, this.outputRange.delta(delta), this.outputTextModel, this.rangeMappings.map(d => d.addOutputLineDelta(delta)));
        }
        addInputLineDelta(delta) {
            return new DetailedLineRangeMapping(this.inputRange.delta(delta), this.inputTextModel, this.outputRange, this.outputTextModel, this.rangeMappings.map(d => d.addInputLineDelta(delta)));
        }
        join(other) {
            return new DetailedLineRangeMapping(this.inputRange.join(other.inputRange), this.inputTextModel, this.outputRange.join(other.outputRange), this.outputTextModel);
        }
        getLineEdit() {
            return new editing_1.LineRangeEdit(this.inputRange, this.getOutputLines());
        }
        getReverseLineEdit() {
            return new editing_1.LineRangeEdit(this.outputRange, this.getInputLines());
        }
        getOutputLines() {
            return this.outputRange.getLines(this.outputTextModel);
        }
        getInputLines() {
            return this.inputRange.getLines(this.inputTextModel);
        }
    }
    exports.DetailedLineRangeMapping = DetailedLineRangeMapping;
    /**
     * Represents a mapping of an input range to an output range.
    */
    class RangeMapping {
        constructor(inputRange, outputRange) {
            this.inputRange = inputRange;
            this.outputRange = outputRange;
        }
        toString() {
            function rangeToString(range) {
                // TODO@hediet make this the default Range.toString
                return `[${range.startLineNumber}:${range.startColumn}, ${range.endLineNumber}:${range.endColumn})`;
            }
            return `${rangeToString(this.inputRange)} -> ${rangeToString(this.outputRange)}`;
        }
        addOutputLineDelta(deltaLines) {
            return new RangeMapping(this.inputRange, new range_1.Range(this.outputRange.startLineNumber + deltaLines, this.outputRange.startColumn, this.outputRange.endLineNumber + deltaLines, this.outputRange.endColumn));
        }
        addInputLineDelta(deltaLines) {
            return new RangeMapping(new range_1.Range(this.inputRange.startLineNumber + deltaLines, this.inputRange.startColumn, this.inputRange.endLineNumber + deltaLines, this.inputRange.endColumn), this.outputRange);
        }
        reverse() {
            return new RangeMapping(this.outputRange, this.inputRange);
        }
    }
    exports.RangeMapping = RangeMapping;
    /**
    * Represents a total monotonous mapping of ranges in one document to another document.
    */
    class DocumentRangeMap {
        constructor(
        /**
         * The line range mappings that define this document mapping.
         * Can have holes.
        */
        rangeMappings, inputLineCount) {
            this.rangeMappings = rangeMappings;
            this.inputLineCount = inputLineCount;
            (0, assert_1.assertFn)(() => (0, assert_1.checkAdjacentItems)(rangeMappings, (m1, m2) => (0, rangeUtils_1.rangeIsBeforeOrTouching)(m1.inputRange, m2.inputRange) &&
                (0, rangeUtils_1.rangeIsBeforeOrTouching)(m1.outputRange, m2.outputRange) /*&&
            lengthBetweenPositions(m1.inputRange.getEndPosition(), m2.inputRange.getStartPosition()).equals(
                lengthBetweenPositions(m1.outputRange.getEndPosition(), m2.outputRange.getStartPosition())
            )*/));
        }
        project(position) {
            const lastBefore = (0, arraysFind_1.findLast)(this.rangeMappings, r => r.inputRange.getStartPosition().isBeforeOrEqual(position));
            if (!lastBefore) {
                return new RangeMapping(range_1.Range.fromPositions(position, position), range_1.Range.fromPositions(position, position));
            }
            if ((0, rangeUtils_1.rangeContainsPosition)(lastBefore.inputRange, position)) {
                return lastBefore;
            }
            const dist = (0, rangeUtils_1.lengthBetweenPositions)(lastBefore.inputRange.getEndPosition(), position);
            const outputPos = (0, rangeUtils_1.addLength)(lastBefore.outputRange.getEndPosition(), dist);
            return new RangeMapping(range_1.Range.fromPositions(position), range_1.Range.fromPositions(outputPos));
        }
        projectRange(range) {
            const start = this.project(range.getStartPosition());
            const end = this.project(range.getEndPosition());
            return new RangeMapping(start.inputRange.plusRange(end.inputRange), start.outputRange.plusRange(end.outputRange));
        }
        get outputLineCount() {
            const last = (0, arrays_1.lastOrDefault)(this.rangeMappings);
            const diff = last ? last.outputRange.endLineNumber - last.inputRange.endLineNumber : 0;
            return this.inputLineCount + diff;
        }
        reverse() {
            return new DocumentRangeMap(this.rangeMappings.map(m => m.reverse()), this.outputLineCount);
        }
    }
    exports.DocumentRangeMap = DocumentRangeMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvbW9kZWwvbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEc7O01BRUU7SUFDRixNQUFhLGdCQUFnQjtRQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQXFDO1lBQ3ZELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBK0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRyxDQUFDO1FBQ0QsWUFDaUIsVUFBcUIsRUFDckIsV0FBc0I7WUFEdEIsZUFBVSxHQUFWLFVBQVUsQ0FBVztZQUNyQixnQkFBVyxHQUFYLFdBQVcsQ0FBVztRQUNuQyxDQUFDO1FBRUUsZ0JBQWdCLENBQUMsa0JBQTZCO1lBQ3BELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN2RCxNQUFNLElBQUksMkJBQWtCLEVBQUUsQ0FBQzthQUMvQjtZQUVELE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztZQUN4RixNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDO1lBQ3BHLE9BQU8sSUFBSSxnQkFBZ0IsQ0FDMUIsa0JBQWtCLEVBQ2xCLElBQUkscUJBQVMsQ0FDWixJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsR0FBRyxVQUFVLEVBQzdDLElBQUksQ0FBQyxX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