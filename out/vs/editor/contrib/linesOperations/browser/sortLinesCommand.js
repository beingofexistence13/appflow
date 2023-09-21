/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/range"], function (require, exports, editOperation_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SortLinesCommand = void 0;
    class SortLinesCommand {
        static { this._COLLATOR = null; }
        static getCollator() {
            if (!SortLinesCommand._COLLATOR) {
                SortLinesCommand._COLLATOR = new Intl.Collator();
            }
            return SortLinesCommand._COLLATOR;
        }
        constructor(selection, descending) {
            this.selection = selection;
            this.descending = descending;
            this.selectionId = null;
        }
        getEditOperations(model, builder) {
            const op = sortLines(model, this.selection, this.descending);
            if (op) {
                builder.addEditOperation(op.range, op.text);
            }
            this.selectionId = builder.trackSelection(this.selection);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.selectionId);
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
    exports.SortLinesCommand = SortLinesCommand;
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
        sorted.sort(SortLinesCommand.getCollator().compare);
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
        return editOperation_1.EditOperation.replace(new range_1.Range(data.startLineNumber, 1, data.endLineNumber, model.getLineMaxColumn(data.endLineNumber)), data.after.join('\n'));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydExpbmVzQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2xpbmVzT3BlcmF0aW9ucy9icm93c2VyL3NvcnRMaW5lc0NvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsZ0JBQWdCO2lCQUViLGNBQVMsR0FBeUIsSUFBSSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxXQUFXO1lBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUU7Z0JBQ2hDLGdCQUFnQixDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqRDtZQUNELE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQ25DLENBQUM7UUFNRCxZQUFZLFNBQW9CLEVBQUUsVUFBbUI7WUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUVNLGlCQUFpQixDQUFDLEtBQWlCLEVBQUUsT0FBOEI7WUFDekUsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxJQUFJLEVBQUUsRUFBRTtnQkFDUCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLE1BQWdDO1lB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