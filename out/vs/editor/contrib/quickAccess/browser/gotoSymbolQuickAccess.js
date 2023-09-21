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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/fuzzyScorer", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess", "vs/nls", "vs/editor/common/services/languageFeatures", "vs/base/common/arraysFind"], function (require, exports, async_1, cancellation_1, codicons_1, themables_1, fuzzyScorer_1, lifecycle_1, strings_1, range_1, languages_1, outlineModel_1, editorNavigationQuickAccess_1, nls_1, languageFeatures_1, arraysFind_1) {
    "use strict";
    var AbstractGotoSymbolQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractGotoSymbolQuickAccessProvider = void 0;
    let AbstractGotoSymbolQuickAccessProvider = class AbstractGotoSymbolQuickAccessProvider extends editorNavigationQuickAccess_1.AbstractEditorNavigationQuickAccessProvider {
        static { AbstractGotoSymbolQuickAccessProvider_1 = this; }
        static { this.PREFIX = '@'; }
        static { this.SCOPE_PREFIX = ':'; }
        static { this.PREFIX_BY_CATEGORY = `${AbstractGotoSymbolQuickAccessProvider_1.PREFIX}${AbstractGotoSymbolQuickAccessProvider_1.SCOPE_PREFIX}`; }
        constructor(_languageFeaturesService, _outlineModelService, options = Object.create(null)) {
            super(options);
            this._languageFeaturesService = _languageFeaturesService;
            this._outlineModelService = _outlineModelService;
            this.options = options;
            this.options.canAcceptInBackground = true;
        }
        provideWithoutTextEditor(picker) {
            this.provideLabelPick(picker, (0, nls_1.localize)('cannotRunGotoSymbolWithoutEditor', "To go to a symbol, first open a text editor with symbol information."));
            return lifecycle_1.Disposable.None;
        }
        provideWithTextEditor(context, picker, token) {
            const editor = context.editor;
            const model = this.getModel(editor);
            if (!model) {
                return lifecycle_1.Disposable.None;
            }
            // Provide symbols from model if available in registry
            if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
                return this.doProvideWithEditorSymbols(context, model, picker, token);
            }
            // Otherwise show an entry for a model without registry
            // But give a chance to resolve the symbols at a later
            // point if possible
            return this.doProvideWithoutEditorSymbols(context, model, picker, token);
        }
        doProvideWithoutEditorSymbols(context, model, picker, token) {
            const disposables = new lifecycle_1.DisposableStore();
            // Generic pick for not having any symbol information
            this.provideLabelPick(picker, (0, nls_1.localize)('cannotRunGotoSymbolWithoutSymbolProvider', "The active text editor does not provide symbol information."));
            // Wait for changes to the registry and see if eventually
            // we do get symbols. This can happen if the picker is opened
            // very early after the model has loaded but before the
            // language registry is ready.
            // https://github.com/microsoft/vscode/issues/70607
            (async () => {
                const result = await this.waitForLanguageSymbolRegistry(model, disposables);
                if (!result || token.isCancellationRequested) {
                    return;
                }
                disposables.add(this.doProvideWithEditorSymbols(context, model, picker, token));
            })();
            return disposables;
        }
        provideLabelPick(picker, label) {
            picker.items = [{ label, index: 0, kind: 14 /* SymbolKind.String */ }];
            picker.ariaLabel = label;
        }
        async waitForLanguageSymbolRegistry(model, disposables) {
            if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
                return true;
            }
            const symbolProviderRegistryPromise = new async_1.DeferredPromise();
            // Resolve promise when registry knows model
            const symbolProviderListener = disposables.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => {
                if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
                    symbolProviderListener.dispose();
                    symbolProviderRegistryPromise.complete(true);
                }
            }));
            // Resolve promise when we get disposed too
            disposables.add((0, lifecycle_1.toDisposable)(() => symbolProviderRegistryPromise.complete(false)));
            return symbolProviderRegistryPromise.p;
        }
        doProvideWithEditorSymbols(context, model, picker, token) {
            const editor = context.editor;
            const disposables = new lifecycle_1.DisposableStore();
            // Goto symbol once picked
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (item && item.range) {
                    this.gotoLocation(context, { range: item.range.selection, keyMods: picker.keyMods, preserveFocus: event.inBackground });
                    if (!event.inBackground) {
                        picker.hide();
                    }
                }
            }));
            // Goto symbol side by side if enabled
            disposables.add(picker.onDidTriggerItemButton(({ item }) => {
                if (item && item.range) {
                    this.gotoLocation(context, { range: item.range.selection, keyMods: picker.keyMods, forceSideBySide: true });
                    picker.hide();
                }
            }));
            // Resolve symbols from document once and reuse this
            // request for all filtering and typing then on
            const symbolsPromise = this.getDocumentSymbols(model, token);
            // Set initial picks and update on type
            let picksCts = undefined;
            const updatePickerItems = async (positionToEnclose) => {
                // Cancel any previous ask for picks and busy
                picksCts?.dispose(true);
                picker.busy = false;
                // Create new cancellation source for this run
                picksCts = new cancellation_1.CancellationTokenSource(token);
                // Collect symbol picks
                picker.busy = true;
                try {
                    const query = (0, fuzzyScorer_1.prepareQuery)(picker.value.substr(AbstractGotoSymbolQuickAccessProvider_1.PREFIX.length).trim());
                    const items = await this.doGetSymbolPicks(symbolsPromise, query, undefined, picksCts.token);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (items.length > 0) {
                        picker.items = items;
                        if (positionToEnclose && query.original.length === 0) {
                            const candidate = (0, arraysFind_1.findLast)(items, item => Boolean(item.type !== 'separator' && item.range && range_1.Range.containsPosition(item.range.decoration, positionToEnclose)));
                            if (candidate) {
                                picker.activeItems = [candidate];
                            }
                        }
                    }
                    else {
                        if (query.original.length > 0) {
                            this.provideLabelPick(picker, (0, nls_1.localize)('noMatchingSymbolResults', "No matching editor symbols"));
                        }
                        else {
                            this.provideLabelPick(picker, (0, nls_1.localize)('noSymbolResults', "No editor symbols"));
                        }
                    }
                }
                finally {
                    if (!token.isCancellationRequested) {
                        picker.busy = false;
                    }
                }
            };
            disposables.add(picker.onDidChangeValue(() => updatePickerItems(undefined)));
            updatePickerItems(editor.getSelection()?.getPosition());
            // Reveal and decorate when active item changes
            disposables.add(picker.onDidChangeActive(() => {
                const [item] = picker.activeItems;
                if (item && item.range) {
                    // Reveal
                    editor.revealRangeInCenter(item.range.selection, 0 /* ScrollType.Smooth */);
                    // Decorate
                    this.addDecorations(editor, item.range.decoration);
                }
            }));
            return disposables;
        }
        async doGetSymbolPicks(symbolsPromise, query, options, token) {
            const symbols = await symbolsPromise;
            if (token.isCancellationRequested) {
                return [];
            }
            const filterBySymbolKind = query.original.indexOf(AbstractGotoSymbolQuickAccessProvider_1.SCOPE_PREFIX) === 0;
            const filterPos = filterBySymbolKind ? 1 : 0;
            // Split between symbol and container query
            let symbolQuery;
            let containerQuery;
            if (query.values && query.values.length > 1) {
                symbolQuery = (0, fuzzyScorer_1.pieceToQuery)(query.values[0]); // symbol: only match on first part
                containerQuery = (0, fuzzyScorer_1.pieceToQuery)(query.values.slice(1)); // container: match on all but first parts
            }
            else {
                symbolQuery = query;
            }
            // Convert to symbol picks and apply filtering
            let buttons;
            const openSideBySideDirection = this.options?.openSideBySideDirection?.();
            if (openSideBySideDirection) {
                buttons = [{
                        iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitVertical),
                        tooltip: openSideBySideDirection === 'right' ? (0, nls_1.localize)('openToSide', "Open to the Side") : (0, nls_1.localize)('openToBottom', "Open to the Bottom")
                    }];
            }
            const filteredSymbolPicks = [];
            for (let index = 0; index < symbols.length; index++) {
                const symbol = symbols[index];
                const symbolLabel = (0, strings_1.trim)(symbol.name);
                const symbolLabelWithIcon = `$(${languages_1.SymbolKinds.toIcon(symbol.kind).id}) ${symbolLabel}`;
                const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
                let containerLabel = symbol.containerName;
                if (options?.extraContainerLabel) {
                    if (containerLabel) {
                        containerLabel = `${options.extraContainerLabel} • ${containerLabel}`;
                    }
                    else {
                        containerLabel = options.extraContainerLabel;
                    }
                }
                let symbolScore = undefined;
                let symbolMatches = undefined;
                let containerScore = undefined;
                let containerMatches = undefined;
                if (query.original.length > filterPos) {
                    // First: try to score on the entire query, it is possible that
                    // the symbol matches perfectly (e.g. searching for "change log"
                    // can be a match on a markdown symbol "change log"). In that
                    // case we want to skip the container query altogether.
                    let skipContainerQuery = false;
                    if (symbolQuery !== query) {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(symbolLabelWithIcon, { ...query, values: undefined /* disable multi-query support */ }, filterPos, symbolLabelIconOffset);
                        if (typeof symbolScore === 'number') {
                            skipContainerQuery = true; // since we consumed the query, skip any container matching
                        }
                    }
                    // Otherwise: score on the symbol query and match on the container later
                    if (typeof symbolScore !== 'number') {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(symbolLabelWithIcon, symbolQuery, filterPos, symbolLabelIconOffset);
                        if (typeof symbolScore !== 'number') {
                            continue;
                        }
                    }
                    // Score by container if specified
                    if (!skipContainerQuery && containerQuery) {
                        if (containerLabel && containerQuery.original.length > 0) {
                            [containerScore, containerMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(containerLabel, containerQuery);
                        }
                        if (typeof containerScore !== 'number') {
                            continue;
                        }
                        if (typeof symbolScore === 'number') {
                            symbolScore += containerScore; // boost symbolScore by containerScore
                        }
                    }
                }
                const deprecated = symbol.tags && symbol.tags.indexOf(1 /* SymbolTag.Deprecated */) >= 0;
                filteredSymbolPicks.push({
                    index,
                    kind: symbol.kind,
                    score: symbolScore,
                    label: symbolLabelWithIcon,
                    ariaLabel: (0, languages_1.getAriaLabelForSymbol)(symbol.name, symbol.kind),
                    description: containerLabel,
                    highlights: deprecated ? undefined : {
                        label: symbolMatches,
                        description: containerMatches
                    },
                    range: {
                        selection: range_1.Range.collapseToStart(symbol.selectionRange),
                        decoration: symbol.range
                    },
                    strikethrough: deprecated,
                    buttons
                });
            }
            // Sort by score
            const sortedFilteredSymbolPicks = filteredSymbolPicks.sort((symbolA, symbolB) => filterBySymbolKind ?
                this.compareByKindAndScore(symbolA, symbolB) :
                this.compareByScore(symbolA, symbolB));
            // Add separator for types
            // - @  only total number of symbols
            // - @: grouped by symbol kind
            let symbolPicks = [];
            if (filterBySymbolKind) {
                let lastSymbolKind = undefined;
                let lastSeparator = undefined;
                let lastSymbolKindCounter = 0;
                function updateLastSeparatorLabel() {
                    if (lastSeparator && typeof lastSymbolKind === 'number' && lastSymbolKindCounter > 0) {
                        lastSeparator.label = (0, strings_1.format)(NLS_SYMBOL_KIND_CACHE[lastSymbolKind] || FALLBACK_NLS_SYMBOL_KIND, lastSymbolKindCounter);
                    }
                }
                for (const symbolPick of sortedFilteredSymbolPicks) {
                    // Found new kind
                    if (lastSymbolKind !== symbolPick.kind) {
                        // Update last separator with number of symbols we found for kind
                        updateLastSeparatorLabel();
                        lastSymbolKind = symbolPick.kind;
                        lastSymbolKindCounter = 1;
                        // Add new separator for new kind
                        lastSeparator = { type: 'separator' };
                        symbolPicks.push(lastSeparator);
                    }
                    // Existing kind, keep counting
                    else {
                        lastSymbolKindCounter++;
                    }
                    // Add to final result
                    symbolPicks.push(symbolPick);
                }
                // Update last separator with number of symbols we found for kind
                updateLastSeparatorLabel();
            }
            else if (sortedFilteredSymbolPicks.length > 0) {
                symbolPicks = [
                    { label: (0, nls_1.localize)('symbols', "symbols ({0})", filteredSymbolPicks.length), type: 'separator' },
                    ...sortedFilteredSymbolPicks
                ];
            }
            return symbolPicks;
        }
        compareByScore(symbolA, symbolB) {
            if (typeof symbolA.score !== 'number' && typeof symbolB.score === 'number') {
                return 1;
            }
            else if (typeof symbolA.score === 'number' && typeof symbolB.score !== 'number') {
                return -1;
            }
            if (typeof symbolA.score === 'number' && typeof symbolB.score === 'number') {
                if (symbolA.score > symbolB.score) {
                    return -1;
                }
                else if (symbolA.score < symbolB.score) {
                    return 1;
                }
            }
            if (symbolA.index < symbolB.index) {
                return -1;
            }
            else if (symbolA.index > symbolB.index) {
                return 1;
            }
            return 0;
        }
        compareByKindAndScore(symbolA, symbolB) {
            const kindA = NLS_SYMBOL_KIND_CACHE[symbolA.kind] || FALLBACK_NLS_SYMBOL_KIND;
            const kindB = NLS_SYMBOL_KIND_CACHE[symbolB.kind] || FALLBACK_NLS_SYMBOL_KIND;
            // Sort by type first if scoped search
            const result = kindA.localeCompare(kindB);
            if (result === 0) {
                return this.compareByScore(symbolA, symbolB);
            }
            return result;
        }
        async getDocumentSymbols(document, token) {
            const model = await this._outlineModelService.getOrCreate(document, token);
            return token.isCancellationRequested ? [] : model.asListOfDocumentSymbols();
        }
    };
    exports.AbstractGotoSymbolQuickAccessProvider = AbstractGotoSymbolQuickAccessProvider;
    exports.AbstractGotoSymbolQuickAccessProvider = AbstractGotoSymbolQuickAccessProvider = AbstractGotoSymbolQuickAccessProvider_1 = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, outlineModel_1.IOutlineModelService)
    ], AbstractGotoSymbolQuickAccessProvider);
    // #region NLS Helpers
    const FALLBACK_NLS_SYMBOL_KIND = (0, nls_1.localize)('property', "properties ({0})");
    const NLS_SYMBOL_KIND_CACHE = {
        [5 /* SymbolKind.Method */]: (0, nls_1.localize)('method', "methods ({0})"),
        [11 /* SymbolKind.Function */]: (0, nls_1.localize)('function', "functions ({0})"),
        [8 /* SymbolKind.Constructor */]: (0, nls_1.localize)('_constructor', "constructors ({0})"),
        [12 /* SymbolKind.Variable */]: (0, nls_1.localize)('variable', "variables ({0})"),
        [4 /* SymbolKind.Class */]: (0, nls_1.localize)('class', "classes ({0})"),
        [22 /* SymbolKind.Struct */]: (0, nls_1.localize)('struct', "structs ({0})"),
        [23 /* SymbolKind.Event */]: (0, nls_1.localize)('event', "events ({0})"),
        [24 /* SymbolKind.Operator */]: (0, nls_1.localize)('operator', "operators ({0})"),
        [10 /* SymbolKind.Interface */]: (0, nls_1.localize)('interface', "interfaces ({0})"),
        [2 /* SymbolKind.Namespace */]: (0, nls_1.localize)('namespace', "namespaces ({0})"),
        [3 /* SymbolKind.Package */]: (0, nls_1.localize)('package', "packages ({0})"),
        [25 /* SymbolKind.TypeParameter */]: (0, nls_1.localize)('typeParameter', "type parameters ({0})"),
        [1 /* SymbolKind.Module */]: (0, nls_1.localize)('modules', "modules ({0})"),
        [6 /* SymbolKind.Property */]: (0, nls_1.localize)('property', "properties ({0})"),
        [9 /* SymbolKind.Enum */]: (0, nls_1.localize)('enum', "enumerations ({0})"),
        [21 /* SymbolKind.EnumMember */]: (0, nls_1.localize)('enumMember', "enumeration members ({0})"),
        [14 /* SymbolKind.String */]: (0, nls_1.localize)('string', "strings ({0})"),
        [0 /* SymbolKind.File */]: (0, nls_1.localize)('file', "files ({0})"),
        [17 /* SymbolKind.Array */]: (0, nls_1.localize)('array', "arrays ({0})"),
        [15 /* SymbolKind.Number */]: (0, nls_1.localize)('number', "numbers ({0})"),
        [16 /* SymbolKind.Boolean */]: (0, nls_1.localize)('boolean', "booleans ({0})"),
        [18 /* SymbolKind.Object */]: (0, nls_1.localize)('object', "objects ({0})"),
        [19 /* SymbolKind.Key */]: (0, nls_1.localize)('key', "keys ({0})"),
        [7 /* SymbolKind.Field */]: (0, nls_1.localize)('field', "fields ({0})"),
        [13 /* SymbolKind.Constant */]: (0, nls_1.localize)('constant', "constants ({0})")
    };
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ290b1N5bWJvbFF1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvcXVpY2tBY2Nlc3MvYnJvd3Nlci9nb3RvU3ltYm9sUXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWlDekYsSUFBZSxxQ0FBcUMsR0FBcEQsTUFBZSxxQ0FBc0MsU0FBUSx5RUFBMkM7O2lCQUV2RyxXQUFNLEdBQUcsR0FBRyxBQUFOLENBQU87aUJBQ2IsaUJBQVksR0FBRyxHQUFHLEFBQU4sQ0FBTztpQkFDbkIsdUJBQWtCLEdBQUcsR0FBRyx1Q0FBcUMsQ0FBQyxNQUFNLEdBQUcsdUNBQXFDLENBQUMsWUFBWSxFQUFFLEFBQXpHLENBQTBHO1FBSW5JLFlBQzRDLHdCQUFrRCxFQUN0RCxvQkFBMEMsRUFDakYsVUFBaUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFFcEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBSjRCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDdEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUtqRixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztRQUMzQyxDQUFDO1FBRVMsd0JBQXdCLENBQUMsTUFBNEM7WUFDOUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxrQ0FBa0MsRUFBRSxzRUFBc0UsQ0FBQyxDQUFDLENBQUM7WUFFcEosT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQztRQUN4QixDQUFDO1FBRVMscUJBQXFCLENBQUMsT0FBc0MsRUFBRSxNQUE0QyxFQUFFLEtBQXdCO1lBQzdJLE1BQU0sTUFBTSxHQUFHLE9B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