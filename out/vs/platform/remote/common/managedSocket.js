/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc.net"], function (require, exports, buffer_1, event_1, lifecycle_1, ipc_net_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManagedSocket = exports.connectManagedSocket = exports.socketRawEndHeaderSequence = exports.makeRawSocketHeaders = void 0;
    const makeRawSocketHeaders = (path, query, deubgLabel) => {
        // https://tools.ietf.org/html/rfc6455#section-4
        const buffer = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            buffer[i] = Math.round(Math.random() * 256);
        }
        const nonce = (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.wrap(buffer));
        const headers = [
            `GET ws://localhost${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
            `Connection: Upgrade`,
            `Upgrade: websocket`,
            `Sec-WebSocket-Key: ${nonce}`
        ];
        return headers.join('\r\n') + '\r\n\r\n';
    };
    exports.makeRawSocketHeaders = makeRawSocketHeaders;
    exports.socketRawEndHeaderSequence = buffer_1.VSBuffer.fromString('\r\n\r\n');
    /** Should be called immediately after making a ManagedSocket to make it ready for data flow. */
    async function connectManagedSocket(socket, path, query, debugLabel, half) {
        socket.write(buffer_1.VSBuffer.fromString((0, exports.makeRawSocketHeaders)(path, query, debugLabel)));
        const d = new lifecycle_1.DisposableStore();
        try {
            return await new Promise((resolve, reject) => {
                let dataSoFar;
                d.add(socket.onData(d_1 => {
                    if (!dataSoFar) {
                        dataSoFar = d_1;
                    }
                    else {
                        dataSoFar = buffer_1.VSBuffer.concat([dataSoFar, d_1], dataSoFar.byteLength + d_1.byteLength);
                    }
                    const index = dataSoFar.indexOf(exports.socketRawEndHeaderSequence);
                    if (index === -1) {
                        return;
                    }
                    resolve(socket);
                    // pause data events until the socket consumer is hooked up. We may
                    // immediately emit remaining data, but if not there may still be
                    // microtasks queued which would fire data into the abyss.
                    socket.pauseData();
                    const rest = dataSoFar.slice(index + exports.socketRawEndHeaderSequence.byteLength);
                    if (rest.byteLength) {
                        half.onData.fire(rest);
                    }
                }));
                d.add(socket.onClose(err => reject(err ?? new Error('socket closed'))));
                d.add(socket.onEnd(() => reject(new Error('socket ended'))));
            });
        }
        catch (e) {
            socket.dispose();
            throw e;
        }
        finally {
            d.dispose();
        }
    }
    exports.connectManagedSocket = connectManagedSocket;
    class ManagedSocket extends lifecycle_1.Disposable {
        constructor(debugLabel, half) {
            super();
            this.debugLabel = debugLabel;
            this.pausableDataEmitter = this._register(new event_1.PauseableEmitter());
            this.onData = (...args) => {
                if (this.pausableDataEmitter.isPaused) {
                    queueMicrotask(() => this.pausableDataEmitter.resume());
                }
                return this.pausableDataEmitter.event(...args);
            };
            this.didDisposeEmitter = this._register(new event_1.Emitter());
            this.onDidDispose = this.didDisposeEmitter.event;
            this.ended = false;
            this._register(half.onData);
            this._register(half.onData.event(data => this.pausableDataEmitter.fire(data)));
            this.onClose = this._register(half.onClose).event;
            this.onEnd = this._register(half.onEnd).event;
        }
        /** Pauses data events until a new listener comes in onData() */
        pauseData() {
            this.pausableDataEmitter.pause();
        }
        /** Flushes data to the socket. */
        drain() {
            return Promise.resolve();
        }
        /** Ends the remote socket. */
        end() {
            this.ended = true;
            this.closeRemote();
        }
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this, this.debugLabel, type, data);
        }
        dispose() {
            if (!this.ended) {
                this.closeRemote();
            }
            this.didDisposeEmitter.fire();
            super.dispose();
        }
    }
    exports.ManagedSocket = ManagedSocket;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlZFNvY2tldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlbW90ZS9jb21tb24vbWFuYWdlZFNvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPekYsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsVUFBa0IsRUFBRSxFQUFFO1FBQ3ZGLGdEQUFnRDtRQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztTQUM1QztRQUNELE1BQU0sS0FBSyxHQUFHLElBQUEscUJBQVksRUFBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRWxELE1BQU0sT0FBTyxHQUFHO1lBQ2YscUJBQXFCLElBQUksSUFBSSxLQUFLLG9DQUFvQztZQUN0RSxxQkFBcUI7WUFDckIsb0JBQW9CO1lBQ3BCLHNCQUFzQixLQUFLLEVBQUU7U0FDN0IsQ0FBQztRQUVGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDMUMsQ0FBQyxDQUFDO0lBaEJXLFFBQUEsb0JBQW9CLHdCQWdCL0I7SUFFVyxRQUFBLDBCQUEwQixHQUFHLGlCQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBUTFFLGdHQUFnRztJQUN6RixLQUFLLFVBQVUsb0JBQW9CLENBQ3pDLE1BQVMsRUFDVCxJQUFZLEVBQUUsS0FBYSxFQUFFLFVB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