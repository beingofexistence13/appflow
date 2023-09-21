/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/api/node/extHostTerminalService", "vs/workbench/api/node/extHostTask", "vs/workbench/api/node/extHostDebugService", "vs/workbench/api/node/extHostSearch", "vs/workbench/api/node/extHostExtensionService", "vs/workbench/api/node/extHostTunnelService", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostSearch", "vs/workbench/api/common/extHostTask", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/node/extHostStoragePaths", "vs/workbench/api/node/extHostLoggerService", "vs/platform/log/common/log", "vs/workbench/api/node/extHostVariableResolverService", "vs/workbench/api/common/extHostVariableResolverService", "vs/workbench/api/common/extHostLogService", "vs/platform/instantiation/common/descriptors", "vs/platform/sign/common/sign", "vs/platform/sign/node/signService"], function (require, exports, extensions_1, extHostTerminalService_1, extHostTask_1, extHostDebugService_1, extHostSearch_1, extHostExtensionService_1, extHostTunnelService_1, extHostDebugService_2, extHostExtensionService_2, extHostSearch_2, extHostTask_2, extHostTerminalService_2, extHostTunnelService_2, extHostStoragePaths_1, extHostStoragePaths_2, extHostLoggerService_1, log_1, extHostVariableResolverService_1, extHostVariableResolverService_2, extHostLogService_1, descriptors_1, sign_1, signService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #########################################################################
    // ###                                                                   ###
    // ### !!! PLEASE ADD COMMON IMPORTS INTO extHost.common.services.ts !!! ###
    // ###                                                                   ###
    // #########################################################################
    (0, extensions_1.$mr)(extHostExtensionService_2.$Rbc, extHostExtensionService_1.$Pdc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(log_1.$6i, extHostLoggerService_1.$Zdc, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(log_1.$5i, new descriptors_1.$yh(extHostLogService_1.$ddc, [false], true));
    (0, extensions_1.$mr)(sign_1.$Wk, signService_1.$k7b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(extHostStoragePaths_1.$Cbc, extHostStoragePaths_2.$Ydc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostDebugService_2.$pcc, extHostDebugService_1.$qdc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostSearch_2.$zcc, extHostSearch_1.$Kdc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTask_2.$kcc, extHostTask_1.$idc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTerminalService_2.$Ebc, extHostTerminalService_1.$hdc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTunnelService_2.$rsb, extHostTunnelService_1.$Xdc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostVariableResolverService_2.$ncc, extHostVariableResolverService_1.$1dc, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=extHost.node.services.js.map