define(["require", "exports", "vs/base/common/resources", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/contrib/files/browser/files", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/files/common/files", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/errors", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/base/common/network"], function (require, exports, resources_1, nls, commands_1, configuration_1, listService_1, views_1, Constants, SearchEditorConstants, searchModel_1, editorService_1, contextkey_1, actions_1, queryBuilder_1, files_1, files_2, workspace_1, files_3, panecomposite_1, errors_1, searchActionsBase_1, configurationResolver_1, history_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findInFilesCommand = void 0;
    //#endregion
    (0, actions_1.registerAction2)(class RestrictSearchToFolderAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.RestrictSearchToFolderId,
                title: {
                    value: nls.localize('restrictResultsToFolder', "Restrict Search to Folder"),
                    original: 'Restrict Search to Folder'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ResourceFolderFocusKey),
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                },
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        group: 'search',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ResourceFolderFocusKey)
                    }
                ]
            });
        }
        async run(accessor, folderMatch) {
            await searchWithFolderCommand(accessor, false, true, undefined, folderMatch);
        }
    });
    (0, actions_1.registerAction2)(class ExcludeFolderFromSearchAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ExcludeFolderFromSearchId,
                title: {
                    value: nls.localize('excludeFolderFromSearch', "Exclude Folder from Search"),
                    original: 'Exclude Folder from Search'
                },
                category: searchActionsBase_1.category,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        group: 'search',
                        order: 4,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ResourceFolderFocusKey)
                    }
                ]
            });
        }
        async run(accessor, folderMatch) {
            await searchWithFolderCommand(accessor, false, false, undefined, folderMatch);
        }
    });
    (0, actions_1.registerAction2)(class RevealInSideBarForSearchResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.RevealInSideBarForSearchResults,
                title: {
                    value: nls.localize('revealInSideBar', "Reveal in Explorer View"),
                    original: 'Reveal in Explorer View'
                },
                category: searchActionsBase_1.category,
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.FileFocusKey, Constants.HasSearchResults),
                        group: 'search_3',
                        order: 1
                    }]
            });
        }
        async run(accessor, args) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const explorerService = accessor.get(files_1.IExplorerService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (!searchView) {
                return;
            }
            let fileMatch;
            if (!(args instanceof searchModel_1.FileMatch)) {
                args = searchView.getControl().getFocus()[0];
            }
            if (args instanceof searchModel_1.FileMatch) {
                fileMatch = args;
            }
            else {
                return;
            }
            paneCompositeService.openPaneComposite(files_3.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, false).then((viewlet) => {
                if (!viewlet) {
                    return;
                }
                const explorerViewContainer = viewlet.getViewPaneContainer();
                const uri = fileMatch.resource;
                if (uri && contextService.isInsideWorkspace(uri)) {
                    const explorerView = explorerViewContainer.getExplorerView();
                    explorerView.setExpanded(true);
                    explorerService.select(uri, true).then(() => explorerView.focus(), errors_1.onUnexpectedError);
                }
            });
        }
    });
    // Find in Files by default is the same as View: Show Search, but can be configured to open a search editor instead with the `search.mode` binding
    (0, actions_1.registerAction2)(class FindInFilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FindInFilesActionId,
                title: {
                    value: nls.localize('findInFiles', "Find in Files"),
                    mnemonicTitle: nls.localize({ key: 'miFindInFiles', comment: ['&& denotes a mnemonic'] }, "Find &&in Files"),
                    original: 'Find in Files'
                },
                description: {
                    description: nls.localize('findInFiles.description', "Open a workspace search"),
                    args: [
                        {
                            name: nls.localize('findInFiles.args', "A set of options for the search"),
                            schema: {
                                type: 'object',
                                properties: {
                                    query: { 'type': 'string' },
                                    replace: { 'type': 'string' },
                                    preserveCase: { 'type': 'boolean' },
                                    triggerSearch: { 'type': 'boolean' },
                                    filesToInclude: { 'type': 'string' },
                                    filesToExclude: { 'type': 'string' },
                                    isRegex: { 'type': 'boolean' },
                                    isCaseSensitive: { 'type': 'boolean' },
                                    matchWholeWord: { 'type': 'boolean' },
                                    useExcludeSettingsAndIgnoreFiles: { 'type': 'boolean' },
                                    onlyOpenEditors: { 'type': 'boolean' },
                                }
                            }
                        },
                    ]
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                },
                menu: [{
                        id: actions_1.MenuId.MenubarEditMenu,
                        group: '4_find_global',
                        order: 1,
                    }],
                f1: true
            });
        }
        async run(accessor, args = {}) {
            findInFilesCommand(accessor, args);
        }
    });
    (0, actions_1.registerAction2)(class FindInFolderAction extends actions_1.Action2 {
        // from explorer
        constructor() {
            super({
                id: Constants.FindInFolderId,
                title: {
                    value: nls.localize('findInFolder', "Find in Folder..."),
                    original: 'Find in Folder...'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(files_3.FilesExplorerFocusCondition, files_3.ExplorerFolderContext),
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                },
                menu: [
                    {
                        id: actions_1.MenuId.ExplorerContext,
                        group: '4_search',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.and(files_3.ExplorerFolderContext)
                    }
                ]
            });
        }
        async run(accessor, resource) {
            await searchWithFolderCommand(accessor, true, true, resource);
        }
    });
    (0, actions_1.registerAction2)(class FindInWorkspaceAction extends actions_1.Action2 {
        // from explorer
        constructor() {
            super({
                id: Constants.FindInWorkspaceId,
                title: {
                    value: nls.localize('findInWorkspace', "Find in Workspace..."),
                    original: 'Find in Workspace...'
                },
                category: searchActionsBase_1.category,
                menu: [
                    {
                        id: actions_1.MenuId.ExplorerContext,
                        group: '4_search',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.and(files_3.ExplorerRootContext, files_3.ExplorerFolderContext.toNegated())
                    }
                ]
            });
        }
        async run(accessor) {
            const searchConfig = accessor.get(configuration_1.IConfigurationService).getValue().search;
            const mode = searchConfig.mode;
            if (mode === 'view') {
                const searchView = await (0, searchActionsBase_1.openSearchView)(accessor.get(views_1.IViewsService), true);
                searchView?.searchInFolders();
            }
            else {
                return accessor.get(commands_1.ICommandService).executeCommand(SearchEditorConstants.OpenEditorCommandId, {
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                    filesToInclude: '',
                });
            }
        }
    });
    //#region Helpers
    async function searchWithFolderCommand(accessor, isFromExplorer, isIncludes, resource, folderMatch) {
        const listService = accessor.get(listService_1.IListService);
        const fileService = accessor.get(files_2.IFileService);
        const viewsService = accessor.get(views_1.IViewsService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const commandService = accessor.get(commands_1.ICommandService);
        const searchConfig = accessor.get(configuration_1.IConfigurationService).getValue().search;
        const mode = searchConfig.mode;
        let resources;
        if (isFromExplorer) {
            resources = (0, files_1.getMultiSelectedResources)(resource, listService, accessor.get(editorService_1.IEditorService), accessor.get(files_1.IExplorerService));
        }
        else {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (!searchView) {
                return;
            }
            resources = getMultiSelectedSearchResources(searchView.getControl(), folderMatch, searchConfig);
        }
        const resolvedResources = fileService.resolveAll(resources.map(resource => ({ resource }))).then(results => {
            const folders = [];
            results.forEach(result => {
                if (result.success && result.stat) {
                    folders.push(result.stat.isDirectory ? result.stat.resource : (0, resources_1.dirname)(result.stat.resource));
                }
            });
            return (0, queryBuilder_1.resolveResourcesForSearchIncludes)(folders, contextService);
        });
        if (mode === 'view') {
            const searchView = await (0, searchActionsBase_1.openSearchView)(viewsService, true);
            if (resources && resources.length && searchView) {
                if (isIncludes) {
                    searchView.searchInFolders(await resolvedResources);
                }
                else {
                    searchView.searchOutsideOfFolders(await resolvedResources);
                }
            }
            return undefined;
        }
        else {
            if (isIncludes) {
                return commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, {
                    filesToInclude: (await resolvedResources).join(', '),
                    showIncludesExcludes: true,
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                });
            }
            else {
                return commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, {
                    filesToExclude: (await resolvedResources).join(', '),
                    showIncludesExcludes: true,
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                });
            }
        }
    }
    function getMultiSelectedSearchResources(viewer, currElement, sortConfig) {
        return (0, searchActionsBase_1.getElementsToOperateOn)(viewer, currElement, sortConfig)
            .map((renderableMatch) => ((renderableMatch instanceof searchModel_1.Match) ? null : renderableMatch.resource))
            .filter((renderableMatch) => (renderableMatch !== null));
    }
    async function findInFilesCommand(accessor, _args = {}) {
        const searchConfig = accessor.get(configuration_1.IConfigurationService).getValue().search;
        const viewsService = accessor.get(views_1.IViewsService);
        const commandService = accessor.get(commands_1.ICommandService);
        const args = {};
        if (Object.keys(_args).length !== 0) {
            // resolve variables in the same way as in
            // https://github.com/microsoft/vscode/blob/8b76efe9d317d50cb5b57a7658e09ce6ebffaf36/src/vs/workbench/contrib/searchEditor/browser/searchEditorActions.ts#L152-L158
            const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
            const historyService = accessor.get(history_1.IHistoryService);
            const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot();
            const filteredActiveWorkspaceRootUri = activeWorkspaceRootUri?.scheme === network_1.Schemas.file || activeWorkspaceRootUri?.scheme === network_1.Schemas.vscodeRemote ? activeWorkspaceRootUri : undefined;
            const lastActiveWorkspaceRoot = filteredActiveWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(filteredActiveWorkspaceRootUri) ?? undefined : undefined;
            for (const entry of Object.entries(_args)) {
                const name = entry[0];
                const value = entry[1];
                if (value !== undefined) {
                    args[name] = (typeof value === 'string') ? await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, value) : value;
                }
            }
        }
        const mode = searchConfig.mode;
        if (mode === 'view') {
            (0, searchActionsBase_1.openSearchView)(viewsService, false).then(openedView => {
                if (openedView) {
                    const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
                    searchAndReplaceWidget.toggleReplace(typeof args.replace === 'string');
                    let updatedText = false;
                    if (typeof args.query !== 'string') {
                        updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: typeof args.replace !== 'string' });
                    }
                    openedView.setSearchParameters(args);
                    openedView.searchAndReplaceWidget.focus(undefined, updatedText, updatedText);
                }
            });
        }
        else {
            const convertArgs = (args) => ({
                location: mode === 'newEditor' ? 'new' : 'reuse',
                query: args.query,
                filesToInclude: args.filesToInclude,
                filesToExclude: args.filesToExclude,
                matchWholeWord: args.matchWholeWord,
                isCaseSensitive: args.isCaseSensitive,
                isRegexp: args.isRegex,
                useExcludeSettingsAndIgnoreFiles: args.useExcludeSettingsAndIgnoreFiles,
                onlyOpenEditors: args.onlyOpenEditors,
                showIncludesExcludes: !!(args.filesToExclude || args.filesToExclude || !args.useExcludeSettingsAndIgnoreFiles),
            });
            commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, convertArgs(args));
        }
    }
    exports.findInFilesCommand = findInFilesCommand;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc0ZpbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hBY3Rpb25zRmluZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBa0RBLFlBQVk7SUFFWixJQUFBLHlCQUFlLEVBQUMsTUFBTSw0QkFBNkIsU0FBUSxpQkFBTztRQUNqRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsU0FBUyxDQUFDLHdCQUF3QjtnQkFDdEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLDJCQUEyQixDQUFDO29CQUMzRSxRQUFRLEVBQUUsMkJBQTJCO2lCQUNyQztnQkFDRCxRQUFRLEVBQVIsNEJBQVE7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQztvQkFDMUYsT0FBTyxFQUFFLDhDQUF5Qix3QkFBZTtpQkFDakQ7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMO3dCQUNDLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLEtBQUssRUFBRSxRQUFRO3dCQUNmLEtBQUssRUFBRSxDQUFDO3dCQUNSLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUM7cUJBQzFEO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxXQUFxQztZQUMxRSxNQUFNLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RSxD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