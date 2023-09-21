/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/ipc/browser/ipc.mp", "vs/base/test/common/utils"], function (require, exports, assert, ipc_mp_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('IPC, MessagePorts', () => {
        test('message passing', async () => {
            const { port1, port2 } = new MessageChannel();
            const client1 = new ipc_mp_1.$ZS(port1, 'client1');
            const client2 = new ipc_mp_1.$ZS(port2, 'client2');
            client1.registerChannel('client1', {
                call(_, command, arg, cancellationToken) {
                    switch (command) {
                        case 'testMethodClient1': return Promise.resolve('success1');
                        default: return Promise.reject(new Error('not implemented'));
                    }
                },
                listen(_, event, arg) {
                    switch (event) {
                        default: throw new Error('not implemented');
                    }
                }
            });
            client2.registerChannel('client2', {
                call(_, command, arg, cancellationToken) {
                    switch (command) {
                        case 'testMethodClient2': return Promise.resolve('success2');
                        default: return Promise.reject(new Error('not implemented'));
                    }
                },
                listen(_, event, arg) {
                    switch (event) {
                        default: throw new Error('not implemented');
                    }
                }
            });
            const channelClient1 = client2.getChannel('client1');
            assert.strictEqual(await channelClient1.call('testMethodClient1'), 'success1');
            const channelClient2 = client1.getChannel('client2');
            assert.strictEqual(await channelClient2.call('testMethodClient2'), 'success2');
            client1.dispose();
            client2.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=ipc.mp.test.js.map