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
define(["require", "exports", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteExtensionsScanner", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles", "vs/workbench/services/environment/common/environmentService", "vs/platform/log/common/log", "vs/platform/instantiation/common/extensions", "vs/workbench/services/localization/common/locale"], function (require, exports, remoteAgentService_1, remoteExtensionsScanner_1, platform, uri_1, userDataProfile_1, remoteUserDataProfiles_1, environmentService_1, log_1, extensions_1, locale_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let RemoteExtensionsScannerService = class RemoteExtensionsScannerService {
        constructor(a, b, c, d, e, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
        }
        whenExtensionsReady() {
            return this.g(channel => channel.call('whenExtensionsReady'), undefined);
        }
        async scanExtensions() {
            try {
                const languagePack = await this.f.getExtensionIdProvidingCurrentLocale();
                return await this.g(async (channel) => {
                    const profileLocation = this.c.currentProfile.isDefault ? undefined : (await this.d.getRemoteProfile(this.c.currentProfile)).extensionsResource;
                    const scannedExtensions = await channel.call('scanExtensions', [platform.$v, profileLocation, this.b.extensionDevelopmentLocationURI, languagePack]);
                    scannedExtensions.forEach((extension) => {
                        extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation);
                    });
                    return scannedExtensions;
                }, []);
            }
            catch (error) {
                this.e.error(error);
                return [];
            }
        }
        async scanSingleExtension(extensionLocation, isBuiltin) {
            try {
                return await this.g(async (channel) => {
                    const extension = await channel.call('scanSingleExtension', [extensionLocation, isBuiltin, platform.$v]);
                    if (extension !== null) {
                        extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation);
                        // ImplicitActivationEvents.updateManifest(extension);
                    }
                    return extension;
                }, null);
            }
            catch (error) {
                this.e.error(error);
                return null;
            }
        }
        g(callback, fallback) {
            const connection = this.a.getConnection();
            if (!connection) {
                return Promise.resolve(fallback);
            }
            return connection.withChannel(remoteExtensionsScanner_1.$pN, (channel) => callback(channel));
        }
    };
    RemoteExtensionsScannerService = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, environmentService_1.$hJ),
        __param(2, userDataProfile_1.$CJ),
        __param(3, remoteUserDataProfiles_1.$uAb),
        __param(4, log_1.$5i),
        __param(5, locale_1.$lhb)
    ], RemoteExtensionsScannerService);
    (0, extensions_1.$mr)(remoteExtensionsScanner_1.$oN, RemoteExtensionsScannerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=remoteExtensionsScanner.js.map