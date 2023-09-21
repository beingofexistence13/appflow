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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/contrib/configExporter/electron-sandbox/configurationExportHelper"], function (require, exports, contributions_1, platform_1, instantiation_1, environmentService_1, configurationExportHelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionPoints = void 0;
    let ExtensionPoints = class ExtensionPoints {
        constructor(instantiationService, environmentService) {
            // Config Exporter
            if (environmentService.args['export-default-configuration']) {
                instantiationService.createInstance(configurationExportHelper_1.DefaultConfigurationExportHelper);
            }
        }
    };
    exports.ExtensionPoints = ExtensionPoints;
    exports.ExtensionPoints = ExtensionPoints = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService)
    ], ExtensionPoints);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionPoints, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkV4cG9ydEhlbHBlci5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb25maWdFeHBvcnRlci9lbGVjdHJvbi1zYW5kYm94L2NvbmZpZ3VyYXRpb25FeHBvcnRIZWxwZXIuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO1FBRTNCLFlBQ3dCLG9CQUEyQyxFQUM5QixrQkFBc0Q7WUFFMUYsa0JBQWtCO1lBQ2xCLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLEVBQUU7Z0JBQzVELG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw0REFBZ0MsQ0FBQyxDQUFDO2FBQ3RFO1FBQ0YsQ0FBQztLQUNELENBQUE7SUFYWSwwQ0FBZTs4QkFBZixlQUFlO1FBR3pCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSx1REFBa0MsQ0FBQTtPQUp4QixlQUFlLENBVzNCO0lBRUQsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLGVBQWUsa0NBQTBCLENBQUMifQ==