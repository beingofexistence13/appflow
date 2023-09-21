/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/searchActionsRemoveReplace", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/base/common/arrays"], function (require, exports, nls, configuration_1, listService_1, views_1, searchIcons_1, Constants, replace_1, searchModel_1, editorService_1, uriIdentity_1, contextkey_1, actions_1, searchActionsBase_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dPb = exports.$cPb = void 0;
    //#endregion
    //#region Actions
    (0, actions_1.$Xu)(class RemoveAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$HNb,
                title: {
                    value: nls.localize(0, null),
                    original: 'Dismiss'
                },
                category: searchActionsBase_1.$vNb,
                icon: searchIcons_1.$hNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$qOb),
                    primary: 20 /* KeyCode.Delete */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    },
                },
                menu: [
                    {
                        id: actions_1.$Ru.SearchContext,
                        group: 'search',
                        order: 2,
                    },
                    {
                        id: actions_1.$Ru.SearchActionMenu,
                        group: 'inline',
                        order: 2,
                    },
                ]
            });
        }
        run(accessor, context) {
            const viewsService = accessor.get(views_1.$$E);
            const configurationService = accessor.get(configuration_1.$8h);
            const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
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
            const elementsToRemove = (0, searchActionsBase_1.$zNb)(viewer, element, configurationService.getValue('search'));
            let focusElement = viewer.getFocus()[0] ?? undefined;
            if (elementsToRemove.length === 0) {
                return;
            }
            if (!focusElement || (focusElement instanceof searchModel_1.$1Mb)) {
                focusElement = element;
            }
            let nextFocusElement;
            const shouldRefocusMatch = (0, searchActionsBase_1.$ANb)(elementsToRemove, focusElement);
            if (focusElement && shouldRefocusMatch) {
                nextFocusElement = $cPb(viewer, focusElement, elementsToRemove);
            }
            const searchResult = searchView.searchResult;
            if (searchResult) {
                searchResult.batchRemove(elementsToRemove);
            }
            if (focusElement && shouldRefocusMatch) {
                if (!nextFocusElement) {
                    nextFocusElement = $dPb(viewer, focusElement);
                }
                if (nextFocusElement && !(0, searchModel_1.$7Mb)(nextFocusElement, elementsToRemove)) {
                    viewer.reveal(nextFocusElement);
                    viewer.setFocus([nextFocusElement], (0, listService_1.$s4)());
                    viewer.setSelection([nextFocusElement], (0, listService_1.$s4)());
                }
            }
            else if (!(0, arrays_1.$sb)(viewer.getFocus(), viewer.getSelection())) {
                viewer.setSelection(viewer.getFocus());
            }
            viewer.domFocus();
            return;
        }
    });
    (0, actions_1.$Xu)(class ReplaceAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$ONb,
                title: {
                    value: nls.localize(1, null),
                    original: 'Replace'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$nOb, Constants.$xOb, Constants.$wOb),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                },
                icon: searchIcons_1.$gNb,
                menu: [
                    {
                        id: actions_1.$Ru.SearchContext,
                        when: contextkey_1.$Ii.and(Constants.$nOb, Constants.$xOb, Constants.$wOb),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.$Ru.SearchActionMenu,
                        when: contextkey_1.$Ii.and(Constants.$nOb, Constants.$xOb, Constants.$wOb),
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
    (0, actions_1.$Xu)(class ReplaceAllAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$PNb,
                title: {
                    value: nls.localize(2, null),
                    original: 'Replace All'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$nOb, Constants.$tOb, Constants.$wOb),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
                },
                icon: searchIcons_1.$gNb,
                menu: [
                    {
                        id: actions_1.$Ru.SearchContext,
                        when: contextkey_1.$Ii.and(Constants.$nOb, Constants.$tOb, Constants.$wOb),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.$Ru.SearchActionMenu,
                        when: contextkey_1.$Ii.and(Constants.$nOb, Constants.$tOb, Constants.$wOb),
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
    (0, actions_1.$Xu)(class ReplaceAllInFolderAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$QNb,
                title: {
                    value: nls.localize(3, null),
                    original: 'Replace All'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$nOb, Constants.$uOb, Constants.$wOb),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
                },
                icon: searchIcons_1.$gNb,
                menu: [
                    {
                        id: actions_1.$Ru.SearchContext,
                        when: contextkey_1.$Ii.and(Constants.$nOb, Constants.$uOb, Constants.$wOb),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.$Ru.SearchActionMenu,
                        when: contextkey_1.$Ii.and(Constants.$nOb, Constants.$uOb, Constants.$wOb),
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
        const configurationService = accessor.get(configuration_1.$8h);
        const viewsService = accessor.get(views_1.$$E);
        const viewlet = (0, searchActionsBase_1.$yNb)(viewsService);
        const viewer = context?.viewer ?? viewlet?.getControl();
        if (!viewer) {
            return;
        }
        const element = context?.element ?? viewer.getFocus()[0];
        // since multiple elements can be selected, we need to check the type of the FolderMatch/FileMatch/Match before we perform the replace.
        const elementsToReplace = (0, searchActionsBase_1.$zNb)(viewer, element ?? undefined, configurationService.getValue('search'));
        let focusElement = viewer.getFocus()[0];
        if (!focusElement || (focusElement && !(0, searchModel_1.$7Mb)(focusElement, elementsToReplace)) || (focusElement instanceof searchModel_1.$1Mb)) {
            focusElement = element;
        }
        if (elementsToReplace.length === 0) {
            return;
        }
        let nextFocusElement;
        if (focusElement) {
            nextFocusElement = $cPb(viewer, focusElement, elementsToReplace);
        }
        const searchResult = viewlet?.searchResult;
        if (searchResult) {
            searchResult.batchReplace(elementsToReplace);
        }
        if (focusElement) {
            if (!nextFocusElement) {
                nextFocusElement = $dPb(viewer, focusElement);
            }
            if (nextFocusElement) {
                viewer.reveal(nextFocusElement);
                viewer.setFocus([nextFocusElement], (0, listService_1.$s4)());
                viewer.setSelection([nextFocusElement], (0, listService_1.$s4)());
                if (nextFocusElement instanceof searchModel_1.$PMb) {
                    const useReplacePreview = configurationService.getValue().search.useReplacePreview;
                    if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement) || nextFocusElement instanceof searchModel_1.$RMb) {
                        viewlet?.open(nextFocusElement, true);
                    }
                    else {
                        accessor.get(replace_1.$8Mb).openReplacePreview(nextFocusElement, true);
                    }
                }
                else if (nextFocusElement instanceof searchModel_1.$SMb) {
                    viewlet?.open(nextFocusElement, true);
                }
            }
        }
        viewer.domFocus();
    }
    function hasToOpenFile(accessor, currBottomElem) {
        if (!(currBottomElem instanceof searchModel_1.$PMb)) {
            return false;
        }
        const activeEditor = accessor.get(editorService_1.$9C).activeEditor;
        const file = activeEditor?.resource;
        if (file) {
            return accessor.get(uriIdentity_1.$Ck).extUri.isEqual(file, currBottomElem.parent().resource);
        }
        return false;
    }
    function compareLevels(elem1, elem2) {
        if (elem1 instanceof searchModel_1.$PMb) {
            if (elem2 instanceof searchModel_1.$PMb) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else if (elem1 instanceof searchModel_1.$SMb) {
            if (elem2 instanceof searchModel_1.$PMb) {
                return 1;
            }
            else if (elem2 instanceof searchModel_1.$SMb) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else {
            // FolderMatch
            if (elem2 instanceof searchModel_1.$TMb) {
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
    function $cPb(viewer, element, elementsToRemove) {
        const navigator = viewer.navigate(element);
        if (element instanceof searchModel_1.$TMb) {
            while (!!navigator.next() && (!(navigator.current() instanceof searchModel_1.$TMb) || (0, searchModel_1.$7Mb)(navigator.current(), elementsToRemove))) { }
        }
        else if (element instanceof searchModel_1.$SMb) {
            while (!!navigator.next() && (!(navigator.current() instanceof searchModel_1.$SMb) || (0, searchModel_1.$7Mb)(navigator.current(), elementsToRemove))) {
                viewer.expand(navigator.current());
            }
        }
        else {
            while (navigator.next() && (!(navigator.current() instanceof searchModel_1.$PMb) || (0, searchModel_1.$7Mb)(navigator.current(), elementsToRemove))) {
                viewer.expand(navigator.current());
            }
        }
        return navigator.current();
    }
    exports.$cPb = $cPb;
    /***
     * Finds the last element in the tree with the same type as `element`
     */
    function $dPb(viewer, element) {
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
    exports.$dPb = $dPb;
});
//#endregion
//# sourceMappingURL=searchActionsRemoveReplace.js.map