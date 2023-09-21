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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/editSessions/browser/editSessionsStorageService", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/editSessions/common/editSessions", "vs/platform/dialogs/common/dialogs", "vs/base/common/uuid", "vs/workbench/services/authentication/browser/authenticationService", "vs/base/common/platform", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/base/common/event", "vs/base/common/errors", "vs/platform/secrets/common/secrets"], function (require, exports, lifecycle_1, nls_1, actions_1, contextkey_1, environment_1, files_1, productService_1, quickInput_1, storage_1, userDataSync_1, authentication_1, extensions_1, editSessions_1, dialogs_1, uuid_1, authenticationService_1, platform_1, userDataSyncMachines_1, event_1, errors_1, secrets_1) {
    "use strict";
    var $_Zb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_Zb = void 0;
    let $_Zb = class $_Zb extends lifecycle_1.$kc {
        static { $_Zb_1 = this; }
        static { this.h = 'editSessionAccountPreference'; }
        get isSignedIn() {
            return this.X !== undefined;
        }
        get onDidSignIn() {
            return this.r.event;
        }
        get onDidSignOut() {
            return this.s.event;
        }
        get lastWrittenResources() {
            return this.t;
        }
        get lastReadResources() {
            return this.u;
        }
        constructor(w, y, z, C, D, F, G, H, I, J, L) {
            super();
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.SIZE_LIMIT = Math.floor(1024 * 1024 * 1.9); // 2 MB
            this.c = this.H['editSessions.store'];
            this.j = false;
            this.r = new event_1.$fd();
            this.s = new event_1.$fd();
            this.t = new Map();
            this.u = new Map();
            // If the user signs out of the current session, reset our cached auth state in memory and on disk
            this.B(this.C.onDidChangeSessions((e) => this.ab(e.event)));
            // If another window changes the preferred session storage, reset our cached auth state in memory
            this.B(this.y.onDidChangeValue(-1 /* StorageScope.APPLICATION */, $_Zb_1.h, this.B(new lifecycle_1.$jc()))(() => this.Z()));
            this.bb();
            this.cb();
            this.n = editSessions_1.$YZb.bindTo(this.I);
            this.n.set(this.X !== undefined);
        }
        /**
         * @param resource: The resource to retrieve content for.
         * @param content An object representing resource state to be restored.
         * @returns The ref of the stored state.
         */
        async write(resource, content) {
            await this.initialize('write', false);
            if (!this.j) {
                throw new Error('Please sign in to store your edit session.');
            }
            if (typeof content !== 'string' && content.machine === undefined) {
                content.machine = await this.O();
            }
            content = typeof content === 'string' ? content : JSON.stringify(content);
            const ref = await this.storeClient.writeResource(resource, content, null, undefined, (0, userDataSync_1.$Jgb)((0, uuid_1.$4f)()));
            this.t.set(resource, { ref, content });
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
            if (!this.j) {
                throw new Error('Please sign in to apply your latest edit session.');
            }
            let content;
            const headers = (0, userDataSync_1.$Jgb)((0, uuid_1.$4f)());
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
                this.G.error(ex);
            }
            // TODO@joyceerhl Validate session data, check schema version
            if (content !== undefined && content !== null && ref !== undefined) {
                this.u.set(resource, { ref, content });
                return { ref, content };
            }
            return undefined;
        }
        async delete(resource, ref) {
            await this.initialize('write', false);
            if (!this.j) {
                throw new Error(`Unable to delete edit session with ref ${ref}.`);
            }
            try {
                await this.storeClient?.deleteResource(resource, ref);
            }
            catch (ex) {
                this.G.error(ex);
            }
        }
        async list(resource) {
            await this.initialize('read', false);
            if (!this.j) {
                throw new Error(`Unable to list edit sessions.`);
            }
            try {
                return this.storeClient?.getAllResourceRefs(resource) ?? [];
            }
            catch (ex) {
                this.G.error(ex);
            }
            return [];
        }
        async initialize(reason, silent = false) {
            if (this.j) {
                return true;
            }
            this.j = await this.M(reason, silent);
            this.n.set(this.j);
            if (this.j) {
                this.r.fire();
            }
            return this.j;
        }
        /**
         *
         * Ensures that the store client is initialized,
         * meaning that authentication is configured and it
         * can be used to communicate with the remote storage service
         */
        async M(reason, silent) {
            // Wait for authentication extensions to be registered
            await this.D.whenInstalledExtensionsRegistered();
            if (!this.c?.url) {
                throw new Error('Unable to initialize sessions sync as session sync preference is not configured in product.json.');
            }
            if (this.storeClient === undefined) {
                return false;
            }
            this.B(this.storeClient.onTokenFailed(() => {
                this.G.info('Clearing edit sessions authentication preference because of successive token failures.');
                this.$();
            }));
            if (this.f === undefined) {
                this.f = new userDataSyncMachines_1.$ugb(this.F, this.w, this.y, this.storeClient, this.G, this.H);
            }
            // If we already have an existing auth session in memory, use that
            if (this.g !== undefined) {
                return true;
            }
            const authenticationSession = await this.P(reason, silent);
            if (authenticationSession !== undefined) {
                this.g = authenticationSession;
                this.storeClient.setAuthToken(authenticationSession.token, authenticationSession.providerId);
            }
            return authenticationSession !== undefined;
        }
        async getMachineById(machineId) {
            await this.initialize('read', false);
            if (!this.N) {
                const machines = await this.f.getMachines();
                this.N = machines.reduce((map, machine) => map.set(machine.id, machine.name), new Map());
            }
            return this.N.get(machineId);
        }
        async O() {
            const currentMachineId = await this.f.getMachines().then((machines) => machines.find((m) => m.isCurrent)?.id);
            if (currentMachineId === undefined) {
                await this.f.addCurrentMachine();
                return await this.f.getMachines().then((machines) => machines.find((m) => m.isCurrent).id);
            }
            return currentMachineId;
        }
        async P(reason, silent) {
            // If the user signed in previously and the session is still available, reuse that without prompting the user again
            if (this.X) {
                this.G.info(`Searching for existing authentication session with ID ${this.X}`);
                const existingSession = await this.Y();
                if (existingSession) {
                    this.G.info(`Found existing authentication session with ID ${existingSession.session.id}`);
                    return { sessionId: existingSession.session.id, token: existingSession.session.idToken ?? existingSession.session.accessToken, providerId: existingSession.session.providerId };
                }
                else {
                    this.s.fire();
                }
            }
            // If settings sync is already enabled, avoid asking again to authenticate
            if (this.Q()) {
                this.G.info(`Reusing user data sync enablement`);
                const authenticationSessionInfo = await (0, authenticationService_1.$QV)(this.L, this.H);
                if (authenticationSessionInfo !== undefined) {
                    this.G.info(`Using current authentication session with ID ${authenticationSessionInfo.id}`);
                    this.X = authenticationSessionInfo.id;
                    return { sessionId: authenticationSessionInfo.id, token: authenticationSessionInfo.accessToken, providerId: authenticationSessionInfo.providerId };
                }
            }
            // If we aren't supposed to prompt the user because
            // we're in a silent flow, just return here
            if (silent) {
                return;
            }
            // Ask the user to pick a preferred account
            const authenticationSession = await this.R(reason);
            if (authenticationSession !== undefined) {
                this.X = authenticationSession.id;
                return { sessionId: authenticationSession.id, token: authenticationSession.idToken ?? authenticationSession.accessToken, providerId: authenticationSession.providerId };
            }
            return undefined;
        }
        Q() {
            return platform_1.$o && this.y.isNew(-1 /* StorageScope.APPLICATION */) && this.y.isNew(1 /* StorageScope.WORKSPACE */);
        }
        /**
         *
         * Prompts the user to pick an authentication option for storing and getting edit sessions.
         */
        async R(reason) {
            const quickpick = this.z.createQuickPick();
            quickpick.ok = false;
            quickpick.placeholder = reason === 'read' ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null);
            quickpick.ignoreFocusOut = true;
            quickpick.items = await this.S();
            return new Promise((resolve, reject) => {
                quickpick.onDidHide((e) => {
                    reject(new errors_1.$3());
                    quickpick.dispose();
                });
                quickpick.onDidAccept(async (e) => {
                    const selection = quickpick.selectedItems[0];
                    const session = 'provider' in selection ? { ...await this.C.createSession(selection.provider.id, selection.provider.scopes), providerId: selection.provider.id } : ('session' in selection ? selection.session : undefined);
                    resolve(session);
                    quickpick.hide();
                });
                quickpick.show();
            });
        }
        async S() {
            const options = [];
            options.push({ type: 'separator', label: (0, nls_1.localize)(2, null) });
            const sessions = await this.U();
            options.push(...sessions);
            options.push({ type: 'separator', label: (0, nls_1.localize)(3, null) });
            for (const authenticationProvider of (await this.W())) {
                const signedInForProvider = sessions.some(account => account.session.providerId === authenticationProvider.id);
                if (!signedInForProvider || this.C.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.C.getLabel(authenticationProvider.id);
                    options.push({ label: (0, nls_1.localize)(4, null, providerName), provider: authenticationProvider });
                }
            }
            return options;
        }
        /**
         *
         * Returns all authentication sessions available from {@link W}.
         */
        async U() {
            const authenticationProviders = await this.W();
            const accounts = new Map();
            let currentSession;
            for (const provider of authenticationProviders) {
                const sessions = await this.C.getSessions(provider.id, provider.scopes);
                for (const session of sessions) {
                    const item = {
                        label: session.account.label,
                        description: this.C.getLabel(provider.id),
                        session: { ...session, providerId: provider.id }
                    };
                    accounts.set(item.session.account.id, item);
                    if (this.X === session.id) {
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
        async W() {
            if (!this.c) {
                throw new Error('Unable to get configured authentication providers as session sync preference is not configured in product.json.');
            }
            // Get the list of authentication providers configured in product.json
            const authenticationProviders = this.c.authenticationProviders;
            const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
                result.push({ id, scopes: authenticationProviders[id].scopes });
                return result;
            }, []);
            // Filter out anything that isn't currently available through the authenticationService
            const availableAuthenticationProviders = this.C.declaredProviders;
            return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some(provider => provider.id === id));
        }
        get X() {
            return this.y.get($_Zb_1.h, -1 /* StorageScope.APPLICATION */);
        }
        set X(sessionId) {
            this.G.trace(`Saving authentication session preference for ID ${sessionId}.`);
            if (sessionId === undefined) {
                this.y.remove($_Zb_1.h, -1 /* StorageScope.APPLICATION */);
            }
            else {
                this.y.store($_Zb_1.h, sessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        async Y() {
            const accounts = await this.U();
            return accounts.find((account) => account.session.id === this.X);
        }
        async Z() {
            const newSessionId = this.X;
            const previousSessionId = this.g?.sessionId;
            if (previousSessionId !== newSessionId) {
                this.G.trace(`Resetting authentication state because authentication session ID preference changed from ${previousSessionId} to ${newSessionId}.`);
                this.g = undefined;
                this.j = false;
            }
        }
        $() {
            this.g = undefined;
            this.j = false;
            this.X = undefined;
            this.n.set(false);
        }
        ab(e) {
            if (this.g?.sessionId && e.removed.find(session => session.id === this.g?.sessionId)) {
                this.$();
            }
        }
        bb() {
            const that = this;
            const id = 'workbench.editSessions.actions.signIn';
            const when = contextkey_1.$Ii.and(contextkey_1.$Ii.equals(editSessions_1.$ZZb, false), contextkey_1.$Ii.equals(editSessions_1.$XZb, false));
            this.B((0, actions_1.$Xu)(class ResetEditSessionAuthenticationAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id,
                        title: (0, nls_1.localize)(5, null),
                        category: editSessions_1.$TZb,
                        precondition: when,
                        menu: [{
                                id: actions_1.$Ru.CommandPalette,
                            },
                            {
                                id: actions_1.$Ru.AccountsContext,
                                group: '2_editSessions',
                                when,
                            }]
                    });
                }
                async run() {
                    return await that.initialize('write', false);
                }
            }));
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.AccountsContext, {
                group: '2_editSessions',
                command: {
                    id,
                    title: (0, nls_1.localize)(6, null),
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals(editSessions_1.$ZZb, true), contextkey_1.$Ii.equals(editSessions_1.$XZb, false))
            }));
        }
        cb() {
            const that = this;
            this.B((0, actions_1.$Xu)(class ResetEditSessionAuthenticationAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resetAuth',
                        title: (0, nls_1.localize)(7, null),
                        category: editSessions_1.$TZb,
                        precondition: contextkey_1.$Ii.equals(editSessions_1.$XZb, true),
                        menu: [{
                                id: actions_1.$Ru.CommandPalette,
                            },
                            {
                                id: actions_1.$Ru.AccountsContext,
                                group: '2_editSessions',
                                when: contextkey_1.$Ii.equals(editSessions_1.$XZb, true),
                            }]
                    });
                }
                async run() {
                    const result = await that.J.confirm({
                        message: (0, nls_1.localize)(8, null),
                        checkbox: { label: (0, nls_1.localize)(9, null) }
                    });
                    if (result.confirmed) {
                        if (result.checkboxChecked) {
                            that.storeClient?.deleteResource('editSessions', null);
                        }
                        that.$();
                    }
                }
            }));
        }
    };
    exports.$_Zb = $_Zb;
    exports.$_Zb = $_Zb = $_Zb_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, storage_1.$Vo),
        __param(2, quickInput_1.$Gq),
        __param(3, authentication_1.$3I),
        __param(4, extensions_1.$MF),
        __param(5, environment_1.$Ih),
        __param(6, editSessions_1.$VZb),
        __param(7, productService_1.$kj),
        __param(8, contextkey_1.$3i),
        __param(9, dialogs_1.$oA),
        __param(10, secrets_1.$FT)
    ], $_Zb);
});
//# sourceMappingURL=editSessionsStorageService.js.map