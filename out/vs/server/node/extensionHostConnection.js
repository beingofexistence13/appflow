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
define(["require", "exports", "child_process", "net", "vs/server/node/remoteLanguagePacks", "vs/base/common/network", "vs/base/common/path", "vs/base/common/buffer", "vs/base/common/event", "vs/base/parts/ipc/node/ipc.net", "vs/platform/shell/node/shellEnv", "vs/platform/log/common/log", "vs/server/node/serverEnvironmentService", "vs/base/common/platform", "vs/base/common/processes", "vs/server/node/extensionHostStatusService", "vs/base/common/lifecycle", "vs/workbench/services/extensions/common/extensionHostEnv", "vs/platform/configuration/common/configuration"], function (require, exports, cp, net, remoteLanguagePacks_1, network_1, path_1, buffer_1, event_1, ipc_net_1, shellEnv_1, log_1, serverEnvironmentService_1, platform_1, processes_1, extensionHostStatusService_1, lifecycle_1, extensionHostEnv_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostConnection = exports.buildUserEnvironment = void 0;
    async function buildUserEnvironment(startParamsEnv = {}, withUserShellEnvironment, language, environmentService, logService, configurationService) {
        const nlsConfig = await (0, remoteLanguagePacks_1.getNLSConfiguration)(language, environmentService.userDataPath);
        let userShellEnv = {};
        if (withUserShellEnvironment) {
            try {
                userShellEnv = await (0, shellEnv_1.getResolvedShellEnv)(configurationService, logService, environmentService.args, process.env);
            }
            catch (error) {
                logService.error('ExtensionHostConnection#buildUserEnvironment resolving shell environment failed', error);
            }
        }
        const processEnv = process.env;
        const env = {
            ...processEnv,
            ...userShellEnv,
            ...{
                VSCODE_AMD_ENTRYPOINT: 'vs/workbench/api/node/extensionHostProcess',
                VSCODE_HANDLES_UNCAUGHT_ERRORS: 'true',
                VSCODE_NLS_CONFIG: JSON.stringify(nlsConfig, undefined, 0)
            },
            ...startParamsEnv
        };
        const binFolder = environmentService.isBuilt ? (0, path_1.join)(environmentService.appRoot, 'bin') : (0, path_1.join)(environmentService.appRoot, 'resources', 'server', 'bin-dev');
        const remoteCliBinFolder = (0, path_1.join)(binFolder, 'remote-cli'); // contains the `code` command that can talk to the remote server
        let PATH = readCaseInsensitive(env, 'PATH');
        if (PATH) {
            PATH = remoteCliBinFolder + path_1.delimiter + PATH;
        }
        else {
            PATH = remoteCliBinFolder;
        }
        setCaseInsensitive(env, 'PATH', PATH);
        if (!environmentService.args['without-browser-env-var']) {
            env.BROWSER = (0, path_1.join)(binFolder, 'helpers', platform_1.isWindows ? 'browser.cmd' : 'browser.sh'); // a command that opens a browser on the local machine
        }
        removeNulls(env);
        return env;
    }
    exports.buildUserEnvironment = buildUserEnvironment;
    class ConnectionData {
        constructor(socket, initialDataChunk) {
            this.socket = socket;
            this.initialDataChunk = initialDataChunk;
        }
        socketDrain() {
            return this.socket.drain();
        }
        toIExtHostSocketMessage() {
            let skipWebSocketFrames;
            let permessageDeflate;
            let inflateBytes;
            if (this.socket instanceof ipc_net_1.NodeSocket) {
                skipWebSocketFrames = true;
                permessageDeflate = false;
                inflateBytes = buffer_1.VSBuffer.alloc(0);
            }
            else {
                skipWebSocketFrames = false;
                permessageDeflate = this.socket.permessageDeflate;
                inflateBytes = this.socket.recordedInflateBytes;
            }
            return {
                type: 'VSCODE_EXTHOST_IPC_SOCKET',
                initialDataChunk: this.initialDataChunk.buffer.toString('base64'),
                skipWebSocketFrames: skipWebSocketFrames,
                permessageDeflate: permessageDeflate,
                inflateBytes: inflateBytes.buffer.toString('base64'),
            };
        }
    }
    let ExtensionHostConnection = class ExtensionHostConnection {
        constructor(_reconnectionToken, remoteAddress, socket, initialDataChunk, _environmentService, _logService, _extensionHostStatusService, _configurationService) {
            this._reconnectionToken = _reconnectionToken;
            this._environmentService = _environmentService;
            this._logService = _logService;
            this._extensionHostStatusService = _extensionHostStatusService;
            this._configurationService = _configurationService;
            this._onClose = new event_1.Emitter();
            this.onClose = this._onClose.event;
            this._canSendSocket = (!platform_1.isWindows || !this._environmentService.args['socket-path']);
            this._disposed = false;
            this._remoteAddress = remoteAddress;
            this._extensionHostProcess = null;
            this._connectionData = new ConnectionData(socket, initialDataChunk);
            this._log(`New connection established.`);
        }
        get _logPrefix() {
            return `[${this._remoteAddress}][${this._reconnectionToken.substr(0, 8)}][ExtensionHostConnection] `;
        }
        _log(_str) {
            this._logService.info(`${this._logPrefix}${_str}`);
        }
        _logError(_str) {
            this._logService.error(`${this._logPrefix}${_str}`);
        }
        async _pipeSockets(extHostSocket, connectionData) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(connectionData.socket);
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                extHostSocket.destroy();
            }));
            const stopAndCleanup = () => {
                disposables.dispose();
            };
            disposables.add(connectionData.socket.onEnd(stopAndCleanup));
            disposables.add(connectionData.socket.onClose(stopAndCleanup));
            disposables.add(event_1.Event.fromNodeEventEmitter(extHostSocket, 'end')(stopAndCleanup));
            disposables.add(event_1.Event.fromNodeEventEmitter(extHostSocket, 'close')(stopAndCleanup));
            disposables.add(event_1.Event.fromNodeEventEmitter(extHostSocket, 'error')(stopAndCleanup));
            disposables.add(connectionData.socket.onData((e) => extHostSocket.write(e.buffer)));
            disposables.add(event_1.Event.fromNodeEventEmitter(extHostSocket, 'data')((e) => {
                connectionData.socket.write(buffer_1.VSBuffer.wrap(e));
            }));
            if (connectionData.initialDataChunk.byteLength > 0) {
                extHostSocket.write(connectionData.initialDataChunk.buffer);
            }
        }
        async _sendSocketToExtensionHost(extensionHostProcess, connectionData) {
            // Make sure all outstanding writes have been drained before sending the socket
            await connectionData.socketDrain();
            const msg = connectionData.toIExtHostSocketMessage();
            let socket;
            if (connectionData.socket instanceof ipc_net_1.NodeSocket) {
                socket = connectionData.socket.socket;
            }
            else {
                socket = connectionData.socket.socket.socket;
            }
            extensionHostProcess.send(msg, socket);
        }
        shortenReconnectionGraceTimeIfNecessary() {
            if (!this._extensionHostProcess) {
                return;
            }
            const msg = {
                type: 'VSCODE_EXTHOST_IPC_REDUCE_GRACE_TIME'
            };
            this._extensionHostProcess.send(msg);
        }
        acceptReconnection(remoteAddress, _socket, initialDataChunk) {
            this._remoteAddress = remoteAddress;
            this._log(`The client has reconnected.`);
            const connectionData = new ConnectionData(_socket, initialDataChunk);
            if (!this._extensionHostProcess) {
                // The extension host didn't even start up yet
                this._connectionData = connectionData;
                return;
            }
            this._sendSocketToExtensionHost(this._extensionHostProcess, connectionData);
        }
        _cleanResources() {
            if (this._disposed) {
                // already called
                return;
            }
            this._disposed = true;
            if (this._connectionData) {
                this._connectionData.socket.end();
                this._connectionData = null;
            }
            if (this._extensionHostProcess) {
                this._extensionHostProcess.kill();
                this._extensionHostProcess = null;
            }
            this._onClose.fire(undefined);
        }
        async start(startParams) {
            try {
                let execArgv = process.execArgv ? process.execArgv.filter(a => !/^--inspect(-brk)?=/.test(a)) : [];
                if (startParams.port && !process.pkg) {
                    execArgv = [`--inspect${startParams.break ? '-brk' : ''}=${startParams.port}`];
                }
                const env = await buildUserEnvironment(startParams.env, true, startParams.language, this._environmentService, this._logService, this._configurationService);
                (0, processes_1.removeDangerousEnvVariables)(env);
                let extHostNamedPipeServer;
                if (this._canSendSocket) {
                    (0, extensionHostEnv_1.writeExtHostConnection)(new extensionHostEnv_1.SocketExtHostConnection(), env);
                    extHostNamedPipeServer = null;
                }
                else {
                    const { namedPipeServer, pipeName } = await this._listenOnPipe();
                    (0, extensionHostEnv_1.writeExtHostConnection)(new extensionHostEnv_1.IPCExtHostConnection(pipeName), env);
                    extHostNamedPipeServer = namedPipeServer;
                }
                const opts = {
                    env,
                    execArgv,
                    silent: true
                };
                // Refs https://github.com/microsoft/vscode/issues/189805
                opts.execArgv.unshift('--dns-result-order=ipv4first');
                // Run Extension Host as fork of current process
                const args = ['--type=extensionHost', `--transformURIs`];
                const useHostProxy = this._environmentService.args['use-host-proxy'];
                args.push(`--useHostProxy=${useHostProxy ? 'true' : 'false'}`);
                this._extensionHostProcess = cp.fork(network_1.FileAccess.asFileUri('bootstrap-fork').fsPath, args, opts);
                const pid = this._extensionHostProcess.pid;
                this._log(`<${pid}> Launched Extension Host Process.`);
                // Catch all output coming from the extension host process
                this._extensionHostProcess.stdout.setEncoding('utf8');
                this._extensionHostProcess.stderr.setEncoding('utf8');
                const onStdout = event_1.Event.fromNodeEventEmitter(this._extensionHostProcess.stdout, 'data');
                const onStderr = event_1.Event.fromNodeEventEmitter(this._extensionHostProcess.stderr, 'data');
                onStdout((e) => this._log(`<${pid}> ${e}`));
                onStderr((e) => this._log(`<${pid}><stderr> ${e}`));
                // Lifecycle
                this._extensionHostProcess.on('error', (err) => {
                    this._logError(`<${pid}> Extension Host Process had an error`);
                    this._logService.error(err);
                    this._cleanResources();
                });
                this._extensionHostProcess.on('exit', (code, signal) => {
                    this._extensionHostStatusService.setExitInfo(this._reconnectionToken, { code, signal });
                    this._log(`<${pid}> Extension Host Process exited with code: ${code}, signal: ${signal}.`);
                    this._cleanResources();
                });
                if (extHostNamedPipeServer) {
                    extHostNamedPipeServer.on('connection', (socket) => {
                        extHostNamedPipeServer.close();
                        this._pipeSockets(socket, this._connectionData);
                    });
                }
                else {
                    const messageListener = (msg) => {
                        if (msg.type === 'VSCODE_EXTHOST_IPC_READY') {
                            this._extensionHostProcess.removeListener('message', messageListener);
                            this._sendSocketToExtensionHost(this._extensionHostProcess, this._connectionData);
                            this._connectionData = null;
                        }
                    };
                    this._extensionHostProcess.on('message', messageListener);
                }
            }
            catch (error) {
                console.error('ExtensionHostConnection errored');
                if (error) {
                    console.error(error);
                }
            }
        }
        _listenOnPipe() {
            return new Promise((resolve, reject) => {
                const pipeName = (0, ipc_net_1.createRandomIPCHandle)();
                const namedPipeServer = net.createServer();
                namedPipeServer.on('error', reject);
                namedPipeServer.listen(pipeName, () => {
                    namedPipeServer?.removeListener('error', reject);
                    resolve({ pipeName, namedPipeServer });
                });
            });
        }
    };
    exports.ExtensionHostConnection = ExtensionHostConnection;
    exports.ExtensionHostConnection = ExtensionHostConnection = __decorate([
        __param(4, serverEnvironmentService_1.IServerEnvironmentService),
        __param(5, log_1.ILogService),
        __param(6, extensionHostStatusService_1.IExtensionHostStatusService),
        __param(7, configuration_1.IConfigurationService)
    ], ExtensionHostConnection);
    function readCaseInsensitive(env, key) {
        const pathKeys = Object.keys(env).filter(k => k.toLowerCase() === key.toLowerCase());
        const pathKey = pathKeys.length > 0 ? pathKeys[0] : key;
        return env[pathKey];
    }
    function setCaseInsensitive(env, key, value) {
        const pathKeys = Object.keys(env).filter(k => k.toLowerCase() === key.toLowerCase());
        const pathKey = pathKeys.length > 0 ? pathKeys[0] : key;
        env[pathKey] = value;
    }
    function removeNulls(env) {
        // Don't delete while iterating the object itself
        for (const key of Object.keys(env)) {
            if (env[key] === null) {
                delete env[key];
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdENvbm5lY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9leHRlbnNpb25Ib3N0Q29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQnpGLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxpQkFBbUQsRUFBRSxFQUFFLHdCQUFpQyxFQUFFLFFBQWdCLEVBQUUsa0JBQTZDLEVBQUUsVUFBdUIsRUFBRSxvQkFBMkM7UUFDelEsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHlDQUFtQixFQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV2RixJQUFJLFlBQVksR0FBdUIsRUFBRSxDQUFDO1FBQzFDLElBQUksd0JBQXdCLEVBQUU7WUFDN0IsSUFBSTtnQkFDSCxZQUFZLEdBQUcsTUFBTSxJQUFBLDhCQUFtQixFQUFDLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pIO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsVUFBVSxDQUFDLEtBQUssQ0FBQyxpRkFBaUYsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMzRztTQUNEO1FBRUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUUvQixNQUFNLEdBQUcsR0FBd0I7WUFDaEMsR0FBRyxVQUFVO1lBQ2IsR0FBRyxZQUFZO1lBQ2YsR0FBRztnQkFDRixxQkFBcUIsRUFBRSw0Q0FBNEM7Z0JBQ25FLDhCQUE4QixFQUFFLE1BQU07Z0JBQ3RDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDMUQ7WUFDRCxHQUFHLGNBQWM7U0FDakIsQ0FBQztRQUVG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