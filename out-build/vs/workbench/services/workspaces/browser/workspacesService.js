/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/workspaces/common/workspaces", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/workbench/services/workspaces/browser/workspaces", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/base/common/buffer", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network"], function (require, exports, extensions_1, workspaces_1, event_1, storage_1, workspace_1, log_1, lifecycle_1, workspaces_2, files_1, environmentService_1, resources_1, buffer_1, uriIdentity_1, network_1) {
    "use strict";
    var $73b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$73b = void 0;
    let $73b = class $73b extends lifecycle_1.$kc {
        static { $73b_1 = this; }
        static { this.RECENTLY_OPENED_KEY = 'recently.opened'; }
        constructor(b, c, f, g, h, j) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeRecentlyOpened = this.a.event;
            // Opening a workspace should push it as most
            // recently used to the workspaces history
            this.r();
            this.m();
        }
        m() {
            // Storage
            this.B(this.b.onDidChangeValue(-1 /* StorageScope.APPLICATION */, $73b_1.RECENTLY_OPENED_KEY, this.B(new lifecycle_1.$jc()))(() => this.a.fire()));
            // Workspace
            this.B(this.c.onDidChangeWorkspaceFolders(e => this.n(e)));
        }
        n(e) {
            if (!(0, workspace_1.$3h)(this.c.getWorkspace())) {
                return;
            }
            // When in a temporary workspace, make sure to track folder changes
            // in the history so that these can later be restored.
            for (const folder of e.added) {
                this.addRecentlyOpened([{ folderUri: folder.uri }]);
            }
        }
        r() {
            const workspace = this.c.getWorkspace();
            const remoteAuthority = this.h.remoteAuthority;
            switch (this.c.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */:
                    this.addRecentlyOpened([{ folderUri: workspace.folders[0].uri, remoteAuthority }]);
                    break;
                case 3 /* WorkbenchState.WORKSPACE */:
                    this.addRecentlyOpened([{ workspace: { id: workspace.id, configPath: workspace.configuration }, remoteAuthority }]);
                    break;
            }
        }
        //#region Workspaces History
        async getRecentlyOpened() {
            const recentlyOpenedRaw = this.b.get($73b_1.RECENTLY_OPENED_KEY, -1 /* StorageScope.APPLICATION */);
            if (recentlyOpenedRaw) {
                const recentlyOpened = (0, workspaces_1.$nU)(JSON.parse(recentlyOpenedRaw), this.f);
                recentlyOpened.workspaces = recentlyOpened.workspaces.filter(recent => {
                    // In web, unless we are in a temporary workspace, we cannot support
                    // to switch to local folders because this would require a window
                    // reload and local file access only works with explicit user gesture
                    // from the current session.
                    if ((0, workspaces_1.$hU)(recent) && recent.folderUri.scheme === network_1.Schemas.file && !(0, workspace_1.$3h)(this.c.getWorkspace())) {
                        return false;
                    }
                    // Never offer temporary workspaces in the history
                    if ((0, workspaces_1.$gU)(recent) && (0, workspace_1.$3h)(recent.workspace.configPath)) {
                        return false;
                    }
                    return true;
                });
                return recentlyOpened;
            }
            return { workspaces: [], files: [] };
        }
        async addRecentlyOpened(recents) {
            const recentlyOpened = await this.getRecentlyOpened();
            for (const recent of recents) {
                if ((0, workspaces_1.$iU)(recent)) {
                    this.s(recentlyOpened, [recent.fileUri]);
                    recentlyOpened.files.unshift(recent);
                }
                else if ((0, workspaces_1.$hU)(recent)) {
                    this.s(recentlyOpened, [recent.folderUri]);
                    recentlyOpened.workspaces.unshift(recent);
                }
                else {
                    this.s(recentlyOpened, [recent.workspace.configPath]);
                    recentlyOpened.workspaces.unshift(recent);
                }
            }
            return this.t(recentlyOpened);
        }
        async removeRecentlyOpened(paths) {
            const recentlyOpened = await this.getRecentlyOpened();
            this.s(recentlyOpened, paths);
            return this.t(recentlyOpened);
        }
        s(recentlyOpened, paths) {
            recentlyOpened.files = recentlyOpened.files.filter(file => {
                return !paths.some(path => path.toString() === file.fileUri.toString());
            });
            recentlyOpened.workspaces = recentlyOpened.workspaces.filter(workspace => {
                return !paths.some(path => path.toString() === ((0, workspaces_1.$hU)(workspace) ? workspace.folderUri.toString() : workspace.workspace.configPath.toString()));
            });
        }
        async t(data) {
            return this.b.store($73b_1.RECENTLY_OPENED_KEY, JSON.stringify((0, workspaces_1.$oU)(data)), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        async clearRecentlyOpened() {
            this.b.remove($73b_1.RECENTLY_OPENED_KEY, -1 /* StorageScope.APPLICATION */);
        }
        //#endregion
        //#region Workspace Management
        async enterWorkspace(workspaceUri) {
            return { workspace: await this.getWorkspaceIdentifier(workspaceUri) };
        }
        async createUntitledWorkspace(folders, remoteAuthority) {
            const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
            const newUntitledWorkspacePath = (0, resources_1.$ig)(this.h.untitledWorkspacesHome, `Untitled-${randomId}.${workspace_1.$Xh}`);
            // Build array of workspace folders to store
            const storedWorkspaceFolder = [];
            if (folders) {
                for (const folder of folders) {
                    storedWorkspaceFolder.push((0, workspaces_1.$kU)(folder.uri, true, folder.name, this.h.untitledWorkspacesHome, this.j.extUri));
                }
            }
            // Store at untitled workspaces location
            const storedWorkspace = { folders: storedWorkspaceFolder, remoteAuthority };
            await this.g.writeFile(newUntitledWorkspacePath, buffer_1.$Fd.fromString(JSON.stringify(storedWorkspace, null, '\t')));
            return this.getWorkspaceIdentifier(newUntitledWorkspacePath);
        }
        async deleteUntitledWorkspace(workspace) {
            try {
                await this.g.del(workspace.configPath);
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error; // re-throw any other error than file not found which is OK
                }
            }
        }
        async getWorkspaceIdentifier(workspaceUri) {
            return (0, workspaces_2.$sU)(workspaceUri);
        }
        //#endregion
        //#region Dirty Workspaces
        async getDirtyWorkspaces() {
            return []; // Currently not supported in web
        }
    };
    exports.$73b = $73b;
    exports.$73b = $73b = $73b_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, workspace_1.$Kh),
        __param(2, log_1.$5i),
        __param(3, files_1.$6j),
        __param(4, environmentService_1.$hJ),
        __param(5, uriIdentity_1.$Ck)
    ], $73b);
    (0, extensions_1.$mr)(workspaces_1.$fU, $73b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspacesService.js.map