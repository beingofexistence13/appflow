/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto", "net", "os", "zlib", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.net"], function (require, exports, crypto_1, net_1, os_1, zlib_1, buffer_1, errors_1, event_1, lifecycle_1, path_1, platform_1, uuid_1, ipc_1, ipc_net_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connect = exports.serve = exports.Server = exports.createStaticIPCHandle = exports.createRandomIPCHandle = exports.XDG_RUNTIME_DIR = exports.WebSocketNodeSocket = exports.NodeSocket = void 0;
    class NodeSocket {
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
        }
        constructor(socket, debugLabel = '') {
            this._canWrite = true;
            this.debugLabel = debugLabel;
            this.socket = socket;
            this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'NodeSocket' });
            this._errorListener = (err) => {
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
                    (0, errors_1.onUnexpectedError)(err);
                }
            };
            this.socket.on('error', this._errorListener);
            this._closeListener = (hadError) => {
                this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */, { hadError });
                this._canWrite = false;
            };
            this.socket.on('close', this._closeListener);
            this._endListener = () => {
                this.traceSocketEvent("nodeEndReceived" /* SocketDiagnosticsEventType.NodeEndReceived */);
                this._canWrite = false;
            };
            this.socket.on('end', this._endListener);
        }
        dispose() {
            this.socket.off('error', this._errorListener);
            this.socket.off('close', this._closeListener);
            this.socket.off('end', this._endListener);
            this.socket.destroy();
        }
        onData(_listener) {
            const listener = (buff) => {
                this.traceSocketEvent("read" /* SocketDiagnosticsEventType.Read */, buff);
                _listener(buffer_1.VSBuffer.wrap(buff));
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
            if (this.socket.destroyed || !this._canWrite) {
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
                        (0, errors_1.onUnexpectedError)(err);
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
                (0, errors_1.onUnexpectedError)(err);
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
    exports.NodeSocket = NodeSocket;
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
    class WebSocketNodeSocket extends lifecycle_1.Disposable {
        get permessageDeflate() {
            return this._flowManager.permessageDeflate;
        }
        get recordedInflateBytes() {
            return this._flowManager.recordedInflateBytes;
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
            this._onData = this._register(new event_1.Emitter());
            this._onClose = this._register(new event_1.Emitter());
            this._isEnded = false;
            this._state = {
                state: 1 /* ReadState.PeekHeader */,
                readLen: 2 /* Constants.MinHeaderByteSize */,
                fin: 0,
                compressed: false,
                firstFrameOfMessage: true,
                mask: 0
            };
            this.socket = socket;
            this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'WebSocketNodeSocket', permessageDeflate, inflateBytesLength: inflateBytes?.byteLength || 0, recordInflateBytes });
            this._flowManager = this._register(new WebSocketFlowManager(this, permessageDeflate, inflateBytes, recordInflateBytes, this._onData, (data, compressed) => this._write(data, compressed)));
            this._register(this._flowManager.onError((err) => {
                // zlib errors are fatal, since we have no idea how to recover
                console.error(err);
                (0, errors_1.onUnexpectedError)(err);
                this._onClose.fire({
                    type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                    hadError: true,
                    error: err
                });
            }));
            this._incomingData = new ipc_net_1.ChunkStream();
            this._register(this.socket.onData(data => this._acceptChunk(data)));
            this._register(this.socket.onClose(async (e) => {
                // Delay surfacing the close event until the async inflating is done
                // and all data has been emitted
                if (this._flowManager.isProcessingReadQueue()) {
                    await event_1.Event.toPromise(this._flowManager.onDidFinishProcessingReadQueue);
                }
                this._onClose.fire(e);
            }));
        }
        dispose() {
            if (this._flowManager.isProcessingWriteQueue()) {
                // Wait for any outstanding writes to finish before disposing
                this._register(this._flowManager.onDidFinishProcessingWriteQueue(() => {
                    this.dispose();
                }));
            }
            else {
                this.socket.dispose();
                super.dispose();
            }
        }
        onData(listener) {
            return this._onData.event(listener);
        }
        onClose(listener) {
            return this._onClose.event(listener);
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
                this._flowManager.writeMessage(buffer.slice(start, Math.min(start + 262144 /* Constants.MaxWebSocketMessageLength */, buffer.byteLength)));
                start += 262144 /* Constants.MaxWebSocketMessageLength */;
            }
        }
        _write(buffer, compressed) {
            if (this._isEnded) {
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
            const header = buffer_1.VSBuffer.alloc(headerLen);
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
            this.socket.write(buffer_1.VSBuffer.concat([header, buffer]));
        }
        end() {
            this._isEnded = true;
            this.socket.end();
        }
        _acceptChunk(data) {
            if (data.byteLength === 0) {
                return;
            }
            this._incomingData.acceptChunk(data);
            while (this._incomingData.byteLength >= this._state.readLen) {
                if (this._state.state === 1 /* ReadState.PeekHeader */) {
                    // peek to see if we can read the entire header
                    const peekHeader = this._incomingData.peek(this._state.readLen);
                    const firstByte = peekHeader.readUInt8(0);
                    const finBit = (firstByte & 0b10000000) >>> 7;
                    const rsv1Bit = (firstByte & 0b01000000) >>> 6;
                    const secondByte = peekHeader.readUInt8(1);
                    const hasMask = (secondByte & 0b10000000) >>> 7;
                    const len = (secondByte & 0b01111111);
                    this._state.state = 2 /* ReadState.ReadHeader */;
                    this._state.readLen = 2 /* Constants.MinHeaderByteSize */ + (hasMask ? 4 : 0) + (len === 126 ? 2 : 0) + (len === 127 ? 8 : 0);
                    this._state.fin = finBit;
                    if (this._state.firstFrameOfMessage) {
                        // if the frame is compressed, the RSV1 bit is set only for the first frame of the message
                        this._state.compressed = Boolean(rsv1Bit);
                    }
                    this._state.firstFrameOfMessage = Boolean(finBit);
                    this._state.mask = 0;
                    this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader */, { headerSize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin });
                }
                else if (this._state.state === 2 /* ReadState.ReadHeader */) {
                    // read entire header
                    const header = this._incomingData.read(this._state.readLen);
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
                    this._state.state = 3 /* ReadState.ReadBody */;
                    this._state.readLen = len;
                    this._state.mask = mask;
                    this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader */, { bodySize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin, mask: this._state.mask });
                }
                else if (this._state.state === 3 /* ReadState.ReadBody */) {
                    // read body
                    const body = this._incomingData.read(this._state.readLen);
                    this.traceSocketEvent("webSocketNodeSocketReadData" /* SocketDiagnosticsEventType.WebSocketNodeSocketReadData */, body);
                    unmask(body, this._state.mask);
                    this.traceSocketEvent("webSocketNodeSocketUnmaskedData" /* SocketDiagnosticsEventType.WebSocketNodeSocketUnmaskedData */, body);
                    this._state.state = 1 /* ReadState.PeekHeader */;
                    this._state.readLen = 2 /* Constants.MinHeaderByteSize */;
                    this._state.mask = 0;
                    this._flowManager.acceptFrame(body, this._state.compressed, !!this._state.fin);
                }
            }
        }
        async drain() {
            this.traceSocketEvent("webSocketNodeSocketDrainBegin" /* SocketDiagnosticsEventType.WebSocketNodeSocketDrainBegin */);
            if (this._flowManager.isProcessingWriteQueue()) {
                await event_1.Event.toPromise(this._flowManager.onDidFinishProcessingWriteQueue);
            }
            await this.socket.drain();
            this.traceSocketEvent("webSocketNodeSocketDrainEnd" /* SocketDiagnosticsEventType.WebSocketNodeSocketDrainEnd */);
        }
    }
    exports.WebSocketNodeSocket = WebSocketNodeSocket;
    class WebSocketFlowManager extends lifecycle_1.Disposable {
        get permessageDeflate() {
            return Boolean(this._zlibInflateStream && this._zlibDeflateStream);
        }
        get recordedInflateBytes() {
            if (this._zlibInflateStream) {
                return this._zlibInflateStream.recordedInflateBytes;
            }
            return buffer_1.VSBuffer.alloc(0);
        }
        constructor(_tracer, permessageDeflate, inflateBytes, recordInflateBytes, _onData, _writeFn) {
            super();
            this._tracer = _tracer;
            this._onData = _onData;
            this._writeFn = _writeFn;
            this._onError = this._register(new event_1.Emitter());
            this.onError = this._onError.event;
            this._writeQueue = [];
            this._readQueue = [];
            this._onDidFinishProcessingReadQueue = this._register(new event_1.Emitter());
            this.onDidFinishProcessingReadQueue = this._onDidFinishProcessingReadQueue.event;
            this._onDidFinishProcessingWriteQueue = this._register(new event_1.Emitter());
            this.onDidFinishProcessingWriteQueue = this._onDidFinishProcessingWriteQueue.event;
            this._isProcessingWriteQueue = false;
            this._isProcessingReadQueue = false;
            if (permessageDeflate) {
                // See https://tools.ietf.org/html/rfc7692#page-16
                // To simplify our logic, we don't negotiate the window size
                // and simply dedicate (2^15) / 32kb per web socket
                this._zlibInflateStream = this._register(new ZlibInflateStream(this._tracer, recordInflateBytes, inflateBytes, { windowBits: 15 }));
                this._zlibDeflateStream = this._register(new ZlibDeflateStream(this._tracer, { windowBits: 15 }));
                this._register(this._zlibInflateStream.onError((err) => this._onError.fire(err)));
                this._register(this._zlibDeflateStream.onError((err) => this._onError.fire(err)));
            }
            else {
                this._zlibInflateStream = null;
                this._zlibDeflateStream = null;
            }
        }
        writeMessage(message) {
            this._writeQueue.push(message);
            this._processWriteQueue();
        }
        async _processWriteQueue() {
            if (this._isProcessingWriteQueue) {
                return;
            }
            this._isProcessingWriteQueue = true;
            while (this._writeQueue.length > 0) {
                const message = this._writeQueue.shift();
                if (this._zlibDeflateStream) {
                    const data = await this._deflateMessage(this._zlibDeflateStream, message);
                    this._writeFn(data, true);
                }
                else {
                    this._writeFn(message, false);
                }
            }
            this._isProcessingWriteQueue = false;
            this._onDidFinishProcessingWriteQueue.fire();
        }
        isProcessingWriteQueue() {
            return (this._isProcessingWriteQueue);
        }
        /**
         * Subsequent calls should wait for the previous `_deflateBuffer` call to complete.
         */
        _deflateMessage(zlibDeflateStream, buffer) {
            return new Promise((resolve, reject) => {
                zlibDeflateStream.write(buffer);
                zlibDeflateStream.flush(data => resolve(data));
            });
        }
        acceptFrame(data, isCompressed, isLastFrameOfMessage) {
            this._readQueue.push({ data, isCompressed, isLastFrameOfMessage });
            this._processReadQueue();
        }
        async _processReadQueue() {
            if (this._isProcessingReadQueue) {
                return;
            }
            this._isProcessingReadQueue = true;
            while (this._readQueue.length > 0) {
                const frameInfo = this._readQueue.shift();
                if (this._zlibInflateStream && frameInfo.isCompressed) {
                    // See https://datatracker.ietf.org/doc/html/rfc7692#section-9.2
                    // Even if permessageDeflate is negotiated, it is possible
                    // that the other side might decide to send uncompressed messages
                    // So only decompress messages that have the RSV 1 bit set
                    const data = await this._inflateFrame(this._zlibInflateStream, frameInfo.data, frameInfo.isLastFrameOfMessage);
                    this._onData.fire(data);
                }
                else {
                    this._onData.fire(frameInfo.data);
                }
            }
            this._isProcessingReadQueue = false;
            this._onDidFinishProcessingReadQueue.fire();
        }
        isProcessingReadQueue() {
            return (this._isProcessingReadQueue);
        }
        /**
         * Subsequent calls should wait for the previous `transformRead` call to complete.
         */
        _inflateFrame(zlibInflateStream, buffer, isLastFrameOfMessage) {
            return new Promise((resolve, reject) => {
                // See https://tools.ietf.org/html/rfc7692#section-7.2.2
                zlibInflateStream.write(buffer);
                if (isLastFrameOfMessage) {
                    zlibInflateStream.write(buffer_1.VSBuffer.fromByteArray([0x00, 0x00, 0xff, 0xff]));
                }
                zlibInflateStream.flush(data => resolve(data));
            });
        }
    }
    class ZlibInflateStream extends lifecycle_1.Disposable {
        get recordedInflateBytes() {
            if (this._recordInflateBytes) {
                return buffer_1.VSBuffer.concat(this._recordedInflateBytes);
            }
            return buffer_1.VSBuffer.alloc(0);
        }
        constructor(_tracer, _recordInflateBytes, inflateBytes, options) {
            super();
            this._tracer = _tracer;
            this._recordInflateBytes = _recordInflateBytes;
            this._onError = this._register(new event_1.Emitter());
            this.onError = this._onError.event;
            this._recordedInflateBytes = [];
            this._pendingInflateData = [];
            this._zlibInflate = (0, zlib_1.createInflateRaw)(options);
            this._zlibInflate.on('error', (err) => {
                this._tracer.traceSocketEvent("zlibInflateError" /* SocketDiagnosticsEventType.zlibInflateError */, { message: err?.message, code: err?.code });
                this._onError.fire(err);
            });
            this._zlibInflate.on('data', (data) => {
                this._tracer.traceSocketEvent("zlibInflateData" /* SocketDiagnosticsEventType.zlibInflateData */, data);
                this._pendingInflateData.push(buffer_1.VSBuffer.wrap(data));
            });
            if (inflateBytes) {
                this._tracer.traceSocketEvent("zlibInflateInitialWrite" /* SocketDiagnosticsEventType.zlibInflateInitialWrite */, inflateBytes.buffer);
                this._zlibInflate.write(inflateBytes.buffer);
                this._zlibInflate.flush(() => {
                    this._tracer.traceSocketEvent("zlibInflateInitialFlushFired" /* SocketDiagnosticsEventType.zlibInflateInitialFlushFired */);
                    this._pendingInflateData.length = 0;
                });
            }
        }
        write(buffer) {
            if (this._recordInflateBytes) {
                this._recordedInflateBytes.push(buffer.clone());
            }
            this._tracer.traceSocketEvent("zlibInflateWrite" /* SocketDiagnosticsEventType.zlibInflateWrite */, buffer);
            this._zlibInflate.write(buffer.buffer);
        }
        flush(callback) {
            this._zlibInflate.flush(() => {
                this._tracer.traceSocketEvent("zlibInflateFlushFired" /* SocketDiagnosticsEventType.zlibInflateFlushFired */);
                const data = buffer_1.VSBuffer.concat(this._pendingInflateData);
                this._pendingInflateData.length = 0;
                callback(data);
            });
        }
    }
    class ZlibDeflateStream extends lifecycle_1.Disposable {
        constructor(_tracer, options) {
            super();
            this._tracer = _tracer;
            this._onError = this._register(new event_1.Emitter());
            this.onError = this._onError.event;
            this._pendingDeflateData = [];
            this._zlibDeflate = (0, zlib_1.createDeflateRaw)({
                windowBits: 15
            });
            this._zlibDeflate.on('error', (err) => {
                this._tracer.traceSocketEvent("zlibDeflateError" /* SocketDiagnosticsEventType.zlibDeflateError */, { message: err?.message, code: err?.code });
                this._onError.fire(err);
            });
            this._zlibDeflate.on('data', (data) => {
                this._tracer.traceSocketEvent("zlibDeflateData" /* SocketDiagnosticsEventType.zlibDeflateData */, data);
                this._pendingDeflateData.push(buffer_1.VSBuffer.wrap(data));
            });
        }
        write(buffer) {
            this._tracer.traceSocketEvent("zlibDeflateWrite" /* SocketDiagnosticsEventType.zlibDeflateWrite */, buffer.buffer);
            this._zlibDeflate.write(buffer.buffer);
        }
        flush(callback) {
            // See https://zlib.net/manual.html#Constants
            this._zlibDeflate.flush(/*Z_SYNC_FLUSH*/ 2, () => {
                this._tracer.traceSocketEvent("zlibDeflateFlushFired" /* SocketDiagnosticsEventType.zlibDeflateFlushFired */);
                let data = buffer_1.VSBuffer.concat(this._pendingDeflateData);
                this._pendingDeflateData.length = 0;
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
    exports.XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
    const safeIpcPathLengths = {
        [2 /* Platform.Linux */]: 107,
        [1 /* Platform.Mac */]: 103
    };
    function createRandomIPCHandle() {
        const randomSuffix = (0, uuid_1.generateUuid)();
        // Windows: use named pipe
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\vscode-ipc-${randomSuffix}-sock`;
        }
        // Mac & Unix: Use socket file
        // Unix: Prefer XDG_RUNTIME_DIR over user data path
        const basePath = process.platform !== 'darwin' && exports.XDG_RUNTIME_DIR ? exports.XDG_RUNTIME_DIR : (0, os_1.tmpdir)();
        const result = (0, path_1.join)(basePath, `vscode-ipc-${randomSuffix}.sock`);
        // Validate length
        validateIPCHandleLength(result);
        return result;
    }
    exports.createRandomIPCHandle = createRandomIPCHandle;
    function createStaticIPCHandle(directoryPath, type, version) {
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
        if (process.platform !== 'darwin' && exports.XDG_RUNTIME_DIR && !process.env['VSCODE_PORTABLE']) {
            result = (0, path_1.join)(exports.XDG_RUNTIME_DIR, `vscode-${scopeForSocket}-${versionForSocket}-${typeForSocket}.sock`);
        }
        else {
            result = (0, path_1.join)(directoryPath, `${versionForSocket}-${typeForSocket}.sock`);
        }
        // Validate length
        validateIPCHandleLength(result);
        return result;
    }
    exports.createStaticIPCHandle = createStaticIPCHandle;
    function validateIPCHandleLength(handle) {
        const limit = safeIpcPathLengths[platform_1.platform];
        if (typeof limit === 'number' && handle.length >= limit) {
            // https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections
            console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
        }
    }
    class Server extends ipc_1.IPCServer {
        static toClientConnectionEvent(server) {
            const onConnection = event_1.Event.fromNodeEventEmitter(server, 'connection');
            return event_1.Event.map(onConnection, socket => ({
                protocol: new ipc_net_1.Protocol(new NodeSocket(socket, 'ipc-server-connection')),
                onDidClientDisconnect: event_1.Event.once(event_1.Event.fromNodeEventEmitter(socket, 'close'))
            }));
        }
        constructor(server) {
            super(Server.toClientConnectionEvent(server));
            this.server = server;
        }
        dispose() {
            super.dispose();
            if (this.server) {
                this.server.close();
                this.server = null;
            }
        }
    }
    exports.Server = Server;
    function serve(hook) {
        return new Promise((c, e) => {
            const server = (0, net_1.createServer)();
            server.on('error', e);
            server.listen(hook, () => {
                server.removeListener('error', e);
                c(new Server(server));
            });
        });
    }
    exports.serve = serve;
    function connect(hook, clientId) {
        return new Promise((c, e) => {
            const socket = (0, net_1.createConnection)(hook, () => {
                socket.removeListener('error', e);
                c(ipc_net_1.Client.fromSocket(new NodeSocket(socket, `ipc-client${clientId}`), clientId));
            });
            socket.once('error', e);
        });
    }
    exports.connect = connect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm5ldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvaXBjL25vZGUvaXBjLm5ldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQWEsVUFBVTtRQVNmLGdCQUFnQixDQUFDLElBQWdDLEVBQUUsSUFBa0U7WUFDM0gsMkJBQWlCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsWUFBWSxNQUFjLEVBQUUsYUFBcUIsRUFBRTtZQU4zQyxjQUFTLEdBQUcsSUFBSSxDQUFDO1lBT3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IscURBQXFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsZ0JBQWdCLGlEQUFtQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDcEcsSUFBSSxHQUFHLEVBQUU7b0JBQ1IsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTt3QkFDekIsNEVBQTRFO3dCQUM1RSwrRUFBK0U7d0JBQy9FLG1FQUFtRTt3QkFDbkUsa0ZBQWtGO3dCQUNsRiwrRUFBK0U7d0JBQy9FLG9GQUFvRjt3QkFDcEYsT0FBTztxQkFDUDtvQkFDRCxJQUFBLDBCQUFpQixFQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtZQUNGLENBQUMsQ0FBQztZQUNG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