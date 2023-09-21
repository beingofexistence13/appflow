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
    const codeActionsExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint(codeActionsExtensionPoint_1.$h1b);
    const documentationExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint(documentationExtensionPoint_1.$i1b);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration(codeActionsContribution_1.$j1b);
    let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
        constructor(instantiationService) {
            instantiationService.createInstance(codeActionsContribution_1.$k1b, codeActionsExtensionPoint);
            instantiationService.createInstance(documentationContribution_1.$l1b, documentationExtensionPoint);
        }
    };
    WorkbenchConfigurationContribution = __decorate([
        __param(0, instantiation_1.$Ah)
    ], WorkbenchConfigurationContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkbenchConfigurationContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=codeActions.contribution.js.map