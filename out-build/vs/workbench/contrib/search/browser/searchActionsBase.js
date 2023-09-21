/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search"], function (require, exports, DOM, nls, searchModel_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BNb = exports.$ANb = exports.$zNb = exports.$yNb = exports.$xNb = exports.$wNb = exports.$vNb = void 0;
    exports.$vNb = { value: nls.localize(0, null), original: 'Search' };
    function $wNb(viewsService) {
        const searchView = $yNb(viewsService);
        const activeElement = document.activeElement;
        return !!(searchView && activeElement && DOM.$NO(activeElement, searchView.getContainer()));
    }
    exports.$wNb = $wNb;
    function $xNb(label, inputKeyBinding) {
        return doAppendKeyBindingLabel(label, inputKeyBinding);
    }
    exports.$xNb = $xNb;
    function $yNb(viewsService) {
        return viewsService.getActiveViewWithId(search_1.$lI);
    }
    exports.$yNb = $yNb;
    function $zNb(viewer, currElement, sortConfig) {
        let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => (0, searchModel_1.$ZMb)(a, b, sortConfig.sortOrder));
        // if selection doesn't include multiple elements, just return current focus element.
        if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
            elements = [currElement];
        }
        return elements;
    }
    exports.$zNb = $zNb;
    /**
     * @param elements elements that are going to be removed
     * @param focusElement element that is focused
     * @returns whether we need to re-focus on a remove
     */
    function $ANb(elements, focusElement) {
        if (!focusElement) {
            return false;
        }
        return !focusElement || elements.includes(focusElement) || hasDownstreamMatch(elements, focusElement);
    }
    exports.$ANb = $ANb;
    function hasDownstreamMatch(elements, focusElement) {
        for (const elem of elements) {
            if ((elem instanceof searchModel_1.$SMb && focusElement instanceof searchModel_1.$PMb && elem.matches().includes(focusElement)) ||
                (elem instanceof searchModel_1.$TMb && ((focusElement instanceof searchModel_1.$SMb && elem.getDownstreamFileMatch(focusElement.resource)) ||
                    (focusElement instanceof searchModel_1.$PMb && elem.getDownstreamFileMatch(focusElement.parent().resource))))) {
                return true;
            }
        }
        return false;
    }
    function $BNb(viewsService, focus) {
        return viewsService.openView(search_1.$lI, focus).then(view => (view ?? undefined));
    }
    exports.$BNb = $BNb;
    function doAppendKeyBindingLabel(label, keyBinding) {
        return keyBinding ? label + ' (' + keyBinding.getLabel() + ')' : label;
    }
});
//# sourceMappingURL=searchActionsBase.js.map