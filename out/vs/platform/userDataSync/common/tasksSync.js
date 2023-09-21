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
    exports.TasksInitializer = exports.TasksSynchroniser = exports.getTasksContentFromSyncContent = void 0;
    function getTasksContentFromSyncContent(syncContent, logService) {
        try {
            const parsed = JSON.parse(syncContent);
            return parsed.tasks ?? null;
        }
        catch (e) {
            logService.error(e);
            return null;
        }
    }
    exports.getTasksContentFromSyncContent = getTasksContentFromSyncContent;
    let TasksSynchroniser = class TasksSynchroniser extends abstractSynchronizer_1.AbstractFileSynchroniser {
        constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, telemetryService, uriIdentityService) {
            super(profile.tasksResource, { syncResource: "tasks" /* SyncResource.Tasks */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.version = 1;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'tasks.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
            const remoteContent = remoteUserData.syncData ? getTasksContentFromSyncContent(remoteUserData.syncData.content, this.logService) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncContent = lastSyncUserData?.syncData ? getTasksContentFromSyncContent(lastSyncUserData.syncData.content, this.logService) : null;
            // Get file content last to get the latest
            const fileContent = await this.getLocalFileContent();
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
                    this.logService.trace(`${this.syncResourceLogLabel}: Merging remote tasks with local tasks...`);
                    const result = merge(localContent, remoteContent, lastSyncContent);
                    content = result.content;
                    hasConflicts = result.hasConflicts;
                    hasLocalChanged = result.hasLocalChanged;
                    hasRemoteChanged = result.hasRemoteChanged;
                }
            }
            // First time syncing to remote
            else if (fileContent) {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote tasks does not exist. Synchronizing tasks for the first time.`);
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
                    baseResource: this.baseResource,
                    baseContent: lastSyncContent,
                    localResource: this.localResource,
                    localContent,
                    localChange: previewResult.localChange,
                    remoteResource: this.remoteResource,
                    remoteContent,
                    remoteChange: previewResult.remoteChange,
                    previewResource: this.previewResource,
                    previewResult,
                    acceptedResource: this.acceptedResource,
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncContent = lastSyncUserData?.syncData ? getTasksContentFromSyncContent(lastSyncUserData.syncData.content, this.logService) : null;
            if (lastSyncContent === null) {
                return true;
            }
            const fileContent = await this.getLocalFileContent();
            const localContent = fileContent ? fileContent.value.toString() : null;
            const result = merge(localContent, lastSyncContent, lastSyncContent);
            return result.hasLocalChanged || result.hasRemoteChanged;
        }
        async getMergeResult(resourcePreview, token) {
            return resourcePreview.previewResult;
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return {
                    content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 2 /* Change.Modified */,
                };
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.extUri.isEqual(resource, this.previewResource)) {
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
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { fileContent } = resourcePreviews[0][0];
            const { content, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing tasks.`);
            }
            if (localChange !== 0 /* Change.None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating local tasks...`);
                if (fileContent) {
                    await this.backupLocal(JSON.stringify(this.toTasksSyncContent(fileContent.value.toString())));
                }
                if (content) {
                    await this.updateLocalFileContent(content, fileContent, force);
                }
                else {
                    await this.deleteLocalFile();
                }
                this.logService.info(`${this.syncResourceLogLabel}: Updated local tasks`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote tasks...`);
                const remoteContents = JSON.stringify(this.toTasksSyncContent(content));
                remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote tasks`);
            }
            // Delete the preview
            try {
                await this.fileService.del(this.previewResource);
            }
            catch (e) { /* ignore */ }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized tasks...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized tasks`);
            }
        }
        async hasLocalData() {
            return this.fileService.exists(this.file);
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)) {
                return this.resolvePreviewContent(uri);
            }
            return null;
        }
        toTasksSyncContent(tasks) {
            return tasks ? { tasks } : {};
        }
    };
    exports.TasksSynchroniser = TasksSynchroniser;
    exports.TasksSynchroniser = TasksSynchroniser = __decorate([
        __param(2, userDataSync_1.IUserDataSyncStoreService),
        __param(3, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(4, userDataSync_1.IUserDataSyncLogService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, userDataSync_1.IUserDataSyncEnablementService),
        __param(7, files_1.IFileService),
        __param(8, environment_1.IEnvironmentService),
        __param(9, storage_1.IStorageService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, uriIdentity_1.IUriIdentityService)
    ], TasksSynchroniser);
    let TasksInitializer = class TasksInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("tasks" /* SyncResource.Tasks */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
            this.tasksResource = this.userDataProfilesService.defaultProfile.tasksResource;
        }
        async doInitialize(remoteUserData) {
            const tasksContent = remoteUserData.syncData ? getTasksContentFromSyncContent(remoteUserData.syncData.content, this.logService) : null;
            if (!tasksContent) {
                this.logService.info('Skipping initializing tasks because remote tasks does not exist.');
                return;
            }
            const isEmpty = await this.isEmpty();
            if (!isEmpty) {
                this.logService.info('Skipping initializing tasks because local tasks exist.');
                return;
            }
            await this.fileService.writeFile(this.tasksResource, buffer_1.VSBuffer.fromString(tasksContent));
            await this.updateLastSyncUserData(remoteUserData);
        }
        async isEmpty() {
            return this.fileService.exists(this.tasksResource);
        }
    };
    exports.TasksInitializer = TasksInitializer;
    exports.TasksInitializer = TasksInitializer = __decorate([
        __param(0, files_1.IFileService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, storage_1.IStorageService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], TasksInitializer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3NTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi90YXNrc1N5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRyxTQUFnQiw4QkFBOEIsQ0FBQyxXQUFtQixFQUFFLFVBQXVCO1FBQzFGLElBQUk7WUFDSCxNQUFNLE1BQU0sR0FBc0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1NBQzVCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDWCxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7SUFDRixDQUFDO0lBUkQsd0VBUUM7SUFFTSxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLCtDQUF3QjtRQVM5RCxZQUNDLE9BQXlCLEVBQ3pCLFVBQThCLEVBQ0gsd0JBQW1ELEVBQzlDLDZCQUE2RCxFQUNwRSxVQUFtQyxFQUNyQyxvQkFBMkMsRUFDbEMsNkJBQTZELEVBQy9FLFdBQXlCLEVBQ2xCLGtCQUF1QyxFQUMzQyxjQUErQixFQUM3QixnQkFBbUMsRUFDakMsa0JBQXVDO1lBRTVELEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsWUFBWSxrQ0FBb0IsRUFBRSxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSw2QkFBNkIsRUFBRSw2QkFBNkIsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQXJCdlIsWUFBTyxHQUFXLENBQUMsQ0FBQztZQUN0QixvQkFBZSxHQUFR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