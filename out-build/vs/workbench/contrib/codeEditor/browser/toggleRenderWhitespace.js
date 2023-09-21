/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/toggleRenderWhitespace", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleRenderWhitespaceAction extends actions_1.$Wu {
        static { this.ID = 'editor.action.toggleRenderWhitespace'; }
        constructor() {
            super({
                id: ToggleRenderWhitespaceAction.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Toggle Render Whitespace'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkey_1.$Ii.notEquals('config.editor.renderWhitespace', 'none'),
                menu: {
                    id: actions_1.$Ru.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 4
                }
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const renderWhitespace = configurationService.getValue('editor.renderWhitespace');
            let newRenderWhitespace;
            if (renderWhitespace === 'none') {
                newRenderWhitespace = 'all';
            }
            else {
                newRenderWhitespace = 'none';
            }
            return configurationService.updateValue('editor.renderWhitespace', newRenderWhitespace);
        }
    }
    (0, actions_1.$Xu)(ToggleRenderWhitespaceAction);
});
//# sourceMappingURL=toggleRenderWhitespace.js.map