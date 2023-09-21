/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/snippet/browser/snippetSession", "vs/editor/contrib/suggest/browser/suggestController", "vs/base/common/observable", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/base/common/arrays", "vs/base/common/arraysFind"], function (require, exports, event_1, lifecycle_1, position_1, range_1, languages_1, snippetParser_1, snippetSession_1, suggestController_1, observable_1, singleTextEdit_1, arrays_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J6 = exports.$I6 = void 0;
    class $I6 extends lifecycle_1.$kc {
        get selectedItem() {
            return this.j;
        }
        constructor(m, n, r, t) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.c = false;
            this.f = false;
            this.g = false;
            this.h = undefined;
            this.j = (0, observable_1.observableValue)(this, undefined);
            // See the command acceptAlternativeSelectedSuggestion that is bound to shift+tab
            this.B(m.onKeyDown(e => {
                if (e.shiftKey && !this.f) {
                    this.f = true;
                    this.u(this.g);
                }
            }));
            this.B(m.onKeyUp(e => {
                if (e.shiftKey && this.f) {
                    this.f = false;
                    this.u(this.g);
                }
            }));
            const suggestController = suggestController_1.$G6.get(this.m);
            if (suggestController) {
                this.B(suggestController.registerSelector({
                    priority: 100,
                    select: (model, pos, suggestItems) => {
                        (0, observable_1.transaction)(tx => this.r(tx));
                        const textModel = this.m.getModel();
                        if (!textModel) {
                            // Should not happen
                            return -1;
                        }
                        const itemToPreselect = this.n()?.removeCommonPrefix(textModel);
                        if (!itemToPreselect) {
                            return -1;
                        }
                        const position = position_1.$js.lift(pos);
                        const candidates = suggestItems
                            .map((suggestItem, index) => {
                            const suggestItemInfo = $J6.fromSuggestion(suggestController, textModel, position, suggestItem, this.f);
                            const suggestItemTextEdit = suggestItemInfo.toSingleTextEdit().removeCommonPrefix(textModel);
                            const valid = itemToPreselect.augments(suggestItemTextEdit);
                            return { index, valid, prefixLength: suggestItemTextEdit.text.length, suggestItem };
                        })
                            .filter(item => item && item.valid && item.prefixLength > 0);
                        const result = (0, arraysFind_1.$lb)(candidates, (0, arrays_1.$5b)(s => s.prefixLength, arrays_1.$7b));
                        return result ? result.index : -1;
                    }
                }));
                let isBoundToSuggestWidget = false;
                const bindToSuggestWidget = () => {
                    if (isBoundToSuggestWidget) {
                        return;
                    }
                    isBoundToSuggestWidget = true;
                    this.B(suggestController.widget.value.onDidShow(() => {
                        this.c = true;
                        this.u(true);
                    }));
                    this.B(suggestController.widget.value.onDidHide(() => {
                        this.c = false;
                        this.u(false);
                    }));
                    this.B(suggestController.widget.value.onDidFocus(() => {
                        this.c = true;
                        this.u(true);
                    }));
                };
                this.B(event_1.Event.once(suggestController.model.onDidTrigger)(e => {
                    bindToSuggestWidget();
                }));
                this.B(suggestController.onWillInsertSuggestItem(e => {
                    const position = this.m.getPosition();
                    const model = this.m.getModel();
                    if (!position || !model) {
                        return undefined;
                    }
                    const suggestItemInfo = $J6.fromSuggestion(suggestController, model, position, e.item, this.f);
                    this.t(suggestItemInfo);
                }));
            }
            this.u(this.g);
        }
        u(newActive) {
            const newInlineCompletion = this.w();
            if (this.g !== newActive || !suggestItemInfoEquals(this.h, newInlineCompletion)) {
                this.g = newActive;
                this.h = newInlineCompletion;
                (0, observable_1.transaction)(tx => {
                    /** @description Update state from suggest widget */
                    this.r(tx);
                    this.j.set(this.g ? this.h : undefined, tx);
                });
            }
        }
        w() {
            const suggestController = suggestController_1.$G6.get(this.m);
            if (!suggestController || !this.c) {
                return undefined;
            }
            const focusedItem = suggestController.widget.value.getFocusedItem();
            const position = this.m.getPosition();
            const model = this.m.getModel();
            if (!focusedItem || !position || !model) {
                return undefined;
            }
            return $J6.fromSuggestion(suggestController, model, position, focusedItem.item, this.f);
        }
        stopForceRenderingAbove() {
            const suggestController = suggestController_1.$G6.get(this.m);
            suggestController?.stopForceRenderingAbove();
        }
        forceRenderingAbove() {
            const suggestController = suggestController_1.$G6.get(this.m);
            suggestController?.forceRenderingAbove();
        }
    }
    exports.$I6 = $I6;
    class $J6 {
        static fromSuggestion(suggestController, model, position, item, toggleMode) {
            let { insertText } = item.completion;
            let isSnippetText = false;
            if (item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */) {
                const snippet = new snippetParser_1.$G5().parse(insertText);
                if (snippet.children.length < 100) {
                    // Adjust whitespace is expensive.
                    snippetSession_1.$l6.adjustWhitespace(model, position, true, snippet);
                }
                insertText = snippet.toString();
                isSnippetText = true;
            }
            const info = suggestController.getOverwriteInfo(item, toggleMode);
            return new $J6(range_1.$ks.fromPositions(position.delta(0, -info.overwriteBefore), position.delta(0, Math.max(info.overwriteAfter, 0))), insertText, item.completion.kind, isSnippetText);
        }
        constructor(range, insertText, completionItemKind, isSnippetText) {
            this.range = range;
            this.insertText = insertText;
            this.completionItemKind = completionItemKind;
            this.isSnippetText = isSnippetText;
        }
        equals(other) {
            return this.range.equalsRange(other.range)
                && this.insertText === other.insertText
                && this.completionItemKind === other.completionItemKind
                && this.isSnippetText === other.isSnippetText;
        }
        toSelectedSuggestionInfo() {
            return new languages_1.$7s(this.range, this.insertText, this.completionItemKind, this.isSnippetText);
        }
        toSingleTextEdit() {
            return new singleTextEdit_1.$v5(this.range, this.insertText);
        }
    }
    exports.$J6 = $J6;
    function suggestItemInfoEquals(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.equals(b);
    }
});
//# sourceMappingURL=suggestWidgetInlineCompletionProvider.js.map