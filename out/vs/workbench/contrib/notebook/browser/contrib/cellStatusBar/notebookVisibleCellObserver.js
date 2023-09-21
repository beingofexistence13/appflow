/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/collections", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, collections_1, event_1, lifecycle_1, types_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookVisibleCellObserver = void 0;
    class NotebookVisibleCellObserver extends lifecycle_1.Disposable {
        get visibleCells() {
            return this._visibleCells;
        }
        constructor(_notebookEditor) {
            super();
            this._notebookEditor = _notebookEditor;
            this._onDidChangeVisibleCells = this._register(new event_1.Emitter());
            this.onDidChangeVisibleCells = this._onDidChangeVisibleCells.event;
            this._viewModelDisposables = this._register(new lifecycle_1.DisposableStore());
            this._visibleCells = [];
            this._register(this._notebookEditor.onDidChangeVisibleRanges(this._updateVisibleCells, this));
            this._register(this._notebookEditor.onDidChangeModel(this._onModelChange, this));
            this._updateVisibleCells();
        }
        _onModelChange() {
            this._viewModelDisposables.clear();
            if (this._notebookEditor.hasModel()) {
                this._viewModelDisposables.add(this._notebookEditor.onDidChangeViewCells(() => this.updateEverything()));
            }
            this.updateEverything();
        }
        updateEverything() {
            this._onDidChangeVisibleCells.fire({ added: [], removed: Array.from(this._visibleCells) });
            this._visibleCells = [];
            this._updateVisibleCells();
        }
        _updateVisibleCells() {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const newVisibleCells = (0, notebookRange_1.cellRangesToIndexes)(this._notebookEditor.visibleRanges)
                .map(index => this._notebookEditor.cellAt(index))
                .filter(types_1.isDefined);
            const newVisibleHandles = new Set(newVisibleCells.map(cell => cell.handle));
            const oldVisibleHandles = new Set(this._visibleCells.map(cell => cell.handle));
            const diff = (0, collections_1.diffSets)(oldVisibleHandles, newVisibleHandles);
            const added = diff.added
                .map(handle => this._notebookEditor.getCellByHandle(handle))
                .filter(types_1.isDefined);
            const removed = diff.removed
                .map(handle => this._notebookEditor.getCellByHandle(handle))
                .filter(types_1.isDefined);
            this._visibleCells = newVisibleCells;
            this._onDidChangeVisibleCells.fire({
                added,
                removed
            });
        }
    }
    exports.NotebookVisibleCellObserver = NotebookVisibleCellObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWaXNpYmxlQ2VsbE9ic2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2NlbGxTdGF0dXNCYXIvbm90ZWJvb2tWaXNpYmxlQ2VsbE9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFhLDJCQUE0QixTQUFRLHNCQUFVO1FBUTFELElBQUksWUFBWTtZQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsWUFBNkIsZUFBZ0M7WUFDNUQsS0FBSyxFQUFFLENBQUM7WUFEb0Isb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBWDVDLDZCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQThCLENBQUMsQ0FBQztZQUM3Riw0QkFBdUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO1lBRXRELDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUV2RSxrQkFBYSxHQUFxQixFQUFFLENBQUM7WUFTNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVPLGNBQWM7WUFDckIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25DLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN6RztZQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFFUyxnQkFBZ0I7WUFDekIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU8sbUJBQW1CO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNyQyxPQUFPO2FBQ1A7WUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFBLG1DQUFtQixFQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDO2lCQUM3RSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDaEQsTUFBTSxDQUFDLGlCQUFTLENBQUMsQ0FBQztZQUNwQixNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1RSxNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxJQUFJLEdBQUcsSUFBQSxzQkFBUSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFNUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7aUJBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMzRCxNQUFNLENBQUMsaUJBQVMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2lCQUMxQixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDM0QsTUFBTSxDQUFDLGlCQUFTLENBQUMsQ0FBQztZQUVwQixJQUFJLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztZQUNyQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxLQUFLO2dCQUNMLE9BQU87YUFDUCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUE1REQsa0VBNERDIn0=