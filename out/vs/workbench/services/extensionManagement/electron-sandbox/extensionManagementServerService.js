/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/network", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/ipc/electron-sandbox/services", "vs/platform/instantiation/common/extensions", "vs/workbench/services/extensionManagement/electron-sandbox/remoteExtensionManagementService", "vs/platform/label/common/label", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/extensionManagement/electron-sandbox/nativeExtensionManagementService", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, network_1, extensionManagement_1, remoteAgentService_1, services_1, extensions_1, remoteExtensionManagementService_1, label_1, instantiation_1, userDataProfile_1, nativeExtensionManagementService_1, lifecycle_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementServerService = void 0;
    let ExtensionManagementServerService = class ExtensionManagementServerService extends lifecycle_1.Disposable {
        constructor(sharedProcessService, remoteAgentService, labelService, userDataProfilesService, userDataProfileService, instantiationService) {
            super();
            this.remoteExtensionManagementServer = null;
            this.webExtensionManagementServer = null;
            const localExtensionManagementService = this._register(instantiationService.createInstance(nativeExtensionManagementService_1.NativeExtensionManagementService, sharedProcessService.getChannel('extensions')));
            this.localExtensionManagementServer = { extensionManagementService: localExtensionManagementService, id: 'local', label: (0, nls_1.localize)('local', "Local") };
            const remoteAgentConnection = remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const extensionManagementService = instantiationService.createInstance(remoteExtensionManagementService_1.NativeRemoteExtensionManagementService, remoteAgentConnection.getChannel('extensions'), this.localExtensionManagementServer);
                this.remoteExtensionManagementServer = {
                    id: 'remote',
                    extensionManagementService,
                    get label() { return labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || (0, nls_1.localize)('remote', "Remote"); },
                };
            }
        }
        getExtensionManagementServer(extension) {
            if (extension.location.scheme === network_1.Schemas.file) {
                return this.localExtensionManagementServer;
            }
            if (this.remoteExtensionManagementServer && extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this.remoteExtensionManagementServer;
            }
            throw new Error(`Invalid Extension ${extension.location}`);
        }
        getExtensionInstallLocation(extension) {
            const server = this.getExtensionManagementServer(extension);
            return server === this.remoteExtensionManagementServer ? 2 /* ExtensionInstallLocation.Remote */ : 1 /* ExtensionInstallLocation.Local */;
        }
    };
    exports.ExtensionManagementServerService = ExtensionManagementServerService;
    exports.ExtensionManagementServerService = ExtensionManagementServerService = __decorate([
        __param(0, services_1.ISharedProcessService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, label_1.ILabelService),
        __param(3, userDataProfile_2.IUserDataProfilesService),
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, instantiation_1.IInstantiationService)
    ], ExtensionManagementServerService);
    (0, extensions_1.registerSingleton)(extensionManagement_1.IExtensionManagementServerService, ExtensionManagementServerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9lbGVjdHJvbi1zYW5kYm94L2V4dGVuc2lvbk1hbmFnZW1lbnRTZXJ2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCekYsSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FBaUMsU0FBUSxzQkFBVTtRQVEvRCxZQUN3QixvQkFBMkMsRUFDN0Msa0JBQXVDLEVBQzdDLFlBQTJCLEVBQ2hCLHVCQUFpRCxFQUNsRCxzQkFBK0MsRUFDakQsb0JBQTJDO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBWEEsb0NBQStCLEdBQXNDLElBQUksQ0FBQztZQUMxRSxpQ0FBNEIsR0FBc0MsSUFBSSxDQUFDO1lBVy9FLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbUVBQWdDLEVBQUUsb0JBQW9CLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3SyxJQUFJLENBQUMsOEJBQThCLEdBQUcsRUFBRSwwQkFBMEIsRUFBRSwrQkFBK0IsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN0SixNQUFNLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pFLElBQUkscUJBQXFCLEVBQUU7Z0JBQzFCLE1BQU0sMEJBQTBCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHlFQUFzQyxFQUFFLHFCQUFxQixDQUFDLFVBQVUsQ0FBVyxZQUFZLENBQUMsRUFBRSxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDOU0sSUFBSSxDQUFDLCtCQUErQixHQUFHO29CQUN0QyxFQUFFLEVBQUUsUUFBUTtvQkFDWiwwQkFBMEI7b0JBQzFCLElBQUksS0FBSyxLQUFLLE9BQU8sWUFBWSxDQUFDLFlBQVksQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxxQkFBc0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvSSxDQUFDO2FBQ0Y7UUFFRixDQUFDO1FBRUQsNEJBQTRCLENBQUMsU0FBcUI7WUFDakQsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksRUFBRTtnQkFDL0MsT0FBTyxJQUFJLENBQUMsOEJBQThCLENBQUM7YUFDM0M7WUFDRCxJQUFJLElBQUksQ0FBQywrQkFBK0IsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksRUFBRTtnQkFDL0YsT0FBTyxJQUFJLENBQUMsK0JBQStCLENBQUM7YUFDNUM7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsMkJBQTJCLENBQUMsU0FBcUI7WUFDaEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLHlDQUFpQyxDQUFDLHVDQUErQixDQUFDO1FBQzNILENBQUM7S0FDRCxDQUFBO0lBN0NZLDRFQUFnQzsrQ0FBaEMsZ0NBQWdDO1FBUzFDLFdBQUEsZ0NBQXFCLENBQUE7UUFDckIsV0FBQSx3Q0FBbUIsQ0FBQTtRQUNuQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDBDQUF3QixDQUFBO1FBQ3hCLFdBQUEseUNBQXVCLENBQUE7UUFDdkIsV0FBQSxxQ0FBcUIsQ0FBQTtPQWRYLGdDQUFnQyxDQTZDNUM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLHVEQUFpQyxFQUFFLGdDQUFnQyxvQ0FBNEIsQ0FBQyJ9