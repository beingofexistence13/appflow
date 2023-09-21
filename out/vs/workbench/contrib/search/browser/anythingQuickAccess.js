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
define(["require", "exports", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/fuzzyScorer", "vs/workbench/services/search/common/queryBuilder", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/search/common/search", "vs/workbench/services/search/common/search", "vs/platform/workspace/common/workspace", "vs/base/common/labels", "vs/workbench/services/path/common/pathService", "vs/base/common/uri", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/label/common/label", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/editor/common/core/range", "vs/base/common/async", "vs/base/common/arrays", "vs/workbench/contrib/search/common/cacheState", "vs/workbench/services/history/common/history", "vs/base/common/network", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/map", "vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/editor/common/services/resolverService", "vs/base/common/functional", "vs/editor/browser/editorBrowser", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/iconLabels", "vs/base/common/lazy", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/chat", "vs/css!./media/anythingQuickAccess"], function (require, exports, quickInput_1, pickerQuickAccess_1, fuzzyScorer_1, queryBuilder_1, instantiation_1, search_1, search_2, workspace_1, labels_1, pathService_1, uri_1, resources_1, environmentService_1, files_1, lifecycle_1, label_1, getIconClasses_1, model_1, language_1, nls_1, workingCopyService_1, configuration_1, editor_1, editorService_1, range_1, async_1, arrays_1, cacheState_1, history_1, network_1, filesConfigurationService_1, map_1, symbolsQuickAccess_1, quickAccess_1, gotoSymbolQuickAccess_1, resolverService_1, functional_1, editorBrowser_1, codicons_1, themables_1, uriIdentity_1, iconLabels_1, lazy_1, keybinding_1, platform_1, chatQuickInputActions_1, chat_1) {
    "use strict";
    var AnythingQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnythingQuickAccessProvider = void 0;
    function isEditorSymbolQuickPickItem(pick) {
        const candidate = pick;
        return !!candidate?.range && !!candidate.resource;
    }
    let AnythingQuickAccessProvider = class AnythingQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { AnythingQuickAccessProvider_1 = this; }
        static { this.PREFIX = ''; }
        static { this.NO_RESULTS_PICK = {
            label: (0, nls_1.localize)('noAnythingResults', "No matching results")
        }; }
        static { this.MAX_RESULTS = 512; }
        static { this.TYPING_SEARCH_DELAY = 200; } // this delay accommodates for the user typing a word and then stops typing to start searching
        static { this.SYMBOL_PICKS_MERGE_DELAY = 200; } // allow some time to merge fast and slow picks to reduce flickering
        get defaultFilterValue() {
            if (this.configuration.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        constructor(instantiationService, searchService, contextService, pathService, environmentService, fileService, labelService, modelService, languageService, workingCopyService, configurationService, editorService, historyService, filesConfigurationService, textModelService, uriIdentityService, quickInputService, keybindingService, quickChatService) {
            super(AnythingQuickAccessProvider_1.PREFIX, {
                canAcceptInBackground: true,
                noResultsPick: AnythingQuickAccessProvider_1.NO_RESULTS_PICK
            });
            this.instantiationService = instantiationService;
            this.searchService = searchService;
            this.contextService = contextService;
            this.pathService = pathService;
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.labelService = labelService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.workingCopyService = workingCopyService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.historyService = historyService;
            this.filesConfigurationService = filesConfigurationService;
            this.textModelService = textModelService;
            this.uriIdentityService = uriIdentityService;
            this.quickInputService = quickInputService;
            this.keybindingService = keybindingService;
            this.quickChatService = quickChatService;
            this.pickState = new class {
                constructor(provider, editorService) {
                    this.provider = provider;
                    this.editorService = editorService;
                    this.picker = undefined;
                    this.editorViewState = undefined;
                    this.scorerCache = Object.create(null);
                    this.fileQueryCache = undefined;
                    this.lastOriginalFilter = undefined;
                    this.lastFilter = undefined;
                    this.lastRange = undefined;
                    this.lastGlobalPicks = undefined;
                    this.isQuickNavigating = undefined;
                }
                set(picker) {
                    // Picker for this run
                    this.picker = picker;
                    (0, functional_1.once)(picker.onDispose)(() => {
                        if (picker === this.picker) {
                            this.picker = undefined; // clear the picker when disposed to not keep it in memory for too long
                        }
                    });
                    // Caches
                    const isQuickNavigating = !!picker.quickNavigate;
                    if (!isQuickNavigating) {
                        this.fileQueryCache = this.provider.createFileQueryCache();
                        this.scorerCache = Object.create(null);
                    }
                    // Other
                    this.isQuickNavigating = isQuickNavigating;
                    this.lastOriginalFilter = undefined;
                    this.lastFilter = undefined;
                    this.lastRange = undefined;
                    this.lastGlobalPicks = undefined;
                    this.editorViewState = undefined;
                }
                rememberEditorViewState() {
                    if (this.editorViewState) {
                        return; // return early if already done
                    }
                    const activeEditorPane = this.editorService.activeEditorPane;
                    if (activeEditorPane) {
                        this.editorViewState = {
                            group: activeEditorPane.group,
                            editor: activeEditorPane.input,
                            state: (0, editorBrowser_1.getIEditor)(activeEditorPane.getControl())?.saveViewState() ?? undefined,
                        };
                    }
                }
                async restoreEditorViewState() {
                    if (this.editorViewState) {
                        const options = {
                            viewState: this.editorViewState.state,
                            preserveFocus: true /* import to not close the picker as a result */
                        };
                        await this.editorViewState.group.openEditor(this.editorViewState.editor, options);
                    }
                }
            }(this, this.editorService);
            //#region Editor History
            this.labelOnlyEditorHistoryPickAccessor = new quickInput_1.QuickPickItemScorerAccessor({ skipDescription: true });
            //#endregion
            //#region File Search
            this.fileQueryDelayer = this._register(new async_1.ThrottledDelayer(AnythingQuickAccessProvider_1.TYPING_SEARCH_DELAY));
            this.fileQueryBuilder = this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            //#endregion
            //#region Command Center (if enabled)
            this.lazyRegistry = new lazy_1.Lazy(() => platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
            //#endregion
            //#region Workspace Symbols (if enabled)
            this.workspaceSymbolsQuickAccess = this._register(this.instantiationService.createInstance(symbolsQuickAccess_1.SymbolsQuickAccessProvider));
            //#endregion
            //#region Editor Symbols (if narrowing down into a global pick via `@`)
            this.editorSymbolsQuickAccess = this.instantiationService.createInstance(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider);
        }
        get configuration() {
            const editorConfig = this.configurationService.getValue().workbench?.editor;
            const searchConfig = this.configurationService.getValue().search;
            const quickAccessConfig = this.configurationService.getValue().workbench.quickOpen;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection,
                includeSymbols: searchConfig?.quickOpen.includeSymbols,
                includeHistory: searchConfig?.quickOpen.includeHistory,
                historyFilterSortOrder: searchConfig?.quickOpen.history.filterSortOrder,
                shortAutoSaveDelay: this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */,
                preserveInput: quickAccessConfig.preserveInput
            };
        }
        provide(picker, token, runOptions) {
            const disposables = new lifecycle_1.DisposableStore();
            // Update the pick state for this run
            this.pickState.set(picker);
            // Add editor decorations for active editor symbol picks
            const editorDecorationsDisposable = disposables.add(new lifecycle_1.MutableDisposable());
            disposables.add(picker.onDidChangeActive(() => {
                // Clear old decorations
                editorDecorationsDisposable.value = undefined;
                // Add new decoration if editor symbol is active
                const [item] = picker.activeItems;
                if (isEditorSymbolQuickPickItem(item)) {
                    editorDecorationsDisposable.value = this.decorateAndRevealSymbolRange(item);
                }
            }));
            // Restore view state upon cancellation if we changed it
            // but only when the picker was closed via explicit user
            // gesture and not e.g. when focus was lost because that
            // could mean the user clicked into the editor directly.
            disposables.add((0, functional_1.once)(picker.onDidHide)(({ reason }) => {
                if (reason === quickInput_1.QuickInputHideReason.Gesture) {
                    this.pickState.restoreEditorViewState();
                }
            }));
            // Start picker
            disposables.add(super.provide(picker, token, runOptions));
            return disposables;
        }
        decorateAndRevealSymbolRange(pick) {
            const activeEditor = this.editorService.activeEditor;
            if (!this.uriIdentityService.extUri.isEqual(pick.resource, activeEditor?.resource)) {
                return lifecycle_1.Disposable.None; // active editor needs to be for resource
            }
            const activeEditorControl = this.editorService.activeTextEditorControl;
            if (!activeEditorControl) {
                return lifecycle_1.Disposable.None; // we need a text editor control to decorate and reveal
            }
            // we must remember our curret view state to be able to restore
            this.pickState.rememberEditorViewState();
            // Reveal
            activeEditorControl.revealRangeInCenter(pick.range.selection, 0 /* ScrollType.Smooth */);
            // Decorate
            this.addDecorations(activeEditorControl, pick.range.decoration);
            return (0, lifecycle_1.toDisposable)(() => this.clearDecorations(activeEditorControl));
        }
        _getPicks(originalFilter, disposables, token, runOptions) {
            // Find a suitable range from the pattern looking for ":", "#" or ","
            // unless we have the `@` editor symbol character inside the filter
            const filterWithRange = (0, search_1.extractRangeFromFilter)(originalFilter, [gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX]);
            // Update filter with normalized values
            let filter;
            if (filterWithRange) {
                filter = filterWithRange.filter;
            }
            else {
                filter = originalFilter;
            }
            // Remember as last range
            this.pickState.lastRange = filterWithRange?.range;
            // If the original filter value has changed but the normalized
            // one has not, we return early with a `null` result indicating
            // that the results should preserve because the range information
            // (:<line>:<column>) does not need to trigger any re-sorting.
            if (originalFilter !== this.pickState.lastOriginalFilter && filter === this.pickState.lastFilter) {
                return null;
            }
            // Remember as last filter
            const lastWasFiltering = !!this.pickState.lastOriginalFilter;
            this.pickState.lastOriginalFilter = originalFilter;
            this.pickState.lastFilter = filter;
            // Remember our pick state before returning new picks
            // unless we are inside an editor symbol filter or result.
            // We can use this state to return back to the global pick
            // when the user is narrowing back out of editor symbols.
            const picks = this.pickState.picker?.items;
            const activePick = this.pickState.picker?.activeItems[0];
            if (picks && activePick) {
                const activePickIsEditorSymbol = isEditorSymbolQuickPickItem(activePick);
                const activePickIsNoResultsInEditorSymbols = activePick === AnythingQuickAccessProvider_1.NO_RESULTS_PICK && filter.indexOf(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX) >= 0;
                if (!activePickIsEditorSymbol && !activePickIsNoResultsInEditorSymbols) {
                    this.pickState.lastGlobalPicks = {
                        items: picks,
                        active: activePick
                    };
                }
            }
            // `enableEditorSymbolSearch`: this will enable local editor symbol
            // search if the filter value includes `@` character. We only want
            // to enable this support though if the user was filtering in the
            // picker because this feature depends on an active item in the result
            // list to get symbols from. If we would simply trigger editor symbol
            // search without prior filtering, you could not paste a file name
            // including the `@` character to open it (e.g. /some/file@path)
            // refs: https://github.com/microsoft/vscode/issues/93845
            return this.doGetPicks(filter, { enableEditorSymbolSearch: lastWasFiltering, includeHelp: runOptions?.includeHelp, from: runOptions?.from }, disposables, token);
        }
        doGetPicks(filter, options, disposables, token) {
            const query = (0, fuzzyScorer_1.prepareQuery)(filter);
            // Return early if we have editor symbol picks. We support this by:
            // - having a previously active global pick (e.g. a file)
            // - the user typing `@` to start the local symbol query
            if (options.enableEditorSymbolSearch) {
                const editorSymbolPicks = this.getEditorSymbolPicks(query, disposables, token);
                if (editorSymbolPicks) {
                    return editorSymbolPicks;
                }
            }
            // If we have a known last active editor symbol pick, we try to restore
            // the last global pick to support the case of narrowing out from a
            // editor symbol search back into the global search
            const activePick = this.pickState.picker?.activeItems[0];
            if (isEditorSymbolQuickPickItem(activePick) && this.pickState.lastGlobalPicks) {
                return this.pickState.lastGlobalPicks;
            }
            // Otherwise return normally with history and file/symbol results
            const historyEditorPicks = this.getEditorHistoryPicks(query);
            let picks;
            if (this.pickState.isQuickNavigating) {
                picks = historyEditorPicks;
            }
            else {
                picks = [];
                if (options.includeHelp) {
                    picks.push(...this.getHelpPicks(query, token, options));
                }
                if (historyEditorPicks.length !== 0) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('recentlyOpenedSeparator', "recently opened") });
                    picks.push(...historyEditorPicks);
                }
            }
            return {
                // Fast picks: help (if included) & editor history
                picks,
                // Slow picks: files and symbols
                additionalPicks: (async () => {
                    // Exclude any result that is already present in editor history
                    const additionalPicksExcludes = new map_1.ResourceMap();
                    for (const historyEditorPick of historyEditorPicks) {
                        if (historyEditorPick.resource) {
                            additionalPicksExcludes.set(historyEditorPick.resource, true);
                        }
                    }
                    const additionalPicks = await this.getAdditionalPicks(query, additionalPicksExcludes, token);
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    return additionalPicks.length > 0 ? [
                        { type: 'separator', label: this.configuration.includeSymbols ? (0, nls_1.localize)('fileAndSymbolResultsSeparator', "file and symbol results") : (0, nls_1.localize)('fileResultsSeparator', "file results") },
                        ...additionalPicks
                    ] : [];
                })(),
                // allow some time to merge files and symbols to reduce flickering
                mergeDelay: AnythingQuickAccessProvider_1.SYMBOL_PICKS_MERGE_DELAY
            };
        }
        async getAdditionalPicks(query, excludes, token) {
            // Resolve file and symbol picks (if enabled)
            const [filePicks, symbolPicks] = await Promise.all([
                this.getFilePicks(query, excludes, token),
                this.getWorkspaceSymbolPicks(query, token)
            ]);
            if (token.isCancellationRequested) {
                return [];
            }
            // Perform sorting (top results by score)
            const sortedAnythingPicks = (0, arrays_1.top)([...filePicks, ...symbolPicks], (anyPickA, anyPickB) => (0, fuzzyScorer_1.compareItemsByFuzzyScore)(anyPickA, anyPickB, query, true, quickInput_1.quickPickItemScorerAccessor, this.pickState.scorerCache), AnythingQuickAccessProvider_1.MAX_RESULTS);
            // Perform filtering
            const filteredAnythingPicks = [];
            for (const anythingPick of sortedAnythingPicks) {
                // Always preserve any existing highlights (e.g. from workspace symbols)
                if (anythingPick.highlights) {
                    filteredAnythingPicks.push(anythingPick);
                }
                // Otherwise, do the scoring and matching here
                else {
                    const { score, labelMatch, descriptionMatch } = (0, fuzzyScorer_1.scoreItemFuzzy)(anythingPick, query, true, quickInput_1.quickPickItemScorerAccessor, this.pickState.scorerCache);
                    if (!score) {
                        continue;
                    }
                    anythingPick.highlights = {
                        label: labelMatch,
                        description: descriptionMatch
                    };
                    filteredAnythingPicks.push(anythingPick);
                }
            }
            return filteredAnythingPicks;
        }
        getEditorHistoryPicks(query) {
            const configuration = this.configuration;
            // Just return all history entries if not searching
            if (!query.normalized) {
                return this.historyService.getHistory().map(editor => this.createAnythingPick(editor, configuration));
            }
            if (!this.configuration.includeHistory) {
                return []; // disabled when searching
            }
            // Perform filtering
            const editorHistoryScorerAccessor = query.containsPathSeparator ? quickInput_1.quickPickItemScorerAccessor : this.labelOnlyEditorHistoryPickAccessor; // Only match on label of the editor unless the search includes path separators
            const editorHistoryPicks = [];
            for (const editor of this.historyService.getHistory()) {
                const resource = editor.resource;
                // allow untitled and terminal editors to go through
                if (!resource || (!this.fileService.hasProvider(resource) && resource.scheme !== network_1.Schemas.untitled && resource.scheme !== network_1.Schemas.vscodeTerminal)) {
                    continue; // exclude editors without file resource if we are searching by pattern
                }
                const editorHistoryPick = this.createAnythingPick(editor, configuration);
                const { score, labelMatch, descriptionMatch } = (0, fuzzyScorer_1.scoreItemFuzzy)(editorHistoryPick, query, false, editorHistoryScorerAccessor, this.pickState.scorerCache);
                if (!score) {
                    continue; // exclude editors not matching query
                }
                editorHistoryPick.highlights = {
                    label: labelMatch,
                    description: descriptionMatch
                };
                editorHistoryPicks.push(editorHistoryPick);
            }
            // Return without sorting if settings tell to sort by recency
            if (this.configuration.historyFilterSortOrder === 'recency') {
                return editorHistoryPicks;
            }
            // Perform sorting
            return editorHistoryPicks.sort((editorA, editorB) => (0, fuzzyScorer_1.compareItemsByFuzzyScore)(editorA, editorB, query, false, editorHistoryScorerAccessor, this.pickState.scorerCache));
        }
        createFileQueryCache() {
            return new cacheState_1.FileQueryCacheState(cacheKey => this.fileQueryBuilder.file(this.contextService.getWorkspace().folders, this.getFileQueryOptions({ cacheKey })), query => this.searchService.fileSearch(query), cacheKey => this.searchService.clearCache(cacheKey), this.pickState.fileQueryCache).load();
        }
        async getFilePicks(query, excludes, token) {
            if (!query.normalized) {
                return [];
            }
            // Absolute path result
            const absolutePathResult = await this.getAbsolutePathFileResult(query, token);
            if (token.isCancellationRequested) {
                return [];
            }
            // Use absolute path result as only results if present
            let fileMatches;
            if (absolutePathResult) {
                if (excludes.has(absolutePathResult)) {
                    return []; // excluded
                }
                // Create a single result pick and make sure to apply full
                // highlights to ensure the pick is displayed. Since a
                // ~ might have been used for searching, our fuzzy scorer
                // may otherwise not properly respect the pick as a result
                const absolutePathPick = this.createAnythingPick(absolutePathResult, this.configuration);
                absolutePathPick.highlights = {
                    label: [{ start: 0, end: absolutePathPick.label.length }],
                    description: absolutePathPick.description ? [{ start: 0, end: absolutePathPick.description.length }] : undefined
                };
                return [absolutePathPick];
            }
            // Otherwise run the file search (with a delayer if cache is not ready yet)
            if (this.pickState.fileQueryCache?.isLoaded) {
                fileMatches = await this.doFileSearch(query, token);
            }
            else {
                fileMatches = await this.fileQueryDelayer.trigger(async () => {
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    return this.doFileSearch(query, token);
                });
            }
            if (token.isCancellationRequested) {
                return [];
            }
            // Filter excludes & convert to picks
            const configuration = this.configuration;
            return fileMatches
                .filter(resource => !excludes.has(resource))
                .map(resource => this.createAnythingPick(resource, configuration));
        }
        async doFileSearch(query, token) {
            const [fileSearchResults, relativePathFileResults] = await Promise.all([
                // File search: this is a search over all files of the workspace using the provided pattern
                this.getFileSearchResults(query, token),
                // Relative path search: we also want to consider results that match files inside the workspace
                // by looking for relative paths that the user typed as query. This allows to return even excluded
                // results into the picker if found (e.g. helps for opening compilation results that are otherwise
                // excluded)
                this.getRelativePathFileResults(query, token)
            ]);
            if (token.isCancellationRequested) {
                return [];
            }
            // Return quickly if no relative results are present
            if (!relativePathFileResults) {
                return fileSearchResults;
            }
            // Otherwise, make sure to filter relative path results from
            // the search results to prevent duplicates
            const relativePathFileResultsMap = new map_1.ResourceMap();
            for (const relativePathFileResult of relativePathFileResults) {
                relativePathFileResultsMap.set(relativePathFileResult, true);
            }
            return [
                ...fileSearchResults.filter(result => !relativePathFileResultsMap.has(result)),
                ...relativePathFileResults
            ];
        }
        async getFileSearchResults(query, token) {
            // filePattern for search depends on the number of queries in input:
            // - with multiple: only take the first one and let the filter later drop non-matching results
            // - with single: just take the original in full
            //
            // This enables to e.g. search for "someFile someFolder" by only returning
            // search results for "someFile" and not both that would normally not match.
            //
            let filePattern = '';
            if (query.values && query.values.length > 1) {
                filePattern = query.values[0].original;
            }
            else {
                filePattern = query.original;
            }
            const fileSearchResults = await this.doGetFileSearchResults(filePattern, token);
            if (token.isCancellationRequested) {
                return [];
            }
            // If we detect that the search limit has been hit and we have a query
            // that was composed of multiple inputs where we only took the first part
            // we run another search with the full original query included to make
            // sure we are including all possible results that could match.
            if (fileSearchResults.limitHit && query.values && query.values.length > 1) {
                const additionalFileSearchResults = await this.doGetFileSearchResults(query.original, token);
                if (token.isCancellationRequested) {
                    return [];
                }
                // Remember which result we already covered
                const existingFileSearchResultsMap = new map_1.ResourceMap();
                for (const fileSearchResult of fileSearchResults.results) {
                    existingFileSearchResultsMap.set(fileSearchResult.resource, true);
                }
                // Add all additional results to the original set for inclusion
                for (const additionalFileSearchResult of additionalFileSearchResults.results) {
                    if (!existingFileSearchResultsMap.has(additionalFileSearchResult.resource)) {
                        fileSearchResults.results.push(additionalFileSearchResult);
                    }
                }
            }
            return fileSearchResults.results.map(result => result.resource);
        }
        doGetFileSearchResults(filePattern, token) {
            return this.searchService.fileSearch(this.fileQueryBuilder.file(this.contextService.getWorkspace().folders, this.getFileQueryOptions({
                filePattern,
                cacheKey: this.pickState.fileQueryCache?.cacheKey,
                maxResults: AnythingQuickAccessProvider_1.MAX_RESULTS
            })), token);
        }
        getFileQueryOptions(input) {
            return {
                _reason: 'openFileHandler',
                extraFileResources: this.instantiationService.invokeFunction(search_1.getOutOfWorkspaceEditorResources),
                filePattern: input.filePattern || '',
                cacheKey: input.cacheKey,
                maxResults: input.maxResults || 0,
                sortByScore: true
            };
        }
        async getAbsolutePathFileResult(query, token) {
            if (!query.containsPathSeparator) {
                return;
            }
            const userHome = await this.pathService.userHome();
            const detildifiedQuery = (0, labels_1.untildify)(query.original, userHome.scheme === network_1.Schemas.file ? userHome.fsPath : userHome.path);
            if (token.isCancellationRequested) {
                return;
            }
            const isAbsolutePathQuery = (await this.pathService.path).isAbsolute(detildifiedQuery);
            if (token.isCancellationRequested) {
                return;
            }
            if (isAbsolutePathQuery) {
                const resource = (0, resources_1.toLocalResource)(await this.pathService.fileURI(detildifiedQuery), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                if (token.isCancellationRequested) {
                    return;
                }
                try {
                    if ((await this.fileService.stat(resource)).isFile) {
                        return resource;
                    }
                }
                catch (error) {
                    // ignore if file does not exist
                }
            }
            return;
        }
        async getRelativePathFileResults(query, token) {
            if (!query.containsPathSeparator) {
                return;
            }
            // Convert relative paths to absolute paths over all folders of the workspace
            // and return them as results if the absolute paths exist
            const isAbsolutePathQuery = (await this.pathService.path).isAbsolute(query.original);
            if (!isAbsolutePathQuery) {
                const resources = [];
                for (const folder of this.contextService.getWorkspace().folders) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const resource = (0, resources_1.toLocalResource)(folder.toResource(query.original), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                    try {
                        if ((await this.fileService.stat(resource)).isFile) {
                            resources.push(resource);
                        }
                    }
                    catch (error) {
                        // ignore if file does not exist
                    }
                }
                return resources;
            }
            return;
        }
        getHelpPicks(query, token, runOptions) {
            if (query.normalized) {
                return []; // If there's a filter, we don't show the help
            }
            const providers = this.lazyRegistry.value.getQuickAccessProviders()
                .filter(p => p.helpEntries.some(h => h.commandCenterOrder !== undefined))
                .flatMap(provider => provider.helpEntries
                .filter(h => h.commandCenterOrder !== undefined)
                .map(helpEntry => {
                const providerSpecificOptions = {
                    ...runOptions,
                    includeHelp: provider.prefix === AnythingQuickAccessProvider_1.PREFIX ? false : runOptions?.includeHelp
                };
                const label = helpEntry.commandCenterLabel ?? helpEntry.description;
                return {
                    label,
                    description: helpEntry.prefix ?? provider.prefix,
                    commandCenterOrder: helpEntry.commandCenterOrder,
                    keybinding: helpEntry.commandId ? this.keybindingService.lookupKeybinding(helpEntry.commandId) : undefined,
                    ariaLabel: (0, nls_1.localize)('helpPickAriaLabel', "{0}, {1}", label, helpEntry.description),
                    accept: () => {
                        this.quickInputService.quickAccess.show(provider.prefix, {
                            preserveValue: true,
                            providerOptions: providerSpecificOptions
                        });
                    }
                };
            }));
            // TODO: There has to be a better place for this, but it's the first time we are adding a non-quick access provider
            // to the command center, so for now, let's do this.
            if (this.quickChatService.enabled) {
                providers.push({
                    label: (0, nls_1.localize)('chat', "Open Quick Chat"),
                    commandCenterOrder: 30,
                    keybinding: this.keybindingService.lookupKeybinding(chatQuickInputActions_1.ASK_QUICK_QUESTION_ACTION_ID),
                    accept: () => this.quickChatService.toggle()
                });
            }
            return providers.sort((a, b) => a.commandCenterOrder - b.commandCenterOrder);
        }
        async getWorkspaceSymbolPicks(query, token) {
            const configuration = this.configuration;
            if (!query.normalized || // we need a value for search for
                !configuration.includeSymbols || // we need to enable symbols in search
                this.pickState.lastRange // a range is an indicator for just searching for files
            ) {
                return [];
            }
            // Delegate to the existing symbols quick access
            // but skip local results and also do not score
            return this.workspaceSymbolsQuickAccess.getSymbolPicks(query.original, {
                skipLocal: true,
                skipSorting: true,
                delay: AnythingQuickAccessProvider_1.TYPING_SEARCH_DELAY
            }, token);
        }
        getEditorSymbolPicks(query, disposables, token) {
            const filterSegments = query.original.split(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX);
            const filter = filterSegments.length > 1 ? filterSegments[filterSegments.length - 1].trim() : undefined;
            if (typeof filter !== 'string') {
                return null; // we need to be searched for editor symbols via `@`
            }
            const activeGlobalPick = this.pickState.lastGlobalPicks?.active;
            if (!activeGlobalPick) {
                return null; // we need an active global pick to find symbols for
            }
            const activeGlobalResource = activeGlobalPick.resource;
            if (!activeGlobalResource || (!this.fileService.hasProvider(activeGlobalResource) && activeGlobalResource.scheme !== network_1.Schemas.untitled)) {
                return null; // we need a resource that we can resolve
            }
            if (activeGlobalPick.label.includes(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX) || activeGlobalPick.description?.includes(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX)) {
                if (filterSegments.length < 3) {
                    return null; // require at least 2 `@` if our active pick contains `@` in label or description
                }
            }
            return this.doGetEditorSymbolPicks(activeGlobalPick, activeGlobalResource, filter, disposables, token);
        }
        async doGetEditorSymbolPicks(activeGlobalPick, activeGlobalResource, filter, disposables, token) {
            // Bring the editor to front to review symbols to go to
            try {
                // we must remember our curret view state to be able to restore
                this.pickState.rememberEditorViewState();
                // open it
                await this.editorService.openEditor({
                    resource: activeGlobalResource,
                    options: { preserveFocus: true, revealIfOpened: true, ignoreError: true }
                });
            }
            catch (error) {
                return []; // return if resource cannot be opened
            }
            if (token.isCancellationRequested) {
                return [];
            }
            // Obtain model from resource
            let model = this.modelService.getModel(activeGlobalResource);
            if (!model) {
                try {
                    const modelReference = disposables.add(await this.textModelService.createModelReference(activeGlobalResource));
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    model = modelReference.object.textEditorModel;
                }
                catch (error) {
                    return []; // return if model cannot be resolved
                }
            }
            // Ask provider for editor symbols
            const editorSymbolPicks = (await this.editorSymbolsQuickAccess.getSymbolPicks(model, filter, { extraContainerLabel: (0, iconLabels_1.stripIcons)(activeGlobalPick.label) }, disposables, token));
            if (token.isCancellationRequested) {
                return [];
            }
            return editorSymbolPicks.map(editorSymbolPick => {
                // Preserve separators
                if (editorSymbolPick.type === 'separator') {
                    return editorSymbolPick;
                }
                // Convert editor symbols to anything pick
                return {
                    ...editorSymbolPick,
                    resource: activeGlobalResource,
                    description: editorSymbolPick.description,
                    trigger: (buttonIndex, keyMods) => {
                        this.openAnything(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, forceOpenSideBySide: true });
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    },
                    accept: (keyMods, event) => this.openAnything(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, preserveFocus: event.inBackground, forcePinned: event.inBackground })
                };
            });
        }
        addDecorations(editor, range) {
            this.editorSymbolsQuickAccess.addDecorations(editor, range);
        }
        clearDecorations(editor) {
            this.editorSymbolsQuickAccess.clearDecorations(editor);
        }
        //#endregion
        //#region Helpers
        createAnythingPick(resourceOrEditor, configuration) {
            const isEditorHistoryEntry = !uri_1.URI.isUri(resourceOrEditor);
            let resource;
            let label;
            let description = undefined;
            let isDirty = undefined;
            let extraClasses;
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                resource = editor_1.EditorResourceAccessor.getOriginalUri(resourceOrEditor);
                label = resourceOrEditor.getName();
                description = resourceOrEditor.getDescription();
                isDirty = resourceOrEditor.isDirty() && !resourceOrEditor.isSaving();
                extraClasses = resourceOrEditor.getLabelExtraClasses();
            }
            else {
                resource = uri_1.URI.isUri(resourceOrEditor) ? resourceOrEditor : resourceOrEditor.resource;
                label = (0, resources_1.basenameOrAuthority)(resource);
                description = this.labelService.getUriLabel((0, resources_1.dirname)(resource), { relative: true });
                isDirty = this.workingCopyService.isDirty(resource) && !configuration.shortAutoSaveDelay;
                extraClasses = [];
            }
            const labelAndDescription = description ? `${label} ${description}` : label;
            const iconClassesValue = new lazy_1.Lazy(() => (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, resource).concat(extraClasses));
            const buttonsValue = new lazy_1.Lazy(() => {
                const openSideBySideDirection = configuration.openSideBySideDirection;
                const buttons = [];
                // Open to side / below
                buttons.push({
                    iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitVertical),
                    tooltip: openSideBySideDirection === 'right' ?
                        (0, nls_1.localize)({ key: 'openToSide', comment: ['Open this file in a split editor on the left/right side'] }, "Open to the Side") :
                        (0, nls_1.localize)({ key: 'openToBottom', comment: ['Open this file in a split editor on the bottom'] }, "Open to the Bottom")
                });
                // Remove from History
                if (isEditorHistoryEntry) {
                    buttons.push({
                        iconClass: isDirty ? ('dirty-anything ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.circleFilled)) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close),
                        tooltip: (0, nls_1.localize)('closeEditor', "Remove from Recently Opened"),
                        alwaysVisible: isDirty
                    });
                }
                return buttons;
            });
            return {
                resource,
                label,
                ariaLabel: isDirty ? (0, nls_1.localize)('filePickAriaLabelDirty', "{0} unsaved changes", labelAndDescription) : labelAndDescription,
                description,
                get iconClasses() { return iconClassesValue.value; },
                get buttons() { return buttonsValue.value; },
                trigger: (buttonIndex, keyMods) => {
                    switch (buttonIndex) {
                        // Open to side / below
                        case 0:
                            this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, forceOpenSideBySide: true });
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        // Remove from History
                        case 1:
                            if (!uri_1.URI.isUri(resourceOrEditor)) {
                                this.historyService.removeFromHistory(resourceOrEditor);
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                            }
                    }
                    return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                },
                accept: (keyMods, event) => this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, preserveFocus: event.inBackground, forcePinned: event.inBackground })
            };
        }
        async openAnything(resourceOrEditor, options) {
            // Craft some editor options based on quick access usage
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.keyMods?.ctrlCmd || options.forcePinned || this.configuration.openEditorPinned,
                selection: options.range ? range_1.Range.collapseToStart(options.range) : undefined
            };
            const targetGroup = options.keyMods?.alt || (this.configuration.openEditorPinned && options.keyMods?.ctrlCmd) || options.forceOpenSideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP;
            // Restore any view state if the target is the side group
            if (targetGroup === editorService_1.SIDE_GROUP) {
                await this.pickState.restoreEditorViewState();
            }
            // Open editor (typed)
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                await this.editorService.openEditor(resourceOrEditor, editorOptions, targetGroup);
            }
            // Open editor (untyped)
            else {
                let resourceEditorInput;
                if (uri_1.URI.isUri(resourceOrEditor)) {
                    resourceEditorInput = {
                        resource: resourceOrEditor,
                        options: editorOptions
                    };
                }
                else {
                    resourceEditorInput = {
                        ...resourceOrEditor,
                        options: {
                            ...resourceOrEditor.options,
                            ...editorOptions
                        }
                    };
                }
                await this.editorService.openEditor(resourceEditorInput, targetGroup);
            }
        }
    };
    exports.AnythingQuickAccessProvider = AnythingQuickAccessProvider;
    exports.AnythingQuickAccessProvider = AnythingQuickAccessProvider = AnythingQuickAccessProvider_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, search_2.ISearchService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, pathService_1.IPathService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, files_1.IFileService),
        __param(6, label_1.ILabelService),
        __param(7, model_1.IModelService),
        __param(8, language_1.ILanguageService),
        __param(9, workingCopyService_1.IWorkingCopyService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, editorService_1.IEditorService),
        __param(12, history_1.IHistoryService),
        __param(13, filesConfigurationService_1.IFilesConfigurationService),
        __param(14, resolverService_1.ITextModelService),
        __param(15, uriIdentity_1.IUriIdentityService),
        __param(16, quickInput_1.IQuickInputService),
        __param(17, keybinding_1.IKeybindingService),
        __param(18, chat_1.IQuickChatService)
    ], AnythingQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW55dGhpbmdRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL2FueXRoaW5nUXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdFaEcsU0FBUywyQkFBMkIsQ0FBQyxJQUE2QjtRQUNqRSxNQUFNLFNBQVMsR0FBRyxJQUFzRCxDQUFDO1FBRXpFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDbkQsQ0FBQztJQUVNLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsNkNBQWlEOztpQkFFMUYsV0FBTSxHQUFHLEVBQUUsQUFBTCxDQUFNO2lCQUVLLG9CQUFlLEdBQTJCO1lBQ2pFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQztTQUMzRCxBQUZzQyxDQUVyQztpQkFFc0IsZ0JBQVcsR0FBRyxHQUFHLEFBQU4sQ0FBTztpQkFFbEIsd0JBQW1CLEdBQUcsR0FBRyxBQUFOLENBQU8sR0FBQyw4RkFBOEY7aUJBRWxJLDZCQUF3QixHQUFHLEdBQUcsQUFBTixDQUFPLEdBQUMsb0VBQW9FO1FBOEVuSCxJQUFJLGtCQUFrQjtZQUNyQixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFO2dCQUNyQyxPQUFPLDJDQUE2QixDQUFDLElBQUksQ0FBQzthQUMxQztZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxZQUN3QixvQkFBNEQsRUFDbkUsYUFBOEMsRUFDcEMsY0FBeUQsRUFDckUsV0FBMEMsRUFDMUIsa0JBQWlFLEVBQ2pGLFdBQTBDLEVBQ3pDLFlBQTRDLEVBQzVDLFlBQTRDLEVBQ3pDLGVBQWtE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