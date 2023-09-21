/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls"], function (require, exports, lifecycle_1, editorExtensions_1, editorContextKeys_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorRedo = exports.CursorUndo = exports.CursorUndoRedoController = void 0;
    class CursorState {
        constructor(selections) {
            this.selections = selections;
        }
        equals(other) {
            const thisLen = this.selections.length;
            const otherLen = other.selections.length;
            if (thisLen !== otherLen) {
                return false;
            }
            for (let i = 0; i < thisLen; i++) {
                if (!this.selections[i].equalsSelection(other.selections[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    class StackElement {
        constructor(cursorState, scrollTop, scrollLeft) {
            this.cursorState = cursorState;
            this.scrollTop = scrollTop;
            this.scrollLeft = scrollLeft;
        }
    }
    class CursorUndoRedoController extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.cursorUndoRedoController'; }
        static get(editor) {
            return editor.getContribution(CursorUndoRedoController.ID);
        }
        constructor(editor) {
            super();
            this._editor = editor;
            this._isCursorUndoRedo = false;
            this._undoStack = [];
            this._redoStack = [];
            this._register(editor.onDidChangeModel((e) => {
                this._undoStack = [];
                this._redoStack = [];
            }));
            this._register(editor.onDidChangeModelContent((e) => {
                this._undoStack = [];
                this._redoStack = [];
            }));
            this._register(editor.onDidChangeCursorSelection((e) => {
                if (this._isCursorUndoRedo) {
                    return;
                }
                if (!e.oldSelections) {
                    return;
                }
                if (e.oldModelVersionId !== e.modelVersionId) {
                    return;
                }
                const prevState = new CursorState(e.oldSelections);
                const isEqualToLastUndoStack = (this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1].cursorState.equals(prevState));
                if (!isEqualToLastUndoStack) {
                    this._undoStack.push(new StackElement(prevState, editor.getScrollTop(), editor.getScrollLeft()));
                    this._redoStack = [];
                    if (this._undoStack.length > 50) {
                        // keep the cursor undo stack bounded
                        this._undoStack.shift();
                    }
                }
            }));
        }
        cursorUndo() {
            if (!this._editor.hasModel() || this._undoStack.length === 0) {
                return;
            }
            this._redoStack.push(new StackElement(new CursorState(this._editor.getSelections()), this._editor.getScrollTop(), this._editor.getScrollLeft()));
            this._applyState(this._undoStack.pop());
        }
        cursorRedo() {
            if (!this._editor.hasModel() || this._redoStack.length === 0) {
                return;
            }
            this._undoStack.push(new StackElement(new CursorState(this._editor.getSelections()), this._editor.getScrollTop(), this._editor.getScrollLeft()));
            this._applyState(this._redoStack.pop());
        }
        _applyState(stackElement) {
            this._isCursorUndoRedo = true;
            this._editor.setSelections(stackElement.cursorState.selections);
            this._editor.setScrollPosition({
                scrollTop: stackElement.scrollTop,
                scrollLeft: stackElement.scrollLeft
            });
            this._isCursorUndoRedo = false;
        }
    }
    exports.CursorUndoRedoController = CursorUndoRedoController;
    class CursorUndo extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'cursorUndo',
                label: nls.localize('cursor.undo', "Cursor Undo"),
                alias: 'Cursor Undo',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor, args) {
            CursorUndoRedoController.get(editor)?.cursorUndo();
        }
    }
    exports.CursorUndo = CursorUndo;
    class CursorRedo extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'cursorRedo',
                label: nls.localize('cursor.redo', "Cursor Redo"),
                alias: 'Cursor Redo',
                precondition: undefined
            });
        }
        run(accessor, editor, args) {
            CursorUndoRedoController.get(editor)?.cursorRedo();
        }
    }
    exports.CursorRedo = CursorRedo;
    (0, editorExtensions_1.registerEditorContribution)(CursorUndoRedoController.ID, CursorUndoRedoController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to listen to record cursor state ASAP
    (0, editorExtensions_1.registerEditorAction)(CursorUndo);
    (0, editorExtensions_1.registerEditorAction)(CursorRedo);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yVW5kby5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2N1cnNvclVuZG8vYnJvd3Nlci9jdXJzb3JVbmRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLFdBQVc7UUFHaEIsWUFBWSxVQUFnQztZQUMzQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM5QixDQUFDO1FBRU0sTUFBTSxDQUFDLEtBQWtCO1lBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ3pDLElBQUksT0FBTyxLQUFLLFFBQVEsRUFBRTtnQkFDekIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzdELE9BQU8sS0FBSyxDQUFDO2lCQUNiO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRDtJQUVELE1BQU0sWUFBWTtRQUNqQixZQUNpQixXQUF3QixFQUN4QixTQUFpQixFQUNqQixVQUFrQjtZQUZsQixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUN4QixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDL0IsQ0FBQztLQUNMO0lBRUQsTUFBYSx3QkFBeUIsU0FBUSxzQkFBVTtpQkFFaEMsT0FBRSxHQUFHLHlDQUF5QyxDQUFDO1FB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