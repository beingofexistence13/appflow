var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts"], function (require, exports, async_1, errors, event_1, lifecycle_1, network_1, productService_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAuthorityResolverService = void 0;
    let RemoteAuthorityResolverService = class RemoteAuthorityResolverService extends lifecycle_1.Disposable {
        constructor(productService, remoteResourceLoader) {
            super();
            this.remoteResourceLoader = remoteResourceLoader;
            this._onDidChangeConnectionData = this._register(new event_1.Emitter());
            this.onDidChangeConnectionData = this._onDidChangeConnectionData.event;
            this._resolveAuthorityRequests = new Map();
            this._connectionTokens = new Map();
            this._canonicalURIRequests = new Map();
            this._canonicalURIProvider = null;
            network_1.RemoteAuthorities.setServerRootPath((0, remoteHosts_1.getRemoteServerRootPath)(productService));
        }
        resolveAuthority(authority) {
            if (!this._resolveAuthorityRequests.has(authority)) {
                this._resolveAuthorityRequests.set(authority, new async_1.DeferredPromise());
            }
            return this._resolveAuthorityRequests.get(authority).p;
        }
        async getCanonicalURI(uri) {
            const key = uri.toString();
            const existing = this._canonicalURIRequests.get(key);
            if (existing) {
                return existing.result.p;
            }
            const result = new async_1.DeferredPromise();
            this._canonicalURIProvider?.(uri).then((uri) => result.complete(uri), (err) => result.error(err));
            this._canonicalURIRequests.set(key, { input: uri, result });
            return result.p;
        }
        getConnectionData(authority) {
            if (!this._resolveAuthorityRequests.has(authority)) {
                return null;
            }
            const request = this._resolveAuthorityRequests.get(authority);
            if (!request.isResolved) {
                return null;
            }
            const connectionToken = this._connectionTokens.get(authority);
            return {
                connectTo: request.value.authority.connectTo,
                connectionToken: connectionToken
            };
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
                if (resolvedAuthority.connectTo.type === 0 /* RemoteConnectionType.WebSocket */) {
                    network_1.RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
                }
                else {
                    network_1.RemoteAuthorities.setDelegate(this.remoteResourceLoader.getResourceUriProvider());
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
            this._canonicalURIProvider = provider;
            this._canonicalURIRequests.forEach(({ result, input }) => {
                this._canonicalURIProvider(input).then((uri) => result.complete(uri), (err) => result.error(err));
            });
        }
    };
    exports.RemoteAuthorityResolverService = RemoteAuthorityResolverService;
    exports.RemoteAuthorityResolverService = RemoteAuthorityResolverService = __decorate([
        __param(0, productService_1.IProductService)
    ], RemoteAuthorityResolverService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVtb3RlL2VsZWN0cm9uLXNhbmRib3gvcmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFnQk8sSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxzQkFBVTtRQVk3RCxZQUE2QixjQUErQixFQUFtQixvQkFBa0Q7WUFDaEksS0FBSyxFQUFFLENBQUM7WUFEc0UseUJBQW9CLEdBQXBCLG9CQUFvQixDQUE4QjtZQVJoSCwrQkFBMEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNsRSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1lBU2pGLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLEdBQUcsRUFBMkMsQ0FBQztZQUNwRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDbkQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztZQUVsQywyQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFBLHFDQUF1QixFQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELGdCQUFnQixDQUFDLFNBQWlCO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBQ0Qs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