/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/network"], function (require, exports, child_process_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listProcesses = void 0;
    function listProcesses(rootPid) {
        return new Promise((resolve, reject) => {
            let rootItem;
            const map = new Map();
            function addToTree(pid, ppid, cmd, load, mem) {
                const parent = map.get(ppid);
                if (pid === rootPid || parent) {
                    const item = {
                        name: findName(cmd),
                        cmd,
                        pid,
                        ppid,
                        load,
                        mem
                    };
                    map.set(pid, item);
                    if (pid === rootPid) {
                        rootItem = item;
                    }
                    if (parent) {
                        if (!parent.children) {
                            parent.children = [];
                        }
                        parent.children.push(item);
                        if (parent.children.length > 1) {
                            parent.children = parent.children.sort((a, b) => a.pid - b.pid);
                        }
                    }
                }
            }
            function findName(cmd) {
                const UTILITY_NETWORK_HINT = /--utility-sub-type=network/i;
                const NODEJS_PROCESS_HINT = /--ms-enable-electron-run-as-node/i;
                const WINDOWS_CRASH_REPORTER = /--crashes-directory/i;
                const WINPTY = /\\pipe\\winpty-control/i;
                const CONPTY = /conhost\.exe.+--headless/i;
                const TYPE = /--type=([a-zA-Z-]+)/;
                // find windows crash reporter
                if (WINDOWS_CRASH_REPORTER.exec(cmd)) {
                    return 'electron-crash-reporter';
                }
                // find winpty process
                if (WINPTY.exec(cmd)) {
                    return 'winpty-agent';
                }
                // find conpty process
                if (CONPTY.exec(cmd)) {
                    return 'conpty-agent';
                }
                // find "--type=xxxx"
                let matches = TYPE.exec(cmd);
                if (matches && matches.length === 2) {
                    if (matches[1] === 'renderer') {
                        return `window`;
                    }
                    else if (matches[1] === 'utility') {
                        if (UTILITY_NETWORK_HINT.exec(cmd)) {
                            return 'utility-network-service';
                        }
                        return 'utility-process';
                    }
                    else if (matches[1] === 'extensionHost') {
                        return 'extension-host'; // normalize remote extension host type
                    }
                    return matches[1];
                }
                // find all xxxx.js
                const JS = /[a-zA-Z-]+\.js/g;
                let result = '';
                do {
                    matches = JS.exec(cmd);
                    if (matches) {
                        result += matches + ' ';
                    }
                } while (matches);
                if (result) {
                    if (cmd.indexOf('node ') < 0 && cmd.indexOf('node.exe') < 0) {
                        return `electron-nodejs (${result})`;
                    }
                }
                // find Electron node.js processes
                if (NODEJS_PROCESS_HINT.exec(cmd)) {
                    return `electron-nodejs (${cmd})`;
                }
                return cmd;
            }
            if (process.platform === 'win32') {
                const cleanUNCPrefix = (value) => {
                    if (value.indexOf('\\\\?\\') === 0) {
                        return value.substring(4);
                    }
                    else if (value.indexOf('\\??\\') === 0) {
                        return value.substring(4);
                    }
                    else if (value.indexOf('"\\\\?\\') === 0) {
                        return '"' + value.substring(5);
                    }
                    else if (value.indexOf('"\\??\\') === 0) {
                        return '"' + value.substring(5);
                    }
                    else {
                        return value;
                    }
                };
                (new Promise((resolve_1, reject_1) => { require(['@vscode/windows-process-tree'], resolve_1, reject_1); })).then(windowsProcessTree => {
                    windowsProcessTree.getProcessList(rootPid, (processList) => {
                        if (!processList) {
                            reject(new Error(`Root process ${rootPid} not found`));
                            return;
                        }
                        windowsProcessTree.getProcessCpuUsage(processList, (completeProcessList) => {
                            const processItems = new Map();
                            completeProcessList.forEach(process => {
                                const commandLine = cleanUNCPrefix(process.commandLine || '');
                                processItems.set(process.pid, {
                                    name: findName(commandLine),
                                    cmd: commandLine,
                                    pid: process.pid,
                                    ppid: process.ppid,
                                    load: process.cpu || 0,
                                    mem: process.memory || 0
                                });
                            });
                            rootItem = processItems.get(rootPid);
                            if (rootItem) {
                                processItems.forEach(item => {
                                    const parent = processItems.get(item.ppid);
                                    if (parent) {
                                        if (!parent.children) {
                                            parent.children = [];
                                        }
                                        parent.children.push(item);
                                    }
                                });
                                processItems.forEach(item => {
                                    if (item.children) {
                                        item.children = item.children.sort((a, b) => a.pid - b.pid);
                                    }
                                });
                                resolve(rootItem);
                            }
                            else {
                                reject(new Error(`Root process ${rootPid} not found`));
                            }
                        });
                    }, windowsProcessTree.ProcessDataFlag.CommandLine | windowsProcessTree.ProcessDataFlag.Memory);
                });
            }
            else { // OS X & Linux
                function calculateLinuxCpuUsage() {
                    // Flatten rootItem to get a list of all VSCode processes
                    let processes = [rootItem];
                    const pids = [];
                    while (processes.length) {
                        const process = processes.shift();
                        if (process) {
                            pids.push(process.pid);
                            if (process.children) {
                                processes = processes.concat(process.children);
                            }
                        }
                    }
                    // The cpu usage value reported on Linux is the average over the process lifetime,
                    // recalculate the usage over a one second interval
                    // JSON.stringify is needed to escape spaces, https://github.com/nodejs/node/issues/6803
                    let cmd = JSON.stringify(network_1.FileAccess.asFileUri('vs/base/node/cpuUsage.sh').fsPath);
                    cmd += ' ' + pids.join(' ');
                    (0, child_process_1.exec)(cmd, {}, (err, stdout, stderr) => {
                        if (err || stderr) {
                            reject(err || new Error(stderr.toString()));
                        }
                        else {
                            const cpuUsage = stdout.toString().split('\n');
                            for (let i = 0; i < pids.length; i++) {
                                const processInfo = map.get(pids[i]);
                                processInfo.load = parseFloat(cpuUsage[i]);
                            }
                            if (!rootItem) {
                                reject(new Error(`Root process ${rootPid} not found`));
                                return;
                            }
                            resolve(rootItem);
                        }
                    });
                }
                (0, child_process_1.exec)('which ps', {}, (err, stdout, stderr) => {
                    if (err || stderr) {
                        if (process.platform !== 'linux') {
                            reject(err || new Error(stderr.toString()));
                        }
                        else {
                            const cmd = JSON.stringify(network_1.FileAccess.asFileUri('vs/base/node/ps.sh').fsPath);
                            (0, child_process_1.exec)(cmd, {}, (err, stdout, stderr) => {
                                if (err || stderr) {
                                    reject(err || new Error(stderr.toString()));
                                }
                                else {
                                    parsePsOutput(stdout, addToTree);
                                    calculateLinuxCpuUsage();
                                }
                            });
                        }
                    }
                    else {
                        const ps = stdout.toString().trim();
                        const args = '-ax -o pid=,ppid=,pcpu=,pmem=,command=';
                        // Set numeric locale to ensure '.' is used as the decimal separator
                        (0, child_process_1.exec)(`${ps} ${args}`, { maxBuffer: 1000 * 1024, env: { LC_NUMERIC: 'en_US.UTF-8' } }, (err, stdout, stderr) => {
                            // Silently ignoring the screen size is bogus error. See https://github.com/microsoft/vscode/issues/98590
                            if (err || (stderr && !stderr.includes('screen size is bogus'))) {
                                reject(err || new Error(stderr.toString()));
                            }
                            else {
                                parsePsOutput(stdout, addToTree);
                                if (process.platform === 'linux') {
                                    calculateLinuxCpuUsage();
                                }
                                else {
                                    if (!rootItem) {
                                        reject(new Error(`Root process ${rootPid} not found`));
                                    }
                                    else {
                                        resolve(rootItem);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    exports.listProcesses = listProcesses;
    function parsePsOutput(stdout, addToTree) {
        const PID_CMD = /^\s*([0-9]+)\s+([0-9]+)\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)\s+(.+)$/;
        const lines = stdout.toString().split('\n');
        for (const line of lines) {
            const matches = PID_CMD.exec(line.trim());
            if (matches && matches.length === 6) {
                addToTree(parseInt(matches[1]), parseInt(matches[2]), matches[5], parseFloat(matches[3]), parseFloat(matches[4]));
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQWdCLGFBQWEsQ0FBQyxPQUFlO1FBRTVDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFFdEMsSUFBSSxRQUFpQyxDQUFDO1lBQ3RDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBRzNDLFNBQVMsU0FBUyxDQUFDLEdBQVcsRUFBRSxJQUFZLEVBQUUsR0FBVyxFQUFFLElBQVksRUFBRSxHQUFXO2dCQUVuRixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QixJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksTUFBTSxFQUFFO29CQUU5QixNQUFNLElBQUksR0FBZ0I7d0JBQ3pCLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDO3dCQUNuQixHQUFHO3dCQUNILEdBQUc7d0JBQ0gsSUFBSTt3QkFDSixJQUFJO3dCQUNKLEdBQUc7cUJBQ0gsQ0FBQztvQkFDRixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFbkIsSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO3dCQUNwQixRQUFRLEdBQUcsSUFBSSxDQUFDO3FCQUNoQjtvQkFFRCxJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTs0QkFDckIsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7eUJBQ3JCO3dCQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUMzQixJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs0QkFDL0IsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUNoRTtxQkFDRDtpQkFDRDtZQUNGLENBQUM7WUFFRCxTQUFTLFFBQVEsQ0FBQyxHQUFXO2dCQUU1QixNQUFNLG9CQUFvQixHQUFHLDZCQUE2QixDQUFDO2dCQUMzRCxNQUFNLG1CQUFtQixHQUFHLG1DQUFtQyxDQUFDO2dCQUNoRSxNQUFNLHNCQUFzQixHQUFHLHNCQUFzQixDQUFDO2dCQUN0RCxNQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQztnQkFDekMsTUFBTSxNQUFNLEdBQUcsMkJBQTJCLENBQUM7Z0JBQzNDLE1BQU0sSUFBSSxHQUFHLHFCQUFxQixDQUFDO2dCQUVuQyw4QkFBOEI7Z0JBQzlCLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNyQyxPQUFPLHlCQUF5QixDQUFDO2lCQUNqQztnQkFFRCxzQkFBc0I7Z0JBQ3RCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDckIsT0FBTyxjQUFjLENBQUM7aUJBQ3RCO2dCQUVELHNCQUFzQjtnQkFDdEIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNyQixPQUFPLGNBQWMsQ0FBQztpQkFDdEI7Z0JBRUQscUJBQXFCO2dCQUNyQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDcEMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxFQUFFO3dCQUM5QixPQUFPLFFBQVEsQ0FBQztxQkFDaEI7eUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO3dCQUNwQyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTs0QkFDbkMsT0FBTyx5QkFBeUIsQ0FBQzt5QkFDakM7d0JBRUQsT0FBTyxpQkFBaUIsQ0FBQztxQkFDekI7eUJBQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssZUFBZSxFQUFFO3dCQUMxQyxPQUFPLGdCQUFnQixDQUFDLENBQUMsdUNBQXVDO3FCQUNoRTtvQkFDRCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEI7Z0JBRUQsbUJBQW1CO2dCQUNuQixNQUFNLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQztnQkFDN0IsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUNoQixHQUFHO29CQUNGLE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2QixJQUFJLE9BQU8sRUFBRTt3QkFDWixNQUFNLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQztxQkFDeEI7aUJBQ0QsUUFBUSxPQUFPLEVBQUU7Z0JBRWxCLElBQUksTUFBTSxFQUFFO29CQUNYLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQzVELE9BQU8sb0JBQW9CLE1BQU0sR0FBRyxDQUFDO3FCQUNyQztpQkFDRDtnQkFFRCxrQ0FBa0M7Z0JBQ2xDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNsQyxPQUFPLG9CQUFvQixHQUFHLEdBQUcsQ0FBQztpQkFDbEM7Z0JBRUQsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDO1lBRUQsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtnQkFFakMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFhLEVBQVUsRUFBRTtvQkFDaEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDbkMsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMxQjt5QkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUN6QyxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzFCO3lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQzNDLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2hDO3lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQzFDLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2hDO3lCQUFNO3dCQUNOLE9BQU8sS0FBSyxDQUFDO3FCQUNiO2dCQUNGLENBQUMsQ0FBQztnQkFFRixpREFBUSw4QkFBOEIsNEJBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRTtvQkFDbEUsa0JBQWtCLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFO3dCQUMxRCxJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNqQixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQzs0QkFDdkQsT0FBTzt5QkFDUDt3QkFDRCxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFOzRCQUMxRSxNQUFNLFlBQVksR0FBNkIsSUFBSSxHQUFHLEVBQUUsQ0FBQzs0QkFDekQsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dDQUNyQyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQztnQ0FDOUQsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO29DQUM3QixJQUFJLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQztvQ0FDM0IsR0FBRyxFQUFFLFdBQVc7b0NBQ2hCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztvQ0FDaEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO29DQUNsQixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO29DQUN0QixHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDO2lDQUN4QixDQUFDLENBQUM7NEJBQ0osQ0FBQyxDQUFDLENBQUM7NEJBRUgsUUFBUSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQ3JDLElBQUksUUFBUSxFQUFFO2dDQUNiLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0NBQzNCLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29DQUMzQyxJQUFJLE1BQU0sRUFBRTt3Q0FDWCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTs0Q0FDckIsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7eUNBQ3JCO3dDQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FDQUMzQjtnQ0FDRixDQUFDLENBQUMsQ0FBQztnQ0FFSCxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29DQUMzQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7d0NBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQ0FDNUQ7Z0NBQ0YsQ0FBQyxDQUFDLENBQUM7Z0NBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzZCQUNsQjtpQ0FBTTtnQ0FDTixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQzs2QkFDdkQ7d0JBQ0YsQ0FBQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxFQUFFLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRyxDQUFDLENBQUMsQ0FBQzthQUNIO2lCQUFNLEVBQUUsZUFBZTtnQkFDdkIsU0FBUyxzQkFBc0I7b0JBQzlCLHlEQUF5RDtvQkFDekQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxJQUFJLEdBQWEsRUFBRSxDQUFDO29CQUMxQixPQUFPLFNBQVMsQ0FBQyxNQUFNLEVBQUU7d0JBQ3hCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDbEMsSUFBSSxPQUFPLEVBQUU7NEJBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ3ZCLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtnQ0FDckIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzZCQUMvQzt5QkFDRDtxQkFDRDtvQkFFRCxrRkFBa0Y7b0JBQ2xGLG1EQUFtRDtvQkFDbkQsd0ZBQXdGO29CQUN4RixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2xGLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFNUIsSUFBQSxvQkFBSSxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUNyQyxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUU7NEJBQ2xCLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzt5QkFDNUM7NkJBQU07NEJBQ04sTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3JDLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7Z0NBQ3RDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUMzQzs0QkFFRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dDQUNkLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dDQUN2RCxPQUFPOzZCQUNQOzRCQUVELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDbEI7b0JBQ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFFRCxJQUFBLG9CQUFJLEVBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzVDLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTt3QkFDbEIsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTs0QkFDakMsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO3lCQUM1Qzs2QkFBTTs0QkFDTixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQzlFLElBQUEsb0JBQUksRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQ0FDckMsSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO29DQUNsQixNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUNBQzVDO3FDQUFNO29DQUNOLGFBQWEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7b0NBQ2pDLHNCQUFzQixFQUFFLENBQUM7aUNBQ3pCOzRCQUNGLENBQUMsQ0FBQyxDQUFDO3lCQUNIO3FCQUNEO3lCQUFNO3dCQUNOLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDcEMsTUFBTSxJQUFJLEdBQUcsd0NBQXdDLENBQUM7d0JBRXRELG9FQUFvRTt3QkFDcEUsSUFBQSxvQkFBSSxFQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUM3Ryx5R0FBeUc7NEJBQ3pHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUU7Z0NBQ2hFLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzs2QkFDNUM7aUNBQU07Z0NBQ04sYUFBYSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztnQ0FFakMsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtvQ0FDakMsc0JBQXNCLEVBQUUsQ0FBQztpQ0FDekI7cUNBQU07b0NBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRTt3Q0FDZCxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQztxQ0FDdkQ7eUNBQU07d0NBQ04sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FDQUNsQjtpQ0FDRDs2QkFDRDt3QkFDRixDQUFDLENBQUMsQ0FBQztxQkFDSDtnQkFDRixDQUFDLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBdlBELHNDQXVQQztJQUVELFNBQVMsYUFBYSxDQUFDLE1BQWMsRUFBRSxTQUFzRjtRQUM1SCxNQUFNLE9BQU8sR0FBRyx1RUFBdUUsQ0FBQztRQUN4RixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3pCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDMUMsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEg7U0FDRDtJQUNGLENBQUMifQ==