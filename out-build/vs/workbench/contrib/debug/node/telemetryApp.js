/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/node/1dsAppender"], function (require, exports, ipc_cp_1, telemetryIpc_1, _1dsAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const appender = new _1dsAppender_1.$aN(undefined, false, process.argv[2], JSON.parse(process.argv[3]), process.argv[4]);
    process.once('exit', () => appender.flush());
    const channel = new telemetryIpc_1.$B6b([appender]);
    const server = new ipc_cp_1.$Rp('telemetry');
    server.registerChannel('telemetryAppender', channel);
});
//# sourceMappingURL=telemetryApp.js.map