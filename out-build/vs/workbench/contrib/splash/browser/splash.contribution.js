/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/splash/browser/splash", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/splash/browser/partsSplash"], function (require, exports, platform_1, contributions_1, splash_1, extensions_1, partsSplash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(splash_1.$f5b, class SplashStorageService {
        async saveWindowSplash(splash) {
            const raw = JSON.stringify(splash);
            localStorage.setItem('monaco-parts-splash', raw);
        }
    }, 1 /* InstantiationType.Delayed */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(partsSplash_1.$g5b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=splash.contribution.js.map