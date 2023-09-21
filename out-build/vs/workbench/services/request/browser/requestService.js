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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/request/common/requestIpc", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/request/browser/requestService", "vs/platform/commands/common/commands"], function (require, exports, configuration_1, log_1, requestIpc_1, remoteAgentService_1, requestService_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$D2b = void 0;
    let $D2b = class $D2b extends requestService_1.$C2b {
        constructor(g, configurationService, loggerService) {
            super(configurationService, loggerService);
            this.g = g;
        }
        async request(options, token) {
            try {
                const context = await super.request(options, token);
                const connection = this.g.getConnection();
                if (connection && context.res.statusCode === 405) {
                    return this.h(connection, options, token);
                }
                return context;
            }
            catch (error) {
                const connection = this.g.getConnection();
                if (connection) {
                    return this.h(connection, options, token);
                }
                throw error;
            }
        }
        h(connection, options, token) {
            return connection.withChannel('request', channel => new requestIpc_1.$Mq(channel).request(options, token));
        }
    };
    exports.$D2b = $D2b;
    exports.$D2b = $D2b = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, configuration_1.$8h),
        __param(2, log_1.$6i)
    ], $D2b);
    // --- Internal commands to help authentication for extensions
    commands_1.$Gr.registerCommand('_workbench.fetchJSON', async function (accessor, url, method) {
        const result = await fetch(url, { method, headers: { Accept: 'application/json' } });
        if (result.ok) {
            return result.json();
        }
        else {
            throw new Error(result.statusText);
        }
    });
});
//# sourceMappingURL=requestService.js.map