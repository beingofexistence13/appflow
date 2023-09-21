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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/stopwatch", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteHosts"], function (require, exports, async_1, errors, event_1, lifecycle_1, network_1, performance, stopwatch_1, log_1, productService_1, remoteAuthorityResolver_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAuthorityResolverService = void 0;
    let RemoteAuthorityResolverService = class RemoteAuthorityResolverService extends lifecycle_1.Disposable {
        constructor(isWorkbenchOptionsBasedResolution, connectionToken, resourceUriProvider, productService, _logService) {
            super();
            this._logService = _logService;
            this._onDidChangeConnectionData = this._register(new event_1.Emitter());
            this.onDidChangeConnectionData = this._onDidChangeConnectionData.event;
            this._resolveAuthorityRequests = new Map();
            this._cache = new Map();
            this._connectionToken = connectionToken;
            this._connectionTokens = new Map();
            this._isWorkbenchOptionsBasedResolution = isWorkbenchOptionsBasedResolution;
            if (resourceUriProvider) {
                network_1.RemoteAuthorities.setDelegate(resourceUriProvider);
            }
            network_1.RemoteAuthorities.setServerRootPath((0, remoteHosts_1.getRemoteServerRootPath)(productService));
        }
        async resolveAuthority(authority) {
            let result = this._resolveAuthorityRequests.get(authority);
            if (!result) {
                result = new async_1.DeferredPromise();
                this._resolveAuthorityRequests.set(authority, result);
                if (this._isWorkbenchOptionsBasedResolution) {
                    this._doResolveAuthority(authority).then(v => result.complete(v), (err) => result.error(err));
                }
            }
            return result.p;
        }
        async getCanonicalURI(uri) {
            // todo@connor4312 make this work for web
            return uri;
        }
        getConnectionData(authority) {
            if (!this._cache.has(authority)) {
                return null;
            }
            const resolverResult = this._cache.get(authority);
            const connectionToken = this._connectionTokens.get(authority) || resolverResult.authority.connectionToken;
            return {
                connectTo: resolverResult.authority.connectTo,
                connectionToken: connectionToken
            };
        }
        async _doResolveAuthority(authority) {
            const authorityPrefix = (0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(authority);
            const sw = stopwatch_1.StopWatch.create(false);
            this._logService.info(`Resolving connection token (${authorityPrefix})...`);
            performance.mark(`code/willResolveConnectionToken/${authorityPrefix}`);
            const connectionToken = await Promise.resolve(this._connectionTokens.get(authority) || this._connectionToken);
            performance.mark(`code/didResolveConnectionToken/${authorityPrefix}`);
            this._logService.info(`Resolved connection token (${authorityPrefix}) after ${sw.elapsed()} ms`);
            const defaultPort = (/^https:/.test(window.location.href) ? 443 : 80);
            const { host, port } = (0, remoteHosts_1.parseAuthorityWithOptionalPort)(authority, defaultPort);
            const result = { authority: { authority, connectTo: new remoteAuthorityResolver_1.WebSocketRemoteConnection(host, port), connectionToken } };
            network_1.RemoteAuthorities.set(authority, host, port);
            this._cache.set(authority, result);
            this._onDidChangeConnectionData.fire();
            return result;
        }
        _clearResolvedAuthority(authority) {
            if (this._resolveAuthorityRequests.has(authority)) {
                this._resolveAuthorityRequests.get(authority).cancel();
                this._resolveAuthorityRequests.delete(authority);
            }
        }
        _setResolvedAuthority(resolvedAuthority, options) {
            if (this._resolveAuthorityRequests.has(resolvedAuthority.authority)) {
                const request = this._resolveAuthorityRequests.get(resolvedAuthority.authority);
                // For non-websocket types, it's expected the embedder passes a `remoteResourceProvider`
                // which is wrapped to a `IResourceUriProvider` and is not handled here.
                if (resolvedAuthority.connectTo.type === 0 /* RemoteConnectionType.WebSocket */) {
                    network_1.RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
                }
                if (resolvedAuthority.connectionToken) {
                    network_1.RemoteAuthorities.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
                }
                request.complete({ authority: resolvedAuthority, options });
                this._onDidChangeConnectionData.fire();
            }
        }
        _setResolvedAuthorityError(authority, err) {
            if (this._resolveAuthorityRequests.has(authority)) {
                const request = this._resolveAuthorityRequests.get(authority);
                // Avoid that this error makes it to telemetry
                request.error(errors.ErrorNoTelemetry.fromError(err));
            }
        }
        _setAuthorityConnectionToken(authority, connectionToken) {
            this._connectionTokens.set(authority, connectionToken);
            network_1.RemoteAuthorities.setConnectionToken(authority, connectionToken);
            this._onDidChangeConnectionData.fire();
        }
        _setCanonicalURIProvider(provider) {
        }
    };
    exports.RemoteAuthorityResolverService = RemoteAuthorityResolverService;
    exports.RemoteAuthorityResolverService = RemoteAuthorityResolverService = __decorate([
        __param(3, productService_1.IProductService),
        __param(4, log_1.ILogService)
    ], RemoteAuthorityResolverService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVtb3RlL2Jyb3dzZXIvcmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLHNCQUFVO1FBYTdELFlBQ0MsaUNBQTBDLEVBQzFDLGVBQXFELEVBQ3JELG1CQUFvRCxFQUNuQyxjQUErQixFQUNuQyxXQUF5QztZQUV0RCxLQUFLLEVBQUUsQ0FBQztZQUZzQixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQWR0QywrQkFBMEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNsRSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1lBRWpFLDhCQUF5QixHQUFHLElBQUksR0FBRyxFQUEyQyxDQUFDO1lBQy9FLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztZQWEzRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUNuRCxJQUFJLENBQUMsa0NBQWtDLEdBQUcsaUNBQWlDLENBQUM7WUFDNUUsSUFBSSxtQkFBbUIsRUFBRTtnQkFDeEIsMkJBQWlCLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDbkQ7WUFDRCwyQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFBLHFDQUF1QixFQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQjtZQUN2QyxJQUFJ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