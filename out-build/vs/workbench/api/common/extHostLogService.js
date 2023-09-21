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
define(["require", "exports", "vs/nls!vs/workbench/api/common/extHostLogService", "vs/platform/log/common/log", "vs/platform/log/common/logService", "vs/workbench/api/common/extHostInitDataService"], function (require, exports, nls_1, log_1, logService_1, extHostInitDataService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ddc = void 0;
    let $ddc = class $ddc extends logService_1.$mN {
        constructor(isWorker, loggerService, initData) {
            const id = initData.remote.isRemote ? 'remoteexthost' : isWorker ? 'workerexthost' : 'exthost';
            const name = initData.remote.isRemote ? (0, nls_1.localize)(0, null) : isWorker ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null);
            super(loggerService.createLogger(id, { name }));
        }
    };
    exports.$ddc = $ddc;
    exports.$ddc = $ddc = __decorate([
        __param(1, log_1.$6i),
        __param(2, extHostInitDataService_1.$fM)
    ], $ddc);
});
//# sourceMappingURL=extHostLogService.js.map