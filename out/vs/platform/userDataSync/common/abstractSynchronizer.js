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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, event_1, json_1, lifecycle_1, strings_1, types_1, nls_1, configuration_1, environment_1, files_1, log_1, serviceMachineId_1, storage_1, telemetry_1, uriIdentity_1, userDataSync_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractInitializer = exports.AbstractJsonFileSynchroniser = exports.AbstractFileSynchroniser = exports.AbstractSynchroniser = exports.getSyncResourceLogLabel = exports.isSyncData = exports.isRemoteUserData = void 0;
    function isRemoteUserData(thing) {
        if (thing
            && (thing.ref !== undefined && typeof thing.ref === 'string' && thing.ref !== '')
            && (thing.syncData !== undefined && (thing.syncData === null || isSyncData(thing.syncData)))) {
            return true;
        }
        return false;
    }
    exports.isRemoteUserData = isRemoteUserData;
    function isSyncData(thing) {
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
    exports.isSyncData = isSyncData;
    function getSyncResourceLogLabel(syncResource, profile) {
        return `${(0, strings_1.uppercaseFirstLetter)(syncResource)}${profile.isDefault ? '' : ` (${profile.name})`}`;
    }
    exports.getSyncResourceLogLabel = getSyncResourceLogLabel;
    let AbstractSynchroniser = class AbstractSynchroniser extends lifecycle_1.Disposable {
        get status() { return this._status; }
        get conflicts() { return { ...this.syncResource, conflicts: this._conflicts }; }
        constructor(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
            super();
            this.syncResource = syncResource;
            this.collection = collection;
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.configurationService = configurationService;
            this.syncPreviewPromise = null;
            this._status = "idle" /* SyncStatus.Idle */;
            this._onDidChangStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangStatus.event;
            this._conflicts = [];
            this._onDidChangeConflicts = this._register(new event_1.Emitter());
            this.onDidChangeConflicts = this._onDidChangeConflicts.event;
            this.localChangeTriggerThrottler = this._register(new async_1.ThrottledDelayer(50));
            this._onDidChangeLocal = this._register(new event_1.Emitter());
            this.onDidChangeLocal = this._onDidChangeLocal.event;
            this.lastSyncUserDataStateKey = `${this.collection ? `${this.collection}.` : ''}${this.syncResource.syncResource}.lastSyncUserData`;
            this.hasSyncResourceStateVersionChanged = false;
            this.syncHeaders = {};
            this.resource = this.syncResource.syncResource;
            this.syncResourceLogLabel = getSyncResourceLogLabel(syncResource.syncResource, syncResource.profile);
            this.extUri = uriIdentityService.extUri;
            this.syncFolder = this.extUri.joinPath(environmentService.userDataSyncHome, ...(0, userDataSync_1.getPathSegments)(syncResource.profile.isDefault ? undefined : syncResource.profile.id, syncResource.syncResource));
            this.syncPreviewFolder = this.extUri.joinPath(this.syncFolder, userDataSync_1.PREVIEW_DIR_NAME);
            this.lastSyncResource = (0, userDataSync_1.getLastSyncResourceUri)(syncResource.profile.isDefault ? undefined : syncResource.profile.id, syncResource.syncResource, environmentService, this.extUri);
            this.currentMachineIdPromise = (0, serviceMachineId_1.getServiceMachineId)(environmentService, fileService, storageService);
        }
        triggerLocalChange() {
            this.localChangeTriggerThrottler.trigger(() => this.doTriggerLocalChange());
        }
        async doTriggerLocalChange() {
            // Sync again if current status is in conflicts
            if (this.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                this.logService.info(`${this.syncResourceLogLabel}: In conflicts state and local change detected. Syncing again...`);
                const preview = await this.syncPreviewPromise;
                this.syncPreviewPromise = null;
                const status = await this.performSync(preview.remoteUserData, preview.lastSyncUserData, true, this.getUserDataSyncConfiguration());
                this.setStatus(status);
            }
            // Check if local change causes remote change
            else {
                this.logService.trace(`${this.syncResourceLogLabel}: Checking for local changes...`);
                const lastSyncUserData = await this.getLastSyncUserData();
                const hasRemoteChanged = lastSyncUserData ? await this.hasRemoteChanged(lastSyncUserData) : true;
                if (hasRemoteChanged) {
                    this._onDidChangeLocal.fire();
                }
            }
        }
        setStatus(status) {
            if (this._status !== status) {
                this._status = status;
                this._onDidChangStatus.fire(status);
            }
        }
        async sync(manifest, headers = {}) {
            await this._sync(manifest, true, this.getUserDataSyncConfiguration(), headers);
        }
        async preview(manifest, userDataSyncConfiguration, headers = {}) {
            return this._sync(manifest, false, userDataSyncConfiguration, headers);
        }
        async apply(force, headers = {}) {
            try {
                this.syncHeaders = { ...headers };
                const status = await this.doApply(force);
                this.setStatus(status);
                return this.syncPreviewPromise;
            }
            finally {
                this.syncHeaders = {};
            }
        }
        async _sync(manifest, apply, userDataSyncConfiguration, headers) {
            try {
                this.syncHeaders = { ...headers };
                if (this.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                    this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as there are conflicts.`);
                    return this.syncPreviewPromise;
                }
                if (this.status === "syncing" /* SyncStatus.Syncing */) {
                    this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as it is running already.`);
                    return this.syncPreviewPromise;
                }
                this.logService.trace(`${this.syncResourceLogLabel}: Started synchronizing ${this.resource.toLowerCase()}...`);
                this.setStatus("syncing" /* SyncStatus.Syncing */);
                let status = "idle" /* SyncStatus.Idle */;
                try {
                    const lastSyncUserData = await this.getLastSyncUserData();
                    const remoteUserData = await this.getLatestRemoteUserData(manifest, lastSyncUserData);
                    status = await this.performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                    if (status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                        this.logService.info(`${this.syncResourceLogLabel}: Detected conflicts while synchronizing ${this.resource.toLowerCase()}.`);
                    }
                    else if (status === "idle" /* SyncStatus.Idle */) {
                        this.logService.trace(`${this.syncResourceLogLabel}: Finished synchronizing ${this.resource.toLowerCase()}.`);
                    }
                    return this.syncPreviewPromise || null;
                }
                finally {
                    this.setStatus(status);
                }
            }
            finally {
                this.syncHeaders = {};
            }
        }
        async replace(content) {
            const syncData = this.parseSyncData(content);
            if (!syncData) {
                return false;
            }
            await this.stop();
            try {
                this.logService.trace(`${this.syncResourceLogLabel}: Started resetting ${this.resource.toLowerCase()}...`);
                this.setStatus("syncing" /* SyncStatus.Syncing */);
                const lastSyncUserData = await this.getLastSyncUserData();
                const remoteUserData = await this.getLatestRemoteUserData(null, lastSyncUserData);
                const isRemoteDataFromCurrentMachine = await this.isRemoteDataFromCurrentMachine(remoteUserData);
                /* use replace sync data */
                const resourcePreviewResults = await this.generateSyncPreview({ ref: remoteUserData.ref, syncData }, lastSyncUserData, isRemoteDataFromCurrentMachine, this.getUserDataSyncConfiguration(), cancellation_1.CancellationToken.None);
                const resourcePreviews = [];
                for (const resourcePreviewResult of resourcePreviewResults) {
                    /* Accept remote resource */
                    const acceptResult = await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.remoteResource, undefined, cancellation_1.CancellationToken.None);
                    /* compute remote change */
                    const { remoteChange } = await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.previewResource, resourcePreviewResult.remoteContent, cancellation_1.CancellationToken.None);
                    resourcePreviews.push([resourcePreviewResult, { ...acceptResult, remoteChange: remoteChange !== 0 /* Change.None */ ? remoteChange : 2 /* Change.Modified */ }]);
                }
                await this.applyResult(remoteUserData, lastSyncUserData, resourcePreviews, false);
                this.logService.info(`${this.syncResourceLogLabel}: Finished resetting ${this.resource.toLowerCase()}.`);
            }
            finally {
                this.setStatus("idle" /* SyncStatus.Idle */);
            }
            return true;
        }
        async isRemoteDataFromCurrentMachine(remoteUserData) {
            const machineId = await this.currentMachineIdPromise;
            return !!remoteUserData.syncData?.machineId && remoteUserData.syncData.machineId === machineId;
        }
        async getLatestRemoteUserData(manifest, lastSyncUserData) {
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
        async performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
            if (remoteUserData.syncData && remoteUserData.syncData.version > this.version) {
                // current version is not compatible with cloud version
                this.telemetryService.publicLog2('sync/incompatible', { source: this.resource });
                throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)({ key: 'incompatible', comment: ['This is an error while syncing a resource that its local version is not compatible with its remote version.'] }, "Cannot sync {0} as its local version {1} is not compatible with its remote version {2}", this.resource, this.version, remoteUserData.syncData.version), "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */, this.resource);
            }
            try {
                return await this.doSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
            }
            catch (e) {
                if (e instanceof userDataSync_1.UserDataSyncError) {
                    switch (e.code) {
                        case "LocalPreconditionFailed" /* UserDataSyncErrorCode.LocalPreconditionFailed */:
                            // Rejected as there is a new local version. Syncing again...
                            this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize ${this.syncResourceLogLabel} as there is a new local version available. Synchronizing again...`);
                            return this.performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                        case "Conflict" /* UserDataSyncErrorCode.Conflict */:
                        case "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */:
                            // Rejected as there is a new remote version. Syncing again...
                            this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize as there is a new remote version available. Synchronizing again...`);
                            // Avoid cache and get latest remote user data - https://github.com/microsoft/vscode/issues/90624
                            remoteUserData = await this.getRemoteUserData(null);
                            // Get the latest last sync user data. Because multiple parallel syncs (in Web) could share same last sync data
                            // and one of them successfully updated remote and last sync state.
                            lastSyncUserData = await this.getLastSyncUserData();
                            return this.performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                    }
                }
                throw e;
            }
        }
        async doSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
            try {
                const isRemoteDataFromCurrentMachine = await this.isRemoteDataFromCurrentMachine(remoteUserData);
                const acceptRemote = !isRemoteDataFromCurrentMachine && lastSyncUserData === null && this.getStoredLastSyncUserDataStateContent() !== undefined;
                const merge = apply && !acceptRemote;
                // generate or use existing preview
                if (!this.syncPreviewPromise) {
                    this.syncPreviewPromise = (0, async_1.createCancelablePromise)(token => this.doGenerateSyncResourcePreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge, userDataSyncConfiguration, token));
                }
                let preview = await this.syncPreviewPromise;
                if (apply && acceptRemote) {
                    this.logService.info(`${this.syncResourceLogLabel}: Accepting remote because it was synced before and the last sync data is not available.`);
                    for (const resourcePreview of preview.resourcePreviews) {
                        preview = (await this.accept(resourcePreview.remoteResource)) || preview;
                    }
                }
                this.updateConflicts(preview.resourcePreviews);
                if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */)) {
                    return "hasConflicts" /* SyncStatus.HasConflicts */;
                }
                if (apply) {
                    return await this.doApply(false);
                }
                return "syncing" /* SyncStatus.Syncing */;
            }
            catch (error) {
                // reset preview on error
                this.syncPreviewPromise = null;
                throw error;
            }
        }
        async merge(resource) {
            await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
                const mergeResult = await this.getMergeResult(resourcePreview, cancellation_1.CancellationToken.None);
                await this.fileService.writeFile(resourcePreview.previewResource, buffer_1.VSBuffer.fromString(mergeResult?.content || ''));
                const acceptResult = mergeResult && !mergeResult.hasConflicts
                    ? await this.getAcceptResult(resourcePreview, resourcePreview.previewResource, undefined, cancellation_1.CancellationToken.None)
                    : undefined;
                resourcePreview.acceptResult = acceptResult;
                resourcePreview.mergeState = mergeResult.hasConflicts ? "conflict" /* MergeState.Conflict */ : acceptResult ? "accepted" /* MergeState.Accepted */ : "preview" /* MergeState.Preview */;
                resourcePreview.localChange = acceptResult ? acceptResult.localChange : mergeResult.localChange;
                resourcePreview.remoteChange = acceptResult ? acceptResult.remoteChange : mergeResult.remoteChange;
                return resourcePreview;
            });
            return this.syncPreviewPromise;
        }
        async accept(resource, content) {
            await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
                const acceptResult = await this.getAcceptResult(resourcePreview, resource, content, cancellation_1.CancellationToken.None);
                resourcePreview.acceptResult = acceptResult;
                resourcePreview.mergeState = "accepted" /* MergeState.Accepted */;
                resourcePreview.localChange = acceptResult.localChange;
                resourcePreview.remoteChange = acceptResult.remoteChange;
                return resourcePreview;
            });
            return this.syncPreviewPromise;
        }
        async discard(resource) {
            await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
                const mergeResult = await this.getMergeResult(resourcePreview, cancellation_1.CancellationToken.None);
                await this.fileService.writeFile(resourcePreview.previewResource, buffer_1.VSBuffer.fromString(mergeResult.content || ''));
                resourcePreview.acceptResult = undefined;
                resourcePreview.mergeState = "preview" /* MergeState.Preview */;
                resourcePreview.localChange = mergeResult.localChange;
                resourcePreview.remoteChange = mergeResult.remoteChange;
                return resourcePreview;
            });
            return this.syncPreviewPromise;
        }
        async updateSyncResourcePreview(resource, updateResourcePreview) {
            if (!this.syncPreviewPromise) {
                return;
            }
            let preview = await this.syncPreviewPromise;
            const index = preview.resourcePreviews.findIndex(({ localResource, remoteResource, previewResource }) => this.extUri.isEqual(localResource, resource) || this.extUri.isEqual(remoteResource, resource) || this.extUri.isEqual(previewResource, resource));
            if (index === -1) {
                return;
            }
            this.syncPreviewPromise = (0, async_1.createCancelablePromise)(async (token) => {
                const resourcePreviews = [...preview.resourcePreviews];
                resourcePreviews[index] = await updateResourcePreview(resourcePreviews[index]);
                return {
                    ...preview,
                    resourcePreviews
                };
            });
            preview = await this.syncPreviewPromise;
            this.updateConflicts(preview.resourcePreviews);
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */)) {
                this.setStatus("hasConflicts" /* SyncStatus.HasConflicts */);
            }
            else {
                this.setStatus("syncing" /* SyncStatus.Syncing */);
            }
        }
        async doApply(force) {
            if (!this.syncPreviewPromise) {
                return "idle" /* SyncStatus.Idle */;
            }
            const preview = await this.syncPreviewPromise;
            // check for conflicts
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */)) {
                return "hasConflicts" /* SyncStatus.HasConflicts */;
            }
            // check if all are accepted
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState !== "accepted" /* MergeState.Accepted */)) {
                return "syncing" /* SyncStatus.Syncing */;
            }
            // apply preview
            await this.applyResult(preview.remoteUserData, preview.lastSyncUserData, preview.resourcePreviews.map(resourcePreview => ([resourcePreview, resourcePreview.acceptResult])), force);
            // reset preview
            this.syncPreviewPromise = null;
            // reset preview folder
            await this.clearPreviewFolder();
            return "idle" /* SyncStatus.Idle */;
        }
        async clearPreviewFolder() {
            try {
                await this.fileService.del(this.syncPreviewFolder, { recursive: true });
            }
            catch (error) { /* Ignore */ }
        }
        updateConflicts(resourcePreviews) {
            const conflicts = resourcePreviews.filter(({ mergeState }) => mergeState === "conflict" /* MergeState.Conflict */);
            if (!(0, arrays_1.equals)(this._conflicts, conflicts, (a, b) => this.extUri.isEqual(a.previewResource, b.previewResource))) {
                this._conflicts = conflicts;
                this._onDidChangeConflicts.fire(this.conflicts);
            }
        }
        async hasPreviouslySynced() {
            const lastSyncData = await this.getLastSyncUserData();
            return !!lastSyncData && lastSyncData.syncData !== null /* `null` sync data implies resource is not synced */;
        }
        async resolvePreviewContent(uri) {
            const syncPreview = this.syncPreviewPromise ? await this.syncPreviewPromise : null;
            if (syncPreview) {
                for (const resourcePreview of syncPreview.resourcePreviews) {
                    if (this.extUri.isEqual(resourcePreview.acceptedResource, uri)) {
                        return resourcePreview.acceptResult ? resourcePreview.acceptResult.content : null;
                    }
                    if (this.extUri.isEqual(resourcePreview.remoteResource, uri)) {
                        return resourcePreview.remoteContent;
                    }
                    if (this.extUri.isEqual(resourcePreview.localResource, uri)) {
                        return resourcePreview.localContent;
                    }
                    if (this.extUri.isEqual(resourcePreview.baseResource, uri)) {
                        return resourcePreview.baseContent;
                    }
                }
            }
            return null;
        }
        async resetLocal() {
            this.storageService.remove(this.lastSyncUserDataStateKey, -1 /* StorageScope.APPLICATION */);
            try {
                await this.fileService.del(this.lastSyncResource);
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
        }
        async doGenerateSyncResourcePreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge, userDataSyncConfiguration, token) {
            const resourcePreviewResults = await this.generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token);
            const resourcePreviews = [];
            for (const resourcePreviewResult of resourcePreviewResults) {
                const acceptedResource = resourcePreviewResult.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
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
                    const mergeResult = merge ? await this.getMergeResult(resourcePreviewResult, token) : undefined;
                    if (token.isCancellationRequested) {
                        break;
                    }
                    await this.fileService.writeFile(resourcePreviewResult.previewResource, buffer_1.VSBuffer.fromString(mergeResult?.content || ''));
                    /* Conflict | Accept */
                    const acceptResult = mergeResult && !mergeResult.hasConflicts
                        /* Accept if merged and there are no conflicts */
                        ? await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.previewResource, undefined, token)
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
            let storedLastSyncUserDataStateContent = this.getStoredLastSyncUserDataStateContent();
            if (!storedLastSyncUserDataStateContent) {
                storedLastSyncUserDataStateContent = await this.migrateLastSyncUserData();
            }
            // Last Sync Data state does not exist
            if (!storedLastSyncUserDataStateContent) {
                this.logService.info(`${this.syncResourceLogLabel}: Last sync data state does not exist.`);
                return null;
            }
            const lastSyncUserDataState = JSON.parse(storedLastSyncUserDataStateContent);
            const resourceSyncStateVersion = this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);
            this.hasSyncResourceStateVersionChanged = !!lastSyncUserDataState.version && !!resourceSyncStateVersion && lastSyncUserDataState.version !== resourceSyncStateVersion;
            if (this.hasSyncResourceStateVersionChanged) {
                this.logService.info(`${this.syncResourceLogLabel}: Reset last sync state because last sync state version ${lastSyncUserDataState.version} is not compatible with current sync state version ${resourceSyncStateVersion}.`);
                await this.resetLocal();
                return null;
            }
            let syncData = undefined;
            // Get Last Sync Data from Local
            let retrial = 1;
            while (syncData === undefined && retrial++ < 6 /* Retry 5 times */) {
                try {
                    const lastSyncStoredRemoteUserData = await this.readLastSyncStoredRemoteUserData();
                    if (lastSyncStoredRemoteUserData) {
                        if (lastSyncStoredRemoteUserData.ref === lastSyncUserDataState.ref) {
                            syncData = lastSyncStoredRemoteUserData.syncData;
                        }
                        else {
                            this.logService.info(`${this.syncResourceLogLabel}: Last sync data stored locally is not same as the last sync state.`);
                        }
                    }
                    break;
                }
                catch (error) {
                    if (error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist locally.`);
                        break;
                    }
                    else if (error instanceof userDataSync_1.UserDataSyncError) {
                        throw error;
                    }
                    else {
                        // log and retry
                        this.logService.error(error, retrial);
                    }
                }
            }
            // Get Last Sync Data from Remote
            if (syncData === undefined) {
                try {
                    const content = await this.userDataSyncStoreService.resolveResourceContent(this.resource, lastSyncUserDataState.ref, this.collection, this.syncHeaders);
                    syncData = content === null ? null : this.parseSyncData(content);
                    await this.writeLastSyncStoredRemoteUserData({ ref: lastSyncUserDataState.ref, syncData });
                }
                catch (error) {
                    if (error instanceof userDataSync_1.UserDataSyncError && error.code === "NotFound" /* UserDataSyncErrorCode.NotFound */) {
                        this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist remotely.`);
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
        async updateLastSyncUserData(lastSyncRemoteUserData, additionalProps = {}) {
            if (additionalProps['ref'] || additionalProps['version']) {
                throw new Error('Cannot have core properties as additional');
            }
            const version = this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);
            const lastSyncUserDataState = {
                ref: lastSyncRemoteUserData.ref,
                version,
                ...additionalProps
            };
            this.storageService.store(this.lastSyncUserDataStateKey, JSON.stringify(lastSyncUserDataState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this.writeLastSyncStoredRemoteUserData(lastSyncRemoteUserData);
        }
        getStoredLastSyncUserDataStateContent() {
            return this.storageService.get(this.lastSyncUserDataStateKey, -1 /* StorageScope.APPLICATION */);
        }
        async readLastSyncStoredRemoteUserData() {
            const content = (await this.fileService.readFile(this.lastSyncResource)).value.toString();
            try {
                const lastSyncStoredRemoteUserData = content ? JSON.parse(content) : undefined;
                if (isRemoteUserData(lastSyncStoredRemoteUserData)) {
                    return lastSyncStoredRemoteUserData;
                }
            }
            catch (e) {
                this.logService.error(e);
            }
            return undefined;
        }
        async writeLastSyncStoredRemoteUserData(lastSyncRemoteUserData) {
            await this.fileService.writeFile(this.lastSyncResource, buffer_1.VSBuffer.fromString(JSON.stringify(lastSyncRemoteUserData)));
        }
        async migrateLastSyncUserData() {
            try {
                const content = await this.fileService.readFile(this.lastSyncResource);
                const userData = JSON.parse(content.value.toString());
                await this.fileService.del(this.lastSyncResource);
                if (userData.ref && userData.content !== undefined) {
                    this.storageService.store(this.lastSyncUserDataStateKey, JSON.stringify({
                        ...userData,
                        content: undefined,
                    }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    await this.writeLastSyncStoredRemoteUserData({ ref: userData.ref, syncData: userData.content === null ? null : JSON.parse(userData.content) });
                }
                else {
                    this.logService.info(`${this.syncResourceLogLabel}: Migrating last sync user data. Invalid data.`, userData);
                }
            }
            catch (error) {
                if (error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.info(`${this.syncResourceLogLabel}: Migrating last sync user data. Resource does not exist.`);
                }
                else {
                    this.logService.error(error);
                }
            }
            return this.storageService.get(this.lastSyncUserDataStateKey, -1 /* StorageScope.APPLICATION */);
        }
        async getRemoteUserData(lastSyncData) {
            const { ref, content } = await this.getUserData(lastSyncData);
            let syncData = null;
            if (content !== null) {
                syncData = this.parseSyncData(content);
            }
            return { ref, syncData };
        }
        parseSyncData(content) {
            try {
                const syncData = JSON.parse(content);
                if (isSyncData(syncData)) {
                    return syncData;
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)('incompatible sync data', "Cannot parse sync data as it is not compatible with the current version."), "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */, this.resource);
        }
        async getUserData(lastSyncData) {
            const lastSyncUserData = lastSyncData ? { ref: lastSyncData.ref, content: lastSyncData.syncData ? JSON.stringify(lastSyncData.syncData) : null } : null;
            return this.userDataSyncStoreService.readResource(this.resource, lastSyncUserData, this.collection, this.syncHeaders);
        }
        async updateRemoteUserData(content, ref) {
            const machineId = await this.currentMachineIdPromise;
            const syncData = { version: this.version, machineId, content };
            try {
                ref = await this.userDataSyncStoreService.writeResource(this.resource, JSON.stringify(syncData), ref, this.collection, this.syncHeaders);
                return { ref, syncData };
            }
            catch (error) {
                if (error instanceof userDataSync_1.UserDataSyncError && error.code === "TooLarge" /* UserDataSyncErrorCode.TooLarge */) {
                    error = new userDataSync_1.UserDataSyncError(error.message, error.code, this.resource);
                }
                throw error;
            }
        }
        async backupLocal(content) {
            const syncData = { version: this.version, content };
            return this.userDataSyncLocalStoreService.writeResource(this.resource, JSON.stringify(syncData), new Date(), this.syncResource.profile.isDefault ? undefined : this.syncResource.profile.id);
        }
        async stop() {
            if (this.status === "idle" /* SyncStatus.Idle */) {
                return;
            }
            this.logService.trace(`${this.syncResourceLogLabel}: Stopping synchronizing ${this.resource.toLowerCase()}.`);
            if (this.syncPreviewPromise) {
                this.syncPreviewPromise.cancel();
                this.syncPreviewPromise = null;
            }
            this.updateConflicts([]);
            await this.clearPreviewFolder();
            this.setStatus("idle" /* SyncStatus.Idle */);
            this.logService.info(`${this.syncResourceLogLabel}: Stopped synchronizing ${this.resource.toLowerCase()}.`);
        }
        getUserDataSyncConfiguration() {
            return this.configurationService.getValue(userDataSync_1.USER_DATA_SYNC_CONFIGURATION_SCOPE);
        }
    };
    exports.AbstractSynchroniser = AbstractSynchroniser;
    exports.AbstractSynchroniser = AbstractSynchroniser = __decorate([
        __param(2, files_1.IFileService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, storage_1.IStorageService),
        __param(5, userDataSync_1.IUserDataSyncStoreService),
        __param(6, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(7, userDataSync_1.IUserDataSyncEnablementService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, userDataSync_1.IUserDataSyncLogService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, uriIdentity_1.IUriIdentityService)
    ], AbstractSynchroniser);
    let AbstractFileSynchroniser = class AbstractFileSynchroniser extends AbstractSynchroniser {
        constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
            super(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.file = file;
            this._register(this.fileService.watch(this.extUri.dirname(file)));
            this._register(this.fileService.onDidFilesChange(e => this.onFileChanges(e)));
        }
        async getLocalFileContent() {
            try {
                return await this.fileService.readFile(this.file);
            }
            catch (error) {
                return null;
            }
        }
        async updateLocalFileContent(newContent, oldContent, force) {
            try {
                if (oldContent) {
                    // file exists already
                    await this.fileService.writeFile(this.file, buffer_1.VSBuffer.fromString(newContent), force ? undefined : oldContent);
                }
                else {
                    // file does not exist
                    await this.fileService.createFile(this.file, buffer_1.VSBuffer.fromString(newContent), { overwrite: force });
                }
            }
            catch (e) {
                if ((e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) ||
                    (e instanceof files_1.FileOperationError && e.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */)) {
                    throw new userDataSync_1.UserDataSyncError(e.message, "LocalPreconditionFailed" /* UserDataSyncErrorCode.LocalPreconditionFailed */);
                }
                else {
                    throw e;
                }
            }
        }
        async deleteLocalFile() {
            try {
                await this.fileService.del(this.file);
            }
            catch (e) {
                if (!(e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    throw e;
                }
            }
        }
        onFileChanges(e) {
            if (!e.contains(this.file)) {
                return;
            }
            this.triggerLocalChange();
        }
    };
    exports.AbstractFileSynchroniser = AbstractFileSynchroniser;
    exports.AbstractFileSynchroniser = AbstractFileSynchroniser = __decorate([
        __param(3, files_1.IFileService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, storage_1.IStorageService),
        __param(6, userDataSync_1.IUserDataSyncStoreService),
        __param(7, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(8, userDataSync_1.IUserDataSyncEnablementService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, userDataSync_1.IUserDataSyncLogService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, uriIdentity_1.IUriIdentityService)
    ], AbstractFileSynchroniser);
    let AbstractJsonFileSynchroniser = class AbstractJsonFileSynchroniser extends AbstractFileSynchroniser {
        constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService) {
            super(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.userDataSyncUtilService = userDataSyncUtilService;
            this._formattingOptions = undefined;
        }
        hasErrors(content, isArray) {
            const parseErrors = [];
            const result = (0, json_1.parse)(content, parseErrors, { allowEmptyContent: true, allowTrailingComma: true });
            return parseErrors.length > 0 || (!(0, types_1.isUndefined)(result) && isArray !== Array.isArray(result));
        }
        getFormattingOptions() {
            if (!this._formattingOptions) {
                this._formattingOptions = this.userDataSyncUtilService.resolveFormattingOptions(this.file);
            }
            return this._formattingOptions;
        }
    };
    exports.AbstractJsonFileSynchroniser = AbstractJsonFileSynchroniser;
    exports.AbstractJsonFileSynchroniser = AbstractJsonFileSynchroniser = __decorate([
        __param(3, files_1.IFileService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, storage_1.IStorageService),
        __param(6, userDataSync_1.IUserDataSyncStoreService),
        __param(7, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(8, userDataSync_1.IUserDataSyncEnablementService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, userDataSync_1.IUserDataSyncLogService),
        __param(11, userDataSync_1.IUserDataSyncUtilService),
        __param(12, configuration_1.IConfigurationService),
        __param(13, uriIdentity_1.IUriIdentityService)
    ], AbstractJsonFileSynchroniser);
    let AbstractInitializer = class AbstractInitializer {
        constructor(resource, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService) {
            this.resource = resource;
            this.userDataProfilesService = userDataProfilesService;
            this.environmentService = environmentService;
            this.logService = logService;
            this.fileService = fileService;
            this.storageService = storageService;
            this.extUri = uriIdentityService.extUri;
            this.lastSyncResource = (0, userDataSync_1.getLastSyncResourceUri)(undefined, this.resource, environmentService, this.extUri);
        }
        async initialize({ ref, content }) {
            if (!content) {
                this.logService.info('Remote content does not exist.', this.resource);
                return;
            }
            const syncData = this.parseSyncData(content);
            if (!syncData) {
                return;
            }
            try {
                await this.doInitialize({ ref, syncData });
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        parseSyncData(content) {
            try {
                const syncData = JSON.parse(content);
                if (isSyncData(syncData)) {
                    return syncData;
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            this.logService.info('Cannot parse sync data as it is not compatible with the current version.', this.resource);
            return undefined;
        }
        async updateLastSyncUserData(lastSyncRemoteUserData, additionalProps = {}) {
            if (additionalProps['ref'] || additionalProps['version']) {
                throw new Error('Cannot have core properties as additional');
            }
            const lastSyncUserDataState = {
                ref: lastSyncRemoteUserData.ref,
                version: undefined,
                ...additionalProps
            };
            this.storageService.store(`${this.resource}.lastSyncUserData`, JSON.stringify(lastSyncUserDataState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this.fileService.writeFile(this.lastSyncResource, buffer_1.VSBuffer.fromString(JSON.stringify(lastSyncRemoteUserData)));
        }
    };
    exports.AbstractInitializer = AbstractInitializer;
    exports.AbstractInitializer = AbstractInitializer = __decorate([
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, log_1.ILogService),
        __param(4, files_1.IFileService),
        __param(5, storage_1.IStorageService),
        __param(6, uriIdentity_1.IUriIdentityService)
    ], AbstractInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RTeW5jaHJvbml6ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL2Fic3RyYWN0U3luY2hyb25pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtDaEcsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBVTtRQUMxQyxJQUFJLEtBQUs7ZUFDTCxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLE9BQU8sS0FBSyxDQUFDLEdBQUcsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7ZUFDOUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzlGLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFSRCw0Q0FRQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxLQUFVO1FBQ3BDLElBQUksS0FBSztlQUNMLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQztlQUNsRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRTtZQUV2RSx5QkFBeUI7WUFDekIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMs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