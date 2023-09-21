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
    exports.TelemetryService = void 0;
    let TelemetryService = class TelemetryService extends lifecycle_1.Disposable {
        get sessionId() { return this.impl.sessionId; }
        get machineId() { return this.impl.machineId; }
        get firstSessionDate() { return this.impl.firstSessionDate; }
        get msftInternal() { return this.impl.msftInternal; }
        constructor(environmentService, productService, sharedProcessService, storageService, configurationService) {
            super();
            if ((0, telemetryUtils_1.supportsTelemetry)(productService, environmentService)) {
                const isInternal = (0, telemetryUtils_1.isInternalTelemetry)(productService, configurationService);
                const channel = sharedProcessService.getChannel('telemetryAppender');
                const config = {
                    appenders: [new telemetryIpc_1.TelemetryAppenderClient(channel)],
                    commonProperties: (0, workbenchCommonProperties_1.resolveWorkbenchCommonProperties)(storageService, environmentService.os.release, environmentService.os.hostname, productService.commit, productService.version, environmentService.machineId, isInternal, globals_1.process, environmentService.remoteAuthority),
                    piiPaths: (0, telemetryUtils_1.getPiiPathsFromEnvironment)(environmentService),
                    sendErrorTelemetry: true
                };
                this.impl = this._register(new telemetryService_1.TelemetryService(config, configurationService, productService));
            }
            else {
                this.impl = telemetryUtils_1.NullTelemetryService;
            }
            this.sendErrorTelemetry = this.impl.sendErrorTelemetry;
        }
        setExperimentProperty(name, value) {
            return this.impl.setExperimentProperty(name, value);
        }
        get telemetryLevel() {
            return this.impl.telemetryLevel;
        }
        publicLog(eventName, data) {
            this.impl.publicLog(eventName, data);
        }
        publicLog2(eventName, data) {
            this.publicLog(eventName, data);
        }
        publicLogError(errorEventName, data) {
            this.impl.publicLogError(errorEventName, data);
        }
        publicLogError2(eventName, data) {
            this.publicLogError(eventName, data);
        }
    };
    exports.TelemetryService = TelemetryService;
    exports.TelemetryService = TelemetryService = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, productService_1.IProductService),
        __param(2, services_1.ISharedProcessService),
        __param(3, storage_1.IStorageService),
        __param(4, configuration_1.IConfigurationService)
    ], TelemetryService);
    (0, extensions_1.registerSingleton)(telemetry_1.ITelemetryService, TelemetryService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZWxlbWV0cnkvZWxlY3Ryb24tc2FuZGJveC90ZWxlbWV0cnlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxzQkFBVTtRQU8vQyxJQUFJLFNBQVMsS0FBYSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLFNBQVMsS0FBYSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLGdCQUFnQixLQUFhLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDckUsSUFBSSxZQUFZLEtBQTBCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRTFFLFlBQ3FDLGtCQUFzRCxFQUN6RSxjQUErQixFQUN6QixvQkFBMkMsRUFDakQsY0FBK0IsRUFDekIsb0JBQTJDO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxJQUFBLGtDQUFpQixFQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO2dCQUMxRCxNQUFNLFVBQVUsR0FBRyxJQUFBLG9DQUFtQixFQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDckUsTUFBTSxNQUFNLEdBQTRCO29CQUN2QyxTQUFTLEVBQUUsQ0FBQyxJQUFJLHNDQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNqRCxnQkFBZ0IsRUFBRSxJQUFBLDREQUFnQyxFQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsaUJBQU8sRUFBRSxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7b0JBQ3ZRLFFBQVEsRUFBRSxJQUFBLDJDQUEwQixFQUFDLGtCQUFrQixDQUFDO29CQUN4RCxrQkFBa0IsRUFBRSxJQUFJO2lCQUN4QixDQUFDO2dCQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLG1DQUFvQixDQUFDLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2FBQ25HO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcscUNBQW9CLENBQUM7YUFDakM7WUFFRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN4RCxDQUFDO1FBRUQscUJBQXFCLENBQUMsSUFBWSxFQUFFLEtBQWE7WUFDaEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsSUFBSSxjQUFjO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDakMsQ0FBQztRQUVELFNBQVMsQ0FBQyxTQUFpQixFQUFFLElBQXFCO1lBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsVUFBVSxDQUFzRixTQUFpQixFQUFFLElBQWdDO1lBQ2xKLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQXNCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsY0FBYyxDQUFDLGNBQXNCLEVBQUUsSUFBcUI7WUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxlQUFlLENBQXNGLFNBQWlCLEVBQUUsSUFBZ0M7WUFDdkosSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBc0IsQ0FBQyxDQUFDO1FBQ3hELENBQUM7S0FDRCxDQUFBO0lBOURZLDRDQUFnQjsrQkFBaEIsZ0JBQWdCO1FBYTFCLFdBQUEsdURBQWtDLENBQUE7UUFDbEMsV0FBQSxnQ0FBZSxDQUFBO1FBQ2YsV0FBQSxnQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLHFDQUFxQixDQUFBO09BakJYLGdCQUFnQixDQThENUI7SUFFRCxJQUFBLDhCQUFpQixFQUFDLDZCQUFpQixFQUFFLGdCQUFnQixvQ0FBNEIsQ0FBQyJ9