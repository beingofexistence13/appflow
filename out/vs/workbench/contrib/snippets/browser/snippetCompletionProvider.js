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
define(["require", "exports", "vs/base/common/htmlContent", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/filters", "vs/base/common/stopwatch", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/core/wordHelper", "vs/platform/commands/common/commands"], function (require, exports, htmlContent_1, strings_1, range_1, language_1, snippetParser_1, nls_1, snippets_1, snippetsFile_1, filters_1, stopwatch_1, languageConfigurationRegistry_1, wordHelper_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetCompletionProvider = exports.SnippetCompletion = void 0;
    const markSnippetAsUsed = '_snippet.markAsUsed';
    commands_1.CommandsRegistry.registerCommand(markSnippetAsUsed, (accessor, ...args) => {
        const snippetsService = accessor.get(snippets_1.ISnippetsService);
        const [first] = args;
        if (first instanceof snippetsFile_1.Snippet) {
            snippetsService.updateUsageTimestamp(first);
        }
    });
    class SnippetCompletion {
        constructor(snippet, range) {
            this.snippet = snippet;
            this.label = { label: snippet.prefix, description: snippet.name };
            this.detail = (0, nls_1.localize)('detail.snippet', "{0} ({1})", snippet.description || snippet.name, snippet.source);
            this.insertText = snippet.codeSnippet;
            this.extensionId = snippet.extensionId;
            this.range = range;
            this.sortText = `${snippet.snippetSource === 3 /* SnippetSource.Extension */ ? 'z' : 'a'}-${snippet.prefix}`;
            this.kind = 27 /* CompletionItemKind.Snippet */;
            this.insertTextRules = 4 /* CompletionItemInsertTextRule.InsertAsSnippet */;
            this.command = { id: markSnippetAsUsed, title: '', arguments: [snippet] };
        }
        resolve() {
            this.documentation = new htmlContent_1.MarkdownString().appendCodeblock('', snippetParser_1.SnippetParser.asInsertText(this.snippet.codeSnippet));
            return this;
        }
        static compareByLabel(a, b) {
            return (0, strings_1.compare)(a.label.label, b.label.label);
        }
    }
    exports.SnippetCompletion = SnippetCompletion;
    let SnippetCompletionProvider = class SnippetCompletionProvider {
        constructor(_languageService, _snippets, _languageConfigurationService) {
            this._languageService = _languageService;
            this._snippets = _snippets;
            this._languageConfigurationService = _languageConfigurationService;
            this._debugDisplayName = 'snippetCompletions';
            //
        }
        async provideCompletionItems(model, position, context) {
            const sw = new stopwatch_1.StopWatch();
            const languageId = this._getLanguageIdAtPosition(model, position);
            const languageConfig = this._languageConfigurationService.getLanguageConfiguration(languageId);
            const snippets = new Set(await this._snippets.getSnippets(languageId));
            const lineContentLow = model.getLineContent(position.lineNumber).toLowerCase();
            const wordUntil = model.getWordUntilPosition(position).word.toLowerCase();
            const suggestions = [];
            const columnOffset = position.column - 1;
            const triggerCharacterLow = context.triggerCharacter?.toLowerCase() ?? '';
            snippet: for (const snippet of snippets) {
                if (context.triggerKind === 1 /* CompletionTriggerKind.TriggerCharacter */ && !snippet.prefixLow.startsWith(triggerCharacterLow)) {
                    // strict -> when having trigger characters they must prefix-match
                    continue snippet;
                }
                const word = (0, wordHelper_1.getWordAtText)(1, languageConfig.getWordDefinition(), snippet.prefixLow, 0);
                if (wordUntil && word && !(0, filters_1.isPatternInWord)(wordUntil, 0, wordUntil.length, snippet.prefixLow, 0, snippet.prefixLow.length)) {
                    // when at a word the snippet prefix must match
                    continue snippet;
                }
                // don't eat into leading whitespace unless the snippet prefix starts with whitespace
                const minPos = (0, strings_1.firstNonWhitespaceIndex)(snippet.prefixLow) === 0
                    ? Math.max(0, model.getLineFirstNonWhitespaceColumn(position.lineNumber) - 1)
                    : 0;
                column: for (let pos = Math.max(minPos, columnOffset - snippet.prefixLow.length); pos < lineContentLow.length; pos++) {
                    if (!(0, filters_1.isPatternInWord)(lineContentLow, pos, columnOffset, snippet.prefixLow, 0, snippet.prefixLow.length)) {
                        continue column;
                    }
                    const prefixRestLen = snippet.prefixLow.length - (columnOffset - pos);
                    const endsWithPrefixRest = (0, strings_1.compareSubstring)(lineContentLow, snippet.prefixLow, columnOffset, columnOffset + prefixRestLen, columnOffset - pos);
                    const startPosition = position.with(undefined, pos + 1);
                    if (wordUntil && position.equals(startPosition)) {
                        // at word-end but no overlap
                        continue snippet;
                    }
                    let endColumn = endsWithPrefixRest === 0 ? position.column + prefixRestLen : position.column;
                    // First check if there is anything to the right of the cursor
                    if (columnOffset < lineContentLow.length) {
                        const autoClosingPairs = languageConfig.getAutoClosingPairs();
                        const standardAutoClosingPairConditionals = autoClosingPairs.autoClosingPairsCloseSingleChar.get(lineContentLow[columnOffset]);
                        // If the character to the right of the cursor is a closing character of an autoclosing pair
                        if (standardAutoClosingPairConditionals?.some(p => 
                        // and the start position is the opening character of an autoclosing pair
                        p.open === lineContentLow[startPosition.column - 1] &&
                            // and the snippet prefix contains the opening and closing pair at its edges
                            snippet.prefix.startsWith(p.open) &&
                            snippet.prefix[snippet.prefix.length - 1] === p.close)) {
                            // Eat the character that was likely inserted because of auto-closing pairs
                            endColumn++;
                        }
                    }
                    const replace = range_1.Range.fromPositions(startPosition, { lineNumber: position.lineNumber, column: endColumn });
                    const insert = replace.setEndPosition(position.lineNumber, position.column);
                    suggestions.push(new SnippetCompletion(snippet, { replace, insert }));
                    snippets.delete(snippet);
                    break;
                }
            }
            // add remaing snippets when the current prefix ends in whitespace or when line is empty
            // and when not having a trigger character
            if (!triggerCharacterLow) {
                const endsInWhitespace = /\s/.test(lineContentLow[position.column - 2]);
                if (endsInWhitespace || !lineContentLow /*empty line*/) {
                    for (const snippet of snippets) {
                        const insert = range_1.Range.fromPositions(position);
                        const replace = lineContentLow.indexOf(snippet.prefixLow, columnOffset) === columnOffset ? insert.setEndPosition(position.lineNumber, position.column + snippet.prefixLow.length) : insert;
                        suggestions.push(new SnippetCompletion(snippet, { replace, insert }));
                    }
                }
            }
            // dismbiguate suggestions with same labels
            suggestions.sort(SnippetCompletion.compareByLabel);
            for (let i = 0; i < suggestions.length; i++) {
                const item = suggestions[i];
                let to = i + 1;
                for (; to < suggestions.length && item.label === suggestions[to].label; to++) {
                    suggestions[to].label.label = (0, nls_1.localize)('snippetSuggest.longLabel', "{0}, {1}", suggestions[to].label.label, suggestions[to].snippet.name);
                }
                if (to > i + 1) {
                    suggestions[i].label.label = (0, nls_1.localize)('snippetSuggest.longLabel', "{0}, {1}", suggestions[i].label.label, suggestions[i].snippet.name);
                    i = to;
                }
            }
            return {
                suggestions,
                duration: sw.elapsed()
            };
        }
        resolveCompletionItem(item) {
            return (item instanceof SnippetCompletion) ? item.resolve() : item;
        }
        _getLanguageIdAtPosition(model, position) {
            // validate the `languageId` to ensure this is a user
            // facing language with a name and the chance to have
            // snippets, else fall back to the outer language
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            let languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
            if (!this._languageService.getLanguageName(languageId)) {
                languageId = model.getLanguageId();
            }
            return languageId;
        }
    };
    exports.SnippetCompletionProvider = SnippetCompletionProvider;
    exports.SnippetCompletionProvider = SnippetCompletionProvider = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, snippets_1.ISnippetsService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], SnippetCompletionProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldENvbXBsZXRpb25Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL2Jyb3dzZXIvc25pcHBldENvbXBsZXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQmhHLE1BQU0saUJBQWlCLEdBQUcscUJBQXFCLENBQUM7SUFFaEQsMkJBQWdCLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUU7UUFDekUsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxLQUFLLFlBQVksc0JBQU8sRUFBRTtZQUM3QixlQUFlLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUM7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVILE1BQWEsaUJBQWlCO1FBYTdCLFlBQ1UsT0FBZ0IsRUFDekIsS0FBbUQ7WUFEMUMsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUd6QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNHLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUN0QyxJQUFJLENBQUMsV0FB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