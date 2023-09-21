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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/editSessions/common/editSessions", "vs/platform/dialogs/common/dialogs", "vs/base/common/uuid", "vs/workbench/services/authentication/browser/authenticationService", "vs/base/common/platform", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/base/common/event", "vs/base/common/errors", "vs/platform/secrets/common/secrets"], function (require, exports, lifecycle_1, nls_1, actions_1, contextkey_1, environment_1, files_1, productService_1, quickInput_1, storage_1, userDataSync_1, authentication_1, extensions_1, editSessions_1, dialogs_1, uuid_1, authenticationService_1, platform_1, userDataSyncMachines_1, event_1, errors_1, secrets_1) {
    "use strict";
    var EditSessionsWorkbenchService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionsWorkbenchService = void 0;
    let EditSessionsWorkbenchService = class EditSessionsWorkbenchService extends lifecycle_1.Disposable {
        static { EditSessionsWorkbenchService_1 = this; }
        static { this.CACHED_SESSION_STORAGE_KEY = 'editSessionAccountPreference'; }
        get isSignedIn() {
            return this.existingSessionId !== undefined;
        }
        get onDidSignIn() {
            return this._didSignIn.event;
        }
        get onDidSignOut() {
            return this._didSignOut.event;
        }
        get lastWrittenResources() {
            return this._lastWrittenResources;
        }
        get lastReadResources() {
            return this._lastReadResources;
        }
        constructor(fileService, storageService, quickInputService, authenticationService, extensionService, environmentService, logService, productService, contextKeyService, dialogService, secretStorageService) {
            super();
            this.fileService = fileService;
            this.storageService = storageService;
            this.quickInputService = quickInputService;
            this.authenticationService = authenticationService;
            this.extensionService = extensionService;
            this.environmentService = environmentService;
            this.logService = logService;
            this.productService = productService;
            this.contextKeyService = contextKeyService;
            this.dialogService = dialogService;
            this.secretStorageService = secretStorageService;
            this.SIZE_LIMIT = Math.floor(1024 * 1024 * 1.9); // 2 MB
            this.serverConfiguration = this.productService['editSessions.store'];
            this.initialized = false;
            this._didSignIn = new event_1.Emitter();
            this._didSignOut = new event_1.Emitter();
            this._lastWrittenResources = new Map();
            this._lastReadResources = new Map();
            // If the user signs out of the current session, reset our cached auth state in memory and on disk
            this._register(this.authenticationService.onDidChangeSessions((e) => this.onDidChangeSessions(e.event)));
            // If another window changes the preferred session storage, reset our cached auth state in memory
            this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidChangeStorage()));
            this.registerSignInAction();
            this.registerResetAuthenticationAction();
            this.signedInContext = editSessions_1.EDIT_SESSIONS_SIGNED_IN.bindTo(this.contextKeyService);
            this.signedInContext.set(this.existingSessionId !== undefined);
        }
        /**
         * @param resource: The resource to retrieve content for.
         * @param content An object representing resource state to be restored.
         * @returns The ref of the stored state.
         */
        async write(resource, content) {
            await this.initialize('write', false);
            if (!this.initialized) {
                throw new Error('Please sign in to store your edit session.');
            }
            if (typeof content !== 'string' && content.machine === undefined) {
                content.machine = await this.getOrCreateCurrentMachineId();
            }
            content = typeof content === 'string' ? content : JSON.stringify(content);
            const ref = await this.storeClient.writeResource(resource, content, null, undefined, (0, userDataSync_1.createSyncHeaders)((0, uuid_1.generateUuid)()));
            this._lastWrittenResources.set(resource, { ref, content });
            return ref;
        }
        /**
         * @param resource: The resource to retrieve content for.
         * @param ref: A specific content ref to retrieve content for, if it exists.
         * If undefined, this method will return the latest saved edit session, if any.
         *
         * @returns An object representing the requested or latest state, if any.
         */
        async read(resource, ref) {
            await this.initialize('read', false);
            if (!this.initialized) {
                throw new Error('Please sign in to apply your latest edit session.');
            }
            let content;
            const headers = (0, userDataSync_1.createSyncHeaders)((0, uuid_1.generateUuid)());
            try {
                if (ref !== undefined) {
                    content = await this.storeClient?.resolveResourceContent(resource, ref, undefined, headers);
                }
                else {
                    const result = await this.storeClient?.readResource(resource, null, undefined, headers);
                    content = result?.content;
                    ref = result?.ref;
                }
            }
            catch (ex) {
                this.logService.error(ex);
            }
            // TODO@joyceerhl Validate session data, check schema version
            if (content !== undefined && content !== null && ref !== undefined) {
                this._lastReadResources.set(resource, { ref, content });
                return { ref, content };
            }
            return undefined;
        }
        async delete(resource, ref) {
            await this.initialize('write', false);
            if (!this.initialized) {
                throw new Error(`Unable to delete edit session with ref ${ref}.`);
            }
            try {
                await this.storeClient?.deleteResource(resource, ref);
            }
            catch (ex) {
                this.logService.error(ex);
            }
        }
        async list(resource) {
            await this.initialize('read', false);
            if (!this.initialized) {
                throw new Error(`Unable to list edit sessions.`);
            }
            try {
                return this.storeClient?.getAllResourceRefs(resource) ?? [];
            }
            catch (ex) {
                this.logService.error(ex);
            }
            return [];
        }
        async initialize(reason, silent = false) {
            if (this.initialized) {
                return true;
            }
            this.initialized = await this.doInitialize(reason, silent);
            this.signedInContext.set(this.initialized);
            if (this.initialized) {
                this._didSignIn.fire();
            }
            return this.initialized;
        }
        /**
         *
         * Ensures that the store client is initialized,
         * meaning that authentication is configured and it
         * can be used to communicate with the remote storage service
         */
        async doInitialize(reason, silent) {
            // Wait for authentication extensions to be registered
            await this.extensionService.whenInstalledExtensionsRegistered();
            if (!this.serverConfiguration?.url) {
                throw new Error('Unable to initialize sessions sync as session sync preference is not configured in product.json.');
            }
            if (this.storeClient === undefined) {
                return false;
            }
            this._register(this.storeClient.onTokenFailed(() => {
                this.logService.info('Clearing edit sessions authentication preference because of successive token failures.');
                this.clearAuthenticationPreference();
            }));
            if (this.machineClient === undefined) {
                this.machineClient = new userDataSyncMachines_1.UserDataSyncMachinesService(this.environmentService, this.fileService, this.storageService, this.storeClient, this.logService, this.productService);
            }
            // If we already have an existing auth session in memory, use that
            if (this.authenticationInfo !== undefined) {
                return true;
            }
            const authenticationSession = await this.getAuthenticationSession(reason, silent);
            if (authenticationSession !== undefined) {
                this.authenticationInfo = authenticationSession;
                this.storeClient.setAuthToken(authenticationSession.token, authenticationSession.providerId);
            }
            return authenticationSession !== undefined;
        }
        async getMachineById(machineId) {
            await this.initialize('read', false);
            if (!this.cachedMachines) {
                const machines = await this.machineClient.getMachines();
                this.cachedMachines = machines.reduce((map, machine) => map.set(machine.id, machine.name), new Map());
            }
            return this.cachedMachines.get(machineId);
        }
        async getOrCreateCurrentMachineId() {
            const currentMachineId = await this.machineClient.getMachines().then((machines) => machines.find((m) => m.isCurrent)?.id);
            if (currentMachineId === undefined) {
                await this.machineClient.addCurrentMachine();
                return await this.machineClient.getMachines().then((machines) => machines.find((m) => m.isCurrent).id);
            }
            return currentMachineId;
        }
        async getAuthenticationSession(reason, silent) {
            // If the user signed in previously and the session is still available, reuse that without prompting the user again
            if (this.existingSessionId) {
                this.logService.info(`Searching for existing authentication session with ID ${this.existingSessionId}`);
                const existingSession = await this.getExistingSession();
                if (existingSession) {
                    this.logService.info(`Found existing authentication session with ID ${existingSession.session.id}`);
                    return { sessionId: existingSession.session.id, token: existingSession.session.idToken ?? existingSession.session.accessToken, providerId: existingSession.session.providerId };
                }
                else {
                    this._didSignOut.fire();
                }
            }
            // If settings sync is already enabled, avoid asking again to authenticate
            if (this.shouldAttemptEditSessionInit()) {
                this.logService.info(`Reusing user data sync enablement`);
                const authenticationSessionInfo = await (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.secretStorageService, this.productService);
                if (authenticationSessionInfo !== undefined) {
                    this.logService.info(`Using current authentication session with ID ${authenticationSessionInfo.id}`);
                    this.existingSessionId = authenticationSessionInfo.id;
                    return { sessionId: authenticationSessionInfo.id, token: authenticationSessionInfo.accessToken, providerId: authenticationSessionInfo.providerId };
                }
            }
            // If we aren't supposed to prompt the user because
            // we're in a silent flow, just return here
            if (silent) {
                return;
            }
            // Ask the user to pick a preferred account
            const authenticationSession = await this.getAccountPreference(reason);
            if (authenticationSession !== undefined) {
                this.existingSessionId = authenticationSession.id;
                return { sessionId: authenticationSession.id, token: authenticationSession.idToken ?? authenticationSession.accessToken, providerId: authenticationSession.providerId };
            }
            return undefined;
        }
        shouldAttemptEditSessionInit() {
            return platform_1.isWeb && this.storageService.isNew(-1 /* StorageScope.APPLICATION */) && this.storageService.isNew(1 /* StorageScope.WORKSPACE */);
        }
        /**
         *
         * Prompts the user to pick an authentication option for storing and getting edit sessions.
         */
        async getAccountPreference(reason) {
            const quickpick = this.quickInputService.createQuickPick();
            quickpick.ok = false;
            quickpick.placeholder = reason === 'read' ? (0, nls_1.localize)('choose account read placeholder', "Select an account to restore your working changes from the cloud") : (0, nls_1.localize)('choose account placeholder', "Select an account to store your working changes in the cloud");
            quickpick.ignoreFocusOut = true;
            quickpick.items = await this.createQuickpickItems();
            return new Promise((resolve, reject) => {
                quickpick.onDidHide((e) => {
                    reject(new errors_1.CancellationError());
                    quickpick.dispose();
                });
                quickpick.onDidAccept(async (e) => {
                    const selection = quickpick.selectedItems[0];
                    const session = 'provider' in selection ? { ...await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes), providerId: selection.provider.id } : ('session' in selection ? selection.session : undefined);
                    resolve(session);
                    quickpick.hide();
                });
                quickpick.show();
            });
        }
        async createQuickpickItems() {
            const options = [];
            options.push({ type: 'separator', label: (0, nls_1.localize)('signed in', "Signed In") });
            const sessions = await this.getAllSessions();
            options.push(...sessions);
            options.push({ type: 'separator', label: (0, nls_1.localize)('others', "Others") });
            for (const authenticationProvider of (await this.getAuthenticationProviders())) {
                const signedInForProvider = sessions.some(account => account.session.providerId === authenticationProvider.id);
                if (!signedInForProvider || this.authenticationService.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    options.push({ label: (0, nls_1.localize)('sign in using account', "Sign in with {0}", providerName), provider: authenticationProvider });
                }
            }
            return options;
        }
        /**
         *
         * Returns all authentication sessions available from {@link getAuthenticationProviders}.
         */
        async getAllSessions() {
            const authenticationProviders = await this.getAuthenticationProviders();
            const accounts = new Map();
            let currentSession;
            for (const provider of authenticationProviders) {
                const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
                for (const session of sessions) {
                    const item = {
                        label: session.account.label,
                        description: this.authenticationService.getLabel(provider.id),
                        session: { ...session, providerId: provider.id }
                    };
                    accounts.set(item.session.account.id, item);
                    if (this.existingSessionId === session.id) {
                        currentSession = item;
                    }
                }
            }
            if (currentSession !== undefined) {
                accounts.set(currentSession.session.account.id, currentSession);
            }
            return [...accounts.values()].sort((a, b) => a.label.localeCompare(b.label));
        }
        /**
         *
         * Returns all authentication providers which can be used to authenticate
         * to the remote storage service, based on product.json configuration
         * and registered authentication providers.
         */
        async getAuthenticationProviders() {
            if (!this.serverConfiguration) {
                throw new Error('Unable to get configured authentication providers as session sync preference is not configured in product.json.');
            }
            // Get the list of authentication providers configured in product.json
            const authenticationProviders = this.serverConfiguration.authenticationProviders;
            const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
                result.push({ id, scopes: authenticationProviders[id].scopes });
                return result;
            }, []);
            // Filter out anything that isn't currently available through the authenticationService
            const availableAuthenticationProviders = this.authenticationService.declaredProviders;
            return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some(provider => provider.id === id));
        }
        get existingSessionId() {
            return this.storageService.get(EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
        }
        set existingSessionId(sessionId) {
            this.logService.trace(`Saving authentication session preference for ID ${sessionId}.`);
            if (sessionId === undefined) {
                this.storageService.remove(EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            }
            else {
                this.storageService.store(EditSessionsWorkbenchService_1.CACHED_SESSION_STORAGE_KEY, sessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        async getExistingSession() {
            const accounts = await this.getAllSessions();
            return accounts.find((account) => account.session.id === this.existingSessionId);
        }
        async onDidChangeStorage() {
            const newSessionId = this.existingSessionId;
            const previousSessionId = this.authenticationInfo?.sessionId;
            if (previousSessionId !== newSessionId) {
                this.logService.trace(`Resetting authentication state because authentication session ID preference changed from ${previousSessionId} to ${newSessionId}.`);
                this.authenticationInfo = undefined;
                this.initialized = false;
            }
        }
        clearAuthenticationPreference() {
            this.authenticationInfo = undefined;
            this.initialized = false;
            this.existingSessionId = undefined;
            this.signedInContext.set(false);
        }
        onDidChangeSessions(e) {
            if (this.authenticationInfo?.sessionId && e.removed.find(session => session.id === this.authenticationInfo?.sessionId)) {
                this.clearAuthenticationPreference();
            }
        }
        registerSignInAction() {
            const that = this;
            const id = 'workbench.editSessions.actions.signIn';
            const when = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(editSessions_1.EDIT_SESSIONS_PENDING_KEY, false), contextkey_1.ContextKeyExpr.equals(editSessions_1.EDIT_SESSIONS_SIGNED_IN_KEY, false));
            this._register((0, actions_1.registerAction2)(class ResetEditSessionAuthenticationAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: (0, nls_1.localize)('sign in', 'Turn on Cloud Changes...'),
                        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY,
                        precondition: when,
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                            },
                            {
                                id: actions_1.MenuId.AccountsContext,
                                group: '2_editSessions',
                                when,
                            }]
                    });
                }
                async run() {
                    return await that.initialize('write', false);
                }
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                group: '2_editSessions',
                command: {
                    id,
                    title: (0, nls_1.localize)('sign in badge', 'Turn on Cloud Changes... (1)'),
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(editSessions_1.EDIT_SESSIONS_PENDING_KEY, true), contextkey_1.ContextKeyExpr.equals(editSessions_1.EDIT_SESSIONS_SIGNED_IN_KEY, false))
            }));
        }
        registerResetAuthenticationAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class ResetEditSessionAuthenticationAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resetAuth',
                        title: (0, nls_1.localize)('reset auth.v3', 'Turn off Cloud Changes...'),
                        category: editSessions_1.EDIT_SESSION_SYNC_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.equals(editSessions_1.EDIT_SESSIONS_SIGNED_IN_KEY, true),
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                            },
                            {
                                id: actions_1.MenuId.AccountsContext,
                                group: '2_editSessions',
                                when: contextkey_1.ContextKeyExpr.equals(editSessions_1.EDIT_SESSIONS_SIGNED_IN_KEY, true),
                            }]
                    });
                }
                async run() {
                    const result = await that.dialogService.confirm({
                        message: (0, nls_1.localize)('sign out of cloud changes clear data prompt', 'Do you want to disable storing working changes in the cloud?'),
                        checkbox: { label: (0, nls_1.localize)('delete all cloud changes', 'Delete all stored data from the cloud.') }
                    });
                    if (result.confirmed) {
                        if (result.checkboxChecked) {
                            that.storeClient?.deleteResource('editSessions', null);
                        }
                        that.clearAuthenticationPreference();
                    }
                }
            }));
        }
    };
    exports.EditSessionsWorkbenchService = EditSessionsWorkbenchService;
    exports.EditSessionsWorkbenchService = EditSessionsWorkbenchService = EditSessionsWorkbenchService_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, storage_1.IStorageService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, authentication_1.IAuthenticationService),
        __param(4, extensions_1.IExtensionService),
        __param(5, environment_1.IEnvironmentService),
        __param(6, editSessions_1.IEditSessionsLogService),
        __param(7, productService_1.IProductService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, dialogs_1.IDialogService),
        __param(10, secrets_1.ISecretStorageService)
    ], EditSessionsWorkbenchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zU3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9lZGl0U2Vzc2lvbnMvYnJvd3Nlci9lZGl0U2Vzc2lvbnNTdG9yYWdlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNEJ6RixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLHNCQUFVOztpQkFVNUMsK0JBQTBCLEdBQUcsOEJBQThCLEFBQWpDLENBQWtDO1FBSzNFLElBQUksVUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixLQUFLLFNBQVMsQ0FBQztRQUM3QyxDQUFDO1FBR0QsSUFBSSxXQUFXO1lBQ2QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM5QixDQUFDO1FBR0QsSUFBSSxZQUFZO1lBQ2YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBR0QsSUFBSSxvQkFBb0I7WUFDdkIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUM7UUFDbkMsQ0FBQztRQUdELElBQUksaUJBQWlCO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ2hDLENBQUM7UUFJRCxZQUNlLFdBQTBDLEVBQ3ZDLGNBQWdELEVBQzdDLGlCQUFzRCxFQUNsRCxxQkFBOEQsRUFDbkUsZ0JBQW9ELEVBQ2xELGtCQUF3RCxFQUNwRCxVQUFvRCxFQUM1RCxjQUFnRCxFQUM3QyxpQkFBc0QsRUFDMUQsYUFBOEMsRUFDdkMsb0JBQTREO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBWnVCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3RCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2pD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