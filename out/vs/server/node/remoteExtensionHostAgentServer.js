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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "crypto", "fs", "net", "perf_hooks", "url", "vs/base/common/amd", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/osReleaseInfo", "vs/base/node/ports", "vs/base/node/unc", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/telemetry", "vs/server/node/extensionHostConnection", "vs/server/node/remoteExtensionManagement", "vs/server/node/serverConnectionToken", "vs/server/node/serverEnvironmentService", "vs/server/node/serverServices", "vs/server/node/webClientServer"], function (require, exports, crypto, fs, net, perf_hooks_1, url, amd_1, buffer_1, errors_1, extpath_1, lifecycle_1, network_1, path_1, perf, platform, strings_1, uri_1, uuid_1, osReleaseInfo_1, ports_1, unc_1, ipc_net_1, ipc_net_2, configuration_1, instantiation_1, log_1, productService_1, remoteHosts_1, telemetry_1, extensionHostConnection_1, remoteExtensionManagement_1, serverConnectionToken_1, serverEnvironmentService_1, serverServices_1, webClientServer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createServer = void 0;
    const SHUTDOWN_TIMEOUT = 5 * 60 * 1000;
    let RemoteExtensionHostAgentServer = class RemoteExtensionHostAgentServer extends lifecycle_1.Disposable {
        constructor(_socketServer, _connectionToken, _vsdaMod, hasWebClient, _environmentService, _productService, _logService, _instantiationService) {
            super();
            this._socketServer = _socketServer;
            this._connectionToken = _connectionToken;
            this._vsdaMod = _vsdaMod;
            this._environmentService = _environmentService;
            this._productService = _productService;
            this._logService = _logService;
            this._instantiationService = _instantiationService;
            this._webEndpointOriginChecker = WebEndpointOriginChecker.create(this._productService);
            this._serverRootPath = (0, remoteHosts_1.getRemoteServerRootPath)(_productService);
            this._extHostConnections = Object.create(null);
            this._managementConnections = Object.create(null);
            this._allReconnectionTokens = new Set();
            this._webClientServer = (hasWebClient
                ? this._instantiationService.createInstance(webClientServer_1.WebClientServer, this._connectionToken)
                : null);
            this._logService.info(`Extension host agent started.`);
            this._waitThenShutdown(true);
        }
        async handleRequest(req, res) {
            // Only serve GET requests
            if (req.method !== 'GET') {
                return (0, webClientServer_1.serveError)(req, res, 405, `Unsupported method ${req.method}`);
            }
            if (!req.url) {
                return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
            }
            const parsedUrl = url.parse(req.url, true);
            let pathname = parsedUrl.pathname;
            if (!pathname) {
                return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
            }
            // for now accept all paths, with or without server root path
            if (pathname.startsWith(this._serverRootPath) && pathname.charCodeAt(this._serverRootPath.length) === 47 /* CharCode.Slash */) {
                pathname = pathname.substring(this._serverRootPath.length);
            }
            // Version
            if (pathname === '/version') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                return void res.end(this._productService.commit || '');
            }
            // Delay shutdown
            if (pathname === '/delay-shutdown') {
                this._delayShutdown();
                res.writeHead(200);
                return void res.end('OK');
            }
            if (!(0, serverConnectionToken_1.requestHasValidConnectionToken)(this._connectionToken, req, parsedUrl)) {
                // invalid connection token
                return (0, webClientServer_1.serveError)(req, res, 403, `Forbidden.`);
            }
            if (pathname === '/vscode-remote-resource') {
                // Handle HTTP requests for resources rendered in the rich client (images, fonts, etc.)
                // These resources could be files shipped with extensions or even workspace files.
                const desiredPath = parsedUrl.query['path'];
                if (typeof desiredPath !== 'string') {
                    return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
                }
                let filePath;
                try {
                    filePath = uri_1.URI.from({ scheme: network_1.Schemas.file, path: desiredPath }).fsPath;
                }
                catch (err) {
                    return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
                }
                const responseHeaders = Object.create(null);
                if (this._environmentService.isBuilt) {
                    if ((0, extpath_1.isEqualOrParent)(filePath, this._environmentService.builtinExtensionsPath, !platform.isLinux)
                        || (0, extpath_1.isEqualOrParent)(filePath, this._environmentService.extensionsPath, !platform.isLinux)) {
                        responseHeaders['Cache-Control'] = 'public, max-age=31536000';
                    }
                }
                // Allow cross origin requests from the web worker extension host
                responseHeaders['Vary'] = 'Origin';
                const requestOrigin = req.headers['origin'];
                if (requestOrigin && this._webEndpointOriginChecker.matches(requestOrigin)) {
                    responseHeaders['Access-Control-Allow-Origin'] = requestOrigin;
                }
                return (0, webClientServer_1.serveFile)(filePath, 1 /* CacheControl.ETAG */, this._logService, req, res, responseHeaders);
            }
            // workbench web UI
            if (this._webClientServer) {
                this._webClientServer.handle(req, res, parsedUrl);
                return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return void res.end('Not found');
        }
        handleUpgrade(req, socket) {
            let reconnectionToken = (0, uuid_1.generateUuid)();
            let isReconnection = false;
            let skipWebSocketFrames = false;
            if (req.url) {
                const query = url.parse(req.url, true).query;
                if (typeof query.reconnectionToken === 'string') {
                    reconnectionToken = query.reconnectionToken;
                }
                if (query.reconnection === 'true') {
                    isReconnection = true;
                }
                if (query.skipWebSocketFrames === 'true') {
                    skipWebSocketFrames = true;
                }
            }
            if (req.headers['upgrade'] === undefined || req.headers['upgrade'].toLowerCase() !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
            // https://tools.ietf.org/html/rfc6455#section-4
            const requestNonce = req.headers['sec-websocket-key'];
            const hash = crypto.createHash('sha1');
            hash.update(requestNonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
            const responseNonce = hash.digest('base64');
            const responseHeaders = [
                `HTTP/1.1 101 Switching Protocols`,
                `Upgrade: websocket`,
                `Connection: Upgrade`,
                `Sec-WebSocket-Accept: ${responseNonce}`
            ];
            // See https://tools.ietf.org/html/rfc7692#page-12
            let permessageDeflate = false;
            if (!skipWebSocketFrames && !this._environmentService.args['disable-websocket-compression'] && req.headers['sec-websocket-extensions']) {
                const websocketExtensionOptions = Array.isArray(req.headers['sec-websocket-extensions']) ? req.headers['sec-websocket-extensions'] : [req.headers['sec-websocket-extensions']];
                for (const websocketExtensionOption of websocketExtensionOptions) {
                    if (/\b((server_max_window_bits)|(server_no_context_takeover)|(client_no_context_takeover))\b/.test(websocketExtensionOption)) {
                        // sorry, the server does not support zlib parameter tweaks
                        continue;
                    }
                    if (/\b(permessage-deflate)\b/.test(websocketExtensionOption)) {
                        permessageDeflate = true;
                        responseHeaders.push(`Sec-WebSocket-Extensions: permessage-deflate`);
                        break;
                    }
                    if (/\b(x-webkit-deflate-frame)\b/.test(websocketExtensionOption)) {
                        permessageDeflate = true;
                        responseHeaders.push(`Sec-WebSocket-Extensions: x-webkit-deflate-frame`);
                        break;
                    }
                }
            }
            socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
            // Never timeout this socket due to inactivity!
            socket.setTimeout(0);
            // Disable Nagle's algorithm
            socket.setNoDelay(true);
            // Finally!
            if (skipWebSocketFrames) {
                this._handleWebSocketConnection(new ipc_net_2.NodeSocket(socket, `server-connection-${reconnectionToken}`), isReconnection, reconnectionToken);
            }
            else {
                this._handleWebSocketConnection(new ipc_net_2.WebSocketNodeSocket(new ipc_net_2.NodeSocket(socket, `server-connection-${reconnectionToken}`), permessageDeflate, null, true), isReconnection, reconnectionToken);
            }
        }
        handleServerError(err) {
            this._logService.error(`Error occurred in server`);
            this._logService.error(err);
        }
        // Eventually cleanup
        _getRemoteAddress(socket) {
            let _socket;
            if (socket instanceof ipc_net_2.NodeSocket) {
                _socket = socket.socket;
            }
            else {
                _socket = socket.socket.socket;
            }
            return _socket.remoteAddress || `<unknown>`;
        }
        async _rejectWebSocketConnection(logPrefix, protocol, reason) {
            const socket = protocol.getSocket();
            this._logService.error(`${logPrefix} ${reason}.`);
            const errMessage = {
                type: 'error',
                reason: reason
            };
            protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(errMessage)));
            protocol.dispose();
            await socket.drain();
            socket.dispose();
        }
        /**
         * NOTE: Avoid using await in this method!
         * The problem is that await introduces a process.nextTick due to the implicit Promise.then
         * This can lead to some bytes being received and interpreted and a control message being emitted before the next listener has a chance to be registered.
         */
        _handleWebSocketConnection(socket, isReconnection, reconnectionToken) {
            const remoteAddress = this._getRemoteAddress(socket);
            const logPrefix = `[${remoteAddress}][${reconnectionToken.substr(0, 8)}]`;
            const protocol = new ipc_net_1.PersistentProtocol({ socket });
            const validator = this._vsdaMod ? new this._vsdaMod.validator() : null;
            const signer = this._vsdaMod ? new this._vsdaMod.signer() : null;
            let State;
            (function (State) {
                State[State["WaitingForAuth"] = 0] = "WaitingForAuth";
                State[State["WaitingForConnectionType"] = 1] = "WaitingForConnectionType";
                State[State["Done"] = 2] = "Done";
                State[State["Error"] = 3] = "Error";
            })(State || (State = {}));
            let state = 0 /* State.WaitingForAuth */;
            const rejectWebSocketConnection = (msg) => {
                state = 3 /* State.Error */;
                listener.dispose();
                this._rejectWebSocketConnection(logPrefix, protocol, msg);
            };
            const listener = protocol.onControlMessage((raw) => {
                if (state === 0 /* State.WaitingForAuth */) {
                    let msg1;
                    try {
                        msg1 = JSON.parse(raw.toString());
                    }
                    catch (err) {
                        return rejectWebSocketConnection(`Malformed first message`);
                    }
                    if (msg1.type !== 'auth') {
                        return rejectWebSocketConnection(`Invalid first message`);
                    }
                    if (this._connectionToken.type === 2 /* ServerConnectionTokenType.Mandatory */ && !this._connectionToken.validate(msg1.auth)) {
                        return rejectWebSocketConnection(`Unauthorized client refused: auth mismatch`);
                    }
                    // Send `sign` request
                    let signedData = (0, uuid_1.generateUuid)();
                    if (signer) {
                        try {
                            signedData = signer.sign(msg1.data);
                        }
                        catch (e) {
                        }
                    }
                    let someText = (0, uuid_1.generateUuid)();
                    if (validator) {
                        try {
                            someText = validator.createNewMessage(someText);
                        }
                        catch (e) {
                        }
                    }
                    const signRequest = {
                        type: 'sign',
                        data: someText,
                        signedData: signedData
                    };
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(signRequest)));
                    state = 1 /* State.WaitingForConnectionType */;
                }
                else if (state === 1 /* State.WaitingForConnectionType */) {
                    let msg2;
                    try {
                        msg2 = JSON.parse(raw.toString());
                    }
                    catch (err) {
                        return rejectWebSocketConnection(`Malformed second message`);
                    }
                    if (msg2.type !== 'connectionType') {
                        return rejectWebSocketConnection(`Invalid second message`);
                    }
                    if (typeof msg2.signedData !== 'string') {
                        return rejectWebSocketConnection(`Invalid second message field type`);
                    }
                    const rendererCommit = msg2.commit;
                    const myCommit = this._productService.commit;
                    if (rendererCommit && myCommit) {
                        // Running in the built version where commits are defined
                        if (rendererCommit !== myCommit) {
                            return rejectWebSocketConnection(`Client refused: version mismatch`);
                        }
                    }
                    let valid = false;
                    if (!validator) {
                        valid = true;
                    }
                    else if (this._connectionToken.validate(msg2.signedData)) {
                        // web client
                        valid = true;
                    }
                    else {
                        try {
                            valid = validator.validate(msg2.signedData) === 'ok';
                        }
                        catch (e) {
                        }
                    }
                    if (!valid) {
                        if (this._environmentService.isBuilt) {
                            return rejectWebSocketConnection(`Unauthorized client refused`);
                        }
                        else {
                            this._logService.error(`${logPrefix} Unauthorized client handshake failed but we proceed because of dev mode.`);
                        }
                    }
                    // We have received a new connection.
                    // This indicates that the server owner has connectivity.
                    // Therefore we will shorten the reconnection grace period for disconnected connections!
                    for (const key in this._managementConnections) {
                        const managementConnection = this._managementConnections[key];
                        managementConnection.shortenReconnectionGraceTimeIfNecessary();
                    }
                    for (const key in this._extHostConnections) {
                        const extHostConnection = this._extHostConnections[key];
                        extHostConnection.shortenReconnectionGraceTimeIfNecessary();
                    }
                    state = 2 /* State.Done */;
                    listener.dispose();
                    this._handleConnectionType(remoteAddress, logPrefix, protocol, socket, isReconnection, reconnectionToken, msg2);
                }
            });
        }
        async _handleConnectionType(remoteAddress, _logPrefix, protocol, socket, isReconnection, reconnectionToken, msg) {
            const logPrefix = (msg.desiredConnectionType === 1 /* ConnectionType.Management */
                ? `${_logPrefix}[ManagementConnection]`
                : msg.desiredConnectionType === 2 /* ConnectionType.ExtensionHost */
                    ? `${_logPrefix}[ExtensionHostConnection]`
                    : _logPrefix);
            if (msg.desiredConnectionType === 1 /* ConnectionType.Management */) {
                // This should become a management connection
                if (isReconnection) {
                    // This is a reconnection
                    if (!this._managementConnections[reconnectionToken]) {
                        if (!this._allReconnectionTokens.has(reconnectionToken)) {
                            // This is an unknown reconnection token
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (never seen)`);
                        }
                        else {
                            // This is a connection that was seen in the past, but is no longer valid
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (seen before)`);
                        }
                    }
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify({ type: 'ok' })));
                    const dataChunk = protocol.readEntireBuffer();
                    protocol.dispose();
                    this._managementConnections[reconnectionToken].acceptReconnection(remoteAddress, socket, dataChunk);
                }
                else {
                    // This is a fresh connection
                    if (this._managementConnections[reconnectionToken]) {
                        // Cannot have two concurrent connections using the same reconnection token
                        return this._rejectWebSocketConnection(logPrefix, protocol, `Duplicate reconnection token`);
                    }
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify({ type: 'ok' })));
                    const con = new remoteExtensionManagement_1.ManagementConnection(this._logService, reconnectionToken, remoteAddress, protocol);
                    this._socketServer.acceptConnection(con.protocol, con.onClose);
                    this._managementConnections[reconnectionToken] = con;
                    this._allReconnectionTokens.add(reconnectionToken);
                    con.onClose(() => {
                        delete this._managementConnections[reconnectionToken];
                    });
                }
            }
            else if (msg.desiredConnectionType === 2 /* ConnectionType.ExtensionHost */) {
                // This should become an extension host connection
                const startParams0 = msg.args || { language: 'en' };
                const startParams = await this._updateWithFreeDebugPort(startParams0);
                if (startParams.port) {
                    this._logService.trace(`${logPrefix} - startParams debug port ${startParams.port}`);
                }
                this._logService.trace(`${logPrefix} - startParams language: ${startParams.language}`);
                this._logService.trace(`${logPrefix} - startParams env: ${JSON.stringify(startParams.env)}`);
                if (isReconnection) {
                    // This is a reconnection
                    if (!this._extHostConnections[reconnectionToken]) {
                        if (!this._allReconnectionTokens.has(reconnectionToken)) {
                            // This is an unknown reconnection token
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (never seen)`);
                        }
                        else {
                            // This is a connection that was seen in the past, but is no longer valid
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (seen before)`);
                        }
                    }
                    protocol.sendPause();
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(startParams.port ? { debugPort: startParams.port } : {})));
                    const dataChunk = protocol.readEntireBuffer();
                    protocol.dispose();
                    this._extHostConnections[reconnectionToken].acceptReconnection(remoteAddress, socket, dataChunk);
                }
                else {
                    // This is a fresh connection
                    if (this._extHostConnections[reconnectionToken]) {
                        // Cannot have two concurrent connections using the same reconnection token
                        return this._rejectWebSocketConnection(logPrefix, protocol, `Duplicate reconnection token`);
                    }
                    protocol.sendPause();
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(startParams.port ? { debugPort: startParams.port } : {})));
                    const dataChunk = protocol.readEntireBuffer();
                    protocol.dispose();
                    const con = this._instantiationService.createInstance(extensionHostConnection_1.ExtensionHostConnection, reconnectionToken, remoteAddress, socket, dataChunk);
                    this._extHostConnections[reconnectionToken] = con;
                    this._allReconnectionTokens.add(reconnectionToken);
                    con.onClose(() => {
                        delete this._extHostConnections[reconnectionToken];
                        this._onDidCloseExtHostConnection();
                    });
                    con.start(startParams);
                }
            }
            else if (msg.desiredConnectionType === 3 /* ConnectionType.Tunnel */) {
                const tunnelStartParams = msg.args;
                this._createTunnel(protocol, tunnelStartParams);
            }
            else {
                return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown initial data received`);
            }
        }
        async _createTunnel(protocol, tunnelStartParams) {
            const remoteSocket = protocol.getSocket().socket;
            const dataChunk = protocol.readEntireBuffer();
            protocol.dispose();
            remoteSocket.pause();
            const localSocket = await this._connectTunnelSocket(tunnelStartParams.host, tunnelStartParams.port);
            if (dataChunk.byteLength > 0) {
                localSocket.write(dataChunk.buffer);
            }
            localSocket.on('end', () => remoteSocket.end());
            localSocket.on('close', () => remoteSocket.end());
            localSocket.on('error', () => remoteSocket.destroy());
            remoteSocket.on('end', () => localSocket.end());
            remoteSocket.on('close', () => localSocket.end());
            remoteSocket.on('error', () => localSocket.destroy());
            localSocket.pipe(remoteSocket);
            remoteSocket.pipe(localSocket);
        }
        _connectTunnelSocket(host, port) {
            return new Promise((c, e) => {
                const socket = net.createConnection({
                    host: host,
                    port: port,
                    autoSelectFamily: true
                }, () => {
                    socket.removeListener('error', e);
                    socket.pause();
                    c(socket);
                });
                socket.once('error', e);
            });
        }
        _updateWithFreeDebugPort(startParams) {
            if (typeof startParams.port === 'number') {
                return (0, ports_1.findFreePort)(startParams.port, 10 /* try 10 ports */, 5000 /* try up to 5 seconds */).then(freePort => {
                    startParams.port = freePort;
                    return startParams;
                });
            }
            // No port clear debug configuration.
            startParams.debugId = undefined;
            startParams.port = undefined;
            startParams.break = undefined;
            return Promise.resolve(startParams);
        }
        async _onDidCloseExtHostConnection() {
            if (!this._environmentService.args['enable-remote-auto-shutdown']) {
                return;
            }
            this._cancelShutdown();
            const hasActiveExtHosts = !!Object.keys(this._extHostConnections).length;
            if (!hasActiveExtHosts) {
                console.log('Last EH closed, waiting before shutting down');
                this._logService.info('Last EH closed, waiting before shutting down');
                this._waitThenShutdown();
            }
        }
        _waitThenShutdown(initial = false) {
            if (!this._environmentService.args['enable-remote-auto-shutdown']) {
                return;
            }
            if (this._environmentService.args['remote-auto-shutdown-without-delay'] && !initial) {
                this._shutdown();
            }
            else {
                this.shutdownTimer = setTimeout(() => {
                    this.shutdownTimer = undefined;
                    this._shutdown();
                }, SHUTDOWN_TIMEOUT);
            }
        }
        _shutdown() {
            const hasActiveExtHosts = !!Object.keys(this._extHostConnections).length;
            if (hasActiveExtHosts) {
                console.log('New EH opened, aborting shutdown');
                this._logService.info('New EH opened, aborting shutdown');
                return;
            }
            else {
                console.log('Last EH closed, shutting down');
                this._logService.info('Last EH closed, shutting down');
                this.dispose();
                process.exit(0);
            }
        }
        /**
         * If the server is in a shutdown timeout, cancel it and start over
         */
        _delayShutdown() {
            if (this.shutdownTimer) {
                console.log('Got delay-shutdown request while in shutdown timeout, delaying');
                this._logService.info('Got delay-shutdown request while in shutdown timeout, delaying');
                this._cancelShutdown();
                this._waitThenShutdown();
            }
        }
        _cancelShutdown() {
            if (this.shutdownTimer) {
                console.log('Cancelling previous shutdown timeout');
                this._logService.info('Cancelling previous shutdown timeout');
                clearTimeout(this.shutdownTimer);
                this.shutdownTimer = undefined;
            }
        }
    };
    RemoteExtensionHostAgentServer = __decorate([
        __param(4, serverEnvironmentService_1.IServerEnvironmentService),
        __param(5, productService_1.IProductService),
        __param(6, log_1.ILogService),
        __param(7, instantiation_1.IInstantiationService)
    ], RemoteExtensionHostAgentServer);
    async function createServer(address, args, REMOTE_DATA_FOLDER) {
        const connectionToken = await (0, serverConnectionToken_1.determineServerConnectionToken)(args);
        if (connectionToken instanceof serverConnectionToken_1.ServerConnectionTokenParseError) {
            console.warn(connectionToken.message);
            process.exit(1);
        }
        // setting up error handlers, first with console.error, then, once available, using the log service
        function initUnexpectedErrorHandler(handler) {
            (0, errors_1.setUnexpectedErrorHandler)(err => {
                // See https://github.com/microsoft/vscode-remote-release/issues/6481
                // In some circumstances, console.error will throw an asynchronous error. This asynchronous error
                // will end up here, and then it will be logged again, thus creating an endless asynchronous loop.
                // Here we try to break the loop by ignoring EPIPE errors that include our own unexpected error handler in the stack.
                if ((0, errors_1.isSigPipeError)(err) && err.stack && /unexpectedErrorHandler/.test(err.stack)) {
                    return;
                }
                handler(err);
            });
        }
        const unloggedErrors = [];
        initUnexpectedErrorHandler((error) => {
            unloggedErrors.push(error);
            console.error(error);
        });
        let didLogAboutSIGPIPE = false;
        process.on('SIGPIPE', () => {
            // See https://github.com/microsoft/vscode-remote-release/issues/6543
            // We would normally install a SIGPIPE listener in bootstrap.js
            // But in certain situations, the console itself can be in a broken pipe state
            // so logging SIGPIPE to the console will cause an infinite async loop
            if (!didLogAboutSIGPIPE) {
                didLogAboutSIGPIPE = true;
                (0, errors_1.onUnexpectedError)(new Error(`Unexpected SIGPIPE`));
            }
        });
        const disposables = new lifecycle_1.DisposableStore();
        const { socketServer, instantiationService } = await (0, serverServices_1.setupServerServices)(connectionToken, args, REMOTE_DATA_FOLDER, disposables);
        // Set the unexpected error handler after the services have been initialized, to avoid having
        // the telemetry service overwrite our handler
        instantiationService.invokeFunction((accessor) => {
            const logService = accessor.get(log_1.ILogService);
            unloggedErrors.forEach(error => logService.error(error));
            unloggedErrors.length = 0;
            initUnexpectedErrorHandler((error) => logService.error(error));
        });
        // On Windows, configure the UNC allow list based on settings
        instantiationService.invokeFunction((accessor) => {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            if (platform.isWindows) {
                if (configurationService.getValue('security.restrictUNCAccess') === false) {
                    (0, unc_1.disableUNCAccessRestrictions)();
                }
                else {
                    (0, unc_1.addUNCHostToAllowlist)(configurationService.getValue('security.allowedUNCHosts'));
                }
            }
        });
        //
        // On Windows, exit early with warning message to users about potential security issue
        // if there is node_modules folder under home drive or Users folder.
        //
        instantiationService.invokeFunction((accessor) => {
            const logService = accessor.get(log_1.ILogService);
            if (platform.isWindows && process.env.HOMEDRIVE && process.env.HOMEPATH) {
                const homeDirModulesPath = (0, path_1.join)(process.env.HOMEDRIVE, 'node_modules');
                const userDir = (0, path_1.dirname)((0, path_1.join)(process.env.HOMEDRIVE, process.env.HOMEPATH));
                const userDirModulesPath = (0, path_1.join)(userDir, 'node_modules');
                if (fs.existsSync(homeDirModulesPath) || fs.existsSync(userDirModulesPath)) {
                    const message = `

*
* !!!! Server terminated due to presence of CVE-2020-1416 !!!!
*
* Please remove the following directories and re-try
* ${homeDirModulesPath}
* ${userDirModulesPath}
*
* For more information on the vulnerability https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-1416
*

`;
                    logService.warn(message);
                    console.warn(message);
                    process.exit(0);
                }
            }
        });
        const vsdaMod = instantiationService.invokeFunction((accessor) => {
            const logService = accessor.get(log_1.ILogService);
            const hasVSDA = fs.existsSync((0, path_1.join)(network_1.FileAccess.asFileUri('').fsPath, '../node_modules/vsda'));
            if (hasVSDA) {
                try {
                    return globalThis._VSCODE_NODE_MODULES['vsda'];
                }
                catch (err) {
                    logService.error(err);
                }
            }
            return null;
        });
        const hasWebClient = fs.existsSync(network_1.FileAccess.asFileUri('vs/code/browser/workbench/workbench.html').fsPath);
        if (hasWebClient && address && typeof address !== 'string') {
            // ships the web ui!
            const queryPart = (connectionToken.type !== 0 /* ServerConnectionTokenType.None */ ? `?${network_1.connectionTokenQueryName}=${connectionToken.value}` : '');
            console.log(`Web UI available at http://localhost${address.port === 80 ? '' : `:${address.port}`}/${queryPart}`);
        }
        const remoteExtensionHostAgentServer = instantiationService.createInstance(RemoteExtensionHostAgentServer, socketServer, connectionToken, vsdaMod, hasWebClient);
        perf.mark('code/server/ready');
        const currentTime = perf_hooks_1.performance.now();
        const vscodeServerStartTime = global.vscodeServerStartTime;
        const vscodeServerListenTime = global.vscodeServerListenTime;
        const vscodeServerCodeLoadedTime = global.vscodeServerCodeLoadedTime;
        instantiationService.invokeFunction(async (accessor) => {
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            telemetryService.publicLog2('serverStart', {
                startTime: vscodeServerStartTime,
                startedTime: vscodeServerListenTime,
                codeLoadedTime: vscodeServerCodeLoadedTime,
                readyTime: currentTime
            });
            if (platform.isLinux) {
                const logService = accessor.get(log_1.ILogService);
                const releaseInfo = await (0, osReleaseInfo_1.getOSReleaseInfo)(logService.error.bind(logService));
                if (releaseInfo) {
                    telemetryService.publicLog2('serverPlatformInfo', {
                        platformId: releaseInfo.id,
                        platformVersionId: releaseInfo.version_id,
                        platformIdLike: releaseInfo.id_like
                    });
                }
            }
        });
        if (args['print-startup-performance']) {
            const stats = amd_1.LoaderStats.get();
            let output = '';
            output += '\n\n### Load AMD-module\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.amdLoad);
            output += '\n\n### Load commonjs-module\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.nodeRequire);
            output += '\n\n### Invoke AMD-module factory\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.amdInvoke);
            output += '\n\n### Invoke commonjs-module\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.nodeEval);
            output += `Start-up time: ${vscodeServerListenTime - vscodeServerStartTime}\n`;
            output += `Code loading time: ${vscodeServerCodeLoadedTime - vscodeServerStartTime}\n`;
            output += `Initialized time: ${currentTime - vscodeServerStartTime}\n`;
            output += `\n`;
            console.log(output);
        }
        return remoteExtensionHostAgentServer;
    }
    exports.createServer = createServer;
    class WebEndpointOriginChecker {
        static create(productService) {
            const webEndpointUrlTemplate = productService.webEndpointUrlTemplate;
            const commit = productService.commit;
            const quality = productService.quality;
            if (!webEndpointUrlTemplate || !commit || !quality) {
                return new WebEndpointOriginChecker(null);
            }
            const uuid = (0, uuid_1.generateUuid)();
            const exampleUrl = new URL(webEndpointUrlTemplate
                .replace('{{uuid}}', uuid)
                .replace('{{commit}}', commit)
                .replace('{{quality}}', quality));
            const exampleOrigin = exampleUrl.origin;
            const originRegExpSource = ((0, strings_1.escapeRegExpCharacters)(exampleOrigin)
                .replace(uuid, '[a-zA-Z0-9\\-]+'));
            try {
                const originRegExp = (0, strings_1.createRegExp)(`^${originRegExpSource}$`, true, { matchCase: false });
                return new WebEndpointOriginChecker(originRegExp);
            }
            catch (err) {
                return new WebEndpointOriginChecker(null);
            }
        }
        constructor(_originRegExp) {
            this._originRegExp = _originRegExp;
        }
        matches(origin) {
            if (!this._originRegExp) {
                return false;
            }
            return this._originRegExp.test(origin);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uSG9zdEFnZW50U2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvcmVtb3RlRXh0ZW5zaW9uSG9zdEFnZW50U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlDaEcsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQWdCdkMsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxzQkFBVTtRQVl0RCxZQUNrQixhQUF5RCxFQUN6RCxnQkFBdUMsRUFDdkMsUUFBNEIsRUFDN0MsWUFBcUIsRUFDTSxtQkFBK0QsRUFDekUsZUFBaUQsRUFDckQsV0FBeUMsRUFDL0IscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBVFMsa0JBQWEsR0FBYixhQUFhLENBQTRDO1lBQ3pELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBdUI7WUFDdkMsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFFRCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQTJCO1lBQ3hELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNkLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFkcEUsOEJBQXlCLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQWtCbEcsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFBLHFDQUF1QixFQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xE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