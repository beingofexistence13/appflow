/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "events", "net", "os", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net", "vs/base/test/common/testUtils", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, events_1, net_1, os_1, async_1, buffer_1, event_1, lifecycle_1, ipc_net_1, ipc_net_2, testUtils_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MessageStream extends lifecycle_1.Disposable {
        constructor(x) {
            super();
            this._currentComplete = null;
            this._messages = [];
            this._register(x.onMessage(data => {
                this._messages.push(data);
                this._trigger();
            }));
        }
        _trigger() {
            if (!this._currentComplete) {
                return;
            }
            if (this._messages.length === 0) {
                return;
            }
            const complete = this._currentComplete;
            const msg = this._messages.shift();
            this._currentComplete = null;
            complete(msg);
        }
        waitForOne() {
            return new Promise((complete) => {
                this._currentComplete = complete;
                this._trigger();
            });
        }
    }
    class EtherStream extends events_1.EventEmitter {
        constructor(_ether, _name) {
            super();
            this._ether = _ether;
            this._name = _name;
        }
        write(data, cb) {
            if (!Buffer.isBuffer(data)) {
                throw new Error(`Invalid data`);
            }
            this._ether.write(this._name, data);
            return true;
        }
        destroy() {
        }
    }
    class Ether {
        get a() {
            return this._a;
        }
        get b() {
            return this._b;
        }
        constructor(_wireLatency = 0) {
            this._wireLatency = _wireLatency;
            this._a = new EtherStream(this, 'a');
            this._b = new EtherStream(this, 'b');
            this._ab = [];
            this._ba = [];
        }
        write(from, data) {
            setTimeout(() => {
                if (from === 'a') {
                    this._ab.push(data);
                }
                else {
                    this._ba.push(data);
                }
                setTimeout(() => this._deliver(), 0);
            }, this._wireLatency);
        }
        _deliver() {
            if (this._ab.length > 0) {
                const data = Buffer.concat(this._ab);
                this._ab.length = 0;
                this._b.emit('data', data);
                setTimeout(() => this._deliver(), 0);
                return;
            }
            if (this._ba.length > 0) {
                const data = Buffer.concat(this._ba);
                this._ba.length = 0;
                this._a.emit('data', data);
                setTimeout(() => this._deliver(), 0);
                return;
            }
        }
    }
    suite('IPC, Socket Protocol', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let ether;
        setup(() => {
            ether = new Ether();
        });
        test('read/write', async () => {
            const a = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.a));
            const b = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.b));
            const bMessages = new MessageStream(b);
            a.send(buffer_1.VSBuffer.fromString('foobarfarboo'));
            const msg1 = await bMessages.waitForOne();
            assert.strictEqual(msg1.toString(), 'foobarfarboo');
            const buffer = buffer_1.VSBuffer.alloc(1);
            buffer.writeUInt8(123, 0);
            a.send(buffer);
            const msg2 = await bMessages.waitForOne();
            assert.strictEqual(msg2.readUInt8(0), 123);
            bMessages.dispose();
            a.dispose();
            b.dispose();
        });
        test('read/write, object data', async () => {
            const a = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.a));
            const b = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.b));
            const bMessages = new MessageStream(b);
            const data = {
                pi: Math.PI,
                foo: 'bar',
                more: true,
                data: 'Hello World'.split('')
            };
            a.send(buffer_1.VSBuffer.fromString(JSON.stringify(data)));
            const msg = await bMessages.waitForOne();
            assert.deepStrictEqual(JSON.parse(msg.toString()), data);
            bMessages.dispose();
            a.dispose();
            b.dispose();
        });
    });
    suite('PersistentProtocol reconnection', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('acks get piggybacked with messages', async () => {
            const ether = new Ether();
            const a = new ipc_net_1.PersistentProtocol({ socket: new ipc_net_2.NodeSocket(ether.a) });
            const aMessages = new MessageStream(a);
            const b = new ipc_net_1.PersistentProtocol({ socket: new ipc_net_2.NodeSocket(ether.b) });
            const bMessages = new MessageStream(b);
            a.send(buffer_1.VSBuffer.fromString('a1'));
            assert.strictEqual(a.unacknowledgedCount, 1);
            assert.strictEqual(b.unacknowledgedCount, 0);
            a.send(buffer_1.VSBuffer.fromString('a2'));
            assert.strictEqual(a.unacknowledgedCount, 2);
            assert.strictEqual(b.unacknowledgedCount, 0);
            a.send(buffer_1.VSBuffer.fromString('a3'));
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            const a1 = await bMessages.waitForOne();
            assert.strictEqual(a1.toString(), 'a1');
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            const a2 = await bMessages.waitForOne();
            assert.strictEqual(a2.toString(), 'a2');
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            const a3 = await bMessages.waitForOne();
            assert.strictEqual(a3.toString(), 'a3');
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            b.send(buffer_1.VSBuffer.fromString('b1'));
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 1);
            const b1 = await aMessages.waitForOne();
            assert.strictEqual(b1.toString(), 'b1');
            assert.strictEqual(a.unacknowledgedCount, 0);
            assert.strictEqual(b.unacknowledgedCount, 1);
            a.send(buffer_1.VSBuffer.fromString('a4'));
            assert.strictEqual(a.unacknowledgedCount, 1);
            assert.strictEqual(b.unacknowledgedCount, 1);
            const b2 = await bMessages.waitForOne();
            assert.strictEqual(b2.toString(), 'a4');
            assert.strictEqual(a.unacknowledgedCount, 1);
            assert.strictEqual(b.unacknowledgedCount, 0);
            aMessages.dispose();
            bMessages.dispose();
            a.dispose();
            b.dispose();
        });
        test('ack gets sent after a while', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true, maxTaskCount: 100 }, async () => {
                const loadEstimator = {
                    hasHighLoad: () => false
                };
                const ether = new Ether();
                const aSocket = new ipc_net_2.NodeSocket(ether.a);
                const a = new ipc_net_1.PersistentProtocol({ socket: aSocket, loadEstimator });
                const aMessages = new MessageStream(a);
                const bSocket = new ipc_net_2.NodeSocket(ether.b);
                const b = new ipc_net_1.PersistentProtocol({ socket: bSocket, loadEstimator });
                const bMessages = new MessageStream(b);
                // send one message A -> B
                a.send(buffer_1.VSBuffer.fromString('a1'));
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                const a1 = await bMessages.waitForOne();
                assert.strictEqual(a1.toString(), 'a1');
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                // wait for ack to arrive B -> A
                await (0, async_1.timeout)(2 * 2000 /* ProtocolConstants.AcknowledgeTime */);
                assert.strictEqual(a.unacknowledgedCount, 0);
                assert.strictEqual(b.unacknowledgedCount, 0);
                aMessages.dispose();
                bMessages.dispose();
                a.dispose();
                b.dispose();
            });
        });
        test('messages that are never written to a socket should not cause an ack timeout', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({
                useFakeTimers: true,
                useSetImmediate: true,
                maxTaskCount: 1000
            }, async () => {
                // Date.now() in fake timers starts at 0, which is very inconvenient
                // since we want to test exactly that a certain field is not initialized with Date.now()
                // As a workaround we wait such that Date.now() starts producing more realistic values
                await (0, async_1.timeout)(60 * 60 * 1000);
                const loadEstimator = {
                    hasHighLoad: () => false
                };
                const ether = new Ether();
                const aSocket = new ipc_net_2.NodeSocket(ether.a);
                const a = new ipc_net_1.PersistentProtocol({ socket: aSocket, loadEstimator, sendKeepAlive: false });
                const aMessages = new MessageStream(a);
                const bSocket = new ipc_net_2.NodeSocket(ether.b);
                const b = new ipc_net_1.PersistentProtocol({ socket: bSocket, loadEstimator, sendKeepAlive: false });
                const bMessages = new MessageStream(b);
                // send message a1 before reconnection to get _recvAckCheck() scheduled
                a.send(buffer_1.VSBuffer.fromString('a1'));
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                // read message a1 at B
                const a1 = await bMessages.waitForOne();
                assert.strictEqual(a1.toString(), 'a1');
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                // send message b1 to send the ack for a1
                b.send(buffer_1.VSBuffer.fromString('b1'));
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 1);
                // read message b1 at A to receive the ack for a1
                const b1 = await aMessages.waitForOne();
                assert.strictEqual(b1.toString(), 'b1');
                assert.strictEqual(a.unacknowledgedCount, 0);
                assert.strictEqual(b.unacknowledgedCount, 1);
                // begin reconnection
                aSocket.dispose();
                const aSocket2 = new ipc_net_2.NodeSocket(ether.a);
                a.beginAcceptReconnection(aSocket2, null);
                let timeoutListenerCalled = false;
                const socketTimeoutListener = a.onSocketTimeout(() => {
                    timeoutListenerCalled = true;
                });
                // send message 2 during reconnection
                a.send(buffer_1.VSBuffer.fromString('a2'));
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 1);
                // wait for scheduled _recvAckCheck() to execute
                await (0, async_1.timeout)(2 * 20000 /* ProtocolConstants.TimeoutTime */);
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 1);
                assert.strictEqual(timeoutListenerCalled, false);
                a.endAcceptReconnection();
                assert.strictEqual(timeoutListenerCalled, false);
                await (0, async_1.timeout)(2 * 20000 /* ProtocolConstants.TimeoutTime */);
                assert.strictEqual(a.unacknowledgedCount, 0);
                assert.strictEqual(b.unacknowledgedCount, 0);
                assert.strictEqual(timeoutListenerCalled, false);
                socketTimeoutListener.dispose();
                aMessages.dispose();
                bMessages.dispose();
                a.dispose();
                b.dispose();
            });
        });
        test('acks are always sent after a reconnection', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({
                useFakeTimers: true,
                useSetImmediate: true,
                maxTaskCount: 1000
            }, async () => {
                const loadEstimator = {
                    hasHighLoad: () => false
                };
                const wireLatency = 1000;
                const ether = new Ether(wireLatency);
                const aSocket = new ipc_net_2.NodeSocket(ether.a);
                const a = new ipc_net_1.PersistentProtocol({ socket: aSocket, loadEstimator });
                const aMessages = new MessageStream(a);
                const bSocket = new ipc_net_2.NodeSocket(ether.b);
                const b = new ipc_net_1.PersistentProtocol({ socket: bSocket, loadEstimator });
                const bMessages = new MessageStream(b);
                // send message a1 to have something unacknowledged
                a.send(buffer_1.VSBuffer.fromString('a1'));
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                // read message a1 at B
                const a1 = await bMessages.waitForOne();
                assert.strictEqual(a1.toString(), 'a1');
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                // wait for B to send an ACK message,
                // but resume before A receives it
                await (0, async_1.timeout)(2000 /* ProtocolConstants.AcknowledgeTime */ + wireLatency / 2);
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 0);
                // simulate complete reconnection
                aSocket.dispose();
                bSocket.dispose();
                const ether2 = new Ether(wireLatency);
                const aSocket2 = new ipc_net_2.NodeSocket(ether2.a);
                const bSocket2 = new ipc_net_2.NodeSocket(ether2.b);
                b.beginAcceptReconnection(bSocket2, null);
                b.endAcceptReconnection();
                a.beginAcceptReconnection(aSocket2, null);
                a.endAcceptReconnection();
                // wait for quite some time
                await (0, async_1.timeout)(2 * 2000 /* ProtocolConstants.AcknowledgeTime */ + wireLatency);
                assert.strictEqual(a.unacknowledgedCount, 0);
                assert.strictEqual(b.unacknowledgedCount, 0);
                aMessages.dispose();
                bMessages.dispose();
                a.dispose();
                b.dispose();
            });
        });
        test('onSocketTimeout is emitted at most once every 20s', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({
                useFakeTimers: true,
                useSetImmediate: true,
                maxTaskCount: 1000
            }, async () => {
                const loadEstimator = {
                    hasHighLoad: () => false
                };
                const ether = new Ether();
                const aSocket = new ipc_net_2.NodeSocket(ether.a);
                const a = new ipc_net_1.PersistentProtocol({ socket: aSocket, loadEstimator });
                const aMessages = new MessageStream(a);
                const bSocket = new ipc_net_2.NodeSocket(ether.b);
                const b = new ipc_net_1.PersistentProtocol({ socket: bSocket, loadEstimator });
                const bMessages = new MessageStream(b);
                // never receive acks
                b.pauseSocketWriting();
                // send message a1 to have something unacknowledged
                a.send(buffer_1.VSBuffer.fromString('a1'));
                // wait for the first timeout to fire
                await event_1.Event.toPromise(a.onSocketTimeout);
                let timeoutFiredAgain = false;
                const timeoutListener = a.onSocketTimeout(() => {
                    timeoutFiredAgain = true;
                });
                // send more messages
                a.send(buffer_1.VSBuffer.fromString('a2'));
                a.send(buffer_1.VSBuffer.fromString('a3'));
                // wait for 10s
                await (0, async_1.timeout)(20000 /* ProtocolConstants.TimeoutTime */ / 2);
                assert.strictEqual(timeoutFiredAgain, false);
                timeoutListener.dispose();
                aMessages.dispose();
                bMessages.dispose();
                a.dispose();
                b.dispose();
            });
        });
        test('writing can be paused', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true, maxTaskCount: 100 }, async () => {
                const loadEstimator = {
                    hasHighLoad: () => false
                };
                const ether = new Ether();
                const aSocket = new ipc_net_2.NodeSocket(ether.a);
                const a = new ipc_net_1.PersistentProtocol({ socket: aSocket, loadEstimator });
                const aMessages = new MessageStream(a);
                const bSocket = new ipc_net_2.NodeSocket(ether.b);
                const b = new ipc_net_1.PersistentProtocol({ socket: bSocket, loadEstimator });
                const bMessages = new MessageStream(b);
                // send one message A -> B
                a.send(buffer_1.VSBuffer.fromString('a1'));
                const a1 = await bMessages.waitForOne();
                assert.strictEqual(a1.toString(), 'a1');
                // ask A to pause writing
                b.sendPause();
                // send a message B -> A
                b.send(buffer_1.VSBuffer.fromString('b1'));
                const b1 = await aMessages.waitForOne();
                assert.strictEqual(b1.toString(), 'b1');
                // send a message A -> B (this should be blocked at A)
                a.send(buffer_1.VSBuffer.fromString('a2'));
                // wait a long time and check that not even acks are written
                await (0, async_1.timeout)(2 * 2000 /* ProtocolConstants.AcknowledgeTime */);
                assert.strictEqual(a.unacknowledgedCount, 1);
                assert.strictEqual(b.unacknowledgedCount, 1);
                // ask A to resume writing
                b.sendResume();
                // check that B receives message
                const a2 = await bMessages.waitForOne();
                assert.strictEqual(a2.toString(), 'a2');
                // wait a long time and check that acks are written
                await (0, async_1.timeout)(2 * 2000 /* ProtocolConstants.AcknowledgeTime */);
                assert.strictEqual(a.unacknowledgedCount, 0);
                assert.strictEqual(b.unacknowledgedCount, 0);
                aMessages.dispose();
                bMessages.dispose();
                a.dispose();
                b.dispose();
            });
        });
    });
    (0, testUtils_1.flakySuite)('IPC, create handle', () => {
        test('createRandomIPCHandle', async () => {
            return testIPCHandle((0, ipc_net_2.createRandomIPCHandle)());
        });
        test('createStaticIPCHandle', async () => {
            return testIPCHandle((0, ipc_net_2.createStaticIPCHandle)((0, os_1.tmpdir)(), 'test', '1.64.0'));
        });
        function testIPCHandle(handle) {
            return new Promise((resolve, reject) => {
                const pipeName = (0, ipc_net_2.createRandomIPCHandle)();
                const server = (0, net_1.createServer)();
                server.on('error', () => {
                    return new Promise(() => server.close(() => reject()));
                });
                server.listen(pipeName, () => {
                    server.removeListener('error', reject);
                    return new Promise(() => {
                        server.close(() => resolve());
                    });
                });
            });
        }
    });
    suite('WebSocketNodeSocket', () => {
        function toUint8Array(data) {
            const result = new Uint8Array(data.length);
            for (let i = 0; i < data.length; i++) {
                result[i] = data[i];
            }
            return result;
        }
        function fromUint8Array(data) {
            const result = [];
            for (let i = 0; i < data.length; i++) {
                result[i] = data[i];
            }
            return result;
        }
        function fromCharCodeArray(data) {
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(data[i]);
            }
            return result;
        }
        class FakeNodeSocket extends lifecycle_1.Disposable {
            traceSocketEvent(type, data) {
            }
            constructor() {
                super();
                this._onData = new event_1.Emitter();
                this.onData = this._onData.event;
                this._onClose = new event_1.Emitter();
                this.onClose = this._onClose.event;
            }
            fireData(data) {
                this._onData.fire(buffer_1.VSBuffer.wrap(toUint8Array(data)));
            }
        }
        async function testReading(frames, permessageDeflate) {
            const disposables = new lifecycle_1.DisposableStore();
            const socket = new FakeNodeSocket();
            const webSocket = disposables.add(new ipc_net_2.WebSocketNodeSocket(socket, permessageDeflate, null, false));
            const barrier = new async_1.Barrier();
            let remainingFrameCount = frames.length;
            let receivedData = '';
            disposables.add(webSocket.onData((buff) => {
                receivedData += fromCharCodeArray(fromUint8Array(buff.buffer));
                remainingFrameCount--;
                if (remainingFrameCount === 0) {
                    barrier.open();
                }
            }));
            for (let i = 0; i < frames.length; i++) {
                socket.fireData(frames[i]);
            }
            await barrier.wait();
            disposables.dispose();
            return receivedData;
        }
        test('A single-frame unmasked text message', async () => {
            const frames = [
                [0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f] // contains "Hello"
            ];
            const actual = await testReading(frames, false);
            assert.deepStrictEqual(actual, 'Hello');
        });
        test('A single-frame masked text message', async () => {
            const frames = [
                [0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d, 0x7f, 0x9f, 0x4d, 0x51, 0x58] // contains "Hello"
            ];
            const actual = await testReading(frames, false);
            assert.deepStrictEqual(actual, 'Hello');
        });
        test('A fragmented unmasked text message', async () => {
            // contains "Hello"
            const frames = [
                [0x01, 0x03, 0x48, 0x65, 0x6c],
                [0x80, 0x02, 0x6c, 0x6f], // contains "lo"
            ];
            const actual = await testReading(frames, false);
            assert.deepStrictEqual(actual, 'Hello');
        });
        suite('compression', () => {
            test('A single-frame compressed text message', async () => {
                // contains "Hello"
                const frames = [
                    [0xc1, 0x07, 0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00], // contains "Hello"
                ];
                const actual = await testReading(frames, true);
                assert.deepStrictEqual(actual, 'Hello');
            });
            test('A fragmented compressed text message', async () => {
                // contains "Hello"
                const frames = [
                    [0x41, 0x03, 0xf2, 0x48, 0xcd],
                    [0x80, 0x04, 0xc9, 0xc9, 0x07, 0x00]
                ];
                const actual = await testReading(frames, true);
                assert.deepStrictEqual(actual, 'Hello');
            });
            test('A single-frame non-compressed text message', async () => {
                const frames = [
                    [0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f] // contains "Hello"
                ];
                const actual = await testReading(frames, true);
                assert.deepStrictEqual(actual, 'Hello');
            });
            test('A single-frame compressed text message followed by a single-frame non-compressed text message', async () => {
                const frames = [
                    [0xc1, 0x07, 0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00],
                    [0x81, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64] // contains "world"
                ];
                const actual = await testReading(frames, true);
                assert.deepStrictEqual(actual, 'Helloworld');
            });
        });
        test('Large buffers are split and sent in chunks', async () => {
            let receivingSideOnDataCallCount = 0;
            let receivingSideTotalBytes = 0;
            const receivingSideSocketClosedBarrier = new async_1.Barrier();
            const server = await listenOnRandomPort((socket) => {
                // stop the server when the first connection is received
                server.close();
                const webSocketNodeSocket = new ipc_net_2.WebSocketNodeSocket(new ipc_net_2.NodeSocket(socket), true, null, false);
                webSocketNodeSocket.onData((data) => {
                    receivingSideOnDataCallCount++;
                    receivingSideTotalBytes += data.byteLength;
                });
                webSocketNodeSocket.onClose(() => {
                    webSocketNodeSocket.dispose();
                    receivingSideSocketClosedBarrier.open();
                });
            });
            const socket = (0, net_1.connect)({
                host: '127.0.0.1',
                port: server.address().port
            });
            const buff = generateRandomBuffer(1 * 1024 * 1024);
            const webSocketNodeSocket = new ipc_net_2.WebSocketNodeSocket(new ipc_net_2.NodeSocket(socket), true, null, false);
            webSocketNodeSocket.write(buff);
            await webSocketNodeSocket.drain();
            webSocketNodeSocket.dispose();
            await receivingSideSocketClosedBarrier.wait();
            assert.strictEqual(receivingSideTotalBytes, buff.byteLength);
            assert.strictEqual(receivingSideOnDataCallCount, 4);
        });
        function generateRandomBuffer(size) {
            const buff = buffer_1.VSBuffer.alloc(size);
            for (let i = 0; i < size; i++) {
                buff.writeUInt8(Math.floor(256 * Math.random()), i);
            }
            return buff;
        }
        function listenOnRandomPort(handler) {
            return new Promise((resolve, reject) => {
                const server = (0, net_1.createServer)(handler).listen(0);
                server.on('listening', () => {
                    resolve(server);
                });
                server.on('error', (err) => {
                    reject(err);
                });
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm5ldC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvdGVzdC9ub2RlL2lwYy5uZXQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWdCaEcsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFLckMsWUFBWSxDQUFnQztZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sUUFBUTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzNCLE9BQU87YUFDUDtZQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoQyxPQUFPO2FBQ1A7WUFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDdkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUcsQ0FBQztZQUVwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBQzdCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLENBQUM7UUFFTSxVQUFVO1lBQ2hCLE9BQU8sSUFBSSxPQUFPLENBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDekMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEs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QUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU3QyxNQUFNLEVBQUUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU3QyxNQUFNLEVBQUUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU3QyxNQUFNLEVBQUUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU3QyxDQUFDLENBQUMsSUFBSSxD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