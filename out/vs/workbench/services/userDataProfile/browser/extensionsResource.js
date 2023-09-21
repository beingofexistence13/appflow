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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/nls", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/workbench/common/views", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, cancellation_1, lifecycle_1, nls_1, extensionEnablementService_1, extensionManagement_1, extensionManagementUtil_1, instantiation_1, serviceCollection_1, log_1, storage_1, userDataProfileStorageService_1, views_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsResourceImportTreeItem = exports.ExtensionsResourceExportTreeItem = exports.ExtensionsResourceTreeItem = exports.ExtensionsResource = exports.ExtensionsResourceInitializer = void 0;
    let ExtensionsResourceInitializer = class ExtensionsResourceInitializer {
        constructor(userDataProfileService, extensionManagementService, extensionGalleryService, extensionEnablementService, logService) {
            this.userDataProfileService = userDataProfileService;
            this.extensionManagementService = extensionManagementService;
            this.extensionGalleryService = extensionGalleryService;
            this.extensionEnablementService = extensionEnablementService;
            this.logService = logService;
        }
        async initialize(content) {
            const profileExtensions = JSON.parse(content);
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.userDataProfileService.currentProfile.extensionsResource);
            const extensionsToEnableOrDisable = [];
            const extensionsToInstall = [];
            for (const e of profileExtensions) {
                const isDisabled = this.extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, e.identifier));
                const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, e.identifier));
                if (!installedExtension || (!installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease)) {
                    extensionsToInstall.push(e);
                }
                if (isDisabled !== !!e.disabled) {
                    extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
                }
            }
            const extensionsToUninstall = installedExtensions.filter(extension => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, extension.identifier)));
            for (const { extension, enable } of extensionsToEnableOrDisable) {
                if (enable) {
                    this.logService.trace(`Initializing Profile: Enabling extension...`, extension.id);
                    await this.extensionEnablementService.enableExtension(extension);
                    this.logService.info(`Initializing Profile: Enabled extension...`, extension.id);
                }
                else {
                    this.logService.trace(`Initializing Profile: Disabling extension...`, extension.id);
                    await this.extensionEnablementService.disableExtension(extension);
                    this.logService.info(`Initializing Profile: Disabled extension...`, extension.id);
                }
            }
            if (extensionsToInstall.length) {
                const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? undefined : e.preRelease })), cancellation_1.CancellationToken.None);
                await Promise.all(extensionsToInstall.map(async (e) => {
                    const extension = galleryExtensions.find(galleryExtension => (0, extensionManagementUtil_1.areSameExtensions)(galleryExtension.identifier, e.identifier));
                    if (!extension) {
                        return;
                    }
                    if (await this.extensionManagementService.canInstall(extension)) {
                        this.logService.trace(`Initializing Profile: Installing extension...`, extension.identifier.id, extension.version);
                        await this.extensionManagementService.installFromGallery(extension, {
                            isMachineScoped: false,
                            donotIncludePackAndDependencies: true,
                            installGivenVersion: !!e.version,
                            installPreReleaseVersion: e.preRelease,
                            profileLocation: this.userDataProfileService.currentProfile.extensionsResource,
                            context: { [extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
                        });
                        this.logService.info(`Initializing Profile: Installed extension...`, extension.identifier.id, extension.version);
                    }
                    else {
                        this.logService.info(`Initializing Profile: Skipped installing extension because it cannot be installed.`, extension.identifier.id);
                    }
                }));
            }
            if (extensionsToUninstall.length) {
                await Promise.all(extensionsToUninstall.map(e => this.extensionManagementService.uninstall(e)));
            }
        }
    };
    exports.ExtensionsResourceInitializer = ExtensionsResourceInitializer;
    exports.ExtensionsResourceInitializer = ExtensionsResourceInitializer = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(4, log_1.ILogService)
    ], ExtensionsResourceInitializer);
    let ExtensionsResource = class ExtensionsResource {
        constructor(extensionManagementService, extensionGalleryService, userDataProfileStorageService, instantiationService, logService) {
            this.extensionManagementService = extensionManagementService;
            this.extensionGalleryService = extensionGalleryService;
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.instantiationService = instantiationService;
            this.logService = logService;
        }
        async getContent(profile, exclude) {
            const extensions = await this.getLocalExtensions(profile);
            return this.toContent(extensions, exclude);
        }
        toContent(extensions, exclude) {
            return JSON.stringify(exclude?.length ? extensions.filter(e => !exclude.includes(e.identifier.id.toLowerCase())) : extensions);
        }
        async apply(content, profile) {
            return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
                const profileExtensions = await this.getProfileExtensions(content);
                const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
                const extensionsToEnableOrDisable = [];
                const extensionsToInstall = [];
                for (const e of profileExtensions) {
                    const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, e.identifier));
                    const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, e.identifier));
                    if (!installedExtension || (!installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease)) {
                        extensionsToInstall.push(e);
                    }
                    if (isDisabled !== !!e.disabled) {
                        extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
                    }
                }
                const extensionsToUninstall = installedExtensions.filter(extension => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, extension.identifier)) && !extension.isApplicationScoped);
                for (const { extension, enable } of extensionsToEnableOrDisable) {
                    if (enable) {
                        this.logService.trace(`Importing Profile (${profile.name}): Enabling extension...`, extension.id);
                        await extensionEnablementService.enableExtension(extension);
                        this.logService.info(`Importing Profile (${profile.name}): Enabled extension...`, extension.id);
                    }
                    else {
                        this.logService.trace(`Importing Profile (${profile.name}): Disabling extension...`, extension.id);
                        await extensionEnablementService.disableExtension(extension);
                        this.logService.info(`Importing Profile (${profile.name}): Disabled extension...`, extension.id);
                    }
                }
                if (extensionsToInstall.length) {
                    this.logService.info(`Importing Profile (${profile.name}): Started installing extensions.`);
                    const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? undefined : e.preRelease })), cancellation_1.CancellationToken.None);
                    const installExtensionInfos = [];
                    await Promise.all(extensionsToInstall.map(async (e) => {
                        const extension = galleryExtensions.find(galleryExtension => (0, extensionManagementUtil_1.areSameExtensions)(galleryExtension.identifier, e.identifier));
                        if (!extension) {
                            return;
                        }
                        if (await this.extensionManagementService.canInstall(extension)) {
                            installExtensionInfos.push({
                                extension,
                                options: {
                                    isMachineScoped: false,
                                    donotIncludePackAndDependencies: true,
                                    installGivenVersion: !!e.version,
                                    installPreReleaseVersion: e.preRelease,
                                    profileLocation: profile.extensionsResource,
                                    context: { [extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
                                }
                            });
                        }
                        else {
                            this.logService.info(`Importing Profile (${profile.name}): Skipped installing extension because it cannot be installed.`, extension.identifier.id);
                        }
                    }));
                    if (installExtensionInfos.length) {
                        await this.extensionManagementService.installGalleryExtensions(installExtensionInfos);
                    }
                    this.logService.info(`Importing Profile (${profile.name}): Finished installing extensions.`);
                }
                if (extensionsToUninstall.length) {
                    await Promise.all(extensionsToUninstall.map(e => this.extensionManagementService.uninstall(e)));
                }
            });
        }
        async copy(from, to, disableExtensions) {
            await this.extensionManagementService.copyExtensions(from.extensionsResource, to.extensionsResource);
            const extensionsToDisable = await this.withProfileScopedServices(from, async (extensionEnablementService) => extensionEnablementService.getDisabledExtensions());
            if (disableExtensions) {
                const extensions = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, to.extensionsResource);
                for (const extension of extensions) {
                    extensionsToDisable.push(extension.identifier);
                }
            }
            await this.withProfileScopedServices(to, async (extensionEnablementService) => Promise.all(extensionsToDisable.map(extension => extensionEnablementService.disableExtension(extension))));
        }
        async getLocalExtensions(profile) {
            return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
                const result = [];
                const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
                const disabledExtensions = extensionEnablementService.getDisabledExtensions();
                for (const extension of installedExtensions) {
                    const { identifier, preRelease } = extension;
                    const disabled = disabledExtensions.some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier));
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
        async withProfileScopedServices(profile, fn) {
            return this.userDataProfileStorageService.withProfileScopedStorageService(profile, async (storageService) => {
                const disposables = new lifecycle_1.DisposableStore();
                const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([storage_1.IStorageService, storageService]));
                const extensionEnablementService = disposables.add(instantiationService.createInstance(extensionEnablementService_1.GlobalExtensionEnablementService));
                try {
                    return await fn(extensionEnablementService);
                }
                finally {
                    disposables.dispose();
                }
            });
        }
    };
    exports.ExtensionsResource = ExtensionsResource;
    exports.ExtensionsResource = ExtensionsResource = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, log_1.ILogService)
    ], ExtensionsResource);
    class ExtensionsResourceTreeItem {
        constructor() {
            this.type = "extensions" /* ProfileResourceType.Extensions */;
            this.handle = "extensions" /* ProfileResourceType.Extensions */;
            this.label = { label: (0, nls_1.localize)('extensions', "Extensions") };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
            this.contextValue = "extensions" /* ProfileResourceType.Extensions */;
            this.excludedExtensions = new Set();
        }
        async getChildren() {
            const extensions = (await this.getExtensions()).sort((a, b) => (a.displayName ?? a.identifier.id).localeCompare(b.displayName ?? b.identifier.id));
            const that = this;
            return extensions.map(e => ({
                handle: e.identifier.id.toLowerCase(),
                parent: this,
                label: { label: e.displayName || e.identifier.id },
                description: e.disabled ? (0, nls_1.localize)('disabled', "Disabled") : undefined,
                collapsibleState: views_1.TreeItemCollapsibleState.None,
                checkbox: that.checkbox ? {
                    get isChecked() { return !that.excludedExtensions.has(e.identifier.id.toLowerCase()); },
                    set isChecked(value) {
                        if (value) {
                            that.excludedExtensions.delete(e.identifier.id.toLowerCase());
                        }
                        else {
                            that.excludedExtensions.add(e.identifier.id.toLowerCase());
                        }
                    },
                    tooltip: (0, nls_1.localize)('exclude', "Select {0} Extension", e.displayName || e.identifier.id),
                    accessibilityInformation: {
                        label: (0, nls_1.localize)('exclude', "Select {0} Extension", e.displayName || e.identifier.id),
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
            const extensions = await this.getExtensions();
            return extensions.length > 0;
        }
    }
    exports.ExtensionsResourceTreeItem = ExtensionsResourceTreeItem;
    let ExtensionsResourceExportTreeItem = class ExtensionsResourceExportTreeItem extends ExtensionsResourceTreeItem {
        constructor(profile, instantiationService) {
            super();
            this.profile = profile;
            this.instantiationService = instantiationService;
        }
        isFromDefaultProfile() {
            return !this.profile.isDefault && !!this.profile.useDefaultFlags?.extensions;
        }
        getExtensions() {
            return this.instantiationService.createInstance(ExtensionsResource).getLocalExtensions(this.profile);
        }
        async getContent() {
            return this.instantiationService.createInstance(ExtensionsResource).getContent(this.profile, [...this.excludedExtensions.values()]);
        }
    };
    exports.ExtensionsResourceExportTreeItem = ExtensionsResourceExportTreeItem;
    exports.ExtensionsResourceExportTreeItem = ExtensionsResourceExportTreeItem = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ExtensionsResourceExportTreeItem);
    let ExtensionsResourceImportTreeItem = class ExtensionsResourceImportTreeItem extends ExtensionsResourceTreeItem {
        constructor(content, instantiationService) {
            super();
            this.content = content;
            this.instantiationService = instantiationService;
        }
        isFromDefaultProfile() {
            return false;
        }
        getExtensions() {
            return this.instantiationService.createInstance(ExtensionsResource).getProfileExtensions(this.content);
        }
        async getContent() {
            const extensionsResource = this.instantiationService.createInstance(ExtensionsResource);
            const extensions = await extensionsResource.getProfileExtensions(this.content);
            return extensionsResource.toContent(extensions, [...this.excludedExtensions.values()]);
        }
    };
    exports.ExtensionsResourceImportTreeItem = ExtensionsResourceImportTreeItem;
    exports.ExtensionsResourceImportTreeItem = ExtensionsResourceImportTreeItem = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ExtensionsResourceImportTreeItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1Jlc291cmNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3VzZXJEYXRhUHJvZmlsZS9icm93c2VyL2V4dGVuc2lvbnNSZXNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQnpGLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQTZCO1FBRXpDLFlBQzJDLHNCQUErQyxFQUMzQywwQkFBdUQsRUFDMUQsdUJBQWlELEVBQ3hDLDBCQUE2RCxFQUNuRixVQUF1QjtZQUpYLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDM0MsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUMxRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3hDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBbUM7WUFDbkYsZUFBVSxHQUFWLFVBQVUsQ0FBYTtRQUV0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFlO1lBQy9CLE1BQU0saUJBQWlCLEdBQXdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkUsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6SixNQUFNLDJCQUEyQixHQUEyRCxFQUFFLENBQUM7WUFDL0YsTUFBTSxtQkFBbUIsR0FBd0IsRUFBRSxDQUFDO1lBQ3BELEtBQUssTUFBTSxDQUFDLElBQUksaUJBQWlCLEVBQUU7Z0JBQ2xDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMs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