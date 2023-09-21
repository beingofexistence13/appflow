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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/objects", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/platform/telemetry/common/telemetry", "vs/platform/window/common/window", "vs/workbench/services/title/common/titleService", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/window/electron-sandbox/window", "vs/base/browser/browser", "vs/platform/commands/common/commands", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/integrity/common/integrity", "vs/base/common/platform", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/accessibility/common/accessibility", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/opener/common/opener", "vs/base/common/network", "vs/platform/native/common/native", "vs/base/common/path", "vs/platform/tunnel/common/tunnel", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/event", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/editor", "vs/platform/ipc/electron-sandbox/services", "vs/platform/progress/common/progress", "vs/base/common/errorMessage", "vs/platform/driver/electron-sandbox/driver", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/services/banner/browser/bannerService", "vs/base/common/codicons", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService"], function (require, exports, nls_1, uri_1, errors_1, objects_1, dom_1, actions_1, files_1, editor_1, editorService_1, telemetry_1, window_1, titleService_1, workbenchThemeService_1, window_2, browser_1, commands_1, globals_1, workspaceEditing_1, actions_2, menuEntryActionViewItem_1, async_1, lifecycle_1, lifecycle_2, integrity_1, platform_1, productService_1, notification_1, keybinding_1, environmentService_1, accessibility_1, workspace_1, arrays_1, configuration_1, storage_1, types_1, opener_1, network_1, native_1, path_1, tunnel_1, layoutService_1, workingCopyService_1, filesConfigurationService_1, event_1, remoteAuthorityResolver_1, editorGroupsService_1, dialogs_1, log_1, instantiation_1, editor_2, services_1, progress_1, errorMessage_1, driver_1, label_1, resources_1, bannerService_1, codicons_1, uriIdentity_1, preferences_1, utilityProcessWorkerWorkbenchService_1) {
    "use strict";
    var NativeWindow_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWindow = void 0;
    let NativeWindow = NativeWindow_1 = class NativeWindow extends lifecycle_1.Disposable {
        constructor(editorService, editorGroupService, configurationService, titleService, themeService, notificationService, commandService, keybindingService, telemetryService, workspaceEditingService, fileService, menuService, lifecycleService, integrityService, environmentService, accessibilityService, contextService, openerService, nativeHostService, tunnelService, layoutService, workingCopyService, filesConfigurationService, productService, remoteAuthorityResolverService, dialogService, storageService, logService, instantiationService, sharedProcessService, progressService, labelService, bannerService, uriIdentityService, preferencesService, utilityProcessWorkerWorkbenchService) {
            super();
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.titleService = titleService;
            this.themeService = themeService;
            this.notificationService = notificationService;
            this.commandService = commandService;
            this.keybindingService = keybindingService;
            this.telemetryService = telemetryService;
            this.workspaceEditingService = workspaceEditingService;
            this.fileService = fileService;
            this.menuService = menuService;
            this.lifecycleService = lifecycleService;
            this.integrityService = integrityService;
            this.environmentService = environmentService;
            this.accessibilityService = accessibilityService;
            this.contextService = contextService;
            this.openerService = openerService;
            this.nativeHostService = nativeHostService;
            this.tunnelService = tunnelService;
            this.layoutService = layoutService;
            this.workingCopyService = workingCopyService;
            this.filesConfigurationService = filesConfigurationService;
            this.productService = productService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.dialogService = dialogService;
            this.storageService = storageService;
            this.logService = logService;
            this.instantiationService = instantiationService;
            this.sharedProcessService = sharedProcessService;
            this.progressService = progressService;
            this.labelService = labelService;
            this.bannerService = bannerService;
            this.uriIdentityService = uriIdentityService;
            this.preferencesService = preferencesService;
            this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
            this.touchBarDisposables = this._register(new lifecycle_1.DisposableStore());
            this.customTitleContextMenuDisposable = this._register(new lifecycle_1.DisposableStore());
            this.addFoldersScheduler = this._register(new async_1.RunOnceScheduler(() => this.doAddFolders(), 100));
            this.pendingFoldersToAdd = [];
            this.closeEmptyWindowScheduler = this._register(new async_1.RunOnceScheduler(() => this.onDidAllEditorsClose(), 50));
            this.isDocumentedEdited = false;
            this.registerListeners();
            this.create();
        }
        registerListeners() {
            // Layout
            this._register((0, dom_1.addDisposableListener)(window, dom_1.EventType.RESIZE, e => this.onWindowResize(e)));
            // React to editor input changes
            this._register(this.editorService.onDidActiveEditorChange(() => this.updateTouchbarMenu()));
            // Prevent opening a real URL inside the window
            for (const event of [dom_1.EventType.DRAG_OVER, dom_1.EventType.DROP]) {
                window.document.body.addEventListener(event, (e) => {
                    dom_1.EventHelper.stop(e);
                });
            }
            // Support `runAction` event
            globals_1.ipcRenderer.on('vscode:runAction', async (event, request) => {
                const args = request.args || [];
                // If we run an action from the touchbar, we fill in the currently active resource
                // as payload because the touch bar items are context aware depending on the editor
                if (request.from === 'touchbar') {
                    const activeEditor = this.editorService.activeEditor;
                    if (activeEditor) {
                        const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                        if (resource) {
                            args.push(resource);
                        }
                    }
                }
                else {
                    args.push({ from: request.from });
                }
                try {
                    await this.commandService.executeCommand(request.id, ...args);
                    this.telemetryService.publicLog2('workbenchActionExecuted', { id: request.id, from: request.from });
                }
                catch (error) {
                    this.notificationService.error(error);
                }
            });
            // Support runKeybinding event
            globals_1.ipcRenderer.on('vscode:runKeybinding', (event, request) => {
                if (document.activeElement) {
                    this.keybindingService.dispatchByUserSettingsLabel(request.userSettingsLabel, document.activeElement);
                }
            });
            // Error reporting from main
            globals_1.ipcRenderer.on('vscode:reportError', (event, error) => {
                if (error) {
                    (0, errors_1.onUnexpectedError)(JSON.parse(error));
                }
            });
            // Support openFiles event for existing and new files
            globals_1.ipcRenderer.on('vscode:openFiles', (event, request) => { this.onOpenFiles(request); });
            // Support addFolders event if we have a workspace opened
            globals_1.ipcRenderer.on('vscode:addFolders', (event, request) => { this.onAddFoldersRequest(request); });
            // Message support
            globals_1.ipcRenderer.on('vscode:showInfoMessage', (event, message) => { this.notificationService.info(message); });
            // Shell Environment Issue Notifications
            globals_1.ipcRenderer.on('vscode:showResolveShellEnvError', (event, message) => {
                this.notificationService.prompt(notification_1.Severity.Error, message, [{
                        label: (0, nls_1.localize)('restart', "Restart"),
                        run: () => this.nativeHostService.relaunch()
                    },
                    {
                        label: (0, nls_1.localize)('configure', "Configure"),
                        run: () => this.preferencesService.openUserSettings({ query: 'application.shellEnvironmentResolutionTimeout' })
                    },
                    {
                        label: (0, nls_1.localize)('learnMore', "Learn More"),
                        run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2149667')
                    }]);
            });
            globals_1.ipcRenderer.on('vscode:showCredentialsError', (event, message) => {
                this.notificationService.prompt(notification_1.Severity.Error, (0, nls_1.localize)('keychainWriteError', "Writing login information to the keychain failed with error '{0}'.", message), [{
                        label: (0, nls_1.localize)('troubleshooting', "Troubleshooting Guide"),
                        run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2190713')
                    }]);
            });
            globals_1.ipcRenderer.on('vscode:showTranslatedBuildWarning', (event, message) => {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)("runningTranslated", "You are running an emulated version of {0}. For better performance download the native arm64 version of {0} build for your machine.", this.productService.nameLong), [{
                        label: (0, nls_1.localize)('downloadArmBuild', "Download"),
                        run: () => {
                            const quality = this.productService.quality;
                            const stableURL = 'https://code.visualstudio.com/docs/?dv=osx';
                            const insidersURL = 'https://code.visualstudio.com/docs/?dv=osx&build=insiders';
                            this.openerService.open(quality === 'stable' ? stableURL : insidersURL);
                        }
                    }]);
            });
            // Fullscreen Events
            globals_1.ipcRenderer.on('vscode:enterFullScreen', async () => { (0, browser_1.setFullscreen)(true); });
            globals_1.ipcRenderer.on('vscode:leaveFullScreen', async () => { (0, browser_1.setFullscreen)(false); });
            // Proxy Login Dialog
            globals_1.ipcRenderer.on('vscode:openProxyAuthenticationDialog', async (event, payload) => {
                const rememberCredentialsKey = 'window.rememberProxyCredentials';
                const rememberCredentials = this.storageService.getBoolean(rememberCredentialsKey, -1 /* StorageScope.APPLICATION */);
                const result = await this.dialogService.input({
                    type: 'warning',
                    message: (0, nls_1.localize)('proxyAuthRequired', "Proxy Authentication Required"),
                    primaryButton: (0, nls_1.localize)({ key: 'loginButton', comment: ['&& denotes a mnemonic'] }, "&&Log In"),
                    inputs: [
                        { placeholder: (0, nls_1.localize)('username', "Username"), value: payload.username },
                        { placeholder: (0, nls_1.localize)('password', "Password"), type: 'password', value: payload.password }
                    ],
                    detail: (0, nls_1.localize)('proxyDetail', "The proxy {0} requires a username and password.", `${payload.authInfo.host}:${payload.authInfo.port}`),
                    checkbox: {
                        label: (0, nls_1.localize)('rememberCredentials', "Remember my credentials"),
                        checked: rememberCredentials
                    }
                });
                // Reply back to the channel without result to indicate
                // that the login dialog was cancelled
                if (!result.confirmed || !result.values) {
                    globals_1.ipcRenderer.send(payload.replyChannel);
                }
                // Other reply back with the picked credentials
                else {
                    // Update state based on checkbox
                    if (result.checkboxChecked) {
                        this.storageService.store(rememberCredentialsKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    }
                    else {
                        this.storageService.remove(rememberCredentialsKey, -1 /* StorageScope.APPLICATION */);
                    }
                    // Reply back to main side with credentials
                    const [username, password] = result.values;
                    globals_1.ipcRenderer.send(payload.replyChannel, { username, password, remember: !!result.checkboxChecked });
                }
            });
            // Accessibility support changed event
            globals_1.ipcRenderer.on('vscode:accessibilitySupportChanged', (event, accessibilitySupportEnabled) => {
                this.accessibilityService.setAccessibilitySupport(accessibilitySupportEnabled ? 2 /* AccessibilitySupport.Enabled */ : 1 /* AccessibilitySupport.Disabled */);
            });
            // Allow to update settings around allowed UNC Host
            globals_1.ipcRenderer.on('vscode:configureAllowedUNCHost', (event, host) => {
                if (!platform_1.isWindows) {
                    return; // only supported on Windows
                }
                const allowedUncHosts = new Set();
                const configuredAllowedUncHosts = this.configurationService.getValue('security.allowedUNCHosts') ?? [];
                if (Array.isArray(configuredAllowedUncHosts)) {
                    for (const configuredAllowedUncHost of configuredAllowedUncHosts) {
                        if (typeof configuredAllowedUncHost === 'string') {
                            allowedUncHosts.add(configuredAllowedUncHost);
                        }
                    }
                }
                if (!allowedUncHosts.has(host)) {
                    allowedUncHosts.add(host);
                    this.configurationService.updateValue('security.allowedUNCHosts', [...allowedUncHosts.values()], 2 /* ConfigurationTarget.USER */);
                }
            });
            // Zoom level changes
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.zoomLevel')) {
                    this.updateWindowZoomLevel();
                }
                else if (e.affectsConfiguration('keyboard.touchbar.enabled') || e.affectsConfiguration('keyboard.touchbar.ignored')) {
                    this.updateTouchbarMenu();
                }
            }));
            // Listen to visible editor changes
            this._register(this.editorService.onDidVisibleEditorsChange(() => this.onDidChangeVisibleEditors()));
            // Listen to editor closing (if we run with --wait)
            const filesToWait = this.environmentService.filesToWait;
            if (filesToWait) {
                this.trackClosedWaitFiles(filesToWait.waitMarkerFileUri, (0, arrays_1.coalesce)(filesToWait.paths.map(path => path.fileUri)));
            }
            // macOS OS integration
            if (platform_1.isMacintosh) {
                this._register(this.editorService.onDidActiveEditorChange(() => {
                    const file = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file });
                    // Represented Filename
                    this.nativeHostService.setRepresentedFilename(file?.fsPath ?? '');
                    // Custom title menu
                    this.provideCustomTitleContextMenu(file?.fsPath);
                }));
            }
            // Maximize/Restore on doubleclick (for macOS custom title)
            if (platform_1.isMacintosh && (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                const titlePart = (0, types_1.assertIsDefined)(this.layoutService.getContainer("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */));
                this._register((0, dom_1.addDisposableListener)(titlePart, dom_1.EventType.DBLCLICK, e => {
                    dom_1.EventHelper.stop(e);
                    this.nativeHostService.handleTitleDoubleClick();
                }));
            }
            // Document edited: indicate for dirty working copies
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => {
                const gotDirty = workingCopy.isDirty();
                if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                    return; // do not indicate dirty of working copies that are auto saved after short delay
                }
                this.updateDocumentEdited(gotDirty ? true : undefined);
            }));
            this.updateDocumentEdited(undefined);
            // Detect minimize / maximize
            this._register(event_1.Event.any(event_1.Event.map(event_1.Event.filter(this.nativeHostService.onDidMaximizeWindow, id => id === this.nativeHostService.windowId), () => true), event_1.Event.map(event_1.Event.filter(this.nativeHostService.onDidUnmaximizeWindow, id => id === this.nativeHostService.windowId), () => false))(e => this.onDidChangeWindowMaximized(e)));
            this.onDidChangeWindowMaximized(this.environmentService.window.maximized ?? false);
            // Detect panel position to determine minimum width
            this._register(this.layoutService.onDidChangePanelPosition(pos => this.onDidChangePanelPosition((0, layoutService_1.positionFromString)(pos))));
            this.onDidChangePanelPosition(this.layoutService.getPanelPosition());
            // Lifecycle
            this._register(this.lifecycleService.onBeforeShutdown(e => this.onBeforeShutdown(e)));
            this._register(this.lifecycleService.onBeforeShutdownError(e => this.onBeforeShutdownError(e)));
            this._register(this.lifecycleService.onWillShutdown(e => this.onWillShutdown(e)));
        }
        onBeforeShutdown({ veto, reason }) {
            if (reason === 1 /* ShutdownReason.CLOSE */) {
                const confirmBeforeCloseSetting = this.configurationService.getValue('window.confirmBeforeClose');
                const confirmBeforeClose = confirmBeforeCloseSetting === 'always' || (confirmBeforeCloseSetting === 'keyboardOnly' && dom_1.ModifierKeyEmitter.getInstance().isModifierPressed);
                if (confirmBeforeClose) {
                    // When we need to confirm on close or quit, veto the shutdown
                    // with a long running promise to figure out whether shutdown
                    // can proceed or not.
                    return veto((async () => {
                        let actualReason = reason;
                        if (reason === 1 /* ShutdownReason.CLOSE */ && !platform_1.isMacintosh) {
                            const windowCount = await this.nativeHostService.getWindowCount();
                            if (windowCount === 1) {
                                actualReason = 2 /* ShutdownReason.QUIT */; // Windows/Linux: closing last window means to QUIT
                            }
                        }
                        let confirmed = true;
                        if (confirmBeforeClose) {
                            confirmed = await this.instantiationService.invokeFunction(accessor => NativeWindow_1.confirmOnShutdown(accessor, actualReason));
                        }
                        // Progress for long running shutdown
                        if (confirmed) {
                            this.progressOnBeforeShutdown(reason);
                        }
                        return !confirmed;
                    })(), 'veto.confirmBeforeClose');
                }
            }
            // Progress for long running shutdown
            this.progressOnBeforeShutdown(reason);
        }
        progressOnBeforeShutdown(reason) {
            this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                title: this.toShutdownLabel(reason, false),
            }, () => {
                return event_1.Event.toPromise(event_1.Event.any(this.lifecycleService.onWillShutdown, // dismiss this dialog when we shutdown
                this.lifecycleService.onShutdownVeto, // or when shutdown was vetoed
                this.dialogService.onWillShowDialog // or when a dialog asks for input
                ));
            });
        }
        static async confirmOnShutdown(accessor, reason) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const message = reason === 2 /* ShutdownReason.QUIT */ ?
                (platform_1.isMacintosh ? (0, nls_1.localize)('quitMessageMac', "Are you sure you want to quit?") : (0, nls_1.localize)('quitMessage', "Are you sure you want to exit?")) :
                (0, nls_1.localize)('closeWindowMessage', "Are you sure you want to close the window?");
            const primaryButton = reason === 2 /* ShutdownReason.QUIT */ ?
                (platform_1.isMacintosh ? (0, nls_1.localize)({ key: 'quitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Quit") : (0, nls_1.localize)({ key: 'exitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Exit")) :
                (0, nls_1.localize)({ key: 'closeWindowButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Close Window");
            const res = await dialogService.confirm({
                message,
                primaryButton,
                checkbox: {
                    label: (0, nls_1.localize)('doNotAskAgain', "Do not ask me again")
                }
            });
            // Update setting if checkbox checked
            if (res.checkboxChecked) {
                await configurationService.updateValue('window.confirmBeforeClose', 'never');
            }
            return res.confirmed;
        }
        onBeforeShutdownError({ error, reason }) {
            this.dialogService.error(this.toShutdownLabel(reason, true), (0, nls_1.localize)('shutdownErrorDetail', "Error: {0}", (0, errorMessage_1.toErrorMessage)(error)));
        }
        onWillShutdown({ reason, force, joiners }) {
            // Delay so that the dialog only appears after timeout
            const shutdownDialogScheduler = new async_1.RunOnceScheduler(() => {
                const pendingJoiners = joiners();
                this.progressService.withProgress({
                    location: 20 /* ProgressLocation.Dialog */,
                    buttons: [this.toForceShutdownLabel(reason)],
                    cancellable: false,
                    sticky: true,
                    title: this.toShutdownLabel(reason, false),
                    detail: pendingJoiners.length > 0 ? (0, nls_1.localize)('willShutdownDetail', "The following operations are still running: \n{0}", pendingJoiners.map(joiner => `- ${joiner.label}`).join('\n')) : undefined
                }, () => {
                    return event_1.Event.toPromise(this.lifecycleService.onDidShutdown); // dismiss this dialog when we actually shutdown
                }, () => {
                    force();
                });
            }, 1200);
            shutdownDialogScheduler.schedule();
            // Dispose scheduler when we actually shutdown
            event_1.Event.once(this.lifecycleService.onDidShutdown)(() => shutdownDialogScheduler.dispose());
        }
        toShutdownLabel(reason, isError) {
            if (isError) {
                switch (reason) {
                    case 1 /* ShutdownReason.CLOSE */:
                        return (0, nls_1.localize)('shutdownErrorClose', "An unexpected error prevented the window to close");
                    case 2 /* ShutdownReason.QUIT */:
                        return (0, nls_1.localize)('shutdownErrorQuit', "An unexpected error prevented the application to quit");
                    case 3 /* ShutdownReason.RELOAD */:
                        return (0, nls_1.localize)('shutdownErrorReload', "An unexpected error prevented the window to reload");
                    case 4 /* ShutdownReason.LOAD */:
                        return (0, nls_1.localize)('shutdownErrorLoad', "An unexpected error prevented to change the workspace");
                }
            }
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    return (0, nls_1.localize)('shutdownTitleClose', "Closing the window is taking a bit longer...");
                case 2 /* ShutdownReason.QUIT */:
                    return (0, nls_1.localize)('shutdownTitleQuit', "Quitting the application is taking a bit longer...");
                case 3 /* ShutdownReason.RELOAD */:
                    return (0, nls_1.localize)('shutdownTitleReload', "Reloading the window is taking a bit longer...");
                case 4 /* ShutdownReason.LOAD */:
                    return (0, nls_1.localize)('shutdownTitleLoad', "Changing the workspace is taking a bit longer...");
            }
        }
        toForceShutdownLabel(reason) {
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    return (0, nls_1.localize)('shutdownForceClose', "Close Anyway");
                case 2 /* ShutdownReason.QUIT */:
                    return (0, nls_1.localize)('shutdownForceQuit', "Quit Anyway");
                case 3 /* ShutdownReason.RELOAD */:
                    return (0, nls_1.localize)('shutdownForceReload', "Reload Anyway");
                case 4 /* ShutdownReason.LOAD */:
                    return (0, nls_1.localize)('shutdownForceLoad', "Change Anyway");
            }
        }
        onWindowResize(e) {
            if (e.target === window) {
                this.layoutService.layout();
            }
        }
        updateDocumentEdited(documentEdited) {
            let setDocumentEdited;
            if (typeof documentEdited === 'boolean') {
                setDocumentEdited = documentEdited;
            }
            else {
                setDocumentEdited = this.workingCopyService.hasDirty;
            }
            if ((!this.isDocumentedEdited && setDocumentEdited) || (this.isDocumentedEdited && !setDocumentEdited)) {
                this.isDocumentedEdited = setDocumentEdited;
                this.nativeHostService.setDocumentEdited(setDocumentEdited);
            }
        }
        onDidChangeWindowMaximized(maximized) {
            this.layoutService.updateWindowMaximizedState(maximized);
        }
        getWindowMinimumWidth(panelPosition = this.layoutService.getPanelPosition()) {
            // if panel is on the side, then return the larger minwidth
            const panelOnSide = panelPosition === 0 /* Position.LEFT */ || panelPosition === 1 /* Position.RIGHT */;
            if (panelOnSide) {
                return window_1.WindowMinimumSize.WIDTH_WITH_VERTICAL_PANEL;
            }
            return window_1.WindowMinimumSize.WIDTH;
        }
        onDidChangePanelPosition(pos) {
            const minWidth = this.getWindowMinimumWidth(pos);
            this.nativeHostService.setMinimumSize(minWidth, undefined);
        }
        onDidChangeVisibleEditors() {
            // Close when empty: check if we should close the window based on the setting
            // Overruled by: window has a workspace opened or this window is for extension development
            // or setting is disabled. Also enabled when running with --wait from the command line.
            const visibleEditorPanes = this.editorService.visibleEditorPanes;
            if (visibleEditorPanes.length === 0 && this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && !this.environmentService.isExtensionDevelopment) {
                const closeWhenEmpty = this.configurationService.getValue('window.closeWhenEmpty');
                if (closeWhenEmpty || this.environmentService.args.wait) {
                    this.closeEmptyWindowScheduler.schedule();
                }
            }
        }
        onDidAllEditorsClose() {
            const visibleEditorPanes = this.editorService.visibleEditorPanes.length;
            if (visibleEditorPanes === 0) {
                this.nativeHostService.closeWindow();
            }
        }
        updateWindowZoomLevel() {
            const windowConfig = this.configurationService.getValue();
            const windowZoomLevel = typeof windowConfig.window?.zoomLevel === 'number' ? windowConfig.window.zoomLevel : 0;
            if ((0, browser_1.getZoomLevel)() !== windowZoomLevel) {
                (0, window_2.applyZoom)(windowZoomLevel);
            }
        }
        provideCustomTitleContextMenu(filePath) {
            // Clear old menu
            this.customTitleContextMenuDisposable.clear();
            // Provide new menu if a file is opened and we are on a custom title
            if (!filePath || (0, window_1.getTitleBarStyle)(this.configurationService) !== 'custom') {
                return;
            }
            // Split up filepath into segments
            const segments = filePath.split(path_1.posix.sep);
            for (let i = segments.length; i > 0; i--) {
                const isFile = (i === segments.length);
                let pathOffset = i;
                if (!isFile) {
                    pathOffset++; // for segments which are not the file name we want to open the folder
                }
                const path = uri_1.URI.file(segments.slice(0, pathOffset).join(path_1.posix.sep));
                let label;
                if (!isFile) {
                    label = this.labelService.getUriBasenameLabel((0, resources_1.dirname)(path));
                }
                else {
                    label = this.labelService.getUriBasenameLabel(path);
                }
                const commandId = `workbench.action.revealPathInFinder${i}`;
                this.customTitleContextMenuDisposable.add(commands_1.CommandsRegistry.registerCommand(commandId, () => this.nativeHostService.showItemInFolder(path.fsPath)));
                this.customTitleContextMenuDisposable.add(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TitleBarTitleContext, { command: { id: commandId, title: label || path_1.posix.sep }, order: -i }));
            }
        }
        create() {
            // Handle open calls
            this.setupOpenHandlers();
            // Notify some services about lifecycle phases
            this.lifecycleService.when(2 /* LifecyclePhase.Ready */).then(() => this.nativeHostService.notifyReady());
            this.lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => {
                this.sharedProcessService.notifyRestored();
                this.utilityProcessWorkerWorkbenchService.notifyRestored();
            });
            // Check for situations that are worth warning the user about
            this.handleWarnings();
            // Touchbar menu (if enabled)
            this.updateTouchbarMenu();
            // Smoke Test Driver
            if (this.environmentService.enableSmokeTestDriver) {
                this.setupDriver();
            }
        }
        async handleWarnings() {
            // Check for cyclic dependencies
            if (typeof require.hasDependencyCycle === 'function' && require.hasDependencyCycle()) {
                if (platform_1.isCI) {
                    this.logService.error('Error: There is a dependency cycle in the AMD modules that needs to be resolved!');
                    this.nativeHostService.exit(37); // running on a build machine, just exit without showing a dialog
                }
                else {
                    this.dialogService.error((0, nls_1.localize)('loaderCycle', "There is a dependency cycle in the AMD modules that needs to be resolved!"));
                    this.nativeHostService.openDevTools();
                }
            }
            // After restored phase is fine for the following ones
            await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
            // Integrity / Root warning
            (async () => {
                const isAdmin = await this.nativeHostService.isAdmin();
                const { isPure } = await this.integrityService.isPure();
                // Update to title
                this.titleService.updateProperties({ isPure, isAdmin });
                // Show warning message (unix only)
                if (isAdmin && !platform_1.isWindows) {
                    this.notificationService.warn((0, nls_1.localize)('runningAsRoot', "It is not recommended to run {0} as root user.", this.productService.nameShort));
                }
            })();
            // Installation Dir Warning
            if (this.environmentService.isBuilt) {
                let installLocationUri;
                if (platform_1.isMacintosh) {
                    // appRoot = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app
                    installLocationUri = (0, resources_1.dirname)((0, resources_1.dirname)((0, resources_1.dirname)(uri_1.URI.file(this.environmentService.appRoot))));
                }
                else {
                    // appRoot = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\resources\app
                    // appRoot = /usr/share/code-insiders/resources/app
                    installLocationUri = (0, resources_1.dirname)((0, resources_1.dirname)(uri_1.URI.file(this.environmentService.appRoot)));
                }
                for (const folder of this.contextService.getWorkspace().folders) {
                    if (this.uriIdentityService.extUri.isEqualOrParent(folder.uri, installLocationUri)) {
                        this.bannerService.show({
                            id: 'appRootWarning.banner',
                            message: (0, nls_1.localize)('appRootWarning.banner', "Files you store within the installation folder ('{0}') may be OVERWRITTEN or DELETED IRREVERSIBLY without warning at update time.", this.labelService.getUriLabel(installLocationUri)),
                            icon: codicons_1.Codicon.warning
                        });
                        break;
                    }
                }
            }
            // Windows 32-bit warning
            if (platform_1.isWindows && this.environmentService.os.arch === 'ia32') {
                const message = (0, nls_1.localize)('windows32eolmessage', "You are running {0} 32-bit, which will soon stop receiving updates on Windows. Consider upgrading to the 64-bit build.", this.productService.nameLong);
                const actions = [{
                        label: (0, nls_1.localize)('windowseolBannerLearnMore', "Learn More"),
                        href: 'https://aka.ms/vscode-faq-old-windows'
                    }];
                this.bannerService.show({
                    id: 'windows32eol.banner',
                    message,
                    ariaLabel: (0, nls_1.localize)('windowseolarialabel', "{0}. Use navigation keys to access banner actions.", message),
                    actions,
                    icon: codicons_1.Codicon.warning
                });
                this.notificationService.prompt(notification_1.Severity.Warning, message, [{
                        label: (0, nls_1.localize)('learnMore', "Learn More"),
                        run: () => this.openerService.open(uri_1.URI.parse('https://aka.ms/vscode-faq-old-windows'))
                    }], {
                    neverShowAgain: { id: 'windows32eol', isSecondary: true, scope: notification_1.NeverShowAgainScope.APPLICATION },
                    priority: notification_1.NotificationPriority.URGENT,
                    sticky: true
                });
            }
            // macOS 10.13 and 10.14 warning
            if (platform_1.isMacintosh) {
                const majorVersion = this.environmentService.os.release.split('.')[0];
                const eolReleases = new Map([
                    ['17', 'macOS High Sierra'],
                    ['18', 'macOS Mojave'],
                ]);
                if (eolReleases.has(majorVersion)) {
                    const message = (0, nls_1.localize)('macoseolmessage', "{0} on {1} will soon stop receiving updates. Consider upgrading your macOS version.", this.productService.nameLong, eolReleases.get(majorVersion));
                    const actions = [{
                            label: (0, nls_1.localize)('macoseolBannerLearnMore', "Learn More"),
                            href: 'https://aka.ms/vscode-faq-old-macOS'
                        }];
                    this.bannerService.show({
                        id: 'macoseol.banner',
                        message,
                        ariaLabel: (0, nls_1.localize)('macoseolarialabel', "{0}. Use navigation keys to access banner actions.", message),
                        actions,
                        icon: codicons_1.Codicon.warning
                    });
                    this.notificationService.prompt(notification_1.Severity.Warning, message, [{
                            label: (0, nls_1.localize)('learnMore', "Learn More"),
                            run: () => this.openerService.open(uri_1.URI.parse('https://aka.ms/vscode-faq-old-macOS'))
                        }], {
                        neverShowAgain: { id: 'macoseol', isSecondary: true, scope: notification_1.NeverShowAgainScope.APPLICATION },
                        priority: notification_1.NotificationPriority.URGENT,
                        sticky: true
                    });
                }
            }
            // Slow shell environment progress indicator
            const shellEnv = globals_1.process.shellEnv();
            this.progressService.withProgress({
                title: (0, nls_1.localize)('resolveShellEnvironment', "Resolving shell environment..."),
                location: 10 /* ProgressLocation.Window */,
                delay: 1600,
                buttons: [(0, nls_1.localize)('learnMore', "Learn More")]
            }, () => shellEnv, () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2149667'));
        }
        setupDriver() {
            const that = this;
            let pendingQuit = false;
            (0, driver_1.registerWindowDriver)(this.instantiationService, {
                async exitApplication() {
                    if (pendingQuit) {
                        that.logService.info('[driver] not handling exitApplication() due to pending quit() call');
                        return;
                    }
                    that.logService.info('[driver] handling exitApplication()');
                    pendingQuit = true;
                    return that.nativeHostService.quit();
                }
            });
        }
        setupOpenHandlers() {
            // Block window.open() calls
            window.open = function () {
                throw new Error('Prevented call to window.open(). Use IOpenerService instead!');
            };
            // Handle external open() calls
            this.openerService.setDefaultExternalOpener({
                openExternal: async (href) => {
                    const success = await this.nativeHostService.openExternal(href);
                    if (!success) {
                        const fileCandidate = uri_1.URI.parse(href);
                        if (fileCandidate.scheme === network_1.Schemas.file) {
                            // if opening failed, and this is a file, we can still try to reveal it
                            await this.nativeHostService.showItemInFolder(fileCandidate.fsPath);
                        }
                    }
                    return true;
                }
            });
            // Register external URI resolver
            this.openerService.registerExternalUriResolver({
                resolveExternalUri: async (uri, options) => {
                    if (options?.allowTunneling) {
                        const portMappingRequest = (0, tunnel_1.extractLocalHostUriMetaDataForPortMapping)(uri);
                        if (portMappingRequest) {
                            const remoteAuthority = this.environmentService.remoteAuthority;
                            const addressProvider = remoteAuthority ? {
                                getAddress: async () => {
                                    return (await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority)).authority;
                                }
                            } : undefined;
                            let tunnel = await this.tunnelService.getExistingTunnel(portMappingRequest.address, portMappingRequest.port);
                            if (!tunnel || (typeof tunnel === 'string')) {
                                tunnel = await this.tunnelService.openTunnel(addressProvider, portMappingRequest.address, portMappingRequest.port);
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
                        const canHandleResource = await this.fileService.canHandleResource(uri);
                        if (canHandleResource) {
                            return {
                                resolved: uri_1.URI.from({
                                    scheme: this.productService.urlProtocol,
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
        updateTouchbarMenu() {
            if (!platform_1.isMacintosh) {
                return; // macOS only
            }
            // Dispose old
            this.touchBarDisposables.clear();
            this.touchBarMenu = undefined;
            // Create new (delayed)
            const scheduler = this.touchBarDisposables.add(new async_1.RunOnceScheduler(() => this.doUpdateTouchbarMenu(scheduler), 300));
            scheduler.schedule();
        }
        doUpdateTouchbarMenu(scheduler) {
            if (!this.touchBarMenu) {
                const scopedContextKeyService = this.editorService.activeEditorPane?.scopedContextKeyService || this.editorGroupService.activeGroup.scopedContextKeyService;
                this.touchBarMenu = this.menuService.createMenu(actions_2.MenuId.TouchBarContext, scopedContextKeyService);
                this.touchBarDisposables.add(this.touchBarMenu);
                this.touchBarDisposables.add(this.touchBarMenu.onDidChange(() => scheduler.schedule()));
            }
            const actions = [];
            const disabled = this.configurationService.getValue('keyboard.touchbar.enabled') === false;
            const touchbarIgnored = this.configurationService.getValue('keyboard.touchbar.ignored');
            const ignoredItems = Array.isArray(touchbarIgnored) ? touchbarIgnored : [];
            // Fill actions into groups respecting order
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.touchBarMenu, undefined, actions);
            // Convert into command action multi array
            const items = [];
            let group = [];
            if (!disabled) {
                for (const action of actions) {
                    // Command
                    if (action instanceof actions_2.MenuItemAction) {
                        if (ignoredItems.indexOf(action.item.id) >= 0) {
                            continue; // ignored
                        }
                        group.push(action.item);
                    }
                    // Separator
                    else if (action instanceof actions_1.Separator) {
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
            if (!(0, objects_1.equals)(this.lastInstalledTouchedBar, items)) {
                this.lastInstalledTouchedBar = items;
                this.nativeHostService.updateTouchBar(items);
            }
        }
        onAddFoldersRequest(request) {
            // Buffer all pending requests
            this.pendingFoldersToAdd.push(...request.foldersToAdd.map(folder => uri_1.URI.revive(folder)));
            // Delay the adding of folders a bit to buffer in case more requests are coming
            if (!this.addFoldersScheduler.isScheduled()) {
                this.addFoldersScheduler.schedule();
            }
        }
        doAddFolders() {
            const foldersToAdd = [];
            for (const folder of this.pendingFoldersToAdd) {
                foldersToAdd.push(({ uri: folder }));
            }
            this.pendingFoldersToAdd = [];
            this.workspaceEditingService.addFolders(foldersToAdd);
        }
        async onOpenFiles(request) {
            const diffMode = !!(request.filesToDiff && (request.filesToDiff.length === 2));
            const mergeMode = !!(request.filesToMerge && (request.filesToMerge.length === 4));
            const inputs = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(mergeMode ? request.filesToMerge : diffMode ? request.filesToDiff : request.filesToOpenOrCreate, this.fileService, this.logService));
            if (inputs.length) {
                const openedEditorPanes = await this.openResources(inputs, diffMode, mergeMode);
                if (request.filesToWait) {
                    // In wait mode, listen to changes to the editors and wait until the files
                    // are closed that the user wants to wait for. When this happens we delete
                    // the wait marker file to signal to the outside that editing is done.
                    // However, it is possible that opening of the editors failed, as such we
                    // check for whether editor panes got opened and otherwise delete the marker
                    // right away.
                    if (openedEditorPanes.length) {
                        return this.trackClosedWaitFiles(uri_1.URI.revive(request.filesToWait.waitMarkerFileUri), (0, arrays_1.coalesce)(request.filesToWait.paths.map(path => uri_1.URI.revive(path.fileUri))));
                    }
                    else {
                        return this.fileService.del(uri_1.URI.revive(request.filesToWait.waitMarkerFileUri));
                    }
                }
            }
        }
        async trackClosedWaitFiles(waitMarkerFile, resourcesToWaitFor) {
            // Wait for the resources to be closed in the text editor...
            await this.instantiationService.invokeFunction(accessor => (0, editor_2.whenEditorClosed)(accessor, resourcesToWaitFor));
            // ...before deleting the wait marker file
            await this.fileService.del(waitMarkerFile);
        }
        async openResources(resources, diffMode, mergeMode) {
            const editors = [];
            if (mergeMode && (0, editor_1.isResourceEditorInput)(resources[0]) && (0, editor_1.isResourceEditorInput)(resources[1]) && (0, editor_1.isResourceEditorInput)(resources[2]) && (0, editor_1.isResourceEditorInput)(resources[3])) {
                const mergeEditor = {
                    input1: { resource: resources[0].resource },
                    input2: { resource: resources[1].resource },
                    base: { resource: resources[2].resource },
                    result: { resource: resources[3].resource },
                    options: { pinned: true }
                };
                editors.push(mergeEditor);
            }
            else if (diffMode && (0, editor_1.isResourceEditorInput)(resources[0]) && (0, editor_1.isResourceEditorInput)(resources[1])) {
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
            return this.editorService.openEditors(editors, undefined, { validateTrust: true });
        }
    };
    exports.NativeWindow = NativeWindow;
    exports.NativeWindow = NativeWindow = NativeWindow_1 = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, titleService_1.ITitleService),
        __param(4, workbenchThemeService_1.IWorkbenchThemeService),
        __param(5, notification_1.INotificationService),
        __param(6, commands_1.ICommandService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, workspaceEditing_1.IWorkspaceEditingService),
        __param(10, files_1.IFileService),
        __param(11, actions_2.IMenuService),
        __param(12, lifecycle_2.ILifecycleService),
        __param(13, integrity_1.IIntegrityService),
        __param(14, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(15, accessibility_1.IAccessibilityService),
        __param(16, workspace_1.IWorkspaceContextService),
        __param(17, opener_1.IOpenerService),
        __param(18, native_1.INativeHostService),
        __param(19, tunnel_1.ITunnelService),
        __param(20, layoutService_1.IWorkbenchLayoutService),
        __param(21, workingCopyService_1.IWorkingCopyService),
        __param(22, filesConfigurationService_1.IFilesConfigurationService),
        __param(23, productService_1.IProductService),
        __param(24, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(25, dialogs_1.IDialogService),
        __param(26, storage_1.IStorageService),
        __param(27, log_1.ILogService),
        __param(28, instantiation_1.IInstantiationService),
        __param(29, services_1.ISharedProcessService),
        __param(30, progress_1.IProgressService),
        __param(31, label_1.ILabelService),
        __param(32, bannerService_1.IBannerService),
        __param(33, uriIdentity_1.IUriIdentityService),
        __param(34, preferences_1.IPreferencesService),
        __param(35, utilityProcessWorkerWorkbenchService_1.IUtilityProcessWorkerWorkbenchService)
    ], NativeWindow);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2VsZWN0cm9uLXNhbmRib3gvd2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzRXpGLElBQU0sWUFBWSxvQkFBbEIsTUFBTSxZQUFhLFNBQVEsc0JBQVU7UUFlM0MsWUFDaUIsYUFBOEMsRUFDeEMsa0JBQXlELEVBQ3hELG9CQUE0RCxFQUNwRSxZQUE0QyxFQUNuQyxZQUE4QyxFQUNoRCxtQkFBMEQsRUFDL0QsY0FBZ0QsRUFDN0MsaUJBQXNELEVBQ3ZELGdCQUFvRCxFQUM3Qyx1QkFBa0UsRUFDOUUsV0FBMEMsRUFDMUMsV0FBMEMsRUFDckMsZ0JBQW9ELEVBQ3BELGdCQUFvRCxFQUNuQyxrQkFBdUUsRUFDcEYsb0JBQTRELEVBQ3pELGNBQXlELEVBQ25FLGFBQThDLEVBQzFDLGlCQUFzRCxFQUMxRCxhQUE4QyxFQUNyQyxhQUF1RCxFQUMzRCxrQkFBd0QsRUFDakQseUJBQXNFLEVBQ2pGLGNBQWdELEVBQ2hDLDhCQUFnRixFQUNqRyxhQUE4QyxFQUM3QyxjQUFnRCxFQUNwRCxVQUF3QyxFQUM5QixvQkFBNEQsRUFDNUQsb0JBQTRELEVBQ2pFLGVBQWtELEVBQ3JELFlBQTRDLEVBQzNDLGFBQThDLEVBQ3pDLGtCQUF3RCxFQUN4RCxrQkFBd0QsRUFDdEMsb0NBQTRGO1lBRW5JLEtBQUssRUFBRSxDQUFDO1lBckN5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ25ELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3pCLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtZQUMvQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzlDLG1CQUFjLEdB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