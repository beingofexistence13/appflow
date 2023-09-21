/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/workspace/common/workspace", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YPb = exports.$XPb = void 0;
    /**
     * Trust Context Keys
     */
    exports.$XPb = {
        IsEnabled: new contextkey_1.$2i('isWorkspaceTrustEnabled', false, (0, nls_1.localize)(0, null)),
        IsTrusted: new contextkey_1.$2i('isWorkspaceTrusted', false, (0, nls_1.localize)(1, null))
    };
    exports.$YPb = 'workbench.trust.manage';
});
//# sourceMappingURL=workspace.js.map