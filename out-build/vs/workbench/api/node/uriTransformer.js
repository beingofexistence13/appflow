/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uriIpc"], function (require, exports, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qr = void 0;
    /**
     * ```
     * --------------------------------
     * |    UI SIDE    |  AGENT SIDE  |
     * |---------------|--------------|
     * | vscode-remote | file         |
     * | file          | vscode-local |
     * --------------------------------
     * ```
     */
    function createRawURITransformer(remoteAuthority) {
        return {
            transformIncoming: (uri) => {
                if (uri.scheme === 'vscode-remote') {
                    return { scheme: 'file', path: uri.path, query: uri.query, fragment: uri.fragment };
                }
                if (uri.scheme === 'file') {
                    return { scheme: 'vscode-local', path: uri.path, query: uri.query, fragment: uri.fragment };
                }
                return uri;
            },
            transformOutgoing: (uri) => {
                if (uri.scheme === 'file') {
                    return { scheme: 'vscode-remote', authority: remoteAuthority, path: uri.path, query: uri.query, fragment: uri.fragment };
                }
                if (uri.scheme === 'vscode-local') {
                    return { scheme: 'file', path: uri.path, query: uri.query, fragment: uri.fragment };
                }
                return uri;
            },
            transformOutgoingScheme: (scheme) => {
                if (scheme === 'file') {
                    return 'vscode-remote';
                }
                else if (scheme === 'vscode-local') {
                    return 'file';
                }
                return scheme;
            }
        };
    }
    function $qr(remoteAuthority) {
        return new uriIpc_1.$Bm(createRawURITransformer(remoteAuthority));
    }
    exports.$qr = $qr;
});
//# sourceMappingURL=uriTransformer.js.map