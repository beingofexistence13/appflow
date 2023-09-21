/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uriIpc", "vs/workbench/services/extensions/common/lazyPromise", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, async_1, buffer_1, cancellation_1, errors, event_1, lifecycle_1, uriIpc_1, lazyPromise_1, proxyIdentifier_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RPCProtocol = exports.ResponsiveState = exports.RequestInitiator = exports.parseJsonAndRestoreBufferRefs = exports.stringifyJsonWithBufferRefs = void 0;
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
    function stringifyJsonWithBufferRefs(obj, replacer = null, useSafeStringify = false) {
        const foundBuffers = [];
        const serialized = (useSafeStringify ? safeStringify : JSON.stringify)(obj, (key, value) => {
            if (typeof value === 'undefined') {
                return undefinedRef; // JSON.stringify normally converts 'undefined' to 'null'
            }
            else if (typeof value === 'object') {
                if (value instanceof buffer_1.VSBuffer) {
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
    exports.stringifyJsonWithBufferRefs = stringifyJsonWithBufferRefs;
    function parseJsonAndRestoreBufferRefs(jsonString, buffers, uriTransformer) {
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
    exports.parseJsonAndRestoreBufferRefs = parseJsonAndRestoreBufferRefs;
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
    class RPCProtocol extends lifecycle_1.Disposable {
        static { _a = _RPCProtocolSymbol; }
        static { this.UNRESPONSIVE_TIME = 3 * 1000; } // 3s
        constructor(protocol, logger = null, transformer = null) {
            super();
            this[_a] = true;
            this._onDidChangeResponsiveState = this._register(new event_1.Emitter());
            this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
            this._protocol = protocol;
            this._logger = logger;
            this._uriTransformer = transformer;
            this._uriReplacer = createURIReplacer(this._uriTransformer);
            this._isDisposed = false;
            this._locals = [];
            this._proxies = [];
            for (let i = 0, len = proxyIdentifier_1.ProxyIdentifier.count; i < len; i++) {
                this._locals[i] = null;
                this._proxies[i] = null;
            }
            this._lastMessageId = 0;
            this._cancelInvokedHandlers = Object.create(null);
            this._pendingRPCReplies = {};
            this._responsiveState = 0 /* ResponsiveState.Responsive */;
            this._unacknowledgedCount = 0;
            this._unresponsiveTime = 0;
            this._asyncCheckUresponsive = this._register(new async_1.RunOnceScheduler(() => this._checkUnresponsive(), 1000));
            this._protocol.onMessage((msg) => this._receiveOneMessage(msg));
        }
        dispose() {
            this._isDisposed = true;
            // Release all outstanding promises with a canceled error
            Object.keys(this._pendingRPCReplies).forEach((msgId) => {
                const pending = this._pendingRPCReplies[msgId];
                delete this._pendingRPCReplies[msgId];
                pending.resolveErr(errors.canceled());
            });
        }
        drain() {
            if (typeof this._protocol.drain === 'function') {
                return this._protocol.drain();
            }
            return Promise.resolve();
        }
        _onWillSendRequest(req) {
            if (this._unacknowledgedCount === 0) {
                // Since this is the first request we are sending in a while,
                // mark this moment as the start for the countdown to unresponsive time
                this._unresponsiveTime = Date.now() + RPCProtocol.UNRESPONSIVE_TIME;
            }
            this._unacknowledgedCount++;
            if (!this._asyncCheckUresponsive.isScheduled()) {
                this._asyncCheckUresponsive.schedule();
            }
        }
        _onDidReceiveAcknowledge(req) {
            // The next possible unresponsive time is now + delta.
            this._unresponsiveTime = Date.now() + RPCProtocol.UNRESPONSIVE_TIME;
            this._unacknowledgedCount--;
            if (this._unacknowledgedCount === 0) {
                // No more need to check for unresponsive
                this._asyncCheckUresponsive.cancel();
            }
            // The ext host is responsive!
            this._setResponsiveState(0 /* ResponsiveState.Responsive */);
        }
        _checkUnresponsive() {
            if (this._unacknowledgedCount === 0) {
                // Not waiting for anything => cannot say if it is responsive or not
                return;
            }
            if (Date.now() > this._unresponsiveTime) {
                // Unresponsive!!
                this._setResponsiveState(1 /* ResponsiveState.Unresponsive */);
            }
            else {
                // Not (yet) unresponsive, be sure to check again soon
                this._asyncCheckUresponsive.schedule();
            }
        }
        _setResponsiveState(newResponsiveState) {
            if (this._responsiveState === newResponsiveState) {
                // no change
                return;
            }
            this._responsiveState = newResponsiveState;
            this._onDidChangeResponsiveState.fire(this._responsiveState);
        }
        get responsiveState() {
            return this._responsiveState;
        }
        transformIncomingURIs(obj) {
            if (!this._uriTransformer) {
                return obj;
            }
            return (0, uriIpc_1.transformIncomingURIs)(obj, this._uriTransformer);
        }
        getProxy(identifier) {
            const { nid: rpcId, sid } = identifier;
            if (!this._proxies[rpcId]) {
                this._proxies[rpcId] = this._createProxy(rpcId, sid);
            }
            return this._proxies[rpcId];
        }
        _createProxy(rpcId, debugName) {
            const handler = {
                get: (target, name) => {
                    if (typeof name === 'string' && !target[name] && name.charCodeAt(0) === 36 /* CharCode.DollarSign */) {
                        target[name] = (...myArgs) => {
                            return this._remoteCall(rpcId, name, myArgs);
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
            this._locals[identifier.nid] = value;
            return value;
        }
        assertRegistered(identifiers) {
            for (let i = 0, len = identifiers.length; i < len; i++) {
                const identifier = identifiers[i];
                if (!this._locals[identifier.nid]) {
                    throw new Error(`Missing proxy instance ${identifier.sid}`);
                }
            }
        }
        _receiveOneMessage(rawmsg) {
            if (this._isDisposed) {
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
                    if (this._uriTransformer) {
                        args = (0, uriIpc_1.transformIncomingURIs)(args, this._uriTransformer);
                    }
                    this._receiveRequest(msgLength, req, rpcId, method, args, (messageType === 2 /* MessageType.RequestJSONArgsWithCancellation */));
                    break;
                }
                case 3 /* MessageType.RequestMixedArgs */:
                case 4 /* MessageType.RequestMixedArgsWithCancellation */: {
                    let { rpcId, method, args } = MessageIO.deserializeRequestMixedArgs(buff);
                    if (this._uriTransformer) {
                        args = (0, uriIpc_1.transformIncomingURIs)(args, this._uriTransformer);
                    }
                    this._receiveRequest(msgLength, req, rpcId, method, args, (messageType === 4 /* MessageType.RequestMixedArgsWithCancellation */));
                    break;
                }
                case 5 /* MessageType.Acknowledged */: {
                    this._logger?.logIncoming(msgLength, req, 0 /* RequestInitiator.LocalSide */, `ack`);
                    this._onDidReceiveAcknowledge(req);
                    break;
                }
                case 6 /* MessageType.Cancel */: {
                    this._receiveCancel(msgLength, req);
                    break;
                }
                case 7 /* MessageType.ReplyOKEmpty */: {
                    this._receiveReply(msgLength, req, undefined);
                    break;
                }
                case 9 /* MessageType.ReplyOKJSON */: {
                    let value = MessageIO.deserializeReplyOKJSON(buff);
                    if (this._uriTransformer) {
                        value = (0, uriIpc_1.transformIncomingURIs)(value, this._uriTransformer);
                    }
                    this._receiveReply(msgLength, req, value);
                    break;
                }
                case 10 /* MessageType.ReplyOKJSONWithBuffers */: {
                    const value = MessageIO.deserializeReplyOKJSONWithBuffers(buff, this._uriTransformer);
                    this._receiveReply(msgLength, req, value);
                    break;
                }
                case 8 /* MessageType.ReplyOKVSBuffer */: {
                    const value = MessageIO.deserializeReplyOKVSBuffer(buff);
                    this._receiveReply(msgLength, req, value);
                    break;
                }
                case 11 /* MessageType.ReplyErrError */: {
                    let err = MessageIO.deserializeReplyErrError(buff);
                    if (this._uriTransformer) {
                        err = (0, uriIpc_1.transformIncomingURIs)(err, this._uriTransformer);
                    }
                    this._receiveReplyErr(msgLength, req, err);
                    break;
                }
                case 12 /* MessageType.ReplyErrEmpty */: {
                    this._receiveReplyErr(msgLength, req, undefined);
                    break;
                }
                default:
                    console.error(`received unexpected message`);
                    console.error(rawmsg);
            }
        }
        _receiveRequest(msgLength, req, rpcId, method, args, usesCancellationToken) {
            this._logger?.logIncoming(msgLength, req, 1 /* RequestInitiator.OtherSide */, `receiveRequest ${(0, proxyIdentifier_1.getStringIdentifierForProxy)(rpcId)}.${method}(`, args);
            const callId = String(req);
            let promise;
            let cancel;
            if (usesCancellationToken) {
                const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                args.push(cancellationTokenSource.token);
                promise = this._invokeHandler(rpcId, method, args);
                cancel = () => cancellationTokenSource.cancel();
            }
            else {
                // cannot be cancelled
                promise = this._invokeHandler(rpcId, method, args);
                cancel = noop;
            }
            this._cancelInvokedHandlers[callId] = cancel;
            // Acknowledge the request
            const msg = MessageIO.serializeAcknowledged(req);
            this._logger?.logOutgoing(msg.byteLength, req, 1 /* RequestInitiator.OtherSide */, `ack`);
            this._protocol.send(msg);
            promise.then((r) => {
                delete this._cancelInvokedHandlers[callId];
                const msg = MessageIO.serializeReplyOK(req, r, this._uriReplacer);
                this._logger?.logOutgoing(msg.byteLength, req, 1 /* RequestInitiator.OtherSide */, `reply:`, r);
                this._protocol.send(msg);
            }, (err) => {
                delete this._cancelInvokedHandlers[callId];
                const msg = MessageIO.serializeReplyErr(req, err);
                this._logger?.logOutgoing(msg.byteLength, req, 1 /* RequestInitiator.OtherSide */, `replyErr:`, err);
                this._protocol.send(msg);
            });
        }
        _receiveCancel(msgLength, req) {
            this._logger?.logIncoming(msgLength, req, 1 /* RequestInitiator.OtherSide */, `receiveCancel`);
            const callId = String(req);
            this._cancelInvokedHandlers[callId]?.();
        }
        _receiveReply(msgLength, req, value) {
            this._logger?.logIncoming(msgLength, req, 0 /* RequestInitiator.LocalSide */, `receiveReply:`, value);
            const callId = String(req);
            if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
                return;
            }
            const pendingReply = this._pendingRPCReplies[callId];
            delete this._pendingRPCReplies[callId];
            pendingReply.resolveOk(value);
        }
        _receiveReplyErr(msgLength, req, value) {
            this._logger?.logIncoming(msgLength, req, 0 /* RequestInitiator.LocalSide */, `receiveReplyErr:`, value);
            const callId = String(req);
            if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
                return;
            }
            const pendingReply = this._pendingRPCReplies[callId];
            delete this._pendingRPCReplies[callId];
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
        _invokeHandler(rpcId, methodName, args) {
            try {
                return Promise.resolve(this._doInvokeHandler(rpcId, methodName, args));
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        _doInvokeHandler(rpcId, methodName, args) {
            const actor = this._locals[rpcId];
            if (!actor) {
                throw new Error('Unknown actor ' + (0, proxyIdentifier_1.getStringIdentifierForProxy)(rpcId));
            }
            const method = actor[methodName];
            if (typeof method !== 'function') {
                throw new Error('Unknown method ' + methodName + ' on actor ' + (0, proxyIdentifier_1.getStringIdentifierForProxy)(rpcId));
            }
            return method.apply(actor, args);
        }
        _remoteCall(rpcId, methodName, args) {
            if (this._isDisposed) {
                return new lazyPromise_1.CanceledLazyPromise();
            }
            let cancellationToken = null;
            if (args.length > 0 && cancellation_1.CancellationToken.isCancellationToken(args[args.length - 1])) {
                cancellationToken = args.pop();
            }
            if (cancellationToken && cancellationToken.isCancellationRequested) {
                // No need to do anything...
                return Promise.reject(errors.canceled());
            }
            const serializedRequestArguments = MessageIO.serializeRequestArguments(args, this._uriReplacer);
            const req = ++this._lastMessageId;
            const callId = String(req);
            const result = new lazyPromise_1.LazyPromise();
            const disposable = new lifecycle_1.DisposableStore();
            if (cancellationToken) {
                disposable.add(cancellationToken.onCancellationRequested(() => {
                    const msg = MessageIO.serializeCancel(req);
                    this._logger?.logOutgoing(msg.byteLength, req, 0 /* RequestInitiator.LocalSide */, `cancel`);
                    this._protocol.send(MessageIO.serializeCancel(req));
                }));
            }
            this._pendingRPCReplies[callId] = new PendingRPCReply(result, disposable);
            this._onWillSendRequest(req);
            const msg = MessageIO.serializeRequest(req, rpcId, methodName, serializedRequestArguments, !!cancellationToken);
            this._logger?.logOutgoing(msg.byteLength, req, 0 /* RequestInitiator.LocalSide */, `request: ${(0, proxyIdentifier_1.getStringIdentifierForProxy)(rpcId)}.${methodName}(`, args);
            this._protocol.send(msg);
            return result;
        }
    }
    exports.RPCProtocol = RPCProtocol;
    class PendingRPCReply {
        constructor(_promise, _disposable) {
            this._promise = _promise;
            this._disposable = _disposable;
        }
        resolveOk(value) {
            this._promise.resolveOk(value);
            this._disposable.dispose();
        }
        resolveErr(err) {
            this._promise.resolveErr(err);
            this._disposable.dispose();
        }
    }
    class MessageBuffer {
        static alloc(type, req, messageSize) {
            const result = new MessageBuffer(buffer_1.VSBuffer.alloc(messageSize + 1 /* type */ + 4 /* req */), 0);
            result.writeUInt8(type);
            result.writeUInt32(req);
            return result;
        }
        static read(buff, offset) {
            return new MessageBuffer(buff, offset);
        }
        get buffer() {
            return this._buff;
        }
        constructor(buff, offset) {
            this._buff = buff;
            this._offset = offset;
        }
        static sizeUInt8() {
            return 1;
        }
        static { this.sizeUInt32 = 4; }
        writeUInt8(n) {
            this._buff.writeUInt8(n, this._offset);
            this._offset += 1;
        }
        readUInt8() {
            const n = this._buff.readUInt8(this._offset);
            this._offset += 1;
            return n;
        }
        writeUInt32(n) {
            this._buff.writeUInt32BE(n, this._offset);
            this._offset += 4;
        }
        readUInt32() {
            const n = this._buff.readUInt32BE(this._offset);
            this._offset += 4;
            return n;
        }
        static sizeShortString(str) {
            return 1 /* string length */ + str.byteLength /* actual string */;
        }
        writeShortString(str) {
            this._buff.writeUInt8(str.byteLength, this._offset);
            this._offset += 1;
            this._buff.set(str, this._offset);
            this._offset += str.byteLength;
        }
        readShortString() {
            const strByteLength = this._buff.readUInt8(this._offset);
            this._offset += 1;
            const strBuff = this._buff.slice(this._offset, this._offset + strByteLength);
            const str = strBuff.toString();
            this._offset += strByteLength;
            return str;
        }
        static sizeLongString(str) {
            return 4 /* string length */ + str.byteLength /* actual string */;
        }
        writeLongString(str) {
            this._buff.writeUInt32BE(str.byteLength, this._offset);
            this._offset += 4;
            this._buff.set(str, this._offset);
            this._offset += str.byteLength;
        }
        readLongString() {
            const strByteLength = this._buff.readUInt32BE(this._offset);
            this._offset += 4;
            const strBuff = this._buff.slice(this._offset, this._offset + strByteLength);
            const str = strBuff.toString();
            this._offset += strByteLength;
            return str;
        }
        writeBuffer(buff) {
            this._buff.writeUInt32BE(buff.byteLength, this._offset);
            this._offset += 4;
            this._buff.set(buff, this._offset);
            this._offset += buff.byteLength;
        }
        static sizeVSBuffer(buff) {
            return 4 /* buffer length */ + buff.byteLength /* actual buffer */;
        }
        writeVSBuffer(buff) {
            this._buff.writeUInt32BE(buff.byteLength, this._offset);
            this._offset += 4;
            this._buff.set(buff, this._offset);
            this._offset += buff.byteLength;
        }
        readVSBuffer() {
            const buffLength = this._buff.readUInt32BE(this._offset);
            this._offset += 4;
            const buff = this._buff.slice(this._offset, this._offset + buffLength);
            this._offset += buffLength;
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
            this._buff.writeUInt8(arr.length, this._offset);
            this._offset += 1;
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
            const arrLen = this._buff.readUInt8(this._offset);
            this._offset += 1;
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
                        arr[i] = new proxyIdentifier_1.SerializableObjectWithBuffers(parseJsonAndRestoreBufferRefs(jsonString, buffers, null));
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
        static _useMixedArgSerialization(arr) {
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i] instanceof buffer_1.VSBuffer) {
                    return true;
                }
                if (arr[i] instanceof proxyIdentifier_1.SerializableObjectWithBuffers) {
                    return true;
                }
                if (typeof arr[i] === 'undefined') {
                    return true;
                }
            }
            return false;
        }
        static serializeRequestArguments(args, replacer) {
            if (this._useMixedArgSerialization(args)) {
                const massagedArgs = [];
                for (let i = 0, len = args.length; i < len; i++) {
                    const arg = args[i];
                    if (arg instanceof buffer_1.VSBuffer) {
                        massagedArgs[i] = { type: 2 /* ArgType.VSBuffer */, value: arg };
                    }
                    else if (typeof arg === 'undefined') {
                        massagedArgs[i] = { type: 4 /* ArgType.Undefined */ };
                    }
                    else if (arg instanceof proxyIdentifier_1.SerializableObjectWithBuffers) {
                        const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(arg.value, replacer);
                        massagedArgs[i] = { type: 3 /* ArgType.SerializedObjectWithBuffers */, value: buffer_1.VSBuffer.fromString(jsonString), buffers: referencedBuffers };
                    }
                    else {
                        massagedArgs[i] = { type: 1 /* ArgType.String */, value: buffer_1.VSBuffer.fromString(stringify(arg, replacer)) };
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
                    return this._requestJSONArgs(req, rpcId, method, serializedArgs.args, usesCancellationToken);
                case 1 /* SerializedRequestArgumentType.Mixed */:
                    return this._requestMixedArgs(req, rpcId, method, serializedArgs.args, usesCancellationToken);
            }
        }
        static _requestJSONArgs(req, rpcId, method, args, usesCancellationToken) {
            const methodBuff = buffer_1.VSBuffer.fromString(method);
            const argsBuff = buffer_1.VSBuffer.fromString(args);
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
        static _requestMixedArgs(req, rpcId, method, args, usesCancellationToken) {
            const methodBuff = buffer_1.VSBuffer.fromString(method);
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
                return this._serializeReplyOKEmpty(req);
            }
            else if (res instanceof buffer_1.VSBuffer) {
                return this._serializeReplyOKVSBuffer(req, res);
            }
            else if (res instanceof proxyIdentifier_1.SerializableObjectWithBuffers) {
                const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(res.value, replacer, true);
                return this._serializeReplyOKJSONWithBuffers(req, jsonString, referencedBuffers);
            }
            else {
                return this._serializeReplyOKJSON(req, safeStringify(res, replacer));
            }
        }
        static _serializeReplyOKEmpty(req) {
            return MessageBuffer.alloc(7 /* MessageType.ReplyOKEmpty */, req, 0).buffer;
        }
        static _serializeReplyOKVSBuffer(req, res) {
            let len = 0;
            len += MessageBuffer.sizeVSBuffer(res);
            const result = MessageBuffer.alloc(8 /* MessageType.ReplyOKVSBuffer */, req, len);
            result.writeVSBuffer(res);
            return result.buffer;
        }
        static deserializeReplyOKVSBuffer(buff) {
            return buff.readVSBuffer();
        }
        static _serializeReplyOKJSON(req, res) {
            const resBuff = buffer_1.VSBuffer.fromString(res);
            let len = 0;
            len += MessageBuffer.sizeLongString(resBuff);
            const result = MessageBuffer.alloc(9 /* MessageType.ReplyOKJSON */, req, len);
            result.writeLongString(resBuff);
            return result.buffer;
        }
        static _serializeReplyOKJSONWithBuffers(req, res, buffers) {
            const resBuff = buffer_1.VSBuffer.fromString(res);
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
            return new proxyIdentifier_1.SerializableObjectWithBuffers(parseJsonAndRestoreBufferRefs(res, buffers, uriTransformer));
        }
        static serializeReplyErr(req, err) {
            const errStr = (err ? safeStringify(errors.transformErrorForSerialization(err), null) : undefined);
            if (typeof errStr !== 'string') {
                return this._serializeReplyErrEmpty(req);
            }
            const errBuff = buffer_1.VSBuffer.fromString(errStr);
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
        static _serializeReplyErrEmpty(req) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjUHJvdG9jb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vcnBjUHJvdG9jb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7OztJQW9CaEcsU0FBUyxhQUFhLENBQUMsR0FBUSxFQUFFLFFBQXNDO1FBQ3RFLElBQUk7WUFDSCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFvQyxRQUFRLENBQUMsQ0FBQztTQUN2RTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsT0FBTyxNQUFNLENBQUM7U0FDZDtJQUNGLENBQUM7SUFFRCxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUM7SUFDaEMsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFXLENBQUM7SUFFdEQsTUFBTSw2QkFBNkI7UUFDbEMsWUFDaUIsVUFBa0IsRUFDbEIsaUJBQXNDO1lBRHRDLGVBQVUsR0FBVixVQUFVLENBQVE7WUFDbEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFxQjtRQUNuRCxDQUFDO0tBQ0w7SUFFRCxTQUFnQiwyQkFBMkIsQ0FBSSxHQUFNLEVBQUUsV0FBeUMsSUFBSSxFQUFFLGdCQUFnQixHQUFHLEtBQUs7UUFDN0gsTUFBTSxZQUFZLEdBQWUsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUMxRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRTtnQkFDakMsT0FBTyxZQUFZLENBQUMsQ0FBQyx5REFBeUQ7YUFDOUU7aUJBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ3JDLElBQUksS0FBSyxZQUFZLGlCQUFRLEVBQUU7b0JBQzlCLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqRCxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQztpQkFDeEM7Z0JBQ0QsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUM1QjthQUNEO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU87WUFDTixVQUFVLEVBQUUsVUFBVTtZQUN0QixpQkFBaUIsRUFBRSxZQUFZO1NBQy9CLENBQUM7SUFDSCxDQUFDO0lBcEJELGtFQW9CQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLFVBQWtCLEVBQUUsT0FBNEIsRUFBRSxjQUFzQztRQUNySSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzdDLElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDakMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7b0JBQzVCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNwQjtnQkFFRCxJQUFJLGNBQWMsSUFBdUIsS0FBTSxDQUFDLElBQUksNkJBQXFCLEVBQUU7b0JBQzFFLE9BQU8sY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMvQzthQUNEO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFkRCxzRUFjQztJQUdELFNBQVMsU0FBUyxDQUFDLEdBQVEsRUFBRSxRQUFzQztRQUNsRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFvQyxRQUFRLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxXQUFtQztRQUM3RCxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxPQUFPLENBQUMsR0FBVyxFQUFFLEtBQVUsRUFBTyxFQUFFO1lBQ3ZDLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLDZCQUFxQixFQUFFO2dCQUM3QyxPQUFPLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQWtCLGdCQUdqQjtJQUhELFdBQWtCLGdCQUFnQjtRQUNqQyxpRUFBYSxDQUFBO1FBQ2IsaUVBQWEsQ0FBQTtJQUNkLENBQUMsRUFIaUIsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFHakM7SUFFRCxJQUFrQixlQUdqQjtJQUhELFdBQWtCLGVBQWU7UUFDaEMsaUVBQWMsQ0FBQTtRQUNkLHFFQUFnQixDQUFBO0lBQ2pCLENBQUMsRUFIaUIsZUFBZSwrQkFBZixlQUFlLFFBR2hDO0lBT0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXZCLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyRCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRS9DLE1BQWEsV0FBWSxTQUFRLHNCQUFVO3NCQUV6QyxrQkFBa0I7aUJBRUssc0JBQWlCLEdBQUcsQ0FBQyxHQUFHLElBQUksQUFBWCxDQUFZLEdBQUMsS0FBSztRQW9CM0QsWUFBWSxRQUFpQyxFQUFFLFNBQW9DLElBQUksRUFBRSxjQUFzQyxJQUFJO1lBQ2xJLEtBQUssRUFBRSxDQUFDO1lBdkJULFFBQW9CLEdBQUcsSUFBSSxDQUFDO1lBSVgsZ0NBQTJCLEdBQTZCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW1CLENBQUMsQ0FBQztZQUN4RywrQkFBMEIsR0FBMkIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQztZQW1CM0csSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUM7WUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGlDQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUN4QjtZQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGdCQUFnQixxQ0FBNkIsQ0FBQztZQUNuRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUV4Qix5REFBeUQ7WUFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRTtnQkFDL0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzlCO1lBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGtCQUFrQixDQUFDLEdBQVc7WUFDckMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyw2REFBNkQ7Z0JBQzdELHVFQUF1RTtnQkFDdkUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUM7YUFDcEU7WUFDRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUMvQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDdkM7UUFDRixDQUFDO1FBRU8sd0JBQXdCLENBQUMsR0FBVztZQUMzQyxzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUM7WUFDcEUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyx5Q0FBeUM7Z0JBQ3pDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNyQztZQUNELDhCQUE4QjtZQUM5QixJQUFJLENBQUMsbUJBQW1CLG9DQUE0QixDQUFDO1FBQ3RELENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxvRUFBb0U7Z0JBQ3BFLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDeEMsaUJBQWlCO2dCQUNqQixJQUFJLENBQUMsbUJBQW1CLHNDQUE4QixDQUFDO2FBQ3ZEO2lCQUFNO2dCQUNOLHNEQUFzRDtnQkFDdEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztRQUVPLG1CQUFtQixDQUFDLGtCQUFtQztZQUM5RCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxrQkFBa0IsRUFBRTtnQkFDakQsWUFBWTtnQkFDWixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUM7WUFDM0MsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsSUFBVyxlQUFlO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLENBQUM7UUFFTSxxQkFBcUIsQ0FBSSxHQUFNO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUMxQixPQUFPLEdBQUcsQ0FBQzthQUNYO1lBQ0QsT0FBTyxJQUFBLDhCQUFxQixFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVNLFFBQVEsQ0FBSSxVQUE4QjtZQUNoRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDckQ7WUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVPLFlBQVksQ0FBSSxLQUFhLEVBQUUsU0FBaUI7WUFDdkQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2YsR0FBRyxFQUFFLENBQUMsTUFBVyxFQUFFLElBQWlCLEVBQUUsRUFBRTtvQkFDdkMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUNBQXdCLEVBQUU7d0JBQzVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBYSxFQUFFLEVBQUU7NEJBQ25DLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUM5QyxDQUFDLENBQUM7cUJBQ0Y7b0JBQ0QsSUFBSSxJQUFJLEtBQUssZUFBZSxFQUFFO3dCQUM3QixPQUFPLFNBQVMsQ0FBQztxQkFDakI7b0JBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7YUFDRCxDQUFDO1lBQ0YsT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFTSxHQUFHLENBQWlCLFVBQThCLEVBQUUsS0FBUTtZQUNsRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsV0FBbUM7WUFDMUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2lCQUM1RDthQUNEO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQixDQUFDLE1BQWdCO1lBQzFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsT0FBTzthQUNQO1lBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2xELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUU5QixRQUFRLFdBQVcsRUFBRTtnQkFDcEIseUNBQWlDO2dCQUNqQyx3REFBZ0QsQ0FBQyxDQUFDO29CQUNqRCxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pFLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTt3QkFDekIsSUFBSSxHQUFHLElBQUEsOEJBQXFCLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztxQkFDekQ7b0JBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyx3REFBZ0QsQ0FBQyxDQUFDLENBQUM7b0JBQ3pILE1BQU07aUJBQ047Z0JBQ0QsMENBQWtDO2dCQUNsQyx5REFBaUQsQ0FBQyxDQUFDO29CQUNsRCxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFFLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTt3QkFDekIsSUFBSSxHQUFHLElBQUEsOEJBQXFCLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztxQkFDekQ7b0JBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyx5REFBaUQsQ0FBQyxDQUFDLENBQUM7b0JBQzFILE1BQU07aUJBQ047Z0JBQ0QscUNBQTZCLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLEdBQUcsc0NBQThCLEtBQUssQ0FBQyxDQUFDO29CQUM3RSxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25DLE1BQU07aUJBQ047Z0JBQ0QsK0JBQXVCLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3BDLE1BQU07aUJBQ047Z0JBQ0QscUNBQTZCLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUM5QyxNQUFNO2lCQUNOO2dCQUNELG9DQUE0QixDQUFDLENBQUM7b0JBQzdCLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbkQsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO3dCQUN6QixLQUFLLEdBQUcsSUFBQSw4QkFBcUIsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3FCQUMzRDtvQkFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzFDLE1BQU07aUJBQ047Z0JBQ0QsZ0RBQXVDLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLGlDQUFpQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3RGLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDMUMsTUFBTTtpQkFDTjtnQkFDRCx3Q0FBZ0MsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDMUMsTUFBTTtpQkFDTjtnQkFDRCx1Q0FBOEIsQ0FBQyxDQUFDO29CQUMvQixJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25ELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTt3QkFDekIsR0FBRyxHQUFHLElBQUEsOEJBQXFCLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztxQkFDdkQ7b0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzNDLE1BQU07aUJBQ047Z0JBQ0QsdUNBQThCLENBQUMsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ2pELE1BQU07aUJBQ047Z0JBQ0Q7b0JBQ0MsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO29CQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztRQUVPLGVBQWUsQ0FBQyxTQUFpQixFQUFFLEdBQVcsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLElBQVcsRUFBRSxxQkFBOEI7WUFDakksSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLEdBQUcsc0NBQThCLGtCQUFrQixJQUFBLDZDQUEyQixFQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9JLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUzQixJQUFJLE9BQXFCLENBQUM7WUFDMUIsSUFBSSxNQUFrQixDQUFDO1lBQ3ZCLElBQUkscUJBQXFCLEVBQUU7Z0JBQzFCLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ04sc0JBQXNCO2dCQUN0QixPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ2Q7WUFFRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBRTdDLDBCQUEwQjtZQUMxQixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLHNDQUE4QixLQUFLLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV6QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxzQ0FBOEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4RixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDVixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLHNDQUE4QixXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzdGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLGNBQWMsQ0FBQyxTQUFpQixFQUFFLEdBQVc7WUFDcEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLEdBQUcsc0NBQThCLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTyxhQUFhLENBQUMsU0FBaUIsRUFBRSxHQUFXLEVBQUUsS0FBVTtZQUMvRCxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxzQ0FBOEIsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDcEQsT0FBTzthQUNQO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVPLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsR0FBVyxFQUFFLEtBQVU7WUFDbEUsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLEdBQUcsc0NBQThCLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWpHLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDcEQsT0FBTzthQUNQO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZDLElBQUksR0FBRyxHQUFRLFNBQVMsQ0FBQztZQUN6QixJQUFJLEtBQUssRUFBRTtnQkFDVixJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQ25CLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNsQixHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztvQkFDNUIsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUN4QjtxQkFBTTtvQkFDTixHQUFHLEdBQUcsS0FBSyxDQUFDO2lCQUNaO2FBQ0Q7WUFDRCxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTyxjQUFjLENBQUMsS0FBYSxFQUFFLFVBQWtCLEVBQUUsSUFBVztZQUNwRSxJQUFJO2dCQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzNCO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLEtBQWEsRUFBRSxVQUFrQixFQUFFLElBQVc7WUFDdEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBQSw2Q0FBMkIsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pDLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUFFO2dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixHQUFHLFVBQVUsR0FBRyxZQUFZLEdBQUcsSUFBQSw2Q0FBMkIsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3BHO1lBQ0QsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU8sV0FBVyxDQUFDLEtBQWEsRUFBRSxVQUFrQixFQUFFLElBQVc7WUFDakUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixPQUFPLElBQUksaUNBQW1CLEVBQUUsQ0FBQzthQUNqQztZQUNELElBQUksaUJBQWlCLEdBQTZCLElBQUksQ0FBQztZQUN2RCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGdDQUFpQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BGLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUMvQjtZQUVELElBQUksaUJBQWlCLElBQUksaUJBQWlCLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ25FLDRCQUE0QjtnQkFDNUIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsTUFBTSwwQkFBMEIsR0FBRyxTQUFTLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVoRyxNQUFNLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFDO1lBRWpDLE1BQU0sVUFBVSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3pDLElBQUksaUJBQWlCLEVBQUU7Z0JBQ3RCLFVBQVUsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO29CQUM3RCxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMzQyxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsc0NBQThCLFFBQVEsQ0FBQyxDQUFDO29CQUNyRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsc0NBQThCLFlBQVksSUFBQSw2Q0FBMkIsRUFBQyxLQUFLLENBQUMsSUFBSSxVQUFVLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7O0lBelhGLGtDQTBYQztJQUVELE1BQU0sZUFBZTtRQUNwQixZQUNrQixRQUFxQixFQUNyQixXQUF3QjtZQUR4QixhQUFRLEdBQVIsUUFBUSxDQUFhO1lBQ3JCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3RDLENBQUM7UUFFRSxTQUFTLENBQUMsS0FBVTtZQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxVQUFVLENBQUMsR0FBUTtZQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQUVELE1BQU0sYUFBYTtRQUVYLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBaUIsRUFBRSxHQUFXLEVBQUUsV0FBbUI7WUFDdEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsaUJBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWMsRUFBRSxNQUFjO1lBQ2hELE9BQU8sSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFLRCxJQUFXLE1BQU07WUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxZQUFvQixJQUFjLEVBQUUsTUFBYztZQUNqRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBRU0sTUFBTSxDQUFDLFNBQVM7WUFDdEIsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO2lCQUVzQixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRS9CLFVBQVUsQ0FBQyxDQUFTO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVNLFdBQVcsQ0FBQyxDQUFTO1lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU0sVUFBVTtZQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUNuRSxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFTSxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQWE7WUFDMUMsT0FBTyxDQUFDLENBQUMsbUJBQW1CLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQztRQUNuRSxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsR0FBYTtZQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDbkUsQ0FBQztRQUVNLGVBQWU7WUFDckIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDNUUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksYUFBYSxDQUFDO1lBQzlELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVNLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBYTtZQUN6QyxPQUFPLENBQUMsQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDO1FBQ25FLENBQUM7UUFFTSxlQUFlLENBQUMsR0FBYTtZQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDbkUsQ0FBQztRQUVNLGNBQWM7WUFDcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDL0UsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksYUFBYSxDQUFDO1lBQzlELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVNLFdBQVcsQ0FBQyxJQUFjO1lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFjO1lBQ3hDLE9BQU8sQ0FBQyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7UUFDcEUsQ0FBQztRQUVNLGFBQWEsQ0FBQyxJQUFjO1lBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sWUFBWTtZQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUM1RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQztZQUNuRyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQXdCO1lBQ3BELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNiLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhO1lBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVc7Z0JBQ3RCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRTtvQkFDaEI7d0JBQ0MsSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN0QyxNQUFNO29CQUNQO3dCQUNDLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDcEMsTUFBTTtvQkFDUDt3QkFDQyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGVBQWU7d0JBQ3hDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFOzRCQUMzQyxJQUFJLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3pDO3dCQUNELE1BQU07b0JBQ1A7d0JBQ0MsV0FBVzt3QkFDWCxNQUFNO2lCQUNQO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxlQUFlLENBQUMsR0FBd0I7WUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUNuRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRTtvQkFDaEI7d0JBQ0MsSUFBSSxDQUFDLFVBQVUsd0JBQWdCLENBQUM7d0JBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUMvQixNQUFNO29CQUNQO3dCQUNDLElBQUksQ0FBQyxVQUFVLDBCQUFrQixDQUFDO3dCQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDN0IsTUFBTTtvQkFDUDt3QkFDQyxJQUFJLENBQUMsVUFBVSw2Q0FBcUMsQ0FBQzt3QkFDckQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNwQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFOzRCQUMzQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDaEM7d0JBQ0QsTUFBTTtvQkFDUDt3QkFDQyxJQUFJLENBQUMsVUFBVSwyQkFBbUIsQ0FBQzt3QkFDbkMsTUFBTTtpQkFDUDthQUNEO1FBQ0YsQ0FBQztRQUVNLGNBQWM7WUFDcEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDckUsTUFBTSxHQUFHLEdBQThFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hDLE1BQU0sT0FBTyxHQUFZLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDMUMsUUFBUSxPQUFPLEVBQUU7b0JBQ2hCO3dCQUNDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQy9CLE1BQU07b0JBQ1A7d0JBQ0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDN0IsTUFBTTtvQkFDUCxnREFBd0MsQ0FBQyxDQUFDO3dCQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ3RDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDekMsTUFBTSxPQUFPLEdBQWUsRUFBRSxDQUFDO3dCQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFOzRCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO3lCQUNsQzt3QkFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSwrQ0FBNkIsQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3JHLE1BQU07cUJBQ047b0JBQ0Q7d0JBQ0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQzt3QkFDbkIsTUFBTTtpQkFDUDthQUNEO1lBQ0QsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDOztJQUdGLElBQVcsNkJBR1Y7SUFIRCxXQUFXLDZCQUE2QjtRQUN2QyxxRkFBTSxDQUFBO1FBQ04sbUZBQUssQ0FBQTtJQUNOLENBQUMsRUFIVSw2QkFBNkIsS0FBN0IsNkJBQTZCLFFBR3ZDO0lBT0QsTUFBTSxTQUFTO1FBRU4sTUFBTSxDQUFDLHlCQUF5QixDQUFDLEdBQVU7WUFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksaUJBQVEsRUFBRTtvQkFDL0IsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBQ0QsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksK0NBQTZCLEVBQUU7b0JBQ3BELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUNELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxFQUFFO29CQUNsQyxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sTUFBTSxDQUFDLHlCQUF5QixDQUFDLElBQVcsRUFBRSxRQUFzQztZQUMxRixJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekMsTUFBTSxZQUFZLEdBQWUsRUFBRSxDQUFDO2dCQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNoRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLElBQUksR0FBRyxZQUFZLGlCQUFRLEVBQUU7d0JBQzVCLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksMEJBQWtCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO3FCQUN6RDt5QkFBTSxJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsRUFBRTt3QkFDdEMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSwyQkFBbUIsRUFBRSxDQUFDO3FCQUM5Qzt5QkFBTSxJQUFJLEdBQUcsWUFBWSwrQ0FBNkIsRUFBRTt3QkFDeEQsTUFBTSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQzNGLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksNkNBQXFDLEVBQUUsS0FBSyxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDO3FCQUNwSTt5QkFBTTt3QkFDTixZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLHdCQUFnQixFQUFFLEtBQUssRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztxQkFDakc7aUJBQ0Q7Z0JBQ0QsT0FBTztvQkFDTixJQUFJLDZDQUFxQztvQkFDekMsSUFBSSxFQUFFLFlBQVk7aUJBQ2xCLENBQUM7YUFDRjtZQUNELE9BQU87Z0JBQ04sSUFBSSw4Q0FBc0M7Z0JBQzFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQzthQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUVNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBRSxjQUEwQyxFQUFFLHFCQUE4QjtZQUNwSixRQUFRLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCO29CQUNDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsQ0FBQztnQkFDOUY7b0JBQ0MsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO2FBQy9GO1FBQ0YsQ0FBQztRQUVPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUscUJBQThCO1lBQ3ZILE1BQU0sVUFBVSxHQUFHLGlCQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLGlCQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLEdBQUcsSUFBSSxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsR0FBRyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLHFEQUE2QyxDQUFDLG9DQUE0QixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoSixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN0QixDQUFDO1FBRU0sTUFBTSxDQUFDLDBCQUEwQixDQUFDLElBQW1CO1lBQzNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25DLE9BQU87Z0JBQ04sS0FBSyxFQUFFLEtBQUs7Z0JBQ1osTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ3RCLENBQUM7UUFDSCxDQUFDO1FBRU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLElBQXlCLEVBQUUscUJBQThCO1lBQ3JJLE1BQU0sVUFBVSxHQUFHLGlCQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRS9DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLEdBQUcsSUFBSSxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsR0FBRyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLHNEQUE4QyxDQUFDLHFDQUE2QixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNsSixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN0QixDQUFDO1FBRU0sTUFBTSxDQUFDLDJCQUEyQixDQUFDLElBQW1CO1lBQzVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxHQUFVLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO29CQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDN0I7cUJBQU07b0JBQ04sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztpQkFDakI7YUFDRDtZQUNELE9BQU87Z0JBQ04sS0FBSyxFQUFFLEtBQUs7Z0JBQ1osTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUk7YUFDVixDQUFDO1FBQ0gsQ0FBQztRQUVNLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFXO1lBQzlDLE9BQU8sYUFBYSxDQUFDLEtBQUssbUNBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDckUsQ0FBQztRQUVNLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBVztZQUN4QyxPQUFPLGFBQWEsQ0FBQyxLQUFLLDZCQUFxQixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQy9ELENBQUM7UUFFTSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEdBQVEsRUFBRSxRQUFzQztZQUMzRixJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsRUFBRTtnQkFDL0IsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDeEM7aUJBQU0sSUFBSSxHQUFHLFlBQVksaUJBQVEsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2hEO2lCQUFNLElBQUksR0FBRyxZQUFZLCtDQUE2QixFQUFFO2dCQUN4RCxNQUFNLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLEdBQUcsMkJBQTJCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pHLE9BQU8sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUNqRjtpQkFBTTtnQkFDTixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3JFO1FBQ0YsQ0FBQztRQUVPLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxHQUFXO1lBQ2hELE9BQU8sYUFBYSxDQUFDLEtBQUssbUNBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDckUsQ0FBQztRQUVPLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxHQUFXLEVBQUUsR0FBYTtZQUNsRSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixHQUFHLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsS0FBSyxzQ0FBOEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxNQUFNLENBQUMsMEJBQTBCLENBQUMsSUFBbUI7WUFDM0QsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVPLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFXLEVBQUUsR0FBVztZQUM1RCxNQUFNLE9BQU8sR0FBRyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixHQUFHLElBQUksYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU3QyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsS0FBSyxrQ0FBMEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUM7UUFFTyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxPQUE0QjtZQUNyRyxNQUFNLE9BQU8sR0FBRyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixHQUFHLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGVBQWU7WUFDaEQsR0FBRyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7Z0JBQzdCLEdBQUcsSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEtBQUssOENBQXFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNqRixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hDLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO2dCQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNCO1lBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBbUI7WUFDdkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRU0sTUFBTSxDQUFDLGlDQUFpQyxDQUFDLElBQW1CLEVBQUUsY0FBc0M7WUFDMUcsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVsQyxNQUFNLE9BQU8sR0FBZSxFQUFFLENBQUM7WUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUNsQztZQUVELE9BQU8sSUFBSSwrQ0FBNkIsQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDdkcsQ0FBQztRQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsR0FBUTtZQUNwRCxNQUFNLE1BQU0sR0FBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZILElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUMvQixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN6QztZQUNELE1BQU0sT0FBTyxHQUFHLGlCQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTVDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLEdBQUcsSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTdDLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxLQUFLLHFDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDeEUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFtQjtZQUN6RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFTyxNQUFNLENBQUMsdUJBQXVCLENBQUMsR0FBVztZQUNqRCxPQUFPLGFBQWEsQ0FBQyxLQUFLLHFDQUE0QixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3RFLENBQUM7S0FDRDtJQUVELElBQVcsV0FhVjtJQWJELFdBQVcsV0FBVztRQUNyQixtRUFBbUIsQ0FBQTtRQUNuQixtR0FBbUMsQ0FBQTtRQUNuQyxxRUFBb0IsQ0FBQTtRQUNwQixxR0FBb0MsQ0FBQTtRQUNwQyw2REFBZ0IsQ0FBQTtRQUNoQixpREFBVSxDQUFBO1FBQ1YsNkRBQWdCLENBQUE7UUFDaEIsbUVBQW1CLENBQUE7UUFDbkIsMkRBQWUsQ0FBQTtRQUNmLGtGQUEyQixDQUFBO1FBQzNCLGdFQUFrQixDQUFBO1FBQ2xCLGdFQUFrQixDQUFBO0lBQ25CLENBQUMsRUFiVSxXQUFXLEtBQVgsV0FBVyxRQWFyQjtJQUVELElBQVcsT0FLVjtJQUxELFdBQVcsT0FBTztRQUNqQix5Q0FBVSxDQUFBO1FBQ1YsNkNBQVksQ0FBQTtRQUNaLG1GQUErQixDQUFBO1FBQy9CLCtDQUFhLENBQUE7SUFDZCxDQUFDLEVBTFUsT0FBTyxLQUFQLE9BQU8sUUFLakIifQ==