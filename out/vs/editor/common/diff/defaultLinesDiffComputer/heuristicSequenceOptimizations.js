/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm"], function (require, exports, arrays_1, offsetRange_1, diffAlgorithm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeVeryShortMatchingTextBetweenLongDiffs = exports.removeVeryShortMatchingLinesBetweenDiffs = exports.extendDiffsToEntireWordIfAppropriate = exports.removeShortMatches = exports.optimizeSequenceDiffs = void 0;
    function optimizeSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
        let result = sequenceDiffs;
        result = joinSequenceDiffsByShifting(sequence1, sequence2, result);
        result = shiftSequenceDiffs(sequence1, sequence2, result);
        return result;
    }
    exports.optimizeSequenceDiffs = optimizeSequenceDiffs;
    /**
     * This function fixes issues like this:
     * ```
     * import { Baz, Bar } from "foo";
     * ```
     * <->
     * ```
     * import { Baz, Bar, Foo } from "foo";
     * ```
     * Computed diff: [ {Add "," after Bar}, {Add "Foo " after space} }
     * Improved diff: [{Add ", Foo" after Bar}]
     */
    function joinSequenceDiffsByShifting(sequence1, sequence2, sequenceDiffs) {
        if (sequenceDiffs.length === 0) {
            return sequenceDiffs;
        }
        const result = [];
        result.push(sequenceDiffs[0]);
        // First move them all to the left as much as possible and join them if possible
        for (let i = 1; i < sequenceDiffs.length; i++) {
            const prevResult = result[result.length - 1];
            let cur = sequenceDiffs[i];
            if (cur.seq1Range.isEmpty || cur.seq2Range.isEmpty) {
                const length = cur.seq1Range.start - prevResult.seq1Range.endExclusive;
                let d;
                for (d = 1; d <= length; d++) {
                    if (sequence1.getElement(cur.seq1Range.start - d) !== sequence1.getElement(cur.seq1Range.endExclusive - d) ||
                        sequence2.getElement(cur.seq2Range.start - d) !== sequence2.getElement(cur.seq2Range.endExclusive - d)) {
                        break;
                    }
                }
                d--;
                if (d === length) {
                    // Merge previous and current diff
                    result[result.length - 1] = new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(prevResult.seq1Range.start, cur.seq1Range.endExclusive - length), new offsetRange_1.OffsetRange(prevResult.seq2Range.start, cur.seq2Range.endExclusive - length));
                    continue;
                }
                cur = cur.delta(-d);
            }
            result.push(cur);
        }
        const result2 = [];
        // Then move them all to the right and join them again if possible
        for (let i = 0; i < result.length - 1; i++) {
            const nextResult = result[i + 1];
            let cur = result[i];
            if (cur.seq1Range.isEmpty || cur.seq2Range.isEmpty) {
                const length = nextResult.seq1Range.start - cur.seq1Range.endExclusive;
                let d;
                for (d = 0; d < length; d++) {
                    if (sequence1.getElement(cur.seq1Range.start + d) !== sequence1.getElement(cur.seq1Range.endExclusive + d) ||
                        sequence2.getElement(cur.seq2Range.start + d) !== sequence2.getElement(cur.seq2Range.endExclusive + d)) {
                        break;
                    }
                }
                if (d === length) {
                    // Merge previous and current diff, write to result!
                    result[i + 1] = new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(cur.seq1Range.start + length, nextResult.seq1Range.endExclusive), new offsetRange_1.OffsetRange(cur.seq2Range.start + length, nextResult.seq2Range.endExclusive));
                    continue;
                }
                if (d > 0) {
                    cur = cur.delta(d);
                }
            }
            result2.push(cur);
        }
        if (result.length > 0) {
            result2.push(result[result.length - 1]);
        }
        return result2;
    }
    // align character level diffs at whitespace characters
    // import { IBar } from "foo";
    // import { I[Arr, I]Bar } from "foo";
    // ->
    // import { [IArr, ]IBar } from "foo";
    // import { ITransaction, observableValue, transaction } from 'vs/base/common/observable';
    // import { ITransaction, observable[FromEvent, observable]Value, transaction } from 'vs/base/common/observable';
    // ->
    // import { ITransaction, [observableFromEvent, ]observableValue, transaction } from 'vs/base/common/observable';
    // collectBrackets(level + 1, levelPerBracketType);
    // collectBrackets(level + 1, levelPerBracket[ + 1, levelPerBracket]Type);
    // ->
    // collectBrackets(level + 1, [levelPerBracket + 1, ]levelPerBracketType);
    function shiftSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
        if (!sequence1.getBoundaryScore || !sequence2.getBoundaryScore) {
            return sequenceDiffs;
        }
        for (let i = 0; i < sequenceDiffs.length; i++) {
            const prevDiff = (i > 0 ? sequenceDiffs[i - 1] : undefined);
            const diff = sequenceDiffs[i];
            const nextDiff = (i + 1 < sequenceDiffs.length ? sequenceDiffs[i + 1] : undefined);
            const seq1ValidRange = new offsetRange_1.OffsetRange(prevDiff ? prevDiff.seq1Range.start + 1 : 0, nextDiff ? nextDiff.seq1Range.endExclusive - 1 : sequence1.length);
            const seq2ValidRange = new offsetRange_1.OffsetRange(prevDiff ? prevDiff.seq2Range.start + 1 : 0, nextDiff ? nextDiff.seq2Range.endExclusive - 1 : sequence2.length);
            if (diff.seq1Range.isEmpty) {
                sequenceDiffs[i] = shiftDiffToBetterPosition(diff, sequence1, sequence2, seq1ValidRange, seq2ValidRange);
            }
            else if (diff.seq2Range.isEmpty) {
                sequenceDiffs[i] = shiftDiffToBetterPosition(diff.swap(), sequence2, sequence1, seq2ValidRange, seq1ValidRange).swap();
            }
        }
        return sequenceDiffs;
    }
    function shiftDiffToBetterPosition(diff, sequence1, sequence2, seq1ValidRange, seq2ValidRange) {
        const maxShiftLimit = 100; // To prevent performance issues
        // don't touch previous or next!
        let deltaBefore = 1;
        while (diff.seq1Range.start - deltaBefore >= seq1ValidRange.start &&
            diff.seq2Range.start - deltaBefore >= seq2ValidRange.start &&
            sequence2.isStronglyEqual(diff.seq2Range.start - deltaBefore, diff.seq2Range.endExclusive - deltaBefore) && deltaBefore < maxShiftLimit) {
            deltaBefore++;
        }
        deltaBefore--;
        let deltaAfter = 0;
        while (diff.seq1Range.start + deltaAfter < seq1ValidRange.endExclusive &&
            diff.seq2Range.endExclusive + deltaAfter < seq2ValidRange.endExclusive &&
            sequence2.isStronglyEqual(diff.seq2Range.start + deltaAfter, diff.seq2Range.endExclusive + deltaAfter) && deltaAfter < maxShiftLimit) {
            deltaAfter++;
        }
        if (deltaBefore === 0 && deltaAfter === 0) {
            return diff;
        }
        // Visualize `[sequence1.text, diff.seq1Range.start + deltaAfter]`
        // and `[sequence2.text, diff.seq2Range.start + deltaAfter, diff.seq2Range.endExclusive + deltaAfter]`
        let bestDelta = 0;
        let bestScore = -1;
        // find best scored delta
        for (let delta = -deltaBefore; delta <= deltaAfter; delta++) {
            const seq2OffsetStart = diff.seq2Range.start + delta;
            const seq2OffsetEndExclusive = diff.seq2Range.endExclusive + delta;
            const seq1Offset = diff.seq1Range.start + delta;
            const score = sequence1.getBoundaryScore(seq1Offset) + sequence2.getBoundaryScore(seq2OffsetStart) + sequence2.getBoundaryScore(seq2OffsetEndExclusive);
            if (score > bestScore) {
                bestScore = score;
                bestDelta = delta;
            }
        }
        return diff.delta(bestDelta);
    }
    function removeShortMatches(sequence1, sequence2, sequenceDiffs) {
        const result = [];
        for (const s of sequenceDiffs) {
            const last = result[result.length - 1];
            if (!last) {
                result.push(s);
                continue;
            }
            if (s.seq1Range.start - last.seq1Range.endExclusive <= 2 || s.seq2Range.start - last.seq2Range.endExclusive <= 2) {
                result[result.length - 1] = new diffAlgorithm_1.SequenceDiff(last.seq1Range.join(s.seq1Range), last.seq2Range.join(s.seq2Range));
            }
            else {
                result.push(s);
            }
        }
        return result;
    }
    exports.removeShortMatches = removeShortMatches;
    function extendDiffsToEntireWordIfAppropriate(sequence1, sequence2, sequenceDiffs) {
        const additional = [];
        let lastModifiedWord = undefined;
        function maybePushWordToAdditional() {
            if (!lastModifiedWord) {
                return;
            }
            const originalLength1 = lastModifiedWord.s1Range.length - lastModifiedWord.deleted;
            const originalLength2 = lastModifiedWord.s2Range.length - lastModifiedWord.added;
            if (originalLength1 !== originalLength2) {
                // TODO figure out why this happens
            }
            if (Math.max(lastModifiedWord.deleted, lastModifiedWord.added) + (lastModifiedWord.count - 1) > originalLength1) {
                additional.push(new diffAlgorithm_1.SequenceDiff(lastModifiedWord.s1Range, lastModifiedWord.s2Range));
            }
            lastModifiedWord = undefined;
        }
        for (const s of sequenceDiffs) {
            function processWord(s1Range, s2Range) {
                if (!lastModifiedWord || !lastModifiedWord.s1Range.containsRange(s1Range) || !lastModifiedWord.s2Range.containsRange(s2Range)) {
                    if (lastModifiedWord && !(lastModifiedWord.s1Range.endExclusive < s1Range.start && lastModifiedWord.s2Range.endExclusive < s2Range.start)) {
                        const s1Added = offsetRange_1.OffsetRange.tryCreate(lastModifiedWord.s1Range.endExclusive, s1Range.start);
                        const s2Added = offsetRange_1.OffsetRange.tryCreate(lastModifiedWord.s2Range.endExclusive, s2Range.start);
                        lastModifiedWord.deleted += s1Added?.length ?? 0;
                        lastModifiedWord.added += s2Added?.length ?? 0;
                        lastModifiedWord.s1Range = lastModifiedWord.s1Range.join(s1Range);
                        lastModifiedWord.s2Range = lastModifiedWord.s2Range.join(s2Range);
                    }
                    else {
                        maybePushWordToAdditional();
                        lastModifiedWord = { added: 0, deleted: 0, count: 0, s1Range: s1Range, s2Range: s2Range };
                    }
                }
                const changedS1 = s1Range.intersect(s.seq1Range);
                const changedS2 = s2Range.intersect(s.seq2Range);
                lastModifiedWord.count++;
                lastModifiedWord.deleted += changedS1?.length ?? 0;
                lastModifiedWord.added += changedS2?.length ?? 0;
            }
            const w1Before = sequence1.findWordContaining(s.seq1Range.start - 1);
            const w2Before = sequence2.findWordContaining(s.seq2Range.start - 1);
            const w1After = sequence1.findWordContaining(s.seq1Range.endExclusive);
            const w2After = sequence2.findWordContaining(s.seq2Range.endExclusive);
            if (w1Before && w1After && w2Before && w2After && w1Before.equals(w1After) && w2Before.equals(w2After)) {
                processWord(w1Before, w2Before);
            }
            else {
                if (w1Before && w2Before) {
                    processWord(w1Before, w2Before);
                }
                if (w1After && w2After) {
                    processWord(w1After, w2After);
                }
            }
        }
        maybePushWordToAdditional();
        const merged = mergeSequenceDiffs(sequenceDiffs, additional);
        return merged;
    }
    exports.extendDiffsToEntireWordIfAppropriate = extendDiffsToEntireWordIfAppropriate;
    function mergeSequenceDiffs(sequenceDiffs1, sequenceDiffs2) {
        const result = [];
        while (sequenceDiffs1.length > 0 || sequenceDiffs2.length > 0) {
            const sd1 = sequenceDiffs1[0];
            const sd2 = sequenceDiffs2[0];
            let next;
            if (sd1 && (!sd2 || sd1.seq1Range.start < sd2.seq1Range.start)) {
                next = sequenceDiffs1.shift();
            }
            else {
                next = sequenceDiffs2.shift();
            }
            if (result.length > 0 && result[result.length - 1].seq1Range.endExclusive >= next.seq1Range.start) {
                result[result.length - 1] = result[result.length - 1].join(next);
            }
            else {
                result.push(next);
            }
        }
        return result;
    }
    function removeVeryShortMatchingLinesBetweenDiffs(sequence1, _sequence2, sequenceDiffs) {
        let diffs = sequenceDiffs;
        if (diffs.length === 0) {
            return diffs;
        }
        let counter = 0;
        let shouldRepeat;
        do {
            shouldRepeat = false;
            const result = [
                diffs[0]
            ];
            for (let i = 1; i < diffs.length; i++) {
                const cur = diffs[i];
                const lastResult = result[result.length - 1];
                function shouldJoinDiffs(before, after) {
                    const unchangedRange = new offsetRange_1.OffsetRange(lastResult.seq1Range.endExclusive, cur.seq1Range.start);
                    const unchangedText = sequence1.getText(unchangedRange);
                    const unchangedTextWithoutWs = unchangedText.replace(/\s/g, '');
                    if (unchangedTextWithoutWs.length <= 4
                        && (before.seq1Range.length + before.seq2Range.length > 5 || after.seq1Range.length + after.seq2Range.length > 5)) {
                        return true;
                    }
                    return false;
                }
                const shouldJoin = shouldJoinDiffs(lastResult, cur);
                if (shouldJoin) {
                    shouldRepeat = true;
                    result[result.length - 1] = result[result.length - 1].join(cur);
                }
                else {
                    result.push(cur);
                }
            }
            diffs = result;
        } while (counter++ < 10 && shouldRepeat);
        return diffs;
    }
    exports.removeVeryShortMatchingLinesBetweenDiffs = removeVeryShortMatchingLinesBetweenDiffs;
    function removeVeryShortMatchingTextBetweenLongDiffs(sequence1, sequence2, sequenceDiffs) {
        let diffs = sequenceDiffs;
        if (diffs.length === 0) {
            return diffs;
        }
        let counter = 0;
        let shouldRepeat;
        do {
            shouldRepeat = false;
            const result = [
                diffs[0]
            ];
            for (let i = 1; i < diffs.length; i++) {
                const cur = diffs[i];
                const lastResult = result[result.length - 1];
                function shouldJoinDiffs(before, after) {
                    const unchangedRange = new offsetRange_1.OffsetRange(lastResult.seq1Range.endExclusive, cur.seq1Range.start);
                    const unchangedLineCount = sequence1.countLinesIn(unchangedRange);
                    if (unchangedLineCount > 5 || unchangedRange.length > 500) {
                        return false;
                    }
                    const unchangedText = sequence1.getText(unchangedRange).trim();
                    if (unchangedText.length > 20 || unchangedText.split(/\r\n|\r|\n/).length > 1) {
                        return false;
                    }
                    const beforeLineCount1 = sequence1.countLinesIn(before.seq1Range);
                    const beforeSeq1Length = before.seq1Range.length;
                    const beforeLineCount2 = sequence2.countLinesIn(before.seq2Range);
                    const beforeSeq2Length = before.seq2Range.length;
                    const afterLineCount1 = sequence1.countLinesIn(after.seq1Range);
                    const afterSeq1Length = after.seq1Range.length;
                    const afterLineCount2 = sequence2.countLinesIn(after.seq2Range);
                    const afterSeq2Length = after.seq2Range.length;
                    // TODO: Maybe a neural net can be used to derive the result from these numbers
                    const max = 2 * 40 + 50;
                    function cap(v) {
                        return Math.min(v, max);
                    }
                    if (Math.pow(Math.pow(cap(beforeLineCount1 * 40 + beforeSeq1Length), 1.5) + Math.pow(cap(beforeLineCount2 * 40 + beforeSeq2Length), 1.5), 1.5)
                        + Math.pow(Math.pow(cap(afterLineCount1 * 40 + afterSeq1Length), 1.5) + Math.pow(cap(afterLineCount2 * 40 + afterSeq2Length), 1.5), 1.5) > ((max ** 1.5) ** 1.5) * 1.3) {
                        return true;
                    }
                    return false;
                }
                const shouldJoin = shouldJoinDiffs(lastResult, cur);
                if (shouldJoin) {
                    shouldRepeat = true;
                    result[result.length - 1] = result[result.length - 1].join(cur);
                }
                else {
                    result.push(cur);
                }
            }
            diffs = result;
        } while (counter++ < 10 && shouldRepeat);
        const newDiffs = [];
        // Remove short suffixes/prefixes
        (0, arrays_1.forEachWithNeighbors)(diffs, (prev, cur, next) => {
            let newDiff = cur;
            function shouldMarkAsChanged(text) {
                return text.length > 0 && text.trim().length <= 3 && cur.seq1Range.length + cur.seq2Range.length > 100;
            }
            const fullRange1 = sequence1.extendToFullLines(cur.seq1Range);
            const prefix = sequence1.getText(new offsetRange_1.OffsetRange(fullRange1.start, cur.seq1Range.start));
            if (shouldMarkAsChanged(prefix)) {
                newDiff = newDiff.deltaStart(-prefix.length);
            }
            const suffix = sequence1.getText(new offsetRange_1.OffsetRange(cur.seq1Range.endExclusive, fullRange1.endExclusive));
            if (shouldMarkAsChanged(suffix)) {
                newDiff = newDiff.deltaEnd(suffix.length);
            }
            const availableSpace = diffAlgorithm_1.SequenceDiff.fromOffsetPairs(prev ? prev.getEndExclusives() : diffAlgorithm_1.OffsetPair.zero, next ? next.getStarts() : diffAlgorithm_1.OffsetPair.max);
            const result = newDiff.intersect(availableSpace);
            newDiffs.push(result);
        });
        return newDiffs;
    }
    exports.removeVeryShortMatchingTextBetweenLongDiffs = removeVeryShortMatchingTextBetweenLongDiffs;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV1cmlzdGljU2VxdWVuY2VPcHRpbWl6YXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9kaWZmL2RlZmF1bHRMaW5lc0RpZmZDb21wdXRlci9oZXVyaXN0aWNTZXF1ZW5jZU9wdGltaXphdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLFNBQWdCLHFCQUFxQixDQUFDLFNBQW9CLEVBQUUsU0FBb0IsRUFBRSxhQUE2QjtRQUM5RyxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUM7UUFDM0IsTUFBTSxHQUFHLDJCQUEyQixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkUsTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBTEQsc0RBS0M7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILFNBQVMsMkJBQTJCLENBQUMsU0FBb0IsRUFBRSxTQUFvQixFQUFFLGFBQTZCO1FBQzdHLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0IsT0FBTyxhQUFhLENBQUM7U0FDckI7UUFFRCxNQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUIsZ0ZBQWdGO1FBQ2hGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksR0FBRyxHQUFHLGFBQWEs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