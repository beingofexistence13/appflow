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
define(["require", "exports", "vs/base/common/async", "vs/base/common/date", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncMachines"], function (require, exports, async_1, date_1, errorMessage_1, errors_1, event_1, lifecycle_1, platform_1, resources_1, uri_1, nls_1, productService_1, storage_1, telemetry_1, userDataSync_1, userDataSyncAccount_1, userDataSyncMachines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataAutoSyncService = void 0;
    const disableMachineEventuallyKey = 'sync.disableMachineEventually';
    const sessionIdKey = 'sync.sessionId';
    const storeUrlKey = 'sync.storeUrl';
    const productQualityKey = 'sync.productQuality';
    let UserDataAutoSyncService = class UserDataAutoSyncService extends lifecycle_1.Disposable {
        get syncUrl() {
            const value = this.storageService.get(storeUrlKey, -1 /* StorageScope.APPLICATION */);
            return value ? uri_1.URI.parse(value) : undefined;
        }
        set syncUrl(syncUrl) {
            if (syncUrl) {
                this.storageService.store(storeUrlKey, syncUrl.toString(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(storeUrlKey, -1 /* StorageScope.APPLICATION */);
            }
        }
        get productQuality() {
            return this.storageService.get(productQualityKey, -1 /* StorageScope.APPLICATION */);
        }
        set productQuality(productQuality) {
            if (productQuality) {
                this.storageService.store(productQualityKey, productQuality, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(productQualityKey, -1 /* StorageScope.APPLICATION */);
            }
        }
        constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, userDataSyncAccountService, telemetryService, userDataSyncMachinesService, storageService) {
            super();
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataSyncService = userDataSyncService;
            this.logService = logService;
            this.userDataSyncAccountService = userDataSyncAccountService;
            this.telemetryService = telemetryService;
            this.userDataSyncMachinesService = userDataSyncMachinesService;
            this.storageService = storageService;
            this.autoSync = this._register(new lifecycle_1.MutableDisposable());
            this.successiveFailures = 0;
            this.lastSyncTriggerTime = undefined;
            this.suspendUntilRestart = false;
            this._onError = this._register(new event_1.Emitter());
            this.onError = this._onError.event;
            this.sources = [];
            this.syncTriggerDelayer = this._register(new async_1.ThrottledDelayer(this.getSyncTriggerDelayTime()));
            this.lastSyncUrl = this.syncUrl;
            this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
            this.previousProductQuality = this.productQuality;
            this.productQuality = productService.quality;
            if (this.syncUrl) {
                this.logService.info('Using settings sync service', this.syncUrl.toString());
                this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => {
                    if (!(0, resources_1.isEqual)(this.syncUrl, userDataSyncStoreManagementService.userDataSyncStore?.url)) {
                        this.lastSyncUrl = this.syncUrl;
                        this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
                        if (this.syncUrl) {
                            this.logService.info('Using settings sync service', this.syncUrl.toString());
                        }
                    }
                }));
                if (this.userDataSyncEnablementService.isEnabled()) {
                    this.logService.info('Auto Sync is enabled.');
                }
                else {
                    this.logService.info('Auto Sync is disabled.');
                }
                this.updateAutoSync();
                if (this.hasToDisableMachineEventually()) {
                    this.disableMachineEventually();
                }
                this._register(userDataSyncAccountService.onDidChangeAccount(() => this.updateAutoSync()));
                this._register(userDataSyncStoreService.onDidChangeDonotMakeRequestsUntil(() => this.updateAutoSync()));
                this._register(userDataSyncService.onDidChangeLocal(source => this.triggerSync([source], false, false)));
                this._register(event_1.Event.filter(this.userDataSyncEnablementService.onDidChangeResourceEnablement, ([, enabled]) => enabled)(() => this.triggerSync(['resourceEnablement'], false, false)));
                this._register(this.userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.triggerSync(['userDataSyncStoreChanged'], false, false)));
            }
        }
        updateAutoSync() {
            const { enabled, message } = this.isAutoSyncEnabled();
            if (enabled) {
                if (this.autoSync.value === undefined) {
                    this.autoSync.value = new AutoSync(this.lastSyncUrl, 1000 * 60 * 5 /* 5 miutes */, this.userDataSyncStoreManagementService, this.userDataSyncStoreService, this.userDataSyncService, this.userDataSyncMachinesService, this.logService, this.telemetryService, this.storageService);
                    this.autoSync.value.register(this.autoSync.value.onDidStartSync(() => this.lastSyncTriggerTime = new Date().getTime()));
                    this.autoSync.value.register(this.autoSync.value.onDidFinishSync(e => this.onDidFinishSync(e)));
                    if (this.startAutoSync()) {
                        this.autoSync.value.start();
                    }
                }
            }
            else {
                this.syncTriggerDelayer.cancel();
                if (this.autoSync.value !== undefined) {
                    if (message) {
                        this.logService.info(message);
                    }
                    this.autoSync.clear();
                }
                /* log message when auto sync is not disabled by user */
                else if (message && this.userDataSyncEnablementService.isEnabled()) {
                    this.logService.info(message);
                }
            }
        }
        // For tests purpose only
        startAutoSync() { return true; }
        isAutoSyncEnabled() {
            if (!this.userDataSyncEnablementService.isEnabled()) {
                return { enabled: false, message: 'Auto Sync: Disabled.' };
            }
            if (!this.userDataSyncAccountService.account) {
                return { enabled: false, message: 'Auto Sync: Suspended until auth token is available.' };
            }
            if (this.userDataSyncStoreService.donotMakeRequestsUntil) {
                return { enabled: false, message: `Auto Sync: Suspended until ${(0, date_1.toLocalISOString)(this.userDataSyncStoreService.donotMakeRequestsUntil)} because server is not accepting requests until then.` };
            }
            if (this.suspendUntilRestart) {
                return { enabled: false, message: 'Auto Sync: Suspended until restart.' };
            }
            return { enabled: true };
        }
        async turnOn() {
            this.stopDisableMachineEventually();
            this.lastSyncUrl = this.syncUrl;
            this.updateEnablement(true);
        }
        async turnOff(everywhere, softTurnOffOnError, donotRemoveMachine) {
            try {
                // Remove machine
                if (this.userDataSyncAccountService.account && !donotRemoveMachine) {
                    await this.userDataSyncMachinesService.removeCurrentMachine();
                }
                // Disable Auto Sync
                this.updateEnablement(false);
                // Reset Session
                this.storageService.remove(sessionIdKey, -1 /* StorageScope.APPLICATION */);
                // Reset
                if (everywhere) {
                    this.telemetryService.publicLog2('sync/turnOffEveryWhere');
                    await this.userDataSyncService.reset();
                }
                else {
                    await this.userDataSyncService.resetLocal();
                }
            }
            catch (error) {
                this.logService.error(error);
                if (softTurnOffOnError) {
                    this.updateEnablement(false);
                }
                else {
                    throw error;
                }
            }
        }
        updateEnablement(enabled) {
            if (this.userDataSyncEnablementService.isEnabled() !== enabled) {
                this.userDataSyncEnablementService.setEnablement(enabled);
                this.updateAutoSync();
            }
        }
        hasProductQualityChanged() {
            return !!this.previousProductQuality && !!this.productQuality && this.previousProductQuality !== this.productQuality;
        }
        async onDidFinishSync(error) {
            if (!error) {
                // Sync finished without errors
                this.successiveFailures = 0;
                return;
            }
            // Error while syncing
            const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
            // Log to telemetry
            if (userDataSyncError instanceof userDataSync_1.UserDataAutoSyncError) {
                this.telemetryService.publicLog2(`autosync/error`, { code: userDataSyncError.code, service: this.userDataSyncStoreManagementService.userDataSyncStore.url.toString() });
            }
            // Session got expired
            if (userDataSyncError.code === "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.logService.info('Auto Sync: Turned off sync because current session is expired');
            }
            // Turned off from another device
            else if (userDataSyncError.code === "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.logService.info('Auto Sync: Turned off sync because sync is turned off in the cloud');
            }
            // Exceeded Rate Limit on Client
            else if (userDataSyncError.code === "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */) {
                this.suspendUntilRestart = true;
                this.logService.info('Auto Sync: Suspended sync because of making too many requests to server');
                this.updateAutoSync();
            }
            // Exceeded Rate Limit on Server
            else if (userDataSyncError.code === "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */) {
                await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine because disabling a machine makes request to server and can fail with TooManyRequests */);
                this.disableMachineEventually();
                this.logService.info('Auto Sync: Turned off sync because of making too many requests to server');
            }
            // Method Not Found
            else if (userDataSyncError.code === "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.logService.info('Auto Sync: Turned off sync because current client is making requests to server that are not supported');
            }
            // Upgrade Required or Gone
            else if (userDataSyncError.code === "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */ || userDataSyncError.code === "Gone" /* UserDataSyncErrorCode.Gone */) {
                await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine because disabling a machine makes request to server and can fail with upgrade required or gone */);
                this.disableMachineEventually();
                this.logService.info('Auto Sync: Turned off sync because current client is not compatible with server. Requires client upgrade.');
            }
            // Incompatible Local Content
            else if (userDataSyncError.code === "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.logService.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with newer version than of client. Requires client upgrade.`);
            }
            // Incompatible Remote Content
            else if (userDataSyncError.code === "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.logService.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with older version than of client. Requires server reset.`);
            }
            // Service changed
            else if (userDataSyncError.code === "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */ || userDataSyncError.code === "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */) {
                // Check if default settings sync service has changed in web without changing the product quality
                // Then turn off settings sync and ask user to turn on again
                if (platform_1.isWeb && userDataSyncError.code === "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */ && !this.hasProductQualityChanged()) {
                    await this.turnOff(false, true /* force soft turnoff on error */);
                    this.logService.info('Auto Sync: Turned off sync because default sync service is changed.');
                }
                // Service has changed by the user. So turn off and turn on sync.
                // Show a prompt to the user about service change.
                else {
                    await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine */);
                    await this.turnOn();
                    this.logService.info('Auto Sync: Sync Service changed. Turned off auto sync, reset local state and turned on auto sync.');
                }
            }
            else {
                this.logService.error(userDataSyncError);
                this.successiveFailures++;
            }
            this._onError.fire(userDataSyncError);
        }
        async disableMachineEventually() {
            this.storageService.store(disableMachineEventuallyKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await (0, async_1.timeout)(1000 * 60 * 10);
            // Return if got stopped meanwhile.
            if (!this.hasToDisableMachineEventually()) {
                return;
            }
            this.stopDisableMachineEventually();
            // disable only if sync is disabled
            if (!this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account) {
                await this.userDataSyncMachinesService.removeCurrentMachine();
            }
        }
        hasToDisableMachineEventually() {
            return this.storageService.getBoolean(disableMachineEventuallyKey, -1 /* StorageScope.APPLICATION */, false);
        }
        stopDisableMachineEventually() {
            this.storageService.remove(disableMachineEventuallyKey, -1 /* StorageScope.APPLICATION */);
        }
        async triggerSync(sources, skipIfSyncedRecently, disableCache) {
            if (this.autoSync.value === undefined) {
                return this.syncTriggerDelayer.cancel();
            }
            if (skipIfSyncedRecently && this.lastSyncTriggerTime
                && Math.round((new Date().getTime() - this.lastSyncTriggerTime) / 1000) < 10) {
                this.logService.debug('Auto Sync: Skipped. Limited to once per 10 seconds.');
                return;
            }
            this.sources.push(...sources);
            return this.syncTriggerDelayer.trigger(async () => {
                this.logService.trace('activity sources', ...this.sources);
                const providerId = this.userDataSyncAccountService.account?.authenticationProviderId || '';
                this.telemetryService.publicLog2('sync/triggered', { sources: this.sources, providerId });
                this.sources = [];
                if (this.autoSync.value) {
                    await this.autoSync.value.sync('Activity', disableCache);
                }
            }, this.successiveFailures
                ? this.getSyncTriggerDelayTime() * 1 * Math.min(Math.pow(2, this.successiveFailures), 60) /* Delay exponentially until max 1 minute */
                : this.getSyncTriggerDelayTime());
        }
        getSyncTriggerDelayTime() {
            return 2000; /* Debounce for 2 seconds if there are no failures */
        }
    };
    exports.UserDataAutoSyncService = UserDataAutoSyncService;
    exports.UserDataAutoSyncService = UserDataAutoSyncService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(2, userDataSync_1.IUserDataSyncStoreService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService),
        __param(4, userDataSync_1.IUserDataSyncService),
        __param(5, userDataSync_1.IUserDataSyncLogService),
        __param(6, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, userDataSyncMachines_1.IUserDataSyncMachinesService),
        __param(9, storage_1.IStorageService)
    ], UserDataAutoSyncService);
    class AutoSync extends lifecycle_1.Disposable {
        static { this.INTERVAL_SYNCING = 'Interval'; }
        constructor(lastSyncUrl, interval /* in milliseconds */, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncService, userDataSyncMachinesService, logService, telemetryService, storageService) {
            super();
            this.lastSyncUrl = lastSyncUrl;
            this.interval = interval;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncMachinesService = userDataSyncMachinesService;
            this.logService = logService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.intervalHandler = this._register(new lifecycle_1.MutableDisposable());
            this._onDidStartSync = this._register(new event_1.Emitter());
            this.onDidStartSync = this._onDidStartSync.event;
            this._onDidFinishSync = this._register(new event_1.Emitter());
            this.onDidFinishSync = this._onDidFinishSync.event;
            this.manifest = null;
        }
        start() {
            this._register(this.onDidFinishSync(() => this.waitUntilNextIntervalAndSync()));
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this.syncPromise) {
                    this.syncPromise.cancel();
                    this.logService.info('Auto sync: Cancelled sync that is in progress');
                    this.syncPromise = undefined;
                }
                this.syncTask?.stop();
                this.logService.info('Auto Sync: Stopped');
            }));
            this.sync(AutoSync.INTERVAL_SYNCING, false);
        }
        waitUntilNextIntervalAndSync() {
            this.intervalHandler.value = (0, async_1.disposableTimeout)(() => this.sync(AutoSync.INTERVAL_SYNCING, false), this.interval);
        }
        sync(reason, disableCache) {
            const syncPromise = (0, async_1.createCancelablePromise)(async (token) => {
                if (this.syncPromise) {
                    try {
                        // Wait until existing sync is finished
                        this.logService.debug('Auto Sync: Waiting until sync is finished.');
                        await this.syncPromise;
                    }
                    catch (error) {
                        if ((0, errors_1.isCancellationError)(error)) {
                            // Cancelled => Disposed. Donot continue sync.
                            return;
                        }
                    }
                }
                return this.doSync(reason, disableCache, token);
            });
            this.syncPromise = syncPromise;
            this.syncPromise.finally(() => this.syncPromise = undefined);
            return this.syncPromise;
        }
        hasSyncServiceChanged() {
            return this.lastSyncUrl !== undefined && !(0, resources_1.isEqual)(this.lastSyncUrl, this.userDataSyncStoreManagementService.userDataSyncStore?.url);
        }
        async hasDefaultServiceChanged() {
            const previous = await this.userDataSyncStoreManagementService.getPreviousUserDataSyncStore();
            const current = this.userDataSyncStoreManagementService.userDataSyncStore;
            // check if defaults changed
            return !!current && !!previous &&
                (!(0, resources_1.isEqual)(current.defaultUrl, previous.defaultUrl) ||
                    !(0, resources_1.isEqual)(current.insidersUrl, previous.insidersUrl) ||
                    !(0, resources_1.isEqual)(current.stableUrl, previous.stableUrl));
        }
        async doSync(reason, disableCache, token) {
            this.logService.info(`Auto Sync: Triggered by ${reason}`);
            this._onDidStartSync.fire();
            let error;
            try {
                await this.createAndRunSyncTask(disableCache, token);
            }
            catch (e) {
                this.logService.error(e);
                error = e;
                if (userDataSync_1.UserDataSyncError.toUserDataSyncError(e).code === "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */) {
                    try {
                        this.logService.info('Auto Sync: Client is making invalid requests. Cleaning up data...');
                        await this.userDataSyncService.cleanUpRemoteData();
                        this.logService.info('Auto Sync: Retrying sync...');
                        await this.createAndRunSyncTask(disableCache, token);
                        error = undefined;
                    }
                    catch (e1) {
                        this.logService.error(e1);
                        error = e1;
                    }
                }
            }
            this._onDidFinishSync.fire(error);
        }
        async createAndRunSyncTask(disableCache, token) {
            this.syncTask = await this.userDataSyncService.createSyncTask(this.manifest, disableCache);
            if (token.isCancellationRequested) {
                return;
            }
            this.manifest = this.syncTask.manifest;
            // Server has no data but this machine was synced before
            if (this.manifest === null && await this.userDataSyncService.hasPreviouslySynced()) {
                if (this.hasSyncServiceChanged()) {
                    if (await this.hasDefaultServiceChanged()) {
                        throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('default service changed', "Cannot sync because default service has changed"), "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */);
                    }
                    else {
                        throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('service changed', "Cannot sync because sync service has changed"), "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */);
                    }
                }
                else {
                    // Sync was turned off in the cloud
                    throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('turned off', "Cannot sync because syncing is turned off in the cloud"), "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
                }
            }
            const sessionId = this.storageService.get(sessionIdKey, -1 /* StorageScope.APPLICATION */);
            // Server session is different from client session
            if (sessionId && this.manifest && sessionId !== this.manifest.session) {
                if (this.hasSyncServiceChanged()) {
                    if (await this.hasDefaultServiceChanged()) {
                        throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('default service changed', "Cannot sync because default service has changed"), "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */);
                    }
                    else {
                        throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('service changed', "Cannot sync because sync service has changed"), "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */);
                    }
                }
                else {
                    throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('session expired', "Cannot sync because current session is expired"), "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */);
                }
            }
            const machines = await this.userDataSyncMachinesService.getMachines(this.manifest || undefined);
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            const currentMachine = machines.find(machine => machine.isCurrent);
            // Check if sync was turned off from other machine
            if (currentMachine?.disabled) {
                // Throw TurnedOff error
                throw new userDataSync_1.UserDataAutoSyncError((0, nls_1.localize)('turned off machine', "Cannot sync because syncing is turned off on this machine from another machine."), "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
            }
            const startTime = new Date().getTime();
            await this.syncTask.run();
            this.telemetryService.publicLog2('settingsSync:sync', { duration: new Date().getTime() - startTime });
            // After syncing, get the manifest if it was not available before
            if (this.manifest === null) {
                try {
                    this.manifest = await this.userDataSyncStoreService.manifest(null);
                }
                catch (error) {
                    throw new userDataSync_1.UserDataAutoSyncError((0, errorMessage_1.toErrorMessage)(error), error instanceof userDataSync_1.UserDataSyncError ? error.code : "Unknown" /* UserDataSyncErrorCode.Unknown */);
                }
            }
            // Update local session id
            if (this.manifest && this.manifest.session !== sessionId) {
                this.storageService.store(sessionIdKey, this.manifest.session, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            // Add current machine
            if (!currentMachine) {
                await this.userDataSyncMachinesService.addCurrentMachine(this.manifest || undefined);
            }
        }
        register(t) {
            return super._register(t);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFBdXRvU3luY1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhQXV0b1N5bmNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtDaEcsTUFBTSwyQkFBMkIsR0FBRywrQkFBK0IsQ0FBQztJQUNwRSxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztJQUN0QyxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUM7SUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxxQkFBcUIsQ0FBQztJQUV6QyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBY3RELElBQVksT0FBTztZQUNsQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLG9DQUEyQixDQUFDO1lBQzdFLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0MsQ0FBQztRQUNELElBQVksT0FBTyxDQUFDLE9BQXdCO1lBQzNDLElBQUksT0FBTyxFQUFFO2dCQUNaLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLG1FQUFrRCxDQUFDO2FBQzVHO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFdBQVcsb0NBQTJCLENBQUM7YUFDbEU7UUFDRixDQUFDO1FBR0QsSUFBWSxjQUFjO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLG9DQUEyQixDQUFDO1FBQzdFLENBQUM7UUFDRCxJQUFZLGNBQWMsQ0FBQyxjQUFrQztZ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