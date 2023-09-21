/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/range"], function (require, exports, editOperation_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z9 = void 0;
    class $z9 {
        static { this.a = null; }
        static getCollator() {
            if (!$z9.a) {
                $z9.a = new Intl.Collator();
            }
            return $z9.a;
        }
        constructor(selection, descending) {
            this.b = selection;
            this.c = descending;
            this.d = null;
        }
        getEditOperations(model, builder) {
            const op = sortLines(model, this.b, this.c);
            if (op) {
                builder.addEditOperation(op.range, op.text);
            }
            this.d = builder.trackSelection(this.b);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.d);
        }
        static canRun(model, selection, descending) {
            if (model === null) {
                return false;
            }
            const data = getSortData(model, selection, descending);
            if (!data) {
                return false;
            }
            for (let i = 0, len = data.before.length; i < len; i++) {
                if (data.before[i] !== data.after[i]) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.$z9 = $z9;
    function getSortData(model, selection, descending) {
        const startLineNumber = selection.startLineNumber;
        let endLineNumber = selection.endLineNumber;
        if (selection.endColumn === 1) {
            endLineNumber--;
        }
        // Nothing to sort if user didn't select anything.
        if (startLineNumber >= endLineNumber) {
            return null;
        }
        const linesToSort = [];
        // Get the contents of the selection to be sorted.
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            linesToSort.push(model.getLineContent(lineNumber));
        }
        let sorted = linesToSort.slice(0);
        sorted.sort($z9.getCollator().compare);
        // If descending, reverse the order.
        if (descending === true) {
            sorted = sorted.reverse();
        }
        return {
            startLineNumber: startLineNumber,
            endLineNumber: endLineNumber,
            before: linesToSort,
            after: sorted
        };
    }
    /**
     * Generate commands for sorting lines on a model.
     */
    function sortLines(model, selection, descending) {
        const data = getSortData(model, selection, descending);
        if (!data) {
            return null;
        }
        return editOperation_1.$ls.replace(new range_1.$ks(data.startLineNumber, 1, data.endLineNumber, model.getLineMaxColumn(data.endLineNumber)), data.after.join('\n'));
    }
});
//# sourceMappingURL=sortLinesCommand.js.map