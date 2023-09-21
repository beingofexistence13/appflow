/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls!vs/editor/contrib/suggest/browser/suggest", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/platform/history/browser/contextScopedHistoryWidget"], function (require, exports, cancellation_1, errors_1, filters_1, lifecycle_1, stopwatch_1, types_1, uri_1, position_1, range_1, resolverService_1, snippetParser_1, nls_1, actions_1, commands_1, contextkey_1, languageFeatures_1, contextScopedHistoryWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$65 = exports.$55 = exports.$45 = exports.$35 = exports.$25 = exports.$15 = exports.$Z5 = exports.$Y5 = exports.SnippetSortOrder = exports.$X5 = exports.$W5 = exports.$V5 = void 0;
    exports.$V5 = {
        Visible: contextScopedHistoryWidget_1.$Q5,
        HasFocusedSuggestion: new contextkey_1.$2i('suggestWidgetHasFocusedSuggestion', false, (0, nls_1.localize)(0, null)),
        DetailsVisible: new contextkey_1.$2i('suggestWidgetDetailsVisible', false, (0, nls_1.localize)(1, null)),
        MultipleSuggestions: new contextkey_1.$2i('suggestWidgetMultipleSuggestions', false, (0, nls_1.localize)(2, null)),
        MakesTextEdit: new contextkey_1.$2i('suggestionMakesTextEdit', true, (0, nls_1.localize)(3, null)),
        AcceptSuggestionsOnEnter: new contextkey_1.$2i('acceptSuggestionOnEnter', true, (0, nls_1.localize)(4, null)),
        HasInsertAndReplaceRange: new contextkey_1.$2i('suggestionHasInsertAndReplaceRange', false, (0, nls_1.localize)(5, null)),
        InsertMode: new contextkey_1.$2i('suggestionInsertMode', undefined, { type: 'string', description: (0, nls_1.localize)(6, null) }),
        CanResolve: new contextkey_1.$2i('suggestionCanResolve', false, (0, nls_1.localize)(7, null)),
    };
    exports.$W5 = new actions_1.$Ru('suggestWidgetStatusBar');
    class $X5 {
        constructor(position, completion, container, provider) {
            this.position = position;
            this.completion = completion;
            this.container = container;
            this.provider = provider;
            // validation
            this.isInvalid = false;
            // sorting, filtering
            this.score = filters_1.FuzzyScore.Default;
            this.distance = 0;
            this.textLabel = typeof completion.label === 'string'
                ? completion.label
                : completion.label?.label;
            // ensure lower-variants (perf)
            this.labelLow = this.textLabel.toLowerCase();
            // validate label
            this.isInvalid = !this.textLabel;
            this.sortTextLow = completion.sortText && completion.sortText.toLowerCase();
            this.filterTextLow = completion.filterText && completion.filterText.toLowerCase();
            this.extensionId = completion.extensionId;
            // normalize ranges
            if (range_1.$ks.isIRange(completion.range)) {
                this.editStart = new position_1.$js(completion.range.startLineNumber, completion.range.startColumn);
                this.editInsertEnd = new position_1.$js(completion.range.endLineNumber, completion.range.endColumn);
                this.editReplaceEnd = new position_1.$js(completion.range.endLineNumber, completion.range.endColumn);
                // validate range
                this.isInvalid = this.isInvalid
                    || range_1.$ks.spansMultipleLines(completion.range) || completion.range.startLineNumber !== position.lineNumber;
            }
            else {
                this.editStart = new position_1.$js(completion.range.insert.startLineNumber, completion.range.insert.startColumn);
                this.editInsertEnd = new position_1.$js(completion.range.insert.endLineNumber, completion.range.insert.endColumn);
                this.editReplaceEnd = new position_1.$js(completion.range.replace.endLineNumber, completion.range.replace.endColumn);
                // validate ranges
                this.isInvalid = this.isInvalid
                    || range_1.$ks.spansMultipleLines(completion.range.insert) || range_1.$ks.spansMultipleLines(completion.range.replace)
                    || completion.range.insert.startLineNumber !== position.lineNumber || completion.range.replace.startLineNumber !== position.lineNumber
                    || completion.range.insert.startColumn !== completion.range.replace.startColumn;
            }
            // create the suggestion resolver
            if (typeof provider.resolveCompletionItem !== 'function') {
                this.d = Promise.resolve();
                this.c = 0;
            }
        }
        // ---- resolving
        get isResolved() {
            return this.c !== undefined;
        }
        get resolveDuration() {
            return this.c !== undefined ? this.c : -1;
        }
        async resolve(token) {
            if (!this.d) {
                const sub = token.onCancellationRequested(() => {
                    this.d = undefined;
                    this.c = undefined;
                });
                const sw = new stopwatch_1.$bd(true);
                this.d = Promise.resolve(this.provider.resolveCompletionItem(this.completion, token)).then(value => {
                    Object.assign(this.completion, value);
                    this.c = sw.elapsed();
                }, err => {
                    if ((0, errors_1.$2)(err)) {
                        // the IPC queue will reject the request with the
                        // cancellation error -> reset cached
                        this.d = undefined;
                        this.c = undefined;
                    }
                }).finally(() => {
                    sub.dispose();
                });
            }
            return this.d;
        }
    }
    exports.$X5 = $X5;
    var SnippetSortOrder;
    (function (SnippetSortOrder) {
        SnippetSortOrder[SnippetSortOrder["Top"] = 0] = "Top";
        SnippetSortOrder[SnippetSortOrder["Inline"] = 1] = "Inline";
        SnippetSortOrder[SnippetSortOrder["Bottom"] = 2] = "Bottom";
    })(SnippetSortOrder || (exports.SnippetSortOrder = SnippetSortOrder = {}));
    class $Y5 {
        static { this.default = new $Y5(); }
        constructor(snippetSortOrder = 2 /* SnippetSortOrder.Bottom */, kindFilter = new Set(), providerFilter = new Set(), providerItemsToReuse = new Map(), showDeprecated = true) {
            this.snippetSortOrder = snippetSortOrder;
            this.kindFilter = kindFilter;
            this.providerFilter = providerFilter;
            this.providerItemsToReuse = providerItemsToReuse;
            this.showDeprecated = showDeprecated;
        }
    }
    exports.$Y5 = $Y5;
    let _snippetSuggestSupport;
    function $Z5() {
        return _snippetSuggestSupport;
    }
    exports.$Z5 = $Z5;
    function $15(support) {
        const old = _snippetSuggestSupport;
        _snippetSuggestSupport = support;
        return old;
    }
    exports.$15 = $15;
    class $25 {
        constructor(items, needsClipboard, durations, disposable) {
            this.items = items;
            this.needsClipboard = needsClipboard;
            this.durations = durations;
            this.disposable = disposable;
        }
    }
    exports.$25 = $25;
    async function $35(registry, model, position, options = $Y5.default, context = { triggerKind: 0 /* languages.CompletionTriggerKind.Invoke */ }, token = cancellation_1.CancellationToken.None) {
        const sw = new stopwatch_1.$bd();
        position = position.clone();
        const word = model.getWordAtPosition(position);
        const defaultReplaceRange = word ? new range_1.$ks(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn) : range_1.$ks.fromPositions(position);
        const defaultRange = { replace: defaultReplaceRange, insert: defaultReplaceRange.setEndPosition(position.lineNumber, position.column) };
        const result = [];
        const disposables = new lifecycle_1.$jc();
        const durations = [];
        let needsClipboard = false;
        const onCompletionList = (provider, container, sw) => {
            let didAddResult = false;
            if (!container) {
                return didAddResult;
            }
            for (const suggestion of container.suggestions) {
                if (!options.kindFilter.has(suggestion.kind)) {
                    // skip if not showing deprecated suggestions
                    if (!options.showDeprecated && suggestion?.tags?.includes(1 /* languages.CompletionItemTag.Deprecated */)) {
                        continue;
                    }
                    // fill in default range when missing
                    if (!suggestion.range) {
                        suggestion.range = defaultRange;
                    }
                    // fill in default sortText when missing
                    if (!suggestion.sortText) {
                        suggestion.sortText = typeof suggestion.label === 'string' ? suggestion.label : suggestion.label.label;
                    }
                    if (!needsClipboard && suggestion.insertTextRules && suggestion.insertTextRules & 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */) {
                        needsClipboard = snippetParser_1.$G5.guessNeedsClipboard(suggestion.insertText);
                    }
                    result.push(new $X5(position, suggestion, container, provider));
                    didAddResult = true;
                }
            }
            if ((0, lifecycle_1.$ec)(container)) {
                disposables.add(container);
            }
            durations.push({
                providerName: provider._debugDisplayName ?? 'unknown_provider', elapsedProvider: container.duration ?? -1, elapsedOverall: sw.elapsed()
            });
            return didAddResult;
        };
        // ask for snippets in parallel to asking "real" providers. Only do something if configured to
        // do so - no snippet filter, no special-providers-only request
        const snippetCompletions = (async () => {
            if (!_snippetSuggestSupport || options.kindFilter.has(27 /* languages.CompletionItemKind.Snippet */)) {
                return;
            }
            // we have items from a previous session that we can reuse
            const reuseItems = options.providerItemsToReuse.get(_snippetSuggestSupport);
            if (reuseItems) {
                reuseItems.forEach(item => result.push(item));
                return;
            }
            if (options.providerFilter.size > 0 && !options.providerFilter.has(_snippetSuggestSupport)) {
                return;
            }
            const sw = new stopwatch_1.$bd();
            const list = await _snippetSuggestSupport.provideCompletionItems(model, position, context, token);
            onCompletionList(_snippetSuggestSupport, list, sw);
        })();
        // add suggestions from contributed providers - providers are ordered in groups of
        // equal score and once a group produces a result the process stops
        // get provider groups, always add snippet suggestion provider
        for (const providerGroup of registry.orderedGroups(model)) {
            // for each support in the group ask for suggestions
            let didAddResult = false;
            await Promise.all(providerGroup.map(async (provider) => {
                // we have items from a previous session that we can reuse
                if (options.providerItemsToReuse.has(provider)) {
                    const items = options.providerItemsToReuse.get(provider);
                    items.forEach(item => result.push(item));
                    didAddResult = didAddResult || items.length > 0;
                    return;
                }
                // check if this provider is filtered out
                if (options.providerFilter.size > 0 && !options.providerFilter.has(provider)) {
                    return;
                }
                try {
                    const sw = new stopwatch_1.$bd();
                    const list = await provider.provideCompletionItems(model, position, context, token);
                    didAddResult = onCompletionList(provider, list, sw) || didAddResult;
                }
                catch (err) {
                    (0, errors_1.$Z)(err);
                }
            }));
            if (didAddResult || token.isCancellationRequested) {
                break;
            }
        }
        await snippetCompletions;
        if (token.isCancellationRequested) {
            disposables.dispose();
            return Promise.reject(new errors_1.$3());
        }
        return new $25(result.sort($45(options.snippetSortOrder)), needsClipboard, { entries: durations, elapsed: sw.elapsed() }, disposables);
    }
    exports.$35 = $35;
    function defaultComparator(a, b) {
        // check with 'sortText'
        if (a.sortTextLow && b.sortTextLow) {
            if (a.sortTextLow < b.sortTextLow) {
                return -1;
            }
            else if (a.sortTextLow > b.sortTextLow) {
                return 1;
            }
        }
        // check with 'label'
        if (a.textLabel < b.textLabel) {
            return -1;
        }
        else if (a.textLabel > b.textLabel) {
            return 1;
        }
        // check with 'type'
        return a.completion.kind - b.completion.kind;
    }
    function snippetUpComparator(a, b) {
        if (a.completion.kind !== b.completion.kind) {
            if (a.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return -1;
            }
            else if (b.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return 1;
            }
        }
        return defaultComparator(a, b);
    }
    function snippetDownComparator(a, b) {
        if (a.completion.kind !== b.completion.kind) {
            if (a.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return 1;
            }
            else if (b.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return -1;
            }
        }
        return defaultComparator(a, b);
    }
    const _snippetComparators = new Map();
    _snippetComparators.set(0 /* SnippetSortOrder.Top */, snippetUpComparator);
    _snippetComparators.set(2 /* SnippetSortOrder.Bottom */, snippetDownComparator);
    _snippetComparators.set(1 /* SnippetSortOrder.Inline */, defaultComparator);
    function $45(snippetConfig) {
        return _snippetComparators.get(snippetConfig);
    }
    exports.$45 = $45;
    commands_1.$Gr.registerCommand('_executeCompletionItemProvider', async (accessor, ...args) => {
        const [uri, position, triggerCharacter, maxItemsToResolve] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(uri));
        (0, types_1.$tf)(position_1.$js.isIPosition(position));
        (0, types_1.$tf)(typeof triggerCharacter === 'string' || !triggerCharacter);
        (0, types_1.$tf)(typeof maxItemsToResolve === 'number' || !maxItemsToResolve);
        const { completionProvider } = accessor.get(languageFeatures_1.$hF);
        const ref = await accessor.get(resolverService_1.$uA).createModelReference(uri);
        try {
            const result = {
                incomplete: false,
                suggestions: []
            };
            const resolving = [];
            const actualPosition = ref.object.textEditorModel.validatePosition(position);
            const completions = await $35(completionProvider, ref.object.textEditorModel, actualPosition, undefined, { triggerCharacter: triggerCharacter ?? undefined, triggerKind: triggerCharacter ? 1 /* languages.CompletionTriggerKind.TriggerCharacter */ : 0 /* languages.CompletionTriggerKind.Invoke */ });
            for (const item of completions.items) {
                if (resolving.length < (maxItemsToResolve ?? 0)) {
                    resolving.push(item.resolve(cancellation_1.CancellationToken.None));
                }
                result.incomplete = result.incomplete || item.container.incomplete;
                result.suggestions.push(item.completion);
            }
            try {
                await Promise.all(resolving);
                return result;
            }
            finally {
                setTimeout(() => completions.disposable.dispose(), 100);
            }
        }
        finally {
            ref.dispose();
        }
    });
    function $55(editor, provider) {
        editor.getContribution('editor.contrib.suggestController')?.triggerSuggest(new Set().add(provider), undefined, true);
    }
    exports.$55 = $55;
    class $65 {
        static isAllOff(config) {
            return config.other === 'off' && config.comments === 'off' && config.strings === 'off';
        }
        static isAllOn(config) {
            return config.other === 'on' && config.comments === 'on' && config.strings === 'on';
        }
        static valueFor(config, tokenType) {
            switch (tokenType) {
                case 1 /* StandardTokenType.Comment */: return config.comments;
                case 2 /* StandardTokenType.String */: return config.strings;
                default: return config.other;
            }
        }
    }
    exports.$65 = $65;
});
//# sourceMappingURL=suggest.js.map