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
define(["require", "exports", "vs/base/common/jsonFormatter", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/userDataProfilesManifestMerge", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, jsonFormatter_1, configuration_1, environment_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, userDataProfilesManifestMerge_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J4b = exports.$I4b = exports.$H4b = void 0;
    let $H4b = class $H4b extends abstractSynchronizer_1.$8Ab {
        constructor(profile, collection, vb, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
            super({ syncResource: "profiles" /* SyncResource.Profiles */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.vb = vb;
            this.pb = 2;
            this.previewResource = this.h.joinPath(this.g, 'profiles.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
            this.B(vb.onDidChangeProfiles(() => this.Q()));
        }
        async getLastSyncedProfiles() {
            const lastSyncUserData = await this.getLastSyncUserData();
            return lastSyncUserData?.syncData ? $J4b(lastSyncUserData.syncData) : null;
        }
        async getRemoteSyncedProfiles(manifest) {
            const lastSyncUserData = await this.getLastSyncUserData();
            const remoteUserData = await this.X(manifest, lastSyncUserData);
            return remoteUserData?.syncData ? $J4b(remoteUserData.syncData) : null;
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            if (!this.vb.isEnabled()) {
                throw new userDataSync_1.$Kgb('Cannot sync profiles because they are disabled', "LocalError" /* UserDataSyncErrorCode.LocalError */);
            }
            const remoteProfiles = remoteUserData.syncData ? $J4b(remoteUserData.syncData) : null;
            const lastSyncProfiles = lastSyncUserData?.syncData ? $J4b(lastSyncUserData.syncData) : null;
            const localProfiles = this.Db();
            const { local, remote } = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, lastSyncProfiles, []);
            const previewResult = {
                local, remote,
                content: lastSyncProfiles ? this.Eb(lastSyncProfiles) : null,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = $I4b(localProfiles, false);
            return [{
                    baseResource: this.baseResource,
                    baseContent: lastSyncProfiles ? this.Eb(lastSyncProfiles) : null,
                    localResource: this.localResource,
                    localContent,
                    remoteResource: this.remoteResource,
                    remoteContent: remoteProfiles ? this.Eb(remoteProfiles) : null,
                    remoteProfiles,
                    previewResource: this.previewResource,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.acceptedResource
                }];
        }
        async ub(lastSyncUserData) {
            const lastSyncProfiles = lastSyncUserData?.syncData ? $J4b(lastSyncUserData.syncData) : null;
            const localProfiles = this.Db();
            const { remote } = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, lastSyncProfiles, lastSyncProfiles, []);
            return !!remote?.added.length || !!remote?.removed.length || !!remote?.updated.length;
        }
        async rb(resourcePreview, token) {
            return { ...resourcePreview.previewResult, hasConflicts: false };
        }
        async sb(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.h.isEqual(resource, this.localResource)) {
                return this.Ab(resourcePreview);
            }
            /* Accept remote resource */
            if (this.h.isEqual(resource, this.remoteResource)) {
                return this.Bb(resourcePreview);
            }
            /* Accept preview resource */
            if (this.h.isEqual(resource, this.previewResource)) {
                return resourcePreview.previewResult;
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async Ab(resourcePreview) {
            const localProfiles = this.Db();
            const mergeResult = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, null, null, []);
            const { local, remote } = mergeResult;
            return {
                content: resourcePreview.localContent,
                local,
                remote,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
        }
        async Bb(resourcePreview) {
            const remoteProfiles = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
            const lastSyncProfiles = [];
            const localProfiles = [];
            for (const profile of this.Db()) {
                const remoteProfile = remoteProfiles?.find(remoteProfile => remoteProfile.id === profile.id);
                if (remoteProfile) {
                    lastSyncProfiles.push({ id: profile.id, name: profile.name, collection: remoteProfile.collection });
                    localProfiles.push(profile);
                }
            }
            if (remoteProfiles !== null) {
                const mergeResult = (0, userDataProfilesManifestMerge_1.$G4b)(localProfiles, remoteProfiles, lastSyncProfiles, []);
                const { local, remote } = mergeResult;
                return {
                    content: resourcePreview.remoteContent,
                    local,
                    remote,
                    localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                    remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
                };
            }
            else {
                return {
                    content: resourcePreview.remoteContent,
                    local: { added: [], removed: [], updated: [] },
                    remote: null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 0 /* Change.None */,
                };
            }
        }
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.O.info(`${this.D}: No changes found during synchronizing profiles.`);
            }
            const remoteProfiles = resourcePreviews[0][0].remoteProfiles || [];
            if (remoteProfiles.length + (remote?.added.length ?? 0) - (remote?.removed.length ?? 0) > 20) {
                throw new userDataSync_1.$Kgb('Too many profiles to sync. Please remove some profiles and try again.', "LocalTooManyProfiles" /* UserDataSyncErrorCode.LocalTooManyProfiles */);
            }
            if (localChange !== 0 /* Change.None */) {
                await this.nb($I4b(this.Db(), false));
                const promises = [];
                for (const profile of local.added) {
                    promises.push((async () => {
                        this.O.trace(`${this.D}: Creating '${profile.name}' profile...`);
                        await this.vb.createProfile(profile.id, profile.name, { shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
                        this.O.info(`${this.D}: Created profile '${profile.name}'.`);
                    })());
                }
                for (const profile of local.removed) {
                    promises.push((async () => {
                        this.O.trace(`${this.D}: Removing '${profile.name}' profile...`);
                        await this.vb.removeProfile(profile);
                        this.O.info(`${this.D}: Removed profile '${profile.name}'.`);
                    })());
                }
                for (const profile of local.updated) {
                    const localProfile = this.vb.profiles.find(p => p.id === profile.id);
                    if (localProfile) {
                        promises.push((async () => {
                            this.O.trace(`${this.D}: Updating '${profile.name}' profile...`);
                            await this.vb.updateProfile(localProfile, { name: profile.name, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
                            this.O.info(`${this.D}: Updated profile '${profile.name}'.`);
                        })());
                    }
                    else {
                        this.O.info(`${this.D}: Could not find profile with id '${profile.id}' to update.`);
                    }
                }
                await Promise.all(promises);
            }
            if (remoteChange !== 0 /* Change.None */) {
                this.O.trace(`${this.D}: Updating remote profiles...`);
                const addedCollections = [];
                const canAddRemoteProfiles = remoteProfiles.length + (remote?.added.length ?? 0) <= 20;
                if (canAddRemoteProfiles) {
                    for (const profile of remote?.added || []) {
                        const collection = await this.J.createCollection(this.F);
                        addedCollections.push(collection);
                        remoteProfiles.push({ id: profile.id, name: profile.name, collection, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
                    }
                }
                else {
                    this.O.info(`${this.D}: Could not create remote profiles as there are too many profiles.`);
                }
                for (const profile of remote?.removed || []) {
                    remoteProfiles.splice(remoteProfiles.findIndex(({ id }) => profile.id === id), 1);
                }
                for (const profile of remote?.updated || []) {
                    const profileToBeUpdated = remoteProfiles.find(({ id }) => profile.id === id);
                    if (profileToBeUpdated) {
                        remoteProfiles.splice(remoteProfiles.indexOf(profileToBeUpdated), 1, { ...profileToBeUpdated, id: profile.id, name: profile.name, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
                    }
                }
                try {
                    remoteUserData = await this.updateRemoteProfiles(remoteProfiles, force ? null : remoteUserData.ref);
                    this.O.info(`${this.D}: Updated remote profiles.${canAddRemoteProfiles && remote?.added.length ? ` Added: ${JSON.stringify(remote.added.map(e => e.name))}.` : ''}${remote?.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map(e => e.name))}.` : ''}${remote?.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map(e => e.name))}.` : ''}`);
                }
                catch (error) {
                    if (addedCollections.length) {
                        this.O.info(`${this.D}: Failed to update remote profiles. Cleaning up added collections...`);
                        for (const collection of addedCollections) {
                            await this.J.deleteCollection(collection, this.F);
                        }
                    }
                    throw error;
                }
                for (const profile of remote?.removed || []) {
                    await this.J.deleteCollection(profile.collection, this.F);
                }
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.O.trace(`${this.D}: Updating last synchronized profiles...`);
                await this.fb(remoteUserData);
                this.O.info(`${this.D}: Updated last synchronized profiles.`);
            }
        }
        async updateRemoteProfiles(profiles, ref) {
            return this.mb(this.Eb(profiles), ref);
        }
        async hasLocalData() {
            return this.Db().length > 0;
        }
        async resolveContent(uri) {
            if (this.h.isEqual(this.remoteResource, uri)
                || this.h.isEqual(this.baseResource, uri)
                || this.h.isEqual(this.localResource, uri)
                || this.h.isEqual(this.acceptedResource, uri)) {
                const content = await this.db(uri);
                return content ? (0, jsonFormatter_1.$yS)(JSON.parse(content), {}) : content;
            }
            return null;
        }
        Db() {
            return this.vb.profiles.filter(p => !p.isDefault && !p.isTransient);
        }
        Eb(profiles) {
            return JSON.stringify([...profiles].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };
    exports.$H4b = $H4b;
    exports.$H4b = $H4b = __decorate([
        __param(2, userDataProfile_1.$Ek),
        __param(3, files_1.$6j),
        __param(4, environment_1.$Ih),
        __param(5, storage_1.$Vo),
        __param(6, userDataSync_1.$Fgb),
        __param(7, userDataSync_1.$Ggb),
        __param(8, userDataSync_1.$Ugb),
        __param(9, configuration_1.$8h),
        __param(10, userDataSync_1.$Pgb),
        __param(11, telemetry_1.$9k),
        __param(12, uriIdentity_1.$Ck)
    ], $H4b);
    function $I4b(profiles, format) {
        const result = [...profiles].sort((a, b) => a.name.localeCompare(b.name)).map(p => ({ id: p.id, name: p.name }));
        return format ? (0, jsonFormatter_1.$yS)(result, {}) : JSON.stringify(result);
    }
    exports.$I4b = $I4b;
    function $J4b(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.$J4b = $J4b;
});
//# sourceMappingURL=userDataProfilesManifestSync.js.map