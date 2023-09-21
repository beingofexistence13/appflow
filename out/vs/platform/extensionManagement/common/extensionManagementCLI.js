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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/uri", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions"], function (require, exports, cancellation_1, errors_1, network_1, resources_1, semver_1, uri_1, nls_1, extensionManagement_1, extensionManagementUtil_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementCLI = void 0;
    const notFound = (id) => (0, nls_1.localize)('notFound', "Extension '{0}' not found.", id);
    const useId = (0, nls_1.localize)('useId', "Make sure you use the full extension ID, including the publisher, e.g.: {0}", 'ms-dotnettools.csharp');
    function getId(manifest, withVersion) {
        if (withVersion) {
            return `${manifest.publisher}.${manifest.name}@${manifest.version}`;
        }
        else {
            return `${manifest.publisher}.${manifest.name}`;
        }
    }
    let ExtensionManagementCLI = class ExtensionManagementCLI {
        constructor(logger, extensionManagementService, extensionGalleryService) {
            this.logger = logger;
            this.extensionManagementService = extensionManagementService;
            this.extensionGalleryService = extensionGalleryService;
        }
        get location() {
            return undefined;
        }
        async listExtensions(showVersions, category, profileLocation) {
            let extensions = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, profileLocation);
            const categories = extensions_1.EXTENSION_CATEGORIES.map(c => c.toLowerCase());
            if (category && category !== '') {
                if (categories.indexOf(category.toLowerCase()) < 0) {
                    this.logger.info('Invalid category please enter a valid category. To list valid categories run --category without a category specified');
                    return;
                }
                extensions = extensions.filter(e => {
                    if (e.manifest.categories) {
                        const lowerCaseCategories = e.manifest.categories.map(c => c.toLowerCase());
                        return lowerCaseCategories.indexOf(category.toLowerCase()) > -1;
                    }
                    return false;
                });
            }
            else if (category === '') {
                this.logger.info('Possible Categories: ');
                categories.forEach(category => {
                    this.logger.info(category);
                });
                return;
            }
            if (this.location) {
                this.logger.info((0, nls_1.localize)('listFromLocation', "Extensions installed on {0}:", this.location));
            }
            extensions = extensions.sort((e1, e2) => e1.identifier.id.localeCompare(e2.identifier.id));
            let lastId = undefined;
            for (const extension of extensions) {
                if (lastId !== extension.identifier.id) {
                    lastId = extension.identifier.id;
                    this.logger.info(getId(extension.manifest, showVersions));
                }
            }
        }
        async installExtensions(extensions, builtinExtensions, installOptions, force) {
            const failed = [];
            try {
                const installedExtensionsManifests = [];
                if (extensions.length) {
                    this.logger.info(this.location ? (0, nls_1.localize)('installingExtensionsOnLocation', "Installing extensions on {0}...", this.location) : (0, nls_1.localize)('installingExtensions', "Installing extensions..."));
                }
                const installVSIXInfos = [];
                let installExtensionInfos = [];
                const addInstallExtensionInfo = (id, version, isBuiltin) => {
                    installExtensionInfos.push({ id, version: version !== 'prerelease' ? version : undefined, installOptions: { ...installOptions, isBuiltin, installPreReleaseVersion: version === 'prerelease' || installOptions.installPreReleaseVersion } });
                };
                for (const extension of extensions) {
                    if (extension instanceof uri_1.URI) {
                        installVSIXInfos.push({ vsix: extension, installOptions });
                    }
                    else {
                        const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(extension);
                        addInstallExtensionInfo(id, version, false);
                    }
                }
                for (const extension of builtinExtensions) {
                    if (extension instanceof uri_1.URI) {
                        installVSIXInfos.push({ vsix: extension, installOptions: { ...installOptions, isBuiltin: true, donotIncludePackAndDependencies: true } });
                    }
                    else {
                        const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(extension);
                        addInstallExtensionInfo(id, version, true);
                    }
                }
                const installed = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, installOptions.profileLocation);
                if (installVSIXInfos.length) {
                    await Promise.all(installVSIXInfos.map(async ({ vsix, installOptions }) => {
                        try {
                            const manifest = await this.installVSIX(vsix, installOptions, force, installed);
                            if (manifest) {
                                installedExtensionsManifests.push(manifest);
                            }
                        }
                        catch (err) {
                            this.logger.error(err);
                            failed.push(vsix.toString());
                        }
                    }));
                }
                if (installExtensionInfos.length) {
                    installExtensionInfos = installExtensionInfos.filter(({ id, version }) => {
                        const installedExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }));
                        if (installedExtension) {
                            if (!force && (!version || (version === 'prerelease' && installedExtension.preRelease))) {
                                this.logger.info((0, nls_1.localize)('alreadyInstalled-checkAndUpdate', "Extension '{0}' v{1} is already installed. Use '--force' option to update to latest version or provide '@<version>' to install a specific version, for example: '{2}@1.2.3'.", id, installedExtension.manifest.version, id));
                                return false;
                            }
                            if (version && installedExtension.manifest.version === version) {
                                this.logger.info((0, nls_1.localize)('alreadyInstalled', "Extension '{0}' is already installed.", `${id}@${version}`));
                                return false;
                            }
                        }
                        return true;
                    });
                    if (installExtensionInfos.length) {
                        const galleryExtensions = await this.getGalleryExtensions(installExtensionInfos);
                        await Promise.all(installExtensionInfos.map(async (extensionInfo) => {
                            const gallery = galleryExtensions.get(extensionInfo.id.toLowerCase());
                            if (gallery) {
                                try {
                                    const manifest = await this.installFromGallery(extensionInfo, gallery, installed);
                                    if (manifest) {
                                        installedExtensionsManifests.push(manifest);
                                    }
                                }
                                catch (err) {
                                    this.logger.error(err.message || err.stack || err);
                                    failed.push(extensionInfo.id);
                                }
                            }
                            else {
                                this.logger.error(`${notFound(extensionInfo.version ? `${extensionInfo.id}@${extensionInfo.version}` : extensionInfo.id)}\n${useId}`);
                                failed.push(extensionInfo.id);
                            }
                        }));
                    }
                }
            }
            catch (error) {
                this.logger.error((0, nls_1.localize)('error while installing extensions', "Error while installing extensions: {0}", (0, errors_1.getErrorMessage)(error)));
                throw error;
            }
            if (failed.length) {
                throw new Error((0, nls_1.localize)('installation failed', "Failed Installing Extensions: {0}", failed.join(', ')));
            }
        }
        async installVSIX(vsix, installOptions, force, installedExtensions) {
            const manifest = await this.extensionManagementService.getManifest(vsix);
            if (!manifest) {
                throw new Error('Invalid vsix');
            }
            const valid = await this.validateVSIX(manifest, force, installOptions.profileLocation, installedExtensions);
            if (valid) {
                try {
                    await this.extensionManagementService.install(vsix, installOptions);
                    this.logger.info((0, nls_1.localize)('successVsixInstall', "Extension '{0}' was successfully installed.", (0, resources_1.basename)(vsix)));
                    return manifest;
                }
                catch (error) {
                    if ((0, errors_1.isCancellationError)(error)) {
                        this.logger.info((0, nls_1.localize)('cancelVsixInstall', "Cancelled installing extension '{0}'.", (0, resources_1.basename)(vsix)));
                        return null;
                    }
                    else {
                        throw error;
                    }
                }
            }
            return null;
        }
        async getGalleryExtensions(extensions) {
            const galleryExtensions = new Map();
            const preRelease = extensions.some(e => e.installOptions.installPreReleaseVersion);
            const targetPlatform = await this.extensionManagementService.getTargetPlatform();
            const extensionInfos = [];
            for (const extension of extensions) {
                if (extensionManagement_1.EXTENSION_IDENTIFIER_REGEX.test(extension.id)) {
                    extensionInfos.push({ ...extension, preRelease });
                }
            }
            if (extensionInfos.length) {
                const result = await this.extensionGalleryService.getExtensions(extensionInfos, { targetPlatform }, cancellation_1.CancellationToken.None);
                for (const extension of result) {
                    galleryExtensions.set(extension.identifier.id.toLowerCase(), extension);
                }
            }
            return galleryExtensions;
        }
        async installFromGallery({ id, version, installOptions }, galleryExtension, installed) {
            const manifest = await this.extensionGalleryService.getManifest(galleryExtension, cancellation_1.CancellationToken.None);
            if (manifest && !this.validateExtensionKind(manifest)) {
                return null;
            }
            const installedExtension = installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, galleryExtension.identifier));
            if (installedExtension) {
                if (galleryExtension.version === installedExtension.manifest.version) {
                    this.logger.info((0, nls_1.localize)('alreadyInstalled', "Extension '{0}' is already installed.", version ? `${id}@${version}` : id));
                    return null;
                }
                this.logger.info((0, nls_1.localize)('updateMessage', "Updating the extension '{0}' to the version {1}", id, galleryExtension.version));
            }
            try {
                if (installOptions.isBuiltin) {
                    this.logger.info(version ? (0, nls_1.localize)('installing builtin with version', "Installing builtin extension '{0}' v{1}...", id, version) : (0, nls_1.localize)('installing builtin ', "Installing builtin extension '{0}'...", id));
                }
                else {
                    this.logger.info(version ? (0, nls_1.localize)('installing with version', "Installing extension '{0}' v{1}...", id, version) : (0, nls_1.localize)('installing', "Installing extension '{0}'...", id));
                }
                const local = await this.extensionManagementService.installFromGallery(galleryExtension, { ...installOptions, installGivenVersion: !!version });
                this.logger.info((0, nls_1.localize)('successInstall', "Extension '{0}' v{1} was successfully installed.", id, local.manifest.version));
                return manifest;
            }
            catch (error) {
                if ((0, errors_1.isCancellationError)(error)) {
                    this.logger.info((0, nls_1.localize)('cancelInstall', "Cancelled installing extension '{0}'.", id));
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
        validateExtensionKind(_manifest) {
            return true;
        }
        async validateVSIX(manifest, force, profileLocation, installedExtensions) {
            if (!force) {
                const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) };
                const newer = installedExtensions.find(local => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifier, local.identifier) && (0, semver_1.gt)(local.manifest.version, manifest.version));
                if (newer) {
                    this.logger.info((0, nls_1.localize)('forceDowngrade', "A newer version of extension '{0}' v{1} is already installed. Use '--force' option to downgrade to older version.", newer.identifier.id, newer.manifest.version, manifest.version));
                    return false;
                }
            }
            return this.validateExtensionKind(manifest);
        }
        async uninstallExtensions(extensions, force, profileLocation) {
            const getExtensionId = async (extensionDescription) => {
                if (extensionDescription instanceof uri_1.URI) {
                    const manifest = await this.extensionManagementService.getManifest(extensionDescription);
                    return getId(manifest);
                }
                return extensionDescription;
            };
            const uninstalledExtensions = [];
            for (const extension of extensions) {
                const id = await getExtensionId(extension);
                const installed = await this.extensionManagementService.getInstalled(undefined, profileLocation);
                const extensionsToUninstall = installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                if (!extensionsToUninstall.length) {
                    throw new Error(`${this.notInstalled(id)}\n${useId}`);
                }
                if (extensionsToUninstall.some(e => e.type === 0 /* ExtensionType.System */)) {
                    this.logger.info((0, nls_1.localize)('builtin', "Extension '{0}' is a Built-in extension and cannot be uninstalled", id));
                    return;
                }
                if (!force && extensionsToUninstall.some(e => e.isBuiltin)) {
                    this.logger.info((0, nls_1.localize)('forceUninstall', "Extension '{0}' is marked as a Built-in extension by user. Please use '--force' option to uninstall it.", id));
                    return;
                }
                this.logger.info((0, nls_1.localize)('uninstalling', "Uninstalling {0}...", id));
                for (const extensionToUninstall of extensionsToUninstall) {
                    await this.extensionManagementService.uninstall(extensionToUninstall, { profileLocation });
                    uninstalledExtensions.push(extensionToUninstall);
                }
                if (this.location) {
                    this.logger.info((0, nls_1.localize)('successUninstallFromLocation', "Extension '{0}' was successfully uninstalled from {1}!", id, this.location));
                }
                else {
                    this.logger.info((0, nls_1.localize)('successUninstall', "Extension '{0}' was successfully uninstalled!", id));
                }
            }
        }
        async locateExtension(extensions) {
            const installed = await this.extensionManagementService.getInstalled();
            extensions.forEach(e => {
                installed.forEach(i => {
                    if (i.identifier.id === e) {
                        if (i.location.scheme === network_1.Schemas.file) {
                            this.logger.info(i.location.fsPath);
                            return;
                        }
                    }
                });
            });
        }
        notInstalled(id) {
            return this.location ? (0, nls_1.localize)('notInstalleddOnLocation', "Extension '{0}' is not installed on {1}.", id, this.location) : (0, nls_1.localize)('notInstalled', "Extension '{0}' is not installed.", id);
        }
    };
    exports.ExtensionManagementCLI = ExtensionManagementCLI;
    exports.ExtensionManagementCLI = ExtensionManagementCLI = __decorate([
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, extensionManagement_1.IExtensionGalleryService)
    ], ExtensionManagementCLI);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudENMSS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbk1hbmFnZW1lbnRDTEkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZWhHLE1BQU0sUUFBUSxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEYsTUFBTSxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLDZFQUE2RSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFHeEksU0FBUyxLQUFLLENBQUMsUUFBNEIsRUFBRSxXQUFxQjtRQUNqRSxJQUFJLFdBQVcsRUFBRTtZQUNoQixPQUFPLEdBQUcsUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNwRTthQUFNO1lBQ04sT0FBTyxHQUFHLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2hEO0lBQ0YsQ0FBQztJQUtNLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO1FBRWxDLFlBQ29CLE1BQWUsRUFDWSwwQkFBdUQsRUFDMUQsdUJBQWlEO1lBRnpFLFdBQU0sR0FBTixNQUFNLENBQVM7WUFDWSwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQzFELDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7UUFDekYsQ0FBQztRQUVMLElBQWMsUUFBUTtZQUNyQixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFxQixFQUFFLFFBQWlCLEVBQUUsZUFBcUI7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