/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/browser/searchActionsBase"], function (require, exports, nls, listService_1, views_1, searchIcons_1, Constants, searchHistoryService_1, searchModel_1, search_1, contextkey_1, actions_1, search_2, searchActionsBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions
    (0, actions_1.registerAction2)(class ClearSearchHistoryCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ClearSearchHistoryCommandId,
                title: {
                    value: nls.localize('clearSearchHistoryLabel', "Clear Search History"),
                    original: 'Clear Search History'
                },
                category: searchActionsBase_1.category,
                f1: true
            });
        }
        async run(accessor) {
            clearHistoryCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class CancelSearchAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CancelSearchActionId,
                title: {
                    value: nls.localize('CancelSearchAction.label', "Cancel Search"),
                    original: 'Cancel Search'
                },
                icon: searchIcons_1.searchStopIcon,
                category: searchActionsBase_1.category,
                f1: true,
                precondition: search_2.SearchStateKey.isEqualTo(search_2.SearchUIState.Idle).negate(),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, listService_1.WorkbenchListFocusContextKey),
                    primary: 9 /* KeyCode.Escape */,
                },
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), search_2.SearchStateKey.isEqualTo(search_2.SearchUIState.SlowSearch)),
                    }]
            });
        }
        run(accessor) {
            return cancelSearch(accessor);
        }
    });
    (0, actions_1.registerAction2)(class RefreshAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.RefreshSearchResultsActionId,
                title: {
                    value: nls.localize('RefreshAction.label', "Refresh"),
                    original: 'Refresh'
                },
                icon: searchIcons_1.searchRefreshIcon,
                precondition: Constants.ViewHasSearchPatternKey,
                category: searchActionsBase_1.category,
                f1: true,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), search_2.SearchStateKey.isEqualTo(search_2.SearchUIState.SlowSearch).negate()),
                    }]
            });
        }
        run(accessor, ...args) {
            return refreshSearch(accessor);
        }
    });
    (0, actions_1.registerAction2)(class CollapseDeepestExpandedLevelAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CollapseSearchResultsActionId,
                title: {
                    value: nls.localize('CollapseDeepestExpandedLevelAction.label', "Collapse All"),
                    original: 'Collapse All'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchCollapseAllIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults.negate(), Constants.ViewHasSomeCollapsibleKey)),
                    }]
            });
        }
        run(accessor, ...args) {
            return collapseDeepestExpandedLevel(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ExpandAllAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ExpandSearchResultsActionId,
                title: {
                    value: nls.localize('ExpandAllAction.label', "Expand All"),
                    original: 'Expand All'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchExpandAllIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey.toNegated()),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            return expandAll(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ClearSearchResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ClearSearchResultsActionId,
                title: {
                    value: nls.localize('ClearSearchResultsAction.label', "Clear Search Results"),
                    original: 'Clear Search Results'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchClearIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, Constants.ViewHasSearchPatternKey, Constants.ViewHasReplacePatternKey, Constants.ViewHasFilePatternKey),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 1,
                        when: contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID),
                    }]
            });
        }
        run(accessor, ...args) {
            return clearSearchResults(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ViewAsTreeAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ViewAsTreeActionId,
                title: {
                    value: nls.localize('ViewAsTreeAction.label', "View as Tree"),
                    original: 'View as Tree'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchShowAsList,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.InTreeViewKey.toNegated()),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), Constants.InTreeViewKey.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                searchView.setTreeView(true);
            }
        }
    });
    (0, actions_1.registerAction2)(class ViewAsListAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ViewAsListActionId,
                title: {
                    value: nls.localize('ViewAsListAction.label', "View as List"),
                    original: 'View as List'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchShowAsTree,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.InTreeViewKey),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), Constants.InTreeViewKey),
                    }]
            });
        }
        run(accessor, ...args) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                searchView.setTreeView(false);
            }
        }
    });
    //#endregion
    //#region Helpers
    const clearHistoryCommand = accessor => {
        const searchHistoryService = accessor.get(searchHistoryService_1.ISearchHistoryService);
        searchHistoryService.clearHistory();
    };
    function expandAll(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            const viewer = searchView.getControl();
            viewer.expandAll();
        }
    }
    function clearSearchResults(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        searchView?.clearSearchResults();
    }
    function cancelSearch(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        searchView?.cancelSearch();
    }
    function refreshSearch(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        searchView?.triggerQueryChange({ preserveFocus: false });
    }
    function collapseDeepestExpandedLevel(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            const viewer = searchView.getControl();
            /**
             * one level to collapse so collapse everything. If FolderMatch, check if there are visible grandchildren,
             * i.e. if Matches are returned by the navigator, and if so, collapse to them, otherwise collapse all levels.
             */
            const navigator = viewer.navigate();
            let node = navigator.first();
            let canCollapseFileMatchLevel = false;
            let canCollapseFirstLevel = false;
            if (node instanceof searchModel_1.FolderMatchWorkspaceRoot || searchView.isTreeLayoutViewVisible) {
                while (node = navigator.next()) {
                    if (node instanceof searchModel_1.Match) {
                        canCollapseFileMatchLevel = true;
                        break;
                    }
                    if (searchView.isTreeLayoutViewVisible && !canCollapseFirstLevel) {
                        let nodeToTest = node;
                        if (node instanceof searchModel_1.FolderMatch) {
                            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
                            // Match elements should never be compressed, so !(compressionStartNode instanceof Match) should always be true here
                            nodeToTest = (compressionStartNode && !(compressionStartNode instanceof searchModel_1.Match)) ? compressionStartNode : node;
                        }
                        const immediateParent = nodeToTest.parent();
                        if (!(immediateParent instanceof searchModel_1.FolderMatchWorkspaceRoot || immediateParent instanceof searchModel_1.FolderMatchNoRoot || immediateParent instanceof searchModel_1.SearchResult)) {
                            canCollapseFirstLevel = true;
                        }
                    }
                }
            }
            if (canCollapseFileMatchLevel) {
                node = navigator.first();
                do {
                    if (node instanceof searchModel_1.FileMatch) {
                        viewer.collapse(node);
                    }
                } while (node = navigator.next());
            }
            else if (canCollapseFirstLevel) {
                node = navigator.first();
                if (node) {
                    do {
                        let nodeToTest = node;
                        if (node instanceof searchModel_1.FolderMatch) {
                            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
                            // Match elements should never be compressed, so !(compressionStartNode instanceof Match) should always be true here
                            nodeToTest = (compressionStartNode && !(compressionStartNode instanceof searchModel_1.Match)) ? compressionStartNode : node;
                        }
                        const immediateParent = nodeToTest.parent();
                        if (immediateParent instanceof searchModel_1.FolderMatchWorkspaceRoot || immediateParent instanceof searchModel_1.FolderMatchNoRoot) {
                            if (viewer.hasElement(node)) {
                                viewer.collapse(node, true);
                            }
                            else {
                                viewer.collapseAll();
                            }
                        }
                    } while (node = navigator.next());
                }
            }
            else {
                viewer.collapseAll();
            }
            const firstFocusParent = viewer.getFocus()[0]?.parent();
            if (firstFocusParent && (firstFocusParent instanceof searchModel_1.FolderMatch || firstFocusParent instanceof searchModel_1.FileMatch) &&
                viewer.hasElement(firstFocusParent) && viewer.isCollapsed(firstFocusParent)) {
                viewer.domFocus();
                viewer.focusFirst();
                viewer.setSelection(viewer.getFocus());
            }
        }
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1RvcEJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaEFjdGlvbnNUb3BCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFtQmhHLGlCQUFpQjtJQUNqQixJQUFBLHlCQUFlLEVBQUMsTUFBTSwrQkFBZ0MsU0FBUSxpQkFBTztRQUVwRTtZQUVDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsU0FBUyxDQUFDLDJCQUEyQjtnQkFDekMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHNCQUFzQixDQUFDO29CQUN0RSxRQUFRLEVBQUUsc0JBQXNCO2lCQUNoQztnQkFDRCxRQUFRLEVBQVIsNEJBQVE7Z0JBQ1IsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFFSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sa0JBQW1CLFNBQVEsaUJBQU87UUFDdkQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLFNBQVMsQ0FBQyxvQkFBb0I7Z0JBQ2xDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxlQUFlLENBQUM7b0JBQ2hFLFFBQVEsRUFBRSxlQUFlO2lCQUN6QjtnQkFDRCxJQUFJLEVBQUUsNEJBQWM7Z0JBQ3BCLFFBQVEsRUFBUiw0QkFBUTtnQkFDUixFQUFFLEVBQUUsSUFBSTtnQkFDUixZQUFZLEVBQUUsdUJBQWMsQ0FBQyxTQUFTLENBQUMsc0JBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ25FLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSwwQ0FBNEIsQ0FBQztvQkFDdEYsT0FBTyx3QkFBZ0I7aUJBQ3ZCO2dCQUNELElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7d0JBQ3BCLEtBQUssRUFBRSxZQUFZO3dCQUNuQixLQUFLLEVBQUUsQ0FBQzt3QkFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGdCQUFPLENBQUMsRUFBRSx1QkFBYyxDQUFDLFNBQVMsQ0FBQyxzQkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUNwSCxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sYUFBYyxTQUFRLGlCQUFPO1FBQ2xEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsNEJBQTRCO2dCQUMxQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsU0FBUyxDQUFDO29CQUNyRCxRQUFRLEVBQUUsU0FBUztpQkFDbkI7Z0JBQ0QsSUFBSSxFQUFFLCtCQUFpQjtnQkFDdkIsWUFBWSxFQUFFLFNBQVMsQ0FBQyx1QkFBdUI7Z0JBQy9DLFFBQVEsRUFBUiw0QkFBUTtnQkFDUixFQUFFLEVBQUUsSUFBSTtnQkFDUixJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO3dCQUNwQixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxnQkFBTyxDQUFDLEVBQUUsdUJBQWMsQ0FBQyxTQUFTLENBQUMsc0JBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztxQkFDN0gsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDN0MsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEMsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLGtDQUFtQyxTQUFRLGlCQUFPO1FBQ3ZFO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsNkJBQTZCO2dCQUMzQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMENBQTBDLEVBQUUsY0FBYyxDQUFDO29CQUMvRSxRQUFRLEVBQUUsY0FBYztpQkFDeEI7Z0JBQ0QsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLElBQUksRUFBRSxtQ0FBcUI7Z0JBQzNCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLHlCQUF5QixDQUFDO2dCQUNqRyxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO3dCQUNwQixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxnQkFBTyxDQUFDLEVBQUUsMkJBQWMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3FCQUM3SixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztZQUM3QyxPQUFPLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxlQUFnQixTQUFRLGlCQUFPO1FBQ3BEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsMkJBQTJCO2dCQUN6QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsWUFBWSxDQUFDO29CQUMxRCxRQUFRLEVBQUUsWUFBWTtpQkFDdEI7Z0JBQ0QsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLElBQUksRUFBRSxpQ0FBbUI7Z0JBQ3pCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3RyxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO3dCQUNwQixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxnQkFBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQztxQkFDN0ksQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDN0MsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLHdCQUF5QixTQUFRLGlCQUFPO1FBQzdEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsMEJBQTBCO2dCQUN4QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsc0JBQXNCLENBQUM7b0JBQzdFLFFBQVEsRUFBRSxzQkFBc0I7aUJBQ2hDO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixJQUFJLEVBQUUsNkJBQWU7Z0JBQ3JCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLHVCQUF1QixFQUFFLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMscUJBQXFCLENBQUM7Z0JBQ25LLElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7d0JBQ3BCLEtBQUssRUFBRSxZQUFZO3dCQUNuQixLQUFLLEVBQUUsQ0FBQzt3QkFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGdCQUFPLENBQUM7cUJBQzVDLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO1lBQzdDLE9BQU8sa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUNELENBQUMsQ0FBQztJQUdILElBQUEseUJBQWUsRUFBQyxNQUFNLGdCQUFpQixTQUFRLGlCQUFPO1FBQ3JEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsa0JBQWtCO2dCQUNoQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsY0FBYyxDQUFDO29CQUM3RCxRQUFRLEVBQUUsY0FBYztpQkFDeEI7Z0JBQ0QsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLElBQUksRUFBRSw4QkFBZ0I7Z0JBQ3RCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakcsSUFBSSxFQUFFLENBQUM7d0JBQ04sRUFBRSxFQUFFLGdCQUFNLENBQUMsU0FBUzt3QkFDcEIsS0FBSyxFQUFFLFlBQVk7d0JBQ25CLEtBQUssRUFBRSxDQUFDO3dCQUNSLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywyQkFBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsZ0JBQU8sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7cUJBQ3JHLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO1lBQzdDLE1BQU0sVUFBVSxHQUFHLElBQUEsaUNBQWEsRUFBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksVUFBVSxFQUFFO2dCQUNmLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7UUFDRixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sZ0JBQWlCLFNBQVEsaUJBQU87UUFDckQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLFNBQVMsQ0FBQyxrQkFBa0I7Z0JBQ2hDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxjQUFjLENBQUM7b0JBQzdELFFBQVEsRUFBRSxjQUFjO2lCQUN4QjtnQkFDRCxRQUFRLEVBQVIsNEJBQVE7Z0JBQ1IsSUFBSSxFQUFFLDhCQUFnQjtnQkFDdEIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDO2dCQUNyRixJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO3dCQUNwQixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxnQkFBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQztxQkFDekYsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBQSxpQ0FBYSxFQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDLENBQUM7WUFDOUQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QjtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxZQUFZO0lBRVosaUJBQWlCO0lBQ2pCLE1BQU0sbUJBQW1CLEdBQW9CLFFBQVEsQ0FBQyxFQUFFO1FBQ3ZELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0Q0FBcUIsQ0FBQyxDQUFDO1FBQ2pFLG9CQUFvQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3JDLENBQUMsQ0FBQztJQUVGLFNBQVMsU0FBUyxDQUFDLFFBQTBCO1FBQzVDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUEsaUNBQWEsRUFBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxJQUFJLFVBQVUsRUFBRTtZQUNmLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbkI7SUFDRixDQUFDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxRQUEwQjtRQUNyRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGlDQUFhLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsVUFBVSxFQUFFLGtCQUFrQixFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVELFNBQVMsWUFBWSxDQUFDLFFBQTBCO1FBQy9DLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUEsaUNBQWEsRUFBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxVQUFVLEVBQUUsWUFBWSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLFFBQTBCO1FBQ2hELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUEsaUNBQWEsRUFBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsU0FBUyw0QkFBNEIsQ0FBQyxRQUEwQjtRQUUvRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGlDQUFhLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxVQUFVLEVBQUU7WUFDZixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFdkM7OztlQUdHO1lBQ0gsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BDLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QixJQUFJLHlCQUF5QixHQUFHLEtBQUssQ0FBQztZQUN0QyxJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUVsQyxJQUFJLElBQUksWUFBWSxzQ0FBd0IsSUFBSSxVQUFVLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ25GLE9BQU8sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDL0IsSUFBSSxJQUFJLFlBQVksbUJBQUssRUFBRTt3QkFDMUIseUJBQXlCLEdBQUcsSUFBSSxDQUFDO3dCQUNqQyxNQUFNO3FCQUNOO29CQUNELElBQUksVUFBVSxDQUFDLHVCQUF1QixJQUFJLENBQUMscUJBQXFCLEVBQUU7d0JBQ2pFLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQzt3QkFFdEIsSUFBSSxJQUFJLFlBQVkseUJBQVcsRUFBRTs0QkFDaEMsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDckYsb0hBQW9IOzRCQUNwSCxVQUFVLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLENBQUMsb0JBQW9CLFlBQVksbUJBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7eUJBQzlHO3dCQUVELE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFFNUMsSUFBSSxDQUFDLENBQUMsZUFBZSxZQUFZLHNDQUF3QixJQUFJLGVBQWUsWUFBWSwrQkFBaUIsSUFBSSxlQUFlLFlBQVksMEJBQVksQ0FBQyxFQUFFOzRCQUN0SixxQkFBcUIsR0FBRyxJQUFJLENBQUM7eUJBQzdCO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLHlCQUF5QixFQUFFO2dCQUM5QixJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUN6QixHQUFHO29CQUNGLElBQUksSUFBSSxZQUFZLHVCQUFTLEVBQUU7d0JBQzlCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3RCO2lCQUNELFFBQVEsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRTthQUNsQztpQkFBTSxJQUFJLHFCQUFxQixFQUFFO2dCQUNqQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUN6QixJQUFJLElBQUksRUFBRTtvQkFDVCxHQUFHO3dCQUVGLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQzt3QkFFdEIsSUFBSSxJQUFJLFlBQVkseUJBQVcsRUFBRTs0QkFDaEMsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDckYsb0hBQW9IOzRCQUNwSCxVQUFVLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLENBQUMsb0JBQW9CLFlBQVksbUJBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7eUJBQzlHO3dCQUNELE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFFNUMsSUFBSSxlQUFlLFlBQVksc0NBQXdCLElBQUksZUFBZSxZQUFZLCtCQUFpQixFQUFFOzRCQUN4RyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0NBQzVCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOzZCQUM1QjtpQ0FBTTtnQ0FDTixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7NkJBQ3JCO3lCQUNEO3FCQUNELFFBQVEsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtpQkFDbEM7YUFDRDtpQkFBTTtnQkFDTixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDckI7WUFFRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUV4RCxJQUFJLGdCQUFnQixJQUFJLENBQUMsZ0JBQWdCLFlBQVkseUJBQVcsSUFBSSxnQkFBZ0IsWUFBWSx1QkFBUyxDQUFDO2dCQUN6RyxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUM3RSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUN2QztTQUNEO0lBQ0YsQ0FBQzs7QUFFRCxZQUFZIn0=