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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/tunnel/common/tunnel", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypes"], function (require, exports, cancellation_1, event_1, lifecycle_1, nls, instantiation_1, log_1, tunnel_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTunnelService = exports.IExtHostTunnelService = exports.TunnelDtoConverter = void 0;
    class ExtensionTunnel extends tunnel_1.DisposableTunnel {
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
    exports.IExtHostTunnelService = (0, instantiation_1.createDecorator)('IExtHostTunnelService');
    let ExtHostTunnelService = class ExtHostTunnelService extends lifecycle_1.Disposable {
        constructor(extHostRpc, initData, logService) {
            super();
            this.logService = logService;
            this._showCandidatePort = () => { return Promise.resolve(true); };
            this._extensionTunnels = new Map();
            this._onDidChangeTunnels = new event_1.Emitter();
            this.onDidChangeTunnels = this._onDidChangeTunnels.event;
            this._providerHandleCounter = 0;
            this._portAttributesProviders = new Map();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTunnelService);
        }
        async openTunnel(extension, forward) {
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) ${extension.identifier.value} called openTunnel API for ${forward.remoteAddress.host}:${forward.remoteAddress.port}.`);
            const tunnel = await this._proxy.$openTunnel(forward, extension.displayName);
            if (tunnel) {
                const disposableTunnel = new ExtensionTunnel(tunnel.remoteAddress, tunnel.localAddress, () => {
                    return this._proxy.$closeTunnel(tunnel.remoteAddress);
                });
                this._register(disposableTunnel);
                return disposableTunnel;
            }
            return undefined;
        }
        async getTunnels() {
            return this._proxy.$getTunnels();
        }
        nextPortAttributesProviderHandle() {
            return this._providerHandleCounter++;
        }
        registerPortsAttributesProvider(portSelector, provider) {
            const providerHandle = this.nextPortAttributesProviderHandle();
            this._portAttributesProviders.set(providerHandle, { selector: portSelector, provider });
            this._proxy.$registerPortsAttributesProvider(portSelector, providerHandle);
            return new types.Disposable(() => {
                this._portAttributesProviders.delete(providerHandle);
                this._proxy.$unregisterPortsAttributesProvider(providerHandle);
            });
        }
        async $providePortAttributes(handles, ports, pid, commandLine, cancellationToken) {
            const providedAttributes = [];
            for (const handle of handles) {
                const provider = this._portAttributesProviders.get(handle);
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
            if (this._forwardPortProvider) {
                throw new Error('A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used.');
            }
            this._forwardPortProvider = async (tunnelOptions, tunnelCreationOptions) => {
                const result = await provider.provideTunnel(tunnelOptions, tunnelCreationOptions, new cancellation_1.CancellationTokenSource().token);
                return result ?? undefined;
            };
            const tunnelFeatures = information.tunnelFeatures ? {
                elevation: !!information.tunnelFeatures?.elevation,
                privacyOptions: information.tunnelFeatures?.privacyOptions
            } : undefined;
            this._proxy.$setTunnelProvider(tunnelFeatures);
            return Promise.resolve((0, lifecycle_1.toDisposable)(() => {
                this._forwardPortProvider = undefined;
                this._proxy.$setTunnelProvider(undefined);
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
                    this._proxy.$setCandidatePortSource(provider.candidatePortSource);
                }
                if (provider.showCandidatePort) {
                    this._showCandidatePort = provider.showCandidatePort;
                    this._proxy.$setCandidateFilter();
                }
                const tunnelFactory = provider.tunnelFactory ?? (managedRemoteAuthority ? this.makeManagedTunnelFactory(managedRemoteAuthority) : undefined);
                if (tunnelFactory) {
                    this._forwardPortProvider = tunnelFactory;
                    let privacyOptions = provider.tunnelFeatures?.privacyOptions ?? [];
                    if (provider.tunnelFeatures?.public && (privacyOptions.length === 0)) {
                        privacyOptions = [
                            {
                                id: 'private',
                                label: nls.localize('tunnelPrivacy.private', "Private"),
                                themeIcon: 'lock'
                            },
                            {
                                id: 'public',
                                label: nls.localize('tunnelPrivacy.public', "Public"),
                                themeIcon: 'eye'
                            }
                        ];
                    }
                    const tunnelFeatures = provider.tunnelFeatures ? {
                        elevation: !!provider.tunnelFeatures?.elevation,
                        public: !!provider.tunnelFeatures?.public,
                        privacyOptions
                    } : undefined;
                    this._proxy.$setTunnelProvider(tunnelFeatures);
                }
            }
            else {
                this._forwardPortProvider = undefined;
            }
            return (0, lifecycle_1.toDisposable)(() => {
                this._forwardPortProvider = undefined;
            });
        }
        makeManagedTunnelFactory(_authority) {
            return undefined; // may be overridden
        }
        async $closeTunnel(remote, silent) {
            if (this._extensionTunnels.has(remote.host)) {
                const hostMap = this._extensionTunnels.get(remote.host);
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
            this._onDidChangeTunnels.fire();
        }
        async $forwardPort(tunnelOptions, tunnelCreationOptions) {
            if (this._forwardPortProvider) {
                try {
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider.');
                    const providedPort = this._forwardPortProvider(tunnelOptions, tunnelCreationOptions);
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider.');
                    if (providedPort !== undefined) {
                        const tunnel = await providedPort;
                        this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider.');
                        if (tunnel === undefined) {
                            this.logService.error('ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined');
                            return undefined;
                        }
                        if (!this._extensionTunnels.has(tunnelOptions.remoteAddress.host)) {
                            this._extensionTunnels.set(tunnelOptions.remoteAddress.host, new Map());
                        }
                        const disposeListener = this._register(tunnel.onDidDispose(() => {
                            this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel\'s onDidDispose.');
                            return this._proxy.$closeTunnel(tunnel.remoteAddress);
                        }));
                        this._extensionTunnels.get(tunnelOptions.remoteAddress.host).set(tunnelOptions.remoteAddress.port, { tunnel, disposeListener });
                        return TunnelDtoConverter.fromApiTunnel(tunnel);
                    }
                    else {
                        this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined');
                    }
                }
                catch (e) {
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) tunnel provider error');
                    if (e instanceof Error) {
                        return e.message;
                    }
                }
            }
            return undefined;
        }
        async $applyCandidateFilter(candidates) {
            const filter = await Promise.all(candidates.map(candidate => this._showCandidatePort(candidate.host, candidate.port, candidate.detail ?? '')));
            const result = candidates.filter((candidate, index) => filter[index]);
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) filtered from ${candidates.map(port => port.port).join(', ')} to ${result.map(port => port.port).join(', ')}`);
            return result;
        }
    };
    exports.ExtHostTunnelService = ExtHostTunnelService;
    exports.ExtHostTunnelService = ExtHostTunnelService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, log_1.ILogService)
    ], ExtHostTunnelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR1bm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VHVubmVsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQmhHLE1BQU0sZUFBZ0IsU0FBUSx5QkFBZ0I7S0FBNkI7SUFFM0UsSUFBaUIsa0JBQWtCLENBc0JsQztJQXRCRCxXQUFpQixrQkFBa0I7UUFDbEMsU0FBZ0IsYUFBYSxDQUFDLE1BQXFCO1lBQ2xELE9BQU87Z0JBQ04sYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhO2dCQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7Z0JBQ2pDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU07Z0JBQ3ZCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHdCQUFlLENBQUMsT0FBTyxDQUFDO2dCQUM3RixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7YUFDekIsQ0FBQztRQUNILENBQUM7UUFSZSxnQ0FBYSxnQkFRNUIsQ0FBQTtRQUNELFNBQWdCLGlCQUFpQixDQUFDLE1BQW9CO1lBQ3JELE9BQU87Z0JBQ04sYUFBYSxFQUFFO29CQUNkLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCO29CQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtpQkFDN0I7Z0JBQ0QsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO2dCQUNqQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sS0FBSyx3QkFBZSxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLHdCQUFlLENBQUMsZUFBZTtnQkFDaEgsT0FBTyxFQUFF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