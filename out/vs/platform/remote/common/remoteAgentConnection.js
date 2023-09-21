/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/stopwatch", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.net", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteHosts"], function (require, exports, async_1, buffer_1, cancellation_1, errors_1, event_1, lifecycle_1, performance, stopwatch_1, uuid_1, ipc_net_1, remoteAuthorityResolver_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostPersistentConnection = exports.ManagementPersistentConnection = exports.PersistentConnection = exports.ReconnectionPermanentFailureEvent = exports.ConnectionGainEvent = exports.ReconnectionRunningEvent = exports.ReconnectionWaitEvent = exports.ConnectionLostEvent = exports.PersistentConnectionEventType = exports.connectRemoteAgentTunnel = exports.connectRemoteAgentExtensionHost = exports.connectRemoteAgentManagement = exports.ConnectionType = void 0;
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
        const source = new cancellation_1.CancellationTokenSource();
        setTimeout(() => source.cancel(), millis);
        return source.token;
    }
    function combineTimeoutCancellation(a, b) {
        if (a.isCancellationRequested || b.isCancellationRequested) {
            return cancellation_1.CancellationToken.Cancelled;
        }
        const source = new cancellation_1.CancellationTokenSource();
        a.onCancellationRequested(() => source.cancel());
        b.onCancellationRequested(() => source.cancel());
        return source.token;
    }
    class PromiseWithTimeout {
        get didTimeout() {
            return (this._state === 'timedout');
        }
        constructor(timeoutCancellationToken) {
            this._state = 'pending';
            this._disposables = new lifecycle_1.DisposableStore();
            this.promise = new Promise((resolve, reject) => {
                this._resolvePromise = resolve;
                this._rejectPromise = reject;
            });
            if (timeoutCancellationToken.isCancellationRequested) {
                this._timeout();
            }
            else {
                this._disposables.add(timeoutCancellationToken.onCancellationRequested(() => this._timeout()));
            }
        }
        registerDisposable(disposable) {
            if (this._state === 'pending') {
                this._disposables.add(disposable);
            }
            else {
                disposable.dispose();
            }
        }
        _timeout() {
            if (this._state !== 'pending') {
                return;
            }
            this._disposables.dispose();
            this._state = 'timedout';
            this._rejectPromise(this._createTimeoutError());
        }
        _createTimeoutError() {
            const err = new Error('Time limit reached');
            err.code = 'ETIMEDOUT';
            err.syscall = 'connect';
            return err;
        }
        resolve(value) {
            if (this._state !== 'pending') {
                return;
            }
            this._disposables.dispose();
            this._state = 'resolved';
            this._resolvePromise(value);
        }
        reject(err) {
            if (this._state !== 'pending') {
                return;
            }
            this._disposables.dispose();
            this._state = 'rejected';
            this._rejectPromise(err);
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
        const sw = stopwatch_1.StopWatch.create(false);
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
            socket = await createSocket(options.logService, options.remoteSocketFactoryService, options.connectTo, (0, remoteHosts_1.getRemoteServerRootPath)(options), `reconnectionToken=${options.reconnectionToken}&reconnection=${options.reconnectionProtocol ? 'true' : 'false'}`, connectionTypeToString(connectionType), `renderer-${connectionTypeToString(connectionType)}-${options.reconnectionToken}`, timeoutCancellationToken);
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
            protocol = new ipc_net_1.PersistentProtocol({ socket });
            ownsProtocol = true;
        }
        options.logService.trace(`${logPrefix} 3/6. sending AuthRequest control message.`);
        const message = await raceWithTimeoutCancellation(options.signService.createNewMessage((0, uuid_1.generateUuid)()), timeoutCancellationToken);
        const authRequest = {
            type: 'auth',
            auth: options.connectionToken || '00000000000000000000',
            data: message.data
        };
        protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(authRequest)));
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
            protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(connTypeRequest)));
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
    async function connectRemoteAgentManagement(options, remoteAuthority, clientId) {
        return createInitialConnection(options, async (simpleOptions) => {
            const { protocol } = await doConnectRemoteAgentManagement(simpleOptions, cancellation_1.CancellationToken.None);
            return new ManagementPersistentConnection(options, remoteAuthority, clientId, simpleOptions.reconnectionToken, protocol);
        });
    }
    exports.connectRemoteAgentManagement = connectRemoteAgentManagement;
    async function connectRemoteAgentExtensionHost(options, startArguments) {
        return createInitialConnection(options, async (simpleOptions) => {
            const { protocol, debugPort } = await doConnectRemoteAgentExtensionHost(simpleOptions, startArguments, cancellation_1.CancellationToken.None);
            return new ExtensionHostPersistentConnection(options, startArguments, simpleOptions.reconnectionToken, protocol, debugPort);
        });
    }
    exports.connectRemoteAgentExtensionHost = connectRemoteAgentExtensionHost;
    /**
     * Will attempt to connect 5 times. If it fails 5 consecutive times, it will give up.
     */
    async function createInitialConnection(options, connectionFactory) {
        const MAX_ATTEMPTS = 5;
        for (let attempt = 1;; attempt++) {
            try {
                const reconnectionToken = (0, uuid_1.generateUuid)();
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
                    PersistentConnection.triggerPermanentFailure(0, 0, remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err));
                    throw err;
                }
            }
        }
    }
    async function connectRemoteAgentTunnel(options, tunnelRemoteHost, tunnelRemotePort) {
        const simpleOptions = await resolveConnectionOptions(options, (0, uuid_1.generateUuid)(), null);
        const protocol = await doConnectRemoteAgentTunnel(simpleOptions, { host: tunnelRemoteHost, port: tunnelRemotePort }, cancellation_1.CancellationToken.None);
        return protocol;
    }
    exports.connectRemoteAgentTunnel = connectRemoteAgentTunnel;
    function sleep(seconds) {
        return (0, async_1.createCancelablePromise)(token => {
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
    class ConnectionLostEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.type = 0 /* PersistentConnectionEventType.ConnectionLost */;
        }
    }
    exports.ConnectionLostEvent = ConnectionLostEvent;
    class ReconnectionWaitEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, durationSeconds, cancellableTimer) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.durationSeconds = durationSeconds;
            this.cancellableTimer = cancellableTimer;
            this.type = 1 /* PersistentConnectionEventType.ReconnectionWait */;
        }
        skipWait() {
            this.cancellableTimer.cancel();
        }
    }
    exports.ReconnectionWaitEvent = ReconnectionWaitEvent;
    class ReconnectionRunningEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.type = 2 /* PersistentConnectionEventType.ReconnectionRunning */;
        }
    }
    exports.ReconnectionRunningEvent = ReconnectionRunningEvent;
    class ConnectionGainEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.type = 4 /* PersistentConnectionEventType.ConnectionGain */;
        }
    }
    exports.ConnectionGainEvent = ConnectionGainEvent;
    class ReconnectionPermanentFailureEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt, handled) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.handled = handled;
            this.type = 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */;
        }
    }
    exports.ReconnectionPermanentFailureEvent = ReconnectionPermanentFailureEvent;
    class PersistentConnection extends lifecycle_1.Disposable {
        static triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
            this._permanentFailure = true;
            this._permanentFailureMillisSinceLastIncomingData = millisSinceLastIncomingData;
            this._permanentFailureAttempt = attempt;
            this._permanentFailureHandled = handled;
            this._instances.forEach(instance => instance._gotoPermanentFailure(this._permanentFailureMillisSinceLastIncomingData, this._permanentFailureAttempt, this._permanentFailureHandled));
        }
        static debugTriggerReconnection() {
            this._instances.forEach(instance => instance._beginReconnecting());
        }
        static debugPauseSocketWriting() {
            this._instances.forEach(instance => instance._pauseSocketWriting());
        }
        static { this._permanentFailure = false; }
        static { this._permanentFailureMillisSinceLastIncomingData = 0; }
        static { this._permanentFailureAttempt = 0; }
        static { this._permanentFailureHandled = false; }
        static { this._instances = []; }
        get _isPermanentFailure() {
            return this._permanentFailure || PersistentConnection._permanentFailure;
        }
        constructor(_connectionType, _options, reconnectionToken, protocol, _reconnectionFailureIsFatal) {
            super();
            this._connectionType = _connectionType;
            this._options = _options;
            this.reconnectionToken = reconnectionToken;
            this.protocol = protocol;
            this._reconnectionFailureIsFatal = _reconnectionFailureIsFatal;
            this._onDidStateChange = this._register(new event_1.Emitter());
            this.onDidStateChange = this._onDidStateChange.event;
            this._permanentFailure = false;
            this._isReconnecting = false;
            this._isDisposed = false;
            this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, 0, 0));
            this._register(protocol.onSocketClose((e) => {
                const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
                if (!e) {
                    this._options.logService.info(`${logPrefix} received socket close event.`);
                }
                else if (e.type === 0 /* SocketCloseEventType.NodeSocketCloseEvent */) {
                    this._options.logService.info(`${logPrefix} received socket close event (hadError: ${e.hadError}).`);
                    if (e.error) {
                        this._options.logService.error(e.error);
                    }
                }
                else {
                    this._options.logService.info(`${logPrefix} received socket close event (wasClean: ${e.wasClean}, code: ${e.code}, reason: ${e.reason}).`);
                    if (e.event) {
                        this._options.logService.error(e.event);
                    }
                }
                this._beginReconnecting();
            }));
            this._register(protocol.onSocketTimeout((e) => {
                const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
                this._options.logService.info(`${logPrefix} received socket timeout event (unacknowledgedMsgCount: ${e.unacknowledgedMsgCount}, timeSinceOldestUnacknowledgedMsg: ${e.timeSinceOldestUnacknowledgedMsg}, timeSinceLastReceivedSomeData: ${e.timeSinceLastReceivedSomeData}).`);
                this._beginReconnecting();
            }));
            PersistentConnection._instances.push(this);
            this._register((0, lifecycle_1.toDisposable)(() => {
                const myIndex = PersistentConnection._instances.indexOf(this);
                if (myIndex >= 0) {
                    PersistentConnection._instances.splice(myIndex, 1);
                }
            }));
            if (this._isPermanentFailure) {
                this._gotoPermanentFailure(PersistentConnection._permanentFailureMillisSinceLastIncomingData, PersistentConnection._permanentFailureAttempt, PersistentConnection._permanentFailureHandled);
            }
        }
        dispose() {
            super.dispose();
            this._isDisposed = true;
        }
        async _beginReconnecting() {
            // Only have one reconnection loop active at a time.
            if (this._isReconnecting) {
                return;
            }
            try {
                this._isReconnecting = true;
                await this._runReconnectingLoop();
            }
            finally {
                this._isReconnecting = false;
            }
        }
        async _runReconnectingLoop() {
            if (this._isPermanentFailure || this._isDisposed) {
                // no more attempts!
                return;
            }
            const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
            this._options.logService.info(`${logPrefix} starting reconnecting loop. You can get more information with the trace log level.`);
            this._onDidStateChange.fire(new ConnectionLostEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData()));
            const TIMES = [0, 5, 5, 10, 10, 10, 10, 10, 30];
            let attempt = -1;
            do {
                attempt++;
                const waitTime = (attempt < TIMES.length ? TIMES[attempt] : TIMES[TIMES.length - 1]);
                try {
                    if (waitTime > 0) {
                        const sleepPromise = sleep(waitTime);
                        this._onDidStateChange.fire(new ReconnectionWaitEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), waitTime, sleepPromise));
                        this._options.logService.info(`${logPrefix} waiting for ${waitTime} seconds before reconnecting...`);
                        try {
                            await sleepPromise;
                        }
                        catch { } // User canceled timer
                    }
                    if (this._isPermanentFailure) {
                        this._options.logService.error(`${logPrefix} permanent failure occurred while running the reconnecting loop.`);
                        break;
                    }
                    // connection was lost, let's try to re-establish it
                    this._onDidStateChange.fire(new ReconnectionRunningEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                    this._options.logService.info(`${logPrefix} resolving connection...`);
                    const simpleOptions = await resolveConnectionOptions(this._options, this.reconnectionToken, this.protocol);
                    this._options.logService.info(`${logPrefix} connecting to ${simpleOptions.connectTo}...`);
                    await this._reconnect(simpleOptions, createTimeoutCancellation(RECONNECT_TIMEOUT));
                    this._options.logService.info(`${logPrefix} reconnected!`);
                    this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                    break;
                }
                catch (err) {
                    if (err.code === 'VSCODE_CONNECTION_ERROR') {
                        this._options.logService.error(`${logPrefix} A permanent error occurred in the reconnecting loop! Will give up now! Error:`);
                        this._options.logService.error(err);
                        this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                        break;
                    }
                    if (attempt > 360) {
                        // ReconnectionGraceTime is 3hrs, with 30s between attempts that yields a maximum of 360 attempts
                        this._options.logService.error(`${logPrefix} An error occurred while reconnecting, but it will be treated as a permanent error because the reconnection grace time has expired! Will give up now! Error:`);
                        this._options.logService.error(err);
                        this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                        break;
                    }
                    if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isTemporarilyNotAvailable(err)) {
                        this._options.logService.info(`${logPrefix} A temporarily not available error occurred while trying to reconnect, will try again...`);
                        this._options.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if ((err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') && err.syscall === 'connect') {
                        this._options.logService.info(`${logPrefix} A network error occurred while trying to reconnect, will try again...`);
                        this._options.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if ((0, errors_1.isCancellationError)(err)) {
                        this._options.logService.info(`${logPrefix} A promise cancelation error occurred while trying to reconnect, will try again...`);
                        this._options.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if (err instanceof remoteAuthorityResolver_1.RemoteAuthorityResolverError) {
                        this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
                        this._options.logService.error(err);
                        this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err));
                        break;
                    }
                    this._options.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
                    this._options.logService.error(err);
                    this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                    break;
                }
            } while (!this._isPermanentFailure && !this._isDisposed);
        }
        _onReconnectionPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
            if (this._reconnectionFailureIsFatal) {
                PersistentConnection.triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled);
            }
            else {
                this._gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled);
            }
        }
        _gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
            this._onDidStateChange.fire(new ReconnectionPermanentFailureEvent(this.reconnectionToken, millisSinceLastIncomingData, attempt, handled));
            safeDisposeProtocolAndSocket(this.protocol);
        }
        _pauseSocketWriting() {
            this.protocol.pauseSocketWriting();
        }
    }
    exports.PersistentConnection = PersistentConnection;
    class ManagementPersistentConnection extends PersistentConnection {
        constructor(options, remoteAuthority, clientId, reconnectionToken, protocol) {
            super(1 /* ConnectionType.Management */, options, reconnectionToken, protocol, /*reconnectionFailureIsFatal*/ true);
            this.client = this._register(new ipc_net_1.Client(protocol, {
                remoteAuthority: remoteAuthority,
                clientId: clientId
            }, options.ipcLogger));
        }
        async _reconnect(options, timeoutCancellationToken) {
            await doConnectRemoteAgentManagement(options, timeoutCancellationToken);
        }
    }
    exports.ManagementPersistentConnection = ManagementPersistentConnection;
    class ExtensionHostPersistentConnection extends PersistentConnection {
        constructor(options, startArguments, reconnectionToken, protocol, debugPort) {
            super(2 /* ConnectionType.ExtensionHost */, options, reconnectionToken, protocol, /*reconnectionFailureIsFatal*/ false);
            this._startArguments = startArguments;
            this.debugPort = debugPort;
        }
        async _reconnect(options, timeoutCancellationToken) {
            await doConnectRemoteAgentExtensionHost(options, this._startArguments, timeoutCancellationToken);
        }
    }
    exports.ExtensionHostPersistentConnection = ExtensionHostPersistentConnection;
    function safeDisposeProtocolAndSocket(protocol) {
        try {
            protocol.acceptDisconnect();
            const socket = protocol.getSocket();
            protocol.dispose();
            socket.dispose();
        }
        catch (err) {
            (0, errors_1.onUnexpectedError)(err);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQWdlbnRDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVtb3RlL2NvbW1vbi9yZW1vdGVBZ2VudENvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxNQUFNLGlCQUFpQixHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBRTlDLElBQWtCLGNBSWpCO0lBSkQsV0FBa0IsY0FBYztRQUMvQiwrREFBYyxDQUFBO1FBQ2QscUVBQWlCLENBQUE7UUFDakIsdURBQVUsQ0FBQTtJQUNYLENBQUMsRUFKaUIsY0FBYyw4QkFBZCxjQUFjLFFBSS9CO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxjQUE4QjtRQUM3RCxRQUFRLGNBQWMsRUFBRTtZQUN2QjtnQkFDQyxPQUFPLFlBQVksQ0FBQztZQUNyQjtnQkFDQyxPQUFPLGVBQWUsQ0FBQztZQUN4QjtnQkFDQyxPQUFPLFFBQVEsQ0FBQztTQUNqQjtJQUNGLENBQUM7SUE4Q0QsU0FBUyx5QkFBeUIsQ0FBQyxNQUFjO1FBQ2hELE1BQU0sTUFBTSxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztRQUM3QyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FBQyxDQUFvQixFQUFFLENBQW9CO1FBQzdFLElBQUksQ0FBQyxDQUFDLHVCQUF1QixJQUFJLENBQUMsQ0FBQyx1QkFBdUIsRUFBRTtZQUMzRCxPQUFPLGdDQUFpQixDQUFDLFNBQVMsQ0FBQztTQUNuQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztRQUM3QyxDQUFDLENBQUMsdUJB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