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
define(["require", "exports", "child_process", "fs", "vs/base/common/async", "vs/base/common/event", "vs/base/common/path", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update"], function (require, exports, child_process_1, fs_1, async_1, event_1, path, environmentMainService_1, lifecycleMainService_1, log_1, telemetry_1, update_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnapUpdateService = void 0;
    let AbstractUpdateService = class AbstractUpdateService {
        get state() {
            return this._state;
        }
        setState(state) {
            this.logService.info('update#setState', state.type);
            this._state = state;
            this._onStateChange.fire(state);
        }
        constructor(lifecycleMainService, environmentMainService, logService) {
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this._state = update_1.State.Uninitialized;
            this._onStateChange = new event_1.Emitter();
            this.onStateChange = this._onStateChange.event;
            if (environmentMainService.disableUpdates) {
                this.logService.info('update#ctor - updates are disabled');
                return;
            }
            this.setState(update_1.State.Idle(this.getUpdateType()));
            // Start checking for updates after 30 seconds
            this.scheduleCheckForUpdates(30 * 1000).then(undefined, err => this.logService.error(err));
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
        doDownloadUpdate(state) {
            return Promise.resolve(undefined);
        }
        async applyUpdate() {
            this.logService.trace('update#applyUpdate, state = ', this.state.type);
            if (this.state.type !== "downloaded" /* StateType.Downloaded */) {
                return;
            }
            await this.doApplyUpdate();
        }
        doApplyUpdate() {
            return Promise.resolve(undefined);
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
        getUpdateType() {
            return 2 /* UpdateType.Snap */;
        }
        doQuitAndInstall() {
            // noop
        }
        async _applySpecificUpdate(packagePath) {
            // noop
        }
    };
    AbstractUpdateService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, environmentMainService_1.IEnvironmentMainService),
        __param(2, log_1.ILogService)
    ], AbstractUpdateService);
    let SnapUpdateService = class SnapUpdateService extends AbstractUpdateService {
        constructor(snap, snapRevision, lifecycleMainService, environmentMainService, logService, telemetryService) {
            super(lifecycleMainService, environmentMainService, logService);
            this.snap = snap;
            this.snapRevision = snapRevision;
            this.telemetryService = telemetryService;
            const watcher = (0, fs_1.watch)(path.dirname(this.snap));
            const onChange = event_1.Event.fromNodeEventEmitter(watcher, 'change', (_, fileName) => fileName);
            const onCurrentChange = event_1.Event.filter(onChange, n => n === 'current');
            const onDebouncedCurrentChange = event_1.Event.debounce(onCurrentChange, (_, e) => e, 2000);
            const listener = onDebouncedCurrentChange(() => this.checkForUpdates(false));
            lifecycleMainService.onWillShutdown(() => {
                listener.dispose();
                watcher.close();
            });
        }
        doCheckForUpdates() {
            this.setState(update_1.State.CheckingForUpdates(false));
            this.isUpdateAvailable().then(result => {
                if (result) {
                    this.setState(update_1.State.Ready({ version: 'something', productVersion: 'something' }));
                }
                else {
                    this.telemetryService.publicLog2('update:notAvailable', { explicit: false });
                    this.setState(update_1.State.Idle(2 /* UpdateType.Snap */));
                }
            }, err => {
                this.logService.error(err);
                this.telemetryService.publicLog2('update:notAvailable', { explicit: false });
                this.setState(update_1.State.Idle(2 /* UpdateType.Snap */, err.message || err));
            });
        }
        doQuitAndInstall() {
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            // Allow 3 seconds for VS Code to close
            (0, child_process_1.spawn)('sleep 3 && ' + path.basename(process.argv[0]), {
                shell: true,
                detached: true,
                stdio: 'ignore',
            });
        }
        async isUpdateAvailable() {
            const resolvedCurrentSnapPath = await new Promise((c, e) => (0, fs_1.realpath)(`${path.dirname(this.snap)}/current`, (err, r) => err ? e(err) : c(r)));
            const currentRevision = path.basename(resolvedCurrentSnapPath);
            return this.snapRevision !== currentRevision;
        }
        isLatestVersion() {
            return this.isUpdateAvailable().then(undefined, err => {
                this.logService.error('update#checkForSnapUpdate(): Could not get realpath of application.');
                return undefined;
            });
        }
    };
    exports.SnapUpdateService = SnapUpdateService;
    exports.SnapUpdateService = SnapUpdateService = __decorate([
        __param(2, lifecycleMainService_1.ILifecycleMainService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, log_1.ILogService),
        __param(5, telemetry_1.ITelemetryService)
    ], SnapUpdateService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS5zbmFwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXBkYXRlL2VsZWN0cm9uLW1haW4vdXBkYXRlU2VydmljZS5zbmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxJQUFlLHFCQUFxQixHQUFwQyxNQUFlLHFCQUFxQjtRQVNuQyxJQUFJLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVTLFFBQVEsQ0FBQyxLQUFZO1lBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsWUFDd0Isb0JBQTRELEVBQzFELHNCQUErQyxFQUMzRCxVQUFpQztZQUZOLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFNUQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQWxCdkMsV0FBTSxHQUFVLGNBQUssQ0FBQyxhQUFhLENBQUM7WUFFM0IsbUJBQWMsR0FBRyxJQUFJLGVBQU8sRUFBUyxDQUFDO1lBQzlDLGtCQUFhLEdBQWlCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBaUJoRSxJQUFJLHNCQUFzQixDQUFDLGNBQWMsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztnQkFDM0QsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7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