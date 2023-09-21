/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/workbench/api/browser/mainThreadManagedSockets"], function (require, exports, assert, async_1, buffer_1, event_1, lifecycle_1, mock_1, utils_1, mainThreadManagedSockets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadManagedSockets', () => {
        const ds = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('ManagedSocket', () => {
            let extHost;
            let half;
            class ExtHostMock extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidFire = new event_1.Emitter();
                    this.events = [];
                }
                $remoteSocketWrite(socketId, buffer) {
                    this.events.push({ socketId, data: buffer.toString() });
                    this.onDidFire.fire();
                }
                $remoteSocketDrain(socketId) {
                    this.events.push({ socketId, event: 'drain' });
                    this.onDidFire.fire();
                    return Promise.resolve();
                }
                $remoteSocketEnd(socketId) {
                    this.events.push({ socketId, event: 'end' });
                    this.onDidFire.fire();
                }
                expectEvent(test, message) {
                    if (this.events.some(test)) {
                        return;
                    }
                    const d = new lifecycle_1.DisposableStore();
                    return new Promise(resolve => {
                        d.add(this.onDidFire.event(() => {
                            if (this.events.some(test)) {
                                return;
                            }
                        }));
                        d.add((0, async_1.disposableTimeout)(() => {
                            throw new Error(`Expected ${message} but only had ${JSON.stringify(this.events, null, 2)}`);
                        }, 1000));
                    }).finally(() => d.dispose());
                }
            }
            setup(() => {
                extHost = new ExtHostMock();
                half = {
                    onClose: new event_1.Emitter(),
                    onData: new event_1.Emitter(),
                    onEnd: new event_1.Emitter(),
                };
            });
            async function doConnect() {
                const socket = mainThreadManagedSockets_1.MainThreadManagedSocket.connect(1, extHost, '/hello', 'world=true', '', half);
                await extHost.expectEvent(evt => evt.data && evt.data.startsWith('GET ws://localhost/hello?world=true&skipWebSocketFrames=true HTTP/1.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Key:'), 'websocket open event');
                half.onData.fire(buffer_1.VSBuffer.fromString('Opened successfully ;)\r\n\r\n'));
                return ds.add(await socket);
            }
            test('connects', async () => {
                await doConnect();
            });
            test('includes trailing connection data', async () => {
                const socketProm = mainThreadManagedSockets_1.MainThreadManagedSocket.connect(1, extHost, '/hello', 'world=true', '', half);
                await extHost.expectEvent(evt => evt.data && evt.data.includes('GET ws://localhost'), 'websocket open event');
                half.onData.fire(buffer_1.VSBuffer.fromString('Opened successfully ;)\r\n\r\nSome trailing data'));
                const socket = ds.add(await socketProm);
                const data = [];
                ds.add(socket.onData(d => data.push(d.toString())));
                await (0, async_1.timeout)(1); // allow microtasks to flush
                assert.deepStrictEqual(data, ['Some trailing data']);
            });
            test('round trips data', async () => {
                const socket = await doConnect();
                const data = [];
                ds.add(socket.onData(d => data.push(d.toString())));
                socket.write(buffer_1.VSBuffer.fromString('ping'));
                await extHost.expectEvent(evt => evt.data === 'ping', 'expected ping');
                half.onData.fire(buffer_1.VSBuffer.fromString("pong"));
                assert.deepStrictEqual(data, ['pong']);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE1hbmFnZWRTb2NrZXRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9tYWluVGhyZWFkTWFuYWdlZFNvY2tldHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO1FBRXRDLE1BQU0sRUFBRSxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUVyRCxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtZQUMzQixJQUFJLE9BQW9CLENBQUM7WUFDekIsSUFBSSxJQUFzQixDQUFDO1lBRTNCLE1BQU0sV0FBWSxTQUFRLElBQUEsV0FBSSxHQUE4QjtnQkFBNUQ7O29CQUNTLGNBQVMsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO29CQUN4QixXQUFNLEdBQVUsRUFBRSxDQUFDO2dCQW1DcEMsQ0FBQztnQkFqQ1Msa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxNQUFnQjtvQkFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRVEsa0JBQWtCLENBQUMsUUFBZ0I7b0JBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN0QixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDMUIsQ0FBQztnQkFFUSxnQkFBZ0IsQ0FB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