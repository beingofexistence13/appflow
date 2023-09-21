/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/editor/browser/config/tabFocus", "vs/nls!vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode", "vs/platform/actions/common/actions"], function (require, exports, aria_1, tabFocus_1, nls, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$30 = void 0;
    class $30 extends actions_1.$Wu {
        static { this.ID = 'editor.action.toggleTabFocusMode'; }
        constructor() {
            super({
                id: $30.ID,
                title: { value: nls.localize(0, null), original: 'Toggle Tab Key Moves Focus' },
                precondition: undefined,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 43 /* KeyCode.KeyM */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 43 /* KeyCode.KeyM */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true
            });
        }
        run() {
            const oldValue = tabFocus_1.$CU.getTabFocusMode();
            const newValue = !oldValue;
            tabFocus_1.$CU.setTabFocusMode(newValue);
            if (newValue) {
                (0, aria_1.$$P)(nls.localize(1, null));
            }
            else {
                (0, aria_1.$$P)(nls.localize(2, null));
            }
        }
    }
    exports.$30 = $30;
    (0, actions_1.$Xu)($30);
});
//# sourceMappingURL=toggleTabFocusMode.js.map