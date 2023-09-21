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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementServerService", "vs/base/common/network", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/ipc/electron-sandbox/services", "vs/platform/instantiation/common/extensions", "vs/workbench/services/extensionManagement/electron-sandbox/remoteExtensionManagementService", "vs/platform/label/common/label", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/extensionManagement/electron-sandbox/nativeExtensionManagementService", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, network_1, extensionManagement_1, remoteAgentService_1, services_1, extensions_1, remoteExtensionManagementService_1, label_1, instantiation_1, userDataProfile_1, nativeExtensionManagementService_1, lifecycle_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Y_b = void 0;
    let $Y_b = class $Y_b extends lifecycle_1.$kc {
        constructor(sharedProcessService, remoteAgentService, labelService, userDataProfilesService, userDataProfileService, instantiationService) {
            super();
            this.remoteExtensionManagementServer = null;
            this.webExtensionManagementServer = null;
            const localExtensionManagementService = this.B(instantiationService.createInstance(nativeExtensionManagementService_1.$X_b, sharedProcessService.getChannel('extensions')));
            this.localExtensionManagementServer = { extensionManagementService: localExtensionManagementService, id: 'local', label: (0, nls_1.localize)(0, null) };
            const remoteAgentConnection = remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const extensionManagementService = instantiationService.createInstance(remoteExtensionManagementService_1.$W_b, remoteAgentConnection.getChannel('extensions'), this.localExtensionManagementServer);
                this.remoteExtensionManagementServer = {
                    id: 'remote',
                    extensionManagementService,
                    get label() { return labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || (0, nls_1.localize)(1, null); },
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
    exports.$Y_b = $Y_b;
    exports.$Y_b = $Y_b = __decorate([
        __param(0, services_1.$A7b),
        __param(1, remoteAgentService_1.$jm),
        __param(2, label_1.$Vz),
        __param(3, userDataProfile_2.$Ek),
        __param(4, userDataProfile_1.$CJ),
        __param(5, instantiation_1.$Ah)
    ], $Y_b);
    (0, extensions_1.$mr)(extensionManagement_1.$fcb, $Y_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionManagementServerService.js.map