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
define(["require", "exports", "crypto", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/node/pfs", "vs/platform/backup/node/backup", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/state/node/state", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/backup/common/backup", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/node/workspaces"], function (require, exports, crypto_1, extpath_1, network_1, path_1, platform_1, resources_1, pfs_1, backup_1, configuration_1, environmentMainService_1, state_1, files_1, log_1, backup_2, workspace_1, workspaces_1) {
    "use strict";
    var BackupMainService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackupMainService = void 0;
    let BackupMainService = class BackupMainService {
        static { BackupMainService_1 = this; }
        static { this.backupWorkspacesMetadataStorageKey = 'backupWorkspaces'; }
        constructor(environmentMainService, configurationService, logService, stateService) {
            this.environmentMainService = environmentMainService;
            this.configurationService = configurationService;
            this.logService = logService;
            this.stateService = stateService;
            this.backupHome = this.environmentMainService.backupHome;
            this.workspaces = [];
            this.folders = [];
            this.emptyWindows = [];
            // Comparers for paths and resources that will
            // - ignore path casing on Windows/macOS
            // - respect path casing on Linux
            this.backupUriComparer = resources_1.extUriBiasedIgnorePathCase;
            this.backupPathComparer = { isEqual: (pathA, pathB) => (0, extpath_1.isEqual)(pathA, pathB, !platform_1.isLinux) };
        }
        async initialize() {
            // read backup workspaces
            const serializedBackupWorkspaces = this.stateService.getItem(BackupMainService_1.backupWorkspacesMetadataStorageKey) ?? { workspaces: [], folders: [], emptyWindows: [] };
            // validate empty workspaces backups first
            this.emptyWindows = await this.validateEmptyWorkspaces(serializedBackupWorkspaces.emptyWindows);
            // validate workspace backups
            this.workspaces = await this.validateWorkspaces((0, backup_1.deserializeWorkspaceInfos)(serializedBackupWorkspaces));
            // validate folder backups
            this.folders = await this.validateFolders((0, backup_1.deserializeFolderInfos)(serializedBackupWorkspaces));
            // store metadata in case some workspaces or folders have been removed
            this.storeWorkspacesMetadata();
        }
        getWorkspaceBackups() {
            if (this.isHotExitOnExitAndWindowClose()) {
                // Only non-folder windows are restored on main process launch when
                // hot exit is configured as onExitAndWindowClose.
                return [];
            }
            return this.workspaces.slice(0); // return a copy
        }
        getFolderBackups() {
            if (this.isHotExitOnExitAndWindowClose()) {
                // Only non-folder windows are restored on main process launch when
                // hot exit is configured as onExitAndWindowClose.
                return [];
            }
            return this.folders.slice(0); // return a copy
        }
        isHotExitEnabled() {
            return this.getHotExitConfig() !== files_1.HotExitConfiguration.OFF;
        }
        isHotExitOnExitAndWindowClose() {
            return this.getHotExitConfig() === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE;
        }
        getHotExitConfig() {
            const config = this.configurationService.getValue();
            return config?.files?.hotExit || files_1.HotExitConfiguration.ON_EXIT;
        }
        getEmptyWindowBackups() {
            return this.emptyWindows.slice(0); // return a copy
        }
        registerWorkspaceBackup(workspaceInfo, migrateFrom) {
            if (!this.workspaces.some(workspace => workspaceInfo.workspace.id === workspace.workspace.id)) {
                this.workspaces.push(workspaceInfo);
                this.storeWorkspacesMetadata();
            }
            const backupPath = (0, path_1.join)(this.backupHome, workspaceInfo.workspace.id);
            if (migrateFrom) {
                return this.moveBackupFolder(backupPath, migrateFrom).then(() => backupPath);
            }
            return backupPath;
        }
        async moveBackupFolder(backupPath, moveFromPath) {
            // Target exists: make sure to convert existing backups to empty window backups
            if (await pfs_1.Promises.exists(backupPath)) {
                await this.convertToEmptyWindowBackup(backupPath);
            }
            // When we have data to migrate from, move it over to the target location
            if (await pfs_1.Promises.exists(moveFromPath)) {
                try {
                    await pfs_1.Promises.rename(moveFromPath, backupPath, false /* no retry */);
                }
                catch (error) {
                    this.logService.error(`Backup: Could not move backup folder to new location: ${error.toString()}`);
                }
            }
        }
        registerFolderBackup(folderInfo) {
            if (!this.folders.some(folder => this.backupUriComparer.isEqual(folderInfo.folderUri, folder.folderUri))) {
                this.folders.push(folderInfo);
                this.storeWorkspacesMetadata();
            }
            return (0, path_1.join)(this.backupHome, this.getFolderHash(folderInfo));
        }
        registerEmptyWindowBackup(emptyWindowInfo) {
            if (!this.emptyWindows.some(emptyWindow => !!emptyWindow.backupFolder && this.backupPathComparer.isEqual(emptyWindow.backupFolder, emptyWindowInfo.backupFolder))) {
                this.emptyWindows.push(emptyWindowInfo);
                this.storeWorkspacesMetadata();
            }
            return (0, path_1.join)(this.backupHome, emptyWindowInfo.backupFolder);
        }
        async validateWorkspaces(rootWorkspaces) {
            if (!Array.isArray(rootWorkspaces)) {
                return [];
            }
            const seenIds = new Set();
            const result = [];
            // Validate Workspaces
            for (const workspaceInfo of rootWorkspaces) {
                const workspace = workspaceInfo.workspace;
                if (!(0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                    return []; // wrong format, skip all entries
                }
                if (!seenIds.has(workspace.id)) {
                    seenIds.add(workspace.id);
                    const backupPath = (0, path_1.join)(this.backupHome, workspace.id);
                    const hasBackups = await this.doHasBackups(backupPath);
                    // If the workspace has no backups, ignore it
                    if (hasBackups) {
                        if (workspace.configPath.scheme !== network_1.Schemas.file || await pfs_1.Promises.exists(workspace.configPath.fsPath)) {
                            result.push(workspaceInfo);
                        }
                        else {
                            // If the workspace has backups, but the target workspace is missing, convert backups to empty ones
                            await this.convertToEmptyWindowBackup(backupPath);
                        }
                    }
                    else {
                        await this.deleteStaleBackup(backupPath);
                    }
                }
            }
            return result;
        }
        async validateFolders(folderWorkspaces) {
            if (!Array.isArray(folderWorkspaces)) {
                return [];
            }
            const result = [];
            const seenIds = new Set();
            for (const folderInfo of folderWorkspaces) {
                const folderURI = folderInfo.folderUri;
                const key = this.backupUriComparer.getComparisonKey(folderURI);
                if (!seenIds.has(key)) {
                    seenIds.add(key);
                    const backupPath = (0, path_1.join)(this.backupHome, this.getFolderHash(folderInfo));
                    const hasBackups = await this.doHasBackups(backupPath);
                    // If the folder has no backups, ignore it
                    if (hasBackups) {
                        if (folderURI.scheme !== network_1.Schemas.file || await pfs_1.Promises.exists(folderURI.fsPath)) {
                            result.push(folderInfo);
                        }
                        else {
                            // If the folder has backups, but the target workspace is missing, convert backups to empty ones
                            await this.convertToEmptyWindowBackup(backupPath);
                        }
                    }
                    else {
                        await this.deleteStaleBackup(backupPath);
                    }
                }
            }
            return result;
        }
        async validateEmptyWorkspaces(emptyWorkspaces) {
            if (!Array.isArray(emptyWorkspaces)) {
                return [];
            }
            const result = [];
            const seenIds = new Set();
            // Validate Empty Windows
            for (const backupInfo of emptyWorkspaces) {
                const backupFolder = backupInfo.backupFolder;
                if (typeof backupFolder !== 'string') {
                    return [];
                }
                if (!seenIds.has(backupFolder)) {
                    seenIds.add(backupFolder);
                    const backupPath = (0, path_1.join)(this.backupHome, backupFolder);
                    if (await this.doHasBackups(backupPath)) {
                        result.push(backupInfo);
                    }
                    else {
                        await this.deleteStaleBackup(backupPath);
                    }
                }
            }
            return result;
        }
        async deleteStaleBackup(backupPath) {
            try {
                await pfs_1.Promises.rm(backupPath, pfs_1.RimRafMode.MOVE);
            }
            catch (error) {
                this.logService.error(`Backup: Could not delete stale backup: ${error.toString()}`);
            }
        }
        prepareNewEmptyWindowBackup() {
            // We are asked to prepare a new empty window backup folder.
            // Empty windows backup folders are derived from a workspace
            // identifier, so we generate a new empty workspace identifier
            // until we found a unique one.
            let emptyWorkspaceIdentifier = (0, workspaces_1.createEmptyWorkspaceIdentifier)();
            while (this.emptyWindows.some(emptyWindow => !!emptyWindow.backupFolder && this.backupPathComparer.isEqual(emptyWindow.backupFolder, emptyWorkspaceIdentifier.id))) {
                emptyWorkspaceIdentifier = (0, workspaces_1.createEmptyWorkspaceIdentifier)();
            }
            return { backupFolder: emptyWorkspaceIdentifier.id };
        }
        async convertToEmptyWindowBackup(backupPath) {
            const newEmptyWindowBackupInfo = this.prepareNewEmptyWindowBackup();
            // Rename backupPath to new empty window backup path
            const newEmptyWindowBackupPath = (0, path_1.join)(this.backupHome, newEmptyWindowBackupInfo.backupFolder);
            try {
                await pfs_1.Promises.rename(backupPath, newEmptyWindowBackupPath, false /* no retry */);
            }
            catch (error) {
                this.logService.error(`Backup: Could not rename backup folder: ${error.toString()}`);
                return false;
            }
            this.emptyWindows.push(newEmptyWindowBackupInfo);
            return true;
        }
        async getDirtyWorkspaces() {
            const dirtyWorkspaces = [];
            // Workspaces with backups
            for (const workspace of this.workspaces) {
                if ((await this.hasBackups(workspace))) {
                    dirtyWorkspaces.push(workspace);
                }
            }
            // Folders with backups
            for (const folder of this.folders) {
                if ((await this.hasBackups(folder))) {
                    dirtyWorkspaces.push(folder);
                }
            }
            return dirtyWorkspaces;
        }
        hasBackups(backupLocation) {
            let backupPath;
            // Empty
            if ((0, backup_1.isEmptyWindowBackupInfo)(backupLocation)) {
                backupPath = (0, path_1.join)(this.backupHome, backupLocation.backupFolder);
            }
            // Folder
            else if ((0, backup_2.isFolderBackupInfo)(backupLocation)) {
                backupPath = (0, path_1.join)(this.backupHome, this.getFolderHash(backupLocation));
            }
            // Workspace
            else {
                backupPath = (0, path_1.join)(this.backupHome, backupLocation.workspace.id);
            }
            return this.doHasBackups(backupPath);
        }
        async doHasBackups(backupPath) {
            try {
                const backupSchemas = await pfs_1.Promises.readdir(backupPath);
                for (const backupSchema of backupSchemas) {
                    try {
                        const backupSchemaChildren = await pfs_1.Promises.readdir((0, path_1.join)(backupPath, backupSchema));
                        if (backupSchemaChildren.length > 0) {
                            return true;
                        }
                    }
                    catch (error) {
                        // invalid folder
                    }
                }
            }
            catch (error) {
                // backup path does not exist
            }
            return false;
        }
        storeWorkspacesMetadata() {
            const serializedBackupWorkspaces = {
                workspaces: this.workspaces.map(({ workspace, remoteAuthority }) => {
                    const serializedWorkspaceBackupInfo = {
                        id: workspace.id,
                        configURIPath: workspace.configPath.toString()
                    };
                    if (remoteAuthority) {
                        serializedWorkspaceBackupInfo.remoteAuthority = remoteAuthority;
                    }
                    return serializedWorkspaceBackupInfo;
                }),
                folders: this.folders.map(({ folderUri, remoteAuthority }) => {
                    const serializedFolderBackupInfo = {
                        folderUri: folderUri.toString()
                    };
                    if (remoteAuthority) {
                        serializedFolderBackupInfo.remoteAuthority = remoteAuthority;
                    }
                    return serializedFolderBackupInfo;
                }),
                emptyWindows: this.emptyWindows.map(({ backupFolder, remoteAuthority }) => {
                    const serializedEmptyWindowBackupInfo = {
                        backupFolder
                    };
                    if (remoteAuthority) {
                        serializedEmptyWindowBackupInfo.remoteAuthority = remoteAuthority;
                    }
                    return serializedEmptyWindowBackupInfo;
                })
            };
            this.stateService.setItem(BackupMainService_1.backupWorkspacesMetadataStorageKey, serializedBackupWorkspaces);
        }
        getFolderHash(folder) {
            const folderUri = folder.folderUri;
            let key;
            if (folderUri.scheme === network_1.Schemas.file) {
                key = platform_1.isLinux ? folderUri.fsPath : folderUri.fsPath.toLowerCase(); // for backward compatibility, use the fspath as key
            }
            else {
                key = folderUri.toString().toLowerCase();
            }
            return (0, crypto_1.createHash)('md5').update(key).digest('hex');
        }
    };
    exports.BackupMainService = BackupMainService;
    exports.BackupMainService = BackupMainService = BackupMainService_1 = __decorate([
        __param(0, environmentMainService_1.IEnvironmentMainService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, log_1.ILogService),
        __param(3, state_1.IStateService)
    ], BackupMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwTWFpblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9iYWNrdXAvZWxlY3Ryb24tbWFpbi9iYWNrdXBNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjs7aUJBSUwsdUNBQWtDLEdBQUcsa0JBQWtCLEFBQXJCLENBQXNCO1FBY2hGLFlBQzBCLHNCQUFnRSxFQUNsRSxvQkFBNEQsRUFDdEUsVUFBd0MsRUFDdEMsWUFBNEM7WUFIakIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUNqRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDckIsaUJBQVksR0FBWixZQUFZLENBQWU7WUFoQmxELGVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1lBRXRELGVBQVUsR0FBMkIsRUFBRSxDQUFDO1lBQ3hDLFlBQU8sR0FBd0IsRUFBRSxDQUFDO1lBQ2xDLGlCQUFZLEdBQTZCLEVBQUUsQ0FBQztZQUVwRCw4Q0FBOEM7WUFDOUMsd0NBQXdDO1lBQ3hDLGlDQUFpQztZQUNoQixzQkFBaUIsR0FBRyxzQ0FBMEIsQ0FBQztZQUMvQyx1QkFBa0IsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLEtBQWEsRUFBRSxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUEsaUJBQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsa0JBQU8sQ0FBQyxFQUFFLENBQUM7UUFRckgsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUFVO1lBRWYseUJBQXlCO1lBQ3pCLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQThCLG1CQUFpQixDQUFDLGtDQUFr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