/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinesLayout = exports.EditorWhitespace = void 0;
    class PendingChanges {
        constructor() {
            this._hasPending = false;
            this._inserts = [];
            this._changes = [];
            this._removes = [];
        }
        insert(x) {
            this._hasPending = true;
            this._inserts.push(x);
        }
        change(x) {
            this._hasPending = true;
            this._changes.push(x);
        }
        remove(x) {
            this._hasPending = true;
            this._removes.push(x);
        }
        mustCommit() {
            return this._hasPending;
        }
        commit(linesLayout) {
            if (!this._hasPending) {
                return;
            }
            const inserts = this._inserts;
            const changes = this._changes;
            const removes = this._removes;
            this._hasPending = false;
            this._inserts = [];
            this._changes = [];
            this._removes = [];
            linesLayout._commitPendingChanges(inserts, changes, removes);
        }
    }
    class EditorWhitespace {
        constructor(id, afterLineNumber, ordinal, height, minWidth) {
            this.id = id;
            this.afterLineNumber = afterLineNumber;
            this.ordinal = ordinal;
            this.height = height;
            this.minWidth = minWidth;
            this.prefixSum = 0;
        }
    }
    exports.EditorWhitespace = EditorWhitespace;
    /**
     * Layouting of objects that take vertical space (by having a height) and push down other objects.
     *
     * These objects are basically either text (lines) or spaces between those lines (whitespaces).
     * This provides commodity operations for working with lines that contain whitespace that pushes lines lower (vertically).
     */
    class LinesLayout {
        static { this.INSTANCE_COUNT = 0; }
        constructor(lineCount, lineHeight, paddingTop, paddingBottom) {
            this._instanceId = strings.singleLetterHash(++LinesLayout.INSTANCE_COUNT);
            this._pendingChanges = new PendingChanges();
            this._lastWhitespaceId = 0;
            this._arr = [];
            this._prefixSumValidIndex = -1;
            this._minWidth = -1; /* marker for not being computed */
            this._lineCount = lineCount;
            this._lineHeight = lineHeight;
            this._paddingTop = paddingTop;
            this._paddingBottom = paddingBottom;
        }
        /**
         * Find the insertion index for a new value inside a sorted array of values.
         * If the value is already present in the sorted array, the insertion index will be after the already existing value.
         */
        static findInsertionIndex(arr, afterLineNumber, ordinal) {
            let low = 0;
            let high = arr.length;
            while (low < high) {
                const mid = ((low + high) >>> 1);
                if (afterLineNumber === arr[mid].afterLineNumber) {
                    if (ordinal < arr[mid].ordinal) {
                        high = mid;
                    }
                    else {
                        low = mid + 1;
                    }
                }
                else if (afterLineNumber < arr[mid].afterLineNumber) {
                    high = mid;
                }
                else {
                    low = mid + 1;
                }
            }
            return low;
        }
        /**
         * Change the height of a line in pixels.
         */
        setLineHeight(lineHeight) {
            this._checkPendingChanges();
            this._lineHeight = lineHeight;
        }
        /**
         * Changes the padding used to calculate vertical offsets.
         */
        setPadding(paddingTop, paddingBottom) {
            this._paddingTop = paddingTop;
            this._paddingBottom = paddingBottom;
        }
        /**
         * Set the number of lines.
         *
         * @param lineCount New number of lines.
         */
        onFlushed(lineCount) {
            this._checkPendingChanges();
            this._lineCount = lineCount;
        }
        changeWhitespace(callback) {
            let hadAChange = false;
            try {
                const accessor = {
                    insertWhitespace: (afterLineNumber, ordinal, heightInPx, minWidth) => {
                        hadAChange = true;
                        afterLineNumber = afterLineNumber | 0;
                        ordinal = ordinal | 0;
                        heightInPx = heightInPx | 0;
                        minWidth = minWidth | 0;
                        const id = this._instanceId + (++this._lastWhitespaceId);
                        this._pendingChanges.insert(new EditorWhitespace(id, afterLineNumber, ordinal, heightInPx, minWidth));
                        return id;
                    },
                    changeOneWhitespace: (id, newAfterLineNumber, newHeight) => {
                        hadAChange = true;
                        newAfterLineNumber = newAfterLineNumber | 0;
                        newHeight = newHeight | 0;
                        this._pendingChanges.change({ id, newAfterLineNumber, newHeight });
                    },
                    removeWhitespace: (id) => {
                        hadAChange = true;
                        this._pendingChanges.remove({ id });
                    }
                };
                callback(accessor);
            }
            finally {
                this._pendingChanges.commit(this);
            }
            return hadAChange;
        }
        _commitPendingChanges(inserts, changes, removes) {
            if (inserts.length > 0 || removes.length > 0) {
                this._minWidth = -1; /* marker for not being computed */
            }
            if (inserts.length + changes.length + removes.length <= 1) {
                // when only one thing happened, handle it "delicately"
                for (const insert of inserts) {
                    this._insertWhitespace(insert);
                }
                for (const change of changes) {
                    this._changeOneWhitespace(change.id, change.newAfterLineNumber, change.newHeight);
                }
                for (const remove of removes) {
                    const index = this._findWhitespaceIndex(remove.id);
                    if (index === -1) {
                        continue;
                    }
                    this._removeWhitespace(index);
                }
                return;
            }
            // simply rebuild the entire datastructure
            const toRemove = new Set();
            for (const remove of removes) {
                toRemove.add(remove.id);
            }
            const toChange = new Map();
            for (const change of changes) {
                toChange.set(change.id, change);
            }
            const applyRemoveAndChange = (whitespaces) => {
                const result = [];
                for (const whitespace of whitespaces) {
                    if (toRemove.has(whitespace.id)) {
                        continue;
                    }
                    if (toChange.has(whitespace.id)) {
                        const change = toChange.get(whitespace.id);
                        whitespace.afterLineNumber = change.newAfterLineNumber;
                        whitespace.height = change.newHeight;
                    }
                    result.push(whitespace);
                }
                return result;
            };
            const result = applyRemoveAndChange(this._arr).concat(applyRemoveAndChange(inserts));
            result.sort((a, b) => {
                if (a.afterLineNumber === b.afterLineNumber) {
                    return a.ordinal - b.ordinal;
                }
                return a.afterLineNumber - b.afterLineNumber;
            });
            this._arr = result;
            this._prefixSumValidIndex = -1;
        }
        _checkPendingChanges() {
            if (this._pendingChanges.mustCommit()) {
                this._pendingChanges.commit(this);
            }
        }
        _insertWhitespace(whitespace) {
            const insertIndex = LinesLayout.findInsertionIndex(this._arr, whitespace.afterLineNumber, whitespace.ordinal);
            this._arr.splice(insertIndex, 0, whitespace);
            this._prefixSumValidIndex = Math.min(this._prefixSumValidIndex, insertIndex - 1);
        }
        _findWhitespaceIndex(id) {
            const arr = this._arr;
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i].id === id) {
                    return i;
                }
            }
            return -1;
        }
        _changeOneWhitespace(id, newAfterLineNumber, newHeight) {
            const index = this._findWhitespaceIndex(id);
            if (index === -1) {
                return;
            }
            if (this._arr[index].height !== newHeight) {
                this._arr[index].height = newHeight;
                this._prefixSumValidIndex = Math.min(this._prefixSumValidIndex, index - 1);
            }
            if (this._arr[index].afterLineNumber !== newAfterLineNumber) {
                // `afterLineNumber` changed for this whitespace
                // Record old whitespace
                const whitespace = this._arr[index];
                // Since changing `afterLineNumber` can trigger a reordering, we're gonna remove this whitespace
                this._removeWhitespace(index);
                whitespace.afterLineNumber = newAfterLineNumber;
                // And add it again
                this._insertWhitespace(whitespace);
            }
        }
        _removeWhitespace(removeIndex) {
            this._arr.splice(removeIndex, 1);
            this._prefixSumValidIndex = Math.min(this._prefixSumValidIndex, removeIndex - 1);
        }
        /**
         * Notify the layouter that lines have been deleted (a continuous zone of lines).
         *
         * @param fromLineNumber The line number at which the deletion started, inclusive
         * @param toLineNumber The line number at which the deletion ended, inclusive
         */
        onLinesDeleted(fromLineNumber, toLineNumber) {
            this._checkPendingChanges();
            fromLineNumber = fromLineNumber | 0;
            toLineNumber = toLineNumber | 0;
            this._lineCount -= (toLineNumber - fromLineNumber + 1);
            for (let i = 0, len = this._arr.length; i < len; i++) {
                const afterLineNumber = this._arr[i].afterLineNumber;
                if (fromLineNumber <= afterLineNumber && afterLineNumber <= toLineNumber) {
                    // The line this whitespace was after has been deleted
                    //  => move whitespace to before first deleted line
                    this._arr[i].afterLineNumber = fromLineNumber - 1;
                }
                else if (afterLineNumber > toLineNumber) {
                    // The line this whitespace was after has been moved up
                    //  => move whitespace up
                    this._arr[i].afterLineNumber -= (toLineNumber - fromLineNumber + 1);
                }
            }
        }
        /**
         * Notify the layouter that lines have been inserted (a continuous zone of lines).
         *
         * @param fromLineNumber The line number at which the insertion started, inclusive
         * @param toLineNumber The line number at which the insertion ended, inclusive.
         */
        onLinesInserted(fromLineNumber, toLineNumber) {
            this._checkPendingChanges();
            fromLineNumber = fromLineNumber | 0;
            toLineNumber = toLineNumber | 0;
            this._lineCount += (toLineNumber - fromLineNumber + 1);
            for (let i = 0, len = this._arr.length; i < len; i++) {
                const afterLineNumber = this._arr[i].afterLineNumber;
                if (fromLineNumber <= afterLineNumber) {
                    this._arr[i].afterLineNumber += (toLineNumber - fromLineNumber + 1);
                }
            }
        }
        /**
         * Get the sum of all the whitespaces.
         */
        getWhitespacesTotalHeight() {
            this._checkPendingChanges();
            if (this._arr.length === 0) {
                return 0;
            }
            return this.getWhitespacesAccumulatedHeight(this._arr.length - 1);
        }
        /**
         * Return the sum of the heights of the whitespaces at [0..index].
         * This includes the whitespace at `index`.
         *
         * @param index The index of the whitespace.
         * @return The sum of the heights of all whitespaces before the one at `index`, including the one at `index`.
         */
        getWhitespacesAccumulatedHeight(index) {
            this._checkPendingChanges();
            index = index | 0;
            let startIndex = Math.max(0, this._prefixSumValidIndex + 1);
            if (startIndex === 0) {
                this._arr[0].prefixSum = this._arr[0].height;
                startIndex++;
            }
            for (let i = startIndex; i <= index; i++) {
                this._arr[i].prefixSum = this._arr[i - 1].prefixSum + this._arr[i].height;
            }
            this._prefixSumValidIndex = Math.max(this._prefixSumValidIndex, index);
            return this._arr[index].prefixSum;
        }
        /**
         * Get the sum of heights for all objects.
         *
         * @return The sum of heights for all objects.
         */
        getLinesTotalHeight() {
            this._checkPendingChanges();
            const linesHeight = this._lineHeight * this._lineCount;
            const whitespacesHeight = this.getWhitespacesTotalHeight();
            return linesHeight + whitespacesHeight + this._paddingTop + this._paddingBottom;
        }
        /**
         * Returns the accumulated height of whitespaces before the given line number.
         *
         * @param lineNumber The line number
         */
        getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber) {
            this._checkPendingChanges();
            lineNumber = lineNumber | 0;
            const lastWhitespaceBeforeLineNumber = this._findLastWhitespaceBeforeLineNumber(lineNumber);
            if (lastWhitespaceBeforeLineNumber === -1) {
                return 0;
            }
            return this.getWhitespacesAccumulatedHeight(lastWhitespaceBeforeLineNumber);
        }
        _findLastWhitespaceBeforeLineNumber(lineNumber) {
            lineNumber = lineNumber | 0;
            // Find the whitespace before line number
            const arr = this._arr;
            let low = 0;
            let high = arr.length - 1;
            while (low <= high) {
                const delta = (high - low) | 0;
                const halfDelta = (delta / 2) | 0;
                const mid = (low + halfDelta) | 0;
                if (arr[mid].afterLineNumber < lineNumber) {
                    if (mid + 1 >= arr.length || arr[mid + 1].afterLineNumber >= lineNumber) {
                        return mid;
                    }
                    else {
                        low = (mid + 1) | 0;
                    }
                }
                else {
                    high = (mid - 1) | 0;
                }
            }
            return -1;
        }
        _findFirstWhitespaceAfterLineNumber(lineNumber) {
            lineNumber = lineNumber | 0;
            const lastWhitespaceBeforeLineNumber = this._findLastWhitespaceBeforeLineNumber(lineNumber);
            const firstWhitespaceAfterLineNumber = lastWhitespaceBeforeLineNumber + 1;
            if (firstWhitespaceAfterLineNumber < this._arr.length) {
                return firstWhitespaceAfterLineNumber;
            }
            return -1;
        }
        /**
         * Find the index of the first whitespace which has `afterLineNumber` >= `lineNumber`.
         * @return The index of the first whitespace with `afterLineNumber` >= `lineNumber` or -1 if no whitespace is found.
         */
        getFirstWhitespaceIndexAfterLineNumber(lineNumber) {
            this._checkPendingChanges();
            lineNumber = lineNumber | 0;
            return this._findFirstWhitespaceAfterLineNumber(lineNumber);
        }
        /**
         * Get the vertical offset (the sum of heights for all objects above) a certain line number.
         *
         * @param lineNumber The line number
         * @return The sum of heights for all objects above `lineNumber`.
         */
        getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
            this._checkPendingChanges();
            lineNumber = lineNumber | 0;
            let previousLinesHeight;
            if (lineNumber > 1) {
                previousLinesHeight = this._lineHeight * (lineNumber - 1);
            }
            else {
                previousLinesHeight = 0;
            }
            const previousWhitespacesHeight = this.getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber - (includeViewZones ? 1 : 0));
            return previousLinesHeight + previousWhitespacesHeight + this._paddingTop;
        }
        /**
         * Get the vertical offset (the sum of heights for all objects above) a certain line number.
         *
         * @param lineNumber The line number
         * @return The sum of heights for all objects above `lineNumber`.
         */
        getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
            this._checkPendingChanges();
            lineNumber = lineNumber | 0;
            const previousLinesHeight = this._lineHeight * lineNumber;
            const previousWhitespacesHeight = this.getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber + (includeViewZones ? 1 : 0));
            return previousLinesHeight + previousWhitespacesHeight + this._paddingTop;
        }
        /**
         * Returns if there is any whitespace in the document.
         */
        hasWhitespace() {
            this._checkPendingChanges();
            return this.getWhitespacesCount() > 0;
        }
        /**
         * The maximum min width for all whitespaces.
         */
        getWhitespaceMinWidth() {
            this._checkPendingChanges();
            if (this._minWidth === -1) {
                let minWidth = 0;
                for (let i = 0, len = this._arr.length; i < len; i++) {
                    minWidth = Math.max(minWidth, this._arr[i].minWidth);
                }
                this._minWidth = minWidth;
            }
            return this._minWidth;
        }
        /**
         * Check if `verticalOffset` is below all lines.
         */
        isAfterLines(verticalOffset) {
            this._checkPendingChanges();
            const totalHeight = this.getLinesTotalHeight();
            return verticalOffset > totalHeight;
        }
        isInTopPadding(verticalOffset) {
            if (this._paddingTop === 0) {
                return false;
            }
            this._checkPendingChanges();
            return (verticalOffset < this._paddingTop);
        }
        isInBottomPadding(verticalOffset) {
            if (this._paddingBottom === 0) {
                return false;
            }
            this._checkPendingChanges();
            const totalHeight = this.getLinesTotalHeight();
            return (verticalOffset >= totalHeight - this._paddingBottom);
        }
        /**
         * Find the first line number that is at or after vertical offset `verticalOffset`.
         * i.e. if getVerticalOffsetForLine(line) is x and getVerticalOffsetForLine(line + 1) is y, then
         * getLineNumberAtOrAfterVerticalOffset(i) = line, x <= i < y.
         *
         * @param verticalOffset The vertical offset to search at.
         * @return The line number at or after vertical offset `verticalOffset`.
         */
        getLineNumberAtOrAfterVerticalOffset(verticalOffset) {
            this._checkPendingChanges();
            verticalOffset = verticalOffset | 0;
            if (verticalOffset < 0) {
                return 1;
            }
            const linesCount = this._lineCount | 0;
            const lineHeight = this._lineHeight;
            let minLineNumber = 1;
            let maxLineNumber = linesCount;
            while (minLineNumber < maxLineNumber) {
                const midLineNumber = ((minLineNumber + maxLineNumber) / 2) | 0;
                const midLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(midLineNumber) | 0;
                if (verticalOffset >= midLineNumberVerticalOffset + lineHeight) {
                    // vertical offset is after mid line number
                    minLineNumber = midLineNumber + 1;
                }
                else if (verticalOffset >= midLineNumberVerticalOffset) {
                    // Hit
                    return midLineNumber;
                }
                else {
                    // vertical offset is before mid line number, but mid line number could still be what we're searching for
                    maxLineNumber = midLineNumber;
                }
            }
            if (minLineNumber > linesCount) {
                return linesCount;
            }
            return minLineNumber;
        }
        /**
         * Get all the lines and their relative vertical offsets that are positioned between `verticalOffset1` and `verticalOffset2`.
         *
         * @param verticalOffset1 The beginning of the viewport.
         * @param verticalOffset2 The end of the viewport.
         * @return A structure describing the lines positioned between `verticalOffset1` and `verticalOffset2`.
         */
        getLinesViewportData(verticalOffset1, verticalOffset2) {
            this._checkPendingChanges();
            verticalOffset1 = verticalOffset1 | 0;
            verticalOffset2 = verticalOffset2 | 0;
            const lineHeight = this._lineHeight;
            // Find first line number
            // We don't live in a perfect world, so the line number might start before or after verticalOffset1
            const startLineNumber = this.getLineNumberAtOrAfterVerticalOffset(verticalOffset1) | 0;
            const startLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(startLineNumber) | 0;
            let endLineNumber = this._lineCount | 0;
            // Also keep track of what whitespace we've got
            let whitespaceIndex = this.getFirstWhitespaceIndexAfterLineNumber(startLineNumber) | 0;
            const whitespaceCount = this.getWhitespacesCount() | 0;
            let currentWhitespaceHeight;
            let currentWhitespaceAfterLineNumber;
            if (whitespaceIndex === -1) {
                whitespaceIndex = whitespaceCount;
                currentWhitespaceAfterLineNumber = endLineNumber + 1;
                currentWhitespaceHeight = 0;
            }
            else {
                currentWhitespaceAfterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex) | 0;
                currentWhitespaceHeight = this.getHeightForWhitespaceIndex(whitespaceIndex) | 0;
            }
            let currentVerticalOffset = startLineNumberVerticalOffset;
            let currentLineRelativeOffset = currentVerticalOffset;
            // IE (all versions) cannot handle units above about 1,533,908 px, so every 500k pixels bring numbers down
            const STEP_SIZE = 500000;
            let bigNumbersDelta = 0;
            if (startLineNumberVerticalOffset >= STEP_SIZE) {
                // Compute a delta that guarantees that lines are positioned at `lineHeight` increments
                bigNumbersDelta = Math.floor(startLineNumberVerticalOffset / STEP_SIZE) * STEP_SIZE;
                bigNumbersDelta = Math.floor(bigNumbersDelta / lineHeight) * lineHeight;
                currentLineRelativeOffset -= bigNumbersDelta;
            }
            const linesOffsets = [];
            const verticalCenter = verticalOffset1 + (verticalOffset2 - verticalOffset1) / 2;
            let centeredLineNumber = -1;
            // Figure out how far the lines go
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                if (centeredLineNumber === -1) {
                    const currentLineTop = currentVerticalOffset;
                    const currentLineBottom = currentVerticalOffset + lineHeight;
                    if ((currentLineTop <= verticalCenter && verticalCenter < currentLineBottom) || currentLineTop > verticalCenter) {
                        centeredLineNumber = lineNumber;
                    }
                }
                // Count current line height in the vertical offsets
                currentVerticalOffset += lineHeight;
                linesOffsets[lineNumber - startLineNumber] = currentLineRelativeOffset;
                // Next line starts immediately after this one
                currentLineRelativeOffset += lineHeight;
                while (currentWhitespaceAfterLineNumber === lineNumber) {
                    // Push down next line with the height of the current whitespace
                    currentLineRelativeOffset += currentWhitespaceHeight;
                    // Count current whitespace in the vertical offsets
                    currentVerticalOffset += currentWhitespaceHeight;
                    whitespaceIndex++;
                    if (whitespaceIndex >= whitespaceCount) {
                        currentWhitespaceAfterLineNumber = endLineNumber + 1;
                    }
                    else {
                        currentWhitespaceAfterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex) | 0;
                        currentWhitespaceHeight = this.getHeightForWhitespaceIndex(whitespaceIndex) | 0;
                    }
                }
                if (currentVerticalOffset >= verticalOffset2) {
                    // We have covered the entire viewport area, time to stop
                    endLineNumber = lineNumber;
                    break;
                }
            }
            if (centeredLineNumber === -1) {
                centeredLineNumber = endLineNumber;
            }
            const endLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(endLineNumber) | 0;
            let completelyVisibleStartLineNumber = startLineNumber;
            let completelyVisibleEndLineNumber = endLineNumber;
            if (completelyVisibleStartLineNumber < completelyVisibleEndLineNumber) {
                if (startLineNumberVerticalOffset < verticalOffset1) {
                    completelyVisibleStartLineNumber++;
                }
            }
            if (completelyVisibleStartLineNumber < completelyVisibleEndLineNumber) {
                if (endLineNumberVerticalOffset + lineHeight > verticalOffset2) {
                    completelyVisibleEndLineNumber--;
                }
            }
            return {
                bigNumbersDelta: bigNumbersDelta,
                startLineNumber: startLineNumber,
                endLineNumber: endLineNumber,
                relativeVerticalOffset: linesOffsets,
                centeredLineNumber: centeredLineNumber,
                completelyVisibleStartLineNumber: completelyVisibleStartLineNumber,
                completelyVisibleEndLineNumber: completelyVisibleEndLineNumber
            };
        }
        getVerticalOffsetForWhitespaceIndex(whitespaceIndex) {
            this._checkPendingChanges();
            whitespaceIndex = whitespaceIndex | 0;
            const afterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex);
            let previousLinesHeight;
            if (afterLineNumber >= 1) {
                previousLinesHeight = this._lineHeight * afterLineNumber;
            }
            else {
                previousLinesHeight = 0;
            }
            let previousWhitespacesHeight;
            if (whitespaceIndex > 0) {
                previousWhitespacesHeight = this.getWhitespacesAccumulatedHeight(whitespaceIndex - 1);
            }
            else {
                previousWhitespacesHeight = 0;
            }
            return previousLinesHeight + previousWhitespacesHeight + this._paddingTop;
        }
        getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset) {
            this._checkPendingChanges();
            verticalOffset = verticalOffset | 0;
            let minWhitespaceIndex = 0;
            let maxWhitespaceIndex = this.getWhitespacesCount() - 1;
            if (maxWhitespaceIndex < 0) {
                return -1;
            }
            // Special case: nothing to be found
            const maxWhitespaceVerticalOffset = this.getVerticalOffsetForWhitespaceIndex(maxWhitespaceIndex);
            const maxWhitespaceHeight = this.getHeightForWhitespaceIndex(maxWhitespaceIndex);
            if (verticalOffset >= maxWhitespaceVerticalOffset + maxWhitespaceHeight) {
                return -1;
            }
            while (minWhitespaceIndex < maxWhitespaceIndex) {
                const midWhitespaceIndex = Math.floor((minWhitespaceIndex + maxWhitespaceIndex) / 2);
                const midWhitespaceVerticalOffset = this.getVerticalOffsetForWhitespaceIndex(midWhitespaceIndex);
                const midWhitespaceHeight = this.getHeightForWhitespaceIndex(midWhitespaceIndex);
                if (verticalOffset >= midWhitespaceVerticalOffset + midWhitespaceHeight) {
                    // vertical offset is after whitespace
                    minWhitespaceIndex = midWhitespaceIndex + 1;
                }
                else if (verticalOffset >= midWhitespaceVerticalOffset) {
                    // Hit
                    return midWhitespaceIndex;
                }
                else {
                    // vertical offset is before whitespace, but midWhitespaceIndex might still be what we're searching for
                    maxWhitespaceIndex = midWhitespaceIndex;
                }
            }
            return minWhitespaceIndex;
        }
        /**
         * Get exactly the whitespace that is layouted at `verticalOffset`.
         *
         * @param verticalOffset The vertical offset.
         * @return Precisely the whitespace that is layouted at `verticaloffset` or null.
         */
        getWhitespaceAtVerticalOffset(verticalOffset) {
            this._checkPendingChanges();
            verticalOffset = verticalOffset | 0;
            const candidateIndex = this.getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset);
            if (candidateIndex < 0) {
                return null;
            }
            if (candidateIndex >= this.getWhitespacesCount()) {
                return null;
            }
            const candidateTop = this.getVerticalOffsetForWhitespaceIndex(candidateIndex);
            if (candidateTop > verticalOffset) {
                return null;
            }
            const candidateHeight = this.getHeightForWhitespaceIndex(candidateIndex);
            const candidateId = this.getIdForWhitespaceIndex(candidateIndex);
            const candidateAfterLineNumber = this.getAfterLineNumberForWhitespaceIndex(candidateIndex);
            return {
                id: candidateId,
                afterLineNumber: candidateAfterLineNumber,
                verticalOffset: candidateTop,
                height: candidateHeight
            };
        }
        /**
         * Get a list of whitespaces that are positioned between `verticalOffset1` and `verticalOffset2`.
         *
         * @param verticalOffset1 The beginning of the viewport.
         * @param verticalOffset2 The end of the viewport.
         * @return An array with all the whitespaces in the viewport. If no whitespace is in viewport, the array is empty.
         */
        getWhitespaceViewportData(verticalOffset1, verticalOffset2) {
            this._checkPendingChanges();
            verticalOffset1 = verticalOffset1 | 0;
            verticalOffset2 = verticalOffset2 | 0;
            const startIndex = this.getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset1);
            const endIndex = this.getWhitespacesCount() - 1;
            if (startIndex < 0) {
                return [];
            }
            const result = [];
            for (let i = startIndex; i <= endIndex; i++) {
                const top = this.getVerticalOffsetForWhitespaceIndex(i);
                const height = this.getHeightForWhitespaceIndex(i);
                if (top >= verticalOffset2) {
                    break;
                }
                result.push({
                    id: this.getIdForWhitespaceIndex(i),
                    afterLineNumber: this.getAfterLineNumberForWhitespaceIndex(i),
                    verticalOffset: top,
                    height: height
                });
            }
            return result;
        }
        /**
         * Get all whitespaces.
         */
        getWhitespaces() {
            this._checkPendingChanges();
            return this._arr.slice(0);
        }
        /**
         * The number of whitespaces.
         */
        getWhitespacesCount() {
            this._checkPendingChanges();
            return this._arr.length;
        }
        /**
         * Get the `id` for whitespace at index `index`.
         *
         * @param index The index of the whitespace.
         * @return `id` of whitespace at `index`.
         */
        getIdForWhitespaceIndex(index) {
            this._checkPendingChanges();
            index = index | 0;
            return this._arr[index].id;
        }
        /**
         * Get the `afterLineNumber` for whitespace at index `index`.
         *
         * @param index The index of the whitespace.
         * @return `afterLineNumber` of whitespace at `index`.
         */
        getAfterLineNumberForWhitespaceIndex(index) {
            this._checkPendingChanges();
            index = index | 0;
            return this._arr[index].afterLineNumber;
        }
        /**
         * Get the `height` for whitespace at index `index`.
         *
         * @param index The index of the whitespace.
         * @return `height` of whitespace at `index`.
         */
        getHeightForWhitespaceIndex(index) {
            this._checkPendingChanges();
            index = index | 0;
            return this._arr[index].height;
        }
    }
    exports.LinesLayout = LinesLayout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNMYXlvdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3ZpZXdMYXlvdXQvbGluZXNMYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sY0FBYztRQU1uQjtZQUNDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFTSxNQUFNLENBQUMsQ0FBbUI7WUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxDQUFpQjtZQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRU0sTUFBTSxDQUFDLENBQWlCO1lBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxVQUFVO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRU0sTUFBTSxDQUFDLFdBQXdCO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUN0QixPQUFPO2FBQ1A7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzlCLE1BQU0sT0FBTyxHQUFH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