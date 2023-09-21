/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/platform/history/browser/contextScopedHistoryWidget"], function (require, exports, cancellation_1, errors_1, filters_1, lifecycle_1, stopwatch_1, types_1, uri_1, position_1, range_1, resolverService_1, snippetParser_1, nls_1, actions_1, commands_1, contextkey_1, languageFeatures_1, contextScopedHistoryWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickSuggestionsOptions = exports.showSimpleSuggestions = exports.getSuggestionComparator = exports.provideSuggestionItems = exports.CompletionItemModel = exports.setSnippetSuggestSupport = exports.getSnippetSuggestSupport = exports.CompletionOptions = exports.SnippetSortOrder = exports.CompletionItem = exports.suggestWidgetStatusbarMenu = exports.Context = void 0;
    exports.Context = {
        Visible: contextScopedHistoryWidget_1.historyNavigationVisible,
        HasFocusedSuggestion: new contextkey_1.RawContextKey('suggestWidgetHasFocusedSuggestion', false, (0, nls_1.localize)('suggestWidgetHasSelection', "Whether any suggestion is focused")),
        DetailsVisible: new contextkey_1.RawContextKey('suggestWidgetDetailsVisible', false, (0, nls_1.localize)('suggestWidgetDetailsVisible', "Whether suggestion details are visible")),
        MultipleSuggestions: new contextkey_1.RawContextKey('suggestWidgetMultipleSuggestions', false, (0, nls_1.localize)('suggestWidgetMultipleSuggestions', "Whether there are multiple suggestions to pick from")),
        MakesTextEdit: new contextkey_1.RawContextKey('suggestionMakesTextEdit', true, (0, nls_1.localize)('suggestionMakesTextEdit', "Whether inserting the current suggestion yields in a change or has everything already been typed")),
        AcceptSuggestionsOnEnter: new contextkey_1.RawContextKey('acceptSuggestionOnEnter', true, (0, nls_1.localize)('acceptSuggestionOnEnter', "Whether suggestions are inserted when pressing Enter")),
        HasInsertAndReplaceRange: new contextkey_1.RawContextKey('suggestionHasInsertAndReplaceRange', false, (0, nls_1.localize)('suggestionHasInsertAndReplaceRange', "Whether the current suggestion has insert and replace behaviour")),
        InsertMode: new contextkey_1.RawContextKey('suggestionInsertMode', undefined, { type: 'string', description: (0, nls_1.localize)('suggestionInsertMode', "Whether the default behaviour is to insert or replace") }),
        CanResolve: new contextkey_1.RawContextKey('suggestionCanResolve', false, (0, nls_1.localize)('suggestionCanResolve', "Whether the current suggestion supports to resolve further details")),
    };
    exports.suggestWidgetStatusbarMenu = new actions_1.MenuId('suggestWidgetStatusBar');
    class CompletionItem {
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
            if (range_1.Range.isIRange(completion.range)) {
                this.editStart = new position_1.Position(completion.range.startLineNumber, completion.range.startColumn);
                this.editInsertEnd = new position_1.Position(completion.range.endLineNumber, completion.range.endColumn);
                this.editReplaceEnd = new position_1.Position(completion.range.endLineNumber, completion.range.endColumn);
                // validate range
                this.isInvalid = this.isInvalid
                    || range_1.Range.spansMultipleLines(completion.range) || completion.range.startLineNumber !== position.lineNumber;
            }
            else {
                this.editStart = new position_1.Position(completion.range.insert.startLineNumber, completion.range.insert.startColumn);
                this.editInsertEnd = new position_1.Position(completion.range.insert.endLineNumber, completion.range.insert.endColumn);
                this.editReplaceEnd = new position_1.Position(completion.range.replace.endLineNumber, completion.range.replace.endColumn);
                // validate ranges
                this.isInvalid = this.isInvalid
                    || range_1.Range.spansMultipleLines(completion.range.insert) || range_1.Range.spansMultipleLines(completion.range.replace)
                    || completion.range.insert.startLineNumber !== position.lineNumber || completion.range.replace.startLineNumber !== position.lineNumber
                    || completion.range.insert.startColumn !== completion.range.replace.startColumn;
            }
            // create the suggestion resolver
            if (typeof provider.resolveCompletionItem !== 'function') {
                this._resolveCache = Promise.resolve();
                this._resolveDuration = 0;
            }
        }
        // ---- resolving
        get isResolved() {
            return this._resolveDuration !== undefined;
        }
        get resolveDuration() {
            return this._resolveDuration !== undefined ? this._resolveDuration : -1;
        }
        async resolve(token) {
            if (!this._resolveCache) {
                const sub = token.onCancellationRequested(() => {
                    this._resolveCache = undefined;
                    this._resolveDuration = undefined;
                });
                const sw = new stopwatch_1.StopWatch(true);
                this._resolveCache = Promise.resolve(this.provider.resolveCompletionItem(this.completion, token)).then(value => {
                    Object.assign(this.completion, value);
                    this._resolveDuration = sw.elapsed();
                }, err => {
                    if ((0, errors_1.isCancellationError)(err)) {
                        // the IPC queue will reject the request with the
                        // cancellation error -> reset cached
                        this._resolveCache = undefined;
                        this._resolveDuration = undefined;
                    }
                }).finally(() => {
                    sub.dispose();
                });
            }
            return this._resolveCache;
        }
    }
    exports.CompletionItem = CompletionItem;
    var SnippetSortOrder;
    (function (SnippetSortOrder) {
        SnippetSortOrder[SnippetSortOrder["Top"] = 0] = "Top";
        SnippetSortOrder[SnippetSortOrder["Inline"] = 1] = "Inline";
        SnippetSortOrder[SnippetSortOrder["Bottom"] = 2] = "Bottom";
    })(SnippetSortOrder || (exports.SnippetSortOrder = SnippetSortOrder = {}));
    class CompletionOptions {
        static { this.default = new CompletionOptions(); }
        constructor(snippetSortOrder = 2 /* SnippetSortOrder.Bottom */, kindFilter = new Set(), providerFilter = new Set(), providerItemsToReuse = new Map(), showDeprecated = true) {
            this.snippetSortOrder = snippetSortOrder;
            this.kindFilter = kindFilter;
            this.providerFilter = providerFilter;
            this.providerItemsToReuse = providerItemsToReuse;
            this.showDeprecated = showDeprecated;
        }
    }
    exports.CompletionOptions = CompletionOptions;
    let _snippetSuggestSupport;
    function getSnippetSuggestSupport() {
        return _snippetSuggestSupport;
    }
    exports.getSnippetSuggestSupport = getSnippetSuggestSupport;
    function setSnippetSuggestSupport(support) {
        const old = _snippetSuggestSupport;
        _snippetSuggestSupport = support;
        return old;
    }
    exports.setSnippetSuggestSupport = setSnippetSuggestSupport;
    class CompletionItemModel {
        constructor(items, needsClipboard, durations, disposable) {
            this.items = items;
            this.needsClipboard = needsClipboard;
            this.durations = durations;
            this.disposable = disposable;
        }
    }
    exports.CompletionItemModel = CompletionItemModel;
    async function provideSuggestionItems(registry, model, position, options = CompletionOptions.default, context = { triggerKind: 0 /* languages.CompletionTriggerKind.Invoke */ }, token = cancellation_1.CancellationToken.None) {
        const sw = new stopwatch_1.StopWatch();
        position = position.clone();
        const word = model.getWordAtPosition(position);
        const defaultReplaceRange = word ? new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn) : range_1.Range.fromPositions(position);
        const defaultRange = { replace: defaultReplaceRange, insert: defaultReplaceRange.setEndPosition(position.lineNumber, position.column) };
        const result = [];
        const disposables = new lifecycle_1.DisposableStore();
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
                        needsClipboard = snippetParser_1.SnippetParser.guessNeedsClipboard(suggestion.insertText);
                    }
                    result.push(new CompletionItem(position, suggestion, container, provider));
                    didAddResult = true;
                }
            }
            if ((0, lifecycle_1.isDisposable)(container)) {
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
            const sw = new stopwatch_1.StopWatch();
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
                    const sw = new stopwatch_1.StopWatch();
                    const list = await provider.provideCompletionItems(model, position, context, token);
                    didAddResult = onCompletionList(provider, list, sw) || didAddResult;
                }
                catch (err) {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }
            }));
            if (didAddResult || token.isCancellationRequested) {
                break;
            }
        }
        await snippetCompletions;
        if (token.isCancellationRequested) {
            disposables.dispose();
            return Promise.reject(new errors_1.CancellationError());
        }
        return new CompletionItemModel(result.sort(getSuggestionComparator(options.snippetSortOrder)), needsClipboard, { entries: durations, elapsed: sw.elapsed() }, disposables);
    }
    exports.provideSuggestionItems = provideSuggestionItems;
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
    function getSuggestionComparator(snippetConfig) {
        return _snippetComparators.get(snippetConfig);
    }
    exports.getSuggestionComparator = getSuggestionComparator;
    commands_1.CommandsRegistry.registerCommand('_executeCompletionItemProvider', async (accessor, ...args) => {
        const [uri, position, triggerCharacter, maxItemsToResolve] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof triggerCharacter === 'string' || !triggerCharacter);
        (0, types_1.assertType)(typeof maxItemsToResolve === 'number' || !maxItemsToResolve);
        const { completionProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const result = {
                incomplete: false,
                suggestions: []
            };
            const resolving = [];
            const actualPosition = ref.object.textEditorModel.validatePosition(position);
            const completions = await provideSuggestionItems(completionProvider, ref.object.textEditorModel, actualPosition, undefined, { triggerCharacter: triggerCharacter ?? undefined, triggerKind: triggerCharacter ? 1 /* languages.CompletionTriggerKind.TriggerCharacter */ : 0 /* languages.CompletionTriggerKind.Invoke */ });
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
    function showSimpleSuggestions(editor, provider) {
        editor.getContribution('editor.contrib.suggestController')?.triggerSuggest(new Set().add(provider), undefined, true);
    }
    exports.showSimpleSuggestions = showSimpleSuggestions;
    class QuickSuggestionsOptions {
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
    exports.QuickSuggestionsOptions = QuickSuggestionsOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvYnJvd3Nlci9zdWdnZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRCbkYsUUFBQSxPQUFPLEdBQUc7UUFDdEIsT0FBTyxFQUFFLHFEQUF3QjtRQUNqQyxvQkFBb0IsRUFBRSxJQUFJLDBCQUFhLENBQVUsbUNBQW1DLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLG1DQUFtQyxDQUFDLENBQUM7UUFDeEssY0FBYyxFQUFFLElBQUksMEJBQWEsQ0FBVSw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztRQUNuSyxtQkFBbUIsRUFBRSxJQUFJLDBCQUFhLENBQVUsa0NBQWtDLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtDQUFrQyxFQUFFLHFEQUFxRCxDQUFDLENBQUM7UUFDL0wsYUFBYSxFQUFFLElBQUksMEJBQWEsQ0FBVSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsa0dBQWtHLENBQUMsQ0FBQztRQUNuTix3QkFBd0IsRUFBRSxJQUFJLDBCQUFhLENBQVUseUJBQXlCLEVBQUUsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHNEQUFzRCxDQUFDLENBQUM7UUFDbEwsd0JBQXdCLEVBQUUsSUFBSSwwQkFBYSxDQUFVLG9DQUFvQyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQ0FBb0MsRUFBRSxpRUFBaUUsQ0FBQyxDQUFDO1FBQ3BOLFVBQVUsRUFBRSxJQUFJLDBCQUFhLENBQXVCLHNCQUFzQixFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUs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