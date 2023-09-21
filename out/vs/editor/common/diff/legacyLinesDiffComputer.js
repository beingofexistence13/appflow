/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/diff/diff", "vs/editor/common/diff/linesDiffComputer", "./rangeMapping", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/assert", "vs/editor/common/core/lineRange"], function (require, exports, diff_1, linesDiffComputer_1, rangeMapping_1, strings, range_1, assert_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffComputer = exports.LegacyLinesDiffComputer = void 0;
    const MINIMUM_MATCHING_CHARACTER_LENGTH = 3;
    class LegacyLinesDiffComputer {
        computeDiff(originalLines, modifiedLines, options) {
            const diffComputer = new DiffComputer(originalLines, modifiedLines, {
                maxComputationTime: options.maxComputationTimeMs,
                shouldIgnoreTrimWhitespace: options.ignoreTrimWhitespace,
                shouldComputeCharChanges: true,
                shouldMakePrettyDiff: true,
                shouldPostProcessCharChanges: true,
            });
            const result = diffComputer.computeDiff();
            const changes = [];
            let lastChange = null;
            for (const c of result.changes) {
                let originalRange;
                if (c.originalEndLineNumber === 0) {
                    // Insertion
                    originalRange = new lineRange_1.LineRange(c.originalStartLineNumber + 1, c.originalStartLineNumber + 1);
                }
                else {
                    originalRange = new lineRange_1.LineRange(c.originalStartLineNumber, c.originalEndLineNumber + 1);
                }
                let modifiedRange;
                if (c.modifiedEndLineNumber === 0) {
                    // Deletion
                    modifiedRange = new lineRange_1.LineRange(c.modifiedStartLineNumber + 1, c.modifiedStartLineNumber + 1);
                }
                else {
                    modifiedRange = new lineRange_1.LineRange(c.modifiedStartLineNumber, c.modifiedEndLineNumber + 1);
                }
                let change = new rangeMapping_1.DetailedLineRangeMapping(originalRange, modifiedRange, c.charChanges?.map(c => new rangeMapping_1.RangeMapping(new range_1.Range(c.originalStartLineNumber, c.originalStartColumn, c.originalEndLineNumber, c.originalEndColumn), new range_1.Range(c.modifiedStartLineNumber, c.modifiedStartColumn, c.modifiedEndLineNumber, c.modifiedEndColumn))));
                if (lastChange) {
                    if (lastChange.modified.endLineNumberExclusive === change.modified.startLineNumber
                        || lastChange.original.endLineNumberExclusive === change.original.startLineNumber) {
                        // join touching diffs. Probably moving diffs up/down in the algorithm causes touching diffs.
                        change = new rangeMapping_1.DetailedLineRangeMapping(lastChange.original.join(change.original), lastChange.modified.join(change.modified), lastChange.innerChanges && change.innerChanges ?
                            lastChange.innerChanges.concat(change.innerChanges) : undefined);
                        changes.pop();
                    }
                }
                changes.push(change);
                lastChange = change;
            }
            (0, assert_1.assertFn)(() => {
                return (0, assert_1.checkAdjacentItems)(changes, (m1, m2) => m2.original.startLineNumber - m1.original.endLineNumberExclusive === m2.modified.startLineNumber - m1.modified.endLineNumberExclusive &&
                    // There has to be an unchanged line in between (otherwise both diffs should have been joined)
                    m1.original.endLineNumberExclusive < m2.original.startLineNumber &&
                    m1.modified.endLineNumberExclusive < m2.modified.startLineNumber);
            });
            return new linesDiffComputer_1.LinesDiff(changes, [], result.quitEarly);
        }
    }
    exports.LegacyLinesDiffComputer = LegacyLinesDiffComputer;
    function computeDiff(originalSequence, modifiedSequence, continueProcessingPredicate, pretty) {
        const diffAlgo = new diff_1.LcsDiff(originalSequence, modifiedSequence, continueProcessingPredicate);
        return diffAlgo.ComputeDiff(pretty);
    }
    class LineSequence {
        constructor(lines) {
            const startColumns = [];
            const endColumns = [];
            for (let i = 0, length = lines.length; i < length; i++) {
                startColumns[i] = getFirstNonBlankColumn(lines[i], 1);
                endColumns[i] = getLastNonBlankColumn(lines[i], 1);
            }
            this.lines = lines;
            this._startColumns = startColumns;
            this._endColumns = endColumns;
        }
        getElements() {
            const elements = [];
            for (let i = 0, len = this.lines.length; i < len; i++) {
                elements[i] = this.lines[i].substring(this._startColumns[i] - 1, this._endColumns[i] - 1);
            }
            return elements;
        }
        getStrictElement(index) {
            return this.lines[index];
        }
        getStartLineNumber(i) {
            return i + 1;
        }
        getEndLineNumber(i) {
            return i + 1;
        }
        createCharSequence(shouldIgnoreTrimWhitespace, startIndex, endIndex) {
            const charCodes = [];
            const lineNumbers = [];
            const columns = [];
            let len = 0;
            for (let index = startIndex; index <= endIndex; index++) {
                const lineContent = this.lines[index];
                const startColumn = (shouldIgnoreTrimWhitespace ? this._startColumns[index] : 1);
                const endColumn = (shouldIgnoreTrimWhitespace ? this._endColumns[index] : lineContent.length + 1);
                for (let col = startColumn; col < endColumn; col++) {
                    charCodes[len] = lineContent.charCodeAt(col - 1);
                    lineNumbers[len] = index + 1;
                    columns[len] = col;
                    len++;
                }
                if (!shouldIgnoreTrimWhitespace && index < endIndex) {
                    // Add \n if trim whitespace is not ignored
                    charCodes[len] = 10 /* CharCode.LineFeed */;
                    lineNumbers[len] = index + 1;
                    columns[len] = lineContent.length + 1;
                    len++;
                }
            }
            return new CharSequence(charCodes, lineNumbers, columns);
        }
    }
    class CharSequence {
        constructor(charCodes, lineNumbers, columns) {
            this._charCodes = charCodes;
            this._lineNumbers = lineNumbers;
            this._columns = columns;
        }
        toString() {
            return ('[' + this._charCodes.map((s, idx) => (s === 10 /* CharCode.LineFeed */ ? '\\n' : String.fromCharCode(s)) + `-(${this._lineNumbers[idx]},${this._columns[idx]})`).join(', ') + ']');
        }
        _assertIndex(index, arr) {
            if (index < 0 || index >= arr.length) {
                throw new Error(`Illegal index`);
            }
        }
        getElements() {
            return this._charCodes;
        }
        getStartLineNumber(i) {
            if (i > 0 && i === this._lineNumbers.length) {
                // the start line number of the element after the last element
                // is the end line number of the last element
                return this.getEndLineNumber(i - 1);
            }
            this._assertIndex(i, this._lineNumbers);
            return this._lineNumbers[i];
        }
        getEndLineNumber(i) {
            if (i === -1) {
                // the end line number of the element before the first element
                // is the start line number of the first element
                return this.getStartLineNumber(i + 1);
            }
            this._assertIndex(i, this._lineNumbers);
            if (this._charCodes[i] === 10 /* CharCode.LineFeed */) {
                return this._lineNumbers[i] + 1;
            }
            return this._lineNumbers[i];
        }
        getStartColumn(i) {
            if (i > 0 && i === this._columns.length) {
                // the start column of the element after the last element
                // is the end column of the last element
                return this.getEndColumn(i - 1);
            }
            this._assertIndex(i, this._columns);
            return this._columns[i];
        }
        getEndColumn(i) {
            if (i === -1) {
                // the end column of the element before the first element
                // is the start column of the first element
                return this.getStartColumn(i + 1);
            }
            this._assertIndex(i, this._columns);
            if (this._charCodes[i] === 10 /* CharCode.LineFeed */) {
                return 1;
            }
            return this._columns[i] + 1;
        }
    }
    class CharChange {
        constructor(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
            this.originalStartLineNumber = originalStartLineNumber;
            this.originalStartColumn = originalStartColumn;
            this.originalEndLineNumber = originalEndLineNumber;
            this.originalEndColumn = originalEndColumn;
            this.modifiedStartLineNumber = modifiedStartLineNumber;
            this.modifiedStartColumn = modifiedStartColumn;
            this.modifiedEndLineNumber = modifiedEndLineNumber;
            this.modifiedEndColumn = modifiedEndColumn;
        }
        static createFromDiffChange(diffChange, originalCharSequence, modifiedCharSequence) {
            const originalStartLineNumber = originalCharSequence.getStartLineNumber(diffChange.originalStart);
            const originalStartColumn = originalCharSequence.getStartColumn(diffChange.originalStart);
            const originalEndLineNumber = originalCharSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
            const originalEndColumn = originalCharSequence.getEndColumn(diffChange.originalStart + diffChange.originalLength - 1);
            const modifiedStartLineNumber = modifiedCharSequence.getStartLineNumber(diffChange.modifiedStart);
            const modifiedStartColumn = modifiedCharSequence.getStartColumn(diffChange.modifiedStart);
            const modifiedEndLineNumber = modifiedCharSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
            const modifiedEndColumn = modifiedCharSequence.getEndColumn(diffChange.modifiedStart + diffChange.modifiedLength - 1);
            return new CharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn);
        }
    }
    function postProcessCharChanges(rawChanges) {
        if (rawChanges.length <= 1) {
            return rawChanges;
        }
        const result = [rawChanges[0]];
        let prevChange = result[0];
        for (let i = 1, len = rawChanges.length; i < len; i++) {
            const currChange = rawChanges[i];
            const originalMatchingLength = currChange.originalStart - (prevChange.originalStart + prevChange.originalLength);
            const modifiedMatchingLength = currChange.modifiedStart - (prevChange.modifiedStart + prevChange.modifiedLength);
            // Both of the above should be equal, but the continueProcessingPredicate may prevent this from being true
            const matchingLength = Math.min(originalMatchingLength, modifiedMatchingLength);
            if (matchingLength < MINIMUM_MATCHING_CHARACTER_LENGTH) {
                // Merge the current change into the previous one
                prevChange.originalLength = (currChange.originalStart + currChange.originalLength) - prevChange.originalStart;
                prevChange.modifiedLength = (currChange.modifiedStart + currChange.modifiedLength) - prevChange.modifiedStart;
            }
            else {
                // Add the current change
                result.push(currChange);
                prevChange = currChange;
            }
        }
        return result;
    }
    class LineChange {
        constructor(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
            this.originalStartLineNumber = originalStartLineNumber;
            this.originalEndLineNumber = originalEndLineNumber;
            this.modifiedStartLineNumber = modifiedStartLineNumber;
            this.modifiedEndLineNumber = modifiedEndLineNumber;
            this.charChanges = charChanges;
        }
        static createFromDiffResult(shouldIgnoreTrimWhitespace, diffChange, originalLineSequence, modifiedLineSequence, continueCharDiff, shouldComputeCharChanges, shouldPostProcessCharChanges) {
            let originalStartLineNumber;
            let originalEndLineNumber;
            let modifiedStartLineNumber;
            let modifiedEndLineNumber;
            let charChanges = undefined;
            if (diffChange.originalLength === 0) {
                originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart) - 1;
                originalEndLineNumber = 0;
            }
            else {
                originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart);
                originalEndLineNumber = originalLineSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
            }
            if (diffChange.modifiedLength === 0) {
                modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart) - 1;
                modifiedEndLineNumber = 0;
            }
            else {
                modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart);
                modifiedEndLineNumber = modifiedLineSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
            }
            if (shouldComputeCharChanges && diffChange.originalLength > 0 && diffChange.originalLength < 20 && diffChange.modifiedLength > 0 && diffChange.modifiedLength < 20 && continueCharDiff()) {
                // Compute character changes for diff chunks of at most 20 lines...
                const originalCharSequence = originalLineSequence.createCharSequence(shouldIgnoreTrimWhitespace, diffChange.originalStart, diffChange.originalStart + diffChange.originalLength - 1);
                const modifiedCharSequence = modifiedLineSequence.createCharSequence(shouldIgnoreTrimWhitespace, diffChange.modifiedStart, diffChange.modifiedStart + diffChange.modifiedLength - 1);
                if (originalCharSequence.getElements().length > 0 && modifiedCharSequence.getElements().length > 0) {
                    let rawChanges = computeDiff(originalCharSequence, modifiedCharSequence, continueCharDiff, true).changes;
                    if (shouldPostProcessCharChanges) {
                        rawChanges = postProcessCharChanges(rawChanges);
                    }
                    charChanges = [];
                    for (let i = 0, length = rawChanges.length; i < length; i++) {
                        charChanges.push(CharChange.createFromDiffChange(rawChanges[i], originalCharSequence, modifiedCharSequence));
                    }
                }
            }
            return new LineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges);
        }
    }
    class DiffComputer {
        constructor(originalLines, modifiedLines, opts) {
            this.shouldComputeCharChanges = opts.shouldComputeCharChanges;
            this.shouldPostProcessCharChanges = opts.shouldPostProcessCharChanges;
            this.shouldIgnoreTrimWhitespace = opts.shouldIgnoreTrimWhitespace;
            this.shouldMakePrettyDiff = opts.shouldMakePrettyDiff;
            this.originalLines = originalLines;
            this.modifiedLines = modifiedLines;
            this.original = new LineSequence(originalLines);
            this.modified = new LineSequence(modifiedLines);
            this.continueLineDiff = createContinueProcessingPredicate(opts.maxComputationTime);
            this.continueCharDiff = createContinueProcessingPredicate(opts.maxComputationTime === 0 ? 0 : Math.min(opts.maxComputationTime, 5000)); // never run after 5s for character changes...
        }
        computeDiff() {
            if (this.original.lines.length === 1 && this.original.lines[0].length === 0) {
                // empty original => fast path
                if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
                    return {
                        quitEarly: false,
                        changes: []
                    };
                }
                return {
                    quitEarly: false,
                    changes: [{
                            originalStartLineNumber: 1,
                            originalEndLineNumber: 1,
                            modifiedStartLineNumber: 1,
                            modifiedEndLineNumber: this.modified.lines.length,
                            charChanges: undefined
                        }]
                };
            }
            if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
                // empty modified => fast path
                return {
                    quitEarly: false,
                    changes: [{
                            originalStartLineNumber: 1,
                            originalEndLineNumber: this.original.lines.length,
                            modifiedStartLineNumber: 1,
                            modifiedEndLineNumber: 1,
                            charChanges: undefined
                        }]
                };
            }
            const diffResult = computeDiff(this.original, this.modified, this.continueLineDiff, this.shouldMakePrettyDiff);
            const rawChanges = diffResult.changes;
            const quitEarly = diffResult.quitEarly;
            // The diff is always computed with ignoring trim whitespace
            // This ensures we get the prettiest diff
            if (this.shouldIgnoreTrimWhitespace) {
                const lineChanges = [];
                for (let i = 0, length = rawChanges.length; i < length; i++) {
                    lineChanges.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, rawChanges[i], this.original, this.modified, this.continueCharDiff, this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
                }
                return {
                    quitEarly: quitEarly,
                    changes: lineChanges
                };
            }
            // Need to post-process and introduce changes where the trim whitespace is different
            // Note that we are looping starting at -1 to also cover the lines before the first change
            const result = [];
            let originalLineIndex = 0;
            let modifiedLineIndex = 0;
            for (let i = -1 /* !!!! */, len = rawChanges.length; i < len; i++) {
                const nextChange = (i + 1 < len ? rawChanges[i + 1] : null);
                const originalStop = (nextChange ? nextChange.originalStart : this.originalLines.length);
                const modifiedStop = (nextChange ? nextChange.modifiedStart : this.modifiedLines.length);
                while (originalLineIndex < originalStop && modifiedLineIndex < modifiedStop) {
                    const originalLine = this.originalLines[originalLineIndex];
                    const modifiedLine = this.modifiedLines[modifiedLineIndex];
                    if (originalLine !== modifiedLine) {
                        // These lines differ only in trim whitespace
                        // Check the leading whitespace
                        {
                            let originalStartColumn = getFirstNonBlankColumn(originalLine, 1);
                            let modifiedStartColumn = getFirstNonBlankColumn(modifiedLine, 1);
                            while (originalStartColumn > 1 && modifiedStartColumn > 1) {
                                const originalChar = originalLine.charCodeAt(originalStartColumn - 2);
                                const modifiedChar = modifiedLine.charCodeAt(modifiedStartColumn - 2);
                                if (originalChar !== modifiedChar) {
                                    break;
                                }
                                originalStartColumn--;
                                modifiedStartColumn--;
                            }
                            if (originalStartColumn > 1 || modifiedStartColumn > 1) {
                                this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, 1, originalStartColumn, modifiedLineIndex + 1, 1, modifiedStartColumn);
                            }
                        }
                        // Check the trailing whitespace
                        {
                            let originalEndColumn = getLastNonBlankColumn(originalLine, 1);
                            let modifiedEndColumn = getLastNonBlankColumn(modifiedLine, 1);
                            const originalMaxColumn = originalLine.length + 1;
                            const modifiedMaxColumn = modifiedLine.length + 1;
                            while (originalEndColumn < originalMaxColumn && modifiedEndColumn < modifiedMaxColumn) {
                                const originalChar = originalLine.charCodeAt(originalEndColumn - 1);
                                const modifiedChar = originalLine.charCodeAt(modifiedEndColumn - 1);
                                if (originalChar !== modifiedChar) {
                                    break;
                                }
                                originalEndColumn++;
                                modifiedEndColumn++;
                            }
                            if (originalEndColumn < originalMaxColumn || modifiedEndColumn < modifiedMaxColumn) {
                                this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, originalEndColumn, originalMaxColumn, modifiedLineIndex + 1, modifiedEndColumn, modifiedMaxColumn);
                            }
                        }
                    }
                    originalLineIndex++;
                    modifiedLineIndex++;
                }
                if (nextChange) {
                    // Emit the actual change
                    result.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, nextChange, this.original, this.modified, this.continueCharDiff, this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
                    originalLineIndex += nextChange.originalLength;
                    modifiedLineIndex += nextChange.modifiedLength;
                }
            }
            return {
                quitEarly: quitEarly,
                changes: result
            };
        }
        _pushTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
            if (this._mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn)) {
                // Merged into previous
                return;
            }
            let charChanges = undefined;
            if (this.shouldComputeCharChanges) {
                charChanges = [new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn)];
            }
            result.push(new LineChange(originalLineNumber, originalLineNumber, modifiedLineNumber, modifiedLineNumber, charChanges));
        }
        _mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
            const len = result.length;
            if (len === 0) {
                return false;
            }
            const prevChange = result[len - 1];
            if (prevChange.originalEndLineNumber === 0 || prevChange.modifiedEndLineNumber === 0) {
                // Don't merge with inserts/deletes
                return false;
            }
            if (prevChange.originalEndLineNumber === originalLineNumber && prevChange.modifiedEndLineNumber === modifiedLineNumber) {
                if (this.shouldComputeCharChanges && prevChange.charChanges) {
                    prevChange.charChanges.push(new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn));
                }
                return true;
            }
            if (prevChange.originalEndLineNumber + 1 === originalLineNumber && prevChange.modifiedEndLineNumber + 1 === modifiedLineNumber) {
                prevChange.originalEndLineNumber = originalLineNumber;
                prevChange.modifiedEndLineNumber = modifiedLineNumber;
                if (this.shouldComputeCharChanges && prevChange.charChanges) {
                    prevChange.charChanges.push(new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn));
                }
                return true;
            }
            return false;
        }
    }
    exports.DiffComputer = DiffComputer;
    function getFirstNonBlankColumn(txt, defaultValue) {
        const r = strings.firstNonWhitespaceIndex(txt);
        if (r === -1) {
            return defaultValue;
        }
        return r + 1;
    }
    function getLastNonBlankColumn(txt, defaultValue) {
        const r = strings.lastNonWhitespaceIndex(txt);
        if (r === -1) {
            return defaultValue;
        }
        return r + 2;
    }
    function createContinueProcessingPredicate(maximumRuntime) {
        if (maximumRuntime === 0) {
            return () => true;
        }
        const startTime = Date.now();
        return () => {
            return Date.now() - startTime < maximumRuntime;
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnYWN5TGluZXNEaWZmQ29tcHV0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2RpZmYvbGVnYWN5TGluZXNEaWZmQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQU0saUNBQWlDLEdBQUcsQ0FBQyxDQUFDO0lBRTVDLE1BQWEsdUJBQXVCO1FBQ25DLFdBQVcsQ0FBQyxhQUF1QixFQUFFLGFBQXVCLEVBQUUsT0FBa0M7WUFDL0YsTUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRTtnQkFDbkUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLG9CQUFvQjtnQkFDaEQsMEJBQTBCLEVBQUUsT0FBTyxDQUFDLG9CQUFvQjtnQkFDeEQsd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsb0JBQW9CLEVBQUUsSUFBSTtnQkFDMUIsNEJBQTRCLEVBQUUsSUFBSTthQUNsQyxDQUFDLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUMsTUFBTSxPQUFPLEdBQStCLEVBQUUsQ0FBQztZQUMvQyxJQUFJLFVBQVUsR0FBb0MsSUFBSSxDQUFDO1lBR3ZELEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDL0IsSUFBSSxhQUF3QixDQUFDO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxxQkFBcUIsS0FBSyxDQUFDLEVBQUU7b0JBQ2xDLFlBQVk7b0JBQ1osYUFBYSxHQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDNUY7cUJBQU07b0JBQ04sYUFBYSxHQUFHLElBQUkscUJBQVMsQ0FBQyxDQUFDLENBQUMs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