/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "net", "minimist", "vs/base/common/performance", "vs/base/common/errors", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net", "vs/platform/product/common/product", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/api/common/extensionHostMain", "vs/base/common/buffer", "vs/base/node/pfs", "vs/base/node/extpath", "vs/base/common/async", "vs/editor/common/config/editorOptions", "vs/workbench/api/node/uriTransformer", "vs/workbench/services/extensions/common/extensionHostEnv", "vs/workbench/api/common/extHost.common.services", "vs/workbench/api/node/extHost.node.services"], function (require, exports, net, minimist, performance, errors_1, ipc_net_1, ipc_net_2, product_1, extensionHostProtocol_1, extensionHostMain_1, buffer_1, pfs_1, extpath_1, async_1, editorOptions_1, uriTransformer_1, extensionHostEnv_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // workaround for https://github.com/microsoft/vscode/issues/85490
    // remove --inspect-port=0 after start so that it doesn't trigger LSP debugging
    (function removeInspectPort() {
        for (let i = 0; i < process.execArgv.length; i++) {
            if (process.execArgv[i] === '--inspect-port=0') {
                process.execArgv.splice(i, 1);
                i--;
            }
        }
    })();
    const args = minimist(process.argv.slice(2), {
        boolean: [
            'transformURIs',
            'skipWorkspaceStorageLock'
        ],
        string: [
            'useHostProxy' // 'true' | 'false' | undefined
        ]
    });
    // With Electron 2.x and node.js 8.x the "natives" module
    // can cause a native crash (see https://github.com/nodejs/node/issues/19891 and
    // https://github.com/electron/electron/issues/10905). To prevent this from
    // happening we essentially blocklist this module from getting loaded in any
    // extension by patching the node require() function.
    (function () {
        const Module = globalThis._VSCODE_NODE_MODULES.module;
        const originalLoad = Module._load;
        Module._load = function (request) {
            if (request === 'natives') {
                throw new Error('Either the extension or an NPM dependency is using the [unsupported "natives" node module](https://go.microsoft.com/fwlink/?linkid=871887).');
            }
            return originalLoad.apply(this, arguments);
        };
    })();
    // custom process.exit logic...
    const nativeExit = process.exit.bind(process);
    function patchProcess(allowExit) {
        process.exit = function (code) {
            if (allowExit) {
                nativeExit(code);
            }
            else {
                const err = new Error('An extension called process.exit() and this was prevented.');
                console.warn(err.stack);
            }
        };
        // override Electron's process.crash() method
        process.crash = function () {
            const err = new Error('An extension called process.crash() and this was prevented.');
            console.warn(err.stack);
        };
        // Set ELECTRON_RUN_AS_NODE environment variable for extensions that use
        // child_process.spawn with process.execPath and expect to run as node process
        // on the desktop.
        // Refs https://github.com/microsoft/vscode/issues/151012#issuecomment-1156593228
        process.env['ELECTRON_RUN_AS_NODE'] = '1';
    }
    // This calls exit directly in case the initialization is not finished and we need to exit
    // Otherwise, if initialization completed we go to extensionHostMain.terminate()
    let onTerminate = function (reason) {
        nativeExit();
    };
    function _createExtHostProtocol() {
        const extHostConnection = (0, extensionHostEnv_1.readExtHostConnection)(process.env);
        if (extHostConnection.type === 3 /* ExtHostConnectionType.MessagePort */) {
            return new Promise((resolve, reject) => {
                const withPorts = (ports) => {
                    const port = ports[0];
                    const onMessage = new ipc_net_1.BufferedEmitter();
                    port.on('message', (e) => onMessage.fire(buffer_1.VSBuffer.wrap(e.data)));
                    port.on('close', () => {
                        onTerminate('renderer closed the MessagePort');
                    });
                    port.start();
                    resolve({
                        onMessage: onMessage.event,
                        send: message => port.postMessage(message.buffer)
                    });
                };
                process.parentPort.on('message', (e) => withPorts(e.ports));
            });
        }
        else if (extHostConnection.type === 2 /* ExtHostConnectionType.Socket */) {
            return new Promise((resolve, reject) => {
                let protocol = null;
                const timer = setTimeout(() => {
                    onTerminate('VSCODE_EXTHOST_IPC_SOCKET timeout');
                }, 60000);
                const reconnectionGraceTime = 10800000 /* ProtocolConstants.ReconnectionGraceTime */;
                const reconnectionShortGraceTime = 300000 /* ProtocolConstants.ReconnectionShortGraceTime */;
                const disconnectRunner1 = new async_1.ProcessTimeRunOnceScheduler(() => onTerminate('renderer disconnected for too long (1)'), reconnectionGraceTime);
                const disconnectRunner2 = new async_1.ProcessTimeRunOnceScheduler(() => onTerminate('renderer disconnected for too long (2)'), reconnectionShortGraceTime);
                process.on('message', (msg, handle) => {
                    if (msg && msg.type === 'VSCODE_EXTHOST_IPC_SOCKET') {
                        // Disable Nagle's algorithm. We also do this on the server process,
                        // but nodejs doesn't document if this option is transferred with the socket
                        handle.setNoDelay(true);
                        const initialDataChunk = buffer_1.VSBuffer.wrap(Buffer.from(msg.initialDataChunk, 'base64'));
                        let socket;
                        if (msg.skipWebSocketFrames) {
                            socket = new ipc_net_2.NodeSocket(handle, 'extHost-socket');
                        }
                        else {
                            const inflateBytes = buffer_1.VSBuffer.wrap(Buffer.from(msg.inflateBytes, 'base64'));
                            socket = new ipc_net_2.WebSocketNodeSocket(new ipc_net_2.NodeSocket(handle, 'extHost-socket'), msg.permessageDeflate, inflateBytes, false);
                        }
                        if (protocol) {
                            // reconnection case
                            disconnectRunner1.cancel();
                            disconnectRunner2.cancel();
                            protocol.beginAcceptReconnection(socket, initialDataChunk);
                            protocol.endAcceptReconnection();
                            protocol.sendResume();
                        }
                        else {
                            clearTimeout(timer);
                            protocol = new ipc_net_1.PersistentProtocol({ socket, initialChunk: initialDataChunk });
                            protocol.sendResume();
                            protocol.onDidDispose(() => onTerminate('renderer disconnected'));
                            resolve(protocol);
                            // Wait for rich client to reconnect
                            protocol.onSocketClose(() => {
                                // The socket has closed, let's give the renderer a certain amount of time to reconnect
                                disconnectRunner1.schedule();
                            });
                        }
                    }
                    if (msg && msg.type === 'VSCODE_EXTHOST_IPC_REDUCE_GRACE_TIME') {
                        if (disconnectRunner2.isScheduled()) {
                            // we are disconnected and already running the short reconnection timer
                            return;
                        }
                        if (disconnectRunner1.isScheduled()) {
                            // we are disconnected and running the long reconnection timer
                            disconnectRunner2.schedule();
                        }
                    }
                });
                // Now that we have managed to install a message listener, ask the other side to send us the socket
                const req = { type: 'VSCODE_EXTHOST_IPC_READY' };
                process.send?.(req);
            });
        }
        else {
            const pipeName = extHostConnection.pipeName;
            return new Promise((resolve, reject) => {
                const socket = net.createConnection(pipeName, () => {
                    socket.removeListener('error', reject);
                    const protocol = new ipc_net_1.PersistentProtocol({ socket: new ipc_net_2.NodeSocket(socket, 'extHost-renderer') });
                    protocol.sendResume();
                    resolve(protocol);
                });
                socket.once('error', reject);
                socket.on('close', () => {
                    onTerminate('renderer closed the socket');
                });
            });
        }
    }
    async function createExtHostProtocol() {
        const protocol = await _createExtHostProtocol();
        return new class {
            constructor() {
                this._onMessage = new ipc_net_1.BufferedEmitter();
                this.onMessage = this._onMessage.event;
                this._terminating = false;
                protocol.onMessage((msg) => {
                    if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 2 /* MessageType.Terminate */)) {
                        this._terminating = true;
                        onTerminate('received terminate message from renderer');
                    }
                    else {
                        this._onMessage.fire(msg);
                    }
                });
            }
            send(msg) {
                if (!this._terminating) {
                    protocol.send(msg);
                }
            }
            async drain() {
                if (protocol.drain) {
                    return protocol.drain();
                }
            }
        };
    }
    function connectToRenderer(protocol) {
        return new Promise((c) => {
            // Listen init data message
            const first = protocol.onMessage(raw => {
                first.dispose();
                const initData = JSON.parse(raw.toString());
                const rendererCommit = initData.commit;
                const myCommit = product_1.default.commit;
                if (rendererCommit && myCommit) {
                    // Running in the built version where commits are defined
                    if (rendererCommit !== myCommit) {
                        nativeExit(55 /* ExtensionHostExitCode.VersionMismatch */);
                    }
                }
                if (initData.parentPid) {
                    // Kill oneself if one's parent dies. Much drama.
                    let epermErrors = 0;
                    setInterval(function () {
                        try {
                            process.kill(initData.parentPid, 0); // throws an exception if the main process doesn't exist anymore.
                            epermErrors = 0;
                        }
                        catch (e) {
                            if (e && e.code === 'EPERM') {
                                // Even if the parent process is still alive,
                                // some antivirus software can lead to an EPERM error to be thrown here.
                                // Let's terminate only if we get 3 consecutive EPERM errors.
                                epermErrors++;
                                if (epermErrors >= 3) {
                                    onTerminate(`parent process ${initData.parentPid} does not exist anymore (3 x EPERM): ${e.message} (code: ${e.code}) (errno: ${e.errno})`);
                                }
                            }
                            else {
                                onTerminate(`parent process ${initData.parentPid} does not exist anymore: ${e.message} (code: ${e.code}) (errno: ${e.errno})`);
                            }
                        }
                    }, 1000);
                    // In certain cases, the event loop can become busy and never yield
                    // e.g. while-true or process.nextTick endless loops
                    // So also use the native node module to do it from a separate thread
                    let watchdog;
                    try {
                        watchdog = globalThis._VSCODE_NODE_MODULES['native-watchdog'];
                        watchdog.start(initData.parentPid);
                    }
                    catch (err) {
                        // no problem...
                        (0, errors_1.onUnexpectedError)(err);
                    }
                }
                // Tell the outside that we are initialized
                protocol.send((0, extensionHostProtocol_1.createMessageOfType)(0 /* MessageType.Initialized */));
                c({ protocol, initData });
            });
            // Tell the outside that we are ready to receive messages
            protocol.send((0, extensionHostProtocol_1.createMessageOfType)(1 /* MessageType.Ready */));
        });
    }
    async function startExtensionHostProcess() {
        // Print a console message when rejection isn't handled within N seconds. For details:
        // see https://nodejs.org/api/process.html#process_event_unhandledrejection
        // and https://nodejs.org/api/process.html#process_event_rejectionhandled
        const unhandledPromises = [];
        process.on('unhandledRejection', (reason, promise) => {
            unhandledPromises.push(promise);
            setTimeout(() => {
                const idx = unhandledPromises.indexOf(promise);
                if (idx >= 0) {
                    promise.catch(e => {
                        unhandledPromises.splice(idx, 1);
                        if (!(0, errors_1.isCancellationError)(e)) {
                            console.warn(`rejected promise not handled within 1 second: ${e}`);
                            if (e && e.stack) {
                                console.warn(`stack trace: ${e.stack}`);
                            }
                            if (reason) {
                                (0, errors_1.onUnexpectedError)(reason);
                            }
                        }
                    });
                }
            }, 1000);
        });
        process.on('rejectionHandled', (promise) => {
            const idx = unhandledPromises.indexOf(promise);
            if (idx >= 0) {
                unhandledPromises.splice(idx, 1);
            }
        });
        // Print a console message when an exception isn't handled.
        process.on('uncaughtException', function (err) {
            if (!(0, errors_1.isSigPipeError)(err)) {
                (0, errors_1.onUnexpectedError)(err);
            }
        });
        performance.mark(`code/extHost/willConnectToRenderer`);
        const protocol = await createExtHostProtocol();
        performance.mark(`code/extHost/didConnectToRenderer`);
        const renderer = await connectToRenderer(protocol);
        performance.mark(`code/extHost/didWaitForInitData`);
        const { initData } = renderer;
        // setup things
        patchProcess(!!initData.environment.extensionTestsLocationURI); // to support other test frameworks like Jasmin that use process.exit (https://github.com/microsoft/vscode/issues/37708)
        initData.environment.useHostProxy = args.useHostProxy !== undefined ? args.useHostProxy !== 'false' : undefined;
        initData.environment.skipWorkspaceStorageLock = (0, editorOptions_1.boolean)(args.skipWorkspaceStorageLock, false);
        // host abstraction
        const hostUtils = new class NodeHost {
            constructor() {
                this.pid = process.pid;
            }
            exit(code) { nativeExit(code); }
            fsExists(path) { return pfs_1.Promises.exists(path); }
            fsRealpath(path) { return (0, extpath_1.realpath)(path); }
        };
        // Attempt to load uri transformer
        let uriTransformer = null;
        if (initData.remote.authority && args.transformURIs) {
            uriTransformer = (0, uriTransformer_1.createURITransformer)(initData.remote.authority);
        }
        const extensionHostMain = new extensionHostMain_1.ExtensionHostMain(renderer.protocol, initData, hostUtils, uriTransformer);
        // rewrite onTerminate-function to be a proper shutdown
        onTerminate = (reason) => extensionHostMain.terminate(reason);
    }
    startExtensionHostProcess().catch((err) => console.log(err));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFByb2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvZXh0ZW5zaW9uSG9zdFByb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFrQ2hHLGtFQUFrRTtJQUNsRSwrRUFBK0U7SUFDL0UsQ0FBQyxTQUFTLGlCQUFpQjtRQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakQsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLGtCQUFrQixFQUFFO2dCQUMvQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsRUFBRSxDQUFDO2FBQ0o7U0FDRDtJQUNGLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDNUMsT0FBTyxFQUFFO1lBQ1IsZUFBZTtZQUNmLDBCQUEwQjtTQUMxQjtRQUNELE1BQU0sRUFBRTtZQUNQLGNBQWMsQ0FBQywrQkFBK0I7U0FDOUM7S0FDRCxDQUFzQixDQUFDO0lBRXhCLHlEQUF5RDtJQUN6RCxnRkFBZ0Y7SUFDaEYsMkVBQTJFO0lBQzNFLDRFQUE0RTtJQUM1RSxxREFBcUQ7SUFDckQsQ0FBQztRQUNBLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFhLENBQUM7UUFDN0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUVsQyxNQUFNLENBQUMsS0FBSyxHQUFHLFVBQVUsT0FBZTtZQUN2QyxJ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