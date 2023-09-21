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
define(["require", "exports", "electron", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/storage/electron-main/storageMainService", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/map"], function (require, exports, electron_1, arrays_1, async_1, event_1, labels_1, lifecycle_1, network_1, platform_1, resources_1, uri_1, pfs_1, nls_1, instantiation_1, lifecycleMainService_1, log_1, storageMainService_1, workspaces_1, workspace_1, workspacesManagementMainService_1, map_1) {
    "use strict";
    var WorkspacesHistoryMainService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspacesHistoryMainService = exports.IWorkspacesHistoryMainService = void 0;
    exports.IWorkspacesHistoryMainService = (0, instantiation_1.createDecorator)('workspacesHistoryMainService');
    let WorkspacesHistoryMainService = class WorkspacesHistoryMainService extends lifecycle_1.Disposable {
        static { WorkspacesHistoryMainService_1 = this; }
        static { this.MAX_TOTAL_RECENT_ENTRIES = 500; }
        static { this.RECENTLY_OPENED_STORAGE_KEY = 'history.recentlyOpenedPathsList'; }
        constructor(logService, workspacesManagementMainService, lifecycleMainService, applicationStorageMainService) {
            super();
            this.logService = logService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.applicationStorageMainService = applicationStorageMainService;
            this._onDidChangeRecentlyOpened = this._register(new event_1.Emitter());
            this.onDidChangeRecentlyOpened = this._onDidChangeRecentlyOpened.event;
            this.macOSRecentDocumentsUpdater = this._register(new async_1.ThrottledDelayer(800));
            this.registerListeners();
        }
        registerListeners() {
            // Install window jump list delayed after opening window
            // because perf measurements have shown this to be slow
            this.lifecycleMainService.when(4 /* LifecycleMainPhase.Eventually */).then(() => this.handleWindowsJumpList());
            // Add to history when entering workspace
            this._register(this.workspacesManagementMainService.onDidEnterWorkspace(event => this.addRecentlyOpened([{ workspace: event.workspace, remoteAuthority: event.window.remoteAuthority }])));
        }
        //#region Workspaces History
        async addRecentlyOpened(recentToAdd) {
            let workspaces = [];
            let files = [];
            for (const recent of recentToAdd) {
                // Workspace
                if ((0, workspaces_1.isRecentWorkspace)(recent)) {
                    if (!this.workspacesManagementMainService.isUntitledWorkspace(recent.workspace) && !this.containsWorkspace(workspaces, recent.workspace)) {
                        workspaces.push(recent);
                    }
                }
                // Folder
                else if ((0, workspaces_1.isRecentFolder)(recent)) {
                    if (!this.containsFolder(workspaces, recent.folderUri)) {
                        workspaces.push(recent);
                    }
                }
                // File
                else {
                    const alreadyExistsInHistory = this.containsFile(files, recent.fileUri);
                    const shouldBeFiltered = recent.fileUri.scheme === network_1.Schemas.file && WorkspacesHistoryMainService_1.COMMON_FILES_FILTER.indexOf((0, resources_1.basename)(recent.fileUri)) >= 0;
                    if (!alreadyExistsInHistory && !shouldBeFiltered) {
                        files.push(recent);
                        // Add to recent documents (Windows only, macOS later)
                        if (platform_1.isWindows && recent.fileUri.scheme === network_1.Schemas.file) {
                            electron_1.app.addRecentDocument(recent.fileUri.fsPath);
                        }
                    }
                }
            }
            const mergedEntries = await this.mergeEntriesFromStorage({ workspaces, files });
            workspaces = mergedEntries.workspaces;
            files = mergedEntries.files;
            if (workspaces.length > WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES) {
                workspaces.length = WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES;
            }
            if (files.length > WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES) {
                files.length = WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES;
            }
            await this.saveRecentlyOpened({ workspaces, files });
            this._onDidChangeRecentlyOpened.fire();
            // Schedule update to recent documents on macOS dock
            if (platform_1.isMacintosh) {
                this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
            }
        }
        async removeRecentlyOpened(recentToRemove) {
            const keep = (recent) => {
                const uri = this.location(recent);
                for (const resourceToRemove of recentToRemove) {
                    if (resources_1.extUriBiasedIgnorePathCase.isEqual(resourceToRemove, uri)) {
                        return false;
                    }
                }
                return true;
            };
            const mru = await this.getRecentlyOpened();
            const workspaces = mru.workspaces.filter(keep);
            const files = mru.files.filter(keep);
            if (workspaces.length !== mru.workspaces.length || files.length !== mru.files.length) {
                await this.saveRecentlyOpened({ files, workspaces });
                this._onDidChangeRecentlyOpened.fire();
                // Schedule update to recent documents on macOS dock
                if (platform_1.isMacintosh) {
                    this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
                }
            }
        }
        async clearRecentlyOpened() {
            await this.saveRecentlyOpened({ workspaces: [], files: [] });
            electron_1.app.clearRecentDocuments();
            // Event
            this._onDidChangeRecentlyOpened.fire();
        }
        async getRecentlyOpened() {
            return this.mergeEntriesFromStorage();
        }
        async mergeEntriesFromStorage(existingEntries) {
            // Build maps for more efficient lookup of existing entries that
            // are passed in by storing based on workspace/file identifier
            const mapWorkspaceIdToWorkspace = new map_1.ResourceMap(uri => resources_1.extUriBiasedIgnorePathCase.getComparisonKey(uri));
            if (existingEntries?.workspaces) {
                for (const workspace of existingEntries.workspaces) {
                    mapWorkspaceIdToWorkspace.set(this.location(workspace), workspace);
                }
            }
            const mapFileIdToFile = new map_1.ResourceMap(uri => resources_1.extUriBiasedIgnorePathCase.getComparisonKey(uri));
            if (existingEntries?.files) {
                for (const file of existingEntries.files) {
                    mapFileIdToFile.set(this.location(file), file);
                }
            }
            // Merge in entries from storage, preserving existing known entries
            const recentFromStorage = await this.getRecentlyOpenedFromStorage();
            for (const recentWorkspaceFromStorage of recentFromStorage.workspaces) {
                const existingRecentWorkspace = mapWorkspaceIdToWorkspace.get(this.location(recentWorkspaceFromStorage));
                if (existingRecentWorkspace) {
                    existingRecentWorkspace.label = existingRecentWorkspace.label ?? recentWorkspaceFromStorage.label;
                }
                else {
                    mapWorkspaceIdToWorkspace.set(this.location(recentWorkspaceFromStorage), recentWorkspaceFromStorage);
                }
            }
            for (const recentFileFromStorage of recentFromStorage.files) {
                const existingRecentFile = mapFileIdToFile.get(this.location(recentFileFromStorage));
                if (existingRecentFile) {
                    existingRecentFile.label = existingRecentFile.label ?? recentFileFromStorage.label;
                }
                else {
                    mapFileIdToFile.set(this.location(recentFileFromStorage), recentFileFromStorage);
                }
            }
            return {
                workspaces: [...mapWorkspaceIdToWorkspace.values()],
                files: [...mapFileIdToFile.values()]
            };
        }
        async getRecentlyOpenedFromStorage() {
            // Wait for global storage to be ready
            await this.applicationStorageMainService.whenReady;
            let storedRecentlyOpened = undefined;
            // First try with storage service
            const storedRecentlyOpenedRaw = this.applicationStorageMainService.get(WorkspacesHistoryMainService_1.RECENTLY_OPENED_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            if (typeof storedRecentlyOpenedRaw === 'string') {
                try {
                    storedRecentlyOpened = JSON.parse(storedRecentlyOpenedRaw);
                }
                catch (error) {
                    this.logService.error('Unexpected error parsing opened paths list', error);
                }
            }
            return (0, workspaces_1.restoreRecentlyOpened)(storedRecentlyOpened, this.logService);
        }
        async saveRecentlyOpened(recent) {
            // Wait for global storage to be ready
            await this.applicationStorageMainService.whenReady;
            // Store in global storage (but do not sync since this is mainly local paths)
            this.applicationStorageMainService.store(WorkspacesHistoryMainService_1.RECENTLY_OPENED_STORAGE_KEY, JSON.stringify((0, workspaces_1.toStoreData)(recent)), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        location(recent) {
            if ((0, workspaces_1.isRecentFolder)(recent)) {
                return recent.folderUri;
            }
            if ((0, workspaces_1.isRecentFile)(recent)) {
                return recent.fileUri;
            }
            return recent.workspace.configPath;
        }
        containsWorkspace(recents, candidate) {
            return !!recents.find(recent => (0, workspaces_1.isRecentWorkspace)(recent) && recent.workspace.id === candidate.id);
        }
        containsFolder(recents, candidate) {
            return !!recents.find(recent => (0, workspaces_1.isRecentFolder)(recent) && resources_1.extUriBiasedIgnorePathCase.isEqual(recent.folderUri, candidate));
        }
        containsFile(recents, candidate) {
            return !!recents.find(recent => resources_1.extUriBiasedIgnorePathCase.isEqual(recent.fileUri, candidate));
        }
        //#endregion
        //#region macOS Dock / Windows JumpList
        static { this.MAX_MACOS_DOCK_RECENT_WORKSPACES = 7; } // prefer higher number of workspaces...
        static { this.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL = 10; } // ...over number of files
        static { this.MAX_WINDOWS_JUMP_LIST_ENTRIES = 7; }
        // Exclude some very common files from the dock/taskbar
        static { this.COMMON_FILES_FILTER = [
            'COMMIT_EDITMSG',
            'MERGE_MSG'
        ]; }
        async handleWindowsJumpList() {
            if (!platform_1.isWindows) {
                return; // only on windows
            }
            await this.updateWindowsJumpList();
            this._register(this.onDidChangeRecentlyOpened(() => this.updateWindowsJumpList()));
        }
        async updateWindowsJumpList() {
            if (!platform_1.isWindows) {
                return; // only on windows
            }
            const jumpList = [];
            // Tasks
            jumpList.push({
                type: 'tasks',
                items: [
                    {
                        type: 'task',
                        title: (0, nls_1.localize)('newWindow', "New Window"),
                        description: (0, nls_1.localize)('newWindowDesc', "Opens a new window"),
                        program: process.execPath,
                        args: '-n',
                        iconPath: process.execPath,
                        iconIndex: 0
                    }
                ]
            });
            // Recent Workspaces
            if ((await this.getRecentlyOpened()).workspaces.length > 0) {
                // The user might have meanwhile removed items from the jump list and we have to respect that
                // so we need to update our list of recent paths with the choice of the user to not add them again
                // Also: Windows will not show our custom category at all if there is any entry which was removed
                // by the user! See https://github.com/microsoft/vscode/issues/15052
                const toRemove = [];
                for (const item of electron_1.app.getJumpListSettings().removedItems) {
                    const args = item.args;
                    if (args) {
                        const match = /^--(folder|file)-uri\s+"([^"]+)"$/.exec(args);
                        if (match) {
                            toRemove.push(uri_1.URI.parse(match[2]));
                        }
                    }
                }
                await this.removeRecentlyOpened(toRemove);
                // Add entries
                let hasWorkspaces = false;
                const items = (0, arrays_1.coalesce)((await this.getRecentlyOpened()).workspaces.slice(0, WorkspacesHistoryMainService_1.MAX_WINDOWS_JUMP_LIST_ENTRIES).map(recent => {
                    const workspace = (0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace : recent.folderUri;
                    const { title, description } = this.getWindowsJumpListLabel(workspace, recent.label);
                    let args;
                    if (uri_1.URI.isUri(workspace)) {
                        args = `--folder-uri "${workspace.toString()}"`;
                    }
                    else {
                        hasWorkspaces = true;
                        args = `--file-uri "${workspace.configPath.toString()}"`;
                    }
                    return {
                        type: 'task',
                        title: title.substr(0, 255),
                        description: description.substr(0, 255),
                        program: process.execPath,
                        args,
                        iconPath: 'explorer.exe',
                        iconIndex: 0
                    };
                }));
                if (items.length > 0) {
                    jumpList.push({
                        type: 'custom',
                        name: hasWorkspaces ? (0, nls_1.localize)('recentFoldersAndWorkspaces', "Recent Folders & Workspaces") : (0, nls_1.localize)('recentFolders', "Recent Folders"),
                        items
                    });
                }
            }
            // Recent
            jumpList.push({
                type: 'recent' // this enables to show files in the "recent" category
            });
            try {
                const res = electron_1.app.setJumpList(jumpList);
                if (res && res !== 'ok') {
                    this.logService.warn(`updateWindowsJumpList#setJumpList unexpected result: ${res}`);
                }
            }
            catch (error) {
                this.logService.warn('updateWindowsJumpList#setJumpList', error); // since setJumpList is relatively new API, make sure to guard for errors
            }
        }
        getWindowsJumpListLabel(workspace, recentLabel) {
            // Prefer recent label
            if (recentLabel) {
                return { title: (0, labels_1.splitRecentLabel)(recentLabel).name, description: recentLabel };
            }
            // Single Folder
            if (uri_1.URI.isUri(workspace)) {
                return { title: (0, resources_1.basename)(workspace), description: this.renderJumpListPathDescription(workspace) };
            }
            // Workspace: Untitled
            if (this.workspacesManagementMainService.isUntitledWorkspace(workspace)) {
                return { title: (0, nls_1.localize)('untitledWorkspace', "Untitled (Workspace)"), description: '' };
            }
            // Workspace: normal
            let filename = (0, resources_1.basename)(workspace.configPath);
            if (filename.endsWith(workspace_1.WORKSPACE_EXTENSION)) {
                filename = filename.substr(0, filename.length - workspace_1.WORKSPACE_EXTENSION.length - 1);
            }
            return { title: (0, nls_1.localize)('workspaceName', "{0} (Workspace)", filename), description: this.renderJumpListPathDescription(workspace.configPath) };
        }
        renderJumpListPathDescription(uri) {
            return uri.scheme === 'file' ? (0, labels_1.normalizeDriveLetter)(uri.fsPath) : uri.toString();
        }
        async updateMacOSRecentDocuments() {
            if (!platform_1.isMacintosh) {
                return;
            }
            // We clear all documents first to ensure an up-to-date view on the set. Since entries
            // can get deleted on disk, this ensures that the list is always valid
            electron_1.app.clearRecentDocuments();
            const mru = await this.getRecentlyOpened();
            // Collect max-N recent workspaces that are known to exist
            const workspaceEntries = [];
            let entries = 0;
            for (let i = 0; i < mru.workspaces.length && entries < WorkspacesHistoryMainService_1.MAX_MACOS_DOCK_RECENT_WORKSPACES; i++) {
                const loc = this.location(mru.workspaces[i]);
                if (loc.scheme === network_1.Schemas.file) {
                    const workspacePath = (0, resources_1.originalFSPath)(loc);
                    if (await pfs_1.Promises.exists(workspacePath)) {
                        workspaceEntries.push(workspacePath);
                        entries++;
                    }
                }
            }
            // Collect max-N recent files that are known to exist
            const fileEntries = [];
            for (let i = 0; i < mru.files.length && entries < WorkspacesHistoryMainService_1.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL; i++) {
                const loc = this.location(mru.files[i]);
                if (loc.scheme === network_1.Schemas.file) {
                    const filePath = (0, resources_1.originalFSPath)(loc);
                    if (WorkspacesHistoryMainService_1.COMMON_FILES_FILTER.includes((0, resources_1.basename)(loc)) || // skip some well known file entries
                        workspaceEntries.includes(filePath) // prefer a workspace entry over a file entry (e.g. for .code-workspace)
                    ) {
                        continue;
                    }
                    if (await pfs_1.Promises.exists(filePath)) {
                        fileEntries.push(filePath);
                        entries++;
                    }
                }
            }
            // The apple guidelines (https://developer.apple.com/design/human-interface-guidelines/macos/menus/menu-anatomy/)
            // explain that most recent entries should appear close to the interaction by the user (e.g. close to the
            // mouse click). Most native macOS applications that add recent documents to the dock, show the most recent document
            // to the bottom (because the dock menu is not appearing from top to bottom, but from the bottom to the top). As such
            // we fill in the entries in reverse order so that the most recent shows up at the bottom of the menu.
            //
            // On top of that, the maximum number of documents can be configured by the user (defaults to 10). To ensure that
            // we are not failing to show the most recent entries, we start by adding files first (in reverse order of recency)
            // and then add folders (in reverse order of recency). Given that strategy, we can ensure that the most recent
            // N folders are always appearing, even if the limit is low (https://github.com/microsoft/vscode/issues/74788)
            fileEntries.reverse().forEach(fileEntry => electron_1.app.addRecentDocument(fileEntry));
            workspaceEntries.reverse().forEach(workspaceEntry => electron_1.app.addRecentDocument(workspaceEntry));
        }
    };
    exports.WorkspacesHistoryMainService = WorkspacesHistoryMainService;
    exports.WorkspacesHistoryMainService = WorkspacesHistoryMainService = WorkspacesHistoryMainService_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(2, lifecycleMainService_1.ILifecycleMainService),
        __param(3, storageMainService_1.IApplicationStorageMainService)
    ], WorkspacesHistoryMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlc0hpc3RvcnlNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZXMvZWxlY3Ryb24tbWFpbi93b3Jrc3BhY2VzSGlzdG9yeU1haW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF3Qm5GLFFBQUEsNkJBQTZCLEdBQUcsSUFBQSwrQkFBZSxFQUFnQyw4QkFBOEIsQ0FBQyxDQUFDO0lBY3JILElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7O2lCQUVuQyw2QkFBd0IsR0FBRyxHQUFHLEFBQU4sQ0FBTztpQkFFL0IsZ0NBQTJCLEdBQUcsaUNBQWlDLEFBQXBDLENBQXFDO1FBT3hGLFlBQ2MsVUFBd0MsRUFDbkIsK0JBQWtGLEVBQzdGLG9CQUE0RCxFQUNuRCw2QkFBOEU7WUFFOUcsS0FBSyxFQUFFLENBQUM7WUFMc0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNGLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBa0M7WUFDNUUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsQyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBUDlGLCtCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3pFLDhCQUF5QixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUE0TzFELGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBbE85RixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLHdEQUF3RDtZQUN4RCx1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLG9C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