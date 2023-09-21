/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/editor/common/core/offsetRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/diff/defaultLinesDiffComputer/utils"], function (require, exports, arraysFind_1, offsetRange_1, position_1, range_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinesSliceCharSequence = void 0;
    class LinesSliceCharSequence {
        constructor(lines, lineRange, considerWhitespaceChanges) {
            // This slice has to have lineRange.length many \n! (otherwise diffing against an empty slice will be problematic)
            // (Unless it covers the entire document, in that case the other slice also has to cover the entire document ands it's okay)
            this.lines = lines;
            this.considerWhitespaceChanges = considerWhitespaceChanges;
            this.elements = [];
            this.firstCharOffsetByLine = [];
            // To account for trimming
            this.additionalOffsetByLine = [];
            // If the slice covers the end, but does not start at the beginning, we include just the \n of the previous line.
            let trimFirstLineFully = false;
            if (lineRange.start > 0 && lineRange.endExclusive >= lines.length) {
                lineRange = new offsetRange_1.OffsetRange(lineRange.start - 1, lineRange.endExclusive);
                trimFirstLineFully = true;
            }
            this.lineRange = lineRange;
            this.firstCharOffsetByLine[0] = 0;
            for (let i = this.lineRange.start; i < this.lineRange.endExclusive; i++) {
                let line = lines[i];
                let offset = 0;
                if (trimFirstLineFully) {
                    offset = line.length;
                    line = '';
                    trimFirstLineFully = false;
                }
                else if (!considerWhitespaceChanges) {
                    const trimmedStartLine = line.trimStart();
                    offset = line.length - trimmedStartLine.length;
                    line = trimmedStartLine.trimEnd();
                }
                this.additionalOffsetByLine.push(offset);
                for (let i = 0; i < line.length; i++) {
                    this.elements.push(line.charCodeAt(i));
                }
                // Don't add an \n that does not exist in the document.
                if (i < lines.length - 1) {
                    this.elements.push('\n'.charCodeAt(0));
                    this.firstCharOffsetByLine[i - this.lineRange.start + 1] = this.elements.length;
                }
            }
            // To account for the last line
            this.additionalOffsetByLine.push(0);
        }
        toString() {
            return `Slice: "${this.text}"`;
        }
        get text() {
            return this.getText(new offsetRange_1.OffsetRange(0, this.length));
        }
        getText(range) {
            return this.elements.slice(range.start, range.endExclusive).map(e => String.fromCharCode(e)).join('');
        }
        getElement(offset) {
            return this.elements[offset];
        }
        get length() {
            return this.elements.length;
        }
        getBoundaryScore(length) {
            //   a   b   c   ,           d   e   f
            // 11  0   0   12  15  6   13  0   0   11
            const prevCategory = getCategory(length > 0 ? this.elements[length - 1] : -1);
            const nextCategory = getCategory(length < this.elements.length ? this.elements[length] : -1);
            if (prevCategory === 6 /* CharBoundaryCategory.LineBreakCR */ && nextCategory === 7 /* CharBoundaryCategory.LineBreakLF */) {
                // don't break between \r and \n
                return 0;
            }
            let score = 0;
            if (prevCategory !== nextCategory) {
                score += 10;
                if (prevCategory === 0 /* CharBoundaryCategory.WordLower */ && nextCategory === 1 /* CharBoundaryCategory.WordUpper */) {
                    score += 1;
                }
            }
            score += getCategoryBoundaryScore(prevCategory);
            score += getCategoryBoundaryScore(nextCategory);
            return score;
        }
        translateOffset(offset) {
            // find smallest i, so that lineBreakOffsets[i] <= offset using binary search
            if (this.lineRange.isEmpty) {
                return new position_1.Position(this.lineRange.start + 1, 1);
            }
            const i = (0, arraysFind_1.findLastIdxMonotonous)(this.firstCharOffsetByLine, (value) => value <= offset);
            return new position_1.Position(this.lineRange.start + i + 1, offset - this.firstCharOffsetByLine[i] + this.additionalOffsetByLine[i] + 1);
        }
        translateRange(range) {
            return range_1.Range.fromPositions(this.translateOffset(range.start), this.translateOffset(range.endExclusive));
        }
        /**
         * Finds the word that contains the character at the given offset
         */
        findWordContaining(offset) {
            if (offset < 0 || offset >= this.elements.length) {
                return undefined;
            }
            if (!isWordChar(this.elements[offset])) {
                return undefined;
            }
            // find start
            let start = offset;
            while (start > 0 && isWordChar(this.elements[start - 1])) {
                start--;
            }
            // find end
            let end = offset;
            while (end < this.elements.length && isWordChar(this.elements[end])) {
                end++;
            }
            return new offsetRange_1.OffsetRange(start, end);
        }
        countLinesIn(range) {
            return this.translateOffset(range.endExclusive).lineNumber - this.translateOffset(range.start).lineNumber;
        }
        isStronglyEqual(offset1, offset2) {
            return this.elements[offset1] === this.elements[offset2];
        }
        extendToFullLines(range) {
            const start = (0, arraysFind_1.findLastMonotonous)(this.firstCharOffsetByLine, x => x <= range.start) ?? 0;
            const end = (0, arraysFind_1.findFirstMonotonous)(this.firstCharOffsetByLine, x => range.endExclusive <= x) ?? this.elements.length;
            return new offsetRange_1.OffsetRange(start, end);
        }
    }
    exports.LinesSliceCharSequence = LinesSliceCharSequence;
    function isWordChar(charCode) {
        return charCode >= 97 /* CharCode.a */ && charCode <= 122 /* CharCode.z */
            || charCode >= 65 /* CharCode.A */ && charCode <= 90 /* CharCode.Z */
            || charCode >= 48 /* CharCode.Digit0 */ && charCode <= 57 /* CharCode.Digit9 */;
    }
    var CharBoundaryCategory;
    (function (CharBoundaryCategory) {
        CharBoundaryCategory[CharBoundaryCategory["WordLower"] = 0] = "WordLower";
        CharBoundaryCategory[CharBoundaryCategory["WordUpper"] = 1] = "WordUpper";
        CharBoundaryCategory[CharBoundaryCategory["WordNumber"] = 2] = "WordNumber";
        CharBoundaryCategory[CharBoundaryCategory["End"] = 3] = "End";
        CharBoundaryCategory[CharBoundaryCategory["Other"] = 4] = "Other";
        CharBoundaryCategory[CharBoundaryCategory["Space"] = 5] = "Space";
        CharBoundaryCategory[CharBoundaryCategory["LineBreakCR"] = 6] = "LineBreakCR";
        CharBoundaryCategory[CharBoundaryCategory["LineBreakLF"] = 7] = "LineBreakLF";
    })(CharBoundaryCategory || (CharBoundaryCategory = {}));
    const score = {
        [0 /* CharBoundaryCategory.WordLower */]: 0,
        [1 /* CharBoundaryCategory.WordUpper */]: 0,
        [2 /* CharBoundaryCategory.WordNumber */]: 0,
        [3 /* CharBoundaryCategory.End */]: 10,
        [4 /* CharBoundaryCategory.Other */]: 2,
        [5 /* CharBoundaryCategory.Space */]: 3,
        [6 /* CharBoundaryCategory.LineBreakCR */]: 10,
        [7 /* CharBoundaryCategory.LineBreakLF */]: 10,
    };
    function getCategoryBoundaryScore(category) {
        return score[category];
    }
    function getCategory(charCode) {
        if (charCode === 10 /* CharCode.LineFeed */) {
            return 7 /* CharBoundaryCategory.LineBreakLF */;
        }
        else if (charCode === 13 /* CharCode.CarriageReturn */) {
            return 6 /* CharBoundaryCategory.LineBreakCR */;
        }
        else if ((0, utils_1.isSpace)(charCode)) {
            return 5 /* CharBoundaryCategory.Space */;
        }
        else if (charCode >= 97 /* CharCode.a */ && charCode <= 122 /* CharCode.z */) {
            return 0 /* CharBoundaryCategory.WordLower */;
        }
        else if (charCode >= 65 /* CharCode.A */ && charCode <= 90 /* CharCode.Z */) {
            return 1 /* CharBoundaryCategory.WordUpper */;
        }
        else if (charCode >= 48 /* CharCode.Digit0 */ && charCode <= 57 /* CharCode.Digit9 */) {
            return 2 /* CharBoundaryCategory.WordNumber */;
        }
        else if (charCode === -1) {
            return 3 /* CharBoundaryCategory.End */;
        }
        else {
            return 4 /* CharBoundaryCategory.Other */;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNTbGljZUNoYXJTZXF1ZW5jZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vZGlmZi9kZWZhdWx0TGluZXNEaWZmQ29tcHV0ZXIvbGluZXNTbGljZUNoYXJTZXF1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBYSxzQkFBc0I7UUFPbEMsWUFBNEIsS0FBZSxFQUFFLFNBQXNCLEVBQWtCLHlCQUFrQztZQUN0SCxrSEFBa0g7WUFDbEgsNEhBQTRIO1lBRmpHLFVBQUssR0FBTCxLQUFLLENBQVU7WUFBMEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFTO1lBTnRHLGFBQVEsR0FBYSxFQUFFLENBQUM7WUFDeEIsMEJBQXFCLEdBQWEsRUFBRSxDQUFDO1lBRXRELDBCQUEwQjtZQUNULDJCQUFzQixHQUFhLEVBQUUsQ0FBQztZQU10RCxpSEFBaUg7WUFDakgsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xFLFNBQVMsR0FBRyxJQUFJLHlCQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN6RSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7YUFDMUI7WUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUUzQixJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsRUFB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