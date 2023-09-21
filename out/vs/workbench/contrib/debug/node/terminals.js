/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/extpath", "vs/base/common/platform"], function (require, exports, cp, extpath_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareCommand = exports.hasChildProcesses = void 0;
    function spawnAsPromised(command, args) {
        return new Promise((resolve, reject) => {
            let stdout = '';
            const child = cp.spawn(command, args);
            if (child.pid) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }
            child.on('error', err => {
                reject(err);
            });
            child.on('close', code => {
                resolve(stdout);
            });
        });
    }
    async function hasChildProcesses(processId) {
        if (processId) {
            // if shell has at least one child process, assume that shell is busy
            if (platform.isWindows) {
                const windowsProcessTree = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-process-tree'], resolve_1, reject_1); });
                return new Promise(resolve => {
                    windowsProcessTree.getProcessTree(processId, processTree => {
                        resolve(!!processTree && processTree.children.length > 0);
                    });
                });
            }
            else {
                return spawnAsPromised('/usr/bin/pgrep', ['-lP', String(processId)]).then(stdout => {
                    const r = stdout.trim();
                    if (r.length === 0 || r.indexOf(' tmux') >= 0) { // ignore 'tmux'; see #43683
                        return false;
                    }
                    else {
                        return true;
                    }
                }, error => {
                    return true;
                });
            }
        }
        // fall back to safe side
        return Promise.resolve(true);
    }
    exports.hasChildProcesses = hasChildProcesses;
    var ShellType;
    (function (ShellType) {
        ShellType[ShellType["cmd"] = 0] = "cmd";
        ShellType[ShellType["powershell"] = 1] = "powershell";
        ShellType[ShellType["bash"] = 2] = "bash";
    })(ShellType || (ShellType = {}));
    function prepareCommand(shell, args, argsCanBeInterpretedByShell, cwd, env) {
        shell = shell.trim().toLowerCase();
        // try to determine the shell type
        let shellType;
        if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0) {
            shellType = 1 /* ShellType.powershell */;
        }
        else if (shell.indexOf('cmd.exe') >= 0) {
            shellType = 0 /* ShellType.cmd */;
        }
        else if (shell.indexOf('bash') >= 0) {
            shellType = 2 /* ShellType.bash */;
        }
        else if (platform.isWindows) {
            shellType = 0 /* ShellType.cmd */; // pick a good default for Windows
        }
        else {
            shellType = 2 /* ShellType.bash */; // pick a good default for anything else
        }
        let quote;
        // begin command with a space to avoid polluting shell history
        let command = ' ';
        switch (shellType) {
            case 1 /* ShellType.powershell */:
                quote = (s) => {
                    s = s.replace(/\'/g, '\'\'');
                    if (s.length > 0 && s.charAt(s.length - 1) === '\\') {
                        return `'${s}\\'`;
                    }
                    return `'${s}'`;
                };
                if (cwd) {
                    const driveLetter = (0, extpath_1.getDriveLetter)(cwd);
                    if (driveLetter) {
                        command += `${driveLetter}:; `;
                    }
                    command += `cd ${quote(cwd)}; `;
                }
                if (env) {
                    for (const key in env) {
                        const value = env[key];
                        if (value === null) {
                            command += `Remove-Item env:${key}; `;
                        }
                        else {
                            command += `\${env:${key}}='${value}'; `;
                        }
                    }
                }
                if (args.length > 0) {
                    const arg = args.shift();
                    const cmd = argsCanBeInterpretedByShell ? arg : quote(arg);
                    command += (cmd[0] === '\'') ? `& ${cmd} ` : `${cmd} `;
                    for (const a of args) {
                        command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                        command += ' ';
                    }
                }
                break;
            case 0 /* ShellType.cmd */:
                quote = (s) => {
                    // Note: Wrapping in cmd /C "..." complicates the escaping.
                    // cmd /C "node -e "console.log(process.argv)" """A^>0"""" # prints "A>0"
                    // cmd /C "node -e "console.log(process.argv)" "foo^> bar"" # prints foo> bar
                    // Outside of the cmd /C, it could be a simple quoting, but here, the ^ is needed too
                    s = s.replace(/\"/g, '""');
                    s = s.replace(/([><!^&|])/g, '^$1');
                    return (' "'.split('').some(char => s.includes(char)) || s.length === 0) ? `"${s}"` : s;
                };
                if (cwd) {
                    const driveLetter = (0, extpath_1.getDriveLetter)(cwd);
                    if (driveLetter) {
                        command += `${driveLetter}: && `;
                    }
                    command += `cd ${quote(cwd)} && `;
                }
                if (env) {
                    command += 'cmd /C "';
                    for (const key in env) {
                        let value = env[key];
                        if (value === null) {
                            command += `set "${key}=" && `;
                        }
                        else {
                            value = value.replace(/[&^|<>]/g, s => `^${s}`);
                            command += `set "${key}=${value}" && `;
                        }
                    }
                }
                for (const a of args) {
                    command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                    command += ' ';
                }
                if (env) {
                    command += '"';
                }
                break;
            case 2 /* ShellType.bash */: {
                quote = (s) => {
                    s = s.replace(/(["'\\\$!><#()\[\]*&^| ;{}`])/g, '\\$1');
                    return s.length === 0 ? `""` : s;
                };
                const hardQuote = (s) => {
                    return /[^\w@%\/+=,.:^-]/.test(s) ? `'${s.replace(/'/g, '\'\\\'\'')}'` : s;
                };
                if (cwd) {
                    command += `cd ${quote(cwd)} ; `;
                }
                if (env) {
                    command += '/usr/bin/env';
                    for (const key in env) {
                        const value = env[key];
                        if (value === null) {
                            command += ` -u ${hardQuote(key)}`;
                        }
                        else {
                            command += ` ${hardQuote(`${key}=${value}`)}`;
                        }
                    }
                    command += ' ';
                }
                for (const a of args) {
                    command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                    command += ' ';
                }
                break;
            }
        }
        return command;
    }
    exports.prepareCommand = prepareCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvbm9kZS90ZXJtaW5hbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQVMsZUFBZSxDQUFDLE9BQWUsRUFBRSxJQUFjO1FBQ3ZELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDdEMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RDLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDZCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRTtvQkFDeEMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUNELEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztZQUNILEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN4QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsU0FBNkI7UUFDcEUsSUFBSSxTQUFTLEVBQUU7WUFFZCxxRUFBcUU7WUFDckUsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO2dCQUN2QixNQUFNLGtCQUFrQixHQUFHLHNEQUFhLDhC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