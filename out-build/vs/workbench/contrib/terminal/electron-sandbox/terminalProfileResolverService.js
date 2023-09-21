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
define(["require", "exports", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalProfileResolverService", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, errors_1, configuration_1, terminal_1, workspace_1, terminal_2, terminalProfileResolverService_1, terminal_3, configurationResolver_1, history_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cac = void 0;
    let $Cac = class $Cac extends terminalProfileResolverService_1.$$4b {
        constructor(configurationResolverService, configurationService, historyService, logService, workspaceContextService, terminalProfileService, remoteAgentService, terminalInstanceService) {
            super({
                getDefaultSystemShell: async (remoteAuthority, platform) => {
                    const backend = await terminalInstanceService.getBackend(remoteAuthority);
                    if (!backend) {
                        throw new errors_1.$_(`Cannot get default system shell when there is no backend for remote authority '${remoteAuthority}'`);
                    }
                    return backend.getDefaultSystemShell(platform);
                },
                getEnvironment: async (remoteAuthority) => {
                    const backend = await terminalInstanceService.getBackend(remoteAuthority);
                    if (!backend) {
                        throw new errors_1.$_(`Cannot get environment when there is no backend for remote authority '${remoteAuthority}'`);
                    }
                    return backend.getEnvironment();
                }
            }, configurationService, configurationResolverService, historyService, logService, terminalProfileService, workspaceContextService, remoteAgentService);
        }
    };
    exports.$Cac = $Cac;
    exports.$Cac = $Cac = __decorate([
        __param(0, configurationResolver_1.$NM),
        __param(1, configuration_1.$8h),
        __param(2, history_1.$SM),
        __param(3, terminal_1.$Zq),
        __param(4, workspace_1.$Kh),
        __param(5, terminal_3.$GM),
        __param(6, remoteAgentService_1.$jm),
        __param(7, terminal_2.$Pib)
    ], $Cac);
});
//# sourceMappingURL=terminalProfileResolverService.js.map