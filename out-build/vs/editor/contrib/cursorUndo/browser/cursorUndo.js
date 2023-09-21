/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/contrib/cursorUndo/browser/cursorUndo"], function (require, exports, lifecycle_1, editorExtensions_1, editorContextKeys_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$16 = exports.$Z6 = exports.$Y6 = void 0;
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
    class $Y6 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.cursorUndoRedoController'; }
        static get(editor) {
            return editor.getContribution($Y6.ID);
        }
        constructor(editor) {
            super();
            this.a = editor;
            this.b = false;
            this.c = [];
            this.f = [];
            this.B(editor.onDidChangeModel((e) => {
                this.c = [];
                this.f = [];
            }));
            this.B(editor.onDidChangeModelContent((e) => {
                this.c = [];
                this.f = [];
            }));
            this.B(editor.onDidChangeCursorSelection((e) => {
                if (this.b) {
                    return;
                }
                if (!e.oldSelections) {
                    return;
                }
                if (e.oldModelVersionId !== e.modelVersionId) {
                    return;
                }
                const prevState = new CursorState(e.oldSelections);
                const isEqualToLastUndoStack = (this.c.length > 0 && this.c[this.c.length - 1].cursorState.equals(prevState));
                if (!isEqualToLastUndoStack) {
                    this.c.push(new StackElement(prevState, editor.getScrollTop(), editor.getScrollLeft()));
                    this.f = [];
                    if (this.c.length > 50) {
                        // keep the cursor undo stack bounded
                        this.c.shift();
                    }
                }
            }));
        }
        cursorUndo() {
            if (!this.a.hasModel() || this.c.length === 0) {
                return;
            }
            this.f.push(new StackElement(new CursorState(this.a.getSelections()), this.a.getScrollTop(), this.a.getScrollLeft()));
            this.g(this.c.pop());
        }
        cursorRedo() {
            if (!this.a.hasModel() || this.f.length === 0) {
                return;
            }
            this.c.push(new StackElement(new CursorState(this.a.getSelections()), this.a.getScrollTop(), this.a.getScrollLeft()));
            this.g(this.f.pop());
        }
        g(stackElement) {
            this.b = true;
            this.a.setSelections(stackElement.cursorState.selections);
            this.a.setScrollPosition({
                scrollTop: stackElement.scrollTop,
                scrollLeft: stackElement.scrollLeft
            });
            this.b = false;
        }
    }
    exports.$Y6 = $Y6;
    class $Z6 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'cursorUndo',
                label: nls.localize(0, null),
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
            $Y6.get(editor)?.cursorUndo();
        }
    }
    exports.$Z6 = $Z6;
    class $16 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'cursorRedo',
                label: nls.localize(1, null),
                alias: 'Cursor Redo',
                precondition: undefined
            });
        }
        run(accessor, editor, args) {
            $Y6.get(editor)?.cursorRedo();
        }
    }
    exports.$16 = $16;
    (0, editorExtensions_1.$AV)($Y6.ID, $Y6, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to listen to record cursor state ASAP
    (0, editorExtensions_1.$xV)($Z6);
    (0, editorExtensions_1.$xV)($16);
});
//# sourceMappingURL=cursorUndo.js.map