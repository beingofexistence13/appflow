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
define(["require", "exports", "electron", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/node/pfs", "vs/nls!vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/backup/electron-main/backup", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/windows/electron-main/windowsFinder", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/node/workspaces"], function (require, exports, electron_1, event_1, json_1, lifecycle_1, network_1, path_1, resources_1, pfs_1, nls_1, backup_1, dialogMainService_1, environmentMainService_1, instantiation_1, log_1, userDataProfile_1, windowsFinder_1, workspace_1, workspaces_1, workspaces_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T5b = exports.$S5b = void 0;
    exports.$S5b = (0, instantiation_1.$Bh)('workspacesManagementMainService');
    let $T5b = class $T5b extends lifecycle_1.$kc {
        constructor(g, h, j, m, n) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = this.B(new event_1.$fd());
            this.onDidDeleteUntitledWorkspace = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidEnterWorkspace = this.b.event;
            this.c = this.g.untitledWorkspacesHome; // local URI that contains all untitled workspaces
            this.f = [];
        }
        async initialize() {
            // Reset
            this.f = [];
            // Resolve untitled workspaces
            try {
                const untitledWorkspacePaths = (await pfs_1.Promises.readdir(this.c.with({ scheme: network_1.Schemas.file }).fsPath)).map(folder => (0, resources_1.$ig)(this.c, folder, workspace_1.$1h)); //
                for (const untitledWorkspacePath of untitledWorkspacePaths) {
                    const workspace = (0, workspaces_2.$I5b)(untitledWorkspacePath);
                    const resolvedWorkspace = await this.resolveLocalWorkspace(untitledWorkspacePath);
                    if (!resolvedWorkspace) {
                        await this.deleteUntitledWorkspace(workspace);
                    }
                    else {
                        this.f.push({ workspace, remoteAuthority: resolvedWorkspace.remoteAuthority });
                    }
                }
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    this.h.warn(`Unable to read folders in ${this.c} (${error}).`);
                }
            }
        }
        resolveLocalWorkspace(uri) {
            return this.r(uri, path => pfs_1.Promises.readFile(path, 'utf8'));
        }
        r(uri, contentsFn) {
            if (!this.s(uri)) {
                return undefined; // does not look like a valid workspace config file
            }
            if (uri.scheme !== network_1.Schemas.file) {
                return undefined;
            }
            try {
                const contents = contentsFn(uri.fsPath);
                if (contents instanceof Promise) {
                    return contents.then(value => this.t(uri, value), error => undefined /* invalid workspace */);
                }
                else {
                    return this.t(uri, contents);
                }
            }
            catch {
                return undefined; // invalid workspace
            }
        }
        s(uri) {
            return (0, workspace_1.$2h)(uri, this.g) || (0, workspace_1.$7h)(uri);
        }
        t(path, contents) {
            try {
                const workspace = this.u(path, contents);
                const workspaceIdentifier = (0, workspaces_2.$I5b)(path);
                return {
                    id: workspaceIdentifier.id,
                    configPath: workspaceIdentifier.configPath,
                    folders: (0, workspaces_1.$lU)(workspace.folders, workspaceIdentifier.configPath, resources_1.$_f),
                    remoteAuthority: workspace.remoteAuthority,
                    transient: workspace.transient
                };
            }
            catch (error) {
                this.h.warn(error.toString());
            }
            return undefined;
        }
        u(path, contents) {
            // Parse workspace file
            const storedWorkspace = (0, json_1.$Lm)(contents); // use fault tolerant parser
            // Filter out folders which do not have a path or uri set
            if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
                storedWorkspace.folders = storedWorkspace.folders.filter(folder => (0, workspaces_1.$jU)(folder));
            }
            else {
                throw new Error(`${path.toString(true)} looks like an invalid workspace file.`);
            }
            return storedWorkspace;
        }
        async createUntitledWorkspace(folders, remoteAuthority) {
            const { workspace, storedWorkspace } = this.w(folders, remoteAuthority);
            const configPath = workspace.configPath.fsPath;
            await pfs_1.Promises.mkdir((0, path_1.$_d)(configPath), { recursive: true });
            await pfs_1.Promises.writeFile(configPath, JSON.stringify(storedWorkspace, null, '\t'));
            this.f.push({ workspace, remoteAuthority });
            return workspace;
        }
        w(folders = [], remoteAuthority) {
            const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
            const untitledWorkspaceConfigFolder = (0, resources_1.$ig)(this.c, randomId);
            const untitledWorkspaceConfigPath = (0, resources_1.$ig)(untitledWorkspaceConfigFolder, workspace_1.$1h);
            const storedWorkspaceFolder = [];
            for (const folder of folders) {
                storedWorkspaceFolder.push((0, workspaces_1.$kU)(folder.uri, true, folder.name, untitledWorkspaceConfigFolder, resources_1.$_f));
            }
            return {
                workspace: (0, workspaces_2.$I5b)(untitledWorkspaceConfigPath),
                storedWorkspace: { folders: storedWorkspaceFolder, remoteAuthority }
            };
        }
        async getWorkspaceIdentifier(configPath) {
            return (0, workspaces_2.$I5b)(configPath);
        }
        isUntitledWorkspace(workspace) {
            return (0, workspace_1.$2h)(workspace.configPath, this.g);
        }
        async deleteUntitledWorkspace(workspace) {
            if (!this.isUntitledWorkspace(workspace)) {
                return; // only supported for untitled workspaces
            }
            // Delete from disk
            await this.y(workspace);
            // unset workspace from profiles
            if (this.j.isEnabled()) {
                this.j.unsetWorkspace(workspace);
            }
            // Event
            this.a.fire(workspace);
        }
        async y(workspace) {
            const configPath = (0, resources_1.$9f)(workspace.configPath);
            try {
                // Delete Workspace
                await pfs_1.Promises.rm((0, path_1.$_d)(configPath));
                // Mark Workspace Storage to be deleted
                const workspaceStoragePath = (0, path_1.$9d)(this.g.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, workspace.id);
                if (await pfs_1.Promises.exists(workspaceStoragePath)) {
                    await pfs_1.Promises.writeFile((0, path_1.$9d)(workspaceStoragePath, 'obsolete'), '');
                }
                // Remove from list
                this.f = this.f.filter(untitledWorkspace => untitledWorkspace.workspace.id !== workspace.id);
            }
            catch (error) {
                this.h.warn(`Unable to delete untitled workspace ${configPath} (${error}).`);
            }
        }
        getUntitledWorkspaces() {
            return this.f;
        }
        async enterWorkspace(window, windows, path) {
            if (!window || !window.win || !window.isReady) {
                return undefined; // return early if the window is not ready or disposed
            }
            const isValid = await this.z(window, windows, path);
            if (!isValid) {
                return undefined; // return early if the workspace is not valid
            }
            const result = await this.C(window, (0, workspaces_2.$I5b)(path));
            if (!result) {
                return undefined;
            }
            // Emit as event
            this.b.fire({ window, workspace: result.workspace });
            return result;
        }
        async z(window, windows, workspacePath) {
            if (!workspacePath) {
                return true;
            }
            if ((0, workspace_1.$Qh)(window.openedWorkspace) && resources_1.$_f.isEqual(window.openedWorkspace.configPath, workspacePath)) {
                return false; // window is already opened on a workspace with that path
            }
            // Prevent overwriting a workspace that is currently opened in another window
            if ((0, windowsFinder_1.$Q5b)(windows, workspacePath)) {
                await this.n.showMessageBox({
                    type: 'info',
                    buttons: [(0, nls_1.localize)(0, null)],
                    message: (0, nls_1.localize)(1, null, (0, resources_1.$fg)(workspacePath)),
                    detail: (0, nls_1.localize)(2, null)
                }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
                return false;
            }
            return true; // OK
        }
        async C(window, workspace) {
            if (!window.config) {
                return undefined;
            }
            window.focus();
            // Register window for backups and migrate current backups over
            let backupPath;
            if (!window.config.extensionDevelopmentPath) {
                if (window.config.backupPath) {
                    backupPath = await this.m.registerWorkspaceBackup({ workspace, remoteAuthority: window.remoteAuthority }, window.config.backupPath);
                }
                else {
                    backupPath = this.m.registerWorkspaceBackup({ workspace, remoteAuthority: window.remoteAuthority });
                }
            }
            // if the window was opened on an untitled workspace, delete it.
            if ((0, workspace_1.$Qh)(window.openedWorkspace) && this.isUntitledWorkspace(window.openedWorkspace)) {
                await this.deleteUntitledWorkspace(window.openedWorkspace);
            }
            // Update window configuration properly based on transition to workspace
            window.config.workspace = workspace;
            window.config.backupPath = backupPath;
            return { workspace, backupPath };
        }
    };
    exports.$T5b = $T5b;
    exports.$T5b = $T5b = __decorate([
        __param(0, environmentMainService_1.$n5b),
        __param(1, log_1.$5i),
        __param(2, userDataProfile_1.$v5b),
        __param(3, backup_1.$G5b),
        __param(4, dialogMainService_1.$N5b)
    ], $T5b);
});
//# sourceMappingURL=workspacesManagementMainService.js.map