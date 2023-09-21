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
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/log/common/log", "string_decoder", "vs/base/common/async", "vs/base/common/network", "vs/platform/windows/electron-main/windows", "vs/base/common/severity", "vs/platform/telemetry/common/telemetry", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/base/common/processes", "vs/base/common/objects", "vs/base/common/platform", "vs/base/node/unc"], function (require, exports, electron_1, lifecycle_1, event_1, log_1, string_decoder_1, async_1, network_1, windows_1, severity_1, telemetry_1, lifecycleMainService_1, processes_1, objects_1, platform_1, unc_1) {
    "use strict";
    var UtilityProcess_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowUtilityProcess = exports.UtilityProcess = void 0;
    function isWindowUtilityProcessConfiguration(config) {
        const candidate = config;
        return typeof candidate.responseWindowId === 'number';
    }
    let UtilityProcess = class UtilityProcess extends lifecycle_1.Disposable {
        static { UtilityProcess_1 = this; }
        static { this.ID_COUNTER = 0; }
        static { this.all = new Map(); }
        static getAll() {
            return Array.from(UtilityProcess_1.all.values());
        }
        constructor(logService, telemetryService, lifecycleMainService) {
            super();
            this.logService = logService;
            this.telemetryService = telemetryService;
            this.lifecycleMainService = lifecycleMainService;
            this.id = String(++UtilityProcess_1.ID_COUNTER);
            this._onStdout = this._register(new event_1.Emitter());
            this.onStdout = this._onStdout.event;
            this._onStderr = this._register(new event_1.Emitter());
            this.onStderr = this._onStderr.event;
            this._onMessage = this._register(new event_1.Emitter());
            this.onMessage = this._onMessage.event;
            this._onExit = this._register(new event_1.Emitter());
            this.onExit = this._onExit.event;
            this._onCrash = this._register(new event_1.Emitter());
            this.onCrash = this._onCrash.event;
            this.process = undefined;
            this.processPid = undefined;
            this.configuration = undefined;
        }
        log(msg, severity) {
            let logMsg;
            if (this.configuration?.correlationId) {
                logMsg = `[UtilityProcess id: ${this.configuration?.correlationId}, type: ${this.configuration?.type}, pid: ${this.processPid ?? '<none>'}]: ${msg}`;
            }
            else {
                logMsg = `[UtilityProcess type: ${this.configuration?.type}, pid: ${this.processPid ?? '<none>'}]: ${msg}`;
            }
            switch (severity) {
                case severity_1.default.Error:
                    this.logService.error(logMsg);
                    break;
                case severity_1.default.Warning:
                    this.logService.warn(logMsg);
                    break;
                case severity_1.default.Info:
                    this.logService.trace(logMsg);
                    break;
            }
        }
        validateCanStart() {
            if (this.process) {
                this.log('Cannot start utility process because it is already running...', severity_1.default.Error);
                return false;
            }
            return true;
        }
        start(configuration) {
            const started = this.doStart(configuration);
            if (started && configuration.payload) {
                this.postMessage(configuration.payload);
            }
            return started;
        }
        doStart(configuration) {
            if (!this.validateCanStart()) {
                return false;
            }
            this.configuration = configuration;
            const serviceName = `${this.configuration.type}-${this.id}`;
            const modulePath = network_1.FileAccess.asFileUri('bootstrap-fork.js').fsPath;
            const args = this.configuration.args ?? [];
            const execArgv = this.configuration.execArgv ?? [];
            const allowLoadingUnsignedLibraries = this.configuration.allowLoadingUnsignedLibraries;
            const forceAllocationsToV8Sandbox = this.configuration.forceAllocationsToV8Sandbox;
            const stdio = 'pipe';
            const env = this.createEnv(configuration);
            this.log('creating new...', severity_1.default.Info);
            // Fork utility process
            this.process = electron_1.utilityProcess.fork(modulePath, args, {
                serviceName,
                env,
                execArgv,
                allowLoadingUnsignedLibraries,
                forceAllocationsToV8Sandbox,
                stdio
            });
            // Register to events
            this.registerListeners(this.process, this.configuration, serviceName);
            return true;
        }
        createEnv(configuration) {
            const env = configuration.env ? { ...configuration.env } : { ...(0, objects_1.deepClone)(process.env) };
            // Apply supported environment variables from config
            env['VSCODE_AMD_ENTRYPOINT'] = configuration.entryPoint;
            if (typeof configuration.parentLifecycleBound === 'number') {
                env['VSCODE_PARENT_PID'] = String(configuration.parentLifecycleBound);
            }
            env['VSCODE_CRASH_REPORTER_PROCESS_TYPE'] = configuration.type;
            if (platform_1.isWindows) {
                if ((0, unc_1.isUNCAccessRestrictionsDisabled)()) {
                    env['NODE_DISABLE_UNC_ACCESS_CHECKS'] = '1';
                }
                else {
                    env['NODE_UNC_HOST_ALLOWLIST'] = (0, unc_1.getUNCHostAllowlist)().join('\\');
                }
            }
            // Remove any environment variables that are not allowed
            (0, processes_1.removeDangerousEnvVariables)(env);
            // Ensure all values are strings, otherwise the process will not start
            for (const key of Object.keys(env)) {
                env[key] = String(env[key]);
            }
            return env;
        }
        registerListeners(process, configuration, serviceName) {
            // Stdout
            if (process.stdout) {
                const stdoutDecoder = new string_decoder_1.StringDecoder('utf-8');
                this._register(event_1.Event.fromNodeEventEmitter(process.stdout, 'data')(chunk => this._onStdout.fire(typeof chunk === 'string' ? chunk : stdoutDecoder.write(chunk))));
            }
            // Stderr
            if (process.stderr) {
                const stderrDecoder = new string_decoder_1.StringDecoder('utf-8');
                this._register(event_1.Event.fromNodeEventEmitter(process.stderr, 'data')(chunk => this._onStderr.fire(typeof chunk === 'string' ? chunk : stderrDecoder.write(chunk))));
            }
            // Messages
            this._register(event_1.Event.fromNodeEventEmitter(process, 'message')(msg => this._onMessage.fire(msg)));
            // Spawn
            this._register(event_1.Event.fromNodeEventEmitter(process, 'spawn')(() => {
                this.processPid = process.pid;
                if (typeof process.pid === 'number') {
                    UtilityProcess_1.all.set(process.pid, { pid: process.pid, name: isWindowUtilityProcessConfiguration(configuration) ? `${configuration.type} [${configuration.responseWindowId}]` : configuration.type });
                }
                this.log('successfully created', severity_1.default.Info);
            }));
            // Exit
            this._register(event_1.Event.fromNodeEventEmitter(process, 'exit')(code => {
                this.log(`received exit event with code ${code}`, severity_1.default.Info);
                // Event
                this._onExit.fire({ pid: this.processPid, code, signal: 'unknown' });
                // Cleanup
                this.onDidExitOrCrashOrKill();
            }));
            // Child process gone
            this._register(event_1.Event.fromNodeEventEmitter(electron_1.app, 'child-process-gone', (event, details) => ({ event, details }))(({ details }) => {
                if (details.type === 'Utility' && details.name === serviceName) {
                    this.log(`crashed with code ${details.exitCode} and reason '${details.reason}'`, severity_1.default.Error);
                    this.telemetryService.publicLog2('utilityprocesscrash', {
                        type: configuration.type,
                        reason: details.reason,
                        code: details.exitCode
                    });
                    // Event
                    this._onCrash.fire({ pid: this.processPid, code: details.exitCode, reason: details.reason });
                    // Cleanup
                    this.onDidExitOrCrashOrKill();
                }
            }));
        }
        once(message, callback) {
            const disposable = this._register(this._onMessage.event(msg => {
                if (msg === message) {
                    disposable.dispose();
                    callback();
                }
            }));
        }
        postMessage(message, transfer) {
            if (!this.process) {
                return; // already killed, crashed or never started
            }
            this.process.postMessage(message, transfer);
        }
        connect(payload) {
            const { port1: outPort, port2: utilityProcessPort } = new electron_1.MessageChannelMain();
            this.postMessage(payload, [utilityProcessPort]);
            return outPort;
        }
        enableInspectPort() {
            if (!this.process || typeof this.processPid !== 'number') {
                return false;
            }
            this.log('enabling inspect port', severity_1.default.Info);
            // use (undocumented) _debugProcess feature of node if available
            const processExt = process;
            if (typeof processExt._debugProcess === 'function') {
                processExt._debugProcess(this.processPid);
                return true;
            }
            // not supported...
            return false;
        }
        kill() {
            if (!this.process) {
                return; // already killed, crashed or never started
            }
            this.log('attempting to kill the process...', severity_1.default.Info);
            const killed = this.process.kill();
            if (killed) {
                this.log('successfully killed the process', severity_1.default.Info);
                this.onDidExitOrCrashOrKill();
            }
            else {
                this.log('unable to kill the process', severity_1.default.Warning);
            }
        }
        onDidExitOrCrashOrKill() {
            if (typeof this.processPid === 'number') {
                UtilityProcess_1.all.delete(this.processPid);
            }
            this.process = undefined;
        }
        async waitForExit(maxWaitTimeMs) {
            if (!this.process) {
                return; // already killed, crashed or never started
            }
            this.log('waiting to exit...', severity_1.default.Info);
            await Promise.race([event_1.Event.toPromise(this.onExit), (0, async_1.timeout)(maxWaitTimeMs)]);
            if (this.process) {
                this.log(`did not exit within ${maxWaitTimeMs}ms, will kill it now...`, severity_1.default.Info);
                this.kill();
            }
        }
    };
    exports.UtilityProcess = UtilityProcess;
    exports.UtilityProcess = UtilityProcess = UtilityProcess_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, lifecycleMainService_1.ILifecycleMainService)
    ], UtilityProcess);
    let WindowUtilityProcess = class WindowUtilityProcess extends UtilityProcess {
        constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
            super(logService, telemetryService, lifecycleMainService);
            this.windowsMainService = windowsMainService;
        }
        start(configuration) {
            const responseWindow = this.windowsMainService.getWindowById(configuration.responseWindowId);
            if (!responseWindow?.win || responseWindow.win.isDestroyed() || responseWindow.win.webContents.isDestroyed()) {
                this.log('Refusing to start utility process because requesting window cannot be found or is destroyed...', severity_1.default.Error);
                return true;
            }
            // Start utility process
            const started = super.doStart(configuration);
            if (!started) {
                return false;
            }
            // Register to window events
            this.registerWindowListeners(responseWindow.win, configuration);
            // Establish & exchange message ports
            const windowPort = this.connect(configuration.payload);
            responseWindow.win.webContents.postMessage(configuration.responseChannel, configuration.responseNonce, [windowPort]);
            return true;
        }
        registerWindowListeners(window, configuration) {
            // If the lifecycle of the utility process is bound to the window,
            // we kill the process if the window closes or changes
            if (configuration.windowLifecycleBound) {
                this._register(event_1.Event.filter(this.lifecycleMainService.onWillLoadWindow, e => e.window.win === window)(() => this.kill()));
                this._register(event_1.Event.fromNodeEventEmitter(window, 'closed')(() => this.kill()));
            }
        }
    };
    exports.WindowUtilityProcess = WindowUtilityProcess;
    exports.WindowUtilityProcess = WindowUtilityProcess = __decorate([
        __param(0, log_1.ILogService),
        __param(1, windows_1.IWindowsMainService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, lifecycleMainService_1.ILifecycleMainService)
    ], WindowUtilityProcess);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eVByb2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91dGlsaXR5UHJvY2Vzcy9lbGVjdHJvbi1tYWluL3V0aWxpdHlQcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4RmhHLFNBQVMsbUNBQW1DLENBQUMsTUFBb0M7UUFDaEYsTUFBTSxTQUFTLEdBQUcsTUFBNEMsQ0FBQztRQUUvRCxPQUFPLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixLQUFLLFFBQVEsQ0FBQztJQUN2RCxDQUFDO0lBcUNNLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTs7aUJBRTlCLGVBQVUsR0FBRyxDQUFDLEFBQUosQ0FBSztpQkFFTixRQUFHLEdBQUcsSUFBSSxHQUFHLEVBQStCLEFBQXpDLENBQTBDO1FBQ3JFLE1BQU0sQ0FBQyxNQUFNO1lBQ1osT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQXVCRCxZQUNjLFVBQXdDLEVBQ2xDLGdCQUFvRCxFQUNoRCxvQkFBOEQ7WUFFckYsS0FBSyxFQUFFLENBQUM7WUFKc0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNqQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQzdCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUF4QnJFLE9BQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxnQkFBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXpDLGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFVLENBQUMsQ0FBQztZQUMxRCxhQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFFeEIsY0FBUyxHQUFHLElBQUksQ0FBQyxT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