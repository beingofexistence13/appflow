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
define(["require", "exports", "vs/platform/log/common/log", "vs/workbench/services/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/platform/tunnel/common/tunnel", "vs/base/common/lifecycle", "vs/platform/remote/common/sharedProcessTunnelService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/common/platform", "vs/platform/configuration/common/configuration"], function (require, exports, log_1, environmentService_1, extensions_1, tunnel_1, lifecycle_1, sharedProcessTunnelService_1, lifecycle_2, remoteAuthorityResolver_1, instantiation_1, environmentService_2, platform_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8_b = void 0;
    let SharedProcessTunnel = class SharedProcessTunnel extends lifecycle_1.$kc {
        constructor(a, b, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort, localAddress, c, f, g) {
            super();
            this.a = a;
            this.b = b;
            this.tunnelRemoteHost = tunnelRemoteHost;
            this.tunnelRemotePort = tunnelRemotePort;
            this.tunnelLocalPort = tunnelLocalPort;
            this.localAddress = localAddress;
            this.c = c;
            this.f = f;
            this.g = g;
            this.privacy = tunnel_1.TunnelPrivacyId.Private;
            this.protocol = undefined;
            this.h();
            this.B(this.g.onDidChangeConnectionData(() => this.h()));
        }
        h() {
            this.b.getAddress().then((address) => {
                this.f.setAddress(this.a, address);
            });
        }
        async dispose() {
            this.c();
            super.dispose();
            await this.f.destroyTunnel(this.a);
        }
    };
    SharedProcessTunnel = __decorate([
        __param(7, sharedProcessTunnelService_1.$47b),
        __param(8, remoteAuthorityResolver_1.$Jk)
    ], SharedProcessTunnel);
    let $8_b = class $8_b extends tunnel_1.$7z {
        constructor(logService, u, v, w, lifecycleService, y, configurationService) {
            super(logService, configurationService);
            this.u = u;
            this.v = v;
            this.w = w;
            this.y = y;
            this.d = new Set();
            // Destroy any shared process tunnels that might still be active
            lifecycleService.onDidShutdown(() => {
                this.d.forEach((id) => {
                    this.v.destroyTunnel(id);
                });
            });
        }
        isPortPrivileged(port) {
            return (0, tunnel_1.$5z)(port, this.l, platform_1.OS, this.y.os.release);
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
                const tunnel = this.A(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded);
                this.j.trace('ForwardedPorts: (TunnelService) Tunnel created without provider.');
                this.p(remoteHost, remotePort, tunnel);
                return tunnel;
            }
        }
        async A(addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
            const { id } = await this.v.createTunnel();
            this.d.add(id);
            const authority = this.u.remoteAuthority;
            const result = await this.v.startTunnel(authority, id, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded);
            const tunnel = this.w.createInstance(SharedProcessTunnel, id, addressProvider, tunnelRemoteHost, tunnelRemotePort, result.tunnelLocalPort, result.localAddress, () => {
                this.d.delete(id);
            });
            return tunnel;
        }
        canTunnel(uri) {
            return super.canTunnel(uri) && !!this.u.remoteAuthority;
        }
    };
    exports.$8_b = $8_b;
    exports.$8_b = $8_b = __decorate([
        __param(0, log_1.$5i),
        __param(1, environmentService_1.$hJ),
        __param(2, sharedProcessTunnelService_1.$47b),
        __param(3, instantiation_1.$Ah),
        __param(4, lifecycle_2.$7y),
        __param(5, environmentService_2.$1$b),
        __param(6, configuration_1.$8h)
    ], $8_b);
    (0, extensions_1.$mr)(tunnel_1.$Wz, $8_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=tunnelService.js.map