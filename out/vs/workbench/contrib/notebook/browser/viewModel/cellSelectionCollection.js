/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellSelectionCollection = void 0;
    function rangesEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
                return false;
            }
        }
        return true;
    }
    // Challenge is List View talks about `element`, which needs extra work to convert to ICellRange as we support Folding and Cell Move
    class NotebookCellSelectionCollection extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this._primary = null;
            this._selections = [];
        }
        get onDidChangeSelection() { return this._onDidChangeSelection.event; }
        get selections() {
            return this._selections;
        }
        get focus() {
            return this._primary ?? { start: 0, end: 0 };
        }
        setState(primary, selections, forceEventEmit, source) {
            const changed = primary !== this._primary || !rangesEqual(this._selections, selections);
            this._primary = primary;
            this._selections = selections;
            if (changed || forceEventEmit) {
                this._onDidChangeSelection.fire(source);
            }
        }
        setSelections(selections, forceEventEmit, source) {
            this.setState(this._primary, selections, forceEventEmit, source);
        }
    }
    exports.NotebookCellSelectionCollection = NotebookCellSelectionCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFNlbGVjdGlvbkNvbGxlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9jZWxsU2VsZWN0aW9uQ29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBUyxXQUFXLENBQUMsQ0FBZSxFQUFFLENBQWU7UUFDcEQsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDMUIsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDdkQsT0FBTyxLQUFLLENBQUM7YUFDYjtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsb0lBQW9JO0lBQ3BJLE1BQWEsK0JBQWdDLFNBQVEsc0JBQVU7UUFBL0Q7O1lBRWtCLDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVUsQ0FBQyxDQUFDO1lBR3ZFLGFBQVEsR0FBc0IsSUFBSSxDQUFDO1lBRW5DLGdCQUFXLEdBQWlCLEVBQUUsQ0FBQztRQXVCeEMsQ0FBQztRQTNCQSxJQUFJLG9CQUFvQixLQUFvQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBTXRGLElBQUksVUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELFFBQVEsQ0FBQyxPQUEwQixFQUFFLFVBQXdCLEVBQUUsY0FBdUIsRUFBRSxNQUF3QjtZQUMvRyxNQUFNLE9BQU8sR0FBRyxPQUFPLEtBQUssSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXhGLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksT0FBTyxJQUFJLGNBQWMsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN4QztRQUNGLENBQUM7UUFFRCxhQUFhLENBQUMsVUFBd0IsRUFBRSxjQUF1QixFQUFFLE1BQXdCO1lBQ3hGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xFLENBQUM7S0FDRDtJQTlCRCwwRUE4QkMifQ==