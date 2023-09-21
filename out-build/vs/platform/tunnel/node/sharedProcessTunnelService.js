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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/tunnel/common/tunnel", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/common/async"], function (require, exports, log_1, tunnel_1, lifecycle_1, errors_1, async_1) {
    "use strict";
    var $67b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$67b = void 0;
    class TunnelData extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = null;
            this.b = null;
        }
        async getAddress() {
            if (this.a) {
                // address is resolved
                return this.a;
            }
            if (!this.b) {
                this.b = new async_1.$2g();
            }
            return this.b.p;
        }
        setAddress(address) {
            this.a = address;
            if (this.b) {
                this.b.complete(address);
                this.b = null;
            }
        }
        setTunnel(tunnel) {
            this.B(tunnel);
        }
    }
    let $67b = class $67b extends lifecycle_1.$kc {
        static { $67b_1 = this; }
        static { this.a = 0; }
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.b = new Map();
            this.c = new Set();
        }
        dispose() {
            super.dispose();
            this.b.forEach((tunnel) => tunnel.dispose());
        }
        async createTunnel() {
            const id = String(++$67b_1.a);
            return { id };
        }
        async startTunnel(authority, id, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
            const tunnelData = new TunnelData();
            const tunnel = await Promise.resolve(this.f.openTunnel(authority, tunnelData, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded));
            if (!tunnel || (typeof tunnel === 'string')) {
                this.g.info(`[SharedProcessTunnelService] Could not create a tunnel to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
                tunnelData.dispose();
                throw new Error(`Could not create tunnel`);
            }
            if (this.c.has(id)) {
                // This tunnel was disposed in the meantime
                this.c.delete(id);
                tunnelData.dispose();
                await tunnel.dispose();
                throw (0, errors_1.$4)();
            }
            tunnelData.setTunnel(tunnel);
            this.b.set(id, tunnelData);
            this.g.info(`[SharedProcessTunnelService] Created tunnel ${id}: ${tunnel.localAddress} (local) to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
            const result = {
                tunnelLocalPort: tunnel.tunnelLocalPort,
                localAddress: tunnel.localAddress
            };
            return result;
        }
        async setAddress(id, address) {
            const tunnel = this.b.get(id);
            if (!tunnel) {
                return;
            }
            tunnel.setAddress(address);
        }
        async destroyTunnel(id) {
            const tunnel = this.b.get(id);
            if (tunnel) {
                this.g.info(`[SharedProcessTunnelService] Disposing tunnel ${id}.`);
                this.b.delete(id);
                await tunnel.dispose();
                return;
            }
            // Looks like this tunnel is still starting, mark the id as disposed
            this.c.add(id);
        }
    };
    exports.$67b = $67b;
    exports.$67b = $67b = $67b_1 = __decorate([
        __param(0, tunnel_1.$Xz),
        __param(1, log_1.$5i)
    ], $67b);
});
//# sourceMappingURL=sharedProcessTunnelService.js.map