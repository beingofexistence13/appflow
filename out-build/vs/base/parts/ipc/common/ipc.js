/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/strings", "vs/base/common/types"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, decorators_1, errors_1, event_1, lifecycle_1, marshalling_1, strings, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kh = exports.ProxyChannel = exports.$jh = exports.$ih = exports.$hh = exports.$gh = exports.$fh = exports.$eh = exports.RequestInitiator = exports.$dh = exports.$ch = exports.$bh = exports.$ah = exports.$_g = void 0;
    var RequestType;
    (function (RequestType) {
        RequestType[RequestType["Promise"] = 100] = "Promise";
        RequestType[RequestType["PromiseCancel"] = 101] = "PromiseCancel";
        RequestType[RequestType["EventListen"] = 102] = "EventListen";
        RequestType[RequestType["EventDispose"] = 103] = "EventDispose";
    })(RequestType || (RequestType = {}));
    function requestTypeToStr(type) {
        switch (type) {
            case 100 /* RequestType.Promise */:
                return 'req';
            case 101 /* RequestType.PromiseCancel */:
                return 'cancel';
            case 102 /* RequestType.EventListen */:
                return 'subscribe';
            case 103 /* RequestType.EventDispose */:
                return 'unsubscribe';
        }
    }
    var ResponseType;
    (function (ResponseType) {
        ResponseType[ResponseType["Initialize"] = 200] = "Initialize";
        ResponseType[ResponseType["PromiseSuccess"] = 201] = "PromiseSuccess";
        ResponseType[ResponseType["PromiseError"] = 202] = "PromiseError";
        ResponseType[ResponseType["PromiseErrorObj"] = 203] = "PromiseErrorObj";
        ResponseType[ResponseType["EventFire"] = 204] = "EventFire";
    })(ResponseType || (ResponseType = {}));
    function responseTypeToStr(type) {
        switch (type) {
            case 200 /* ResponseType.Initialize */:
                return `init`;
            case 201 /* ResponseType.PromiseSuccess */:
                return `reply:`;
            case 202 /* ResponseType.PromiseError */:
            case 203 /* ResponseType.PromiseErrorObj */:
                return `replyErr:`;
            case 204 /* ResponseType.EventFire */:
                return `event:`;
        }
    }
    var State;
    (function (State) {
        State[State["Uninitialized"] = 0] = "Uninitialized";
        State[State["Idle"] = 1] = "Idle";
    })(State || (State = {}));
    /**
     * @see https://en.wikipedia.org/wiki/Variable-length_quantity
     */
    function readIntVQL(reader) {
        let value = 0;
        for (let n = 0;; n += 7) {
            const next = reader.read(1);
            value |= (next.buffer[0] & 0b01111111) << n;
            if (!(next.buffer[0] & 0b10000000)) {
                return value;
            }
        }
    }
    const vqlZero = createOneByteBuffer(0);
    /**
     * @see https://en.wikipedia.org/wiki/Variable-length_quantity
     */
    function writeInt32VQL(writer, value) {
        if (value === 0) {
            writer.write(vqlZero);
            return;
        }
        let len = 0;
        for (let v2 = value; v2 !== 0; v2 = v2 >>> 7) {
            len++;
        }
        const scratch = buffer_1.$Fd.alloc(len);
        for (let i = 0; value !== 0; i++) {
            scratch.buffer[i] = value & 0b01111111;
            value = value >>> 7;
            if (value > 0) {
                scratch.buffer[i] |= 0b10000000;
            }
        }
        writer.write(scratch);
    }
    class $_g {
        constructor(b) {
            this.b = b;
            this.a = 0;
        }
        read(bytes) {
            const result = this.b.slice(this.a, this.a + bytes);
            this.a += result.byteLength;
            return result;
        }
    }
    exports.$_g = $_g;
    class $ah {
        constructor() {
            this.a = [];
        }
        get buffer() {
            return buffer_1.$Fd.concat(this.a);
        }
        write(buffer) {
            this.a.push(buffer);
        }
    }
    exports.$ah = $ah;
    var DataType;
    (function (DataType) {
        DataType[DataType["Undefined"] = 0] = "Undefined";
        DataType[DataType["String"] = 1] = "String";
        DataType[DataType["Buffer"] = 2] = "Buffer";
        DataType[DataType["VSBuffer"] = 3] = "VSBuffer";
        DataType[DataType["Array"] = 4] = "Array";
        DataType[DataType["Object"] = 5] = "Object";
        DataType[DataType["Int"] = 6] = "Int";
    })(DataType || (DataType = {}));
    function createOneByteBuffer(value) {
        const result = buffer_1.$Fd.alloc(1);
        result.writeUInt8(value, 0);
        return result;
    }
    const BufferPresets = {
        Undefined: createOneByteBuffer(DataType.Undefined),
        String: createOneByteBuffer(DataType.String),
        Buffer: createOneByteBuffer(DataType.Buffer),
        VSBuffer: createOneByteBuffer(DataType.VSBuffer),
        Array: createOneByteBuffer(DataType.Array),
        Object: createOneByteBuffer(DataType.Object),
        Uint: createOneByteBuffer(DataType.Int),
    };
    const hasBuffer = (typeof Buffer !== 'undefined');
    function $bh(writer, data) {
        if (typeof data === 'undefined') {
            writer.write(BufferPresets.Undefined);
        }
        else if (typeof data === 'string') {
            const buffer = buffer_1.$Fd.fromString(data);
            writer.write(BufferPresets.String);
            writeInt32VQL(writer, buffer.byteLength);
            writer.write(buffer);
        }
        else if (hasBuffer && Buffer.isBuffer(data)) {
            const buffer = buffer_1.$Fd.wrap(data);
            writer.write(BufferPresets.Buffer);
            writeInt32VQL(writer, buffer.byteLength);
            writer.write(buffer);
        }
        else if (data instanceof buffer_1.$Fd) {
            writer.write(BufferPresets.VSBuffer);
            writeInt32VQL(writer, data.byteLength);
            writer.write(data);
        }
        else if (Array.isArray(data)) {
            writer.write(BufferPresets.Array);
            writeInt32VQL(writer, data.length);
            for (const el of data) {
                $bh(writer, el);
            }
        }
        else if (typeof data === 'number' && (data | 0) === data) {
            // write a vql if it's a number that we can do bitwise operations on
            writer.write(BufferPresets.Uint);
            writeInt32VQL(writer, data);
        }
        else {
            const buffer = buffer_1.$Fd.fromString(JSON.stringify(data));
            writer.write(BufferPresets.Object);
            writeInt32VQL(writer, buffer.byteLength);
            writer.write(buffer);
        }
    }
    exports.$bh = $bh;
    function $ch(reader) {
        const type = reader.read(1).readUInt8(0);
        switch (type) {
            case DataType.Undefined: return undefined;
            case DataType.String: return reader.read(readIntVQL(reader)).toString();
            case DataType.Buffer: return reader.read(readIntVQL(reader)).buffer;
            case DataType.VSBuffer: return reader.read(readIntVQL(reader));
            case DataType.Array: {
                const length = readIntVQL(reader);
                const result = [];
                for (let i = 0; i < length; i++) {
                    result.push($ch(reader));
                }
                return result;
            }
            case DataType.Object: return JSON.parse(reader.read(readIntVQL(reader)).toString());
            case DataType.Int: return readIntVQL(reader);
        }
    }
    exports.$ch = $ch;
    class $dh {
        constructor(h, j, k = null, l = 1000) {
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.b = new Map();
            this.d = new Map();
            // Requests might come in for channels which are not yet registered.
            // They will timeout after `timeoutDelay`.
            this.g = new Map();
            this.f = this.h.onMessage(msg => this.q(msg));
            this.m({ type: 200 /* ResponseType.Initialize */ });
        }
        registerChannel(channelName, channel) {
            this.b.set(channelName, channel);
            // https://github.com/microsoft/vscode/issues/72531
            setTimeout(() => this.w(channelName), 0);
        }
        m(response) {
            switch (response.type) {
                case 200 /* ResponseType.Initialize */: {
                    const msgLength = this.o([response.type]);
                    this.k?.logOutgoing(msgLength, 0, 1 /* RequestInitiator.OtherSide */, responseTypeToStr(response.type));
                    return;
                }
                case 201 /* ResponseType.PromiseSuccess */:
                case 202 /* ResponseType.PromiseError */:
                case 204 /* ResponseType.EventFire */:
                case 203 /* ResponseType.PromiseErrorObj */: {
                    const msgLength = this.o([response.type, response.id], response.data);
                    this.k?.logOutgoing(msgLength, response.id, 1 /* RequestInitiator.OtherSide */, responseTypeToStr(response.type), response.data);
                    return;
                }
            }
        }
        o(header, body = undefined) {
            const writer = new $ah();
            $bh(writer, header);
            $bh(writer, body);
            return this.p(writer.buffer);
        }
        p(message) {
            try {
                this.h.send(message);
                return message.byteLength;
            }
            catch (err) {
                // noop
                return 0;
            }
        }
        q(message) {
            const reader = new $_g(message);
            const header = $ch(reader);
            const body = $ch(reader);
            const type = header[0];
            switch (type) {
                case 100 /* RequestType.Promise */:
                    this.k?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
                    return this.s({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
                case 102 /* RequestType.EventListen */:
                    this.k?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
                    return this.t({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
                case 101 /* RequestType.PromiseCancel */:
                    this.k?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}`);
                    return this.u({ type, id: header[1] });
                case 103 /* RequestType.EventDispose */:
                    this.k?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}`);
                    return this.u({ type, id: header[1] });
            }
        }
        s(request) {
            const channel = this.b.get(request.channelName);
            if (!channel) {
                this.v(request);
                return;
            }
            const cancellationTokenSource = new cancellation_1.$pd();
            let promise;
            try {
                promise = channel.call(this.j, request.name, request.arg, cancellationTokenSource.token);
            }
            catch (err) {
                promise = Promise.reject(err);
            }
            const id = request.id;
            promise.then(data => {
                this.m({ id, data, type: 201 /* ResponseType.PromiseSuccess */ });
            }, err => {
                if (err instanceof Error) {
                    this.m({
                        id, data: {
                            message: err.message,
                            name: err.name,
                            stack: err.stack ? (err.stack.split ? err.stack.split('\n') : err.stack) : undefined
                        }, type: 202 /* ResponseType.PromiseError */
                    });
                }
                else {
                    this.m({ id, data: err, type: 203 /* ResponseType.PromiseErrorObj */ });
                }
            }).finally(() => {
                disposable.dispose();
                this.d.delete(request.id);
            });
            const disposable = (0, lifecycle_1.$ic)(() => cancellationTokenSource.cancel());
            this.d.set(request.id, disposable);
        }
        t(request) {
            const channel = this.b.get(request.channelName);
            if (!channel) {
                this.v(request);
                return;
            }
            const id = request.id;
            const event = channel.listen(this.j, request.name, request.arg);
            const disposable = event(data => this.m({ id, data, type: 204 /* ResponseType.EventFire */ }));
            this.d.set(request.id, disposable);
        }
        u(request) {
            const disposable = this.d.get(request.id);
            if (disposable) {
                disposable.dispose();
                this.d.delete(request.id);
            }
        }
        v(request) {
            let pendingRequests = this.g.get(request.channelName);
            if (!pendingRequests) {
                pendingRequests = [];
                this.g.set(request.channelName, pendingRequests);
            }
            const timer = setTimeout(() => {
                console.error(`Unknown channel: ${request.channelName}`);
                if (request.type === 100 /* RequestType.Promise */) {
                    this.m({
                        id: request.id,
                        data: { name: 'Unknown channel', message: `Channel name '${request.channelName}' timed out after ${this.l}ms`, stack: undefined },
                        type: 202 /* ResponseType.PromiseError */
                    });
                }
            }, this.l);
            pendingRequests.push({ request, timeoutTimer: timer });
        }
        w(channelName) {
            const requests = this.g.get(channelName);
            if (requests) {
                for (const request of requests) {
                    clearTimeout(request.timeoutTimer);
                    switch (request.request.type) {
                        case 100 /* RequestType.Promise */:
                            this.s(request.request);
                            break;
                        case 102 /* RequestType.EventListen */:
                            this.t(request.request);
                            break;
                    }
                }
                this.g.delete(channelName);
            }
        }
        dispose() {
            if (this.f) {
                this.f.dispose();
                this.f = null;
            }
            (0, lifecycle_1.$fc)(this.d.values());
            this.d.clear();
        }
    }
    exports.$dh = $dh;
    var RequestInitiator;
    (function (RequestInitiator) {
        RequestInitiator[RequestInitiator["LocalSide"] = 0] = "LocalSide";
        RequestInitiator[RequestInitiator["OtherSide"] = 1] = "OtherSide";
    })(RequestInitiator || (exports.RequestInitiator = RequestInitiator = {}));
    class $eh {
        constructor(l, logger = null) {
            this.l = l;
            this.a = false;
            this.b = State.Uninitialized;
            this.d = new Set();
            this.f = new Map();
            this.g = 0;
            this.k = new event_1.$fd();
            this.onDidInitialize = this.k.event;
            this.h = this.l.onMessage(msg => this.s(msg));
            this.j = logger;
        }
        getChannel(channelName) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    if (that.a) {
                        return Promise.reject(new errors_1.$3());
                    }
                    return that.m(channelName, command, arg, cancellationToken);
                },
                listen(event, arg) {
                    if (that.a) {
                        return event_1.Event.None;
                    }
                    return that.o(channelName, event, arg);
                }
            };
        }
        m(channelName, name, arg, cancellationToken = cancellation_1.CancellationToken.None) {
            const id = this.g++;
            const type = 100 /* RequestType.Promise */;
            const request = { id, type, channelName, name, arg };
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject(new errors_1.$3());
            }
            let disposable;
            const result = new Promise((c, e) => {
                if (cancellationToken.isCancellationRequested) {
                    return e(new errors_1.$3());
                }
                const doRequest = () => {
                    const handler = response => {
                        switch (response.type) {
                            case 201 /* ResponseType.PromiseSuccess */:
                                this.f.delete(id);
                                c(response.data);
                                break;
                            case 202 /* ResponseType.PromiseError */: {
                                this.f.delete(id);
                                const error = new Error(response.data.message);
                                error.stack = Array.isArray(response.data.stack) ? response.data.stack.join('\n') : response.data.stack;
                                error.name = response.data.name;
                                e(error);
                                break;
                            }
                            case 203 /* ResponseType.PromiseErrorObj */:
                                this.f.delete(id);
                                e(response.data);
                                break;
                        }
                    };
                    this.f.set(id, handler);
                    this.p(request);
                };
                let uninitializedPromise = null;
                if (this.b === State.Idle) {
                    doRequest();
                }
                else {
                    uninitializedPromise = (0, async_1.$ug)(_ => this.u());
                    uninitializedPromise.then(() => {
                        uninitializedPromise = null;
                        doRequest();
                    });
                }
                const cancel = () => {
                    if (uninitializedPromise) {
                        uninitializedPromise.cancel();
                        uninitializedPromise = null;
                    }
                    else {
                        this.p({ id, type: 101 /* RequestType.PromiseCancel */ });
                    }
                    e(new errors_1.$3());
                };
                const cancellationTokenListener = cancellationToken.onCancellationRequested(cancel);
                disposable = (0, lifecycle_1.$hc)((0, lifecycle_1.$ic)(cancel), cancellationTokenListener);
                this.d.add(disposable);
            });
            return result.finally(() => {
                disposable.dispose();
                this.d.delete(disposable);
            });
        }
        o(channelName, name, arg) {
            const id = this.g++;
            const type = 102 /* RequestType.EventListen */;
            const request = { id, type, channelName, name, arg };
            let uninitializedPromise = null;
            const emitter = new event_1.$fd({
                onWillAddFirstListener: () => {
                    uninitializedPromise = (0, async_1.$ug)(_ => this.u());
                    uninitializedPromise.then(() => {
                        uninitializedPromise = null;
                        this.d.add(emitter);
                        this.p(request);
                    });
                },
                onDidRemoveLastListener: () => {
                    if (uninitializedPromise) {
                        uninitializedPromise.cancel();
                        uninitializedPromise = null;
                    }
                    else {
                        this.d.delete(emitter);
                        this.p({ id, type: 103 /* RequestType.EventDispose */ });
                    }
                }
            });
            const handler = (res) => emitter.fire(res.data);
            this.f.set(id, handler);
            return emitter.event;
        }
        p(request) {
            switch (request.type) {
                case 100 /* RequestType.Promise */:
                case 102 /* RequestType.EventListen */: {
                    const msgLength = this.q([request.type, request.id, request.channelName, request.name], request.arg);
                    this.j?.logOutgoing(msgLength, request.id, 0 /* RequestInitiator.LocalSide */, `${requestTypeToStr(request.type)}: ${request.channelName}.${request.name}`, request.arg);
                    return;
                }
                case 101 /* RequestType.PromiseCancel */:
                case 103 /* RequestType.EventDispose */: {
                    const msgLength = this.q([request.type, request.id]);
                    this.j?.logOutgoing(msgLength, request.id, 0 /* RequestInitiator.LocalSide */, requestTypeToStr(request.type));
                    return;
                }
            }
        }
        q(header, body = undefined) {
            const writer = new $ah();
            $bh(writer, header);
            $bh(writer, body);
            return this.r(writer.buffer);
        }
        r(message) {
            try {
                this.l.send(message);
                return message.byteLength;
            }
            catch (err) {
                // noop
                return 0;
            }
        }
        s(message) {
            const reader = new $_g(message);
            const header = $ch(reader);
            const body = $ch(reader);
            const type = header[0];
            switch (type) {
                case 200 /* ResponseType.Initialize */:
                    this.j?.logIncoming(message.byteLength, 0, 0 /* RequestInitiator.LocalSide */, responseTypeToStr(type));
                    return this.t({ type: header[0] });
                case 201 /* ResponseType.PromiseSuccess */:
                case 202 /* ResponseType.PromiseError */:
                case 204 /* ResponseType.EventFire */:
                case 203 /* ResponseType.PromiseErrorObj */:
                    this.j?.logIncoming(message.byteLength, header[1], 0 /* RequestInitiator.LocalSide */, responseTypeToStr(type), body);
                    return this.t({ type: header[0], id: header[1], data: body });
            }
        }
        t(response) {
            if (response.type === 200 /* ResponseType.Initialize */) {
                this.b = State.Idle;
                this.k.fire();
                return;
            }
            const handler = this.f.get(response.id);
            handler?.(response);
        }
        get onDidInitializePromise() {
            return event_1.Event.toPromise(this.onDidInitialize);
        }
        u() {
            if (this.b === State.Idle) {
                return Promise.resolve();
            }
            else {
                return this.onDidInitializePromise;
            }
        }
        dispose() {
            this.a = true;
            if (this.h) {
                this.h.dispose();
                this.h = null;
            }
            (0, lifecycle_1.$fc)(this.d.values());
            this.d.clear();
        }
    }
    exports.$eh = $eh;
    __decorate([
        decorators_1.$6g
    ], $eh.prototype, "onDidInitializePromise", null);
    /**
     * An `IPCServer` is both a channel server and a routing channel
     * client.
     *
     * As the owner of a protocol, you should extend both this
     * and the `IPCClient` classes to get IPC implementations
     * for your protocol.
     */
    class $fh {
        get connections() {
            const result = [];
            this.f.forEach(ctx => result.push(ctx));
            return result;
        }
        constructor(onDidClientConnect) {
            this.a = new Map();
            this.f = new Set();
            this.g = new event_1.$fd();
            this.onDidAddConnection = this.g.event;
            this.h = new event_1.$fd();
            this.onDidRemoveConnection = this.h.event;
            this.j = new lifecycle_1.$jc();
            this.j.add(onDidClientConnect(({ protocol, onDidClientDisconnect }) => {
                const onFirstMessage = event_1.Event.once(protocol.onMessage);
                this.j.add(onFirstMessage(msg => {
                    const reader = new $_g(msg);
                    const ctx = $ch(reader);
                    const channelServer = new $dh(protocol, ctx);
                    const channelClient = new $eh(protocol);
                    this.a.forEach((channel, name) => channelServer.registerChannel(name, channel));
                    const connection = { channelServer, channelClient, ctx };
                    this.f.add(connection);
                    this.g.fire(connection);
                    this.j.add(onDidClientDisconnect(() => {
                        channelServer.dispose();
                        channelClient.dispose();
                        this.f.delete(connection);
                        this.h.fire(connection);
                    }));
                }));
            }));
        }
        getChannel(channelName, routerOrClientFilter) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    let connectionPromise;
                    if ((0, types_1.$xf)(routerOrClientFilter)) {
                        // when no router is provided, we go random client picking
                        const connection = (0, arrays_1.$2b)(that.connections.filter(routerOrClientFilter));
                        connectionPromise = connection
                            // if we found a client, let's call on it
                            ? Promise.resolve(connection)
                            // else, let's wait for a client to come along
                            : event_1.Event.toPromise(event_1.Event.filter(that.onDidAddConnection, routerOrClientFilter));
                    }
                    else {
                        connectionPromise = routerOrClientFilter.routeCall(that, command, arg);
                    }
                    const channelPromise = connectionPromise
                        .then(connection => connection.channelClient.getChannel(channelName));
                    return $hh(channelPromise)
                        .call(command, arg, cancellationToken);
                },
                listen(event, arg) {
                    if ((0, types_1.$xf)(routerOrClientFilter)) {
                        return that.k(channelName, routerOrClientFilter, event, arg);
                    }
                    const channelPromise = routerOrClientFilter.routeEvent(that, event, arg)
                        .then(connection => connection.channelClient.getChannel(channelName));
                    return $hh(channelPromise)
                        .listen(event, arg);
                }
            };
        }
        k(channelName, clientFilter, eventName, arg) {
            const that = this;
            let disposables;
            // Create an emitter which hooks up to all clients
            // as soon as first listener is added. It also
            // disconnects from all clients as soon as the last listener
            // is removed.
            const emitter = new event_1.$fd({
                onWillAddFirstListener: () => {
                    disposables = new lifecycle_1.$jc();
                    // The event multiplexer is useful since the active
                    // client list is dynamic. We need to hook up and disconnection
                    // to/from clients as they come and go.
                    const eventMultiplexer = new event_1.$ld();
                    const map = new Map();
                    const onDidAddConnection = (connection) => {
                        const channel = connection.channelClient.getChannel(channelName);
                        const event = channel.listen(eventName, arg);
                        const disposable = eventMultiplexer.add(event);
                        map.set(connection, disposable);
                    };
                    const onDidRemoveConnection = (connection) => {
                        const disposable = map.get(connection);
                        if (!disposable) {
                            return;
                        }
                        disposable.dispose();
                        map.delete(connection);
                    };
                    that.connections.filter(clientFilter).forEach(onDidAddConnection);
                    event_1.Event.filter(that.onDidAddConnection, clientFilter)(onDidAddConnection, undefined, disposables);
                    that.onDidRemoveConnection(onDidRemoveConnection, undefined, disposables);
                    eventMultiplexer.event(emitter.fire, emitter, disposables);
                    disposables.add(eventMultiplexer);
                },
                onDidRemoveLastListener: () => {
                    disposables?.dispose();
                    disposables = undefined;
                }
            });
            return emitter.event;
        }
        registerChannel(channelName, channel) {
            this.a.set(channelName, channel);
            for (const connection of this.f) {
                connection.channelServer.registerChannel(channelName, channel);
            }
        }
        dispose() {
            this.j.dispose();
            for (const connection of this.f) {
                connection.channelClient.dispose();
                connection.channelServer.dispose();
            }
            this.f.clear();
            this.a.clear();
            this.g.dispose();
            this.h.dispose();
        }
    }
    exports.$fh = $fh;
    /**
     * An `IPCClient` is both a channel client and a channel server.
     *
     * As the owner of a protocol, you should extend both this
     * and the `IPCServer` classes to get IPC implementations
     * for your protocol.
     */
    class $gh {
        constructor(protocol, ctx, ipcLogger = null) {
            const writer = new $ah();
            $bh(writer, ctx);
            protocol.send(writer.buffer);
            this.a = new $eh(protocol, ipcLogger);
            this.d = new $dh(protocol, ctx, ipcLogger);
        }
        getChannel(channelName) {
            return this.a.getChannel(channelName);
        }
        registerChannel(channelName, channel) {
            this.d.registerChannel(channelName, channel);
        }
        dispose() {
            this.a.dispose();
            this.d.dispose();
        }
    }
    exports.$gh = $gh;
    function $hh(promise) {
        return {
            call(command, arg, cancellationToken) {
                return promise.then(c => c.call(command, arg, cancellationToken));
            },
            listen(event, arg) {
                const relay = new event_1.$od();
                promise.then(c => relay.input = c.listen(event, arg));
                return relay.event;
            }
        };
    }
    exports.$hh = $hh;
    function $ih(channel) {
        let didTick = false;
        return {
            call(command, arg, cancellationToken) {
                if (didTick) {
                    return channel.call(command, arg, cancellationToken);
                }
                return (0, async_1.$Hg)(0)
                    .then(() => didTick = true)
                    .then(() => channel.call(command, arg, cancellationToken));
            },
            listen(event, arg) {
                if (didTick) {
                    return channel.listen(event, arg);
                }
                const relay = new event_1.$od();
                (0, async_1.$Hg)(0)
                    .then(() => didTick = true)
                    .then(() => relay.input = channel.listen(event, arg));
                return relay.event;
            }
        };
    }
    exports.$ih = $ih;
    class $jh {
        constructor(a) {
            this.a = a;
        }
        routeCall(hub) {
            return this.b(hub);
        }
        routeEvent(hub) {
            return this.b(hub);
        }
        async b(hub) {
            for (const connection of hub.connections) {
                if (await Promise.resolve(this.a(connection.ctx))) {
                    return Promise.resolve(connection);
                }
            }
            await event_1.Event.toPromise(hub.onDidAddConnection);
            return await this.b(hub);
        }
    }
    exports.$jh = $jh;
    /**
     * Use ProxyChannels to automatically wrapping and unwrapping
     * services to/from IPC channels, instead of manually wrapping
     * each service method and event.
     *
     * Restrictions:
     * - If marshalling is enabled, only `URI` and `RegExp` is converted
     *   automatically for you
     * - Events must follow the naming convention `onUpperCase`
     * - `CancellationToken` is currently not supported
     * - If a context is provided, you can use `AddFirstParameterToFunctions`
     *   utility to signal this in the receiving side type
     */
    var ProxyChannel;
    (function (ProxyChannel) {
        function fromService(service, disposables, options) {
            const handler = service;
            const disableMarshalling = options && options.disableMarshalling;
            // Buffer any event that should be supported by
            // iterating over all property keys and finding them
            const mapEventNameToEvent = new Map();
            for (const key in handler) {
                if (propertyIsEvent(key)) {
                    mapEventNameToEvent.set(key, event_1.Event.buffer(handler[key], true, undefined, disposables));
                }
            }
            return new class {
                listen(_, event, arg) {
                    const eventImpl = mapEventNameToEvent.get(event);
                    if (eventImpl) {
                        return eventImpl;
                    }
                    if (propertyIsDynamicEvent(event)) {
                        const target = handler[event];
                        if (typeof target === 'function') {
                            return target.call(handler, arg);
                        }
                    }
                    throw new errors_1.$_(`Event not found: ${event}`);
                }
                call(_, command, args) {
                    const target = handler[command];
                    if (typeof target === 'function') {
                        // Revive unless marshalling disabled
                        if (!disableMarshalling && Array.isArray(args)) {
                            for (let i = 0; i < args.length; i++) {
                                args[i] = (0, marshalling_1.$$g)(args[i]);
                            }
                        }
                        return target.apply(handler, args);
                    }
                    throw new errors_1.$_(`Method not found: ${command}`);
                }
            };
        }
        ProxyChannel.fromService = fromService;
        function toService(channel, options) {
            const disableMarshalling = options && options.disableMarshalling;
            return new Proxy({}, {
                get(_target, propKey) {
                    if (typeof propKey === 'string') {
                        // Check for predefined values
                        if (options?.properties?.has(propKey)) {
                            return options.properties.get(propKey);
                        }
                        // Dynamic Event
                        if (propertyIsDynamicEvent(propKey)) {
                            return function (arg) {
                                return channel.listen(propKey, arg);
                            };
                        }
                        // Event
                        if (propertyIsEvent(propKey)) {
                            return channel.listen(propKey);
                        }
                        // Function
                        return async function (...args) {
                            // Add context if any
                            let methodArgs;
                            if (options && !(0, types_1.$sf)(options.context)) {
                                methodArgs = [options.context, ...args];
                            }
                            else {
                                methodArgs = args;
                            }
                            const result = await channel.call(propKey, methodArgs);
                            // Revive unless marshalling disabled
                            if (!disableMarshalling) {
                                return (0, marshalling_1.$$g)(result);
                            }
                            return result;
                        };
                    }
                    throw new errors_1.$_(`Property not found: ${String(propKey)}`);
                }
            });
        }
        ProxyChannel.toService = toService;
        function propertyIsEvent(name) {
            // Assume a property is an event if it has a form of "onSomething"
            return name[0] === 'o' && name[1] === 'n' && strings.$Le(name.charCodeAt(2));
        }
        function propertyIsDynamicEvent(name) {
            // Assume a property is a dynamic event (a method that returns an event) if it has a form of "onDynamicSomething"
            return /^onDynamic/.test(name) && strings.$Le(name.charCodeAt(9));
        }
    })(ProxyChannel || (exports.ProxyChannel = ProxyChannel = {}));
    const colorTables = [
        ['#2977B1', '#FC802D', '#34A13A', '#D3282F', '#9366BA'],
        ['#8B564C', '#E177C0', '#7F7F7F', '#BBBE3D', '#2EBECD']
    ];
    function prettyWithoutArrays(data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data && typeof data === 'object' && typeof data.toString === 'function') {
            const result = data.toString();
            if (result !== '[object Object]') {
                return result;
            }
        }
        return data;
    }
    function pretty(data) {
        if (Array.isArray(data)) {
            return data.map(prettyWithoutArrays);
        }
        return prettyWithoutArrays(data);
    }
    function logWithColors(direction, totalLength, msgLength, req, initiator, str, data) {
        data = pretty(data);
        const colorTable = colorTables[initiator];
        const color = colorTable[req % colorTable.length];
        let args = [`%c[${direction}]%c[${String(totalLength).padStart(7, ' ')}]%c[len: ${String(msgLength).padStart(5, ' ')}]%c${String(req).padStart(5, ' ')} - ${str}`, 'color: darkgreen', 'color: grey', 'color: grey', `color: ${color}`];
        if (/\($/.test(str)) {
            args = args.concat(data);
            args.push(')');
        }
        else {
            args.push(data);
        }
        console.log.apply(console, args);
    }
    class $kh {
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.a = 0;
            this.b = 0;
        }
        logOutgoing(msgLength, requestId, initiator, str, data) {
            this.b += msgLength;
            logWithColors(this.d, this.b, msgLength, requestId, initiator, str, data);
        }
        logIncoming(msgLength, requestId, initiator, str, data) {
            this.a += msgLength;
            logWithColors(this.f, this.a, msgLength, requestId, initiator, str, data);
        }
    }
    exports.$kh = $kh;
});
//# sourceMappingURL=ipc.js.map