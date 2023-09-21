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
define(["require", "exports", "electron", "vs/base/node/unc", "vs/base/parts/ipc/electron-main/ipcMain", "os", "vs/base/common/buffer", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/functional", "vs/base/common/json", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/parts/contextmenu/electron-main/contextmenu", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/electron-main/ipc.electron", "vs/base/parts/ipc/electron-main/ipc.mp", "vs/code/electron-main/auth", "vs/nls", "vs/platform/backup/electron-main/backup", "vs/platform/backup/electron-main/backupMainService", "vs/platform/configuration/common/configuration", "vs/platform/debug/electron-main/extensionHostDebugIpc", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/electron-main/diagnosticsMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/encryption/common/encryptionService", "vs/platform/encryption/electron-main/encryptionMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/shell/node/shellEnv", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/platform/extensionManagement/node/extensionUrlTrustService", "vs/platform/extensions/common/extensionHostStarter", "vs/platform/extensions/electron-main/extensionHostStarter", "vs/platform/externalTerminal/electron-main/externalTerminal", "vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/files/common/diskFileSystemProviderClient", "vs/platform/files/common/files", "vs/platform/files/electron-main/diskFileSystemProviderServer", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/issue/common/issue", "vs/platform/issue/electron-main/issueMainService", "vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService", "vs/platform/launch/electron-main/launchMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/electron-main/menubarMainService", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/sharedProcess/electron-main/sharedProcess", "vs/platform/sign/common/sign", "vs/platform/state/node/state", "vs/platform/storage/electron-main/storageIpc", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/update/common/update", "vs/platform/update/common/updateIpc", "vs/platform/update/electron-main/updateService.darwin", "vs/platform/update/electron-main/updateService.linux", "vs/platform/update/electron-main/updateService.snap", "vs/platform/update/electron-main/updateService.win32", "vs/platform/url/common/url", "vs/platform/url/common/urlIpc", "vs/platform/url/common/urlService", "vs/platform/url/electron-main/electronUrlListener", "vs/platform/webview/common/webviewManagerService", "vs/platform/webview/electron-main/webviewMainService", "vs/platform/windows/electron-main/windows", "vs/platform/windows/electron-main/windowsMainService", "vs/platform/windows/node/windowTracker", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/workspaces/electron-main/workspacesMainService", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/policy/common/policy", "vs/platform/policy/common/policyIpc", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/request/common/requestIpc", "vs/platform/request/common/request", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/userDataProfile/electron-main/userDataProfilesHandler", "vs/platform/userDataProfile/electron-main/userDataProfileStorageIpc", "vs/base/common/async", "vs/platform/telemetry/electron-main/telemetryUtils", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/electron-main/logIpc", "vs/platform/log/electron-main/loggerService", "vs/platform/dialogs/common/dialogs", "vs/platform/utilityProcess/electron-main/utilityProcessWorkerMainService", "vs/platform/utilityProcess/common/utilityProcessWorkerService", "vs/base/common/arrays", "vs/platform/terminal/common/terminal", "vs/platform/terminal/electron-main/electronPtyHostStarter", "vs/platform/terminal/node/ptyHostService", "vs/platform/remote/common/electronRemoteResources", "vs/base/common/lazy"], function (require, exports, electron_1, unc_1, ipcMain_1, os_1, buffer_1, errorMessage_1, errors_1, extpath_1, functional_1, json_1, labels_1, lifecycle_1, network_1, path_1, platform_1, types_1, uri_1, uuid_1, contextmenu_1, ipc_1, ipc_electron_1, ipc_mp_1, auth_1, nls_1, backup_1, backupMainService_1, configuration_1, extensionHostDebugIpc_1, diagnostics_1, diagnosticsMainService_1, dialogMainService_1, encryptionService_1, encryptionMainService_1, environmentMainService_1, argvHelper_1, shellEnv_1, extensionUrlTrust_1, extensionUrlTrustService_1, extensionHostStarter_1, extensionHostStarter_2, externalTerminal_1, externalTerminalService_1, diskFileSystemProviderClient_1, files_1, diskFileSystemProviderServer_1, diskFileSystemProvider_1, descriptors_1, instantiation_1, serviceCollection_1, issue_1, issueMainService_1, keyboardLayoutMainService_1, launchMainService_1, lifecycleMainService_1, log_1, menubarMainService_1, nativeHostMainService_1, productService_1, remoteHosts_1, sharedProcess_1, sign_1, state_1, storageIpc_1, storageMainService_1, commonProperties_1, telemetry_1, telemetryIpc_1, telemetryService_1, telemetryUtils_1, update_1, updateIpc_1, updateService_darwin_1, updateService_linux_1, updateService_snap_1, updateService_win32_1, url_1, urlIpc_1, urlService_1, electronUrlListener_1, webviewManagerService_1, webviewMainService_1, windows_1, windowsMainService_1, windowTracker_1, workspace_1, workspaces_1, workspacesHistoryMainService_1, workspacesMainService_1, workspacesManagementMainService_1, policy_1, policyIpc_1, userDataProfile_1, requestIpc_1, request_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfilesHandler_1, userDataProfileStorageIpc_1, async_1, telemetryUtils_2, extensionsProfileScannerService_2, logIpc_1, loggerService_1, dialogs_1, utilityProcessWorkerMainService_1, utilityProcessWorkerService_1, arrays_1, terminal_1, electronPtyHostStarter_1, ptyHostService_1, electronRemoteResources_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeApplication = void 0;
    /**
     * The main VS Code application. There will only ever be one instance,
     * even if the user starts many instances (e.g. from the command line).
     */
    let CodeApplication = class CodeApplication extends lifecycle_1.Disposable {
        constructor(mainProcessNodeIpcServer, userEnv, mainInstantiationService, logService, loggerService, environmentMainService, lifecycleMainService, configurationService, stateService, fileService, productService, userDataProfilesMainService) {
            super();
            this.mainProcessNodeIpcServer = mainProcessNodeIpcServer;
            this.userEnv = userEnv;
            this.mainInstantiationService = mainInstantiationService;
            this.logService = logService;
            this.loggerService = loggerService;
            this.environmentMainService = environmentMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.configurationService = configurationService;
            this.stateService = stateService;
            this.fileService = fileService;
            this.productService = productService;
            this.userDataProfilesMainService = userDataProfilesMainService;
            this.configureSession();
            this.registerListeners();
        }
        configureSession() {
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            const isUrlFromWebview = (requestingUrl) => requestingUrl?.startsWith(`${network_1.Schemas.vscodeWebview}://`);
            const allowedPermissionsInMainFrame = new Set(this.productService.quality === 'stable' ? [] : ['media']);
            const allowedPermissionsInWebview = new Set([
                'clipboard-read',
                'clipboard-sanitized-write',
            ]);
            electron_1.session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback, details) => {
                if (isUrlFromWebview(details.requestingUrl)) {
                    return callback(allowedPermissionsInWebview.has(permission));
                }
                if (details.isMainFrame && details.securityOrigin === 'vscode-file://vscode-app/') {
                    return callback(allowedPermissionsInMainFrame.has(permission));
                }
                return callback(false);
            });
            electron_1.session.defaultSession.setPermissionCheckHandler((_webContents, permission, _origin, details) => {
                if (isUrlFromWebview(details.requestingUrl)) {
                    return allowedPermissionsInWebview.has(permission);
                }
                if (details.isMainFrame && details.securityOrigin === 'vscode-file://vscode-app/') {
                    return allowedPermissionsInMainFrame.has(permission);
                }
                return false;
            });
            //#endregion
            //#region Request filtering
            // Block all SVG requests from unsupported origins
            const supportedSvgSchemes = new Set([network_1.Schemas.file, network_1.Schemas.vscodeFileResource, network_1.Schemas.vscodeRemoteResource, network_1.Schemas.vscodeManagedRemoteResource, 'devtools']);
            // But allow them if the are made from inside an webview
            const isSafeFrame = (requestFrame) => {
                for (let frame = requestFrame; frame; frame = frame.parent) {
                    if (frame.url.startsWith(`${network_1.Schemas.vscodeWebview}://`)) {
                        return true;
                    }
                }
                return false;
            };
            const isSvgRequestFromSafeContext = (details) => {
                return details.resourceType === 'xhr' || isSafeFrame(details.frame);
            };
            const isAllowedVsCodeFileRequest = (details) => {
                const frame = details.frame;
                if (!frame || !this.windowsMainService) {
                    return false;
                }
                // Check to see if the request comes from one of the main windows (or shared process) and not from embedded content
                const windows = electron_1.BrowserWindow.getAllWindows();
                for (const window of windows) {
                    if (frame.processId === window.webContents.mainFrame.processId) {
                        return true;
                    }
                }
                return false;
            };
            const isAllowedWebviewRequest = (uri, details) => {
                if (uri.path !== '/index.html') {
                    return true; // Only restrict top level page of webviews: index.html
                }
                const frame = details.frame;
                if (!frame || !this.windowsMainService) {
                    return false;
                }
                // Check to see if the request comes from one of the main editor windows.
                for (const window of this.windowsMainService.getWindows()) {
                    if (window.win) {
                        if (frame.processId === window.win.webContents.mainFrame.processId) {
                            return true;
                        }
                    }
                }
                return false;
            };
            electron_1.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
                const uri = uri_1.URI.parse(details.url);
                if (uri.scheme === network_1.Schemas.vscodeWebview) {
                    if (!isAllowedWebviewRequest(uri, details)) {
                        this.logService.error('Blocked vscode-webview request', details.url);
                        return callback({ cancel: true });
                    }
                }
                if (uri.scheme === network_1.Schemas.vscodeFileResource) {
                    if (!isAllowedVsCodeFileRequest(details)) {
                        this.logService.error('Blocked vscode-file request', details.url);
                        return callback({ cancel: true });
                    }
                }
                // Block most svgs
                if (uri.path.endsWith('.svg')) {
                    const isSafeResourceUrl = supportedSvgSchemes.has(uri.scheme);
                    if (!isSafeResourceUrl) {
                        return callback({ cancel: !isSvgRequestFromSafeContext(details) });
                    }
                }
                return callback({ cancel: false });
            });
            // Configure SVG header content type properly
            // https://github.com/microsoft/vscode/issues/97564
            electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
                const responseHeaders = details.responseHeaders;
                const contentTypes = (responseHeaders['content-type'] || responseHeaders['Content-Type']);
                if (contentTypes && Array.isArray(contentTypes)) {
                    const uri = uri_1.URI.parse(details.url);
                    if (uri.path.endsWith('.svg')) {
                        if (supportedSvgSchemes.has(uri.scheme)) {
                            responseHeaders['Content-Type'] = ['image/svg+xml'];
                            return callback({ cancel: false, responseHeaders });
                        }
                    }
                    // remote extension schemes have the following format
                    // http://127.0.0.1:<port>/vscode-remote-resource?path=
                    if (!uri.path.endsWith(network_1.Schemas.vscodeRemoteResource) && contentTypes.some(contentType => contentType.toLowerCase().includes('image/svg'))) {
                        return callback({ cancel: !isSvgRequestFromSafeContext(details) });
                    }
                }
                return callback({ cancel: false });
            });
            const defaultSession = electron_1.session.defaultSession;
            if (typeof defaultSession.setCodeCachePath === 'function' && this.environmentMainService.codeCachePath) {
                // Make sure to partition Chrome's code cache folder
                // in the same way as our code cache path to help
                // invalidate caches that we know are invalid
                // (https://github.com/microsoft/vscode/issues/120655)
                defaultSession.setCodeCachePath((0, path_1.join)(this.environmentMainService.codeCachePath, 'chrome'));
            }
            //#endregion
            //#region UNC Host Allowlist (Windows)
            if (platform_1.isWindows) {
                if (this.configurationService.getValue('security.restrictUNCAccess') === false) {
                    (0, unc_1.disableUNCAccessRestrictions)();
                }
                else {
                    (0, unc_1.addUNCHostToAllowlist)(this.configurationService.getValue('security.allowedUNCHosts'));
                }
            }
            //#endregion
        }
        registerListeners() {
            // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
            (0, errors_1.setUnexpectedErrorHandler)(error => this.onUnexpectedError(error));
            process.on('uncaughtException', error => {
                if (!(0, errors_1.isSigPipeError)(error)) {
                    (0, errors_1.onUnexpectedError)(error);
                }
            });
            process.on('unhandledRejection', (reason) => (0, errors_1.onUnexpectedError)(reason));
            // Dispose on shutdown
            this.lifecycleMainService.onWillShutdown(() => this.dispose());
            // Contextmenu via IPC support
            (0, contextmenu_1.registerContextMenuListener)();
            // Accessibility change event
            electron_1.app.on('accessibility-support-changed', (event, accessibilitySupportEnabled) => {
                this.windowsMainService?.sendToAll('vscode:accessibilitySupportChanged', accessibilitySupportEnabled);
            });
            // macOS dock activate
            electron_1.app.on('activate', async (event, hasVisibleWindows) => {
                this.logService.trace('app#activate');
                // Mac only event: open new window when we get activated
                if (!hasVisibleWindows) {
                    await this.windowsMainService?.openEmptyWindow({ context: 1 /* OpenContext.DOCK */ });
                }
            });
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            electron_1.app.on('web-contents-created', (event, contents) => {
                contents.on('will-navigate', event => {
                    this.logService.error('webContents#will-navigate: Prevented webcontent navigation');
                    event.preventDefault();
                });
                contents.setWindowOpenHandler(({ url }) => {
                    this.nativeHostMainService?.openExternal(undefined, url);
                    return { action: 'deny' };
                });
            });
            //#endregion
            let macOpenFileURIs = [];
            let runningTimeout = undefined;
            electron_1.app.on('open-file', (event, path) => {
                this.logService.trace('app#open-file: ', path);
                event.preventDefault();
                // Keep in array because more might come!
                macOpenFileURIs.push((0, workspace_1.hasWorkspaceFileExtension)(path) ? { workspaceUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) });
                // Clear previous handler if any
                if (runningTimeout !== undefined) {
                    clearTimeout(runningTimeout);
                    runningTimeout = undefined;
                }
                // Handle paths delayed in case more are coming!
                runningTimeout = setTimeout(async () => {
                    await this.windowsMainService?.open({
                        context: 1 /* OpenContext.DOCK */ /* can also be opening from finder while app is running */,
                        cli: this.environmentMainService.args,
                        urisToOpen: macOpenFileURIs,
                        gotoLineMode: false,
                        preferNewWindow: true /* dropping on the dock or opening from finder prefers to open in a new window */
                    });
                    macOpenFileURIs = [];
                    runningTimeout = undefined;
                }, 100);
            });
            electron_1.app.on('new-window-for-tab', async () => {
                await this.windowsMainService?.openEmptyWindow({ context: 4 /* OpenContext.DESKTOP */ }); //macOS native tab "+" button
            });
            //#region Bootstrap IPC Handlers
            ipcMain_1.validatedIpcMain.handle('vscode:fetchShellEnv', event => {
                // Prefer to use the args and env from the target window
                // when resolving the shell env. It is possible that
                // a first window was opened from the UI but a second
                // from the CLI and that has implications for whether to
                // resolve the shell environment or not.
                //
                // Window can be undefined for e.g. the shared process
                // that is not part of our windows registry!
                const window = this.windowsMainService?.getWindowByWebContents(event.sender); // Note: this can be `undefined` for the shared process
                let args;
                let env;
                if (window?.config) {
                    args = window.config;
                    env = { ...process.env, ...window.config.userEnv };
                }
                else {
                    args = this.environmentMainService.args;
                    env = process.env;
                }
                // Resolve shell env
                return this.resolveShellEnvironment(args, env, false);
            });
            ipcMain_1.validatedIpcMain.handle('vscode:writeNlsFile', (event, path, data) => {
                const uri = this.validateNlsPath([path]);
                if (!uri || typeof data !== 'string') {
                    throw new Error('Invalid operation (vscode:writeNlsFile)');
                }
                return this.fileService.writeFile(uri, buffer_1.VSBuffer.fromString(data));
            });
            ipcMain_1.validatedIpcMain.handle('vscode:readNlsFile', async (event, ...paths) => {
                const uri = this.validateNlsPath(paths);
                if (!uri) {
                    throw new Error('Invalid operation (vscode:readNlsFile)');
                }
                return (await this.fileService.readFile(uri)).value.toString();
            });
            ipcMain_1.validatedIpcMain.on('vscode:toggleDevTools', event => event.sender.toggleDevTools());
            ipcMain_1.validatedIpcMain.on('vscode:openDevTools', event => event.sender.openDevTools());
            ipcMain_1.validatedIpcMain.on('vscode:reloadWindow', event => event.sender.reload());
            //#endregion
        }
        validateNlsPath(pathSegments) {
            let path = undefined;
            for (const pathSegment of pathSegments) {
                if (typeof pathSegment === 'string') {
                    if (typeof path !== 'string') {
                        path = pathSegment;
                    }
                    else {
                        path = (0, path_1.join)(path, pathSegment);
                    }
                }
            }
            if (typeof path !== 'string' || !(0, path_1.isAbsolute)(path) || !(0, extpath_1.isEqualOrParent)(path, this.environmentMainService.cachedLanguagesPath, !platform_1.isLinux)) {
                return undefined;
            }
            return uri_1.URI.file(path);
        }
        onUnexpectedError(error) {
            if (error) {
                // take only the message and stack property
                const friendlyError = {
                    message: `[uncaught exception in main]: ${error.message}`,
                    stack: error.stack
                };
                // handle on client side
                this.windowsMainService?.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
            }
            this.logService.error(`[uncaught exception in main]: ${error}`);
            if (error.stack) {
                this.logService.error(error.stack);
            }
        }
        async startup() {
            this.logService.debug('Starting VS Code');
            this.logService.debug(`from: ${this.environmentMainService.appRoot}`);
            this.logService.debug('args:', this.environmentMainService.args);
            // Make sure we associate the program with the app user model id
            // This will help Windows to associate the running program with
            // any shortcut that is pinned to the taskbar and prevent showing
            // two icons in the taskbar for the same app.
            const win32AppUserModelId = this.productService.win32AppUserModelId;
            if (platform_1.isWindows && win32AppUserModelId) {
                electron_1.app.setAppUserModelId(win32AppUserModelId);
            }
            // Fix native tabs on macOS 10.13
            // macOS enables a compatibility patch for any bundle ID beginning with
            // "com.microsoft.", which breaks native tabs for VS Code when using this
            // identifier (from the official build).
            // Explicitly opt out of the patch here before creating any windows.
            // See: https://github.com/microsoft/vscode/issues/35361#issuecomment-399794085
            try {
                if (platform_1.isMacintosh && this.configurationService.getValue('window.nativeTabs') === true && !electron_1.systemPreferences.getUserDefault('NSUseImprovedLayoutPass', 'boolean')) {
                    electron_1.systemPreferences.setUserDefault('NSUseImprovedLayoutPass', 'boolean', true);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            // Main process server (electron IPC based)
            const mainProcessElectronServer = new ipc_electron_1.Server();
            this.lifecycleMainService.onWillShutdown(e => {
                if (e.reason === 2 /* ShutdownReason.KILL */) {
                    // When we go down abnormally, make sure to free up
                    // any IPC we accept from other windows to reduce
                    // the chance of doing work after we go down. Kill
                    // is special in that it does not orderly shutdown
                    // windows.
                    mainProcessElectronServer.dispose();
                }
            });
            // Resolve unique machine ID
            this.logService.trace('Resolving machine identifier...');
            const machineId = await (0, telemetryUtils_2.resolveMachineId)(this.stateService, this.logService);
            this.logService.trace(`Resolved machine identifier: ${machineId}`);
            // Shared process
            const { sharedProcessReady, sharedProcessClient } = this.setupSharedProcess(machineId);
            // Services
            const appInstantiationService = await this.initServices(machineId, sharedProcessReady);
            // Auth Handler
            this._register(appInstantiationService.createInstance(auth_1.ProxyAuthHandler));
            // Transient profiles handler
            this._register(appInstantiationService.createInstance(userDataProfilesHandler_1.UserDataProfilesHandler));
            // Init Channels
            appInstantiationService.invokeFunction(accessor => this.initChannels(accessor, mainProcessElectronServer, sharedProcessClient));
            // Setup Protocol URL Handlers
            const initialProtocolUrls = appInstantiationService.invokeFunction(accessor => this.setupProtocolUrlHandlers(accessor, mainProcessElectronServer));
            // Setup vscode-remote-resource protocol handler.
            this.setupManagedRemoteResourceUrlHandler(mainProcessElectronServer);
            // Signal phase: ready - before opening first window
            this.lifecycleMainService.phase = 2 /* LifecycleMainPhase.Ready */;
            // Open Windows
            await appInstantiationService.invokeFunction(accessor => this.openFirstWindow(accessor, initialProtocolUrls));
            // Signal phase: after window open
            this.lifecycleMainService.phase = 3 /* LifecycleMainPhase.AfterWindowOpen */;
            // Post Open Windows Tasks
            this.afterWindowOpen();
            // Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
            const eventuallyPhaseScheduler = this._register(new async_1.RunOnceScheduler(() => {
                this._register((0, async_1.runWhenIdle)(() => this.lifecycleMainService.phase = 4 /* LifecycleMainPhase.Eventually */, 2500));
            }, 2500));
            eventuallyPhaseScheduler.schedule();
        }
        setupProtocolUrlHandlers(accessor, mainProcessElectronServer) {
            const windowsMainService = this.windowsMainService = accessor.get(windows_1.IWindowsMainService);
            const urlService = accessor.get(url_1.IURLService);
            const nativeHostMainService = this.nativeHostMainService = accessor.get(nativeHostMainService_1.INativeHostMainService);
            // Install URL handlers that deal with protocl URLs either
            // from this process by opening windows and/or by forwarding
            // the URLs into a window process to be handled there.
            const app = this;
            urlService.registerHandler({
                async handleURL(uri, options) {
                    return app.handleProtocolUrl(windowsMainService, urlService, uri, options);
                }
            });
            const activeWindowManager = this._register(new windowTracker_1.ActiveWindowManager({
                onDidOpenWindow: nativeHostMainService.onDidOpenWindow,
                onDidFocusWindow: nativeHostMainService.onDidFocusWindow,
                getActiveWindowId: () => nativeHostMainService.getActiveWindowId(-1)
            }));
            const activeWindowRouter = new ipc_1.StaticRouter(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            const urlHandlerRouter = new urlIpc_1.URLHandlerRouter(activeWindowRouter, this.logService);
            const urlHandlerChannel = mainProcessElectronServer.getChannel('urlHandler', urlHandlerRouter);
            urlService.registerHandler(new urlIpc_1.URLHandlerChannelClient(urlHandlerChannel));
            const initialProtocolUrls = this.resolveInitialProtocolUrls();
            this._register(new electronUrlListener_1.ElectronURLListener(initialProtocolUrls?.urls, urlService, windowsMainService, this.environmentMainService, this.productService, this.logService));
            return initialProtocolUrls;
        }
        setupManagedRemoteResourceUrlHandler(mainProcessElectronServer) {
            const notFound = () => ({ statusCode: 404, data: 'Not found' });
            const remoteResourceChannel = new lazy_1.Lazy(() => mainProcessElectronServer.getChannel(electronRemoteResources_1.NODE_REMOTE_RESOURCE_CHANNEL_NAME, new electronRemoteResources_1.NodeRemoteResourceRouter()));
            electron_1.protocol.registerBufferProtocol(network_1.Schemas.vscodeManagedRemoteResource, (request, callback) => {
                const url = uri_1.URI.parse(request.url);
                if (!url.authority.startsWith('window:')) {
                    return callback(notFound());
                }
                remoteResourceChannel.value.call(electronRemoteResources_1.NODE_REMOTE_RESOURCE_IPC_METHOD_NAME, [url]).then(r => callback({ ...r, data: Buffer.from(r.body, 'base64') }), err => {
                    this.logService.warn('error dispatching remote resource call', err);
                    callback({ statusCode: 500, data: String(err) });
                });
            });
        }
        resolveInitialProtocolUrls() {
            /**
             * Protocol URL handling on startup is complex, refer to
             * {@link IInitialProtocolUrls} for an explainer.
             */
            // Windows/Linux: protocol handler invokes CLI with --open-url
            const protocolUrlsFromCommandLine = this.environmentMainService.args['open-url'] ? this.environmentMainService.args._urls || [] : [];
            if (protocolUrlsFromCommandLine.length > 0) {
                this.logService.trace('app#resolveInitialProtocolUrls() protocol urls from command line:', protocolUrlsFromCommandLine);
            }
            // macOS: open-url events that were received before the app is ready
            const protocolUrlsFromEvent = (global.getOpenUrls() || []);
            if (protocolUrlsFromEvent.length > 0) {
                this.logService.trace(`app#resolveInitialProtocolUrls() protocol urls from macOS 'open-url' event:`, protocolUrlsFromEvent);
            }
            if (protocolUrlsFromCommandLine.length + protocolUrlsFromEvent.length === 0) {
                return undefined;
            }
            const openables = [];
            const urls = [
                ...protocolUrlsFromCommandLine,
                ...protocolUrlsFromEvent
            ].map(url => {
                try {
                    return { uri: uri_1.URI.parse(url), originalUrl: url };
                }
                catch {
                    this.logService.trace('app#resolveInitialProtocolUrls() protocol url failed to parse:', url);
                    return undefined;
                }
            }).filter((obj) => {
                if (!obj) {
                    return false; // invalid
                }
                if (this.shouldBlockURI(obj.uri)) {
                    this.logService.trace('app#resolveInitialProtocolUrls() protocol url was blocked:', obj.uri.toString(true));
                    return false; // blocked
                }
                const windowOpenable = this.getWindowOpenableFromProtocolUrl(obj.uri);
                if (windowOpenable) {
                    this.logService.trace('app#resolveInitialProtocolUrls() protocol url will be handled as window to open:', obj.uri.toString(true), windowOpenable);
                    openables.push(windowOpenable);
                    return false; // handled as window to open
                }
                this.logService.trace('app#resolveInitialProtocolUrls() protocol url will be passed to active window for handling:', obj.uri.toString(true));
                return true; // handled within active window
            });
            return { urls, openables };
        }
        shouldBlockURI(uri) {
            if (uri.authority === network_1.Schemas.file && platform_1.isWindows) {
                const { options, buttonIndeces } = (0, dialogs_1.massageMessageBoxOptions)({
                    type: 'warning',
                    buttons: [
                        (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                        (0, nls_1.localize)({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&No")
                    ],
                    message: (0, nls_1.localize)('confirmOpenMessage', "An external application wants to open '{0}' in {1}. Do you want to open this file or folder?", (0, labels_1.getPathLabel)(uri, { os: platform_1.OS, tildify: this.environmentMainService }), this.productService.nameShort),
                    detail: (0, nls_1.localize)('confirmOpenDetail', "If you did not initiate this request, it may represent an attempted attack on your system. Unless you took an explicit action to initiate this request, you should press 'No'"),
                }, this.productService);
                const res = buttonIndeces[electron_1.dialog.showMessageBoxSync(options)];
                if (res === 1) {
                    return true;
                }
            }
            return false;
        }
        getWindowOpenableFromProtocolUrl(uri) {
            if (!uri.path) {
                return undefined;
            }
            // File path
            if (uri.authority === network_1.Schemas.file) {
                const fileUri = uri_1.URI.file(uri.fsPath);
                if ((0, workspace_1.hasWorkspaceFileExtension)(fileUri)) {
                    return { workspaceUri: fileUri };
                }
                return { fileUri };
            }
            // Remote path
            else if (uri.authority === network_1.Schemas.vscodeRemote) {
                // Example conversion:
                // From: vscode://vscode-remote/wsl+ubuntu/mnt/c/GitDevelopment/monaco
                //   To: vscode-remote://wsl+ubuntu/mnt/c/GitDevelopment/monaco
                const secondSlash = uri.path.indexOf(path_1.posix.sep, 1 /* skip over the leading slash */);
                if (secondSlash !== -1) {
                    const authority = uri.path.substring(1, secondSlash);
                    const path = uri.path.substring(secondSlash);
                    let query = uri.query;
                    const params = new URLSearchParams(uri.query);
                    if (params.get('windowId') === '_blank') {
                        // Make sure to unset any `windowId=_blank` here
                        // https://github.com/microsoft/vscode/issues/191902
                        params.delete('windowId');
                        query = params.toString();
                    }
                    const remoteUri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, authority, path, query, fragment: uri.fragment });
                    if ((0, workspace_1.hasWorkspaceFileExtension)(path)) {
                        return { workspaceUri: remoteUri };
                    }
                    if (/:[\d]+$/.test(path)) {
                        // path with :line:column syntax
                        return { fileUri: remoteUri };
                    }
                    return { folderUri: remoteUri };
                }
            }
            return undefined;
        }
        async handleProtocolUrl(windowsMainService, urlService, uri, options) {
            this.logService.trace('app#handleProtocolUrl():', uri.toString(true), options);
            // Support 'workspace' URLs (https://github.com/microsoft/vscode/issues/124263)
            if (uri.scheme === this.productService.urlProtocol && uri.path === 'workspace') {
                uri = uri.with({
                    authority: 'file',
                    path: uri_1.URI.parse(uri.query).path,
                    query: ''
                });
            }
            // If URI should be blocked, behave as if it's handled
            if (this.shouldBlockURI(uri)) {
                this.logService.trace('app#handleProtocolUrl() protocol url was blocked:', uri.toString(true));
                return true;
            }
            let shouldOpenInNewWindow = false;
            // We should handle the URI in a new window if the URL contains `windowId=_blank`
            const params = new URLSearchParams(uri.query);
            if (params.get('windowId') === '_blank') {
                this.logService.trace(`app#handleProtocolUrl() found 'windowId=_blank' as parameter, setting shouldOpenInNewWindow=true:`, uri.toString(true));
                params.delete('windowId');
                uri = uri.with({ query: params.toString() });
                shouldOpenInNewWindow = true;
            }
            // or if no window is open (macOS only)
            else if (platform_1.isMacintosh && windowsMainService.getWindowCount() === 0) {
                this.logService.trace(`app#handleProtocolUrl() running on macOS with no window open, setting shouldOpenInNewWindow=true:`, uri.toString(true));
                shouldOpenInNewWindow = true;
            }
            // Pass along whether the application is being opened via a Continue On flow
            const continueOn = params.get('continueOn');
            if (continueOn !== null) {
                this.logService.trace(`app#handleProtocolUrl() found 'continueOn' as parameter:`, uri.toString(true));
                params.delete('continueOn');
                uri = uri.with({ query: params.toString() });
                this.environmentMainService.continueOn = continueOn ?? undefined;
            }
            // Check if the protocol URL is a window openable to open...
            const windowOpenableFromProtocolUrl = this.getWindowOpenableFromProtocolUrl(uri);
            if (windowOpenableFromProtocolUrl) {
                this.logService.trace('app#handleProtocolUrl() opening protocol url as window:', windowOpenableFromProtocolUrl, uri.toString(true));
                const window = (0, arrays_1.firstOrDefault)(await windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    cli: { ...this.environmentMainService.args },
                    urisToOpen: [windowOpenableFromProtocolUrl],
                    forceNewWindow: shouldOpenInNewWindow,
                    gotoLineMode: true
                    // remoteAuthority: will be determined based on windowOpenableFromProtocolUrl
                }));
                window?.focus(); // this should help ensuring that the right window gets focus when multiple are opened
                return true;
            }
            // ...or if we should open in a new window and then handle it within that window
            if (shouldOpenInNewWindow) {
                this.logService.trace('app#handleProtocolUrl() opening empty window and passing in protocol url:', uri.toString(true));
                const window = (0, arrays_1.firstOrDefault)(await windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    cli: { ...this.environmentMainService.args },
                    forceNewWindow: true,
                    forceEmpty: true,
                    gotoLineMode: true,
                    remoteAuthority: (0, remoteHosts_1.getRemoteAuthority)(uri)
                }));
                await window?.ready();
                return urlService.open(uri, options);
            }
            this.logService.trace('app#handleProtocolUrl(): not handled', uri.toString(true), options);
            return false;
        }
        setupSharedProcess(machineId) {
            const sharedProcess = this._register(this.mainInstantiationService.createInstance(sharedProcess_1.SharedProcess, machineId));
            const sharedProcessClient = (async () => {
                this.logService.trace('Main->SharedProcess#connect');
                const port = await sharedProcess.connect();
                this.logService.trace('Main->SharedProcess#connect: connection established');
                return new ipc_mp_1.Client(port, 'main');
            })();
            const sharedProcessReady = (async () => {
                await sharedProcess.whenReady();
                return sharedProcessClient;
            })();
            return { sharedProcessReady, sharedProcessClient };
        }
        async initServices(machineId, sharedProcessReady) {
            const services = new serviceCollection_1.ServiceCollection();
            // Update
            switch (process.platform) {
                case 'win32':
                    services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_win32_1.Win32UpdateService));
                    break;
                case 'linux':
                    if (platform_1.isLinuxSnap) {
                        services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_snap_1.SnapUpdateService, [process.env['SNAP'], process.env['SNAP_REVISION']]));
                    }
                    else {
                        services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_linux_1.LinuxUpdateService));
                    }
                    break;
                case 'darwin':
                    services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_darwin_1.DarwinUpdateService));
                    break;
            }
            // Windows
            services.set(windows_1.IWindowsMainService, new descriptors_1.SyncDescriptor(windowsMainService_1.WindowsMainService, [machineId, this.userEnv], false));
            // Dialogs
            const dialogMainService = new dialogMainService_1.DialogMainService(this.logService, this.productService);
            services.set(dialogMainService_1.IDialogMainService, dialogMainService);
            // Launch
            services.set(launchMainService_1.ILaunchMainService, new descriptors_1.SyncDescriptor(launchMainService_1.LaunchMainService, undefined, false /* proxied to other processes */));
            // Diagnostics
            services.set(diagnosticsMainService_1.IDiagnosticsMainService, new descriptors_1.SyncDescriptor(diagnosticsMainService_1.DiagnosticsMainService, undefined, false /* proxied to other processes */));
            services.set(diagnostics_1.IDiagnosticsService, ipc_1.ProxyChannel.toService((0, ipc_1.getDelayedChannel)(sharedProcessReady.then(client => client.getChannel('diagnostics')))));
            // Issues
            services.set(issue_1.IIssueMainService, new descriptors_1.SyncDescriptor(issueMainService_1.IssueMainService, [this.userEnv]));
            // Encryption
            services.set(encryptionService_1.IEncryptionMainService, new descriptors_1.SyncDescriptor(encryptionMainService_1.EncryptionMainService));
            // Keyboard Layout
            services.set(keyboardLayoutMainService_1.IKeyboardLayoutMainService, new descriptors_1.SyncDescriptor(keyboardLayoutMainService_1.KeyboardLayoutMainService));
            // Native Host
            services.set(nativeHostMainService_1.INativeHostMainService, new descriptors_1.SyncDescriptor(nativeHostMainService_1.NativeHostMainService, undefined, false /* proxied to other processes */));
            // Webview Manager
            services.set(webviewManagerService_1.IWebviewManagerService, new descriptors_1.SyncDescriptor(webviewMainService_1.WebviewMainService));
            // Menubar
            services.set(menubarMainService_1.IMenubarMainService, new descriptors_1.SyncDescriptor(menubarMainService_1.MenubarMainService));
            // Extension URL Trust
            services.set(extensionUrlTrust_1.IExtensionUrlTrustService, new descriptors_1.SyncDescriptor(extensionUrlTrustService_1.ExtensionUrlTrustService));
            // Extension Host Starter
            services.set(extensionHostStarter_1.IExtensionHostStarter, new descriptors_1.SyncDescriptor(extensionHostStarter_2.ExtensionHostStarter));
            // Storage
            services.set(storageMainService_1.IStorageMainService, new descriptors_1.SyncDescriptor(storageMainService_1.StorageMainService));
            services.set(storageMainService_1.IApplicationStorageMainService, new descriptors_1.SyncDescriptor(storageMainService_1.ApplicationStorageMainService));
            // Terminal
            const ptyHostStarter = new electronPtyHostStarter_1.ElectronPtyHostStarter({
                graceTime: 60000 /* LocalReconnectConstants.GraceTime */,
                shortGraceTime: 6000 /* LocalReconnectConstants.ShortGraceTime */,
                scrollback: this.configurationService.getValue("terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */) ?? 100
            }, this.configurationService, this.environmentMainService, this.lifecycleMainService, this.logService);
            const ptyHostService = new ptyHostService_1.PtyHostService(ptyHostStarter, this.configurationService, this.logService, this.loggerService);
            services.set(terminal_1.ILocalPtyService, ptyHostService);
            // External terminal
            if (platform_1.isWindows) {
                services.set(externalTerminal_1.IExternalTerminalMainService, new descriptors_1.SyncDescriptor(externalTerminalService_1.WindowsExternalTerminalService));
            }
            else if (platform_1.isMacintosh) {
                services.set(externalTerminal_1.IExternalTerminalMainService, new descriptors_1.SyncDescriptor(externalTerminalService_1.MacExternalTerminalService));
            }
            else if (platform_1.isLinux) {
                services.set(externalTerminal_1.IExternalTerminalMainService, new descriptors_1.SyncDescriptor(externalTerminalService_1.LinuxExternalTerminalService));
            }
            // Backups
            const backupMainService = new backupMainService_1.BackupMainService(this.environmentMainService, this.configurationService, this.logService, this.stateService);
            services.set(backup_1.IBackupMainService, backupMainService);
            // Workspaces
            const workspacesManagementMainService = new workspacesManagementMainService_1.WorkspacesManagementMainService(this.environmentMainService, this.logService, this.userDataProfilesMainService, backupMainService, dialogMainService);
            services.set(workspacesManagementMainService_1.IWorkspacesManagementMainService, workspacesManagementMainService);
            services.set(workspaces_1.IWorkspacesService, new descriptors_1.SyncDescriptor(workspacesMainService_1.WorkspacesMainService, undefined, false /* proxied to other processes */));
            services.set(workspacesHistoryMainService_1.IWorkspacesHistoryMainService, new descriptors_1.SyncDescriptor(workspacesHistoryMainService_1.WorkspacesHistoryMainService, undefined, false));
            // URL handling
            services.set(url_1.IURLService, new descriptors_1.SyncDescriptor(urlService_1.NativeURLService, undefined, false /* proxied to other processes */));
            // Telemetry
            if ((0, telemetryUtils_1.supportsTelemetry)(this.productService, this.environmentMainService)) {
                const isInternal = (0, telemetryUtils_1.isInternalTelemetry)(this.productService, this.configurationService);
                const channel = (0, ipc_1.getDelayedChannel)(sharedProcessReady.then(client => client.getChannel('telemetryAppender')));
                const appender = new telemetryIpc_1.TelemetryAppenderClient(channel);
                const commonProperties = (0, commonProperties_1.resolveCommonProperties)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, this.productService.commit, this.productService.version, machineId, isInternal);
                const piiPaths = (0, telemetryUtils_1.getPiiPathsFromEnvironment)(this.environmentMainService);
                const config = { appenders: [appender], commonProperties, piiPaths, sendErrorTelemetry: true };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, [config], false));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            // Default Extensions Profile Init
            services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService, undefined, true));
            services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService, undefined, true));
            // Utility Process Worker
            services.set(utilityProcessWorkerMainService_1.IUtilityProcessWorkerMainService, new descriptors_1.SyncDescriptor(utilityProcessWorkerMainService_1.UtilityProcessWorkerMainService, undefined, true));
            // Init services that require it
            await async_1.Promises.settled([
                backupMainService.initialize(),
                workspacesManagementMainService.initialize()
            ]);
            return this.mainInstantiationService.createChild(services);
        }
        initChannels(accessor, mainProcessElectronServer, sharedProcessClient) {
            // Channels registered to node.js are exposed to second instances
            // launching because that is the only way the second instance
            // can talk to the first instance. Electron IPC does not work
            // across apps until `requestSingleInstance` APIs are adopted.
            const disposables = this._register(new lifecycle_1.DisposableStore());
            const launchChannel = ipc_1.ProxyChannel.fromService(accessor.get(launchMainService_1.ILaunchMainService), disposables, { disableMarshalling: true });
            this.mainProcessNodeIpcServer.registerChannel('launch', launchChannel);
            const diagnosticsChannel = ipc_1.ProxyChannel.fromService(accessor.get(diagnosticsMainService_1.IDiagnosticsMainService), disposables, { disableMarshalling: true });
            this.mainProcessNodeIpcServer.registerChannel('diagnostics', diagnosticsChannel);
            // Policies (main & shared process)
            const policyChannel = new policyIpc_1.PolicyChannel(accessor.get(policy_1.IPolicyService));
            mainProcessElectronServer.registerChannel('policy', policyChannel);
            sharedProcessClient.then(client => client.registerChannel('policy', policyChannel));
            // Local Files
            const diskFileSystemProvider = this.fileService.getProvider(network_1.Schemas.file);
            (0, types_1.assertType)(diskFileSystemProvider instanceof diskFileSystemProvider_1.DiskFileSystemProvider);
            const fileSystemProviderChannel = new diskFileSystemProviderServer_1.DiskFileSystemProviderChannel(diskFileSystemProvider, this.logService, this.environmentMainService);
            mainProcessElectronServer.registerChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME, fileSystemProviderChannel);
            sharedProcessClient.then(client => client.registerChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME, fileSystemProviderChannel));
            // User Data Profiles
            const userDataProfilesService = ipc_1.ProxyChannel.fromService(accessor.get(userDataProfile_1.IUserDataProfilesMainService), disposables);
            mainProcessElectronServer.registerChannel('userDataProfiles', userDataProfilesService);
            sharedProcessClient.then(client => client.registerChannel('userDataProfiles', userDataProfilesService));
            // Request
            const requestService = new requestIpc_1.RequestChannel(accessor.get(request_1.IRequestService));
            sharedProcessClient.then(client => client.registerChannel('request', requestService));
            // Update
            const updateChannel = new updateIpc_1.UpdateChannel(accessor.get(update_1.IUpdateService));
            mainProcessElectronServer.registerChannel('update', updateChannel);
            // Issues
            const issueChannel = ipc_1.ProxyChannel.fromService(accessor.get(issue_1.IIssueMainService), disposables);
            mainProcessElectronServer.registerChannel('issue', issueChannel);
            // Encryption
            const encryptionChannel = ipc_1.ProxyChannel.fromService(accessor.get(encryptionService_1.IEncryptionMainService), disposables);
            mainProcessElectronServer.registerChannel('encryption', encryptionChannel);
            // Signing
            const signChannel = ipc_1.ProxyChannel.fromService(accessor.get(sign_1.ISignService), disposables);
            mainProcessElectronServer.registerChannel('sign', signChannel);
            // Keyboard Layout
            const keyboardLayoutChannel = ipc_1.ProxyChannel.fromService(accessor.get(keyboardLayoutMainService_1.IKeyboardLayoutMainService), disposables);
            mainProcessElectronServer.registerChannel('keyboardLayout', keyboardLayoutChannel);
            // Native host (main & shared process)
            this.nativeHostMainService = accessor.get(nativeHostMainService_1.INativeHostMainService);
            const nativeHostChannel = ipc_1.ProxyChannel.fromService(this.nativeHostMainService, disposables);
            mainProcessElectronServer.registerChannel('nativeHost', nativeHostChannel);
            sharedProcessClient.then(client => client.registerChannel('nativeHost', nativeHostChannel));
            // Workspaces
            const workspacesChannel = ipc_1.ProxyChannel.fromService(accessor.get(workspaces_1.IWorkspacesService), disposables);
            mainProcessElectronServer.registerChannel('workspaces', workspacesChannel);
            // Menubar
            const menubarChannel = ipc_1.ProxyChannel.fromService(accessor.get(menubarMainService_1.IMenubarMainService), disposables);
            mainProcessElectronServer.registerChannel('menubar', menubarChannel);
            // URL handling
            const urlChannel = ipc_1.ProxyChannel.fromService(accessor.get(url_1.IURLService), disposables);
            mainProcessElectronServer.registerChannel('url', urlChannel);
            // Extension URL Trust
            const extensionUrlTrustChannel = ipc_1.ProxyChannel.fromService(accessor.get(extensionUrlTrust_1.IExtensionUrlTrustService), disposables);
            mainProcessElectronServer.registerChannel('extensionUrlTrust', extensionUrlTrustChannel);
            // Webview Manager
            const webviewChannel = ipc_1.ProxyChannel.fromService(accessor.get(webviewManagerService_1.IWebviewManagerService), disposables);
            mainProcessElectronServer.registerChannel('webview', webviewChannel);
            // Storage (main & shared process)
            const storageChannel = this._register(new storageIpc_1.StorageDatabaseChannel(this.logService, accessor.get(storageMainService_1.IStorageMainService)));
            mainProcessElectronServer.registerChannel('storage', storageChannel);
            sharedProcessClient.then(client => client.registerChannel('storage', storageChannel));
            // Profile Storage Changes Listener (shared process)
            const profileStorageListener = this._register(new userDataProfileStorageIpc_1.ProfileStorageChangesListenerChannel(accessor.get(storageMainService_1.IStorageMainService), accessor.get(userDataProfile_1.IUserDataProfilesMainService), this.logService));
            sharedProcessClient.then(client => client.registerChannel('profileStorageListener', profileStorageListener));
            // Terminal
            const ptyHostChannel = ipc_1.ProxyChannel.fromService(accessor.get(terminal_1.ILocalPtyService), disposables);
            mainProcessElectronServer.registerChannel(terminal_1.TerminalIpcChannels.LocalPty, ptyHostChannel);
            // External Terminal
            const externalTerminalChannel = ipc_1.ProxyChannel.fromService(accessor.get(externalTerminal_1.IExternalTerminalMainService), disposables);
            mainProcessElectronServer.registerChannel('externalTerminal', externalTerminalChannel);
            // Logger
            const loggerChannel = new logIpc_1.LoggerChannel(accessor.get(loggerService_1.ILoggerMainService));
            mainProcessElectronServer.registerChannel('logger', loggerChannel);
            sharedProcessClient.then(client => client.registerChannel('logger', loggerChannel));
            // Extension Host Debug Broadcasting
            const electronExtensionHostDebugBroadcastChannel = new extensionHostDebugIpc_1.ElectronExtensionHostDebugBroadcastChannel(accessor.get(windows_1.IWindowsMainService));
            mainProcessElectronServer.registerChannel('extensionhostdebugservice', electronExtensionHostDebugBroadcastChannel);
            // Extension Host Starter
            const extensionHostStarterChannel = ipc_1.ProxyChannel.fromService(accessor.get(extensionHostStarter_1.IExtensionHostStarter), disposables);
            mainProcessElectronServer.registerChannel(extensionHostStarter_1.ipcExtensionHostStarterChannelName, extensionHostStarterChannel);
            // Utility Process Worker
            const utilityProcessWorkerChannel = ipc_1.ProxyChannel.fromService(accessor.get(utilityProcessWorkerMainService_1.IUtilityProcessWorkerMainService), disposables);
            mainProcessElectronServer.registerChannel(utilityProcessWorkerService_1.ipcUtilityProcessWorkerChannelName, utilityProcessWorkerChannel);
        }
        async openFirstWindow(accessor, initialProtocolUrls) {
            const windowsMainService = this.windowsMainService = accessor.get(windows_1.IWindowsMainService);
            const context = (0, argvHelper_1.isLaunchedFromCli)(process.env) ? 0 /* OpenContext.CLI */ : 4 /* OpenContext.DESKTOP */;
            const args = this.environmentMainService.args;
            // First check for windows from protocol links to open
            if (initialProtocolUrls) {
                // Openables can open as windows directly
                if (initialProtocolUrls.openables.length > 0) {
                    return windowsMainService.open({
                        context,
                        cli: args,
                        urisToOpen: initialProtocolUrls.openables,
                        gotoLineMode: true,
                        initialStartup: true
                        // remoteAuthority: will be determined based on openables
                    });
                }
                // Protocol links with `windowId=_blank` on startup
                // should be handled in a special way:
                // We take the first one of these and open an empty
                // window for it. This ensures we are not restoring
                // all windows of the previous session.
                // If there are any more URLs like these, they will
                // be handled from the URL listeners installed later.
                if (initialProtocolUrls.urls.length > 0) {
                    for (const protocolUrl of initialProtocolUrls.urls) {
                        const params = new URLSearchParams(protocolUrl.uri.query);
                        if (params.get('windowId') === '_blank') {
                            // It is important here that we remove `windowId=_blank` from
                            // this URL because here we open an empty window for it.
                            params.delete('windowId');
                            protocolUrl.originalUrl = protocolUrl.uri.toString(true);
                            protocolUrl.uri = protocolUrl.uri.with({ query: params.toString() });
                            return windowsMainService.open({
                                context,
                                cli: args,
                                forceNewWindow: true,
                                forceEmpty: true,
                                gotoLineMode: true,
                                initialStartup: true
                                // remoteAuthority: will be determined based on openables
                            });
                        }
                    }
                }
            }
            const macOpenFiles = global.macOpenFiles;
            const hasCliArgs = args._.length;
            const hasFolderURIs = !!args['folder-uri'];
            const hasFileURIs = !!args['file-uri'];
            const noRecentEntry = args['skip-add-to-recently-opened'] === true;
            const waitMarkerFileURI = args.wait && args.waitMarkerFilePath ? uri_1.URI.file(args.waitMarkerFilePath) : undefined;
            const remoteAuthority = args.remote || undefined;
            const forceProfile = args.profile;
            const forceTempProfile = args['profile-temp'];
            // Started without file/folder arguments
            if (!hasCliArgs && !hasFolderURIs && !hasFileURIs) {
                // Force new window
                if (args['new-window'] || forceProfile || forceTempProfile) {
                    return windowsMainService.open({
                        context,
                        cli: args,
                        forceNewWindow: true,
                        forceEmpty: true,
                        noRecentEntry,
                        waitMarkerFileURI,
                        initialStartup: true,
                        remoteAuthority,
                        forceProfile,
                        forceTempProfile
                    });
                }
                // mac: open-file event received on startup
                if (macOpenFiles.length) {
                    return windowsMainService.open({
                        context: 1 /* OpenContext.DOCK */,
                        cli: args,
                        urisToOpen: macOpenFiles.map(path => ((0, workspace_1.hasWorkspaceFileExtension)(path) ? { workspaceUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })),
                        noRecentEntry,
                        waitMarkerFileURI,
                        initialStartup: true,
                        // remoteAuthority: will be determined based on macOpenFiles
                    });
                }
            }
            // default: read paths from cli
            return windowsMainService.open({
                context,
                cli: args,
                forceNewWindow: args['new-window'] || (!hasCliArgs && args['unity-launch']),
                diffMode: args.diff,
                mergeMode: args.merge,
                noRecentEntry,
                waitMarkerFileURI,
                gotoLineMode: args.goto,
                initialStartup: true,
                remoteAuthority,
                forceProfile,
                forceTempProfile
            });
        }
        afterWindowOpen() {
            // Windows: mutex
            this.installMutex();
            // Remote Authorities
            electron_1.protocol.registerHttpProtocol(network_1.Schemas.vscodeRemoteResource, (request, callback) => {
                callback({
                    url: request.url.replace(/^vscode-remote-resource:/, 'http:'),
                    method: request.method
                });
            });
            // Start to fetch shell environment (if needed) after window has opened
            // Since this operation can take a long time, we want to warm it up while
            // the window is opening.
            // We also show an error to the user in case this fails.
            this.resolveShellEnvironment(this.environmentMainService.args, process.env, true);
            // Crash reporter
            this.updateCrashReporterEnablement();
            if (platform_1.isMacintosh && electron_1.app.runningUnderARM64Translation) {
                this.windowsMainService?.sendToFocused('vscode:showTranslatedBuildWarning');
            }
        }
        async installMutex() {
            const win32MutexName = this.productService.win32MutexName;
            if (platform_1.isWindows && win32MutexName) {
                try {
                    const WindowsMutex = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-mutex'], resolve_1, reject_1); });
                    const mutex = new WindowsMutex.Mutex(win32MutexName);
                    (0, functional_1.once)(this.lifecycleMainService.onWillShutdown)(() => mutex.release());
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
        async resolveShellEnvironment(args, env, notifyOnError) {
            try {
                return await (0, shellEnv_1.getResolvedShellEnv)(this.configurationService, this.logService, args, env);
            }
            catch (error) {
                const errorMessage = (0, errorMessage_1.toErrorMessage)(error);
                if (notifyOnError) {
                    this.windowsMainService?.sendToFocused('vscode:showResolveShellEnvError', errorMessage);
                }
                else {
                    this.logService.error(errorMessage);
                }
            }
            return {};
        }
        async updateCrashReporterEnablement() {
            // If enable-crash-reporter argv is undefined then this is a fresh start,
            // based on `telemetry.enableCrashreporter` settings, generate a UUID which
            // will be used as crash reporter id and also update the json file.
            try {
                const argvContent = await this.fileService.readFile(this.environmentMainService.argvResource);
                const argvString = argvContent.value.toString();
                const argvJSON = JSON.parse((0, json_1.stripComments)(argvString));
                const telemetryLevel = (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService);
                const enableCrashReporter = telemetryLevel >= 1 /* TelemetryLevel.CRASH */;
                // Initial startup
                if (argvJSON['enable-crash-reporter'] === undefined) {
                    const additionalArgvContent = [
                        '',
                        '	// Allows to disable crash reporting.',
                        '	// Should restart the app if the value is changed.',
                        `	"enable-crash-reporter": ${enableCrashReporter},`,
                        '',
                        '	// Unique id used for correlating crash reports sent from this instance.',
                        '	// Do not edit this value.',
                        `	"crash-reporter-id": "${(0, uuid_1.generateUuid)()}"`,
                        '}'
                    ];
                    const newArgvString = argvString.substring(0, argvString.length - 2).concat(',\n', additionalArgvContent.join('\n'));
                    await this.fileService.writeFile(this.environmentMainService.argvResource, buffer_1.VSBuffer.fromString(newArgvString));
                }
                // Subsequent startup: update crash reporter value if changed
                else {
                    const newArgvString = argvString.replace(/"enable-crash-reporter": .*,/, `"enable-crash-reporter": ${enableCrashReporter},`);
                    if (newArgvString !== argvString) {
                        await this.fileService.writeFile(this.environmentMainService.argvResource, buffer_1.VSBuffer.fromString(newArgvString));
                    }
                }
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    };
    exports.CodeApplication = CodeApplication;
    exports.CodeApplication = CodeApplication = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, log_1.ILogService),
        __param(4, log_1.ILoggerService),
        __param(5, environmentMainService_1.IEnvironmentMainService),
        __param(6, lifecycleMainService_1.ILifecycleMainService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, state_1.IStateService),
        __param(9, files_1.IFileService),
        __param(10, productService_1.IProductService),
        __param(11, userDataProfile_1.IUserDataProfilesMainService)
    ], CodeApplication);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvY29kZS9lbGVjdHJvbi1tYWluL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5SGhHOzs7T0FHRztJQUNJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7UUFLOUMsWUFDa0Isd0JBQXVDLEVBQ3ZDLE9BQTRCLEVBQ0wsd0JBQStDLEVBQ3pELFVBQXVCLEVBQ3BCLGFBQTZCLEVBQ3BCLHNCQUErQyxFQUNqRCxvQkFBMkMsRUFDM0Msb0JBQTJDLEVBQ25ELFlBQTJCLEVBQzVCLFdBQXlCLEVBQ3RCLGNBQStCLEVBQ2xCLDJCQUF5RDtZQUV4RyxLQUFLLEVBQUUsQ0FBQztZQWJTLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBZTtZQUN2QyxZQUFPLEdBQVAsT0FBTyxDQUFxQjtZQUNMLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBdUI7WUFDekQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNwQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDcEIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUNqRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbkQsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDdEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2xCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBOEI7WUFJeEcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGdCQUFnQjtZQUV2QixtRkFBbUY7WUFDbkYsRUFBRTtZQUNGLDZEQUE2RDtZQUM3RCxFQUFFO1lBRUYsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGFBQWlDLEVBQUUsRUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsR0FBRyxpQkFBTyxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUM7WUFFekgsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLEdBQUcsQ0FDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQ3pELENBQUM7WUFFRixNQUFNLDJCQUEyQixHQUFHLElBQUksR0FBRyxDQUFDO2dCQUMzQyxnQkFBZ0I7Z0JBQ2hCLDJCQUEyQjthQUMzQixDQUFDLENBQUM7WUFFSCxrQkFBTyxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNsRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDNUMsT0FBTyxRQUFRLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBQzdEO2dCQUVELElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsY0FBYyxLQUFLLDJCQUEyQixFQUFFO29CQUNsRixPQUFPLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDL0Q7Z0JBRUQsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxrQkFBTyxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUMvRixJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDNUMsT0FBTywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ25EO2dCQUVELElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsY0FBYyxLQUFLLDJCQUEyQixFQUFFO29CQUNsRixPQUFPLDZCQUE2QixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDckQ7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUVILFlBQVk7WUFFWiwyQkFBMkI7WUFFM0Isa0RBQWtEO1lBQ2xELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxpQkFBTyxDQUFDLGtCQUFrQixFQUFFLGlCQUFPLENBQUMsb0JBQW9CLEVBQUUsaUJBQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRS9KLHdEQUF3RDtZQUN4RCxNQUFNLFdBQVcsR0FBRyxDQUFDLFlBQXNDLEVBQVcsRUFBRTtnQkFDdkUsS0FBSyxJQUFJLEtBQUssR0FBb0MsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtvQkFDNUYsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLGlCQUFPLENBQUMsYUFBYSxLQUFLLENBQUMsRUFBRTt3QkFDeEQsT0FBTyxJQUFJLENBQUM7cUJBQ1o7aUJBQ0Q7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUM7WUFFRixNQUFNLDJCQUEyQixHQUFHLENBQUMsT0FBNEYsRUFBVyxFQUFFO2dCQUM3SSxPQUFPLE9BQU8sQ0FBQyxZQUFZLEtBQUssS0FBSyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckUsQ0FBQyxDQUFDO1lBRUYsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLE9BQWdELEVBQUUsRUFBRTtnQkFDdkYsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDdkMsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsbUhBQW1IO2dCQUNuSCxNQUFNLE9BQU8sR0FBRyx3QkFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUM5QyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtvQkFDN0IsSUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTt3QkFDL0QsT0FBTyxJQUFJLENBQUM7cUJBQ1o7aUJBQ0Q7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUM7WUFFRixNQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBUSxFQUFFLE9BQWdELEVBQVcsRUFBRTtnQkFDdkcsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGFBQWEsRUFBRTtvQkFDL0IsT0FBTyxJQUFJLENBQUMsQ0FBQyx1REFBdUQ7aUJBQ3BFO2dCQUVELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3ZDLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELHlFQUF5RTtnQkFDekUsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQzFELElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRTt3QkFDZixJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTs0QkFDbkUsT0FBTyxJQUFJLENBQUM7eUJBQ1o7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUM7WUFFRixrQkFBTyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUN2RSxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsYUFBYSxFQUFFO29CQUN6QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3JFLE9BQU8sUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQ2xDO2lCQUNEO2dCQUVELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLGtCQUFrQixFQUFFO29CQUM5QyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDbEUsT0FBTyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDbEM7aUJBQ0Q7Z0JBRUQsa0JBQWtCO2dCQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM5QixNQUFNLGlCQUFpQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzlELElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDdkIsT0FBTyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ25FO2lCQUNEO2dCQUVELE9BQU8sUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7WUFFSCw2Q0FBNkM7WUFDN0MsbURBQW1EO1lBQ25ELGtCQUFPLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDekUsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQXdELENBQUM7Z0JBQ3pGLE1BQU0sWUFBWSxHQUFHLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUUxRixJQUFJLFlBQVksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUNoRCxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDOUIsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUN4QyxlQUFlLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQzs0QkFFcEQsT0FBTyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7eUJBQ3BEO3FCQUNEO29CQUVELHFEQUFxRDtvQkFDckQsdURBQXVEO29CQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUU7d0JBQzFJLE9BQU8sUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNuRTtpQkFDRDtnQkFFRCxPQUFPLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDO1lBY0gsTUFBTSxjQUFjLEdBQUcsa0JBQU8sQ0FBQyxjQUE0RCxDQUFDO1lBQzVGLElBQUksT0FBTyxjQUFjLENBQUMsZ0JBQWdCLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZHLG9EQUFvRDtnQkFDcEQsaURBQWlEO2dCQUNqRCw2Q0FBNkM7Z0JBQzdDLHNEQUFzRDtnQkFDdEQsY0FBYyxDQUFDLGdCQUFnQixDQUFDLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUMzRjtZQUVELFlBQVk7WUFFWixzQ0FBc0M7WUFFdEMsSUFBSSxvQkFBUyxFQUFFO2dCQUNkLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEtBQUssRUFBRTtvQkFDL0UsSUFBQSxrQ0FBNEIsR0FBRSxDQUFDO2lCQUMvQjtxQkFBTTtvQkFDTixJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO2lCQUN0RjthQUNEO1lBRUQsWUFBWTtRQUNiLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsMkZBQTJGO1lBQzNGLElBQUEsa0NBQXlCLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsRSxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsSUFBQSx1QkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMzQixJQUFBLDBCQUFpQixFQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN6QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFLENBQUMsSUFBQSwwQkFBaUIsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRWpGLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRS9ELDhCQUE4QjtZQUM5QixJQUFBLHlDQUEyQixHQUFFLENBQUM7WUFFOUIsNkJBQTZCO1lBQzdCLGNBQUcsQ0FBQyxFQUFFLENBQUMsK0JBQStCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsMkJBQTJCLEVBQUUsRUFBRTtnQkFDOUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxvQ0FBb0MsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBQ3ZHLENBQUMsQ0FBQyxDQUFDO1lBRUgsc0JBQXNCO1lBQ3RCLGNBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsRUFBRTtnQkFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRXRDLHdEQUF3RDtnQkFDeEQsSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUN2QixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxlQUFlLENBQUMsRUFBRSxPQUFPLDBCQUFrQixFQUFFLENBQUMsQ0FBQztpQkFDOUU7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILG1GQUFtRjtZQUNuRixFQUFFO1lBQ0YsNkRBQTZEO1lBQzdELEVBQUU7WUFDRixjQUFHLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUVsRCxRQUFRLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQztvQkFFcEYsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QixDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxZQUFZLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUgsWUFBWTtZQUVaLElBQUksZUFBZSxHQUFzQixFQUFFLENBQUM7WUFDNUMsSUFBSSxjQUFjLEdBQStCLFNBQVMsQ0FBQztZQUMzRCxjQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9DLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFFdkIseUNBQXlDO2dCQUN6QyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUEscUNBQXlCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXZILGdDQUFnQztnQkFDaEMsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUNqQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQzdCLGNBQWMsR0FBRyxTQUFTLENBQUM7aUJBQzNCO2dCQUVELGdEQUFnRDtnQkFDaEQsY0FBYyxHQUFHLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDdEMsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDO3dCQUNuQyxPQUFPLDBCQUFrQixDQUFDLDBEQUEwRDt3QkFDcEYsR0FBRyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJO3dCQUNyQyxVQUFVLEVBQUUsZUFBZTt3QkFDM0IsWUFBWSxFQUFFLEtBQUs7d0JBQ25CLGVBQWUsRUFBRSxJQUFJLENBQUMsaUZBQWlGO3FCQUN2RyxDQUFDLENBQUM7b0JBRUgsZUFBZSxHQUFHLEVBQUUsQ0FBQztvQkFDckIsY0FBYyxHQUFHLFNBQVMsQ0FBQztnQkFDNUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1QsQ0FBQyxDQUFDLENBQUM7WUFFSCxjQUFHLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUN2QyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxlQUFlLENBQUMsRUFBRSxPQUFPLDZCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjtZQUNoSCxDQUFDLENBQUMsQ0FBQztZQUVILGdDQUFnQztZQUVoQywwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBRXZELHdEQUF3RDtnQkFDeEQsb0RBQW9EO2dCQUNwRCxxREFBcUQ7Z0JBQ3JELHdEQUF3RDtnQkFDeEQsd0NBQXdDO2dCQUN4QyxFQUFFO2dCQUNGLHNEQUFzRDtnQkFDdEQsNENBQTRDO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsc0JBQXNCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsdURBQXVEO2dCQUNySSxJQUFJLElBQXNCLENBQUM7Z0JBQzNCLElBQUksR0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxFQUFFO29CQUNuQixJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztvQkFDckIsR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDbkQ7cUJBQU07b0JBQ04sSUFBSSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3hDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2lCQUNsQjtnQkFFRCxvQkFBb0I7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBYSxFQUFFLElBQWEsRUFBRSxFQUFFO2dCQUN0RixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztpQkFDM0Q7Z0JBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUMsQ0FBQztZQUVILDBCQUFnQixDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsS0FBZ0IsRUFBRSxFQUFFO2dCQUNsRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztpQkFDMUQ7Z0JBRUQsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7WUFFSCwwQkFBZ0IsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDckYsMEJBQWdCLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLDBCQUFnQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUUzRSxZQUFZO1FBQ2IsQ0FBQztRQUVPLGVBQWUsQ0FBQyxZQUF1QjtZQUM5QyxJQUFJLElBQUksR0FBdUIsU0FBUyxDQUFDO1lBRXpDLEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFO2dCQUN2QyxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsRUFBRTtvQkFDcEMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7d0JBQzdCLElBQUksR0FBRyxXQUFXLENBQUM7cUJBQ25CO3lCQUFNO3dCQUNOLElBQUksR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7cUJBQy9CO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUEsaUJBQVUsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUEseUJBQWUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixFQUFFLENBQUMsa0JBQU8sQ0FBQyxFQUFFO2dCQUN2SSxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRU8saUJBQWlCLENBQUMsS0FBWTtZQUNyQyxJQUFJLEtBQUssRUFBRTtnQkFFViwyQ0FBMkM7Z0JBQzNDLE1BQU0sYUFBYSxHQUFHO29CQUNyQixPQUFPLEVBQUUsaUNBQWlDLEtBQUssQ0FBQyxPQUFPLEVBQUU7b0JBQ3pELEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztpQkFDbEIsQ0FBQztnQkFFRix3QkFBd0I7Z0JBQ3hCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQzVGO1lBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDaEUsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkM7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU87WUFDWixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVqRSxnRUFBZ0U7WUFDaEUsK0RBQStEO1lBQy9ELGlFQUFpRTtZQUNqRSw2Q0FBNkM7WUFDN0MsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDO1lBQ3BFLElBQUksb0JBQVMsSUFBSSxtQkFBbUIsRUFBRTtnQkFDckMsY0FBRyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDM0M7WUFFRCxpQ0FBaUM7WUFDakMsdUVBQXVFO1lBQ3ZFLHlFQUF5RTtZQUN6RSx3Q0FBd0M7WUFDeEMsb0VBQW9FO1lBQ3BFLCtFQUErRTtZQUMvRSxJQUFJO2dCQUNILElBQUksc0JBQVcsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsNEJBQWlCLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLFNBQVMsQ0FBQyxFQUFFO29CQUMvSiw0QkFBaUIsQ0FBQyxjQUFjLENBQUMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLElBQVcsQ0FBQyxDQUFDO2lCQUNwRjthQUNEO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0I7WUFFRCwyQ0FBMkM7WUFDM0MsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLHFCQUFpQixFQUFFLENBQUM7WUFDMUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLENBQUMsTUFBTSxnQ0FBd0IsRUFBRTtvQkFDckMsbURBQW1EO29CQUNuRCxpREFBaUQ7b0JBQ2pELGtEQUFrRDtvQkFDbEQsa0RBQWtEO29CQUNsRCxXQUFXO29CQUNYLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNwQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsNEJBQTRCO1lBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDekQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLGlDQUFnQixFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLGlCQUFpQjtZQUNqQixNQUFNLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdkYsV0FBVztZQUNYLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBRXZGLGVBQWU7WUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyx1QkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFFekUsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLGlEQUF1QixDQUFDLENBQUMsQ0FBQztZQUVoRixnQkFBZ0I7WUFDaEIsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUseUJBQXlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBRWhJLDhCQUE4QjtZQUM5QixNQUFNLG1CQUFtQixHQUFHLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRW5KLGlEQUFpRDtZQUNqRCxJQUFJLENBQUMsb0NBQW9DLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUVyRSxvREFBb0Q7WUFDcEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssbUNBQTJCLENBQUM7WUFFM0QsZUFBZTtZQUNmLE1BQU0sdUJBQXVCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBRTlHLGtDQUFrQztZQUNsQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyw2Q0FBcUMsQ0FBQztZQUVyRSwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXZCLCtGQUErRjtZQUMvRixNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLHdDQUFnQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVix3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBRU8sd0JBQXdCLENBQUMsUUFBMEIsRUFBRSx5QkFBNEM7WUFDeEcsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBbUIsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDO1lBQzdDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOENBQXNCLENBQUMsQ0FBQztZQUVoRywwREFBMEQ7WUFDMUQsNERBQTREO1lBQzVELHNEQUFzRDtZQUV0RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDakIsVUFBVSxDQUFDLGVBQWUsQ0FBQztnQkFDMUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFRLEVBQUUsT0FBeUI7b0JBQ2xELE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzVFLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxtQ0FBbUIsQ0FBQztnQkFDbEUsZUFBZSxFQUFFLHFCQUFxQixDQUFDLGVBQWU7Z0JBQ3RELGdCQUFnQixFQUFFLHFCQUFxQixDQUFDLGdCQUFnQjtnQkFDeEQsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEUsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLGtCQUFrQixHQUFHLElBQUksa0JBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHlCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRixNQUFNLGlCQUFpQixHQUFHLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMvRixVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksZ0NBQXVCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBRTNFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlDQUFtQixDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFdEssT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRU8sb0NBQW9DLENBQUMseUJBQTRDO1lBQ3hGLE1BQU0sUUFBUSxHQUFHLEdBQThCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUMzRixNQUFNLHFCQUFxQixHQUFHLElBQUksV0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FDaEYsMkRBQWlDLEVBQ2pDLElBQUksa0RBQXdCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDO1lBRUgsbUJBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxpQkFBTyxDQUFDLDJCQUEyQixFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMxRixNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUN6QyxPQUFPLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QjtnQkFFRCxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUE2Qiw4REFBb0MsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUM3RyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUM1RCxHQUFHLENBQUMsRUFBRTtvQkFDTCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDcEUsUUFBUSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTywwQkFBMEI7WUFFakM7OztlQUdHO1lBRUgsOERBQThEO1lBQzlELE1BQU0sMkJBQTJCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDckksSUFBSSwyQkFBMkIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxtRUFBbUUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO2FBQ3hIO1lBRUQsb0VBQW9FO1lBQ3BFLE1BQU0scUJBQXFCLEdBQUcsQ0FBTyxNQUFPLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFhLENBQUM7WUFDOUUsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyw2RUFBNkUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO2FBQzVIO1lBRUQsSUFBSSwyQkFBMkIsQ0FBQyxNQUFNLEdBQUcscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUUsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLFNBQVMsR0FBc0IsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sSUFBSSxHQUFHO2dCQUNaLEdBQUcsMkJBQTJCO2dCQUM5QixHQUFHLHFCQUFxQjthQUN4QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDWCxJQUFJO29CQUNILE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUM7aUJBQ2pEO2dCQUFDLE1BQU07b0JBQ1AsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZ0VBQWdFLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBRTdGLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtZQUNGLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBdUIsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDVCxPQUFPLEtBQUssQ0FBQyxDQUFDLFVBQVU7aUJBQ3hCO2dCQUVELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDREQUE0RCxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRTVHLE9BQU8sS0FBSyxDQUFDLENBQUMsVUFBVTtpQkFDeEI7Z0JBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGtGQUFrRixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUVsSixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUUvQixPQUFPLEtBQUssQ0FBQyxDQUFDLDRCQUE0QjtpQkFDMUM7Z0JBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsNkZBQTZGLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFN0ksT0FBTyxJQUFJLENBQUMsQ0FBQywrQkFBK0I7WUFDN0MsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxjQUFjLENBQUMsR0FBUTtZQUM5QixJQUFJLEdBQUcsQ0FBQyxTQUFTLEtBQUssaUJBQU8sQ0FBQyxJQUFJLElBQUksb0JBQVMsRUFBRTtnQkFDaEQsTUFBTSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsR0FBRyxJQUFBLGtDQUF3QixFQUFDO29CQUMzRCxJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUU7d0JBQ1IsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUM7d0JBQ3RFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDO3FCQUN2RTtvQkFDRCxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsOEZBQThGLEVBQUUsSUFBQSxxQkFBWSxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7b0JBQzNPLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSwrS0FBK0ssQ0FBQztpQkFDdE4sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRXhCLE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxpQkFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzlELElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtvQkFDZCxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sZ0NBQWdDLENBQUMsR0FBUTtZQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtnQkFDZCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELFlBQVk7WUFDWixJQUFJLEdBQUcsQ0FBQyxTQUFTLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ25DLE1BQU0sT0FBTyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyQyxJQUFJLElBQUEscUNBQXlCLEVBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3ZDLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUM7aUJBQ2pDO2dCQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQzthQUNuQjtZQUVELGNBQWM7aUJBQ1QsSUFBSSxHQUFHLENBQUMsU0FBUyxLQUFLLGlCQUFPLENBQUMsWUFBWSxFQUFFO2dCQUVoRCxzQkFBc0I7Z0JBQ3RCLHNFQUFzRTtnQkFDdEUsK0RBQStEO2dCQUUvRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUNyRixJQUFJLFdBQVcsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDdkIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUNyRCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFFN0MsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztvQkFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssUUFBUSxFQUFFO3dCQUN4QyxnREFBZ0Q7d0JBQ2hELG9EQUFvRDt3QkFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDMUIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDMUI7b0JBRUQsTUFBTSxTQUFTLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBRTdHLElBQUksSUFBQSxxQ0FBeUIsRUFBQyxJQUFJLENBQUMsRUFBRTt3QkFDcEMsT0FBTyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsQ0FBQztxQkFDbkM7b0JBRUQsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN6QixnQ0FBZ0M7d0JBQ2hDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7cUJBQzlCO29CQUVELE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7aUJBQ2hDO2FBQ0Q7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLGtCQUF1QyxFQUFFLFVBQXVCLEVBQUUsR0FBUSxFQUFFLE9BQXlCO1lBQ3BJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFL0UsK0VBQStFO1lBQy9FLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtnQkFDL0UsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ2QsU0FBUyxFQUFFLE1BQU07b0JBQ2pCLElBQUksRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJO29CQUMvQixLQUFLLEVBQUUsRUFBRTtpQkFDVCxDQUFDLENBQUM7YUFDSDtZQUVELHNEQUFzRDtZQUN0RCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFL0YsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1lBRWxDLGlGQUFpRjtZQUNqRixNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsbUdBQW1HLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUUvSSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMxQixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUU3QyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7YUFDN0I7WUFFRCx1Q0FBdUM7aUJBQ2xDLElBQUksc0JBQVcsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLG1HQUFtRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFL0kscUJBQXFCLEdBQUcsSUFBSSxDQUFDO2FBQzdCO1lBRUQsNEVBQTRFO1lBQzVFLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNUMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywwREFBMEQsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXRHLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVCLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRTdDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLFNBQVMsQ0FBQzthQUNqRTtZQUVELDREQUE0RDtZQUM1RCxNQUFNLDZCQUE2QixHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqRixJQUFJLDZCQUE2QixFQUFFO2dCQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx5REFBeUQsRUFBRSw2QkFBNkIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXBJLE1BQU0sTUFBTSxHQUFHLElBQUEsdUJBQWMsRUFBQyxNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDM0QsT0FBTyx5QkFBaUI7b0JBQ3hCLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTtvQkFDNUMsVUFBVSxFQUFFLENBQUMsNkJBQTZCLENBQUM7b0JBQzNDLGNBQWMsRUFBRSxxQkFBcUI7b0JBQ3JDLFlBQVksRUFBRSxJQUFJO29CQUNsQiw2RUFBNkU7aUJBQzdFLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLHNGQUFzRjtnQkFFdkcsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELGdGQUFnRjtZQUNoRixJQUFJLHFCQUFxQixFQUFFO2dCQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywyRUFBMkUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXZILE1BQU0sTUFBTSxHQUFHLElBQUEsdUJBQWMsRUFBQyxNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDM0QsT0FBTyx5QkFBaUI7b0JBQ3hCLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTtvQkFDNUMsY0FBYyxFQUFFLElBQUk7b0JBQ3BCLFVBQVUsRUFBRSxJQUFJO29CQUNoQixZQUFZLEVBQUUsSUFBSTtvQkFDbEIsZUFBZSxFQUFFLElBQUEsZ0NBQWtCLEVBQUMsR0FBRyxDQUFDO2lCQUN4QyxDQUFDLENBQUMsQ0FBQztnQkFFSixNQUFNLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztnQkFFdEIsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFM0YsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sa0JBQWtCLENBQUMsU0FBaUI7WUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLDZCQUFhLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUU3RyxNQUFNLG1CQUFtQixHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7Z0JBRXJELE1BQU0sSUFBSSxHQUFHLE1BQU0sYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUUzQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO2dCQUU3RSxPQUFPLElBQUksZUFBaUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVMLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDdEMsTUFBTSxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBRWhDLE9BQU8sbUJBQW1CLENBQUM7WUFDNUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVMLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQWlCLEVBQUUsa0JBQThDO1lBQzNGLE1BQU0sUUFBUSxHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztZQUV6QyxTQUFTO1lBQ1QsUUFBUSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUN6QixLQUFLLE9BQU87b0JBQ1gsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyx3Q0FBa0IsQ0FBQyxDQUFDLENBQUM7b0JBQ3JFLE1BQU07Z0JBRVAsS0FBSyxPQUFPO29CQUNYLElBQUksc0JBQVcsRUFBRTt3QkFDaEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyxzQ0FBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDekg7eUJBQU07d0JBQ04sUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyx3Q0FBa0IsQ0FBQyxDQUFDLENBQUM7cUJBQ3JFO29CQUNELE1BQU07Z0JBRVAsS0FBSyxRQUFRO29CQUNaLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsRUFBRSxJQUFJLDRCQUFjLENBQUMsMENBQW1CLENBQUMsQ0FBQyxDQUFDO29CQUN0RSxNQUFNO2FBQ1A7WUFFRCxVQUFVO1lBQ1YsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBbUIsRUFBRSxJQUFJLDRCQUFjLENBQUMsdUNBQWtCLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFNUcsVUFBVTtZQUNWLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN0RixRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFcEQsU0FBUztZQUNULFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLHFDQUFpQixFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO1lBRTNILGNBQWM7WUFDZCxRQUFRLENBQUMsR0FBRyxDQUFDLGdEQUF1QixFQUFFLElBQUksNEJBQWMsQ0FBQywrQ0FBc0IsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUNySSxRQUFRLENBQUMsR0FBRyxDQUFDLGlDQUFtQixFQUFFLGtCQUFZLENBQUMsU0FBUyxDQUFDLElBQUEsdUJBQWlCLEVBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxKLFNBQVM7WUFDVCxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFpQixFQUFFLElBQUksNEJBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEYsYUFBYTtZQUNiLFFBQVEsQ0FBQyxHQUFHLENBQUMsMENBQXNCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLDZDQUFxQixDQUFDLENBQUMsQ0FBQztZQUVoRixrQkFBa0I7WUFDbEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzREFBMEIsRUFBRSxJQUFJLDRCQUFjLENBQUMscURBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRXhGLGNBQWM7WUFDZCxRQUFRLENBQUMsR0FBRyxDQUFDLDhDQUFzQixFQUFFLElBQUksNEJBQWMsQ0FBQyw2Q0FBcUIsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUVuSSxrQkFBa0I7WUFDbEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4Q0FBc0IsRUFBRSxJQUFJLDRCQUFjLENBQUMsdUNBQWtCLENBQUMsQ0FBQyxDQUFDO1lBRTdFLFVBQVU7WUFDVixRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixFQUFFLElBQUksNEJBQWMsQ0FBQyx1Q0FBa0IsQ0FBQyxDQUFDLENBQUM7WUFFMUUsc0JBQXNCO1lBQ3RCLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkNBQXlCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLG1EQUF3QixDQUFDLENBQUMsQ0FBQztZQUV0Rix5QkFBeUI7WUFDekIsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0Q0FBcUIsRUFBRSxJQUFJLDRCQUFjLENBQUMsMkNBQW9CLENBQUMsQ0FBQyxDQUFDO1lBRTlFLFVBQVU7WUFDVixRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixFQUFFLElBQUksNEJBQWMsQ0FBQyx1Q0FBa0IsQ0FBQyxDQUFDLENBQUM7WUFDMUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtREFBOEIsRUFBRSxJQUFJLDRCQUFjLENBQUMsa0RBQTZCLENBQUMsQ0FBQyxDQUFDO1lBRWhHLFdBQVc7WUFDWCxNQUFNLGNBQWMsR0FBRyxJQUFJLCtDQUFzQixDQUFDO2dCQUNqRCxTQUFTLCtDQUFtQztnQkFDNUMsY0FBYyxtREFBd0M7Z0JBQ3RELFVBQVUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSx1R0FBdUQsSUFBSSxHQUFHO2FBQzVHLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FDeEMsY0FBYyxFQUNkLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsSUFBSSxDQUFDLFVBQVUsRUFDZixJQUFJLENBQUMsYUFBYSxDQUNsQixDQUFDO1lBQ0YsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUUvQyxvQkFBb0I7WUFDcEIsSUFBSSxvQkFBUyxFQUFFO2dCQUNkLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0NBQTRCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLHdEQUE4QixDQUFDLENBQUMsQ0FBQzthQUMvRjtpQkFBTSxJQUFJLHNCQUFXLEVBQUU7Z0JBQ3ZCLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0NBQTRCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLG9EQUEwQixDQUFDLENBQUMsQ0FBQzthQUMzRjtpQkFBTSxJQUFJLGtCQUFPLEVBQUU7Z0JBQ25CLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0NBQTRCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLHNEQUE0QixDQUFDLENBQUMsQ0FBQzthQUM3RjtZQUVELFVBQVU7WUFDVixNQUFNLGlCQUFpQixHQUFHLElBQUkscUNBQWlCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1SSxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFcEQsYUFBYTtZQUNiLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxpRUFBK0IsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNsTSxRQUFRLENBQUMsR0FBRyxDQUFDLGtFQUFnQyxFQUFFLCtCQUErQixDQUFDLENBQUM7WUFDaEYsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsRUFBRSxJQUFJLDRCQUFjLENBQUMsNkNBQXFCLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDL0gsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0REFBNkIsRUFBRSxJQUFJLDRCQUFjLENBQUMsMkRBQTRCLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFaEgsZUFBZTtZQUNmLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsRUFBRSxJQUFJLDRCQUFjLENBQUMsNkJBQWdCLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFFbkgsWUFBWTtZQUNaLElBQUksSUFBQSxrQ0FBaUIsRUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO2dCQUN4RSxNQUFNLFVBQVUsR0FBRyxJQUFBLG9DQUFtQixFQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3ZGLE1BQU0sT0FBTyxHQUFHLElBQUEsdUJBQWlCLEVBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0csTUFBTSxRQUFRLEdBQUcsSUFBSSxzQ0FBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLDBDQUF1QixFQUFDLElBQUEsWUFBTyxHQUFFLEVBQUUsSUFBQSxhQUFRLEdBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDdEssTUFBTSxRQUFRLEdBQUcsSUFBQSwyQ0FBMEIsRUFBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDekUsTUFBTSxNQUFNLEdBQTRCLEVBQUUsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDO2dCQUV4SCxRQUFRLENBQUMsR0FBRyxDQUFDLDZCQUFpQixFQUFFLElBQUksNEJBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDdkY7aUJBQU07Z0JBQ04sUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBaUIsRUFBRSxxQ0FBb0IsQ0FBQyxDQUFDO2FBQ3REO1lBRUQsa0NBQWtDO1lBQ2xDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0VBQWdDLEVBQUUsSUFBSSw0QkFBYyxDQUFDLGlFQUErQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JILFFBQVEsQ0FBQyxHQUFHLENBQUMsb0RBQXlCLEVBQUUsSUFBSSw0QkFBYyxDQUFDLG1EQUF3QixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXZHLHlCQUF5QjtZQUN6QixRQUFRLENBQUMsR0FBRyxDQUFDLGtFQUFnQyxFQUFFLElBQUksNEJBQWMsQ0FBQyxpRUFBK0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVySCxnQ0FBZ0M7WUFDaEMsTUFBTSxnQkFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsaUJBQWlCLENBQUMsVUFBVSxFQUFFO2dCQUM5QiwrQkFBK0IsQ0FBQyxVQUFVLEVBQUU7YUFDNUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFTyxZQUFZLENBQUMsUUFBMEIsRUFBRSx5QkFBNEMsRUFBRSxtQkFBK0M7WUFFN0ksaUVBQWlFO1lBQ2pFLDZEQUE2RDtZQUM3RCw2REFBNkQ7WUFDN0QsOERBQThEO1lBRTlELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUUxRCxNQUFNLGFBQWEsR0FBRyxrQkFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM1SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUV2RSxNQUFNLGtCQUFrQixHQUFHLGtCQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0RBQXVCLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3RJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFFakYsbUNBQW1DO1lBQ25DLE1BQU0sYUFBYSxHQUFHLElBQUkseUJBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHVCQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDbkUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUVwRixjQUFjO1lBQ2QsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFFLElBQUEsa0JBQVUsRUFBQyxzQkFBc0IsWUFBWSwrQ0FBc0IsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0seUJBQXlCLEdBQUcsSUFBSSw0REFBNkIsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzFJLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyw2REFBOEIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3JHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsNkRBQThCLEVBQUUseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRXRILHFCQUFxQjtZQUNyQixNQUFNLHVCQUF1QixHQUFHLGtCQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsOENBQTRCLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsSCx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUN2RixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUV4RyxVQUFVO1lBQ1YsTUFBTSxjQUFjLEdBQUcsSUFBSSwyQkFBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWUsQ0FBQyxDQUFDLENBQUM7WUFDekUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUV0RixTQUFTO1lBQ1QsTUFBTSxhQUFhLEdBQUcsSUFBSSx5QkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDLENBQUM7WUFDdEUseUJBQXlCLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVuRSxTQUFTO1lBQ1QsTUFBTSxZQUFZLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBaUIsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzVGLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFakUsYUFBYTtZQUNiLE1BQU0saUJBQWlCLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBc0IsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RHLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUUzRSxVQUFVO1lBQ1YsTUFBTSxXQUFXLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBWSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdEYseUJBQXlCLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUUvRCxrQkFBa0I7WUFDbEIsTUFBTSxxQkFBcUIsR0FBRyxrQkFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHNEQUEwQixDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDOUcseUJBQXlCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFFbkYsc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhDQUFzQixDQUFDLENBQUM7WUFDbEUsTUFBTSxpQkFBaUIsR0FBRyxrQkFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDNUYseUJBQXlCLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzNFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUU1RixhQUFhO1lBQ2IsTUFBTSxpQkFBaUIsR0FBRyxrQkFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbEcseUJBQXlCLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRTNFLFVBQVU7WUFDVixNQUFNLGNBQWMsR0FBRyxrQkFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEcseUJBQXlCLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUVyRSxlQUFlO1lBQ2YsTUFBTSxVQUFVLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBVyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEYseUJBQXlCLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU3RCxzQkFBc0I7WUFDdEIsTUFBTSx3QkFBd0IsR0FBRyxrQkFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDZDQUF5QixDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEgseUJBQXlCLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLHdCQUF3QixDQUFDLENBQUM7WUFFekYsa0JBQWtCO1lBQ2xCLE1BQU0sY0FBYyxHQUFHLGtCQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsOENBQXNCLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRyx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXJFLGtDQUFrQztZQUNsQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksbUNBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDckUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUV0RixvREFBb0Q7WUFDcEQsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZ0VBQW9DLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3Q0FBbUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsOENBQTRCLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN4TCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLHdCQUF3QixFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUU3RyxXQUFXO1lBQ1gsTUFBTSxjQUFjLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzdGLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyw4QkFBbUIsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFeEYsb0JBQW9CO1lBQ3BCLE1BQU0sdUJBQXVCLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQ0FBNEIsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2xILHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBRXZGLFNBQVM7WUFDVCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0IsQ0FBQyxDQUFFLENBQUM7WUFDM0UseUJBQXlCLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNuRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBRXBGLG9DQUFvQztZQUNwQyxNQUFNLDBDQUEwQyxHQUFHLElBQUksa0VBQTBDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDckkseUJBQXlCLENBQUMsZUFBZSxDQUFDLDJCQUEyQixFQUFFLDBDQUEwQyxDQUFDLENBQUM7WUFFbkgseUJBQXlCO1lBQ3pCLE1BQU0sMkJBQTJCLEdBQUcsa0JBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0Q0FBcUIsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQy9HLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyx5REFBa0MsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBRTNHLHlCQUF5QjtZQUN6QixNQUFNLDJCQUEyQixHQUFHLGtCQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0VBQWdDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMxSCx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsZ0VBQWtDLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBRU8sS0FBSyxDQUFDLGVBQWUsQ0FBQyxRQUEwQixFQUFFLG1CQUFxRDtZQUM5RyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDZCQUFtQixDQUFDLENBQUM7WUFFdkYsTUFBTSxPQUFPLEdBQUcsSUFBQSw4QkFBaUIsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQyw0QkFBb0IsQ0FBQztZQUN2RixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDO1lBRTlDLHNEQUFzRDtZQUN0RCxJQUFJLG1CQUFtQixFQUFFO2dCQUV4Qix5Q0FBeUM7Z0JBQ3pDLElBQUksbUJBQW1CLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzdDLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDO3dCQUM5QixPQUFPO3dCQUNQLEdBQUcsRUFBRSxJQUFJO3dCQUNULFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO3dCQUN6QyxZQUFZLEVBQUUsSUFBSTt3QkFDbEIsY0FBYyxFQUFFLElBQUk7d0JBQ3BCLHlEQUF5RDtxQkFDekQsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELG1EQUFtRDtnQkFDbkQsc0NBQXNDO2dCQUN0QyxtREFBbUQ7Z0JBQ25ELG1EQUFtRDtnQkFDbkQsdUNBQXVDO2dCQUN2QyxtREFBbUQ7Z0JBQ25ELHFEQUFxRDtnQkFFckQsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEMsS0FBSyxNQUFNLFdBQVcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7d0JBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUksZUFBZSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzFELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxRQUFRLEVBQUU7NEJBRXhDLDZEQUE2RDs0QkFDN0Qsd0RBQXdEOzRCQUV4RCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUMxQixXQUFXLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUN6RCxXQUFXLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBRXJFLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDO2dDQUM5QixPQUFPO2dDQUNQLEdBQUcsRUFBRSxJQUFJO2dDQUNULGNBQWMsRUFBRSxJQUFJO2dDQUNwQixVQUFVLEVBQUUsSUFBSTtnQ0FDaEIsWUFBWSxFQUFFLElBQUk7Z0NBQ2xCLGNBQWMsRUFBRSxJQUFJO2dDQUNwQix5REFBeUQ7NkJBQ3pELENBQUMsQ0FBQzt5QkFDSDtxQkFDRDtpQkFDRDthQUNEO1lBRUQsTUFBTSxZQUFZLEdBQW1CLE1BQU8sQ0FBQyxZQUFZLENBQUM7WUFDMUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDakMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMzQyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLElBQUksQ0FBQztZQUNuRSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDL0csTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7WUFDakQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNsQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUU5Qyx3Q0FBd0M7WUFDeEMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFFbEQsbUJBQW1CO2dCQUNuQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxZQUFZLElBQUksZ0JBQWdCLEVBQUU7b0JBQzNELE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDO3dCQUM5QixPQUFPO3dCQUNQLEdBQUcsRUFBRSxJQUFJO3dCQUNULGNBQWMsRUFBRSxJQUFJO3dCQUNwQixVQUFVLEVBQUUsSUFBSTt3QkFDaEIsYUFBYTt3QkFDYixpQkFBaUI7d0JBQ2pCLGNBQWMsRUFBRSxJQUFJO3dCQUNwQixlQUFlO3dCQUNmLFlBQVk7d0JBQ1osZ0JBQWdCO3FCQUNoQixDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsMkNBQTJDO2dCQUMzQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUU7b0JBQ3hCLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDO3dCQUM5QixPQUFPLDBCQUFrQjt3QkFDekIsR0FBRyxFQUFFLElBQUk7d0JBQ1QsVUFBVSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEscUNBQXlCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3hJLGFBQWE7d0JBQ2IsaUJBQWlCO3dCQUNqQixjQUFjLEVBQUUsSUFBSTt3QkFDcEIsNERBQTREO3FCQUM1RCxDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUVELCtCQUErQjtZQUMvQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQztnQkFDOUIsT0FBTztnQkFDUCxHQUFHLEVBQUUsSUFBSTtnQkFDVCxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMzRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDckIsYUFBYTtnQkFDYixpQkFBaUI7Z0JBQ2pCLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDdkIsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGVBQWU7Z0JBQ2YsWUFBWTtnQkFDWixnQkFBZ0I7YUFDaEIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLGVBQWU7WUFFdEIsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwQixxQkFBcUI7WUFDckIsbUJBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBTyxDQUFDLG9CQUFvQixFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUNqRixRQUFRLENBQUM7b0JBQ1IsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLE9BQU8sQ0FBQztvQkFDN0QsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2lCQUN0QixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILHVFQUF1RTtZQUN2RSx5RUFBeUU7WUFDekUseUJBQXlCO1lBQ3pCLHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxGLGlCQUFpQjtZQUNqQixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztZQUVyQyxJQUFJLHNCQUFXLElBQUksY0FBRyxDQUFDLDRCQUE0QixFQUFFO2dCQUNwRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7YUFDNUU7UUFFRixDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVk7WUFDekIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7WUFDMUQsSUFBSSxvQkFBUyxJQUFJLGNBQWMsRUFBRTtnQkFDaEMsSUFBSTtvQkFDSCxNQUFNLFlBQVksR0FBRyxzREFBYSx1QkFBdUIsMkJBQUMsQ0FBQztvQkFDM0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNyRCxJQUFBLGlCQUFJLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUN0RTtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7YUFDRDtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBc0IsRUFBRSxHQUF3QixFQUFFLGFBQXNCO1lBQzdHLElBQUk7Z0JBQ0gsT0FBTyxNQUFNLElBQUEsOEJBQW1CLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hGO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsTUFBTSxZQUFZLEdBQUcsSUFBQSw2QkFBYyxFQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLGFBQWEsRUFBRTtvQkFDbEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxpQ0FBaUMsRUFBRSxZQUFZLENBQUMsQ0FBQztpQkFDeEY7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3BDO2FBQ0Q7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFTyxLQUFLLENBQUMsNkJBQTZCO1lBRTFDLHlFQUF5RTtZQUN6RSwyRUFBMkU7WUFDM0UsbUVBQW1FO1lBRW5FLElBQUk7Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzlGLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxvQkFBYSxFQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sY0FBYyxHQUFHLElBQUEsa0NBQWlCLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3BFLE1BQU0sbUJBQW1CLEdBQUcsY0FBYyxnQ0FBd0IsQ0FBQztnQkFFbkUsa0JBQWtCO2dCQUNsQixJQUFJLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFDcEQsTUFBTSxxQkFBcUIsR0FBRzt3QkFDN0IsRUFBRTt3QkFDRix3Q0FBd0M7d0JBQ3hDLHFEQUFxRDt3QkFDckQsNkJBQTZCLG1CQUFtQixHQUFHO3dCQUNuRCxFQUFFO3dCQUNGLDJFQUEyRTt3QkFDM0UsNkJBQTZCO3dCQUM3QiwwQkFBMEIsSUFBQSxtQkFBWSxHQUFFLEdBQUc7d0JBQzNDLEdBQUc7cUJBQ0gsQ0FBQztvQkFDRixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRXJILE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUMvRztnQkFFRCw2REFBNkQ7cUJBQ3hEO29CQUNKLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUUsNEJBQTRCLG1CQUFtQixHQUFHLENBQUMsQ0FBQztvQkFDN0gsSUFBSSxhQUFhLEtBQUssVUFBVSxFQUFFO3dCQUNqQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztxQkFDL0c7aUJBQ0Q7YUFDRDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztLQUNELENBQUE7SUFodUNZLDBDQUFlOzhCQUFmLGVBQWU7UUFRekIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLG9CQUFjLENBQUE7UUFDZCxXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFdBQUEsNENBQXFCLENBQUE7UUFDckIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLG9CQUFZLENBQUE7UUFDWixZQUFBLGdDQUFlLENBQUE7UUFDZixZQUFBLDhDQUE0QixDQUFBO09BakJsQixlQUFlLENBZ3VDM0IifQ==