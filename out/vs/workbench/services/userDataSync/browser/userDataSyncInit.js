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
define(["require", "exports", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/globalStateSync", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/userDataSync/common/settingsSync", "vs/platform/userDataSync/common/snippetsSync", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/platform", "vs/base/common/async", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/environment/common/environment", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/userDataSync/common/ignoredExtensions", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/cancellation", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/userDataSync/common/tasksSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/environment/browser/environmentService", "vs/platform/secrets/common/secrets"], function (require, exports, storage_1, extensionsSync_1, globalStateSync_1, keybindingsSync_1, settingsSync_1, snippetsSync_1, files_1, log_1, userDataSyncStoreService_1, productService_1, request_1, userDataSync_1, authenticationService_1, userDataSync_2, platform_1, async_1, extensionManagement_1, environment_1, extensions_1, extensionManagementUtil_1, ignoredExtensions_1, lifecycle_1, resources_1, cancellation_1, uriIdentity_1, extensionStorage_1, tasksSync_1, userDataProfile_1, environmentService_1, secrets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncInitializer = void 0;
    let UserDataSyncInitializer = class UserDataSyncInitializer {
        constructor(environmentService, secretStorageService, userDataSyncStoreManagementService, fileService, userDataProfilesService, storageService, productService, requestService, logService, uriIdentityService) {
            this.environmentService = environmentService;
            this.secretStorageService = secretStorageService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.fileService = fileService;
            this.userDataProfilesService = userDataProfilesService;
            this.storageService = storageService;
            this.productService = productService;
            this.requestService = requestService;
            this.logService = logService;
            this.uriIdentityService = uriIdentityService;
            this.initialized = [];
            this.initializationFinished = new async_1.Barrier();
            this.globalStateUserData = null;
            this.createUserDataSyncStoreClient().then(userDataSyncStoreClient => {
                if (!userDataSyncStoreClient) {
                    this.initializationFinished.open();
                }
            });
        }
        createUserDataSyncStoreClient() {
            if (!this._userDataSyncStoreClientPromise) {
                this._userDataSyncStoreClientPromise = (async () => {
                    try {
                        if (!platform_1.isWeb) {
                            this.logService.trace(`Skipping initializing user data in desktop`);
                            return;
                        }
                        if (!this.storageService.isNew(-1 /* StorageScope.APPLICATION */)) {
                            this.logService.trace(`Skipping initializing user data as application was opened before`);
                            return;
                        }
                        if (!this.storageService.isNew(1 /* StorageScope.WORKSPACE */)) {
                            this.logService.trace(`Skipping initializing user data as workspace was opened before`);
                            return;
                        }
                        if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider && !this.environmentService.options.settingsSyncOptions.enabled) {
                            this.logService.trace(`Skipping initializing user data as settings sync is disabled`);
                            return;
                        }
                        let authenticationSession;
                        try {
                            authenticationSession = await (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.secretStorageService, this.productService);
                        }
                        catch (error) {
                            this.logService.error(error);
                        }
                        if (!authenticationSession) {
                            this.logService.trace(`Skipping initializing user data as authentication session is not set`);
                            return;
                        }
                        await this.initializeUserDataSyncStore(authenticationSession);
                        const userDataSyncStore = this.userDataSyncStoreManagementService.userDataSyncStore;
                        if (!userDataSyncStore) {
                            this.logService.trace(`Skipping initializing user data as sync service is not provided`);
                            return;
                        }
                        const userDataSyncStoreClient = new userDataSyncStoreService_1.UserDataSyncStoreClient(userDataSyncStore.url, this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService);
                        userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                        const manifest = await userDataSyncStoreClient.manifest(null);
                        if (manifest === null) {
                            userDataSyncStoreClient.dispose();
                            this.logService.trace(`Skipping initializing user data as there is no data`);
                            return;
                        }
                        this.logService.info(`Using settings sync service ${userDataSyncStore.url.toString()} for initialization`);
                        return userDataSyncStoreClient;
                    }
                    catch (error) {
                        this.logService.error(error);
                        return;
                    }
                })();
            }
            return this._userDataSyncStoreClientPromise;
        }
        async initializeUserDataSyncStore(authenticationSession) {
            const userDataSyncStore = this.userDataSyncStoreManagementService.userDataSyncStore;
            if (!userDataSyncStore?.canSwitch) {
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const userDataSyncStoreClient = disposables.add(new userDataSyncStoreService_1.UserDataSyncStoreClient(userDataSyncStore.url, this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService));
                userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                // Cache global state data for global state initialization
                this.globalStateUserData = await userDataSyncStoreClient.readResource("globalState" /* SyncResource.GlobalState */, null);
                if (this.globalStateUserData) {
                    const userDataSyncStoreType = new globalStateSync_1.UserDataSyncStoreTypeSynchronizer(userDataSyncStoreClient, this.storageService, this.environmentService, this.fileService, this.logService).getSyncStoreType(this.globalStateUserData);
                    if (userDataSyncStoreType) {
                        await this.userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                        // Unset cached global state data if urls are changed
                        if (!(0, resources_1.isEqual)(userDataSyncStore.url, this.userDataSyncStoreManagementService.userDataSyncStore?.url)) {
                            this.logService.info('Switched settings sync store');
                            this.globalStateUserData = null;
                        }
                    }
                }
            }
            finally {
                disposables.dispose();
            }
        }
        async whenInitializationFinished() {
            await this.initializationFinished.wait();
        }
        async requiresInitialization() {
            this.logService.trace(`UserDataInitializationService#requiresInitialization`);
            const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
            return !!userDataSyncStoreClient;
        }
        async initializeRequiredResources() {
            this.logService.trace(`UserDataInitializationService#initializeRequiredResources`);
            return this.initialize(["settings" /* SyncResource.Settings */, "globalState" /* SyncResource.GlobalState */]);
        }
        async initializeOtherResources(instantiationService) {
            try {
                this.logService.trace(`UserDataInitializationService#initializeOtherResources`);
                await Promise.allSettled([this.initialize(["keybindings" /* SyncResource.Keybindings */, "snippets" /* SyncResource.Snippets */, "tasks" /* SyncResource.Tasks */]), this.initializeExtensions(instantiationService)]);
            }
            finally {
                this.initializationFinished.open();
            }
        }
        async initializeExtensions(instantiationService) {
            try {
                await Promise.all([this.initializeInstalledExtensions(instantiationService), this.initializeNewExtensions(instantiationService)]);
            }
            finally {
                this.initialized.push("extensions" /* SyncResource.Extensions */);
            }
        }
        async initializeInstalledExtensions(instantiationService) {
            if (!this.initializeInstalledExtensionsPromise) {
                this.initializeInstalledExtensionsPromise = (async () => {
                    this.logService.trace(`UserDataInitializationService#initializeInstalledExtensions`);
                    const extensionsPreviewInitializer = await this.getExtensionsPreviewInitializer(instantiationService);
                    if (extensionsPreviewInitializer) {
                        await instantiationService.createInstance(InstalledExtensionsInitializer, extensionsPreviewInitializer).initialize();
                    }
                })();
            }
            return this.initializeInstalledExtensionsPromise;
        }
        async initializeNewExtensions(instantiationService) {
            if (!this.initializeNewExtensionsPromise) {
                this.initializeNewExtensionsPromise = (async () => {
                    this.logService.trace(`UserDataInitializationService#initializeNewExtensions`);
                    const extensionsPreviewInitializer = await this.getExtensionsPreviewInitializer(instantiationService);
                    if (extensionsPreviewInitializer) {
                        await instantiationService.createInstance(NewExtensionsInitializer, extensionsPreviewInitializer).initialize();
                    }
                })();
            }
            return this.initializeNewExtensionsPromise;
        }
        getExtensionsPreviewInitializer(instantiationService) {
            if (!this.extensionsPreviewInitializerPromise) {
                this.extensionsPreviewInitializerPromise = (async () => {
                    const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
                    if (!userDataSyncStoreClient) {
                        return null;
                    }
                    const userData = await userDataSyncStoreClient.readResource("extensions" /* SyncResource.Extensions */, null);
                    return instantiationService.createInstance(ExtensionsPreviewInitializer, userData);
                })();
            }
            return this.extensionsPreviewInitializerPromise;
        }
        async initialize(syncResources) {
            const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
            if (!userDataSyncStoreClient) {
                return;
            }
            await async_1.Promises.settled(syncResources.map(async (syncResource) => {
                try {
                    if (this.initialized.includes(syncResource)) {
                        this.logService.info(`${(0, userDataSync_2.getSyncAreaLabel)(syncResource)} initialized already.`);
                        return;
                    }
                    this.initialized.push(syncResource);
                    this.logService.trace(`Initializing ${(0, userDataSync_2.getSyncAreaLabel)(syncResource)}`);
                    const initializer = this.createSyncResourceInitializer(syncResource);
                    const userData = await userDataSyncStoreClient.readResource(syncResource, syncResource === "globalState" /* SyncResource.GlobalState */ ? this.globalStateUserData : null);
                    await initializer.initialize(userData);
                    this.logService.info(`Initialized ${(0, userDataSync_2.getSyncAreaLabel)(syncResource)}`);
                }
                catch (error) {
                    this.logService.info(`Error while initializing ${(0, userDataSync_2.getSyncAreaLabel)(syncResource)}`);
                    this.logService.error(error);
                }
            }));
        }
        createSyncResourceInitializer(syncResource) {
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return new settingsSync_1.SettingsInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
                case "keybindings" /* SyncResource.Keybindings */: return new keybindingsSync_1.KeybindingsInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
                case "tasks" /* SyncResource.Tasks */: return new tasksSync_1.TasksInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
                case "snippets" /* SyncResource.Snippets */: return new snippetsSync_1.SnippetsInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
                case "globalState" /* SyncResource.GlobalState */: return new globalStateSync_1.GlobalStateInitializer(this.storageService, this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.uriIdentityService);
            }
            throw new Error(`Cannot create initializer for ${syncResource}`);
        }
    };
    exports.UserDataSyncInitializer = UserDataSyncInitializer;
    exports.UserDataSyncInitializer = UserDataSyncInitializer = __decorate([
        __param(0, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(1, secrets_1.ISecretStorageService),
        __param(2, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(3, files_1.IFileService),
        __param(4, userDataProfile_1.IUserDataProfilesService),
        __param(5, storage_1.IStorageService),
        __param(6, productService_1.IProductService),
        __param(7, request_1.IRequestService),
        __param(8, log_1.ILogService),
        __param(9, uriIdentity_1.IUriIdentityService)
    ], UserDataSyncInitializer);
    let ExtensionsPreviewInitializer = class ExtensionsPreviewInitializer extends extensionsSync_1.AbstractExtensionsInitializer {
        constructor(extensionsData, extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
            this.extensionsData = extensionsData;
            this.preview = null;
        }
        getPreview() {
            if (!this.previewPromise) {
                this.previewPromise = super.initialize(this.extensionsData).then(() => this.preview);
            }
            return this.previewPromise;
        }
        initialize() {
            throw new Error('should not be called directly');
        }
        async doInitialize(remoteUserData) {
            const remoteExtensions = await this.parseExtensions(remoteUserData);
            if (!remoteExtensions) {
                this.logService.info('Skipping initializing extensions because remote extensions does not exist.');
                return;
            }
            const installedExtensions = await this.extensionManagementService.getInstalled();
            this.preview = this.generatePreview(remoteExtensions, installedExtensions);
        }
    };
    ExtensionsPreviewInitializer = __decorate([
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(3, files_1.IFileService),
        __param(4, userDataProfile_1.IUserDataProfilesService),
        __param(5, environment_1.IEnvironmentService),
        __param(6, userDataSync_1.IUserDataSyncLogService),
        __param(7, storage_1.IStorageService),
        __param(8, uriIdentity_1.IUriIdentityService)
    ], ExtensionsPreviewInitializer);
    let InstalledExtensionsInitializer = class InstalledExtensionsInitializer {
        constructor(extensionsPreviewInitializer, extensionEnablementService, extensionStorageService, logService) {
            this.extensionsPreviewInitializer = extensionsPreviewInitializer;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionStorageService = extensionStorageService;
            this.logService = logService;
        }
        async initialize() {
            const preview = await this.extensionsPreviewInitializer.getPreview();
            if (!preview) {
                return;
            }
            // 1. Initialise already installed extensions state
            for (const installedExtension of preview.installedExtensions) {
                const syncExtension = preview.remoteExtensions.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, installedExtension.identifier));
                if (syncExtension?.state) {
                    const extensionState = this.extensionStorageService.getExtensionState(installedExtension, true) || {};
                    Object.keys(syncExtension.state).forEach(key => extensionState[key] = syncExtension.state[key]);
                    this.extensionStorageService.setExtensionState(installedExtension, extensionState, true);
                }
            }
            // 2. Initialise extensions enablement
            if (preview.disabledExtensions.length) {
                for (const identifier of preview.disabledExtensions) {
                    this.logService.trace(`Disabling extension...`, identifier.id);
                    await this.extensionEnablementService.disableExtension(identifier);
                    this.logService.info(`Disabling extension`, identifier.id);
                }
            }
        }
    };
    InstalledExtensionsInitializer = __decorate([
        __param(1, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(2, extensionStorage_1.IExtensionStorageService),
        __param(3, userDataSync_1.IUserDataSyncLogService)
    ], InstalledExtensionsInitializer);
    let NewExtensionsInitializer = class NewExtensionsInitializer {
        constructor(extensionsPreviewInitializer, extensionService, extensionStorageService, galleryService, extensionManagementService, logService) {
            this.extensionsPreviewInitializer = extensionsPreviewInitializer;
            this.extensionService = extensionService;
            this.extensionStorageService = extensionStorageService;
            this.galleryService = galleryService;
            this.extensionManagementService = extensionManagementService;
            this.logService = logService;
        }
        async initialize() {
            const preview = await this.extensionsPreviewInitializer.getPreview();
            if (!preview) {
                return;
            }
            const newlyEnabledExtensions = [];
            const targetPlatform = await this.extensionManagementService.getTargetPlatform();
            const galleryExtensions = await this.galleryService.getExtensions(preview.newExtensions, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            for (const galleryExtension of galleryExtensions) {
                try {
                    const extensionToSync = preview.remoteExtensions.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, galleryExtension.identifier));
                    if (!extensionToSync) {
                        continue;
                    }
                    if (extensionToSync.state) {
                        this.extensionStorageService.setExtensionState(galleryExtension, extensionToSync.state, true);
                    }
                    this.logService.trace(`Installing extension...`, galleryExtension.identifier.id);
                    const local = await this.extensionManagementService.installFromGallery(galleryExtension, {
                        isMachineScoped: false,
                        donotIncludePackAndDependencies: true,
                        installGivenVersion: !!extensionToSync.version,
                        installPreReleaseVersion: extensionToSync.preRelease
                    });
                    if (!preview.disabledExtensions.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, galleryExtension.identifier))) {
                        newlyEnabledExtensions.push(local);
                    }
                    this.logService.info(`Installed extension.`, galleryExtension.identifier.id);
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            const canEnabledExtensions = newlyEnabledExtensions.filter(e => this.extensionService.canAddExtension((0, extensions_1.toExtensionDescription)(e)));
            if (!(await this.areExtensionsRunning(canEnabledExtensions))) {
                await new Promise((c, e) => {
                    const disposable = this.extensionService.onDidChangeExtensions(async () => {
                        try {
                            if (await this.areExtensionsRunning(canEnabledExtensions)) {
                                disposable.dispose();
                                c();
                            }
                        }
                        catch (error) {
                            e(error);
                        }
                    });
                });
            }
        }
        async areExtensionsRunning(extensions) {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const runningExtensions = this.extensionService.extensions;
            return extensions.every(e => runningExtensions.some(r => (0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value }, e.identifier)));
        }
    };
    NewExtensionsInitializer = __decorate([
        __param(1, extensions_1.IExtensionService),
        __param(2, extensionStorage_1.IExtensionStorageService),
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, userDataSync_1.IUserDataSyncLogService)
    ], NewExtensionsInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jSW5pdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVN5bmMvYnJvd3Nlci91c2VyRGF0YVN5bmNJbml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1DekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFRbkMsWUFDc0Msa0JBQXdFLEVBQ3RGLG9CQUE0RCxFQUM5QyxrQ0FBd0YsRUFDL0csV0FBMEMsRUFDOUIsdUJBQWtFLEVBQzNFLGNBQWdELEVBQ2hELGNBQWdELEVBQ2hELGNBQWdELEVBQ3BELFVBQXdDLEVBQ2hDLGtCQUF3RDtZQVR2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFDO1lBQ3JFLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0IsdUNBQWtDLEdBQWxDLGtDQUFrQyxDQUFxQztZQUM5RixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNiLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDMUQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNmLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFkN0QsZ0JBQVcsR0FBbUIsRUFBRSxDQUFDO1lBQ2pDLDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7WUFDaEQsd0JBQW1CLEdBQXFCLElBQUksQ0FBQztZQWNwRCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLHVCQUF1QixFQUFFO29CQUM3QixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFF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