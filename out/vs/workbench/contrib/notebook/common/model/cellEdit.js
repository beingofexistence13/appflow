/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellMetadataEdit = exports.SpliceCellsEdit = exports.MoveCellEdit = void 0;
    class MoveCellEdit {
        constructor(resource, fromIndex, length, toIndex, editingDelegate, beforedSelections, endSelections) {
            this.resource = resource;
            this.fromIndex = fromIndex;
            this.length = length;
            this.toIndex = toIndex;
            this.editingDelegate = editingDelegate;
            this.beforedSelections = beforedSelections;
            this.endSelections = endSelections;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Move Cell';
            this.code = 'undoredo.notebooks.moveCell';
        }
        undo() {
            if (!this.editingDelegate.moveCell) {
                throw new Error('Notebook Move Cell not implemented for Undo/Redo');
            }
            this.editingDelegate.moveCell(this.toIndex, this.length, this.fromIndex, this.endSelections, this.beforedSelections);
        }
        redo() {
            if (!this.editingDelegate.moveCell) {
                throw new Error('Notebook Move Cell not implemented for Undo/Redo');
            }
            this.editingDelegate.moveCell(this.fromIndex, this.length, this.toIndex, this.beforedSelections, this.endSelections);
        }
    }
    exports.MoveCellEdit = MoveCellEdit;
    class SpliceCellsEdit {
        constructor(resource, diffs, editingDelegate, beforeHandles, endHandles) {
            this.resource = resource;
            this.diffs = diffs;
            this.editingDelegate = editingDelegate;
            this.beforeHandles = beforeHandles;
            this.endHandles = endHandles;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Insert Cell';
            this.code = 'undoredo.notebooks.insertCell';
        }
        undo() {
            if (!this.editingDelegate.replaceCell) {
                throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
            }
            this.diffs.forEach(diff => {
                this.editingDelegate.replaceCell(diff[0], diff[2].length, diff[1], this.beforeHandles);
            });
        }
        redo() {
            if (!this.editingDelegate.replaceCell) {
                throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
            }
            this.diffs.reverse().forEach(diff => {
                this.editingDelegate.replaceCell(diff[0], diff[1].length, diff[2], this.endHandles);
            });
        }
    }
    exports.SpliceCellsEdit = SpliceCellsEdit;
    class CellMetadataEdit {
        constructor(resource, index, oldMetadata, newMetadata, editingDelegate) {
            this.resource = resource;
            this.index = index;
            this.oldMetadata = oldMetadata;
            this.newMetadata = newMetadata;
            this.editingDelegate = editingDelegate;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Update Cell Metadata';
            this.code = 'undoredo.notebooks.updateCellMetadata';
        }
        undo() {
            if (!this.editingDelegate.updateCellMetadata) {
                return;
            }
            this.editingDelegate.updateCellMetadata(this.index, this.oldMetadata);
        }
        redo() {
            if (!this.editingDelegate.updateCellMetadata) {
                return;
            }
            this.editingDelegate.updateCellMetadata(this.index, this.newMetadata);
        }
    }
    exports.CellMetadataEdit = CellMetadataEdit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEVkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9jb21tb24vbW9kZWwvY2VsbEVkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFhLFlBQVk7UUFLeEIsWUFDUSxRQUFhLEVBQ1osU0FBaUIsRUFDakIsTUFBYyxFQUNkLE9BQWUsRUFDZixlQUF5QyxFQUN6QyxpQkFBOEMsRUFDOUMsYUFBMEM7WUFOM0MsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNaLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDakIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFDZixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDekMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE2QjtZQUM5QyxrQkFBYSxHQUFiLGFBQWEsQ0FBNkI7WUFYbkQsU0FBSSx3Q0FBOEQ7WUFDbEUsVUFBSyxHQUFXLFdBQVcsQ0FBQztZQUM1QixTQUFJLEdBQVcsNkJBQTZCLENBQUM7UUFXN0MsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQzthQUNwRTtZQUVELElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdEgsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxLQUFLLENB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