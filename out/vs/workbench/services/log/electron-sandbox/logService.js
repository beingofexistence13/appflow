/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/services/log/common/logConstants", "vs/platform/log/common/logService"], function (require, exports, log_1, lifecycle_1, nls_1, logConstants_1, logService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeLogService = void 0;
    class NativeLogService extends logService_1.LogService {
        constructor(loggerService, environmentService) {
            const disposables = new lifecycle_1.DisposableStore();
            const fileLogger = disposables.add(loggerService.createLogger(environmentService.logFile, { id: logConstants_1.windowLogId, name: (0, nls_1.localize)('rendererLog', "Window") }));
            let consoleLogger;
            if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
                // Extension development test CLI: forward everything to main side
                consoleLogger = loggerService.createConsoleMainLogger();
            }
            else {
                // Normal mode: Log to console
                consoleLogger = new log_1.ConsoleLogger(fileLogger.getLevel());
            }
            super(fileLogger, [consoleLogger]);
            this._register(disposables);
        }
    }
    exports.NativeLogService = NativeLogService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9sb2cvZWxlY3Ryb24tc2FuZGJveC9sb2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLGdCQUFpQixTQUFRLHVCQUFVO1FBRS9DLFlBQVksYUFBa0MsRUFBRSxrQkFBc0Q7WUFFckcsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSwwQkFBVyxFQUFFLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFekosSUFBSSxhQUFzQixDQUFDO1lBQzNCLElBQUksa0JBQWtCLENBQUMsc0JBQXNCLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLHlCQUF5QixFQUFFO2dCQUNoRyxrRUFBa0U7Z0JBQ2xFLGFBQWEsR0FBRyxhQUFhLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzthQUN4RDtpQkFBTTtnQkFDTiw4QkFBOEI7Z0JBQzlCLGFBQWEsR0FBRyxJQUFJLG1CQUFhLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDekQ7WUFFRCxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUVuQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7S0FDRDtJQXJCRCw0Q0FxQkMifQ==