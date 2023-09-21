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
define(["require", "exports", "child_process", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/log/common/log", "vs/platform/remote/common/managedSocket", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/sign/common/sign", "vs/platform/tunnel/common/tunnel", "vs/platform/tunnel/node/tunnelService", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, child_process_1, buffer_1, event_1, lifecycle_1, numbers_1, platform_1, resources, uri_1, pfs, log_1, managedSocket_1, remoteAuthorityResolver_1, sign_1, tunnel_1, tunnelService_1, extHostInitDataService_1, extHostRpcService_1, extHostTunnelService_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xdc = exports.$Wdc = exports.$Vdc = exports.$Udc = exports.$Tdc = exports.$Sdc = exports.$Rdc = exports.$Qdc = void 0;
    function $Qdc(stdout) {
        const lines = stdout.trim().split('\n');
        const mapped = [];
        lines.forEach(line => {
            const match = /\/proc\/(\d+)\/fd\/\d+ -> socket:\[(\d+)\]/.exec(line);
            if (match && match.length >= 3) {
                mapped.push({
                    pid: parseInt(match[1], 10),
                    socket: parseInt(match[2], 10)
                });
            }
        });
        const socketMap = mapped.reduce((m, socket) => {
            m[socket.socket] = socket;
            return m;
        }, {});
        return socketMap;
    }
    exports.$Qdc = $Qdc;
    function $Rdc(...stdouts) {
        const table = [].concat(...stdouts.map($Tdc));
        return [
            ...new Map(table.filter(row => row.st === '0A')
                .map(row => {
                const address = row.local_address.split(':');
                return {
                    socket: parseInt(row.inode, 10),
                    ip: $Sdc(address[0]),
                    port: parseInt(address[1], 16)
                };
            }).map(port => [port.ip + ':' + port.port, port])).values()
        ];
    }
    exports.$Rdc = $Rdc;
    function $Sdc(hex) {
        let result = '';
        if (hex.length === 8) {
            for (let i = hex.length - 2; i >= 0; i -= 2) {
                result += parseInt(hex.substr(i, 2), 16);
                if (i !== 0) {
                    result += '.';
                }
            }
        }
        else {
            // Nice explanation of host format in tcp6 file: https://serverfault.com/questions/592574/why-does-proc-net-tcp6-represents-1-as-1000
            for (let i = 0; i < hex.length; i += 8) {
                const word = hex.substring(i, i + 8);
                let subWord = '';
                for (let j = 8; j >= 2; j -= 2) {
                    subWord += word.substring(j - 2, j);
                    if ((j === 6) || (j === 2)) {
                        // Trim leading zeros
                        subWord = parseInt(subWord, 16).toString(16);
                        result += `${subWord}`;
                        subWord = '';
                        if (i + j !== hex.length - 6) {
                            result += ':';
                        }
                    }
                }
            }
        }
        return result;
    }
    exports.$Sdc = $Sdc;
    function $Tdc(stdout) {
        const lines = stdout.trim().split('\n');
        const names = lines.shift().trim().split(/\s+/)
            .filter(name => name !== 'rx_queue' && name !== 'tm->when');
        const table = lines.map(line => line.trim().split(/\s+/).reduce((obj, value, i) => {
            obj[names[i] || i] = value;
            return obj;
        }, {}));
        return table;
    }
    exports.$Tdc = $Tdc;
    function knownExcludeCmdline(command) {
        return !!command.match(/.*\.vscode-server-[a-zA-Z]+\/bin.*/)
            || (command.indexOf('out/server-main.js') !== -1)
            || (command.indexOf('_productName=VSCode') !== -1);
    }
    function $Udc(stdout) {
        const lines = stdout.trim().split('\n');
        const mapped = [];
        lines.forEach(line => {
            const match = /^\d+\s+\D+\s+root\s+(\d+)\s+(\d+).+\d+\:\d+\:\d+\s+(.+)$/.exec(line);
            if (match && match.length >= 4) {
                mapped.push({
                    pid: parseInt(match[1], 10),
                    ppid: parseInt(match[2]),
                    cmd: match[3]
                });
            }
        });
        return mapped;
    }
    exports.$Udc = $Udc;
    async function $Vdc(connections, socketMap, processes) {
        const processMap = processes.reduce((m, process) => {
            m[process.pid] = process;
            return m;
        }, {});
        const ports = [];
        connections.forEach(({ socket, ip, port }) => {
            const pid = socketMap[socket] ? socketMap[socket].pid : undefined;
            const command = pid ? processMap[pid]?.cmd : undefined;
            if (pid && command && !knownExcludeCmdline(command)) {
                ports.push({ host: ip, port, detail: command, pid });
            }
        });
        return ports;
    }
    exports.$Vdc = $Vdc;
    function $Wdc(connections, rootProcessesStdout, previousPorts) {
        const ports = new Map();
        const rootProcesses = $Udc(rootProcessesStdout);
        for (const connection of connections) {
            const previousPort = previousPorts.get(connection.port);
            if (previousPort) {
                ports.set(connection.port, previousPort);
                continue;
            }
            const rootProcessMatch = rootProcesses.find((value) => value.cmd.includes(`${connection.port}`));
            if (rootProcessMatch) {
                let bestMatch = rootProcessMatch;
                // There are often several processes that "look" like they could match the port.
                // The one we want is usually the child of the other. Find the most child process.
                let mostChild;
                do {
                    mostChild = rootProcesses.find(value => value.ppid === bestMatch.pid);
                    if (mostChild) {
                        bestMatch = mostChild;
                    }
                } while (mostChild);
                ports.set(connection.port, { host: connection.ip, port: connection.port, pid: bestMatch.pid, detail: bestMatch.cmd, ppid: bestMatch.ppid });
            }
            else {
                ports.set(connection.port, { host: connection.ip, port: connection.port, ppid: Number.MAX_VALUE });
            }
        }
        return ports;
    }
    exports.$Wdc = $Wdc;
    let $Xdc = class $Xdc extends extHostTunnelService_1.$ssb {
        constructor(extHostRpc, D, logService, F) {
            super(extHostRpc, D, logService);
            this.D = D;
            this.F = F;
            this.y = undefined;
            this.z = new Map();
            this.C = false;
            if (platform_1.$k && D.remote.isRemote && D.remote.authority) {
                this.a.$setRemoteTunnelService(process.pid);
                this.H();
            }
        }
        async $registerCandidateFinder(enable) {
            if (enable && this.C) {
                // already enabled
                return;
            }
            this.C = enable;
            let oldPorts = undefined;
            // If we already have found initial candidates send those immediately.
            if (this.y) {
                oldPorts = this.y;
                await this.a.$onFoundNewCandidates(this.y);
            }
            // Regularly scan to see if the candidate ports have changed.
            const movingAverage = new numbers_1.$Kl();
            let scanCount = 0;
            while (this.C) {
                const startTime = new Date().getTime();
                const newPorts = (await this.I()).filter(candidate => ((0, tunnel_1.$2z)(candidate.host) || (0, tunnel_1.$4z)(candidate.host)));
                this.s.trace(`ForwardedPorts: (ExtHostTunnelService) found candidate ports ${newPorts.map(port => port.port).join(', ')}`);
                const timeTaken = new Date().getTime() - startTime;
                this.s.trace(`ForwardedPorts: (ExtHostTunnelService) candidate port scan took ${timeTaken} ms.`);
                // Do not count the first few scans towards the moving average as they are likely to be slower.
                if (scanCount++ > 3) {
                    movingAverage.update(timeTaken);
                }
                if (!oldPorts || (JSON.stringify(oldPorts) !== JSON.stringify(newPorts))) {
                    oldPorts = newPorts;
                    await this.a.$onFoundNewCandidates(oldPorts);
                }
                const delay = this.G(movingAverage.value);
                this.s.trace(`ForwardedPorts: (ExtHostTunnelService) next candidate port scan in ${delay} ms.`);
                await (new Promise(resolve => setTimeout(() => resolve(), delay)));
            }
        }
        G(movingAverage) {
            // Some local testing indicated that the moving average might be between 50-100 ms.
            return Math.max(movingAverage * 20, 2000);
        }
        async H() {
            this.y = await this.I();
            this.s.trace(`ForwardedPorts: (ExtHostTunnelService) Initial candidates found: ${this.y.map(c => c.port).join(', ')}`);
        }
        async I() {
            let tcp = '';
            let tcp6 = '';
            try {
                tcp = await pfs.Promises.readFile('/proc/net/tcp', 'utf8');
                tcp6 = await pfs.Promises.readFile('/proc/net/tcp6', 'utf8');
            }
            catch (e) {
                // File reading error. No additional handling needed.
            }
            const connections = $Rdc(tcp, tcp6);
            const procSockets = await (new Promise(resolve => {
                (0, child_process_1.exec)('ls -l /proc/[0-9]*/fd/[0-9]* | grep socket:', (error, stdout, stderr) => {
                    resolve(stdout);
                });
            }));
            const socketMap = $Qdc(procSockets);
            const procChildren = await pfs.Promises.readdir('/proc');
            const processes = [];
            for (const childName of procChildren) {
                try {
                    const pid = Number(childName);
                    const childUri = resources.$ig(uri_1.URI.file('/proc'), childName);
                    const childStat = await pfs.Promises.stat(childUri.fsPath);
                    if (childStat.isDirectory() && !isNaN(pid)) {
                        const cwd = await pfs.Promises.readlink(resources.$ig(childUri, 'cwd').fsPath);
                        const cmd = await pfs.Promises.readFile(resources.$ig(childUri, 'cmdline').fsPath, 'utf8');
                        processes.push({ pid, cwd, cmd });
                    }
                }
                catch (e) {
                    //
                }
            }
            const unFoundConnections = [];
            const filteredConnections = connections.filter((connection => {
                const foundConnection = socketMap[connection.socket];
                if (!foundConnection) {
                    unFoundConnections.push(connection);
                }
                return foundConnection;
            }));
            const foundPorts = $Vdc(filteredConnections, socketMap, processes);
            let heuristicPorts;
            this.s.trace(`ForwardedPorts: (ExtHostTunnelService) number of possible root ports ${unFoundConnections.length}`);
            if (unFoundConnections.length > 0) {
                const rootProcesses = await (new Promise(resolve => {
                    (0, child_process_1.exec)('ps -F -A -l | grep root', (error, stdout, stderr) => {
                        resolve(stdout);
                    });
                }));
                this.z = $Wdc(unFoundConnections, rootProcesses, this.z);
                heuristicPorts = Array.from(this.z.values());
                this.s.trace(`ForwardedPorts: (ExtHostTunnelService) heuristic ports ${heuristicPorts.map(heuristicPort => heuristicPort.port).join(', ')}`);
            }
            return foundPorts.then(foundCandidates => {
                if (heuristicPorts) {
                    return foundCandidates.concat(heuristicPorts);
                }
                else {
                    return foundCandidates;
                }
            });
        }
        w(authority) {
            return async (tunnelOptions) => {
                const t = new tunnelService_1.$f7b({
                    commit: this.D.commit,
                    quality: this.D.quality,
                    logService: this.s,
                    ipcLogger: null,
                    // services and address providers have stubs since we don't need
                    // the connection identification that the renderer process uses
                    remoteSocketFactoryService: {
                        _serviceBrand: undefined,
                        async connect(_connectTo, path, query, debugLabel) {
                            const result = await authority.makeConnection();
                            return ExtHostManagedSocket.connect(result, path, query, debugLabel);
                        },
                        register() {
                            throw new Error('not implemented');
                        },
                    },
                    addressProvider: {
                        getAddress() {
                            return Promise.resolve({
                                connectTo: new remoteAuthorityResolver_1.$Kk(0),
                                connectionToken: authority.connectionToken,
                            });
                        },
                    },
                    signService: this.F,
                }, 'localhost', tunnelOptions.remoteAddress.host || 'localhost', tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort);
                await t.waitForReady();
                const disposeEmitter = new event_1.$fd();
                return {
                    localAddress: (0, tunnelModel_1.$kJ)(t.localAddress) ?? t.localAddress,
                    remoteAddress: { port: t.tunnelRemotePort, host: t.tunnelRemoteHost },
                    onDidDispose: disposeEmitter.event,
                    dispose: () => {
                        t.dispose();
                        disposeEmitter.fire();
                        disposeEmitter.dispose();
                    },
                };
            };
        }
    };
    exports.$Xdc = $Xdc;
    exports.$Xdc = $Xdc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, log_1.$5i),
        __param(3, sign_1.$Wk)
    ], $Xdc);
    class ExtHostManagedSocket extends managedSocket_1.$Ckb {
        static connect(passing, path, query, debugLabel) {
            const d = new lifecycle_1.$jc();
            const half = {
                onClose: d.add(new event_1.$fd()),
                onData: d.add(new event_1.$fd()),
                onEnd: d.add(new event_1.$fd()),
            };
            d.add(passing.onDidReceiveMessage(d => half.onData.fire(buffer_1.$Fd.wrap(d))));
            d.add(passing.onDidEnd(() => half.onEnd.fire()));
            d.add(passing.onDidClose(error => half.onClose.fire({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                error,
                hadError: !!error
            })));
            const socket = new ExtHostManagedSocket(passing, debugLabel, half);
            socket.B(d);
            return (0, managedSocket_1.$Bkb)(socket, path, query, debugLabel, half);
        }
        constructor(n, debugLabel, half) {
            super(debugLabel, half);
            this.n = n;
        }
        write(buffer) {
            this.n.send(buffer.buffer);
        }
        h() {
            this.n.end();
        }
        async drain() {
            await this.n.drain?.();
        }
    }
});
//# sourceMappingURL=extHostTunnelService.js.map