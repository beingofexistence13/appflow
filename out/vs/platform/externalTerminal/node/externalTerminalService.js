/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/processes", "vs/base/node/pfs", "vs/base/node/processes", "vs/nls", "vs/platform/externalTerminal/common/externalTerminal"], function (require, exports, cp, network_1, path, env, processes_1, pfs, processes, nls, externalTerminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinuxExternalTerminalService = exports.MacExternalTerminalService = exports.WindowsExternalTerminalService = void 0;
    const TERMINAL_TITLE = nls.localize('console.title', "VS Code Console");
    class ExternalTerminalService {
        async getDefaultTerminalForPlatforms() {
            return {
                windows: WindowsExternalTerminalService.getDefaultTerminalWindows(),
                linux: await LinuxExternalTerminalService.getDefaultTerminalLinuxReady(),
                osx: 'xterm'
            };
        }
    }
    class WindowsExternalTerminalService extends ExternalTerminalService {
        static { this.CMD = 'cmd.exe'; }
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, processes.getWindowsShell(), cwd);
        }
        spawnTerminal(spawner, configuration, command, cwd) {
            const exec = configuration.windowsExec || WindowsExternalTerminalService.getDefaultTerminalWindows();
            // Make the drive letter uppercase on Windows (see #9448)
            if (cwd && cwd[1] === ':') {
                cwd = cwd[0].toUpperCase() + cwd.substr(1);
            }
            // cmder ignores the environment cwd and instead opts to always open in %USERPROFILE%
            // unless otherwise specified
            const basename = path.basename(exec, '.exe').toLowerCase();
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
            const exec = 'windowsExec' in settings && settings.windowsExec ? settings.windowsExec : WindowsExternalTerminalService.getDefaultTerminalWindows();
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
                if (path.basename(exec, '.exe') === 'wt') {
                    // Handle Windows Terminal specially; -d to set the cwd and run a cmd.exe instance
                    // inside it
                    spawnExec = exec;
                    cmdArgs = ['-d', '.', WindowsExternalTerminalService.CMD, '/c', command];
                }
                else {
                    spawnExec = WindowsExternalTerminalService.CMD;
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
            if (!WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS) {
                const isWoW64 = !!process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS = `${process.env.windir ? process.env.windir : 'C:\\Windows'}\\${isWoW64 ? 'Sysnative' : 'System32'}\\cmd.exe`;
            }
            return WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS;
        }
    }
    exports.WindowsExternalTerminalService = WindowsExternalTerminalService;
    class MacExternalTerminalService extends ExternalTerminalService {
        static { this.OSASCRIPT = '/usr/bin/osascript'; } // osascript is the AppleScript interpreter on OS X
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, cwd);
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const terminalApp = settings.osxExec || externalTerminal_1.DEFAULT_TERMINAL_OSX;
            return new Promise((resolve, reject) => {
                if (terminalApp === externalTerminal_1.DEFAULT_TERMINAL_OSX || terminalApp === 'iTerm.app') {
                    // On OS X we launch an AppleScript that creates (or reuses) a Terminal window
                    // and then launches the program inside that window.
                    const script = terminalApp === externalTerminal_1.DEFAULT_TERMINAL_OSX ? 'TerminalHelper' : 'iTermHelper';
                    const scriptpath = network_1.FileAccess.asFileUri(`vs/workbench/contrib/externalTerminal/node/${script}.scpt`).fsPath;
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
                    const osa = cp.spawn(MacExternalTerminalService.OSASCRIPT, osaArgs);
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
                                reject(new Error(nls.localize('mac.terminal.script.failed', "Script '{0}' failed with exit code {1}", script, code)));
                            }
                        }
                    });
                }
                else {
                    reject(new Error(nls.localize('mac.terminal.type.not.supported', "'{0}' not supported", terminalApp)));
                }
            });
        }
        spawnTerminal(spawner, configuration, cwd) {
            const terminalApp = configuration.osxExec || externalTerminal_1.DEFAULT_TERMINAL_OSX;
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
    exports.MacExternalTerminalService = MacExternalTerminalService;
    class LinuxExternalTerminalService extends ExternalTerminalService {
        static { this.WAIT_MESSAGE = nls.localize('press.any.key', "Press any key to continue..."); }
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, cwd);
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
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
                    const bashCommand = `${quote(args)}; echo; read -p "${LinuxExternalTerminalService.WAIT_MESSAGE}" -n1;`;
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
                                reject(new Error(nls.localize('linux.term.failed', "'{0}' failed with exit code {1}", exec, code)));
                            }
                        }
                    });
                });
            });
        }
        static async getDefaultTerminalLinuxReady() {
            if (!LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY) {
                if (!env.isLinux) {
                    LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = Promise.resolve('xterm');
                }
                else {
                    const isDebian = await pfs.Promises.exists('/etc/debian_version');
                    LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = new Promise(r => {
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
            return LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY;
        }
        spawnTerminal(spawner, configuration, cwd) {
            const execPromise = configuration.linuxExec ? Promise.resolve(configuration.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
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
    exports.LinuxExternalTerminalService = LinuxExternalTerminalService;
    function getSanitizedEnvironment(process) {
        const env = { ...process.env };
        (0, processes_1.sanitizeProcessEnvironment)(env);
        return env;
    }
    /**
     * tries to turn OS errors into more meaningful error messages
     */
    function improveError(err) {
        if ('errno' in err && err['errno'] === 'ENOENT' && 'path' in err && typeof err['path'] === 'string') {
            return new Error(nls.localize('ext.term.app.not.found', "can't find terminal application '{0}'", err['path']));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxUZXJtaW5hbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlcm5hbFRlcm1pbmFsL25vZGUvZXh0ZXJuYWxUZXJtaW5hbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFFeEUsTUFBZSx1QkFBdUI7UUFHckMsS0FBSyxDQUFDLDhCQUE4QjtZQUNuQyxPQUFPO2dCQUNOLE9BQU8sRUFBRSw4QkFBOEIsQ0FBQyx5QkFBeUIsRUFBRTtnQkFDbkUsS0FBSyxFQUFFLE1BQU0sNEJBQTRCLENBQUMsNEJBQTRCLEVBQUU7Z0JBQ3hFLEdBQUcsRUFBRSxPQUFPO2FBQ1osQ0FBQztRQUNILENBQUM7S0FDRDtJQUVELE1BQWEsOEJBQStCLFNBQVEsdUJBQXVCO2lCQUNsRCxRQUFHLEdBQUcsU0FBUyxDQUFDO1FBR2pDLFlBQVksQ0FBQyxhQUF3QyxFQUFFLEdBQVk7WUFDekUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLGVBQWUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBa0IsRUFBRSxhQUF3QyxFQUFFLE9BQWUsRUFBRSxHQUFZO1lBQy9HLE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxXQUFXLElBQUksOEJBQThCLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUVyRyx5REFBeUQ7WUFDekQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDMUIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FB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