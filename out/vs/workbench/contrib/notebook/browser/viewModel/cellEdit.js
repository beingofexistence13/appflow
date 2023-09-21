/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, notebookCommon_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JoinCellEdit = void 0;
    class JoinCellEdit {
        constructor(resource, index, direction, cell, selections, inverseRange, insertContent, removedCell, editingDelegate) {
            this.resource = resource;
            this.index = index;
            this.direction = direction;
            this.cell = cell;
            this.selections = selections;
            this.inverseRange = inverseRange;
            this.insertContent = insertContent;
            this.removedCell = removedCell;
            this.editingDelegate = editingDelegate;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Join Cell';
            this.code = 'undoredo.notebooks.joinCell';
            this._deletedRawCell = this.removedCell.model;
        }
        async undo() {
            if (!this.editingDelegate.insertCell || !this.editingDelegate.createCellViewModel) {
                throw new Error('Notebook Insert Cell not implemented for Undo/Redo');
            }
            await this.cell.resolveTextModel();
            this.cell.textModel?.applyEdits([
                { range: this.inverseRange, text: '' }
            ]);
            this.cell.setSelections(this.selections);
            const cell = this.editingDelegate.createCellViewModel(this._deletedRawCell);
            if (this.direction === 'above') {
                this.editingDelegate.insertCell(this.index, this._deletedRawCell, { kind: notebookCommon_1.SelectionStateType.Handle, primary: cell.handle, selections: [cell.handle] });
                cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
            else {
                this.editingDelegate.insertCell(this.index, cell.model, { kind: notebookCommon_1.SelectionStateType.Handle, primary: this.cell.handle, selections: [this.cell.handle] });
                this.cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
        }
        async redo() {
            if (!this.editingDelegate.deleteCell) {
                throw new Error('Notebook Delete Cell not implemented for Undo/Redo');
            }
            await this.cell.resolveTextModel();
            this.cell.textModel?.applyEdits([
                { range: this.inverseRange, text: this.insertContent }
            ]);
            this.editingDelegate.deleteCell(this.index, { kind: notebookCommon_1.SelectionStateType.Handle, primary: this.cell.handle, selections: [this.cell.handle] });
            this.cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
        }
    }
    exports.JoinCellEdit = JoinCellEdit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEVkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9jZWxsRWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsWUFBWTtRQUt4QixZQUNRLFFBQWEsRUFDWixLQUFhLEVBQ2IsU0FBNEIsRUFDNUIsSUFBdUIsRUFDdkIsVUFBdUIsRUFDdkIsWUFBbUIsRUFDbkIsYUFBcUIsRUFDckIsV0FBOEIsRUFDOUIsZUFBeUM7WUFSMUMsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNaLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUM1QixTQUFJLEdBQUosSUFBSSxDQUFtQjtZQUN2QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3ZCLGlCQUFZLEdBQVosWUFBWSxDQUFPO1lBQ25CLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1lBQ3JCLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtZQUM5QixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFibEQsU0FBSSx3Q0FBOEQ7WUFDbEUsVUFBSyxHQUFXLFdBQVcsQ0FBQztZQUM1QixTQUFJLEdBQVcsNkJBQTZCLENBQUM7WUFhNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMvQyxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUk7WUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFO2dCQUNsRixNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7YUFDdEU7WUFFRCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUVuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7Z0JBQy9CLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTthQUN0QyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLE9BQU8sRUFBRTtnQkFDL0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLG1DQUFrQixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4SixJQUFJLENBQUMsU0FBUyxHQUFHLCtCQUFhLENBQUMsTUFBTSxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxtQ0FBa0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4SixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRywrQkFBYSxDQUFDLE1BQU0sQ0FBQzthQUMzQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsSUFBSTtZQUNULElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRTtnQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO2FBQ3RFO1lBRUQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO2dCQUMvQixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO2FBQ3RELENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUNBQWtCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1SSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRywrQkFBYSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxDQUFDO0tBQ0Q7SUF2REQsb0NBdURDIn0=