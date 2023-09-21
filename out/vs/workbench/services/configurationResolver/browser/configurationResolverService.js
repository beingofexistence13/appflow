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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/path/common/pathService"], function (require, exports, commands_1, configuration_1, extensions_1, label_1, quickInput_1, workspace_1, baseConfigurationResolverService_1, configurationResolver_1, editorService_1, extensions_2, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationResolverService = void 0;
    let ConfigurationResolverService = class ConfigurationResolverService extends baseConfigurationResolverService_1.BaseConfigurationResolverService {
        constructor(editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService) {
            super({ getAppRoot: () => undefined, getExecPath: () => undefined }, Promise.resolve(Object.create(null)), editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService);
        }
    };
    exports.ConfigurationResolverService = ConfigurationResolverService;
    exports.ConfigurationResolverService = ConfigurationResolverService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, commands_1.ICommandService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, label_1.ILabelService),
        __param(6, pathService_1.IPathService),
        __param(7, extensions_2.IExtensionService)
    ], ConfigurationResolverService);
    (0, extensions_1.registerSingleton)(configurationResolver_1.IConfigurationResolverService, ConfigurationResolverService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlc29sdmVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uUmVzb2x2ZXIvYnJvd3Nlci9jb25maWd1cmF0aW9uUmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLG1FQUFnQztRQUVqRixZQUNpQixhQUE2QixFQUN0QixvQkFBMkMsRUFDakQsY0FBK0IsRUFDdEIsdUJBQWlELEVBQ3ZELGlCQUFxQyxFQUMxQyxZQUEyQixFQUM1QixXQUF5QixFQUNwQixnQkFBbUM7WUFFdEQsS0FBSyxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQ2xFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFDekUsY0FBYyxFQUFFLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUMzRyxDQUFDO0tBQ0QsQ0FBQTtJQWhCWSxvRUFBNEI7MkNBQTVCLDRCQUE0QjtRQUd0QyxXQUFBLDhCQUFjLENBQUE7UUFDZCxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsMEJBQWUsQ0FBQTtRQUNmLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDBCQUFZLENBQUE7UUFDWixXQUFBLDhCQUFpQixDQUFBO09BVlAsNEJBQTRCLENBZ0J4QztJQUVELElBQUEsOEJBQWlCLEVBQUMscURBQTZCLEVBQUUsNEJBQTRCLG9DQUE0QixDQUFDIn0=