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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/workbench/services/extensions/common/extensions", "vs/base/common/performance"], function (require, exports, instantiation_1, contributions_1, platform_1, platform_2, extensions_1, performance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xzb = exports.$wzb = void 0;
    exports.$wzb = (0, instantiation_1.$Bh)('IUserDataInitializationService');
    class $xzb {
        constructor(a = []) {
            this.a = a;
        }
        async whenInitializationFinished() {
            if (await this.requiresInitialization()) {
                await Promise.all(this.a.map(initializer => initializer.whenInitializationFinished()));
            }
        }
        async requiresInitialization() {
            return (await Promise.all(this.a.map(initializer => initializer.requiresInitialization()))).some(result => result);
        }
        async initializeRequiredResources() {
            if (await this.requiresInitialization()) {
                await Promise.all(this.a.map(initializer => initializer.initializeRequiredResources()));
            }
        }
        async initializeOtherResources(instantiationService) {
            if (await this.requiresInitialization()) {
                await Promise.all(this.a.map(initializer => initializer.initializeOtherResources(instantiationService)));
            }
        }
        async initializeInstalledExtensions(instantiationService) {
            if (await this.requiresInitialization()) {
                await Promise.all(this.a.map(initializer => initializer.initializeInstalledExtensions(instantiationService)));
            }
        }
    }
    exports.$xzb = $xzb;
    let InitializeOtherResourcesContribution = class InitializeOtherResourcesContribution {
        constructor(userDataInitializeService, instantiationService, extensionService) {
            extensionService.whenInstalledExtensionsRegistered().then(() => this.a(userDataInitializeService, instantiationService));
        }
        async a(userDataInitializeService, instantiationService) {
            if (await userDataInitializeService.requiresInitialization()) {
                (0, performance_1.mark)('code/willInitOtherUserData');
                await userDataInitializeService.initializeOtherResources(instantiationService);
                (0, performance_1.mark)('code/didInitOtherUserData');
            }
        }
    };
    InitializeOtherResourcesContribution = __decorate([
        __param(0, exports.$wzb),
        __param(1, instantiation_1.$Ah),
        __param(2, extensions_1.$MF)
    ], InitializeOtherResourcesContribution);
    if (platform_2.$o) {
        const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(InitializeOtherResourcesContribution, 3 /* LifecyclePhase.Restored */);
    }
});
//# sourceMappingURL=userDataInit.js.map