/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sk = exports.$Rk = exports.$Qk = exports.$Pk = exports.$Ok = void 0;
    function $Ok(uri) {
        return uri.scheme === network_1.Schemas.vscodeRemote ? uri.authority : undefined;
    }
    exports.$Ok = $Ok;
    function $Pk(authority) {
        if (!authority) {
            return undefined;
        }
        const pos = authority.indexOf('+');
        if (pos < 0) {
            // e.g. localhost:8000
            return authority;
        }
        return authority.substr(0, pos);
    }
    exports.$Pk = $Pk;
    /**
     * The root path to use when accessing the remote server. The path contains the quality and commit of the current build.
     * @param product
     * @returns
     */
    function $Qk(product) {
        return `/${product.quality ?? 'oss'}-${product.commit ?? 'dev'}`;
    }
    exports.$Qk = $Qk;
    function $Rk(authority) {
        const { host, port } = parseAuthority(authority);
        if (typeof port === 'undefined') {
            throw new Error(`Remote authority doesn't contain a port!`);
        }
        return { host, port };
    }
    exports.$Rk = $Rk;
    function $Sk(authority, defaultPort) {
        let { host, port } = parseAuthority(authority);
        if (typeof port === 'undefined') {
            port = defaultPort;
        }
        return { host, port };
    }
    exports.$Sk = $Sk;
    function parseAuthority(authority) {
        // check for ipv6 with port
        const m1 = authority.match(/^(\[[0-9a-z:]+\]):(\d+)$/);
        if (m1) {
            return { host: m1[1], port: parseInt(m1[2], 10) };
        }
        // check for ipv6 without port
        const m2 = authority.match(/^(\[[0-9a-z:]+\])$/);
        if (m2) {
            return { host: m2[1], port: undefined };
        }
        // anything with a trailing port
        const m3 = authority.match(/(.*):(\d+)$/);
        if (m3) {
            return { host: m3[1], port: parseInt(m3[2], 10) };
        }
        // doesn't contain a port
        return { host: authority, port: undefined };
    }
});
//# sourceMappingURL=remoteHosts.js.map