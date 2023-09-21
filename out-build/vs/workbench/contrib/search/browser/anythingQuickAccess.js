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
define(["require", "exports", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/fuzzyScorer", "vs/workbench/services/search/common/queryBuilder", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/search/common/search", "vs/workbench/services/search/common/search", "vs/platform/workspace/common/workspace", "vs/base/common/labels", "vs/workbench/services/path/common/pathService", "vs/base/common/uri", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/label/common/label", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/search/browser/anythingQuickAccess", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/editor/common/core/range", "vs/base/common/async", "vs/base/common/arrays", "vs/workbench/contrib/search/common/cacheState", "vs/workbench/services/history/common/history", "vs/base/common/network", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/map", "vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/editor/common/services/resolverService", "vs/base/common/functional", "vs/editor/browser/editorBrowser", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/iconLabels", "vs/base/common/lazy", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/chat", "vs/css!./media/anythingQuickAccess"], function (require, exports, quickInput_1, pickerQuickAccess_1, fuzzyScorer_1, queryBuilder_1, instantiation_1, search_1, search_2, workspace_1, labels_1, pathService_1, uri_1, resources_1, environmentService_1, files_1, lifecycle_1, label_1, getIconClasses_1, model_1, language_1, nls_1, workingCopyService_1, configuration_1, editor_1, editorService_1, range_1, async_1, arrays_1, cacheState_1, history_1, network_1, filesConfigurationService_1, map_1, symbolsQuickAccess_1, quickAccess_1, gotoSymbolQuickAccess_1, resolverService_1, functional_1, editorBrowser_1, codicons_1, themables_1, uriIdentity_1, iconLabels_1, lazy_1, keybinding_1, platform_1, chatQuickInputActions_1, chat_1) {
    "use strict";
    var $EMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EMb = void 0;
    function isEditorSymbolQuickPickItem(pick) {
        const candidate = pick;
        return !!candidate?.range && !!candidate.resource;
    }
    let $EMb = class $EMb extends pickerQuickAccess_1.$sqb {
        static { $EMb_1 = this; }
        static { this.PREFIX = ''; }
        static { this.j = {
            label: (0, nls_1.localize)(0, null)
        }; }
        static { this.m = 512; }
        static { this.n = 200; } // this delay accommodates for the user typing a word and then stops typing to start searching
        static { this.r = 200; } // allow some time to merge fast and slow picks to reduce flickering
        get defaultFilterValue() {
            if (this.S.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        constructor(t, u, w, y, z, C, D, F, G, H, I, J, L, M, N, O, P, Q, R) {
            super($EMb_1.PREFIX, {
                canAcceptInBackground: true,
                noResultsPick: $EMb_1.j
            });
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.s = new class {
                constructor(c, d) {
                    this.c = c;
                    this.d = d;
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
                    (0, functional_1.$bb)(picker.onDispose)(() => {
                        if (picker === this.picker) {
                            this.picker = undefined; // clear the picker when disposed to not keep it in memory for too long
                        }
                    });
                    // Caches
                    const isQuickNavigating = !!picker.quickNavigate;
                    if (!isQuickNavigating) {
                        this.fileQueryCache = this.c.cb();
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
                    const activeEditorPane = this.d.activeEditorPane;
                    if (activeEditorPane) {
                        this.editorViewState = {
                            group: activeEditorPane.group,
                            editor: activeEditorPane.input,
                            state: (0, editorBrowser_1.$mV)(activeEditorPane.getControl())?.saveViewState() ?? undefined,
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
            }(this, this.J);
            //#region Editor History
            this.Z = new quickInput_1.$Eq({ skipDescription: true });
            //#endregion
            //#region File Search
            this.ab = this.B(new async_1.$Eg($EMb_1.n));
            this.bb = this.t.createInstance(queryBuilder_1.$AJ);
            //#endregion
            //#region Command Center (if enabled)
            this.kb = new lazy_1.$T(() => platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
            //#endregion
            //#region Workspace Symbols (if enabled)
            this.mb = this.B(this.t.createInstance(symbolsQuickAccess_1.$DMb));
            //#endregion
            //#region Editor Symbols (if narrowing down into a global pick via `@`)
            this.ob = this.t.createInstance(gotoSymbolQuickAccess_1.$BMb);
        }
        get S() {
            const editorConfig = this.I.getValue().workbench?.editor;
            const searchConfig = this.I.getValue().search;
            const quickAccessConfig = this.I.getValue().workbench.quickOpen;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection,
                includeSymbols: searchConfig?.quickOpen.includeSymbols,
                includeHistory: searchConfig?.quickOpen.includeHistory,
                historyFilterSortOrder: searchConfig?.quickOpen.history.filterSortOrder,
                shortAutoSaveDelay: this.M.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */,
                preserveInput: quickAccessConfig.preserveInput
            };
        }
        provide(picker, token, runOptions) {
            const disposables = new lifecycle_1.$jc();
            // Update the pick state for this run
            this.s.set(picker);
            // Add editor decorations for active editor symbol picks
            const editorDecorationsDisposable = disposables.add(new lifecycle_1.$lc());
            disposables.add(picker.onDidChangeActive(() => {
                // Clear old decorations
                editorDecorationsDisposable.value = undefined;
                // Add new decoration if editor symbol is active
                const [item] = picker.activeItems;
                if (isEditorSymbolQuickPickItem(item)) {
                    editorDecorationsDisposable.value = this.U(item);
                }
            }));
            // Restore view state upon cancellation if we changed it
            // but only when the picker was closed via explicit user
            // gesture and not e.g. when focus was lost because that
            // could mean the user clicked into the editor directly.
            disposables.add((0, functional_1.$bb)(picker.onDidHide)(({ reason }) => {
                if (reason === quickInput_1.QuickInputHideReason.Gesture) {
                    this.s.restoreEditorViewState();
                }
            }));
            // Start picker
            disposables.add(super.provide(picker, token, runOptions));
            return disposables;
        }
        U(pick) {
            const activeEditor = this.J.activeEditor;
            if (!this.O.extUri.isEqual(pick.resource, activeEditor?.resource)) {
                return lifecycle_1.$kc.None; // active editor needs to be for resource
            }
            const activeEditorControl = this.J.activeTextEditorControl;
            if (!activeEditorControl) {
                return lifecycle_1.$kc.None; // we need a text editor control to decorate and reveal
            }
            // we must remember our curret view state to be able to restore
            this.s.rememberEditorViewState();
            // Reveal
            activeEditorControl.revealRangeInCenter(pick.range.selection, 0 /* ScrollType.Smooth */);
            // Decorate
            this.addDecorations(activeEditorControl, pick.range.decoration);
            return (0, lifecycle_1.$ic)(() => this.clearDecorations(activeEditorControl));
        }
        g(originalFilter, disposables, token, runOptions) {
            // Find a suitable range from the pattern looking for ":", "#" or ","
            // unless we have the `@` editor symbol character inside the filter
            const filterWithRange = (0, search_1.$NI)(originalFilter, [gotoSymbolQuickAccess_1.$BMb.PREFIX]);
            // Update filter with normalized values
            let filter;
            if (filterWithRange) {
                filter = filterWithRange.filter;
            }
            else {
                filter = originalFilter;
            }
            // Remember as last range
            this.s.lastRange = filterWithRange?.range;
            // If the original filter value has changed but the normalized
            // one has not, we return early with a `null` result indicating
            // that the results should preserve because the range information
            // (:<line>:<column>) does not need to trigger any re-sorting.
            if (originalFilter !== this.s.lastOriginalFilter && filter === this.s.lastFilter) {
                return null;
            }
            // Remember as last filter
            const lastWasFiltering = !!this.s.lastOriginalFilter;
            this.s.lastOriginalFilter = originalFilter;
            this.s.lastFilter = filter;
            // Remember our pick state before returning new picks
            // unless we are inside an editor symbol filter or result.
            // We can use this state to return back to the global pick
            // when the user is narrowing back out of editor symbols.
            const picks = this.s.picker?.items;
            const activePick = this.s.picker?.activeItems[0];
            if (picks && activePick) {
                const activePickIsEditorSymbol = isEditorSymbolQuickPickItem(activePick);
                const activePickIsNoResultsInEditorSymbols = activePick === $EMb_1.j && filter.indexOf(gotoSymbolQuickAccess_1.$BMb.PREFIX) >= 0;
                if (!activePickIsEditorSymbol && !activePickIsNoResultsInEditorSymbols) {
                    this.s.lastGlobalPicks = {
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
            return this.X(filter, { enableEditorSymbolSearch: lastWasFiltering, includeHelp: runOptions?.includeHelp, from: runOptions?.from }, disposables, token);
        }
        X(filter, options, disposables, token) {
            const query = (0, fuzzyScorer_1.$oq)(filter);
            // Return early if we have editor symbol picks. We support this by:
            // - having a previously active global pick (e.g. a file)
            // - the user typing `@` to start the local symbol query
            if (options.enableEditorSymbolSearch) {
                const editorSymbolPicks = this.pb(query, disposables, token);
                if (editorSymbolPicks) {
                    return editorSymbolPicks;
                }
            }
            // If we have a known last active editor symbol pick, we try to restore
            // the last global pick to support the case of narrowing out from a
            // editor symbol search back into the global search
            const activePick = this.s.picker?.activeItems[0];
            if (isEditorSymbolQuickPickItem(activePick) && this.s.lastGlobalPicks) {
                return this.s.lastGlobalPicks;
            }
            // Otherwise return normally with history and file/symbol results
            const historyEditorPicks = this.$(query);
            let picks;
            if (this.s.isQuickNavigating) {
                picks = historyEditorPicks;
            }
            else {
                picks = [];
                if (options.includeHelp) {
                    picks.push(...this.lb(query, token, options));
                }
                if (historyEditorPicks.length !== 0) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)(1, null) });
                    picks.push(...historyEditorPicks);
                }
            }
            return {
                // Fast picks: help (if included) & editor history
                picks,
                // Slow picks: files and symbols
                additionalPicks: (async () => {
                    // Exclude any result that is already present in editor history
                    const additionalPicksExcludes = new map_1.$zi();
                    for (const historyEditorPick of historyEditorPicks) {
                        if (historyEditorPick.resource) {
                            additionalPicksExcludes.set(historyEditorPick.resource, true);
                        }
                    }
                    const additionalPicks = await this.Y(query, additionalPicksExcludes, token);
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    return additionalPicks.length > 0 ? [
                        { type: 'separator', label: this.S.includeSymbols ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null) },
                        ...additionalPicks
                    ] : [];
                })(),
                // allow some time to merge files and symbols to reduce flickering
                mergeDelay: $EMb_1.r
            };
        }
        async Y(query, excludes, token) {
            // Resolve file and symbol picks (if enabled)
            const [filePicks, symbolPicks] = await Promise.all([
                this.db(query, excludes, token),
                this.nb(query, token)
            ]);
            if (token.isCancellationRequested) {
                return [];
            }
            // Perform sorting (top results by score)
            const sortedAnythingPicks = (0, arrays_1.top)([...filePicks, ...symbolPicks], (anyPickA, anyPickB) => (0, fuzzyScorer_1.$nq)(anyPickA, anyPickB, query, true, quickInput_1.$Fq, this.s.scorerCache), $EMb_1.m);
            // Perform filtering
            const filteredAnythingPicks = [];
            for (const anythingPick of sortedAnythingPicks) {
                // Always preserve any existing highlights (e.g. from workspace symbols)
                if (anythingPick.highlights) {
                    filteredAnythingPicks.push(anythingPick);
                }
                // Otherwise, do the scoring and matching here
                else {
                    const { score, labelMatch, descriptionMatch } = (0, fuzzyScorer_1.$mq)(anythingPick, query, true, quickInput_1.$Fq, this.s.scorerCache);
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
        $(query) {
            const configuration = this.S;
            // Just return all history entries if not searching
            if (!query.normalized) {
                return this.L.getHistory().map(editor => this.rb(editor, configuration));
            }
            if (!this.S.includeHistory) {
                return []; // disabled when searching
            }
            // Perform filtering
            const editorHistoryScorerAccessor = query.containsPathSeparator ? quickInput_1.$Fq : this.Z; // Only match on label of the editor unless the search includes path separators
            const editorHistoryPicks = [];
            for (const editor of this.L.getHistory()) {
                const resource = editor.resource;
                // allow untitled and terminal editors to go through
                if (!resource || (!this.C.hasProvider(resource) && resource.scheme !== network_1.Schemas.untitled && resource.scheme !== network_1.Schemas.vscodeTerminal)) {
                    continue; // exclude editors without file resource if we are searching by pattern
                }
                const editorHistoryPick = this.rb(editor, configuration);
                const { score, labelMatch, descriptionMatch } = (0, fuzzyScorer_1.$mq)(editorHistoryPick, query, false, editorHistoryScorerAccessor, this.s.scorerCache);
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
            if (this.S.historyFilterSortOrder === 'recency') {
                return editorHistoryPicks;
            }
            // Perform sorting
            return editorHistoryPicks.sort((editorA, editorB) => (0, fuzzyScorer_1.$nq)(editorA, editorB, query, false, editorHistoryScorerAccessor, this.s.scorerCache));
        }
        cb() {
            return new cacheState_1.$CMb(cacheKey => this.bb.file(this.w.getWorkspace().folders, this.hb({ cacheKey })), query => this.u.fileSearch(query), cacheKey => this.u.clearCache(cacheKey), this.s.fileQueryCache).load();
        }
        async db(query, excludes, token) {
            if (!query.normalized) {
                return [];
            }
            // Absolute path result
            const absolutePathResult = await this.ib(query, token);
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
                const absolutePathPick = this.rb(absolutePathResult, this.S);
                absolutePathPick.highlights = {
                    label: [{ start: 0, end: absolutePathPick.label.length }],
                    description: absolutePathPick.description ? [{ start: 0, end: absolutePathPick.description.length }] : undefined
                };
                return [absolutePathPick];
            }
            // Otherwise run the file search (with a delayer if cache is not ready yet)
            if (this.s.fileQueryCache?.isLoaded) {
                fileMatches = await this.eb(query, token);
            }
            else {
                fileMatches = await this.ab.trigger(async () => {
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    return this.eb(query, token);
                });
            }
            if (token.isCancellationRequested) {
                return [];
            }
            // Filter excludes & convert to picks
            const configuration = this.S;
            return fileMatches
                .filter(resource => !excludes.has(resource))
                .map(resource => this.rb(resource, configuration));
        }
        async eb(query, token) {
            const [fileSearchResults, relativePathFileResults] = await Promise.all([
                // File search: this is a search over all files of the workspace using the provided pattern
                this.fb(query, token),
                // Relative path search: we also want to consider results that match files inside the workspace
                // by looking for relative paths that the user typed as query. This allows to return even excluded
                // results into the picker if found (e.g. helps for opening compilation results that are otherwise
                // excluded)
                this.jb(query, token)
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
            const relativePathFileResultsMap = new map_1.$zi();
            for (const relativePathFileResult of relativePathFileResults) {
                relativePathFileResultsMap.set(relativePathFileResult, true);
            }
            return [
                ...fileSearchResults.filter(result => !relativePathFileResultsMap.has(result)),
                ...relativePathFileResults
            ];
        }
        async fb(query, token) {
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
            const fileSearchResults = await this.gb(filePattern, token);
            if (token.isCancellationRequested) {
                return [];
            }
            // If we detect that the search limit has been hit and we have a query
            // that was composed of multiple inputs where we only took the first part
            // we run another search with the full original query included to make
            // sure we are including all possible results that could match.
            if (fileSearchResults.limitHit && query.values && query.values.length > 1) {
                const additionalFileSearchResults = await this.gb(query.original, token);
                if (token.isCancellationRequested) {
                    return [];
                }
                // Remember which result we already covered
                const existingFileSearchResultsMap = new map_1.$zi();
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
        gb(filePattern, token) {
            return this.u.fileSearch(this.bb.file(this.w.getWorkspace().folders, this.hb({
                filePattern,
                cacheKey: this.s.fileQueryCache?.cacheKey,
                maxResults: $EMb_1.m
            })), token);
        }
        hb(input) {
            return {
                _reason: 'openFileHandler',
                extraFileResources: this.t.invokeFunction(search_1.$MI),
                filePattern: input.filePattern || '',
                cacheKey: input.cacheKey,
                maxResults: input.maxResults || 0,
                sortByScore: true
            };
        }
        async ib(query, token) {
            if (!query.containsPathSeparator) {
                return;
            }
            const userHome = await this.y.userHome();
            const detildifiedQuery = (0, labels_1.$hA)(query.original, userHome.scheme === network_1.Schemas.file ? userHome.fsPath : userHome.path);
            if (token.isCancellationRequested) {
                return;
            }
            const isAbsolutePathQuery = (await this.y.path).isAbsolute(detildifiedQuery);
            if (token.isCancellationRequested) {
                return;
            }
            if (isAbsolutePathQuery) {
                const resource = (0, resources_1.$sg)(await this.y.fileURI(detildifiedQuery), this.z.remoteAuthority, this.y.defaultUriScheme);
                if (token.isCancellationRequested) {
                    return;
                }
                try {
                    if ((await this.C.stat(resource)).isFile) {
                        return resource;
                    }
                }
                catch (error) {
                    // ignore if file does not exist
                }
            }
            return;
        }
        async jb(query, token) {
            if (!query.containsPathSeparator) {
                return;
            }
            // Convert relative paths to absolute paths over all folders of the workspace
            // and return them as results if the absolute paths exist
            const isAbsolutePathQuery = (await this.y.path).isAbsolute(query.original);
            if (!isAbsolutePathQuery) {
                const resources = [];
                for (const folder of this.w.getWorkspace().folders) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const resource = (0, resources_1.$sg)(folder.toResource(query.original), this.z.remoteAuthority, this.y.defaultUriScheme);
                    try {
                        if ((await this.C.stat(resource)).isFile) {
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
        lb(query, token, runOptions) {
            if (query.normalized) {
                return []; // If there's a filter, we don't show the help
            }
            const providers = this.kb.value.getQuickAccessProviders()
                .filter(p => p.helpEntries.some(h => h.commandCenterOrder !== undefined))
                .flatMap(provider => provider.helpEntries
                .filter(h => h.commandCenterOrder !== undefined)
                .map(helpEntry => {
                const providerSpecificOptions = {
                    ...runOptions,
                    includeHelp: provider.prefix === $EMb_1.PREFIX ? false : runOptions?.includeHelp
                };
                const label = helpEntry.commandCenterLabel ?? helpEntry.description;
                return {
                    label,
                    description: helpEntry.prefix ?? provider.prefix,
                    commandCenterOrder: helpEntry.commandCenterOrder,
                    keybinding: helpEntry.commandId ? this.Q.lookupKeybinding(helpEntry.commandId) : undefined,
                    ariaLabel: (0, nls_1.localize)(4, null, label, helpEntry.description),
                    accept: () => {
                        this.P.quickAccess.show(provider.prefix, {
                            preserveValue: true,
                            providerOptions: providerSpecificOptions
                        });
                    }
                };
            }));
            // TODO: There has to be a better place for this, but it's the first time we are adding a non-quick access provider
            // to the command center, so for now, let's do this.
            if (this.R.enabled) {
                providers.push({
                    label: (0, nls_1.localize)(5, null),
                    commandCenterOrder: 30,
                    keybinding: this.Q.lookupKeybinding(chatQuickInputActions_1.$JIb),
                    accept: () => this.R.toggle()
                });
            }
            return providers.sort((a, b) => a.commandCenterOrder - b.commandCenterOrder);
        }
        async nb(query, token) {
            const configuration = this.S;
            if (!query.normalized || // we need a value for search for
                !configuration.includeSymbols || // we need to enable symbols in search
                this.s.lastRange // a range is an indicator for just searching for files
            ) {
                return [];
            }
            // Delegate to the existing symbols quick access
            // but skip local results and also do not score
            return this.mb.getSymbolPicks(query.original, {
                skipLocal: true,
                skipSorting: true,
                delay: $EMb_1.n
            }, token);
        }
        pb(query, disposables, token) {
            const filterSegments = query.original.split(gotoSymbolQuickAccess_1.$BMb.PREFIX);
            const filter = filterSegments.length > 1 ? filterSegments[filterSegments.length - 1].trim() : undefined;
            if (typeof filter !== 'string') {
                return null; // we need to be searched for editor symbols via `@`
            }
            const activeGlobalPick = this.s.lastGlobalPicks?.active;
            if (!activeGlobalPick) {
                return null; // we need an active global pick to find symbols for
            }
            const activeGlobalResource = activeGlobalPick.resource;
            if (!activeGlobalResource || (!this.C.hasProvider(activeGlobalResource) && activeGlobalResource.scheme !== network_1.Schemas.untitled)) {
                return null; // we need a resource that we can resolve
            }
            if (activeGlobalPick.label.includes(gotoSymbolQuickAccess_1.$BMb.PREFIX) || activeGlobalPick.description?.includes(gotoSymbolQuickAccess_1.$BMb.PREFIX)) {
                if (filterSegments.length < 3) {
                    return null; // require at least 2 `@` if our active pick contains `@` in label or description
                }
            }
            return this.qb(activeGlobalPick, activeGlobalResource, filter, disposables, token);
        }
        async qb(activeGlobalPick, activeGlobalResource, filter, disposables, token) {
            // Bring the editor to front to review symbols to go to
            try {
                // we must remember our curret view state to be able to restore
                this.s.rememberEditorViewState();
                // open it
                await this.J.openEditor({
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
            let model = this.F.getModel(activeGlobalResource);
            if (!model) {
                try {
                    const modelReference = disposables.add(await this.N.createModelReference(activeGlobalResource));
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
            const editorSymbolPicks = (await this.ob.getSymbolPicks(model, filter, { extraContainerLabel: (0, iconLabels_1.$Tj)(activeGlobalPick.label) }, disposables, token));
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
                        this.sb(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, forceOpenSideBySide: true });
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    },
                    accept: (keyMods, event) => this.sb(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, preserveFocus: event.inBackground, forcePinned: event.inBackground })
                };
            });
        }
        addDecorations(editor, range) {
            this.ob.addDecorations(editor, range);
        }
        clearDecorations(editor) {
            this.ob.clearDecorations(editor);
        }
        //#endregion
        //#region Helpers
        rb(resourceOrEditor, configuration) {
            const isEditorHistoryEntry = !uri_1.URI.isUri(resourceOrEditor);
            let resource;
            let label;
            let description = undefined;
            let isDirty = undefined;
            let extraClasses;
            if ((0, editor_1.$UE)(resourceOrEditor)) {
                resource = editor_1.$3E.getOriginalUri(resourceOrEditor);
                label = resourceOrEditor.getName();
                description = resourceOrEditor.getDescription();
                isDirty = resourceOrEditor.isDirty() && !resourceOrEditor.isSaving();
                extraClasses = resourceOrEditor.getLabelExtraClasses();
            }
            else {
                resource = uri_1.URI.isUri(resourceOrEditor) ? resourceOrEditor : resourceOrEditor.resource;
                label = (0, resources_1.$eg)(resource);
                description = this.D.getUriLabel((0, resources_1.$hg)(resource), { relative: true });
                isDirty = this.H.isDirty(resource) && !configuration.shortAutoSaveDelay;
                extraClasses = [];
            }
            const labelAndDescription = description ? `${label} ${description}` : label;
            const iconClassesValue = new lazy_1.$T(() => (0, getIconClasses_1.$x6)(this.F, this.G, resource).concat(extraClasses));
            const buttonsValue = new lazy_1.$T(() => {
                const openSideBySideDirection = configuration.openSideBySideDirection;
                const buttons = [];
                // Open to side / below
                buttons.push({
                    iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitVertical),
                    tooltip: openSideBySideDirection === 'right' ?
                        (0, nls_1.localize)(6, null) :
                        (0, nls_1.localize)(7, null)
                });
                // Remove from History
                if (isEditorHistoryEntry) {
                    buttons.push({
                        iconClass: isDirty ? ('dirty-anything ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.circleFilled)) : themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close),
                        tooltip: (0, nls_1.localize)(8, null),
                        alwaysVisible: isDirty
                    });
                }
                return buttons;
            });
            return {
                resource,
                label,
                ariaLabel: isDirty ? (0, nls_1.localize)(9, null, labelAndDescription) : labelAndDescription,
                description,
                get iconClasses() { return iconClassesValue.value; },
                get buttons() { return buttonsValue.value; },
                trigger: (buttonIndex, keyMods) => {
                    switch (buttonIndex) {
                        // Open to side / below
                        case 0:
                            this.sb(resourceOrEditor, { keyMods, range: this.s.lastRange, forceOpenSideBySide: true });
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        // Remove from History
                        case 1:
                            if (!uri_1.URI.isUri(resourceOrEditor)) {
                                this.L.removeFromHistory(resourceOrEditor);
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                            }
                    }
                    return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                },
                accept: (keyMods, event) => this.sb(resourceOrEditor, { keyMods, range: this.s.lastRange, preserveFocus: event.inBackground, forcePinned: event.inBackground })
            };
        }
        async sb(resourceOrEditor, options) {
            // Craft some editor options based on quick access usage
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.keyMods?.ctrlCmd || options.forcePinned || this.S.openEditorPinned,
                selection: options.range ? range_1.$ks.collapseToStart(options.range) : undefined
            };
            const targetGroup = options.keyMods?.alt || (this.S.openEditorPinned && options.keyMods?.ctrlCmd) || options.forceOpenSideBySide ? editorService_1.$$C : editorService_1.$0C;
            // Restore any view state if the target is the side group
            if (targetGroup === editorService_1.$$C) {
                await this.s.restoreEditorViewState();
            }
            // Open editor (typed)
            if ((0, editor_1.$UE)(resourceOrEditor)) {
                await this.J.openEditor(resourceOrEditor, editorOptions, targetGroup);
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
                await this.J.openEditor(resourceEditorInput, targetGroup);
            }
        }
    };
    exports.$EMb = $EMb;
    exports.$EMb = $EMb = $EMb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, search_2.$oI),
        __param(2, workspace_1.$Kh),
        __param(3, pathService_1.$yJ),
        __param(4, environmentService_1.$hJ),
        __param(5, files_1.$6j),
        __param(6, label_1.$Vz),
        __param(7, model_1.$yA),
        __param(8, language_1.$ct),
        __param(9, workingCopyService_1.$TC),
        __param(10, configuration_1.$8h),
        __param(11, editorService_1.$9C),
        __param(12, history_1.$SM),
        __param(13, filesConfigurationService_1.$yD),
        __param(14, resolverService_1.$uA),
        __param(15, uriIdentity_1.$Ck),
        __param(16, quickInput_1.$Gq),
        __param(17, keybinding_1.$2D),
        __param(18, chat_1.$Oqb)
    ], $EMb);
});
//# sourceMappingURL=anythingQuickAccess.js.map