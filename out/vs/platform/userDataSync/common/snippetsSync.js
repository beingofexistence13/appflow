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
    exports.SnippetsInitializer = exports.SnippetsSynchroniser = exports.parseSnippets = void 0;
    function parseSnippets(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.parseSnippets = parseSnippets;
    let SnippetsSynchroniser = class SnippetsSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
            super({ syncResource: "snippets" /* SyncResource.Snippets */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.version = 1;
            this.snippetsFolder = profile.snippetsHome;
            this._register(this.fileService.watch(environmentService.userRoamingDataHome));
            this._register(this.fileService.watch(this.snippetsFolder));
            this._register(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.affects(this.snippetsFolder))(() => this.triggerLocalChange()));
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const local = await this.getSnippetsFileContents();
            const localSnippets = this.toSnippetsContents(local);
            const remoteSnippets = remoteUserData.syncData ? this.parseSnippets(remoteUserData.syncData) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncSnippets = lastSyncUserData && lastSyncUserData.syncData ? this.parseSnippets(lastSyncUserData.syncData) : null;
            if (remoteSnippets) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote snippets with local snippets...`);
            }
            else {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote snippets does not exist. Synchronizing snippets for the first time.`);
            }
            const mergeResult = (0, snippetsMerge_1.merge)(localSnippets, remoteSnippets, lastSyncSnippets);
            return this.getResourcePreviews(mergeResult, local, remoteSnippets || {}, lastSyncSnippets || {});
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncSnippets = lastSyncUserData.syncData ? this.parseSnippets(lastSyncUserData.syncData) : null;
            if (lastSyncSnippets === null) {
                return true;
            }
            const local = await this.getSnippetsFileContents();
            const localSnippets = this.toSnippetsContents(local);
            const mergeResult = (0, snippetsMerge_1.merge)(localSnippets, lastSyncSnippets, lastSyncSnippets);
            return Object.keys(mergeResult.remote.added).length > 0 || Object.keys(mergeResult.remote.updated).length > 0 || mergeResult.remote.removed.length > 0 || mergeResult.conflicts.length > 0;
        }
        async getMergeResult(resourcePreview, token) {
            return resourcePreview.previewResult;
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }))) {
                return {
                    content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: resourcePreview.fileContent
                        ? resourcePreview.remoteContent !== null ? 2 /* Change.Modified */ : 1 /* Change.Added */
                        : 3 /* Change.Deleted */
                };
            }
            /* Accept remote resource */
            if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }))) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: resourcePreview.remoteContent !== null
                        ? resourcePreview.fileContent ? 2 /* Change.Modified */ : 1 /* Change.Added */
                        : 3 /* Change.Deleted */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder)) {
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
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const accptedResourcePreviews = resourcePreviews.map(([resourcePreview, acceptResult]) => ({ ...resourcePreview, acceptResult }));
            if (accptedResourcePreviews.every(({ localChange, remoteChange }) => localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */)) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing snippets.`);
            }
            if (accptedResourcePreviews.some(({ localChange }) => localChange !== 0 /* Change.None */)) {
                // back up all snippets
                await this.updateLocalBackup(accptedResourcePreviews);
                await this.updateLocalSnippets(accptedResourcePreviews, force);
            }
            if (accptedResourcePreviews.some(({ remoteChange }) => remoteChange !== 0 /* Change.None */)) {
                remoteUserData = await this.updateRemoteSnippets(accptedResourcePreviews, remoteUserData, force);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized snippets...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized snippets`);
            }
            for (const { previewResource } of accptedResourcePreviews) {
                // Delete the preview
                try {
                    await this.fileService.del(previewResource);
                }
                catch (e) { /* ignore */ }
            }
        }
        getResourcePreviews(snippetsMergeResult, localFileContent, remoteSnippets, baseSnippets) {
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: null,
                    fileContent: null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    localContent: null,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: null,
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: null,
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: localFileContent[key],
                    localContent,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: null,
                    localContent: null,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: remoteSnippets[key],
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: localFileContent[key] || null,
                    localContent,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: remoteSnippets[key] || null,
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
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
                        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }),
                        baseContent: baseSnippets[key] ?? null,
                        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }),
                        fileContent: localFileContent[key] || null,
                        localContent,
                        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                        remoteContent: remoteSnippets[key] || null,
                        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                        previewResult,
                        localChange: previewResult.localChange,
                        remoteChange: previewResult.remoteChange,
                        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' })
                    });
                }
            }
            return [...resourcePreviews.values()];
        }
        async resolveContent(uri) {
            if (this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' }))
                || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' }))
                || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' }))
                || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' }))) {
                return this.resolvePreviewContent(uri);
            }
            return null;
        }
        async hasLocalData() {
            try {
                const localSnippets = await this.getSnippetsFileContents();
                if (Object.keys(localSnippets).length) {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
        async updateLocalBackup(resourcePreviews) {
            const local = {};
            for (const resourcePreview of resourcePreviews) {
                if (resourcePreview.fileContent) {
                    local[this.extUri.basename(resourcePreview.localResource)] = resourcePreview.fileContent;
                }
            }
            await this.backupLocal(JSON.stringify(this.toSnippetsContents(local)));
        }
        async updateLocalSnippets(resourcePreviews, force) {
            for (const { fileContent, acceptResult, localResource, remoteResource, localChange } of resourcePreviews) {
                if (localChange !== 0 /* Change.None */) {
                    const key = remoteResource ? this.extUri.basename(remoteResource) : this.extUri.basename(localResource);
                    const resource = this.extUri.joinPath(this.snippetsFolder, key);
                    // Removed
                    if (localChange === 3 /* Change.Deleted */) {
                        this.logService.trace(`${this.syncResourceLogLabel}: Deleting snippet...`, this.extUri.basename(resource));
                        await this.fileService.del(resource);
                        this.logService.info(`${this.syncResourceLogLabel}: Deleted snippet`, this.extUri.basename(resource));
                    }
                    // Added
                    else if (localChange === 1 /* Change.Added */) {
                        this.logService.trace(`${this.syncResourceLogLabel}: Creating snippet...`, this.extUri.basename(resource));
                        await this.fileService.createFile(resource, buffer_1.VSBuffer.fromString(acceptResult.content), { overwrite: force });
                        this.logService.info(`${this.syncResourceLogLabel}: Created snippet`, this.extUri.basename(resource));
                    }
                    // Updated
                    else {
                        this.logService.trace(`${this.syncResourceLogLabel}: Updating snippet...`, this.extUri.basename(resource));
                        await this.fileService.writeFile(resource, buffer_1.VSBuffer.fromString(acceptResult.content), force ? undefined : fileContent);
                        this.logService.info(`${this.syncResourceLogLabel}: Updated snippet`, this.extUri.basename(resource));
                    }
                }
            }
        }
        async updateRemoteSnippets(resourcePreviews, remoteUserData, forcePush) {
            const currentSnippets = remoteUserData.syncData ? this.parseSnippets(remoteUserData.syncData) : {};
            const newSnippets = (0, objects_1.deepClone)(currentSnippets);
            for (const { acceptResult, localResource, remoteResource, remoteChange } of resourcePreviews) {
                if (remoteChange !== 0 /* Change.None */) {
                    const key = localResource ? this.extUri.basename(localResource) : this.extUri.basename(remoteResource);
                    if (remoteChange === 3 /* Change.Deleted */) {
                        delete newSnippets[key];
                    }
                    else {
                        newSnippets[key] = acceptResult.content;
                    }
                }
            }
            if (!(0, snippetsMerge_1.areSame)(currentSnippets, newSnippets)) {
                // update remote
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote snippets...`);
                remoteUserData = await this.updateRemoteUserData(JSON.stringify(newSnippets), forcePush ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote snippets`);
            }
            return remoteUserData;
        }
        parseSnippets(syncData) {
            return parseSnippets(syncData);
        }
        toSnippetsContents(snippetsFileContents) {
            const snippets = {};
            for (const key of Object.keys(snippetsFileContents)) {
                snippets[key] = snippetsFileContents[key].value.toString();
            }
            return snippets;
        }
        async getSnippetsFileContents() {
            const snippets = {};
            let stat;
            try {
                stat = await this.fileService.resolve(this.snippetsFolder);
            }
            catch (e) {
                // No snippets
                if (e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return snippets;
                }
                else {
                    throw e;
                }
            }
            for (const entry of stat.children || []) {
                const resource = entry.resource;
                const extension = this.extUri.extname(resource);
                if (extension === '.json' || extension === '.code-snippets') {
                    const key = this.extUri.relativePath(this.snippetsFolder, resource);
                    const content = await this.fileService.readFile(resource);
                    snippets[key] = content;
                }
            }
            return snippets;
        }
    };
    exports.SnippetsSynchroniser = SnippetsSynchroniser;
    exports.SnippetsSynchroniser = SnippetsSynchroniser = __decorate([
        __param(2, environment_1.IEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, storage_1.IStorageService),
        __param(5, userDataSync_1.IUserDataSyncStoreService),
        __param(6, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(7, userDataSync_1.IUserDataSyncLogService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, userDataSync_1.IUserDataSyncEnablementService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, uriIdentity_1.IUriIdentityService)
    ], SnippetsSynchroniser);
    let SnippetsInitializer = class SnippetsInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("snippets" /* SyncResource.Snippets */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async doInitialize(remoteUserData) {
            const remoteSnippets = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            if (!remoteSnippets) {
                this.logService.info('Skipping initializing snippets because remote snippets does not exist.');
                return;
            }
            const isEmpty = await this.isEmpty();
            if (!isEmpty) {
                this.logService.info('Skipping initializing snippets because local snippets exist.');
                return;
            }
            for (const key of Object.keys(remoteSnippets)) {
                const content = remoteSnippets[key];
                if (content) {
                    const resource = this.extUri.joinPath(this.userDataProfilesService.defaultProfile.snippetsHome, key);
                    await this.fileService.createFile(resource, buffer_1.VSBuffer.fromString(content));
                    this.logService.info('Created snippet', this.extUri.basename(resource));
                }
            }
            await this.updateLastSyncUserData(remoteUserData);
        }
        async isEmpty() {
            try {
                const stat = await this.fileService.resolve(this.userDataProfilesService.defaultProfile.snippetsHome);
                return !stat.children?.length;
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            }
        }
    };
    exports.SnippetsInitializer = SnippetsInitializer;
    exports.SnippetsInitializer = SnippetsInitializer = __decorate([
        __param(0, files_1.IFileService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, storage_1.IStorageService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], SnippetsInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi9zbmlwcGV0c1N5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkJoRyxTQUFnQixhQUFhLENBQUMsUUFBbUI7UUFDaEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRkQsc0NBRUM7SUFFTSxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLDJDQUFvQjtRQUs3RCxZQUNDLE9BQXlCLEVBQ3pCLFVBQThCLEVBQ1Qsa0JBQXVDLEVBQzlDLFdBQXlCLEVBQ3RCLGNBQStCLEVBQ3JCLHdCQUFtRCxFQUM5Qyw2QkFBNkQsRUFDcEUsVUFBbUMsRUFDckMsb0JBQTJDLEVBQ2xDLDZCQUE2RCxFQUMxRSxnQkFBbUMsRUFDakMsa0JBQXVDO1lBRTVELEtBQUssQ0FBQyxFQUFFLFlBQVksd0NBQXVCLEVBQUUsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsd0JBQXdCLEVBQUUsNkJBQTZCLEVBQUUsNkJBQTZCLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFqQm5RLFlBQU8sR0FBVyxDQUFDLENBQUM7WUFrQnRDLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkksQ0FBQztRQUVTLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxjQUErQixFQUFFLGdCQUF3QyxFQUFFLDhCQUF1QztZQUNySixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQ25ELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRCxNQUFNLGNBQWMsR0FBcUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUV0SSwwR0FBMEc7WUFDMUcsZ0JBQWdCLEdBQUcsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1lBQ25ILE1BQU0sZ0JBQWdCLEdBQXFDLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBRWhLLElBQUksY0FBYyxFQUFFO2dCQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0Isa0RBQWtELENBQUMsQ0FBQzthQUN0RztpQkFBTTtnQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsOEVBQThFLENBQUMsQ0FBQzthQUNsSTtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUEscUJBQUssRUFBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDM0UsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxjQUFjLElBQUksRUFBRSxFQUFFLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFUyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWlDO1lBQ2pFLE1BQU0sZ0JBQWdCLEdBQXFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzVJLElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO2dCQUM5QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNuRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsTUFBTSxXQUFXLEdBQUcsSUFBQSxxQkFBSyxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDNUwsQ0FBQztRQUVTLEtBQUssQ0FBQyxjQUFjLENBQUMsZUFBeUMsRUFBRSxLQUF3QjtZQUNqRyxPQUFPLGVBQWUsQ0FBQyxhQUFhLENBQUM7UUFDdEMsQ0FBQztRQUVTLEtBQUssQ0FBQyxlQUFlLENBQUMsZUFBeUMsRUFBRSxRQUFhLEVBQUUsT0FBa0MsRUFBRSxLQUF3QjtZQUVySiwyQkFBMkI7WUFDM0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUM5SCxPQUFPO29CQUNOLE9BQU8sRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDMUYsV0FBVyxxQkFBYTtvQkFDeEIsWUFBWSxFQUFFLGVBQWUsQ0FBQyxXQUFXO3dCQUN4QyxDQUFDLENBQUMsZUFBZSxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQyxxQkFBYTt3QkFDekUsQ0FBQyx1QkFBZTtpQkFDakIsQ0FBQzthQUNGO1lBRUQsNEJBQTRCO1lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDL0gsT0FBTztvQkFDTixPQUFPLEVBQUUsZUFBZSxDQUFDLGFBQWE7b0JBQ3RDLFdBQVcsRUFBRSxlQUFlLENBQUMsYUFBYSxLQUFLLElBQUk7d0JBQ2xELENBQUMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMseUJBQWlCLENBQUMscUJBQWE7d0JBQzlELENBQUMsdUJBQWU7b0JBQ2pCLFlBQVkscUJBQWE7aUJBQ3pCLENBQUM7YUFDRjtZQUVELDZCQUE2QjtZQUM3QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDbEUsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO29CQUMxQixPQUFPO3dCQUNOLE9BQU8sRUFBRSxlQUFlLENBQUMsYUFBYSxDQUFDLE9BQU87d0JBQzlDLFdBQVcsRUFBRSxlQUFlLENBQUMsYUFBYSxDQUFDLFdBQVc7d0JBQ3RELFlBQVksRUFBRSxlQUFlLENBQUMsYUFBYSxDQUFDLFlBQVk7cUJBQ3hELENBQUM7aUJBQ0Y7cUJBQU07b0JBQ04sT0FBTzt3QkFDTixPQUFPO3dCQUNQLFdBQVcsRUFBRSxPQUFPLEtBQUssSUFBSTs0QkFDNUIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLENBQUMsd0JBQWdCLENBQUMsb0JBQVk7NEJBQ3JFLENBQUMsd0JBQWdCO3dCQUNsQixZQUFZLEVBQUUsT0FBTyxLQUFLLElBQUk7NEJBQzdCLENBQUMsQ0FBQyxlQUFlLENBQUMsYUFBYSxLQUFLLElBQUksQ0FBQyxDQUFDLHdCQUFnQixDQUFDLG9CQUFZOzRCQUN2RSxDQUFDLHdCQUFnQjtxQkFDbEIsQ0FBQztpQkFDRjthQUNEO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRVMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUErQixFQUFFLGdCQUF3QyxFQUFFLGdCQUE2RCxFQUFFLEtBQWM7WUFDbkwsTUFBTSx1QkFBdUIsR0FBdUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLGVBQWUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEssSUFBSSx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLENBQUMsV0FBVyx3QkFBZ0IsSUFBSSxZQUFZLHdCQUFnQixDQUFDLEVBQUU7Z0JBQ2xJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixtREFBbUQsQ0FBQyxDQUFDO2FBQ3RHO1lBRUQsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxXQUFXLHdCQUFnQixDQUFDLEVBQUU7Z0JBQ25GLHVCQUF1QjtnQkFDdkIsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0Q7WUFFRCxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxDQUFDLFlBQVksd0JBQWdCLENBQUMsRUFBRTtnQkFDckYsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNqRztZQUVELElBQUksZ0JBQWdCLEVBQUUsR0FBRyxLQUFLLGNBQWMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pELG1CQUFtQjtnQkFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLDBDQUEwQyxDQUFDLENBQUM7Z0JBQzlGLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0Isc0NBQXNDLENBQUMsQ0FBQzthQUN6RjtZQUVELEtBQUssTUFBTSxFQUFFLGVBQWUsRUFBRSxJQUFJLHVCQUF1QixFQUFFO2dCQUMxRCxxQkFBcUI7Z0JBQ3JCLElBQUk7b0JBQ0gsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDNUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUU7YUFDNUI7UUFFRixDQUFDO1FBRU8sbUJBQW1CLENBQUMsbUJBQXlDLEVBQUUsZ0JBQWlELEVBQUUsY0FBeUMsRUFBRSxZQUF1QztZQUMzTSxNQUFNLGdCQUFnQixHQUEwQyxJQUFJLEdBQUcsRUFBb0MsQ0FBQztZQUU1Ryw0Q0FBNEM7WUFDNUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0QsTUFBTSxhQUFhLEdBQWlCO29CQUNuQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7b0JBQzdDLFlBQVksRUFBRSxLQUFLO29CQUNuQixXQUFXLHNCQUFjO29CQUN6QixZQUFZLHFCQUFhO2lCQUN6QixDQUFDO2dCQUNGLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3pCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDMUgsV0FBVyxFQUFFLElBQUk7b0JBQ2pCLFdBQVcsRUFBRSxJQUFJO29CQUNqQixhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQzVILFlBQVksRUFBRSxJQUFJO29CQUNsQixjQUFjLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUM7b0JBQzlILGFBQWEsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDO29CQUNsQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQztvQkFDbEUsYUFBYTtvQkFDYixXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVc7b0JBQ3RDLFlBQVksRUFBRSxhQUFhLENBQUMsWUFBWTtvQkFDeEMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUM7aUJBQ2xJLENBQUMsQ0FBQzthQUNIO1lBRUQsaURBQWlEO1lBQ2pELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2pFLE1BQU0sYUFBYSxHQUFpQjtvQkFDbkMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUMvQyxZQUFZLEVBQUUsS0FBSztvQkFDbkIsV0FBVyx5QkFBaUI7b0JBQzVCLFlBQVkscUJBQWE7aUJBQ3pCLENBQUM7Z0JBQ0YsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMzRixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO29CQUN6QixZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUM7b0JBQzFILFdBQVcsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSTtvQkFDdEMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUM1SCxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO29CQUNsQyxZQUFZO29CQUNaLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDOUgsYUFBYSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUM7b0JBQ2xDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDO29CQUNsRSxhQUFhO29CQUNiLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVztvQkFDdEMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZO29CQUN4QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDbEksQ0FBQyxDQUFDO2FBQ0g7WUFFRCxpREFBaUQ7WUFDakQsS0FBSyxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUNwRCxNQUFNLGFBQWEsR0FBaUI7b0JBQ25DLE9BQU8sRUFBRSxJQUFJO29CQUNiLFlBQVksRUFBRSxLQUFLO29CQUNuQixXQUFXLHdCQUFnQjtvQkFDM0IsWUFBWSxxQkFBYTtpQkFDekIsQ0FBQztnQkFDRixNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzNGLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3pCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDMUgsV0FBVyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJO29CQUN0QyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQzVILFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7b0JBQ2xDLFlBQVk7b0JBQ1osY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO29CQUM5SCxhQUFhLEVBQUUsSUFBSTtvQkFDbkIsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUM7b0JBQ2xFLGFBQWE7b0JBQ2IsV0FBVyxFQUFFLGFBQWEsQ0FBQyxXQUFXO29CQUN0QyxZQUFZLEVBQUUsYUFBYSxDQUFDLFlBQVk7b0JBQ3hDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDO2lCQUNsSSxDQUFDLENBQUM7YUFDSDtZQUVELDRDQUE0QztZQUM1QyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNoRSxNQUFNLGFBQWEsR0FBaUI7b0JBQ25DLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEtBQUs7b0JBQ25CLFdBQVcscUJBQWE7b0JBQ3hCLFlBQVksc0JBQWM7aUJBQzFCLENBQUM7Z0JBQ0YsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMzRixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO29CQUN6QixZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUM7b0JBQzFILFdBQVcsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSTtvQkFDdEMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUM1SCxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO29CQUNsQyxZQUFZO29CQUNaLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDOUgsYUFBYSxFQUFFLElBQUk7b0JBQ25CLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDO29CQUNsRSxhQUFhO29CQUNiLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVztvQkFDdEMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZO29CQUN4QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDbEksQ0FBQyxDQUFDO2FBQ0g7WUFFRCxpREFBaUQ7WUFDakQsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbEUsTUFBTSxhQUFhLEdBQWlCO29CQUNuQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7b0JBQ2hELFlBQVksRUFBRSxLQUFLO29CQUNuQixXQUFXLHFCQUFhO29CQUN4QixZQUFZLHlCQUFpQjtpQkFDN0IsQ0FBQztnQkFDRixNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzNGLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3pCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDMUgsV0FBVyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJO29CQUN0QyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQzVILFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7b0JBQ2xDLFlBQVk7b0JBQ1osY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO29CQUM5SCxhQUFhLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQztvQkFDbEMsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUM7b0JBQ2xFLGFBQWE7b0JBQ2IsV0FBVyxFQUFFLGFBQWEsQ0FBQyxXQUFXO29CQUN0QyxZQUFZLEVBQUUsYUFBYSxDQUFDLFlBQVk7b0JBQ3hDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDO2lCQUNsSSxDQUFDLENBQUM7YUFDSDtZQUVELGlEQUFpRDtZQUNqRCxLQUFLLE1BQU0sR0FBRyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JELE1BQU0sYUFBYSxHQUFpQjtvQkFDbkMsT0FBTyxFQUFFLElBQUk7b0JBQ2IsWUFBWSxFQUFFLEtBQUs7b0JBQ25CLFdBQVcscUJBQWE7b0JBQ3hCLFlBQVksd0JBQWdCO2lCQUM1QixDQUFDO2dCQUNGLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3pCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDMUgsV0FBVyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJO29CQUN0QyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQzVILFdBQVcsRUFBRSxJQUFJO29CQUNqQixZQUFZLEVBQUUsSUFBSTtvQkFDbEIsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO29CQUM5SCxhQUFhLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQztvQkFDbEMsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUM7b0JBQ2xFLGFBQWE7b0JBQ2IsV0FBVyxFQUFFLGFBQWEsQ0FBQyxXQUFXO29CQUN0QyxZQUFZLEVBQUUsYUFBYSxDQUFDLFlBQVk7b0JBQ3hDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDO2lCQUNsSSxDQUFDLENBQUM7YUFDSDtZQUVELDZCQUE2QjtZQUM3QixLQUFLLE1BQU0sR0FBRyxJQUFJLG1CQUFtQixDQUFDLFNBQVMsRUFBRTtnQkFDaEQsTUFBTSxhQUFhLEdBQWlCO29CQUNuQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7b0JBQ2xDLFlBQVksRUFBRSxJQUFJO29CQUNsQixXQUFXLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQyxxQkFBYTtvQkFDbkUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLHFCQUFhO2lCQUNsRSxDQUFDO2dCQUNGLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDM0YsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtvQkFDekIsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDO29CQUMxSCxXQUFXLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7b0JBQ3RDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDNUgsV0FBVyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7b0JBQzFDLFlBQVk7b0JBQ1osY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO29CQUM5SCxhQUFhLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7b0JBQzFDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDO29CQUNsRSxhQUFhO29CQUNiLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVztvQkFDdEMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZO29CQUN4QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDbEksQ0FBQyxDQUFDO2FBQ0g7WUFFRCx5QkFBeUI7WUFDekIsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQy9CLE1BQU0sYUFBYSxHQUFpQjt3QkFDbkMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7d0JBQzlFLFlBQVksRUFBRSxLQUFLO3dCQUNuQixXQUFXLHFCQUFhO3dCQUN4QixZQUFZLHFCQUFhO3FCQUN6QixDQUFDO29CQUNGLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDM0YsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTt3QkFDekIsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDO3dCQUMxSCxXQUFXLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7d0JBQ3RDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQzt3QkFDNUgsV0FBVyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7d0JBQzFDLFlBQVk7d0JBQ1osY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO3dCQUM5SCxhQUFhLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7d0JBQzFDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDO3dCQUNsRSxhQUFhO3dCQUNiLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVzt3QkFDdEMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZO3dCQUN4QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQztxQkFDbEksQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7WUFFRCxPQUFPLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFUSxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQVE7WUFDckMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQzttQkFDckgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7bUJBQ3BILElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO21CQUNuSCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUM1SCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN2QztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZO1lBQ2pCLElBQUk7Z0JBQ0gsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDM0QsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRTtvQkFDdEMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLGtCQUFrQjthQUNsQjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVPLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBd0M7WUFDdkUsTUFBTSxLQUFLLEdBQW9DLEVBQUUsQ0FBQztZQUNsRCxLQUFLLE1BQU0sZUFBZSxJQUFJLGdCQUFnQixFQUFFO2dCQUMvQyxJQUFJLGVBQWUsQ0FBQyxXQUFXLEVBQUU7b0JBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDO2lCQUMxRjthQUNEO1lBQ0QsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRU8sS0FBSyxDQUFDLG1CQUFtQixDQUFDLGdCQUFvRCxFQUFFLEtBQWM7WUFDckcsS0FBSyxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxJQUFJLGdCQUFnQixFQUFFO2dCQUN6RyxJQUFJLFdBQVcsd0JBQWdCLEVBQUU7b0JBQ2hDLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWMsQ0FBQyxDQUFDO29CQUN6RyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUVoRSxVQUFVO29CQUNWLElBQUksV0FBVywyQkFBbUIsRUFBRTt3QkFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLHVCQUF1QixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzNHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixtQkFBbUIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3FCQUN0RztvQkFFRCxRQUFRO3lCQUNILElBQUksV0FBVyx5QkFBaUIsRUFBRTt3QkFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLHVCQUF1QixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzNHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO3dCQUM5RyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztxQkFDdEc7b0JBRUQsVUFBVTt5QkFDTDt3QkFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDM0csTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFZLENBQUMsQ0FBQzt3QkFDekgsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLG1CQUFtQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7cUJBQ3RHO2lCQUNEO2FBQ0Q7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLGdCQUFvRCxFQUFFLGNBQStCLEVBQUUsU0FBa0I7WUFDM0ksTUFBTSxlQUFlLEdBQThCLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUgsTUFBTSxXQUFXLEdBQThCLElBQUEsbUJBQVMsRUFBQyxlQUFlLENBQUMsQ0FBQztZQUUxRSxLQUFLLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDN0YsSUFBSSxZQUFZLHdCQUFnQixFQUFFO29CQUNqQyxNQUFNLEdBQUcsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFlLENBQUMsQ0FBQztvQkFDeEcsSUFBSSxZQUFZLDJCQUFtQixFQUFFO3dCQUNwQyxPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDeEI7eUJBQU07d0JBQ04sV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFRLENBQUM7cUJBQ3pDO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLENBQUMsSUFBQSx1QkFBTyxFQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsRUFBRTtnQkFDM0MsZ0JBQWdCO2dCQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsK0JBQStCLENBQUMsQ0FBQztnQkFDbkYsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckgsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLDJCQUEyQixDQUFDLENBQUM7YUFDOUU7WUFDRCxPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU8sYUFBYSxDQUFDLFFBQW1CO1lBQ3hDLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxvQkFBcUQ7WUFDL0UsTUFBTSxRQUFRLEdBQThCLEVBQUUsQ0FBQztZQUMvQyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRTtnQkFDcEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUMzRDtZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTyxLQUFLLENBQUMsdUJBQXVCO1lBQ3BDLE1BQU0sUUFBUSxHQUFvQyxFQUFFLENBQUM7WUFDckQsSUFBSSxJQUFlLENBQUM7WUFDcEIsSUFBSTtnQkFDSCxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDM0Q7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxjQUFjO2dCQUNkLElBQUksQ0FBQyxZQUFZLDBCQUFrQixJQUFJLENBQUMsQ0FBQyxtQkFBbUIsK0NBQXVDLEVBQUU7b0JBQ3BHLE9BQU8sUUFBUSxDQUFDO2lCQUNoQjtxQkFBTTtvQkFDTixNQUFNLENBQUMsQ0FBQztpQkFDUjthQUNEO1lBQ0QsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsRUFBRTtnQkFDeEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxTQUFTLEtBQUssZ0JBQWdCLEVBQUU7b0JBQzVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFFLENBQUM7b0JBQ3JFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzFELFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7aUJBQ3hCO2FBQ0Q7WUFDRCxPQUFPLFFBQVEsQ0FBQztRQUNqQixDQUFDO0tBQ0QsQ0FBQTtJQXBkWSxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQVE5QixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsd0NBQXlCLENBQUE7UUFDekIsV0FBQSw2Q0FBOEIsQ0FBQTtRQUM5QixXQUFBLHNDQUF1QixDQUFBO1FBQ3ZCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSw2Q0FBOEIsQ0FBQTtRQUM5QixZQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFlBQUEsaUNBQW1CLENBQUE7T0FqQlQsb0JBQW9CLENBb2RoQztJQUVNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsMENBQW1CO1FBRTNELFlBQ2UsV0FBeUIsRUFDYix1QkFBaUQsRUFDdEQsa0JBQXVDLEVBQ25DLFVBQW1DLEVBQzNDLGNBQStCLEVBQzNCLGtCQUF1QztZQUU1RCxLQUFLLHlDQUF3Qix1QkFBdUIsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3hJLENBQUM7UUFFUyxLQUFLLENBQUMsWUFBWSxDQUFDLGNBQStCO1lBQzNELE1BQU0sY0FBYyxHQUFxQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN0SSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDO2dCQUMvRixPQUFPO2FBQ1A7WUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLDhEQUE4RCxDQUFDLENBQUM7Z0JBQ3JGLE9BQU87YUFDUDtZQUVELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDOUMsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLE9BQU8sRUFBRTtvQkFDWixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDckcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDMUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDeEU7YUFDRDtZQUVELE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFTyxLQUFLLENBQUMsT0FBTztZQUNwQixJQUFJO2dCQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDdEcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO2FBQzlCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsT0FBNEIsS0FBTSxDQUFDLG1CQUFtQiwrQ0FBdUMsQ0FBQzthQUM5RjtRQUNGLENBQUM7S0FFRCxDQUFBO0lBL0NZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBRzdCLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsMENBQXdCLENBQUE7UUFDeEIsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLHNDQUF1QixDQUFBO1FBQ3ZCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsaUNBQW1CLENBQUE7T0FSVCxtQkFBbUIsQ0ErQy9CIn0=