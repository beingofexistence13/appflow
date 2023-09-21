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
define(["require", "exports", "vs/nls", "vs/base/common/semver/semver", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/paging", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/workbench/services/host/browser/host", "vs/base/common/uri", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/editor/common/editorService", "vs/platform/url/common/url", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/base/common/cancellation", "vs/platform/storage/common/storage", "vs/platform/files/common/files", "vs/platform/extensions/common/extensions", "vs/editor/common/languages/language", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/base/common/platform", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls, semver, event_1, arrays_1, async_1, errors_1, lifecycle_1, paging_1, telemetry_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, instantiation_1, configuration_1, host_1, uri_1, extensions_1, editorService_1, url_1, extensionsInput_1, log_1, progress_1, notification_1, resources, cancellation_1, storage_1, files_1, extensions_2, language_1, productService_1, network_1, ignoredExtensions_1, userDataSync_1, contextkey_1, types_1, extensionManifestPropertiesService_1, extensions_3, extensionEditor_1, platform_1, languagePacks_1, locale_1, telemetryUtils_1, lifecycle_2, userDataProfile_1) {
    "use strict";
    var Extensions_1, ExtensionsWorkbenchService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsWorkbenchService = exports.Extension = void 0;
    let Extension = class Extension {
        constructor(stateProvider, runtimeStateProvider, server, local, gallery, galleryService, telemetryService, logService, fileService, productService) {
            this.stateProvider = stateProvider;
            this.runtimeStateProvider = runtimeStateProvider;
            this.server = server;
            this.local = local;
            this.gallery = gallery;
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.fileService = fileService;
            this.productService = productService;
            this.enablementState = 8 /* EnablementState.EnabledGlobally */;
            this.isMalicious = false;
        }
        get type() {
            return this.local ? this.local.type : 1 /* ExtensionType.User */;
        }
        get isBuiltin() {
            return this.local ? this.local.isBuiltin : false;
        }
        get name() {
            return this.gallery ? this.gallery.name : this.local.manifest.name;
        }
        get displayName() {
            if (this.gallery) {
                return this.gallery.displayName || this.gallery.name;
            }
            return this.local.manifest.displayName || this.local.manifest.name;
        }
        get identifier() {
            if (this.gallery) {
                return this.gallery.identifier;
            }
            return this.local.identifier;
        }
        get uuid() {
            return this.gallery ? this.gallery.identifier.uuid : this.local.identifier.uuid;
        }
        get publisher() {
            return this.gallery ? this.gallery.publisher : this.local.manifest.publisher;
        }
        get publisherDisplayName() {
            if (this.gallery) {
                return this.gallery.publisherDisplayName || this.gallery.publisher;
            }
            if (this.local?.publisherDisplayName) {
                return this.local.publisherDisplayName;
            }
            return this.local.manifest.publisher;
        }
        get publisherUrl() {
            if (!this.productService.extensionsGallery || !this.gallery) {
                return undefined;
            }
            return resources.joinPath(uri_1.URI.parse(this.productService.extensionsGallery.publisherUrl), this.publisher);
        }
        get publisherDomain() {
            return this.gallery?.publisherDomain;
        }
        get publisherSponsorLink() {
            return this.gallery?.publisherSponsorLink ? uri_1.URI.parse(this.gallery.publisherSponsorLink) : undefined;
        }
        get version() {
            return this.local ? this.local.manifest.version : this.latestVersion;
        }
        get pinned() {
            return !!this.local?.pinned;
        }
        get latestVersion() {
            return this.gallery ? this.gallery.version : this.local.manifest.version;
        }
        get description() {
            return this.gallery ? this.gallery.description : this.local.manifest.description || '';
        }
        get url() {
            if (!this.productService.extensionsGallery || !this.gallery) {
                return undefined;
            }
            return `${this.productService.extensionsGallery.itemUrl}?itemName=${this.publisher}.${this.name}`;
        }
        get iconUrl() {
            return this.galleryIconUrl || this.localIconUrl || this.defaultIconUrl;
        }
        get iconUrlFallback() {
            return this.galleryIconUrlFallback || this.localIconUrl || this.defaultIconUrl;
        }
        get localIconUrl() {
            if (this.local && this.local.manifest.icon) {
                return network_1.FileAccess.uriToBrowserUri(resources.joinPath(this.local.location, this.local.manifest.icon)).toString(true);
            }
            return null;
        }
        get galleryIconUrl() {
            return this.gallery?.assets.icon ? this.gallery.assets.icon.uri : null;
        }
        get galleryIconUrlFallback() {
            return this.gallery?.assets.icon ? this.gallery.assets.icon.fallbackUri : null;
        }
        get defaultIconUrl() {
            if (this.type === 0 /* ExtensionType.System */ && this.local) {
                if (this.local.manifest && this.local.manifest.contributes) {
                    if (Array.isArray(this.local.manifest.contributes.themes) && this.local.manifest.contributes.themes.length) {
                        return network_1.FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/theme-icon.png').toString(true);
                    }
                    if (Array.isArray(this.local.manifest.contributes.grammars) && this.local.manifest.contributes.grammars.length) {
                        return network_1.FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/language-icon.svg').toString(true);
                    }
                }
            }
            return extensionManagement_2.DefaultIconPath;
        }
        get repository() {
            return this.gallery && this.gallery.assets.repository ? this.gallery.assets.repository.uri : undefined;
        }
        get licenseUrl() {
            return this.gallery && this.gallery.assets.license ? this.gallery.assets.license.uri : undefined;
        }
        get state() {
            return this.stateProvider(this);
        }
        get installCount() {
            return this.gallery ? this.gallery.installCount : undefined;
        }
        get rating() {
            return this.gallery ? this.gallery.rating : undefined;
        }
        get ratingCount() {
            return this.gallery ? this.gallery.ratingCount : undefined;
        }
        get outdated() {
            try {
                if (!this.gallery || !this.local) {
                    return false;
                }
                // Do not allow updating system extensions in stable
                if (this.type === 0 /* ExtensionType.System */ && this.productService.quality === 'stable') {
                    return false;
                }
                if (!this.local.preRelease && this.gallery.properties.isPreReleaseVersion) {
                    return false;
                }
                if (semver.gt(this.latestVersion, this.version)) {
                    return true;
                }
                if (this.outdatedTargetPlatform) {
                    return true;
                }
            }
            catch (error) {
                /* Ignore */
            }
            return false;
        }
        get outdatedTargetPlatform() {
            return !!this.local && !!this.gallery
                && !["undefined" /* TargetPlatform.UNDEFINED */, "web" /* TargetPlatform.WEB */].includes(this.local.targetPlatform)
                && this.gallery.properties.targetPlatform !== "web" /* TargetPlatform.WEB */
                && this.local.targetPlatform !== this.gallery.properties.targetPlatform
                && semver.eq(this.latestVersion, this.version);
        }
        get reloadRequiredStatus() {
            return this.runtimeStateProvider(this);
        }
        get telemetryData() {
            const { local, gallery } = this;
            if (gallery) {
                return (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(gallery);
            }
            else {
                return (0, extensionManagementUtil_1.getLocalExtensionTelemetryData)(local);
            }
        }
        get preview() {
            return this.local?.manifest.preview ?? this.gallery?.preview ?? false;
        }
        get hasPreReleaseVersion() {
            return !!this.gallery?.hasPreReleaseVersion;
        }
        get hasReleaseVersion() {
            return !!this.gallery?.hasReleaseVersion;
        }
        getLocal() {
            return this.local && !this.outdated ? this.local : undefined;
        }
        async getManifest(token) {
            const local = this.getLocal();
            if (local) {
                return local.manifest;
            }
            if (this.gallery) {
                if (this.gallery.assets.manifest) {
                    return this.galleryService.getManifest(this.gallery, token);
                }
                this.logService.error(nls.localize('Manifest is not found', "Manifest is not found"), this.identifier.id);
                return null;
            }
            return null;
        }
        hasReadme() {
            if (this.local && this.local.readmeUrl) {
                return true;
            }
            if (this.gallery && this.gallery.assets.readme) {
                return true;
            }
            return this.type === 0 /* ExtensionType.System */;
        }
        async getReadme(token) {
            const local = this.getLocal();
            if (local?.readmeUrl) {
                const content = await this.fileService.readFile(local.readmeUrl);
                return content.value.toString();
            }
            if (this.gallery) {
                if (this.gallery.assets.readme) {
                    return this.galleryService.getReadme(this.gallery, token);
                }
                this.telemetryService.publicLog('extensions:NotFoundReadMe', this.telemetryData);
            }
            if (this.type === 0 /* ExtensionType.System */) {
                return Promise.resolve(`# ${this.displayName || this.name}
**Notice:** This extension is bundled with Visual Studio Code. It can be disabled but not uninstalled.
## Features
${this.description}
`);
            }
            return Promise.reject(new Error('not available'));
        }
        hasChangelog() {
            if (this.local && this.local.changelogUrl) {
                return true;
            }
            if (this.gallery && this.gallery.assets.changelog) {
                return true;
            }
            return this.type === 0 /* ExtensionType.System */;
        }
        async getChangelog(token) {
            const local = this.getLocal();
            if (local?.changelogUrl) {
                const content = await this.fileService.readFile(local.changelogUrl);
                return content.value.toString();
            }
            if (this.gallery?.assets.changelog) {
                return this.galleryService.getChangelog(this.gallery, token);
            }
            if (this.type === 0 /* ExtensionType.System */) {
                return Promise.resolve('Please check the [VS Code Release Notes](command:update.showCurrentReleaseNotes) for changes to the built-in extensions.');
            }
            return Promise.reject(new Error('not available'));
        }
        get categories() {
            const { local, gallery } = this;
            if (local && local.manifest.categories && !this.outdated) {
                return local.manifest.categories;
            }
            if (gallery) {
                return gallery.categories;
            }
            return [];
        }
        get tags() {
            const { gallery } = this;
            if (gallery) {
                return gallery.tags.filter(tag => !tag.startsWith('_'));
            }
            return [];
        }
        get dependencies() {
            const { local, gallery } = this;
            if (local && local.manifest.extensionDependencies && !this.outdated) {
                return local.manifest.extensionDependencies;
            }
            if (gallery) {
                return gallery.properties.dependencies || [];
            }
            return [];
        }
        get extensionPack() {
            const { local, gallery } = this;
            if (local && local.manifest.extensionPack && !this.outdated) {
                return local.manifest.extensionPack;
            }
            if (gallery) {
                return gallery.properties.extensionPack || [];
            }
            return [];
        }
    };
    exports.Extension = Extension;
    exports.Extension = Extension = __decorate([
        __param(5, extensionManagement_1.IExtensionGalleryService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, log_1.ILogService),
        __param(8, files_1.IFileService),
        __param(9, productService_1.IProductService)
    ], Extension);
    let Extensions = Extensions_1 = class Extensions extends lifecycle_1.Disposable {
        static updateExtensionFromControlManifest(extension, extensionsControlManifest) {
            extension.isMalicious = extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, identifier));
            extension.deprecationInfo = extensionsControlManifest.deprecated ? extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()] : undefined;
        }
        get onChange() { return this._onChange.event; }
        get onReset() { return this._onReset.event; }
        constructor(server, stateProvider, runtimeStateProvider, galleryService, extensionEnablementService, storageService, telemetryService, instantiationService) {
            super();
            this.server = server;
            this.stateProvider = stateProvider;
            this.runtimeStateProvider = runtimeStateProvider;
            this.galleryService = galleryService;
            this.extensionEnablementService = extensionEnablementService;
            this.storageService = storageService;
            this.telemetryService = telemetryService;
            this.instantiationService = instantiationService;
            this._onChange = this._register(new event_1.Emitter());
            this._onReset = this._register(new event_1.Emitter());
            this.installing = [];
            this.uninstalling = [];
            this.installed = [];
            this._register(server.extensionManagementService.onInstallExtension(e => this.onInstallExtension(e)));
            this._register(server.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
            this._register(server.extensionManagementService.onUninstallExtension(e => this.onUninstallExtension(e.identifier)));
            this._register(server.extensionManagementService.onDidUninstallExtension(e => this.onDidUninstallExtension(e)));
            this._register(server.extensionManagementService.onDidUpdateExtensionMetadata(e => this.onDidUpdateExtensionMetadata(e)));
            this._register(server.extensionManagementService.onDidChangeProfile(() => this.reset()));
            this._register(extensionEnablementService.onEnablementChanged(e => this.onEnablementChanged(e)));
            this._register(event_1.Event.any(this.onChange, this.onReset)(() => this._local = undefined));
        }
        get local() {
            if (!this._local) {
                this._local = [];
                for (const extension of this.installed) {
                    this._local.push(extension);
                }
                for (const extension of this.installing) {
                    if (!this.installed.some(installed => (0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, extension.identifier))) {
                        this._local.push(extension);
                    }
                }
            }
            return this._local;
        }
        async queryInstalled() {
            await this.fetchInstalledExtensions();
            this._onChange.fire(undefined);
            return this.local;
        }
        async syncInstalledExtensionsWithGallery(galleryExtensions) {
            let hasChanged = false;
            const extensions = await this.mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions);
            for (const [extension, gallery] of extensions) {
                // update metadata of the extension if it does not exist
                if (extension.local && !extension.local.identifier.uuid) {
                    extension.local = await this.updateMetadata(extension.local, gallery);
                }
                if (!extension.gallery || extension.gallery.version !== gallery.version || extension.gallery.properties.targetPlatform !== gallery.properties.targetPlatform) {
                    extension.gallery = gallery;
                    this._onChange.fire({ extension });
                    hasChanged = true;
                }
            }
            return hasChanged;
        }
        async mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions) {
            const mappedExtensions = this.mapInstalledExtensionWithGalleryExtension(galleryExtensions);
            const targetPlatform = await this.server.extensionManagementService.getTargetPlatform();
            const compatibleGalleryExtensions = [];
            const compatibleGalleryExtensionsToFetch = [];
            await Promise.allSettled(mappedExtensions.map(async ([extension, gallery]) => {
                if (extension.local) {
                    if (await this.galleryService.isExtensionCompatible(gallery, extension.local.preRelease, targetPlatform)) {
                        compatibleGalleryExtensions.push(gallery);
                    }
                    else {
                        compatibleGalleryExtensionsToFetch.push({ ...extension.local.identifier, preRelease: extension.local.preRelease });
                    }
                }
            }));
            if (compatibleGalleryExtensionsToFetch.length) {
                const result = await this.galleryService.getExtensions(compatibleGalleryExtensionsToFetch, { targetPlatform, compatible: true, queryAllVersions: true }, cancellation_1.CancellationToken.None);
                compatibleGalleryExtensions.push(...result);
            }
            return this.mapInstalledExtensionWithGalleryExtension(compatibleGalleryExtensions);
        }
        mapInstalledExtensionWithGalleryExtension(galleryExtensions) {
            const mappedExtensions = [];
            const byUUID = new Map(), byID = new Map();
            for (const gallery of galleryExtensions) {
                byUUID.set(gallery.identifier.uuid, gallery);
                byID.set(gallery.identifier.id.toLowerCase(), gallery);
            }
            for (const installed of this.installed) {
                if (installed.uuid) {
                    const gallery = byUUID.get(installed.uuid);
                    if (gallery) {
                        mappedExtensions.push([installed, gallery]);
                        continue;
                    }
                }
                const gallery = byID.get(installed.identifier.id.toLowerCase());
                if (gallery) {
                    mappedExtensions.push([installed, gallery]);
                }
            }
            return mappedExtensions;
        }
        async updateMetadata(localExtension, gallery) {
            let isPreReleaseVersion = false;
            if (localExtension.manifest.version !== gallery.version) {
                this.telemetryService.publicLog2('galleryService:updateMetadata');
                const galleryWithLocalVersion = (await this.galleryService.getExtensions([{ ...localExtension.identifier, version: localExtension.manifest.version }], cancellation_1.CancellationToken.None))[0];
                isPreReleaseVersion = !!galleryWithLocalVersion?.properties?.isPreReleaseVersion;
            }
            return this.server.extensionManagementService.updateMetadata(localExtension, { id: gallery.identifier.uuid, publisherDisplayName: gallery.publisherDisplayName, publisherId: gallery.publisherId, isPreReleaseVersion });
        }
        canInstall(galleryExtension) {
            return this.server.extensionManagementService.canInstall(galleryExtension);
        }
        onInstallExtension(event) {
            const { source } = event;
            if (source && !uri_1.URI.isUri(source)) {
                const extension = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, source.identifier))[0]
                    || this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, undefined, source);
                this.installing.push(extension);
                this._onChange.fire({ extension });
            }
        }
        async fetchInstalledExtensions() {
            const extensionsControlManifest = await this.server.extensionManagementService.getExtensionsControlManifest();
            const all = await this.migrateIgnoredAutoUpdateExtensions(await this.server.extensionManagementService.getInstalled());
            // dedup user and system extensions by giving priority to user extensions.
            const installed = (0, extensionManagementUtil_1.groupByExtension)(all, r => r.identifier).reduce((result, extensions) => {
                const extension = extensions.length === 1 ? extensions[0]
                    : extensions.find(e => e.type === 1 /* ExtensionType.User */) || extensions.find(e => e.type === 0 /* ExtensionType.System */);
                result.push(extension);
                return result;
            }, []);
            const byId = (0, arrays_1.index)(this.installed, e => e.local ? e.local.identifier.id : e.identifier.id);
            this.installed = installed.map(local => {
                const extension = byId[local.identifier.id] || this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, local, undefined);
                extension.local = local;
                extension.enablementState = this.extensionEnablementService.getEnablementState(local);
                Extensions_1.updateExtensionFromControlManifest(extension, extensionsControlManifest);
                return extension;
            });
        }
        async migrateIgnoredAutoUpdateExtensions(extensions) {
            const ignoredAutoUpdateExtensions = JSON.parse(this.storageService.get('extensions.ignoredAutoUpdateExtension', 0 /* StorageScope.PROFILE */, '[]') || '[]');
            if (!ignoredAutoUpdateExtensions.length) {
                return extensions;
            }
            const result = await Promise.all(extensions.map(extension => {
                if (ignoredAutoUpdateExtensions.indexOf(new extensionManagementUtil_1.ExtensionKey(extension.identifier, extension.manifest.version).toString()) !== -1) {
                    return this.server.extensionManagementService.updateMetadata(extension, { pinned: true });
                }
                return extension;
            }));
            this.storageService.remove('extensions.ignoredAutoUpdateExtension', 0 /* StorageScope.PROFILE */);
            return result;
        }
        async reset() {
            this.installed = [];
            this.installing = [];
            this.uninstalling = [];
            await this.fetchInstalledExtensions();
            this._onReset.fire();
        }
        async onDidInstallExtensions(results) {
            for (const event of results) {
                const { local, source } = event;
                const gallery = source && !uri_1.URI.isUri(source) ? source : undefined;
                const location = source && uri_1.URI.isUri(source) ? source : undefined;
                const installingExtension = gallery ? this.installing.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, gallery.identifier))[0] : null;
                this.installing = installingExtension ? this.installing.filter(e => e !== installingExtension) : this.installing;
                let extension = installingExtension ? installingExtension
                    : (location || local) ? this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, local, undefined)
                        : undefined;
                if (extension) {
                    if (local) {
                        const installed = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0];
                        if (installed) {
                            extension = installed;
                        }
                        else {
                            this.installed.push(extension);
                        }
                        extension.local = local;
                        if (!extension.gallery) {
                            extension.gallery = gallery;
                        }
                        Extensions_1.updateExtensionFromControlManifest(extension, await this.server.extensionManagementService.getExtensionsControlManifest());
                        extension.enablementState = this.extensionEnablementService.getEnablementState(local);
                    }
                }
                this._onChange.fire(!local || !extension ? undefined : { extension, operation: event.operation });
                if (extension && extension.local && !extension.gallery) {
                    await this.syncInstalledExtensionWithGallery(extension);
                }
            }
        }
        async onDidUpdateExtensionMetadata(local) {
            const extension = this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, local.identifier));
            if (extension?.local) {
                const hasChanged = extension.local.pinned !== local.pinned;
                extension.local = local;
                if (hasChanged) {
                    this._onChange.fire({ extension });
                }
            }
        }
        async syncInstalledExtensionWithGallery(extension) {
            if (!this.galleryService.isEnabled()) {
                return;
            }
            this.telemetryService.publicLog2('galleryService:matchInstalledExtension');
            const [compatible] = await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: extension.local?.preRelease }], { compatible: true, targetPlatform: await this.server.extensionManagementService.getTargetPlatform() }, cancellation_1.CancellationToken.None);
            if (compatible) {
                extension.gallery = compatible;
                this._onChange.fire({ extension });
            }
        }
        onUninstallExtension(identifier) {
            const extension = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))[0];
            if (extension) {
                const uninstalling = this.uninstalling.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))[0] || extension;
                this.uninstalling = [uninstalling, ...this.uninstalling.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))];
                this._onChange.fire(uninstalling ? { extension: uninstalling } : undefined);
            }
        }
        onDidUninstallExtension({ identifier, error }) {
            const uninstalled = this.uninstalling.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier)) || this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
            this.uninstalling = this.uninstalling.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
            if (!error) {
                this.installed = this.installed.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
            }
            if (uninstalled) {
                this._onChange.fire({ extension: uninstalled });
            }
        }
        onEnablementChanged(platformExtensions) {
            const extensions = this.local.filter(e => platformExtensions.some(p => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, p.identifier)));
            for (const extension of extensions) {
                if (extension.local) {
                    const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
                    if (enablementState !== extension.enablementState) {
                        extension.enablementState = enablementState;
                        this._onChange.fire({ extension: extension });
                    }
                }
            }
        }
        getExtensionState(extension) {
            if (extension.gallery && this.installing.some(e => !!e.gallery && (0, extensionManagementUtil_1.areSameExtensions)(e.gallery.identifier, extension.gallery.identifier))) {
                return 0 /* ExtensionState.Installing */;
            }
            if (this.uninstalling.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))) {
                return 2 /* ExtensionState.Uninstalling */;
            }
            const local = this.installed.filter(e => e === extension || (e.gallery && extension.gallery && (0, extensionManagementUtil_1.areSameExtensions)(e.gallery.identifier, extension.gallery.identifier)))[0];
            return local ? 1 /* ExtensionState.Installed */ : 3 /* ExtensionState.Uninstalled */;
        }
    };
    Extensions = Extensions_1 = __decorate([
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(5, storage_1.IStorageService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, instantiation_1.IInstantiationService)
    ], Extensions);
    let ExtensionsWorkbenchService = class ExtensionsWorkbenchService extends lifecycle_1.Disposable {
        static { ExtensionsWorkbenchService_1 = this; }
        static { this.UpdatesCheckInterval = 1000 * 60 * 60 * 12; } // 12 hours
        get onChange() { return this._onChange.event; }
        get onReset() { return this._onReset.event; }
        constructor(instantiationService, editorService, extensionManagementService, galleryService, configurationService, telemetryService, notificationService, urlService, extensionEnablementService, hostService, progressService, extensionManagementServerService, languageService, extensionsSyncManagementService, userDataAutoSyncService, productService, contextKeyService, extensionManifestPropertiesService, logService, extensionService, localeService, lifecycleService, fileService, userDataProfileService) {
            super();
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.extensionManagementService = extensionManagementService;
            this.galleryService = galleryService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
            this.extensionEnablementService = extensionEnablementService;
            this.hostService = hostService;
            this.progressService = progressService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.languageService = languageService;
            this.extensionsSyncManagementService = extensionsSyncManagementService;
            this.userDataAutoSyncService = userDataAutoSyncService;
            this.productService = productService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.logService = logService;
            this.extensionService = extensionService;
            this.localeService = localeService;
            this.lifecycleService = lifecycleService;
            this.fileService = fileService;
            this.userDataProfileService = userDataProfileService;
            this.localExtensions = null;
            this.remoteExtensions = null;
            this.webExtensions = null;
            this.extensionsServers = [];
            this._onChange = new event_1.Emitter();
            this._onReset = new event_1.Emitter();
            this.preferPreReleases = this.productService.quality !== 'stable';
            this.installing = [];
            this.tasksInProgress = [];
            const preferPreReleasesValue = configurationService.getValue('_extensions.preferPreReleases');
            if (!(0, types_1.isUndefined)(preferPreReleasesValue)) {
                this.preferPreReleases = !!preferPreReleasesValue;
            }
            this.hasOutdatedExtensionsContextKey = extensions_1.HasOutdatedExtensionsContext.bindTo(contextKeyService);
            if (extensionManagementServerService.localExtensionManagementServer) {
                this.localExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.localExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
                this._register(this.localExtensions.onChange(e => this.onDidChangeExtensions(e?.extension)));
                this._register(this.localExtensions.onReset(e => this.reset()));
                this.extensionsServers.push(this.localExtensions);
            }
            if (extensionManagementServerService.remoteExtensionManagementServer) {
                this.remoteExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.remoteExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
                this._register(this.remoteExtensions.onChange(e => this.onDidChangeExtensions(e?.extension)));
                this._register(this.remoteExtensions.onReset(e => this.reset()));
                this.extensionsServers.push(this.remoteExtensions);
            }
            if (extensionManagementServerService.webExtensionManagementServer) {
                this.webExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.webExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
                this._register(this.webExtensions.onChange(e => this.onDidChangeExtensions(e?.extension)));
                this._register(this.webExtensions.onReset(e => this.reset()));
                this.extensionsServers.push(this.webExtensions);
            }
            this.updatesCheckDelayer = new async_1.ThrottledDelayer(ExtensionsWorkbenchService_1.UpdatesCheckInterval);
            this.autoUpdateDelayer = new async_1.ThrottledDelayer(1000);
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.updatesCheckDelayer.cancel();
                this.autoUpdateDelayer.cancel();
            }));
            urlService.registerHandler(this);
            this.whenInitialized = this.initialize();
        }
        async initialize() {
            // initialize local extensions
            await Promise.all([this.queryLocal(), this.extensionService.whenInstalledExtensionsRegistered()]);
            if (this._store.isDisposed) {
                return;
            }
            this.onDidChangeRunningExtensions(this.extensionService.extensions, []);
            this._register(this.extensionService.onDidChangeExtensions(({ added, removed }) => this.onDidChangeRunningExtensions(added, removed)));
            await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
            if (this._store.isDisposed) {
                return;
            }
            this.initializeAutoUpdate();
            this.reportInstalledExtensionsTelemetry();
            this._register(event_1.Event.debounce(this.onChange, () => undefined, 100)(() => this.reportProgressFromOtherSources()));
        }
        initializeAutoUpdate() {
            // Register listeners for auto updates
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(extensions_1.AutoUpdateConfigurationKey)) {
                    if (this.isAutoUpdateEnabled()) {
                        this.checkForUpdates();
                    }
                }
                if (e.affectsConfiguration(extensions_1.AutoCheckUpdatesConfigurationKey)) {
                    if (this.isAutoCheckUpdatesEnabled()) {
                        this.checkForUpdates();
                    }
                }
            }));
            this._register(this.extensionEnablementService.onEnablementChanged(platformExtensions => {
                if (this.getAutoUpdateValue() === 'onlyEnabledExtensions' && platformExtensions.some(e => this.extensionEnablementService.isEnabled(e))) {
                    this.checkForUpdates();
                }
            }));
            this._register(event_1.Event.debounce(this.onChange, () => undefined, 100)(() => this.hasOutdatedExtensionsContextKey.set(this.outdated.length > 0)));
            // Update AutoUpdate Contexts
            this.hasOutdatedExtensionsContextKey.set(this.outdated.length > 0);
            // Check for updates
            this.eventuallyCheckForUpdates(true);
            if (platform_1.isWeb) {
                this.syncPinnedBuiltinExtensions();
                // Always auto update builtin extensions in web
                if (!this.isAutoUpdateEnabled()) {
                    this.autoUpdateBuiltinExtensions();
                }
            }
        }
        reportInstalledExtensionsTelemetry() {
            const extensionIds = this.installed.filter(extension => !extension.isBuiltin &&
                (extension.enablementState === 9 /* EnablementState.EnabledWorkspace */ ||
                    extension.enablementState === 8 /* EnablementState.EnabledGlobally */))
                .map(extension => extensions_2.ExtensionIdentifier.toKey(extension.identifier.id));
            this.telemetryService.publicLog2('installedExtensions', { extensionIds: new telemetryUtils_1.TelemetryTrustedValue(extensionIds.join(';')), count: extensionIds.length });
        }
        async onDidChangeRunningExtensions(added, removed) {
            const changedExtensions = [];
            const extsNotInstalled = [];
            for (const desc of added) {
                const extension = this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: desc.identifier.value, uuid: desc.uuid }, e.identifier));
                if (extension) {
                    changedExtensions.push(extension);
                }
                else {
                    extsNotInstalled.push({ id: desc.identifier.value, uuid: desc.uuid });
                }
            }
            if (extsNotInstalled.length) {
                const extensions = await this.getExtensions(extsNotInstalled, cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    changedExtensions.push(extension);
                }
            }
            for (const changedExtension of changedExtensions) {
                this._onChange.fire(changedExtension);
            }
        }
        reset() {
            for (const task of this.tasksInProgress) {
                task.cancel();
            }
            this.tasksInProgress = [];
            this.installing = [];
            this.onDidChangeExtensions();
            this._onReset.fire();
        }
        onDidChangeExtensions(extension) {
            this._installed = undefined;
            this._local = undefined;
            this._onChange.fire(extension);
        }
        get local() {
            if (!this._local) {
                if (this.extensionsServers.length === 1) {
                    this._local = this.installed;
                }
                else {
                    this._local = [];
                    const byId = (0, extensionManagementUtil_1.groupByExtension)(this.installed, r => r.identifier);
                    for (const extensions of byId) {
                        this._local.push(this.getPrimaryExtension(extensions));
                    }
                }
            }
            return this._local;
        }
        get installed() {
            if (!this._installed) {
                this._installed = [];
                for (const extensions of this.extensionsServers) {
                    for (const extension of extensions.local) {
                        this._installed.push(extension);
                    }
                }
            }
            return this._installed;
        }
        get outdated() {
            return this.installed.filter(e => e.outdated && e.local && e.state === 1 /* ExtensionState.Installed */);
        }
        async queryLocal(server) {
            if (server) {
                if (this.localExtensions && this.extensionManagementServerService.localExtensionManagementServer === server) {
                    return this.localExtensions.queryInstalled();
                }
                if (this.remoteExtensions && this.extensionManagementServerService.remoteExtensionManagementServer === server) {
                    return this.remoteExtensions.queryInstalled();
                }
                if (this.webExtensions && this.extensionManagementServerService.webExtensionManagementServer === server) {
                    return this.webExtensions.queryInstalled();
                }
            }
            if (this.localExtensions) {
                try {
                    await this.localExtensions.queryInstalled();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            if (this.remoteExtensions) {
                try {
                    await this.remoteExtensions.queryInstalled();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            if (this.webExtensions) {
                try {
                    await this.webExtensions.queryInstalled();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            return this.local;
        }
        async queryGallery(arg1, arg2) {
            if (!this.galleryService.isEnabled()) {
                return (0, paging_1.singlePagePager)([]);
            }
            const options = cancellation_1.CancellationToken.isCancellationToken(arg1) ? {} : arg1;
            const token = cancellation_1.CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
            options.text = options.text ? this.resolveQueryText(options.text) : options.text;
            options.includePreRelease = (0, types_1.isUndefined)(options.includePreRelease) ? this.preferPreReleases : options.includePreRelease;
            const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
            const pager = await this.galleryService.query(options, token);
            this.syncInstalledExtensionsWithGallery(pager.firstPage);
            return {
                firstPage: pager.firstPage.map(gallery => this.fromGallery(gallery, extensionsControlManifest)),
                total: pager.total,
                pageSize: pager.pageSize,
                getPage: async (pageIndex, token) => {
                    const page = await pager.getPage(pageIndex, token);
                    this.syncInstalledExtensionsWithGallery(page);
                    return page.map(gallery => this.fromGallery(gallery, extensionsControlManifest));
                }
            };
        }
        async getExtensions(extensionInfos, arg1, arg2) {
            if (!this.galleryService.isEnabled()) {
                return [];
            }
            extensionInfos.forEach(e => e.preRelease = e.preRelease ?? this.preferPreReleases);
            const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
            const galleryExtensions = await this.galleryService.getExtensions(extensionInfos, arg1, arg2);
            this.syncInstalledExtensionsWithGallery(galleryExtensions);
            return galleryExtensions.map(gallery => this.fromGallery(gallery, extensionsControlManifest));
        }
        resolveQueryText(text) {
            text = text.replace(/@web/g, `tag:"${extensionManagement_1.WEB_EXTENSION_TAG}"`);
            const extensionRegex = /\bext:([^\s]+)\b/g;
            if (extensionRegex.test(text)) {
                text = text.replace(extensionRegex, (m, ext) => {
                    // Get curated keywords
                    const lookup = this.productService.extensionKeywords || {};
                    const keywords = lookup[ext] || [];
                    // Get mode name
                    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(`.${ext}`));
                    const languageName = languageId && this.languageService.getLanguageName(languageId);
                    const languageTag = languageName ? ` tag:"${languageName}"` : '';
                    // Construct a rich query
                    return `tag:"__ext_${ext}" tag:"__ext_.${ext}" ${keywords.map(tag => `tag:"${tag}"`).join(' ')}${languageTag} tag:"${ext}"`;
                });
            }
            return text.substr(0, 350);
        }
        fromGallery(gallery, extensionsControlManifest) {
            let extension = this.getInstalledExtensionMatchingGallery(gallery);
            if (!extension) {
                extension = this.instantiationService.createInstance(Extension, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext), undefined, undefined, gallery);
                Extensions.updateExtensionFromControlManifest(extension, extensionsControlManifest);
            }
            return extension;
        }
        getInstalledExtensionMatchingGallery(gallery) {
            for (const installed of this.local) {
                if (installed.identifier.uuid) { // Installed from Gallery
                    if (installed.identifier.uuid === gallery.identifier.uuid) {
                        return installed;
                    }
                }
                else {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, gallery.identifier)) { // Installed from other sources
                        return installed;
                    }
                }
            }
            return null;
        }
        async open(extension, options) {
            if (typeof extension === 'string') {
                const id = extension;
                extension = this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id })) ?? (await this.getExtensions([{ id: extension }], cancellation_1.CancellationToken.None))[0];
            }
            if (!extension) {
                throw new Error(`Extension not found. ${extension}`);
            }
            const editor = await this.editorService.openEditor(this.instantiationService.createInstance(extensionsInput_1.ExtensionsInput, extension), options, options?.sideByside ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            if (options?.tab && editor instanceof extensionEditor_1.ExtensionEditor) {
                await editor.openTab(options.tab);
            }
        }
        getExtensionStatus(extension) {
            const extensionsStatus = this.extensionService.getExtensionsStatus();
            for (const id of Object.keys(extensionsStatus)) {
                if ((0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)) {
                    return extensionsStatus[id];
                }
            }
            return undefined;
        }
        getReloadStatus(extension) {
            const isUninstalled = extension.state === 3 /* ExtensionState.Uninstalled */;
            const runningExtension = this.extensionService.extensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, extension.identifier));
            if (isUninstalled) {
                const canRemoveRunningExtension = runningExtension && this.extensionService.canRemoveExtension(runningExtension);
                const isSameExtensionRunning = runningExtension && (!extension.server || extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension)));
                if (!canRemoveRunningExtension && isSameExtensionRunning) {
                    return nls.localize('postUninstallTooltip', "Please reload Visual Studio Code to complete the uninstallation of this extension.");
                }
                return undefined;
            }
            if (extension.local) {
                const isSameExtensionRunning = runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension));
                const isEnabled = this.extensionEnablementService.isEnabled(extension.local);
                // Extension is running
                if (runningExtension) {
                    if (isEnabled) {
                        // No Reload is required if extension can run without reload
                        if (this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local))) {
                            return undefined;
                        }
                        const runningExtensionServer = this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension));
                        if (isSameExtensionRunning) {
                            // Different version or target platform of same extension is running. Requires reload to run the current version
                            if (!runningExtension.isUnderDevelopment && (extension.version !== runningExtension.version || extension.local.targetPlatform !== runningExtension.targetPlatform)) {
                                return nls.localize('postUpdateTooltip', "Please reload Visual Studio Code to enable the updated extension.");
                            }
                            if (this.extensionsServers.length > 1) {
                                const extensionInOtherServer = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier) && e.server !== extension.server)[0];
                                if (extensionInOtherServer) {
                                    // This extension prefers to run on UI/Local side but is running in remote
                                    if (runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(extension.local.manifest) && extensionInOtherServer.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                        return nls.localize('enable locally', "Please reload Visual Studio Code to enable this extension locally.");
                                    }
                                    // This extension prefers to run on Workspace/Remote side but is running in local
                                    if (runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(extension.local.manifest) && extensionInOtherServer.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                        return nls.localize('enable remote', "Please reload Visual Studio Code to enable this extension in {0}.", this.extensionManagementServerService.remoteExtensionManagementServer?.label);
                                    }
                                }
                            }
                        }
                        else {
                            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                // This extension prefers to run on UI/Local side but is running in remote
                                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(extension.local.manifest)) {
                                    return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                                }
                            }
                            if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                                // This extension prefers to run on Workspace/Remote side but is running in local
                                if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(extension.local.manifest)) {
                                    return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                                }
                            }
                        }
                        return undefined;
                    }
                    else {
                        if (isSameExtensionRunning) {
                            return nls.localize('postDisableTooltip', "Please reload Visual Studio Code to disable this extension.");
                        }
                    }
                    return undefined;
                }
                // Extension is not running
                else {
                    if (isEnabled && !this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local))) {
                        return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                    }
                    const otherServer = extension.server ? extension.server === this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.remoteExtensionManagementServer : this.extensionManagementServerService.localExtensionManagementServer : null;
                    if (otherServer && extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                        const extensionInOtherServer = this.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier) && e.server === otherServer)[0];
                        // Same extension in other server exists and
                        if (extensionInOtherServer && extensionInOtherServer.local && this.extensionEnablementService.isEnabled(extensionInOtherServer.local)) {
                            return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                        }
                    }
                }
            }
            return undefined;
        }
        getPrimaryExtension(extensions) {
            if (extensions.length === 1) {
                return extensions[0];
            }
            const enabledExtensions = extensions.filter(e => e.local && this.extensionEnablementService.isEnabled(e.local));
            if (enabledExtensions.length === 1) {
                return enabledExtensions[0];
            }
            const extensionsToChoose = enabledExtensions.length ? enabledExtensions : extensions;
            const manifest = extensionsToChoose.find(e => e.local && e.local.manifest)?.local?.manifest;
            // Manifest is not found which should not happen.
            // In which case return the first extension.
            if (!manifest) {
                return extensionsToChoose[0];
            }
            const extensionKinds = this.extensionManifestPropertiesService.getExtensionKind(manifest);
            let extension = extensionsToChoose.find(extension => {
                for (const extensionKind of extensionKinds) {
                    switch (extensionKind) {
                        case 'ui':
                            /* UI extension is chosen only if it is installed locally */
                            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'workspace':
                            /* Choose remote workspace extension if exists */
                            if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'web':
                            /* Choose web extension if exists */
                            if (extension.server === this.extensionManagementServerService.webExtensionManagementServer) {
                                return true;
                            }
                            return false;
                    }
                }
                return false;
            });
            if (!extension && this.extensionManagementServerService.localExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'workspace':
                                /* Choose local workspace extension if exists */
                                if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                            case 'web':
                                /* Choose local web extension if exists */
                                if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            if (!extension && this.extensionManagementServerService.webExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'web':
                                /* Choose web extension if exists */
                                if (extension.server === this.extensionManagementServerService.webExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            if (!extension && this.extensionManagementServerService.remoteExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'web':
                                /* Choose remote web extension if exists */
                                if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            return extension || extensions[0];
        }
        getExtensionState(extension) {
            if (this.installing.some(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier) && (!extension.server || i.server === extension.server))) {
                return 0 /* ExtensionState.Installing */;
            }
            if (this.remoteExtensions) {
                const state = this.remoteExtensions.getExtensionState(extension);
                if (state !== 3 /* ExtensionState.Uninstalled */) {
                    return state;
                }
            }
            if (this.webExtensions) {
                const state = this.webExtensions.getExtensionState(extension);
                if (state !== 3 /* ExtensionState.Uninstalled */) {
                    return state;
                }
            }
            if (this.localExtensions) {
                return this.localExtensions.getExtensionState(extension);
            }
            return 3 /* ExtensionState.Uninstalled */;
        }
        async checkForUpdates(onlyBuiltin) {
            if (!this.galleryService.isEnabled()) {
                return;
            }
            const extensions = [];
            if (this.localExtensions) {
                extensions.push(this.localExtensions);
            }
            if (this.remoteExtensions) {
                extensions.push(this.remoteExtensions);
            }
            if (this.webExtensions) {
                extensions.push(this.webExtensions);
            }
            if (!extensions.length) {
                return;
            }
            const infos = [];
            for (const installed of this.local) {
                if (onlyBuiltin && !installed.isBuiltin) {
                    // Skip if check updates only for builtin extensions and current extension is not builtin.
                    continue;
                }
                if (installed.isBuiltin && !installed.pinned && (installed.type === 0 /* ExtensionType.System */ || !installed.local?.identifier.uuid)) {
                    // Skip checking updates for a builtin extension if it is a system extension or if it does not has Marketplace identifier
                    continue;
                }
                infos.push({ ...installed.identifier, preRelease: !!installed.local?.preRelease });
            }
            if (infos.length) {
                const targetPlatform = await extensions[0].server.extensionManagementService.getTargetPlatform();
                this.telemetryService.publicLog2('galleryService:checkingForUpdates', {
                    count: infos.length,
                });
                const galleryExtensions = await this.galleryService.getExtensions(infos, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
                if (galleryExtensions.length) {
                    await this.syncInstalledExtensionsWithGallery(galleryExtensions);
                }
            }
        }
        async syncInstalledExtensionsWithGallery(gallery) {
            const extensions = [];
            if (this.localExtensions) {
                extensions.push(this.localExtensions);
            }
            if (this.remoteExtensions) {
                extensions.push(this.remoteExtensions);
            }
            if (this.webExtensions) {
                extensions.push(this.webExtensions);
            }
            if (!extensions.length) {
                return;
            }
            const result = await Promise.allSettled(extensions.map(extensions => extensions.syncInstalledExtensionsWithGallery(gallery)));
            if (this.isAutoUpdateEnabled() && result.some(r => r.status === 'fulfilled' && r.value)) {
                this.eventuallyAutoUpdateExtensions();
            }
        }
        getAutoUpdateValue() {
            const autoUpdate = this.configurationService.getValue(extensions_1.AutoUpdateConfigurationKey);
            return (0, types_1.isBoolean)(autoUpdate) || autoUpdate === 'onlyEnabledExtensions' ? autoUpdate : true;
        }
        isAutoUpdateEnabled() {
            return this.getAutoUpdateValue() !== false;
        }
        isAutoCheckUpdatesEnabled() {
            return this.configurationService.getValue(extensions_1.AutoCheckUpdatesConfigurationKey);
        }
        eventuallyCheckForUpdates(immediate = false) {
            this.updatesCheckDelayer.trigger(async () => {
                if (this.isAutoUpdateEnabled() || this.isAutoCheckUpdatesEnabled()) {
                    await this.checkForUpdates();
                }
                this.eventuallyCheckForUpdates();
            }, immediate ? 0 : ExtensionsWorkbenchService_1.UpdatesCheckInterval).then(undefined, err => null);
        }
        eventuallyAutoUpdateExtensions() {
            this.autoUpdateDelayer.trigger(() => this.autoUpdateExtensions())
                .then(undefined, err => null);
        }
        async autoUpdateBuiltinExtensions() {
            await this.checkForUpdates(true);
            const toUpdate = this.outdated.filter(e => e.isBuiltin);
            await async_1.Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
        }
        async syncPinnedBuiltinExtensions() {
            const infos = [];
            for (const installed of this.local) {
                if (installed.isBuiltin && installed.pinned && installed.local?.identifier.uuid) {
                    infos.push({ ...installed.identifier, version: installed.version });
                }
            }
            if (infos.length) {
                const galleryExtensions = await this.galleryService.getExtensions(infos, cancellation_1.CancellationToken.None);
                if (galleryExtensions.length) {
                    await this.syncInstalledExtensionsWithGallery(galleryExtensions);
                }
            }
        }
        autoUpdateExtensions() {
            if (!this.isAutoUpdateEnabled()) {
                return Promise.resolve();
            }
            const toUpdate = this.outdated.filter(e => !e.pinned &&
                (this.getAutoUpdateValue() === true || (e.local && this.extensionEnablementService.isEnabled(e.local))));
            return async_1.Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
        }
        async pinExtension(extension, pinned) {
            if (!extension.local) {
                throw new Error('Only installed extensions can be pinned');
            }
            await this.extensionManagementService.updateMetadata(extension.local, { pinned });
        }
        async canInstall(extension) {
            if (!(extension instanceof Extension)) {
                return false;
            }
            if (extension.isMalicious) {
                return false;
            }
            if (extension.deprecationInfo?.disallowInstall) {
                return false;
            }
            if (!extension.gallery) {
                return false;
            }
            if (this.localExtensions && await this.localExtensions.canInstall(extension.gallery)) {
                return true;
            }
            if (this.remoteExtensions && await this.remoteExtensions.canInstall(extension.gallery)) {
                return true;
            }
            if (this.webExtensions && await this.webExtensions.canInstall(extension.gallery)) {
                return true;
            }
            return false;
        }
        install(extension, installOptions, progressLocation) {
            return this.doInstall(extension, async () => {
                if (extension instanceof uri_1.URI) {
                    return this.installFromVSIX(extension, installOptions);
                }
                if (extension.isMalicious) {
                    throw new Error(nls.localize('malicious', "This extension is reported to be problematic."));
                }
                if (!extension.gallery) {
                    throw new Error('Missing gallery');
                }
                return this.installFromGallery(extension, extension.gallery, installOptions);
            }, progressLocation);
        }
        async installInServer(extension, server) {
            await this.doInstall(extension, async () => {
                const local = extension.local;
                if (!local) {
                    throw new Error('Extension not found');
                }
                if (!extension.gallery) {
                    extension = (await this.getExtensions([{ ...extension.identifier, preRelease: local.preRelease }], cancellation_1.CancellationToken.None))[0] ?? extension;
                }
                if (extension.gallery) {
                    return server.extensionManagementService.installFromGallery(extension.gallery, { installPreReleaseVersion: local.preRelease });
                }
                const targetPlatform = await server.extensionManagementService.getTargetPlatform();
                if (!(0, extensionManagement_1.isTargetPlatformCompatible)(local.targetPlatform, [local.targetPlatform], targetPlatform)) {
                    throw new Error(nls.localize('incompatible', "Can't install '{0}' extension because it is not compatible.", extension.identifier.id));
                }
                const vsix = await this.extensionManagementService.zip(local);
                try {
                    return await server.extensionManagementService.install(vsix);
                }
                finally {
                    try {
                        await this.fileService.del(vsix);
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
            });
        }
        canSetLanguage(extension) {
            if (!platform_1.isWeb) {
                return false;
            }
            if (!extension.gallery) {
                return false;
            }
            const locale = (0, languagePacks_1.getLocale)(extension.gallery);
            if (!locale) {
                return false;
            }
            return true;
        }
        async setLanguage(extension) {
            if (!this.canSetLanguage(extension)) {
                throw new Error('Can not set language');
            }
            const locale = (0, languagePacks_1.getLocale)(extension.gallery);
            if (locale === platform_1.language) {
                return;
            }
            const localizedLanguageName = extension.gallery?.properties?.localizedLanguages?.[0];
            return this.localeService.setLocale({ id: locale, galleryExtension: extension.gallery, extensionId: extension.identifier.id, label: localizedLanguageName ?? extension.displayName });
        }
        setEnablement(extensions, enablementState) {
            extensions = Array.isArray(extensions) ? extensions : [extensions];
            return this.promptAndSetEnablement(extensions, enablementState);
        }
        uninstall(extension) {
            const ext = extension.local ? extension : this.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0];
            const toUninstall = ext && ext.local ? ext.local : null;
            if (!toUninstall) {
                return Promise.reject(new Error('Missing local'));
            }
            return this.withProgress({
                location: 5 /* ProgressLocation.Extensions */,
                title: nls.localize('uninstallingExtension', 'Uninstalling extension....'),
                source: `${toUninstall.identifier.id}`
            }, () => this.extensionManagementService.uninstall(toUninstall).then(() => undefined));
        }
        async installVersion(extension, version, installOptions = {}) {
            return this.doInstall(extension, async () => {
                if (!extension.gallery) {
                    throw new Error('Missing gallery');
                }
                const targetPlatform = extension.server ? await extension.server.extensionManagementService.getTargetPlatform() : undefined;
                const [gallery] = await this.galleryService.getExtensions([{ id: extension.gallery.identifier.id, version }], { targetPlatform }, cancellation_1.CancellationToken.None);
                if (!gallery) {
                    throw new Error(nls.localize('not found', "Unable to install extension '{0}' because the requested version '{1}' is not found.", extension.gallery.identifier.id, version));
                }
                installOptions.installGivenVersion = true;
                return this.installFromGallery(extension, gallery, installOptions);
            });
        }
        reinstall(extension) {
            return this.doInstall(extension, () => {
                const ext = extension.local ? extension : this.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0];
                const toReinstall = ext && ext.local ? ext.local : null;
                if (!toReinstall) {
                    throw new Error('Missing local');
                }
                return this.extensionManagementService.reinstallFromGallery(toReinstall);
            });
        }
        isExtensionIgnoredToSync(extension) {
            return extension.local ? !this.isInstalledExtensionSynced(extension.local)
                : this.extensionsSyncManagementService.hasToNeverSyncExtension(extension.identifier.id);
        }
        async toggleExtensionIgnoredToSync(extension) {
            const isIgnored = this.isExtensionIgnoredToSync(extension);
            if (extension.local && isIgnored) {
                extension.local = await this.updateSynchronizingInstalledExtension(extension.local, true);
                this._onChange.fire(extension);
            }
            else {
                this.extensionsSyncManagementService.updateIgnoredExtensions(extension.identifier.id, !isIgnored);
            }
            await this.userDataAutoSyncService.triggerSync(['IgnoredExtensionsUpdated'], false, false);
        }
        async toggleApplyExtensionToAllProfiles(extension) {
            if (!extension.local || (0, extensions_2.isApplicationScopedExtension)(extension.local.manifest) || extension.isBuiltin) {
                return;
            }
            await this.extensionManagementService.toggleAppliationScope(extension.local, this.userDataProfileService.currentProfile.extensionsResource);
        }
        isInstalledExtensionSynced(extension) {
            if (extension.isMachineScoped) {
                return false;
            }
            if (this.extensionsSyncManagementService.hasToAlwaysSyncExtension(extension.identifier.id)) {
                return true;
            }
            return !this.extensionsSyncManagementService.hasToNeverSyncExtension(extension.identifier.id);
        }
        async updateSynchronizingInstalledExtension(extension, sync) {
            const isMachineScoped = !sync;
            if (extension.isMachineScoped !== isMachineScoped) {
                extension = await this.extensionManagementService.updateMetadata(extension, { isMachineScoped });
            }
            if (sync) {
                this.extensionsSyncManagementService.updateIgnoredExtensions(extension.identifier.id, false);
            }
            return extension;
        }
        doInstall(extension, installTask, progressLocation) {
            const title = extension instanceof uri_1.URI ? nls.localize('installing extension', 'Installing extension....') : nls.localize('installing named extension', "Installing '{0}' extension....", extension.displayName);
            return this.withProgress({
                location: progressLocation ?? 5 /* ProgressLocation.Extensions */,
                title
            }, async () => {
                try {
                    if (!(extension instanceof uri_1.URI)) {
                        this.installing.push(extension);
                        this._onChange.fire(extension);
                    }
                    const local = await installTask();
                    return await this.waitAndGetInstalledExtension(local.identifier);
                }
                finally {
                    if (!(extension instanceof uri_1.URI)) {
                        this.installing = this.installing.filter(e => e !== extension);
                        // Trigger the change without passing the extension because it is replaced by a new instance.
                        this._onChange.fire(undefined);
                    }
                }
            });
        }
        async installFromVSIX(vsix, installOptions) {
            const manifest = await this.extensionManagementService.getManifest(vsix);
            const existingExtension = this.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) }));
            if (existingExtension && existingExtension.latestVersion !== manifest.version) {
                installOptions = installOptions || {};
                installOptions.installGivenVersion = true;
            }
            return this.extensionManagementService.installVSIX(vsix, manifest, installOptions);
        }
        installFromGallery(extension, gallery, installOptions) {
            if (extension.local) {
                return this.extensionManagementService.updateFromGallery(gallery, extension.local, installOptions);
            }
            else {
                return this.extensionManagementService.installFromGallery(gallery, installOptions);
            }
        }
        async waitAndGetInstalledExtension(identifier) {
            let installedExtension = this.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, identifier));
            if (!installedExtension) {
                await event_1.Event.toPromise(event_1.Event.filter(this.onChange, e => !!e && this.local.some(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, identifier))));
            }
            installedExtension = this.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, identifier));
            if (!installedExtension) {
                // This should not happen
                throw new Error('Extension should have been installed');
            }
            return installedExtension;
        }
        promptAndSetEnablement(extensions, enablementState) {
            const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
            if (enable) {
                const allDependenciesAndPackedExtensions = this.getExtensionsRecursively(extensions, this.local, enablementState, { dependencies: true, pack: true });
                return this.checkAndSetEnablement(extensions, allDependenciesAndPackedExtensions, enablementState);
            }
            else {
                const packedExtensions = this.getExtensionsRecursively(extensions, this.local, enablementState, { dependencies: false, pack: true });
                if (packedExtensions.length) {
                    return this.checkAndSetEnablement(extensions, packedExtensions, enablementState);
                }
                return this.checkAndSetEnablement(extensions, [], enablementState);
            }
        }
        checkAndSetEnablement(extensions, otherExtensions, enablementState) {
            const allExtensions = [...extensions, ...otherExtensions];
            const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
            if (!enable) {
                for (const extension of extensions) {
                    const dependents = this.getDependentsAfterDisablement(extension, allExtensions, this.local);
                    if (dependents.length) {
                        return new Promise((resolve, reject) => {
                            this.notificationService.prompt(notification_1.Severity.Error, this.getDependentsErrorMessage(extension, allExtensions, dependents), [
                                {
                                    label: nls.localize('disable all', 'Disable All'),
                                    run: async () => {
                                        try {
                                            await this.checkAndSetEnablement(dependents, [extension], enablementState);
                                            resolve();
                                        }
                                        catch (error) {
                                            reject(error);
                                        }
                                    }
                                }
                            ], {
                                onCancel: () => reject(new errors_1.CancellationError())
                            });
                        });
                    }
                }
            }
            return this.doSetEnablement(allExtensions, enablementState);
        }
        getExtensionsRecursively(extensions, installed, enablementState, options, checked = []) {
            const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
            if (toCheck.length) {
                for (const extension of toCheck) {
                    checked.push(extension);
                }
                const extensionsToEanbleOrDisable = installed.filter(i => {
                    if (checked.indexOf(i) !== -1) {
                        return false;
                    }
                    const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
                    const isExtensionEnabled = i.enablementState === 8 /* EnablementState.EnabledGlobally */ || i.enablementState === 9 /* EnablementState.EnabledWorkspace */;
                    if (enable === isExtensionEnabled) {
                        return false;
                    }
                    return (enable || !i.isBuiltin) // Include all Extensions for enablement and only non builtin extensions for disablement
                        && (options.dependencies || options.pack)
                        && extensions.some(extension => (options.dependencies && extension.dependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier)))
                            || (options.pack && extension.extensionPack.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier))));
                });
                if (extensionsToEanbleOrDisable.length) {
                    extensionsToEanbleOrDisable.push(...this.getExtensionsRecursively(extensionsToEanbleOrDisable, installed, enablementState, options, checked));
                }
                return extensionsToEanbleOrDisable;
            }
            return [];
        }
        getDependentsAfterDisablement(extension, extensionsToDisable, installed) {
            return installed.filter(i => {
                if (i.dependencies.length === 0) {
                    return false;
                }
                if (i === extension) {
                    return false;
                }
                if (!this.extensionEnablementService.isEnabledEnablementState(i.enablementState)) {
                    return false;
                }
                if (extensionsToDisable.indexOf(i) !== -1) {
                    return false;
                }
                return i.dependencies.some(dep => [extension, ...extensionsToDisable].some(d => (0, extensionManagementUtil_1.areSameExtensions)(d.identifier, { id: dep })));
            });
        }
        getDependentsErrorMessage(extension, allDisabledExtensions, dependents) {
            for (const e of [extension, ...allDisabledExtensions]) {
                const dependentsOfTheExtension = dependents.filter(d => d.dependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier)));
                if (dependentsOfTheExtension.length) {
                    return this.getErrorMessageForDisablingAnExtensionWithDependents(e, dependentsOfTheExtension);
                }
            }
            return '';
        }
        getErrorMessageForDisablingAnExtensionWithDependents(extension, dependents) {
            if (dependents.length === 1) {
                return nls.localize('singleDependentError', "Cannot disable '{0}' extension alone. '{1}' extension depends on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName);
            }
            if (dependents.length === 2) {
                return nls.localize('twoDependentsError', "Cannot disable '{0}' extension alone. '{1}' and '{2}' extensions depend on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName, dependents[1].displayName);
            }
            return nls.localize('multipleDependentsError', "Cannot disable '{0}' extension alone. '{1}', '{2}' and other extensions depend on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName, dependents[1].displayName);
        }
        async doSetEnablement(extensions, enablementState) {
            const changed = await this.extensionEnablementService.setEnablement(extensions.map(e => e.local), enablementState);
            for (let i = 0; i < changed.length; i++) {
                if (changed[i]) {
                    /* __GDPR__
                    "extension:enable" : {
                        "owner": "sandy081",
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                    */
                    /* __GDPR__
                    "extension:disable" : {
                        "owner": "sandy081",
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                    */
                    this.telemetryService.publicLog(enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ ? 'extension:enable' : 'extension:disable', extensions[i].telemetryData);
                }
            }
            return changed;
        }
        reportProgressFromOtherSources() {
            if (this.installed.some(e => e.state === 0 /* ExtensionState.Installing */ || e.state === 2 /* ExtensionState.Uninstalling */)) {
                if (!this._activityCallBack) {
                    this.withProgress({ location: 5 /* ProgressLocation.Extensions */ }, () => new Promise(resolve => this._activityCallBack = resolve));
                }
            }
            else {
                this._activityCallBack?.();
                this._activityCallBack = undefined;
            }
        }
        withProgress(options, task) {
            return this.progressService.withProgress(options, async () => {
                const cancelableTask = (0, async_1.createCancelablePromise)(() => task());
                this.tasksInProgress.push(cancelableTask);
                try {
                    return await cancelableTask;
                }
                finally {
                    const index = this.tasksInProgress.indexOf(cancelableTask);
                    if (index !== -1) {
                        this.tasksInProgress.splice(index, 1);
                    }
                }
            });
        }
        onError(err) {
            if ((0, errors_1.isCancellationError)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/getaddrinfo ENOTFOUND|getaddrinfo ENOENT|connect EACCES|connect ECONNREFUSED/.test(message)) {
                return;
            }
            this.notificationService.error(err);
        }
        handleURL(uri, options) {
            if (!/^extension/.test(uri.path)) {
                return Promise.resolve(false);
            }
            this.onOpenExtensionUrl(uri);
            return Promise.resolve(true);
        }
        onOpenExtensionUrl(uri) {
            const match = /^extension\/([^/]+)$/.exec(uri.path);
            if (!match) {
                return;
            }
            const extensionId = match[1];
            this.queryLocal().then(async (local) => {
                let extension = local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id: extensionId }));
                if (!extension) {
                    [extension] = await this.getExtensions([{ id: extensionId }], { source: 'uri' }, cancellation_1.CancellationToken.None);
                }
                if (extension) {
                    await this.hostService.focus();
                    await this.open(extension);
                }
            }).then(undefined, error => this.onError(error));
        }
    };
    exports.ExtensionsWorkbenchService = ExtensionsWorkbenchService;
    exports.ExtensionsWorkbenchService = ExtensionsWorkbenchService = ExtensionsWorkbenchService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, editorService_1.IEditorService),
        __param(2, extensionManagement_2.IWorkbenchExtensionManagementService),
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, notification_1.INotificationService),
        __param(7, url_1.IURLService),
        __param(8, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(9, host_1.IHostService),
        __param(10, progress_1.IProgressService),
        __param(11, extensionManagement_2.IExtensionManagementServerService),
        __param(12, language_1.ILanguageService),
        __param(13, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(14, userDataSync_1.IUserDataAutoSyncService),
        __param(15, productService_1.IProductService),
        __param(16, contextkey_1.IContextKeyService),
        __param(17, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(18, log_1.ILogService),
        __param(19, extensions_3.IExtensionService),
        __param(20, locale_1.ILocaleService),
        __param(21, lifecycle_2.ILifecycleService),
        __param(22, files_1.IFileService),
        __param(23, userDataProfile_1.IUserDataProfileService)
    ], ExtensionsWorkbenchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1dvcmtiZW5jaFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uc1dvcmtiZW5jaFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWtFekYsSUFBTSxTQUFTLEdBQWYsTUFBTSxTQUFTO1FBSXJCLFlBQ1MsYUFBc0QsRUFDdEQsb0JBQWlFLEVBQ3pELE1BQThDLEVBQ3ZELEtBQWtDLEVBQ2xDLE9BQXNDLEVBQ25CLGNBQXlELEVBQ2hFLGdCQUFvRCxFQUMxRCxVQUF3QyxFQUN2QyxXQUEwQyxFQUN2QyxjQUFnRDtZQVR6RCxrQkFBYSxHQUFiLGFBQWEsQ0FBeUM7WUFDdEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUE2QztZQUN6RCxXQUFNLEdBQU4sTUFBTSxDQUF3QztZQUN2RCxVQUFLLEdBQUwsS0FBSyxDQUE2QjtZQUNsQyxZQUFPLEdBQVAsT0FBTyxDQUErQjtZQUNGLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3pDLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDdEIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDdEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBWjNELG9CQUFlLDJDQUFvRDtZQXVKbkUsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUExSWhDLENBQUM7UUFFTCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsMkJBQW1CLENBQUM7UUFDMUQsQ0FBQztRQUVELElBQUksU0FBUztZQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMs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