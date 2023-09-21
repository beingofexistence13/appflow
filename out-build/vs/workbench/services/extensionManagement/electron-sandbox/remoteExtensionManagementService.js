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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/log/common/log", "vs/base/common/errorMessage", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/nls!vs/workbench/services/extensionManagement/electron-sandbox/remoteExtensionManagementService", "vs/platform/product/common/productService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/files/common/files", "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, extensionManagement_1, extensionManagementUtil_1, log_1, errorMessage_1, arrays_1, cancellation_1, nls_1, productService_1, configuration_1, async_1, extensionManifestPropertiesService_1, files_1, remoteExtensionManagementService_1, userDataProfile_1, userDataProfile_2, remoteUserDataProfiles_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$W_b = void 0;
    let $W_b = class $W_b extends remoteExtensionManagementService_1.$13b {
        constructor(channel, M, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService, N, P, Q, R, S, U) {
            super(channel, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService);
            this.M = M;
            this.N = N;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
        }
        async install(vsix, options) {
            const local = await super.install(vsix, options);
            await this.$(local);
            return local;
        }
        async installFromGallery(extension, installOptions) {
            const local = await this.W(extension, installOptions);
            await this.$(local);
            return local;
        }
        async W(extension, installOptions) {
            if (this.Q.getValue('remote.downloadExtensionsLocally')) {
                return this.X(extension, installOptions || {});
            }
            try {
                return await super.installFromGallery(extension, installOptions);
            }
            catch (error) {
                switch (error.name) {
                    case extensionManagement_1.ExtensionManagementErrorCode.Download:
                    case extensionManagement_1.ExtensionManagementErrorCode.Internal:
                        try {
                            this.N.error(`Error while installing '${extension.identifier.id}' extension in the remote server.`, (0, errorMessage_1.$mi)(error));
                            return await this.X(extension, installOptions || {});
                        }
                        catch (e) {
                            this.N.error(e);
                            throw e;
                        }
                    default:
                        this.N.debug('Remote Install Error Name', error.name);
                        throw error;
                }
            }
        }
        async X(extension, installOptions) {
            this.N.info(`Downloading the '${extension.identifier.id}' extension locally and install`);
            const compatible = await this.Z(extension, !!installOptions.installPreReleaseVersion);
            installOptions = { ...installOptions, donotIncludePackAndDependencies: true };
            const installed = await this.getInstalled(1 /* ExtensionType.User */);
            const workspaceExtensions = await this.bb(compatible, cancellation_1.CancellationToken.None);
            if (workspaceExtensions.length) {
                this.N.info(`Downloading the workspace dependencies and packed extensions of '${compatible.identifier.id}' locally and install`);
                for (const workspaceExtension of workspaceExtensions) {
                    await this.Y(workspaceExtension, installed, installOptions);
                }
            }
            return await this.Y(compatible, installed, installOptions);
        }
        async Y(extension, installed, installOptions) {
            const compatible = await this.Z(extension, !!installOptions.installPreReleaseVersion);
            this.N.trace('Downloading extension:', compatible.identifier.id);
            const location = await this.M.extensionManagementService.download(compatible, installed.filter(i => (0, extensionManagementUtil_1.$po)(i.identifier, compatible.identifier))[0] ? 3 /* InstallOperation.Update */ : 2 /* InstallOperation.Install */, !!installOptions.donotVerifySignature);
            this.N.info('Downloaded extension:', compatible.identifier.id, location.path);
            try {
                const local = await super.install(location, installOptions);
                this.N.info(`Successfully installed '${compatible.identifier.id}' extension`);
                return local;
            }
            finally {
                try {
                    await this.S.del(location);
                }
                catch (error) {
                    this.N.error(error);
                }
            }
        }
        async Z(extension, includePreRelease) {
            const targetPlatform = await this.getTargetPlatform();
            let compatibleExtension = null;
            if (extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
                compatibleExtension = (await this.P.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
            }
            if (!compatibleExtension && await this.P.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                compatibleExtension = extension;
            }
            if (!compatibleExtension) {
                compatibleExtension = await this.P.getCompatibleExtension(extension, includePreRelease, targetPlatform);
            }
            if (!compatibleExtension) {
                /** If no compatible release version is found, check if the extension has a release version or not and throw relevant error */
                if (!includePreRelease && extension.properties.isPreReleaseVersion && (await this.P.getExtensions([extension.identifier], cancellation_1.CancellationToken.None))[0]) {
                    throw new extensionManagement_1.$1n((0, nls_1.localize)(0, null, extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound);
                }
                throw new extensionManagement_1.$1n((0, nls_1.localize)(1, null, extension.identifier.id, this.R.nameLong, this.R.version), extensionManagement_1.ExtensionManagementErrorCode.Incompatible);
            }
            return compatibleExtension;
        }
        async $(local) {
            const uiExtensions = await this.ab(local.manifest, cancellation_1.CancellationToken.None);
            const installed = await this.M.extensionManagementService.getInstalled();
            const toInstall = uiExtensions.filter(e => installed.every(i => !(0, extensionManagementUtil_1.$po)(i.identifier, e.identifier)));
            if (toInstall.length) {
                this.N.info(`Installing UI dependencies and packed extensions of '${local.identifier.id}' locally`);
                await async_1.Promises.settled(toInstall.map(d => this.M.extensionManagementService.installFromGallery(d)));
            }
        }
        async ab(manifest, token) {
            const result = new Map();
            const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
            await this.cb(extensions, result, true, token);
            return [...result.values()];
        }
        async bb(extension, token) {
            const result = new Map();
            result.set(extension.identifier.id.toLowerCase(), extension);
            const manifest = await this.P.getManifest(extension, token);
            if (manifest) {
                const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
                await this.cb(extensions, result, false, token);
            }
            result.delete(extension.identifier.id);
            return [...result.values()];
        }
        async cb(toGet, result, uiExtension, token) {
            if (toGet.length === 0) {
                return Promise.resolve();
            }
            const extensions = await this.P.getExtensions(toGet.map(id => ({ id })), token);
            const manifests = await Promise.all(extensions.map(e => this.P.getManifest(e, token)));
            const extensionsManifests = [];
            for (let idx = 0; idx < extensions.length; idx++) {
                const extension = extensions[idx];
                const manifest = manifests[idx];
                if (manifest && this.U.prefersExecuteOnUI(manifest) === uiExtension) {
                    result.set(extension.identifier.id.toLowerCase(), extension);
                    extensionsManifests.push(manifest);
                }
            }
            toGet = [];
            for (const extensionManifest of extensionsManifests) {
                if ((0, arrays_1.$Jb)(extensionManifest.extensionDependencies)) {
                    for (const id of extensionManifest.extensionDependencies) {
                        if (!result.has(id.toLowerCase())) {
                            toGet.push(id);
                        }
                    }
                }
                if ((0, arrays_1.$Jb)(extensionManifest.extensionPack)) {
                    for (const id of extensionManifest.extensionPack) {
                        if (!result.has(id.toLowerCase())) {
                            toGet.push(id);
                        }
                    }
                }
            }
            return this.cb(toGet, result, uiExtension, token);
        }
    };
    exports.$W_b = $W_b;
    exports.$W_b = $W_b = __decorate([
        __param(2, userDataProfile_2.$CJ),
        __param(3, userDataProfile_1.$Ek),
        __param(4, remoteUserDataProfiles_1.$uAb),
        __param(5, uriIdentity_1.$Ck),
        __param(6, log_1.$5i),
        __param(7, extensionManagement_1.$Zn),
        __param(8, configuration_1.$8h),
        __param(9, productService_1.$kj),
        __param(10, files_1.$6j),
        __param(11, extensionManifestPropertiesService_1.$vcb)
    ], $W_b);
});
//# sourceMappingURL=remoteExtensionManagementService.js.map