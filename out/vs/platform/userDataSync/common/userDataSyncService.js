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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/globalStateSync", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/userDataSync/common/settingsSync", "vs/platform/userDataSync/common/snippetsSync", "vs/platform/userDataSync/common/tasksSync", "vs/platform/userDataSync/common/userDataProfilesManifestSync", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, arrays_1, async_1, cancellation_1, errorMessage_1, event_1, lifecycle_1, resources_1, types_1, uuid_1, configuration_1, extensionManagement_1, files_1, instantiation_1, storage_1, telemetry_1, userDataProfile_1, extensionsSync_1, globalStateSync_1, keybindingsSync_1, settingsSync_1, snippetsSync_1, tasksSync_1, userDataProfilesManifestSync_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncService = void 0;
    const LAST_SYNC_TIME_KEY = 'sync.lastSyncTime';
    let UserDataSyncService = class UserDataSyncService extends lifecycle_1.Disposable {
        get status() { return this._status; }
        get conflicts() { return this._conflicts; }
        get lastSyncTime() { return this._lastSyncTime; }
        constructor(fileService, userDataSyncStoreService, userDataSyncStoreManagementService, instantiationService, logService, telemetryService, storageService, userDataSyncEnablementService, userDataProfilesService, userDataSyncResourceProviderService, userDataSyncLocalStoreService) {
            super();
            this.fileService = fileService;
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataSyncResourceProviderService = userDataSyncResourceProviderService;
            this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
            this._status = "uninitialized" /* SyncStatus.Uninitialized */;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this._onDidChangeLocal = this._register(new event_1.Emitter());
            this.onDidChangeLocal = this._onDidChangeLocal.event;
            this._conflicts = [];
            this._onDidChangeConflicts = this._register(new event_1.Emitter());
            this.onDidChangeConflicts = this._onDidChangeConflicts.event;
            this._syncErrors = [];
            this._onSyncErrors = this._register(new event_1.Emitter());
            this.onSyncErrors = this._onSyncErrors.event;
            this._lastSyncTime = undefined;
            this._onDidChangeLastSyncTime = this._register(new event_1.Emitter());
            this.onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
            this._onDidResetLocal = this._register(new event_1.Emitter());
            this.onDidResetLocal = this._onDidResetLocal.event;
            this._onDidResetRemote = this._register(new event_1.Emitter());
            this.onDidResetRemote = this._onDidResetRemote.event;
            this.activeProfileSynchronizers = new Map();
            this._status = userDataSyncStoreManagementService.userDataSyncStore ? "idle" /* SyncStatus.Idle */ : "uninitialized" /* SyncStatus.Uninitialized */;
            this._lastSyncTime = this.storageService.getNumber(LAST_SYNC_TIME_KEY, -1 /* StorageScope.APPLICATION */, undefined);
            this._register((0, lifecycle_1.toDisposable)(() => this.clearActiveProfileSynchronizers()));
        }
        async createSyncTask(manifest, disableCache) {
            this.checkEnablement();
            this.logService.info('Sync started.');
            const startTime = new Date().getTime();
            const executionId = (0, uuid_1.generateUuid)();
            try {
                const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
                if (disableCache) {
                    syncHeaders['Cache-Control'] = 'no-cache';
                }
                manifest = await this.userDataSyncStoreService.manifest(manifest, syncHeaders);
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
                reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
                throw userDataSyncError;
            }
            const executed = false;
            const that = this;
            let cancellablePromise;
            return {
                manifest,
                async run() {
                    if (executed) {
                        throw new Error('Can run a task only once');
                    }
                    cancellablePromise = (0, async_1.createCancelablePromise)(token => that.sync(manifest, false, executionId, token));
                    await cancellablePromise.finally(() => cancellablePromise = undefined);
                    that.logService.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                    that.updateLastSyncTime();
                },
                stop() {
                    cancellablePromise?.cancel();
                    return that.stop();
                }
            };
        }
        async createManualSyncTask() {
            this.checkEnablement();
            if (this.userDataSyncEnablementService.isEnabled()) {
                throw new userDataSync_1.UserDataSyncError('Cannot start manual sync when sync is enabled', "LocalError" /* UserDataSyncErrorCode.LocalError */);
            }
            this.logService.info('Sync started.');
            const startTime = new Date().getTime();
            const executionId = (0, uuid_1.generateUuid)();
            const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
            let manifest;
            try {
                manifest = await this.userDataSyncStoreService.manifest(null, syncHeaders);
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
                reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
                throw userDataSyncError;
            }
            /* Manual sync shall start on clean local state */
            await this.resetLocal();
            const that = this;
            const cancellableToken = new cancellation_1.CancellationTokenSource();
            return {
                id: executionId,
                async merge() {
                    return that.sync(manifest, true, executionId, cancellableToken.token);
                },
                async apply() {
                    try {
                        try {
                            await that.applyManualSync(manifest, executionId, cancellableToken.token);
                        }
                        catch (error) {
                            if (userDataSync_1.UserDataSyncError.toUserDataSyncError(error).code === "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */) {
                                that.logService.info('Client is making invalid requests. Cleaning up data...');
                                await that.cleanUpRemoteData();
                                that.logService.info('Applying manual sync again...');
                                await that.applyManualSync(manifest, executionId, cancellableToken.token);
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    catch (error) {
                        that.logService.error(error);
                        throw error;
                    }
                    that.logService.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                    that.updateLastSyncTime();
                },
                async stop() {
                    cancellableToken.cancel();
                    await that.stop();
                    await that.resetLocal();
                }
            };
        }
        async sync(manifest, merge, executionId, token) {
            this._syncErrors = [];
            try {
                if (this.status !== "hasConflicts" /* SyncStatus.HasConflicts */) {
                    this.setStatus("syncing" /* SyncStatus.Syncing */);
                }
                // Sync Default Profile First
                const defaultProfileSynchronizer = this.getOrCreateActiveProfileSynchronizer(this.userDataProfilesService.defaultProfile, undefined);
                this._syncErrors.push(...await this.syncProfile(defaultProfileSynchronizer, manifest, merge, executionId, token));
                // Sync other profiles
                const userDataProfileManifestSynchronizer = defaultProfileSynchronizer.enabled.find(s => s.resource === "profiles" /* SyncResource.Profiles */);
                if (userDataProfileManifestSynchronizer) {
                    const syncProfiles = (await userDataProfileManifestSynchronizer.getLastSyncedProfiles()) || [];
                    if (token.isCancellationRequested) {
                        return;
                    }
                    await this.syncRemoteProfiles(syncProfiles, manifest, merge, executionId, token);
                }
            }
            finally {
                this._onSyncErrors.fire(this._syncErrors);
            }
        }
        async syncRemoteProfiles(remoteProfiles, manifest, merge, executionId, token) {
            for (const syncProfile of remoteProfiles) {
                if (token.isCancellationRequested) {
                    return;
                }
                const profile = this.userDataProfilesService.profiles.find(p => p.id === syncProfile.id);
                if (!profile) {
                    this.logService.error(`Profile with id:${syncProfile.id} and name: ${syncProfile.name} does not exist locally to sync.`);
                    continue;
                }
                this.logService.info('Syncing profile.', syncProfile.name);
                const profileSynchronizer = this.getOrCreateActiveProfileSynchronizer(profile, syncProfile);
                this._syncErrors.push(...await this.syncProfile(profileSynchronizer, manifest, merge, executionId, token));
            }
            // Dispose & Delete profile synchronizers which do not exist anymore
            for (const [key, profileSynchronizerItem] of this.activeProfileSynchronizers.entries()) {
                if (this.userDataProfilesService.profiles.some(p => p.id === profileSynchronizerItem[0].profile.id)) {
                    continue;
                }
                profileSynchronizerItem[1].dispose();
                this.activeProfileSynchronizers.delete(key);
            }
        }
        async applyManualSync(manifest, executionId, token) {
            const profileSynchronizers = this.getActiveProfileSynchronizers();
            for (const profileSynchronizer of profileSynchronizers) {
                if (token.isCancellationRequested) {
                    return;
                }
                await profileSynchronizer.apply(executionId, token);
            }
            const defaultProfileSynchronizer = profileSynchronizers.find(s => s.profile.isDefault);
            if (!defaultProfileSynchronizer) {
                return;
            }
            const userDataProfileManifestSynchronizer = defaultProfileSynchronizer.enabled.find(s => s.resource === "profiles" /* SyncResource.Profiles */);
            if (!userDataProfileManifestSynchronizer) {
                return;
            }
            // Sync remote profiles which are not synced locally
            const remoteProfiles = (await userDataProfileManifestSynchronizer.getRemoteSyncedProfiles(manifest?.latest ?? null)) || [];
            const remoteProfilesToSync = remoteProfiles.filter(remoteProfile => profileSynchronizers.every(s => s.profile.id !== remoteProfile.id));
            if (remoteProfilesToSync.length) {
                await this.syncRemoteProfiles(remoteProfilesToSync, manifest, false, executionId, token);
            }
        }
        async syncProfile(profileSynchronizer, manifest, merge, executionId, token) {
            const errors = await profileSynchronizer.sync(manifest, merge, executionId, token);
            return errors.map(([syncResource, error]) => ({ profile: profileSynchronizer.profile, syncResource, error }));
        }
        async stop() {
            if (this.status !== "idle" /* SyncStatus.Idle */) {
                await Promise.allSettled(this.getActiveProfileSynchronizers().map(profileSynchronizer => profileSynchronizer.stop()));
            }
        }
        async resolveContent(resource) {
            const content = await this.userDataSyncResourceProviderService.resolveContent(resource);
            if (content) {
                return content;
            }
            for (const profileSynchronizer of this.getActiveProfileSynchronizers()) {
                for (const synchronizer of profileSynchronizer.enabled) {
                    const content = await synchronizer.resolveContent(resource);
                    if (content) {
                        return content;
                    }
                }
            }
            return null;
        }
        async replace(syncResourceHandle) {
            this.checkEnablement();
            const profileSyncResource = this.userDataSyncResourceProviderService.resolveUserDataSyncResource(syncResourceHandle);
            if (!profileSyncResource) {
                return;
            }
            const content = await this.resolveContent(syncResourceHandle.uri);
            if (!content) {
                return;
            }
            await this.performAction(profileSyncResource.profile, async (synchronizer) => {
                if (profileSyncResource.syncResource === synchronizer.resource) {
                    await synchronizer.replace(content);
                    return true;
                }
                return undefined;
            });
            return;
        }
        async accept(syncResource, resource, content, apply) {
            this.checkEnablement();
            await this.performAction(syncResource.profile, async (synchronizer) => {
                if (syncResource.syncResource === synchronizer.resource) {
                    await synchronizer.accept(resource, content);
                    if (apply) {
                        await synchronizer.apply((0, types_1.isBoolean)(apply) ? false : apply.force, (0, userDataSync_1.createSyncHeaders)((0, uuid_1.generateUuid)()));
                    }
                    return true;
                }
                return undefined;
            });
        }
        async hasLocalData() {
            const result = await this.performAction(this.userDataProfilesService.defaultProfile, async (synchronizer) => {
                // skip global state synchronizer
                if (synchronizer.resource !== "globalState" /* SyncResource.GlobalState */ && await synchronizer.hasLocalData()) {
                    return true;
                }
                return undefined;
            });
            return !!result;
        }
        async hasPreviouslySynced() {
            const result = await this.performAction(this.userDataProfilesService.defaultProfile, async (synchronizer) => {
                if (await synchronizer.hasPreviouslySynced()) {
                    return true;
                }
                return undefined;
            });
            return !!result;
        }
        async reset() {
            this.checkEnablement();
            await this.resetRemote();
            await this.resetLocal();
        }
        async resetRemote() {
            this.checkEnablement();
            try {
                await this.userDataSyncStoreService.clear();
                this.logService.info('Cleared data on server');
            }
            catch (e) {
                this.logService.error(e);
            }
            this._onDidResetRemote.fire();
        }
        async resetLocal() {
            this.checkEnablement();
            this._lastSyncTime = undefined;
            this.storageService.remove(LAST_SYNC_TIME_KEY, -1 /* StorageScope.APPLICATION */);
            for (const [synchronizer] of this.activeProfileSynchronizers.values()) {
                try {
                    await synchronizer.resetLocal();
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            this.clearActiveProfileSynchronizers();
            this._onDidResetLocal.fire();
            this.logService.info('Did reset the local sync state.');
        }
        async cleanUpRemoteData() {
            const remoteProfiles = await this.userDataSyncResourceProviderService.getRemoteSyncedProfiles();
            const remoteProfileCollections = remoteProfiles.map(profile => profile.collection);
            const allCollections = await this.userDataSyncStoreService.getAllCollections();
            const redundantCollections = allCollections.filter(c => !remoteProfileCollections.includes(c));
            if (redundantCollections.length) {
                this.logService.info(`Deleting ${redundantCollections.length} redundant collections on server`);
                await Promise.allSettled(redundantCollections.map(collectionId => this.userDataSyncStoreService.deleteCollection(collectionId)));
                this.logService.info(`Deleted redundant collections on server`);
            }
            const updatedRemoteProfiles = remoteProfiles.filter(profile => allCollections.includes(profile.collection));
            if (updatedRemoteProfiles.length !== remoteProfiles.length) {
                const profileManifestSynchronizer = this.instantiationService.createInstance(userDataProfilesManifestSync_1.UserDataProfilesManifestSynchroniser, this.userDataProfilesService.defaultProfile, undefined);
                try {
                    this.logService.info('Resetting the last synced state of profiles');
                    await profileManifestSynchronizer.resetLocal();
                    this.logService.info('Did reset the last synced state of profiles');
                    this.logService.info(`Updating remote profiles with invalid collections on server`);
                    await profileManifestSynchronizer.updateRemoteProfiles(updatedRemoteProfiles, null);
                    this.logService.info(`Updated remote profiles on server`);
                }
                finally {
                    profileManifestSynchronizer.dispose();
                }
            }
        }
        async saveRemoteActivityData(location) {
            this.checkEnablement();
            const data = await this.userDataSyncStoreService.getActivityData();
            await this.fileService.writeFile(location, data);
        }
        async extractActivityData(activityDataResource, location) {
            const content = (await this.fileService.readFile(activityDataResource)).value.toString();
            const activityData = JSON.parse(content);
            if (activityData.resources) {
                for (const resource in activityData.resources) {
                    for (const version of activityData.resources[resource]) {
                        await this.userDataSyncLocalStoreService.writeResource(resource, version.content, new Date(version.created * 1000), undefined, location);
                    }
                }
            }
            if (activityData.collections) {
                for (const collection in activityData.collections) {
                    for (const resource in activityData.collections[collection].resources) {
                        for (const version of activityData.collections[collection].resources?.[resource] ?? []) {
                            await this.userDataSyncLocalStoreService.writeResource(resource, version.content, new Date(version.created * 1000), collection, location);
                        }
                    }
                }
            }
        }
        async performAction(profile, action) {
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const activeProfileSyncronizer = this.activeProfileSynchronizers.get(profile.id);
                if (activeProfileSyncronizer) {
                    const result = await this.performActionWithProfileSynchronizer(activeProfileSyncronizer[0], action, disposables);
                    return (0, types_1.isUndefined)(result) ? null : result;
                }
                if (profile.isDefault) {
                    const defaultProfileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, profile, undefined));
                    const result = await this.performActionWithProfileSynchronizer(defaultProfileSynchronizer, action, disposables);
                    return (0, types_1.isUndefined)(result) ? null : result;
                }
                if (this.userDataProfilesService.isEnabled()) {
                    return null;
                }
                const userDataProfileManifestSynchronizer = disposables.add(this.instantiationService.createInstance(userDataProfilesManifestSync_1.UserDataProfilesManifestSynchroniser, profile, undefined));
                const manifest = await this.userDataSyncStoreService.manifest(null);
                const syncProfiles = (await userDataProfileManifestSynchronizer.getRemoteSyncedProfiles(manifest?.latest ?? null)) || [];
                const syncProfile = syncProfiles.find(syncProfile => syncProfile.id === profile.id);
                if (syncProfile) {
                    const profileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, profile, syncProfile.collection));
                    const result = await this.performActionWithProfileSynchronizer(profileSynchronizer, action, disposables);
                    return (0, types_1.isUndefined)(result) ? null : result;
                }
                return null;
            }
            finally {
                disposables.dispose();
            }
        }
        async performActionWithProfileSynchronizer(profileSynchronizer, action, disposables) {
            const allSynchronizers = [...profileSynchronizer.enabled, ...profileSynchronizer.disabled.reduce((synchronizers, syncResource) => {
                    if (syncResource !== "workspaceState" /* SyncResource.WorkspaceState */) {
                        synchronizers.push(disposables.add(profileSynchronizer.createSynchronizer(syncResource)));
                    }
                    return synchronizers;
                }, [])];
            for (const synchronizer of allSynchronizers) {
                const result = await action(synchronizer);
                if (!(0, types_1.isUndefined)(result)) {
                    return result;
                }
            }
            return undefined;
        }
        setStatus(status) {
            const oldStatus = this._status;
            if (this._status !== status) {
                this._status = status;
                this._onDidChangeStatus.fire(status);
                if (oldStatus === "hasConflicts" /* SyncStatus.HasConflicts */) {
                    this.updateLastSyncTime();
                }
            }
        }
        updateConflicts() {
            const conflicts = this.getActiveProfileSynchronizers().map(synchronizer => synchronizer.conflicts).flat();
            if (!(0, arrays_1.equals)(this._conflicts, conflicts, (a, b) => a.profile.id === b.profile.id && a.syncResource === b.syncResource && (0, arrays_1.equals)(a.conflicts, b.conflicts, (a, b) => (0, resources_1.isEqual)(a.previewResource, b.previewResource)))) {
                this._conflicts = conflicts;
                this._onDidChangeConflicts.fire(conflicts);
            }
        }
        updateLastSyncTime() {
            if (this.status === "idle" /* SyncStatus.Idle */) {
                this._lastSyncTime = new Date().getTime();
                this.storageService.store(LAST_SYNC_TIME_KEY, this._lastSyncTime, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this._onDidChangeLastSyncTime.fire(this._lastSyncTime);
            }
        }
        getOrCreateActiveProfileSynchronizer(profile, syncProfile) {
            let activeProfileSynchronizer = this.activeProfileSynchronizers.get(profile.id);
            if (activeProfileSynchronizer && activeProfileSynchronizer[0].collection !== syncProfile?.collection) {
                this.logService.error('Profile synchronizer collection does not match with the remote sync profile collection');
                activeProfileSynchronizer[1].dispose();
                activeProfileSynchronizer = undefined;
                this.activeProfileSynchronizers.delete(profile.id);
            }
            if (!activeProfileSynchronizer) {
                const disposables = new lifecycle_1.DisposableStore();
                const profileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, profile, syncProfile?.collection));
                disposables.add(profileSynchronizer.onDidChangeStatus(e => this.setStatus(e)));
                disposables.add(profileSynchronizer.onDidChangeConflicts(conflicts => this.updateConflicts()));
                disposables.add(profileSynchronizer.onDidChangeLocal(e => this._onDidChangeLocal.fire(e)));
                this.activeProfileSynchronizers.set(profile.id, activeProfileSynchronizer = [profileSynchronizer, disposables]);
            }
            return activeProfileSynchronizer[0];
        }
        getActiveProfileSynchronizers() {
            const profileSynchronizers = [];
            for (const [profileSynchronizer] of this.activeProfileSynchronizers.values()) {
                profileSynchronizers.push(profileSynchronizer);
            }
            return profileSynchronizers;
        }
        clearActiveProfileSynchronizers() {
            this.activeProfileSynchronizers.forEach(([, disposable]) => disposable.dispose());
            this.activeProfileSynchronizers.clear();
        }
        checkEnablement() {
            if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
                throw new Error('Not enabled');
            }
        }
    };
    exports.UserDataSyncService = UserDataSyncService;
    exports.UserDataSyncService = UserDataSyncService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, userDataSync_1.IUserDataSyncStoreService),
        __param(2, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, userDataSync_1.IUserDataSyncLogService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, storage_1.IStorageService),
        __param(7, userDataSync_1.IUserDataSyncEnablementService),
        __param(8, userDataProfile_1.IUserDataProfilesService),
        __param(9, userDataSync_1.IUserDataSyncResourceProviderService),
        __param(10, userDataSync_1.IUserDataSyncLocalStoreService)
    ], UserDataSyncService);
    let ProfileSynchronizer = class ProfileSynchronizer extends lifecycle_1.Disposable {
        get enabled() { return this._enabled.sort((a, b) => a[1] - b[1]).map(([synchronizer]) => synchronizer); }
        get disabled() { return userDataSync_1.ALL_SYNC_RESOURCES.filter(syncResource => !this.userDataSyncEnablementService.isResourceEnabled(syncResource)); }
        get status() { return this._status; }
        get conflicts() { return this._conflicts; }
        constructor(profile, collection, userDataSyncEnablementService, instantiationService, extensionGalleryService, userDataSyncStoreManagementService, telemetryService, logService, userDataProfilesService, configurationService) {
            super();
            this.profile = profile;
            this.collection = collection;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.instantiationService = instantiationService;
            this.extensionGalleryService = extensionGalleryService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.userDataProfilesService = userDataProfilesService;
            this.configurationService = configurationService;
            this._enabled = [];
            this._status = "idle" /* SyncStatus.Idle */;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this._onDidChangeLocal = this._register(new event_1.Emitter());
            this.onDidChangeLocal = this._onDidChangeLocal.event;
            this._conflicts = [];
            this._onDidChangeConflicts = this._register(new event_1.Emitter());
            this.onDidChangeConflicts = this._onDidChangeConflicts.event;
            this._register(userDataSyncEnablementService.onDidChangeResourceEnablement(([syncResource, enablement]) => this.onDidChangeResourceEnablement(syncResource, enablement)));
            this._register((0, lifecycle_1.toDisposable)(() => this._enabled.splice(0, this._enabled.length).forEach(([, , disposable]) => disposable.dispose())));
            for (const syncResource of userDataSync_1.ALL_SYNC_RESOURCES) {
                if (userDataSyncEnablementService.isResourceEnabled(syncResource)) {
                    this.registerSynchronizer(syncResource);
                }
            }
        }
        onDidChangeResourceEnablement(syncResource, enabled) {
            if (enabled) {
                this.registerSynchronizer(syncResource);
            }
            else {
                this.deRegisterSynchronizer(syncResource);
            }
        }
        registerSynchronizer(syncResource) {
            if (this._enabled.some(([synchronizer]) => synchronizer.resource === syncResource)) {
                return;
            }
            if (syncResource === "extensions" /* SyncResource.Extensions */ && !this.extensionGalleryService.isEnabled()) {
                this.logService.info('Skipping extensions sync because gallery is not configured');
                return;
            }
            if (syncResource === "profiles" /* SyncResource.Profiles */) {
                if (!this.profile.isDefault) {
                    return;
                }
                if (!this.userDataProfilesService.isEnabled()) {
                    return;
                }
            }
            if (syncResource === "workspaceState" /* SyncResource.WorkspaceState */) {
                return;
            }
            if (syncResource !== "profiles" /* SyncResource.Profiles */ && this.profile.useDefaultFlags?.[syncResource]) {
                this.logService.debug(`Skipping syncing ${syncResource} in ${this.profile.name} because it is already synced by default profile`);
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            const synchronizer = disposables.add(this.createSynchronizer(syncResource));
            disposables.add(synchronizer.onDidChangeStatus(() => this.updateStatus()));
            disposables.add(synchronizer.onDidChangeConflicts(() => this.updateConflicts()));
            disposables.add(synchronizer.onDidChangeLocal(() => this._onDidChangeLocal.fire(syncResource)));
            const order = this.getOrder(syncResource);
            this._enabled.push([synchronizer, order, disposables]);
        }
        deRegisterSynchronizer(syncResource) {
            const index = this._enabled.findIndex(([synchronizer]) => synchronizer.resource === syncResource);
            if (index !== -1) {
                const [[synchronizer, , disposable]] = this._enabled.splice(index, 1);
                disposable.dispose();
                this.updateStatus();
                Promise.allSettled([synchronizer.stop(), synchronizer.resetLocal()])
                    .then(null, error => this.logService.error(error));
            }
        }
        createSynchronizer(syncResource) {
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return this.instantiationService.createInstance(settingsSync_1.SettingsSynchroniser, this.profile, this.collection);
                case "keybindings" /* SyncResource.Keybindings */: return this.instantiationService.createInstance(keybindingsSync_1.KeybindingsSynchroniser, this.profile, this.collection);
                case "snippets" /* SyncResource.Snippets */: return this.instantiationService.createInstance(snippetsSync_1.SnippetsSynchroniser, this.profile, this.collection);
                case "tasks" /* SyncResource.Tasks */: return this.instantiationService.createInstance(tasksSync_1.TasksSynchroniser, this.profile, this.collection);
                case "globalState" /* SyncResource.GlobalState */: return this.instantiationService.createInstance(globalStateSync_1.GlobalStateSynchroniser, this.profile, this.collection);
                case "extensions" /* SyncResource.Extensions */: return this.instantiationService.createInstance(extensionsSync_1.ExtensionsSynchroniser, this.profile, this.collection);
                case "profiles" /* SyncResource.Profiles */: return this.instantiationService.createInstance(userDataProfilesManifestSync_1.UserDataProfilesManifestSynchroniser, this.profile, this.collection);
            }
        }
        async sync(manifest, merge, executionId, token) {
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return [];
            }
            const synchronizers = this.enabled;
            if (!synchronizers.length) {
                return [];
            }
            try {
                const syncErrors = [];
                const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
                const resourceManifest = (this.collection ? manifest?.collections?.[this.collection]?.latest : manifest?.latest) ?? null;
                const userDataSyncConfiguration = merge ? await this.getUserDataSyncConfiguration(resourceManifest) : {};
                for (const synchroniser of synchronizers) {
                    // Return if cancellation is requested
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    // Return if resource is not enabled
                    if (!this.userDataSyncEnablementService.isResourceEnabled(synchroniser.resource)) {
                        return [];
                    }
                    try {
                        if (merge) {
                            const preview = await synchroniser.preview(resourceManifest, userDataSyncConfiguration, syncHeaders);
                            if (preview) {
                                for (const resourcePreview of preview.resourcePreviews) {
                                    if ((resourcePreview.localChange !== 0 /* Change.None */ || resourcePreview.remoteChange !== 0 /* Change.None */) && resourcePreview.mergeState === "preview" /* MergeState.Preview */) {
                                        await synchroniser.merge(resourcePreview.previewResource);
                                    }
                                }
                            }
                        }
                        else {
                            await synchroniser.sync(resourceManifest, syncHeaders);
                        }
                    }
                    catch (e) {
                        const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(e);
                        reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
                        if (canBailout(e)) {
                            throw userDataSyncError;
                        }
                        // Log and and continue
                        this.logService.error(e);
                        this.logService.error(`${synchroniser.resource}: ${(0, errorMessage_1.toErrorMessage)(e)}`);
                        syncErrors.push([synchroniser.resource, userDataSyncError]);
                    }
                }
                return syncErrors;
            }
            finally {
                this.updateStatus();
            }
        }
        async apply(executionId, token) {
            const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
            for (const synchroniser of this.enabled) {
                if (token.isCancellationRequested) {
                    return;
                }
                try {
                    await synchroniser.apply(false, syncHeaders);
                }
                catch (e) {
                    const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(e);
                    reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
                    if (canBailout(e)) {
                        throw userDataSyncError;
                    }
                    // Log and and continue
                    this.logService.error(e);
                    this.logService.error(`${synchroniser.resource}: ${(0, errorMessage_1.toErrorMessage)(e)}`);
                }
            }
        }
        async stop() {
            for (const synchroniser of this.enabled) {
                try {
                    if (synchroniser.status !== "idle" /* SyncStatus.Idle */) {
                        await synchroniser.stop();
                    }
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
        }
        async resetLocal() {
            for (const synchroniser of this.enabled) {
                try {
                    await synchroniser.resetLocal();
                }
                catch (e) {
                    this.logService.error(`${synchroniser.resource}: ${(0, errorMessage_1.toErrorMessage)(e)}`);
                    this.logService.error(e);
                }
            }
        }
        async getUserDataSyncConfiguration(manifest) {
            if (!this.profile.isDefault) {
                return {};
            }
            const local = this.configurationService.getValue(userDataSync_1.USER_DATA_SYNC_CONFIGURATION_SCOPE);
            const settingsSynchronizer = this.enabled.find(synchronizer => synchronizer instanceof settingsSync_1.SettingsSynchroniser);
            if (settingsSynchronizer) {
                const remote = await settingsSynchronizer.getRemoteUserDataSyncConfiguration(manifest);
                return { ...local, ...remote };
            }
            return local;
        }
        setStatus(status) {
            if (this._status !== status) {
                this._status = status;
                this._onDidChangeStatus.fire(status);
            }
        }
        updateStatus() {
            this.updateConflicts();
            if (this.enabled.some(s => s.status === "hasConflicts" /* SyncStatus.HasConflicts */)) {
                return this.setStatus("hasConflicts" /* SyncStatus.HasConflicts */);
            }
            if (this.enabled.some(s => s.status === "syncing" /* SyncStatus.Syncing */)) {
                return this.setStatus("syncing" /* SyncStatus.Syncing */);
            }
            return this.setStatus("idle" /* SyncStatus.Idle */);
        }
        updateConflicts() {
            const conflicts = this.enabled.filter(s => s.status === "hasConflicts" /* SyncStatus.HasConflicts */)
                .filter(s => s.conflicts.conflicts.length > 0)
                .map(s => s.conflicts);
            if (!(0, arrays_1.equals)(this._conflicts, conflicts, (a, b) => a.syncResource === b.syncResource && (0, arrays_1.equals)(a.conflicts, b.conflicts, (a, b) => (0, resources_1.isEqual)(a.previewResource, b.previewResource)))) {
                this._conflicts = conflicts;
                this._onDidChangeConflicts.fire(conflicts);
            }
        }
        getOrder(syncResource) {
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return 0;
                case "keybindings" /* SyncResource.Keybindings */: return 1;
                case "snippets" /* SyncResource.Snippets */: return 2;
                case "tasks" /* SyncResource.Tasks */: return 3;
                case "globalState" /* SyncResource.GlobalState */: return 4;
                case "extensions" /* SyncResource.Extensions */: return 5;
                case "profiles" /* SyncResource.Profiles */: return 6;
                case "workspaceState" /* SyncResource.WorkspaceState */: return 7;
            }
        }
    };
    ProfileSynchronizer = __decorate([
        __param(2, userDataSync_1.IUserDataSyncEnablementService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, extensionManagement_1.IExtensionGalleryService),
        __param(5, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, userDataSync_1.IUserDataSyncLogService),
        __param(8, userDataProfile_1.IUserDataProfilesService),
        __param(9, configuration_1.IConfigurationService)
    ], ProfileSynchronizer);
    function canBailout(e) {
        if (e instanceof userDataSync_1.UserDataSyncError) {
            switch (e.code) {
                case "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */:
                case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                case "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */:
                case "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */:
                case "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */:
                case "LocalTooManyProfiles" /* UserDataSyncErrorCode.LocalTooManyProfiles */:
                case "Gone" /* UserDataSyncErrorCode.Gone */:
                case "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */:
                case "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */:
                case "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */:
                    return true;
            }
        }
        return false;
    }
    function reportUserDataSyncError(userDataSyncError, executionId, userDataSyncStoreManagementService, telemetryService) {
        telemetryService.publicLog2('sync/error', {
            code: userDataSyncError.code,
            serverCode: userDataSyncError instanceof userDataSync_1.UserDataSyncStoreError ? String(userDataSyncError.serverCode) : undefined,
            url: userDataSyncError instanceof userDataSync_1.UserDataSyncStoreError ? userDataSyncError.url : undefined,
            resource: userDataSyncError.resource,
            executionId,
            service: userDataSyncStoreManagementService.userDataSyncStore.url.toString()
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vdXNlckRhdGFTeW5jU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0Q2hHLE1BQU0sa0JBQWtCLEdBQUcsbUJBQW1CLENBQUM7SUFFeEMsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQUtsRCxJQUFJLE1BQU0sS0FBaUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQVFqRCxJQUFJLFNBQVMsS0FBdUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQVM3RSxJQUFJLFlBQVksS0FBeUIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQVlyRSxZQUNlLFdBQTBDLEVBQzdCLHdCQUFvRSxFQUMxRCxrQ0FBd0YsRUFDdEcsb0JBQTRELEVBQzFELFVBQW9ELEVBQzFELGdCQUFvRCxFQUN0RCxjQUFnRCxFQUNqQyw2QkFBOEUsRUFDcEYsdUJBQWtFLEVBQ3RELG1DQUEwRixFQUNoRyw2QkFBOEU7WUFFOUcsS0FBSyxFQUFFLENBQUM7WUFadUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDWiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBQ3pDLHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7WUFDckYseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtZQUN6QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3JDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNoQixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQ25FLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FB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