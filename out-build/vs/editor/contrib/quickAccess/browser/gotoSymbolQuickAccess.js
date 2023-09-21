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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/fuzzyScorer", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess", "vs/nls!vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess", "vs/editor/common/services/languageFeatures", "vs/base/common/arraysFind"], function (require, exports, async_1, cancellation_1, codicons_1, themables_1, fuzzyScorer_1, lifecycle_1, strings_1, range_1, languages_1, outlineModel_1, editorNavigationQuickAccess_1, nls_1, languageFeatures_1, arraysFind_1) {
    "use strict";
    var $AMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AMb = void 0;
    let $AMb = class $AMb extends editorNavigationQuickAccess_1.$yMb {
        static { $AMb_1 = this; }
        static { this.PREFIX = '@'; }
        static { this.SCOPE_PREFIX = ':'; }
        static { this.PREFIX_BY_CATEGORY = `${$AMb_1.PREFIX}${$AMb_1.SCOPE_PREFIX}`; }
        constructor(l, m, options = Object.create(null)) {
            super(options);
            this.l = l;
            this.m = m;
            this.a = options;
            this.a.canAcceptInBackground = true;
        }
        e(picker) {
            this.r(picker, (0, nls_1.localize)(0, null));
            return lifecycle_1.$kc.None;
        }
        d(context, picker, token) {
            const editor = context.editor;
            const model = this.g(editor);
            if (!model) {
                return lifecycle_1.$kc.None;
            }
            // Provide symbols from model if available in registry
            if (this.l.documentSymbolProvider.has(model)) {
                return this.t(context, model, picker, token);
            }
            // Otherwise show an entry for a model without registry
            // But give a chance to resolve the symbols at a later
            // point if possible
            return this.q(context, model, picker, token);
        }
        q(context, model, picker, token) {
            const disposables = new lifecycle_1.$jc();
            // Generic pick for not having any symbol information
            this.r(picker, (0, nls_1.localize)(1, null));
            // Wait for changes to the registry and see if eventually
            // we do get symbols. This can happen if the picker is opened
            // very early after the model has loaded but before the
            // language registry is ready.
            // https://github.com/microsoft/vscode/issues/70607
            (async () => {
                const result = await this.s(model, disposables);
                if (!result || token.isCancellationRequested) {
                    return;
                }
                disposables.add(this.t(context, model, picker, token));
            })();
            return disposables;
        }
        r(picker, label) {
            picker.items = [{ label, index: 0, kind: 14 /* SymbolKind.String */ }];
            picker.ariaLabel = label;
        }
        async s(model, disposables) {
            if (this.l.documentSymbolProvider.has(model)) {
                return true;
            }
            const symbolProviderRegistryPromise = new async_1.$2g();
            // Resolve promise when registry knows model
            const symbolProviderListener = disposables.add(this.l.documentSymbolProvider.onDidChange(() => {
                if (this.l.documentSymbolProvider.has(model)) {
                    symbolProviderListener.dispose();
                    symbolProviderRegistryPromise.complete(true);
                }
            }));
            // Resolve promise when we get disposed too
            disposables.add((0, lifecycle_1.$ic)(() => symbolProviderRegistryPromise.complete(false)));
            return symbolProviderRegistryPromise.p;
        }
        t(context, model, picker, token) {
            const editor = context.editor;
            const disposables = new lifecycle_1.$jc();
            // Goto symbol once picked
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (item && item.range) {
                    this.f(context, { range: item.range.selection, keyMods: picker.keyMods, preserveFocus: event.inBackground });
                    if (!event.inBackground) {
                        picker.hide();
                    }
                }
            }));
            // Goto symbol side by side if enabled
            disposables.add(picker.onDidTriggerItemButton(({ item }) => {
                if (item && item.range) {
                    this.f(context, { range: item.range.selection, keyMods: picker.keyMods, forceSideBySide: true });
                    picker.hide();
                }
            }));
            // Resolve symbols from document once and reuse this
            // request for all filtering and typing then on
            const symbolsPromise = this.x(model, token);
            // Set initial picks and update on type
            let picksCts = undefined;
            const updatePickerItems = async (positionToEnclose) => {
                // Cancel any previous ask for picks and busy
                picksCts?.dispose(true);
                picker.busy = false;
                // Create new cancellation source for this run
                picksCts = new cancellation_1.$pd(token);
                // Collect symbol picks
                picker.busy = true;
                try {
                    const query = (0, fuzzyScorer_1.$oq)(picker.value.substr($AMb_1.PREFIX.length).trim());
                    const items = await this.u(symbolsPromise, query, undefined, picksCts.token);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (items.length > 0) {
                        picker.items = items;
                        if (positionToEnclose && query.original.length === 0) {
                            const candidate = (0, arraysFind_1.$db)(items, item => Boolean(item.type !== 'separator' && item.range && range_1.$ks.containsPosition(item.range.decoration, positionToEnclose)));
                            if (candidate) {
                                picker.activeItems = [candidate];
                            }
                        }
                    }
                    else {
                        if (query.original.length > 0) {
                            this.r(picker, (0, nls_1.localize)(2, null));
                        }
                        else {
                            this.r(picker, (0, nls_1.localize)(3, null));
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
        async u(symbolsPromise, query, options, token) {
            const symbols = await symbolsPromise;
            if (token.isCancellationRequested) {
                return [];
            }
            const filterBySymbolKind = query.original.indexOf($AMb_1.SCOPE_PREFIX) === 0;
            const filterPos = filterBySymbolKind ? 1 : 0;
            // Split between symbol and container query
            let symbolQuery;
            let containerQuery;
            if (query.values && query.values.length > 1) {
                symbolQuery = (0, fuzzyScorer_1.$pq)(query.values[0]); // symbol: only match on first part
                containerQuery = (0, fuzzyScorer_1.$pq)(query.values.slice(1)); // container: match on all but first parts
            }
            else {
                symbolQuery = query;
            }
            // Convert to symbol picks and apply filtering
            let buttons;
            const openSideBySideDirection = this.a?.openSideBySideDirection?.();
            if (openSideBySideDirection) {
                buttons = [{
                        iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitVertical),
                        tooltip: openSideBySideDirection === 'right' ? (0, nls_1.localize)(4, null) : (0, nls_1.localize)(5, null)
                    }];
            }
            const filteredSymbolPicks = [];
            for (let index = 0; index < symbols.length; index++) {
                const symbol = symbols[index];
                const symbolLabel = (0, strings_1.$te)(symbol.name);
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
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.$lq)(symbolLabelWithIcon, { ...query, values: undefined /* disable multi-query support */ }, filterPos, symbolLabelIconOffset);
                        if (typeof symbolScore === 'number') {
                            skipContainerQuery = true; // since we consumed the query, skip any container matching
                        }
                    }
                    // Otherwise: score on the symbol query and match on the container later
                    if (typeof symbolScore !== 'number') {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.$lq)(symbolLabelWithIcon, symbolQuery, filterPos, symbolLabelIconOffset);
                        if (typeof symbolScore !== 'number') {
                            continue;
                        }
                    }
                    // Score by container if specified
                    if (!skipContainerQuery && containerQuery) {
                        if (containerLabel && containerQuery.original.length > 0) {
                            [containerScore, containerMatches] = (0, fuzzyScorer_1.$lq)(containerLabel, containerQuery);
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
                    ariaLabel: (0, languages_1.$0s)(symbol.name, symbol.kind),
                    description: containerLabel,
                    highlights: deprecated ? undefined : {
                        label: symbolMatches,
                        description: containerMatches
                    },
                    range: {
                        selection: range_1.$ks.collapseToStart(symbol.selectionRange),
                        decoration: symbol.range
                    },
                    strikethrough: deprecated,
                    buttons
                });
            }
            // Sort by score
            const sortedFilteredSymbolPicks = filteredSymbolPicks.sort((symbolA, symbolB) => filterBySymbolKind ?
                this.w(symbolA, symbolB) :
                this.v(symbolA, symbolB));
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
                        lastSeparator.label = (0, strings_1.$ne)(NLS_SYMBOL_KIND_CACHE[lastSymbolKind] || FALLBACK_NLS_SYMBOL_KIND, lastSymbolKindCounter);
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
                    { label: (0, nls_1.localize)(6, null, filteredSymbolPicks.length), type: 'separator' },
                    ...sortedFilteredSymbolPicks
                ];
            }
            return symbolPicks;
        }
        v(symbolA, symbolB) {
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
        w(symbolA, symbolB) {
            const kindA = NLS_SYMBOL_KIND_CACHE[symbolA.kind] || FALLBACK_NLS_SYMBOL_KIND;
            const kindB = NLS_SYMBOL_KIND_CACHE[symbolB.kind] || FALLBACK_NLS_SYMBOL_KIND;
            // Sort by type first if scoped search
            const result = kindA.localeCompare(kindB);
            if (result === 0) {
                return this.v(symbolA, symbolB);
            }
            return result;
        }
        async x(document, token) {
            const model = await this.m.getOrCreate(document, token);
            return token.isCancellationRequested ? [] : model.asListOfDocumentSymbols();
        }
    };
    exports.$AMb = $AMb;
    exports.$AMb = $AMb = $AMb_1 = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, outlineModel_1.$R8)
    ], $AMb);
    // #region NLS Helpers
    const FALLBACK_NLS_SYMBOL_KIND = (0, nls_1.localize)(7, null);
    const NLS_SYMBOL_KIND_CACHE = {
        [5 /* SymbolKind.Method */]: (0, nls_1.localize)(8, null),
        [11 /* SymbolKind.Function */]: (0, nls_1.localize)(9, null),
        [8 /* SymbolKind.Constructor */]: (0, nls_1.localize)(10, null),
        [12 /* SymbolKind.Variable */]: (0, nls_1.localize)(11, null),
        [4 /* SymbolKind.Class */]: (0, nls_1.localize)(12, null),
        [22 /* SymbolKind.Struct */]: (0, nls_1.localize)(13, null),
        [23 /* SymbolKind.Event */]: (0, nls_1.localize)(14, null),
        [24 /* SymbolKind.Operator */]: (0, nls_1.localize)(15, null),
        [10 /* SymbolKind.Interface */]: (0, nls_1.localize)(16, null),
        [2 /* SymbolKind.Namespace */]: (0, nls_1.localize)(17, null),
        [3 /* SymbolKind.Package */]: (0, nls_1.localize)(18, null),
        [25 /* SymbolKind.TypeParameter */]: (0, nls_1.localize)(19, null),
        [1 /* SymbolKind.Module */]: (0, nls_1.localize)(20, null),
        [6 /* SymbolKind.Property */]: (0, nls_1.localize)(21, null),
        [9 /* SymbolKind.Enum */]: (0, nls_1.localize)(22, null),
        [21 /* SymbolKind.EnumMember */]: (0, nls_1.localize)(23, null),
        [14 /* SymbolKind.String */]: (0, nls_1.localize)(24, null),
        [0 /* SymbolKind.File */]: (0, nls_1.localize)(25, null),
        [17 /* SymbolKind.Array */]: (0, nls_1.localize)(26, null),
        [15 /* SymbolKind.Number */]: (0, nls_1.localize)(27, null),
        [16 /* SymbolKind.Boolean */]: (0, nls_1.localize)(28, null),
        [18 /* SymbolKind.Object */]: (0, nls_1.localize)(29, null),
        [19 /* SymbolKind.Key */]: (0, nls_1.localize)(30, null),
        [7 /* SymbolKind.Field */]: (0, nls_1.localize)(31, null),
        [13 /* SymbolKind.Constant */]: (0, nls_1.localize)(32, null)
    };
});
//#endregion
//# sourceMappingURL=gotoSymbolQuickAccess.js.map