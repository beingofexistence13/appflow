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
define(["require", "exports", "vs/base/common/cancellation", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/update/electron-main/abstractUpdateService"], function (require, exports, cancellation_1, configuration_1, environmentMainService_1, lifecycleMainService_1, log_1, nativeHostMainService_1, productService_1, request_1, telemetry_1, update_1, abstractUpdateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I6b = void 0;
    let $I6b = class $I6b extends abstractUpdateService_1.$G6b {
        constructor(lifecycleMainService, configurationService, e, environmentMainService, requestService, logService, u, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.e = e;
            this.u = u;
        }
        s(quality) {
            return (0, abstractUpdateService_1.$F6b)(`linux-${process.arch}`, quality, this.k);
        }
        t(context) {
            if (!this.a) {
                return;
            }
            this.d(update_1.$TT.CheckingForUpdates(context));
            this.i.request({ url: this.a }, cancellation_1.CancellationToken.None)
                .then(request_1.$Oo)
                .then(update => {
                if (!update || !update.url || !update.version || !update.productVersion) {
                    this.e.publicLog2('update:notAvailable', { explicit: !!context });
                    this.d(update_1.$TT.Idle(1 /* UpdateType.Archive */));
                }
                else {
                    this.d(update_1.$TT.AvailableForDownload(update));
                }
            })
                .then(undefined, err => {
                this.j.error(err);
                this.e.publicLog2('update:notAvailable', { explicit: !!context });
                // only show message when explicitly checking for updates
                const message = !!context ? (err.message || err) : undefined;
                this.d(update_1.$TT.Idle(1 /* UpdateType.Archive */, message));
            });
        }
        async o(state) {
            // Use the download URL if available as we don't currently detect the package type that was
            // installed and the website download page is more useful than the tarball generally.
            if (this.k.downloadUrl && this.k.downloadUrl.length > 0) {
                this.u.openExternal(undefined, this.k.downloadUrl);
            }
            else if (state.update.url) {
                this.u.openExternal(undefined, state.update.url);
            }
            this.d(update_1.$TT.Idle(1 /* UpdateType.Archive */));
        }
    };
    exports.$I6b = $I6b;
    exports.$I6b = $I6b = __decorate([
        __param(0, lifecycleMainService_1.$p5b),
        __param(1, configuration_1.$8h),
        __param(2, telemetry_1.$9k),
        __param(3, environmentMainService_1.$n5b),
        __param(4, request_1.$Io),
        __param(5, log_1.$5i),
        __param(6, nativeHostMainService_1.$c6b),
        __param(7, productService_1.$kj)
    ], $I6b);
});
//# sourceMappingURL=updateService.linux.js.map