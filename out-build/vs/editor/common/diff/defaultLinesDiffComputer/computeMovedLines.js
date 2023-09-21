/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm", "../rangeMapping", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/collections", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/utils", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm"], function (require, exports, diffAlgorithm_1, rangeMapping_1, arrays_1, arraysFind_1, collections_1, lineRange_1, offsetRange_1, linesSliceCharSequence_1, utils_1, myersDiffAlgorithm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PY = void 0;
    function $PY(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout) {
        let { moves, excludedChanges } = computeMovesFromSimpleDeletionsToSimpleInsertions(changes, originalLines, modifiedLines, timeout);
        if (!timeout.isValid()) {
            return [];
        }
        const filteredChanges = changes.filter(c => !excludedChanges.has(c));
        const unchangedMoves = computeUnchangedMoves(filteredChanges, hashedOriginalLines, hashedModifiedLines, originalLines, modifiedLines, timeout);
        (0, arrays_1.$Yb)(moves, unchangedMoves);
        moves = joinCloseConsecutiveMoves(moves);
        // Ignore too short moves
        moves = moves.filter(current => {
            const originalText = current.original.toOffsetRange().slice(originalLines).map(l => l.trim()).join('\n');
            return originalText.length >= 10;
        });
        moves = removeMovesInSameDiff(changes, moves);
        return moves;
    }
    exports.$PY = $PY;
    function computeMovesFromSimpleDeletionsToSimpleInsertions(changes, originalLines, modifiedLines, timeout) {
        const moves = [];
        const deletions = changes
            .filter(c => c.modified.isEmpty && c.original.length >= 3)
            .map(d => new utils_1.$LY(d.original, originalLines, d));
        const insertions = new Set(changes
            .filter(c => c.original.isEmpty && c.modified.length >= 3)
            .map(d => new utils_1.$LY(d.modified, modifiedLines, d)));
        const excludedChanges = new Set();
        for (const deletion of deletions) {
            let highestSimilarity = -1;
            let best;
            for (const insertion of insertions) {
                const similarity = deletion.computeSimilarity(insertion);
                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    best = insertion;
                }
            }
            if (highestSimilarity > 0.90 && best) {
                insertions.delete(best);
                moves.push(new rangeMapping_1.$vs(deletion.range, best.range));
                excludedChanges.add(deletion.source);
                excludedChanges.add(best.source);
            }
            if (!timeout.isValid()) {
                return { moves, excludedChanges };
            }
        }
        return { moves, excludedChanges };
    }
    function computeUnchangedMoves(changes, hashedOriginalLines, hashedModifiedLines, originalLines, modifiedLines, timeout) {
        const moves = [];
        const original3LineHashes = new collections_1.$L();
        for (const change of changes) {
            for (let i = change.original.startLineNumber; i < change.original.endLineNumberExclusive - 2; i++) {
                const key = `${hashedOriginalLines[i - 1]}:${hashedOriginalLines[i + 1 - 1]}:${hashedOriginalLines[i + 2 - 1]}`;
                original3LineHashes.add(key, { range: new lineRange_1.$ts(i, i + 3) });
            }
        }
        const possibleMappings = [];
        changes.sort((0, arrays_1.$5b)(c => c.modified.startLineNumber, arrays_1.$7b));
        for (const change of changes) {
            let lastMappings = [];
            for (let i = change.modified.startLineNumber; i < change.modified.endLineNumberExclusive - 2; i++) {
                const key = `${hashedModifiedLines[i - 1]}:${hashedModifiedLines[i + 1 - 1]}:${hashedModifiedLines[i + 2 - 1]}`;
                const currentModifiedRange = new lineRange_1.$ts(i, i + 3);
                const nextMappings = [];
                original3LineHashes.forEach(key, ({ range }) => {
                    for (const lastMapping of lastMappings) {
                        // does this match extend some last match?
                        if (lastMapping.originalLineRange.endLineNumberExclusive + 1 === range.endLineNumberExclusive &&
                            lastMapping.modifiedLineRange.endLineNumberExclusive + 1 === currentModifiedRange.endLineNumberExclusive) {
                            lastMapping.originalLineRange = new lineRange_1.$ts(lastMapping.originalLineRange.startLineNumber, range.endLineNumberExclusive);
                            lastMapping.modifiedLineRange = new lineRange_1.$ts(lastMapping.modifiedLineRange.startLineNumber, currentModifiedRange.endLineNumberExclusive);
                            nextMappings.push(lastMapping);
                            return;
                        }
                    }
                    const mapping = {
                        modifiedLineRange: currentModifiedRange,
                        originalLineRange: range,
                    };
                    possibleMappings.push(mapping);
                    nextMappings.push(mapping);
                });
                lastMappings = nextMappings;
            }
            if (!timeout.isValid()) {
                return [];
            }
        }
        possibleMappings.sort((0, arrays_1.$9b)((0, arrays_1.$5b)(m => m.modifiedLineRange.length, arrays_1.$7b)));
        const modifiedSet = new lineRange_1.$us();
        const originalSet = new lineRange_1.$us();
        for (const mapping of possibleMappings) {
            const diffOrigToMod = mapping.modifiedLineRange.startLineNumber - mapping.originalLineRange.startLineNumber;
            const modifiedSections = modifiedSet.subtractFrom(mapping.modifiedLineRange);
            const originalTranslatedSections = originalSet.subtractFrom(mapping.originalLineRange).getWithDelta(diffOrigToMod);
            const modifiedIntersectedSections = modifiedSections.getIntersection(originalTranslatedSections);
            for (const s of modifiedIntersectedSections.ranges) {
                if (s.length < 3) {
                    continue;
                }
                const modifiedLineRange = s;
                const originalLineRange = s.delta(-diffOrigToMod);
                moves.push(new rangeMapping_1.$vs(originalLineRange, modifiedLineRange));
                modifiedSet.addRange(modifiedLineRange);
                originalSet.addRange(originalLineRange);
            }
        }
        moves.sort((0, arrays_1.$5b)(m => m.original.startLineNumber, arrays_1.$7b));
        const monotonousChanges = new arraysFind_1.$kb(changes);
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const firstTouchingChangeOrig = monotonousChanges.findLastMonotonous(c => c.original.startLineNumber <= move.original.startLineNumber);
            const firstTouchingChangeMod = (0, arraysFind_1.$fb)(changes, c => c.modified.startLineNumber <= move.modified.startLineNumber);
            const linesAbove = Math.max(move.original.startLineNumber - firstTouchingChangeOrig.original.startLineNumber, move.modified.startLineNumber - firstTouchingChangeMod.modified.startLineNumber);
            const lastTouchingChangeOrig = monotonousChanges.findLastMonotonous(c => c.original.startLineNumber < move.original.endLineNumberExclusive);
            const lastTouchingChangeMod = (0, arraysFind_1.$fb)(changes, c => c.modified.startLineNumber < move.modified.endLineNumberExclusive);
            const linesBelow = Math.max(lastTouchingChangeOrig.original.endLineNumberExclusive - move.original.endLineNumberExclusive, lastTouchingChangeMod.modified.endLineNumberExclusive - move.modified.endLineNumberExclusive);
            let extendToTop;
            for (extendToTop = 0; extendToTop < linesAbove; extendToTop++) {
                const origLine = move.original.startLineNumber - extendToTop - 1;
                const modLine = move.modified.startLineNumber - extendToTop - 1;
                if (origLine > originalLines.length || modLine > modifiedLines.length) {
                    break;
                }
                if (modifiedSet.contains(modLine) || originalSet.contains(origLine)) {
                    break;
                }
                if (!areLinesSimilar(originalLines[origLine - 1], modifiedLines[modLine - 1], timeout)) {
                    break;
                }
            }
            if (extendToTop > 0) {
                originalSet.addRange(new lineRange_1.$ts(move.original.startLineNumber - extendToTop, move.original.startLineNumber));
                modifiedSet.addRange(new lineRange_1.$ts(move.modified.startLineNumber - extendToTop, move.modified.startLineNumber));
            }
            let extendToBottom;
            for (extendToBottom = 0; extendToBottom < linesBelow; extendToBottom++) {
                const origLine = move.original.endLineNumberExclusive + extendToBottom;
                const modLine = move.modified.endLineNumberExclusive + extendToBottom;
                if (origLine > originalLines.length || modLine > modifiedLines.length) {
                    break;
                }
                if (modifiedSet.contains(modLine) || originalSet.contains(origLine)) {
                    break;
                }
                if (!areLinesSimilar(originalLines[origLine - 1], modifiedLines[modLine - 1], timeout)) {
                    break;
                }
            }
            if (extendToBottom > 0) {
                originalSet.addRange(new lineRange_1.$ts(move.original.endLineNumberExclusive, move.original.endLineNumberExclusive + extendToBottom));
                modifiedSet.addRange(new lineRange_1.$ts(move.modified.endLineNumberExclusive, move.modified.endLineNumberExclusive + extendToBottom));
            }
            if (extendToTop > 0 || extendToBottom > 0) {
                moves[i] = new rangeMapping_1.$vs(new lineRange_1.$ts(move.original.startLineNumber - extendToTop, move.original.endLineNumberExclusive + extendToBottom), new lineRange_1.$ts(move.modified.startLineNumber - extendToTop, move.modified.endLineNumberExclusive + extendToBottom));
            }
        }
        return moves;
    }
    function areLinesSimilar(line1, line2, timeout) {
        if (line1.trim() === line2.trim()) {
            return true;
        }
        if (line1.length > 300 && line2.length > 300) {
            return false;
        }
        const myersDiffingAlgorithm = new myersDiffAlgorithm_1.$NY();
        const result = myersDiffingAlgorithm.compute(new linesSliceCharSequence_1.$OY([line1], new offsetRange_1.$rs(0, 1), false), new linesSliceCharSequence_1.$OY([line2], new offsetRange_1.$rs(0, 1), false), timeout);
        let commonNonSpaceCharCount = 0;
        const inverted = diffAlgorithm_1.$FY.invert(result.diffs, line1.length);
        for (const seq of inverted) {
            seq.seq1Range.forEach(idx => {
                if (!(0, utils_1.$KY)(line1.charCodeAt(idx))) {
                    commonNonSpaceCharCount++;
                }
            });
        }
        function countNonWsChars(str) {
            let count = 0;
            for (let i = 0; i < line1.length; i++) {
                if (!(0, utils_1.$KY)(str.charCodeAt(i))) {
                    count++;
                }
            }
            return count;
        }
        const longerLineLength = countNonWsChars(line1.length > line2.length ? line1 : line2);
        const r = commonNonSpaceCharCount / longerLineLength > 0.6 && longerLineLength > 10;
        return r;
    }
    function joinCloseConsecutiveMoves(moves) {
        if (moves.length === 0) {
            return moves;
        }
        moves.sort((0, arrays_1.$5b)(m => m.original.startLineNumber, arrays_1.$7b));
        const result = [moves[0]];
        for (let i = 1; i < moves.length; i++) {
            const last = result[result.length - 1];
            const current = moves[i];
            const originalDist = current.original.startLineNumber - last.original.endLineNumberExclusive;
            const modifiedDist = current.modified.startLineNumber - last.modified.endLineNumberExclusive;
            const currentMoveAfterLast = originalDist >= 0 && modifiedDist >= 0;
            if (currentMoveAfterLast && originalDist + modifiedDist <= 2) {
                result[result.length - 1] = last.join(current);
                continue;
            }
            result.push(current);
        }
        return result;
    }
    function removeMovesInSameDiff(changes, moves) {
        const changesMonotonous = new arraysFind_1.$kb(changes);
        moves = moves.filter(m => {
            const diffBeforeOriginalMove = changesMonotonous.findLastMonotonous(c => c.original.endLineNumberExclusive <= m.original.startLineNumber)
                || new rangeMapping_1.$vs(new lineRange_1.$ts(1, 1), new lineRange_1.$ts(1, 1));
            const modifiedDistToPrevDiff = m.modified.startLineNumber - diffBeforeOriginalMove.modified.endLineNumberExclusive;
            const originalDistToPrevDiff = m.original.startLineNumber - diffBeforeOriginalMove.original.endLineNumberExclusive;
            const differentDistances = modifiedDistToPrevDiff !== originalDistToPrevDiff;
            return differentDistances;
        });
        return moves;
    }
});
//# sourceMappingURL=computeMovedLines.js.map