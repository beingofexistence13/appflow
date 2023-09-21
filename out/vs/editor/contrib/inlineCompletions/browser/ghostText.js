/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/contrib/inlineCompletions/browser/utils"], function (require, exports, range_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ghostTextOrReplacementEquals = exports.GhostTextReplacement = exports.GhostTextPart = exports.GhostText = void 0;
    class GhostText {
        constructor(lineNumber, parts) {
            this.lineNumber = lineNumber;
            this.parts = parts;
        }
        equals(other) {
            return this.lineNumber === other.lineNumber &&
                this.parts.length === other.parts.length &&
                this.parts.every((part, index) => part.equals(other.parts[index]));
        }
        /**
         * Only used for testing/debugging.
        */
        render(documentText, debug = false) {
            const l = this.lineNumber;
            return (0, utils_1.applyEdits)(documentText, [
                ...this.parts.map(p => ({
                    range: { startLineNumber: l, endLineNumber: l, startColumn: p.column, endColumn: p.column },
                    text: debug ? `[${p.lines.join('\n')}]` : p.lines.join('\n')
                })),
            ]);
        }
        renderForScreenReader(lineText) {
            if (this.parts.length === 0) {
                return '';
            }
            const lastPart = this.parts[this.parts.length - 1];
            const cappedLineText = lineText.substr(0, lastPart.column - 1);
            const text = (0, utils_1.applyEdits)(cappedLineText, this.parts.map(p => ({
                range: { startLineNumber: 1, endLineNumber: 1, startColumn: p.column, endColumn: p.column },
                text: p.lines.join('\n')
            })));
            return text.substring(this.parts[0].column - 1);
        }
        isEmpty() {
            return this.parts.every(p => p.lines.length === 0);
        }
        get lineCount() {
            return 1 + this.parts.reduce((r, p) => r + p.lines.length - 1, 0);
        }
    }
    exports.GhostText = GhostText;
    class GhostTextPart {
        constructor(column, lines, 
        /**
         * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
        */
        preview) {
            this.column = column;
            this.lines = lines;
            this.preview = preview;
        }
        equals(other) {
            return this.column === other.column &&
                this.lines.length === other.lines.length &&
                this.lines.every((line, index) => line === other.lines[index]);
        }
    }
    exports.GhostTextPart = GhostTextPart;
    class GhostTextReplacement {
        constructor(lineNumber, columnRange, newLines, additionalReservedLineCount = 0) {
            this.lineNumber = lineNumber;
            this.columnRange = columnRange;
            this.newLines = newLines;
            this.additionalReservedLineCount = additionalReservedLineCount;
            this.parts = [
                new GhostTextPart(this.columnRange.endColumnExclusive, this.newLines, false),
            ];
        }
        renderForScreenReader(_lineText) {
            return this.newLines.join('\n');
        }
        render(documentText, debug = false) {
            const replaceRange = this.columnRange.toRange(this.lineNumber);
            if (debug) {
                return (0, utils_1.applyEdits)(documentText, [
                    { range: range_1.Range.fromPositions(replaceRange.getStartPosition()), text: `(` },
                    { range: range_1.Range.fromPositions(replaceRange.getEndPosition()), text: `)[${this.newLines.join('\n')}]` }
                ]);
            }
            else {
                return (0, utils_1.applyEdits)(documentText, [
                    { range: replaceRange, text: this.newLines.join('\n') }
                ]);
            }
        }
        get lineCount() {
            return this.newLines.length;
        }
        isEmpty() {
            return this.parts.every(p => p.lines.length === 0);
        }
        equals(other) {
            return this.lineNumber === other.lineNumber &&
                this.columnRange.equals(other.columnRange) &&
                this.newLines.length === other.newLines.length &&
                this.newLines.every((line, index) => line === other.newLines[index]) &&
                this.additionalReservedLineCount === other.additionalReservedLineCount;
        }
    }
    exports.GhostTextReplacement = GhostTextReplacement;
    function ghostTextOrReplacementEquals(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        if (a instanceof GhostText && b instanceof GhostText) {
            return a.equals(b);
        }
        if (a instanceof GhostTextReplacement && b instanceof GhostTextReplacement) {
            return a.equals(b);
        }
        return false;
    }
    exports.ghostTextOrReplacementEquals = ghostTextOrReplacementEquals;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3RUZXh0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9naG9zdFRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsU0FBUztRQUNyQixZQUNpQixVQUFrQixFQUNsQixLQUFzQjtZQUR0QixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQ2xCLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRXZDLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBZ0I7WUFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVO2dCQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU07Z0JBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQ7O1VBRUU7UUFDRixNQUFNLENBQUMsWUFBb0IsRUFBRSxRQUFpQixLQUFLO1lBQ2xELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDMUIsT0FBTyxJQUFBLGtCQUFVLEVBQUMsWUFBWSxFQUFFO2dCQUMvQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO29CQUMz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