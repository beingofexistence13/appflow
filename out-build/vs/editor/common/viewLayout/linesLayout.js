/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hY = exports.$gY = void 0;
    class PendingChanges {
        constructor() {
            this.c = false;
            this.d = [];
            this.e = [];
            this.f = [];
        }
        insert(x) {
            this.c = true;
            this.d.push(x);
        }
        change(x) {
            this.c = true;
            this.e.push(x);
        }
        remove(x) {
            this.c = true;
            this.f.push(x);
        }
        mustCommit() {
            return this.c;
        }
        commit(linesLayout) {
            if (!this.c) {
                return;
            }
            const inserts = this.d;
            const changes = this.e;
            const removes = this.f;
            this.c = false;
            this.d = [];
            this.e = [];
            this.f = [];
            linesLayout._commitPendingChanges(inserts, changes, removes);
        }
    }
    class $gY {
        constructor(id, afterLineNumber, ordinal, height, minWidth) {
            this.id = id;
            this.afterLineNumber = afterLineNumber;
            this.ordinal = ordinal;
            this.height = height;
            this.minWidth = minWidth;
            this.prefixSum = 0;
        }
    }
    exports.$gY = $gY;
    /**
     * Layouting of objects that take vertical space (by having a height) and push down other objects.
     *
     * These objects are basically either text (lines) or spaces between those lines (whitespaces).
     * This provides commodity operations for working with lines that contain whitespace that pushes lines lower (vertically).
     */
    class $hY {
        static { this.c = 0; }
        constructor(lineCount, lineHeight, paddingTop, paddingBottom) {
            this.d = strings.$df(++$hY.c);
            this.e = new PendingChanges();
            this.f = 0;
            this.g = [];
            this.h = -1;
            this.j = -1; /* marker for not being computed */
            this.k = lineCount;
            this.l = lineHeight;
            this.m = paddingTop;
            this.n = paddingBottom;
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
            this.o();
            this.l = lineHeight;
        }
        /**
         * Changes the padding used to calculate vertical offsets.
         */
        setPadding(paddingTop, paddingBottom) {
            this.m = paddingTop;
            this.n = paddingBottom;
        }
        /**
         * Set the number of lines.
         *
         * @param lineCount New number of lines.
         */
        onFlushed(lineCount) {
            this.o();
            this.k = lineCount;
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
                        const id = this.d + (++this.f);
                        this.e.insert(new $gY(id, afterLineNumber, ordinal, heightInPx, minWidth));
                        return id;
                    },
                    changeOneWhitespace: (id, newAfterLineNumber, newHeight) => {
                        hadAChange = true;
                        newAfterLineNumber = newAfterLineNumber | 0;
                        newHeight = newHeight | 0;
                        this.e.change({ id, newAfterLineNumber, newHeight });
                    },
                    removeWhitespace: (id) => {
                        hadAChange = true;
                        this.e.remove({ id });
                    }
                };
                callback(accessor);
            }
            finally {
                this.e.commit(this);
            }
            return hadAChange;
        }
        _commitPendingChanges(inserts, changes, removes) {
            if (inserts.length > 0 || removes.length > 0) {
                this.j = -1; /* marker for not being computed */
            }
            if (inserts.length + changes.length + removes.length <= 1) {
                // when only one thing happened, handle it "delicately"
                for (const insert of inserts) {
                    this.p(insert);
                }
                for (const change of changes) {
                    this.r(change.id, change.newAfterLineNumber, change.newHeight);
                }
                for (const remove of removes) {
                    const index = this.q(remove.id);
                    if (index === -1) {
                        continue;
                    }
                    this.s(index);
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
            const result = applyRemoveAndChange(this.g).concat(applyRemoveAndChange(inserts));
            result.sort((a, b) => {
                if (a.afterLineNumber === b.afterLineNumber) {
                    return a.ordinal - b.ordinal;
                }
                return a.afterLineNumber - b.afterLineNumber;
            });
            this.g = result;
            this.h = -1;
        }
        o() {
            if (this.e.mustCommit()) {
                this.e.commit(this);
            }
        }
        p(whitespace) {
            const insertIndex = $hY.findInsertionIndex(this.g, whitespace.afterLineNumber, whitespace.ordinal);
            this.g.splice(insertIndex, 0, whitespace);
            this.h = Math.min(this.h, insertIndex - 1);
        }
        q(id) {
            const arr = this.g;
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i].id === id) {
                    return i;
                }
            }
            return -1;
        }
        r(id, newAfterLineNumber, newHeight) {
            const index = this.q(id);
            if (index === -1) {
                return;
            }
            if (this.g[index].height !== newHeight) {
                this.g[index].height = newHeight;
                this.h = Math.min(this.h, index - 1);
            }
            if (this.g[index].afterLineNumber !== newAfterLineNumber) {
                // `afterLineNumber` changed for this whitespace
                // Record old whitespace
                const whitespace = this.g[index];
                // Since changing `afterLineNumber` can trigger a reordering, we're gonna remove this whitespace
                this.s(index);
                whitespace.afterLineNumber = newAfterLineNumber;
                // And add it again
                this.p(whitespace);
            }
        }
        s(removeIndex) {
            this.g.splice(removeIndex, 1);
            this.h = Math.min(this.h, removeIndex - 1);
        }
        /**
         * Notify the layouter that lines have been deleted (a continuous zone of lines).
         *
         * @param fromLineNumber The line number at which the deletion started, inclusive
         * @param toLineNumber The line number at which the deletion ended, inclusive
         */
        onLinesDeleted(fromLineNumber, toLineNumber) {
            this.o();
            fromLineNumber = fromLineNumber | 0;
            toLineNumber = toLineNumber | 0;
            this.k -= (toLineNumber - fromLineNumber + 1);
            for (let i = 0, len = this.g.length; i < len; i++) {
                const afterLineNumber = this.g[i].afterLineNumber;
                if (fromLineNumber <= afterLineNumber && afterLineNumber <= toLineNumber) {
                    // The line this whitespace was after has been deleted
                    //  => move whitespace to before first deleted line
                    this.g[i].afterLineNumber = fromLineNumber - 1;
                }
                else if (afterLineNumber > toLineNumber) {
                    // The line this whitespace was after has been moved up
                    //  => move whitespace up
                    this.g[i].afterLineNumber -= (toLineNumber - fromLineNumber + 1);
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
            this.o();
            fromLineNumber = fromLineNumber | 0;
            toLineNumber = toLineNumber | 0;
            this.k += (toLineNumber - fromLineNumber + 1);
            for (let i = 0, len = this.g.length; i < len; i++) {
                const afterLineNumber = this.g[i].afterLineNumber;
                if (fromLineNumber <= afterLineNumber) {
                    this.g[i].afterLineNumber += (toLineNumber - fromLineNumber + 1);
                }
            }
        }
        /**
         * Get the sum of all the whitespaces.
         */
        getWhitespacesTotalHeight() {
            this.o();
            if (this.g.length === 0) {
                return 0;
            }
            return this.getWhitespacesAccumulatedHeight(this.g.length - 1);
        }
        /**
         * Return the sum of the heights of the whitespaces at [0..index].
         * This includes the whitespace at `index`.
         *
         * @param index The index of the whitespace.
         * @return The sum of the heights of all whitespaces before the one at `index`, including the one at `index`.
         */
        getWhitespacesAccumulatedHeight(index) {
            this.o();
            index = index | 0;
            let startIndex = Math.max(0, this.h + 1);
            if (startIndex === 0) {
                this.g[0].prefixSum = this.g[0].height;
                startIndex++;
            }
            for (let i = startIndex; i <= index; i++) {
                this.g[i].prefixSum = this.g[i - 1].prefixSum + this.g[i].height;
            }
            this.h = Math.max(this.h, index);
            return this.g[index].prefixSum;
        }
        /**
         * Get the sum of heights for all objects.
         *
         * @return The sum of heights for all objects.
         */
        getLinesTotalHeight() {
            this.o();
            const linesHeight = this.l * this.k;
            const whitespacesHeight = this.getWhitespacesTotalHeight();
            return linesHeight + whitespacesHeight + this.m + this.n;
        }
        /**
         * Returns the accumulated height of whitespaces before the given line number.
         *
         * @param lineNumber The line number
         */
        getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber) {
            this.o();
            lineNumber = lineNumber | 0;
            const lastWhitespaceBeforeLineNumber = this.t(lineNumber);
            if (lastWhitespaceBeforeLineNumber === -1) {
                return 0;
            }
            return this.getWhitespacesAccumulatedHeight(lastWhitespaceBeforeLineNumber);
        }
        t(lineNumber) {
            lineNumber = lineNumber | 0;
            // Find the whitespace before line number
            const arr = this.g;
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
        u(lineNumber) {
            lineNumber = lineNumber | 0;
            const lastWhitespaceBeforeLineNumber = this.t(lineNumber);
            const firstWhitespaceAfterLineNumber = lastWhitespaceBeforeLineNumber + 1;
            if (firstWhitespaceAfterLineNumber < this.g.length) {
                return firstWhitespaceAfterLineNumber;
            }
            return -1;
        }
        /**
         * Find the index of the first whitespace which has `afterLineNumber` >= `lineNumber`.
         * @return The index of the first whitespace with `afterLineNumber` >= `lineNumber` or -1 if no whitespace is found.
         */
        getFirstWhitespaceIndexAfterLineNumber(lineNumber) {
            this.o();
            lineNumber = lineNumber | 0;
            return this.u(lineNumber);
        }
        /**
         * Get the vertical offset (the sum of heights for all objects above) a certain line number.
         *
         * @param lineNumber The line number
         * @return The sum of heights for all objects above `lineNumber`.
         */
        getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
            this.o();
            lineNumber = lineNumber | 0;
            let previousLinesHeight;
            if (lineNumber > 1) {
                previousLinesHeight = this.l * (lineNumber - 1);
            }
            else {
                previousLinesHeight = 0;
            }
            const previousWhitespacesHeight = this.getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber - (includeViewZones ? 1 : 0));
            return previousLinesHeight + previousWhitespacesHeight + this.m;
        }
        /**
         * Get the vertical offset (the sum of heights for all objects above) a certain line number.
         *
         * @param lineNumber The line number
         * @return The sum of heights for all objects above `lineNumber`.
         */
        getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
            this.o();
            lineNumber = lineNumber | 0;
            const previousLinesHeight = this.l * lineNumber;
            const previousWhitespacesHeight = this.getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber + (includeViewZones ? 1 : 0));
            return previousLinesHeight + previousWhitespacesHeight + this.m;
        }
        /**
         * Returns if there is any whitespace in the document.
         */
        hasWhitespace() {
            this.o();
            return this.getWhitespacesCount() > 0;
        }
        /**
         * The maximum min width for all whitespaces.
         */
        getWhitespaceMinWidth() {
            this.o();
            if (this.j === -1) {
                let minWidth = 0;
                for (let i = 0, len = this.g.length; i < len; i++) {
                    minWidth = Math.max(minWidth, this.g[i].minWidth);
                }
                this.j = minWidth;
            }
            return this.j;
        }
        /**
         * Check if `verticalOffset` is below all lines.
         */
        isAfterLines(verticalOffset) {
            this.o();
            const totalHeight = this.getLinesTotalHeight();
            return verticalOffset > totalHeight;
        }
        isInTopPadding(verticalOffset) {
            if (this.m === 0) {
                return false;
            }
            this.o();
            return (verticalOffset < this.m);
        }
        isInBottomPadding(verticalOffset) {
            if (this.n === 0) {
                return false;
            }
            this.o();
            const totalHeight = this.getLinesTotalHeight();
            return (verticalOffset >= totalHeight - this.n);
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
            this.o();
            verticalOffset = verticalOffset | 0;
            if (verticalOffset < 0) {
                return 1;
            }
            const linesCount = this.k | 0;
            const lineHeight = this.l;
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
            this.o();
            verticalOffset1 = verticalOffset1 | 0;
            verticalOffset2 = verticalOffset2 | 0;
            const lineHeight = this.l;
            // Find first line number
            // We don't live in a perfect world, so the line number might start before or after verticalOffset1
            const startLineNumber = this.getLineNumberAtOrAfterVerticalOffset(verticalOffset1) | 0;
            const startLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(startLineNumber) | 0;
            let endLineNumber = this.k | 0;
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
            this.o();
            whitespaceIndex = whitespaceIndex | 0;
            const afterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex);
            let previousLinesHeight;
            if (afterLineNumber >= 1) {
                previousLinesHeight = this.l * afterLineNumber;
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
            return previousLinesHeight + previousWhitespacesHeight + this.m;
        }
        getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset) {
            this.o();
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
            this.o();
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
            this.o();
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
            this.o();
            return this.g.slice(0);
        }
        /**
         * The number of whitespaces.
         */
        getWhitespacesCount() {
            this.o();
            return this.g.length;
        }
        /**
         * Get the `id` for whitespace at index `index`.
         *
         * @param index The index of the whitespace.
         * @return `id` of whitespace at `index`.
         */
        getIdForWhitespaceIndex(index) {
            this.o();
            index = index | 0;
            return this.g[index].id;
        }
        /**
         * Get the `afterLineNumber` for whitespace at index `index`.
         *
         * @param index The index of the whitespace.
         * @return `afterLineNumber` of whitespace at `index`.
         */
        getAfterLineNumberForWhitespaceIndex(index) {
            this.o();
            index = index | 0;
            return this.g[index].afterLineNumber;
        }
        /**
         * Get the `height` for whitespace at index `index`.
         *
         * @param index The index of the whitespace.
         * @return `height` of whitespace at `index`.
         */
        getHeightForWhitespaceIndex(index) {
            this.o();
            index = index | 0;
            return this.g[index].height;
        }
    }
    exports.$hY = $hY;
});
//# sourceMappingURL=linesLayout.js.map