/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/searchActionsTopBar", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/browser/searchActionsBase"], function (require, exports, nls, listService_1, views_1, searchIcons_1, Constants, searchHistoryService_1, searchModel_1, search_1, contextkey_1, actions_1, search_2, searchActionsBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions
    (0, actions_1.$Xu)(class ClearSearchHistoryCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$MNb,
                title: {
                    value: nls.localize(0, null),
                    original: 'Clear Search History'
                },
                category: searchActionsBase_1.$vNb,
                f1: true
            });
        }
        async run(accessor) {
            clearHistoryCommand(accessor);
        }
    });
    (0, actions_1.$Xu)(class CancelSearchAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$2Nb,
                title: {
                    value: nls.localize(1, null),
                    original: 'Cancel Search'
                },
                icon: searchIcons_1.$oNb,
                category: searchActionsBase_1.$vNb,
                f1: true,
                precondition: search_2.$OI.isEqualTo(search_2.SearchUIState.Idle).negate(),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, listService_1.$e4),
                    primary: 9 /* KeyCode.Escape */,
                },
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', search_1.$lI), search_2.$OI.isEqualTo(search_2.SearchUIState.SlowSearch)),
                    }]
            });
        }
        run(accessor) {
            return cancelSearch(accessor);
        }
    });
    (0, actions_1.$Xu)(class RefreshAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$3Nb,
                title: {
                    value: nls.localize(2, null),
                    original: 'Refresh'
                },
                icon: searchIcons_1.$iNb,
                precondition: Constants.$yOb,
                category: searchActionsBase_1.$vNb,
                f1: true,
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', search_1.$lI), search_2.$OI.isEqualTo(search_2.SearchUIState.SlowSearch).negate()),
                    }]
            });
        }
        run(accessor, ...args) {
            return refreshSearch(accessor);
        }
    });
    (0, actions_1.$Xu)(class CollapseDeepestExpandedLevelAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$7Nb,
                title: {
                    value: nls.localize(3, null),
                    original: 'Collapse All'
                },
                category: searchActionsBase_1.$vNb,
                icon: searchIcons_1.$jNb,
                f1: true,
                precondition: contextkey_1.$Ii.and(Constants.$oOb, Constants.$BOb),
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', search_1.$lI), contextkey_1.$Ii.or(Constants.$oOb.negate(), Constants.$BOb)),
                    }]
            });
        }
        run(accessor, ...args) {
            return collapseDeepestExpandedLevel(accessor);
        }
    });
    (0, actions_1.$Xu)(class ExpandAllAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$8Nb,
                title: {
                    value: nls.localize(4, null),
                    original: 'Expand All'
                },
                category: searchActionsBase_1.$vNb,
                icon: searchIcons_1.$kNb,
                f1: true,
                precondition: contextkey_1.$Ii.and(Constants.$oOb, Constants.$BOb.toNegated()),
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', search_1.$lI), Constants.$oOb, Constants.$BOb.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            return expandAll(accessor);
        }
    });
    (0, actions_1.$Xu)(class ClearSearchResultsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$9Nb,
                title: {
                    value: nls.localize(5, null),
                    original: 'Clear Search Results'
                },
                category: searchActionsBase_1.$vNb,
                icon: searchIcons_1.$nNb,
                f1: true,
                precondition: contextkey_1.$Ii.or(Constants.$oOb, Constants.$yOb, Constants.$zOb, Constants.$AOb),
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 1,
                        when: contextkey_1.$Ii.equals('view', search_1.$lI),
                    }]
            });
        }
        run(accessor, ...args) {
            return clearSearchResults(accessor);
        }
    });
    (0, actions_1.$Xu)(class ViewAsTreeAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$0Nb,
                title: {
                    value: nls.localize(6, null),
                    original: 'View as Tree'
                },
                category: searchActionsBase_1.$vNb,
                icon: searchIcons_1.$mNb,
                f1: true,
                precondition: contextkey_1.$Ii.and(Constants.$oOb, Constants.$COb.toNegated()),
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', search_1.$lI), Constants.$COb.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (searchView) {
                searchView.setTreeView(true);
            }
        }
    });
    (0, actions_1.$Xu)(class ViewAsListAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$$Nb,
                title: {
                    value: nls.localize(7, null),
                    original: 'View as List'
                },
                category: searchActionsBase_1.$vNb,
                icon: searchIcons_1.$lNb,
                f1: true,
                precondition: contextkey_1.$Ii.and(Constants.$oOb, Constants.$COb),
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', search_1.$lI), Constants.$COb),
                    }]
            });
        }
        run(accessor, ...args) {
            const searchView = (0, searchActionsBase_1.$yNb)(accessor.get(views_1.$$E));
            if (searchView) {
                searchView.setTreeView(false);
            }
        }
    });
    //#endregion
    //#region Helpers
    const clearHistoryCommand = accessor => {
        const searchHistoryService = accessor.get(searchHistoryService_1.$jPb);
        searchHistoryService.clearHistory();
    };
    function expandAll(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
        if (searchView) {
            const viewer = searchView.getControl();
            viewer.expandAll();
        }
    }
    function clearSearchResults(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
        searchView?.clearSearchResults();
    }
    function cancelSearch(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
        searchView?.cancelSearch();
    }
    function refreshSearch(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
        searchView?.triggerQueryChange({ preserveFocus: false });
    }
    function collapseDeepestExpandedLevel(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
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
            if (node instanceof searchModel_1.$VMb || searchView.cd) {
                while (node = navigator.next()) {
                    if (node instanceof searchModel_1.$PMb) {
                        canCollapseFileMatchLevel = true;
                        break;
                    }
                    if (searchView.cd && !canCollapseFirstLevel) {
                        let nodeToTest = node;
                        if (node instanceof searchModel_1.$TMb) {
                            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
                            // Match elements should never be compressed, so !(compressionStartNode instanceof Match) should always be true here
                            nodeToTest = (compressionStartNode && !(compressionStartNode instanceof searchModel_1.$PMb)) ? compressionStartNode : node;
                        }
                        const immediateParent = nodeToTest.parent();
                        if (!(immediateParent instanceof searchModel_1.$VMb || immediateParent instanceof searchModel_1.$WMb || immediateParent instanceof searchModel_1.$1Mb)) {
                            canCollapseFirstLevel = true;
                        }
                    }
                }
            }
            if (canCollapseFileMatchLevel) {
                node = navigator.first();
                do {
                    if (node instanceof searchModel_1.$SMb) {
                        viewer.collapse(node);
                    }
                } while (node = navigator.next());
            }
            else if (canCollapseFirstLevel) {
                node = navigator.first();
                if (node) {
                    do {
                        let nodeToTest = node;
                        if (node instanceof searchModel_1.$TMb) {
                            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
                            // Match elements should never be compressed, so !(compressionStartNode instanceof Match) should always be true here
                            nodeToTest = (compressionStartNode && !(compressionStartNode instanceof searchModel_1.$PMb)) ? compressionStartNode : node;
                        }
                        const immediateParent = nodeToTest.parent();
                        if (immediateParent instanceof searchModel_1.$VMb || immediateParent instanceof searchModel_1.$WMb) {
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
            if (firstFocusParent && (firstFocusParent instanceof searchModel_1.$TMb || firstFocusParent instanceof searchModel_1.$SMb) &&
                viewer.hasElement(firstFocusParent) && viewer.isCollapsed(firstFocusParent)) {
                viewer.domFocus();
                viewer.focusFirst();
                viewer.setSelection(viewer.getFocus());
            }
        }
    }
});
//#endregion
//# sourceMappingURL=searchActionsTopBar.js.map