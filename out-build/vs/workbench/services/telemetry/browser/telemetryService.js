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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/browser/1dsAppender", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/telemetry/browser/workbenchCommonProperties"], function (require, exports, lifecycle_1, configuration_1, extensions_1, log_1, productService_1, storage_1, _1dsAppender_1, telemetry_1, telemetryLogAppender_1, telemetryService_1, telemetryUtils_1, environmentService_1, remoteAgentService_1, workbenchCommonProperties_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$63b = void 0;
    let $63b = class $63b extends lifecycle_1.$kc {
        get sessionId() { return this.a.sessionId; }
        get machineId() { return this.a.machineId; }
        get firstSessionDate() { return this.a.firstSessionDate; }
        get msftInternal() { return this.a.msftInternal; }
        constructor(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService) {
            super();
            this.a = telemetryUtils_1.$bo;
            this.sendErrorTelemetry = true;
            this.a = this.b(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService);
            // When the level changes it could change from off to on and we want to make sure telemetry is properly intialized
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(telemetry_1.$dl)) {
                    this.a = this.b(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService);
                }
            }));
        }
        /**
         * Initializes the telemetry service to be a full fledged service.
         * This is only done once and only when telemetry is enabled as this will also ping the endpoint to
         * ensure its not adblocked and we can send telemetry
         */
        b(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService) {
            const telemetrySupported = (0, telemetryUtils_1.$ho)(productService, environmentService) && productService.aiConfig?.ariaKey;
            if (telemetrySupported && (0, telemetryUtils_1.$jo)(configurationService) !== 0 /* TelemetryLevel.NONE */ && this.a === telemetryUtils_1.$bo) {
                // If remote server is present send telemetry through that, else use the client side appender
                const appenders = [];
                const isInternal = (0, telemetryUtils_1.$mo)(productService, configurationService);
                const telemetryProvider = remoteAgentService.getConnection() !== null ? { log: remoteAgentService.logTelemetry.bind(remoteAgentService), flush: remoteAgentService.flushTelemetry.bind(remoteAgentService) } : new _1dsAppender_1.$33b(isInternal, 'monacoworkbench', null, productService.aiConfig?.ariaKey);
                appenders.push(telemetryProvider);
                appenders.push(new telemetryLogAppender_1.$43b(logService, loggerService, environmentService, productService));
                const config = {
                    appenders,
                    commonProperties: (0, workbenchCommonProperties_1.$53b)(storageService, productService.commit, productService.version, isInternal, environmentService.remoteAuthority, productService.embedderIdentifier, productService.removeTelemetryMachineId, environmentService.options && environmentService.options.resolveCommonTelemetryProperties),
                    sendErrorTelemetry: this.sendErrorTelemetry,
                };
                return this.B(new telemetryService_1.$Qq(config, configurationService, productService));
            }
            return this.a;
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
            this.a.publicLog(errorEventName, data);
        }
        publicLogError2(eventName, data) {
            this.publicLogError(eventName, data);
        }
    };
    exports.$63b = $63b;
    exports.$63b = $63b = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, log_1.$5i),
        __param(2, log_1.$6i),
        __param(3, configuration_1.$8h),
        __param(4, storage_1.$Vo),
        __param(5, productService_1.$kj),
        __param(6, remoteAgentService_1.$jm)
    ], $63b);
    (0, extensions_1.$mr)(telemetry_1.$9k, $63b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=telemetryService.js.map