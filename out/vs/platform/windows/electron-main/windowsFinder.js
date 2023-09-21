/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, resources_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findWindowOnExtensionDevelopmentPath = exports.findWindowOnWorkspaceOrFolder = exports.findWindowOnFile = void 0;
    async function findWindowOnFile(windows, fileUri, localWorkspaceResolver) {
        // First check for windows with workspaces that have a parent folder of the provided path opened
        for (const window of windows) {
            const workspace = window.openedWorkspace;
            if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                const resolvedWorkspace = await localWorkspaceResolver(workspace);
                // resolved workspace: folders are known and can be compared with
                if (resolvedWorkspace) {
                    if (resolvedWorkspace.folders.some(folder => resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, folder.uri))) {
                        return window;
                    }
                }
                // unresolved: can only compare with workspace location
                else {
                    if (resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, workspace.configPath)) {
                        return window;
                    }
                }
            }
        }
        // Then go with single folder windows that are parent of the provided file path
        const singleFolderWindowsOnFilePath = windows.filter(window => (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, window.openedWorkspace.uri));
        if (singleFolderWindowsOnFilePath.length) {
            return singleFolderWindowsOnFilePath.sort((windowA, windowB) => -(windowA.openedWorkspace.uri.path.length - windowB.openedWorkspace.uri.path.length))[0];
        }
        return undefined;
    }
    exports.findWindowOnFile = findWindowOnFile;
    function findWindowOnWorkspaceOrFolder(windows, folderOrWorkspaceConfigUri) {
        for (const window of windows) {
            // check for workspace config path
            if ((0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, folderOrWorkspaceConfigUri)) {
                return window;
            }
            // check for folder path
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderOrWorkspaceConfigUri)) {
                return window;
            }
        }
        return undefined;
    }
    exports.findWindowOnWorkspaceOrFolder = findWindowOnWorkspaceOrFolder;
    function findWindowOnExtensionDevelopmentPath(windows, extensionDevelopmentPaths) {
        const matches = (uriString) => {
            return extensionDevelopmentPaths.some(path => resources_1.extUriBiasedIgnorePathCase.isEqual(uri_1.URI.file(path), uri_1.URI.file(uriString)));
        };
        for (const window of windows) {
            // match on extension development path. the path can be one or more paths
            // so we check if any of the paths match on any of the provided ones
            if (window.config?.extensionDevelopmentPath?.some(path => matches(path))) {
                return window;
            }
        }
        return undefined;
    }
    exports.findWindowOnExtensionDevelopmentPath = findWindowOnExtensionDevelopmentPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c0ZpbmRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dpbmRvd3MvZWxlY3Ryb24tbWFpbi93aW5kb3dzRmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU96RixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsT0FBc0IsRUFBRSxPQUFZLEVBQUUsc0JBQW9HO1FBRWhMLGdHQUFnRztRQUNoRyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM3QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO1lBQ3pDLElBQUksSUFBQSxpQ0FBcUIsRUFBQyxTQUFTLENBQUMsRUFBRTtnQkFDckMsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVsRSxpRUFBaUU7Z0JBQ2pFLElBQUksaUJBQWlCLEVBQUU7b0JBQ3RCLElBQUksaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLHNDQUEwQixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7d0JBQzlHLE9BQU8sTUFBTSxDQUFDO3FCQUNkO2lCQUNEO2dCQUVELHVEQUF1RDtxQkFDbEQ7b0JBQ0osSUFBSSxzQ0FBMEIsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDOUUsT0FBTyxNQUFNLENBQUM7cUJBQ2Q7aUJBQ0Q7YUFDRDtTQUNEO1FBRUQsK0VBQStFO1FBQy9FLE1BQU0sNkJBQTZCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsNkNBQWlDLEVBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLHNDQUEwQixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzdNLElBQUksNkJBQTZCLENBQUMsTUFBTSxFQUFFO1lBQ3pDLE9BQU8sNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFFLE9BQU8sQ0FBQyxlQUFvRCxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFJLE9BQU8sQ0FBQyxlQUFvRCxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyTztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUEvQkQsNENBK0JDO0lBRUQsU0FBZ0IsNkJBQTZCLENBQUMsT0FBc0IsRUFBRSwwQkFBK0I7UUFFcEcsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFFN0Isa0NBQWtDO1lBQ2xDLElBQUksSUFBQSxpQ0FBcUIsRUFBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksc0NBQTBCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLDBCQUEwQixDQUFDLEVBQUU7Z0JBQ3ZKLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFFRCx3QkFBd0I7WUFDeEIsSUFBSSxJQUFBLDZDQUFpQyxFQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxzQ0FBMEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtnQkFDNUosT0FBTyxNQUFNLENBQUM7YUFDZDtTQUNEO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQWhCRCxzRUFnQkM7SUFHRCxTQUFnQixvQ0FBb0MsQ0FBQyxPQUFzQixFQUFFLHlCQUFtQztRQUUvRyxNQUFNLE9BQU8sR0FBRyxDQUFDLFNBQWlCLEVBQVcsRUFBRTtZQUM5QyxPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNDQUEwQixDQUFDLE9BQU8sQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hILENBQUMsQ0FBQztRQUVGLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO1lBRTdCLHlFQUF5RTtZQUN6RSxvRUFBb0U7WUFDcEUsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLHdCQUF3QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSxPQUFPLE1BQU0sQ0FBQzthQUNkO1NBQ0Q7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBaEJELG9GQWdCQyJ9