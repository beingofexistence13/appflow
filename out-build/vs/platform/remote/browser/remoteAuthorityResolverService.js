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
    exports.$j2b = void 0;
    let $j2b = class $j2b extends lifecycle_1.$kc {
        constructor(isWorkbenchOptionsBasedResolution, connectionToken, resourceUriProvider, productService, j) {
            super();
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeConnectionData = this.a.event;
            this.b = new Map();
            this.c = new Map();
            this.f = connectionToken;
            this.g = new Map();
            this.h = isWorkbenchOptionsBasedResolution;
            if (resourceUriProvider) {
                network_1.$Wf.setDelegate(resourceUriProvider);
            }
            network_1.$Wf.setServerRootPath((0, remoteHosts_1.$Qk)(productService));
        }
        async resolveAuthority(authority) {
            let result = this.b.get(authority);
            if (!result) {
                result = new async_1.$2g();
                this.b.set(authority, result);
                if (this.h) {
                    this.m(authority).then(v => result.complete(v), (err) => result.error(err));
                }
            }
            return result.p;
        }
        async getCanonicalURI(uri) {
            // todo@connor4312 make this work for web
            return uri;
        }
        getConnectionData(authority) {
            if (!this.c.has(authority)) {
                return null;
            }
            const resolverResult = this.c.get(authority);
            const connectionToken = this.g.get(authority) || resolverResult.authority.connectionToken;
            return {
                connectTo: resolverResult.authority.connectTo,
                connectionToken: connectionToken
            };
        }
        async m(authority) {
            const authorityPrefix = (0, remoteAuthorityResolver_1.$Nk)(authority);
            const sw = stopwatch_1.$bd.create(false);
            this.j.info(`Resolving connection token (${authorityPrefix})...`);
            performance.mark(`code/willResolveConnectionToken/${authorityPrefix}`);
            const connectionToken = await Promise.resolve(this.g.get(authority) || this.f);
            performance.mark(`code/didResolveConnectionToken/${authorityPrefix}`);
            this.j.info(`Resolved connection token (${authorityPrefix}) after ${sw.elapsed()} ms`);
            const defaultPort = (/^https:/.test(window.location.href) ? 443 : 80);
            const { host, port } = (0, remoteHosts_1.$Sk)(authority, defaultPort);
            const result = { authority: { authority, connectTo: new remoteAuthorityResolver_1.$Lk(host, port), connectionToken } };
            network_1.$Wf.set(authority, host, port);
            this.c.set(authority, result);
            this.a.fire();
            return result;
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
                // For non-websocket types, it's expected the embedder passes a `remoteResourceProvider`
                // which is wrapped to a `IResourceUriProvider` and is not handled here.
                if (resolvedAuthority.connectTo.type === 0 /* RemoteConnectionType.WebSocket */) {
                    network_1.$Wf.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
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
            this.g.set(authority, connectionToken);
            network_1.$Wf.setConnectionToken(authority, connectionToken);
            this.a.fire();
        }
        _setCanonicalURIProvider(provider) {
        }
    };
    exports.$j2b = $j2b;
    exports.$j2b = $j2b = __decorate([
        __param(3, productService_1.$kj),
        __param(4, log_1.$5i)
    ], $j2b);
});
//# sourceMappingURL=remoteAuthorityResolverService.js.map