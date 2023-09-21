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
define(["require", "exports", "vs/base/common/platform", "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/browser/quickaccess", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/workbench/contrib/search/browser/anythingQuickAccess", "vs/workbench/contrib/search/browser/replaceContributions", "vs/workbench/contrib/search/browser/notebookSearchContributions", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchView", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search", "vs/workbench/common/configuration", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess", "vs/workbench/contrib/search/browser/searchActionsCopy", "vs/workbench/contrib/search/browser/searchActionsFind", "vs/workbench/contrib/search/browser/searchActionsNav", "vs/workbench/contrib/search/browser/searchActionsRemoveReplace", "vs/workbench/contrib/search/browser/searchActionsSymbol", "vs/workbench/contrib/search/browser/searchActionsTopBar", "vs/workbench/contrib/search/browser/searchActionsTextQuickAccess"], function (require, exports, platform, gotoLineQuickAccess_1, nls, configuration_1, configurationRegistry_1, contextkey_1, descriptors_1, extensions_1, quickAccess_1, platform_1, viewPaneContainer_1, quickaccess_1, contributions_1, views_1, gotoSymbolQuickAccess_1, anythingQuickAccess_1, replaceContributions_1, notebookSearchContributions_1, searchIcons_1, searchView_1, searchWidget_1, symbolsQuickAccess_1, searchHistoryService_1, searchModel_1, search_1, configuration_2, commands_1, types_1, search_2, Constants, textSearchQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(searchModel_1.ISearchViewModelWorkbenchService, searchModel_1.SearchViewModelWorkbenchService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(searchHistoryService_1.ISearchHistoryService, searchHistoryService_1.SearchHistoryService, 1 /* InstantiationType.Delayed */);
    (0, replaceContributions_1.registerContributions)();
    (0, notebookSearchContributions_1.registerContributions)();
    (0, searchWidget_1.registerContributions)();
    const SEARCH_MODE_CONFIG = 'search.mode';
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: search_1.VIEWLET_ID,
        title: { value: nls.localize('name', "Search"), original: 'Search' },
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [search_1.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }]),
        hideIfEmpty: true,
        icon: searchIcons_1.searchViewIcon,
        order: 1,
    }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
    const viewDescriptor = {
        id: search_1.VIEW_ID,
        containerIcon: searchIcons_1.searchViewIcon,
        name: nls.localize('search', "Search"),
        ctorDescriptor: new descriptors_1.SyncDescriptor(searchView_1.SearchView),
        canToggleVisibility: false,
        canMoveView: true,
        openCommandActionDescriptor: {
            id: viewContainer.id,
            mnemonicTitle: nls.localize({ key: 'miViewSearch', comment: ['&& denotes a mnemonic'] }, "&&Search"),
            keybindings: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                // Yes, this is weird. See #116188, #115556, #115511, and now #124146, for examples of what can go wrong here.
                when: contextkey_1.ContextKeyExpr.regex('neverMatch', /doesNotMatch/)
            },
            order: 1
        }
    };
    // Register search default location to sidebar
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([viewDescriptor], viewContainer);
    // Migrate search location setting to new model
    let RegisterSearchViewContribution = class RegisterSearchViewContribution {
        constructor(configurationService, viewDescriptorService) {
            const data = configurationService.inspect('search.location');
            if (data.value === 'panel') {
                viewDescriptorService.moveViewToLocation(viewDescriptor, 1 /* ViewContainerLocation.Panel */);
            }
            platform_1.Registry.as(configuration_2.Extensions.ConfigurationMigration)
                .registerConfigurationMigrations([{ key: 'search.location', migrateFn: (value) => ({ value: undefined }) }]);
        }
    };
    RegisterSearchViewContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, views_1.IViewDescriptorService)
    ], RegisterSearchViewContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(RegisterSearchViewContribution, 1 /* LifecyclePhase.Starting */);
    // Register Quick Access Handler
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: anythingQuickAccess_1.AnythingQuickAccessProvider,
        prefix: anythingQuickAccess_1.AnythingQuickAccessProvider.PREFIX,
        placeholder: nls.localize('anythingQuickAccessPlaceholder', "Search files by name (append {0} to go to line or {1} to go to symbol)", gotoLineQuickAccess_1.AbstractGotoLineQuickAccessProvider.PREFIX, gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX),
        contextKey: quickaccess_1.defaultQuickAccessContextKeyValue,
        helpEntries: [{
                description: nls.localize('anythingQuickAccess', "Go to File"),
                commandId: 'workbench.action.quickOpen',
                commandCenterOrder: 10
            }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: symbolsQuickAccess_1.SymbolsQuickAccessProvider,
        prefix: symbolsQuickAccess_1.SymbolsQuickAccessProvider.PREFIX,
        placeholder: nls.localize('symbolsQuickAccessPlaceholder', "Type the name of a symbol to open."),
        contextKey: 'inWorkspaceSymbolsPicker',
        helpEntries: [{ description: nls.localize('symbolsQuickAccess', "Go to Symbol in Workspace"), commandId: Constants.ShowAllSymbolsActionId }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: textSearchQuickAccess_1.TextSearchQuickAccess,
        prefix: textSearchQuickAccess_1.TEXT_SEARCH_QUICK_ACCESS_PREFIX,
        contextKey: 'inTextSearchPicker',
        placeholder: nls.localize('textSearchPickerPlaceholder', "Search for text in your workspace files (experimental)."),
        helpEntries: [
            {
                description: nls.localize('textSearchPickerHelp', "Search for Text (Experimental)"),
                commandId: Constants.QuickTextSearchActionId,
                commandCenterOrder: 65,
            }
        ]
    });
    // Configuration
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'search',
        order: 13,
        title: nls.localize('searchConfigurationTitle', "Search"),
        type: 'object',
        properties: {
            [search_1.SEARCH_EXCLUDE_CONFIG]: {
                type: 'object',
                markdownDescription: nls.localize('exclude', "Configure [glob patterns](https://code.visualstudio.com/docs/editor/codebasics#_advanced-search-options) for excluding files and folders in fulltext searches and quick open. Inherits all glob patterns from the `#files.exclude#` setting."),
                default: { '**/node_modules': true, '**/bower_components': true, '**/*.code-search': true },
                additionalProperties: {
                    anyOf: [
                        {
                            type: 'boolean',
                            description: nls.localize('exclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
                        },
                        {
                            type: 'object',
                            properties: {
                                when: {
                                    type: 'string',
                                    pattern: '\\w*\\$\\(basename\\)\\w*',
                                    default: '$(basename).ext',
                                    markdownDescription: nls.localize({ key: 'exclude.when', comment: ['\\$(basename) should not be translated'] }, 'Additional check on the siblings of a matching file. Use \\$(basename) as variable for the matching file name.')
                                }
                            }
                        }
                    ]
                },
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            [SEARCH_MODE_CONFIG]: {
                type: 'string',
                enum: ['view', 'reuseEditor', 'newEditor'],
                default: 'view',
                markdownDescription: nls.localize('search.mode', "Controls where new `Search: Find in Files` and `Find in Folder` operations occur: either in the search view, or in a search editor."),
                enumDescriptions: [
                    nls.localize('search.mode.view', "Search in the search view, either in the panel or side bars."),
                    nls.localize('search.mode.reuseEditor', "Search in an existing search editor if present, otherwise in a new search editor."),
                    nls.localize('search.mode.newEditor', "Search in a new search editor."),
                ]
            },
            'search.useRipgrep': {
                type: 'boolean',
                description: nls.localize('useRipgrep', "This setting is deprecated and now falls back on \"search.usePCRE2\"."),
                deprecationMessage: nls.localize('useRipgrepDeprecated', "Deprecated. Consider \"search.usePCRE2\" for advanced regex feature support."),
                default: true
            },
            'search.maintainFileSearchCache': {
                type: 'boolean',
                deprecationMessage: nls.localize('maintainFileSearchCacheDeprecated', "The search cache is kept in the extension host which never shuts down, so this setting is no longer needed."),
                description: nls.localize('search.maintainFileSearchCache', "When enabled, the searchService process will be kept alive instead of being shut down after an hour of inactivity. This will keep the file search cache in memory."),
                default: false
            },
            'search.useIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize('useIgnoreFiles', "Controls whether to use `.gitignore` and `.ignore` files when searching for files."),
                default: true,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'search.useGlobalIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize('useGlobalIgnoreFiles', "Controls whether to use your global gitignore file (e.g., from `$HOME/.config/git/ignore`) when searching for files. Requires `#search.useIgnoreFiles#` to be enabled."),
                default: false,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'search.useParentIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize('useParentIgnoreFiles', "Controls whether to use `.gitignore` and `.ignore` files in parent directories when searching for files. Requires `#search.useIgnoreFiles#` to be enabled."),
                default: false,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'search.quickOpen.includeSymbols': {
                type: 'boolean',
                description: nls.localize('search.quickOpen.includeSymbols', "Whether to include results from a global symbol search in the file results for Quick Open."),
                default: false
            },
            'search.quickOpen.includeHistory': {
                type: 'boolean',
                description: nls.localize('search.quickOpen.includeHistory', "Whether to include results from recently opened files in the file results for Quick Open."),
                default: true
            },
            'search.quickOpen.history.filterSortOrder': {
                'type': 'string',
                'enum': ['default', 'recency'],
                'default': 'default',
                'enumDescriptions': [
                    nls.localize('filterSortOrder.default', 'History entries are sorted by relevance based on the filter value used. More relevant entries appear first.'),
                    nls.localize('filterSortOrder.recency', 'History entries are sorted by recency. More recently opened entries appear first.')
                ],
                'description': nls.localize('filterSortOrder', "Controls sorting order of editor history in quick open when filtering.")
            },
            'search.followSymlinks': {
                type: 'boolean',
                description: nls.localize('search.followSymlinks', "Controls whether to follow symlinks while searching."),
                default: true
            },
            'search.smartCase': {
                type: 'boolean',
                description: nls.localize('search.smartCase', "Search case-insensitively if the pattern is all lowercase, otherwise, search case-sensitively."),
                default: false
            },
            'search.globalFindClipboard': {
                type: 'boolean',
                default: false,
                description: nls.localize('search.globalFindClipboard', "Controls whether the search view should read or modify the shared find clipboard on macOS."),
                included: platform.isMacintosh
            },
            'search.location': {
                type: 'string',
                enum: ['sidebar', 'panel'],
                default: 'sidebar',
                description: nls.localize('search.location', "Controls whether the search will be shown as a view in the sidebar or as a panel in the panel area for more horizontal space."),
                deprecationMessage: nls.localize('search.location.deprecationMessage', "This setting is deprecated. You can drag the search icon to a new location instead.")
            },
            'search.maxResults': {
                type: ['number', 'null'],
                default: 20000,
                markdownDescription: nls.localize('search.maxResults', "Controls the maximum number of search results, this can be set to `null` (empty) to return unlimited results.")
            },
            'search.collapseResults': {
                type: 'string',
                enum: ['auto', 'alwaysCollapse', 'alwaysExpand'],
                enumDescriptions: [
                    nls.localize('search.collapseResults.auto', "Files with less than 10 results are expanded. Others are collapsed."),
                    '',
                    ''
                ],
                default: 'alwaysExpand',
                description: nls.localize('search.collapseAllResults', "Controls whether the search results will be collapsed or expanded."),
            },
            'search.useReplacePreview': {
                type: 'boolean',
                default: true,
                description: nls.localize('search.useReplacePreview', "Controls whether to open Replace Preview when selecting or replacing a match."),
            },
            'search.showLineNumbers': {
                type: 'boolean',
                default: false,
                description: nls.localize('search.showLineNumbers', "Controls whether to show line numbers for search results."),
            },
            'search.usePCRE2': {
                type: 'boolean',
                default: false,
                description: nls.localize('search.usePCRE2', "Whether to use the PCRE2 regex engine in text search. This enables using some advanced regex features like lookahead and backreferences. However, not all PCRE2 features are supported - only features that are also supported by JavaScript."),
                deprecationMessage: nls.localize('usePCRE2Deprecated', "Deprecated. PCRE2 will be used automatically when using regex features that are only supported by PCRE2."),
            },
            'search.actionsPosition': {
                type: 'string',
                enum: ['auto', 'right'],
                enumDescriptions: [
                    nls.localize('search.actionsPositionAuto', "Position the actionbar to the right when the search view is narrow, and immediately after the content when the search view is wide."),
                    nls.localize('search.actionsPositionRight', "Always position the actionbar to the right."),
                ],
                default: 'right',
                description: nls.localize('search.actionsPosition', "Controls the positioning of the actionbar on rows in the search view.")
            },
            'search.searchOnType': {
                type: 'boolean',
                default: true,
                description: nls.localize('search.searchOnType', "Search all files as you type.")
            },
            'search.seedWithNearestWord': {
                type: 'boolean',
                default: false,
                description: nls.localize('search.seedWithNearestWord', "Enable seeding search from the word nearest the cursor when the active editor has no selection.")
            },
            'search.seedOnFocus': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize('search.seedOnFocus', "Update the search query to the editor's selected text when focusing the search view. This happens either on click or when triggering the `workbench.views.search.focus` command.")
            },
            'search.searchOnTypeDebouncePeriod': {
                type: 'number',
                default: 300,
                markdownDescription: nls.localize('search.searchOnTypeDebouncePeriod', "When {0} is enabled, controls the timeout in milliseconds between a character being typed and the search starting. Has no effect when {0} is disabled.", '`#search.searchOnType#`')
            },
            'search.searchEditor.doubleClickBehaviour': {
                type: 'string',
                enum: ['selectWord', 'goToLocation', 'openLocationToSide'],
                default: 'goToLocation',
                enumDescriptions: [
                    nls.localize('search.searchEditor.doubleClickBehaviour.selectWord', "Double-clicking selects the word under the cursor."),
                    nls.localize('search.searchEditor.doubleClickBehaviour.goToLocation', "Double-clicking opens the result in the active editor group."),
                    nls.localize('search.searchEditor.doubleClickBehaviour.openLocationToSide', "Double-clicking opens the result in the editor group to the side, creating one if it does not yet exist."),
                ],
                markdownDescription: nls.localize('search.searchEditor.doubleClickBehaviour', "Configure effect of double-clicking a result in a search editor.")
            },
            'search.searchEditor.reusePriorSearchConfiguration': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize({ key: 'search.searchEditor.reusePriorSearchConfiguration', comment: ['"Search Editor" is a type of editor that can display search results. "includes, excludes, and flags" refers to the "files to include" and "files to exclude" input boxes, and the flags that control whether a query is case-sensitive or a regex.'] }, "When enabled, new Search Editors will reuse the includes, excludes, and flags of the previously opened Search Editor.")
            },
            'search.searchEditor.defaultNumberOfContextLines': {
                type: ['number', 'null'],
                default: 1,
                markdownDescription: nls.localize('search.searchEditor.defaultNumberOfContextLines', "The default number of surrounding context lines to use when creating new Search Editors. If using `#search.searchEditor.reusePriorSearchConfiguration#`, this can be set to `null` (empty) to use the prior Search Editor's configuration.")
            },
            'search.sortOrder': {
                'type': 'string',
                'enum': ["default" /* SearchSortOrder.Default */, "fileNames" /* SearchSortOrder.FileNames */, "type" /* SearchSortOrder.Type */, "modified" /* SearchSortOrder.Modified */, "countDescending" /* SearchSortOrder.CountDescending */, "countAscending" /* SearchSortOrder.CountAscending */],
                'default': "default" /* SearchSortOrder.Default */,
                'enumDescriptions': [
                    nls.localize('searchSortOrder.default', "Results are sorted by folder and file names, in alphabetical order."),
                    nls.localize('searchSortOrder.filesOnly', "Results are sorted by file names ignoring folder order, in alphabetical order."),
                    nls.localize('searchSortOrder.type', "Results are sorted by file extensions, in alphabetical order."),
                    nls.localize('searchSortOrder.modified', "Results are sorted by file last modified date, in descending order."),
                    nls.localize('searchSortOrder.countDescending', "Results are sorted by count per file, in descending order."),
                    nls.localize('searchSortOrder.countAscending', "Results are sorted by count per file, in ascending order.")
                ],
                'description': nls.localize('search.sortOrder', "Controls sorting order of search results.")
            },
            'search.decorations.colors': {
                type: 'boolean',
                description: nls.localize('search.decorations.colors', "Controls whether search file decorations should use colors."),
                default: true
            },
            'search.decorations.badges': {
                type: 'boolean',
                description: nls.localize('search.decorations.badges', "Controls whether search file decorations should use badges."),
                default: true
            },
            'search.defaultViewMode': {
                'type': 'string',
                'enum': ["tree" /* ViewMode.Tree */, "list" /* ViewMode.List */],
                'default': "list" /* ViewMode.List */,
                'enumDescriptions': [
                    nls.localize('scm.defaultViewMode.tree', "Shows search results as a tree."),
                    nls.localize('scm.defaultViewMode.list', "Shows search results as a list.")
                ],
                'description': nls.localize('search.defaultViewMode', "Controls the default search result view mode.")
            },
            'search.experimental.closedNotebookRichContentResults': {
                type: 'boolean',
                description: nls.localize('search.experimental.closedNotebookResults', "Show notebook editor rich content results for closed notebooks. Please refresh your search results after changing this setting."),
                default: false
            },
            'search.experimental.quickAccess.preserveInput': {
                'type': 'boolean',
                'description': nls.localize('search.experimental.quickAccess.preserveInput', "Controls whether the last typed input to Quick Search should be restored when opening it the next time."),
                'default': false
            },
        }
    });
    commands_1.CommandsRegistry.registerCommand('_executeWorkspaceSymbolProvider', async function (accessor, ...args) {
        const [query] = args;
        (0, types_1.assertType)(typeof query === 'string');
        const result = await (0, search_2.getWorkspaceSymbols)(query);
        return result.map(item => item.symbol);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUE0Q2hHLElBQUEsOEJBQWlCLEVBQUMsOENBQWdDLEVBQUUsNkNBQStCLG9DQUE0QixDQUFDO0lBQ2hILElBQUEsOEJBQWlCLEVBQUMsNENBQXFCLEVBQUUsMkNBQW9CLG9DQUE0QixDQUFDO0lBRTFGLElBQUEsNENBQW9CLEdBQUUsQ0FBQztJQUN2QixJQUFBLG1EQUEyQixHQUFFLENBQUM7SUFDOUIsSUFBQSxvQ0FBeUIsR0FBRSxDQUFDO0lBRTVCLE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDO0lBRXpDLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUEwQixrQkFBYyxDQUFDLHNCQUFzQixDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDdkgsRUFBRSxFQUFFLG1CQUFVO1FBQ2QsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7UUFDcEUsY0FBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyxxQ0FBaUIsRUFBRSxDQUFDLG1CQUFVLEVBQUUsRUFBRSxvQ0FBb0MsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ25ILFdBQVcsRUFBRSxJQUFJO1FBQ2pCLElBQUksRUFBRSw0QkFBYztRQUNwQixLQUFLLEVBQUUsQ0FBQztLQUNSLHlDQUFpQyxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFFdEUsTUFBTSxjQUFjLEdBQW9CO1FBQ3ZDLEVBQUUsRUFBRSxnQkFBTztRQUNYLGFB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