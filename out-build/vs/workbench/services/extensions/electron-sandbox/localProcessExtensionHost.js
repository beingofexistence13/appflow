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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/processes", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/electron-sandbox/ipc.mp", "vs/nls!vs/workbench/services/extensions/electron-sandbox/localProcessExtensionHost", "vs/platform/configuration/common/configuration", "vs/platform/debug/common/extensionHostDebug", "vs/platform/extensions/common/extensionHostStarter", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/extensions/common/extensionHostEnv", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "../common/extensionDevOptions"], function (require, exports, async_1, buffer_1, errors_1, event_1, lifecycle_1, objects, platform, processes_1, stopwatch_1, uri_1, uuid_1, ipc_net_1, ipc_mp_1, nls, configuration_1, extensionHostDebug_1, extensionHostStarter_1, label_1, log_1, native_1, notification_1, productService_1, telemetry_1, telemetryUtils_1, userDataProfile_1, workspace_1, environmentService_1, shellEnvironmentService_1, extensionHostEnv_1, extensionHostProtocol_1, host_1, lifecycle_2, extensionDevOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aac = exports.$__b = exports.$$_b = void 0;
    class $$_b {
        get onStdout() {
            return this.b.onDynamicStdout(this.a);
        }
        get onStderr() {
            return this.b.onDynamicStderr(this.a);
        }
        get onMessage() {
            return this.b.onDynamicMessage(this.a);
        }
        get onExit() {
            return this.b.onDynamicExit(this.a);
        }
        constructor(id, b) {
            this.b = b;
            this.a = id;
        }
        start(opts) {
            return this.b.start(this.a, opts);
        }
        enableInspectPort() {
            return this.b.enableInspectPort(this.a);
        }
        kill() {
            return this.b.kill(this.a);
        }
    }
    exports.$$_b = $$_b;
    let $__b = class $__b {
        constructor(runningLocation, startup, m, n, p, q, s, t, u, v, w, x, y, z, A, B, C, D, E) {
            this.runningLocation = runningLocation;
            this.startup = startup;
            this.m = m;
            this.n = n;
            this.p = p;
            this.q = q;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.remoteAuthority = null;
            this.extensions = null;
            this.a = new event_1.$fd();
            this.onExit = this.a.event;
            this.b = new event_1.$fd();
            this.c = new lifecycle_1.$jc();
            const devOpts = (0, extensionDevOptions_1.$Ccb)(this.t);
            this.d = devOpts.isExtensionDevHost;
            this.f = devOpts.isExtensionDevDebug;
            this.g = devOpts.isExtensionDevDebugBrk;
            this.h = devOpts.isExtensionDevTestFromCli;
            this.i = false;
            this.j = null;
            this.k = null;
            this.l = null;
            this.c.add(this.a);
            this.c.add(this.s.onWillShutdown(e => this.M(e)));
            this.c.add(this.z.onClose(event => {
                if (this.d && this.t.debugExtensionHost.debugId === event.sessionId) {
                    this.q.closeWindow();
                }
            }));
            this.c.add(this.z.onReload(event => {
                if (this.d && this.t.debugExtensionHost.debugId === event.sessionId) {
                    this.A.reload();
                }
            }));
        }
        dispose() {
            if (this.i) {
                return;
            }
            this.i = true;
            this.c.dispose();
        }
        start() {
            if (this.i) {
                // .terminate() was called
                throw new errors_1.$3();
            }
            if (!this.l) {
                this.l = this.F();
            }
            return this.l;
        }
        async F() {
            const communication = this.c.add(new $aac(this.w));
            return this.G(communication);
        }
        async G(communication) {
            const [extensionHostCreationResult, communicationPreparedData, portNumber, processEnv] = await Promise.all([
                this.D.createExtensionHost(),
                communication.prepare(),
                this.H(),
                this.C.getShellEnv(),
            ]);
            this.k = new $$_b(extensionHostCreationResult.id, this.D);
            const env = objects.$Ym(processEnv, {
                VSCODE_AMD_ENTRYPOINT: 'vs/workbench/api/node/extensionHostProcess',
                VSCODE_HANDLES_UNCAUGHT_ERRORS: true
            });
            if (this.t.debugExtensionHost.env) {
                objects.$Ym(env, this.t.debugExtensionHost.env);
            }
            (0, processes_1.$tl)(env);
            if (this.d) {
                // Unset `VSCODE_CODE_CACHE_PATH` when developing extensions because it might
                // be that dependencies, that otherwise would be cached, get modified.
                delete env['VSCODE_CODE_CACHE_PATH'];
            }
            const opts = {
                responseWindowId: this.t.window.id,
                responseChannel: 'vscode:startExtensionHostMessagePortResult',
                responseNonce: (0, uuid_1.$4f)(),
                env,
                // We only detach the extension host on windows. Linux and Mac orphan by default
                // and detach under Linux and Mac create another process group.
                // We detach because we have noticed that when the renderer exits, its child processes
                // (i.e. extension host) are taken down in a brutal fashion by the OS
                detached: !!platform.$i,
                execArgv: undefined,
                silent: true
            };
            if (portNumber !== 0) {
                opts.execArgv = [
                    '--nolazy',
                    (this.g ? '--inspect-brk=' : '--inspect=') + portNumber
                ];
            }
            else {
                opts.execArgv = ['--inspect-port=0'];
            }
            if (this.t.extensionTestsLocationURI) {
                opts.execArgv.unshift('--expose-gc');
            }
            if (this.t.args['prof-v8-extensions']) {
                opts.execArgv.unshift('--prof');
            }
            // Refs https://github.com/microsoft/vscode/issues/189805
            opts.execArgv.unshift('--dns-result-order=ipv4first');
            const onStdout = this.L(this.k.onStdout);
            const onStderr = this.L(this.k.onStderr);
            const onOutput = event_1.Event.any(event_1.Event.map(onStdout.event, o => ({ data: `%c${o}`, format: [''] })), event_1.Event.map(onStderr.event, o => ({ data: `%c${o}`, format: ['color: red'] })));
            // Debounce all output, so we can render it in the Chrome console as a group
            const onDebouncedOutput = event_1.Event.debounce(onOutput, (r, o) => {
                return r
                    ? { data: r.data + o.data, format: [...r.format, ...o.format] }
                    : { data: o.data, format: o.format };
            }, 100);
            // Print out extension host output
            onDebouncedOutput(output => {
                const inspectorUrlMatch = output.data && output.data.match(/ws:\/\/([^\s]+:(\d+)\/[^\s]+)/);
                if (inspectorUrlMatch) {
                    if (!this.t.isBuilt && !this.h) {
                        console.log(`%c[Extension Host] %cdebugger inspector at devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${inspectorUrlMatch[1]}`, 'color: blue', 'color:');
                    }
                    if (!this.j) {
                        this.j = Number(inspectorUrlMatch[2]);
                        this.b.fire();
                    }
                }
                else {
                    if (!this.h) {
                        console.group('Extension Host');
                        console.log(output.data, ...output.format);
                        console.groupEnd();
                    }
                }
            });
            // Lifecycle
            this.k.onExit(({ code, signal }) => this.K(code, signal));
            // Notify debugger that we are ready to attach to the process if we run a development extension
            if (portNumber) {
                if (this.d && portNumber && this.f && this.t.debugExtensionHost.debugId) {
                    this.z.attachSession(this.t.debugExtensionHost.debugId, portNumber);
                }
                this.j = portNumber;
                this.b.fire();
            }
            // Help in case we fail to start it
            let startupTimeoutHandle;
            if (!this.t.isBuilt && !this.t.remoteAuthority || this.d) {
                startupTimeoutHandle = setTimeout(() => {
                    this.w.error(`[LocalProcessExtensionHost]: Extension host did not start in 10 seconds (debugBrk: ${this.g})`);
                    const msg = this.g
                        ? nls.localize(0, null)
                        : nls.localize(1, null);
                    this.p.prompt(notification_1.Severity.Warning, msg, [{
                            label: nls.localize(2, null),
                            run: () => this.A.reload()
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                }, 10000);
            }
            // Initialize extension host process with hand shakes
            const protocol = await communication.establishProtocol(communicationPreparedData, this.k, opts);
            await this.I(protocol);
            clearTimeout(startupTimeoutHandle);
            return protocol;
        }
        /**
         * Find a free port if extension host debugging is enabled.
         */
        async H() {
            if (typeof this.t.debugExtensionHost.port !== 'number') {
                return 0;
            }
            const expected = this.t.debugExtensionHost.port;
            const port = await this.q.findFreePort(expected, 10 /* try 10 ports */, 5000 /* try up to 5 seconds */, 2048 /* skip 2048 ports between attempts */);
            if (!this.h) {
                if (!port) {
                    console.warn('%c[Extension Host] %cCould not find a free port for debugging', 'color: blue', 'color:');
                }
                else {
                    if (port !== expected) {
                        console.warn(`%c[Extension Host] %cProvided debugging port ${expected} is not free, using ${port} instead.`, 'color: blue', 'color:');
                    }
                    if (this.g) {
                        console.warn(`%c[Extension Host] %cSTOPPED on first line for debugging on port ${port}`, 'color: blue', 'color:');
                    }
                    else {
                        console.info(`%c[Extension Host] %cdebugger listening on port ${port}`, 'color: blue', 'color:');
                    }
                }
            }
            return port || 0;
        }
        I(protocol) {
            // 1) wait for the incoming `ready` event and send the initialization data.
            // 2) wait for the incoming `initialized` event.
            return new Promise((resolve, reject) => {
                let timeoutHandle;
                const installTimeoutCheck = () => {
                    timeoutHandle = setTimeout(() => {
                        reject('The local extension host took longer than 60s to send its ready message.');
                    }, 60 * 1000);
                };
                const uninstallTimeoutCheck = () => {
                    clearTimeout(timeoutHandle);
                };
                // Wait 60s for the ready message
                installTimeoutCheck();
                const disposable = protocol.onMessage(msg => {
                    if ((0, extensionHostProtocol_1.$5l)(msg, 1 /* MessageType.Ready */)) {
                        // 1) Extension Host is ready to receive messages, initialize it
                        uninstallTimeoutCheck();
                        this.J().then(data => {
                            // Wait 60s for the initialized message
                            installTimeoutCheck();
                            protocol.send(buffer_1.$Fd.fromString(JSON.stringify(data)));
                        });
                        return;
                    }
                    if ((0, extensionHostProtocol_1.$5l)(msg, 0 /* MessageType.Initialized */)) {
                        // 2) Extension Host is initialized
                        uninstallTimeoutCheck();
                        // stop listening for messages here
                        disposable.dispose();
                        // release this promise
                        resolve();
                        return;
                    }
                    console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                });
            });
        }
        async J() {
            const initData = await this.m.getInitData();
            this.extensions = initData.extensions;
            const workspace = this.n.getWorkspace();
            return {
                commit: this.B.commit,
                version: this.B.version,
                quality: this.B.quality,
                parentPid: 0,
                environment: {
                    isExtensionDevelopmentDebug: this.f,
                    appRoot: this.t.appRoot ? uri_1.URI.file(this.t.appRoot) : undefined,
                    appName: this.B.nameLong,
                    appHost: this.B.embedderIdentifier || 'desktop',
                    appUriScheme: this.B.urlProtocol,
                    extensionTelemetryLogResource: this.t.extHostTelemetryLogFile,
                    isExtensionTelemetryLoggingOnly: (0, telemetryUtils_1.$io)(this.B, this.t),
                    appLanguage: platform.$v,
                    extensionDevelopmentLocationURI: this.t.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this.t.extensionTestsLocationURI,
                    globalStorageHome: this.u.defaultProfile.globalStorageHome,
                    workspaceStorageHome: this.t.workspaceStorageHome,
                    extensionLogLevel: this.t.extensionLogLevel
                },
                workspace: this.n.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? undefined : {
                    configuration: workspace.configuration ?? undefined,
                    id: workspace.id,
                    name: this.y.getWorkspaceLabel(workspace),
                    isUntitled: workspace.configuration ? (0, workspace_1.$2h)(workspace.configuration, this.t) : false,
                    transient: workspace.transient
                },
                remote: {
                    authority: this.t.remoteAuthority,
                    connectionData: null,
                    isRemote: false
                },
                consoleForward: {
                    includeStack: !this.h && (this.d || !this.t.isBuilt || this.B.quality !== 'stable' || this.t.verbose),
                    logNative: !this.h && this.d
                },
                extensions: this.extensions.toSnapshot(),
                telemetryInfo: {
                    sessionId: this.v.sessionId,
                    machineId: this.v.machineId,
                    firstSessionDate: this.v.firstSessionDate,
                    msftInternal: this.v.msftInternal
                },
                logLevel: this.w.getLevel(),
                loggers: [...this.x.getRegisteredLoggers()],
                logsLocation: this.t.extHostLogsPath,
                autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
                uiKind: extensionHostProtocol_1.UIKind.Desktop
            };
        }
        K(code, signal) {
            if (this.i) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            this.a.fire([code, signal]);
        }
        L(stream) {
            let last = '';
            let isOmitting = false;
            const event = new event_1.$fd();
            stream((chunk) => {
                // not a fancy approach, but this is the same approach used by the split2
                // module which is well-optimized (https://github.com/mcollina/split2)
                last += chunk;
                const lines = last.split(/\r?\n/g);
                last = lines.pop();
                // protected against an extension spamming and leaking memory if no new line is written.
                if (last.length > 10000) {
                    lines.push(last);
                    last = '';
                }
                for (const line of lines) {
                    if (isOmitting) {
                        if (line === "END_NATIVE_LOG" /* NativeLogMarkers.End */) {
                            isOmitting = false;
                        }
                    }
                    else if (line === "START_NATIVE_LOG" /* NativeLogMarkers.Start */) {
                        isOmitting = true;
                    }
                    else if (line.length) {
                        event.fire(line + '\n');
                    }
                }
            });
            return event;
        }
        async enableInspectPort() {
            if (typeof this.j === 'number') {
                return true;
            }
            if (!this.k) {
                return false;
            }
            const result = await this.k.enableInspectPort();
            if (!result) {
                return false;
            }
            await Promise.race([event_1.Event.toPromise(this.b.event), (0, async_1.$Hg)(1000)]);
            return typeof this.j === 'number';
        }
        getInspectPort() {
            return this.j ?? undefined;
        }
        M(event) {
            // If the extension development host was started without debugger attached we need
            // to communicate this back to the main side to terminate the debug session
            if (this.d && !this.h && !this.f && this.t.debugExtensionHost.debugId) {
                this.z.terminateSession(this.t.debugExtensionHost.debugId);
                event.join((0, async_1.$Hg)(100 /* wait a bit for IPC to get delivered */), { id: 'join.extensionDevelopment', label: nls.localize(3, null) });
            }
        }
    };
    exports.$__b = $__b;
    exports.$__b = $__b = __decorate([
        __param(3, workspace_1.$Kh),
        __param(4, notification_1.$Yu),
        __param(5, native_1.$05b),
        __param(6, lifecycle_2.$7y),
        __param(7, environmentService_1.$1$b),
        __param(8, userDataProfile_1.$Ek),
        __param(9, telemetry_1.$9k),
        __param(10, log_1.$5i),
        __param(11, log_1.$6i),
        __param(12, label_1.$Vz),
        __param(13, extensionHostDebug_1.$An),
        __param(14, host_1.$VT),
        __param(15, productService_1.$kj),
        __param(16, shellEnvironmentService_1.$K_b),
        __param(17, extensionHostStarter_1.$25b),
        __param(18, configuration_1.$8h)
    ], $__b);
    let $aac = class $aac extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
        }
        async prepare() {
        }
        establishProtocol(prepared, extensionHostProcess, opts) {
            (0, extensionHostEnv_1.$qm)(new extensionHostEnv_1.$pm(), opts.env);
            // Get ready to acquire the message port from the shared process worker
            const portPromise = (0, ipc_mp_1.$6S)(undefined /* we trigger the request via service call! */, opts.responseChannel, opts.responseNonce);
            return new Promise((resolve, reject) => {
                const handle = setTimeout(() => {
                    reject('The local extension host took longer than 60s to connect.');
                }, 60 * 1000);
                portPromise.then((port) => {
                    this.B((0, lifecycle_1.$ic)(() => {
                        // Close the message port when the extension host is disposed
                        port.close();
                    }));
                    clearTimeout(handle);
                    const onMessage = new ipc_net_1.$oh();
                    port.onmessage = ((e) => onMessage.fire(buffer_1.$Fd.wrap(e.data)));
                    port.start();
                    resolve({
                        onMessage: onMessage.event,
                        send: message => port.postMessage(message.buffer),
                    });
                });
                // Now that the message port listener is installed, start the ext host process
                const sw = stopwatch_1.$bd.create(false);
                extensionHostProcess.start(opts).then(() => {
                    const duration = sw.elapsed();
                    if (platform.$s) {
                        this.a.info(`IExtensionHostStarter.start() took ${duration} ms.`);
                    }
                }, (err) => {
                    // Starting the ext host process resulted in an error
                    reject(err);
                });
            });
        }
    };
    exports.$aac = $aac;
    exports.$aac = $aac = __decorate([
        __param(0, log_1.$5i)
    ], $aac);
});
//# sourceMappingURL=localProcessExtensionHost.js.map