/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/quickaccess", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput"], function (require, exports, nls_1, contextkey_1, keybinding_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ytb = exports.$Xtb = exports.$Wtb = exports.$Vtb = exports.$Utb = exports.$Ttb = void 0;
    exports.$Ttb = 'inQuickOpen';
    exports.$Utb = new contextkey_1.$2i(exports.$Ttb, false, (0, nls_1.localize)(0, null));
    exports.$Vtb = contextkey_1.$Ii.has(exports.$Ttb);
    exports.$Wtb = 'inFilesPicker';
    exports.$Xtb = contextkey_1.$Ii.and(exports.$Vtb, contextkey_1.$Ii.has(exports.$Wtb));
    function $Ytb(id, next) {
        return accessor => {
            const keybindingService = accessor.get(keybinding_1.$2D);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const keys = keybindingService.lookupKeybindings(id);
            const quickNavigate = { keybindings: keys };
            quickInputService.navigate(!!next, quickNavigate);
        };
    }
    exports.$Ytb = $Ytb;
});
//# sourceMappingURL=quickaccess.js.map