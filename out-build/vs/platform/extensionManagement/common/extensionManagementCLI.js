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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/uri", "vs/nls!vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions"], function (require, exports, cancellation_1, errors_1, network_1, resources_1, semver_1, uri_1, nls_1, extensionManagement_1, extensionManagementUtil_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9o = void 0;
    const notFound = (id) => (0, nls_1.localize)(0, null, id);
    const useId = (0, nls_1.localize)(1, null, 'ms-dotnettools.csharp');
    function getId(manifest, withVersion) {
        if (withVersion) {
            return `${manifest.publisher}.${manifest.name}@${manifest.version}`;
        }
        else {
            return `${manifest.publisher}.${manifest.name}`;
        }
    }
    let $9o = class $9o {
        constructor(a, b, d) {
            this.a = a;
            this.b = b;
            this.d = d;
        }
        get f() {
            return undefined;
        }
        async listExtensions(showVersions, category, profileLocation) {
            let extensions = await this.b.getInstalled(1 /* ExtensionType.User */, profileLocation);
            const categories = extensions_1.$Ul.map(c => c.toLowerCase());
            if (category && category !== '') {
                if (categories.indexOf(category.toLowerCase()) < 0) {
                    this.a.info('Invalid category please enter a valid category. To list valid categories run --category without a category specified');
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
                this.a.info('Possible Categories: ');
                categories.forEach(category => {
                    this.a.info(category);
                });
                return;
            }
            if (this.f) {
                this.a.info((0, nls_1.localize)(2, null, this.f));
            }
            extensions = extensions.sort((e1, e2) => e1.identifier.id.localeCompare(e2.identifier.id));
            let lastId = undefined;
            for (const extension of extensions) {
                if (lastId !== extension.identifier.id) {
                    lastId = extension.identifier.id;
                    this.a.info(getId(extension.manifest, showVersions));
                }
            }
        }
        async installExtensions(extensions, builtinExtensions, installOptions, force) {
            const failed = [];
            try {
                const installedExtensionsManifests = [];
                if (extensions.length) {
                    this.a.info(this.f ? (0, nls_1.localize)(3, null, this.f) : (0, nls_1.localize)(4, null));
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
                        const [id, version] = (0, extensionManagementUtil_1.$ro)(extension);
                        addInstallExtensionInfo(id, version, false);
                    }
                }
                for (const extension of builtinExtensions) {
                    if (extension instanceof uri_1.URI) {
                        installVSIXInfos.push({ vsix: extension, installOptions: { ...installOptions, isBuiltin: true, donotIncludePackAndDependencies: true } });
                    }
                    else {
                        const [id, version] = (0, extensionManagementUtil_1.$ro)(extension);
                        addInstallExtensionInfo(id, version, true);
                    }
                }
                const installed = await this.b.getInstalled(1 /* ExtensionType.User */, installOptions.profileLocation);
                if (installVSIXInfos.length) {
                    await Promise.all(installVSIXInfos.map(async ({ vsix, installOptions }) => {
                        try {
                            const manifest = await this.g(vsix, installOptions, force, installed);
                            if (manifest) {
                                installedExtensionsManifests.push(manifest);
                            }
                        }
                        catch (err) {
                            this.a.error(err);
                            failed.push(vsix.toString());
                        }
                    }));
                }
                if (installExtensionInfos.length) {
                    installExtensionInfos = installExtensionInfos.filter(({ id, version }) => {
                        const installedExtension = installed.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id }));
                        if (installedExtension) {
                            if (!force && (!version || (version === 'prerelease' && installedExtension.preRelease))) {
                                this.a.info((0, nls_1.localize)(5, null, id, installedExtension.manifest.version, id));
                                return false;
                            }
                            if (version && installedExtension.manifest.version === version) {
                                this.a.info((0, nls_1.localize)(6, null, `${id}@${version}`));
                                return false;
                            }
                        }
                        return true;
                    });
                    if (installExtensionInfos.length) {
                        const galleryExtensions = await this.h(installExtensionInfos);
                        await Promise.all(installExtensionInfos.map(async (extensionInfo) => {
                            const gallery = galleryExtensions.get(extensionInfo.id.toLowerCase());
                            if (gallery) {
                                try {
                                    const manifest = await this.j(extensionInfo, gallery, installed);
                                    if (manifest) {
                                        installedExtensionsManifests.push(manifest);
                                    }
                                }
                                catch (err) {
                                    this.a.error(err.message || err.stack || err);
                                    failed.push(extensionInfo.id);
                                }
                            }
                            else {
                                this.a.error(`${notFound(extensionInfo.version ? `${extensionInfo.id}@${extensionInfo.version}` : extensionInfo.id)}\n${useId}`);
                                failed.push(extensionInfo.id);
                            }
                        }));
                    }
                }
            }
            catch (error) {
                this.a.error((0, nls_1.localize)(7, null, (0, errors_1.$8)(error)));
                throw error;
            }
            if (failed.length) {
                throw new Error((0, nls_1.localize)(8, null, failed.join(', ')));
            }
        }
        async g(vsix, installOptions, force, installedExtensions) {
            const manifest = await this.b.getManifest(vsix);
            if (!manifest) {
                throw new Error('Invalid vsix');
            }
            const valid = await this.l(manifest, force, installOptions.profileLocation, installedExtensions);
            if (valid) {
                try {
                    await this.b.install(vsix, installOptions);
                    this.a.info((0, nls_1.localize)(9, null, (0, resources_1.$fg)(vsix)));
                    return manifest;
                }
                catch (error) {
                    if ((0, errors_1.$2)(error)) {
                        this.a.info((0, nls_1.localize)(10, null, (0, resources_1.$fg)(vsix)));
                        return null;
                    }
                    else {
                        throw error;
                    }
                }
            }
            return null;
        }
        async h(extensions) {
            const galleryExtensions = new Map();
            const preRelease = extensions.some(e => e.installOptions.installPreReleaseVersion);
            const targetPlatform = await this.b.getTargetPlatform();
            const extensionInfos = [];
            for (const extension of extensions) {
                if (extensionManagement_1.$Nn.test(extension.id)) {
                    extensionInfos.push({ ...extension, preRelease });
                }
            }
            if (extensionInfos.length) {
                const result = await this.d.getExtensions(extensionInfos, { targetPlatform }, cancellation_1.CancellationToken.None);
                for (const extension of result) {
                    galleryExtensions.set(extension.identifier.id.toLowerCase(), extension);
                }
            }
            return galleryExtensions;
        }
        async j({ id, version, installOptions }, galleryExtension, installed) {
            const manifest = await this.d.getManifest(galleryExtension, cancellation_1.CancellationToken.None);
            if (manifest && !this.k(manifest)) {
                return null;
            }
            const installedExtension = installed.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, galleryExtension.identifier));
            if (installedExtension) {
                if (galleryExtension.version === installedExtension.manifest.version) {
                    this.a.info((0, nls_1.localize)(11, null, version ? `${id}@${version}` : id));
                    return null;
                }
                this.a.info((0, nls_1.localize)(12, null, id, galleryExtension.version));
            }
            try {
                if (installOptions.isBuiltin) {
                    this.a.info(version ? (0, nls_1.localize)(13, null, id, version) : (0, nls_1.localize)(14, null, id));
                }
                else {
                    this.a.info(version ? (0, nls_1.localize)(15, null, id, version) : (0, nls_1.localize)(16, null, id));
                }
                const local = await this.b.installFromGallery(galleryExtension, { ...installOptions, installGivenVersion: !!version });
                this.a.info((0, nls_1.localize)(17, null, id, local.manifest.version));
                return manifest;
            }
            catch (error) {
                if ((0, errors_1.$2)(error)) {
                    this.a.info((0, nls_1.localize)(18, null, id));
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
        k(_manifest) {
            return true;
        }
        async l(manifest, force, profileLocation, installedExtensions) {
            if (!force) {
                const extensionIdentifier = { id: (0, extensionManagementUtil_1.$uo)(manifest.publisher, manifest.name) };
                const newer = installedExtensions.find(local => (0, extensionManagementUtil_1.$po)(extensionIdentifier, local.identifier) && (0, semver_1.gt)(local.manifest.version, manifest.version));
                if (newer) {
                    this.a.info((0, nls_1.localize)(19, null, newer.identifier.id, newer.manifest.version, manifest.version));
                    return false;
                }
            }
            return this.k(manifest);
        }
        async uninstallExtensions(extensions, force, profileLocation) {
            const getExtensionId = async (extensionDescription) => {
                if (extensionDescription instanceof uri_1.URI) {
                    const manifest = await this.b.getManifest(extensionDescription);
                    return getId(manifest);
                }
                return extensionDescription;
            };
            const uninstalledExtensions = [];
            for (const extension of extensions) {
                const id = await getExtensionId(extension);
                const installed = await this.b.getInstalled(undefined, profileLocation);
                const extensionsToUninstall = installed.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id }));
                if (!extensionsToUninstall.length) {
                    throw new Error(`${this.m(id)}\n${useId}`);
                }
                if (extensionsToUninstall.some(e => e.type === 0 /* ExtensionType.System */)) {
                    this.a.info((0, nls_1.localize)(20, null, id));
                    return;
                }
                if (!force && extensionsToUninstall.some(e => e.isBuiltin)) {
                    this.a.info((0, nls_1.localize)(21, null, id));
                    return;
                }
                this.a.info((0, nls_1.localize)(22, null, id));
                for (const extensionToUninstall of extensionsToUninstall) {
                    await this.b.uninstall(extensionToUninstall, { profileLocation });
                    uninstalledExtensions.push(extensionToUninstall);
                }
                if (this.f) {
                    this.a.info((0, nls_1.localize)(23, null, id, this.f));
                }
                else {
                    this.a.info((0, nls_1.localize)(24, null, id));
                }
            }
        }
        async locateExtension(extensions) {
            const installed = await this.b.getInstalled();
            extensions.forEach(e => {
                installed.forEach(i => {
                    if (i.identifier.id === e) {
                        if (i.location.scheme === network_1.Schemas.file) {
                            this.a.info(i.location.fsPath);
                            return;
                        }
                    }
                });
            });
        }
        m(id) {
            return this.f ? (0, nls_1.localize)(25, null, id, this.f) : (0, nls_1.localize)(26, null, id);
        }
    };
    exports.$9o = $9o;
    exports.$9o = $9o = __decorate([
        __param(1, extensionManagement_1.$2n),
        __param(2, extensionManagement_1.$Zn)
    ], $9o);
});
//# sourceMappingURL=extensionManagementCLI.js.map