/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/update/common/update", "vs/platform/ipc/electron-sandbox/services", "vs/platform/update/common/updateIpc"], function (require, exports, update_1, services_1, updateIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerMainProcessRemoteService)(update_1.IUpdateService, 'update', { channelClientCtor: updateIpc_1.UpdateChannelClient });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91cGRhdGUvZWxlY3Ryb24tc2FuZGJveC91cGRhdGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBTWhHLElBQUEsMkNBQWdDLEVBQUMsdUJBQWMsRUFBRSxRQUFRLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSwrQkFBbUIsRUFBRSxDQUFDLENBQUMifQ==