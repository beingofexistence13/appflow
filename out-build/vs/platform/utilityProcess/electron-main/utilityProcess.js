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
    var $U5b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V5b = exports.$U5b = void 0;
    function isWindowUtilityProcessConfiguration(config) {
        const candidate = config;
        return typeof candidate.responseWindowId === 'number';
    }
    let $U5b = class $U5b extends lifecycle_1.$kc {
        static { $U5b_1 = this; }
        static { this.a = 0; }
        static { this.b = new Map(); }
        static getAll() {
            return Array.from($U5b_1.b.values());
        }
        constructor(t, u, w) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.c = String(++$U5b_1.a);
            this.f = this.B(new event_1.$fd());
            this.onStdout = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onStderr = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onMessage = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onExit = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onCrash = this.m.event;
            this.n = undefined;
            this.r = undefined;
            this.s = undefined;
        }
        y(msg, severity) {
            let logMsg;
            if (this.s?.correlationId) {
                logMsg = `[UtilityProcess id: ${this.s?.correlationId}, type: ${this.s?.type}, pid: ${this.r ?? '<none>'}]: ${msg}`;
            }
            else {
                logMsg = `[UtilityProcess type: ${this.s?.type}, pid: ${this.r ?? '<none>'}]: ${msg}`;
            }
            switch (severity) {
                case severity_1.default.Error:
                    this.t.error(logMsg);
                    break;
                case severity_1.default.Warning:
                    this.t.warn(logMsg);
                    break;
                case severity_1.default.Info:
                    this.t.trace(logMsg);
                    break;
            }
        }
        z() {
            if (this.n) {
                this.y('Cannot start utility process because it is already running...', severity_1.default.Error);
                return false;
            }
            return true;
        }
        start(configuration) {
            const started = this.C(configuration);
            if (started && configuration.payload) {
                this.postMessage(configuration.payload);
            }
            return started;
        }
        C(configuration) {
            if (!this.z()) {
                return false;
            }
            this.s = configuration;
            const serviceName = `${this.s.type}-${this.c}`;
            const modulePath = network_1.$2f.asFileUri('bootstrap-fork.js').fsPath;
            const args = this.s.args ?? [];
            const execArgv = this.s.execArgv ?? [];
            const allowLoadingUnsignedLibraries = this.s.allowLoadingUnsignedLibraries;
            const forceAllocationsToV8Sandbox = this.s.forceAllocationsToV8Sandbox;
            const stdio = 'pipe';
            const env = this.D(configuration);
            this.y('creating new...', severity_1.default.Info);
            // Fork utility process
            this.n = electron_1.utilityProcess.fork(modulePath, args, {
                serviceName,
                env,
                execArgv,
                allowLoadingUnsignedLibraries,
                forceAllocationsToV8Sandbox,
                stdio
            });
            // Register to events
            this.F(this.n, this.s, serviceName);
            return true;
        }
        D(configuration) {
            const env = configuration.env ? { ...configuration.env } : { ...(0, objects_1.$Vm)(process.env) };
            // Apply supported environment variables from config
            env['VSCODE_AMD_ENTRYPOINT'] = configuration.entryPoint;
            if (typeof configuration.parentLifecycleBound === 'number') {
                env['VSCODE_PARENT_PID'] = String(configuration.parentLifecycleBound);
            }
            env['VSCODE_CRASH_REPORTER_PROCESS_TYPE'] = configuration.type;
            if (platform_1.$i) {
                if ((0, unc_1.isUNCAccessRestrictionsDisabled)()) {
                    env['NODE_DISABLE_UNC_ACCESS_CHECKS'] = '1';
                }
                else {
                    env['NODE_UNC_HOST_ALLOWLIST'] = (0, unc_1.getUNCHostAllowlist)().join('\\');
                }
            }
            // Remove any environment variables that are not allowed
            (0, processes_1.$tl)(env);
            // Ensure all values are strings, otherwise the process will not start
            for (const key of Object.keys(env)) {
                env[key] = String(env[key]);
            }
            return env;
        }
        F(process, configuration, serviceName) {
            // Stdout
            if (process.stdout) {
                const stdoutDecoder = new string_decoder_1.StringDecoder('utf-8');
                this.B(event_1.Event.fromNodeEventEmitter(process.stdout, 'data')(chunk => this.f.fire(typeof chunk === 'string' ? chunk : stdoutDecoder.write(chunk))));
            }
            // Stderr
            if (process.stderr) {
                const stderrDecoder = new string_decoder_1.StringDecoder('utf-8');
                this.B(event_1.Event.fromNodeEventEmitter(process.stderr, 'data')(chunk => this.g.fire(typeof chunk === 'string' ? chunk : stderrDecoder.write(chunk))));
            }
            // Messages
            this.B(event_1.Event.fromNodeEventEmitter(process, 'message')(msg => this.h.fire(msg)));
            // Spawn
            this.B(event_1.Event.fromNodeEventEmitter(process, 'spawn')(() => {
                this.r = process.pid;
                if (typeof process.pid === 'number') {
                    $U5b_1.b.set(process.pid, { pid: process.pid, name: isWindowUtilityProcessConfiguration(configuration) ? `${configuration.type} [${configuration.responseWindowId}]` : configuration.type });
                }
                this.y('successfully created', severity_1.default.Info);
            }));
            // Exit
            this.B(event_1.Event.fromNodeEventEmitter(process, 'exit')(code => {
                this.y(`received exit event with code ${code}`, severity_1.default.Info);
                // Event
                this.j.fire({ pid: this.r, code, signal: 'unknown' });
                // Cleanup
                this.G();
            }));
            // Child process gone
            this.B(event_1.Event.fromNodeEventEmitter(electron_1.app, 'child-process-gone', (event, details) => ({ event, details }))(({ details }) => {
                if (details.type === 'Utility' && details.name === serviceName) {
                    this.y(`crashed with code ${details.exitCode} and reason '${details.reason}'`, severity_1.default.Error);
                    this.u.publicLog2('utilityprocesscrash', {
                        type: configuration.type,
                        reason: details.reason,
                        code: details.exitCode
                    });
                    // Event
                    this.m.fire({ pid: this.r, code: details.exitCode, reason: details.reason });
                    // Cleanup
                    this.G();
                }
            }));
        }
        once(message, callback) {
            const disposable = this.B(this.h.event(msg => {
                if (msg === message) {
                    disposable.dispose();
                    callback();
                }
            }));
        }
        postMessage(message, transfer) {
            if (!this.n) {
                return; // already killed, crashed or never started
            }
            this.n.postMessage(message, transfer);
        }
        connect(payload) {
            const { port1: outPort, port2: utilityProcessPort } = new electron_1.MessageChannelMain();
            this.postMessage(payload, [utilityProcessPort]);
            return outPort;
        }
        enableInspectPort() {
            if (!this.n || typeof this.r !== 'number') {
                return false;
            }
            this.y('enabling inspect port', severity_1.default.Info);
            // use (undocumented) _debugProcess feature of node if available
            const processExt = process;
            if (typeof processExt._debugProcess === 'function') {
                processExt._debugProcess(this.r);
                return true;
            }
            // not supported...
            return false;
        }
        kill() {
            if (!this.n) {
                return; // already killed, crashed or never started
            }
            this.y('attempting to kill the process...', severity_1.default.Info);
            const killed = this.n.kill();
            if (killed) {
                this.y('successfully killed the process', severity_1.default.Info);
                this.G();
            }
            else {
                this.y('unable to kill the process', severity_1.default.Warning);
            }
        }
        G() {
            if (typeof this.r === 'number') {
                $U5b_1.b.delete(this.r);
            }
            this.n = undefined;
        }
        async waitForExit(maxWaitTimeMs) {
            if (!this.n) {
                return; // already killed, crashed or never started
            }
            this.y('waiting to exit...', severity_1.default.Info);
            await Promise.race([event_1.Event.toPromise(this.onExit), (0, async_1.$Hg)(maxWaitTimeMs)]);
            if (this.n) {
                this.y(`did not exit within ${maxWaitTimeMs}ms, will kill it now...`, severity_1.default.Info);
                this.kill();
            }
        }
    };
    exports.$U5b = $U5b;
    exports.$U5b = $U5b = $U5b_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, telemetry_1.$9k),
        __param(2, lifecycleMainService_1.$p5b)
    ], $U5b);
    let $V5b = class $V5b extends $U5b {
        constructor(logService, H, telemetryService, lifecycleMainService) {
            super(logService, telemetryService, lifecycleMainService);
            this.H = H;
        }
        start(configuration) {
            const responseWindow = this.H.getWindowById(configuration.responseWindowId);
            if (!responseWindow?.win || responseWindow.win.isDestroyed() || responseWindow.win.webContents.isDestroyed()) {
                this.y('Refusing to start utility process because requesting window cannot be found or is destroyed...', severity_1.default.Error);
                return true;
            }
            // Start utility process
            const started = super.C(configuration);
            if (!started) {
                return false;
            }
            // Register to window events
            this.I(responseWindow.win, configuration);
            // Establish & exchange message ports
            const windowPort = this.connect(configuration.payload);
            responseWindow.win.webContents.postMessage(configuration.responseChannel, configuration.responseNonce, [windowPort]);
            return true;
        }
        I(window, configuration) {
            // If the lifecycle of the utility process is bound to the window,
            // we kill the process if the window closes or changes
            if (configuration.windowLifecycleBound) {
                this.B(event_1.Event.filter(this.w.onWillLoadWindow, e => e.window.win === window)(() => this.kill()));
                this.B(event_1.Event.fromNodeEventEmitter(window, 'closed')(() => this.kill()));
            }
        }
    };
    exports.$V5b = $V5b;
    exports.$V5b = $V5b = __decorate([
        __param(0, log_1.$5i),
        __param(1, windows_1.$B5b),
        __param(2, telemetry_1.$9k),
        __param(3, lifecycleMainService_1.$p5b)
    ], $V5b);
});
//# sourceMappingURL=utilityProcess.js.map