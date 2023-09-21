/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, electron_1, lifecycle_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q6b = void 0;
    class $Q6b extends lifecycle_1.$kc {
        static { this.a = new Map([
            ['/index.html', 'index.html'],
            ['/fake.html', 'fake.html'],
            ['/service-worker.js', 'service-worker.js'],
        ]); }
        constructor() {
            super();
            // Register the protocol for loading webview html
            const webviewHandler = this.b.bind(this);
            electron_1.protocol.registerFileProtocol(network_1.Schemas.vscodeWebview, webviewHandler);
        }
        b(request, callback) {
            try {
                const uri = uri_1.URI.parse(request.url);
                const entry = $Q6b.a.get(uri.path);
                if (typeof entry === 'string') {
                    const relativeResourcePath = `vs/workbench/contrib/webview/browser/pre/${entry}`;
                    const url = network_1.$2f.asFileUri(relativeResourcePath);
                    return callback({
                        path: url.fsPath,
                        headers: {
                            ...network_1.COI.getHeadersFromQuery(request.url),
                            'Cross-Origin-Resource-Policy': 'cross-origin'
                        }
                    });
                }
                else {
                    return callback({ error: -10 /* ACCESS_DENIED - https://cs.chromium.org/chromium/src/net/base/net_error_list.h?l=32 */ });
                }
            }
            catch {
                // noop
            }
            return callback({ error: -2 /* FAILED - https://cs.chromium.org/chromium/src/net/base/net_error_list.h?l=32 */ });
        }
    }
    exports.$Q6b = $Q6b;
});
//# sourceMappingURL=webviewProtocolProvider.js.map