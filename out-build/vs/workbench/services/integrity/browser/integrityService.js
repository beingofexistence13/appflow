/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/integrity/common/integrity", "vs/platform/instantiation/common/extensions"], function (require, exports, integrity_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c3b = void 0;
    class $c3b {
        async isPure() {
            return { isPure: true, proof: [] };
        }
    }
    exports.$c3b = $c3b;
    (0, extensions_1.$mr)(integrity_1.$b3b, $c3b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=integrityService.js.map