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
define(["require", "exports", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/platform/remote/common/remoteAuthorityResolver", "vs/base/common/lifecycle", "vs/workbench/services/environment/common/environmentService"], function (require, exports, extHostCustomers_1, extHost_protocol_1, remoteAuthorityResolver_1, lifecycle_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jkb = void 0;
    let $Jkb = class $Jkb extends lifecycle_1.$kc {
        constructor(extHostContext, b, remoteAuthorityResolverService) {
            super();
            this.b = b;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostExtensionService);
            const remoteAuthority = this.b.remoteAuthority;
            if (remoteAuthority) {
                this.B(remoteAuthorityResolverService.onDidChangeConnectionData(() => {
                    const connectionData = remoteAuthorityResolverService.getConnectionData(remoteAuthority);
                    if (connectionData) {
                        this.a.$updateRemoteConnectionData(connectionData);
                    }
                }));
            }
        }
    };
    exports.$Jkb = $Jkb;
    exports.$Jkb = $Jkb = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, environmentService_1.$hJ),
        __param(2, remoteAuthorityResolver_1.$Jk)
    ], $Jkb);
});
//# sourceMappingURL=mainThreadRemoteConnectionData.js.map