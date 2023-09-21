/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/snippet/browser/snippetSession", "vs/editor/contrib/suggest/browser/suggestController", "vs/base/common/observable", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/base/common/arrays", "vs/base/common/arraysFind"], function (require, exports, event_1, lifecycle_1, position_1, range_1, languages_1, snippetParser_1, snippetSession_1, suggestController_1, observable_1, singleTextEdit_1, arrays_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestItemInfo = exports.SuggestWidgetAdaptor = void 0;
    class SuggestWidgetAdaptor extends lifecycle_1.Disposable {
        get selectedItem() {
            return this._selectedItem;
        }
        constructor(editor, suggestControllerPreselector, checkModelVersion, onWillAccept) {
            super();
            this.editor = editor;
            this.suggestControllerPreselector = suggestControllerPreselector;
            this.checkModelVersion = checkModelVersion;
            this.onWillAccept = onWillAccept;
            this.isSuggestWidgetVisible = false;
            this.isShiftKeyPressed = false;
            this._isActive = false;
            this._currentSuggestItemInfo = undefined;
            this._selectedItem = (0, observable_1.observableValue)(this, undefined);
            // See the command acceptAlternativeSelectedSuggestion that is bound to shift+tab
            this._register(editor.onKeyDown(e => {
                if (e.shiftKey && !this.isShiftKeyPressed) {
                    this.isShiftKeyPressed = true;
                    this.update(this._isActive);
                }
            }));
            this._register(editor.onKeyUp(e => {
                if (e.shiftKey && this.isShiftKeyPressed) {
                    this.isShiftKeyPressed = false;
                    this.update(this._isActive);
                }
            }));
            const suggestController = suggestController_1.SuggestController.get(this.editor);
            if (suggestController) {
                this._register(suggestController.registerSelector({
                    priority: 100,
                    select: (model, pos, suggestItems) => {
                        (0, observable_1.transaction)(tx => this.checkModelVersion(tx));
                        const textModel = this.editor.getModel();
                        if (!textModel) {
                            // Should not happen
                            return -1;
                        }
                        const itemToPreselect = this.suggestControllerPreselector()?.removeCommonPrefix(textModel);
                        if (!itemToPreselect) {
                            return -1;
                        }
                        const position = position_1.Position.lift(pos);
                        const candidates = suggestItems
                            .map((suggestItem, index) => {
                            const suggestItemInfo = SuggestItemInfo.fromSuggestion(suggestController, textModel, position, suggestItem, this.isShiftKeyPressed);
                            const suggestItemTextEdit = suggestItemInfo.toSingleTextEdit().removeCommonPrefix(textModel);
                            const valid = itemToPreselect.augments(suggestItemTextEdit);
                            return { index, valid, prefixLength: suggestItemTextEdit.text.length, suggestItem };
                        })
                            .filter(item => item && item.valid && item.prefixLength > 0);
                        const result = (0, arraysFind_1.findFirstMaxBy)(candidates, (0, arrays_1.compareBy)(s => s.prefixLength, arrays_1.numberComparator));
                        return result ? result.index : -1;
                    }
                }));
                let isBoundToSuggestWidget = false;
                const bindToSuggestWidget = () => {
                    if (isBoundToSuggestWidget) {
                        return;
                    }
                    isBoundToSuggestWidget = true;
                    this._register(suggestController.widget.value.onDidShow(() => {
                        this.isSuggestWidgetVisible = true;
                        this.update(true);
                    }));
                    this._register(suggestController.widget.value.onDidHide(() => {
                        this.isSuggestWidgetVisible = false;
                        this.update(false);
                    }));
                    this._register(suggestController.widget.value.onDidFocus(() => {
                        this.isSuggestWidgetVisible = true;
                        this.update(true);
                    }));
                };
                this._register(event_1.Event.once(suggestController.model.onDidTrigger)(e => {
                    bindToSuggestWidget();
                }));
                this._register(suggestController.onWillInsertSuggestItem(e => {
                    const position = this.editor.getPosition();
                    const model = this.editor.getModel();
                    if (!position || !model) {
                        return undefined;
                    }
                    const suggestItemInfo = SuggestItemInfo.fromSuggestion(suggestController, model, position, e.item, this.isShiftKeyPressed);
                    this.onWillAccept(suggestItemInfo);
                }));
            }
            this.update(this._isActive);
        }
        update(newActive) {
            const newInlineCompletion = this.getSuggestItemInfo();
            if (this._isActive !== newActive || !suggestItemInfoEquals(this._currentSuggestItemInfo, newInlineCompletion)) {
                this._isActive = newActive;
                this._currentSuggestItemInfo = newInlineCompletion;
                (0, observable_1.transaction)(tx => {
                    /** @description Update state from suggest widget */
                    this.checkModelVersion(tx);
                    this._selectedItem.set(this._isActive ? this._currentSuggestItemInfo : undefined, tx);
                });
            }
        }
        getSuggestItemInfo() {
            const suggestController = suggestController_1.SuggestController.get(this.editor);
            if (!suggestController || !this.isSuggestWidgetVisible) {
                return undefined;
            }
            const focusedItem = suggestController.widget.value.getFocusedItem();
            const position = this.editor.getPosition();
            const model = this.editor.getModel();
            if (!focusedItem || !position || !model) {
                return undefined;
            }
            return SuggestItemInfo.fromSuggestion(suggestController, model, position, focusedItem.item, this.isShiftKeyPressed);
        }
        stopForceRenderingAbove() {
            const suggestController = suggestController_1.SuggestController.get(this.editor);
            suggestController?.stopForceRenderingAbove();
        }
        forceRenderingAbove() {
            const suggestController = suggestController_1.SuggestController.get(this.editor);
            suggestController?.forceRenderingAbove();
        }
    }
    exports.SuggestWidgetAdaptor = SuggestWidgetAdaptor;
    class SuggestItemInfo {
        static fromSuggestion(suggestController, model, position, item, toggleMode) {
            let { insertText } = item.completion;
            let isSnippetText = false;
            if (item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */) {
                const snippet = new snippetParser_1.SnippetParser().parse(insertText);
                if (snippet.children.length < 100) {
                    // Adjust whitespace is expensive.
                    snippetSession_1.SnippetSession.adjustWhitespace(model, position, true, snippet);
                }
                insertText = snippet.toString();
                isSnippetText = true;
            }
            const info = suggestController.getOverwriteInfo(item, toggleMode);
            return new SuggestItemInfo(range_1.Range.fromPositions(position.delta(0, -info.overwriteBefore), position.delta(0, Math.max(info.overwriteAfter, 0))), insertText, item.completion.kind, isSnippetText);
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
            return new languages_1.SelectedSuggestionInfo(this.range, this.insertText, this.completionItemKind, this.isSnippetText);
        }
        toSingleTextEdit() {
            return new singleTextEdit_1.SingleTextEdit(this.range, this.insertText);
        }
    }
    exports.SuggestItemInfo = SuggestItemInfo;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdFdpZGdldElubGluZUNvbXBsZXRpb25Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvc3VnZ2VzdFdpZGdldElubGluZUNvbXBsZXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsb0JBQXFCLFNBQVEsc0JBQVU7UUFRbkQsSUFBVyxZQUFZO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsWUFDa0IsTUFBbUIsRUFDbkIsNEJBQThELEVBQzlELGlCQUE2QyxFQUM3QyxZQUE2QztZQUU5RCxLQUFLLEVBQUUsQ0FBQztZQUxTLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDbkIsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUFrQztZQUM5RCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQTRCO1lBQzdDLGlCQUFZLEdBQVosWUFBWSxDQUFpQztZQWZ2RCwyQkFBc0IsR0FBWSxLQUFLLENBQUM7WUFDeEMsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQzFCLGNBQVMsR0FBRyxLQUFLLENBQUM7WUFDbEIsNEJBQXVCLEdBQWdDLFNBQVMsQ0FBQztZQUV4RCxrQkFBYSxHQUFHLElBQUEsNEJBQWUsRUFBQyxJQUFJLEVBQUUsU0FBd0MsQ0FBQyxDQUFDO1lBY2hHLGlGQUFpRjtZQUNqRixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztvQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJ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