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
define(["require", "exports", "vs/base/common/uuid", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagementService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/platform/download/common/download", "vs/platform/product/common/productService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/common/resources", "vs/platform/userDataSync/common/userDataSync", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, uuid_1, extensionManagement_1, extensionManagementService_1, extensions_1, extensionManagement_2, network_1, configuration_1, download_1, productService_1, environmentService_1, resources_1, userDataSync_1, dialogs_1, workspaceTrust_1, extensionManifestPropertiesService_1, instantiation_1, files_1, log_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementService = void 0;
    let ExtensionManagementService = class ExtensionManagementService extends extensionManagementService_1.ExtensionManagementService {
        constructor(environmentService, extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService) {
            super(extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService);
            this.environmentService = environmentService;
        }
        async installVSIXInServer(vsix, server, options) {
            if (vsix.scheme === network_1.Schemas.vscodeRemote && server === this.extensionManagementServerService.localExtensionManagementServer) {
                const downloadedLocation = (0, resources_1.joinPath)(this.environmentService.tmpDir, (0, uuid_1.generateUuid)());
                await this.downloadService.download(vsix, downloadedLocation);
                vsix = downloadedLocation;
            }
            return super.installVSIXInServer(vsix, server, options);
        }
    };
    exports.ExtensionManagementService = ExtensionManagementService;
    exports.ExtensionManagementService = ExtensionManagementService = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, userDataProfile_1.IUserDataProfileService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, productService_1.IProductService),
        __param(6, download_1.IDownloadService),
        __param(7, userDataSync_1.IUserDataSyncEnablementService),
        __param(8, dialogs_1.IDialogService),
        __param(9, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(10, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(11, files_1.IFileService),
        __param(12, log_1.ILogService),
        __param(13, instantiation_1.IInstantiationService)
    ], ExtensionManagementService);
    (0, extensions_1.registerSingleton)(extensionManagement_2.IWorkbenchExtensionManagementService, ExtensionManagementService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9lbGVjdHJvbi1zYW5kYm94L2V4dGVuc2lvbk1hbmFnZW1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSx1REFBOEI7UUFFN0UsWUFDc0Qsa0JBQXNELEVBQ3hFLGdDQUFtRSxFQUM1RSx1QkFBaUQsRUFDbEQsc0JBQStDLEVBQ2pELG9CQUEyQyxFQUNqRCxjQUErQixFQUM5QixlQUFpQyxFQUNuQiw2QkFBNkQsRUFDN0UsYUFBNkIsRUFDZCw0QkFBMkQsRUFDckQsa0NBQXVFLEVBQzlGLFdBQXlCLEVBQzFCLFVBQXVCLEVBQ2Isb0JBQTJDO1lBRWxFLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSx1QkFBdUIsRUFBRSxzQkFBc0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLDZCQUE2QixFQUFFLGFBQWEsRUFBRSw0QkFBNEIsRUFBRSxrQ0FBa0MsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFmMVAsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQztRQWdCNUcsQ0FBQztRQUVrQixLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBUyxFQUFFLE1BQWtDLEVBQUUsT0FBdUM7WUFDbEksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsWUFBWSxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsOEJBQThCLEVBQUU7Z0JBQzVILE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxvQkFBUSxFQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBQSxtQkFBWSxHQUFFLENBQUMsQ0FBQztnQkFDcEYsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxHQUFHLGtCQUFrQixDQUFDO2FBQzFCO1lBQ0QsT0FBTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6RCxDQUFDO0tBQ0QsQ0FBQTtJQTdCWSxnRUFBMEI7eUNBQTFCLDBCQUEwQjtRQUdwQyxXQUFBLHVEQUFrQyxDQUFBO1FBQ2xDLFdBQUEsdURBQWlDLENBQUE7UUFDakMsV0FBQSw4Q0FBd0IsQ0FBQTtRQUN4QixXQUFBLHlDQUF1QixDQUFBO1FBQ3ZCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxnQ0FBZSxDQUFBO1FBQ2YsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLDZDQUE4QixDQUFBO1FBQzlCLFdBQUEsd0JBQWMsQ0FBQTtRQUNkLFdBQUEsOENBQTZCLENBQUE7UUFDN0IsWUFBQSx3RUFBbUMsQ0FBQTtRQUNuQyxZQUFBLG9CQUFZLENBQUE7UUFDWixZQUFBLGlCQUFXLENBQUE7UUFDWCxZQUFBLHFDQUFxQixDQUFBO09BaEJYLDBCQUEwQixDQTZCdEM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLDBEQUFvQyxFQUFFLDBCQUEwQixvQ0FBNEIsQ0FBQyJ9