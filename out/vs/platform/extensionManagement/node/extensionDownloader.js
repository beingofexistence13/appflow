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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/node/zip", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/files/common/files", "vs/platform/log/common/log"], function (require, exports, async_1, errors_1, lifecycle_1, network_1, resources_1, semver, types_1, uuid_1, pfs_1, zip_1, configuration_1, environment_1, extensionManagement_1, extensionManagementUtil_1, extensionSignatureVerificationService_1, files_1, log_1) {
    "use strict";
    var ExtensionsDownloader_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsDownloader = void 0;
    let ExtensionsDownloader = class ExtensionsDownloader extends lifecycle_1.Disposable {
        static { ExtensionsDownloader_1 = this; }
        static { this.SignatureArchiveExtension = '.sigzip'; }
        constructor(environmentService, fileService, extensionGalleryService, configurationService, extensionSignatureVerificationService, logService) {
            super();
            this.fileService = fileService;
            this.extensionGalleryService = extensionGalleryService;
            this.configurationService = configurationService;
            this.extensionSignatureVerificationService = extensionSignatureVerificationService;
            this.logService = logService;
            this.extensionsDownloadDir = environmentService.extensionsDownloadLocation;
            this.cache = 20; // Cache 20 downloaded VSIX files
            this.cleanUpPromise = this.cleanUp();
        }
        async download(extension, operation, verifySignature) {
            await this.cleanUpPromise;
            const location = (0, resources_1.joinPath)(this.extensionsDownloadDir, this.getName(extension));
            try {
                await this.downloadFile(extension, location, location => this.extensionGalleryService.download(extension, location, operation));
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError(error.message, extensionManagement_1.ExtensionManagementErrorCode.Download);
            }
            let verificationStatus = false;
            if (verifySignature && this.shouldVerifySignature(extension)) {
                const signatureArchiveLocation = await this.downloadSignatureArchive(extension);
                try {
                    verificationStatus = await this.extensionSignatureVerificationService.verify(location.fsPath, signatureArchiveLocation.fsPath, this.logService.getLevel() === log_1.LogLevel.Trace);
                }
                catch (error) {
                    const sigError = error;
                    verificationStatus = sigError.code;
                    if (sigError.output) {
                        this.logService.trace(`Extension signature verification details for ${extension.identifier.id} ${extension.version}:\n${sigError.output}`);
                    }
                    if (verificationStatus === extensionManagement_1.ExtensionSignaturetErrorCode.PackageIsInvalidZip || verificationStatus === extensionManagement_1.ExtensionSignaturetErrorCode.SignatureArchiveIsInvalidZip) {
                        throw new extensionManagement_1.ExtensionManagementError(zip_1.CorruptZipMessage, extensionManagement_1.ExtensionManagementErrorCode.CorruptZip);
                    }
                }
                finally {
                    try {
                        // Delete signature archive always
                        await this.delete(signatureArchiveLocation);
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
            }
            if (verificationStatus === true) {
                this.logService.info(`Extension signature is verified: ${extension.identifier.id}`);
            }
            else if (verificationStatus === false) {
                this.logService.info(`Extension signature verification is not done: ${extension.identifier.id}`);
            }
            else {
                this.logService.warn(`Extension signature verification failed with error '${verificationStatus}': ${extension.identifier.id}`);
            }
            return { location, verificationStatus };
        }
        shouldVerifySignature(extension) {
            if (!extension.isSigned) {
                return false;
            }
            const value = this.configurationService.getValue('extensions.verifySignature');
            return (0, types_1.isBoolean)(value) ? value : true;
        }
        async downloadSignatureArchive(extension) {
            await this.cleanUpPromise;
            const location = (0, resources_1.joinPath)(this.extensionsDownloadDir, `${this.getName(extension)}${ExtensionsDownloader_1.SignatureArchiveExtension}`);
            await this.downloadFile(extension, location, location => this.extensionGalleryService.downloadSignatureArchive(extension, location));
            return location;
        }
        async downloadFile(extension, location, downloadFn) {
            // Do not download if exists
            if (await this.fileService.exists(location)) {
                return;
            }
            // Download directly if locaiton is not file scheme
            if (location.scheme !== network_1.Schemas.file) {
                await downloadFn(location);
                return;
            }
            // Download to temporary location first only if file does not exist
            const tempLocation = (0, resources_1.joinPath)(this.extensionsDownloadDir, `.${(0, uuid_1.generateUuid)()}`);
            if (!await this.fileService.exists(tempLocation)) {
                await downloadFn(tempLocation);
            }
            try {
                // Rename temp location to original
                await pfs_1.Promises.rename(tempLocation.fsPath, location.fsPath, 2 * 60 * 1000 /* Retry for 2 minutes */);
            }
            catch (error) {
                try {
                    await this.fileService.del(tempLocation);
                }
                catch (e) { /* ignore */ }
                if (error.code === 'ENOTEMPTY') {
                    this.logService.info(`Rename failed because the file was downloaded by another source. So ignoring renaming.`, extension.identifier.id, location.path);
                }
                else {
                    this.logService.info(`Rename failed because of ${(0, errors_1.getErrorMessage)(error)}. Deleted the file from downloaded location`, tempLocation.path);
                    throw error;
                }
            }
        }
        async delete(location) {
            await this.cleanUpPromise;
            await this.fileService.del(location);
        }
        async cleanUp() {
            try {
                if (!(await this.fileService.exists(this.extensionsDownloadDir))) {
                    this.logService.trace('Extension VSIX downloads cache dir does not exist');
                    return;
                }
                const folderStat = await this.fileService.resolve(this.extensionsDownloadDir, { resolveMetadata: true });
                if (folderStat.children) {
                    const toDelete = [];
                    const vsixs = [];
                    const signatureArchives = [];
                    for (const stat of folderStat.children) {
                        if (stat.name.endsWith(ExtensionsDownloader_1.SignatureArchiveExtension)) {
                            signatureArchives.push(stat.resource);
                        }
                        else {
                            const extension = extensionManagementUtil_1.ExtensionKey.parse(stat.name);
                            if (extension) {
                                vsixs.push([extension, stat]);
                            }
                        }
                    }
                    const byExtension = (0, extensionManagementUtil_1.groupByExtension)(vsixs, ([extension]) => extension);
                    const distinct = [];
                    for (const p of byExtension) {
                        p.sort((a, b) => semver.rcompare(a[0].version, b[0].version));
                        toDelete.push(...p.slice(1).map(e => e[1].resource)); // Delete outdated extensions
                        distinct.push(p[0][1]);
                    }
                    distinct.sort((a, b) => a.mtime - b.mtime); // sort by modified time
                    toDelete.push(...distinct.slice(0, Math.max(0, distinct.length - this.cache)).map(s => s.resource)); // Retain minimum cacheSize and delete the rest
                    toDelete.push(...signatureArchives); // Delete all signature archives
                    await async_1.Promises.settled(toDelete.map(resource => {
                        this.logService.trace('Deleting from cache', resource.path);
                        return this.fileService.del(resource);
                    }));
                }
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        getName(extension) {
            return this.cache ? extensionManagementUtil_1.ExtensionKey.create(extension).toString().toLowerCase() : (0, uuid_1.generateUuid)();
        }
    };
    exports.ExtensionsDownloader = ExtensionsDownloader;
    exports.ExtensionsDownloader = ExtensionsDownloader = ExtensionsDownloader_1 = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, extensionSignatureVerificationService_1.IExtensionSignatureVerificationService),
        __param(5, log_1.ILogService)
    ], ExtensionsDownloader);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvbm9kZS9leHRlbnNpb25Eb3dubG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzQnpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7O2lCQUUzQiw4QkFBeUIsR0FBRyxTQUFTLEFBQVosQ0FBYTtRQU05RCxZQUM0QixrQkFBNkMsRUFDekMsV0FBeUIsRUFDYix1QkFBaUQsRUFDcEQsb0JBQTJDLEVBQzFCLHFDQUE2RSxFQUN4RyxVQUF1QjtZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQU51QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNiLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDcEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMxQiwwQ0FBcUMsR0FBckMscUNBQXFDLENBQXdDO1lBQ3hHLGVBQVUsR0FBVixVQUFVLENBQWE7WUFHckQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDO1lBQzNFLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsaUNBQWlDO1lBQ2xELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQTRCLEVBQUUsU0FBMkIsRUFBRSxlQUF3QjtZQUNqRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUM7WUFFMUIsTUFBTSxRQUFRLEdBQUcsSUFBQSxvQkFBUSxFQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDL0Us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