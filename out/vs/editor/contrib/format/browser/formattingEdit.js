/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/browser/stableEditorScroll"], function (require, exports, editOperation_1, range_1, stableEditorScroll_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormattingEdit = void 0;
    class FormattingEdit {
        static _handleEolEdits(editor, edits) {
            let newEol = undefined;
            const singleEdits = [];
            for (const edit of edits) {
                if (typeof edit.eol === 'number') {
                    newEol = edit.eol;
                }
                if (edit.range && typeof edit.text === 'string') {
                    singleEdits.push(edit);
                }
            }
            if (typeof newEol === 'number') {
                if (editor.hasModel()) {
                    editor.getModel().pushEOL(newEol);
                }
            }
            return singleEdits;
        }
        static _isFullModelReplaceEdit(editor, edit) {
            if (!editor.hasModel()) {
                return false;
            }
            const model = editor.getModel();
            const editRange = model.validateRange(edit.range);
            const fullModelRange = model.getFullModelRange();
            return fullModelRange.equalsRange(editRange);
        }
        static execute(editor, _edits, addUndoStops) {
            if (addUndoStops) {
                editor.pushUndoStop();
            }
            const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(editor);
            const edits = FormattingEdit._handleEolEdits(editor, _edits);
            if (edits.length === 1 && FormattingEdit._isFullModelReplaceEdit(editor, edits[0])) {
                // We use replace semantics and hope that markers stay put...
                editor.executeEdits('formatEditsCommand', edits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text)));
            }
            else {
                editor.executeEdits('formatEditsCommand', edits.map(edit => editOperation_1.EditOperation.replaceMove(range_1.Range.lift(edit.range), edit.text)));
            }
            if (addUndoStops) {
                editor.pushUndoStop();
            }
            scrollState.restoreRelativeVerticalPositionOfCursor(editor);
        }
    }
    exports.FormattingEdit = FormattingEdit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGluZ0VkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9mb3JtYXQvYnJvd3Nlci9mb3JtYXR0aW5nRWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxjQUFjO1FBRWxCLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBbUIsRUFBRSxLQUFpQjtZQUNwRSxJQUFJLE1BQU0sR0FBa0MsU0FBUyxDQUFDO1lBQ3RELE1BQU0sV0FBVyxHQUEyQixFQUFFLENBQUM7WUFFL0MsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtvQkFDakMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7aUJBQ2xCO2dCQUNELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUNoRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN2QjthQUNEO1lBRUQsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQy9CLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUN0QixNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNsQzthQUNEO1lBRUQsT0FBTyxXQUFXLENBQUM7UUFDcEIsQ0FBQztRQUVPLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFtQixFQUFFLElBQTBCO1lBQ3JGLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDakQsT0FBTyxjQUFjLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQW1CLEVBQUUsTUFBa0IsRUFBRSxZQUFxQjtZQUM1RSxJQUFJLFlBQVksRUFBRTtnQkFDakIsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3RCO1lBQ0QsTUFBTSxXQUFXLEdBQUcsNENBQXVCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVELE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzdELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksY0FBYyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkYsNkRBQTZEO2dCQUM3RCxNQUFNLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyw2QkFBYSxDQUFDLE9BQU8sQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZIO2lCQUFNO2dCQUNOLE1BQU0sQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDZCQUFhLENBQUMsV0FBVyxDQUFDLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0g7WUFDRCxJQUFJLFlBQVksRUFBRTtnQkFDakIsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3RCO1lBQ0QsV0FBVyxDQUFDLHVDQUF1QyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FDRDtJQW5ERCx3Q0FtREMifQ==