/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/workspace/common/workspaceTrust", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_z = exports.WorkspaceTrustUriResponse = exports.$$z = exports.$0z = exports.$9z = exports.WorkspaceTrustScope = void 0;
    var WorkspaceTrustScope;
    (function (WorkspaceTrustScope) {
        WorkspaceTrustScope[WorkspaceTrustScope["Local"] = 0] = "Local";
        WorkspaceTrustScope[WorkspaceTrustScope["Remote"] = 1] = "Remote";
    })(WorkspaceTrustScope || (exports.WorkspaceTrustScope = WorkspaceTrustScope = {}));
    function $9z(trustState) {
        if (trustState) {
            return (0, nls_1.localize)(0, null);
        }
        else {
            return (0, nls_1.localize)(1, null);
        }
    }
    exports.$9z = $9z;
    exports.$0z = (0, instantiation_1.$Bh)('workspaceTrustEnablementService');
    exports.$$z = (0, instantiation_1.$Bh)('workspaceTrustManagementService');
    var WorkspaceTrustUriResponse;
    (function (WorkspaceTrustUriResponse) {
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["Open"] = 1] = "Open";
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["OpenInNewWindow"] = 2] = "OpenInNewWindow";
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["Cancel"] = 3] = "Cancel";
    })(WorkspaceTrustUriResponse || (exports.WorkspaceTrustUriResponse = WorkspaceTrustUriResponse = {}));
    exports.$_z = (0, instantiation_1.$Bh)('workspaceTrustRequestService');
});
//# sourceMappingURL=workspaceTrust.js.map