/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isVirtualWorkspace = exports.getVirtualWorkspaceAuthority = exports.getVirtualWorkspaceScheme = exports.getVirtualWorkspaceLocation = exports.isVirtualResource = void 0;
    function isVirtualResource(resource) {
        return resource.scheme !== network_1.Schemas.file && resource.scheme !== network_1.Schemas.vscodeRemote;
    }
    exports.isVirtualResource = isVirtualResource;
    function getVirtualWorkspaceLocation(workspace) {
        if (workspace.folders.length) {
            return workspace.folders.every(f => isVirtualResource(f.uri)) ? workspace.folders[0].uri : undefined;
        }
        else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
            return workspace.configuration;
        }
        return undefined;
    }
    exports.getVirtualWorkspaceLocation = getVirtualWorkspaceLocation;
    function getVirtualWorkspaceScheme(workspace) {
        return getVirtualWorkspaceLocation(workspace)?.scheme;
    }
    exports.getVirtualWorkspaceScheme = getVirtualWorkspaceScheme;
    function getVirtualWorkspaceAuthority(workspace) {
        return getVirtualWorkspaceLocation(workspace)?.authority;
    }
    exports.getVirtualWorkspaceAuthority = getVirtualWorkspaceAuthority;
    function isVirtualWorkspace(workspace) {
        return getVirtualWorkspaceLocation(workspace) !== undefined;
    }
    exports.isVirtualWorkspace = isVirtualWorkspace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZS9jb21tb24vdmlydHVhbFdvcmtzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBZ0IsaUJBQWlCLENBQUMsUUFBYTtRQUM5QyxPQUFPLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksQ0FBQztJQUNyRixDQUFDO0lBRkQsOENBRUM7SUFFRCxTQUFnQiwyQkFBMkIsQ0FBQyxTQUFxQjtRQUNoRSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzdCLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUNyRzthQUFNLElBQUksU0FBUyxDQUFDLGFBQWEsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDakYsT0FBTyxTQUFTLENBQUMsYUFBYSxDQUFDO1NBQy9CO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQVBELGtFQU9DO0lBRUQsU0FBZ0IseUJBQXlCLENBQUMsU0FBcUI7UUFDOUQsT0FBTywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLENBQUM7SUFDdkQsQ0FBQztJQUZELDhEQUVDO0lBRUQsU0FBZ0IsNEJBQTRCLENBQUMsU0FBcUI7UUFDakUsT0FBTywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUM7SUFDMUQsQ0FBQztJQUZELG9FQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsU0FBcUI7UUFDdkQsT0FBTywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7SUFDN0QsQ0FBQztJQUZELGdEQUVDIn0=