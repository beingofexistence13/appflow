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
    var BrowserWorkspacesService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWorkspacesService = void 0;
    let BrowserWorkspacesService = class BrowserWorkspacesService extends lifecycle_1.Disposable {
        static { BrowserWorkspacesService_1 = this; }
        static { this.RECENTLY_OPENED_KEY = 'recently.opened'; }
        constructor(storageService, contextService, logService, fileService, environmentService, uriIdentityService) {
            super();
            this.storageService = storageService;
            this.contextService = contextService;
            this.logService = logService;
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.uriIdentityService = uriIdentityService;
            this._onRecentlyOpenedChange = this._register(new event_1.Emitter());
            this.onDidChangeRecentlyOpened = this._onRecentlyOpenedChange.event;
            // Opening a workspace should push it as most
            // recently used to the workspaces history
            this.addWorkspaceToRecentlyOpened();
            this.registerListeners();
        }
        registerListeners() {
            // Storage
            this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, this._register(new lifecycle_1.DisposableStore()))(() => this._onRecentlyOpenedChange.fire()));
            // Workspace
            this._register(this.contextService.onDidChangeWorkspaceFolders(e => this.onDidChangeWorkspaceFolders(e)));
        }
        onDidChangeWorkspaceFolders(e) {
            if (!(0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace())) {
                return;
            }
            // When in a temporary workspace, make sure to track folder changes
            // in the history so that these can later be restored.
            for (const folder of e.added) {
                this.addRecentlyOpened([{ folderUri: folder.uri }]);
            }
        }
        addWorkspaceToRecentlyOpened() {
            const workspace = this.contextService.getWorkspace();
            const remoteAuthority = this.environmentService.remoteAuthority;
            switch (this.contextService.getWorkbenchState()) {
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
            const recentlyOpenedRaw = this.storageService.get(BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, -1 /* StorageScope.APPLICATION */);
            if (recentlyOpenedRaw) {
                const recentlyOpened = (0, workspaces_1.restoreRecentlyOpened)(JSON.parse(recentlyOpenedRaw), this.logService);
                recentlyOpened.workspaces = recentlyOpened.workspaces.filter(recent => {
                    // In web, unless we are in a temporary workspace, we cannot support
                    // to switch to local folders because this would require a window
                    // reload and local file access only works with explicit user gesture
                    // from the current session.
                    if ((0, workspaces_1.isRecentFolder)(recent) && recent.folderUri.scheme === network_1.Schemas.file && !(0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace())) {
                        return false;
                    }
                    // Never offer temporary workspaces in the history
                    if ((0, workspaces_1.isRecentWorkspace)(recent) && (0, workspace_1.isTemporaryWorkspace)(recent.workspace.configPath)) {
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
                if ((0, workspaces_1.isRecentFile)(recent)) {
                    this.doRemoveRecentlyOpened(recentlyOpened, [recent.fileUri]);
                    recentlyOpened.files.unshift(recent);
                }
                else if ((0, workspaces_1.isRecentFolder)(recent)) {
                    this.doRemoveRecentlyOpened(recentlyOpened, [recent.folderUri]);
                    recentlyOpened.workspaces.unshift(recent);
                }
                else {
                    this.doRemoveRecentlyOpened(recentlyOpened, [recent.workspace.configPath]);
                    recentlyOpened.workspaces.unshift(recent);
                }
            }
            return this.saveRecentlyOpened(recentlyOpened);
        }
        async removeRecentlyOpened(paths) {
            const recentlyOpened = await this.getRecentlyOpened();
            this.doRemoveRecentlyOpened(recentlyOpened, paths);
            return this.saveRecentlyOpened(recentlyOpened);
        }
        doRemoveRecentlyOpened(recentlyOpened, paths) {
            recentlyOpened.files = recentlyOpened.files.filter(file => {
                return !paths.some(path => path.toString() === file.fileUri.toString());
            });
            recentlyOpened.workspaces = recentlyOpened.workspaces.filter(workspace => {
                return !paths.some(path => path.toString() === ((0, workspaces_1.isRecentFolder)(workspace) ? workspace.folderUri.toString() : workspace.workspace.configPath.toString()));
            });
        }
        async saveRecentlyOpened(data) {
            return this.storageService.store(BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, JSON.stringify((0, workspaces_1.toStoreData)(data)), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        async clearRecentlyOpened() {
            this.storageService.remove(BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, -1 /* StorageScope.APPLICATION */);
        }
        //#endregion
        //#region Workspace Management
        async enterWorkspace(workspaceUri) {
            return { workspace: await this.getWorkspaceIdentifier(workspaceUri) };
        }
        async createUntitledWorkspace(folders, remoteAuthority) {
            const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
            const newUntitledWorkspacePath = (0, resources_1.joinPath)(this.environmentService.untitledWorkspacesHome, `Untitled-${randomId}.${workspace_1.WORKSPACE_EXTENSION}`);
            // Build array of workspace folders to store
            const storedWorkspaceFolder = [];
            if (folders) {
                for (const folder of folders) {
                    storedWorkspaceFolder.push((0, workspaces_1.getStoredWorkspaceFolder)(folder.uri, true, folder.name, this.environmentService.untitledWorkspacesHome, this.uriIdentityService.extUri));
                }
            }
            // Store at untitled workspaces location
            const storedWorkspace = { folders: storedWorkspaceFolder, remoteAuthority };
            await this.fileService.writeFile(newUntitledWorkspacePath, buffer_1.VSBuffer.fromString(JSON.stringify(storedWorkspace, null, '\t')));
            return this.getWorkspaceIdentifier(newUntitledWorkspacePath);
        }
        async deleteUntitledWorkspace(workspace) {
            try {
                await this.fileService.del(workspace.configPath);
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error; // re-throw any other error than file not found which is OK
                }
            }
        }
        async getWorkspaceIdentifier(workspaceUri) {
            return (0, workspaces_2.getWorkspaceIdentifier)(workspaceUri);
        }
        //#endregion
        //#region Dirty Workspaces
        async getDirtyWorkspaces() {
            return []; // Currently not supported in web
        }
    };
    exports.BrowserWorkspacesService = BrowserWorkspacesService;
    exports.BrowserWorkspacesService = BrowserWorkspacesService = BrowserWorkspacesService_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, log_1.ILogService),
        __param(3, files_1.IFileService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], BrowserWorkspacesService);
    (0, extensions_1.registerSingleton)(workspaces_1.IWorkspacesService, BrowserWorkspacesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya3NwYWNlcy9icm93c2VyL3dvcmtzcGFjZXNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7O2lCQUV2Qyx3QkFBbUIsR0FBRyxpQkFBaUIsQUFBcEIsQ0FBcUI7UUFPeEQsWUFDa0IsY0FBZ0QsRUFDdkMsY0FBeUQsRUFDdEUsVUFBd0MsRUFDdkMsV0FBMEMsRUFDMUIsa0JBQWlFLEVBQzFFLGtCQUF3RDtZQUU3RSxLQUFLLEVBQUUsQ0FBQztZQVAwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDdEIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDdEIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDVCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ3pELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFUN0QsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDdEUsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQVl2RSw2Q0FBNkM7WUFDN0MsMENBQTBDO1lBQzFDLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsVUFBVTtZQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0Isb0NBQTJCLDBCQUF3QixDQUFDLG1CQUFtQixFQUFFLElB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