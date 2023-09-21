/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "net", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/node/pfs", "vs/nls", "../common/abstractDebugAdapter"], function (require, exports, cp, net, objects, path, platform, strings, pfs_1, nls, abstractDebugAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExecutableDebugAdapter = exports.NamedPipeDebugAdapter = exports.SocketDebugAdapter = exports.NetworkDebugAdapter = exports.StreamDebugAdapter = void 0;
    /**
     * An implementation that communicates via two streams with the debug adapter.
     */
    class StreamDebugAdapter extends abstractDebugAdapter_1.AbstractDebugAdapter {
        static { this.TWO_CRLF = '\r\n\r\n'; }
        static { this.HEADER_LINESEPARATOR = /\r?\n/; } // allow for non-RFC 2822 conforming line separators
        static { this.HEADER_FIELDSEPARATOR = /: */; }
        constructor() {
            super();
            this.rawData = Buffer.allocUnsafe(0);
            this.contentLength = -1;
        }
        connect(readable, writable) {
            this.outputStream = writable;
            this.rawData = Buffer.allocUnsafe(0);
            this.contentLength = -1;
            readable.on('data', (data) => this.handleData(data));
        }
        sendMessage(message) {
            if (this.outputStream) {
                const json = JSON.stringify(message);
                this.outputStream.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}${StreamDebugAdapter.TWO_CRLF}${json}`, 'utf8');
            }
        }
        handleData(data) {
            this.rawData = Buffer.concat([this.rawData, data]);
            while (true) {
                if (this.contentLength >= 0) {
                    if (this.rawData.length >= this.contentLength) {
                        const message = this.rawData.toString('utf8', 0, this.contentLength);
                        this.rawData = this.rawData.slice(this.contentLength);
                        this.contentLength = -1;
                        if (message.length > 0) {
                            try {
                                this.acceptMessage(JSON.parse(message));
                            }
                            catch (e) {
                                this._onError.fire(new Error((e.message || e) + '\n' + message));
                            }
                        }
                        continue; // there may be more complete messages to process
                    }
                }
                else {
                    const idx = this.rawData.indexOf(StreamDebugAdapter.TWO_CRLF);
                    if (idx !== -1) {
                        const header = this.rawData.toString('utf8', 0, idx);
                        const lines = header.split(StreamDebugAdapter.HEADER_LINESEPARATOR);
                        for (const h of lines) {
                            const kvPair = h.split(StreamDebugAdapter.HEADER_FIELDSEPARATOR);
                            if (kvPair[0] === 'Content-Length') {
                                this.contentLength = Number(kvPair[1]);
                            }
                        }
                        this.rawData = this.rawData.slice(idx + StreamDebugAdapter.TWO_CRLF.length);
                        continue;
                    }
                }
                break;
            }
        }
    }
    exports.StreamDebugAdapter = StreamDebugAdapter;
    class NetworkDebugAdapter extends StreamDebugAdapter {
        startSession() {
            return new Promise((resolve, reject) => {
                let connected = false;
                this.socket = this.createConnection(() => {
                    this.connect(this.socket, this.socket);
                    resolve();
                    connected = true;
                });
                this.socket.on('close', () => {
                    if (connected) {
                        this._onError.fire(new Error('connection closed'));
                    }
                    else {
                        reject(new Error('connection closed'));
                    }
                });
                this.socket.on('error', error => {
                    if (connected) {
                        this._onError.fire(error);
                    }
                    else {
                        reject(error);
                    }
                });
            });
        }
        async stopSession() {
            await this.cancelPendingRequests();
            if (this.socket) {
                this.socket.end();
                this.socket = undefined;
            }
        }
    }
    exports.NetworkDebugAdapter = NetworkDebugAdapter;
    /**
     * An implementation that connects to a debug adapter via a socket.
    */
    class SocketDebugAdapter extends NetworkDebugAdapter {
        constructor(adapterServer) {
            super();
            this.adapterServer = adapterServer;
        }
        createConnection(connectionListener) {
            return net.createConnection(this.adapterServer.port, this.adapterServer.host || '127.0.0.1', connectionListener);
        }
    }
    exports.SocketDebugAdapter = SocketDebugAdapter;
    /**
     * An implementation that connects to a debug adapter via a NamedPipe (on Windows)/UNIX Domain Socket (on non-Windows).
     */
    class NamedPipeDebugAdapter extends NetworkDebugAdapter {
        constructor(adapterServer) {
            super();
            this.adapterServer = adapterServer;
        }
        createConnection(connectionListener) {
            return net.createConnection(this.adapterServer.path, connectionListener);
        }
    }
    exports.NamedPipeDebugAdapter = NamedPipeDebugAdapter;
    /**
     * An implementation that launches the debug adapter as a separate process and communicates via stdin/stdout.
    */
    class ExecutableDebugAdapter extends StreamDebugAdapter {
        constructor(adapterExecutable, debugType) {
            super();
            this.adapterExecutable = adapterExecutable;
            this.debugType = debugType;
        }
        async startSession() {
            const command = this.adapterExecutable.command;
            const args = this.adapterExecutable.args;
            const options = this.adapterExecutable.options || {};
            try {
                // verify executables asynchronously
                if (command) {
                    if (path.isAbsolute(command)) {
                        const commandExists = await pfs_1.Promises.exists(command);
                        if (!commandExists) {
                            throw new Error(nls.localize('debugAdapterBinNotFound', "Debug adapter executable '{0}' does not exist.", command));
                        }
                    }
                    else {
                        // relative path
                        if (command.indexOf('/') < 0 && command.indexOf('\\') < 0) {
                            // no separators: command looks like a runtime name like 'node' or 'mono'
                            // TODO: check that the runtime is available on PATH
                        }
                    }
                }
                else {
                    throw new Error(nls.localize({ key: 'debugAdapterCannotDetermineExecutable', comment: ['Adapter executable file not found'] }, "Cannot determine executable for debug adapter '{0}'.", this.debugType));
                }
                let env = process.env;
                if (options.env && Object.keys(options.env).length > 0) {
                    env = objects.mixin(objects.deepClone(process.env), options.env);
                }
                if (command === 'node') {
                    if (Array.isArray(args) && args.length > 0) {
                        const isElectron = !!process.env['ELECTRON_RUN_AS_NODE'] || !!process.versions['electron'];
                        const forkOptions = {
                            env: env,
                            execArgv: isElectron ? ['-e', 'delete process.env.ELECTRON_RUN_AS_NODE;require(process.argv[1])'] : [],
                            silent: true
                        };
                        if (options.cwd) {
                            forkOptions.cwd = options.cwd;
                        }
                        const child = cp.fork(args[0], args.slice(1), forkOptions);
                        if (!child.pid) {
                            throw new Error(nls.localize('unableToLaunchDebugAdapter', "Unable to launch debug adapter from '{0}'.", args[0]));
                        }
                        this.serverProcess = child;
                    }
                    else {
                        throw new Error(nls.localize('unableToLaunchDebugAdapterNoArgs', "Unable to launch debug adapter."));
                    }
                }
                else {
                    const spawnOptions = {
                        env: env
                    };
                    if (options.cwd) {
                        spawnOptions.cwd = options.cwd;
                    }
                    this.serverProcess = cp.spawn(command, args, spawnOptions);
                }
                this.serverProcess.on('error', err => {
                    this._onError.fire(err);
                });
                this.serverProcess.on('exit', (code, signal) => {
                    this._onExit.fire(code);
                });
                this.serverProcess.stdout.on('close', () => {
                    this._onError.fire(new Error('read error'));
                });
                this.serverProcess.stdout.on('error', error => {
                    this._onError.fire(error);
                });
                this.serverProcess.stdin.on('error', error => {
                    this._onError.fire(error);
                });
                this.serverProcess.stderr.resume();
                // finally connect to the DA
                this.connect(this.serverProcess.stdout, this.serverProcess.stdin);
            }
            catch (err) {
                this._onError.fire(err);
            }
        }
        async stopSession() {
            if (!this.serverProcess) {
                return Promise.resolve(undefined);
            }
            // when killing a process in windows its child
            // processes are *not* killed but become root
            // processes. Therefore we use TASKKILL.EXE
            await this.cancelPendingRequests();
            if (platform.isWindows) {
                return new Promise((c, e) => {
                    const killer = cp.exec(`taskkill /F /T /PID ${this.serverProcess.pid}`, function (err, stdout, stderr) {
                        if (err) {
                            return e(err);
                        }
                    });
                    killer.on('exit', c);
                    killer.on('error', e);
                });
            }
            else {
                this.serverProcess.kill('SIGTERM');
                return Promise.resolve(undefined);
            }
        }
        static extract(platformContribution, extensionFolderPath) {
            if (!platformContribution) {
                return undefined;
            }
            const result = Object.create(null);
            if (platformContribution.runtime) {
                if (platformContribution.runtime.indexOf('./') === 0) { // TODO
                    result.runtime = path.join(extensionFolderPath, platformContribution.runtime);
                }
                else {
                    result.runtime = platformContribution.runtime;
                }
            }
            if (platformContribution.runtimeArgs) {
                result.runtimeArgs = platformContribution.runtimeArgs;
            }
            if (platformContribution.program) {
                if (!path.isAbsolute(platformContribution.program)) {
                    result.program = path.join(extensionFolderPath, platformContribution.program);
                }
                else {
                    result.program = platformContribution.program;
                }
            }
            if (platformContribution.args) {
                result.args = platformContribution.args;
            }
            const contribution = platformContribution;
            if (contribution.win) {
                result.win = ExecutableDebugAdapter.extract(contribution.win, extensionFolderPath);
            }
            if (contribution.winx86) {
                result.winx86 = ExecutableDebugAdapter.extract(contribution.winx86, extensionFolderPath);
            }
            if (contribution.windows) {
                result.windows = ExecutableDebugAdapter.extract(contribution.windows, extensionFolderPath);
            }
            if (contribution.osx) {
                result.osx = ExecutableDebugAdapter.extract(contribution.osx, extensionFolderPath);
            }
            if (contribution.linux) {
                result.linux = ExecutableDebugAdapter.extract(contribution.linux, extensionFolderPath);
            }
            return result;
        }
        static platformAdapterExecutable(extensionDescriptions, debugType) {
            let result = Object.create(null);
            debugType = debugType.toLowerCase();
            // merge all contributions into one
            for (const ed of extensionDescriptions) {
                if (ed.contributes) {
                    const debuggers = ed.contributes['debuggers'];
                    if (debuggers && debuggers.length > 0) {
                        debuggers.filter(dbg => typeof dbg.type === 'string' && strings.equalsIgnoreCase(dbg.type, debugType)).forEach(dbg => {
                            // extract relevant attributes and make them absolute where needed
                            const extractedDbg = ExecutableDebugAdapter.extract(dbg, ed.extensionLocation.fsPath);
                            // merge
                            result = objects.mixin(result, extractedDbg, ed.isBuiltin);
                        });
                    }
                }
            }
            // select the right platform
            let platformInfo;
            if (platform.isWindows && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
                platformInfo = result.winx86 || result.win || result.windows;
            }
            else if (platform.isWindows) {
                platformInfo = result.win || result.windows;
            }
            else if (platform.isMacintosh) {
                platformInfo = result.osx;
            }
            else if (platform.isLinux) {
                platformInfo = result.linux;
            }
            platformInfo = platformInfo || result;
            // these are the relevant attributes
            const program = platformInfo.program || result.program;
            const args = platformInfo.args || result.args;
            const runtime = platformInfo.runtime || result.runtime;
            const runtimeArgs = platformInfo.runtimeArgs || result.runtimeArgs;
            if (runtime) {
                return {
                    type: 'executable',
                    command: runtime,
                    args: (runtimeArgs || []).concat(typeof program === 'string' ? [program] : []).concat(args || [])
                };
            }
            else if (program) {
                return {
                    type: 'executable',
                    command: program,
                    args: args || []
                };
            }
            // nothing found
            return undefined;
        }
    }
    exports.ExecutableDebugAdapter = ExecutableDebugAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvbm9kZS9kZWJ1Z0FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHOztPQUVHO0lBQ0gsTUFBc0Isa0JBQW1CLFNBQVEsMkNBQW9CO2lCQUU1QyxhQUFRLEdBQUcsVUFBVSxBQUFiLENBQWM7aUJBQ3RCLHlCQUFvQixHQUFHLE9BQU8sQUFBVixDQUFXLEdBQUMsb0RBQW9EO2lCQUNwRiwwQkFBcUIsR0FBRyxLQUFLLEFBQVIsQ0FBUztRQU10RDtZQUNDLEtBQUssRUFBRSxDQUFDO1lBSkQsWUFBTyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsa0JBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUkzQixDQUFDO1FBRVMsT0FBTyxDQUFDLFFBQXlCLEVBQUUsUUFBeUI7WUFFckUsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFeEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQXNDO1lBRWpELElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLE1BQU0s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