/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F5b = exports.$E5b = exports.$D5b = void 0;
    function $D5b(obj) {
        const candidate = obj;
        return typeof candidate?.backupFolder === 'string';
    }
    exports.$D5b = $D5b;
    function $E5b(serializedBackupWorkspaces) {
        let workspaceBackupInfos = [];
        try {
            if (Array.isArray(serializedBackupWorkspaces.workspaces)) {
                workspaceBackupInfos = serializedBackupWorkspaces.workspaces.map(workspace => ({
                    workspace: {
                        id: workspace.id,
                        configPath: uri_1.URI.parse(workspace.configURIPath)
                    },
                    remoteAuthority: workspace.remoteAuthority
                }));
            }
        }
        catch (e) {
            // ignore URI parsing exceptions
        }
        return workspaceBackupInfos;
    }
    exports.$E5b = $E5b;
    function $F5b(serializedBackupWorkspaces) {
        let folderBackupInfos = [];
        try {
            if (Array.isArray(serializedBackupWorkspaces.folders)) {
                folderBackupInfos = serializedBackupWorkspaces.folders.map(folder => ({
                    folderUri: uri_1.URI.parse(folder.folderUri),
                    remoteAuthority: folder.remoteAuthority
                }));
            }
        }
        catch (e) {
            // ignore URI parsing exceptions
        }
        return folderBackupInfos;
    }
    exports.$F5b = $F5b;
});
//# sourceMappingURL=backup.js.map