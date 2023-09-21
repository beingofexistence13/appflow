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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/tunnelFactory", "vs/platform/tunnel/common/tunnel", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/log/common/log", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, nls, tunnel_1, lifecycle_1, environmentService_1, opener_1, uri_1, remoteExplorerService_1, log_1, contextkey_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QXb = void 0;
    let $QXb = class $QXb extends lifecycle_1.$kc {
        constructor(tunnelService, environmentService, a, remoteExplorerService, logService, contextKeyService) {
            super();
            this.a = a;
            const tunnelFactory = environmentService.options?.tunnelProvider?.tunnelFactory;
            if (tunnelFactory) {
                // At this point we clearly want the ports view/features since we have a tunnel factory
                contextKeyService.createKey(tunnelModel_1.$jJ.key, true);
                let privacyOptions = environmentService.options?.tunnelProvider?.features?.privacyOptions ?? [];
                if (environmentService.options?.tunnelProvider?.features?.public
                    && (privacyOptions.length === 0)) {
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
                this.B(tunnelService.setTunnelProvider({
                    forwardPort: async (tunnelOptions, tunnelCreationOptions) => {
                        let tunnelPromise;
                        try {
                            tunnelPromise = tunnelFactory(tunnelOptions, tunnelCreationOptions);
                        }
                        catch (e) {
                            logService.trace('tunnelFactory: tunnel provider error');
                        }
                        if (!tunnelPromise) {
                            return undefined;
                        }
                        let tunnel;
                        try {
                            tunnel = await tunnelPromise;
                        }
                        catch (e) {
                            logService.trace('tunnelFactory: tunnel provider promise error');
                            if (e instanceof Error) {
                                return e.message;
                            }
                            return undefined;
                        }
                        const localAddress = tunnel.localAddress.startsWith('http') ? tunnel.localAddress : `http://${tunnel.localAddress}`;
                        const remoteTunnel = {
                            tunnelRemotePort: tunnel.remoteAddress.port,
                            tunnelRemoteHost: tunnel.remoteAddress.host,
                            // The tunnel factory may give us an inaccessible local address.
                            // To make sure this doesn't happen, resolve the uri immediately.
                            localAddress: await this.b(localAddress),
                            privacy: tunnel.privacy ?? (tunnel.public ? tunnel_1.TunnelPrivacyId.Public : tunnel_1.TunnelPrivacyId.Private),
                            protocol: tunnel.protocol ?? tunnel_1.TunnelProtocol.Http,
                            dispose: async () => { await tunnel.dispose(); }
                        };
                        return remoteTunnel;
                    }
                }));
                const tunnelInformation = environmentService.options?.tunnelProvider?.features ?
                    {
                        features: {
                            elevation: !!environmentService.options?.tunnelProvider?.features?.elevation,
                            public: !!environmentService.options?.tunnelProvider?.features?.public,
                            privacyOptions
                        }
                    } : undefined;
                remoteExplorerService.setTunnelInformation(tunnelInformation);
            }
        }
        async b(uri) {
            try {
                return (await this.a.resolveExternalUri(uri_1.URI.parse(uri))).resolved.toString();
            }
            catch {
                return uri;
            }
        }
    };
    exports.$QXb = $QXb;
    exports.$QXb = $QXb = __decorate([
        __param(0, tunnel_1.$Wz),
        __param(1, environmentService_1.$LT),
        __param(2, opener_1.$NT),
        __param(3, remoteExplorerService_1.$tsb),
        __param(4, log_1.$5i),
        __param(5, contextkey_1.$3i)
    ], $QXb);
});
//# sourceMappingURL=tunnelFactory.js.map