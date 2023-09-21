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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/nls!vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, event_1, json_1, lifecycle_1, strings_1, types_1, nls_1, configuration_1, environment_1, files_1, log_1, serviceMachineId_1, storage_1, telemetry_1, uriIdentity_1, userDataSync_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Ab = exports.$0Ab = exports.$9Ab = exports.$8Ab = exports.$7Ab = exports.$6Ab = exports.$5Ab = void 0;
    function $5Ab(thing) {
        if (thing
            && (thing.ref !== undefined && typeof thing.ref === 'string' && thing.ref !== '')
            && (thing.syncData !== undefined && (thing.syncData === null || $6Ab(thing.syncData)))) {
            return true;
        }
        return false;
    }
    exports.$5Ab = $5Ab;
    function $6Ab(thing) {
        if (thing
            && (thing.version !== undefined && typeof thing.version === 'number')
            && (thing.content !== undefined && typeof thing.content === 'string')) {
            // backward compatibility
            if (Object.keys(thing).length === 2) {
                return true;
            }
            if (Object.keys(thing).length === 3
                && (thing.machineId !== undefined && typeof thing.machineId === 'string')) {
                return true;
            }
        }
        return false;
    }
    exports.$6Ab = $6Ab;
    function $7Ab(syncResource, profile) {
        return `${(0, strings_1.$bf)(syncResource)}${profile.isDefault ? '' : ` (${profile.name})`}`;
    }
    exports.$7Ab = $7Ab;
    let $8Ab = class $8Ab extends lifecycle_1.$kc {
        get status() { return this.m; }
        get conflicts() { return { ...this.syncResource, conflicts: this.s }; }
        constructor(syncResource, collection, G, H, I, J, L, M, N, O, P, uriIdentityService) {
            super();
            this.syncResource = syncResource;
            this.collection = collection;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.c = null;
            this.m = "idle" /* SyncStatus.Idle */;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeStatus = this.n.event;
            this.s = [];
            this.t = this.B(new event_1.$fd());
            this.onDidChangeConflicts = this.t.event;
            this.u = this.B(new async_1.$Eg(50));
            this.w = this.B(new event_1.$fd());
            this.onDidChangeLocal = this.w.event;
            this.z = `${this.collection ? `${this.collection}.` : ''}${this.syncResource.syncResource}.lastSyncUserData`;
            this.C = false;
            this.F = {};
            this.resource = this.syncResource.syncResource;
            this.D = $7Ab(syncResource.syncResource, syncResource.profile);
            this.h = uriIdentityService.extUri;
            this.f = this.h.joinPath(H.userDataSyncHome, ...(0, userDataSync_1.$Cgb)(syncResource.profile.isDefault ? undefined : syncResource.profile.id, syncResource.syncResource));
            this.g = this.h.joinPath(this.f, userDataSync_1.$Xgb);
            this.y = (0, userDataSync_1.$Dgb)(syncResource.profile.isDefault ? undefined : syncResource.profile.id, syncResource.syncResource, H, this.h);
            this.j = (0, serviceMachineId_1.$2o)(H, G, I);
        }
        Q() {
            this.u.trigger(() => this.R());
        }
        async R() {
            // Sync again if current status is in conflicts
            if (this.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                this.O.info(`${this.D}: In conflicts state and local change detected. Syncing again...`);
                const preview = await this.c;
                this.c = null;
                const status = await this.Y(preview.remoteUserData, preview.lastSyncUserData, true, this.ob());
                this.S(status);
            }
            // Check if local change causes remote change
            else {
                this.O.trace(`${this.D}: Checking for local changes...`);
                const lastSyncUserData = await this.getLastSyncUserData();
                const hasRemoteChanged = lastSyncUserData ? await this.ub(lastSyncUserData) : true;
                if (hasRemoteChanged) {
                    this.w.fire();
                }
            }
        }
        S(status) {
            if (this.m !== status) {
                this.m = status;
                this.n.fire(status);
            }
        }
        async sync(manifest, headers = {}) {
            await this.U(manifest, true, this.ob(), headers);
        }
        async preview(manifest, userDataSyncConfiguration, headers = {}) {
            return this.U(manifest, false, userDataSyncConfiguration, headers);
        }
        async apply(force, headers = {}) {
            try {
                this.F = { ...headers };
                const status = await this.ab(force);
                this.S(status);
                return this.c;
            }
            finally {
                this.F = {};
            }
        }
        async U(manifest, apply, userDataSyncConfiguration, headers) {
            try {
                this.F = { ...headers };
                if (this.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                    this.O.info(`${this.D}: Skipped synchronizing ${this.resource.toLowerCase()} as there are conflicts.`);
                    return this.c;
                }
                if (this.status === "syncing" /* SyncStatus.Syncing */) {
                    this.O.info(`${this.D}: Skipped synchronizing ${this.resource.toLowerCase()} as it is running already.`);
                    return this.c;
                }
                this.O.trace(`${this.D}: Started synchronizing ${this.resource.toLowerCase()}...`);
                this.S("syncing" /* SyncStatus.Syncing */);
                let status = "idle" /* SyncStatus.Idle */;
                try {
                    const lastSyncUserData = await this.getLastSyncUserData();
                    const remoteUserData = await this.X(manifest, lastSyncUserData);
                    status = await this.Y(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                    if (status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                        this.O.info(`${this.D}: Detected conflicts while synchronizing ${this.resource.toLowerCase()}.`);
                    }
                    else if (status === "idle" /* SyncStatus.Idle */) {
                        this.O.trace(`${this.D}: Finished synchronizing ${this.resource.toLowerCase()}.`);
                    }
                    return this.c || null;
                }
                finally {
                    this.S(status);
                }
            }
            finally {
                this.F = {};
            }
        }
        async replace(content) {
            const syncData = this.kb(content);
            if (!syncData) {
                return false;
            }
            await this.stop();
            try {
                this.O.trace(`${this.D}: Started resetting ${this.resource.toLowerCase()}...`);
                this.S("syncing" /* SyncStatus.Syncing */);
                const lastSyncUserData = await this.getLastSyncUserData();
                const remoteUserData = await this.X(null, lastSyncUserData);
                const isRemoteDataFromCurrentMachine = await this.W(remoteUserData);
                /* use replace sync data */
                const resourcePreviewResults = await this.qb({ ref: remoteUserData.ref, syncData }, lastSyncUserData, isRemoteDataFromCurrentMachine, this.ob(), cancellation_1.CancellationToken.None);
                const resourcePreviews = [];
                for (const resourcePreviewResult of resourcePreviewResults) {
                    /* Accept remote resource */
                    const acceptResult = await this.sb(resourcePreviewResult, resourcePreviewResult.remoteResource, undefined, cancellation_1.CancellationToken.None);
                    /* compute remote change */
                    const { remoteChange } = await this.sb(resourcePreviewResult, resourcePreviewResult.previewResource, resourcePreviewResult.remoteContent, cancellation_1.CancellationToken.None);
                    resourcePreviews.push([resourcePreviewResult, { ...acceptResult, remoteChange: remoteChange !== 0 /* Change.None */ ? remoteChange : 2 /* Change.Modified */ }]);
                }
                await this.tb(remoteUserData, lastSyncUserData, resourcePreviews, false);
                this.O.info(`${this.D}: Finished resetting ${this.resource.toLowerCase()}.`);
            }
            finally {
                this.S("idle" /* SyncStatus.Idle */);
            }
            return true;
        }
        async W(remoteUserData) {
            const machineId = await this.j;
            return !!remoteUserData.syncData?.machineId && remoteUserData.syncData.machineId === machineId;
        }
        async X(manifest, lastSyncUserData) {
            if (lastSyncUserData) {
                const latestRef = manifest ? manifest[this.resource] : undefined;
                // Last time synced resource and latest resource on server are same
                if (lastSyncUserData.ref === latestRef) {
                    return lastSyncUserData;
                }
                // There is no resource on server and last time it was synced with no resource
                if (latestRef === undefined && lastSyncUserData.syncData === null) {
                    return lastSyncUserData;
                }
            }
            return this.getRemoteUserData(lastSyncUserData);
        }
        async Y(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
            if (remoteUserData.syncData && remoteUserData.syncData.version > this.pb) {
                // current version is not compatible with cloud version
                this.N.publicLog2('sync/incompatible', { source: this.resource });
                throw new userDataSync_1.$Kgb((0, nls_1.localize)(0, null, this.resource, this.pb, remoteUserData.syncData.version), "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */, this.resource);
            }
            try {
                return await this.Z(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
            }
            catch (e) {
                if (e instanceof userDataSync_1.$Kgb) {
                    switch (e.code) {
                        case "LocalPreconditionFailed" /* UserDataSyncErrorCode.LocalPreconditionFailed */:
                            // Rejected as there is a new local version. Syncing again...
                            this.O.info(`${this.D}: Failed to synchronize ${this.D} as there is a new local version available. Synchronizing again...`);
                            return this.Y(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                        case "Conflict" /* UserDataSyncErrorCode.Conflict */:
                        case "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */:
                            // Rejected as there is a new remote version. Syncing again...
                            this.O.info(`${this.D}: Failed to synchronize as there is a new remote version available. Synchronizing again...`);
                            // Avoid cache and get latest remote user data - https://github.com/microsoft/vscode/issues/90624
                            remoteUserData = await this.getRemoteUserData(null);
                            // Get the latest last sync user data. Because multiple parallel syncs (in Web) could share same last sync data
                            // and one of them successfully updated remote and last sync state.
                            lastSyncUserData = await this.getLastSyncUserData();
                            return this.Y(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                    }
                }
                throw e;
            }
        }
        async Z(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
            try {
                const isRemoteDataFromCurrentMachine = await this.W(remoteUserData);
                const acceptRemote = !isRemoteDataFromCurrentMachine && lastSyncUserData === null && this.gb() !== undefined;
                const merge = apply && !acceptRemote;
                // generate or use existing preview
                if (!this.c) {
                    this.c = (0, async_1.$ug)(token => this.eb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge, userDataSyncConfiguration, token));
                }
                let preview = await this.c;
                if (apply && acceptRemote) {
                    this.O.info(`${this.D}: Accepting remote because it was synced before and the last sync data is not available.`);
                    for (const resourcePreview of preview.resourcePreviews) {
                        preview = (await this.accept(resourcePreview.remoteResource)) || preview;
                    }
                }
                this.cb(preview.resourcePreviews);
                if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */)) {
                    return "hasConflicts" /* SyncStatus.HasConflicts */;
                }
                if (apply) {
                    return await this.ab(false);
                }
                return "syncing" /* SyncStatus.Syncing */;
            }
            catch (error) {
                // reset preview on error
                this.c = null;
                throw error;
            }
        }
        async merge(resource) {
            await this.$(resource, async (resourcePreview) => {
                const mergeResult = await this.rb(resourcePreview, cancellation_1.CancellationToken.None);
                await this.G.writeFile(resourcePreview.previewResource, buffer_1.$Fd.fromString(mergeResult?.content || ''));
                const acceptResult = mergeResult && !mergeResult.hasConflicts
                    ? await this.sb(resourcePreview, resourcePreview.previewResource, undefined, cancellation_1.CancellationToken.None)
                    : undefined;
                resourcePreview.acceptResult = acceptResult;
                resourcePreview.mergeState = mergeResult.hasConflicts ? "conflict" /* MergeState.Conflict */ : acceptResult ? "accepted" /* MergeState.Accepted */ : "preview" /* MergeState.Preview */;
                resourcePreview.localChange = acceptResult ? acceptResult.localChange : mergeResult.localChange;
                resourcePreview.remoteChange = acceptResult ? acceptResult.remoteChange : mergeResult.remoteChange;
                return resourcePreview;
            });
            return this.c;
        }
        async accept(resource, content) {
            await this.$(resource, async (resourcePreview) => {
                const acceptResult = await this.sb(resourcePreview, resource, content, cancellation_1.CancellationToken.None);
                resourcePreview.acceptResult = acceptResult;
                resourcePreview.mergeState = "accepted" /* MergeState.Accepted */;
                resourcePreview.localChange = acceptResult.localChange;
                resourcePreview.remoteChange = acceptResult.remoteChange;
                return resourcePreview;
            });
            return this.c;
        }
        async discard(resource) {
            await this.$(resource, async (resourcePreview) => {
                const mergeResult = await this.rb(resourcePreview, cancellation_1.CancellationToken.None);
                await this.G.writeFile(resourcePreview.previewResource, buffer_1.$Fd.fromString(mergeResult.content || ''));
                resourcePreview.acceptResult = undefined;
                resourcePreview.mergeState = "preview" /* MergeState.Preview */;
                resourcePreview.localChange = mergeResult.localChange;
                resourcePreview.remoteChange = mergeResult.remoteChange;
                return resourcePreview;
            });
            return this.c;
        }
        async $(resource, updateResourcePreview) {
            if (!this.c) {
                return;
            }
            let preview = await this.c;
            const index = preview.resourcePreviews.findIndex(({ localResource, remoteResource, previewResource }) => this.h.isEqual(localResource, resource) || this.h.isEqual(remoteResource, resource) || this.h.isEqual(previewResource, resource));
            if (index === -1) {
                return;
            }
            this.c = (0, async_1.$ug)(async (token) => {
                const resourcePreviews = [...preview.resourcePreviews];
                resourcePreviews[index] = await updateResourcePreview(resourcePreviews[index]);
                return {
                    ...preview,
                    resourcePreviews
                };
            });
            preview = await this.c;
            this.cb(preview.resourcePreviews);
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */)) {
                this.S("hasConflicts" /* SyncStatus.HasConflicts */);
            }
            else {
                this.S("syncing" /* SyncStatus.Syncing */);
            }
        }
        async ab(force) {
            if (!this.c) {
                return "idle" /* SyncStatus.Idle */;
            }
            const preview = await this.c;
            // check for conflicts
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */)) {
                return "hasConflicts" /* SyncStatus.HasConflicts */;
            }
            // check if all are accepted
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState !== "accepted" /* MergeState.Accepted */)) {
                return "syncing" /* SyncStatus.Syncing */;
            }
            // apply preview
            await this.tb(preview.remoteUserData, preview.lastSyncUserData, preview.resourcePreviews.map(resourcePreview => ([resourcePreview, resourcePreview.acceptResult])), force);
            // reset preview
            this.c = null;
            // reset preview folder
            await this.bb();
            return "idle" /* SyncStatus.Idle */;
        }
        async bb() {
            try {
                await this.G.del(this.g, { recursive: true });
            }
            catch (error) { /* Ignore */ }
        }
        cb(resourcePreviews) {
            const conflicts = resourcePreviews.filter(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */);
            if (!(0, arrays_1.$sb)(this.s, conflicts, (a, b) => this.h.isEqual(a.previewResource, b.previewResource))) {
                this.s = conflicts;
                this.t.fire(this.conflicts);
            }
        }
        async hasPreviouslySynced() {
            const lastSyncData = await this.getLastSyncUserData();
            return !!lastSyncData && lastSyncData.syncData !== null /* `null` sync data implies resource is not synced */;
        }
        async db(uri) {
            const syncPreview = this.c ? await this.c : null;
            if (syncPreview) {
                for (const resourcePreview of syncPreview.resourcePreviews) {
                    if (this.h.isEqual(resourcePreview.acceptedResource, uri)) {
                        return resourcePreview.acceptResult ? resourcePreview.acceptResult.content : null;
                    }
                    if (this.h.isEqual(resourcePreview.remoteResource, uri)) {
                        return resourcePreview.remoteContent;
                    }
                    if (this.h.isEqual(resourcePreview.localResource, uri)) {
                        return resourcePreview.localContent;
                    }
                    if (this.h.isEqual(resourcePreview.baseResource, uri)) {
                        return resourcePreview.baseContent;
                    }
                }
            }
            return null;
        }
        async resetLocal() {
            this.I.remove(this.z, -1 /* StorageScope.APPLICATION */);
            try {
                await this.G.del(this.y);
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.O.error(error);
                }
            }
        }
        async eb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge, userDataSyncConfiguration, token) {
            const resourcePreviewResults = await this.qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token);
            const resourcePreviews = [];
            for (const resourcePreviewResult of resourcePreviewResults) {
                const acceptedResource = resourcePreviewResult.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
                /* No change -> Accept */
                if (resourcePreviewResult.localChange === 0 /* Change.None */ && resourcePreviewResult.remoteChange === 0 /* Change.None */) {
                    resourcePreviews.push({
                        ...resourcePreviewResult,
                        acceptedResource,
                        acceptResult: { content: null, localChange: 0 /* Change.None */, remoteChange: 0 /* Change.None */ },
                        mergeState: "accepted" /* MergeState.Accepted */
                    });
                }
                /* Changed -> Apply ? (Merge ? Conflict | Accept) : Preview */
                else {
                    /* Merge */
                    const mergeResult = merge ? await this.rb(resourcePreviewResult, token) : undefined;
                    if (token.isCancellationRequested) {
                        break;
                    }
                    await this.G.writeFile(resourcePreviewResult.previewResource, buffer_1.$Fd.fromString(mergeResult?.content || ''));
                    /* Conflict | Accept */
                    const acceptResult = mergeResult && !mergeResult.hasConflicts
                        /* Accept if merged and there are no conflicts */
                        ? await this.sb(resourcePreviewResult, resourcePreviewResult.previewResource, undefined, token)
                        : undefined;
                    resourcePreviews.push({
                        ...resourcePreviewResult,
                        acceptResult,
                        mergeState: mergeResult?.hasConflicts ? "conflict" /* MergeState.Conflict */ : acceptResult ? "accepted" /* MergeState.Accepted */ : "preview" /* MergeState.Preview */,
                        localChange: acceptResult ? acceptResult.localChange : mergeResult ? mergeResult.localChange : resourcePreviewResult.localChange,
                        remoteChange: acceptResult ? acceptResult.remoteChange : mergeResult ? mergeResult.remoteChange : resourcePreviewResult.remoteChange
                    });
                }
            }
            return { syncResource: this.resource, profile: this.syncResource.profile, remoteUserData, lastSyncUserData, resourcePreviews, isLastSyncFromCurrentMachine: isRemoteDataFromCurrentMachine };
        }
        async getLastSyncUserData() {
            let storedLastSyncUserDataStateContent = this.gb();
            if (!storedLastSyncUserDataStateContent) {
                storedLastSyncUserDataStateContent = await this.jb();
            }
            // Last Sync Data state does not exist
            if (!storedLastSyncUserDataStateContent) {
                this.O.info(`${this.D}: Last sync data state does not exist.`);
                return null;
            }
            const lastSyncUserDataState = JSON.parse(storedLastSyncUserDataStateContent);
            const resourceSyncStateVersion = this.M.getResourceSyncStateVersion(this.resource);
            this.C = !!lastSyncUserDataState.version && !!resourceSyncStateVersion && lastSyncUserDataState.version !== resourceSyncStateVersion;
            if (this.C) {
                this.O.info(`${this.D}: Reset last sync state because last sync state version ${lastSyncUserDataState.version} is not compatible with current sync state version ${resourceSyncStateVersion}.`);
                await this.resetLocal();
                return null;
            }
            let syncData = undefined;
            // Get Last Sync Data from Local
            let retrial = 1;
            while (syncData === undefined && retrial++ < 6 /* Retry 5 times */) {
                try {
                    const lastSyncStoredRemoteUserData = await this.hb();
                    if (lastSyncStoredRemoteUserData) {
                        if (lastSyncStoredRemoteUserData.ref === lastSyncUserDataState.ref) {
                            syncData = lastSyncStoredRemoteUserData.syncData;
                        }
                        else {
                            this.O.info(`${this.D}: Last sync data stored locally is not same as the last sync state.`);
                        }
                    }
                    break;
                }
                catch (error) {
                    if (error instanceof files_1.$nk && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        this.O.info(`${this.D}: Last sync resource does not exist locally.`);
                        break;
                    }
                    else if (error instanceof userDataSync_1.$Kgb) {
                        throw error;
                    }
                    else {
                        // log and retry
                        this.O.error(error, retrial);
                    }
                }
            }
            // Get Last Sync Data from Remote
            if (syncData === undefined) {
                try {
                    const content = await this.J.resolveResourceContent(this.resource, lastSyncUserDataState.ref, this.collection, this.F);
                    syncData = content === null ? null : this.kb(content);
                    await this.ib({ ref: lastSyncUserDataState.ref, syncData });
                }
                catch (error) {
                    if (error instanceof userDataSync_1.$Kgb && error.code === "NotFound" /* UserDataSyncErrorCode.NotFound */) {
                        this.O.info(`${this.D}: Last sync resource does not exist remotely.`);
                    }
                    else {
                        throw error;
                    }
                }
            }
            // Last Sync Data Not Found
            if (syncData === undefined) {
                return null;
            }
            return {
                ...lastSyncUserDataState,
                syncData,
            };
        }
        async fb(lastSyncRemoteUserData, additionalProps = {}) {
            if (additionalProps['ref'] || additionalProps['version']) {
                throw new Error('Cannot have core properties as additional');
            }
            const version = this.M.getResourceSyncStateVersion(this.resource);
            const lastSyncUserDataState = {
                ref: lastSyncRemoteUserData.ref,
                version,
                ...additionalProps
            };
            this.I.store(this.z, JSON.stringify(lastSyncUserDataState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this.ib(lastSyncRemoteUserData);
        }
        gb() {
            return this.I.get(this.z, -1 /* StorageScope.APPLICATION */);
        }
        async hb() {
            const content = (await this.G.readFile(this.y)).value.toString();
            try {
                const lastSyncStoredRemoteUserData = content ? JSON.parse(content) : undefined;
                if ($5Ab(lastSyncStoredRemoteUserData)) {
                    return lastSyncStoredRemoteUserData;
                }
            }
            catch (e) {
                this.O.error(e);
            }
            return undefined;
        }
        async ib(lastSyncRemoteUserData) {
            await this.G.writeFile(this.y, buffer_1.$Fd.fromString(JSON.stringify(lastSyncRemoteUserData)));
        }
        async jb() {
            try {
                const content = await this.G.readFile(this.y);
                const userData = JSON.parse(content.value.toString());
                await this.G.del(this.y);
                if (userData.ref && userData.content !== undefined) {
                    this.I.store(this.z, JSON.stringify({
                        ...userData,
                        content: undefined,
                    }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    await this.ib({ ref: userData.ref, syncData: userData.content === null ? null : JSON.parse(userData.content) });
                }
                else {
                    this.O.info(`${this.D}: Migrating last sync user data. Invalid data.`, userData);
                }
            }
            catch (error) {
                if (error instanceof files_1.$nk && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.O.info(`${this.D}: Migrating last sync user data. Resource does not exist.`);
                }
                else {
                    this.O.error(error);
                }
            }
            return this.I.get(this.z, -1 /* StorageScope.APPLICATION */);
        }
        async getRemoteUserData(lastSyncData) {
            const { ref, content } = await this.lb(lastSyncData);
            let syncData = null;
            if (content !== null) {
                syncData = this.kb(content);
            }
            return { ref, syncData };
        }
        kb(content) {
            try {
                const syncData = JSON.parse(content);
                if ($6Ab(syncData)) {
                    return syncData;
                }
            }
            catch (error) {
                this.O.error(error);
            }
            throw new userDataSync_1.$Kgb((0, nls_1.localize)(1, null), "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */, this.resource);
        }
        async lb(lastSyncData) {
            const lastSyncUserData = lastSyncData ? { ref: lastSyncData.ref, content: lastSyncData.syncData ? JSON.stringify(lastSyncData.syncData) : null } : null;
            return this.J.readResource(this.resource, lastSyncUserData, this.collection, this.F);
        }
        async mb(content, ref) {
            const machineId = await this.j;
            const syncData = { version: this.pb, machineId, content };
            try {
                ref = await this.J.writeResource(this.resource, JSON.stringify(syncData), ref, this.collection, this.F);
                return { ref, syncData };
            }
            catch (error) {
                if (error instanceof userDataSync_1.$Kgb && error.code === "TooLarge" /* UserDataSyncErrorCode.TooLarge */) {
                    error = new userDataSync_1.$Kgb(error.message, error.code, this.resource);
                }
                throw error;
            }
        }
        async nb(content) {
            const syncData = { version: this.pb, content };
            return this.L.writeResource(this.resource, JSON.stringify(syncData), new Date(), this.syncResource.profile.isDefault ? undefined : this.syncResource.profile.id);
        }
        async stop() {
            if (this.status === "idle" /* SyncStatus.Idle */) {
                return;
            }
            this.O.trace(`${this.D}: Stopping synchronizing ${this.resource.toLowerCase()}.`);
            if (this.c) {
                this.c.cancel();
                this.c = null;
            }
            this.cb([]);
            await this.bb();
            this.S("idle" /* SyncStatus.Idle */);
            this.O.info(`${this.D}: Stopped synchronizing ${this.resource.toLowerCase()}.`);
        }
        ob() {
            return this.P.getValue(userDataSync_1.$xgb);
        }
    };
    exports.$8Ab = $8Ab;
    exports.$8Ab = $8Ab = __decorate([
        __param(2, files_1.$6j),
        __param(3, environment_1.$Ih),
        __param(4, storage_1.$Vo),
        __param(5, userDataSync_1.$Fgb),
        __param(6, userDataSync_1.$Ggb),
        __param(7, userDataSync_1.$Pgb),
        __param(8, telemetry_1.$9k),
        __param(9, userDataSync_1.$Ugb),
        __param(10, configuration_1.$8h),
        __param(11, uriIdentity_1.$Ck)
    ], $8Ab);
    let $9Ab = class $9Ab extends $8Ab {
        constructor(r, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
            super(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.r = r;
            this.B(this.G.watch(this.h.dirname(r)));
            this.B(this.G.onDidFilesChange(e => this.yb(e)));
        }
        async vb() {
            try {
                return await this.G.readFile(this.r);
            }
            catch (error) {
                return null;
            }
        }
        async wb(newContent, oldContent, force) {
            try {
                if (oldContent) {
                    // file exists already
                    await this.G.writeFile(this.r, buffer_1.$Fd.fromString(newContent), force ? undefined : oldContent);
                }
                else {
                    // file does not exist
                    await this.G.createFile(this.r, buffer_1.$Fd.fromString(newContent), { overwrite: force });
                }
            }
            catch (e) {
                if ((e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) ||
                    (e instanceof files_1.$nk && e.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */)) {
                    throw new userDataSync_1.$Kgb(e.message, "LocalPreconditionFailed" /* UserDataSyncErrorCode.LocalPreconditionFailed */);
                }
                else {
                    throw e;
                }
            }
        }
        async xb() {
            try {
                await this.G.del(this.r);
            }
            catch (e) {
                if (!(e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    throw e;
                }
            }
        }
        yb(e) {
            if (!e.contains(this.r)) {
                return;
            }
            this.Q();
        }
    };
    exports.$9Ab = $9Ab;
    exports.$9Ab = $9Ab = __decorate([
        __param(3, files_1.$6j),
        __param(4, environment_1.$Ih),
        __param(5, storage_1.$Vo),
        __param(6, userDataSync_1.$Fgb),
        __param(7, userDataSync_1.$Ggb),
        __param(8, userDataSync_1.$Pgb),
        __param(9, telemetry_1.$9k),
        __param(10, userDataSync_1.$Ugb),
        __param(11, configuration_1.$8h),
        __param(12, uriIdentity_1.$Ck)
    ], $9Ab);
    let $0Ab = class $0Ab extends $9Ab {
        constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, zb, configurationService, uriIdentityService) {
            super(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.zb = zb;
            this.Bb = undefined;
        }
        Ab(content, isArray) {
            const parseErrors = [];
            const result = (0, json_1.$Lm)(content, parseErrors, { allowEmptyContent: true, allowTrailingComma: true });
            return parseErrors.length > 0 || (!(0, types_1.$qf)(result) && isArray !== Array.isArray(result));
        }
        Cb() {
            if (!this.Bb) {
                this.Bb = this.zb.resolveFormattingOptions(this.r);
            }
            return this.Bb;
        }
    };
    exports.$0Ab = $0Ab;
    exports.$0Ab = $0Ab = __decorate([
        __param(3, files_1.$6j),
        __param(4, environment_1.$Ih),
        __param(5, storage_1.$Vo),
        __param(6, userDataSync_1.$Fgb),
        __param(7, userDataSync_1.$Ggb),
        __param(8, userDataSync_1.$Pgb),
        __param(9, telemetry_1.$9k),
        __param(10, userDataSync_1.$Ugb),
        __param(11, userDataSync_1.$Tgb),
        __param(12, configuration_1.$8h),
        __param(13, uriIdentity_1.$Ck)
    ], $0Ab);
    let $$Ab = class $$Ab {
        constructor(resource, g, h, j, k, l, uriIdentityService) {
            this.resource = resource;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.d = uriIdentityService.extUri;
            this.f = (0, userDataSync_1.$Dgb)(undefined, this.resource, h, this.d);
        }
        async initialize({ ref, content }) {
            if (!content) {
                this.j.info('Remote content does not exist.', this.resource);
                return;
            }
            const syncData = this.m(content);
            if (!syncData) {
                return;
            }
            try {
                await this.o({ ref, syncData });
            }
            catch (error) {
                this.j.error(error);
            }
        }
        m(content) {
            try {
                const syncData = JSON.parse(content);
                if ($6Ab(syncData)) {
                    return syncData;
                }
            }
            catch (error) {
                this.j.error(error);
            }
            this.j.info('Cannot parse sync data as it is not compatible with the current version.', this.resource);
            return undefined;
        }
        async n(lastSyncRemoteUserData, additionalProps = {}) {
            if (additionalProps['ref'] || additionalProps['version']) {
                throw new Error('Cannot have core properties as additional');
            }
            const lastSyncUserDataState = {
                ref: lastSyncRemoteUserData.ref,
                version: undefined,
                ...additionalProps
            };
            this.l.store(`${this.resource}.lastSyncUserData`, JSON.stringify(lastSyncUserDataState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this.k.writeFile(this.f, buffer_1.$Fd.fromString(JSON.stringify(lastSyncRemoteUserData)));
        }
    };
    exports.$$Ab = $$Ab;
    exports.$$Ab = $$Ab = __decorate([
        __param(1, userDataProfile_1.$Ek),
        __param(2, environment_1.$Ih),
        __param(3, log_1.$5i),
        __param(4, files_1.$6j),
        __param(5, storage_1.$Vo),
        __param(6, uriIdentity_1.$Ck)
    ], $$Ab);
});
//# sourceMappingURL=abstractSynchronizer.js.map