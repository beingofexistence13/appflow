/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/parts/storage/common/storage", "vs/platform/storage/common/storage", "vs/platform/storage/common/storageIpc", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, lifecycle_1, network_1, resources_1, storage_1, storage_2, storageIpc_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteStorageService = void 0;
    class RemoteStorageService extends storage_2.AbstractStorageService {
        constructor(initialWorkspace, initialProfiles, remoteService, environmentService) {
            super();
            this.initialWorkspace = initialWorkspace;
            this.initialProfiles = initialProfiles;
            this.remoteService = remoteService;
            this.environmentService = environmentService;
            this.applicationStorageProfile = this.initialProfiles.defaultProfile;
            this.applicationStorage = this.createApplicationStorage();
            this.profileStorageProfile = this.initialProfiles.currentProfile;
            this.profileStorageDisposables = this._register(new lifecycle_1.DisposableStore());
            this.profileStorage = this.createProfileStorage(this.profileStorageProfile);
            this.workspaceStorageId = this.initialWorkspace?.id;
            this.workspaceStorageDisposables = this._register(new lifecycle_1.DisposableStore());
            this.workspaceStorage = this.createWorkspaceStorage(this.initialWorkspace);
        }
        createApplicationStorage() {
            const storageDataBaseClient = this._register(new storageIpc_1.ApplicationStorageDatabaseClient(this.remoteService.getChannel('storage')));
            const applicationStorage = this._register(new storage_1.Storage(storageDataBaseClient));
            this._register(applicationStorage.onDidChangeStorage(e => this.emitDidChangeValue(-1 /* StorageScope.APPLICATION */, e)));
            return applicationStorage;
        }
        createProfileStorage(profile) {
            // First clear any previously associated disposables
            this.profileStorageDisposables.clear();
            // Remember profile associated to profile storage
            this.profileStorageProfile = profile;
            let profileStorage;
            if ((0, storage_2.isProfileUsingDefaultStorage)(profile)) {
                // If we are using default profile storage, the profile storage is
                // actually the same as application storage. As such we
                // avoid creating the storage library a second time on
                // the same DB.
                profileStorage = this.applicationStorage;
            }
            else {
                const storageDataBaseClient = this.profileStorageDisposables.add(new storageIpc_1.ProfileStorageDatabaseClient(this.remoteService.getChannel('storage'), profile));
                profileStorage = this.profileStorageDisposables.add(new storage_1.Storage(storageDataBaseClient));
            }
            this.profileStorageDisposables.add(profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0 /* StorageScope.PROFILE */, e)));
            return profileStorage;
        }
        createWorkspaceStorage(workspace) {
            // First clear any previously associated disposables
            this.workspaceStorageDisposables.clear();
            // Remember workspace ID for logging later
            this.workspaceStorageId = workspace?.id;
            let workspaceStorage = undefined;
            if (workspace) {
                const storageDataBaseClient = this.workspaceStorageDisposables.add(new storageIpc_1.WorkspaceStorageDatabaseClient(this.remoteService.getChannel('storage'), workspace));
                workspaceStorage = this.workspaceStorageDisposables.add(new storage_1.Storage(storageDataBaseClient));
                this.workspaceStorageDisposables.add(workspaceStorage.onDidChangeStorage(e => this.emitDidChangeValue(1 /* StorageScope.WORKSPACE */, e)));
            }
            return workspaceStorage;
        }
        async doInitialize() {
            // Init all storage locations
            await async_1.Promises.settled([
                this.applicationStorage.init(),
                this.profileStorage.init(),
                this.workspaceStorage?.init() ?? Promise.resolve()
            ]);
        }
        getStorage(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationStorage;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileStorage;
                default:
                    return this.workspaceStorage;
            }
        }
        getLogDetails(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationStorageProfile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileStorageProfile?.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
                default:
                    return this.workspaceStorageId ? `${(0, resources_1.joinPath)(this.environmentService.workspaceStorageHome, this.workspaceStorageId, 'state.vscdb').with({ scheme: network_1.Schemas.file }).fsPath}` : undefined;
            }
        }
        async close() {
            // Stop periodic scheduler and idle runner as we now collect state normally
            this.stopFlushWhenIdle();
            // Signal as event so that clients can still store data
            this.emitWillSaveState(storage_2.WillSaveStateReason.SHUTDOWN);
            // Do it
            await async_1.Promises.settled([
                this.applicationStorage.close(),
                this.profileStorage.close(),
                this.workspaceStorage?.close() ?? Promise.resolve()
            ]);
        }
        async switchToProfile(toProfile) {
            if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
                return;
            }
            const oldProfileStorage = this.profileStorage;
            const oldItems = oldProfileStorage.items;
            // Close old profile storage but only if this is
            // different from application storage!
            if (oldProfileStorage !== this.applicationStorage) {
                await oldProfileStorage.close();
            }
            // Create new profile storage & init
            this.profileStorage = this.createProfileStorage(toProfile);
            await this.profileStorage.init();
            // Handle data switch and eventing
            this.switchData(oldItems, this.profileStorage, 0 /* StorageScope.PROFILE */);
        }
        async switchToWorkspace(toWorkspace, preserveData) {
            const oldWorkspaceStorage = this.workspaceStorage;
            const oldItems = oldWorkspaceStorage?.items ?? new Map();
            // Close old workspace storage
            await oldWorkspaceStorage?.close();
            // Create new workspace storage & init
            this.workspaceStorage = this.createWorkspaceStorage(toWorkspace);
            await this.workspaceStorage.init();
            // Handle data switch and eventing
            this.switchData(oldItems, this.workspaceStorage, 1 /* StorageScope.WORKSPACE */);
        }
        hasScope(scope) {
            if ((0, userDataProfile_1.isUserDataProfile)(scope)) {
                return this.profileStorageProfile.id === scope.id;
            }
            return this.workspaceStorageId === scope.id;
        }
    }
    exports.RemoteStorageService = RemoteStorageService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9zdG9yYWdlL2NvbW1vbi9zdG9yYWdlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSxvQkFBcUIsU0FBUSxnQ0FBc0I7UUFhL0QsWUFDa0IsZ0JBQXFELEVBQ3JELGVBQXVGLEVBQ3ZGLGFBQTZCLEVBQzdCLGtCQUF1QztZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQUxTLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBcUM7WUFDckQsb0JBQWUsR0FBZixlQUFlLENBQXdFO1lBQ3ZGLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM3Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBZnhDLDhCQUF5QixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDO1lBQ2hFLHVCQUFrQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBRTlELDBCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDO1lBQ25ELDhCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUMzRSxtQkFBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUV2RSx1QkFBa0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUM3RSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFTOUUsQ0FBQztRQUVPLHdCQUF3QjtZQUMvQixNQUFNLHFC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