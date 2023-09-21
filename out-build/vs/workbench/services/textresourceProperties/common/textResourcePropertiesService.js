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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/platform", "vs/base/common/network", "vs/platform/storage/common/storage", "vs/workbench/services/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, configuration_1, textResourceConfiguration_1, platform_1, network_1, storage_1, environmentService_1, extensions_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3yb = void 0;
    let $3yb = class $3yb {
        constructor(b, remoteAgentService, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = null;
            remoteAgentService.getEnvironment().then(remoteEnv => this.a = remoteEnv);
        }
        getEOL(resource, language) {
            const eol = this.b.getValue('files.eol', { overrideIdentifier: language, resource });
            if (eol && typeof eol === 'string' && eol !== 'auto') {
                return eol;
            }
            const os = this.e(resource);
            return os === 3 /* OperatingSystem.Linux */ || os === 2 /* OperatingSystem.Macintosh */ ? '\n' : '\r\n';
        }
        e(resource) {
            let os = platform_1.OS;
            const remoteAuthority = this.c.remoteAuthority;
            if (remoteAuthority) {
                if (resource && resource.scheme !== network_1.Schemas.file) {
                    const osCacheKey = `resource.authority.os.${remoteAuthority}`;
                    os = this.a ? this.a.os : /* Get it from cache */ this.d.getNumber(osCacheKey, 1 /* StorageScope.WORKSPACE */, platform_1.OS);
                    this.d.store(osCacheKey, os, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            }
            return os;
        }
    };
    exports.$3yb = $3yb;
    exports.$3yb = $3yb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, remoteAgentService_1.$jm),
        __param(2, environmentService_1.$hJ),
        __param(3, storage_1.$Vo)
    ], $3yb);
    (0, extensions_1.$mr)(textResourceConfiguration_1.$GA, $3yb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=textResourcePropertiesService.js.map