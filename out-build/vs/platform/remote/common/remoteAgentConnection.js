/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/stopwatch", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.net", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteHosts"], function (require, exports, async_1, buffer_1, cancellation_1, errors_1, event_1, lifecycle_1, performance, stopwatch_1, uuid_1, ipc_net_1, remoteAuthorityResolver_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8k = exports.$7k = exports.$6k = exports.$5k = exports.$4k = exports.$3k = exports.$2k = exports.$1k = exports.PersistentConnectionEventType = exports.$Zk = exports.$Yk = exports.$Xk = exports.ConnectionType = void 0;
    const RECONNECT_TIMEOUT = 30 * 1000 /* 30s */;
    var ConnectionType;
    (function (ConnectionType) {
        ConnectionType[ConnectionType["Management"] = 1] = "Management";
        ConnectionType[ConnectionType["ExtensionHost"] = 2] = "ExtensionHost";
        ConnectionType[ConnectionType["Tunnel"] = 3] = "Tunnel";
    })(ConnectionType || (exports.ConnectionType = ConnectionType = {}));
    function connectionTypeToString(connectionType) {
        switch (connectionType) {
            case 1 /* ConnectionType.Management */:
                return 'Management';
            case 2 /* ConnectionType.ExtensionHost */:
                return 'ExtensionHost';
            case 3 /* ConnectionType.Tunnel */:
                return 'Tunnel';
        }
    }
    function createTimeoutCancellation(millis) {
        const source = new cancellation_1.$pd();
        setTimeout(() => source.cancel(), millis);
        return source.token;
    }
    function combineTimeoutCancellation(a, b) {
        if (a.isCancellationRequested || b.isCancellationRequested) {
            return cancellation_1.CancellationToken.Cancelled;
        }
        const source = new cancellation_1.$pd();
        a.onCancellationRequested(() => source.cancel());
        b.onCancellationRequested(() => source.cancel());
        return source.token;
    }
    class PromiseWithTimeout {
        get didTimeout() {
            return (this.c === 'timedout');
        }
        constructor(timeoutCancellationToken) {
            this.c = 'pending';
            this.d = new lifecycle_1.$jc();
            this.promise = new Promise((resolve, reject) => {
                this.f = resolve;
                this.g = reject;
            });
            if (timeoutCancellationToken.isCancellationRequested) {
                this.h();
            }
            else {
                this.d.add(timeoutCancellationToken.onCancellationRequested(() => this.h()));
            }
        }
        registerDisposable(disposable) {
            if (this.c === 'pending') {
                this.d.add(disposable);
            }
            else {
                disposable.dispose();
            }
        }
        h() {
            if (this.c !== 'pending') {
                return;
            }
            this.d.dispose();
            this.c = 'timedout';
            this.g(this.i());
        }
        i() {
            const err = new Error('Time limit reached');
            err.code = 'ETIMEDOUT';
            err.syscall = 'connect';
            return err;
        }
        resolve(value) {
            if (this.c !== 'pending') {
                return;
            }
            this.d.dispose();
            this.c = 'resolved';
            this.f(value);
        }
        reject(err) {
            if (this.c !== 'pending') {
                return;
            }
            this.d.dispose();
            this.c = 'rejected';
            this.g(err);
        }
    }
    function readOneControlMessage(protocol, timeoutCancellationToken) {
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        result.registerDisposable(protocol.onControlMessage(raw => {
            const msg = JSON.parse(raw.toString());
            const error = getErrorFromMessage(msg);
            if (error) {
                result.reject(error);
            }
            else {
                result.resolve(msg);
            }
        }));
        return result.promise;
    }
    function createSocket(logService, remoteSocketFactoryService, connectTo, path, query, debugConnectionType, debugLabel, timeoutCancellationToken) {
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        const sw = stopwatch_1.$bd.create(false);
        logService.info(`Creating a socket (${debugLabel})...`);
        performance.mark(`code/willCreateSocket/${debugConnectionType}`);
        remoteSocketFactoryService.connect(connectTo, path, query, debugLabel).then((socket) => {
            if (result.didTimeout) {
                performance.mark(`code/didCreateSocketError/${debugConnectionType}`);
                logService.info(`Creating a socket (${debugLabel}) finished after ${sw.elapsed()} ms, but this is too late and has timed out already.`);
                socket?.dispose();
            }
            else {
                performance.mark(`code/didCreateSocketOK/${debugConnectionType}`);
                logService.info(`Creating a socket (${debugLabel}) was successful after ${sw.elapsed()} ms.`);
                result.resolve(socket);
            }
        }, (err) => {
            performance.mark(`code/didCreateSocketError/${debugConnectionType}`);
            logService.info(`Creating a socket (${debugLabel}) returned an error after ${sw.elapsed()} ms.`);
            logService.error(err);
            result.reject(err);
        });
        return result.promise;
    }
    function raceWithTimeoutCancellation(promise, timeoutCancellationToken) {
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        promise.then((res) => {
            if (!result.didTimeout) {
                result.resolve(res);
            }
        }, (err) => {
            if (!result.didTimeout) {
                result.reject(err);
            }
        });
        return result.promise;
    }
    async function connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken) {
        const logPrefix = connectLogPrefix(options, connectionType);
        options.logService.trace(`${logPrefix} 1/6. invoking socketFactory.connect().`);
        let socket;
        try {
            socket = await createSocket(options.logService, options.remoteSocketFactoryService, options.connectTo, (0, remoteHosts_1.$Qk)(options), `reconnectionToken=${options.reconnectionToken}&reconnection=${options.reconnectionProtocol ? 'true' : 'false'}`, connectionTypeToString(connectionType), `renderer-${connectionTypeToString(connectionType)}-${options.reconnectionToken}`, timeoutCancellationToken);
        }
        catch (error) {
            options.logService.error(`${logPrefix} socketFactory.connect() failed or timed out. Error:`);
            options.logService.error(error);
            throw error;
        }
        options.logService.trace(`${logPrefix} 2/6. socketFactory.connect() was successful.`);
        let protocol;
        let ownsProtocol;
        if (options.reconnectionProtocol) {
            options.reconnectionProtocol.beginAcceptReconnection(socket, null);
            protocol = options.reconnectionProtocol;
            ownsProtocol = false;
        }
        else {
            protocol = new ipc_net_1.$ph({ socket });
            ownsProtocol = true;
        }
        options.logService.trace(`${logPrefix} 3/6. sending AuthRequest control message.`);
        const message = await raceWithTimeoutCancellation(options.signService.createNewMessage((0, uuid_1.$4f)()), timeoutCancellationToken);
        const authRequest = {
            type: 'auth',
            auth: options.connectionToken || '00000000000000000000',
            data: message.data
        };
        protocol.sendControl(buffer_1.$Fd.fromString(JSON.stringify(authRequest)));
        try {
            const msg = await readOneControlMessage(protocol, combineTimeoutCancellation(timeoutCancellationToken, createTimeoutCancellation(10000)));
            if (msg.type !== 'sign' || typeof msg.data !== 'string') {
                const error = new Error('Unexpected handshake message');
                error.code = 'VSCODE_CONNECTION_ERROR';
                throw error;
            }
            options.logService.trace(`${logPrefix} 4/6. received SignRequest control message.`);
            const isValid = await raceWithTimeoutCancellation(options.signService.validate(message, msg.signedData), timeoutCancellationToken);
            if (!isValid) {
                const error = new Error('Refused to connect to unsupported server');
                error.code = 'VSCODE_CONNECTION_ERROR';
                throw error;
            }
            const signed = await raceWithTimeoutCancellation(options.signService.sign(msg.data), timeoutCancellationToken);
            const connTypeRequest = {
                type: 'connectionType',
                commit: options.commit,
                signedData: signed,
                desiredConnectionType: connectionType
            };
            if (args) {
                connTypeRequest.args = args;
            }
            options.logService.trace(`${logPrefix} 5/6. sending ConnectionTypeRequest control message.`);
            protocol.sendControl(buffer_1.$Fd.fromString(JSON.stringify(connTypeRequest)));
            return { protocol, ownsProtocol };
        }
        catch (error) {
            if (error && error.code === 'ETIMEDOUT') {
                options.logService.error(`${logPrefix} the handshake timed out. Error:`);
                options.logService.error(error);
            }
            if (error && error.code === 'VSCODE_CONNECTION_ERROR') {
                options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
                options.logService.error(error);
            }
            if (ownsProtocol) {
                safeDisposeProtocolAndSocket(protocol);
            }
            throw error;
        }
    }
    async function connectToRemoteExtensionHostAgentAndReadOneMessage(options, connectionType, args, timeoutCancellationToken) {
        const startTime = Date.now();
        const logPrefix = connectLogPrefix(options, connectionType);
        const { protocol, ownsProtocol } = await connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken);
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        result.registerDisposable(protocol.onControlMessage(raw => {
            const msg = JSON.parse(raw.toString());
            const error = getErrorFromMessage(msg);
            if (error) {
                options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
                options.logService.error(error);
                if (ownsProtocol) {
                    safeDisposeProtocolAndSocket(protocol);
                }
                result.reject(error);
            }
            else {
                options.reconnectionProtocol?.endAcceptReconnection();
                options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
                result.resolve({ protocol, firstMessage: msg });
            }
        }));
        return result.promise;
    }
    async function doConnectRemoteAgentManagement(options, timeoutCancellationToken) {
        const { protocol } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 1 /* ConnectionType.Management */, undefined, timeoutCancellationToken);
        return { protocol };
    }
    async function doConnectRemoteAgentExtensionHost(options, startArguments, timeoutCancellationToken) {
        const { protocol, firstMessage } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 2 /* ConnectionType.ExtensionHost */, startArguments, timeoutCancellationToken);
        const debugPort = firstMessage && firstMessage.debugPort;
        return { protocol, debugPort };
    }
    async function doConnectRemoteAgentTunnel(options, startParams, timeoutCancellationToken) {
        const startTime = Date.now();
        const logPrefix = connectLogPrefix(options, 3 /* ConnectionType.Tunnel */);
        const { protocol } = await connectToRemoteExtensionHostAgent(options, 3 /* ConnectionType.Tunnel */, startParams, timeoutCancellationToken);
        options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
        return protocol;
    }
    async function resolveConnectionOptions(options, reconnectionToken, reconnectionProtocol) {
        const { connectTo, connectionToken } = await options.addressProvider.getAddress();
        return {
            commit: options.commit,
            quality: options.quality,
            connectTo,
            connectionToken: connectionToken,
            reconnectionToken: reconnectionToken,
            reconnectionProtocol: reconnectionProtocol,
            remoteSocketFactoryService: options.remoteSocketFactoryService,
            signService: options.signService,
            logService: options.logService
        };
    }
    async function $Xk(options, remoteAuthority, clientId) {
        return createInitialConnection(options, async (simpleOptions) => {
            const { protocol } = await doConnectRemoteAgentManagement(simpleOptions, cancellation_1.CancellationToken.None);
            return new $7k(options, remoteAuthority, clientId, simpleOptions.reconnectionToken, protocol);
        });
    }
    exports.$Xk = $Xk;
    async function $Yk(options, startArguments) {
        return createInitialConnection(options, async (simpleOptions) => {
            const { protocol, debugPort } = await doConnectRemoteAgentExtensionHost(simpleOptions, startArguments, cancellation_1.CancellationToken.None);
            return new $8k(options, startArguments, simpleOptions.reconnectionToken, protocol, debugPort);
        });
    }
    exports.$Yk = $Yk;
    /**
     * Will attempt to connect 5 times. If it fails 5 consecutive times, it will give up.
     */
    async function createInitialConnection(options, connectionFactory) {
        const MAX_ATTEMPTS = 5;
        for (let attempt = 1;; attempt++) {
            try {
                const reconnectionToken = (0, uuid_1.$4f)();
                const simpleOptions = await resolveConnectionOptions(options, reconnectionToken, null);
                const result = await connectionFactory(simpleOptions);
                return result;
            }
            catch (err) {
                if (attempt < MAX_ATTEMPTS) {
                    options.logService.error(`[remote-connection][attempt ${attempt}] An error occurred in initial connection! Will retry... Error:`);
                    options.logService.error(err);
                }
                else {
                    options.logService.error(`[remote-connection][attempt ${attempt}]  An error occurred in initial connection! It will be treated as a permanent error. Error:`);
                    options.logService.error(err);
                    $6k.triggerPermanentFailure(0, 0, remoteAuthorityResolver_1.$Mk.isHandled(err));
                    throw err;
                }
            }
        }
    }
    async function $Zk(options, tunnelRemoteHost, tunnelRemotePort) {
        const simpleOptions = await resolveConnectionOptions(options, (0, uuid_1.$4f)(), null);
        const protocol = await doConnectRemoteAgentTunnel(simpleOptions, { host: tunnelRemoteHost, port: tunnelRemotePort }, cancellation_1.CancellationToken.None);
        return protocol;
    }
    exports.$Zk = $Zk;
    function sleep(seconds) {
        return (0, async_1.$ug)(token => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, seconds * 1000);
                token.onCancellationRequested(() => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        });
    }
    var PersistentConnectionEventType;
    (function (PersistentConnectionEventType) {
        PersistentConnectionEventType[PersistentConnectionEventType["ConnectionLost"] = 0] = "ConnectionLost";
        PersistentConnectionEventType[PersistentConnectionEventType["ReconnectionWait"] = 1] = "ReconnectionWait";
        PersistentConnectionEventType[PersistentConnectionEventType["ReconnectionRunning"] = 2] = "ReconnectionRunning";
        PersistentConnectionEventType[PersistentConnectionEventType["ReconnectionPermanentFailure"] = 3] = "ReconnectionPermanentFailure";
        PersistentConnectionEventType[PersistentConnectionEventType["ConnectionGain"] = 4] = "ConnectionGain";
    })(PersistentConnectionEventType || (exports.PersistentConnectionEventType = PersistentConnectionEventType = {}));
    class $1k {
        constructor(reconnectionToken, millisSinceLastIncomingData) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.type = 0 /* PersistentConnectionEventType.ConnectionLost */;
        }
    }
    exports.$1k = $1k;
    class $2k {
        constructor(reconnectionToken, millisSinceLastIncomingData, durationSeconds, c) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.durationSeconds = durationSeconds;
            this.c = c;
            this.type = 1 /* PersistentConnectionEventType.ReconnectionWait */;
        }
        skipWait() {
            this.c.cancel();
        }
    }
    exports.$2k = $2k;
    class $3k {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.type = 2 /* PersistentConnectionEventType.ReconnectionRunning */;
        }
    }
    exports.$3k = $3k;
    class $4k {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.type = 4 /* PersistentConnectionEventType.ConnectionGain */;
        }
    }
    exports.$4k = $4k;
    class $5k {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt, handled) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.handled = handled;
            this.type = 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */;
        }
    }
    exports.$5k = $5k;
    class $6k extends lifecycle_1.$kc {
        static triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
            this._permanentFailure = true;
            this.f = millisSinceLastIncomingData;
            this.g = attempt;
            this.h = handled;
            this.j.forEach(instance => instance.D(this.f, this.g, this.h));
        }
        static debugTriggerReconnection() {
            this.j.forEach(instance => instance.y());
        }
        static debugPauseSocketWriting() {
            this.j.forEach(instance => instance.F());
        }
        static { this._permanentFailure = false; }
        static { this.f = 0; }
        static { this.g = 0; }
        static { this.h = false; }
        static { this.j = []; }
        get n() {
            return this.c || $6k._permanentFailure;
        }
        constructor(t, u, reconnectionToken, protocol, w) {
            super();
            this.t = t;
            this.u = u;
            this.reconnectionToken = reconnectionToken;
            this.protocol = protocol;
            this.w = w;
            this.m = this.B(new event_1.$fd());
            this.onDidStateChange = this.m.event;
            this.c = false;
            this.r = false;
            this.s = false;
            this.m.fire(new $4k(this.reconnectionToken, 0, 0));
            this.B(protocol.onSocketClose((e) => {
                const logPrefix = commonLogPrefix(this.t, this.reconnectionToken, true);
                if (!e) {
                    this.u.logService.info(`${logPrefix} received socket close event.`);
                }
                else if (e.type === 0 /* SocketCloseEventType.NodeSocketCloseEvent */) {
                    this.u.logService.info(`${logPrefix} received socket close event (hadError: ${e.hadError}).`);
                    if (e.error) {
                        this.u.logService.error(e.error);
                    }
                }
                else {
                    this.u.logService.info(`${logPrefix} received socket close event (wasClean: ${e.wasClean}, code: ${e.code}, reason: ${e.reason}).`);
                    if (e.event) {
                        this.u.logService.error(e.event);
                    }
                }
                this.y();
            }));
            this.B(protocol.onSocketTimeout((e) => {
                const logPrefix = commonLogPrefix(this.t, this.reconnectionToken, true);
                this.u.logService.info(`${logPrefix} received socket timeout event (unacknowledgedMsgCount: ${e.unacknowledgedMsgCount}, timeSinceOldestUnacknowledgedMsg: ${e.timeSinceOldestUnacknowledgedMsg}, timeSinceLastReceivedSomeData: ${e.timeSinceLastReceivedSomeData}).`);
                this.y();
            }));
            $6k.j.push(this);
            this.B((0, lifecycle_1.$ic)(() => {
                const myIndex = $6k.j.indexOf(this);
                if (myIndex >= 0) {
                    $6k.j.splice(myIndex, 1);
                }
            }));
            if (this.n) {
                this.D($6k.f, $6k.g, $6k.h);
            }
        }
        dispose() {
            super.dispose();
            this.s = true;
        }
        async y() {
            // Only have one reconnection loop active at a time.
            if (this.r) {
                return;
            }
            try {
                this.r = true;
                await this.z();
            }
            finally {
                this.r = false;
            }
        }
        async z() {
            if (this.n || this.s) {
                // no more attempts!
                return;
            }
            const logPrefix = commonLogPrefix(this.t, this.reconnectionToken, true);
            this.u.logService.info(`${logPrefix} starting reconnecting loop. You can get more information with the trace log level.`);
            this.m.fire(new $1k(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData()));
            const TIMES = [0, 5, 5, 10, 10, 10, 10, 10, 30];
            let attempt = -1;
            do {
                attempt++;
                const waitTime = (attempt < TIMES.length ? TIMES[attempt] : TIMES[TIMES.length - 1]);
                try {
                    if (waitTime > 0) {
                        const sleepPromise = sleep(waitTime);
                        this.m.fire(new $2k(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), waitTime, sleepPromise));
                        this.u.logService.info(`${logPrefix} waiting for ${waitTime} seconds before reconnecting...`);
                        try {
                            await sleepPromise;
                        }
                        catch { } // User canceled timer
                    }
                    if (this.n) {
                        this.u.logService.error(`${logPrefix} permanent failure occurred while running the reconnecting loop.`);
                        break;
                    }
                    // connection was lost, let's try to re-establish it
                    this.m.fire(new $3k(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                    this.u.logService.info(`${logPrefix} resolving connection...`);
                    const simpleOptions = await resolveConnectionOptions(this.u, this.reconnectionToken, this.protocol);
                    this.u.logService.info(`${logPrefix} connecting to ${simpleOptions.connectTo}...`);
                    await this.G(simpleOptions, createTimeoutCancellation(RECONNECT_TIMEOUT));
                    this.u.logService.info(`${logPrefix} reconnected!`);
                    this.m.fire(new $4k(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                    break;
                }
                catch (err) {
                    if (err.code === 'VSCODE_CONNECTION_ERROR') {
                        this.u.logService.error(`${logPrefix} A permanent error occurred in the reconnecting loop! Will give up now! Error:`);
                        this.u.logService.error(err);
                        this.C(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                        break;
                    }
                    if (attempt > 360) {
                        // ReconnectionGraceTime is 3hrs, with 30s between attempts that yields a maximum of 360 attempts
                        this.u.logService.error(`${logPrefix} An error occurred while reconnecting, but it will be treated as a permanent error because the reconnection grace time has expired! Will give up now! Error:`);
                        this.u.logService.error(err);
                        this.C(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                        break;
                    }
                    if (remoteAuthorityResolver_1.$Mk.isTemporarilyNotAvailable(err)) {
                        this.u.logService.info(`${logPrefix} A temporarily not available error occurred while trying to reconnect, will try again...`);
                        this.u.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if ((err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') && err.syscall === 'connect') {
                        this.u.logService.info(`${logPrefix} A network error occurred while trying to reconnect, will try again...`);
                        this.u.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if ((0, errors_1.$2)(err)) {
                        this.u.logService.info(`${logPrefix} A promise cancelation error occurred while trying to reconnect, will try again...`);
                        this.u.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if (err instanceof remoteAuthorityResolver_1.$Mk) {
                        this.u.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
                        this.u.logService.error(err);
                        this.C(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, remoteAuthorityResolver_1.$Mk.isHandled(err));
                        break;
                    }
                    this.u.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
                    this.u.logService.error(err);
                    this.C(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                    break;
                }
            } while (!this.n && !this.s);
        }
        C(millisSinceLastIncomingData, attempt, handled) {
            if (this.w) {
                $6k.triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled);
            }
            else {
                this.D(millisSinceLastIncomingData, attempt, handled);
            }
        }
        D(millisSinceLastIncomingData, attempt, handled) {
            this.m.fire(new $5k(this.reconnectionToken, millisSinceLastIncomingData, attempt, handled));
            safeDisposeProtocolAndSocket(this.protocol);
        }
        F() {
            this.protocol.pauseSocketWriting();
        }
    }
    exports.$6k = $6k;
    class $7k extends $6k {
        constructor(options, remoteAuthority, clientId, reconnectionToken, protocol) {
            super(1 /* ConnectionType.Management */, options, reconnectionToken, protocol, /*reconnectionFailureIsFatal*/ true);
            this.client = this.B(new ipc_net_1.$nh(protocol, {
                remoteAuthority: remoteAuthority,
                clientId: clientId
            }, options.ipcLogger));
        }
        async G(options, timeoutCancellationToken) {
            await doConnectRemoteAgentManagement(options, timeoutCancellationToken);
        }
    }
    exports.$7k = $7k;
    class $8k extends $6k {
        constructor(options, startArguments, reconnectionToken, protocol, debugPort) {
            super(2 /* ConnectionType.ExtensionHost */, options, reconnectionToken, protocol, /*reconnectionFailureIsFatal*/ false);
            this.H = startArguments;
            this.debugPort = debugPort;
        }
        async G(options, timeoutCancellationToken) {
            await doConnectRemoteAgentExtensionHost(options, this.H, timeoutCancellationToken);
        }
    }
    exports.$8k = $8k;
    function safeDisposeProtocolAndSocket(protocol) {
        try {
            protocol.acceptDisconnect();
            const socket = protocol.getSocket();
            protocol.dispose();
            socket.dispose();
        }
        catch (err) {
            (0, errors_1.$Y)(err);
        }
    }
    function getErrorFromMessage(msg) {
        if (msg && msg.type === 'error') {
            const error = new Error(`Connection error: ${msg.reason}`);
            error.code = 'VSCODE_CONNECTION_ERROR';
            return error;
        }
        return null;
    }
    function stringRightPad(str, len) {
        while (str.length < len) {
            str += ' ';
        }
        return str;
    }
    function _commonLogPrefix(connectionType, reconnectionToken) {
        return `[remote-connection][${stringRightPad(connectionTypeToString(connectionType), 13)}][${reconnectionToken.substr(0, 5)}…]`;
    }
    function commonLogPrefix(connectionType, reconnectionToken, isReconnect) {
        return `${_commonLogPrefix(connectionType, reconnectionToken)}[${isReconnect ? 'reconnect' : 'initial'}]`;
    }
    function connectLogPrefix(options, connectionType) {
        return `${commonLogPrefix(connectionType, options.reconnectionToken, !!options.reconnectionProtocol)}[${options.connectTo}]`;
    }
    function logElapsed(startTime) {
        return `${Date.now() - startTime} ms`;
    }
});
//# sourceMappingURL=remoteAgentConnection.js.map