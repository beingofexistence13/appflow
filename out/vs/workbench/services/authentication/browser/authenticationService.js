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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/services/activity/common/activity", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, arrays_1, event_1, lifecycle_1, strings_1, types_1, nls, actions_1, commands_1, contextkey_1, dialogs_1, extensions_1, notification_1, productService_1, quickInput_1, storage_1, activity_1, authentication_1, environmentService_1, extensions_2, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthenticationService = exports.readAllowedExtensions = exports.getCurrentAuthenticationSessionInfo = exports.addAccountUsage = exports.removeAccountUsage = exports.readAccountUsages = exports.getAuthenticationProviderActivationEvent = void 0;
    function getAuthenticationProviderActivationEvent(id) { return `onAuthenticationRequest:${id}`; }
    exports.getAuthenticationProviderActivationEvent = getAuthenticationProviderActivationEvent;
    function readAccountUsages(storageService, providerId, accountName) {
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
    exports.readAccountUsages = readAccountUsages;
    function removeAccountUsage(storageService, providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        storageService.remove(accountKey, -1 /* StorageScope.APPLICATION */);
    }
    exports.removeAccountUsage = removeAccountUsage;
    function addAccountUsage(storageService, providerId, accountName, extensionId, extensionName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const usages = readAccountUsages(storageService, providerId, accountName);
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
    exports.addAccountUsage = addAccountUsage;
    async function getCurrentAuthenticationSessionInfo(secretStorageService, productService) {
        const authenticationSessionValue = await secretStorageService.get(`${productService.urlProtocol}.loginAccount`);
        if (authenticationSessionValue) {
            try {
                const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
                if (authenticationSessionInfo
                    && (0, types_1.isString)(authenticationSessionInfo.id)
                    && (0, types_1.isString)(authenticationSessionInfo.accessToken)
                    && (0, types_1.isString)(authenticationSessionInfo.providerId)) {
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
    exports.getCurrentAuthenticationSessionInfo = getCurrentAuthenticationSessionInfo;
    function readAllowedExtensions(storageService, providerId, accountName) {
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
    exports.readAllowedExtensions = readAllowedExtensions;
    // OAuth2 spec prohibits space in a scope, so use that to join them.
    const SCOPESLIST_SEPARATOR = ' ';
    commands_1.CommandsRegistry.registerCommand('workbench.getCodeExchangeProxyEndpoints', function (accessor, _) {
        const environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
        return environmentService.options?.codeExchangeProxyEndpoints;
    });
    const authenticationDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                description: nls.localize('authentication.id', 'The id of the authentication provider.')
            },
            label: {
                type: 'string',
                description: nls.localize('authentication.label', 'The human readable name of the authentication provider.'),
            }
        }
    };
    const authenticationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'authentication',
        jsonSchema: {
            description: nls.localize({ key: 'authenticationExtensionPoint', comment: [`'Contributes' means adds here`] }, 'Contributes authentication'),
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
    let placeholderMenuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
        command: {
            id: 'noAuthenticationProviders',
            title: nls.localize('authentication.Placeholder', "No accounts requested yet..."),
            precondition: contextkey_1.ContextKeyExpr.false()
        },
    });
    let AuthenticationService = class AuthenticationService extends lifecycle_1.Disposable {
        constructor(activityService, extensionService, storageService, dialogService, quickInputService, productService) {
            super();
            this.activityService = activityService;
            this.extensionService = extensionService;
            this.storageService = storageService;
            this.dialogService = dialogService;
            this.quickInputService = quickInputService;
            this.productService = productService;
            this._signInRequestItems = new Map();
            this._sessionAccessRequestItems = new Map();
            this._accountBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this._authenticationProviders = new Map();
            /**
             * All providers that have been statically declared by extensions. These may not be registered.
             */
            this.declaredProviders = [];
            this._onDidRegisterAuthenticationProvider = this._register(new event_1.Emitter());
            this.onDidRegisterAuthenticationProvider = this._onDidRegisterAuthenticationProvider.event;
            this._onDidUnregisterAuthenticationProvider = this._register(new event_1.Emitter());
            this.onDidUnregisterAuthenticationProvider = this._onDidUnregisterAuthenticationProvider.event;
            this._onDidChangeSessions = this._register(new event_1.Emitter());
            this.onDidChangeSessions = this._onDidChangeSessions.event;
            this._onDidChangeDeclaredProviders = this._register(new event_1.Emitter());
            this.onDidChangeDeclaredProviders = this._onDidChangeDeclaredProviders.event;
            authenticationExtPoint.setHandler((extensions, { added, removed }) => {
                added.forEach(point => {
                    for (const provider of point.value) {
                        if ((0, strings_1.isFalsyOrWhitespace)(provider.id)) {
                            point.collector.error(nls.localize('authentication.missingId', 'An authentication contribution must specify an id.'));
                            continue;
                        }
                        if ((0, strings_1.isFalsyOrWhitespace)(provider.label)) {
                            point.collector.error(nls.localize('authentication.missingLabel', 'An authentication contribution must specify a label.'));
                            continue;
                        }
                        if (!this.declaredProviders.some(p => p.id === provider.id)) {
                            this.declaredProviders.push(provider);
                        }
                        else {
                            point.collector.error(nls.localize('authentication.idConflict', "This authentication id '{0}' has already been registered", provider.id));
                        }
                    }
                });
                const removedExtPoints = (0, arrays_1.flatten)(removed.map(r => r.value));
                removedExtPoints.forEach(point => {
                    const index = this.declaredProviders.findIndex(provider => provider.id === point.id);
                    if (index > -1) {
                        this.declaredProviders.splice(index, 1);
                    }
                });
                this._onDidChangeDeclaredProviders.fire(this.declaredProviders);
            });
        }
        getProviderIds() {
            const providerIds = [];
            this._authenticationProviders.forEach(provider => {
                providerIds.push(provider.id);
            });
            return providerIds;
        }
        isAuthenticationProviderRegistered(id) {
            return this._authenticationProviders.has(id);
        }
        registerAuthenticationProvider(id, authenticationProvider) {
            this._authenticationProviders.set(id, authenticationProvider);
            this._onDidRegisterAuthenticationProvider.fire({ id, label: authenticationProvider.label });
            if (placeholderMenuItem) {
                placeholderMenuItem.dispose();
                placeholderMenuItem = undefined;
            }
        }
        unregisterAuthenticationProvider(id) {
            const provider = this._authenticationProviders.get(id);
            if (provider) {
                provider.dispose();
                this._authenticationProviders.delete(id);
                this._onDidUnregisterAuthenticationProvider.fire({ id, label: provider.label });
                const accessRequests = this._sessionAccessRequestItems.get(id) || {};
                Object.keys(accessRequests).forEach(extensionId => {
                    this.removeAccessRequest(id, extensionId);
                });
            }
            if (!this._authenticationProviders.size) {
                placeholderMenuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                    command: {
                        id: 'noAuthenticationProviders',
                        title: nls.localize('loading', "Loading..."),
                        precondition: contextkey_1.ContextKeyExpr.false()
                    },
                });
            }
        }
        async sessionsUpdate(id, event) {
            const provider = this._authenticationProviders.get(id);
            if (provider) {
                this._onDidChangeSessions.fire({ providerId: id, label: provider.label, event: event });
                if (event.added) {
                    await this.updateNewSessionRequests(provider, event.added);
                }
                if (event.removed) {
                    await this.updateAccessRequests(id, event.removed);
                }
                this.updateBadgeCount();
            }
        }
        async updateNewSessionRequests(provider, addedSessions) {
            const existingRequestsForProvider = this._signInRequestItems.get(provider.id);
            if (!existingRequestsForProvider) {
                return;
            }
            Object.keys(existingRequestsForProvider).forEach(requestedScopes => {
                if (addedSessions.some(session => session.scopes.slice().join(SCOPESLIST_SEPARATOR) === requestedScopes)) {
                    const sessionRequest = existingRequestsForProvider[requestedScopes];
                    sessionRequest?.disposables.forEach(item => item.dispose());
                    delete existingRequestsForProvider[requestedScopes];
                    if (Object.keys(existingRequestsForProvider).length === 0) {
                        this._signInRequestItems.delete(provider.id);
                    }
                    else {
                        this._signInRequestItems.set(provider.id, existingRequestsForProvider);
                    }
                }
            });
        }
        async updateAccessRequests(providerId, removedSessions) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId);
            if (providerRequests) {
                Object.keys(providerRequests).forEach(extensionId => {
                    removedSessions.forEach(removed => {
                        const indexOfSession = providerRequests[extensionId].possibleSessions.findIndex(session => session.id === removed.id);
                        if (indexOfSession) {
                            providerRequests[extensionId].possibleSessions.splice(indexOfSession, 1);
                        }
                    });
                    if (!providerRequests[extensionId].possibleSessions.length) {
                        this.removeAccessRequest(providerId, extensionId);
                    }
                });
            }
        }
        updateBadgeCount() {
            this._accountBadgeDisposable.clear();
            let numberOfRequests = 0;
            this._signInRequestItems.forEach(providerRequests => {
                Object.keys(providerRequests).forEach(request => {
                    numberOfRequests += providerRequests[request].requestingExtensionIds.length;
                });
            });
            this._sessionAccessRequestItems.forEach(accessRequest => {
                numberOfRequests += Object.keys(accessRequest).length;
            });
            if (numberOfRequests > 0) {
                const badge = new activity_1.NumberBadge(numberOfRequests, () => nls.localize('sign in', "Sign in requested"));
                this._accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
            }
        }
        removeAccessRequest(providerId, extensionId) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
            if (providerRequests[extensionId]) {
                (0, lifecycle_1.dispose)(providerRequests[extensionId].disposables);
                delete providerRequests[extensionId];
                this.updateBadgeCount();
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
            const allowList = readAllowedExtensions(this.storageService, providerId, accountName);
            const extensionData = allowList.find(extension => extension.id === extensionId);
            if (extensionData) {
                // This property didn't exist on this data previously, inclusion in the list at all indicates allowance
                return extensionData.allowed !== undefined
                    ? extensionData.allowed
                    : true;
            }
            if (this.productService.trustedExtensionAuthAccess?.includes(extensionId)) {
                return true;
            }
            return undefined;
        }
        updateAllowedExtension(providerId, accountName, extensionId, extensionName, isAllowed) {
            const allowList = readAllowedExtensions(this.storageService, providerId, accountName);
            const index = allowList.findIndex(extension => extension.id === extensionId);
            if (index === -1) {
                allowList.push({ id: extensionId, name: extensionName, allowed: isAllowed });
            }
            else {
                allowList[index].allowed = isAllowed;
            }
            this.storageService.store(`${providerId}-${accountName}`, JSON.stringify(allowList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
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
            this.storageService.store(key, session.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.storageService.store(key, session.id, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        getSessionPreference(providerId, extensionId, scopes) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${scopes.join(' ')}`;
            // If a preference is set in the workspace, use that. Otherwise, use the global preference.
            return this.storageService.get(key, 1 /* StorageScope.WORKSPACE */) ?? this.storageService.get(key, -1 /* StorageScope.APPLICATION */);
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
            this.storageService.remove(key, 1 /* StorageScope.WORKSPACE */);
            this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
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
            const { result } = await this.dialogService.prompt({
                type: notification_1.Severity.Info,
                message: nls.localize('confirmAuthenticationAccess', "The extension '{0}' wants to access the {1} account '{2}'.", extensionName, providerName, accountName),
                buttons: [
                    {
                        label: nls.localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow"),
                        run: () => SessionPromptChoice.Allow
                    },
                    {
                        label: nls.localize({ key: 'deny', comment: ['&& denotes a mnemonic'] }, "&&Deny"),
                        run: () => SessionPromptChoice.Deny
                    }
                ],
                cancelButton: {
                    run: () => SessionPromptChoice.Cancel
                }
            });
            if (result !== SessionPromptChoice.Cancel) {
                this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, result === SessionPromptChoice.Allow);
                this.removeAccessRequest(providerId, extensionId);
            }
            return result === SessionPromptChoice.Allow;
        }
        async selectSession(providerId, extensionId, extensionName, scopes, availableSessions) {
            return new Promise((resolve, reject) => {
                // This function should be used only when there are sessions to disambiguate.
                if (!availableSessions.length) {
                    reject('No available sessions');
                }
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.ignoreFocusOut = true;
                const items = availableSessions.map(session => {
                    return {
                        label: session.account.label,
                        session: session
                    };
                });
                items.push({
                    label: nls.localize('useOtherAccount', "Sign in to another account")
                });
                const providerName = this.getLabel(providerId);
                quickPick.items = items;
                quickPick.title = nls.localize({
                    key: 'selectAccount',
                    comment: ['The placeholder {0} is the name of an extension. {1} is the name of the type of account, such as Microsoft or GitHub.']
                }, "The extension '{0}' wants to access a {1} account", extensionName, providerName);
                quickPick.placeholder = nls.localize('getSessionPlateholder', "Select an account for '{0}' to use or Esc to cancel", extensionName);
                quickPick.onDidAccept(async (_) => {
                    const session = quickPick.selectedItems[0].session ?? await this.createSession(providerId, scopes);
                    const accountName = session.account.label;
                    this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, true);
                    this.updateSessionPreference(providerId, extensionId, session);
                    this.removeAccessRequest(providerId, extensionId);
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
            const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
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
                addAccountUsage(this.storageService, providerId, session.account.label, extensionId, extensionName);
                const providerName = this.getLabel(providerId);
                this._onDidChangeSessions.fire({ providerId, label: providerName, event: { added: [], removed: [], changed: [session] } });
            }
        }
        requestSessionAccess(providerId, extensionId, extensionName, scopes, possibleSessions) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
            const hasExistingRequest = providerRequests[extensionId];
            if (hasExistingRequest) {
                return;
            }
            const menuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                group: '3_accessRequests',
                command: {
                    id: `${providerId}${extensionId}Access`,
                    title: nls.localize({
                        key: 'accessRequest',
                        comment: [`The placeholder {0} will be replaced with an authentication provider''s label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count`]
                    }, "Grant access to {0} for {1}... (1)", this.getLabel(providerId), extensionName)
                }
            });
            const accessCommand = commands_1.CommandsRegistry.registerCommand({
                id: `${providerId}${extensionId}Access`,
                handler: async (accessor) => {
                    const authenticationService = accessor.get(authentication_1.IAuthenticationService);
                    authenticationService.completeSessionAccessRequest(providerId, extensionId, extensionName, scopes);
                }
            });
            providerRequests[extensionId] = { possibleSessions, disposables: [menuItem, accessCommand] };
            this._sessionAccessRequestItems.set(providerId, providerRequests);
            this.updateBadgeCount();
        }
        async requestNewSession(providerId, scopes, extensionId, extensionName) {
            let provider = this._authenticationProviders.get(providerId);
            if (!provider) {
                // Activate has already been called for the authentication provider, but it cannot block on registering itself
                // since this is sync and returns a disposable. So, wait for registration event to fire that indicates the
                // provider is now in the map.
                await new Promise((resolve, _) => {
                    const dispose = this.onDidRegisterAuthenticationProvider(e => {
                        if (e.id === providerId) {
                            provider = this._authenticationProviders.get(providerId);
                            dispose.dispose();
                            resolve();
                        }
                    });
                });
            }
            if (!provider) {
                return;
            }
            const providerRequests = this._signInRequestItems.get(providerId);
            const scopesList = scopes.join(SCOPESLIST_SEPARATOR);
            const extensionHasExistingRequest = providerRequests
                && providerRequests[scopesList]
                && providerRequests[scopesList].requestingExtensionIds.includes(extensionId);
            if (extensionHasExistingRequest) {
                return;
            }
            // Construct a commandId that won't clash with others generated here, nor likely with an extension's command
            const commandId = `${providerId}:${extensionId}:signIn${Object.keys(providerRequests || []).length}`;
            const menuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                group: '2_signInRequests',
                command: {
                    id: commandId,
                    title: nls.localize({
                        key: 'signInRequest',
                        comment: [`The placeholder {0} will be replaced with an authentication provider's label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count.`]
                    }, "Sign in with {0} to use {1} (1)", provider.label, extensionName)
                }
            });
            const signInCommand = commands_1.CommandsRegistry.registerCommand({
                id: commandId,
                handler: async (accessor) => {
                    const authenticationService = accessor.get(authentication_1.IAuthenticationService);
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
                this._signInRequestItems.set(providerId, providerRequests);
            }
            else {
                this._signInRequestItems.set(providerId, {
                    [scopesList]: {
                        disposables: [menuItem, signInCommand],
                        requestingExtensionIds: [extensionId]
                    }
                });
            }
            this.updateBadgeCount();
        }
        getLabel(id) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.label;
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        supportsMultipleAccounts(id) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.supportsMultipleAccounts;
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async tryActivateProvider(providerId, activateImmediate) {
            await this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(providerId), activateImmediate ? 1 /* ActivationKind.Immediate */ : 0 /* ActivationKind.Normal */);
            let provider = this._authenticationProviders.get(providerId);
            if (provider) {
                return provider;
            }
            // When activate has completed, the extension has made the call to `registerAuthenticationProvider`.
            // However, activate cannot block on this, so the renderer may not have gotten the event yet.
            const didRegister = new Promise((resolve, _) => {
                this.onDidRegisterAuthenticationProvider(e => {
                    if (e.id === providerId) {
                        provider = this._authenticationProviders.get(providerId);
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
            const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, activateImmediate);
            if (authProvider) {
                return await authProvider.getSessions(scopes);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async createSession(id, scopes, options) {
            const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, !!options?.activateImmediate);
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
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.removeSession(sessionId);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async manageTrustedExtensionsForAccount(id, accountName) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.manageTrustedExtensions(accountName);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async removeAccountSessions(id, accountName, sessions) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.removeAccountSessions(accountName, sessions);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
    };
    exports.AuthenticationService = AuthenticationService;
    exports.AuthenticationService = AuthenticationService = __decorate([
        __param(0, activity_1.IActivityService),
        __param(1, extensions_2.IExtensionService),
        __param(2, storage_1.IStorageService),
        __param(3, dialogs_1.IDialogService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, productService_1.IProductService)
    ], AuthenticationService);
    (0, extensions_1.registerSingleton)(authentication_1.IAuthenticationService, AuthenticationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2F1dGhlbnRpY2F0aW9uL2Jyb3dzZXIvYXV0aGVudGljYXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCaEcsU0FBZ0Isd0NBQXdDLENBQUMsRUFBVSxJQUFZLE9BQU8sMkJBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUF4SCw0RkFBd0g7SUFReEgsU0FBZ0IsaUJBQWlCLENBQUMsY0FBK0IsRUFBRSxVQUFrQixFQUFFLFdBQW1CO1FBQ3pHLE1BQU0sVUFBVSxHQUFHLEdBQUcsVUFBVSxJQUFJLFdBQVcsU0FBUyxDQUFDO1FBQ3pELE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxvQ0FBMkIsQ0FBQztRQUM5RSxJQUFJLE1BQU0sR0FBb0IsRUFBRSxDQUFDO1FBQ2pDLElBQUksWUFBWSxFQUFFO1lBQ2pCLElBQUk7Z0JBQ0gsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDbEM7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxTQUFTO2FBQ1Q7U0FDRDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQWJELDhDQWFDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsY0FBK0IsRUFBRSxVQUFrQixFQUFFLFdBQW1CO1FBQzFHLE1BQU0sVUFBVSxHQUFHLEdBQUcsVUFBVSxJQUFJLFdBQVcsU0FBUyxDQUFDO1FBQ3pELGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBVSxvQ0FBMkIsQ0FBQztJQUM3RCxDQUFDO0lBSEQsZ0RBR0M7SUFFRCxTQUFnQixlQUFlLENBQUMsY0FBK0IsRUFBRSxVQUFrQixFQUFFLFdBQW1CLEVBQUUsV0FB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