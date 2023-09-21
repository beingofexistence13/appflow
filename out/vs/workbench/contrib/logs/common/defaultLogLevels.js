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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/workbench/services/configuration/common/jsonEditing", "vs/base/common/types", "vs/platform/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/base/common/json"], function (require, exports, log_1, instantiation_1, environmentService_1, files_1, jsonEditing_1, types_1, environmentService_2, extensions_1, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDefaultLogLevelsService = void 0;
    exports.IDefaultLogLevelsService = (0, instantiation_1.createDecorator)('IDefaultLogLevelsService');
    let DefaultLogLevelsService = class DefaultLogLevelsService {
        constructor(environmentService, fileService, jsonEditingService, logService, loggerService) {
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.jsonEditingService = jsonEditingService;
            this.logService = logService;
            this.loggerService = loggerService;
        }
        async getDefaultLogLevels() {
            const argvLogLevel = await this._parseLogLevelsFromArgv();
            return {
                default: argvLogLevel?.default ?? this._getDefaultLogLevelFromEnv(),
                extensions: argvLogLevel?.extensions ?? this._getExtensionsDefaultLogLevelsFromEnv()
            };
        }
        async setDefaultLogLevel(defaultLogLevel, extensionId) {
            const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
            if (extensionId) {
                extensionId = extensionId.toLowerCase();
                const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
                const currentDefaultLogLevel = this._getDefaultLogLevel(argvLogLevel, extensionId);
                argvLogLevel.extensions = argvLogLevel.extensions ?? [];
                const extension = argvLogLevel.extensions.find(([extension]) => extension === extensionId);
                if (extension) {
                    extension[1] = defaultLogLevel;
                }
                else {
                    argvLogLevel.extensions.push([extensionId, defaultLogLevel]);
                }
                await this._writeLogLevelsToArgv(argvLogLevel);
                const extensionLoggers = [...this.loggerService.getRegisteredLoggers()].filter(logger => logger.extensionId && logger.extensionId.toLowerCase() === extensionId);
                for (const { resource } of extensionLoggers) {
                    if (this.loggerService.getLogLevel(resource) === currentDefaultLogLevel) {
                        this.loggerService.setLogLevel(resource, defaultLogLevel);
                    }
                }
            }
            else {
                const currentLogLevel = this._getDefaultLogLevel(argvLogLevel);
                argvLogLevel.default = defaultLogLevel;
                await this._writeLogLevelsToArgv(argvLogLevel);
                if (this.loggerService.getLogLevel() === currentLogLevel) {
                    this.loggerService.setLogLevel(defaultLogLevel);
                }
            }
        }
        _getDefaultLogLevel(argvLogLevels, extension) {
            if (extension) {
                const extensionLogLevel = argvLogLevels.extensions?.find(([extensionId]) => extensionId === extension);
                if (extensionLogLevel) {
                    return extensionLogLevel[1];
                }
            }
            return argvLogLevels.default ?? (0, log_1.getLogLevel)(this.environmentService);
        }
        async _writeLogLevelsToArgv(logLevels) {
            const logLevelsValue = [];
            if (!(0, types_1.isUndefined)(logLevels.default)) {
                logLevelsValue.push((0, log_1.LogLevelToString)(logLevels.default));
            }
            for (const [extension, logLevel] of logLevels.extensions ?? []) {
                logLevelsValue.push(`${extension}:${(0, log_1.LogLevelToString)(logLevel)}`);
            }
            await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['log-level'], value: logLevelsValue.length ? logLevelsValue : undefined }], true);
        }
        async _parseLogLevelsFromArgv() {
            const result = { extensions: [] };
            try {
                const content = await this.fileService.readFile(this.environmentService.argvResource);
                const argv = (0, json_1.parse)(content.value.toString());
                const logLevels = (0, types_1.isString)(argv['log-level']) ? [argv['log-level']] : Array.isArray(argv['log-level']) ? argv['log-level'] : [];
                for (const extensionLogLevel of logLevels) {
                    const matches = environmentService_2.EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(extensionLogLevel);
                    if (matches && matches[1] && matches[2]) {
                        const logLevel = (0, log_1.parseLogLevel)(matches[2]);
                        if (!(0, types_1.isUndefined)(logLevel)) {
                            result.extensions?.push([matches[1].toLowerCase(), logLevel]);
                        }
                    }
                    else {
                        const logLevel = (0, log_1.parseLogLevel)(extensionLogLevel);
                        if (!(0, types_1.isUndefined)(logLevel)) {
                            result.default = logLevel;
                        }
                    }
                }
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
            return !(0, types_1.isUndefined)(result.default) || result.extensions?.length ? result : undefined;
        }
        _getDefaultLogLevelFromEnv() {
            return (0, log_1.getLogLevel)(this.environmentService);
        }
        _getExtensionsDefaultLogLevelsFromEnv() {
            const result = [];
            for (const [extension, logLevelValue] of this.environmentService.extensionLogLevel ?? []) {
                const logLevel = (0, log_1.parseLogLevel)(logLevelValue);
                if (!(0, types_1.isUndefined)(logLevel)) {
                    result.push([extension, logLevel]);
                }
            }
            return result;
        }
    };
    DefaultLogLevelsService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, jsonEditing_1.IJSONEditingService),
        __param(3, log_1.ILogService),
        __param(4, log_1.ILoggerService)
    ], DefaultLogLevelsService);
    (0, extensions_1.registerSingleton)(exports.IDefaultLogLevelsService, DefaultLogLevelsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdExvZ0xldmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2xvZ3MvY29tbW9uL2RlZmF1bHRMb2dMZXZlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJuRixRQUFBLHdCQUF3QixHQUFHLElBQUEsK0JBQWUsRUFBMkIsMEJBQTBCLENBQUMsQ0FBQztJQVc5RyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQUk1QixZQUNnRCxrQkFBZ0QsRUFDaEUsV0FBeUIsRUFDbEIsa0JBQXVDLEVBQy9DLFVBQXVCLEVBQ3BCLGFBQTZCO1lBSmYsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUNoRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNsQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQy9DLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDcEIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1FBRS9ELENBQUM7UUFFRCxLQUFLLENBQUMsbUJBQW1CO1lBQ3hCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDMUQsT0FBTztnQkFDTixPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ25FLFVBQVUsRUFBRSxZQUFZLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQyxxQ0FBcUMsRUFBRTthQUNwRixDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxlQUF5QixFQUFFLFdBQW9CO1lBQ3ZFLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLElBQUksRUFBRSxDQUFDO1lBQ2hFLElBQUksV0FBVyxFQUFFO2dCQUNoQixXQUFXLEdBQUcsV0FBVyxDQUFD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