/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/toggleRenderControlCharacter", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gYb = void 0;
    class $gYb extends actions_1.$Wu {
        static { this.ID = 'editor.action.toggleRenderControlCharacter'; }
        constructor() {
            super({
                id: $gYb.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Toggle Control Characters'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkey_1.$Ii.equals('config.editor.renderControlCharacters', true),
                menu: {
                    id: actions_1.$Ru.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 5
                }
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newRenderControlCharacters = !configurationService.getValue('editor.renderControlCharacters');
            return configurationService.updateValue('editor.renderControlCharacters', newRenderControlCharacters);
        }
    }
    exports.$gYb = $gYb;
    (0, actions_1.$Xu)($gYb);
});
//# sourceMappingURL=toggleRenderControlCharacter.js.map