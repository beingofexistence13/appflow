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
    exports.$eBb = exports.$dBb = exports.$cBb = exports.$bBb = exports.$aBb = void 0;
    const argvStoragePrefx = 'globalState.argv.';
    const argvProperties = ['locale'];
    function $aBb(globalState, format) {
        const storageKeys = globalState.storage ? Object.keys(globalState.storage).sort() : [];
        const storage = {};
        storageKeys.forEach(key => storage[key] = globalState.storage[key]);
        globalState.storage = storage;
        return format ? (0, jsonFormatter_1.$yS)(globalState, {}) : JSON.stringify(globalState);
    }
    exports.$aBb = $aBb;
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
    let $bBb = class $bBb extends abstractSynchronizer_1.$8Ab {
        constructor(profile, collection, Bb, fileService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, environmentService, userDataSyncEnablementService, telemetryService, configurationService, storageService, uriIdentityService, instantiationService) {
            super({ syncResource: "globalState" /* SyncResource.GlobalState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.Bb = Bb;
            this.pb = GLOBAL_STATE_DATA_VERSION;
            this.vb = this.h.joinPath(this.g, 'globalState.json');
            this.wb = this.vb.with({ scheme: userDataSync_1.$Wgb, authority: 'base' });
            this.xb = this.vb.with({ scheme: userDataSync_1.$Wgb, authority: 'local' });
            this.yb = this.vb.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' });
            this.zb = this.vb.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
            this.Ab = instantiationService.createInstance($cBb);
            this.B(fileService.watch(this.h.dirname(this.H.argvResource)));
            this.B(event_1.Event.any(
            /* Locale change */
            event_1.Event.filter(fileService.onDidFilesChange, e => e.contains(this.H.argvResource)), event_1.Event.filter(Bb.onDidChange, e => {
                /* StorageTarget has changed in profile storage */
                if (e.targetChanges.some(profile => this.syncResource.profile.id === profile.id)) {
                    return true;
                }
                /* User storage data has changed in profile storage */
                if (e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.target === 0 /* StorageTarget.USER */))) {
                    return true;
                }
                return false;
            }))((() => this.Q())));
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncGlobalState = lastSyncUserData && lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
            const localGlobalState = await this.Ab.getLocalGlobalState(this.syncResource.profile);
            if (remoteGlobalState) {
                this.O.trace(`${this.D}: Merging remote ui state with local ui state...`);
            }
            else {
                this.O.trace(`${this.D}: Remote ui state does not exist. Synchronizing ui state for the first time.`);
            }
            const storageKeys = await this.Jb(lastSyncGlobalState);
            const { local, remote } = (0, globalStateMerge_1.$_Ab)(localGlobalState.storage, remoteGlobalState ? remoteGlobalState.storage : null, lastSyncGlobalState ? lastSyncGlobalState.storage : null, storageKeys, this.O);
            const previewResult = {
                content: null,
                local,
                remote,
                localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote.all !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = $aBb(localGlobalState, false);
            return [{
                    baseResource: this.wb,
                    baseContent: lastSyncGlobalState ? $aBb(lastSyncGlobalState, false) : localContent,
                    localResource: this.xb,
                    localContent,
                    localUserData: localGlobalState,
                    remoteResource: this.yb,
                    remoteContent: remoteGlobalState ? $aBb(remoteGlobalState, false) : null,
                    previewResource: this.vb,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.zb,
                    storageKeys
                }];
        }
        async ub(lastSyncUserData) {
            const lastSyncGlobalState = lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
            if (lastSyncGlobalState === null) {
                return true;
            }
            const localGlobalState = await this.Ab.getLocalGlobalState(this.syncResource.profile);
            const storageKeys = await this.Jb(lastSyncGlobalState);
            const { remote } = (0, globalStateMerge_1.$_Ab)(localGlobalState.storage, lastSyncGlobalState.storage, lastSyncGlobalState.storage, storageKeys, this.O);
            return remote.all !== null;
        }
        async rb(resourcePreview, token) {
            return { ...resourcePreview.previewResult, hasConflicts: false };
        }
        async sb(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.h.isEqual(resource, this.xb)) {
                return this.Gb(resourcePreview);
            }
            /* Accept remote resource */
            if (this.h.isEqual(resource, this.yb)) {
                return this.Hb(resourcePreview);
            }
            /* Accept preview resource */
            if (this.h.isEqual(resource, this.vb)) {
                return resourcePreview.previewResult;
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async Gb(resourcePreview) {
            return {
                content: resourcePreview.localContent,
                local: { added: {}, removed: [], updated: {} },
                remote: { added: Object.keys(resourcePreview.localUserData.storage), removed: [], updated: [], all: resourcePreview.localUserData.storage },
                localChange: 0 /* Change.None */,
                remoteChange: 2 /* Change.Modified */,
            };
        }
        async Hb(resourcePreview) {
            if (resourcePreview.remoteContent !== null) {
                const remoteGlobalState = JSON.parse(resourcePreview.remoteContent);
                const { local, remote } = (0, globalStateMerge_1.$_Ab)(resourcePreview.localUserData.storage, remoteGlobalState.storage, null, resourcePreview.storageKeys, this.O);
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
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { localUserData } = resourcePreviews[0][0];
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.O.info(`${this.D}: No changes found during synchronizing ui state.`);
            }
            if (localChange !== 0 /* Change.None */) {
                // update local
                this.O.trace(`${this.D}: Updating local ui state...`);
                await this.nb(JSON.stringify(localUserData));
                await this.Ab.writeLocalGlobalState(local, this.syncResource.profile);
                this.O.info(`${this.D}: Updated local ui state`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                // update remote
                this.O.trace(`${this.D}: Updating remote ui state...`);
                const content = JSON.stringify({ storage: remote.all });
                remoteUserData = await this.mb(content, force ? null : remoteUserData.ref);
                this.O.info(`${this.D}: Updated remote ui state.${remote.added.length ? ` Added: ${remote.added}.` : ''}${remote.updated.length ? ` Updated: ${remote.updated}.` : ''}${remote.removed.length ? ` Removed: ${remote.removed}.` : ''}`);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.O.trace(`${this.D}: Updating last synchronized ui state...`);
                await this.fb(remoteUserData);
                this.O.info(`${this.D}: Updated last synchronized ui state`);
            }
        }
        async resolveContent(uri) {
            if (this.h.isEqual(this.yb, uri)
                || this.h.isEqual(this.wb, uri)
                || this.h.isEqual(this.xb, uri)
                || this.h.isEqual(this.zb, uri)) {
                const content = await this.db(uri);
                return content ? $aBb(JSON.parse(content), true) : content;
            }
            return null;
        }
        async hasLocalData() {
            try {
                const { storage } = await this.Ab.getLocalGlobalState(this.syncResource.profile);
                if (Object.keys(storage).length > 1 || storage[`${argvStoragePrefx}.locale`]?.value !== 'en') {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
        async Jb(lastSyncGlobalState) {
            const storageData = await this.Bb.readStorageData(this.syncResource.profile);
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
            if (!platform_1.$o) {
                // Following keys are synced only in web. Do not sync these keys in other platforms
                const keysSyncedOnlyInWeb = [...userDataSync_1.$Bgb.map(resource => (0, userDataSync_1.$Ogb)(resource)), userDataSync_1.$Ngb];
                unregistered.push(...keysSyncedOnlyInWeb);
                machine.push(...keysSyncedOnlyInWeb);
            }
            return { user, machine, unregistered };
        }
    };
    exports.$bBb = $bBb;
    exports.$bBb = $bBb = __decorate([
        __param(2, userDataProfileStorageService_1.$eAb),
        __param(3, files_1.$6j),
        __param(4, userDataSync_1.$Fgb),
        __param(5, userDataSync_1.$Ggb),
        __param(6, userDataSync_1.$Ugb),
        __param(7, environment_1.$Ih),
        __param(8, userDataSync_1.$Pgb),
        __param(9, telemetry_1.$9k),
        __param(10, configuration_1.$8h),
        __param(11, storage_1.$Vo),
        __param(12, uriIdentity_1.$Ck),
        __param(13, instantiation_1.$Ah)
    ], $bBb);
    let $cBb = class $cBb {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        async getLocalGlobalState(profile) {
            const storage = {};
            if (profile.isDefault) {
                const argvContent = await this.f();
                const argvValue = (0, json_1.$Lm)(argvContent);
                for (const argvProperty of argvProperties) {
                    if (argvValue[argvProperty] !== undefined) {
                        storage[`${argvStoragePrefx}${argvProperty}`] = { version: 1, value: argvValue[argvProperty] };
                    }
                }
            }
            const storageData = await this.c.readStorageData(profile);
            for (const [key, value] of storageData) {
                if (value.value && value.target === 0 /* StorageTarget.USER */) {
                    storage[key] = { version: 1, value: value.value };
                }
            }
            return { storage };
        }
        async f() {
            try {
                this.d.debug('GlobalStateSync#getLocalArgvContent', this.b.argvResource);
                const content = await this.a.readFile(this.b.argvResource);
                this.d.debug('GlobalStateSync#getLocalArgvContent - Resolved', this.b.argvResource);
                return content.value.toString();
            }
            catch (error) {
                this.d.debug((0, errors_1.$8)(error));
            }
            return '{}';
        }
        async writeLocalGlobalState({ added, removed, updated }, profile) {
            const syncResourceLogLabel = (0, abstractSynchronizer_1.$7Ab)("globalState" /* SyncResource.GlobalState */, profile);
            const argv = {};
            const updatedStorage = new Map();
            const storageData = await this.c.readStorageData(profile);
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
                this.d.trace(`${syncResourceLogLabel}: Updating locale...`);
                const argvContent = await this.f();
                let content = argvContent;
                for (const argvProperty of Object.keys(argv)) {
                    content = (0, content_1.edit)(content, [argvProperty], argv[argvProperty], {});
                }
                if (argvContent !== content) {
                    this.d.trace(`${syncResourceLogLabel}: Updating locale...`);
                    await this.a.writeFile(this.b.argvResource, buffer_1.$Fd.fromString(content));
                    this.d.info(`${syncResourceLogLabel}: Updated locale.`);
                }
                this.d.info(`${syncResourceLogLabel}: Updated locale`);
            }
            if (updatedStorage.size) {
                this.d.trace(`${syncResourceLogLabel}: Updating global state...`);
                await this.c.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
                this.d.info(`${syncResourceLogLabel}: Updated global state`, [...updatedStorage.keys()]);
            }
        }
    };
    exports.$cBb = $cBb;
    exports.$cBb = $cBb = __decorate([
        __param(0, files_1.$6j),
        __param(1, environment_1.$Ih),
        __param(2, userDataProfileStorageService_1.$eAb),
        __param(3, userDataSync_1.$Ugb)
    ], $cBb);
    let $dBb = class $dBb extends abstractSynchronizer_1.$$Ab {
        constructor(storageService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService) {
            super("globalState" /* SyncResource.GlobalState */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async o(remoteUserData) {
            const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            if (!remoteGlobalState) {
                this.j.info('Skipping initializing global state because remote global state does not exist.');
                return;
            }
            const argv = {};
            const storage = {};
            for (const key of Object.keys(remoteGlobalState.storage)) {
                if (key.startsWith(argvStoragePrefx)) {
                    argv[key.substring(argvStoragePrefx.length)] = remoteGlobalState.storage[key].value;
                }
                else {
                    if (this.l.get(key, 0 /* StorageScope.PROFILE */) === undefined) {
                        storage[key] = remoteGlobalState.storage[key].value;
                    }
                }
            }
            if (Object.keys(argv).length) {
                let content = '{}';
                try {
                    const fileContent = await this.k.readFile(this.h.argvResource);
                    content = fileContent.value.toString();
                }
                catch (error) { }
                for (const argvProperty of Object.keys(argv)) {
                    content = (0, content_1.edit)(content, [argvProperty], argv[argvProperty], {});
                }
                await this.k.writeFile(this.h.argvResource, buffer_1.$Fd.fromString(content));
            }
            if (Object.keys(storage).length) {
                const storageEntries = [];
                for (const key of Object.keys(storage)) {
                    storageEntries.push({ key, value: storage[key], scope: 0 /* StorageScope.PROFILE */, target: 0 /* StorageTarget.USER */ });
                }
                this.l.storeAll(storageEntries, true);
            }
        }
    };
    exports.$dBb = $dBb;
    exports.$dBb = $dBb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, files_1.$6j),
        __param(2, userDataProfile_1.$Ek),
        __param(3, environment_1.$Ih),
        __param(4, userDataSync_1.$Ugb),
        __param(5, uriIdentity_1.$Ck)
    ], $dBb);
    let $eBb = class $eBb {
        constructor(a, b, c, d, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
        }
        getSyncStoreType(userData) {
            const remoteGlobalState = this.h(userData);
            return remoteGlobalState?.storage[userDataSync_1.$Ngb]?.value;
        }
        async sync(userDataSyncStoreType) {
            const syncHeaders = (0, userDataSync_1.$Jgb)((0, uuid_1.$4f)());
            try {
                return await this.g(userDataSyncStoreType, syncHeaders);
            }
            catch (e) {
                if (e instanceof userDataSync_1.$Kgb) {
                    switch (e.code) {
                        case "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */:
                            this.f.info(`Failed to synchronize UserDataSyncStoreType as there is a new remote version available. Synchronizing again...`);
                            return this.g(userDataSyncStoreType, syncHeaders);
                    }
                }
                throw e;
            }
        }
        async g(userDataSyncStoreType, syncHeaders) {
            // Read the global state from remote
            const globalStateUserData = await this.a.readResource("globalState" /* SyncResource.GlobalState */, null, undefined, syncHeaders);
            const remoteGlobalState = this.h(globalStateUserData) || { storage: {} };
            // Update the sync store type
            remoteGlobalState.storage[userDataSync_1.$Ngb] = { value: userDataSyncStoreType, version: GLOBAL_STATE_DATA_VERSION };
            // Write the global state to remote
            const machineId = await (0, serviceMachineId_1.$2o)(this.c, this.d, this.b);
            const syncDataToUpdate = { version: GLOBAL_STATE_DATA_VERSION, machineId, content: $aBb(remoteGlobalState, false) };
            await this.a.writeResource("globalState" /* SyncResource.GlobalState */, JSON.stringify(syncDataToUpdate), globalStateUserData.ref, undefined, syncHeaders);
        }
        h({ content }) {
            if (!content) {
                return null;
            }
            const syncData = JSON.parse(content);
            if ((0, abstractSynchronizer_1.$6Ab)(syncData)) {
                return syncData ? JSON.parse(syncData.content) : null;
            }
            throw new Error('Invalid remote data');
        }
    };
    exports.$eBb = $eBb;
    exports.$eBb = $eBb = __decorate([
        __param(1, storage_1.$Vo),
        __param(2, environment_1.$Ih),
        __param(3, files_1.$6j),
        __param(4, log_1.$5i)
    ], $eBb);
});
//# sourceMappingURL=globalStateSync.js.map