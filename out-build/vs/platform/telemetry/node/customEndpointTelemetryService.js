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
    exports.$S7b = void 0;
    let $S7b = class $S7b {
        constructor(b, c, d, e, f, g) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = new Map();
        }
        h(endpoint) {
            if (!this.a.has(endpoint.id)) {
                const telemetryInfo = Object.create(null);
                telemetryInfo['common.vscodemachineid'] = this.c.machineId;
                telemetryInfo['common.vscodesessionid'] = this.c.sessionId;
                const args = [endpoint.id, JSON.stringify(telemetryInfo), endpoint.aiKey];
                const client = new ipc_cp_1.$Sp(network_1.$2f.asFileUri('bootstrap-fork').fsPath, {
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
                    new telemetryIpc_1.$C6b(channel),
                    new telemetryLogAppender_1.$43b(this.d, this.e, this.f, this.g, `[${endpoint.id}] `),
                ];
                this.a.set(endpoint.id, new telemetryService_1.$Qq({
                    appenders,
                    sendErrorTelemetry: endpoint.sendErrorTelemetry
                }, this.b, this.g));
            }
            return this.a.get(endpoint.id);
        }
        publicLog(telemetryEndpoint, eventName, data) {
            const customTelemetryService = this.h(telemetryEndpoint);
            customTelemetryService.publicLog(eventName, data);
        }
        publicLogError(telemetryEndpoint, errorEventName, data) {
            const customTelemetryService = this.h(telemetryEndpoint);
            customTelemetryService.publicLogError(errorEventName, data);
        }
    };
    exports.$S7b = $S7b;
    exports.$S7b = $S7b = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, telemetry_1.$9k),
        __param(2, log_1.$5i),
        __param(3, log_1.$6i),
        __param(4, environment_1.$Ih),
        __param(5, productService_1.$kj)
    ], $S7b);
});
//# sourceMappingURL=customEndpointTelemetryService.js.map