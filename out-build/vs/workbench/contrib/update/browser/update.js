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
define(["require", "exports", "vs/nls!vs/workbench/contrib/update/browser/update", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/update/common/update", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/contrib/update/browser/releaseNotesEditor", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkeys", "vs/base/common/async", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/event", "vs/base/common/actions"], function (require, exports, nls, severity_1, lifecycle_1, uri_1, activity_1, instantiation_1, opener_1, storage_1, update_1, notification_1, dialogs_1, environmentService_1, releaseNotesEditor_1, platform_1, configuration_1, contextkey_1, actions_1, commands_1, host_1, productService_1, userDataSync_1, contextkeys_1, async_1, userDataSync_2, event_1, actions_2) {
    "use strict";
    var $xYb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zYb = exports.$yYb = exports.$xYb = exports.$wYb = exports.$vYb = exports.$uYb = exports.$tYb = exports.$sYb = void 0;
    exports.$sYb = new contextkey_1.$2i('updateState', "uninitialized" /* StateType.Uninitialized */);
    exports.$tYb = new contextkey_1.$2i('majorMinorUpdateAvailable', false);
    exports.$uYb = new contextkey_1.$2i('releaseNotesUrl', '');
    exports.$vYb = new contextkey_1.$2i('downloadUrl', '');
    let releaseNotesManager = undefined;
    function $wYb(instantiationService, version) {
        if (!releaseNotesManager) {
            releaseNotesManager = instantiationService.createInstance(releaseNotesEditor_1.$rYb);
        }
        return releaseNotesManager.show(version);
    }
    exports.$wYb = $wYb;
    async function openLatestReleaseNotesInBrowser(accessor) {
        const openerService = accessor.get(opener_1.$NT);
        const productService = accessor.get(productService_1.$kj);
        if (productService.releaseNotesUrl) {
            const uri = uri_1.URI.parse(productService.releaseNotesUrl);
            await openerService.open(uri);
        }
        else {
            throw new Error(nls.localize(0, null, productService.nameLong));
        }
    }
    async function showReleaseNotes(accessor, version) {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        try {
            await $wYb(instantiationService, version);
        }
        catch (err) {
            try {
                await instantiationService.invokeFunction(openLatestReleaseNotesInBrowser);
            }
            catch (err2) {
                throw new Error(`${err.message} and ${err2.message}`);
            }
        }
    }
    function parseVersion(version) {
        const match = /([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(version);
        if (!match) {
            return undefined;
        }
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
            patch: parseInt(match[3])
        };
    }
    function isMajorMinorUpdate(before, after) {
        return before.major < after.major || before.minor < after.minor;
    }
    let $xYb = class $xYb {
        static { $xYb_1 = this; }
        static { this.a = 'releaseNotes/lastVersion'; }
        constructor(storageService, instantiationService, notificationService, environmentService, openerService, configurationService, hostService, productService, contextKeyService) {
            if (productService.releaseNotesUrl) {
                const releaseNotesUrlKey = exports.$uYb.bindTo(contextKeyService);
                releaseNotesUrlKey.set(productService.releaseNotesUrl);
            }
            if (productService.downloadUrl) {
                const downloadUrlKey = exports.$vYb.bindTo(contextKeyService);
                downloadUrlKey.set(productService.downloadUrl);
            }
            if (platform_1.$o) {
                return;
            }
            hostService.hadLastFocus().then(async (hadLastFocus) => {
                if (!hadLastFocus) {
                    return;
                }
                const lastVersion = parseVersion(storageService.get($xYb_1.a, -1 /* StorageScope.APPLICATION */, ''));
                const currentVersion = parseVersion(productService.version);
                const shouldShowReleaseNotes = configurationService.getValue('update.showReleaseNotes');
                const releaseNotesUrl = productService.releaseNotesUrl;
                // was there a major/minor update? if so, open release notes
                if (shouldShowReleaseNotes && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
                    $wYb(instantiationService, productService.version)
                        .then(undefined, () => {
                        notificationService.prompt(severity_1.default.Info, nls.localize(1, null, productService.nameLong, productService.version), [{
                                label: nls.localize(2, null),
                                run: () => {
                                    const uri = uri_1.URI.parse(releaseNotesUrl);
                                    openerService.open(uri);
                                }
                            }]);
                    });
                }
                storageService.store($xYb_1.a, productService.version, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            });
        }
    };
    exports.$xYb = $xYb;
    exports.$xYb = $xYb = $xYb_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, instantiation_1.$Ah),
        __param(2, notification_1.$Yu),
        __param(3, environmentService_1.$LT),
        __param(4, opener_1.$NT),
        __param(5, configuration_1.$8h),
        __param(6, host_1.$VT),
        __param(7, productService_1.$kj),
        __param(8, contextkey_1.$3i)
    ], $xYb);
    let $yYb = class $yYb extends lifecycle_1.$kc {
        constructor(g, h, j, m, n, r, s, t, u, w) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.b = this.B(new lifecycle_1.$lc());
            this.a = n.state;
            this.c = exports.$sYb.bindTo(this.s);
            this.f = exports.$tYb.bindTo(this.s);
            this.B(n.onStateChange(this.y, this));
            this.y(this.n.state);
            /*
            The `update/lastKnownVersion` and `update/updateNotificationTime` storage keys are used in
            combination to figure out when to show a message to the user that he should update.
    
            This message should appear if the user has received an update notification but hasn't
            updated since 5 days.
            */
            const currentVersion = this.t.commit;
            const lastKnownVersion = this.g.get('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
            // if current version != stored version, clear both fields
            if (currentVersion !== lastKnownVersion) {
                this.g.remove('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
                this.g.remove('update/updateNotificationTime', -1 /* StorageScope.APPLICATION */);
            }
            this.I();
        }
        async y(state) {
            this.c.set(state.type);
            switch (state.type) {
                case "disabled" /* StateType.Disabled */:
                    if (state.reason === 5 /* DisablementReason.RunningAsAdmin */) {
                        this.j.notify({
                            severity: notification_1.Severity.Info,
                            message: nls.localize(3, null, this.t.nameLong),
                            actions: {
                                primary: [
                                    new actions_2.$gi('', nls.localize(4, null), undefined, undefined, () => {
                                        this.u.open('https://aka.ms/vscode-windows-setup');
                                    })
                                ]
                            },
                            neverShowAgain: { id: 'no-updates-running-as-admin', }
                        });
                    }
                    break;
                case "idle" /* StateType.Idle */:
                    if (state.error) {
                        this.z(state.error);
                    }
                    else if (this.a.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.a.explicit && await this.w.hadLastFocus()) {
                        this.C();
                    }
                    break;
                case "available for download" /* StateType.AvailableForDownload */:
                    this.D(state.update);
                    break;
                case "downloaded" /* StateType.Downloaded */:
                    this.F(state.update);
                    break;
                case "ready" /* StateType.Ready */: {
                    const currentVersion = parseVersion(this.t.version);
                    const nextVersion = parseVersion(state.update.productVersion);
                    this.f.set(Boolean(currentVersion && nextVersion && isMajorMinorUpdate(currentVersion, nextVersion)));
                    this.G(state.update);
                    break;
                }
            }
            let badge = undefined;
            let clazz;
            let priority = undefined;
            if (state.type === "available for download" /* StateType.AvailableForDownload */ || state.type === "downloaded" /* StateType.Downloaded */ || state.type === "ready" /* StateType.Ready */) {
                badge = new activity_1.$IV(1, () => nls.localize(5, null, this.t.nameShort));
            }
            else if (state.type === "checking for updates" /* StateType.CheckingForUpdates */) {
                badge = new activity_1.$LV(() => nls.localize(6, null));
                clazz = 'progress-badge';
                priority = 1;
            }
            else if (state.type === "downloading" /* StateType.Downloading */) {
                badge = new activity_1.$LV(() => nls.localize(7, null));
                clazz = 'progress-badge';
                priority = 1;
            }
            else if (state.type === "updating" /* StateType.Updating */) {
                badge = new activity_1.$LV(() => nls.localize(8, null));
                clazz = 'progress-badge';
                priority = 1;
            }
            this.b.clear();
            if (badge) {
                this.b.value = this.r.showGlobalActivity({ badge, clazz, priority });
            }
            this.a = state;
        }
        z(error) {
            if (/The request timed out|The network connection was lost/i.test(error)) {
                return;
            }
            error = error.replace(/See https:\/\/github\.com\/Squirrel\/Squirrel\.Mac\/issues\/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');
            this.j.notify({
                severity: notification_1.Severity.Error,
                message: error,
                source: nls.localize(9, null),
            });
        }
        C() {
            this.m.info(nls.localize(10, null));
        }
        // linux
        D(update) {
            if (!this.H()) {
                return;
            }
            this.j.prompt(severity_1.default.Info, nls.localize(11, null), [{
                    label: nls.localize(12, null),
                    run: () => this.n.downloadUpdate()
                }, {
                    label: nls.localize(13, null),
                    run: () => { }
                }, {
                    label: nls.localize(14, null),
                    run: () => {
                        this.h.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                }]);
        }
        // windows fast updates (target === system)
        F(update) {
            if (!this.H()) {
                return;
            }
            this.j.prompt(severity_1.default.Info, nls.localize(15, null, this.t.nameLong, update.productVersion), [{
                    label: nls.localize(16, null),
                    run: () => this.n.applyUpdate()
                }, {
                    label: nls.localize(17, null),
                    run: () => { }
                }, {
                    label: nls.localize(18, null),
                    run: () => {
                        this.h.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                }]);
        }
        // windows and mac
        G(update) {
            if (!(platform_1.$i && this.t.target !== 'user') && !this.H()) {
                return;
            }
            const actions = [{
                    label: nls.localize(19, null),
                    run: () => this.n.quitAndInstall()
                }, {
                    label: nls.localize(20, null),
                    run: () => { }
                }];
            // TODO@joao check why snap updates send `update` as falsy
            if (update.productVersion) {
                actions.push({
                    label: nls.localize(21, null),
                    run: () => {
                        this.h.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                });
            }
            // windows user fast updates and mac
            this.j.prompt(severity_1.default.Info, nls.localize(22, null, this.t.nameLong), actions, { sticky: true });
        }
        H() {
            const currentVersion = this.t.commit;
            const currentMillis = new Date().getTime();
            const lastKnownVersion = this.g.get('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
            // if version != stored version, save version and date
            if (currentVersion !== lastKnownVersion) {
                this.g.store('update/lastKnownVersion', currentVersion, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.g.store('update/updateNotificationTime', currentMillis, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            const updateNotificationMillis = this.g.getNumber('update/updateNotificationTime', -1 /* StorageScope.APPLICATION */, currentMillis);
            const diffDays = (currentMillis - updateNotificationMillis) / (1000 * 60 * 60 * 24);
            return diffDays > 5;
        }
        I() {
            commands_1.$Gr.registerCommand('update.check', () => this.n.checkForUpdates(true));
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.check',
                    title: nls.localize(23, null)
                },
                when: exports.$sYb.isEqualTo("idle" /* StateType.Idle */)
            });
            commands_1.$Gr.registerCommand('update.checking', () => { });
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.checking',
                    title: nls.localize(24, null),
                    precondition: contextkey_1.$Ii.false()
                },
                when: exports.$sYb.isEqualTo("checking for updates" /* StateType.CheckingForUpdates */)
            });
            commands_1.$Gr.registerCommand('update.downloadNow', () => this.n.downloadUpdate());
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloadNow',
                    title: nls.localize(25, null)
                },
                when: exports.$sYb.isEqualTo("available for download" /* StateType.AvailableForDownload */)
            });
            commands_1.$Gr.registerCommand('update.downloading', () => { });
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloading',
                    title: nls.localize(26, null),
                    precondition: contextkey_1.$Ii.false()
                },
                when: exports.$sYb.isEqualTo("downloading" /* StateType.Downloading */)
            });
            commands_1.$Gr.registerCommand('update.install', () => this.n.applyUpdate());
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.install',
                    title: nls.localize(27, null)
                },
                when: exports.$sYb.isEqualTo("downloaded" /* StateType.Downloaded */)
            });
            commands_1.$Gr.registerCommand('update.updating', () => { });
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.updating',
                    title: nls.localize(28, null),
                    precondition: contextkey_1.$Ii.false()
                },
                when: exports.$sYb.isEqualTo("updating" /* StateType.Updating */)
            });
            if (this.t.quality === 'stable') {
                commands_1.$Gr.registerCommand('update.showUpdateReleaseNotes', () => {
                    if (this.n.state.type !== "ready" /* StateType.Ready */) {
                        return;
                    }
                    const version = this.n.state.update.version;
                    this.h.invokeFunction(accessor => showReleaseNotes(accessor, version));
                });
                actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                    group: '7_update',
                    order: 1,
                    command: {
                        id: 'update.showUpdateReleaseNotes',
                        title: nls.localize(29, null)
                    },
                    when: contextkey_1.$Ii.and(exports.$sYb.isEqualTo("ready" /* StateType.Ready */), exports.$tYb)
                });
            }
            commands_1.$Gr.registerCommand('update.restart', () => this.n.quitAndInstall());
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                group: '7_update',
                order: 2,
                command: {
                    id: 'update.restart',
                    title: nls.localize(30, null)
                },
                when: exports.$sYb.isEqualTo("ready" /* StateType.Ready */)
            });
            commands_1.$Gr.registerCommand('_update.state', () => {
                return this.a;
            });
        }
    };
    exports.$yYb = $yYb;
    exports.$yYb = $yYb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, instantiation_1.$Ah),
        __param(2, notification_1.$Yu),
        __param(3, dialogs_1.$oA),
        __param(4, update_1.$UT),
        __param(5, activity_1.$HV),
        __param(6, contextkey_1.$3i),
        __param(7, productService_1.$kj),
        __param(8, opener_1.$NT),
        __param(9, host_1.$VT)
    ], $yYb);
    let $zYb = class $zYb extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            const quality = this.a.quality;
            const productQualityChangeHandler = this.b.options?.productQualityChangeHandler;
            if (productQualityChangeHandler && (quality === 'stable' || quality === 'insider')) {
                const newQuality = quality === 'stable' ? 'insider' : 'stable';
                const commandId = `update.switchQuality.${newQuality}`;
                const isSwitchingToInsiders = newQuality === 'insider';
                (0, actions_1.$Xu)(class SwitchQuality extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: commandId,
                            title: isSwitchingToInsiders ? nls.localize(31, null) : nls.localize(32, null),
                            precondition: contextkeys_1.$23,
                            menu: {
                                id: actions_1.$Ru.GlobalActivity,
                                when: contextkeys_1.$23,
                                group: '7_update',
                            }
                        });
                    }
                    async run(accessor) {
                        const dialogService = accessor.get(dialogs_1.$oA);
                        const userDataSyncEnablementService = accessor.get(userDataSync_1.$Pgb);
                        const userDataSyncStoreManagementService = accessor.get(userDataSync_1.$Egb);
                        const storageService = accessor.get(storage_1.$Vo);
                        const userDataSyncWorkbenchService = accessor.get(userDataSync_2.$KAb);
                        const userDataSyncService = accessor.get(userDataSync_1.$Qgb);
                        const notificationService = accessor.get(notification_1.$Yu);
                        try {
                            const selectSettingsSyncServiceDialogShownKey = 'switchQuality.selectSettingsSyncServiceDialogShown';
                            const userDataSyncStore = userDataSyncStoreManagementService.userDataSyncStore;
                            let userDataSyncStoreType;
                            if (userDataSyncStore && isSwitchingToInsiders && userDataSyncEnablementService.isEnabled()
                                && !storageService.getBoolean(selectSettingsSyncServiceDialogShownKey, -1 /* StorageScope.APPLICATION */, false)) {
                                userDataSyncStoreType = await this.a(dialogService);
                                if (!userDataSyncStoreType) {
                                    return;
                                }
                                storageService.store(selectSettingsSyncServiceDialogShownKey, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                                if (userDataSyncStoreType === 'stable') {
                                    // Update the stable service type in the current window, so that it uses stable service after switched to insiders version (after reload).
                                    await userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                                }
                            }
                            const res = await dialogService.confirm({
                                type: 'info',
                                message: nls.localize(33, null),
                                detail: newQuality === 'insider' ?
                                    nls.localize(34, null) :
                                    nls.localize(35, null),
                                primaryButton: nls.localize(36, null)
                            });
                            if (res.confirmed) {
                                const promises = [];
                                // If sync is happening wait until it is finished before reload
                                if (userDataSyncService.status === "syncing" /* SyncStatus.Syncing */) {
                                    promises.push(event_1.Event.toPromise(event_1.Event.filter(userDataSyncService.onDidChangeStatus, status => status !== "syncing" /* SyncStatus.Syncing */)));
                                }
                                // If user chose the sync service then synchronise the store type option in insiders service, so that other clients using insiders service are also updated.
                                if (isSwitchingToInsiders && userDataSyncStoreType) {
                                    promises.push(userDataSyncWorkbenchService.synchroniseUserDataSyncStoreType());
                                }
                                await async_1.Promises.settled(promises);
                                productQualityChangeHandler(newQuality);
                            }
                            else {
                                // Reset
                                if (userDataSyncStoreType) {
                                    storageService.remove(selectSettingsSyncServiceDialogShownKey, -1 /* StorageScope.APPLICATION */);
                                }
                            }
                        }
                        catch (error) {
                            notificationService.error(error);
                        }
                    }
                    async a(dialogService) {
                        const { result } = await dialogService.prompt({
                            type: notification_1.Severity.Info,
                            message: nls.localize(37, null),
                            detail: nls.localize(38, null),
                            buttons: [
                                {
                                    label: nls.localize(39, null),
                                    run: () => 'insiders'
                                },
                                {
                                    label: nls.localize(40, null),
                                    run: () => 'stable'
                                }
                            ],
                            cancelButton: true
                        });
                        return result;
                    }
                });
            }
        }
    };
    exports.$zYb = $zYb;
    exports.$zYb = $zYb = __decorate([
        __param(0, productService_1.$kj),
        __param(1, environmentService_1.$LT)
    ], $zYb);
});
//# sourceMappingURL=update.js.map