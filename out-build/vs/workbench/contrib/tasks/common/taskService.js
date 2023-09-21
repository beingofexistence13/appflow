/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/taskService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, instantiation_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$osb = exports.$nsb = exports.$msb = exports.$lsb = exports.$ksb = exports.$jsb = exports.$isb = void 0;
    exports.$isb = new contextkey_1.$2i('customExecutionSupported', false, nls.localize(0, null));
    exports.$jsb = new contextkey_1.$2i('shellExecutionSupported', false, nls.localize(1, null));
    exports.$ksb = new contextkey_1.$2i('taskCommandsRegistered', false, nls.localize(2, null));
    exports.$lsb = new contextkey_1.$2i('processExecutionSupported', false, nls.localize(3, null));
    exports.$msb = new contextkey_1.$2i('serverlessWebContext', false, nls.localize(4, null));
    exports.$nsb = contextkey_1.$Ii.or(contextkey_1.$Ii.and(exports.$jsb, exports.$lsb), exports.$isb);
    exports.$osb = (0, instantiation_1.$Bh)('taskService');
});
//# sourceMappingURL=taskService.js.map