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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/objects", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/snippetsMerge", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, buffer_1, event_1, objects_1, configuration_1, environment_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, snippetsMerge_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$32b = exports.$22b = exports.$12b = void 0;
    function $12b(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.$12b = $12b;
    let $22b = class $22b extends abstractSynchronizer_1.$8Ab {
        constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
            super({ syncResource: "snippets" /* SyncResource.Snippets */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.pb = 1;
            this.vb = profile.snippetsHome;
            this.B(this.G.watch(environmentService.userRoamingDataHome));
            this.B(this.G.watch(this.vb));
            this.B(event_1.Event.filter(this.G.onDidFilesChange, e => e.affects(this.vb))(() => this.Q()));
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const local = await this.Hb();
            const localSnippets = this.Gb(local);
            const remoteSnippets = remoteUserData.syncData ? this.Fb(remoteUserData.syncData) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncSnippets = lastSyncUserData && lastSyncUserData.syncData ? this.Fb(lastSyncUserData.syncData) : null;
            if (remoteSnippets) {
                this.O.trace(`${this.D}: Merging remote snippets with local snippets...`);
            }
            else {
                this.O.trace(`${this.D}: Remote snippets does not exist. Synchronizing snippets for the first time.`);
            }
            const mergeResult = (0, snippetsMerge_1.$Y2b)(localSnippets, remoteSnippets, lastSyncSnippets);
            return this.Bb(mergeResult, local, remoteSnippets || {}, lastSyncSnippets || {});
        }
        async ub(lastSyncUserData) {
            const lastSyncSnippets = lastSyncUserData.syncData ? this.Fb(lastSyncUserData.syncData) : null;
            if (lastSyncSnippets === null) {
                return true;
            }
            const local = await this.Hb();
            const localSnippets = this.Gb(local);
            const mergeResult = (0, snippetsMerge_1.$Y2b)(localSnippets, lastSyncSnippets, lastSyncSnippets);
            return Object.keys(mergeResult.remote.added).length > 0 || Object.keys(mergeResult.remote.updated).length > 0 || mergeResult.remote.removed.length > 0 || mergeResult.conflicts.length > 0;
        }
        async rb(resourcePreview, token) {
            return resourcePreview.previewResult;
        }
        async sb(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.h.isEqualOrParent(resource, this.g.with({ scheme: userDataSync_1.$Wgb, authority: 'local' }))) {
                return {
                    content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: resourcePreview.fileContent
                        ? resourcePreview.remoteContent !== null ? 2 /* Change.Modified */ : 1 /* Change.Added */
                        : 3 /* Change.Deleted */
                };
            }
            /* Accept remote resource */
            if (this.h.isEqualOrParent(resource, this.g.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }))) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: resourcePreview.remoteContent !== null
                        ? resourcePreview.fileContent ? 2 /* Change.Modified */ : 1 /* Change.Added */
                        : 3 /* Change.Deleted */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.h.isEqualOrParent(resource, this.g)) {
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
                        localChange: content === null
                            ? resourcePreview.fileContent !== null ? 3 /* Change.Deleted */ : 0 /* Change.None */
                            : 2 /* Change.Modified */,
                        remoteChange: content === null
                            ? resourcePreview.remoteContent !== null ? 3 /* Change.Deleted */ : 0 /* Change.None */
                            : 2 /* Change.Modified */
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const accptedResourcePreviews = resourcePreviews.map(([resourcePreview, acceptResult]) => ({ ...resourcePreview, acceptResult }));
            if (accptedResourcePreviews.every(({ localChange, remoteChange }) => localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */)) {
                this.O.info(`${this.D}: No changes found during synchronizing snippets.`);
            }
            if (accptedResourcePreviews.some(({ localChange }) => localChange !== 0 /* Change.None */)) {
                // back up all snippets
                await this.Cb(accptedResourcePreviews);
                await this.Db(accptedResourcePreviews, force);
            }
            if (accptedResourcePreviews.some(({ remoteChange }) => remoteChange !== 0 /* Change.None */)) {
                remoteUserData = await this.Eb(accptedResourcePreviews, remoteUserData, force);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.O.trace(`${this.D}: Updating last synchronized snippets...`);
                await this.fb(remoteUserData);
                this.O.info(`${this.D}: Updated last synchronized snippets`);
            }
            for (const { previewResource } of accptedResourcePreviews) {
                // Delete the preview
                try {
                    await this.G.del(previewResource);
                }
                catch (e) { /* ignore */ }
            }
        }
        Bb(snippetsMergeResult, localFileContent, remoteSnippets, baseSnippets) {
            const resourcePreviews = new Map();
            /* Snippets added remotely -> add locally */
            for (const key of Object.keys(snippetsMergeResult.local.added)) {
                const previewResult = {
                    content: snippetsMergeResult.local.added[key],
                    hasConflicts: false,
                    localChange: 1 /* Change.Added */,
                    remoteChange: 0 /* Change.None */,
                };
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: null,
                    fileContent: null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    localContent: null,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Snippets updated remotely -> update locally */
            for (const key of Object.keys(snippetsMergeResult.local.updated)) {
                const previewResult = {
                    content: snippetsMergeResult.local.updated[key],
                    hasConflicts: false,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
                const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Snippets removed remotely -> remove locally */
            for (const key of snippetsMergeResult.local.removed) {
                const previewResult = {
                    content: null,
                    hasConflicts: false,
                    localChange: 3 /* Change.Deleted */,
                    remoteChange: 0 /* Change.None */,
                };
                const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: null,
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Snippets added locally -> add remotely */
            for (const key of Object.keys(snippetsMergeResult.remote.added)) {
                const previewResult = {
                    content: snippetsMergeResult.remote.added[key],
                    hasConflicts: false,
                    localChange: 0 /* Change.None */,
                    remoteChange: 1 /* Change.Added */,
                };
                const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: null,
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Snippets updated locally -> update remotely */
            for (const key of Object.keys(snippetsMergeResult.remote.updated)) {
                const previewResult = {
                    content: snippetsMergeResult.remote.updated[key],
                    hasConflicts: false,
                    localChange: 0 /* Change.None */,
                    remoteChange: 2 /* Change.Modified */,
                };
                const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Snippets removed locally -> remove remotely */
            for (const key of snippetsMergeResult.remote.removed) {
                const previewResult = {
                    content: null,
                    hasConflicts: false,
                    localChange: 0 /* Change.None */,
                    remoteChange: 3 /* Change.Deleted */,
                };
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    fileContent: null,
                    localContent: null,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Snippets with conflicts */
            for (const key of snippetsMergeResult.conflicts) {
                const previewResult = {
                    content: baseSnippets[key] ?? null,
                    hasConflicts: true,
                    localChange: localFileContent[key] ? 2 /* Change.Modified */ : 1 /* Change.Added */,
                    remoteChange: remoteSnippets[key] ? 2 /* Change.Modified */ : 1 /* Change.Added */
                };
                const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                resourcePreviews.set(key, {
                    baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                    fileContent: localFileContent[key] || null,
                    localContent,
                    remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                    remoteContent: remoteSnippets[key] || null,
                    previewResource: this.h.joinPath(this.g, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                });
            }
            /* Unmodified Snippets */
            for (const key of Object.keys(localFileContent)) {
                if (!resourcePreviews.has(key)) {
                    const previewResult = {
                        content: localFileContent[key] ? localFileContent[key].value.toString() : null,
                        hasConflicts: false,
                        localChange: 0 /* Change.None */,
                        remoteChange: 0 /* Change.None */
                    };
                    const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                    resourcePreviews.set(key, {
                        baseResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'base' }),
                        baseContent: baseSnippets[key] ?? null,
                        localResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'local' }),
                        fileContent: localFileContent[key] || null,
                        localContent,
                        remoteResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }),
                        remoteContent: remoteSnippets[key] || null,
                        previewResource: this.h.joinPath(this.g, key),
                        previewResult,
                        localChange: previewResult.localChange,
                        remoteChange: previewResult.remoteChange,
                        acceptedResource: this.h.joinPath(this.g, key).with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })
                    });
                }
            }
            return [...resourcePreviews.values()];
        }
        async resolveContent(uri) {
            if (this.h.isEqualOrParent(uri, this.g.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' }))
                || this.h.isEqualOrParent(uri, this.g.with({ scheme: userDataSync_1.$Wgb, authority: 'local' }))
                || this.h.isEqualOrParent(uri, this.g.with({ scheme: userDataSync_1.$Wgb, authority: 'base' }))
                || this.h.isEqualOrParent(uri, this.g.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' }))) {
                return this.db(uri);
            }
            return null;
        }
        async hasLocalData() {
            try {
                const localSnippets = await this.Hb();
                if (Object.keys(localSnippets).length) {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
        async Cb(resourcePreviews) {
            const local = {};
            for (const resourcePreview of resourcePreviews) {
                if (resourcePreview.fileContent) {
                    local[this.h.basename(resourcePreview.localResource)] = resourcePreview.fileContent;
                }
            }
            await this.nb(JSON.stringify(this.Gb(local)));
        }
        async Db(resourcePreviews, force) {
            for (const { fileContent, acceptResult, localResource, remoteResource, localChange } of resourcePreviews) {
                if (localChange !== 0 /* Change.None */) {
                    const key = remoteResource ? this.h.basename(remoteResource) : this.h.basename(localResource);
                    const resource = this.h.joinPath(this.vb, key);
                    // Removed
                    if (localChange === 3 /* Change.Deleted */) {
                        this.O.trace(`${this.D}: Deleting snippet...`, this.h.basename(resource));
                        await this.G.del(resource);
                        this.O.info(`${this.D}: Deleted snippet`, this.h.basename(resource));
                    }
                    // Added
                    else if (localChange === 1 /* Change.Added */) {
                        this.O.trace(`${this.D}: Creating snippet...`, this.h.basename(resource));
                        await this.G.createFile(resource, buffer_1.$Fd.fromString(acceptResult.content), { overwrite: force });
                        this.O.info(`${this.D}: Created snippet`, this.h.basename(resource));
                    }
                    // Updated
                    else {
                        this.O.trace(`${this.D}: Updating snippet...`, this.h.basename(resource));
                        await this.G.writeFile(resource, buffer_1.$Fd.fromString(acceptResult.content), force ? undefined : fileContent);
                        this.O.info(`${this.D}: Updated snippet`, this.h.basename(resource));
                    }
                }
            }
        }
        async Eb(resourcePreviews, remoteUserData, forcePush) {
            const currentSnippets = remoteUserData.syncData ? this.Fb(remoteUserData.syncData) : {};
            const newSnippets = (0, objects_1.$Vm)(currentSnippets);
            for (const { acceptResult, localResource, remoteResource, remoteChange } of resourcePreviews) {
                if (remoteChange !== 0 /* Change.None */) {
                    const key = localResource ? this.h.basename(localResource) : this.h.basename(remoteResource);
                    if (remoteChange === 3 /* Change.Deleted */) {
                        delete newSnippets[key];
                    }
                    else {
                        newSnippets[key] = acceptResult.content;
                    }
                }
            }
            if (!(0, snippetsMerge_1.$Z2b)(currentSnippets, newSnippets)) {
                // update remote
                this.O.trace(`${this.D}: Updating remote snippets...`);
                remoteUserData = await this.mb(JSON.stringify(newSnippets), forcePush ? null : remoteUserData.ref);
                this.O.info(`${this.D}: Updated remote snippets`);
            }
            return remoteUserData;
        }
        Fb(syncData) {
            return $12b(syncData);
        }
        Gb(snippetsFileContents) {
            const snippets = {};
            for (const key of Object.keys(snippetsFileContents)) {
                snippets[key] = snippetsFileContents[key].value.toString();
            }
            return snippets;
        }
        async Hb() {
            const snippets = {};
            let stat;
            try {
                stat = await this.G.resolve(this.vb);
            }
            catch (e) {
                // No snippets
                if (e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return snippets;
                }
                else {
                    throw e;
                }
            }
            for (const entry of stat.children || []) {
                const resource = entry.resource;
                const extension = this.h.extname(resource);
                if (extension === '.json' || extension === '.code-snippets') {
                    const key = this.h.relativePath(this.vb, resource);
                    const content = await this.G.readFile(resource);
                    snippets[key] = content;
                }
            }
            return snippets;
        }
    };
    exports.$22b = $22b;
    exports.$22b = $22b = __decorate([
        __param(2, environment_1.$Ih),
        __param(3, files_1.$6j),
        __param(4, storage_1.$Vo),
        __param(5, userDataSync_1.$Fgb),
        __param(6, userDataSync_1.$Ggb),
        __param(7, userDataSync_1.$Ugb),
        __param(8, configuration_1.$8h),
        __param(9, userDataSync_1.$Pgb),
        __param(10, telemetry_1.$9k),
        __param(11, uriIdentity_1.$Ck)
    ], $22b);
    let $32b = class $32b extends abstractSynchronizer_1.$$Ab {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("snippets" /* SyncResource.Snippets */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async o(remoteUserData) {
            const remoteSnippets = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            if (!remoteSnippets) {
                this.j.info('Skipping initializing snippets because remote snippets does not exist.');
                return;
            }
            const isEmpty = await this.i();
            if (!isEmpty) {
                this.j.info('Skipping initializing snippets because local snippets exist.');
                return;
            }
            for (const key of Object.keys(remoteSnippets)) {
                const content = remoteSnippets[key];
                if (content) {
                    const resource = this.d.joinPath(this.g.defaultProfile.snippetsHome, key);
                    await this.k.createFile(resource, buffer_1.$Fd.fromString(content));
                    this.j.info('Created snippet', this.d.basename(resource));
                }
            }
            await this.n(remoteUserData);
        }
        async i() {
            try {
                const stat = await this.k.resolve(this.g.defaultProfile.snippetsHome);
                return !stat.children?.length;
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            }
        }
    };
    exports.$32b = $32b;
    exports.$32b = $32b = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataProfile_1.$Ek),
        __param(2, environment_1.$Ih),
        __param(3, userDataSync_1.$Ugb),
        __param(4, storage_1.$Vo),
        __param(5, uriIdentity_1.$Ck)
    ], $32b);
});
//# sourceMappingURL=snippetsSync.js.map