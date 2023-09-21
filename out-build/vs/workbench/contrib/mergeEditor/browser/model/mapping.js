/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/assert", "vs/base/common/errors", "vs/editor/common/core/range", "vs/workbench/contrib/mergeEditor/browser/utils", "./editing", "./lineRange", "vs/workbench/contrib/mergeEditor/browser/model/rangeUtils"], function (require, exports, arrays_1, arraysFind_1, assert_1, errors_1, range_1, utils_1, editing_1, lineRange_1, rangeUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tjb = exports.$sjb = exports.$rjb = exports.$qjb = exports.$pjb = exports.$ojb = void 0;
    /**
     * Represents a mapping of an input line range to an output line range.
    */
    class $ojb {
        static join(mappings) {
            return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, undefined);
        }
        constructor(inputRange, outputRange) {
            this.inputRange = inputRange;
            this.outputRange = outputRange;
        }
        extendInputRange(extendedInputRange) {
            if (!extendedInputRange.containsRange(this.inputRange)) {
                throw new errors_1.$ab();
            }
            const startDelta = extendedInputRange.startLineNumber - this.inputRange.startLineNumber;
            const endDelta = extendedInputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
            return new $ojb(extendedInputRange, new lineRange_1.$6ib(this.outputRange.startLineNumber + startDelta, this.outputRange.lineCount - startDelta + endDelta));
        }
        join(other) {
            return new $ojb(this.inputRange.join(other.inputRange), this.outputRange.join(other.outputRange));
        }
        get resultingDeltaFromOriginalToModified() {
            return this.outputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
        }
        toString() {
            return `${this.inputRange.toString()} -> ${this.outputRange.toString()}`;
        }
        addOutputLineDelta(delta) {
            return new $ojb(this.inputRange, this.outputRange.delta(delta));
        }
        addInputLineDelta(delta) {
            return new $ojb(this.inputRange.delta(delta), this.outputRange);
        }
        reverse() {
            return new $ojb(this.outputRange, this.inputRange);
        }
    }
    exports.$ojb = $ojb;
    /**
    * Represents a total monotonous mapping of line ranges in one document to another document.
    */
    class $pjb {
        static betweenOutputs(inputToOutput1, inputToOutput2, inputLineCount) {
            const alignments = $qjb.compute(inputToOutput1, inputToOutput2);
            const mappings = alignments.map((m) => new $ojb(m.output1Range, m.output2Range));
            return new $pjb(mappings, inputLineCount);
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
            (0, assert_1.$xc)(() => {
                return (0, assert_1.$yc)(lineRangeMappings, (m1, m2) => m1.inputRange.isBefore(m2.inputRange) && m1.outputRange.isBefore(m2.outputRange) &&
                    m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive);
            });
        }
        project(lineNumber) {
            const lastBefore = (0, arraysFind_1.$db)(this.lineRangeMappings, r => r.inputRange.startLineNumber <= lineNumber);
            if (!lastBefore) {
                return new $ojb(new lineRange_1.$6ib(lineNumber, 1), new lineRange_1.$6ib(lineNumber, 1));
            }
            if (lastBefore.inputRange.contains(lineNumber)) {
                return lastBefore;
            }
            const containingRange = new lineRange_1.$6ib(lineNumber, 1);
            const mappedRange = new lineRange_1.$6ib(lineNumber +
                lastBefore.outputRange.endLineNumberExclusive -
                lastBefore.inputRange.endLineNumberExclusive, 1);
            return new $ojb(containingRange, mappedRange);
        }
        get outputLineCount() {
            const last = (0, arrays_1.$Nb)(this.lineRangeMappings);
            const diff = last ? last.outputRange.endLineNumberExclusive - last.inputRange.endLineNumberExclusive : 0;
            return this.inputLineCount + diff;
        }
        reverse() {
            return new $pjb(this.lineRangeMappings.map(r => r.reverse()), this.outputLineCount);
        }
    }
    exports.$pjb = $pjb;
    /**
     * Aligns two mappings with a common input range.
     */
    class $qjb {
        static compute(fromInputToOutput1, fromInputToOutput2) {
            const compareByStartLineNumber = (0, arrays_1.$5b)((d) => d.inputRange.startLineNumber, arrays_1.$7b);
            const combinedDiffs = (0, utils_1.$_ib)(fromInputToOutput1.map((diff) => ({ source: 0, diff })), fromInputToOutput2.map((diff) => ({ source: 1, diff }))).sort((0, arrays_1.$5b)((d) => d.diff, compareByStartLineNumber));
            const currentDiffs = [new Array(), new Array()];
            const deltaFromBaseToInput = [0, 0];
            const alignments = new Array();
            function pushAndReset(inputRange) {
                const mapping1 = $ojb.join(currentDiffs[0]) || new $ojb(inputRange, inputRange.delta(deltaFromBaseToInput[0]));
                const mapping2 = $ojb.join(currentDiffs[1]) || new $ojb(inputRange, inputRange.delta(deltaFromBaseToInput[1]));
                alignments.push(new $qjb(currentInputRange, mapping1.extendInputRange(currentInputRange).outputRange, currentDiffs[0], mapping2.extendInputRange(currentInputRange).outputRange, currentDiffs[1]));
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
    exports.$qjb = $qjb;
    /**
     * A line range mapping with inner range mappings.
    */
    class $rjb extends $ojb {
        static join(mappings) {
            return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, undefined);
        }
        constructor(inputRange, inputTextModel, outputRange, outputTextModel, rangeMappings) {
            super(inputRange, outputRange);
            this.inputTextModel = inputTextModel;
            this.outputTextModel = outputTextModel;
            this.rangeMappings = rangeMappings || [new $sjb(this.inputRange.toRange(), this.outputRange.toRange())];
        }
        addOutputLineDelta(delta) {
            return new $rjb(this.inputRange, this.inputTextModel, this.outputRange.delta(delta), this.outputTextModel, this.rangeMappings.map(d => d.addOutputLineDelta(delta)));
        }
        addInputLineDelta(delta) {
            return new $rjb(this.inputRange.delta(delta), this.inputTextModel, this.outputRange, this.outputTextModel, this.rangeMappings.map(d => d.addInputLineDelta(delta)));
        }
        join(other) {
            return new $rjb(this.inputRange.join(other.inputRange), this.inputTextModel, this.outputRange.join(other.outputRange), this.outputTextModel);
        }
        getLineEdit() {
            return new editing_1.$gjb(this.inputRange, this.a());
        }
        getReverseLineEdit() {
            return new editing_1.$gjb(this.outputRange, this.b());
        }
        a() {
            return this.outputRange.getLines(this.outputTextModel);
        }
        b() {
            return this.inputRange.getLines(this.inputTextModel);
        }
    }
    exports.$rjb = $rjb;
    /**
     * Represents a mapping of an input range to an output range.
    */
    class $sjb {
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
            return new $sjb(this.inputRange, new range_1.$ks(this.outputRange.startLineNumber + deltaLines, this.outputRange.startColumn, this.outputRange.endLineNumber + deltaLines, this.outputRange.endColumn));
        }
        addInputLineDelta(deltaLines) {
            return new $sjb(new range_1.$ks(this.inputRange.startLineNumber + deltaLines, this.inputRange.startColumn, this.inputRange.endLineNumber + deltaLines, this.inputRange.endColumn), this.outputRange);
        }
        reverse() {
            return new $sjb(this.outputRange, this.inputRange);
        }
    }
    exports.$sjb = $sjb;
    /**
    * Represents a total monotonous mapping of ranges in one document to another document.
    */
    class $tjb {
        constructor(
        /**
         * The line range mappings that define this document mapping.
         * Can have holes.
        */
        rangeMappings, inputLineCount) {
            this.rangeMappings = rangeMappings;
            this.inputLineCount = inputLineCount;
            (0, assert_1.$xc)(() => (0, assert_1.$yc)(rangeMappings, (m1, m2) => (0, rangeUtils_1.$njb)(m1.inputRange, m2.inputRange) &&
                (0, rangeUtils_1.$njb)(m1.outputRange, m2.outputRange) /*&&
            lengthBetweenPositions(m1.inputRange.getEndPosition(), m2.inputRange.getStartPosition()).equals(
                lengthBetweenPositions(m1.outputRange.getEndPosition(), m2.outputRange.getStartPosition())
            )*/));
        }
        project(position) {
            const lastBefore = (0, arraysFind_1.$db)(this.rangeMappings, r => r.inputRange.getStartPosition().isBeforeOrEqual(position));
            if (!lastBefore) {
                return new $sjb(range_1.$ks.fromPositions(position, position), range_1.$ks.fromPositions(position, position));
            }
            if ((0, rangeUtils_1.$jjb)(lastBefore.inputRange, position)) {
                return lastBefore;
            }
            const dist = (0, rangeUtils_1.$ljb)(lastBefore.inputRange.getEndPosition(), position);
            const outputPos = (0, rangeUtils_1.$mjb)(lastBefore.outputRange.getEndPosition(), dist);
            return new $sjb(range_1.$ks.fromPositions(position), range_1.$ks.fromPositions(outputPos));
        }
        projectRange(range) {
            const start = this.project(range.getStartPosition());
            const end = this.project(range.getEndPosition());
            return new $sjb(start.inputRange.plusRange(end.inputRange), start.outputRange.plusRange(end.outputRange));
        }
        get outputLineCount() {
            const last = (0, arrays_1.$Nb)(this.rangeMappings);
            const diff = last ? last.outputRange.endLineNumber - last.inputRange.endLineNumber : 0;
            return this.inputLineCount + diff;
        }
        reverse() {
            return new $tjb(this.rangeMappings.map(m => m.reverse()), this.outputLineCount);
        }
    }
    exports.$tjb = $tjb;
});
//# sourceMappingURL=mapping.js.map