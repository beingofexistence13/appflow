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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/nls!vs/workbench/api/common/extHostTelemetry"], function (require, exports, instantiation_1, event_1, log_1, extHostInitDataService_1, extensionHostProtocol_1, remoteHosts_1, telemetryUtils_1, objects_1, uri_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jM = exports.$iM = exports.$hM = exports.$gM = void 0;
    let $gM = class $gM extends lifecycle_1.$kc {
        constructor(s, t) {
            super();
            this.s = s;
            this.t = t;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeTelemetryEnabled = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeTelemetryConfiguration = this.b.event;
            this.c = { usage: true, error: true };
            this.f = 0 /* TelemetryLevel.NONE */;
            // This holds whether or not we're running with --disable-telemetry, etc. Usings supportsTelemtry() from the main thread
            this.g = false;
            this.j = false;
            this.r = new Map();
            this.m = uri_1.URI.revive(this.s.environment.extensionTelemetryLogResource);
            this.j = this.s.environment.isExtensionTelemetryLoggingOnly;
            this.n = t.createLogger(this.m, { id: telemetryUtils_1.$eo, name: (0, nls_1.localize)(0, null, this.j ? ' (Not Sent)' : ''), hidden: true });
            this.B(t.onDidChangeLogLevel(arg => {
                if ((0, log_1.$7i)(arg)) {
                    this.u();
                }
            }));
            this.n.info('Below are logs for extension telemetry events sent to the telemetry output channel API once the log level is set to trace.');
            this.n.info('===========================================================');
        }
        u() {
            this.t.setVisibility(this.m, this.g && this.t.getLogLevel() === log_1.LogLevel.Trace);
        }
        getTelemetryConfiguration() {
            return this.f === 3 /* TelemetryLevel.USAGE */;
        }
        getTelemetryDetails() {
            return {
                isCrashEnabled: this.f >= 1 /* TelemetryLevel.CRASH */,
                isErrorsEnabled: this.c.error ? this.f >= 2 /* TelemetryLevel.ERROR */ : false,
                isUsageEnabled: this.c.usage ? this.f >= 3 /* TelemetryLevel.USAGE */ : false
            };
        }
        instantiateLogger(extension, sender, options) {
            const telemetryDetails = this.getTelemetryDetails();
            const logger = new $hM(sender, options, extension, this.n, this.j, this.getBuiltInCommonProperties(extension), { isUsageEnabled: telemetryDetails.isUsageEnabled, isErrorsEnabled: telemetryDetails.isErrorsEnabled });
            const loggers = this.r.get(extension.identifier.value) ?? [];
            this.r.set(extension.identifier.value, [...loggers, logger]);
            return logger.apiTelemetryLogger;
        }
        $initializeTelemetryLevel(level, supportsTelemetry, productConfig) {
            this.f = level;
            this.g = supportsTelemetry;
            this.c = productConfig ?? { usage: true, error: true };
            this.u();
        }
        getBuiltInCommonProperties(extension) {
            const commonProperties = Object.create(null);
            // TODO @lramos15, does os info like node arch, platform version, etc exist here.
            // Or will first party extensions just mix this in
            commonProperties['common.extname'] = `${extension.publisher}.${extension.name}`;
            commonProperties['common.extversion'] = extension.version;
            commonProperties['common.vscodemachineid'] = this.s.telemetryInfo.machineId;
            commonProperties['common.vscodesessionid'] = this.s.telemetryInfo.sessionId;
            commonProperties['common.vscodeversion'] = this.s.version;
            commonProperties['common.isnewappinstall'] = $iM(this.s.telemetryInfo.firstSessionDate);
            commonProperties['common.product'] = this.s.environment.appHost;
            switch (this.s.uiKind) {
                case extensionHostProtocol_1.UIKind.Web:
                    commonProperties['common.uikind'] = 'web';
                    break;
                case extensionHostProtocol_1.UIKind.Desktop:
                    commonProperties['common.uikind'] = 'desktop';
                    break;
                default:
                    commonProperties['common.uikind'] = 'unknown';
            }
            commonProperties['common.remotename'] = (0, remoteHosts_1.$Pk)((0, telemetryUtils_1.$lo)(this.s.remote.authority));
            return commonProperties;
        }
        $onDidChangeTelemetryLevel(level) {
            this.h = this.getTelemetryConfiguration();
            this.f = level;
            const telemetryDetails = this.getTelemetryDetails();
            // Remove all disposed loggers
            this.r.forEach((loggers, key) => {
                const newLoggers = loggers.filter(l => !l.isDisposed);
                if (newLoggers.length === 0) {
                    this.r.delete(key);
                }
                else {
                    this.r.set(key, newLoggers);
                }
            });
            // Loop through all loggers and update their level
            this.r.forEach(loggers => {
                for (const logger of loggers) {
                    logger.updateTelemetryEnablements(telemetryDetails.isUsageEnabled, telemetryDetails.isErrorsEnabled);
                }
            });
            if (this.h !== this.getTelemetryConfiguration()) {
                this.a.fire(this.getTelemetryConfiguration());
            }
            this.b.fire(this.getTelemetryDetails());
            this.u();
        }
        onExtensionError(extension, error) {
            const loggers = this.r.get(extension.value);
            const nonDisposedLoggers = loggers?.filter(l => !l.isDisposed);
            if (!nonDisposedLoggers) {
                this.r.delete(extension.value);
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
    exports.$gM = $gM;
    exports.$gM = $gM = __decorate([
        __param(0, extHostInitDataService_1.$fM),
        __param(1, log_1.$6i)
    ], $gM);
    class $hM {
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
        constructor(sender, options, g, h, i, j, telemetryEnablements) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.a = new event_1.$fd();
            this.ignoreUnhandledExtHostErrors = options?.ignoreUnhandledErrors ?? false;
            this.b = options?.ignoreBuiltInCommonProperties ?? false;
            this.c = options?.additionalCommonProperties;
            this.f = sender;
            this.d = { isUsageEnabled: telemetryEnablements.isUsageEnabled, isErrorsEnabled: telemetryEnablements.isErrorsEnabled };
        }
        updateTelemetryEnablements(isUsageEnabled, isErrorsEnabled) {
            if (this.e) {
                this.d = { isUsageEnabled, isErrorsEnabled };
                this.a.fire(this.e);
            }
        }
        mixInCommonPropsAndCleanData(data) {
            // Some telemetry modules prefer to break properties and measurmements up
            // We mix common properties into the properties tab.
            let updatedData = 'properties' in data ? (data.properties ?? {}) : data;
            // We don't clean measurements since they are just numbers
            updatedData = (0, telemetryUtils_1.$oo)(updatedData, []);
            if (this.c) {
                updatedData = (0, objects_1.$Ym)(updatedData, this.c);
            }
            if (!this.b) {
                updatedData = (0, objects_1.$Ym)(updatedData, this.j);
            }
            if ('properties' in data) {
                data.properties = updatedData;
            }
            else {
                data = updatedData;
            }
            return data;
        }
        k(eventName, data) {
            // No sender means likely disposed of, we should no-op
            if (!this.f) {
                return;
            }
            // If it's a built-in extension (vscode publisher) we don't prefix the publisher and only the ext name
            if (this.g.publisher === 'vscode') {
                eventName = this.g.name + '/' + eventName;
            }
            else {
                eventName = this.g.identifier.value + '/' + eventName;
            }
            data = this.mixInCommonPropsAndCleanData(data || {});
            if (!this.i) {
                this.f?.sendEventData(eventName, data);
            }
            this.h.trace(eventName, data);
        }
        logUsage(eventName, data) {
            if (!this.d.isUsageEnabled) {
                return;
            }
            this.k(eventName, data);
        }
        logError(eventNameOrException, data) {
            if (!this.d.isErrorsEnabled || !this.f) {
                return;
            }
            if (typeof eventNameOrException === 'string') {
                this.k(eventNameOrException, data);
            }
            else {
                const errorData = {
                    name: eventNameOrException.name,
                    message: eventNameOrException.message,
                    stack: eventNameOrException.stack,
                    cause: eventNameOrException.cause
                };
                const cleanedErrorData = (0, telemetryUtils_1.$oo)(errorData, []);
                // Reconstruct the error object with the cleaned data
                const cleanedError = new Error(cleanedErrorData.message, {
                    cause: cleanedErrorData.cause
                });
                cleanedError.stack = cleanedErrorData.stack;
                cleanedError.name = cleanedErrorData.name;
                data = this.mixInCommonPropsAndCleanData(data || {});
                if (!this.i) {
                    this.f.sendErrorData(cleanedError, data);
                }
                this.h.trace('exception', data);
            }
        }
        get apiTelemetryLogger() {
            if (!this.e) {
                const that = this;
                const obj = {
                    logUsage: that.logUsage.bind(that),
                    get isUsageEnabled() {
                        return that.d.isUsageEnabled;
                    },
                    get isErrorsEnabled() {
                        return that.d.isErrorsEnabled;
                    },
                    logError: that.logError.bind(that),
                    dispose: that.dispose.bind(that),
                    onDidChangeEnableStates: that.a.event.bind(that)
                };
                this.e = Object.freeze(obj);
            }
            return this.e;
        }
        get isDisposed() {
            return !this.f;
        }
        dispose() {
            if (this.f?.flush) {
                let tempSender = this.f;
                this.f = undefined;
                Promise.resolve(tempSender.flush()).then(tempSender = undefined);
                this.e = undefined;
            }
            else {
                this.f = undefined;
            }
        }
    }
    exports.$hM = $hM;
    function $iM(firstSessionDate) {
        const installAge = Date.now() - new Date(firstSessionDate).getTime();
        return isNaN(installAge) ? false : installAge < 1000 * 60 * 60 * 24; // install age is less than a day
    }
    exports.$iM = $iM;
    exports.$jM = (0, instantiation_1.$Bh)('IExtHostTelemetry');
});
//# sourceMappingURL=extHostTelemetry.js.map