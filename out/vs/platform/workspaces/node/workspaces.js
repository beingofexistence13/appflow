/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources"], function (require, exports, crypto_1, network_1, platform_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEmptyWorkspaceIdentifier = exports.getSingleFolderWorkspaceIdentifier = exports.getWorkspaceIdentifier = exports.NON_EMPTY_WORKSPACE_ID_LENGTH = void 0;
    /**
     * Length of workspace identifiers that are not empty. Those are
     * MD5 hashes (128bits / 4 due to hex presentation).
     */
    exports.NON_EMPTY_WORKSPACE_ID_LENGTH = 128 / 4;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getWorkspaceIdentifier(configPath) {
        function getWorkspaceId() {
            let configPathStr = configPath.scheme === network_1.Schemas.file ? (0, resources_1.originalFSPath)(configPath) : configPath.toString();
            if (!platform_1.isLinux) {
                configPathStr = configPathStr.toLowerCase(); // sanitize for platform file system
            }
            return (0, crypto_1.createHash)('md5').update(configPathStr).digest('hex');
        }
        return {
            id: getWorkspaceId(),
            configPath
        };
    }
    exports.getWorkspaceIdentifier = getWorkspaceIdentifier;
    function getSingleFolderWorkspaceIdentifier(folderUri, folderStat) {
        function getFolderId() {
            // Remote: produce a hash from the entire URI
            if (folderUri.scheme !== network_1.Schemas.file) {
                return (0, crypto_1.createHash)('md5').update(folderUri.toString()).digest('hex');
            }
            // Local: we use the ctime as extra salt to the
            // identifier so that folders getting recreated
            // result in a different identifier. However, if
            // the stat is not provided we return `undefined`
            // to ensure identifiers are stable for the given
            // URI.
            if (!folderStat) {
                return undefined;
            }
            let ctime;
            if (platform_1.isLinux) {
                ctime = folderStat.ino; // Linux: birthtime is ctime, so we cannot use it! We use the ino instead!
            }
            else if (platform_1.isMacintosh) {
                ctime = folderStat.birthtime.getTime(); // macOS: birthtime is fine to use as is
            }
            else if (platform_1.isWindows) {
                if (typeof folderStat.birthtimeMs === 'number') {
                    ctime = Math.floor(folderStat.birthtimeMs); // Windows: fix precision issue in node.js 8.x to get 7.x results (see https://github.com/nodejs/node/issues/19897)
                }
                else {
                    ctime = folderStat.birthtime.getTime();
                }
            }
            return (0, crypto_1.createHash)('md5').update(folderUri.fsPath).update(ctime ? String(ctime) : '').digest('hex');
        }
        const folderId = getFolderId();
        if (typeof folderId === 'string') {
            return {
                id: folderId,
                uri: folderUri
            };
        }
        return undefined; // invalid folder
    }
    exports.getSingleFolderWorkspaceIdentifier = getSingleFolderWorkspaceIdentifier;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function createEmptyWorkspaceIdentifier() {
        return {
            id: (Date.now() + Math.round(Math.random() * 1000)).toString()
        };
    }
    exports.createEmptyWorkspaceIdentifier = createEmptyWorkspaceIdentifier;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZXMvbm9kZS93b3Jrc3BhY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRzs7O09BR0c7SUFDVSxRQUFBLDZCQUE2QixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFFckQseURBQXlEO0lBQ3pELHlEQUF5RDtJQUN6RCx5REFBeUQ7SUFFekQsU0FBZ0Isc0JBQXNCLENBQUMsVUFBZTtRQUVyRCxTQUFTLGNBQWM7WUFDdEIsSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBQSwwQkFBYyxFQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDNUcsSUFBSSxDQUFDLGtCQUFPLEVBQUU7Z0JBQ2IsYUFBYSxHQUFHLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLG9DQUFvQzthQUNqRjtZQUVELE9BQU8sSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELE9BQU87WUFDTixFQUFFLEVBQUUsY0FBYyxFQUFFO1lBQ3BCLFVBQVU7U0FDVixDQUFDO0lBQ0gsQ0FBQztJQWZELHdEQWVDO0lBUUQsU0FBZ0Isa0NBQWtDLENBQUMsU0FBYyxFQUFFLFVBQWtCO1FBRXBGLFNBQVMsV0FBVztZQUVuQiw2Q0FBNkM7WUFDN0MsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFO2dCQUN0QyxPQUFPLElBQUEsbUJBQVUsRUFBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BFO1lBRUQsK0NBQStDO1lBQy9DLCtDQUErQztZQUMvQyxnREFBZ0Q7WUFDaEQsaURBQWlEO1lBQ2pELGlEQUFpRDtZQUNqRCxPQUFPO1lBRVAsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLEtBQXlCLENBQUM7WUFDOUIsSUFBSSxrQkFBTyxFQUFFO2dCQUNaLEtBQUssR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsMEVBQTBFO2FBQ2xHO2lCQUFNLElBQUksc0JBQVcsRUFBRTtnQkFDdkIsS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyx3Q0FBd0M7YUFDaEY7aUJBQU0sSUFBSSxvQkFBUyxFQUFFO2dCQUNyQixJQUFJLE9BQU8sVUFBVSxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUU7b0JBQy9DLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLG1IQUFtSDtpQkFDL0o7cUJBQU07b0JBQ04sS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ3ZDO2FBQ0Q7WUFFRCxPQUFPLElBQUEsbUJBQVUsRUFBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BHLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxXQUFXLEVBQUUsQ0FBQztRQUMvQixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUNqQyxPQUFPO2dCQUNOLEVBQUUsRUFBRSxRQUFRO2dCQUNaLEdBQUcsRUFBRSxTQUFTO2FBQ2QsQ0FBQztTQUNGO1FBRUQsT0FBTyxTQUFTLENBQUMsQ0FBQyxpQkFBaUI7SUFDcEMsQ0FBQztJQTdDRCxnRkE2Q0M7SUFFRCx5REFBeUQ7SUFDekQseURBQXlEO0lBQ3pELHlEQUF5RDtJQUV6RCxTQUFnQiw4QkFBOEI7UUFDN0MsT0FBTztZQUNOLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtTQUM5RCxDQUFDO0lBQ0gsQ0FBQztJQUpELHdFQUlDIn0=