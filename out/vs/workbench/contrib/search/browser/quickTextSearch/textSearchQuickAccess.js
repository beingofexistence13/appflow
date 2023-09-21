var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/resources", "vs/base/common/themables", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/platform/quickinput/common/quickAccess", "vs/platform/workspace/common/workspace", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/search/browser/searchView", "vs/workbench/contrib/search/common/search", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search"], function (require, exports, lifecycle_1, map_1, resources_1, themables_1, nls_1, configuration_1, instantiation_1, label_1, listService_1, pickerQuickAccess_1, quickAccess_1, workspace_1, views_1, searchIcons_1, searchModel_1, searchView_1, search_1, editorService_1, queryBuilder_1, search_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextSearchQuickAccess = exports.TEXT_SEARCH_QUICK_ACCESS_PREFIX = void 0;
    exports.TEXT_SEARCH_QUICK_ACCESS_PREFIX = '% ';
    const DEFAULT_TEXT_QUERY_BUILDER_OPTIONS = {
        _reason: 'quickAccessSearch',
        disregardIgnoreFiles: false,
        disregardExcludeSettings: false,
        onlyOpenEditors: false,
        expandPatterns: true
    };
    const MAX_FILES_SHOWN = 30;
    const MAX_RESULTS_PER_FILE = 10;
    let TextSearchQuickAccess = class TextSearchQuickAccess extends pickerQuickAccess_1.PickerQuickAccessProvider {
        _getTextQueryBuilderOptions(charsPerLine) {
            return {
                ...DEFAULT_TEXT_QUERY_BUILDER_OPTIONS,
                ...{
                    extraFileResources: this._instantiationService.invokeFunction(search_1.getOutOfWorkspaceEditorResources),
                    maxResults: this.configuration.maxResults ?? undefined,
                    isSmartCase: this.configuration.smartCase,
                },
                previewOptions: {
                    matchLines: 1,
                    charsPerLine
                }
            };
        }
        constructor(_instantiationService, _contextService, _editorService, _labelService, _viewsService, _configurationService) {
            super(exports.TEXT_SEARCH_QUICK_ACCESS_PREFIX, { canAcceptInBackground: true });
            this._instantiationService = _instantiationService;
            this._contextService = _contextService;
            this._editorService = _editorService;
            this._labelService = _labelService;
            this._viewsService = _viewsService;
            this._configurationService = _configurationService;
            this.queryBuilder = this._instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            this.searchModel = this._instantiationService.createInstance(searchModel_1.SearchModel);
        }
        dispose() {
            this.searchModel.dispose();
            super.dispose();
        }
        provide(picker, token, runOptions) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(super.provide(picker, token, runOptions));
            disposables.add(picker.onDidHide(() => this.searchModel.searchResult.toggleHighlights(false)));
            disposables.add(picker.onDidAccept(() => this.searchModel.searchResult.toggleHighlights(false)));
            return disposables;
        }
        get configuration() {
            const editorConfig = this._configurationService.getValue().workbench?.editor;
            const searchConfig = this._configurationService.getValue().search;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                preserveInput: searchConfig.experimental.quickAccess.preserveInput,
                maxResults: searchConfig.maxResults,
                smartCase: searchConfig.smartCase,
            };
        }
        get defaultFilterValue() {
            if (this.configuration.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        doSearch(contentPattern, token) {
            if (contentPattern === '') {
                return undefined;
            }
            const folderResources = this._contextService.getWorkspace().folders;
            const content = {
                pattern: contentPattern,
            };
            const charsPerLine = content.isRegExp ? 10000 : 1000; // from https://github.com/microsoft/vscode/blob/e7ad5651ac26fa00a40aa1e4010e81b92f655569/src/vs/workbench/contrib/search/browser/searchView.ts#L1508
            const query = this.queryBuilder.text(content, folderResources.map(folder => folder.uri), this._getTextQueryBuilderOptions(charsPerLine));
            const result = this.searchModel.search(query, undefined, token);
            const getAsyncResults = async () => {
                await result.asyncResults;
                const syncResultURIs = new map_1.ResourceSet(result.syncResults.map(e => e.resource));
                return this.searchModel.searchResult.matches().filter(e => !syncResultURIs.has(e.resource));
            };
            return {
                syncResults: this.searchModel.searchResult.matches(),
                asyncResults: getAsyncResults()
            };
        }
        moveToSearchViewlet(model, currentElem) {
            // this function takes this._searchModel.searchResult and moves it to the search viewlet's search model.
            // then, this._searchModel will construct a new (empty) SearchResult, and the search viewlet's search result will be disposed.
            this._viewsService.openView(search_2.VIEW_ID, false);
            const viewlet = this._viewsService.getActiveViewWithId(search_2.VIEW_ID);
            viewlet.importSearchResult(model);
            const viewer = viewlet?.getControl();
            viewer.setFocus([currentElem], (0, listService_1.getSelectionKeyboardEvent)());
            viewer.setSelection([currentElem], (0, listService_1.getSelectionKeyboardEvent)());
            viewer.reveal(currentElem);
        }
        _getPicksFromMatches(matches, limit) {
            matches = matches.sort(searchModel_1.searchComparer);
            const files = matches.length > limit ? matches.slice(0, limit) : matches;
            const picks = [];
            for (let fileIndex = 0; fileIndex < matches.length; fileIndex++) {
                if (fileIndex === limit) {
                    picks.push({
                        type: 'separator',
                    });
                    picks.push({
                        label: (0, nls_1.localize)('QuickSearchSeeMoreFiles', "See More Files"),
                        iconClass: themables_1.ThemeIcon.asClassName(searchIcons_1.searchDetailsIcon),
                        accept: async () => {
                            this.moveToSearchViewlet(this.searchModel, matches[limit]);
                        }
                    });
                    break;
                }
                const fileMatch = files[fileIndex];
                const label = (0, resources_1.basenameOrAuthority)(fileMatch.resource);
                const description = this._labelService.getUriLabel((0, resources_1.dirname)(fileMatch.resource), { relative: true });
                picks.push({
                    label,
                    type: 'separator',
                    tooltip: description,
                    buttons: [{
                            iconClass: themables_1.ThemeIcon.asClassName(searchIcons_1.searchOpenInFileIcon),
                            tooltip: (0, nls_1.localize)('QuickSearchOpenInFile', "Open File")
                        }],
                });
                const results = fileMatch.matches() ?? [];
                for (let matchIndex = 0; matchIndex < results.length; matchIndex++) {
                    const element = results[matchIndex];
                    if (matchIndex === MAX_RESULTS_PER_FILE) {
                        picks.push({
                            label: (0, nls_1.localize)('QuickSearchMore', "More"),
                            iconClass: themables_1.ThemeIcon.asClassName(searchIcons_1.searchDetailsIcon),
                            accept: async () => {
                                this.moveToSearchViewlet(this.searchModel, element);
                            }
                        });
                        break;
                    }
                    const preview = element.preview();
                    const previewText = (preview.before + preview.inside + preview.after).trim().substring(0, 999);
                    const match = [{
                            start: preview.before.length,
                            end: preview.before.length + preview.inside.length
                        }];
                    picks.push({
                        label: `${previewText}`,
                        highlights: {
                            label: match
                        },
                        ariaLabel: `Match at location ${element.range().startLineNumber}:${element.range().startColumn} - ${previewText}`,
                        accept: async (keyMods, event) => {
                            await this.handleAccept(fileMatch, {
                                keyMods,
                                selection: (0, searchView_1.getEditorSelectionFromMatch)(element, this.searchModel),
                                preserveFocus: event.inBackground,
                                forcePinned: event.inBackground,
                                indexedCellOptions: element instanceof searchModel_1.MatchInNotebook ? { index: element.cellIndex, selection: element.range() } : undefined
                            });
                        }
                    });
                }
            }
            return picks;
        }
        async handleAccept(fileMatch, options) {
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.keyMods?.ctrlCmd || options.forcePinned || this.configuration.openEditorPinned,
                selection: options.selection
            };
            // from https://github.com/microsoft/vscode/blob/f40dabca07a1622b2a0ae3ee741cfc94ab964bef/src/vs/workbench/contrib/search/browser/anythingQuickAccess.ts#L1037
            const targetGroup = options.keyMods?.alt || (this.configuration.openEditorPinned && options.keyMods?.ctrlCmd) || options.forceOpenSideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP;
            await this._editorService.openEditor({
                resource: fileMatch.resource,
                options: editorOptions
            }, targetGroup);
        }
        _getPicks(contentPattern, disposables, token) {
            if (contentPattern === '') {
                this.searchModel.searchResult.clear();
                return [];
            }
            const allMatches = this.doSearch(contentPattern, token);
            if (!allMatches) {
                return null;
            }
            const matches = allMatches.syncResults;
            const syncResult = this._getPicksFromMatches(matches, MAX_FILES_SHOWN);
            if (syncResult.length > 0) {
                this.searchModel.searchResult.toggleHighlights(true);
            }
            if (matches.length >= MAX_FILES_SHOWN) {
                return syncResult;
            }
            return {
                picks: syncResult,
                additionalPicks: allMatches.asyncResults
                    .then(asyncResults => this._getPicksFromMatches(asyncResults, MAX_FILES_SHOWN - matches.length))
                    .then(picks => {
                    if (picks.length > 0) {
                        this.searchModel.searchResult.toggleHighlights(true);
                    }
                    return picks;
                })
            };
        }
    };
    exports.TextSearchQuickAccess = TextSearchQuickAccess;
    exports.TextSearchQuickAccess = TextSearchQuickAccess = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, editorService_1.IEditorService),
        __param(3, label_1.ILabelService),
        __param(4, views_1.IViewsService),
        __param(5, configuration_1.IConfigurationService)
    ], TextSearchQuickAccess);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaFF1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvcXVpY2tUZXh0U2VhcmNoL3RleHRTZWFyY2hRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBK0JhLFFBQUEsK0JBQStCLEdBQUcsSUFBSSxDQUFDO0lBRXBELE1BQU0sa0NBQWtDLEdBQTZCO1FBQ3BFLE9BQU8sRUFBRSxtQkFBbUI7UUFDNUIsb0JBQW9CLEVBQUUsS0FBSztRQUMzQix3QkFBd0IsRUFBRSxLQUFLO1FBQy9CLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLGNBQWMsRUFBRSxJQUFJO0tBQ3BCLENBQUM7SUFFRixNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7SUFDM0IsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFFekIsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSw2Q0FBaUQ7UUFJbkYsMkJBQTJCLENBQUMsWUFBb0I7WUFDdkQsT0FBTztnQkFDTixHQUFHLGtDQUFrQztnQkFDckMsR0FBSTtvQkFDSCxrQkFBa0IsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLHlDQUFnQyxDQUFDO29CQUMvRixVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLElBQUksU0FBUztvQkFDdEQsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUztpQkFDekM7Z0JBRUQsY0FBYyxFQUFFO29CQUNmLFVBQVUsRUFBRSxDQUFDO29CQUNiLFlBQVk7aUJBQ1o7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVELFlBQ3lDLHFCQUE0QyxFQUN6QyxlQUF5QyxFQUNuRCxjQUE4QixFQUMvQixhQUE0QixFQUM1QixhQUE0QixFQUNwQixxQkFBNEM7WUFFcEYsS0FB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