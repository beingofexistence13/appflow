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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/log/common/log", "vs/base/common/errorMessage", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/nls", "vs/platform/product/common/productService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/files/common/files", "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, extensionManagement_1, extensionManagementUtil_1, log_1, errorMessage_1, arrays_1, cancellation_1, nls_1, productService_1, configuration_1, async_1, extensionManifestPropertiesService_1, files_1, remoteExtensionManagementService_1, userDataProfile_1, userDataProfile_2, remoteUserDataProfiles_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeRemoteExtensionManagementService = void 0;
    let NativeRemoteExtensionManagementService = class NativeRemoteExtensionManagementService extends remoteExtensionManagementService_1.RemoteExtensionManagementService {
        constructor(channel, localExtensionManagementServer, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService, logService, galleryService, configurationService, productService, fileService, extensionManifestPropertiesService) {
            super(channel, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService);
            this.localExtensionManagementServer = localExtensionManagementServer;
            this.logService = logService;
            this.galleryService = galleryService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.fileService = fileService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        }
        async install(vsix, options) {
            const local = await super.install(vsix, options);
            await this.installUIDependenciesAndPackedExtensions(local);
            return local;
        }
        async installFromGallery(extension, installOptions) {
            const local = await this.doInstallFromGallery(extension, installOptions);
            await this.installUIDependenciesAndPackedExtensions(local);
            return local;
        }
        async doInstallFromGallery(extension, installOptions) {
            if (this.configurationService.getValue('remote.downloadExtensionsLocally')) {
                return this.downloadAndInstall(extension, installOptions || {});
            }
            try {
                return await super.installFromGallery(extension, installOptions);
            }
            catch (error) {
                switch (error.name) {
                    case extensionManagement_1.ExtensionManagementErrorCode.Download:
                    case extensionManagement_1.ExtensionManagementErrorCode.Internal:
                        try {
                            this.logService.error(`Error while installing '${extension.identifier.id}' extension in the remote server.`, (0, errorMessage_1.toErrorMessage)(error));
                            return await this.downloadAndInstall(extension, installOptions || {});
                        }
                        catch (e) {
                            this.logService.error(e);
                            throw e;
                        }
                    default:
                        this.logService.debug('Remote Install Error Name', error.name);
                        throw error;
                }
            }
        }
        async downloadAndInstall(extension, installOptions) {
            this.logService.info(`Downloading the '${extension.identifier.id}' extension locally and install`);
            const compatible = await this.checkAndGetCompatible(extension, !!installOptions.installPreReleaseVersion);
            installOptions = { ...installOptions, donotIncludePackAndDependencies: true };
            const installed = await this.getInstalled(1 /* ExtensionType.User */);
            const workspaceExtensions = await this.getAllWorkspaceDependenciesAndPackedExtensions(compatible, cancellation_1.CancellationToken.None);
            if (workspaceExtensions.length) {
                this.logService.info(`Downloading the workspace dependencies and packed extensions of '${compatible.identifier.id}' locally and install`);
                for (const workspaceExtension of workspaceExtensions) {
                    await this.downloadCompatibleAndInstall(workspaceExtension, installed, installOptions);
                }
            }
            return await this.downloadCompatibleAndInstall(compatible, installed, installOptions);
        }
        async downloadCompatibleAndInstall(extension, installed, installOptions) {
            const compatible = await this.checkAndGetCompatible(extension, !!installOptions.installPreReleaseVersion);
            this.logService.trace('Downloading extension:', compatible.identifier.id);
            const location = await this.localExtensionManagementServer.extensionManagementService.download(compatible, installed.filter(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, compatible.identifier))[0] ? 3 /* InstallOperation.Update */ : 2 /* InstallOperation.Install */, !!installOptions.donotVerifySignature);
            this.logService.info('Downloaded extension:', compatible.identifier.id, location.path);
            try {
                const local = await super.install(location, installOptions);
                this.logService.info(`Successfully installed '${compatible.identifier.id}' extension`);
                return local;
            }
            finally {
                try {
                    await this.fileService.del(location);
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
        async checkAndGetCompatible(extension, includePreRelease) {
            const targetPlatform = await this.getTargetPlatform();
            let compatibleExtension = null;
            if (extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
                compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
            }
            if (!compatibleExtension && await this.galleryService.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                compatibleExtension = extension;
            }
            if (!compatibleExtension) {
                compatibleExtension = await this.galleryService.getCompatibleExtension(extension, includePreRelease, targetPlatform);
            }
            if (!compatibleExtension) {
                /** If no compatible release version is found, check if the extension has a release version or not and throw relevant error */
                if (!includePreRelease && extension.properties.isPreReleaseVersion && (await this.galleryService.getExtensions([extension.identifier], cancellation_1.CancellationToken.None))[0]) {
                    throw new extensionManagement_1.ExtensionManagementError((0, nls_1.localize)('notFoundReleaseExtension', "Can't install release version of '{0}' extension because it has no release version.", extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound);
                }
                throw new extensionManagement_1.ExtensionManagementError((0, nls_1.localize)('notFoundCompatibleDependency', "Can't install '{0}' extension because it is not compatible with the current version of {1} (version {2}).", extension.identifier.id, this.productService.nameLong, this.productService.version), extensionManagement_1.ExtensionManagementErrorCode.Incompatible);
            }
            return compatibleExtension;
        }
        async installUIDependenciesAndPackedExtensions(local) {
            const uiExtensions = await this.getAllUIDependenciesAndPackedExtensions(local.manifest, cancellation_1.CancellationToken.None);
            const installed = await this.localExtensionManagementServer.extensionManagementService.getInstalled();
            const toInstall = uiExtensions.filter(e => installed.every(i => !(0, extensionManagementUtil_1.areSameExtensions)(i.identifier, e.identifier)));
            if (toInstall.length) {
                this.logService.info(`Installing UI dependencies and packed extensions of '${local.identifier.id}' locally`);
                await async_1.Promises.settled(toInstall.map(d => this.localExtensionManagementServer.extensionManagementService.installFromGallery(d)));
            }
        }
        async getAllUIDependenciesAndPackedExtensions(manifest, token) {
            const result = new Map();
            const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
            await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, true, token);
            return [...result.values()];
        }
        async getAllWorkspaceDependenciesAndPackedExtensions(extension, token) {
            const result = new Map();
            result.set(extension.identifier.id.toLowerCase(), extension);
            const manifest = await this.galleryService.getManifest(extension, token);
            if (manifest) {
                const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
                await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, false, token);
            }
            result.delete(extension.identifier.id);
            return [...result.values()];
        }
        async getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token) {
            if (toGet.length === 0) {
                return Promise.resolve();
            }
            const extensions = await this.galleryService.getExtensions(toGet.map(id => ({ id })), token);
            const manifests = await Promise.all(extensions.map(e => this.galleryService.getManifest(e, token)));
            const extensionsManifests = [];
            for (let idx = 0; idx < extensions.length; idx++) {
                const extension = extensions[idx];
                const manifest = manifests[idx];
                if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest) === uiExtension) {
                    result.set(extension.identifier.id.toLowerCase(), extension);
                    extensionsManifests.push(manifest);
                }
            }
            toGet = [];
            for (const extensionManifest of extensionsManifests) {
                if ((0, arrays_1.isNonEmptyArray)(extensionManifest.extensionDependencies)) {
                    for (const id of extensionManifest.extensionDependencies) {
                        if (!result.has(id.toLowerCase())) {
                            toGet.push(id);
                        }
                    }
                }
                if ((0, arrays_1.isNonEmptyArray)(extensionManifest.extensionPack)) {
                    for (const id of extensionManifest.extensionPack) {
                        if (!result.has(id.toLowerCase())) {
                            toGet.push(id);
                        }
                    }
                }
            }
            return this.getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token);
        }
    };
    exports.NativeRemoteExtensionManagementService = NativeRemoteExtensionManagementService;
    exports.NativeRemoteExtensionManagementService = NativeRemoteExtensionManagementService = __decorate([
        __param(2, userDataProfile_2.IUserDataProfileService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, remoteUserDataProfiles_1.IRemoteUserDataProfilesService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, log_1.ILogService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, productService_1.IProductService),
        __param(10, files_1.IFileService),
        __param(11, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], NativeRemoteExtensionManagementService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9lbGVjdHJvbi1zYW5kYm94L3JlbW90ZUV4dGVuc2lvbk1hbmFnZW1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCekYsSUFBTSxzQ0FBc0MsR0FBNUMsTUFBTSxzQ0FBdUMsU0FBUSxtRUFBZ0M7UUFFM0YsWUFDQyxPQUFpQixFQUNBLDhCQUEwRCxFQUNsRCxzQkFBK0MsRUFDOUMsdUJBQWlELEVBQzNDLDZCQUE2RCxFQUN4RSxrQkFBdUMsRUFDOUIsVUFBdUIsRUFDVixjQUF3QyxFQUMzQyxvQkFBMkMsRUFDakQsY0FBK0IsRUFDbEMsV0FBeUIsRUFDRixrQ0FBdUU7WUFFN0gsS0FBSyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSx1QkFBdUIsRUFBRSw2QkFBNkIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBWmxHLG1DQUE4QixHQUE5Qiw4QkFBOEIsQ0FBNEI7WUFLN0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNWLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNGLHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7UUFHOUgsQ0FBQztRQUVRLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBUyxFQUFFLE9BQTRCO1lBQzdELE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakQsTUFBTSxJQUFJLENBQUMsd0NBQXdDLENB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