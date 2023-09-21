/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm", "../rangeMapping", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/collections", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/utils", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm"], function (require, exports, diffAlgorithm_1, rangeMapping_1, arrays_1, arraysFind_1, collections_1, lineRange_1, offsetRange_1, linesSliceCharSequence_1, utils_1, myersDiffAlgorithm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeMovedLines = void 0;
    function computeMovedLines(changes, originalLines, modifiedLines, hashedOriginalLines, hashedModifiedLines, timeout) {
        let { moves, excludedChanges } = computeMovesFromSimpleDeletionsToSimpleInsertions(changes, originalLines, modifiedLines, timeout);
        if (!timeout.isValid()) {
            return [];
        }
        const filteredChanges = changes.filter(c => !excludedChanges.has(c));
        const unchangedMoves = computeUnchangedMoves(filteredChanges, hashedOriginalLines, hashedModifiedLines, originalLines, modifiedLines, timeout);
        (0, arrays_1.pushMany)(moves, unchangedMoves);
        moves = joinCloseConsecutiveMoves(moves);
        // Ignore too short moves
        moves = moves.filter(current => {
            const originalText = current.original.toOffsetRange().slice(originalLines).map(l => l.trim()).join('\n');
            return originalText.length >= 10;
        });
        moves = removeMovesInSameDiff(changes, moves);
        return moves;
    }
    exports.computeMovedLines = computeMovedLines;
    function computeMovesFromSimpleDeletionsToSimpleInsertions(changes, originalLines, modifiedLines, timeout) {
        const moves = [];
        const deletions = changes
            .filter(c => c.modified.isEmpty && c.original.length >= 3)
            .map(d => new utils_1.LineRangeFragment(d.original, originalLines, d));
        const insertions = new Set(changes
            .filter(c => c.original.isEmpty && c.modified.length >= 3)
            .map(d => new utils_1.LineRangeFragment(d.modified, modifiedLines, d)));
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
                moves.push(new rangeMapping_1.LineRangeMapping(deletion.range, best.range));
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
        const original3LineHashes = new collections_1.SetMap();
        for (const change of changes) {
            for (let i = change.original.startLineNumber; i < change.original.endLineNumberExclusive - 2; i++) {
                const key = `${hashedOriginalLines[i - 1]}:${hashedOriginalLines[i + 1 - 1]}:${hashedOriginalLines[i + 2 - 1]}`;
                original3LineHashes.add(key, { range: new lineRange_1.LineRange(i, i + 3) });
            }
        }
        const possibleMappings = [];
        changes.sort((0, arrays_1.compareBy)(c => c.modified.startLineNumber, arrays_1.numberComparator));
        for (const change of changes) {
            let lastMappings = [];
            for (let i = change.modified.startLineNumber; i < change.modified.endLineNumberExclusive - 2; i++) {
                const key = `${hashedModifiedLines[i - 1]}:${hashedModifiedLines[i + 1 - 1]}:${hashedModifiedLines[i + 2 - 1]}`;
                const currentModifiedRange = new lineRange_1.LineRange(i, i + 3);
                const nextMappings = [];
                original3LineHashes.forEach(key, ({ range }) => {
                    for (const lastMapping of lastMappings) {
                        // does this match extend some last match?
                        if (lastMapping.originalLineRange.endLineNumberExclusive + 1 === range.endLineNumberExclusive &&
                            lastMapping.modifiedLineRange.endLineNumberExclusive + 1 === currentModifiedRange.endLineNumberExclusive) {
                            lastMapping.originalLineRange = new lineRange_1.LineRange(lastMapping.originalLineRange.startLineNumber, range.endLineNumberExclusive);
                            lastMapping.modifiedLineRange = new lineRange_1.LineRange(lastMapping.modifiedLineRange.startLineNumber, currentModifiedRange.endLineNumberExclusive);
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
        possibleMappings.sort((0, arrays_1.reverseOrder)((0, arrays_1.compareBy)(m => m.modifiedLineRange.length, arrays_1.numberComparator)));
        const modifiedSet = new lineRange_1.LineRangeSet();
        const originalSet = new lineRange_1.LineRangeSet();
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
                moves.push(new rangeMapping_1.LineRangeMapping(originalLineRange, modifiedLineRange));
                modifiedSet.addRange(modifiedLineRange);
                originalSet.addRange(originalLineRange);
            }
        }
        moves.sort((0, arrays_1.compareBy)(m => m.original.startLineNumber, arrays_1.numberComparator));
        const monotonousChanges = new arraysFind_1.MonotonousArray(changes);
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const firstTouchingChangeOrig = monotonousChanges.findLastMonotonous(c => c.original.startLineNumber <= move.original.startLineNumber);
            const firstTouchingChangeMod = (0, arraysFind_1.findLastMonotonous)(changes, c => c.modified.startLineNumber <= move.modified.startLineNumber);
            const linesAbove = Math.max(move.original.startLineNumber - firstTouchingChangeOrig.original.startLineNumber, move.modified.startLineNumber - firstTouchingChangeMod.modified.startLineNumber);
            const lastTouchingChangeOrig = monotonousChanges.findLastMonotonous(c => c.original.startLineNumber < move.original.endLineNumberExclusive);
            const lastTouchingChangeMod = (0, arraysFind_1.findLastMonotonous)(changes, c => c.modified.startLineNumber < move.modified.endLineNumberExclusive);
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
                originalSet.addRange(new lineRange_1.LineRange(move.original.startLineNumber - extendToTop, move.original.startLineNumber));
                modifiedSet.addRange(new lineRange_1.LineRange(move.modified.startLineNumber - extendToTop, move.modified.startLineNumber));
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
                originalSet.addRange(new lineRange_1.LineRange(move.original.endLineNumberExclusive, move.original.endLineNumberExclusive + extendToBottom));
                modifiedSet.addRange(new lineRange_1.LineRange(move.modified.endLineNumberExclusive, move.modified.endLineNumberExclusive + extendToBottom));
            }
            if (extendToTop > 0 || extendToBottom > 0) {
                moves[i] = new rangeMapping_1.LineRangeMapping(new lineRange_1.LineRange(move.original.startLineNumber - extendToTop, move.original.endLineNumberExclusive + extendToBottom), new lineRange_1.LineRange(move.modified.startLineNumber - extendToTop, move.modified.endLineNumberExclusive + extendToBottom));
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
        const myersDiffingAlgorithm = new myersDiffAlgorithm_1.MyersDiffAlgorithm();
        const result = myersDiffingAlgorithm.compute(new linesSliceCharSequence_1.LinesSliceCharSequence([line1], new offsetRange_1.OffsetRange(0, 1), false), new linesSliceCharSequence_1.LinesSliceCharSequence([line2], new offsetRange_1.OffsetRange(0, 1), false), timeout);
        let commonNonSpaceCharCount = 0;
        const inverted = diffAlgorithm_1.SequenceDiff.invert(result.diffs, line1.length);
        for (const seq of inverted) {
            seq.seq1Range.forEach(idx => {
                if (!(0, utils_1.isSpace)(line1.charCodeAt(idx))) {
                    commonNonSpaceCharCount++;
                }
            });
        }
        function countNonWsChars(str) {
            let count = 0;
            for (let i = 0; i < line1.length; i++) {
                if (!(0, utils_1.isSpace)(str.charCodeAt(i))) {
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
        moves.sort((0, arrays_1.compareBy)(m => m.original.startLineNumber, arrays_1.numberComparator));
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
        const changesMonotonous = new arraysFind_1.MonotonousArray(changes);
        moves = moves.filter(m => {
            const diffBeforeOriginalMove = changesMonotonous.findLastMonotonous(c => c.original.endLineNumberExclusive <= m.original.startLineNumber)
                || new rangeMapping_1.LineRangeMapping(new lineRange_1.LineRange(1, 1), new lineRange_1.LineRange(1, 1));
            const modifiedDistToPrevDiff = m.modified.startLineNumber - diffBeforeOriginalMove.modified.endLineNumberExclusive;
            const originalDistToPrevDiff = m.original.startLineNumber - diffBeforeOriginalMove.original.endLineNumberExclusive;
            const differentDistances = modifiedDistToPrevDiff !== originalDistToPrevDiff;
            return differentDistances;
        });
        return moves;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZU1vdmVkTGluZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2RpZmYvZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyL2NvbXB1dGVNb3ZlZExpbmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxTQUFnQixpQkFBaUIsQ0FDaEMsT0FBbUMsRUFDbkMsYUFBdUIsRUFDdkIsYUFBdUIsRUFDdkIsbUJBQTZCLEVBQzdCLG1CQUE2QixFQUM3QixPQUFpQjtRQUVqQixJQUFJLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxHQUFHLGlEQUFpRCxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRW5JLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFBRSxPQUFPLEVBQUUsQ0FBQztTQUFFO1FBRXRDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsbUJBQW1CLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvSSxJQUFBLGlCQUFRLEVBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRWhDLEtBQUssR0FBRyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6Qyx5QkFBeUI7UUFDekIsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDOUIsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFB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