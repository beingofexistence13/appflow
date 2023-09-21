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
define(["require", "exports", "electron", "vs/base/common/event", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/node/pfs", "vs/nls", "vs/platform/backup/electron-main/backup", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/windows/electron-main/windowsFinder", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/node/workspaces"], function (require, exports, electron_1, event_1, json_1, lifecycle_1, network_1, path_1, resources_1, pfs_1, nls_1, backup_1, dialogMainService_1, environmentMainService_1, instantiation_1, log_1, userDataProfile_1, windowsFinder_1, workspace_1, workspaces_1, workspaces_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspacesManagementMainService = exports.IWorkspacesManagementMainService = void 0;
    exports.IWorkspacesManagementMainService = (0, instantiation_1.createDecorator)('workspacesManagementMainService');
    let WorkspacesManagementMainService = class WorkspacesManagementMainService extends lifecycle_1.Disposable {
        constructor(environmentMainService, logService, userDataProfilesMainService, backupMainService, dialogMainService) {
            super();
            this.environmentMainService = environmentMainService;
            this.logService = logService;
            this.userDataProfilesMainService = userDataProfilesMainService;
            this.backupMainService = backupMainService;
            this.dialogMainService = dialogMainService;
            this._onDidDeleteUntitledWorkspace = this._register(new event_1.Emitter());
            this.onDidDeleteUntitledWorkspace = this._onDidDeleteUntitledWorkspace.event;
            this._onDidEnterWorkspace = this._register(new event_1.Emitter());
            this.onDidEnterWorkspace = this._onDidEnterWorkspace.event;
            this.untitledWorkspacesHome = this.environmentMainService.untitledWorkspacesHome; // local URI that contains all untitled workspaces
            this.untitledWorkspaces = [];
        }
        async initialize() {
            // Reset
            this.untitledWorkspaces = [];
            // Resolve untitled workspaces
            try {
                const untitledWorkspacePaths = (await pfs_1.Promises.readdir(this.untitledWorkspacesHome.with({ scheme: network_1.Schemas.file }).fsPath)).map(folder => (0, resources_1.joinPath)(this.untitledWorkspacesHome, folder, workspace_1.UNTITLED_WORKSPACE_NAME)); //
                for (const untitledWorkspacePath of untitledWorkspacePaths) {
                    const workspace = (0, workspaces_2.getWorkspaceIdentifier)(untitledWorkspacePath);
                    const resolvedWorkspace = await this.resolveLocalWorkspace(untitledWorkspacePath);
                    if (!resolvedWorkspace) {
                        await this.deleteUntitledWorkspace(workspace);
                    }
                    else {
                        this.untitledWorkspaces.push({ workspace, remoteAuthority: resolvedWorkspace.remoteAuthority });
                    }
                }
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    this.logService.warn(`Unable to read folders in ${this.untitledWorkspacesHome} (${error}).`);
                }
            }
        }
        resolveLocalWorkspace(uri) {
            return this.doResolveLocalWorkspace(uri, path => pfs_1.Promises.readFile(path, 'utf8'));
        }
        doResolveLocalWorkspace(uri, contentsFn) {
            if (!this.isWorkspacePath(uri)) {
                return undefined; // does not look like a valid workspace config file
            }
            if (uri.scheme !== network_1.Schemas.file) {
                return undefined;
            }
            try {
                const contents = contentsFn(uri.fsPath);
                if (contents instanceof Promise) {
                    return contents.then(value => this.doResolveWorkspace(uri, value), error => undefined /* invalid workspace */);
                }
                else {
                    return this.doResolveWorkspace(uri, contents);
                }
            }
            catch {
                return undefined; // invalid workspace
            }
        }
        isWorkspacePath(uri) {
            return (0, workspace_1.isUntitledWorkspace)(uri, this.environmentMainService) || (0, workspace_1.hasWorkspaceFileExtension)(uri);
        }
        doResolveWorkspace(path, contents) {
            try {
                const workspace = this.doParseStoredWorkspace(path, contents);
                const workspaceIdentifier = (0, workspaces_2.getWorkspaceIdentifier)(path);
                return {
                    id: workspaceIdentifier.id,
                    configPath: workspaceIdentifier.configPath,
                    folders: (0, workspaces_1.toWorkspaceFolders)(workspace.folders, workspaceIdentifier.configPath, resources_1.extUriBiasedIgnorePathCase),
                    remoteAuthority: workspace.remoteAuthority,
                    transient: workspace.transient
                };
            }
            catch (error) {
                this.logService.warn(error.toString());
            }
            return undefined;
        }
        doParseStoredWorkspace(path, contents) {
            // Parse workspace file
            const storedWorkspace = (0, json_1.parse)(contents); // use fault tolerant parser
            // Filter out folders which do not have a path or uri set
            if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
                storedWorkspace.folders = storedWorkspace.folders.filter(folder => (0, workspaces_1.isStoredWorkspaceFolder)(folder));
            }
            else {
                throw new Error(`${path.toString(true)} looks like an invalid workspace file.`);
            }
            return storedWorkspace;
        }
        async createUntitledWorkspace(folders, remoteAuthority) {
            const { workspace, storedWorkspace } = this.newUntitledWorkspace(folders, remoteAuthority);
            const configPath = workspace.configPath.fsPath;
            await pfs_1.Promises.mkdir((0, path_1.dirname)(configPath), { recursive: true });
            await pfs_1.Promises.writeFile(configPath, JSON.stringify(storedWorkspace, null, '\t'));
            this.untitledWorkspaces.push({ workspace, remoteAuthority });
            return workspace;
        }
        newUntitledWorkspace(folders = [], remoteAuthority) {
            const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
            const untitledWorkspaceConfigFolder = (0, resources_1.joinPath)(this.untitledWorkspacesHome, randomId);
            const untitledWorkspaceConfigPath = (0, resources_1.joinPath)(untitledWorkspaceConfigFolder, workspace_1.UNTITLED_WORKSPACE_NAME);
            const storedWorkspaceFolder = [];
            for (const folder of folders) {
                storedWorkspaceFolder.push((0, workspaces_1.getStoredWorkspaceFolder)(folder.uri, true, folder.name, untitledWorkspaceConfigFolder, resources_1.extUriBiasedIgnorePathCase));
            }
            return {
                workspace: (0, workspaces_2.getWorkspaceIdentifier)(untitledWorkspaceConfigPath),
                storedWorkspace: { folders: storedWorkspaceFolder, remoteAuthority }
            };
        }
        async getWorkspaceIdentifier(configPath) {
            return (0, workspaces_2.getWorkspaceIdentifier)(configPath);
        }
        isUntitledWorkspace(workspace) {
            return (0, workspace_1.isUntitledWorkspace)(workspace.configPath, this.environmentMainService);
        }
        async deleteUntitledWorkspace(workspace) {
            if (!this.isUntitledWorkspace(workspace)) {
                return; // only supported for untitled workspaces
            }
            // Delete from disk
            await this.doDeleteUntitledWorkspace(workspace);
            // unset workspace from profiles
            if (this.userDataProfilesMainService.isEnabled()) {
                this.userDataProfilesMainService.unsetWorkspace(workspace);
            }
            // Event
            this._onDidDeleteUntitledWorkspace.fire(workspace);
        }
        async doDeleteUntitledWorkspace(workspace) {
            const configPath = (0, resources_1.originalFSPath)(workspace.configPath);
            try {
                // Delete Workspace
                await pfs_1.Promises.rm((0, path_1.dirname)(configPath));
                // Mark Workspace Storage to be deleted
                const workspaceStoragePath = (0, path_1.join)(this.environmentMainService.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, workspace.id);
                if (await pfs_1.Promises.exists(workspaceStoragePath)) {
                    await pfs_1.Promises.writeFile((0, path_1.join)(workspaceStoragePath, 'obsolete'), '');
                }
                // Remove from list
                this.untitledWorkspaces = this.untitledWorkspaces.filter(untitledWorkspace => untitledWorkspace.workspace.id !== workspace.id);
            }
            catch (error) {
                this.logService.warn(`Unable to delete untitled workspace ${configPath} (${error}).`);
            }
        }
        getUntitledWorkspaces() {
            return this.untitledWorkspaces;
        }
        async enterWorkspace(window, windows, path) {
            if (!window || !window.win || !window.isReady) {
                return undefined; // return early if the window is not ready or disposed
            }
            const isValid = await this.isValidTargetWorkspacePath(window, windows, path);
            if (!isValid) {
                return undefined; // return early if the workspace is not valid
            }
            const result = await this.doEnterWorkspace(window, (0, workspaces_2.getWorkspaceIdentifier)(path));
            if (!result) {
                return undefined;
            }
            // Emit as event
            this._onDidEnterWorkspace.fire({ window, workspace: result.workspace });
            return result;
        }
        async isValidTargetWorkspacePath(window, windows, workspacePath) {
            if (!workspacePath) {
                return true;
            }
            if ((0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, workspacePath)) {
                return false; // window is already opened on a workspace with that path
            }
            // Prevent overwriting a workspace that is currently opened in another window
            if ((0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(windows, workspacePath)) {
                await this.dialogMainService.showMessageBox({
                    type: 'info',
                    buttons: [(0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")],
                    message: (0, nls_1.localize)('workspaceOpenedMessage', "Unable to save workspace '{0}'", (0, resources_1.basename)(workspacePath)),
                    detail: (0, nls_1.localize)('workspaceOpenedDetail', "The workspace is already opened in another window. Please close that window first and then try again.")
                }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
                return false;
            }
            return true; // OK
        }
        async doEnterWorkspace(window, workspace) {
            if (!window.config) {
                return undefined;
            }
            window.focus();
            // Register window for backups and migrate current backups over
            let backupPath;
            if (!window.config.extensionDevelopmentPath) {
                if (window.config.backupPath) {
                    backupPath = await this.backupMainService.registerWorkspaceBackup({ workspace, remoteAuthority: window.remoteAuthority }, window.config.backupPath);
                }
                else {
                    backupPath = this.backupMainService.registerWorkspaceBackup({ workspace, remoteAuthority: window.remoteAuthority });
                }
            }
            // if the window was opened on an untitled workspace, delete it.
            if ((0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) && this.isUntitledWorkspace(window.openedWorkspace)) {
                await this.deleteUntitledWorkspace(window.openedWorkspace);
            }
            // Update window configuration properly based on transition to workspace
            window.config.workspace = workspace;
            window.config.backupPath = backupPath;
            return { workspace, backupPath };
        }
    };
    exports.WorkspacesManagementMainService = WorkspacesManagementMainService;
    exports.WorkspacesManagementMainService = WorkspacesManagementMainService = __decorate([
        __param(0, environmentMainService_1.IEnvironmentMainService),
        __param(1, log_1.ILogService),
        __param(2, userDataProfile_1.IUserDataProfilesMainService),
        __param(3, backup_1.IBackupMainService),
        __param(4, dialogMainService_1.IDialogMainService)
    ], WorkspacesManagementMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlc01hbmFnZW1lbnRNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZXMvZWxlY3Ryb24tbWFpbi93b3Jrc3BhY2VzTWFuYWdlbWVudE1haW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCbkYsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLCtCQUFlLEVBQW1DLGlDQUFpQyxDQUFDLENBQUM7SUE0QjlILElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQWdDLFNBQVEsc0JBQVU7UUFjOUQsWUFDMEIsc0JBQWdFLEVBQzVFLFVBQXdDLEVBQ3ZCLDJCQUEwRSxFQUNwRixpQkFBc0QsRUFDdEQsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBTmtDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDM0QsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNOLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBOEI7WUFDbkUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBZjFELGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXdCLENBQUMsQ0FBQztZQUM1RixpQ0FBNEIsR0FBZ0MsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQztZQUU3Rix5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUEwQixDQUFDLENBQUM7WUFDckYsd0JBQW1CLEdBQWtDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFFN0UsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHNCQUFzQixDQUFDLENBQUMsa0RBQWtEO1lBRXhJLHVCQUFrQixHQUE2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