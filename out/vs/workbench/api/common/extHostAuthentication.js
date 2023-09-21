/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/platform/extensions/common/extensions"], function (require, exports, event_1, extHost_protocol_1, extHostTypes_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostAuthentication = void 0;
    class ExtHostAuthentication {
        constructor(mainContext) {
            this._authenticationProviders = new Map();
            this._providers = [];
            this._onDidChangeSessions = new event_1.Emitter();
            this.onDidChangeSessions = this._onDidChangeSessions.event;
            this._getSessionTaskSingler = new TaskSingler();
            this._getSessionsTaskSingler = new TaskSingler();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadAuthentication);
        }
        $setProviders(providers) {
            this._providers = providers;
            return Promise.resolve();
        }
        async getSession(requestingExtension, providerId, scopes, options = {}) {
            const extensionId = extensions_1.ExtensionIdentifier.toKey(requestingExtension.identifier);
            const sortedScopes = [...scopes].sort().join(' ');
            return await this._getSessionTaskSingler.getOrCreate(`${extensionId} ${providerId} ${sortedScopes}`, async () => {
                await this._proxy.$ensureProvider(providerId);
                const extensionName = requestingExtension.displayName || requestingExtension.name;
                return this._proxy.$getSession(providerId, scopes, extensionId, extensionName, options);
            });
        }
        async getSessions(requestingExtension, providerId, scopes) {
            const extensionId = extensions_1.ExtensionIdentifier.toKey(requestingExtension.identifier);
            const sortedScopes = [...scopes].sort().join(' ');
            return await this._getSessionsTaskSingler.getOrCreate(`${extensionId} ${sortedScopes}`, async () => {
                await this._proxy.$ensureProvider(providerId);
                const extensionName = requestingExtension.displayName || requestingExtension.name;
                return this._proxy.$getSessions(providerId, scopes, extensionId, extensionName);
            });
        }
        async removeSession(providerId, sessionId) {
            const providerData = this._authenticationProviders.get(providerId);
            if (!providerData) {
                return this._proxy.$removeSession(providerId, sessionId);
            }
            return providerData.provider.removeSession(sessionId);
        }
        registerAuthenticationProvider(id, label, provider, options) {
            if (this._authenticationProviders.get(id)) {
                throw new Error(`An authentication provider with id '${id}' is already registered.`);
            }
            this._authenticationProviders.set(id, { label, provider, options: options ?? { supportsMultipleAccounts: false } });
            if (!this._providers.find(p => p.id === id)) {
                this._providers.push({
                    id: id,
                    label: label
                });
            }
            const listener = provider.onDidChangeSessions(e => {
                this._proxy.$sendDidChangeSessions(id, {
                    added: e.added ?? [],
                    changed: e.changed ?? [],
                    removed: e.removed ?? []
                });
            });
            this._proxy.$registerAuthenticationProvider(id, label, options?.supportsMultipleAccounts ?? false);
            return new extHostTypes_1.Disposable(() => {
                listener.dispose();
                this._authenticationProviders.delete(id);
                const i = this._providers.findIndex(p => p.id === id);
                if (i > -1) {
                    this._providers.splice(i);
                }
                this._proxy.$unregisterAuthenticationProvider(id);
            });
        }
        $createSession(providerId, scopes, options) {
            const providerData = this._authenticationProviders.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.createSession(scopes, options));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $removeSession(providerId, sessionId) {
            const providerData = this._authenticationProviders.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.removeSession(sessionId));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $getSessions(providerId, scopes) {
            const providerData = this._authenticationProviders.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.getSessions(scopes));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $onDidChangeAuthenticationSessions(id, label) {
            this._onDidChangeSessions.fire({ provider: { id, label } });
            return Promise.resolve();
        }
    }
    exports.ExtHostAuthentication = ExtHostAuthentication;
    class TaskSingler {
        constructor() {
            this._inFlightPromises = new Map();
        }
        getOrCreate(key, promiseFactory) {
            const inFlight = this._inFlightPromises.get(key);
            if (inFlight) {
                return inFlight;
            }
            const promise = promiseFactory().finally(() => this._inFlightPromises.delete(key));
            this._inFlightPromises.set(key, promise);
            return promise;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEF1dGhlbnRpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdEF1dGhlbnRpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFhLHFCQUFxQjtRQVlqQyxZQUFZLFdBQXlCO1lBVjdCLDZCQUF3QixHQUFzQyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztZQUV0RyxlQUFVLEdBQStDLEVBQUUsQ0FBQztZQUU1RCx5QkFBb0IsR0FBRyxJQUFJLGVBQU8sRUFBNEMsQ0FBQztZQUM5RSx3QkFBbUIsR0FBb0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUV4RywyQkFBc0IsR0FBRyxJQUFJLFdBQVcsRUFBNEMsQ0FBQztZQUNyRiw0QkFBdUIsR0FBRyxJQUFJLFdBQVcsRUFBK0MsQ0FBQztZQUdoRyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCxhQUFhLENBQUMsU0FBcUQ7WUFDbEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQU1ELEtBQUssQ0FBQyxVQUFVLENBQUMsbUJBQTBDLEVBQUUsVUFBa0IsRUFBRSxNQUF5QixFQUFFLFVBQWtELEVBQUU7WUFDL0osTUFBTSxXQUFXLEdBQUcsZ0NBQW1CLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLElBQUksVUFBVSxJQUFJLFlBQVksRUFBRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUMvRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxXQUFXLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDO2dCQUNsRixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6RixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLG1CQUEwQyxFQUFFLFVBQWtCLEVBQUUsTUFBeUI7WUFDMUcsTUFBTSxXQUFXLEdBQUcsZ0NBQW1CLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLElBQUksWUFBWSxFQUFFLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDLFdBQVcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xGLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFrQixFQUFFLFNBQWlCO1lBQ3hELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDekQ7WUFFRCxPQUFPLFlBQVksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCw4QkFBOEIsQ0FBQyxFQUFVLEVBQUUsS0FBYSxFQUFFLFFBQXVDLEVBQUUsT0FBOEM7WUFDaEosSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUMxQyxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxFQUFFLDBCQUEwQixDQUFDLENBQUM7YUFDckY7WUFFRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLHdCQUF3QixFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVwSCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztvQkFDcEIsRUFBRSxFQUFFLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEtBQUs7aUJBQ1osQ0FBQyxDQUFDO2FBQ0g7WUFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsRUFBRSxFQUFFO29CQUN0QyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNwQixPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFO29CQUN4QixPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFO2lCQUN4QixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxNQUFNLENBQUMsK0JBQStCLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsd0JBQXdCLElBQUksS0FBSyxDQUFDLENBQUM7WUFFbkcsT0FBTyxJQUFJLHlCQUFVLENBQUMsR0FBRyxFQUFFO2dCQUMxQixRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXpDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzFCO2dCQUVELElBQUksQ0FBQyxNQUFNLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsY0FBYyxDQUFDLFVBQWtCLEVBQUUsTUFBZ0IsRUFBRSxPQUEwRDtZQUM5RyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25FLElBQUksWUFBWSxFQUFFO2dCQUNqQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDN0U7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFRCxjQUFjLENBQUMsVUFBa0IsRUFBRSxTQUFpQjtZQUNuRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25FLElBQUksWUFBWSxFQUFFO2dCQUNqQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVELFlBQVksQ0FBQyxVQUFrQixFQUFFLE1BQWlCO1lBQ2pELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkUsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ2xFO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsa0NBQWtDLENBQUMsRUFBVSxFQUFFLEtBQWE7WUFDM0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUNEO0lBMUhELHNEQTBIQztJQUVELE1BQU0sV0FBVztRQUFqQjtZQUNTLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1FBWTNELENBQUM7UUFYQSxXQUFXLENBQUMsR0FBVyxFQUFFLGNBQWdDO1lBQ3hELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakQsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFFRCxNQUFNLE9BQU8sR0FBRyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7S0FDRCJ9