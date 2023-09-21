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
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/pfs", "vs/nls!vs/platform/terminal/node/terminalProcess", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/terminal/node/childProcessMonitor", "vs/platform/terminal/node/terminalEnvironment", "vs/platform/terminal/node/windowsShellHelper", "node-pty"], function (require, exports, child_process_1, async_1, event_1, lifecycle_1, path, platform_1, uri_1, pfs_1, nls_1, log_1, productService_1, childProcessMonitor_1, terminalEnvironment_1, windowsShellHelper_1, node_pty_1) {
    "use strict";
    var $R$b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R$b = void 0;
    var ShutdownConstants;
    (function (ShutdownConstants) {
        /**
         * The amount of ms that must pass between data events after exit is queued before the actual
         * kill call is triggered. This data flush mechanism works around an [issue in node-pty][1]
         * where not all data is flushed which causes problems for task problem matchers. Additionally
         * on Windows under conpty, killing a process while data is being output will cause the [conhost
         * flush to hang the pty host][2] because [conhost should be hosted on another thread][3].
         *
         * [1]: https://github.com/Tyriar/node-pty/issues/72
         * [2]: https://github.com/microsoft/vscode/issues/71966
         * [3]: https://github.com/microsoft/node-pty/pull/415
         */
        ShutdownConstants[ShutdownConstants["DataFlushTimeout"] = 250] = "DataFlushTimeout";
        /**
         * The maximum ms to allow after dispose is called because forcefully killing the process.
         */
        ShutdownConstants[ShutdownConstants["MaximumShutdownTime"] = 5000] = "MaximumShutdownTime";
    })(ShutdownConstants || (ShutdownConstants = {}));
    var Constants;
    (function (Constants) {
        /**
         * The minimum duration between kill and spawn calls on Windows/conpty as a mitigation for a
         * hang issue. See:
         * - https://github.com/microsoft/vscode/issues/71966
         * - https://github.com/microsoft/vscode/issues/117956
         * - https://github.com/microsoft/vscode/issues/121336
         */
        Constants[Constants["KillSpawnThrottleInterval"] = 250] = "KillSpawnThrottleInterval";
        /**
         * The amount of time to wait when a call is throttles beyond the exact amount, this is used to
         * try prevent early timeouts causing a kill/spawn call to happen at double the regular
         * interval.
         */
        Constants[Constants["KillSpawnSpacingDuration"] = 50] = "KillSpawnSpacingDuration";
        /**
         * Writing large amounts of data can be corrupted for some reason, after looking into this is
         * appears to be a race condition around writing to the FD which may be based on how powerful
         * the hardware is. The workaround for this is to space out when large amounts of data is being
         * written to the terminal. See https://github.com/microsoft/vscode/issues/38137
         */
        Constants[Constants["WriteMaxChunkSize"] = 50] = "WriteMaxChunkSize";
        /**
         * How long to wait between chunk writes.
         */
        Constants[Constants["WriteInterval"] = 5] = "WriteInterval";
    })(Constants || (Constants = {}));
    const posixShellTypeMap = new Map([
        ['bash', "bash" /* PosixShellType.Bash */],
        ['csh', "csh" /* PosixShellType.Csh */],
        ['fish', "fish" /* PosixShellType.Fish */],
        ['ksh', "ksh" /* PosixShellType.Ksh */],
        ['sh', "sh" /* PosixShellType.Sh */],
        ['pwsh', "pwsh" /* PosixShellType.PowerShell */],
        ['zsh', "zsh" /* PosixShellType.Zsh */]
    ]);
    let $R$b = class $R$b extends lifecycle_1.$kc {
        static { $R$b_1 = this; }
        static { this.b = 0; }
        get exitMessage() { return this.h; }
        get currentTitle() { return this.t?.shellTitle || this.n; }
        get shellType() { return platform_1.$i ? this.t?.shellType : posixShellTypeMap.get(this.n); }
        get hasChildProcesses() { return this.u?.hasChildProcesses || false; }
        constructor(shellLaunchConfig, cwd, cols, rows, env, 
        /**
         * environment used for `findExecutable`
         */
        N, O, P, Q) {
            super();
            this.shellLaunchConfig = shellLaunchConfig;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.id = 0;
            this.shouldPersist = false;
            this.a = {
                cwd: '',
                initialCwd: '',
                fixedDimensions: { cols: undefined, rows: undefined },
                title: '',
                shellType: undefined,
                hasChildProcesses: true,
                resolvedShellLaunchConfig: {},
                overrideDimensions: undefined,
                failedShellIntegrationActivation: false,
                usedShellIntegrationInjection: undefined
            };
            this.n = '';
            this.w = null;
            this.y = [];
            this.G = false;
            this.H = 0;
            this.I = this.B(new event_1.$fd());
            this.onProcessData = this.I.event;
            this.J = this.B(new event_1.$fd());
            this.onProcessReady = this.J.event;
            this.L = this.B(new event_1.$fd());
            this.onDidChangeProperty = this.L.event;
            this.M = this.B(new event_1.$fd());
            this.onProcessExit = this.M.event;
            let name;
            if (platform_1.$i) {
                name = path.$ae(this.shellLaunchConfig.executable || '');
            }
            else {
                // Using 'xterm-256color' here helps ensure that the majority of Linux distributions will use a
                // color prompt as defined in the default ~/.bashrc file.
                name = 'xterm-256color';
            }
            this.D = cwd;
            this.a["initialCwd" /* ProcessPropertyType.InitialCwd */] = this.D;
            this.a["cwd" /* ProcessPropertyType.Cwd */] = this.D;
            const useConpty = this.O.windowsEnableConpty && process.platform === 'win32' && (0, terminalEnvironment_1.$hr)() >= 18309;
            this.F = {
                name,
                cwd,
                // TODO: When node-pty is updated this cast can be removed
                env: env,
                cols,
                rows,
                useConpty,
                // This option will force conpty to not redraw the whole viewport on launch
                conptyInheritCursor: useConpty && !!shellLaunchConfig.initialText
            };
            // Delay resizes to avoid conpty not respecting very early resize calls
            if (platform_1.$i) {
                if (useConpty && cols === 0 && rows === 0 && this.shellLaunchConfig.executable?.endsWith('Git\\bin\\bash.exe')) {
                    this.C = new DelayedResizer();
                    this.B(this.C.onTrigger(dimensions => {
                        this.C?.dispose();
                        this.C = undefined;
                        if (dimensions.cols && dimensions.rows) {
                            this.resize(dimensions.cols, dimensions.rows);
                        }
                    }));
                }
                // WindowsShellHelper is used to fetch the process title and shell type
                this.onProcessReady(e => {
                    this.t = this.B(new windowsShellHelper_1.$Q$b(e.pid));
                    this.B(this.t.onShellTypeChanged(e => this.L.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: e })));
                    this.B(this.t.onShellNameChanged(e => this.L.fire({ type: "title" /* ProcessPropertyType.Title */, value: e })));
                });
            }
            this.B((0, lifecycle_1.$ic)(() => {
                if (this.w) {
                    clearInterval(this.w);
                    this.w = null;
                }
            }));
        }
        async start() {
            const results = await Promise.all([this.R(), this.S()]);
            const firstError = results.find(r => r !== undefined);
            if (firstError) {
                return firstError;
            }
            let injection;
            if (this.O.shellIntegration.enabled) {
                injection = (0, terminalEnvironment_1.$jr)(this.shellLaunchConfig, this.O, this.F.env, this.P, this.Q);
                if (injection) {
                    this.L.fire({ type: "usedShellIntegrationInjection" /* ProcessPropertyType.UsedShellIntegrationInjection */, value: true });
                    if (injection.envMixin) {
                        for (const [key, value] of Object.entries(injection.envMixin)) {
                            this.F.env ||= {};
                            this.F.env[key] = value;
                        }
                    }
                    if (injection.filesToCopy) {
                        for (const f of injection.filesToCopy) {
                            await pfs_1.Promises.mkdir(path.$_d(f.dest), { recursive: true });
                            try {
                                await pfs_1.Promises.copyFile(f.source, f.dest);
                            }
                            catch {
                                // Swallow error, this should only happen when multiple users are on the same
                                // machine. Since the shell integration scripts rarely change, plus the other user
                                // should be using the same version of the server in this case, assume the script is
                                // fine if copy fails and swallow the error.
                            }
                        }
                    }
                }
                else {
                    this.L.fire({ type: "failedShellIntegrationActivation" /* ProcessPropertyType.FailedShellIntegrationActivation */, value: true });
                }
            }
            try {
                await this.U(this.shellLaunchConfig, this.F, injection);
                if (injection?.newArgs) {
                    return { injectedArgs: injection.newArgs };
                }
                return undefined;
            }
            catch (err) {
                this.P.trace('node-pty.node-pty.IPty#spawn native exception', err);
                return { message: `A native exception occurred during launch (${err.message})` };
            }
        }
        async R() {
            try {
                const result = await pfs_1.Promises.stat(this.D);
                if (!result.isDirectory()) {
                    return { message: (0, nls_1.localize)(0, null, this.D.toString()) };
                }
            }
            catch (err) {
                if (err?.code === 'ENOENT') {
                    return { message: (0, nls_1.localize)(1, null, this.D.toString()) };
                }
            }
            this.L.fire({ type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: this.D });
            return undefined;
        }
        async S() {
            const slc = this.shellLaunchConfig;
            if (!slc.executable) {
                throw new Error('IShellLaunchConfig.executable not set');
            }
            const cwd = slc.cwd instanceof uri_1.URI ? slc.cwd.path : slc.cwd;
            const envPaths = (slc.env && slc.env.PATH) ? slc.env.PATH.split(path.$ge) : undefined;
            const executable = await (0, terminalEnvironment_1.$ir)(slc.executable, cwd, envPaths, this.N);
            if (!executable) {
                return { message: (0, nls_1.localize)(2, null, slc.executable) };
            }
            try {
                const result = await pfs_1.Promises.stat(executable);
                if (!result.isFile() && !result.isSymbolicLink()) {
                    return { message: (0, nls_1.localize)(3, null, slc.executable) };
                }
                // Set the executable explicitly here so that node-pty doesn't need to search the
                // $PATH too.
                slc.executable = executable;
            }
            catch (err) {
                if (err?.code === 'EACCES') {
                    // Swallow
                }
                else {
                    throw err;
                }
            }
            return undefined;
        }
        async U(shellLaunchConfig, options, shellIntegrationInjection) {
            const args = shellIntegrationInjection?.newArgs || shellLaunchConfig.args || [];
            await this.Z();
            this.P.trace('node-pty.IPty#spawn', shellLaunchConfig.executable, args, options);
            const ptyProcess = (0, node_pty_1.spawn)(shellLaunchConfig.executable, args, options);
            this.m = ptyProcess;
            this.u = this.B(new childProcessMonitor_1.$O$b(ptyProcess.pid, this.P));
            this.u.onDidChangeHasChildProcesses(value => this.L.fire({ type: "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */, value }));
            this.s = new Promise(c => {
                this.onProcessReady(() => c());
            });
            ptyProcess.onData(data => {
                // Handle flow control
                this.H += data.length;
                if (!this.G && this.H > 100000 /* FlowControlConstants.HighWatermarkChars */) {
                    this.P.trace(`Flow control: Pause (${this.H} > ${100000 /* FlowControlConstants.HighWatermarkChars */})`);
                    this.G = true;
                    ptyProcess.pause();
                }
                // Refire the data event
                this.P.trace('node-pty.IPty#onData', data);
                this.I.fire(data);
                if (this.j) {
                    this.X();
                }
                this.t?.checkShell();
                this.u?.handleOutput();
            });
            ptyProcess.onExit(e => {
                this.g = e.exitCode;
                this.X();
            });
            this.$(ptyProcess.pid);
            this.W(ptyProcess);
        }
        W(ptyProcess) {
            // Send initial timeout async to give event listeners a chance to init
            setTimeout(() => this.ab(ptyProcess));
            // Setup polling for non-Windows, for Windows `process` doesn't change
            if (!platform_1.$i) {
                this.w = setInterval(() => {
                    if (this.n !== ptyProcess.process) {
                        this.ab(ptyProcess);
                    }
                }, 200);
            }
        }
        // Allow any trailing data events to be sent before the exit event is sent.
        // See https://github.com/Tyriar/node-pty/issues/72
        X() {
            if (this.P.getLevel() === log_1.LogLevel.Trace) {
                this.P.trace('TerminalProcess#_queueProcessExit', new Error().stack?.replace(/^Error/, ''));
            }
            if (this.j) {
                clearTimeout(this.j);
            }
            this.j = setTimeout(() => {
                this.j = undefined;
                this.Y();
            }, 250 /* ShutdownConstants.DataFlushTimeout */);
        }
        async Y() {
            // Wait to kill to process until the start up code has run. This prevents us from firing a process exit before a
            // process start.
            await this.s;
            if (this.q.isDisposed) {
                return;
            }
            // Attempt to kill the pty, it may have already been killed at this
            // point but we want to make sure
            try {
                if (this.m) {
                    await this.Z();
                    this.P.trace('node-pty.IPty#kill');
                    this.m.kill();
                }
            }
            catch (ex) {
                // Swallow, the pty has already been killed
            }
            this.M.fire(this.g || 0);
            this.dispose();
        }
        async Z() {
            // Only throttle on Windows/conpty
            if (!platform_1.$i || !('useConpty' in this.F) || !this.F.useConpty) {
                return;
            }
            // Use a loop to ensure multiple calls in a single interval space out
            while (Date.now() - $R$b_1.b < 250 /* Constants.KillSpawnThrottleInterval */) {
                this.P.trace('Throttling kill/spawn call');
                await (0, async_1.$Hg)(250 /* Constants.KillSpawnThrottleInterval */ - (Date.now() - $R$b_1.b) + 50 /* Constants.KillSpawnSpacingDuration */);
            }
            $R$b_1.b = Date.now();
        }
        $(pid) {
            this.J.fire({
                pid,
                cwd: this.D,
                windowsPty: this.getWindowsPty()
            });
        }
        ab(ptyProcess) {
            if (this.q.isDisposed) {
                return;
            }
            this.n = ptyProcess.process;
            this.L.fire({ type: "title" /* ProcessPropertyType.Title */, value: this.n });
            // If fig is installed it may change the title of the process
            const sanitizedTitle = this.currentTitle.replace(/ \(figterm\)$/g, '');
            this.L.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: posixShellTypeMap.get(sanitizedTitle) });
        }
        shutdown(immediate) {
            if (this.P.getLevel() === log_1.LogLevel.Trace) {
                this.P.trace('TerminalProcess#shutdown', new Error().stack?.replace(/^Error/, ''));
            }
            // don't force immediate disposal of the terminal processes on Windows as an additional
            // mitigation for https://github.com/microsoft/vscode/issues/71966 which causes the pty host
            // to become unresponsive, disconnecting all terminals across all windows.
            if (immediate && !platform_1.$i) {
                this.Y();
            }
            else {
                if (!this.j && !this.q.isDisposed) {
                    this.X();
                    // Allow a maximum amount of time for the process to exit, otherwise force kill it
                    setTimeout(() => {
                        if (this.j && !this.q.isDisposed) {
                            this.j = undefined;
                            this.Y();
                        }
                    }, 5000 /* ShutdownConstants.MaximumShutdownTime */);
                }
            }
        }
        input(data, isBinary) {
            if (this.q.isDisposed || !this.m) {
                return;
            }
            for (let i = 0; i <= Math.floor(data.length / 50 /* Constants.WriteMaxChunkSize */); i++) {
                const obj = {
                    isBinary: isBinary || false,
                    data: data.substr(i * 50 /* Constants.WriteMaxChunkSize */, 50 /* Constants.WriteMaxChunkSize */)
                };
                this.y.push(obj);
            }
            this.bb();
        }
        async processBinary(data) {
            this.input(data, true);
        }
        async refreshProperty(type) {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */: {
                    const newCwd = await this.getCwd();
                    if (newCwd !== this.a.cwd) {
                        this.a.cwd = newCwd;
                        this.L.fire({ type: "cwd" /* ProcessPropertyType.Cwd */, value: this.a.cwd });
                    }
                    return newCwd;
                }
                case "initialCwd" /* ProcessPropertyType.InitialCwd */: {
                    const initialCwd = await this.getInitialCwd();
                    if (initialCwd !== this.a.initialCwd) {
                        this.a.initialCwd = initialCwd;
                        this.L.fire({ type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: this.a.initialCwd });
                    }
                    return initialCwd;
                }
                case "title" /* ProcessPropertyType.Title */:
                    return this.currentTitle;
                default:
                    return this.shellType;
            }
        }
        async updateProperty(type, value) {
            if (type === "fixedDimensions" /* ProcessPropertyType.FixedDimensions */) {
                this.a.fixedDimensions = value;
            }
        }
        bb() {
            // Don't write if it's already queued of is there is nothing to write
            if (this.z !== undefined || this.y.length === 0) {
                return;
            }
            this.cb();
            // Don't queue more writes if the queue is empty
            if (this.y.length === 0) {
                this.z = undefined;
                return;
            }
            // Queue the next write
            this.z = setTimeout(() => {
                this.z = undefined;
                this.bb();
            }, 5 /* Constants.WriteInterval */);
        }
        cb() {
            const object = this.y.shift();
            this.P.trace('node-pty.IPty#write', object.data);
            if (object.isBinary) {
                this.m.write(Buffer.from(object.data, 'binary'));
            }
            else {
                this.m.write(object.data);
            }
            this.u?.handleInput();
        }
        resize(cols, rows) {
            if (this.q.isDisposed) {
                return;
            }
            if (typeof cols !== 'number' || typeof rows !== 'number' || isNaN(cols) || isNaN(rows)) {
                return;
            }
            // Ensure that cols and rows are always >= 1, this prevents a native
            // exception in winpty.
            if (this.m) {
                cols = Math.max(cols, 1);
                rows = Math.max(rows, 1);
                // Delay resize if needed
                if (this.C) {
                    this.C.cols = cols;
                    this.C.rows = rows;
                    return;
                }
                this.P.trace('node-pty.IPty#resize', cols, rows);
                try {
                    this.m.resize(cols, rows);
                }
                catch (e) {
                    // Swallow error if the pty has already exited
                    this.P.trace('node-pty.IPty#resize exception ' + e.message);
                    if (this.g !== undefined &&
                        e.message !== 'ioctl(2) failed, EBADF' &&
                        e.message !== 'Cannot resize a pty that has already exited') {
                        throw e;
                    }
                }
            }
        }
        clearBuffer() {
            this.m?.clear();
        }
        acknowledgeDataEvent(charCount) {
            // Prevent lower than 0 to heal from errors
            this.H = Math.max(this.H - charCount, 0);
            this.P.trace(`Flow control: Ack ${charCount} chars (unacknowledged: ${this.H})`);
            if (this.G && this.H < 5000 /* FlowControlConstants.LowWatermarkChars */) {
                this.P.trace(`Flow control: Resume (${this.H} < ${5000 /* FlowControlConstants.LowWatermarkChars */})`);
                this.m?.resume();
                this.G = false;
            }
        }
        clearUnacknowledgedChars() {
            this.H = 0;
            this.P.trace(`Flow control: Cleared all unacknowledged chars, forcing resume`);
            if (this.G) {
                this.m?.resume();
                this.G = false;
            }
        }
        async setUnicodeVersion(version) {
            // No-op
        }
        getInitialCwd() {
            return Promise.resolve(this.D);
        }
        async getCwd() {
            if (platform_1.$j) {
                // From Big Sur (darwin v20) there is a spawn blocking thread issue on Electron,
                // this is fixed in VS Code's internal Electron.
                // https://github.com/Microsoft/vscode/issues/105446
                return new Promise(resolve => {
                    if (!this.m) {
                        resolve(this.D);
                        return;
                    }
                    this.P.trace('node-pty.IPty#pid');
                    (0, child_process_1.exec)('lsof -OPln -p ' + this.m.pid + ' | grep cwd', { env: { ...process.env, LANG: 'en_US.UTF-8' } }, (error, stdout, stderr) => {
                        if (!error && stdout !== '') {
                            resolve(stdout.substring(stdout.indexOf('/'), stdout.length - 1));
                        }
                        else {
                            this.P.error('lsof did not run successfully, it may not be on the $PATH?', error, stdout, stderr);
                            resolve(this.D);
                        }
                    });
                });
            }
            if (platform_1.$k) {
                if (!this.m) {
                    return this.D;
                }
                this.P.trace('node-pty.IPty#pid');
                try {
                    return await pfs_1.Promises.readlink(`/proc/${this.m.pid}/cwd`);
                }
                catch (error) {
                    return this.D;
                }
            }
            return this.D;
        }
        getWindowsPty() {
            return platform_1.$i ? {
                backend: 'useConpty' in this.F && this.F.useConpty ? 'conpty' : 'winpty',
                buildNumber: (0, terminalEnvironment_1.$hr)()
            } : undefined;
        }
    };
    exports.$R$b = $R$b;
    exports.$R$b = $R$b = $R$b_1 = __decorate([
        __param(7, log_1.$5i),
        __param(8, productService_1.$kj)
    ], $R$b);
    /**
     * Tracks the latest resize event to be trigger at a later point.
     */
    class DelayedResizer extends lifecycle_1.$kc {
        get onTrigger() { return this.b.event; }
        constructor() {
            super();
            this.b = this.B(new event_1.$fd());
            this.a = setTimeout(() => {
                this.b.fire({ rows: this.rows, cols: this.cols });
            }, 1000);
            this.B((0, lifecycle_1.$ic)(() => clearTimeout(this.a)));
        }
    }
});
//# sourceMappingURL=terminalProcess.js.map