/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/contrib/files/common/files", "vs/workbench/common/editor", "vs/base/browser/ui/list/listWidget", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/arrays", "vs/base/browser/ui/tree/asyncDataTree", "vs/platform/instantiation/common/instantiation"], function (require, exports, uri_1, files_1, editor_1, listWidget_1, explorerModel_1, arrays_1, asyncDataTree_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOpenEditorsViewMultiSelection = exports.getMultiSelectedResources = exports.getResourceForCommand = exports.IExplorerService = void 0;
    exports.IExplorerService = (0, instantiation_1.createDecorator)('explorerService');
    function getFocus(listService) {
        const list = listService.lastFocusedList;
        if (list?.getHTMLElement() === document.activeElement) {
            let focus;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            else if (list instanceof asyncDataTree_1.AsyncDataTree) {
                const focused = list.getFocus();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            return focus;
        }
        return undefined;
    }
    // Commands can get executed from a command palette, from a context menu or from some list using a keybinding
    // To cover all these cases we need to properly compute the resource on which the command is being executed
    function getResourceForCommand(resource, listService, editorService) {
        if (uri_1.URI.isUri(resource)) {
            return resource;
        }
        const focus = getFocus(listService);
        if (focus instanceof explorerModel_1.ExplorerItem) {
            return focus.resource;
        }
        else if (focus instanceof files_1.OpenEditor) {
            return focus.getResource();
        }
        return editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
    }
    exports.getResourceForCommand = getResourceForCommand;
    function getMultiSelectedResources(resource, listService, editorService, explorerService) {
        const list = listService.lastFocusedList;
        if (list?.getHTMLElement() === document.activeElement) {
            // Explorer
            if (list instanceof asyncDataTree_1.AsyncDataTree && list.getFocus().every(item => item instanceof explorerModel_1.ExplorerItem)) {
                // Explorer
                const context = explorerService.getContext(true, true);
                if (context.length) {
                    return context.map(c => c.resource);
                }
            }
            // Open editors view
            if (list instanceof listWidget_1.List) {
                const selection = (0, arrays_1.coalesce)(list.getSelectedElements().filter(s => s instanceof files_1.OpenEditor).map((oe) => oe.getResource()));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainUriStr = undefined;
                if (uri_1.URI.isUri(resource)) {
                    mainUriStr = resource.toString();
                }
                else if (focus instanceof files_1.OpenEditor) {
                    const focusedResource = focus.getResource();
                    mainUriStr = focusedResource ? focusedResource.toString() : undefined;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s.toString() === mainUriStr)) {
                    return selection;
                }
            }
        }
        const result = getResourceForCommand(resource, listService, editorService);
        return !!result ? [result] : [];
    }
    exports.getMultiSelectedResources = getMultiSelectedResources;
    function getOpenEditorsViewMultiSelection(listService, editorGroupService) {
        const list = listService.lastFocusedList;
        if (list?.getHTMLElement() === document.activeElement) {
            // Open editors view
            if (list instanceof listWidget_1.List) {
                const selection = (0, arrays_1.coalesce)(list.getSelectedElements().filter(s => s instanceof files_1.OpenEditor));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainEditor = undefined;
                if (focus instanceof files_1.OpenEditor) {
                    mainEditor = focus;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s === mainEditor)) {
                    return selection;
                }
                return mainEditor ? [mainEditor] : undefined;
            }
        }
        return undefined;
    }
    exports.getOpenEditorsViewMultiSelection = getOpenEditorsViewMultiSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL2ZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZDbkYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLCtCQUFlLEVBQW1CLGlCQUFpQixDQUFDLENBQUM7SUFjckYsU0FBUyxRQUFRLENBQUMsV0FBeUI7UUFDMUMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQztRQUN6QyxJQUFJLElBQUksRUFBRSxjQUFjLEVBQUUsS0FBSyxRQUFRLENBQUMsYUFBYSxFQUFFO1lBQ3RELElBQUksS0FBYyxDQUFDO1lBQ25CLElBQUksSUFBSSxZQUFZLGlCQUFJLEVBQUU7Z0JBQ3pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUMxQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQ25CLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25CO2FBQ0Q7aUJBQU0sSUFBSSxJQUFJLFlBQVksNkJBQWEsRUFBRTtnQkFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQ25CLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25CO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELDZHQUE2RztJQUM3RywyR0FBMkc7SUFDM0csU0FBZ0IscUJBQXFCLENBQUMsUUFBa0MsRUFBRSxXQUF5QixFQUFFLGFBQTZCO1FBQ2pJLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN4QixPQUFP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