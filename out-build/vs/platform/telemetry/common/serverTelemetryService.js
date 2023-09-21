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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, configuration_1, instantiation_1, productService_1, telemetry_1, telemetryService_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dr = exports.$Cr = exports.$Br = void 0;
    let $Br = class $Br extends telemetryService_1.$Qq {
        constructor(config, injectedTelemetryLevel, _configurationService, _productService) {
            super(config, _configurationService, _productService);
            this.o = injectedTelemetryLevel;
        }
        publicLog(eventName, data) {
            if (this.o < 3 /* TelemetryLevel.USAGE */) {
                return;
            }
            return super.publicLog(eventName, data);
        }
        publicLog2(eventName, data) {
            return this.publicLog(eventName, data);
        }
        publicLogError(errorEventName, data) {
            if (this.o < 2 /* TelemetryLevel.ERROR */) {
                return Promise.resolve(undefined);
            }
            return super.publicLogError(errorEventName, data);
        }
        publicLogError2(eventName, data) {
            return this.publicLogError(eventName, data);
        }
        async updateInjectedTelemetryLevel(telemetryLevel) {
            if (telemetryLevel === undefined) {
                this.o = 0 /* TelemetryLevel.NONE */;
                throw new Error('Telemetry level cannot be undefined. This will cause infinite looping!');
            }
            // We always take the most restrictive level because we don't want multiple clients to connect and send data when one client does not consent
            this.o = this.o ? Math.min(this.o, telemetryLevel) : telemetryLevel;
            if (this.o === 0 /* TelemetryLevel.NONE */) {
                this.dispose();
            }
        }
    };
    exports.$Br = $Br;
    exports.$Br = $Br = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, productService_1.$kj)
    ], $Br);
    exports.$Cr = new class extends telemetryUtils_1.$ao {
        async updateInjectedTelemetryLevel() { return; } // No-op, telemetry is already disabled
    };
    exports.$Dr = (0, instantiation_1.$Ch)(telemetry_1.$9k);
});
//# sourceMappingURL=serverTelemetryService.js.map