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
    exports.$J6b = void 0;
    let AbstractUpdateService = class AbstractUpdateService {
        get state() {
            return this.a;
        }
        d(state) {
            this.g.info('update#setState', state.type);
            this.a = state;
            this.b.fire(state);
        }
        constructor(f, environmentMainService, g) {
            this.f = f;
            this.g = g;
            this.a = update_1.$TT.Uninitialized;
            this.b = new event_1.$fd();
            this.onStateChange = this.b.event;
            if (environmentMainService.disableUpdates) {
                this.g.info('update#ctor - updates are disabled');
                return;
            }
            this.d(update_1.$TT.Idle(this.k()));
            // Start checking for updates after 30 seconds
            this.h(30 * 1000).then(undefined, err => this.g.error(err));
        }
        h(delay = 60 * 60 * 1000) {
            return (0, async_1.$Hg)(delay)
                .then(() => this.checkForUpdates(false))
                .then(() => {
                // Check again after 1 hour
                return this.h(60 * 60 * 1000);
            });
        }
        async checkForUpdates(explicit) {
            this.g.trace('update#checkForUpdates, state = ', this.state.type);
            if (this.state.type !== "idle" /* StateType.Idle */) {
                return;
            }
            this.m(explicit);
        }
        async downloadUpdate() {
            this.g.trace('update#downloadUpdate, state = ', this.state.type);
            if (this.state.type !== "available for download" /* StateType.AvailableForDownload */) {
                return;
            }
            await this.i(this.state);
        }
        i(state) {
            return Promise.resolve(undefined);
        }
        async applyUpdate() {
            this.g.trace('update#applyUpdate, state = ', this.state.type);
            if (this.state.type !== "downloaded" /* StateType.Downloaded */) {
                return;
            }
            await this.j();
        }
        j() {
            return Promise.resolve(undefined);
        }
        quitAndInstall() {
            this.g.trace('update#quitAndInstall, state = ', this.state.type);
            if (this.state.type !== "ready" /* StateType.Ready */) {
                return Promise.resolve(undefined);
            }
            this.g.trace('update#quitAndInstall(): before lifecycle quit()');
            this.f.quit(true /* will restart */).then(vetod => {
                this.g.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
                if (vetod) {
                    return;
                }
                this.g.trace('update#quitAndInstall(): running raw#quitAndInstall()');
                this.l();
            });
            return Promise.resolve(undefined);
        }
        k() {
            return 2 /* UpdateType.Snap */;
        }
        l() {
            // noop
        }
        async _applySpecificUpdate(packagePath) {
            // noop
        }
    };
    AbstractUpdateService = __decorate([
        __param(0, lifecycleMainService_1.$p5b),
        __param(1, environmentMainService_1.$n5b),
        __param(2, log_1.$5i)
    ], AbstractUpdateService);
    let $J6b = class $J6b extends AbstractUpdateService {
        constructor(o, p, lifecycleMainService, environmentMainService, logService, q) {
            super(lifecycleMainService, environmentMainService, logService);
            this.o = o;
            this.p = p;
            this.q = q;
            const watcher = (0, fs_1.watch)(path.$_d(this.o));
            const onChange = event_1.Event.fromNodeEventEmitter(watcher, 'change', (_, fileName) => fileName);
            const onCurrentChange = event_1.Event.filter(onChange, n => n === 'current');
            const onDebouncedCurrentChange = event_1.Event.debounce(onCurrentChange, (_, e) => e, 2000);
            const listener = onDebouncedCurrentChange(() => this.checkForUpdates(false));
            lifecycleMainService.onWillShutdown(() => {
                listener.dispose();
                watcher.close();
            });
        }
        m() {
            this.d(update_1.$TT.CheckingForUpdates(false));
            this.u().then(result => {
                if (result) {
                    this.d(update_1.$TT.Ready({ version: 'something', productVersion: 'something' }));
                }
                else {
                    this.q.publicLog2('update:notAvailable', { explicit: false });
                    this.d(update_1.$TT.Idle(2 /* UpdateType.Snap */));
                }
            }, err => {
                this.g.error(err);
                this.q.publicLog2('update:notAvailable', { explicit: false });
                this.d(update_1.$TT.Idle(2 /* UpdateType.Snap */, err.message || err));
            });
        }
        l() {
            this.g.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            // Allow 3 seconds for VS Code to close
            (0, child_process_1.spawn)('sleep 3 && ' + path.$ae(process.argv[0]), {
                shell: true,
                detached: true,
                stdio: 'ignore',
            });
        }
        async u() {
            const resolvedCurrentSnapPath = await new Promise((c, e) => (0, fs_1.realpath)(`${path.$_d(this.o)}/current`, (err, r) => err ? e(err) : c(r)));
            const currentRevision = path.$ae(resolvedCurrentSnapPath);
            return this.p !== currentRevision;
        }
        isLatestVersion() {
            return this.u().then(undefined, err => {
                this.g.error('update#checkForSnapUpdate(): Could not get realpath of application.');
                return undefined;
            });
        }
    };
    exports.$J6b = $J6b;
    exports.$J6b = $J6b = __decorate([
        __param(2, lifecycleMainService_1.$p5b),
        __param(3, environmentMainService_1.$n5b),
        __param(4, log_1.$5i),
        __param(5, telemetry_1.$9k)
    ], $J6b);
});
//# sourceMappingURL=updateService.snap.js.map