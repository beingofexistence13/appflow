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
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/extensions/common/extensions", "vs/nls!vs/workbench/services/userDataSync/browser/userDataSyncWorkbenchService", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/contextkey/common/contextkey", "vs/platform/progress/common/progress", "vs/base/common/uri", "vs/workbench/common/views", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/globalStateSync", "vs/base/common/errors", "vs/base/common/async", "vs/base/common/cancellation", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/secrets/common/secrets", "vs/platform/files/common/files"], function (require, exports, userDataSync_1, telemetry_1, extensions_1, userDataSync_2, lifecycle_1, event_1, authenticationService_1, authentication_1, userDataSyncAccount_1, quickInput_1, storage_1, log_1, productService_1, extensions_2, nls_1, notification_1, dialogs_1, contextkey_1, progress_1, uri_1, views_1, lifecycle_2, platform_1, instantiation_1, userDataSyncStoreService_1, globalStateSync_1, errors_1, async_1, cancellation_1, editorService_1, uriIdentity_1, editor_1, environmentService_1, userDataInit_1, secrets_1, files_1) {
    "use strict";
    var $gBb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gBb = exports.$fBb = void 0;
    class UserDataSyncAccount {
        constructor(authenticationProviderId, a) {
            this.authenticationProviderId = authenticationProviderId;
            this.a = a;
        }
        get sessionId() { return this.a.id; }
        get accountName() { return this.a.account.label; }
        get accountId() { return this.a.account.id; }
        get token() { return this.a.idToken || this.a.accessToken; }
    }
    function $fBb(editor) {
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.base) && uri_1.URI.isUri(candidate?.input1?.uri) && uri_1.URI.isUri(candidate?.input2?.uri) && uri_1.URI.isUri(candidate?.result);
    }
    exports.$fBb = $fBb;
    let $gBb = class $gBb extends lifecycle_1.$kc {
        static { $gBb_1 = this; }
        static { this.a = 'userDataSyncAccount.donotUseWorkbenchSession'; }
        static { this.b = 'userDataSyncAccountProvider'; }
        static { this.f = 'userDataSyncAccountPreference'; }
        get enabled() { return !!this.Y.userDataSyncStore; }
        get authenticationProviders() { return this.g; }
        get accountStatus() { return this.h; }
        get current() { return this.m; }
        constructor(z, C, D, F, G, H, I, J, L, M, N, O, P, Q, R, S, U, contextKeyService, W, X, Y, Z, $, ab, bb, cb) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.g = [];
            this.h = "unavailable" /* AccountStatus.Unavailable */;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeAccountStatus = this.j.event;
            this.y = undefined;
            this.xb = null;
            this.zb = null;
            this.n = userDataSync_2.$QAb.bindTo(contextKeyService);
            this.r = userDataSync_2.$PAb.bindTo(contextKeyService);
            this.s = userDataSync_2.$RAb.bindTo(contextKeyService);
            this.w = userDataSync_2.$SAb.bindTo(contextKeyService);
            this.u = userDataSync_2.$UAb.bindTo(contextKeyService);
            this.t = userDataSync_2.$TAb.bindTo(contextKeyService);
            if (this.Y.userDataSyncStore) {
                this.r.set(this.z.status);
                this.B(z.onDidChangeStatus(status => this.r.set(status)));
                this.n.set(I.isEnabled());
                this.B(I.onDidChangeEnablement(enabled => this.n.set(enabled)));
                this.fb();
            }
        }
        db() {
            this.g = (this.Y.userDataSyncStore?.authenticationProviders || []).filter(({ id }) => this.D.declaredProviders.some(provider => provider.id === id));
        }
        eb(authenticationProviderId) {
            return this.authenticationProviders.some(({ id }) => id === authenticationProviderId);
        }
        async fb() {
            /* wait */
            await Promise.all([this.O.whenInstalledExtensionsRegistered(), this.bb.whenInitializationFinished()]);
            /* initialize */
            try {
                await this.gb();
            }
            catch (error) {
                // Do not log if the current window is running extension tests
                if (!this.P.extensionTestsLocationURI) {
                    this.M.error(error);
                }
            }
        }
        async gb() {
            if (platform_1.$o) {
                const authenticationSession = await (0, authenticationService_1.$QV)(this.Q, this.N);
                if (this.Ab === undefined && authenticationSession?.id) {
                    if (this.P.options?.settingsSyncOptions?.authenticationProvider && this.P.options.settingsSyncOptions.enabled) {
                        this.Ab = authenticationSession.id;
                    }
                    // Backward compatibility
                    else if (this.Cb) {
                        this.Ab = authenticationSession.id;
                    }
                    this.Cb = false;
                }
            }
            await this.hb();
            this.B(this.D.onDidChangeDeclaredProviders(() => this.db()));
            this.B(event_1.Event.filter(event_1.Event.any(this.D.onDidRegisterAuthenticationProvider, this.D.onDidUnregisterAuthenticationProvider), info => this.eb(info.id))(() => this.hb()));
            this.B(event_1.Event.filter(this.F.onTokenFailed, isSuccessive => !isSuccessive)(() => this.hb('token failure')));
            this.B(event_1.Event.filter(this.D.onDidChangeSessions, e => this.eb(e.providerId))(({ event }) => this.vb(event)));
            this.B(this.H.onDidChangeValue(-1 /* StorageScope.APPLICATION */, $gBb_1.f, this.B(new lifecycle_1.$jc()))(() => this.wb()));
            this.B(event_1.Event.filter(this.F.onTokenFailed, bailout => bailout)(() => this.ub()));
            this.u.set(this.z.conflicts.length > 0);
            this.B(this.z.onDidChangeConflicts(conflicts => {
                this.u.set(conflicts.length > 0);
                if (!conflicts.length) {
                    this.t.reset();
                }
                // Close merge editors with no conflicts
                this.ab.editors.filter(input => {
                    const remoteResource = (0, editor_1.$WE)(input) ? input.original.resource : $fBb(input) ? input.input1.uri : undefined;
                    if (remoteResource?.scheme !== userDataSync_1.$Wgb) {
                        return false;
                    }
                    return !this.z.conflicts.some(({ conflicts }) => conflicts.some(({ previewResource }) => this.C.extUri.isEqual(previewResource, input.resource)));
                }).forEach(input => input.dispose());
            }));
        }
        async hb(reason) {
            if (reason) {
                this.M.info(`Settings Sync: Updating due to ${reason}`);
            }
            this.db();
            await this.ib();
            if (this.m) {
                this.yb = this.m.authenticationProviderId;
            }
            await this.jb(this.m);
            this.kb(this.m ? "available" /* AccountStatus.Available */ : "unavailable" /* AccountStatus.Unavailable */);
        }
        async ib() {
            const currentSessionId = this.Ab;
            const currentAuthenticationProviderId = this.yb;
            if (currentSessionId) {
                const authenticationProviders = currentAuthenticationProviderId ? this.authenticationProviders.filter(({ id }) => id === currentAuthenticationProviderId) : this.authenticationProviders;
                for (const { id, scopes } of authenticationProviders) {
                    const sessions = (await this.D.getSessions(id, scopes)) || [];
                    for (const session of sessions) {
                        if (session.id === currentSessionId) {
                            this.m = new UserDataSyncAccount(id, session);
                            return;
                        }
                    }
                }
            }
            this.m = undefined;
        }
        async jb(current) {
            let value = undefined;
            if (current) {
                try {
                    this.M.trace('Settings Sync: Updating the token for the account', current.accountName);
                    const token = current.token;
                    this.M.trace('Settings Sync: Token updated for the account', current.accountName);
                    value = { token, authenticationProviderId: current.authenticationProviderId };
                }
                catch (e) {
                    this.M.error(e);
                }
            }
            await this.F.updateAccount(value);
        }
        kb(accountStatus) {
            if (this.h !== accountStatus) {
                const previous = this.h;
                this.M.trace(`Settings Sync: Account status changed from ${previous} to ${accountStatus}`);
                this.h = accountStatus;
                this.s.set(accountStatus);
                this.j.fire(accountStatus);
            }
        }
        async turnOn() {
            if (!this.authenticationProviders.length) {
                throw new Error((0, nls_1.localize)(0, null));
            }
            if (this.I.isEnabled()) {
                return;
            }
            if (this.z.status !== "idle" /* SyncStatus.Idle */) {
                throw new Error('Cannot turn on sync while syncing');
            }
            const picked = await this.pb();
            if (!picked) {
                throw new errors_1.$3();
            }
            // User did not pick an account or login failed
            if (this.accountStatus !== "available" /* AccountStatus.Available */) {
                throw new Error((0, nls_1.localize)(1, null));
            }
            const turnOnSyncCancellationToken = this.y = new cancellation_1.$pd();
            const disposable = platform_1.$o ? lifecycle_1.$kc.None : this.Z.onBeforeShutdown(e => e.veto((async () => {
                const { confirmed } = await this.U.confirm({
                    type: 'warning',
                    message: (0, nls_1.localize)(2, null),
                    title: (0, nls_1.localize)(3, null),
                    primaryButton: (0, nls_1.localize)(4, null),
                    cancelButton: (0, nls_1.localize)(5, null)
                });
                if (confirmed) {
                    turnOnSyncCancellationToken.cancel();
                }
                return !confirmed;
            })(), 'veto.settingsSync'));
            try {
                await this.lb(turnOnSyncCancellationToken.token);
            }
            finally {
                disposable.dispose();
                this.y = undefined;
            }
            await this.J.turnOn();
            if (this.Y.userDataSyncStore?.canSwitch) {
                await this.synchroniseUserDataSyncStoreType();
            }
            this.yb = this.current?.authenticationProviderId;
            if (this.P.options?.settingsSyncOptions?.enablementHandler && this.yb) {
                this.P.options.settingsSyncOptions.enablementHandler(true, this.yb);
            }
            this.R.info((0, nls_1.localize)(6, null, userDataSync_2.$NAb));
        }
        async turnoff(everywhere) {
            if (this.I.isEnabled()) {
                await this.J.turnOff(everywhere);
                if (this.P.options?.settingsSyncOptions?.enablementHandler && this.yb) {
                    this.P.options.settingsSyncOptions.enablementHandler(false, this.yb);
                }
            }
            if (this.y) {
                this.y.cancel();
            }
        }
        async synchroniseUserDataSyncStoreType() {
            if (!this.F.account) {
                throw new Error('Cannot update because you are signed out from settings sync. Please sign in and try again.');
            }
            if (!platform_1.$o || !this.Y.userDataSyncStore) {
                // Not supported
                return;
            }
            const userDataSyncStoreUrl = this.Y.userDataSyncStore.type === 'insiders' ? this.Y.userDataSyncStore.stableUrl : this.Y.userDataSyncStore.insidersUrl;
            const userDataSyncStoreClient = this.$.createInstance(userDataSyncStoreService_1.$2Ab, userDataSyncStoreUrl);
            userDataSyncStoreClient.setAuthToken(this.F.account.token, this.F.account.authenticationProviderId);
            await this.$.createInstance(globalStateSync_1.$eBb, userDataSyncStoreClient).sync(this.Y.userDataSyncStore.type);
        }
        syncNow() {
            return this.J.triggerSync(['Sync Now'], false, true);
        }
        async lb(token) {
            const disposables = new lifecycle_1.$jc();
            const manualSyncTask = await this.z.createManualSyncTask();
            try {
                await this.S.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    title: userDataSync_2.$NAb,
                    command: userDataSync_2.$WAb,
                    delay: 500,
                }, async (progress) => {
                    progress.report({ message: (0, nls_1.localize)(7, null) });
                    disposables.add(this.z.onDidChangeStatus(status => {
                        if (status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                            progress.report({ message: (0, nls_1.localize)(8, null) });
                        }
                        else {
                            progress.report({ message: (0, nls_1.localize)(9, null) });
                        }
                    }));
                    await manualSyncTask.merge();
                    if (this.z.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                        await this.mb(token);
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
        async mb(token) {
            await this.U.prompt({
                type: notification_1.Severity.Warning,
                message: (0, nls_1.localize)(10, null),
                detail: (0, nls_1.localize)(11, null),
                buttons: [
                    {
                        label: (0, nls_1.localize)(12, null),
                        run: async () => {
                            const waitUntilConflictsAreResolvedPromise = (0, async_1.$wg)(event_1.Event.toPromise(event_1.Event.filter(this.z.onDidChangeConflicts, conficts => conficts.length === 0)), token);
                            await this.showConflicts(this.z.conflicts[0]?.conflicts[0]);
                            await waitUntilConflictsAreResolvedPromise;
                        }
                    },
                    {
                        label: (0, nls_1.localize)(13, null),
                        run: async () => this.nb(true)
                    },
                    {
                        label: (0, nls_1.localize)(14, null),
                        run: () => this.nb(false)
                    },
                ],
                cancelButton: {
                    run: () => {
                        throw new errors_1.$3();
                    }
                }
            });
        }
        async nb(local) {
            for (const conflict of this.z.conflicts) {
                for (const preview of conflict.conflicts) {
                    await this.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, local ? preview.remoteResource : preview.localResource, undefined, { force: true });
                }
            }
        }
        async accept(resource, conflictResource, content, apply) {
            return this.z.accept(resource, conflictResource, content, apply);
        }
        async showConflicts(conflictToOpen) {
            if (!this.z.conflicts.length) {
                return;
            }
            this.t.set(true);
            const view = await this.W.openView(userDataSync_2.$YAb);
            if (view && conflictToOpen) {
                await view.open(conflictToOpen);
            }
        }
        async resetSyncedData() {
            const { confirmed } = await this.U.confirm({
                type: 'info',
                message: (0, nls_1.localize)(15, null),
                title: (0, nls_1.localize)(16, null),
                primaryButton: (0, nls_1.localize)(17, null),
            });
            if (confirmed) {
                await this.z.resetRemote();
            }
        }
        async getAllLogResources() {
            const logsFolders = [];
            const stat = await this.cb.resolve(this.C.extUri.dirname(this.P.logsHome));
            if (stat.children) {
                logsFolders.push(...stat.children
                    .filter(stat => stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name))
                    .sort()
                    .reverse()
                    .map(d => d.resource));
            }
            const result = [];
            for (const logFolder of logsFolders) {
                const folderStat = await this.cb.resolve(logFolder);
                const childStat = folderStat.children?.find(stat => this.C.extUri.basename(stat.resource).startsWith(`${userDataSync_1.$Vgb}.`));
                if (childStat) {
                    result.push(childStat.resource);
                }
            }
            return result;
        }
        async showSyncActivity() {
            this.w.set(true);
            await this.ob();
            await this.W.openViewContainer(userDataSync_2.$XAb);
        }
        async downloadSyncActivity(location) {
            await Promise.all([
                this.z.saveRemoteActivityData(this.C.extUri.joinPath(location, 'remoteActivity.json')),
                (async () => {
                    const logResources = await this.getAllLogResources();
                    await Promise.all(logResources.map(async (logResource) => this.cb.copy(logResource, this.C.extUri.joinPath(location, 'logs', `${this.C.extUri.basename(this.C.extUri.dirname(logResource))}.log`))));
                })(),
                this.cb.copy(this.P.userDataSyncHome, this.C.extUri.joinPath(location, 'localActivity')),
            ]);
        }
        async ob() {
            const viewContainer = this.X.getViewContainerById(userDataSync_2.$XAb);
            if (viewContainer) {
                const model = this.X.getViewContainerModel(viewContainer);
                if (!model.activeViewDescriptors.length) {
                    await event_1.Event.toPromise(event_1.Event.filter(model.onDidChangeActiveViewDescriptors, e => model.activeViewDescriptors.length > 0));
                }
            }
        }
        async signIn() {
            const currentAuthenticationProviderId = this.yb;
            const authenticationProvider = currentAuthenticationProviderId ? this.authenticationProviders.find(p => p.id === currentAuthenticationProviderId) : undefined;
            if (authenticationProvider) {
                await this.tb(authenticationProvider);
            }
            else {
                await this.pb();
            }
        }
        async pb() {
            const result = await this.qb();
            if (!result) {
                return false;
            }
            await this.tb(result);
            return true;
        }
        async qb() {
            if (this.authenticationProviders.length === 0) {
                return undefined;
            }
            const authenticationProviders = [...this.authenticationProviders].sort(({ id }) => id === this.yb ? -1 : 1);
            const allAccounts = new Map();
            if (authenticationProviders.length === 1) {
                const accounts = await this.rb(authenticationProviders[0].id, authenticationProviders[0].scopes);
                if (accounts.length) {
                    allAccounts.set(authenticationProviders[0].id, accounts);
                }
                else {
                    // Single auth provider and no accounts
                    return authenticationProviders[0];
                }
            }
            let result;
            const disposables = new lifecycle_1.$jc();
            const quickPick = disposables.add(this.G.createQuickPick());
            const promise = new Promise(c => {
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c(result);
                }));
            });
            quickPick.title = userDataSync_2.$NAb;
            quickPick.ok = false;
            quickPick.ignoreFocusOut = true;
            quickPick.placeholder = (0, nls_1.localize)(18, null);
            quickPick.show();
            if (authenticationProviders.length > 1) {
                quickPick.busy = true;
                for (const { id, scopes } of authenticationProviders) {
                    const accounts = await this.rb(id, scopes);
                    if (accounts.length) {
                        allAccounts.set(id, accounts);
                    }
                }
                quickPick.busy = false;
            }
            quickPick.items = this.sb(authenticationProviders, allAccounts);
            disposables.add(quickPick.onDidAccept(() => {
                result = quickPick.selectedItems[0]?.account ? quickPick.selectedItems[0]?.account : quickPick.selectedItems[0]?.authenticationProvider;
                quickPick.hide();
            }));
            return promise;
        }
        async rb(authenticationProviderId, scopes) {
            const accounts = new Map();
            let currentAccount = null;
            const sessions = await this.D.getSessions(authenticationProviderId, scopes) || [];
            for (const session of sessions) {
                const account = new UserDataSyncAccount(authenticationProviderId, session);
                accounts.set(account.accountId, account);
                if (account.sessionId === this.Ab) {
                    currentAccount = account;
                }
            }
            if (currentAccount) {
                // Always use current account if available
                accounts.set(currentAccount.accountId, currentAccount);
            }
            return currentAccount ? [...accounts.values()] : [...accounts.values()].sort(({ sessionId }) => sessionId === this.Ab ? -1 : 1);
        }
        sb(authenticationProviders, allAccounts) {
            const quickPickItems = [];
            // Signed in Accounts
            if (allAccounts.size) {
                quickPickItems.push({ type: 'separator', label: (0, nls_1.localize)(19, null) });
                for (const authenticationProvider of authenticationProviders) {
                    const accounts = (allAccounts.get(authenticationProvider.id) || []).sort(({ sessionId }) => sessionId === this.Ab ? -1 : 1);
                    const providerName = this.D.getLabel(authenticationProvider.id);
                    for (const account of accounts) {
                        quickPickItems.push({
                            label: `${account.accountName} (${providerName})`,
                            description: account.sessionId === this.current?.sessionId ? (0, nls_1.localize)(20, null) : undefined,
                            account,
                            authenticationProvider,
                        });
                    }
                }
                quickPickItems.push({ type: 'separator', label: (0, nls_1.localize)(21, null) });
            }
            // Account Providers
            for (const authenticationProvider of authenticationProviders) {
                if (!allAccounts.has(authenticationProvider.id) || this.D.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.D.getLabel(authenticationProvider.id);
                    quickPickItems.push({ label: (0, nls_1.localize)(22, null, providerName), authenticationProvider });
                }
            }
            return quickPickItems;
        }
        async tb(accountOrAuthProvider) {
            let sessionId;
            if ((0, userDataSync_1.$Agb)(accountOrAuthProvider)) {
                if (this.P.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.id) {
                    sessionId = await this.P.options?.settingsSyncOptions?.authenticationProvider?.signIn();
                }
                else {
                    sessionId = (await this.D.createSession(accountOrAuthProvider.id, accountOrAuthProvider.scopes)).id;
                }
            }
            else {
                if (this.P.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.authenticationProviderId) {
                    sessionId = await this.P.options?.settingsSyncOptions?.authenticationProvider?.signIn();
                }
                else {
                    sessionId = accountOrAuthProvider.sessionId;
                }
            }
            this.Ab = sessionId;
            await this.hb();
        }
        async ub() {
            this.L.publicLog2('sync/successiveAuthFailures');
            this.Ab = undefined;
            await this.hb('auth failure');
        }
        vb(e) {
            if (this.Ab && e.removed.find(session => session.id === this.Ab)) {
                this.Ab = undefined;
            }
            this.hb('change in sessions');
        }
        wb() {
            if (this.Ab !== this.Bb() /* This checks if current window changed the value or not */) {
                this.zb = null;
                this.hb('change in storage');
            }
        }
        get yb() {
            if (this.xb === null) {
                this.xb = this.H.get($gBb_1.b, -1 /* StorageScope.APPLICATION */);
            }
            return this.xb;
        }
        set yb(currentAuthenticationProviderId) {
            if (this.xb !== currentAuthenticationProviderId) {
                this.xb = currentAuthenticationProviderId;
                if (currentAuthenticationProviderId === undefined) {
                    this.H.remove($gBb_1.b, -1 /* StorageScope.APPLICATION */);
                }
                else {
                    this.H.store($gBb_1.b, currentAuthenticationProviderId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        get Ab() {
            if (this.zb === null) {
                this.zb = this.Bb();
            }
            return this.zb;
        }
        set Ab(cachedSessionId) {
            if (this.zb !== cachedSessionId) {
                this.zb = cachedSessionId;
                if (cachedSessionId === undefined) {
                    this.M.info('Settings Sync: Reset current session');
                    this.H.remove($gBb_1.f, -1 /* StorageScope.APPLICATION */);
                }
                else {
                    this.M.info('Settings Sync: Updated current session', cachedSessionId);
                    this.H.store($gBb_1.f, cachedSessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        Bb() {
            return this.H.get($gBb_1.f, -1 /* StorageScope.APPLICATION */);
        }
        get Cb() {
            return !this.H.getBoolean($gBb_1.a, -1 /* StorageScope.APPLICATION */, false);
        }
        set Cb(useWorkbenchSession) {
            this.H.store($gBb_1.a, !useWorkbenchSession, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    };
    exports.$gBb = $gBb;
    exports.$gBb = $gBb = $gBb_1 = __decorate([
        __param(0, userDataSync_1.$Qgb),
        __param(1, uriIdentity_1.$Ck),
        __param(2, authentication_1.$3I),
        __param(3, userDataSyncAccount_1.$Ezb),
        __param(4, quickInput_1.$Gq),
        __param(5, storage_1.$Vo),
        __param(6, userDataSync_1.$Pgb),
        __param(7, userDataSync_1.$Sgb),
        __param(8, telemetry_1.$9k),
        __param(9, log_1.$5i),
        __param(10, productService_1.$kj),
        __param(11, extensions_2.$MF),
        __param(12, environmentService_1.$LT),
        __param(13, secrets_1.$FT),
        __param(14, notification_1.$Yu),
        __param(15, progress_1.$2u),
        __param(16, dialogs_1.$oA),
        __param(17, contextkey_1.$3i),
        __param(18, views_1.$$E),
        __param(19, views_1.$_E),
        __param(20, userDataSync_1.$Egb),
        __param(21, lifecycle_2.$7y),
        __param(22, instantiation_1.$Ah),
        __param(23, editorService_1.$9C),
        __param(24, userDataInit_1.$wzb),
        __param(25, files_1.$6j)
    ], $gBb);
    (0, extensions_1.$mr)(userDataSync_2.$KAb, $gBb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=userDataSyncWorkbenchService.js.map