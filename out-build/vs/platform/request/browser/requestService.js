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
define(["require", "exports", "vs/base/parts/request/browser/request", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/request/common/request"], function (require, exports, request_1, configuration_1, log_1, request_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$C2b = void 0;
    /**
     * This service exposes the `request` API, while using the global
     * or configured proxy settings.
     */
    let $C2b = class $C2b extends request_2.$Jo {
        constructor(f, loggerService) {
            super(loggerService);
            this.f = f;
        }
        async request(options, token) {
            if (!options.proxyAuthorization) {
                options.proxyAuthorization = this.f.getValue('http.proxyAuthorization');
            }
            return this.c('browser', options, () => (0, request_1.$mT)(options, token));
        }
        async resolveProxy(url) {
            return undefined; // not implemented in the web
        }
    };
    exports.$C2b = $C2b;
    exports.$C2b = $C2b = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, log_1.$6i)
    ], $C2b);
});
//# sourceMappingURL=requestService.js.map