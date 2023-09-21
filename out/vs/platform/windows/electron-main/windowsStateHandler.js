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
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/state/node/state", "vs/platform/windows/electron-main/windows", "vs/platform/window/electron-main/window", "vs/platform/workspace/common/workspace"], function (require, exports, electron_1, lifecycle_1, platform_1, resources_1, uri_1, configuration_1, lifecycleMainService_1, log_1, state_1, windows_1, window_1, workspace_1) {
    "use strict";
    var WindowsStateHandler_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWindowsStateStoreData = exports.restoreWindowsState = exports.WindowsStateHandler = void 0;
    let WindowsStateHandler = class WindowsStateHandler extends lifecycle_1.Disposable {
        static { WindowsStateHandler_1 = this; }
        static { this.windowsStateStorageKey = 'windowsState'; }
        get state() { return this._state; }
        constructor(windowsMainService, stateService, lifecycleMainService, logService, configurationService) {
            super();
            this.windowsMainService = windowsMainService;
            this.stateService = stateService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.configurationService = configurationService;
            this._state = restoreWindowsState(this.stateService.getItem(WindowsStateHandler_1.windowsStateStorageKey));
            this.lastClosedState = undefined;
            this.shuttingDown = false;
            this.registerListeners();
        }
        registerListeners() {
            // When a window looses focus, save all windows state. This allows to
            // prevent loss of window-state data when OS is restarted without properly
            // shutting down the application (https://github.com/microsoft/vscode/issues/87171)
            electron_1.app.on('browser-window-blur', () => {
                if (!this.shuttingDown) {
                    this.saveWindowsState();
                }
            });
            // Handle various lifecycle events around windows
            this.lifecycleMainService.onBeforeCloseWindow(window => this.onBeforeCloseWindow(window));
            this.lifecycleMainService.onBeforeShutdown(() => this.onBeforeShutdown());
            this.windowsMainService.onDidChangeWindowsCount(e => {
                if (e.newCount - e.oldCount > 0) {
                    // clear last closed window state when a new window opens. this helps on macOS where
                    // otherwise closing the last window, opening a new window and then quitting would
                    // use the state of the previously closed window when restarting.
                    this.lastClosedState = undefined;
                }
            });
            // try to save state before destroy because close will not fire
            this.windowsMainService.onDidDestroyWindow(window => this.onBeforeCloseWindow(window));
        }
        // Note that onBeforeShutdown() and onBeforeCloseWindow() are fired in different order depending on the OS:
        // - macOS: since the app will not quit when closing the last window, you will always first get
        //          the onBeforeShutdown() event followed by N onBeforeCloseWindow() events for each window
        // - other: on other OS, closing the last window will quit the app so the order depends on the
        //          user interaction: closing the last window will first trigger onBeforeCloseWindow()
        //          and then onBeforeShutdown(). Using the quit action however will first issue onBeforeShutdown()
        //          and then onBeforeCloseWindow().
        //
        // Here is the behavior on different OS depending on action taken (Electron 1.7.x):
        //
        // Legend
        // -  quit(N): quit application with N windows opened
        // - close(1): close one window via the window close button
        // - closeAll: close all windows via the taskbar command
        // - onBeforeShutdown(N): number of windows reported in this event handler
        // - onBeforeCloseWindow(N, M): number of windows reported and quitRequested boolean in this event handler
        //
        // macOS
        // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
        // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
        // 	-     quit(0): onBeforeShutdown(0)
        // 	-    close(1): onBeforeCloseWindow(1, false)
        //
        // Windows
        // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
        // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
        // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
        // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
        // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
        //
        // Linux
        // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
        // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
        // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
        // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
        // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
        //
        onBeforeShutdown() {
            this.shuttingDown = true;
            this.saveWindowsState();
        }
        saveWindowsState() {
            // TODO@electron workaround for Electron not being able to restore
            // multiple (native) fullscreen windows on the same display at once
            // on macOS.
            // https://github.com/electron/electron/issues/34367
            const displaysWithFullScreenWindow = new Set();
            const currentWindowsState = {
                openedWindows: [],
                lastPluginDevelopmentHostWindow: this._state.lastPluginDevelopmentHostWindow,
                lastActiveWindow: this.lastClosedState
            };
            // 1.) Find a last active window (pick any other first window otherwise)
            if (!currentWindowsState.lastActiveWindow) {
                let activeWindow = this.windowsMainService.getLastActiveWindow();
                if (!activeWindow || activeWindow.isExtensionDevelopmentHost) {
                    activeWindow = this.windowsMainService.getWindows().find(window => !window.isExtensionDevelopmentHost);
                }
                if (activeWindow) {
                    currentWindowsState.lastActiveWindow = this.toWindowState(activeWindow);
                    if (currentWindowsState.lastActiveWindow.uiState.mode === 3 /* WindowMode.Fullscreen */) {
                        displaysWithFullScreenWindow.add(currentWindowsState.lastActiveWindow.uiState.display); // always allow fullscreen for active window
                    }
                }
            }
            // 2.) Find extension host window
            const extensionHostWindow = this.windowsMainService.getWindows().find(window => window.isExtensionDevelopmentHost && !window.isExtensionTestHost);
            if (extensionHostWindow) {
                currentWindowsState.lastPluginDevelopmentHostWindow = this.toWindowState(extensionHostWindow);
                if (currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode === 3 /* WindowMode.Fullscreen */) {
                    if (displaysWithFullScreenWindow.has(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display)) {
                        if (platform_1.isMacintosh && !extensionHostWindow.win?.isSimpleFullScreen()) {
                            currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode = 1 /* WindowMode.Normal */;
                        }
                    }
                    else {
                        displaysWithFullScreenWindow.add(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display);
                    }
                }
            }
            // 3.) All windows (except extension host) for N >= 2 to support `restoreWindows: all` or for auto update
            //
            // Careful here: asking a window for its window state after it has been closed returns bogus values (width: 0, height: 0)
            // so if we ever want to persist the UI state of the last closed window (window count === 1), it has
            // to come from the stored lastClosedWindowState on Win/Linux at least
            if (this.windowsMainService.getWindowCount() > 1) {
                currentWindowsState.openedWindows = this.windowsMainService.getWindows().filter(window => !window.isExtensionDevelopmentHost).map(window => {
                    const windowState = this.toWindowState(window);
                    if (windowState.uiState.mode === 3 /* WindowMode.Fullscreen */) {
                        if (displaysWithFullScreenWindow.has(windowState.uiState.display)) {
                            if (platform_1.isMacintosh && windowState.windowId !== currentWindowsState.lastActiveWindow?.windowId && !window.win?.isSimpleFullScreen()) {
                                windowState.uiState.mode = 1 /* WindowMode.Normal */;
                            }
                        }
                        else {
                            displaysWithFullScreenWindow.add(windowState.uiState.display);
                        }
                    }
                    return windowState;
                });
            }
            // Persist
            const state = getWindowsStateStoreData(currentWindowsState);
            this.stateService.setItem(WindowsStateHandler_1.windowsStateStorageKey, state);
            if (this.shuttingDown) {
                this.logService.trace('[WindowsStateHandler] onBeforeShutdown', state);
            }
        }
        // See note on #onBeforeShutdown() for details how these events are flowing
        onBeforeCloseWindow(window) {
            if (this.lifecycleMainService.quitRequested) {
                return; // during quit, many windows close in parallel so let it be handled in the before-quit handler
            }
            // On Window close, update our stored UI state of this window
            const state = this.toWindowState(window);
            if (window.isExtensionDevelopmentHost && !window.isExtensionTestHost) {
                this._state.lastPluginDevelopmentHostWindow = state; // do not let test run window state overwrite our extension development state
            }
            // Any non extension host window with same workspace or folder
            else if (!window.isExtensionDevelopmentHost && window.openedWorkspace) {
                this._state.openedWindows.forEach(openedWindow => {
                    const sameWorkspace = (0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) && openedWindow.workspace?.id === window.openedWorkspace.id;
                    const sameFolder = (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && openedWindow.folderUri && resources_1.extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, window.openedWorkspace.uri);
                    if (sameWorkspace || sameFolder) {
                        openedWindow.uiState = state.uiState;
                    }
                });
            }
            // On Windows and Linux closing the last window will trigger quit. Since we are storing all UI state
            // before quitting, we need to remember the UI state of this window to be able to persist it.
            // On macOS we keep the last closed window state ready in case the user wants to quit right after or
            // wants to open another window, in which case we use this state over the persisted one.
            if (this.windowsMainService.getWindowCount() === 1) {
                this.lastClosedState = state;
            }
        }
        toWindowState(window) {
            return {
                windowId: window.id,
                workspace: (0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) ? window.openedWorkspace : undefined,
                folderUri: (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) ? window.openedWorkspace.uri : undefined,
                backupPath: window.backupPath,
                remoteAuthority: window.remoteAuthority,
                uiState: window.serializeWindowState()
            };
        }
        getNewWindowState(configuration) {
            const state = this.doGetNewWindowState(configuration);
            const windowConfig = this.configurationService.getValue('window');
            // Fullscreen state gets special treatment
            if (state.mode === 3 /* WindowMode.Fullscreen */) {
                // Window state is not from a previous session: only allow fullscreen if we inherit it or user wants fullscreen
                let allowFullscreen;
                if (state.hasDefaultState) {
                    allowFullscreen = !!(windowConfig?.newWindowDimensions && ['fullscreen', 'inherit', 'offset'].indexOf(windowConfig.newWindowDimensions) >= 0);
                }
                // Window state is from a previous session: only allow fullscreen when we got updated or user wants to restore
                else {
                    allowFullscreen = !!(this.lifecycleMainService.wasRestarted || windowConfig?.restoreFullscreen);
                }
                if (!allowFullscreen) {
                    state.mode = 1 /* WindowMode.Normal */;
                }
            }
            return state;
        }
        doGetNewWindowState(configuration) {
            const lastActive = this.windowsMainService.getLastActiveWindow();
            // Restore state unless we are running extension tests
            if (!configuration.extensionTestsPath) {
                // extension development host Window - load from stored settings if any
                if (!!configuration.extensionDevelopmentPath && this.state.lastPluginDevelopmentHostWindow) {
                    return this.state.lastPluginDevelopmentHostWindow.uiState;
                }
                // Known Workspace - load from stored settings
                const workspace = configuration.workspace;
                if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                    const stateForWorkspace = this.state.openedWindows.filter(openedWindow => openedWindow.workspace && openedWindow.workspace.id === workspace.id).map(openedWindow => openedWindow.uiState);
                    if (stateForWorkspace.length) {
                        return stateForWorkspace[0];
                    }
                }
                // Known Folder - load from stored settings
                if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                    const stateForFolder = this.state.openedWindows.filter(openedWindow => openedWindow.folderUri && resources_1.extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, workspace.uri)).map(openedWindow => openedWindow.uiState);
                    if (stateForFolder.length) {
                        return stateForFolder[0];
                    }
                }
                // Empty windows with backups
                else if (configuration.backupPath) {
                    const stateForEmptyWindow = this.state.openedWindows.filter(openedWindow => openedWindow.backupPath === configuration.backupPath).map(openedWindow => openedWindow.uiState);
                    if (stateForEmptyWindow.length) {
                        return stateForEmptyWindow[0];
                    }
                }
                // First Window
                const lastActiveState = this.lastClosedState || this.state.lastActiveWindow;
                if (!lastActive && lastActiveState) {
                    return lastActiveState.uiState;
                }
            }
            //
            // In any other case, we do not have any stored settings for the window state, so we come up with something smart
            //
            // We want the new window to open on the same display that the last active one is in
            let displayToUse;
            const displays = electron_1.screen.getAllDisplays();
            // Single Display
            if (displays.length === 1) {
                displayToUse = displays[0];
            }
            // Multi Display
            else {
                // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
                if (platform_1.isMacintosh) {
                    const cursorPoint = electron_1.screen.getCursorScreenPoint();
                    displayToUse = electron_1.screen.getDisplayNearestPoint(cursorPoint);
                }
                // if we have a last active window, use that display for the new window
                if (!displayToUse && lastActive) {
                    displayToUse = electron_1.screen.getDisplayMatching(lastActive.getBounds());
                }
                // fallback to primary display or first display
                if (!displayToUse) {
                    displayToUse = electron_1.screen.getPrimaryDisplay() || displays[0];
                }
            }
            // Compute x/y based on display bounds
            // Note: important to use Math.round() because Electron does not seem to be too happy about
            // display coordinates that are not absolute numbers.
            let state = (0, window_1.defaultWindowState)();
            state.x = Math.round(displayToUse.bounds.x + (displayToUse.bounds.width / 2) - (state.width / 2));
            state.y = Math.round(displayToUse.bounds.y + (displayToUse.bounds.height / 2) - (state.height / 2));
            // Check for newWindowDimensions setting and adjust accordingly
            const windowConfig = this.configurationService.getValue('window');
            let ensureNoOverlap = true;
            if (windowConfig?.newWindowDimensions) {
                if (windowConfig.newWindowDimensions === 'maximized') {
                    state.mode = 0 /* WindowMode.Maximized */;
                    ensureNoOverlap = false;
                }
                else if (windowConfig.newWindowDimensions === 'fullscreen') {
                    state.mode = 3 /* WindowMode.Fullscreen */;
                    ensureNoOverlap = false;
                }
                else if ((windowConfig.newWindowDimensions === 'inherit' || windowConfig.newWindowDimensions === 'offset') && lastActive) {
                    const lastActiveState = lastActive.serializeWindowState();
                    if (lastActiveState.mode === 3 /* WindowMode.Fullscreen */) {
                        state.mode = 3 /* WindowMode.Fullscreen */; // only take mode (fixes https://github.com/microsoft/vscode/issues/19331)
                    }
                    else {
                        state = lastActiveState;
                    }
                    ensureNoOverlap = state.mode !== 3 /* WindowMode.Fullscreen */ && windowConfig.newWindowDimensions === 'offset';
                }
            }
            if (ensureNoOverlap) {
                state = this.ensureNoOverlap(state);
            }
            state.hasDefaultState = true; // flag as default state
            return state;
        }
        ensureNoOverlap(state) {
            if (this.windowsMainService.getWindows().length === 0) {
                return state;
            }
            state.x = typeof state.x === 'number' ? state.x : 0;
            state.y = typeof state.y === 'number' ? state.y : 0;
            const existingWindowBounds = this.windowsMainService.getWindows().map(window => window.getBounds());
            while (existingWindowBounds.some(bounds => bounds.x === state.x || bounds.y === state.y)) {
                state.x += 30;
                state.y += 30;
            }
            return state;
        }
    };
    exports.WindowsStateHandler = WindowsStateHandler;
    exports.WindowsStateHandler = WindowsStateHandler = WindowsStateHandler_1 = __decorate([
        __param(0, windows_1.IWindowsMainService),
        __param(1, state_1.IStateService),
        __param(2, lifecycleMainService_1.ILifecycleMainService),
        __param(3, log_1.ILogService),
        __param(4, configuration_1.IConfigurationService)
    ], WindowsStateHandler);
    function restoreWindowsState(data) {
        const result = { openedWindows: [] };
        const windowsState = data || { openedWindows: [] };
        if (windowsState.lastActiveWindow) {
            result.lastActiveWindow = restoreWindowState(windowsState.lastActiveWindow);
        }
        if (windowsState.lastPluginDevelopmentHostWindow) {
            result.lastPluginDevelopmentHostWindow = restoreWindowState(windowsState.lastPluginDevelopmentHostWindow);
        }
        if (Array.isArray(windowsState.openedWindows)) {
            result.openedWindows = windowsState.openedWindows.map(windowState => restoreWindowState(windowState));
        }
        return result;
    }
    exports.restoreWindowsState = restoreWindowsState;
    function restoreWindowState(windowState) {
        const result = { uiState: windowState.uiState };
        if (windowState.backupPath) {
            result.backupPath = windowState.backupPath;
        }
        if (windowState.remoteAuthority) {
            result.remoteAuthority = windowState.remoteAuthority;
        }
        if (windowState.folder) {
            result.folderUri = uri_1.URI.parse(windowState.folder);
        }
        if (windowState.workspaceIdentifier) {
            result.workspace = { id: windowState.workspaceIdentifier.id, configPath: uri_1.URI.parse(windowState.workspaceIdentifier.configURIPath) };
        }
        return result;
    }
    function getWindowsStateStoreData(windowsState) {
        return {
            lastActiveWindow: windowsState.lastActiveWindow && serializeWindowState(windowsState.lastActiveWindow),
            lastPluginDevelopmentHostWindow: windowsState.lastPluginDevelopmentHostWindow && serializeWindowState(windowsState.lastPluginDevelopmentHostWindow),
            openedWindows: windowsState.openedWindows.map(ws => serializeWindowState(ws))
        };
    }
    exports.getWindowsStateStoreData = getWindowsStateStoreData;
    function serializeWindowState(windowState) {
        return {
            workspaceIdentifier: windowState.workspace && { id: windowState.workspace.id, configURIPath: windowState.workspace.configPath.toString() },
            folder: windowState.folderUri && windowState.folderUri.toString(),
            backupPath: windowState.backupPath,
            remoteAuthority: windowState.remoteAuthority,
            uiState: windowState.uiState
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c1N0YXRlSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dpbmRvd3MvZWxlY3Ryb24tbWFpbi93aW5kb3dzU3RhdGVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpRHpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7O2lCQUUxQiwyQkFBc0IsR0FBRyxjQUFjLEFBQWpCLENBQWtCO1FBRWhFLElBQUksS0FBSyxLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFPbkMsWUFDc0Isa0JBQXdELEVBQzlELFlBQTRDLEVBQ3BDLG9CQUE0RCxFQUN0RSxVQUF3QyxFQUM5QixvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFOOEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM3QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNuQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDYix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBWG5FLFdBQU0sR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBMEIscUJBQW1CLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBRXRJLG9CQUFlLEdBQTZCLFNBQVMsQ0FBQztZQUV0RCxpQkFBWSxHQUFHLEtBQUssQ0FBQztZQVc1QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLHFFQUFxRTtZQUNyRSwwRUFBMEU7WUFDMUUsbUZBQW1GO1lBQ25GLGNBQUcsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO2dCQUNsQyxJQUFJLENBQUMs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