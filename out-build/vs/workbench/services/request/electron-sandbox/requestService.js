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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/request/browser/requestService", "vs/platform/instantiation/common/extensions", "vs/platform/request/common/request", "vs/platform/native/common/native"], function (require, exports, configuration_1, log_1, requestService_1, extensions_1, request_1, native_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G_b = void 0;
    let $G_b = class $G_b extends requestService_1.$C2b {
        constructor(configurationService, loggerService, g) {
            super(configurationService, loggerService);
            this.g = g;
        }
        async resolveProxy(url) {
            return this.g.resolveProxy(url);
        }
    };
    exports.$G_b = $G_b;
    exports.$G_b = $G_b = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, log_1.$6i),
        __param(2, native_1.$05b)
    ], $G_b);
    (0, extensions_1.$mr)(request_1.$Io, $G_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=requestService.js.map