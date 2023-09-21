/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.guessIndentation = void 0;
    class SpacesDiffResult {
        constructor() {
            this.spacesDiff = 0;
            this.looksLikeAlignment = false;
        }
    }
    /**
     * Compute the diff in spaces between two line's indentation.
     */
    function spacesDiff(a, aLength, b, bLength, result) {
        result.spacesDiff = 0;
        result.looksLikeAlignment = false;
        // This can go both ways (e.g.):
        //  - a: "\t"
        //  - b: "\t    "
        //  => This should count 1 tab and 4 spaces
        let i;
        for (i = 0; i < aLength && i < bLength; i++) {
            const aCharCode = a.charCodeAt(i);
            const bCharCode = b.charCodeAt(i);
            if (aCharCode !== bCharCode) {
                break;
            }
        }
        let aSpacesCnt = 0, aTabsCount = 0;
        for (let j = i; j < aLength; j++) {
            const aCharCode = a.charCodeAt(j);
            if (aCharCode === 32 /* CharCode.Space */) {
                aSpacesCnt++;
            }
            else {
                aTabsCount++;
            }
        }
        let bSpacesCnt = 0, bTabsCount = 0;
        for (let j = i; j < bLength; j++) {
            const bCharCode = b.charCodeAt(j);
            if (bCharCode === 32 /* CharCode.Space */) {
                bSpacesCnt++;
            }
            else {
                bTabsCount++;
            }
        }
        if (aSpacesCnt > 0 && aTabsCount > 0) {
            return;
        }
        if (bSpacesCnt > 0 && bTabsCount > 0) {
            return;
        }
        const tabsDiff = Math.abs(aTabsCount - bTabsCount);
        const spacesDiff = Math.abs(aSpacesCnt - bSpacesCnt);
        if (tabsDiff === 0) {
            // check if the indentation difference might be caused by alignment reasons
            // sometime folks like to align their code, but this should not be used as a hint
            result.spacesDiff = spacesDiff;
            if (spacesDiff > 0 && 0 <= bSpacesCnt - 1 && bSpacesCnt - 1 < a.length && bSpacesCnt < b.length) {
                if (b.charCodeAt(bSpacesCnt) !== 32 /* CharCode.Space */ && a.charCodeAt(bSpacesCnt - 1) === 32 /* CharCode.Space */) {
                    if (a.charCodeAt(a.length - 1) === 44 /* CharCode.Comma */) {
                        // This looks like an alignment desire: e.g.
                        // const a = b + c,
                        //       d = b - c;
                        result.looksLikeAlignment = true;
                    }
                }
            }
            return;
        }
        if (spacesDiff % tabsDiff === 0) {
            result.spacesDiff = spacesDiff / tabsDiff;
            return;
        }
    }
    function guessIndentation(source, defaultTabSize, defaultInsertSpaces) {
        // Look at most at the first 10k lines
        const linesCount = Math.min(source.getLineCount(), 10000);
        let linesIndentedWithTabsCount = 0; // number of lines that contain at least one tab in indentation
        let linesIndentedWithSpacesCount = 0; // number of lines that contain only spaces in indentation
        let previousLineText = ''; // content of latest line that contained non-whitespace chars
        let previousLineIndentation = 0; // index at which latest line contained the first non-whitespace char
        const ALLOWED_TAB_SIZE_GUESSES = [2, 4, 6, 8, 3, 5, 7]; // prefer even guesses for `tabSize`, limit to [2, 8].
        const MAX_ALLOWED_TAB_SIZE_GUESS = 8; // max(ALLOWED_TAB_SIZE_GUESSES) = 8
        const spacesDiffCount = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // `tabSize` scores
        const tmp = new SpacesDiffResult();
        for (let lineNumber = 1; lineNumber <= linesCount; lineNumber++) {
            const currentLineLength = source.getLineLength(lineNumber);
            const currentLineText = source.getLineContent(lineNumber);
            // if the text buffer is chunk based, so long lines are cons-string, v8 will flattern the string when we check charCode.
            // checking charCode on chunks directly is cheaper.
            const useCurrentLineText = (currentLineLength <= 65536);
            let currentLineHasContent = false; // does `currentLineText` contain non-whitespace chars
            let currentLineIndentation = 0; // index at which `currentLineText` contains the first non-whitespace char
            let currentLineSpacesCount = 0; // count of spaces found in `currentLineText` indentation
            let currentLineTabsCount = 0; // count of tabs found in `currentLineText` indentation
            for (let j = 0, lenJ = currentLineLength; j < lenJ; j++) {
                const charCode = (useCurrentLineText ? currentLineText.charCodeAt(j) : source.getLineCharCode(lineNumber, j));
                if (charCode === 9 /* CharCode.Tab */) {
                    currentLineTabsCount++;
                }
                else if (charCode === 32 /* CharCode.Space */) {
                    currentLineSpacesCount++;
                }
                else {
                    // Hit non whitespace character on this line
                    currentLineHasContent = true;
                    currentLineIndentation = j;
                    break;
                }
            }
            // Ignore empty or only whitespace lines
            if (!currentLineHasContent) {
                continue;
            }
            if (currentLineTabsCount > 0) {
                linesIndentedWithTabsCount++;
            }
            else if (currentLineSpacesCount > 1) {
                linesIndentedWithSpacesCount++;
            }
            spacesDiff(previousLineText, previousLineIndentation, currentLineText, currentLineIndentation, tmp);
            if (tmp.looksLikeAlignment) {
                // if defaultInsertSpaces === true && the spaces count == tabSize, we may want to count it as valid indentation
                //
                // - item1
                //   - item2
                //
                // otherwise skip this line entirely
                //
                // const a = 1,
                //       b = 2;
                if (!(defaultInsertSpaces && defaultTabSize === tmp.spacesDiff)) {
                    continue;
                }
            }
            const currentSpacesDiff = tmp.spacesDiff;
            if (currentSpacesDiff <= MAX_ALLOWED_TAB_SIZE_GUESS) {
                spacesDiffCount[currentSpacesDiff]++;
            }
            previousLineText = currentLineText;
            previousLineIndentation = currentLineIndentation;
        }
        let insertSpaces = defaultInsertSpaces;
        if (linesIndentedWithTabsCount !== linesIndentedWithSpacesCount) {
            insertSpaces = (linesIndentedWithTabsCount < linesIndentedWithSpacesCount);
        }
        let tabSize = defaultTabSize;
        // Guess tabSize only if inserting spaces...
        if (insertSpaces) {
            let tabSizeScore = (insertSpaces ? 0 : 0.1 * linesCount);
            // console.log("score threshold: " + tabSizeScore);
            ALLOWED_TAB_SIZE_GUESSES.forEach((possibleTabSize) => {
                const possibleTabSizeScore = spacesDiffCount[possibleTabSize];
                if (possibleTabSizeScore > tabSizeScore) {
                    tabSizeScore = possibleTabSizeScore;
                    tabSize = possibleTabSize;
                }
            });
            // Let a tabSize of 2 win even if it is not the maximum
            // (only in case 4 was guessed)
            if (tabSize === 4 && spacesDiffCount[4] > 0 && spacesDiffCount[2] > 0 && spacesDiffCount[2] >= spacesDiffCount[4] / 2) {
                tabSize = 2;
            }
        }
        // console.log('--------------------------');
        // console.log('linesIndentedWithTabsCount: ' + linesIndentedWithTabsCount + ', linesIndentedWithSpacesCount: ' + linesIndentedWithSpacesCount);
        // console.log('spacesDiffCount: ' + spacesDiffCount);
        // console.log('tabSize: ' + tabSize + ', tabSizeScore: ' + tabSizeScore);
        return {
            insertSpaces: insertSpaces,
            tabSize: tabSize
        };
    }
    exports.guessIndentation = guessIndentation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50YXRpb25HdWVzc2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9pbmRlbnRhdGlvbkd1ZXNzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQU0sZ0JBQWdCO1FBQXRCO1lBQ1EsZUFBVSxHQUFXLENBQUMsQ0FBQztZQUN2Qix1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFDNUMsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDSCxTQUFTLFVBQVUsQ0FBQyxDQUFTLEVBQUUsT0FBZSxFQUFFLENBQVMsRUFBRSxPQUFlLEVBQUUsTUFBd0I7UUFFbkcsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztRQUVsQyxnQ0FBZ0M7UUFDaEMsYUFBYTtRQUNiLGlCQUFpQjtRQUNqQiwyQ0FBMkM7UUFFM0MsSUFBSSxDQUFTLENBQUM7UUFFZCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsQyxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLE1BQU07YUFDTjtTQUNEO1FBRUQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNqQyxNQUFNLFNBQVMsR0FBRyxDQUFD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