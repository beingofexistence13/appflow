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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/processes", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/electron-sandbox/ipc.mp", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/debug/common/extensionHostDebug", "vs/platform/extensions/common/extensionHostStarter", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/extensions/common/extensionHostEnv", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "../common/extensionDevOptions"], function (require, exports, async_1, buffer_1, errors_1, event_1, lifecycle_1, objects, platform, processes_1, stopwatch_1, uri_1, uuid_1, ipc_net_1, ipc_mp_1, nls, configuration_1, extensionHostDebug_1, extensionHostStarter_1, label_1, log_1, native_1, notification_1, productService_1, telemetry_1, telemetryUtils_1, userDataProfile_1, workspace_1, environmentService_1, shellEnvironmentService_1, extensionHostEnv_1, extensionHostProtocol_1, host_1, lifecycle_2, extensionDevOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostMessagePortCommunication = exports.NativeLocalProcessExtensionHost = exports.ExtensionHostProcess = void 0;
    class ExtensionHostProcess {
        get onStdout() {
            return this._extensionHostStarter.onDynamicStdout(this._id);
        }
        get onStderr() {
            return this._extensionHostStarter.onDynamicStderr(this._id);
        }
        get onMessage() {
            return this._extensionHostStarter.onDynamicMessage(this._id);
        }
        get onExit() {
            return this._extensionHostStarter.onDynamicExit(this._id);
        }
        constructor(id, _extensionHostStarter) {
            this._extensionHostStarter = _extensionHostStarter;
            this._id = id;
        }
        start(opts) {
            return this._extensionHostStarter.start(this._id, opts);
        }
        enableInspectPort() {
            return this._extensionHostStarter.enableInspectPort(this._id);
        }
        kill() {
            return this._extensionHostStarter.kill(this._id);
        }
    }
    exports.ExtensionHostProcess = ExtensionHostProcess;
    let NativeLocalProcessExtensionHost = class NativeLocalProcessExtensionHost {
        constructor(runningLocation, startup, _initDataProvider, _contextService, _notificationService, _nativeHostService, _lifecycleService, _environmentService, _userDataProfilesService, _telemetryService, _logService, _loggerService, _labelService, _extensionHostDebugService, _hostService, _productService, _shellEnvironmentService, _extensionHostStarter, _configurationService) {
            this.runningLocation = runningLocation;
            this.startup = startup;
            this._initDataProvider = _initDataProvider;
            this._contextService = _contextService;
            this._notificationService = _notificationService;
            this._nativeHostService = _nativeHostService;
            this._lifecycleService = _lifecycleService;
            this._environmentService = _environmentService;
            this._userDataProfilesService = _userDataProfilesService;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._loggerService = _loggerService;
            this._labelService = _labelService;
            this._extensionHostDebugService = _extensionHostDebugService;
            this._hostService = _hostService;
            this._productService = _productService;
            this._shellEnvironmentService = _shellEnvironmentService;
            this._extensionHostStarter = _extensionHostStarter;
            this._configurationService = _configurationService;
            this.remoteAuthority = null;
            this.extensions = null;
            this._onExit = new event_1.Emitter();
            this.onExit = this._onExit.event;
            this._onDidSetInspectPort = new event_1.Emitter();
            this._toDispose = new lifecycle_1.DisposableStore();
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService);
            this._isExtensionDevHost = devOpts.isExtensionDevHost;
            this._isExtensionDevDebug = devOpts.isExtensionDevDebug;
            this._isExtensionDevDebugBrk = devOpts.isExtensionDevDebugBrk;
            this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
            this._terminating = false;
            this._inspectPort = null;
            this._extensionHostProcess = null;
            this._messageProtocol = null;
            this._toDispose.add(this._onExit);
            this._toDispose.add(this._lifecycleService.onWillShutdown(e => this._onWillShutdown(e)));
            this._toDispose.add(this._extensionHostDebugService.onClose(event => {
                if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId === event.sessionId) {
                    this._nativeHostService.closeWindow();
                }
            }));
            this._toDispose.add(this._extensionHostDebugService.onReload(event => {
                if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId === event.sessionId) {
                    this._hostService.reload();
                }
            }));
        }
        dispose() {
            if (this._terminating) {
                return;
            }
            this._terminating = true;
            this._toDispose.dispose();
        }
        start() {
            if (this._terminating) {
                // .terminate() was called
                throw new errors_1.CancellationError();
            }
            if (!this._messageProtocol) {
                this._messageProtocol = this._start();
            }
            return this._messageProtocol;
        }
        async _start() {
            const communication = this._toDispose.add(new ExtHostMessagePortCommunication(this._logService));
            return this._startWithCommunication(communication);
        }
        async _startWithCommunication(communication) {
            const [extensionHostCreationResult, communicationPreparedData, portNumber, processEnv] = await Promise.all([
                this._extensionHostStarter.createExtensionHost(),
                communication.prepare(),
                this._tryFindDebugPort(),
                this._shellEnvironmentService.getShellEnv(),
            ]);
            this._extensionHostProcess = new ExtensionHostProcess(extensionHostCreationResult.id, this._extensionHostStarter);
            const env = objects.mixin(processEnv, {
                VSCODE_AMD_ENTRYPOINT: 'vs/workbench/api/node/extensionHostProcess',
                VSCODE_HANDLES_UNCAUGHT_ERRORS: true
            });
            if (this._environmentService.debugExtensionHost.env) {
                objects.mixin(env, this._environmentService.debugExtensionHost.env);
            }
            (0, processes_1.removeDangerousEnvVariables)(env);
            if (this._isExtensionDevHost) {
                // Unset `VSCODE_CODE_CACHE_PATH` when developing extensions because it might
                // be that dependencies, that otherwise would be cached, get modified.
                delete env['VSCODE_CODE_CACHE_PATH'];
            }
            const opts = {
                responseWindowId: this._environmentService.window.id,
                responseChannel: 'vscode:startExtensionHostMessagePortResult',
                responseNonce: (0, uuid_1.generateUuid)(),
                env,
                // We only detach the extension host on windows. Linux and Mac orphan by default
                // and detach under Linux and Mac create another process group.
                // We detach because we have noticed that when the renderer exits, its child processes
                // (i.e. extension host) are taken down in a brutal fashion by the OS
                detached: !!platform.isWindows,
                execArgv: undefined,
                silent: true
            };
            if (portNumber !== 0) {
                opts.execArgv = [
                    '--nolazy',
                    (this._isExtensionDevDebugBrk ? '--inspect-brk=' : '--inspect=') + portNumber
                ];
            }
            else {
                opts.execArgv = ['--inspect-port=0'];
            }
            if (this._environmentService.extensionTestsLocationURI) {
                opts.execArgv.unshift('--expose-gc');
            }
            if (this._environmentService.args['prof-v8-extensions']) {
                opts.execArgv.unshift('--prof');
            }
            // Refs https://github.com/microsoft/vscode/issues/189805
            opts.execArgv.unshift('--dns-result-order=ipv4first');
            const onStdout = this._handleProcessOutputStream(this._extensionHostProcess.onStdout);
            const onStderr = this._handleProcessOutputStream(this._extensionHostProcess.onStderr);
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
                    if (!this._environmentService.isBuilt && !this._isExtensionDevTestFromCli) {
                        console.log(`%c[Extension Host] %cdebugger inspector at devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${inspectorUrlMatch[1]}`, 'color: blue', 'color:');
                    }
                    if (!this._inspectPort) {
                        this._inspectPort = Number(inspectorUrlMatch[2]);
                        this._onDidSetInspectPort.fire();
                    }
                }
                else {
                    if (!this._isExtensionDevTestFromCli) {
                        console.group('Extension Host');
                        console.log(output.data, ...output.format);
                        console.groupEnd();
                    }
                }
            });
            // Lifecycle
            this._extensionHostProcess.onExit(({ code, signal }) => this._onExtHostProcessExit(code, signal));
            // Notify debugger that we are ready to attach to the process if we run a development extension
            if (portNumber) {
                if (this._isExtensionDevHost && portNumber && this._isExtensionDevDebug && this._environmentService.debugExtensionHost.debugId) {
                    this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, portNumber);
                }
                this._inspectPort = portNumber;
                this._onDidSetInspectPort.fire();
            }
            // Help in case we fail to start it
            let startupTimeoutHandle;
            if (!this._environmentService.isBuilt && !this._environmentService.remoteAuthority || this._isExtensionDevHost) {
                startupTimeoutHandle = setTimeout(() => {
                    this._logService.error(`[LocalProcessExtensionHost]: Extension host did not start in 10 seconds (debugBrk: ${this._isExtensionDevDebugBrk})`);
                    const msg = this._isExtensionDevDebugBrk
                        ? nls.localize('extensionHost.startupFailDebug', "Extension host did not start in 10 seconds, it might be stopped on the first line and needs a debugger to continue.")
                        : nls.localize('extensionHost.startupFail', "Extension host did not start in 10 seconds, that might be a problem.");
                    this._notificationService.prompt(notification_1.Severity.Warning, msg, [{
                            label: nls.localize('reloadWindow', "Reload Window"),
                            run: () => this._hostService.reload()
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                }, 10000);
            }
            // Initialize extension host process with hand shakes
            const protocol = await communication.establishProtocol(communicationPreparedData, this._extensionHostProcess, opts);
            await this._performHandshake(protocol);
            clearTimeout(startupTimeoutHandle);
            return protocol;
        }
        /**
         * Find a free port if extension host debugging is enabled.
         */
        async _tryFindDebugPort() {
            if (typeof this._environmentService.debugExtensionHost.port !== 'number') {
                return 0;
            }
            const expected = this._environmentService.debugExtensionHost.port;
            const port = await this._nativeHostService.findFreePort(expected, 10 /* try 10 ports */, 5000 /* try up to 5 seconds */, 2048 /* skip 2048 ports between attempts */);
            if (!this._isExtensionDevTestFromCli) {
                if (!port) {
                    console.warn('%c[Extension Host] %cCould not find a free port for debugging', 'color: blue', 'color:');
                }
                else {
                    if (port !== expected) {
                        console.warn(`%c[Extension Host] %cProvided debugging port ${expected} is not free, using ${port} instead.`, 'color: blue', 'color:');
                    }
                    if (this._isExtensionDevDebugBrk) {
                        console.warn(`%c[Extension Host] %cSTOPPED on first line for debugging on port ${port}`, 'color: blue', 'color:');
                    }
                    else {
                        console.info(`%c[Extension Host] %cdebugger listening on port ${port}`, 'color: blue', 'color:');
                    }
                }
            }
            return port || 0;
        }
        _performHandshake(protocol) {
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
                    if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 1 /* MessageType.Ready */)) {
                        // 1) Extension Host is ready to receive messages, initialize it
                        uninstallTimeoutCheck();
                        this._createExtHostInitData().then(data => {
                            // Wait 60s for the initialized message
                            installTimeoutCheck();
                            protocol.send(buffer_1.VSBuffer.fromString(JSON.stringify(data)));
                        });
                        return;
                    }
                    if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 0 /* MessageType.Initialized */)) {
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
        async _createExtHostInitData() {
            const initData = await this._initDataProvider.getInitData();
            this.extensions = initData.extensions;
            const workspace = this._contextService.getWorkspace();
            return {
                commit: this._productService.commit,
                version: this._productService.version,
                quality: this._productService.quality,
                parentPid: 0,
                environment: {
                    isExtensionDevelopmentDebug: this._isExtensionDevDebug,
                    appRoot: this._environmentService.appRoot ? uri_1.URI.file(this._environmentService.appRoot) : undefined,
                    appName: this._productService.nameLong,
                    appHost: this._productService.embedderIdentifier || 'desktop',
                    appUriScheme: this._productService.urlProtocol,
                    extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                    isExtensionTelemetryLoggingOnly: (0, telemetryUtils_1.isLoggingOnly)(this._productService, this._environmentService),
                    appLanguage: platform.language,
                    extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                    globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                    workspaceStorageHome: this._environmentService.workspaceStorageHome,
                    extensionLogLevel: this._environmentService.extensionLogLevel
                },
                workspace: this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? undefined : {
                    configuration: workspace.configuration ?? undefined,
                    id: workspace.id,
                    name: this._labelService.getWorkspaceLabel(workspace),
                    isUntitled: workspace.configuration ? (0, workspace_1.isUntitledWorkspace)(workspace.configuration, this._environmentService) : false,
                    transient: workspace.transient
                },
                remote: {
                    authority: this._environmentService.remoteAuthority,
                    connectionData: null,
                    isRemote: false
                },
                consoleForward: {
                    includeStack: !this._isExtensionDevTestFromCli && (this._isExtensionDevHost || !this._environmentService.isBuilt || this._productService.quality !== 'stable' || this._environmentService.verbose),
                    logNative: !this._isExtensionDevTestFromCli && this._isExtensionDevHost
                },
                extensions: this.extensions.toSnapshot(),
                telemetryInfo: {
                    sessionId: this._telemetryService.sessionId,
                    machineId: this._telemetryService.machineId,
                    firstSessionDate: this._telemetryService.firstSessionDate,
                    msftInternal: this._telemetryService.msftInternal
                },
                logLevel: this._logService.getLevel(),
                loggers: [...this._loggerService.getRegisteredLoggers()],
                logsLocation: this._environmentService.extHostLogsPath,
                autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
                uiKind: extensionHostProtocol_1.UIKind.Desktop
            };
        }
        _onExtHostProcessExit(code, signal) {
            if (this._terminating) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            this._onExit.fire([code, signal]);
        }
        _handleProcessOutputStream(stream) {
            let last = '';
            let isOmitting = false;
            const event = new event_1.Emitter();
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
            if (typeof this._inspectPort === 'number') {
                return true;
            }
            if (!this._extensionHostProcess) {
                return false;
            }
            const result = await this._extensionHostProcess.enableInspectPort();
            if (!result) {
                return false;
            }
            await Promise.race([event_1.Event.toPromise(this._onDidSetInspectPort.event), (0, async_1.timeout)(1000)]);
            return typeof this._inspectPort === 'number';
        }
        getInspectPort() {
            return this._inspectPort ?? undefined;
        }
        _onWillShutdown(event) {
            // If the extension development host was started without debugger attached we need
            // to communicate this back to the main side to terminate the debug session
            if (this._isExtensionDevHost && !this._isExtensionDevTestFromCli && !this._isExtensionDevDebug && this._environmentService.debugExtensionHost.debugId) {
                this._extensionHostDebugService.terminateSession(this._environmentService.debugExtensionHost.debugId);
                event.join((0, async_1.timeout)(100 /* wait a bit for IPC to get delivered */), { id: 'join.extensionDevelopment', label: nls.localize('join.extensionDevelopment', "Terminating extension debug session") });
            }
        }
    };
    exports.NativeLocalProcessExtensionHost = NativeLocalProcessExtensionHost;
    exports.NativeLocalProcessExtensionHost = NativeLocalProcessExtensionHost = __decorate([
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, notification_1.INotificationService),
        __param(5, native_1.INativeHostService),
        __param(6, lifecycle_2.ILifecycleService),
        __param(7, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(8, userDataProfile_1.IUserDataProfilesService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, log_1.ILogService),
        __param(11, log_1.ILoggerService),
        __param(12, label_1.ILabelService),
        __param(13, extensionHostDebug_1.IExtensionHostDebugService),
        __param(14, host_1.IHostService),
        __param(15, productService_1.IProductService),
        __param(16, shellEnvironmentService_1.IShellEnvironmentService),
        __param(17, extensionHostStarter_1.IExtensionHostStarter),
        __param(18, configuration_1.IConfigurationService)
    ], NativeLocalProcessExtensionHost);
    let ExtHostMessagePortCommunication = class ExtHostMessagePortCommunication extends lifecycle_1.Disposable {
        constructor(_logService) {
            super();
            this._logService = _logService;
        }
        async prepare() {
        }
        establishProtocol(prepared, extensionHostProcess, opts) {
            (0, extensionHostEnv_1.writeExtHostConnection)(new extensionHostEnv_1.MessagePortExtHostConnection(), opts.env);
            // Get ready to acquire the message port from the shared process worker
            const portPromise = (0, ipc_mp_1.acquirePort)(undefined /* we trigger the request via service call! */, opts.responseChannel, opts.responseNonce);
            return new Promise((resolve, reject) => {
                const handle = setTimeout(() => {
                    reject('The local extension host took longer than 60s to connect.');
                }, 60 * 1000);
                portPromise.then((port) => {
                    this._register((0, lifecycle_1.toDisposable)(() => {
                        // Close the message port when the extension host is disposed
                        port.close();
                    }));
                    clearTimeout(handle);
                    const onMessage = new ipc_net_1.BufferedEmitter();
                    port.onmessage = ((e) => onMessage.fire(buffer_1.VSBuffer.wrap(e.data)));
                    port.start();
                    resolve({
                        onMessage: onMessage.event,
                        send: message => port.postMessage(message.buffer),
                    });
                });
                // Now that the message port listener is installed, start the ext host process
                const sw = stopwatch_1.StopWatch.create(false);
                extensionHostProcess.start(opts).then(() => {
                    const duration = sw.elapsed();
                    if (platform.isCI) {
                        this._logService.info(`IExtensionHostStarter.start() took ${duration} ms.`);
                    }
                }, (err) => {
                    // Starting the ext host process resulted in an error
                    reject(err);
                });
            });
        }
    };
    exports.ExtHostMessagePortCommunication = ExtHostMessagePortCommunication;
    exports.ExtHostMessagePortCommunication = ExtHostMessagePortCommunication = __decorate([
        __param(0, log_1.ILogService)
    ], ExtHostMessagePortCommunication);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxQcm9jZXNzRXh0ZW5zaW9uSG9zdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvbG9jYWxQcm9jZXNzRXh0ZW5zaW9uSG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUErQ2hHLE1BQWEsb0JBQW9CO1FBSWhDLElBQVcsUUFBUTtZQUNsQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxJQUFXLFFBQVE7WUFDbEIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsSUFBVyxTQUFTO1lBQ25CLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsSUFBVyxNQUFNO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELFlBQ0MsRUFBVSxFQUNPLHFCQUE0QztZQUE1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBRTdELElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVNLEtBQUssQ0FBQyxJQUFrQztZQUM5QyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlC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