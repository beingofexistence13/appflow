/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "net", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/node/pfs", "vs/nls!vs/workbench/contrib/debug/node/debugAdapter", "../common/abstractDebugAdapter"], function (require, exports, cp, net, objects, path, platform, strings, pfs_1, nls, abstractDebugAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ndc = exports.$mdc = exports.$ldc = exports.$kdc = exports.$jdc = void 0;
    /**
     * An implementation that communicates via two streams with the debug adapter.
     */
    class $jdc extends abstractDebugAdapter_1.$Ecb {
        static { this.a = '\r\n\r\n'; }
        static { this.b = /\r?\n/; } // allow for non-RFC 2822 conforming line separators
        static { this.l = /: */; }
        constructor() {
            super();
            this.r = Buffer.allocUnsafe(0);
            this.t = -1;
        }
        v(readable, writable) {
            this.p = writable;
            this.r = Buffer.allocUnsafe(0);
            this.t = -1;
            readable.on('data', (data) => this.w(data));
        }
        sendMessage(message) {
            if (this.p) {
                const json = JSON.stringify(message);
                this.p.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}${$jdc.a}${json}`, 'utf8');
            }
        }
        w(data) {
            this.r = Buffer.concat([this.r, data]);
            while (true) {
                if (this.t >= 0) {
                    if (this.r.length >= this.t) {
                        const message = this.r.toString('utf8', 0, this.t);
                        this.r = this.r.slice(this.t);
                        this.t = -1;
                        if (message.length > 0) {
                            try {
                                this.acceptMessage(JSON.parse(message));
                            }
                            catch (e) {
                                this.m.fire(new Error((e.message || e) + '\n' + message));
                            }
                        }
                        continue; // there may be more complete messages to process
                    }
                }
                else {
                    const idx = this.r.indexOf($jdc.a);
                    if (idx !== -1) {
                        const header = this.r.toString('utf8', 0, idx);
                        const lines = header.split($jdc.b);
                        for (const h of lines) {
                            const kvPair = h.split($jdc.l);
                            if (kvPair[0] === 'Content-Length') {
                                this.t = Number(kvPair[1]);
                            }
                        }
                        this.r = this.r.slice(idx + $jdc.a.length);
                        continue;
                    }
                }
                break;
            }
        }
    }
    exports.$jdc = $jdc;
    class $kdc extends $jdc {
        startSession() {
            return new Promise((resolve, reject) => {
                let connected = false;
                this.x = this.y(() => {
                    this.v(this.x, this.x);
                    resolve();
                    connected = true;
                });
                this.x.on('close', () => {
                    if (connected) {
                        this.m.fire(new Error('connection closed'));
                    }
                    else {
                        reject(new Error('connection closed'));
                    }
                });
                this.x.on('error', error => {
                    if (connected) {
                        this.m.fire(error);
                    }
                    else {
                        reject(error);
                    }
                });
            });
        }
        async stopSession() {
            await this.u();
            if (this.x) {
                this.x.end();
                this.x = undefined;
            }
        }
    }
    exports.$kdc = $kdc;
    /**
     * An implementation that connects to a debug adapter via a socket.
    */
    class $ldc extends $kdc {
        constructor(z) {
            super();
            this.z = z;
        }
        y(connectionListener) {
            return net.createConnection(this.z.port, this.z.host || '127.0.0.1', connectionListener);
        }
    }
    exports.$ldc = $ldc;
    /**
     * An implementation that connects to a debug adapter via a NamedPipe (on Windows)/UNIX Domain Socket (on non-Windows).
     */
    class $mdc extends $kdc {
        constructor(z) {
            super();
            this.z = z;
        }
        y(connectionListener) {
            return net.createConnection(this.z.path, connectionListener);
        }
    }
    exports.$mdc = $mdc;
    /**
     * An implementation that launches the debug adapter as a separate process and communicates via stdin/stdout.
    */
    class $ndc extends $jdc {
        constructor(y, z) {
            super();
            this.y = y;
            this.z = z;
        }
        async startSession() {
            const command = this.y.command;
            const args = this.y.args;
            const options = this.y.options || {};
            try {
                // verify executables asynchronously
                if (command) {
                    if (path.$8d(command)) {
                        const commandExists = await pfs_1.Promises.exists(command);
                        if (!commandExists) {
                            throw new Error(nls.localize(0, null, command));
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
                    throw new Error(nls.localize(1, null, this.z));
                }
                let env = process.env;
                if (options.env && Object.keys(options.env).length > 0) {
                    env = objects.$Ym(objects.$Vm(process.env), options.env);
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
                            throw new Error(nls.localize(2, null, args[0]));
                        }
                        this.x = child;
                    }
                    else {
                        throw new Error(nls.localize(3, null));
                    }
                }
                else {
                    const spawnOptions = {
                        env: env
                    };
                    if (options.cwd) {
                        spawnOptions.cwd = options.cwd;
                    }
                    this.x = cp.spawn(command, args, spawnOptions);
                }
                this.x.on('error', err => {
                    this.m.fire(err);
                });
                this.x.on('exit', (code, signal) => {
                    this.n.fire(code);
                });
                this.x.stdout.on('close', () => {
                    this.m.fire(new Error('read error'));
                });
                this.x.stdout.on('error', error => {
                    this.m.fire(error);
                });
                this.x.stdin.on('error', error => {
                    this.m.fire(error);
                });
                this.x.stderr.resume();
                // finally connect to the DA
                this.v(this.x.stdout, this.x.stdin);
            }
            catch (err) {
                this.m.fire(err);
            }
        }
        async stopSession() {
            if (!this.x) {
                return Promise.resolve(undefined);
            }
            // when killing a process in windows its child
            // processes are *not* killed but become root
            // processes. Therefore we use TASKKILL.EXE
            await this.u();
            if (platform.$i) {
                return new Promise((c, e) => {
                    const killer = cp.exec(`taskkill /F /T /PID ${this.x.pid}`, function (err, stdout, stderr) {
                        if (err) {
                            return e(err);
                        }
                    });
                    killer.on('exit', c);
                    killer.on('error', e);
                });
            }
            else {
                this.x.kill('SIGTERM');
                return Promise.resolve(undefined);
            }
        }
        static A(platformContribution, extensionFolderPath) {
            if (!platformContribution) {
                return undefined;
            }
            const result = Object.create(null);
            if (platformContribution.runtime) {
                if (platformContribution.runtime.indexOf('./') === 0) { // TODO
                    result.runtime = path.$9d(extensionFolderPath, platformContribution.runtime);
                }
                else {
                    result.runtime = platformContribution.runtime;
                }
            }
            if (platformContribution.runtimeArgs) {
                result.runtimeArgs = platformContribution.runtimeArgs;
            }
            if (platformContribution.program) {
                if (!path.$8d(platformContribution.program)) {
                    result.program = path.$9d(extensionFolderPath, platformContribution.program);
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
                result.win = $ndc.A(contribution.win, extensionFolderPath);
            }
            if (contribution.winx86) {
                result.winx86 = $ndc.A(contribution.winx86, extensionFolderPath);
            }
            if (contribution.windows) {
                result.windows = $ndc.A(contribution.windows, extensionFolderPath);
            }
            if (contribution.osx) {
                result.osx = $ndc.A(contribution.osx, extensionFolderPath);
            }
            if (contribution.linux) {
                result.linux = $ndc.A(contribution.linux, extensionFolderPath);
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
                        debuggers.filter(dbg => typeof dbg.type === 'string' && strings.$Me(dbg.type, debugType)).forEach(dbg => {
                            // extract relevant attributes and make them absolute where needed
                            const extractedDbg = $ndc.A(dbg, ed.extensionLocation.fsPath);
                            // merge
                            result = objects.$Ym(result, extractedDbg, ed.isBuiltin);
                        });
                    }
                }
            }
            // select the right platform
            let platformInfo;
            if (platform.$i && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
                platformInfo = result.winx86 || result.win || result.windows;
            }
            else if (platform.$i) {
                platformInfo = result.win || result.windows;
            }
            else if (platform.$j) {
                platformInfo = result.osx;
            }
            else if (platform.$k) {
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
    exports.$ndc = $ndc;
});
//# sourceMappingURL=debugAdapter.js.map