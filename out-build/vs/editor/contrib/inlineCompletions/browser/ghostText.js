/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/contrib/inlineCompletions/browser/utils"], function (require, exports, range_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t5 = exports.$s5 = exports.$r5 = exports.$q5 = void 0;
    class $q5 {
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
            return (0, utils_1.$k5)(documentText, [
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
            const text = (0, utils_1.$k5)(cappedLineText, this.parts.map(p => ({
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
    exports.$q5 = $q5;
    class $r5 {
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
    exports.$r5 = $r5;
    class $s5 {
        constructor(lineNumber, columnRange, newLines, additionalReservedLineCount = 0) {
            this.lineNumber = lineNumber;
            this.columnRange = columnRange;
            this.newLines = newLines;
            this.additionalReservedLineCount = additionalReservedLineCount;
            this.parts = [
                new $r5(this.columnRange.endColumnExclusive, this.newLines, false),
            ];
        }
        renderForScreenReader(_lineText) {
            return this.newLines.join('\n');
        }
        render(documentText, debug = false) {
            const replaceRange = this.columnRange.toRange(this.lineNumber);
            if (debug) {
                return (0, utils_1.$k5)(documentText, [
                    { range: range_1.$ks.fromPositions(replaceRange.getStartPosition()), text: `(` },
                    { range: range_1.$ks.fromPositions(replaceRange.getEndPosition()), text: `)[${this.newLines.join('\n')}]` }
                ]);
            }
            else {
                return (0, utils_1.$k5)(documentText, [
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
    exports.$s5 = $s5;
    function $t5(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        if (a instanceof $q5 && b instanceof $q5) {
            return a.equals(b);
        }
        if (a instanceof $s5 && b instanceof $s5) {
            return a.equals(b);
        }
        return false;
    }
    exports.$t5 = $t5;
});
//# sourceMappingURL=ghostText.js.map