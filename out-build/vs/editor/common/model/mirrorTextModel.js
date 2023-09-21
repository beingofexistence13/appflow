/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/model/prefixSumComputer"], function (require, exports, strings_1, position_1, prefixSumComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mu = void 0;
    class $Mu {
        constructor(uri, lines, eol, versionId) {
            this.d = uri;
            this.f = lines;
            this.g = eol;
            this.h = versionId;
            this.j = null;
            this.k = null;
        }
        dispose() {
            this.f.length = 0;
        }
        get version() {
            return this.h;
        }
        getText() {
            if (this.k === null) {
                this.k = this.f.join(this.g);
            }
            return this.k;
        }
        onEvents(e) {
            if (e.eol && e.eol !== this.g) {
                this.g = e.eol;
                this.j = null;
            }
            // Update my lines
            const changes = e.changes;
            for (const change of changes) {
                this.o(change.range);
                this.p(new position_1.$js(change.range.startLineNumber, change.range.startColumn), change.text);
            }
            this.h = e.versionId;
            this.k = null;
        }
        l() {
            if (!this.j) {
                const eolLength = this.g.length;
                const linesLength = this.f.length;
                const lineStartValues = new Uint32Array(linesLength);
                for (let i = 0; i < linesLength; i++) {
                    lineStartValues[i] = this.f[i].length + eolLength;
                }
                this.j = new prefixSumComputer_1.$Ju(lineStartValues);
            }
        }
        /**
         * All changes to a line's text go through this method
         */
        n(lineIndex, newValue) {
            this.f[lineIndex] = newValue;
            if (this.j) {
                // update prefix sum
                this.j.setValue(lineIndex, this.f[lineIndex].length + this.g.length);
            }
        }
        o(range) {
            if (range.startLineNumber === range.endLineNumber) {
                if (range.startColumn === range.endColumn) {
                    // Nothing to delete
                    return;
                }
                // Delete text on the affected line
                this.n(range.startLineNumber - 1, this.f[range.startLineNumber - 1].substring(0, range.startColumn - 1)
                    + this.f[range.startLineNumber - 1].substring(range.endColumn - 1));
                return;
            }
            // Take remaining text on last line and append it to remaining text on first line
            this.n(range.startLineNumber - 1, this.f[range.startLineNumber - 1].substring(0, range.startColumn - 1)
                + this.f[range.endLineNumber - 1].substring(range.endColumn - 1));
            // Delete middle lines
            this.f.splice(range.startLineNumber, range.endLineNumber - range.startLineNumber);
            if (this.j) {
                // update prefix sum
                this.j.removeValues(range.startLineNumber, range.endLineNumber - range.startLineNumber);
            }
        }
        p(position, insertText) {
            if (insertText.length === 0) {
                // Nothing to insert
                return;
            }
            const insertLines = (0, strings_1.$Ae)(insertText);
            if (insertLines.length === 1) {
                // Inserting text on one line
                this.n(position.lineNumber - 1, this.f[position.lineNumber - 1].substring(0, position.column - 1)
                    + insertLines[0]
                    + this.f[position.lineNumber - 1].substring(position.column - 1));
                return;
            }
            // Append overflowing text from first line to the end of text to insert
            insertLines[insertLines.length - 1] += this.f[position.lineNumber - 1].substring(position.column - 1);
            // Delete overflowing text from first line and insert text on first line
            this.n(position.lineNumber - 1, this.f[position.lineNumber - 1].substring(0, position.column - 1)
                + insertLines[0]);
            // Insert new lines & store lengths
            const newLengths = new Uint32Array(insertLines.length - 1);
            for (let i = 1; i < insertLines.length; i++) {
                this.f.splice(position.lineNumber + i - 1, 0, insertLines[i]);
                newLengths[i - 1] = insertLines[i].length + this.g.length;
            }
            if (this.j) {
                // update prefix sum
                this.j.insertValues(position.lineNumber, newLengths);
            }
        }
    }
    exports.$Mu = $Mu;
});
//# sourceMappingURL=mirrorTextModel.js.map