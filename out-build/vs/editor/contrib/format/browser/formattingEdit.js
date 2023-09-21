/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/browser/stableEditorScroll"], function (require, exports, editOperation_1, range_1, stableEditorScroll_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$B8 = void 0;
    class $B8 {
        static a(editor, edits) {
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
        static b(editor, edit) {
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
            const scrollState = stableEditorScroll_1.$TZ.capture(editor);
            const edits = $B8.a(editor, _edits);
            if (edits.length === 1 && $B8.b(editor, edits[0])) {
                // We use replace semantics and hope that markers stay put...
                editor.executeEdits('formatEditsCommand', edits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text)));
            }
            else {
                editor.executeEdits('formatEditsCommand', edits.map(edit => editOperation_1.$ls.replaceMove(range_1.$ks.lift(edit.range), edit.text)));
            }
            if (addUndoStops) {
                editor.pushUndoStop();
            }
            scrollState.restoreRelativeVerticalPositionOfCursor(editor);
        }
    }
    exports.$B8 = $B8;
});
//# sourceMappingURL=formattingEdit.js.map