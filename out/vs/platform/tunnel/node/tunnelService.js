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
define(["require", "exports", "net", "os", "vs/base/node/ports", "vs/base/parts/ipc/node/ipc.net", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/sign/common/sign", "vs/platform/tunnel/common/tunnel", "vs/base/common/buffer"], function (require, exports, net, os, ports_1, ipc_net_1, async_1, lifecycle_1, platform_1, configuration_1, log_1, productService_1, remoteAgentConnection_1, remoteSocketFactoryService_1, sign_1, tunnel_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedTunnelsService = exports.TunnelService = exports.BaseTunnelService = exports.NodeRemoteTunnel = void 0;
    async function createRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort) {
        let readyTunnel;
        for (let attempts = 3; attempts; attempts--) {
            readyTunnel?.dispose();
            const tunnel = new NodeRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort);
            readyTunnel = await tunnel.waitForReady();
            if ((tunnelLocalPort && ports_1.BROWSER_RESTRICTED_PORTS[tunnelLocalPort]) || !ports_1.BROWSER_RESTRICTED_PORTS[readyTunnel.tunnelLocalPort]) {
                break;
            }
        }
        return readyTunnel;
    }
    class NodeRemoteTunnel extends lifecycle_1.Disposable {
        constructor(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, suggestedLocalPort) {
            super();
            this.defaultTunnelHost = defaultTunnelHost;
            this.suggestedLocalPort = suggestedLocalPort;
            this.privacy = tunnel_1.TunnelPrivacyId.Private;
            this._socketsDispose = new Map();
            this._options = options;
            this._server = net.createServer();
            this._barrier = new async_1.Barrier();
            this._listeningListener = () => this._barrier.open();
            this._server.on('listening', this._listeningListener);
            this._connectionListener = (socket) => this._onConnection(socket);
            this._server.on('connection', this._connectionListener);
            // If there is no error listener and there is an error it will crash the whole window
            this._errorListener = () => { };
            this._server.on('error', this._errorListener);
            this.tunnelRemotePort = tunnelRemotePort;
            this.tunnelRemoteHost = tunnelRemoteHost;
        }
        async dispose() {
            super.dispose();
            this._server.removeListener('listening', this._listeningListener);
            this._server.removeListener('connection', this._connectionListener);
            this._server.removeListener('error', this._errorListener);
            this._server.close();
            const disposers = Array.from(this._socketsDispose.values());
            disposers.forEach(disposer => {
                disposer();
            });
        }
        async waitForReady() {
            const startPort = this.suggestedLocalPort ?? this.tunnelRemotePort;
            const hostname = (0, tunnel_1.isAllInterfaces)(this.defaultTunnelHost) ? '0.0.0.0' : '127.0.0.1';
            // try to get the same port number as the remote port number...
            let localPort = await (0, ports_1.findFreePortFaster)(startPort, 2, 1000, hostname);
            // if that fails, the method above returns 0, which works out fine below...
            let address = null;
            this._server.listen(localPort, this.defaultTunnelHost);
            await this._barrier.wait();
            address = this._server.address();
            // It is possible for findFreePortFaster to return a port that there is already a server listening on. This causes the previous listen call to error out.
            if (!address) {
                localPort = 0;
                this._server.listen(localPort, this.defaultTunnelHost);
                await this._barrier.wait();
                address = this._server.address();
            }
            this.tunnelLocalPort = address.port;
            this.localAddress = `${this.tunnelRemoteHost === '127.0.0.1' ? '127.0.0.1' : 'localhost'}:${address.port}`;
            return this;
        }
        async _onConnection(localSocket) {
            // pause reading on the socket until we have a chance to forward its data
            localSocket.pause();
            const tunnelRemoteHost = ((0, tunnel_1.isLocalhost)(this.tunnelRemoteHost) || (0, tunnel_1.isAllInterfaces)(this.tunnelRemoteHost)) ? 'localhost' : this.tunnelRemoteHost;
            const protocol = await (0, remoteAgentConnection_1.connectRemoteAgentTunnel)(this._options, tunnelRemoteHost, this.tunnelRemotePort);
            const remoteSocket = protocol.getSocket();
            const dataChunk = protocol.readEntireBuffer();
            protocol.dispose();
            if (dataChunk.byteLength > 0) {
                localSocket.write(dataChunk.buffer);
            }
            localSocket.on('end', () => {
                if (localSocket.localAddress) {
                    this._socketsDispose.delete(localSocket.localAddress);
                }
                remoteSocket.end();
            });
            localSocket.on('close', () => remoteSocket.end());
            localSocket.on('error', () => {
                if (localSocket.localAddress) {
                    this._socketsDispose.delete(localSocket.localAddress);
                }
                if (remoteSocket instanceof ipc_net_1.NodeSocket) {
                    remoteSocket.socket.destroy();
                }
                else {
                    remoteSocket.end();
                }
            });
            if (remoteSocket instanceof ipc_net_1.NodeSocket) {
                this._mirrorNodeSocket(localSocket, remoteSocket);
            }
            else {
                this._mirrorGenericSocket(localSocket, remoteSocket);
            }
            if (localSocket.localAddress) {
                this._socketsDispose.set(localSocket.localAddress, () => {
                    // Need to end instead of unpipe, otherwise whatever is connected locally could end up "stuck" with whatever state it had until manually exited.
                    localSocket.end();
                    remoteSocket.end();
                });
            }
        }
        _mirrorGenericSocket(localSocket, remoteSocket) {
            remoteSocket.onClose(() => localSocket.destroy());
            remoteSocket.onEnd(() => localSocket.end());
            remoteSocket.onData(d => localSocket.write(d.buffer));
            localSocket.on('data', d => remoteSocket.write(buffer_1.VSBuffer.wrap(d)));
            localSocket.resume();
        }
        _mirrorNodeSocket(localSocket, remoteNodeSocket) {
            const remoteSocket = remoteNodeSocket.socket;
            remoteSocket.on('end', () => localSocket.end());
            remoteSocket.on('close', () => localSocket.end());
            remoteSocket.on('error', () => {
                localSocket.destroy();
            });
            remoteSocket.pipe(localSocket);
            localSocket.pipe(remoteSocket);
        }
    }
    exports.NodeRemoteTunnel = NodeRemoteTunnel;
    let BaseTunnelService = class BaseTunnelService extends tunnel_1.AbstractTunnelService {
        constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
            super(logService, configurationService);
            this.remoteSocketFactoryService = remoteSocketFactoryService;
            this.signService = signService;
            this.productService = productService;
        }
        isPortPrivileged(port) {
            return (0, tunnel_1.isPortPrivileged)(port, this.defaultTunnelHost, platform_1.OS, os.release());
        }
        retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
            const existing = this.getTunnelFromMap(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            if ((0, tunnel_1.isTunnelProvider)(addressOrTunnelProvider)) {
                return this.createWithProvider(addressOrTunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
            }
            else {
                this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
                const options = {
                    commit: this.productService.commit,
                    quality: this.productService.quality,
                    addressProvider: addressOrTunnelProvider,
                    remoteSocketFactoryService: this.remoteSocketFactoryService,
                    signService: this.signService,
                    logService: this.logService,
                    ipcLogger: null
                };
                const tunnel = createRemoteTunnel(options, localHost, remoteHost, remotePort, localPort);
                this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created without provider.');
                this.addTunnelToMap(remoteHost, remotePort, tunnel);
                return tunnel;
            }
        }
    };
    exports.BaseTunnelService = BaseTunnelService;
    exports.BaseTunnelService = BaseTunnelService = __decorate([
        __param(0, remoteSocketFactoryService_1.IRemoteSocketFactoryService),
        __param(1, log_1.ILogService),
        __param(2, sign_1.ISignService),
        __param(3, productService_1.IProductService),
        __param(4, configuration_1.IConfigurationService)
    ], BaseTunnelService);
    let TunnelService = class TunnelService extends BaseTunnelService {
        constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
            super(remoteSocketFactoryService, logService, signService, productService, configurationService);
        }
    };
    exports.TunnelService = TunnelService;
    exports.TunnelService = TunnelService = __decorate([
        __param(0, remoteSocketFactoryService_1.IRemoteSocketFactoryService),
        __param(1, log_1.ILogService),
        __param(2, sign_1.ISignService),
        __param(3, productService_1.IProductService),
        __param(4, configuration_1.IConfigurationService)
    ], TunnelService);
    let SharedTunnelsService = class SharedTunnelsService extends lifecycle_1.Disposable {
        constructor(remoteSocketFactoryService, logService, productService, signService, configurationService) {
            super();
            this.remoteSocketFactoryService = remoteSocketFactoryService;
            this.logService = logService;
            this.productService = productService;
            this.signService = signService;
            this.configurationService = configurationService;
            this._tunnelServices = new Map();
        }
        async openTunnel(authority, addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
            this.logService.trace(`ForwardedPorts: (SharedTunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
            if (!this._tunnelServices.has(authority)) {
                const tunnelService = new TunnelService(this.remoteSocketFactoryService, this.logService, this.signService, this.productService, this.configurationService);
                this._register(tunnelService);
                this._tunnelServices.set(authority, tunnelService);
                tunnelService.onTunnelClosed(async () => {
                    if ((await tunnelService.tunnels).length === 0) {
                        tunnelService.dispose();
                        this._tunnelServices.delete(authority);
                    }
                });
            }
            return this._tunnelServices.get(authority).openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
        }
    };
    exports.SharedTunnelsService = SharedTunnelsService;
    exports.SharedTunnelsService = SharedTunnelsService = __decorate([
        __param(0, remoteSocketFactoryService_1.IRemoteSocketFactoryService),
        __param(1, log_1.ILogService),
        __param(2, productService_1.IProductService),
        __param(3, sign_1.ISignService),
        __param(4, configuration_1.IConfigurationService)
    ], SharedTunnelsService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3R1bm5lbC9ub2RlL3R1bm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxLQUFLLFVBQVUsa0JBQWtCLENBQUMsT0FBMkIsRUFBRSxpQkFBeUIsRUFBRSxnQkFBd0IsRUFBRSxnQkFBd0IsRUFBRSxlQUF3QjtRQUNySyxJQUFJLFdBQXlDLENBQUM7UUFDOUMsS0FBSyxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzVDLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN2QixNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNySCxXQUFXLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxnQ0FBd0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0NBQXdCLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUM3SCxNQUFNO2FBQ047U0FDRDtRQUNELE9BQU8sV0FBWSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO1FBa0IvQyxZQUFZLE9BQTJCLEVBQW1CLGlCQUF5QixFQUFFLGdCQUF3QixFQUFFLGdCQUF3QixFQUFtQixrQkFBMkI7WUFDcEwsS0FBSyxFQUFFLENBQUM7WUFEaUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFRO1lBQXVFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztZQVpySyxZQUFPLEdBQUcsd0JBQWUsQ0FBQyxPQUFPLENBQUM7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