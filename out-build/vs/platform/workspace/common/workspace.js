/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/workspace/common/workspace", "vs/base/common/path", "vs/base/common/ternarySearchTree", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/network"], function (require, exports, nls_1, path_1, ternarySearchTree_1, resources_1, uri_1, instantiation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7h = exports.$6h = exports.$5h = exports.$4h = exports.$3h = exports.$2h = exports.$1h = exports.$Zh = exports.$Yh = exports.$Xh = exports.$Wh = exports.$Vh = exports.$Uh = exports.$Th = exports.$Sh = exports.WorkbenchState = exports.$Rh = exports.$Qh = exports.$Ph = exports.$Oh = exports.$Nh = exports.$Mh = exports.$Lh = exports.$Kh = void 0;
    exports.$Kh = (0, instantiation_1.$Bh)('contextService');
    function $Lh(obj) {
        const singleFolderIdentifier = obj;
        return typeof singleFolderIdentifier?.id === 'string' && uri_1.URI.isUri(singleFolderIdentifier.uri);
    }
    exports.$Lh = $Lh;
    function $Mh(obj) {
        const emptyWorkspaceIdentifier = obj;
        return typeof emptyWorkspaceIdentifier?.id === 'string'
            && !$Lh(obj)
            && !$Qh(obj);
    }
    exports.$Mh = $Mh;
    exports.$Nh = { id: 'ext-dev' };
    exports.$Oh = { id: 'empty-window' };
    function $Ph(arg0, isExtensionDevelopment) {
        // Empty workspace
        if (typeof arg0 === 'string' || typeof arg0 === 'undefined') {
            // With a backupPath, the basename is the empty workspace identifier
            if (typeof arg0 === 'string') {
                return {
                    id: (0, path_1.$ae)(arg0)
                };
            }
            // Extension development empty windows have backups disabled
            // so we return a constant workspace identifier for extension
            // authors to allow to restore their workspace state even then.
            if (isExtensionDevelopment) {
                return exports.$Nh;
            }
            return exports.$Oh;
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
    exports.$Ph = $Ph;
    function $Qh(obj) {
        const workspaceIdentifier = obj;
        return typeof workspaceIdentifier?.id === 'string' && uri_1.URI.isUri(workspaceIdentifier.configPath);
    }
    exports.$Qh = $Qh;
    function $Rh(identifier) {
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
    exports.$Rh = $Rh;
    var WorkbenchState;
    (function (WorkbenchState) {
        WorkbenchState[WorkbenchState["EMPTY"] = 1] = "EMPTY";
        WorkbenchState[WorkbenchState["FOLDER"] = 2] = "FOLDER";
        WorkbenchState[WorkbenchState["WORKSPACE"] = 3] = "WORKSPACE";
    })(WorkbenchState || (exports.WorkbenchState = WorkbenchState = {}));
    function $Sh(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && typeof candidate.id === 'string'
            && Array.isArray(candidate.folders));
    }
    exports.$Sh = $Sh;
    function $Th(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && uri_1.URI.isUri(candidate.uri)
            && typeof candidate.name === 'string'
            && typeof candidate.toResource === 'function');
    }
    exports.$Th = $Th;
    class $Uh {
        constructor(h, folders, j, k, l) {
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.c = ternarySearchTree_1.$Hh.forUris(this.l, () => true);
            this.folders = folders;
        }
        update(workspace) {
            this.h = workspace.id;
            this.k = workspace.configuration;
            this.j = workspace.transient;
            this.l = workspace.l;
            this.folders = workspace.folders;
        }
        get folders() {
            return this.g;
        }
        set folders(folders) {
            this.g = folders;
            this.n();
        }
        get id() {
            return this.h;
        }
        get transient() {
            return this.j;
        }
        get configuration() {
            return this.k;
        }
        set configuration(configuration) {
            this.k = configuration;
        }
        getFolder(resource) {
            if (!resource) {
                return null;
            }
            return this.c.findSubstr(resource) || null;
        }
        n() {
            this.c = ternarySearchTree_1.$Hh.forUris(this.l, () => true);
            for (const folder of this.folders) {
                this.c.set(folder.uri, folder);
            }
        }
        toJSON() {
            return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration };
        }
    }
    exports.$Uh = $Uh;
    class $Vh {
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
            return (0, resources_1.$ig)(this.uri, relativePath);
        }
        toJSON() {
            return { uri: this.uri, name: this.name, index: this.index };
        }
    }
    exports.$Vh = $Vh;
    function $Wh(resource) {
        return new $Vh({ uri: resource, index: 0, name: (0, resources_1.$eg)(resource) }, { uri: resource.toString() });
    }
    exports.$Wh = $Wh;
    exports.$Xh = 'code-workspace';
    exports.$Yh = `.${exports.$Xh}`;
    exports.$Zh = [{ name: (0, nls_1.localize)(0, null), extensions: [exports.$Xh] }];
    exports.$1h = 'workspace.json';
    function $2h(path, environmentService) {
        return resources_1.$_f.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
    }
    exports.$2h = $2h;
    function $3h(arg1) {
        let path;
        if (uri_1.URI.isUri(arg1)) {
            path = arg1;
        }
        else {
            path = arg1.configuration;
        }
        return path?.scheme === network_1.Schemas.tmp;
    }
    exports.$3h = $3h;
    exports.$4h = '4064f6ec-cb38-4ad0-af64-ee6467e63c82';
    function $5h(workspace) {
        return workspace.id === exports.$4h;
    }
    exports.$5h = $5h;
    function $6h(path, environmentService) {
        return !$2h(path, environmentService) && !$3h(path);
    }
    exports.$6h = $6h;
    function $7h(path) {
        const ext = (typeof path === 'string') ? (0, path_1.$be)(path) : (0, resources_1.$gg)(path);
        return ext === exports.$Yh;
    }
    exports.$7h = $7h;
});
//# sourceMappingURL=workspace.js.map