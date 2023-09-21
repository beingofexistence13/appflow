/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/range"], function (require, exports, strings, editOperation_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w9 = exports.$v9 = void 0;
    class $v9 {
        constructor(selection, cursors) {
            this.c = selection;
            this.e = cursors;
            this.d = null;
        }
        getEditOperations(model, builder) {
            const ops = $w9(model, this.e);
            for (let i = 0, len = ops.length; i < len; i++) {
                const op = ops[i];
                builder.addEditOperation(op.range, op.text);
            }
            this.d = builder.trackSelection(this.c);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.d);
        }
    }
    exports.$v9 = $v9;
    /**
     * Generate commands for trimming trailing whitespace on a model and ignore lines on which cursors are sitting.
     */
    function $w9(model, cursors) {
        // Sort cursors ascending
        cursors.sort((a, b) => {
            if (a.lineNumber === b.lineNumber) {
                return a.column - b.column;
            }
            return a.lineNumber - b.lineNumber;
        });
        // Reduce multiple cursors on the same line and only keep the last one on the line
        for (let i = cursors.length - 2; i >= 0; i--) {
            if (cursors[i].lineNumber === cursors[i + 1].lineNumber) {
                // Remove cursor at `i`
                cursors.splice(i, 1);
            }
        }
        const r = [];
        let rLen = 0;
        let cursorIndex = 0;
        const cursorLen = cursors.length;
        for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
            const lineContent = model.getLineContent(lineNumber);
            const maxLineColumn = lineContent.length + 1;
            let minEditColumn = 0;
            if (cursorIndex < cursorLen && cursors[cursorIndex].lineNumber === lineNumber) {
                minEditColumn = cursors[cursorIndex].column;
                cursorIndex++;
                if (minEditColumn === maxLineColumn) {
                    // The cursor is at the end of the line => no edits for sure on this line
                    continue;
                }
            }
            if (lineContent.length === 0) {
                continue;
            }
            const lastNonWhitespaceIndex = strings.$De(lineContent);
            let fromColumn = 0;
            if (lastNonWhitespaceIndex === -1) {
                // Entire line is whitespace
                fromColumn = 1;
            }
            else if (lastNonWhitespaceIndex !== lineContent.length - 1) {
                // There is trailing whitespace
                fromColumn = lastNonWhitespaceIndex + 2;
            }
            else {
                // There is no trailing whitespace
                continue;
            }
            fromColumn = Math.max(minEditColumn, fromColumn);
            r[rLen++] = editOperation_1.$ls.delete(new range_1.$ks(lineNumber, fromColumn, lineNumber, maxLineColumn));
        }
        return r;
    }
    exports.$w9 = $w9;
});
//# sourceMappingURL=trimTrailingWhitespaceCommand.js.map