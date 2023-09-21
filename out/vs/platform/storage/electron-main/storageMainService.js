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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/functional", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/storage/electron-main/storageMain", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network"], function (require, exports, uri_1, functional_1, event_1, lifecycle_1, environment_1, files_1, instantiation_1, lifecycleMainService_1, log_1, storage_1, storageMain_1, userDataProfile_1, userDataProfile_2, uriIdentity_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationStorageMainService = exports.IApplicationStorageMainService = exports.StorageMainService = exports.IStorageMainService = void 0;
    //#region Storage Main Service (intent: make application, profile and workspace storage accessible to windows from main process)
    exports.IStorageMainService = (0, instantiation_1.createDecorator)('storageMainService');
    let StorageMainService = class StorageMainService extends lifecycle_1.Disposable {
        constructor(logService, environmentService, userDataProfilesService, lifecycleMainService, fileService, uriIdentityService) {
            super();
            this.logService = logService;
            this.environmentService = environmentService;
            this.userDataProfilesService = userDataProfilesService;
            this.lifecycleMainService = lifecycleMainService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.shutdownReason = undefined;
            this._onDidChangeProfileStorage = this._register(new event_1.Emitter());
            this.onDidChangeProfileStorage = this._onDidChangeProfileStorage.event;
            //#region Application Storage
            this.applicationStorage = this._register(this.createApplicationStorage());
            //#endregion
            //#region Profile Storage
            this.mapProfileToStorage = new Map();
            //#endregion
            //#region Workspace Storage
            this.mapWorkspaceToStorage = new Map();
            this.registerListeners();
        }
        getStorageOptions() {
            return {
                useInMemoryStorage: !!this.environmentService.extensionTestsLocationURI // no storage during extension tests!
            };
        }
        registerListeners() {
            // Application Storage: Warmup when any window opens
            (async () => {
                await this.lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */);
                this.applicationStorage.init();
            })();
            this._register(this.lifecycleMainService.onWillLoadWindow(e => {
                // Profile Storage: Warmup when related window with profile loads
                if (e.window.profile) {
                    this.profileStorage(e.window.profile).init();
                }
                // Workspace Storage: Warmup when related window with workspace loads
                if (e.workspace) {
                    this.workspaceStorage(e.workspace).init();
                }
            }));
            // All Storage: Close when shutting down
            this._register(this.lifecycleMainService.onWillShutdown(e => {
                this.logService.trace('storageMainService#onWillShutdown()');
                // Remember shutdown reason
                this.shutdownReason = e.reason;
                // Application Storage
                e.join('applicationStorage', this.applicationStorage.close());
                // Profile Storage(s)
                for (const [, profileStorage] of this.mapProfileToStorage) {
                    e.join('profileStorage', profileStorage.close());
                }
                // Workspace Storage(s)
                for (const [, workspaceStorage] of this.mapWorkspaceToStorage) {
                    e.join('workspaceStorage', workspaceStorage.close());
                }
            }));
            // Prepare storage location as needed
            this._register(this.userDataProfilesService.onWillCreateProfile(e => {
                e.join((async () => {
                    if (!(await this.fileService.exists(e.profile.globalStorageHome))) {
                        await this.fileService.createFolder(e.profile.globalStorageHome);
                    }
                })());
            }));
            // Close the storage of the profile that is being removed
            this._register(this.userDataProfilesService.onWillRemoveProfile(e => {
                const storage = this.mapProfileToStorage.get(e.profile.id);
                if (storage) {
                    e.join(storage.close());
                }
            }));
        }
        createApplicationStorage() {
            this.logService.trace(`StorageMainService: creating application storage`);
            const applicationStorage = new storageMain_1.ApplicationStorageMain(this.getStorageOptions(), this.userDataProfilesService, this.logService, this.fileService);
            this._register((0, functional_1.once)(applicationStorage.onDidCloseStorage)(() => {
                this.logService.trace(`StorageMainService: closed application storage`);
            }));
            return applicationStorage;
        }
        profileStorage(profile) {
            if ((0, storage_1.isProfileUsingDefaultStorage)(profile)) {
                return this.applicationStorage; // for profiles using default storage, use application storage
            }
            let profileStorage = this.mapProfileToStorage.get(profile.id);
            if (!profileStorage) {
                this.logService.trace(`StorageMainService: creating profile storage (${profile.name})`);
                profileStorage = this._register(this.createProfileStorage(profile));
                this.mapProfileToStorage.set(profile.id, profileStorage);
                const listener = this._register(profileStorage.onDidChangeStorage(e => this._onDidChangeProfileStorage.fire({
                    ...e,
                    storage: profileStorage,
                    profile
                })));
                this._register((0, functional_1.once)(profileStorage.onDidCloseStorage)(() => {
                    this.logService.trace(`StorageMainService: closed profile storage (${profile.name})`);
                    this.mapProfileToStorage.delete(profile.id);
                    listener.dispose();
                }));
            }
            return profileStorage;
        }
        createProfileStorage(profile) {
            if (this.shutdownReason === 2 /* ShutdownReason.KILL */) {
                // Workaround for native crashes that we see when
                // SQLite DBs are being created even after shutdown
                // https://github.com/microsoft/vscode/issues/143186
                return new storageMain_1.InMemoryStorageMain(this.logService, this.fileService);
            }
            return new storageMain_1.ProfileStorageMain(profile, this.getStorageOptions(), this.logService, this.fileService);
        }
        workspaceStorage(workspace) {
            let workspaceStorage = this.mapWorkspaceToStorage.get(workspace.id);
            if (!workspaceStorage) {
                this.logService.trace(`StorageMainService: creating workspace storage (${workspace.id})`);
                workspaceStorage = this._register(this.createWorkspaceStorage(workspace));
                this.mapWorkspaceToStorage.set(workspace.id, workspaceStorage);
                this._register((0, functional_1.once)(workspaceStorage.onDidCloseStorage)(() => {
                    this.logService.trace(`StorageMainService: closed workspace storage (${workspace.id})`);
                    this.mapWorkspaceToStorage.delete(workspace.id);
                }));
            }
            return workspaceStorage;
        }
        createWorkspaceStorage(workspace) {
            if (this.shutdownReason === 2 /* ShutdownReason.KILL */) {
                // Workaround for native crashes that we see when
                // SQLite DBs are being created even after shutdown
                // https://github.com/microsoft/vscode/issues/143186
                return new storageMain_1.InMemoryStorageMain(this.logService, this.fileService);
            }
            return new storageMain_1.WorkspaceStorageMain(workspace, this.getStorageOptions(), this.logService, this.environmentService, this.fileService);
        }
        //#endregion
        isUsed(path) {
            const pathUri = uri_1.URI.file(path);
            for (const storage of [this.applicationStorage, ...this.mapProfileToStorage.values(), ...this.mapWorkspaceToStorage.values()]) {
                if (!storage.path) {
                    continue;
                }
                if (this.uriIdentityService.extUri.isEqualOrParent(uri_1.URI.file(storage.path), pathUri)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.StorageMainService = StorageMainService;
    exports.StorageMainService = StorageMainService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, userDataProfile_2.IUserDataProfilesMainService),
        __param(3, lifecycleMainService_1.ILifecycleMainService),
        __param(4, files_1.IFileService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], StorageMainService);
    //#endregion
    //#region Application Main Storage Service (intent: use application storage from main process)
    exports.IApplicationStorageMainService = (0, instantiation_1.createDecorator)('applicationStorageMainService');
    let ApplicationStorageMainService = class ApplicationStorageMainService extends storage_1.AbstractStorageService {
        constructor(userDataProfilesService, storageMainService) {
            super();
            this.userDataProfilesService = userDataProfilesService;
            this.storageMainService = storageMainService;
            this.whenReady = this.storageMainService.applicationStorage.whenInit;
        }
        doInitialize() {
            // application storage is being initialized as part
            // of the first window opening, so we do not trigger
            // it here but can join it
            return this.storageMainService.applicationStorage.whenInit;
        }
        getStorage(scope) {
            if (scope === -1 /* StorageScope.APPLICATION */) {
                return this.storageMainService.applicationStorage.storage;
            }
            return undefined; // any other scope is unsupported from main process
        }
        getLogDetails(scope) {
            if (scope === -1 /* StorageScope.APPLICATION */) {
                return this.userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
            }
            return undefined; // any other scope is unsupported from main process
        }
        shouldFlushWhenIdle() {
            return false; // not needed here, will be triggered from any window that is opened
        }
        switch() {
            throw new Error('Migrating storage is unsupported from main process');
        }
        switchToProfile() {
            throw new Error('Switching storage profile is unsupported from main process');
        }
        switchToWorkspace() {
            throw new Error('Switching storage workspace is unsupported from main process');
        }
        hasScope() {
            throw new Error('Main process is never profile or workspace scoped');
        }
    };
    exports.ApplicationStorageMainService = ApplicationStorageMainService;
    exports.ApplicationStorageMainService = ApplicationStorageMainService = __decorate([
        __param(0, userDataProfile_1.IUserDataProfilesService),
        __param(1, exports.IStorageMainService)
    ], ApplicationStorageMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZU1haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vc3RvcmFnZS9lbGVjdHJvbi1tYWluL3N0b3JhZ2VNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQmhHLGdJQUFnSTtJQUVuSCxRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQWtEdkYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQVNqRCxZQUNjLFVBQXdDLEVBQ2hDLGtCQUF3RCxFQUMvQyx1QkFBc0UsRUFDN0Usb0JBQTRELEVBQ3JFLFdBQTBDLEVBQ25DLGtCQUF3RDtZQUU3RSxLQUFLLEVBQUUsQ0FBQztZQVBzQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQThCO1lBQzVELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDcEQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDbEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQVh0RSxtQkFBYyxHQUErQixTQUFTLENBQUM7WUFFOUMsK0JBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBOEIsQ0FBQyxDQUFDO1lBQy9GLDhCQUF5QixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFrRjNFLDZCQUE2QjtZQUVwQix1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7WUFjOUUsWUFBWTtZQUVaLHlCQUF5QjtZQUVSLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUF5QyxDQUFDO1lB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