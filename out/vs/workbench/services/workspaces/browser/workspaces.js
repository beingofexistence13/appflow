/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/hash"], function (require, exports, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSingleFolderWorkspaceIdentifier = exports.getWorkspaceIdentifier = void 0;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getWorkspaceIdentifier(workspaceUri) {
        return {
            id: getWorkspaceId(workspaceUri),
            configPath: workspaceUri
        };
    }
    exports.getWorkspaceIdentifier = getWorkspaceIdentifier;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getSingleFolderWorkspaceIdentifier(folderUri) {
        return {
            id: getWorkspaceId(folderUri),
            uri: folderUri
        };
    }
    exports.getSingleFolderWorkspaceIdentifier = getSingleFolderWorkspaceIdentifier;
    function getWorkspaceId(uri) {
        return (0, hash_1.hash)(uri.toString()).toString(16);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3Jrc3BhY2VzL2Jyb3dzZXIvd29ya3NwYWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcseURBQXlEO0lBQ3pELHlEQUF5RDtJQUN6RCx5REFBeUQ7SUFFekQsU0FBZ0Isc0JBQXNCLENBQUMsWUFBaUI7UUFDdkQsT0FBTztZQUNOLEVBQUUsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDO1lBQ2hDLFVBQVUsRUFBRSxZQUFZO1NBQ3hCLENBQUM7SUFDSCxDQUFDO0lBTEQsd0RBS0M7SUFFRCx5REFBeUQ7SUFDekQseURBQXlEO0lBQ3pELHlEQUF5RDtJQUV6RCxTQUFnQixrQ0FBa0MsQ0FBQyxTQUFjO1FBQ2hFLE9BQU87WUFDTixFQUFFLEVBQUUsY0FBYyxDQUFDLFNBQVMsQ0FBQztZQUM3QixHQUFHLEVBQUUsU0FBUztTQUNkLENBQUM7SUFDSCxDQUFDO0lBTEQsZ0ZBS0M7SUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFRO1FBQy9CLE9BQU8sSUFBQSxXQUFJLEVBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUMifQ==