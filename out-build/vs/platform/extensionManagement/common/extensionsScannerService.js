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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/objects", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/json", "vs/base/common/jsonErrorMessages", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/base/common/event", "vs/base/common/marshalling", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/extensionManagement/common/extensionNls"], function (require, exports, arrays_1, async_1, objects, buffer_1, errors_1, json_1, jsonErrorMessages_1, lifecycle_1, network_1, path, platform, resources_1, semver, severity_1, types_1, uri_1, nls_1, environment_1, extensionManagementUtil_1, extensions_1, extensionValidator_1, files_1, instantiation_1, log_1, productService_1, event_1, marshalling_1, extensionsProfileScannerService_1, userDataProfile_1, uriIdentity_1, extensionNls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sp = exports.$rp = exports.$qp = exports.$pp = exports.$op = exports.Translations = void 0;
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
    exports.$op = (0, instantiation_1.$Bh)('IExtensionsScannerService');
    let $pp = class $pp extends lifecycle_1.$kc {
        constructor(systemExtensionsLocation, userExtensionsLocation, r, s, t, u, w, y, z, C, D, F) {
            super();
            this.systemExtensionsLocation = systemExtensionsLocation;
            this.userExtensionsLocation = userExtensionsLocation;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeCache = this.g.event;
            this.h = (0, resources_1.$ig)(this.userExtensionsLocation, '.obsolete');
            this.j = this.B(this.F.createInstance(CachedExtensionsScanner, this.s, this.h));
            this.m = this.B(this.F.createInstance(CachedExtensionsScanner, this.s, this.h));
            this.n = this.B(this.F.createInstance(ExtensionsScanner, this.h));
            this.H = undefined;
            this.B(this.j.onDidChangeCache(() => this.g.fire(0 /* ExtensionType.System */)));
            this.B(this.m.onDidChangeCache(() => this.g.fire(1 /* ExtensionType.User */)));
        }
        getTargetPlatform() {
            if (!this.G) {
                this.G = (0, extensionManagementUtil_1.$Ao)(this.w, this.y);
            }
            return this.G;
        }
        async scanAllExtensions(systemScanOptions, userScanOptions, includeExtensionsUnderDev) {
            const [system, user] = await Promise.all([
                this.scanSystemExtensions(systemScanOptions),
                this.scanUserExtensions(userScanOptions),
            ]);
            const development = includeExtensionsUnderDev ? await this.scanExtensionsUnderDevelopment(systemScanOptions, [...system, ...user]) : [];
            return this.L(system, user, development, await this.getTargetPlatform(), true);
        }
        async scanSystemExtensions(scanOptions) {
            const promises = [];
            promises.push(this.M(!!scanOptions.useCache, scanOptions.language));
            promises.push(this.N(scanOptions.language, !!scanOptions.checkControlFile));
            const [defaultSystemExtensions, devSystemExtensions] = await Promise.all(promises);
            return this.J([...defaultSystemExtensions, ...devSystemExtensions], 0 /* ExtensionType.System */, scanOptions, false);
        }
        async scanUserExtensions(scanOptions) {
            const location = scanOptions.profileLocation ?? this.userExtensionsLocation;
            this.y.trace('Started scanning user extensions', location);
            const profileScanOptions = this.D.extUri.isEqual(scanOptions.profileLocation, this.t.defaultProfile.extensionsResource) ? { bailOutWhenFileNotFound: true } : undefined;
            const extensionsScannerInput = await this.P(location, !!scanOptions.profileLocation, 1 /* ExtensionType.User */, !scanOptions.includeUninstalled, scanOptions.language, true, profileScanOptions);
            const extensionsScanner = scanOptions.useCache && !extensionsScannerInput.devMode && extensionsScannerInput.excludeObsolete ? this.m : this.n;
            let extensions;
            try {
                extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
            }
            catch (error) {
                if (error instanceof extensionsProfileScannerService_1.$jp && error.code === "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */) {
                    await this.I();
                    extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
                }
                else {
                    throw error;
                }
            }
            extensions = await this.J(extensions, 1 /* ExtensionType.User */, scanOptions, true);
            this.y.trace('Scanned user extensions:', extensions.length);
            return extensions;
        }
        async scanExtensionsUnderDevelopment(scanOptions, existingExtensions) {
            if (this.z.isExtensionDevelopment && this.z.extensionDevelopmentLocationURI) {
                const extensions = (await Promise.all(this.z.extensionDevelopmentLocationURI.filter(extLoc => extLoc.scheme === network_1.Schemas.file)
                    .map(async (extensionDevelopmentLocationURI) => {
                    const input = await this.P(extensionDevelopmentLocationURI, false, 1 /* ExtensionType.User */, true, scanOptions.language, false /* do not validate */, undefined);
                    const extensions = await this.n.scanOneOrMultipleExtensions(input);
                    return extensions.map(extension => {
                        // Override the extension type from the existing extensions
                        extension.type = existingExtensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))?.type ?? extension.type;
                        // Validate the extension
                        return this.n.validate(extension, input);
                    });
                })))
                    .flat();
                return this.J(extensions, 'development', scanOptions, true);
            }
            return [];
        }
        async scanExistingExtension(extensionLocation, extensionType, scanOptions) {
            const extensionsScannerInput = await this.P(extensionLocation, false, extensionType, true, scanOptions.language, true, undefined);
            const extension = await this.n.scanExtension(extensionsScannerInput);
            if (!extension) {
                return null;
            }
            if (!scanOptions.includeInvalid && !extension.isValid) {
                return null;
            }
            return extension;
        }
        async scanOneOrMultipleExtensions(extensionLocation, extensionType, scanOptions) {
            const extensionsScannerInput = await this.P(extensionLocation, false, extensionType, true, scanOptions.language, true, undefined);
            const extensions = await this.n.scanOneOrMultipleExtensions(extensionsScannerInput);
            return this.J(extensions, extensionType, scanOptions, true);
        }
        async scanMetadata(extensionLocation) {
            const manifestLocation = (0, resources_1.$ig)(extensionLocation, 'package.json');
            const content = (await this.w.readFile(manifestLocation)).value.toString();
            const manifest = JSON.parse(content);
            return manifest.__metadata;
        }
        async updateMetadata(extensionLocation, metaData) {
            const manifestLocation = (0, resources_1.$ig)(extensionLocation, 'package.json');
            const content = (await this.w.readFile(manifestLocation)).value.toString();
            const manifest = JSON.parse(content);
            // unset if false
            metaData.isMachineScoped = metaData.isMachineScoped || undefined;
            metaData.isBuiltin = metaData.isBuiltin || undefined;
            manifest.__metadata = { ...manifest.__metadata, ...metaData };
            await this.w.writeFile((0, resources_1.$ig)(extensionLocation, 'package.json'), buffer_1.$Fd.fromString(JSON.stringify(manifest, null, '\t')));
        }
        async initializeDefaultProfileExtensions() {
            try {
                await this.u.scanProfileExtensions(this.t.defaultProfile.extensionsResource, { bailOutWhenFileNotFound: true });
            }
            catch (error) {
                if (error instanceof extensionsProfileScannerService_1.$jp && error.code === "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */) {
                    await this.I();
                }
                else {
                    throw error;
                }
            }
        }
        async I() {
            if (!this.H) {
                this.H = (async () => {
                    try {
                        this.y.info('Started initializing default profile extensions in extensions installation folder.', this.userExtensionsLocation.toString());
                        const userExtensions = await this.scanUserExtensions({ includeInvalid: true });
                        if (userExtensions.length) {
                            await this.u.addExtensionsToProfile(userExtensions.map(e => [e, e.metadata]), this.t.defaultProfile.extensionsResource);
                        }
                        else {
                            try {
                                await this.w.createFile(this.t.defaultProfile.extensionsResource, buffer_1.$Fd.fromString(JSON.stringify([])));
                            }
                            catch (error) {
                                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                                    this.y.warn('Failed to create default profile extensions manifest in extensions installation folder.', this.userExtensionsLocation.toString(), (0, errors_1.$8)(error));
                                }
                            }
                        }
                        this.y.info('Completed initializing default profile extensions in extensions installation folder.', this.userExtensionsLocation.toString());
                    }
                    catch (error) {
                        this.y.error(error);
                    }
                    finally {
                        this.H = undefined;
                    }
                })();
            }
            return this.H;
        }
        async J(extensions, type, scanOptions, pickLatest) {
            if (!scanOptions.includeAllVersions) {
                extensions = this.L(type === 0 /* ExtensionType.System */ ? extensions : undefined, type === 1 /* ExtensionType.User */ ? extensions : undefined, type === 'development' ? extensions : undefined, await this.getTargetPlatform(), pickLatest);
            }
            if (!scanOptions.includeInvalid) {
                extensions = extensions.filter(extension => extension.isValid);
            }
            return extensions.sort((a, b) => {
                const aLastSegment = path.$ae(a.location.fsPath);
                const bLastSegment = path.$ae(b.location.fsPath);
                if (aLastSegment < bLastSegment) {
                    return -1;
                }
                if (aLastSegment > bLastSegment) {
                    return 1;
                }
                return 0;
            });
        }
        L(system, user, development, targetPlatform, pickLatest) {
            const pick = (existing, extension, isDevelopment) => {
                if (existing.isValid && !extension.isValid) {
                    return false;
                }
                if (existing.isValid === extension.isValid) {
                    if (pickLatest && semver.gt(existing.manifest.version, extension.manifest.version)) {
                        this.y.debug(`Skipping extension ${extension.location.path} with lower version ${extension.manifest.version} in favour of ${existing.location.path} with version ${existing.manifest.version}`);
                        return false;
                    }
                    if (semver.eq(existing.manifest.version, extension.manifest.version)) {
                        if (existing.type === 0 /* ExtensionType.System */) {
                            this.y.debug(`Skipping extension ${extension.location.path} in favour of system extension ${existing.location.path} with same version`);
                            return false;
                        }
                        if (existing.targetPlatform === targetPlatform) {
                            this.y.debug(`Skipping extension ${extension.location.path} from different target platform ${extension.targetPlatform}`);
                            return false;
                        }
                    }
                }
                if (isDevelopment) {
                    this.y.warn(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
                }
                else {
                    this.y.debug(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
                }
                return true;
            };
            const result = new extensions_1.$Xl();
            system?.forEach((extension) => {
                const existing = result.get(extension.identifier.id);
                if (!existing || pick(existing, extension, false)) {
                    result.set(extension.identifier.id, extension);
                }
            });
            user?.forEach((extension) => {
                const existing = result.get(extension.identifier.id);
                if (!existing && system && extension.type === 0 /* ExtensionType.System */) {
                    this.y.debug(`Skipping obsolete system extension ${extension.location.path}.`);
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
        async M(useCache, language) {
            this.y.trace('Started scanning system extensions');
            const extensionsScannerInput = await this.P(this.systemExtensionsLocation, false, 0 /* ExtensionType.System */, true, language, true, undefined);
            const extensionsScanner = useCache && !extensionsScannerInput.devMode ? this.j : this.n;
            const result = await extensionsScanner.scanExtensions(extensionsScannerInput);
            this.y.trace('Scanned system extensions:', result.length);
            return result;
        }
        async N(language, checkControlFile) {
            const devSystemExtensionsList = this.z.isBuilt ? [] : this.C.builtInExtensions;
            if (!devSystemExtensionsList?.length) {
                return [];
            }
            this.y.trace('Started scanning dev system extensions');
            const builtinExtensionControl = checkControlFile ? await this.O() : {};
            const devSystemExtensionsLocations = [];
            const devSystemExtensionsLocation = uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('').fsPath, '..', '.build', 'builtInExtensions')));
            for (const extension of devSystemExtensionsList) {
                const controlState = builtinExtensionControl[extension.name] || 'marketplace';
                switch (controlState) {
                    case 'disabled':
                        break;
                    case 'marketplace':
                        devSystemExtensionsLocations.push((0, resources_1.$ig)(devSystemExtensionsLocation, extension.name));
                        break;
                    default:
                        devSystemExtensionsLocations.push(uri_1.URI.file(controlState));
                        break;
                }
            }
            const result = await Promise.all(devSystemExtensionsLocations.map(async (location) => this.n.scanExtension((await this.P(location, false, 0 /* ExtensionType.System */, true, language, true, undefined)))));
            this.y.trace('Scanned dev system extensions:', result.length);
            return (0, arrays_1.$Fb)(result);
        }
        async O() {
            try {
                const content = await this.w.readFile(this.r);
                return JSON.parse(content.value.toString());
            }
            catch (error) {
                return {};
            }
        }
        async P(location, profile, type, excludeObsolete, language, validate, profileScanOptions) {
            const translations = await this.f(language ?? platform.$v);
            const mtime = await this.Q(location);
            const applicationExtensionsLocation = profile && !this.D.extUri.isEqual(location, this.t.defaultProfile.extensionsResource) ? this.t.defaultProfile.extensionsResource : undefined;
            const applicationExtensionsLocationMtime = applicationExtensionsLocation ? await this.Q(applicationExtensionsLocation) : undefined;
            return new $qp(location, mtime, applicationExtensionsLocation, applicationExtensionsLocationMtime, profile, profileScanOptions, type, excludeObsolete, validate, this.C.version, this.C.date, this.C.commit, !this.z.isBuilt, language, translations);
        }
        async Q(location) {
            try {
                const stat = await this.w.stat(location);
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
    exports.$pp = $pp;
    exports.$pp = $pp = __decorate([
        __param(4, userDataProfile_1.$Ek),
        __param(5, extensionsProfileScannerService_1.$kp),
        __param(6, files_1.$6j),
        __param(7, log_1.$5i),
        __param(8, environment_1.$Ih),
        __param(9, productService_1.$kj),
        __param(10, uriIdentity_1.$Ck),
        __param(11, instantiation_1.$Ah)
    ], $pp);
    class $qp {
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
            return ((0, resources_1.$bg)(a.location, b.location)
                && a.mtime === b.mtime
                && (0, resources_1.$bg)(a.applicationExtensionslocation, b.applicationExtensionslocation)
                && a.applicationExtensionslocationMtime === b.applicationExtensionslocationMtime
                && a.profile === b.profile
                && objects.$Zm(a.profileScanOptions, b.profileScanOptions)
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
    exports.$qp = $qp;
    let ExtensionsScanner = class ExtensionsScanner extends lifecycle_1.$kc {
        constructor(f, g, h, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
        }
        async scanExtensions(input) {
            const extensions = input.profile ? await this.r(input) : await this.n(input);
            let obsolete = {};
            if (input.excludeObsolete && input.type === 1 /* ExtensionType.User */) {
                try {
                    const raw = (await this.j.readFile(this.f)).value.toString();
                    obsolete = JSON.parse(raw);
                }
                catch (error) { /* ignore */ }
            }
            return (0, types_1.$wf)(obsolete) ? extensions : extensions.filter(e => !obsolete[extensionManagementUtil_1.$qo.create(e).toString()]);
        }
        async n(input) {
            const stat = await this.j.resolve(input.location);
            if (!stat.children?.length) {
                return [];
            }
            const extensions = await Promise.all(stat.children.map(async (c) => {
                if (!c.isDirectory) {
                    return null;
                }
                // Do not consider user extension folder starting with `.`
                if (input.type === 1 /* ExtensionType.User */ && (0, resources_1.$fg)(c.resource).indexOf('.') === 0) {
                    return null;
                }
                const extensionScannerInput = new $qp(c.resource, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.profileScanOptions, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                return this.scanExtension(extensionScannerInput);
            }));
            return (0, arrays_1.$Fb)(extensions)
                // Sort: Make sure extensions are in the same order always. Helps cache invalidation even if the order changes.
                .sort((a, b) => a.location.path < b.location.path ? -1 : 1);
        }
        async r(input) {
            let profileExtensions = await this.s(input.location, () => true, input);
            if (input.applicationExtensionslocation && !this.h.extUri.isEqual(input.location, input.applicationExtensionslocation)) {
                profileExtensions = profileExtensions.filter(e => !e.metadata?.isApplicationScoped);
                const applicationExtensions = await this.s(input.applicationExtensionslocation, (e) => !!e.metadata?.isBuiltin || !!e.metadata?.isApplicationScoped, input);
                profileExtensions.push(...applicationExtensions);
            }
            return profileExtensions;
        }
        async s(profileResource, filter, input) {
            const scannedProfileExtensions = await this.g.scanProfileExtensions(profileResource, input.profileScanOptions);
            if (!scannedProfileExtensions.length) {
                return [];
            }
            const extensions = await Promise.all(scannedProfileExtensions.map(async (extensionInfo) => {
                if (filter(extensionInfo)) {
                    const extensionScannerInput = new $qp(extensionInfo.location, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.profileScanOptions, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                    return this.scanExtension(extensionScannerInput, extensionInfo.metadata);
                }
                return null;
            }));
            return (0, arrays_1.$Fb)(extensions);
        }
        async scanOneOrMultipleExtensions(input) {
            try {
                if (await this.j.exists((0, resources_1.$ig)(input.location, 'package.json'))) {
                    const extension = await this.scanExtension(input);
                    return extension ? [extension] : [];
                }
                else {
                    return await this.scanExtensions(input);
                }
            }
            catch (error) {
                this.m.error(`Error scanning extensions at ${input.location.path}:`, (0, errors_1.$8)(error));
                return [];
            }
        }
        async scanExtension(input, metadata) {
            try {
                let manifest = await this.scanExtensionManifest(input.location);
                if (manifest) {
                    // allow publisher to be undefined to make the initial extension authoring experience smoother
                    if (!manifest.publisher) {
                        manifest.publisher = extensions_1.$Rl;
                    }
                    metadata = metadata ?? manifest.__metadata;
                    delete manifest.__metadata;
                    const id = (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name);
                    const identifier = metadata?.id ? { id, uuid: metadata.id } : { id };
                    const type = metadata?.isSystem ? 0 /* ExtensionType.System */ : input.type;
                    const isBuiltin = type === 0 /* ExtensionType.System */ || !!metadata?.isBuiltin;
                    manifest = await this.t(input.location, manifest, $qp.createNlsConfiguration(input));
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
                    this.m.error(e);
                }
            }
            return null;
        }
        validate(extension, input) {
            let isValid = true;
            const validations = (0, extensionValidator_1.$Fo)(input.productVersion, input.productDate, input.location, extension.manifest, extension.isBuiltin);
            for (const [severity, message] of validations) {
                if (severity === severity_1.default.Error) {
                    isValid = false;
                    this.m.error(this.z(input.location, message));
                }
            }
            extension.isValid = isValid;
            extension.validations = validations;
            return extension;
        }
        async scanExtensionManifest(extensionLocation) {
            const manifestLocation = (0, resources_1.$ig)(extensionLocation, 'package.json');
            let content;
            try {
                content = (await this.j.readFile(manifestLocation)).value.toString();
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.m.error(this.z(extensionLocation, (0, nls_1.localize)(0, null, manifestLocation.path, error.message)));
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
                (0, json_1.$Lm)(content, errors);
                for (const e of errors) {
                    this.m.error(this.z(extensionLocation, (0, nls_1.localize)(1, null, manifestLocation.path, e.offset, e.length, (0, jsonErrorMessages_1.$mp)(e.error))));
                }
                return null;
            }
            if ((0, json_1.$Um)(manifest) !== 'object') {
                this.m.error(this.z(extensionLocation, (0, nls_1.localize)(2, null, manifestLocation.path)));
                return null;
            }
            return manifest;
        }
        async t(extensionLocation, extensionManifest, nlsConfiguration) {
            const localizedMessages = await this.u(extensionLocation, extensionManifest, nlsConfiguration);
            if (localizedMessages) {
                try {
                    const errors = [];
                    // resolveOriginalMessageBundle returns null if localizedMessages.default === undefined;
                    const defaults = await this.w(localizedMessages.default, errors);
                    if (errors.length > 0) {
                        errors.forEach((error) => {
                            this.m.error(this.z(extensionLocation, (0, nls_1.localize)(3, null, localizedMessages.default?.path, (0, jsonErrorMessages_1.$mp)(error.error))));
                        });
                        return extensionManifest;
                    }
                    else if ((0, json_1.$Um)(localizedMessages) !== 'object') {
                        this.m.error(this.z(extensionLocation, (0, nls_1.localize)(4, null, localizedMessages.default?.path)));
                        return extensionManifest;
                    }
                    const localized = localizedMessages.values || Object.create(null);
                    return (0, extensionNls_1.$np)(this.m, extensionManifest, localized, defaults);
                }
                catch (error) {
                    /*Ignore Error*/
                }
            }
            return extensionManifest;
        }
        async u(extensionLocation, extensionManifest, nlsConfiguration) {
            const defaultPackageNLS = (0, resources_1.$ig)(extensionLocation, 'package.nls.json');
            const reportErrors = (localized, errors) => {
                errors.forEach((error) => {
                    this.m.error(this.z(extensionLocation, (0, nls_1.localize)(5, null, localized?.path, (0, jsonErrorMessages_1.$mp)(error.error))));
                });
            };
            const reportInvalidFormat = (localized) => {
                this.m.error(this.z(extensionLocation, (0, nls_1.localize)(6, null, localized?.path)));
            };
            const translationId = `${extensionManifest.publisher}.${extensionManifest.name}`;
            const translationPath = nlsConfiguration.translations[translationId];
            if (translationPath) {
                try {
                    const translationResource = uri_1.URI.file(translationPath);
                    const content = (await this.j.readFile(translationResource)).value.toString();
                    const errors = [];
                    const translationBundle = (0, json_1.$Lm)(content, errors);
                    if (errors.length > 0) {
                        reportErrors(translationResource, errors);
                        return { values: undefined, default: defaultPackageNLS };
                    }
                    else if ((0, json_1.$Um)(translationBundle) !== 'object') {
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
                const exists = await this.j.exists(defaultPackageNLS);
                if (!exists) {
                    return undefined;
                }
                let messageBundle;
                try {
                    messageBundle = await this.y(extensionLocation, nlsConfiguration);
                }
                catch (error) {
                    return undefined;
                }
                if (!messageBundle.localized) {
                    return { values: undefined, default: messageBundle.original };
                }
                try {
                    const messageBundleContent = (await this.j.readFile(messageBundle.localized)).value.toString();
                    const errors = [];
                    const messages = (0, json_1.$Lm)(messageBundleContent, errors);
                    if (errors.length > 0) {
                        reportErrors(messageBundle.localized, errors);
                        return { values: undefined, default: messageBundle.original };
                    }
                    else if ((0, json_1.$Um)(messages) !== 'object') {
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
        async w(originalMessageBundle, errors) {
            if (originalMessageBundle) {
                try {
                    const originalBundleContent = (await this.j.readFile(originalMessageBundle)).value.toString();
                    return (0, json_1.$Lm)(originalBundleContent, errors);
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
        y(extensionLocation, nlsConfiguration) {
            return new Promise((c, e) => {
                const loop = (locale) => {
                    const toCheck = (0, resources_1.$ig)(extensionLocation, `package.nls.${locale}.json`);
                    this.j.exists(toCheck).then(exists => {
                        if (exists) {
                            c({ localized: toCheck, original: (0, resources_1.$ig)(extensionLocation, 'package.nls.json') });
                        }
                        const index = locale.lastIndexOf('-');
                        if (index === -1) {
                            c({ localized: (0, resources_1.$ig)(extensionLocation, 'package.nls.json'), original: null });
                        }
                        else {
                            locale = locale.substring(0, index);
                            loop(locale);
                        }
                    });
                };
                if (nlsConfiguration.devMode || nlsConfiguration.pseudo || !nlsConfiguration.language) {
                    return c({ localized: (0, resources_1.$ig)(extensionLocation, 'package.nls.json'), original: null });
                }
                loop(nlsConfiguration.language);
            });
        }
        z(extensionLocation, message) {
            return `[${extensionLocation.path}]: ${message}`;
        }
    };
    ExtensionsScanner = __decorate([
        __param(1, extensionsProfileScannerService_1.$kp),
        __param(2, uriIdentity_1.$Ck),
        __param(3, files_1.$6j),
        __param(4, log_1.$5i)
    ], ExtensionsScanner);
    let CachedExtensionsScanner = class CachedExtensionsScanner extends ExtensionsScanner {
        constructor(G, obsoleteFile, H, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
            super(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService);
            this.G = G;
            this.H = H;
            this.D = this.B(new async_1.$Eg(3000));
            this.F = this.B(new event_1.$fd());
            this.onDidChangeCache = this.F.event;
        }
        async scanExtensions(input) {
            const cacheFile = this.M(input);
            const cacheContents = await this.I(cacheFile);
            this.C = input;
            if (cacheContents && cacheContents.input && $qp.equals(cacheContents.input, this.C)) {
                this.m.debug('Using cached extensions scan result', input.location.toString());
                this.D.trigger(() => this.L());
                return cacheContents.result.map((extension) => {
                    // revive URI object
                    extension.location = uri_1.URI.revive(extension.location);
                    return extension;
                });
            }
            const result = await super.scanExtensions(input);
            await this.J(cacheFile, { input, result });
            return result;
        }
        async I(cacheFile) {
            try {
                const cacheRawContents = await this.j.readFile(cacheFile);
                const extensionCacheData = JSON.parse(cacheRawContents.value.toString());
                return { result: extensionCacheData.result, input: (0, marshalling_1.$$g)(extensionCacheData.input) };
            }
            catch (error) {
                this.m.debug('Error while reading the extension cache file:', cacheFile.path, (0, errors_1.$8)(error));
            }
            return null;
        }
        async J(cacheFile, cacheContents) {
            try {
                await this.j.writeFile(cacheFile, buffer_1.$Fd.fromString(JSON.stringify(cacheContents)));
            }
            catch (error) {
                this.m.debug('Error while writing the extension cache file:', cacheFile.path, (0, errors_1.$8)(error));
            }
        }
        async L() {
            if (!this.C) {
                // Input has been unset by the time we get here, so skip validation
                return;
            }
            const cacheFile = this.M(this.C);
            const cacheContents = await this.I(cacheFile);
            if (!cacheContents) {
                // Cache has been deleted by someone else, which is perfectly fine...
                return;
            }
            const actual = cacheContents.result;
            const expected = JSON.parse(JSON.stringify(await super.scanExtensions(this.C)));
            if (objects.$Zm(expected, actual)) {
                // Cache is valid and running with it is perfectly fine...
                return;
            }
            try {
                this.m.info('Invalidating Cache', actual, expected);
                // Cache is invalid, delete it
                await this.j.del(cacheFile);
                this.F.fire();
            }
            catch (error) {
                this.m.error(error);
            }
        }
        M(input) {
            const profile = this.N(input);
            return this.h.extUri.joinPath(profile.cacheHome, input.type === 0 /* ExtensionType.System */ ? extensions_1.$Ql : extensions_1.$Pl);
        }
        N(input) {
            if (input.type === 0 /* ExtensionType.System */) {
                return this.H.defaultProfile;
            }
            if (!input.profile) {
                return this.H.defaultProfile;
            }
            if (this.h.extUri.isEqual(input.location, this.G.extensionsResource)) {
                return this.G;
            }
            return this.H.profiles.find(p => this.h.extUri.isEqual(input.location, p.extensionsResource)) ?? this.G;
        }
    };
    CachedExtensionsScanner = __decorate([
        __param(2, userDataProfile_1.$Ek),
        __param(3, extensionsProfileScannerService_1.$kp),
        __param(4, uriIdentity_1.$Ck),
        __param(5, files_1.$6j),
        __param(6, log_1.$5i)
    ], CachedExtensionsScanner);
    function $rp(extension, isUnderDevelopment) {
        const id = (0, extensionManagementUtil_1.$so)(extension.manifest.publisher, extension.manifest.name);
        return {
            id,
            identifier: new extensions_1.$Vl(id),
            isBuiltin: extension.type === 0 /* ExtensionType.System */,
            isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
            isUnderDevelopment,
            extensionLocation: extension.location,
            uuid: extension.identifier.uuid,
            targetPlatform: extension.targetPlatform,
            ...extension.manifest,
        };
    }
    exports.$rp = $rp;
    class $sp extends $pp {
        constructor(systemExtensionsLocation, userExtensionsLocation, userHome, currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super(systemExtensionsLocation, userExtensionsLocation, (0, resources_1.$ig)(userHome, '.vscode-oss-dev', 'extensions', 'control.json'), currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
            this.R = (async () => {
                if (platform.$y) {
                    try {
                        const content = await this.w.readFile(uri_1.URI.file(platform.$y));
                        return JSON.parse(content.value.toString());
                    }
                    catch (err) { /* Ignore Error */ }
                }
                return Object.create(null);
            })();
        }
        f(language) {
            return this.R;
        }
    }
    exports.$sp = $sp;
});
//# sourceMappingURL=extensionsScannerService.js.map