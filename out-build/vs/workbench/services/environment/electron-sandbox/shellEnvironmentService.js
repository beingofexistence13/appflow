/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/instantiation/common/extensions"], function (require, exports, instantiation_1, globals_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L_b = exports.$K_b = void 0;
    exports.$K_b = (0, instantiation_1.$Bh)('shellEnvironmentService');
    class $L_b {
        getShellEnv() {
            return globals_1.$P.shellEnv();
        }
    }
    exports.$L_b = $L_b;
    (0, extensions_1.$mr)(exports.$K_b, $L_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=shellEnvironmentService.js.map