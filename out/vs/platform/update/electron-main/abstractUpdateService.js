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
    exports.AbstractUpdateService = exports.createUpdateURL = void 0;
    function createUpdateURL(platform, quality, productService) {
        return `${productService.updateUrl}/api/update/${platform}/${quality}/${productService.commit}`;
    }
    exports.createUpdateURL = createUpdateURL;
    let AbstractUpdateService = class AbstractUpdateService {
        get state() {
            return this._state;
        }
        setState(state) {
            this.logService.info('update#setState', state.type);
            this._state = state;
            this._onStateChange.fire(state);
        }
        constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService) {
            this.lifecycleMainService = lifecycleMainService;
            this.configurationService = configurationService;
            this.environmentMainService = environmentMainService;
            this.requestService = requestService;
            this.logService = logService;
            this.productService = productService;
            this._state = update_1.State.Uninitialized;
            this._onStateChange = new event_1.Emitter();
            this.onStateChange = this._onStateChange.event;
            lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */)
                .finally(() => this.initialize());
        }
        /**
         * This must be called before any other call. This is a performance
         * optimization, to avoid using extra CPU cycles before first window open.
         * https://github.com/microsoft/vscode/issues/89784
         */
        async initialize() {
            if (!this.environmentMainService.isBuilt) {
                this.setState(update_1.State.Disabled(0 /* DisablementReason.NotBuilt */));
                return; // updates are never enabled when running out of sources
            }
            if (this.environmentMainService.disableUpdates) {
                this.setState(update_1.State.Disabled(1 /* DisablementReason.DisabledByEnvironment */));
                this.logService.info('update#ctor - updates are disabled by the environment');
                return;
            }
            if (!this.productService.updateUrl || !this.productService.commit) {
                this.setState(update_1.State.Disabled(3 /* DisablementReason.MissingConfiguration */));
                this.logService.info('update#ctor - updates are disabled as there is no update URL');
                return;
            }
            const updateMode = this.configurationService.getValue('update.mode');
            const quality = this.getProductQuality(updateMode);
            if (!quality) {
                this.setState(update_1.State.Disabled(2 /* DisablementReason.ManuallyDisabled */));
                this.logService.info('update#ctor - updates are disabled by user preference');
                return;
            }
            this.url = this.buildUpdateFeedUrl(quality);
            if (!this.url) {
                this.setState(update_1.State.Disabled(4 /* DisablementReason.InvalidConfiguration */));
                this.logService.info('update#ctor - updates are disabled as the update URL is badly formed');
                return;
            }
            this.setState(update_1.State.Idle(this.getUpdateType()));
            if (updateMode === 'manual') {
                this.logService.info('update#ctor - manual checks only; automatic updates are disabled by user preference');
                return;
            }
            if (updateMode === 'start') {
                this.logService.info('update#ctor - startup checks only; automatic updates are disabled by user preference');
                // Check for updates only once after 30 seconds
                setTimeout(() => this.checkForUpdates(false), 30 * 1000);
            }
            else {
                // Start checking for updates after 30 seconds
                this.scheduleCheckForUpdates(30 * 1000).then(undefined, err => this.logService.error(err));
            }
        }
        getProductQuality(updateMode) {
            return updateMode === 'none' ? undefined : this.productService.quality;
        }
        scheduleCheckForUpdates(delay = 60 * 60 * 1000) {
            return (0, async_1.timeout)(delay)
                .then(() => this.checkForUpdates(false))
                .then(() => {
                // Check again after 1 hour
                return this.scheduleCheckForUpdates(60 * 60 * 1000);
            });
        }
        async checkForUpdates(explicit) {
            this.logService.trace('update#checkForUpdates, state = ', this.state.type);
            if (this.state.type !== "idle" /* StateType.Idle */) {
                return;
            }
            this.doCheckForUpdates(explicit);
        }
        async downloadUpdate() {
            this.logService.trace('update#downloadUpdate, state = ', this.state.type);
            if (this.state.type !== "available for download" /* StateType.AvailableForDownload */) {
                return;
            }
            await this.doDownloadUpdate(this.state);
        }
        async doDownloadUpdate(state) {
            // noop
        }
        async applyUpdate() {
            this.logService.trace('update#applyUpdate, state = ', this.state.type);
            if (this.state.type !== "downloaded" /* StateType.Downloaded */) {
                return;
            }
            await this.doApplyUpdate();
        }
        async doApplyUpdate() {
            // noop
        }
        quitAndInstall() {
            this.logService.trace('update#quitAndInstall, state = ', this.state.type);
            if (this.state.type !== "ready" /* StateType.Ready */) {
                return Promise.resolve(undefined);
            }
            this.logService.trace('update#quitAndInstall(): before lifecycle quit()');
            this.lifecycleMainService.quit(true /* will restart */).then(vetod => {
                this.logService.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
                if (vetod) {
                    return;
                }
                this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
                this.doQuitAndInstall();
            });
            return Promise.resolve(undefined);
        }
        async isLatestVersion() {
            if (!this.url) {
                return undefined;
            }
            const mode = this.configurationService.getValue('update.mode');
            if (mode === 'none') {
                return false;
            }
            try {
                const context = await this.requestService.request({ url: this.url }, cancellation_1.CancellationToken.None);
                // The update server replies with 204 (No Content) when no
                // update is available - that's all we want to know.
                return context.res.statusCode === 204;
            }
            catch (error) {
                this.logService.error('update#isLatestVersion(): failed to check for updates');
                this.logService.error(error);
                return undefined;
            }
        }
        async _applySpecificUpdate(packagePath) {
            // noop
        }
        getUpdateType() {
            return 1 /* UpdateType.Archive */;
        }
        doQuitAndInstall() {
            // noop
        }
    };
    exports.AbstractUpdateService = AbstractUpdateService;
    exports.AbstractUpdateService = AbstractUpdateService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, environmentMainService_1.IEnvironmentMainService),
        __param(3, request_1.IRequestService),
        __param(4, log_1.ILogService),
        __param(5, productService_1.IProductService)
    ], AbstractUpdateService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RVcGRhdGVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXBkYXRlL2VsZWN0cm9uLW1haW4vYWJzdHJhY3RVcGRhdGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFoRyxTQUFnQixlQUFlLENBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsY0FBK0I7UUFDakcsT0FBTyxHQUFHLGNBQWMsQ0FBQyxTQUFTLGVBQWUsUUFBUSxJQUFJLE9BQU8sSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDakcsQ0FBQztJQUZELDBDQUVDO0lBUU0sSUFBZSxxQkFBcUIsR0FBcEMsTUFBZSxxQkFBcUI7UUFXMUMsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFUyxRQUFRLENBQUMsS0FBWTtZQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELFlBQ3dCLG9CQUE4RCxFQUM5RCxvQkFBcUQsRUFDbkQsc0JBQWdFLEVBQ3hFLGNBQXlDLEVBQzdDLFVBQWlDLEVBQzdCLGNBQWtEO1lBTHpCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDcEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzlELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ1YsbUJBQWMsR0FBZCxjQUFj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