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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionNls", "vs/nls", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/errors", "vs/base/common/map", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/editor/common/editorService", "vs/base/common/path", "vs/platform/extensionManagement/common/extensionStorage", "vs/base/common/arrays", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/platform/extensions/common/extensionValidator", "vs/base/common/severity", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, extensions_1, environmentService_1, extensionManagement_1, platform_1, extensions_2, resources_1, uri_1, files_1, async_1, buffer_1, log_1, cancellation_1, extensionManagement_2, extensionManagementUtil_1, lifecycle_1, extensionNls_1, nls_1, semver, types_1, errors_1, map_1, extensionManifestPropertiesService_1, extensionResourceLoader_1, actions_1, actionCommonCategories_1, contextkeys_1, editorService_1, path_1, extensionStorage_1, arrays_1, lifecycle_2, storage_1, productService_1, extensionValidator_1, severity_1, userDataProfile_1, userDataProfile_2, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebExtensionsScannerService = void 0;
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
        return (0, types_1.isString)(thing.path) &&
            (0, types_1.isString)(thing.scheme);
    }
    let WebExtensionsScannerService = class WebExtensionsScannerService extends lifecycle_1.Disposable {
        constructor(environmentService, builtinExtensionsScannerService, fileService, logService, galleryService, extensionManifestPropertiesService, extensionResourceLoaderService, extensionStorageService, storageService, productService, userDataProfilesService, uriIdentityService, lifecycleService) {
            super();
            this.environmentService = environmentService;
            this.builtinExtensionsScannerService = builtinExtensionsScannerService;
            this.fileService = fileService;
            this.logService = logService;
            this.galleryService = galleryService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.extensionResourceLoaderService = extensionResourceLoaderService;
            this.extensionStorageService = extensionStorageService;
            this.storageService = storageService;
            this.productService = productService;
            this.userDataProfilesService = userDataProfilesService;
            this.uriIdentityService = uriIdentityService;
            this.systemExtensionsCacheResource = undefined;
            this.customBuiltinExtensionsCacheResource = undefined;
            this.resourcesAccessQueueMap = new map_1.ResourceMap();
            if (platform_1.isWeb) {
                this.systemExtensionsCacheResource = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, 'systemExtensionsCache.json');
                this.customBuiltinExtensionsCacheResource = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, 'customBuiltinExtensionsCache.json');
                // Eventually update caches
                lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => this.updateCaches());
            }
        }
        readCustomBuiltinExtensionsInfoFromEnv() {
            if (!this._customBuiltinExtensionsInfoPromise) {
                this._customBuiltinExtensionsInfoPromise = (async () => {
                    let extensions = [];
                    const extensionLocations = [];
                    const extensionGalleryResources = [];
                    const extensionsToMigrate = [];
                    const customBuiltinExtensionsInfo = this.environmentService.options && Array.isArray(this.environmentService.options.additionalBuiltinExtensions)
                        ? this.environmentService.options.additionalBuiltinExtensions.map(additionalBuiltinExtension => (0, types_1.isString)(additionalBuiltinExtension) ? { id: additionalBuiltinExtension } : additionalBuiltinExtension)
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
                            if (this.extensionResourceLoaderService.isExtensionGalleryResource(extensionLocation)) {
                                extensionGalleryResources.push(extensionLocation);
                            }
                            else {
                                extensionLocations.push(extensionLocation);
                            }
                        }
                    }
                    if (extensions.length) {
                        extensions = await this.checkAdditionalBuiltinExtensions(extensions);
                    }
                    if (extensions.length) {
                        this.logService.info('Found additional builtin gallery extensions in env', extensions);
                    }
                    if (extensionLocations.length) {
                        this.logService.info('Found additional builtin location extensions in env', extensionLocations.map(e => e.toString()));
                    }
                    if (extensionGalleryResources.length) {
                        this.logService.info('Found additional builtin extension gallery resources in env', extensionGalleryResources.map(e => e.toString()));
                    }
                    return { extensions, extensionsToMigrate, extensionLocations, extensionGalleryResources };
                })();
            }
            return this._customBuiltinExtensionsInfoPromise;
        }
        async checkAdditionalBuiltinExtensions(extensions) {
            const extensionsControlManifest = await this.galleryService.getExtensionsControlManifest();
            const result = [];
            for (const extension of extensions) {
                if (extensionsControlManifest.malicious.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, { id: extension.id }))) {
                    this.logService.info(`Checking additional builtin extensions: Ignoring '${extension.id}' because it is reported to be malicious.`);
                    continue;
                }
                const deprecationInfo = extensionsControlManifest.deprecated[extension.id.toLowerCase()];
                if (deprecationInfo?.extension?.autoMigrate) {
                    const preReleaseExtensionId = deprecationInfo.extension.id;
                    this.logService.info(`Checking additional builtin extensions: '${extension.id}' is deprecated, instead using '${preReleaseExtensionId}'`);
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
        async readSystemExtensions() {
            const systemExtensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
            const cachedSystemExtensions = await Promise.all((await this.readSystemExtensionsCache()).map(e => this.toScannedExtension(e, true, 0 /* ExtensionType.System */)));
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
        async readCustomBuiltinExtensions(scanOptions) {
            const [customBuiltinExtensionsFromLocations, customBuiltinExtensionsFromGallery] = await Promise.all([
                this.getCustomBuiltinExtensionsFromLocations(scanOptions),
                this.getCustomBuiltinExtensionsFromGallery(scanOptions),
            ]);
            const customBuiltinExtensions = [...customBuiltinExtensionsFromLocations, ...customBuiltinExtensionsFromGallery];
            await this.migrateExtensionsStorage(customBuiltinExtensions);
            return customBuiltinExtensions;
        }
        async getCustomBuiltinExtensionsFromLocations(scanOptions) {
            const { extensionLocations } = await this.readCustomBuiltinExtensionsInfoFromEnv();
            if (!extensionLocations.length) {
                return [];
            }
            const result = [];
            await Promise.allSettled(extensionLocations.map(async (extensionLocation) => {
                try {
                    const webExtension = await this.toWebExtension(extensionLocation);
                    const extension = await this.toScannedExtension(webExtension, true);
                    if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                        result.push(extension);
                    }
                    else {
                        this.logService.info(`Skipping invalid additional builtin extension ${webExtension.identifier.id}`);
                    }
                }
                catch (error) {
                    this.logService.info(`Error while fetching the additional builtin extension ${location.toString()}.`, (0, errors_1.getErrorMessage)(error));
                }
            }));
            return result;
        }
        async getCustomBuiltinExtensionsFromGallery(scanOptions) {
            if (!this.galleryService.isEnabled()) {
                this.logService.info('Ignoring fetching additional builtin extensions from gallery as it is disabled.');
                return [];
            }
            const result = [];
            const { extensions, extensionGalleryResources } = await this.readCustomBuiltinExtensionsInfoFromEnv();
            try {
                const cacheValue = JSON.stringify({
                    extensions: extensions.sort((a, b) => a.id.localeCompare(b.id)),
                    extensionGalleryResources: extensionGalleryResources.map(e => e.toString()).sort()
                });
                const useCache = this.storageService.get('additionalBuiltinExtensions', -1 /* StorageScope.APPLICATION */, '{}') === cacheValue;
                const webExtensions = await (useCache ? this.getCustomBuiltinExtensionsFromCache() : this.updateCustomBuiltinExtensionsCache());
                if (webExtensions.length) {
                    await Promise.all(webExtensions.map(async (webExtension) => {
                        try {
                            const extension = await this.toScannedExtension(webExtension, true);
                            if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                                result.push(extension);
                            }
                            else {
                                this.logService.info(`Skipping invalid additional builtin gallery extension ${webExtension.identifier.id}`);
                            }
                        }
                        catch (error) {
                            this.logService.info(`Ignoring additional builtin extension ${webExtension.identifier.id} because there is an error while converting it into scanned extension`, (0, errors_1.getErrorMessage)(error));
                        }
                    }));
                }
                this.storageService.store('additionalBuiltinExtensions', cacheValue, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            catch (error) {
                this.logService.info('Ignoring following additional builtin extensions as there is an error while fetching them from gallery', extensions.map(({ id }) => id), (0, errors_1.getErrorMessage)(error));
            }
            return result;
        }
        async getCustomBuiltinExtensionsFromCache() {
            const cachedCustomBuiltinExtensions = await this.readCustomBuiltinExtensionsCache();
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
        async migrateExtensionsStorage(customBuiltinExtensions) {
            if (!this._migrateExtensionsStoragePromise) {
                this._migrateExtensionsStoragePromise = (async () => {
                    const { extensionsToMigrate } = await this.readCustomBuiltinExtensionsInfoFromEnv();
                    if (!extensionsToMigrate.length) {
                        return;
                    }
                    const fromExtensions = await this.galleryService.getExtensions(extensionsToMigrate.map(([id]) => ({ id })), cancellation_1.CancellationToken.None);
                    try {
                        await Promise.allSettled(extensionsToMigrate.map(async ([from, to]) => {
                            const toExtension = customBuiltinExtensions.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, { id: to }));
                            if (toExtension) {
                                const fromExtension = fromExtensions.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, { id: from }));
                                const fromExtensionManifest = fromExtension ? await this.galleryService.getManifest(fromExtension, cancellation_1.CancellationToken.None) : null;
                                const fromExtensionId = fromExtensionManifest ? (0, extensionManagementUtil_1.getExtensionId)(fromExtensionManifest.publisher, fromExtensionManifest.name) : from;
                                const toExtensionId = (0, extensionManagementUtil_1.getExtensionId)(toExtension.manifest.publisher, toExtension.manifest.name);
                                this.extensionStorageService.addToMigrationList(fromExtensionId, toExtensionId);
                            }
                            else {
                                this.logService.info(`Skipped migrating extension storage from '${from}' to '${to}', because the '${to}' extension is not found.`);
                            }
                        }));
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                })();
            }
            return this._migrateExtensionsStoragePromise;
        }
        async updateCaches() {
            await this.updateSystemExtensionsCache();
            await this.updateCustomBuiltinExtensionsCache();
        }
        async updateSystemExtensionsCache() {
            const systemExtensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
            const cachedSystemExtensions = (await this.readSystemExtensionsCache())
                .filter(cached => {
                const systemExtension = systemExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, cached.identifier));
                return systemExtension && semver.gt(cached.version, systemExtension.manifest.version);
            });
            await this.writeSystemExtensionsCache(() => cachedSystemExtensions);
        }
        async updateCustomBuiltinExtensionsCache() {
            if (!this._updateCustomBuiltinExtensionsCachePromise) {
                this._updateCustomBuiltinExtensionsCachePromise = (async () => {
                    this.logService.info('Updating additional builtin extensions cache');
                    const { extensions, extensionGalleryResources } = await this.readCustomBuiltinExtensionsInfoFromEnv();
                    const [galleryWebExtensions, extensionGalleryResourceWebExtensions] = await Promise.all([
                        this.resolveBuiltinGalleryExtensions(extensions),
                        this.resolveBuiltinExtensionGalleryResources(extensionGalleryResources)
                    ]);
                    const webExtensionsMap = new Map();
                    for (const webExtension of [...galleryWebExtensions, ...extensionGalleryResourceWebExtensions]) {
                        webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
                    }
                    await this.resolveDependenciesAndPackedExtensions(extensionGalleryResourceWebExtensions, webExtensionsMap);
                    const webExtensions = [...webExtensionsMap.values()];
                    await this.writeCustomBuiltinExtensionsCache(() => webExtensions);
                    return webExtensions;
                })();
            }
            return this._updateCustomBuiltinExtensionsCachePromise;
        }
        async resolveBuiltinExtensionGalleryResources(extensionGalleryResources) {
            if (extensionGalleryResources.length === 0) {
                return [];
            }
            const result = new Map();
            const extensionInfos = [];
            await Promise.all(extensionGalleryResources.map(async (extensionGalleryResource) => {
                const webExtension = await this.toWebExtensionFromExtensionGalleryResource(extensionGalleryResource);
                result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                extensionInfos.push({ id: webExtension.identifier.id, version: webExtension.version });
            }));
            const galleryExtensions = await this.galleryService.getExtensions(extensionInfos, cancellation_1.CancellationToken.None);
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
        async resolveBuiltinGalleryExtensions(extensions) {
            if (extensions.length === 0) {
                return [];
            }
            const webExtensions = [];
            const galleryExtensionsMap = await this.getExtensionsWithDependenciesAndPackedExtensions(extensions);
            const missingExtensions = extensions.filter(({ id }) => !galleryExtensionsMap.has(id.toLowerCase()));
            if (missingExtensions.length) {
                this.logService.info('Skipping the additional builtin extensions because their compatible versions are not found.', missingExtensions);
            }
            await Promise.all([...galleryExtensionsMap.values()].map(async (gallery) => {
                try {
                    const webExtension = await this.toWebExtensionFromGallery(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                    webExtensions.push(webExtension);
                }
                catch (error) {
                    this.logService.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, (0, errors_1.getErrorMessage)(error));
                }
            }));
            return webExtensions;
        }
        async resolveDependenciesAndPackedExtensions(webExtensions, result) {
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
            const galleryExtensions = await this.getExtensionsWithDependenciesAndPackedExtensions(extensionInfos, new Set([...result.keys()]));
            await Promise.all([...galleryExtensions.values()].map(async (gallery) => {
                try {
                    const webExtension = await this.toWebExtensionFromGallery(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                    result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                }
                catch (error) {
                    this.logService.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, (0, errors_1.getErrorMessage)(error));
                }
            }));
        }
        async getExtensionsWithDependenciesAndPackedExtensions(toGet, seen = new Set(), result = new Map()) {
            if (toGet.length === 0) {
                return result;
            }
            const extensions = await this.galleryService.getExtensions(toGet, { compatible: true, targetPlatform: "web" /* TargetPlatform.WEB */ }, cancellation_1.CancellationToken.None);
            const packsAndDependencies = new Map();
            for (const extension of extensions) {
                result.set(extension.identifier.id.toLowerCase(), extension);
                for (const id of [...((0, arrays_1.isNonEmptyArray)(extension.properties.dependencies) ? extension.properties.dependencies : []), ...((0, arrays_1.isNonEmptyArray)(extension.properties.extensionPack) ? extension.properties.extensionPack : [])]) {
                    if (!result.has(id.toLowerCase()) && !packsAndDependencies.has(id.toLowerCase()) && !seen.has(id.toLowerCase())) {
                        const extensionInfo = toGet.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e, extension.identifier));
                        packsAndDependencies.set(id.toLowerCase(), { id, preRelease: extensionInfo?.preRelease });
                    }
                }
            }
            return this.getExtensionsWithDependenciesAndPackedExtensions([...packsAndDependencies.values()].filter(({ id }) => !result.has(id.toLowerCase())), seen, result);
        }
        async scanSystemExtensions() {
            return this.readSystemExtensions();
        }
        async scanUserExtensions(profileLocation, scanOptions) {
            const extensions = new Map();
            // Custom builtin extensions defined through `additionalBuiltinExtensions` API
            const customBuiltinExtensions = await this.readCustomBuiltinExtensions(scanOptions);
            for (const extension of customBuiltinExtensions) {
                extensions.set(extension.identifier.id.toLowerCase(), extension);
            }
            // User Installed extensions
            const installedExtensions = await this.scanInstalledExtensions(profileLocation, scanOptions);
            for (const extension of installedExtensions) {
                extensions.set(extension.identifier.id.toLowerCase(), extension);
            }
            return [...extensions.values()];
        }
        async scanExtensionsUnderDevelopment() {
            const devExtensions = this.environmentService.options?.developmentOptions?.extensions;
            const result = [];
            if (Array.isArray(devExtensions)) {
                await Promise.allSettled(devExtensions.map(async (devExtension) => {
                    try {
                        const location = uri_1.URI.revive(devExtension);
                        if (uri_1.URI.isUri(location)) {
                            const webExtension = await this.toWebExtension(location);
                            result.push(await this.toScannedExtension(webExtension, false));
                        }
                        else {
                            this.logService.info(`Skipping the extension under development ${devExtension} as it is not URI type.`);
                        }
                    }
                    catch (error) {
                        this.logService.info(`Error while fetching the extension under development ${devExtension.toString()}.`, (0, errors_1.getErrorMessage)(error));
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
                return await this.getExtensionManifest(extensionLocation);
            }
            catch (error) {
                this.logService.warn(`Error while fetching manifest from ${extensionLocation.toString()}`, (0, errors_1.getErrorMessage)(error));
                return null;
            }
        }
        async addExtensionFromGallery(galleryExtension, metadata, profileLocation) {
            const webExtension = await this.toWebExtensionFromGallery(galleryExtension, metadata);
            return this.addWebExtension(webExtension, profileLocation);
        }
        async addExtension(location, metadata, profileLocation) {
            const webExtension = await this.toWebExtension(location, undefined, undefined, undefined, undefined, undefined, undefined, metadata);
            const extension = await this.toScannedExtension(webExtension, false);
            await this.addToInstalledExtensions([webExtension], profileLocation);
            return extension;
        }
        async removeExtension(extension, profileLocation) {
            await this.writeInstalledExtensions(profileLocation, installedExtensions => installedExtensions.filter(installedExtension => !(0, extensionManagementUtil_1.areSameExtensions)(installedExtension.identifier, extension.identifier)));
        }
        async updateMetadata(extension, metadata, profileLocation) {
            let updatedExtension = undefined;
            await this.writeInstalledExtensions(profileLocation, installedExtensions => {
                const result = [];
                for (const installedExtension of installedExtensions) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, installedExtension.identifier)) {
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
            return this.toScannedExtension(updatedExtension, extension.isBuiltin);
        }
        async copyExtensions(fromProfileLocation, toProfileLocation, filter) {
            const extensionsToCopy = [];
            const fromWebExtensions = await this.readInstalledExtensions(fromProfileLocation);
            await Promise.all(fromWebExtensions.map(async (webExtension) => {
                const scannedExtension = await this.toScannedExtension(webExtension, false);
                if (filter(scannedExtension)) {
                    extensionsToCopy.push(webExtension);
                }
            }));
            if (extensionsToCopy.length) {
                await this.addToInstalledExtensions(extensionsToCopy, toProfileLocation);
            }
        }
        async addWebExtension(webExtension, profileLocation) {
            const isSystem = !!(await this.scanSystemExtensions()).find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, webExtension.identifier));
            const isBuiltin = !!webExtension.metadata?.isBuiltin;
            const extension = await this.toScannedExtension(webExtension, isBuiltin);
            if (isSystem) {
                await this.writeSystemExtensionsCache(systemExtensions => {
                    // Remove the existing extension to avoid duplicates
                    systemExtensions = systemExtensions.filter(extension => !(0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, webExtension.identifier));
                    systemExtensions.push(webExtension);
                    return systemExtensions;
                });
                return extension;
            }
            // Update custom builtin extensions to custom builtin extensions cache
            if (isBuiltin) {
                await this.writeCustomBuiltinExtensionsCache(customBuiltinExtensions => {
                    // Remove the existing extension to avoid duplicates
                    customBuiltinExtensions = customBuiltinExtensions.filter(extension => !(0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, webExtension.identifier));
                    customBuiltinExtensions.push(webExtension);
                    return customBuiltinExtensions;
                });
                const installedExtensions = await this.readInstalledExtensions(profileLocation);
                // Also add to installed extensions if it is installed to update its version
                if (installedExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, webExtension.identifier))) {
                    await this.addToInstalledExtensions([webExtension], profileLocation);
                }
                return extension;
            }
            // Add to installed extensions
            await this.addToInstalledExtensions([webExtension], profileLocation);
            return extension;
        }
        async addToInstalledExtensions(webExtensions, profileLocation) {
            await this.writeInstalledExtensions(profileLocation, installedExtensions => {
                // Remove the existing extension to avoid duplicates
                installedExtensions = installedExtensions.filter(installedExtension => webExtensions.some(extension => !(0, extensionManagementUtil_1.areSameExtensions)(installedExtension.identifier, extension.identifier)));
                installedExtensions.push(...webExtensions);
                return installedExtensions;
            });
        }
        async scanInstalledExtensions(profileLocation, scanOptions) {
            let installedExtensions = await this.readInstalledExtensions(profileLocation);
            // If current profile is not a default profile, then add the application extensions to the list
            if (!this.uriIdentityService.extUri.isEqual(profileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                // Remove application extensions from the non default profile
                installedExtensions = installedExtensions.filter(i => !i.metadata?.isApplicationScoped);
                // Add application extensions from the default profile to the list
                const defaultProfileExtensions = await this.readInstalledExtensions(this.userDataProfilesService.defaultProfile.extensionsResource);
                installedExtensions.push(...defaultProfileExtensions.filter(i => i.metadata?.isApplicationScoped));
            }
            installedExtensions.sort((a, b) => a.identifier.id < b.identifier.id ? -1 : a.identifier.id > b.identifier.id ? 1 : semver.rcompare(a.version, b.version));
            const result = new Map();
            for (const webExtension of installedExtensions) {
                const existing = result.get(webExtension.identifier.id.toLowerCase());
                if (existing && semver.gt(existing.manifest.version, webExtension.version)) {
                    continue;
                }
                const extension = await this.toScannedExtension(webExtension, false);
                if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                    result.set(extension.identifier.id.toLowerCase(), extension);
                }
                else {
                    this.logService.info(`Skipping invalid installed extension ${webExtension.identifier.id}`);
                }
            }
            return [...result.values()];
        }
        async toWebExtensionFromGallery(galleryExtension, metadata) {
            const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({
                publisher: galleryExtension.publisher,
                name: galleryExtension.name,
                version: galleryExtension.version,
                targetPlatform: galleryExtension.properties.targetPlatform === "web" /* TargetPlatform.WEB */ ? "web" /* TargetPlatform.WEB */ : undefined
            }, 'extension');
            if (!extensionLocation) {
                throw new Error('No extension gallery service configured.');
            }
            return this.toWebExtensionFromExtensionGalleryResource(extensionLocation, galleryExtension.identifier, galleryExtension.assets.readme ? uri_1.URI.parse(galleryExtension.assets.readme.uri) : undefined, galleryExtension.assets.changelog ? uri_1.URI.parse(galleryExtension.assets.changelog.uri) : undefined, metadata);
        }
        async toWebExtensionFromExtensionGalleryResource(extensionLocation, identifier, readmeUri, changelogUri, metadata) {
            const extensionResources = await this.listExtensionResources(extensionLocation);
            const packageNLSResources = this.getPackageNLSResourceMapFromResources(extensionResources);
            // The fallback, in English, will fill in any gaps missing in the localized file.
            const fallbackPackageNLSResource = extensionResources.find(e => (0, path_1.basename)(e) === 'package.nls.json');
            return this.toWebExtension(extensionLocation, identifier, undefined, packageNLSResources, fallbackPackageNLSResource ? uri_1.URI.parse(fallbackPackageNLSResource) : null, readmeUri, changelogUri, metadata);
        }
        getPackageNLSResourceMapFromResources(extensionResources) {
            const packageNLSResources = new Map();
            extensionResources.forEach(e => {
                // Grab all package.nls.{language}.json files
                const regexResult = /package\.nls\.([\w-]+)\.json/.exec((0, path_1.basename)(e));
                if (regexResult?.[1]) {
                    packageNLSResources.set(regexResult[1], uri_1.URI.parse(e));
                }
            });
            return packageNLSResources;
        }
        async toWebExtension(extensionLocation, identifier, manifest, packageNLSUris, fallbackPackageNLSUri, readmeUri, changelogUri, metadata) {
            if (!manifest) {
                try {
                    manifest = await this.getExtensionManifest(extensionLocation);
                }
                catch (error) {
                    throw new Error(`Error while fetching manifest from the location '${extensionLocation.toString()}'. ${(0, errors_1.getErrorMessage)(error)}`);
                }
            }
            if (!this.extensionManifestPropertiesService.canExecuteOnWeb(manifest)) {
                throw new Error((0, nls_1.localize)('not a web extension', "Cannot add '{0}' because this extension is not a web extension.", manifest.displayName || manifest.name));
            }
            if (fallbackPackageNLSUri === undefined) {
                try {
                    fallbackPackageNLSUri = (0, resources_1.joinPath)(extensionLocation, 'package.nls.json');
                    await this.extensionResourceLoaderService.readExtensionResource(fallbackPackageNLSUri);
                }
                catch (error) {
                    fallbackPackageNLSUri = undefined;
                }
            }
            const defaultManifestTranslations = fallbackPackageNLSUri ? uri_1.URI.isUri(fallbackPackageNLSUri) ? await this.getTranslations(fallbackPackageNLSUri) : fallbackPackageNLSUri : null;
            return {
                identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name), uuid: identifier?.uuid },
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
        async toScannedExtension(webExtension, isBuiltin, type = 1 /* ExtensionType.User */) {
            const validations = [];
            let manifest = webExtension.manifest;
            if (!manifest) {
                try {
                    manifest = await this.getExtensionManifest(webExtension.location);
                }
                catch (error) {
                    validations.push([severity_1.default.Error, `Error while fetching manifest from the location '${webExtension.location}'. ${(0, errors_1.getErrorMessage)(error)}`]);
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
                manifest = await this.translateManifest(manifest, packageNLSUri, fallbackPackageNLS);
            }
            else if (fallbackPackageNLS) {
                manifest = await this.translateManifest(manifest, fallbackPackageNLS);
            }
            const uuid = webExtension.metadata?.id;
            validations.push(...(0, extensionValidator_1.validateExtensionManifest)(this.productService.version, this.productService.date, webExtension.location, manifest, false));
            let isValid = true;
            for (const [severity, message] of validations) {
                if (severity === severity_1.default.Error) {
                    isValid = false;
                    this.logService.error(message);
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
        async listExtensionResources(extensionLocation) {
            try {
                const result = await this.extensionResourceLoaderService.readExtensionResource(extensionLocation);
                return JSON.parse(result);
            }
            catch (error) {
                this.logService.warn('Error while fetching extension resources list', (0, errors_1.getErrorMessage)(error));
            }
            return [];
        }
        async translateManifest(manifest, nlsURL, fallbackNLS) {
            try {
                const translations = uri_1.URI.isUri(nlsURL) ? await this.getTranslations(nlsURL) : nlsURL;
                const fallbackTranslations = uri_1.URI.isUri(fallbackNLS) ? await this.getTranslations(fallbackNLS) : fallbackNLS;
                if (translations) {
                    manifest = (0, extensionNls_1.localizeManifest)(this.logService, manifest, translations, fallbackTranslations);
                }
            }
            catch (error) { /* ignore */ }
            return manifest;
        }
        async getExtensionManifest(location) {
            const url = (0, resources_1.joinPath)(location, 'package.json');
            const content = await this.extensionResourceLoaderService.readExtensionResource(url);
            return JSON.parse(content);
        }
        async getTranslations(nlsUrl) {
            try {
                const content = await this.extensionResourceLoaderService.readExtensionResource(nlsUrl);
                return JSON.parse(content);
            }
            catch (error) {
                this.logService.error(`Error while fetching translations of an extension`, nlsUrl.toString(), (0, errors_1.getErrorMessage)(error));
            }
            return undefined;
        }
        async readInstalledExtensions(profileLocation) {
            return this.withWebExtensions(profileLocation);
        }
        writeInstalledExtensions(profileLocation, updateFn) {
            return this.withWebExtensions(profileLocation, updateFn);
        }
        readCustomBuiltinExtensionsCache() {
            return this.withWebExtensions(this.customBuiltinExtensionsCacheResource);
        }
        writeCustomBuiltinExtensionsCache(updateFn) {
            return this.withWebExtensions(this.customBuiltinExtensionsCacheResource, updateFn);
        }
        readSystemExtensionsCache() {
            return this.withWebExtensions(this.systemExtensionsCacheResource);
        }
        writeSystemExtensionsCache(updateFn) {
            return this.withWebExtensions(this.systemExtensionsCacheResource, updateFn);
        }
        async withWebExtensions(file, updateFn) {
            if (!file) {
                return [];
            }
            return this.getResourceAccessQueue(file).queue(async () => {
                let webExtensions = [];
                // Read
                try {
                    const content = await this.fileService.readFile(file);
                    const storedWebExtensions = JSON.parse(content.value.toString());
                    for (const e of storedWebExtensions) {
                        if (!e.location || !e.identifier || !e.version) {
                            this.logService.info('Ignoring invalid extension while scanning', storedWebExtensions);
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
                        webExtensions = await this.migrateWebExtensions(webExtensions, file);
                    }
                    catch (error) {
                        this.logService.error(`Error while migrating scanned extensions in ${file.toString()}`, (0, errors_1.getErrorMessage)(error));
                    }
                }
                catch (error) {
                    /* Ignore */
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        this.logService.error(error);
                    }
                }
                // Update
                if (updateFn) {
                    await this.storeWebExtensions(webExtensions = updateFn(webExtensions), file);
                }
                return webExtensions;
            });
        }
        async migrateWebExtensions(webExtensions, file) {
            let update = false;
            webExtensions = await Promise.all(webExtensions.map(async (webExtension) => {
                if (!webExtension.manifest) {
                    try {
                        webExtension.manifest = await this.getExtensionManifest(webExtension.location);
                        update = true;
                    }
                    catch (error) {
                        this.logService.error(`Error while updating manifest of an extension in ${file.toString()}`, webExtension.identifier.id, (0, errors_1.getErrorMessage)(error));
                    }
                }
                if ((0, types_1.isUndefined)(webExtension.defaultManifestTranslations)) {
                    if (webExtension.fallbackPackageNLSUri) {
                        try {
                            const content = await this.extensionResourceLoaderService.readExtensionResource(webExtension.fallbackPackageNLSUri);
                            webExtension.defaultManifestTranslations = JSON.parse(content);
                            update = true;
                        }
                        catch (error) {
                            this.logService.error(`Error while fetching default manifest translations of an extension`, webExtension.identifier.id, (0, errors_1.getErrorMessage)(error));
                        }
                    }
                    else {
                        update = true;
                        webExtension.defaultManifestTranslations = null;
                    }
                }
                const migratedLocation = (0, extensionResourceLoader_1.migratePlatformSpecificExtensionGalleryResourceURL)(webExtension.location, "web" /* TargetPlatform.WEB */);
                if (migratedLocation) {
                    update = true;
                    webExtension.location = migratedLocation;
                }
                return webExtension;
            }));
            if (update) {
                await this.storeWebExtensions(webExtensions, file);
            }
            return webExtensions;
        }
        async storeWebExtensions(webExtensions, file) {
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
            await this.fileService.writeFile(file, buffer_1.VSBuffer.fromString(JSON.stringify(storedWebExtensions)));
        }
        getResourceAccessQueue(file) {
            let resourceQueue = this.resourcesAccessQueueMap.get(file);
            if (!resourceQueue) {
                this.resourcesAccessQueueMap.set(file, resourceQueue = new async_1.Queue());
            }
            return resourceQueue;
        }
    };
    exports.WebExtensionsScannerService = WebExtensionsScannerService;
    exports.WebExtensionsScannerService = WebExtensionsScannerService = __decorate([
        __param(0, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(1, extensions_1.IBuiltinExtensionsScannerService),
        __param(2, files_1.IFileService),
        __param(3, log_1.ILogService),
        __param(4, extensionManagement_2.IExtensionGalleryService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(6, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(7, extensionStorage_1.IExtensionStorageService),
        __param(8, storage_1.IStorageService),
        __param(9, productService_1.IProductService),
        __param(10, userDataProfile_2.IUserDataProfilesService),
        __param(11, uriIdentity_1.IUriIdentityService),
        __param(12, lifecycle_2.ILifecycleService)
    ], WebExtensionsScannerService);
    if (platform_1.isWeb) {
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.extensions.action.openInstalledWebExtensionsResource',
                    title: { value: (0, nls_1.localize)('openInstalledWebExtensionsResource', "Open Installed Web Extensions Resource"), original: 'Open Installed Web Extensions Resource' },
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                    precondition: contextkeys_1.IsWebContext
                });
            }
            run(serviceAccessor) {
                const editorService = serviceAccessor.get(editorService_1.IEditorService);
                const userDataProfileService = serviceAccessor.get(userDataProfile_1.IUserDataProfileService);
                editorService.openEditor({ resource: userDataProfileService.currentProfile.extensionsResource });
            }
        });
    }
    (0, extensions_2.registerSingleton)(extensionManagement_1.IWebExtensionsScannerService, WebExtensionsScannerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViRXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbk1hbmFnZW1lbnQvYnJvd3Nlci93ZWJFeHRlbnNpb25zU2Nhbm5lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOENoRyxTQUFTLHNCQUFzQixDQUFDLEdBQVk7UUFDM0MsTUFBTSxvQkFBb0IsR0FBRyxHQUF1QyxDQUFDO1FBQ3JFLE9BQU8sT0FBTyxvQkFBb0IsRUFBRSxFQUFFLEtBQUssUUFBUTtlQUMvQyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksT0FBTyxvQkFBb0IsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDO2VBQ3ZHLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLEtBQUssU0FBUyxJQUFJLE9BQU8sb0JBQW9CLENBQUMsa0JBQWtCLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDNUgsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLEtBQWM7UUFDdEMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNYLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxPQUFPLElBQUEsZ0JBQVEsRUFBTyxLQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2pDLElBQUEsZ0JBQVEsRUFBTyxLQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQWdDTSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBUTFELFlBQ3NDLGtCQUF3RSxFQUMzRSwrQkFBa0YsRUFDdEcsV0FBMEMsRUFDM0MsVUFBd0MsRUFDM0IsY0FBeUQsRUFDOUMsa0NBQXdGLEVBQzVGLDhCQUFnRixFQUN2Rix1QkFBa0UsRUFDM0UsY0FBZ0QsRUFDaEQsY0FBZ0QsRUFDdkMsdUJBQWtF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