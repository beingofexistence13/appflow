/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/ipc/electron-sandbox/services", "vs/platform/userDataSync/common/userDataSyncServiceIpc"], function (require, exports, userDataSync_1, services_1, userDataSyncServiceIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.$B7b)(userDataSync_1.$Qgb, 'userDataSync', { channelClientCtor: userDataSyncServiceIpc_1.$27b });
    (0, services_1.$B7b)(userDataSync_1.$Rgb, 'IUserDataSyncResourceProviderService');
});
//# sourceMappingURL=userDataSyncService.js.map