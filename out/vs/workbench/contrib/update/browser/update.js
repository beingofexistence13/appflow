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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/update/common/update", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/contrib/update/browser/releaseNotesEditor", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkeys", "vs/base/common/async", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/event", "vs/base/common/actions"], function (require, exports, nls, severity_1, lifecycle_1, uri_1, activity_1, instantiation_1, opener_1, storage_1, update_1, notification_1, dialogs_1, environmentService_1, releaseNotesEditor_1, platform_1, configuration_1, contextkey_1, actions_1, commands_1, host_1, productService_1, userDataSync_1, contextkeys_1, async_1, userDataSync_2, event_1, actions_2) {
    "use strict";
    var ProductContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SwitchProductQualityContribution = exports.UpdateContribution = exports.ProductContribution = exports.showReleaseNotesInEditor = exports.DOWNLOAD_URL = exports.RELEASE_NOTES_URL = exports.MAJOR_MINOR_UPDATE_AVAILABLE = exports.CONTEXT_UPDATE_STATE = void 0;
    exports.CONTEXT_UPDATE_STATE = new contextkey_1.RawContextKey('updateState', "uninitialized" /* StateType.Uninitialized */);
    exports.MAJOR_MINOR_UPDATE_AVAILABLE = new contextkey_1.RawContextKey('majorMinorUpdateAvailable', false);
    exports.RELEASE_NOTES_URL = new contextkey_1.RawContextKey('releaseNotesUrl', '');
    exports.DOWNLOAD_URL = new contextkey_1.RawContextKey('downloadUrl', '');
    let releaseNotesManager = undefined;
    function showReleaseNotesInEditor(instantiationService, version) {
        if (!releaseNotesManager) {
            releaseNotesManager = instantiationService.createInstance(releaseNotesEditor_1.ReleaseNotesManager);
        }
        return releaseNotesManager.show(version);
    }
    exports.showReleaseNotesInEditor = showReleaseNotesInEditor;
    async function openLatestReleaseNotesInBrowser(accessor) {
        const openerService = accessor.get(opener_1.IOpenerService);
        const productService = accessor.get(productService_1.IProductService);
        if (productService.releaseNotesUrl) {
            const uri = uri_1.URI.parse(productService.releaseNotesUrl);
            await openerService.open(uri);
        }
        else {
            throw new Error(nls.localize('update.noReleaseNotesOnline', "This version of {0} does not have release notes online", productService.nameLong));
        }
    }
    async function showReleaseNotes(accessor, version) {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        try {
            await showReleaseNotesInEditor(instantiationService, version);
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
    let ProductContribution = class ProductContribution {
        static { ProductContribution_1 = this; }
        static { this.KEY = 'releaseNotes/lastVersion'; }
        constructor(storageService, instantiationService, notificationService, environmentService, openerService, configurationService, hostService, productService, contextKeyService) {
            if (productService.releaseNotesUrl) {
                const releaseNotesUrlKey = exports.RELEASE_NOTES_URL.bindTo(contextKeyService);
                releaseNotesUrlKey.set(productService.releaseNotesUrl);
            }
            if (productService.downloadUrl) {
                const downloadUrlKey = exports.DOWNLOAD_URL.bindTo(contextKeyService);
                downloadUrlKey.set(productService.downloadUrl);
            }
            if (platform_1.isWeb) {
                return;
            }
            hostService.hadLastFocus().then(async (hadLastFocus) => {
                if (!hadLastFocus) {
                    return;
                }
                const lastVersion = parseVersion(storageService.get(ProductContribution_1.KEY, -1 /* StorageScope.APPLICATION */, ''));
                const currentVersion = parseVersion(productService.version);
                const shouldShowReleaseNotes = configurationService.getValue('update.showReleaseNotes');
                const releaseNotesUrl = productService.releaseNotesUrl;
                // was there a major/minor update? if so, open release notes
                if (shouldShowReleaseNotes && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
                    showReleaseNotesInEditor(instantiationService, productService.version)
                        .then(undefined, () => {
                        notificationService.prompt(severity_1.default.Info, nls.localize('read the release notes', "Welcome to {0} v{1}! Would you like to read the Release Notes?", productService.nameLong, productService.version), [{
                                label: nls.localize('releaseNotes', "Release Notes"),
                                run: () => {
                                    const uri = uri_1.URI.parse(releaseNotesUrl);
                                    openerService.open(uri);
                                }
                            }]);
                    });
                }
                storageService.store(ProductContribution_1.KEY, productService.version, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            });
        }
    };
    exports.ProductContribution = ProductContribution;
    exports.ProductContribution = ProductContribution = ProductContribution_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(4, opener_1.IOpenerService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, host_1.IHostService),
        __param(7, productService_1.IProductService),
        __param(8, contextkey_1.IContextKeyService)
    ], ProductContribution);
    let UpdateContribution = class UpdateContribution extends lifecycle_1.Disposable {
        constructor(storageService, instantiationService, notificationService, dialogService, updateService, activityService, contextKeyService, productService, openerService, hostService) {
            super();
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.updateService = updateService;
            this.activityService = activityService;
            this.contextKeyService = contextKeyService;
            this.productService = productService;
            this.openerService = openerService;
            this.hostService = hostService;
            this.badgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.state = updateService.state;
            this.updateStateContextKey = exports.CONTEXT_UPDATE_STATE.bindTo(this.contextKeyService);
            this.majorMinorUpdateAvailableContextKey = exports.MAJOR_MINOR_UPDATE_AVAILABLE.bindTo(this.contextKeyService);
            this._register(updateService.onStateChange(this.onUpdateStateChange, this));
            this.onUpdateStateChange(this.updateService.state);
            /*
            The `update/lastKnownVersion` and `update/updateNotificationTime` storage keys are used in
            combination to figure out when to show a message to the user that he should update.
    
            This message should appear if the user has received an update notification but hasn't
            updated since 5 days.
            */
            const currentVersion = this.productService.commit;
            const lastKnownVersion = this.storageService.get('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
            // if current version != stored version, clear both fields
            if (currentVersion !== lastKnownVersion) {
                this.storageService.remove('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
                this.storageService.remove('update/updateNotificationTime', -1 /* StorageScope.APPLICATION */);
            }
            this.registerGlobalActivityActions();
        }
        async onUpdateStateChange(state) {
            this.updateStateContextKey.set(state.type);
            switch (state.type) {
                case "disabled" /* StateType.Disabled */:
                    if (state.reason === 5 /* DisablementReason.RunningAsAdmin */) {
                        this.notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: nls.localize('update service disabled', "Updates are disabled because you are running the user-scope installation of {0} as Administrator.", this.productService.nameLong),
                            actions: {
                                primary: [
                                    new actions_2.Action('', nls.localize('learn more', "Learn More"), undefined, undefined, () => {
                                        this.openerService.open('https://aka.ms/vscode-windows-setup');
                                    })
                                ]
                            },
                            neverShowAgain: { id: 'no-updates-running-as-admin', }
                        });
                    }
                    break;
                case "idle" /* StateType.Idle */:
                    if (state.error) {
                        this.onError(state.error);
                    }
                    else if (this.state.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.state.explicit && await this.hostService.hadLastFocus()) {
                        this.onUpdateNotAvailable();
                    }
                    break;
                case "available for download" /* StateType.AvailableForDownload */:
                    this.onUpdateAvailable(state.update);
                    break;
                case "downloaded" /* StateType.Downloaded */:
                    this.onUpdateDownloaded(state.update);
                    break;
                case "ready" /* StateType.Ready */: {
                    const currentVersion = parseVersion(this.productService.version);
                    const nextVersion = parseVersion(state.update.productVersion);
                    this.majorMinorUpdateAvailableContextKey.set(Boolean(currentVersion && nextVersion && isMajorMinorUpdate(currentVersion, nextVersion)));
                    this.onUpdateReady(state.update);
                    break;
                }
            }
            let badge = undefined;
            let clazz;
            let priority = undefined;
            if (state.type === "available for download" /* StateType.AvailableForDownload */ || state.type === "downloaded" /* StateType.Downloaded */ || state.type === "ready" /* StateType.Ready */) {
                badge = new activity_1.NumberBadge(1, () => nls.localize('updateIsReady', "New {0} update available.", this.productService.nameShort));
            }
            else if (state.type === "checking for updates" /* StateType.CheckingForUpdates */) {
                badge = new activity_1.ProgressBadge(() => nls.localize('checkingForUpdates', "Checking for Updates..."));
                clazz = 'progress-badge';
                priority = 1;
            }
            else if (state.type === "downloading" /* StateType.Downloading */) {
                badge = new activity_1.ProgressBadge(() => nls.localize('downloading', "Downloading..."));
                clazz = 'progress-badge';
                priority = 1;
            }
            else if (state.type === "updating" /* StateType.Updating */) {
                badge = new activity_1.ProgressBadge(() => nls.localize('updating', "Updating..."));
                clazz = 'progress-badge';
                priority = 1;
            }
            this.badgeDisposable.clear();
            if (badge) {
                this.badgeDisposable.value = this.activityService.showGlobalActivity({ badge, clazz, priority });
            }
            this.state = state;
        }
        onError(error) {
            if (/The request timed out|The network connection was lost/i.test(error)) {
                return;
            }
            error = error.replace(/See https:\/\/github\.com\/Squirrel\/Squirrel\.Mac\/issues\/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');
            this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: error,
                source: nls.localize('update service', "Update Service"),
            });
        }
        onUpdateNotAvailable() {
            this.dialogService.info(nls.localize('noUpdatesAvailable', "There are currently no updates available."));
        }
        // linux
        onUpdateAvailable(update) {
            if (!this.shouldShowNotification()) {
                return;
            }
            this.notificationService.prompt(severity_1.default.Info, nls.localize('thereIsUpdateAvailable', "There is an available update."), [{
                    label: nls.localize('download update', "Download Update"),
                    run: () => this.updateService.downloadUpdate()
                }, {
                    label: nls.localize('later', "Later"),
                    run: () => { }
                }, {
                    label: nls.localize('releaseNotes', "Release Notes"),
                    run: () => {
                        this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                }]);
        }
        // windows fast updates (target === system)
        onUpdateDownloaded(update) {
            if (!this.shouldShowNotification()) {
                return;
            }
            this.notificationService.prompt(severity_1.default.Info, nls.localize('updateAvailable', "There's an update available: {0} {1}", this.productService.nameLong, update.productVersion), [{
                    label: nls.localize('installUpdate', "Install Update"),
                    run: () => this.updateService.applyUpdate()
                }, {
                    label: nls.localize('later', "Later"),
                    run: () => { }
                }, {
                    label: nls.localize('releaseNotes', "Release Notes"),
                    run: () => {
                        this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                }]);
        }
        // windows and mac
        onUpdateReady(update) {
            if (!(platform_1.isWindows && this.productService.target !== 'user') && !this.shouldShowNotification()) {
                return;
            }
            const actions = [{
                    label: nls.localize('updateNow', "Update Now"),
                    run: () => this.updateService.quitAndInstall()
                }, {
                    label: nls.localize('later', "Later"),
                    run: () => { }
                }];
            // TODO@joao check why snap updates send `update` as falsy
            if (update.productVersion) {
                actions.push({
                    label: nls.localize('releaseNotes', "Release Notes"),
                    run: () => {
                        this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                });
            }
            // windows user fast updates and mac
            this.notificationService.prompt(severity_1.default.Info, nls.localize('updateAvailableAfterRestart', "Restart {0} to apply the latest update.", this.productService.nameLong), actions, { sticky: true });
        }
        shouldShowNotification() {
            const currentVersion = this.productService.commit;
            const currentMillis = new Date().getTime();
            const lastKnownVersion = this.storageService.get('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
            // if version != stored version, save version and date
            if (currentVersion !== lastKnownVersion) {
                this.storageService.store('update/lastKnownVersion', currentVersion, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.storageService.store('update/updateNotificationTime', currentMillis, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            const updateNotificationMillis = this.storageService.getNumber('update/updateNotificationTime', -1 /* StorageScope.APPLICATION */, currentMillis);
            const diffDays = (currentMillis - updateNotificationMillis) / (1000 * 60 * 60 * 24);
            return diffDays > 5;
        }
        registerGlobalActivityActions() {
            commands_1.CommandsRegistry.registerCommand('update.check', () => this.updateService.checkForUpdates(true));
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.check',
                    title: nls.localize('checkForUpdates', "Check for Updates...")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("idle" /* StateType.Idle */)
            });
            commands_1.CommandsRegistry.registerCommand('update.checking', () => { });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.checking',
                    title: nls.localize('checkingForUpdates', "Checking for Updates..."),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("checking for updates" /* StateType.CheckingForUpdates */)
            });
            commands_1.CommandsRegistry.registerCommand('update.downloadNow', () => this.updateService.downloadUpdate());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloadNow',
                    title: nls.localize('download update_1', "Download Update (1)")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("available for download" /* StateType.AvailableForDownload */)
            });
            commands_1.CommandsRegistry.registerCommand('update.downloading', () => { });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloading',
                    title: nls.localize('DownloadingUpdate', "Downloading Update..."),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("downloading" /* StateType.Downloading */)
            });
            commands_1.CommandsRegistry.registerCommand('update.install', () => this.updateService.applyUpdate());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.install',
                    title: nls.localize('installUpdate...', "Install Update... (1)")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("downloaded" /* StateType.Downloaded */)
            });
            commands_1.CommandsRegistry.registerCommand('update.updating', () => { });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.updating',
                    title: nls.localize('installingUpdate', "Installing Update..."),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("updating" /* StateType.Updating */)
            });
            if (this.productService.quality === 'stable') {
                commands_1.CommandsRegistry.registerCommand('update.showUpdateReleaseNotes', () => {
                    if (this.updateService.state.type !== "ready" /* StateType.Ready */) {
                        return;
                    }
                    const version = this.updateService.state.update.version;
                    this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, version));
                });
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                    group: '7_update',
                    order: 1,
                    command: {
                        id: 'update.showUpdateReleaseNotes',
                        title: nls.localize('showUpdateReleaseNotes', "Show Update Release Notes")
                    },
                    when: contextkey_1.ContextKeyExpr.and(exports.CONTEXT_UPDATE_STATE.isEqualTo("ready" /* StateType.Ready */), exports.MAJOR_MINOR_UPDATE_AVAILABLE)
                });
            }
            commands_1.CommandsRegistry.registerCommand('update.restart', () => this.updateService.quitAndInstall());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                order: 2,
                command: {
                    id: 'update.restart',
                    title: nls.localize('restartToUpdate', "Restart to Update (1)")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("ready" /* StateType.Ready */)
            });
            commands_1.CommandsRegistry.registerCommand('_update.state', () => {
                return this.state;
            });
        }
    };
    exports.UpdateContribution = UpdateContribution;
    exports.UpdateContribution = UpdateContribution = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, dialogs_1.IDialogService),
        __param(4, update_1.IUpdateService),
        __param(5, activity_1.IActivityService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, productService_1.IProductService),
        __param(8, opener_1.IOpenerService),
        __param(9, host_1.IHostService)
    ], UpdateContribution);
    let SwitchProductQualityContribution = class SwitchProductQualityContribution extends lifecycle_1.Disposable {
        constructor(productService, environmentService) {
            super();
            this.productService = productService;
            this.environmentService = environmentService;
            this.registerGlobalActivityActions();
        }
        registerGlobalActivityActions() {
            const quality = this.productService.quality;
            const productQualityChangeHandler = this.environmentService.options?.productQualityChangeHandler;
            if (productQualityChangeHandler && (quality === 'stable' || quality === 'insider')) {
                const newQuality = quality === 'stable' ? 'insider' : 'stable';
                const commandId = `update.switchQuality.${newQuality}`;
                const isSwitchingToInsiders = newQuality === 'insider';
                (0, actions_1.registerAction2)(class SwitchQuality extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: commandId,
                            title: isSwitchingToInsiders ? nls.localize('switchToInsiders', "Switch to Insiders Version...") : nls.localize('switchToStable', "Switch to Stable Version..."),
                            precondition: contextkeys_1.IsWebContext,
                            menu: {
                                id: actions_1.MenuId.GlobalActivity,
                                when: contextkeys_1.IsWebContext,
                                group: '7_update',
                            }
                        });
                    }
                    async run(accessor) {
                        const dialogService = accessor.get(dialogs_1.IDialogService);
                        const userDataSyncEnablementService = accessor.get(userDataSync_1.IUserDataSyncEnablementService);
                        const userDataSyncStoreManagementService = accessor.get(userDataSync_1.IUserDataSyncStoreManagementService);
                        const storageService = accessor.get(storage_1.IStorageService);
                        const userDataSyncWorkbenchService = accessor.get(userDataSync_2.IUserDataSyncWorkbenchService);
                        const userDataSyncService = accessor.get(userDataSync_1.IUserDataSyncService);
                        const notificationService = accessor.get(notification_1.INotificationService);
                        try {
                            const selectSettingsSyncServiceDialogShownKey = 'switchQuality.selectSettingsSyncServiceDialogShown';
                            const userDataSyncStore = userDataSyncStoreManagementService.userDataSyncStore;
                            let userDataSyncStoreType;
                            if (userDataSyncStore && isSwitchingToInsiders && userDataSyncEnablementService.isEnabled()
                                && !storageService.getBoolean(selectSettingsSyncServiceDialogShownKey, -1 /* StorageScope.APPLICATION */, false)) {
                                userDataSyncStoreType = await this.selectSettingsSyncService(dialogService);
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
                                message: nls.localize('relaunchMessage', "Changing the version requires a reload to take effect"),
                                detail: newQuality === 'insider' ?
                                    nls.localize('relaunchDetailInsiders', "Press the reload button to switch to the Insiders version of VS Code.") :
                                    nls.localize('relaunchDetailStable', "Press the reload button to switch to the Stable version of VS Code."),
                                primaryButton: nls.localize({ key: 'reload', comment: ['&& denotes a mnemonic'] }, "&&Reload")
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
                    async selectSettingsSyncService(dialogService) {
                        const { result } = await dialogService.prompt({
                            type: notification_1.Severity.Info,
                            message: nls.localize('selectSyncService.message', "Choose the settings sync service to use after changing the version"),
                            detail: nls.localize('selectSyncService.detail', "The Insiders version of VS Code will synchronize your settings, keybindings, extensions, snippets and UI State using separate insiders settings sync service by default."),
                            buttons: [
                                {
                                    label: nls.localize({ key: 'use insiders', comment: ['&& denotes a mnemonic'] }, "&&Insiders"),
                                    run: () => 'insiders'
                                },
                                {
                                    label: nls.localize({ key: 'use stable', comment: ['&& denotes a mnemonic'] }, "&&Stable (current)"),
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
    exports.SwitchProductQualityContribution = SwitchProductQualityContribution;
    exports.SwitchProductQualityContribution = SwitchProductQualityContribution = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], SwitchProductQualityContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXBkYXRlL2Jyb3dzZXIvdXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4Qm5GLFFBQUEsb0JBQW9CLEdBQUcsSUFBSSwwQkFBYSxDQUFTLGFBQWEsZ0RBQTBCLENBQUM7SUFDekYsUUFBQSw0QkFBNEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsMkJBQTJCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUYsUUFBQSxpQkFBaUIsR0FBRyxJQUFJLDBCQUFhLENBQVMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckUsUUFBQSxZQUFZLEdBQUcsSUFBSSwwQkFBYSxDQUFTLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV6RSxJQUFJLG1CQUFtQixHQUFvQyxTQUFTLENBQUM7SUFFckUsU0FBZ0Isd0JBQXdCLENBQUMsb0JBQTJDLEVBQUUsT0FBZTtRQUNwRyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDekIsbUJBQW1CLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHdDQUFtQixDQUFDLENBQUM7U0FDL0U7UUFFRCxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBTkQsNERBTUM7SUFFRCxLQUFLLFVBQVUsK0JBQStCLENBQUMsUUFBMEI7UUFDeEUsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUM7UUFDbkQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZSxDQUFDLENBQUM7UUFFckQsSUFBSSxjQUFjLENBQUMsZUFBZSxFQUFFO1lBQ25DLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxD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