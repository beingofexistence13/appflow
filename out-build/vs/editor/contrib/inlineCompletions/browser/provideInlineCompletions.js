/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/collections", "vs/base/common/errors", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/fixBrackets", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/editor/contrib/inlineCompletions/browser/utils", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, assert_1, async_1, cancellation_1, collections_1, errors_1, range_1, fixBrackets_1, singleTextEdit_1, utils_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$K5 = exports.$J5 = exports.$I5 = exports.$H5 = void 0;
    async function $H5(registry, position, model, context, token = cancellation_1.CancellationToken.None, languageConfigurationService) {
        // Important: Don't use position after the await calls, as the model could have been changed in the meantime!
        const defaultReplaceRange = getDefaultRange(position, model);
        const providers = registry.all(model);
        const multiMap = new collections_1.$L();
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
                (0, errors_1.$Z)(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${circle.map(s => s.toString ? s.toString() : ('' + s)).join(' -> ')}`));
            }
            const deferredPromise = new async_1.$2g();
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
                    (0, errors_1.$Z)(e);
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
            const list = new $J5(completions, result.provider);
            lists.push(list);
            for (const item of completions.items) {
                const inlineCompletionItem = $K5.from(item, list, defaultReplaceRange, model, languageConfigurationService);
                itemsByHash.set(inlineCompletionItem.hash(), inlineCompletionItem);
            }
        }
        return new $I5(Array.from(itemsByHash.values()), new Set(itemsByHash.keys()), lists);
    }
    exports.$H5 = $H5;
    class $I5 {
        constructor(
        /**
         * Free of duplicates.
         */
        completions, a, b) {
            this.completions = completions;
            this.a = a;
            this.b = b;
        }
        has(item) {
            return this.a.has(item.hash());
        }
        dispose() {
            for (const result of this.b) {
                result.removeRef();
            }
        }
    }
    exports.$I5 = $I5;
    /**
     * A ref counted pointer to the computed `InlineCompletions` and the `InlineCompletionsProvider` that
     * computed them.
     */
    class $J5 {
        constructor(inlineCompletions, provider) {
            this.inlineCompletions = inlineCompletions;
            this.provider = provider;
            this.a = 1;
        }
        addRef() {
            this.a++;
        }
        removeRef() {
            this.a--;
            if (this.a === 0) {
                this.provider.freeInlineCompletions(this.inlineCompletions);
            }
        }
    }
    exports.$J5 = $J5;
    class $K5 {
        static from(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService) {
            let insertText;
            let snippetInfo;
            let range = inlineCompletion.range ? range_1.$ks.lift(inlineCompletion.range) : defaultReplaceRange;
            if (typeof inlineCompletion.insertText === 'string') {
                insertText = inlineCompletion.insertText;
                if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
                    insertText = closeBrackets(insertText, range.getStartPosition(), textModel, languageConfigurationService);
                    // Modify range depending on if brackets are added or removed
                    const diff = insertText.length - inlineCompletion.insertText.length;
                    if (diff !== 0) {
                        range = new range_1.$ks(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
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
                        range = new range_1.$ks(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
                    }
                }
                const snippet = new snippetParser_1.$G5().parse(inlineCompletion.insertText.snippet);
                if (snippet.children.length === 1 && snippet.children[0] instanceof snippetParser_1.$y5) {
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
                (0, assert_1.$vc)(inlineCompletion.insertText);
            }
            return new $K5(insertText, inlineCompletion.command, range, insertText, snippetInfo, inlineCompletion.additionalTextEdits || (0, utils_1.$l5)(), inlineCompletion, source);
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
            return new $K5(this.filterText, this.command, updatedRange, this.insertText, this.snippetInfo, this.additionalTextEdits, this.sourceInlineCompletion, this.source);
        }
        hash() {
            return JSON.stringify({ insertText: this.insertText, range: this.range.toString() });
        }
        toSingleTextEdit() {
            return new singleTextEdit_1.$v5(this.range, this.insertText);
        }
    }
    exports.$K5 = $K5;
    function getDefaultRange(position, model) {
        const word = model.getWordAtPosition(position);
        const maxColumn = model.getLineMaxColumn(position.lineNumber);
        // By default, always replace up until the end of the current line.
        // This default might be subject to change!
        return word
            ? new range_1.$ks(position.lineNumber, word.startColumn, position.lineNumber, maxColumn)
            : range_1.$ks.fromPositions(position, position.with(undefined, maxColumn));
    }
    function closeBrackets(text, position, model, languageConfigurationService) {
        const lineStart = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
        const newLine = lineStart + text;
        const newTokens = model.tokenization.tokenizeLineWithEdit(position, newLine.length - (position.column - 1), text);
        const slicedTokens = newTokens?.sliceAndInflate(position.column - 1, newLine.length, 0);
        if (!slicedTokens) {
            return text;
        }
        const newText = (0, fixBrackets_1.$u5)(slicedTokens, languageConfigurationService);
        return newText;
    }
});
//# sourceMappingURL=provideInlineCompletions.js.map