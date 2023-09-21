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
define(["require", "exports", "electron", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/update/electron-main/abstractUpdateService"], function (require, exports, electron, decorators_1, event_1, lifecycle_1, configuration_1, environmentMainService_1, lifecycleMainService_1, log_1, productService_1, request_1, telemetry_1, update_1, abstractUpdateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H6b = void 0;
    let $H6b = class $H6b extends abstractUpdateService_1.$G6b {
        get v() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'error', (_, message) => message); }
        get w() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-not-available'); }
        get x() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-available', (_, url, version) => ({ url, version, productVersion: version })); }
        get y() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-downloaded', (_, releaseNotes, version, date) => ({ releaseNotes, version, productVersion: version, date })); }
        constructor(lifecycleMainService, configurationService, z, environmentMainService, requestService, logService, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.z = z;
            this.u = new lifecycle_1.$jc();
            lifecycleMainService.setRelaunchHandler(this);
        }
        handleRelaunch(options) {
            if (options?.addArgs || options?.removeArgs) {
                return false; // we cannot apply an update and restart with different args
            }
            if (this.state.type !== "ready" /* StateType.Ready */) {
                return false; // we only handle the relaunch when we have a pending update
            }
            this.j.trace('update#handleRelaunch(): running raw#quitAndInstall()');
            this.r();
            return true;
        }
        async l() {
            await super.l();
            this.v(this.B, this, this.u);
            this.x(this.E, this, this.u);
            this.y(this.F, this, this.u);
            this.w(this.G, this, this.u);
        }
        B(err) {
            this.j.error('UpdateService error:', err);
            // only show message when explicitly checking for updates
            const message = (this.state.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.state.explicit) ? err : undefined;
            this.d(update_1.$TT.Idle(1 /* UpdateType.Archive */, message));
        }
        s(quality) {
            let assetID;
            if (!this.k.darwinUniversalAssetId) {
                assetID = process.arch === 'x64' ? 'darwin' : 'darwin-arm64';
            }
            else {
                assetID = this.k.darwinUniversalAssetId;
            }
            const url = (0, abstractUpdateService_1.$F6b)(assetID, quality, this.k);
            try {
                electron.autoUpdater.setFeedURL({ url });
            }
            catch (e) {
                // application is very likely not signed
                this.j.error('Failed to set update feed URL', e);
                return undefined;
            }
            return url;
        }
        t(context) {
            this.d(update_1.$TT.CheckingForUpdates(context));
            electron.autoUpdater.checkForUpdates();
        }
        E(update) {
            if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
                return;
            }
            this.d(update_1.$TT.Downloading(update));
        }
        F(update) {
            if (this.state.type !== "downloading" /* StateType.Downloading */) {
                return;
            }
            this.z.publicLog2('update:downloaded', { version: update.version });
            this.d(update_1.$TT.Ready(update));
        }
        G() {
            if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
                return;
            }
            this.z.publicLog2('update:notAvailable', { explicit: this.state.explicit });
            this.d(update_1.$TT.Idle(1 /* UpdateType.Archive */));
        }
        r() {
            this.j.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            electron.autoUpdater.quitAndInstall();
        }
        dispose() {
            this.u.dispose();
        }
    };
    exports.$H6b = $H6b;
    __decorate([
        decorators_1.$6g
    ], $H6b.prototype, "v", null);
    __decorate([
        decorators_1.$6g
    ], $H6b.prototype, "w", null);
    __decorate([
        decorators_1.$6g
    ], $H6b.prototype, "x", null);
    __decorate([
        decorators_1.$6g
    ], $H6b.prototype, "y", null);
    exports.$H6b = $H6b = __decorate([
        __param(0, lifecycleMainService_1.$p5b),
        __param(1, configuration_1.$8h),
        __param(2, telemetry_1.$9k),
        __param(3, environmentMainService_1.$n5b),
        __param(4, request_1.$Io),
        __param(5, log_1.$5i),
        __param(6, productService_1.$kj)
    ], $H6b);
});
//# sourceMappingURL=updateService.darwin.js.map