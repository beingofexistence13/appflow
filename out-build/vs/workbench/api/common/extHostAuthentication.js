/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/platform/extensions/common/extensions"], function (require, exports, event_1, extHost_protocol_1, extHostTypes_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hcc = void 0;
    class $Hcc {
        constructor(mainContext) {
            this.b = new Map();
            this.c = [];
            this.d = new event_1.$fd();
            this.onDidChangeSessions = this.d.event;
            this.f = new TaskSingler();
            this.g = new TaskSingler();
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadAuthentication);
        }
        $setProviders(providers) {
            this.c = providers;
            return Promise.resolve();
        }
        async getSession(requestingExtension, providerId, scopes, options = {}) {
            const extensionId = extensions_1.$Vl.toKey(requestingExtension.identifier);
            const sortedScopes = [...scopes].sort().join(' ');
            return await this.f.getOrCreate(`${extensionId} ${providerId} ${sortedScopes}`, async () => {
                await this.a.$ensureProvider(providerId);
                const extensionName = requestingExtension.displayName || requestingExtension.name;
                return this.a.$getSession(providerId, scopes, extensionId, extensionName, options);
            });
        }
        async getSessions(requestingExtension, providerId, scopes) {
            const extensionId = extensions_1.$Vl.toKey(requestingExtension.identifier);
            const sortedScopes = [...scopes].sort().join(' ');
            return await this.g.getOrCreate(`${extensionId} ${sortedScopes}`, async () => {
                await this.a.$ensureProvider(providerId);
                const extensionName = requestingExtension.displayName || requestingExtension.name;
                return this.a.$getSessions(providerId, scopes, extensionId, extensionName);
            });
        }
        async removeSession(providerId, sessionId) {
            const providerData = this.b.get(providerId);
            if (!providerData) {
                return this.a.$removeSession(providerId, sessionId);
            }
            return providerData.provider.removeSession(sessionId);
        }
        registerAuthenticationProvider(id, label, provider, options) {
            if (this.b.get(id)) {
                throw new Error(`An authentication provider with id '${id}' is already registered.`);
            }
            this.b.set(id, { label, provider, options: options ?? { supportsMultipleAccounts: false } });
            if (!this.c.find(p => p.id === id)) {
                this.c.push({
                    id: id,
                    label: label
                });
            }
            const listener = provider.onDidChangeSessions(e => {
                this.a.$sendDidChangeSessions(id, {
                    added: e.added ?? [],
                    changed: e.changed ?? [],
                    removed: e.removed ?? []
                });
            });
            this.a.$registerAuthenticationProvider(id, label, options?.supportsMultipleAccounts ?? false);
            return new extHostTypes_1.$3J(() => {
                listener.dispose();
                this.b.delete(id);
                const i = this.c.findIndex(p => p.id === id);
                if (i > -1) {
                    this.c.splice(i);
                }
                this.a.$unregisterAuthenticationProvider(id);
            });
        }
        $createSession(providerId, scopes, options) {
            const providerData = this.b.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.createSession(scopes, options));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $removeSession(providerId, sessionId) {
            const providerData = this.b.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.removeSession(sessionId));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $getSessions(providerId, scopes) {
            const providerData = this.b.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.getSessions(scopes));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $onDidChangeAuthenticationSessions(id, label) {
            this.d.fire({ provider: { id, label } });
            return Promise.resolve();
        }
    }
    exports.$Hcc = $Hcc;
    class TaskSingler {
        constructor() {
            this.a = new Map();
        }
        getOrCreate(key, promiseFactory) {
            const inFlight = this.a.get(key);
            if (inFlight) {
                return inFlight;
            }
            const promise = promiseFactory().finally(() => this.a.delete(key));
            this.a.set(key, promise);
            return promise;
        }
    }
});
//# sourceMappingURL=extHostAuthentication.js.map