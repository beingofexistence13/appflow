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
define(["require", "exports", "electron", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/nls!vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/storage/electron-main/storageMainService", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/map"], function (require, exports, electron_1, arrays_1, async_1, event_1, labels_1, lifecycle_1, network_1, platform_1, resources_1, uri_1, pfs_1, nls_1, instantiation_1, lifecycleMainService_1, log_1, storageMainService_1, workspaces_1, workspace_1, workspacesManagementMainService_1, map_1) {
    "use strict";
    var $q6b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$q6b = exports.$p6b = void 0;
    exports.$p6b = (0, instantiation_1.$Bh)('workspacesHistoryMainService');
    let $q6b = class $q6b extends lifecycle_1.$kc {
        static { $q6b_1 = this; }
        static { this.a = 500; }
        static { this.b = 'history.recentlyOpenedPathsList'; }
        constructor(f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeRecentlyOpened = this.c.event;
            this.G = this.B(new async_1.$Eg(800));
            this.m();
        }
        m() {
            // Install window jump list delayed after opening window
            // because perf measurements have shown this to be slow
            this.h.when(4 /* LifecycleMainPhase.Eventually */).then(() => this.H());
            // Add to history when entering workspace
            this.B(this.g.onDidEnterWorkspace(event => this.addRecentlyOpened([{ workspace: event.workspace, remoteAuthority: event.window.remoteAuthority }])));
        }
        //#region Workspaces History
        async addRecentlyOpened(recentToAdd) {
            let workspaces = [];
            let files = [];
            for (const recent of recentToAdd) {
                // Workspace
                if ((0, workspaces_1.$gU)(recent)) {
                    if (!this.g.isUntitledWorkspace(recent.workspace) && !this.u(workspaces, recent.workspace)) {
                        workspaces.push(recent);
                    }
                }
                // Folder
                else if ((0, workspaces_1.$hU)(recent)) {
                    if (!this.w(workspaces, recent.folderUri)) {
                        workspaces.push(recent);
                    }
                }
                // File
                else {
                    const alreadyExistsInHistory = this.y(files, recent.fileUri);
                    const shouldBeFiltered = recent.fileUri.scheme === network_1.Schemas.file && $q6b_1.F.indexOf((0, resources_1.$fg)(recent.fileUri)) >= 0;
                    if (!alreadyExistsInHistory && !shouldBeFiltered) {
                        files.push(recent);
                        // Add to recent documents (Windows only, macOS later)
                        if (platform_1.$i && recent.fileUri.scheme === network_1.Schemas.file) {
                            electron_1.app.addRecentDocument(recent.fileUri.fsPath);
                        }
                    }
                }
            }
            const mergedEntries = await this.n({ workspaces, files });
            workspaces = mergedEntries.workspaces;
            files = mergedEntries.files;
            if (workspaces.length > $q6b_1.a) {
                workspaces.length = $q6b_1.a;
            }
            if (files.length > $q6b_1.a) {
                files.length = $q6b_1.a;
            }
            await this.s({ workspaces, files });
            this.c.fire();
            // Schedule update to recent documents on macOS dock
            if (platform_1.$j) {
                this.G.trigger(() => this.M());
            }
        }
        async removeRecentlyOpened(recentToRemove) {
            const keep = (recent) => {
                const uri = this.t(recent);
                for (const resourceToRemove of recentToRemove) {
                    if (resources_1.$_f.isEqual(resourceToRemove, uri)) {
                        return false;
                    }
                }
                return true;
            };
            const mru = await this.getRecentlyOpened();
            const workspaces = mru.workspaces.filter(keep);
            const files = mru.files.filter(keep);
            if (workspaces.length !== mru.workspaces.length || files.length !== mru.files.length) {
                await this.s({ files, workspaces });
                this.c.fire();
                // Schedule update to recent documents on macOS dock
                if (platform_1.$j) {
                    this.G.trigger(() => this.M());
                }
            }
        }
        async clearRecentlyOpened() {
            await this.s({ workspaces: [], files: [] });
            electron_1.app.clearRecentDocuments();
            // Event
            this.c.fire();
        }
        async getRecentlyOpened() {
            return this.n();
        }
        async n(existingEntries) {
            // Build maps for more efficient lookup of existing entries that
            // are passed in by storing based on workspace/file identifier
            const mapWorkspaceIdToWorkspace = new map_1.$zi(uri => resources_1.$_f.getComparisonKey(uri));
            if (existingEntries?.workspaces) {
                for (const workspace of existingEntries.workspaces) {
                    mapWorkspaceIdToWorkspace.set(this.t(workspace), workspace);
                }
            }
            const mapFileIdToFile = new map_1.$zi(uri => resources_1.$_f.getComparisonKey(uri));
            if (existingEntries?.files) {
                for (const file of existingEntries.files) {
                    mapFileIdToFile.set(this.t(file), file);
                }
            }
            // Merge in entries from storage, preserving existing known entries
            const recentFromStorage = await this.r();
            for (const recentWorkspaceFromStorage of recentFromStorage.workspaces) {
                const existingRecentWorkspace = mapWorkspaceIdToWorkspace.get(this.t(recentWorkspaceFromStorage));
                if (existingRecentWorkspace) {
                    existingRecentWorkspace.label = existingRecentWorkspace.label ?? recentWorkspaceFromStorage.label;
                }
                else {
                    mapWorkspaceIdToWorkspace.set(this.t(recentWorkspaceFromStorage), recentWorkspaceFromStorage);
                }
            }
            for (const recentFileFromStorage of recentFromStorage.files) {
                const existingRecentFile = mapFileIdToFile.get(this.t(recentFileFromStorage));
                if (existingRecentFile) {
                    existingRecentFile.label = existingRecentFile.label ?? recentFileFromStorage.label;
                }
                else {
                    mapFileIdToFile.set(this.t(recentFileFromStorage), recentFileFromStorage);
                }
            }
            return {
                workspaces: [...mapWorkspaceIdToWorkspace.values()],
                files: [...mapFileIdToFile.values()]
            };
        }
        async r() {
            // Wait for global storage to be ready
            await this.j.whenReady;
            let storedRecentlyOpened = undefined;
            // First try with storage service
            const storedRecentlyOpenedRaw = this.j.get($q6b_1.b, -1 /* StorageScope.APPLICATION */);
            if (typeof storedRecentlyOpenedRaw === 'string') {
                try {
                    storedRecentlyOpened = JSON.parse(storedRecentlyOpenedRaw);
                }
                catch (error) {
                    this.f.error('Unexpected error parsing opened paths list', error);
                }
            }
            return (0, workspaces_1.$nU)(storedRecentlyOpened, this.f);
        }
        async s(recent) {
            // Wait for global storage to be ready
            await this.j.whenReady;
            // Store in global storage (but do not sync since this is mainly local paths)
            this.j.store($q6b_1.b, JSON.stringify((0, workspaces_1.$oU)(recent)), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        t(recent) {
            if ((0, workspaces_1.$hU)(recent)) {
                return recent.folderUri;
            }
            if ((0, workspaces_1.$iU)(recent)) {
                return recent.fileUri;
            }
            return recent.workspace.configPath;
        }
        u(recents, candidate) {
            return !!recents.find(recent => (0, workspaces_1.$gU)(recent) && recent.workspace.id === candidate.id);
        }
        w(recents, candidate) {
            return !!recents.find(recent => (0, workspaces_1.$hU)(recent) && resources_1.$_f.isEqual(recent.folderUri, candidate));
        }
        y(recents, candidate) {
            return !!recents.find(recent => resources_1.$_f.isEqual(recent.fileUri, candidate));
        }
        //#endregion
        //#region macOS Dock / Windows JumpList
        static { this.z = 7; } // prefer higher number of workspaces...
        static { this.C = 10; } // ...over number of files
        static { this.D = 7; }
        // Exclude some very common files from the dock/taskbar
        static { this.F = [
            'COMMIT_EDITMSG',
            'MERGE_MSG'
        ]; }
        async H() {
            if (!platform_1.$i) {
                return; // only on windows
            }
            await this.I();
            this.B(this.onDidChangeRecentlyOpened(() => this.I()));
        }
        async I() {
            if (!platform_1.$i) {
                return; // only on windows
            }
            const jumpList = [];
            // Tasks
            jumpList.push({
                type: 'tasks',
                items: [
                    {
                        type: 'task',
                        title: (0, nls_1.localize)(0, null),
                        description: (0, nls_1.localize)(1, null),
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
                const items = (0, arrays_1.$Fb)((await this.getRecentlyOpened()).workspaces.slice(0, $q6b_1.D).map(recent => {
                    const workspace = (0, workspaces_1.$gU)(recent) ? recent.workspace : recent.folderUri;
                    const { title, description } = this.J(workspace, recent.label);
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
                        name: hasWorkspaces ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null),
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
                    this.f.warn(`updateWindowsJumpList#setJumpList unexpected result: ${res}`);
                }
            }
            catch (error) {
                this.f.warn('updateWindowsJumpList#setJumpList', error); // since setJumpList is relatively new API, make sure to guard for errors
            }
        }
        J(workspace, recentLabel) {
            // Prefer recent label
            if (recentLabel) {
                return { title: (0, labels_1.$nA)(recentLabel).name, description: recentLabel };
            }
            // Single Folder
            if (uri_1.URI.isUri(workspace)) {
                return { title: (0, resources_1.$fg)(workspace), description: this.L(workspace) };
            }
            // Workspace: Untitled
            if (this.g.isUntitledWorkspace(workspace)) {
                return { title: (0, nls_1.localize)(4, null), description: '' };
            }
            // Workspace: normal
            let filename = (0, resources_1.$fg)(workspace.configPath);
            if (filename.endsWith(workspace_1.$Xh)) {
                filename = filename.substr(0, filename.length - workspace_1.$Xh.length - 1);
            }
            return { title: (0, nls_1.localize)(5, null, filename), description: this.L(workspace.configPath) };
        }
        L(uri) {
            return uri.scheme === 'file' ? (0, labels_1.$fA)(uri.fsPath) : uri.toString();
        }
        async M() {
            if (!platform_1.$j) {
                return;
            }
            // We clear all documents first to ensure an up-to-date view on the set. Since entries
            // can get deleted on disk, this ensures that the list is always valid
            electron_1.app.clearRecentDocuments();
            const mru = await this.getRecentlyOpened();
            // Collect max-N recent workspaces that are known to exist
            const workspaceEntries = [];
            let entries = 0;
            for (let i = 0; i < mru.workspaces.length && entries < $q6b_1.z; i++) {
                const loc = this.t(mru.workspaces[i]);
                if (loc.scheme === network_1.Schemas.file) {
                    const workspacePath = (0, resources_1.$9f)(loc);
                    if (await pfs_1.Promises.exists(workspacePath)) {
                        workspaceEntries.push(workspacePath);
                        entries++;
                    }
                }
            }
            // Collect max-N recent files that are known to exist
            const fileEntries = [];
            for (let i = 0; i < mru.files.length && entries < $q6b_1.C; i++) {
                const loc = this.t(mru.files[i]);
                if (loc.scheme === network_1.Schemas.file) {
                    const filePath = (0, resources_1.$9f)(loc);
                    if ($q6b_1.F.includes((0, resources_1.$fg)(loc)) || // skip some well known file entries
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
    exports.$q6b = $q6b;
    exports.$q6b = $q6b = $q6b_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, workspacesManagementMainService_1.$S5b),
        __param(2, lifecycleMainService_1.$p5b),
        __param(3, storageMainService_1.$z5b)
    ], $q6b);
});
//# sourceMappingURL=workspacesHistoryMainService.js.map