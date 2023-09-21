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
    (0, extensions_1.registerSingleton)(log_1.ILogService, new descriptors_1.SyncDescriptor(extHostLogService_1.ExtHostLogService, [true], true));
    (0, extensions_1.registerSingleton)(extHostExtensionService_1.IExtHostExtensionService, extHostExtensionService_2.ExtHostExtensionService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(extHostStoragePaths_1.IExtensionStoragePaths, extHostStoragePaths_1.ExtensionStoragePaths, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdC53b3JrZXIuc2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3dvcmtlci9leHRIb3N0Lndvcmtlci5zZXJ2aWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyw0RUFBNEU7SUFDNUUsNEVBQTRFO0lBQzVFLDRFQUE0RTtJQUM1RSw0RUFBNEU7SUFDNUUsNEVBQTRFO0lBRTVFLElBQUEsOEJBQWlCLEVBQUMsaUJBQVcsRUFBRSxJQUFJLDRCQUFjLENBQUMscUNBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLElBQUEsOEJBQWlCLEVBQUMsa0RBQXdCLEVBQUUsaURBQXVCLGtDQUEwQixDQUFDO0lBQzlGLElBQUEsOEJBQWlCLEVBQUMsNENBQXNCLEVBQUUsMkNBQXFCLGtDQUEwQixDQUFDIn0=