/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/event", "vs/editor/common/core/range", "vs/editor/common/core/eolCounter"], function (require, exports, arraysFind_1, event_1, range_1, eolCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HiddenRangeModel = void 0;
    class HiddenRangeModel {
        get onDidChange() { return this._updateEventEmitter.event; }
        get hiddenRanges() { return this._hiddenRanges; }
        constructor(model) {
            this._updateEventEmitter = new event_1.Emitter();
            this._hasLineChanges = false;
            this._foldingModel = model;
            this._foldingModelListener = model.onDidChange(_ => this.updateHiddenRanges());
            this._hiddenRanges = [];
            if (model.regions.length) {
                this.updateHiddenRanges();
            }
        }
        notifyChangeModelContent(e) {
            if (this._hiddenRanges.length && !this._hasLineChanges) {
                this._hasLineChanges = e.changes.some(change => {
                    return change.range.endLineNumber !== change.range.startLineNumber || (0, eolCounter_1.countEOL)(change.text)[0] !== 0;
                });
            }
        }
        updateHiddenRanges() {
            let updateHiddenAreas = false;
            const newHiddenAreas = [];
            let i = 0; // index into hidden
            let k = 0;
            let lastCollapsedStart = Number.MAX_VALUE;
            let lastCollapsedEnd = -1;
            const ranges = this._foldingModel.regions;
            for (; i < ranges.length; i++) {
                if (!ranges.isCollapsed(i)) {
                    continue;
                }
                const startLineNumber = ranges.getStartLineNumber(i) + 1; // the first line is not hidden
                const endLineNumber = ranges.getEndLineNumber(i);
                if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
                    // ignore ranges contained in collapsed regions
                    continue;
                }
                if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].startLineNumber === startLineNumber && this._hiddenRanges[k].endLineNumber === endLineNumber) {
                    // reuse the old ranges
                    newHiddenAreas.push(this._hiddenRanges[k]);
                    k++;
                }
                else {
                    updateHiddenAreas = true;
                    newHiddenAreas.push(new range_1.Range(startLineNumber, 1, endLineNumber, 1));
                }
                lastCollapsedStart = startLineNumber;
                lastCollapsedEnd = endLineNumber;
            }
            if (this._hasLineChanges || updateHiddenAreas || k < this._hiddenRanges.length) {
                this.applyHiddenRanges(newHiddenAreas);
            }
        }
        applyHiddenRanges(newHiddenAreas) {
            this._hiddenRanges = newHiddenAreas;
            this._hasLineChanges = false;
            this._updateEventEmitter.fire(newHiddenAreas);
        }
        hasRanges() {
            return this._hiddenRanges.length > 0;
        }
        isHidden(line) {
            return findRange(this._hiddenRanges, line) !== null;
        }
        adjustSelections(selections) {
            let hasChanges = false;
            const editorModel = this._foldingModel.textModel;
            let lastRange = null;
            const adjustLine = (line) => {
                if (!lastRange || !isInside(line, lastRange)) {
                    lastRange = findRange(this._hiddenRanges, line);
                }
                if (lastRange) {
                    return lastRange.startLineNumber - 1;
                }
                return null;
            };
            for (let i = 0, len = selections.length; i < len; i++) {
                let selection = selections[i];
                const adjustedStartLine = adjustLine(selection.startLineNumber);
                if (adjustedStartLine) {
                    selection = selection.setStartPosition(adjustedStartLine, editorModel.getLineMaxColumn(adjustedStartLine));
                    hasChanges = true;
                }
                const adjustedEndLine = adjustLine(selection.endLineNumber);
                if (adjustedEndLine) {
                    selection = selection.setEndPosition(adjustedEndLine, editorModel.getLineMaxColumn(adjustedEndLine));
                    hasChanges = true;
                }
                selections[i] = selection;
            }
            return hasChanges;
        }
        dispose() {
            if (this.hiddenRanges.length > 0) {
                this._hiddenRanges = [];
                this._updateEventEmitter.fire(this._hiddenRanges);
            }
            if (this._foldingModelListener) {
                this._foldingModelListener.dispose();
                this._foldingModelListener = null;
            }
        }
    }
    exports.HiddenRangeModel = HiddenRangeModel;
    function isInside(line, range) {
        return line >= range.startLineNumber && line <= range.endLineNumber;
    }
    function findRange(ranges, line) {
        const i = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(ranges, r => line < r.startLineNumber) - 1;
        if (i >= 0 && ranges[i].endLineNumber >= line) {
            return ranges[i];
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlkZGVuUmFuZ2VNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZvbGRpbmcvYnJvd3Nlci9oaWRkZW5SYW5nZU1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLGdCQUFnQjtRQVE1QixJQUFXLFdBQVcsS0FBc0IsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwRixJQUFXLFlBQVksS0FBSyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBRXhELFlBQW1CLEtBQW1CO1lBTnJCLHdCQUFtQixHQUFHLElBQUksZUFBTyxFQUFZLENBQUM7WUFDdkQsb0JBQWUsR0FBWSxLQUFLLENBQUM7WUFNeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztRQUVNLHdCQUF3QixDQUFDLENBQTRCO1lBQzNELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUN2RCxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM5QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLE1BQU0sQ0FBQyxL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