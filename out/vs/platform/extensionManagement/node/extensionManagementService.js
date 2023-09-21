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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/node/zip", "vs/nls", "vs/platform/download/common/download", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/abstractExtensionManagementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionDownloader", "vs/platform/extensionManagement/node/extensionLifecycle", "vs/platform/extensionManagement/node/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionsManifestCache", "vs/platform/extensionManagement/node/extensionsWatcher", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, buffer_1, cancellation_1, errorMessage_1, errors_1, event_1, hash_1, lifecycle_1, map_1, network_1, path, resources_1, semver, types_1, uri_1, uuid_1, pfs, zip_1, nls, download_1, environment_1, abstractExtensionManagementService_1, extensionManagement_1, extensionManagementUtil_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionDownloader_1, extensionLifecycle_1, extensionManagementUtil_2, extensionsManifestCache_1, extensionsWatcher_1, extensionValidator_1, files_1, instantiation_1, log_1, productService_1, telemetry_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InstallGalleryExtensionTask = exports.ExtensionsScanner = exports.ExtensionManagementService = exports.INativeServerExtensionManagementService = void 0;
    exports.INativeServerExtensionManagementService = (0, instantiation_1.refineServiceDecorator)(extensionManagement_1.IExtensionManagementService);
    const DELETED_FOLDER_POSTFIX = '.vsctmp';
    let ExtensionManagementService = class ExtensionManagementService extends abstractExtensionManagementService_1.AbstractExtensionManagementService {
        constructor(galleryService, telemetryService, logService, environmentService, extensionsScannerService, extensionsProfileScannerService, downloadService, instantiationService, fileService, productService, uriIdentityService, userDataProfilesService) {
            super(galleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService);
            this.extensionsScannerService = extensionsScannerService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.downloadService = downloadService;
            this.fileService = fileService;
            this.installGalleryExtensionsTasks = new Map();
            this.knownDirectories = new map_1.ResourceSet();
            const extensionLifecycle = this._register(instantiationService.createInstance(extensionLifecycle_1.ExtensionsLifecycle));
            this.extensionsScanner = this._register(instantiationService.createInstance(ExtensionsScanner, extension => extensionLifecycle.postUninstall(extension)));
            this.manifestCache = this._register(new extensionsManifestCache_1.ExtensionsManifestCache(userDataProfilesService, fileService, uriIdentityService, this, this.logService));
            this.extensionsDownloader = this._register(instantiationService.createInstance(extensionDownloader_1.ExtensionsDownloader));
            const extensionsWatcher = this._register(new extensionsWatcher_1.ExtensionsWatcher(this, this.extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService));
            this._register(extensionsWatcher.onDidChangeExtensionsByAnotherSource(e => this.onDidChangeExtensionsFromAnotherSource(e)));
            this.watchForExtensionsNotInstalledBySystem();
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = (0, extensionManagementUtil_1.computeTargetPlatform)(this.fileService, this.logService);
            }
            return this._targetPlatformPromise;
        }
        async zip(extension) {
            this.logService.trace('ExtensionManagementService#zip', extension.identifier.id);
            const files = await this.collectFiles(extension);
            const location = await (0, zip_1.zip)((0, resources_1.joinPath)(this.extensionsDownloader.extensionsDownloadDir, (0, uuid_1.generateUuid)()).fsPath, files);
            return uri_1.URI.file(location);
        }
        async unzip(zipLocation) {
            this.logService.trace('ExtensionManagementService#unzip', zipLocation.toString());
            const local = await this.install(zipLocation);
            return local.identifier;
        }
        async getManifest(vsix) {
            const { location, cleanup } = await this.downloadVsix(vsix);
            const zipPath = path.resolve(location.fsPath);
            try {
                return await (0, extensionManagementUtil_2.getManifest)(zipPath);
            }
            finally {
                await cleanup();
            }
        }
        getInstalled(type, profileLocation = this.userDataProfilesService.defaultProfile.extensionsResource) {
            return this.extensionsScanner.scanExtensions(type ?? null, profileLocation);
        }
        scanAllUserInstalledExtensions() {
            return this.extensionsScanner.scanAllUserExtensions(false);
        }
        scanInstalledExtensionAtLocation(location) {
            return this.extensionsScanner.scanUserExtensionAtLocation(location);
        }
        async install(vsix, options = {}) {
            this.logService.trace('ExtensionManagementService#install', vsix.toString());
            const { location, cleanup } = await this.downloadVsix(vsix);
            try {
                const manifest = await (0, extensionManagementUtil_2.getManifest)(path.resolve(location.fsPath));
                const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
                if (manifest.engines && manifest.engines.vscode && !(0, extensionValidator_1.isEngineValid)(manifest.engines.vscode, this.productService.version, this.productService.date)) {
                    throw new Error(nls.localize('incompatible', "Unable to install extension '{0}' as it is not compatible with VS Code '{1}'.", extensionId, this.productService.version));
                }
                const results = await this.installExtensions([{ manifest, extension: location, options }]);
                const result = results.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, { id: extensionId }));
                if (result?.local) {
                    return result.local;
                }
                if (result?.error) {
                    throw result.error;
                }
                throw (0, abstractExtensionManagementService_1.toExtensionManagementError)(new Error(`Unknown error while installing extension ${extensionId}`));
            }
            finally {
                await cleanup();
            }
        }
        async installFromLocation(location, profileLocation) {
            this.logService.trace('ExtensionManagementService#installFromLocation', location.toString());
            const local = await this.extensionsScanner.scanUserExtensionAtLocation(location);
            if (!local) {
                throw new Error(`Cannot find a valid extension from the location ${location.toString()}`);
            }
            await this.addExtensionsToProfile([[local, undefined]], profileLocation);
            this.logService.info('Successfully installed extension', local.identifier.id, profileLocation.toString());
            return local;
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            this.logService.trace('ExtensionManagementService#installExtensionsFromProfile', extensions, fromProfileLocation.toString(), toProfileLocation.toString());
            const extensionsToInstall = (await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, fromProfileLocation)).filter(e => extensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)(id, e.identifier)));
            if (extensionsToInstall.length) {
                const metadata = await Promise.all(extensionsToInstall.map(e => this.extensionsScanner.scanMetadata(e, fromProfileLocation)));
                await this.addExtensionsToProfile(extensionsToInstall.map((e, index) => [e, metadata[index]]), toProfileLocation);
                this.logService.info('Successfully installed extensions', extensionsToInstall.map(e => e.identifier.id), toProfileLocation.toString());
            }
            return extensionsToInstall;
        }
        async updateMetadata(local, metadata, profileLocation = this.userDataProfilesService.defaultProfile.extensionsResource) {
            this.logService.trace('ExtensionManagementService#updateMetadata', local.identifier.id);
            if (metadata.isPreReleaseVersion) {
                metadata.preRelease = true;
            }
            // unset if false
            metadata.isMachineScoped = metadata.isMachineScoped || undefined;
            metadata.isBuiltin = metadata.isBuiltin || undefined;
            metadata.pinned = metadata.pinned || undefined;
            local = await this.extensionsScanner.updateMetadata(local, metadata, profileLocation);
            this.manifestCache.invalidate(profileLocation);
            this._onDidUpdateExtensionMetadata.fire(local);
            return local;
        }
        async reinstallFromGallery(extension) {
            this.logService.trace('ExtensionManagementService#reinstallFromGallery', extension.identifier.id);
            if (!this.galleryService.isEnabled()) {
                throw new Error(nls.localize('MarketPlaceDisabled', "Marketplace is not enabled"));
            }
            const targetPlatform = await this.getTargetPlatform();
            const [galleryExtension] = await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: extension.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            if (!galleryExtension) {
                throw new Error(nls.localize('Not a Marketplace extension', "Only Marketplace Extensions can be reinstalled"));
            }
            await this.extensionsScanner.setUninstalled(extension);
            try {
                await this.extensionsScanner.removeUninstalledExtension(extension);
            }
            catch (e) {
                throw new Error(nls.localize('removeError', "Error while removing the extension: {0}. Please Quit and Start VS Code before trying again.", (0, errorMessage_1.toErrorMessage)(e)));
            }
            return this.installFromGallery(galleryExtension);
        }
        copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
            return this.extensionsScanner.copyExtension(extension, fromProfileLocation, toProfileLocation, metadata);
        }
        copyExtensions(fromProfileLocation, toProfileLocation) {
            return this.extensionsScanner.copyExtensions(fromProfileLocation, toProfileLocation);
        }
        markAsUninstalled(...extensions) {
            return this.extensionsScanner.setUninstalled(...extensions);
        }
        async cleanUp() {
            this.logService.trace('ExtensionManagementService#cleanUp');
            try {
                await this.extensionsScanner.cleanUp();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        async download(extension, operation, donotVerifySignature) {
            const { location } = await this.extensionsDownloader.download(extension, operation, !donotVerifySignature);
            return location;
        }
        async downloadVsix(vsix) {
            if (vsix.scheme === network_1.Schemas.file) {
                return { location: vsix, async cleanup() { } };
            }
            this.logService.trace('Downloading extension from', vsix.toString());
            const location = (0, resources_1.joinPath)(this.extensionsDownloader.extensionsDownloadDir, (0, uuid_1.generateUuid)());
            await this.downloadService.download(vsix, location);
            this.logService.info('Downloaded extension to', location.toString());
            const cleanup = async () => {
                try {
                    await this.fileService.del(location);
                }
                catch (error) {
                    this.logService.error(error);
                }
            };
            return { location, cleanup };
        }
        getCurrentExtensionsManifestLocation() {
            return this.userDataProfilesService.defaultProfile.extensionsResource;
        }
        createInstallExtensionTask(manifest, extension, options) {
            if (uri_1.URI.isUri(extension)) {
                return new InstallVSIXTask(manifest, extension, options, this.galleryService, this.extensionsScanner, this.uriIdentityService, this.userDataProfilesService, this.extensionsScannerService, this.extensionsProfileScannerService, this.logService);
            }
            const key = extensionManagementUtil_1.ExtensionKey.create(extension).toString();
            let installExtensionTask = this.installGalleryExtensionsTasks.get(key);
            if (!installExtensionTask) {
                this.installGalleryExtensionsTasks.set(key, installExtensionTask = new InstallGalleryExtensionTask(manifest, extension, options, this.extensionsDownloader, this.extensionsScanner, this.uriIdentityService, this.userDataProfilesService, this.extensionsScannerService, this.extensionsProfileScannerService, this.logService));
                installExtensionTask.waitUntilTaskIsFinished().finally(() => this.installGalleryExtensionsTasks.delete(key));
            }
            return installExtensionTask;
        }
        createUninstallExtensionTask(extension, options) {
            return new UninstallExtensionTask(extension, options.profileLocation, this.extensionsProfileScannerService);
        }
        async collectFiles(extension) {
            const collectFilesFromDirectory = async (dir) => {
                let entries = await pfs.Promises.readdir(dir);
                entries = entries.map(e => path.join(dir, e));
                const stats = await Promise.all(entries.map(e => pfs.Promises.stat(e)));
                let promise = Promise.resolve([]);
                stats.forEach((stat, index) => {
                    const entry = entries[index];
                    if (stat.isFile()) {
                        promise = promise.then(result => ([...result, entry]));
                    }
                    if (stat.isDirectory()) {
                        promise = promise
                            .then(result => collectFilesFromDirectory(entry)
                            .then(files => ([...result, ...files])));
                    }
                });
                return promise;
            };
            const files = await collectFilesFromDirectory(extension.location.fsPath);
            return files.map(f => ({ path: `extension/${path.relative(extension.location.fsPath, f)}`, localPath: f }));
        }
        async onDidChangeExtensionsFromAnotherSource({ added, removed }) {
            if (removed) {
                for (const identifier of removed.extensions) {
                    this.logService.info('Extensions removed from another source', identifier.id, removed.profileLocation.toString());
                    this._onDidUninstallExtension.fire({ identifier, profileLocation: removed.profileLocation });
                }
            }
            if (added) {
                const extensions = await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, added.profileLocation);
                const addedExtensions = extensions.filter(e => added.extensions.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, e.identifier)));
                this._onDidInstallExtensions.fire(addedExtensions.map(local => {
                    this.logService.info('Extensions added from another source', local.identifier.id, added.profileLocation.toString());
                    return { identifier: local.identifier, local, profileLocation: added.profileLocation, operation: 1 /* InstallOperation.None */ };
                }));
            }
        }
        async watchForExtensionsNotInstalledBySystem() {
            this._register(this.extensionsScanner.onExtract(resource => this.knownDirectories.add(resource)));
            const stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
            for (const childStat of stat.children ?? []) {
                if (childStat.isDirectory) {
                    this.knownDirectories.add(childStat.resource);
                }
            }
            this._register(this.fileService.watch(this.extensionsScannerService.userExtensionsLocation));
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        }
        async onDidFilesChange(e) {
            if (!e.affects(this.extensionsScannerService.userExtensionsLocation, 1 /* FileChangeType.ADDED */)) {
                return;
            }
            const added = [];
            for (const resource of e.rawAdded) {
                // Check if this is a known directory
                if (this.knownDirectories.has(resource)) {
                    continue;
                }
                // Is not immediate child of extensions resource
                if (!this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(resource), this.extensionsScannerService.userExtensionsLocation)) {
                    continue;
                }
                // .obsolete file changed
                if (this.uriIdentityService.extUri.isEqual(resource, this.uriIdentityService.extUri.joinPath(this.extensionsScannerService.userExtensionsLocation, '.obsolete'))) {
                    continue;
                }
                // Ignore changes to files starting with `.`
                if (this.uriIdentityService.extUri.basename(resource).startsWith('.')) {
                    continue;
                }
                // Check if this is a directory
                if (!(await this.fileService.stat(resource)).isDirectory) {
                    continue;
                }
                // Check if this is an extension added by another source
                // Extension added by another source will not have installed timestamp
                const extension = await this.extensionsScanner.scanUserExtensionAtLocation(resource);
                if (extension && extension.installedTimestamp === undefined) {
                    this.knownDirectories.add(resource);
                    added.push(extension);
                }
            }
            if (added.length) {
                await this.addExtensionsToProfile(added.map(e => [e, undefined]), this.userDataProfilesService.defaultProfile.extensionsResource);
                this.logService.info('Added extensions to default profile from external source', added.map(e => e.identifier.id));
            }
        }
        async addExtensionsToProfile(extensions, profileLocation) {
            const localExtensions = extensions.map(e => e[0]);
            await this.setInstalled(localExtensions);
            await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, profileLocation);
            this._onDidInstallExtensions.fire(localExtensions.map(local => ({ local, identifier: local.identifier, operation: 1 /* InstallOperation.None */, profileLocation })));
        }
        async setInstalled(extensions) {
            const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
            for (const extension of extensions) {
                const extensionKey = extensionManagementUtil_1.ExtensionKey.create(extension);
                if (!uninstalled[extensionKey.toString()]) {
                    continue;
                }
                this.logService.trace('Removing the extension from uninstalled list:', extensionKey.id);
                await this.extensionsScanner.setInstalled(extensionKey);
                this.logService.info('Removed the extension from uninstalled list:', extensionKey.id);
            }
        }
    };
    exports.ExtensionManagementService = ExtensionManagementService;
    exports.ExtensionManagementService = ExtensionManagementService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.INativeEnvironmentService),
        __param(4, extensionsScannerService_1.IExtensionsScannerService),
        __param(5, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(6, download_1.IDownloadService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, files_1.IFileService),
        __param(9, productService_1.IProductService),
        __param(10, uriIdentity_1.IUriIdentityService),
        __param(11, userDataProfile_1.IUserDataProfilesService)
    ], ExtensionManagementService);
    let ExtensionsScanner = class ExtensionsScanner extends lifecycle_1.Disposable {
        constructor(beforeRemovingExtension, fileService, extensionsScannerService, extensionsProfileScannerService, uriIdentityService, logService) {
            super();
            this.beforeRemovingExtension = beforeRemovingExtension;
            this.fileService = fileService;
            this.extensionsScannerService = extensionsScannerService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._onExtract = this._register(new event_1.Emitter());
            this.onExtract = this._onExtract.event;
            this.uninstalledResource = (0, resources_1.joinPath)(this.extensionsScannerService.userExtensionsLocation, '.obsolete');
            this.uninstalledFileLimiter = new async_1.Queue();
        }
        async cleanUp() {
            await this.removeTemporarilyDeletedFolders();
            await this.removeUninstalledExtensions();
        }
        async scanExtensions(type, profileLocation) {
            const userScanOptions = { includeInvalid: true, profileLocation };
            let scannedExtensions = [];
            if (type === null || type === 0 /* ExtensionType.System */) {
                scannedExtensions.push(...await this.extensionsScannerService.scanAllExtensions({ includeInvalid: true }, userScanOptions, false));
            }
            else if (type === 1 /* ExtensionType.User */) {
                scannedExtensions.push(...await this.extensionsScannerService.scanUserExtensions(userScanOptions));
            }
            scannedExtensions = type !== null ? scannedExtensions.filter(r => r.type === type) : scannedExtensions;
            return Promise.all(scannedExtensions.map(extension => this.toLocalExtension(extension)));
        }
        async scanAllUserExtensions(excludeOutdated) {
            const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({ includeAllVersions: !excludeOutdated, includeInvalid: true });
            return Promise.all(scannedExtensions.map(extension => this.toLocalExtension(extension)));
        }
        async scanUserExtensionAtLocation(location) {
            try {
                const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, 1 /* ExtensionType.User */, { includeInvalid: true });
                if (scannedExtension) {
                    return await this.toLocalExtension(scannedExtension);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            return null;
        }
        async extractUserExtension(extensionKey, zipPath, metadata, removeIfExists, token) {
            const folderName = extensionKey.toString();
            const tempLocation = uri_1.URI.file(path.join(this.extensionsScannerService.userExtensionsLocation.fsPath, `.${(0, uuid_1.generateUuid)()}`));
            const extensionLocation = uri_1.URI.file(path.join(this.extensionsScannerService.userExtensionsLocation.fsPath, folderName));
            let exists = await this.fileService.exists(extensionLocation);
            if (exists && removeIfExists) {
                try {
                    await this.deleteExtensionFromLocation(extensionKey.id, extensionLocation, 'removeExisting');
                }
                catch (error) {
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('errorDeleting', "Unable to delete the existing folder '{0}' while installing the extension '{1}'. Please delete the folder manually and try again", extensionLocation.fsPath, extensionKey.id), extensionManagement_1.ExtensionManagementErrorCode.Delete);
                }
                exists = false;
            }
            if (!exists) {
                try {
                    // Extract
                    try {
                        this.logService.trace(`Started extracting the extension from ${zipPath} to ${extensionLocation.fsPath}`);
                        await (0, zip_1.extract)(zipPath, tempLocation.fsPath, { sourcePath: 'extension', overwrite: true }, token);
                        this.logService.info(`Extracted extension to ${extensionLocation}:`, extensionKey.id);
                    }
                    catch (e) {
                        let errorCode = extensionManagement_1.ExtensionManagementErrorCode.Extract;
                        if (e instanceof zip_1.ExtractError) {
                            if (e.type === 'CorruptZip') {
                                errorCode = extensionManagement_1.ExtensionManagementErrorCode.CorruptZip;
                            }
                            else if (e.type === 'Incomplete') {
                                errorCode = extensionManagement_1.ExtensionManagementErrorCode.IncompleteZip;
                            }
                        }
                        throw new extensionManagement_1.ExtensionManagementError(e.message, errorCode);
                    }
                    await this.extensionsScannerService.updateMetadata(tempLocation, metadata);
                    // Rename
                    try {
                        this.logService.trace(`Started renaming the extension from ${tempLocation.fsPath} to ${extensionLocation.fsPath}`);
                        await this.rename(tempLocation.fsPath, extensionLocation.fsPath);
                        this.logService.info('Renamed to', extensionLocation.fsPath);
                    }
                    catch (error) {
                        if (error.code === 'ENOTEMPTY') {
                            this.logService.info(`Rename failed because extension was installed by another source. So ignoring renaming.`, extensionKey.id);
                        }
                        else {
                            this.logService.info(`Rename failed because of ${(0, errors_1.getErrorMessage)(error)}. Deleted from extracted location`, tempLocation);
                            throw error;
                        }
                    }
                    this._onExtract.fire(extensionLocation);
                }
                catch (error) {
                    try {
                        await this.fileService.del(tempLocation, { recursive: true });
                    }
                    catch (e) { /* ignore */ }
                    throw error;
                }
            }
            return this.scanLocalExtension(extensionLocation, 1 /* ExtensionType.User */);
        }
        async scanMetadata(local, profileLocation) {
            if (profileLocation) {
                const extension = await this.getScannedExtension(local, profileLocation);
                return extension?.metadata;
            }
            else {
                return this.extensionsScannerService.scanMetadata(local.location);
            }
        }
        async getScannedExtension(local, profileLocation) {
            const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileLocation);
            return extensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, local.identifier));
        }
        async updateMetadata(local, metadata, profileLocation) {
            if (profileLocation) {
                await this.extensionsProfileScannerService.updateMetadata([[local, metadata]], profileLocation);
            }
            else {
                await this.extensionsScannerService.updateMetadata(local.location, metadata);
            }
            return this.scanLocalExtension(local.location, local.type, profileLocation);
        }
        getUninstalledExtensions() {
            return this.withUninstalledExtensions();
        }
        async setUninstalled(...extensions) {
            const extensionKeys = extensions.map(e => extensionManagementUtil_1.ExtensionKey.create(e));
            await this.withUninstalledExtensions(uninstalled => extensionKeys.forEach(extensionKey => {
                uninstalled[extensionKey.toString()] = true;
                this.logService.info('Marked extension as uninstalled', extensionKey.toString());
            }));
        }
        async setInstalled(extensionKey) {
            await this.withUninstalledExtensions(uninstalled => delete uninstalled[extensionKey.toString()]);
        }
        async removeExtension(extension, type) {
            if (this.uriIdentityService.extUri.isEqualOrParent(extension.location, this.extensionsScannerService.userExtensionsLocation)) {
                return this.deleteExtensionFromLocation(extension.identifier.id, extension.location, type);
            }
        }
        async removeUninstalledExtension(extension) {
            await this.removeExtension(extension, 'uninstalled');
            await this.withUninstalledExtensions(uninstalled => delete uninstalled[extensionManagementUtil_1.ExtensionKey.create(extension).toString()]);
        }
        async copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
            const source = await this.getScannedExtension(extension, fromProfileLocation);
            const target = await this.getScannedExtension(extension, toProfileLocation);
            metadata = { ...source?.metadata, ...metadata };
            if (target) {
                await this.extensionsProfileScannerService.updateMetadata([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
            }
            else {
                await this.extensionsProfileScannerService.addExtensionsToProfile([[extension, metadata]], toProfileLocation);
            }
            return this.scanLocalExtension(extension.location, extension.type, toProfileLocation);
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            const fromExtensions = await this.scanExtensions(1 /* ExtensionType.User */, fromProfileLocation);
            const extensions = await Promise.all(fromExtensions
                .filter(e => !e.isApplicationScoped) /* remove application scoped extensions */
                .map(async (e) => ([e, await this.scanMetadata(e, fromProfileLocation)])));
            await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, toProfileLocation);
        }
        async deleteExtensionFromLocation(id, location, type) {
            this.logService.trace(`Deleting ${type} extension from disk`, id, location.fsPath);
            const renamedLocation = this.uriIdentityService.extUri.joinPath(this.uriIdentityService.extUri.dirname(location), `${this.uriIdentityService.extUri.basename(location)}.${(0, hash_1.hash)((0, uuid_1.generateUuid)()).toString(16)}${DELETED_FOLDER_POSTFIX}`);
            await this.rename(location.fsPath, renamedLocation.fsPath);
            await this.fileService.del(renamedLocation, { recursive: true });
            this.logService.info(`Deleted ${type} extension from disk`, id, location.fsPath);
        }
        async withUninstalledExtensions(updateFn) {
            return this.uninstalledFileLimiter.queue(async () => {
                let raw;
                try {
                    const content = await this.fileService.readFile(this.uninstalledResource, 'utf8');
                    raw = content.value.toString();
                }
                catch (error) {
                    if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        throw error;
                    }
                }
                let uninstalled = {};
                if (raw) {
                    try {
                        uninstalled = JSON.parse(raw);
                    }
                    catch (e) { /* ignore */ }
                }
                if (updateFn) {
                    updateFn(uninstalled);
                    if (Object.keys(uninstalled).length) {
                        await this.fileService.writeFile(this.uninstalledResource, buffer_1.VSBuffer.fromString(JSON.stringify(uninstalled)));
                    }
                    else {
                        await this.fileService.del(this.uninstalledResource);
                    }
                }
                return uninstalled;
            });
        }
        async rename(extractPath, renamePath) {
            try {
                await pfs.Promises.rename(extractPath, renamePath, 2 * 60 * 1000 /* Retry for 2 minutes */);
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError(error.message || nls.localize('renameError', "Unknown error while renaming {0} to {1}", extractPath, renamePath), error.code || extensionManagement_1.ExtensionManagementErrorCode.Rename);
            }
        }
        async scanLocalExtension(location, type, profileLocation) {
            if (profileLocation) {
                const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({ profileLocation });
                const scannedExtension = scannedExtensions.find(e => this.uriIdentityService.extUri.isEqual(e.location, location));
                if (scannedExtension) {
                    return this.toLocalExtension(scannedExtension);
                }
            }
            else {
                const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, type, { includeInvalid: true });
                if (scannedExtension) {
                    return this.toLocalExtension(scannedExtension);
                }
            }
            throw new Error(nls.localize('cannot read', "Cannot read the extension from {0}", location.path));
        }
        async toLocalExtension(extension) {
            const stat = await this.fileService.resolve(extension.location);
            let readmeUrl;
            let changelogUrl;
            if (stat.children) {
                readmeUrl = stat.children.find(({ name }) => /^readme(\.txt|\.md|)$/i.test(name))?.resource;
                changelogUrl = stat.children.find(({ name }) => /^changelog(\.txt|\.md|)$/i.test(name))?.resource;
            }
            return {
                identifier: extension.identifier,
                type: extension.type,
                isBuiltin: extension.isBuiltin || !!extension.metadata?.isBuiltin,
                location: extension.location,
                manifest: extension.manifest,
                targetPlatform: extension.targetPlatform,
                validations: extension.validations,
                isValid: extension.isValid,
                readmeUrl,
                changelogUrl,
                publisherDisplayName: extension.metadata?.publisherDisplayName || null,
                publisherId: extension.metadata?.publisherId || null,
                isApplicationScoped: !!extension.metadata?.isApplicationScoped,
                isMachineScoped: !!extension.metadata?.isMachineScoped,
                isPreReleaseVersion: !!extension.metadata?.isPreReleaseVersion,
                preRelease: !!extension.metadata?.preRelease,
                installedTimestamp: extension.metadata?.installedTimestamp,
                updated: !!extension.metadata?.updated,
                pinned: !!extension.metadata?.pinned,
            };
        }
        async removeUninstalledExtensions() {
            const uninstalled = await this.getUninstalledExtensions();
            if (Object.keys(uninstalled).length === 0) {
                this.logService.debug(`No uninstalled extensions found.`);
                return;
            }
            this.logService.debug(`Removing uninstalled extensions:`, Object.keys(uninstalled));
            const extensions = await this.extensionsScannerService.scanUserExtensions({ includeAllVersions: true, includeUninstalled: true, includeInvalid: true }); // All user extensions
            const installed = new Set();
            for (const e of extensions) {
                if (!uninstalled[extensionManagementUtil_1.ExtensionKey.create(e).toString()]) {
                    installed.add(e.identifier.id.toLowerCase());
                }
            }
            try {
                // running post uninstall tasks for extensions that are not installed anymore
                const byExtension = (0, extensionManagementUtil_1.groupByExtension)(extensions, e => e.identifier);
                await async_1.Promises.settled(byExtension.map(async (e) => {
                    const latest = e.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version))[0];
                    if (!installed.has(latest.identifier.id.toLowerCase())) {
                        await this.beforeRemovingExtension(await this.toLocalExtension(latest));
                    }
                }));
            }
            catch (error) {
                this.logService.error(error);
            }
            const toRemove = extensions.filter(e => e.metadata /* Installed by System */ && uninstalled[extensionManagementUtil_1.ExtensionKey.create(e).toString()]);
            await Promise.allSettled(toRemove.map(e => this.removeUninstalledExtension(e)));
        }
        async removeTemporarilyDeletedFolders() {
            this.logService.trace('ExtensionManagementService#removeTempDeleteFolders');
            let stat;
            try {
                stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
                return;
            }
            if (!stat?.children) {
                return;
            }
            try {
                await Promise.allSettled(stat.children.map(async (child) => {
                    if (!child.isDirectory || !child.name.endsWith(DELETED_FOLDER_POSTFIX)) {
                        return;
                    }
                    this.logService.trace('Deleting the temporarily deleted folder', child.resource.toString());
                    try {
                        await this.fileService.del(child.resource, { recursive: true });
                        this.logService.trace('Deleted the temporarily deleted folder', child.resource.toString());
                    }
                    catch (error) {
                        if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.logService.error(error);
                        }
                    }
                }));
            }
            catch (error) { /* ignore */ }
        }
    };
    exports.ExtensionsScanner = ExtensionsScanner;
    exports.ExtensionsScanner = ExtensionsScanner = __decorate([
        __param(1, files_1.IFileService),
        __param(2, extensionsScannerService_1.IExtensionsScannerService),
        __param(3, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, log_1.ILogService)
    ], ExtensionsScanner);
    class InstallExtensionTask extends abstractExtensionManagementService_1.AbstractExtensionTask {
        get profileLocation() { return this._profileLocation; }
        get verificationStatus() { return this._verificationStatus; }
        get operation() { return (0, types_1.isUndefined)(this.options.operation) ? this._operation : this.options.operation; }
        constructor(identifier, source, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super();
            this.identifier = identifier;
            this.source = source;
            this.options = options;
            this.extensionsScanner = extensionsScanner;
            this.uriIdentityService = uriIdentityService;
            this.userDataProfilesService = userDataProfilesService;
            this.extensionsScannerService = extensionsScannerService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.logService = logService;
            this._profileLocation = this.options.profileLocation;
            this._verificationStatus = false;
            this._operation = 2 /* InstallOperation.Install */;
        }
        async doRun(token) {
            const [local, metadata] = await this.install(token);
            this._profileLocation = local.isBuiltin || local.isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : this.options.profileLocation;
            if (this.uriIdentityService.extUri.isEqual(this.userDataProfilesService.defaultProfile.extensionsResource, this._profileLocation)) {
                await this.extensionsScannerService.initializeDefaultProfileExtensions();
            }
            await this.extensionsProfileScannerService.addExtensionsToProfile([[local, metadata]], this._profileLocation);
            return local;
        }
        async extractExtension({ zipPath, key, metadata }, removeIfExists, token) {
            let local = await this.unsetIfUninstalled(key);
            if (!local) {
                this.logService.trace('Extracting extension...', key.id);
                local = await this.extensionsScanner.extractUserExtension(key, zipPath, metadata, removeIfExists, token);
                this.logService.info('Extracting extension completed.', key.id);
            }
            return local;
        }
        async unsetIfUninstalled(extensionKey) {
            const isUninstalled = await this.isUninstalled(extensionKey);
            if (!isUninstalled) {
                return undefined;
            }
            this.logService.trace('Removing the extension from uninstalled list:', extensionKey.id);
            // If the same version of extension is marked as uninstalled, remove it from there and return the local.
            await this.extensionsScanner.setInstalled(extensionKey);
            this.logService.info('Removed the extension from uninstalled list:', extensionKey.id);
            const userExtensions = await this.extensionsScanner.scanAllUserExtensions(true);
            return userExtensions.find(i => extensionManagementUtil_1.ExtensionKey.create(i).equals(extensionKey));
        }
        async isUninstalled(extensionId) {
            const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
            return !!uninstalled[extensionId.toString()];
        }
    }
    class InstallGalleryExtensionTask extends InstallExtensionTask {
        constructor(manifest, gallery, options, extensionsDownloader, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super(gallery.identifier, gallery, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.gallery = gallery;
            this.extensionsDownloader = extensionsDownloader;
        }
        async install(token) {
            const installed = await this.extensionsScanner.scanExtensions(null, this.options.profileLocation);
            const existingExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, this.gallery.identifier));
            if (existingExtension) {
                this._operation = 3 /* InstallOperation.Update */;
            }
            const metadata = {
                id: this.gallery.identifier.uuid,
                publisherId: this.gallery.publisherId,
                publisherDisplayName: this.gallery.publisherDisplayName,
                targetPlatform: this.gallery.properties.targetPlatform,
                isApplicationScoped: this.options.isApplicationScoped || existingExtension?.isApplicationScoped,
                isMachineScoped: this.options.isMachineScoped || existingExtension?.isMachineScoped,
                isBuiltin: this.options.isBuiltin || existingExtension?.isBuiltin,
                isSystem: existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined,
                updated: !!existingExtension,
                isPreReleaseVersion: this.gallery.properties.isPreReleaseVersion,
                installedTimestamp: Date.now(),
                pinned: this.options.installGivenVersion ? true : undefined,
                preRelease: this.gallery.properties.isPreReleaseVersion ||
                    ((0, types_1.isBoolean)(this.options.installPreReleaseVersion)
                        ? this.options.installPreReleaseVersion /* Respect the passed flag */
                        : existingExtension?.preRelease /* Respect the existing pre-release flag if it was set */)
            };
            if (existingExtension?.manifest.version === this.gallery.version) {
                const local = await this.extensionsScanner.updateMetadata(existingExtension, metadata);
                return [local, metadata];
            }
            const { location, verificationStatus } = await this.extensionsDownloader.download(this.gallery, this._operation, !this.options.donotVerifySignature);
            try {
                this._verificationStatus = verificationStatus;
                this.validateManifest(location.fsPath);
                const local = await this.extractExtension({ zipPath: location.fsPath, key: extensionManagementUtil_1.ExtensionKey.create(this.gallery), metadata }, false, token);
                return [local, metadata];
            }
            catch (error) {
                try {
                    await this.extensionsDownloader.delete(location);
                }
                catch (error) {
                    /* Ignore */
                    this.logService.warn(`Error while deleting the downloaded file`, location.toString(), (0, errors_1.getErrorMessage)(error));
                }
                throw error;
            }
        }
        async validateManifest(zipPath) {
            try {
                await (0, extensionManagementUtil_2.getManifest)(zipPath);
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError((0, abstractExtensionManagementService_1.joinErrors)(error).message, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
        }
    }
    exports.InstallGalleryExtensionTask = InstallGalleryExtensionTask;
    class InstallVSIXTask extends InstallExtensionTask {
        constructor(manifest, location, options, galleryService, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super({ id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) }, location, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.manifest = manifest;
            this.location = location;
            this.galleryService = galleryService;
        }
        async doRun(token) {
            const local = await super.doRun(token);
            this.updateMetadata(local, token);
            return local;
        }
        async install(token) {
            const extensionKey = new extensionManagementUtil_1.ExtensionKey(this.identifier, this.manifest.version);
            const installedExtensions = await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, this.options.profileLocation);
            const existing = installedExtensions.find(i => (0, extensionManagementUtil_1.areSameExtensions)(this.identifier, i.identifier));
            const metadata = {
                isApplicationScoped: this.options.isApplicationScoped || existing?.isApplicationScoped,
                isMachineScoped: this.options.isMachineScoped || existing?.isMachineScoped,
                isBuiltin: this.options.isBuiltin || existing?.isBuiltin,
                installedTimestamp: Date.now(),
                pinned: this.options.installGivenVersion ? true : undefined,
            };
            if (existing) {
                this._operation = 3 /* InstallOperation.Update */;
                if (extensionKey.equals(new extensionManagementUtil_1.ExtensionKey(existing.identifier, existing.manifest.version))) {
                    try {
                        await this.extensionsScanner.removeExtension(existing, 'existing');
                    }
                    catch (e) {
                        throw new Error(nls.localize('restartCode', "Please restart VS Code before reinstalling {0}.", this.manifest.displayName || this.manifest.name));
                    }
                }
                else if (!this.options.profileLocation && semver.gt(existing.manifest.version, this.manifest.version)) {
                    await this.extensionsScanner.setUninstalled(existing);
                }
            }
            else {
                // Remove the extension with same version if it is already uninstalled.
                // Installing a VSIX extension shall replace the existing extension always.
                const existing = await this.unsetIfUninstalled(extensionKey);
                if (existing) {
                    try {
                        await this.extensionsScanner.removeExtension(existing, 'existing');
                    }
                    catch (e) {
                        throw new Error(nls.localize('restartCode', "Please restart VS Code before reinstalling {0}.", this.manifest.displayName || this.manifest.name));
                    }
                }
            }
            const local = await this.extractExtension({ zipPath: path.resolve(this.location.fsPath), key: extensionKey, metadata }, true, token);
            return [local, metadata];
        }
        async updateMetadata(extension, token) {
            try {
                let [galleryExtension] = await this.galleryService.getExtensions([{ id: extension.identifier.id, version: extension.manifest.version }], token);
                if (!galleryExtension) {
                    [galleryExtension] = await this.galleryService.getExtensions([{ id: extension.identifier.id }], token);
                }
                if (galleryExtension) {
                    const metadata = {
                        id: galleryExtension.identifier.uuid,
                        publisherDisplayName: galleryExtension.publisherDisplayName,
                        publisherId: galleryExtension.publisherId,
                        isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion,
                        preRelease: galleryExtension.properties.isPreReleaseVersion || this.options.installPreReleaseVersion
                    };
                    await this.extensionsScanner.updateMetadata(extension, metadata, this.options.profileLocation);
                }
            }
            catch (error) {
                /* Ignore Error */
            }
        }
    }
    class UninstallExtensionTask extends abstractExtensionManagementService_1.AbstractExtensionTask {
        constructor(extension, profileLocation, extensionsProfileScannerService) {
            super();
            this.extension = extension;
            this.profileLocation = profileLocation;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
        }
        async doRun(token) {
            await this.extensionsProfileScannerService.removeExtensionFromProfile(this.extension, this.profileLocation);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L25vZGUvZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcURuRixRQUFBLHVDQUF1QyxHQUFHLElBQUEsc0NBQXNCLEVBQXVFLGlEQUEyQixDQUFDLENBQUM7SUFRakwsTUFBTSxzQkFBc0IsR0FBRyxTQUFTLENBQUM7SUFFbEMsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSx1RUFBa0M7UUFRakYsWUFDMkIsY0FBd0MsRUFDL0MsZ0JBQW1DLEVBQ3pDLFVBQXVCLEVBQ1Qsa0JBQTZDLEVBQzdDLHdCQUFvRSxFQUM3RCwrQkFBa0YsRUFDbEcsZUFBeUMsRUFDcEMsb0JBQTJDLEVBQ3BELFdBQTBDLEVBQ3ZDLGNBQStCLEVBQzNCLGtCQUF1QyxFQUNsQyx1QkFBaUQ7WUFFM0UsS0FBSyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFUckUsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEyQjtZQUM1QyxvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWtDO1lBQzFGLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUU1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQVh4QyxrQ0FBNkIsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQXNRL0UscUJBQWdCLEdBQUcsSUFBSSxpQkFBVyxFQUFFLENBQUM7WUFyUHJELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsd0NBQW1CLENBQUMsQ0FBQyxDQUFDO1lB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