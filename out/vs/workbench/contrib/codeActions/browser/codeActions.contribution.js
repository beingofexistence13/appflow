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
define(["require", "exports", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint", "vs/workbench/contrib/codeActions/common/documentationExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "./codeActionsContribution", "./documentationContribution"], function (require, exports, configurationRegistry_1, instantiation_1, platform_1, contributions_1, codeActionsExtensionPoint_1, documentationExtensionPoint_1, extensionsRegistry_1, codeActionsContribution_1, documentationContribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const codeActionsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint(codeActionsExtensionPoint_1.codeActionsExtensionPointDescriptor);
    const documentationExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint(documentationExtensionPoint_1.documentationExtensionPointDescriptor);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration(codeActionsContribution_1.editorConfiguration);
    let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
        constructor(instantiationService) {
            instantiationService.createInstance(codeActionsContribution_1.CodeActionsContribution, codeActionsExtensionPoint);
            instantiationService.createInstance(documentationContribution_1.CodeActionDocumentationContribution, documentationExtensionPoint);
        }
    };
    WorkbenchConfigurationContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], WorkbenchConfigurationContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkbenchConfigurationContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbnMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUFjdGlvbnMvYnJvd3Nlci9jb2RlQWN0aW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFhaEcsTUFBTSx5QkFBeUIsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBOEIsK0RBQW1DLENBQUMsQ0FBQztJQUM5SSxNQUFNLDJCQUEyQixHQUFHLHVDQUFrQixDQUFDLHNCQUFzQixDQUE4QixtRUFBcUMsQ0FBQyxDQUFDO0lBRWxKLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBVSxDQUFDLGFBQWEsQ0FBQztTQUMzRCxxQkFBcUIsQ0FBQyw2Q0FBbUIsQ0FBQyxDQUFDO0lBRTdDLElBQU0sa0NBQWtDLEdBQXhDLE1BQU0sa0NBQWtDO1FBQ3ZDLFlBQ3dCLG9CQUEyQztZQUVsRSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaURBQXVCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztZQUN4RixvQkFBb0IsQ0FBQyxjQUFjLENBQUMsK0RBQW1DLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUN2RyxDQUFDO0tBQ0QsQ0FBQTtJQVBLLGtDQUFrQztRQUVyQyxXQUFBLHFDQUFxQixDQUFBO09BRmxCLGtDQUFrQyxDQU92QztJQUVELG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUM7U0FDekUsNkJBQTZCLENBQUMsa0NBQWtDLG9DQUE0QixDQUFDIn0=