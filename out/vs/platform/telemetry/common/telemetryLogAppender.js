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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, lifecycle_1, nls_1, environment_1, log_1, productService_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryLogAppender = void 0;
    let TelemetryLogAppender = class TelemetryLogAppender extends lifecycle_1.Disposable {
        constructor(logService, loggerService, environmentService, productService, prefix = '') {
            super();
            this.prefix = prefix;
            const logger = loggerService.getLogger(telemetryUtils_1.telemetryLogId);
            if (logger) {
                this.logger = this._register(logger);
            }
            else {
                // Not a perfect check, but a nice way to indicate if we only have logging enabled for debug purposes and nothing is actually being sent
                const justLoggingAndNotSending = (0, telemetryUtils_1.isLoggingOnly)(productService, environmentService);
                const logSuffix = justLoggingAndNotSending ? ' (Not Sent)' : '';
                const isVisible = () => (0, telemetryUtils_1.supportsTelemetry)(productService, environmentService) && logService.getLevel() === log_1.LogLevel.Trace;
                this.logger = this._register(loggerService.createLogger(telemetryUtils_1.telemetryLogId, { name: (0, nls_1.localize)('telemetryLog', "Telemetry{0}", logSuffix), hidden: !isVisible() }));
                this._register(logService.onDidChangeLogLevel(() => loggerService.setVisibility(telemetryUtils_1.telemetryLogId, isVisible())));
                this.logger.info('Below are logs for every telemetry event sent from VS Code once the log level is set to trace.');
                this.logger.info('===========================================================');
            }
        }
        flush() {
            return Promise.resolve(undefined);
        }
        log(eventName, data) {
            this.logger.trace(`${this.prefix}telemetry/${eventName}`, (0, telemetryUtils_1.validateTelemetryData)(data));
        }
    };
    exports.TelemetryLogAppender = TelemetryLogAppender;
    exports.TelemetryLogAppender = TelemetryLogAppender = __decorate([
        __param(0, log_1.ILogService),
        __param(1, log_1.ILoggerService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, productService_1.IProductService)
    ], TelemetryLogAppender);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5TG9nQXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvY29tbW9uL3RlbGVtZXRyeUxvZ0FwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBSW5ELFlBQ2MsVUFBdUIsRUFDcEIsYUFBNkIsRUFDeEIsa0JBQXVDLEVBQzNDLGNBQStCLEVBQy9CLFNBQWlCLEVBQUU7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFGUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBSXBDLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksTUFBTSxFQUFFO2dCQUNYLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyQztpQkFBTTtnQkFDTix3SUFBd0k7Z0JBQ3hJLE1BQU0sd0JBQXdCLEdBQUcsSUFBQSw4QkFBYSxFQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNuRixNQUFNLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUEsa0NBQWlCLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLGNBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQzFILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLCtCQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDOUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQywrQkFBYyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnR0FBZ0csQ0FBQyxDQUFDO2dCQUNuSCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO2FBQ2hGO1FBQ0YsQ0FBQztRQUVELEtBQUs7WUFDSixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELEdBQUcsQ0FBQyxTQUFpQixFQUFFLElBQVM7WUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxhQUFhLFNBQVMsRUFBRSxFQUFFLElBQUEsc0NBQXFCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDO0tBQ0QsQ0FBQTtJQW5DWSxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQUs5QixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLG9CQUFjLENBQUE7UUFDZCxXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsZ0NBQWUsQ0FBQTtPQVJMLG9CQUFvQixDQW1DaEMifQ==