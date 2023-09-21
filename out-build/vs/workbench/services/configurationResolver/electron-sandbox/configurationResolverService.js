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
define(["require", "exports", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/platform/instantiation/common/extensions", "vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService", "vs/platform/label/common/label", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, environmentService_1, configuration_1, commands_1, workspace_1, editorService_1, quickInput_1, configurationResolver_1, extensions_1, baseConfigurationResolverService_1, label_1, shellEnvironmentService_1, pathService_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M_b = void 0;
    let $M_b = class $M_b extends baseConfigurationResolverService_1.$y4b {
        constructor(editorService, environmentService, configurationService, commandService, workspaceContextService, quickInputService, labelService, shellEnvironmentService, pathService, extensionService) {
            super({
                getAppRoot: () => {
                    return environmentService.appRoot;
                },
                getExecPath: () => {
                    return environmentService.execPath;
                },
            }, shellEnvironmentService.getShellEnv(), editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService);
        }
    };
    exports.$M_b = $M_b;
    exports.$M_b = $M_b = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, environmentService_1.$1$b),
        __param(2, configuration_1.$8h),
        __param(3, commands_1.$Fr),
        __param(4, workspace_1.$Kh),
        __param(5, quickInput_1.$Gq),
        __param(6, label_1.$Vz),
        __param(7, shellEnvironmentService_1.$K_b),
        __param(8, pathService_1.$yJ),
        __param(9, extensions_2.$MF)
    ], $M_b);
    (0, extensions_1.$mr)(configurationResolver_1.$NM, $M_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=configurationResolverService.js.map