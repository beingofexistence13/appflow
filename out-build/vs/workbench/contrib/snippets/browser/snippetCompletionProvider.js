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
define(["require", "exports", "vs/base/common/htmlContent", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls!vs/workbench/contrib/snippets/browser/snippetCompletionProvider", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/filters", "vs/base/common/stopwatch", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/core/wordHelper", "vs/platform/commands/common/commands"], function (require, exports, htmlContent_1, strings_1, range_1, language_1, snippetParser_1, nls_1, snippets_1, snippetsFile_1, filters_1, stopwatch_1, languageConfigurationRegistry_1, wordHelper_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nmb = exports.$mmb = void 0;
    const markSnippetAsUsed = '_snippet.markAsUsed';
    commands_1.$Gr.registerCommand(markSnippetAsUsed, (accessor, ...args) => {
        const snippetsService = accessor.get(snippets_1.$amb);
        const [first] = args;
        if (first instanceof snippetsFile_1.$$lb) {
            snippetsService.updateUsageTimestamp(first);
        }
    });
    class $mmb {
        constructor(snippet, range) {
            this.snippet = snippet;
            this.label = { label: snippet.prefix, description: snippet.name };
            this.detail = (0, nls_1.localize)(0, null, snippet.description || snippet.name, snippet.source);
            this.insertText = snippet.codeSnippet;
            this.extensionId = snippet.extensionId;
            this.range = range;
            this.sortText = `${snippet.snippetSource === 3 /* SnippetSource.Extension */ ? 'z' : 'a'}-${snippet.prefix}`;
            this.kind = 27 /* CompletionItemKind.Snippet */;
            this.insertTextRules = 4 /* CompletionItemInsertTextRule.InsertAsSnippet */;
            this.command = { id: markSnippetAsUsed, title: '', arguments: [snippet] };
        }
        resolve() {
            this.documentation = new htmlContent_1.$Xj().appendCodeblock('', snippetParser_1.$G5.asInsertText(this.snippet.codeSnippet));
            return this;
        }
        static compareByLabel(a, b) {
            return (0, strings_1.$Fe)(a.label.label, b.label.label);
        }
    }
    exports.$mmb = $mmb;
    let $nmb = class $nmb {
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this._debugDisplayName = 'snippetCompletions';
            //
        }
        async provideCompletionItems(model, position, context) {
            const sw = new stopwatch_1.$bd();
            const languageId = this.f(model, position);
            const languageConfig = this.e.getLanguageConfiguration(languageId);
            const snippets = new Set(await this.d.getSnippets(languageId));
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
                const word = (0, wordHelper_1.$Zr)(1, languageConfig.getWordDefinition(), snippet.prefixLow, 0);
                if (wordUntil && word && !(0, filters_1.$Ij)(wordUntil, 0, wordUntil.length, snippet.prefixLow, 0, snippet.prefixLow.length)) {
                    // when at a word the snippet prefix must match
                    continue snippet;
                }
                // don't eat into leading whitespace unless the snippet prefix starts with whitespace
                const minPos = (0, strings_1.$Be)(snippet.prefixLow) === 0
                    ? Math.max(0, model.getLineFirstNonWhitespaceColumn(position.lineNumber) - 1)
                    : 0;
                column: for (let pos = Math.max(minPos, columnOffset - snippet.prefixLow.length); pos < lineContentLow.length; pos++) {
                    if (!(0, filters_1.$Ij)(lineContentLow, pos, columnOffset, snippet.prefixLow, 0, snippet.prefixLow.length)) {
                        continue column;
                    }
                    const prefixRestLen = snippet.prefixLow.length - (columnOffset - pos);
                    const endsWithPrefixRest = (0, strings_1.$Ge)(lineContentLow, snippet.prefixLow, columnOffset, columnOffset + prefixRestLen, columnOffset - pos);
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
                    const replace = range_1.$ks.fromPositions(startPosition, { lineNumber: position.lineNumber, column: endColumn });
                    const insert = replace.setEndPosition(position.lineNumber, position.column);
                    suggestions.push(new $mmb(snippet, { replace, insert }));
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
                        const insert = range_1.$ks.fromPositions(position);
                        const replace = lineContentLow.indexOf(snippet.prefixLow, columnOffset) === columnOffset ? insert.setEndPosition(position.lineNumber, position.column + snippet.prefixLow.length) : insert;
                        suggestions.push(new $mmb(snippet, { replace, insert }));
                    }
                }
            }
            // dismbiguate suggestions with same labels
            suggestions.sort($mmb.compareByLabel);
            for (let i = 0; i < suggestions.length; i++) {
                const item = suggestions[i];
                let to = i + 1;
                for (; to < suggestions.length && item.label === suggestions[to].label; to++) {
                    suggestions[to].label.label = (0, nls_1.localize)(1, null, suggestions[to].label.label, suggestions[to].snippet.name);
                }
                if (to > i + 1) {
                    suggestions[i].label.label = (0, nls_1.localize)(2, null, suggestions[i].label.label, suggestions[i].snippet.name);
                    i = to;
                }
            }
            return {
                suggestions,
                duration: sw.elapsed()
            };
        }
        resolveCompletionItem(item) {
            return (item instanceof $mmb) ? item.resolve() : item;
        }
        f(model, position) {
            // validate the `languageId` to ensure this is a user
            // facing language with a name and the chance to have
            // snippets, else fall back to the outer language
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            let languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
            if (!this.c.getLanguageName(languageId)) {
                languageId = model.getLanguageId();
            }
            return languageId;
        }
    };
    exports.$nmb = $nmb;
    exports.$nmb = $nmb = __decorate([
        __param(0, language_1.$ct),
        __param(1, snippets_1.$amb),
        __param(2, languageConfigurationRegistry_1.$2t)
    ], $nmb);
});
//# sourceMappingURL=snippetCompletionProvider.js.map