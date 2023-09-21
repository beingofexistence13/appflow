/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/contrib/editorState/browser/keybindingCancellation"], function (require, exports, strings, range_1, cancellation_1, lifecycle_1, keybindingCancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u1 = exports.$t1 = exports.$s1 = exports.CodeEditorStateFlag = void 0;
    var CodeEditorStateFlag;
    (function (CodeEditorStateFlag) {
        CodeEditorStateFlag[CodeEditorStateFlag["Value"] = 1] = "Value";
        CodeEditorStateFlag[CodeEditorStateFlag["Selection"] = 2] = "Selection";
        CodeEditorStateFlag[CodeEditorStateFlag["Position"] = 4] = "Position";
        CodeEditorStateFlag[CodeEditorStateFlag["Scroll"] = 8] = "Scroll";
    })(CodeEditorStateFlag || (exports.CodeEditorStateFlag = CodeEditorStateFlag = {}));
    class $s1 {
        constructor(editor, flags) {
            this.a = flags;
            if ((this.a & 1 /* CodeEditorStateFlag.Value */) !== 0) {
                const model = editor.getModel();
                this.d = model ? strings.$ne('{0}#{1}', model.uri.toString(), model.getVersionId()) : null;
            }
            else {
                this.d = null;
            }
            if ((this.a & 4 /* CodeEditorStateFlag.Position */) !== 0) {
                this.b = editor.getPosition();
            }
            else {
                this.b = null;
            }
            if ((this.a & 2 /* CodeEditorStateFlag.Selection */) !== 0) {
                this.c = editor.getSelection();
            }
            else {
                this.c = null;
            }
            if ((this.a & 8 /* CodeEditorStateFlag.Scroll */) !== 0) {
                this.f = editor.getScrollLeft();
                this.g = editor.getScrollTop();
            }
            else {
                this.f = -1;
                this.g = -1;
            }
        }
        h(other) {
            if (!(other instanceof $s1)) {
                return false;
            }
            const state = other;
            if (this.d !== state.d) {
                return false;
            }
            if (this.f !== state.f || this.g !== state.g) {
                return false;
            }
            if (!this.b && state.b || this.b && !state.b || this.b && state.b && !this.b.equals(state.b)) {
                return false;
            }
            if (!this.c && state.c || this.c && !state.c || this.c && state.c && !this.c.equalsRange(state.c)) {
                return false;
            }
            return true;
        }
        validate(editor) {
            return this.h(new $s1(editor, this.a));
        }
    }
    exports.$s1 = $s1;
    /**
     * A cancellation token source that cancels when the editor changes as expressed
     * by the provided flags
     * @param range If provided, changes in position and selection within this range will not trigger cancellation
     */
    class $t1 extends keybindingCancellation_1.$r1 {
        constructor(editor, flags, range, parent) {
            super(editor, parent);
            this.b = new lifecycle_1.$jc();
            if (flags & 4 /* CodeEditorStateFlag.Position */) {
                this.b.add(editor.onDidChangeCursorPosition(e => {
                    if (!range || !range_1.$ks.containsPosition(range, e.position)) {
                        this.cancel();
                    }
                }));
            }
            if (flags & 2 /* CodeEditorStateFlag.Selection */) {
                this.b.add(editor.onDidChangeCursorSelection(e => {
                    if (!range || !range_1.$ks.containsRange(range, e.selection)) {
                        this.cancel();
                    }
                }));
            }
            if (flags & 8 /* CodeEditorStateFlag.Scroll */) {
                this.b.add(editor.onDidScrollChange(_ => this.cancel()));
            }
            if (flags & 1 /* CodeEditorStateFlag.Value */) {
                this.b.add(editor.onDidChangeModel(_ => this.cancel()));
                this.b.add(editor.onDidChangeModelContent(_ => this.cancel()));
            }
        }
        dispose() {
            this.b.dispose();
            super.dispose();
        }
    }
    exports.$t1 = $t1;
    /**
     * A cancellation token source that cancels when the provided model changes
     */
    class $u1 extends cancellation_1.$pd {
        constructor(model, parent) {
            super(parent);
            this.a = model.onDidChangeContent(() => this.cancel());
        }
        dispose() {
            this.a.dispose();
            super.dispose();
        }
    }
    exports.$u1 = $u1;
});
//# sourceMappingURL=editorState.js.map