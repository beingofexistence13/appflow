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
    exports.$72b = void 0;
    let $72b = class $72b {
        constructor(f, g, h, i, j, k, l, m, n, o) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.a = [];
            this.b = new async_1.$Fg();
            this.d = null;
            this.q().then(userDataSyncStoreClient => {
                if (!userDataSyncStoreClient) {
                    this.b.open();
                }
            });
        }
        q() {
            if (!this.p) {
                this.p = (async () => {
                    try {
                        if (!platform_1.$o) {
                            this.n.trace(`Skipping initializing user data in desktop`);
                            return;
                        }
                        if (!this.k.isNew(-1 /* StorageScope.APPLICATION */)) {
                            this.n.trace(`Skipping initializing user data as application was opened before`);
                            return;
                        }
                        if (!this.k.isNew(1 /* StorageScope.WORKSPACE */)) {
                            this.n.trace(`Skipping initializing user data as workspace was opened before`);
                            return;
                        }
                        if (this.f.options?.settingsSyncOptions?.authenticationProvider && !this.f.options.settingsSyncOptions.enabled) {
                            this.n.trace(`Skipping initializing user data as settings sync is disabled`);
                            return;
                        }
                        let authenticationSession;
                        try {
                            authenticationSession = await (0, authenticationService_1.$QV)(this.g, this.l);
                        }
                        catch (error) {
                            this.n.error(error);
                        }
                        if (!authenticationSession) {
                            this.n.trace(`Skipping initializing user data as authentication session is not set`);
                            return;
                        }
                        await this.s(authenticationSession);
                        const userDataSyncStore = this.h.userDataSyncStore;
                        if (!userDataSyncStore) {
                            this.n.trace(`Skipping initializing user data as sync service is not provided`);
                            return;
                        }
                        const userDataSyncStoreClient = new userDataSyncStoreService_1.$2Ab(userDataSyncStore.url, this.l, this.m, this.n, this.f, this.i, this.k);
                        userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                        const manifest = await userDataSyncStoreClient.manifest(null);
                        if (manifest === null) {
                            userDataSyncStoreClient.dispose();
                            this.n.trace(`Skipping initializing user data as there is no data`);
                            return;
                        }
                        this.n.info(`Using settings sync service ${userDataSyncStore.url.toString()} for initialization`);
                        return userDataSyncStoreClient;
                    }
                    catch (error) {
                        this.n.error(error);
                        return;
                    }
                })();
            }
            return this.p;
        }
        async s(authenticationSession) {
            const userDataSyncStore = this.h.userDataSyncStore;
            if (!userDataSyncStore?.canSwitch) {
                return;
            }
            const disposables = new lifecycle_1.$jc();
            try {
                const userDataSyncStoreClient = disposables.add(new userDataSyncStoreService_1.$2Ab(userDataSyncStore.url, this.l, this.m, this.n, this.f, this.i, this.k));
                userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                // Cache global state data for global state initialization
                this.d = await userDataSyncStoreClient.readResource("globalState" /* SyncResource.GlobalState */, null);
                if (this.d) {
                    const userDataSyncStoreType = new globalStateSync_1.$eBb(userDataSyncStoreClient, this.k, this.f, this.i, this.n).getSyncStoreType(this.d);
                    if (userDataSyncStoreType) {
                        await this.h.switch(userDataSyncStoreType);
                        // Unset cached global state data if urls are changed
                        if (!(0, resources_1.$bg)(userDataSyncStore.url, this.h.userDataSyncStore?.url)) {
                            this.n.info('Switched settings sync store');
                            this.d = null;
                        }
                    }
                }
            }
            finally {
                disposables.dispose();
            }
        }
        async whenInitializationFinished() {
            await this.b.wait();
        }
        async requiresInitialization() {
            this.n.trace(`UserDataInitializationService#requiresInitialization`);
            const userDataSyncStoreClient = await this.q();
            return !!userDataSyncStoreClient;
        }
        async initializeRequiredResources() {
            this.n.trace(`UserDataInitializationService#initializeRequiredResources`);
            return this.z(["settings" /* SyncResource.Settings */, "globalState" /* SyncResource.GlobalState */]);
        }
        async initializeOtherResources(instantiationService) {
            try {
                this.n.trace(`UserDataInitializationService#initializeOtherResources`);
                await Promise.allSettled([this.z(["keybindings" /* SyncResource.Keybindings */, "snippets" /* SyncResource.Snippets */, "tasks" /* SyncResource.Tasks */]), this.t(instantiationService)]);
            }
            finally {
                this.b.open();
            }
        }
        async t(instantiationService) {
            try {
                await Promise.all([this.initializeInstalledExtensions(instantiationService), this.w(instantiationService)]);
            }
            finally {
                this.a.push("extensions" /* SyncResource.Extensions */);
            }
        }
        async initializeInstalledExtensions(instantiationService) {
            if (!this.u) {
                this.u = (async () => {
                    this.n.trace(`UserDataInitializationService#initializeInstalledExtensions`);
                    const extensionsPreviewInitializer = await this.y(instantiationService);
                    if (extensionsPreviewInitializer) {
                        await instantiationService.createInstance(InstalledExtensionsInitializer, extensionsPreviewInitializer).initialize();
                    }
                })();
            }
            return this.u;
        }
        async w(instantiationService) {
            if (!this.v) {
                this.v = (async () => {
                    this.n.trace(`UserDataInitializationService#initializeNewExtensions`);
                    const extensionsPreviewInitializer = await this.y(instantiationService);
                    if (extensionsPreviewInitializer) {
                        await instantiationService.createInstance(NewExtensionsInitializer, extensionsPreviewInitializer).initialize();
                    }
                })();
            }
            return this.v;
        }
        y(instantiationService) {
            if (!this.x) {
                this.x = (async () => {
                    const userDataSyncStoreClient = await this.q();
                    if (!userDataSyncStoreClient) {
                        return null;
                    }
                    const userData = await userDataSyncStoreClient.readResource("extensions" /* SyncResource.Extensions */, null);
                    return instantiationService.createInstance(ExtensionsPreviewInitializer, userData);
                })();
            }
            return this.x;
        }
        async z(syncResources) {
            const userDataSyncStoreClient = await this.q();
            if (!userDataSyncStoreClient) {
                return;
            }
            await async_1.Promises.settled(syncResources.map(async (syncResource) => {
                try {
                    if (this.a.includes(syncResource)) {
                        this.n.info(`${(0, userDataSync_2.$LAb)(syncResource)} initialized already.`);
                        return;
                    }
                    this.a.push(syncResource);
                    this.n.trace(`Initializing ${(0, userDataSync_2.$LAb)(syncResource)}`);
                    const initializer = this.A(syncResource);
                    const userData = await userDataSyncStoreClient.readResource(syncResource, syncResource === "globalState" /* SyncResource.GlobalState */ ? this.d : null);
                    await initializer.initialize(userData);
                    this.n.info(`Initialized ${(0, userDataSync_2.$LAb)(syncResource)}`);
                }
                catch (error) {
                    this.n.info(`Error while initializing ${(0, userDataSync_2.$LAb)(syncResource)}`);
                    this.n.error(error);
                }
            }));
        }
        A(syncResource) {
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return new settingsSync_1.$X2b(this.i, this.j, this.f, this.n, this.k, this.o);
                case "keybindings" /* SyncResource.Keybindings */: return new keybindingsSync_1.$U2b(this.i, this.j, this.f, this.n, this.k, this.o);
                case "tasks" /* SyncResource.Tasks */: return new tasksSync_1.$62b(this.i, this.j, this.f, this.n, this.k, this.o);
                case "snippets" /* SyncResource.Snippets */: return new snippetsSync_1.$32b(this.i, this.j, this.f, this.n, this.k, this.o);
                case "globalState" /* SyncResource.GlobalState */: return new globalStateSync_1.$dBb(this.k, this.i, this.j, this.f, this.n, this.o);
            }
            throw new Error(`Cannot create initializer for ${syncResource}`);
        }
    };
    exports.$72b = $72b;
    exports.$72b = $72b = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, secrets_1.$FT),
        __param(2, userDataSync_1.$Egb),
        __param(3, files_1.$6j),
        __param(4, userDataProfile_1.$Ek),
        __param(5, storage_1.$Vo),
        __param(6, productService_1.$kj),
        __param(7, request_1.$Io),
        __param(8, log_1.$5i),
        __param(9, uriIdentity_1.$Ck)
    ], $72b);
    let ExtensionsPreviewInitializer = class ExtensionsPreviewInitializer extends extensionsSync_1.$Q2b {
        constructor(w, extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
            this.w = w;
            this.v = null;
        }
        getPreview() {
            if (!this.s) {
                this.s = super.initialize(this.w).then(() => this.v);
            }
            return this.s;
        }
        initialize() {
            throw new Error('should not be called directly');
        }
        async o(remoteUserData) {
            const remoteExtensions = await this.t(remoteUserData);
            if (!remoteExtensions) {
                this.j.info('Skipping initializing extensions because remote extensions does not exist.');
                return;
            }
            const installedExtensions = await this.p.getInstalled();
            this.v = this.u(remoteExtensions, installedExtensions);
        }
    };
    ExtensionsPreviewInitializer = __decorate([
        __param(1, extensionManagement_1.$2n),
        __param(2, ignoredExtensions_1.$PBb),
        __param(3, files_1.$6j),
        __param(4, userDataProfile_1.$Ek),
        __param(5, environment_1.$Ih),
        __param(6, userDataSync_1.$Ugb),
        __param(7, storage_1.$Vo),
        __param(8, uriIdentity_1.$Ck)
    ], ExtensionsPreviewInitializer);
    let InstalledExtensionsInitializer = class InstalledExtensionsInitializer {
        constructor(a, b, d, f) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
        }
        async initialize() {
            const preview = await this.a.getPreview();
            if (!preview) {
                return;
            }
            // 1. Initialise already installed extensions state
            for (const installedExtension of preview.installedExtensions) {
                const syncExtension = preview.remoteExtensions.find(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, installedExtension.identifier));
                if (syncExtension?.state) {
                    const extensionState = this.d.getExtensionState(installedExtension, true) || {};
                    Object.keys(syncExtension.state).forEach(key => extensionState[key] = syncExtension.state[key]);
                    this.d.setExtensionState(installedExtension, extensionState, true);
                }
            }
            // 2. Initialise extensions enablement
            if (preview.disabledExtensions.length) {
                for (const identifier of preview.disabledExtensions) {
                    this.f.trace(`Disabling extension...`, identifier.id);
                    await this.b.disableExtension(identifier);
                    this.f.info(`Disabling extension`, identifier.id);
                }
            }
        }
    };
    InstalledExtensionsInitializer = __decorate([
        __param(1, extensionManagement_1.$5n),
        __param(2, extensionStorage_1.$Tz),
        __param(3, userDataSync_1.$Ugb)
    ], InstalledExtensionsInitializer);
    let NewExtensionsInitializer = class NewExtensionsInitializer {
        constructor(a, b, d, f, g, h) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async initialize() {
            const preview = await this.a.getPreview();
            if (!preview) {
                return;
            }
            const newlyEnabledExtensions = [];
            const targetPlatform = await this.g.getTargetPlatform();
            const galleryExtensions = await this.f.getExtensions(preview.newExtensions, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            for (const galleryExtension of galleryExtensions) {
                try {
                    const extensionToSync = preview.remoteExtensions.find(({ identifier }) => (0, extensionManagementUtil_1.$po)(identifier, galleryExtension.identifier));
                    if (!extensionToSync) {
                        continue;
                    }
                    if (extensionToSync.state) {
                        this.d.setExtensionState(galleryExtension, extensionToSync.state, true);
                    }
                    this.h.trace(`Installing extension...`, galleryExtension.identifier.id);
                    const local = await this.g.installFromGallery(galleryExtension, {
                        isMachineScoped: false,
                        donotIncludePackAndDependencies: true,
                        installGivenVersion: !!extensionToSync.version,
                        installPreReleaseVersion: extensionToSync.preRelease
                    });
                    if (!preview.disabledExtensions.some(identifier => (0, extensionManagementUtil_1.$po)(identifier, galleryExtension.identifier))) {
                        newlyEnabledExtensions.push(local);
                    }
                    this.h.info(`Installed extension.`, galleryExtension.identifier.id);
                }
                catch (error) {
                    this.h.error(error);
                }
            }
            const canEnabledExtensions = newlyEnabledExtensions.filter(e => this.b.canAddExtension((0, extensions_1.$UF)(e)));
            if (!(await this.i(canEnabledExtensions))) {
                await new Promise((c, e) => {
                    const disposable = this.b.onDidChangeExtensions(async () => {
                        try {
                            if (await this.i(canEnabledExtensions)) {
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
        async i(extensions) {
            await this.b.whenInstalledExtensionsRegistered();
            const runningExtensions = this.b.extensions;
            return extensions.every(e => runningExtensions.some(r => (0, extensionManagementUtil_1.$po)({ id: r.identifier.value }, e.identifier)));
        }
    };
    NewExtensionsInitializer = __decorate([
        __param(1, extensions_1.$MF),
        __param(2, extensionStorage_1.$Tz),
        __param(3, extensionManagement_1.$Zn),
        __param(4, extensionManagement_1.$2n),
        __param(5, userDataSync_1.$Ugb)
    ], NewExtensionsInitializer);
});
//# sourceMappingURL=userDataSyncInit.js.map