/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/searchActionsSymbol", "vs/workbench/contrib/search/common/constants", "vs/platform/actions/common/actions", "vs/platform/quickinput/common/quickInput"], function (require, exports, nls, Constants, actions_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions
    (0, actions_1.$Xu)(class ShowAllSymbolsAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.showAllSymbols'; }
        static { this.LABEL = nls.localize(0, null); }
        static { this.ALL_SYMBOLS_PREFIX = '#'; }
        constructor() {
            super({
                id: Constants.$ZNb,
                title: {
                    value: nls.localize(1, null),
                    original: 'Go to Symbol in Workspace...',
                    mnemonicTitle: nls.localize(2, null)
                },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */
                },
                menu: {
                    id: actions_1.$Ru.MenubarGoMenu,
                    group: '3_global_nav',
                    order: 2
                }
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
        }
    });
});
//#endregion
//# sourceMappingURL=searchActionsSymbol.js.map