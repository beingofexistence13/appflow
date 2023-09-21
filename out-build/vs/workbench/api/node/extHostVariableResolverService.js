/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/workbench/api/common/extHostVariableResolverService"], function (require, exports, os_1, extHostVariableResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1dc = void 0;
    class $1dc extends extHostVariableResolverService_1.$occ {
        m() {
            return (0, os_1.homedir)();
        }
    }
    exports.$1dc = $1dc;
});
//# sourceMappingURL=extHostVariableResolverService.js.map