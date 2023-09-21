/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/base/parts/ipc/node/ipc.mp", "vs/base/parts/sandbox/node/electronTypes", "vs/platform/files/node/watcher/watcher"], function (require, exports, lifecycle_1, ipc_1, ipc_cp_1, ipc_mp_1, electronTypes_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let server;
    if ((0, electronTypes_1.$7S)(process)) {
        server = new ipc_mp_1.$8S();
    }
    else {
        server = new ipc_cp_1.$Rp('watcher');
    }
    const service = new watcher_1.$x$b();
    server.registerChannel('watcher', ipc_1.ProxyChannel.fromService(service, new lifecycle_1.$jc()));
});
//# sourceMappingURL=watcherMain.js.map