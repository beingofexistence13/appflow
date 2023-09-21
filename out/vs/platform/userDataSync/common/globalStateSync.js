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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/jsonFormatter", "vs/base/common/platform", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/content", "vs/platform/userDataSync/common/globalStateMerge", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/instantiation/common/instantiation"], function (require, exports, buffer_1, errors_1, event_1, json_1, jsonFormatter_1, platform_1, uuid_1, configuration_1, environment_1, files_1, log_1, serviceMachineId_1, storage_1, telemetry_1, uriIdentity_1, abstractSynchronizer_1, content_1, globalStateMerge_1, userDataSync_1, userDataProfile_1, userDataProfileStorageService_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncStoreTypeSynchronizer = exports.GlobalStateInitializer = exports.LocalGlobalStateProvider = exports.GlobalStateSynchroniser = exports.stringify = void 0;
    const argvStoragePrefx = 'globalState.argv.';
    const argvProperties = ['locale'];
    function stringify(globalState, format) {
        const storageKeys = globalState.storage ? Object.keys(globalState.storage).sort() : [];
        const storage = {};
        storageKeys.forEach(key => storage[key] = globalState.storage[key]);
        globalState.storage = storage;
        return format ? (0, jsonFormatter_1.toFormattedString)(globalState, {}) : JSON.stringify(globalState);
    }
    exports.stringify = stringify;
    const GLOBAL_STATE_DATA_VERSION = 1;
    /**
     * Synchronises global state that includes
     * 	- Global storage with user scope
     * 	- Locale from argv properties
     *
     * Global storage is synced without checking version just like other resources (settings, keybindings).
     * If there is a change in format of the value of a storage key which requires migration then
     * 		Owner of that key should remove that key from user scope and replace that with new user scoped key.
     */
    let GlobalStateSynchroniser = class GlobalStateSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(profile, collection, userDataProfileStorageService, fileService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, environmentService, userDataSyncEnablementService, telemetryService, configurationService, storageService, uriIdentityService, instantiationService) {
            super({ syncResource: "globalState" /* SyncResource.GlobalState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.version = GLOBAL_STATE_DATA_VERSION;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'globalState.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this.localGlobalStateProvider = instantiationService.createInstance(LocalGlobalStateProvider);
            this._register(fileService.watch(this.extUri.dirname(this.environmentService.argvResource)));
            this._register(event_1.Event.any(
            /* Locale change */
            event_1.Event.filter(fileService.onDidFilesChange, e => e.contains(this.environmentService.argvResource)), event_1.Event.filter(userDataProfileStorageService.onDidChange, e => {
                /* StorageTarget has changed in profile storage */
                if (e.targetChanges.some(profile => this.syncResource.profile.id === profile.id)) {
                    return true;
                }
                /* User storage data has changed in profile storage */
                if (e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.target === 0 /* StorageTarget.USER */))) {
                    return true;
                }
                return false;
            }))((() => this.triggerLocalChange())));
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncGlobalState = lastSyncUserData && lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
            const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
            if (remoteGlobalState) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote ui state with local ui state...`);
            }
            else {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote ui state does not exist. Synchronizing ui state for the first time.`);
            }
            const storageKeys = await this.getStorageKeys(lastSyncGlobalState);
            const { local, remote } = (0, globalStateMerge_1.merge)(localGlobalState.storage, remoteGlobalState ? remoteGlobalState.storage : null, lastSyncGlobalState ? lastSyncGlobalState.storage : null, storageKeys, this.logService);
            const previewResult = {
                content: null,
                local,
                remote,
                localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote.all !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = stringify(localGlobalState, false);
            return [{
                    baseResource: this.baseResource,
                    baseContent: lastSyncGlobalState ? stringify(lastSyncGlobalState, false) : localContent,
                    localResource: this.localResource,
                    localContent,
                    localUserData: localGlobalState,
                    remoteResource: this.remoteResource,
                    remoteContent: remoteGlobalState ? stringify(remoteGlobalState, false) : null,
                    previewResource: this.previewResource,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.acceptedResource,
                    storageKeys
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncGlobalState = lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
            if (lastSyncGlobalState === null) {
                return true;
            }
            const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
            const storageKeys = await this.getStorageKeys(lastSyncGlobalState);
            const { remote } = (0, globalStateMerge_1.merge)(localGlobalState.storage, lastSyncGlobalState.storage, lastSyncGlobalState.storage, storageKeys, this.logService);
            return remote.all !== null;
        }
        async getMergeResult(resourcePreview, token) {
            return { ...resourcePreview.previewResult, hasConflicts: false };
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return this.acceptLocal(resourcePreview);
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return this.acceptRemote(resourcePreview);
            }
            /* Accept preview resource */
            if (this.extUri.isEqual(resource, this.previewResource)) {
                return resourcePreview.previewResult;
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async acceptLocal(resourcePreview) {
            return {
                content: resourcePreview.localContent,
                local: { added: {}, removed: [], updated: {} },
                remote: { added: Object.keys(resourcePreview.localUserData.storage), removed: [], updated: [], all: resourcePreview.localUserData.storage },
                localChange: 0 /* Change.None */,
                remoteChange: 2 /* Change.Modified */,
            };
        }
        async acceptRemote(resourcePreview) {
            if (resourcePreview.remoteContent !== null) {
                const remoteGlobalState = JSON.parse(resourcePreview.remoteContent);
                const { local, remote } = (0, globalStateMerge_1.merge)(resourcePreview.localUserData.storage, remoteGlobalState.storage, null, resourcePreview.storageKeys, this.logService);
                return {
                    content: resourcePreview.remoteContent,
                    local,
                    remote,
                    localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                    remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
                };
            }
            else {
                return {
                    content: resourcePreview.remoteContent,
                    local: { added: {}, removed: [], updated: {} },
                    remote: { added: [], removed: [], updated: [], all: null },
                    localChange: 0 /* Change.None */,
                    remoteChange: 0 /* Change.None */,
                };
            }
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { localUserData } = resourcePreviews[0][0];
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing ui state.`);
            }
            if (localChange !== 0 /* Change.None */) {
                // update local
                this.logService.trace(`${this.syncResourceLogLabel}: Updating local ui state...`);
                await this.backupLocal(JSON.stringify(localUserData));
                await this.localGlobalStateProvider.writeLocalGlobalState(local, this.syncResource.profile);
                this.logService.info(`${this.syncResourceLogLabel}: Updated local ui state`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                // update remote
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote ui state...`);
                const content = JSON.stringify({ storage: remote.all });
                remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote ui state.${remote.added.length ? ` Added: ${remote.added}.` : ''}${remote.updated.length ? ` Updated: ${remote.updated}.` : ''}${remote.removed.length ? ` Removed: ${remote.removed}.` : ''}`);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized ui state...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized ui state`);
            }
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)) {
                const content = await this.resolvePreviewContent(uri);
                return content ? stringify(JSON.parse(content), true) : content;
            }
            return null;
        }
        async hasLocalData() {
            try {
                const { storage } = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
                if (Object.keys(storage).length > 1 || storage[`${argvStoragePrefx}.locale`]?.value !== 'en') {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
        async getStorageKeys(lastSyncGlobalState) {
            const storageData = await this.userDataProfileStorageService.readStorageData(this.syncResource.profile);
            const user = [], machine = [];
            for (const [key, value] of storageData) {
                if (value.target === 0 /* StorageTarget.USER */) {
                    user.push(key);
                }
                else if (value.target === 1 /* StorageTarget.MACHINE */) {
                    machine.push(key);
                }
            }
            const registered = [...user, ...machine];
            const unregistered = lastSyncGlobalState?.storage ? Object.keys(lastSyncGlobalState.storage).filter(key => !key.startsWith(argvStoragePrefx) && !registered.includes(key) && storageData.get(key) !== undefined) : [];
            if (!platform_1.isWeb) {
                // Following keys are synced only in web. Do not sync these keys in other platforms
                const keysSyncedOnlyInWeb = [...userDataSync_1.ALL_SYNC_RESOURCES.map(resource => (0, userDataSync_1.getEnablementKey)(resource)), userDataSync_1.SYNC_SERVICE_URL_TYPE];
                unregistered.push(...keysSyncedOnlyInWeb);
                machine.push(...keysSyncedOnlyInWeb);
            }
            return { user, machine, unregistered };
        }
    };
    exports.GlobalStateSynchroniser = GlobalStateSynchroniser;
    exports.GlobalStateSynchroniser = GlobalStateSynchroniser = __decorate([
        __param(2, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(3, files_1.IFileService),
        __param(4, userDataSync_1.IUserDataSyncStoreService),
        __param(5, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(6, userDataSync_1.IUserDataSyncLogService),
        __param(7, environment_1.IEnvironmentService),
        __param(8, userDataSync_1.IUserDataSyncEnablementService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, storage_1.IStorageService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, instantiation_1.IInstantiationService)
    ], GlobalStateSynchroniser);
    let LocalGlobalStateProvider = class LocalGlobalStateProvider {
        constructor(fileService, environmentService, userDataProfileStorageService, logService) {
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.logService = logService;
        }
        async getLocalGlobalState(profile) {
            const storage = {};
            if (profile.isDefault) {
                const argvContent = await this.getLocalArgvContent();
                const argvValue = (0, json_1.parse)(argvContent);
                for (const argvProperty of argvProperties) {
                    if (argvValue[argvProperty] !== undefined) {
                        storage[`${argvStoragePrefx}${argvProperty}`] = { version: 1, value: argvValue[argvProperty] };
                    }
                }
            }
            const storageData = await this.userDataProfileStorageService.readStorageData(profile);
            for (const [key, value] of storageData) {
                if (value.value && value.target === 0 /* StorageTarget.USER */) {
                    storage[key] = { version: 1, value: value.value };
                }
            }
            return { storage };
        }
        async getLocalArgvContent() {
            try {
                this.logService.debug('GlobalStateSync#getLocalArgvContent', this.environmentService.argvResource);
                const content = await this.fileService.readFile(this.environmentService.argvResource);
                this.logService.debug('GlobalStateSync#getLocalArgvContent - Resolved', this.environmentService.argvResource);
                return content.value.toString();
            }
            catch (error) {
                this.logService.debug((0, errors_1.getErrorMessage)(error));
            }
            return '{}';
        }
        async writeLocalGlobalState({ added, removed, updated }, profile) {
            const syncResourceLogLabel = (0, abstractSynchronizer_1.getSyncResourceLogLabel)("globalState" /* SyncResource.GlobalState */, profile);
            const argv = {};
            const updatedStorage = new Map();
            const storageData = await this.userDataProfileStorageService.readStorageData(profile);
            const handleUpdatedStorage = (keys, storage) => {
                for (const key of keys) {
                    if (key.startsWith(argvStoragePrefx)) {
                        argv[key.substring(argvStoragePrefx.length)] = storage ? storage[key].value : undefined;
                        continue;
                    }
                    if (storage) {
                        const storageValue = storage[key];
                        if (storageValue.value !== storageData.get(key)?.value) {
                            updatedStorage.set(key, storageValue.value);
                        }
                    }
                    else {
                        if (storageData.get(key) !== undefined) {
                            updatedStorage.set(key, undefined);
                        }
                    }
                }
            };
            handleUpdatedStorage(Object.keys(added), added);
            handleUpdatedStorage(Object.keys(updated), updated);
            handleUpdatedStorage(removed);
            if (Object.keys(argv).length) {
                this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
                const argvContent = await this.getLocalArgvContent();
                let content = argvContent;
                for (const argvProperty of Object.keys(argv)) {
                    content = (0, content_1.edit)(content, [argvProperty], argv[argvProperty], {});
                }
                if (argvContent !== content) {
                    this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
                    await this.fileService.writeFile(this.environmentService.argvResource, buffer_1.VSBuffer.fromString(content));
                    this.logService.info(`${syncResourceLogLabel}: Updated locale.`);
                }
                this.logService.info(`${syncResourceLogLabel}: Updated locale`);
            }
            if (updatedStorage.size) {
                this.logService.trace(`${syncResourceLogLabel}: Updating global state...`);
                await this.userDataProfileStorageService.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
                this.logService.info(`${syncResourceLogLabel}: Updated global state`, [...updatedStorage.keys()]);
            }
        }
    };
    exports.LocalGlobalStateProvider = LocalGlobalStateProvider;
    exports.LocalGlobalStateProvider = LocalGlobalStateProvider = __decorate([
        __param(0, files_1.IFileService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(3, userDataSync_1.IUserDataSyncLogService)
    ], LocalGlobalStateProvider);
    let GlobalStateInitializer = class GlobalStateInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(storageService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService) {
            super("globalState" /* SyncResource.GlobalState */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async doInitialize(remoteUserData) {
            const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            if (!remoteGlobalState) {
                this.logService.info('Skipping initializing global state because remote global state does not exist.');
                return;
            }
            const argv = {};
            const storage = {};
            for (const key of Object.keys(remoteGlobalState.storage)) {
                if (key.startsWith(argvStoragePrefx)) {
                    argv[key.substring(argvStoragePrefx.length)] = remoteGlobalState.storage[key].value;
                }
                else {
                    if (this.storageService.get(key, 0 /* StorageScope.PROFILE */) === undefined) {
                        storage[key] = remoteGlobalState.storage[key].value;
                    }
                }
            }
            if (Object.keys(argv).length) {
                let content = '{}';
                try {
                    const fileContent = await this.fileService.readFile(this.environmentService.argvResource);
                    content = fileContent.value.toString();
                }
                catch (error) { }
                for (const argvProperty of Object.keys(argv)) {
                    content = (0, content_1.edit)(content, [argvProperty], argv[argvProperty], {});
                }
                await this.fileService.writeFile(this.environmentService.argvResource, buffer_1.VSBuffer.fromString(content));
            }
            if (Object.keys(storage).length) {
                const storageEntries = [];
                for (const key of Object.keys(storage)) {
                    storageEntries.push({ key, value: storage[key], scope: 0 /* StorageScope.PROFILE */, target: 0 /* StorageTarget.USER */ });
                }
                this.storageService.storeAll(storageEntries, true);
            }
        }
    };
    exports.GlobalStateInitializer = GlobalStateInitializer;
    exports.GlobalStateInitializer = GlobalStateInitializer = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, files_1.IFileService),
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, userDataSync_1.IUserDataSyncLogService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], GlobalStateInitializer);
    let UserDataSyncStoreTypeSynchronizer = class UserDataSyncStoreTypeSynchronizer {
        constructor(userDataSyncStoreClient, storageService, environmentService, fileService, logService) {
            this.userDataSyncStoreClient = userDataSyncStoreClient;
            this.storageService = storageService;
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.logService = logService;
        }
        getSyncStoreType(userData) {
            const remoteGlobalState = this.parseGlobalState(userData);
            return remoteGlobalState?.storage[userDataSync_1.SYNC_SERVICE_URL_TYPE]?.value;
        }
        async sync(userDataSyncStoreType) {
            const syncHeaders = (0, userDataSync_1.createSyncHeaders)((0, uuid_1.generateUuid)());
            try {
                return await this.doSync(userDataSyncStoreType, syncHeaders);
            }
            catch (e) {
                if (e instanceof userDataSync_1.UserDataSyncError) {
                    switch (e.code) {
                        case "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */:
                            this.logService.info(`Failed to synchronize UserDataSyncStoreType as there is a new remote version available. Synchronizing again...`);
                            return this.doSync(userDataSyncStoreType, syncHeaders);
                    }
                }
                throw e;
            }
        }
        async doSync(userDataSyncStoreType, syncHeaders) {
            // Read the global state from remote
            const globalStateUserData = await this.userDataSyncStoreClient.readResource("globalState" /* SyncResource.GlobalState */, null, undefined, syncHeaders);
            const remoteGlobalState = this.parseGlobalState(globalStateUserData) || { storage: {} };
            // Update the sync store type
            remoteGlobalState.storage[userDataSync_1.SYNC_SERVICE_URL_TYPE] = { value: userDataSyncStoreType, version: GLOBAL_STATE_DATA_VERSION };
            // Write the global state to remote
            const machineId = await (0, serviceMachineId_1.getServiceMachineId)(this.environmentService, this.fileService, this.storageService);
            const syncDataToUpdate = { version: GLOBAL_STATE_DATA_VERSION, machineId, content: stringify(remoteGlobalState, false) };
            await this.userDataSyncStoreClient.writeResource("globalState" /* SyncResource.GlobalState */, JSON.stringify(syncDataToUpdate), globalStateUserData.ref, undefined, syncHeaders);
        }
        parseGlobalState({ content }) {
            if (!content) {
                return null;
            }
            const syncData = JSON.parse(content);
            if ((0, abstractSynchronizer_1.isSyncData)(syncData)) {
                return syncData ? JSON.parse(syncData.content) : null;
            }
            throw new Error('Invalid remote data');
        }
    };
    exports.UserDataSyncStoreTypeSynchronizer = UserDataSyncStoreTypeSynchronizer;
    exports.UserDataSyncStoreTypeSynchronizer = UserDataSyncStoreTypeSynchronizer = __decorate([
        __param(1, storage_1.IStorageService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService)
    ], UserDataSyncStoreTypeSynchronizer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU3RhdGVTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi9nbG9iYWxTdGF0ZVN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO0lBQzdDLE1BQU0sY0FBYyxHQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFlNUMsU0FBZ0IsU0FBUyxDQUFDLFdBQXlCLEVBQUUsTUFBZTtRQUNuRSxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3ZGLE1BQU0sT0FBTyxHQUFxQyxFQUFFLENBQUM7UUFDckQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEUsV0FBVyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDOUIsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUEsaUNBQWlCLEVBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFORCw4QkFNQztJQUVELE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0lBRXBDOzs7Ozs7OztPQVFHO0lBQ0ksSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSwyQ0FBb0I7UUFXaEUsWUFDQyxPQUF5QixFQUN6QixVQUE4QixFQUNFLDZC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