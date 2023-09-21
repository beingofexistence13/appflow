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
define(["require", "exports", "vs/nls!vs/workbench/api/browser/mainThreadTunnelService", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/tunnel/common/tunnel", "vs/base/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, nls, extHost_protocol_1, extHostTunnelService_1, extHostCustomers_1, remoteExplorerService_1, tunnel_1, lifecycle_1, notification_1, configuration_1, log_1, remoteAgentService_1, platform_1, configurationRegistry_1, contextkey_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Csb = void 0;
    let $Csb = class $Csb extends lifecycle_1.$kc {
        constructor(extHostContext, f, g, h, j, m, n, r) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.b = false;
            this.c = new Map();
            this.t = false;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostTunnelService);
            this.B(g.onTunnelOpened(() => this.a.$onDidTunnelsChange()));
            this.B(g.onTunnelClosed(() => this.a.$onDidTunnelsChange()));
        }
        s() {
            return (!!this.j.getValue(remoteExplorerService_1.$xsb) || this.g.hasTunnelProvider)
                && (this.j.getValue(remoteExplorerService_1.$ysb) !== remoteExplorerService_1.$Asb);
        }
        async $setRemoteTunnelService(processId) {
            this.f.namedProcesses.set(processId, 'Code Extension Host');
            if (this.f.portsFeaturesEnabled) {
                this.a.$registerCandidateFinder(this.s());
            }
            else {
                this.B(this.f.onEnabledPortsFeatures(() => this.a.$registerCandidateFinder(this.j.getValue(remoteExplorerService_1.$xsb))));
            }
            this.B(this.j.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.$xsb) || e.affectsConfiguration(remoteExplorerService_1.$ysb)) {
                    return this.a.$registerCandidateFinder(this.s());
                }
            }));
            this.B(this.g.onAddedTunnelProvider(() => {
                return this.a.$registerCandidateFinder(this.s());
            }));
        }
        async $registerPortsAttributesProvider(selector, providerHandle) {
            this.c.set(providerHandle, selector);
            if (!this.t) {
                this.f.tunnelModel.addAttributesProvider(this);
                this.t = true;
            }
        }
        async $unregisterPortsAttributesProvider(providerHandle) {
            this.c.delete(providerHandle);
        }
        async providePortAttributes(ports, pid, commandLine, token) {
            if (this.c.size === 0) {
                return [];
            }
            // Check all the selectors to make sure it's worth going to the extension host.
            const appropriateHandles = Array.from(this.c.entries()).filter(entry => {
                const selector = entry[1];
                const portRange = (typeof selector.portRange === 'number') ? [selector.portRange, selector.portRange + 1] : selector.portRange;
                const portInRange = portRange ? ports.some(port => portRange[0] <= port && port < portRange[1]) : true;
                const commandMatches = !selector.commandPattern || (commandLine && (commandLine.match(selector.commandPattern)));
                return portInRange && commandMatches;
            }).map(entry => entry[0]);
            if (appropriateHandles.length === 0) {
                return [];
            }
            return this.a.$providePortAttributes(appropriateHandles, ports, pid, commandLine, token);
        }
        async $openTunnel(tunnelOptions, source) {
            const tunnel = await this.f.forward({
                remote: tunnelOptions.remoteAddress,
                local: tunnelOptions.localAddressPort,
                name: tunnelOptions.label,
                source: {
                    source: tunnelModel_1.TunnelSource.Extension,
                    description: source
                },
                elevateIfNeeded: false
            });
            if (!tunnel || (typeof tunnel === 'string')) {
                return undefined;
            }
            if (!this.b
                && (tunnelOptions.localAddressPort !== undefined)
                && (tunnel.tunnelLocalPort !== undefined)
                && this.g.isPortPrivileged(tunnelOptions.localAddressPort)
                && (tunnel.tunnelLocalPort !== tunnelOptions.localAddressPort)
                && this.g.canElevate) {
                this.u(tunnelOptions, tunnel, source);
            }
            return extHostTunnelService_1.TunnelDtoConverter.fromServiceTunnel(tunnel);
        }
        async u(tunnelOptions, tunnel, source) {
            return this.h.prompt(notification_1.Severity.Info, nls.localize(0, null, source, tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort), [{
                    label: nls.localize(1, null, tunnel.tunnelRemotePort),
                    run: async () => {
                        this.b = true;
                        await this.f.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                        await this.f.forward({
                            remote: tunnelOptions.remoteAddress,
                            local: tunnelOptions.localAddressPort,
                            name: tunnelOptions.label,
                            source: {
                                source: tunnelModel_1.TunnelSource.Extension,
                                description: source
                            },
                            elevateIfNeeded: true
                        });
                        this.b = false;
                    }
                }]);
        }
        async $closeTunnel(remote) {
            return this.f.close(remote, tunnelModel_1.TunnelCloseReason.Other);
        }
        async $getTunnels() {
            return (await this.g.tunnels).map(tunnel => {
                return {
                    remoteAddress: { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost },
                    localAddress: tunnel.localAddress,
                    privacy: tunnel.privacy,
                    protocol: tunnel.protocol
                };
            });
        }
        async $onFoundNewCandidates(candidates) {
            this.f.onFoundNewCandidates(candidates);
        }
        async $setTunnelProvider(features) {
            const tunnelProvider = {
                forwardPort: (tunnelOptions, tunnelCreationOptions) => {
                    const forward = this.a.$forwardPort(tunnelOptions, tunnelCreationOptions);
                    return forward.then(tunnelOrError => {
                        if (!tunnelOrError) {
                            return undefined;
                        }
                        else if (typeof tunnelOrError === 'string') {
                            return tunnelOrError;
                        }
                        const tunnel = tunnelOrError;
                        this.m.trace(`ForwardedPorts: (MainThreadTunnelService) New tunnel established by tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
                        return {
                            tunnelRemotePort: tunnel.remoteAddress.port,
                            tunnelRemoteHost: tunnel.remoteAddress.host,
                            localAddress: typeof tunnel.localAddress === 'string' ? tunnel.localAddress : (0, tunnelModel_1.$pJ)(tunnel.localAddress.host, tunnel.localAddress.port),
                            tunnelLocalPort: typeof tunnel.localAddress !== 'string' ? tunnel.localAddress.port : undefined,
                            public: tunnel.public,
                            privacy: tunnel.privacy,
                            protocol: tunnel.protocol ?? tunnel_1.TunnelProtocol.Http,
                            dispose: async (silent) => {
                                this.m.trace(`ForwardedPorts: (MainThreadTunnelService) Closing tunnel from tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
                                return this.a.$closeTunnel({ host: tunnel.remoteAddress.host, port: tunnel.remoteAddress.port }, silent);
                            }
                        };
                    });
                }
            };
            if (features) {
                this.g.setTunnelFeatures(features);
            }
            this.g.setTunnelProvider(tunnelProvider);
            // At this point we clearly want the ports view/features since we have a tunnel factory
            this.r.createKey(tunnelModel_1.$jJ.key, true);
        }
        async $setCandidateFilter() {
            this.f.setCandidateFilter((candidates) => {
                return this.a.$applyCandidateFilter(candidates);
            });
        }
        async $setCandidatePortSource(source) {
            // Must wait for the remote environment before trying to set settings there.
            this.n.getEnvironment().then(() => {
                switch (source) {
                    case extHost_protocol_1.CandidatePortSource.None: {
                        platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
                            .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPorts': false } }]);
                        break;
                    }
                    case extHost_protocol_1.CandidatePortSource.Output: {
                        platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
                            .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': remoteExplorerService_1.$Asb } }]);
                        break;
                    }
                    default: // Do nothing, the defaults for these settings should be used.
                }
            }).catch(() => {
                // The remote failed to get setup. Errors from that area will already be surfaced to the user.
            });
        }
    };
    exports.$Csb = $Csb;
    exports.$Csb = $Csb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTunnelService),
        __param(1, remoteExplorerService_1.$tsb),
        __param(2, tunnel_1.$Wz),
        __param(3, notification_1.$Yu),
        __param(4, configuration_1.$8h),
        __param(5, log_1.$5i),
        __param(6, remoteAgentService_1.$jm),
        __param(7, contextkey_1.$3i)
    ], $Csb);
});
//# sourceMappingURL=mainThreadTunnelService.js.map