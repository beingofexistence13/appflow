/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/debug/common/extensionHostDebug", "vs/platform/ipc/electron-sandbox/services", "vs/platform/debug/common/extensionHostDebugIpc"], function (require, exports, extensionHostDebug_1, services_1, extensionHostDebugIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.$z7b)(extensionHostDebug_1.$An, extensionHostDebugIpc_1.$Bn.ChannelName, { channelClientCtor: extensionHostDebugIpc_1.$Cn });
});
//# sourceMappingURL=extensionHostDebugService.js.map