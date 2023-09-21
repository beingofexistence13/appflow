/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeFolderInfos = exports.deserializeWorkspaceInfos = exports.isEmptyWindowBackupInfo = void 0;
    function isEmptyWindowBackupInfo(obj) {
        const candidate = obj;
        return typeof candidate?.backupFolder === 'string';
    }
    exports.isEmptyWindowBackupInfo = isEmptyWindowBackupInfo;
    function deserializeWorkspaceInfos(serializedBackupWorkspaces) {
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
    exports.deserializeWorkspaceInfos = deserializeWorkspaceInfos;
    function deserializeFolderInfos(serializedBackupWorkspaces) {
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
    exports.deserializeFolderInfos = deserializeFolderInfos;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYmFja3VwL25vZGUvYmFja3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxTQUFnQix1QkFBdUIsQ0FBQyxHQUFZO1FBQ25ELE1BQU0sU0FBUyxHQUFHLEdBQXlDLENBQUM7UUFFNUQsT0FBTyxPQUFPLFNBQVMsRUFBRSxZQUFZLEtBQUssUUFBUSxDQUFDO0lBQ3BELENBQUM7SUFKRCwwREFJQztJQVFELFNBQWdCLHlCQUF5QixDQUFDLDBCQUF1RDtRQUNoRyxJQUFJLG9CQUFvQixHQUEyQixFQUFFLENBQUM7UUFDdEQsSUFBSTtZQUNILElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDekQsb0JBQW9CLEdBQUcsMEJBQTBCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQzdFO29CQUNDLFNBQVMsRUFBRTt3QkFDVixFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUU7d0JBQ2hCLFVBQVUsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7cUJBQzlDO29CQUNELGVBQWUsRUFBRSxTQUFTLENBQUMsZUFBZTtpQkFDMUMsQ0FDRCxDQUFDLENBQUM7YUFDSDtTQUNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDWCxnQ0FBZ0M7U0FDaEM7UUFFRCxPQUFPLG9CQUFvQixDQUFDO0lBQzdCLENBQUM7SUFuQkQsOERBbUJDO0lBT0QsU0FBZ0Isc0JBQXNCLENBQUMsMEJBQXVEO1FBQzdGLElBQUksaUJBQWlCLEdBQXdCLEVBQUUsQ0FBQztRQUNoRCxJQUFJO1lBQ0gsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN0RCxpQkFBaUIsR0FBRywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FDcEU7b0JBQ0MsU0FBUyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztvQkFDdEMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlO2lCQUN2QyxDQUNELENBQUMsQ0FBQzthQUNIO1NBQ0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLGdDQUFnQztTQUNoQztRQUVELE9BQU8saUJBQWlCLENBQUM7SUFDMUIsQ0FBQztJQWhCRCx3REFnQkMifQ==