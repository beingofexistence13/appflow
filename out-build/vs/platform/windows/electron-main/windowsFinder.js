/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, resources_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R5b = exports.$Q5b = exports.$P5b = void 0;
    async function $P5b(windows, fileUri, localWorkspaceResolver) {
        // First check for windows with workspaces that have a parent folder of the provided path opened
        for (const window of windows) {
            const workspace = window.openedWorkspace;
            if ((0, workspace_1.$Qh)(workspace)) {
                const resolvedWorkspace = await localWorkspaceResolver(workspace);
                // resolved workspace: folders are known and can be compared with
                if (resolvedWorkspace) {
                    if (resolvedWorkspace.folders.some(folder => resources_1.$_f.isEqualOrParent(fileUri, folder.uri))) {
                        return window;
                    }
                }
                // unresolved: can only compare with workspace location
                else {
                    if (resources_1.$_f.isEqualOrParent(fileUri, workspace.configPath)) {
                        return window;
                    }
                }
            }
        }
        // Then go with single folder windows that are parent of the provided file path
        const singleFolderWindowsOnFilePath = windows.filter(window => (0, workspace_1.$Lh)(window.openedWorkspace) && resources_1.$_f.isEqualOrParent(fileUri, window.openedWorkspace.uri));
        if (singleFolderWindowsOnFilePath.length) {
            return singleFolderWindowsOnFilePath.sort((windowA, windowB) => -(windowA.openedWorkspace.uri.path.length - windowB.openedWorkspace.uri.path.length))[0];
        }
        return undefined;
    }
    exports.$P5b = $P5b;
    function $Q5b(windows, folderOrWorkspaceConfigUri) {
        for (const window of windows) {
            // check for workspace config path
            if ((0, workspace_1.$Qh)(window.openedWorkspace) && resources_1.$_f.isEqual(window.openedWorkspace.configPath, folderOrWorkspaceConfigUri)) {
                return window;
            }
            // check for folder path
            if ((0, workspace_1.$Lh)(window.openedWorkspace) && resources_1.$_f.isEqual(window.openedWorkspace.uri, folderOrWorkspaceConfigUri)) {
                return window;
            }
        }
        return undefined;
    }
    exports.$Q5b = $Q5b;
    function $R5b(windows, extensionDevelopmentPaths) {
        const matches = (uriString) => {
            return extensionDevelopmentPaths.some(path => resources_1.$_f.isEqual(uri_1.URI.file(path), uri_1.URI.file(uriString)));
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
    exports.$R5b = $R5b;
});
//# sourceMappingURL=windowsFinder.js.map