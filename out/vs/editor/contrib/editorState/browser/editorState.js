/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/contrib/editorState/browser/keybindingCancellation"], function (require, exports, strings, range_1, cancellation_1, lifecycle_1, keybindingCancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextModelCancellationTokenSource = exports.EditorStateCancellationTokenSource = exports.EditorState = exports.CodeEditorStateFlag = void 0;
    var CodeEditorStateFlag;
    (function (CodeEditorStateFlag) {
        CodeEditorStateFlag[CodeEditorStateFlag["Value"] = 1] = "Value";
        CodeEditorStateFlag[CodeEditorStateFlag["Selection"] = 2] = "Selection";
        CodeEditorStateFlag[CodeEditorStateFlag["Position"] = 4] = "Position";
        CodeEditorStateFlag[CodeEditorStateFlag["Scroll"] = 8] = "Scroll";
    })(CodeEditorStateFlag || (exports.CodeEditorStateFlag = CodeEditorStateFlag = {}));
    class EditorState {
        constructor(editor, flags) {
            this.flags = flags;
            if ((this.flags & 1 /* CodeEditorStateFlag.Value */) !== 0) {
                const model = editor.getModel();
                this.modelVersionId = model ? strings.format('{0}#{1}', model.uri.toString(), model.getVersionId()) : null;
            }
            else {
                this.modelVersionId = null;
            }
            if ((this.flags & 4 /* CodeEditorStateFlag.Position */) !== 0) {
                this.position = editor.getPosition();
            }
            else {
                this.position = null;
            }
            if ((this.flags & 2 /* CodeEditorStateFlag.Selection */) !== 0) {
                this.selection = editor.getSelection();
            }
            else {
                this.selection = null;
            }
            if ((this.flags & 8 /* CodeEditorStateFlag.Scroll */) !== 0) {
                this.scrollLeft = editor.getScrollLeft();
                this.scrollTop = editor.getScrollTop();
            }
            else {
                this.scrollLeft = -1;
                this.scrollTop = -1;
            }
        }
        _equals(other) {
            if (!(other instanceof EditorState)) {
                return false;
            }
            const state = other;
            if (this.modelVersionId !== state.modelVersionId) {
                return false;
            }
            if (this.scrollLeft !== state.scrollLeft || this.scrollTop !== state.scrollTop) {
                return false;
            }
            if (!this.position && state.position || this.position && !state.position || this.position && state.position && !this.position.equals(state.position)) {
                return false;
            }
            if (!this.selection && state.selection || this.selection && !state.selection || this.selection && state.selection && !this.selection.equalsRange(state.selection)) {
                return false;
            }
            return true;
        }
        validate(editor) {
            return this._equals(new EditorState(editor, this.flags));
        }
    }
    exports.EditorState = EditorState;
    /**
     * A cancellation token source that cancels when the editor changes as expressed
     * by the provided flags
     * @param range If provided, changes in position and selection within this range will not trigger cancellation
     */
    class EditorStateCancellationTokenSource extends keybindingCancellation_1.EditorKeybindingCancellationTokenSource {
        constructor(editor, flags, range, parent) {
            super(editor, parent);
            this._listener = new lifecycle_1.DisposableStore();
            if (flags & 4 /* CodeEditorStateFlag.Position */) {
                this._listener.add(editor.onDidChangeCursorPosition(e => {
                    if (!range || !range_1.Range.containsPosition(range, e.position)) {
                        this.cancel();
                    }
                }));
            }
            if (flags & 2 /* CodeEditorStateFlag.Selection */) {
                this._listener.add(editor.onDidChangeCursorSelection(e => {
                    if (!range || !range_1.Range.containsRange(range, e.selection)) {
                        this.cancel();
                    }
                }));
            }
            if (flags & 8 /* CodeEditorStateFlag.Scroll */) {
                this._listener.add(editor.onDidScrollChange(_ => this.cancel()));
            }
            if (flags & 1 /* CodeEditorStateFlag.Value */) {
                this._listener.add(editor.onDidChangeModel(_ => this.cancel()));
                this._listener.add(editor.onDidChangeModelContent(_ => this.cancel()));
            }
        }
        dispose() {
            this._listener.dispose();
            super.dispose();
        }
    }
    exports.EditorStateCancellationTokenSource = EditorStateCancellationTokenSource;
    /**
     * A cancellation token source that cancels when the provided model changes
     */
    class TextModelCancellationTokenSource extends cancellation_1.CancellationTokenSource {
        constructor(model, parent) {
            super(parent);
            this._listener = model.onDidChangeContent(() => this.cancel());
        }
        dispose() {
            this._listener.dispose();
            super.dispose();
        }
    }
    exports.TextModelCancellationTokenSource = TextModelCancellationTokenSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU3RhdGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9lZGl0b3JTdGF0ZS9icm93c2VyL2VkaXRvclN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxJQUFrQixtQkFLakI7SUFMRCxXQUFrQixtQkFBbUI7UUFDcEMsK0RBQVMsQ0FBQTtRQUNULHVFQUFhLENBQUE7UUFDYixxRUFBWSxDQUFBO1FBQ1osaUVBQVUsQ0FBQTtJQUNYLENBQUMsRUFMaUIsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFLcEM7SUFFRCxNQUFhLFdBQVc7UUFVdkIsWUFBWSxNQUFtQixFQUFFLEtBQWE7WUFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLG9DQUE0QixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7YUFDM0c7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7YUFDM0I7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssdUNBQStCLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3JDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ3JCO1lB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