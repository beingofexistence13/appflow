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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/banner/browser/bannerService", "vs/platform/storage/common/storage", "vs/workbench/services/environment/browser/environmentService", "vs/base/common/uri", "vs/base/common/themables"], function (require, exports, platform_1, contributions_1, bannerService_1, storage_1, environmentService_1, uri_1, themables_1) {
    "use strict";
    var WelcomeBannerContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let WelcomeBannerContribution = class WelcomeBannerContribution {
        static { WelcomeBannerContribution_1 = this; }
        static { this.a = 'workbench.banner.welcome.dismissed'; }
        constructor(bannerService, storageService, environmentService) {
            const welcomeBanner = environmentService.options?.welcomeBanner;
            if (!welcomeBanner) {
                return; // welcome banner is not enabled
            }
            if (storageService.getBoolean(WelcomeBannerContribution_1.a, 0 /* StorageScope.PROFILE */, false)) {
                return; // welcome banner dismissed
            }
            let icon = undefined;
            if (typeof welcomeBanner.icon === 'string') {
                icon = themables_1.ThemeIcon.fromId(welcomeBanner.icon);
            }
            else if (welcomeBanner.icon) {
                icon = uri_1.URI.revive(welcomeBanner.icon);
            }
            bannerService.show({
                id: 'welcome.banner',
                message: welcomeBanner.message,
                icon,
                actions: welcomeBanner.actions,
                onClose: () => {
                    storageService.store(WelcomeBannerContribution_1.a, true, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                }
            });
        }
    };
    WelcomeBannerContribution = WelcomeBannerContribution_1 = __decorate([
        __param(0, bannerService_1.$_xb),
        __param(1, storage_1.$Vo),
        __param(2, environmentService_1.$LT)
    ], WelcomeBannerContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WelcomeBannerContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=welcomeBanner.contribution.js.map