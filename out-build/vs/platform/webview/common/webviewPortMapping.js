/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/platform/tunnel/common/tunnel"], function (require, exports, network_1, uri_1, tunnel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hbb = void 0;
    /**
     * Manages port mappings for a single webview.
     */
    class $Hbb {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new Map();
        }
        async getRedirect(resolveAuthority, url) {
            const uri = uri_1.URI.parse(url);
            const requestLocalHostInfo = (0, tunnel_1.$Zz)(uri);
            if (!requestLocalHostInfo) {
                return undefined;
            }
            for (const mapping of this.c()) {
                if (mapping.webviewPort === requestLocalHostInfo.port) {
                    const extensionLocation = this.b();
                    if (extensionLocation && extensionLocation.scheme === network_1.Schemas.vscodeRemote) {
                        const tunnel = resolveAuthority && await this.e(resolveAuthority, mapping.extensionHostPort);
                        if (tunnel) {
                            if (tunnel.tunnelLocalPort === mapping.webviewPort) {
                                return undefined;
                            }
                            return encodeURI(uri.with({
                                authority: `127.0.0.1:${tunnel.tunnelLocalPort}`,
                            }).toString(true));
                        }
                    }
                    if (mapping.webviewPort !== mapping.extensionHostPort) {
                        return encodeURI(uri.with({
                            authority: `${requestLocalHostInfo.address}:${mapping.extensionHostPort}`
                        }).toString(true));
                    }
                }
            }
            return undefined;
        }
        async dispose() {
            for (const tunnel of this.a.values()) {
                await tunnel.dispose();
            }
            this.a.clear();
        }
        async e(remoteAuthority, remotePort) {
            const existing = this.a.get(remotePort);
            if (existing) {
                return existing;
            }
            const tunnelOrError = await this.d.openTunnel({ getAddress: async () => remoteAuthority }, undefined, remotePort);
            let tunnel;
            if (typeof tunnelOrError === 'string') {
                tunnel = undefined;
            }
            if (tunnel) {
                this.a.set(remotePort, tunnel);
            }
            return tunnel;
        }
    }
    exports.$Hbb = $Hbb;
});
//# sourceMappingURL=webviewPortMapping.js.map