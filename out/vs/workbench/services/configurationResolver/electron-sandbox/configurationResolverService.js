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
    exports.ConfigurationResolverService = void 0;
    let ConfigurationResolverService = class ConfigurationResolverService extends baseConfigurationResolverService_1.BaseConfigurationResolverService {
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
    exports.ConfigurationResolverService = ConfigurationResolverService;
    exports.ConfigurationResolverService = ConfigurationResolverService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, commands_1.ICommandService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, label_1.ILabelService),
        __param(7, shellEnvironmentService_1.IShellEnvironmentService),
        __param(8, pathService_1.IPathService),
        __param(9, extensions_2.IExtensionService)
    ], ConfigurationResolverService);
    (0, extensions_1.registerSingleton)(configurationResolver_1.IConfigurationResolverService, ConfigurationResolverService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlc29sdmVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uUmVzb2x2ZXIvZWxlY3Ryb24tc2FuZGJveC9jb25maWd1cmF0aW9uUmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSxtRUFBZ0M7UUFFakYsWUFDaUIsYUFBNkIsRUFDVCxrQkFBc0QsRUFDbkUsb0JBQTJDLEVBQ2pELGNBQStCLEVBQ3RCLHVCQUFpRCxFQUN2RCxpQkFBcUMsRUFDMUMsWUFBMkIsRUFDaEIsdUJBQWlELEVBQzdELFdBQXlCLEVBQ3BCLGdCQUFtQztZQUV0RCxLQUFLLENBQUM7Z0JBQ0wsVUFBVSxFQUFFLEdBQXVCLEVBQUU7b0JBQ3BDLE9BQU8sa0JBQWtCLENBQUMsT0FBTyxDQUFDO2dCQUNuQyxDQUFDO2dCQUNELFdBQVcsRUFBRSxHQUF1QixFQUFFO29CQUNyQyxPQUFPLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztnQkFDcEMsQ0FBQzthQUNELEVBQUUsdUJBQXVCLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFDNUYsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNGLENBQUM7S0FDRCxDQUFBO0lBeEJZLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBR3RDLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsdURBQWtDLENBQUE7UUFDbEMsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDBCQUFlLENBQUE7UUFDZixXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxrREFBd0IsQ0FBQTtRQUN4QixXQUFBLDBCQUFZLENBQUE7UUFDWixXQUFBLDhCQUFpQixDQUFBO09BWlAsNEJBQTRCLENBd0J4QztJQUVELElBQUEsOEJBQWlCLEVBQUMscURBQTZCLEVBQUUsNEJBQTRCLG9DQUE0QixDQUFDIn0=