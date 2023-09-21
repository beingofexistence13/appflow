/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncEnablementService"], function (require, exports, extensions_1, userDataSync_1, userDataSyncEnablementService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncEnablementService = void 0;
    class UserDataSyncEnablementService extends userDataSyncEnablementService_1.UserDataSyncEnablementService {
        get workbenchEnvironmentService() { return this.environmentService; }
        getResourceSyncStateVersion(resource) {
            return resource === "extensions" /* SyncResource.Extensions */ ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : undefined;
        }
    }
    exports.UserDataSyncEnablementService = UserDataSyncEnablementService;
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataSyncEnablementService, UserDataSyncEnablementService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jRW5hYmxlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckRhdGFTeW5jL2Jyb3dzZXIvdXNlckRhdGFTeW5jRW5hYmxlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsNkJBQThCLFNBQVEsNkRBQWlDO1FBRW5GLElBQWMsMkJBQTJCLEtBQTBDLE9BQTRDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFFaEosMkJBQTJCLENBQUMsUUFBc0I7WUFDMUQsT0FBTyxRQUFRLCtDQUE0QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckosQ0FBQztLQUVEO0lBUkQsc0VBUUM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLDZDQUE4QixFQUFFLDZCQUE2QixvQ0FBNEIsQ0FBQyJ9