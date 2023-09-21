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
define(["require", "exports", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/environment/common/environment"], function (require, exports, extHostCustomers_1, log_1, lifecycle_1, extHost_protocol_1, uri_1, commands_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadLoggerService = void 0;
    let MainThreadLoggerService = class MainThreadLoggerService {
        constructor(extHostContext, loggerService) {
            this.loggerService = loggerService;
            this.disposables = new lifecycle_1.DisposableStore();
            const proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostLogLevelServiceShape);
            this.disposables.add(loggerService.onDidChangeLogLevel(arg => {
                if ((0, log_1.isLogLevel)(arg)) {
                    proxy.$setLogLevel(arg);
                }
                else {
                    proxy.$setLogLevel(arg[1], arg[0]);
                }
            }));
        }
        $log(file, messages) {
            const logger = this.loggerService.getLogger(uri_1.URI.revive(file));
            if (!logger) {
                throw new Error('Create the logger before logging');
            }
            for (const [level, message] of messages) {
                (0, log_1.log)(logger, level, message);
            }
        }
        async $createLogger(file, options) {
            this.loggerService.createLogger(uri_1.URI.revive(file), options);
        }
        async $registerLogger(logResource) {
            this.loggerService.registerLogger({
                ...logResource,
                resource: uri_1.URI.revive(logResource.resource)
            });
        }
        async $deregisterLogger(resource) {
            this.loggerService.deregisterLogger(uri_1.URI.revive(resource));
        }
        async $setVisibility(resource, visible) {
            this.loggerService.setVisibility(uri_1.URI.revive(resource), visible);
        }
        $flush(file) {
            const logger = this.loggerService.getLogger(uri_1.URI.revive(file));
            if (!logger) {
                throw new Error('Create the logger before flushing');
            }
            logger.flush();
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.MainThreadLoggerService = MainThreadLoggerService;
    exports.MainThreadLoggerService = MainThreadLoggerService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadLogger),
        __param(1, log_1.ILoggerService)
    ], MainThreadLoggerService);
    // --- Internal commands to improve extension test runs
    commands_1.CommandsRegistry.registerCommand('_extensionTests.setLogLevel', function (accessor, level) {
        const loggerService = accessor.get(log_1.ILoggerService);
        const environmentService = accessor.get(environment_1.IEnvironmentService);
        if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
            const logLevel = (0, log_1.parseLogLevel)(level);
            if (logLevel !== undefined) {
                loggerService.setLogLevel(logLevel);
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand('_extensionTests.getLogLevel', function (accessor) {
        const logService = accessor.get(log_1.ILogService);
        return (0, log_1.LogLevelToString)(logService.getLevel());
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZExvZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZExvZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBSW5DLFlBQ0MsY0FBK0IsRUFDZixhQUE4QztZQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFKOUMsZ0JBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQU1wRCxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVELElBQUksSUFBQSxnQkFBVSxFQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNwQixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN4QjtxQkFBTTtvQkFDTixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbkM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFtQixFQUFFLFFBQThCO1lBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQzthQUNwRDtZQUNE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