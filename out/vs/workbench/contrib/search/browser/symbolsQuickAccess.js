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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/async", "vs/workbench/contrib/search/common/search", "vs/editor/common/languages", "vs/platform/label/common/label", "vs/base/common/network", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/find/browser/findController", "vs/base/common/fuzzyScorer", "vs/base/common/codicons", "vs/base/common/themables"], function (require, exports, nls_1, pickerQuickAccess_1, async_1, search_1, languages_1, label_1, network_1, opener_1, editorService_1, range_1, configuration_1, codeEditorService_1, findController_1, fuzzyScorer_1, codicons_1, themables_1) {
    "use strict";
    var SymbolsQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SymbolsQuickAccessProvider = void 0;
    let SymbolsQuickAccessProvider = class SymbolsQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { SymbolsQuickAccessProvider_1 = this; }
        static { this.PREFIX = '#'; }
        static { this.TYPING_SEARCH_DELAY = 200; } // this delay accommodates for the user typing a word and then stops typing to start searching
        static { this.TREAT_AS_GLOBAL_SYMBOL_TYPES = new Set([
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
            const editor = this.codeEditorService.getFocusedCodeEditor();
            if (editor) {
                return (0, findController_1.getSelectionSearchString)(editor) ?? undefined;
            }
            return undefined;
        }
        constructor(labelService, openerService, editorService, configurationService, codeEditorService) {
            super(SymbolsQuickAccessProvider_1.PREFIX, {
                canAcceptInBackground: true,
                noResultsPick: {
                    label: (0, nls_1.localize)('noSymbolResults', "No matching workspace symbols")
                }
            });
            this.labelService = labelService;
            this.openerService = openerService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            this.delayer = this._register(new async_1.ThrottledDelayer(SymbolsQuickAccessProvider_1.TYPING_SEARCH_DELAY));
        }
        get configuration() {
            const editorConfig = this.configurationService.getValue().workbench?.editor;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection
            };
        }
        _getPicks(filter, disposables, token) {
            return this.getSymbolPicks(filter, undefined, token);
        }
        async getSymbolPicks(filter, options, token) {
            return this.delayer.trigger(async () => {
                if (token.isCancellationRequested) {
                    return [];
                }
                return this.doGetSymbolPicks((0, fuzzyScorer_1.prepareQuery)(filter), options, token);
            }, options?.delay);
        }
        async doGetSymbolPicks(query, options, token) {
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
            // Run the workspace symbol query
            const workspaceSymbols = await (0, search_1.getWorkspaceSymbols)(symbolQuery.original, token);
            if (token.isCancellationRequested) {
                return [];
            }
            const symbolPicks = [];
            // Convert to symbol picks and apply filtering
            const openSideBySideDirection = this.configuration.openSideBySideDirection;
            for (const { symbol, provider } of workspaceSymbols) {
                // Depending on the workspace symbols filter setting, skip over symbols that:
                // - do not have a container
                // - and are not treated explicitly as global symbols (e.g. classes)
                if (options?.skipLocal && !SymbolsQuickAccessProvider_1.TREAT_AS_GLOBAL_SYMBOL_TYPES.has(symbol.kind) && !!symbol.containerName) {
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
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(symbolLabelWithIcon, { ...query, values: undefined /* disable multi-query support */ }, 0, symbolLabelIconOffset);
                        if (typeof symbolScore === 'number') {
                            skipContainerQuery = true; // since we consumed the query, skip any container matching
                        }
                    }
                    // Otherwise: score on the symbol query and match on the container later
                    if (typeof symbolScore !== 'number') {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(symbolLabelWithIcon, symbolQuery, 0, symbolLabelIconOffset);
                        if (typeof symbolScore !== 'number') {
                            continue;
                        }
                    }
                }
                const symbolUri = symbol.location.uri;
                let containerLabel = undefined;
                if (symbolUri) {
                    const containerPath = this.labelService.getUriLabel(symbolUri, { relative: true });
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
                        [containerScore, containerMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(containerLabel, containerQuery);
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
                            iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitVertical),
                            tooltip: openSideBySideDirection === 'right' ? (0, nls_1.localize)('openToSide', "Open to the Side") : (0, nls_1.localize)('openToBottom', "Open to the Bottom")
                        }
                    ],
                    trigger: (buttonIndex, keyMods) => {
                        this.openSymbol(provider, symbol, token, { keyMods, forceOpenSideBySide: true });
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    },
                    accept: async (keyMods, event) => this.openSymbol(provider, symbol, token, { keyMods, preserveFocus: event.inBackground, forcePinned: event.inBackground }),
                });
            }
            // Sort picks (unless disabled)
            if (!options?.skipSorting) {
                symbolPicks.sort((symbolA, symbolB) => this.compareSymbols(symbolA, symbolB));
            }
            return symbolPicks;
        }
        async openSymbol(provider, symbol, token, options) {
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
                await this.openerService.open(symbolToOpen.location.uri, { fromUserGesture: true, allowContributedOpeners: true });
            }
            // Otherwise open as editor
            else {
                await this.editorService.openEditor({
                    resource: symbolToOpen.location.uri,
                    options: {
                        preserveFocus: options?.preserveFocus,
                        pinned: options.keyMods.ctrlCmd || options.forcePinned || this.configuration.openEditorPinned,
                        selection: symbolToOpen.location.range ? range_1.Range.collapseToStart(symbolToOpen.location.range) : undefined
                    }
                }, options.keyMods.alt || (this.configuration.openEditorPinned && options.keyMods.ctrlCmd) || options?.forceOpenSideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            }
        }
        compareSymbols(symbolA, symbolB) {
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
    exports.SymbolsQuickAccessProvider = SymbolsQuickAccessProvider;
    exports.SymbolsQuickAccessProvider = SymbolsQuickAccessProvider = SymbolsQuickAccessProvider_1 = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, opener_1.IOpenerService),
        __param(2, editorService_1.IEditorService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, codeEditorService_1.ICodeEditorService)
    ], SymbolsQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ltYm9sc1F1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc3ltYm9sc1F1aWNrQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2QnpGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsNkNBQStDOztpQkFFdkYsV0FBTSxHQUFHLEdBQUcsQUFBTixDQUFPO2lCQUVJLHdCQUFtQixHQUFHLEdBQUcsQUFBTixDQUFPLEdBQUMsOEZBQThGO2lCQUVsSSxpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsQ0FBYTs7Ozs7Ozs7U0FRakUsQ0FBQyxBQVJ5QyxDQVF4QztRQUlILElBQUksa0JBQWtCO1lBRXJCLDBFQUEwRTtZQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM3RCxJQUFJLE1BQU0sRUFBRTtnQkFDWCxPQUFPLElBQUEseUNBQXdCLEVBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDO2FBQ3JEO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELFlBQ2dCLFlBQTRDLEVBQzNDLGFBQThDLEVBQzlDLGFBQThDLEVBQ3ZDLG9CQUE0RCxFQUMvRCxpQkFBc0Q7WUFFMUUsS0FBSyxDQUFDLDRCQUEwQixDQUFDLE1BQU0sRUFBRTtnQkFDeEMscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsYUFBYSxFQUFFO29CQUNkLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSwrQkFBK0IsQ0FBQztpQkFDbkU7YUFDRCxDQUFDLENBQUM7WUFYNkIsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDMUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzdCLGtCQUFhLEdBQWIs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