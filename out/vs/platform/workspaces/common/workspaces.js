/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/labels", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/workspace"], function (require, exports, extpath_1, json, jsonEdit, labels_1, network_1, path_1, platform_1, resources_1, uri_1, instantiation_1, remoteHosts_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toStoreData = exports.restoreRecentlyOpened = exports.rewriteWorkspaceFileForNewLocation = exports.toWorkspaceFolders = exports.getStoredWorkspaceFolder = exports.isStoredWorkspaceFolder = exports.isRecentFile = exports.isRecentFolder = exports.isRecentWorkspace = exports.IWorkspacesService = void 0;
    exports.IWorkspacesService = (0, instantiation_1.createDecorator)('workspacesService');
    function isRecentWorkspace(curr) {
        return curr.hasOwnProperty('workspace');
    }
    exports.isRecentWorkspace = isRecentWorkspace;
    function isRecentFolder(curr) {
        return curr.hasOwnProperty('folderUri');
    }
    exports.isRecentFolder = isRecentFolder;
    function isRecentFile(curr) {
        return curr.hasOwnProperty('fileUri');
    }
    exports.isRecentFile = isRecentFile;
    //#endregion
    //#region Workspace File Utilities
    function isStoredWorkspaceFolder(obj) {
        return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
    }
    exports.isStoredWorkspaceFolder = isStoredWorkspaceFolder;
    function isRawFileWorkspaceFolder(obj) {
        const candidate = obj;
        return typeof candidate?.path === 'string' && (!candidate.name || typeof candidate.name === 'string');
    }
    function isRawUriWorkspaceFolder(obj) {
        const candidate = obj;
        return typeof candidate?.uri === 'string' && (!candidate.name || typeof candidate.name === 'string');
    }
    /**
     * Given a folder URI and the workspace config folder, computes the `IStoredWorkspaceFolder`
     * using a relative or absolute path or a uri.
     * Undefined is returned if the `folderURI` and the `targetConfigFolderURI` don't have the
     * same schema or authority.
     *
     * @param folderURI a workspace folder
     * @param forceAbsolute if set, keep the path absolute
     * @param folderName a workspace name
     * @param targetConfigFolderURI the folder where the workspace is living in
     */
    function getStoredWorkspaceFolder(folderURI, forceAbsolute, folderName, targetConfigFolderURI, extUri) {
        // Scheme mismatch: use full absolute URI as `uri`
        if (folderURI.scheme !== targetConfigFolderURI.scheme) {
            return { name: folderName, uri: folderURI.toString(true) };
        }
        // Always prefer a relative path if possible unless
        // prevented to make the workspace file shareable
        // with other users
        let folderPath = !forceAbsolute ? extUri.relativePath(targetConfigFolderURI, folderURI) : undefined;
        if (folderPath !== undefined) {
            if (folderPath.length === 0) {
                folderPath = '.';
            }
            else {
                if (platform_1.isWindows) {
                    folderPath = massagePathForWindows(folderPath);
                }
            }
        }
        // We could not resolve a relative path
        else {
            // Local file: use `fsPath`
            if (folderURI.scheme === network_1.Schemas.file) {
                folderPath = folderURI.fsPath;
                if (platform_1.isWindows) {
                    folderPath = massagePathForWindows(folderPath);
                }
            }
            // Different authority: use full absolute URI
            else if (!extUri.isEqualAuthority(folderURI.authority, targetConfigFolderURI.authority)) {
                return { name: folderName, uri: folderURI.toString(true) };
            }
            // Non-local file: use `path` of URI
            else {
                folderPath = folderURI.path;
            }
        }
        return { name: folderName, path: folderPath };
    }
    exports.getStoredWorkspaceFolder = getStoredWorkspaceFolder;
    function massagePathForWindows(folderPath) {
        // Drive letter should be upper case
        folderPath = (0, labels_1.normalizeDriveLetter)(folderPath);
        // Always prefer slash over backslash unless
        // we deal with UNC paths where backslash is
        // mandatory.
        if (!(0, extpath_1.isUNC)(folderPath)) {
            folderPath = (0, extpath_1.toSlashes)(folderPath);
        }
        return folderPath;
    }
    function toWorkspaceFolders(configuredFolders, workspaceConfigFile, extUri) {
        const result = [];
        const seen = new Set();
        const relativeTo = extUri.dirname(workspaceConfigFile);
        for (const configuredFolder of configuredFolders) {
            let uri = undefined;
            if (isRawFileWorkspaceFolder(configuredFolder)) {
                if (configuredFolder.path) {
                    uri = extUri.resolvePath(relativeTo, configuredFolder.path);
                }
            }
            else if (isRawUriWorkspaceFolder(configuredFolder)) {
                try {
                    uri = uri_1.URI.parse(configuredFolder.uri);
                    if (uri.path[0] !== path_1.posix.sep) {
                        uri = uri.with({ path: path_1.posix.sep + uri.path }); // this makes sure all workspace folder are absolute
                    }
                }
                catch (e) {
                    console.warn(e); // ignore
                }
            }
            if (uri) {
                // remove duplicates
                const comparisonKey = extUri.getComparisonKey(uri);
                if (!seen.has(comparisonKey)) {
                    seen.add(comparisonKey);
                    const name = configuredFolder.name || extUri.basenameOrAuthority(uri);
                    result.push(new workspace_1.WorkspaceFolder({ uri, name, index: result.length }, configuredFolder));
                }
            }
        }
        return result;
    }
    exports.toWorkspaceFolders = toWorkspaceFolders;
    /**
     * Rewrites the content of a workspace file to be saved at a new location.
     * Throws an exception if file is not a valid workspace file
     */
    function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents, configPathURI, isFromUntitledWorkspace, targetConfigPathURI, extUri) {
        const storedWorkspace = doParseStoredWorkspace(configPathURI, rawWorkspaceContents);
        const sourceConfigFolder = extUri.dirname(configPathURI);
        const targetConfigFolder = extUri.dirname(targetConfigPathURI);
        const rewrittenFolders = [];
        for (const folder of storedWorkspace.folders) {
            const folderURI = isRawFileWorkspaceFolder(folder) ? extUri.resolvePath(sourceConfigFolder, folder.path) : uri_1.URI.parse(folder.uri);
            let absolute;
            if (isFromUntitledWorkspace) {
                absolute = false; // if it was an untitled workspace, try to make paths relative
            }
            else {
                absolute = !isRawFileWorkspaceFolder(folder) || (0, path_1.isAbsolute)(folder.path); // for existing workspaces, preserve whether a path was absolute or relative
            }
            rewrittenFolders.push(getStoredWorkspaceFolder(folderURI, absolute, folder.name, targetConfigFolder, extUri));
        }
        // Preserve as much of the existing workspace as possible by using jsonEdit
        // and only changing the folders portion.
        const formattingOptions = { insertSpaces: false, tabSize: 4, eol: (platform_1.isLinux || platform_1.isMacintosh) ? '\n' : '\r\n' };
        const edits = jsonEdit.setProperty(rawWorkspaceContents, ['folders'], rewrittenFolders, formattingOptions);
        let newContent = jsonEdit.applyEdits(rawWorkspaceContents, edits);
        if ((0, resources_1.isEqualAuthority)(storedWorkspace.remoteAuthority, (0, remoteHosts_1.getRemoteAuthority)(targetConfigPathURI))) {
            // unsaved remote workspaces have the remoteAuthority set. Remove it when no longer nexessary.
            newContent = jsonEdit.applyEdits(newContent, jsonEdit.removeProperty(newContent, ['remoteAuthority'], formattingOptions));
        }
        return newContent;
    }
    exports.rewriteWorkspaceFileForNewLocation = rewriteWorkspaceFileForNewLocation;
    function doParseStoredWorkspace(path, contents) {
        // Parse workspace file
        const storedWorkspace = json.parse(contents); // use fault tolerant parser
        // Filter out folders which do not have a path or uri set
        if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
            storedWorkspace.folders = storedWorkspace.folders.filter(folder => isStoredWorkspaceFolder(folder));
        }
        else {
            throw new Error(`${path} looks like an invalid workspace file.`);
        }
        return storedWorkspace;
    }
    function isSerializedRecentWorkspace(data) {
        return data.workspace && typeof data.workspace === 'object' && typeof data.workspace.id === 'string' && typeof data.workspace.configPath === 'string';
    }
    function isSerializedRecentFolder(data) {
        return typeof data.folderUri === 'string';
    }
    function isSerializedRecentFile(data) {
        return typeof data.fileUri === 'string';
    }
    function restoreRecentlyOpened(data, logService) {
        const result = { workspaces: [], files: [] };
        if (data) {
            const restoreGracefully = function (entries, onEntry) {
                for (let i = 0; i < entries.length; i++) {
                    try {
                        onEntry(entries[i], i);
                    }
                    catch (e) {
                        logService.warn(`Error restoring recent entry ${JSON.stringify(entries[i])}: ${e.toString()}. Skip entry.`);
                    }
                }
            };
            const storedRecents = data;
            if (Array.isArray(storedRecents.entries)) {
                restoreGracefully(storedRecents.entries, entry => {
                    const label = entry.label;
                    const remoteAuthority = entry.remoteAuthority;
                    if (isSerializedRecentWorkspace(entry)) {
                        result.workspaces.push({ label, remoteAuthority, workspace: { id: entry.workspace.id, configPath: uri_1.URI.parse(entry.workspace.configPath) } });
                    }
                    else if (isSerializedRecentFolder(entry)) {
                        result.workspaces.push({ label, remoteAuthority, folderUri: uri_1.URI.parse(entry.folderUri) });
                    }
                    else if (isSerializedRecentFile(entry)) {
                        result.files.push({ label, remoteAuthority, fileUri: uri_1.URI.parse(entry.fileUri) });
                    }
                });
            }
        }
        return result;
    }
    exports.restoreRecentlyOpened = restoreRecentlyOpened;
    function toStoreData(recents) {
        const serialized = { entries: [] };
        for (const recent of recents.workspaces) {
            if (isRecentFolder(recent)) {
                serialized.entries.push({ folderUri: recent.folderUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
            }
            else {
                serialized.entries.push({ workspace: { id: recent.workspace.id, configPath: recent.workspace.configPath.toString() }, label: recent.label, remoteAuthority: recent.remoteAuthority });
            }
        }
        for (const recent of recents.files) {
            serialized.entries.push({ fileUri: recent.fileUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
        }
        return serialized;
    }
    exports.toStoreData = toStoreData;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZXMvY29tbW9uL3dvcmtzcGFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJuRixRQUFBLGtCQUFrQixHQUFHLElBQUEsK0JBQWUsRUFBcUIsbUJBQW1CLENBQUMsQ0FBQztJQWtEM0YsU0FBZ0IsaUJBQWlCLENBQUMsSUFBYTtRQUM5QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUZELDhDQUVDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQWE7UUFDM0MsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFGRCx3Q0FFQztJQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFhO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRkQsb0NBRUM7SUFFRCxZQUFZO0lBRVosa0NBQWtDO0lBRWxDLFNBQWdCLHVCQUF1QixDQUFDLEdBQVk7UUFDbkQsT0FBTyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRkQsMERBRUM7SUFFRCxTQUFTLHdCQUF3QixDQUFDLEdBQVk7UUFDN0MsTUFBTSxTQUFTLEdBQUcsR0FBMEMsQ0FBQztRQUU3RCxPQUFPLE9BQU8sU0FBUyxFQUFFLElBQUksS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksT0FBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7SUFFRCxTQUFTLHVCQUF1QixDQUFDLEdBQVk7UUFDNUMsTUFBTSxTQUFTLEdBQUcsR0FB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