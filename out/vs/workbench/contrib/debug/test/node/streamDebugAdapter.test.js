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
            const pipePath = platform.isWindows ? (0, path_1.join)('\\\\.\\pipe\\', pipeName) : (0, path_1.join)((0, os_1.tmpdir)(), pipeName);
            progress.push(`listen on ${pipePath}`);
            const server = await new Promise((resolve, reject) => {
                const server = net.createServer(serverConnection);
                server.once('listening', () => resolve(server));
                server.once('error', reject);
                server.listen(pipePath);
            });
            progress.push('server up');
            const debugAdapter = new debugAdapter_1.NamedPipeDebugAdapter({
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
            const port = await ports.findFreePort(rndPort, 10 /* try 10 ports */, 3000 /* try up to 3 seconds */, 87 /* skip 87 ports between attempts */);
            const server = net.createServer(serverConnection).listen(port);
            const debugAdapter = new debugAdapter_1.SocketDebugAdapter({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtRGVidWdBZGFwdGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy90ZXN0L25vZGUvc3RyZWFtRGVidWdBZGFwdGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsU0FBUyxxQkFBcUIsQ0FBQyxZQUFnQztRQUM5RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLFlBQVksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ3hFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLE1BQWtCO1FBQzNDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sUUFBUSxHQUFRO2dCQUNyQixHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7Z0JBQ2hCLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRztnQkFDeEIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTzthQUN4QixDQUFDO1lBQ0YsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsS0FBSyxNQUFNLEVB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