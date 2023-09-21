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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/base/common/semver/semver", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/paging", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/workbench/services/host/browser/host", "vs/base/common/uri", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/editor/common/editorService", "vs/platform/url/common/url", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/base/common/cancellation", "vs/platform/storage/common/storage", "vs/platform/files/common/files", "vs/platform/extensions/common/extensions", "vs/editor/common/languages/language", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/base/common/platform", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls, semver, event_1, arrays_1, async_1, errors_1, lifecycle_1, paging_1, telemetry_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, instantiation_1, configuration_1, host_1, uri_1, extensions_1, editorService_1, url_1, extensionsInput_1, log_1, progress_1, notification_1, resources, cancellation_1, storage_1, files_1, extensions_2, language_1, productService_1, network_1, ignoredExtensions_1, userDataSync_1, contextkey_1, types_1, extensionManifestPropertiesService_1, extensions_3, extensionEditor_1, platform_1, languagePacks_1, locale_1, telemetryUtils_1, lifecycle_2, userDataProfile_1) {
    "use strict";
    var Extensions_1, $3Ub_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3Ub = exports.$2Ub = void 0;
    let $2Ub = class $2Ub {
        constructor(a, b, server, local, gallery, c, f, g, h, j) {
            this.a = a;
            this.b = b;
            this.server = server;
            this.local = local;
            this.gallery = gallery;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
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
            if (!this.j.extensionsGallery || !this.gallery) {
                return undefined;
            }
            return resources.$ig(uri_1.URI.parse(this.j.extensionsGallery.publisherUrl), this.publisher);
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
            if (!this.j.extensionsGallery || !this.gallery) {
                return undefined;
            }
            return `${this.j.extensionsGallery.itemUrl}?itemName=${this.publisher}.${this.name}`;
        }
        get iconUrl() {
            return this.l || this.k || this.o;
        }
        get iconUrlFallback() {
            return this.n || this.k || this.o;
        }
        get k() {
            if (this.local && this.local.manifest.icon) {
                return network_1.$2f.uriToBrowserUri(resources.$ig(this.local.location, this.local.manifest.icon)).toString(true);
            }
            return null;
        }
        get l() {
            return this.gallery?.assets.icon ? this.gallery.assets.icon.uri : null;
        }
        get n() {
            return this.gallery?.assets.icon ? this.gallery.assets.icon.fallbackUri : null;
        }
        get o() {
            if (this.type === 0 /* ExtensionType.System */ && this.local) {
                if (this.local.manifest && this.local.manifest.contributes) {
                    if (Array.isArray(this.local.manifest.contributes.themes) && this.local.manifest.contributes.themes.length) {
                        return network_1.$2f.asBrowserUri('vs/workbench/contrib/extensions/browser/media/theme-icon.png').toString(true);
                    }
                    if (Array.isArray(this.local.manifest.contributes.grammars) && this.local.manifest.contributes.grammars.length) {
                        return network_1.$2f.asBrowserUri('vs/workbench/contrib/extensions/browser/media/language-icon.svg').toString(true);
                    }
                }
            }
            return extensionManagement_2.$gcb;
        }
        get repository() {
            return this.gallery && this.gallery.assets.repository ? this.gallery.assets.repository.uri : undefined;
        }
        get licenseUrl() {
            return this.gallery && this.gallery.assets.license ? this.gallery.assets.license.uri : undefined;
        }
        get state() {
            return this.a(this);
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
                if (this.type === 0 /* ExtensionType.System */ && this.j.quality === 'stable') {
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
            return this.b(this);
        }
        get telemetryData() {
            const { local, gallery } = this;
            if (gallery) {
                return (0, extensionManagementUtil_1.$xo)(gallery);
            }
            else {
                return (0, extensionManagementUtil_1.$wo)(local);
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
        q() {
            return this.local && !this.outdated ? this.local : undefined;
        }
        async getManifest(token) {
            const local = this.q();
            if (local) {
                return local.manifest;
            }
            if (this.gallery) {
                if (this.gallery.assets.manifest) {
                    return this.c.getManifest(this.gallery, token);
                }
                this.g.error(nls.localize(0, null), this.identifier.id);
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
            const local = this.q();
            if (local?.readmeUrl) {
                const content = await this.h.readFile(local.readmeUrl);
                return content.value.toString();
            }
            if (this.gallery) {
                if (this.gallery.assets.readme) {
                    return this.c.getReadme(this.gallery, token);
                }
                this.f.publicLog('extensions:NotFoundReadMe', this.telemetryData);
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
            const local = this.q();
            if (local?.changelogUrl) {
                const content = await this.h.readFile(local.changelogUrl);
                return content.value.toString();
            }
            if (this.gallery?.assets.changelog) {
                return this.c.getChangelog(this.gallery, token);
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
    exports.$2Ub = $2Ub;
    exports.$2Ub = $2Ub = __decorate([
        __param(5, extensionManagement_1.$Zn),
        __param(6, telemetry_1.$9k),
        __param(7, log_1.$5i),
        __param(8, files_1.$6j),
        __param(9, productService_1.$kj)
    ], $2Ub);
    let Extensions = Extensions_1 = class Extensions extends lifecycle_1.$kc {
        static updateExtensionFromControlManifest(extension, extensionsControlManifest) {
            extension.isMalicious = extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.$po)(extension.identifier, identifier));
            extension.deprecationInfo = extensionsControlManifest.deprecated ? extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()] : undefined;
        }
        get onChange() { return this.a.event; }
        get onReset() { return this.b.event; }
        constructor(server, h, j, n, s, t, u, w) {
            super();
            this.server = server;
            this.h = h;
            this.j = j;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.a = this.B(new event_1.$fd());
            this.b = this.B(new event_1.$fd());
            this.c = [];
            this.f = [];
            this.g = [];
            this.B(server.extensionManagementService.onInstallExtension(e => this.F(e)));
            this.B(server.extensionManagementService.onDidInstallExtensions(e => this.J(e)));
            this.B(server.extensionManagementService.onUninstallExtension(e => this.N(e.identifier)));
            this.B(server.extensionManagementService.onDidUninstallExtension(e => this.O(e)));
            this.B(server.extensionManagementService.onDidUpdateExtensionMetadata(e => this.L(e)));
            this.B(server.extensionManagementService.onDidChangeProfile(() => this.I()));
            this.B(s.onEnablementChanged(e => this.P(e)));
            this.B(event_1.Event.any(this.onChange, this.onReset)(() => this.y = undefined));
        }
        get local() {
            if (!this.y) {
                this.y = [];
                for (const extension of this.g) {
                    this.y.push(extension);
                }
                for (const extension of this.c) {
                    if (!this.g.some(installed => (0, extensionManagementUtil_1.$po)(installed.identifier, extension.identifier))) {
                        this.y.push(extension);
                    }
                }
            }
            return this.y;
        }
        async queryInstalled() {
            await this.G();
            this.a.fire(undefined);
            return this.local;
        }
        async syncInstalledExtensionsWithGallery(galleryExtensions) {
            let hasChanged = false;
            const extensions = await this.z(galleryExtensions);
            for (const [extension, gallery] of extensions) {
                // update metadata of the extension if it does not exist
                if (extension.local && !extension.local.identifier.uuid) {
                    extension.local = await this.D(extension.local, gallery);
                }
                if (!extension.gallery || extension.gallery.version !== gallery.version || extension.gallery.properties.targetPlatform !== gallery.properties.targetPlatform) {
                    extension.gallery = gallery;
                    this.a.fire({ extension });
                    hasChanged = true;
                }
            }
            return hasChanged;
        }
        async z(galleryExtensions) {
            const mappedExtensions = this.C(galleryExtensions);
            const targetPlatform = await this.server.extensionManagementService.getTargetPlatform();
            const compatibleGalleryExtensions = [];
            const compatibleGalleryExtensionsToFetch = [];
            await Promise.allSettled(mappedExtensions.map(async ([extension, gallery]) => {
                if (extension.local) {
                    if (await this.n.isExtensionCompatible(gallery, extension.local.preRelease, targetPlatform)) {
                        compatibleGalleryExtensions.push(gallery);
                    }
                    else {
                        compatibleGalleryExtensionsToFetch.push({ ...extension.local.identifier, preRelease: extension.local.preRelease });
                    }
                }
            }));
            if (compatibleGalleryExtensionsToFetch.length) {
                const result = await this.n.getExtensions(compatibleGalleryExtensionsToFetch, { targetPlatform, compatible: true, queryAllVersions: true }, cancellation_1.CancellationToken.None);
                compatibleGalleryExtensions.push(...result);
            }
            return this.C(compatibleGalleryExtensions);
        }
        C(galleryExtensions) {
            const mappedExtensions = [];
            const byUUID = new Map(), byID = new Map();
            for (const gallery of galleryExtensions) {
                byUUID.set(gallery.identifier.uuid, gallery);
                byID.set(gallery.identifier.id.toLowerCase(), gallery);
            }
            for (const installed of this.g) {
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
        async D(localExtension, gallery) {
            let isPreReleaseVersion = false;
            if (localExtension.manifest.version !== gallery.version) {
                this.u.publicLog2('galleryService:updateMetadata');
                const galleryWithLocalVersion = (await this.n.getExtensions([{ ...localExtension.identifier, version: localExtension.manifest.version }], cancellation_1.CancellationToken.None))[0];
                isPreReleaseVersion = !!galleryWithLocalVersion?.properties?.isPreReleaseVersion;
            }
            return this.server.extensionManagementService.updateMetadata(localExtension, { id: gallery.identifier.uuid, publisherDisplayName: gallery.publisherDisplayName, publisherId: gallery.publisherId, isPreReleaseVersion });
        }
        canInstall(galleryExtension) {
            return this.server.extensionManagementService.canInstall(galleryExtension);
        }
        F(event) {
            const { source } = event;
            if (source && !uri_1.URI.isUri(source)) {
                const extension = this.g.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, source.identifier))[0]
                    || this.w.createInstance($2Ub, this.h, this.j, this.server, undefined, source);
                this.c.push(extension);
                this.a.fire({ extension });
            }
        }
        async G() {
            const extensionsControlManifest = await this.server.extensionManagementService.getExtensionsControlManifest();
            const all = await this.H(await this.server.extensionManagementService.getInstalled());
            // dedup user and system extensions by giving priority to user extensions.
            const installed = (0, extensionManagementUtil_1.$vo)(all, r => r.identifier).reduce((result, extensions) => {
                const extension = extensions.length === 1 ? extensions[0]
                    : extensions.find(e => e.type === 1 /* ExtensionType.User */) || extensions.find(e => e.type === 0 /* ExtensionType.System */);
                result.push(extension);
                return result;
            }, []);
            const byId = (0, arrays_1.$Rb)(this.g, e => e.local ? e.local.identifier.id : e.identifier.id);
            this.g = installed.map(local => {
                const extension = byId[local.identifier.id] || this.w.createInstance($2Ub, this.h, this.j, this.server, local, undefined);
                extension.local = local;
                extension.enablementState = this.s.getEnablementState(local);
                Extensions_1.updateExtensionFromControlManifest(extension, extensionsControlManifest);
                return extension;
            });
        }
        async H(extensions) {
            const ignoredAutoUpdateExtensions = JSON.parse(this.t.get('extensions.ignoredAutoUpdateExtension', 0 /* StorageScope.PROFILE */, '[]') || '[]');
            if (!ignoredAutoUpdateExtensions.length) {
                return extensions;
            }
            const result = await Promise.all(extensions.map(extension => {
                if (ignoredAutoUpdateExtensions.indexOf(new extensionManagementUtil_1.$qo(extension.identifier, extension.manifest.version).toString()) !== -1) {
                    return this.server.extensionManagementService.updateMetadata(extension, { pinned: true });
                }
                return extension;
            }));
            this.t.remove('extensions.ignoredAutoUpdateExtension', 0 /* StorageScope.PROFILE */);
            return result;
        }
        async I() {
            this.g = [];
            this.c = [];
            this.f = [];
            await this.G();
            this.b.fire();
        }
        async J(results) {
            for (const event of results) {
                const { local, source } = event;
                const gallery = source && !uri_1.URI.isUri(source) ? source : undefined;
                const location = source && uri_1.URI.isUri(source) ? source : undefined;
                const installingExtension = gallery ? this.c.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, gallery.identifier))[0] : null;
                this.c = installingExtension ? this.c.filter(e => e !== installingExtension) : this.c;
                let extension = installingExtension ? installingExtension
                    : (location || local) ? this.w.createInstance($2Ub, this.h, this.j, this.server, local, undefined)
                        : undefined;
                if (extension) {
                    if (local) {
                        const installed = this.g.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))[0];
                        if (installed) {
                            extension = installed;
                        }
                        else {
                            this.g.push(extension);
                        }
                        extension.local = local;
                        if (!extension.gallery) {
                            extension.gallery = gallery;
                        }
                        Extensions_1.updateExtensionFromControlManifest(extension, await this.server.extensionManagementService.getExtensionsControlManifest());
                        extension.enablementState = this.s.getEnablementState(local);
                    }
                }
                this.a.fire(!local || !extension ? undefined : { extension, operation: event.operation });
                if (extension && extension.local && !extension.gallery) {
                    await this.M(extension);
                }
            }
        }
        async L(local) {
            const extension = this.g.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, local.identifier));
            if (extension?.local) {
                const hasChanged = extension.local.pinned !== local.pinned;
                extension.local = local;
                if (hasChanged) {
                    this.a.fire({ extension });
                }
            }
        }
        async M(extension) {
            if (!this.n.isEnabled()) {
                return;
            }
            this.u.publicLog2('galleryService:matchInstalledExtension');
            const [compatible] = await this.n.getExtensions([{ ...extension.identifier, preRelease: extension.local?.preRelease }], { compatible: true, targetPlatform: await this.server.extensionManagementService.getTargetPlatform() }, cancellation_1.CancellationToken.None);
            if (compatible) {
                extension.gallery = compatible;
                this.a.fire({ extension });
            }
        }
        N(identifier) {
            const extension = this.g.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, identifier))[0];
            if (extension) {
                const uninstalling = this.f.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, identifier))[0] || extension;
                this.f = [uninstalling, ...this.f.filter(e => !(0, extensionManagementUtil_1.$po)(e.identifier, identifier))];
                this.a.fire(uninstalling ? { extension: uninstalling } : undefined);
            }
        }
        O({ identifier, error }) {
            const uninstalled = this.f.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, identifier)) || this.g.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, identifier));
            this.f = this.f.filter(e => !(0, extensionManagementUtil_1.$po)(e.identifier, identifier));
            if (!error) {
                this.g = this.g.filter(e => !(0, extensionManagementUtil_1.$po)(e.identifier, identifier));
            }
            if (uninstalled) {
                this.a.fire({ extension: uninstalled });
            }
        }
        P(platformExtensions) {
            const extensions = this.local.filter(e => platformExtensions.some(p => (0, extensionManagementUtil_1.$po)(e.identifier, p.identifier)));
            for (const extension of extensions) {
                if (extension.local) {
                    const enablementState = this.s.getEnablementState(extension.local);
                    if (enablementState !== extension.enablementState) {
                        extension.enablementState = enablementState;
                        this.a.fire({ extension: extension });
                    }
                }
            }
        }
        getExtensionState(extension) {
            if (extension.gallery && this.c.some(e => !!e.gallery && (0, extensionManagementUtil_1.$po)(e.gallery.identifier, extension.gallery.identifier))) {
                return 0 /* ExtensionState.Installing */;
            }
            if (this.f.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))) {
                return 2 /* ExtensionState.Uninstalling */;
            }
            const local = this.g.filter(e => e === extension || (e.gallery && extension.gallery && (0, extensionManagementUtil_1.$po)(e.gallery.identifier, extension.gallery.identifier)))[0];
            return local ? 1 /* ExtensionState.Installed */ : 3 /* ExtensionState.Uninstalled */;
        }
    };
    Extensions = Extensions_1 = __decorate([
        __param(3, extensionManagement_1.$Zn),
        __param(4, extensionManagement_2.$icb),
        __param(5, storage_1.$Vo),
        __param(6, telemetry_1.$9k),
        __param(7, instantiation_1.$Ah)
    ], Extensions);
    let $3Ub = class $3Ub extends lifecycle_1.$kc {
        static { $3Ub_1 = this; }
        static { this.a = 1000 * 60 * 60 * 12; } // 12 hours
        get onChange() { return this.s.event; }
        get onReset() { return this.t.event; }
        constructor(y, z, C, D, F, G, H, urlService, I, J, L, M, N, O, P, Q, contextKeyService, R, S, U, W, X, Y, Z) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.c = null;
            this.f = null;
            this.g = null;
            this.h = [];
            this.s = new event_1.$fd();
            this.t = new event_1.$fd();
            this.preferPreReleases = this.Q.quality !== 'stable';
            this.u = [];
            this.w = [];
            const preferPreReleasesValue = F.getValue('_extensions.preferPreReleases');
            if (!(0, types_1.$qf)(preferPreReleasesValue)) {
                this.preferPreReleases = !!preferPreReleasesValue;
            }
            this.b = extensions_1.$2fb.bindTo(contextKeyService);
            if (M.localExtensionManagementServer) {
                this.c = this.B(y.createInstance(Extensions, M.localExtensionManagementServer, ext => this.mb(ext), ext => this.kb(ext)));
                this.B(this.c.onChange(e => this.eb(e?.extension)));
                this.B(this.c.onReset(e => this.db()));
                this.h.push(this.c);
            }
            if (M.remoteExtensionManagementServer) {
                this.f = this.B(y.createInstance(Extensions, M.remoteExtensionManagementServer, ext => this.mb(ext), ext => this.kb(ext)));
                this.B(this.f.onChange(e => this.eb(e?.extension)));
                this.B(this.f.onReset(e => this.db()));
                this.h.push(this.f);
            }
            if (M.webExtensionManagementServer) {
                this.g = this.B(y.createInstance(Extensions, M.webExtensionManagementServer, ext => this.mb(ext), ext => this.kb(ext)));
                this.B(this.g.onChange(e => this.eb(e?.extension)));
                this.B(this.g.onReset(e => this.db()));
                this.h.push(this.g);
            }
            this.j = new async_1.$Eg($3Ub_1.a);
            this.n = new async_1.$Eg(1000);
            this.B((0, lifecycle_1.$ic)(() => {
                this.j.cancel();
                this.n.cancel();
            }));
            urlService.registerHandler(this);
            this.whenInitialized = this.$();
        }
        async $() {
            // initialize local extensions
            await Promise.all([this.queryLocal(), this.U.whenInstalledExtensionsRegistered()]);
            if (this.q.isDisposed) {
                return;
            }
            this.cb(this.U.extensions, []);
            this.B(this.U.onDidChangeExtensions(({ added, removed }) => this.cb(added, removed)));
            await this.X.when(4 /* LifecyclePhase.Eventually */);
            if (this.q.isDisposed) {
                return;
            }
            this.ab();
            this.bb();
            this.B(event_1.Event.debounce(this.onChange, () => undefined, 100)(() => this.Jb()));
        }
        ab() {
            // Register listeners for auto updates
            this.B(this.F.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(extensions_1.$Rfb)) {
                    if (this.pb()) {
                        this.checkForUpdates();
                    }
                }
                if (e.affectsConfiguration(extensions_1.$Sfb)) {
                    if (this.qb()) {
                        this.checkForUpdates();
                    }
                }
            }));
            this.B(this.I.onEnablementChanged(platformExtensions => {
                if (this.ob() === 'onlyEnabledExtensions' && platformExtensions.some(e => this.I.isEnabled(e))) {
                    this.checkForUpdates();
                }
            }));
            this.B(event_1.Event.debounce(this.onChange, () => undefined, 100)(() => this.b.set(this.outdated.length > 0)));
            // Update AutoUpdate Contexts
            this.b.set(this.outdated.length > 0);
            // Check for updates
            this.rb(true);
            if (platform_1.$o) {
                this.ub();
                // Always auto update builtin extensions in web
                if (!this.pb()) {
                    this.tb();
                }
            }
        }
        bb() {
            const extensionIds = this.installed.filter(extension => !extension.isBuiltin &&
                (extension.enablementState === 9 /* EnablementState.EnabledWorkspace */ ||
                    extension.enablementState === 8 /* EnablementState.EnabledGlobally */))
                .map(extension => extensions_2.$Vl.toKey(extension.identifier.id));
            this.G.publicLog2('installedExtensions', { extensionIds: new telemetryUtils_1.$_n(extensionIds.join(';')), count: extensionIds.length });
        }
        async cb(added, removed) {
            const changedExtensions = [];
            const extsNotInstalled = [];
            for (const desc of added) {
                const extension = this.installed.find(e => (0, extensionManagementUtil_1.$po)({ id: desc.identifier.value, uuid: desc.uuid }, e.identifier));
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
                this.s.fire(changedExtension);
            }
        }
        db() {
            for (const task of this.w) {
                task.cancel();
            }
            this.w = [];
            this.u = [];
            this.eb();
            this.t.fire();
        }
        eb(extension) {
            this.gb = undefined;
            this.fb = undefined;
            this.s.fire(extension);
        }
        get local() {
            if (!this.fb) {
                if (this.h.length === 1) {
                    this.fb = this.installed;
                }
                else {
                    this.fb = [];
                    const byId = (0, extensionManagementUtil_1.$vo)(this.installed, r => r.identifier);
                    for (const extensions of byId) {
                        this.fb.push(this.lb(extensions));
                    }
                }
            }
            return this.fb;
        }
        get installed() {
            if (!this.gb) {
                this.gb = [];
                for (const extensions of this.h) {
                    for (const extension of extensions.local) {
                        this.gb.push(extension);
                    }
                }
            }
            return this.gb;
        }
        get outdated() {
            return this.installed.filter(e => e.outdated && e.local && e.state === 1 /* ExtensionState.Installed */);
        }
        async queryLocal(server) {
            if (server) {
                if (this.c && this.M.localExtensionManagementServer === server) {
                    return this.c.queryInstalled();
                }
                if (this.f && this.M.remoteExtensionManagementServer === server) {
                    return this.f.queryInstalled();
                }
                if (this.g && this.M.webExtensionManagementServer === server) {
                    return this.g.queryInstalled();
                }
            }
            if (this.c) {
                try {
                    await this.c.queryInstalled();
                }
                catch (error) {
                    this.S.error(error);
                }
            }
            if (this.f) {
                try {
                    await this.f.queryInstalled();
                }
                catch (error) {
                    this.S.error(error);
                }
            }
            if (this.g) {
                try {
                    await this.g.queryInstalled();
                }
                catch (error) {
                    this.S.error(error);
                }
            }
            return this.local;
        }
        async queryGallery(arg1, arg2) {
            if (!this.D.isEnabled()) {
                return (0, paging_1.$Gn)([]);
            }
            const options = cancellation_1.CancellationToken.isCancellationToken(arg1) ? {} : arg1;
            const token = cancellation_1.CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
            options.text = options.text ? this.hb(options.text) : options.text;
            options.includePreRelease = (0, types_1.$qf)(options.includePreRelease) ? this.preferPreReleases : options.includePreRelease;
            const extensionsControlManifest = await this.C.getExtensionsControlManifest();
            const pager = await this.D.query(options, token);
            this.nb(pager.firstPage);
            return {
                firstPage: pager.firstPage.map(gallery => this.ib(gallery, extensionsControlManifest)),
                total: pager.total,
                pageSize: pager.pageSize,
                getPage: async (pageIndex, token) => {
                    const page = await pager.getPage(pageIndex, token);
                    this.nb(page);
                    return page.map(gallery => this.ib(gallery, extensionsControlManifest));
                }
            };
        }
        async getExtensions(extensionInfos, arg1, arg2) {
            if (!this.D.isEnabled()) {
                return [];
            }
            extensionInfos.forEach(e => e.preRelease = e.preRelease ?? this.preferPreReleases);
            const extensionsControlManifest = await this.C.getExtensionsControlManifest();
            const galleryExtensions = await this.D.getExtensions(extensionInfos, arg1, arg2);
            this.nb(galleryExtensions);
            return galleryExtensions.map(gallery => this.ib(gallery, extensionsControlManifest));
        }
        hb(text) {
            text = text.replace(/@web/g, `tag:"${extensionManagement_1.$On}"`);
            const extensionRegex = /\bext:([^\s]+)\b/g;
            if (extensionRegex.test(text)) {
                text = text.replace(extensionRegex, (m, ext) => {
                    // Get curated keywords
                    const lookup = this.Q.extensionKeywords || {};
                    const keywords = lookup[ext] || [];
                    // Get mode name
                    const languageId = this.N.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(`.${ext}`));
                    const languageName = languageId && this.N.getLanguageName(languageId);
                    const languageTag = languageName ? ` tag:"${languageName}"` : '';
                    // Construct a rich query
                    return `tag:"__ext_${ext}" tag:"__ext_.${ext}" ${keywords.map(tag => `tag:"${tag}"`).join(' ')}${languageTag} tag:"${ext}"`;
                });
            }
            return text.substr(0, 350);
        }
        ib(gallery, extensionsControlManifest) {
            let extension = this.jb(gallery);
            if (!extension) {
                extension = this.y.createInstance($2Ub, ext => this.mb(ext), ext => this.kb(ext), undefined, undefined, gallery);
                Extensions.updateExtensionFromControlManifest(extension, extensionsControlManifest);
            }
            return extension;
        }
        jb(gallery) {
            for (const installed of this.local) {
                if (installed.identifier.uuid) { // Installed from Gallery
                    if (installed.identifier.uuid === gallery.identifier.uuid) {
                        return installed;
                    }
                }
                else {
                    if ((0, extensionManagementUtil_1.$po)(installed.identifier, gallery.identifier)) { // Installed from other sources
                        return installed;
                    }
                }
            }
            return null;
        }
        async open(extension, options) {
            if (typeof extension === 'string') {
                const id = extension;
                extension = this.installed.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id })) ?? (await this.getExtensions([{ id: extension }], cancellation_1.CancellationToken.None))[0];
            }
            if (!extension) {
                throw new Error(`Extension not found. ${extension}`);
            }
            const editor = await this.z.openEditor(this.y.createInstance(extensionsInput_1.$Nfb, extension), options, options?.sideByside ? editorService_1.$$C : editorService_1.$0C);
            if (options?.tab && editor instanceof extensionEditor_1.$AUb) {
                await editor.openTab(options.tab);
            }
        }
        getExtensionStatus(extension) {
            const extensionsStatus = this.U.getExtensionsStatus();
            for (const id of Object.keys(extensionsStatus)) {
                if ((0, extensionManagementUtil_1.$po)({ id }, extension.identifier)) {
                    return extensionsStatus[id];
                }
            }
            return undefined;
        }
        kb(extension) {
            const isUninstalled = extension.state === 3 /* ExtensionState.Uninstalled */;
            const runningExtension = this.U.extensions.find(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, extension.identifier));
            if (isUninstalled) {
                const canRemoveRunningExtension = runningExtension && this.U.canRemoveExtension(runningExtension);
                const isSameExtensionRunning = runningExtension && (!extension.server || extension.server === this.M.getExtensionManagementServer((0, extensions_3.$TF)(runningExtension)));
                if (!canRemoveRunningExtension && isSameExtensionRunning) {
                    return nls.localize(1, null);
                }
                return undefined;
            }
            if (extension.local) {
                const isSameExtensionRunning = runningExtension && extension.server === this.M.getExtensionManagementServer((0, extensions_3.$TF)(runningExtension));
                const isEnabled = this.I.isEnabled(extension.local);
                // Extension is running
                if (runningExtension) {
                    if (isEnabled) {
                        // No Reload is required if extension can run without reload
                        if (this.U.canAddExtension((0, extensions_3.$UF)(extension.local))) {
                            return undefined;
                        }
                        const runningExtensionServer = this.M.getExtensionManagementServer((0, extensions_3.$TF)(runningExtension));
                        if (isSameExtensionRunning) {
                            // Different version or target platform of same extension is running. Requires reload to run the current version
                            if (!runningExtension.isUnderDevelopment && (extension.version !== runningExtension.version || extension.local.targetPlatform !== runningExtension.targetPlatform)) {
                                return nls.localize(2, null);
                            }
                            if (this.h.length > 1) {
                                const extensionInOtherServer = this.installed.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier) && e.server !== extension.server)[0];
                                if (extensionInOtherServer) {
                                    // This extension prefers to run on UI/Local side but is running in remote
                                    if (runningExtensionServer === this.M.remoteExtensionManagementServer && this.R.prefersExecuteOnUI(extension.local.manifest) && extensionInOtherServer.server === this.M.localExtensionManagementServer) {
                                        return nls.localize(3, null);
                                    }
                                    // This extension prefers to run on Workspace/Remote side but is running in local
                                    if (runningExtensionServer === this.M.localExtensionManagementServer && this.R.prefersExecuteOnWorkspace(extension.local.manifest) && extensionInOtherServer.server === this.M.remoteExtensionManagementServer) {
                                        return nls.localize(4, null, this.M.remoteExtensionManagementServer?.label);
                                    }
                                }
                            }
                        }
                        else {
                            if (extension.server === this.M.localExtensionManagementServer && runningExtensionServer === this.M.remoteExtensionManagementServer) {
                                // This extension prefers to run on UI/Local side but is running in remote
                                if (this.R.prefersExecuteOnUI(extension.local.manifest)) {
                                    return nls.localize(5, null);
                                }
                            }
                            if (extension.server === this.M.remoteExtensionManagementServer && runningExtensionServer === this.M.localExtensionManagementServer) {
                                // This extension prefers to run on Workspace/Remote side but is running in local
                                if (this.R.prefersExecuteOnWorkspace(extension.local.manifest)) {
                                    return nls.localize(6, null);
                                }
                            }
                        }
                        return undefined;
                    }
                    else {
                        if (isSameExtensionRunning) {
                            return nls.localize(7, null);
                        }
                    }
                    return undefined;
                }
                // Extension is not running
                else {
                    if (isEnabled && !this.U.canAddExtension((0, extensions_3.$UF)(extension.local))) {
                        return nls.localize(8, null);
                    }
                    const otherServer = extension.server ? extension.server === this.M.localExtensionManagementServer ? this.M.remoteExtensionManagementServer : this.M.localExtensionManagementServer : null;
                    if (otherServer && extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                        const extensionInOtherServer = this.local.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier) && e.server === otherServer)[0];
                        // Same extension in other server exists and
                        if (extensionInOtherServer && extensionInOtherServer.local && this.I.isEnabled(extensionInOtherServer.local)) {
                            return nls.localize(9, null);
                        }
                    }
                }
            }
            return undefined;
        }
        lb(extensions) {
            if (extensions.length === 1) {
                return extensions[0];
            }
            const enabledExtensions = extensions.filter(e => e.local && this.I.isEnabled(e.local));
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
            const extensionKinds = this.R.getExtensionKind(manifest);
            let extension = extensionsToChoose.find(extension => {
                for (const extensionKind of extensionKinds) {
                    switch (extensionKind) {
                        case 'ui':
                            /* UI extension is chosen only if it is installed locally */
                            if (extension.server === this.M.localExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'workspace':
                            /* Choose remote workspace extension if exists */
                            if (extension.server === this.M.remoteExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'web':
                            /* Choose web extension if exists */
                            if (extension.server === this.M.webExtensionManagementServer) {
                                return true;
                            }
                            return false;
                    }
                }
                return false;
            });
            if (!extension && this.M.localExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'workspace':
                                /* Choose local workspace extension if exists */
                                if (extension.server === this.M.localExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                            case 'web':
                                /* Choose local web extension if exists */
                                if (extension.server === this.M.localExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            if (!extension && this.M.webExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'web':
                                /* Choose web extension if exists */
                                if (extension.server === this.M.webExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            if (!extension && this.M.remoteExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'web':
                                /* Choose remote web extension if exists */
                                if (extension.server === this.M.remoteExtensionManagementServer) {
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
        mb(extension) {
            if (this.u.some(i => (0, extensionManagementUtil_1.$po)(i.identifier, extension.identifier) && (!extension.server || i.server === extension.server))) {
                return 0 /* ExtensionState.Installing */;
            }
            if (this.f) {
                const state = this.f.getExtensionState(extension);
                if (state !== 3 /* ExtensionState.Uninstalled */) {
                    return state;
                }
            }
            if (this.g) {
                const state = this.g.getExtensionState(extension);
                if (state !== 3 /* ExtensionState.Uninstalled */) {
                    return state;
                }
            }
            if (this.c) {
                return this.c.getExtensionState(extension);
            }
            return 3 /* ExtensionState.Uninstalled */;
        }
        async checkForUpdates(onlyBuiltin) {
            if (!this.D.isEnabled()) {
                return;
            }
            const extensions = [];
            if (this.c) {
                extensions.push(this.c);
            }
            if (this.f) {
                extensions.push(this.f);
            }
            if (this.g) {
                extensions.push(this.g);
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
                this.G.publicLog2('galleryService:checkingForUpdates', {
                    count: infos.length,
                });
                const galleryExtensions = await this.D.getExtensions(infos, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
                if (galleryExtensions.length) {
                    await this.nb(galleryExtensions);
                }
            }
        }
        async nb(gallery) {
            const extensions = [];
            if (this.c) {
                extensions.push(this.c);
            }
            if (this.f) {
                extensions.push(this.f);
            }
            if (this.g) {
                extensions.push(this.g);
            }
            if (!extensions.length) {
                return;
            }
            const result = await Promise.allSettled(extensions.map(extensions => extensions.syncInstalledExtensionsWithGallery(gallery)));
            if (this.pb() && result.some(r => r.status === 'fulfilled' && r.value)) {
                this.sb();
            }
        }
        ob() {
            const autoUpdate = this.F.getValue(extensions_1.$Rfb);
            return (0, types_1.$pf)(autoUpdate) || autoUpdate === 'onlyEnabledExtensions' ? autoUpdate : true;
        }
        pb() {
            return this.ob() !== false;
        }
        qb() {
            return this.F.getValue(extensions_1.$Sfb);
        }
        rb(immediate = false) {
            this.j.trigger(async () => {
                if (this.pb() || this.qb()) {
                    await this.checkForUpdates();
                }
                this.rb();
            }, immediate ? 0 : $3Ub_1.a).then(undefined, err => null);
        }
        sb() {
            this.n.trigger(() => this.vb())
                .then(undefined, err => null);
        }
        async tb() {
            await this.checkForUpdates(true);
            const toUpdate = this.outdated.filter(e => e.isBuiltin);
            await async_1.Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
        }
        async ub() {
            const infos = [];
            for (const installed of this.local) {
                if (installed.isBuiltin && installed.pinned && installed.local?.identifier.uuid) {
                    infos.push({ ...installed.identifier, version: installed.version });
                }
            }
            if (infos.length) {
                const galleryExtensions = await this.D.getExtensions(infos, cancellation_1.CancellationToken.None);
                if (galleryExtensions.length) {
                    await this.nb(galleryExtensions);
                }
            }
        }
        vb() {
            if (!this.pb()) {
                return Promise.resolve();
            }
            const toUpdate = this.outdated.filter(e => !e.pinned &&
                (this.ob() === true || (e.local && this.I.isEnabled(e.local))));
            return async_1.Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
        }
        async pinExtension(extension, pinned) {
            if (!extension.local) {
                throw new Error('Only installed extensions can be pinned');
            }
            await this.C.updateMetadata(extension.local, { pinned });
        }
        async canInstall(extension) {
            if (!(extension instanceof $2Ub)) {
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
            if (this.c && await this.c.canInstall(extension.gallery)) {
                return true;
            }
            if (this.f && await this.f.canInstall(extension.gallery)) {
                return true;
            }
            if (this.g && await this.g.canInstall(extension.gallery)) {
                return true;
            }
            return false;
        }
        install(extension, installOptions, progressLocation) {
            return this.xb(extension, async () => {
                if (extension instanceof uri_1.URI) {
                    return this.yb(extension, installOptions);
                }
                if (extension.isMalicious) {
                    throw new Error(nls.localize(10, null));
                }
                if (!extension.gallery) {
                    throw new Error('Missing gallery');
                }
                return this.zb(extension, extension.gallery, installOptions);
            }, progressLocation);
        }
        async installInServer(extension, server) {
            await this.xb(extension, async () => {
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
                if (!(0, extensionManagement_1.$Wn)(local.targetPlatform, [local.targetPlatform], targetPlatform)) {
                    throw new Error(nls.localize(11, null, extension.identifier.id));
                }
                const vsix = await this.C.zip(local);
                try {
                    return await server.extensionManagementService.install(vsix);
                }
                finally {
                    try {
                        await this.Y.del(vsix);
                    }
                    catch (error) {
                        this.S.error(error);
                    }
                }
            });
        }
        canSetLanguage(extension) {
            if (!platform_1.$o) {
                return false;
            }
            if (!extension.gallery) {
                return false;
            }
            const locale = (0, languagePacks_1.$Hq)(extension.gallery);
            if (!locale) {
                return false;
            }
            return true;
        }
        async setLanguage(extension) {
            if (!this.canSetLanguage(extension)) {
                throw new Error('Can not set language');
            }
            const locale = (0, languagePacks_1.$Hq)(extension.gallery);
            if (locale === platform_1.$v) {
                return;
            }
            const localizedLanguageName = extension.gallery?.properties?.localizedLanguages?.[0];
            return this.W.setLocale({ id: locale, galleryExtension: extension.gallery, extensionId: extension.identifier.id, label: localizedLanguageName ?? extension.displayName });
        }
        setEnablement(extensions, enablementState) {
            extensions = Array.isArray(extensions) ? extensions : [extensions];
            return this.Bb(extensions, enablementState);
        }
        uninstall(extension) {
            const ext = extension.local ? extension : this.local.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))[0];
            const toUninstall = ext && ext.local ? ext.local : null;
            if (!toUninstall) {
                return Promise.reject(new Error('Missing local'));
            }
            return this.Kb({
                location: 5 /* ProgressLocation.Extensions */,
                title: nls.localize(12, null),
                source: `${toUninstall.identifier.id}`
            }, () => this.C.uninstall(toUninstall).then(() => undefined));
        }
        async installVersion(extension, version, installOptions = {}) {
            return this.xb(extension, async () => {
                if (!extension.gallery) {
                    throw new Error('Missing gallery');
                }
                const targetPlatform = extension.server ? await extension.server.extensionManagementService.getTargetPlatform() : undefined;
                const [gallery] = await this.D.getExtensions([{ id: extension.gallery.identifier.id, version }], { targetPlatform }, cancellation_1.CancellationToken.None);
                if (!gallery) {
                    throw new Error(nls.localize(13, null, extension.gallery.identifier.id, version));
                }
                installOptions.installGivenVersion = true;
                return this.zb(extension, gallery, installOptions);
            });
        }
        reinstall(extension) {
            return this.xb(extension, () => {
                const ext = extension.local ? extension : this.local.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))[0];
                const toReinstall = ext && ext.local ? ext.local : null;
                if (!toReinstall) {
                    throw new Error('Missing local');
                }
                return this.C.reinstallFromGallery(toReinstall);
            });
        }
        isExtensionIgnoredToSync(extension) {
            return extension.local ? !this.wb(extension.local)
                : this.O.hasToNeverSyncExtension(extension.identifier.id);
        }
        async toggleExtensionIgnoredToSync(extension) {
            const isIgnored = this.isExtensionIgnoredToSync(extension);
            if (extension.local && isIgnored) {
                extension.local = await this.updateSynchronizingInstalledExtension(extension.local, true);
                this.s.fire(extension);
            }
            else {
                this.O.updateIgnoredExtensions(extension.identifier.id, !isIgnored);
            }
            await this.P.triggerSync(['IgnoredExtensionsUpdated'], false, false);
        }
        async toggleApplyExtensionToAllProfiles(extension) {
            if (!extension.local || (0, extensions_2.$Yl)(extension.local.manifest) || extension.isBuiltin) {
                return;
            }
            await this.C.toggleAppliationScope(extension.local, this.Z.currentProfile.extensionsResource);
        }
        wb(extension) {
            if (extension.isMachineScoped) {
                return false;
            }
            if (this.O.hasToAlwaysSyncExtension(extension.identifier.id)) {
                return true;
            }
            return !this.O.hasToNeverSyncExtension(extension.identifier.id);
        }
        async updateSynchronizingInstalledExtension(extension, sync) {
            const isMachineScoped = !sync;
            if (extension.isMachineScoped !== isMachineScoped) {
                extension = await this.C.updateMetadata(extension, { isMachineScoped });
            }
            if (sync) {
                this.O.updateIgnoredExtensions(extension.identifier.id, false);
            }
            return extension;
        }
        xb(extension, installTask, progressLocation) {
            const title = extension instanceof uri_1.URI ? nls.localize(14, null) : nls.localize(15, null, extension.displayName);
            return this.Kb({
                location: progressLocation ?? 5 /* ProgressLocation.Extensions */,
                title
            }, async () => {
                try {
                    if (!(extension instanceof uri_1.URI)) {
                        this.u.push(extension);
                        this.s.fire(extension);
                    }
                    const local = await installTask();
                    return await this.Ab(local.identifier);
                }
                finally {
                    if (!(extension instanceof uri_1.URI)) {
                        this.u = this.u.filter(e => e !== extension);
                        // Trigger the change without passing the extension because it is replaced by a new instance.
                        this.s.fire(undefined);
                    }
                }
            });
        }
        async yb(vsix, installOptions) {
            const manifest = await this.C.getManifest(vsix);
            const existingExtension = this.local.find(local => (0, extensionManagementUtil_1.$po)(local.identifier, { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) }));
            if (existingExtension && existingExtension.latestVersion !== manifest.version) {
                installOptions = installOptions || {};
                installOptions.installGivenVersion = true;
            }
            return this.C.installVSIX(vsix, manifest, installOptions);
        }
        zb(extension, gallery, installOptions) {
            if (extension.local) {
                return this.C.updateFromGallery(gallery, extension.local, installOptions);
            }
            else {
                return this.C.installFromGallery(gallery, installOptions);
            }
        }
        async Ab(identifier) {
            let installedExtension = this.local.find(local => (0, extensionManagementUtil_1.$po)(local.identifier, identifier));
            if (!installedExtension) {
                await event_1.Event.toPromise(event_1.Event.filter(this.onChange, e => !!e && this.local.some(local => (0, extensionManagementUtil_1.$po)(local.identifier, identifier))));
            }
            installedExtension = this.local.find(local => (0, extensionManagementUtil_1.$po)(local.identifier, identifier));
            if (!installedExtension) {
                // This should not happen
                throw new Error('Extension should have been installed');
            }
            return installedExtension;
        }
        Bb(extensions, enablementState) {
            const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
            if (enable) {
                const allDependenciesAndPackedExtensions = this.Db(extensions, this.local, enablementState, { dependencies: true, pack: true });
                return this.Cb(extensions, allDependenciesAndPackedExtensions, enablementState);
            }
            else {
                const packedExtensions = this.Db(extensions, this.local, enablementState, { dependencies: false, pack: true });
                if (packedExtensions.length) {
                    return this.Cb(extensions, packedExtensions, enablementState);
                }
                return this.Cb(extensions, [], enablementState);
            }
        }
        Cb(extensions, otherExtensions, enablementState) {
            const allExtensions = [...extensions, ...otherExtensions];
            const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
            if (!enable) {
                for (const extension of extensions) {
                    const dependents = this.Eb(extension, allExtensions, this.local);
                    if (dependents.length) {
                        return new Promise((resolve, reject) => {
                            this.H.prompt(notification_1.Severity.Error, this.Fb(extension, allExtensions, dependents), [
                                {
                                    label: nls.localize(16, null),
                                    run: async () => {
                                        try {
                                            await this.Cb(dependents, [extension], enablementState);
                                            resolve();
                                        }
                                        catch (error) {
                                            reject(error);
                                        }
                                    }
                                }
                            ], {
                                onCancel: () => reject(new errors_1.$3())
                            });
                        });
                    }
                }
            }
            return this.Hb(allExtensions, enablementState);
        }
        Db(extensions, installed, enablementState, options, checked = []) {
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
                        && extensions.some(extension => (options.dependencies && extension.dependencies.some(id => (0, extensionManagementUtil_1.$po)({ id }, i.identifier)))
                            || (options.pack && extension.extensionPack.some(id => (0, extensionManagementUtil_1.$po)({ id }, i.identifier))));
                });
                if (extensionsToEanbleOrDisable.length) {
                    extensionsToEanbleOrDisable.push(...this.Db(extensionsToEanbleOrDisable, installed, enablementState, options, checked));
                }
                return extensionsToEanbleOrDisable;
            }
            return [];
        }
        Eb(extension, extensionsToDisable, installed) {
            return installed.filter(i => {
                if (i.dependencies.length === 0) {
                    return false;
                }
                if (i === extension) {
                    return false;
                }
                if (!this.I.isEnabledEnablementState(i.enablementState)) {
                    return false;
                }
                if (extensionsToDisable.indexOf(i) !== -1) {
                    return false;
                }
                return i.dependencies.some(dep => [extension, ...extensionsToDisable].some(d => (0, extensionManagementUtil_1.$po)(d.identifier, { id: dep })));
            });
        }
        Fb(extension, allDisabledExtensions, dependents) {
            for (const e of [extension, ...allDisabledExtensions]) {
                const dependentsOfTheExtension = dependents.filter(d => d.dependencies.some(id => (0, extensionManagementUtil_1.$po)({ id }, e.identifier)));
                if (dependentsOfTheExtension.length) {
                    return this.Gb(e, dependentsOfTheExtension);
                }
            }
            return '';
        }
        Gb(extension, dependents) {
            if (dependents.length === 1) {
                return nls.localize(17, null, extension.displayName, dependents[0].displayName);
            }
            if (dependents.length === 2) {
                return nls.localize(18, null, extension.displayName, dependents[0].displayName, dependents[1].displayName);
            }
            return nls.localize(19, null, extension.displayName, dependents[0].displayName, dependents[1].displayName);
        }
        async Hb(extensions, enablementState) {
            const changed = await this.I.setEnablement(extensions.map(e => e.local), enablementState);
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
                    this.G.publicLog(enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ ? 'extension:enable' : 'extension:disable', extensions[i].telemetryData);
                }
            }
            return changed;
        }
        Jb() {
            if (this.installed.some(e => e.state === 0 /* ExtensionState.Installing */ || e.state === 2 /* ExtensionState.Uninstalling */)) {
                if (!this.Ib) {
                    this.Kb({ location: 5 /* ProgressLocation.Extensions */ }, () => new Promise(resolve => this.Ib = resolve));
                }
            }
            else {
                this.Ib?.();
                this.Ib = undefined;
            }
        }
        Kb(options, task) {
            return this.L.withProgress(options, async () => {
                const cancelableTask = (0, async_1.$ug)(() => task());
                this.w.push(cancelableTask);
                try {
                    return await cancelableTask;
                }
                finally {
                    const index = this.w.indexOf(cancelableTask);
                    if (index !== -1) {
                        this.w.splice(index, 1);
                    }
                }
            });
        }
        Lb(err) {
            if ((0, errors_1.$2)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/getaddrinfo ENOTFOUND|getaddrinfo ENOENT|connect EACCES|connect ECONNREFUSED/.test(message)) {
                return;
            }
            this.H.error(err);
        }
        handleURL(uri, options) {
            if (!/^extension/.test(uri.path)) {
                return Promise.resolve(false);
            }
            this.Mb(uri);
            return Promise.resolve(true);
        }
        Mb(uri) {
            const match = /^extension\/([^/]+)$/.exec(uri.path);
            if (!match) {
                return;
            }
            const extensionId = match[1];
            this.queryLocal().then(async (local) => {
                let extension = local.find(local => (0, extensionManagementUtil_1.$po)(local.identifier, { id: extensionId }));
                if (!extension) {
                    [extension] = await this.getExtensions([{ id: extensionId }], { source: 'uri' }, cancellation_1.CancellationToken.None);
                }
                if (extension) {
                    await this.J.focus();
                    await this.open(extension);
                }
            }).then(undefined, error => this.Lb(error));
        }
    };
    exports.$3Ub = $3Ub;
    exports.$3Ub = $3Ub = $3Ub_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, editorService_1.$9C),
        __param(2, extensionManagement_2.$hcb),
        __param(3, extensionManagement_1.$Zn),
        __param(4, configuration_1.$8h),
        __param(5, telemetry_1.$9k),
        __param(6, notification_1.$Yu),
        __param(7, url_1.$IT),
        __param(8, extensionManagement_2.$icb),
        __param(9, host_1.$VT),
        __param(10, progress_1.$2u),
        __param(11, extensionManagement_2.$fcb),
        __param(12, language_1.$ct),
        __param(13, ignoredExtensions_1.$PBb),
        __param(14, userDataSync_1.$Sgb),
        __param(15, productService_1.$kj),
        __param(16, contextkey_1.$3i),
        __param(17, extensionManifestPropertiesService_1.$vcb),
        __param(18, log_1.$5i),
        __param(19, extensions_3.$MF),
        __param(20, locale_1.$khb),
        __param(21, lifecycle_2.$7y),
        __param(22, files_1.$6j),
        __param(23, userDataProfile_1.$CJ)
    ], $3Ub);
});
//# sourceMappingURL=extensionsWorkbenchService.js.map