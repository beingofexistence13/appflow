/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc"], function (require, exports, buffer_1, event_1, lifecycle_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ph = exports.$oh = exports.$nh = exports.$mh = exports.ProtocolConstants = exports.$lh = exports.SocketCloseEventType = exports.SocketDiagnostics = exports.SocketDiagnosticsEventType = void 0;
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
            if (data instanceof buffer_1.$Fd || data instanceof Uint8Array || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
                const copiedData = buffer_1.$Fd.alloc(data.byteLength);
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
            emptyBuffer = buffer_1.$Fd.alloc(0);
        }
        return emptyBuffer;
    }
    class $lh {
        get byteLength() {
            return this.b;
        }
        constructor() {
            this.a = [];
            this.b = 0;
        }
        acceptChunk(buff) {
            this.a.push(buff);
            this.b += buff.byteLength;
        }
        read(byteCount) {
            return this.c(byteCount, true);
        }
        peek(byteCount) {
            return this.c(byteCount, false);
        }
        c(byteCount, advance) {
            if (byteCount === 0) {
                return getEmptyBuffer();
            }
            if (byteCount > this.b) {
                throw new Error(`Cannot read so many bytes!`);
            }
            if (this.a[0].byteLength === byteCount) {
                // super fast path, precisely first chunk must be returned
                const result = this.a[0];
                if (advance) {
                    this.a.shift();
                    this.b -= byteCount;
                }
                return result;
            }
            if (this.a[0].byteLength > byteCount) {
                // fast path, the reading is entirely within the first chunk
                const result = this.a[0].slice(0, byteCount);
                if (advance) {
                    this.a[0] = this.a[0].slice(byteCount);
                    this.b -= byteCount;
                }
                return result;
            }
            const result = buffer_1.$Fd.alloc(byteCount);
            let resultOffset = 0;
            let chunkIndex = 0;
            while (byteCount > 0) {
                const chunk = this.a[chunkIndex];
                if (chunk.byteLength > byteCount) {
                    // this chunk will survive
                    const chunkPart = chunk.slice(0, byteCount);
                    result.set(chunkPart, resultOffset);
                    resultOffset += byteCount;
                    if (advance) {
                        this.a[chunkIndex] = chunk.slice(byteCount);
                        this.b -= byteCount;
                    }
                    byteCount -= byteCount;
                }
                else {
                    // this chunk will be entirely read
                    result.set(chunk, resultOffset);
                    resultOffset += chunk.byteLength;
                    if (advance) {
                        this.a.shift();
                        this.b -= chunk.byteLength;
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
    exports.$lh = $lh;
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
    class ProtocolReader extends lifecycle_1.$kc {
        constructor(socket) {
            super();
            this.f = this.B(new event_1.$fd());
            this.onMessage = this.f.event;
            this.g = {
                readHead: true,
                readLen: 13 /* ProtocolConstants.HeaderLength */,
                messageType: 0 /* ProtocolMessageType.None */,
                id: 0,
                ack: 0
            };
            this.a = socket;
            this.b = false;
            this.c = new $lh();
            this.B(this.a.onData(data => this.acceptChunk(data)));
            this.lastReadTime = Date.now();
        }
        acceptChunk(data) {
            if (!data || data.byteLength === 0) {
                return;
            }
            this.lastReadTime = Date.now();
            this.c.acceptChunk(data);
            while (this.c.byteLength >= this.g.readLen) {
                const buff = this.c.read(this.g.readLen);
                if (this.g.readHead) {
                    // buff is the header
                    // save new state => next time will read the body
                    this.g.readHead = false;
                    this.g.readLen = buff.readUInt32BE(9);
                    this.g.messageType = buff.readUInt8(0);
                    this.g.id = buff.readUInt32BE(1);
                    this.g.ack = buff.readUInt32BE(5);
                    this.a.traceSocketEvent("protocolHeaderRead" /* SocketDiagnosticsEventType.ProtocolHeaderRead */, { messageType: protocolMessageTypeToString(this.g.messageType), id: this.g.id, ack: this.g.ack, messageSize: this.g.readLen });
                }
                else {
                    // buff is the body
                    const messageType = this.g.messageType;
                    const id = this.g.id;
                    const ack = this.g.ack;
                    // save new state => next time will read the header
                    this.g.readHead = true;
                    this.g.readLen = 13 /* ProtocolConstants.HeaderLength */;
                    this.g.messageType = 0 /* ProtocolMessageType.None */;
                    this.g.id = 0;
                    this.g.ack = 0;
                    this.a.traceSocketEvent("protocolMessageRead" /* SocketDiagnosticsEventType.ProtocolMessageRead */, buff);
                    this.f.fire(new ProtocolMessage(messageType, id, ack, buff));
                    if (this.b) {
                        // check if an event listener lead to our disposal
                        break;
                    }
                }
            }
        }
        readEntireBuffer() {
            return this.c.read(this.c.byteLength);
        }
        dispose() {
            this.b = true;
            super.dispose();
        }
    }
    class ProtocolWriter {
        constructor(socket) {
            this.k = null;
            this.a = false;
            this.b = false;
            this.c = socket;
            this.d = [];
            this.f = 0;
            this.lastWriteTime = 0;
        }
        dispose() {
            try {
                this.flush();
            }
            catch (err) {
                // ignore error, since the socket could be already closed
            }
            this.a = true;
        }
        drain() {
            this.flush();
            return this.c.drain();
        }
        flush() {
            // flush
            this.m();
        }
        pause() {
            this.b = true;
        }
        resume() {
            this.b = false;
            this.l();
        }
        write(msg) {
            if (this.a) {
                // ignore: there could be left-over promises which complete and then
                // decide to write a response, etc...
                return;
            }
            msg.writtenTime = Date.now();
            this.lastWriteTime = Date.now();
            const header = buffer_1.$Fd.alloc(13 /* ProtocolConstants.HeaderLength */);
            header.writeUInt8(msg.type, 0);
            header.writeUInt32BE(msg.id, 1);
            header.writeUInt32BE(msg.ack, 5);
            header.writeUInt32BE(msg.data.byteLength, 9);
            this.c.traceSocketEvent("protocolHeaderWrite" /* SocketDiagnosticsEventType.ProtocolHeaderWrite */, { messageType: protocolMessageTypeToString(msg.type), id: msg.id, ack: msg.ack, messageSize: msg.data.byteLength });
            this.c.traceSocketEvent("protocolMessageWrite" /* SocketDiagnosticsEventType.ProtocolMessageWrite */, msg.data);
            this.j(header, msg.data);
        }
        g(head, body) {
            const wasEmpty = this.f === 0;
            this.d.push(head, body);
            this.f += head.byteLength + body.byteLength;
            return wasEmpty;
        }
        h() {
            const ret = buffer_1.$Fd.concat(this.d, this.f);
            this.d.length = 0;
            this.f = 0;
            return ret;
        }
        j(header, data) {
            if (this.g(header, data)) {
                this.l();
            }
        }
        l() {
            if (this.k) {
                return;
            }
            this.k = setTimeout(() => {
                this.k = null;
                this.m();
            });
        }
        m() {
            if (this.f === 0) {
                return;
            }
            if (this.b) {
                return;
            }
            const data = this.h();
            this.c.traceSocketEvent("protocolWrite" /* SocketDiagnosticsEventType.ProtocolWrite */, { byteLength: data.byteLength });
            this.c.write(data);
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
    class $mh extends lifecycle_1.$kc {
        constructor(socket) {
            super();
            this.f = new event_1.$fd();
            this.onMessage = this.f.event;
            this.g = new event_1.$fd();
            this.onDidDispose = this.g.event;
            this.a = socket;
            this.b = this.B(new ProtocolWriter(this.a));
            this.c = this.B(new ProtocolReader(this.a));
            this.B(this.c.onMessage((msg) => {
                if (msg.type === 1 /* ProtocolMessageType.Regular */) {
                    this.f.fire(msg.data);
                }
            }));
            this.B(this.a.onClose(() => this.g.fire()));
        }
        drain() {
            return this.b.drain();
        }
        getSocket() {
            return this.a;
        }
        sendDisconnect() {
            // Nothing to do...
        }
        send(buffer) {
            this.b.write(new ProtocolMessage(1 /* ProtocolMessageType.Regular */, 0, 0, buffer));
        }
    }
    exports.$mh = $mh;
    class $nh extends ipc_1.$gh {
        static fromSocket(socket, id) {
            return new $nh(new $mh(socket), id);
        }
        get onDidDispose() { return this.b.onDidDispose; }
        constructor(b, id, ipcLogger = null) {
            super(b, id, ipcLogger);
            this.b = b;
        }
        dispose() {
            super.dispose();
            const socket = this.b.getSocket();
            this.b.sendDisconnect();
            this.b.dispose();
            socket.end();
        }
    }
    exports.$nh = $nh;
    /**
     * Will ensure no messages are lost if there are no event listeners.
     */
    class $oh {
        constructor() {
            this.b = false;
            this.c = false;
            this.d = [];
            this.a = new event_1.$fd({
                onWillAddFirstListener: () => {
                    this.b = true;
                    // it is important to deliver these messages after this call, but before
                    // other messages have a chance to be received (to guarantee in order delivery)
                    // that's why we're using here queueMicrotask and not other types of timeouts
                    queueMicrotask(() => this.f());
                },
                onDidRemoveLastListener: () => {
                    this.b = false;
                }
            });
            this.event = this.a.event;
        }
        f() {
            if (this.c) {
                return;
            }
            this.c = true;
            while (this.b && this.d.length > 0) {
                this.a.fire(this.d.shift());
            }
            this.c = false;
        }
        fire(event) {
            if (this.b) {
                if (this.d.length > 0) {
                    this.d.push(event);
                }
                else {
                    this.a.fire(event);
                }
            }
            else {
                this.d.push(event);
            }
        }
        flushBuffer() {
            this.d = [];
        }
    }
    exports.$oh = $oh;
    class QueueElement {
        constructor(data) {
            this.data = data;
            this.next = null;
        }
    }
    class Queue {
        constructor() {
            this.a = null;
            this.b = null;
        }
        length() {
            let result = 0;
            let current = this.a;
            while (current) {
                current = current.next;
                result++;
            }
            return result;
        }
        peek() {
            if (!this.a) {
                return null;
            }
            return this.a.data;
        }
        toArray() {
            const result = [];
            let resultLen = 0;
            let it = this.a;
            while (it) {
                result[resultLen++] = it.data;
                it = it.next;
            }
            return result;
        }
        pop() {
            if (!this.a) {
                return;
            }
            if (this.a === this.b) {
                this.a = null;
                this.b = null;
                return;
            }
            this.a = this.a.next;
        }
        push(item) {
            const element = new QueueElement(item);
            if (!this.a) {
                this.a = element;
                this.b = element;
                return;
            }
            this.b.next = element;
            this.b = element;
        }
    }
    class LoadEstimator {
        static { this.a = 10; }
        static { this.b = null; }
        static getInstance() {
            if (!LoadEstimator.b) {
                LoadEstimator.b = new LoadEstimator();
            }
            return LoadEstimator.b;
        }
        constructor() {
            this.c = [];
            const now = Date.now();
            for (let i = 0; i < LoadEstimator.a; i++) {
                this.c[i] = now - 1000 * i;
            }
            setInterval(() => {
                for (let i = LoadEstimator.a; i >= 1; i--) {
                    this.c[i] = this.c[i - 1];
                }
                this.c[0] = Date.now();
            }, 1000);
        }
        /**
         * returns an estimative number, from 0 (low load) to 1 (high load)
         */
        d() {
            const now = Date.now();
            const historyLimit = (1 + LoadEstimator.a) * 1000;
            let score = 0;
            for (let i = 0; i < LoadEstimator.a; i++) {
                if (now - this.c[i] <= historyLimit) {
                    score++;
                }
            }
            return 1 - score / LoadEstimator.a;
        }
        hasHighLoad() {
            return this.d() >= 0.5;
        }
    }
    /**
     * Same as Protocol, but will actually track messages and acks.
     * Moreover, it will ensure no messages are lost if there are no event listeners.
     */
    class $ph {
        get unacknowledgedCount() {
            return this.c - this.d;
        }
        constructor(opts) {
            this.u = new $oh();
            this.onControlMessage = this.u.event;
            this.v = new $oh();
            this.onMessage = this.v.event;
            this.w = new $oh();
            this.onDidDispose = this.w.event;
            this.x = new $oh();
            this.onSocketClose = this.x.event;
            this.y = new $oh();
            this.onSocketTimeout = this.y.event;
            this.s = opts.loadEstimator ?? LoadEstimator.getInstance();
            this.t = opts.sendKeepAlive ?? true;
            this.a = false;
            this.b = new Queue();
            this.c = 0;
            this.d = 0;
            this.f = null;
            this.g = 0;
            this.h = 0;
            this.j = 0;
            this.k = null;
            this.m = 0;
            this.n = Date.now();
            this.r = new lifecycle_1.$jc();
            this.o = opts.socket;
            this.p = this.r.add(new ProtocolWriter(this.o));
            this.q = this.r.add(new ProtocolReader(this.o));
            this.r.add(this.q.onMessage(msg => this.z(msg)));
            this.r.add(this.o.onClose(e => this.x.fire(e)));
            if (opts.initialChunk) {
                this.q.acceptChunk(opts.initialChunk);
            }
            if (this.t) {
                this.l = setInterval(() => {
                    this.D();
                }, 5000 /* ProtocolConstants.KeepAliveSendTime */);
            }
            else {
                this.l = null;
            }
        }
        dispose() {
            if (this.f) {
                clearTimeout(this.f);
                this.f = null;
            }
            if (this.k) {
                clearTimeout(this.k);
                this.k = null;
            }
            if (this.l) {
                clearInterval(this.l);
                this.l = null;
            }
            this.r.dispose();
        }
        drain() {
            return this.p.drain();
        }
        sendDisconnect() {
            const msg = new ProtocolMessage(5 /* ProtocolMessageType.Disconnect */, 0, 0, getEmptyBuffer());
            this.p.write(msg);
            this.p.flush();
        }
        sendPause() {
            const msg = new ProtocolMessage(7 /* ProtocolMessageType.Pause */, 0, 0, getEmptyBuffer());
            this.p.write(msg);
        }
        sendResume() {
            const msg = new ProtocolMessage(8 /* ProtocolMessageType.Resume */, 0, 0, getEmptyBuffer());
            this.p.write(msg);
        }
        pauseSocketWriting() {
            this.p.pause();
        }
        getSocket() {
            return this.o;
        }
        getMillisSinceLastIncomingData() {
            return Date.now() - this.q.lastReadTime;
        }
        beginAcceptReconnection(socket, initialDataChunk) {
            this.a = true;
            this.r.dispose();
            this.r = new lifecycle_1.$jc();
            this.u.flushBuffer();
            this.x.flushBuffer();
            this.y.flushBuffer();
            this.o.dispose();
            this.m = 0;
            this.n = Date.now();
            this.o = socket;
            this.p = this.r.add(new ProtocolWriter(this.o));
            this.q = this.r.add(new ProtocolReader(this.o));
            this.r.add(this.q.onMessage(msg => this.z(msg)));
            this.r.add(this.o.onClose(e => this.x.fire(e)));
            this.q.acceptChunk(initialDataChunk);
        }
        endAcceptReconnection() {
            this.a = false;
            // After a reconnection, let the other party know (again) which messages have been received.
            // (perhaps the other party didn't receive a previous ACK)
            this.h = this.g;
            const msg = new ProtocolMessage(3 /* ProtocolMessageType.Ack */, 0, this.h, getEmptyBuffer());
            this.p.write(msg);
            // Send again all unacknowledged messages
            const toSend = this.b.toArray();
            for (let i = 0, len = toSend.length; i < len; i++) {
                this.p.write(toSend[i]);
            }
            this.B();
        }
        acceptDisconnect() {
            this.w.fire();
        }
        z(msg) {
            if (msg.ack > this.d) {
                this.d = msg.ack;
                do {
                    const first = this.b.peek();
                    if (first && first.id <= msg.ack) {
                        // this message has been confirmed, remove it
                        this.b.pop();
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
                    if (msg.id > this.g) {
                        if (msg.id !== this.g + 1) {
                            // in case we missed some messages we ask the other party to resend them
                            const now = Date.now();
                            if (now - this.m > 10000) {
                                // send a replay request at most once every 10s
                                this.m = now;
                                this.p.write(new ProtocolMessage(6 /* ProtocolMessageType.ReplayRequest */, 0, 0, getEmptyBuffer()));
                            }
                        }
                        else {
                            this.g = msg.id;
                            this.j = Date.now();
                            this.A();
                            this.v.fire(msg.data);
                        }
                    }
                    break;
                }
                case 2 /* ProtocolMessageType.Control */: {
                    this.u.fire(msg.data);
                    break;
                }
                case 3 /* ProtocolMessageType.Ack */: {
                    // nothing to do, .ack is handled above already
                    break;
                }
                case 5 /* ProtocolMessageType.Disconnect */: {
                    this.w.fire();
                    break;
                }
                case 6 /* ProtocolMessageType.ReplayRequest */: {
                    // Send again all unacknowledged messages
                    const toSend = this.b.toArray();
                    for (let i = 0, len = toSend.length; i < len; i++) {
                        this.p.write(toSend[i]);
                    }
                    this.B();
                    break;
                }
                case 7 /* ProtocolMessageType.Pause */: {
                    this.p.pause();
                    break;
                }
                case 8 /* ProtocolMessageType.Resume */: {
                    this.p.resume();
                    break;
                }
                case 9 /* ProtocolMessageType.KeepAlive */: {
                    // nothing to do
                    break;
                }
            }
        }
        readEntireBuffer() {
            return this.q.readEntireBuffer();
        }
        flush() {
            this.p.flush();
        }
        send(buffer) {
            const myId = ++this.c;
            this.h = this.g;
            const msg = new ProtocolMessage(1 /* ProtocolMessageType.Regular */, myId, this.h, buffer);
            this.b.push(msg);
            if (!this.a) {
                this.p.write(msg);
                this.B();
            }
        }
        /**
         * Send a message which will not be part of the regular acknowledge flow.
         * Use this for early control messages which are repeated in case of reconnection.
         */
        sendControl(buffer) {
            const msg = new ProtocolMessage(2 /* ProtocolMessageType.Control */, 0, 0, buffer);
            this.p.write(msg);
        }
        A() {
            if (this.g <= this.h) {
                // nothink to acknowledge
                return;
            }
            if (this.k) {
                // there will be a check in the near future
                return;
            }
            const timeSinceLastIncomingMsg = Date.now() - this.j;
            if (timeSinceLastIncomingMsg >= 2000 /* ProtocolConstants.AcknowledgeTime */) {
                // sufficient time has passed since this message has been received,
                // and no message from our side needed to be sent in the meantime,
                // so we will send a message containing only an ack.
                this.C();
                return;
            }
            this.k = setTimeout(() => {
                this.k = null;
                this.A();
            }, 2000 /* ProtocolConstants.AcknowledgeTime */ - timeSinceLastIncomingMsg + 5);
        }
        B() {
            if (this.c <= this.d) {
                // everything has been acknowledged
                return;
            }
            if (this.f) {
                // there will be a check in the near future
                return;
            }
            if (this.a) {
                // do not cause a timeout during reconnection,
                // because messages will not be actually written until `endAcceptReconnection`
                return;
            }
            const oldestUnacknowledgedMsg = this.b.peek();
            const timeSinceOldestUnacknowledgedMsg = Date.now() - oldestUnacknowledgedMsg.writtenTime;
            const timeSinceLastReceivedSomeData = Date.now() - this.q.lastReadTime;
            const timeSinceLastTimeout = Date.now() - this.n;
            if (timeSinceOldestUnacknowledgedMsg >= 20000 /* ProtocolConstants.TimeoutTime */
                && timeSinceLastReceivedSomeData >= 20000 /* ProtocolConstants.TimeoutTime */
                && timeSinceLastTimeout >= 20000 /* ProtocolConstants.TimeoutTime */) {
                // It's been a long time since our sent message was acknowledged
                // and a long time since we received some data
                // But this might be caused by the event loop being busy and failing to read messages
                if (!this.s.hasHighLoad()) {
                    // Trash the socket
                    this.n = Date.now();
                    this.y.fire({
                        unacknowledgedMsgCount: this.b.length(),
                        timeSinceOldestUnacknowledgedMsg,
                        timeSinceLastReceivedSomeData
                    });
                    return;
                }
            }
            const minimumTimeUntilTimeout = Math.max(20000 /* ProtocolConstants.TimeoutTime */ - timeSinceOldestUnacknowledgedMsg, 20000 /* ProtocolConstants.TimeoutTime */ - timeSinceLastReceivedSomeData, 20000 /* ProtocolConstants.TimeoutTime */ - timeSinceLastTimeout, 500);
            this.f = setTimeout(() => {
                this.f = null;
                this.B();
            }, minimumTimeUntilTimeout);
        }
        C() {
            if (this.g <= this.h) {
                // nothink to acknowledge
                return;
            }
            this.h = this.g;
            const msg = new ProtocolMessage(3 /* ProtocolMessageType.Ack */, 0, this.h, getEmptyBuffer());
            this.p.write(msg);
        }
        D() {
            this.h = this.g;
            const msg = new ProtocolMessage(9 /* ProtocolMessageType.KeepAlive */, 0, this.h, getEmptyBuffer());
            this.p.write(msg);
        }
    }
    exports.$ph = $ph;
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
//# sourceMappingURL=ipc.net.js.map