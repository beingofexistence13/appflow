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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, lifecycle_1, nls_1, environment_1, log_1, productService_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$43b = void 0;
    let $43b = class $43b extends lifecycle_1.$kc {
        constructor(logService, loggerService, environmentService, productService, b = '') {
            super();
            this.b = b;
            const logger = loggerService.getLogger(telemetryUtils_1.$do);
            if (logger) {
                this.a = this.B(logger);
            }
            else {
                // Not a perfect check, but a nice way to indicate if we only have logging enabled for debug purposes and nothing is actually being sent
                const justLoggingAndNotSending = (0, telemetryUtils_1.$io)(productService, environmentService);
                const logSuffix = justLoggingAndNotSending ? ' (Not Sent)' : '';
                const isVisible = () => (0, telemetryUtils_1.$ho)(productService, environmentService) && logService.getLevel() === log_1.LogLevel.Trace;
                this.a = this.B(loggerService.createLogger(telemetryUtils_1.$do, { name: (0, nls_1.localize)(0, null, logSuffix), hidden: !isVisible() }));
                this.B(logService.onDidChangeLogLevel(() => loggerService.setVisibility(telemetryUtils_1.$do, isVisible())));
                this.a.info('Below are logs for every telemetry event sent from VS Code once the log level is set to trace.');
                this.a.info('===========================================================');
            }
        }
        flush() {
            return Promise.resolve(undefined);
        }
        log(eventName, data) {
            this.a.trace(`${this.b}telemetry/${eventName}`, (0, telemetryUtils_1.$ko)(data));
        }
    };
    exports.$43b = $43b;
    exports.$43b = $43b = __decorate([
        __param(0, log_1.$5i),
        __param(1, log_1.$6i),
        __param(2, environment_1.$Ih),
        __param(3, productService_1.$kj)
    ], $43b);
});
//# sourceMappingURL=telemetryLogAppender.js.map