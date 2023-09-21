/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/base/parts/ipc/common/ipc", "vs/base/test/common/utils"], function (require, exports, assert, async_1, buffer_1, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, uri_1, ipc_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QueueProtocol {
        constructor() {
            this.buffering = true;
            this.buffers = [];
            this._onMessage = new event_1.Emitter({
                onDidAddFirstListener: () => {
                    for (const buffer of this.buffers) {
                        this._onMessage.fire(buffer);
                    }
                    this.buffers = [];
                    this.buffering = false;
                },
                onDidRemoveLastListener: () => {
                    this.buffering = true;
                }
            });
            this.onMessage = this._onMessage.event;
        }
        send(buffer) {
            this.other.receive(buffer);
        }
        receive(buffer) {
            if (this.buffering) {
                this.buffers.push(buffer);
            }
            else {
                this._onMessage.fire(buffer);
            }
        }
    }
    function createProtocolPair() {
        const one = new QueueProtocol();
        const other = new QueueProtocol();
        one.other = other;
        other.other = one;
        return [one, other];
    }
    class TestIPCClient extends ipc_1.IPCClient {
        constructor(protocol, id) {
            super(protocol, id);
            this._onDidDisconnect = new event_1.Emitter();
            this.onDidDisconnect = this._onDidDisconnect.event;
        }
        dispose() {
            this._onDidDisconnect.fire();
            super.dispose();
        }
    }
    class TestIPCServer extends ipc_1.IPCServer {
        constructor() {
            const onDidClientConnect = new event_1.Emitter();
            super(onDidClientConnect.event);
            this.onDidClientConnect = onDidClientConnect;
        }
        createConnection(id) {
            const [pc, ps] = createProtocolPair();
            const client = new TestIPCClient(pc, id);
            this.onDidClientConnect.fire({
                protocol: ps,
                onDidClientDisconnect: client.onDidDisconnect
            });
            return client;
        }
    }
    const TestChannelId = 'testchannel';
    class TestService {
        constructor() {
            this.disposables = new lifecycle_1.DisposableStore();
            this._onPong = new event_1.Emitter();
            this.onPong = this._onPong.event;
        }
        marco() {
            return Promise.resolve('polo');
        }
        error(message) {
            return Promise.reject(new Error(message));
        }
        neverComplete() {
            return new Promise(_ => { });
        }
        neverCompleteCT(cancellationToken) {
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject((0, errors_1.canceled)());
            }
            return new Promise((_, e) => this.disposables.add(cancellationToken.onCancellationRequested(() => e((0, errors_1.canceled)()))));
        }
        buffersLength(buffers) {
            return Promise.resolve(buffers.reduce((r, b) => r + b.buffer.length, 0));
        }
        ping(msg) {
            this._onPong.fire(msg);
        }
        marshall(uri) {
            return Promise.resolve(uri);
        }
        context(context) {
            return Promise.resolve(context);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    class TestChannel {
        constructor(service) {
            this.service = service;
        }
        call(_, command, arg, cancellationToken) {
            switch (command) {
                case 'marco': return this.service.marco();
                case 'error': return this.service.error(arg);
                case 'neverComplete': return this.service.neverComplete();
                case 'neverCompleteCT': return this.service.neverCompleteCT(cancellationToken);
                case 'buffersLength': return this.service.buffersLength(arg);
                default: return Promise.reject(new Error('not implemented'));
            }
        }
        listen(_, event, arg) {
            switch (event) {
                case 'onPong': return this.service.onPong;
                default: throw new Error('not implemented');
            }
        }
    }
    class TestChannelClient {
        get onPong() {
            return this.channel.listen('onPong');
        }
        constructor(channel) {
            this.channel = channel;
        }
        marco() {
            return this.channel.call('marco');
        }
        error(message) {
            return this.channel.call('error', message);
        }
        neverComplete() {
            return this.channel.call('neverComplete');
        }
        neverCompleteCT(cancellationToken) {
            return this.channel.call('neverCompleteCT', undefined, cancellationToken);
        }
        buffersLength(buffers) {
            return this.channel.call('buffersLength', buffers);
        }
        marshall(uri) {
            return this.channel.call('marshall', uri);
        }
        context() {
            return this.channel.call('context');
        }
    }
    suite('Base IPC', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('createProtocolPair', async function () {
            const [clientProtocol, serverProtocol] = createProtocolPair();
            const b1 = buffer_1.VSBuffer.alloc(0);
            clientProtocol.send(b1);
            const b3 = buffer_1.VSBuffer.alloc(0);
            serverProtocol.send(b3);
            const b2 = await event_1.Event.toPromise(serverProtocol.onMessage);
            const b4 = await event_1.Event.toPromise(clientProtocol.onMessage);
            assert.strictEqual(b1, b2);
            assert.strictEqual(b3, b4);
        });
        suite('one to one', function () {
            let server;
            let client;
            let service;
            let ipcService;
            setup(function () {
                service = store.add(new TestService());
                const testServer = store.add(new TestIPCServer());
                server = testServer;
                server.registerChannel(TestChannelId, new TestChannel(service));
                client = store.add(testServer.createConnection('client1'));
                ipcService = new TestChannelClient(client.getChannel(TestChannelId));
            });
            test('call success', async function () {
                const r = await ipcService.marco();
                return assert.strictEqual(r, 'polo');
            });
            test('call error', async function () {
                try {
                    await ipcService.error('nice error');
                    return assert.fail('should not reach here');
                }
                catch (err) {
                    return assert.strictEqual(err.message, 'nice error');
                }
            });
            test('cancel call with cancelled cancellation token', async function () {
                try {
                    await ipcService.neverCompleteCT(cancellation_1.CancellationToken.Cancelled);
                    return assert.fail('should not reach here');
                }
                catch (err) {
                    return assert(err.message === 'Canceled');
                }
            });
            test('cancel call with cancellation token (sync)', function () {
                const cts = new cancellation_1.CancellationTokenSource();
                const promise = ipcService.neverCompleteCT(cts.token).then(_ => assert.fail('should not reach here'), err => assert(err.message === 'Canceled'));
                cts.cancel();
                return promise;
            });
            test('cancel call with cancellation token (async)', function () {
                const cts = new cancellation_1.CancellationTokenSource();
                const promise = ipcService.neverCompleteCT(cts.token).then(_ => assert.fail('should not reach here'), err => assert(err.message === 'Canceled'));
                setTimeout(() => cts.cancel());
                return promise;
            });
            test('listen to events', async function () {
                const messages = [];
                store.add(ipcService.onPong(msg => messages.push(msg)));
                await (0, async_1.timeout)(0);
                assert.deepStrictEqual(messages, []);
                service.ping('hello');
                await (0, async_1.timeout)(0);
                assert.deepStrictEqual(messages, ['hello']);
                service.ping('world');
                await (0, async_1.timeout)(0);
                assert.deepStrictEqual(messages, ['hello', 'world']);
            });
            test('buffers in arrays', async function () {
                const r = await ipcService.buffersLength([buffer_1.VSBuffer.alloc(2), buffer_1.VSBuffer.alloc(3)]);
                return assert.strictEqual(r, 5);
            });
            test('round trips numbers', () => {
                const input = [
                    0,
                    1,
                    -1,
                    12345,
                    -12345,
                    42.6,
                    123412341234
                ];
                const writer = new ipc_1.BufferWriter();
                (0, ipc_1.serialize)(writer, input);
                assert.deepStrictEqual((0, ipc_1.deserialize)(new ipc_1.BufferReader(writer.buffer)), input);
            });
        });
        suite('one to one (proxy)', function () {
            let server;
            let client;
            let service;
            let ipcService;
            const disposables = new lifecycle_1.DisposableStore();
            setup(function () {
                service = store.add(new TestService());
                const testServer = disposables.add(new TestIPCServer());
                server = testServer;
                server.registerChannel(TestChannelId, ipc_1.ProxyChannel.fromService(service, disposables));
                client = disposables.add(testServer.createConnection('client1'));
                ipcService = ipc_1.ProxyChannel.toService(client.getChannel(TestChannelId));
            });
            teardown(function () {
                disposables.clear();
            });
            test('call success', async function () {
                const r = await ipcService.marco();
                return assert.strictEqual(r, 'polo');
            });
            test('call error', async function () {
                try {
                    await ipcService.error('nice error');
                    return assert.fail('should not reach here');
                }
                catch (err) {
                    return assert.strictEqual(err.message, 'nice error');
                }
            });
            test('listen to events', async function () {
                const messages = [];
                disposables.add(ipcService.onPong(msg => messages.push(msg)));
                await (0, async_1.timeout)(0);
                assert.deepStrictEqual(messages, []);
                service.ping('hello');
                await (0, async_1.timeout)(0);
                assert.deepStrictEqual(messages, ['hello']);
                service.ping('world');
                await (0, async_1.timeout)(0);
                assert.deepStrictEqual(messages, ['hello', 'world']);
            });
            test('marshalling uri', async function () {
                const uri = uri_1.URI.file('foobar');
                const r = await ipcService.marshall(uri);
                assert.ok(r instanceof uri_1.URI);
                return assert.ok((0, resources_1.isEqual)(r, uri));
            });
            test('buffers in arrays', async function () {
                const r = await ipcService.buffersLength([buffer_1.VSBuffer.alloc(2), buffer_1.VSBuffer.alloc(3)]);
                return assert.strictEqual(r, 5);
            });
        });
        suite('one to one (proxy, extra context)', function () {
            let server;
            let client;
            let service;
            let ipcService;
            const disposables = new lifecycle_1.DisposableStore();
            setup(function () {
                service = store.add(new TestService());
                const testServer = disposables.add(new TestIPCServer());
                server = testServer;
                server.registerChannel(TestChannelId, ipc_1.ProxyChannel.fromService(service, disposables));
                client = disposables.add(testServer.createConnection('client1'));
                ipcService = ipc_1.ProxyChannel.toService(client.getChannel(TestChannelId), { context: 'Super Context' });
            });
            teardown(function () {
                disposables.clear();
            });
            test('call extra context', async function () {
                const r = await ipcService.context();
                return assert.strictEqual(r, 'Super Context');
            });
        });
        suite('one to many', function () {
            test('all clients get pinged', async function () {
                const service = store.add(new TestService());
                const channel = new TestChannel(service);
                const server = store.add(new TestIPCServer());
                server.registerChannel('channel', channel);
                let client1GotPinged = false;
                const client1 = store.add(server.createConnection('client1'));
                const ipcService1 = new TestChannelClient(client1.getChannel('channel'));
                store.add(ipcService1.onPong(() => client1GotPinged = true));
                let client2GotPinged = false;
                const client2 = store.add(server.createConnection('client2'));
                const ipcService2 = new TestChannelClient(client2.getChannel('channel'));
                store.add(ipcService2.onPong(() => client2GotPinged = true));
                await (0, async_1.timeout)(1);
                service.ping('hello');
                await (0, async_1.timeout)(1);
                assert(client1GotPinged, 'client 1 got pinged');
                assert(client2GotPinged, 'client 2 got pinged');
            });
            test('server gets pings from all clients (broadcast channel)', async function () {
                const server = store.add(new TestIPCServer());
                const client1 = server.createConnection('client1');
                const clientService1 = store.add(new TestService());
                const clientChannel1 = new TestChannel(clientService1);
                client1.registerChannel('channel', clientChannel1);
                const pings = [];
                const channel = server.getChannel('channel', () => true);
                const service = new TestChannelClient(channel);
                store.add(service.onPong(msg => pings.push(msg)));
                await (0, async_1.timeout)(1);
                clientService1.ping('hello 1');
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(pings, ['hello 1']);
                const client2 = server.createConnection('client2');
                const clientService2 = store.add(new TestService());
                const clientChannel2 = new TestChannel(clientService2);
                client2.registerChannel('channel', clientChannel2);
                await (0, async_1.timeout)(1);
                clientService2.ping('hello 2');
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(pings, ['hello 1', 'hello 2']);
                client1.dispose();
                clientService1.ping('hello 1');
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(pings, ['hello 1', 'hello 2']);
                await (0, async_1.timeout)(1);
                clientService2.ping('hello again 2');
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(pings, ['hello 1', 'hello 2', 'hello again 2']);
                client2.dispose();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy90ZXN0L2NvbW1vbi9pcGMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxNQUFNLGFBQWE7UUFBbkI7WUFFUyxjQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLFlBQU8sR0FBZSxFQUFFLENBQUM7WUFFaEIsZUFBVSxHQUFHLElBQUksZUFBTyxDQUFXO2dCQUNuRCxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7b0JBQzNCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQzdCO29CQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsQ0FBQztnQkFDRCx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7b0JBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRU0sY0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBYzVDLENBQUM7UUFYQSxJQUFJLENBQUMsTUFBZ0I7WUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVTLE9BQU8sQ0FBQyxNQUFnQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FB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