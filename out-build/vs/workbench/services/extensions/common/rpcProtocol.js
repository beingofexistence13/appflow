/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uriIpc", "vs/workbench/services/extensions/common/lazyPromise", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, async_1, buffer_1, cancellation_1, errors, event_1, lifecycle_1, uriIpc_1, lazyPromise_1, proxyIdentifier_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H3b = exports.ResponsiveState = exports.RequestInitiator = exports.$G3b = exports.$F3b = void 0;
    function safeStringify(obj, replacer) {
        try {
            return JSON.stringify(obj, replacer);
        }
        catch (err) {
            return 'null';
        }
    }
    const refSymbolName = '$$ref$$';
    const undefinedRef = { [refSymbolName]: -1 };
    class StringifiedJsonWithBufferRefs {
        constructor(jsonString, referencedBuffers) {
            this.jsonString = jsonString;
            this.referencedBuffers = referencedBuffers;
        }
    }
    function $F3b(obj, replacer = null, useSafeStringify = false) {
        const foundBuffers = [];
        const serialized = (useSafeStringify ? safeStringify : JSON.stringify)(obj, (key, value) => {
            if (typeof value === 'undefined') {
                return undefinedRef; // JSON.stringify normally converts 'undefined' to 'null'
            }
            else if (typeof value === 'object') {
                if (value instanceof buffer_1.$Fd) {
                    const bufferIndex = foundBuffers.push(value) - 1;
                    return { [refSymbolName]: bufferIndex };
                }
                if (replacer) {
                    return replacer(key, value);
                }
            }
            return value;
        });
        return {
            jsonString: serialized,
            referencedBuffers: foundBuffers
        };
    }
    exports.$F3b = $F3b;
    function $G3b(jsonString, buffers, uriTransformer) {
        return JSON.parse(jsonString, (_key, value) => {
            if (value) {
                const ref = value[refSymbolName];
                if (typeof ref === 'number') {
                    return buffers[ref];
                }
                if (uriTransformer && value.$mid === 1 /* MarshalledId.Uri */) {
                    return uriTransformer.transformIncoming(value);
                }
            }
            return value;
        });
    }
    exports.$G3b = $G3b;
    function stringify(obj, replacer) {
        return JSON.stringify(obj, replacer);
    }
    function createURIReplacer(transformer) {
        if (!transformer) {
            return null;
        }
        return (key, value) => {
            if (value && value.$mid === 1 /* MarshalledId.Uri */) {
                return transformer.transformOutgoing(value);
            }
            return value;
        };
    }
    var RequestInitiator;
    (function (RequestInitiator) {
        RequestInitiator[RequestInitiator["LocalSide"] = 0] = "LocalSide";
        RequestInitiator[RequestInitiator["OtherSide"] = 1] = "OtherSide";
    })(RequestInitiator || (exports.RequestInitiator = RequestInitiator = {}));
    var ResponsiveState;
    (function (ResponsiveState) {
        ResponsiveState[ResponsiveState["Responsive"] = 0] = "Responsive";
        ResponsiveState[ResponsiveState["Unresponsive"] = 1] = "Unresponsive";
    })(ResponsiveState || (exports.ResponsiveState = ResponsiveState = {}));
    const noop = () => { };
    const _RPCProtocolSymbol = Symbol.for('rpcProtocol');
    const _RPCProxySymbol = Symbol.for('rpcProxy');
    class $H3b extends lifecycle_1.$kc {
        static { _a = _RPCProtocolSymbol; }
        static { this.a = 3 * 1000; } // 3s
        constructor(protocol, logger = null, transformer = null) {
            super();
            this[_a] = true;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeResponsiveState = this.b.event;
            this.c = protocol;
            this.f = logger;
            this.g = transformer;
            this.h = createURIReplacer(this.g);
            this.j = false;
            this.m = [];
            this.s = [];
            for (let i = 0, len = proxyIdentifier_1.$aA.count; i < len; i++) {
                this.m[i] = null;
                this.s[i] = null;
            }
            this.t = 0;
            this.u = Object.create(null);
            this.w = {};
            this.y = 0 /* ResponsiveState.Responsive */;
            this.z = 0;
            this.C = 0;
            this.D = this.B(new async_1.$Sg(() => this.H(), 1000));
            this.c.onMessage((msg) => this.L(msg));
        }
        dispose() {
            this.j = true;
            // Release all outstanding promises with a canceled error
            Object.keys(this.w).forEach((msgId) => {
                const pending = this.w[msgId];
                delete this.w[msgId];
                pending.resolveErr(errors.$4());
            });
        }
        drain() {
            if (typeof this.c.drain === 'function') {
                return this.c.drain();
            }
            return Promise.resolve();
        }
        F(req) {
            if (this.z === 0) {
                // Since this is the first request we are sending in a while,
                // mark this moment as the start for the countdown to unresponsive time
                this.C = Date.now() + $H3b.a;
            }
            this.z++;
            if (!this.D.isScheduled()) {
                this.D.schedule();
            }
        }
        G(req) {
            // The next possible unresponsive time is now + delta.
            this.C = Date.now() + $H3b.a;
            this.z--;
            if (this.z === 0) {
                // No more need to check for unresponsive
                this.D.cancel();
            }
            // The ext host is responsive!
            this.I(0 /* ResponsiveState.Responsive */);
        }
        H() {
            if (this.z === 0) {
                // Not waiting for anything => cannot say if it is responsive or not
                return;
            }
            if (Date.now() > this.C) {
                // Unresponsive!!
                this.I(1 /* ResponsiveState.Unresponsive */);
            }
            else {
                // Not (yet) unresponsive, be sure to check again soon
                this.D.schedule();
            }
        }
        I(newResponsiveState) {
            if (this.y === newResponsiveState) {
                // no change
                return;
            }
            this.y = newResponsiveState;
            this.b.fire(this.y);
        }
        get responsiveState() {
            return this.y;
        }
        transformIncomingURIs(obj) {
            if (!this.g) {
                return obj;
            }
            return (0, uriIpc_1.$Em)(obj, this.g);
        }
        getProxy(identifier) {
            const { nid: rpcId, sid } = identifier;
            if (!this.s[rpcId]) {
                this.s[rpcId] = this.J(rpcId, sid);
            }
            return this.s[rpcId];
        }
        J(rpcId, debugName) {
            const handler = {
                get: (target, name) => {
                    if (typeof name === 'string' && !target[name] && name.charCodeAt(0) === 36 /* CharCode.DollarSign */) {
                        target[name] = (...myArgs) => {
                            return this.U(rpcId, name, myArgs);
                        };
                    }
                    if (name === _RPCProxySymbol) {
                        return debugName;
                    }
                    return target[name];
                }
            };
            return new Proxy(Object.create(null), handler);
        }
        set(identifier, value) {
            this.m[identifier.nid] = value;
            return value;
        }
        assertRegistered(identifiers) {
            for (let i = 0, len = identifiers.length; i < len; i++) {
                const identifier = identifiers[i];
                if (!this.m[identifier.nid]) {
                    throw new Error(`Missing proxy instance ${identifier.sid}`);
                }
            }
        }
        L(rawmsg) {
            if (this.j) {
                return;
            }
            const msgLength = rawmsg.byteLength;
            const buff = MessageBuffer.read(rawmsg, 0);
            const messageType = buff.readUInt8();
            const req = buff.readUInt32();
            switch (messageType) {
                case 1 /* MessageType.RequestJSONArgs */:
                case 2 /* MessageType.RequestJSONArgsWithCancellation */: {
                    let { rpcId, method, args } = MessageIO.deserializeRequestJSONArgs(buff);
                    if (this.g) {
                        args = (0, uriIpc_1.$Em)(args, this.g);
                    }
                    this.M(msgLength, req, rpcId, method, args, (messageType === 2 /* MessageType.RequestJSONArgsWithCancellation */));
                    break;
                }
                case 3 /* MessageType.RequestMixedArgs */:
                case 4 /* MessageType.RequestMixedArgsWithCancellation */: {
                    let { rpcId, method, args } = MessageIO.deserializeRequestMixedArgs(buff);
                    if (this.g) {
                        args = (0, uriIpc_1.$Em)(args, this.g);
                    }
                    this.M(msgLength, req, rpcId, method, args, (messageType === 4 /* MessageType.RequestMixedArgsWithCancellation */));
                    break;
                }
                case 5 /* MessageType.Acknowledged */: {
                    this.f?.logIncoming(msgLength, req, 0 /* RequestInitiator.LocalSide */, `ack`);
                    this.G(req);
                    break;
                }
                case 6 /* MessageType.Cancel */: {
                    this.N(msgLength, req);
                    break;
                }
                case 7 /* MessageType.ReplyOKEmpty */: {
                    this.O(msgLength, req, undefined);
                    break;
                }
                case 9 /* MessageType.ReplyOKJSON */: {
                    let value = MessageIO.deserializeReplyOKJSON(buff);
                    if (this.g) {
                        value = (0, uriIpc_1.$Em)(value, this.g);
                    }
                    this.O(msgLength, req, value);
                    break;
                }
                case 10 /* MessageType.ReplyOKJSONWithBuffers */: {
                    const value = MessageIO.deserializeReplyOKJSONWithBuffers(buff, this.g);
                    this.O(msgLength, req, value);
                    break;
                }
                case 8 /* MessageType.ReplyOKVSBuffer */: {
                    const value = MessageIO.deserializeReplyOKVSBuffer(buff);
                    this.O(msgLength, req, value);
                    break;
                }
                case 11 /* MessageType.ReplyErrError */: {
                    let err = MessageIO.deserializeReplyErrError(buff);
                    if (this.g) {
                        err = (0, uriIpc_1.$Em)(err, this.g);
                    }
                    this.P(msgLength, req, err);
                    break;
                }
                case 12 /* MessageType.ReplyErrEmpty */: {
                    this.P(msgLength, req, undefined);
                    break;
                }
                default:
                    console.error(`received unexpected message`);
                    console.error(rawmsg);
            }
        }
        M(msgLength, req, rpcId, method, args, usesCancellationToken) {
            this.f?.logIncoming(msgLength, req, 1 /* RequestInitiator.OtherSide */, `receiveRequest ${(0, proxyIdentifier_1.$cA)(rpcId)}.${method}(`, args);
            const callId = String(req);
            let promise;
            let cancel;
            if (usesCancellationToken) {
                const cancellationTokenSource = new cancellation_1.$pd();
                args.push(cancellationTokenSource.token);
                promise = this.Q(rpcId, method, args);
                cancel = () => cancellationTokenSource.cancel();
            }
            else {
                // cannot be cancelled
                promise = this.Q(rpcId, method, args);
                cancel = noop;
            }
            this.u[callId] = cancel;
            // Acknowledge the request
            const msg = MessageIO.serializeAcknowledged(req);
            this.f?.logOutgoing(msg.byteLength, req, 1 /* RequestInitiator.OtherSide */, `ack`);
            this.c.send(msg);
            promise.then((r) => {
                delete this.u[callId];
                const msg = MessageIO.serializeReplyOK(req, r, this.h);
                this.f?.logOutgoing(msg.byteLength, req, 1 /* RequestInitiator.OtherSide */, `reply:`, r);
                this.c.send(msg);
            }, (err) => {
                delete this.u[callId];
                const msg = MessageIO.serializeReplyErr(req, err);
                this.f?.logOutgoing(msg.byteLength, req, 1 /* RequestInitiator.OtherSide */, `replyErr:`, err);
                this.c.send(msg);
            });
        }
        N(msgLength, req) {
            this.f?.logIncoming(msgLength, req, 1 /* RequestInitiator.OtherSide */, `receiveCancel`);
            const callId = String(req);
            this.u[callId]?.();
        }
        O(msgLength, req, value) {
            this.f?.logIncoming(msgLength, req, 0 /* RequestInitiator.LocalSide */, `receiveReply:`, value);
            const callId = String(req);
            if (!this.w.hasOwnProperty(callId)) {
                return;
            }
            const pendingReply = this.w[callId];
            delete this.w[callId];
            pendingReply.resolveOk(value);
        }
        P(msgLength, req, value) {
            this.f?.logIncoming(msgLength, req, 0 /* RequestInitiator.LocalSide */, `receiveReplyErr:`, value);
            const callId = String(req);
            if (!this.w.hasOwnProperty(callId)) {
                return;
            }
            const pendingReply = this.w[callId];
            delete this.w[callId];
            let err = undefined;
            if (value) {
                if (value.$isError) {
                    err = new Error();
                    err.name = value.name;
                    err.message = value.message;
                    err.stack = value.stack;
                }
                else {
                    err = value;
                }
            }
            pendingReply.resolveErr(err);
        }
        Q(rpcId, methodName, args) {
            try {
                return Promise.resolve(this.S(rpcId, methodName, args));
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        S(rpcId, methodName, args) {
            const actor = this.m[rpcId];
            if (!actor) {
                throw new Error('Unknown actor ' + (0, proxyIdentifier_1.$cA)(rpcId));
            }
            const method = actor[methodName];
            if (typeof method !== 'function') {
                throw new Error('Unknown method ' + methodName + ' on actor ' + (0, proxyIdentifier_1.$cA)(rpcId));
            }
            return method.apply(actor, args);
        }
        U(rpcId, methodName, args) {
            if (this.j) {
                return new lazyPromise_1.$E3b();
            }
            let cancellationToken = null;
            if (args.length > 0 && cancellation_1.CancellationToken.isCancellationToken(args[args.length - 1])) {
                cancellationToken = args.pop();
            }
            if (cancellationToken && cancellationToken.isCancellationRequested) {
                // No need to do anything...
                return Promise.reject(errors.$4());
            }
            const serializedRequestArguments = MessageIO.serializeRequestArguments(args, this.h);
            const req = ++this.t;
            const callId = String(req);
            const result = new lazyPromise_1.$D3b();
            const disposable = new lifecycle_1.$jc();
            if (cancellationToken) {
                disposable.add(cancellationToken.onCancellationRequested(() => {
                    const msg = MessageIO.serializeCancel(req);
                    this.f?.logOutgoing(msg.byteLength, req, 0 /* RequestInitiator.LocalSide */, `cancel`);
                    this.c.send(MessageIO.serializeCancel(req));
                }));
            }
            this.w[callId] = new PendingRPCReply(result, disposable);
            this.F(req);
            const msg = MessageIO.serializeRequest(req, rpcId, methodName, serializedRequestArguments, !!cancellationToken);
            this.f?.logOutgoing(msg.byteLength, req, 0 /* RequestInitiator.LocalSide */, `request: ${(0, proxyIdentifier_1.$cA)(rpcId)}.${methodName}(`, args);
            this.c.send(msg);
            return result;
        }
    }
    exports.$H3b = $H3b;
    class PendingRPCReply {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        resolveOk(value) {
            this.a.resolveOk(value);
            this.b.dispose();
        }
        resolveErr(err) {
            this.a.resolveErr(err);
            this.b.dispose();
        }
    }
    class MessageBuffer {
        static alloc(type, req, messageSize) {
            const result = new MessageBuffer(buffer_1.$Fd.alloc(messageSize + 1 /* type */ + 4 /* req */), 0);
            result.writeUInt8(type);
            result.writeUInt32(req);
            return result;
        }
        static read(buff, offset) {
            return new MessageBuffer(buff, offset);
        }
        get buffer() {
            return this.a;
        }
        constructor(buff, offset) {
            this.a = buff;
            this.b = offset;
        }
        static sizeUInt8() {
            return 1;
        }
        static { this.sizeUInt32 = 4; }
        writeUInt8(n) {
            this.a.writeUInt8(n, this.b);
            this.b += 1;
        }
        readUInt8() {
            const n = this.a.readUInt8(this.b);
            this.b += 1;
            return n;
        }
        writeUInt32(n) {
            this.a.writeUInt32BE(n, this.b);
            this.b += 4;
        }
        readUInt32() {
            const n = this.a.readUInt32BE(this.b);
            this.b += 4;
            return n;
        }
        static sizeShortString(str) {
            return 1 /* string length */ + str.byteLength /* actual string */;
        }
        writeShortString(str) {
            this.a.writeUInt8(str.byteLength, this.b);
            this.b += 1;
            this.a.set(str, this.b);
            this.b += str.byteLength;
        }
        readShortString() {
            const strByteLength = this.a.readUInt8(this.b);
            this.b += 1;
            const strBuff = this.a.slice(this.b, this.b + strByteLength);
            const str = strBuff.toString();
            this.b += strByteLength;
            return str;
        }
        static sizeLongString(str) {
            return 4 /* string length */ + str.byteLength /* actual string */;
        }
        writeLongString(str) {
            this.a.writeUInt32BE(str.byteLength, this.b);
            this.b += 4;
            this.a.set(str, this.b);
            this.b += str.byteLength;
        }
        readLongString() {
            const strByteLength = this.a.readUInt32BE(this.b);
            this.b += 4;
            const strBuff = this.a.slice(this.b, this.b + strByteLength);
            const str = strBuff.toString();
            this.b += strByteLength;
            return str;
        }
        writeBuffer(buff) {
            this.a.writeUInt32BE(buff.byteLength, this.b);
            this.b += 4;
            this.a.set(buff, this.b);
            this.b += buff.byteLength;
        }
        static sizeVSBuffer(buff) {
            return 4 /* buffer length */ + buff.byteLength /* actual buffer */;
        }
        writeVSBuffer(buff) {
            this.a.writeUInt32BE(buff.byteLength, this.b);
            this.b += 4;
            this.a.set(buff, this.b);
            this.b += buff.byteLength;
        }
        readVSBuffer() {
            const buffLength = this.a.readUInt32BE(this.b);
            this.b += 4;
            const buff = this.a.slice(this.b, this.b + buffLength);
            this.b += buffLength;
            return buff;
        }
        static sizeMixedArray(arr) {
            let size = 0;
            size += 1; // arr length
            for (let i = 0, len = arr.length; i < len; i++) {
                const el = arr[i];
                size += 1; // arg type
                switch (el.type) {
                    case 1 /* ArgType.String */:
                        size += this.sizeLongString(el.value);
                        break;
                    case 2 /* ArgType.VSBuffer */:
                        size += this.sizeVSBuffer(el.value);
                        break;
                    case 3 /* ArgType.SerializedObjectWithBuffers */:
                        size += this.sizeUInt32; // buffer count
                        size += this.sizeLongString(el.value);
                        for (let i = 0; i < el.buffers.length; ++i) {
                            size += this.sizeVSBuffer(el.buffers[i]);
                        }
                        break;
                    case 4 /* ArgType.Undefined */:
                        // empty...
                        break;
                }
            }
            return size;
        }
        writeMixedArray(arr) {
            this.a.writeUInt8(arr.length, this.b);
            this.b += 1;
            for (let i = 0, len = arr.length; i < len; i++) {
                const el = arr[i];
                switch (el.type) {
                    case 1 /* ArgType.String */:
                        this.writeUInt8(1 /* ArgType.String */);
                        this.writeLongString(el.value);
                        break;
                    case 2 /* ArgType.VSBuffer */:
                        this.writeUInt8(2 /* ArgType.VSBuffer */);
                        this.writeVSBuffer(el.value);
                        break;
                    case 3 /* ArgType.SerializedObjectWithBuffers */:
                        this.writeUInt8(3 /* ArgType.SerializedObjectWithBuffers */);
                        this.writeUInt32(el.buffers.length);
                        this.writeLongString(el.value);
                        for (let i = 0; i < el.buffers.length; ++i) {
                            this.writeBuffer(el.buffers[i]);
                        }
                        break;
                    case 4 /* ArgType.Undefined */:
                        this.writeUInt8(4 /* ArgType.Undefined */);
                        break;
                }
            }
        }
        readMixedArray() {
            const arrLen = this.a.readUInt8(this.b);
            this.b += 1;
            const arr = new Array(arrLen);
            for (let i = 0; i < arrLen; i++) {
                const argType = this.readUInt8();
                switch (argType) {
                    case 1 /* ArgType.String */:
                        arr[i] = this.readLongString();
                        break;
                    case 2 /* ArgType.VSBuffer */:
                        arr[i] = this.readVSBuffer();
                        break;
                    case 3 /* ArgType.SerializedObjectWithBuffers */: {
                        const bufferCount = this.readUInt32();
                        const jsonString = this.readLongString();
                        const buffers = [];
                        for (let i = 0; i < bufferCount; ++i) {
                            buffers.push(this.readVSBuffer());
                        }
                        arr[i] = new proxyIdentifier_1.$dA($G3b(jsonString, buffers, null));
                        break;
                    }
                    case 4 /* ArgType.Undefined */:
                        arr[i] = undefined;
                        break;
                }
            }
            return arr;
        }
    }
    var SerializedRequestArgumentType;
    (function (SerializedRequestArgumentType) {
        SerializedRequestArgumentType[SerializedRequestArgumentType["Simple"] = 0] = "Simple";
        SerializedRequestArgumentType[SerializedRequestArgumentType["Mixed"] = 1] = "Mixed";
    })(SerializedRequestArgumentType || (SerializedRequestArgumentType = {}));
    class MessageIO {
        static a(arr) {
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i] instanceof buffer_1.$Fd) {
                    return true;
                }
                if (arr[i] instanceof proxyIdentifier_1.$dA) {
                    return true;
                }
                if (typeof arr[i] === 'undefined') {
                    return true;
                }
            }
            return false;
        }
        static serializeRequestArguments(args, replacer) {
            if (this.a(args)) {
                const massagedArgs = [];
                for (let i = 0, len = args.length; i < len; i++) {
                    const arg = args[i];
                    if (arg instanceof buffer_1.$Fd) {
                        massagedArgs[i] = { type: 2 /* ArgType.VSBuffer */, value: arg };
                    }
                    else if (typeof arg === 'undefined') {
                        massagedArgs[i] = { type: 4 /* ArgType.Undefined */ };
                    }
                    else if (arg instanceof proxyIdentifier_1.$dA) {
                        const { jsonString, referencedBuffers } = $F3b(arg.value, replacer);
                        massagedArgs[i] = { type: 3 /* ArgType.SerializedObjectWithBuffers */, value: buffer_1.$Fd.fromString(jsonString), buffers: referencedBuffers };
                    }
                    else {
                        massagedArgs[i] = { type: 1 /* ArgType.String */, value: buffer_1.$Fd.fromString(stringify(arg, replacer)) };
                    }
                }
                return {
                    type: 1 /* SerializedRequestArgumentType.Mixed */,
                    args: massagedArgs,
                };
            }
            return {
                type: 0 /* SerializedRequestArgumentType.Simple */,
                args: stringify(args, replacer)
            };
        }
        static serializeRequest(req, rpcId, method, serializedArgs, usesCancellationToken) {
            switch (serializedArgs.type) {
                case 0 /* SerializedRequestArgumentType.Simple */:
                    return this.b(req, rpcId, method, serializedArgs.args, usesCancellationToken);
                case 1 /* SerializedRequestArgumentType.Mixed */:
                    return this.c(req, rpcId, method, serializedArgs.args, usesCancellationToken);
            }
        }
        static b(req, rpcId, method, args, usesCancellationToken) {
            const methodBuff = buffer_1.$Fd.fromString(method);
            const argsBuff = buffer_1.$Fd.fromString(args);
            let len = 0;
            len += MessageBuffer.sizeUInt8();
            len += MessageBuffer.sizeShortString(methodBuff);
            len += MessageBuffer.sizeLongString(argsBuff);
            const result = MessageBuffer.alloc(usesCancellationToken ? 2 /* MessageType.RequestJSONArgsWithCancellation */ : 1 /* MessageType.RequestJSONArgs */, req, len);
            result.writeUInt8(rpcId);
            result.writeShortString(methodBuff);
            result.writeLongString(argsBuff);
            return result.buffer;
        }
        static deserializeRequestJSONArgs(buff) {
            const rpcId = buff.readUInt8();
            const method = buff.readShortString();
            const args = buff.readLongString();
            return {
                rpcId: rpcId,
                method: method,
                args: JSON.parse(args)
            };
        }
        static c(req, rpcId, method, args, usesCancellationToken) {
            const methodBuff = buffer_1.$Fd.fromString(method);
            let len = 0;
            len += MessageBuffer.sizeUInt8();
            len += MessageBuffer.sizeShortString(methodBuff);
            len += MessageBuffer.sizeMixedArray(args);
            const result = MessageBuffer.alloc(usesCancellationToken ? 4 /* MessageType.RequestMixedArgsWithCancellation */ : 3 /* MessageType.RequestMixedArgs */, req, len);
            result.writeUInt8(rpcId);
            result.writeShortString(methodBuff);
            result.writeMixedArray(args);
            return result.buffer;
        }
        static deserializeRequestMixedArgs(buff) {
            const rpcId = buff.readUInt8();
            const method = buff.readShortString();
            const rawargs = buff.readMixedArray();
            const args = new Array(rawargs.length);
            for (let i = 0, len = rawargs.length; i < len; i++) {
                const rawarg = rawargs[i];
                if (typeof rawarg === 'string') {
                    args[i] = JSON.parse(rawarg);
                }
                else {
                    args[i] = rawarg;
                }
            }
            return {
                rpcId: rpcId,
                method: method,
                args: args
            };
        }
        static serializeAcknowledged(req) {
            return MessageBuffer.alloc(5 /* MessageType.Acknowledged */, req, 0).buffer;
        }
        static serializeCancel(req) {
            return MessageBuffer.alloc(6 /* MessageType.Cancel */, req, 0).buffer;
        }
        static serializeReplyOK(req, res, replacer) {
            if (typeof res === 'undefined') {
                return this.d(req);
            }
            else if (res instanceof buffer_1.$Fd) {
                return this.e(req, res);
            }
            else if (res instanceof proxyIdentifier_1.$dA) {
                const { jsonString, referencedBuffers } = $F3b(res.value, replacer, true);
                return this.g(req, jsonString, referencedBuffers);
            }
            else {
                return this.f(req, safeStringify(res, replacer));
            }
        }
        static d(req) {
            return MessageBuffer.alloc(7 /* MessageType.ReplyOKEmpty */, req, 0).buffer;
        }
        static e(req, res) {
            let len = 0;
            len += MessageBuffer.sizeVSBuffer(res);
            const result = MessageBuffer.alloc(8 /* MessageType.ReplyOKVSBuffer */, req, len);
            result.writeVSBuffer(res);
            return result.buffer;
        }
        static deserializeReplyOKVSBuffer(buff) {
            return buff.readVSBuffer();
        }
        static f(req, res) {
            const resBuff = buffer_1.$Fd.fromString(res);
            let len = 0;
            len += MessageBuffer.sizeLongString(resBuff);
            const result = MessageBuffer.alloc(9 /* MessageType.ReplyOKJSON */, req, len);
            result.writeLongString(resBuff);
            return result.buffer;
        }
        static g(req, res, buffers) {
            const resBuff = buffer_1.$Fd.fromString(res);
            let len = 0;
            len += MessageBuffer.sizeUInt32; // buffer count
            len += MessageBuffer.sizeLongString(resBuff);
            for (const buffer of buffers) {
                len += MessageBuffer.sizeVSBuffer(buffer);
            }
            const result = MessageBuffer.alloc(10 /* MessageType.ReplyOKJSONWithBuffers */, req, len);
            result.writeUInt32(buffers.length);
            result.writeLongString(resBuff);
            for (const buffer of buffers) {
                result.writeBuffer(buffer);
            }
            return result.buffer;
        }
        static deserializeReplyOKJSON(buff) {
            const res = buff.readLongString();
            return JSON.parse(res);
        }
        static deserializeReplyOKJSONWithBuffers(buff, uriTransformer) {
            const bufferCount = buff.readUInt32();
            const res = buff.readLongString();
            const buffers = [];
            for (let i = 0; i < bufferCount; ++i) {
                buffers.push(buff.readVSBuffer());
            }
            return new proxyIdentifier_1.$dA($G3b(res, buffers, uriTransformer));
        }
        static serializeReplyErr(req, err) {
            const errStr = (err ? safeStringify(errors.$1(err), null) : undefined);
            if (typeof errStr !== 'string') {
                return this.h(req);
            }
            const errBuff = buffer_1.$Fd.fromString(errStr);
            let len = 0;
            len += MessageBuffer.sizeLongString(errBuff);
            const result = MessageBuffer.alloc(11 /* MessageType.ReplyErrError */, req, len);
            result.writeLongString(errBuff);
            return result.buffer;
        }
        static deserializeReplyErrError(buff) {
            const err = buff.readLongString();
            return JSON.parse(err);
        }
        static h(req) {
            return MessageBuffer.alloc(12 /* MessageType.ReplyErrEmpty */, req, 0).buffer;
        }
    }
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["RequestJSONArgs"] = 1] = "RequestJSONArgs";
        MessageType[MessageType["RequestJSONArgsWithCancellation"] = 2] = "RequestJSONArgsWithCancellation";
        MessageType[MessageType["RequestMixedArgs"] = 3] = "RequestMixedArgs";
        MessageType[MessageType["RequestMixedArgsWithCancellation"] = 4] = "RequestMixedArgsWithCancellation";
        MessageType[MessageType["Acknowledged"] = 5] = "Acknowledged";
        MessageType[MessageType["Cancel"] = 6] = "Cancel";
        MessageType[MessageType["ReplyOKEmpty"] = 7] = "ReplyOKEmpty";
        MessageType[MessageType["ReplyOKVSBuffer"] = 8] = "ReplyOKVSBuffer";
        MessageType[MessageType["ReplyOKJSON"] = 9] = "ReplyOKJSON";
        MessageType[MessageType["ReplyOKJSONWithBuffers"] = 10] = "ReplyOKJSONWithBuffers";
        MessageType[MessageType["ReplyErrError"] = 11] = "ReplyErrError";
        MessageType[MessageType["ReplyErrEmpty"] = 12] = "ReplyErrEmpty";
    })(MessageType || (MessageType = {}));
    var ArgType;
    (function (ArgType) {
        ArgType[ArgType["String"] = 1] = "String";
        ArgType[ArgType["VSBuffer"] = 2] = "VSBuffer";
        ArgType[ArgType["SerializedObjectWithBuffers"] = 3] = "SerializedObjectWithBuffers";
        ArgType[ArgType["Undefined"] = 4] = "Undefined";
    })(ArgType || (ArgType = {}));
});
//# sourceMappingURL=rpcProtocol.js.map