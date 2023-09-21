/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/ipc/electron-sandbox/services", "vs/platform/userDataSync/common/userDataSyncServiceIpc"], function (require, exports, userDataSync_1, services_1, userDataSyncServiceIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerSharedProcessRemoteService)(userDataSync_1.IUserDataSyncService, 'userDataSync', { channelClientCtor: userDataSyncServiceIpc_1.UserDataSyncChannelClient });
    (0, services_1.registerSharedProcessRemoteService)(userDataSync_1.IUserDataSyncResourceProviderService, 'IUserDataSyncResourceProviderService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVN5bmMvZWxlY3Ryb24tc2FuZGJveC91c2VyRGF0YVN5bmNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBTWhHLElBQUEsNkNBQWtDLEVBQUMsbUNBQW9CLEVBQUUsY0FBYyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsa0RBQXlCLEVBQUUsQ0FBQyxDQUFDO0lBQzNILElBQUEsNkNBQWtDLEVBQUMsbURBQW9DLEVBQUUsc0NBQXNDLENBQUMsQ0FBQyJ9