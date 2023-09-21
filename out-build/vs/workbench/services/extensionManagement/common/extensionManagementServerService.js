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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/common/extensionManagementServerService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensionManagement/common/webExtensionManagementService", "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService"], function (require, exports, nls_1, extensionManagement_1, remoteAgentService_1, network_1, extensions_1, label_1, platform_1, instantiation_1, webExtensionManagementService_1, remoteExtensionManagementService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$23b = void 0;
    let $23b = class $23b {
        constructor(remoteAgentService, labelService, instantiationService) {
            this.localExtensionManagementServer = null;
            this.remoteExtensionManagementServer = null;
            this.webExtensionManagementServer = null;
            const remoteAgentConnection = remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const extensionManagementService = instantiationService.createInstance(remoteExtensionManagementService_1.$13b, remoteAgentConnection.getChannel('extensions'));
                this.remoteExtensionManagementServer = {
                    id: 'remote',
                    extensionManagementService,
                    get label() { return labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || (0, nls_1.localize)(0, null); },
                };
            }
            if (platform_1.$o) {
                const extensionManagementService = instantiationService.createInstance(webExtensionManagementService_1.$Y3b);
                this.webExtensionManagementServer = {
                    id: 'web',
                    extensionManagementService,
                    label: (0, nls_1.localize)(1, null),
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
    exports.$23b = $23b;
    exports.$23b = $23b = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, label_1.$Vz),
        __param(2, instantiation_1.$Ah)
    ], $23b);
    (0, extensions_1.$mr)(extensionManagement_1.$fcb, $23b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionManagementServerService.js.map