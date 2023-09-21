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
define(["require", "exports", "vs/base/common/network", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/telemetry/common/telemetryService"], function (require, exports, network_1, ipc_cp_1, configuration_1, environment_1, log_1, productService_1, telemetry_1, telemetryIpc_1, telemetryLogAppender_1, telemetryService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEndpointTelemetryService = void 0;
    let CustomEndpointTelemetryService = class CustomEndpointTelemetryService {
        constructor(configurationService, telemetryService, logService, loggerService, environmentService, productService) {
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.loggerService = loggerService;
            this.environmentService = environmentService;
            this.productService = productService;
            this.customTelemetryServices = new Map();
        }
        getCustomTelemetryService(endpoint) {
            if (!this.customTelemetryServices.has(endpoint.id)) {
                const telemetryInfo = Object.create(null);
                telemetryInfo['common.vscodemachineid'] = this.telemetryService.machineId;
                telemetryInfo['common.vscodesessionid'] = this.telemetryService.sessionId;
                const args = [endpoint.id, JSON.stringify(telemetryInfo), endpoint.aiKey];
                const client = new ipc_cp_1.Client(network_1.FileAccess.asFileUri('bootstrap-fork').fsPath, {
                    serverName: 'Debug Telemetry',
                    timeout: 1000 * 60 * 5,
                    args,
                    env: {
                        ELECTRON_RUN_AS_NODE: 1,
                        VSCODE_PIPE_LOGGING: 'true',
                        VSCODE_AMD_ENTRYPOINT: 'vs/workbench/contrib/debug/node/telemetryApp'
                    }
                });
                const channel = client.getChannel('telemetryAppender');
                const appenders = [
                    new telemetryIpc_1.TelemetryAppenderClient(channel),
                    new telemetryLogAppender_1.TelemetryLogAppender(this.logService, this.loggerService, this.environmentService, this.productService, `[${endpoint.id}] `),
                ];
                this.customTelemetryServices.set(endpoint.id, new telemetryService_1.TelemetryService({
                    appenders,
                    sendErrorTelemetry: endpoint.sendErrorTelemetry
                }, this.configurationService, this.productService));
            }
            return this.customTelemetryServices.get(endpoint.id);
        }
        publicLog(telemetryEndpoint, eventName, data) {
            const customTelemetryService = this.getCustomTelemetryService(telemetryEndpoint);
            customTelemetryService.publicLog(eventName, data);
        }
        publicLogError(telemetryEndpoint, errorEventName, data) {
            const customTelemetryService = this.getCustomTelemetryService(telemetryEndpoint);
            customTelemetryService.publicLogError(errorEventName, data);
        }
    };
    exports.CustomEndpointTelemetryService = CustomEndpointTelemetryService;
    exports.CustomEndpointTelemetryService = CustomEndpointTelemetryService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, log_1.ILogService),
        __param(3, log_1.ILoggerService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, productService_1.IProductService)
    ], CustomEndpointTelemetryService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tRW5kcG9pbnRUZWxlbWV0cnlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVsZW1ldHJ5L25vZGUvY3VzdG9tRW5kcG9pbnRUZWxlbWV0cnlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUE4QjtRQUsxQyxZQUN3QixvQkFBNEQsRUFDaEUsZ0JBQW9ELEVBQzFELFVBQXdDLEVBQ3JDLGFBQThDLEVBQ3pDLGtCQUF3RCxFQUM1RCxjQUFnRDtZQUx6Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNwQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDeEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFSMUQsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7UUFTbkUsQ0FBQztRQUVHLHlCQUF5QixDQUFDLFFBQTRCO1lBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDbkQsTUFBTSxhQUFhLEdBQThCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7Z0JBQzFFLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7Z0JBQzFFLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQ2pDLG9CQUFVLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxFQUM3QztvQkFDQyxVQUFVLEVBQUUsaUJBQWlCO29CQUM3QixPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDO29CQUN0QixJQUFJO29CQUNKLEdBQUcsRUFBRTt3QkFDSixvQkFBb0IsRUFBRSxDQUFDO3dCQUN2QixtQkFBbUIsRUFBRSxNQUFNO3dCQUMzQixxQkFBcUIsRUFBRSw4Q0FBOEM7cUJBQ3JFO2lCQUNELENBQ0QsQ0FBQztnQkFFRixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sU0FBUyxHQUFHO29CQUNqQixJQUFJLHNDQUF1QixDQUFDLE9BQU8sQ0FBQztvQkFDcEMsSUFBSSwyQ0FBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUM7aUJBQ2hJLENBQUM7Z0JBRUYsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksbUNBQWdCLENBQUM7b0JBQ2xFLFNBQVM7b0JBQ1Qsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGtCQUFrQjtpQkFDL0MsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7YUFDcEQ7WUFFRCxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRSxDQUFDO1FBQ3ZELENBQUM7UUFFRCxTQUFTLENBQUMsaUJBQXFDLEVBQUUsU0FBaUIsRUFBRSxJQUFxQjtZQUN4RixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pGLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELGNBQWMsQ0FBQyxpQkFBcUMsRUFBRSxjQUFzQixFQUFFLElBQXFCO1lBQ2xHLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDakYsc0JBQXNCLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO0tBQ0QsQ0FBQTtJQTFEWSx3RUFBOEI7NkNBQTlCLDhCQUE4QjtRQU14QyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSxvQkFBYyxDQUFBO1FBQ2QsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLGdDQUFlLENBQUE7T0FYTCw4QkFBOEIsQ0EwRDFDIn0=