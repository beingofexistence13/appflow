/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/editor/common/core/characterClassifier"], function (require, exports, arrays_1, lifecycle_1, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F6 = void 0;
    class $F6 {
        constructor(editor, widget, model, accept) {
            this.a = new lifecycle_1.$jc();
            this.a.add(model.onDidSuggest(e => {
                if (e.completionModel.items.length === 0) {
                    this.reset();
                }
            }));
            this.a.add(model.onDidCancel(e => {
                this.reset();
            }));
            this.a.add(widget.onDidShow(() => this.c(widget.getFocusedItem())));
            this.a.add(widget.onDidFocus(this.c, this));
            this.a.add(widget.onDidHide(this.reset, this));
            this.a.add(editor.onWillType(text => {
                if (this.b && !widget.isFrozen() && model.state !== 0 /* State.Idle */) {
                    const ch = text.charCodeAt(text.length - 1);
                    if (this.b.acceptCharacters.has(ch) && editor.getOption(0 /* EditorOption.acceptSuggestionOnCommitCharacter */)) {
                        accept(this.b.item);
                    }
                }
            }));
        }
        c(selected) {
            if (!selected || !(0, arrays_1.$Jb)(selected.item.completion.commitCharacters)) {
                // no item or no commit characters
                this.reset();
                return;
            }
            if (this.b && this.b.item.item === selected.item) {
                // still the same item
                return;
            }
            // keep item and its commit characters
            const acceptCharacters = new characterClassifier_1.$Is();
            for (const ch of selected.item.completion.commitCharacters) {
                if (ch.length > 0) {
                    acceptCharacters.add(ch.charCodeAt(0));
                }
            }
            this.b = { acceptCharacters, item: selected };
        }
        reset() {
            this.b = undefined;
        }
        dispose() {
            this.a.dispose();
        }
    }
    exports.$F6 = $F6;
});
//# sourceMappingURL=suggestCommitCharacters.js.map