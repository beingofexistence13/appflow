/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm"], function (require, exports, offsetRange_1, diffAlgorithm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MyersDiffAlgorithm = void 0;
    /**
     * An O(ND) diff algorithm that has a quadratic space worst-case complexity.
    */
    class MyersDiffAlgorithm {
        compute(seq1, seq2, timeout = diffAlgorithm_1.InfiniteTimeout.instance) {
            // These are common special cases.
            // The early return improves performance dramatically.
            if (seq1.length === 0 || seq2.length === 0) {
                return diffAlgorithm_1.DiffAlgorithmResult.trivial(seq1, seq2);
            }
            const seqX = seq1; // Text on the x axis
            const seqY = seq2; // Text on the y axis
            function getXAfterSnake(x, y) {
                while (x < seqX.length && y < seqY.length && seqX.getElement(x) === seqY.getElement(y)) {
                    x++;
                    y++;
                }
                return x;
            }
            let d = 0;
            // V[k]: X value of longest d-line that ends in diagonal k.
            // d-line: path from (0,0) to (x,y) that uses exactly d non-diagonals.
            // diagonal k: Set of points (x,y) with x-y = k.
            // k=1 -> (1,0),(2,1)
            const V = new FastInt32Array();
            V.set(0, getXAfterSnake(0, 0));
            const paths = new FastArrayNegativeIndices();
            paths.set(0, V.get(0) === 0 ? null : new SnakePath(null, 0, 0, V.get(0)));
            let k = 0;
            loop: while (true) {
                d++;
                if (!timeout.isValid()) {
                    return diffAlgorithm_1.DiffAlgorithmResult.trivialTimedOut(seqX, seqY);
                }
                // The paper has `for (k = -d; k <= d; k += 2)`, but we can ignore diagonals that cannot influence the result.
                const lowerBound = -Math.min(d, seqY.length + (d % 2));
                const upperBound = Math.min(d, seqX.length + (d % 2));
                for (k = lowerBound; k <= upperBound; k += 2) {
                    let step = 0;
                    // We can use the X values of (d-1)-lines to compute X value of the longest d-lines.
                    const maxXofDLineTop = k === upperBound ? -1 : V.get(k + 1); // We take a vertical non-diagonal (add a symbol in seqX)
                    const maxXofDLineLeft = k === lowerBound ? -1 : V.get(k - 1) + 1; // We take a horizontal non-diagonal (+1 x) (delete a symbol in seqX)
                    step++;
                    const x = Math.min(Math.max(maxXofDLineTop, maxXofDLineLeft), seqX.length);
                    const y = x - k;
                    step++;
                    if (x > seqX.length || y > seqY.length) {
                        // This diagonal is irrelevant for the result.
                        // TODO: Don't pay the cost for this in the next iteration.
                        continue;
                    }
                    const newMaxX = getXAfterSnake(x, y);
                    V.set(k, newMaxX);
                    const lastPath = x === maxXofDLineTop ? paths.get(k + 1) : paths.get(k - 1);
                    paths.set(k, newMaxX !== x ? new SnakePath(lastPath, x, y, newMaxX - x) : lastPath);
                    if (V.get(k) === seqX.length && V.get(k) - k === seqY.length) {
                        break loop;
                    }
                }
            }
            let path = paths.get(k);
            const result = [];
            let lastAligningPosS1 = seqX.length;
            let lastAligningPosS2 = seqY.length;
            while (true) {
                const endX = path ? path.x + path.length : 0;
                const endY = path ? path.y + path.length : 0;
                if (endX !== lastAligningPosS1 || endY !== lastAligningPosS2) {
                    result.push(new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(endX, lastAligningPosS1), new offsetRange_1.OffsetRange(endY, lastAligningPosS2)));
                }
                if (!path) {
                    break;
                }
                lastAligningPosS1 = path.x;
                lastAligningPosS2 = path.y;
                path = path.prev;
            }
            result.reverse();
            return new diffAlgorithm_1.DiffAlgorithmResult(result, false);
        }
    }
    exports.MyersDiffAlgorithm = MyersDiffAlgorithm;
    class SnakePath {
        constructor(prev, x, y, length) {
            this.prev = prev;
            this.x = x;
            this.y = y;
            this.length = length;
        }
    }
    /**
     * An array that supports fast negative indices.
    */
    class FastInt32Array {
        constructor() {
            this.positiveArr = new Int32Array(10);
            this.negativeArr = new Int32Array(10);
        }
        get(idx) {
            if (idx < 0) {
                idx = -idx - 1;
                return this.negativeArr[idx];
            }
            else {
                return this.positiveArr[idx];
            }
        }
        set(idx, value) {
            if (idx < 0) {
                idx = -idx - 1;
                if (idx >= this.negativeArr.length) {
                    const arr = this.negativeArr;
                    this.negativeArr = new Int32Array(arr.length * 2);
                    this.negativeArr.set(arr);
                }
                this.negativeArr[idx] = value;
            }
            else {
                if (idx >= this.positiveArr.length) {
                    const arr = this.positiveArr;
                    this.positiveArr = new Int32Array(arr.length * 2);
                    this.positiveArr.set(arr);
                }
                this.positiveArr[idx] = value;
            }
        }
    }
    /**
     * An array that supports fast negative indices.
    */
    class FastArrayNegativeIndices {
        constructor() {
            this.positiveArr = [];
            this.negativeArr = [];
        }
        get(idx) {
            if (idx < 0) {
                idx = -idx - 1;
                return this.negativeArr[idx];
            }
            else {
                return this.positiveArr[idx];
            }
        }
        set(idx, value) {
            if (idx < 0) {
                idx = -idx - 1;
                this.negativeArr[idx] = value;
            }
            else {
                this.positiveArr[idx] = value;
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXllcnNEaWZmQWxnb3JpdGhtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9kaWZmL2RlZmF1bHRMaW5lc0RpZmZDb21wdXRlci9hbGdvcml0aG1zL215ZXJzRGlmZkFsZ29yaXRobS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEc7O01BRUU7SUFDRixNQUFhLGtCQUFrQjtRQUM5QixPQUFPLENBQUMsSUFBZSxFQUFFLElBQWUsRUFBRSxVQUFvQiwrQkFBZSxDQUFDLFFBQVE7WUFDckYsa0NBQWtDO1lBQ2xDLHNEQUFzRDtZQUN0RCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzQyxPQUFPLG1DQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDL0M7WUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxxQkFBcUI7WUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMscUJBQXFCO1lBRXhDLFNBQVMsY0FBYyxDQUFDLENBQVMsRUFBRSxDQUFTO2dCQUMzQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDdkYsQ0FBQyxFQUFFLENBQUM7b0JBQ0osQ0FBQyxFQUFFLENBQUM7aUJBQ0o7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsMkRBQTJEO1lBQzNELHNFQUFzRTtZQUN0RSxnREFBZ0Q7WUFDaEQscUJBQXFCO1lB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