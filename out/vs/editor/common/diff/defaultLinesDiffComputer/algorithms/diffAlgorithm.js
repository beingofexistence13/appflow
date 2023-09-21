/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/editor/common/core/offsetRange"], function (require, exports, arrays_1, errors_1, offsetRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DateTimeout = exports.InfiniteTimeout = exports.OffsetPair = exports.SequenceDiff = exports.DiffAlgorithmResult = void 0;
    class DiffAlgorithmResult {
        static trivial(seq1, seq2) {
            return new DiffAlgorithmResult([new SequenceDiff(offsetRange_1.OffsetRange.ofLength(seq1.length), offsetRange_1.OffsetRange.ofLength(seq2.length))], false);
        }
        static trivialTimedOut(seq1, seq2) {
            return new DiffAlgorithmResult([new SequenceDiff(offsetRange_1.OffsetRange.ofLength(seq1.length), offsetRange_1.OffsetRange.ofLength(seq2.length))], true);
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
    exports.DiffAlgorithmResult = DiffAlgorithmResult;
    class SequenceDiff {
        static invert(sequenceDiffs, doc1Length) {
            const result = [];
            (0, arrays_1.forEachAdjacent)(sequenceDiffs, (a, b) => {
                result.push(SequenceDiff.fromOffsetPairs(a ? a.getEndExclusives() : OffsetPair.zero, b ? b.getStarts() : new OffsetPair(doc1Length, (a ? a.seq2Range.endExclusive - a.seq1Range.endExclusive : 0) + doc1Length)));
            });
            return result;
        }
        static fromOffsetPairs(start, endExclusive) {
            return new SequenceDiff(new offsetRange_1.OffsetRange(start.offset1, endExclusive.offset1), new offsetRange_1.OffsetRange(start.offset2, endExclusive.offset2));
        }
        constructor(seq1Range, seq2Range) {
            this.seq1Range = seq1Range;
            this.seq2Range = seq2Range;
        }
        swap() {
            return new SequenceDiff(this.seq2Range, this.seq1Range);
        }
        toString() {
            return `${this.seq1Range} <-> ${this.seq2Range}`;
        }
        join(other) {
            return new SequenceDiff(this.seq1Range.join(other.seq1Range), this.seq2Range.join(other.seq2Range));
        }
        delta(offset) {
            if (offset === 0) {
                return this;
            }
            return new SequenceDiff(this.seq1Range.delta(offset), this.seq2Range.delta(offset));
        }
        deltaStart(offset) {
            if (offset === 0) {
                return this;
            }
            return new SequenceDiff(this.seq1Range.deltaStart(offset), this.seq2Range.deltaStart(offset));
        }
        deltaEnd(offset) {
            if (offset === 0) {
                return this;
            }
            return new SequenceDiff(this.seq1Range.deltaEnd(offset), this.seq2Range.deltaEnd(offset));
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
            return new SequenceDiff(i1, i2);
        }
        getStarts() {
            return new OffsetPair(this.seq1Range.start, this.seq2Range.start);
        }
        getEndExclusives() {
            return new OffsetPair(this.seq1Range.endExclusive, this.seq2Range.endExclusive);
        }
    }
    exports.SequenceDiff = SequenceDiff;
    class OffsetPair {
        static { this.zero = new OffsetPair(0, 0); }
        static { this.max = new OffsetPair(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER); }
        constructor(offset1, offset2) {
            this.offset1 = offset1;
            this.offset2 = offset2;
        }
        toString() {
            return `${this.offset1} <-> ${this.offset2}`;
        }
    }
    exports.OffsetPair = OffsetPair;
    class InfiniteTimeout {
        static { this.instance = new InfiniteTimeout(); }
        isValid() {
            return true;
        }
    }
    exports.InfiniteTimeout = InfiniteTimeout;
    class DateTimeout {
        constructor(timeout) {
            this.timeout = timeout;
            this.startTime = Date.now();
            this.valid = true;
            if (timeout <= 0) {
                throw new errors_1.BugIndicatingError('timeout must be positive');
            }
        }
        // Recommendation: Set a log-point `{this.disable()}` in the body
        isValid() {
            const valid = Date.now() - this.startTime < this.timeout;
            if (!valid && this.valid) {
                this.valid = false; // timeout reached
                // eslint-disable-next-line no-debugger
                debugger; // WARNING: Most likely debugging caused the timeout. Call `this.disable()` to continue without timing out.
            }
            return this.valid;
        }
        disable() {
            this.timeout = Number.MAX_SAFE_INTEGER;
            this.isValid = () => true;
            this.valid = true;
        }
    }
    exports.DateTimeout = DateTimeout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkFsZ29yaXRobS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vZGlmZi9kZWZhdWx0TGluZXNEaWZmQ29tcHV0ZXIvYWxnb3JpdGhtcy9kaWZmQWxnb3JpdGhtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFhLG1CQUFtQjtRQUMvQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQWUsRUFBRSxJQUFlO1lBQzlDLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLHlCQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSx5QkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pJLENBQUM7UUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQWUsRUFBRSxJQUFlO1lBQ3RELE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLHlCQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSx5QkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hJLENBQUM7UUFFRCxZQUNpQixLQUFxQjtRQUNyQzs7O1dBR0c7UUFDYSxVQUFtQjtZQUxuQixVQUFLLEdBQUwsS0FBSyxDQUFnQjtZQUtyQixlQUFVLEdBQVYsVUFBVSxDQUFTO1FBQ2hDLENBQUM7S0FDTDtJQWpCRCxrREFpQkM7SUFFRCxNQUFhLFlBQVk7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUE2QixFQUFFLFVBQWtCO1lBQ3JFLE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7WUFDbEMsSUFBQSx3QkFBZSxFQUFD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