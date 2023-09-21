/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace"], function (require, exports, errors_1, environment_1, extensionStorage_1, files_1, log_1, storage_1, uriIdentity_1, userDataProfile_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateExtensionStorage = void 0;
    /**
     * An extension storage has following
     * 	- State: Stored using storage service with extension id as key and state as value.
     *  - Resources: Stored under a location scoped to the extension.
     */
    async function migrateExtensionStorage(fromExtensionId, toExtensionId, global, instantionService) {
        return instantionService.invokeFunction(async (serviceAccessor) => {
            const environmentService = serviceAccessor.get(environment_1.IEnvironmentService);
            const userDataProfilesService = serviceAccessor.get(userDataProfile_1.IUserDataProfilesService);
            const extensionStorageService = serviceAccessor.get(extensionStorage_1.IExtensionStorageService);
            const storageService = serviceAccessor.get(storage_1.IStorageService);
            const uriIdentityService = serviceAccessor.get(uriIdentity_1.IUriIdentityService);
            const fileService = serviceAccessor.get(files_1.IFileService);
            const workspaceContextService = serviceAccessor.get(workspace_1.IWorkspaceContextService);
            const logService = serviceAccessor.get(log_1.ILogService);
            const storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
            const migrateLowerCaseStorageKey = fromExtensionId.toLowerCase() === toExtensionId.toLowerCase() ? `extension.storage.migrateFromLowerCaseKey.${fromExtensionId.toLowerCase()}` : undefined;
            if (fromExtensionId === toExtensionId) {
                return;
            }
            const getExtensionStorageLocation = (extensionId, global) => {
                if (global) {
                    return uriIdentityService.extUri.joinPath(userDataProfilesService.defaultProfile.globalStorageHome, extensionId.toLowerCase() /* Extension id is lower cased for global storage */);
                }
                return uriIdentityService.extUri.joinPath(environmentService.workspaceStorageHome, workspaceContextService.getWorkspace().id, extensionId);
            };
            const storageScope = global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */;
            if (!storageService.getBoolean(storageMigratedKey, storageScope, false) && !(migrateLowerCaseStorageKey && storageService.getBoolean(migrateLowerCaseStorageKey, storageScope, false))) {
                logService.info(`Migrating ${global ? 'global' : 'workspace'} extension storage from ${fromExtensionId} to ${toExtensionId}...`);
                // Migrate state
                const value = extensionStorageService.getExtensionState(fromExtensionId, global);
                if (value) {
                    extensionStorageService.setExtensionState(toExtensionId, value, global);
                    extensionStorageService.setExtensionState(fromExtensionId, undefined, global);
                }
                // Migrate stored files
                const fromPath = getExtensionStorageLocation(fromExtensionId, global);
                const toPath = getExtensionStorageLocation(toExtensionId, global);
                if (!uriIdentityService.extUri.isEqual(fromPath, toPath)) {
                    try {
                        await fileService.move(fromPath, toPath, true);
                    }
                    catch (error) {
                        if (error.code !== files_1.FileSystemProviderErrorCode.FileNotFound) {
                            logService.info(`Error while migrating ${global ? 'global' : 'workspace'} file storage from '${fromExtensionId}' to '${toExtensionId}'`, (0, errors_1.getErrorMessage)(error));
                        }
                    }
                }
                logService.info(`Migrated ${global ? 'global' : 'workspace'} extension storage from ${fromExtensionId} to ${toExtensionId}`);
                storageService.store(storageMigratedKey, true, storageScope, 1 /* StorageTarget.MACHINE */);
            }
        });
    }
    exports.migrateExtensionStorage = migrateExtensionStorage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU3RvcmFnZU1pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25TdG9yYWdlTWlncmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRzs7OztPQUlHO0lBQ0ksS0FBSyxVQUFVLHVCQUF1QixDQUFDLGVBQXVCLEVBQUUsYUFBcUIsRUFBRSxNQUFlLEVBQUUsaUJBQXdDO1FBQ3RKLE9BQU8saUJBQWlCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBQyxlQUFlLEVBQUMsRUFBRTtZQUMvRCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsaUNBQW1CLENBQUMsQ0FBQztZQUNwRSxNQUFNLHVCQUF1QixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsMENBQXdCLENBQUMsQ0FBQztZQUM5RSxNQUFNLHVCQUF1QixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsMkNBQXdCLENBQUMsQ0FBQztZQUM5RSxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLHlCQUFlLENBQUMsQ0FBQztZQUM1RCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsaUNBQW1CLENBQUMsQ0FBQztZQUNwRSxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsQ0FBQztZQUN0RCxNQUFNLHVCQUF1QixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsb0NBQXdCLENBQUMsQ0FBQztZQUM5RSxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLGlCQUFXLENBQUMsQ0FBQztZQUNwRCxNQUFNLGtCQUFrQixHQUFHLDRCQUE0QixlQUFlLElBQUksYUFBYSxFQUFFLENBQUM7WUFDMUYsTUFBTSwwQkFBMEIsR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLEtBQUssYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyw2Q0FBNkMsZUFBZSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUU1TCxJQUFJLGVBQWUsS0FBSyxhQUFhLEVBQUU7Z0JBQ3RDLE9BQU87YUFDUDtZQUVELE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxXQUFtQixFQUFFLE1BQWUsRUFBTyxFQUFFO2dCQUNqRixJQUFJLE1BQU0sRUFBRTtvQkFDWCxPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO2lCQUNwTDtnQkFDRCxPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsdUJBQXVCLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzVJLENBQUMsQ0FBQztZQUVGLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxDQUFDLDhCQUFzQixDQUFDLCtCQUF1QixDQUFDO1lBQzVFLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsMEJBQTBCLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdkwsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLDJCQUEyQixlQUFlLE9BQU8sYUFBYSxLQUFLLENBQUMsQ0FBQztnQkFDakksZ0JBQWdCO2dCQUNoQixNQUFNLEtBQUssR0FBRyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pGLElBQUksS0FBSyxFQUFFO29CQUNWLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3hFLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQzlFO2dCQUVELHVCQUF1QjtnQkFDdkIsTUFBTSxRQUFRLEdBQUcsMkJBQTJCLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLE1BQU0sR0FBRywyQkFBMkIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtvQkFDekQsSUFBSTt3QkFDSCxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDL0M7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBQ2YsSUFBOEIsS0FBTSxDQUFDLElBQUksS0FBSyxtQ0FBMkIsQ0FBQyxZQUFZLEVBQUU7NEJBQ3ZGLFVBQVUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLHVCQUF1QixlQUFlLFNBQVMsYUFBYSxHQUFHLEVBQUUsSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7eUJBQ2pLO3FCQUNEO2lCQUNEO2dCQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVywyQkFBMkIsZUFBZSxPQUFPLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBQzdILGNBQWMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLFlBQVksZ0NBQXdCLENBQUM7YUFDcEY7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFsREQsMERBa0RDIn0=