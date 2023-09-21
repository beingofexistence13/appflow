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
define(["require", "exports", "vs/base/common/buffer", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, buffer_1, configuration_1, environment_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$62b = exports.$52b = exports.$42b = void 0;
    function $42b(syncContent, logService) {
        try {
            const parsed = JSON.parse(syncContent);
            return parsed.tasks ?? null;
        }
        catch (e) {
            logService.error(e);
            return null;
        }
    }
    exports.$42b = $42b;
    let $52b = class $52b extends abstractSynchronizer_1.$9Ab {
        constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, telemetryService, uriIdentityService) {
            super(profile.tasksResource, { syncResource: "tasks" /* SyncResource.Tasks */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.pb = 1;
            this.Ab = this.h.joinPath(this.g, 'tasks.json');
            this.Bb = this.Ab.with({ scheme: userDataSync_1.$Wgb, authority: 'base' });
            this.Cb = this.Ab.with({ scheme: userDataSync_1.$Wgb, authority: 'local' });
            this.Db = this.Ab.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' });
            this.Eb = this.Ab.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
            const remoteContent = remoteUserData.syncData ? $42b(remoteUserData.syncData.content, this.O) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncContent = lastSyncUserData?.syncData ? $42b(lastSyncUserData.syncData.content, this.O) : null;
            // Get file content last to get the latest
            const fileContent = await this.vb();
            let content = null;
            let hasLocalChanged = false;
            let hasRemoteChanged = false;
            let hasConflicts = false;
            if (remoteUserData.syncData) {
                const localContent = fileContent ? fileContent.value.toString() : null;
                if (!lastSyncContent // First time sync
                    || lastSyncContent !== localContent // Local has forwarded
                    || lastSyncContent !== remoteContent // Remote has forwarded
                ) {
                    this.O.trace(`${this.D}: Merging remote tasks with local tasks...`);
                    const result = merge(localContent, remoteContent, lastSyncContent);
                    content = result.content;
                    hasConflicts = result.hasConflicts;
                    hasLocalChanged = result.hasLocalChanged;
                    hasRemoteChanged = result.hasRemoteChanged;
                }
            }
            // First time syncing to remote
            else if (fileContent) {
                this.O.trace(`${this.D}: Remote tasks does not exist. Synchronizing tasks for the first time.`);
                content = fileContent.value.toString();
                hasRemoteChanged = true;
            }
            const previewResult = {
                content: hasConflicts ? lastSyncContent : content,
                localChange: hasLocalChanged ? fileContent ? 2 /* Change.Modified */ : 1 /* Change.Added */ : 0 /* Change.None */,
                remoteChange: hasRemoteChanged ? 2 /* Change.Modified */ : 0 /* Change.None */,
                hasConflicts
            };
            const localContent = fileContent ? fileContent.value.toString() : null;
            return [{
                    fileContent,
                    baseResource: this.Bb,
                    baseContent: lastSyncContent,
                    localResource: this.Cb,
                    localContent,
                    localChange: previewResult.localChange,
                    remoteResource: this.Db,
                    remoteContent,
                    remoteChange: previewResult.remoteChange,
                    previewResource: this.Ab,
                    previewResult,
                    acceptedResource: this.Eb,
                }];
        }
        async ub(lastSyncUserData) {
            const lastSyncContent = lastSyncUserData?.syncData ? $42b(lastSyncUserData.syncData.content, this.O) : null;
            if (lastSyncContent === null) {
                return true;
            }
            const fileContent = await this.vb();
            const localContent = fileContent ? fileContent.value.toString() : null;
            const result = merge(localContent, lastSyncContent, lastSyncContent);
            return result.hasLocalChanged || result.hasRemoteChanged;
        }
        async rb(resourcePreview, token) {
            return resourcePreview.previewResult;
        }
        async sb(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.h.isEqual(resource, this.Cb)) {
                return {
                    content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 2 /* Change.Modified */,
                };
            }
            /* Accept remote resource */
            if (this.h.isEqual(resource, this.Db)) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.h.isEqual(resource, this.Ab)) {
                if (content === undefined) {
                    return {
                        content: resourcePreview.previewResult.content,
                        localChange: resourcePreview.previewResult.localChange,
                        remoteChange: resourcePreview.previewResult.remoteChange,
                    };
                }
                else {
                    return {
                        content,
                        localChange: 2 /* Change.Modified */,
                        remoteChange: 2 /* Change.Modified */,
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { fileContent } = resourcePreviews[0][0];
            const { content, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.O.info(`${this.D}: No changes found during synchronizing tasks.`);
            }
            if (localChange !== 0 /* Change.None */) {
                this.O.trace(`${this.D}: Updating local tasks...`);
                if (fileContent) {
                    await this.nb(JSON.stringify(this.Kb(fileContent.value.toString())));
                }
                if (content) {
                    await this.wb(content, fileContent, force);
                }
                else {
                    await this.xb();
                }
                this.O.info(`${this.D}: Updated local tasks`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                this.O.trace(`${this.D}: Updating remote tasks...`);
                const remoteContents = JSON.stringify(this.Kb(content));
                remoteUserData = await this.mb(remoteContents, force ? null : remoteUserData.ref);
                this.O.info(`${this.D}: Updated remote tasks`);
            }
            // Delete the preview
            try {
                await this.G.del(this.Ab);
            }
            catch (e) { /* ignore */ }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                this.O.trace(`${this.D}: Updating last synchronized tasks...`);
                await this.fb(remoteUserData);
                this.O.info(`${this.D}: Updated last synchronized tasks`);
            }
        }
        async hasLocalData() {
            return this.G.exists(this.r);
        }
        async resolveContent(uri) {
            if (this.h.isEqual(this.Db, uri)
                || this.h.isEqual(this.Bb, uri)
                || this.h.isEqual(this.Cb, uri)
                || this.h.isEqual(this.Eb, uri)) {
                return this.db(uri);
            }
            return null;
        }
        Kb(tasks) {
            return tasks ? { tasks } : {};
        }
    };
    exports.$52b = $52b;
    exports.$52b = $52b = __decorate([
        __param(2, userDataSync_1.$Fgb),
        __param(3, userDataSync_1.$Ggb),
        __param(4, userDataSync_1.$Ugb),
        __param(5, configuration_1.$8h),
        __param(6, userDataSync_1.$Pgb),
        __param(7, files_1.$6j),
        __param(8, environment_1.$Ih),
        __param(9, storage_1.$Vo),
        __param(10, telemetry_1.$9k),
        __param(11, uriIdentity_1.$Ck)
    ], $52b);
    let $62b = class $62b extends abstractSynchronizer_1.$$Ab {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("tasks" /* SyncResource.Tasks */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
            this.c = this.g.defaultProfile.tasksResource;
        }
        async o(remoteUserData) {
            const tasksContent = remoteUserData.syncData ? $42b(remoteUserData.syncData.content, this.j) : null;
            if (!tasksContent) {
                this.j.info('Skipping initializing tasks because remote tasks does not exist.');
                return;
            }
            const isEmpty = await this.p();
            if (!isEmpty) {
                this.j.info('Skipping initializing tasks because local tasks exist.');
                return;
            }
            await this.k.writeFile(this.c, buffer_1.$Fd.fromString(tasksContent));
            await this.n(remoteUserData);
        }
        async p() {
            return this.k.exists(this.c);
        }
    };
    exports.$62b = $62b;
    exports.$62b = $62b = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataProfile_1.$Ek),
        __param(2, environment_1.$Ih),
        __param(3, userDataSync_1.$Ugb),
        __param(4, storage_1.$Vo),
        __param(5, uriIdentity_1.$Ck)
    ], $62b);
    function merge(originalLocalContent, originalRemoteContent, baseContent) {
        /* no changes */
        if (originalLocalContent === null && originalRemoteContent === null && baseContent === null) {
            return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
        }
        /* no changes */
        if (originalLocalContent === originalRemoteContent) {
            return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
        }
        const localForwarded = baseContent !== originalLocalContent;
        const remoteForwarded = baseContent !== originalRemoteContent;
        /* no changes */
        if (!localForwarded && !remoteForwarded) {
            return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
        }
        /* local has changed and remote has not */
        if (localForwarded && !remoteForwarded) {
            return { content: originalLocalContent, hasRemoteChanged: true, hasLocalChanged: false, hasConflicts: false };
        }
        /* remote has changed and local has not */
        if (remoteForwarded && !localForwarded) {
            return { content: originalRemoteContent, hasLocalChanged: true, hasRemoteChanged: false, hasConflicts: false };
        }
        return { content: originalLocalContent, hasLocalChanged: true, hasRemoteChanged: true, hasConflicts: true };
    }
});
//# sourceMappingURL=tasksSync.js.map