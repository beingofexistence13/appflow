/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search"], function (require, exports, DOM, nls, searchModel_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openSearchView = exports.shouldRefocus = exports.getElementsToOperateOn = exports.getSearchView = exports.appendKeyBindingLabel = exports.isSearchViewFocused = exports.category = void 0;
    exports.category = { value: nls.localize('search', "Search"), original: 'Search' };
    function isSearchViewFocused(viewsService) {
        const searchView = getSearchView(viewsService);
        const activeElement = document.activeElement;
        return !!(searchView && activeElement && DOM.isAncestor(activeElement, searchView.getContainer()));
    }
    exports.isSearchViewFocused = isSearchViewFocused;
    function appendKeyBindingLabel(label, inputKeyBinding) {
        return doAppendKeyBindingLabel(label, inputKeyBinding);
    }
    exports.appendKeyBindingLabel = appendKeyBindingLabel;
    function getSearchView(viewsService) {
        return viewsService.getActiveViewWithId(search_1.VIEW_ID);
    }
    exports.getSearchView = getSearchView;
    function getElementsToOperateOn(viewer, currElement, sortConfig) {
        let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => (0, searchModel_1.searchComparer)(a, b, sortConfig.sortOrder));
        // if selection doesn't include multiple elements, just return current focus element.
        if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
            elements = [currElement];
        }
        return elements;
    }
    exports.getElementsToOperateOn = getElementsToOperateOn;
    /**
     * @param elements elements that are going to be removed
     * @param focusElement element that is focused
     * @returns whether we need to re-focus on a remove
     */
    function shouldRefocus(elements, focusElement) {
        if (!focusElement) {
            return false;
        }
        return !focusElement || elements.includes(focusElement) || hasDownstreamMatch(elements, focusElement);
    }
    exports.shouldRefocus = shouldRefocus;
    function hasDownstreamMatch(elements, focusElement) {
        for (const elem of elements) {
            if ((elem instanceof searchModel_1.FileMatch && focusElement instanceof searchModel_1.Match && elem.matches().includes(focusElement)) ||
                (elem instanceof searchModel_1.FolderMatch && ((focusElement instanceof searchModel_1.FileMatch && elem.getDownstreamFileMatch(focusElement.resource)) ||
                    (focusElement instanceof searchModel_1.Match && elem.getDownstreamFileMatch(focusElement.parent().resource))))) {
                return true;
            }
        }
        return false;
    }
    function openSearchView(viewsService, focus) {
        return viewsService.openView(search_1.VIEW_ID, focus).then(view => (view ?? undefined));
    }
    exports.openSearchView = openSearchView;
    function doAppendKeyBindingLabel(label, keyBinding) {
        return keyBinding ? label + ' (' + keyBinding.getLabel() + ')' : label;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc0Jhc2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hBY3Rpb25zQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXbkYsUUFBQSxRQUFRLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBRXhGLFNBQWdCLG1CQUFtQixDQUFDLFlBQTJCO1FBQzlELE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLGFBQWEsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BHLENBQUM7SUFKRCxrREFJQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxlQUErQztRQUNuRyxPQUFPLHVCQUF1QixDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRkQsc0RBRUM7SUFFRCxTQUFnQixhQUFhLENBQUMsWUFBMkI7UUFDeEQsT0FBTyxZQUFZLENBQUMsbUJBQW1CLENBQUMsZ0JBQU8sQ0FBZSxDQUFDO0lBQ2hFLENBQUM7SUFGRCxzQ0FFQztJQUVELFNBQWdCLHNCQUFzQixDQUFDLE1BQThELEVBQUUsV0FBd0MsRUFBRSxVQUEwQztRQUMxTCxJQUFJLFFBQVEsR0FBc0IsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBd0IsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLDRCQUFjLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUVuSyxxRkFBcUY7UUFDckYsSUFBSSxXQUFXLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRTtZQUM1RSxRQUFRLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN6QjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUM7SUFURCx3REFTQztJQUVEOzs7O09BSUc7SUFDSCxTQUFnQixhQUFhLENBQUMsUUFBMkIsRUFBRSxZQUF5QztRQUNuRyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2xCLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxPQUFPLENBQUMsWUFBWSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7SUFMRCxzQ0FLQztJQUVELFNBQVMsa0JBQWtCLENBQUMsUUFBMkIsRUFBRSxZQUE2QjtRQUNyRixLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtZQUM1QixJQUFJLENBQUMsSUFBSSxZQUFZLHVCQUFTLElBQUksWUFBWSxZQUFZLG1CQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDeEcsQ0FBQyxJQUFJLFlBQVkseUJBQVcsSUFBSSxDQUMvQixDQUFDLFlBQVksWUFBWSx1QkFBUyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pGLENBQUMsWUFBWSxZQUFZLG1CQUFLLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUM5RixDQUFDLEVBQUU7Z0JBQ0osT0FBTyxJQUFJLENBQUM7YUFDWjtTQUNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFFZCxDQUFDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLFlBQTJCLEVBQUUsS0FBZTtRQUMxRSxPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUMsZ0JBQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQWtCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRkQsd0NBRUM7SUFFRCxTQUFTLHVCQUF1QixDQUFDLEtBQWEsRUFBRSxVQUEwQztRQUN6RixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDeEUsQ0FBQyJ9