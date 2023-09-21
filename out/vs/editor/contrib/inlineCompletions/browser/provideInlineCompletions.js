/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/collections", "vs/base/common/errors", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/fixBrackets", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/editor/contrib/inlineCompletions/browser/utils", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, assert_1, async_1, cancellation_1, collections_1, errors_1, range_1, fixBrackets_1, singleTextEdit_1, utils_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionItem = exports.InlineCompletionList = exports.InlineCompletionProviderResult = exports.provideInlineCompletions = void 0;
    async function provideInlineCompletions(registry, position, model, context, token = cancellation_1.CancellationToken.None, languageConfigurationService) {
        // Important: Don't use position after the await calls, as the model could have been changed in the meantime!
        const defaultReplaceRange = getDefaultRange(position, model);
        const providers = registry.all(model);
        const multiMap = new collections_1.SetMap();
        for (const provider of providers) {
            if (provider.groupId) {
                multiMap.add(provider.groupId, provider);
            }
        }
        function getPreferredProviders(provider) {
            if (!provider.yieldsToGroupIds) {
                return [];
            }
            const result = [];
            for (const groupId of provider.yieldsToGroupIds || []) {
                const providers = multiMap.get(groupId);
                for (const p of providers) {
                    result.push(p);
                }
            }
            return result;
        }
        const states = new Map();
        const seen = new Set();
        function findPreferredProviderCircle(provider, stack) {
            stack = [...stack, provider];
            if (seen.has(provider)) {
                return stack;
            }
            seen.add(provider);
            try {
                const preferred = getPreferredProviders(provider);
                for (const p of preferred) {
                    const c = findPreferredProviderCircle(p, stack);
                    if (c) {
                        return c;
                    }
                }
            }
            finally {
                seen.delete(provider);
            }
            return undefined;
        }
        function processProvider(provider) {
            const state = states.get(provider);
            if (state) {
                return state;
            }
            const circle = findPreferredProviderCircle(provider, []);
            if (circle) {
                (0, errors_1.onUnexpectedExternalError)(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${circle.map(s => s.toString ? s.toString() : ('' + s)).join(' -> ')}`));
            }
            const deferredPromise = new async_1.DeferredPromise();
            states.set(provider, deferredPromise.p);
            (async () => {
                if (!circle) {
                    const preferred = getPreferredProviders(provider);
                    for (const p of preferred) {
                        const result = await processProvider(p);
                        if (result && result.items.length > 0) {
                            // Skip provider
                            return undefined;
                        }
                    }
                }
                try {
                    const completions = await provider.provideInlineCompletions(model, position, context, token);
                    return completions;
                }
                catch (e) {
                    (0, errors_1.onUnexpectedExternalError)(e);
                    return undefined;
                }
            })().then(c => deferredPromise.complete(c), e => deferredPromise.error(e));
            return deferredPromise.p;
        }
        const providerResults = await Promise.all(providers.map(async (provider) => ({ provider, completions: await processProvider(provider) })));
        const itemsByHash = new Map();
        const lists = [];
        for (const result of providerResults) {
            const completions = result.completions;
            if (!completions) {
                continue;
            }
            const list = new InlineCompletionList(completions, result.provider);
            lists.push(list);
            for (const item of completions.items) {
                const inlineCompletionItem = InlineCompletionItem.from(item, list, defaultReplaceRange, model, languageConfigurationService);
                itemsByHash.set(inlineCompletionItem.hash(), inlineCompletionItem);
            }
        }
        return new InlineCompletionProviderResult(Array.from(itemsByHash.values()), new Set(itemsByHash.keys()), lists);
    }
    exports.provideInlineCompletions = provideInlineCompletions;
    class InlineCompletionProviderResult {
        constructor(
        /**
         * Free of duplicates.
         */
        completions, hashs, providerResults) {
            this.completions = completions;
            this.hashs = hashs;
            this.providerResults = providerResults;
        }
        has(item) {
            return this.hashs.has(item.hash());
        }
        dispose() {
            for (const result of this.providerResults) {
                result.removeRef();
            }
        }
    }
    exports.InlineCompletionProviderResult = InlineCompletionProviderResult;
    /**
     * A ref counted pointer to the computed `InlineCompletions` and the `InlineCompletionsProvider` that
     * computed them.
     */
    class InlineCompletionList {
        constructor(inlineCompletions, provider) {
            this.inlineCompletions = inlineCompletions;
            this.provider = provider;
            this.refCount = 1;
        }
        addRef() {
            this.refCount++;
        }
        removeRef() {
            this.refCount--;
            if (this.refCount === 0) {
                this.provider.freeInlineCompletions(this.inlineCompletions);
            }
        }
    }
    exports.InlineCompletionList = InlineCompletionList;
    class InlineCompletionItem {
        static from(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService) {
            let insertText;
            let snippetInfo;
            let range = inlineCompletion.range ? range_1.Range.lift(inlineCompletion.range) : defaultReplaceRange;
            if (typeof inlineCompletion.insertText === 'string') {
                insertText = inlineCompletion.insertText;
                if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
                    insertText = closeBrackets(insertText, range.getStartPosition(), textModel, languageConfigurationService);
                    // Modify range depending on if brackets are added or removed
                    const diff = insertText.length - inlineCompletion.insertText.length;
                    if (diff !== 0) {
                        range = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
                    }
                }
                snippetInfo = undefined;
            }
            else if ('snippet' in inlineCompletion.insertText) {
                const preBracketCompletionLength = inlineCompletion.insertText.snippet.length;
                if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
                    inlineCompletion.insertText.snippet = closeBrackets(inlineCompletion.insertText.snippet, range.getStartPosition(), textModel, languageConfigurationService);
                    // Modify range depending on if brackets are added or removed
                    const diff = inlineCompletion.insertText.snippet.length - preBracketCompletionLength;
                    if (diff !== 0) {
                        range = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
                    }
                }
                const snippet = new snippetParser_1.SnippetParser().parse(inlineCompletion.insertText.snippet);
                if (snippet.children.length === 1 && snippet.children[0] instanceof snippetParser_1.Text) {
                    insertText = snippet.children[0].value;
                    snippetInfo = undefined;
                }
                else {
                    insertText = snippet.toString();
                    snippetInfo = {
                        snippet: inlineCompletion.insertText.snippet,
                        range: range
                    };
                }
            }
            else {
                (0, assert_1.assertNever)(inlineCompletion.insertText);
            }
            return new InlineCompletionItem(insertText, inlineCompletion.command, range, insertText, snippetInfo, inlineCompletion.additionalTextEdits || (0, utils_1.getReadonlyEmptyArray)(), inlineCompletion, source);
        }
        constructor(filterText, command, range, insertText, snippetInfo, additionalTextEdits, 
        /**
         * A reference to the original inline completion this inline completion has been constructed from.
         * Used for event data to ensure referential equality.
        */
        sourceInlineCompletion, 
        /**
         * A reference to the original inline completion list this inline completion has been constructed from.
         * Used for event data to ensure referential equality.
        */
        source) {
            this.filterText = filterText;
            this.command = command;
            this.range = range;
            this.insertText = insertText;
            this.snippetInfo = snippetInfo;
            this.additionalTextEdits = additionalTextEdits;
            this.sourceInlineCompletion = sourceInlineCompletion;
            this.source = source;
            filterText = filterText.replace(/\r\n|\r/g, '\n');
            insertText = filterText.replace(/\r\n|\r/g, '\n');
        }
        withRange(updatedRange) {
            return new InlineCompletionItem(this.filterText, this.command, updatedRange, this.insertText, this.snippetInfo, this.additionalTextEdits, this.sourceInlineCompletion, this.source);
        }
        hash() {
            return JSON.stringify({ insertText: this.insertText, range: this.range.toString() });
        }
        toSingleTextEdit() {
            return new singleTextEdit_1.SingleTextEdit(this.range, this.insertText);
        }
    }
    exports.InlineCompletionItem = InlineCompletionItem;
    function getDefaultRange(position, model) {
        const word = model.getWordAtPosition(position);
        const maxColumn = model.getLineMaxColumn(position.lineNumber);
        // By default, always replace up until the end of the current line.
        // This default might be subject to change!
        return word
            ? new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, maxColumn)
            : range_1.Range.fromPositions(position, position.with(undefined, maxColumn));
    }
    function closeBrackets(text, position, model, languageConfigurationService) {
        const lineStart = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
        const newLine = lineStart + text;
        const newTokens = model.tokenization.tokenizeLineWithEdit(position, newLine.length - (position.column - 1), text);
        const slicedTokens = newTokens?.sliceAndInflate(position.column - 1, newLine.length, 0);
        if (!slicedTokens) {
            return text;
        }
        const newText = (0, fixBrackets_1.fixBracketsInLine)(slicedTokens, languageConfigurationService);
        return newText;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZUlubGluZUNvbXBsZXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9wcm92aWRlSW5saW5lQ29tcGxldGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0J6RixLQUFLLFVBQVUsd0JBQXdCLENBQzdDLFFBQTRELEVBQzVELFFBQWtCLEVBQ2xCLEtBQWlCLEVBQ2pCLE9BQWdDLEVBQ2hDLFFBQTJCLGdDQUFpQixDQUFDLElBQUksRUFDakQsNEJBQTREO1FBRTVELDZHQUE2RztRQUM3RyxNQUFNLG1CQUFtQixHQUFHLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFNLEVBQW1FLENBQUM7UUFDL0YsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7WUFDakMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUNyQixRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDekM7U0FDRDtRQUVELFNBQVMscUJBQXFCLENBQUMsUUFBd0M7WUFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFBRSxPQUFPLEVBQUUsQ0FBQzthQUFFO1lBQzlDLE1BQU0sTUFBTSxHQUFxQyxFQUFFLENBQUM7WUFDcEQsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsZ0JBQWdCLElBQUksRUFBRSxFQUFFO2dCQUN0RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN4QyxLQUFLLE1B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