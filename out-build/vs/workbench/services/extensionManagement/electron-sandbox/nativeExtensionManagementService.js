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
define(["require", "exports", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/resources", "vs/base/common/network", "vs/platform/log/common/log", "vs/platform/download/common/download", "vs/platform/files/common/files", "vs/base/common/uuid", "vs/workbench/services/extensionManagement/common/extensionManagementChannelClient", "vs/platform/extensions/common/extensions", "vs/workbench/services/environment/electron-sandbox/environmentService"], function (require, exports, uriIdentity_1, userDataProfile_1, resources_1, network_1, log_1, download_1, files_1, uuid_1, extensionManagementChannelClient_1, extensions_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X_b = void 0;
    let $X_b = class $X_b extends extensionManagementChannelClient_1.$Z3b {
        constructor(channel, userDataProfileService, uriIdentityService, G, H, I, J) {
            super(channel, userDataProfileService, uriIdentityService);
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
        }
        F({ profileLocation, applicationScoped }) {
            return applicationScoped || this.w.extUri.isEqual(this.u.currentProfile.extensionsResource, profileLocation);
        }
        async install(vsix, options) {
            const { location, cleanup } = await this.M(vsix);
            try {
                return await super.install(location, options);
            }
            finally {
                await cleanup();
            }
        }
        async M(vsix) {
            if (vsix.scheme === network_1.Schemas.file) {
                return { location: vsix, async cleanup() { } };
            }
            this.J.trace('Downloading extension from', vsix.toString());
            const location = (0, resources_1.$ig)(this.I.extensionsDownloadLocation, (0, uuid_1.$4f)());
            await this.H.download(vsix, location);
            this.J.info('Downloaded extension to', location.toString());
            const cleanup = async () => {
                try {
                    await this.G.del(location);
                }
                catch (error) {
                    this.J.error(error);
                }
            };
            return { location, cleanup };
        }
        async C(previousProfileLocation, currentProfileLocation, preserveExtensions) {
            if (this.I.remoteAuthority) {
                const previousInstalledExtensions = await this.getInstalled(1 /* ExtensionType.User */, previousProfileLocation);
                const resolverExtension = previousInstalledExtensions.find(e => (0, extensions_1.$2l)(e.manifest, this.I.remoteAuthority));
                if (resolverExtension) {
                    if (!preserveExtensions) {
                        preserveExtensions = [];
                    }
                    preserveExtensions.push(new extensions_1.$Vl(resolverExtension.identifier.id));
                }
            }
            return super.C(previousProfileLocation, currentProfileLocation, preserveExtensions);
        }
    };
    exports.$X_b = $X_b;
    exports.$X_b = $X_b = __decorate([
        __param(1, userDataProfile_1.$CJ),
        __param(2, uriIdentity_1.$Ck),
        __param(3, files_1.$6j),
        __param(4, download_1.$Dn),
        __param(5, environmentService_1.$1$b),
        __param(6, log_1.$5i)
    ], $X_b);
});
//# sourceMappingURL=nativeExtensionManagementService.js.map