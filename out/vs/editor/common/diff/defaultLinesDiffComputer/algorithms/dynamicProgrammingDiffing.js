/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/utils"], function (require, exports, offsetRange_1, diffAlgorithm_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicProgrammingDiffing = void 0;
    /**
     * A O(MN) diffing algorithm that supports a score function.
     * The algorithm can be improved by processing the 2d array diagonally.
    */
    class DynamicProgrammingDiffing {
        compute(sequence1, sequence2, timeout = diffAlgorithm_1.InfiniteTimeout.instance, equalityScore) {
            if (sequence1.length === 0 || sequence2.length === 0) {
                return diffAlgorithm_1.DiffAlgorithmResult.trivial(sequence1, sequence2);
            }
            /**
             * lcsLengths.get(i, j): Length of the longest common subsequence of sequence1.substring(0, i + 1) and sequence2.substring(0, j + 1).
             */
            const lcsLengths = new utils_1.Array2D(sequence1.length, sequence2.length);
            const directions = new utils_1.Array2D(sequence1.length, sequence2.length);
            const lengths = new utils_1.Array2D(sequence1.length, sequence2.length);
            // ==== Initializing lcsLengths ====
            for (let s1 = 0; s1 < sequence1.length; s1++) {
                for (let s2 = 0; s2 < sequence2.length; s2++) {
                    if (!timeout.isValid()) {
                        return diffAlgorithm_1.DiffAlgorithmResult.trivialTimedOut(sequence1, sequence2);
                    }
                    const horizontalLen = s1 === 0 ? 0 : lcsLengths.get(s1 - 1, s2);
                    const verticalLen = s2 === 0 ? 0 : lcsLengths.get(s1, s2 - 1);
                    let extendedSeqScore;
                    if (sequence1.getElement(s1) === sequence2.getElement(s2)) {
                        if (s1 === 0 || s2 === 0) {
                            extendedSeqScore = 0;
                        }
                        else {
                            extendedSeqScore = lcsLengths.get(s1 - 1, s2 - 1);
                        }
                        if (s1 > 0 && s2 > 0 && directions.get(s1 - 1, s2 - 1) === 3) {
                            // Prefer consecutive diagonals
                            extendedSeqScore += lengths.get(s1 - 1, s2 - 1);
                        }
                        extendedSeqScore += (equalityScore ? equalityScore(s1, s2) : 1);
                    }
                    else {
                        extendedSeqScore = -1;
                    }
                    const newValue = Math.max(horizontalLen, verticalLen, extendedSeqScore);
                    if (newValue === extendedSeqScore) {
                        // Prefer diagonals
                        const prevLen = s1 > 0 && s2 > 0 ? lengths.get(s1 - 1, s2 - 1) : 0;
                        lengths.set(s1, s2, prevLen + 1);
                        directions.set(s1, s2, 3);
                    }
                    else if (newValue === horizontalLen) {
                        lengths.set(s1, s2, 0);
                        directions.set(s1, s2, 1);
                    }
                    else if (newValue === verticalLen) {
                        lengths.set(s1, s2, 0);
                        directions.set(s1, s2, 2);
                    }
                    lcsLengths.set(s1, s2, newValue);
                }
            }
            // ==== Backtracking ====
            const result = [];
            let lastAligningPosS1 = sequence1.length;
            let lastAligningPosS2 = sequence2.length;
            function reportDecreasingAligningPositions(s1, s2) {
                if (s1 + 1 !== lastAligningPosS1 || s2 + 1 !== lastAligningPosS2) {
                    result.push(new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(s1 + 1, lastAligningPosS1), new offsetRange_1.OffsetRange(s2 + 1, lastAligningPosS2)));
                }
                lastAligningPosS1 = s1;
                lastAligningPosS2 = s2;
            }
            let s1 = sequence1.length - 1;
            let s2 = sequence2.length - 1;
            while (s1 >= 0 && s2 >= 0) {
                if (directions.get(s1, s2) === 3) {
                    reportDecreasingAligningPositions(s1, s2);
                    s1--;
                    s2--;
                }
                else {
                    if (directions.get(s1, s2) === 1) {
                        s1--;
                    }
                    else {
                        s2--;
                    }
                }
            }
            reportDecreasingAligningPositions(-1, -1);
            result.reverse();
            return new diffAlgorithm_1.DiffAlgorithmResult(result, false);
        }
    }
    exports.DynamicProgrammingDiffing = DynamicProgrammingDiffing;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY1Byb2dyYW1taW5nRGlmZmluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vZGlmZi9kZWZhdWx0TGluZXNEaWZmQ29tcHV0ZXIvYWxnb3JpdGhtcy9keW5hbWljUHJvZ3JhbW1pbmdEaWZmaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRzs7O01BR0U7SUFDRixNQUFhLHlCQUF5QjtRQUNyQyxPQUFPLENBQUMsU0FBb0IsRUFBRSxTQUFvQixFQUFFLFVBQW9CLCtCQUFlLENBQUMsUUFBUSxFQUFFLGFBQTREO1lBQzdKLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3JELE9BQU8sbUNBQW1CLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUN6RDtZQUVEOztlQUVHO1lBQ0gsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFPLENBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFPLENBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0UsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFPLENBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFeEUsb0NBQW9DO1lBQ3BDLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFO2dCQUM3QyxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUs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