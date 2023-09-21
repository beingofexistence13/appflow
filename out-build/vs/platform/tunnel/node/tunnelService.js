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
    exports.$i7b = exports.$h7b = exports.$g7b = exports.$f7b = void 0;
    async function createRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort) {
        let readyTunnel;
        for (let attempts = 3; attempts; attempts--) {
            readyTunnel?.dispose();
            const tunnel = new $f7b(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort);
            readyTunnel = await tunnel.waitForReady();
            if ((tunnelLocalPort && ports_1.$7f[tunnelLocalPort]) || !ports_1.$7f[readyTunnel.tunnelLocalPort]) {
                break;
            }
        }
        return readyTunnel;
    }
    class $f7b extends lifecycle_1.$kc {
        constructor(options, m, tunnelRemoteHost, tunnelRemotePort, n) {
            super();
            this.m = m;
            this.n = n;
            this.privacy = tunnel_1.TunnelPrivacyId.Private;
            this.j = new Map();
            this.a = options;
            this.b = net.createServer();
            this.c = new async_1.$Fg();
            this.f = () => this.c.open();
            this.b.on('listening', this.f);
            this.g = (socket) => this.r(socket);
            this.b.on('connection', this.g);
            // If there is no error listener and there is an error it will crash the whole window
            this.h = () => { };
            this.b.on('error', this.h);
            this.tunnelRemotePort = tunnelRemotePort;
            this.tunnelRemoteHost = tunnelRemoteHost;
        }
        async dispose() {
            super.dispose();
            this.b.removeListener('listening', this.f);
            this.b.removeListener('connection', this.g);
            this.b.removeListener('error', this.h);
            this.b.close();
            const disposers = Array.from(this.j.values());
            disposers.forEach(disposer => {
                disposer();
            });
        }
        async waitForReady() {
            const startPort = this.n ?? this.tunnelRemotePort;
            const hostname = (0, tunnel_1.$4z)(this.m) ? '0.0.0.0' : '127.0.0.1';
            // try to get the same port number as the remote port number...
            let localPort = await (0, ports_1.$8f)(startPort, 2, 1000, hostname);
            // if that fails, the method above returns 0, which works out fine below...
            let address = null;
            this.b.listen(localPort, this.m);
            await this.c.wait();
            address = this.b.address();
            // It is possible for findFreePortFaster to return a port that there is already a server listening on. This causes the previous listen call to error out.
            if (!address) {
                localPort = 0;
                this.b.listen(localPort, this.m);
                await this.c.wait();
                address = this.b.address();
            }
            this.tunnelLocalPort = address.port;
            this.localAddress = `${this.tunnelRemoteHost === '127.0.0.1' ? '127.0.0.1' : 'localhost'}:${address.port}`;
            return this;
        }
        async r(localSocket) {
            // pause reading on the socket until we have a chance to forward its data
            localSocket.pause();
            const tunnelRemoteHost = ((0, tunnel_1.$2z)(this.tunnelRemoteHost) || (0, tunnel_1.$4z)(this.tunnelRemoteHost)) ? 'localhost' : this.tunnelRemoteHost;
            const protocol = await (0, remoteAgentConnection_1.$Zk)(this.a, tunnelRemoteHost, this.tunnelRemotePort);
            const remoteSocket = protocol.getSocket();
            const dataChunk = protocol.readEntireBuffer();
            protocol.dispose();
            if (dataChunk.byteLength > 0) {
                localSocket.write(dataChunk.buffer);
            }
            localSocket.on('end', () => {
                if (localSocket.localAddress) {
                    this.j.delete(localSocket.localAddress);
                }
                remoteSocket.end();
            });
            localSocket.on('close', () => remoteSocket.end());
            localSocket.on('error', () => {
                if (localSocket.localAddress) {
                    this.j.delete(localSocket.localAddress);
                }
                if (remoteSocket instanceof ipc_net_1.$qh) {
                    remoteSocket.socket.destroy();
                }
                else {
                    remoteSocket.end();
                }
            });
            if (remoteSocket instanceof ipc_net_1.$qh) {
                this.t(localSocket, remoteSocket);
            }
            else {
                this.s(localSocket, remoteSocket);
            }
            if (localSocket.localAddress) {
                this.j.set(localSocket.localAddress, () => {
                    // Need to end instead of unpipe, otherwise whatever is connected locally could end up "stuck" with whatever state it had until manually exited.
                    localSocket.end();
                    remoteSocket.end();
                });
            }
        }
        s(localSocket, remoteSocket) {
            remoteSocket.onClose(() => localSocket.destroy());
            remoteSocket.onEnd(() => localSocket.end());
            remoteSocket.onData(d => localSocket.write(d.buffer));
            localSocket.on('data', d => remoteSocket.write(buffer_1.$Fd.wrap(d)));
            localSocket.resume();
        }
        t(localSocket, remoteNodeSocket) {
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
    exports.$f7b = $f7b;
    let $g7b = class $g7b extends tunnel_1.$7z {
        constructor(u, logService, v, w, configurationService) {
            super(logService, configurationService);
            this.u = u;
            this.v = v;
            this.w = w;
        }
        isPortPrivileged(port) {
            return (0, tunnel_1.$5z)(port, this.l, platform_1.OS, os.release());
        }
        s(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
            const existing = this.r(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            if ((0, tunnel_1.$Yz)(addressOrTunnelProvider)) {
                return this.t(addressOrTunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
            }
            else {
                this.j.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
                const options = {
                    commit: this.w.commit,
                    quality: this.w.quality,
                    addressProvider: addressOrTunnelProvider,
                    remoteSocketFactoryService: this.u,
                    signService: this.v,
                    logService: this.j,
                    ipcLogger: null
                };
                const tunnel = createRemoteTunnel(options, localHost, remoteHost, remotePort, localPort);
                this.j.trace('ForwardedPorts: (TunnelService) Tunnel created without provider.');
                this.p(remoteHost, remotePort, tunnel);
                return tunnel;
            }
        }
    };
    exports.$g7b = $g7b;
    exports.$g7b = $g7b = __decorate([
        __param(0, remoteSocketFactoryService_1.$Tk),
        __param(1, log_1.$5i),
        __param(2, sign_1.$Wk),
        __param(3, productService_1.$kj),
        __param(4, configuration_1.$8h)
    ], $g7b);
    let $h7b = class $h7b extends $g7b {
        constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
            super(remoteSocketFactoryService, logService, signService, productService, configurationService);
        }
    };
    exports.$h7b = $h7b;
    exports.$h7b = $h7b = __decorate([
        __param(0, remoteSocketFactoryService_1.$Tk),
        __param(1, log_1.$5i),
        __param(2, sign_1.$Wk),
        __param(3, productService_1.$kj),
        __param(4, configuration_1.$8h)
    ], $h7b);
    let $i7b = class $i7b extends lifecycle_1.$kc {
        constructor(b, c, f, g, h) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new Map();
        }
        async openTunnel(authority, addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
            this.c.trace(`ForwardedPorts: (SharedTunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
            if (!this.a.has(authority)) {
                const tunnelService = new $h7b(this.b, this.c, this.g, this.f, this.h);
                this.B(tunnelService);
                this.a.set(authority, tunnelService);
                tunnelService.onTunnelClosed(async () => {
                    if ((await tunnelService.tunnels).length === 0) {
                        tunnelService.dispose();
                        this.a.delete(authority);
                    }
                });
            }
            return this.a.get(authority).openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
        }
    };
    exports.$i7b = $i7b;
    exports.$i7b = $i7b = __decorate([
        __param(0, remoteSocketFactoryService_1.$Tk),
        __param(1, log_1.$5i),
        __param(2, productService_1.$kj),
        __param(3, sign_1.$Wk),
        __param(4, configuration_1.$8h)
    ], $i7b);
});
//# sourceMappingURL=tunnelService.js.map