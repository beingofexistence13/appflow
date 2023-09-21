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
define(["require", "exports", "electron", "vs/base/node/pfs", "vs/base/node/unc", "os", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/functional", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/platform/windows/electron-main/windowsMainService", "vs/platform/backup/electron-main/backup", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/protocol/electron-main/protocol", "vs/platform/remote/common/remoteHosts", "vs/platform/state/node/state", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windowImpl", "vs/platform/windows/electron-main/windowsFinder", "vs/platform/windows/electron-main/windowsStateHandler", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/node/workspaces", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/theme/electron-main/themeMainService", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/log/electron-main/loggerService"], function (require, exports, electron_1, pfs_1, unc_1, os_1, arrays_1, cancellation_1, event_1, extpath_1, functional_1, labels_1, lifecycle_1, network_1, path_1, performance_1, platform_1, process_1, resources_1, types_1, uri_1, nls_1, backup_1, configuration_1, dialogMainService_1, environmentMainService_1, files_1, instantiation_1, lifecycleMainService_1, log_1, product_1, protocol_1, remoteHosts_1, state_1, window_1, windowImpl_1, windowsFinder_1, windowsStateHandler_1, workspace_1, workspaces_1, workspacesHistoryMainService_1, workspacesManagementMainService_1, themeMainService_1, policy_1, userDataProfile_1, loggerService_1) {
    "use strict";
    var $W6b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$W6b = void 0;
    function isWorkspacePathToOpen(path) {
        return (0, workspace_1.$Qh)(path?.workspace);
    }
    function isSingleFolderWorkspacePathToOpen(path) {
        return (0, workspace_1.$Lh)(path?.workspace);
    }
    //#endregion
    let $W6b = class $W6b extends lifecycle_1.$kc {
        static { $W6b_1 = this; }
        static { this.a = []; }
        constructor(m, n, r, s, t, u, w, z, C, D, F, G, H, I, J, L, M, N) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.b = this.B(new event_1.$fd());
            this.onDidOpenWindow = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidSignalReadyWindow = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidDestroyWindow = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeWindowsCount = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidTriggerSystemContextMenu = this.h.event;
            this.j = this.B(new windowsStateHandler_1.$T6b(this, this.t, this.C, this.r, this.F));
            this.O();
        }
        O() {
            // Signal a window is ready after having entered a workspace
            this.B(this.H.onDidEnterWorkspace(event => this.c.fire(event.window)));
            // Update valid roots in protocol service for extension dev windows
            this.B(this.onDidSignalReadyWindow(window => {
                if (window.config?.extensionDevelopmentPath || window.config?.extensionTestsPath) {
                    const disposables = new lifecycle_1.$jc();
                    disposables.add(event_1.Event.any(window.onDidClose, window.onDidDestroy)(() => disposables.dispose()));
                    // Allow access to extension development path
                    if (window.config.extensionDevelopmentPath) {
                        for (const extensionDevelopmentPath of window.config.extensionDevelopmentPath) {
                            disposables.add(this.M.addValidFileRoot(extensionDevelopmentPath));
                        }
                    }
                    // Allow access to extension tests path
                    if (window.config.extensionTestsPath) {
                        disposables.add(this.M.addValidFileRoot(window.config.extensionTestsPath));
                    }
                }
            }));
        }
        openEmptyWindow(openConfig, options) {
            const cli = this.w.args;
            const remoteAuthority = options?.remoteAuthority || undefined;
            const forceEmpty = true;
            const forceReuseWindow = options?.forceReuseWindow;
            const forceNewWindow = !forceReuseWindow;
            return this.open({ ...openConfig, cli, forceEmpty, forceNewWindow, forceReuseWindow, remoteAuthority });
        }
        openExistingWindow(window, openConfig) {
            // Bring window to front
            window.focus();
            // Handle --wait
            this.P(openConfig, [window]);
        }
        async open(openConfig) {
            this.r.trace('windowsManager#open');
            if (openConfig.addMode && (openConfig.initialStartup || !this.getLastActiveWindow())) {
                openConfig.addMode = false; // Make sure addMode is only enabled if we have an active window
            }
            const foldersToAdd = [];
            const foldersToOpen = [];
            const workspacesToOpen = [];
            const untitledWorkspacesToRestore = [];
            const emptyWindowsWithBackupsToRestore = [];
            let filesToOpen;
            let emptyToOpen = 0;
            // Identify things to open from open config
            const pathsToOpen = await this.X(openConfig);
            this.r.trace('windowsManager#open pathsToOpen', pathsToOpen);
            for (const path of pathsToOpen) {
                if (isSingleFolderWorkspacePathToOpen(path)) {
                    if (openConfig.addMode) {
                        // When run with --add, take the folders that are to be opened as
                        // folders that should be added to the currently active window.
                        foldersToAdd.push(path);
                    }
                    else {
                        foldersToOpen.push(path);
                    }
                }
                else if (isWorkspacePathToOpen(path)) {
                    workspacesToOpen.push(path);
                }
                else if (path.fileUri) {
                    if (!filesToOpen) {
                        filesToOpen = { filesToOpenOrCreate: [], filesToDiff: [], filesToMerge: [], remoteAuthority: path.remoteAuthority };
                    }
                    filesToOpen.filesToOpenOrCreate.push(path);
                }
                else if (path.backupPath) {
                    emptyWindowsWithBackupsToRestore.push({ backupFolder: (0, path_1.$ae)(path.backupPath), remoteAuthority: path.remoteAuthority });
                }
                else {
                    emptyToOpen++;
                }
            }
            // When run with --diff, take the first 2 files to open as files to diff
            if (openConfig.diffMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length >= 2) {
                filesToOpen.filesToDiff = filesToOpen.filesToOpenOrCreate.slice(0, 2);
                filesToOpen.filesToOpenOrCreate = [];
            }
            // When run with --merge, take the first 4 files to open as files to merge
            if (openConfig.mergeMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length === 4) {
                filesToOpen.filesToMerge = filesToOpen.filesToOpenOrCreate.slice(0, 4);
                filesToOpen.filesToOpenOrCreate = [];
                filesToOpen.filesToDiff = [];
            }
            // When run with --wait, make sure we keep the paths to wait for
            if (filesToOpen && openConfig.waitMarkerFileURI) {
                filesToOpen.filesToWait = { paths: (0, arrays_1.$Fb)([...filesToOpen.filesToDiff, filesToOpen.filesToMerge[3] /* [3] is the resulting merge file */, ...filesToOpen.filesToOpenOrCreate]), waitMarkerFileUri: openConfig.waitMarkerFileURI };
            }
            // These are windows to restore because of hot-exit or from previous session (only performed once on startup!)
            if (openConfig.initialStartup) {
                // Untitled workspaces are always restored
                untitledWorkspacesToRestore.push(...this.H.getUntitledWorkspaces());
                workspacesToOpen.push(...untitledWorkspacesToRestore);
                // Empty windows with backups are always restored
                emptyWindowsWithBackupsToRestore.push(...this.D.getEmptyWindowBackups());
            }
            else {
                emptyWindowsWithBackupsToRestore.length = 0;
            }
            // Open based on config
            const { windows: usedWindows, filesOpenedInWindow } = await this.Q(openConfig, workspacesToOpen, foldersToOpen, emptyWindowsWithBackupsToRestore, emptyToOpen, filesToOpen, foldersToAdd);
            this.r.trace(`windowsManager#open used window count ${usedWindows.length} (workspacesToOpen: ${workspacesToOpen.length}, foldersToOpen: ${foldersToOpen.length}, emptyToRestore: ${emptyWindowsWithBackupsToRestore.length}, emptyToOpen: ${emptyToOpen})`);
            // Make sure to pass focus to the most relevant of the windows if we open multiple
            if (usedWindows.length > 1) {
                // 1.) focus window we opened files in always with highest priority
                if (filesOpenedInWindow) {
                    filesOpenedInWindow.focus();
                }
                // Otherwise, find a good window based on open params
                else {
                    const focusLastActive = this.j.state.lastActiveWindow && !openConfig.forceEmpty && !openConfig.cli._.length && !openConfig.cli['file-uri'] && !openConfig.cli['folder-uri'] && !(openConfig.urisToOpen && openConfig.urisToOpen.length);
                    let focusLastOpened = true;
                    let focusLastWindow = true;
                    // 2.) focus last active window if we are not instructed to open any paths
                    if (focusLastActive) {
                        const lastActiveWindow = usedWindows.filter(window => this.j.state.lastActiveWindow && window.backupPath === this.j.state.lastActiveWindow.backupPath);
                        if (lastActiveWindow.length) {
                            lastActiveWindow[0].focus();
                            focusLastOpened = false;
                            focusLastWindow = false;
                        }
                    }
                    // 3.) if instructed to open paths, focus last window which is not restored
                    if (focusLastOpened) {
                        for (let i = usedWindows.length - 1; i >= 0; i--) {
                            const usedWindow = usedWindows[i];
                            if ((usedWindow.openedWorkspace && untitledWorkspacesToRestore.some(workspace => usedWindow.openedWorkspace && workspace.workspace.id === usedWindow.openedWorkspace.id)) || // skip over restored workspace
                                (usedWindow.backupPath && emptyWindowsWithBackupsToRestore.some(empty => usedWindow.backupPath && empty.backupFolder === (0, path_1.$ae)(usedWindow.backupPath))) // skip over restored empty window
                            ) {
                                continue;
                            }
                            usedWindow.focus();
                            focusLastWindow = false;
                            break;
                        }
                    }
                    // 4.) finally, always ensure to have at least last used window focused
                    if (focusLastWindow) {
                        usedWindows[usedWindows.length - 1].focus();
                    }
                }
            }
            // Remember in recent document list (unless this opens for extension development)
            // Also do not add paths when files are opened for diffing or merging, only if opened individually
            const isDiff = filesToOpen && filesToOpen.filesToDiff.length > 0;
            const isMerge = filesToOpen && filesToOpen.filesToMerge.length > 0;
            if (!usedWindows.some(window => window.isExtensionDevelopmentHost) && !isDiff && !isMerge && !openConfig.noRecentEntry) {
                const recents = [];
                for (const pathToOpen of pathsToOpen) {
                    if (isWorkspacePathToOpen(pathToOpen) && !pathToOpen.transient /* never add transient workspaces to history */) {
                        recents.push({ label: pathToOpen.label, workspace: pathToOpen.workspace, remoteAuthority: pathToOpen.remoteAuthority });
                    }
                    else if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                        recents.push({ label: pathToOpen.label, folderUri: pathToOpen.workspace.uri, remoteAuthority: pathToOpen.remoteAuthority });
                    }
                    else if (pathToOpen.fileUri) {
                        recents.push({ label: pathToOpen.label, fileUri: pathToOpen.fileUri, remoteAuthority: pathToOpen.remoteAuthority });
                    }
                }
                this.G.addRecentlyOpened(recents);
            }
            // Handle --wait
            this.P(openConfig, usedWindows);
            return usedWindows;
        }
        P(openConfig, usedWindows) {
            // If we got started with --wait from the CLI, we need to signal to the outside when the window
            // used for the edit operation is closed or loaded to a different folder so that the waiting
            // process can continue. We do this by deleting the waitMarkerFilePath.
            const waitMarkerFileURI = openConfig.waitMarkerFileURI;
            if (openConfig.context === 0 /* OpenContext.CLI */ && waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
                (async () => {
                    await usedWindows[0].whenClosedOrLoaded;
                    try {
                        await this.L.del(waitMarkerFileURI);
                    }
                    catch (error) {
                        // ignore - could have been deleted from the window already
                    }
                })();
            }
        }
        async Q(openConfig, workspacesToOpen, foldersToOpen, emptyToRestore, emptyToOpen, filesToOpen, foldersToAdd) {
            // Keep track of used windows and remember
            // if files have been opened in one of them
            const usedWindows = [];
            let filesOpenedInWindow = undefined;
            function addUsedWindow(window, openedFiles) {
                usedWindows.push(window);
                if (openedFiles) {
                    filesOpenedInWindow = window;
                    filesToOpen = undefined; // reset `filesToOpen` since files have been opened
                }
            }
            // Settings can decide if files/folders open in new window or not
            let { openFolderInNewWindow, openFilesInNewWindow } = this.ib(openConfig);
            // Handle folders to add by looking for the last active workspace (not on initial startup)
            if (!openConfig.initialStartup && foldersToAdd.length > 0) {
                const authority = foldersToAdd[0].remoteAuthority;
                const lastActiveWindow = this.nb(authority);
                if (lastActiveWindow) {
                    addUsedWindow(this.S(lastActiveWindow, foldersToAdd.map(folderToAdd => folderToAdd.workspace.uri)));
                }
            }
            // Handle files to open/diff/merge or to create when we dont open a folder and we do not restore any
            // folder/untitled from hot-exit by trying to open them in the window that fits best
            const potentialNewWindowsCount = foldersToOpen.length + workspacesToOpen.length + emptyToRestore.length;
            if (filesToOpen && potentialNewWindowsCount === 0) {
                // Find suitable window or folder path to open files in
                const fileToCheck = filesToOpen.filesToOpenOrCreate[0] || filesToOpen.filesToDiff[0] || filesToOpen.filesToMerge[3] /* [3] is the resulting merge file */;
                // only look at the windows with correct authority
                const windows = this.getWindows().filter(window => filesToOpen && (0, resources_1.$ng)(window.remoteAuthority, filesToOpen.remoteAuthority));
                // figure out a good window to open the files in if any
                // with a fallback to the last active window.
                //
                // in case `openFilesInNewWindow` is enforced, we skip
                // this step.
                let windowToUseForFiles = undefined;
                if (fileToCheck?.fileUri && !openFilesInNewWindow) {
                    if (openConfig.context === 4 /* OpenContext.DESKTOP */ || openConfig.context === 0 /* OpenContext.CLI */ || openConfig.context === 1 /* OpenContext.DOCK */) {
                        windowToUseForFiles = await (0, windowsFinder_1.$P5b)(windows, fileToCheck.fileUri, async (workspace) => workspace.configPath.scheme === network_1.Schemas.file ? this.H.resolveLocalWorkspace(workspace.configPath) : undefined);
                    }
                    if (!windowToUseForFiles) {
                        windowToUseForFiles = this.ob(windows);
                    }
                }
                // We found a window to open the files in
                if (windowToUseForFiles) {
                    // Window is workspace
                    if ((0, workspace_1.$Qh)(windowToUseForFiles.openedWorkspace)) {
                        workspacesToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                    }
                    // Window is single folder
                    else if ((0, workspace_1.$Lh)(windowToUseForFiles.openedWorkspace)) {
                        foldersToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                    }
                    // Window is empty
                    else {
                        addUsedWindow(this.R(openConfig, windowToUseForFiles, filesToOpen), true);
                    }
                }
                // Finally, if no window or folder is found, just open the files in an empty window
                else {
                    addUsedWindow(await this.jb({
                        userEnv: openConfig.userEnv,
                        cli: openConfig.cli,
                        initialStartup: openConfig.initialStartup,
                        filesToOpen,
                        forceNewWindow: true,
                        remoteAuthority: filesToOpen.remoteAuthority,
                        forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
                        forceProfile: openConfig.forceProfile,
                        forceTempProfile: openConfig.forceTempProfile
                    }), true);
                }
            }
            // Handle workspaces to open (instructed and to restore)
            const allWorkspacesToOpen = (0, arrays_1.$Kb)(workspacesToOpen, workspace => workspace.workspace.id); // prevent duplicates
            if (allWorkspacesToOpen.length > 0) {
                // Check for existing instances
                const windowsOnWorkspace = (0, arrays_1.$Fb)(allWorkspacesToOpen.map(workspaceToOpen => (0, windowsFinder_1.$Q5b)(this.getWindows(), workspaceToOpen.workspace.configPath)));
                if (windowsOnWorkspace.length > 0) {
                    const windowOnWorkspace = windowsOnWorkspace[0];
                    const filesToOpenInWindow = (0, resources_1.$ng)(filesToOpen?.remoteAuthority, windowOnWorkspace.remoteAuthority) ? filesToOpen : undefined;
                    // Do open files
                    addUsedWindow(this.R(openConfig, windowOnWorkspace, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
                // Open remaining ones
                for (const workspaceToOpen of allWorkspacesToOpen) {
                    if (windowsOnWorkspace.some(window => window.openedWorkspace && window.openedWorkspace.id === workspaceToOpen.workspace.id)) {
                        continue; // ignore folders that are already open
                    }
                    const remoteAuthority = workspaceToOpen.remoteAuthority;
                    const filesToOpenInWindow = (0, resources_1.$ng)(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                    // Do open folder
                    addUsedWindow(await this.W(openConfig, workspaceToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
            }
            // Handle folders to open (instructed and to restore)
            const allFoldersToOpen = (0, arrays_1.$Kb)(foldersToOpen, folder => resources_1.$_f.getComparisonKey(folder.workspace.uri)); // prevent duplicates
            if (allFoldersToOpen.length > 0) {
                // Check for existing instances
                const windowsOnFolderPath = (0, arrays_1.$Fb)(allFoldersToOpen.map(folderToOpen => (0, windowsFinder_1.$Q5b)(this.getWindows(), folderToOpen.workspace.uri)));
                if (windowsOnFolderPath.length > 0) {
                    const windowOnFolderPath = windowsOnFolderPath[0];
                    const filesToOpenInWindow = (0, resources_1.$ng)(filesToOpen?.remoteAuthority, windowOnFolderPath.remoteAuthority) ? filesToOpen : undefined;
                    // Do open files
                    addUsedWindow(this.R(openConfig, windowOnFolderPath, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
                // Open remaining ones
                for (const folderToOpen of allFoldersToOpen) {
                    if (windowsOnFolderPath.some(window => (0, workspace_1.$Lh)(window.openedWorkspace) && resources_1.$_f.isEqual(window.openedWorkspace.uri, folderToOpen.workspace.uri))) {
                        continue; // ignore folders that are already open
                    }
                    const remoteAuthority = folderToOpen.remoteAuthority;
                    const filesToOpenInWindow = (0, resources_1.$ng)(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                    // Do open folder
                    addUsedWindow(await this.W(openConfig, folderToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
            }
            // Handle empty to restore
            const allEmptyToRestore = (0, arrays_1.$Kb)(emptyToRestore, info => info.backupFolder); // prevent duplicates
            if (allEmptyToRestore.length > 0) {
                for (const emptyWindowBackupInfo of allEmptyToRestore) {
                    const remoteAuthority = emptyWindowBackupInfo.remoteAuthority;
                    const filesToOpenInWindow = (0, resources_1.$ng)(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                    addUsedWindow(await this.U(openConfig, true, remoteAuthority, filesToOpenInWindow, emptyWindowBackupInfo), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
            }
            // Handle empty to open (only if no other window opened)
            if (usedWindows.length === 0 || filesToOpen) {
                if (filesToOpen && !emptyToOpen) {
                    emptyToOpen++;
                }
                const remoteAuthority = filesToOpen ? filesToOpen.remoteAuthority : openConfig.remoteAuthority;
                for (let i = 0; i < emptyToOpen; i++) {
                    addUsedWindow(await this.U(openConfig, openFolderInNewWindow, remoteAuthority, filesToOpen), !!filesToOpen);
                    // any other window to open must open in new window then
                    openFolderInNewWindow = true;
                }
            }
            return { windows: (0, arrays_1.$Kb)(usedWindows), filesOpenedInWindow };
        }
        R(configuration, window, filesToOpen) {
            this.r.trace('windowsManager#doOpenFilesInExistingWindow', { filesToOpen });
            window.focus(); // make sure window has focus
            const params = {
                filesToOpenOrCreate: filesToOpen?.filesToOpenOrCreate,
                filesToDiff: filesToOpen?.filesToDiff,
                filesToMerge: filesToOpen?.filesToMerge,
                filesToWait: filesToOpen?.filesToWait,
                termProgram: configuration?.userEnv?.['TERM_PROGRAM']
            };
            window.sendWhenReady('vscode:openFiles', cancellation_1.CancellationToken.None, params);
            return window;
        }
        S(window, foldersToAdd) {
            this.r.trace('windowsManager#doAddFoldersToExistingWindow', { foldersToAdd });
            window.focus(); // make sure window has focus
            const request = { foldersToAdd };
            window.sendWhenReady('vscode:addFolders', cancellation_1.CancellationToken.None, request);
            return window;
        }
        U(openConfig, forceNewWindow, remoteAuthority, filesToOpen, emptyWindowBackupInfo) {
            this.r.trace('windowsManager#doOpenEmpty', { restore: !!emptyWindowBackupInfo, remoteAuthority, filesToOpen, forceNewWindow });
            let windowToUse;
            if (!forceNewWindow && typeof openConfig.contextWindowId === 'number') {
                windowToUse = this.getWindowById(openConfig.contextWindowId); // fix for https://github.com/microsoft/vscode/issues/97172
            }
            return this.jb({
                userEnv: openConfig.userEnv,
                cli: openConfig.cli,
                initialStartup: openConfig.initialStartup,
                remoteAuthority,
                forceNewWindow,
                forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
                filesToOpen,
                windowToUse,
                emptyWindowBackupInfo,
                forceProfile: openConfig.forceProfile,
                forceTempProfile: openConfig.forceTempProfile
            });
        }
        W(openConfig, folderOrWorkspace, forceNewWindow, filesToOpen, windowToUse) {
            this.r.trace('windowsManager#doOpenFolderOrWorkspace', { folderOrWorkspace, filesToOpen });
            if (!forceNewWindow && !windowToUse && typeof openConfig.contextWindowId === 'number') {
                windowToUse = this.getWindowById(openConfig.contextWindowId); // fix for https://github.com/microsoft/vscode/issues/49587
            }
            return this.jb({
                workspace: folderOrWorkspace.workspace,
                userEnv: openConfig.userEnv,
                cli: openConfig.cli,
                initialStartup: openConfig.initialStartup,
                remoteAuthority: folderOrWorkspace.remoteAuthority,
                forceNewWindow,
                forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
                filesToOpen,
                windowToUse,
                forceProfile: openConfig.forceProfile,
                forceTempProfile: openConfig.forceTempProfile
            });
        }
        async X(openConfig) {
            let pathsToOpen;
            let isCommandLineOrAPICall = false;
            let restoredWindows = false;
            // Extract paths: from API
            if (openConfig.urisToOpen && openConfig.urisToOpen.length > 0) {
                pathsToOpen = await this.Y(openConfig);
                isCommandLineOrAPICall = true;
            }
            // Check for force empty
            else if (openConfig.forceEmpty) {
                pathsToOpen = [Object.create(null)];
            }
            // Extract paths: from CLI
            else if (openConfig.cli._.length || openConfig.cli['folder-uri'] || openConfig.cli['file-uri']) {
                pathsToOpen = await this.Z(openConfig.cli);
                if (pathsToOpen.length === 0) {
                    pathsToOpen.push(Object.create(null)); // add an empty window if we did not have windows to open from command line
                }
                isCommandLineOrAPICall = true;
            }
            // Extract paths: from previous session
            else {
                pathsToOpen = await this.ab();
                if (pathsToOpen.length === 0) {
                    pathsToOpen.push(Object.create(null)); // add an empty window if we did not have windows to restore
                }
                restoredWindows = true;
            }
            // Convert multiple folders into workspace (if opened via API or CLI)
            // This will ensure to open these folders in one window instead of multiple
            // If we are in `addMode`, we should not do this because in that case all
            // folders should be added to the existing window.
            if (!openConfig.addMode && isCommandLineOrAPICall) {
                const foldersToOpen = pathsToOpen.filter(path => isSingleFolderWorkspacePathToOpen(path));
                if (foldersToOpen.length > 1) {
                    const remoteAuthority = foldersToOpen[0].remoteAuthority;
                    if (foldersToOpen.every(folderToOpen => (0, resources_1.$ng)(folderToOpen.remoteAuthority, remoteAuthority))) { // only if all folder have the same authority
                        const workspace = await this.H.createUntitledWorkspace(foldersToOpen.map(folder => ({ uri: folder.workspace.uri })));
                        // Add workspace and remove folders thereby
                        pathsToOpen.push({ workspace, remoteAuthority });
                        pathsToOpen = pathsToOpen.filter(path => !isSingleFolderWorkspacePathToOpen(path));
                    }
                }
            }
            // Check for `window.startup` setting to include all windows
            // from the previous session if this is the initial startup and we have
            // not restored windows already otherwise.
            // Use `unshift` to ensure any new window to open comes last
            // for proper focus treatment.
            if (openConfig.initialStartup && !restoredWindows && this.F.getValue('window')?.restoreWindows === 'preserve') {
                const lastSessionPaths = await this.ab();
                pathsToOpen.unshift(...lastSessionPaths.filter(path => isWorkspacePathToOpen(path) || isSingleFolderWorkspacePathToOpen(path) || path.backupPath));
            }
            return pathsToOpen;
        }
        async Y(openConfig) {
            const pathResolveOptions = {
                gotoLineMode: openConfig.gotoLineMode,
                remoteAuthority: openConfig.remoteAuthority
            };
            const pathsToOpen = await Promise.all((0, arrays_1.$Fb)(openConfig.urisToOpen || []).map(async (pathToOpen) => {
                const path = await this.cb(pathToOpen, pathResolveOptions);
                // Path exists
                if (path) {
                    path.label = pathToOpen.label;
                    return path;
                }
                // Path does not exist: show a warning box
                const uri = this.eb(pathToOpen);
                this.J.showMessageBox({
                    type: 'info',
                    buttons: [(0, nls_1.localize)(0, null)],
                    message: uri.scheme === network_1.Schemas.file ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null),
                    detail: uri.scheme === network_1.Schemas.file ?
                        (0, nls_1.localize)(3, null, (0, labels_1.$eA)(uri, { os: platform_1.OS, tildify: this.w })) :
                        (0, nls_1.localize)(4, null, uri.toString(true))
                }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
                return undefined;
            }));
            return (0, arrays_1.$Fb)(pathsToOpen);
        }
        async Z(cli) {
            const pathsToOpen = [];
            const pathResolveOptions = {
                ignoreFileNotFound: true,
                gotoLineMode: cli.goto,
                remoteAuthority: cli.remote || undefined,
                forceOpenWorkspaceAsFile: 
                // special case diff / merge mode to force open
                // workspace as file
                // https://github.com/microsoft/vscode/issues/149731
                cli.diff && cli._.length === 2 ||
                    cli.merge && cli._.length === 4
            };
            // folder uris
            const folderUris = cli['folder-uri'];
            if (folderUris) {
                const resolvedFolderUris = await Promise.all(folderUris.map(rawFolderUri => {
                    const folderUri = this.$(rawFolderUri);
                    if (!folderUri) {
                        return undefined;
                    }
                    return this.cb({ folderUri }, pathResolveOptions);
                }));
                pathsToOpen.push(...(0, arrays_1.$Fb)(resolvedFolderUris));
            }
            // file uris
            const fileUris = cli['file-uri'];
            if (fileUris) {
                const resolvedFileUris = await Promise.all(fileUris.map(rawFileUri => {
                    const fileUri = this.$(rawFileUri);
                    if (!fileUri) {
                        return undefined;
                    }
                    return this.cb((0, workspace_1.$7h)(rawFileUri) ? { workspaceUri: fileUri } : { fileUri }, pathResolveOptions);
                }));
                pathsToOpen.push(...(0, arrays_1.$Fb)(resolvedFileUris));
            }
            // folder or file paths
            const resolvedCliPaths = await Promise.all(cli._.map(cliPath => {
                return pathResolveOptions.remoteAuthority ? this.hb(cliPath, pathResolveOptions) : this.fb(cliPath, pathResolveOptions);
            }));
            pathsToOpen.push(...(0, arrays_1.$Fb)(resolvedCliPaths));
            return pathsToOpen;
        }
        $(arg) {
            try {
                const uri = uri_1.URI.parse(arg);
                if (!uri.scheme) {
                    this.r.error(`Invalid URI input string, scheme missing: ${arg}`);
                    return undefined;
                }
                if (!uri.path) {
                    return uri.with({ path: '/' });
                }
                return uri;
            }
            catch (e) {
                this.r.error(`Invalid URI input string: ${arg}, ${e.message}`);
            }
            return undefined;
        }
        async ab() {
            const restoreWindowsSetting = this.bb();
            switch (restoreWindowsSetting) {
                // none: no window to restore
                case 'none':
                    return [];
                // one: restore last opened workspace/folder or empty window
                // all: restore all windows
                // folders: restore last opened folders only
                case 'one':
                case 'all':
                case 'preserve':
                case 'folders': {
                    // Collect previously opened windows
                    const lastSessionWindows = [];
                    if (restoreWindowsSetting !== 'one') {
                        lastSessionWindows.push(...this.j.state.openedWindows);
                    }
                    if (this.j.state.lastActiveWindow) {
                        lastSessionWindows.push(this.j.state.lastActiveWindow);
                    }
                    const pathsToOpen = await Promise.all(lastSessionWindows.map(async (lastSessionWindow) => {
                        // Workspaces
                        if (lastSessionWindow.workspace) {
                            const pathToOpen = await this.cb({ workspaceUri: lastSessionWindow.workspace.configPath }, { remoteAuthority: lastSessionWindow.remoteAuthority, rejectTransientWorkspaces: true /* https://github.com/microsoft/vscode/issues/119695 */ });
                            if (isWorkspacePathToOpen(pathToOpen)) {
                                return pathToOpen;
                            }
                        }
                        // Folders
                        else if (lastSessionWindow.folderUri) {
                            const pathToOpen = await this.cb({ folderUri: lastSessionWindow.folderUri }, { remoteAuthority: lastSessionWindow.remoteAuthority });
                            if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                                return pathToOpen;
                            }
                        }
                        // Empty window, potentially editors open to be restored
                        else if (restoreWindowsSetting !== 'folders' && lastSessionWindow.backupPath) {
                            return { backupPath: lastSessionWindow.backupPath, remoteAuthority: lastSessionWindow.remoteAuthority };
                        }
                        return undefined;
                    }));
                    return (0, arrays_1.$Fb)(pathsToOpen);
                }
            }
        }
        bb() {
            let restoreWindows;
            if (this.C.wasRestarted) {
                restoreWindows = 'all'; // always reopen all windows when an update was applied
            }
            else {
                const windowConfig = this.F.getValue('window');
                restoreWindows = windowConfig?.restoreWindows || 'all'; // by default restore all windows
                if (!['preserve', 'all', 'folders', 'one', 'none'].includes(restoreWindows)) {
                    restoreWindows = 'all'; // by default restore all windows
                }
            }
            return restoreWindows;
        }
        async cb(openable, options = Object.create(null)) {
            // handle file:// openables with some extra validation
            const uri = this.eb(openable);
            if (uri.scheme === network_1.Schemas.file) {
                if ((0, window_1.$SD)(openable)) {
                    options = { ...options, forceOpenWorkspaceAsFile: true };
                }
                return this.fb(uri.fsPath, options);
            }
            // handle non file:// openables
            return this.db(openable, options);
        }
        db(openable, options) {
            let uri = this.eb(openable);
            // use remote authority from vscode
            const remoteAuthority = (0, remoteHosts_1.$Ok)(uri) || options.remoteAuthority;
            // normalize URI
            uri = (0, resources_1.$pg)((0, resources_1.$jg)(uri));
            // File
            if ((0, window_1.$SD)(openable)) {
                if (options.gotoLineMode) {
                    const { path, line, column } = (0, extpath_1.$Pf)(uri.path);
                    return {
                        fileUri: uri.with({ path }),
                        options: {
                            selection: line ? { startLineNumber: line, startColumn: column || 1 } : undefined
                        },
                        remoteAuthority
                    };
                }
                return { fileUri: uri, remoteAuthority };
            }
            // Workspace
            else if ((0, window_1.$QD)(openable)) {
                return { workspace: (0, workspaces_1.$I5b)(uri), remoteAuthority };
            }
            // Folder
            return { workspace: (0, workspaces_1.$J5b)(uri), remoteAuthority };
        }
        eb(openable) {
            if ((0, window_1.$QD)(openable)) {
                return openable.workspaceUri;
            }
            if ((0, window_1.$RD)(openable)) {
                return openable.folderUri;
            }
            return openable.fileUri;
        }
        async fb(path, options, skipHandleUNCError) {
            // Extract line/col information from path
            let lineNumber;
            let columnNumber;
            if (options.gotoLineMode) {
                ({ path, line: lineNumber, column: columnNumber } = (0, extpath_1.$Pf)(path));
            }
            // Ensure the path is normalized and absolute
            path = (0, extpath_1.$Kf)((0, path_1.$7d)(path), (0, process_1.cwd)());
            try {
                const pathStat = await pfs_1.Promises.stat(path);
                // File
                if (pathStat.isFile()) {
                    // Workspace (unless disabled via flag)
                    if (!options.forceOpenWorkspaceAsFile) {
                        const workspace = await this.H.resolveLocalWorkspace(uri_1.URI.file(path));
                        if (workspace) {
                            // If the workspace is transient and we are to ignore
                            // transient workspaces, reject it.
                            if (workspace.transient && options.rejectTransientWorkspaces) {
                                return undefined;
                            }
                            return {
                                workspace: { id: workspace.id, configPath: workspace.configPath },
                                type: files_1.FileType.File,
                                exists: true,
                                remoteAuthority: workspace.remoteAuthority,
                                transient: workspace.transient
                            };
                        }
                    }
                    return {
                        fileUri: uri_1.URI.file(path),
                        type: files_1.FileType.File,
                        exists: true,
                        options: {
                            selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                        }
                    };
                }
                // Folder
                else if (pathStat.isDirectory()) {
                    return {
                        workspace: (0, workspaces_1.$J5b)(uri_1.URI.file(path), pathStat),
                        type: files_1.FileType.Directory,
                        exists: true
                    };
                }
                // Special device: in POSIX environments, we may get /dev/null passed
                // in (for example git uses it to signal one side of a diff does not
                // exist). In that special case, treat it like a file to support this
                // scenario ()
                else if (!platform_1.$i && path === '/dev/null') {
                    return {
                        fileUri: uri_1.URI.file(path),
                        type: files_1.FileType.File,
                        exists: true
                    };
                }
            }
            catch (error) {
                if (error.code === 'ERR_UNC_HOST_NOT_ALLOWED' && !skipHandleUNCError) {
                    return this.gb(path, options);
                }
                const fileUri = uri_1.URI.file(path);
                // since file does not seem to exist anymore, remove from recent
                this.G.removeRecentlyOpened([fileUri]);
                // assume this is a file that does not yet exist
                if (options.ignoreFileNotFound) {
                    return {
                        fileUri,
                        type: files_1.FileType.File,
                        exists: false
                    };
                }
            }
            return undefined;
        }
        async gb(path, options) {
            const uri = uri_1.URI.file(path);
            const { response, checkboxChecked } = await this.J.showMessageBox({
                type: 'warning',
                buttons: [
                    (0, nls_1.localize)(5, null),
                    (0, nls_1.localize)(6, null),
                    (0, nls_1.localize)(7, null),
                ],
                message: (0, nls_1.localize)(8, null, uri.authority),
                detail: (0, nls_1.localize)(9, null, (0, labels_1.$eA)(uri, { os: platform_1.OS, tildify: this.w })),
                checkboxLabel: (0, nls_1.localize)(10, null, uri.authority),
                cancelId: 1
            });
            if (response === 0) {
                (0, unc_1.addUNCHostToAllowlist)(uri.authority);
                if (checkboxChecked) {
                    this.B(event_1.Event.once(this.onDidOpenWindow)(window => {
                        window.sendWhenReady('vscode:configureAllowedUNCHost', cancellation_1.CancellationToken.None, uri.authority);
                    }));
                }
                return this.fb(path, options, true /* do not handle UNC error again */);
            }
            if (response === 2) {
                electron_1.shell.openExternal('https://aka.ms/vscode-windows-unc');
                return this.gb(path, options); // keep showing the dialog until decision (https://github.com/microsoft/vscode/issues/181956)
            }
            return undefined;
        }
        hb(path, options) {
            const first = path.charCodeAt(0);
            const remoteAuthority = options.remoteAuthority;
            // Extract line/col information from path
            let lineNumber;
            let columnNumber;
            if (options.gotoLineMode) {
                ({ path, line: lineNumber, column: columnNumber } = (0, extpath_1.$Pf)(path));
            }
            // make absolute
            if (first !== 47 /* CharCode.Slash */) {
                if ((0, extpath_1.$Jf)(first) && path.charCodeAt(path.charCodeAt(1)) === 58 /* CharCode.Colon */) {
                    path = (0, extpath_1.$Cf)(path);
                }
                path = `/${path}`;
            }
            const uri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, authority: remoteAuthority, path: path });
            // guess the file type:
            // - if it ends with a slash it's a folder
            // - if in goto line mode or if it has a file extension, it's a file or a workspace
            // - by defaults it's a folder
            if (path.charCodeAt(path.length - 1) !== 47 /* CharCode.Slash */) {
                // file name ends with .code-workspace
                if ((0, workspace_1.$7h)(path)) {
                    if (options.forceOpenWorkspaceAsFile) {
                        return {
                            fileUri: uri,
                            options: {
                                selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                            },
                            remoteAuthority: options.remoteAuthority
                        };
                    }
                    return { workspace: (0, workspaces_1.$I5b)(uri), remoteAuthority };
                }
                // file name starts with a dot or has an file extension
                else if (options.gotoLineMode || path_1.$6d.basename(path).indexOf('.') !== -1) {
                    return {
                        fileUri: uri,
                        options: {
                            selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                        },
                        remoteAuthority
                    };
                }
            }
            return { workspace: (0, workspaces_1.$J5b)(uri), remoteAuthority };
        }
        ib(openConfig) {
            // let the user settings override how folders are open in a new window or same window unless we are forced
            const windowConfig = this.F.getValue('window');
            const openFolderInNewWindowConfig = windowConfig?.openFoldersInNewWindow || 'default' /* default */;
            const openFilesInNewWindowConfig = windowConfig?.openFilesInNewWindow || 'off' /* default */;
            let openFolderInNewWindow = (openConfig.preferNewWindow || openConfig.forceNewWindow) && !openConfig.forceReuseWindow;
            if (!openConfig.forceNewWindow && !openConfig.forceReuseWindow && (openFolderInNewWindowConfig === 'on' || openFolderInNewWindowConfig === 'off')) {
                openFolderInNewWindow = (openFolderInNewWindowConfig === 'on');
            }
            // let the user settings override how files are open in a new window or same window unless we are forced (not for extension development though)
            let openFilesInNewWindow = false;
            if (openConfig.forceNewWindow || openConfig.forceReuseWindow) {
                openFilesInNewWindow = !!openConfig.forceNewWindow && !openConfig.forceReuseWindow;
            }
            else {
                // macOS: by default we open files in a new window if this is triggered via DOCK context
                if (platform_1.$j) {
                    if (openConfig.context === 1 /* OpenContext.DOCK */) {
                        openFilesInNewWindow = true;
                    }
                }
                // Linux/Windows: by default we open files in the new window unless triggered via DIALOG / MENU context
                // or from the integrated terminal where we assume the user prefers to open in the current window
                else {
                    if (openConfig.context !== 3 /* OpenContext.DIALOG */ && openConfig.context !== 2 /* OpenContext.MENU */ && !(openConfig.userEnv && openConfig.userEnv['TERM_PROGRAM'] === 'vscode')) {
                        openFilesInNewWindow = true;
                    }
                }
                // finally check for overrides of default
                if (!openConfig.cli.extensionDevelopmentPath && (openFilesInNewWindowConfig === 'on' || openFilesInNewWindowConfig === 'off')) {
                    openFilesInNewWindow = (openFilesInNewWindowConfig === 'on');
                }
            }
            return { openFolderInNewWindow: !!openFolderInNewWindow, openFilesInNewWindow };
        }
        async openExtensionDevelopmentHostWindow(extensionDevelopmentPaths, openConfig) {
            // Reload an existing extension development host window on the same path
            // We currently do not allow more than one extension development window
            // on the same extension path.
            const existingWindow = (0, windowsFinder_1.$R5b)(this.getWindows(), extensionDevelopmentPaths);
            if (existingWindow) {
                this.C.reload(existingWindow, openConfig.cli);
                existingWindow.focus(); // make sure it gets focus and is restored
                return [existingWindow];
            }
            let folderUris = openConfig.cli['folder-uri'] || [];
            let fileUris = openConfig.cli['file-uri'] || [];
            let cliArgs = openConfig.cli._;
            // Fill in previously opened workspace unless an explicit path is provided and we are not unit testing
            if (!cliArgs.length && !folderUris.length && !fileUris.length && !openConfig.cli.extensionTestsPath) {
                const extensionDevelopmentWindowState = this.j.state.lastPluginDevelopmentHostWindow;
                const workspaceToOpen = extensionDevelopmentWindowState?.workspace ?? extensionDevelopmentWindowState?.folderUri;
                if (workspaceToOpen) {
                    if (uri_1.URI.isUri(workspaceToOpen)) {
                        if (workspaceToOpen.scheme === network_1.Schemas.file) {
                            cliArgs = [workspaceToOpen.fsPath];
                        }
                        else {
                            folderUris = [workspaceToOpen.toString()];
                        }
                    }
                    else {
                        if (workspaceToOpen.configPath.scheme === network_1.Schemas.file) {
                            cliArgs = [(0, resources_1.$9f)(workspaceToOpen.configPath)];
                        }
                        else {
                            fileUris = [workspaceToOpen.configPath.toString()];
                        }
                    }
                }
            }
            let remoteAuthority = openConfig.remoteAuthority;
            for (const extensionDevelopmentPath of extensionDevelopmentPaths) {
                if (extensionDevelopmentPath.match(/^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/)) {
                    const url = uri_1.URI.parse(extensionDevelopmentPath);
                    const extensionDevelopmentPathRemoteAuthority = (0, remoteHosts_1.$Ok)(url);
                    if (extensionDevelopmentPathRemoteAuthority) {
                        if (remoteAuthority) {
                            if (!(0, resources_1.$ng)(extensionDevelopmentPathRemoteAuthority, remoteAuthority)) {
                                this.r.error('more than one extension development path authority');
                            }
                        }
                        else {
                            remoteAuthority = extensionDevelopmentPathRemoteAuthority;
                        }
                    }
                }
            }
            // Make sure that we do not try to open:
            // - a workspace or folder that is already opened
            // - a workspace or file that has a different authority as the extension development.
            cliArgs = cliArgs.filter(path => {
                const uri = uri_1.URI.file(path);
                if (!!(0, windowsFinder_1.$Q5b)(this.getWindows(), uri)) {
                    return false;
                }
                return (0, resources_1.$ng)((0, remoteHosts_1.$Ok)(uri), remoteAuthority);
            });
            folderUris = folderUris.filter(folderUriStr => {
                const folderUri = this.$(folderUriStr);
                if (folderUri && !!(0, windowsFinder_1.$Q5b)(this.getWindows(), folderUri)) {
                    return false;
                }
                return folderUri ? (0, resources_1.$ng)((0, remoteHosts_1.$Ok)(folderUri), remoteAuthority) : false;
            });
            fileUris = fileUris.filter(fileUriStr => {
                const fileUri = this.$(fileUriStr);
                if (fileUri && !!(0, windowsFinder_1.$Q5b)(this.getWindows(), fileUri)) {
                    return false;
                }
                return fileUri ? (0, resources_1.$ng)((0, remoteHosts_1.$Ok)(fileUri), remoteAuthority) : false;
            });
            openConfig.cli._ = cliArgs;
            openConfig.cli['folder-uri'] = folderUris;
            openConfig.cli['file-uri'] = fileUris;
            // Open it
            const openArgs = {
                context: openConfig.context,
                cli: openConfig.cli,
                forceNewWindow: true,
                forceEmpty: !cliArgs.length && !folderUris.length && !fileUris.length,
                userEnv: openConfig.userEnv,
                noRecentEntry: true,
                waitMarkerFileURI: openConfig.waitMarkerFileURI,
                remoteAuthority,
                forceProfile: openConfig.forceProfile,
                forceTempProfile: openConfig.forceTempProfile
            };
            return this.open(openArgs);
        }
        async jb(options) {
            const windowConfig = this.F.getValue('window');
            const lastActiveWindow = this.getLastActiveWindow();
            const defaultProfile = lastActiveWindow?.profile ?? this.z.defaultProfile;
            let window;
            if (!options.forceNewWindow && !options.forceNewTabbedWindow) {
                window = options.windowToUse || lastActiveWindow;
                if (window) {
                    window.focus();
                }
            }
            // Build up the window configuration from provided options, config and environment
            const configuration = {
                // Inherit CLI arguments from environment and/or
                // the specific properties from this launch if provided
                ...this.w.args,
                ...options.cli,
                machineId: this.m,
                windowId: -1,
                mainPid: process.pid,
                appRoot: this.w.appRoot,
                execPath: process.execPath,
                codeCachePath: this.w.codeCachePath,
                // If we know the backup folder upfront (for empty windows to restore), we can set it
                // directly here which helps for restoring UI state associated with that window.
                // For all other cases we first call into registerEmptyWindowBackup() to set it before
                // loading the window.
                backupPath: options.emptyWindowBackupInfo ? (0, path_1.$9d)(this.w.backupHome, options.emptyWindowBackupInfo.backupFolder) : undefined,
                profiles: {
                    home: this.z.profilesHome,
                    all: this.z.profiles,
                    // Set to default profile first and resolve and update the profile
                    // only after the workspace-backup is registered.
                    // Because, workspace identifier of an empty window is known only then.
                    profile: defaultProfile
                },
                homeDir: this.w.userHome.with({ scheme: network_1.Schemas.file }).fsPath,
                tmpDir: this.w.tmpDir.with({ scheme: network_1.Schemas.file }).fsPath,
                userDataDir: this.w.userDataPath,
                remoteAuthority: options.remoteAuthority,
                workspace: options.workspace,
                userEnv: { ...this.n, ...options.userEnv },
                filesToOpenOrCreate: options.filesToOpen?.filesToOpenOrCreate,
                filesToDiff: options.filesToOpen?.filesToDiff,
                filesToMerge: options.filesToOpen?.filesToMerge,
                filesToWait: options.filesToOpen?.filesToWait,
                logLevel: this.s.getLogLevel(),
                loggers: {
                    window: [],
                    global: this.s.getRegisteredLoggers()
                },
                logsPath: this.w.logsHome.with({ scheme: network_1.Schemas.file }).fsPath,
                product: product_1.default,
                isInitialStartup: options.initialStartup,
                perfMarks: (0, performance_1.getMarks)(),
                os: { release: (0, os_1.release)(), hostname: (0, os_1.hostname)(), arch: (0, os_1.arch)() },
                zoomLevel: typeof windowConfig?.zoomLevel === 'number' ? windowConfig.zoomLevel : undefined,
                autoDetectHighContrast: windowConfig?.autoDetectHighContrast ?? true,
                autoDetectColorScheme: windowConfig?.autoDetectColorScheme ?? false,
                accessibilitySupport: electron_1.app.accessibilitySupportEnabled,
                colorScheme: this.N.getColorScheme(),
                policiesData: this.u.serialize(),
                continueOn: this.w.continueOn
            };
            // New window
            if (!window) {
                const state = this.j.getNewWindowState(configuration);
                // Create the window
                (0, performance_1.mark)('code/willCreateCodeWindow');
                const createdWindow = window = this.I.createInstance(windowImpl_1.$S6b, {
                    state,
                    extensionDevelopmentPath: configuration.extensionDevelopmentPath,
                    isExtensionTestHost: !!configuration.extensionTestsPath
                });
                (0, performance_1.mark)('code/didCreateCodeWindow');
                // Add as window tab if configured (macOS only)
                if (options.forceNewTabbedWindow) {
                    const activeWindow = this.getLastActiveWindow();
                    activeWindow?.addTabbedWindow(createdWindow);
                }
                // Add to our list of windows
                $W6b_1.a.push(createdWindow);
                // Indicate new window via event
                this.b.fire(createdWindow);
                // Indicate number change via event
                this.g.fire({ oldCount: this.getWindowCount() - 1, newCount: this.getWindowCount() });
                // Window Events
                (0, functional_1.$bb)(createdWindow.onDidSignalReady)(() => this.c.fire(createdWindow));
                (0, functional_1.$bb)(createdWindow.onDidClose)(() => this.mb(createdWindow));
                (0, functional_1.$bb)(createdWindow.onDidDestroy)(() => this.f.fire(createdWindow));
                createdWindow.onDidTriggerSystemContextMenu(({ x, y }) => this.h.fire({ window: createdWindow, x, y }));
                const webContents = (0, types_1.$uf)(createdWindow.win?.webContents);
                webContents.removeAllListeners('devtools-reload-page'); // remove built in listener so we can handle this on our own
                webContents.on('devtools-reload-page', () => this.C.reload(createdWindow));
                // Lifecycle
                this.C.registerWindow(createdWindow);
            }
            // Existing window
            else {
                // Some configuration things get inherited if the window is being reused and we are
                // in extension development host mode. These options are all development related.
                const currentWindowConfig = window.config;
                if (!configuration.extensionDevelopmentPath && currentWindowConfig?.extensionDevelopmentPath) {
                    configuration.extensionDevelopmentPath = currentWindowConfig.extensionDevelopmentPath;
                    configuration.extensionDevelopmentKind = currentWindowConfig.extensionDevelopmentKind;
                    configuration['enable-proposed-api'] = currentWindowConfig['enable-proposed-api'];
                    configuration.verbose = currentWindowConfig.verbose;
                    configuration['inspect-extensions'] = currentWindowConfig['inspect-extensions'];
                    configuration['inspect-brk-extensions'] = currentWindowConfig['inspect-brk-extensions'];
                    configuration.debugId = currentWindowConfig.debugId;
                    configuration.extensionEnvironment = currentWindowConfig.extensionEnvironment;
                    configuration['extensions-dir'] = currentWindowConfig['extensions-dir'];
                    configuration['disable-extensions'] = currentWindowConfig['disable-extensions'];
                }
                configuration.loggers = {
                    global: configuration.loggers.global,
                    window: currentWindowConfig?.loggers.window ?? configuration.loggers.window
                };
            }
            // Update window identifier and session now
            // that we have the window object in hand.
            configuration.windowId = window.id;
            // If the window was already loaded, make sure to unload it
            // first and only load the new configuration if that was
            // not vetoed
            if (window.isReady) {
                this.C.unload(window, 4 /* UnloadReason.LOAD */).then(async (veto) => {
                    if (!veto) {
                        await this.kb(window, configuration, options, defaultProfile);
                    }
                });
            }
            else {
                await this.kb(window, configuration, options, defaultProfile);
            }
            return window;
        }
        async kb(window, configuration, options, defaultProfile) {
            // Register window for backups unless the window
            // is for extension development, where we do not
            // keep any backups.
            if (!configuration.extensionDevelopmentPath) {
                if ((0, workspace_1.$Qh)(configuration.workspace)) {
                    configuration.backupPath = this.D.registerWorkspaceBackup({
                        workspace: configuration.workspace,
                        remoteAuthority: configuration.remoteAuthority
                    });
                }
                else if ((0, workspace_1.$Lh)(configuration.workspace)) {
                    configuration.backupPath = this.D.registerFolderBackup({
                        folderUri: configuration.workspace.uri,
                        remoteAuthority: configuration.remoteAuthority
                    });
                }
                else {
                    // Empty windows are special in that they provide no workspace on
                    // their configuration. To properly register them with the backup
                    // service, we either use the provided associated `backupFolder`
                    // in case we restore a previously opened empty window or we have
                    // to generate a new empty window workspace identifier to be used
                    // as `backupFolder`.
                    configuration.backupPath = this.D.registerEmptyWindowBackup({
                        backupFolder: options.emptyWindowBackupInfo?.backupFolder ?? (0, workspaces_1.$K5b)().id,
                        remoteAuthority: configuration.remoteAuthority
                    });
                }
            }
            if (this.z.isEnabled()) {
                const workspace = configuration.workspace ?? (0, workspace_1.$Ph)(configuration.backupPath, false);
                const profilePromise = this.lb(options, workspace, defaultProfile);
                const profile = profilePromise instanceof Promise ? await profilePromise : profilePromise;
                configuration.profiles.profile = profile;
                if (!configuration.extensionDevelopmentPath) {
                    // Associate the configured profile to the workspace
                    // unless the window is for extension development,
                    // where we do not persist the associations
                    await this.z.setProfileForWorkspace(workspace, profile);
                }
            }
            // Load it
            window.load(configuration);
        }
        lb(options, workspace, defaultProfile) {
            if (options.forceProfile) {
                return this.z.profiles.find(p => p.name === options.forceProfile) ?? this.z.createNamedProfile(options.forceProfile);
            }
            if (options.forceTempProfile) {
                return this.z.createTransientProfile();
            }
            return this.z.getProfileForWorkspace(workspace) ?? defaultProfile;
        }
        mb(window) {
            // Remove from our list so that Electron can clean it up
            const index = $W6b_1.a.indexOf(window);
            $W6b_1.a.splice(index, 1);
            // Emit
            this.g.fire({ oldCount: this.getWindowCount() + 1, newCount: this.getWindowCount() });
        }
        getFocusedWindow() {
            const window = electron_1.BrowserWindow.getFocusedWindow();
            if (window) {
                return this.getWindowById(window.id);
            }
            return undefined;
        }
        getLastActiveWindow() {
            return this.ob(this.getWindows());
        }
        nb(remoteAuthority) {
            return this.ob(this.getWindows().filter(window => (0, resources_1.$ng)(window.remoteAuthority, remoteAuthority)));
        }
        ob(windows) {
            const lastFocusedDate = Math.max.apply(Math, windows.map(window => window.lastFocusTime));
            return windows.find(window => window.lastFocusTime === lastFocusedDate);
        }
        sendToFocused(channel, ...args) {
            const focusedWindow = this.getFocusedWindow() || this.getLastActiveWindow();
            focusedWindow?.sendWhenReady(channel, cancellation_1.CancellationToken.None, ...args);
        }
        sendToAll(channel, payload, windowIdsToIgnore) {
            for (const window of this.getWindows()) {
                if (windowIdsToIgnore && windowIdsToIgnore.indexOf(window.id) >= 0) {
                    continue; // do not send if we are instructed to ignore it
                }
                window.sendWhenReady(channel, cancellation_1.CancellationToken.None, payload);
            }
        }
        getWindows() {
            return $W6b_1.a;
        }
        getWindowCount() {
            return $W6b_1.a.length;
        }
        getWindowById(windowId) {
            const windows = this.getWindows().filter(window => window.id === windowId);
            return (0, arrays_1.$Mb)(windows);
        }
        getWindowByWebContents(webContents) {
            const browserWindow = electron_1.BrowserWindow.fromWebContents(webContents);
            if (!browserWindow) {
                return undefined;
            }
            return this.getWindowById(browserWindow.id);
        }
    };
    exports.$W6b = $W6b;
    exports.$W6b = $W6b = $W6b_1 = __decorate([
        __param(2, log_1.$5i),
        __param(3, loggerService_1.$u6b),
        __param(4, state_1.$eN),
        __param(5, policy_1.$0m),
        __param(6, environmentMainService_1.$n5b),
        __param(7, userDataProfile_1.$v5b),
        __param(8, lifecycleMainService_1.$p5b),
        __param(9, backup_1.$G5b),
        __param(10, configuration_1.$8h),
        __param(11, workspacesHistoryMainService_1.$p6b),
        __param(12, workspacesManagementMainService_1.$S5b),
        __param(13, instantiation_1.$Ah),
        __param(14, dialogMainService_1.$N5b),
        __param(15, files_1.$6j),
        __param(16, protocol_1.$e6b),
        __param(17, themeMainService_1.$$5b)
    ], $W6b);
});
//# sourceMappingURL=windowsMainService.js.map