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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionNls", "vs/nls!vs/workbench/services/extensionManagement/browser/webExtensionsScannerService", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/errors", "vs/base/common/map", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/editor/common/editorService", "vs/base/common/path", "vs/platform/extensionManagement/common/extensionStorage", "vs/base/common/arrays", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/platform/extensions/common/extensionValidator", "vs/base/common/severity", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, extensions_1, environmentService_1, extensionManagement_1, platform_1, extensions_2, resources_1, uri_1, files_1, async_1, buffer_1, log_1, cancellation_1, extensionManagement_2, extensionManagementUtil_1, lifecycle_1, extensionNls_1, nls_1, semver, types_1, errors_1, map_1, extensionManifestPropertiesService_1, extensionResourceLoader_1, actions_1, actionCommonCategories_1, contextkeys_1, editorService_1, path_1, extensionStorage_1, arrays_1, lifecycle_2, storage_1, productService_1, extensionValidator_1, severity_1, userDataProfile_1, userDataProfile_2, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X3b = void 0;
    function isGalleryExtensionInfo(obj) {
        const galleryExtensionInfo = obj;
        return typeof galleryExtensionInfo?.id === 'string'
            && (galleryExtensionInfo.preRelease === undefined || typeof galleryExtensionInfo.preRelease === 'boolean')
            && (galleryExtensionInfo.migrateStorageFrom === undefined || typeof galleryExtensionInfo.migrateStorageFrom === 'string');
    }
    function isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return (0, types_1.$jf)(thing.path) &&
            (0, types_1.$jf)(thing.scheme);
    }
    let $X3b = class $X3b extends lifecycle_1.$kc {
        constructor(h, j, m, n, r, s, t, u, w, y, z, C, lifecycleService) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.c = undefined;
            this.f = undefined;
            this.g = new map_1.$zi();
            if (platform_1.$o) {
                this.c = (0, resources_1.$ig)(h.userRoamingDataHome, 'systemExtensionsCache.json');
                this.f = (0, resources_1.$ig)(h.userRoamingDataHome, 'customBuiltinExtensionsCache.json');
                // Eventually update caches
                lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => this.P());
            }
        }
        F() {
            if (!this.D) {
                this.D = (async () => {
                    let extensions = [];
                    const extensionLocations = [];
                    const extensionGalleryResources = [];
                    const extensionsToMigrate = [];
                    const customBuiltinExtensionsInfo = this.h.options && Array.isArray(this.h.options.additionalBuiltinExtensions)
                        ? this.h.options.additionalBuiltinExtensions.map(additionalBuiltinExtension => (0, types_1.$jf)(additionalBuiltinExtension) ? { id: additionalBuiltinExtension } : additionalBuiltinExtension)
                        : [];
                    for (const e of customBuiltinExtensionsInfo) {
                        if (isGalleryExtensionInfo(e)) {
                            extensions.push({ id: e.id, preRelease: !!e.preRelease });
                            if (e.migrateStorageFrom) {
                                extensionsToMigrate.push([e.migrateStorageFrom, e.id]);
                            }
                        }
                        else if (isUriComponents(e)) {
                            const extensionLocation = uri_1.URI.revive(e);
                            if (this.t.isExtensionGalleryResource(extensionLocation)) {
                                extensionGalleryResources.push(extensionLocation);
                            }
                            else {
                                extensionLocations.push(extensionLocation);
                            }
                        }
                    }
                    if (extensions.length) {
                        extensions = await this.G(extensions);
                    }
                    if (extensions.length) {
                        this.n.info('Found additional builtin gallery extensions in env', extensions);
                    }
                    if (extensionLocations.length) {
                        this.n.info('Found additional builtin location extensions in env', extensionLocations.map(e => e.toString()));
                    }
                    if (extensionGalleryResources.length) {
                        this.n.info('Found additional builtin extension gallery resources in env', extensionGalleryResources.map(e => e.toString()));
                    }
                    return { extensions, extensionsToMigrate, extensionLocations, extensionGalleryResources };
                })();
            }
            return this.D;
        }
        async G(extensions) {
            const extensionsControlManifest = await this.r.getExtensionsControlManifest();
            const result = [];
            for (const extension of extensions) {
                if (extensionsControlManifest.malicious.some(e => (0, extensionManagementUtil_1.$po)(e, { id: extension.id }))) {
                    this.n.info(`Checking additional builtin extensions: Ignoring '${extension.id}' because it is reported to be malicious.`);
                    continue;
                }
                const deprecationInfo = extensionsControlManifest.deprecated[extension.id.toLowerCase()];
                if (deprecationInfo?.extension?.autoMigrate) {
                    const preReleaseExtensionId = deprecationInfo.extension.id;
                    this.n.info(`Checking additional builtin extensions: '${extension.id}' is deprecated, instead using '${preReleaseExtensionId}'`);
                    result.push({ id: preReleaseExtensionId, preRelease: !!extension.preRelease });
                }
                else {
                    result.push(extension);
                }
            }
            return result;
        }
        /**
         * All system extensions bundled with the product
         */
        async H() {
            const systemExtensions = await this.j.scanBuiltinExtensions();
            const cachedSystemExtensions = await Promise.all((await this.ob()).map(e => this.fb(e, true, 0 /* ExtensionType.System */)));
            const result = new Map();
            for (const extension of [...systemExtensions, ...cachedSystemExtensions]) {
                const existing = result.get(extension.identifier.id.toLowerCase());
                if (existing) {
                    // Incase there are duplicates always take the latest version
                    if (semver.gt(existing.manifest.version, extension.manifest.version)) {
                        continue;
                    }
                }
                result.set(extension.identifier.id.toLowerCase(), extension);
            }
            return [...result.values()];
        }
        /**
         * All extensions defined via `additionalBuiltinExtensions` API
         */
        async I(scanOptions) {
            const [customBuiltinExtensionsFromLocations, customBuiltinExtensionsFromGallery] = await Promise.all([
                this.J(scanOptions),
                this.L(scanOptions),
            ]);
            const customBuiltinExtensions = [...customBuiltinExtensionsFromLocations, ...customBuiltinExtensionsFromGallery];
            await this.O(customBuiltinExtensions);
            return customBuiltinExtensions;
        }
        async J(scanOptions) {
            const { extensionLocations } = await this.F();
            if (!extensionLocations.length) {
                return [];
            }
            const result = [];
            await Promise.allSettled(extensionLocations.map(async (extensionLocation) => {
                try {
                    const webExtension = await this.eb(extensionLocation);
                    const extension = await this.fb(webExtension, true);
                    if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                        result.push(extension);
                    }
                    else {
                        this.n.info(`Skipping invalid additional builtin extension ${webExtension.identifier.id}`);
                    }
                }
                catch (error) {
                    this.n.info(`Error while fetching the additional builtin extension ${location.toString()}.`, (0, errors_1.$8)(error));
                }
            }));
            return result;
        }
        async L(scanOptions) {
            if (!this.r.isEnabled()) {
                this.n.info('Ignoring fetching additional builtin extensions from gallery as it is disabled.');
                return [];
            }
            const result = [];
            const { extensions, extensionGalleryResources } = await this.F();
            try {
                const cacheValue = JSON.stringify({
                    extensions: extensions.sort((a, b) => a.id.localeCompare(b.id)),
                    extensionGalleryResources: extensionGalleryResources.map(e => e.toString()).sort()
                });
                const useCache = this.w.get('additionalBuiltinExtensions', -1 /* StorageScope.APPLICATION */, '{}') === cacheValue;
                const webExtensions = await (useCache ? this.M() : this.S());
                if (webExtensions.length) {
                    await Promise.all(webExtensions.map(async (webExtension) => {
                        try {
                            const extension = await this.fb(webExtension, true);
                            if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                                result.push(extension);
                            }
                            else {
                                this.n.info(`Skipping invalid additional builtin gallery extension ${webExtension.identifier.id}`);
                            }
                        }
                        catch (error) {
                            this.n.info(`Ignoring additional builtin extension ${webExtension.identifier.id} because there is an error while converting it into scanned extension`, (0, errors_1.$8)(error));
                        }
                    }));
                }
                this.w.store('additionalBuiltinExtensions', cacheValue, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            catch (error) {
                this.n.info('Ignoring following additional builtin extensions as there is an error while fetching them from gallery', extensions.map(({ id }) => id), (0, errors_1.$8)(error));
            }
            return result;
        }
        async M() {
            const cachedCustomBuiltinExtensions = await this.mb();
            const webExtensionsMap = new Map();
            for (const webExtension of cachedCustomBuiltinExtensions) {
                const existing = webExtensionsMap.get(webExtension.identifier.id.toLowerCase());
                if (existing) {
                    // Incase there are duplicates always take the latest version
                    if (semver.gt(existing.version, webExtension.version)) {
                        continue;
                    }
                }
                /* Update preRelease flag in the cache - https://github.com/microsoft/vscode/issues/142831 */
                if (webExtension.metadata?.isPreReleaseVersion && !webExtension.metadata?.preRelease) {
                    webExtension.metadata.preRelease = true;
                }
                webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
            }
            return [...webExtensionsMap.values()];
        }
        async O(customBuiltinExtensions) {
            if (!this.N) {
                this.N = (async () => {
                    const { extensionsToMigrate } = await this.F();
                    if (!extensionsToMigrate.length) {
                        return;
                    }
                    const fromExtensions = await this.r.getExtensions(extensionsToMigrate.map(([id]) => ({ id })), cancellation_1.CancellationToken.None);
                    try {
                        await Promise.allSettled(extensionsToMigrate.map(async ([from, to]) => {
                            const toExtension = customBuiltinExtensions.find(extension => (0, extensionManagementUtil_1.$po)(extension.identifier, { id: to }));
                            if (toExtension) {
                                const fromExtension = fromExtensions.find(extension => (0, extensionManagementUtil_1.$po)(extension.identifier, { id: from }));
                                const fromExtensionManifest = fromExtension ? await this.r.getManifest(fromExtension, cancellation_1.CancellationToken.None) : null;
                                const fromExtensionId = fromExtensionManifest ? (0, extensionManagementUtil_1.$so)(fromExtensionManifest.publisher, fromExtensionManifest.name) : from;
                                const toExtensionId = (0, extensionManagementUtil_1.$so)(toExtension.manifest.publisher, toExtension.manifest.name);
                                this.u.addToMigrationList(fromExtensionId, toExtensionId);
                            }
                            else {
                                this.n.info(`Skipped migrating extension storage from '${from}' to '${to}', because the '${to}' extension is not found.`);
                            }
                        }));
                    }
                    catch (error) {
                        this.n.error(error);
                    }
                })();
            }
            return this.N;
        }
        async P() {
            await this.Q();
            await this.S();
        }
        async Q() {
            const systemExtensions = await this.j.scanBuiltinExtensions();
            const cachedSystemExtensions = (await this.ob())
                .filter(cached => {
                const systemExtension = systemExtensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, cached.identifier));
                return systemExtension && semver.gt(cached.version, systemExtension.manifest.version);
            });
            await this.pb(() => cachedSystemExtensions);
        }
        async S() {
            if (!this.R) {
                this.R = (async () => {
                    this.n.info('Updating additional builtin extensions cache');
                    const { extensions, extensionGalleryResources } = await this.F();
                    const [galleryWebExtensions, extensionGalleryResourceWebExtensions] = await Promise.all([
                        this.W(extensions),
                        this.U(extensionGalleryResources)
                    ]);
                    const webExtensionsMap = new Map();
                    for (const webExtension of [...galleryWebExtensions, ...extensionGalleryResourceWebExtensions]) {
                        webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
                    }
                    await this.X(extensionGalleryResourceWebExtensions, webExtensionsMap);
                    const webExtensions = [...webExtensionsMap.values()];
                    await this.nb(() => webExtensions);
                    return webExtensions;
                })();
            }
            return this.R;
        }
        async U(extensionGalleryResources) {
            if (extensionGalleryResources.length === 0) {
                return [];
            }
            const result = new Map();
            const extensionInfos = [];
            await Promise.all(extensionGalleryResources.map(async (extensionGalleryResource) => {
                const webExtension = await this.cb(extensionGalleryResource);
                result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                extensionInfos.push({ id: webExtension.identifier.id, version: webExtension.version });
            }));
            const galleryExtensions = await this.r.getExtensions(extensionInfos, cancellation_1.CancellationToken.None);
            for (const galleryExtension of galleryExtensions) {
                const webExtension = result.get(galleryExtension.identifier.id.toLowerCase());
                if (webExtension) {
                    result.set(galleryExtension.identifier.id.toLowerCase(), {
                        ...webExtension,
                        identifier: { id: webExtension.identifier.id, uuid: galleryExtension.identifier.uuid },
                        readmeUri: galleryExtension.assets.readme ? uri_1.URI.parse(galleryExtension.assets.readme.uri) : undefined,
                        changelogUri: galleryExtension.assets.changelog ? uri_1.URI.parse(galleryExtension.assets.changelog.uri) : undefined,
                        metadata: { isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion, preRelease: galleryExtension.properties.isPreReleaseVersion, isBuiltin: true, pinned: true }
                    });
                }
            }
            return [...result.values()];
        }
        async W(extensions) {
            if (extensions.length === 0) {
                return [];
            }
            const webExtensions = [];
            const galleryExtensionsMap = await this.Y(extensions);
            const missingExtensions = extensions.filter(({ id }) => !galleryExtensionsMap.has(id.toLowerCase()));
            if (missingExtensions.length) {
                this.n.info('Skipping the additional builtin extensions because their compatible versions are not found.', missingExtensions);
            }
            await Promise.all([...galleryExtensionsMap.values()].map(async (gallery) => {
                try {
                    const webExtension = await this.bb(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                    webExtensions.push(webExtension);
                }
                catch (error) {
                    this.n.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, (0, errors_1.$8)(error));
                }
            }));
            return webExtensions;
        }
        async X(webExtensions, result) {
            const extensionInfos = [];
            for (const webExtension of webExtensions) {
                for (const e of [...(webExtension.manifest?.extensionDependencies ?? []), ...(webExtension.manifest?.extensionPack ?? [])]) {
                    if (!result.has(e.toLowerCase())) {
                        extensionInfos.push({ id: e, version: webExtension.version });
                    }
                }
            }
            if (extensionInfos.length === 0) {
                return;
            }
            const galleryExtensions = await this.Y(extensionInfos, new Set([...result.keys()]));
            await Promise.all([...galleryExtensions.values()].map(async (gallery) => {
                try {
                    const webExtension = await this.bb(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                    result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                }
                catch (error) {
                    this.n.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, (0, errors_1.$8)(error));
                }
            }));
        }
        async Y(toGet, seen = new Set(), result = new Map()) {
            if (toGet.length === 0) {
                return result;
            }
            const extensions = await this.r.getExtensions(toGet, { compatible: true, targetPlatform: "web" /* TargetPlatform.WEB */ }, cancellation_1.CancellationToken.None);
            const packsAndDependencies = new Map();
            for (const extension of extensions) {
                result.set(extension.identifier.id.toLowerCase(), extension);
                for (const id of [...((0, arrays_1.$Jb)(extension.properties.dependencies) ? extension.properties.dependencies : []), ...((0, arrays_1.$Jb)(extension.properties.extensionPack) ? extension.properties.extensionPack : [])]) {
                    if (!result.has(id.toLowerCase()) && !packsAndDependencies.has(id.toLowerCase()) && !seen.has(id.toLowerCase())) {
                        const extensionInfo = toGet.find(e => (0, extensionManagementUtil_1.$po)(e, extension.identifier));
                        packsAndDependencies.set(id.toLowerCase(), { id, preRelease: extensionInfo?.preRelease });
                    }
                }
            }
            return this.Y([...packsAndDependencies.values()].filter(({ id }) => !result.has(id.toLowerCase())), seen, result);
        }
        async scanSystemExtensions() {
            return this.H();
        }
        async scanUserExtensions(profileLocation, scanOptions) {
            const extensions = new Map();
            // Custom builtin extensions defined through `additionalBuiltinExtensions` API
            const customBuiltinExtensions = await this.I(scanOptions);
            for (const extension of customBuiltinExtensions) {
                extensions.set(extension.identifier.id.toLowerCase(), extension);
            }
            // User Installed extensions
            const installedExtensions = await this.ab(profileLocation, scanOptions);
            for (const extension of installedExtensions) {
                extensions.set(extension.identifier.id.toLowerCase(), extension);
            }
            return [...extensions.values()];
        }
        async scanExtensionsUnderDevelopment() {
            const devExtensions = this.h.options?.developmentOptions?.extensions;
            const result = [];
            if (Array.isArray(devExtensions)) {
                await Promise.allSettled(devExtensions.map(async (devExtension) => {
                    try {
                        const location = uri_1.URI.revive(devExtension);
                        if (uri_1.URI.isUri(location)) {
                            const webExtension = await this.eb(location);
                            result.push(await this.fb(webExtension, false));
                        }
                        else {
                            this.n.info(`Skipping the extension under development ${devExtension} as it is not URI type.`);
                        }
                    }
                    catch (error) {
                        this.n.info(`Error while fetching the extension under development ${devExtension.toString()}.`, (0, errors_1.$8)(error));
                    }
                }));
            }
            return result;
        }
        async scanExistingExtension(extensionLocation, extensionType, profileLocation) {
            if (extensionType === 0 /* ExtensionType.System */) {
                const systemExtensions = await this.scanSystemExtensions();
                return systemExtensions.find(e => e.location.toString() === extensionLocation.toString()) || null;
            }
            const userExtensions = await this.scanUserExtensions(profileLocation);
            return userExtensions.find(e => e.location.toString() === extensionLocation.toString()) || null;
        }
        async scanExtensionManifest(extensionLocation) {
            try {
                return await this.ib(extensionLocation);
            }
            catch (error) {
                this.n.warn(`Error while fetching manifest from ${extensionLocation.toString()}`, (0, errors_1.$8)(error));
                return null;
            }
        }
        async addExtensionFromGallery(galleryExtension, metadata, profileLocation) {
            const webExtension = await this.bb(galleryExtension, metadata);
            return this.Z(webExtension, profileLocation);
        }
        async addExtension(location, metadata, profileLocation) {
            const webExtension = await this.eb(location, undefined, undefined, undefined, undefined, undefined, undefined, metadata);
            const extension = await this.fb(webExtension, false);
            await this.$([webExtension], profileLocation);
            return extension;
        }
        async removeExtension(extension, profileLocation) {
            await this.lb(profileLocation, installedExtensions => installedExtensions.filter(installedExtension => !(0, extensionManagementUtil_1.$po)(installedExtension.identifier, extension.identifier)));
        }
        async updateMetadata(extension, metadata, profileLocation) {
            let updatedExtension = undefined;
            await this.lb(profileLocation, installedExtensions => {
                const result = [];
                for (const installedExtension of installedExtensions) {
                    if ((0, extensionManagementUtil_1.$po)(extension.identifier, installedExtension.identifier)) {
                        installedExtension.metadata = { ...installedExtension.metadata, ...metadata };
                        updatedExtension = installedExtension;
                        result.push(installedExtension);
                    }
                    else {
                        result.push(installedExtension);
                    }
                }
                return result;
            });
            if (!updatedExtension) {
                throw new Error('Extension not found');
            }
            return this.fb(updatedExtension, extension.isBuiltin);
        }
        async copyExtensions(fromProfileLocation, toProfileLocation, filter) {
            const extensionsToCopy = [];
            const fromWebExtensions = await this.kb(fromProfileLocation);
            await Promise.all(fromWebExtensions.map(async (webExtension) => {
                const scannedExtension = await this.fb(webExtension, false);
                if (filter(scannedExtension)) {
                    extensionsToCopy.push(webExtension);
                }
            }));
            if (extensionsToCopy.length) {
                await this.$(extensionsToCopy, toProfileLocation);
            }
        }
        async Z(webExtension, profileLocation) {
            const isSystem = !!(await this.scanSystemExtensions()).find(e => (0, extensionManagementUtil_1.$po)(e.identifier, webExtension.identifier));
            const isBuiltin = !!webExtension.metadata?.isBuiltin;
            const extension = await this.fb(webExtension, isBuiltin);
            if (isSystem) {
                await this.pb(systemExtensions => {
                    // Remove the existing extension to avoid duplicates
                    systemExtensions = systemExtensions.filter(extension => !(0, extensionManagementUtil_1.$po)(extension.identifier, webExtension.identifier));
                    systemExtensions.push(webExtension);
                    return systemExtensions;
                });
                return extension;
            }
            // Update custom builtin extensions to custom builtin extensions cache
            if (isBuiltin) {
                await this.nb(customBuiltinExtensions => {
                    // Remove the existing extension to avoid duplicates
                    customBuiltinExtensions = customBuiltinExtensions.filter(extension => !(0, extensionManagementUtil_1.$po)(extension.identifier, webExtension.identifier));
                    customBuiltinExtensions.push(webExtension);
                    return customBuiltinExtensions;
                });
                const installedExtensions = await this.kb(profileLocation);
                // Also add to installed extensions if it is installed to update its version
                if (installedExtensions.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, webExtension.identifier))) {
                    await this.$([webExtension], profileLocation);
                }
                return extension;
            }
            // Add to installed extensions
            await this.$([webExtension], profileLocation);
            return extension;
        }
        async $(webExtensions, profileLocation) {
            await this.lb(profileLocation, installedExtensions => {
                // Remove the existing extension to avoid duplicates
                installedExtensions = installedExtensions.filter(installedExtension => webExtensions.some(extension => !(0, extensionManagementUtil_1.$po)(installedExtension.identifier, extension.identifier)));
                installedExtensions.push(...webExtensions);
                return installedExtensions;
            });
        }
        async ab(profileLocation, scanOptions) {
            let installedExtensions = await this.kb(profileLocation);
            // If current profile is not a default profile, then add the application extensions to the list
            if (!this.C.extUri.isEqual(profileLocation, this.z.defaultProfile.extensionsResource)) {
                // Remove application extensions from the non default profile
                installedExtensions = installedExtensions.filter(i => !i.metadata?.isApplicationScoped);
                // Add application extensions from the default profile to the list
                const defaultProfileExtensions = await this.kb(this.z.defaultProfile.extensionsResource);
                installedExtensions.push(...defaultProfileExtensions.filter(i => i.metadata?.isApplicationScoped));
            }
            installedExtensions.sort((a, b) => a.identifier.id < b.identifier.id ? -1 : a.identifier.id > b.identifier.id ? 1 : semver.rcompare(a.version, b.version));
            const result = new Map();
            for (const webExtension of installedExtensions) {
                const existing = result.get(webExtension.identifier.id.toLowerCase());
                if (existing && semver.gt(existing.manifest.version, webExtension.version)) {
                    continue;
                }
                const extension = await this.fb(webExtension, false);
                if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                    result.set(extension.identifier.id.toLowerCase(), extension);
                }
                else {
                    this.n.info(`Skipping invalid installed extension ${webExtension.identifier.id}`);
                }
            }
            return [...result.values()];
        }
        async bb(galleryExtension, metadata) {
            const extensionLocation = this.t.getExtensionGalleryResourceURL({
                publisher: galleryExtension.publisher,
                name: galleryExtension.name,
                version: galleryExtension.version,
                targetPlatform: galleryExtension.properties.targetPlatform === "web" /* TargetPlatform.WEB */ ? "web" /* TargetPlatform.WEB */ : undefined
            }, 'extension');
            if (!extensionLocation) {
                throw new Error('No extension gallery service configured.');
            }
            return this.cb(extensionLocation, galleryExtension.identifier, galleryExtension.assets.readme ? uri_1.URI.parse(galleryExtension.assets.readme.uri) : undefined, galleryExtension.assets.changelog ? uri_1.URI.parse(galleryExtension.assets.changelog.uri) : undefined, metadata);
        }
        async cb(extensionLocation, identifier, readmeUri, changelogUri, metadata) {
            const extensionResources = await this.gb(extensionLocation);
            const packageNLSResources = this.db(extensionResources);
            // The fallback, in English, will fill in any gaps missing in the localized file.
            const fallbackPackageNLSResource = extensionResources.find(e => (0, path_1.$ae)(e) === 'package.nls.json');
            return this.eb(extensionLocation, identifier, undefined, packageNLSResources, fallbackPackageNLSResource ? uri_1.URI.parse(fallbackPackageNLSResource) : null, readmeUri, changelogUri, metadata);
        }
        db(extensionResources) {
            const packageNLSResources = new Map();
            extensionResources.forEach(e => {
                // Grab all package.nls.{language}.json files
                const regexResult = /package\.nls\.([\w-]+)\.json/.exec((0, path_1.$ae)(e));
                if (regexResult?.[1]) {
                    packageNLSResources.set(regexResult[1], uri_1.URI.parse(e));
                }
            });
            return packageNLSResources;
        }
        async eb(extensionLocation, identifier, manifest, packageNLSUris, fallbackPackageNLSUri, readmeUri, changelogUri, metadata) {
            if (!manifest) {
                try {
                    manifest = await this.ib(extensionLocation);
                }
                catch (error) {
                    throw new Error(`Error while fetching manifest from the location '${extensionLocation.toString()}'. ${(0, errors_1.$8)(error)}`);
                }
            }
            if (!this.s.canExecuteOnWeb(manifest)) {
                throw new Error((0, nls_1.localize)(0, null, manifest.displayName || manifest.name));
            }
            if (fallbackPackageNLSUri === undefined) {
                try {
                    fallbackPackageNLSUri = (0, resources_1.$ig)(extensionLocation, 'package.nls.json');
                    await this.t.readExtensionResource(fallbackPackageNLSUri);
                }
                catch (error) {
                    fallbackPackageNLSUri = undefined;
                }
            }
            const defaultManifestTranslations = fallbackPackageNLSUri ? uri_1.URI.isUri(fallbackPackageNLSUri) ? await this.jb(fallbackPackageNLSUri) : fallbackPackageNLSUri : null;
            return {
                identifier: { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name), uuid: identifier?.uuid },
                version: manifest.version,
                location: extensionLocation,
                manifest,
                readmeUri,
                changelogUri,
                packageNLSUris,
                fallbackPackageNLSUri: uri_1.URI.isUri(fallbackPackageNLSUri) ? fallbackPackageNLSUri : undefined,
                defaultManifestTranslations,
                metadata,
            };
        }
        async fb(webExtension, isBuiltin, type = 1 /* ExtensionType.User */) {
            const validations = [];
            let manifest = webExtension.manifest;
            if (!manifest) {
                try {
                    manifest = await this.ib(webExtension.location);
                }
                catch (error) {
                    validations.push([severity_1.default.Error, `Error while fetching manifest from the location '${webExtension.location}'. ${(0, errors_1.$8)(error)}`]);
                }
            }
            if (!manifest) {
                const [publisher, name] = webExtension.identifier.id.split('.');
                manifest = {
                    name,
                    publisher,
                    version: webExtension.version,
                    engines: { vscode: '*' },
                };
            }
            const packageNLSUri = webExtension.packageNLSUris?.get(platform_1.Language.value().toLowerCase());
            const fallbackPackageNLS = webExtension.defaultManifestTranslations ?? webExtension.fallbackPackageNLSUri;
            if (packageNLSUri) {
                manifest = await this.hb(manifest, packageNLSUri, fallbackPackageNLS);
            }
            else if (fallbackPackageNLS) {
                manifest = await this.hb(manifest, fallbackPackageNLS);
            }
            const uuid = webExtension.metadata?.id;
            validations.push(...(0, extensionValidator_1.$Fo)(this.y.version, this.y.date, webExtension.location, manifest, false));
            let isValid = true;
            for (const [severity, message] of validations) {
                if (severity === severity_1.default.Error) {
                    isValid = false;
                    this.n.error(message);
                }
            }
            return {
                identifier: { id: webExtension.identifier.id, uuid: webExtension.identifier.uuid || uuid },
                location: webExtension.location,
                manifest,
                type,
                isBuiltin,
                readmeUrl: webExtension.readmeUri,
                changelogUrl: webExtension.changelogUri,
                metadata: webExtension.metadata,
                targetPlatform: "web" /* TargetPlatform.WEB */,
                validations,
                isValid
            };
        }
        async gb(extensionLocation) {
            try {
                const result = await this.t.readExtensionResource(extensionLocation);
                return JSON.parse(result);
            }
            catch (error) {
                this.n.warn('Error while fetching extension resources list', (0, errors_1.$8)(error));
            }
            return [];
        }
        async hb(manifest, nlsURL, fallbackNLS) {
            try {
                const translations = uri_1.URI.isUri(nlsURL) ? await this.jb(nlsURL) : nlsURL;
                const fallbackTranslations = uri_1.URI.isUri(fallbackNLS) ? await this.jb(fallbackNLS) : fallbackNLS;
                if (translations) {
                    manifest = (0, extensionNls_1.$np)(this.n, manifest, translations, fallbackTranslations);
                }
            }
            catch (error) { /* ignore */ }
            return manifest;
        }
        async ib(location) {
            const url = (0, resources_1.$ig)(location, 'package.json');
            const content = await this.t.readExtensionResource(url);
            return JSON.parse(content);
        }
        async jb(nlsUrl) {
            try {
                const content = await this.t.readExtensionResource(nlsUrl);
                return JSON.parse(content);
            }
            catch (error) {
                this.n.error(`Error while fetching translations of an extension`, nlsUrl.toString(), (0, errors_1.$8)(error));
            }
            return undefined;
        }
        async kb(profileLocation) {
            return this.qb(profileLocation);
        }
        lb(profileLocation, updateFn) {
            return this.qb(profileLocation, updateFn);
        }
        mb() {
            return this.qb(this.f);
        }
        nb(updateFn) {
            return this.qb(this.f, updateFn);
        }
        ob() {
            return this.qb(this.c);
        }
        pb(updateFn) {
            return this.qb(this.c, updateFn);
        }
        async qb(file, updateFn) {
            if (!file) {
                return [];
            }
            return this.tb(file).queue(async () => {
                let webExtensions = [];
                // Read
                try {
                    const content = await this.m.readFile(file);
                    const storedWebExtensions = JSON.parse(content.value.toString());
                    for (const e of storedWebExtensions) {
                        if (!e.location || !e.identifier || !e.version) {
                            this.n.info('Ignoring invalid extension while scanning', storedWebExtensions);
                            continue;
                        }
                        let packageNLSUris;
                        if (e.packageNLSUris) {
                            packageNLSUris = new Map();
                            Object.entries(e.packageNLSUris).forEach(([key, value]) => packageNLSUris.set(key, uri_1.URI.revive(value)));
                        }
                        webExtensions.push({
                            identifier: e.identifier,
                            version: e.version,
                            location: uri_1.URI.revive(e.location),
                            manifest: e.manifest,
                            readmeUri: uri_1.URI.revive(e.readmeUri),
                            changelogUri: uri_1.URI.revive(e.changelogUri),
                            packageNLSUris,
                            fallbackPackageNLSUri: uri_1.URI.revive(e.fallbackPackageNLSUri),
                            defaultManifestTranslations: e.defaultManifestTranslations,
                            packageNLSUri: uri_1.URI.revive(e.packageNLSUri),
                            metadata: e.metadata,
                        });
                    }
                    try {
                        webExtensions = await this.rb(webExtensions, file);
                    }
                    catch (error) {
                        this.n.error(`Error while migrating scanned extensions in ${file.toString()}`, (0, errors_1.$8)(error));
                    }
                }
                catch (error) {
                    /* Ignore */
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        this.n.error(error);
                    }
                }
                // Update
                if (updateFn) {
                    await this.sb(webExtensions = updateFn(webExtensions), file);
                }
                return webExtensions;
            });
        }
        async rb(webExtensions, file) {
            let update = false;
            webExtensions = await Promise.all(webExtensions.map(async (webExtension) => {
                if (!webExtension.manifest) {
                    try {
                        webExtension.manifest = await this.ib(webExtension.location);
                        update = true;
                    }
                    catch (error) {
                        this.n.error(`Error while updating manifest of an extension in ${file.toString()}`, webExtension.identifier.id, (0, errors_1.$8)(error));
                    }
                }
                if ((0, types_1.$qf)(webExtension.defaultManifestTranslations)) {
                    if (webExtension.fallbackPackageNLSUri) {
                        try {
                            const content = await this.t.readExtensionResource(webExtension.fallbackPackageNLSUri);
                            webExtension.defaultManifestTranslations = JSON.parse(content);
                            update = true;
                        }
                        catch (error) {
                            this.n.error(`Error while fetching default manifest translations of an extension`, webExtension.identifier.id, (0, errors_1.$8)(error));
                        }
                    }
                    else {
                        update = true;
                        webExtension.defaultManifestTranslations = null;
                    }
                }
                const migratedLocation = (0, extensionResourceLoader_1.$3$)(webExtension.location, "web" /* TargetPlatform.WEB */);
                if (migratedLocation) {
                    update = true;
                    webExtension.location = migratedLocation;
                }
                return webExtension;
            }));
            if (update) {
                await this.sb(webExtensions, file);
            }
            return webExtensions;
        }
        async sb(webExtensions, file) {
            function toStringDictionary(dictionary) {
                if (!dictionary) {
                    return undefined;
                }
                const result = Object.create(null);
                dictionary.forEach((value, key) => result[key] = value.toJSON());
                return result;
            }
            const storedWebExtensions = webExtensions.map(e => ({
                identifier: e.identifier,
                version: e.version,
                manifest: e.manifest,
                location: e.location.toJSON(),
                readmeUri: e.readmeUri?.toJSON(),
                changelogUri: e.changelogUri?.toJSON(),
                packageNLSUris: toStringDictionary(e.packageNLSUris),
                defaultManifestTranslations: e.defaultManifestTranslations,
                fallbackPackageNLSUri: e.fallbackPackageNLSUri?.toJSON(),
                metadata: e.metadata
            }));
            await this.m.writeFile(file, buffer_1.$Fd.fromString(JSON.stringify(storedWebExtensions)));
        }
        tb(file) {
            let resourceQueue = this.g.get(file);
            if (!resourceQueue) {
                this.g.set(file, resourceQueue = new async_1.$Ng());
            }
            return resourceQueue;
        }
    };
    exports.$X3b = $X3b;
    exports.$X3b = $X3b = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, extensions_1.$3l),
        __param(2, files_1.$6j),
        __param(3, log_1.$5i),
        __param(4, extensionManagement_2.$Zn),
        __param(5, extensionManifestPropertiesService_1.$vcb),
        __param(6, extensionResourceLoader_1.$2$),
        __param(7, extensionStorage_1.$Tz),
        __param(8, storage_1.$Vo),
        __param(9, productService_1.$kj),
        __param(10, userDataProfile_2.$Ek),
        __param(11, uriIdentity_1.$Ck),
        __param(12, lifecycle_2.$7y)
    ], $X3b);
    if (platform_1.$o) {
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.extensions.action.openInstalledWebExtensionsResource',
                    title: { value: (0, nls_1.localize)(1, null), original: 'Open Installed Web Extensions Resource' },
                    category: actionCommonCategories_1.$Nl.Developer,
                    f1: true,
                    precondition: contextkeys_1.$23
                });
            }
            run(serviceAccessor) {
                const editorService = serviceAccessor.get(editorService_1.$9C);
                const userDataProfileService = serviceAccessor.get(userDataProfile_1.$CJ);
                editorService.openEditor({ resource: userDataProfileService.currentProfile.extensionsResource });
            }
        });
    }
    (0, extensions_2.$mr)(extensionManagement_1.$jcb, $X3b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=webExtensionsScannerService.js.map