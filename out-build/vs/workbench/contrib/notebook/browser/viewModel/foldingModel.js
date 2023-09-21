/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/editor/contrib/folding/browser/foldingRanges", "vs/editor/contrib/folding/browser/syntaxRangeProvider", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, markdownRenderer_1, event_1, lifecycle_1, marked_1, foldingRanges_1, syntaxRangeProvider_1, notebookCommon_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3qb = exports.$2qb = exports.$1qb = void 0;
    const foldingRangeLimit = {
        limit: 5000,
        update: () => { }
    };
    class $1qb {
        get regions() {
            return this.c;
        }
        constructor() {
            this.a = null;
            this.b = new lifecycle_1.$jc();
            this.d = new event_1.$fd();
            this.onDidFoldingRegionChanged = this.d.event;
            this.e = [];
            this.c = new foldingRanges_1.$a8(new Uint32Array(0), new Uint32Array(0));
        }
        dispose() {
            this.d.dispose();
            this.b.dispose();
        }
        detachViewModel() {
            this.b.clear();
            this.a = null;
        }
        attachViewModel(model) {
            this.a = model;
            this.b.add(this.a.onDidChangeViewCells(() => {
                this.recompute();
            }));
            this.b.add(this.a.onDidChangeSelection(() => {
                if (!this.a) {
                    return;
                }
                const indexes = (0, notebookRange_1.$PH)(this.a.getSelections());
                let changed = false;
                indexes.forEach(index => {
                    let regionIndex = this.regions.findRange(index + 1);
                    while (regionIndex !== -1) {
                        if (this.c.isCollapsed(regionIndex) && index > this.c.getStartLineNumber(regionIndex) - 1) {
                            this.c.setCollapsed(regionIndex, false);
                            changed = true;
                        }
                        regionIndex = this.c.getParentIndex(regionIndex);
                    }
                });
                if (changed) {
                    this.d.fire();
                }
            }));
            this.recompute();
        }
        getRegionAtLine(lineNumber) {
            if (this.c) {
                const index = this.c.findRange(lineNumber);
                if (index >= 0) {
                    return this.c.toRegion(index);
                }
            }
            return null;
        }
        getRegionsInside(region, filter) {
            const result = [];
            const index = region ? region.regionIndex + 1 : 0;
            const endLineNumber = region ? region.endLineNumber : Number.MAX_VALUE;
            if (filter && filter.length === 2) {
                const levelStack = [];
                for (let i = index, len = this.c.length; i < len; i++) {
                    const current = this.c.toRegion(i);
                    if (this.c.getStartLineNumber(i) < endLineNumber) {
                        while (levelStack.length > 0 && !current.containedBy(levelStack[levelStack.length - 1])) {
                            levelStack.pop();
                        }
                        levelStack.push(current);
                        if (filter(current, levelStack.length)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                for (let i = index, len = this.c.length; i < len; i++) {
                    const current = this.c.toRegion(i);
                    if (this.c.getStartLineNumber(i) < endLineNumber) {
                        if (!filter || filter(current)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return result;
        }
        getAllRegionsAtLine(lineNumber, filter) {
            const result = [];
            if (this.c) {
                let index = this.c.findRange(lineNumber);
                let level = 1;
                while (index >= 0) {
                    const current = this.c.toRegion(index);
                    if (!filter || filter(current, level)) {
                        result.push(current);
                    }
                    level++;
                    index = current.parentIndex;
                }
            }
            return result;
        }
        setCollapsed(index, newState) {
            this.c.setCollapsed(index, newState);
        }
        recompute() {
            if (!this.a) {
                return;
            }
            const viewModel = this.a;
            const cells = viewModel.viewCells;
            const stack = [];
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (cell.cellKind !== notebookCommon_1.CellKind.Markup || cell.language !== 'markdown') {
                    continue;
                }
                const minDepth = Math.min(7, ...Array.from($3qb(cell.getText()), header => header.depth));
                if (minDepth < 7) {
                    // header 1 to 6
                    stack.push({ index: i, level: minDepth, endIndex: 0 });
                }
            }
            // calculate folding ranges
            const rawFoldingRanges = stack.map((entry, startIndex) => {
                let end = undefined;
                for (let i = startIndex + 1; i < stack.length; ++i) {
                    if (stack[i].level <= entry.level) {
                        end = stack[i].index - 1;
                        break;
                    }
                }
                const endIndex = end !== undefined ? end : cells.length - 1;
                // one based
                return {
                    start: entry.index + 1,
                    end: endIndex + 1,
                    rank: 1
                };
            }).filter(range => range.start !== range.end);
            const newRegions = (0, syntaxRangeProvider_1.$y8)(rawFoldingRanges, foldingRangeLimit);
            // restore collased state
            let i = 0;
            const nextCollapsed = () => {
                while (i < this.c.length) {
                    const isCollapsed = this.c.isCollapsed(i);
                    i++;
                    if (isCollapsed) {
                        return i - 1;
                    }
                }
                return -1;
            };
            let k = 0;
            let collapsedIndex = nextCollapsed();
            while (collapsedIndex !== -1 && k < newRegions.length) {
                // get the latest range
                const decRange = viewModel.getTrackedRange(this.e[collapsedIndex]);
                if (decRange) {
                    const collasedStartIndex = decRange.start;
                    while (k < newRegions.length) {
                        const startIndex = newRegions.getStartLineNumber(k) - 1;
                        if (collasedStartIndex >= startIndex) {
                            newRegions.setCollapsed(k, collasedStartIndex === startIndex);
                            k++;
                        }
                        else {
                            break;
                        }
                    }
                }
                collapsedIndex = nextCollapsed();
            }
            while (k < newRegions.length) {
                newRegions.setCollapsed(k, false);
                k++;
            }
            const cellRanges = [];
            for (let i = 0; i < newRegions.length; i++) {
                const region = newRegions.toRegion(i);
                cellRanges.push({ start: region.startLineNumber - 1, end: region.endLineNumber - 1 });
            }
            // remove old tracked ranges and add new ones
            // TODO@rebornix, implement delta
            this.e.forEach(id => viewModel.setTrackedRange(id, null, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */));
            this.e = cellRanges.map(region => viewModel.setTrackedRange(null, region, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */)).filter(str => str !== null);
            this.c = newRegions;
            this.d.fire();
        }
        getMemento() {
            const collapsedRanges = [];
            let i = 0;
            while (i < this.c.length) {
                const isCollapsed = this.c.isCollapsed(i);
                if (isCollapsed) {
                    const region = this.c.toRegion(i);
                    collapsedRanges.push({ start: region.startLineNumber - 1, end: region.endLineNumber - 1 });
                }
                i++;
            }
            return collapsedRanges;
        }
        applyMemento(state) {
            if (!this.a) {
                return false;
            }
            let i = 0;
            let k = 0;
            while (k < state.length && i < this.c.length) {
                // get the latest range
                const decRange = this.a.getTrackedRange(this.e[i]);
                if (decRange) {
                    const collasedStartIndex = state[k].start;
                    while (i < this.c.length) {
                        const startIndex = this.c.getStartLineNumber(i) - 1;
                        if (collasedStartIndex >= startIndex) {
                            this.c.setCollapsed(i, collasedStartIndex === startIndex);
                            i++;
                        }
                        else {
                            break;
                        }
                    }
                }
                k++;
            }
            while (i < this.c.length) {
                this.c.setCollapsed(i, false);
                i++;
            }
            return true;
        }
    }
    exports.$1qb = $1qb;
    function $2qb(foldingModel, index, collapsed) {
        const range = foldingModel.regions.findRange(index + 1);
        foldingModel.setCollapsed(range, collapsed);
    }
    exports.$2qb = $2qb;
    function* $3qb(cellContent) {
        for (const token of marked_1.marked.lexer(cellContent, { gfm: true })) {
            if (token.type === 'heading') {
                yield {
                    depth: token.depth,
                    text: (0, markdownRenderer_1.$CQ)({ value: token.text }).trim()
                };
            }
        }
    }
    exports.$3qb = $3qb;
});
//# sourceMappingURL=foldingModel.js.map