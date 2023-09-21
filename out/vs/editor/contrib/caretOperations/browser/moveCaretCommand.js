/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveCaretCommand = void 0;
    class MoveCaretCommand {
        constructor(selection, isMovingLeft) {
            this._selection = selection;
            this._isMovingLeft = isMovingLeft;
        }
        getEditOperations(model, builder) {
            if (this._selection.startLineNumber !== this._selection.endLineNumber || this._selection.isEmpty()) {
                return;
            }
            const lineNumber = this._selection.startLineNumber;
            const startColumn = this._selection.startColumn;
            const endColumn = this._selection.endColumn;
            if (this._isMovingLeft && startColumn === 1) {
                return;
            }
            if (!this._isMovingLeft && endColumn === model.getLineMaxColumn(lineNumber)) {
                return;
            }
            if (this._isMovingLeft) {
                const rangeBefore = new range_1.Range(lineNumber, startColumn - 1, lineNumber, startColumn);
                const charBefore = model.getValueInRange(rangeBefore);
                builder.addEditOperation(rangeBefore, null);
                builder.addEditOperation(new range_1.Range(lineNumber, endColumn, lineNumber, endColumn), charBefore);
            }
            else {
                const rangeAfter = new range_1.Range(lineNumber, endColumn, lineNumber, endColumn + 1);
                const charAfter = model.getValueInRange(rangeAfter);
                builder.addEditOperation(rangeAfter, null);
                builder.addEditOperation(new range_1.Range(lineNumber, startColumn, lineNumber, startColumn), charAfter);
            }
        }
        computeCursorState(model, helper) {
            if (this._isMovingLeft) {
                return new selection_1.Selection(this._selection.startLineNumber, this._selection.startColumn - 1, this._selection.endLineNumber, this._selection.endColumn - 1);
            }
            else {
                return new selection_1.Selection(this._selection.startLineNumber, this._selection.startColumn + 1, this._selection.endLineNumber, this._selection.endColumn + 1);
            }
        }
    }
    exports.MoveCaretCommand = MoveCaretCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZUNhcmV0Q29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NhcmV0T3BlcmF0aW9ucy9icm93c2VyL21vdmVDYXJldENvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsZ0JBQWdCO1FBSzVCLFlBQVksU0FBb0IsRUFBRSxZQUFxQjtZQUN0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNuQyxDQUFDO1FBRU0saUJBQWlCLENBQUMsS0FBaUIsRUFBRSxPQUE4QjtZQUN6RSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ25HLE9BQU87YUFDUDtZQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO1lBQ25ELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQ2hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO2dCQUM1QyxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxTQUFTLEtBQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM1RSxPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLE1BQU0sV0FBVyxHQUFHLElBQUksYUFBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDcEYsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzlGO2lCQUFNO2dCQUNOLE1BQU0sVUFBVSxHQUFHLElBQUksYUFBSyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDL0UsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDcEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0MsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksYUFBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ2pHO1FBQ0YsQ0FBQztRQUVNLGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsTUFBZ0M7WUFDNUUsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN2QixPQUFPLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDcko7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3JKO1FBQ0YsQ0FBQztLQUNEO0lBNUNELDRDQTRDQyJ9