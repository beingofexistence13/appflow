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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/objects", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/json", "vs/base/common/jsonErrorMessages", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/base/common/event", "vs/base/common/marshalling", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/extensionManagement/common/extensionNls"], function (require, exports, arrays_1, async_1, objects, buffer_1, errors_1, json_1, jsonErrorMessages_1, lifecycle_1, network_1, path, platform, resources_1, semver, severity_1, types_1, uri_1, nls_1, environment_1, extensionManagementUtil_1, extensions_1, extensionValidator_1, files_1, instantiation_1, log_1, productService_1, event_1, marshalling_1, extensionsProfileScannerService_1, userDataProfile_1, uriIdentity_1, extensionNls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeExtensionsScannerService = exports.toExtensionDescription = exports.ExtensionScannerInput = exports.AbstractExtensionsScannerService = exports.IExtensionsScannerService = exports.Translations = void 0;
    var Translations;
    (function (Translations) {
        function equals(a, b) {
            if (a === b) {
                return true;
            }
            const aKeys = Object.keys(a);
            const bKeys = new Set();
            for (const key of Object.keys(b)) {
                bKeys.add(key);
            }
            if (aKeys.length !== bKeys.size) {
                return false;
            }
            for (const key of aKeys) {
                if (a[key] !== b[key]) {
                    return false;
                }
                bKeys.delete(key);
            }
            return bKeys.size === 0;
        }
        Translations.equals = equals;
    })(Translations || (exports.Translations = Translations = {}));
    exports.IExtensionsScannerService = (0, instantiation_1.createDecorator)('IExtensionsScannerService');
    let AbstractExtensionsScannerService = class AbstractExtensionsScannerService extends lifecycle_1.Disposable {
        constructor(systemExtensionsLocation, userExtensionsLocation, extensionsControlLocation, currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super();
            this.systemExtensionsLocation = systemExtensionsLocation;
            this.userExtensionsLocation = userExtensionsLocation;
            this.extensionsControlLocation = extensionsControlLocation;
            this.currentProfile = currentProfile;
            this.userDataProfilesService = userDataProfilesService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.fileService = fileService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.productService = productService;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this._onDidChangeCache = this._register(new event_1.Emitter());
            this.onDidChangeCache = this._onDidChangeCache.event;
            this.obsoleteFile = (0, resources_1.joinPath)(this.userExtensionsLocation, '.obsolete');
            this.systemExtensionsCachedScanner = this._register(this.instantiationService.createInstance(CachedExtensionsScanner, this.currentProfile, this.obsoleteFile));
            this.userExtensionsCachedScanner = this._register(this.instantiationService.createInstance(CachedExtensionsScanner, this.currentProfile, this.obsoleteFile));
            this.extensionsScanner = this._register(this.instantiationService.createInstance(ExtensionsScanner, this.obsoleteFile));
            this.initializeDefaultProfileExtensionsPromise = undefined;
            this._register(this.systemExtensionsCachedScanner.onDidChangeCache(() => this._onDidChangeCache.fire(0 /* ExtensionType.System */)));
            this._register(this.userExtensionsCachedScanner.onDidChangeCache(() => this._onDidChangeCache.fire(1 /* ExtensionType.User */)));
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = (0, extensionManagementUtil_1.computeTargetPlatform)(this.fileService, this.logService);
            }
            return this._targetPlatformPromise;
        }
        async scanAllExtensions(systemScanOptions, userScanOptions, includeExtensionsUnderDev) {
            const [system, user] = await Promise.all([
                this.scanSystemExtensions(systemScanOptions),
                this.scanUserExtensions(userScanOptions),
            ]);
            const development = includeExtensionsUnderDev ? await this.scanExtensionsUnderDevelopment(systemScanOptions, [...system, ...user]) : [];
            return this.dedupExtensions(system, user, development, await this.getTargetPlatform(), true);
        }
        async scanSystemExtensions(scanOptions) {
            const promises = [];
            promises.push(this.scanDefaultSystemExtensions(!!scanOptions.useCache, scanOptions.language));
            promises.push(this.scanDevSystemExtensions(scanOptions.language, !!scanOptions.checkControlFile));
            const [defaultSystemExtensions, devSystemExtensions] = await Promise.all(promises);
            return this.applyScanOptions([...defaultSystemExtensions, ...devSystemExtensions], 0 /* ExtensionType.System */, scanOptions, false);
        }
        async scanUserExtensions(scanOptions) {
            const location = scanOptions.profileLocation ?? this.userExtensionsLocation;
            this.logService.trace('Started scanning user extensions', location);
            const profileScanOptions = this.uriIdentityService.extUri.isEqual(scanOptions.profileLocation, this.userDataProfilesService.defaultProfile.extensionsResource) ? { bailOutWhenFileNotFound: true } : undefined;
            const extensionsScannerInput = await this.createExtensionScannerInput(location, !!scanOptions.profileLocation, 1 /* ExtensionType.User */, !scanOptions.includeUninstalled, scanOptions.language, true, profileScanOptions);
            const extensionsScanner = scanOptions.useCache && !extensionsScannerInput.devMode && extensionsScannerInput.excludeObsolete ? this.userExtensionsCachedScanner : this.extensionsScanner;
            let extensions;
            try {
                extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
            }
            catch (error) {
                if (error instanceof extensionsProfileScannerService_1.ExtensionsProfileScanningError && error.code === "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */) {
                    await this.doInitializeDefaultProfileExtensions();
                    extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
                }
                else {
                    throw error;
                }
            }
            extensions = await this.applyScanOptions(extensions, 1 /* ExtensionType.User */, scanOptions, true);
            this.logService.trace('Scanned user extensions:', extensions.length);
            return extensions;
        }
        async scanExtensionsUnderDevelopment(scanOptions, existingExtensions) {
            if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionDevelopmentLocationURI) {
                const extensions = (await Promise.all(this.environmentService.extensionDevelopmentLocationURI.filter(extLoc => extLoc.scheme === network_1.Schemas.file)
                    .map(async (extensionDevelopmentLocationURI) => {
                    const input = await this.createExtensionScannerInput(extensionDevelopmentLocationURI, false, 1 /* ExtensionType.User */, true, scanOptions.language, false /* do not validate */, undefined);
                    const extensions = await this.extensionsScanner.scanOneOrMultipleExtensions(input);
                    return extensions.map(extension => {
                        // Override the extension type from the existing extensions
                        extension.type = existingExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))?.type ?? extension.type;
                        // Validate the extension
                        return this.extensionsScanner.validate(extension, input);
                    });
                })))
                    .flat();
                return this.applyScanOptions(extensions, 'development', scanOptions, true);
            }
            return [];
        }
        async scanExistingExtension(extensionLocation, extensionType, scanOptions) {
            const extensionsScannerInput = await this.createExtensionScannerInput(extensionLocation, false, extensionType, true, scanOptions.language, true, undefined);
            const extension = await this.extensionsScanner.scanExtension(extensionsScannerInput);
            if (!extension) {
                return null;
            }
            if (!scanOptions.includeInvalid && !extension.isValid) {
                return null;
            }
            return extension;
        }
        async scanOneOrMultipleExtensions(extensionLocation, extensionType, scanOptions) {
            const extensionsScannerInput = await this.createExtensionScannerInput(extensionLocation, false, extensionType, true, scanOptions.language, true, undefined);
            const extensions = await this.extensionsScanner.scanOneOrMultipleExtensions(extensionsScannerInput);
            return this.applyScanOptions(extensions, extensionType, scanOptions, true);
        }
        async scanMetadata(extensionLocation) {
            const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
            const content = (await this.fileService.readFile(manifestLocation)).value.toString();
            const manifest = JSON.parse(content);
            return manifest.__metadata;
        }
        async updateMetadata(extensionLocation, metaData) {
            const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
            const content = (await this.fileService.readFile(manifestLocation)).value.toString();
            const manifest = JSON.parse(content);
            // unset if false
            metaData.isMachineScoped = metaData.isMachineScoped || undefined;
            metaData.isBuiltin = metaData.isBuiltin || undefined;
            manifest.__metadata = { ...manifest.__metadata, ...metaData };
            await this.fileService.writeFile((0, resources_1.joinPath)(extensionLocation, 'package.json'), buffer_1.VSBuffer.fromString(JSON.stringify(manifest, null, '\t')));
        }
        async initializeDefaultProfileExtensions() {
            try {
                await this.extensionsProfileScannerService.scanProfileExtensions(this.userDataProfilesService.defaultProfile.extensionsResource, { bailOutWhenFileNotFound: true });
            }
            catch (error) {
                if (error instanceof extensionsProfileScannerService_1.ExtensionsProfileScanningError && error.code === "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */) {
                    await this.doInitializeDefaultProfileExtensions();
                }
                else {
                    throw error;
                }
            }
        }
        async doInitializeDefaultProfileExtensions() {
            if (!this.initializeDefaultProfileExtensionsPromise) {
                this.initializeDefaultProfileExtensionsPromise = (async () => {
                    try {
                        this.logService.info('Started initializing default profile extensions in extensions installation folder.', this.userExtensionsLocation.toString());
                        const userExtensions = await this.scanUserExtensions({ includeInvalid: true });
                        if (userExtensions.length) {
                            await this.extensionsProfileScannerService.addExtensionsToProfile(userExtensions.map(e => [e, e.metadata]), this.userDataProfilesService.defaultProfile.extensionsResource);
                        }
                        else {
                            try {
                                await this.fileService.createFile(this.userDataProfilesService.defaultProfile.extensionsResource, buffer_1.VSBuffer.fromString(JSON.stringify([])));
                            }
                            catch (error) {
                                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                                    this.logService.warn('Failed to create default profile extensions manifest in extensions installation folder.', this.userExtensionsLocation.toString(), (0, errors_1.getErrorMessage)(error));
                                }
                            }
                        }
                        this.logService.info('Completed initializing default profile extensions in extensions installation folder.', this.userExtensionsLocation.toString());
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                    finally {
                        this.initializeDefaultProfileExtensionsPromise = undefined;
                    }
                })();
            }
            return this.initializeDefaultProfileExtensionsPromise;
        }
        async applyScanOptions(extensions, type, scanOptions, pickLatest) {
            if (!scanOptions.includeAllVersions) {
                extensions = this.dedupExtensions(type === 0 /* ExtensionType.System */ ? extensions : undefined, type === 1 /* ExtensionType.User */ ? extensions : undefined, type === 'development' ? extensions : undefined, await this.getTargetPlatform(), pickLatest);
            }
            if (!scanOptions.includeInvalid) {
                extensions = extensions.filter(extension => extension.isValid);
            }
            return extensions.sort((a, b) => {
                const aLastSegment = path.basename(a.location.fsPath);
                const bLastSegment = path.basename(b.location.fsPath);
                if (aLastSegment < bLastSegment) {
                    return -1;
                }
                if (aLastSegment > bLastSegment) {
                    return 1;
                }
                return 0;
            });
        }
        dedupExtensions(system, user, development, targetPlatform, pickLatest) {
            const pick = (existing, extension, isDevelopment) => {
                if (existing.isValid && !extension.isValid) {
                    return false;
                }
                if (existing.isValid === extension.isValid) {
                    if (pickLatest && semver.gt(existing.manifest.version, extension.manifest.version)) {
                        this.logService.debug(`Skipping extension ${extension.location.path} with lower version ${extension.manifest.version} in favour of ${existing.location.path} with version ${existing.manifest.version}`);
                        return false;
                    }
                    if (semver.eq(existing.manifest.version, extension.manifest.version)) {
                        if (existing.type === 0 /* ExtensionType.System */) {
                            this.logService.debug(`Skipping extension ${extension.location.path} in favour of system extension ${existing.location.path} with same version`);
                            return false;
                        }
                        if (existing.targetPlatform === targetPlatform) {
                            this.logService.debug(`Skipping extension ${extension.location.path} from different target platform ${extension.targetPlatform}`);
                            return false;
                        }
                    }
                }
                if (isDevelopment) {
                    this.logService.warn(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
                }
                else {
                    this.logService.debug(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
                }
                return true;
            };
            const result = new extensions_1.ExtensionIdentifierMap();
            system?.forEach((extension) => {
                const existing = result.get(extension.identifier.id);
                if (!existing || pick(existing, extension, false)) {
                    result.set(extension.identifier.id, extension);
                }
            });
            user?.forEach((extension) => {
                const existing = result.get(extension.identifier.id);
                if (!existing && system && extension.type === 0 /* ExtensionType.System */) {
                    this.logService.debug(`Skipping obsolete system extension ${extension.location.path}.`);
                    return;
                }
                if (!existing || pick(existing, extension, false)) {
                    result.set(extension.identifier.id, extension);
                }
            });
            development?.forEach(extension => {
                const existing = result.get(extension.identifier.id);
                if (!existing || pick(existing, extension, true)) {
                    result.set(extension.identifier.id, extension);
                }
                result.set(extension.identifier.id, extension);
            });
            return [...result.values()];
        }
        async scanDefaultSystemExtensions(useCache, language) {
            this.logService.trace('Started scanning system extensions');
            const extensionsScannerInput = await this.createExtensionScannerInput(this.systemExtensionsLocation, false, 0 /* ExtensionType.System */, true, language, true, undefined);
            const extensionsScanner = useCache && !extensionsScannerInput.devMode ? this.systemExtensionsCachedScanner : this.extensionsScanner;
            const result = await extensionsScanner.scanExtensions(extensionsScannerInput);
            this.logService.trace('Scanned system extensions:', result.length);
            return result;
        }
        async scanDevSystemExtensions(language, checkControlFile) {
            const devSystemExtensionsList = this.environmentService.isBuilt ? [] : this.productService.builtInExtensions;
            if (!devSystemExtensionsList?.length) {
                return [];
            }
            this.logService.trace('Started scanning dev system extensions');
            const builtinExtensionControl = checkControlFile ? await this.getBuiltInExtensionControl() : {};
            const devSystemExtensionsLocations = [];
            const devSystemExtensionsLocation = uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('').fsPath, '..', '.build', 'builtInExtensions')));
            for (const extension of devSystemExtensionsList) {
                const controlState = builtinExtensionControl[extension.name] || 'marketplace';
                switch (controlState) {
                    case 'disabled':
                        break;
                    case 'marketplace':
                        devSystemExtensionsLocations.push((0, resources_1.joinPath)(devSystemExtensionsLocation, extension.name));
                        break;
                    default:
                        devSystemExtensionsLocations.push(uri_1.URI.file(controlState));
                        break;
                }
            }
            const result = await Promise.all(devSystemExtensionsLocations.map(async (location) => this.extensionsScanner.scanExtension((await this.createExtensionScannerInput(location, false, 0 /* ExtensionType.System */, true, language, true, undefined)))));
            this.logService.trace('Scanned dev system extensions:', result.length);
            return (0, arrays_1.coalesce)(result);
        }
        async getBuiltInExtensionControl() {
            try {
                const content = await this.fileService.readFile(this.extensionsControlLocation);
                return JSON.parse(content.value.toString());
            }
            catch (error) {
                return {};
            }
        }
        async createExtensionScannerInput(location, profile, type, excludeObsolete, language, validate, profileScanOptions) {
            const translations = await this.getTranslations(language ?? platform.language);
            const mtime = await this.getMtime(location);
            const applicationExtensionsLocation = profile && !this.uriIdentityService.extUri.isEqual(location, this.userDataProfilesService.defaultProfile.extensionsResource) ? this.userDataProfilesService.defaultProfile.extensionsResource : undefined;
            const applicationExtensionsLocationMtime = applicationExtensionsLocation ? await this.getMtime(applicationExtensionsLocation) : undefined;
            return new ExtensionScannerInput(location, mtime, applicationExtensionsLocation, applicationExtensionsLocationMtime, profile, profileScanOptions, type, excludeObsolete, validate, this.productService.version, this.productService.date, this.productService.commit, !this.environmentService.isBuilt, language, translations);
        }
        async getMtime(location) {
            try {
                const stat = await this.fileService.stat(location);
                if (typeof stat.mtime === 'number') {
                    return stat.mtime;
                }
            }
            catch (err) {
                // That's ok...
            }
            return undefined;
        }
    };
    exports.AbstractExtensionsScannerService = AbstractExtensionsScannerService;
    exports.AbstractExtensionsScannerService = AbstractExtensionsScannerService = __decorate([
        __param(4, userDataProfile_1.IUserDataProfilesService),
        __param(5, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(6, files_1.IFileService),
        __param(7, log_1.ILogService),
        __param(8, environment_1.IEnvironmentService),
        __param(9, productService_1.IProductService),
        __param(10, uriIdentity_1.IUriIdentityService),
        __param(11, instantiation_1.IInstantiationService)
    ], AbstractExtensionsScannerService);
    class ExtensionScannerInput {
        constructor(location, mtime, applicationExtensionslocation, applicationExtensionslocationMtime, profile, profileScanOptions, type, excludeObsolete, validate, productVersion, productDate, productCommit, devMode, language, translations) {
            this.location = location;
            this.mtime = mtime;
            this.applicationExtensionslocation = applicationExtensionslocation;
            this.applicationExtensionslocationMtime = applicationExtensionslocationMtime;
            this.profile = profile;
            this.profileScanOptions = profileScanOptions;
            this.type = type;
            this.excludeObsolete = excludeObsolete;
            this.validate = validate;
            this.productVersion = productVersion;
            this.productDate = productDate;
            this.productCommit = productCommit;
            this.devMode = devMode;
            this.language = language;
            this.translations = translations;
            // Keep empty!! (JSON.parse)
        }
        static createNlsConfiguration(input) {
            return {
                language: input.language,
                pseudo: input.language === 'pseudo',
                devMode: input.devMode,
                translations: input.translations
            };
        }
        static equals(a, b) {
            return ((0, resources_1.isEqual)(a.location, b.location)
                && a.mtime === b.mtime
                && (0, resources_1.isEqual)(a.applicationExtensionslocation, b.applicationExtensionslocation)
                && a.applicationExtensionslocationMtime === b.applicationExtensionslocationMtime
                && a.profile === b.profile
                && objects.equals(a.profileScanOptions, b.profileScanOptions)
                && a.type === b.type
                && a.excludeObsolete === b.excludeObsolete
                && a.validate === b.validate
                && a.productVersion === b.productVersion
                && a.productDate === b.productDate
                && a.productCommit === b.productCommit
                && a.devMode === b.devMode
                && a.language === b.language
                && Translations.equals(a.translations, b.translations));
        }
    }
    exports.ExtensionScannerInput = ExtensionScannerInput;
    let ExtensionsScanner = class ExtensionsScanner extends lifecycle_1.Disposable {
        constructor(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
            super();
            this.obsoleteFile = obsoleteFile;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.logService = logService;
        }
        async scanExtensions(input) {
            const extensions = input.profile ? await this.scanExtensionsFromProfile(input) : await this.scanExtensionsFromLocation(input);
            let obsolete = {};
            if (input.excludeObsolete && input.type === 1 /* ExtensionType.User */) {
                try {
                    const raw = (await this.fileService.readFile(this.obsoleteFile)).value.toString();
                    obsolete = JSON.parse(raw);
                }
                catch (error) { /* ignore */ }
            }
            return (0, types_1.isEmptyObject)(obsolete) ? extensions : extensions.filter(e => !obsolete[extensionManagementUtil_1.ExtensionKey.create(e).toString()]);
        }
        async scanExtensionsFromLocation(input) {
            const stat = await this.fileService.resolve(input.location);
            if (!stat.children?.length) {
                return [];
            }
            const extensions = await Promise.all(stat.children.map(async (c) => {
                if (!c.isDirectory) {
                    return null;
                }
                // Do not consider user extension folder starting with `.`
                if (input.type === 1 /* ExtensionType.User */ && (0, resources_1.basename)(c.resource).indexOf('.') === 0) {
                    return null;
                }
                const extensionScannerInput = new ExtensionScannerInput(c.resource, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.profileScanOptions, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                return this.scanExtension(extensionScannerInput);
            }));
            return (0, arrays_1.coalesce)(extensions)
                // Sort: Make sure extensions are in the same order always. Helps cache invalidation even if the order changes.
                .sort((a, b) => a.location.path < b.location.path ? -1 : 1);
        }
        async scanExtensionsFromProfile(input) {
            let profileExtensions = await this.scanExtensionsFromProfileResource(input.location, () => true, input);
            if (input.applicationExtensionslocation && !this.uriIdentityService.extUri.isEqual(input.location, input.applicationExtensionslocation)) {
                profileExtensions = profileExtensions.filter(e => !e.metadata?.isApplicationScoped);
                const applicationExtensions = await this.scanExtensionsFromProfileResource(input.applicationExtensionslocation, (e) => !!e.metadata?.isBuiltin || !!e.metadata?.isApplicationScoped, input);
                profileExtensions.push(...applicationExtensions);
            }
            return profileExtensions;
        }
        async scanExtensionsFromProfileResource(profileResource, filter, input) {
            const scannedProfileExtensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileResource, input.profileScanOptions);
            if (!scannedProfileExtensions.length) {
                return [];
            }
            const extensions = await Promise.all(scannedProfileExtensions.map(async (extensionInfo) => {
                if (filter(extensionInfo)) {
                    const extensionScannerInput = new ExtensionScannerInput(extensionInfo.location, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.profileScanOptions, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                    return this.scanExtension(extensionScannerInput, extensionInfo.metadata);
                }
                return null;
            }));
            return (0, arrays_1.coalesce)(extensions);
        }
        async scanOneOrMultipleExtensions(input) {
            try {
                if (await this.fileService.exists((0, resources_1.joinPath)(input.location, 'package.json'))) {
                    const extension = await this.scanExtension(input);
                    return extension ? [extension] : [];
                }
                else {
                    return await this.scanExtensions(input);
                }
            }
            catch (error) {
                this.logService.error(`Error scanning extensions at ${input.location.path}:`, (0, errors_1.getErrorMessage)(error));
                return [];
            }
        }
        async scanExtension(input, metadata) {
            try {
                let manifest = await this.scanExtensionManifest(input.location);
                if (manifest) {
                    // allow publisher to be undefined to make the initial extension authoring experience smoother
                    if (!manifest.publisher) {
                        manifest.publisher = extensions_1.UNDEFINED_PUBLISHER;
                    }
                    metadata = metadata ?? manifest.__metadata;
                    delete manifest.__metadata;
                    const id = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
                    const identifier = metadata?.id ? { id, uuid: metadata.id } : { id };
                    const type = metadata?.isSystem ? 0 /* ExtensionType.System */ : input.type;
                    const isBuiltin = type === 0 /* ExtensionType.System */ || !!metadata?.isBuiltin;
                    manifest = await this.translateManifest(input.location, manifest, ExtensionScannerInput.createNlsConfiguration(input));
                    const extension = {
                        type,
                        identifier,
                        manifest,
                        location: input.location,
                        isBuiltin,
                        targetPlatform: metadata?.targetPlatform ?? "undefined" /* TargetPlatform.UNDEFINED */,
                        metadata,
                        isValid: true,
                        validations: []
                    };
                    return input.validate ? this.validate(extension, input) : extension;
                }
            }
            catch (e) {
                if (input.type !== 0 /* ExtensionType.System */) {
                    this.logService.error(e);
                }
            }
            return null;
        }
        validate(extension, input) {
            let isValid = true;
            const validations = (0, extensionValidator_1.validateExtensionManifest)(input.productVersion, input.productDate, input.location, extension.manifest, extension.isBuiltin);
            for (const [severity, message] of validations) {
                if (severity === severity_1.default.Error) {
                    isValid = false;
                    this.logService.error(this.formatMessage(input.location, message));
                }
            }
            extension.isValid = isValid;
            extension.validations = validations;
            return extension;
        }
        async scanExtensionManifest(extensionLocation) {
            const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
            let content;
            try {
                content = (await this.fileService.readFile(manifestLocation)).value.toString();
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('fileReadFail', "Cannot read file {0}: {1}.", manifestLocation.path, error.message)));
                }
                return null;
            }
            let manifest;
            try {
                manifest = JSON.parse(content);
            }
            catch (err) {
                // invalid JSON, let's get good errors
                const errors = [];
                (0, json_1.parse)(content, errors);
                for (const e of errors) {
                    this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonParseFail', "Failed to parse {0}: [{1}, {2}] {3}.", manifestLocation.path, e.offset, e.length, (0, jsonErrorMessages_1.getParseErrorMessage)(e.error))));
                }
                return null;
            }
            if ((0, json_1.getNodeType)(manifest) !== 'object') {
                this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonParseInvalidType', "Invalid manifest file {0}: Not an JSON object.", manifestLocation.path)));
                return null;
            }
            return manifest;
        }
        async translateManifest(extensionLocation, extensionManifest, nlsConfiguration) {
            const localizedMessages = await this.getLocalizedMessages(extensionLocation, extensionManifest, nlsConfiguration);
            if (localizedMessages) {
                try {
                    const errors = [];
                    // resolveOriginalMessageBundle returns null if localizedMessages.default === undefined;
                    const defaults = await this.resolveOriginalMessageBundle(localizedMessages.default, errors);
                    if (errors.length > 0) {
                        errors.forEach((error) => {
                            this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localizedMessages.default?.path, (0, jsonErrorMessages_1.getParseErrorMessage)(error.error))));
                        });
                        return extensionManifest;
                    }
                    else if ((0, json_1.getNodeType)(localizedMessages) !== 'object') {
                        this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonInvalidFormat', "Invalid format {0}: JSON object expected.", localizedMessages.default?.path)));
                        return extensionManifest;
                    }
                    const localized = localizedMessages.values || Object.create(null);
                    return (0, extensionNls_1.localizeManifest)(this.logService, extensionManifest, localized, defaults);
                }
                catch (error) {
                    /*Ignore Error*/
                }
            }
            return extensionManifest;
        }
        async getLocalizedMessages(extensionLocation, extensionManifest, nlsConfiguration) {
            const defaultPackageNLS = (0, resources_1.joinPath)(extensionLocation, 'package.nls.json');
            const reportErrors = (localized, errors) => {
                errors.forEach((error) => {
                    this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localized?.path, (0, jsonErrorMessages_1.getParseErrorMessage)(error.error))));
                });
            };
            const reportInvalidFormat = (localized) => {
                this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonInvalidFormat', "Invalid format {0}: JSON object expected.", localized?.path)));
            };
            const translationId = `${extensionManifest.publisher}.${extensionManifest.name}`;
            const translationPath = nlsConfiguration.translations[translationId];
            if (translationPath) {
                try {
                    const translationResource = uri_1.URI.file(translationPath);
                    const content = (await this.fileService.readFile(translationResource)).value.toString();
                    const errors = [];
                    const translationBundle = (0, json_1.parse)(content, errors);
                    if (errors.length > 0) {
                        reportErrors(translationResource, errors);
                        return { values: undefined, default: defaultPackageNLS };
                    }
                    else if ((0, json_1.getNodeType)(translationBundle) !== 'object') {
                        reportInvalidFormat(translationResource);
                        return { values: undefined, default: defaultPackageNLS };
                    }
                    else {
                        const values = translationBundle.contents ? translationBundle.contents.package : undefined;
                        return { values: values, default: defaultPackageNLS };
                    }
                }
                catch (error) {
                    return { values: undefined, default: defaultPackageNLS };
                }
            }
            else {
                const exists = await this.fileService.exists(defaultPackageNLS);
                if (!exists) {
                    return undefined;
                }
                let messageBundle;
                try {
                    messageBundle = await this.findMessageBundles(extensionLocation, nlsConfiguration);
                }
                catch (error) {
                    return undefined;
                }
                if (!messageBundle.localized) {
                    return { values: undefined, default: messageBundle.original };
                }
                try {
                    const messageBundleContent = (await this.fileService.readFile(messageBundle.localized)).value.toString();
                    const errors = [];
                    const messages = (0, json_1.parse)(messageBundleContent, errors);
                    if (errors.length > 0) {
                        reportErrors(messageBundle.localized, errors);
                        return { values: undefined, default: messageBundle.original };
                    }
                    else if ((0, json_1.getNodeType)(messages) !== 'object') {
                        reportInvalidFormat(messageBundle.localized);
                        return { values: undefined, default: messageBundle.original };
                    }
                    return { values: messages, default: messageBundle.original };
                }
                catch (error) {
                    return { values: undefined, default: messageBundle.original };
                }
            }
        }
        /**
         * Parses original message bundle, returns null if the original message bundle is null.
         */
        async resolveOriginalMessageBundle(originalMessageBundle, errors) {
            if (originalMessageBundle) {
                try {
                    const originalBundleContent = (await this.fileService.readFile(originalMessageBundle)).value.toString();
                    return (0, json_1.parse)(originalBundleContent, errors);
                }
                catch (error) {
                    /* Ignore Error */
                }
            }
            return;
        }
        /**
         * Finds localized message bundle and the original (unlocalized) one.
         * If the localized file is not present, returns null for the original and marks original as localized.
         */
        findMessageBundles(extensionLocation, nlsConfiguration) {
            return new Promise((c, e) => {
                const loop = (locale) => {
                    const toCheck = (0, resources_1.joinPath)(extensionLocation, `package.nls.${locale}.json`);
                    this.fileService.exists(toCheck).then(exists => {
                        if (exists) {
                            c({ localized: toCheck, original: (0, resources_1.joinPath)(extensionLocation, 'package.nls.json') });
                        }
                        const index = locale.lastIndexOf('-');
                        if (index === -1) {
                            c({ localized: (0, resources_1.joinPath)(extensionLocation, 'package.nls.json'), original: null });
                        }
                        else {
                            locale = locale.substring(0, index);
                            loop(locale);
                        }
                    });
                };
                if (nlsConfiguration.devMode || nlsConfiguration.pseudo || !nlsConfiguration.language) {
                    return c({ localized: (0, resources_1.joinPath)(extensionLocation, 'package.nls.json'), original: null });
                }
                loop(nlsConfiguration.language);
            });
        }
        formatMessage(extensionLocation, message) {
            return `[${extensionLocation.path}]: ${message}`;
        }
    };
    ExtensionsScanner = __decorate([
        __param(1, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService)
    ], ExtensionsScanner);
    let CachedExtensionsScanner = class CachedExtensionsScanner extends ExtensionsScanner {
        constructor(currentProfile, obsoleteFile, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
            super(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService);
            this.currentProfile = currentProfile;
            this.userDataProfilesService = userDataProfilesService;
            this.cacheValidatorThrottler = this._register(new async_1.ThrottledDelayer(3000));
            this._onDidChangeCache = this._register(new event_1.Emitter());
            this.onDidChangeCache = this._onDidChangeCache.event;
        }
        async scanExtensions(input) {
            const cacheFile = this.getCacheFile(input);
            const cacheContents = await this.readExtensionCache(cacheFile);
            this.input = input;
            if (cacheContents && cacheContents.input && ExtensionScannerInput.equals(cacheContents.input, this.input)) {
                this.logService.debug('Using cached extensions scan result', input.location.toString());
                this.cacheValidatorThrottler.trigger(() => this.validateCache());
                return cacheContents.result.map((extension) => {
                    // revive URI object
                    extension.location = uri_1.URI.revive(extension.location);
                    return extension;
                });
            }
            const result = await super.scanExtensions(input);
            await this.writeExtensionCache(cacheFile, { input, result });
            return result;
        }
        async readExtensionCache(cacheFile) {
            try {
                const cacheRawContents = await this.fileService.readFile(cacheFile);
                const extensionCacheData = JSON.parse(cacheRawContents.value.toString());
                return { result: extensionCacheData.result, input: (0, marshalling_1.revive)(extensionCacheData.input) };
            }
            catch (error) {
                this.logService.debug('Error while reading the extension cache file:', cacheFile.path, (0, errors_1.getErrorMessage)(error));
            }
            return null;
        }
        async writeExtensionCache(cacheFile, cacheContents) {
            try {
                await this.fileService.writeFile(cacheFile, buffer_1.VSBuffer.fromString(JSON.stringify(cacheContents)));
            }
            catch (error) {
                this.logService.debug('Error while writing the extension cache file:', cacheFile.path, (0, errors_1.getErrorMessage)(error));
            }
        }
        async validateCache() {
            if (!this.input) {
                // Input has been unset by the time we get here, so skip validation
                return;
            }
            const cacheFile = this.getCacheFile(this.input);
            const cacheContents = await this.readExtensionCache(cacheFile);
            if (!cacheContents) {
                // Cache has been deleted by someone else, which is perfectly fine...
                return;
            }
            const actual = cacheContents.result;
            const expected = JSON.parse(JSON.stringify(await super.scanExtensions(this.input)));
            if (objects.equals(expected, actual)) {
                // Cache is valid and running with it is perfectly fine...
                return;
            }
            try {
                this.logService.info('Invalidating Cache', actual, expected);
                // Cache is invalid, delete it
                await this.fileService.del(cacheFile);
                this._onDidChangeCache.fire();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        getCacheFile(input) {
            const profile = this.getProfile(input);
            return this.uriIdentityService.extUri.joinPath(profile.cacheHome, input.type === 0 /* ExtensionType.System */ ? extensions_1.BUILTIN_MANIFEST_CACHE_FILE : extensions_1.USER_MANIFEST_CACHE_FILE);
        }
        getProfile(input) {
            if (input.type === 0 /* ExtensionType.System */) {
                return this.userDataProfilesService.defaultProfile;
            }
            if (!input.profile) {
                return this.userDataProfilesService.defaultProfile;
            }
            if (this.uriIdentityService.extUri.isEqual(input.location, this.currentProfile.extensionsResource)) {
                return this.currentProfile;
            }
            return this.userDataProfilesService.profiles.find(p => this.uriIdentityService.extUri.isEqual(input.location, p.extensionsResource)) ?? this.currentProfile;
        }
    };
    CachedExtensionsScanner = __decorate([
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, files_1.IFileService),
        __param(6, log_1.ILogService)
    ], CachedExtensionsScanner);
    function toExtensionDescription(extension, isUnderDevelopment) {
        const id = (0, extensionManagementUtil_1.getExtensionId)(extension.manifest.publisher, extension.manifest.name);
        return {
            id,
            identifier: new extensions_1.ExtensionIdentifier(id),
            isBuiltin: extension.type === 0 /* ExtensionType.System */,
            isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
            isUnderDevelopment,
            extensionLocation: extension.location,
            uuid: extension.identifier.uuid,
            targetPlatform: extension.targetPlatform,
            ...extension.manifest,
        };
    }
    exports.toExtensionDescription = toExtensionDescription;
    class NativeExtensionsScannerService extends AbstractExtensionsScannerService {
        constructor(systemExtensionsLocation, userExtensionsLocation, userHome, currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super(systemExtensionsLocation, userExtensionsLocation, (0, resources_1.joinPath)(userHome, '.vscode-oss-dev', 'extensions', 'control.json'), currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
            this.translationsPromise = (async () => {
                if (platform.translationsConfigFile) {
                    try {
                        const content = await this.fileService.readFile(uri_1.URI.file(platform.translationsConfigFile));
                        return JSON.parse(content.value.toString());
                    }
                    catch (err) { /* Ignore Error */ }
                }
                return Object.create(null);
            })();
        }
        getTranslations(language) {
            return this.translationsPromise;
        }
    }
    exports.NativeExtensionsScannerService = NativeExtensionsScannerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdEaEcsSUFBaUIsWUFBWSxDQXNCNUI7SUF0QkQsV0FBaUIsWUFBWTtRQUM1QixTQUFnQixNQUFNLENBQUMsQ0FBZSxFQUFFLENBQWU7WUFDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNaLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sS0FBSyxHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQzdDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNmO1lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBRTtnQkFDeEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN0QixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2xCO1lBQ0QsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBcEJlLG1CQUFNLFNBb0JyQixDQUFBO0lBQ0YsQ0FB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