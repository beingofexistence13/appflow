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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/common/editor", "vs/workbench/services/output/common/output", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences", "vs/base/common/date", "vs/platform/product/common/productService", "vs/platform/opener/common/opener", "vs/workbench/services/authentication/common/authentication", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/views", "vs/workbench/contrib/userDataSync/browser/userDataSyncViews", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/codicons", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/host/browser/host", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/issue/common/issue", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/progress/common/progress", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/files/common/files", "vs/base/common/strings", "vs/platform/userDataSync/common/userDataSyncMachines"], function (require, exports, actions_1, errors_1, event_1, lifecycle_1, resources_1, uri_1, model_1, language_1, resolverService_1, nls_1, actions_2, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, notification_1, quickInput_1, telemetry_1, userDataSync_1, editor_1, output_1, activity_1, editorService_1, preferences_1, date_1, productService_1, opener_1, authentication_1, platform_1, descriptors_1, views_1, userDataSyncViews_1, userDataSync_2, codicons_1, viewPaneContainer_1, actionCommonCategories_1, host_1, userDataProfile_1, textfiles_1, mergeEditor_1, issue_1, userDataProfile_2, progress_1, uriIdentity_1, files_1, strings_1, userDataSyncMachines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncWorkbenchContribution = void 0;
    const turnOffSyncCommand = { id: 'workbench.userDataSync.actions.turnOff', title: { value: (0, nls_1.localize)('stop sync', "Turn Off"), original: 'Turn Off' } };
    const configureSyncCommand = { id: userDataSync_2.CONFIGURE_SYNC_COMMAND_ID, title: { value: (0, nls_1.localize)('configure sync', "Configure..."), original: 'Configure...' } };
    const showConflictsCommandId = 'workbench.userDataSync.actions.showConflicts';
    const syncNowCommand = {
        id: 'workbench.userDataSync.actions.syncNow',
        title: { value: (0, nls_1.localize)('sync now', "Sync Now"), original: 'Sync Now' },
        description(userDataSyncService) {
            if (userDataSyncService.status === "syncing" /* SyncStatus.Syncing */) {
                return (0, nls_1.localize)('syncing', "syncing");
            }
            if (userDataSyncService.lastSyncTime) {
                return (0, nls_1.localize)('synced with time', "synced {0}", (0, date_1.fromNow)(userDataSyncService.lastSyncTime, true));
            }
            return undefined;
        }
    };
    const showSyncSettingsCommand = { id: 'workbench.userDataSync.actions.settings', title: { value: (0, nls_1.localize)('sync settings', "Show Settings"), original: 'Show Settings' }, };
    const showSyncedDataCommand = { id: 'workbench.userDataSync.actions.showSyncedData', title: { value: (0, nls_1.localize)('show synced data', "Show Synced Data"), original: 'Show Synced Data' }, };
    const CONTEXT_TURNING_ON_STATE = new contextkey_1.RawContextKey('userDataSyncTurningOn', false);
    let UserDataSyncWorkbenchContribution = class UserDataSyncWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(userDataSyncEnablementService, userDataSyncService, userDataSyncWorkbenchService, contextKeyService, activityService, notificationService, editorService, userDataProfilesService, userDataProfileService, dialogService, quickInputService, instantiationService, outputService, userDataAutoSyncService, textModelResolverService, preferencesService, telemetryService, productService, openerService, authenticationService, userDataSyncStoreManagementService, configurationService, hostService, commandService, workbenchIssueService) {
            super();
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.activityService = activityService;
            this.notificationService = notificationService;
            this.editorService = editorService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileService = userDataProfileService;
            this.dialogService = dialogService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.outputService = outputService;
            this.preferencesService = preferencesService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.openerService = openerService;
            this.authenticationService = authenticationService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.configurationService = configurationService;
            this.hostService = hostService;
            this.commandService = commandService;
            this.workbenchIssueService = workbenchIssueService;
            this.globalActivityBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.accountBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.conflictsDisposables = new Map();
            this.invalidContentErrorDisposables = new Map();
            this.turningOnSyncContext = CONTEXT_TURNING_ON_STATE.bindTo(contextKeyService);
            if (userDataSyncWorkbenchService.enabled) {
                (0, userDataSync_1.registerConfiguration)();
                this.updateAccountBadge();
                this.updateGlobalActivityBadge();
                this.onDidChangeConflicts(this.userDataSyncService.conflicts);
                this._register(event_1.Event.any(event_1.Event.debounce(userDataSyncService.onDidChangeStatus, () => undefined, 500), this.userDataSyncEnablementService.onDidChangeEnablement, this.userDataSyncWorkbenchService.onDidChangeAccountStatus)(() => {
                    this.updateAccountBadge();
                    this.updateGlobalActivityBadge();
                }));
                this._register(userDataSyncService.onDidChangeConflicts(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
                this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
                this._register(userDataSyncService.onSyncErrors(errors => this.onSynchronizerErrors(errors)));
                this._register(userDataAutoSyncService.onError(error => this.onAutoSyncError(error)));
                this.registerActions();
                this.registerViews();
                textModelResolverService.registerTextModelContentProvider(userDataSync_1.USER_DATA_SYNC_SCHEME, instantiationService.createInstance(UserDataRemoteContentProvider));
                this._register(event_1.Event.any(userDataSyncService.onDidChangeStatus, userDataSyncEnablementService.onDidChangeEnablement)(() => this.turningOnSync = !userDataSyncEnablementService.isEnabled() && userDataSyncService.status !== "idle" /* SyncStatus.Idle */));
            }
        }
        get turningOnSync() {
            return !!this.turningOnSyncContext.get();
        }
        set turningOnSync(turningOn) {
            this.turningOnSyncContext.set(turningOn);
            this.updateGlobalActivityBadge();
        }
        toKey({ syncResource: resource, profile }) {
            return `${profile.id}:${resource}`;
        }
        onDidChangeConflicts(conflicts) {
            if (!this.userDataSyncEnablementService.isEnabled()) {
                return;
            }
            this.updateGlobalActivityBadge();
            if (conflicts.length) {
                // Clear and dispose conflicts those were cleared
                for (const [key, disposable] of this.conflictsDisposables.entries()) {
                    if (!conflicts.some(conflict => this.toKey(conflict) === key)) {
                        disposable.dispose();
                        this.conflictsDisposables.delete(key);
                    }
                }
                for (const conflict of this.userDataSyncService.conflicts) {
                    const key = this.toKey(conflict);
                    // Show conflicts notification if not shown before
                    if (!this.conflictsDisposables.has(key)) {
                        const conflictsArea = (0, userDataSync_2.getSyncAreaLabel)(conflict.syncResource);
                        const handle = this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('conflicts detected', "Unable to sync due to conflicts in {0}. Please resolve them to continue.", conflictsArea.toLowerCase()), [
                            {
                                label: (0, nls_1.localize)('replace remote', "Replace Remote"),
                                run: () => {
                                    this.telemetryService.publicLog2('sync/handleConflicts', { source: conflict.syncResource, action: 'acceptLocal' });
                                    this.acceptLocal(conflict, conflict.conflicts[0]);
                                }
                            },
                            {
                                label: (0, nls_1.localize)('replace local', "Replace Local"),
                                run: () => {
                                    this.telemetryService.publicLog2('sync/handleConflicts', { source: conflict.syncResource, action: 'acceptRemote' });
                                    this.acceptRemote(conflict, conflict.conflicts[0]);
                                }
                            },
                            {
                                label: (0, nls_1.localize)('show conflicts', "Show Conflicts"),
                                run: () => {
                                    this.telemetryService.publicLog2('sync/showConflicts', { source: conflict.syncResource });
                                    this.userDataSyncWorkbenchService.showConflicts(conflict.conflicts[0]);
                                }
                            }
                        ], {
                            sticky: true
                        });
                        this.conflictsDisposables.set(key, (0, lifecycle_1.toDisposable)(() => {
                            // close the conflicts warning notification
                            handle.close();
                            this.conflictsDisposables.delete(key);
                        }));
                    }
                }
            }
            else {
                this.conflictsDisposables.forEach(disposable => disposable.dispose());
                this.conflictsDisposables.clear();
            }
        }
        async acceptRemote(syncResource, conflict) {
            try {
                await this.userDataSyncService.accept(syncResource, conflict.remoteResource, undefined, this.userDataSyncEnablementService.isEnabled());
            }
            catch (e) {
                this.notificationService.error((0, nls_1.localize)('accept failed', "Error while accepting changes. Please check [logs]({0}) for more details.", `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
            }
        }
        async acceptLocal(syncResource, conflict) {
            try {
                await this.userDataSyncService.accept(syncResource, conflict.localResource, undefined, this.userDataSyncEnablementService.isEnabled());
            }
            catch (e) {
                this.notificationService.error((0, nls_1.localize)('accept failed', "Error while accepting changes. Please check [logs]({0}) for more details.", `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
            }
        }
        onAutoSyncError(error) {
            switch (error.code) {
                case "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)('session expired', "Settings sync was turned off because current session is expired, please sign in again to turn on sync."),
                        actions: {
                            primary: [new actions_1.Action('turn on sync', (0, nls_1.localize)('turn on sync', "Turn on Settings Sync..."), undefined, true, () => this.turnOn())]
                        }
                    });
                    break;
                case "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)('turned off', "Settings sync was turned off from another device, please turn on sync again."),
                        actions: {
                            primary: [new actions_1.Action('turn on sync', (0, nls_1.localize)('turn on sync', "Turn on Settings Sync..."), undefined, true, () => this.turnOn())]
                        }
                    });
                    break;
                case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                    if (error.resource === "keybindings" /* SyncResource.Keybindings */ || error.resource === "settings" /* SyncResource.Settings */ || error.resource === "tasks" /* SyncResource.Tasks */) {
                        this.disableSync(error.resource);
                        const sourceArea = (0, userDataSync_2.getSyncAreaLabel)(error.resource);
                        this.handleTooLargeError(error.resource, (0, nls_1.localize)('too large', "Disabled syncing {0} because size of the {1} file to sync is larger than {2}. Please open the file and reduce the size and enable sync", sourceArea.toLowerCase(), sourceArea.toLowerCase(), '100kb'), error);
                    }
                    break;
                case "LocalTooManyProfiles" /* UserDataSyncErrorCode.LocalTooManyProfiles */:
                    this.disableSync("profiles" /* SyncResource.Profiles */);
                    this.notificationService.error((0, nls_1.localize)('too many profiles', "Disabled syncing profiles because there are too many profiles to sync. Settings Sync supports syncing maximum 20 profiles. Please reduce the number of profiles and enable sync"));
                    break;
                case "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */:
                case "Gone" /* UserDataSyncErrorCode.Gone */:
                case "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */: {
                    const message = (0, nls_1.localize)('error upgrade required', "Settings sync is disabled because the current version ({0}, {1}) is not compatible with the sync service. Please update before turning on sync.", this.productService.version, this.productService.commit);
                    const operationId = error.operationId ? (0, nls_1.localize)('operationId', "Operation Id: {0}", error.operationId) : undefined;
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                    });
                    break;
                }
                case "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */: {
                    const message = (0, nls_1.localize)('method not found', "Settings sync is disabled because the client is making invalid requests. Please report an issue with the logs.");
                    const operationId = error.operationId ? (0, nls_1.localize)('operationId', "Operation Id: {0}", error.operationId) : undefined;
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                        actions: {
                            primary: [
                                new actions_1.Action('Show Sync Logs', (0, nls_1.localize)('show sync logs', "Show Log"), undefined, true, () => this.commandService.executeCommand(userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID)),
                                new actions_1.Action('Report Issue', (0, nls_1.localize)('report issue', "Report Issue"), undefined, true, () => this.workbenchIssueService.openReporter())
                            ]
                        }
                    });
                    break;
                }
                case "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: (0, nls_1.localize)('error reset required', "Settings sync is disabled because your data in the cloud is older than that of the client. Please clear your data in the cloud before turning on sync."),
                        actions: {
                            primary: [
                                new actions_1.Action('reset', (0, nls_1.localize)('reset', "Clear Data in Cloud..."), undefined, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
                                new actions_1.Action('show synced data', (0, nls_1.localize)('show synced data action', "Show Synced Data"), undefined, true, () => this.userDataSyncWorkbenchService.showSyncActivity())
                            ]
                        }
                    });
                    return;
                case "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: this.userDataSyncStoreManagementService.userDataSyncStore?.type === 'insiders' ?
                            (0, nls_1.localize)('service switched to insiders', "Settings Sync has been switched to insiders service") :
                            (0, nls_1.localize)('service switched to stable', "Settings Sync has been switched to stable service"),
                    });
                    return;
                case "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */:
                    // Settings sync is using separate service
                    if (this.userDataSyncEnablementService.isEnabled()) {
                        this.notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)('using separate service', "Settings sync now uses a separate service, more information is available in the [Settings Sync Documentation](https://aka.ms/vscode-settings-sync-help#_syncing-stable-versus-insiders)."),
                        });
                    }
                    // If settings sync got turned off then ask user to turn on sync again.
                    else {
                        this.notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)('service changed and turned off', "Settings sync was turned off because {0} now uses a separate service. Please turn on sync again.", this.productService.nameLong),
                            actions: {
                                primary: [new actions_1.Action('turn on sync', (0, nls_1.localize)('turn on sync', "Turn on Settings Sync..."), undefined, true, () => this.turnOn())]
                            }
                        });
                    }
                    return;
            }
        }
        handleTooLargeError(resource, message, error) {
            const operationId = error.operationId ? (0, nls_1.localize)('operationId', "Operation Id: {0}", error.operationId) : undefined;
            this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: operationId ? `${message} ${operationId}` : message,
                actions: {
                    primary: [new actions_1.Action('open sync file', (0, nls_1.localize)('open file', "Open {0} File", (0, userDataSync_2.getSyncAreaLabel)(resource)), undefined, true, () => resource === "settings" /* SyncResource.Settings */ ? this.preferencesService.openUserSettings({ jsonEditor: true }) : this.preferencesService.openGlobalKeybindingSettings(true))]
                }
            });
        }
        onSynchronizerErrors(errors) {
            if (errors.length) {
                for (const { profile, syncResource: resource, error } of errors) {
                    switch (error.code) {
                        case "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */:
                            this.handleInvalidContentError({ profile, syncResource: resource });
                            break;
                        default: {
                            const key = `${profile.id}:${resource}`;
                            const disposable = this.invalidContentErrorDisposables.get(key);
                            if (disposable) {
                                disposable.dispose();
                                this.invalidContentErrorDisposables.delete(key);
                            }
                        }
                    }
                }
            }
            else {
                this.invalidContentErrorDisposables.forEach(disposable => disposable.dispose());
                this.invalidContentErrorDisposables.clear();
            }
        }
        handleInvalidContentError({ profile, syncResource: source }) {
            const key = `${profile.id}:${source}`;
            if (this.invalidContentErrorDisposables.has(key)) {
                return;
            }
            if (source !== "settings" /* SyncResource.Settings */ && source !== "keybindings" /* SyncResource.Keybindings */ && source !== "tasks" /* SyncResource.Tasks */) {
                return;
            }
            if (!this.hostService.hasFocus) {
                return;
            }
            const resource = source === "settings" /* SyncResource.Settings */ ? this.userDataProfileService.currentProfile.settingsResource
                : source === "keybindings" /* SyncResource.Keybindings */ ? this.userDataProfileService.currentProfile.keybindingsResource
                    : this.userDataProfileService.currentProfile.tasksResource;
            const editorUri = editor_1.EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if ((0, resources_1.isEqual)(resource, editorUri)) {
                // Do not show notification if the file in error is active
                return;
            }
            const errorArea = (0, userDataSync_2.getSyncAreaLabel)(source);
            const handle = this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: (0, nls_1.localize)('errorInvalidConfiguration', "Unable to sync {0} because the content in the file is not valid. Please open the file and correct it.", errorArea.toLowerCase()),
                actions: {
                    primary: [new actions_1.Action('open sync file', (0, nls_1.localize)('open file', "Open {0} File", errorArea), undefined, true, () => source === "settings" /* SyncResource.Settings */ ? this.preferencesService.openUserSettings({ jsonEditor: true }) : this.preferencesService.openGlobalKeybindingSettings(true))]
                }
            });
            this.invalidContentErrorDisposables.set(key, (0, lifecycle_1.toDisposable)(() => {
                // close the error warning notification
                handle.close();
                this.invalidContentErrorDisposables.delete(key);
            }));
        }
        getConflictsCount() {
            return this.userDataSyncService.conflicts.reduce((result, { conflicts }) => { return result + conflicts.length; }, 0);
        }
        async updateGlobalActivityBadge() {
            this.globalActivityBadgeDisposable.clear();
            let badge = undefined;
            let clazz;
            let priority = undefined;
            if (this.userDataSyncService.conflicts.length && this.userDataSyncEnablementService.isEnabled()) {
                badge = new activity_1.NumberBadge(this.getConflictsCount(), () => (0, nls_1.localize)('has conflicts', "{0}: Conflicts Detected", userDataSync_2.SYNC_TITLE));
            }
            else if (this.turningOnSync) {
                badge = new activity_1.ProgressBadge(() => (0, nls_1.localize)('turning on syncing', "Turning on Settings Sync..."));
                clazz = 'progress-badge';
                priority = 1;
            }
            if (badge) {
                this.globalActivityBadgeDisposable.value = this.activityService.showGlobalActivity({ badge, clazz, priority });
            }
        }
        async updateAccountBadge() {
            this.accountBadgeDisposable.clear();
            let badge = undefined;
            if (this.userDataSyncService.status !== "uninitialized" /* SyncStatus.Uninitialized */ && this.userDataSyncEnablementService.isEnabled() && this.userDataSyncWorkbenchService.accountStatus === "unavailable" /* AccountStatus.Unavailable */) {
                badge = new activity_1.NumberBadge(1, () => (0, nls_1.localize)('sign in to sync', "Sign in to Sync Settings"));
            }
            if (badge) {
                this.accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge, clazz: undefined, priority: undefined });
            }
        }
        async turnOn() {
            try {
                if (!this.userDataSyncWorkbenchService.authenticationProviders.length) {
                    throw new Error((0, nls_1.localize)('no authentication providers', "No authentication providers are available."));
                }
                const turnOn = await this.askToConfigure();
                if (!turnOn) {
                    return;
                }
                if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
                    await this.selectSettingsSyncService(this.userDataSyncStoreManagementService.userDataSyncStore);
                }
                await this.userDataSyncWorkbenchService.turnOn();
            }
            catch (e) {
                if ((0, errors_1.isCancellationError)(e)) {
                    return;
                }
                if (e instanceof userDataSync_1.UserDataSyncError) {
                    switch (e.code) {
                        case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                            if (e.resource === "keybindings" /* SyncResource.Keybindings */ || e.resource === "settings" /* SyncResource.Settings */ || e.resource === "tasks" /* SyncResource.Tasks */) {
                                this.handleTooLargeError(e.resource, (0, nls_1.localize)('too large while starting sync', "Settings sync cannot be turned on because size of the {0} file to sync is larger than {1}. Please open the file and reduce the size and turn on sync", (0, userDataSync_2.getSyncAreaLabel)(e.resource).toLowerCase(), '100kb'), e);
                                return;
                            }
                            break;
                        case "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */:
                        case "Gone" /* UserDataSyncErrorCode.Gone */:
                        case "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */: {
                            const message = (0, nls_1.localize)('error upgrade required while starting sync', "Settings sync cannot be turned on because the current version ({0}, {1}) is not compatible with the sync service. Please update before turning on sync.", this.productService.version, this.productService.commit);
                            const operationId = e.operationId ? (0, nls_1.localize)('operationId', "Operation Id: {0}", e.operationId) : undefined;
                            this.notificationService.notify({
                                severity: notification_1.Severity.Error,
                                message: operationId ? `${message} ${operationId}` : message,
                            });
                            return;
                        }
                        case "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */:
                            this.notificationService.notify({
                                severity: notification_1.Severity.Error,
                                message: (0, nls_1.localize)('error reset required while starting sync', "Settings sync cannot be turned on because your data in the cloud is older than that of the client. Please clear your data in the cloud before turning on sync."),
                                actions: {
                                    primary: [
                                        new actions_1.Action('reset', (0, nls_1.localize)('reset', "Clear Data in Cloud..."), undefined, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
                                        new actions_1.Action('show synced data', (0, nls_1.localize)('show synced data action', "Show Synced Data"), undefined, true, () => this.userDataSyncWorkbenchService.showSyncActivity())
                                    ]
                                }
                            });
                            return;
                        case "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */:
                        case "Forbidden" /* UserDataSyncErrorCode.Forbidden */:
                            this.notificationService.error((0, nls_1.localize)('auth failed', "Error while turning on Settings Sync: Authentication failed."));
                            return;
                    }
                    this.notificationService.error((0, nls_1.localize)('turn on failed with user data sync error', "Error while turning on Settings Sync. Please check [logs]({0}) for more details.", `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
                }
                else {
                    this.notificationService.error((0, nls_1.localize)({ key: 'turn on failed', comment: ['Substitution is for error reason'] }, "Error while turning on Settings Sync. {0}", (0, errors_1.getErrorMessage)(e)));
                }
            }
        }
        async askToConfigure() {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = userDataSync_2.SYNC_TITLE;
                quickPick.ok = false;
                quickPick.customButton = true;
                quickPick.customLabel = (0, nls_1.localize)('sign in and turn on', "Sign in & Turn on");
                quickPick.description = (0, nls_1.localize)('configure and turn on sync detail', "Please sign in to synchronize your data across devices.");
                quickPick.canSelectMany = true;
                quickPick.ignoreFocusOut = true;
                quickPick.hideInput = true;
                quickPick.hideCheckAll = true;
                const items = this.getConfigureSyncQuickPickItems();
                quickPick.items = items;
                quickPick.selectedItems = items.filter(item => this.userDataSyncEnablementService.isResourceEnabled(item.id));
                let accepted = false;
                disposables.add(event_1.Event.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
                    accepted = true;
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    try {
                        if (accepted) {
                            this.updateConfiguration(items, quickPick.selectedItems);
                        }
                        c(accepted);
                    }
                    catch (error) {
                        e(error);
                    }
                    finally {
                        disposables.dispose();
                    }
                }));
                quickPick.show();
            });
        }
        getConfigureSyncQuickPickItems() {
            const result = [{
                    id: "settings" /* SyncResource.Settings */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("settings" /* SyncResource.Settings */)
                }, {
                    id: "keybindings" /* SyncResource.Keybindings */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("keybindings" /* SyncResource.Keybindings */),
                    description: this.configurationService.getValue('settingsSync.keybindingsPerPlatform') ? (0, nls_1.localize)('per platform', "for each platform") : undefined
                }, {
                    id: "snippets" /* SyncResource.Snippets */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("snippets" /* SyncResource.Snippets */)
                }, {
                    id: "tasks" /* SyncResource.Tasks */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("tasks" /* SyncResource.Tasks */)
                }, {
                    id: "globalState" /* SyncResource.GlobalState */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("globalState" /* SyncResource.GlobalState */),
                }, {
                    id: "extensions" /* SyncResource.Extensions */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("extensions" /* SyncResource.Extensions */)
                }];
            if (this.userDataProfilesService.isEnabled()) {
                result.push({
                    id: "profiles" /* SyncResource.Profiles */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("profiles" /* SyncResource.Profiles */),
                });
            }
            return result;
        }
        updateConfiguration(items, selectedItems) {
            for (const item of items) {
                const wasEnabled = this.userDataSyncEnablementService.isResourceEnabled(item.id);
                const isEnabled = !!selectedItems.filter(selected => selected.id === item.id)[0];
                if (wasEnabled !== isEnabled) {
                    this.userDataSyncEnablementService.setResourceEnablement(item.id, isEnabled);
                }
            }
        }
        async configureSyncOptions() {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = (0, nls_1.localize)('configure sync title', "{0}: Configure...", userDataSync_2.SYNC_TITLE);
                quickPick.placeholder = (0, nls_1.localize)('configure sync placeholder', "Choose what to sync");
                quickPick.canSelectMany = true;
                quickPick.ignoreFocusOut = true;
                quickPick.ok = true;
                const items = this.getConfigureSyncQuickPickItems();
                quickPick.items = items;
                quickPick.selectedItems = items.filter(item => this.userDataSyncEnablementService.isResourceEnabled(item.id));
                disposables.add(quickPick.onDidAccept(async () => {
                    if (quickPick.selectedItems.length) {
                        this.updateConfiguration(items, quickPick.selectedItems);
                        quickPick.hide();
                    }
                }));
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c();
                }));
                quickPick.show();
            });
        }
        async turnOff() {
            const result = await this.dialogService.confirm({
                message: (0, nls_1.localize)('turn off sync confirmation', "Do you want to turn off sync?"),
                detail: (0, nls_1.localize)('turn off sync detail', "Your settings, keybindings, extensions, snippets and UI State will no longer be synced."),
                primaryButton: (0, nls_1.localize)({ key: 'turn off', comment: ['&& denotes a mnemonic'] }, "&&Turn off"),
                checkbox: this.userDataSyncWorkbenchService.accountStatus === "available" /* AccountStatus.Available */ ? {
                    label: (0, nls_1.localize)('turn off sync everywhere', "Turn off sync on all your devices and clear the data from the cloud.")
                } : undefined
            });
            if (result.confirmed) {
                return this.userDataSyncWorkbenchService.turnoff(!!result.checkboxChecked);
            }
        }
        disableSync(source) {
            switch (source) {
                case "settings" /* SyncResource.Settings */: return this.userDataSyncEnablementService.setResourceEnablement("settings" /* SyncResource.Settings */, false);
                case "keybindings" /* SyncResource.Keybindings */: return this.userDataSyncEnablementService.setResourceEnablement("keybindings" /* SyncResource.Keybindings */, false);
                case "snippets" /* SyncResource.Snippets */: return this.userDataSyncEnablementService.setResourceEnablement("snippets" /* SyncResource.Snippets */, false);
                case "tasks" /* SyncResource.Tasks */: return this.userDataSyncEnablementService.setResourceEnablement("tasks" /* SyncResource.Tasks */, false);
                case "extensions" /* SyncResource.Extensions */: return this.userDataSyncEnablementService.setResourceEnablement("extensions" /* SyncResource.Extensions */, false);
                case "globalState" /* SyncResource.GlobalState */: return this.userDataSyncEnablementService.setResourceEnablement("globalState" /* SyncResource.GlobalState */, false);
                case "profiles" /* SyncResource.Profiles */: return this.userDataSyncEnablementService.setResourceEnablement("profiles" /* SyncResource.Profiles */, false);
            }
        }
        showSyncActivity() {
            return this.outputService.showChannel(userDataSync_1.USER_DATA_SYNC_LOG_ID);
        }
        async selectSettingsSyncService(userDataSyncStore) {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = disposables.add(this.quickInputService.createQuickPick());
                quickPick.title = (0, nls_1.localize)('switchSyncService.title', "{0}: Select Service", userDataSync_2.SYNC_TITLE);
                quickPick.description = (0, nls_1.localize)('switchSyncService.description', "Ensure you are using the same settings sync service when syncing with multiple environments");
                quickPick.hideInput = true;
                quickPick.ignoreFocusOut = true;
                const getDescription = (url) => {
                    const isDefault = (0, resources_1.isEqual)(url, userDataSyncStore.defaultUrl);
                    if (isDefault) {
                        return (0, nls_1.localize)('default', "Default");
                    }
                    return undefined;
                };
                quickPick.items = [
                    {
                        id: 'insiders',
                        label: (0, nls_1.localize)('insiders', "Insiders"),
                        description: getDescription(userDataSyncStore.insidersUrl)
                    },
                    {
                        id: 'stable',
                        label: (0, nls_1.localize)('stable', "Stable"),
                        description: getDescription(userDataSyncStore.stableUrl)
                    }
                ];
                disposables.add(quickPick.onDidAccept(async () => {
                    try {
                        await this.userDataSyncStoreManagementService.switch(quickPick.selectedItems[0].id);
                        c();
                    }
                    catch (error) {
                        e(error);
                    }
                    finally {
                        quickPick.hide();
                    }
                }));
                disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                quickPick.show();
            });
        }
        registerActions() {
            if (this.userDataSyncEnablementService.canToggleEnablement()) {
                this.registerTurnOnSyncAction();
                this.registerTurnOffSyncAction();
            }
            this.registerTurningOnSyncAction();
            this.registerCancelTurnOnSyncAction();
            this.registerSignInAction(); // When Sync is turned on from CLI
            this.registerShowConflictsAction();
            this.registerEnableSyncViewsAction();
            this.registerManageSyncAction();
            this.registerSyncNowAction();
            this.registerConfigureSyncAction();
            this.registerShowSettingsAction();
            this.registerHelpAction();
            this.registerShowLogAction();
            this.registerResetSyncDataAction();
            this.registerAcceptMergesAction();
            this.registerDownloadSyncActivityAction();
        }
        registerTurnOnSyncAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT.toNegated(), CONTEXT_TURNING_ON_STATE.negate());
            this._register((0, actions_2.registerAction2)(class TurningOnSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.turnOn',
                        title: { value: (0, nls_1.localize)('global activity turn on sync', "Backup and Sync Settings..."), original: 'Backup and Sync Settings...' },
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        f1: true,
                        precondition: when,
                        menu: [{
                                group: '3_settings_sync',
                                id: actions_2.MenuId.GlobalActivity,
                                when,
                                order: 1
                            }, {
                                group: '3_settings_sync',
                                id: actions_2.MenuId.MenubarPreferencesMenu,
                                when,
                                order: 1
                            }, {
                                group: '1_settings',
                                id: actions_2.MenuId.AccountsContext,
                                when,
                                order: 2
                            }]
                    });
                }
                async run() {
                    return that.turnOn();
                }
            }));
        }
        registerTurningOnSyncAction() {
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT.toNegated(), CONTEXT_TURNING_ON_STATE);
            this._register((0, actions_2.registerAction2)(class TurningOnSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.turningOn',
                        title: (0, nls_1.localize)('turnin on sync', "Turning on Settings Sync..."),
                        precondition: contextkey_1.ContextKeyExpr.false(),
                        menu: [{
                                group: '3_settings_sync',
                                id: actions_2.MenuId.GlobalActivity,
                                when,
                                order: 2
                            }, {
                                group: '1_settings',
                                id: actions_2.MenuId.AccountsContext,
                                when,
                            }]
                    });
                }
                async run() { }
            }));
        }
        registerCancelTurnOnSyncAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class TurningOnSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.cancelTurnOn',
                        title: (0, nls_1.localize)('cancel turning on sync', "Cancel"),
                        icon: codicons_1.Codicon.stopCircle,
                        menu: {
                            id: actions_2.MenuId.ViewContainerTitle,
                            when: contextkey_1.ContextKeyExpr.and(CONTEXT_TURNING_ON_STATE, contextkey_1.ContextKeyExpr.equals('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID)),
                            group: 'navigation',
                            order: 1
                        }
                    });
                }
                async run() {
                    return that.userDataSyncWorkbenchService.turnoff(false);
                }
            }));
        }
        registerSignInAction() {
            const that = this;
            const id = 'workbench.userData.actions.signin';
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT, userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("unavailable" /* AccountStatus.Unavailable */));
            this._register((0, actions_2.registerAction2)(class StopSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.signin',
                        title: (0, nls_1.localize)('sign in global', "Sign in to Sync Settings"),
                        menu: {
                            group: '3_settings_sync',
                            id: actions_2.MenuId.GlobalActivity,
                            when,
                            order: 2
                        }
                    });
                }
                async run() {
                    try {
                        await that.userDataSyncWorkbenchService.signIn();
                    }
                    catch (e) {
                        that.notificationService.error(e);
                    }
                }
            }));
            this._register(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.AccountsContext, {
                group: '1_settings',
                command: {
                    id,
                    title: (0, nls_1.localize)('sign in accounts', "Sign in to Sync Settings (1)"),
                },
                when
            }));
        }
        getShowConflictsTitle() {
            return { value: (0, nls_1.localize)('resolveConflicts_global', "Show Conflicts ({0})", this.getConflictsCount()), original: `Show Conflicts (${this.getConflictsCount()})` };
        }
        registerShowConflictsAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class TurningOnSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: showConflictsCommandId,
                        get title() { return that.getShowConflictsTitle(); },
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        f1: true,
                        precondition: userDataSync_2.CONTEXT_HAS_CONFLICTS,
                        menu: [{
                                group: '3_settings_sync',
                                id: actions_2.MenuId.GlobalActivity,
                                when: userDataSync_2.CONTEXT_HAS_CONFLICTS,
                                order: 2
                            }, {
                                group: '3_settings_sync',
                                id: actions_2.MenuId.MenubarPreferencesMenu,
                                when: userDataSync_2.CONTEXT_HAS_CONFLICTS,
                                order: 2
                            }]
                    });
                }
                async run() {
                    return that.userDataSyncWorkbenchService.showConflicts();
                }
            }));
        }
        registerManageSyncAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_ENABLEMENT, userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */));
            this._register((0, actions_2.registerAction2)(class SyncStatusAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.manage',
                        title: (0, nls_1.localize)('sync is on', "Settings Sync is On"),
                        toggled: contextkey_1.ContextKeyTrueExpr.INSTANCE,
                        menu: [
                            {
                                id: actions_2.MenuId.GlobalActivity,
                                group: '3_settings_sync',
                                when,
                                order: 2
                            },
                            {
                                id: actions_2.MenuId.MenubarPreferencesMenu,
                                group: '3_settings_sync',
                                when,
                                order: 2,
                            },
                            {
                                id: actions_2.MenuId.AccountsContext,
                                group: '1_settings',
                                when,
                            }
                        ],
                    });
                }
                run(accessor) {
                    return new Promise((c, e) => {
                        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                        const commandService = accessor.get(commands_1.ICommandService);
                        const disposables = new lifecycle_1.DisposableStore();
                        const quickPick = quickInputService.createQuickPick();
                        disposables.add(quickPick);
                        const items = [];
                        if (that.userDataSyncService.conflicts.length) {
                            items.push({ id: showConflictsCommandId, label: `${userDataSync_2.SYNC_TITLE}: ${that.getShowConflictsTitle().original}` });
                            items.push({ type: 'separator' });
                        }
                        items.push({ id: configureSyncCommand.id, label: `${userDataSync_2.SYNC_TITLE}: ${configureSyncCommand.title.original}` });
                        items.push({ id: showSyncSettingsCommand.id, label: `${userDataSync_2.SYNC_TITLE}: ${showSyncSettingsCommand.title.original}` });
                        items.push({ id: showSyncedDataCommand.id, label: `${userDataSync_2.SYNC_TITLE}: ${showSyncedDataCommand.title.original}` });
                        items.push({ type: 'separator' });
                        items.push({ id: syncNowCommand.id, label: `${userDataSync_2.SYNC_TITLE}: ${syncNowCommand.title.original}`, description: syncNowCommand.description(that.userDataSyncService) });
                        if (that.userDataSyncEnablementService.canToggleEnablement()) {
                            const account = that.userDataSyncWorkbenchService.current;
                            items.push({ id: turnOffSyncCommand.id, label: `${userDataSync_2.SYNC_TITLE}: ${turnOffSyncCommand.title.original}`, description: account ? `${account.accountName} (${that.authenticationService.getLabel(account.authenticationProviderId)})` : undefined });
                        }
                        quickPick.items = items;
                        disposables.add(quickPick.onDidAccept(() => {
                            if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
                                commandService.executeCommand(quickPick.selectedItems[0].id);
                            }
                            quickPick.hide();
                        }));
                        disposables.add(quickPick.onDidHide(() => {
                            disposables.dispose();
                            c();
                        }));
                        quickPick.show();
                    });
                }
            }));
        }
        registerEnableSyncViewsAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */));
            this._register((0, actions_2.registerAction2)(class SyncStatusAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: showSyncedDataCommand.id,
                        title: showSyncedDataCommand.title,
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        precondition: when,
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when
                        }
                    });
                }
                run(accessor) {
                    return that.userDataSyncWorkbenchService.showSyncActivity();
                }
            }));
        }
        registerSyncNowAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class SyncNowAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: syncNowCommand.id,
                        title: syncNowCommand.title,
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_ENABLEMENT, userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */))
                        }
                    });
                }
                run(accessor) {
                    return that.userDataSyncWorkbenchService.syncNow();
                }
            }));
        }
        registerTurnOffSyncAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class StopSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: turnOffSyncCommand.id,
                        title: turnOffSyncCommand.title,
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT),
                        },
                    });
                }
                async run() {
                    try {
                        await that.turnOff();
                    }
                    catch (e) {
                        if (!(0, errors_1.isCancellationError)(e)) {
                            that.notificationService.error((0, nls_1.localize)('turn off failed', "Error while turning off Settings Sync. Please check [logs]({0}) for more details.", `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
                        }
                    }
                }
            }));
        }
        registerConfigureSyncAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT);
            this._register((0, actions_2.registerAction2)(class ConfigureSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: configureSyncCommand.id,
                        title: configureSyncCommand.title,
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        icon: codicons_1.Codicon.settingsGear,
                        tooltip: (0, nls_1.localize)('configure', "Configure..."),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when
                            }, {
                                id: actions_2.MenuId.ViewContainerTitle,
                                when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_ENABLEMENT, contextkey_1.ContextKeyExpr.equals('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID)),
                                group: 'navigation',
                                order: 2
                            }]
                    });
                }
                run() { return that.configureSyncOptions(); }
            }));
        }
        registerShowLogAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class ShowSyncActivityAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID,
                        title: (0, nls_1.localize)('show sync log title', "{0}: Show Log", userDataSync_2.SYNC_TITLE),
                        tooltip: (0, nls_1.localize)('show sync log toolrip', "Show Log"),
                        icon: codicons_1.Codicon.output,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */)),
                            }, {
                                id: actions_2.MenuId.ViewContainerTitle,
                                when: contextkey_1.ContextKeyExpr.equals('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID),
                                group: 'navigation',
                                order: 1
                            }],
                    });
                }
                run() { return that.showSyncActivity(); }
            }));
        }
        registerShowSettingsAction() {
            this._register((0, actions_2.registerAction2)(class ShowSyncSettingsAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: showSyncSettingsCommand.id,
                        title: showSyncSettingsCommand.title,
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */)),
                        },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_1.IPreferencesService).openUserSettings({ jsonEditor: false, query: '@tag:sync' });
                }
            }));
        }
        registerHelpAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class HelpAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.help',
                        title: { value: userDataSync_2.SYNC_TITLE, original: 'Settings Sync' },
                        category: actionCommonCategories_1.Categories.Help,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */)),
                            }],
                    });
                }
                run() { return that.openerService.open(uri_1.URI.parse('https://aka.ms/vscode-settings-sync-help')); }
            }));
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ViewContainerTitle, {
                command: {
                    id: 'workbench.userDataSync.actions.help',
                    title: actionCommonCategories_1.Categories.Help.value
                },
                when: contextkey_1.ContextKeyExpr.equals('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID),
                group: '1_help',
            });
        }
        registerAcceptMergesAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class AcceptMergesAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.acceptMerges',
                        title: (0, nls_1.localize)('complete merges title', "Complete Merge"),
                        menu: [{
                                id: actions_2.MenuId.EditorContent,
                                when: contextkey_1.ContextKeyExpr.and(mergeEditor_1.ctxIsMergeResultEditor, contextkey_1.ContextKeyExpr.regex(mergeEditor_1.ctxMergeBaseUri.key, new RegExp(`^${userDataSync_1.USER_DATA_SYNC_SCHEME}:`))),
                            }],
                    });
                }
                async run(accessor, previewResource) {
                    const textFileService = accessor.get(textfiles_1.ITextFileService);
                    await textFileService.save(previewResource);
                    const content = await textFileService.read(previewResource);
                    await that.userDataSyncService.accept(this.getSyncResource(previewResource), previewResource, content.value, true);
                }
                getSyncResource(previewResource) {
                    const conflict = that.userDataSyncService.conflicts.find(({ conflicts }) => conflicts.some(conflict => (0, resources_1.isEqual)(conflict.previewResource, previewResource)));
                    if (conflict) {
                        return conflict;
                    }
                    throw new Error(`Unknown resource: ${previewResource.toString()}`);
                }
            }));
        }
        registerDownloadSyncActivityAction() {
            this._register((0, actions_2.registerAction2)(class DownloadSyncActivityAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.downloadSyncActivity',
                        title: { original: 'Download Settings Sync Activity', value: (0, nls_1.localize)('download sync activity title', "Download Settings Sync Activity") },
                        category: actionCommonCategories_1.Categories.Developer,
                        f1: true,
                        precondition: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */))
                    });
                }
                async run(accessor) {
                    const userDataSyncWorkbenchService = accessor.get(userDataSync_2.IUserDataSyncWorkbenchService);
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const progressService = accessor.get(progress_1.IProgressService);
                    const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
                    const fileService = accessor.get(files_1.IFileService);
                    const userDataSyncMachinesService = accessor.get(userDataSyncMachines_1.IUserDataSyncMachinesService);
                    const result = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)('download sync activity dialog title', "Select folder to download Settings Sync activity"),
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: (0, nls_1.localize)('download sync activity dialog open label', "Save"),
                    });
                    if (!result?.[0]) {
                        return;
                    }
                    await progressService.withProgress({ location: 10 /* ProgressLocation.Window */ }, async () => {
                        const machines = await userDataSyncMachinesService.getMachines();
                        const currentMachine = machines.find(m => m.isCurrent);
                        const name = (currentMachine ? currentMachine.name + ' - ' : '') + 'Settings Sync Activity';
                        const stat = await fileService.resolve(result[0]);
                        const nameRegEx = new RegExp(`${(0, strings_1.escapeRegExpCharacters)(name)}\\s(\\d+)`);
                        const indexes = [];
                        for (const child of stat.children ?? []) {
                            if (child.name === name) {
                                indexes.push(0);
                            }
                            else {
                                const matches = nameRegEx.exec(child.name);
                                if (matches) {
                                    indexes.push(parseInt(matches[1]));
                                }
                            }
                        }
                        indexes.sort((a, b) => a - b);
                        return userDataSyncWorkbenchService.downloadSyncActivity(uriIdentityService.extUri.joinPath(result[0], indexes[0] !== 0 ? name : `${name} ${indexes[indexes.length - 1] + 1}`));
                    });
                }
            }));
        }
        registerViews() {
            const container = this.registerViewContainer();
            this.registerDataViews(container);
        }
        registerViewContainer() {
            return platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: userDataSync_2.SYNC_VIEW_CONTAINER_ID,
                title: { value: userDataSync_2.SYNC_TITLE, original: userDataSync_2.SYNC_ORIGINAL_TITLE },
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [userDataSync_2.SYNC_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
                icon: userDataSync_2.SYNC_VIEW_ICON,
                hideIfEmpty: true,
            }, 0 /* ViewContainerLocation.Sidebar */);
        }
        registerResetSyncDataAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.actions.syncData.reset',
                        title: (0, nls_1.localize)('workbench.actions.syncData.reset', "Clear Data in Cloud..."),
                        menu: [{
                                id: actions_2.MenuId.ViewContainerTitle,
                                when: contextkey_1.ContextKeyExpr.equals('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID),
                                group: '0_configure',
                            }],
                    });
                }
                run() { return that.userDataSyncWorkbenchService.resetSyncedData(); }
            }));
        }
        registerDataViews(container) {
            this._register(this.instantiationService.createInstance(userDataSyncViews_1.UserDataSyncDataViews, container));
        }
    };
    exports.UserDataSyncWorkbenchContribution = UserDataSyncWorkbenchContribution;
    exports.UserDataSyncWorkbenchContribution = UserDataSyncWorkbenchContribution = __decorate([
        __param(0, userDataSync_1.IUserDataSyncEnablementService),
        __param(1, userDataSync_1.IUserDataSyncService),
        __param(2, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, activity_1.IActivityService),
        __param(5, notification_1.INotificationService),
        __param(6, editorService_1.IEditorService),
        __param(7, userDataProfile_1.IUserDataProfilesService),
        __param(8, userDataProfile_2.IUserDataProfileService),
        __param(9, dialogs_1.IDialogService),
        __param(10, quickInput_1.IQuickInputService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, output_1.IOutputService),
        __param(13, userDataSync_1.IUserDataAutoSyncService),
        __param(14, resolverService_1.ITextModelService),
        __param(15, preferences_1.IPreferencesService),
        __param(16, telemetry_1.ITelemetryService),
        __param(17, productService_1.IProductService),
        __param(18, opener_1.IOpenerService),
        __param(19, authentication_1.IAuthenticationService),
        __param(20, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(21, configuration_1.IConfigurationService),
        __param(22, host_1.IHostService),
        __param(23, commands_1.ICommandService),
        __param(24, issue_1.IWorkbenchIssueService)
    ], UserDataSyncWorkbenchContribution);
    let UserDataRemoteContentProvider = class UserDataRemoteContentProvider {
        constructor(userDataSyncService, modelService, languageService) {
            this.userDataSyncService = userDataSyncService;
            this.modelService = modelService;
            this.languageService = languageService;
        }
        provideTextContent(uri) {
            if (uri.scheme === userDataSync_1.USER_DATA_SYNC_SCHEME) {
                return this.userDataSyncService.resolveContent(uri).then(content => this.modelService.createModel(content || '', this.languageService.createById('jsonc'), uri));
            }
            return null;
        }
    };
    UserDataRemoteContentProvider = __decorate([
        __param(0, userDataSync_1.IUserDataSyncService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService)
    ], UserDataRemoteContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXNlckRhdGFTeW5jL2Jyb3dzZXIvdXNlckRhdGFTeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9FaEcsTUFBTSxrQkFBa0IsR0FBRyxFQUFFLEVBQUUsRUFBRSx3Q0FBd0MsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDO0lBQ3ZKLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxFQUFFLEVBQUUsd0NBQXlCLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUFDO0lBQ3ZKLE1BQU0sc0JBQXNCLEdBQUcsOENBQThDLENBQUM7SUFDOUUsTUFBTSxjQUFjLEdBQUc7UUFDdEIsRUFBRSxFQUFFLHdDQUF3QztRQUM1QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7UUFDeEUsV0FBVyxDQUFDLG1CQUF5QztZQUNwRCxJQUFJLG1CQUFtQixDQUFDLE1BQU0sdUNBQXVCLEVBQUU7Z0JBQ3RELE9BQU8sSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsSUFBSSxtQkFBbUIsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLElBQUEsY0FBTyxFQUFDLG1CQUFtQixDQUFDLFlB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