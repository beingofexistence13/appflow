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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/api/common/extHostTunnelService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/tunnel/common/tunnel", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypes"], function (require, exports, cancellation_1, event_1, lifecycle_1, nls, instantiation_1, log_1, tunnel_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ssb = exports.$rsb = exports.TunnelDtoConverter = void 0;
    class ExtensionTunnel extends tunnel_1.$6z {
    }
    var TunnelDtoConverter;
    (function (TunnelDtoConverter) {
        function fromApiTunnel(tunnel) {
            return {
                remoteAddress: tunnel.remoteAddress,
                localAddress: tunnel.localAddress,
                public: !!tunnel.public,
                privacy: tunnel.privacy ?? (tunnel.public ? tunnel_1.TunnelPrivacyId.Public : tunnel_1.TunnelPrivacyId.Private),
                protocol: tunnel.protocol
            };
        }
        TunnelDtoConverter.fromApiTunnel = fromApiTunnel;
        function fromServiceTunnel(tunnel) {
            return {
                remoteAddress: {
                    host: tunnel.tunnelRemoteHost,
                    port: tunnel.tunnelRemotePort
                },
                localAddress: tunnel.localAddress,
                public: tunnel.privacy !== tunnel_1.TunnelPrivacyId.ConstantPrivate && tunnel.privacy !== tunnel_1.TunnelPrivacyId.ConstantPrivate,
                privacy: tunnel.privacy,
                protocol: tunnel.protocol
            };
        }
        TunnelDtoConverter.fromServiceTunnel = fromServiceTunnel;
    })(TunnelDtoConverter || (exports.TunnelDtoConverter = TunnelDtoConverter = {}));
    exports.$rsb = (0, instantiation_1.$Bh)('IExtHostTunnelService');
    let $ssb = class $ssb extends lifecycle_1.$kc {
        constructor(extHostRpc, initData, s) {
            super();
            this.s = s;
            this.f = () => { return Promise.resolve(true); };
            this.g = new Map();
            this.h = new event_1.$fd();
            this.onDidChangeTunnels = this.h.event;
            this.n = 0;
            this.r = new Map();
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadTunnelService);
        }
        async openTunnel(extension, forward) {
            this.s.trace(`ForwardedPorts: (ExtHostTunnelService) ${extension.identifier.value} called openTunnel API for ${forward.remoteAddress.host}:${forward.remoteAddress.port}.`);
            const tunnel = await this.a.$openTunnel(forward, extension.displayName);
            if (tunnel) {
                const disposableTunnel = new ExtensionTunnel(tunnel.remoteAddress, tunnel.localAddress, () => {
                    return this.a.$closeTunnel(tunnel.remoteAddress);
                });
                this.B(disposableTunnel);
                return disposableTunnel;
            }
            return undefined;
        }
        async getTunnels() {
            return this.a.$getTunnels();
        }
        u() {
            return this.n++;
        }
        registerPortsAttributesProvider(portSelector, provider) {
            const providerHandle = this.u();
            this.r.set(providerHandle, { selector: portSelector, provider });
            this.a.$registerPortsAttributesProvider(portSelector, providerHandle);
            return new types.$3J(() => {
                this.r.delete(providerHandle);
                this.a.$unregisterPortsAttributesProvider(providerHandle);
            });
        }
        async $providePortAttributes(handles, ports, pid, commandLine, cancellationToken) {
            const providedAttributes = [];
            for (const handle of handles) {
                const provider = this.r.get(handle);
                if (!provider) {
                    return [];
                }
                providedAttributes.push(...(await Promise.all(ports.map(async (port) => {
                    let providedAttributes;
                    try {
                        providedAttributes = await provider.provider.providePortAttributes({ port, pid, commandLine }, cancellationToken);
                    }
                    catch (e) {
                        // Call with old signature for breaking API change
                        providedAttributes = await provider.provider.providePortAttributes(port, pid, commandLine, cancellationToken);
                    }
                    return { providedAttributes, port };
                }))));
            }
            const allAttributes = providedAttributes.filter(attribute => !!attribute.providedAttributes);
            return (allAttributes.length > 0) ? allAttributes.map(attributes => {
                return {
                    autoForwardAction: attributes.providedAttributes.autoForwardAction,
                    port: attributes.port
                };
            }) : [];
        }
        async $registerCandidateFinder(_enable) { }
        registerTunnelProvider(provider, information) {
            if (this.b) {
                throw new Error('A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used.');
            }
            this.b = async (tunnelOptions, tunnelCreationOptions) => {
                const result = await provider.provideTunnel(tunnelOptions, tunnelCreationOptions, new cancellation_1.$pd().token);
                return result ?? undefined;
            };
            const tunnelFeatures = information.tunnelFeatures ? {
                elevation: !!information.tunnelFeatures?.elevation,
                privacyOptions: information.tunnelFeatures?.privacyOptions
            } : undefined;
            this.a.$setTunnelProvider(tunnelFeatures);
            return Promise.resolve((0, lifecycle_1.$ic)(() => {
                this.b = undefined;
                this.a.$setTunnelProvider(undefined);
            }));
        }
        /**
         * Applies the tunnel metadata and factory found in the remote authority
         * resolver to the tunnel system.
         *
         * `managedRemoteAuthority` should be be passed if the resolver returned on.
         * If this is the case, the tunnel cannot be connected to via a websocket from
         * the share process, so a synethic tunnel factory is used as a default.
         */
        async setTunnelFactory(provider, managedRemoteAuthority) {
            // Do not wait for any of the proxy promises here.
            // It will delay startup and there is nothing that needs to be waited for.
            if (provider) {
                if (provider.candidatePortSource !== undefined) {
                    this.a.$setCandidatePortSource(provider.candidatePortSource);
                }
                if (provider.showCandidatePort) {
                    this.f = provider.showCandidatePort;
                    this.a.$setCandidateFilter();
                }
                const tunnelFactory = provider.tunnelFactory ?? (managedRemoteAuthority ? this.w(managedRemoteAuthority) : undefined);
                if (tunnelFactory) {
                    this.b = tunnelFactory;
                    let privacyOptions = provider.tunnelFeatures?.privacyOptions ?? [];
                    if (provider.tunnelFeatures?.public && (privacyOptions.length === 0)) {
                        privacyOptions = [
                            {
                                id: 'private',
                                label: nls.localize(0, null),
                                themeIcon: 'lock'
                            },
                            {
                                id: 'public',
                                label: nls.localize(1, null),
                                themeIcon: 'eye'
                            }
                        ];
                    }
                    const tunnelFeatures = provider.tunnelFeatures ? {
                        elevation: !!provider.tunnelFeatures?.elevation,
                        public: !!provider.tunnelFeatures?.public,
                        privacyOptions
                    } : undefined;
                    this.a.$setTunnelProvider(tunnelFeatures);
                }
            }
            else {
                this.b = undefined;
            }
            return (0, lifecycle_1.$ic)(() => {
                this.b = undefined;
            });
        }
        w(_authority) {
            return undefined; // may be overridden
        }
        async $closeTunnel(remote, silent) {
            if (this.g.has(remote.host)) {
                const hostMap = this.g.get(remote.host);
                if (hostMap.has(remote.port)) {
                    if (silent) {
                        hostMap.get(remote.port).disposeListener.dispose();
                    }
                    await hostMap.get(remote.port).tunnel.dispose();
                    hostMap.delete(remote.port);
                }
            }
        }
        async $onDidTunnelsChange() {
            this.h.fire();
        }
        async $forwardPort(tunnelOptions, tunnelCreationOptions) {
            if (this.b) {
                try {
                    this.s.trace('ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider.');
                    const providedPort = this.b(tunnelOptions, tunnelCreationOptions);
                    this.s.trace('ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider.');
                    if (providedPort !== undefined) {
                        const tunnel = await providedPort;
                        this.s.trace('ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider.');
                        if (tunnel === undefined) {
                            this.s.error('ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined');
                            return undefined;
                        }
                        if (!this.g.has(tunnelOptions.remoteAddress.host)) {
                            this.g.set(tunnelOptions.remoteAddress.host, new Map());
                        }
                        const disposeListener = this.B(tunnel.onDidDispose(() => {
                            this.s.trace('ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel\'s onDidDispose.');
                            return this.a.$closeTunnel(tunnel.remoteAddress);
                        }));
                        this.g.get(tunnelOptions.remoteAddress.host).set(tunnelOptions.remoteAddress.port, { tunnel, disposeListener });
                        return TunnelDtoConverter.fromApiTunnel(tunnel);
                    }
                    else {
                        this.s.trace('ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined');
                    }
                }
                catch (e) {
                    this.s.trace('ForwardedPorts: (ExtHostTunnelService) tunnel provider error');
                    if (e instanceof Error) {
                        return e.message;
                    }
                }
            }
            return undefined;
        }
        async $applyCandidateFilter(candidates) {
            const filter = await Promise.all(candidates.map(candidate => this.f(candidate.host, candidate.port, candidate.detail ?? '')));
            const result = candidates.filter((candidate, index) => filter[index]);
            this.s.trace(`ForwardedPorts: (ExtHostTunnelService) filtered from ${candidates.map(port => port.port).join(', ')} to ${result.map(port => port.port).join(', ')}`);
            return result;
        }
    };
    exports.$ssb = $ssb;
    exports.$ssb = $ssb = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, log_1.$5i)
    ], $ssb);
});
//# sourceMappingURL=extHostTunnelService.js.map