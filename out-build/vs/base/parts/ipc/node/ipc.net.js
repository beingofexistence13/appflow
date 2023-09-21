/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto", "net", "os", "zlib", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.net"], function (require, exports, crypto_1, net_1, os_1, zlib_1, buffer_1, errors_1, event_1, lifecycle_1, path_1, platform_1, uuid_1, ipc_1, ipc_net_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xh = exports.$wh = exports.$vh = exports.$uh = exports.$th = exports.$sh = exports.$rh = exports.$qh = void 0;
    class $qh {
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
        }
        constructor(socket, debugLabel = '') {
            this.f = true;
            this.debugLabel = debugLabel;
            this.socket = socket;
            this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'NodeSocket' });
            this.a = (err) => {
                this.traceSocketEvent("error" /* SocketDiagnosticsEventType.Error */, { code: err?.code, message: err?.message });
                if (err) {
                    if (err.code === 'EPIPE') {
                        // An EPIPE exception at the wrong time can lead to a renderer process crash
                        // so ignore the error since the socket will fire the close event soon anyways:
                        // > https://nodejs.org/api/errors.html#errors_common_system_errors
                        // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                        // > process to read the data. Commonly encountered at the net and http layers,
                        // > indicative that the remote side of the stream being written to has been closed.
                        return;
                    }
                    (0, errors_1.$Y)(err);
                }
            };
            this.socket.on('error', this.a);
            this.b = (hadError) => {
                this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */, { hadError });
                this.f = false;
            };
            this.socket.on('close', this.b);
            this.d = () => {
                this.traceSocketEvent("nodeEndReceived" /* SocketDiagnosticsEventType.NodeEndReceived */);
                this.f = false;
            };
            this.socket.on('end', this.d);
        }
        dispose() {
            this.socket.off('error', this.a);
            this.socket.off('close', this.b);
            this.socket.off('end', this.d);
            this.socket.destroy();
        }
        onData(_listener) {
            const listener = (buff) => {
                this.traceSocketEvent("read" /* SocketDiagnosticsEventType.Read */, buff);
                _listener(buffer_1.$Fd.wrap(buff));
            };
            this.socket.on('data', listener);
            return {
                dispose: () => this.socket.off('data', listener)
            };
        }
        onClose(listener) {
            const adapter = (hadError) => {
                listener({
                    type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                    hadError: hadError,
                    error: undefined
                });
            };
            this.socket.on('close', adapter);
            return {
                dispose: () => this.socket.off('close', adapter)
            };
        }
        onEnd(listener) {
            const adapter = () => {
                listener();
            };
            this.socket.on('end', adapter);
            return {
                dispose: () => this.socket.off('end', adapter)
            };
        }
        write(buffer) {
            // return early if socket has been destroyed in the meantime
            if (this.socket.destroyed || !this.f) {
                return;
            }
            // we ignore the returned value from `write` because we would have to cached the data
            // anyways and nodejs is already doing that for us:
            // > https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
            // > However, the false return value is only advisory and the writable stream will unconditionally
            // > accept and buffer chunk even if it has not been allowed to drain.
            try {
                this.traceSocketEvent("write" /* SocketDiagnosticsEventType.Write */, buffer);
                this.socket.write(buffer.buffer, (err) => {
                    if (err) {
                        if (err.code === 'EPIPE') {
                            // An EPIPE exception at the wrong time can lead to a renderer process crash
                            // so ignore the error since the socket will fire the close event soon anyways:
                            // > https://nodejs.org/api/errors.html#errors_common_system_errors
                            // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                            // > process to read the data. Commonly encountered at the net and http layers,
                            // > indicative that the remote side of the stream being written to has been closed.
                            return;
                        }
                        (0, errors_1.$Y)(err);
                    }
                });
            }
            catch (err) {
                if (err.code === 'EPIPE') {
                    // An EPIPE exception at the wrong time can lead to a renderer process crash
                    // so ignore the error since the socket will fire the close event soon anyways:
                    // > https://nodejs.org/api/errors.html#errors_common_system_errors
                    // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                    // > process to read the data. Commonly encountered at the net and http layers,
                    // > indicative that the remote side of the stream being written to has been closed.
                    return;
                }
                (0, errors_1.$Y)(err);
            }
        }
        end() {
            this.traceSocketEvent("nodeEndSent" /* SocketDiagnosticsEventType.NodeEndSent */);
            this.socket.end();
        }
        drain() {
            this.traceSocketEvent("nodeDrainBegin" /* SocketDiagnosticsEventType.NodeDrainBegin */);
            return new Promise((resolve, reject) => {
                if (this.socket.bufferSize === 0) {
                    this.traceSocketEvent("nodeDrainEnd" /* SocketDiagnosticsEventType.NodeDrainEnd */);
                    resolve();
                    return;
                }
                const finished = () => {
                    this.socket.off('close', finished);
                    this.socket.off('end', finished);
                    this.socket.off('error', finished);
                    this.socket.off('timeout', finished);
                    this.socket.off('drain', finished);
                    this.traceSocketEvent("nodeDrainEnd" /* SocketDiagnosticsEventType.NodeDrainEnd */);
                    resolve();
                };
                this.socket.on('close', finished);
                this.socket.on('end', finished);
                this.socket.on('error', finished);
                this.socket.on('timeout', finished);
                this.socket.on('drain', finished);
            });
        }
    }
    exports.$qh = $qh;
    var Constants;
    (function (Constants) {
        Constants[Constants["MinHeaderByteSize"] = 2] = "MinHeaderByteSize";
        /**
         * If we need to write a large buffer, we will split it into 256KB chunks and
         * send each chunk as a websocket message. This is to prevent that the sending
         * side is stuck waiting for the entire buffer to be compressed before writing
         * to the underlying socket or that the receiving side is stuck waiting for the
         * entire message to be received before processing the bytes.
         */
        Constants[Constants["MaxWebSocketMessageLength"] = 262144] = "MaxWebSocketMessageLength"; // 256 KB
    })(Constants || (Constants = {}));
    var ReadState;
    (function (ReadState) {
        ReadState[ReadState["PeekHeader"] = 1] = "PeekHeader";
        ReadState[ReadState["ReadHeader"] = 2] = "ReadHeader";
        ReadState[ReadState["ReadBody"] = 3] = "ReadBody";
        ReadState[ReadState["Fin"] = 4] = "Fin";
    })(ReadState || (ReadState = {}));
    /**
     * See https://tools.ietf.org/html/rfc6455#section-5.2
     */
    class $rh extends lifecycle_1.$kc {
        get permessageDeflate() {
            return this.a.permessageDeflate;
        }
        get recordedInflateBytes() {
            return this.a.recordedInflateBytes;
        }
        traceSocketEvent(type, data) {
            this.socket.traceSocketEvent(type, data);
        }
        /**
         * Create a socket which can communicate using WebSocket frames.
         *
         * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
         *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
         *  might hit an inflated portion referencing a distance too far back.
         *
         * @param socket The underlying socket
         * @param permessageDeflate Use the permessage-deflate WebSocket extension
         * @param inflateBytes "Seed" zlib inflate with these bytes.
         * @param recordInflateBytes Record all bytes sent to inflate
         */
        constructor(socket, permessageDeflate, inflateBytes, recordInflateBytes) {
            super();
            this.f = this.B(new event_1.$fd());
            this.g = this.B(new event_1.$fd());
            this.h = false;
            this.j = {
                state: 1 /* ReadState.PeekHeader */,
                readLen: 2 /* Constants.MinHeaderByteSize */,
                fin: 0,
                compressed: false,
                firstFrameOfMessage: true,
                mask: 0
            };
            this.socket = socket;
            this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'WebSocketNodeSocket', permessageDeflate, inflateBytesLength: inflateBytes?.byteLength || 0, recordInflateBytes });
            this.a = this.B(new WebSocketFlowManager(this, permessageDeflate, inflateBytes, recordInflateBytes, this.f, (data, compressed) => this.m(data, compressed)));
            this.B(this.a.onError((err) => {
                // zlib errors are fatal, since we have no idea how to recover
                console.error(err);
                (0, errors_1.$Y)(err);
                this.g.fire({
                    type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                    hadError: true,
                    error: err
                });
            }));
            this.b = new ipc_net_1.$lh();
            this.B(this.socket.onData(data => this.n(data)));
            this.B(this.socket.onClose(async (e) => {
                // Delay surfacing the close event until the async inflating is done
                // and all data has been emitted
                if (this.a.isProcessingReadQueue()) {
                    await event_1.Event.toPromise(this.a.onDidFinishProcessingReadQueue);
                }
                this.g.fire(e);
            }));
        }
        dispose() {
            if (this.a.isProcessingWriteQueue()) {
                // Wait for any outstanding writes to finish before disposing
                this.B(this.a.onDidFinishProcessingWriteQueue(() => {
                    this.dispose();
                }));
            }
            else {
                this.socket.dispose();
                super.dispose();
            }
        }
        onData(listener) {
            return this.f.event(listener);
        }
        onClose(listener) {
            return this.g.event(listener);
        }
        onEnd(listener) {
            return this.socket.onEnd(listener);
        }
        write(buffer) {
            // If we write many logical messages (let's say 1000 messages of 100KB) during a single process tick, we do
            // this thing where we install a process.nextTick timer and group all of them together and we then issue a
            // single WebSocketNodeSocket.write with a 100MB buffer.
            //
            // The first problem is that the actual writing to the underlying node socket will only happen after all of
            // the 100MB have been deflated (due to waiting on zlib flush). The second problem is on the reading side,
            // where we will get a single WebSocketNodeSocket.onData event fired when all the 100MB have arrived,
            // delaying processing the 1000 received messages until all have arrived, instead of processing them as each
            // one arrives.
            //
            // We therefore split the buffer into chunks, and issue a write for each chunk.
            let start = 0;
            while (start < buffer.byteLength) {
                this.a.writeMessage(buffer.slice(start, Math.min(start + 262144 /* Constants.MaxWebSocketMessageLength */, buffer.byteLength)));
                start += 262144 /* Constants.MaxWebSocketMessageLength */;
            }
        }
        m(buffer, compressed) {
            if (this.h) {
                // Avoid ERR_STREAM_WRITE_AFTER_END
                return;
            }
            this.traceSocketEvent("webSocketNodeSocketWrite" /* SocketDiagnosticsEventType.WebSocketNodeSocketWrite */, buffer);
            let headerLen = 2 /* Constants.MinHeaderByteSize */;
            if (buffer.byteLength < 126) {
                headerLen += 0;
            }
            else if (buffer.byteLength < 2 ** 16) {
                headerLen += 2;
            }
            else {
                headerLen += 8;
            }
            const header = buffer_1.$Fd.alloc(headerLen);
            if (compressed) {
                // The RSV1 bit indicates a compressed frame
                header.writeUInt8(0b11000010, 0);
            }
            else {
                header.writeUInt8(0b10000010, 0);
            }
            if (buffer.byteLength < 126) {
                header.writeUInt8(buffer.byteLength, 1);
            }
            else if (buffer.byteLength < 2 ** 16) {
                header.writeUInt8(126, 1);
                let offset = 1;
                header.writeUInt8((buffer.byteLength >>> 8) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 0) & 0b11111111, ++offset);
            }
            else {
                header.writeUInt8(127, 1);
                let offset = 1;
                header.writeUInt8(0, ++offset);
                header.writeUInt8(0, ++offset);
                header.writeUInt8(0, ++offset);
                header.writeUInt8(0, ++offset);
                header.writeUInt8((buffer.byteLength >>> 24) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 16) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 8) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 0) & 0b11111111, ++offset);
            }
            this.socket.write(buffer_1.$Fd.concat([header, buffer]));
        }
        end() {
            this.h = true;
            this.socket.end();
        }
        n(data) {
            if (data.byteLength === 0) {
                return;
            }
            this.b.acceptChunk(data);
            while (this.b.byteLength >= this.j.readLen) {
                if (this.j.state === 1 /* ReadState.PeekHeader */) {
                    // peek to see if we can read the entire header
                    const peekHeader = this.b.peek(this.j.readLen);
                    const firstByte = peekHeader.readUInt8(0);
                    const finBit = (firstByte & 0b10000000) >>> 7;
                    const rsv1Bit = (firstByte & 0b01000000) >>> 6;
                    const secondByte = peekHeader.readUInt8(1);
                    const hasMask = (secondByte & 0b10000000) >>> 7;
                    const len = (secondByte & 0b01111111);
                    this.j.state = 2 /* ReadState.ReadHeader */;
                    this.j.readLen = 2 /* Constants.MinHeaderByteSize */ + (hasMask ? 4 : 0) + (len === 126 ? 2 : 0) + (len === 127 ? 8 : 0);
                    this.j.fin = finBit;
                    if (this.j.firstFrameOfMessage) {
                        // if the frame is compressed, the RSV1 bit is set only for the first frame of the message
                        this.j.compressed = Boolean(rsv1Bit);
                    }
                    this.j.firstFrameOfMessage = Boolean(finBit);
                    this.j.mask = 0;
                    this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader */, { headerSize: this.j.readLen, compressed: this.j.compressed, fin: this.j.fin });
                }
                else if (this.j.state === 2 /* ReadState.ReadHeader */) {
                    // read entire header
                    const header = this.b.read(this.j.readLen);
                    const secondByte = header.readUInt8(1);
                    const hasMask = (secondByte & 0b10000000) >>> 7;
                    let len = (secondByte & 0b01111111);
                    let offset = 1;
                    if (len === 126) {
                        len = (header.readUInt8(++offset) * 2 ** 8
                            + header.readUInt8(++offset));
                    }
                    else if (len === 127) {
                        len = (header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 2 ** 24
                            + header.readUInt8(++offset) * 2 ** 16
                            + header.readUInt8(++offset) * 2 ** 8
                            + header.readUInt8(++offset));
                    }
                    let mask = 0;
                    if (hasMask) {
                        mask = (header.readUInt8(++offset) * 2 ** 24
                            + header.readUInt8(++offset) * 2 ** 16
                            + header.readUInt8(++offset) * 2 ** 8
                            + header.readUInt8(++offset));
                    }
                    this.j.state = 3 /* ReadState.ReadBody */;
                    this.j.readLen = len;
                    this.j.mask = mask;
                    this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader */, { bodySize: this.j.readLen, compressed: this.j.compressed, fin: this.j.fin, mask: this.j.mask });
                }
                else if (this.j.state === 3 /* ReadState.ReadBody */) {
                    // read body
                    const body = this.b.read(this.j.readLen);
                    this.traceSocketEvent("webSocketNodeSocketReadData" /* SocketDiagnosticsEventType.WebSocketNodeSocketReadData */, body);
                    unmask(body, this.j.mask);
                    this.traceSocketEvent("webSocketNodeSocketUnmaskedData" /* SocketDiagnosticsEventType.WebSocketNodeSocketUnmaskedData */, body);
                    this.j.state = 1 /* ReadState.PeekHeader */;
                    this.j.readLen = 2 /* Constants.MinHeaderByteSize */;
                    this.j.mask = 0;
                    this.a.acceptFrame(body, this.j.compressed, !!this.j.fin);
                }
            }
        }
        async drain() {
            this.traceSocketEvent("webSocketNodeSocketDrainBegin" /* SocketDiagnosticsEventType.WebSocketNodeSocketDrainBegin */);
            if (this.a.isProcessingWriteQueue()) {
                await event_1.Event.toPromise(this.a.onDidFinishProcessingWriteQueue);
            }
            await this.socket.drain();
            this.traceSocketEvent("webSocketNodeSocketDrainEnd" /* SocketDiagnosticsEventType.WebSocketNodeSocketDrainEnd */);
        }
    }
    exports.$rh = $rh;
    class WebSocketFlowManager extends lifecycle_1.$kc {
        get permessageDeflate() {
            return Boolean(this.b && this.f);
        }
        get recordedInflateBytes() {
            if (this.b) {
                return this.b.recordedInflateBytes;
            }
            return buffer_1.$Fd.alloc(0);
        }
        constructor(n, permessageDeflate, inflateBytes, recordInflateBytes, r, s) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.a = this.B(new event_1.$fd());
            this.onError = this.a.event;
            this.g = [];
            this.h = [];
            this.j = this.B(new event_1.$fd());
            this.onDidFinishProcessingReadQueue = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidFinishProcessingWriteQueue = this.m.event;
            this.t = false;
            this.y = false;
            if (permessageDeflate) {
                // See https://tools.ietf.org/html/rfc7692#page-16
                // To simplify our logic, we don't negotiate the window size
                // and simply dedicate (2^15) / 32kb per web socket
                this.b = this.B(new ZlibInflateStream(this.n, recordInflateBytes, inflateBytes, { windowBits: 15 }));
                this.f = this.B(new ZlibDeflateStream(this.n, { windowBits: 15 }));
                this.B(this.b.onError((err) => this.a.fire(err)));
                this.B(this.f.onError((err) => this.a.fire(err)));
            }
            else {
                this.b = null;
                this.f = null;
            }
        }
        writeMessage(message) {
            this.g.push(message);
            this.u();
        }
        async u() {
            if (this.t) {
                return;
            }
            this.t = true;
            while (this.g.length > 0) {
                const message = this.g.shift();
                if (this.f) {
                    const data = await this.w(this.f, message);
                    this.s(data, true);
                }
                else {
                    this.s(message, false);
                }
            }
            this.t = false;
            this.m.fire();
        }
        isProcessingWriteQueue() {
            return (this.t);
        }
        /**
         * Subsequent calls should wait for the previous `_deflateBuffer` call to complete.
         */
        w(zlibDeflateStream, buffer) {
            return new Promise((resolve, reject) => {
                zlibDeflateStream.write(buffer);
                zlibDeflateStream.flush(data => resolve(data));
            });
        }
        acceptFrame(data, isCompressed, isLastFrameOfMessage) {
            this.h.push({ data, isCompressed, isLastFrameOfMessage });
            this.z();
        }
        async z() {
            if (this.y) {
                return;
            }
            this.y = true;
            while (this.h.length > 0) {
                const frameInfo = this.h.shift();
                if (this.b && frameInfo.isCompressed) {
                    // See https://datatracker.ietf.org/doc/html/rfc7692#section-9.2
                    // Even if permessageDeflate is negotiated, it is possible
                    // that the other side might decide to send uncompressed messages
                    // So only decompress messages that have the RSV 1 bit set
                    const data = await this.C(this.b, frameInfo.data, frameInfo.isLastFrameOfMessage);
                    this.r.fire(data);
                }
                else {
                    this.r.fire(frameInfo.data);
                }
            }
            this.y = false;
            this.j.fire();
        }
        isProcessingReadQueue() {
            return (this.y);
        }
        /**
         * Subsequent calls should wait for the previous `transformRead` call to complete.
         */
        C(zlibInflateStream, buffer, isLastFrameOfMessage) {
            return new Promise((resolve, reject) => {
                // See https://tools.ietf.org/html/rfc7692#section-7.2.2
                zlibInflateStream.write(buffer);
                if (isLastFrameOfMessage) {
                    zlibInflateStream.write(buffer_1.$Fd.fromByteArray([0x00, 0x00, 0xff, 0xff]));
                }
                zlibInflateStream.flush(data => resolve(data));
            });
        }
    }
    class ZlibInflateStream extends lifecycle_1.$kc {
        get recordedInflateBytes() {
            if (this.j) {
                return buffer_1.$Fd.concat(this.f);
            }
            return buffer_1.$Fd.alloc(0);
        }
        constructor(h, j, inflateBytes, options) {
            super();
            this.h = h;
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.onError = this.a.event;
            this.f = [];
            this.g = [];
            this.b = (0, zlib_1.createInflateRaw)(options);
            this.b.on('error', (err) => {
                this.h.traceSocketEvent("zlibInflateError" /* SocketDiagnosticsEventType.zlibInflateError */, { message: err?.message, code: err?.code });
                this.a.fire(err);
            });
            this.b.on('data', (data) => {
                this.h.traceSocketEvent("zlibInflateData" /* SocketDiagnosticsEventType.zlibInflateData */, data);
                this.g.push(buffer_1.$Fd.wrap(data));
            });
            if (inflateBytes) {
                this.h.traceSocketEvent("zlibInflateInitialWrite" /* SocketDiagnosticsEventType.zlibInflateInitialWrite */, inflateBytes.buffer);
                this.b.write(inflateBytes.buffer);
                this.b.flush(() => {
                    this.h.traceSocketEvent("zlibInflateInitialFlushFired" /* SocketDiagnosticsEventType.zlibInflateInitialFlushFired */);
                    this.g.length = 0;
                });
            }
        }
        write(buffer) {
            if (this.j) {
                this.f.push(buffer.clone());
            }
            this.h.traceSocketEvent("zlibInflateWrite" /* SocketDiagnosticsEventType.zlibInflateWrite */, buffer);
            this.b.write(buffer.buffer);
        }
        flush(callback) {
            this.b.flush(() => {
                this.h.traceSocketEvent("zlibInflateFlushFired" /* SocketDiagnosticsEventType.zlibInflateFlushFired */);
                const data = buffer_1.$Fd.concat(this.g);
                this.g.length = 0;
                callback(data);
            });
        }
    }
    class ZlibDeflateStream extends lifecycle_1.$kc {
        constructor(g, options) {
            super();
            this.g = g;
            this.a = this.B(new event_1.$fd());
            this.onError = this.a.event;
            this.f = [];
            this.b = (0, zlib_1.createDeflateRaw)({
                windowBits: 15
            });
            this.b.on('error', (err) => {
                this.g.traceSocketEvent("zlibDeflateError" /* SocketDiagnosticsEventType.zlibDeflateError */, { message: err?.message, code: err?.code });
                this.a.fire(err);
            });
            this.b.on('data', (data) => {
                this.g.traceSocketEvent("zlibDeflateData" /* SocketDiagnosticsEventType.zlibDeflateData */, data);
                this.f.push(buffer_1.$Fd.wrap(data));
            });
        }
        write(buffer) {
            this.g.traceSocketEvent("zlibDeflateWrite" /* SocketDiagnosticsEventType.zlibDeflateWrite */, buffer.buffer);
            this.b.write(buffer.buffer);
        }
        flush(callback) {
            // See https://zlib.net/manual.html#Constants
            this.b.flush(/*Z_SYNC_FLUSH*/ 2, () => {
                this.g.traceSocketEvent("zlibDeflateFlushFired" /* SocketDiagnosticsEventType.zlibDeflateFlushFired */);
                let data = buffer_1.$Fd.concat(this.f);
                this.f.length = 0;
                // See https://tools.ietf.org/html/rfc7692#section-7.2.1
                data = data.slice(0, data.byteLength - 4);
                callback(data);
            });
        }
    }
    function unmask(buffer, mask) {
        if (mask === 0) {
            return;
        }
        const cnt = buffer.byteLength >>> 2;
        for (let i = 0; i < cnt; i++) {
            const v = buffer.readUInt32BE(i * 4);
            buffer.writeUInt32BE(v ^ mask, i * 4);
        }
        const offset = cnt * 4;
        const bytesLeft = buffer.byteLength - offset;
        const m3 = (mask >>> 24) & 0b11111111;
        const m2 = (mask >>> 16) & 0b11111111;
        const m1 = (mask >>> 8) & 0b11111111;
        if (bytesLeft >= 1) {
            buffer.writeUInt8(buffer.readUInt8(offset) ^ m3, offset);
        }
        if (bytesLeft >= 2) {
            buffer.writeUInt8(buffer.readUInt8(offset + 1) ^ m2, offset + 1);
        }
        if (bytesLeft >= 3) {
            buffer.writeUInt8(buffer.readUInt8(offset + 2) ^ m1, offset + 2);
        }
    }
    // Read this before there's any chance it is overwritten
    // Related to https://github.com/microsoft/vscode/issues/30624
    exports.$sh = process.env['XDG_RUNTIME_DIR'];
    const safeIpcPathLengths = {
        [2 /* Platform.Linux */]: 107,
        [1 /* Platform.Mac */]: 103
    };
    function $th() {
        const randomSuffix = (0, uuid_1.$4f)();
        // Windows: use named pipe
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\vscode-ipc-${randomSuffix}-sock`;
        }
        // Mac & Unix: Use socket file
        // Unix: Prefer XDG_RUNTIME_DIR over user data path
        const basePath = process.platform !== 'darwin' && exports.$sh ? exports.$sh : (0, os_1.tmpdir)();
        const result = (0, path_1.$9d)(basePath, `vscode-ipc-${randomSuffix}.sock`);
        // Validate length
        validateIPCHandleLength(result);
        return result;
    }
    exports.$th = $th;
    function $uh(directoryPath, type, version) {
        const scope = (0, crypto_1.createHash)('md5').update(directoryPath).digest('hex');
        // Windows: use named pipe
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\${scope}-${version}-${type}-sock`;
        }
        // Mac & Unix: Use socket file
        // Unix: Prefer XDG_RUNTIME_DIR over user data path, unless portable
        // Trim the version and type values for the socket to prevent too large
        // file names causing issues: https://unix.stackexchange.com/q/367008
        const versionForSocket = version.substr(0, 4);
        const typeForSocket = type.substr(0, 6);
        const scopeForSocket = scope.substr(0, 8);
        let result;
        if (process.platform !== 'darwin' && exports.$sh && !process.env['VSCODE_PORTABLE']) {
            result = (0, path_1.$9d)(exports.$sh, `vscode-${scopeForSocket}-${versionForSocket}-${typeForSocket}.sock`);
        }
        else {
            result = (0, path_1.$9d)(directoryPath, `${versionForSocket}-${typeForSocket}.sock`);
        }
        // Validate length
        validateIPCHandleLength(result);
        return result;
    }
    exports.$uh = $uh;
    function validateIPCHandleLength(handle) {
        const limit = safeIpcPathLengths[platform_1.$t];
        if (typeof limit === 'number' && handle.length >= limit) {
            // https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections
            console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
        }
    }
    class $vh extends ipc_1.$fh {
        static b(server) {
            const onConnection = event_1.Event.fromNodeEventEmitter(server, 'connection');
            return event_1.Event.map(onConnection, socket => ({
                protocol: new ipc_net_1.$mh(new $qh(socket, 'ipc-server-connection')),
                onDidClientDisconnect: event_1.Event.once(event_1.Event.fromNodeEventEmitter(socket, 'close'))
            }));
        }
        constructor(server) {
            super($vh.b(server));
            this.d = server;
        }
        dispose() {
            super.dispose();
            if (this.d) {
                this.d.close();
                this.d = null;
            }
        }
    }
    exports.$vh = $vh;
    function $wh(hook) {
        return new Promise((c, e) => {
            const server = (0, net_1.createServer)();
            server.on('error', e);
            server.listen(hook, () => {
                server.removeListener('error', e);
                c(new $vh(server));
            });
        });
    }
    exports.$wh = $wh;
    function $xh(hook, clientId) {
        return new Promise((c, e) => {
            const socket = (0, net_1.createConnection)(hook, () => {
                socket.removeListener('error', e);
                c(ipc_net_1.$nh.fromSocket(new $qh(socket, `ipc-client${clientId}`), clientId));
            });
            socket.once('error', e);
        });
    }
    exports.$xh = $xh;
});
//# sourceMappingURL=ipc.net.js.map