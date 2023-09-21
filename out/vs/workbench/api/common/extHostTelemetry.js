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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/nls"], function (require, exports, instantiation_1, event_1, log_1, extHostInitDataService_1, extensionHostProtocol_1, remoteHosts_1, telemetryUtils_1, objects_1, uri_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostTelemetry = exports.isNewAppInstall = exports.ExtHostTelemetryLogger = exports.ExtHostTelemetry = void 0;
    let ExtHostTelemetry = class ExtHostTelemetry extends lifecycle_1.Disposable {
        constructor(initData, loggerService) {
            super();
            this.initData = initData;
            this.loggerService = loggerService;
            this._onDidChangeTelemetryEnabled = this._register(new event_1.Emitter());
            this.onDidChangeTelemetryEnabled = this._onDidChangeTelemetryEnabled.event;
            this._onDidChangeTelemetryConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeTelemetryConfiguration = this._onDidChangeTelemetryConfiguration.event;
            this._productConfig = { usage: true, error: true };
            this._level = 0 /* TelemetryLevel.NONE */;
            // This holds whether or not we're running with --disable-telemetry, etc. Usings supportsTelemtry() from the main thread
            this._telemetryIsSupported = false;
            this._inLoggingOnlyMode = false;
            this._telemetryLoggers = new Map();
            this.extHostTelemetryLogFile = uri_1.URI.revive(this.initData.environment.extensionTelemetryLogResource);
            this._inLoggingOnlyMode = this.initData.environment.isExtensionTelemetryLoggingOnly;
            this._outputLogger = loggerService.createLogger(this.extHostTelemetryLogFile, { id: telemetryUtils_1.extensionTelemetryLogChannelId, name: (0, nls_1.localize)('extensionTelemetryLog', "Extension Telemetry{0}", this._inLoggingOnlyMode ? ' (Not Sent)' : ''), hidden: true });
            this._register(loggerService.onDidChangeLogLevel(arg => {
                if ((0, log_1.isLogLevel)(arg)) {
                    this.updateLoggerVisibility();
                }
            }));
            this._outputLogger.info('Below are logs for extension telemetry events sent to the telemetry output channel API once the log level is set to trace.');
            this._outputLogger.info('===========================================================');
        }
        updateLoggerVisibility() {
            this.loggerService.setVisibility(this.extHostTelemetryLogFile, this._telemetryIsSupported && this.loggerService.getLogLevel() === log_1.LogLevel.Trace);
        }
        getTelemetryConfiguration() {
            return this._level === 3 /* TelemetryLevel.USAGE */;
        }
        getTelemetryDetails() {
            return {
                isCrashEnabled: this._level >= 1 /* TelemetryLevel.CRASH */,
                isErrorsEnabled: this._productConfig.error ? this._level >= 2 /* TelemetryLevel.ERROR */ : false,
                isUsageEnabled: this._productConfig.usage ? this._level >= 3 /* TelemetryLevel.USAGE */ : false
            };
        }
        instantiateLogger(extension, sender, options) {
            const telemetryDetails = this.getTelemetryDetails();
            const logger = new ExtHostTelemetryLogger(sender, options, extension, this._outputLogger, this._inLoggingOnlyMode, this.getBuiltInCommonProperties(extension), { isUsageEnabled: telemetryDetails.isUsageEnabled, isErrorsEnabled: telemetryDetails.isErrorsEnabled });
            const loggers = this._telemetryLoggers.get(extension.identifier.value) ?? [];
            this._telemetryLoggers.set(extension.identifier.value, [...loggers, logger]);
            return logger.apiTelemetryLogger;
        }
        $initializeTelemetryLevel(level, supportsTelemetry, productConfig) {
            this._level = level;
            this._telemetryIsSupported = supportsTelemetry;
            this._productConfig = productConfig ?? { usage: true, error: true };
            this.updateLoggerVisibility();
        }
        getBuiltInCommonProperties(extension) {
            const commonProperties = Object.create(null);
            // TODO @lramos15, does os info like node arch, platform version, etc exist here.
            // Or will first party extensions just mix this in
            commonProperties['common.extname'] = `${extension.publisher}.${extension.name}`;
            commonProperties['common.extversion'] = extension.version;
            commonProperties['common.vscodemachineid'] = this.initData.telemetryInfo.machineId;
            commonProperties['common.vscodesessionid'] = this.initData.telemetryInfo.sessionId;
            commonProperties['common.vscodeversion'] = this.initData.version;
            commonProperties['common.isnewappinstall'] = isNewAppInstall(this.initData.telemetryInfo.firstSessionDate);
            commonProperties['common.product'] = this.initData.environment.appHost;
            switch (this.initData.uiKind) {
                case extensionHostProtocol_1.UIKind.Web:
                    commonProperties['common.uikind'] = 'web';
                    break;
                case extensionHostProtocol_1.UIKind.Desktop:
                    commonProperties['common.uikind'] = 'desktop';
                    break;
                default:
                    commonProperties['common.uikind'] = 'unknown';
            }
            commonProperties['common.remotename'] = (0, remoteHosts_1.getRemoteName)((0, telemetryUtils_1.cleanRemoteAuthority)(this.initData.remote.authority));
            return commonProperties;
        }
        $onDidChangeTelemetryLevel(level) {
            this._oldTelemetryEnablement = this.getTelemetryConfiguration();
            this._level = level;
            const telemetryDetails = this.getTelemetryDetails();
            // Remove all disposed loggers
            this._telemetryLoggers.forEach((loggers, key) => {
                const newLoggers = loggers.filter(l => !l.isDisposed);
                if (newLoggers.length === 0) {
                    this._telemetryLoggers.delete(key);
                }
                else {
                    this._telemetryLoggers.set(key, newLoggers);
                }
            });
            // Loop through all loggers and update their level
            this._telemetryLoggers.forEach(loggers => {
                for (const logger of loggers) {
                    logger.updateTelemetryEnablements(telemetryDetails.isUsageEnabled, telemetryDetails.isErrorsEnabled);
                }
            });
            if (this._oldTelemetryEnablement !== this.getTelemetryConfiguration()) {
                this._onDidChangeTelemetryEnabled.fire(this.getTelemetryConfiguration());
            }
            this._onDidChangeTelemetryConfiguration.fire(this.getTelemetryDetails());
            this.updateLoggerVisibility();
        }
        onExtensionError(extension, error) {
            const loggers = this._telemetryLoggers.get(extension.value);
            const nonDisposedLoggers = loggers?.filter(l => !l.isDisposed);
            if (!nonDisposedLoggers) {
                this._telemetryLoggers.delete(extension.value);
                return false;
            }
            let errorEmitted = false;
            for (const logger of nonDisposedLoggers) {
                if (logger.ignoreUnhandledExtHostErrors) {
                    continue;
                }
                logger.logError(error);
                errorEmitted = true;
            }
            return errorEmitted;
        }
    };
    exports.ExtHostTelemetry = ExtHostTelemetry;
    exports.ExtHostTelemetry = ExtHostTelemetry = __decorate([
        __param(0, extHostInitDataService_1.IExtHostInitDataService),
        __param(1, log_1.ILoggerService)
    ], ExtHostTelemetry);
    class ExtHostTelemetryLogger {
        static validateSender(sender) {
            if (typeof sender !== 'object') {
                throw new TypeError('TelemetrySender argument is invalid');
            }
            if (typeof sender.sendEventData !== 'function') {
                throw new TypeError('TelemetrySender.sendEventData must be a function');
            }
            if (typeof sender.sendErrorData !== 'function') {
                throw new TypeError('TelemetrySender.sendErrorData must be a function');
            }
            if (typeof sender.flush !== 'undefined' && typeof sender.flush !== 'function') {
                throw new TypeError('TelemetrySender.flush must be a function or undefined');
            }
        }
        constructor(sender, options, _extension, _logger, _inLoggingOnlyMode, _commonProperties, telemetryEnablements) {
            this._extension = _extension;
            this._logger = _logger;
            this._inLoggingOnlyMode = _inLoggingOnlyMode;
            this._commonProperties = _commonProperties;
            this._onDidChangeEnableStates = new event_1.Emitter();
            this.ignoreUnhandledExtHostErrors = options?.ignoreUnhandledErrors ?? false;
            this._ignoreBuiltinCommonProperties = options?.ignoreBuiltInCommonProperties ?? false;
            this._additionalCommonProperties = options?.additionalCommonProperties;
            this._sender = sender;
            this._telemetryEnablements = { isUsageEnabled: telemetryEnablements.isUsageEnabled, isErrorsEnabled: telemetryEnablements.isErrorsEnabled };
        }
        updateTelemetryEnablements(isUsageEnabled, isErrorsEnabled) {
            if (this._apiObject) {
                this._telemetryEnablements = { isUsageEnabled, isErrorsEnabled };
                this._onDidChangeEnableStates.fire(this._apiObject);
            }
        }
        mixInCommonPropsAndCleanData(data) {
            // Some telemetry modules prefer to break properties and measurmements up
            // We mix common properties into the properties tab.
            let updatedData = 'properties' in data ? (data.properties ?? {}) : data;
            // We don't clean measurements since they are just numbers
            updatedData = (0, telemetryUtils_1.cleanData)(updatedData, []);
            if (this._additionalCommonProperties) {
                updatedData = (0, objects_1.mixin)(updatedData, this._additionalCommonProperties);
            }
            if (!this._ignoreBuiltinCommonProperties) {
                updatedData = (0, objects_1.mixin)(updatedData, this._commonProperties);
            }
            if ('properties' in data) {
                data.properties = updatedData;
            }
            else {
                data = updatedData;
            }
            return data;
        }
        logEvent(eventName, data) {
            // No sender means likely disposed of, we should no-op
            if (!this._sender) {
                return;
            }
            // If it's a built-in extension (vscode publisher) we don't prefix the publisher and only the ext name
            if (this._extension.publisher === 'vscode') {
                eventName = this._extension.name + '/' + eventName;
            }
            else {
                eventName = this._extension.identifier.value + '/' + eventName;
            }
            data = this.mixInCommonPropsAndCleanData(data || {});
            if (!this._inLoggingOnlyMode) {
                this._sender?.sendEventData(eventName, data);
            }
            this._logger.trace(eventName, data);
        }
        logUsage(eventName, data) {
            if (!this._telemetryEnablements.isUsageEnabled) {
                return;
            }
            this.logEvent(eventName, data);
        }
        logError(eventNameOrException, data) {
            if (!this._telemetryEnablements.isErrorsEnabled || !this._sender) {
                return;
            }
            if (typeof eventNameOrException === 'string') {
                this.logEvent(eventNameOrException, data);
            }
            else {
                const errorData = {
                    name: eventNameOrException.name,
                    message: eventNameOrException.message,
                    stack: eventNameOrException.stack,
                    cause: eventNameOrException.cause
                };
                const cleanedErrorData = (0, telemetryUtils_1.cleanData)(errorData, []);
                // Reconstruct the error object with the cleaned data
                const cleanedError = new Error(cleanedErrorData.message, {
                    cause: cleanedErrorData.cause
                });
                cleanedError.stack = cleanedErrorData.stack;
                cleanedError.name = cleanedErrorData.name;
                data = this.mixInCommonPropsAndCleanData(data || {});
                if (!this._inLoggingOnlyMode) {
                    this._sender.sendErrorData(cleanedError, data);
                }
                this._logger.trace('exception', data);
            }
        }
        get apiTelemetryLogger() {
            if (!this._apiObject) {
                const that = this;
                const obj = {
                    logUsage: that.logUsage.bind(that),
                    get isUsageEnabled() {
                        return that._telemetryEnablements.isUsageEnabled;
                    },
                    get isErrorsEnabled() {
                        return that._telemetryEnablements.isErrorsEnabled;
                    },
                    logError: that.logError.bind(that),
                    dispose: that.dispose.bind(that),
                    onDidChangeEnableStates: that._onDidChangeEnableStates.event.bind(that)
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        get isDisposed() {
            return !this._sender;
        }
        dispose() {
            if (this._sender?.flush) {
                let tempSender = this._sender;
                this._sender = undefined;
                Promise.resolve(tempSender.flush()).then(tempSender = undefined);
                this._apiObject = undefined;
            }
            else {
                this._sender = undefined;
            }
        }
    }
    exports.ExtHostTelemetryLogger = ExtHostTelemetryLogger;
    function isNewAppInstall(firstSessionDate) {
        const installAge = Date.now() - new Date(firstSessionDate).getTime();
        return isNaN(installAge) ? false : installAge < 1000 * 60 * 60 * 24; // install age is less than a day
    }
    exports.isNewAppInstall = isNewAppInstall;
    exports.IExtHostTelemetry = (0, instantiation_1.createDecorator)('IExtHostTelemetry');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlbGVtZXRyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RUZWxlbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0J6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHNCQUFVO1FBb0IvQyxZQUMwQixRQUFrRCxFQUMzRCxhQUE4QztZQUU5RCxLQUFLLEVBQUUsQ0FBQztZQUhrQyxhQUFRLEdBQVIsUUFBUSxDQUF5QjtZQUMxQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFsQjlDLGlDQUE0QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBQzlFLGdDQUEyQixHQUFtQixJQUFJLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDO1lBRTlFLHVDQUFrQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlDLENBQUMsQ0FBQztZQUMxRyxzQ0FBaUMsR0FBeUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssQ0FBQztZQUV6SCxtQkFBYyxHQUF1QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ2xGLFdBQU0sK0JBQXVDO1lBQ3JELHdIQUF3SDtZQUNoSCwwQkFBcUIsR0FBWSxLQUFLLENBQUM7WUFFOUIsdUJBQWtCLEdBQVksS0FBSyxDQUFDO1lBR3BDLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1lBT2hGLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDbkcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElB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