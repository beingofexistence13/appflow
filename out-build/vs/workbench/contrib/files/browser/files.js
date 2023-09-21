/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/contrib/files/common/files", "vs/workbench/common/editor", "vs/base/browser/ui/list/listWidget", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/arrays", "vs/base/browser/ui/tree/asyncDataTree", "vs/platform/instantiation/common/instantiation"], function (require, exports, uri_1, files_1, editor_1, listWidget_1, explorerModel_1, arrays_1, asyncDataTree_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AHb = exports.$zHb = exports.$yHb = exports.$xHb = void 0;
    exports.$xHb = (0, instantiation_1.$Bh)('explorerService');
    function getFocus(listService) {
        const list = listService.lastFocusedList;
        if (list?.getHTMLElement() === document.activeElement) {
            let focus;
            if (list instanceof listWidget_1.$wQ) {
                const focused = list.getFocusedElements();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            else if (list instanceof asyncDataTree_1.$oS) {
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
    function $yHb(resource, listService, editorService) {
        if (uri_1.URI.isUri(resource)) {
            return resource;
        }
        const focus = getFocus(listService);
        if (focus instanceof explorerModel_1.$vHb) {
            return focus.resource;
        }
        else if (focus instanceof files_1.$_db) {
            return focus.getResource();
        }
        return editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
    }
    exports.$yHb = $yHb;
    function $zHb(resource, listService, editorService, explorerService) {
        const list = listService.lastFocusedList;
        if (list?.getHTMLElement() === document.activeElement) {
            // Explorer
            if (list instanceof asyncDataTree_1.$oS && list.getFocus().every(item => item instanceof explorerModel_1.$vHb)) {
                // Explorer
                const context = explorerService.getContext(true, true);
                if (context.length) {
                    return context.map(c => c.resource);
                }
            }
            // Open editors view
            if (list instanceof listWidget_1.$wQ) {
                const selection = (0, arrays_1.$Fb)(list.getSelectedElements().filter(s => s instanceof files_1.$_db).map((oe) => oe.getResource()));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainUriStr = undefined;
                if (uri_1.URI.isUri(resource)) {
                    mainUriStr = resource.toString();
                }
                else if (focus instanceof files_1.$_db) {
                    const focusedResource = focus.getResource();
                    mainUriStr = focusedResource ? focusedResource.toString() : undefined;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s.toString() === mainUriStr)) {
                    return selection;
                }
            }
        }
        const result = $yHb(resource, listService, editorService);
        return !!result ? [result] : [];
    }
    exports.$zHb = $zHb;
    function $AHb(listService, editorGroupService) {
        const list = listService.lastFocusedList;
        if (list?.getHTMLElement() === document.activeElement) {
            // Open editors view
            if (list instanceof listWidget_1.$wQ) {
                const selection = (0, arrays_1.$Fb)(list.getSelectedElements().filter(s => s instanceof files_1.$_db));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainEditor = undefined;
                if (focus instanceof files_1.$_db) {
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
    exports.$AHb = $AHb;
});
//# sourceMappingURL=files.js.map