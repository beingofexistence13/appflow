/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/workbench/api/browser/mainThreadManagedSockets"], function (require, exports, assert, async_1, buffer_1, event_1, lifecycle_1, mock_1, utils_1, mainThreadManagedSockets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadManagedSockets', () => {
        const ds = (0, utils_1.$bT)();
        suite('ManagedSocket', () => {
            let extHost;
            let half;
            class ExtHostMock extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.a = new event_1.$fd();
                    this.events = [];
                }
                $remoteSocketWrite(socketId, buffer) {
                    this.events.push({ socketId, data: buffer.toString() });
                    this.a.fire();
                }
                $remoteSocketDrain(socketId) {
                    this.events.push({ socketId, event: 'drain' });
                    this.a.fire();
                    return Promise.resolve();
                }
                $remoteSocketEnd(socketId) {
                    this.events.push({ socketId, event: 'end' });
                    this.a.fire();
                }
                expectEvent(test, message) {
                    if (this.events.some(test)) {
                        return;
                    }
                    const d = new lifecycle_1.$jc();
                    return new Promise(resolve => {
                        d.add(this.a.event(() => {
                            if (this.events.some(test)) {
                                return;
                            }
                        }));
                        d.add((0, async_1.$Ig)(() => {
                            throw new Error(`Expected ${message} but only had ${JSON.stringify(this.events, null, 2)}`);
                        }, 1000));
                    }).finally(() => d.dispose());
                }
            }
            setup(() => {
                extHost = new ExtHostMock();
                half = {
                    onClose: new event_1.$fd(),
                    onData: new event_1.$fd(),
                    onEnd: new event_1.$fd(),
                };
            });
            async function doConnect() {
                const socket = mainThreadManagedSockets_1.$Ekb.connect(1, extHost, '/hello', 'world=true', '', half);
                await extHost.expectEvent(evt => evt.data && evt.data.startsWith('GET ws://localhost/hello?world=true&skipWebSocketFrames=true HTTP/1.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Key:'), 'websocket open event');
                half.onData.fire(buffer_1.$Fd.fromString('Opened successfully ;)\r\n\r\n'));
                return ds.add(await socket);
            }
            test('connects', async () => {
                await doConnect();
            });
            test('includes trailing connection data', async () => {
                const socketProm = mainThreadManagedSockets_1.$Ekb.connect(1, extHost, '/hello', 'world=true', '', half);
                await extHost.expectEvent(evt => evt.data && evt.data.includes('GET ws://localhost'), 'websocket open event');
                half.onData.fire(buffer_1.$Fd.fromString('Opened successfully ;)\r\n\r\nSome trailing data'));
                const socket = ds.add(await socketProm);
                const data = [];
                ds.add(socket.onData(d => data.push(d.toString())));
                await (0, async_1.$Hg)(1); // allow microtasks to flush
                assert.deepStrictEqual(data, ['Some trailing data']);
            });
            test('round trips data', async () => {
                const socket = await doConnect();
                const data = [];
                ds.add(socket.onData(d => data.push(d.toString())));
                socket.write(buffer_1.$Fd.fromString('ping'));
                await extHost.expectEvent(evt => evt.data === 'ping', 'expected ping');
                half.onData.fire(buffer_1.$Fd.fromString("pong"));
                assert.deepStrictEqual(data, ['pong']);
            });
        });
    });
});
//# sourceMappingURL=mainThreadManagedSockets.test.js.map