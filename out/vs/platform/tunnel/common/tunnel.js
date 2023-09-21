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
    exports.AbstractTunnelService = exports.DisposableTunnel = exports.isPortPrivileged = exports.isAllInterfaces = exports.ALL_INTERFACES_ADDRESSES = exports.isLocalhost = exports.LOCALHOST_ADDRESSES = exports.extractLocalHostUriMetaDataForPortMapping = exports.ProvidedOnAutoForward = exports.isTunnelProvider = exports.TunnelPrivacyId = exports.TunnelProtocol = exports.ISharedTunnelsService = exports.ITunnelService = void 0;
    exports.ITunnelService = (0, instantiation_1.createDecorator)('tunnelService');
    exports.ISharedTunnelsService = (0, instantiation_1.createDecorator)('sharedTunnelsService');
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
    function isTunnelProvider(addressOrTunnelProvider) {
        return !!addressOrTunnelProvider.forwardPort;
    }
    exports.isTunnelProvider = isTunnelProvider;
    var ProvidedOnAutoForward;
    (function (ProvidedOnAutoForward) {
        ProvidedOnAutoForward[ProvidedOnAutoForward["Notify"] = 1] = "Notify";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowser"] = 2] = "OpenBrowser";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenPreview"] = 3] = "OpenPreview";
        ProvidedOnAutoForward[ProvidedOnAutoForward["Silent"] = 4] = "Silent";
        ProvidedOnAutoForward[ProvidedOnAutoForward["Ignore"] = 5] = "Ignore";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
    })(ProvidedOnAutoForward || (exports.ProvidedOnAutoForward = ProvidedOnAutoForward = {}));
    function extractLocalHostUriMetaDataForPortMapping(uri) {
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
    exports.extractLocalHostUriMetaDataForPortMapping = extractLocalHostUriMetaDataForPortMapping;
    exports.LOCALHOST_ADDRESSES = ['localhost', '127.0.0.1', '0:0:0:0:0:0:0:1', '::1'];
    function isLocalhost(host) {
        return exports.LOCALHOST_ADDRESSES.indexOf(host) >= 0;
    }
    exports.isLocalhost = isLocalhost;
    exports.ALL_INTERFACES_ADDRESSES = ['0.0.0.0', '0:0:0:0:0:0:0:0', '::'];
    function isAllInterfaces(host) {
        return exports.ALL_INTERFACES_ADDRESSES.indexOf(host) >= 0;
    }
    exports.isAllInterfaces = isAllInterfaces;
    function isPortPrivileged(port, host, os, osRelease) {
        if (os === 1 /* OperatingSystem.Windows */) {
            return false;
        }
        if (os === 2 /* OperatingSystem.Macintosh */) {
            if (isAllInterfaces(host)) {
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
    exports.isPortPrivileged = isPortPrivileged;
    class DisposableTunnel {
        constructor(remoteAddress, localAddress, _dispose) {
            this.remoteAddress = remoteAddress;
            this.localAddress = localAddress;
            this._dispose = _dispose;
            this._onDispose = new event_1.Emitter();
            this.onDidDispose = this._onDispose.event;
        }
        dispose() {
            this._onDispose.fire();
            return this._dispose();
        }
    }
    exports.DisposableTunnel = DisposableTunnel;
    let AbstractTunnelService = class AbstractTunnelService {
        constructor(logService, configurationService) {
            this.logService = logService;
            this.configurationService = configurationService;
            this._onTunnelOpened = new event_1.Emitter();
            this.onTunnelOpened = this._onTunnelOpened.event;
            this._onTunnelClosed = new event_1.Emitter();
            this.onTunnelClosed = this._onTunnelClosed.event;
            this._onAddedTunnelProvider = new event_1.Emitter();
            this.onAddedTunnelProvider = this._onAddedTunnelProvider.event;
            this._tunnels = new Map();
            this._canElevate = false;
            this._privacyOptions = [];
            this._factoryInProgress = new Set();
        }
        get hasTunnelProvider() {
            return !!this._tunnelProvider;
        }
        get defaultTunnelHost() {
            const settingValue = this.configurationService.getValue('remote.localPortHost');
            return (!settingValue || settingValue === 'localhost') ? '127.0.0.1' : '0.0.0.0';
        }
        setTunnelProvider(provider) {
            this._tunnelProvider = provider;
            if (!provider) {
                // clear features
                this._canElevate = false;
                this._privacyOptions = [];
                this._onAddedTunnelProvider.fire();
                return {
                    dispose: () => { }
                };
            }
            this._onAddedTunnelProvider.fire();
            return {
                dispose: () => {
                    this._tunnelProvider = undefined;
                    this._canElevate = false;
                    this._privacyOptions = [];
                }
            };
        }
        setTunnelFeatures(features) {
            this._canElevate = features.elevation;
            this._privacyOptions = features.privacyOptions;
        }
        get canElevate() {
            return this._canElevate;
        }
        get canChangePrivacy() {
            return this._privacyOptions.length > 0;
        }
        get privacyOptions() {
            return this._privacyOptions;
        }
        get tunnels() {
            return this.getTunnels();
        }
        async getTunnels() {
            const tunnels = [];
            const tunnelArray = Array.from(this._tunnels.values());
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
            for (const portMap of this._tunnels.values()) {
                for (const { value } of portMap.values()) {
                    await value.then(tunnel => typeof tunnel !== 'string' ? tunnel?.dispose() : undefined);
                }
                portMap.clear();
            }
            this._tunnels.clear();
        }
        setEnvironmentTunnel(remoteHost, remotePort, localAddress, privacy, protocol) {
            this.addTunnelToMap(remoteHost, remotePort, Promise.resolve({
                tunnelRemoteHost: remoteHost,
                tunnelRemotePort: remotePort,
                localAddress,
                privacy,
                protocol,
                dispose: () => Promise.resolve()
            }));
        }
        async getExistingTunnel(remoteHost, remotePort) {
            if (isAllInterfaces(remoteHost) || isLocalhost(remoteHost)) {
                remoteHost = exports.LOCALHOST_ADDRESSES[0];
            }
            const existing = this.getTunnelFromMap(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            return undefined;
        }
        openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded = false, privacy, protocol) {
            this.logService.trace(`ForwardedPorts: (TunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const addressOrTunnelProvider = this._tunnelProvider ?? addressProvider;
            if (!addressOrTunnelProvider) {
                return undefined;
            }
            if (!remoteHost) {
                remoteHost = 'localhost';
            }
            if (!localHost) {
                localHost = this.defaultTunnelHost;
            }
            // Prevent tunnel factories from calling openTunnel from within the factory
            if (this._tunnelProvider && this._factoryInProgress.has(remotePort)) {
                this.logService.debug(`ForwardedPorts: (TunnelService) Another call to create a tunnel with the same address has occurred before the last one completed. This call will be ignored.`);
                return;
            }
            const resolvedTunnel = this.retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
            if (!resolvedTunnel) {
                this.logService.trace(`ForwardedPorts: (TunnelService) Tunnel was not created.`);
                return resolvedTunnel;
            }
            return resolvedTunnel.then(tunnel => {
                if (!tunnel) {
                    this.logService.trace('ForwardedPorts: (TunnelService) New tunnel is undefined.');
                    this.removeEmptyOrErrorTunnelFromMap(remoteHost, remotePort);
                    return undefined;
                }
                else if (typeof tunnel === 'string') {
                    this.logService.trace('ForwardedPorts: (TunnelService) The tunnel provider returned an error when creating the tunnel.');
                    this.removeEmptyOrErrorTunnelFromMap(remoteHost, remotePort);
                    return tunnel;
                }
                this.logService.trace('ForwardedPorts: (TunnelService) New tunnel established.');
                const newTunnel = this.makeTunnel(tunnel);
                if (tunnel.tunnelRemoteHost !== remoteHost || tunnel.tunnelRemotePort !== remotePort) {
                    this.logService.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Host or port mismatch.');
                }
                if (privacy && tunnel.privacy !== privacy) {
                    this.logService.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Privacy mismatch.');
                }
                this._onTunnelOpened.fire(newTunnel);
                return newTunnel;
            });
        }
        makeTunnel(tunnel) {
            return {
                tunnelRemotePort: tunnel.tunnelRemotePort,
                tunnelRemoteHost: tunnel.tunnelRemoteHost,
                tunnelLocalPort: tunnel.tunnelLocalPort,
                localAddress: tunnel.localAddress,
                privacy: tunnel.privacy,
                protocol: tunnel.protocol,
                dispose: async () => {
                    this.logService.trace(`ForwardedPorts: (TunnelService) dispose request for ${tunnel.tunnelRemoteHost}:${tunnel.tunnelRemotePort} `);
                    const existingHost = this._tunnels.get(tunnel.tunnelRemoteHost);
                    if (existingHost) {
                        const existing = existingHost.get(tunnel.tunnelRemotePort);
                        if (existing) {
                            existing.refcount--;
                            await this.tryDisposeTunnel(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort, existing);
                        }
                    }
                }
            };
        }
        async tryDisposeTunnel(remoteHost, remotePort, tunnel) {
            if (tunnel.refcount <= 0) {
                this.logService.trace(`ForwardedPorts: (TunnelService) Tunnel is being disposed ${remoteHost}:${remotePort}.`);
                const disposePromise = tunnel.value.then(async (tunnel) => {
                    if (tunnel && (typeof tunnel !== 'string')) {
                        await tunnel.dispose(true);
                        this._onTunnelClosed.fire({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort });
                    }
                });
                if (this._tunnels.has(remoteHost)) {
                    this._tunnels.get(remoteHost).delete(remotePort);
                }
                return disposePromise;
            }
        }
        async closeTunnel(remoteHost, remotePort) {
            this.logService.trace(`ForwardedPorts: (TunnelService) close request for ${remoteHost}:${remotePort} `);
            const portMap = this._tunnels.get(remoteHost);
            if (portMap && portMap.has(remotePort)) {
                const value = portMap.get(remotePort);
                value.refcount = 0;
                await this.tryDisposeTunnel(remoteHost, remotePort, value);
            }
        }
        addTunnelToMap(remoteHost, remotePort, tunnel) {
            if (!this._tunnels.has(remoteHost)) {
                this._tunnels.set(remoteHost, new Map());
            }
            this._tunnels.get(remoteHost).set(remotePort, { refcount: 1, value: tunnel });
        }
        async removeEmptyOrErrorTunnelFromMap(remoteHost, remotePort) {
            const hostMap = this._tunnels.get(remoteHost);
            if (hostMap) {
                const tunnel = hostMap.get(remotePort);
                const tunnelResult = tunnel ? await tunnel.value : undefined;
                if (!tunnelResult || (typeof tunnelResult === 'string')) {
                    hostMap.delete(remotePort);
                }
                if (hostMap.size === 0) {
                    this._tunnels.delete(remoteHost);
                }
            }
        }
        getTunnelFromMap(remoteHost, remotePort) {
            const hosts = [remoteHost];
            // Order matters. We want the original host to be first.
            if (isLocalhost(remoteHost)) {
                hosts.push(...exports.LOCALHOST_ADDRESSES);
                // For localhost, we add the all interfaces hosts because if the tunnel is already available at all interfaces,
                // then of course it is available at localhost.
                hosts.push(...exports.ALL_INTERFACES_ADDRESSES);
            }
            else if (isAllInterfaces(remoteHost)) {
                hosts.push(...exports.ALL_INTERFACES_ADDRESSES);
            }
            const existingPortMaps = hosts.map(host => this._tunnels.get(host));
            for (const map of existingPortMaps) {
                const existingTunnel = map?.get(remotePort);
                if (existingTunnel) {
                    return existingTunnel;
                }
            }
            return undefined;
        }
        canTunnel(uri) {
            return !!extractLocalHostUriMetaDataForPortMapping(uri);
        }
        createWithProvider(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol) {
            this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel with provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const key = remotePort;
            this._factoryInProgress.add(key);
            const preferredLocalPort = localPort === undefined ? remotePort : localPort;
            const creationInfo = { elevationRequired: elevateIfNeeded ? this.isPortPrivileged(preferredLocalPort) : false };
            const tunnelOptions = { remoteAddress: { host: remoteHost, port: remotePort }, localAddressPort: localPort, privacy, public: privacy ? (privacy !== TunnelPrivacyId.Private) : undefined, protocol };
            const tunnel = tunnelProvider.forwardPort(tunnelOptions, creationInfo);
            if (tunnel) {
                this.addTunnelToMap(remoteHost, remotePort, tunnel);
                tunnel.finally(() => {
                    this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created by provider.');
                    this._factoryInProgress.delete(key);
                });
            }
            else {
                this._factoryInProgress.delete(key);
            }
            return tunnel;
        }
    };
    exports.AbstractTunnelService = AbstractTunnelService;
    exports.AbstractTunnelService = AbstractTunnelService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, configuration_1.IConfigurationService)
    ], AbstractTunnelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdHVubmVsL2NvbW1vbi90dW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYW5GLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsZUFBZSxDQUFDLENBQUM7SUFDbEUsUUFBQSxxQkFBcUIsR0FBRyxJQUFBLCtCQUFlLEVBQXdCLHNCQUFzQixDQUFDLENBQUM7SUFxQnBHLElBQVksY0FHWDtJQUhELFdBQVksY0FBYztRQUN6QiwrQkFBYSxDQUFBO1FBQ2IsaUNBQWUsQ0FBQTtJQUNoQixDQUFDLEVBSFcsY0FBYyw4QkFBZCxjQUFjLFFBR3pCO0lBRUQsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQzFCLHNEQUFtQyxDQUFBO1FBQ25DLHNDQUFtQixDQUFBO1FBQ25CLG9DQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFKVyxlQUFlLCtCQUFmLGVBQWUsUUFJMUI7SUFtQkQsU0FBZ0IsZ0JBQWdCLENBQUMsdUJBQTJEO1FBQzNGLE9BQU8sQ0FBQyxDQUFFLHVCQUEyQyxDQUFDLFdBQVcsQ0FBQztJQUNuRSxDQUFDO0lBRkQsNENBRUM7SUFFRCxJQUFZLHFCQU9YO0lBUEQsV0FBWSxxQkFBcUI7UUFDaEMscUVBQVUsQ0FBQTtRQUNWLCtFQUFlLENBQUE7UUFDZiwrRUFBZSxDQUFBO1FBQ2YscUVBQVUsQ0FBQTtRQUNWLHFFQUFVLENBQUE7UUFDVix1RkFBbUIsQ0FBQTtJQUNwQixDQUFDLEVBUFcscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFPaEM7SUFnRUQsU0FBZ0IseUNBQXlDLENBQUMsR0FBUTtRQUNqRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO1lBQ3BELE9BQU8sU0FBUyxD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