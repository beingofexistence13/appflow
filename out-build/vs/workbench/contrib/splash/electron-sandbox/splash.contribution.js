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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/splash/browser/splash", "vs/platform/native/common/native", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/splash/browser/partsSplash"], function (require, exports, platform_1, contributions_1, splash_1, native_1, extensions_1, partsSplash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let SplashStorageService = class SplashStorageService {
        constructor(nativeHostService) {
            this.saveWindowSplash = nativeHostService.saveWindowSplash.bind(nativeHostService);
        }
    };
    SplashStorageService = __decorate([
        __param(0, native_1.$05b)
    ], SplashStorageService);
    (0, extensions_1.$mr)(splash_1.$f5b, SplashStorageService, 1 /* InstantiationType.Delayed */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(partsSplash_1.$g5b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=splash.contribution.js.map