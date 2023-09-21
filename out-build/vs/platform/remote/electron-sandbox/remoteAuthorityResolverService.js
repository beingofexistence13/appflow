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
    exports.$J$b = void 0;
    let $J$b = class $J$b extends lifecycle_1.$kc {
        constructor(productService, h) {
            super();
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeConnectionData = this.a.event;
            this.b = new Map();
            this.c = new Map();
            this.f = new Map();
            this.g = null;
            network_1.$Wf.setServerRootPath((0, remoteHosts_1.$Qk)(productService));
        }
        resolveAuthority(authority) {
            if (!this.b.has(authority)) {
                this.b.set(authority, new async_1.$2g());
            }
            return this.b.get(authority).p;
        }
        async getCanonicalURI(uri) {
            const key = uri.toString();
            const existing = this.f.get(key);
            if (existing) {
                return existing.result.p;
            }
            const result = new async_1.$2g();
            this.g?.(uri).then((uri) => result.complete(uri), (err) => result.error(err));
            this.f.set(key, { input: uri, result });
            return result.p;
        }
        getConnectionData(authority) {
            if (!this.b.has(authority)) {
                return null;
            }
            const request = this.b.get(authority);
            if (!request.isResolved) {
                return null;
            }
            const connectionToken = this.c.get(authority);
            return {
                connectTo: request.value.authority.connectTo,
                connectionToken: connectionToken
            };
        }
        _clearResolvedAuthority(authority) {
            if (this.b.has(authority)) {
                this.b.get(authority).cancel();
                this.b.delete(authority);
            }
        }
        _setResolvedAuthority(resolvedAuthority, options) {
            if (this.b.has(resolvedAuthority.authority)) {
                const request = this.b.get(resolvedAuthority.authority);
                if (resolvedAuthority.connectTo.type === 0 /* RemoteConnectionType.WebSocket */) {
                    network_1.$Wf.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
                }
                else {
                    network_1.$Wf.setDelegate(this.h.getResourceUriProvider());
                }
                if (resolvedAuthority.connectionToken) {
                    network_1.$Wf.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
                }
                request.complete({ authority: resolvedAuthority, options });
                this.a.fire();
            }
        }
        _setResolvedAuthorityError(authority, err) {
            if (this.b.has(authority)) {
                const request = this.b.get(authority);
                // Avoid that this error makes it to telemetry
                request.error(errors.$_.fromError(err));
            }
        }
        _setAuthorityConnectionToken(authority, connectionToken) {
            this.c.set(authority, connectionToken);
            network_1.$Wf.setConnectionToken(authority, connectionToken);
            this.a.fire();
        }
        _setCanonicalURIProvider(provider) {
            this.g = provider;
            this.f.forEach(({ result, input }) => {
                this.g(input).then((uri) => result.complete(uri), (err) => result.error(err));
            });
        }
    };
    exports.$J$b = $J$b;
    exports.$J$b = $J$b = __decorate([
        __param(0, productService_1.$kj)
    ], $J$b);
});
//# sourceMappingURL=remoteAuthorityResolverService.js.map