/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/base/parts/ipc/common/ipc", "vs/base/test/common/utils"], function (require, exports, assert, async_1, buffer_1, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, uri_1, ipc_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class QueueProtocol {
        constructor() {
            this.a = true;
            this.c = [];
            this.d = new event_1.$fd({
                onDidAddFirstListener: () => {
                    for (const buffer of this.c) {
                        this.d.fire(buffer);
                    }
                    this.c = [];
                    this.a = false;
                },
                onDidRemoveLastListener: () => {
                    this.a = true;
                }
            });
            this.onMessage = this.d.event;
        }
        send(buffer) {
            this.other.f(buffer);
        }
        f(buffer) {
            if (this.a) {
                this.c.push(buffer);
            }
            else {
                this.d.fire(buffer);
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
    class TestIPCClient extends ipc_1.$gh {
        constructor(protocol, id) {
            super(protocol, id);
            this.f = new event_1.$fd();
            this.onDidDisconnect = this.f.event;
        }
        dispose() {
            this.f.fire();
            super.dispose();
        }
    }
    class TestIPCServer extends ipc_1.$fh {
        constructor() {
            const onDidClientConnect = new event_1.$fd();
            super(onDidClientConnect.event);
            this.d = onDidClientConnect;
        }
        createConnection(id) {
            const [pc, ps] = createProtocolPair();
            const client = new TestIPCClient(pc, id);
            this.d.fire({
                protocol: ps,
                onDidClientDisconnect: client.onDidDisconnect
            });
            return client;
        }
    }
    const TestChannelId = 'testchannel';
    class TestService {
        constructor() {
            this.a = new lifecycle_1.$jc();
            this.c = new event_1.$fd();
            this.onPong = this.c.event;
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
                return Promise.reject((0, errors_1.$4)());
            }
            return new Promise((_, e) => this.a.add(cancellationToken.onCancellationRequested(() => e((0, errors_1.$4)()))));
        }
        buffersLength(buffers) {
            return Promise.resolve(buffers.reduce((r, b) => r + b.buffer.length, 0));
        }
        ping(msg) {
            this.c.fire(msg);
        }
        marshall(uri) {
            return Promise.resolve(uri);
        }
        context(context) {
            return Promise.resolve(context);
        }
        dispose() {
            this.a.dispose();
        }
    }
    class TestChannel {
        constructor(a) {
            this.a = a;
        }
        call(_, command, arg, cancellationToken) {
            switch (command) {
                case 'marco': return this.a.marco();
                case 'error': return this.a.error(arg);
                case 'neverComplete': return this.a.neverComplete();
                case 'neverCompleteCT': return this.a.neverCompleteCT(cancellationToken);
                case 'buffersLength': return this.a.buffersLength(arg);
                default: return Promise.reject(new Error('not implemented'));
            }
        }
        listen(_, event, arg) {
            switch (event) {
                case 'onPong': return this.a.onPong;
                default: throw new Error('not implemented');
            }
        }
    }
    class TestChannelClient {
        get onPong() {
            return this.a.listen('onPong');
        }
        constructor(a) {
            this.a = a;
        }
        marco() {
            return this.a.call('marco');
        }
        error(message) {
            return this.a.call('error', message);
        }
        neverComplete() {
            return this.a.call('neverComplete');
        }
        neverCompleteCT(cancellationToken) {
            return this.a.call('neverCompleteCT', undefined, cancellationToken);
        }
        buffersLength(buffers) {
            return this.a.call('buffersLength', buffers);
        }
        marshall(uri) {
            return this.a.call('marshall', uri);
        }
        context() {
            return this.a.call('context');
        }
    }
    suite('Base IPC', function () {
        const store = (0, utils_1.$bT)();
        test('createProtocolPair', async function () {
            const [clientProtocol, serverProtocol] = createProtocolPair();
            const b1 = buffer_1.$Fd.alloc(0);
            clientProtocol.send(b1);
            const b3 = buffer_1.$Fd.alloc(0);
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
                const cts = new cancellation_1.$pd();
                const promise = ipcService.neverCompleteCT(cts.token).then(_ => assert.fail('should not reach here'), err => assert(err.message === 'Canceled'));
                cts.cancel();
                return promise;
            });
            test('cancel call with cancellation token (async)', function () {
                const cts = new cancellation_1.$pd();
                const promise = ipcService.neverCompleteCT(cts.token).then(_ => assert.fail('should not reach here'), err => assert(err.message === 'Canceled'));
                setTimeout(() => cts.cancel());
                return promise;
            });
            test('listen to events', async function () {
                const messages = [];
                store.add(ipcService.onPong(msg => messages.push(msg)));
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(messages, []);
                service.ping('hello');
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(messages, ['hello']);
                service.ping('world');
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(messages, ['hello', 'world']);
            });
            test('buffers in arrays', async function () {
                const r = await ipcService.buffersLength([buffer_1.$Fd.alloc(2), buffer_1.$Fd.alloc(3)]);
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
                const writer = new ipc_1.$ah();
                (0, ipc_1.$bh)(writer, input);
                assert.deepStrictEqual((0, ipc_1.$ch)(new ipc_1.$_g(writer.buffer)), input);
            });
        });
        suite('one to one (proxy)', function () {
            let server;
            let client;
            let service;
            let ipcService;
            const disposables = new lifecycle_1.$jc();
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
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(messages, []);
                service.ping('hello');
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(messages, ['hello']);
                service.ping('world');
                await (0, async_1.$Hg)(0);
                assert.deepStrictEqual(messages, ['hello', 'world']);
            });
            test('marshalling uri', async function () {
                const uri = uri_1.URI.file('foobar');
                const r = await ipcService.marshall(uri);
                assert.ok(r instanceof uri_1.URI);
                return assert.ok((0, resources_1.$bg)(r, uri));
            });
            test('buffers in arrays', async function () {
                const r = await ipcService.buffersLength([buffer_1.$Fd.alloc(2), buffer_1.$Fd.alloc(3)]);
                return assert.strictEqual(r, 5);
            });
        });
        suite('one to one (proxy, extra context)', function () {
            let server;
            let client;
            let service;
            let ipcService;
            const disposables = new lifecycle_1.$jc();
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
                await (0, async_1.$Hg)(1);
                service.ping('hello');
                await (0, async_1.$Hg)(1);
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
                await (0, async_1.$Hg)(1);
                clientService1.ping('hello 1');
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(pings, ['hello 1']);
                const client2 = server.createConnection('client2');
                const clientService2 = store.add(new TestService());
                const clientChannel2 = new TestChannel(clientService2);
                client2.registerChannel('channel', clientChannel2);
                await (0, async_1.$Hg)(1);
                clientService2.ping('hello 2');
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(pings, ['hello 1', 'hello 2']);
                client1.dispose();
                clientService1.ping('hello 1');
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(pings, ['hello 1', 'hello 2']);
                await (0, async_1.$Hg)(1);
                clientService2.ping('hello again 2');
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(pings, ['hello 1', 'hello 2', 'hello again 2']);
                client2.dispose();
            });
        });
    });
});
//# sourceMappingURL=ipc.test.js.map