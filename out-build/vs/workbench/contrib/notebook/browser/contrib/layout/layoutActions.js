/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, actions_1, configuration_1, coreActions_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rFb = void 0;
    const TOGGLE_CELL_TOOLBAR_POSITION = 'notebook.toggleCellToolbarPosition';
    class $rFb extends actions_1.$Wu {
        constructor() {
            super({
                id: TOGGLE_CELL_TOOLBAR_POSITION,
                title: { value: (0, nls_1.localize)(0, null), original: 'Toggle Cell Toolbar Position' },
                menu: [{
                        id: actions_1.$Ru.NotebookCellTitle,
                        group: 'View',
                        order: 1
                    }],
                category: coreActions_1.$7ob,
                f1: false
            });
        }
        async run(accessor, context) {
            const editor = context && context.ui ? context.notebookEditor : undefined;
            if (editor && editor.hasModel()) {
                // from toolbar
                const viewType = editor.textModel.viewType;
                const configurationService = accessor.get(configuration_1.$8h);
                const toolbarPosition = configurationService.getValue(notebookCommon_1.$7H.cellToolbarLocation);
                const newConfig = this.togglePosition(viewType, toolbarPosition);
                await configurationService.updateValue(notebookCommon_1.$7H.cellToolbarLocation, newConfig);
            }
        }
        togglePosition(viewType, toolbarPosition) {
            if (typeof toolbarPosition === 'string') {
                // legacy
                if (['left', 'right', 'hidden'].indexOf(toolbarPosition) >= 0) {
                    // valid position
                    const newViewValue = toolbarPosition === 'right' ? 'left' : 'right';
                    const config = {
                        default: toolbarPosition
                    };
                    config[viewType] = newViewValue;
                    return config;
                }
                else {
                    // invalid position
                    const config = {
                        default: 'right',
                    };
                    config[viewType] = 'left';
                    return config;
                }
            }
            else {
                const oldValue = toolbarPosition[viewType] ?? toolbarPosition['default'] ?? 'right';
                const newViewValue = oldValue === 'right' ? 'left' : 'right';
                const newConfig = {
                    ...toolbarPosition
                };
                newConfig[viewType] = newViewValue;
                return newConfig;
            }
        }
    }
    exports.$rFb = $rFb;
    (0, actions_1.$Xu)($rFb);
});
//# sourceMappingURL=layoutActions.js.map