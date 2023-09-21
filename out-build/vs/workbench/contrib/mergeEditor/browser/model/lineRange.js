/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/editor/common/core/range"], function (require, exports, arrays_1, errors_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6ib = void 0;
    class $6ib {
        static { this.compareByStart = (0, arrays_1.$5b)(l => l.startLineNumber, arrays_1.$7b); }
        static join(ranges) {
            if (ranges.length === 0) {
                return undefined;
            }
            let startLineNumber = Number.MAX_SAFE_INTEGER;
            let endLineNumber = 0;
            for (const range of ranges) {
                startLineNumber = Math.min(startLineNumber, range.startLineNumber);
                endLineNumber = Math.max(endLineNumber, range.startLineNumber + range.lineCount);
            }
            return new $6ib(startLineNumber, endLineNumber - startLineNumber);
        }
        static fromLineNumbers(startLineNumber, endExclusiveLineNumber) {
            return new $6ib(startLineNumber, endExclusiveLineNumber - startLineNumber);
        }
        constructor(startLineNumber, lineCount) {
            this.startLineNumber = startLineNumber;
            this.lineCount = lineCount;
            if (lineCount < 0) {
                throw new errors_1.$ab();
            }
        }
        join(other) {
            return new $6ib(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive) - this.startLineNumber);
        }
        get endLineNumberExclusive() {
            return this.startLineNumber + this.lineCount;
        }
        get isEmpty() {
            return this.lineCount === 0;
        }
        /**
         * Returns false if there is at least one line between `this` and `other`.
        */
        touches(other) {
            return (this.endLineNumberExclusive >= other.startLineNumber &&
                other.endLineNumberExclusive >= this.startLineNumber);
        }
        isAfter(range) {
            return this.startLineNumber >= range.endLineNumberExclusive;
        }
        isBefore(range) {
            return range.startLineNumber >= this.endLineNumberExclusive;
        }
        delta(lineDelta) {
            return new $6ib(this.startLineNumber + lineDelta, this.lineCount);
        }
        toString() {
            return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
        }
        equals(originalRange) {
            return this.startLineNumber === originalRange.startLineNumber && this.lineCount === originalRange.lineCount;
        }
        contains(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
        }
        deltaEnd(delta) {
            return new $6ib(this.startLineNumber, this.lineCount + delta);
        }
        deltaStart(lineDelta) {
            return new $6ib(this.startLineNumber + lineDelta, this.lineCount - lineDelta);
        }
        getLines(model) {
            const result = new Array(this.lineCount);
            for (let i = 0; i < this.lineCount; i++) {
                result[i] = model.getLineContent(this.startLineNumber + i);
            }
            return result;
        }
        containsRange(range) {
            return this.startLineNumber <= range.startLineNumber && range.endLineNumberExclusive <= this.endLineNumberExclusive;
        }
        toRange() {
            return new range_1.$ks(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
        }
        toInclusiveRange() {
            if (this.isEmpty) {
                return undefined;
            }
            return new range_1.$ks(this.startLineNumber, 1, this.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        }
        toInclusiveRangeOrEmpty() {
            if (this.isEmpty) {
                return new range_1.$ks(this.startLineNumber, 1, this.startLineNumber, 1);
            }
            return new range_1.$ks(this.startLineNumber, 1, this.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        }
        intersects(lineRange) {
            return this.startLineNumber <= lineRange.endLineNumberExclusive
                && lineRange.startLineNumber <= this.endLineNumberExclusive;
        }
    }
    exports.$6ib = $6ib;
});
//# sourceMappingURL=lineRange.js.map