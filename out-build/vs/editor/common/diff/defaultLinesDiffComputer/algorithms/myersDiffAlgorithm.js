/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm"], function (require, exports, offsetRange_1, diffAlgorithm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NY = void 0;
    /**
     * An O(ND) diff algorithm that has a quadratic space worst-case complexity.
    */
    class $NY {
        compute(seq1, seq2, timeout = diffAlgorithm_1.$HY.instance) {
            // These are common special cases.
            // The early return improves performance dramatically.
            if (seq1.length === 0 || seq2.length === 0) {
                return diffAlgorithm_1.$EY.trivial(seq1, seq2);
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
                    return diffAlgorithm_1.$EY.trivialTimedOut(seqX, seqY);
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
                    result.push(new diffAlgorithm_1.$FY(new offsetRange_1.$rs(endX, lastAligningPosS1), new offsetRange_1.$rs(endY, lastAligningPosS2)));
                }
                if (!path) {
                    break;
                }
                lastAligningPosS1 = path.x;
                lastAligningPosS2 = path.y;
                path = path.prev;
            }
            result.reverse();
            return new diffAlgorithm_1.$EY(result, false);
        }
    }
    exports.$NY = $NY;
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
            this.a = new Int32Array(10);
            this.b = new Int32Array(10);
        }
        get(idx) {
            if (idx < 0) {
                idx = -idx - 1;
                return this.b[idx];
            }
            else {
                return this.a[idx];
            }
        }
        set(idx, value) {
            if (idx < 0) {
                idx = -idx - 1;
                if (idx >= this.b.length) {
                    const arr = this.b;
                    this.b = new Int32Array(arr.length * 2);
                    this.b.set(arr);
                }
                this.b[idx] = value;
            }
            else {
                if (idx >= this.a.length) {
                    const arr = this.a;
                    this.a = new Int32Array(arr.length * 2);
                    this.a.set(arr);
                }
                this.a[idx] = value;
            }
        }
    }
    /**
     * An array that supports fast negative indices.
    */
    class FastArrayNegativeIndices {
        constructor() {
            this.a = [];
            this.b = [];
        }
        get(idx) {
            if (idx < 0) {
                idx = -idx - 1;
                return this.b[idx];
            }
            else {
                return this.a[idx];
            }
        }
        set(idx, value) {
            if (idx < 0) {
                idx = -idx - 1;
                this.b[idx] = value;
            }
            else {
                this.a[idx] = value;
            }
        }
    }
});
//# sourceMappingURL=myersDiffAlgorithm.js.map