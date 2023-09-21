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
    exports.DarwinUpdateService = void 0;
    let DarwinUpdateService = class DarwinUpdateService extends abstractUpdateService_1.AbstractUpdateService {
        get onRawError() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'error', (_, message) => message); }
        get onRawUpdateNotAvailable() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-not-available'); }
        get onRawUpdateAvailable() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-available', (_, url, version) => ({ url, version, productVersion: version })); }
        get onRawUpdateDownloaded() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-downloaded', (_, releaseNotes, version, date) => ({ releaseNotes, version, productVersion: version, date })); }
        constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.telemetryService = telemetryService;
            this.disposables = new lifecycle_1.DisposableStore();
            lifecycleMainService.setRelaunchHandler(this);
        }
        handleRelaunch(options) {
            if (options?.addArgs || options?.removeArgs) {
                return false; // we cannot apply an update and restart with different args
            }
            if (this.state.type !== "ready" /* StateType.Ready */) {
                return false; // we only handle the relaunch when we have a pending update
            }
            this.logService.trace('update#handleRelaunch(): running raw#quitAndInstall()');
            this.doQuitAndInstall();
            return true;
        }
        async initialize() {
            await super.initialize();
            this.onRawError(this.onError, this, this.disposables);
            this.onRawUpdateAvailable(this.onUpdateAvailable, this, this.disposables);
            this.onRawUpdateDownloaded(this.onUpdateDownloaded, this, this.disposables);
            this.onRawUpdateNotAvailable(this.onUpdateNotAvailable, this, this.disposables);
        }
        onError(err) {
            this.logService.error('UpdateService error:', err);
            // only show message when explicitly checking for updates
            const message = (this.state.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.state.explicit) ? err : undefined;
            this.setState(update_1.State.Idle(1 /* UpdateType.Archive */, message));
        }
        buildUpdateFeedUrl(quality) {
            let assetID;
            if (!this.productService.darwinUniversalAssetId) {
                assetID = process.arch === 'x64' ? 'darwin' : 'darwin-arm64';
            }
            else {
                assetID = this.productService.darwinUniversalAssetId;
            }
            const url = (0, abstractUpdateService_1.createUpdateURL)(assetID, quality, this.productService);
            try {
                electron.autoUpdater.setFeedURL({ url });
            }
            catch (e) {
                // application is very likely not signed
                this.logService.error('Failed to set update feed URL', e);
                return undefined;
            }
            return url;
        }
        doCheckForUpdates(context) {
            this.setState(update_1.State.CheckingForUpdates(context));
            electron.autoUpdater.checkForUpdates();
        }
        onUpdateAvailable(update) {
            if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
                return;
            }
            this.setState(update_1.State.Downloading(update));
        }
        onUpdateDownloaded(update) {
            if (this.state.type !== "downloading" /* StateType.Downloading */) {
                return;
            }
            this.telemetryService.publicLog2('update:downloaded', { version: update.version });
            this.setState(update_1.State.Ready(update));
        }
        onUpdateNotAvailable() {
            if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
                return;
            }
            this.telemetryService.publicLog2('update:notAvailable', { explicit: this.state.explicit });
            this.setState(update_1.State.Idle(1 /* UpdateType.Archive */));
        }
        doQuitAndInstall() {
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            electron.autoUpdater.quitAndInstall();
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.DarwinUpdateService = DarwinUpdateService;
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawError", null);
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", null);
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawUpdateAvailable", null);
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawUpdateDownloaded", null);
    exports.DarwinUpdateService = DarwinUpdateService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, request_1.IRequestService),
        __param(5, log_1.ILogService),
        __param(6, productService_1.IProductService)
    ], DarwinUpdateService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS5kYXJ3aW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91cGRhdGUvZWxlY3Ryb24tbWFpbi91cGRhdGVTZXJ2aWNlLmRhcndpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQnpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsNkNBQXFCO1FBSXBELElBQVksVUFBVSxLQUFvQixPQUFPLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0SSxJQUFZLHVCQUF1QixLQUFrQixPQUFPLGFBQUssQ0FBQyxvQkFBb0IsQ0FBTyxRQUFRLENBQUMsV0FBVyxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdJLElBQVksb0JBQW9CLEtBQXFCLE9BQU8sYUFBSyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDck0sSUFBWSxxQkFBcUIsS0FBcUIsT0FBTyxhQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUs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