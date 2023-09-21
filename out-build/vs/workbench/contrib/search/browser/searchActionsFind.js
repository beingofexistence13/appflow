define(["require", "exports", "vs/base/common/resources", "vs/nls!vs/workbench/contrib/search/browser/searchActionsFind", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/contrib/files/browser/files", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/files/common/files", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/errors", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/base/common/network"], function (require, exports, resources_1, nls, commands_1, configuration_1, listService_1, views_1, Constants, SearchEditorConstants, searchModel_1, editorService_1, contextkey_1, actions_1, queryBuilder_1, files_1, files_2, workspace_1, files_3, panecomposite_1, errors_1, searchActionsBase_1, configurationResolver_1, history_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bPb = void 0;
    //#endregion
    (0, actions_1.$Xu)(class RestrictSearchToFolderAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$dOb,
                title: {
                    value: nls.localize(0, null),
                    original: 'Restrict Search to Folder'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$vOb),
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                },
                menu: [
                    {
                        id: actions_1.$Ru.SearchContext,
                        group: 'search',
                        order: 3,
                        when: contextkey_1.$Ii.and(Constants.$vOb)
                    }
                ]
            });
        }
        async run(accessor, folderMatch) {
            await searchWithFolderCommand(accessor, false, true, undefined, folderMatch);
        }
    });
    (0, actions_1.$Xu)(class ExcludeFolderFromSearchAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$aOb,
                title: {
                    value: nls.localize(1, null),
                    original: 'Exclude Folder from Search'
                },
                category: searchActionsBase_1.$vNb,
                menu: [
                    {
                        id: actions_1.$Ru.SearchContext,
                        group: 'search',
                        order: 4,
                        when: contextkey_1.$Ii.and(Constants.$vOb)
                    }
                ]
            });
        }
        async run(accessor, folderMatch) {
            await searchWithFolderCommand(accessor, false, false, undefined, folderMatch);
        }
    });
    (0, actions_1.$Xu)(class RevealInSideBarForSearchResultsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$XNb,
                title: {
                    value: nls.localize(2, null),
                    original: 'Reveal in Explorer View'
                },
                category: searchActionsBase_1.$vNb,
                menu: [{
                        id: actions_1.$Ru.SearchContext,
                        when: contextkey_1.$Ii.and(Constants.$tOb, Constants.$oOb),
                        group: 'search_3',
                        order: 1
                    }]
            });
        }
        async run(accessor, args) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const explorerService = accessor.get(files_1.$xHb);
            const contextService = accessor.get(workspace_1.$Kh);
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (!searchView) {
                return;
            }
            let fileMatch;
            if (!(args instanceof searchModel_1.$SMb)) {
                args = searchView.getControl().getFocus()[0];
            }
            if (args instanceof searchModel_1.$SMb) {
                fileMatch = args;
            }
            else {
                return;
            }
            paneCompositeService.openPaneComposite(files_3.$Mdb, 0 /* ViewContainerLocation.Sidebar */, false).then((viewlet) => {
                if (!viewlet) {
                    return;
                }
                const explorerViewContainer = viewlet.getViewPaneContainer();
                const uri = fileMatch.resource;
                if (uri && contextService.isInsideWorkspace(uri)) {
                    const explorerView = explorerViewContainer.getExplorerView();
                    explorerView.setExpanded(true);
                    explorerService.select(uri, true).then(() => explorerView.focus(), errors_1.$Y);
                }
            });
        }
    });
    // Find in Files by default is the same as View: Show Search, but can be configured to open a search editor instead with the `search.mode` binding
    (0, actions_1.$Xu)(class FindInFilesAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$CNb,
                title: {
                    value: nls.localize(3, null),
                    mnemonicTitle: nls.localize(4, null),
                    original: 'Find in Files'
                },
                description: {
                    description: nls.localize(5, null),
                    args: [
                        {
                            name: nls.localize(6, null),
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
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                },
                menu: [{
                        id: actions_1.$Ru.MenubarEditMenu,
                        group: '4_find_global',
                        order: 1,
                    }],
                f1: true
            });
        }
        async run(accessor, args = {}) {
            $bPb(accessor, args);
        }
    });
    (0, actions_1.$Xu)(class FindInFolderAction extends actions_1.$Wu {
        // from explorer
        constructor() {
            super({
                id: Constants.$eOb,
                title: {
                    value: nls.localize(7, null),
                    original: 'Find in Folder...'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(files_3.$5db, files_3.$Qdb),
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                },
                menu: [
                    {
                        id: actions_1.$Ru.ExplorerContext,
                        group: '4_search',
                        order: 10,
                        when: contextkey_1.$Ii.and(files_3.$Qdb)
                    }
                ]
            });
        }
        async run(accessor, resource) {
            await searchWithFolderCommand(accessor, true, true, resource);
        }
    });
    (0, actions_1.$Xu)(class FindInWorkspaceAction extends actions_1.$Wu {
        // from explorer
        constructor() {
            super({
                id: Constants.$fOb,
                title: {
                    value: nls.localize(8, null),
                    original: 'Find in Workspace...'
                },
                category: searchActionsBase_1.$vNb,
                menu: [
                    {
                        id: actions_1.$Ru.ExplorerContext,
                        group: '4_search',
                        order: 10,
                        when: contextkey_1.$Ii.and(files_3.$Udb, files_3.$Qdb.toNegated())
                    }
                ]
            });
        }
        async run(accessor) {
            const searchConfig = accessor.get(configuration_1.$8h).getValue().search;
            const mode = searchConfig.mode;
            if (mode === 'view') {
                const searchView = await (0, searchActionsBase_1.$BNb)(accessor.get(views_1.$$E), true);
                searchView?.searchInFolders();
            }
            else {
                return accessor.get(commands_1.$Fr).executeCommand(SearchEditorConstants.$JOb, {
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                    filesToInclude: '',
                });
            }
        }
    });
    //#region Helpers
    async function searchWithFolderCommand(accessor, isFromExplorer, isIncludes, resource, folderMatch) {
        const listService = accessor.get(listService_1.$03);
        const fileService = accessor.get(files_2.$6j);
        const viewsService = accessor.get(views_1.$$E);
        const contextService = accessor.get(workspace_1.$Kh);
        const commandService = accessor.get(commands_1.$Fr);
        const searchConfig = accessor.get(configuration_1.$8h).getValue().search;
        const mode = searchConfig.mode;
        let resources;
        if (isFromExplorer) {
            resources = (0, files_1.$zHb)(resource, listService, accessor.get(editorService_1.$9C), accessor.get(files_1.$xHb));
        }
        else {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (!searchView) {
                return;
            }
            resources = getMultiSelectedSearchResources(searchView.getControl(), folderMatch, searchConfig);
        }
        const resolvedResources = fileService.resolveAll(resources.map(resource => ({ resource }))).then(results => {
            const folders = [];
            results.forEach(result => {
                if (result.success && result.stat) {
                    folders.push(result.stat.isDirectory ? result.stat.resource : (0, resources_1.$hg)(result.stat.resource));
                }
            });
            return (0, queryBuilder_1.$BJ)(folders, contextService);
        });
        if (mode === 'view') {
            const searchView = await (0, searchActionsBase_1.$BNb)(viewsService, true);
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
                return commandService.executeCommand(SearchEditorConstants.$JOb, {
                    filesToInclude: (await resolvedResources).join(', '),
                    showIncludesExcludes: true,
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                });
            }
            else {
                return commandService.executeCommand(SearchEditorConstants.$JOb, {
                    filesToExclude: (await resolvedResources).join(', '),
                    showIncludesExcludes: true,
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                });
            }
        }
    }
    function getMultiSelectedSearchResources(viewer, currElement, sortConfig) {
        return (0, searchActionsBase_1.$zNb)(viewer, currElement, sortConfig)
            .map((renderableMatch) => ((renderableMatch instanceof searchModel_1.$PMb) ? null : renderableMatch.resource))
            .filter((renderableMatch) => (renderableMatch !== null));
    }
    async function $bPb(accessor, _args = {}) {
        const searchConfig = accessor.get(configuration_1.$8h).getValue().search;
        const viewsService = accessor.get(views_1.$$E);
        const commandService = accessor.get(commands_1.$Fr);
        const args = {};
        if (Object.keys(_args).length !== 0) {
            // resolve variables in the same way as in
            // https://github.com/microsoft/vscode/blob/8b76efe9d317d50cb5b57a7658e09ce6ebffaf36/src/vs/workbench/contrib/searchEditor/browser/searchEditorActions.ts#L152-L158
            const configurationResolverService = accessor.get(configurationResolver_1.$NM);
            const historyService = accessor.get(history_1.$SM);
            const workspaceContextService = accessor.get(workspace_1.$Kh);
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
            (0, searchActionsBase_1.$BNb)(viewsService, false).then(openedView => {
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
            commandService.executeCommand(SearchEditorConstants.$JOb, convertArgs(args));
        }
    }
    exports.$bPb = $bPb;
});
//#endregion
//# sourceMappingURL=searchActionsFind.js.map