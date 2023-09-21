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
define(["require", "exports", "vs/nls!vs/workbench/electron-sandbox/window", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/objects", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/platform/telemetry/common/telemetry", "vs/platform/window/common/window", "vs/workbench/services/title/common/titleService", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/window/electron-sandbox/window", "vs/base/browser/browser", "vs/platform/commands/common/commands", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/integrity/common/integrity", "vs/base/common/platform", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/accessibility/common/accessibility", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/opener/common/opener", "vs/base/common/network", "vs/platform/native/common/native", "vs/base/common/path", "vs/platform/tunnel/common/tunnel", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/event", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/editor", "vs/platform/ipc/electron-sandbox/services", "vs/platform/progress/common/progress", "vs/base/common/errorMessage", "vs/platform/driver/electron-sandbox/driver", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/services/banner/browser/bannerService", "vs/base/common/codicons", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService"], function (require, exports, nls_1, uri_1, errors_1, objects_1, dom_1, actions_1, files_1, editor_1, editorService_1, telemetry_1, window_1, titleService_1, workbenchThemeService_1, window_2, browser_1, commands_1, globals_1, workspaceEditing_1, actions_2, menuEntryActionViewItem_1, async_1, lifecycle_1, lifecycle_2, integrity_1, platform_1, productService_1, notification_1, keybinding_1, environmentService_1, accessibility_1, workspace_1, arrays_1, configuration_1, storage_1, types_1, opener_1, network_1, native_1, path_1, tunnel_1, layoutService_1, workingCopyService_1, filesConfigurationService_1, event_1, remoteAuthorityResolver_1, editorGroupsService_1, dialogs_1, log_1, instantiation_1, editor_2, services_1, progress_1, errorMessage_1, driver_1, label_1, resources_1, bannerService_1, codicons_1, uriIdentity_1, preferences_1, utilityProcessWorkerWorkbenchService_1) {
    "use strict";
    var $5$b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5$b = void 0;
    let $5$b = $5$b_1 = class $5$b extends lifecycle_1.$kc {
        constructor(n, r, s, t, u, w, y, z, C, D, F, G, H, I, J, L, M, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab, bb, cb, db, eb, fb, gb) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
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
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.b = this.B(new lifecycle_1.$jc());
            this.f = this.B(new lifecycle_1.$jc());
            this.g = this.B(new async_1.$Sg(() => this.Eb(), 100));
            this.h = [];
            this.j = this.B(new async_1.$Sg(() => this.ub(), 50));
            this.m = false;
            this.hb();
            this.xb();
        }
        hb() {
            // Layout
            this.B((0, dom_1.$nO)(window, dom_1.$3O.RESIZE, e => this.ob(e)));
            // React to editor input changes
            this.B(this.n.onDidActiveEditorChange(() => this.Bb()));
            // Prevent opening a real URL inside the window
            for (const event of [dom_1.$3O.DRAG_OVER, dom_1.$3O.DROP]) {
                window.document.body.addEventListener(event, (e) => {
                    dom_1.$5O.stop(e);
                });
            }
            // Support `runAction` event
            globals_1.$M.on('vscode:runAction', async (event, request) => {
                const args = request.args || [];
                // If we run an action from the touchbar, we fill in the currently active resource
                // as payload because the touch bar items are context aware depending on the editor
                if (request.from === 'touchbar') {
                    const activeEditor = this.n.activeEditor;
                    if (activeEditor) {
                        const resource = editor_1.$3E.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                        if (resource) {
                            args.push(resource);
                        }
                    }
                }
                else {
                    args.push({ from: request.from });
                }
                try {
                    await this.y.executeCommand(request.id, ...args);
                    this.C.publicLog2('workbenchActionExecuted', { id: request.id, from: request.from });
                }
                catch (error) {
                    this.w.error(error);
                }
            });
            // Support runKeybinding event
            globals_1.$M.on('vscode:runKeybinding', (event, request) => {
                if (document.activeElement) {
                    this.z.dispatchByUserSettingsLabel(request.userSettingsLabel, document.activeElement);
                }
            });
            // Error reporting from main
            globals_1.$M.on('vscode:reportError', (event, error) => {
                if (error) {
                    (0, errors_1.$Y)(JSON.parse(error));
                }
            });
            // Support openFiles event for existing and new files
            globals_1.$M.on('vscode:openFiles', (event, request) => { this.Fb(request); });
            // Support addFolders event if we have a workspace opened
            globals_1.$M.on('vscode:addFolders', (event, request) => { this.Db(request); });
            // Message support
            globals_1.$M.on('vscode:showInfoMessage', (event, message) => { this.w.info(message); });
            // Shell Environment Issue Notifications
            globals_1.$M.on('vscode:showResolveShellEnvError', (event, message) => {
                this.w.prompt(notification_1.Severity.Error, message, [{
                        label: (0, nls_1.localize)(0, null),
                        run: () => this.O.relaunch()
                    },
                    {
                        label: (0, nls_1.localize)(1, null),
                        run: () => this.fb.openUserSettings({ query: 'application.shellEnvironmentResolutionTimeout' })
                    },
                    {
                        label: (0, nls_1.localize)(2, null),
                        run: () => this.N.open('https://go.microsoft.com/fwlink/?linkid=2149667')
                    }]);
            });
            globals_1.$M.on('vscode:showCredentialsError', (event, message) => {
                this.w.prompt(notification_1.Severity.Error, (0, nls_1.localize)(3, null, message), [{
                        label: (0, nls_1.localize)(4, null),
                        run: () => this.N.open('https://go.microsoft.com/fwlink/?linkid=2190713')
                    }]);
            });
            globals_1.$M.on('vscode:showTranslatedBuildWarning', (event, message) => {
                this.w.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(5, null, this.U.nameLong), [{
                        label: (0, nls_1.localize)(6, null),
                        run: () => {
                            const quality = this.U.quality;
                            const stableURL = 'https://code.visualstudio.com/docs/?dv=osx';
                            const insidersURL = 'https://code.visualstudio.com/docs/?dv=osx&build=insiders';
                            this.N.open(quality === 'stable' ? stableURL : insidersURL);
                        }
                    }]);
            });
            // Fullscreen Events
            globals_1.$M.on('vscode:enterFullScreen', async () => { (0, browser_1.$2N)(true); });
            globals_1.$M.on('vscode:leaveFullScreen', async () => { (0, browser_1.$2N)(false); });
            // Proxy Login Dialog
            globals_1.$M.on('vscode:openProxyAuthenticationDialog', async (event, payload) => {
                const rememberCredentialsKey = 'window.rememberProxyCredentials';
                const rememberCredentials = this.Y.getBoolean(rememberCredentialsKey, -1 /* StorageScope.APPLICATION */);
                const result = await this.X.input({
                    type: 'warning',
                    message: (0, nls_1.localize)(7, null),
                    primaryButton: (0, nls_1.localize)(8, null),
                    inputs: [
                        { placeholder: (0, nls_1.localize)(9, null), value: payload.username },
                        { placeholder: (0, nls_1.localize)(10, null), type: 'password', value: payload.password }
                    ],
                    detail: (0, nls_1.localize)(11, null, `${payload.authInfo.host}:${payload.authInfo.port}`),
                    checkbox: {
                        label: (0, nls_1.localize)(12, null),
                        checked: rememberCredentials
                    }
                });
                // Reply back to the channel without result to indicate
                // that the login dialog was cancelled
                if (!result.confirmed || !result.values) {
                    globals_1.$M.send(payload.replyChannel);
                }
                // Other reply back with the picked credentials
                else {
                    // Update state based on checkbox
                    if (result.checkboxChecked) {
                        this.Y.store(rememberCredentialsKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    }
                    else {
                        this.Y.remove(rememberCredentialsKey, -1 /* StorageScope.APPLICATION */);
                    }
                    // Reply back to main side with credentials
                    const [username, password] = result.values;
                    globals_1.$M.send(payload.replyChannel, { username, password, remember: !!result.checkboxChecked });
                }
            });
            // Accessibility support changed event
            globals_1.$M.on('vscode:accessibilitySupportChanged', (event, accessibilitySupportEnabled) => {
                this.L.setAccessibilitySupport(accessibilitySupportEnabled ? 2 /* AccessibilitySupport.Enabled */ : 1 /* AccessibilitySupport.Disabled */);
            });
            // Allow to update settings around allowed UNC Host
            globals_1.$M.on('vscode:configureAllowedUNCHost', (event, host) => {
                if (!platform_1.$i) {
                    return; // only supported on Windows
                }
                const allowedUncHosts = new Set();
                const configuredAllowedUncHosts = this.s.getValue('security.allowedUNCHosts') ?? [];
                if (Array.isArray(configuredAllowedUncHosts)) {
                    for (const configuredAllowedUncHost of configuredAllowedUncHosts) {
                        if (typeof configuredAllowedUncHost === 'string') {
                            allowedUncHosts.add(configuredAllowedUncHost);
                        }
                    }
                }
                if (!allowedUncHosts.has(host)) {
                    allowedUncHosts.add(host);
                    this.s.updateValue('security.allowedUNCHosts', [...allowedUncHosts.values()], 2 /* ConfigurationTarget.USER */);
                }
            });
            // Zoom level changes
            this.B(this.s.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.zoomLevel')) {
                    this.vb();
                }
                else if (e.affectsConfiguration('keyboard.touchbar.enabled') || e.affectsConfiguration('keyboard.touchbar.ignored')) {
                    this.Bb();
                }
            }));
            // Listen to visible editor changes
            this.B(this.n.onDidVisibleEditorsChange(() => this.tb()));
            // Listen to editor closing (if we run with --wait)
            const filesToWait = this.J.filesToWait;
            if (filesToWait) {
                this.Gb(filesToWait.waitMarkerFileUri, (0, arrays_1.$Fb)(filesToWait.paths.map(path => path.fileUri)));
            }
            // macOS OS integration
            if (platform_1.$j) {
                this.B(this.n.onDidActiveEditorChange(() => {
                    const file = editor_1.$3E.getOriginalUri(this.n.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file });
                    // Represented Filename
                    this.O.setRepresentedFilename(file?.fsPath ?? '');
                    // Custom title menu
                    this.wb(file?.fsPath);
                }));
            }
            // Maximize/Restore on doubleclick (for macOS custom title)
            if (platform_1.$j && (0, window_1.$UD)(this.s) === 'custom') {
                const titlePart = (0, types_1.$uf)(this.Q.getContainer("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */));
                this.B((0, dom_1.$nO)(titlePart, dom_1.$3O.DBLCLICK, e => {
                    dom_1.$5O.stop(e);
                    this.O.handleTitleDoubleClick();
                }));
            }
            // Document edited: indicate for dirty working copies
            this.B(this.R.onDidChangeDirty(workingCopy => {
                const gotDirty = workingCopy.isDirty();
                if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.S.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                    return; // do not indicate dirty of working copies that are auto saved after short delay
                }
                this.pb(gotDirty ? true : undefined);
            }));
            this.pb(undefined);
            // Detect minimize / maximize
            this.B(event_1.Event.any(event_1.Event.map(event_1.Event.filter(this.O.onDidMaximizeWindow, id => id === this.O.windowId), () => true), event_1.Event.map(event_1.Event.filter(this.O.onDidUnmaximizeWindow, id => id === this.O.windowId), () => false))(e => this.qb(e)));
            this.qb(this.J.window.maximized ?? false);
            // Detect panel position to determine minimum width
            this.B(this.Q.onDidChangePanelPosition(pos => this.sb((0, layoutService_1.$Oeb)(pos))));
            this.sb(this.Q.getPanelPosition());
            // Lifecycle
            this.B(this.H.onBeforeShutdown(e => this.ib(e)));
            this.B(this.H.onBeforeShutdownError(e => this.kb(e)));
            this.B(this.H.onWillShutdown(e => this.lb(e)));
        }
        ib({ veto, reason }) {
            if (reason === 1 /* ShutdownReason.CLOSE */) {
                const confirmBeforeCloseSetting = this.s.getValue('window.confirmBeforeClose');
                const confirmBeforeClose = confirmBeforeCloseSetting === 'always' || (confirmBeforeCloseSetting === 'keyboardOnly' && dom_1.$xP.getInstance().isModifierPressed);
                if (confirmBeforeClose) {
                    // When we need to confirm on close or quit, veto the shutdown
                    // with a long running promise to figure out whether shutdown
                    // can proceed or not.
                    return veto((async () => {
                        let actualReason = reason;
                        if (reason === 1 /* ShutdownReason.CLOSE */ && !platform_1.$j) {
                            const windowCount = await this.O.getWindowCount();
                            if (windowCount === 1) {
                                actualReason = 2 /* ShutdownReason.QUIT */; // Windows/Linux: closing last window means to QUIT
                            }
                        }
                        let confirmed = true;
                        if (confirmBeforeClose) {
                            confirmed = await this.$.invokeFunction(accessor => $5$b_1.confirmOnShutdown(accessor, actualReason));
                        }
                        // Progress for long running shutdown
                        if (confirmed) {
                            this.jb(reason);
                        }
                        return !confirmed;
                    })(), 'veto.confirmBeforeClose');
                }
            }
            // Progress for long running shutdown
            this.jb(reason);
        }
        jb(reason) {
            this.bb.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                title: this.mb(reason, false),
            }, () => {
                return event_1.Event.toPromise(event_1.Event.any(this.H.onWillShutdown, // dismiss this dialog when we shutdown
                this.H.onShutdownVeto, // or when shutdown was vetoed
                this.X.onWillShowDialog // or when a dialog asks for input
                ));
            });
        }
        static async confirmOnShutdown(accessor, reason) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const configurationService = accessor.get(configuration_1.$8h);
            const message = reason === 2 /* ShutdownReason.QUIT */ ?
                (platform_1.$j ? (0, nls_1.localize)(13, null) : (0, nls_1.localize)(14, null)) :
                (0, nls_1.localize)(15, null);
            const primaryButton = reason === 2 /* ShutdownReason.QUIT */ ?
                (platform_1.$j ? (0, nls_1.localize)(16, null) : (0, nls_1.localize)(17, null)) :
                (0, nls_1.localize)(18, null);
            const res = await dialogService.confirm({
                message,
                primaryButton,
                checkbox: {
                    label: (0, nls_1.localize)(19, null)
                }
            });
            // Update setting if checkbox checked
            if (res.checkboxChecked) {
                await configurationService.updateValue('window.confirmBeforeClose', 'never');
            }
            return res.confirmed;
        }
        kb({ error, reason }) {
            this.X.error(this.mb(reason, true), (0, nls_1.localize)(20, null, (0, errorMessage_1.$mi)(error)));
        }
        lb({ reason, force, joiners }) {
            // Delay so that the dialog only appears after timeout
            const shutdownDialogScheduler = new async_1.$Sg(() => {
                const pendingJoiners = joiners();
                this.bb.withProgress({
                    location: 20 /* ProgressLocation.Dialog */,
                    buttons: [this.nb(reason)],
                    cancellable: false,
                    sticky: true,
                    title: this.mb(reason, false),
                    detail: pendingJoiners.length > 0 ? (0, nls_1.localize)(21, null, pendingJoiners.map(joiner => `- ${joiner.label}`).join('\n')) : undefined
                }, () => {
                    return event_1.Event.toPromise(this.H.onDidShutdown); // dismiss this dialog when we actually shutdown
                }, () => {
                    force();
                });
            }, 1200);
            shutdownDialogScheduler.schedule();
            // Dispose scheduler when we actually shutdown
            event_1.Event.once(this.H.onDidShutdown)(() => shutdownDialogScheduler.dispose());
        }
        mb(reason, isError) {
            if (isError) {
                switch (reason) {
                    case 1 /* ShutdownReason.CLOSE */:
                        return (0, nls_1.localize)(22, null);
                    case 2 /* ShutdownReason.QUIT */:
                        return (0, nls_1.localize)(23, null);
                    case 3 /* ShutdownReason.RELOAD */:
                        return (0, nls_1.localize)(24, null);
                    case 4 /* ShutdownReason.LOAD */:
                        return (0, nls_1.localize)(25, null);
                }
            }
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    return (0, nls_1.localize)(26, null);
                case 2 /* ShutdownReason.QUIT */:
                    return (0, nls_1.localize)(27, null);
                case 3 /* ShutdownReason.RELOAD */:
                    return (0, nls_1.localize)(28, null);
                case 4 /* ShutdownReason.LOAD */:
                    return (0, nls_1.localize)(29, null);
            }
        }
        nb(reason) {
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    return (0, nls_1.localize)(30, null);
                case 2 /* ShutdownReason.QUIT */:
                    return (0, nls_1.localize)(31, null);
                case 3 /* ShutdownReason.RELOAD */:
                    return (0, nls_1.localize)(32, null);
                case 4 /* ShutdownReason.LOAD */:
                    return (0, nls_1.localize)(33, null);
            }
        }
        ob(e) {
            if (e.target === window) {
                this.Q.layout();
            }
        }
        pb(documentEdited) {
            let setDocumentEdited;
            if (typeof documentEdited === 'boolean') {
                setDocumentEdited = documentEdited;
            }
            else {
                setDocumentEdited = this.R.hasDirty;
            }
            if ((!this.m && setDocumentEdited) || (this.m && !setDocumentEdited)) {
                this.m = setDocumentEdited;
                this.O.setDocumentEdited(setDocumentEdited);
            }
        }
        qb(maximized) {
            this.Q.updateWindowMaximizedState(maximized);
        }
        rb(panelPosition = this.Q.getPanelPosition()) {
            // if panel is on the side, then return the larger minwidth
            const panelOnSide = panelPosition === 0 /* Position.LEFT */ || panelPosition === 1 /* Position.RIGHT */;
            if (panelOnSide) {
                return window_1.$PD.WIDTH_WITH_VERTICAL_PANEL;
            }
            return window_1.$PD.WIDTH;
        }
        sb(pos) {
            const minWidth = this.rb(pos);
            this.O.setMinimumSize(minWidth, undefined);
        }
        tb() {
            // Close when empty: check if we should close the window based on the setting
            // Overruled by: window has a workspace opened or this window is for extension development
            // or setting is disabled. Also enabled when running with --wait from the command line.
            const visibleEditorPanes = this.n.visibleEditorPanes;
            if (visibleEditorPanes.length === 0 && this.M.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && !this.J.isExtensionDevelopment) {
                const closeWhenEmpty = this.s.getValue('window.closeWhenEmpty');
                if (closeWhenEmpty || this.J.args.wait) {
                    this.j.schedule();
                }
            }
        }
        ub() {
            const visibleEditorPanes = this.n.visibleEditorPanes.length;
            if (visibleEditorPanes === 0) {
                this.O.closeWindow();
            }
        }
        vb() {
            const windowConfig = this.s.getValue();
            const windowZoomLevel = typeof windowConfig.window?.zoomLevel === 'number' ? windowConfig.window.zoomLevel : 0;
            if ((0, browser_1.$YN)() !== windowZoomLevel) {
                (0, window_2.$t7b)(windowZoomLevel);
            }
        }
        wb(filePath) {
            // Clear old menu
            this.f.clear();
            // Provide new menu if a file is opened and we are on a custom title
            if (!filePath || (0, window_1.$UD)(this.s) !== 'custom') {
                return;
            }
            // Split up filepath into segments
            const segments = filePath.split(path_1.$6d.sep);
            for (let i = segments.length; i > 0; i--) {
                const isFile = (i === segments.length);
                let pathOffset = i;
                if (!isFile) {
                    pathOffset++; // for segments which are not the file name we want to open the folder
                }
                const path = uri_1.URI.file(segments.slice(0, pathOffset).join(path_1.$6d.sep));
                let label;
                if (!isFile) {
                    label = this.cb.getUriBasenameLabel((0, resources_1.$hg)(path));
                }
                else {
                    label = this.cb.getUriBasenameLabel(path);
                }
                const commandId = `workbench.action.revealPathInFinder${i}`;
                this.f.add(commands_1.$Gr.registerCommand(commandId, () => this.O.showItemInFolder(path.fsPath)));
                this.f.add(actions_2.$Tu.appendMenuItem(actions_2.$Ru.TitleBarTitleContext, { command: { id: commandId, title: label || path_1.$6d.sep }, order: -i }));
            }
        }
        xb() {
            // Handle open calls
            this.Ab();
            // Notify some services about lifecycle phases
            this.H.when(2 /* LifecyclePhase.Ready */).then(() => this.O.notifyReady());
            this.H.when(3 /* LifecyclePhase.Restored */).then(() => {
                this.ab.notifyRestored();
                this.gb.notifyRestored();
            });
            // Check for situations that are worth warning the user about
            this.yb();
            // Touchbar menu (if enabled)
            this.Bb();
            // Smoke Test Driver
            if (this.J.enableSmokeTestDriver) {
                this.zb();
            }
        }
        async yb() {
            // Check for cyclic dependencies
            if (typeof require.hasDependencyCycle === 'function' && require.hasDependencyCycle()) {
                if (platform_1.$s) {
                    this.Z.error('Error: There is a dependency cycle in the AMD modules that needs to be resolved!');
                    this.O.exit(37); // running on a build machine, just exit without showing a dialog
                }
                else {
                    this.X.error((0, nls_1.localize)(34, null));
                    this.O.openDevTools();
                }
            }
            // After restored phase is fine for the following ones
            await this.H.when(3 /* LifecyclePhase.Restored */);
            // Integrity / Root warning
            (async () => {
                const isAdmin = await this.O.isAdmin();
                const { isPure } = await this.I.isPure();
                // Update to title
                this.t.updateProperties({ isPure, isAdmin });
                // Show warning message (unix only)
                if (isAdmin && !platform_1.$i) {
                    this.w.warn((0, nls_1.localize)(35, null, this.U.nameShort));
                }
            })();
            // Installation Dir Warning
            if (this.J.isBuilt) {
                let installLocationUri;
                if (platform_1.$j) {
                    // appRoot = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app
                    installLocationUri = (0, resources_1.$hg)((0, resources_1.$hg)((0, resources_1.$hg)(uri_1.URI.file(this.J.appRoot))));
                }
                else {
                    // appRoot = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\resources\app
                    // appRoot = /usr/share/code-insiders/resources/app
                    installLocationUri = (0, resources_1.$hg)((0, resources_1.$hg)(uri_1.URI.file(this.J.appRoot)));
                }
                for (const folder of this.M.getWorkspace().folders) {
                    if (this.eb.extUri.isEqualOrParent(folder.uri, installLocationUri)) {
                        this.db.show({
                            id: 'appRootWarning.banner',
                            message: (0, nls_1.localize)(36, null, this.cb.getUriLabel(installLocationUri)),
                            icon: codicons_1.$Pj.warning
                        });
                        break;
                    }
                }
            }
            // Windows 32-bit warning
            if (platform_1.$i && this.J.os.arch === 'ia32') {
                const message = (0, nls_1.localize)(37, null, this.U.nameLong);
                const actions = [{
                        label: (0, nls_1.localize)(38, null),
                        href: 'https://aka.ms/vscode-faq-old-windows'
                    }];
                this.db.show({
                    id: 'windows32eol.banner',
                    message,
                    ariaLabel: (0, nls_1.localize)(39, null, message),
                    actions,
                    icon: codicons_1.$Pj.warning
                });
                this.w.prompt(notification_1.Severity.Warning, message, [{
                        label: (0, nls_1.localize)(40, null),
                        run: () => this.N.open(uri_1.URI.parse('https://aka.ms/vscode-faq-old-windows'))
                    }], {
                    neverShowAgain: { id: 'windows32eol', isSecondary: true, scope: notification_1.NeverShowAgainScope.APPLICATION },
                    priority: notification_1.NotificationPriority.URGENT,
                    sticky: true
                });
            }
            // macOS 10.13 and 10.14 warning
            if (platform_1.$j) {
                const majorVersion = this.J.os.release.split('.')[0];
                const eolReleases = new Map([
                    ['17', 'macOS High Sierra'],
                    ['18', 'macOS Mojave'],
                ]);
                if (eolReleases.has(majorVersion)) {
                    const message = (0, nls_1.localize)(41, null, this.U.nameLong, eolReleases.get(majorVersion));
                    const actions = [{
                            label: (0, nls_1.localize)(42, null),
                            href: 'https://aka.ms/vscode-faq-old-macOS'
                        }];
                    this.db.show({
                        id: 'macoseol.banner',
                        message,
                        ariaLabel: (0, nls_1.localize)(43, null, message),
                        actions,
                        icon: codicons_1.$Pj.warning
                    });
                    this.w.prompt(notification_1.Severity.Warning, message, [{
                            label: (0, nls_1.localize)(44, null),
                            run: () => this.N.open(uri_1.URI.parse('https://aka.ms/vscode-faq-old-macOS'))
                        }], {
                        neverShowAgain: { id: 'macoseol', isSecondary: true, scope: notification_1.NeverShowAgainScope.APPLICATION },
                        priority: notification_1.NotificationPriority.URGENT,
                        sticky: true
                    });
                }
            }
            // Slow shell environment progress indicator
            const shellEnv = globals_1.$P.shellEnv();
            this.bb.withProgress({
                title: (0, nls_1.localize)(45, null),
                location: 10 /* ProgressLocation.Window */,
                delay: 1600,
                buttons: [(0, nls_1.localize)(46, null)]
            }, () => shellEnv, () => this.N.open('https://go.microsoft.com/fwlink/?linkid=2149667'));
        }
        zb() {
            const that = this;
            let pendingQuit = false;
            (0, driver_1.$s$b)(this.$, {
                async exitApplication() {
                    if (pendingQuit) {
                        that.Z.info('[driver] not handling exitApplication() due to pending quit() call');
                        return;
                    }
                    that.Z.info('[driver] handling exitApplication()');
                    pendingQuit = true;
                    return that.O.quit();
                }
            });
        }
        Ab() {
            // Block window.open() calls
            window.open = function () {
                throw new Error('Prevented call to window.open(). Use IOpenerService instead!');
            };
            // Handle external open() calls
            this.N.setDefaultExternalOpener({
                openExternal: async (href) => {
                    const success = await this.O.openExternal(href);
                    if (!success) {
                        const fileCandidate = uri_1.URI.parse(href);
                        if (fileCandidate.scheme === network_1.Schemas.file) {
                            // if opening failed, and this is a file, we can still try to reveal it
                            await this.O.showItemInFolder(fileCandidate.fsPath);
                        }
                    }
                    return true;
                }
            });
            // Register external URI resolver
            this.N.registerExternalUriResolver({
                resolveExternalUri: async (uri, options) => {
                    if (options?.allowTunneling) {
                        const portMappingRequest = (0, tunnel_1.$Zz)(uri);
                        if (portMappingRequest) {
                            const remoteAuthority = this.J.remoteAuthority;
                            const addressProvider = remoteAuthority ? {
                                getAddress: async () => {
                                    return (await this.W.resolveAuthority(remoteAuthority)).authority;
                                }
                            } : undefined;
                            let tunnel = await this.P.getExistingTunnel(portMappingRequest.address, portMappingRequest.port);
                            if (!tunnel || (typeof tunnel === 'string')) {
                                tunnel = await this.P.openTunnel(addressProvider, portMappingRequest.address, portMappingRequest.port);
                            }
                            if (tunnel && (typeof tunnel !== 'string')) {
                                const constTunnel = tunnel;
                                const addressAsUri = uri_1.URI.parse(constTunnel.localAddress);
                                const resolved = addressAsUri.scheme.startsWith(uri.scheme) ? addressAsUri : uri.with({ authority: constTunnel.localAddress });
                                return {
                                    resolved,
                                    dispose: () => constTunnel.dispose(),
                                };
                            }
                        }
                    }
                    if (!options?.openExternal) {
                        const canHandleResource = await this.F.canHandleResource(uri);
                        if (canHandleResource) {
                            return {
                                resolved: uri_1.URI.from({
                                    scheme: this.U.urlProtocol,
                                    path: 'workspace',
                                    query: uri.toString()
                                }),
                                dispose() { }
                            };
                        }
                    }
                    return undefined;
                }
            });
        }
        Bb() {
            if (!platform_1.$j) {
                return; // macOS only
            }
            // Dispose old
            this.b.clear();
            this.a = undefined;
            // Create new (delayed)
            const scheduler = this.b.add(new async_1.$Sg(() => this.Cb(scheduler), 300));
            scheduler.schedule();
        }
        Cb(scheduler) {
            if (!this.a) {
                const scopedContextKeyService = this.n.activeEditorPane?.scopedContextKeyService || this.r.activeGroup.scopedContextKeyService;
                this.a = this.G.createMenu(actions_2.$Ru.TouchBarContext, scopedContextKeyService);
                this.b.add(this.a);
                this.b.add(this.a.onDidChange(() => scheduler.schedule()));
            }
            const actions = [];
            const disabled = this.s.getValue('keyboard.touchbar.enabled') === false;
            const touchbarIgnored = this.s.getValue('keyboard.touchbar.ignored');
            const ignoredItems = Array.isArray(touchbarIgnored) ? touchbarIgnored : [];
            // Fill actions into groups respecting order
            (0, menuEntryActionViewItem_1.$B3)(this.a, undefined, actions);
            // Convert into command action multi array
            const items = [];
            let group = [];
            if (!disabled) {
                for (const action of actions) {
                    // Command
                    if (action instanceof actions_2.$Vu) {
                        if (ignoredItems.indexOf(action.item.id) >= 0) {
                            continue; // ignored
                        }
                        group.push(action.item);
                    }
                    // Separator
                    else if (action instanceof actions_1.$ii) {
                        if (group.length) {
                            items.push(group);
                        }
                        group = [];
                    }
                }
                if (group.length) {
                    items.push(group);
                }
            }
            // Only update if the actions have changed
            if (!(0, objects_1.$Zm)(this.c, items)) {
                this.c = items;
                this.O.updateTouchBar(items);
            }
        }
        Db(request) {
            // Buffer all pending requests
            this.h.push(...request.foldersToAdd.map(folder => uri_1.URI.revive(folder)));
            // Delay the adding of folders a bit to buffer in case more requests are coming
            if (!this.g.isScheduled()) {
                this.g.schedule();
            }
        }
        Eb() {
            const foldersToAdd = [];
            for (const folder of this.h) {
                foldersToAdd.push(({ uri: folder }));
            }
            this.h = [];
            this.D.addFolders(foldersToAdd);
        }
        async Fb(request) {
            const diffMode = !!(request.filesToDiff && (request.filesToDiff.length === 2));
            const mergeMode = !!(request.filesToMerge && (request.filesToMerge.length === 4));
            const inputs = (0, arrays_1.$Fb)(await (0, editor_1.$4E)(mergeMode ? request.filesToMerge : diffMode ? request.filesToDiff : request.filesToOpenOrCreate, this.F, this.Z));
            if (inputs.length) {
                const openedEditorPanes = await this.Hb(inputs, diffMode, mergeMode);
                if (request.filesToWait) {
                    // In wait mode, listen to changes to the editors and wait until the files
                    // are closed that the user wants to wait for. When this happens we delete
                    // the wait marker file to signal to the outside that editing is done.
                    // However, it is possible that opening of the editors failed, as such we
                    // check for whether editor panes got opened and otherwise delete the marker
                    // right away.
                    if (openedEditorPanes.length) {
                        return this.Gb(uri_1.URI.revive(request.filesToWait.waitMarkerFileUri), (0, arrays_1.$Fb)(request.filesToWait.paths.map(path => uri_1.URI.revive(path.fileUri))));
                    }
                    else {
                        return this.F.del(uri_1.URI.revive(request.filesToWait.waitMarkerFileUri));
                    }
                }
            }
        }
        async Gb(waitMarkerFile, resourcesToWaitFor) {
            // Wait for the resources to be closed in the text editor...
            await this.$.invokeFunction(accessor => (0, editor_2.$bU)(accessor, resourcesToWaitFor));
            // ...before deleting the wait marker file
            await this.F.del(waitMarkerFile);
        }
        async Hb(resources, diffMode, mergeMode) {
            const editors = [];
            if (mergeMode && (0, editor_1.$NE)(resources[0]) && (0, editor_1.$NE)(resources[1]) && (0, editor_1.$NE)(resources[2]) && (0, editor_1.$NE)(resources[3])) {
                const mergeEditor = {
                    input1: { resource: resources[0].resource },
                    input2: { resource: resources[1].resource },
                    base: { resource: resources[2].resource },
                    result: { resource: resources[3].resource },
                    options: { pinned: true }
                };
                editors.push(mergeEditor);
            }
            else if (diffMode && (0, editor_1.$NE)(resources[0]) && (0, editor_1.$NE)(resources[1])) {
                const diffEditor = {
                    original: { resource: resources[0].resource },
                    modified: { resource: resources[1].resource },
                    options: { pinned: true }
                };
                editors.push(diffEditor);
            }
            else {
                editors.push(...resources);
            }
            return this.n.openEditors(editors, undefined, { validateTrust: true });
        }
    };
    exports.$5$b = $5$b;
    exports.$5$b = $5$b = $5$b_1 = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, editorGroupsService_1.$5C),
        __param(2, configuration_1.$8h),
        __param(3, titleService_1.$ZRb),
        __param(4, workbenchThemeService_1.$egb),
        __param(5, notification_1.$Yu),
        __param(6, commands_1.$Fr),
        __param(7, keybinding_1.$2D),
        __param(8, telemetry_1.$9k),
        __param(9, workspaceEditing_1.$pU),
        __param(10, files_1.$6j),
        __param(11, actions_2.$Su),
        __param(12, lifecycle_2.$7y),
        __param(13, integrity_1.$b3b),
        __param(14, environmentService_1.$1$b),
        __param(15, accessibility_1.$1r),
        __param(16, workspace_1.$Kh),
        __param(17, opener_1.$NT),
        __param(18, native_1.$05b),
        __param(19, tunnel_1.$Wz),
        __param(20, layoutService_1.$Meb),
        __param(21, workingCopyService_1.$TC),
        __param(22, filesConfigurationService_1.$yD),
        __param(23, productService_1.$kj),
        __param(24, remoteAuthorityResolver_1.$Jk),
        __param(25, dialogs_1.$oA),
        __param(26, storage_1.$Vo),
        __param(27, log_1.$5i),
        __param(28, instantiation_1.$Ah),
        __param(29, services_1.$A7b),
        __param(30, progress_1.$2u),
        __param(31, label_1.$Vz),
        __param(32, bannerService_1.$_xb),
        __param(33, uriIdentity_1.$Ck),
        __param(34, preferences_1.$BE),
        __param(35, utilityProcessWorkerWorkbenchService_1.$3$b)
    ], $5$b);
});
//# sourceMappingURL=window.js.map