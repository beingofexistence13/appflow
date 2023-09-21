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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/api/browser/mainThreadAuthentication", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "../common/extHost.protocol", "vs/platform/dialogs/common/dialogs", "vs/platform/storage/common/storage", "vs/base/common/severity", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/base/common/date", "vs/workbench/services/extensions/common/extensions", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, nls, extHostCustomers_1, authenticationService_1, authentication_1, extHost_protocol_1, dialogs_1, storage_1, severity_1, quickInput_1, notification_1, date_1, extensions_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Esb = exports.$Dsb = void 0;
    class $Dsb extends lifecycle_1.$kc {
        constructor(a, id, label, supportsMultipleAccounts, b, c, f, g) {
            super();
            this.a = a;
            this.id = id;
            this.label = label;
            this.supportsMultipleAccounts = supportsMultipleAccounts;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
        }
        manageTrustedExtensions(accountName) {
            const allowedExtensions = (0, authenticationService_1.$RV)(this.c, this.id, accountName);
            if (!allowedExtensions.length) {
                this.g.info(nls.localize(0, null));
                return;
            }
            const quickPick = this.f.createQuickPick();
            quickPick.canSelectMany = true;
            quickPick.customButton = true;
            quickPick.customLabel = nls.localize(1, null);
            const usages = (0, authenticationService_1.$NV)(this.c, this.id, accountName);
            const items = allowedExtensions.map(extension => {
                const usage = usages.find(usage => extension.id === usage.extensionId);
                return {
                    label: extension.name,
                    description: usage
                        ? nls.localize(2, null, (0, date_1.$6l)(usage.lastUsed, true))
                        : nls.localize(3, null),
                    extension
                };
            });
            quickPick.items = items;
            quickPick.selectedItems = items.filter(item => item.extension.allowed === undefined || item.extension.allowed);
            quickPick.title = nls.localize(4, null);
            quickPick.placeholder = nls.localize(5, null);
            quickPick.onDidAccept(() => {
                const updatedAllowedList = quickPick.items
                    .map(i => i.extension);
                this.c.store(`${this.id}-${accountName}`, JSON.stringify(updatedAllowedList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
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
            const accountUsages = (0, authenticationService_1.$NV)(this.c, this.id, accountName);
            const { confirmed } = await this.g.confirm({
                type: severity_1.default.Info,
                message: accountUsages.length
                    ? nls.localize(6, null, accountName, accountUsages.map(usage => usage.extensionName).join('\n'))
                    : nls.localize(7, null, accountName),
                primaryButton: nls.localize(8, null)
            });
            if (confirmed) {
                const removeSessionPromises = sessions.map(session => this.removeSession(session.id));
                await Promise.all(removeSessionPromises);
                (0, authenticationService_1.$OV)(this.c, this.id, accountName);
                this.c.remove(`${this.id}-${accountName}`, -1 /* StorageScope.APPLICATION */);
            }
        }
        async getSessions(scopes) {
            return this.a.$getSessions(this.id, scopes);
        }
        createSession(scopes, options) {
            return this.a.$createSession(this.id, scopes, options);
        }
        async removeSession(sessionId) {
            await this.a.$removeSession(this.id, sessionId);
            this.b.info(nls.localize(9, null));
        }
    }
    exports.$Dsb = $Dsb;
    let $Esb = class $Esb extends lifecycle_1.$kc {
        constructor(extHostContext, b, c, f, g, h, j, m) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostAuthentication);
            this.B(this.b.onDidChangeSessions(e => {
                this.a.$onDidChangeAuthenticationSessions(e.providerId, e.label);
            }));
            this.a.$setProviders(this.b.declaredProviders);
            this.B(this.b.onDidChangeDeclaredProviders(e => {
                this.a.$setProviders(e);
            }));
        }
        async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
            const provider = new $Dsb(this.a, id, label, supportsMultipleAccounts, this.g, this.f, this.h, this.c);
            this.b.registerAuthenticationProvider(id, provider);
        }
        $unregisterAuthenticationProvider(id) {
            this.b.unregisterAuthenticationProvider(id);
        }
        $ensureProvider(id) {
            return this.j.activateByEvent((0, authenticationService_1.$MV)(id), 1 /* ActivationKind.Immediate */);
        }
        $sendDidChangeSessions(id, event) {
            this.b.sessionsUpdate(id, event);
        }
        $removeSession(providerId, sessionId) {
            return this.b.removeSession(providerId, sessionId);
        }
        async n(providerName, extensionName, recreatingSession, detail) {
            const message = recreatingSession
                ? nls.localize(10, null, extensionName, providerName)
                : nls.localize(11, null, extensionName, providerName);
            const { confirmed } = await this.c.confirm({
                type: severity_1.default.Info,
                message,
                detail,
                primaryButton: nls.localize(12, null)
            });
            return confirmed;
        }
        async r(providerId, scopes, extensionId, extensionName, options) {
            const sessions = await this.b.getSessions(providerId, scopes, true);
            const supportsMultipleAccounts = this.b.supportsMultipleAccounts(providerId);
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
                        this.b.removeSessionPreference(providerId, extensionId, scopes);
                    }
                    else {
                        // If we have an existing session preference, use that. If not, we'll return any valid session at the end of this function.
                        const existingSessionPreference = this.b.getSessionPreference(providerId, extensionId, scopes);
                        if (existingSessionPreference) {
                            const matchingSession = sessions.find(session => session.id === existingSessionPreference);
                            if (matchingSession && this.b.isAccessAllowed(providerId, matchingSession.account.label, extensionId)) {
                                return matchingSession;
                            }
                        }
                    }
                }
                else if (this.b.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
                    return sessions[0];
                }
            }
            // We may need to prompt because we don't have a valid session
            // modal flows
            if (options.createIfNone || options.forceNewSession) {
                const providerName = this.b.getLabel(providerId);
                const detail = (typeof options.forceNewSession === 'object') ? options.forceNewSession.detail : undefined;
                // We only want to show the "recreating session" prompt if we are using forceNewSession & there are sessions
                // that we will be "forcing through".
                const recreatingSession = !!(options.forceNewSession && sessions.length);
                const isAllowed = await this.n(providerName, extensionName, recreatingSession, detail);
                if (!isAllowed) {
                    throw new Error('User did not consent to login.');
                }
                let session;
                if (sessions?.length && !options.forceNewSession && supportsMultipleAccounts) {
                    session = await this.b.selectSession(providerId, extensionId, extensionName, scopes, sessions);
                }
                else {
                    let sessionToRecreate;
                    if (typeof options.forceNewSession === 'object' && options.forceNewSession.sessionToRecreate) {
                        sessionToRecreate = options.forceNewSession.sessionToRecreate;
                    }
                    else {
                        const sessionIdToRecreate = this.b.getSessionPreference(providerId, extensionId, scopes);
                        sessionToRecreate = sessionIdToRecreate ? sessions.find(session => session.id === sessionIdToRecreate) : undefined;
                    }
                    session = await this.b.createSession(providerId, scopes, { activateImmediate: true, sessionToRecreate });
                }
                this.b.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
                this.b.updateSessionPreference(providerId, extensionId, session);
                return session;
            }
            // For the silent flows, if we have a session, even though it may not be the user's preference, we'll return it anyway because it might be for a specific
            // set of scopes.
            const validSession = sessions.find(session => this.b.isAccessAllowed(providerId, session.account.label, extensionId));
            if (validSession) {
                // Migration. If we have a valid session, but no preference, we'll set the preference to the valid session.
                // TODO: Remove this after in a few releases.
                if (!this.b.getSessionPreference(providerId, extensionId, scopes)) {
                    if (this.f.get(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */)) {
                        this.f.remove(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */);
                    }
                    this.b.updateAllowedExtension(providerId, validSession.account.label, extensionId, extensionName, true);
                    this.b.updateSessionPreference(providerId, extensionId, validSession);
                }
                return validSession;
            }
            // passive flows (silent or default)
            if (!options.silent) {
                // If there is a potential session, but the extension doesn't have access to it, use the "grant access" flow,
                // otherwise request a new one.
                sessions.length
                    ? this.b.requestSessionAccess(providerId, extensionId, extensionName, scopes, sessions)
                    : await this.b.requestNewSession(providerId, scopes, extensionId, extensionName);
            }
            return undefined;
        }
        async $getSession(providerId, scopes, extensionId, extensionName, options) {
            const session = await this.r(providerId, scopes, extensionId, extensionName, options);
            if (session) {
                this.t(extensionId, providerId);
                (0, authenticationService_1.$PV)(this.f, providerId, session.account.label, extensionId, extensionName);
            }
            return session;
        }
        async $getSessions(providerId, scopes, extensionId, extensionName) {
            const sessions = await this.b.getSessions(providerId, [...scopes], true);
            const accessibleSessions = sessions.filter(s => this.b.isAccessAllowed(providerId, s.account.label, extensionId));
            if (accessibleSessions.length) {
                this.t(extensionId, providerId);
                for (const session of accessibleSessions) {
                    (0, authenticationService_1.$PV)(this.f, providerId, session.account.label, extensionId, extensionName);
                }
            }
            return accessibleSessions;
        }
        t(extensionId, providerId) {
            this.m.publicLog2('authentication.providerUsage', { providerId, extensionId });
        }
    };
    exports.$Esb = $Esb;
    exports.$Esb = $Esb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadAuthentication),
        __param(1, authentication_1.$3I),
        __param(2, dialogs_1.$oA),
        __param(3, storage_1.$Vo),
        __param(4, notification_1.$Yu),
        __param(5, quickInput_1.$Gq),
        __param(6, extensions_1.$MF),
        __param(7, telemetry_1.$9k)
    ], $Esb);
});
//# sourceMappingURL=mainThreadAuthentication.js.map