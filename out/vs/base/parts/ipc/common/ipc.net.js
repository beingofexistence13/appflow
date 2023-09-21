/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc"], function (require, exports, buffer_1, event_1, lifecycle_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PersistentProtocol = exports.BufferedEmitter = exports.Client = exports.Protocol = exports.ProtocolConstants = exports.ChunkStream = exports.SocketCloseEventType = exports.SocketDiagnostics = exports.SocketDiagnosticsEventType = void 0;
    var SocketDiagnosticsEventType;
    (function (SocketDiagnosticsEventType) {
        SocketDiagnosticsEventType["Created"] = "created";
        SocketDiagnosticsEventType["Read"] = "read";
        SocketDiagnosticsEventType["Write"] = "write";
        SocketDiagnosticsEventType["Open"] = "open";
        SocketDiagnosticsEventType["Error"] = "error";
        SocketDiagnosticsEventType["Close"] = "close";
        SocketDiagnosticsEventType["BrowserWebSocketBlobReceived"] = "browserWebSocketBlobReceived";
        SocketDiagnosticsEventType["NodeEndReceived"] = "nodeEndReceived";
        SocketDiagnosticsEventType["NodeEndSent"] = "nodeEndSent";
        SocketDiagnosticsEventType["NodeDrainBegin"] = "nodeDrainBegin";
        SocketDiagnosticsEventType["NodeDrainEnd"] = "nodeDrainEnd";
        SocketDiagnosticsEventType["zlibInflateError"] = "zlibInflateError";
        SocketDiagnosticsEventType["zlibInflateData"] = "zlibInflateData";
        SocketDiagnosticsEventType["zlibInflateInitialWrite"] = "zlibInflateInitialWrite";
        SocketDiagnosticsEventType["zlibInflateInitialFlushFired"] = "zlibInflateInitialFlushFired";
        SocketDiagnosticsEventType["zlibInflateWrite"] = "zlibInflateWrite";
        SocketDiagnosticsEventType["zlibInflateFlushFired"] = "zlibInflateFlushFired";
        SocketDiagnosticsEventType["zlibDeflateError"] = "zlibDeflateError";
        SocketDiagnosticsEventType["zlibDeflateData"] = "zlibDeflateData";
        SocketDiagnosticsEventType["zlibDeflateWrite"] = "zlibDeflateWrite";
        SocketDiagnosticsEventType["zlibDeflateFlushFired"] = "zlibDeflateFlushFired";
        SocketDiagnosticsEventType["WebSocketNodeSocketWrite"] = "webSocketNodeSocketWrite";
        SocketDiagnosticsEventType["WebSocketNodeSocketPeekedHeader"] = "webSocketNodeSocketPeekedHeader";
        SocketDiagnosticsEventType["WebSocketNodeSocketReadHeader"] = "webSocketNodeSocketReadHeader";
        SocketDiagnosticsEventType["WebSocketNodeSocketReadData"] = "webSocketNodeSocketReadData";
        SocketDiagnosticsEventType["WebSocketNodeSocketUnmaskedData"] = "webSocketNodeSocketUnmaskedData";
        SocketDiagnosticsEventType["WebSocketNodeSocketDrainBegin"] = "webSocketNodeSocketDrainBegin";
        SocketDiagnosticsEventType["WebSocketNodeSocketDrainEnd"] = "webSocketNodeSocketDrainEnd";
        SocketDiagnosticsEventType["ProtocolHeaderRead"] = "protocolHeaderRead";
        SocketDiagnosticsEventType["ProtocolMessageRead"] = "protocolMessageRead";
        SocketDiagnosticsEventType["ProtocolHeaderWrite"] = "protocolHeaderWrite";
        SocketDiagnosticsEventType["ProtocolMessageWrite"] = "protocolMessageWrite";
        SocketDiagnosticsEventType["ProtocolWrite"] = "protocolWrite";
    })(SocketDiagnosticsEventType || (exports.SocketDiagnosticsEventType = SocketDiagnosticsEventType = {}));
    var SocketDiagnostics;
    (function (SocketDiagnostics) {
        SocketDiagnostics.enableDiagnostics = false;
        SocketDiagnostics.records = [];
        const socketIds = new WeakMap();
        let lastUsedSocketId = 0;
        function getSocketId(nativeObject, label) {
            if (!socketIds.has(nativeObject)) {
                const id = String(++lastUsedSocketId);
                socketIds.set(nativeObject, id);
            }
            return socketIds.get(nativeObject);
        }
        function traceSocketEvent(nativeObject, socketDebugLabel, type, data) {
            if (!SocketDiagnostics.enableDiagnostics) {
                return;
            }
            const id = getSocketId(nativeObject, socketDebugLabel);
            if (data instanceof buffer_1.VSBuffer || data instanceof Uint8Array || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
                const copiedData = buffer_1.VSBuffer.alloc(data.byteLength);
                copiedData.set(data);
                SocketDiagnostics.records.push({ timestamp: Date.now(), id, label: socketDebugLabel, type, buff: copiedData });
            }
            else {
                // data is a custom object
                SocketDiagnostics.records.push({ timestamp: Date.now(), id, label: socketDebugLabel, type, data: data });
            }
        }
        SocketDiagnostics.traceSocketEvent = traceSocketEvent;
    })(SocketDiagnostics || (exports.SocketDiagnostics = SocketDiagnostics = {}));
    var SocketCloseEventType;
    (function (SocketCloseEventType) {
        SocketCloseEventType[SocketCloseEventType["NodeSocketCloseEvent"] = 0] = "NodeSocketCloseEvent";
        SocketCloseEventType[SocketCloseEventType["WebSocketCloseEvent"] = 1] = "WebSocketCloseEvent";
    })(SocketCloseEventType || (exports.SocketCloseEventType = SocketCloseEventType = {}));
    let emptyBuffer = null;
    function getEmptyBuffer() {
        if (!emptyBuffer) {
            emptyBuffer = buffer_1.VSBuffer.alloc(0);
        }
        return emptyBuffer;
    }
    class ChunkStream {
        get byteLength() {
            return this._totalLength;
        }
        constructor() {
            this._chunks = [];
            this._totalLength = 0;
        }
        acceptChunk(buff) {
            this._chunks.push(buff);
            this._totalLength += buff.byteLength;
        }
        read(byteCount) {
            return this._read(byteCount, true);
        }
        peek(byteCount) {
            return this._read(byteCount, false);
        }
        _read(byteCount, advance) {
            if (byteCount === 0) {
                return getEmptyBuffer();
            }
            if (byteCount > this._totalLength) {
                throw new Error(`Cannot read so many bytes!`);
            }
            if (this._chunks[0].byteLength === byteCount) {
                // super fast path, precisely first chunk must be returned
                const result = this._chunks[0];
                if (advance) {
                    this._chunks.shift();
                    this._totalLength -= byteCount;
                }
                return result;
            }
            if (this._chunks[0].byteLength > byteCount) {
                // fast path, the reading is entirely within the first chunk
                const result = this._chunks[0].slice(0, byteCount);
                if (advance) {
                    this._chunks[0] = this._chunks[0].slice(byteCount);
                    this._totalLength -= byteCount;
                }
                return result;
            }
            const result = buffer_1.VSBuffer.alloc(byteCount);
            let resultOffset = 0;
            let chunkIndex = 0;
            while (byteCount > 0) {
                const chunk = this._chunks[chunkIndex];
                if (chunk.byteLength > byteCount) {
                    // this chunk will survive
                    const chunkPart = chunk.slice(0, byteCount);
                    result.set(chunkPart, resultOffset);
                    resultOffset += byteCount;
                    if (advance) {
                        this._chunks[chunkIndex] = chunk.slice(byteCount);
                        this._totalLength -= byteCount;
                    }
                    byteCount -= byteCount;
                }
                else {
                    // this chunk will be entirely read
                    result.set(chunk, resultOffset);
                    resultOffset += chunk.byteLength;
                    if (advance) {
                        this._chunks.shift();
                        this._totalLength -= chunk.byteLength;
                    }
                    else {
                        chunkIndex++;
                    }
                    byteCount -= chunk.byteLength;
                }
            }
            return result;
        }
    }
    exports.ChunkStream = ChunkStream;
    var ProtocolMessageType;
    (function (ProtocolMessageType) {
        ProtocolMessageType[ProtocolMessageType["None"] = 0] = "None";
        ProtocolMessageType[ProtocolMessageType["Regular"] = 1] = "Regular";
        ProtocolMessageType[ProtocolMessageType["Control"] = 2] = "Control";
        ProtocolMessageType[ProtocolMessageType["Ack"] = 3] = "Ack";
        ProtocolMessageType[ProtocolMessageType["Disconnect"] = 5] = "Disconnect";
        ProtocolMessageType[ProtocolMessageType["ReplayRequest"] = 6] = "ReplayRequest";
        ProtocolMessageType[ProtocolMessageType["Pause"] = 7] = "Pause";
        ProtocolMessageType[ProtocolMessageType["Resume"] = 8] = "Resume";
        ProtocolMessageType[ProtocolMessageType["KeepAlive"] = 9] = "KeepAlive";
    })(ProtocolMessageType || (ProtocolMessageType = {}));
    function protocolMessageTypeToString(messageType) {
        switch (messageType) {
            case 0 /* ProtocolMessageType.None */: return 'None';
            case 1 /* ProtocolMessageType.Regular */: return 'Regular';
            case 2 /* ProtocolMessageType.Control */: return 'Control';
            case 3 /* ProtocolMessageType.Ack */: return 'Ack';
            case 5 /* ProtocolMessageType.Disconnect */: return 'Disconnect';
            case 6 /* ProtocolMessageType.ReplayRequest */: return 'ReplayRequest';
            case 7 /* ProtocolMessageType.Pause */: return 'PauseWriting';
            case 8 /* ProtocolMessageType.Resume */: return 'ResumeWriting';
            case 9 /* ProtocolMessageType.KeepAlive */: return 'KeepAlive';
        }
    }
    var ProtocolConstants;
    (function (ProtocolConstants) {
        ProtocolConstants[ProtocolConstants["HeaderLength"] = 13] = "HeaderLength";
        /**
         * Send an Acknowledge message at most 2 seconds later...
         */
        ProtocolConstants[ProtocolConstants["AcknowledgeTime"] = 2000] = "AcknowledgeTime";
        /**
         * If there is a sent message that has been unacknowledged for 20 seconds,
         * and we didn't see any incoming server data in the past 20 seconds,
         * then consider the connection has timed out.
         */
        ProtocolConstants[ProtocolConstants["TimeoutTime"] = 20000] = "TimeoutTime";
        /**
         * If there is no reconnection within this time-frame, consider the connection permanently closed...
         */
        ProtocolConstants[ProtocolConstants["ReconnectionGraceTime"] = 10800000] = "ReconnectionGraceTime";
        /**
         * Maximal grace time between the first and the last reconnection...
         */
        ProtocolConstants[ProtocolConstants["ReconnectionShortGraceTime"] = 300000] = "ReconnectionShortGraceTime";
        /**
         * Send a message every 5 seconds to avoid that the connection is closed by the OS.
         */
        ProtocolConstants[ProtocolConstants["KeepAliveSendTime"] = 5000] = "KeepAliveSendTime";
    })(ProtocolConstants || (exports.ProtocolConstants = ProtocolConstants = {}));
    class ProtocolMessage {
        constructor(type, id, ack, data) {
            this.type = type;
            this.id = id;
            this.ack = ack;
            this.data = data;
            this.writtenTime = 0;
        }
        get size() {
            return this.data.byteLength;
        }
    }
    class ProtocolReader extends lifecycle_1.Disposable {
        constructor(socket) {
            super();
            this._onMessage = this._register(new event_1.Emitter());
            this.onMessage = this._onMessage.event;
            this._state = {
                readHead: true,
                readLen: 13 /* ProtocolConstants.HeaderLength */,
                messageType: 0 /* ProtocolMessageType.None */,
                id: 0,
                ack: 0
            };
            this._socket = socket;
            this._isDisposed = false;
            this._incomingData = new ChunkStream();
            this._register(this._socket.onData(data => this.acceptChunk(data)));
            this.lastReadTime = Date.now();
        }
        acceptChunk(data) {
            if (!data || data.byteLength === 0) {
                return;
            }
            this.lastReadTime = Date.now();
            this._incomingData.acceptChunk(data);
            while (this._incomingData.byteLength >= this._state.readLen) {
                const buff = this._incomingData.read(this._state.readLen);
                if (this._state.readHead) {
                    // buff is the header
                    // save new state => next time will read the body
                    this._state.readHead = false;
                    this._state.readLen = buff.readUInt32BE(9);
                    this._state.messageType = buff.readUInt8(0);
                    this._state.id = buff.readUInt32BE(1);
                    this._state.ack = buff.readUInt32BE(5);
                    this._socket.traceSocketEvent("protocolHeaderRead" /* SocketDiagnosticsEventType.ProtocolHeaderRead */, { messageType: protocolMessageTypeToString(this._state.messageType), id: this._state.id, ack: this._state.ack, messageSize: this._state.readLen });
                }
                else {
                    // buff is the body
                    const messageType = this._state.messageType;
                    const id = this._state.id;
                    const ack = this._state.ack;
                    // save new state => next time will read the header
                    this._state.readHead = true;
                    this._state.readLen = 13 /* ProtocolConstants.HeaderLength */;
                    this._state.messageType = 0 /* ProtocolMessageType.None */;
                    this._state.id = 0;
                    this._state.ack = 0;
                    this._socket.traceSocketEvent("protocolMessageRead" /* SocketDiagnosticsEventType.ProtocolMessageRead */, buff);
                    this._onMessage.fire(new ProtocolMessage(messageType, id, ack, buff));
                    if (this._isDisposed) {
                        // check if an event listener lead to our disposal
                        break;
                    }
                }
            }
        }
        readEntireBuffer() {
            return this._incomingData.read(this._incomingData.byteLength);
        }
        dispose() {
            this._isDisposed = true;
            super.dispose();
        }
    }
    class ProtocolWriter {
        constructor(socket) {
            this._writeNowTimeout = null;
            this._isDisposed = false;
            this._isPaused = false;
            this._socket = socket;
            this._data = [];
            this._totalLength = 0;
            this.lastWriteTime = 0;
        }
        dispose() {
            try {
                this.flush();
            }
            catch (err) {
                // ignore error, since the socket could be already closed
            }
            this._isDisposed = true;
        }
        drain() {
            this.flush();
            return this._socket.drain();
        }
        flush() {
            // flush
            this._writeNow();
        }
        pause() {
            this._isPaused = true;
        }
        resume() {
            this._isPaused = false;
            this._scheduleWriting();
        }
        write(msg) {
            if (this._isDisposed) {
                // ignore: there could be left-over promises which complete and then
                // decide to write a response, etc...
                return;
            }
            msg.writtenTime = Date.now();
            this.lastWriteTime = Date.now();
            const header = buffer_1.VSBuffer.alloc(13 /* ProtocolConstants.HeaderLength */);
            header.writeUInt8(msg.type, 0);
            header.writeUInt32BE(msg.id, 1);
            header.writeUInt32BE(msg.ack, 5);
            header.writeUInt32BE(msg.data.byteLength, 9);
            this._socket.traceSocketEvent("protocolHeaderWrite" /* SocketDiagnosticsEventType.ProtocolHeaderWrite */, { messageType: protocolMessageTypeToString(msg.type), id: msg.id, ack: msg.ack, messageSize: msg.data.byteLength });
            this._socket.traceSocketEvent("protocolMessageWrite" /* SocketDiagnosticsEventType.ProtocolMessageWrite */, msg.data);
            this._writeSoon(header, msg.data);
        }
        _bufferAdd(head, body) {
            const wasEmpty = this._totalLength === 0;
            this._data.push(head, body);
            this._totalLength += head.byteLength + body.byteLength;
            return wasEmpty;
        }
        _bufferTake() {
            const ret = buffer_1.VSBuffer.concat(this._data, this._totalLength);
            this._data.length = 0;
            this._totalLength = 0;
            return ret;
        }
        _writeSoon(header, data) {
            if (this._bufferAdd(header, data)) {
                this._scheduleWriting();
            }
        }
        _scheduleWriting() {
            if (this._writeNowTimeout) {
                return;
            }
            this._writeNowTimeout = setTimeout(() => {
                this._writeNowTimeout = null;
                this._writeNow();
            });
        }
        _writeNow() {
            if (this._totalLength === 0) {
                return;
            }
            if (this._isPaused) {
                return;
            }
            const data = this._bufferTake();
            this._socket.traceSocketEvent("protocolWrite" /* SocketDiagnosticsEventType.ProtocolWrite */, { byteLength: data.byteLength });
            this._socket.write(data);
        }
    }
    /**
     * A message has the following format:
     * ```
     *     /-------------------------------|------\
     *     |             HEADER            |      |
     *     |-------------------------------| DATA |
     *     | TYPE | ID | ACK | DATA_LENGTH |      |
     *     \-------------------------------|------/
     * ```
     * The header is 9 bytes and consists of:
     *  - TYPE is 1 byte (ProtocolMessageType) - the message type
     *  - ID is 4 bytes (u32be) - the message id (can be 0 to indicate to be ignored)
     *  - ACK is 4 bytes (u32be) - the acknowledged message id (can be 0 to indicate to be ignored)
     *  - DATA_LENGTH is 4 bytes (u32be) - the length in bytes of DATA
     *
     * Only Regular messages are counted, other messages are not counted, nor acknowledged.
     */
    class Protocol extends lifecycle_1.Disposable {
        constructor(socket) {
            super();
            this._onMessage = new event_1.Emitter();
            this.onMessage = this._onMessage.event;
            this._onDidDispose = new event_1.Emitter();
            this.onDidDispose = this._onDidDispose.event;
            this._socket = socket;
            this._socketWriter = this._register(new ProtocolWriter(this._socket));
            this._socketReader = this._register(new ProtocolReader(this._socket));
            this._register(this._socketReader.onMessage((msg) => {
                if (msg.type === 1 /* ProtocolMessageType.Regular */) {
                    this._onMessage.fire(msg.data);
                }
            }));
            this._register(this._socket.onClose(() => this._onDidDispose.fire()));
        }
        drain() {
            return this._socketWriter.drain();
        }
        getSocket() {
            return this._socket;
        }
        sendDisconnect() {
            // Nothing to do...
        }
        send(buffer) {
            this._socketWriter.write(new ProtocolMessage(1 /* ProtocolMessageType.Regular */, 0, 0, buffer));
        }
    }
    exports.Protocol = Protocol;
    class Client extends ipc_1.IPCClient {
        static fromSocket(socket, id) {
            return new Client(new Protocol(socket), id);
        }
        get onDidDispose() { return this.protocol.onDidDispose; }
        constructor(protocol, id, ipcLogger = null) {
            super(protocol, id, ipcLogger);
            this.protocol = protocol;
        }
        dispose() {
            super.dispose();
            const socket = this.protocol.getSocket();
            this.protocol.sendDisconnect();
            this.protocol.dispose();
            socket.end();
        }
    }
    exports.Client = Client;
    /**
     * Will ensure no messages are lost if there are no event listeners.
     */
    class BufferedEmitter {
        constructor() {
            this._hasListeners = false;
            this._isDeliveringMessages = false;
            this._bufferedMessages = [];
            this._emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    this._hasListeners = true;
                    // it is important to deliver these messages after this call, but before
                    // other messages have a chance to be received (to guarantee in order delivery)
                    // that's why we're using here queueMicrotask and not other types of timeouts
                    queueMicrotask(() => this._deliverMessages());
                },
                onDidRemoveLastListener: () => {
                    this._hasListeners = false;
                }
            });
            this.event = this._emitter.event;
        }
        _deliverMessages() {
            if (this._isDeliveringMessages) {
                return;
            }
            this._isDeliveringMessages = true;
            while (this._hasListeners && this._bufferedMessages.length > 0) {
                this._emitter.fire(this._bufferedMessages.shift());
            }
            this._isDeliveringMessages = false;
        }
        fire(event) {
            if (this._hasListeners) {
                if (this._bufferedMessages.length > 0) {
                    this._bufferedMessages.push(event);
                }
                else {
                    this._emitter.fire(event);
                }
            }
            else {
                this._bufferedMessages.push(event);
            }
        }
        flushBuffer() {
            this._bufferedMessages = [];
        }
    }
    exports.BufferedEmitter = BufferedEmitter;
    class QueueElement {
        constructor(data) {
            this.data = data;
            this.next = null;
        }
    }
    class Queue {
        constructor() {
            this._first = null;
            this._last = null;
        }
        length() {
            let result = 0;
            let current = this._first;
            while (current) {
                current = current.next;
                result++;
            }
            return result;
        }
        peek() {
            if (!this._first) {
                return null;
            }
            return this._first.data;
        }
        toArray() {
            const result = [];
            let resultLen = 0;
            let it = this._first;
            while (it) {
                result[resultLen++] = it.data;
                it = it.next;
            }
            return result;
        }
        pop() {
            if (!this._first) {
                return;
            }
            if (this._first === this._last) {
                this._first = null;
                this._last = null;
                return;
            }
            this._first = this._first.next;
        }
        push(item) {
            const element = new QueueElement(item);
            if (!this._first) {
                this._first = element;
                this._last = element;
                return;
            }
            this._last.next = element;
            this._last = element;
        }
    }
    class LoadEstimator {
        static { this._HISTORY_LENGTH = 10; }
        static { this._INSTANCE = null; }
        static getInstance() {
            if (!LoadEstimator._INSTANCE) {
                LoadEstimator._INSTANCE = new LoadEstimator();
            }
            return LoadEstimator._INSTANCE;
        }
        constructor() {
            this.lastRuns = [];
            const now = Date.now();
            for (let i = 0; i < LoadEstimator._HISTORY_LENGTH; i++) {
                this.lastRuns[i] = now - 1000 * i;
            }
            setInterval(() => {
                for (let i = LoadEstimator._HISTORY_LENGTH; i >= 1; i--) {
                    this.lastRuns[i] = this.lastRuns[i - 1];
                }
                this.lastRuns[0] = Date.now();
            }, 1000);
        }
        /**
         * returns an estimative number, from 0 (low load) to 1 (high load)
         */
        load() {
            const now = Date.now();
            const historyLimit = (1 + LoadEstimator._HISTORY_LENGTH) * 1000;
            let score = 0;
            for (let i = 0; i < LoadEstimator._HISTORY_LENGTH; i++) {
                if (now - this.lastRuns[i] <= historyLimit) {
                    score++;
                }
            }
            return 1 - score / LoadEstimator._HISTORY_LENGTH;
        }
        hasHighLoad() {
            return this.load() >= 0.5;
        }
    }
    /**
     * Same as Protocol, but will actually track messages and acks.
     * Moreover, it will ensure no messages are lost if there are no event listeners.
     */
    class PersistentProtocol {
        get unacknowledgedCount() {
            return this._outgoingMsgId - this._outgoingAckId;
        }
        constructor(opts) {
            this._onControlMessage = new BufferedEmitter();
            this.onControlMessage = this._onControlMessage.event;
            this._onMessage = new BufferedEmitter();
            this.onMessage = this._onMessage.event;
            this._onDidDispose = new BufferedEmitter();
            this.onDidDispose = this._onDidDispose.event;
            this._onSocketClose = new BufferedEmitter();
            this.onSocketClose = this._onSocketClose.event;
            this._onSocketTimeout = new BufferedEmitter();
            this.onSocketTimeout = this._onSocketTimeout.event;
            this._loadEstimator = opts.loadEstimator ?? LoadEstimator.getInstance();
            this._shouldSendKeepAlive = opts.sendKeepAlive ?? true;
            this._isReconnecting = false;
            this._outgoingUnackMsg = new Queue();
            this._outgoingMsgId = 0;
            this._outgoingAckId = 0;
            this._outgoingAckTimeout = null;
            this._incomingMsgId = 0;
            this._incomingAckId = 0;
            this._incomingMsgLastTime = 0;
            this._incomingAckTimeout = null;
            this._lastReplayRequestTime = 0;
            this._lastSocketTimeoutTime = Date.now();
            this._socketDisposables = new lifecycle_1.DisposableStore();
            this._socket = opts.socket;
            this._socketWriter = this._socketDisposables.add(new ProtocolWriter(this._socket));
            this._socketReader = this._socketDisposables.add(new ProtocolReader(this._socket));
            this._socketDisposables.add(this._socketReader.onMessage(msg => this._receiveMessage(msg)));
            this._socketDisposables.add(this._socket.onClose(e => this._onSocketClose.fire(e)));
            if (opts.initialChunk) {
                this._socketReader.acceptChunk(opts.initialChunk);
            }
            if (this._shouldSendKeepAlive) {
                this._keepAliveInterval = setInterval(() => {
                    this._sendKeepAlive();
                }, 5000 /* ProtocolConstants.KeepAliveSendTime */);
            }
            else {
                this._keepAliveInterval = null;
            }
        }
        dispose() {
            if (this._outgoingAckTimeout) {
                clearTimeout(this._outgoingAckTimeout);
                this._outgoingAckTimeout = null;
            }
            if (this._incomingAckTimeout) {
                clearTimeout(this._incomingAckTimeout);
                this._incomingAckTimeout = null;
            }
            if (this._keepAliveInterval) {
                clearInterval(this._keepAliveInterval);
                this._keepAliveInterval = null;
            }
            this._socketDisposables.dispose();
        }
        drain() {
            return this._socketWriter.drain();
        }
        sendDisconnect() {
            const msg = new ProtocolMessage(5 /* ProtocolMessageType.Disconnect */, 0, 0, getEmptyBuffer());
            this._socketWriter.write(msg);
            this._socketWriter.flush();
        }
        sendPause() {
            const msg = new ProtocolMessage(7 /* ProtocolMessageType.Pause */, 0, 0, getEmptyBuffer());
            this._socketWriter.write(msg);
        }
        sendResume() {
            const msg = new ProtocolMessage(8 /* ProtocolMessageType.Resume */, 0, 0, getEmptyBuffer());
            this._socketWriter.write(msg);
        }
        pauseSocketWriting() {
            this._socketWriter.pause();
        }
        getSocket() {
            return this._socket;
        }
        getMillisSinceLastIncomingData() {
            return Date.now() - this._socketReader.lastReadTime;
        }
        beginAcceptReconnection(socket, initialDataChunk) {
            this._isReconnecting = true;
            this._socketDisposables.dispose();
            this._socketDisposables = new lifecycle_1.DisposableStore();
            this._onControlMessage.flushBuffer();
            this._onSocketClose.flushBuffer();
            this._onSocketTimeout.flushBuffer();
            this._socket.dispose();
            this._lastReplayRequestTime = 0;
            this._lastSocketTimeoutTime = Date.now();
            this._socket = socket;
            this._socketWriter = this._socketDisposables.add(new ProtocolWriter(this._socket));
            this._socketReader = this._socketDisposables.add(new ProtocolReader(this._socket));
            this._socketDisposables.add(this._socketReader.onMessage(msg => this._receiveMessage(msg)));
            this._socketDisposables.add(this._socket.onClose(e => this._onSocketClose.fire(e)));
            this._socketReader.acceptChunk(initialDataChunk);
        }
        endAcceptReconnection() {
            this._isReconnecting = false;
            // After a reconnection, let the other party know (again) which messages have been received.
            // (perhaps the other party didn't receive a previous ACK)
            this._incomingAckId = this._incomingMsgId;
            const msg = new ProtocolMessage(3 /* ProtocolMessageType.Ack */, 0, this._incomingAckId, getEmptyBuffer());
            this._socketWriter.write(msg);
            // Send again all unacknowledged messages
            const toSend = this._outgoingUnackMsg.toArray();
            for (let i = 0, len = toSend.length; i < len; i++) {
                this._socketWriter.write(toSend[i]);
            }
            this._recvAckCheck();
        }
        acceptDisconnect() {
            this._onDidDispose.fire();
        }
        _receiveMessage(msg) {
            if (msg.ack > this._outgoingAckId) {
                this._outgoingAckId = msg.ack;
                do {
                    const first = this._outgoingUnackMsg.peek();
                    if (first && first.id <= msg.ack) {
                        // this message has been confirmed, remove it
                        this._outgoingUnackMsg.pop();
                    }
                    else {
                        break;
                    }
                } while (true);
            }
            switch (msg.type) {
                case 0 /* ProtocolMessageType.None */: {
                    // N/A
                    break;
                }
                case 1 /* ProtocolMessageType.Regular */: {
                    if (msg.id > this._incomingMsgId) {
                        if (msg.id !== this._incomingMsgId + 1) {
                            // in case we missed some messages we ask the other party to resend them
                            const now = Date.now();
                            if (now - this._lastReplayRequestTime > 10000) {
                                // send a replay request at most once every 10s
                                this._lastReplayRequestTime = now;
                                this._socketWriter.write(new ProtocolMessage(6 /* ProtocolMessageType.ReplayRequest */, 0, 0, getEmptyBuffer()));
                            }
                        }
                        else {
                            this._incomingMsgId = msg.id;
                            this._incomingMsgLastTime = Date.now();
                            this._sendAckCheck();
                            this._onMessage.fire(msg.data);
                        }
                    }
                    break;
                }
                case 2 /* ProtocolMessageType.Control */: {
                    this._onControlMessage.fire(msg.data);
                    break;
                }
                case 3 /* ProtocolMessageType.Ack */: {
                    // nothing to do, .ack is handled above already
                    break;
                }
                case 5 /* ProtocolMessageType.Disconnect */: {
                    this._onDidDispose.fire();
                    break;
                }
                case 6 /* ProtocolMessageType.ReplayRequest */: {
                    // Send again all unacknowledged messages
                    const toSend = this._outgoingUnackMsg.toArray();
                    for (let i = 0, len = toSend.length; i < len; i++) {
                        this._socketWriter.write(toSend[i]);
                    }
                    this._recvAckCheck();
                    break;
                }
                case 7 /* ProtocolMessageType.Pause */: {
                    this._socketWriter.pause();
                    break;
                }
                case 8 /* ProtocolMessageType.Resume */: {
                    this._socketWriter.resume();
                    break;
                }
                case 9 /* ProtocolMessageType.KeepAlive */: {
                    // nothing to do
                    break;
                }
            }
        }
        readEntireBuffer() {
            return this._socketReader.readEntireBuffer();
        }
        flush() {
            this._socketWriter.flush();
        }
        send(buffer) {
            const myId = ++this._outgoingMsgId;
            this._incomingAckId = this._incomingMsgId;
            const msg = new ProtocolMessage(1 /* ProtocolMessageType.Regular */, myId, this._incomingAckId, buffer);
            this._outgoingUnackMsg.push(msg);
            if (!this._isReconnecting) {
                this._socketWriter.write(msg);
                this._recvAckCheck();
            }
        }
        /**
         * Send a message which will not be part of the regular acknowledge flow.
         * Use this for early control messages which are repeated in case of reconnection.
         */
        sendControl(buffer) {
            const msg = new ProtocolMessage(2 /* ProtocolMessageType.Control */, 0, 0, buffer);
            this._socketWriter.write(msg);
        }
        _sendAckCheck() {
            if (this._incomingMsgId <= this._incomingAckId) {
                // nothink to acknowledge
                return;
            }
            if (this._incomingAckTimeout) {
                // there will be a check in the near future
                return;
            }
            const timeSinceLastIncomingMsg = Date.now() - this._incomingMsgLastTime;
            if (timeSinceLastIncomingMsg >= 2000 /* ProtocolConstants.AcknowledgeTime */) {
                // sufficient time has passed since this message has been received,
                // and no message from our side needed to be sent in the meantime,
                // so we will send a message containing only an ack.
                this._sendAck();
                return;
            }
            this._incomingAckTimeout = setTimeout(() => {
                this._incomingAckTimeout = null;
                this._sendAckCheck();
            }, 2000 /* ProtocolConstants.AcknowledgeTime */ - timeSinceLastIncomingMsg + 5);
        }
        _recvAckCheck() {
            if (this._outgoingMsgId <= this._outgoingAckId) {
                // everything has been acknowledged
                return;
            }
            if (this._outgoingAckTimeout) {
                // there will be a check in the near future
                return;
            }
            if (this._isReconnecting) {
                // do not cause a timeout during reconnection,
                // because messages will not be actually written until `endAcceptReconnection`
                return;
            }
            const oldestUnacknowledgedMsg = this._outgoingUnackMsg.peek();
            const timeSinceOldestUnacknowledgedMsg = Date.now() - oldestUnacknowledgedMsg.writtenTime;
            const timeSinceLastReceivedSomeData = Date.now() - this._socketReader.lastReadTime;
            const timeSinceLastTimeout = Date.now() - this._lastSocketTimeoutTime;
            if (timeSinceOldestUnacknowledgedMsg >= 20000 /* ProtocolConstants.TimeoutTime */
                && timeSinceLastReceivedSomeData >= 20000 /* ProtocolConstants.TimeoutTime */
                && timeSinceLastTimeout >= 20000 /* ProtocolConstants.TimeoutTime */) {
                // It's been a long time since our sent message was acknowledged
                // and a long time since we received some data
                // But this might be caused by the event loop being busy and failing to read messages
                if (!this._loadEstimator.hasHighLoad()) {
                    // Trash the socket
                    this._lastSocketTimeoutTime = Date.now();
                    this._onSocketTimeout.fire({
                        unacknowledgedMsgCount: this._outgoingUnackMsg.length(),
                        timeSinceOldestUnacknowledgedMsg,
                        timeSinceLastReceivedSomeData
                    });
                    return;
                }
            }
            const minimumTimeUntilTimeout = Math.max(20000 /* ProtocolConstants.TimeoutTime */ - timeSinceOldestUnacknowledgedMsg, 20000 /* ProtocolConstants.TimeoutTime */ - timeSinceLastReceivedSomeData, 20000 /* ProtocolConstants.TimeoutTime */ - timeSinceLastTimeout, 500);
            this._outgoingAckTimeout = setTimeout(() => {
                this._outgoingAckTimeout = null;
                this._recvAckCheck();
            }, minimumTimeUntilTimeout);
        }
        _sendAck() {
            if (this._incomingMsgId <= this._incomingAckId) {
                // nothink to acknowledge
                return;
            }
            this._incomingAckId = this._incomingMsgId;
            const msg = new ProtocolMessage(3 /* ProtocolMessageType.Ack */, 0, this._incomingAckId, getEmptyBuffer());
            this._socketWriter.write(msg);
        }
        _sendKeepAlive() {
            this._incomingAckId = this._incomingMsgId;
            const msg = new ProtocolMessage(9 /* ProtocolMessageType.KeepAlive */, 0, this._incomingAckId, getEmptyBuffer());
            this._socketWriter.write(msg);
        }
    }
    exports.PersistentProtocol = PersistentProtocol;
});
// (() => {
// 	if (!SocketDiagnostics.enableDiagnostics) {
// 		return;
// 	}
// 	if (typeof require.__$__nodeRequire !== 'function') {
// 		console.log(`Can only log socket diagnostics on native platforms.`);
// 		return;
// 	}
// 	const type = (
// 		process.argv.includes('--type=renderer')
// 			? 'renderer'
// 			: (process.argv.includes('--type=extensionHost')
// 				? 'extensionHost'
// 				: (process.argv.some(item => item.includes('server-main'))
// 					? 'server'
// 					: 'unknown'
// 				)
// 			)
// 	);
// 	setTimeout(() => {
// 		SocketDiagnostics.records.forEach(r => {
// 			if (r.buff) {
// 				r.data = Buffer.from(r.buff.buffer).toString('base64');
// 				r.buff = undefined;
// 			}
// 		});
// 		const fs = <typeof import('fs')>require.__$__nodeRequire('fs');
// 		const path = <typeof import('path')>require.__$__nodeRequire('path');
// 		const logPath = path.join(process.cwd(),`${type}-${process.pid}`);
// 		console.log(`dumping socket diagnostics at ${logPath}`);
// 		fs.writeFileSync(logPath, JSON.stringify(SocketDiagnostics.records));
// 	}, 20000);
// })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm5ldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvaXBjL2NvbW1vbi9pcGMubmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxJQUFrQiwwQkF1Q2pCO0lBdkNELFdBQWtCLDBCQUEwQjtRQUMzQyxpREFBbUIsQ0FBQTtRQUNuQiwyQ0FBYSxDQUFBO1FBQ2IsNkNBQWUsQ0FBQTtRQUNmLDJDQUFhLENBQUE7UUFDYiw2Q0FBZSxDQUFBO1FBQ2YsNkNBQWUsQ0FBQTtRQUVmLDJGQUE2RCxDQUFBO1FBRTdELGlFQUFtQyxDQUFBO1FBQ25DLHlEQUEyQixDQUFBO1FBQzNCLCtEQUFpQyxDQUFBO1FBQ2pDLDJEQUE2QixDQUFBO1FBRTdCLG1FQUFxQyxDQUFBO1FBQ3JDLGlFQUFtQyxDQUFBO1FBQ25DLGlGQUFtRCxDQUFBO1FBQ25ELDJGQUE2RCxDQUFBO1FBQzdELG1FQUFxQyxDQUFBO1FBQ3JDLDZFQUErQyxDQUFBO1FBQy9DLG1FQUFxQyxDQUFBO1FBQ3JDLGlFQUFtQyxDQUFBO1FBQ25DLG1FQUFxQyxDQUFBO1FBQ3JDLDZFQUErQyxDQUFBO1FBRS9DLG1GQUFxRCxDQUFBO1FBQ3JELGlHQUFtRSxDQUFBO1FBQ25FLDZGQUErRCxDQUFBO1FBQy9ELHlGQUEyRCxDQUFBO1FBQzNELGlHQUFtRSxDQUFBO1FBQ25FLDZGQUErRCxDQUFBO1FBQy9ELHlGQUEyRCxDQUFBO1FBRTNELHVFQUF5QyxDQUFBO1FBQ3pDLHlFQUEyQyxDQUFBO1FBQzNDLHlFQUEyQyxDQUFBO1FBQzNDLDJFQUE2QyxDQUFBO1FBQzdDLDZEQUErQixDQUFBO0lBQ2hDLENBQUMsRUF2Q2lCLDBCQUEwQiwwQ0FBMUIsMEJBQTBCLFFBdUMzQztJQUVELElBQWlCLGlCQUFpQixDQXdDakM7SUF4Q0QsV0FBaUIsaUJBQWlCO1FBRXBCLG1DQUFpQixHQUFH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