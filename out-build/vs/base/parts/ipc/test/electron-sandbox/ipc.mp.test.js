/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/ipc/browser/ipc.mp", "vs/base/test/common/utils"], function (require, exports, assert, ipc_mp_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('IPC, MessagePorts', () => {
        test('message port close event', async () => {
            const { port1, port2 } = new MessageChannel();
            const client1 = new ipc_mp_1.$ZS(port1, 'client1');
            const client2 = new ipc_mp_1.$ZS(port2, 'client2');
            // This test ensures that Electron's API for the close event
            // does not break because we rely on it to dispose client
            // connections from the server.
            //
            // This event is not provided by browser MessagePort API though.
            const whenClosed = new Promise(resolve => port1.addEventListener('close', () => resolve(true)));
            client2.dispose();
            assert.ok(await whenClosed);
            client1.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=ipc.mp.test.js.map