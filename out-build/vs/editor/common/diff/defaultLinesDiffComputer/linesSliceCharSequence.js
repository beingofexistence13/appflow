/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/editor/common/core/offsetRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/diff/defaultLinesDiffComputer/utils"], function (require, exports, arraysFind_1, offsetRange_1, position_1, range_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OY = void 0;
    class $OY {
        constructor(lines, lineRange, considerWhitespaceChanges) {
            // This slice has to have lineRange.length many \n! (otherwise diffing against an empty slice will be problematic)
            // (Unless it covers the entire document, in that case the other slice also has to cover the entire document ands it's okay)
            this.lines = lines;
            this.considerWhitespaceChanges = considerWhitespaceChanges;
            this.b = [];
            this.c = [];
            // To account for trimming
            this.d = [];
            // If the slice covers the end, but does not start at the beginning, we include just the \n of the previous line.
            let trimFirstLineFully = false;
            if (lineRange.start > 0 && lineRange.endExclusive >= lines.length) {
                lineRange = new offsetRange_1.$rs(lineRange.start - 1, lineRange.endExclusive);
                trimFirstLineFully = true;
            }
            this.lineRange = lineRange;
            this.c[0] = 0;
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
                this.d.push(offset);
                for (let i = 0; i < line.length; i++) {
                    this.b.push(line.charCodeAt(i));
                }
                // Don't add an \n that does not exist in the document.
                if (i < lines.length - 1) {
                    this.b.push('\n'.charCodeAt(0));
                    this.c[i - this.lineRange.start + 1] = this.b.length;
                }
            }
            // To account for the last line
            this.d.push(0);
        }
        toString() {
            return `Slice: "${this.text}"`;
        }
        get text() {
            return this.getText(new offsetRange_1.$rs(0, this.length));
        }
        getText(range) {
            return this.b.slice(range.start, range.endExclusive).map(e => String.fromCharCode(e)).join('');
        }
        getElement(offset) {
            return this.b[offset];
        }
        get length() {
            return this.b.length;
        }
        getBoundaryScore(length) {
            //   a   b   c   ,           d   e   f
            // 11  0   0   12  15  6   13  0   0   11
            const prevCategory = getCategory(length > 0 ? this.b[length - 1] : -1);
            const nextCategory = getCategory(length < this.b.length ? this.b[length] : -1);
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
                return new position_1.$js(this.lineRange.start + 1, 1);
            }
            const i = (0, arraysFind_1.$gb)(this.c, (value) => value <= offset);
            return new position_1.$js(this.lineRange.start + i + 1, offset - this.c[i] + this.d[i] + 1);
        }
        translateRange(range) {
            return range_1.$ks.fromPositions(this.translateOffset(range.start), this.translateOffset(range.endExclusive));
        }
        /**
         * Finds the word that contains the character at the given offset
         */
        findWordContaining(offset) {
            if (offset < 0 || offset >= this.b.length) {
                return undefined;
            }
            if (!isWordChar(this.b[offset])) {
                return undefined;
            }
            // find start
            let start = offset;
            while (start > 0 && isWordChar(this.b[start - 1])) {
                start--;
            }
            // find end
            let end = offset;
            while (end < this.b.length && isWordChar(this.b[end])) {
                end++;
            }
            return new offsetRange_1.$rs(start, end);
        }
        countLinesIn(range) {
            return this.translateOffset(range.endExclusive).lineNumber - this.translateOffset(range.start).lineNumber;
        }
        isStronglyEqual(offset1, offset2) {
            return this.b[offset1] === this.b[offset2];
        }
        extendToFullLines(range) {
            const start = (0, arraysFind_1.$fb)(this.c, x => x <= range.start) ?? 0;
            const end = (0, arraysFind_1.$hb)(this.c, x => range.endExclusive <= x) ?? this.b.length;
            return new offsetRange_1.$rs(start, end);
        }
    }
    exports.$OY = $OY;
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
        else if ((0, utils_1.$KY)(charCode)) {
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
//# sourceMappingURL=linesSliceCharSequence.js.map