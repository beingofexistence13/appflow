/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/suggest/browser/completionModel", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/contrib/suggest/browser/wordDistance", "vs/platform/clipboard/common/clipboardService", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, filters_1, iterator_1, lifecycle_1, editorExtensions_1, codeEditorService_1, range_1, languageFeatures_1, completionModel_1, suggest_1, suggestMemory_1, wordDistance_1, clipboardService_1, instantiation_1) {
    "use strict";
    var EditorContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestInlineCompletions = void 0;
    class SuggestInlineCompletion {
        constructor(range, insertText, filterText, additionalTextEdits, command, completion) {
            this.range = range;
            this.insertText = insertText;
            this.filterText = filterText;
            this.additionalTextEdits = additionalTextEdits;
            this.command = command;
            this.completion = completion;
        }
    }
    let InlineCompletionResults = class InlineCompletionResults extends lifecycle_1.RefCountedDisposable {
        constructor(model, line, word, completionModel, completions, _suggestMemoryService) {
            super(completions.disposable);
            this.model = model;
            this.line = line;
            this.word = word;
            this.completionModel = completionModel;
            this._suggestMemoryService = _suggestMemoryService;
        }
        canBeReused(model, line, word) {
            return this.model === model // same model
                && this.line === line
                && this.word.word.length > 0
                && this.word.startColumn === word.startColumn && this.word.endColumn < word.endColumn // same word
                && this.completionModel.getIncompleteProvider().size === 0; // no incomplete results
        }
        get items() {
            const result = [];
            // Split items by preselected index. This ensures the memory-selected item shows first and that better/worst
            // ranked items are before/after
            const { items } = this.completionModel;
            const selectedIndex = this._suggestMemoryService.select(this.model, { lineNumber: this.line, column: this.word.endColumn + this.completionModel.lineContext.characterCountDelta }, items);
            const first = iterator_1.Iterable.slice(items, selectedIndex);
            const second = iterator_1.Iterable.slice(items, 0, selectedIndex);
            let resolveCount = 5;
            for (const item of iterator_1.Iterable.concat(first, second)) {
                if (item.score === filters_1.FuzzyScore.Default) {
                    // skip items that have no overlap
                    continue;
                }
                const range = new range_1.Range(item.editStart.lineNumber, item.editStart.column, item.editInsertEnd.lineNumber, item.editInsertEnd.column + this.completionModel.lineContext.characterCountDelta // end PLUS character delta
                );
                const insertText = item.completion.insertTextRules && (item.completion.insertTextRules & 4 /* CompletionItemInsertTextRule.InsertAsSnippet */)
                    ? { snippet: item.completion.insertText }
                    : item.completion.insertText;
                result.push(new SuggestInlineCompletion(range, insertText, item.filterTextLow ?? item.labelLow, item.completion.additionalTextEdits, item.completion.command, item));
                // resolve the first N suggestions eagerly
                if (resolveCount-- >= 0) {
                    item.resolve(cancellation_1.CancellationToken.None);
                }
            }
            return result;
        }
    };
    InlineCompletionResults = __decorate([
        __param(5, suggestMemory_1.ISuggestMemoryService)
    ], InlineCompletionResults);
    let SuggestInlineCompletions = class SuggestInlineCompletions {
        constructor(_getEditorOption, _languageFeatureService, _clipboardService, _suggestMemoryService) {
            this._getEditorOption = _getEditorOption;
            this._languageFeatureService = _languageFeatureService;
            this._clipboardService = _clipboardService;
            this._suggestMemoryService = _suggestMemoryService;
        }
        async provideInlineCompletions(model, position, context, token) {
            if (context.selectedSuggestionInfo) {
                return;
            }
            const config = this._getEditorOption(88 /* EditorOption.quickSuggestions */, model);
            if (suggest_1.QuickSuggestionsOptions.isAllOff(config)) {
                // quick suggest is off (for this model/language)
                return;
            }
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
            const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(position.column - 1 - 1, 0)));
            if (suggest_1.QuickSuggestionsOptions.valueFor(config, tokenType) !== 'inline') {
                // quick suggest is off (for this token)
                return undefined;
            }
            // We consider non-empty leading words and trigger characters. The latter only
            // when no word is being typed (word characters superseed trigger characters)
            let wordInfo = model.getWordAtPosition(position);
            let triggerCharacterInfo;
            if (!wordInfo?.word) {
                triggerCharacterInfo = this._getTriggerCharacterInfo(model, position);
            }
            if (!wordInfo?.word && !triggerCharacterInfo) {
                // not at word, not a trigger character
                return;
            }
            // ensure that we have word information and that we are at the end of a word
            // otherwise we stop because we don't want to do quick suggestions inside words
            if (!wordInfo) {
                wordInfo = model.getWordUntilPosition(position);
            }
            if (wordInfo.endColumn !== position.column) {
                return;
            }
            let result;
            const leadingLineContents = model.getValueInRange(new range_1.Range(position.lineNumber, 1, position.lineNumber, position.column));
            if (!triggerCharacterInfo && this._lastResult?.canBeReused(model, position.lineNumber, wordInfo)) {
                // reuse a previous result iff possible, only a refilter is needed
                // TODO@jrieken this can be improved further and only incomplete results can be updated
                // console.log(`REUSE with ${wordInfo.word}`);
                const newLineContext = new completionModel_1.LineContext(leadingLineContents, position.column - this._lastResult.word.endColumn);
                this._lastResult.completionModel.lineContext = newLineContext;
                this._lastResult.acquire();
                result = this._lastResult;
            }
            else {
                // refesh model is required
                const completions = await (0, suggest_1.provideSuggestionItems)(this._languageFeatureService.completionProvider, model, position, new suggest_1.CompletionOptions(undefined, undefined, triggerCharacterInfo?.providers), triggerCharacterInfo && { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: triggerCharacterInfo.ch }, token);
                let clipboardText;
                if (completions.needsClipboard) {
                    clipboardText = await this._clipboardService.readText();
                }
                const completionModel = new completionModel_1.CompletionModel(completions.items, position.column, new completionModel_1.LineContext(leadingLineContents, 0), wordDistance_1.WordDistance.None, this._getEditorOption(117 /* EditorOption.suggest */, model), this._getEditorOption(111 /* EditorOption.snippetSuggestions */, model), { boostFullMatch: false, firstMatchCanBeWeak: false }, clipboardText);
                result = new InlineCompletionResults(model, position.lineNumber, wordInfo, completionModel, completions, this._suggestMemoryService);
            }
            this._lastResult = result;
            return result;
        }
        handleItemDidShow(_completions, item) {
            item.completion.resolve(cancellation_1.CancellationToken.None);
        }
        freeInlineCompletions(result) {
            result.release();
        }
        _getTriggerCharacterInfo(model, position) {
            const ch = model.getValueInRange(range_1.Range.fromPositions({ lineNumber: position.lineNumber, column: position.column - 1 }, position));
            const providers = new Set();
            for (const provider of this._languageFeatureService.completionProvider.all(model)) {
                if (provider.triggerCharacters?.includes(ch)) {
                    providers.add(provider);
                }
            }
            if (providers.size === 0) {
                return undefined;
            }
            return { providers, ch };
        }
    };
    exports.SuggestInlineCompletions = SuggestInlineCompletions;
    exports.SuggestInlineCompletions = SuggestInlineCompletions = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, clipboardService_1.IClipboardService),
        __param(3, suggestMemory_1.ISuggestMemoryService)
    ], SuggestInlineCompletions);
    let EditorContribution = class EditorContribution {
        static { EditorContribution_1 = this; }
        static { this._counter = 0; }
        constructor(_editor, languageFeatureService, editorService, instaService) {
            // HACK - way to contribute something only once
            if (++EditorContribution_1._counter === 1) {
                const provider = instaService.createInstance(SuggestInlineCompletions, (id, model) => {
                    // HACK - reuse the editor options world outside from a "normal" contribution
                    const editor = editorService.listCodeEditors().find(editor => editor.getModel() === model) ?? _editor;
                    return editor.getOption(id);
                });
                EditorContribution_1._disposable = languageFeatureService.inlineCompletionsProvider.register('*', provider);
            }
        }
        dispose() {
            if (--EditorContribution_1._counter === 0) {
                EditorContribution_1._disposable?.dispose();
                EditorContribution_1._disposable = undefined;
            }
        }
    };
    EditorContribution = EditorContribution_1 = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, instantiation_1.IInstantiationService)
    ], EditorContribution);
    (0, editorExtensions_1.registerEditorContribution)('suggest.inlineCompletionsProvider', EditorContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because the contribution is used as a way to ONCE access a service to which a provider is registered
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdElubGluZUNvbXBsZXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC9icm93c2VyL3N1Z2dlc3RJbmxpbmVDb21wbGV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLHVCQUF1QjtRQUU1QixZQUNVLEtBQWEsRUFDYixVQUF3QyxFQUN4QyxVQUFrQixFQUNsQixtQkFBdUQsRUFDdkQsT0FBNEIsRUFDNUIsVUFBMEI7WUFMMUIsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLGVBQVUsR0FBVixVQUFVLENBQThCO1lBQ3hDLGVBQVUsR0FBVixVQUFVLENBQVE7WUFDbEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQztZQUN2RCxZQUFPLEdBQVAsT0FBTyxDQUFxQjtZQUM1QixlQUFVLEdBQVYsVUFBVSxDQUFnQjtRQUNoQyxDQUFDO0tBQ0w7SUFFRCxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLGdDQUFvQjtRQUV6RCxZQUNVLEtBQWlCLEVBQ2pCLElBQVksRUFDWixJQUFxQixFQUNyQixlQUFnQyxFQUN6QyxXQUFnQyxFQUNRLHFCQUE0QztZQUVwRixLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBUHJCLFVBQUssR0FBTCxLQUFLLENBQVk7WUFDakIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLFNBQUksR0FBSixJQUFJLENBQWlCO1lBQ3JCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUVELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFHckYsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFpQixFQUFFLElBQVksRUFBRSxJQUFxQjtZQUNqRSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLGFBQWE7bUJB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