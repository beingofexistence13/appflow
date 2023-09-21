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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/nls!vs/workbench/services/authentication/browser/authenticationService", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/services/activity/common/activity", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, arrays_1, event_1, lifecycle_1, strings_1, types_1, nls, actions_1, commands_1, contextkey_1, dialogs_1, extensions_1, notification_1, productService_1, quickInput_1, storage_1, activity_1, authentication_1, environmentService_1, extensions_2, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SV = exports.$RV = exports.$QV = exports.$PV = exports.$OV = exports.$NV = exports.$MV = void 0;
    function $MV(id) { return `onAuthenticationRequest:${id}`; }
    exports.$MV = $MV;
    function $NV(storageService, providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const storedUsages = storageService.get(accountKey, -1 /* StorageScope.APPLICATION */);
        let usages = [];
        if (storedUsages) {
            try {
                usages = JSON.parse(storedUsages);
            }
            catch (e) {
                // ignore
            }
        }
        return usages;
    }
    exports.$NV = $NV;
    function $OV(storageService, providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        storageService.remove(accountKey, -1 /* StorageScope.APPLICATION */);
    }
    exports.$OV = $OV;
    function $PV(storageService, providerId, accountName, extensionId, extensionName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const usages = $NV(storageService, providerId, accountName);
        const existingUsageIndex = usages.findIndex(usage => usage.extensionId === extensionId);
        if (existingUsageIndex > -1) {
            usages.splice(existingUsageIndex, 1, {
                extensionId,
                extensionName,
                lastUsed: Date.now()
            });
        }
        else {
            usages.push({
                extensionId,
                extensionName,
                lastUsed: Date.now()
            });
        }
        storageService.store(accountKey, JSON.stringify(usages), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
    exports.$PV = $PV;
    async function $QV(secretStorageService, productService) {
        const authenticationSessionValue = await secretStorageService.get(`${productService.urlProtocol}.loginAccount`);
        if (authenticationSessionValue) {
            try {
                const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
                if (authenticationSessionInfo
                    && (0, types_1.$jf)(authenticationSessionInfo.id)
                    && (0, types_1.$jf)(authenticationSessionInfo.accessToken)
                    && (0, types_1.$jf)(authenticationSessionInfo.providerId)) {
                    return authenticationSessionInfo;
                }
            }
            catch (e) {
                // This is a best effort operation.
                console.error(`Failed parsing current auth session value: ${e}`);
            }
        }
        return undefined;
    }
    exports.$QV = $QV;
    function $RV(storageService, providerId, accountName) {
        let trustedExtensions = [];
        try {
            const trustedExtensionSrc = storageService.get(`${providerId}-${accountName}`, -1 /* StorageScope.APPLICATION */);
            if (trustedExtensionSrc) {
                trustedExtensions = JSON.parse(trustedExtensionSrc);
            }
        }
        catch (err) { }
        return trustedExtensions;
    }
    exports.$RV = $RV;
    // OAuth2 spec prohibits space in a scope, so use that to join them.
    const SCOPESLIST_SEPARATOR = ' ';
    commands_1.$Gr.registerCommand('workbench.getCodeExchangeProxyEndpoints', function (accessor, _) {
        const environmentService = accessor.get(environmentService_1.$LT);
        return environmentService.options?.codeExchangeProxyEndpoints;
    });
    const authenticationDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                description: nls.localize(0, null)
            },
            label: {
                type: 'string',
                description: nls.localize(1, null),
            }
        }
    };
    const authenticationExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'authentication',
        jsonSchema: {
            description: nls.localize(2, null),
            type: 'array',
            items: authenticationDefinitionSchema
        },
        activationEventsGenerator: (authenticationProviders, result) => {
            for (const authenticationProvider of authenticationProviders) {
                if (authenticationProvider.id) {
                    result.push(`onAuthenticationRequest:${authenticationProvider.id}`);
                }
            }
        }
    });
    let placeholderMenuItem = actions_1.$Tu.appendMenuItem(actions_1.$Ru.AccountsContext, {
        command: {
            id: 'noAuthenticationProviders',
            title: nls.localize(3, null),
            precondition: contextkey_1.$Ii.false()
        },
    });
    let $SV = class $SV extends lifecycle_1.$kc {
        constructor(n, s, t, u, w, y) {
            super();
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.a = new Map();
            this.b = new Map();
            this.c = this.B(new lifecycle_1.$lc());
            this.f = new Map();
            /**
             * All providers that have been statically declared by extensions. These may not be registered.
             */
            this.declaredProviders = [];
            this.g = this.B(new event_1.$fd());
            this.onDidRegisterAuthenticationProvider = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidUnregisterAuthenticationProvider = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeSessions = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeDeclaredProviders = this.m.event;
            authenticationExtPoint.setHandler((extensions, { added, removed }) => {
                added.forEach(point => {
                    for (const provider of point.value) {
                        if ((0, strings_1.$me)(provider.id)) {
                            point.collector.error(nls.localize(4, null));
                            continue;
                        }
                        if ((0, strings_1.$me)(provider.label)) {
                            point.collector.error(nls.localize(5, null));
                            continue;
                        }
                        if (!this.declaredProviders.some(p => p.id === provider.id)) {
                            this.declaredProviders.push(provider);
                        }
                        else {
                            point.collector.error(nls.localize(6, null, provider.id));
                        }
                    }
                });
                const removedExtPoints = (0, arrays_1.$Pb)(removed.map(r => r.value));
                removedExtPoints.forEach(point => {
                    const index = this.declaredProviders.findIndex(provider => provider.id === point.id);
                    if (index > -1) {
                        this.declaredProviders.splice(index, 1);
                    }
                });
                this.m.fire(this.declaredProviders);
            });
        }
        getProviderIds() {
            const providerIds = [];
            this.f.forEach(provider => {
                providerIds.push(provider.id);
            });
            return providerIds;
        }
        isAuthenticationProviderRegistered(id) {
            return this.f.has(id);
        }
        registerAuthenticationProvider(id, authenticationProvider) {
            this.f.set(id, authenticationProvider);
            this.g.fire({ id, label: authenticationProvider.label });
            if (placeholderMenuItem) {
                placeholderMenuItem.dispose();
                placeholderMenuItem = undefined;
            }
        }
        unregisterAuthenticationProvider(id) {
            const provider = this.f.get(id);
            if (provider) {
                provider.dispose();
                this.f.delete(id);
                this.h.fire({ id, label: provider.label });
                const accessRequests = this.b.get(id) || {};
                Object.keys(accessRequests).forEach(extensionId => {
                    this.F(id, extensionId);
                });
            }
            if (!this.f.size) {
                placeholderMenuItem = actions_1.$Tu.appendMenuItem(actions_1.$Ru.AccountsContext, {
                    command: {
                        id: 'noAuthenticationProviders',
                        title: nls.localize(7, null),
                        precondition: contextkey_1.$Ii.false()
                    },
                });
            }
        }
        async sessionsUpdate(id, event) {
            const provider = this.f.get(id);
            if (provider) {
                this.j.fire({ providerId: id, label: provider.label, event: event });
                if (event.added) {
                    await this.z(provider, event.added);
                }
                if (event.removed) {
                    await this.C(id, event.removed);
                }
                this.D();
            }
        }
        async z(provider, addedSessions) {
            const existingRequestsForProvider = this.a.get(provider.id);
            if (!existingRequestsForProvider) {
                return;
            }
            Object.keys(existingRequestsForProvider).forEach(requestedScopes => {
                if (addedSessions.some(session => session.scopes.slice().join(SCOPESLIST_SEPARATOR) === requestedScopes)) {
                    const sessionRequest = existingRequestsForProvider[requestedScopes];
                    sessionRequest?.disposables.forEach(item => item.dispose());
                    delete existingRequestsForProvider[requestedScopes];
                    if (Object.keys(existingRequestsForProvider).length === 0) {
                        this.a.delete(provider.id);
                    }
                    else {
                        this.a.set(provider.id, existingRequestsForProvider);
                    }
                }
            });
        }
        async C(providerId, removedSessions) {
            const providerRequests = this.b.get(providerId);
            if (providerRequests) {
                Object.keys(providerRequests).forEach(extensionId => {
                    removedSessions.forEach(removed => {
                        const indexOfSession = providerRequests[extensionId].possibleSessions.findIndex(session => session.id === removed.id);
                        if (indexOfSession) {
                            providerRequests[extensionId].possibleSessions.splice(indexOfSession, 1);
                        }
                    });
                    if (!providerRequests[extensionId].possibleSessions.length) {
                        this.F(providerId, extensionId);
                    }
                });
            }
        }
        D() {
            this.c.clear();
            let numberOfRequests = 0;
            this.a.forEach(providerRequests => {
                Object.keys(providerRequests).forEach(request => {
                    numberOfRequests += providerRequests[request].requestingExtensionIds.length;
                });
            });
            this.b.forEach(accessRequest => {
                numberOfRequests += Object.keys(accessRequest).length;
            });
            if (numberOfRequests > 0) {
                const badge = new activity_1.$IV(numberOfRequests, () => nls.localize(8, null));
                this.c.value = this.n.showAccountsActivity({ badge });
            }
        }
        F(providerId, extensionId) {
            const providerRequests = this.b.get(providerId) || {};
            if (providerRequests[extensionId]) {
                (0, lifecycle_1.$fc)(providerRequests[extensionId].disposables);
                delete providerRequests[extensionId];
                this.D();
            }
        }
        /**
         * Check extension access to an account
         * @param providerId The id of the authentication provider
         * @param accountName The account name that access is checked for
         * @param extensionId The id of the extension requesting access
         * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
         * if they haven't made a choice yet
         */
        isAccessAllowed(providerId, accountName, extensionId) {
            const allowList = $RV(this.t, providerId, accountName);
            const extensionData = allowList.find(extension => extension.id === extensionId);
            if (extensionData) {
                // This property didn't exist on this data previously, inclusion in the list at all indicates allowance
                return extensionData.allowed !== undefined
                    ? extensionData.allowed
                    : true;
            }
            if (this.y.trustedExtensionAuthAccess?.includes(extensionId)) {
                return true;
            }
            return undefined;
        }
        updateAllowedExtension(providerId, accountName, extensionId, extensionName, isAllowed) {
            const allowList = $RV(this.t, providerId, accountName);
            const index = allowList.findIndex(extension => extension.id === extensionId);
            if (index === -1) {
                allowList.push({ id: extensionId, name: extensionName, allowed: isAllowed });
            }
            else {
                allowList[index].allowed = isAllowed;
            }
            this.t.store(`${providerId}-${accountName}`, JSON.stringify(allowList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        //#region Session Preference
        updateSessionPreference(providerId, extensionId, session) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${session.scopes.join(' ')}`;
            // Store the preference in the workspace and application storage. This allows new workspaces to
            // have a preference set already to limit the number of prompts that are shown... but also allows
            // a specific workspace to override the global preference.
            this.t.store(key, session.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.t.store(key, session.id, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        getSessionPreference(providerId, extensionId, scopes) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${scopes.join(' ')}`;
            // If a preference is set in the workspace, use that. Otherwise, use the global preference.
            return this.t.get(key, 1 /* StorageScope.WORKSPACE */) ?? this.t.get(key, -1 /* StorageScope.APPLICATION */);
        }
        removeSessionPreference(providerId, extensionId, scopes) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${scopes.join(' ')}`;
            // This won't affect any other workspaces that have a preference set, but it will remove the preference
            // for this workspace and the global preference. This is only paired with a call to updateSessionPreference...
            // so we really don't _need_ to remove them as they are about to be overridden anyway... but it's more correct
            // to remove them first... and in case this gets called from somewhere else in the future.
            this.t.remove(key, 1 /* StorageScope.WORKSPACE */);
            this.t.remove(key, -1 /* StorageScope.APPLICATION */);
        }
        //#endregion
        async showGetSessionPrompt(providerId, accountName, extensionId, extensionName) {
            const providerName = this.getLabel(providerId);
            let SessionPromptChoice;
            (function (SessionPromptChoice) {
                SessionPromptChoice[SessionPromptChoice["Allow"] = 0] = "Allow";
                SessionPromptChoice[SessionPromptChoice["Deny"] = 1] = "Deny";
                SessionPromptChoice[SessionPromptChoice["Cancel"] = 2] = "Cancel";
            })(SessionPromptChoice || (SessionPromptChoice = {}));
            const { result } = await this.u.prompt({
                type: notification_1.Severity.Info,
                message: nls.localize(9, null, extensionName, providerName, accountName),
                buttons: [
                    {
                        label: nls.localize(10, null),
                        run: () => SessionPromptChoice.Allow
                    },
                    {
                        label: nls.localize(11, null),
                        run: () => SessionPromptChoice.Deny
                    }
                ],
                cancelButton: {
                    run: () => SessionPromptChoice.Cancel
                }
            });
            if (result !== SessionPromptChoice.Cancel) {
                this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, result === SessionPromptChoice.Allow);
                this.F(providerId, extensionId);
            }
            return result === SessionPromptChoice.Allow;
        }
        async selectSession(providerId, extensionId, extensionName, scopes, availableSessions) {
            return new Promise((resolve, reject) => {
                // This function should be used only when there are sessions to disambiguate.
                if (!availableSessions.length) {
                    reject('No available sessions');
                }
                const quickPick = this.w.createQuickPick();
                quickPick.ignoreFocusOut = true;
                const items = availableSessions.map(session => {
                    return {
                        label: session.account.label,
                        session: session
                    };
                });
                items.push({
                    label: nls.localize(12, null)
                });
                const providerName = this.getLabel(providerId);
                quickPick.items = items;
                quickPick.title = nls.localize(13, null, extensionName, providerName);



                quickPick.placeholder = nls.localize(14, null, extensionName);
                quickPick.onDidAccept(async (_) => {
                    const session = quickPick.selectedItems[0].session ?? await this.createSession(providerId, scopes);
                    const accountName = session.account.label;
                    this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, true);
                    this.updateSessionPreference(providerId, extensionId, session);
                    this.F(providerId, extensionId);
                    quickPick.dispose();
                    resolve(session);
                });
                quickPick.onDidHide(_ => {
                    if (!quickPick.selectedItems[0]) {
                        reject('User did not consent to account access');
                    }
                    quickPick.dispose();
                });
                quickPick.show();
            });
        }
        async completeSessionAccessRequest(providerId, extensionId, extensionName, scopes) {
            const providerRequests = this.b.get(providerId) || {};
            const existingRequest = providerRequests[extensionId];
            if (!existingRequest) {
                return;
            }
            const possibleSessions = existingRequest.possibleSessions;
            const supportsMultipleAccounts = this.supportsMultipleAccounts(providerId);
            let session;
            if (supportsMultipleAccounts) {
                try {
                    session = await this.selectSession(providerId, extensionId, extensionName, scopes, possibleSessions);
                }
                catch (_) {
                    // ignore cancel
                }
            }
            else {
                const approved = await this.showGetSessionPrompt(providerId, possibleSessions[0].account.label, extensionId, extensionName);
                if (approved) {
                    session = possibleSessions[0];
                }
            }
            if (session) {
                $PV(this.t, providerId, session.account.label, extensionId, extensionName);
                const providerName = this.getLabel(providerId);
                this.j.fire({ providerId, label: providerName, event: { added: [], removed: [], changed: [session] } });
            }
        }
        requestSessionAccess(providerId, extensionId, extensionName, scopes, possibleSessions) {
            const providerRequests = this.b.get(providerId) || {};
            const hasExistingRequest = providerRequests[extensionId];
            if (hasExistingRequest) {
                return;
            }
            const menuItem = actions_1.$Tu.appendMenuItem(actions_1.$Ru.AccountsContext, {
                group: '3_accessRequests',
                command: {
                    id: `${providerId}${extensionId}Access`,
                    title: nls.localize(15, null, this.getLabel(providerId), extensionName)



                }
            });
            const accessCommand = commands_1.$Gr.registerCommand({
                id: `${providerId}${extensionId}Access`,
                handler: async (accessor) => {
                    const authenticationService = accessor.get(authentication_1.$3I);
                    authenticationService.completeSessionAccessRequest(providerId, extensionId, extensionName, scopes);
                }
            });
            providerRequests[extensionId] = { possibleSessions, disposables: [menuItem, accessCommand] };
            this.b.set(providerId, providerRequests);
            this.D();
        }
        async requestNewSession(providerId, scopes, extensionId, extensionName) {
            let provider = this.f.get(providerId);
            if (!provider) {
                // Activate has already been called for the authentication provider, but it cannot block on registering itself
                // since this is sync and returns a disposable. So, wait for registration event to fire that indicates the
                // provider is now in the map.
                await new Promise((resolve, _) => {
                    const dispose = this.onDidRegisterAuthenticationProvider(e => {
                        if (e.id === providerId) {
                            provider = this.f.get(providerId);
                            dispose.dispose();
                            resolve();
                        }
                    });
                });
            }
            if (!provider) {
                return;
            }
            const providerRequests = this.a.get(providerId);
            const scopesList = scopes.join(SCOPESLIST_SEPARATOR);
            const extensionHasExistingRequest = providerRequests
                && providerRequests[scopesList]
                && providerRequests[scopesList].requestingExtensionIds.includes(extensionId);
            if (extensionHasExistingRequest) {
                return;
            }
            // Construct a commandId that won't clash with others generated here, nor likely with an extension's command
            const commandId = `${providerId}:${extensionId}:signIn${Object.keys(providerRequests || []).length}`;
            const menuItem = actions_1.$Tu.appendMenuItem(actions_1.$Ru.AccountsContext, {
                group: '2_signInRequests',
                command: {
                    id: commandId,
                    title: nls.localize(16, null, provider.label, extensionName)



                }
            });
            const signInCommand = commands_1.$Gr.registerCommand({
                id: commandId,
                handler: async (accessor) => {
                    const authenticationService = accessor.get(authentication_1.$3I);
                    const session = await authenticationService.createSession(providerId, scopes);
                    this.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
                    this.updateSessionPreference(providerId, extensionId, session);
                }
            });
            if (providerRequests) {
                const existingRequest = providerRequests[scopesList] || { disposables: [], requestingExtensionIds: [] };
                providerRequests[scopesList] = {
                    disposables: [...existingRequest.disposables, menuItem, signInCommand],
                    requestingExtensionIds: [...existingRequest.requestingExtensionIds, extensionId]
                };
                this.a.set(providerId, providerRequests);
            }
            else {
                this.a.set(providerId, {
                    [scopesList]: {
                        disposables: [menuItem, signInCommand],
                        requestingExtensionIds: [extensionId]
                    }
                });
            }
            this.D();
        }
        getLabel(id) {
            const authProvider = this.f.get(id);
            if (authProvider) {
                return authProvider.label;
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        supportsMultipleAccounts(id) {
            const authProvider = this.f.get(id);
            if (authProvider) {
                return authProvider.supportsMultipleAccounts;
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async G(providerId, activateImmediate) {
            await this.s.activateByEvent($MV(providerId), activateImmediate ? 1 /* ActivationKind.Immediate */ : 0 /* ActivationKind.Normal */);
            let provider = this.f.get(providerId);
            if (provider) {
                return provider;
            }
            // When activate has completed, the extension has made the call to `registerAuthenticationProvider`.
            // However, activate cannot block on this, so the renderer may not have gotten the event yet.
            const didRegister = new Promise((resolve, _) => {
                this.onDidRegisterAuthenticationProvider(e => {
                    if (e.id === providerId) {
                        provider = this.f.get(providerId);
                        if (provider) {
                            resolve(provider);
                        }
                        else {
                            throw new Error(`No authentication provider '${providerId}' is currently registered.`);
                        }
                    }
                });
            });
            const didTimeout = new Promise((_, reject) => {
                setTimeout(() => {
                    reject('Timed out waiting for authentication provider to register');
                }, 5000);
            });
            return Promise.race([didRegister, didTimeout]);
        }
        async getSessions(id, scopes, activateImmediate = false) {
            const authProvider = this.f.get(id) || await this.G(id, activateImmediate);
            if (authProvider) {
                return await authProvider.getSessions(scopes);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async createSession(id, scopes, options) {
            const authProvider = this.f.get(id) || await this.G(id, !!options?.activateImmediate);
            if (authProvider) {
                return await authProvider.createSession(scopes, {
                    sessionToRecreate: options?.sessionToRecreate
                });
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async removeSession(id, sessionId) {
            const authProvider = this.f.get(id);
            if (authProvider) {
                return authProvider.removeSession(sessionId);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async manageTrustedExtensionsForAccount(id, accountName) {
            const authProvider = this.f.get(id);
            if (authProvider) {
                return authProvider.manageTrustedExtensions(accountName);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async removeAccountSessions(id, accountName, sessions) {
            const authProvider = this.f.get(id);
            if (authProvider) {
                return authProvider.removeAccountSessions(accountName, sessions);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
    };
    exports.$SV = $SV;
    exports.$SV = $SV = __decorate([
        __param(0, activity_1.$HV),
        __param(1, extensions_2.$MF),
        __param(2, storage_1.$Vo),
        __param(3, dialogs_1.$oA),
        __param(4, quickInput_1.$Gq),
        __param(5, productService_1.$kj)
    ], $SV);
    (0, extensions_1.$mr)(authentication_1.$3I, $SV, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=authenticationService.js.map