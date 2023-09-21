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
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/backup/electron-main/backup", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/files/common/files", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/externalServices/common/marketplace", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/telemetry", "vs/base/common/themables", "vs/platform/theme/electron-main/themeMainService", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/window/electron-main/window", "vs/base/common/color", "vs/platform/policy/common/policy", "vs/platform/state/node/state", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/log/electron-main/loggerService", "vs/base/common/arrays"], function (require, exports, electron_1, async_1, cancellation_1, errorMessage_1, event_1, lifecycle_1, network_1, path_1, performance_1, platform_1, uri_1, nls_1, backup_1, configuration_1, dialogMainService_1, environmentMainService_1, argvHelper_1, files_1, lifecycleMainService_1, log_1, productService_1, protocol_1, marketplace_1, storageMainService_1, telemetry_1, themables_1, themeMainService_1, window_1, windows_1, workspace_1, workspacesManagementMainService_1, window_2, color_1, policy_1, state_1, userDataProfile_1, loggerService_1, arrays_1) {
    "use strict";
    var CodeWindow_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeWindow = void 0;
    var ReadyState;
    (function (ReadyState) {
        /**
         * This window has not loaded anything yet
         * and this is the initial state of every
         * window.
         */
        ReadyState[ReadyState["NONE"] = 0] = "NONE";
        /**
         * This window is navigating, either for the
         * first time or subsequent times.
         */
        ReadyState[ReadyState["NAVIGATING"] = 1] = "NAVIGATING";
        /**
         * This window has finished loading and is ready
         * to forward IPC requests to the web contents.
         */
        ReadyState[ReadyState["READY"] = 2] = "READY";
    })(ReadyState || (ReadyState = {}));
    let CodeWindow = class CodeWindow extends lifecycle_1.Disposable {
        static { CodeWindow_1 = this; }
        static { this.windowControlHeightStateStorageKey = 'windowControlHeight'; }
        get id() { return this._id; }
        get win() { return this._win; }
        get lastFocusTime() { return this._lastFocusTime; }
        get backupPath() { return this._config?.backupPath; }
        get openedWorkspace() { return this._config?.workspace; }
        get profile() {
            if (!this.config) {
                return undefined;
            }
            const profile = this.userDataProfilesService.profiles.find(profile => profile.id === this.config?.profiles.profile.id);
            if (this.isExtensionDevelopmentHost && profile) {
                return profile;
            }
            return this.userDataProfilesService.getProfileForWorkspace(this.config.workspace ?? (0, workspace_1.toWorkspaceIdentifier)(this.backupPath, this.isExtensionDevelopmentHost)) ?? this.userDataProfilesService.defaultProfile;
        }
        get remoteAuthority() { return this._config?.remoteAuthority; }
        get config() { return this._config; }
        get isExtensionDevelopmentHost() { return !!(this._config?.extensionDevelopmentPath); }
        get isExtensionTestHost() { return !!(this._config?.extensionTestsPath); }
        get isExtensionDevelopmentTestFromCli() { return this.isExtensionDevelopmentHost && this.isExtensionTestHost && !this._config?.debugId; }
        constructor(config, logService, loggerMainService, environmentMainService, policyService, userDataProfilesService, fileService, applicationStorageMainService, storageMainService, configurationService, themeMainService, workspacesManagementMainService, backupMainService, telemetryService, dialogMainService, lifecycleMainService, productService, protocolMainService, windowsMainService, stateService) {
            super();
            this.logService = logService;
            this.loggerMainService = loggerMainService;
            this.environmentMainService = environmentMainService;
            this.policyService = policyService;
            this.userDataProfilesService = userDataProfilesService;
            this.fileService = fileService;
            this.applicationStorageMainService = applicationStorageMainService;
            this.storageMainService = storageMainService;
            this.configurationService = configurationService;
            this.themeMainService = themeMainService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.backupMainService = backupMainService;
            this.telemetryService = telemetryService;
            this.dialogMainService = dialogMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.productService = productService;
            this.protocolMainService = protocolMainService;
            this.windowsMainService = windowsMainService;
            this.stateService = stateService;
            //#region Events
            this._onWillLoad = this._register(new event_1.Emitter());
            this.onWillLoad = this._onWillLoad.event;
            this._onDidSignalReady = this._register(new event_1.Emitter());
            this.onDidSignalReady = this._onDidSignalReady.event;
            this._onDidTriggerSystemContextMenu = this._register(new event_1.Emitter());
            this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidDestroy = this._register(new event_1.Emitter());
            this.onDidDestroy = this._onDidDestroy.event;
            this._lastFocusTime = -1;
            // TODO@electron workaround for https://github.com/electron/electron/issues/35360
            // where on macOS the window will report a wrong state for `isFullScreen()` while
            // transitioning into and out of native full screen.
            this.transientIsNativeFullScreen = undefined;
            this.joinNativeFullScreenTransition = undefined;
            this.hasWindowControlOverlay = false;
            this.whenReadyCallbacks = [];
            this.touchBarGroups = [];
            this.currentHttpProxy = undefined;
            this.currentNoProxy = undefined;
            this.configObjectUrl = this._register(this.protocolMainService.createIPCObjectUrl());
            this.wasLoaded = false;
            this.readyState = 0 /* ReadyState.NONE */;
            //#region create browser window
            {
                // Load window state
                const [state, hasMultipleDisplays] = this.restoreWindowState(config.state);
                this.windowState = state;
                this.logService.trace('window#ctor: using window state', state);
                // In case we are maximized or fullscreen, only show later
                // after the call to maximize/fullscreen (see below)
                const isFullscreenOrMaximized = (this.windowState.mode === 0 /* WindowMode.Maximized */ || this.windowState.mode === 3 /* WindowMode.Fullscreen */);
                const windowSettings = this.configurationService.getValue('window');
                const options = {
                    width: this.windowState.width,
                    height: this.windowState.height,
                    x: this.windowState.x,
                    y: this.windowState.y,
                    backgroundColor: this.themeMainService.getBackgroundColor(),
                    minWidth: window_1.WindowMinimumSize.WIDTH,
                    minHeight: window_1.WindowMinimumSize.HEIGHT,
                    show: !isFullscreenOrMaximized,
                    title: this.productService.nameLong,
                    webPreferences: {
                        preload: network_1.FileAccess.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                        additionalArguments: [`--vscode-window-config=${this.configObjectUrl.resource.toString()}`],
                        v8CacheOptions: this.environmentMainService.useCodeCache ? 'bypassHeatCheck' : 'none',
                        enableWebSQL: false,
                        spellcheck: false,
                        zoomFactor: (0, window_1.zoomLevelToZoomFactor)(windowSettings?.zoomLevel),
                        autoplayPolicy: 'user-gesture-required',
                        // Enable experimental css highlight api https://chromestatus.com/feature/5436441440026624
                        // Refs https://github.com/microsoft/vscode/issues/140098
                        enableBlinkFeatures: 'HighlightAPI',
                        sandbox: true
                    },
                    experimentalDarkMode: true
                };
                // Apply icon to window
                // Linux: always
                // Windows: only when running out of sources, otherwise an icon is set by us on the executable
                if (platform_1.isLinux) {
                    options.icon = (0, path_1.join)(this.environmentMainService.appRoot, 'resources/linux/code.png');
                }
                else if (platform_1.isWindows && !this.environmentMainService.isBuilt) {
                    options.icon = (0, path_1.join)(this.environmentMainService.appRoot, 'resources/win32/code_150x150.png');
                }
                if (platform_1.isMacintosh && !this.useNativeFullScreen()) {
                    options.fullscreenable = false; // enables simple fullscreen mode
                }
                if (platform_1.isMacintosh) {
                    options.acceptFirstMouse = true; // enabled by default
                    if (windowSettings?.clickThroughInactive === false) {
                        options.acceptFirstMouse = false;
                    }
                }
                const useNativeTabs = platform_1.isMacintosh && windowSettings?.nativeTabs === true;
                if (useNativeTabs) {
                    options.tabbingIdentifier = this.productService.nameShort; // this opts in to sierra tabs
                }
                const useCustomTitleStyle = (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom';
                if (useCustomTitleStyle) {
                    options.titleBarStyle = 'hidden';
                    if (!platform_1.isMacintosh) {
                        options.frame = false;
                    }
                    if ((0, window_1.useWindowControlsOverlay)(this.configurationService)) {
                        // This logic will not perfectly guess the right colors
                        // to use on initialization, but prefer to keep things
                        // simple as it is temporary and not noticeable
                        const titleBarColor = this.themeMainService.getWindowSplash()?.colorInfo.titleBarBackground ?? this.themeMainService.getBackgroundColor();
                        const symbolColor = color_1.Color.fromHex(titleBarColor).isDarker() ? '#FFFFFF' : '#000000';
                        options.titleBarOverlay = {
                            height: 29,
                            color: titleBarColor,
                            symbolColor
                        };
                        this.hasWindowControlOverlay = true;
                    }
                }
                // Create the browser window
                (0, performance_1.mark)('code/willCreateCodeBrowserWindow');
                this._win = new electron_1.BrowserWindow(options);
                (0, performance_1.mark)('code/didCreateCodeBrowserWindow');
                this._id = this._win.id;
                if (platform_1.isMacintosh && useCustomTitleStyle) {
                    this._win.setSheetOffset(22); // offset dialogs by the height of the custom title bar if we have any
                }
                // Update the window controls immediately based on cached values
                if (useCustomTitleStyle && ((platform_1.isWindows && (0, window_1.useWindowControlsOverlay)(this.configurationService)) || platform_1.isMacintosh)) {
                    const cachedWindowControlHeight = this.stateService.getItem((CodeWindow_1.windowControlHeightStateStorageKey));
                    if (cachedWindowControlHeight) {
                        this.updateWindowControls({ height: cachedWindowControlHeight });
                    }
                }
                // Windows Custom System Context Menu
                // See https://github.com/electron/electron/issues/24893
                //
                // The purpose of this is to allow for the context menu in the Windows Title Bar
                //
                // Currently, all mouse events in the title bar are captured by the OS
                // thus we need to capture them here with a window hook specific to Windows
                // and then forward them to the correct window.
                if (platform_1.isWindows && useCustomTitleStyle) {
                    const WM_INITMENU = 0x0116; // https://docs.microsoft.com/en-us/windows/win32/menurc/wm-initmenu
                    // This sets up a listener for the window hook. This is a Windows-only API provided by electron.
                    this._win.hookWindowMessage(WM_INITMENU, () => {
                        const [x, y] = this._win.getPosition();
                        const cursorPos = electron_1.screen.getCursorScreenPoint();
                        const cx = cursorPos.x - x;
                        const cy = cursorPos.y - y;
                        // In some cases, show the default system context menu
                        // 1) The mouse position is not within the title bar
                        // 2) The mouse position is within the title bar, but over the app icon
                        // We do not know the exact title bar height but we make an estimate based on window height
                        const shouldTriggerDefaultSystemContextMenu = () => {
                            // Use the custom context menu when over the title bar, but not over the app icon
                            // The app icon is estimated to be 30px wide
                            // The title bar is estimated to be the max of 35px and 15% of the window height
                            if (cx > 30 && cy >= 0 && cy <= Math.max(this._win.getBounds().height * 0.15, 35)) {
                                return false;
                            }
                            return true;
                        };
                        if (!shouldTriggerDefaultSystemContextMenu()) {
                            // This is necessary to make sure the native system context menu does not show up.
                            this._win.setEnabled(false);
                            this._win.setEnabled(true);
                            this._onDidTriggerSystemContextMenu.fire({ x: cx, y: cy });
                        }
                        return 0;
                    });
                }
                // TODO@electron (Electron 4 regression): when running on multiple displays where the target display
                // to open the window has a larger resolution than the primary display, the window will not size
                // correctly unless we set the bounds again (https://github.com/microsoft/vscode/issues/74872)
                //
                // Extended to cover Windows as well as Mac (https://github.com/microsoft/vscode/issues/146499)
                //
                // However, when running with native tabs with multiple windows we cannot use this workaround
                // because there is a potential that the new window will be added as native tab instead of being
                // a window on its own. In that case calling setBounds() would cause https://github.com/microsoft/vscode/issues/75830
                if ((platform_1.isMacintosh || platform_1.isWindows) && hasMultipleDisplays && (!useNativeTabs || electron_1.BrowserWindow.getAllWindows().length === 1)) {
                    if ([this.windowState.width, this.windowState.height, this.windowState.x, this.windowState.y].every(value => typeof value === 'number')) {
                        this._win.setBounds({
                            width: this.windowState.width,
                            height: this.windowState.height,
                            x: this.windowState.x,
                            y: this.windowState.y
                        });
                    }
                }
                if (isFullscreenOrMaximized) {
                    (0, performance_1.mark)('code/willMaximizeCodeWindow');
                    // this call may or may not show the window, depends
                    // on the platform: currently on Windows and Linux will
                    // show the window as active. To be on the safe side,
                    // we show the window at the end of this block.
                    this._win.maximize();
                    if (this.windowState.mode === 3 /* WindowMode.Fullscreen */) {
                        this.setFullScreen(true);
                    }
                    // to reduce flicker from the default window size
                    // to maximize or fullscreen, we only show after
                    this._win.show();
                    (0, performance_1.mark)('code/didMaximizeCodeWindow');
                }
                this._lastFocusTime = Date.now(); // since we show directly, we need to set the last focus time too
            }
            //#endregion
            // Open devtools if instructed from command line args
            if (this.environmentMainService.args['open-devtools'] === true) {
                this._win.webContents.openDevTools();
            }
            // respect configured menu bar visibility
            this.onConfigurationUpdated();
            // macOS: touch bar support
            this.createTouchBar();
            // Eventing
            this.registerListeners();
        }
        setRepresentedFilename(filename) {
            if (platform_1.isMacintosh) {
                this._win.setRepresentedFilename(filename);
            }
            else {
                this.representedFilename = filename;
            }
        }
        getRepresentedFilename() {
            if (platform_1.isMacintosh) {
                return this._win.getRepresentedFilename();
            }
            return this.representedFilename;
        }
        setDocumentEdited(edited) {
            if (platform_1.isMacintosh) {
                this._win.setDocumentEdited(edited);
            }
            this.documentEdited = edited;
        }
        isDocumentEdited() {
            if (platform_1.isMacintosh) {
                return this._win.isDocumentEdited();
            }
            return !!this.documentEdited;
        }
        focus(options) {
            // macOS: Electron > 7.x changed its behaviour to not
            // bring the application to the foreground when a window
            // is focused programmatically. Only via `app.focus` and
            // the option `steal: true` can you get the previous
            // behaviour back. The only reason to use this option is
            // when a window is getting focused while the application
            // is not in the foreground.
            if (platform_1.isMacintosh && options?.force) {
                electron_1.app.focus({ steal: true });
            }
            if (!this._win) {
                return;
            }
            if (this._win.isMinimized()) {
                this._win.restore();
            }
            this._win.focus();
        }
        setReady() {
            this.logService.trace(`window#load: window reported ready (id: ${this._id})`);
            this.readyState = 2 /* ReadyState.READY */;
            // inform all waiting promises that we are ready now
            while (this.whenReadyCallbacks.length) {
                this.whenReadyCallbacks.pop()(this);
            }
            // Events
            this._onDidSignalReady.fire();
        }
        ready() {
            return new Promise(resolve => {
                if (this.isReady) {
                    return resolve(this);
                }
                // otherwise keep and call later when we are ready
                this.whenReadyCallbacks.push(resolve);
            });
        }
        get isReady() {
            return this.readyState === 2 /* ReadyState.READY */;
        }
        get whenClosedOrLoaded() {
            return new Promise(resolve => {
                function handle() {
                    closeListener.dispose();
                    loadListener.dispose();
                    resolve();
                }
                const closeListener = this.onDidClose(() => handle());
                const loadListener = this.onWillLoad(() => handle());
            });
        }
        registerListeners() {
            // Window error conditions to handle
            this._win.on('unresponsive', () => this.onWindowError(1 /* WindowError.UNRESPONSIVE */));
            this._win.webContents.on('render-process-gone', (event, details) => this.onWindowError(2 /* WindowError.PROCESS_GONE */, { ...details }));
            this._win.webContents.on('did-fail-load', (event, exitCode, reason) => this.onWindowError(3 /* WindowError.LOAD */, { reason, exitCode }));
            // Prevent windows/iframes from blocking the unload
            // through DOM events. We have our own logic for
            // unloading a window that should not be confused
            // with the DOM way.
            // (https://github.com/microsoft/vscode/issues/122736)
            this._win.webContents.on('will-prevent-unload', event => {
                event.preventDefault();
            });
            // Window close
            this._win.on('closed', () => {
                this._onDidClose.fire();
                this.dispose();
            });
            // Remember that we loaded
            this._win.webContents.on('did-finish-load', () => {
                // Associate properties from the load request if provided
                if (this.pendingLoadConfig) {
                    this._config = this.pendingLoadConfig;
                    this.pendingLoadConfig = undefined;
                }
            });
            // Window Focus
            this._win.on('focus', () => {
                this._lastFocusTime = Date.now();
            });
            // Window (Un)Maximize
            this._win.on('maximize', (e) => {
                if (this._config) {
                    this._config.maximized = true;
                }
                electron_1.app.emit('browser-window-maximize', e, this._win);
            });
            this._win.on('unmaximize', (e) => {
                if (this._config) {
                    this._config.maximized = false;
                }
                electron_1.app.emit('browser-window-unmaximize', e, this._win);
            });
            // Window Fullscreen
            this._win.on('enter-full-screen', () => {
                this.sendWhenReady('vscode:enterFullScreen', cancellation_1.CancellationToken.None);
                this.joinNativeFullScreenTransition?.complete();
                this.joinNativeFullScreenTransition = undefined;
            });
            this._win.on('leave-full-screen', () => {
                this.sendWhenReady('vscode:leaveFullScreen', cancellation_1.CancellationToken.None);
                this.joinNativeFullScreenTransition?.complete();
                this.joinNativeFullScreenTransition = undefined;
            });
            // Handle configuration changes
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            // Handle Workspace events
            this._register(this.workspacesManagementMainService.onDidDeleteUntitledWorkspace(e => this.onDidDeleteUntitledWorkspace(e)));
            // Inject headers when requests are incoming
            const urls = ['https://marketplace.visualstudio.com/*', 'https://*.vsassets.io/*'];
            this._win.webContents.session.webRequest.onBeforeSendHeaders({ urls }, async (details, cb) => {
                const headers = await this.getMarketplaceHeaders();
                cb({ cancel: false, requestHeaders: Object.assign(details.requestHeaders, headers) });
            });
        }
        getMarketplaceHeaders() {
            if (!this.marketplaceHeadersPromise) {
                this.marketplaceHeadersPromise = (0, marketplace_1.resolveMarketplaceHeaders)(this.productService.version, this.productService, this.environmentMainService, this.configurationService, this.fileService, this.applicationStorageMainService, this.telemetryService);
            }
            return this.marketplaceHeadersPromise;
        }
        async onWindowError(type, details) {
            switch (type) {
                case 2 /* WindowError.PROCESS_GONE */:
                    this.logService.error(`CodeWindow: renderer process gone (reason: ${details?.reason || '<unknown>'}, code: ${details?.exitCode || '<unknown>'})`);
                    break;
                case 1 /* WindowError.UNRESPONSIVE */:
                    this.logService.error('CodeWindow: detected unresponsive');
                    break;
                case 3 /* WindowError.LOAD */:
                    this.logService.error(`CodeWindow: failed to load (reason: ${details?.reason || '<unknown>'}, code: ${details?.exitCode || '<unknown>'})`);
                    break;
            }
            this.telemetryService.publicLog2('windowerror', {
                type,
                reason: details?.reason,
                code: details?.exitCode
            });
            // Inform User if non-recoverable
            switch (type) {
                case 1 /* WindowError.UNRESPONSIVE */:
                case 2 /* WindowError.PROCESS_GONE */:
                    // If we run extension tests from CLI, we want to signal
                    // back this state to the test runner by exiting with a
                    // non-zero exit code.
                    if (this.isExtensionDevelopmentTestFromCli) {
                        this.lifecycleMainService.kill(1);
                        return;
                    }
                    // If we run smoke tests, want to proceed with an orderly
                    // shutdown as much as possible by destroying the window
                    // and then calling the normal `quit` routine.
                    if (this.environmentMainService.args['enable-smoke-test-driver']) {
                        await this.destroyWindow(false, false);
                        this.lifecycleMainService.quit(); // still allow for an orderly shutdown
                        return;
                    }
                    // Unresponsive
                    if (type === 1 /* WindowError.UNRESPONSIVE */) {
                        if (this.isExtensionDevelopmentHost || this.isExtensionTestHost || (this._win && this._win.webContents && this._win.webContents.isDevToolsOpened())) {
                            // TODO@electron Workaround for https://github.com/microsoft/vscode/issues/56994
                            // In certain cases the window can report unresponsiveness because a breakpoint was hit
                            // and the process is stopped executing. The most typical cases are:
                            // - devtools are opened and debugging happens
                            // - window is an extensions development host that is being debugged
                            // - window is an extension test development host that is being debugged
                            return;
                        }
                        // Show Dialog
                        const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                            type: 'warning',
                            buttons: [
                                (0, nls_1.localize)({ key: 'reopen', comment: ['&& denotes a mnemonic'] }, "&&Reopen"),
                                (0, nls_1.localize)({ key: 'close', comment: ['&& denotes a mnemonic'] }, "&&Close"),
                                (0, nls_1.localize)({ key: 'wait', comment: ['&& denotes a mnemonic'] }, "&&Keep Waiting")
                            ],
                            message: (0, nls_1.localize)('appStalled', "The window is not responding"),
                            detail: (0, nls_1.localize)('appStalledDetail', "You can reopen or close the window or keep waiting."),
                            checkboxLabel: this._config?.workspace ? (0, nls_1.localize)('doNotRestoreEditors', "Don't restore editors") : undefined
                        }, this._win);
                        // Handle choice
                        if (response !== 2 /* keep waiting */) {
                            const reopen = response === 0;
                            await this.destroyWindow(reopen, checkboxChecked);
                        }
                    }
                    // Process gone
                    else if (type === 2 /* WindowError.PROCESS_GONE */) {
                        let message;
                        if (!details) {
                            message = (0, nls_1.localize)('appGone', "The window terminated unexpectedly");
                        }
                        else {
                            message = (0, nls_1.localize)('appGoneDetails', "The window terminated unexpectedly (reason: '{0}', code: '{1}')", details.reason, details.exitCode ?? '<unknown>');
                        }
                        // Show Dialog
                        const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                            type: 'warning',
                            buttons: [
                                this._config?.workspace ? (0, nls_1.localize)({ key: 'reopen', comment: ['&& denotes a mnemonic'] }, "&&Reopen") : (0, nls_1.localize)({ key: 'newWindow', comment: ['&& denotes a mnemonic'] }, "&&New Window"),
                                (0, nls_1.localize)({ key: 'close', comment: ['&& denotes a mnemonic'] }, "&&Close")
                            ],
                            message,
                            detail: this._config?.workspace ?
                                (0, nls_1.localize)('appGoneDetailWorkspace', "We are sorry for the inconvenience. You can reopen the window to continue where you left off.") :
                                (0, nls_1.localize)('appGoneDetailEmptyWindow', "We are sorry for the inconvenience. You can open a new empty window to start again."),
                            checkboxLabel: this._config?.workspace ? (0, nls_1.localize)('doNotRestoreEditors', "Don't restore editors") : undefined
                        }, this._win);
                        // Handle choice
                        const reopen = response === 0;
                        await this.destroyWindow(reopen, checkboxChecked);
                    }
                    break;
            }
        }
        async destroyWindow(reopen, skipRestoreEditors) {
            const workspace = this._config?.workspace;
            //  check to discard editor state first
            if (skipRestoreEditors && workspace) {
                try {
                    const workspaceStorage = this.storageMainService.workspaceStorage(workspace);
                    await workspaceStorage.init();
                    workspaceStorage.delete('memento/workbench.parts.editor');
                    await workspaceStorage.close();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            // 'close' event will not be fired on destroy(), so signal crash via explicit event
            this._onDidDestroy.fire();
            // make sure to destroy the window as its renderer process is gone
            this._win?.destroy();
            // ask the windows service to open a new fresh window if specified
            if (reopen && this._config) {
                // We have to reconstruct a openable from the current workspace
                let uriToOpen = undefined;
                let forceEmpty = undefined;
                if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                    uriToOpen = { folderUri: workspace.uri };
                }
                else if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                    uriToOpen = { workspaceUri: workspace.configPath };
                }
                else {
                    forceEmpty = true;
                }
                // Delegate to windows service
                const window = (0, arrays_1.firstOrDefault)(await this.windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    userEnv: this._config.userEnv,
                    cli: {
                        ...this.environmentMainService.args,
                        _: [] // we pass in the workspace to open explicitly via `urisToOpen`
                    },
                    urisToOpen: uriToOpen ? [uriToOpen] : undefined,
                    forceEmpty,
                    forceNewWindow: true,
                    remoteAuthority: this.remoteAuthority
                }));
                window?.focus();
            }
        }
        onDidDeleteUntitledWorkspace(workspace) {
            // Make sure to update our workspace config if we detect that it
            // was deleted
            if (this._config?.workspace?.id === workspace.id) {
                this._config.workspace = undefined;
            }
        }
        onConfigurationUpdated(e) {
            // Menubar
            if (!e || e.affectsConfiguration('window.menuBarVisibility')) {
                const newMenuBarVisibility = this.getMenuBarVisibility();
                if (newMenuBarVisibility !== this.currentMenuBarVisibility) {
                    this.currentMenuBarVisibility = newMenuBarVisibility;
                    this.setMenuBarVisibility(newMenuBarVisibility);
                }
            }
            // Proxy
            if (!e || e.affectsConfiguration('http.proxy')) {
                let newHttpProxy = (this.configurationService.getValue('http.proxy') || '').trim()
                    || (process.env['https_proxy'] || process.env['HTTPS_PROXY'] || process.env['http_proxy'] || process.env['HTTP_PROXY'] || '').trim() // Not standardized.
                    || undefined;
                if (newHttpProxy?.endsWith('/')) {
                    newHttpProxy = newHttpProxy.substr(0, newHttpProxy.length - 1);
                }
                const newNoProxy = (process.env['no_proxy'] || process.env['NO_PROXY'] || '').trim() || undefined; // Not standardized.
                if ((newHttpProxy || '').indexOf('@') === -1 && (newHttpProxy !== this.currentHttpProxy || newNoProxy !== this.currentNoProxy)) {
                    this.currentHttpProxy = newHttpProxy;
                    this.currentNoProxy = newNoProxy;
                    const proxyRules = newHttpProxy || '';
                    const proxyBypassRules = newNoProxy ? `${newNoProxy},<local>` : '<local>';
                    this.logService.trace(`Setting proxy to '${proxyRules}', bypassing '${proxyBypassRules}'`);
                    this._win.webContents.session.setProxy({ proxyRules, proxyBypassRules, pacScript: '' });
                }
            }
        }
        addTabbedWindow(window) {
            if (platform_1.isMacintosh && window.win) {
                this._win.addTabbedWindow(window.win);
            }
        }
        load(configuration, options = Object.create(null)) {
            this.logService.trace(`window#load: attempt to load window (id: ${this._id})`);
            // Clear Document Edited if needed
            if (this.isDocumentEdited()) {
                if (!options.isReload || !this.backupMainService.isHotExitEnabled()) {
                    this.setDocumentEdited(false);
                }
            }
            // Clear Title and Filename if needed
            if (!options.isReload) {
                if (this.getRepresentedFilename()) {
                    this.setRepresentedFilename('');
                }
                this._win.setTitle(this.productService.nameLong);
            }
            // Update configuration values based on our window context
            // and set it into the config object URL for usage.
            this.updateConfiguration(configuration, options);
            // If this is the first time the window is loaded, we associate the paths
            // directly with the window because we assume the loading will just work
            if (this.readyState === 0 /* ReadyState.NONE */) {
                this._config = configuration;
            }
            // Otherwise, the window is currently showing a folder and if there is an
            // unload handler preventing the load, we cannot just associate the paths
            // because the loading might be vetoed. Instead we associate it later when
            // the window load event has fired.
            else {
                this.pendingLoadConfig = configuration;
            }
            // Indicate we are navigting now
            this.readyState = 1 /* ReadyState.NAVIGATING */;
            // Load URL
            this._win.loadURL(network_1.FileAccess.asBrowserUri(`vs/code/electron-sandbox/workbench/workbench${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
            // Remember that we did load
            const wasLoaded = this.wasLoaded;
            this.wasLoaded = true;
            // Make window visible if it did not open in N seconds because this indicates an error
            // Only do this when running out of sources and not when running tests
            if (!this.environmentMainService.isBuilt && !this.environmentMainService.extensionTestsLocationURI) {
                this._register(new async_1.RunOnceScheduler(() => {
                    if (this._win && !this._win.isVisible() && !this._win.isMinimized()) {
                        this._win.show();
                        this.focus({ force: true });
                        this._win.webContents.openDevTools();
                    }
                }, 10000)).schedule();
            }
            // Event
            this._onWillLoad.fire({ workspace: configuration.workspace, reason: options.isReload ? 3 /* LoadReason.RELOAD */ : wasLoaded ? 2 /* LoadReason.LOAD */ : 1 /* LoadReason.INITIAL */ });
        }
        updateConfiguration(configuration, options) {
            // If this window was loaded before from the command line
            // (as indicated by VSCODE_CLI environment), make sure to
            // preserve that user environment in subsequent loads,
            // unless the new configuration context was also a CLI
            // (for https://github.com/microsoft/vscode/issues/108571)
            // Also, preserve the environment if we're loading from an
            // extension development host that had its environment set
            // (for https://github.com/microsoft/vscode/issues/123508)
            const currentUserEnv = (this._config ?? this.pendingLoadConfig)?.userEnv;
            if (currentUserEnv) {
                const shouldPreserveLaunchCliEnvironment = (0, argvHelper_1.isLaunchedFromCli)(currentUserEnv) && !(0, argvHelper_1.isLaunchedFromCli)(configuration.userEnv);
                const shouldPreserveDebugEnvironmnet = this.isExtensionDevelopmentHost;
                if (shouldPreserveLaunchCliEnvironment || shouldPreserveDebugEnvironmnet) {
                    configuration.userEnv = { ...currentUserEnv, ...configuration.userEnv }; // still allow to override certain environment as passed in
                }
            }
            // If named pipe was instantiated for the crashpad_handler process, reuse the same
            // pipe for new app instances connecting to the original app instance.
            // Ref: https://github.com/microsoft/vscode/issues/115874
            if (process.env['CHROME_CRASHPAD_PIPE_NAME']) {
                Object.assign(configuration.userEnv, {
                    CHROME_CRASHPAD_PIPE_NAME: process.env['CHROME_CRASHPAD_PIPE_NAME']
                });
            }
            // Add disable-extensions to the config, but do not preserve it on currentConfig or
            // pendingLoadConfig so that it is applied only on this load
            if (options.disableExtensions !== undefined) {
                configuration['disable-extensions'] = options.disableExtensions;
            }
            // Update window related properties
            configuration.fullscreen = this.isFullScreen;
            configuration.maximized = this._win.isMaximized();
            configuration.partsSplash = this.themeMainService.getWindowSplash();
            // Update with latest perf marks
            (0, performance_1.mark)('code/willOpenNewWindow');
            configuration.perfMarks = (0, performance_1.getMarks)();
            // Update in config object URL for usage in renderer
            this.configObjectUrl.update(configuration);
        }
        async reload(cli) {
            // Copy our current config for reuse
            const configuration = Object.assign({}, this._config);
            // Validate workspace
            configuration.workspace = await this.validateWorkspaceBeforeReload(configuration);
            // Delete some properties we do not want during reload
            delete configuration.filesToOpenOrCreate;
            delete configuration.filesToDiff;
            delete configuration.filesToMerge;
            delete configuration.filesToWait;
            // Some configuration things get inherited if the window is being reloaded and we are
            // in extension development mode. These options are all development related.
            if (this.isExtensionDevelopmentHost && cli) {
                configuration.verbose = cli.verbose;
                configuration.debugId = cli.debugId;
                configuration.extensionEnvironment = cli.extensionEnvironment;
                configuration['inspect-extensions'] = cli['inspect-extensions'];
                configuration['inspect-brk-extensions'] = cli['inspect-brk-extensions'];
                configuration['extensions-dir'] = cli['extensions-dir'];
            }
            configuration.accessibilitySupport = electron_1.app.isAccessibilitySupportEnabled();
            configuration.isInitialStartup = false; // since this is a reload
            configuration.policiesData = this.policyService.serialize(); // set policies data again
            configuration.continueOn = this.environmentMainService.continueOn;
            configuration.profiles = {
                all: this.userDataProfilesService.profiles,
                profile: this.profile || this.userDataProfilesService.defaultProfile,
                home: this.userDataProfilesService.profilesHome
            };
            configuration.logLevel = this.loggerMainService.getLogLevel();
            configuration.loggers = {
                window: this.loggerMainService.getRegisteredLoggers(this.id),
                global: this.loggerMainService.getRegisteredLoggers()
            };
            // Load config
            this.load(configuration, { isReload: true, disableExtensions: cli?.['disable-extensions'] });
        }
        async validateWorkspaceBeforeReload(configuration) {
            // Multi folder
            if ((0, workspace_1.isWorkspaceIdentifier)(configuration.workspace)) {
                const configPath = configuration.workspace.configPath;
                if (configPath.scheme === network_1.Schemas.file) {
                    const workspaceExists = await this.fileService.exists(configPath);
                    if (!workspaceExists) {
                        return undefined;
                    }
                }
            }
            // Single folder
            else if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(configuration.workspace)) {
                const uri = configuration.workspace.uri;
                if (uri.scheme === network_1.Schemas.file) {
                    const folderExists = await this.fileService.exists(uri);
                    if (!folderExists) {
                        return undefined;
                    }
                }
            }
            // Workspace is valid
            return configuration.workspace;
        }
        serializeWindowState() {
            if (!this._win) {
                return (0, window_2.defaultWindowState)();
            }
            // fullscreen gets special treatment
            if (this.isFullScreen) {
                let display;
                try {
                    display = electron_1.screen.getDisplayMatching(this.getBounds());
                }
                catch (error) {
                    // Electron has weird conditions under which it throws errors
                    // e.g. https://github.com/microsoft/vscode/issues/100334 when
                    // large numbers are passed in
                }
                const defaultState = (0, window_2.defaultWindowState)();
                const res = {
                    mode: 3 /* WindowMode.Fullscreen */,
                    display: display ? display.id : undefined,
                    // Still carry over window dimensions from previous sessions
                    // if we can compute it in fullscreen state.
                    // does not seem possible in all cases on Linux for example
                    // (https://github.com/microsoft/vscode/issues/58218) so we
                    // fallback to the defaults in that case.
                    width: this.windowState.width || defaultState.width,
                    height: this.windowState.height || defaultState.height,
                    x: this.windowState.x || 0,
                    y: this.windowState.y || 0
                };
                return res;
            }
            const state = Object.create(null);
            let mode;
            // get window mode
            if (!platform_1.isMacintosh && this._win.isMaximized()) {
                mode = 0 /* WindowMode.Maximized */;
            }
            else {
                mode = 1 /* WindowMode.Normal */;
            }
            // we don't want to save minimized state, only maximized or normal
            if (mode === 0 /* WindowMode.Maximized */) {
                state.mode = 0 /* WindowMode.Maximized */;
            }
            else {
                state.mode = 1 /* WindowMode.Normal */;
            }
            // only consider non-minimized window states
            if (mode === 1 /* WindowMode.Normal */ || mode === 0 /* WindowMode.Maximized */) {
                let bounds;
                if (mode === 1 /* WindowMode.Normal */) {
                    bounds = this.getBounds();
                }
                else {
                    bounds = this._win.getNormalBounds(); // make sure to persist the normal bounds when maximized to be able to restore them
                }
                state.x = bounds.x;
                state.y = bounds.y;
                state.width = bounds.width;
                state.height = bounds.height;
            }
            return state;
        }
        updateWindowControls(options) {
            // Cache the height for speeds lookups on startup
            if (options.height) {
                this.stateService.setItem((CodeWindow_1.windowControlHeightStateStorageKey), options.height);
            }
            // Windows: window control overlay (WCO)
            if (platform_1.isWindows && this.hasWindowControlOverlay) {
                this._win.setTitleBarOverlay({
                    color: options.backgroundColor?.trim() === '' ? undefined : options.backgroundColor,
                    symbolColor: options.foregroundColor?.trim() === '' ? undefined : options.foregroundColor,
                    height: options.height ? options.height - 1 : undefined // account for window border
                });
            }
            // macOS: traffic lights
            else if (platform_1.isMacintosh && options.height !== undefined) {
                const verticalOffset = (options.height - 15) / 2; // 15px is the height of the traffic lights
                if (!verticalOffset) {
                    this._win.setWindowButtonPosition(null);
                }
                else {
                    this._win.setWindowButtonPosition({ x: verticalOffset, y: verticalOffset });
                }
            }
        }
        restoreWindowState(state) {
            (0, performance_1.mark)('code/willRestoreCodeWindowState');
            let hasMultipleDisplays = false;
            if (state) {
                try {
                    const displays = electron_1.screen.getAllDisplays();
                    hasMultipleDisplays = displays.length > 1;
                    state = this.validateWindowState(state, displays);
                }
                catch (err) {
                    this.logService.warn(`Unexpected error validating window state: ${err}\n${err.stack}`); // somehow display API can be picky about the state to validate
                }
            }
            (0, performance_1.mark)('code/didRestoreCodeWindowState');
            return [state || (0, window_2.defaultWindowState)(), hasMultipleDisplays];
        }
        validateWindowState(state, displays) {
            this.logService.trace(`window#validateWindowState: validating window state on ${displays.length} display(s)`, state);
            if (typeof state.x !== 'number' ||
                typeof state.y !== 'number' ||
                typeof state.width !== 'number' ||
                typeof state.height !== 'number') {
                this.logService.trace('window#validateWindowState: unexpected type of state values');
                return undefined;
            }
            if (state.width <= 0 || state.height <= 0) {
                this.logService.trace('window#validateWindowState: unexpected negative values');
                return undefined;
            }
            // Single Monitor: be strict about x/y positioning
            // macOS & Linux: these OS seem to be pretty good in ensuring that a window is never outside of it's bounds.
            // Windows: it is possible to have a window with a size that makes it fall out of the window. our strategy
            //          is to try as much as possible to keep the window in the monitor bounds. we are not as strict as
            //          macOS and Linux and allow the window to exceed the monitor bounds as long as the window is still
            //          some pixels (128) visible on the screen for the user to drag it back.
            if (displays.length === 1) {
                const displayWorkingArea = this.getWorkingArea(displays[0]);
                if (displayWorkingArea) {
                    this.logService.trace('window#validateWindowState: 1 monitor working area', displayWorkingArea);
                    function ensureStateInDisplayWorkingArea() {
                        if (!state || typeof state.x !== 'number' || typeof state.y !== 'number' || !displayWorkingArea) {
                            return;
                        }
                        if (state.x < displayWorkingArea.x) {
                            // prevent window from falling out of the screen to the left
                            state.x = displayWorkingArea.x;
                        }
                        if (state.y < displayWorkingArea.y) {
                            // prevent window from falling out of the screen to the top
                            state.y = displayWorkingArea.y;
                        }
                    }
                    // ensure state is not outside display working area (top, left)
                    ensureStateInDisplayWorkingArea();
                    if (state.width > displayWorkingArea.width) {
                        // prevent window from exceeding display bounds width
                        state.width = displayWorkingArea.width;
                    }
                    if (state.height > displayWorkingArea.height) {
                        // prevent window from exceeding display bounds height
                        state.height = displayWorkingArea.height;
                    }
                    if (state.x > (displayWorkingArea.x + displayWorkingArea.width - 128)) {
                        // prevent window from falling out of the screen to the right with
                        // 128px margin by positioning the window to the far right edge of
                        // the screen
                        state.x = displayWorkingArea.x + displayWorkingArea.width - state.width;
                    }
                    if (state.y > (displayWorkingArea.y + displayWorkingArea.height - 128)) {
                        // prevent window from falling out of the screen to the bottom with
                        // 128px margin by positioning the window to the far bottom edge of
                        // the screen
                        state.y = displayWorkingArea.y + displayWorkingArea.height - state.height;
                    }
                    // again ensure state is not outside display working area
                    // (it may have changed from the previous validation step)
                    ensureStateInDisplayWorkingArea();
                }
                return state;
            }
            // Multi Montior (fullscreen): try to find the previously used display
            if (state.display && state.mode === 3 /* WindowMode.Fullscreen */) {
                const display = displays.find(d => d.id === state.display);
                if (display && typeof display.bounds?.x === 'number' && typeof display.bounds?.y === 'number') {
                    this.logService.trace('window#validateWindowState: restoring fullscreen to previous display');
                    const defaults = (0, window_2.defaultWindowState)(3 /* WindowMode.Fullscreen */); // make sure we have good values when the user restores the window
                    defaults.x = display.bounds.x; // carefull to use displays x/y position so that the window ends up on the correct monitor
                    defaults.y = display.bounds.y;
                    return defaults;
                }
            }
            // Multi Monitor (non-fullscreen): ensure window is within display bounds
            let display;
            let displayWorkingArea;
            try {
                display = electron_1.screen.getDisplayMatching({ x: state.x, y: state.y, width: state.width, height: state.height });
                displayWorkingArea = this.getWorkingArea(display);
            }
            catch (error) {
                // Electron has weird conditions under which it throws errors
                // e.g. https://github.com/microsoft/vscode/issues/100334 when
                // large numbers are passed in
            }
            if (display && // we have a display matching the desired bounds
                displayWorkingArea && // we have valid working area bounds
                state.x + state.width > displayWorkingArea.x && // prevent window from falling out of the screen to the left
                state.y + state.height > displayWorkingArea.y && // prevent window from falling out of the screen to the top
                state.x < displayWorkingArea.x + displayWorkingArea.width && // prevent window from falling out of the screen to the right
                state.y < displayWorkingArea.y + displayWorkingArea.height // prevent window from falling out of the screen to the bottom
            ) {
                this.logService.trace('window#validateWindowState: multi-monitor working area', displayWorkingArea);
                return state;
            }
            return undefined;
        }
        getWorkingArea(display) {
            // Prefer the working area of the display to account for taskbars on the
            // desktop being positioned somewhere (https://github.com/microsoft/vscode/issues/50830).
            //
            // Linux X11 sessions sometimes report wrong display bounds, so we validate
            // the reported sizes are positive.
            if (display.workArea.width > 0 && display.workArea.height > 0) {
                return display.workArea;
            }
            if (display.bounds.width > 0 && display.bounds.height > 0) {
                return display.bounds;
            }
            return undefined;
        }
        getBounds() {
            const [x, y] = this._win.getPosition();
            const [width, height] = this._win.getSize();
            return { x, y, width, height };
        }
        toggleFullScreen() {
            this.setFullScreen(!this.isFullScreen);
        }
        setFullScreen(fullscreen) {
            // Set fullscreen state
            if (this.useNativeFullScreen()) {
                this.setNativeFullScreen(fullscreen);
            }
            else {
                this.setSimpleFullScreen(fullscreen);
            }
            // Events
            this.sendWhenReady(fullscreen ? 'vscode:enterFullScreen' : 'vscode:leaveFullScreen', cancellation_1.CancellationToken.None);
            // Respect configured menu bar visibility or default to toggle if not set
            if (this.currentMenuBarVisibility) {
                this.setMenuBarVisibility(this.currentMenuBarVisibility, false);
            }
        }
        get isFullScreen() {
            if (platform_1.isMacintosh && typeof this.transientIsNativeFullScreen === 'boolean') {
                return this.transientIsNativeFullScreen;
            }
            return this._win.isFullScreen() || this._win.isSimpleFullScreen();
        }
        setNativeFullScreen(fullscreen) {
            if (this._win.isSimpleFullScreen()) {
                this._win.setSimpleFullScreen(false);
            }
            this.doSetNativeFullScreen(fullscreen);
        }
        doSetNativeFullScreen(fullscreen) {
            if (platform_1.isMacintosh) {
                this.transientIsNativeFullScreen = fullscreen;
                this.joinNativeFullScreenTransition = new async_1.DeferredPromise();
                Promise.race([
                    this.joinNativeFullScreenTransition.p,
                    (0, async_1.timeout)(1000) // still timeout after some time in case we miss the event
                ]).finally(() => this.transientIsNativeFullScreen = undefined);
            }
            this._win.setFullScreen(fullscreen);
        }
        setSimpleFullScreen(fullscreen) {
            if (this._win.isFullScreen()) {
                this.doSetNativeFullScreen(false);
            }
            this._win.setSimpleFullScreen(fullscreen);
            this._win.webContents.focus(); // workaround issue where focus is not going into window
        }
        useNativeFullScreen() {
            const windowConfig = this.configurationService.getValue('window');
            if (!windowConfig || typeof windowConfig.nativeFullScreen !== 'boolean') {
                return true; // default
            }
            if (windowConfig.nativeTabs) {
                return true; // https://github.com/electron/electron/issues/16142
            }
            return windowConfig.nativeFullScreen !== false;
        }
        isMinimized() {
            return this._win.isMinimized();
        }
        getMenuBarVisibility() {
            let menuBarVisibility = (0, window_1.getMenuBarVisibility)(this.configurationService);
            if (['visible', 'toggle', 'hidden'].indexOf(menuBarVisibility) < 0) {
                menuBarVisibility = 'classic';
            }
            return menuBarVisibility;
        }
        setMenuBarVisibility(visibility, notify = true) {
            if (platform_1.isMacintosh) {
                return; // ignore for macOS platform
            }
            if (visibility === 'toggle') {
                if (notify) {
                    this.send('vscode:showInfoMessage', (0, nls_1.localize)('hiddenMenuBar', "You can still access the menu bar by pressing the Alt-key."));
                }
            }
            if (visibility === 'hidden') {
                // for some weird reason that I have no explanation for, the menu bar is not hiding when calling
                // this without timeout (see https://github.com/microsoft/vscode/issues/19777). there seems to be
                // a timing issue with us opening the first window and the menu bar getting created. somehow the
                // fact that we want to hide the menu without being able to bring it back via Alt key makes Electron
                // still show the menu. Unable to reproduce from a simple Hello World application though...
                setTimeout(() => {
                    this.doSetMenuBarVisibility(visibility);
                });
            }
            else {
                this.doSetMenuBarVisibility(visibility);
            }
        }
        doSetMenuBarVisibility(visibility) {
            const isFullscreen = this.isFullScreen;
            switch (visibility) {
                case ('classic'):
                    this._win.setMenuBarVisibility(!isFullscreen);
                    this._win.autoHideMenuBar = isFullscreen;
                    break;
                case ('visible'):
                    this._win.setMenuBarVisibility(true);
                    this._win.autoHideMenuBar = false;
                    break;
                case ('toggle'):
                    this._win.setMenuBarVisibility(false);
                    this._win.autoHideMenuBar = true;
                    break;
                case ('hidden'):
                    this._win.setMenuBarVisibility(false);
                    this._win.autoHideMenuBar = false;
                    break;
            }
        }
        handleTitleDoubleClick() {
            // Respect system settings on mac with regards to title click on windows title
            if (platform_1.isMacintosh) {
                const action = electron_1.systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');
                switch (action) {
                    case 'Minimize':
                        this._win.minimize();
                        break;
                    case 'None':
                        break;
                    case 'Maximize':
                    default:
                        if (this._win.isMaximized()) {
                            this._win.unmaximize();
                        }
                        else {
                            this._win.maximize();
                        }
                }
            }
            // Linux/Windows: just toggle maximize/minimized state
            else {
                if (this._win.isMaximized()) {
                    this._win.unmaximize();
                }
                else {
                    this._win.maximize();
                }
            }
        }
        close() {
            this._win?.close();
        }
        sendWhenReady(channel, token, ...args) {
            if (this.isReady) {
                this.send(channel, ...args);
            }
            else {
                this.ready().then(() => {
                    if (!token.isCancellationRequested) {
                        this.send(channel, ...args);
                    }
                });
            }
        }
        send(channel, ...args) {
            if (this._win) {
                if (this._win.isDestroyed() || this._win.webContents.isDestroyed()) {
                    this.logService.warn(`Sending IPC message to channel '${channel}' for window that is destroyed`);
                    return;
                }
                try {
                    this._win.webContents.send(channel, ...args);
                }
                catch (error) {
                    this.logService.warn(`Error sending IPC message to channel '${channel}' of window ${this._id}: ${(0, errorMessage_1.toErrorMessage)(error)}`);
                }
            }
        }
        updateTouchBar(groups) {
            if (!platform_1.isMacintosh) {
                return; // only supported on macOS
            }
            // Update segments for all groups. Setting the segments property
            // of the group directly prevents ugly flickering from happening
            this.touchBarGroups.forEach((touchBarGroup, index) => {
                const commands = groups[index];
                touchBarGroup.segments = this.createTouchBarGroupSegments(commands);
            });
        }
        createTouchBar() {
            if (!platform_1.isMacintosh) {
                return; // only supported on macOS
            }
            // To avoid flickering, we try to reuse the touch bar group
            // as much as possible by creating a large number of groups
            // for reusing later.
            for (let i = 0; i < 10; i++) {
                const groupTouchBar = this.createTouchBarGroup();
                this.touchBarGroups.push(groupTouchBar);
            }
            this._win.setTouchBar(new electron_1.TouchBar({ items: this.touchBarGroups }));
        }
        createTouchBarGroup(items = []) {
            // Group Segments
            const segments = this.createTouchBarGroupSegments(items);
            // Group Control
            const control = new electron_1.TouchBar.TouchBarSegmentedControl({
                segments,
                mode: 'buttons',
                segmentStyle: 'automatic',
                change: (selectedIndex) => {
                    this.sendWhenReady('vscode:runAction', cancellation_1.CancellationToken.None, { id: control.segments[selectedIndex].id, from: 'touchbar' });
                }
            });
            return control;
        }
        createTouchBarGroupSegments(items = []) {
            const segments = items.map(item => {
                let icon;
                if (item.icon && !themables_1.ThemeIcon.isThemeIcon(item.icon) && item.icon?.dark?.scheme === network_1.Schemas.file) {
                    icon = electron_1.nativeImage.createFromPath(uri_1.URI.revive(item.icon.dark).fsPath);
                    if (icon.isEmpty()) {
                        icon = undefined;
                    }
                }
                let title;
                if (typeof item.title === 'string') {
                    title = item.title;
                }
                else {
                    title = item.title.value;
                }
                return {
                    id: item.id,
                    label: !icon ? title : undefined,
                    icon
                };
            });
            return segments;
        }
        dispose() {
            super.dispose();
            // Deregister the loggers for this window
            this.loggerMainService.deregisterLoggers(this.id);
            this._win = null; // Important to dereference the window object to allow for GC
        }
    };
    exports.CodeWindow = CodeWindow;
    exports.CodeWindow = CodeWindow = CodeWindow_1 = __decorate([
        __param(1, log_1.ILogService),
        __param(2, loggerService_1.ILoggerMainService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, policy_1.IPolicyService),
        __param(5, userDataProfile_1.IUserDataProfilesMainService),
        __param(6, files_1.IFileService),
        __param(7, storageMainService_1.IApplicationStorageMainService),
        __param(8, storageMainService_1.IStorageMainService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, themeMainService_1.IThemeMainService),
        __param(11, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(12, backup_1.IBackupMainService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, dialogMainService_1.IDialogMainService),
        __param(15, lifecycleMainService_1.ILifecycleMainService),
        __param(16, productService_1.IProductService),
        __param(17, protocol_1.IProtocolMainService),
        __param(18, windows_1.IWindowsMainService),
        __param(19, state_1.IStateService)
    ], CodeWindow);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93SW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dpbmRvd3MvZWxlY3Ryb24tbWFpbi93aW5kb3dJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyRGhHLElBQVcsVUFvQlY7SUFwQkQsV0FBVyxVQUFVO1FBRXBCOzs7O1dBSUc7UUFDSCwyQ0FBSSxDQUFBO1FBRUo7OztXQUdHO1FBQ0gsdURBQVUsQ0FBQTtRQUVWOzs7V0FHRztRQUNILDZDQUFLLENBQUE7SUFDTixDQUFDLEVBcEJVLFVBQVUsS0FBVixVQUFVLFFBb0JwQjtJQUVNLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVcsU0FBUSxzQkFBVTs7aUJBRWpCLHVDQUFrQyxHQUFHLHFCQUFxQixBQUF4QixDQUF5QjtRQXlCbkYsSUFBSSxFQUFFLEtBQWEsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUdyQyxJQUFJLEdBQUcsS0FBMkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUdyRCxJQUFJLGFBQWEsS0FBYSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBRTNELElBQUksVUFBVSxLQUF5QixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUV6RSxJQUFJLGVBQWUsS0FBMEUsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFOUgsSUFBSSxPQUFPO1lBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxP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