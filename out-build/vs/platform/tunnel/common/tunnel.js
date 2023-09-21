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
define(["require", "exports", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, event_1, configuration_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7z = exports.$6z = exports.$5z = exports.$4z = exports.$3z = exports.$2z = exports.$1z = exports.$Zz = exports.ProvidedOnAutoForward = exports.$Yz = exports.TunnelPrivacyId = exports.TunnelProtocol = exports.$Xz = exports.$Wz = void 0;
    exports.$Wz = (0, instantiation_1.$Bh)('tunnelService');
    exports.$Xz = (0, instantiation_1.$Bh)('sharedTunnelsService');
    var TunnelProtocol;
    (function (TunnelProtocol) {
        TunnelProtocol["Http"] = "http";
        TunnelProtocol["Https"] = "https";
    })(TunnelProtocol || (exports.TunnelProtocol = TunnelProtocol = {}));
    var TunnelPrivacyId;
    (function (TunnelPrivacyId) {
        TunnelPrivacyId["ConstantPrivate"] = "constantPrivate";
        TunnelPrivacyId["Private"] = "private";
        TunnelPrivacyId["Public"] = "public";
    })(TunnelPrivacyId || (exports.TunnelPrivacyId = TunnelPrivacyId = {}));
    function $Yz(addressOrTunnelProvider) {
        return !!addressOrTunnelProvider.forwardPort;
    }
    exports.$Yz = $Yz;
    var ProvidedOnAutoForward;
    (function (ProvidedOnAutoForward) {
        ProvidedOnAutoForward[ProvidedOnAutoForward["Notify"] = 1] = "Notify";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowser"] = 2] = "OpenBrowser";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenPreview"] = 3] = "OpenPreview";
        ProvidedOnAutoForward[ProvidedOnAutoForward["Silent"] = 4] = "Silent";
        ProvidedOnAutoForward[ProvidedOnAutoForward["Ignore"] = 5] = "Ignore";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
    })(ProvidedOnAutoForward || (exports.ProvidedOnAutoForward = ProvidedOnAutoForward = {}));
    function $Zz(uri) {
        if (uri.scheme !== 'http' && uri.scheme !== 'https') {
            return undefined;
        }
        const localhostMatch = /^(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)$/.exec(uri.authority);
        if (!localhostMatch) {
            return undefined;
        }
        return {
            address: localhostMatch[1],
            port: +localhostMatch[2],
        };
    }
    exports.$Zz = $Zz;
    exports.$1z = ['localhost', '127.0.0.1', '0:0:0:0:0:0:0:1', '::1'];
    function $2z(host) {
        return exports.$1z.indexOf(host) >= 0;
    }
    exports.$2z = $2z;
    exports.$3z = ['0.0.0.0', '0:0:0:0:0:0:0:0', '::'];
    function $4z(host) {
        return exports.$3z.indexOf(host) >= 0;
    }
    exports.$4z = $4z;
    function $5z(port, host, os, osRelease) {
        if (os === 1 /* OperatingSystem.Windows */) {
            return false;
        }
        if (os === 2 /* OperatingSystem.Macintosh */) {
            if ($4z(host)) {
                const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(osRelease);
                if (osVersion?.length === 4) {
                    const major = parseInt(osVersion[1]);
                    if (major >= 18 /* since macOS Mojave, darwin version 18.0.0 */) {
                        return false;
                    }
                }
            }
        }
        return port < 1024;
    }
    exports.$5z = $5z;
    class $6z {
        constructor(remoteAddress, localAddress, b) {
            this.remoteAddress = remoteAddress;
            this.localAddress = localAddress;
            this.b = b;
            this.a = new event_1.$fd();
            this.onDidDispose = this.a.event;
        }
        dispose() {
            this.a.fire();
            return this.b();
        }
    }
    exports.$6z = $6z;
    let $7z = class $7z {
        constructor(j, k) {
            this.j = j;
            this.k = k;
            this.a = new event_1.$fd();
            this.onTunnelOpened = this.a.event;
            this.b = new event_1.$fd();
            this.onTunnelClosed = this.b.event;
            this.c = new event_1.$fd();
            this.onAddedTunnelProvider = this.c.event;
            this.e = new Map();
            this.g = false;
            this.h = [];
            this.i = new Set();
        }
        get hasTunnelProvider() {
            return !!this.f;
        }
        get l() {
            const settingValue = this.k.getValue('remote.localPortHost');
            return (!settingValue || settingValue === 'localhost') ? '127.0.0.1' : '0.0.0.0';
        }
        setTunnelProvider(provider) {
            this.f = provider;
            if (!provider) {
                // clear features
                this.g = false;
                this.h = [];
                this.c.fire();
                return {
                    dispose: () => { }
                };
            }
            this.c.fire();
            return {
                dispose: () => {
                    this.f = undefined;
                    this.g = false;
                    this.h = [];
                }
            };
        }
        setTunnelFeatures(features) {
            this.g = features.elevation;
            this.h = features.privacyOptions;
        }
        get canElevate() {
            return this.g;
        }
        get canChangePrivacy() {
            return this.h.length > 0;
        }
        get privacyOptions() {
            return this.h;
        }
        get tunnels() {
            return this.m();
        }
        async m() {
            const tunnels = [];
            const tunnelArray = Array.from(this.e.values());
            for (const portMap of tunnelArray) {
                const portArray = Array.from(portMap.values());
                for (const x of portArray) {
                    const tunnelValue = await x.value;
                    if (tunnelValue && (typeof tunnelValue !== 'string')) {
                        tunnels.push(tunnelValue);
                    }
                }
            }
            return tunnels;
        }
        async dispose() {
            for (const portMap of this.e.values()) {
                for (const { value } of portMap.values()) {
                    await value.then(tunnel => typeof tunnel !== 'string' ? tunnel?.dispose() : undefined);
                }
                portMap.clear();
            }
            this.e.clear();
        }
        setEnvironmentTunnel(remoteHost, remotePort, localAddress, privacy, protocol) {
            this.p(remoteHost, remotePort, Promise.resolve({
                tunnelRemoteHost: remoteHost,
                tunnelRemotePort: remotePort,
                localAddress,
                privacy,
                protocol,
                dispose: () => Promise.resolve()
            }));
        }
        async getExistingTunnel(remoteHost, remotePort) {
            if ($4z(remoteHost) || $2z(remoteHost)) {
                remoteHost = exports.$1z[0];
            }
            const existing = this.r(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            return undefined;
        }
        openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded = false, privacy, protocol) {
            this.j.trace(`ForwardedPorts: (TunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const addressOrTunnelProvider = this.f ?? addressProvider;
            if (!addressOrTunnelProvider) {
                return undefined;
            }
            if (!remoteHost) {
                remoteHost = 'localhost';
            }
            if (!localHost) {
                localHost = this.l;
            }
            // Prevent tunnel factories from calling openTunnel from within the factory
            if (this.f && this.i.has(remotePort)) {
                this.j.debug(`ForwardedPorts: (TunnelService) Another call to create a tunnel with the same address has occurred before the last one completed. This call will be ignored.`);
                return;
            }
            const resolvedTunnel = this.s(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
            if (!resolvedTunnel) {
                this.j.trace(`ForwardedPorts: (TunnelService) Tunnel was not created.`);
                return resolvedTunnel;
            }
            return resolvedTunnel.then(tunnel => {
                if (!tunnel) {
                    this.j.trace('ForwardedPorts: (TunnelService) New tunnel is undefined.');
                    this.q(remoteHost, remotePort);
                    return undefined;
                }
                else if (typeof tunnel === 'string') {
                    this.j.trace('ForwardedPorts: (TunnelService) The tunnel provider returned an error when creating the tunnel.');
                    this.q(remoteHost, remotePort);
                    return tunnel;
                }
                this.j.trace('ForwardedPorts: (TunnelService) New tunnel established.');
                const newTunnel = this.n(tunnel);
                if (tunnel.tunnelRemoteHost !== remoteHost || tunnel.tunnelRemotePort !== remotePort) {
                    this.j.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Host or port mismatch.');
                }
                if (privacy && tunnel.privacy !== privacy) {
                    this.j.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Privacy mismatch.');
                }
                this.a.fire(newTunnel);
                return newTunnel;
            });
        }
        n(tunnel) {
            return {
                tunnelRemotePort: tunnel.tunnelRemotePort,
                tunnelRemoteHost: tunnel.tunnelRemoteHost,
                tunnelLocalPort: tunnel.tunnelLocalPort,
                localAddress: tunnel.localAddress,
                privacy: tunnel.privacy,
                protocol: tunnel.protocol,
                dispose: async () => {
                    this.j.trace(`ForwardedPorts: (TunnelService) dispose request for ${tunnel.tunnelRemoteHost}:${tunnel.tunnelRemotePort} `);
                    const existingHost = this.e.get(tunnel.tunnelRemoteHost);
                    if (existingHost) {
                        const existing = existingHost.get(tunnel.tunnelRemotePort);
                        if (existing) {
                            existing.refcount--;
                            await this.o(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort, existing);
                        }
                    }
                }
            };
        }
        async o(remoteHost, remotePort, tunnel) {
            if (tunnel.refcount <= 0) {
                this.j.trace(`ForwardedPorts: (TunnelService) Tunnel is being disposed ${remoteHost}:${remotePort}.`);
                const disposePromise = tunnel.value.then(async (tunnel) => {
                    if (tunnel && (typeof tunnel !== 'string')) {
                        await tunnel.dispose(true);
                        this.b.fire({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort });
                    }
                });
                if (this.e.has(remoteHost)) {
                    this.e.get(remoteHost).delete(remotePort);
                }
                return disposePromise;
            }
        }
        async closeTunnel(remoteHost, remotePort) {
            this.j.trace(`ForwardedPorts: (TunnelService) close request for ${remoteHost}:${remotePort} `);
            const portMap = this.e.get(remoteHost);
            if (portMap && portMap.has(remotePort)) {
                const value = portMap.get(remotePort);
                value.refcount = 0;
                await this.o(remoteHost, remotePort, value);
            }
        }
        p(remoteHost, remotePort, tunnel) {
            if (!this.e.has(remoteHost)) {
                this.e.set(remoteHost, new Map());
            }
            this.e.get(remoteHost).set(remotePort, { refcount: 1, value: tunnel });
        }
        async q(remoteHost, remotePort) {
            const hostMap = this.e.get(remoteHost);
            if (hostMap) {
                const tunnel = hostMap.get(remotePort);
                const tunnelResult = tunnel ? await tunnel.value : undefined;
                if (!tunnelResult || (typeof tunnelResult === 'string')) {
                    hostMap.delete(remotePort);
                }
                if (hostMap.size === 0) {
                    this.e.delete(remoteHost);
                }
            }
        }
        r(remoteHost, remotePort) {
            const hosts = [remoteHost];
            // Order matters. We want the original host to be first.
            if ($2z(remoteHost)) {
                hosts.push(...exports.$1z);
                // For localhost, we add the all interfaces hosts because if the tunnel is already available at all interfaces,
                // then of course it is available at localhost.
                hosts.push(...exports.$3z);
            }
            else if ($4z(remoteHost)) {
                hosts.push(...exports.$3z);
            }
            const existingPortMaps = hosts.map(host => this.e.get(host));
            for (const map of existingPortMaps) {
                const existingTunnel = map?.get(remotePort);
                if (existingTunnel) {
                    return existingTunnel;
                }
            }
            return undefined;
        }
        canTunnel(uri) {
            return !!$Zz(uri);
        }
        t(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol) {
            this.j.trace(`ForwardedPorts: (TunnelService) Creating tunnel with provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const key = remotePort;
            this.i.add(key);
            const preferredLocalPort = localPort === undefined ? remotePort : localPort;
            const creationInfo = { elevationRequired: elevateIfNeeded ? this.isPortPrivileged(preferredLocalPort) : false };
            const tunnelOptions = { remoteAddress: { host: remoteHost, port: remotePort }, localAddressPort: localPort, privacy, public: privacy ? (privacy !== TunnelPrivacyId.Private) : undefined, protocol };
            const tunnel = tunnelProvider.forwardPort(tunnelOptions, creationInfo);
            if (tunnel) {
                this.p(remoteHost, remotePort, tunnel);
                tunnel.finally(() => {
                    this.j.trace('ForwardedPorts: (TunnelService) Tunnel created by provider.');
                    this.i.delete(key);
                });
            }
            else {
                this.i.delete(key);
            }
            return tunnel;
        }
    };
    exports.$7z = $7z;
    exports.$7z = $7z = __decorate([
        __param(0, log_1.$5i),
        __param(1, configuration_1.$8h)
    ], $7z);
});
//# sourceMappingURL=tunnel.js.map