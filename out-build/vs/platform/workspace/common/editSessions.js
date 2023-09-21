/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionIdentityMatch = exports.$8z = void 0;
    exports.$8z = (0, instantiation_1.$Bh)('editSessionIdentityService');
    var EditSessionIdentityMatch;
    (function (EditSessionIdentityMatch) {
        EditSessionIdentityMatch[EditSessionIdentityMatch["Complete"] = 100] = "Complete";
        EditSessionIdentityMatch[EditSessionIdentityMatch["Partial"] = 50] = "Partial";
        EditSessionIdentityMatch[EditSessionIdentityMatch["None"] = 0] = "None";
    })(EditSessionIdentityMatch || (exports.EditSessionIdentityMatch = EditSessionIdentityMatch = {}));
});
//# sourceMappingURL=editSessions.js.map