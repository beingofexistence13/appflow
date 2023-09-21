/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeAuthority = exports.asWebviewUri = exports.webviewGenericCspSource = exports.webviewRootResourceAuthority = exports.webviewResourceBaseHost = void 0;
    /**
     * Root from which resources in webviews are loaded.
     *
     * This is hardcoded because we never expect to actually hit it. Instead these requests
     * should always go to a service worker.
     */
    exports.webviewResourceBaseHost = 'vscode-cdn.net';
    exports.webviewRootResourceAuthority = `vscode-resource.${exports.webviewResourceBaseHost}`;
    exports.webviewGenericCspSource = `'self' https://*.${exports.webviewResourceBaseHost}`;
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
    function asWebviewUri(resource, remoteInfo) {
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
            authority: `${resource.scheme}+${encodeAuthority(resource.authority)}.${exports.webviewRootResourceAuthority}`,
            path: resource.path,
            fragment: resource.fragment,
            query: resource.query,
        });
    }
    exports.asWebviewUri = asWebviewUri;
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
    function decodeAuthority(authority) {
        return authority.replace(/-([0-9a-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    }
    exports.decodeAuthority = decodeAuthority;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlYnZpZXcvY29tbW9uL3dlYnZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHOzs7OztPQUtHO0lBQ1UsUUFBQSx1QkFBdUIsR0FBRyxnQkFBZ0IsQ0FBQztJQUUzQyxRQUFBLDRCQUE0QixHQUFHLG1CQUFtQiwrQkFBdUIsRUFBRSxDQUFDO0lBRTVFLFFBQUEsdUJBQXVCLEdBQUcsb0JBQW9CLCtCQUF1QixFQUFFLENBQUM7SUFFckY7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLFFBQWEsRUFBRSxVQUE4QjtRQUN6RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLEtBQUssRUFBRTtZQUMxRSxPQUFPLFFBQVEsQ0FBQztTQUNoQjtRQUVELElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2xHLFFBQVEsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDO2dCQUNuQixNQUFNLEVBQUUsaUJBQU8sQ0FBQyxZQUFZO2dCQUM1QixTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7Z0JBQy9CLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTthQUNuQixDQUFDLENBQUM7U0FDSDtRQUVELE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQztZQUNmLE1BQU0sRUFBRSxpQkFBTyxDQUFDLEtBQUs7WUFDckIsU0FBUyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLG9DQUE0QixFQUFFO1lBQ3RHLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtZQUNuQixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDM0IsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1NBQ3JCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFwQkQsb0NBb0JDO0lBRUQsU0FBUyxlQUFlLENBQUMsU0FBaUI7UUFDekMsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQ0MsQ0FBQyxJQUFJLHVCQUFjLElBQUksSUFBSSx3QkFBYyxDQUFDO21CQUN2QyxDQUFDLElBQUksdUJBQWMsSUFBSSxJQUFJLHVCQUFjLENBQUM7bUJBQzFDLENBQUMsSUFBSSw0QkFBbUIsSUFBSSxJQUFJLDRCQUFtQixDQUFDLEVBQ3REO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLFNBQWlCO1FBQ2hELE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUZELDBDQUVDIn0=