/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xJ = exports.$wJ = exports.$vJ = exports.$uJ = exports.$tJ = void 0;
    function $tJ(resource) {
        return resource.scheme !== network_1.Schemas.file && resource.scheme !== network_1.Schemas.vscodeRemote;
    }
    exports.$tJ = $tJ;
    function $uJ(workspace) {
        if (workspace.folders.length) {
            return workspace.folders.every(f => $tJ(f.uri)) ? workspace.folders[0].uri : undefined;
        }
        else if (workspace.configuration && $tJ(workspace.configuration)) {
            return workspace.configuration;
        }
        return undefined;
    }
    exports.$uJ = $uJ;
    function $vJ(workspace) {
        return $uJ(workspace)?.scheme;
    }
    exports.$vJ = $vJ;
    function $wJ(workspace) {
        return $uJ(workspace)?.authority;
    }
    exports.$wJ = $wJ;
    function $xJ(workspace) {
        return $uJ(workspace) !== undefined;
    }
    exports.$xJ = $xJ;
});
//# sourceMappingURL=virtualWorkspace.js.map