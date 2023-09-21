/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/assert", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/core/range", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines", "vs/editor/common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations", "vs/editor/common/diff/linesDiffComputer", "../rangeMapping", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/lineSequence"], function (require, exports, arrays_1, assert_1, lineRange_1, offsetRange_1, range_1, diffAlgorithm_1, dynamicProgrammingDiffing_1, myersDiffAlgorithm_1, computeMovedLines_1, heuristicSequenceOptimizations_1, linesDiffComputer_1, rangeMapping_1, linesSliceCharSequence_1, lineSequence_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLineRangeMapping = exports.lineRangeMappingFromRangeMappings = exports.DefaultLinesDiffComputer = void 0;
    class DefaultLinesDiffComputer {
        constructor() {
            this.dynamicProgrammingDiffing = new dynamicProgrammingDiffing_1.DynamicProgrammingDiffing();
            this.myersDiffingAlgorithm = new myersDiffAlgorithm_1.MyersDiffAlgorithm();
        }
        computeDiff(originalLines, modifiedLines, options) {
            if (originalLines.length <= 1 && (0, arrays_1.equals)(originalLines, modifiedLines, (a, b) => a === b)) {
                return new linesDiffComputer_1.LinesDiff([], [], false);
            }
            if (originalLines.length === 1 && originalLines[0].length === 0 || modifiedLines.length === 1 && modifiedLines[0].length === 0) {
                return new linesDiffComputer_1.LinesDiff([
                    new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(1, originalLines.length + 1), new lineRange_1.LineRange(1, modifiedLines.length + 1), [
                        new rangeMapping_1.RangeMapping(new range_1.Range(1, 1, originalLines.length, originalLines[0].length + 1), new range_1.Range(1, 1, modifiedLines.length, modifiedLines[0].length + 1))
                    ])
                ], [], false);
            }
            const timeout = options.maxComputationTimeMs === 0 ? diffAlgorithm_1.InfiniteTimeout.instance : new diffAlgorithm_1.DateTimeout(options.maxComputationTimeMs);
            const considerWhitespaceChanges = !options.ignoreTrimWhitespace;
            const perfectHashes = new Map();
            function getOrCreateHash(text) {
                let hash = perfectHashes.get(text);
                if (hash === undefined) {
                    hash = perfectHashes.size;
                    perfectHashes.set(text, hash);
                }
                return hash;
            }
            const originalLinesHashes = originalLines.map((l) => getOrCreateHash(l.trim()));
            const modifiedLinesHashes = modifiedLines.map((l) => getOrCreateHash(l.trim()));
            const sequence1 = new lineSequence_1.LineSequence(originalLinesHashes, originalLines);
            const sequence2 = new lineSequence_1.LineSequence(modifiedLinesHashes, modifiedLines);
            const lineAlignmentResult = (() => {
                if (sequence1.length + sequence2.length < 1700) {
                    // Use the improved algorithm for small files
                    return this.dynamicProgrammingDiffing.compute(sequence1, sequence2, timeout, (offset1, offset2) => originalLines[offset1] === modifiedLines[offset2]
                        ? modifiedLines[offset2].length === 0
                            ? 0.1
                            : 1 + Math.log(1 + modifiedLines[offset2].length)
                        : 0.99);
                }
                return this.myersDiffingAlgorithm.compute(sequence1, sequence2);
            })();
            let lineAlignments = lineAlignmentResult.diffs;
            let hitTimeout = lineAlignmentResult.hitTimeout;
            lineAlignments = (0, heuristicSequenceOptimizations_1.optimizeSequenceDiffs)(sequence1, sequence2, lineAlignments);
            lineAlignments = (0, heuristicSequenceOptimizations_1.removeVeryShortMatchingLinesBetweenDiffs)(sequence1, sequence2, lineAlignments);
            const alignments = [];
            const scanForWhitespaceChanges = (equalLinesCount) => {
                if (!considerWhitespaceChanges) {
                    return;
                }
                for (let i = 0; i < equalLinesCount; i++) {
                    const seq1Offset = seq1LastStart + i;
                    const seq2Offset = seq2LastStart + i;
                    if (originalLines[seq1Offset] !== modifiedLines[seq2Offset]) {
                        // This is because of whitespace changes, diff these lines
                        const characterDiffs = this.refineDiff(originalLines, modifiedLines, new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(seq1Offset, seq1Offset + 1), new offsetRange_1.OffsetRange(seq2Offset, seq2Offset + 1)), timeout, considerWhitespaceChanges);
                        for (const a of characterDiffs.mappings) {
                            alignments.push(a);
                        }
                        if (characterDiffs.hitTimeout) {
                            hitTimeout = true;
                        }
                    }
                }
            };
            let seq1LastStart = 0;
            let seq2LastStart = 0;
            for (const diff of lineAlignments) {
                (0, assert_1.assertFn)(() => diff.seq1Range.start - seq1LastStart === diff.seq2Range.start - seq2LastStart);
                const equalLinesCount = diff.seq1Range.start - seq1LastStart;
                scanForWhitespaceChanges(equalLinesCount);
                seq1LastStart = diff.seq1Range.endExclusive;
                seq2LastStart = diff.seq2Range.endExclusive;
                const characterDiffs = this.refineDiff(originalLines, modifiedLines, diff, timeout, considerWhitespaceChanges);
                if (characterDiffs.hitTimeout) {
                    hitTimeout = true;
                }
                for (const a of characterDiffs.mappings) {
                    alignments.push(a);
                }
            }
            scanForWhitespaceChanges(originalLines.length - seq1LastStart);
            const changes = lineRangeMappingFromRangeMappings(alignments, originalLines, modifiedLines);
            let moves = [];
            if (options.computeMoves) {
                moves = this.computeMoves(changes, originalLines, modifiedLines, originalLinesHashes, modifiedLinesHashes, timeout, considerWhitespaceChanges);
            }
            // Make sure all ranges are valid
            (0, assert_1.assertFn)(() => {
                function validatePosition(pos, lines) {
                    if (pos.lineNumber < 1 || pos.lineNumber > lines.length) {
                        return false;
                    }
                    const line = lines[pos.lineNumber - 1];
                    if (pos.column < 1 || pos.column > line.length + 1) {
                        return false;
                    }
                    return true;
                }
                function validateRange(range, lines) {
                    if (range.startLineNumber < 1 || range.startLineNumber > lines.length + 1) {
                        return false;
                    }
                    if (range.endLineNumberExclusive < 1 || range.endLineNumberExclusive > lines.length + 1) {
                        return false;
                    }
                    return true;
                }
                for (const c of changes) {
                    if (!c.innerChanges) {
                        return false;
                    }
                    for (const ic of c.innerChanges) {
                        const valid = validatePosition(ic.modifiedRange.getStartPosition(), modifiedLines) && validatePosition(ic.modifiedRange.getEndPosition(), modifiedLines) &&
                            validatePosition(ic.originalRange.getStartPosition(), originalLines) && validatePosition(ic.originalRange.getEndPosition(), originalLines);
                        if (!valid) {
                            return false;
                        }
                    }
                    if (!validateRange(c.modified, modifiedLines) || !validateRange(c.original, originalLines)) {
                        return false;
                    }
                }
                return true;
            });
            return new linesDiffComputer_1.LinesDiff(changes, moves, hitTimeout);
        }
        computeMoves(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout, considerWhitespaceChanges) {
            const moves = (0, computeMovedLines_1.computeMovedLines)(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout);
            const movesWithDiffs = moves.map(m => {
                const moveChanges = this.refineDiff(originalLines, modifiedLines, new diffAlgorithm_1.SequenceDiff(m.original.toOffsetRange(), m.modified.toOffsetRange()), timeout, considerWhitespaceChanges);
                const mappings = lineRangeMappingFromRangeMappings(moveChanges.mappings, originalLines, modifiedLines, true);
                return new linesDiffComputer_1.MovedText(m, mappings);
            });
            return movesWithDiffs;
        }
        refineDiff(originalLines, modifiedLines, diff, timeout, considerWhitespaceChanges) {
            const slice1 = new linesSliceCharSequence_1.LinesSliceCharSequence(originalLines, diff.seq1Range, considerWhitespaceChanges);
            const slice2 = new linesSliceCharSequence_1.LinesSliceCharSequence(modifiedLines, diff.seq2Range, considerWhitespaceChanges);
            const diffResult = slice1.length + slice2.length < 500
                ? this.dynamicProgrammingDiffing.compute(slice1, slice2, timeout)
                : this.myersDiffingAlgorithm.compute(slice1, slice2, timeout);
            let diffs = diffResult.diffs;
            diffs = (0, heuristicSequenceOptimizations_1.optimizeSequenceDiffs)(slice1, slice2, diffs);
            diffs = (0, heuristicSequenceOptimizations_1.extendDiffsToEntireWordIfAppropriate)(slice1, slice2, diffs);
            diffs = (0, heuristicSequenceOptimizations_1.removeShortMatches)(slice1, slice2, diffs);
            diffs = (0, heuristicSequenceOptimizations_1.removeVeryShortMatchingTextBetweenLongDiffs)(slice1, slice2, diffs);
            const result = diffs.map((d) => new rangeMapping_1.RangeMapping(slice1.translateRange(d.seq1Range), slice2.translateRange(d.seq2Range)));
            // Assert: result applied on original should be the same as diff applied to original
            return {
                mappings: result,
                hitTimeout: diffResult.hitTimeout,
            };
        }
    }
    exports.DefaultLinesDiffComputer = DefaultLinesDiffComputer;
    function lineRangeMappingFromRangeMappings(alignments, originalLines, modifiedLines, dontAssertStartLine = false) {
        const changes = [];
        for (const g of (0, arrays_1.groupAdjacentBy)(alignments.map(a => getLineRangeMapping(a, originalLines, modifiedLines)), (a1, a2) => a1.original.overlapOrTouch(a2.original)
            || a1.modified.overlapOrTouch(a2.modified))) {
            const first = g[0];
            const last = g[g.length - 1];
            changes.push(new rangeMapping_1.DetailedLineRangeMapping(first.original.join(last.original), first.modified.join(last.modified), g.map(a => a.innerChanges[0])));
        }
        (0, assert_1.assertFn)(() => {
            if (!dontAssertStartLine) {
                if (changes.length > 0 && changes[0].original.startLineNumber !== changes[0].modified.startLineNumber) {
                    return false;
                }
            }
            return (0, assert_1.checkAdjacentItems)(changes, (m1, m2) => m2.original.startLineNumber - m1.original.endLineNumberExclusive === m2.modified.startLineNumber - m1.modified.endLineNumberExclusive &&
                // There has to be an unchanged line in between (otherwise both diffs should have been joined)
                m1.original.endLineNumberExclusive < m2.original.startLineNumber &&
                m1.modified.endLineNumberExclusive < m2.modified.startLineNumber);
        });
        return changes;
    }
    exports.lineRangeMappingFromRangeMappings = lineRangeMappingFromRangeMappings;
    function getLineRangeMapping(rangeMapping, originalLines, modifiedLines) {
        let lineStartDelta = 0;
        let lineEndDelta = 0;
        // rangeMapping describes the edit that replaces `rangeMapping.originalRange` with `newText := getText(modifiedLines, rangeMapping.modifiedRange)`.
        // original: ]xxx \n <- this line is not modified
        // modified: ]xx  \n
        if (rangeMapping.modifiedRange.endColumn === 1 && rangeMapping.originalRange.endColumn === 1
            && rangeMapping.originalRange.startLineNumber + lineStartDelta <= rangeMapping.originalRange.endLineNumber
            && rangeMapping.modifiedRange.startLineNumber + lineStartDelta <= rangeMapping.modifiedRange.endLineNumber) {
            // We can only do this if the range is not empty yet
            lineEndDelta = -1;
        }
        // original: xxx[ \n <- this line is not modified
        // modified: xxx[ \n
        if (rangeMapping.modifiedRange.startColumn - 1 >= modifiedLines[rangeMapping.modifiedRange.startLineNumber - 1].length
            && rangeMapping.originalRange.startColumn - 1 >= originalLines[rangeMapping.originalRange.startLineNumber - 1].length
            && rangeMapping.originalRange.startLineNumber <= rangeMapping.originalRange.endLineNumber + lineEndDelta
            && rangeMapping.modifiedRange.startLineNumber <= rangeMapping.modifiedRange.endLineNumber + lineEndDelta) {
            // We can only do this if the range is not empty yet
            lineStartDelta = 1;
        }
        const originalLineRange = new lineRange_1.LineRange(rangeMapping.originalRange.startLineNumber + lineStartDelta, rangeMapping.originalRange.endLineNumber + 1 + lineEndDelta);
        const modifiedLineRange = new lineRange_1.LineRange(rangeMapping.modifiedRange.startLineNumber + lineStartDelta, rangeMapping.modifiedRange.endLineNumber + 1 + lineEndDelta);
        return new rangeMapping_1.DetailedLineRangeMapping(originalLineRange, modifiedLineRange, [rangeMapping]);
    }
    exports.getLineRangeMapping = getLineRangeMapping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9kaWZmL2RlZmF1bHRMaW5lc0RpZmZDb21wdXRlci9kZWZhdWx0TGluZXNEaWZmQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFhLHdCQUF3QjtRQUFyQztZQUNrQiw4QkFBeUIsR0FBRyxJQUFJLHFEQUF5QixFQUFFLENBQUM7WUFDNUQsMEJBQXFCLEdBQUcsSUFBSSx1Q0FBa0IsRUFBRSxDQUFDO1FBc05uRSxDQUFDO1FBcE5BLFdBQVcsQ0FBQyxhQUF1QixFQUFFLGFBQXVCLEVBQUUsT0FBa0M7WUFDL0YsSUFBSSxhQUFhLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxJQUFBLGVBQU0sRUFBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUN6RixPQUFPLElBQUksNkJBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0gsT0FBTyxJQUFJLDZCQUFTLENBQUM7b0JBQ3BCLElBQUksdUNBQXdCLENBQzNCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDMUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxhQUFhLENB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