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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/uri", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/log/common/log", "vs/platform/extensionManagement/common/abstractExtensionManagementService", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/product/common/productService", "vs/base/common/types", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays", "vs/base/common/strings", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/lifecycle"], function (require, exports, extensions_1, extensionManagement_1, uri_1, event_1, extensionManagementUtil_1, extensionManagement_2, log_1, abstractExtensionManagementService_1, telemetry_1, extensionManifestPropertiesService_1, productService_1, types_1, userDataProfile_1, arrays_1, strings_1, userDataProfile_2, uriIdentity_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebExtensionManagementService = void 0;
    let WebExtensionManagementService = class WebExtensionManagementService extends abstractExtensionManagementService_1.AbstractExtensionManagementService {
        get onProfileAwareInstallExtension() { return super.onInstallExtension; }
        get onInstallExtension() { return event_1.Event.filter(this.onProfileAwareInstallExtension, e => this.filterEvent(e), this.disposables); }
        get onProfileAwareDidInstallExtensions() { return super.onDidInstallExtensions; }
        get onDidInstallExtensions() {
            return event_1.Event.filter(event_1.Event.map(this.onProfileAwareDidInstallExtensions, results => results.filter(e => this.filterEvent(e)), this.disposables), results => results.length > 0, this.disposables);
        }
        get onProfileAwareUninstallExtension() { return super.onUninstallExtension; }
        get onUninstallExtension() { return event_1.Event.filter(this.onProfileAwareUninstallExtension, e => this.filterEvent(e), this.disposables); }
        get onProfileAwareDidUninstallExtension() { return super.onDidUninstallExtension; }
        get onDidUninstallExtension() { return event_1.Event.filter(this.onProfileAwareDidUninstallExtension, e => this.filterEvent(e), this.disposables); }
        constructor(extensionGalleryService, telemetryService, logService, webExtensionsScannerService, extensionManifestPropertiesService, userDataProfileService, productService, userDataProfilesService, uriIdentityService) {
            super(extensionGalleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService);
            this.webExtensionsScannerService = webExtensionsScannerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.userDataProfileService = userDataProfileService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this._onDidChangeProfile = this._register(new event_1.Emitter());
            this.onDidChangeProfile = this._onDidChangeProfile.event;
            this._register(userDataProfileService.onDidChangeCurrentProfile(e => {
                if (!this.uriIdentityService.extUri.isEqual(e.previous.extensionsResource, e.profile.extensionsResource)) {
                    e.join(this.whenProfileChanged(e));
                }
            }));
        }
        filterEvent({ profileLocation, applicationScoped }) {
            profileLocation = profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
            return applicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
        }
        async getTargetPlatform() {
            return "web" /* TargetPlatform.WEB */;
        }
        async canInstall(gallery) {
            if (await super.canInstall(gallery)) {
                return true;
            }
            if (this.isConfiguredToExecuteOnWeb(gallery)) {
                return true;
            }
            return false;
        }
        async getInstalled(type, profileLocation) {
            const extensions = [];
            if (type === undefined || type === 0 /* ExtensionType.System */) {
                const systemExtensions = await this.webExtensionsScannerService.scanSystemExtensions();
                extensions.push(...systemExtensions);
            }
            if (type === undefined || type === 1 /* ExtensionType.User */) {
                const userExtensions = await this.webExtensionsScannerService.scanUserExtensions(profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource);
                extensions.push(...userExtensions);
            }
            return extensions.map(e => toLocalExtension(e));
        }
        async install(location, options = {}) {
            this.logService.trace('ExtensionManagementService#install', location.toString());
            const manifest = await this.webExtensionsScannerService.scanExtensionManifest(location);
            if (!manifest) {
                throw new Error(`Cannot find packageJSON from the location ${location.toString()}`);
            }
            const result = await this.installExtensions([{ manifest, extension: location, options }]);
            if (result[0]?.local) {
                return result[0]?.local;
            }
            if (result[0]?.error) {
                throw result[0].error;
            }
            throw (0, abstractExtensionManagementService_1.toExtensionManagementError)(new Error(`Unknown error while installing extension ${(0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name)}`));
        }
        installFromLocation(location, profileLocation) {
            return this.install(location, { profileLocation });
        }
        async copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
            const target = await this.webExtensionsScannerService.scanExistingExtension(extension.location, extension.type, toProfileLocation);
            const source = await this.webExtensionsScannerService.scanExistingExtension(extension.location, extension.type, fromProfileLocation);
            metadata = { ...source?.metadata, ...metadata };
            let scanned;
            if (target) {
                scanned = await this.webExtensionsScannerService.updateMetadata(extension, { ...target.metadata, ...metadata }, toProfileLocation);
            }
            else {
                scanned = await this.webExtensionsScannerService.addExtension(extension.location, metadata, toProfileLocation);
            }
            return toLocalExtension(scanned);
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            const result = [];
            const extensionsToInstall = (await this.webExtensionsScannerService.scanUserExtensions(fromProfileLocation))
                .filter(e => extensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)(id, e.identifier)));
            if (extensionsToInstall.length) {
                await Promise.allSettled(extensionsToInstall.map(async (e) => {
                    let local = await this.installFromLocation(e.location, toProfileLocation);
                    if (e.metadata) {
                        local = await this.updateMetadata(local, e.metadata, fromProfileLocation);
                    }
                    result.push(local);
                }));
            }
            return result;
        }
        async updateMetadata(local, metadata, profileLocation) {
            // unset if false
            metadata.isMachineScoped = metadata.isMachineScoped || undefined;
            metadata.isBuiltin = metadata.isBuiltin || undefined;
            metadata.pinned = metadata.pinned || undefined;
            const updatedExtension = await this.webExtensionsScannerService.updateMetadata(local, metadata, profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource);
            const updatedLocalExtension = toLocalExtension(updatedExtension);
            this._onDidUpdateExtensionMetadata.fire(updatedLocalExtension);
            return updatedLocalExtension;
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            await this.webExtensionsScannerService.copyExtensions(fromProfileLocation, toProfileLocation, e => !e.metadata?.isApplicationScoped);
        }
        async getCompatibleVersion(extension, sameVersion, includePreRelease) {
            const compatibleExtension = await super.getCompatibleVersion(extension, sameVersion, includePreRelease);
            if (compatibleExtension) {
                return compatibleExtension;
            }
            if (this.isConfiguredToExecuteOnWeb(extension)) {
                return extension;
            }
            return null;
        }
        isConfiguredToExecuteOnWeb(gallery) {
            const configuredExtensionKind = this.extensionManifestPropertiesService.getUserConfiguredExtensionKind(gallery.identifier);
            return !!configuredExtensionKind && configuredExtensionKind.includes('web');
        }
        getCurrentExtensionsManifestLocation() {
            return this.userDataProfileService.currentProfile.extensionsResource;
        }
        createInstallExtensionTask(manifest, extension, options) {
            return new InstallExtensionTask(manifest, extension, options, this.webExtensionsScannerService, this.userDataProfilesService);
        }
        createUninstallExtensionTask(extension, options) {
            return new UninstallExtensionTask(extension, options, this.webExtensionsScannerService);
        }
        zip(extension) { throw new Error('unsupported'); }
        unzip(zipLocation) { throw new Error('unsupported'); }
        getManifest(vsix) { throw new Error('unsupported'); }
        download() { throw new Error('unsupported'); }
        reinstallFromGallery() { throw new Error('unsupported'); }
        async cleanUp() { }
        async whenProfileChanged(e) {
            const previousProfileLocation = e.previous.extensionsResource;
            const currentProfileLocation = e.profile.extensionsResource;
            if (!previousProfileLocation || !currentProfileLocation) {
                throw new Error('This should not happen');
            }
            const oldExtensions = await this.webExtensionsScannerService.scanUserExtensions(previousProfileLocation);
            const newExtensions = await this.webExtensionsScannerService.scanUserExtensions(currentProfileLocation);
            const { added, removed } = (0, arrays_1.delta)(oldExtensions, newExtensions, (a, b) => (0, strings_1.compare)(`${extensions_1.ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${extensions_1.ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
            this._onDidChangeProfile.fire({ added: added.map(e => toLocalExtension(e)), removed: removed.map(e => toLocalExtension(e)) });
        }
    };
    exports.WebExtensionManagementService = WebExtensionManagementService;
    exports.WebExtensionManagementService = WebExtensionManagementService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, log_1.ILogService),
        __param(3, extensionManagement_2.IWebExtensionsScannerService),
        __param(4, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(5, userDataProfile_1.IUserDataProfileService),
        __param(6, productService_1.IProductService),
        __param(7, userDataProfile_2.IUserDataProfilesService),
        __param(8, uriIdentity_1.IUriIdentityService)
    ], WebExtensionManagementService);
    function toLocalExtension(extension) {
        const metadata = getMetadata(undefined, extension);
        return {
            ...extension,
            identifier: { id: extension.identifier.id, uuid: metadata.id ?? extension.identifier.uuid },
            isMachineScoped: !!metadata.isMachineScoped,
            isApplicationScoped: !!metadata.isApplicationScoped,
            publisherId: metadata.publisherId || null,
            publisherDisplayName: metadata.publisherDisplayName || null,
            installedTimestamp: metadata.installedTimestamp,
            isPreReleaseVersion: !!metadata.isPreReleaseVersion,
            preRelease: !!metadata.preRelease,
            targetPlatform: "web" /* TargetPlatform.WEB */,
            updated: !!metadata.updated,
            pinned: !!metadata?.pinned,
        };
    }
    function getMetadata(options, existingExtension) {
        const metadata = { ...(existingExtension?.metadata || {}) };
        metadata.isMachineScoped = options?.isMachineScoped || metadata.isMachineScoped;
        return metadata;
    }
    class InstallExtensionTask extends abstractExtensionManagementService_1.AbstractExtensionTask {
        get profileLocation() { return this._profileLocation; }
        get operation() { return (0, types_1.isUndefined)(this.options.operation) ? this._operation : this.options.operation; }
        constructor(manifest, extension, options, webExtensionsScannerService, userDataProfilesService) {
            super();
            this.extension = extension;
            this.options = options;
            this.webExtensionsScannerService = webExtensionsScannerService;
            this.userDataProfilesService = userDataProfilesService;
            this._profileLocation = this.options.profileLocation;
            this._operation = 2 /* InstallOperation.Install */;
            this.identifier = uri_1.URI.isUri(extension) ? { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) } : extension.identifier;
            this.source = extension;
        }
        async doRun(token) {
            const userExtensions = await this.webExtensionsScannerService.scanUserExtensions(this.options.profileLocation);
            const existingExtension = userExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.identifier));
            if (existingExtension) {
                this._operation = 3 /* InstallOperation.Update */;
            }
            const metadata = getMetadata(this.options, existingExtension);
            if (!uri_1.URI.isUri(this.extension)) {
                metadata.id = this.extension.identifier.uuid;
                metadata.publisherDisplayName = this.extension.publisherDisplayName;
                metadata.publisherId = this.extension.publisherId;
                metadata.installedTimestamp = Date.now();
                metadata.isPreReleaseVersion = this.extension.properties.isPreReleaseVersion;
                metadata.isBuiltin = this.options.isBuiltin || existingExtension?.isBuiltin;
                metadata.isSystem = existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined;
                metadata.updated = !!existingExtension;
                metadata.isApplicationScoped = this.options.isApplicationScoped || metadata.isApplicationScoped;
                metadata.preRelease = this.extension.properties.isPreReleaseVersion ||
                    ((0, types_1.isBoolean)(this.options.installPreReleaseVersion)
                        ? this.options.installPreReleaseVersion /* Respect the passed flag */
                        : metadata?.preRelease /* Respect the existing pre-release flag if it was set */);
            }
            metadata.pinned = this.options.installGivenVersion ? true : undefined;
            this._profileLocation = metadata.isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : this.options.profileLocation;
            const scannedExtension = uri_1.URI.isUri(this.extension) ? await this.webExtensionsScannerService.addExtension(this.extension, metadata, this.profileLocation)
                : await this.webExtensionsScannerService.addExtensionFromGallery(this.extension, metadata, this.profileLocation);
            return toLocalExtension(scannedExtension);
        }
    }
    class UninstallExtensionTask extends abstractExtensionManagementService_1.AbstractExtensionTask {
        constructor(extension, options, webExtensionsScannerService) {
            super();
            this.extension = extension;
            this.options = options;
            this.webExtensionsScannerService = webExtensionsScannerService;
        }
        doRun(token) {
            return this.webExtensionsScannerService.removeExtension(this.extension, this.options.profileLocation);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViRXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vd2ViRXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0J6RixJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLHVFQUFrQztRQU1wRixJQUFJLDhCQUE4QixLQUFLLE9BQU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFhLGtCQUFrQixLQUFLLE9BQU8sYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0ksSUFBSSxrQ0FBa0MsS0FBSyxPQUFPLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7UUFDakYsSUFBYSxzQkFBc0I7WUFDbEMsT0FBTyxhQUFLLENBQUMsTUFBTSxDQUNsQixhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUN6SCxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsSUFBSSxnQ0FBZ0MsS0FB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