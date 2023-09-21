/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/assert", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/core/range", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines", "vs/editor/common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations", "vs/editor/common/diff/linesDiffComputer", "../rangeMapping", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/lineSequence"], function (require, exports, arrays_1, assert_1, lineRange_1, offsetRange_1, range_1, diffAlgorithm_1, dynamicProgrammingDiffing_1, myersDiffAlgorithm_1, computeMovedLines_1, heuristicSequenceOptimizations_1, linesDiffComputer_1, rangeMapping_1, linesSliceCharSequence_1, lineSequence_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YY = exports.$XY = exports.$WY = void 0;
    class $WY {
        constructor() {
            this.e = new dynamicProgrammingDiffing_1.$MY();
            this.f = new myersDiffAlgorithm_1.$NY();
        }
        computeDiff(originalLines, modifiedLines, options) {
            if (originalLines.length <= 1 && (0, arrays_1.$sb)(originalLines, modifiedLines, (a, b) => a === b)) {
                return new linesDiffComputer_1.$ys([], [], false);
            }
            if (originalLines.length === 1 && originalLines[0].length === 0 || modifiedLines.length === 1 && modifiedLines[0].length === 0) {
                return new linesDiffComputer_1.$ys([
                    new rangeMapping_1.$ws(new lineRange_1.$ts(1, originalLines.length + 1), new lineRange_1.$ts(1, modifiedLines.length + 1), [
                        new rangeMapping_1.$xs(new range_1.$ks(1, 1, originalLines.length, originalLines[0].length + 1), new range_1.$ks(1, 1, modifiedLines.length, modifiedLines[0].length + 1))
                    ])
                ], [], false);
            }
            const timeout = options.maxComputationTimeMs === 0 ? diffAlgorithm_1.$HY.instance : new diffAlgorithm_1.$IY(options.maxComputationTimeMs);
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
            const sequence1 = new lineSequence_1.$QY(originalLinesHashes, originalLines);
            const sequence2 = new lineSequence_1.$QY(modifiedLinesHashes, modifiedLines);
            const lineAlignmentResult = (() => {
                if (sequence1.length + sequence2.length < 1700) {
                    // Use the improved algorithm for small files
                    return this.e.compute(sequence1, sequence2, timeout, (offset1, offset2) => originalLines[offset1] === modifiedLines[offset2]
                        ? modifiedLines[offset2].length === 0
                            ? 0.1
                            : 1 + Math.log(1 + modifiedLines[offset2].length)
                        : 0.99);
                }
                return this.f.compute(sequence1, sequence2);
            })();
            let lineAlignments = lineAlignmentResult.diffs;
            let hitTimeout = lineAlignmentResult.hitTimeout;
            lineAlignments = (0, heuristicSequenceOptimizations_1.$RY)(sequence1, sequence2, lineAlignments);
            lineAlignments = (0, heuristicSequenceOptimizations_1.$UY)(sequence1, sequence2, lineAlignments);
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
                        const characterDiffs = this.j(originalLines, modifiedLines, new diffAlgorithm_1.$FY(new offsetRange_1.$rs(seq1Offset, seq1Offset + 1), new offsetRange_1.$rs(seq2Offset, seq2Offset + 1)), timeout, considerWhitespaceChanges);
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
                (0, assert_1.$xc)(() => diff.seq1Range.start - seq1LastStart === diff.seq2Range.start - seq2LastStart);
                const equalLinesCount = diff.seq1Range.start - seq1LastStart;
                scanForWhitespaceChanges(equalLinesCount);
                seq1LastStart = diff.seq1Range.endExclusive;
                seq2LastStart = diff.seq2Range.endExclusive;
                const characterDiffs = this.j(originalLines, modifiedLines, diff, timeout, considerWhitespaceChanges);
                if (characterDiffs.hitTimeout) {
                    hitTimeout = true;
                }
                for (const a of characterDiffs.mappings) {
                    alignments.push(a);
                }
            }
            scanForWhitespaceChanges(originalLines.length - seq1LastStart);
            const changes = $XY(alignments, originalLines, modifiedLines);
            let moves = [];
            if (options.computeMoves) {
                moves = this.h(changes, originalLines, modifiedLines, originalLinesHashes, modifiedLinesHashes, timeout, considerWhitespaceChanges);
            }
            // Make sure all ranges are valid
            (0, assert_1.$xc)(() => {
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
            return new linesDiffComputer_1.$ys(changes, moves, hitTimeout);
        }
        h(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout, considerWhitespaceChanges) {
            const moves = (0, computeMovedLines_1.$PY)(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout);
            const movesWithDiffs = moves.map(m => {
                const moveChanges = this.j(originalLines, modifiedLines, new diffAlgorithm_1.$FY(m.original.toOffsetRange(), m.modified.toOffsetRange()), timeout, considerWhitespaceChanges);
                const mappings = $XY(moveChanges.mappings, originalLines, modifiedLines, true);
                return new linesDiffComputer_1.$zs(m, mappings);
            });
            return movesWithDiffs;
        }
        j(originalLines, modifiedLines, diff, timeout, considerWhitespaceChanges) {
            const slice1 = new linesSliceCharSequence_1.$OY(originalLines, diff.seq1Range, considerWhitespaceChanges);
            const slice2 = new linesSliceCharSequence_1.$OY(modifiedLines, diff.seq2Range, considerWhitespaceChanges);
            const diffResult = slice1.length + slice2.length < 500
                ? this.e.compute(slice1, slice2, timeout)
                : this.f.compute(slice1, slice2, timeout);
            let diffs = diffResult.diffs;
            diffs = (0, heuristicSequenceOptimizations_1.$RY)(slice1, slice2, diffs);
            diffs = (0, heuristicSequenceOptimizations_1.$TY)(slice1, slice2, diffs);
            diffs = (0, heuristicSequenceOptimizations_1.$SY)(slice1, slice2, diffs);
            diffs = (0, heuristicSequenceOptimizations_1.$VY)(slice1, slice2, diffs);
            const result = diffs.map((d) => new rangeMapping_1.$xs(slice1.translateRange(d.seq1Range), slice2.translateRange(d.seq2Range)));
            // Assert: result applied on original should be the same as diff applied to original
            return {
                mappings: result,
                hitTimeout: diffResult.hitTimeout,
            };
        }
    }
    exports.$WY = $WY;
    function $XY(alignments, originalLines, modifiedLines, dontAssertStartLine = false) {
        const changes = [];
        for (const g of (0, arrays_1.$yb)(alignments.map(a => $YY(a, originalLines, modifiedLines)), (a1, a2) => a1.original.overlapOrTouch(a2.original)
            || a1.modified.overlapOrTouch(a2.modified))) {
            const first = g[0];
            const last = g[g.length - 1];
            changes.push(new rangeMapping_1.$ws(first.original.join(last.original), first.modified.join(last.modified), g.map(a => a.innerChanges[0])));
        }
        (0, assert_1.$xc)(() => {
            if (!dontAssertStartLine) {
                if (changes.length > 0 && changes[0].original.startLineNumber !== changes[0].modified.startLineNumber) {
                    return false;
                }
            }
            return (0, assert_1.$yc)(changes, (m1, m2) => m2.original.startLineNumber - m1.original.endLineNumberExclusive === m2.modified.startLineNumber - m1.modified.endLineNumberExclusive &&
                // There has to be an unchanged line in between (otherwise both diffs should have been joined)
                m1.original.endLineNumberExclusive < m2.original.startLineNumber &&
                m1.modified.endLineNumberExclusive < m2.modified.startLineNumber);
        });
        return changes;
    }
    exports.$XY = $XY;
    function $YY(rangeMapping, originalLines, modifiedLines) {
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
        const originalLineRange = new lineRange_1.$ts(rangeMapping.originalRange.startLineNumber + lineStartDelta, rangeMapping.originalRange.endLineNumber + 1 + lineEndDelta);
        const modifiedLineRange = new lineRange_1.$ts(rangeMapping.modifiedRange.startLineNumber + lineStartDelta, rangeMapping.modifiedRange.endLineNumber + 1 + lineEndDelta);
        return new rangeMapping_1.$ws(originalLineRange, modifiedLineRange, [rangeMapping]);
    }
    exports.$YY = $YY;
});
//# sourceMappingURL=defaultLinesDiffComputer.js.map