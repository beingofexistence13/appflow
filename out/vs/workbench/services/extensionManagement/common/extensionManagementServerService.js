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
define(["require", "exports", "vs/nls", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensionManagement/common/webExtensionManagementService", "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService"], function (require, exports, nls_1, extensionManagement_1, remoteAgentService_1, network_1, extensions_1, label_1, platform_1, instantiation_1, webExtensionManagementService_1, remoteExtensionManagementService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementServerService = void 0;
    let ExtensionManagementServerService = class ExtensionManagementServerService {
        constructor(remoteAgentService, labelService, instantiationService) {
            this.localExtensionManagementServer = null;
            this.remoteExtensionManagementServer = null;
            this.webExtensionManagementServer = null;
            const remoteAgentConnection = remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const extensionManagementService = instantiationService.createInstance(remoteExtensionManagementService_1.RemoteExtensionManagementService, remoteAgentConnection.getChannel('extensions'));
                this.remoteExtensionManagementServer = {
                    id: 'remote',
                    extensionManagementService,
                    get label() { return labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || (0, nls_1.localize)('remote', "Remote"); },
                };
            }
            if (platform_1.isWeb) {
                const extensionManagementService = instantiationService.createInstance(webExtensionManagementService_1.WebExtensionManagementService);
                this.webExtensionManagementServer = {
                    id: 'web',
                    extensionManagementService,
                    label: (0, nls_1.localize)('browser', "Browser"),
                };
            }
        }
        getExtensionManagementServer(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this.remoteExtensionManagementServer;
            }
            if (this.webExtensionManagementServer) {
                return this.webExtensionManagementServer;
            }
            throw new Error(`Invalid Extension ${extension.location}`);
        }
        getExtensionInstallLocation(extension) {
            const server = this.getExtensionManagementServer(extension);
            return server === this.remoteExtensionManagementServer ? 2 /* ExtensionInstallLocation.Remote */ : 3 /* ExtensionInstallLocation.Web */;
        }
    };
    exports.ExtensionManagementServerService = ExtensionManagementServerService;
    exports.ExtensionManagementServerService = ExtensionManagementServerService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, label_1.ILabelService),
        __param(2, instantiation_1.IInstantiationService)
    ], ExtensionManagementServerService);
    (0, extensions_1.registerSingleton)(extensionManagement_1.IExtensionManagementServerService, ExtensionManagementServerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZXpGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWdDO1FBUTVDLFlBQ3NCLGtCQUF1QyxFQUM3QyxZQUEyQixFQUNuQixvQkFBMkM7WUFQMUQsbUNBQThCLEdBQXNDLElBQUksQ0FBQztZQUN6RSxvQ0FBK0IsR0FBc0MsSUFBSSxDQUFDO1lBQzFFLGlDQUE0QixHQUFzQyxJQUFJLENBQUM7WUFPL0UsTUFBTSxxQkFBcUIsR0FBRyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNqRSxJQUFJLHFCQUFxQixFQUFFO2dCQUMxQixNQUFNLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtRUFBZ0MsRUFBRSxxQkFBcUIsQ0FBQyxVQUFVLENBQVcsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbkssSUFBSSxDQUFDLCtCQUErQixHQUFHO29CQUN0QyxFQUFFLEVBQUUsUUFBUTtvQkFDWiwwQkFBMEI7b0JBQzFCLElBQUksS0FBSyxLQUFLLE9BQU8sWUFBWSxDQUFDLFlBQVksQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxxQkFBc0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvSSxDQUFDO2FBQ0Y7WUFDRCxJQUFJLGdCQUFLLEVBQUU7Z0JBQ1YsTUFBTSwwQkFBMEIsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNkRBQTZCLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxDQUFDLDRCQUE0QixHQUFHO29CQUNuQyxFQUFFLEVBQUUsS0FBSztvQkFDVCwwQkFBMEI7b0JBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO2lCQUNyQyxDQUFDO2FBQ0Y7UUFDRixDQUFDO1FBRUQsNEJBQTRCLENBQUMsU0FBcUI7WUFDakQsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksRUFBRTtnQkFDdkQsT0FBTyxJQUFJLENBQUMsK0JBQWdDLENBQUM7YUFDN0M7WUFDRCxJQUFJLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtnQkFDdEMsT0FBTyxJQUFJLENBQUMsNEJBQTRCLENBQUM7YUFDekM7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsMkJBQTJCLENBQUMsU0FBcUI7WUFDaEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLHlDQUFpQyxDQUFDLHFDQUE2QixDQUFDO1FBQ3pILENBQUM7S0FDRCxDQUFBO0lBOUNZLDRFQUFnQzsrQ0FBaEMsZ0NBQWdDO1FBUzFDLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxxQ0FBcUIsQ0FBQTtPQVhYLGdDQUFnQyxDQThDNUM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLHVEQUFpQyxFQUFFLGdDQUFnQyxvQ0FBNEIsQ0FBQyJ9