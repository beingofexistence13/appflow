/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uriIpc"], function (require, exports, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createURITransformer = void 0;
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
    function createURITransformer(remoteAuthority) {
        return new uriIpc_1.URITransformer(createRawURITransformer(remoteAuthority));
    }
    exports.createURITransformer = createURITransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpVHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvdXJpVHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHOzs7Ozs7Ozs7T0FTRztJQUNILFNBQVMsdUJBQXVCLENBQUMsZUFBdUI7UUFDdkQsT0FBTztZQUNOLGlCQUFpQixFQUFFLENBQUMsR0FBYSxFQUFZLEVBQUU7Z0JBQzlDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxlQUFlLEVBQUU7b0JBQ25DLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3BGO2dCQUNELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7b0JBQzFCLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQzVGO2dCQUNELE9BQU8sR0FBRyxDQUFDO1lBQ1osQ0FBQztZQUNELGlCQUFpQixFQUFFLENBQUMsR0FBYSxFQUFZLEVBQUU7Z0JBQzlDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7b0JBQzFCLE9BQU8sRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDekg7Z0JBQ0QsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLGNBQWMsRUFBRTtvQkFDbEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDcEY7Z0JBQ0QsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDO1lBQ0QsdUJBQXVCLEVBQUUsQ0FBQyxNQUFjLEVBQVUsRUFBRTtnQkFDbkQsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO29CQUN0QixPQUFPLGVBQWUsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxNQUFNLEtBQUssY0FBYyxFQUFFO29CQUNyQyxPQUFPLE1BQU0sQ0FBQztpQkFDZDtnQkFDRCxPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQWdCLG9CQUFvQixDQUFDLGVBQXVCO1FBQzNELE9BQU8sSUFBSSx1QkFBYyxDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUZELG9EQUVDIn0=