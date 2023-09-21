/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/editor/common/core/offsetRange"], function (require, exports, arrays_1, errors_1, offsetRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IY = exports.$HY = exports.$GY = exports.$FY = exports.$EY = void 0;
    class $EY {
        static trivial(seq1, seq2) {
            return new $EY([new $FY(offsetRange_1.$rs.ofLength(seq1.length), offsetRange_1.$rs.ofLength(seq2.length))], false);
        }
        static trivialTimedOut(seq1, seq2) {
            return new $EY([new $FY(offsetRange_1.$rs.ofLength(seq1.length), offsetRange_1.$rs.ofLength(seq2.length))], true);
        }
        constructor(diffs, 
        /**
         * Indicates if the time out was reached.
         * In that case, the diffs might be an approximation and the user should be asked to rerun the diff with more time.
         */
        hitTimeout) {
            this.diffs = diffs;
            this.hitTimeout = hitTimeout;
        }
    }
    exports.$EY = $EY;
    class $FY {
        static invert(sequenceDiffs, doc1Length) {
            const result = [];
            (0, arrays_1.$zb)(sequenceDiffs, (a, b) => {
                result.push($FY.fromOffsetPairs(a ? a.getEndExclusives() : $GY.zero, b ? b.getStarts() : new $GY(doc1Length, (a ? a.seq2Range.endExclusive - a.seq1Range.endExclusive : 0) + doc1Length)));
            });
            return result;
        }
        static fromOffsetPairs(start, endExclusive) {
            return new $FY(new offsetRange_1.$rs(start.offset1, endExclusive.offset1), new offsetRange_1.$rs(start.offset2, endExclusive.offset2));
        }
        constructor(seq1Range, seq2Range) {
            this.seq1Range = seq1Range;
            this.seq2Range = seq2Range;
        }
        swap() {
            return new $FY(this.seq2Range, this.seq1Range);
        }
        toString() {
            return `${this.seq1Range} <-> ${this.seq2Range}`;
        }
        join(other) {
            return new $FY(this.seq1Range.join(other.seq1Range), this.seq2Range.join(other.seq2Range));
        }
        delta(offset) {
            if (offset === 0) {
                return this;
            }
            return new $FY(this.seq1Range.delta(offset), this.seq2Range.delta(offset));
        }
        deltaStart(offset) {
            if (offset === 0) {
                return this;
            }
            return new $FY(this.seq1Range.deltaStart(offset), this.seq2Range.deltaStart(offset));
        }
        deltaEnd(offset) {
            if (offset === 0) {
                return this;
            }
            return new $FY(this.seq1Range.deltaEnd(offset), this.seq2Range.deltaEnd(offset));
        }
        intersectsOrTouches(other) {
            return this.seq1Range.intersectsOrTouches(other.seq1Range) || this.seq2Range.intersectsOrTouches(other.seq2Range);
        }
        intersect(other) {
            const i1 = this.seq1Range.intersect(other.seq1Range);
            const i2 = this.seq2Range.intersect(other.seq2Range);
            if (!i1 || !i2) {
                return undefined;
            }
            return new $FY(i1, i2);
        }
        getStarts() {
            return new $GY(this.seq1Range.start, this.seq2Range.start);
        }
        getEndExclusives() {
            return new $GY(this.seq1Range.endExclusive, this.seq2Range.endExclusive);
        }
    }
    exports.$FY = $FY;
    class $GY {
        static { this.zero = new $GY(0, 0); }
        static { this.max = new $GY(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER); }
        constructor(offset1, offset2) {
            this.offset1 = offset1;
            this.offset2 = offset2;
        }
        toString() {
            return `${this.offset1} <-> ${this.offset2}`;
        }
    }
    exports.$GY = $GY;
    class $HY {
        static { this.instance = new $HY(); }
        isValid() {
            return true;
        }
    }
    exports.$HY = $HY;
    class $IY {
        constructor(e) {
            this.e = e;
            this.c = Date.now();
            this.d = true;
            if (e <= 0) {
                throw new errors_1.$ab('timeout must be positive');
            }
        }
        // Recommendation: Set a log-point `{this.disable()}` in the body
        isValid() {
            const valid = Date.now() - this.c < this.e;
            if (!valid && this.d) {
                this.d = false; // timeout reached
                // eslint-disable-next-line no-debugger
                debugger; // WARNING: Most likely debugging caused the timeout. Call `this.disable()` to continue without timing out.
            }
            return this.d;
        }
        disable() {
            this.e = Number.MAX_SAFE_INTEGER;
            this.isValid = () => true;
            this.d = true;
        }
    }
    exports.$IY = $IY;
});
//# sourceMappingURL=diffAlgorithm.js.map