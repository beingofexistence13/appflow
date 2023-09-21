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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "../common/extHost.protocol", "vs/platform/dialogs/common/dialogs", "vs/platform/storage/common/storage", "vs/base/common/severity", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/base/common/date", "vs/workbench/services/extensions/common/extensions", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, nls, extHostCustomers_1, authenticationService_1, authentication_1, extHost_protocol_1, dialogs_1, storage_1, severity_1, quickInput_1, notification_1, date_1, extensions_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadAuthentication = exports.MainThreadAuthenticationProvider = void 0;
    class MainThreadAuthenticationProvider extends lifecycle_1.Disposable {
        constructor(_proxy, id, label, supportsMultipleAccounts, notificationService, storageService, quickInputService, dialogService) {
            super();
            this._proxy = _proxy;
            this.id = id;
            this.label = label;
            this.supportsMultipleAccounts = supportsMultipleAccounts;
            this.notificationService = notificationService;
            this.storageService = storageService;
            this.quickInputService = quickInputService;
            this.dialogService = dialogService;
        }
        manageTrustedExtensions(accountName) {
            const allowedExtensions = (0, authenticationService_1.readAllowedExtensions)(this.storageService, this.id, accountName);
            if (!allowedExtensions.length) {
                this.dialogService.info(nls.localize('noTrustedExtensions', "This account has not been used by any extensions."));
                return;
            }
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.canSelectMany = true;
            quickPick.customButton = true;
            quickPick.customLabel = nls.localize('manageTrustedExtensions.cancel', 'Cancel');
            const usages = (0, authenticationService_1.readAccountUsages)(this.storageService, this.id, accountName);
            const items = allowedExtensions.map(extension => {
                const usage = usages.find(usage => extension.id === usage.extensionId);
                return {
                    label: extension.name,
                    description: usage
                        ? nls.localize({ key: 'accountLastUsedDate', comment: ['The placeholder {0} is a string with time information, such as "3 days ago"'] }, "Last used this account {0}", (0, date_1.fromNow)(usage.lastUsed, true))
                        : nls.localize('notUsed', "Has not used this account"),
                    extension
                };
            });
            quickPick.items = items;
            quickPick.selectedItems = items.filter(item => item.extension.allowed === undefined || item.extension.allowed);
            quickPick.title = nls.localize('manageTrustedExtensions', "Manage Trusted Extensions");
            quickPick.placeholder = nls.localize('manageExtensions', "Choose which extensions can access this account");
            quickPick.onDidAccept(() => {
                const updatedAllowedList = quickPick.items
                    .map(i => i.extension);
                this.storageService.store(`${this.id}-${accountName}`, JSON.stringify(updatedAllowedList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                quickPick.dispose();
            });
            quickPick.onDidChangeSelection((changed) => {
                quickPick.items.forEach(item => {
                    if (item.extension) {
                        item.extension.allowed = false;
                    }
                });
                changed.forEach((item) => item.extension.allowed = true);
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.onDidCustom(() => {
                quickPick.hide();
            });
            quickPick.show();
        }
        async removeAccountSessions(accountName, sessions) {
            const accountUsages = (0, authenticationService_1.readAccountUsages)(this.storageService, this.id, accountName);
            const { confirmed } = await this.dialogService.confirm({
                type: severity_1.default.Info,
                message: accountUsages.length
                    ? nls.localize('signOutMessage', "The account '{0}' has been used by: \n\n{1}\n\n Sign out from these extensions?", accountName, accountUsages.map(usage => usage.extensionName).join('\n'))
                    : nls.localize('signOutMessageSimple', "Sign out of '{0}'?", accountName),
                primaryButton: nls.localize({ key: 'signOut', comment: ['&& denotes a mnemonic'] }, "&&Sign Out")
            });
            if (confirmed) {
                const removeSessionPromises = sessions.map(session => this.removeSession(session.id));
                await Promise.all(removeSessionPromises);
                (0, authenticationService_1.removeAccountUsage)(this.storageService, this.id, accountName);
                this.storageService.remove(`${this.id}-${accountName}`, -1 /* StorageScope.APPLICATION */);
            }
        }
        async getSessions(scopes) {
            return this._proxy.$getSessions(this.id, scopes);
        }
        createSession(scopes, options) {
            return this._proxy.$createSession(this.id, scopes, options);
        }
        async removeSession(sessionId) {
            await this._proxy.$removeSession(this.id, sessionId);
            this.notificationService.info(nls.localize('signedOut', "Successfully signed out."));
        }
    }
    exports.MainThreadAuthenticationProvider = MainThreadAuthenticationProvider;
    let MainThreadAuthentication = class MainThreadAuthentication extends lifecycle_1.Disposable {
        constructor(extHostContext, authenticationService, dialogService, storageService, notificationService, quickInputService, extensionService, telemetryService) {
            super();
            this.authenticationService = authenticationService;
            this.dialogService = dialogService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.quickInputService = quickInputService;
            this.extensionService = extensionService;
            this.telemetryService = telemetryService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostAuthentication);
            this._register(this.authenticationService.onDidChangeSessions(e => {
                this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label);
            }));
            this._proxy.$setProviders(this.authenticationService.declaredProviders);
            this._register(this.authenticationService.onDidChangeDeclaredProviders(e => {
                this._proxy.$setProviders(e);
            }));
        }
        async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
            const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, this.notificationService, this.storageService, this.quickInputService, this.dialogService);
            this.authenticationService.registerAuthenticationProvider(id, provider);
        }
        $unregisterAuthenticationProvider(id) {
            this.authenticationService.unregisterAuthenticationProvider(id);
        }
        $ensureProvider(id) {
            return this.extensionService.activateByEvent((0, authenticationService_1.getAuthenticationProviderActivationEvent)(id), 1 /* ActivationKind.Immediate */);
        }
        $sendDidChangeSessions(id, event) {
            this.authenticationService.sessionsUpdate(id, event);
        }
        $removeSession(providerId, sessionId) {
            return this.authenticationService.removeSession(providerId, sessionId);
        }
        async loginPrompt(providerName, extensionName, recreatingSession, detail) {
            const message = recreatingSession
                ? nls.localize('confirmRelogin', "The extension '{0}' wants you to sign in again using {1}.", extensionName, providerName)
                : nls.localize('confirmLogin', "The extension '{0}' wants to sign in using {1}.", extensionName, providerName);
            const { confirmed } = await this.dialogService.confirm({
                type: severity_1.default.Info,
                message,
                detail,
                primaryButton: nls.localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow")
            });
            return confirmed;
        }
        async doGetSession(providerId, scopes, extensionId, extensionName, options) {
            const sessions = await this.authenticationService.getSessions(providerId, scopes, true);
            const supportsMultipleAccounts = this.authenticationService.supportsMultipleAccounts(providerId);
            // Error cases
            if (options.forceNewSession && options.createIfNone) {
                throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, createIfNone');
            }
            if (options.forceNewSession && options.silent) {
                throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, silent');
            }
            if (options.createIfNone && options.silent) {
                throw new Error('Invalid combination of options. Please remove one of the following: createIfNone, silent');
            }
            // Check if the sessions we have are valid
            if (!options.forceNewSession && sessions.length) {
                if (supportsMultipleAccounts) {
                    if (options.clearSessionPreference) {
                        // Clearing the session preference is usually paired with createIfNone, so just remove the preference and
                        // defer to the rest of the logic in this function to choose the session.
                        this.authenticationService.removeSessionPreference(providerId, extensionId, scopes);
                    }
                    else {
                        // If we have an existing session preference, use that. If not, we'll return any valid session at the end of this function.
                        const existingSessionPreference = this.authenticationService.getSessionPreference(providerId, extensionId, scopes);
                        if (existingSessionPreference) {
                            const matchingSession = sessions.find(session => session.id === existingSessionPreference);
                            if (matchingSession && this.authenticationService.isAccessAllowed(providerId, matchingSession.account.label, extensionId)) {
                                return matchingSession;
                            }
                        }
                    }
                }
                else if (this.authenticationService.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
                    return sessions[0];
                }
            }
            // We may need to prompt because we don't have a valid session
            // modal flows
            if (options.createIfNone || options.forceNewSession) {
                const providerName = this.authenticationService.getLabel(providerId);
                const detail = (typeof options.forceNewSession === 'object') ? options.forceNewSession.detail : undefined;
                // We only want to show the "recreating session" prompt if we are using forceNewSession & there are sessions
                // that we will be "forcing through".
                const recreatingSession = !!(options.forceNewSession && sessions.length);
                const isAllowed = await this.loginPrompt(providerName, extensionName, recreatingSession, detail);
                if (!isAllowed) {
                    throw new Error('User did not consent to login.');
                }
                let session;
                if (sessions?.length && !options.forceNewSession && supportsMultipleAccounts) {
                    session = await this.authenticationService.selectSession(providerId, extensionId, extensionName, scopes, sessions);
                }
                else {
                    let sessionToRecreate;
                    if (typeof options.forceNewSession === 'object' && options.forceNewSession.sessionToRecreate) {
                        sessionToRecreate = options.forceNewSession.sessionToRecreate;
                    }
                    else {
                        const sessionIdToRecreate = this.authenticationService.getSessionPreference(providerId, extensionId, scopes);
                        sessionToRecreate = sessionIdToRecreate ? sessions.find(session => session.id === sessionIdToRecreate) : undefined;
                    }
                    session = await this.authenticationService.createSession(providerId, scopes, { activateImmediate: true, sessionToRecreate });
                }
                this.authenticationService.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
                this.authenticationService.updateSessionPreference(providerId, extensionId, session);
                return session;
            }
            // For the silent flows, if we have a session, even though it may not be the user's preference, we'll return it anyway because it might be for a specific
            // set of scopes.
            const validSession = sessions.find(session => this.authenticationService.isAccessAllowed(providerId, session.account.label, extensionId));
            if (validSession) {
                // Migration. If we have a valid session, but no preference, we'll set the preference to the valid session.
                // TODO: Remove this after in a few releases.
                if (!this.authenticationService.getSessionPreference(providerId, extensionId, scopes)) {
                    if (this.storageService.get(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */)) {
                        this.storageService.remove(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */);
                    }
                    this.authenticationService.updateAllowedExtension(providerId, validSession.account.label, extensionId, extensionName, true);
                    this.authenticationService.updateSessionPreference(providerId, extensionId, validSession);
                }
                return validSession;
            }
            // passive flows (silent or default)
            if (!options.silent) {
                // If there is a potential session, but the extension doesn't have access to it, use the "grant access" flow,
                // otherwise request a new one.
                sessions.length
                    ? this.authenticationService.requestSessionAccess(providerId, extensionId, extensionName, scopes, sessions)
                    : await this.authenticationService.requestNewSession(providerId, scopes, extensionId, extensionName);
            }
            return undefined;
        }
        async $getSession(providerId, scopes, extensionId, extensionName, options) {
            const session = await this.doGetSession(providerId, scopes, extensionId, extensionName, options);
            if (session) {
                this.sendProviderUsageTelemetry(extensionId, providerId);
                (0, authenticationService_1.addAccountUsage)(this.storageService, providerId, session.account.label, extensionId, extensionName);
            }
            return session;
        }
        async $getSessions(providerId, scopes, extensionId, extensionName) {
            const sessions = await this.authenticationService.getSessions(providerId, [...scopes], true);
            const accessibleSessions = sessions.filter(s => this.authenticationService.isAccessAllowed(providerId, s.account.label, extensionId));
            if (accessibleSessions.length) {
                this.sendProviderUsageTelemetry(extensionId, providerId);
                for (const session of accessibleSessions) {
                    (0, authenticationService_1.addAccountUsage)(this.storageService, providerId, session.account.label, extensionId, extensionName);
                }
            }
            return accessibleSessions;
        }
        sendProviderUsageTelemetry(extensionId, providerId) {
            this.telemetryService.publicLog2('authentication.providerUsage', { providerId, extensionId });
        }
    };
    exports.MainThreadAuthentication = MainThreadAuthentication;
    exports.MainThreadAuthentication = MainThreadAuthentication = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadAuthentication),
        __param(1, authentication_1.IAuthenticationService),
        __param(2, dialogs_1.IDialogService),
        __param(3, storage_1.IStorageService),
        __param(4, notification_1.INotificationService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, extensions_1.IExtensionService),
        __param(7, telemetry_1.ITelemetryService)
    ], MainThreadAuthentication);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEF1dGhlbnRpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRBdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLE1BQWEsZ0NBQWlDLFNBQVEsc0JBQVU7UUFDL0QsWUFDa0IsTUFBa0MsRUFDbkMsRUFBVSxFQUNWLEtBQWEsRUFDYix3QkFBaUMsRUFDaEMsbUJBQXlDLEVBQ3pDLGNBQStCLEVBQy9CLGlCQUFxQyxFQUNyQyxhQUE2QjtZQUU5QyxLQUFLLEVBQUUsQ0FBQztZQVRTLFdBQU0sR0FBTixNQUFNLENBQTRCO1lBQ25DLE9BQUUsR0FBRixFQUFFLENBQVE7WUFDVixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUFTO1lBQ2hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDekMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDckMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1FBRy9DLENBQUM7UUFDTSx1QkFBdUIsQ0FBQyxXQUFtQjtZQUNqRCxNQUFNLGlCQUFpQixHQUFHLElBQUEsNkNBQXFCLEVBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRTNGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsbURBQW1ELENBQUMsQ0FBQyxDQUFDO2dCQUNsSCxPQUFPO2FBQ1A7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJB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