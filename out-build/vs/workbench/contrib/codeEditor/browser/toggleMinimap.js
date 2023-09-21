/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/toggleMinimap", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eYb = void 0;
    class $eYb extends actions_1.$Wu {
        static { this.ID = 'editor.action.toggleMinimap'; }
        constructor() {
            super({
                id: $eYb.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Toggle Minimap',
                    mnemonicTitle: (0, nls_1.localize)(1, null)
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkey_1.$Ii.equals('config.editor.minimap.enabled', true),
                menu: {
                    id: actions_1.$Ru.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 1
                }
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('editor.minimap.enabled');
            return configurationService.updateValue('editor.minimap.enabled', newValue);
        }
    }
    exports.$eYb = $eYb;
    (0, actions_1.$Xu)($eYb);
});
//# sourceMappingURL=toggleMinimap.js.map