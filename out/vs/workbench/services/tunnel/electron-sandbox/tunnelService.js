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
    exports.TunnelService = void 0;
    let SharedProcessTunnel = class SharedProcessTunnel extends lifecycle_1.Disposable {
        constructor(_id, _addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort, localAddress, _onBeforeDispose, _sharedProcessTunnelService, _remoteAuthorityResolverService) {
            super();
            this._id = _id;
            this._addressProvider = _addressProvider;
            this.tunnelRemoteHost = tunnelRemoteHost;
            this.tunnelRemotePort = tunnelRemotePort;
            this.tunnelLocalPort = tunnelLocalPort;
            this.localAddress = localAddress;
            this._onBeforeDispose = _onBeforeDispose;
            this._sharedProcessTunnelService = _sharedProcessTunnelService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this.privacy = tunnel_1.TunnelPrivacyId.Private;
            this.protocol = undefined;
            this._updateAddress();
            this._register(this._remoteAuthorityResolverService.onDidChangeConnectionData(() => this._updateAddress()));
        }
        _updateAddress() {
            this._addressProvider.getAddress().then((address) => {
                this._sharedProcessTunnelService.setAddress(this._id, address);
            });
        }
        async dispose() {
            this._onBeforeDispose();
            super.dispose();
            await this._sharedProcessTunnelService.destroyTunnel(this._id);
        }
    };
    SharedProcessTunnel = __decorate([
        __param(7, sharedProcessTunnelService_1.ISharedProcessTunnelService),
        __param(8, remoteAuthorityResolver_1.IRemoteAuthorityResolverService)
    ], SharedProcessTunnel);
    let TunnelService = class TunnelService extends tunnel_1.AbstractTunnelService {
        constructor(logService, _environmentService, _sharedProcessTunnelService, _instantiationService, lifecycleService, _nativeWorkbenchEnvironmentService, configurationService) {
            super(logService, configurationService);
            this._environmentService = _environmentService;
            this._sharedProcessTunnelService = _sharedProcessTunnelService;
            this._instantiationService = _instantiationService;
            this._nativeWorkbenchEnvironmentService = _nativeWorkbenchEnvironmentService;
            this._activeSharedProcessTunnels = new Set();
            // Destroy any shared process tunnels that might still be active
            lifecycleService.onDidShutdown(() => {
                this._activeSharedProcessTunnels.forEach((id) => {
                    this._sharedProcessTunnelService.destroyTunnel(id);
                });
            });
        }
        isPortPrivileged(port) {
            return (0, tunnel_1.isPortPrivileged)(port, this.defaultTunnelHost, platform_1.OS, this._nativeWorkbenchEnvironmentService.os.release);
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
                const tunnel = this._createSharedProcessTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded);
                this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created without provider.');
                this.addTunnelToMap(remoteHost, remotePort, tunnel);
                return tunnel;
            }
        }
        async _createSharedProcessTunnel(addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
            const { id } = await this._sharedProcessTunnelService.createTunnel();
            this._activeSharedProcessTunnels.add(id);
            const authority = this._environmentService.remoteAuthority;
            const result = await this._sharedProcessTunnelService.startTunnel(authority, id, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded);
            const tunnel = this._instantiationService.createInstance(SharedProcessTunnel, id, addressProvider, tunnelRemoteHost, tunnelRemotePort, result.tunnelLocalPort, result.localAddress, () => {
                this._activeSharedProcessTunnels.delete(id);
            });
            return tunnel;
        }
        canTunnel(uri) {
            return super.canTunnel(uri) && !!this._environmentService.remoteAuthority;
        }
    };
    exports.TunnelService = TunnelService;
    exports.TunnelService = TunnelService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, sharedProcessTunnelService_1.ISharedProcessTunnelService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, lifecycle_2.ILifecycleService),
        __param(5, environmentService_2.INativeWorkbenchEnvironmentService),
        __param(6, configuration_1.IConfigurationService)
    ], TunnelService);
    (0, extensions_1.registerSingleton)(tunnel_1.ITunnelService, TunnelService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90dW5uZWwvZWxlY3Ryb24tc2FuZGJveC90dW5uZWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEcsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQUszQyxZQUNrQixHQUFXLEVBQ1gsZ0JBQWtDLEVBQ25DLGdCQUF3QixFQUN4QixnQkFBd0IsRUFDeEIsZUFBbUMsRUFDbkMsWUFBb0IsRUFDbkIsZ0JBQTRCLEVBQ2hCLDJCQUF5RSxFQUNyRSwrQkFBaUY7WUFFbEgsS0FBSyxFQUFFLENBQUM7WUFWUyxRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQ1gscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNuQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVE7WUFDeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFvQjtZQUNuQyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUNuQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVk7WUFDQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1lBQ3BELG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBaUM7WUFabkcsWUFBTyxHQUFHLHdCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2xDLGFBQVEsR0FBdUIsU0FBUyxDQUFDO1lBY3hELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdHLENBQUM7UUFFTyxjQUFjO1lBQ3JCLElB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