/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModel", "vs/editor/contrib/dnd/browser/dragAndDropCommand", "vs/css!./dnd"], function (require, exports, lifecycle_1, platform_1, editorExtensions_1, position_1, range_1, selection_1, textModel_1, dragAndDropCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DragAndDropController = void 0;
    function hasTriggerModifier(e) {
        if (platform_1.isMacintosh) {
            return e.altKey;
        }
        else {
            return e.ctrlKey;
        }
    }
    class DragAndDropController extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.dragAndDrop'; }
        static { this.TRIGGER_KEY_VALUE = platform_1.isMacintosh ? 6 /* KeyCode.Alt */ : 5 /* KeyCode.Ctrl */; }
        static get(editor) {
            return editor.getContribution(DragAndDropController.ID);
        }
        constructor(editor) {
            super();
            this._editor = editor;
            this._dndDecorationIds = this._editor.createDecorationsCollection();
            this._register(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
            this._register(this._editor.onMouseUp((e) => this._onEditorMouseUp(e)));
            this._register(this._editor.onMouseDrag((e) => this._onEditorMouseDrag(e)));
            this._register(this._editor.onMouseDrop((e) => this._onEditorMouseDrop(e)));
            this._register(this._editor.onMouseDropCanceled(() => this._onEditorMouseDropCanceled()));
            this._register(this._editor.onKeyDown((e) => this.onEditorKeyDown(e)));
            this._register(this._editor.onKeyUp((e) => this.onEditorKeyUp(e)));
            this._register(this._editor.onDidBlurEditorWidget(() => this.onEditorBlur()));
            this._register(this._editor.onDidBlurEditorText(() => this.onEditorBlur()));
            this._mouseDown = false;
            this._modifierPressed = false;
            this._dragSelection = null;
        }
        onEditorBlur() {
            this._removeDecoration();
            this._dragSelection = null;
            this._mouseDown = false;
            this._modifierPressed = false;
        }
        onEditorKeyDown(e) {
            if (!this._editor.getOption(35 /* EditorOption.dragAndDrop */) || this._editor.getOption(22 /* EditorOption.columnSelection */)) {
                return;
            }
            if (hasTriggerModifier(e)) {
                this._modifierPressed = true;
            }
            if (this._mouseDown && hasTriggerModifier(e)) {
                this._editor.updateOptions({
                    mouseStyle: 'copy'
                });
            }
        }
        onEditorKeyUp(e) {
            if (!this._editor.getOption(35 /* EditorOption.dragAndDrop */) || this._editor.getOption(22 /* EditorOption.columnSelection */)) {
                return;
            }
            if (hasTriggerModifier(e)) {
                this._modifierPressed = false;
            }
            if (this._mouseDown && e.keyCode === DragAndDropController.TRIGGER_KEY_VALUE) {
                this._editor.updateOptions({
                    mouseStyle: 'default'
                });
            }
        }
        _onEditorMouseDown(mouseEvent) {
            this._mouseDown = true;
        }
        _onEditorMouseUp(mouseEvent) {
            this._mouseDown = false;
            // Whenever users release the mouse, the drag and drop operation should finish and the cursor should revert to text.
            this._editor.updateOptions({
                mouseStyle: 'text'
            });
        }
        _onEditorMouseDrag(mouseEvent) {
            const target = mouseEvent.target;
            if (this._dragSelection === null) {
                const selections = this._editor.getSelections() || [];
                const possibleSelections = selections.filter(selection => target.position && selection.containsPosition(target.position));
                if (possibleSelections.length === 1) {
                    this._dragSelection = possibleSelections[0];
                }
                else {
                    return;
                }
            }
            if (hasTriggerModifier(mouseEvent.event)) {
                this._editor.updateOptions({
                    mouseStyle: 'copy'
                });
            }
            else {
                this._editor.updateOptions({
                    mouseStyle: 'default'
                });
            }
            if (target.position) {
                if (this._dragSelection.containsPosition(target.position)) {
                    this._removeDecoration();
                }
                else {
                    this.showAt(target.position);
                }
            }
        }
        _onEditorMouseDropCanceled() {
            this._editor.updateOptions({
                mouseStyle: 'text'
            });
            this._removeDecoration();
            this._dragSelection = null;
            this._mouseDown = false;
        }
        _onEditorMouseDrop(mouseEvent) {
            if (mouseEvent.target && (this._hitContent(mouseEvent.target) || this._hitMargin(mouseEvent.target)) && mouseEvent.target.position) {
                const newCursorPosition = new position_1.Position(mouseEvent.target.position.lineNumber, mouseEvent.target.position.column);
                if (this._dragSelection === null) {
                    let newSelections = null;
                    if (mouseEvent.event.shiftKey) {
                        const primarySelection = this._editor.getSelection();
                        if (primarySelection) {
                            const { selectionStartLineNumber, selectionStartColumn } = primarySelection;
                            newSelections = [new selection_1.Selection(selectionStartLineNumber, selectionStartColumn, newCursorPosition.lineNumber, newCursorPosition.column)];
                        }
                    }
                    else {
                        newSelections = (this._editor.getSelections() || []).map(selection => {
                            if (selection.containsPosition(newCursorPosition)) {
                                return new selection_1.Selection(newCursorPosition.lineNumber, newCursorPosition.column, newCursorPosition.lineNumber, newCursorPosition.column);
                            }
                            else {
                                return selection;
                            }
                        });
                    }
                    // Use `mouse` as the source instead of `api` and setting the reason to explicit (to behave like any other mouse operation).
                    this._editor.setSelections(newSelections || [], 'mouse', 3 /* CursorChangeReason.Explicit */);
                }
                else if (!this._dragSelection.containsPosition(newCursorPosition) ||
                    ((hasTriggerModifier(mouseEvent.event) ||
                        this._modifierPressed) && (this._dragSelection.getEndPosition().equals(newCursorPosition) || this._dragSelection.getStartPosition().equals(newCursorPosition)) // we allow users to paste content beside the selection
                    )) {
                    this._editor.pushUndoStop();
                    this._editor.executeCommand(DragAndDropController.ID, new dragAndDropCommand_1.DragAndDropCommand(this._dragSelection, newCursorPosition, hasTriggerModifier(mouseEvent.event) || this._modifierPressed));
                    this._editor.pushUndoStop();
                }
            }
            this._editor.updateOptions({
                mouseStyle: 'text'
            });
            this._removeDecoration();
            this._dragSelection = null;
            this._mouseDown = false;
        }
        static { this._DECORATION_OPTIONS = textModel_1.ModelDecorationOptions.register({
            description: 'dnd-target',
            className: 'dnd-target'
        }); }
        showAt(position) {
            this._dndDecorationIds.set([{
                    range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: DragAndDropController._DECORATION_OPTIONS
                }]);
            this._editor.revealPosition(position, 1 /* ScrollType.Immediate */);
        }
        _removeDecoration() {
            this._dndDecorationIds.clear();
        }
        _hitContent(target) {
            return target.type === 6 /* MouseTargetType.CONTENT_TEXT */ ||
                target.type === 7 /* MouseTargetType.CONTENT_EMPTY */;
        }
        _hitMargin(target) {
            return target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ ||
                target.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */ ||
                target.type === 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */;
        }
        dispose() {
            this._removeDecoration();
            this._dragSelection = null;
            this._mouseDown = false;
            this._modifierPressed = false;
            super.dispose();
        }
    }
    exports.DragAndDropController = DragAndDropController;
    (0, editorExtensions_1.registerEditorContribution)(DragAndDropController.ID, DragAndDropController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZG5kL2Jyb3dzZXIvZG5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsU0FBUyxrQkFBa0IsQ0FBQyxDQUErQjtRQUMxRCxJQUFJLHNCQUFXLEVBQUU7WUFDaEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ2hCO2FBQU07WUFDTixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDakI7SUFDRixDQUFDO0lBRUQsTUFBYSxxQkFBc0IsU0FBUSxzQkFBVTtpQkFFN0IsT0FBRSxHQUFHLDRCQUE0QixDQUFDO2lCQU96QyxzQkFBaUIsR0FBRyxzQkFBVyxDQUFDLENBQUMscUJBQWEsQ0FBQyxxQkFBYSxDQUFDO1FBRTdFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDN0IsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUF3QixxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsWUFBWSxNQUFtQjtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQW9CLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQW9CLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENB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