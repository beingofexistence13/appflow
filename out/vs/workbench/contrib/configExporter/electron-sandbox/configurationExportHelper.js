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
define(["require", "exports", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/files/common/files", "vs/base/common/buffer", "vs/base/common/uri", "vs/platform/product/common/productService"], function (require, exports, environmentService_1, platform_1, configurationRegistry_1, extensions_1, commands_1, files_1, buffer_1, uri_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultConfigurationExportHelper = void 0;
    let DefaultConfigurationExportHelper = class DefaultConfigurationExportHelper {
        constructor(environmentService, extensionService, commandService, fileService, productService) {
            this.extensionService = extensionService;
            this.commandService = commandService;
            this.fileService = fileService;
            this.productService = productService;
            const exportDefaultConfigurationPath = environmentService.args['export-default-configuration'];
            if (exportDefaultConfigurationPath) {
                this.writeConfigModelAndQuit(uri_1.URI.file(exportDefaultConfigurationPath));
            }
        }
        async writeConfigModelAndQuit(target) {
            try {
                await this.extensionService.whenInstalledExtensionsRegistered();
                await this.writeConfigModel(target);
            }
            finally {
                this.commandService.executeCommand('workbench.action.quit');
            }
        }
        async writeConfigModel(target) {
            const config = this.getConfigModel();
            const resultString = JSON.stringify(config, undefined, '  ');
            await this.fileService.writeFile(target, buffer_1.VSBuffer.fromString(resultString));
        }
        getConfigModel() {
            const configRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            const configurations = configRegistry.getConfigurations().slice();
            const settings = [];
            const processedNames = new Set();
            const processProperty = (name, prop) => {
                if (processedNames.has(name)) {
                    console.warn('Setting is registered twice: ' + name);
                    return;
                }
                processedNames.add(name);
                const propDetails = {
                    name,
                    description: prop.description || prop.markdownDescription || '',
                    default: prop.default,
                    type: prop.type
                };
                if (prop.enum) {
                    propDetails.enum = prop.enum;
                }
                if (prop.enumDescriptions || prop.markdownEnumDescriptions) {
                    propDetails.enumDescriptions = prop.enumDescriptions || prop.markdownEnumDescriptions;
                }
                settings.push(propDetails);
            };
            const processConfig = (config) => {
                if (config.properties) {
                    for (const name in config.properties) {
                        processProperty(name, config.properties[name]);
                    }
                }
                config.allOf?.forEach(processConfig);
            };
            configurations.forEach(processConfig);
            const excludedProps = configRegistry.getExcludedConfigurationProperties();
            for (const name in excludedProps) {
                processProperty(name, excludedProps[name]);
            }
            const result = {
                settings: settings.sort((a, b) => a.name.localeCompare(b.name)),
                buildTime: Date.now(),
                commit: this.productService.commit,
                buildNumber: this.productService.settingsSearchBuildId
            };
            return result;
        }
    };
    exports.DefaultConfigurationExportHelper = DefaultConfigurationExportHelper;
    exports.DefaultConfigurationExportHelper = DefaultConfigurationExportHelper = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, extensions_1.IExtensionService),
        __param(2, commands_1.ICommandService),
        __param(3, files_1.IFileService),
        __param(4, productService_1.IProductService)
    ], DefaultConfigurationExportHelper);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkV4cG9ydEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbmZpZ0V4cG9ydGVyL2VsZWN0cm9uLXNhbmRib3gvY29uZmlndXJhdGlvbkV4cG9ydEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0QnpGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWdDO1FBRTVDLFlBQ3FDLGtCQUFzRCxFQUN0RCxnQkFBbUMsRUFDckMsY0FBK0IsRUFDbEMsV0FBeUIsRUFDdEIsY0FBK0I7WUFIN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDdEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBRWpFLE1BQU0sOEJBQThCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDL0YsSUFBSSw4QkFBOEIsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxNQUFXO1lBQ2hELElBQUk7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztnQkFDaEUsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEM7b0JBQVM7Z0JBQ1QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUM1RDtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBVztZQUN6QyxNQUFN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