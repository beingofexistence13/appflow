/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/labels", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/workspace"], function (require, exports, extpath_1, json, jsonEdit, labels_1, network_1, path_1, platform_1, resources_1, uri_1, instantiation_1, remoteHosts_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oU = exports.$nU = exports.$mU = exports.$lU = exports.$kU = exports.$jU = exports.$iU = exports.$hU = exports.$gU = exports.$fU = void 0;
    exports.$fU = (0, instantiation_1.$Bh)('workspacesService');
    function $gU(curr) {
        return curr.hasOwnProperty('workspace');
    }
    exports.$gU = $gU;
    function $hU(curr) {
        return curr.hasOwnProperty('folderUri');
    }
    exports.$hU = $hU;
    function $iU(curr) {
        return curr.hasOwnProperty('fileUri');
    }
    exports.$iU = $iU;
    //#endregion
    //#region Workspace File Utilities
    function $jU(obj) {
        return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
    }
    exports.$jU = $jU;
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
    function $kU(folderURI, forceAbsolute, folderName, targetConfigFolderURI, extUri) {
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
                if (platform_1.$i) {
                    folderPath = massagePathForWindows(folderPath);
                }
            }
        }
        // We could not resolve a relative path
        else {
            // Local file: use `fsPath`
            if (folderURI.scheme === network_1.Schemas.file) {
                folderPath = folderURI.fsPath;
                if (platform_1.$i) {
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
    exports.$kU = $kU;
    function massagePathForWindows(folderPath) {
        // Drive letter should be upper case
        folderPath = (0, labels_1.$fA)(folderPath);
        // Always prefer slash over backslash unless
        // we deal with UNC paths where backslash is
        // mandatory.
        if (!(0, extpath_1.$Ff)(folderPath)) {
            folderPath = (0, extpath_1.$Cf)(folderPath);
        }
        return folderPath;
    }
    function $lU(configuredFolders, workspaceConfigFile, extUri) {
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
                    if (uri.path[0] !== path_1.$6d.sep) {
                        uri = uri.with({ path: path_1.$6d.sep + uri.path }); // this makes sure all workspace folder are absolute
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
                    result.push(new workspace_1.$Vh({ uri, name, index: result.length }, configuredFolder));
                }
            }
        }
        return result;
    }
    exports.$lU = $lU;
    /**
     * Rewrites the content of a workspace file to be saved at a new location.
     * Throws an exception if file is not a valid workspace file
     */
    function $mU(rawWorkspaceContents, configPathURI, isFromUntitledWorkspace, targetConfigPathURI, extUri) {
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
                absolute = !isRawFileWorkspaceFolder(folder) || (0, path_1.$8d)(folder.path); // for existing workspaces, preserve whether a path was absolute or relative
            }
            rewrittenFolders.push($kU(folderURI, absolute, folder.name, targetConfigFolder, extUri));
        }
        // Preserve as much of the existing workspace as possible by using jsonEdit
        // and only changing the folders portion.
        const formattingOptions = { insertSpaces: false, tabSize: 4, eol: (platform_1.$k || platform_1.$j) ? '\n' : '\r\n' };
        const edits = jsonEdit.$CS(rawWorkspaceContents, ['folders'], rewrittenFolders, formattingOptions);
        let newContent = jsonEdit.$FS(rawWorkspaceContents, edits);
        if ((0, resources_1.$ng)(storedWorkspace.remoteAuthority, (0, remoteHosts_1.$Ok)(targetConfigPathURI))) {
            // unsaved remote workspaces have the remoteAuthority set. Remove it when no longer nexessary.
            newContent = jsonEdit.$FS(newContent, jsonEdit.$BS(newContent, ['remoteAuthority'], formattingOptions));
        }
        return newContent;
    }
    exports.$mU = $mU;
    function doParseStoredWorkspace(path, contents) {
        // Parse workspace file
        const storedWorkspace = json.$Lm(contents); // use fault tolerant parser
        // Filter out folders which do not have a path or uri set
        if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
            storedWorkspace.folders = storedWorkspace.folders.filter(folder => $jU(folder));
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
    function $nU(data, logService) {
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
    exports.$nU = $nU;
    function $oU(recents) {
        const serialized = { entries: [] };
        for (const recent of recents.workspaces) {
            if ($hU(recent)) {
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
    exports.$oU = $oU;
});
//#endregion
//# sourceMappingURL=workspaces.js.map