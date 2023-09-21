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
    exports.$n4b = void 0;
    let $n4b = class $n4b extends tunnel_1.$7z {
        constructor(logService, d, configurationService) {
            super(logService, configurationService);
            this.d = d;
        }
        isPortPrivileged(_port) {
            return false;
        }
        s(tunnelProvider, remoteHost, remotePort, _localHost, localPort, elevateIfNeeded, privacy, protocol) {
            const existing = this.r(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            if ((0, tunnel_1.$Yz)(tunnelProvider)) {
                return this.t(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
            }
            return undefined;
        }
        canTunnel(uri) {
            return super.canTunnel(uri) && !!this.d.remoteAuthority;
        }
    };
    exports.$n4b = $n4b;
    exports.$n4b = $n4b = __decorate([
        __param(0, log_1.$5i),
        __param(1, environmentService_1.$hJ),
        __param(2, configuration_1.$8h)
    ], $n4b);
    (0, extensions_1.$mr)(tunnel_1.$Wz, $n4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=tunnelService.js.map