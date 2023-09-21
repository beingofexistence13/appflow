/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseAuthorityWithOptionalPort = exports.parseAuthorityWithPort = exports.getRemoteServerRootPath = exports.getRemoteName = exports.getRemoteAuthority = void 0;
    function getRemoteAuthority(uri) {
        return uri.scheme === network_1.Schemas.vscodeRemote ? uri.authority : undefined;
    }
    exports.getRemoteAuthority = getRemoteAuthority;
    function getRemoteName(authority) {
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
    exports.getRemoteName = getRemoteName;
    /**
     * The root path to use when accessing the remote server. The path contains the quality and commit of the current build.
     * @param product
     * @returns
     */
    function getRemoteServerRootPath(product) {
        return `/${product.quality ?? 'oss'}-${product.commit ?? 'dev'}`;
    }
    exports.getRemoteServerRootPath = getRemoteServerRootPath;
    function parseAuthorityWithPort(authority) {
        const { host, port } = parseAuthority(authority);
        if (typeof port === 'undefined') {
            throw new Error(`Remote authority doesn't contain a port!`);
        }
        return { host, port };
    }
    exports.parseAuthorityWithPort = parseAuthorityWithPort;
    function parseAuthorityWithOptionalPort(authority, defaultPort) {
        let { host, port } = parseAuthority(authority);
        if (typeof port === 'undefined') {
            port = defaultPort;
        }
        return { host, port };
    }
    exports.parseAuthorityWithOptionalPort = parseAuthorityWithOptionalPort;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlSG9zdHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvY29tbW9uL3JlbW90ZUhvc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFnQixrQkFBa0IsQ0FBQyxHQUFRO1FBQzFDLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3hFLENBQUM7SUFGRCxnREFFQztJQUtELFNBQWdCLGFBQWEsQ0FBQyxTQUE2QjtRQUMxRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2YsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFDRCxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNaLHNCQUFzQjtZQUN0QixPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUNELE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQVZELHNDQVVDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLHVCQUF1QixDQUFDLE9BQThDO1FBQ3JGLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLEtBQUssSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQ2xFLENBQUM7SUFGRCwwREFFQztJQUVELFNBQWdCLHNCQUFzQixDQUFDLFNBQWlCO1FBQ3ZELE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztTQUM1RDtRQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQU5ELHdEQU1DO0lBRUQsU0FBZ0IsOEJBQThCLENBQUMsU0FBaUIsRUFBRSxXQUFtQjtRQUNwRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQyxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUNoQyxJQUFJLEdBQUcsV0FBVyxDQUFDO1NBQ25CO1FBQ0QsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBTkQsd0VBTUM7SUFFRCxTQUFTLGNBQWMsQ0FBQyxTQUFpQjtRQUN4QywyQkFBMkI7UUFDM0IsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3ZELElBQUksRUFBRSxFQUFFO1lBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUNsRDtRQUVELDhCQUE4QjtRQUM5QixNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDakQsSUFBSSxFQUFFLEVBQUU7WUFDUCxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7U0FDeEM7UUFFRCxnQ0FBZ0M7UUFDaEMsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQyxJQUFJLEVBQUUsRUFBRTtZQUNQLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDbEQ7UUFFRCx5QkFBeUI7UUFDekIsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO0lBQzdDLENBQUMifQ==