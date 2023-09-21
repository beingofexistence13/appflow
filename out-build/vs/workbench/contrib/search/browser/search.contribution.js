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
define(["require", "exports", "vs/base/common/platform", "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess", "vs/nls!vs/workbench/contrib/search/browser/search.contribution", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/browser/quickaccess", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/workbench/contrib/search/browser/anythingQuickAccess", "vs/workbench/contrib/search/browser/replaceContributions", "vs/workbench/contrib/search/browser/notebookSearchContributions", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchView", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search", "vs/workbench/common/configuration", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess", "vs/workbench/contrib/search/browser/searchActionsCopy", "vs/workbench/contrib/search/browser/searchActionsFind", "vs/workbench/contrib/search/browser/searchActionsNav", "vs/workbench/contrib/search/browser/searchActionsRemoveReplace", "vs/workbench/contrib/search/browser/searchActionsSymbol", "vs/workbench/contrib/search/browser/searchActionsTopBar", "vs/workbench/contrib/search/browser/searchActionsTextQuickAccess"], function (require, exports, platform, gotoLineQuickAccess_1, nls, configuration_1, configurationRegistry_1, contextkey_1, descriptors_1, extensions_1, quickAccess_1, platform_1, viewPaneContainer_1, quickaccess_1, contributions_1, views_1, gotoSymbolQuickAccess_1, anythingQuickAccess_1, replaceContributions_1, notebookSearchContributions_1, searchIcons_1, searchView_1, searchWidget_1, symbolsQuickAccess_1, searchHistoryService_1, searchModel_1, search_1, configuration_2, commands_1, types_1, search_2, Constants, textSearchQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(searchModel_1.$4Mb, searchModel_1.$3Mb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(searchHistoryService_1.$jPb, searchHistoryService_1.$kPb, 1 /* InstantiationType.Delayed */);
    (0, replaceContributions_1.$$Mb)();
    (0, notebookSearchContributions_1.$aNb)();
    (0, searchWidget_1.$OOb)();
    const SEARCH_MODE_CONFIG = 'search.mode';
    const viewContainer = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: search_1.$jI,
        title: { value: nls.localize(0, null), original: 'Search' },
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [search_1.$jI, { mergeViewWithContainerWhenSingleView: true }]),
        hideIfEmpty: true,
        icon: searchIcons_1.$pNb,
        order: 1,
    }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
    const viewDescriptor = {
        id: search_1.$lI,
        containerIcon: searchIcons_1.$pNb,
        name: nls.localize(1, null),
        ctorDescriptor: new descriptors_1.$yh(searchView_1.$lPb),
        canToggleVisibility: false,
        canMoveView: true,
        openCommandActionDescriptor: {
            id: viewContainer.id,
            mnemonicTitle: nls.localize(2, null),
            keybindings: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                // Yes, this is weird. See #116188, #115556, #115511, and now #124146, for examples of what can go wrong here.
                when: contextkey_1.$Ii.regex('neverMatch', /doesNotMatch/)
            },
            order: 1
        }
    };
    // Register search default location to sidebar
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([viewDescriptor], viewContainer);
    // Migrate search location setting to new model
    let RegisterSearchViewContribution = class RegisterSearchViewContribution {
        constructor(configurationService, viewDescriptorService) {
            const data = configurationService.inspect('search.location');
            if (data.value === 'panel') {
                viewDescriptorService.moveViewToLocation(viewDescriptor, 1 /* ViewContainerLocation.Panel */);
            }
            platform_1.$8m.as(configuration_2.$az.ConfigurationMigration)
                .registerConfigurationMigrations([{ key: 'search.location', migrateFn: (value) => ({ value: undefined }) }]);
        }
    };
    RegisterSearchViewContribution = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, views_1.$_E)
    ], RegisterSearchViewContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(RegisterSearchViewContribution, 1 /* LifecyclePhase.Starting */);
    // Register Quick Access Handler
    const quickAccessRegistry = platform_1.$8m.as(quickAccess_1.$8p.Quickaccess);
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: anythingQuickAccess_1.$EMb,
        prefix: anythingQuickAccess_1.$EMb.PREFIX,
        placeholder: nls.localize(3, null, gotoLineQuickAccess_1.$zMb.PREFIX, gotoSymbolQuickAccess_1.$BMb.PREFIX),
        contextKey: quickaccess_1.$Wtb,
        helpEntries: [{
                description: nls.localize(4, null),
                commandId: 'workbench.action.quickOpen',
                commandCenterOrder: 10
            }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: symbolsQuickAccess_1.$DMb,
        prefix: symbolsQuickAccess_1.$DMb.PREFIX,
        placeholder: nls.localize(5, null),
        contextKey: 'inWorkspaceSymbolsPicker',
        helpEntries: [{ description: nls.localize(6, null), commandId: Constants.$ZNb }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: textSearchQuickAccess_1.$qPb,
        prefix: textSearchQuickAccess_1.$pPb,
        contextKey: 'inTextSearchPicker',
        placeholder: nls.localize(7, null),
        helpEntries: [
            {
                description: nls.localize(8, null),
                commandId: Constants.$1Nb,
                commandCenterOrder: 65,
            }
        ]
    });
    // Configuration
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'search',
        order: 13,
        title: nls.localize(9, null),
        type: 'object',
        properties: {
            [search_1.$nI]: {
                type: 'object',
                markdownDescription: nls.localize(10, null),
                default: { '**/node_modules': true, '**/bower_components': true, '**/*.code-search': true },
                additionalProperties: {
                    anyOf: [
                        {
                            type: 'boolean',
                            description: nls.localize(11, null),
                        },
                        {
                            type: 'object',
                            properties: {
                                when: {
                                    type: 'string',
                                    pattern: '\\w*\\$\\(basename\\)\\w*',
                                    default: '$(basename).ext',
                                    markdownDescription: nls.localize(12, null)
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
                markdownDescription: nls.localize(13, null),
                enumDescriptions: [
                    nls.localize(14, null),
                    nls.localize(15, null),
                    nls.localize(16, null),
                ]
            },
            'search.useRipgrep': {
                type: 'boolean',
                description: nls.localize(17, null),
                deprecationMessage: nls.localize(18, null),
                default: true
            },
            'search.maintainFileSearchCache': {
                type: 'boolean',
                deprecationMessage: nls.localize(19, null),
                description: nls.localize(20, null),
                default: false
            },
            'search.useIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize(21, null),
                default: true,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'search.useGlobalIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize(22, null),
                default: false,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'search.useParentIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize(23, null),
                default: false,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'search.quickOpen.includeSymbols': {
                type: 'boolean',
                description: nls.localize(24, null),
                default: false
            },
            'search.quickOpen.includeHistory': {
                type: 'boolean',
                description: nls.localize(25, null),
                default: true
            },
            'search.quickOpen.history.filterSortOrder': {
                'type': 'string',
                'enum': ['default', 'recency'],
                'default': 'default',
                'enumDescriptions': [
                    nls.localize(26, null),
                    nls.localize(27, null)
                ],
                'description': nls.localize(28, null)
            },
            'search.followSymlinks': {
                type: 'boolean',
                description: nls.localize(29, null),
                default: true
            },
            'search.smartCase': {
                type: 'boolean',
                description: nls.localize(30, null),
                default: false
            },
            'search.globalFindClipboard': {
                type: 'boolean',
                default: false,
                description: nls.localize(31, null),
                included: platform.$j
            },
            'search.location': {
                type: 'string',
                enum: ['sidebar', 'panel'],
                default: 'sidebar',
                description: nls.localize(32, null),
                deprecationMessage: nls.localize(33, null)
            },
            'search.maxResults': {
                type: ['number', 'null'],
                default: 20000,
                markdownDescription: nls.localize(34, null)
            },
            'search.collapseResults': {
                type: 'string',
                enum: ['auto', 'alwaysCollapse', 'alwaysExpand'],
                enumDescriptions: [
                    nls.localize(35, null),
                    '',
                    ''
                ],
                default: 'alwaysExpand',
                description: nls.localize(36, null),
            },
            'search.useReplacePreview': {
                type: 'boolean',
                default: true,
                description: nls.localize(37, null),
            },
            'search.showLineNumbers': {
                type: 'boolean',
                default: false,
                description: nls.localize(38, null),
            },
            'search.usePCRE2': {
                type: 'boolean',
                default: false,
                description: nls.localize(39, null),
                deprecationMessage: nls.localize(40, null),
            },
            'search.actionsPosition': {
                type: 'string',
                enum: ['auto', 'right'],
                enumDescriptions: [
                    nls.localize(41, null),
                    nls.localize(42, null),
                ],
                default: 'right',
                description: nls.localize(43, null)
            },
            'search.searchOnType': {
                type: 'boolean',
                default: true,
                description: nls.localize(44, null)
            },
            'search.seedWithNearestWord': {
                type: 'boolean',
                default: false,
                description: nls.localize(45, null)
            },
            'search.seedOnFocus': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize(46, null)
            },
            'search.searchOnTypeDebouncePeriod': {
                type: 'number',
                default: 300,
                markdownDescription: nls.localize(47, null, '`#search.searchOnType#`')
            },
            'search.searchEditor.doubleClickBehaviour': {
                type: 'string',
                enum: ['selectWord', 'goToLocation', 'openLocationToSide'],
                default: 'goToLocation',
                enumDescriptions: [
                    nls.localize(48, null),
                    nls.localize(49, null),
                    nls.localize(50, null),
                ],
                markdownDescription: nls.localize(51, null)
            },
            'search.searchEditor.reusePriorSearchConfiguration': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize(52, null)
            },
            'search.searchEditor.defaultNumberOfContextLines': {
                type: ['number', 'null'],
                default: 1,
                markdownDescription: nls.localize(53, null)
            },
            'search.sortOrder': {
                'type': 'string',
                'enum': ["default" /* SearchSortOrder.Default */, "fileNames" /* SearchSortOrder.FileNames */, "type" /* SearchSortOrder.Type */, "modified" /* SearchSortOrder.Modified */, "countDescending" /* SearchSortOrder.CountDescending */, "countAscending" /* SearchSortOrder.CountAscending */],
                'default': "default" /* SearchSortOrder.Default */,
                'enumDescriptions': [
                    nls.localize(54, null),
                    nls.localize(55, null),
                    nls.localize(56, null),
                    nls.localize(57, null),
                    nls.localize(58, null),
                    nls.localize(59, null)
                ],
                'description': nls.localize(60, null)
            },
            'search.decorations.colors': {
                type: 'boolean',
                description: nls.localize(61, null),
                default: true
            },
            'search.decorations.badges': {
                type: 'boolean',
                description: nls.localize(62, null),
                default: true
            },
            'search.defaultViewMode': {
                'type': 'string',
                'enum': ["tree" /* ViewMode.Tree */, "list" /* ViewMode.List */],
                'default': "list" /* ViewMode.List */,
                'enumDescriptions': [
                    nls.localize(63, null),
                    nls.localize(64, null)
                ],
                'description': nls.localize(65, null)
            },
            'search.experimental.closedNotebookRichContentResults': {
                type: 'boolean',
                description: nls.localize(66, null),
                default: false
            },
            'search.experimental.quickAccess.preserveInput': {
                'type': 'boolean',
                'description': nls.localize(67, null),
                'default': false
            },
        }
    });
    commands_1.$Gr.registerCommand('_executeWorkspaceSymbolProvider', async function (accessor, ...args) {
        const [query] = args;
        (0, types_1.$tf)(typeof query === 'string');
        const result = await (0, search_2.$LI)(query);
        return result.map(item => item.symbol);
    });
});
//# sourceMappingURL=search.contribution.js.map