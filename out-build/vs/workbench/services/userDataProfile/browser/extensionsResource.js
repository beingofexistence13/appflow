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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/nls!vs/workbench/services/userDataProfile/browser/extensionsResource", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/workbench/common/views", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, cancellation_1, lifecycle_1, nls_1, extensionEnablementService_1, extensionManagement_1, extensionManagementUtil_1, instantiation_1, serviceCollection_1, log_1, storage_1, userDataProfileStorageService_1, views_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lAb = exports.$kAb = exports.$jAb = exports.$iAb = exports.$hAb = void 0;
    let $hAb = class $hAb {
        constructor(c, d, f, g, h) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async initialize(content) {
            const profileExtensions = JSON.parse(content);
            const installedExtensions = await this.d.getInstalled(undefined, this.c.currentProfile.extensionsResource);
            const extensionsToEnableOrDisable = [];
            const extensionsToInstall = [];
            for (const e of profileExtensions) {
                const isDisabled = this.g.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.$po)(disabledExtension, e.identifier));
                const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.$po)(installed.identifier, e.identifier));
                if (!installedExtension || (!installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease)) {
                    extensionsToInstall.push(e);
                }
                if (isDisabled !== !!e.disabled) {
                    extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
                }
            }
            const extensionsToUninstall = installedExtensions.filter(extension => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, extension.identifier)));
            for (const { extension, enable } of extensionsToEnableOrDisable) {
                if (enable) {
                    this.h.trace(`Initializing Profile: Enabling extension...`, extension.id);
                    await this.g.enableExtension(extension);
                    this.h.info(`Initializing Profile: Enabled extension...`, extension.id);
                }
                else {
                    this.h.trace(`Initializing Profile: Disabling extension...`, extension.id);
                    await this.g.disableExtension(extension);
                    this.h.info(`Initializing Profile: Disabled extension...`, extension.id);
                }
            }
            if (extensionsToInstall.length) {
                const galleryExtensions = await this.f.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? undefined : e.preRelease })), cancellation_1.CancellationToken.None);
                await Promise.all(extensionsToInstall.map(async (e) => {
                    const extension = galleryExtensions.find(galleryExtension => (0, extensionManagementUtil_1.$po)(galleryExtension.identifier, e.identifier));
                    if (!extension) {
                        return;
                    }
                    if (await this.d.canInstall(extension)) {
                        this.h.trace(`Initializing Profile: Installing extension...`, extension.identifier.id, extension.version);
                        await this.d.installFromGallery(extension, {
                            isMachineScoped: false,
                            donotIncludePackAndDependencies: true,
                            installGivenVersion: !!e.version,
                            installPreReleaseVersion: e.preRelease,
                            profileLocation: this.c.currentProfile.extensionsResource,
                            context: { [extensionManagement_1.$Pn]: true }
                        });
                        this.h.info(`Initializing Profile: Installed extension...`, extension.identifier.id, extension.version);
                    }
                    else {
                        this.h.info(`Initializing Profile: Skipped installing extension because it cannot be installed.`, extension.identifier.id);
                    }
                }));
            }
            if (extensionsToUninstall.length) {
                await Promise.all(extensionsToUninstall.map(e => this.d.uninstall(e)));
            }
        }
    };
    exports.$hAb = $hAb;
    exports.$hAb = $hAb = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, extensionManagement_1.$2n),
        __param(2, extensionManagement_1.$Zn),
        __param(3, extensionManagement_1.$5n),
        __param(4, log_1.$5i)
    ], $hAb);
    let $iAb = class $iAb {
        constructor(c, d, f, g, h) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async getContent(profile, exclude) {
            const extensions = await this.getLocalExtensions(profile);
            return this.toContent(extensions, exclude);
        }
        toContent(extensions, exclude) {
            return JSON.stringify(exclude?.length ? extensions.filter(e => !exclude.includes(e.identifier.id.toLowerCase())) : extensions);
        }
        async apply(content, profile) {
            return this.i(profile, async (extensionEnablementService) => {
                const profileExtensions = await this.getProfileExtensions(content);
                const installedExtensions = await this.c.getInstalled(undefined, profile.extensionsResource);
                const extensionsToEnableOrDisable = [];
                const extensionsToInstall = [];
                for (const e of profileExtensions) {
                    const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.$po)(disabledExtension, e.identifier));
                    const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.$po)(installed.identifier, e.identifier));
                    if (!installedExtension || (!installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease)) {
                        extensionsToInstall.push(e);
                    }
                    if (isDisabled !== !!e.disabled) {
                        extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
                    }
                }
                const extensionsToUninstall = installedExtensions.filter(extension => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, extension.identifier)) && !extension.isApplicationScoped);
                for (const { extension, enable } of extensionsToEnableOrDisable) {
                    if (enable) {
                        this.h.trace(`Importing Profile (${profile.name}): Enabling extension...`, extension.id);
                        await extensionEnablementService.enableExtension(extension);
                        this.h.info(`Importing Profile (${profile.name}): Enabled extension...`, extension.id);
                    }
                    else {
                        this.h.trace(`Importing Profile (${profile.name}): Disabling extension...`, extension.id);
                        await extensionEnablementService.disableExtension(extension);
                        this.h.info(`Importing Profile (${profile.name}): Disabled extension...`, extension.id);
                    }
                }
                if (extensionsToInstall.length) {
                    this.h.info(`Importing Profile (${profile.name}): Started installing extensions.`);
                    const galleryExtensions = await this.d.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? undefined : e.preRelease })), cancellation_1.CancellationToken.None);
                    const installExtensionInfos = [];
                    await Promise.all(extensionsToInstall.map(async (e) => {
                        const extension = galleryExtensions.find(galleryExtension => (0, extensionManagementUtil_1.$po)(galleryExtension.identifier, e.identifier));
                        if (!extension) {
                            return;
                        }
                        if (await this.c.canInstall(extension)) {
                            installExtensionInfos.push({
                                extension,
                                options: {
                                    isMachineScoped: false,
                                    donotIncludePackAndDependencies: true,
                                    installGivenVersion: !!e.version,
                                    installPreReleaseVersion: e.preRelease,
                                    profileLocation: profile.extensionsResource,
                                    context: { [extensionManagement_1.$Pn]: true }
                                }
                            });
                        }
                        else {
                            this.h.info(`Importing Profile (${profile.name}): Skipped installing extension because it cannot be installed.`, extension.identifier.id);
                        }
                    }));
                    if (installExtensionInfos.length) {
                        await this.c.installGalleryExtensions(installExtensionInfos);
                    }
                    this.h.info(`Importing Profile (${profile.name}): Finished installing extensions.`);
                }
                if (extensionsToUninstall.length) {
                    await Promise.all(extensionsToUninstall.map(e => this.c.uninstall(e)));
                }
            });
        }
        async copy(from, to, disableExtensions) {
            await this.c.copyExtensions(from.extensionsResource, to.extensionsResource);
            const extensionsToDisable = await this.i(from, async (extensionEnablementService) => extensionEnablementService.getDisabledExtensions());
            if (disableExtensions) {
                const extensions = await this.c.getInstalled(1 /* ExtensionType.User */, to.extensionsResource);
                for (const extension of extensions) {
                    extensionsToDisable.push(extension.identifier);
                }
            }
            await this.i(to, async (extensionEnablementService) => Promise.all(extensionsToDisable.map(extension => extensionEnablementService.disableExtension(extension))));
        }
        async getLocalExtensions(profile) {
            return this.i(profile, async (extensionEnablementService) => {
                const result = [];
                const installedExtensions = await this.c.getInstalled(undefined, profile.extensionsResource);
                const disabledExtensions = extensionEnablementService.getDisabledExtensions();
                for (const extension of installedExtensions) {
                    const { identifier, preRelease } = extension;
                    const disabled = disabledExtensions.some(disabledExtension => (0, extensionManagementUtil_1.$po)(disabledExtension, identifier));
                    if (extension.isBuiltin && !disabled) {
                        // skip enabled builtin extensions
                        continue;
                    }
                    if (!extension.isBuiltin) {
                        if (!extension.identifier.uuid) {
                            // skip user extensions without uuid
                            continue;
                        }
                    }
                    const profileExtension = { identifier, displayName: extension.manifest.displayName };
                    if (disabled) {
                        profileExtension.disabled = true;
                    }
                    if (!extension.isBuiltin && extension.pinned) {
                        profileExtension.version = extension.manifest.version;
                    }
                    if (!profileExtension.version && preRelease) {
                        profileExtension.preRelease = true;
                    }
                    result.push(profileExtension);
                }
                return result;
            });
        }
        async getProfileExtensions(content) {
            return JSON.parse(content);
        }
        async i(profile, fn) {
            return this.f.withProfileScopedStorageService(profile, async (storageService) => {
                const disposables = new lifecycle_1.$jc();
                const instantiationService = this.g.createChild(new serviceCollection_1.$zh([storage_1.$Vo, storageService]));
                const extensionEnablementService = disposables.add(instantiationService.createInstance(extensionEnablementService_1.$Czb));
                try {
                    return await fn(extensionEnablementService);
                }
                finally {
                    disposables.dispose();
                }
            });
        }
    };
    exports.$iAb = $iAb;
    exports.$iAb = $iAb = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, extensionManagement_1.$Zn),
        __param(2, userDataProfileStorageService_1.$eAb),
        __param(3, instantiation_1.$Ah),
        __param(4, log_1.$5i)
    ], $iAb);
    class $jAb {
        constructor() {
            this.type = "extensions" /* ProfileResourceType.Extensions */;
            this.handle = "extensions" /* ProfileResourceType.Extensions */;
            this.label = { label: (0, nls_1.localize)(0, null) };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
            this.contextValue = "extensions" /* ProfileResourceType.Extensions */;
            this.c = new Set();
        }
        async getChildren() {
            const extensions = (await this.d()).sort((a, b) => (a.displayName ?? a.identifier.id).localeCompare(b.displayName ?? b.identifier.id));
            const that = this;
            return extensions.map(e => ({
                handle: e.identifier.id.toLowerCase(),
                parent: this,
                label: { label: e.displayName || e.identifier.id },
                description: e.disabled ? (0, nls_1.localize)(1, null) : undefined,
                collapsibleState: views_1.TreeItemCollapsibleState.None,
                checkbox: that.checkbox ? {
                    get isChecked() { return !that.c.has(e.identifier.id.toLowerCase()); },
                    set isChecked(value) {
                        if (value) {
                            that.c.delete(e.identifier.id.toLowerCase());
                        }
                        else {
                            that.c.add(e.identifier.id.toLowerCase());
                        }
                    },
                    tooltip: (0, nls_1.localize)(2, null, e.displayName || e.identifier.id),
                    accessibilityInformation: {
                        label: (0, nls_1.localize)(3, null, e.displayName || e.identifier.id),
                    }
                } : undefined,
                command: {
                    id: 'extension.open',
                    title: '',
                    arguments: [e.identifier.id, undefined, true]
                }
            }));
        }
        async hasContent() {
            const extensions = await this.d();
            return extensions.length > 0;
        }
    }
    exports.$jAb = $jAb;
    let $kAb = class $kAb extends $jAb {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
        }
        isFromDefaultProfile() {
            return !this.f.isDefault && !!this.f.useDefaultFlags?.extensions;
        }
        d() {
            return this.g.createInstance($iAb).getLocalExtensions(this.f);
        }
        async getContent() {
            return this.g.createInstance($iAb).getContent(this.f, [...this.c.values()]);
        }
    };
    exports.$kAb = $kAb;
    exports.$kAb = $kAb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $kAb);
    let $lAb = class $lAb extends $jAb {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
        }
        isFromDefaultProfile() {
            return false;
        }
        d() {
            return this.g.createInstance($iAb).getProfileExtensions(this.f);
        }
        async getContent() {
            const extensionsResource = this.g.createInstance($iAb);
            const extensions = await extensionsResource.getProfileExtensions(this.f);
            return extensionsResource.toContent(extensions, [...this.c.values()]);
        }
    };
    exports.$lAb = $lAb;
    exports.$lAb = $lAb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $lAb);
});
//# sourceMappingURL=extensionsResource.js.map