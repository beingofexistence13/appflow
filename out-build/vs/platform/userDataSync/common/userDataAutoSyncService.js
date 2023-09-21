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
define(["require", "exports", "vs/base/common/async", "vs/base/common/date", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncMachines"], function (require, exports, async_1, date_1, errorMessage_1, errors_1, event_1, lifecycle_1, platform_1, resources_1, uri_1, nls_1, productService_1, storage_1, telemetry_1, userDataSync_1, userDataSyncAccount_1, userDataSyncMachines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L4b = void 0;
    const disableMachineEventuallyKey = 'sync.disableMachineEventually';
    const sessionIdKey = 'sync.sessionId';
    const storeUrlKey = 'sync.storeUrl';
    const productQualityKey = 'sync.productQuality';
    let $L4b = class $L4b extends lifecycle_1.$kc {
        get n() {
            const value = this.H.get(storeUrlKey, -1 /* StorageScope.APPLICATION */);
            return value ? uri_1.URI.parse(value) : undefined;
        }
        set n(syncUrl) {
            if (syncUrl) {
                this.H.store(storeUrlKey, syncUrl.toString(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.H.remove(storeUrlKey, -1 /* StorageScope.APPLICATION */);
            }
        }
        get s() {
            return this.H.get(productQualityKey, -1 /* StorageScope.APPLICATION */);
        }
        set s(productQuality) {
            if (productQuality) {
                this.H.store(productQualityKey, productQuality, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.H.remove(productQualityKey, -1 /* StorageScope.APPLICATION */);
            }
        }
        constructor(productService, u, w, y, z, C, D, F, G, H) {
            super();
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.a = this.B(new lifecycle_1.$lc());
            this.b = 0;
            this.c = undefined;
            this.g = false;
            this.h = this.B(new event_1.$fd());
            this.onError = this.h.event;
            this.S = [];
            this.f = this.B(new async_1.$Eg(this.U()));
            this.j = this.n;
            this.n = u.userDataSyncStore?.url;
            this.r = this.s;
            this.s = productService.quality;
            if (this.n) {
                this.C.info('Using settings sync service', this.n.toString());
                this.B(u.onDidChangeUserDataSyncStore(() => {
                    if (!(0, resources_1.$bg)(this.n, u.userDataSyncStore?.url)) {
                        this.j = this.n;
                        this.n = u.userDataSyncStore?.url;
                        if (this.n) {
                            this.C.info('Using settings sync service', this.n.toString());
                        }
                    }
                }));
                if (this.y.isEnabled()) {
                    this.C.info('Auto Sync is enabled.');
                }
                else {
                    this.C.info('Auto Sync is disabled.');
                }
                this.I();
                if (this.Q()) {
                    this.P();
                }
                this.B(D.onDidChangeAccount(() => this.I()));
                this.B(w.onDidChangeDonotMakeRequestsUntil(() => this.I()));
                this.B(z.onDidChangeLocal(source => this.triggerSync([source], false, false)));
                this.B(event_1.Event.filter(this.y.onDidChangeResourceEnablement, ([, enabled]) => enabled)(() => this.triggerSync(['resourceEnablement'], false, false)));
                this.B(this.u.onDidChangeUserDataSyncStore(() => this.triggerSync(['userDataSyncStoreChanged'], false, false)));
            }
        }
        I() {
            const { enabled, message } = this.L();
            if (enabled) {
                if (this.a.value === undefined) {
                    this.a.value = new AutoSync(this.j, 1000 * 60 * 5 /* 5 miutes */, this.u, this.w, this.z, this.G, this.C, this.F, this.H);
                    this.a.value.register(this.a.value.onDidStartSync(() => this.c = new Date().getTime()));
                    this.a.value.register(this.a.value.onDidFinishSync(e => this.O(e)));
                    if (this.J()) {
                        this.a.value.start();
                    }
                }
            }
            else {
                this.f.cancel();
                if (this.a.value !== undefined) {
                    if (message) {
                        this.C.info(message);
                    }
                    this.a.clear();
                }
                /* log message when auto sync is not disabled by user */
                else if (message && this.y.isEnabled()) {
                    this.C.info(message);
                }
            }
        }
        // For tests purpose only
        J() { return true; }
        L() {
            if (!this.y.isEnabled()) {
                return { enabled: false, message: 'Auto Sync: Disabled.' };
            }
            if (!this.D.account) {
                return { enabled: false, message: 'Auto Sync: Suspended until auth token is available.' };
            }
            if (this.w.donotMakeRequestsUntil) {
                return { enabled: false, message: `Auto Sync: Suspended until ${(0, date_1.$7l)(this.w.donotMakeRequestsUntil)} because server is not accepting requests until then.` };
            }
            if (this.g) {
                return { enabled: false, message: 'Auto Sync: Suspended until restart.' };
            }
            return { enabled: true };
        }
        async turnOn() {
            this.R();
            this.j = this.n;
            this.M(true);
        }
        async turnOff(everywhere, softTurnOffOnError, donotRemoveMachine) {
            try {
                // Remove machine
                if (this.D.account && !donotRemoveMachine) {
                    await this.G.removeCurrentMachine();
                }
                // Disable Auto Sync
                this.M(false);
                // Reset Session
                this.H.remove(sessionIdKey, -1 /* StorageScope.APPLICATION */);
                // Reset
                if (everywhere) {
                    this.F.publicLog2('sync/turnOffEveryWhere');
                    await this.z.reset();
                }
                else {
                    await this.z.resetLocal();
                }
            }
            catch (error) {
                this.C.error(error);
                if (softTurnOffOnError) {
                    this.M(false);
                }
                else {
                    throw error;
                }
            }
        }
        M(enabled) {
            if (this.y.isEnabled() !== enabled) {
                this.y.setEnablement(enabled);
                this.I();
            }
        }
        N() {
            return !!this.r && !!this.s && this.r !== this.s;
        }
        async O(error) {
            if (!error) {
                // Sync finished without errors
                this.b = 0;
                return;
            }
            // Error while syncing
            const userDataSyncError = userDataSync_1.$Kgb.toUserDataSyncError(error);
            // Log to telemetry
            if (userDataSyncError instanceof userDataSync_1.$Mgb) {
                this.F.publicLog2(`autosync/error`, { code: userDataSyncError.code, service: this.u.userDataSyncStore.url.toString() });
            }
            // Session got expired
            if (userDataSyncError.code === "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.C.info('Auto Sync: Turned off sync because current session is expired');
            }
            // Turned off from another device
            else if (userDataSyncError.code === "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.C.info('Auto Sync: Turned off sync because sync is turned off in the cloud');
            }
            // Exceeded Rate Limit on Client
            else if (userDataSyncError.code === "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */) {
                this.g = true;
                this.C.info('Auto Sync: Suspended sync because of making too many requests to server');
                this.I();
            }
            // Exceeded Rate Limit on Server
            else if (userDataSyncError.code === "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */) {
                await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine because disabling a machine makes request to server and can fail with TooManyRequests */);
                this.P();
                this.C.info('Auto Sync: Turned off sync because of making too many requests to server');
            }
            // Method Not Found
            else if (userDataSyncError.code === "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.C.info('Auto Sync: Turned off sync because current client is making requests to server that are not supported');
            }
            // Upgrade Required or Gone
            else if (userDataSyncError.code === "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */ || userDataSyncError.code === "Gone" /* UserDataSyncErrorCode.Gone */) {
                await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine because disabling a machine makes request to server and can fail with upgrade required or gone */);
                this.P();
                this.C.info('Auto Sync: Turned off sync because current client is not compatible with server. Requires client upgrade.');
            }
            // Incompatible Local Content
            else if (userDataSyncError.code === "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.C.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with newer version than of client. Requires client upgrade.`);
            }
            // Incompatible Remote Content
            else if (userDataSyncError.code === "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.C.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with older version than of client. Requires server reset.`);
            }
            // Service changed
            else if (userDataSyncError.code === "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */ || userDataSyncError.code === "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */) {
                // Check if default settings sync service has changed in web without changing the product quality
                // Then turn off settings sync and ask user to turn on again
                if (platform_1.$o && userDataSyncError.code === "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */ && !this.N()) {
                    await this.turnOff(false, true /* force soft turnoff on error */);
                    this.C.info('Auto Sync: Turned off sync because default sync service is changed.');
                }
                // Service has changed by the user. So turn off and turn on sync.
                // Show a prompt to the user about service change.
                else {
                    await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine */);
                    await this.turnOn();
                    this.C.info('Auto Sync: Sync Service changed. Turned off auto sync, reset local state and turned on auto sync.');
                }
            }
            else {
                this.C.error(userDataSyncError);
                this.b++;
            }
            this.h.fire(userDataSyncError);
        }
        async P() {
            this.H.store(disableMachineEventuallyKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await (0, async_1.$Hg)(1000 * 60 * 10);
            // Return if got stopped meanwhile.
            if (!this.Q()) {
                return;
            }
            this.R();
            // disable only if sync is disabled
            if (!this.y.isEnabled() && this.D.account) {
                await this.G.removeCurrentMachine();
            }
        }
        Q() {
            return this.H.getBoolean(disableMachineEventuallyKey, -1 /* StorageScope.APPLICATION */, false);
        }
        R() {
            this.H.remove(disableMachineEventuallyKey, -1 /* StorageScope.APPLICATION */);
        }
        async triggerSync(sources, skipIfSyncedRecently, disableCache) {
            if (this.a.value === undefined) {
                return this.f.cancel();
            }
            if (skipIfSyncedRecently && this.c
                && Math.round((new Date().getTime() - this.c) / 1000) < 10) {
                this.C.debug('Auto Sync: Skipped. Limited to once per 10 seconds.');
                return;
            }
            this.S.push(...sources);
            return this.f.trigger(async () => {
                this.C.trace('activity sources', ...this.S);
                const providerId = this.D.account?.authenticationProviderId || '';
                this.F.publicLog2('sync/triggered', { sources: this.S, providerId });
                this.S = [];
                if (this.a.value) {
                    await this.a.value.sync('Activity', disableCache);
                }
            }, this.b
                ? this.U() * 1 * Math.min(Math.pow(2, this.b), 60) /* Delay exponentially until max 1 minute */
                : this.U());
        }
        U() {
            return 2000; /* Debounce for 2 seconds if there are no failures */
        }
    };
    exports.$L4b = $L4b;
    exports.$L4b = $L4b = __decorate([
        __param(0, productService_1.$kj),
        __param(1, userDataSync_1.$Egb),
        __param(2, userDataSync_1.$Fgb),
        __param(3, userDataSync_1.$Pgb),
        __param(4, userDataSync_1.$Qgb),
        __param(5, userDataSync_1.$Ugb),
        __param(6, userDataSyncAccount_1.$Ezb),
        __param(7, telemetry_1.$9k),
        __param(8, userDataSyncMachines_1.$sgb),
        __param(9, storage_1.$Vo)
    ], $L4b);
    class AutoSync extends lifecycle_1.$kc {
        static { this.a = 'Interval'; }
        constructor(m, n /* in milliseconds */, r, s, u, w, y, z, C) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.b = this.B(new lifecycle_1.$lc());
            this.c = this.B(new event_1.$fd());
            this.onDidStartSync = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidFinishSync = this.f.event;
            this.g = null;
        }
        start() {
            this.B(this.onDidFinishSync(() => this.D()));
            this.B((0, lifecycle_1.$ic)(() => {
                if (this.j) {
                    this.j.cancel();
                    this.y.info('Auto sync: Cancelled sync that is in progress');
                    this.j = undefined;
                }
                this.h?.stop();
                this.y.info('Auto Sync: Stopped');
            }));
            this.sync(AutoSync.a, false);
        }
        D() {
            this.b.value = (0, async_1.$Ig)(() => this.sync(AutoSync.a, false), this.n);
        }
        sync(reason, disableCache) {
            const syncPromise = (0, async_1.$ug)(async (token) => {
                if (this.j) {
                    try {
                        // Wait until existing sync is finished
                        this.y.debug('Auto Sync: Waiting until sync is finished.');
                        await this.j;
                    }
                    catch (error) {
                        if ((0, errors_1.$2)(error)) {
                            // Cancelled => Disposed. Donot continue sync.
                            return;
                        }
                    }
                }
                return this.H(reason, disableCache, token);
            });
            this.j = syncPromise;
            this.j.finally(() => this.j = undefined);
            return this.j;
        }
        F() {
            return this.m !== undefined && !(0, resources_1.$bg)(this.m, this.r.userDataSyncStore?.url);
        }
        async G() {
            const previous = await this.r.getPreviousUserDataSyncStore();
            const current = this.r.userDataSyncStore;
            // check if defaults changed
            return !!current && !!previous &&
                (!(0, resources_1.$bg)(current.defaultUrl, previous.defaultUrl) ||
                    !(0, resources_1.$bg)(current.insidersUrl, previous.insidersUrl) ||
                    !(0, resources_1.$bg)(current.stableUrl, previous.stableUrl));
        }
        async H(reason, disableCache, token) {
            this.y.info(`Auto Sync: Triggered by ${reason}`);
            this.c.fire();
            let error;
            try {
                await this.I(disableCache, token);
            }
            catch (e) {
                this.y.error(e);
                error = e;
                if (userDataSync_1.$Kgb.toUserDataSyncError(e).code === "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */) {
                    try {
                        this.y.info('Auto Sync: Client is making invalid requests. Cleaning up data...');
                        await this.u.cleanUpRemoteData();
                        this.y.info('Auto Sync: Retrying sync...');
                        await this.I(disableCache, token);
                        error = undefined;
                    }
                    catch (e1) {
                        this.y.error(e1);
                        error = e1;
                    }
                }
            }
            this.f.fire(error);
        }
        async I(disableCache, token) {
            this.h = await this.u.createSyncTask(this.g, disableCache);
            if (token.isCancellationRequested) {
                return;
            }
            this.g = this.h.manifest;
            // Server has no data but this machine was synced before
            if (this.g === null && await this.u.hasPreviouslySynced()) {
                if (this.F()) {
                    if (await this.G()) {
                        throw new userDataSync_1.$Mgb((0, nls_1.localize)(0, null), "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */);
                    }
                    else {
                        throw new userDataSync_1.$Mgb((0, nls_1.localize)(1, null), "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */);
                    }
                }
                else {
                    // Sync was turned off in the cloud
                    throw new userDataSync_1.$Mgb((0, nls_1.localize)(2, null), "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
                }
            }
            const sessionId = this.C.get(sessionIdKey, -1 /* StorageScope.APPLICATION */);
            // Server session is different from client session
            if (sessionId && this.g && sessionId !== this.g.session) {
                if (this.F()) {
                    if (await this.G()) {
                        throw new userDataSync_1.$Mgb((0, nls_1.localize)(3, null), "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */);
                    }
                    else {
                        throw new userDataSync_1.$Mgb((0, nls_1.localize)(4, null), "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */);
                    }
                }
                else {
                    throw new userDataSync_1.$Mgb((0, nls_1.localize)(5, null), "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */);
                }
            }
            const machines = await this.w.getMachines(this.g || undefined);
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            const currentMachine = machines.find(machine => machine.isCurrent);
            // Check if sync was turned off from other machine
            if (currentMachine?.disabled) {
                // Throw TurnedOff error
                throw new userDataSync_1.$Mgb((0, nls_1.localize)(6, null), "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
            }
            const startTime = new Date().getTime();
            await this.h.run();
            this.z.publicLog2('settingsSync:sync', { duration: new Date().getTime() - startTime });
            // After syncing, get the manifest if it was not available before
            if (this.g === null) {
                try {
                    this.g = await this.s.manifest(null);
                }
                catch (error) {
                    throw new userDataSync_1.$Mgb((0, errorMessage_1.$mi)(error), error instanceof userDataSync_1.$Kgb ? error.code : "Unknown" /* UserDataSyncErrorCode.Unknown */);
                }
            }
            // Update local session id
            if (this.g && this.g.session !== sessionId) {
                this.C.store(sessionIdKey, this.g.session, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            // Add current machine
            if (!currentMachine) {
                await this.w.addCurrentMachine(this.g || undefined);
            }
        }
        register(t) {
            return super.B(t);
        }
    }
});
//# sourceMappingURL=userDataAutoSyncService.js.map