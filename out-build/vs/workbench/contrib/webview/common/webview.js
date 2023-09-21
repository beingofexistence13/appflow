/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zob = exports.$Yob = exports.$Xob = exports.$Wob = exports.$Vob = void 0;
    /**
     * Root from which resources in webviews are loaded.
     *
     * This is hardcoded because we never expect to actually hit it. Instead these requests
     * should always go to a service worker.
     */
    exports.$Vob = 'vscode-cdn.net';
    exports.$Wob = `vscode-resource.${exports.$Vob}`;
    exports.$Xob = `'self' https://*.${exports.$Vob}`;
    /**
     * Construct a uri that can load resources inside a webview
     *
     * We encode the resource component of the uri so that on the main thread
     * we know where to load the resource from (remote or truly local):
     *
     * ```txt
     * ${scheme}+${resource-authority}.vscode-resource.vscode-cdn.net/${path}
     * ```
     *
     * @param resource Uri of the resource to load.
     * @param remoteInfo Optional information about the remote that specifies where `resource` should be resolved from.
     */
    function $Yob(resource, remoteInfo) {
        if (resource.scheme === network_1.Schemas.http || resource.scheme === network_1.Schemas.https) {
            return resource;
        }
        if (remoteInfo && remoteInfo.authority && remoteInfo.isRemote && resource.scheme === network_1.Schemas.file) {
            resource = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeRemote,
                authority: remoteInfo.authority,
                path: resource.path,
            });
        }
        return uri_1.URI.from({
            scheme: network_1.Schemas.https,
            authority: `${resource.scheme}+${encodeAuthority(resource.authority)}.${exports.$Wob}`,
            path: resource.path,
            fragment: resource.fragment,
            query: resource.query,
        });
    }
    exports.$Yob = $Yob;
    function encodeAuthority(authority) {
        return authority.replace(/./g, char => {
            const code = char.charCodeAt(0);
            if ((code >= 97 /* CharCode.a */ && code <= 122 /* CharCode.z */)
                || (code >= 65 /* CharCode.A */ && code <= 90 /* CharCode.Z */)
                || (code >= 48 /* CharCode.Digit0 */ && code <= 57 /* CharCode.Digit9 */)) {
                return char;
            }
            return '-' + code.toString(16).padStart(4, '0');
        });
    }
    function $Zob(authority) {
        return authority.replace(/-([0-9a-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    }
    exports.$Zob = $Zob;
});
//# sourceMappingURL=webview.js.map