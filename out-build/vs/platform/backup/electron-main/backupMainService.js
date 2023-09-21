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
    var $L5b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L5b = void 0;
    let $L5b = class $L5b {
        static { $L5b_1 = this; }
        static { this.a = 'backupWorkspaces'; }
        constructor(j, k, l, m) {
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.c = this.j.backupHome;
            this.d = [];
            this.e = [];
            this.g = [];
            // Comparers for paths and resources that will
            // - ignore path casing on Windows/macOS
            // - respect path casing on Linux
            this.h = resources_1.$_f;
            this.i = { isEqual: (pathA, pathB) => (0, extpath_1.$Hf)(pathA, pathB, !platform_1.$k) };
        }
        async initialize() {
            // read backup workspaces
            const serializedBackupWorkspaces = this.m.getItem($L5b_1.a) ?? { workspaces: [], folders: [], emptyWindows: [] };
            // validate empty workspaces backups first
            this.g = await this.w(serializedBackupWorkspaces.emptyWindows);
            // validate workspace backups
            this.d = await this.u((0, backup_1.$E5b)(serializedBackupWorkspaces));
            // validate folder backups
            this.e = await this.v((0, backup_1.$F5b)(serializedBackupWorkspaces));
            // store metadata in case some workspaces or folders have been removed
            this.C();
        }
        n() {
            if (this.q()) {
                // Only non-folder windows are restored on main process launch when
                // hot exit is configured as onExitAndWindowClose.
                return [];
            }
            return this.d.slice(0); // return a copy
        }
        o() {
            if (this.q()) {
                // Only non-folder windows are restored on main process launch when
                // hot exit is configured as onExitAndWindowClose.
                return [];
            }
            return this.e.slice(0); // return a copy
        }
        isHotExitEnabled() {
            return this.s() !== files_1.$rk.OFF;
        }
        q() {
            return this.s() === files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE;
        }
        s() {
            const config = this.k.getValue();
            return config?.files?.hotExit || files_1.$rk.ON_EXIT;
        }
        getEmptyWindowBackups() {
            return this.g.slice(0); // return a copy
        }
        registerWorkspaceBackup(workspaceInfo, migrateFrom) {
            if (!this.d.some(workspace => workspaceInfo.workspace.id === workspace.workspace.id)) {
                this.d.push(workspaceInfo);
                this.C();
            }
            const backupPath = (0, path_1.$9d)(this.c, workspaceInfo.workspace.id);
            if (migrateFrom) {
                return this.t(backupPath, migrateFrom).then(() => backupPath);
            }
            return backupPath;
        }
        async t(backupPath, moveFromPath) {
            // Target exists: make sure to convert existing backups to empty window backups
            if (await pfs_1.Promises.exists(backupPath)) {
                await this.z(backupPath);
            }
            // When we have data to migrate from, move it over to the target location
            if (await pfs_1.Promises.exists(moveFromPath)) {
                try {
                    await pfs_1.Promises.rename(moveFromPath, backupPath, false /* no retry */);
                }
                catch (error) {
                    this.l.error(`Backup: Could not move backup folder to new location: ${error.toString()}`);
                }
            }
        }
        registerFolderBackup(folderInfo) {
            if (!this.e.some(folder => this.h.isEqual(folderInfo.folderUri, folder.folderUri))) {
                this.e.push(folderInfo);
                this.C();
            }
            return (0, path_1.$9d)(this.c, this.D(folderInfo));
        }
        registerEmptyWindowBackup(emptyWindowInfo) {
            if (!this.g.some(emptyWindow => !!emptyWindow.backupFolder && this.i.isEqual(emptyWindow.backupFolder, emptyWindowInfo.backupFolder))) {
                this.g.push(emptyWindowInfo);
                this.C();
            }
            return (0, path_1.$9d)(this.c, emptyWindowInfo.backupFolder);
        }
        async u(rootWorkspaces) {
            if (!Array.isArray(rootWorkspaces)) {
                return [];
            }
            const seenIds = new Set();
            const result = [];
            // Validate Workspaces
            for (const workspaceInfo of rootWorkspaces) {
                const workspace = workspaceInfo.workspace;
                if (!(0, workspace_1.$Qh)(workspace)) {
                    return []; // wrong format, skip all entries
                }
                if (!seenIds.has(workspace.id)) {
                    seenIds.add(workspace.id);
                    const backupPath = (0, path_1.$9d)(this.c, workspace.id);
                    const hasBackups = await this.B(backupPath);
                    // If the workspace has no backups, ignore it
                    if (hasBackups) {
                        if (workspace.configPath.scheme !== network_1.Schemas.file || await pfs_1.Promises.exists(workspace.configPath.fsPath)) {
                            result.push(workspaceInfo);
                        }
                        else {
                            // If the workspace has backups, but the target workspace is missing, convert backups to empty ones
                            await this.z(backupPath);
                        }
                    }
                    else {
                        await this.x(backupPath);
                    }
                }
            }
            return result;
        }
        async v(folderWorkspaces) {
            if (!Array.isArray(folderWorkspaces)) {
                return [];
            }
            const result = [];
            const seenIds = new Set();
            for (const folderInfo of folderWorkspaces) {
                const folderURI = folderInfo.folderUri;
                const key = this.h.getComparisonKey(folderURI);
                if (!seenIds.has(key)) {
                    seenIds.add(key);
                    const backupPath = (0, path_1.$9d)(this.c, this.D(folderInfo));
                    const hasBackups = await this.B(backupPath);
                    // If the folder has no backups, ignore it
                    if (hasBackups) {
                        if (folderURI.scheme !== network_1.Schemas.file || await pfs_1.Promises.exists(folderURI.fsPath)) {
                            result.push(folderInfo);
                        }
                        else {
                            // If the folder has backups, but the target workspace is missing, convert backups to empty ones
                            await this.z(backupPath);
                        }
                    }
                    else {
                        await this.x(backupPath);
                    }
                }
            }
            return result;
        }
        async w(emptyWorkspaces) {
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
                    const backupPath = (0, path_1.$9d)(this.c, backupFolder);
                    if (await this.B(backupPath)) {
                        result.push(backupInfo);
                    }
                    else {
                        await this.x(backupPath);
                    }
                }
            }
            return result;
        }
        async x(backupPath) {
            try {
                await pfs_1.Promises.rm(backupPath, pfs_1.RimRafMode.MOVE);
            }
            catch (error) {
                this.l.error(`Backup: Could not delete stale backup: ${error.toString()}`);
            }
        }
        y() {
            // We are asked to prepare a new empty window backup folder.
            // Empty windows backup folders are derived from a workspace
            // identifier, so we generate a new empty workspace identifier
            // until we found a unique one.
            let emptyWorkspaceIdentifier = (0, workspaces_1.$K5b)();
            while (this.g.some(emptyWindow => !!emptyWindow.backupFolder && this.i.isEqual(emptyWindow.backupFolder, emptyWorkspaceIdentifier.id))) {
                emptyWorkspaceIdentifier = (0, workspaces_1.$K5b)();
            }
            return { backupFolder: emptyWorkspaceIdentifier.id };
        }
        async z(backupPath) {
            const newEmptyWindowBackupInfo = this.y();
            // Rename backupPath to new empty window backup path
            const newEmptyWindowBackupPath = (0, path_1.$9d)(this.c, newEmptyWindowBackupInfo.backupFolder);
            try {
                await pfs_1.Promises.rename(backupPath, newEmptyWindowBackupPath, false /* no retry */);
            }
            catch (error) {
                this.l.error(`Backup: Could not rename backup folder: ${error.toString()}`);
                return false;
            }
            this.g.push(newEmptyWindowBackupInfo);
            return true;
        }
        async getDirtyWorkspaces() {
            const dirtyWorkspaces = [];
            // Workspaces with backups
            for (const workspace of this.d) {
                if ((await this.A(workspace))) {
                    dirtyWorkspaces.push(workspace);
                }
            }
            // Folders with backups
            for (const folder of this.e) {
                if ((await this.A(folder))) {
                    dirtyWorkspaces.push(folder);
                }
            }
            return dirtyWorkspaces;
        }
        A(backupLocation) {
            let backupPath;
            // Empty
            if ((0, backup_1.$D5b)(backupLocation)) {
                backupPath = (0, path_1.$9d)(this.c, backupLocation.backupFolder);
            }
            // Folder
            else if ((0, backup_2.$dU)(backupLocation)) {
                backupPath = (0, path_1.$9d)(this.c, this.D(backupLocation));
            }
            // Workspace
            else {
                backupPath = (0, path_1.$9d)(this.c, backupLocation.workspace.id);
            }
            return this.B(backupPath);
        }
        async B(backupPath) {
            try {
                const backupSchemas = await pfs_1.Promises.readdir(backupPath);
                for (const backupSchema of backupSchemas) {
                    try {
                        const backupSchemaChildren = await pfs_1.Promises.readdir((0, path_1.$9d)(backupPath, backupSchema));
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
        C() {
            const serializedBackupWorkspaces = {
                workspaces: this.d.map(({ workspace, remoteAuthority }) => {
                    const serializedWorkspaceBackupInfo = {
                        id: workspace.id,
                        configURIPath: workspace.configPath.toString()
                    };
                    if (remoteAuthority) {
                        serializedWorkspaceBackupInfo.remoteAuthority = remoteAuthority;
                    }
                    return serializedWorkspaceBackupInfo;
                }),
                folders: this.e.map(({ folderUri, remoteAuthority }) => {
                    const serializedFolderBackupInfo = {
                        folderUri: folderUri.toString()
                    };
                    if (remoteAuthority) {
                        serializedFolderBackupInfo.remoteAuthority = remoteAuthority;
                    }
                    return serializedFolderBackupInfo;
                }),
                emptyWindows: this.g.map(({ backupFolder, remoteAuthority }) => {
                    const serializedEmptyWindowBackupInfo = {
                        backupFolder
                    };
                    if (remoteAuthority) {
                        serializedEmptyWindowBackupInfo.remoteAuthority = remoteAuthority;
                    }
                    return serializedEmptyWindowBackupInfo;
                })
            };
            this.m.setItem($L5b_1.a, serializedBackupWorkspaces);
        }
        D(folder) {
            const folderUri = folder.folderUri;
            let key;
            if (folderUri.scheme === network_1.Schemas.file) {
                key = platform_1.$k ? folderUri.fsPath : folderUri.fsPath.toLowerCase(); // for backward compatibility, use the fspath as key
            }
            else {
                key = folderUri.toString().toLowerCase();
            }
            return (0, crypto_1.createHash)('md5').update(key).digest('hex');
        }
    };
    exports.$L5b = $L5b;
    exports.$L5b = $L5b = $L5b_1 = __decorate([
        __param(0, environmentMainService_1.$n5b),
        __param(1, configuration_1.$8h),
        __param(2, log_1.$5i),
        __param(3, state_1.$eN)
    ], $L5b);
});
//# sourceMappingURL=backupMainService.js.map