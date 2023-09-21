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
    exports.NodeExtHostTunnelService = exports.tryFindRootPorts = exports.findPorts = exports.getRootProcesses = exports.loadConnectionTable = exports.parseIpAddress = exports.loadListeningPorts = exports.getSockets = void 0;
    function getSockets(stdout) {
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
    exports.getSockets = getSockets;
    function loadListeningPorts(...stdouts) {
        const table = [].concat(...stdouts.map(loadConnectionTable));
        return [
            ...new Map(table.filter(row => row.st === '0A')
                .map(row => {
                const address = row.local_address.split(':');
                return {
                    socket: parseInt(row.inode, 10),
                    ip: parseIpAddress(address[0]),
                    port: parseInt(address[1], 16)
                };
            }).map(port => [port.ip + ':' + port.port, port])).values()
        ];
    }
    exports.loadListeningPorts = loadListeningPorts;
    function parseIpAddress(hex) {
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
    exports.parseIpAddress = parseIpAddress;
    function loadConnectionTable(stdout) {
        const lines = stdout.trim().split('\n');
        const names = lines.shift().trim().split(/\s+/)
            .filter(name => name !== 'rx_queue' && name !== 'tm->when');
        const table = lines.map(line => line.trim().split(/\s+/).reduce((obj, value, i) => {
            obj[names[i] || i] = value;
            return obj;
        }, {}));
        return table;
    }
    exports.loadConnectionTable = loadConnectionTable;
    function knownExcludeCmdline(command) {
        return !!command.match(/.*\.vscode-server-[a-zA-Z]+\/bin.*/)
            || (command.indexOf('out/server-main.js') !== -1)
            || (command.indexOf('_productName=VSCode') !== -1);
    }
    function getRootProcesses(stdout) {
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
    exports.getRootProcesses = getRootProcesses;
    async function findPorts(connections, socketMap, processes) {
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
    exports.findPorts = findPorts;
    function tryFindRootPorts(connections, rootProcessesStdout, previousPorts) {
        const ports = new Map();
        const rootProcesses = getRootProcesses(rootProcessesStdout);
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
    exports.tryFindRootPorts = tryFindRootPorts;
    let NodeExtHostTunnelService = class NodeExtHostTunnelService extends extHostTunnelService_1.ExtHostTunnelService {
        constructor(extHostRpc, initData, logService, signService) {
            super(extHostRpc, initData, logService);
            this.initData = initData;
            this.signService = signService;
            this._initialCandidates = undefined;
            this._foundRootPorts = new Map();
            this._candidateFindingEnabled = false;
            if (platform_1.isLinux && initData.remote.isRemote && initData.remote.authority) {
                this._proxy.$setRemoteTunnelService(process.pid);
                this.setInitialCandidates();
            }
        }
        async $registerCandidateFinder(enable) {
            if (enable && this._candidateFindingEnabled) {
                // already enabled
                return;
            }
            this._candidateFindingEnabled = enable;
            let oldPorts = undefined;
            // If we already have found initial candidates send those immediately.
            if (this._initialCandidates) {
                oldPorts = this._initialCandidates;
                await this._proxy.$onFoundNewCandidates(this._initialCandidates);
            }
            // Regularly scan to see if the candidate ports have changed.
            const movingAverage = new numbers_1.MovingAverage();
            let scanCount = 0;
            while (this._candidateFindingEnabled) {
                const startTime = new Date().getTime();
                const newPorts = (await this.findCandidatePorts()).filter(candidate => ((0, tunnel_1.isLocalhost)(candidate.host) || (0, tunnel_1.isAllInterfaces)(candidate.host)));
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) found candidate ports ${newPorts.map(port => port.port).join(', ')}`);
                const timeTaken = new Date().getTime() - startTime;
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) candidate port scan took ${timeTaken} ms.`);
                // Do not count the first few scans towards the moving average as they are likely to be slower.
                if (scanCount++ > 3) {
                    movingAverage.update(timeTaken);
                }
                if (!oldPorts || (JSON.stringify(oldPorts) !== JSON.stringify(newPorts))) {
                    oldPorts = newPorts;
                    await this._proxy.$onFoundNewCandidates(oldPorts);
                }
                const delay = this.calculateDelay(movingAverage.value);
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) next candidate port scan in ${delay} ms.`);
                await (new Promise(resolve => setTimeout(() => resolve(), delay)));
            }
        }
        calculateDelay(movingAverage) {
            // Some local testing indicated that the moving average might be between 50-100 ms.
            return Math.max(movingAverage * 20, 2000);
        }
        async setInitialCandidates() {
            this._initialCandidates = await this.findCandidatePorts();
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) Initial candidates found: ${this._initialCandidates.map(c => c.port).join(', ')}`);
        }
        async findCandidatePorts() {
            let tcp = '';
            let tcp6 = '';
            try {
                tcp = await pfs.Promises.readFile('/proc/net/tcp', 'utf8');
                tcp6 = await pfs.Promises.readFile('/proc/net/tcp6', 'utf8');
            }
            catch (e) {
                // File reading error. No additional handling needed.
            }
            const connections = loadListeningPorts(tcp, tcp6);
            const procSockets = await (new Promise(resolve => {
                (0, child_process_1.exec)('ls -l /proc/[0-9]*/fd/[0-9]* | grep socket:', (error, stdout, stderr) => {
                    resolve(stdout);
                });
            }));
            const socketMap = getSockets(procSockets);
            const procChildren = await pfs.Promises.readdir('/proc');
            const processes = [];
            for (const childName of procChildren) {
                try {
                    const pid = Number(childName);
                    const childUri = resources.joinPath(uri_1.URI.file('/proc'), childName);
                    const childStat = await pfs.Promises.stat(childUri.fsPath);
                    if (childStat.isDirectory() && !isNaN(pid)) {
                        const cwd = await pfs.Promises.readlink(resources.joinPath(childUri, 'cwd').fsPath);
                        const cmd = await pfs.Promises.readFile(resources.joinPath(childUri, 'cmdline').fsPath, 'utf8');
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
            const foundPorts = findPorts(filteredConnections, socketMap, processes);
            let heuristicPorts;
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) number of possible root ports ${unFoundConnections.length}`);
            if (unFoundConnections.length > 0) {
                const rootProcesses = await (new Promise(resolve => {
                    (0, child_process_1.exec)('ps -F -A -l | grep root', (error, stdout, stderr) => {
                        resolve(stdout);
                    });
                }));
                this._foundRootPorts = tryFindRootPorts(unFoundConnections, rootProcesses, this._foundRootPorts);
                heuristicPorts = Array.from(this._foundRootPorts.values());
                this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) heuristic ports ${heuristicPorts.map(heuristicPort => heuristicPort.port).join(', ')}`);
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
        makeManagedTunnelFactory(authority) {
            return async (tunnelOptions) => {
                const t = new tunnelService_1.NodeRemoteTunnel({
                    commit: this.initData.commit,
                    quality: this.initData.quality,
                    logService: this.logService,
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
                                connectTo: new remoteAuthorityResolver_1.ManagedRemoteConnection(0),
                                connectionToken: authority.connectionToken,
                            });
                        },
                    },
                    signService: this.signService,
                }, 'localhost', tunnelOptions.remoteAddress.host || 'localhost', tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort);
                await t.waitForReady();
                const disposeEmitter = new event_1.Emitter();
                return {
                    localAddress: (0, tunnelModel_1.parseAddress)(t.localAddress) ?? t.localAddress,
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
    exports.NodeExtHostTunnelService = NodeExtHostTunnelService;
    exports.NodeExtHostTunnelService = NodeExtHostTunnelService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, log_1.ILogService),
        __param(3, sign_1.ISignService)
    ], NodeExtHostTunnelService);
    class ExtHostManagedSocket extends managedSocket_1.ManagedSocket {
        static connect(passing, path, query, debugLabel) {
            const d = new lifecycle_1.DisposableStore();
            const half = {
                onClose: d.add(new event_1.Emitter()),
                onData: d.add(new event_1.Emitter()),
                onEnd: d.add(new event_1.Emitter()),
            };
            d.add(passing.onDidReceiveMessage(d => half.onData.fire(buffer_1.VSBuffer.wrap(d))));
            d.add(passing.onDidEnd(() => half.onEnd.fire()));
            d.add(passing.onDidClose(error => half.onClose.fire({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                error,
                hadError: !!error
            })));
            const socket = new ExtHostManagedSocket(passing, debugLabel, half);
            socket._register(d);
            return (0, managedSocket_1.connectManagedSocket)(socket, path, query, debugLabel, half);
        }
        constructor(passing, debugLabel, half) {
            super(debugLabel, half);
            this.passing = passing;
        }
        write(buffer) {
            this.passing.send(buffer.buffer);
        }
        closeRemote() {
            this.passing.end();
        }
        async drain() {
            await this.passing.drain?.();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR1bm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvZXh0SG9zdFR1bm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRyxTQUFnQixVQUFVLENBQUMsTUFBYztRQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sTUFBTSxHQUFzQyxFQUFFLENBQUM7UUFDckQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQixNQUFNLEtBQUssR0FBRyw0Q0FBNEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUM7WUFDdkUsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1gsR0FBRyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMzQixNQUFNLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7aUJBQzlCLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzdDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxFQUFFLEVBQXNDLENBQUMsQ0FBQztRQUMzQyxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBakJELGdDQWlCQztJQUVELFNB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