/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc.net"], function (require, exports, buffer_1, event_1, lifecycle_1, ipc_net_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ckb = exports.$Bkb = exports.$Akb = exports.$zkb = void 0;
    const $zkb = (path, query, deubgLabel) => {
        // https://tools.ietf.org/html/rfc6455#section-4
        const buffer = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            buffer[i] = Math.round(Math.random() * 256);
        }
        const nonce = (0, buffer_1.$Zd)(buffer_1.$Fd.wrap(buffer));
        const headers = [
            `GET ws://localhost${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
            `Connection: Upgrade`,
            `Upgrade: websocket`,
            `Sec-WebSocket-Key: ${nonce}`
        ];
        return headers.join('\r\n') + '\r\n\r\n';
    };
    exports.$zkb = $zkb;
    exports.$Akb = buffer_1.$Fd.fromString('\r\n\r\n');
    /** Should be called immediately after making a ManagedSocket to make it ready for data flow. */
    async function $Bkb(socket, path, query, debugLabel, half) {
        socket.write(buffer_1.$Fd.fromString((0, exports.$zkb)(path, query, debugLabel)));
        const d = new lifecycle_1.$jc();
        try {
            return await new Promise((resolve, reject) => {
                let dataSoFar;
                d.add(socket.onData(d_1 => {
                    if (!dataSoFar) {
                        dataSoFar = d_1;
                    }
                    else {
                        dataSoFar = buffer_1.$Fd.concat([dataSoFar, d_1], dataSoFar.byteLength + d_1.byteLength);
                    }
                    const index = dataSoFar.indexOf(exports.$Akb);
                    if (index === -1) {
                        return;
                    }
                    resolve(socket);
                    // pause data events until the socket consumer is hooked up. We may
                    // immediately emit remaining data, but if not there may still be
                    // microtasks queued which would fire data into the abyss.
                    socket.pauseData();
                    const rest = dataSoFar.slice(index + exports.$Akb.byteLength);
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
    exports.$Bkb = $Bkb;
    class $Ckb extends lifecycle_1.$kc {
        constructor(g, half) {
            super();
            this.g = g;
            this.a = this.B(new event_1.$id());
            this.onData = (...args) => {
                if (this.a.isPaused) {
                    queueMicrotask(() => this.a.resume());
                }
                return this.a.event(...args);
            };
            this.b = this.B(new event_1.$fd());
            this.onDidDispose = this.b.event;
            this.f = false;
            this.B(half.onData);
            this.B(half.onData.event(data => this.a.fire(data)));
            this.onClose = this.B(half.onClose).event;
            this.onEnd = this.B(half.onEnd).event;
        }
        /** Pauses data events until a new listener comes in onData() */
        pauseData() {
            this.a.pause();
        }
        /** Flushes data to the socket. */
        drain() {
            return Promise.resolve();
        }
        /** Ends the remote socket. */
        end() {
            this.f = true;
            this.h();
        }
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this, this.g, type, data);
        }
        dispose() {
            if (!this.f) {
                this.h();
            }
            this.b.fire();
            super.dispose();
        }
    }
    exports.$Ckb = $Ckb;
});
//# sourceMappingURL=managedSocket.js.map