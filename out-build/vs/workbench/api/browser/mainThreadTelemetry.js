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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol"], function (require, exports, lifecycle_1, configuration_1, environment_1, productService_1, telemetry_1, telemetryUtils_1, extHostCustomers_1, extHost_protocol_1) {
    "use strict";
    var $Rkb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rkb = void 0;
    let $Rkb = class $Rkb extends lifecycle_1.$kc {
        static { $Rkb_1 = this; }
        static { this.b = 'pluginHostTelemetry'; }
        constructor(extHostContext, c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostTelemetry);
            if ((0, telemetryUtils_1.$ho)(this.h, this.g)) {
                this.B(this.f.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(telemetry_1.$dl) || e.affectsConfiguration(telemetry_1.$fl)) {
                        this.a.$onDidChangeTelemetryLevel(this.j);
                    }
                }));
            }
            this.a.$initializeTelemetryLevel(this.j, (0, telemetryUtils_1.$ho)(this.h, this.g), this.h.enabledTelemetryLevels);
        }
        get j() {
            if (!(0, telemetryUtils_1.$ho)(this.h, this.g)) {
                return 0 /* TelemetryLevel.NONE */;
            }
            return this.c.telemetryLevel;
        }
        $publicLog(eventName, data = Object.create(null)) {
            // __GDPR__COMMON__ "pluginHostTelemetry" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            data[$Rkb_1.b] = true;
            this.c.publicLog(eventName, data);
        }
        $publicLog2(eventName, data) {
            this.$publicLog(eventName, data);
        }
    };
    exports.$Rkb = $Rkb;
    exports.$Rkb = $Rkb = $Rkb_1 = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTelemetry),
        __param(1, telemetry_1.$9k),
        __param(2, configuration_1.$8h),
        __param(3, environment_1.$Ih),
        __param(4, productService_1.$kj)
    ], $Rkb);
});
//# sourceMappingURL=mainThreadTelemetry.js.map