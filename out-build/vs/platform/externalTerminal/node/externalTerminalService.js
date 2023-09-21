/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/processes", "vs/base/node/pfs", "vs/base/node/processes", "vs/nls!vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/externalTerminal/common/externalTerminal"], function (require, exports, cp, network_1, path, env, processes_1, pfs, processes, nls, externalTerminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$85b = exports.$75b = exports.$65b = void 0;
    const TERMINAL_TITLE = nls.localize(0, null);
    class ExternalTerminalService {
        async getDefaultTerminalForPlatforms() {
            return {
                windows: $65b.getDefaultTerminalWindows(),
                linux: await $85b.getDefaultTerminalLinuxReady(),
                osx: 'xterm'
            };
        }
    }
    class $65b extends ExternalTerminalService {
        static { this.b = 'cmd.exe'; }
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, processes.$ul(), cwd);
        }
        spawnTerminal(spawner, configuration, command, cwd) {
            const exec = configuration.windowsExec || $65b.getDefaultTerminalWindows();
            // Make the drive letter uppercase on Windows (see #9448)
            if (cwd && cwd[1] === ':') {
                cwd = cwd[0].toUpperCase() + cwd.substr(1);
            }
            // cmder ignores the environment cwd and instead opts to always open in %USERPROFILE%
            // unless otherwise specified
            const basename = path.$ae(exec, '.exe').toLowerCase();
            if (basename === 'cmder') {
                spawner.spawn(exec, cwd ? [cwd] : undefined);
                return Promise.resolve(undefined);
            }
            const cmdArgs = ['/c', 'start', '/wait'];
            if (exec.indexOf(' ') >= 0) {
                // The "" argument is the window title. Without this, exec doesn't work when the path
                // contains spaces
                cmdArgs.push('""');
            }
            cmdArgs.push(exec);
            // Add starting directory parameter for Windows Terminal (see #90734)
            if (basename === 'wt') {
                cmdArgs.push('-d .');
            }
            return new Promise((c, e) => {
                const env = getSanitizedEnvironment(process);
                const child = spawner.spawn(command, cmdArgs, { cwd, env });
                child.on('error', e);
                child.on('exit', () => c());
            });
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const exec = 'windowsExec' in settings && settings.windowsExec ? settings.windowsExec : $65b.getDefaultTerminalWindows();
            return new Promise((resolve, reject) => {
                const title = `"${dir} - ${TERMINAL_TITLE}"`;
                const command = `""${args.join('" "')}" & pause"`; // use '|' to only pause on non-zero exit code
                // merge environment variables into a copy of the process.env
                const env = Object.assign({}, getSanitizedEnvironment(process), envVars);
                // delete environment variables that have a null value
                Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);
                const options = {
                    cwd: dir,
                    env: env,
                    windowsVerbatimArguments: true
                };
                let spawnExec;
                let cmdArgs;
                if (path.$ae(exec, '.exe') === 'wt') {
                    // Handle Windows Terminal specially; -d to set the cwd and run a cmd.exe instance
                    // inside it
                    spawnExec = exec;
                    cmdArgs = ['-d', '.', $65b.b, '/c', command];
                }
                else {
                    spawnExec = $65b.b;
                    cmdArgs = ['/c', 'start', title, '/wait', exec, '/c', command];
                }
                const cmd = cp.spawn(spawnExec, cmdArgs, options);
                cmd.on('error', err => {
                    reject(improveError(err));
                });
                resolve(undefined);
            });
        }
        static getDefaultTerminalWindows() {
            if (!$65b.d) {
                const isWoW64 = !!process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                $65b.d = `${process.env.windir ? process.env.windir : 'C:\\Windows'}\\${isWoW64 ? 'Sysnative' : 'System32'}\\cmd.exe`;
            }
            return $65b.d;
        }
    }
    exports.$65b = $65b;
    class $75b extends ExternalTerminalService {
        static { this.b = '/usr/bin/osascript'; } // osascript is the AppleScript interpreter on OS X
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, cwd);
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const terminalApp = settings.osxExec || externalTerminal_1.$kXb;
            return new Promise((resolve, reject) => {
                if (terminalApp === externalTerminal_1.$kXb || terminalApp === 'iTerm.app') {
                    // On OS X we launch an AppleScript that creates (or reuses) a Terminal window
                    // and then launches the program inside that window.
                    const script = terminalApp === externalTerminal_1.$kXb ? 'TerminalHelper' : 'iTermHelper';
                    const scriptpath = network_1.$2f.asFileUri(`vs/workbench/contrib/externalTerminal/node/${script}.scpt`).fsPath;
                    const osaArgs = [
                        scriptpath,
                        '-t', title || TERMINAL_TITLE,
                        '-w', dir,
                    ];
                    for (const a of args) {
                        osaArgs.push('-a');
                        osaArgs.push(a);
                    }
                    if (envVars) {
                        // merge environment variables into a copy of the process.env
                        const env = Object.assign({}, getSanitizedEnvironment(process), envVars);
                        for (const key in env) {
                            const value = env[key];
                            if (value === null) {
                                osaArgs.push('-u');
                                osaArgs.push(key);
                            }
                            else {
                                osaArgs.push('-e');
                                osaArgs.push(`${key}=${value}`);
                            }
                        }
                    }
                    let stderr = '';
                    const osa = cp.spawn($75b.b, osaArgs);
                    osa.on('error', err => {
                        reject(improveError(err));
                    });
                    osa.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    osa.on('exit', (code) => {
                        if (code === 0) { // OK
                            resolve(undefined);
                        }
                        else {
                            if (stderr) {
                                const lines = stderr.split('\n', 1);
                                reject(new Error(lines[0]));
                            }
                            else {
                                reject(new Error(nls.localize(1, null, script, code)));
                            }
                        }
                    });
                }
                else {
                    reject(new Error(nls.localize(2, null, terminalApp)));
                }
            });
        }
        spawnTerminal(spawner, configuration, cwd) {
            const terminalApp = configuration.osxExec || externalTerminal_1.$kXb;
            return new Promise((c, e) => {
                const args = ['-a', terminalApp];
                if (cwd) {
                    args.push(cwd);
                }
                const env = getSanitizedEnvironment(process);
                const child = spawner.spawn('/usr/bin/open', args, { cwd, env });
                child.on('error', e);
                child.on('exit', () => c());
            });
        }
    }
    exports.$75b = $75b;
    class $85b extends ExternalTerminalService {
        static { this.b = nls.localize(3, null); }
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, cwd);
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : $85b.getDefaultTerminalLinuxReady();
            return new Promise((resolve, reject) => {
                const termArgs = [];
                //termArgs.push('--title');
                //termArgs.push(`"${TERMINAL_TITLE}"`);
                execPromise.then(exec => {
                    if (exec.indexOf('gnome-terminal') >= 0) {
                        termArgs.push('-x');
                    }
                    else {
                        termArgs.push('-e');
                    }
                    termArgs.push('bash');
                    termArgs.push('-c');
                    const bashCommand = `${quote(args)}; echo; read -p "${$85b.b}" -n1;`;
                    termArgs.push(`''${bashCommand}''`); // wrapping argument in two sets of ' because node is so "friendly" that it removes one set...
                    // merge environment variables into a copy of the process.env
                    const env = Object.assign({}, getSanitizedEnvironment(process), envVars);
                    // delete environment variables that have a null value
                    Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);
                    const options = {
                        cwd: dir,
                        env: env
                    };
                    let stderr = '';
                    const cmd = cp.spawn(exec, termArgs, options);
                    cmd.on('error', err => {
                        reject(improveError(err));
                    });
                    cmd.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    cmd.on('exit', (code) => {
                        if (code === 0) { // OK
                            resolve(undefined);
                        }
                        else {
                            if (stderr) {
                                const lines = stderr.split('\n', 1);
                                reject(new Error(lines[0]));
                            }
                            else {
                                reject(new Error(nls.localize(4, null, exec, code)));
                            }
                        }
                    });
                });
            });
        }
        static async getDefaultTerminalLinuxReady() {
            if (!$85b.d) {
                if (!env.$k) {
                    $85b.d = Promise.resolve('xterm');
                }
                else {
                    const isDebian = await pfs.Promises.exists('/etc/debian_version');
                    $85b.d = new Promise(r => {
                        if (isDebian) {
                            r('x-terminal-emulator');
                        }
                        else if (process.env.DESKTOP_SESSION === 'gnome' || process.env.DESKTOP_SESSION === 'gnome-classic') {
                            r('gnome-terminal');
                        }
                        else if (process.env.DESKTOP_SESSION === 'kde-plasma') {
                            r('konsole');
                        }
                        else if (process.env.COLORTERM) {
                            r(process.env.COLORTERM);
                        }
                        else if (process.env.TERM) {
                            r(process.env.TERM);
                        }
                        else {
                            r('xterm');
                        }
                    });
                }
            }
            return $85b.d;
        }
        spawnTerminal(spawner, configuration, cwd) {
            const execPromise = configuration.linuxExec ? Promise.resolve(configuration.linuxExec) : $85b.getDefaultTerminalLinuxReady();
            return new Promise((c, e) => {
                execPromise.then(exec => {
                    const env = getSanitizedEnvironment(process);
                    const child = spawner.spawn(exec, [], { cwd, env });
                    child.on('error', e);
                    child.on('exit', () => c());
                });
            });
        }
    }
    exports.$85b = $85b;
    function getSanitizedEnvironment(process) {
        const env = { ...process.env };
        (0, processes_1.$sl)(env);
        return env;
    }
    /**
     * tries to turn OS errors into more meaningful error messages
     */
    function improveError(err) {
        if ('errno' in err && err['errno'] === 'ENOENT' && 'path' in err && typeof err['path'] === 'string') {
            return new Error(nls.localize(5, null, err['path']));
        }
        return err;
    }
    /**
     * Quote args if necessary and combine into a space separated string.
     */
    function quote(args) {
        let r = '';
        for (const a of args) {
            if (a.indexOf(' ') >= 0) {
                r += '"' + a + '"';
            }
            else {
                r += a;
            }
            r += ' ';
        }
        return r;
    }
});
//# sourceMappingURL=externalTerminalService.js.map