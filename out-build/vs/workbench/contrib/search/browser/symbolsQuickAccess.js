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
define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/async", "vs/workbench/contrib/search/common/search", "vs/editor/common/languages", "vs/platform/label/common/label", "vs/base/common/network", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/find/browser/findController", "vs/base/common/fuzzyScorer", "vs/base/common/codicons", "vs/base/common/themables"], function (require, exports, nls_1, pickerQuickAccess_1, async_1, search_1, languages_1, label_1, network_1, opener_1, editorService_1, range_1, configuration_1, codeEditorService_1, findController_1, fuzzyScorer_1, codicons_1, themables_1) {
    "use strict";
    var $DMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DMb = void 0;
    let $DMb = class $DMb extends pickerQuickAccess_1.$sqb {
        static { $DMb_1 = this; }
        static { this.PREFIX = '#'; }
        static { this.a = 200; } // this delay accommodates for the user typing a word and then stops typing to start searching
        static { this.b = new Set([
            4 /* SymbolKind.Class */,
            9 /* SymbolKind.Enum */,
            0 /* SymbolKind.File */,
            10 /* SymbolKind.Interface */,
            2 /* SymbolKind.Namespace */,
            3 /* SymbolKind.Package */,
            1 /* SymbolKind.Module */
        ]); }
        get defaultFilterValue() {
            // Prefer the word under the cursor in the active editor as default filter
            const editor = this.s.getFocusedCodeEditor();
            if (editor) {
                return (0, findController_1.$V7)(editor) ?? undefined;
            }
            return undefined;
        }
        constructor(j, m, n, r, s) {
            super($DMb_1.PREFIX, {
                canAcceptInBackground: true,
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null)
                }
            });
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.h = this.B(new async_1.$Eg($DMb_1.a));
        }
        get t() {
            const editorConfig = this.r.getValue().workbench?.editor;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection
            };
        }
        g(filter, disposables, token) {
            return this.getSymbolPicks(filter, undefined, token);
        }
        async getSymbolPicks(filter, options, token) {
            return this.h.trigger(async () => {
                if (token.isCancellationRequested) {
                    return [];
                }
                return this.w((0, fuzzyScorer_1.$oq)(filter), options, token);
            }, options?.delay);
        }
        async w(query, options, token) {
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
            // Run the workspace symbol query
            const workspaceSymbols = await (0, search_1.$LI)(symbolQuery.original, token);
            if (token.isCancellationRequested) {
                return [];
            }
            const symbolPicks = [];
            // Convert to symbol picks and apply filtering
            const openSideBySideDirection = this.t.openSideBySideDirection;
            for (const { symbol, provider } of workspaceSymbols) {
                // Depending on the workspace symbols filter setting, skip over symbols that:
                // - do not have a container
                // - and are not treated explicitly as global symbols (e.g. classes)
                if (options?.skipLocal && !$DMb_1.b.has(symbol.kind) && !!symbol.containerName) {
                    continue;
                }
                const symbolLabel = symbol.name;
                const symbolLabelWithIcon = `$(${languages_1.SymbolKinds.toIcon(symbol.kind).id}) ${symbolLabel}`;
                const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
                // Score by symbol label if searching
                let symbolScore = undefined;
                let symbolMatches = undefined;
                let skipContainerQuery = false;
                if (symbolQuery.original.length > 0) {
                    // First: try to score on the entire query, it is possible that
                    // the symbol matches perfectly (e.g. searching for "change log"
                    // can be a match on a markdown symbol "change log"). In that
                    // case we want to skip the container query altogether.
                    if (symbolQuery !== query) {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.$lq)(symbolLabelWithIcon, { ...query, values: undefined /* disable multi-query support */ }, 0, symbolLabelIconOffset);
                        if (typeof symbolScore === 'number') {
                            skipContainerQuery = true; // since we consumed the query, skip any container matching
                        }
                    }
                    // Otherwise: score on the symbol query and match on the container later
                    if (typeof symbolScore !== 'number') {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.$lq)(symbolLabelWithIcon, symbolQuery, 0, symbolLabelIconOffset);
                        if (typeof symbolScore !== 'number') {
                            continue;
                        }
                    }
                }
                const symbolUri = symbol.location.uri;
                let containerLabel = undefined;
                if (symbolUri) {
                    const containerPath = this.j.getUriLabel(symbolUri, { relative: true });
                    if (symbol.containerName) {
                        containerLabel = `${symbol.containerName} • ${containerPath}`;
                    }
                    else {
                        containerLabel = containerPath;
                    }
                }
                // Score by container if specified and searching
                let containerScore = undefined;
                let containerMatches = undefined;
                if (!skipContainerQuery && containerQuery && containerQuery.original.length > 0) {
                    if (containerLabel) {
                        [containerScore, containerMatches] = (0, fuzzyScorer_1.$lq)(containerLabel, containerQuery);
                    }
                    if (typeof containerScore !== 'number') {
                        continue;
                    }
                    if (typeof symbolScore === 'number') {
                        symbolScore += containerScore; // boost symbolScore by containerScore
                    }
                }
                const deprecated = symbol.tags ? symbol.tags.indexOf(1 /* SymbolTag.Deprecated */) >= 0 : false;
                symbolPicks.push({
                    symbol,
                    resource: symbolUri,
                    score: symbolScore,
                    label: symbolLabelWithIcon,
                    ariaLabel: symbolLabel,
                    highlights: deprecated ? undefined : {
                        label: symbolMatches,
                        description: containerMatches
                    },
                    description: containerLabel,
                    strikethrough: deprecated,
                    buttons: [
                        {
                            iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitVertical),
                            tooltip: openSideBySideDirection === 'right' ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null)
                        }
                    ],
                    trigger: (buttonIndex, keyMods) => {
                        this.y(provider, symbol, token, { keyMods, forceOpenSideBySide: true });
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    },
                    accept: async (keyMods, event) => this.y(provider, symbol, token, { keyMods, preserveFocus: event.inBackground, forcePinned: event.inBackground }),
                });
            }
            // Sort picks (unless disabled)
            if (!options?.skipSorting) {
                symbolPicks.sort((symbolA, symbolB) => this.z(symbolA, symbolB));
            }
            return symbolPicks;
        }
        async y(provider, symbol, token, options) {
            // Resolve actual symbol to open for providers that can resolve
            let symbolToOpen = symbol;
            if (typeof provider.resolveWorkspaceSymbol === 'function') {
                symbolToOpen = await provider.resolveWorkspaceSymbol(symbol, token) || symbol;
                if (token.isCancellationRequested) {
                    return;
                }
            }
            // Open HTTP(s) links with opener service
            if (symbolToOpen.location.uri.scheme === network_1.Schemas.http || symbolToOpen.location.uri.scheme === network_1.Schemas.https) {
                await this.m.open(symbolToOpen.location.uri, { fromUserGesture: true, allowContributedOpeners: true });
            }
            // Otherwise open as editor
            else {
                await this.n.openEditor({
                    resource: symbolToOpen.location.uri,
                    options: {
                        preserveFocus: options?.preserveFocus,
                        pinned: options.keyMods.ctrlCmd || options.forcePinned || this.t.openEditorPinned,
                        selection: symbolToOpen.location.range ? range_1.$ks.collapseToStart(symbolToOpen.location.range) : undefined
                    }
                }, options.keyMods.alt || (this.t.openEditorPinned && options.keyMods.ctrlCmd) || options?.forceOpenSideBySide ? editorService_1.$$C : editorService_1.$0C);
            }
        }
        z(symbolA, symbolB) {
            // By score
            if (typeof symbolA.score === 'number' && typeof symbolB.score === 'number') {
                if (symbolA.score > symbolB.score) {
                    return -1;
                }
                if (symbolA.score < symbolB.score) {
                    return 1;
                }
            }
            // By name
            if (symbolA.symbol && symbolB.symbol) {
                const symbolAName = symbolA.symbol.name.toLowerCase();
                const symbolBName = symbolB.symbol.name.toLowerCase();
                const res = symbolAName.localeCompare(symbolBName);
                if (res !== 0) {
                    return res;
                }
            }
            // By kind
            if (symbolA.symbol && symbolB.symbol) {
                const symbolAKind = languages_1.SymbolKinds.toIcon(symbolA.symbol.kind).id;
                const symbolBKind = languages_1.SymbolKinds.toIcon(symbolB.symbol.kind).id;
                return symbolAKind.localeCompare(symbolBKind);
            }
            return 0;
        }
    };
    exports.$DMb = $DMb;
    exports.$DMb = $DMb = $DMb_1 = __decorate([
        __param(0, label_1.$Vz),
        __param(1, opener_1.$NT),
        __param(2, editorService_1.$9C),
        __param(3, configuration_1.$8h),
        __param(4, codeEditorService_1.$nV)
    ], $DMb);
});
//# sourceMappingURL=symbolsQuickAccess.js.map