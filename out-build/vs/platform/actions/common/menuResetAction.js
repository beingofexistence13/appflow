/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/actions/common/menuResetAction", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/log/common/log"], function (require, exports, nls_1, actionCommonCategories_1, actions_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kyb = void 0;
    class $kyb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'menu.resetHiddenStates',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Reset All Menus'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(actions_1.$Su).resetHiddenStates();
            accessor.get(log_1.$5i).info('did RESET all menu hidden states');
        }
    }
    exports.$kyb = $kyb;
});
//# sourceMappingURL=menuResetAction.js.map