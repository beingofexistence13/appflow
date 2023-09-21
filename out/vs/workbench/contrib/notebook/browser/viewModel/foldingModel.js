/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/editor/contrib/folding/browser/foldingRanges", "vs/editor/contrib/folding/browser/syntaxRangeProvider", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, markdownRenderer_1, event_1, lifecycle_1, marked_1, foldingRanges_1, syntaxRangeProvider_1, notebookCommon_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMarkdownHeadersInCell = exports.updateFoldingStateAtIndex = exports.FoldingModel = void 0;
    const foldingRangeLimit = {
        limit: 5000,
        update: () => { }
    };
    class FoldingModel {
        get regions() {
            return this._regions;
        }
        constructor() {
            this._viewModel = null;
            this._viewModelStore = new lifecycle_1.DisposableStore();
            this._onDidFoldingRegionChanges = new event_1.Emitter();
            this.onDidFoldingRegionChanged = this._onDidFoldingRegionChanges.event;
            this._foldingRangeDecorationIds = [];
            this._regions = new foldingRanges_1.FoldingRegions(new Uint32Array(0), new Uint32Array(0));
        }
        dispose() {
            this._onDidFoldingRegionChanges.dispose();
            this._viewModelStore.dispose();
        }
        detachViewModel() {
            this._viewModelStore.clear();
            this._viewModel = null;
        }
        attachViewModel(model) {
            this._viewModel = model;
            this._viewModelStore.add(this._viewModel.onDidChangeViewCells(() => {
                this.recompute();
            }));
            this._viewModelStore.add(this._viewModel.onDidChangeSelection(() => {
                if (!this._viewModel) {
                    return;
                }
                const indexes = (0, notebookRange_1.cellRangesToIndexes)(this._viewModel.getSelections());
                let changed = false;
                indexes.forEach(index => {
                    let regionIndex = this.regions.findRange(index + 1);
                    while (regionIndex !== -1) {
                        if (this._regions.isCollapsed(regionIndex) && index > this._regions.getStartLineNumber(regionIndex) - 1) {
                            this._regions.setCollapsed(regionIndex, false);
                            changed = true;
                        }
                        regionIndex = this._regions.getParentIndex(regionIndex);
                    }
                });
                if (changed) {
                    this._onDidFoldingRegionChanges.fire();
                }
            }));
            this.recompute();
        }
        getRegionAtLine(lineNumber) {
            if (this._regions) {
                const index = this._regions.findRange(lineNumber);
                if (index >= 0) {
                    return this._regions.toRegion(index);
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
                for (let i = index, len = this._regions.length; i < len; i++) {
                    const current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
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
                for (let i = index, len = this._regions.length; i < len; i++) {
                    const current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
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
            if (this._regions) {
                let index = this._regions.findRange(lineNumber);
                let level = 1;
                while (index >= 0) {
                    const current = this._regions.toRegion(index);
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
            this._regions.setCollapsed(index, newState);
        }
        recompute() {
            if (!this._viewModel) {
                return;
            }
            const viewModel = this._viewModel;
            const cells = viewModel.viewCells;
            const stack = [];
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (cell.cellKind !== notebookCommon_1.CellKind.Markup || cell.language !== 'markdown') {
                    continue;
                }
                const minDepth = Math.min(7, ...Array.from(getMarkdownHeadersInCell(cell.getText()), header => header.depth));
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
            const newRegions = (0, syntaxRangeProvider_1.sanitizeRanges)(rawFoldingRanges, foldingRangeLimit);
            // restore collased state
            let i = 0;
            const nextCollapsed = () => {
                while (i < this._regions.length) {
                    const isCollapsed = this._regions.isCollapsed(i);
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
                const decRange = viewModel.getTrackedRange(this._foldingRangeDecorationIds[collapsedIndex]);
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
            this._foldingRangeDecorationIds.forEach(id => viewModel.setTrackedRange(id, null, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */));
            this._foldingRangeDecorationIds = cellRanges.map(region => viewModel.setTrackedRange(null, region, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */)).filter(str => str !== null);
            this._regions = newRegions;
            this._onDidFoldingRegionChanges.fire();
        }
        getMemento() {
            const collapsedRanges = [];
            let i = 0;
            while (i < this._regions.length) {
                const isCollapsed = this._regions.isCollapsed(i);
                if (isCollapsed) {
                    const region = this._regions.toRegion(i);
                    collapsedRanges.push({ start: region.startLineNumber - 1, end: region.endLineNumber - 1 });
                }
                i++;
            }
            return collapsedRanges;
        }
        applyMemento(state) {
            if (!this._viewModel) {
                return false;
            }
            let i = 0;
            let k = 0;
            while (k < state.length && i < this._regions.length) {
                // get the latest range
                const decRange = this._viewModel.getTrackedRange(this._foldingRangeDecorationIds[i]);
                if (decRange) {
                    const collasedStartIndex = state[k].start;
                    while (i < this._regions.length) {
                        const startIndex = this._regions.getStartLineNumber(i) - 1;
                        if (collasedStartIndex >= startIndex) {
                            this._regions.setCollapsed(i, collasedStartIndex === startIndex);
                            i++;
                        }
                        else {
                            break;
                        }
                    }
                }
                k++;
            }
            while (i < this._regions.length) {
                this._regions.setCollapsed(i, false);
                i++;
            }
            return true;
        }
    }
    exports.FoldingModel = FoldingModel;
    function updateFoldingStateAtIndex(foldingModel, index, collapsed) {
        const range = foldingModel.regions.findRange(index + 1);
        foldingModel.setCollapsed(range, collapsed);
    }
    exports.updateFoldingStateAtIndex = updateFoldingStateAtIndex;
    function* getMarkdownHeadersInCell(cellContent) {
        for (const token of marked_1.marked.lexer(cellContent, { gfm: true })) {
            if (token.type === 'heading') {
                yield {
                    depth: token.depth,
                    text: (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: token.text }).trim()
                };
            }
        }
    }
    exports.getMarkdownHeadersInCell = getMarkdownHeadersInCell;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3TW9kZWwvZm9sZGluZ01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBTSxpQkFBaUIsR0FBeUI7UUFDL0MsS0FBSyxFQUFFLElBQUk7UUFDWCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUNqQixDQUFDO0lBRUYsTUFBYSxZQUFZO1FBSXhCLElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBT0Q7WUFaUSxlQUFVLEdBQThCLElBQUksQ0FBQztZQUNwQyxvQkFBZSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBTXhDLCtCQUEwQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDekQsOEJBQXlCLEdBQWdCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFFaEYsK0JBQTBCLEdBQWEsRUFBRSxDQUFDO1lBR2pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSw4QkFBYyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsZUFBZTtZQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDeEIsQ0FBQztRQUVELGVBQWUsQ0FBQyxLQUF5QjtZQUN4QyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUV4QixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRTtnQkFDbEUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRTtnQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ3JCLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsSUFBQSxtQ0FBbUIsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBRXJFLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFFcEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDdkIsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUVwRCxPQUFPLFdBQVcsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7NEJBQ3hHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFDL0MsT0FBTyxHQUFHLElBQUksQ0FBQzt5QkFDZjt3QkFDRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7cUJBQ3hEO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksT0FBTyxFQUFFO29CQUNaLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDdkM7WUFFRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxlQUFlLENBQUMsVUFBa0I7WUFDakMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUNmLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUE0QixFQUFFLE1BQTZDO1lBQzNGLE1BQU0sTUFBTSxHQUFvQixFQUFFLENBQUM7WUFDbkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUV2RSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxVQUFVLEdBQW9CLEVBQUUsQ0FBQztnQkFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxFQUFFO3dCQUN4RCxPQUFPLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFOzRCQUN4RixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7eUJBQ2pCO3dCQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3pCLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7NEJBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQ3JCO3FCQUNEO3lCQUFNO3dCQUNOLE1BQU07cUJBQ047aUJBQ0Q7YUFDRDtpQkFBTTtnQkFDTixLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLEVBQUU7d0JBQ3hELElBQUksQ0FBQyxNQUFNLElBQUssTUFBdUIsQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt5QkFDckI7cUJBQ0Q7eUJBQU07d0JBQ04sTUFBTTtxQkFDTjtpQkFDRDthQUNEO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsbUJBQW1CLENBQUMsVUFBa0IsRUFBRSxNQUFxRDtZQUM1RixNQUFNLE1BQU0sR0FBb0IsRUFBRSxDQUFDO1lBQ25DLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxPQUFPLEtBQUssSUFBSSxDQUFDLEVBQUU7b0JBQ2xCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7d0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQ3JCO29CQUNELEtBQUssRUFBRSxDQUFDO29CQUNSLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO2lCQUM1QjthQUNEO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsWUFBWSxDQUFDLEtBQWEsRUFBRSxRQUFpQjtZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELFNBQVM7WUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsT0FBTzthQUNQO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNsQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQ2xDLE1BQU0sS0FBSyxHQUF5RCxFQUFFLENBQUM7WUFFdkUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLHlCQUFRLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssVUFBVSxFQUFFO29CQUN0RSxTQUFTO2lCQUNUO2dCQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM5RyxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7b0JBQ2pCLGdCQUFnQjtvQkFDaEIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDdkQ7YUFDRDtZQUVELDJCQUEyQjtZQUMzQixNQUFNLGdCQUFnQixHQUF3QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUM3RSxJQUFJLEdBQUcsR0FBdUIsU0FBUyxDQUFDO2dCQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQ25ELElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO3dCQUNsQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7d0JBQ3pCLE1BQU07cUJBQ047aUJBQ0Q7Z0JBRUQsTUFBTSxRQUFRLEdBQUcsR0FBRyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFNUQsWUFBWTtnQkFDWixPQUFPO29CQUNOLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUM7b0JBQ3RCLEdBQUcsRUFBRSxRQUFRLEdBQUcsQ0FBQztvQkFDakIsSUFBSSxFQUFFLENBQUM7aUJBQ1AsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTlDLE1BQU0sVUFBVSxHQUFHLElBQUEsb0NBQWMsRUFBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRXZFLHlCQUF5QjtZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7Z0JBQzFCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUNoQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsQ0FBQyxFQUFFLENBQUM7b0JBQ0osSUFBSSxXQUFXLEVBQUU7d0JBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDYjtpQkFDRDtnQkFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsSUFBSSxjQUFjLEdBQUcsYUFBYSxFQUFFLENBQUM7WUFFckMsT0FBTyxjQUFjLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RELHVCQUF1QjtnQkFDdkIsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDNUYsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO29CQUUxQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFO3dCQUM3QixNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUN4RCxJQUFJLGtCQUFrQixJQUFJLFVBQVUsRUFBRTs0QkFDckMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLEtBQUssVUFBVSxDQUFDLENBQUM7NEJBQzlELENBQUMsRUFBRSxDQUFDO3lCQUNKOzZCQUFNOzRCQUNOLE1BQU07eUJBQ047cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsY0FBYyxHQUFHLGFBQWEsRUFBRSxDQUFDO2FBQ2pDO1lBRUQsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDN0IsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xDLENBQUMsRUFBRSxDQUFDO2FBQ0o7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDdEY7WUFFRCw2Q0FBNkM7WUFDN0MsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxJQUFJLDBEQUFrRCxDQUFDLENBQUM7WUFDcEksSUFBSSxDQUFDLDBCQUEwQixHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLDBEQUFrRCxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBYSxDQUFDO1lBRTdMLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1lBQzNCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRUQsVUFBVTtZQUNULE1BQU0sZUFBZSxHQUFpQixFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVqRCxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDM0Y7Z0JBRUQsQ0FBQyxFQUFFLENBQUM7YUFDSjtZQUVELE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxZQUFZLENBQUMsS0FBbUI7WUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFVixPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDcEQsdUJBQXVCO2dCQUN2QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckYsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUUxQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTt3QkFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzNELElBQUksa0JBQWtCLElBQUksVUFBVSxFQUFFOzRCQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLEtBQUssVUFBVSxDQUFDLENBQUM7NEJBQ2pFLENBQUMsRUFBRSxDQUFDO3lCQUNKOzZCQUFNOzRCQUNOLE1BQU07eUJBQ047cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsQ0FBQyxFQUFFLENBQUM7YUFDSjtZQUVELE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3JDLENBQUMsRUFBRSxDQUFDO2FBQ0o7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRDtJQTFSRCxvQ0EwUkM7SUFFRCxTQUFnQix5QkFBeUIsQ0FBQyxZQUEwQixFQUFFLEtBQWEsRUFBRSxTQUFrQjtRQUN0RyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEQsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUhELDhEQUdDO0lBRUQsUUFBZSxDQUFDLENBQUMsd0JBQXdCLENBQUMsV0FBbUI7UUFDNUQsS0FBSyxNQUFNLEtBQUssSUFBSSxlQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO1lBQzdELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQzdCLE1BQU07b0JBQ0wsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO29CQUNsQixJQUFJLEVBQUUsSUFBQSw0Q0FBeUIsRUFBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUU7aUJBQzdELENBQUM7YUFDRjtTQUNEO0lBQ0YsQ0FBQztJQVRELDREQVNDIn0=