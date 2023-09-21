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
    exports.$R_b = void 0;
    let $R_b = class $R_b extends extensionManagementService_1.$E4b {
        constructor(Q, extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService) {
            super(extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService);
            this.Q = Q;
        }
        async G(vsix, server, options) {
            if (vsix.scheme === network_1.Schemas.vscodeRemote && server === this.b.localExtensionManagementServer) {
                const downloadedLocation = (0, resources_1.$ig)(this.Q.tmpDir, (0, uuid_1.$4f)());
                await this.j.download(vsix, downloadedLocation);
                vsix = downloadedLocation;
            }
            return super.G(vsix, server, options);
        }
    };
    exports.$R_b = $R_b;
    exports.$R_b = $R_b = __decorate([
        __param(0, environmentService_1.$1$b),
        __param(1, extensionManagement_2.$fcb),
        __param(2, extensionManagement_1.$Zn),
        __param(3, userDataProfile_1.$CJ),
        __param(4, configuration_1.$8h),
        __param(5, productService_1.$kj),
        __param(6, download_1.$Dn),
        __param(7, userDataSync_1.$Pgb),
        __param(8, dialogs_1.$oA),
        __param(9, workspaceTrust_1.$_z),
        __param(10, extensionManifestPropertiesService_1.$vcb),
        __param(11, files_1.$6j),
        __param(12, log_1.$5i),
        __param(13, instantiation_1.$Ah)
    ], $R_b);
    (0, extensions_1.$mr)(extensionManagement_2.$hcb, $R_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionManagementService.js.map