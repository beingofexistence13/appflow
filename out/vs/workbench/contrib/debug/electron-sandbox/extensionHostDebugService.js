/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/debug/common/extensionHostDebug", "vs/platform/ipc/electron-sandbox/services", "vs/platform/debug/common/extensionHostDebugIpc"], function (require, exports, extensionHostDebug_1, services_1, extensionHostDebugIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerMainProcessRemoteService)(extensionHostDebug_1.IExtensionHostDebugService, extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel.ChannelName, { channelClientCtor: extensionHostDebugIpc_1.ExtensionHostDebugChannelClient });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9uSG9zdERlYnVnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxJQUFBLDJDQUFnQyxFQUFDLCtDQUEwQixFQUFFLDBEQUFrQyxDQUFDLFdBQVcsRUFBRSxFQUFFLGlCQUFpQixFQUFFLHVEQUErQixFQUFFLENBQUMsQ0FBQyJ9