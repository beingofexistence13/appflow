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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/update/common/update"], function (require, exports, async_1, cancellation_1, event_1, configuration_1, environmentMainService_1, lifecycleMainService_1, log_1, productService_1, request_1, update_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G6b = exports.$F6b = void 0;
    function $F6b(platform, quality, productService) {
        return `${productService.updateUrl}/api/update/${platform}/${quality}/${productService.commit}`;
    }
    exports.$F6b = $F6b;
    let $G6b = class $G6b {
        get state() {
            return this.b;
        }
        d(state) {
            this.j.info('update#setState', state.type);
            this.b = state;
            this.c.fire(state);
        }
        constructor(f, g, h, i, j, k) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.b = update_1.$TT.Uninitialized;
            this.c = new event_1.$fd();
            this.onStateChange = this.c.event;
            f.when(3 /* LifecycleMainPhase.AfterWindowOpen */)
                .finally(() => this.l());
        }
        /**
         * This must be called before any other call. This is a performance
         * optimization, to avoid using extra CPU cycles before first window open.
         * https://github.com/microsoft/vscode/issues/89784
         */
        async l() {
            if (!this.h.isBuilt) {
                this.d(update_1.$TT.Disabled(0 /* DisablementReason.NotBuilt */));
                return; // updates are never enabled when running out of sources
            }
            if (this.h.disableUpdates) {
                this.d(update_1.$TT.Disabled(1 /* DisablementReason.DisabledByEnvironment */));
                this.j.info('update#ctor - updates are disabled by the environment');
                return;
            }
            if (!this.k.updateUrl || !this.k.commit) {
                this.d(update_1.$TT.Disabled(3 /* DisablementReason.MissingConfiguration */));
                this.j.info('update#ctor - updates are disabled as there is no update URL');
                return;
            }
            const updateMode = this.g.getValue('update.mode');
            const quality = this.m(updateMode);
            if (!quality) {
                this.d(update_1.$TT.Disabled(2 /* DisablementReason.ManuallyDisabled */));
                this.j.info('update#ctor - updates are disabled by user preference');
                return;
            }
            this.a = this.s(quality);
            if (!this.a) {
                this.d(update_1.$TT.Disabled(4 /* DisablementReason.InvalidConfiguration */));
                this.j.info('update#ctor - updates are disabled as the update URL is badly formed');
                return;
            }
            this.d(update_1.$TT.Idle(this.q()));
            if (updateMode === 'manual') {
                this.j.info('update#ctor - manual checks only; automatic updates are disabled by user preference');
                return;
            }
            if (updateMode === 'start') {
                this.j.info('update#ctor - startup checks only; automatic updates are disabled by user preference');
                // Check for updates only once after 30 seconds
                setTimeout(() => this.checkForUpdates(false), 30 * 1000);
            }
            else {
                // Start checking for updates after 30 seconds
                this.n(30 * 1000).then(undefined, err => this.j.error(err));
            }
        }
        m(updateMode) {
            return updateMode === 'none' ? undefined : this.k.quality;
        }
        n(delay = 60 * 60 * 1000) {
            return (0, async_1.$Hg)(delay)
                .then(() => this.checkForUpdates(false))
                .then(() => {
                // Check again after 1 hour
                return this.n(60 * 60 * 1000);
            });
        }
        async checkForUpdates(explicit) {
            this.j.trace('update#checkForUpdates, state = ', this.state.type);
            if (this.state.type !== "idle" /* StateType.Idle */) {
                return;
            }
            this.t(explicit);
        }
        async downloadUpdate() {
            this.j.trace('update#downloadUpdate, state = ', this.state.type);
            if (this.state.type !== "available for download" /* StateType.AvailableForDownload */) {
                return;
            }
            await this.o(this.state);
        }
        async o(state) {
            // noop
        }
        async applyUpdate() {
            this.j.trace('update#applyUpdate, state = ', this.state.type);
            if (this.state.type !== "downloaded" /* StateType.Downloaded */) {
                return;
            }
            await this.p();
        }
        async p() {
            // noop
        }
        quitAndInstall() {
            this.j.trace('update#quitAndInstall, state = ', this.state.type);
            if (this.state.type !== "ready" /* StateType.Ready */) {
                return Promise.resolve(undefined);
            }
            this.j.trace('update#quitAndInstall(): before lifecycle quit()');
            this.f.quit(true /* will restart */).then(vetod => {
                this.j.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
                if (vetod) {
                    return;
                }
                this.j.trace('update#quitAndInstall(): running raw#quitAndInstall()');
                this.r();
            });
            return Promise.resolve(undefined);
        }
        async isLatestVersion() {
            if (!this.a) {
                return undefined;
            }
            const mode = this.g.getValue('update.mode');
            if (mode === 'none') {
                return false;
            }
            try {
                const context = await this.i.request({ url: this.a }, cancellation_1.CancellationToken.None);
                // The update server replies with 204 (No Content) when no
                // update is available - that's all we want to know.
                return context.res.statusCode === 204;
            }
            catch (error) {
                this.j.error('update#isLatestVersion(): failed to check for updates');
                this.j.error(error);
                return undefined;
            }
        }
        async _applySpecificUpdate(packagePath) {
            // noop
        }
        q() {
            return 1 /* UpdateType.Archive */;
        }
        r() {
            // noop
        }
    };
    exports.$G6b = $G6b;
    exports.$G6b = $G6b = __decorate([
        __param(0, lifecycleMainService_1.$p5b),
        __param(1, configuration_1.$8h),
        __param(2, environmentMainService_1.$n5b),
        __param(3, request_1.$Io),
        __param(4, log_1.$5i),
        __param(5, productService_1.$kj)
    ], $G6b);
});
//# sourceMappingURL=abstractUpdateService.js.map