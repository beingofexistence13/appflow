/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/types"], function (require, exports, dom_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9T = exports.$8T = exports.$7T = exports.$6T = exports.$5T = exports.$4T = void 0;
    exports.$4T = new dom_1.$BO(220, 70);
    exports.$5T = new dom_1.$BO(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    exports.$6T = {
        showTabs: true,
        highlightModifiedTabs: false,
        tabCloseButton: 'right',
        tabSizing: 'fit',
        tabSizingFixedMinWidth: 50,
        tabSizingFixedMaxWidth: 160,
        pinnedTabSizing: 'normal',
        tabHeight: 'normal',
        preventPinnedEditorClose: 'keyboardAndMouse',
        titleScrollbarSizing: 'default',
        focusRecentEditorAfterClose: true,
        showIcons: true,
        hasIcons: true,
        enablePreview: true,
        openPositioning: 'right',
        openSideBySideDirection: 'right',
        closeEmptyGroups: true,
        labelFormat: 'default',
        splitSizing: 'auto',
        splitOnDragAndDrop: true,
        centeredLayoutFixedWidth: false,
        doubleClickTabToToggleEditorGroupSizes: true,
    };
    function $7T(event) {
        return event.affectsConfiguration('workbench.editor') || event.affectsConfiguration('workbench.iconTheme');
    }
    exports.$7T = $7T;
    function $8T(configurationService, themeService) {
        const options = {
            ...exports.$6T,
            hasIcons: themeService.getFileIconTheme().hasFileIcons
        };
        const config = configurationService.getValue();
        if (config?.workbench?.editor) {
            // Assign all primitive configuration over
            Object.assign(options, config.workbench.editor);
            // Special handle array types and convert to Set
            if ((0, types_1.$lf)(config.workbench.editor.autoLockGroups)) {
                options.autoLockGroups = new Set();
                for (const [editorId, enablement] of Object.entries(config.workbench.editor.autoLockGroups)) {
                    if (enablement === true) {
                        options.autoLockGroups.add(editorId);
                    }
                }
            }
            else {
                options.autoLockGroups = undefined;
            }
        }
        return options;
    }
    exports.$8T = $8T;
    function $9T(group, expectedActiveEditor, presetOptions) {
        if (!expectedActiveEditor || !group.activeEditor || expectedActiveEditor.matches(group.activeEditor)) {
            const options = {
                ...presetOptions,
                viewState: group.activeEditorPane?.getViewState()
            };
            return options;
        }
        return presetOptions || Object.create(null);
    }
    exports.$9T = $9T;
});
//# sourceMappingURL=editor.js.map