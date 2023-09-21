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
define(["require", "exports", "child_process", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/pfs", "vs/nls", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/terminal/node/childProcessMonitor", "vs/platform/terminal/node/terminalEnvironment", "vs/platform/terminal/node/windowsShellHelper", "node-pty"], function (require, exports, child_process_1, async_1, event_1, lifecycle_1, path, platform_1, uri_1, pfs_1, nls_1, log_1, productService_1, childProcessMonitor_1, terminalEnvironment_1, windowsShellHelper_1, node_pty_1) {
    "use strict";
    var TerminalProcess_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProcess = void 0;
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
    let TerminalProcess = class TerminalProcess extends lifecycle_1.Disposable {
        static { TerminalProcess_1 = this; }
        static { this._lastKillOrStart = 0; }
        get exitMessage() { return this._exitMessage; }
        get currentTitle() { return this._windowsShellHelper?.shellTitle || this._currentTitle; }
        get shellType() { return platform_1.isWindows ? this._windowsShellHelper?.shellType : posixShellTypeMap.get(this._currentTitle); }
        get hasChildProcesses() { return this._childProcessMonitor?.hasChildProcesses || false; }
        constructor(shellLaunchConfig, cwd, cols, rows, env, 
        /**
         * environment used for `findExecutable`
         */
        _executableEnv, _options, _logService, _productService) {
            super();
            this.shellLaunchConfig = shellLaunchConfig;
            this._executableEnv = _executableEnv;
            this._options = _options;
            this._logService = _logService;
            this._productService = _productService;
            this.id = 0;
            this.shouldPersist = false;
            this._properties = {
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
            this._currentTitle = '';
            this._titleInterval = null;
            this._writeQueue = [];
            this._isPtyPaused = false;
            this._unacknowledgedCharCount = 0;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onDidChangeProperty = this._register(new event_1.Emitter());
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            let name;
            if (platform_1.isWindows) {
                name = path.basename(this.shellLaunchConfig.executable || '');
            }
            else {
                // Using 'xterm-256color' here helps ensure that the majority of Linux distributions will use a
                // color prompt as defined in the default ~/.bashrc file.
                name = 'xterm-256color';
            }
            this._initialCwd = cwd;
            this._properties["initialCwd" /* ProcessPropertyType.InitialCwd */] = this._initialCwd;
            this._properties["cwd" /* ProcessPropertyType.Cwd */] = this._initialCwd;
            const useConpty = this._options.windowsEnableConpty && process.platform === 'win32' && (0, terminalEnvironment_1.getWindowsBuildNumber)() >= 18309;
            this._ptyOptions = {
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
            if (platform_1.isWindows) {
                if (useConpty && cols === 0 && rows === 0 && this.shellLaunchConfig.executable?.endsWith('Git\\bin\\bash.exe')) {
                    this._delayedResizer = new DelayedResizer();
                    this._register(this._delayedResizer.onTrigger(dimensions => {
                        this._delayedResizer?.dispose();
                        this._delayedResizer = undefined;
                        if (dimensions.cols && dimensions.rows) {
                            this.resize(dimensions.cols, dimensions.rows);
                        }
                    }));
                }
                // WindowsShellHelper is used to fetch the process title and shell type
                this.onProcessReady(e => {
                    this._windowsShellHelper = this._register(new windowsShellHelper_1.WindowsShellHelper(e.pid));
                    this._register(this._windowsShellHelper.onShellTypeChanged(e => this._onDidChangeProperty.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: e })));
                    this._register(this._windowsShellHelper.onShellNameChanged(e => this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: e })));
                });
            }
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this._titleInterval) {
                    clearInterval(this._titleInterval);
                    this._titleInterval = null;
                }
            }));
        }
        async start() {
            const results = await Promise.all([this._validateCwd(), this._validateExecutable()]);
            const firstError = results.find(r => r !== undefined);
            if (firstError) {
                return firstError;
            }
            let injection;
            if (this._options.shellIntegration.enabled) {
                injection = (0, terminalEnvironment_1.getShellIntegrationInjection)(this.shellLaunchConfig, this._options, this._ptyOptions.env, this._logService, this._productService);
                if (injection) {
                    this._onDidChangeProperty.fire({ type: "usedShellIntegrationInjection" /* ProcessPropertyType.UsedShellIntegrationInjection */, value: true });
                    if (injection.envMixin) {
                        for (const [key, value] of Object.entries(injection.envMixin)) {
                            this._ptyOptions.env ||= {};
                            this._ptyOptions.env[key] = value;
                        }
                    }
                    if (injection.filesToCopy) {
                        for (const f of injection.filesToCopy) {
                            await pfs_1.Promises.mkdir(path.dirname(f.dest), { recursive: true });
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
                    this._onDidChangeProperty.fire({ type: "failedShellIntegrationActivation" /* ProcessPropertyType.FailedShellIntegrationActivation */, value: true });
                }
            }
            try {
                await this.setupPtyProcess(this.shellLaunchConfig, this._ptyOptions, injection);
                if (injection?.newArgs) {
                    return { injectedArgs: injection.newArgs };
                }
                return undefined;
            }
            catch (err) {
                this._logService.trace('node-pty.node-pty.IPty#spawn native exception', err);
                return { message: `A native exception occurred during launch (${err.message})` };
            }
        }
        async _validateCwd() {
            try {
                const result = await pfs_1.Promises.stat(this._initialCwd);
                if (!result.isDirectory()) {
                    return { message: (0, nls_1.localize)('launchFail.cwdNotDirectory', "Starting directory (cwd) \"{0}\" is not a directory", this._initialCwd.toString()) };
                }
            }
            catch (err) {
                if (err?.code === 'ENOENT') {
                    return { message: (0, nls_1.localize)('launchFail.cwdDoesNotExist', "Starting directory (cwd) \"{0}\" does not exist", this._initialCwd.toString()) };
                }
            }
            this._onDidChangeProperty.fire({ type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: this._initialCwd });
            return undefined;
        }
        async _validateExecutable() {
            const slc = this.shellLaunchConfig;
            if (!slc.executable) {
                throw new Error('IShellLaunchConfig.executable not set');
            }
            const cwd = slc.cwd instanceof uri_1.URI ? slc.cwd.path : slc.cwd;
            const envPaths = (slc.env && slc.env.PATH) ? slc.env.PATH.split(path.delimiter) : undefined;
            const executable = await (0, terminalEnvironment_1.findExecutable)(slc.executable, cwd, envPaths, this._executableEnv);
            if (!executable) {
                return { message: (0, nls_1.localize)('launchFail.executableDoesNotExist', "Path to shell executable \"{0}\" does not exist", slc.executable) };
            }
            try {
                const result = await pfs_1.Promises.stat(executable);
                if (!result.isFile() && !result.isSymbolicLink()) {
                    return { message: (0, nls_1.localize)('launchFail.executableIsNotFileOrSymlink', "Path to shell executable \"{0}\" is not a file or a symlink", slc.executable) };
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
        async setupPtyProcess(shellLaunchConfig, options, shellIntegrationInjection) {
            const args = shellIntegrationInjection?.newArgs || shellLaunchConfig.args || [];
            await this._throttleKillSpawn();
            this._logService.trace('node-pty.IPty#spawn', shellLaunchConfig.executable, args, options);
            const ptyProcess = (0, node_pty_1.spawn)(shellLaunchConfig.executable, args, options);
            this._ptyProcess = ptyProcess;
            this._childProcessMonitor = this._register(new childProcessMonitor_1.ChildProcessMonitor(ptyProcess.pid, this._logService));
            this._childProcessMonitor.onDidChangeHasChildProcesses(value => this._onDidChangeProperty.fire({ type: "hasChildProcesses" /* ProcessPropertyType.HasChildProcesses */, value }));
            this._processStartupComplete = new Promise(c => {
                this.onProcessReady(() => c());
            });
            ptyProcess.onData(data => {
                // Handle flow control
                this._unacknowledgedCharCount += data.length;
                if (!this._isPtyPaused && this._unacknowledgedCharCount > 100000 /* FlowControlConstants.HighWatermarkChars */) {
                    this._logService.trace(`Flow control: Pause (${this._unacknowledgedCharCount} > ${100000 /* FlowControlConstants.HighWatermarkChars */})`);
                    this._isPtyPaused = true;
                    ptyProcess.pause();
                }
                // Refire the data event
                this._logService.trace('node-pty.IPty#onData', data);
                this._onProcessData.fire(data);
                if (this._closeTimeout) {
                    this._queueProcessExit();
                }
                this._windowsShellHelper?.checkShell();
                this._childProcessMonitor?.handleOutput();
            });
            ptyProcess.onExit(e => {
                this._exitCode = e.exitCode;
                this._queueProcessExit();
            });
            this._sendProcessId(ptyProcess.pid);
            this._setupTitlePolling(ptyProcess);
        }
        _setupTitlePolling(ptyProcess) {
            // Send initial timeout async to give event listeners a chance to init
            setTimeout(() => this._sendProcessTitle(ptyProcess));
            // Setup polling for non-Windows, for Windows `process` doesn't change
            if (!platform_1.isWindows) {
                this._titleInterval = setInterval(() => {
                    if (this._currentTitle !== ptyProcess.process) {
                        this._sendProcessTitle(ptyProcess);
                    }
                }, 200);
            }
        }
        // Allow any trailing data events to be sent before the exit event is sent.
        // See https://github.com/Tyriar/node-pty/issues/72
        _queueProcessExit() {
            if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                this._logService.trace('TerminalProcess#_queueProcessExit', new Error().stack?.replace(/^Error/, ''));
            }
            if (this._closeTimeout) {
                clearTimeout(this._closeTimeout);
            }
            this._closeTimeout = setTimeout(() => {
                this._closeTimeout = undefined;
                this._kill();
            }, 250 /* ShutdownConstants.DataFlushTimeout */);
        }
        async _kill() {
            // Wait to kill to process until the start up code has run. This prevents us from firing a process exit before a
            // process start.
            await this._processStartupComplete;
            if (this._store.isDisposed) {
                return;
            }
            // Attempt to kill the pty, it may have already been killed at this
            // point but we want to make sure
            try {
                if (this._ptyProcess) {
                    await this._throttleKillSpawn();
                    this._logService.trace('node-pty.IPty#kill');
                    this._ptyProcess.kill();
                }
            }
            catch (ex) {
                // Swallow, the pty has already been killed
            }
            this._onProcessExit.fire(this._exitCode || 0);
            this.dispose();
        }
        async _throttleKillSpawn() {
            // Only throttle on Windows/conpty
            if (!platform_1.isWindows || !('useConpty' in this._ptyOptions) || !this._ptyOptions.useConpty) {
                return;
            }
            // Use a loop to ensure multiple calls in a single interval space out
            while (Date.now() - TerminalProcess_1._lastKillOrStart < 250 /* Constants.KillSpawnThrottleInterval */) {
                this._logService.trace('Throttling kill/spawn call');
                await (0, async_1.timeout)(250 /* Constants.KillSpawnThrottleInterval */ - (Date.now() - TerminalProcess_1._lastKillOrStart) + 50 /* Constants.KillSpawnSpacingDuration */);
            }
            TerminalProcess_1._lastKillOrStart = Date.now();
        }
        _sendProcessId(pid) {
            this._onProcessReady.fire({
                pid,
                cwd: this._initialCwd,
                windowsPty: this.getWindowsPty()
            });
        }
        _sendProcessTitle(ptyProcess) {
            if (this._store.isDisposed) {
                return;
            }
            this._currentTitle = ptyProcess.process;
            this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: this._currentTitle });
            // If fig is installed it may change the title of the process
            const sanitizedTitle = this.currentTitle.replace(/ \(figterm\)$/g, '');
            this._onDidChangeProperty.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: posixShellTypeMap.get(sanitizedTitle) });
        }
        shutdown(immediate) {
            if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                this._logService.trace('TerminalProcess#shutdown', new Error().stack?.replace(/^Error/, ''));
            }
            // don't force immediate disposal of the terminal processes on Windows as an additional
            // mitigation for https://github.com/microsoft/vscode/issues/71966 which causes the pty host
            // to become unresponsive, disconnecting all terminals across all windows.
            if (immediate && !platform_1.isWindows) {
                this._kill();
            }
            else {
                if (!this._closeTimeout && !this._store.isDisposed) {
                    this._queueProcessExit();
                    // Allow a maximum amount of time for the process to exit, otherwise force kill it
                    setTimeout(() => {
                        if (this._closeTimeout && !this._store.isDisposed) {
                            this._closeTimeout = undefined;
                            this._kill();
                        }
                    }, 5000 /* ShutdownConstants.MaximumShutdownTime */);
                }
            }
        }
        input(data, isBinary) {
            if (this._store.isDisposed || !this._ptyProcess) {
                return;
            }
            for (let i = 0; i <= Math.floor(data.length / 50 /* Constants.WriteMaxChunkSize */); i++) {
                const obj = {
                    isBinary: isBinary || false,
                    data: data.substr(i * 50 /* Constants.WriteMaxChunkSize */, 50 /* Constants.WriteMaxChunkSize */)
                };
                this._writeQueue.push(obj);
            }
            this._startWrite();
        }
        async processBinary(data) {
            this.input(data, true);
        }
        async refreshProperty(type) {
            switch (type) {
                case "cwd" /* ProcessPropertyType.Cwd */: {
                    const newCwd = await this.getCwd();
                    if (newCwd !== this._properties.cwd) {
                        this._properties.cwd = newCwd;
                        this._onDidChangeProperty.fire({ type: "cwd" /* ProcessPropertyType.Cwd */, value: this._properties.cwd });
                    }
                    return newCwd;
                }
                case "initialCwd" /* ProcessPropertyType.InitialCwd */: {
                    const initialCwd = await this.getInitialCwd();
                    if (initialCwd !== this._properties.initialCwd) {
                        this._properties.initialCwd = initialCwd;
                        this._onDidChangeProperty.fire({ type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: this._properties.initialCwd });
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
                this._properties.fixedDimensions = value;
            }
        }
        _startWrite() {
            // Don't write if it's already queued of is there is nothing to write
            if (this._writeTimeout !== undefined || this._writeQueue.length === 0) {
                return;
            }
            this._doWrite();
            // Don't queue more writes if the queue is empty
            if (this._writeQueue.length === 0) {
                this._writeTimeout = undefined;
                return;
            }
            // Queue the next write
            this._writeTimeout = setTimeout(() => {
                this._writeTimeout = undefined;
                this._startWrite();
            }, 5 /* Constants.WriteInterval */);
        }
        _doWrite() {
            const object = this._writeQueue.shift();
            this._logService.trace('node-pty.IPty#write', object.data);
            if (object.isBinary) {
                this._ptyProcess.write(Buffer.from(object.data, 'binary'));
            }
            else {
                this._ptyProcess.write(object.data);
            }
            this._childProcessMonitor?.handleInput();
        }
        resize(cols, rows) {
            if (this._store.isDisposed) {
                return;
            }
            if (typeof cols !== 'number' || typeof rows !== 'number' || isNaN(cols) || isNaN(rows)) {
                return;
            }
            // Ensure that cols and rows are always >= 1, this prevents a native
            // exception in winpty.
            if (this._ptyProcess) {
                cols = Math.max(cols, 1);
                rows = Math.max(rows, 1);
                // Delay resize if needed
                if (this._delayedResizer) {
                    this._delayedResizer.cols = cols;
                    this._delayedResizer.rows = rows;
                    return;
                }
                this._logService.trace('node-pty.IPty#resize', cols, rows);
                try {
                    this._ptyProcess.resize(cols, rows);
                }
                catch (e) {
                    // Swallow error if the pty has already exited
                    this._logService.trace('node-pty.IPty#resize exception ' + e.message);
                    if (this._exitCode !== undefined &&
                        e.message !== 'ioctl(2) failed, EBADF' &&
                        e.message !== 'Cannot resize a pty that has already exited') {
                        throw e;
                    }
                }
            }
        }
        clearBuffer() {
            this._ptyProcess?.clear();
        }
        acknowledgeDataEvent(charCount) {
            // Prevent lower than 0 to heal from errors
            this._unacknowledgedCharCount = Math.max(this._unacknowledgedCharCount - charCount, 0);
            this._logService.trace(`Flow control: Ack ${charCount} chars (unacknowledged: ${this._unacknowledgedCharCount})`);
            if (this._isPtyPaused && this._unacknowledgedCharCount < 5000 /* FlowControlConstants.LowWatermarkChars */) {
                this._logService.trace(`Flow control: Resume (${this._unacknowledgedCharCount} < ${5000 /* FlowControlConstants.LowWatermarkChars */})`);
                this._ptyProcess?.resume();
                this._isPtyPaused = false;
            }
        }
        clearUnacknowledgedChars() {
            this._unacknowledgedCharCount = 0;
            this._logService.trace(`Flow control: Cleared all unacknowledged chars, forcing resume`);
            if (this._isPtyPaused) {
                this._ptyProcess?.resume();
                this._isPtyPaused = false;
            }
        }
        async setUnicodeVersion(version) {
            // No-op
        }
        getInitialCwd() {
            return Promise.resolve(this._initialCwd);
        }
        async getCwd() {
            if (platform_1.isMacintosh) {
                // From Big Sur (darwin v20) there is a spawn blocking thread issue on Electron,
                // this is fixed in VS Code's internal Electron.
                // https://github.com/Microsoft/vscode/issues/105446
                return new Promise(resolve => {
                    if (!this._ptyProcess) {
                        resolve(this._initialCwd);
                        return;
                    }
                    this._logService.trace('node-pty.IPty#pid');
                    (0, child_process_1.exec)('lsof -OPln -p ' + this._ptyProcess.pid + ' | grep cwd', { env: { ...process.env, LANG: 'en_US.UTF-8' } }, (error, stdout, stderr) => {
                        if (!error && stdout !== '') {
                            resolve(stdout.substring(stdout.indexOf('/'), stdout.length - 1));
                        }
                        else {
                            this._logService.error('lsof did not run successfully, it may not be on the $PATH?', error, stdout, stderr);
                            resolve(this._initialCwd);
                        }
                    });
                });
            }
            if (platform_1.isLinux) {
                if (!this._ptyProcess) {
                    return this._initialCwd;
                }
                this._logService.trace('node-pty.IPty#pid');
                try {
                    return await pfs_1.Promises.readlink(`/proc/${this._ptyProcess.pid}/cwd`);
                }
                catch (error) {
                    return this._initialCwd;
                }
            }
            return this._initialCwd;
        }
        getWindowsPty() {
            return platform_1.isWindows ? {
                backend: 'useConpty' in this._ptyOptions && this._ptyOptions.useConpty ? 'conpty' : 'winpty',
                buildNumber: (0, terminalEnvironment_1.getWindowsBuildNumber)()
            } : undefined;
        }
    };
    exports.TerminalProcess = TerminalProcess;
    exports.TerminalProcess = TerminalProcess = TerminalProcess_1 = __decorate([
        __param(7, log_1.ILogService),
        __param(8, productService_1.IProductService)
    ], TerminalProcess);
    /**
     * Tracks the latest resize event to be trigger at a later point.
     */
    class DelayedResizer extends lifecycle_1.Disposable {
        get onTrigger() { return this._onTrigger.event; }
        constructor() {
            super();
            this._onTrigger = this._register(new event_1.Emitter());
            this._timeout = setTimeout(() => {
                this._onTrigger.fire({ rows: this.rows, cols: this.cols });
            }, 1000);
            this._register((0, lifecycle_1.toDisposable)(() => clearTimeout(this._timeout)));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9jZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvbm9kZS90ZXJtaW5hbFByb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1CaEcsSUFBVyxpQkFpQlY7SUFqQkQsV0FBVyxpQkFBaUI7UUFDM0I7Ozs7Ozs7Ozs7V0FVRztRQUNILG1GQUFzQixDQUFBO1FBQ3RCOztXQUVHO1FBQ0gsMEZBQTBCLENBQUE7SUFDM0IsQ0FBQyxFQWpCVSxpQkFBaUIsS0FBakIsaUJBQWlCLFFBaUIzQjtJQUVELElBQVcsU0EyQlY7SUEzQkQsV0FBVyxTQUFTO1FBQ25COzs7Ozs7V0FNRztRQUNILHFGQUErQixDQUFBO1FBQy9COzs7O1dBSUc7UUFDSCxrRkFBNkIsQ0FBQTtRQUU3Qjs7Ozs7V0FLRztRQUNILG9FQUFzQixDQUFBO1FBQ3RCOztXQUVHO1FBQ0gsMkRBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQTNCVSxTQUFTLEtBQVQsU0FBUyxRQTJCbkI7SUFPRCxNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUF5QjtRQUN6RCxDQUFDLE1BQU0sbUNBQXNCO1FBQzdCLENBQUMsS0FBSyxpQ0FBcUI7UUFDM0IsQ0FBQyxNQUFNLG1DQUFzQjtRQUM3QixDQUFDLEtBQUssaUNBQXFCO1FBQzNCLENBQUMsSUFBSSwrQkFBb0I7UUFDekIsQ0FBQyxNQUFNLHlDQUE0QjtRQUNuQyxDQUFDLEtBQUssaUNBQXFCO0tBQzNCLENBQUMsQ0FBQztJQUVJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7O2lCQWdCL0IscUJBQWdCLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFrQnBDLElBQUksV0FBVyxLQUF5QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRW5FLElB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