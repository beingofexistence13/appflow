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
    exports.$K4b = void 0;
    const LAST_SYNC_TIME_KEY = 'sync.lastSyncTime';
    let $K4b = class $K4b extends lifecycle_1.$kc {
        get status() { return this.f; }
        get conflicts() { return this.j; }
        get lastSyncTime() { return this.t; }
        constructor(C, D, F, G, H, I, J, L, M, N, O) {
            super();
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.f = "uninitialized" /* SyncStatus.Uninitialized */;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeStatus = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeLocal = this.h.event;
            this.j = [];
            this.m = this.B(new event_1.$fd());
            this.onDidChangeConflicts = this.m.event;
            this.n = [];
            this.r = this.B(new event_1.$fd());
            this.onSyncErrors = this.r.event;
            this.t = undefined;
            this.u = this.B(new event_1.$fd());
            this.onDidChangeLastSyncTime = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidResetLocal = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onDidResetRemote = this.y.event;
            this.z = new Map();
            this.f = F.userDataSyncStore ? "idle" /* SyncStatus.Idle */ : "uninitialized" /* SyncStatus.Uninitialized */;
            this.t = this.J.getNumber(LAST_SYNC_TIME_KEY, -1 /* StorageScope.APPLICATION */, undefined);
            this.B((0, lifecycle_1.$ic)(() => this.bb()));
        }
        async createSyncTask(manifest, disableCache) {
            this.cb();
            this.H.info('Sync started.');
            const startTime = new Date().getTime();
            const executionId = (0, uuid_1.$4f)();
            try {
                const syncHeaders = (0, userDataSync_1.$Jgb)(executionId);
                if (disableCache) {
                    syncHeaders['Cache-Control'] = 'no-cache';
                }
                manifest = await this.D.manifest(manifest, syncHeaders);
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.$Kgb.toUserDataSyncError(error);
                reportUserDataSyncError(userDataSyncError, executionId, this.F, this.I);
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
                    cancellablePromise = (0, async_1.$ug)(token => that.P(manifest, false, executionId, token));
                    await cancellablePromise.finally(() => cancellablePromise = undefined);
                    that.H.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                    that.$();
                },
                stop() {
                    cancellablePromise?.cancel();
                    return that.U();
                }
            };
        }
        async createManualSyncTask() {
            this.cb();
            if (this.L.isEnabled()) {
                throw new userDataSync_1.$Kgb('Cannot start manual sync when sync is enabled', "LocalError" /* UserDataSyncErrorCode.LocalError */);
            }
            this.H.info('Sync started.');
            const startTime = new Date().getTime();
            const executionId = (0, uuid_1.$4f)();
            const syncHeaders = (0, userDataSync_1.$Jgb)(executionId);
            let manifest;
            try {
                manifest = await this.D.manifest(null, syncHeaders);
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.$Kgb.toUserDataSyncError(error);
                reportUserDataSyncError(userDataSyncError, executionId, this.F, this.I);
                throw userDataSyncError;
            }
            /* Manual sync shall start on clean local state */
            await this.resetLocal();
            const that = this;
            const cancellableToken = new cancellation_1.$pd();
            return {
                id: executionId,
                async merge() {
                    return that.P(manifest, true, executionId, cancellableToken.token);
                },
                async apply() {
                    try {
                        try {
                            await that.R(manifest, executionId, cancellableToken.token);
                        }
                        catch (error) {
                            if (userDataSync_1.$Kgb.toUserDataSyncError(error).code === "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */) {
                                that.H.info('Client is making invalid requests. Cleaning up data...');
                                await that.cleanUpRemoteData();
                                that.H.info('Applying manual sync again...');
                                await that.R(manifest, executionId, cancellableToken.token);
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    catch (error) {
                        that.H.error(error);
                        throw error;
                    }
                    that.H.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                    that.$();
                },
                async stop() {
                    cancellableToken.cancel();
                    await that.U();
                    await that.resetLocal();
                }
            };
        }
        async P(manifest, merge, executionId, token) {
            this.n = [];
            try {
                if (this.status !== "hasConflicts" /* SyncStatus.HasConflicts */) {
                    this.Y("syncing" /* SyncStatus.Syncing */);
                }
                // Sync Default Profile First
                const defaultProfileSynchronizer = this.getOrCreateActiveProfileSynchronizer(this.M.defaultProfile, undefined);
                this.n.push(...await this.S(defaultProfileSynchronizer, manifest, merge, executionId, token));
                // Sync other profiles
                const userDataProfileManifestSynchronizer = defaultProfileSynchronizer.enabled.find(s => s.resource === "profiles" /* SyncResource.Profiles */);
                if (userDataProfileManifestSynchronizer) {
                    const syncProfiles = (await userDataProfileManifestSynchronizer.getLastSyncedProfiles()) || [];
                    if (token.isCancellationRequested) {
                        return;
                    }
                    await this.Q(syncProfiles, manifest, merge, executionId, token);
                }
            }
            finally {
                this.r.fire(this.n);
            }
        }
        async Q(remoteProfiles, manifest, merge, executionId, token) {
            for (const syncProfile of remoteProfiles) {
                if (token.isCancellationRequested) {
                    return;
                }
                const profile = this.M.profiles.find(p => p.id === syncProfile.id);
                if (!profile) {
                    this.H.error(`Profile with id:${syncProfile.id} and name: ${syncProfile.name} does not exist locally to sync.`);
                    continue;
                }
                this.H.info('Syncing profile.', syncProfile.name);
                const profileSynchronizer = this.getOrCreateActiveProfileSynchronizer(profile, syncProfile);
                this.n.push(...await this.S(profileSynchronizer, manifest, merge, executionId, token));
            }
            // Dispose & Delete profile synchronizers which do not exist anymore
            for (const [key, profileSynchronizerItem] of this.z.entries()) {
                if (this.M.profiles.some(p => p.id === profileSynchronizerItem[0].profile.id)) {
                    continue;
                }
                profileSynchronizerItem[1].dispose();
                this.z.delete(key);
            }
        }
        async R(manifest, executionId, token) {
            const profileSynchronizers = this.ab();
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
                await this.Q(remoteProfilesToSync, manifest, false, executionId, token);
            }
        }
        async S(profileSynchronizer, manifest, merge, executionId, token) {
            const errors = await profileSynchronizer.sync(manifest, merge, executionId, token);
            return errors.map(([syncResource, error]) => ({ profile: profileSynchronizer.profile, syncResource, error }));
        }
        async U() {
            if (this.status !== "idle" /* SyncStatus.Idle */) {
                await Promise.allSettled(this.ab().map(profileSynchronizer => profileSynchronizer.stop()));
            }
        }
        async resolveContent(resource) {
            const content = await this.N.resolveContent(resource);
            if (content) {
                return content;
            }
            for (const profileSynchronizer of this.ab()) {
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
            this.cb();
            const profileSyncResource = this.N.resolveUserDataSyncResource(syncResourceHandle);
            if (!profileSyncResource) {
                return;
            }
            const content = await this.resolveContent(syncResourceHandle.uri);
            if (!content) {
                return;
            }
            await this.W(profileSyncResource.profile, async (synchronizer) => {
                if (profileSyncResource.syncResource === synchronizer.resource) {
                    await synchronizer.replace(content);
                    return true;
                }
                return undefined;
            });
            return;
        }
        async accept(syncResource, resource, content, apply) {
            this.cb();
            await this.W(syncResource.profile, async (synchronizer) => {
                if (syncResource.syncResource === synchronizer.resource) {
                    await synchronizer.accept(resource, content);
                    if (apply) {
                        await synchronizer.apply((0, types_1.$pf)(apply) ? false : apply.force, (0, userDataSync_1.$Jgb)((0, uuid_1.$4f)()));
                    }
                    return true;
                }
                return undefined;
            });
        }
        async hasLocalData() {
            const result = await this.W(this.M.defaultProfile, async (synchronizer) => {
                // skip global state synchronizer
                if (synchronizer.resource !== "globalState" /* SyncResource.GlobalState */ && await synchronizer.hasLocalData()) {
                    return true;
                }
                return undefined;
            });
            return !!result;
        }
        async hasPreviouslySynced() {
            const result = await this.W(this.M.defaultProfile, async (synchronizer) => {
                if (await synchronizer.hasPreviouslySynced()) {
                    return true;
                }
                return undefined;
            });
            return !!result;
        }
        async reset() {
            this.cb();
            await this.resetRemote();
            await this.resetLocal();
        }
        async resetRemote() {
            this.cb();
            try {
                await this.D.clear();
                this.H.info('Cleared data on server');
            }
            catch (e) {
                this.H.error(e);
            }
            this.y.fire();
        }
        async resetLocal() {
            this.cb();
            this.t = undefined;
            this.J.remove(LAST_SYNC_TIME_KEY, -1 /* StorageScope.APPLICATION */);
            for (const [synchronizer] of this.z.values()) {
                try {
                    await synchronizer.resetLocal();
                }
                catch (e) {
                    this.H.error(e);
                }
            }
            this.bb();
            this.w.fire();
            this.H.info('Did reset the local sync state.');
        }
        async cleanUpRemoteData() {
            const remoteProfiles = await this.N.getRemoteSyncedProfiles();
            const remoteProfileCollections = remoteProfiles.map(profile => profile.collection);
            const allCollections = await this.D.getAllCollections();
            const redundantCollections = allCollections.filter(c => !remoteProfileCollections.includes(c));
            if (redundantCollections.length) {
                this.H.info(`Deleting ${redundantCollections.length} redundant collections on server`);
                await Promise.allSettled(redundantCollections.map(collectionId => this.D.deleteCollection(collectionId)));
                this.H.info(`Deleted redundant collections on server`);
            }
            const updatedRemoteProfiles = remoteProfiles.filter(profile => allCollections.includes(profile.collection));
            if (updatedRemoteProfiles.length !== remoteProfiles.length) {
                const profileManifestSynchronizer = this.G.createInstance(userDataProfilesManifestSync_1.$H4b, this.M.defaultProfile, undefined);
                try {
                    this.H.info('Resetting the last synced state of profiles');
                    await profileManifestSynchronizer.resetLocal();
                    this.H.info('Did reset the last synced state of profiles');
                    this.H.info(`Updating remote profiles with invalid collections on server`);
                    await profileManifestSynchronizer.updateRemoteProfiles(updatedRemoteProfiles, null);
                    this.H.info(`Updated remote profiles on server`);
                }
                finally {
                    profileManifestSynchronizer.dispose();
                }
            }
        }
        async saveRemoteActivityData(location) {
            this.cb();
            const data = await this.D.getActivityData();
            await this.C.writeFile(location, data);
        }
        async extractActivityData(activityDataResource, location) {
            const content = (await this.C.readFile(activityDataResource)).value.toString();
            const activityData = JSON.parse(content);
            if (activityData.resources) {
                for (const resource in activityData.resources) {
                    for (const version of activityData.resources[resource]) {
                        await this.O.writeResource(resource, version.content, new Date(version.created * 1000), undefined, location);
                    }
                }
            }
            if (activityData.collections) {
                for (const collection in activityData.collections) {
                    for (const resource in activityData.collections[collection].resources) {
                        for (const version of activityData.collections[collection].resources?.[resource] ?? []) {
                            await this.O.writeResource(resource, version.content, new Date(version.created * 1000), collection, location);
                        }
                    }
                }
            }
        }
        async W(profile, action) {
            const disposables = new lifecycle_1.$jc();
            try {
                const activeProfileSyncronizer = this.z.get(profile.id);
                if (activeProfileSyncronizer) {
                    const result = await this.X(activeProfileSyncronizer[0], action, disposables);
                    return (0, types_1.$qf)(result) ? null : result;
                }
                if (profile.isDefault) {
                    const defaultProfileSynchronizer = disposables.add(this.G.createInstance(ProfileSynchronizer, profile, undefined));
                    const result = await this.X(defaultProfileSynchronizer, action, disposables);
                    return (0, types_1.$qf)(result) ? null : result;
                }
                if (this.M.isEnabled()) {
                    return null;
                }
                const userDataProfileManifestSynchronizer = disposables.add(this.G.createInstance(userDataProfilesManifestSync_1.$H4b, profile, undefined));
                const manifest = await this.D.manifest(null);
                const syncProfiles = (await userDataProfileManifestSynchronizer.getRemoteSyncedProfiles(manifest?.latest ?? null)) || [];
                const syncProfile = syncProfiles.find(syncProfile => syncProfile.id === profile.id);
                if (syncProfile) {
                    const profileSynchronizer = disposables.add(this.G.createInstance(ProfileSynchronizer, profile, syncProfile.collection));
                    const result = await this.X(profileSynchronizer, action, disposables);
                    return (0, types_1.$qf)(result) ? null : result;
                }
                return null;
            }
            finally {
                disposables.dispose();
            }
        }
        async X(profileSynchronizer, action, disposables) {
            const allSynchronizers = [...profileSynchronizer.enabled, ...profileSynchronizer.disabled.reduce((synchronizers, syncResource) => {
                    if (syncResource !== "workspaceState" /* SyncResource.WorkspaceState */) {
                        synchronizers.push(disposables.add(profileSynchronizer.createSynchronizer(syncResource)));
                    }
                    return synchronizers;
                }, [])];
            for (const synchronizer of allSynchronizers) {
                const result = await action(synchronizer);
                if (!(0, types_1.$qf)(result)) {
                    return result;
                }
            }
            return undefined;
        }
        Y(status) {
            const oldStatus = this.f;
            if (this.f !== status) {
                this.f = status;
                this.g.fire(status);
                if (oldStatus === "hasConflicts" /* SyncStatus.HasConflicts */) {
                    this.$();
                }
            }
        }
        Z() {
            const conflicts = this.ab().map(synchronizer => synchronizer.conflicts).flat();
            if (!(0, arrays_1.$sb)(this.j, conflicts, (a, b) => a.profile.id === b.profile.id && a.syncResource === b.syncResource && (0, arrays_1.$sb)(a.conflicts, b.conflicts, (a, b) => (0, resources_1.$bg)(a.previewResource, b.previewResource)))) {
                this.j = conflicts;
                this.m.fire(conflicts);
            }
        }
        $() {
            if (this.status === "idle" /* SyncStatus.Idle */) {
                this.t = new Date().getTime();
                this.J.store(LAST_SYNC_TIME_KEY, this.t, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.u.fire(this.t);
            }
        }
        getOrCreateActiveProfileSynchronizer(profile, syncProfile) {
            let activeProfileSynchronizer = this.z.get(profile.id);
            if (activeProfileSynchronizer && activeProfileSynchronizer[0].collection !== syncProfile?.collection) {
                this.H.error('Profile synchronizer collection does not match with the remote sync profile collection');
                activeProfileSynchronizer[1].dispose();
                activeProfileSynchronizer = undefined;
                this.z.delete(profile.id);
            }
            if (!activeProfileSynchronizer) {
                const disposables = new lifecycle_1.$jc();
                const profileSynchronizer = disposables.add(this.G.createInstance(ProfileSynchronizer, profile, syncProfile?.collection));
                disposables.add(profileSynchronizer.onDidChangeStatus(e => this.Y(e)));
                disposables.add(profileSynchronizer.onDidChangeConflicts(conflicts => this.Z()));
                disposables.add(profileSynchronizer.onDidChangeLocal(e => this.h.fire(e)));
                this.z.set(profile.id, activeProfileSynchronizer = [profileSynchronizer, disposables]);
            }
            return activeProfileSynchronizer[0];
        }
        ab() {
            const profileSynchronizers = [];
            for (const [profileSynchronizer] of this.z.values()) {
                profileSynchronizers.push(profileSynchronizer);
            }
            return profileSynchronizers;
        }
        bb() {
            this.z.forEach(([, disposable]) => disposable.dispose());
            this.z.clear();
        }
        cb() {
            if (!this.F.userDataSyncStore) {
                throw new Error('Not enabled');
            }
        }
    };
    exports.$K4b = $K4b;
    exports.$K4b = $K4b = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataSync_1.$Fgb),
        __param(2, userDataSync_1.$Egb),
        __param(3, instantiation_1.$Ah),
        __param(4, userDataSync_1.$Ugb),
        __param(5, telemetry_1.$9k),
        __param(6, storage_1.$Vo),
        __param(7, userDataSync_1.$Pgb),
        __param(8, userDataProfile_1.$Ek),
        __param(9, userDataSync_1.$Rgb),
        __param(10, userDataSync_1.$Ggb)
    ], $K4b);
    let ProfileSynchronizer = class ProfileSynchronizer extends lifecycle_1.$kc {
        get enabled() { return this.f.sort((a, b) => a[1] - b[1]).map(([synchronizer]) => synchronizer); }
        get disabled() { return userDataSync_1.$Bgb.filter(syncResource => !this.r.isResourceEnabled(syncResource)); }
        get status() { return this.g; }
        get conflicts() { return this.m; }
        constructor(profile, collection, r, t, u, w, y, z, C, D) {
            super();
            this.profile = profile;
            this.collection = collection;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.f = [];
            this.g = "idle" /* SyncStatus.Idle */;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeStatus = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeLocal = this.j.event;
            this.m = [];
            this.n = this.B(new event_1.$fd());
            this.onDidChangeConflicts = this.n.event;
            this.B(r.onDidChangeResourceEnablement(([syncResource, enablement]) => this.F(syncResource, enablement)));
            this.B((0, lifecycle_1.$ic)(() => this.f.splice(0, this.f.length).forEach(([, , disposable]) => disposable.dispose())));
            for (const syncResource of userDataSync_1.$Bgb) {
                if (r.isResourceEnabled(syncResource)) {
                    this.G(syncResource);
                }
            }
        }
        F(syncResource, enabled) {
            if (enabled) {
                this.G(syncResource);
            }
            else {
                this.H(syncResource);
            }
        }
        G(syncResource) {
            if (this.f.some(([synchronizer]) => synchronizer.resource === syncResource)) {
                return;
            }
            if (syncResource === "extensions" /* SyncResource.Extensions */ && !this.u.isEnabled()) {
                this.z.info('Skipping extensions sync because gallery is not configured');
                return;
            }
            if (syncResource === "profiles" /* SyncResource.Profiles */) {
                if (!this.profile.isDefault) {
                    return;
                }
                if (!this.C.isEnabled()) {
                    return;
                }
            }
            if (syncResource === "workspaceState" /* SyncResource.WorkspaceState */) {
                return;
            }
            if (syncResource !== "profiles" /* SyncResource.Profiles */ && this.profile.useDefaultFlags?.[syncResource]) {
                this.z.debug(`Skipping syncing ${syncResource} in ${this.profile.name} because it is already synced by default profile`);
                return;
            }
            const disposables = new lifecycle_1.$jc();
            const synchronizer = disposables.add(this.createSynchronizer(syncResource));
            disposables.add(synchronizer.onDidChangeStatus(() => this.L()));
            disposables.add(synchronizer.onDidChangeConflicts(() => this.M()));
            disposables.add(synchronizer.onDidChangeLocal(() => this.j.fire(syncResource)));
            const order = this.N(syncResource);
            this.f.push([synchronizer, order, disposables]);
        }
        H(syncResource) {
            const index = this.f.findIndex(([synchronizer]) => synchronizer.resource === syncResource);
            if (index !== -1) {
                const [[synchronizer, , disposable]] = this.f.splice(index, 1);
                disposable.dispose();
                this.L();
                Promise.allSettled([synchronizer.stop(), synchronizer.resetLocal()])
                    .then(null, error => this.z.error(error));
            }
        }
        createSynchronizer(syncResource) {
            switch (syncResource) {
                case "settings" /* SyncResource.Settings */: return this.t.createInstance(settingsSync_1.$W2b, this.profile, this.collection);
                case "keybindings" /* SyncResource.Keybindings */: return this.t.createInstance(keybindingsSync_1.$T2b, this.profile, this.collection);
                case "snippets" /* SyncResource.Snippets */: return this.t.createInstance(snippetsSync_1.$22b, this.profile, this.collection);
                case "tasks" /* SyncResource.Tasks */: return this.t.createInstance(tasksSync_1.$52b, this.profile, this.collection);
                case "globalState" /* SyncResource.GlobalState */: return this.t.createInstance(globalStateSync_1.$bBb, this.profile, this.collection);
                case "extensions" /* SyncResource.Extensions */: return this.t.createInstance(extensionsSync_1.$O2b, this.profile, this.collection);
                case "profiles" /* SyncResource.Profiles */: return this.t.createInstance(userDataProfilesManifestSync_1.$H4b, this.profile, this.collection);
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
                const syncHeaders = (0, userDataSync_1.$Jgb)(executionId);
                const resourceManifest = (this.collection ? manifest?.collections?.[this.collection]?.latest : manifest?.latest) ?? null;
                const userDataSyncConfiguration = merge ? await this.I(resourceManifest) : {};
                for (const synchroniser of synchronizers) {
                    // Return if cancellation is requested
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    // Return if resource is not enabled
                    if (!this.r.isResourceEnabled(synchroniser.resource)) {
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
                        const userDataSyncError = userDataSync_1.$Kgb.toUserDataSyncError(e);
                        reportUserDataSyncError(userDataSyncError, executionId, this.w, this.y);
                        if (canBailout(e)) {
                            throw userDataSyncError;
                        }
                        // Log and and continue
                        this.z.error(e);
                        this.z.error(`${synchroniser.resource}: ${(0, errorMessage_1.$mi)(e)}`);
                        syncErrors.push([synchroniser.resource, userDataSyncError]);
                    }
                }
                return syncErrors;
            }
            finally {
                this.L();
            }
        }
        async apply(executionId, token) {
            const syncHeaders = (0, userDataSync_1.$Jgb)(executionId);
            for (const synchroniser of this.enabled) {
                if (token.isCancellationRequested) {
                    return;
                }
                try {
                    await synchroniser.apply(false, syncHeaders);
                }
                catch (e) {
                    const userDataSyncError = userDataSync_1.$Kgb.toUserDataSyncError(e);
                    reportUserDataSyncError(userDataSyncError, executionId, this.w, this.y);
                    if (canBailout(e)) {
                        throw userDataSyncError;
                    }
                    // Log and and continue
                    this.z.error(e);
                    this.z.error(`${synchroniser.resource}: ${(0, errorMessage_1.$mi)(e)}`);
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
                    this.z.error(e);
                }
            }
        }
        async resetLocal() {
            for (const synchroniser of this.enabled) {
                try {
                    await synchroniser.resetLocal();
                }
                catch (e) {
                    this.z.error(`${synchroniser.resource}: ${(0, errorMessage_1.$mi)(e)}`);
                    this.z.error(e);
                }
            }
        }
        async I(manifest) {
            if (!this.profile.isDefault) {
                return {};
            }
            const local = this.D.getValue(userDataSync_1.$xgb);
            const settingsSynchronizer = this.enabled.find(synchronizer => synchronizer instanceof settingsSync_1.$W2b);
            if (settingsSynchronizer) {
                const remote = await settingsSynchronizer.getRemoteUserDataSyncConfiguration(manifest);
                return { ...local, ...remote };
            }
            return local;
        }
        J(status) {
            if (this.g !== status) {
                this.g = status;
                this.h.fire(status);
            }
        }
        L() {
            this.M();
            if (this.enabled.some(s => s.status === "hasConflicts" /* SyncStatus.HasConflicts */)) {
                return this.J("hasConflicts" /* SyncStatus.HasConflicts */);
            }
            if (this.enabled.some(s => s.status === "syncing" /* SyncStatus.Syncing */)) {
                return this.J("syncing" /* SyncStatus.Syncing */);
            }
            return this.J("idle" /* SyncStatus.Idle */);
        }
        M() {
            const conflicts = this.enabled.filter(s => s.status === "hasConflicts" /* SyncStatus.HasConflicts */)
                .filter(s => s.conflicts.conflicts.length > 0)
                .map(s => s.conflicts);
            if (!(0, arrays_1.$sb)(this.m, conflicts, (a, b) => a.syncResource === b.syncResource && (0, arrays_1.$sb)(a.conflicts, b.conflicts, (a, b) => (0, resources_1.$bg)(a.previewResource, b.previewResource)))) {
                this.m = conflicts;
                this.n.fire(conflicts);
            }
        }
        N(syncResource) {
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
        __param(2, userDataSync_1.$Pgb),
        __param(3, instantiation_1.$Ah),
        __param(4, extensionManagement_1.$Zn),
        __param(5, userDataSync_1.$Egb),
        __param(6, telemetry_1.$9k),
        __param(7, userDataSync_1.$Ugb),
        __param(8, userDataProfile_1.$Ek),
        __param(9, configuration_1.$8h)
    ], ProfileSynchronizer);
    function canBailout(e) {
        if (e instanceof userDataSync_1.$Kgb) {
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
            serverCode: userDataSyncError instanceof userDataSync_1.$Lgb ? String(userDataSyncError.serverCode) : undefined,
            url: userDataSyncError instanceof userDataSync_1.$Lgb ? userDataSyncError.url : undefined,
            resource: userDataSyncError.resource,
            executionId,
            service: userDataSyncStoreManagementService.userDataSyncStore.url.toString()
        });
    }
});
//# sourceMappingURL=userDataSyncService.js.map