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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostRpcService"], function (require, exports, instantiation_1, log_1, extHostProtocol, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bbc = exports.$abc = exports.$_ac = void 0;
    exports.$_ac = (0, instantiation_1.$Bh)('IExtHostApiDeprecationService');
    let $abc = class $abc {
        constructor(rpc, c) {
            this.c = c;
            this.a = new Set();
            this.b = rpc.getProxy(extHostProtocol.$1J.MainThreadTelemetry);
        }
        report(apiId, extension, migrationSuggestion) {
            const key = this.d(apiId, extension);
            if (this.a.has(key)) {
                return;
            }
            this.a.add(key);
            if (extension.isUnderDevelopment) {
                this.c.warn(`[Deprecation Warning] '${apiId}' is deprecated. ${migrationSuggestion}`);
            }
            this.b.$publicLog2('extHostDeprecatedApiUsage', {
                extensionId: extension.identifier.value,
                apiId: apiId,
            });
        }
        d(apiId, extension) {
            return `${apiId}-${extension.identifier.value}`;
        }
    };
    exports.$abc = $abc;
    exports.$abc = $abc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, log_1.$5i)
    ], $abc);
    exports.$bbc = Object.freeze(new class {
        report(_apiId, _extension, _warningMessage) {
            // noop
        }
    }());
});
//# sourceMappingURL=extHostApiDeprecationService.js.map