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
define(["require", "exports", "vs/nls", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/tunnel/common/tunnel", "vs/base/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, nls, extHost_protocol_1, extHostTunnelService_1, extHostCustomers_1, remoteExplorerService_1, tunnel_1, lifecycle_1, notification_1, configuration_1, log_1, remoteAgentService_1, platform_1, configurationRegistry_1, contextkey_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTunnelService = void 0;
    let MainThreadTunnelService = class MainThreadTunnelService extends lifecycle_1.Disposable {
        constructor(extHostContext, remoteExplorerService, tunnelService, notificationService, configurationService, logService, remoteAgentService, contextKeyService) {
            super();
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
            this.notificationService = notificationService;
            this.configurationService = configurationService;
            this.logService = logService;
            this.remoteAgentService = remoteAgentService;
            this.contextKeyService = contextKeyService;
            this.elevateionRetry = false;
            this.portsAttributesProviders = new Map();
            this._alreadyRegistered = false;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTunnelService);
            this._register(tunnelService.onTunnelOpened(() => this._proxy.$onDidTunnelsChange()));
            this._register(tunnelService.onTunnelClosed(() => this._proxy.$onDidTunnelsChange()));
        }
        processFindingEnabled() {
            return (!!this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING) || this.tunnelService.hasTunnelProvider)
                && (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) !== remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_OUTPUT);
        }
        async $setRemoteTunnelService(processId) {
            this.remoteExplorerService.namedProcesses.set(processId, 'Code Extension Host');
            if (this.remoteExplorerService.portsFeaturesEnabled) {
                this._proxy.$registerCandidateFinder(this.processFindingEnabled());
            }
            else {
                this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => this._proxy.$registerCandidateFinder(this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING))));
            }
            this._register(this.configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING) || e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING)) {
                    return this._proxy.$registerCandidateFinder(this.processFindingEnabled());
                }
            }));
            this._register(this.tunnelService.onAddedTunnelProvider(() => {
                return this._proxy.$registerCandidateFinder(this.processFindingEnabled());
            }));
        }
        async $registerPortsAttributesProvider(selector, providerHandle) {
            this.portsAttributesProviders.set(providerHandle, selector);
            if (!this._alreadyRegistered) {
                this.remoteExplorerService.tunnelModel.addAttributesProvider(this);
                this._alreadyRegistered = true;
            }
        }
        async $unregisterPortsAttributesProvider(providerHandle) {
            this.portsAttributesProviders.delete(providerHandle);
        }
        async providePortAttributes(ports, pid, commandLine, token) {
            if (this.portsAttributesProviders.size === 0) {
                return [];
            }
            // Check all the selectors to make sure it's worth going to the extension host.
            const appropriateHandles = Array.from(this.portsAttributesProviders.entries()).filter(entry => {
                const selector = entry[1];
                const portRange = (typeof selector.portRange === 'number') ? [selector.portRange, selector.portRange + 1] : selector.portRange;
                const portInRange = portRange ? ports.some(port => portRange[0] <= port && port < portRange[1]) : true;
                const commandMatches = !selector.commandPattern || (commandLine && (commandLine.match(selector.commandPattern)));
                return portInRange && commandMatches;
            }).map(entry => entry[0]);
            if (appropriateHandles.length === 0) {
                return [];
            }
            return this._proxy.$providePortAttributes(appropriateHandles, ports, pid, commandLine, token);
        }
        async $openTunnel(tunnelOptions, source) {
            const tunnel = await this.remoteExplorerService.forward({
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
            if (!this.elevateionRetry
                && (tunnelOptions.localAddressPort !== undefined)
                && (tunnel.tunnelLocalPort !== undefined)
                && this.tunnelService.isPortPrivileged(tunnelOptions.localAddressPort)
                && (tunnel.tunnelLocalPort !== tunnelOptions.localAddressPort)
                && this.tunnelService.canElevate) {
                this.elevationPrompt(tunnelOptions, tunnel, source);
            }
            return extHostTunnelService_1.TunnelDtoConverter.fromServiceTunnel(tunnel);
        }
        async elevationPrompt(tunnelOptions, tunnel, source) {
            return this.notificationService.prompt(notification_1.Severity.Info, nls.localize('remote.tunnel.openTunnel', "The extension {0} has forwarded port {1}. You'll need to run as superuser to use port {2} locally.", source, tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort), [{
                    label: nls.localize('remote.tunnelsView.elevationButton', "Use Port {0} as Sudo...", tunnel.tunnelRemotePort),
                    run: async () => {
                        this.elevateionRetry = true;
                        await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                        await this.remoteExplorerService.forward({
                            remote: tunnelOptions.remoteAddress,
                            local: tunnelOptions.localAddressPort,
                            name: tunnelOptions.label,
                            source: {
                                source: tunnelModel_1.TunnelSource.Extension,
                                description: source
                            },
                            elevateIfNeeded: true
                        });
                        this.elevateionRetry = false;
                    }
                }]);
        }
        async $closeTunnel(remote) {
            return this.remoteExplorerService.close(remote, tunnelModel_1.TunnelCloseReason.Other);
        }
        async $getTunnels() {
            return (await this.tunnelService.tunnels).map(tunnel => {
                return {
                    remoteAddress: { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost },
                    localAddress: tunnel.localAddress,
                    privacy: tunnel.privacy,
                    protocol: tunnel.protocol
                };
            });
        }
        async $onFoundNewCandidates(candidates) {
            this.remoteExplorerService.onFoundNewCandidates(candidates);
        }
        async $setTunnelProvider(features) {
            const tunnelProvider = {
                forwardPort: (tunnelOptions, tunnelCreationOptions) => {
                    const forward = this._proxy.$forwardPort(tunnelOptions, tunnelCreationOptions);
                    return forward.then(tunnelOrError => {
                        if (!tunnelOrError) {
                            return undefined;
                        }
                        else if (typeof tunnelOrError === 'string') {
                            return tunnelOrError;
                        }
                        const tunnel = tunnelOrError;
                        this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) New tunnel established by tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
                        return {
                            tunnelRemotePort: tunnel.remoteAddress.port,
                            tunnelRemoteHost: tunnel.remoteAddress.host,
                            localAddress: typeof tunnel.localAddress === 'string' ? tunnel.localAddress : (0, tunnelModel_1.makeAddress)(tunnel.localAddress.host, tunnel.localAddress.port),
                            tunnelLocalPort: typeof tunnel.localAddress !== 'string' ? tunnel.localAddress.port : undefined,
                            public: tunnel.public,
                            privacy: tunnel.privacy,
                            protocol: tunnel.protocol ?? tunnel_1.TunnelProtocol.Http,
                            dispose: async (silent) => {
                                this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) Closing tunnel from tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
                                return this._proxy.$closeTunnel({ host: tunnel.remoteAddress.host, port: tunnel.remoteAddress.port }, silent);
                            }
                        };
                    });
                }
            };
            if (features) {
                this.tunnelService.setTunnelFeatures(features);
            }
            this.tunnelService.setTunnelProvider(tunnelProvider);
            // At this point we clearly want the ports view/features since we have a tunnel factory
            this.contextKeyService.createKey(tunnelModel_1.forwardedPortsViewEnabled.key, true);
        }
        async $setCandidateFilter() {
            this.remoteExplorerService.setCandidateFilter((candidates) => {
                return this._proxy.$applyCandidateFilter(candidates);
            });
        }
        async $setCandidatePortSource(source) {
            // Must wait for the remote environment before trying to set settings there.
            this.remoteAgentService.getEnvironment().then(() => {
                switch (source) {
                    case extHost_protocol_1.CandidatePortSource.None: {
                        platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
                            .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPorts': false } }]);
                        break;
                    }
                    case extHost_protocol_1.CandidatePortSource.Output: {
                        platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
                            .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
                        break;
                    }
                    default: // Do nothing, the defaults for these settings should be used.
                }
            }).catch(() => {
                // The remote failed to get setup. Errors from that area will already be surfaced to the user.
            });
        }
    };
    exports.MainThreadTunnelService = MainThreadTunnelService;
    exports.MainThreadTunnelService = MainThreadTunnelService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTunnelService),
        __param(1, remoteExplorerService_1.IRemoteExplorerService),
        __param(2, tunnel_1.ITunnelService),
        __param(3, notification_1.INotificationService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, log_1.ILogService),
        __param(6, remoteAgentService_1.IRemoteAgentService),
        __param(7, contextkey_1.IContextKeyService)
    ], MainThreadTunnelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFR1bm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZFR1bm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBS3RELFlBQ0MsY0FBK0IsRUFDUCxxQkFBOEQsRUFDdEUsYUFBOEMsRUFDeEMsbUJBQTBELEVBQ3pELG9CQUE0RCxFQUN0RSxVQUF3QyxFQUNoQyxrQkFBd0QsRUFDekQsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBUmlDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDckQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3ZCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNyRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBWG5FLG9CQUFlLEdBQVksS0FBSyxDQUFDO1lBQ2pDLDZCQUF3QixHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBd0MxRSx1QkFBa0IsR0FBWSxLQUFLLENBQUM7WUEzQjNDLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVPLHFCQUFxQjtZQUM1QixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsaURBQXlCLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDO21CQUM1RyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsZ0RBQXdCLENBQUMsS0FBSyx1REFBK0IsQ0FBQyxDQUFDO1FBQ3hHLENBQUM7UUFFRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsU0FBaUI7WUFDOUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDaEYsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQzthQUNuRTtpQkFBTTtnQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsaURBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM3SztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDN0UsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsaURBQXlCLENBQUMsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsZ0RBQXdCLENBQUMsRUFBRTtvQkFDMUcsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7aUJBQzFFO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBR0QsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLFFBQWdDLEVBQUUsY0FBc0I7WUFDOUYsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQzthQUMvQjtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsa0NBQWtDLENBQUMsY0FBc0I7WUFDOUQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEtBQWUsRUFBRSxHQUF1QixFQUFFLFdBQStCLEVBQUUsS0FBd0I7WUFDOUgsSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtnQkFDN0MsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELCtFQUErRTtZQUMvRSxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3RixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sU0FBUyxHQUFHLENBQUMsT0FBTyxRQUFRLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDL0gsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDdkcsTUFBTSxjQUFjLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqSCxPQUFPLFdBQVcsSUFBSSxjQUFjLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUIsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLGFBQTRCLEVBQUUsTUFBYztZQUM3RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZELE1BQU0sRUFBRSxhQUFhLENBQUMsYUFBYTtnQkFDbkMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0I7Z0JBQ3JDLElBQUksRUFBRSxhQUFhLENBQUMsS0FBSztnQkFDekIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSwwQkFBWSxDQUFDLFNBQVM7b0JBQzlCLFdBQVcsRUFBRSxNQUFNO2lCQUNuQjtnQkFDRCxlQUFlLEVBQUUsS0FBSzthQUN0QixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLEVBQUU7Z0JBQzVDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO21CQUNyQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLENBQUM7bUJBQzlDLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLENBQUM7bUJBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDO21CQUNuRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEtBQUssYUFBYSxDQUFDLGdCQUFnQixDQUFDO21CQUMzRCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRTtnQkFFbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsT0FBTyx5Q0FBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRU8sS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUE0QixFQUFFLE1BQW9CLEVBQUUsTUFBYztZQUMvRixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsdUJBQVEsQ0FBQyxJQUFJLEVBQ25ELEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsb0dBQW9HLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUN4TixDQUFDO29CQUNBLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9DQUFvQyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDN0csR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFO3dCQUNmLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO3dCQUM1QixNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSwrQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbEksTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDOzRCQUN4QyxNQUFNLEVBQUUsYUFBYSxDQUFDLGFBQWE7NEJBQ25DLEtBQUssRUFBRSxhQUFhLENBQUMsZ0JBQWdCOzRCQUNyQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEtBQUs7NEJBQ3pCLE1BQU0sRUFBRTtnQ0FDUCxNQUFNLEVBQUUsMEJBQVksQ0FBQyxTQUFTO2dDQUM5QixXQUFXLEVBQUUsTUFBTTs2QkFDbkI7NEJBQ0QsZUFBZSxFQUFFLElBQUk7eUJBQ3JCLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztvQkFDOUIsQ0FBQztpQkFDRCxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQXNDO1lBQ3hELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsK0JBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXO1lBQ2hCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0RCxPQUFPO29CQUNOLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDL0UsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO29CQUNqQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87b0JBQ3ZCLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtpQkFDekIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxVQUEyQjtZQUN0RCxJQUFJLENBQUMscUJBQXFCLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFpQztZQUN6RCxNQUFNLGNBQWMsR0FBb0I7Z0JBQ3ZDLFdBQVcsRUFBRSxDQUFDLGFBQTRCLEVBQUUscUJBQTRDLEVBQUUsRUFBRTtvQkFDM0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLHFCQUFxQixDQUFDLENBQUM7b0JBQy9FLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTt3QkFDbkMsSUFBSSxDQUFDLGFBQWEsRUFBRTs0QkFDbkIsT0FBTyxTQUFTLENBQUM7eUJBQ2pCOzZCQUFNLElBQUksT0FBTyxhQUFhLEtBQUssUUFBUSxFQUFFOzRCQUM3QyxPQUFPLGFBQWEsQ0FBQzt5QkFDckI7d0JBQ0QsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDO3dCQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx3RkFBd0YsTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUUxSyxPQUFPOzRCQUNOLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSTs0QkFDM0MsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJOzRCQUMzQyxZQUFZLEVBQUUsT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBQSx5QkFBVyxFQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDOzRCQUM3SSxlQUFlLEVBQUUsT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVM7NEJBQy9GLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTs0QkFDckIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPOzRCQUN2QixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsSUFBSSx1QkFBYyxDQUFDLElBQUk7NEJBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBZ0IsRUFBRSxFQUFFO2dDQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxrRkFBa0YsTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dDQUNwSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUMvRyxDQUFDO3lCQUNELENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQzthQUNELENBQUM7WUFDRixJQUFJLFFBQVEsRUFBRTtnQkFDYixJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyRCx1RkFBdUY7WUFDdkYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyx1Q0FBeUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELEtBQUssQ0FBQyxtQkFBbUI7WUFDeEIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBMkIsRUFBNEIsRUFBRTtnQkFDdkcsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxNQUEyQjtZQUN4RCw0RUFBNEU7WUFDNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xELFFBQVEsTUFBTSxFQUFFO29CQUNmLEtBQUssc0NBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzlCLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUM7NkJBQ3hFLDZCQUE2QixDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSx5QkFBeUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDdkYsTUFBTTtxQkFDTjtvQkFDRCxLQUFLLHNDQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoQyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDOzZCQUN4RSw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsK0JBQStCLEVBQUUsdURBQStCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDdkgsTUFBTTtxQkFDTjtvQkFDRCxRQUFRLENBQUMsOERBQThEO2lCQUN2RTtZQUNGLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ2IsOEZBQThGO1lBQy9GLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUEvTVksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFEbkMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLHVCQUF1QixDQUFDO1FBUXZELFdBQUEsOENBQXNCLENBQUE7UUFDdEIsV0FBQSx1QkFBYyxDQUFBO1FBQ2QsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSwrQkFBa0IsQ0FBQTtPQWJSLHVCQUF1QixDQStNbkMifQ==