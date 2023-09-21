/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eU = exports.$dU = void 0;
    function $dU(curr) {
        return curr && curr.hasOwnProperty('folderUri');
    }
    exports.$dU = $dU;
    function $eU(curr) {
        return curr && curr.hasOwnProperty('workspace');
    }
    exports.$eU = $eU;
});
//# sourceMappingURL=backup.js.map