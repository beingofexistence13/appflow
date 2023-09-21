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
    exports.$Y3b = void 0;
    let $Y3b = class $Y3b extends abstractExtensionManagementService_1.$fp {
        get onProfileAwareInstallExtension() { return super.onInstallExtension; }
        get onInstallExtension() { return event_1.Event.filter(this.onProfileAwareInstallExtension, e => this.fb(e), this.f); }
        get onProfileAwareDidInstallExtensions() { return super.onDidInstallExtensions; }
        get onDidInstallExtensions() {
            return event_1.Event.filter(event_1.Event.map(this.onProfileAwareDidInstallExtensions, results => results.filter(e => this.fb(e)), this.f), results => results.length > 0, this.f);
        }
        get onProfileAwareUninstallExtension() { return super.onUninstallExtension; }
        get onUninstallExtension() { return event_1.Event.filter(this.onProfileAwareUninstallExtension, e => this.fb(e), this.f); }
        get onProfileAwareDidUninstallExtension() { return super.onDidUninstallExtension; }
        get onDidUninstallExtension() { return event_1.Event.filter(this.onProfileAwareDidUninstallExtension, e => this.fb(e), this.f); }
        constructor(extensionGalleryService, telemetryService, logService, cb, db, eb, productService, userDataProfilesService, uriIdentityService) {
            super(extensionGalleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService);
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.f = this.B(new lifecycle_1.$jc());
            this.bb = this.B(new event_1.$fd());
            this.onDidChangeProfile = this.bb.event;
            this.B(eb.onDidChangeCurrentProfile(e => {
                if (!this.D.extUri.isEqual(e.previous.extensionsResource, e.profile.extensionsResource)) {
                    e.join(this.mb(e));
                }
            }));
        }
        fb({ profileLocation, applicationScoped }) {
            profileLocation = profileLocation ?? this.eb.currentProfile.extensionsResource;
            return applicationScoped || this.D.extUri.isEqual(this.eb.currentProfile.extensionsResource, profileLocation);
        }
        async getTargetPlatform() {
            return "web" /* TargetPlatform.WEB */;
        }
        async canInstall(gallery) {
            if (await super.canInstall(gallery)) {
                return true;
            }
            if (this.ib(gallery)) {
                return true;
            }
            return false;
        }
        async getInstalled(type, profileLocation) {
            const extensions = [];
            if (type === undefined || type === 0 /* ExtensionType.System */) {
                const systemExtensions = await this.cb.scanSystemExtensions();
                extensions.push(...systemExtensions);
            }
            if (type === undefined || type === 1 /* ExtensionType.User */) {
                const userExtensions = await this.cb.scanUserExtensions(profileLocation ?? this.eb.currentProfile.extensionsResource);
                extensions.push(...userExtensions);
            }
            return extensions.map(e => toLocalExtension(e));
        }
        async install(location, options = {}) {
            this.F.trace('ExtensionManagementService#install', location.toString());
            const manifest = await this.cb.scanExtensionManifest(location);
            if (!manifest) {
                throw new Error(`Cannot find packageJSON from the location ${location.toString()}`);
            }
            const result = await this.I([{ manifest, extension: location, options }]);
            if (result[0]?.local) {
                return result[0]?.local;
            }
            if (result[0]?.error) {
                throw result[0].error;
            }
            throw (0, abstractExtensionManagementService_1.$hp)(new Error(`Unknown error while installing extension ${(0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name)}`));
        }
        installFromLocation(location, profileLocation) {
            return this.install(location, { profileLocation });
        }
        async ab(extension, fromProfileLocation, toProfileLocation, metadata) {
            const target = await this.cb.scanExistingExtension(extension.location, extension.type, toProfileLocation);
            const source = await this.cb.scanExistingExtension(extension.location, extension.type, fromProfileLocation);
            metadata = { ...source?.metadata, ...metadata };
            let scanned;
            if (target) {
                scanned = await this.cb.updateMetadata(extension, { ...target.metadata, ...metadata }, toProfileLocation);
            }
            else {
                scanned = await this.cb.addExtension(extension.location, metadata, toProfileLocation);
            }
            return toLocalExtension(scanned);
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            const result = [];
            const extensionsToInstall = (await this.cb.scanUserExtensions(fromProfileLocation))
                .filter(e => extensions.some(id => (0, extensionManagementUtil_1.$po)(id, e.identifier)));
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
            const updatedExtension = await this.cb.updateMetadata(local, metadata, profileLocation ?? this.eb.currentProfile.extensionsResource);
            const updatedLocalExtension = toLocalExtension(updatedExtension);
            this.w.fire(updatedLocalExtension);
            return updatedLocalExtension;
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            await this.cb.copyExtensions(fromProfileLocation, toProfileLocation, e => !e.metadata?.isApplicationScoped);
        }
        async P(extension, sameVersion, includePreRelease) {
            const compatibleExtension = await super.P(extension, sameVersion, includePreRelease);
            if (compatibleExtension) {
                return compatibleExtension;
            }
            if (this.ib(extension)) {
                return extension;
            }
            return null;
        }
        ib(gallery) {
            const configuredExtensionKind = this.db.getUserConfiguredExtensionKind(gallery.identifier);
            return !!configuredExtensionKind && configuredExtensionKind.includes('web');
        }
        Y() {
            return this.eb.currentProfile.extensionsResource;
        }
        Z(manifest, extension, options) {
            return new InstallExtensionTask(manifest, extension, options, this.cb, this.H);
        }
        $(extension, options) {
            return new UninstallExtensionTask(extension, options, this.cb);
        }
        zip(extension) { throw new Error('unsupported'); }
        unzip(zipLocation) { throw new Error('unsupported'); }
        getManifest(vsix) { throw new Error('unsupported'); }
        download() { throw new Error('unsupported'); }
        reinstallFromGallery() { throw new Error('unsupported'); }
        async cleanUp() { }
        async mb(e) {
            const previousProfileLocation = e.previous.extensionsResource;
            const currentProfileLocation = e.profile.extensionsResource;
            if (!previousProfileLocation || !currentProfileLocation) {
                throw new Error('This should not happen');
            }
            const oldExtensions = await this.cb.scanUserExtensions(previousProfileLocation);
            const newExtensions = await this.cb.scanUserExtensions(currentProfileLocation);
            const { added, removed } = (0, arrays_1.$Cb)(oldExtensions, newExtensions, (a, b) => (0, strings_1.$Fe)(`${extensions_1.$Vl.toKey(a.identifier.id)}@${a.manifest.version}`, `${extensions_1.$Vl.toKey(b.identifier.id)}@${b.manifest.version}`));
            this.bb.fire({ added: added.map(e => toLocalExtension(e)), removed: removed.map(e => toLocalExtension(e)) });
        }
    };
    exports.$Y3b = $Y3b;
    exports.$Y3b = $Y3b = __decorate([
        __param(0, extensionManagement_1.$Zn),
        __param(1, telemetry_1.$9k),
        __param(2, log_1.$5i),
        __param(3, extensionManagement_2.$jcb),
        __param(4, extensionManifestPropertiesService_1.$vcb),
        __param(5, userDataProfile_1.$CJ),
        __param(6, productService_1.$kj),
        __param(7, userDataProfile_2.$Ek),
        __param(8, uriIdentity_1.$Ck)
    ], $Y3b);
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
    class InstallExtensionTask extends abstractExtensionManagementService_1.$ip {
        get profileLocation() { return this.f; }
        get operation() { return (0, types_1.$qf)(this.options.operation) ? this.j : this.options.operation; }
        constructor(manifest, k, options, l, m) {
            super();
            this.k = k;
            this.options = options;
            this.l = l;
            this.m = m;
            this.f = this.options.profileLocation;
            this.j = 2 /* InstallOperation.Install */;
            this.identifier = uri_1.URI.isUri(k) ? { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) } : k.identifier;
            this.source = k;
        }
        async h(token) {
            const userExtensions = await this.l.scanUserExtensions(this.options.profileLocation);
            const existingExtension = userExtensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, this.identifier));
            if (existingExtension) {
                this.j = 3 /* InstallOperation.Update */;
            }
            const metadata = getMetadata(this.options, existingExtension);
            if (!uri_1.URI.isUri(this.k)) {
                metadata.id = this.k.identifier.uuid;
                metadata.publisherDisplayName = this.k.publisherDisplayName;
                metadata.publisherId = this.k.publisherId;
                metadata.installedTimestamp = Date.now();
                metadata.isPreReleaseVersion = this.k.properties.isPreReleaseVersion;
                metadata.isBuiltin = this.options.isBuiltin || existingExtension?.isBuiltin;
                metadata.isSystem = existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined;
                metadata.updated = !!existingExtension;
                metadata.isApplicationScoped = this.options.isApplicationScoped || metadata.isApplicationScoped;
                metadata.preRelease = this.k.properties.isPreReleaseVersion ||
                    ((0, types_1.$pf)(this.options.installPreReleaseVersion)
                        ? this.options.installPreReleaseVersion /* Respect the passed flag */
                        : metadata?.preRelease /* Respect the existing pre-release flag if it was set */);
            }
            metadata.pinned = this.options.installGivenVersion ? true : undefined;
            this.f = metadata.isApplicationScoped ? this.m.defaultProfile.extensionsResource : this.options.profileLocation;
            const scannedExtension = uri_1.URI.isUri(this.k) ? await this.l.addExtension(this.k, metadata, this.profileLocation)
                : await this.l.addExtensionFromGallery(this.k, metadata, this.profileLocation);
            return toLocalExtension(scannedExtension);
        }
    }
    class UninstallExtensionTask extends abstractExtensionManagementService_1.$ip {
        constructor(extension, f, j) {
            super();
            this.extension = extension;
            this.f = f;
            this.j = j;
        }
        h(token) {
            return this.j.removeExtension(this.extension, this.f.profileLocation);
        }
    }
});
//# sourceMappingURL=webExtensionManagementService.js.map