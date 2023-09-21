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
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/extensions/common/extensions", "vs/nls", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/contextkey/common/contextkey", "vs/platform/progress/common/progress", "vs/base/common/uri", "vs/workbench/common/views", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/globalStateSync", "vs/base/common/errors", "vs/base/common/async", "vs/base/common/cancellation", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/secrets/common/secrets", "vs/platform/files/common/files"], function (require, exports, userDataSync_1, telemetry_1, extensions_1, userDataSync_2, lifecycle_1, event_1, authenticationService_1, authentication_1, userDataSyncAccount_1, quickInput_1, storage_1, log_1, productService_1, extensions_2, nls_1, notification_1, dialogs_1, contextkey_1, progress_1, uri_1, views_1, lifecycle_2, platform_1, instantiation_1, userDataSyncStoreService_1, globalStateSync_1, errors_1, async_1, cancellation_1, editorService_1, uriIdentity_1, editor_1, environmentService_1, userDataInit_1, secrets_1, files_1) {
    "use strict";
    var UserDataSyncWorkbenchService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncWorkbenchService = exports.isMergeEditorInput = void 0;
    class UserDataSyncAccount {
        constructor(authenticationProviderId, session) {
            this.authenticationProviderId = authenticationProviderId;
            this.session = session;
        }
        get sessionId() { return this.session.id; }
        get accountName() { return this.session.account.label; }
        get accountId() { return this.session.account.id; }
        get token() { return this.session.idToken || this.session.accessToken; }
    }
    function isMergeEditorInput(editor) {
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.base) && uri_1.URI.isUri(candidate?.input1?.uri) && uri_1.URI.isUri(candidate?.input2?.uri) && uri_1.URI.isUri(candidate?.result);
    }
    exports.isMergeEditorInput = isMergeEditorInput;
    let UserDataSyncWorkbenchService = class UserDataSyncWorkbenchService extends lifecycle_1.Disposable {
        static { UserDataSyncWorkbenchService_1 = this; }
        static { this.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY = 'userDataSyncAccount.donotUseWorkbenchSession'; }
        static { this.CACHED_AUTHENTICATION_PROVIDER_KEY = 'userDataSyncAccountProvider'; }
        static { this.CACHED_SESSION_STORAGE_KEY = 'userDataSyncAccountPreference'; }
        get enabled() { return !!this.userDataSyncStoreManagementService.userDataSyncStore; }
        get authenticationProviders() { return this._authenticationProviders; }
        get accountStatus() { return this._accountStatus; }
        get current() { return this._current; }
        constructor(userDataSyncService, uriIdentityService, authenticationService, userDataSyncAccountService, quickInputService, storageService, userDataSyncEnablementService, userDataAutoSyncService, telemetryService, logService, productService, extensionService, environmentService, secretStorageService, notificationService, progressService, dialogService, contextKeyService, viewsService, viewDescriptorService, userDataSyncStoreManagementService, lifecycleService, instantiationService, editorService, userDataInitializationService, fileService) {
            super();
            this.userDataSyncService = userDataSyncService;
            this.uriIdentityService = uriIdentityService;
            this.authenticationService = authenticationService;
            this.userDataSyncAccountService = userDataSyncAccountService;
            this.quickInputService = quickInputService;
            this.storageService = storageService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataAutoSyncService = userDataAutoSyncService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.productService = productService;
            this.extensionService = extensionService;
            this.environmentService = environmentService;
            this.secretStorageService = secretStorageService;
            this.notificationService = notificationService;
            this.progressService = progressService;
            this.dialogService = dialogService;
            this.viewsService = viewsService;
            this.viewDescriptorService = viewDescriptorService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.userDataInitializationService = userDataInitializationService;
            this.fileService = fileService;
            this._authenticationProviders = [];
            this._accountStatus = "unavailable" /* AccountStatus.Unavailable */;
            this._onDidChangeAccountStatus = this._register(new event_1.Emitter());
            this.onDidChangeAccountStatus = this._onDidChangeAccountStatus.event;
            this.turnOnSyncCancellationToken = undefined;
            this._cachedCurrentAuthenticationProviderId = null;
            this._cachedCurrentSessionId = null;
            this.syncEnablementContext = userDataSync_2.CONTEXT_SYNC_ENABLEMENT.bindTo(contextKeyService);
            this.syncStatusContext = userDataSync_2.CONTEXT_SYNC_STATE.bindTo(contextKeyService);
            this.accountStatusContext = userDataSync_2.CONTEXT_ACCOUNT_STATE.bindTo(contextKeyService);
            this.activityViewsEnablementContext = userDataSync_2.CONTEXT_ENABLE_ACTIVITY_VIEWS.bindTo(contextKeyService);
            this.hasConflicts = userDataSync_2.CONTEXT_HAS_CONFLICTS.bindTo(contextKeyService);
            this.enableConflictsViewContext = userDataSync_2.CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW.bindTo(contextKeyService);
            if (this.userDataSyncStoreManagementService.userDataSyncStore) {
                this.syncStatusContext.set(this.userDataSyncService.status);
                this._register(userDataSyncService.onDidChangeStatus(status => this.syncStatusContext.set(status)));
                this.syncEnablementContext.set(userDataSyncEnablementService.isEnabled());
                this._register(userDataSyncEnablementService.onDidChangeEnablement(enabled => this.syncEnablementContext.set(enabled)));
                this.waitAndInitialize();
            }
        }
        updateAuthenticationProviders() {
            this._authenticationProviders = (this.userDataSyncStoreManagementService.userDataSyncStore?.authenticationProviders || []).filter(({ id }) => this.authenticationService.declaredProviders.some(provider => provider.id === id));
        }
        isSupportedAuthenticationProviderId(authenticationProviderId) {
            return this.authenticationProviders.some(({ id }) => id === authenticationProviderId);
        }
        async waitAndInitialize() {
            /* wait */
            await Promise.all([this.extensionService.whenInstalledExtensionsRegistered(), this.userDataInitializationService.whenInitializationFinished()]);
            /* initialize */
            try {
                await this.initialize();
            }
            catch (error) {
                // Do not log if the current window is running extension tests
                if (!this.environmentService.extensionTestsLocationURI) {
                    this.logService.error(error);
                }
            }
        }
        async initialize() {
            if (platform_1.isWeb) {
                const authenticationSession = await (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.secretStorageService, this.productService);
                if (this.currentSessionId === undefined && authenticationSession?.id) {
                    if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider && this.environmentService.options.settingsSyncOptions.enabled) {
                        this.currentSessionId = authenticationSession.id;
                    }
                    // Backward compatibility
                    else if (this.useWorkbenchSessionId) {
                        this.currentSessionId = authenticationSession.id;
                    }
                    this.useWorkbenchSessionId = false;
                }
            }
            await this.update();
            this._register(this.authenticationService.onDidChangeDeclaredProviders(() => this.updateAuthenticationProviders()));
            this._register(event_1.Event.filter(event_1.Event.any(this.authenticationService.onDidRegisterAuthenticationProvider, this.authenticationService.onDidUnregisterAuthenticationProvider), info => this.isSupportedAuthenticationProviderId(info.id))(() => this.update()));
            this._register(event_1.Event.filter(this.userDataSyncAccountService.onTokenFailed, isSuccessive => !isSuccessive)(() => this.update('token failure')));
            this._register(event_1.Event.filter(this.authenticationService.onDidChangeSessions, e => this.isSupportedAuthenticationProviderId(e.providerId))(({ event }) => this.onDidChangeSessions(event)));
            this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, UserDataSyncWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidChangeStorage()));
            this._register(event_1.Event.filter(this.userDataSyncAccountService.onTokenFailed, bailout => bailout)(() => this.onDidAuthFailure()));
            this.hasConflicts.set(this.userDataSyncService.conflicts.length > 0);
            this._register(this.userDataSyncService.onDidChangeConflicts(conflicts => {
                this.hasConflicts.set(conflicts.length > 0);
                if (!conflicts.length) {
                    this.enableConflictsViewContext.reset();
                }
                // Close merge editors with no conflicts
                this.editorService.editors.filter(input => {
                    const remoteResource = (0, editor_1.isDiffEditorInput)(input) ? input.original.resource : isMergeEditorInput(input) ? input.input1.uri : undefined;
                    if (remoteResource?.scheme !== userDataSync_1.USER_DATA_SYNC_SCHEME) {
                        return false;
                    }
                    return !this.userDataSyncService.conflicts.some(({ conflicts }) => conflicts.some(({ previewResource }) => this.uriIdentityService.extUri.isEqual(previewResource, input.resource)));
                }).forEach(input => input.dispose());
            }));
        }
        async update(reason) {
            if (reason) {
                this.logService.info(`Settings Sync: Updating due to ${reason}`);
            }
            this.updateAuthenticationProviders();
            await this.updateCurrentAccount();
            if (this._current) {
                this.currentAuthenticationProviderId = this._current.authenticationProviderId;
            }
            await this.updateToken(this._current);
            this.updateAccountStatus(this._current ? "available" /* AccountStatus.Available */ : "unavailable" /* AccountStatus.Unavailable */);
        }
        async updateCurrentAccount() {
            const currentSessionId = this.currentSessionId;
            const currentAuthenticationProviderId = this.currentAuthenticationProviderId;
            if (currentSessionId) {
                const authenticationProviders = currentAuthenticationProviderId ? this.authenticationProviders.filter(({ id }) => id === currentAuthenticationProviderId) : this.authenticationProviders;
                for (const { id, scopes } of authenticationProviders) {
                    const sessions = (await this.authenticationService.getSessions(id, scopes)) || [];
                    for (const session of sessions) {
                        if (session.id === currentSessionId) {
                            this._current = new UserDataSyncAccount(id, session);
                            return;
                        }
                    }
                }
            }
            this._current = undefined;
        }
        async updateToken(current) {
            let value = undefined;
            if (current) {
                try {
                    this.logService.trace('Settings Sync: Updating the token for the account', current.accountName);
                    const token = current.token;
                    this.logService.trace('Settings Sync: Token updated for the account', current.accountName);
                    value = { token, authenticationProviderId: current.authenticationProviderId };
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            await this.userDataSyncAccountService.updateAccount(value);
        }
        updateAccountStatus(accountStatus) {
            if (this._accountStatus !== accountStatus) {
                const previous = this._accountStatus;
                this.logService.trace(`Settings Sync: Account status changed from ${previous} to ${accountStatus}`);
                this._accountStatus = accountStatus;
                this.accountStatusContext.set(accountStatus);
                this._onDidChangeAccountStatus.fire(accountStatus);
            }
        }
        async turnOn() {
            if (!this.authenticationProviders.length) {
                throw new Error((0, nls_1.localize)('no authentication providers', "Settings sync cannot be turned on because there are no authentication providers available."));
            }
            if (this.userDataSyncEnablementService.isEnabled()) {
                return;
            }
            if (this.userDataSyncService.status !== "idle" /* SyncStatus.Idle */) {
                throw new Error('Cannot turn on sync while syncing');
            }
            const picked = await this.pick();
            if (!picked) {
                throw new errors_1.CancellationError();
            }
            // User did not pick an account or login failed
            if (this.accountStatus !== "available" /* AccountStatus.Available */) {
                throw new Error((0, nls_1.localize)('no account', "No account available"));
            }
            const turnOnSyncCancellationToken = this.turnOnSyncCancellationToken = new cancellation_1.CancellationTokenSource();
            const disposable = platform_1.isWeb ? lifecycle_1.Disposable.None : this.lifecycleService.onBeforeShutdown(e => e.veto((async () => {
                const { confirmed } = await this.dialogService.confirm({
                    type: 'warning',
                    message: (0, nls_1.localize)('sync in progress', "Settings Sync is being turned on. Would you like to cancel it?"),
                    title: (0, nls_1.localize)('settings sync', "Settings Sync"),
                    primaryButton: (0, nls_1.localize)({ key: 'yes', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                    cancelButton: (0, nls_1.localize)('no', "No")
                });
                if (confirmed) {
                    turnOnSyncCancellationToken.cancel();
                }
                return !confirmed;
            })(), 'veto.settingsSync'));
            try {
                await this.doTurnOnSync(turnOnSyncCancellationToken.token);
            }
            finally {
                disposable.dispose();
                this.turnOnSyncCancellationToken = undefined;
            }
            await this.userDataAutoSyncService.turnOn();
            if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
                await this.synchroniseUserDataSyncStoreType();
            }
            this.currentAuthenticationProviderId = this.current?.authenticationProviderId;
            if (this.environmentService.options?.settingsSyncOptions?.enablementHandler && this.currentAuthenticationProviderId) {
                this.environmentService.options.settingsSyncOptions.enablementHandler(true, this.currentAuthenticationProviderId);
            }
            this.notificationService.info((0, nls_1.localize)('sync turned on', "{0} is turned on", userDataSync_2.SYNC_TITLE));
        }
        async turnoff(everywhere) {
            if (this.userDataSyncEnablementService.isEnabled()) {
                await this.userDataAutoSyncService.turnOff(everywhere);
                if (this.environmentService.options?.settingsSyncOptions?.enablementHandler && this.currentAuthenticationProviderId) {
                    this.environmentService.options.settingsSyncOptions.enablementHandler(false, this.currentAuthenticationProviderId);
                }
            }
            if (this.turnOnSyncCancellationToken) {
                this.turnOnSyncCancellationToken.cancel();
            }
        }
        async synchroniseUserDataSyncStoreType() {
            if (!this.userDataSyncAccountService.account) {
                throw new Error('Cannot update because you are signed out from settings sync. Please sign in and try again.');
            }
            if (!platform_1.isWeb || !this.userDataSyncStoreManagementService.userDataSyncStore) {
                // Not supported
                return;
            }
            const userDataSyncStoreUrl = this.userDataSyncStoreManagementService.userDataSyncStore.type === 'insiders' ? this.userDataSyncStoreManagementService.userDataSyncStore.stableUrl : this.userDataSyncStoreManagementService.userDataSyncStore.insidersUrl;
            const userDataSyncStoreClient = this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreClient, userDataSyncStoreUrl);
            userDataSyncStoreClient.setAuthToken(this.userDataSyncAccountService.account.token, this.userDataSyncAccountService.account.authenticationProviderId);
            await this.instantiationService.createInstance(globalStateSync_1.UserDataSyncStoreTypeSynchronizer, userDataSyncStoreClient).sync(this.userDataSyncStoreManagementService.userDataSyncStore.type);
        }
        syncNow() {
            return this.userDataAutoSyncService.triggerSync(['Sync Now'], false, true);
        }
        async doTurnOnSync(token) {
            const disposables = new lifecycle_1.DisposableStore();
            const manualSyncTask = await this.userDataSyncService.createManualSyncTask();
            try {
                await this.progressService.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    title: userDataSync_2.SYNC_TITLE,
                    command: userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID,
                    delay: 500,
                }, async (progress) => {
                    progress.report({ message: (0, nls_1.localize)('turning on', "Turning on...") });
                    disposables.add(this.userDataSyncService.onDidChangeStatus(status => {
                        if (status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                            progress.report({ message: (0, nls_1.localize)('resolving conflicts', "Resolving conflicts...") });
                        }
                        else {
                            progress.report({ message: (0, nls_1.localize)('syncing...', "Turning on...") });
                        }
                    }));
                    await manualSyncTask.merge();
                    if (this.userDataSyncService.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                        await this.handleConflictsWhileTurningOn(token);
                    }
                    await manualSyncTask.apply();
                });
            }
            catch (error) {
                await manualSyncTask.stop();
                throw error;
            }
            finally {
                disposables.dispose();
            }
        }
        async handleConflictsWhileTurningOn(token) {
            await this.dialogService.prompt({
                type: notification_1.Severity.Warning,
                message: (0, nls_1.localize)('conflicts detected', "Conflicts Detected"),
                detail: (0, nls_1.localize)('resolve', "Please resolve conflicts to turn on..."),
                buttons: [
                    {
                        label: (0, nls_1.localize)({ key: 'show conflicts', comment: ['&& denotes a mnemonic'] }, "&&Show Conflicts"),
                        run: async () => {
                            const waitUntilConflictsAreResolvedPromise = (0, async_1.raceCancellationError)(event_1.Event.toPromise(event_1.Event.filter(this.userDataSyncService.onDidChangeConflicts, conficts => conficts.length === 0)), token);
                            await this.showConflicts(this.userDataSyncService.conflicts[0]?.conflicts[0]);
                            await waitUntilConflictsAreResolvedPromise;
                        }
                    },
                    {
                        label: (0, nls_1.localize)({ key: 'replace local', comment: ['&& denotes a mnemonic'] }, "Replace &&Local"),
                        run: async () => this.replace(true)
                    },
                    {
                        label: (0, nls_1.localize)({ key: 'replace remote', comment: ['&& denotes a mnemonic'] }, "Replace &&Remote"),
                        run: () => this.replace(false)
                    },
                ],
                cancelButton: {
                    run: () => {
                        throw new errors_1.CancellationError();
                    }
                }
            });
        }
        async replace(local) {
            for (const conflict of this.userDataSyncService.conflicts) {
                for (const preview of conflict.conflicts) {
                    await this.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, local ? preview.remoteResource : preview.localResource, undefined, { force: true });
                }
            }
        }
        async accept(resource, conflictResource, content, apply) {
            return this.userDataSyncService.accept(resource, conflictResource, content, apply);
        }
        async showConflicts(conflictToOpen) {
            if (!this.userDataSyncService.conflicts.length) {
                return;
            }
            this.enableConflictsViewContext.set(true);
            const view = await this.viewsService.openView(userDataSync_2.SYNC_CONFLICTS_VIEW_ID);
            if (view && conflictToOpen) {
                await view.open(conflictToOpen);
            }
        }
        async resetSyncedData() {
            const { confirmed } = await this.dialogService.confirm({
                type: 'info',
                message: (0, nls_1.localize)('reset', "This will clear your data in the cloud and stop sync on all your devices."),
                title: (0, nls_1.localize)('reset title', "Clear"),
                primaryButton: (0, nls_1.localize)({ key: 'resetButton', comment: ['&& denotes a mnemonic'] }, "&&Reset"),
            });
            if (confirmed) {
                await this.userDataSyncService.resetRemote();
            }
        }
        async getAllLogResources() {
            const logsFolders = [];
            const stat = await this.fileService.resolve(this.uriIdentityService.extUri.dirname(this.environmentService.logsHome));
            if (stat.children) {
                logsFolders.push(...stat.children
                    .filter(stat => stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name))
                    .sort()
                    .reverse()
                    .map(d => d.resource));
            }
            const result = [];
            for (const logFolder of logsFolders) {
                const folderStat = await this.fileService.resolve(logFolder);
                const childStat = folderStat.children?.find(stat => this.uriIdentityService.extUri.basename(stat.resource).startsWith(`${userDataSync_1.USER_DATA_SYNC_LOG_ID}.`));
                if (childStat) {
                    result.push(childStat.resource);
                }
            }
            return result;
        }
        async showSyncActivity() {
            this.activityViewsEnablementContext.set(true);
            await this.waitForActiveSyncViews();
            await this.viewsService.openViewContainer(userDataSync_2.SYNC_VIEW_CONTAINER_ID);
        }
        async downloadSyncActivity(location) {
            await Promise.all([
                this.userDataSyncService.saveRemoteActivityData(this.uriIdentityService.extUri.joinPath(location, 'remoteActivity.json')),
                (async () => {
                    const logResources = await this.getAllLogResources();
                    await Promise.all(logResources.map(async (logResource) => this.fileService.copy(logResource, this.uriIdentityService.extUri.joinPath(location, 'logs', `${this.uriIdentityService.extUri.basename(this.uriIdentityService.extUri.dirname(logResource))}.log`))));
                })(),
                this.fileService.copy(this.environmentService.userDataSyncHome, this.uriIdentityService.extUri.joinPath(location, 'localActivity')),
            ]);
        }
        async waitForActiveSyncViews() {
            const viewContainer = this.viewDescriptorService.getViewContainerById(userDataSync_2.SYNC_VIEW_CONTAINER_ID);
            if (viewContainer) {
                const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
                if (!model.activeViewDescriptors.length) {
                    await event_1.Event.toPromise(event_1.Event.filter(model.onDidChangeActiveViewDescriptors, e => model.activeViewDescriptors.length > 0));
                }
            }
        }
        async signIn() {
            const currentAuthenticationProviderId = this.currentAuthenticationProviderId;
            const authenticationProvider = currentAuthenticationProviderId ? this.authenticationProviders.find(p => p.id === currentAuthenticationProviderId) : undefined;
            if (authenticationProvider) {
                await this.doSignIn(authenticationProvider);
            }
            else {
                await this.pick();
            }
        }
        async pick() {
            const result = await this.doPick();
            if (!result) {
                return false;
            }
            await this.doSignIn(result);
            return true;
        }
        async doPick() {
            if (this.authenticationProviders.length === 0) {
                return undefined;
            }
            const authenticationProviders = [...this.authenticationProviders].sort(({ id }) => id === this.currentAuthenticationProviderId ? -1 : 1);
            const allAccounts = new Map();
            if (authenticationProviders.length === 1) {
                const accounts = await this.getAccounts(authenticationProviders[0].id, authenticationProviders[0].scopes);
                if (accounts.length) {
                    allAccounts.set(authenticationProviders[0].id, accounts);
                }
                else {
                    // Single auth provider and no accounts
                    return authenticationProviders[0];
                }
            }
            let result;
            const disposables = new lifecycle_1.DisposableStore();
            const quickPick = disposables.add(this.quickInputService.createQuickPick());
            const promise = new Promise(c => {
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c(result);
                }));
            });
            quickPick.title = userDataSync_2.SYNC_TITLE;
            quickPick.ok = false;
            quickPick.ignoreFocusOut = true;
            quickPick.placeholder = (0, nls_1.localize)('choose account placeholder', "Select an account to sign in");
            quickPick.show();
            if (authenticationProviders.length > 1) {
                quickPick.busy = true;
                for (const { id, scopes } of authenticationProviders) {
                    const accounts = await this.getAccounts(id, scopes);
                    if (accounts.length) {
                        allAccounts.set(id, accounts);
                    }
                }
                quickPick.busy = false;
            }
            quickPick.items = this.createQuickpickItems(authenticationProviders, allAccounts);
            disposables.add(quickPick.onDidAccept(() => {
                result = quickPick.selectedItems[0]?.account ? quickPick.selectedItems[0]?.account : quickPick.selectedItems[0]?.authenticationProvider;
                quickPick.hide();
            }));
            return promise;
        }
        async getAccounts(authenticationProviderId, scopes) {
            const accounts = new Map();
            let currentAccount = null;
            const sessions = await this.authenticationService.getSessions(authenticationProviderId, scopes) || [];
            for (const session of sessions) {
                const account = new UserDataSyncAccount(authenticationProviderId, session);
                accounts.set(account.accountId, account);
                if (account.sessionId === this.currentSessionId) {
                    currentAccount = account;
                }
            }
            if (currentAccount) {
                // Always use current account if available
                accounts.set(currentAccount.accountId, currentAccount);
            }
            return currentAccount ? [...accounts.values()] : [...accounts.values()].sort(({ sessionId }) => sessionId === this.currentSessionId ? -1 : 1);
        }
        createQuickpickItems(authenticationProviders, allAccounts) {
            const quickPickItems = [];
            // Signed in Accounts
            if (allAccounts.size) {
                quickPickItems.push({ type: 'separator', label: (0, nls_1.localize)('signed in', "Signed in") });
                for (const authenticationProvider of authenticationProviders) {
                    const accounts = (allAccounts.get(authenticationProvider.id) || []).sort(({ sessionId }) => sessionId === this.currentSessionId ? -1 : 1);
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    for (const account of accounts) {
                        quickPickItems.push({
                            label: `${account.accountName} (${providerName})`,
                            description: account.sessionId === this.current?.sessionId ? (0, nls_1.localize)('last used', "Last Used with Sync") : undefined,
                            account,
                            authenticationProvider,
                        });
                    }
                }
                quickPickItems.push({ type: 'separator', label: (0, nls_1.localize)('others', "Others") });
            }
            // Account Providers
            for (const authenticationProvider of authenticationProviders) {
                if (!allAccounts.has(authenticationProvider.id) || this.authenticationService.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    quickPickItems.push({ label: (0, nls_1.localize)('sign in using account', "Sign in with {0}", providerName), authenticationProvider });
                }
            }
            return quickPickItems;
        }
        async doSignIn(accountOrAuthProvider) {
            let sessionId;
            if ((0, userDataSync_1.isAuthenticationProvider)(accountOrAuthProvider)) {
                if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.id) {
                    sessionId = await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn();
                }
                else {
                    sessionId = (await this.authenticationService.createSession(accountOrAuthProvider.id, accountOrAuthProvider.scopes)).id;
                }
            }
            else {
                if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.authenticationProviderId) {
                    sessionId = await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn();
                }
                else {
                    sessionId = accountOrAuthProvider.sessionId;
                }
            }
            this.currentSessionId = sessionId;
            await this.update();
        }
        async onDidAuthFailure() {
            this.telemetryService.publicLog2('sync/successiveAuthFailures');
            this.currentSessionId = undefined;
            await this.update('auth failure');
        }
        onDidChangeSessions(e) {
            if (this.currentSessionId && e.removed.find(session => session.id === this.currentSessionId)) {
                this.currentSessionId = undefined;
            }
            this.update('change in sessions');
        }
        onDidChangeStorage() {
            if (this.currentSessionId !== this.getStoredCachedSessionId() /* This checks if current window changed the value or not */) {
                this._cachedCurrentSessionId = null;
                this.update('change in storage');
            }
        }
        get currentAuthenticationProviderId() {
            if (this._cachedCurrentAuthenticationProviderId === null) {
                this._cachedCurrentAuthenticationProviderId = this.storageService.get(UserDataSyncWorkbenchService_1.CACHED_AUTHENTICATION_PROVIDER_KEY, -1 /* StorageScope.APPLICATION */);
            }
            return this._cachedCurrentAuthenticationProviderId;
        }
        set currentAuthenticationProviderId(currentAuthenticationProviderId) {
            if (this._cachedCurrentAuthenticationProviderId !== currentAuthenticationProviderId) {
                this._cachedCurrentAuthenticationProviderId = currentAuthenticationProviderId;
                if (currentAuthenticationProviderId === undefined) {
                    this.storageService.remove(UserDataSyncWorkbenchService_1.CACHED_AUTHENTICATION_PROVIDER_KEY, -1 /* StorageScope.APPLICATION */);
                }
                else {
                    this.storageService.store(UserDataSyncWorkbenchService_1.CACHED_AUTHENTICATION_PROVIDER_KEY, currentAuthenticationProviderId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        get currentSessionId() {
            if (this._cachedCurrentSessionId === null) {
                this._cachedCurrentSessionId = this.getStoredCachedSessionId();
            }
            return this._cachedCurrentSessionId;
        }
        set currentSessionId(cachedSessionId) {
            if (this._cachedCurrentSessionId !== cachedSessionId) {
                this._cachedCurrentSessionId = cachedSessionId;
                if (cachedSessionId === undefined) {
                    this.logService.info('Settings Sync: Reset current session');
                    this.storageService.remove(UserDataSyncWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                }
                else {
                    this.logService.info('Settings Sync: Updated current session', cachedSessionId);
                    this.storageService.store(UserDataSyncWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, cachedSessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        getStoredCachedSessionId() {
            return this.storageService.get(UserDataSyncWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
        }
        get useWorkbenchSessionId() {
            return !this.storageService.getBoolean(UserDataSyncWorkbenchService_1.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
        }
        set useWorkbenchSessionId(useWorkbenchSession) {
            this.storageService.store(UserDataSyncWorkbenchService_1.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, !useWorkbenchSession, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    };
    exports.UserDataSyncWorkbenchService = UserDataSyncWorkbenchService;
    exports.UserDataSyncWorkbenchService = UserDataSyncWorkbenchService = UserDataSyncWorkbenchService_1 = __decorate([
        __param(0, userDataSync_1.IUserDataSyncService),
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, authentication_1.IAuthenticationService),
        __param(3, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, storage_1.IStorageService),
        __param(6, userDataSync_1.IUserDataSyncEnablementService),
        __param(7, userDataSync_1.IUserDataAutoSyncService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, log_1.ILogService),
        __param(10, productService_1.IProductService),
        __param(11, extensions_2.IExtensionService),
        __param(12, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(13, secrets_1.ISecretStorageService),
        __param(14, notification_1.INotificationService),
        __param(15, progress_1.IProgressService),
        __param(16, dialogs_1.IDialogService),
        __param(17, contextkey_1.IContextKeyService),
        __param(18, views_1.IViewsService),
        __param(19, views_1.IViewDescriptorService),
        __param(20, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(21, lifecycle_2.ILifecycleService),
        __param(22, instantiation_1.IInstantiationService),
        __param(23, editorService_1.IEditorService),
        __param(24, userDataInit_1.IUserDataInitializationService),
        __param(25, files_1.IFileService)
    ], UserDataSyncWorkbenchService);
    (0, extensions_1.registerSingleton)(userDataSync_2.IUserDataSyncWorkbenchService, UserDataSyncWorkbenchService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jV29ya2JlbmNoU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVN5bmMvYnJvd3Nlci91c2VyRGF0YVN5bmNXb3JrYmVuY2hTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5Q2hHLE1BQU0sbUJBQW1CO1FBRXhCLFlBQXFCLHdCQUFnQyxFQUFtQixPQUE4QjtZQUFqRiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQVE7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7UUFBSSxDQUFDO1FBRTNHLElBQUksU0FBUyxLQUFhLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksV0FBVyxLQUFhLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLFNBQVMsS0FBYSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0QsSUFBSSxLQUFLLEtBQWEsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7S0FDaEY7SUFHRCxTQUFnQixrQkFBa0IsQ0FBQyxNQUFlO1FBQ2pELE1BQU0sU0FBUyxHQUFHLE1BQTBCLENBQUM7UUFDN0MsT0FBTyxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzdJLENBQUM7SUFIRCxnREFHQztJQUVNLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7O2lCQUk1Qyw0Q0FBdUMsR0FBRyw4Q0FBOEMsQUFBakQsQ0FBa0Q7aUJBQ3pGLHVDQUFrQyxHQUFHLDZCQUE2QixBQUFoQyxDQUFpQztpQkFDbkUsK0JBQTBCLEdBQUcsK0JBQStCLEFBQWxDLENBQW1DO1FBRTVFLElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFHckYsSUFBSSx1QkFBdUIsS0FBSyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7UUFHdkUsSUFBSSxhQUFhLEtBQW9CLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFLbEUsSUFBSSxPQUFPLEtBQXNDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFXeEUsWUFDdUIsbUJBQTBELEVBQzNELGtCQUF3RCxFQUNyRCxxQkFBOEQsRUFDekQsMEJBQXdFLEVBQ2pGLGlCQUFzRCxFQUN6RCxjQUFnRCxFQUNqQyw2QkFBOEUsRUFDcEYsdUJBQWtFLEVBQ3pFLGdCQUFvRCxFQUMxRCxVQUF3QyxFQUNwQyxjQUFnRCxFQUM5QyxnQkFBb0QsRUFDbEMsa0JBQXdFLEVBQ3RGLG9CQUE0RCxFQUM3RCxtQkFBMEQsRUFDOUQsZUFBa0QsRUFDcEQsYUFBOEMsRUFDMUMsaUJBQXFDLEVBQzFDLFlBQTRDLEVBQ25DLHFCQUE4RCxFQUNqRCxrQ0FBd0YsRUFDMUcsZ0JBQW9ELEVBQ2hELG9CQUE0RCxFQUNuRSxhQUE4QyxFQUM5Qiw2QkFBOEUsRUFDaEcsV0FBMEM7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUEzQitCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDMUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNwQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ3hDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDaEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDaEIsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUNuRSw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3hELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNuQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNqQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFDO1lBQ3JFLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM3QyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBRTlCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ2xCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDaEMsdUNBQWtDLEdBQWxDLGtDQUFrQyxDQUFxQztZQUN6RixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbEQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2Isa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUMvRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQTlDakQsNkJBQXdCLEdBQThCLEVBQUUsQ0FBQztZQUd6RCxtQkFBYyxpREFBNEM7WUFFakQsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBaUIsQ0FBQyxDQUFDO1lBQ2pGLDZCQUF3QixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7WUFZakUsZ0NBQTJCLEdBQXdDLFNBQVMsQ0FBQztZQWtrQjdFLDJDQUFzQyxHQUE4QixJQUFJLENBQUM7WUFtQnpFLDRCQUF1QixHQUE4QixJQUFJLENBQUM7WUF0akJqRSxJQUFJLENBQUMscUJBQXFCLEdBQUcsc0NBQXVCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlDQUFrQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBcUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsOEJBQThCLEdBQUcsNENBQTZCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLFlBQVksR0FBRyxvQ0FBcUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsMEJBQTBCLEdBQUcsaURBQWtDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFL0YsSUFBSSxJQUFJLENBQUMsa0NBQWtDLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV4SCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUN6QjtRQUNGLENBQUM7UUFFTyw2QkFBNkI7WUFDcEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGlCQUFpQixFQUFFLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbE8sQ0FBQztRQUVPLG1DQUFtQyxDQUFDLHdCQUFnQztZQUMzRSxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssd0JBQXdCLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRU8sS0FBSyxDQUFDLGlCQUFpQjtZQUM5QixVQUFVO1lBQ1YsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxFQUFFLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhKLGdCQUFnQjtZQUNoQixJQUFJO2dCQUNILE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3hCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsOERBQThEO2dCQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHlCQUF5QixFQUFFO29CQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7YUFDRDtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsVUFBVTtZQUN2QixJQUFJLGdCQUFLLEVBQUU7Z0JBQ1YsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUEsMkRBQW1DLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDeEgsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxJQUFJLHFCQUFxQixFQUFFLEVBQUUsRUFBRTtvQkFDckUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFO3dCQUNoSixJQUFJLENBQUMsZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsRUFBRSxDQUFDO3FCQUNqRDtvQkFFRCx5QkFBeUI7eUJBQ3BCLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO3dCQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsRUFBRSxDQUFDO3FCQUNqRDtvQkFDRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO2lCQUNuQzthQUNEO1lBRUQsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsNEJBQTRCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXBILElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FDMUIsYUFBSyxDQUFDLEdBQUcsQ0FDUixJQUFJLENBQUMscUJBQXFCLENBQUMsbUNBQW1DLEVBQzlELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxxQ0FBcUMsQ0FDaEUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXJGLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxTCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLG9DQUEyQiw4QkFBNEIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaE4sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3hFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO29CQUN0QixJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3hDO2dCQUNELHdDQUF3QztnQkFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN6QyxNQUFNLGNBQWMsR0FBRyxJQUFBLDBCQUFpQixFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ3JJLElBQUksY0FBYyxFQUFFLE1BQU0sS0FBSyxvQ0FBcUIsRUFBRTt3QkFDckQsT0FBTyxLQUFLLENBQUM7cUJBQ2I7b0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0TCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBZTtZQUVuQyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUNqRTtZQUVELElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQixJQUFJLENBQUMsK0JBQStCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQzthQUM5RTtZQUVELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQywyQ0FBeUIsQ0FBQyw4Q0FBMEIsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFFTyxLQUFLLENBQUMsb0JBQW9CO1lBQ2pDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1lBQy9DLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDO1lBQzdFLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3JCLE1BQU0sdUJBQXVCLEdBQUcsK0JBQStCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssK0JBQStCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO2dCQUN6TCxLQUFLLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksdUJBQXVCLEVBQUU7b0JBQ3JELE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbEYsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7d0JBQy9CLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxnQkFBZ0IsRUFBRTs0QkFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzs0QkFDckQsT0FBTzt5QkFDUDtxQkFDRDtpQkFDRDthQUNEO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDM0IsQ0FBQztRQUVPLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBd0M7WUFDakUsSUFBSSxLQUFLLEdBQW9FLFNBQVMsQ0FBQztZQUN2RixJQUFJLE9BQU8sRUFBRTtnQkFDWixJQUFJO29CQUNILElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDaEcsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsOENBQThDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMzRixLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUM7aUJBQzlFO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNEO1lBQ0QsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxhQUE0QjtZQUN2RCxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssYUFBYSxFQUFFO2dCQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsUUFBUSxPQUFPLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBRXBHLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ25EO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUsNEZBQTRGLENBQUMsQ0FBQyxDQUFDO2FBQ3ZKO1lBQ0QsSUFBSSxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQ25ELE9BQU87YUFDUDtZQUNELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0saUNBQW9CLEVBQUU7Z0JBQ3hELE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQzthQUNyRDtZQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osTUFBTSxJQUFJLDBCQUFpQixFQUFFLENBQUM7YUFDOUI7WUFFRCwrQ0FBK0M7WUFDL0MsSUFBSSxJQUFJLENBQUMsYUFBYSw4Q0FBNEIsRUFBRTtnQkFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO2FBQ2hFO1lBRUQsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBQ3JHLE1BQU0sVUFBVSxHQUFHLGdCQUFLLENBQUMsQ0FBQyxDQUFDLHNCQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNHLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO29CQUN0RCxJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsZ0VBQWdFLENBQUM7b0JBQ3ZHLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsZUFBZSxDQUFDO29CQUNqRCxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUM7b0JBQ3BGLFlBQVksRUFBRSxJQUFBLGNBQVEsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO2lCQUNsQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxTQUFTLEVBQUU7b0JBQ2QsMkJBQTJCLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ3JDO2dCQUNELE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDbkIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSTtnQkFDSCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0Q7b0JBQVM7Z0JBQ1QsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixJQUFJLENBQUMsMkJBQTJCLEdBQUcsU0FBUyxDQUFDO2FBQzdDO1lBQ0QsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFNUMsSUFBSSxJQUFJLENBQUMsa0NBQWtDLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO2dCQUN6RSxNQUFNLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO2FBQzlDO1lBRUQsSUFBSSxDQUFDLCtCQUErQixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsd0JBQXdCLENBQUM7WUFDOUUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixJQUFJLElBQUksQ0FBQywrQkFBK0IsRUFBRTtnQkFDcEgsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7YUFDbEg7WUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLHlCQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQW1CO1lBQ2hDLElBQUksSUFBSSxDQUFDLDZCQUE2QixDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsK0JBQStCLEVBQUU7b0JBQ3BILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2lCQUNuSDthQUNEO1lBQ0QsSUFBSSxJQUFJLENBQUMsMkJBQTJCLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUMxQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsZ0NBQWdDO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFO2dCQUM3QyxNQUFNLElBQUksS0FBSyxDQUFDLDRGQUE0RixDQUFDLENBQUM7YUFDOUc7WUFDRCxJQUFJLENBQUMsZ0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDekUsZ0JBQWdCO2dCQUNoQixPQUFPO2FBQ1A7WUFFRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDO1lBQ3pQLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxrREFBdUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3hILHVCQUF1QixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDdEosTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1EQUFpQyxFQUFFLHVCQUF1QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqTCxDQUFDO1FBRUQsT0FBTztZQUNOLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUF3QjtZQUNsRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzdFLElBQUk7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQztvQkFDdkMsUUFBUSxrQ0FBeUI7b0JBQ2pDLEtBQUssRUFBRSx5QkFBVTtvQkFDakIsT0FBTyxFQUFFLHVDQUF3QjtvQkFDakMsS0FBSyxFQUFFLEdBQUc7aUJBQ1YsRUFBRSxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUU7b0JBQ25CLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ25FLElBQUksTUFBTSxpREFBNEIsRUFBRTs0QkFDdkMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDeEY7NkJBQU07NEJBQ04sUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUN0RTtvQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNKLE1BQU0sY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUM3QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLGlEQUE0QixFQUFFO3dCQUNoRSxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDaEQ7b0JBQ0QsTUFBTSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxLQUFLLENBQUM7YUFDWjtvQkFBUztnQkFDVCxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDdEI7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLDZCQUE2QixDQUFDLEtBQXdCO1lBQ25FLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLElBQUksRUFBRSx1QkFBUSxDQUFDLE9BQU87Z0JBQ3RCLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQztnQkFDN0QsTUFBTSxFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSx3Q0FBd0MsQ0FBQztnQkFDckUsT0FBTyxFQUFFO29CQUNSO3dCQUNDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLENBQUM7d0JBQ2xHLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTs0QkFDZixNQUFNLG9DQUFvQyxHQUFHLElBQUEsNkJBQXFCLEVBQUMsYUFBSyxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFDM0wsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzlFLE1BQU0sb0NBQW9DLENBQUM7d0JBQzVDLENBQUM7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUM7d0JBQ2hHLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO3FCQUNuQztvQkFDRDt3QkFDQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGtCQUFrQixDQUFDO3dCQUNsRyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7cUJBQzlCO2lCQUNEO2dCQUNELFlBQVksRUFBRTtvQkFDYixHQUFHLEVBQUUsR0FBRyxFQUFFO3dCQUNULE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO29CQUMvQixDQUFDO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBYztZQUNuQyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQzFELEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtvQkFDekMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQzFLO2FBQ0Q7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUErQixFQUFFLGdCQUFxQixFQUFFLE9BQWtDLEVBQUUsS0FBbUM7WUFDM0ksT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBaUM7WUFDcEQsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUMvQyxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQTZCLHFDQUFzQixDQUFDLENBQUM7WUFDbEcsSUFBSSxJQUFJLElBQUksY0FBYyxFQUFFO2dCQUMzQixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDaEM7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWU7WUFDcEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RELElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsMkVBQTJFLENBQUM7Z0JBQ3ZHLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsT0FBTyxDQUFDO2dCQUN2QyxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUM7YUFDOUYsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDN0M7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLGtCQUFrQjtZQUN2QixNQUFNLFdBQVcsR0FBVSxFQUFFLENBQUM7WUFDOUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0SCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUTtxQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDbkUsSUFBSSxFQUFFO3FCQUNOLE9BQU8sRUFBRTtxQkFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUN4QjtZQUNELE1BQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQztZQUN6QixLQUFLLE1BQU0sU0FBUyxJQUFJLFdBQVcsRUFBRTtnQkFDcEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsb0NBQXFCLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BKLElBQUksU0FBUyxFQUFFO29CQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNoQzthQUNEO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsS0FBSyxDQUFDLGdCQUFnQjtZQUNyQixJQUFJLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDcEMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLHFDQUFzQixDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxRQUFhO1lBQ3ZDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDakIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN6SCxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNYLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQ3JELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxXQUFXLEVBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hRLENBQUMsQ0FBQyxFQUFFO2dCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDbkksQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLEtBQUssQ0FBQyxzQkFBc0I7WUFDbkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLHFDQUFzQixDQUFDLENBQUM7WUFDOUYsSUFBSSxhQUFhLEVBQUU7Z0JBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUU7b0JBQ3hDLE1BQU0sYUFBSyxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekg7YUFDRDtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsTUFBTTtZQUNYLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDO1lBQzdFLE1BQU0sc0JBQXNCLEdBQUcsK0JBQStCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM5SixJQUFJLHNCQUFzQixFQUFFO2dCQUMzQixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUM1QztpQkFBTTtnQkFDTixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNsQjtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsSUFBSTtZQUNqQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU8sS0FBSyxDQUFDLE1BQU07WUFDbkIsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDOUMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekksTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFFN0QsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6QyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7b0JBQ3BCLFdBQVcsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUN6RDtxQkFBTTtvQkFDTix1Q0FBdUM7b0JBQ3ZDLE9BQU8sdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2xDO2FBQ0Q7WUFFRCxJQUFJLE1BQWlFLENBQUM7WUFDdEUsTUFBTSxXQUFXLEdBQW9CLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzNELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBd0IsQ0FBQyxDQUFDO1lBRWxHLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUE0RCxDQUFDLENBQUMsRUFBRTtnQkFDMUYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDeEMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsU0FBUyxDQUFDLEtBQUssR0FBRyx5QkFBVSxDQUFDO1lBQzdCLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsOEJBQThCLENBQUMsQ0FBQztZQUMvRixTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFakIsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDdEIsS0FBSyxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLHVCQUF1QixFQUFFO29CQUNyRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNwRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0JBQ3BCLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUM5QjtpQkFDRDtnQkFDRCxTQUFTLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQzthQUN2QjtZQUVELFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2xGLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFDLE1BQU0sR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsc0JBQXNCLENBQUM7Z0JBQ3hJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVPLEtBQUssQ0FBQyxXQUFXLENBQUMsd0JBQWdDLEVBQUUsTUFBZ0I7WUFDM0UsTUFBTSxRQUFRLEdBQXFDLElBQUksR0FBRyxFQUErQixDQUFDO1lBQzFGLElBQUksY0FBYyxHQUErQixJQUFJLENBQUM7WUFFdEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0RyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtnQkFDL0IsTUFBTSxPQUFPLEdBQXdCLElBQUksbUJBQW1CLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2hHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDekMsSUFBSSxPQUFPLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDaEQsY0FBYyxHQUFHLE9BQU8sQ0FBQztpQkFDekI7YUFDRDtZQUVELElBQUksY0FBYyxFQUFFO2dCQUNuQiwwQ0FBMEM7Z0JBQzFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0ksQ0FBQztRQUVPLG9CQUFvQixDQUFDLHVCQUFrRCxFQUFFLFdBQStDO1lBQy9ILE1BQU0sY0FBYyxHQUFtRCxFQUFFLENBQUM7WUFFMUUscUJBQXFCO1lBQ3JCLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtnQkFDckIsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RGLEtBQUssTUFBTSxzQkFBc0IsSUFBSSx1QkFBdUIsRUFBRTtvQkFDN0QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUksTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEYsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7d0JBQy9CLGNBQWMsQ0FBQyxJQUFJLENBQUM7NEJBQ25CLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEtBQUssWUFBWSxHQUFHOzRCQUNqRCxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7NEJBQ3JILE9BQU87NEJBQ1Asc0JBQXNCO3lCQUN0QixDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7Z0JBQ0QsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDaEY7WUFFRCxvQkFBb0I7WUFDcEIsS0FBSyxNQUFNLHNCQUFzQixJQUFJLHVCQUF1QixFQUFFO2dCQUM3RCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ2xJLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BGLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO2lCQUM1SDthQUNEO1lBRUQsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVPLEtBQUssQ0FBQyxRQUFRLENBQUMscUJBQW9FO1lBQzFGLElBQUksU0FBaUIsQ0FBQztZQUN0QixJQUFJLElBQUEsdUNBQXdCLEVBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xILFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxFQUFFLENBQUM7aUJBQ3pHO3FCQUFNO29CQUNOLFNBQVMsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7aUJBQ3hIO2FBQ0Q7aUJBQU07Z0JBQ04sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQyx3QkFBd0IsRUFBRTtvQkFDeEksU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLEVBQUUsQ0FBQztpQkFDekc7cUJBQU07b0JBQ04sU0FBUyxHQUFHLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztpQkFDNUM7YUFDRDtZQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7WUFDbEMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0I7WUFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBNEcsNkJBQTZCLENBQUMsQ0FBQztZQUMzSyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRU8sbUJBQW1CLENBQUMsQ0FBb0M7WUFDL0QsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUM3RixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO2FBQ2xDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsNERBQTRELEVBQUU7Z0JBQzNILElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUNqQztRQUNGLENBQUM7UUFHRCxJQUFZLCtCQUErQjtZQUMxQyxJQUFJLElBQUksQ0FBQyxzQ0FBc0MsS0FBSyxJQUFJLEVBQUU7Z0JBQ3pELElBQUksQ0FBQyxzQ0FBc0MsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyw4QkFBNEIsQ0FBQyxrQ0FBa0Msb0NBQTJCLENBQUM7YUFDaks7WUFDRCxPQUFPLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQztRQUNwRCxDQUFDO1FBRUQsSUFBWSwrQkFBK0IsQ0FBQywrQkFBbUQ7WUFDOUYsSUFBSSxJQUFJLENBQUMsc0NBQXNDLEtBQUssK0JBQStCLEVBQUU7Z0JBQ3BGLElBQUksQ0FBQyxzQ0FBc0MsR0FBRywrQkFBK0IsQ0FBQztnQkFDOUUsSUFBSSwrQkFBK0IsS0FBSyxTQUFTLEVBQUU7b0JBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLDhCQUE0QixDQUFDLGtDQUFrQyxvQ0FBMkIsQ0FBQztpQkFDdEg7cUJBQU07b0JBQ04sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsOEJBQTRCLENBQUMsa0NBQWtDLEVBQUUsK0JBQStCLG1FQUFrRCxDQUFDO2lCQUM3SzthQUNEO1FBQ0YsQ0FBQztRQUdELElBQVksZ0JBQWdCO1lBQzNCLElBQUksSUFBSSxDQUFDLHVCQUF1QixLQUFLLElBQUksRUFBRTtnQkFDMUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQy9EO1lBQ0QsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUM7UUFDckMsQ0FBQztRQUVELElBQVksZ0JBQWdCLENBQUMsZUFBbUM7WUFDL0QsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEtBQUssZUFBZSxFQUFFO2dCQUNyRCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsZUFBZSxDQUFDO2dCQUMvQyxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQzdELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLDhCQUE0QixDQUFDLDBCQUEwQixvQ0FBMkIsQ0FBQztpQkFDOUc7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsd0NBQXdDLEVBQUUsZUFBZSxDQUFDLENBQUM7b0JBQ2hGLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLDhCQUE0QixDQUFDLDBCQUEwQixFQUFFLGVBQWUsbUVBQWtELENBQUM7aUJBQ3JKO2FBQ0Q7UUFDRixDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsOEJBQTRCLENBQUMsMEJBQTBCLG9DQUEyQixDQUFDO1FBQ25ILENBQUM7UUFFRCxJQUFZLHFCQUFxQjtZQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsOEJBQTRCLENBQUMsdUNBQXVDLHFDQUE0QixLQUFLLENBQUMsQ0FBQztRQUMvSSxDQUFDO1FBRUQsSUFBWSxxQkFBcUIsQ0FBQyxtQkFBNEI7WUFDN0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsOEJBQTRCLENBQUMsdUNBQXVDLEVBQUUsQ0FBQyxtQkFBbUIsbUVBQWtELENBQUM7UUFDeEssQ0FBQzs7SUFocEJXLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBK0J0QyxXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSx1Q0FBc0IsQ0FBQTtRQUN0QixXQUFBLGlEQUEyQixDQUFBO1FBQzNCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSw2Q0FBOEIsQ0FBQTtRQUM5QixXQUFBLHVDQUF3QixDQUFBO1FBQ3hCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsWUFBQSxnQ0FBZSxDQUFBO1FBQ2YsWUFBQSw4QkFBaUIsQ0FBQTtRQUNqQixZQUFBLHdEQUFtQyxDQUFBO1FBQ25DLFlBQUEsK0JBQXFCLENBQUE7UUFDckIsWUFBQSxtQ0FBb0IsQ0FBQTtRQUNwQixZQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFlBQUEsd0JBQWMsQ0FBQTtRQUNkLFlBQUEsK0JBQWtCLENBQUE7UUFDbEIsWUFBQSxxQkFBYSxDQUFBO1FBQ2IsWUFBQSw4QkFBc0IsQ0FBQTtRQUN0QixZQUFBLGtEQUFtQyxDQUFBO1FBQ25DLFlBQUEsNkJBQWlCLENBQUE7UUFDakIsWUFBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLDhCQUFjLENBQUE7UUFDZCxZQUFBLDZDQUE4QixDQUFBO1FBQzlCLFlBQUEsb0JBQVksQ0FBQTtPQXhERiw0QkFBNEIsQ0FrcEJ4QztJQUVELElBQUEsOEJBQWlCLEVBQUMsNENBQTZCLEVBQUUsNEJBQTRCLGtDQUFvRixDQUFDIn0=