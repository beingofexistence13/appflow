/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/parts/ipc/electron-sandbox/ipc.electron"], function (require, exports, lifecycle_1, ipc_electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$q7b = void 0;
    /**
     * An implementation of `IMainProcessService` that leverages Electron's IPC.
     */
    class $q7b extends lifecycle_1.$kc {
        constructor(windowId) {
            super();
            this.a = this.B(new ipc_electron_1.$5S(`window:${windowId}`));
        }
        getChannel(channelName) {
            return this.a.getChannel(channelName);
        }
        registerChannel(channelName, channel) {
            this.a.registerChannel(channelName, channel);
        }
    }
    exports.$q7b = $q7b;
});
//# sourceMappingURL=mainProcessService.js.map