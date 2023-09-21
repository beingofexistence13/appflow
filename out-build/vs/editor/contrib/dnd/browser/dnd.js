/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModel", "vs/editor/contrib/dnd/browser/dragAndDropCommand", "vs/css!./dnd"], function (require, exports, lifecycle_1, platform_1, editorExtensions_1, position_1, range_1, selection_1, textModel_1, dragAndDropCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$36 = void 0;
    function hasTriggerModifier(e) {
        if (platform_1.$j) {
            return e.altKey;
        }
        else {
            return e.ctrlKey;
        }
    }
    class $36 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.dragAndDrop'; }
        static { this.TRIGGER_KEY_VALUE = platform_1.$j ? 6 /* KeyCode.Alt */ : 5 /* KeyCode.Ctrl */; }
        static get(editor) {
            return editor.getContribution($36.ID);
        }
        constructor(editor) {
            super();
            this.a = editor;
            this.c = this.a.createDecorationsCollection();
            this.B(this.a.onMouseDown((e) => this.n(e)));
            this.B(this.a.onMouseUp((e) => this.r(e)));
            this.B(this.a.onMouseDrag((e) => this.s(e)));
            this.B(this.a.onMouseDrop((e) => this.u(e)));
            this.B(this.a.onMouseDropCanceled(() => this.t()));
            this.B(this.a.onKeyDown((e) => this.j(e)));
            this.B(this.a.onKeyUp((e) => this.m(e)));
            this.B(this.a.onDidBlurEditorWidget(() => this.h()));
            this.B(this.a.onDidBlurEditorText(() => this.h()));
            this.f = false;
            this.g = false;
            this.b = null;
        }
        h() {
            this.y();
            this.b = null;
            this.f = false;
            this.g = false;
        }
        j(e) {
            if (!this.a.getOption(35 /* EditorOption.dragAndDrop */) || this.a.getOption(22 /* EditorOption.columnSelection */)) {
                return;
            }
            if (hasTriggerModifier(e)) {
                this.g = true;
            }
            if (this.f && hasTriggerModifier(e)) {
                this.a.updateOptions({
                    mouseStyle: 'copy'
                });
            }
        }
        m(e) {
            if (!this.a.getOption(35 /* EditorOption.dragAndDrop */) || this.a.getOption(22 /* EditorOption.columnSelection */)) {
                return;
            }
            if (hasTriggerModifier(e)) {
                this.g = false;
            }
            if (this.f && e.keyCode === $36.TRIGGER_KEY_VALUE) {
                this.a.updateOptions({
                    mouseStyle: 'default'
                });
            }
        }
        n(mouseEvent) {
            this.f = true;
        }
        r(mouseEvent) {
            this.f = false;
            // Whenever users release the mouse, the drag and drop operation should finish and the cursor should revert to text.
            this.a.updateOptions({
                mouseStyle: 'text'
            });
        }
        s(mouseEvent) {
            const target = mouseEvent.target;
            if (this.b === null) {
                const selections = this.a.getSelections() || [];
                const possibleSelections = selections.filter(selection => target.position && selection.containsPosition(target.position));
                if (possibleSelections.length === 1) {
                    this.b = possibleSelections[0];
                }
                else {
                    return;
                }
            }
            if (hasTriggerModifier(mouseEvent.event)) {
                this.a.updateOptions({
                    mouseStyle: 'copy'
                });
            }
            else {
                this.a.updateOptions({
                    mouseStyle: 'default'
                });
            }
            if (target.position) {
                if (this.b.containsPosition(target.position)) {
                    this.y();
                }
                else {
                    this.showAt(target.position);
                }
            }
        }
        t() {
            this.a.updateOptions({
                mouseStyle: 'text'
            });
            this.y();
            this.b = null;
            this.f = false;
        }
        u(mouseEvent) {
            if (mouseEvent.target && (this.z(mouseEvent.target) || this.C(mouseEvent.target)) && mouseEvent.target.position) {
                const newCursorPosition = new position_1.$js(mouseEvent.target.position.lineNumber, mouseEvent.target.position.column);
                if (this.b === null) {
                    let newSelections = null;
                    if (mouseEvent.event.shiftKey) {
                        const primarySelection = this.a.getSelection();
                        if (primarySelection) {
                            const { selectionStartLineNumber, selectionStartColumn } = primarySelection;
                            newSelections = [new selection_1.$ms(selectionStartLineNumber, selectionStartColumn, newCursorPosition.lineNumber, newCursorPosition.column)];
                        }
                    }
                    else {
                        newSelections = (this.a.getSelections() || []).map(selection => {
                            if (selection.containsPosition(newCursorPosition)) {
                                return new selection_1.$ms(newCursorPosition.lineNumber, newCursorPosition.column, newCursorPosition.lineNumber, newCursorPosition.column);
                            }
                            else {
                                return selection;
                            }
                        });
                    }
                    // Use `mouse` as the source instead of `api` and setting the reason to explicit (to behave like any other mouse operation).
                    this.a.setSelections(newSelections || [], 'mouse', 3 /* CursorChangeReason.Explicit */);
                }
                else if (!this.b.containsPosition(newCursorPosition) ||
                    ((hasTriggerModifier(mouseEvent.event) ||
                        this.g) && (this.b.getEndPosition().equals(newCursorPosition) || this.b.getStartPosition().equals(newCursorPosition)) // we allow users to paste content beside the selection
                    )) {
                    this.a.pushUndoStop();
                    this.a.executeCommand($36.ID, new dragAndDropCommand_1.$26(this.b, newCursorPosition, hasTriggerModifier(mouseEvent.event) || this.g));
                    this.a.pushUndoStop();
                }
            }
            this.a.updateOptions({
                mouseStyle: 'text'
            });
            this.y();
            this.b = null;
            this.f = false;
        }
        static { this.w = textModel_1.$RC.register({
            description: 'dnd-target',
            className: 'dnd-target'
        }); }
        showAt(position) {
            this.c.set([{
                    range: new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: $36.w
                }]);
            this.a.revealPosition(position, 1 /* ScrollType.Immediate */);
        }
        y() {
            this.c.clear();
        }
        z(target) {
            return target.type === 6 /* MouseTargetType.CONTENT_TEXT */ ||
                target.type === 7 /* MouseTargetType.CONTENT_EMPTY */;
        }
        C(target) {
            return target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ ||
                target.type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */ ||
                target.type === 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */;
        }
        dispose() {
            this.y();
            this.b = null;
            this.f = false;
            this.g = false;
            super.dispose();
        }
    }
    exports.$36 = $36;
    (0, editorExtensions_1.$AV)($36.ID, $36, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
});
//# sourceMappingURL=dnd.js.map