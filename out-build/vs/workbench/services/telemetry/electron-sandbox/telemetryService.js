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
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/product/common/productService", "vs/platform/ipc/electron-sandbox/services", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/storage/common/storage", "vs/workbench/services/telemetry/common/workbenchCommonProperties", "vs/platform/telemetry/common/telemetryService", "vs/platform/instantiation/common/extensions", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, telemetry_1, telemetryUtils_1, configuration_1, lifecycle_1, environmentService_1, productService_1, services_1, telemetryIpc_1, storage_1, workbenchCommonProperties_1, telemetryService_1, extensions_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U_b = void 0;
    let $U_b = class $U_b extends lifecycle_1.$kc {
        get sessionId() { return this.a.sessionId; }
        get machineId() { return this.a.machineId; }
        get firstSessionDate() { return this.a.firstSessionDate; }
        get msftInternal() { return this.a.msftInternal; }
        constructor(environmentService, productService, sharedProcessService, storageService, configurationService) {
            super();
            if ((0, telemetryUtils_1.$ho)(productService, environmentService)) {
                const isInternal = (0, telemetryUtils_1.$mo)(productService, configurationService);
                const channel = sharedProcessService.getChannel('telemetryAppender');
                const config = {
                    appenders: [new telemetryIpc_1.$C6b(channel)],
                    commonProperties: (0, workbenchCommonProperties_1.$T_b)(storageService, environmentService.os.release, environmentService.os.hostname, productService.commit, productService.version, environmentService.machineId, isInternal, globals_1.$P, environmentService.remoteAuthority),
                    piiPaths: (0, telemetryUtils_1.$no)(environmentService),
                    sendErrorTelemetry: true
                };
                this.a = this.B(new telemetryService_1.$Qq(config, configurationService, productService));
            }
            else {
                this.a = telemetryUtils_1.$bo;
            }
            this.sendErrorTelemetry = this.a.sendErrorTelemetry;
        }
        setExperimentProperty(name, value) {
            return this.a.setExperimentProperty(name, value);
        }
        get telemetryLevel() {
            return this.a.telemetryLevel;
        }
        publicLog(eventName, data) {
            this.a.publicLog(eventName, data);
        }
        publicLog2(eventName, data) {
            this.publicLog(eventName, data);
        }
        publicLogError(errorEventName, data) {
            this.a.publicLogError(errorEventName, data);
        }
        publicLogError2(eventName, data) {
            this.publicLogError(eventName, data);
        }
    };
    exports.$U_b = $U_b;
    exports.$U_b = $U_b = __decorate([
        __param(0, environmentService_1.$1$b),
        __param(1, productService_1.$kj),
        __param(2, services_1.$A7b),
        __param(3, storage_1.$Vo),
        __param(4, configuration_1.$8h)
    ], $U_b);
    (0, extensions_1.$mr)(telemetry_1.$9k, $U_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=telemetryService.js.map