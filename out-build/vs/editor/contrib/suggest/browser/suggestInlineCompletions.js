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
    exports.$20 = void 0;
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
    let InlineCompletionResults = class InlineCompletionResults extends lifecycle_1.$mc {
        constructor(model, line, word, completionModel, completions, c) {
            super(completions.disposable);
            this.model = model;
            this.line = line;
            this.word = word;
            this.completionModel = completionModel;
            this.c = c;
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
            const selectedIndex = this.c.select(this.model, { lineNumber: this.line, column: this.word.endColumn + this.completionModel.lineContext.characterCountDelta }, items);
            const first = iterator_1.Iterable.slice(items, selectedIndex);
            const second = iterator_1.Iterable.slice(items, 0, selectedIndex);
            let resolveCount = 5;
            for (const item of iterator_1.Iterable.concat(first, second)) {
                if (item.score === filters_1.FuzzyScore.Default) {
                    // skip items that have no overlap
                    continue;
                }
                const range = new range_1.$ks(item.editStart.lineNumber, item.editStart.column, item.editInsertEnd.lineNumber, item.editInsertEnd.column + this.completionModel.lineContext.characterCountDelta // end PLUS character delta
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
        __param(5, suggestMemory_1.$r6)
    ], InlineCompletionResults);
    let $20 = class $20 {
        constructor(b, c, d, e) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        async provideInlineCompletions(model, position, context, token) {
            if (context.selectedSuggestionInfo) {
                return;
            }
            const config = this.b(88 /* EditorOption.quickSuggestions */, model);
            if (suggest_1.$65.isAllOff(config)) {
                // quick suggest is off (for this model/language)
                return;
            }
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
            const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(position.column - 1 - 1, 0)));
            if (suggest_1.$65.valueFor(config, tokenType) !== 'inline') {
                // quick suggest is off (for this token)
                return undefined;
            }
            // We consider non-empty leading words and trigger characters. The latter only
            // when no word is being typed (word characters superseed trigger characters)
            let wordInfo = model.getWordAtPosition(position);
            let triggerCharacterInfo;
            if (!wordInfo?.word) {
                triggerCharacterInfo = this.f(model, position);
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
            const leadingLineContents = model.getValueInRange(new range_1.$ks(position.lineNumber, 1, position.lineNumber, position.column));
            if (!triggerCharacterInfo && this.a?.canBeReused(model, position.lineNumber, wordInfo)) {
                // reuse a previous result iff possible, only a refilter is needed
                // TODO@jrieken this can be improved further and only incomplete results can be updated
                // console.log(`REUSE with ${wordInfo.word}`);
                const newLineContext = new completionModel_1.$75(leadingLineContents, position.column - this.a.word.endColumn);
                this.a.completionModel.lineContext = newLineContext;
                this.a.acquire();
                result = this.a;
            }
            else {
                // refesh model is required
                const completions = await (0, suggest_1.$35)(this.c.completionProvider, model, position, new suggest_1.$Y5(undefined, undefined, triggerCharacterInfo?.providers), triggerCharacterInfo && { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: triggerCharacterInfo.ch }, token);
                let clipboardText;
                if (completions.needsClipboard) {
                    clipboardText = await this.d.readText();
                }
                const completionModel = new completionModel_1.$85(completions.items, position.column, new completionModel_1.$75(leadingLineContents, 0), wordDistance_1.$P5.None, this.b(117 /* EditorOption.suggest */, model), this.b(111 /* EditorOption.snippetSuggestions */, model), { boostFullMatch: false, firstMatchCanBeWeak: false }, clipboardText);
                result = new InlineCompletionResults(model, position.lineNumber, wordInfo, completionModel, completions, this.e);
            }
            this.a = result;
            return result;
        }
        handleItemDidShow(_completions, item) {
            item.completion.resolve(cancellation_1.CancellationToken.None);
        }
        freeInlineCompletions(result) {
            result.release();
        }
        f(model, position) {
            const ch = model.getValueInRange(range_1.$ks.fromPositions({ lineNumber: position.lineNumber, column: position.column - 1 }, position));
            const providers = new Set();
            for (const provider of this.c.completionProvider.all(model)) {
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
    exports.$20 = $20;
    exports.$20 = $20 = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, clipboardService_1.$UZ),
        __param(3, suggestMemory_1.$r6)
    ], $20);
    let EditorContribution = class EditorContribution {
        static { EditorContribution_1 = this; }
        static { this.a = 0; }
        constructor(_editor, languageFeatureService, editorService, instaService) {
            // HACK - way to contribute something only once
            if (++EditorContribution_1.a === 1) {
                const provider = instaService.createInstance($20, (id, model) => {
                    // HACK - reuse the editor options world outside from a "normal" contribution
                    const editor = editorService.listCodeEditors().find(editor => editor.getModel() === model) ?? _editor;
                    return editor.getOption(id);
                });
                EditorContribution_1.b = languageFeatureService.inlineCompletionsProvider.register('*', provider);
            }
        }
        dispose() {
            if (--EditorContribution_1.a === 0) {
                EditorContribution_1.b?.dispose();
                EditorContribution_1.b = undefined;
            }
        }
    };
    EditorContribution = EditorContribution_1 = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, codeEditorService_1.$nV),
        __param(3, instantiation_1.$Ah)
    ], EditorContribution);
    (0, editorExtensions_1.$AV)('suggest.inlineCompletionsProvider', EditorContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because the contribution is used as a way to ONCE access a service to which a provider is registered
});
//# sourceMappingURL=suggestInlineCompletions.js.map