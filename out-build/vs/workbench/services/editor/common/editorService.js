/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, instantiation_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_C = exports.$$C = exports.$0C = exports.$9C = void 0;
    exports.$9C = (0, instantiation_1.$Bh)('editorService');
    /**
     * Open an editor in the currently active group.
     */
    exports.$0C = -1;
    /**
     * Open an editor to the side of the active group.
     */
    exports.$$C = -2;
    function $_C(obj) {
        const candidate = obj;
        return typeof obj === 'number' || (0, editorGroupsService_1.$7C)(candidate);
    }
    exports.$_C = $_C;
});
//# sourceMappingURL=editorService.js.map