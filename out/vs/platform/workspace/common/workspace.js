/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/ternarySearchTree", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/network"], function (require, exports, nls_1, path_1, ternarySearchTree_1, resources_1, uri_1, instantiation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasWorkspaceFileExtension = exports.isSavedWorkspace = exports.isStandaloneEditorWorkspace = exports.STANDALONE_EDITOR_WORKSPACE_ID = exports.isTemporaryWorkspace = exports.isUntitledWorkspace = exports.UNTITLED_WORKSPACE_NAME = exports.WORKSPACE_FILTER = exports.WORKSPACE_SUFFIX = exports.WORKSPACE_EXTENSION = exports.toWorkspaceFolder = exports.WorkspaceFolder = exports.Workspace = exports.isWorkspaceFolder = exports.isWorkspace = exports.WorkbenchState = exports.reviveIdentifier = exports.isWorkspaceIdentifier = exports.toWorkspaceIdentifier = exports.UNKNOWN_EMPTY_WINDOW_WORKSPACE = exports.EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = exports.isEmptyWorkspaceIdentifier = exports.isSingleFolderWorkspaceIdentifier = exports.IWorkspaceContextService = void 0;
    exports.IWorkspaceContextService = (0, instantiation_1.createDecorator)('contextService');
    function isSingleFolderWorkspaceIdentifier(obj) {
        const singleFolderIdentifier = obj;
        return typeof singleFolderIdentifier?.id === 'string' && uri_1.URI.isUri(singleFolderIdentifier.uri);
    }
    exports.isSingleFolderWorkspaceIdentifier = isSingleFolderWorkspaceIdentifier;
    function isEmptyWorkspaceIdentifier(obj) {
        const emptyWorkspaceIdentifier = obj;
        return typeof emptyWorkspaceIdentifier?.id === 'string'
            && !isSingleFolderWorkspaceIdentifier(obj)
            && !isWorkspaceIdentifier(obj);
    }
    exports.isEmptyWorkspaceIdentifier = isEmptyWorkspaceIdentifier;
    exports.EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: 'ext-dev' };
    exports.UNKNOWN_EMPTY_WINDOW_WORKSPACE = { id: 'empty-window' };
    function toWorkspaceIdentifier(arg0, isExtensionDevelopment) {
        // Empty workspace
        if (typeof arg0 === 'string' || typeof arg0 === 'undefined') {
            // With a backupPath, the basename is the empty workspace identifier
            if (typeof arg0 === 'string') {
                return {
                    id: (0, path_1.basename)(arg0)
                };
            }
            // Extension development empty windows have backups disabled
            // so we return a constant workspace identifier for extension
            // authors to allow to restore their workspace state even then.
            if (isExtensionDevelopment) {
                return exports.EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE;
            }
            return exports.UNKNOWN_EMPTY_WINDOW_WORKSPACE;
        }
        // Multi root
        const workspace = arg0;
        if (workspace.configuration) {
            return {
                id: workspace.id,
                configPath: workspace.configuration
            };
        }
        // Single folder
        if (workspace.folders.length === 1) {
            return {
                id: workspace.id,
                uri: workspace.folders[0].uri
            };
        }
        // Empty window
        return {
            id: workspace.id
        };
    }
    exports.toWorkspaceIdentifier = toWorkspaceIdentifier;
    function isWorkspaceIdentifier(obj) {
        const workspaceIdentifier = obj;
        return typeof workspaceIdentifier?.id === 'string' && uri_1.URI.isUri(workspaceIdentifier.configPath);
    }
    exports.isWorkspaceIdentifier = isWorkspaceIdentifier;
    function reviveIdentifier(identifier) {
        // Single Folder
        const singleFolderIdentifierCandidate = identifier;
        if (singleFolderIdentifierCandidate?.uri) {
            return { id: singleFolderIdentifierCandidate.id, uri: uri_1.URI.revive(singleFolderIdentifierCandidate.uri) };
        }
        // Multi folder
        const workspaceIdentifierCandidate = identifier;
        if (workspaceIdentifierCandidate?.configPath) {
            return { id: workspaceIdentifierCandidate.id, configPath: uri_1.URI.revive(workspaceIdentifierCandidate.configPath) };
        }
        // Empty
        if (identifier?.id) {
            return { id: identifier.id };
        }
        return undefined;
    }
    exports.reviveIdentifier = reviveIdentifier;
    var WorkbenchState;
    (function (WorkbenchState) {
        WorkbenchState[WorkbenchState["EMPTY"] = 1] = "EMPTY";
        WorkbenchState[WorkbenchState["FOLDER"] = 2] = "FOLDER";
        WorkbenchState[WorkbenchState["WORKSPACE"] = 3] = "WORKSPACE";
    })(WorkbenchState || (exports.WorkbenchState = WorkbenchState = {}));
    function isWorkspace(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && typeof candidate.id === 'string'
            && Array.isArray(candidate.folders));
    }
    exports.isWorkspace = isWorkspace;
    function isWorkspaceFolder(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && uri_1.URI.isUri(candidate.uri)
            && typeof candidate.name === 'string'
            && typeof candidate.toResource === 'function');
    }
    exports.isWorkspaceFolder = isWorkspaceFolder;
    class Workspace {
        constructor(_id, folders, _transient, _configuration, _ignorePathCasing) {
            this._id = _id;
            this._transient = _transient;
            this._configuration = _configuration;
            this._ignorePathCasing = _ignorePathCasing;
            this._foldersMap = ternarySearchTree_1.TernarySearchTree.forUris(this._ignorePathCasing, () => true);
            this.folders = folders;
        }
        update(workspace) {
            this._id = workspace.id;
            this._configuration = workspace.configuration;
            this._transient = workspace.transient;
            this._ignorePathCasing = workspace._ignorePathCasing;
            this.folders = workspace.folders;
        }
        get folders() {
            return this._folders;
        }
        set folders(folders) {
            this._folders = folders;
            this.updateFoldersMap();
        }
        get id() {
            return this._id;
        }
        get transient() {
            return this._transient;
        }
        get configuration() {
            return this._configuration;
        }
        set configuration(configuration) {
            this._configuration = configuration;
        }
        getFolder(resource) {
            if (!resource) {
                return null;
            }
            return this._foldersMap.findSubstr(resource) || null;
        }
        updateFoldersMap() {
            this._foldersMap = ternarySearchTree_1.TernarySearchTree.forUris(this._ignorePathCasing, () => true);
            for (const folder of this.folders) {
                this._foldersMap.set(folder.uri, folder);
            }
        }
        toJSON() {
            return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration };
        }
    }
    exports.Workspace = Workspace;
    class WorkspaceFolder {
        constructor(data, 
        /**
         * Provides access to the original metadata for this workspace
         * folder. This can be different from the metadata provided in
         * this class:
         * - raw paths can be relative
         * - raw paths are not normalized
         */
        raw) {
            this.raw = raw;
            this.uri = data.uri;
            this.index = data.index;
            this.name = data.name;
        }
        toResource(relativePath) {
            return (0, resources_1.joinPath)(this.uri, relativePath);
        }
        toJSON() {
            return { uri: this.uri, name: this.name, index: this.index };
        }
    }
    exports.WorkspaceFolder = WorkspaceFolder;
    function toWorkspaceFolder(resource) {
        return new WorkspaceFolder({ uri: resource, index: 0, name: (0, resources_1.basenameOrAuthority)(resource) }, { uri: resource.toString() });
    }
    exports.toWorkspaceFolder = toWorkspaceFolder;
    exports.WORKSPACE_EXTENSION = 'code-workspace';
    exports.WORKSPACE_SUFFIX = `.${exports.WORKSPACE_EXTENSION}`;
    exports.WORKSPACE_FILTER = [{ name: (0, nls_1.localize)('codeWorkspace', "Code Workspace"), extensions: [exports.WORKSPACE_EXTENSION] }];
    exports.UNTITLED_WORKSPACE_NAME = 'workspace.json';
    function isUntitledWorkspace(path, environmentService) {
        return resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
    }
    exports.isUntitledWorkspace = isUntitledWorkspace;
    function isTemporaryWorkspace(arg1) {
        let path;
        if (uri_1.URI.isUri(arg1)) {
            path = arg1;
        }
        else {
            path = arg1.configuration;
        }
        return path?.scheme === network_1.Schemas.tmp;
    }
    exports.isTemporaryWorkspace = isTemporaryWorkspace;
    exports.STANDALONE_EDITOR_WORKSPACE_ID = '4064f6ec-cb38-4ad0-af64-ee6467e63c82';
    function isStandaloneEditorWorkspace(workspace) {
        return workspace.id === exports.STANDALONE_EDITOR_WORKSPACE_ID;
    }
    exports.isStandaloneEditorWorkspace = isStandaloneEditorWorkspace;
    function isSavedWorkspace(path, environmentService) {
        return !isUntitledWorkspace(path, environmentService) && !isTemporaryWorkspace(path);
    }
    exports.isSavedWorkspace = isSavedWorkspace;
    function hasWorkspaceFileExtension(path) {
        const ext = (typeof path === 'string') ? (0, path_1.extname)(path) : (0, resources_1.extname)(path);
        return ext === exports.WORKSPACE_SUFFIX;
    }
    exports.hasWorkspaceFileExtension = hasWorkspaceFileExtension;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlL2NvbW1vbi93b3Jrc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWW5GLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSwrQkFBZSxFQUEyQixnQkFBZ0IsQ0FBQyxDQUFDO0lBeUhwRyxTQUFnQixpQ0FBaUMsQ0FBQyxHQUFZO1FBQzdELE1BQU0sc0JBQXNCLEdBQUcsR0FBbUQsQ0FBQztRQUVuRixPQUFPLE9BQU8sc0JBQXNCLEVBQUUsRUFBRSxLQUFLLFFBQVEsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFKRCw4RUFJQztJQUVELFNBQWdCLDBCQUEwQixDQUFDLEdBQVk7UUFDdEQsTUFBTSx3QkFBd0IsR0FBRyxHQUE0QyxDQUFDO1FBQzlFLE9BQU8sT0FBTyx3QkFBd0IsRUFBRSxFQUFFLEtBQUssUUFBUTtlQUNuRCxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQztlQUN2QyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFMRCxnRUFLQztJQUVZLFFBQUEsNENBQTRDLEdBQThCLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDO0lBQzVGLFFBQUEsOEJBQThCLEdBQThCLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDO0lBSWhHLFNBQWdCLHFCQUFxQixDQUFDLElBQXFDLEVBQUUsc0JBQWdDO1FBRTVHLGtCQUFrQjtRQUNsQixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFFNUQsb0VBQW9FO1lBQ3BFLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUM3QixPQUFPO29C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