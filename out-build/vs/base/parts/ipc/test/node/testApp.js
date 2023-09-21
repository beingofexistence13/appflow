/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/node/ipc.cp", "./testService"], function (require, exports, ipc_cp_1, testService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const server = new ipc_cp_1.$Rp('test');
    const service = new testService_1.$eT();
    server.registerChannel('test', new testService_1.$fT(service));
});
//# sourceMappingURL=testApp.js.map