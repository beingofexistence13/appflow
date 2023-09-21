/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostLogService", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/worker/extHostExtensionService"], function (require, exports, descriptors_1, extensions_1, log_1, extHostExtensionService_1, extHostLogService_1, extHostStoragePaths_1, extHostExtensionService_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #########################################################################
    // ###                                                                   ###
    // ### !!! PLEASE ADD COMMON IMPORTS INTO extHost.common.services.ts !!! ###
    // ###                                                                   ###
    // #########################################################################
    (0, extensions_1.$mr)(log_1.$5i, new descriptors_1.$yh(extHostLogService_1.$ddc, [true], true));
    (0, extensions_1.$mr)(extHostExtensionService_1.$Rbc, extHostExtensionService_2.$kfc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostStoragePaths_1.$Cbc, extHostStoragePaths_1.$Dbc, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=extHost.worker.services.js.map