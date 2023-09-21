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
define(["require", "exports", "electron", "vs/base/node/pfs", "vs/base/node/unc", "os", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/functional", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/backup/electron-main/backup", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/protocol/electron-main/protocol", "vs/platform/remote/common/remoteHosts", "vs/platform/state/node/state", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windowImpl", "vs/platform/windows/electron-main/windowsFinder", "vs/platform/windows/electron-main/windowsStateHandler", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/node/workspaces", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/theme/electron-main/themeMainService", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/log/electron-main/loggerService"], function (require, exports, electron_1, pfs_1, unc_1, os_1, arrays_1, cancellation_1, event_1, extpath_1, functional_1, labels_1, lifecycle_1, network_1, path_1, performance_1, platform_1, process_1, resources_1, types_1, uri_1, nls_1, backup_1, configuration_1, dialogMainService_1, environmentMainService_1, files_1, instantiation_1, lifecycleMainService_1, log_1, product_1, protocol_1, remoteHosts_1, state_1, window_1, windowImpl_1, windowsFinder_1, windowsStateHandler_1, workspace_1, workspaces_1, workspacesHistoryMainService_1, workspacesManagementMainService_1, themeMainService_1, policy_1, userDataProfile_1, loggerService_1) {
    "use strict";
    var WindowsMainService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowsMainService = void 0;
    function isWorkspacePathToOpen(path) {
        return (0, workspace_1.isWorkspaceIdentifier)(path?.workspace);
    }
    function isSingleFolderWorkspacePathToOpen(path) {
        return (0, workspace_1.isSingleFolderWorkspaceIdentifier)(path?.workspace);
    }
    //#endregion
    let WindowsMainService = class WindowsMainService extends lifecycle_1.Disposable {
        static { WindowsMainService_1 = this; }
        static { this.WINDOWS = []; }
        constructor(machineId, initialUserEnv, logService, loggerService, stateService, policyService, environmentMainService, userDataProfilesMainService, lifecycleMainService, backupMainService, configurationService, workspacesHistoryMainService, workspacesManagementMainService, instantiationService, dialogMainService, fileService, protocolMainService, themeMainService) {
            super();
            this.machineId = machineId;
            this.initialUserEnv = initialUserEnv;
            this.logService = logService;
            this.loggerService = loggerService;
            this.stateService = stateService;
            this.policyService = policyService;
            this.environmentMainService = environmentMainService;
            this.userDataProfilesMainService = userDataProfilesMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.backupMainService = backupMainService;
            this.configurationService = configurationService;
            this.workspacesHistoryMainService = workspacesHistoryMainService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.instantiationService = instantiationService;
            this.dialogMainService = dialogMainService;
            this.fileService = fileService;
            this.protocolMainService = protocolMainService;
            this.themeMainService = themeMainService;
            this._onDidOpenWindow = this._register(new event_1.Emitter());
            this.onDidOpenWindow = this._onDidOpenWindow.event;
            this._onDidSignalReadyWindow = this._register(new event_1.Emitter());
            this.onDidSignalReadyWindow = this._onDidSignalReadyWindow.event;
            this._onDidDestroyWindow = this._register(new event_1.Emitter());
            this.onDidDestroyWindow = this._onDidDestroyWindow.event;
            this._onDidChangeWindowsCount = this._register(new event_1.Emitter());
            this.onDidChangeWindowsCount = this._onDidChangeWindowsCount.event;
            this._onDidTriggerSystemContextMenu = this._register(new event_1.Emitter());
            this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
            this.windowsStateHandler = this._register(new windowsStateHandler_1.WindowsStateHandler(this, this.stateService, this.lifecycleMainService, this.logService, this.configurationService));
            this.registerListeners();
        }
        registerListeners() {
            // Signal a window is ready after having entered a workspace
            this._register(this.workspacesManagementMainService.onDidEnterWorkspace(event => this._onDidSignalReadyWindow.fire(event.window)));
            // Update valid roots in protocol service for extension dev windows
            this._register(this.onDidSignalReadyWindow(window => {
                if (window.config?.extensionDevelopmentPath || window.config?.extensionTestsPath) {
                    const disposables = new lifecycle_1.DisposableStore();
                    disposables.add(event_1.Event.any(window.onDidClose, window.onDidDestroy)(() => disposables.dispose()));
                    // Allow access to extension development path
                    if (window.config.extensionDevelopmentPath) {
                        for (const extensionDevelopmentPath of window.config.extensionDevelopmentPath) {
                            disposables.add(this.protocolMainService.addValidFileRoot(extensionDevelopmentPath));
                        }
                    }
                    // Allow access to extension tests path
                    if (window.config.extensionTestsPath) {
                        disposables.add(this.protocolMainService.addValidFileRoot(window.config.extensionTestsPath));
                    }
                }
            }));
        }
        openEmptyWindow(openConfig, options) {
            const cli = this.environmentMainService.args;
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
            this.handleWaitMarkerFile(openConfig, [window]);
        }
        async open(openConfig) {
            this.logService.trace('windowsManager#open');
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
            const pathsToOpen = await this.getPathsToOpen(openConfig);
            this.logService.trace('windowsManager#open pathsToOpen', pathsToOpen);
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
                    emptyWindowsWithBackupsToRestore.push({ backupFolder: (0, path_1.basename)(path.backupPath), remoteAuthority: path.remoteAuthority });
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
                filesToOpen.filesToWait = { paths: (0, arrays_1.coalesce)([...filesToOpen.filesToDiff, filesToOpen.filesToMerge[3] /* [3] is the resulting merge file */, ...filesToOpen.filesToOpenOrCreate]), waitMarkerFileUri: openConfig.waitMarkerFileURI };
            }
            // These are windows to restore because of hot-exit or from previous session (only performed once on startup!)
            if (openConfig.initialStartup) {
                // Untitled workspaces are always restored
                untitledWorkspacesToRestore.push(...this.workspacesManagementMainService.getUntitledWorkspaces());
                workspacesToOpen.push(...untitledWorkspacesToRestore);
                // Empty windows with backups are always restored
                emptyWindowsWithBackupsToRestore.push(...this.backupMainService.getEmptyWindowBackups());
            }
            else {
                emptyWindowsWithBackupsToRestore.length = 0;
            }
            // Open based on config
            const { windows: usedWindows, filesOpenedInWindow } = await this.doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyWindowsWithBackupsToRestore, emptyToOpen, filesToOpen, foldersToAdd);
            this.logService.trace(`windowsManager#open used window count ${usedWindows.length} (workspacesToOpen: ${workspacesToOpen.length}, foldersToOpen: ${foldersToOpen.length}, emptyToRestore: ${emptyWindowsWithBackupsToRestore.length}, emptyToOpen: ${emptyToOpen})`);
            // Make sure to pass focus to the most relevant of the windows if we open multiple
            if (usedWindows.length > 1) {
                // 1.) focus window we opened files in always with highest priority
                if (filesOpenedInWindow) {
                    filesOpenedInWindow.focus();
                }
                // Otherwise, find a good window based on open params
                else {
                    const focusLastActive = this.windowsStateHandler.state.lastActiveWindow && !openConfig.forceEmpty && !openConfig.cli._.length && !openConfig.cli['file-uri'] && !openConfig.cli['folder-uri'] && !(openConfig.urisToOpen && openConfig.urisToOpen.length);
                    let focusLastOpened = true;
                    let focusLastWindow = true;
                    // 2.) focus last active window if we are not instructed to open any paths
                    if (focusLastActive) {
                        const lastActiveWindow = usedWindows.filter(window => this.windowsStateHandler.state.lastActiveWindow && window.backupPath === this.windowsStateHandler.state.lastActiveWindow.backupPath);
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
                                (usedWindow.backupPath && emptyWindowsWithBackupsToRestore.some(empty => usedWindow.backupPath && empty.backupFolder === (0, path_1.basename)(usedWindow.backupPath))) // skip over restored empty window
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
                this.workspacesHistoryMainService.addRecentlyOpened(recents);
            }
            // Handle --wait
            this.handleWaitMarkerFile(openConfig, usedWindows);
            return usedWindows;
        }
        handleWaitMarkerFile(openConfig, usedWindows) {
            // If we got started with --wait from the CLI, we need to signal to the outside when the window
            // used for the edit operation is closed or loaded to a different folder so that the waiting
            // process can continue. We do this by deleting the waitMarkerFilePath.
            const waitMarkerFileURI = openConfig.waitMarkerFileURI;
            if (openConfig.context === 0 /* OpenContext.CLI */ && waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
                (async () => {
                    await usedWindows[0].whenClosedOrLoaded;
                    try {
                        await this.fileService.del(waitMarkerFileURI);
                    }
                    catch (error) {
                        // ignore - could have been deleted from the window already
                    }
                })();
            }
        }
        async doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyToRestore, emptyToOpen, filesToOpen, foldersToAdd) {
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
            let { openFolderInNewWindow, openFilesInNewWindow } = this.shouldOpenNewWindow(openConfig);
            // Handle folders to add by looking for the last active workspace (not on initial startup)
            if (!openConfig.initialStartup && foldersToAdd.length > 0) {
                const authority = foldersToAdd[0].remoteAuthority;
                const lastActiveWindow = this.getLastActiveWindowForAuthority(authority);
                if (lastActiveWindow) {
                    addUsedWindow(this.doAddFoldersToExistingWindow(lastActiveWindow, foldersToAdd.map(folderToAdd => folderToAdd.workspace.uri)));
                }
            }
            // Handle files to open/diff/merge or to create when we dont open a folder and we do not restore any
            // folder/untitled from hot-exit by trying to open them in the window that fits best
            const potentialNewWindowsCount = foldersToOpen.length + workspacesToOpen.length + emptyToRestore.length;
            if (filesToOpen && potentialNewWindowsCount === 0) {
                // Find suitable window or folder path to open files in
                const fileToCheck = filesToOpen.filesToOpenOrCreate[0] || filesToOpen.filesToDiff[0] || filesToOpen.filesToMerge[3] /* [3] is the resulting merge file */;
                // only look at the windows with correct authority
                const windows = this.getWindows().filter(window => filesToOpen && (0, resources_1.isEqualAuthority)(window.remoteAuthority, filesToOpen.remoteAuthority));
                // figure out a good window to open the files in if any
                // with a fallback to the last active window.
                //
                // in case `openFilesInNewWindow` is enforced, we skip
                // this step.
                let windowToUseForFiles = undefined;
                if (fileToCheck?.fileUri && !openFilesInNewWindow) {
                    if (openConfig.context === 4 /* OpenContext.DESKTOP */ || openConfig.context === 0 /* OpenContext.CLI */ || openConfig.context === 1 /* OpenContext.DOCK */) {
                        windowToUseForFiles = await (0, windowsFinder_1.findWindowOnFile)(windows, fileToCheck.fileUri, async (workspace) => workspace.configPath.scheme === network_1.Schemas.file ? this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath) : undefined);
                    }
                    if (!windowToUseForFiles) {
                        windowToUseForFiles = this.doGetLastActiveWindow(windows);
                    }
                }
                // We found a window to open the files in
                if (windowToUseForFiles) {
                    // Window is workspace
                    if ((0, workspace_1.isWorkspaceIdentifier)(windowToUseForFiles.openedWorkspace)) {
                        workspacesToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                    }
                    // Window is single folder
                    else if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(windowToUseForFiles.openedWorkspace)) {
                        foldersToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                    }
                    // Window is empty
                    else {
                        addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowToUseForFiles, filesToOpen), true);
                    }
                }
                // Finally, if no window or folder is found, just open the files in an empty window
                else {
                    addUsedWindow(await this.openInBrowserWindow({
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
            const allWorkspacesToOpen = (0, arrays_1.distinct)(workspacesToOpen, workspace => workspace.workspace.id); // prevent duplicates
            if (allWorkspacesToOpen.length > 0) {
                // Check for existing instances
                const windowsOnWorkspace = (0, arrays_1.coalesce)(allWorkspacesToOpen.map(workspaceToOpen => (0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(this.getWindows(), workspaceToOpen.workspace.configPath)));
                if (windowsOnWorkspace.length > 0) {
                    const windowOnWorkspace = windowsOnWorkspace[0];
                    const filesToOpenInWindow = (0, resources_1.isEqualAuthority)(filesToOpen?.remoteAuthority, windowOnWorkspace.remoteAuthority) ? filesToOpen : undefined;
                    // Do open files
                    addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnWorkspace, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
                // Open remaining ones
                for (const workspaceToOpen of allWorkspacesToOpen) {
                    if (windowsOnWorkspace.some(window => window.openedWorkspace && window.openedWorkspace.id === workspaceToOpen.workspace.id)) {
                        continue; // ignore folders that are already open
                    }
                    const remoteAuthority = workspaceToOpen.remoteAuthority;
                    const filesToOpenInWindow = (0, resources_1.isEqualAuthority)(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                    // Do open folder
                    addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, workspaceToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
            }
            // Handle folders to open (instructed and to restore)
            const allFoldersToOpen = (0, arrays_1.distinct)(foldersToOpen, folder => resources_1.extUriBiasedIgnorePathCase.getComparisonKey(folder.workspace.uri)); // prevent duplicates
            if (allFoldersToOpen.length > 0) {
                // Check for existing instances
                const windowsOnFolderPath = (0, arrays_1.coalesce)(allFoldersToOpen.map(folderToOpen => (0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(this.getWindows(), folderToOpen.workspace.uri)));
                if (windowsOnFolderPath.length > 0) {
                    const windowOnFolderPath = windowsOnFolderPath[0];
                    const filesToOpenInWindow = (0, resources_1.isEqualAuthority)(filesToOpen?.remoteAuthority, windowOnFolderPath.remoteAuthority) ? filesToOpen : undefined;
                    // Do open files
                    addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnFolderPath, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
                // Open remaining ones
                for (const folderToOpen of allFoldersToOpen) {
                    if (windowsOnFolderPath.some(window => (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderToOpen.workspace.uri))) {
                        continue; // ignore folders that are already open
                    }
                    const remoteAuthority = folderToOpen.remoteAuthority;
                    const filesToOpenInWindow = (0, resources_1.isEqualAuthority)(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                    // Do open folder
                    addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, folderToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                    openFolderInNewWindow = true; // any other folders to open must open in new window then
                }
            }
            // Handle empty to restore
            const allEmptyToRestore = (0, arrays_1.distinct)(emptyToRestore, info => info.backupFolder); // prevent duplicates
            if (allEmptyToRestore.length > 0) {
                for (const emptyWindowBackupInfo of allEmptyToRestore) {
                    const remoteAuthority = emptyWindowBackupInfo.remoteAuthority;
                    const filesToOpenInWindow = (0, resources_1.isEqualAuthority)(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                    addUsedWindow(await this.doOpenEmpty(openConfig, true, remoteAuthority, filesToOpenInWindow, emptyWindowBackupInfo), !!filesToOpenInWindow);
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
                    addUsedWindow(await this.doOpenEmpty(openConfig, openFolderInNewWindow, remoteAuthority, filesToOpen), !!filesToOpen);
                    // any other window to open must open in new window then
                    openFolderInNewWindow = true;
                }
            }
            return { windows: (0, arrays_1.distinct)(usedWindows), filesOpenedInWindow };
        }
        doOpenFilesInExistingWindow(configuration, window, filesToOpen) {
            this.logService.trace('windowsManager#doOpenFilesInExistingWindow', { filesToOpen });
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
        doAddFoldersToExistingWindow(window, foldersToAdd) {
            this.logService.trace('windowsManager#doAddFoldersToExistingWindow', { foldersToAdd });
            window.focus(); // make sure window has focus
            const request = { foldersToAdd };
            window.sendWhenReady('vscode:addFolders', cancellation_1.CancellationToken.None, request);
            return window;
        }
        doOpenEmpty(openConfig, forceNewWindow, remoteAuthority, filesToOpen, emptyWindowBackupInfo) {
            this.logService.trace('windowsManager#doOpenEmpty', { restore: !!emptyWindowBackupInfo, remoteAuthority, filesToOpen, forceNewWindow });
            let windowToUse;
            if (!forceNewWindow && typeof openConfig.contextWindowId === 'number') {
                windowToUse = this.getWindowById(openConfig.contextWindowId); // fix for https://github.com/microsoft/vscode/issues/97172
            }
            return this.openInBrowserWindow({
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
        doOpenFolderOrWorkspace(openConfig, folderOrWorkspace, forceNewWindow, filesToOpen, windowToUse) {
            this.logService.trace('windowsManager#doOpenFolderOrWorkspace', { folderOrWorkspace, filesToOpen });
            if (!forceNewWindow && !windowToUse && typeof openConfig.contextWindowId === 'number') {
                windowToUse = this.getWindowById(openConfig.contextWindowId); // fix for https://github.com/microsoft/vscode/issues/49587
            }
            return this.openInBrowserWindow({
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
        async getPathsToOpen(openConfig) {
            let pathsToOpen;
            let isCommandLineOrAPICall = false;
            let restoredWindows = false;
            // Extract paths: from API
            if (openConfig.urisToOpen && openConfig.urisToOpen.length > 0) {
                pathsToOpen = await this.doExtractPathsFromAPI(openConfig);
                isCommandLineOrAPICall = true;
            }
            // Check for force empty
            else if (openConfig.forceEmpty) {
                pathsToOpen = [Object.create(null)];
            }
            // Extract paths: from CLI
            else if (openConfig.cli._.length || openConfig.cli['folder-uri'] || openConfig.cli['file-uri']) {
                pathsToOpen = await this.doExtractPathsFromCLI(openConfig.cli);
                if (pathsToOpen.length === 0) {
                    pathsToOpen.push(Object.create(null)); // add an empty window if we did not have windows to open from command line
                }
                isCommandLineOrAPICall = true;
            }
            // Extract paths: from previous session
            else {
                pathsToOpen = await this.doGetPathsFromLastSession();
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
                    if (foldersToOpen.every(folderToOpen => (0, resources_1.isEqualAuthority)(folderToOpen.remoteAuthority, remoteAuthority))) { // only if all folder have the same authority
                        const workspace = await this.workspacesManagementMainService.createUntitledWorkspace(foldersToOpen.map(folder => ({ uri: folder.workspace.uri })));
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
            if (openConfig.initialStartup && !restoredWindows && this.configurationService.getValue('window')?.restoreWindows === 'preserve') {
                const lastSessionPaths = await this.doGetPathsFromLastSession();
                pathsToOpen.unshift(...lastSessionPaths.filter(path => isWorkspacePathToOpen(path) || isSingleFolderWorkspacePathToOpen(path) || path.backupPath));
            }
            return pathsToOpen;
        }
        async doExtractPathsFromAPI(openConfig) {
            const pathResolveOptions = {
                gotoLineMode: openConfig.gotoLineMode,
                remoteAuthority: openConfig.remoteAuthority
            };
            const pathsToOpen = await Promise.all((0, arrays_1.coalesce)(openConfig.urisToOpen || []).map(async (pathToOpen) => {
                const path = await this.resolveOpenable(pathToOpen, pathResolveOptions);
                // Path exists
                if (path) {
                    path.label = pathToOpen.label;
                    return path;
                }
                // Path does not exist: show a warning box
                const uri = this.resourceFromOpenable(pathToOpen);
                this.dialogMainService.showMessageBox({
                    type: 'info',
                    buttons: [(0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")],
                    message: uri.scheme === network_1.Schemas.file ? (0, nls_1.localize)('pathNotExistTitle', "Path does not exist") : (0, nls_1.localize)('uriInvalidTitle', "URI can not be opened"),
                    detail: uri.scheme === network_1.Schemas.file ?
                        (0, nls_1.localize)('pathNotExistDetail', "The path '{0}' does not exist on this computer.", (0, labels_1.getPathLabel)(uri, { os: platform_1.OS, tildify: this.environmentMainService })) :
                        (0, nls_1.localize)('uriInvalidDetail', "The URI '{0}' is not valid and can not be opened.", uri.toString(true))
                }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
                return undefined;
            }));
            return (0, arrays_1.coalesce)(pathsToOpen);
        }
        async doExtractPathsFromCLI(cli) {
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
                    const folderUri = this.cliArgToUri(rawFolderUri);
                    if (!folderUri) {
                        return undefined;
                    }
                    return this.resolveOpenable({ folderUri }, pathResolveOptions);
                }));
                pathsToOpen.push(...(0, arrays_1.coalesce)(resolvedFolderUris));
            }
            // file uris
            const fileUris = cli['file-uri'];
            if (fileUris) {
                const resolvedFileUris = await Promise.all(fileUris.map(rawFileUri => {
                    const fileUri = this.cliArgToUri(rawFileUri);
                    if (!fileUri) {
                        return undefined;
                    }
                    return this.resolveOpenable((0, workspace_1.hasWorkspaceFileExtension)(rawFileUri) ? { workspaceUri: fileUri } : { fileUri }, pathResolveOptions);
                }));
                pathsToOpen.push(...(0, arrays_1.coalesce)(resolvedFileUris));
            }
            // folder or file paths
            const resolvedCliPaths = await Promise.all(cli._.map(cliPath => {
                return pathResolveOptions.remoteAuthority ? this.doResolveRemotePath(cliPath, pathResolveOptions) : this.doResolveFilePath(cliPath, pathResolveOptions);
            }));
            pathsToOpen.push(...(0, arrays_1.coalesce)(resolvedCliPaths));
            return pathsToOpen;
        }
        cliArgToUri(arg) {
            try {
                const uri = uri_1.URI.parse(arg);
                if (!uri.scheme) {
                    this.logService.error(`Invalid URI input string, scheme missing: ${arg}`);
                    return undefined;
                }
                if (!uri.path) {
                    return uri.with({ path: '/' });
                }
                return uri;
            }
            catch (e) {
                this.logService.error(`Invalid URI input string: ${arg}, ${e.message}`);
            }
            return undefined;
        }
        async doGetPathsFromLastSession() {
            const restoreWindowsSetting = this.getRestoreWindowsSetting();
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
                        lastSessionWindows.push(...this.windowsStateHandler.state.openedWindows);
                    }
                    if (this.windowsStateHandler.state.lastActiveWindow) {
                        lastSessionWindows.push(this.windowsStateHandler.state.lastActiveWindow);
                    }
                    const pathsToOpen = await Promise.all(lastSessionWindows.map(async (lastSessionWindow) => {
                        // Workspaces
                        if (lastSessionWindow.workspace) {
                            const pathToOpen = await this.resolveOpenable({ workspaceUri: lastSessionWindow.workspace.configPath }, { remoteAuthority: lastSessionWindow.remoteAuthority, rejectTransientWorkspaces: true /* https://github.com/microsoft/vscode/issues/119695 */ });
                            if (isWorkspacePathToOpen(pathToOpen)) {
                                return pathToOpen;
                            }
                        }
                        // Folders
                        else if (lastSessionWindow.folderUri) {
                            const pathToOpen = await this.resolveOpenable({ folderUri: lastSessionWindow.folderUri }, { remoteAuthority: lastSessionWindow.remoteAuthority });
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
                    return (0, arrays_1.coalesce)(pathsToOpen);
                }
            }
        }
        getRestoreWindowsSetting() {
            let restoreWindows;
            if (this.lifecycleMainService.wasRestarted) {
                restoreWindows = 'all'; // always reopen all windows when an update was applied
            }
            else {
                const windowConfig = this.configurationService.getValue('window');
                restoreWindows = windowConfig?.restoreWindows || 'all'; // by default restore all windows
                if (!['preserve', 'all', 'folders', 'one', 'none'].includes(restoreWindows)) {
                    restoreWindows = 'all'; // by default restore all windows
                }
            }
            return restoreWindows;
        }
        async resolveOpenable(openable, options = Object.create(null)) {
            // handle file:// openables with some extra validation
            const uri = this.resourceFromOpenable(openable);
            if (uri.scheme === network_1.Schemas.file) {
                if ((0, window_1.isFileToOpen)(openable)) {
                    options = { ...options, forceOpenWorkspaceAsFile: true };
                }
                return this.doResolveFilePath(uri.fsPath, options);
            }
            // handle non file:// openables
            return this.doResolveRemoteOpenable(openable, options);
        }
        doResolveRemoteOpenable(openable, options) {
            let uri = this.resourceFromOpenable(openable);
            // use remote authority from vscode
            const remoteAuthority = (0, remoteHosts_1.getRemoteAuthority)(uri) || options.remoteAuthority;
            // normalize URI
            uri = (0, resources_1.removeTrailingPathSeparator)((0, resources_1.normalizePath)(uri));
            // File
            if ((0, window_1.isFileToOpen)(openable)) {
                if (options.gotoLineMode) {
                    const { path, line, column } = (0, extpath_1.parseLineAndColumnAware)(uri.path);
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
            else if ((0, window_1.isWorkspaceToOpen)(openable)) {
                return { workspace: (0, workspaces_1.getWorkspaceIdentifier)(uri), remoteAuthority };
            }
            // Folder
            return { workspace: (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(uri), remoteAuthority };
        }
        resourceFromOpenable(openable) {
            if ((0, window_1.isWorkspaceToOpen)(openable)) {
                return openable.workspaceUri;
            }
            if ((0, window_1.isFolderToOpen)(openable)) {
                return openable.folderUri;
            }
            return openable.fileUri;
        }
        async doResolveFilePath(path, options, skipHandleUNCError) {
            // Extract line/col information from path
            let lineNumber;
            let columnNumber;
            if (options.gotoLineMode) {
                ({ path, line: lineNumber, column: columnNumber } = (0, extpath_1.parseLineAndColumnAware)(path));
            }
            // Ensure the path is normalized and absolute
            path = (0, extpath_1.sanitizeFilePath)((0, path_1.normalize)(path), (0, process_1.cwd)());
            try {
                const pathStat = await pfs_1.Promises.stat(path);
                // File
                if (pathStat.isFile()) {
                    // Workspace (unless disabled via flag)
                    if (!options.forceOpenWorkspaceAsFile) {
                        const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(uri_1.URI.file(path));
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
                        workspace: (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(uri_1.URI.file(path), pathStat),
                        type: files_1.FileType.Directory,
                        exists: true
                    };
                }
                // Special device: in POSIX environments, we may get /dev/null passed
                // in (for example git uses it to signal one side of a diff does not
                // exist). In that special case, treat it like a file to support this
                // scenario ()
                else if (!platform_1.isWindows && path === '/dev/null') {
                    return {
                        fileUri: uri_1.URI.file(path),
                        type: files_1.FileType.File,
                        exists: true
                    };
                }
            }
            catch (error) {
                if (error.code === 'ERR_UNC_HOST_NOT_ALLOWED' && !skipHandleUNCError) {
                    return this.onUNCHostNotAllowed(path, options);
                }
                const fileUri = uri_1.URI.file(path);
                // since file does not seem to exist anymore, remove from recent
                this.workspacesHistoryMainService.removeRecentlyOpened([fileUri]);
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
        async onUNCHostNotAllowed(path, options) {
            const uri = uri_1.URI.file(path);
            const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                type: 'warning',
                buttons: [
                    (0, nls_1.localize)({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow"),
                    (0, nls_1.localize)({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel"),
                    (0, nls_1.localize)({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                ],
                message: (0, nls_1.localize)('confirmOpenMessage', "The host '{0}' was not found in the list of allowed hosts. Do you want to allow it anyway?", uri.authority),
                detail: (0, nls_1.localize)('confirmOpenDetail', "The path '{0}' uses a host that is not allowed. Unless you trust the host, you should press 'Cancel'", (0, labels_1.getPathLabel)(uri, { os: platform_1.OS, tildify: this.environmentMainService })),
                checkboxLabel: (0, nls_1.localize)('doNotAskAgain', "Permanently allow host '{0}'", uri.authority),
                cancelId: 1
            });
            if (response === 0) {
                (0, unc_1.addUNCHostToAllowlist)(uri.authority);
                if (checkboxChecked) {
                    this._register(event_1.Event.once(this.onDidOpenWindow)(window => {
                        window.sendWhenReady('vscode:configureAllowedUNCHost', cancellation_1.CancellationToken.None, uri.authority);
                    }));
                }
                return this.doResolveFilePath(path, options, true /* do not handle UNC error again */);
            }
            if (response === 2) {
                electron_1.shell.openExternal('https://aka.ms/vscode-windows-unc');
                return this.onUNCHostNotAllowed(path, options); // keep showing the dialog until decision (https://github.com/microsoft/vscode/issues/181956)
            }
            return undefined;
        }
        doResolveRemotePath(path, options) {
            const first = path.charCodeAt(0);
            const remoteAuthority = options.remoteAuthority;
            // Extract line/col information from path
            let lineNumber;
            let columnNumber;
            if (options.gotoLineMode) {
                ({ path, line: lineNumber, column: columnNumber } = (0, extpath_1.parseLineAndColumnAware)(path));
            }
            // make absolute
            if (first !== 47 /* CharCode.Slash */) {
                if ((0, extpath_1.isWindowsDriveLetter)(first) && path.charCodeAt(path.charCodeAt(1)) === 58 /* CharCode.Colon */) {
                    path = (0, extpath_1.toSlashes)(path);
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
                if ((0, workspace_1.hasWorkspaceFileExtension)(path)) {
                    if (options.forceOpenWorkspaceAsFile) {
                        return {
                            fileUri: uri,
                            options: {
                                selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                            },
                            remoteAuthority: options.remoteAuthority
                        };
                    }
                    return { workspace: (0, workspaces_1.getWorkspaceIdentifier)(uri), remoteAuthority };
                }
                // file name starts with a dot or has an file extension
                else if (options.gotoLineMode || path_1.posix.basename(path).indexOf('.') !== -1) {
                    return {
                        fileUri: uri,
                        options: {
                            selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                        },
                        remoteAuthority
                    };
                }
            }
            return { workspace: (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(uri), remoteAuthority };
        }
        shouldOpenNewWindow(openConfig) {
            // let the user settings override how folders are open in a new window or same window unless we are forced
            const windowConfig = this.configurationService.getValue('window');
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
                if (platform_1.isMacintosh) {
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
            const existingWindow = (0, windowsFinder_1.findWindowOnExtensionDevelopmentPath)(this.getWindows(), extensionDevelopmentPaths);
            if (existingWindow) {
                this.lifecycleMainService.reload(existingWindow, openConfig.cli);
                existingWindow.focus(); // make sure it gets focus and is restored
                return [existingWindow];
            }
            let folderUris = openConfig.cli['folder-uri'] || [];
            let fileUris = openConfig.cli['file-uri'] || [];
            let cliArgs = openConfig.cli._;
            // Fill in previously opened workspace unless an explicit path is provided and we are not unit testing
            if (!cliArgs.length && !folderUris.length && !fileUris.length && !openConfig.cli.extensionTestsPath) {
                const extensionDevelopmentWindowState = this.windowsStateHandler.state.lastPluginDevelopmentHostWindow;
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
                            cliArgs = [(0, resources_1.originalFSPath)(workspaceToOpen.configPath)];
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
                    const extensionDevelopmentPathRemoteAuthority = (0, remoteHosts_1.getRemoteAuthority)(url);
                    if (extensionDevelopmentPathRemoteAuthority) {
                        if (remoteAuthority) {
                            if (!(0, resources_1.isEqualAuthority)(extensionDevelopmentPathRemoteAuthority, remoteAuthority)) {
                                this.logService.error('more than one extension development path authority');
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
                if (!!(0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(this.getWindows(), uri)) {
                    return false;
                }
                return (0, resources_1.isEqualAuthority)((0, remoteHosts_1.getRemoteAuthority)(uri), remoteAuthority);
            });
            folderUris = folderUris.filter(folderUriStr => {
                const folderUri = this.cliArgToUri(folderUriStr);
                if (folderUri && !!(0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(this.getWindows(), folderUri)) {
                    return false;
                }
                return folderUri ? (0, resources_1.isEqualAuthority)((0, remoteHosts_1.getRemoteAuthority)(folderUri), remoteAuthority) : false;
            });
            fileUris = fileUris.filter(fileUriStr => {
                const fileUri = this.cliArgToUri(fileUriStr);
                if (fileUri && !!(0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(this.getWindows(), fileUri)) {
                    return false;
                }
                return fileUri ? (0, resources_1.isEqualAuthority)((0, remoteHosts_1.getRemoteAuthority)(fileUri), remoteAuthority) : false;
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
        async openInBrowserWindow(options) {
            const windowConfig = this.configurationService.getValue('window');
            const lastActiveWindow = this.getLastActiveWindow();
            const defaultProfile = lastActiveWindow?.profile ?? this.userDataProfilesMainService.defaultProfile;
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
                ...this.environmentMainService.args,
                ...options.cli,
                machineId: this.machineId,
                windowId: -1,
                mainPid: process.pid,
                appRoot: this.environmentMainService.appRoot,
                execPath: process.execPath,
                codeCachePath: this.environmentMainService.codeCachePath,
                // If we know the backup folder upfront (for empty windows to restore), we can set it
                // directly here which helps for restoring UI state associated with that window.
                // For all other cases we first call into registerEmptyWindowBackup() to set it before
                // loading the window.
                backupPath: options.emptyWindowBackupInfo ? (0, path_1.join)(this.environmentMainService.backupHome, options.emptyWindowBackupInfo.backupFolder) : undefined,
                profiles: {
                    home: this.userDataProfilesMainService.profilesHome,
                    all: this.userDataProfilesMainService.profiles,
                    // Set to default profile first and resolve and update the profile
                    // only after the workspace-backup is registered.
                    // Because, workspace identifier of an empty window is known only then.
                    profile: defaultProfile
                },
                homeDir: this.environmentMainService.userHome.with({ scheme: network_1.Schemas.file }).fsPath,
                tmpDir: this.environmentMainService.tmpDir.with({ scheme: network_1.Schemas.file }).fsPath,
                userDataDir: this.environmentMainService.userDataPath,
                remoteAuthority: options.remoteAuthority,
                workspace: options.workspace,
                userEnv: { ...this.initialUserEnv, ...options.userEnv },
                filesToOpenOrCreate: options.filesToOpen?.filesToOpenOrCreate,
                filesToDiff: options.filesToOpen?.filesToDiff,
                filesToMerge: options.filesToOpen?.filesToMerge,
                filesToWait: options.filesToOpen?.filesToWait,
                logLevel: this.loggerService.getLogLevel(),
                loggers: {
                    window: [],
                    global: this.loggerService.getRegisteredLoggers()
                },
                logsPath: this.environmentMainService.logsHome.with({ scheme: network_1.Schemas.file }).fsPath,
                product: product_1.default,
                isInitialStartup: options.initialStartup,
                perfMarks: (0, performance_1.getMarks)(),
                os: { release: (0, os_1.release)(), hostname: (0, os_1.hostname)(), arch: (0, os_1.arch)() },
                zoomLevel: typeof windowConfig?.zoomLevel === 'number' ? windowConfig.zoomLevel : undefined,
                autoDetectHighContrast: windowConfig?.autoDetectHighContrast ?? true,
                autoDetectColorScheme: windowConfig?.autoDetectColorScheme ?? false,
                accessibilitySupport: electron_1.app.accessibilitySupportEnabled,
                colorScheme: this.themeMainService.getColorScheme(),
                policiesData: this.policyService.serialize(),
                continueOn: this.environmentMainService.continueOn
            };
            // New window
            if (!window) {
                const state = this.windowsStateHandler.getNewWindowState(configuration);
                // Create the window
                (0, performance_1.mark)('code/willCreateCodeWindow');
                const createdWindow = window = this.instantiationService.createInstance(windowImpl_1.CodeWindow, {
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
                WindowsMainService_1.WINDOWS.push(createdWindow);
                // Indicate new window via event
                this._onDidOpenWindow.fire(createdWindow);
                // Indicate number change via event
                this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() - 1, newCount: this.getWindowCount() });
                // Window Events
                (0, functional_1.once)(createdWindow.onDidSignalReady)(() => this._onDidSignalReadyWindow.fire(createdWindow));
                (0, functional_1.once)(createdWindow.onDidClose)(() => this.onWindowClosed(createdWindow));
                (0, functional_1.once)(createdWindow.onDidDestroy)(() => this._onDidDestroyWindow.fire(createdWindow));
                createdWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: createdWindow, x, y }));
                const webContents = (0, types_1.assertIsDefined)(createdWindow.win?.webContents);
                webContents.removeAllListeners('devtools-reload-page'); // remove built in listener so we can handle this on our own
                webContents.on('devtools-reload-page', () => this.lifecycleMainService.reload(createdWindow));
                // Lifecycle
                this.lifecycleMainService.registerWindow(createdWindow);
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
                this.lifecycleMainService.unload(window, 4 /* UnloadReason.LOAD */).then(async (veto) => {
                    if (!veto) {
                        await this.doOpenInBrowserWindow(window, configuration, options, defaultProfile);
                    }
                });
            }
            else {
                await this.doOpenInBrowserWindow(window, configuration, options, defaultProfile);
            }
            return window;
        }
        async doOpenInBrowserWindow(window, configuration, options, defaultProfile) {
            // Register window for backups unless the window
            // is for extension development, where we do not
            // keep any backups.
            if (!configuration.extensionDevelopmentPath) {
                if ((0, workspace_1.isWorkspaceIdentifier)(configuration.workspace)) {
                    configuration.backupPath = this.backupMainService.registerWorkspaceBackup({
                        workspace: configuration.workspace,
                        remoteAuthority: configuration.remoteAuthority
                    });
                }
                else if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(configuration.workspace)) {
                    configuration.backupPath = this.backupMainService.registerFolderBackup({
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
                    configuration.backupPath = this.backupMainService.registerEmptyWindowBackup({
                        backupFolder: options.emptyWindowBackupInfo?.backupFolder ?? (0, workspaces_1.createEmptyWorkspaceIdentifier)().id,
                        remoteAuthority: configuration.remoteAuthority
                    });
                }
            }
            if (this.userDataProfilesMainService.isEnabled()) {
                const workspace = configuration.workspace ?? (0, workspace_1.toWorkspaceIdentifier)(configuration.backupPath, false);
                const profilePromise = this.resolveProfileForBrowserWindow(options, workspace, defaultProfile);
                const profile = profilePromise instanceof Promise ? await profilePromise : profilePromise;
                configuration.profiles.profile = profile;
                if (!configuration.extensionDevelopmentPath) {
                    // Associate the configured profile to the workspace
                    // unless the window is for extension development,
                    // where we do not persist the associations
                    await this.userDataProfilesMainService.setProfileForWorkspace(workspace, profile);
                }
            }
            // Load it
            window.load(configuration);
        }
        resolveProfileForBrowserWindow(options, workspace, defaultProfile) {
            if (options.forceProfile) {
                return this.userDataProfilesMainService.profiles.find(p => p.name === options.forceProfile) ?? this.userDataProfilesMainService.createNamedProfile(options.forceProfile);
            }
            if (options.forceTempProfile) {
                return this.userDataProfilesMainService.createTransientProfile();
            }
            return this.userDataProfilesMainService.getProfileForWorkspace(workspace) ?? defaultProfile;
        }
        onWindowClosed(window) {
            // Remove from our list so that Electron can clean it up
            const index = WindowsMainService_1.WINDOWS.indexOf(window);
            WindowsMainService_1.WINDOWS.splice(index, 1);
            // Emit
            this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() + 1, newCount: this.getWindowCount() });
        }
        getFocusedWindow() {
            const window = electron_1.BrowserWindow.getFocusedWindow();
            if (window) {
                return this.getWindowById(window.id);
            }
            return undefined;
        }
        getLastActiveWindow() {
            return this.doGetLastActiveWindow(this.getWindows());
        }
        getLastActiveWindowForAuthority(remoteAuthority) {
            return this.doGetLastActiveWindow(this.getWindows().filter(window => (0, resources_1.isEqualAuthority)(window.remoteAuthority, remoteAuthority)));
        }
        doGetLastActiveWindow(windows) {
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
            return WindowsMainService_1.WINDOWS;
        }
        getWindowCount() {
            return WindowsMainService_1.WINDOWS.length;
        }
        getWindowById(windowId) {
            const windows = this.getWindows().filter(window => window.id === windowId);
            return (0, arrays_1.firstOrDefault)(windows);
        }
        getWindowByWebContents(webContents) {
            const browserWindow = electron_1.BrowserWindow.fromWebContents(webContents);
            if (!browserWindow) {
                return undefined;
            }
            return this.getWindowById(browserWindow.id);
        }
    };
    exports.WindowsMainService = WindowsMainService;
    exports.WindowsMainService = WindowsMainService = WindowsMainService_1 = __decorate([
        __param(2, log_1.ILogService),
        __param(3, loggerService_1.ILoggerMainService),
        __param(4, state_1.IStateService),
        __param(5, policy_1.IPolicyService),
        __param(6, environmentMainService_1.IEnvironmentMainService),
        __param(7, userDataProfile_1.IUserDataProfilesMainService),
        __param(8, lifecycleMainService_1.ILifecycleMainService),
        __param(9, backup_1.IBackupMainService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, workspacesHistoryMainService_1.IWorkspacesHistoryMainService),
        __param(12, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(13, instantiation_1.IInstantiationService),
        __param(14, dialogMainService_1.IDialogMainService),
        __param(15, files_1.IFileService),
        __param(16, protocol_1.IProtocolMainService),
        __param(17, themeMainService_1.IThemeMainService)
    ], WindowsMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c01haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy9lbGVjdHJvbi1tYWluL3dpbmRvd3NNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0toRyxTQUFTLHFCQUFxQixDQUFDLElBQTZCO1FBQzNELE9BQU8sSUFBQSxpQ0FBcUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELFNBQVMsaUNBQWlDLENBQUMsSUFBNkI7UUFDdkUsT0FBTyxJQUFBLDZDQUFpQyxFQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsWUFBWTtJQUVMLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7O2lCQUl6QixZQUFPLEdBQWtCLEVBQUUsQUFBcEIsQ0FBcUI7UUFtQnBELFlBQ2tCLFNBQWlCLEVBQ2pCLGNBQW1DLEVBQ3ZDLFVBQXdDLEVBQ2pDLGFBQWtELEVBQ3ZELFlBQTRDLEVBQzNDLGFBQThDLEVBQ3JDLHNCQUFnRSxFQUMzRCwyQkFBMEUsRUFDakYsb0JBQTRELEVBQy9ELGlCQUFzRCxFQUNuRCxvQkFBNEQsRUFDcEQsNEJBQTRFLEVBQ3pFLCtCQUFrRixFQUM3RixvQkFBNEQsRUFDL0QsaUJBQXNELEVBQzVELFdBQTBDLEVBQ2xDLG1CQUEwRCxFQUM3RCxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFuQlMsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNqQixtQkFBYyxHQUFkLGNBQWMsQ0FBcUI7WUFDdEIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNoQixrQkFBYSxHQUFiLGFBQWEsQ0FBb0I7WUFDdEMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDMUIsa0JBQWEsR0FBYixhQUFh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