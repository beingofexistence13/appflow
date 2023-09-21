/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/base/common/arrays"], function (require, exports, nls, configuration_1, listService_1, views_1, searchIcons_1, Constants, replace_1, searchModel_1, editorService_1, uriIdentity_1, contextkey_1, actions_1, searchActionsBase_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLastNodeFromSameType = exports.getElementToFocusAfterRemoved = void 0;
    //#endregion
    //#region Actions
    (0, actions_1.registerAction2)(class RemoveAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.RemoveActionId,
                title: {
                    value: nls.localize('RemoveAction.label', "Dismiss"),
                    original: 'Dismiss'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchRemoveIcon,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 20 /* KeyCode.Delete */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    },
                },
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        group: 'search',
                        order: 2,
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        group: 'inline',
                        order: 2,
                    },
                ]
            });
        }
        run(accessor, context) {
            const viewsService = accessor.get(views_1.IViewsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
            if (!searchView) {
                return;
            }
            let element = context?.element;
            let viewer = context?.viewer;
            if (!viewer) {
                viewer = searchView.getControl();
            }
            if (!element) {
                element = viewer.getFocus()[0] ?? undefined;
            }
            const elementsToRemove = (0, searchActionsBase_1.getElementsToOperateOn)(viewer, element, configurationService.getValue('search'));
            let focusElement = viewer.getFocus()[0] ?? undefined;
            if (elementsToRemove.length === 0) {
                return;
            }
            if (!focusElement || (focusElement instanceof searchModel_1.SearchResult)) {
                focusElement = element;
            }
            let nextFocusElement;
            const shouldRefocusMatch = (0, searchActionsBase_1.shouldRefocus)(elementsToRemove, focusElement);
            if (focusElement && shouldRefocusMatch) {
                nextFocusElement = getElementToFocusAfterRemoved(viewer, focusElement, elementsToRemove);
            }
            const searchResult = searchView.searchResult;
            if (searchResult) {
                searchResult.batchRemove(elementsToRemove);
            }
            if (focusElement && shouldRefocusMatch) {
                if (!nextFocusElement) {
                    nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
                }
                if (nextFocusElement && !(0, searchModel_1.arrayContainsElementOrParent)(nextFocusElement, elementsToRemove)) {
                    viewer.reveal(nextFocusElement);
                    viewer.setFocus([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                    viewer.setSelection([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                }
            }
            else if (!(0, arrays_1.equals)(viewer.getFocus(), viewer.getSelection())) {
                viewer.setSelection(viewer.getFocus());
            }
            viewer.domFocus();
            return;
        }
    });
    (0, actions_1.registerAction2)(class ReplaceAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceActionId,
                title: {
                    value: nls.localize('match.replace.label', "Replace"),
                    original: 'Replace'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.MatchFocusKey, Constants.IsEditableItemKey),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                },
                icon: searchIcons_1.searchReplaceIcon,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey, Constants.IsEditableItemKey),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey, Constants.IsEditableItemKey),
                        group: 'inline',
                        order: 1
                    }
                ]
            });
        }
        async run(accessor, context) {
            return performReplace(accessor, context);
        }
    });
    (0, actions_1.registerAction2)(class ReplaceAllAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceAllInFileActionId,
                title: {
                    value: nls.localize('file.replaceAll.label', "Replace All"),
                    original: 'Replace All'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FileFocusKey, Constants.IsEditableItemKey),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
                },
                icon: searchIcons_1.searchReplaceIcon,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey, Constants.IsEditableItemKey),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey, Constants.IsEditableItemKey),
                        group: 'inline',
                        order: 1
                    }
                ]
            });
        }
        async run(accessor, context) {
            return performReplace(accessor, context);
        }
    });
    (0, actions_1.registerAction2)(class ReplaceAllInFolderAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceAllInFolderActionId,
                title: {
                    value: nls.localize('file.replaceAll.label', "Replace All"),
                    original: 'Replace All'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FolderFocusKey, Constants.IsEditableItemKey),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
                },
                icon: searchIcons_1.searchReplaceIcon,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey, Constants.IsEditableItemKey),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey, Constants.IsEditableItemKey),
                        group: 'inline',
                        order: 1
                    }
                ]
            });
        }
        async run(accessor, context) {
            return performReplace(accessor, context);
        }
    });
    //#endregion
    //#region Helpers
    function performReplace(accessor, context) {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const viewsService = accessor.get(views_1.IViewsService);
        const viewlet = (0, searchActionsBase_1.getSearchView)(viewsService);
        const viewer = context?.viewer ?? viewlet?.getControl();
        if (!viewer) {
            return;
        }
        const element = context?.element ?? viewer.getFocus()[0];
        // since multiple elements can be selected, we need to check the type of the FolderMatch/FileMatch/Match before we perform the replace.
        const elementsToReplace = (0, searchActionsBase_1.getElementsToOperateOn)(viewer, element ?? undefined, configurationService.getValue('search'));
        let focusElement = viewer.getFocus()[0];
        if (!focusElement || (focusElement && !(0, searchModel_1.arrayContainsElementOrParent)(focusElement, elementsToReplace)) || (focusElement instanceof searchModel_1.SearchResult)) {
            focusElement = element;
        }
        if (elementsToReplace.length === 0) {
            return;
        }
        let nextFocusElement;
        if (focusElement) {
            nextFocusElement = getElementToFocusAfterRemoved(viewer, focusElement, elementsToReplace);
        }
        const searchResult = viewlet?.searchResult;
        if (searchResult) {
            searchResult.batchReplace(elementsToReplace);
        }
        if (focusElement) {
            if (!nextFocusElement) {
                nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
            }
            if (nextFocusElement) {
                viewer.reveal(nextFocusElement);
                viewer.setFocus([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                viewer.setSelection([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                if (nextFocusElement instanceof searchModel_1.Match) {
                    const useReplacePreview = configurationService.getValue().search.useReplacePreview;
                    if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement) || nextFocusElement instanceof searchModel_1.MatchInNotebook) {
                        viewlet?.open(nextFocusElement, true);
                    }
                    else {
                        accessor.get(replace_1.IReplaceService).openReplacePreview(nextFocusElement, true);
                    }
                }
                else if (nextFocusElement instanceof searchModel_1.FileMatch) {
                    viewlet?.open(nextFocusElement, true);
                }
            }
        }
        viewer.domFocus();
    }
    function hasToOpenFile(accessor, currBottomElem) {
        if (!(currBottomElem instanceof searchModel_1.Match)) {
            return false;
        }
        const activeEditor = accessor.get(editorService_1.IEditorService).activeEditor;
        const file = activeEditor?.resource;
        if (file) {
            return accessor.get(uriIdentity_1.IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
        }
        return false;
    }
    function compareLevels(elem1, elem2) {
        if (elem1 instanceof searchModel_1.Match) {
            if (elem2 instanceof searchModel_1.Match) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else if (elem1 instanceof searchModel_1.FileMatch) {
            if (elem2 instanceof searchModel_1.Match) {
                return 1;
            }
            else if (elem2 instanceof searchModel_1.FileMatch) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else {
            // FolderMatch
            if (elem2 instanceof searchModel_1.FolderMatch) {
                return 0;
            }
            else {
                return 1;
            }
        }
    }
    /**
     * Returns element to focus after removing the given element
     */
    function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
        const navigator = viewer.navigate(element);
        if (element instanceof searchModel_1.FolderMatch) {
            while (!!navigator.next() && (!(navigator.current() instanceof searchModel_1.FolderMatch) || (0, searchModel_1.arrayContainsElementOrParent)(navigator.current(), elementsToRemove))) { }
        }
        else if (element instanceof searchModel_1.FileMatch) {
            while (!!navigator.next() && (!(navigator.current() instanceof searchModel_1.FileMatch) || (0, searchModel_1.arrayContainsElementOrParent)(navigator.current(), elementsToRemove))) {
                viewer.expand(navigator.current());
            }
        }
        else {
            while (navigator.next() && (!(navigator.current() instanceof searchModel_1.Match) || (0, searchModel_1.arrayContainsElementOrParent)(navigator.current(), elementsToRemove))) {
                viewer.expand(navigator.current());
            }
        }
        return navigator.current();
    }
    exports.getElementToFocusAfterRemoved = getElementToFocusAfterRemoved;
    /***
     * Finds the last element in the tree with the same type as `element`
     */
    function getLastNodeFromSameType(viewer, element) {
        let lastElem = viewer.lastVisibleElement ?? null;
        while (lastElem) {
            const compareVal = compareLevels(element, lastElem);
            if (compareVal === -1) {
                viewer.expand(lastElem);
                lastElem = viewer.lastVisibleElement;
            }
            else if (compareVal === 1) {
                lastElem = viewer.getParentElement(lastElem);
            }
            else {
                return lastElem;
            }
        }
        return undefined;
    }
    exports.getLastNodeFromSameType = getLastNodeFromSameType;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1JlbW92ZVJlcGxhY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hBY3Rpb25zUmVtb3ZlUmVwbGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE2Q2hHLFlBQVk7SUFFWixpQkFBaUI7SUFDakIsSUFBQSx5QkFBZSxFQUFDLE1BQU0sWUFBYSxTQUFRLGlCQUFPO1FBRWpEO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsY0FBYztnQkFDNUIsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQztvQkFDcEQsUUFBUSxFQUFFLFNBQVM7aUJBQ25CO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixJQUFJLEVBQUUsOEJBQWdCO2dCQUN0QixVQUFVLEVBQUU7b0JBQ1gsTUFBTSw2Q0FBbUM7b0JBQ3pDLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLHdCQUF3QixDQUFDO29CQUM1RixPQUFPLHlCQUFnQjtvQkFDdkIsR0FBRyxFQUFFO3dCQUNKLE9BQU8sRUFBRSxxREFBa0M7cUJBQzNDO2lCQUNEO2dCQUNELElBQUksRUFBRTtvQkFDTDt3QkFDQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixLQUFLLEVBQUUsUUFBUTt3QkFDZixLQUFLLEVBQUUsQ0FBQztxQkFDUjtvQkFDRDt3QkFDQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxnQkFBZ0I7d0JBQzNCLEtBQUssRUFBRSxRQUFRO3dCQUNmLEtBQUssRUFBRSxDQUFDO3FCQUNSO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztR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