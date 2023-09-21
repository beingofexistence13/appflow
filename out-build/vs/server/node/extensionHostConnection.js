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
    exports.$tm = exports.$sm = void 0;
    async function $sm(startParamsEnv = {}, withUserShellEnvironment, language, environmentService, logService, configurationService) {
        const nlsConfig = await (0, remoteLanguagePacks_1.$gl)(language, environmentService.userDataPath);
        let userShellEnv = {};
        if (withUserShellEnvironment) {
            try {
                userShellEnv = await (0, shellEnv_1.$Ml)(configurationService, logService, environmentService.args, process.env);
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
        const binFolder = environmentService.isBuilt ? (0, path_1.$9d)(environmentService.appRoot, 'bin') : (0, path_1.$9d)(environmentService.appRoot, 'resources', 'server', 'bin-dev');
        const remoteCliBinFolder = (0, path_1.$9d)(binFolder, 'remote-cli'); // contains the `code` command that can talk to the remote server
        let PATH = readCaseInsensitive(env, 'PATH');
        if (PATH) {
            PATH = remoteCliBinFolder + path_1.$ge + PATH;
        }
        else {
            PATH = remoteCliBinFolder;
        }
        setCaseInsensitive(env, 'PATH', PATH);
        if (!environmentService.args['without-browser-env-var']) {
            env.BROWSER = (0, path_1.$9d)(binFolder, 'helpers', platform_1.$i ? 'browser.cmd' : 'browser.sh'); // a command that opens a browser on the local machine
        }
        removeNulls(env);
        return env;
    }
    exports.$sm = $sm;
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
            if (this.socket instanceof ipc_net_1.$qh) {
                skipWebSocketFrames = true;
                permessageDeflate = false;
                inflateBytes = buffer_1.$Fd.alloc(0);
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
    let $tm = class $tm {
        constructor(i, remoteAddress, socket, initialDataChunk, j, l, m, n) {
            this.i = i;
            this.j = j;
            this.l = l;
            this.m = m;
            this.n = n;
            this.b = new event_1.$fd();
            this.onClose = this.b.event;
            this.c = (!platform_1.$i || !this.j.args['socket-path']);
            this.d = false;
            this.f = remoteAddress;
            this.g = null;
            this.h = new ConnectionData(socket, initialDataChunk);
            this.p(`New connection established.`);
        }
        get o() {
            return `[${this.f}][${this.i.substr(0, 8)}][ExtensionHostConnection] `;
        }
        p(_str) {
            this.l.info(`${this.o}${_str}`);
        }
        q(_str) {
            this.l.error(`${this.o}${_str}`);
        }
        async r(extHostSocket, connectionData) {
            const disposables = new lifecycle_1.$jc();
            disposables.add(connectionData.socket);
            disposables.add((0, lifecycle_1.$ic)(() => {
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
                connectionData.socket.write(buffer_1.$Fd.wrap(e));
            }));
            if (connectionData.initialDataChunk.byteLength > 0) {
                extHostSocket.write(connectionData.initialDataChunk.buffer);
            }
        }
        async s(extensionHostProcess, connectionData) {
            // Make sure all outstanding writes have been drained before sending the socket
            await connectionData.socketDrain();
            const msg = connectionData.toIExtHostSocketMessage();
            let socket;
            if (connectionData.socket instanceof ipc_net_1.$qh) {
                socket = connectionData.socket.socket;
            }
            else {
                socket = connectionData.socket.socket.socket;
            }
            extensionHostProcess.send(msg, socket);
        }
        shortenReconnectionGraceTimeIfNecessary() {
            if (!this.g) {
                return;
            }
            const msg = {
                type: 'VSCODE_EXTHOST_IPC_REDUCE_GRACE_TIME'
            };
            this.g.send(msg);
        }
        acceptReconnection(remoteAddress, _socket, initialDataChunk) {
            this.f = remoteAddress;
            this.p(`The client has reconnected.`);
            const connectionData = new ConnectionData(_socket, initialDataChunk);
            if (!this.g) {
                // The extension host didn't even start up yet
                this.h = connectionData;
                return;
            }
            this.s(this.g, connectionData);
        }
        t() {
            if (this.d) {
                // already called
                return;
            }
            this.d = true;
            if (this.h) {
                this.h.socket.end();
                this.h = null;
            }
            if (this.g) {
                this.g.kill();
                this.g = null;
            }
            this.b.fire(undefined);
        }
        async start(startParams) {
            try {
                let execArgv = process.execArgv ? process.execArgv.filter(a => !/^--inspect(-brk)?=/.test(a)) : [];
                if (startParams.port && !process.pkg) {
                    execArgv = [`--inspect${startParams.break ? '-brk' : ''}=${startParams.port}`];
                }
                const env = await $sm(startParams.env, true, startParams.language, this.j, this.l, this.n);
                (0, processes_1.$tl)(env);
                let extHostNamedPipeServer;
                if (this.c) {
                    (0, extensionHostEnv_1.$qm)(new extensionHostEnv_1.$om(), env);
                    extHostNamedPipeServer = null;
                }
                else {
                    const { namedPipeServer, pipeName } = await this.u();
                    (0, extensionHostEnv_1.$qm)(new extensionHostEnv_1.$nm(pipeName), env);
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
                const useHostProxy = this.j.args['use-host-proxy'];
                args.push(`--useHostProxy=${useHostProxy ? 'true' : 'false'}`);
                this.g = cp.fork(network_1.$2f.asFileUri('bootstrap-fork').fsPath, args, opts);
                const pid = this.g.pid;
                this.p(`<${pid}> Launched Extension Host Process.`);
                // Catch all output coming from the extension host process
                this.g.stdout.setEncoding('utf8');
                this.g.stderr.setEncoding('utf8');
                const onStdout = event_1.Event.fromNodeEventEmitter(this.g.stdout, 'data');
                const onStderr = event_1.Event.fromNodeEventEmitter(this.g.stderr, 'data');
                onStdout((e) => this.p(`<${pid}> ${e}`));
                onStderr((e) => this.p(`<${pid}><stderr> ${e}`));
                // Lifecycle
                this.g.on('error', (err) => {
                    this.q(`<${pid}> Extension Host Process had an error`);
                    this.l.error(err);
                    this.t();
                });
                this.g.on('exit', (code, signal) => {
                    this.m.setExitInfo(this.i, { code, signal });
                    this.p(`<${pid}> Extension Host Process exited with code: ${code}, signal: ${signal}.`);
                    this.t();
                });
                if (extHostNamedPipeServer) {
                    extHostNamedPipeServer.on('connection', (socket) => {
                        extHostNamedPipeServer.close();
                        this.r(socket, this.h);
                    });
                }
                else {
                    const messageListener = (msg) => {
                        if (msg.type === 'VSCODE_EXTHOST_IPC_READY') {
                            this.g.removeListener('message', messageListener);
                            this.s(this.g, this.h);
                            this.h = null;
                        }
                    };
                    this.g.on('message', messageListener);
                }
            }
            catch (error) {
                console.error('ExtensionHostConnection errored');
                if (error) {
                    console.error(error);
                }
            }
        }
        u() {
            return new Promise((resolve, reject) => {
                const pipeName = (0, ipc_net_1.$th)();
                const namedPipeServer = net.createServer();
                namedPipeServer.on('error', reject);
                namedPipeServer.listen(pipeName, () => {
                    namedPipeServer?.removeListener('error', reject);
                    resolve({ pipeName, namedPipeServer });
                });
            });
        }
    };
    exports.$tm = $tm;
    exports.$tm = $tm = __decorate([
        __param(4, serverEnvironmentService_1.$dm),
        __param(5, log_1.$5i),
        __param(6, extensionHostStatusService_1.$lm),
        __param(7, configuration_1.$8h)
    ], $tm);
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
//# sourceMappingURL=extensionHostConnection.js.map