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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/date", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, async_1, buffer_1, date_1, lifecycle_1, resources_1, configuration_1, environment_1, files_1, userDataProfile_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncLocalStoreService = void 0;
    let UserDataSyncLocalStoreService = class UserDataSyncLocalStoreService extends lifecycle_1.Disposable {
        constructor(environmentService, fileService, configurationService, logService, userDataProfilesService) {
            super();
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.logService = logService;
            this.userDataProfilesService = userDataProfilesService;
            this.cleanUp();
        }
        async cleanUp() {
            for (const profile of this.userDataProfilesService.profiles) {
                for (const resource of userDataSync_1.ALL_SYNC_RESOURCES) {
                    try {
                        await this.cleanUpBackup(this.getResourceBackupHome(resource, profile.isDefault ? undefined : profile.id));
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
            }
            let stat;
            try {
                stat = await this.fileService.resolve(this.environmentService.userDataSyncHome);
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
                return;
            }
            if (stat.children) {
                for (const child of stat.children) {
                    if (child.isDirectory && !this.userDataProfilesService.profiles.some(profile => profile.id === child.name)) {
                        try {
                            this.logService.info('Deleting non existing profile from backup', child.resource.path);
                            await this.fileService.del(child.resource, { recursive: true });
                        }
                        catch (error) {
                            this.logService.error(error);
                        }
                    }
                }
            }
        }
        async getAllResourceRefs(resource, collection, root) {
            const folder = this.getResourceBackupHome(resource, collection, root);
            try {
                const stat = await this.fileService.resolve(folder);
                if (stat.children) {
                    const all = stat.children.filter(stat => stat.isFile && !stat.name.startsWith('lastSync')).sort().reverse();
                    return all.map(stat => ({
                        ref: stat.name,
                        created: this.getCreationTime(stat)
                    }));
                }
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error;
                }
            }
            return [];
        }
        async resolveResourceContent(resourceKey, ref, collection, root) {
            const folder = this.getResourceBackupHome(resourceKey, collection, root);
            const file = (0, resources_1.joinPath)(folder, ref);
            try {
                const content = await this.fileService.readFile(file);
                return content.value.toString();
            }
            catch (error) {
                this.logService.error(error);
                return null;
            }
        }
        async writeResource(resourceKey, content, cTime, collection, root) {
            const folder = this.getResourceBackupHome(resourceKey, collection, root);
            const resource = (0, resources_1.joinPath)(folder, `${(0, date_1.toLocalISOString)(cTime).replace(/-|:|\.\d+Z$/g, '')}.json`);
            try {
                await this.fileService.writeFile(resource, buffer_1.VSBuffer.fromString(content));
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        getResourceBackupHome(resource, collection, root = this.environmentService.userDataSyncHome) {
            return (0, resources_1.joinPath)(root, ...(collection ? [collection, resource] : [resource]));
        }
        async cleanUpBackup(folder) {
            try {
                try {
                    if (!(await this.fileService.exists(folder))) {
                        return;
                    }
                }
                catch (e) {
                    return;
                }
                const stat = await this.fileService.resolve(folder);
                if (stat.children) {
                    const all = stat.children.filter(stat => stat.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat.name)).sort();
                    const backUpMaxAge = 1000 * 60 * 60 * 24 * (this.configurationService.getValue('sync.localBackupDuration') || 30 /* Default 30 days */);
                    let toDelete = all.filter(stat => Date.now() - this.getCreationTime(stat) > backUpMaxAge);
                    const remaining = all.length - toDelete.length;
                    if (remaining < 10) {
                        toDelete = toDelete.slice(10 - remaining);
                    }
                    await async_1.Promises.settled(toDelete.map(async (stat) => {
                        this.logService.info('Deleting from backup', stat.resource.path);
                        await this.fileService.del(stat.resource);
                    }));
                }
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        getCreationTime(stat) {
            return new Date(parseInt(stat.name.substring(0, 4)), parseInt(stat.name.substring(4, 6)) - 1, parseInt(stat.name.substring(6, 8)), parseInt(stat.name.substring(9, 11)), parseInt(stat.name.substring(11, 13)), parseInt(stat.name.substring(13, 15))).getTime();
        }
    };
    exports.UserDataSyncLocalStoreService = UserDataSyncLocalStoreService;
    exports.UserDataSyncLocalStoreService = UserDataSyncLocalStoreService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, userDataProfile_1.IUserDataProfilesService)
    ], UserDataSyncLocalStoreService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jTG9jYWxTdG9yZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhU3luY0xvY2FsU3RvcmVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLHNCQUFVO1FBSTVELFlBQ3VDLGtCQUF1QyxFQUM5QyxXQUF5QixFQUNoQixvQkFBMkMsRUFDekMsVUFBbUMsRUFDbEMsdUJBQWlEO1lBRTVGLEtBQUssRUFBRSxDQUFDO1lBTjhCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDOUMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDaEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtZQUNsQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBRzVGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBRU8sS0FBSyxDQUFDLE9BQU87WUFDcEIsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFO2dCQUM1RCxLQUFLLE1BQU0sUUFBUSxJQUFJLGlDQUFrQixFQUFFO29CQUMxQyxJQUFJO3dCQUNILE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQzNHO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUss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