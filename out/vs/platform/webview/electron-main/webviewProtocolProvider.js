/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, electron_1, lifecycle_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewProtocolProvider = void 0;
    class WebviewProtocolProvider extends lifecycle_1.Disposable {
        static { this.validWebviewFilePaths = new Map([
            ['/index.html', 'index.html'],
            ['/fake.html', 'fake.html'],
            ['/service-worker.js', 'service-worker.js'],
        ]); }
        constructor() {
            super();
            // Register the protocol for loading webview html
            const webviewHandler = this.handleWebviewRequest.bind(this);
            electron_1.protocol.registerFileProtocol(network_1.Schemas.vscodeWebview, webviewHandler);
        }
        handleWebviewRequest(request, callback) {
            try {
                const uri = uri_1.URI.parse(request.url);
                const entry = WebviewProtocolProvider.validWebviewFilePaths.get(uri.path);
                if (typeof entry === 'string') {
                    const relativeResourcePath = `vs/workbench/contrib/webview/browser/pre/${entry}`;
                    const url = network_1.FileAccess.asFileUri(relativeResourcePath);
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
    exports.WebviewProtocolProvider = WebviewProtocolProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1Byb3RvY29sUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS93ZWJ2aWV3L2VsZWN0cm9uLW1haW4vd2Vidmlld1Byb3RvY29sUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVU7aUJBRXZDLDBCQUFxQixHQUFHLElBQUksR0FBRyxDQUFDO1lBQzlDLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQztZQUM3QixDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7WUFDM0IsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQztTQUMzQyxDQUFDLENBQUM7UUFFSDtZQUNDLEtBQUssRUFBRSxDQUFDO1lBRVIsaURBQWlEO1lBQ2pELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsbUJBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBTyxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU8sb0JBQW9CLENBQzNCLE9BQWlDLEVBQ2pDLFFBQWdFO1lBRWhFLElBQUk7Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFFLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO29CQUM5QixNQUFNLG9CQUFvQixHQUFvQiw0Q0FBNEMsS0FBSyxFQUFFLENBQUM7b0JBQ2xHLE1BQU0sR0FBRyxHQUFHLG9CQUFVLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUM7b0JBQ3ZELE9BQU8sUUFBUSxDQUFDO3dCQUNmLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTTt3QkFDaEIsT0FBTyxFQUFFOzRCQUNSLEdBQUcsYUFBRyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7NEJBQ3ZDLDhCQUE4QixFQUFFLGNBQWM7eUJBQzlDO3FCQUNELENBQUMsQ0FBQztpQkFDSDtxQkFBTTtvQkFDTixPQUFPLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyx5RkFBeUYsRUFBRSxDQUFDLENBQUM7aUJBQzFIO2FBQ0Q7WUFBQyxNQUFNO2dCQUNQLE9BQU87YUFDUDtZQUNELE9BQU8sUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGtGQUFrRixFQUFFLENBQUMsQ0FBQztRQUNuSCxDQUFDOztJQXhDRiwwREF5Q0MifQ==