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
define(["require", "exports", "child_process", "fs", "os", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/path", "vs/base/common/uri", "vs/base/node/crypto", "vs/base/node/pfs", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/files/common/files", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/update/electron-main/abstractUpdateService"], function (require, exports, child_process_1, fs, os_1, async_1, cancellation_1, decorators_1, path, uri_1, crypto_1, pfs, configuration_1, environmentMainService_1, files_1, lifecycleMainService_1, log_1, nativeHostMainService_1, productService_1, request_1, telemetry_1, update_1, abstractUpdateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$K6b = void 0;
    async function pollUntil(fn, millis = 1000) {
        while (!fn()) {
            await (0, async_1.$Hg)(millis);
        }
    }
    let _updateType = undefined;
    function getUpdateType() {
        if (typeof _updateType === 'undefined') {
            _updateType = fs.existsSync(path.$9d(path.$_d(process.execPath), 'unins000.exe'))
                ? 0 /* UpdateType.Setup */
                : 1 /* UpdateType.Archive */;
        }
        return _updateType;
    }
    let $K6b = class $K6b extends abstractUpdateService_1.$G6b {
        get cachePath() {
            const result = path.$9d((0, os_1.tmpdir)(), `vscode-${this.k.quality}-${this.k.target}-${process.arch}`);
            return pfs.Promises.mkdir(result, { recursive: true }).then(() => result);
        }
        constructor(lifecycleMainService, configurationService, u, environmentMainService, requestService, logService, v, w, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.u = u;
            this.v = v;
            this.w = w;
            lifecycleMainService.setRelaunchHandler(this);
        }
        handleRelaunch(options) {
            if (options?.addArgs || options?.removeArgs) {
                return false; // we cannot apply an update and restart with different args
            }
            if (this.state.type !== "ready" /* StateType.Ready */ || !this.e) {
                return false; // we only handle the relaunch when we have a pending update
            }
            this.j.trace('update#handleRelaunch(): running raw#quitAndInstall()');
            this.r();
            return true;
        }
        async l() {
            if (this.k.target === 'user' && await this.w.isAdmin(undefined)) {
                this.d(update_1.$TT.Disabled(5 /* DisablementReason.RunningAsAdmin */));
                this.j.info('update#ctor - updates are disabled due to running as Admin in user setup');
                return;
            }
            await super.l();
        }
        s(quality) {
            let platform = 'win32';
            if (process.arch !== 'ia32') {
                platform += `-${process.arch}`;
            }
            if (getUpdateType() === 1 /* UpdateType.Archive */) {
                platform += '-archive';
            }
            else if (this.k.target === 'user') {
                platform += '-user';
            }
            return (0, abstractUpdateService_1.$F6b)(platform, quality, this.k);
        }
        t(context) {
            if (!this.a) {
                return;
            }
            this.d(update_1.$TT.CheckingForUpdates(context));
            this.i.request({ url: this.a }, cancellation_1.CancellationToken.None)
                .then(request_1.$Oo)
                .then(update => {
                const updateType = getUpdateType();
                if (!update || !update.url || !update.version || !update.productVersion) {
                    this.u.publicLog2('update:notAvailable', { explicit: !!context });
                    this.d(update_1.$TT.Idle(updateType));
                    return Promise.resolve(null);
                }
                if (updateType === 1 /* UpdateType.Archive */) {
                    this.d(update_1.$TT.AvailableForDownload(update));
                    return Promise.resolve(null);
                }
                this.d(update_1.$TT.Downloading(update));
                return this.C(update.version).then(() => {
                    return this.B(update.version).then(updatePackagePath => {
                        return pfs.Promises.exists(updatePackagePath).then(exists => {
                            if (exists) {
                                return Promise.resolve(updatePackagePath);
                            }
                            const url = update.url;
                            const hash = update.hash;
                            const downloadPath = `${updatePackagePath}.tmp`;
                            return this.i.request({ url }, cancellation_1.CancellationToken.None)
                                .then(context => this.v.writeFile(uri_1.URI.file(downloadPath), context.stream))
                                .then(hash ? () => (0, crypto_1.$PS)(downloadPath, update.hash) : () => undefined)
                                .then(() => pfs.Promises.rename(downloadPath, updatePackagePath, false /* no retry */))
                                .then(() => updatePackagePath);
                        });
                    }).then(packagePath => {
                        const fastUpdatesEnabled = this.g.getValue('update.enableWindowsBackgroundUpdates');
                        this.e = { packagePath };
                        if (fastUpdatesEnabled) {
                            if (this.k.target === 'user') {
                                this.p();
                            }
                            else {
                                this.d(update_1.$TT.Downloaded(update));
                            }
                        }
                        else {
                            this.d(update_1.$TT.Ready(update));
                        }
                    });
                });
            })
                .then(undefined, err => {
                this.j.error(err);
                this.u.publicLog2('update:notAvailable', { explicit: !!context });
                // only show message when explicitly checking for updates
                const message = !!context ? (err.message || err) : undefined;
                this.d(update_1.$TT.Idle(getUpdateType(), message));
            });
        }
        async o(state) {
            if (state.update.url) {
                this.w.openExternal(undefined, state.update.url);
            }
            this.d(update_1.$TT.Idle(getUpdateType()));
        }
        async B(version) {
            const cachePath = await this.cachePath;
            return path.$9d(cachePath, `CodeSetup-${this.k.quality}-${version}.exe`);
        }
        async C(exceptVersion = null) {
            const filter = exceptVersion ? (one) => !(new RegExp(`${this.k.quality}-${exceptVersion}\\.exe$`).test(one)) : () => true;
            const cachePath = await this.cachePath;
            const versions = await pfs.Promises.readdir(cachePath);
            const promises = versions.filter(filter).map(async (one) => {
                try {
                    await pfs.Promises.unlink(path.$9d(cachePath, one));
                }
                catch (err) {
                    // ignore
                }
            });
            await Promise.all(promises);
        }
        async p() {
            if (this.state.type !== "downloaded" /* StateType.Downloaded */ && this.state.type !== "downloading" /* StateType.Downloading */) {
                return Promise.resolve(undefined);
            }
            if (!this.e) {
                return Promise.resolve(undefined);
            }
            const update = this.state.update;
            this.d(update_1.$TT.Updating(update));
            const cachePath = await this.cachePath;
            this.e.updateFilePath = path.$9d(cachePath, `CodeSetup-${this.k.quality}-${update.version}.flag`);
            await pfs.Promises.writeFile(this.e.updateFilePath, 'flag');
            const child = (0, child_process_1.spawn)(this.e.packagePath, ['/verysilent', '/log', `/update="${this.e.updateFilePath}"`, '/nocloseapplications', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                detached: true,
                stdio: ['ignore', 'ignore', 'ignore'],
                windowsVerbatimArguments: true
            });
            child.once('exit', () => {
                this.e = undefined;
                this.d(update_1.$TT.Idle(getUpdateType()));
            });
            const readyMutexName = `${this.k.win32MutexName}-ready`;
            const mutex = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-mutex'], resolve_1, reject_1); });
            // poll for mutex-ready
            pollUntil(() => mutex.isActive(readyMutexName))
                .then(() => this.d(update_1.$TT.Ready(update)));
        }
        r() {
            if (this.state.type !== "ready" /* StateType.Ready */ || !this.e) {
                return;
            }
            this.j.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            if (this.e.updateFilePath) {
                fs.unlinkSync(this.e.updateFilePath);
            }
            else {
                (0, child_process_1.spawn)(this.e.packagePath, ['/silent', '/log', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                    detached: true,
                    stdio: ['ignore', 'ignore', 'ignore']
                });
            }
        }
        q() {
            return getUpdateType();
        }
        async _applySpecificUpdate(packagePath) {
            if (this.state.type !== "idle" /* StateType.Idle */) {
                return;
            }
            const fastUpdatesEnabled = this.g.getValue('update.enableWindowsBackgroundUpdates');
            const update = { version: 'unknown', productVersion: 'unknown' };
            this.d(update_1.$TT.Downloading(update));
            this.e = { packagePath };
            if (fastUpdatesEnabled) {
                if (this.k.target === 'user') {
                    this.p();
                }
                else {
                    this.d(update_1.$TT.Downloaded(update));
                }
            }
            else {
                this.d(update_1.$TT.Ready(update));
            }
        }
    };
    exports.$K6b = $K6b;
    __decorate([
        decorators_1.$6g
    ], $K6b.prototype, "cachePath", null);
    exports.$K6b = $K6b = __decorate([
        __param(0, lifecycleMainService_1.$p5b),
        __param(1, configuration_1.$8h),
        __param(2, telemetry_1.$9k),
        __param(3, environmentMainService_1.$n5b),
        __param(4, request_1.$Io),
        __param(5, log_1.$5i),
        __param(6, files_1.$6j),
        __param(7, nativeHostMainService_1.$c6b),
        __param(8, productService_1.$kj)
    ], $K6b);
});
//# sourceMappingURL=updateService.win32.js.map