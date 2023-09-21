/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/api/common/extHostOutput", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/api/common/extHostDecorations", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTask", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostSearch", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/api/common/extHostWindow", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostSecretState", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostLoggerService", "vs/platform/log/common/log", "vs/workbench/api/common/extHostVariableResolverService", "vs/workbench/api/common/extHostLocalizationService", "vs/workbench/api/common/extHostManagedSockets"], function (require, exports, extensions_1, extHostOutput_1, extHostWorkspace_1, extHostDecorations_1, extHostConfiguration_1, extHostCommands_1, extHostDocumentsAndEditors_1, extHostTerminalService_1, extHostTask_1, extHostDebugService_1, extHostSearch_1, extHostStorage_1, extHostTunnelService_1, extHostApiDeprecationService_1, extHostWindow_1, extHostFileSystemConsumer_1, extHostFileSystemInfo_1, extHostSecretState_1, extHostTelemetry_1, extHostEditorTabs_1, extHostLoggerService_1, log_1, extHostVariableResolverService_1, extHostLocalizationService_1, extHostManagedSockets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(extHostLocalizationService_1.$Mbc, extHostLocalizationService_1.$Lbc, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(log_1.$6i, extHostLoggerService_1.$bdc, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(extHostApiDeprecationService_1.$_ac, extHostApiDeprecationService_1.$abc, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(extHostCommands_1.$lM, extHostCommands_1.$kM, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostConfiguration_1.$mbc, extHostConfiguration_1.$kbc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostFileSystemConsumer_1.$Bbc, extHostFileSystemConsumer_1.$Abc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostDebugService_1.$pcc, extHostDebugService_1.$tcc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostDecorations_1.$hcc, extHostDecorations_1.$gcc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostDocumentsAndEditors_1.$aM, extHostDocumentsAndEditors_1.$_L, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostManagedSockets_1.$Nbc, extHostManagedSockets_1.$Obc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostFileSystemInfo_1.$9ac, extHostFileSystemInfo_1.$8ac, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostOutput_1.$Zbc, extHostOutput_1.$Ybc, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(extHostSearch_1.$zcc, extHostSearch_1.$Acc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostStorage_1.$xbc, extHostStorage_1.$wbc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTask_1.$kcc, extHostTask_1.$jcc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTerminalService_1.$Ebc, extHostTerminalService_1.$Hbc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTunnelService_1.$rsb, extHostTunnelService_1.$ssb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostWindow_1.$dcc, extHostWindow_1.$ccc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostWorkspace_1.$jbc, extHostWorkspace_1.$ibc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostSecretState_1.$Jbc, extHostSecretState_1.$Ibc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostTelemetry_1.$jM, extHostTelemetry_1.$gM, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostEditorTabs_1.$lcc, extHostEditorTabs_1.$mcc, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extHostVariableResolverService_1.$ncc, extHostVariableResolverService_1.$occ, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=extHost.common.services.js.map