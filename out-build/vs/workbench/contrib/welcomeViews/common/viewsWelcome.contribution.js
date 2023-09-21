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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/welcomeViews/common/viewsWelcomeContribution", "vs/workbench/contrib/welcomeViews/common/viewsWelcomeExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, instantiation_1, platform_1, contributions_1, viewsWelcomeContribution_1, viewsWelcomeExtensionPoint_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const extensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint(viewsWelcomeExtensionPoint_1.$aZb);
    let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
        constructor(instantiationService) {
            instantiationService.createInstance(viewsWelcomeContribution_1.$bZb, extensionPoint);
        }
    };
    WorkbenchConfigurationContribution = __decorate([
        __param(0, instantiation_1.$Ah)
    ], WorkbenchConfigurationContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkbenchConfigurationContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=viewsWelcome.contribution.js.map