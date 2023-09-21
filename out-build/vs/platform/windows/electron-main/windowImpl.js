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
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/platform/windows/electron-main/windowImpl", "vs/platform/backup/electron-main/backup", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/files/common/files", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/externalServices/common/marketplace", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/telemetry", "vs/base/common/themables", "vs/platform/theme/electron-main/themeMainService", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/window/electron-main/window", "vs/base/common/color", "vs/platform/policy/common/policy", "vs/platform/state/node/state", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/log/electron-main/loggerService", "vs/base/common/arrays"], function (require, exports, electron_1, async_1, cancellation_1, errorMessage_1, event_1, lifecycle_1, network_1, path_1, performance_1, platform_1, uri_1, nls_1, backup_1, configuration_1, dialogMainService_1, environmentMainService_1, argvHelper_1, files_1, lifecycleMainService_1, log_1, productService_1, protocol_1, marketplace_1, storageMainService_1, telemetry_1, themables_1, themeMainService_1, window_1, windows_1, workspace_1, workspacesManagementMainService_1, window_2, color_1, policy_1, state_1, userDataProfile_1, loggerService_1, arrays_1) {
    "use strict";
    var $S6b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$S6b = void 0;
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
    let $S6b = class $S6b extends lifecycle_1.$kc {
        static { $S6b_1 = this; }
        static { this.a = 'windowControlHeight'; }
        get id() { return this.j; }
        get win() { return this.m; }
        get lastFocusTime() { return this.n; }
        get backupPath() { return this.r?.backupPath; }
        get openedWorkspace() { return this.r?.workspace; }
        get profile() {
            if (!this.config) {
                return undefined;
            }
            const profile = this.R.profiles.find(profile => profile.id === this.config?.profiles.profile.id);
            if (this.isExtensionDevelopmentHost && profile) {
                return profile;
            }
            return this.R.getProfileForWorkspace(this.config.workspace ?? (0, workspace_1.$Ph)(this.backupPath, this.isExtensionDevelopmentHost)) ?? this.R.defaultProfile;
        }
        get remoteAuthority() { return this.r?.remoteAuthority; }
        get config() { return this.r; }
        get isExtensionDevelopmentHost() { return !!(this.r?.extensionDevelopmentPath); }
        get isExtensionTestHost() { return !!(this.r?.extensionTestsPath); }
        get isExtensionDevelopmentTestFromCli() { return this.isExtensionDevelopmentHost && this.isExtensionTestHost && !this.r?.debugId; }
        constructor(config, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab, bb, db, eb, fb, gb, hb) {
            super();
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            //#region Events
            this.b = this.B(new event_1.$fd());
            this.onWillLoad = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidSignalReady = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidTriggerSystemContextMenu = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidClose = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidDestroy = this.h.event;
            this.n = -1;
            // TODO@electron workaround for https://github.com/electron/electron/issues/35360
            // where on macOS the window will report a wrong state for `isFullScreen()` while
            // transitioning into and out of native full screen.
            this.u = undefined;
            this.w = undefined;
            this.D = false;
            this.F = [];
            this.G = [];
            this.H = undefined;
            this.I = undefined;
            this.J = this.B(this.fb.createIPCObjectUrl());
            this.M = false;
            this.ib = 0 /* ReadyState.NONE */;
            //#region create browser window
            {
                // Load window state
                const [state, hasMultipleDisplays] = this.sb(config.state);
                this.s = state;
                this.N.trace('window#ctor: using window state', state);
                // In case we are maximized or fullscreen, only show later
                // after the call to maximize/fullscreen (see below)
                const isFullscreenOrMaximized = (this.s.mode === 0 /* WindowMode.Maximized */ || this.s.mode === 3 /* WindowMode.Fullscreen */);
                const windowSettings = this.X.getValue('window');
                const options = {
                    width: this.s.width,
                    height: this.s.height,
                    x: this.s.x,
                    y: this.s.y,
                    backgroundColor: this.Y.getBackgroundColor(),
                    minWidth: window_1.$PD.WIDTH,
                    minHeight: window_1.$PD.HEIGHT,
                    show: !isFullscreenOrMaximized,
                    title: this.eb.nameLong,
                    webPreferences: {
                        preload: network_1.$2f.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                        additionalArguments: [`--vscode-window-config=${this.J.resource.toString()}`],
                        v8CacheOptions: this.P.useCodeCache ? 'bypassHeatCheck' : 'none',
                        enableWebSQL: false,
                        spellcheck: false,
                        zoomFactor: (0, window_1.$WD)(windowSettings?.zoomLevel),
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
                if (platform_1.$k) {
                    options.icon = (0, path_1.$9d)(this.P.appRoot, 'resources/linux/code.png');
                }
                else if (platform_1.$i && !this.P.isBuilt) {
                    options.icon = (0, path_1.$9d)(this.P.appRoot, 'resources/win32/code_150x150.png');
                }
                if (platform_1.$j && !this.zb()) {
                    options.fullscreenable = false; // enables simple fullscreen mode
                }
                if (platform_1.$j) {
                    options.acceptFirstMouse = true; // enabled by default
                    if (windowSettings?.clickThroughInactive === false) {
                        options.acceptFirstMouse = false;
                    }
                }
                const useNativeTabs = platform_1.$j && windowSettings?.nativeTabs === true;
                if (useNativeTabs) {
                    options.tabbingIdentifier = this.eb.nameShort; // this opts in to sierra tabs
                }
                const useCustomTitleStyle = (0, window_1.$UD)(this.X) === 'custom';
                if (useCustomTitleStyle) {
                    options.titleBarStyle = 'hidden';
                    if (!platform_1.$j) {
                        options.frame = false;
                    }
                    if ((0, window_1.$VD)(this.X)) {
                        // This logic will not perfectly guess the right colors
                        // to use on initialization, but prefer to keep things
                        // simple as it is temporary and not noticeable
                        const titleBarColor = this.Y.getWindowSplash()?.colorInfo.titleBarBackground ?? this.Y.getBackgroundColor();
                        const symbolColor = color_1.$Os.fromHex(titleBarColor).isDarker() ? '#FFFFFF' : '#000000';
                        options.titleBarOverlay = {
                            height: 29,
                            color: titleBarColor,
                            symbolColor
                        };
                        this.D = true;
                    }
                }
                // Create the browser window
                (0, performance_1.mark)('code/willCreateCodeBrowserWindow');
                this.m = new electron_1.BrowserWindow(options);
                (0, performance_1.mark)('code/didCreateCodeBrowserWindow');
                this.j = this.m.id;
                if (platform_1.$j && useCustomTitleStyle) {
                    this.m.setSheetOffset(22); // offset dialogs by the height of the custom title bar if we have any
                }
                // Update the window controls immediately based on cached values
                if (useCustomTitleStyle && ((platform_1.$i && (0, window_1.$VD)(this.X)) || platform_1.$j)) {
                    const cachedWindowControlHeight = this.hb.getItem(($S6b_1.a));
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
                if (platform_1.$i && useCustomTitleStyle) {
                    const WM_INITMENU = 0x0116; // https://docs.microsoft.com/en-us/windows/win32/menurc/wm-initmenu
                    // This sets up a listener for the window hook. This is a Windows-only API provided by electron.
                    this.m.hookWindowMessage(WM_INITMENU, () => {
                        const [x, y] = this.m.getPosition();
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
                            if (cx > 30 && cy >= 0 && cy <= Math.max(this.m.getBounds().height * 0.15, 35)) {
                                return false;
                            }
                            return true;
                        };
                        if (!shouldTriggerDefaultSystemContextMenu()) {
                            // This is necessary to make sure the native system context menu does not show up.
                            this.m.setEnabled(false);
                            this.m.setEnabled(true);
                            this.f.fire({ x: cx, y: cy });
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
                if ((platform_1.$j || platform_1.$i) && hasMultipleDisplays && (!useNativeTabs || electron_1.BrowserWindow.getAllWindows().length === 1)) {
                    if ([this.s.width, this.s.height, this.s.x, this.s.y].every(value => typeof value === 'number')) {
                        this.m.setBounds({
                            width: this.s.width,
                            height: this.s.height,
                            x: this.s.x,
                            y: this.s.y
                        });
                    }
                }
                if (isFullscreenOrMaximized) {
                    (0, performance_1.mark)('code/willMaximizeCodeWindow');
                    // this call may or may not show the window, depends
                    // on the platform: currently on Windows and Linux will
                    // show the window as active. To be on the safe side,
                    // we show the window at the end of this block.
                    this.m.maximize();
                    if (this.s.mode === 3 /* WindowMode.Fullscreen */) {
                        this.vb(true);
                    }
                    // to reduce flicker from the default window size
                    // to maximize or fullscreen, we only show after
                    this.m.show();
                    (0, performance_1.mark)('code/didMaximizeCodeWindow');
                }
                this.n = Date.now(); // since we show directly, we need to set the last focus time too
            }
            //#endregion
            // Open devtools if instructed from command line args
            if (this.P.args['open-devtools'] === true) {
                this.m.webContents.openDevTools();
            }
            // respect configured menu bar visibility
            this.pb();
            // macOS: touch bar support
            this.Db();
            // Eventing
            this.jb();
        }
        setRepresentedFilename(filename) {
            if (platform_1.$j) {
                this.m.setRepresentedFilename(filename);
            }
            else {
                this.z = filename;
            }
        }
        getRepresentedFilename() {
            if (platform_1.$j) {
                return this.m.getRepresentedFilename();
            }
            return this.z;
        }
        setDocumentEdited(edited) {
            if (platform_1.$j) {
                this.m.setDocumentEdited(edited);
            }
            this.C = edited;
        }
        isDocumentEdited() {
            if (platform_1.$j) {
                return this.m.isDocumentEdited();
            }
            return !!this.C;
        }
        focus(options) {
            // macOS: Electron > 7.x changed its behaviour to not
            // bring the application to the foreground when a window
            // is focused programmatically. Only via `app.focus` and
            // the option `steal: true` can you get the previous
            // behaviour back. The only reason to use this option is
            // when a window is getting focused while the application
            // is not in the foreground.
            if (platform_1.$j && options?.force) {
                electron_1.app.focus({ steal: true });
            }
            if (!this.m) {
                return;
            }
            if (this.m.isMinimized()) {
                this.m.restore();
            }
            this.m.focus();
        }
        setReady() {
            this.N.trace(`window#load: window reported ready (id: ${this.j})`);
            this.ib = 2 /* ReadyState.READY */;
            // inform all waiting promises that we are ready now
            while (this.F.length) {
                this.F.pop()(this);
            }
            // Events
            this.c.fire();
        }
        ready() {
            return new Promise(resolve => {
                if (this.isReady) {
                    return resolve(this);
                }
                // otherwise keep and call later when we are ready
                this.F.push(resolve);
            });
        }
        get isReady() {
            return this.ib === 2 /* ReadyState.READY */;
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
        jb() {
            // Window error conditions to handle
            this.m.on('unresponsive', () => this.mb(1 /* WindowError.UNRESPONSIVE */));
            this.m.webContents.on('render-process-gone', (event, details) => this.mb(2 /* WindowError.PROCESS_GONE */, { ...details }));
            this.m.webContents.on('did-fail-load', (event, exitCode, reason) => this.mb(3 /* WindowError.LOAD */, { reason, exitCode }));
            // Prevent windows/iframes from blocking the unload
            // through DOM events. We have our own logic for
            // unloading a window that should not be confused
            // with the DOM way.
            // (https://github.com/microsoft/vscode/issues/122736)
            this.m.webContents.on('will-prevent-unload', event => {
                event.preventDefault();
            });
            // Window close
            this.m.on('closed', () => {
                this.g.fire();
                this.dispose();
            });
            // Remember that we loaded
            this.m.webContents.on('did-finish-load', () => {
                // Associate properties from the load request if provided
                if (this.L) {
                    this.r = this.L;
                    this.L = undefined;
                }
            });
            // Window Focus
            this.m.on('focus', () => {
                this.n = Date.now();
            });
            // Window (Un)Maximize
            this.m.on('maximize', (e) => {
                if (this.r) {
                    this.r.maximized = true;
                }
                electron_1.app.emit('browser-window-maximize', e, this.m);
            });
            this.m.on('unmaximize', (e) => {
                if (this.r) {
                    this.r.maximized = false;
                }
                electron_1.app.emit('browser-window-unmaximize', e, this.m);
            });
            // Window Fullscreen
            this.m.on('enter-full-screen', () => {
                this.sendWhenReady('vscode:enterFullScreen', cancellation_1.CancellationToken.None);
                this.w?.complete();
                this.w = undefined;
            });
            this.m.on('leave-full-screen', () => {
                this.sendWhenReady('vscode:leaveFullScreen', cancellation_1.CancellationToken.None);
                this.w?.complete();
                this.w = undefined;
            });
            // Handle configuration changes
            this.B(this.X.onDidChangeConfiguration(e => this.pb(e)));
            // Handle Workspace events
            this.B(this.Z.onDidDeleteUntitledWorkspace(e => this.ob(e)));
            // Inject headers when requests are incoming
            const urls = ['https://marketplace.visualstudio.com/*', 'https://*.vsassets.io/*'];
            this.m.webContents.session.webRequest.onBeforeSendHeaders({ urls }, async (details, cb) => {
                const headers = await this.lb();
                cb({ cancel: false, requestHeaders: Object.assign(details.requestHeaders, headers) });
            });
        }
        lb() {
            if (!this.kb) {
                this.kb = (0, marketplace_1.$3o)(this.eb.version, this.eb, this.P, this.X, this.S, this.U, this.ab);
            }
            return this.kb;
        }
        async mb(type, details) {
            switch (type) {
                case 2 /* WindowError.PROCESS_GONE */:
                    this.N.error(`CodeWindow: renderer process gone (reason: ${details?.reason || '<unknown>'}, code: ${details?.exitCode || '<unknown>'})`);
                    break;
                case 1 /* WindowError.UNRESPONSIVE */:
                    this.N.error('CodeWindow: detected unresponsive');
                    break;
                case 3 /* WindowError.LOAD */:
                    this.N.error(`CodeWindow: failed to load (reason: ${details?.reason || '<unknown>'}, code: ${details?.exitCode || '<unknown>'})`);
                    break;
            }
            this.ab.publicLog2('windowerror', {
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
                        this.db.kill(1);
                        return;
                    }
                    // If we run smoke tests, want to proceed with an orderly
                    // shutdown as much as possible by destroying the window
                    // and then calling the normal `quit` routine.
                    if (this.P.args['enable-smoke-test-driver']) {
                        await this.nb(false, false);
                        this.db.quit(); // still allow for an orderly shutdown
                        return;
                    }
                    // Unresponsive
                    if (type === 1 /* WindowError.UNRESPONSIVE */) {
                        if (this.isExtensionDevelopmentHost || this.isExtensionTestHost || (this.m && this.m.webContents && this.m.webContents.isDevToolsOpened())) {
                            // TODO@electron Workaround for https://github.com/microsoft/vscode/issues/56994
                            // In certain cases the window can report unresponsiveness because a breakpoint was hit
                            // and the process is stopped executing. The most typical cases are:
                            // - devtools are opened and debugging happens
                            // - window is an extensions development host that is being debugged
                            // - window is an extension test development host that is being debugged
                            return;
                        }
                        // Show Dialog
                        const { response, checkboxChecked } = await this.bb.showMessageBox({
                            type: 'warning',
                            buttons: [
                                (0, nls_1.localize)(0, null),
                                (0, nls_1.localize)(1, null),
                                (0, nls_1.localize)(2, null)
                            ],
                            message: (0, nls_1.localize)(3, null),
                            detail: (0, nls_1.localize)(4, null),
                            checkboxLabel: this.r?.workspace ? (0, nls_1.localize)(5, null) : undefined
                        }, this.m);
                        // Handle choice
                        if (response !== 2 /* keep waiting */) {
                            const reopen = response === 0;
                            await this.nb(reopen, checkboxChecked);
                        }
                    }
                    // Process gone
                    else if (type === 2 /* WindowError.PROCESS_GONE */) {
                        let message;
                        if (!details) {
                            message = (0, nls_1.localize)(6, null);
                        }
                        else {
                            message = (0, nls_1.localize)(7, null, details.reason, details.exitCode ?? '<unknown>');
                        }
                        // Show Dialog
                        const { response, checkboxChecked } = await this.bb.showMessageBox({
                            type: 'warning',
                            buttons: [
                                this.r?.workspace ? (0, nls_1.localize)(8, null) : (0, nls_1.localize)(9, null),
                                (0, nls_1.localize)(10, null)
                            ],
                            message,
                            detail: this.r?.workspace ?
                                (0, nls_1.localize)(11, null) :
                                (0, nls_1.localize)(12, null),
                            checkboxLabel: this.r?.workspace ? (0, nls_1.localize)(13, null) : undefined
                        }, this.m);
                        // Handle choice
                        const reopen = response === 0;
                        await this.nb(reopen, checkboxChecked);
                    }
                    break;
            }
        }
        async nb(reopen, skipRestoreEditors) {
            const workspace = this.r?.workspace;
            //  check to discard editor state first
            if (skipRestoreEditors && workspace) {
                try {
                    const workspaceStorage = this.W.workspaceStorage(workspace);
                    await workspaceStorage.init();
                    workspaceStorage.delete('memento/workbench.parts.editor');
                    await workspaceStorage.close();
                }
                catch (error) {
                    this.N.error(error);
                }
            }
            // 'close' event will not be fired on destroy(), so signal crash via explicit event
            this.h.fire();
            // make sure to destroy the window as its renderer process is gone
            this.m?.destroy();
            // ask the windows service to open a new fresh window if specified
            if (reopen && this.r) {
                // We have to reconstruct a openable from the current workspace
                let uriToOpen = undefined;
                let forceEmpty = undefined;
                if ((0, workspace_1.$Lh)(workspace)) {
                    uriToOpen = { folderUri: workspace.uri };
                }
                else if ((0, workspace_1.$Qh)(workspace)) {
                    uriToOpen = { workspaceUri: workspace.configPath };
                }
                else {
                    forceEmpty = true;
                }
                // Delegate to windows service
                const window = (0, arrays_1.$Mb)(await this.gb.open({
                    context: 5 /* OpenContext.API */,
                    userEnv: this.r.userEnv,
                    cli: {
                        ...this.P.args,
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
        ob(workspace) {
            // Make sure to update our workspace config if we detect that it
            // was deleted
            if (this.r?.workspace?.id === workspace.id) {
                this.r.workspace = undefined;
            }
        }
        pb(e) {
            // Menubar
            if (!e || e.affectsConfiguration('window.menuBarVisibility')) {
                const newMenuBarVisibility = this.Ab();
                if (newMenuBarVisibility !== this.t) {
                    this.t = newMenuBarVisibility;
                    this.Bb(newMenuBarVisibility);
                }
            }
            // Proxy
            if (!e || e.affectsConfiguration('http.proxy')) {
                let newHttpProxy = (this.X.getValue('http.proxy') || '').trim()
                    || (process.env['https_proxy'] || process.env['HTTPS_PROXY'] || process.env['http_proxy'] || process.env['HTTP_PROXY'] || '').trim() // Not standardized.
                    || undefined;
                if (newHttpProxy?.endsWith('/')) {
                    newHttpProxy = newHttpProxy.substr(0, newHttpProxy.length - 1);
                }
                const newNoProxy = (process.env['no_proxy'] || process.env['NO_PROXY'] || '').trim() || undefined; // Not standardized.
                if ((newHttpProxy || '').indexOf('@') === -1 && (newHttpProxy !== this.H || newNoProxy !== this.I)) {
                    this.H = newHttpProxy;
                    this.I = newNoProxy;
                    const proxyRules = newHttpProxy || '';
                    const proxyBypassRules = newNoProxy ? `${newNoProxy},<local>` : '<local>';
                    this.N.trace(`Setting proxy to '${proxyRules}', bypassing '${proxyBypassRules}'`);
                    this.m.webContents.session.setProxy({ proxyRules, proxyBypassRules, pacScript: '' });
                }
            }
        }
        addTabbedWindow(window) {
            if (platform_1.$j && window.win) {
                this.m.addTabbedWindow(window.win);
            }
        }
        load(configuration, options = Object.create(null)) {
            this.N.trace(`window#load: attempt to load window (id: ${this.j})`);
            // Clear Document Edited if needed
            if (this.isDocumentEdited()) {
                if (!options.isReload || !this.$.isHotExitEnabled()) {
                    this.setDocumentEdited(false);
                }
            }
            // Clear Title and Filename if needed
            if (!options.isReload) {
                if (this.getRepresentedFilename()) {
                    this.setRepresentedFilename('');
                }
                this.m.setTitle(this.eb.nameLong);
            }
            // Update configuration values based on our window context
            // and set it into the config object URL for usage.
            this.qb(configuration, options);
            // If this is the first time the window is loaded, we associate the paths
            // directly with the window because we assume the loading will just work
            if (this.ib === 0 /* ReadyState.NONE */) {
                this.r = configuration;
            }
            // Otherwise, the window is currently showing a folder and if there is an
            // unload handler preventing the load, we cannot just associate the paths
            // because the loading might be vetoed. Instead we associate it later when
            // the window load event has fired.
            else {
                this.L = configuration;
            }
            // Indicate we are navigting now
            this.ib = 1 /* ReadyState.NAVIGATING */;
            // Load URL
            this.m.loadURL(network_1.$2f.asBrowserUri(`vs/code/electron-sandbox/workbench/workbench${this.P.isBuilt ? '' : '-dev'}.html`).toString(true));
            // Remember that we did load
            const wasLoaded = this.M;
            this.M = true;
            // Make window visible if it did not open in N seconds because this indicates an error
            // Only do this when running out of sources and not when running tests
            if (!this.P.isBuilt && !this.P.extensionTestsLocationURI) {
                this.B(new async_1.$Sg(() => {
                    if (this.m && !this.m.isVisible() && !this.m.isMinimized()) {
                        this.m.show();
                        this.focus({ force: true });
                        this.m.webContents.openDevTools();
                    }
                }, 10000)).schedule();
            }
            // Event
            this.b.fire({ workspace: configuration.workspace, reason: options.isReload ? 3 /* LoadReason.RELOAD */ : wasLoaded ? 2 /* LoadReason.LOAD */ : 1 /* LoadReason.INITIAL */ });
        }
        qb(configuration, options) {
            // If this window was loaded before from the command line
            // (as indicated by VSCODE_CLI environment), make sure to
            // preserve that user environment in subsequent loads,
            // unless the new configuration context was also a CLI
            // (for https://github.com/microsoft/vscode/issues/108571)
            // Also, preserve the environment if we're loading from an
            // extension development host that had its environment set
            // (for https://github.com/microsoft/vscode/issues/123508)
            const currentUserEnv = (this.r ?? this.L)?.userEnv;
            if (currentUserEnv) {
                const shouldPreserveLaunchCliEnvironment = (0, argvHelper_1.$Gl)(currentUserEnv) && !(0, argvHelper_1.$Gl)(configuration.userEnv);
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
            configuration.maximized = this.m.isMaximized();
            configuration.partsSplash = this.Y.getWindowSplash();
            // Update with latest perf marks
            (0, performance_1.mark)('code/willOpenNewWindow');
            configuration.perfMarks = (0, performance_1.getMarks)();
            // Update in config object URL for usage in renderer
            this.J.update(configuration);
        }
        async reload(cli) {
            // Copy our current config for reuse
            const configuration = Object.assign({}, this.r);
            // Validate workspace
            configuration.workspace = await this.rb(configuration);
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
            configuration.policiesData = this.Q.serialize(); // set policies data again
            configuration.continueOn = this.P.continueOn;
            configuration.profiles = {
                all: this.R.profiles,
                profile: this.profile || this.R.defaultProfile,
                home: this.R.profilesHome
            };
            configuration.logLevel = this.O.getLogLevel();
            configuration.loggers = {
                window: this.O.getRegisteredLoggers(this.id),
                global: this.O.getRegisteredLoggers()
            };
            // Load config
            this.load(configuration, { isReload: true, disableExtensions: cli?.['disable-extensions'] });
        }
        async rb(configuration) {
            // Multi folder
            if ((0, workspace_1.$Qh)(configuration.workspace)) {
                const configPath = configuration.workspace.configPath;
                if (configPath.scheme === network_1.Schemas.file) {
                    const workspaceExists = await this.S.exists(configPath);
                    if (!workspaceExists) {
                        return undefined;
                    }
                }
            }
            // Single folder
            else if ((0, workspace_1.$Lh)(configuration.workspace)) {
                const uri = configuration.workspace.uri;
                if (uri.scheme === network_1.Schemas.file) {
                    const folderExists = await this.S.exists(uri);
                    if (!folderExists) {
                        return undefined;
                    }
                }
            }
            // Workspace is valid
            return configuration.workspace;
        }
        serializeWindowState() {
            if (!this.m) {
                return (0, window_2.$m5b)();
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
                const defaultState = (0, window_2.$m5b)();
                const res = {
                    mode: 3 /* WindowMode.Fullscreen */,
                    display: display ? display.id : undefined,
                    // Still carry over window dimensions from previous sessions
                    // if we can compute it in fullscreen state.
                    // does not seem possible in all cases on Linux for example
                    // (https://github.com/microsoft/vscode/issues/58218) so we
                    // fallback to the defaults in that case.
                    width: this.s.width || defaultState.width,
                    height: this.s.height || defaultState.height,
                    x: this.s.x || 0,
                    y: this.s.y || 0
                };
                return res;
            }
            const state = Object.create(null);
            let mode;
            // get window mode
            if (!platform_1.$j && this.m.isMaximized()) {
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
                    bounds = this.m.getNormalBounds(); // make sure to persist the normal bounds when maximized to be able to restore them
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
                this.hb.setItem(($S6b_1.a), options.height);
            }
            // Windows: window control overlay (WCO)
            if (platform_1.$i && this.D) {
                this.m.setTitleBarOverlay({
                    color: options.backgroundColor?.trim() === '' ? undefined : options.backgroundColor,
                    symbolColor: options.foregroundColor?.trim() === '' ? undefined : options.foregroundColor,
                    height: options.height ? options.height - 1 : undefined // account for window border
                });
            }
            // macOS: traffic lights
            else if (platform_1.$j && options.height !== undefined) {
                const verticalOffset = (options.height - 15) / 2; // 15px is the height of the traffic lights
                if (!verticalOffset) {
                    this.m.setWindowButtonPosition(null);
                }
                else {
                    this.m.setWindowButtonPosition({ x: verticalOffset, y: verticalOffset });
                }
            }
        }
        sb(state) {
            (0, performance_1.mark)('code/willRestoreCodeWindowState');
            let hasMultipleDisplays = false;
            if (state) {
                try {
                    const displays = electron_1.screen.getAllDisplays();
                    hasMultipleDisplays = displays.length > 1;
                    state = this.tb(state, displays);
                }
                catch (err) {
                    this.N.warn(`Unexpected error validating window state: ${err}\n${err.stack}`); // somehow display API can be picky about the state to validate
                }
            }
            (0, performance_1.mark)('code/didRestoreCodeWindowState');
            return [state || (0, window_2.$m5b)(), hasMultipleDisplays];
        }
        tb(state, displays) {
            this.N.trace(`window#validateWindowState: validating window state on ${displays.length} display(s)`, state);
            if (typeof state.x !== 'number' ||
                typeof state.y !== 'number' ||
                typeof state.width !== 'number' ||
                typeof state.height !== 'number') {
                this.N.trace('window#validateWindowState: unexpected type of state values');
                return undefined;
            }
            if (state.width <= 0 || state.height <= 0) {
                this.N.trace('window#validateWindowState: unexpected negative values');
                return undefined;
            }
            // Single Monitor: be strict about x/y positioning
            // macOS & Linux: these OS seem to be pretty good in ensuring that a window is never outside of it's bounds.
            // Windows: it is possible to have a window with a size that makes it fall out of the window. our strategy
            //          is to try as much as possible to keep the window in the monitor bounds. we are not as strict as
            //          macOS and Linux and allow the window to exceed the monitor bounds as long as the window is still
            //          some pixels (128) visible on the screen for the user to drag it back.
            if (displays.length === 1) {
                const displayWorkingArea = this.ub(displays[0]);
                if (displayWorkingArea) {
                    this.N.trace('window#validateWindowState: 1 monitor working area', displayWorkingArea);
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
                    this.N.trace('window#validateWindowState: restoring fullscreen to previous display');
                    const defaults = (0, window_2.$m5b)(3 /* WindowMode.Fullscreen */); // make sure we have good values when the user restores the window
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
                displayWorkingArea = this.ub(display);
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
                this.N.trace('window#validateWindowState: multi-monitor working area', displayWorkingArea);
                return state;
            }
            return undefined;
        }
        ub(display) {
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
            const [x, y] = this.m.getPosition();
            const [width, height] = this.m.getSize();
            return { x, y, width, height };
        }
        toggleFullScreen() {
            this.vb(!this.isFullScreen);
        }
        vb(fullscreen) {
            // Set fullscreen state
            if (this.zb()) {
                this.wb(fullscreen);
            }
            else {
                this.yb(fullscreen);
            }
            // Events
            this.sendWhenReady(fullscreen ? 'vscode:enterFullScreen' : 'vscode:leaveFullScreen', cancellation_1.CancellationToken.None);
            // Respect configured menu bar visibility or default to toggle if not set
            if (this.t) {
                this.Bb(this.t, false);
            }
        }
        get isFullScreen() {
            if (platform_1.$j && typeof this.u === 'boolean') {
                return this.u;
            }
            return this.m.isFullScreen() || this.m.isSimpleFullScreen();
        }
        wb(fullscreen) {
            if (this.m.isSimpleFullScreen()) {
                this.m.setSimpleFullScreen(false);
            }
            this.xb(fullscreen);
        }
        xb(fullscreen) {
            if (platform_1.$j) {
                this.u = fullscreen;
                this.w = new async_1.$2g();
                Promise.race([
                    this.w.p,
                    (0, async_1.$Hg)(1000) // still timeout after some time in case we miss the event
                ]).finally(() => this.u = undefined);
            }
            this.m.setFullScreen(fullscreen);
        }
        yb(fullscreen) {
            if (this.m.isFullScreen()) {
                this.xb(false);
            }
            this.m.setSimpleFullScreen(fullscreen);
            this.m.webContents.focus(); // workaround issue where focus is not going into window
        }
        zb() {
            const windowConfig = this.X.getValue('window');
            if (!windowConfig || typeof windowConfig.nativeFullScreen !== 'boolean') {
                return true; // default
            }
            if (windowConfig.nativeTabs) {
                return true; // https://github.com/electron/electron/issues/16142
            }
            return windowConfig.nativeFullScreen !== false;
        }
        isMinimized() {
            return this.m.isMinimized();
        }
        Ab() {
            let menuBarVisibility = (0, window_1.$TD)(this.X);
            if (['visible', 'toggle', 'hidden'].indexOf(menuBarVisibility) < 0) {
                menuBarVisibility = 'classic';
            }
            return menuBarVisibility;
        }
        Bb(visibility, notify = true) {
            if (platform_1.$j) {
                return; // ignore for macOS platform
            }
            if (visibility === 'toggle') {
                if (notify) {
                    this.send('vscode:showInfoMessage', (0, nls_1.localize)(14, null));
                }
            }
            if (visibility === 'hidden') {
                // for some weird reason that I have no explanation for, the menu bar is not hiding when calling
                // this without timeout (see https://github.com/microsoft/vscode/issues/19777). there seems to be
                // a timing issue with us opening the first window and the menu bar getting created. somehow the
                // fact that we want to hide the menu without being able to bring it back via Alt key makes Electron
                // still show the menu. Unable to reproduce from a simple Hello World application though...
                setTimeout(() => {
                    this.Cb(visibility);
                });
            }
            else {
                this.Cb(visibility);
            }
        }
        Cb(visibility) {
            const isFullscreen = this.isFullScreen;
            switch (visibility) {
                case ('classic'):
                    this.m.setMenuBarVisibility(!isFullscreen);
                    this.m.autoHideMenuBar = isFullscreen;
                    break;
                case ('visible'):
                    this.m.setMenuBarVisibility(true);
                    this.m.autoHideMenuBar = false;
                    break;
                case ('toggle'):
                    this.m.setMenuBarVisibility(false);
                    this.m.autoHideMenuBar = true;
                    break;
                case ('hidden'):
                    this.m.setMenuBarVisibility(false);
                    this.m.autoHideMenuBar = false;
                    break;
            }
        }
        handleTitleDoubleClick() {
            // Respect system settings on mac with regards to title click on windows title
            if (platform_1.$j) {
                const action = electron_1.systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');
                switch (action) {
                    case 'Minimize':
                        this.m.minimize();
                        break;
                    case 'None':
                        break;
                    case 'Maximize':
                    default:
                        if (this.m.isMaximized()) {
                            this.m.unmaximize();
                        }
                        else {
                            this.m.maximize();
                        }
                }
            }
            // Linux/Windows: just toggle maximize/minimized state
            else {
                if (this.m.isMaximized()) {
                    this.m.unmaximize();
                }
                else {
                    this.m.maximize();
                }
            }
        }
        close() {
            this.m?.close();
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
            if (this.m) {
                if (this.m.isDestroyed() || this.m.webContents.isDestroyed()) {
                    this.N.warn(`Sending IPC message to channel '${channel}' for window that is destroyed`);
                    return;
                }
                try {
                    this.m.webContents.send(channel, ...args);
                }
                catch (error) {
                    this.N.warn(`Error sending IPC message to channel '${channel}' of window ${this.j}: ${(0, errorMessage_1.$mi)(error)}`);
                }
            }
        }
        updateTouchBar(groups) {
            if (!platform_1.$j) {
                return; // only supported on macOS
            }
            // Update segments for all groups. Setting the segments property
            // of the group directly prevents ugly flickering from happening
            this.G.forEach((touchBarGroup, index) => {
                const commands = groups[index];
                touchBarGroup.segments = this.Fb(commands);
            });
        }
        Db() {
            if (!platform_1.$j) {
                return; // only supported on macOS
            }
            // To avoid flickering, we try to reuse the touch bar group
            // as much as possible by creating a large number of groups
            // for reusing later.
            for (let i = 0; i < 10; i++) {
                const groupTouchBar = this.Eb();
                this.G.push(groupTouchBar);
            }
            this.m.setTouchBar(new electron_1.TouchBar({ items: this.G }));
        }
        Eb(items = []) {
            // Group Segments
            const segments = this.Fb(items);
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
        Fb(items = []) {
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
            this.O.deregisterLoggers(this.id);
            this.m = null; // Important to dereference the window object to allow for GC
        }
    };
    exports.$S6b = $S6b;
    exports.$S6b = $S6b = $S6b_1 = __decorate([
        __param(1, log_1.$5i),
        __param(2, loggerService_1.$u6b),
        __param(3, environmentMainService_1.$n5b),
        __param(4, policy_1.$0m),
        __param(5, userDataProfile_1.$v5b),
        __param(6, files_1.$6j),
        __param(7, storageMainService_1.$z5b),
        __param(8, storageMainService_1.$x5b),
        __param(9, configuration_1.$8h),
        __param(10, themeMainService_1.$$5b),
        __param(11, workspacesManagementMainService_1.$S5b),
        __param(12, backup_1.$G5b),
        __param(13, telemetry_1.$9k),
        __param(14, dialogMainService_1.$N5b),
        __param(15, lifecycleMainService_1.$p5b),
        __param(16, productService_1.$kj),
        __param(17, protocol_1.$e6b),
        __param(18, windows_1.$B5b),
        __param(19, state_1.$eN)
    ], $S6b);
});
//# sourceMappingURL=windowImpl.js.map