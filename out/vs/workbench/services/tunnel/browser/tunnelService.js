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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/tunnel/common/tunnel", "vs/workbench/services/environment/common/environmentService"], function (require, exports, configuration_1, extensions_1, log_1, tunnel_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelService = void 0;
    let TunnelService = class TunnelService extends tunnel_1.AbstractTunnelService {
        constructor(logService, environmentService, configurationService) {
            super(logService, configurationService);
            this.environmentService = environmentService;
        }
        isPortPrivileged(_port) {
            return false;
        }
        retainOrCreateTunnel(tunnelProvider, remoteHost, remotePort, _localHost, localPort, elevateIfNeeded, privacy, protocol) {
            const existing = this.getTunnelFromMap(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            if ((0, tunnel_1.isTunnelProvider)(tunnelProvider)) {
                return this.createWithProvider(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
            }
            return undefined;
        }
        canTunnel(uri) {
            return super.canTunnel(uri) && !!this.environmentService.remoteAuthority;
        }
    };
    exports.TunnelService = TunnelService;
    exports.TunnelService = TunnelService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, configuration_1.IConfigurationService)
    ], TunnelService);
    (0, extensions_1.registerSingleton)(tunnel_1.ITunnelService, TunnelService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90dW5uZWwvYnJvd3Nlci90dW5uZWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsOEJBQXFCO1FBQ3ZELFlBQ2MsVUFBdUIsRUFDRSxrQkFBZ0QsRUFDL0Qsb0JBQTJDO1lBRWxFLEtBQUssQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUhGLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7UUFJdkYsQ0FBQztRQUVNLGdCQUFnQixDQUFDLEtBQWE7WUFDcEMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRVMsb0JBQW9CLENBQUMsY0FBa0QsRUFBRSxVQUFrQixFQUFFLFVBQWtCLEVBQUUsVUFBa0IsRUFBRSxTQUE2QixFQUFFLGVBQXdCLEVBQUUsT0FBZ0IsRUFBRSxRQUFpQjtZQUMxTyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQy9ELElBQUksUUFBUSxFQUFFO2dCQUNiLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFDcEIsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxJQUFBLHlCQUFnQixFQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUNyQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN0SDtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFUSxTQUFTLENBQUMsR0FBUTtZQUMxQixPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7UUFDMUUsQ0FBQztLQUNELENBQUE7SUE3Qlksc0NBQWE7NEJBQWIsYUFBYTtRQUV2QixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEscUNBQXFCLENBQUE7T0FKWCxhQUFhLENBNkJ6QjtJQUVELElBQUEsOEJBQWlCLEVBQUMsdUJBQWMsRUFBRSxhQUFhLG9DQUE0QixDQUFDIn0=