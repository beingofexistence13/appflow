/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "crypto", "net", "vs/base/common/platform", "os", "vs/base/common/path", "vs/base/node/ports", "vs/workbench/contrib/debug/node/debugAdapter"], function (require, exports, assert, crypto, net, platform, os_1, path_1, ports, debugAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sendInitializeRequest(debugAdapter) {
        return new Promise((resolve, reject) => {
            debugAdapter.sendRequest('initialize', { adapterID: 'test' }, (result) => {
                resolve(result);
            }, 3000);
        });
    }
    function serverConnection(socket) {
        socket.on('data', (data) => {
            const str = data.toString().split('\r\n')[2];
            const request = JSON.parse(str);
            const response = {
                seq: request.seq,
                request_seq: request.seq,
                type: 'response',
                command: request.command
            };
            if (request.arguments.adapterID === 'test') {
                response.success = true;
            }
            else {
                response.success = false;
                response.message = 'failed';
            }
            const responsePayload = JSON.stringify(response);
            socket.write(`Content-Length: ${responsePayload.length}\r\n\r\n${responsePayload}`);
        });
    }
    suite('Debug - StreamDebugAdapter', () => {
        test(`StreamDebugAdapter (NamedPipeDebugAdapter) can initialize a connection`, async () => {
            // todo@connor4312: debug test failure that seems to only happen in CI.
            // Even running this test on a loop on my machine for an hour doesn't hit failures :(
            const progress = [];
            const timeout = setTimeout(() => {
                console.log('NamedPipeDebugAdapter test might fail. Progress:', progress.join(','));
            }, 1000); // should usually finish is <10ms
            const pipeName = crypto.randomBytes(10).toString('hex');
            const pipePath = platform.$i ? (0, path_1.$9d)('\\\\.\\pipe\\', pipeName) : (0, path_1.$9d)((0, os_1.tmpdir)(), pipeName);
            progress.push(`listen on ${pipePath}`);
            const server = await new Promise((resolve, reject) => {
                const server = net.createServer(serverConnection);
                server.once('listening', () => resolve(server));
                server.once('error', reject);
                server.listen(pipePath);
            });
            progress.push('server up');
            const debugAdapter = new debugAdapter_1.$mdc({
                type: 'pipeServer',
                path: pipePath
            });
            try {
                await debugAdapter.startSession();
                progress.push('started session');
                const response = await sendInitializeRequest(debugAdapter);
                progress.push('got response');
                assert.strictEqual(response.command, 'initialize');
                assert.strictEqual(response.request_seq, 1);
                assert.strictEqual(response.success, true, response.message);
            }
            finally {
                await debugAdapter.stopSession();
                progress.push('stopped session');
                clearTimeout(timeout);
                server.close();
                debugAdapter.dispose();
            }
        });
        test(`StreamDebugAdapter (SocketDebugAdapter) can initialize a connection`, async () => {
            const rndPort = Math.floor(Math.random() * 1000 + 8000);
            const port = await ports.$6f(rndPort, 10 /* try 10 ports */, 3000 /* try up to 3 seconds */, 87 /* skip 87 ports between attempts */);
            const server = net.createServer(serverConnection).listen(port);
            const debugAdapter = new debugAdapter_1.$ldc({
                type: 'server',
                port
            });
            try {
                await debugAdapter.startSession();
                const response = await sendInitializeRequest(debugAdapter);
                assert.strictEqual(response.command, 'initialize');
                assert.strictEqual(response.request_seq, 1);
                assert.strictEqual(response.success, true, response.message);
            }
            finally {
                await debugAdapter.stopSession();
                server.close();
                debugAdapter.dispose();
            }
        });
    });
});
//# sourceMappingURL=streamDebugAdapter.test.js.map