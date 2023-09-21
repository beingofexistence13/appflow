/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/event", "vs/editor/common/core/range", "vs/editor/common/core/eolCounter"], function (require, exports, arraysFind_1, event_1, range_1, eolCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o8 = void 0;
    class $o8 {
        get onDidChange() { return this.d.event; }
        get hiddenRanges() { return this.b; }
        constructor(model) {
            this.d = new event_1.$fd();
            this.f = false;
            this.a = model;
            this.c = model.onDidChange(_ => this.g());
            this.b = [];
            if (model.regions.length) {
                this.g();
            }
        }
        notifyChangeModelContent(e) {
            if (this.b.length && !this.f) {
                this.f = e.changes.some(change => {
                    return change.range.endLineNumber !== change.range.startLineNumber || (0, eolCounter_1.$Ws)(change.text)[0] !== 0;
                });
            }
        }
        g() {
            let updateHiddenAreas = false;
            const newHiddenAreas = [];
            let i = 0; // index into hidden
            let k = 0;
            let lastCollapsedStart = Number.MAX_VALUE;
            let lastCollapsedEnd = -1;
            const ranges = this.a.regions;
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
                if (!updateHiddenAreas && k < this.b.length && this.b[k].startLineNumber === startLineNumber && this.b[k].endLineNumber === endLineNumber) {
                    // reuse the old ranges
                    newHiddenAreas.push(this.b[k]);
                    k++;
                }
                else {
                    updateHiddenAreas = true;
                    newHiddenAreas.push(new range_1.$ks(startLineNumber, 1, endLineNumber, 1));
                }
                lastCollapsedStart = startLineNumber;
                lastCollapsedEnd = endLineNumber;
            }
            if (this.f || updateHiddenAreas || k < this.b.length) {
                this.h(newHiddenAreas);
            }
        }
        h(newHiddenAreas) {
            this.b = newHiddenAreas;
            this.f = false;
            this.d.fire(newHiddenAreas);
        }
        hasRanges() {
            return this.b.length > 0;
        }
        isHidden(line) {
            return findRange(this.b, line) !== null;
        }
        adjustSelections(selections) {
            let hasChanges = false;
            const editorModel = this.a.textModel;
            let lastRange = null;
            const adjustLine = (line) => {
                if (!lastRange || !isInside(line, lastRange)) {
                    lastRange = findRange(this.b, line);
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
                this.b = [];
                this.d.fire(this.b);
            }
            if (this.c) {
                this.c.dispose();
                this.c = null;
            }
        }
    }
    exports.$o8 = $o8;
    function isInside(line, range) {
        return line >= range.startLineNumber && line <= range.endLineNumber;
    }
    function findRange(ranges, line) {
        const i = (0, arraysFind_1.$ib)(ranges, r => line < r.startLineNumber) - 1;
        if (i >= 0 && ranges[i].endLineNumber >= line) {
            return ranges[i];
        }
        return null;
    }
});
//# sourceMappingURL=hiddenRangeModel.js.map