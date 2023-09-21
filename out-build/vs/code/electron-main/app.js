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
define(["require", "exports", "electron", "vs/base/node/unc", "vs/base/parts/ipc/electron-main/ipcMain", "os", "vs/base/common/buffer", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/functional", "vs/base/common/json", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/parts/contextmenu/electron-main/contextmenu", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/electron-main/ipc.electron", "vs/base/parts/ipc/electron-main/ipc.mp", "vs/code/electron-main/auth", "vs/nls!vs/code/electron-main/app", "vs/platform/backup/electron-main/backup", "vs/platform/backup/electron-main/backupMainService", "vs/platform/configuration/common/configuration", "vs/platform/debug/electron-main/extensionHostDebugIpc", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/electron-main/diagnosticsMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/encryption/common/encryptionService", "vs/platform/encryption/electron-main/encryptionMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/shell/node/shellEnv", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/platform/extensionManagement/node/extensionUrlTrustService", "vs/platform/extensions/common/extensionHostStarter", "vs/platform/extensions/electron-main/extensionHostStarter", "vs/platform/externalTerminal/electron-main/externalTerminal", "vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/files/common/diskFileSystemProviderClient", "vs/platform/files/common/files", "vs/platform/files/electron-main/diskFileSystemProviderServer", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/issue/common/issue", "vs/platform/issue/electron-main/issueMainService", "vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService", "vs/platform/launch/electron-main/launchMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/electron-main/menubarMainService", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/sharedProcess/electron-main/sharedProcess", "vs/platform/sign/common/sign", "vs/platform/state/node/state", "vs/platform/storage/electron-main/storageIpc", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/update/common/update", "vs/platform/update/common/updateIpc", "vs/platform/update/electron-main/updateService.darwin", "vs/platform/update/electron-main/updateService.linux", "vs/platform/update/electron-main/updateService.snap", "vs/platform/update/electron-main/updateService.win32", "vs/platform/url/common/url", "vs/platform/url/common/urlIpc", "vs/platform/url/common/urlService", "vs/platform/url/electron-main/electronUrlListener", "vs/platform/webview/common/webviewManagerService", "vs/platform/webview/electron-main/webviewMainService", "vs/platform/windows/electron-main/windows", "vs/platform/windows/electron-main/windowsMainService", "vs/platform/windows/node/windowTracker", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/workspaces/electron-main/workspacesMainService", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/policy/common/policy", "vs/platform/policy/common/policyIpc", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/request/common/requestIpc", "vs/platform/request/common/request", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/userDataProfile/electron-main/userDataProfilesHandler", "vs/platform/userDataProfile/electron-main/userDataProfileStorageIpc", "vs/base/common/async", "vs/platform/telemetry/electron-main/telemetryUtils", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/electron-main/logIpc", "vs/platform/log/electron-main/loggerService", "vs/platform/dialogs/common/dialogs", "vs/platform/utilityProcess/electron-main/utilityProcessWorkerMainService", "vs/platform/utilityProcess/common/utilityProcessWorkerService", "vs/base/common/arrays", "vs/platform/terminal/common/terminal", "vs/platform/terminal/electron-main/electronPtyHostStarter", "vs/platform/terminal/node/ptyHostService", "vs/platform/remote/common/electronRemoteResources", "vs/base/common/lazy"], function (require, exports, electron_1, unc_1, ipcMain_1, os_1, buffer_1, errorMessage_1, errors_1, extpath_1, functional_1, json_1, labels_1, lifecycle_1, network_1, path_1, platform_1, types_1, uri_1, uuid_1, contextmenu_1, ipc_1, ipc_electron_1, ipc_mp_1, auth_1, nls_1, backup_1, backupMainService_1, configuration_1, extensionHostDebugIpc_1, diagnostics_1, diagnosticsMainService_1, dialogMainService_1, encryptionService_1, encryptionMainService_1, environmentMainService_1, argvHelper_1, shellEnv_1, extensionUrlTrust_1, extensionUrlTrustService_1, extensionHostStarter_1, extensionHostStarter_2, externalTerminal_1, externalTerminalService_1, diskFileSystemProviderClient_1, files_1, diskFileSystemProviderServer_1, diskFileSystemProvider_1, descriptors_1, instantiation_1, serviceCollection_1, issue_1, issueMainService_1, keyboardLayoutMainService_1, launchMainService_1, lifecycleMainService_1, log_1, menubarMainService_1, nativeHostMainService_1, productService_1, remoteHosts_1, sharedProcess_1, sign_1, state_1, storageIpc_1, storageMainService_1, commonProperties_1, telemetry_1, telemetryIpc_1, telemetryService_1, telemetryUtils_1, update_1, updateIpc_1, updateService_darwin_1, updateService_linux_1, updateService_snap_1, updateService_win32_1, url_1, urlIpc_1, urlService_1, electronUrlListener_1, webviewManagerService_1, webviewMainService_1, windows_1, windowsMainService_1, windowTracker_1, workspace_1, workspaces_1, workspacesHistoryMainService_1, workspacesMainService_1, workspacesManagementMainService_1, policy_1, policyIpc_1, userDataProfile_1, requestIpc_1, request_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfilesHandler_1, userDataProfileStorageIpc_1, async_1, telemetryUtils_2, extensionsProfileScannerService_2, logIpc_1, loggerService_1, dialogs_1, utilityProcessWorkerMainService_1, utilityProcessWorkerService_1, arrays_1, terminal_1, electronPtyHostStarter_1, ptyHostService_1, electronRemoteResources_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c7b = void 0;
    /**
     * The main VS Code application. There will only ever be one instance,
     * even if the user starts many instances (e.g. from the command line).
     */
    let $c7b = class $c7b extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m, n, s, t, u, w, y) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z();
            this.C();
        }
        z() {
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            const isUrlFromWebview = (requestingUrl) => requestingUrl?.startsWith(`${network_1.Schemas.vscodeWebview}://`);
            const allowedPermissionsInMainFrame = new Set(this.w.quality === 'stable' ? [] : ['media']);
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
                if (!frame || !this.a) {
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
                if (!frame || !this.a) {
                    return false;
                }
                // Check to see if the request comes from one of the main editor windows.
                for (const window of this.a.getWindows()) {
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
                        this.h.error('Blocked vscode-webview request', details.url);
                        return callback({ cancel: true });
                    }
                }
                if (uri.scheme === network_1.Schemas.vscodeFileResource) {
                    if (!isAllowedVsCodeFileRequest(details)) {
                        this.h.error('Blocked vscode-file request', details.url);
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
            if (typeof defaultSession.setCodeCachePath === 'function' && this.m.codeCachePath) {
                // Make sure to partition Chrome's code cache folder
                // in the same way as our code cache path to help
                // invalidate caches that we know are invalid
                // (https://github.com/microsoft/vscode/issues/120655)
                defaultSession.setCodeCachePath((0, path_1.$9d)(this.m.codeCachePath, 'chrome'));
            }
            //#endregion
            //#region UNC Host Allowlist (Windows)
            if (platform_1.$i) {
                if (this.s.getValue('security.restrictUNCAccess') === false) {
                    (0, unc_1.disableUNCAccessRestrictions)();
                }
                else {
                    (0, unc_1.addUNCHostToAllowlist)(this.s.getValue('security.allowedUNCHosts'));
                }
            }
            //#endregion
        }
        C() {
            // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
            (0, errors_1.setUnexpectedErrorHandler)(error => this.F(error));
            process.on('uncaughtException', error => {
                if (!(0, errors_1.$X)(error)) {
                    (0, errors_1.$Y)(error);
                }
            });
            process.on('unhandledRejection', (reason) => (0, errors_1.$Y)(reason));
            // Dispose on shutdown
            this.n.onWillShutdown(() => this.dispose());
            // Contextmenu via IPC support
            (0, contextmenu_1.$VS)();
            // Accessibility change event
            electron_1.app.on('accessibility-support-changed', (event, accessibilitySupportEnabled) => {
                this.a?.sendToAll('vscode:accessibilitySupportChanged', accessibilitySupportEnabled);
            });
            // macOS dock activate
            electron_1.app.on('activate', async (event, hasVisibleWindows) => {
                this.h.trace('app#activate');
                // Mac only event: open new window when we get activated
                if (!hasVisibleWindows) {
                    await this.a?.openEmptyWindow({ context: 1 /* OpenContext.DOCK */ });
                }
            });
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            electron_1.app.on('web-contents-created', (event, contents) => {
                contents.on('will-navigate', event => {
                    this.h.error('webContents#will-navigate: Prevented webcontent navigation');
                    event.preventDefault();
                });
                contents.setWindowOpenHandler(({ url }) => {
                    this.b?.openExternal(undefined, url);
                    return { action: 'deny' };
                });
            });
            //#endregion
            let macOpenFileURIs = [];
            let runningTimeout = undefined;
            electron_1.app.on('open-file', (event, path) => {
                this.h.trace('app#open-file: ', path);
                event.preventDefault();
                // Keep in array because more might come!
                macOpenFileURIs.push((0, workspace_1.$7h)(path) ? { workspaceUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) });
                // Clear previous handler if any
                if (runningTimeout !== undefined) {
                    clearTimeout(runningTimeout);
                    runningTimeout = undefined;
                }
                // Handle paths delayed in case more are coming!
                runningTimeout = setTimeout(async () => {
                    await this.a?.open({
                        context: 1 /* OpenContext.DOCK */ /* can also be opening from finder while app is running */,
                        cli: this.m.args,
                        urisToOpen: macOpenFileURIs,
                        gotoLineMode: false,
                        preferNewWindow: true /* dropping on the dock or opening from finder prefers to open in a new window */
                    });
                    macOpenFileURIs = [];
                    runningTimeout = undefined;
                }, 100);
            });
            electron_1.app.on('new-window-for-tab', async () => {
                await this.a?.openEmptyWindow({ context: 4 /* OpenContext.DESKTOP */ }); //macOS native tab "+" button
            });
            //#region Bootstrap IPC Handlers
            ipcMain_1.$US.handle('vscode:fetchShellEnv', event => {
                // Prefer to use the args and env from the target window
                // when resolving the shell env. It is possible that
                // a first window was opened from the UI but a second
                // from the CLI and that has implications for whether to
                // resolve the shell environment or not.
                //
                // Window can be undefined for e.g. the shared process
                // that is not part of our windows registry!
                const window = this.a?.getWindowByWebContents(event.sender); // Note: this can be `undefined` for the shared process
                let args;
                let env;
                if (window?.config) {
                    args = window.config;
                    env = { ...process.env, ...window.config.userEnv };
                }
                else {
                    args = this.m.args;
                    env = process.env;
                }
                // Resolve shell env
                return this.U(args, env, false);
            });
            ipcMain_1.$US.handle('vscode:writeNlsFile', (event, path, data) => {
                const uri = this.D([path]);
                if (!uri || typeof data !== 'string') {
                    throw new Error('Invalid operation (vscode:writeNlsFile)');
                }
                return this.u.writeFile(uri, buffer_1.$Fd.fromString(data));
            });
            ipcMain_1.$US.handle('vscode:readNlsFile', async (event, ...paths) => {
                const uri = this.D(paths);
                if (!uri) {
                    throw new Error('Invalid operation (vscode:readNlsFile)');
                }
                return (await this.u.readFile(uri)).value.toString();
            });
            ipcMain_1.$US.on('vscode:toggleDevTools', event => event.sender.toggleDevTools());
            ipcMain_1.$US.on('vscode:openDevTools', event => event.sender.openDevTools());
            ipcMain_1.$US.on('vscode:reloadWindow', event => event.sender.reload());
            //#endregion
        }
        D(pathSegments) {
            let path = undefined;
            for (const pathSegment of pathSegments) {
                if (typeof pathSegment === 'string') {
                    if (typeof path !== 'string') {
                        path = pathSegment;
                    }
                    else {
                        path = (0, path_1.$9d)(path, pathSegment);
                    }
                }
            }
            if (typeof path !== 'string' || !(0, path_1.$8d)(path) || !(0, extpath_1.$If)(path, this.m.cachedLanguagesPath, !platform_1.$k)) {
                return undefined;
            }
            return uri_1.URI.file(path);
        }
        F(error) {
            if (error) {
                // take only the message and stack property
                const friendlyError = {
                    message: `[uncaught exception in main]: ${error.message}`,
                    stack: error.stack
                };
                // handle on client side
                this.a?.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
            }
            this.h.error(`[uncaught exception in main]: ${error}`);
            if (error.stack) {
                this.h.error(error.stack);
            }
        }
        async startup() {
            this.h.debug('Starting VS Code');
            this.h.debug(`from: ${this.m.appRoot}`);
            this.h.debug('args:', this.m.args);
            // Make sure we associate the program with the app user model id
            // This will help Windows to associate the running program with
            // any shortcut that is pinned to the taskbar and prevent showing
            // two icons in the taskbar for the same app.
            const win32AppUserModelId = this.w.win32AppUserModelId;
            if (platform_1.$i && win32AppUserModelId) {
                electron_1.app.setAppUserModelId(win32AppUserModelId);
            }
            // Fix native tabs on macOS 10.13
            // macOS enables a compatibility patch for any bundle ID beginning with
            // "com.microsoft.", which breaks native tabs for VS Code when using this
            // identifier (from the official build).
            // Explicitly opt out of the patch here before creating any windows.
            // See: https://github.com/microsoft/vscode/issues/35361#issuecomment-399794085
            try {
                if (platform_1.$j && this.s.getValue('window.nativeTabs') === true && !electron_1.systemPreferences.getUserDefault('NSUseImprovedLayoutPass', 'boolean')) {
                    electron_1.systemPreferences.setUserDefault('NSUseImprovedLayoutPass', 'boolean', true);
                }
            }
            catch (error) {
                this.h.error(error);
            }
            // Main process server (electron IPC based)
            const mainProcessElectronServer = new ipc_electron_1.$2S();
            this.n.onWillShutdown(e => {
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
            this.h.trace('Resolving machine identifier...');
            const machineId = await (0, telemetryUtils_2.$66b)(this.t, this.h);
            this.h.trace(`Resolved machine identifier: ${machineId}`);
            // Shared process
            const { sharedProcessReady, sharedProcessClient } = this.N(machineId);
            // Services
            const appInstantiationService = await this.O(machineId, sharedProcessReady);
            // Auth Handler
            this.B(appInstantiationService.createInstance(auth_1.$C5b));
            // Transient profiles handler
            this.B(appInstantiationService.createInstance(userDataProfilesHandler_1.$36b));
            // Init Channels
            appInstantiationService.invokeFunction(accessor => this.P(accessor, mainProcessElectronServer, sharedProcessClient));
            // Setup Protocol URL Handlers
            const initialProtocolUrls = appInstantiationService.invokeFunction(accessor => this.G(accessor, mainProcessElectronServer));
            // Setup vscode-remote-resource protocol handler.
            this.H(mainProcessElectronServer);
            // Signal phase: ready - before opening first window
            this.n.phase = 2 /* LifecycleMainPhase.Ready */;
            // Open Windows
            await appInstantiationService.invokeFunction(accessor => this.Q(accessor, initialProtocolUrls));
            // Signal phase: after window open
            this.n.phase = 3 /* LifecycleMainPhase.AfterWindowOpen */;
            // Post Open Windows Tasks
            this.R();
            // Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
            const eventuallyPhaseScheduler = this.B(new async_1.$Sg(() => {
                this.B((0, async_1.$Wg)(() => this.n.phase = 4 /* LifecycleMainPhase.Eventually */, 2500));
            }, 2500));
            eventuallyPhaseScheduler.schedule();
        }
        G(accessor, mainProcessElectronServer) {
            const windowsMainService = this.a = accessor.get(windows_1.$B5b);
            const urlService = accessor.get(url_1.$IT);
            const nativeHostMainService = this.b = accessor.get(nativeHostMainService_1.$c6b);
            // Install URL handlers that deal with protocl URLs either
            // from this process by opening windows and/or by forwarding
            // the URLs into a window process to be handled there.
            const app = this;
            urlService.registerHandler({
                async handleURL(uri, options) {
                    return app.M(windowsMainService, urlService, uri, options);
                }
            });
            const activeWindowManager = this.B(new windowTracker_1.$X6b({
                onDidOpenWindow: nativeHostMainService.onDidOpenWindow,
                onDidFocusWindow: nativeHostMainService.onDidFocusWindow,
                getActiveWindowId: () => nativeHostMainService.getActiveWindowId(-1)
            }));
            const activeWindowRouter = new ipc_1.$jh(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            const urlHandlerRouter = new urlIpc_1.$N6b(activeWindowRouter, this.h);
            const urlHandlerChannel = mainProcessElectronServer.getChannel('urlHandler', urlHandlerRouter);
            urlService.registerHandler(new urlIpc_1.$M6b(urlHandlerChannel));
            const initialProtocolUrls = this.I();
            this.B(new electronUrlListener_1.$O6b(initialProtocolUrls?.urls, urlService, windowsMainService, this.m, this.w, this.h));
            return initialProtocolUrls;
        }
        H(mainProcessElectronServer) {
            const notFound = () => ({ statusCode: 404, data: 'Not found' });
            const remoteResourceChannel = new lazy_1.$T(() => mainProcessElectronServer.getChannel(electronRemoteResources_1.$a7b, new electronRemoteResources_1.$b7b()));
            electron_1.protocol.registerBufferProtocol(network_1.Schemas.vscodeManagedRemoteResource, (request, callback) => {
                const url = uri_1.URI.parse(request.url);
                if (!url.authority.startsWith('window:')) {
                    return callback(notFound());
                }
                remoteResourceChannel.value.call(electronRemoteResources_1.$_6b, [url]).then(r => callback({ ...r, data: Buffer.from(r.body, 'base64') }), err => {
                    this.h.warn('error dispatching remote resource call', err);
                    callback({ statusCode: 500, data: String(err) });
                });
            });
        }
        I() {
            /**
             * Protocol URL handling on startup is complex, refer to
             * {@link IInitialProtocolUrls} for an explainer.
             */
            // Windows/Linux: protocol handler invokes CLI with --open-url
            const protocolUrlsFromCommandLine = this.m.args['open-url'] ? this.m.args._urls || [] : [];
            if (protocolUrlsFromCommandLine.length > 0) {
                this.h.trace('app#resolveInitialProtocolUrls() protocol urls from command line:', protocolUrlsFromCommandLine);
            }
            // macOS: open-url events that were received before the app is ready
            const protocolUrlsFromEvent = (global.getOpenUrls() || []);
            if (protocolUrlsFromEvent.length > 0) {
                this.h.trace(`app#resolveInitialProtocolUrls() protocol urls from macOS 'open-url' event:`, protocolUrlsFromEvent);
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
                    this.h.trace('app#resolveInitialProtocolUrls() protocol url failed to parse:', url);
                    return undefined;
                }
            }).filter((obj) => {
                if (!obj) {
                    return false; // invalid
                }
                if (this.J(obj.uri)) {
                    this.h.trace('app#resolveInitialProtocolUrls() protocol url was blocked:', obj.uri.toString(true));
                    return false; // blocked
                }
                const windowOpenable = this.L(obj.uri);
                if (windowOpenable) {
                    this.h.trace('app#resolveInitialProtocolUrls() protocol url will be handled as window to open:', obj.uri.toString(true), windowOpenable);
                    openables.push(windowOpenable);
                    return false; // handled as window to open
                }
                this.h.trace('app#resolveInitialProtocolUrls() protocol url will be passed to active window for handling:', obj.uri.toString(true));
                return true; // handled within active window
            });
            return { urls, openables };
        }
        J(uri) {
            if (uri.authority === network_1.Schemas.file && platform_1.$i) {
                const { options, buttonIndeces } = (0, dialogs_1.$sA)({
                    type: 'warning',
                    buttons: [
                        (0, nls_1.localize)(0, null),
                        (0, nls_1.localize)(1, null)
                    ],
                    message: (0, nls_1.localize)(2, null, (0, labels_1.$eA)(uri, { os: platform_1.OS, tildify: this.m }), this.w.nameShort),
                    detail: (0, nls_1.localize)(3, null),
                }, this.w);
                const res = buttonIndeces[electron_1.dialog.showMessageBoxSync(options)];
                if (res === 1) {
                    return true;
                }
            }
            return false;
        }
        L(uri) {
            if (!uri.path) {
                return undefined;
            }
            // File path
            if (uri.authority === network_1.Schemas.file) {
                const fileUri = uri_1.URI.file(uri.fsPath);
                if ((0, workspace_1.$7h)(fileUri)) {
                    return { workspaceUri: fileUri };
                }
                return { fileUri };
            }
            // Remote path
            else if (uri.authority === network_1.Schemas.vscodeRemote) {
                // Example conversion:
                // From: vscode://vscode-remote/wsl+ubuntu/mnt/c/GitDevelopment/monaco
                //   To: vscode-remote://wsl+ubuntu/mnt/c/GitDevelopment/monaco
                const secondSlash = uri.path.indexOf(path_1.$6d.sep, 1 /* skip over the leading slash */);
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
                    if ((0, workspace_1.$7h)(path)) {
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
        async M(windowsMainService, urlService, uri, options) {
            this.h.trace('app#handleProtocolUrl():', uri.toString(true), options);
            // Support 'workspace' URLs (https://github.com/microsoft/vscode/issues/124263)
            if (uri.scheme === this.w.urlProtocol && uri.path === 'workspace') {
                uri = uri.with({
                    authority: 'file',
                    path: uri_1.URI.parse(uri.query).path,
                    query: ''
                });
            }
            // If URI should be blocked, behave as if it's handled
            if (this.J(uri)) {
                this.h.trace('app#handleProtocolUrl() protocol url was blocked:', uri.toString(true));
                return true;
            }
            let shouldOpenInNewWindow = false;
            // We should handle the URI in a new window if the URL contains `windowId=_blank`
            const params = new URLSearchParams(uri.query);
            if (params.get('windowId') === '_blank') {
                this.h.trace(`app#handleProtocolUrl() found 'windowId=_blank' as parameter, setting shouldOpenInNewWindow=true:`, uri.toString(true));
                params.delete('windowId');
                uri = uri.with({ query: params.toString() });
                shouldOpenInNewWindow = true;
            }
            // or if no window is open (macOS only)
            else if (platform_1.$j && windowsMainService.getWindowCount() === 0) {
                this.h.trace(`app#handleProtocolUrl() running on macOS with no window open, setting shouldOpenInNewWindow=true:`, uri.toString(true));
                shouldOpenInNewWindow = true;
            }
            // Pass along whether the application is being opened via a Continue On flow
            const continueOn = params.get('continueOn');
            if (continueOn !== null) {
                this.h.trace(`app#handleProtocolUrl() found 'continueOn' as parameter:`, uri.toString(true));
                params.delete('continueOn');
                uri = uri.with({ query: params.toString() });
                this.m.continueOn = continueOn ?? undefined;
            }
            // Check if the protocol URL is a window openable to open...
            const windowOpenableFromProtocolUrl = this.L(uri);
            if (windowOpenableFromProtocolUrl) {
                this.h.trace('app#handleProtocolUrl() opening protocol url as window:', windowOpenableFromProtocolUrl, uri.toString(true));
                const window = (0, arrays_1.$Mb)(await windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    cli: { ...this.m.args },
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
                this.h.trace('app#handleProtocolUrl() opening empty window and passing in protocol url:', uri.toString(true));
                const window = (0, arrays_1.$Mb)(await windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    cli: { ...this.m.args },
                    forceNewWindow: true,
                    forceEmpty: true,
                    gotoLineMode: true,
                    remoteAuthority: (0, remoteHosts_1.$Ok)(uri)
                }));
                await window?.ready();
                return urlService.open(uri, options);
            }
            this.h.trace('app#handleProtocolUrl(): not handled', uri.toString(true), options);
            return false;
        }
        N(machineId) {
            const sharedProcess = this.B(this.g.createInstance(sharedProcess_1.$z6b, machineId));
            const sharedProcessClient = (async () => {
                this.h.trace('Main->SharedProcess#connect');
                const port = await sharedProcess.connect();
                this.h.trace('Main->SharedProcess#connect: connection established');
                return new ipc_mp_1.$3S(port, 'main');
            })();
            const sharedProcessReady = (async () => {
                await sharedProcess.whenReady();
                return sharedProcessClient;
            })();
            return { sharedProcessReady, sharedProcessClient };
        }
        async O(machineId, sharedProcessReady) {
            const services = new serviceCollection_1.$zh();
            // Update
            switch (process.platform) {
                case 'win32':
                    services.set(update_1.$UT, new descriptors_1.$yh(updateService_win32_1.$K6b));
                    break;
                case 'linux':
                    if (platform_1.$l) {
                        services.set(update_1.$UT, new descriptors_1.$yh(updateService_snap_1.$J6b, [process.env['SNAP'], process.env['SNAP_REVISION']]));
                    }
                    else {
                        services.set(update_1.$UT, new descriptors_1.$yh(updateService_linux_1.$I6b));
                    }
                    break;
                case 'darwin':
                    services.set(update_1.$UT, new descriptors_1.$yh(updateService_darwin_1.$H6b));
                    break;
            }
            // Windows
            services.set(windows_1.$B5b, new descriptors_1.$yh(windowsMainService_1.$W6b, [machineId, this.f], false));
            // Dialogs
            const dialogMainService = new dialogMainService_1.$O5b(this.h, this.w);
            services.set(dialogMainService_1.$N5b, dialogMainService);
            // Launch
            services.set(launchMainService_1.$j6b, new descriptors_1.$yh(launchMainService_1.$k6b, undefined, false /* proxied to other processes */));
            // Diagnostics
            services.set(diagnosticsMainService_1.$X5b, new descriptors_1.$yh(diagnosticsMainService_1.$Y5b, undefined, false /* proxied to other processes */));
            services.set(diagnostics_1.$gm, ipc_1.ProxyChannel.toService((0, ipc_1.$hh)(sharedProcessReady.then(client => client.getChannel('diagnostics')))));
            // Issues
            services.set(issue_1.$qtb, new descriptors_1.$yh(issueMainService_1.$f6b, [this.f]));
            // Encryption
            services.set(encryptionService_1.$CT, new descriptors_1.$yh(encryptionMainService_1.$Z5b));
            // Keyboard Layout
            services.set(keyboardLayoutMainService_1.$g6b, new descriptors_1.$yh(keyboardLayoutMainService_1.$h6b));
            // Native Host
            services.set(nativeHostMainService_1.$c6b, new descriptors_1.$yh(nativeHostMainService_1.$d6b, undefined, false /* proxied to other processes */));
            // Webview Manager
            services.set(webviewManagerService_1.$P6b, new descriptors_1.$yh(webviewMainService_1.$R6b));
            // Menubar
            services.set(menubarMainService_1.$s6b, new descriptors_1.$yh(menubarMainService_1.$t6b));
            // Extension URL Trust
            services.set(extensionUrlTrust_1.$9kb, new descriptors_1.$yh(extensionUrlTrustService_1.$15b));
            // Extension Host Starter
            services.set(extensionHostStarter_1.$25b, new descriptors_1.$yh(extensionHostStarter_2.$45b));
            // Storage
            services.set(storageMainService_1.$x5b, new descriptors_1.$yh(storageMainService_1.$y5b));
            services.set(storageMainService_1.$z5b, new descriptors_1.$yh(storageMainService_1.$A5b));
            // Terminal
            const ptyHostStarter = new electronPtyHostStarter_1.$$6b({
                graceTime: 60000 /* LocalReconnectConstants.GraceTime */,
                shortGraceTime: 6000 /* LocalReconnectConstants.ShortGraceTime */,
                scrollback: this.s.getValue("terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */) ?? 100
            }, this.s, this.m, this.n, this.h);
            const ptyHostService = new ptyHostService_1.$lr(ptyHostStarter, this.s, this.h, this.j);
            services.set(terminal_1.$Yq, ptyHostService);
            // External terminal
            if (platform_1.$i) {
                services.set(externalTerminal_1.$55b, new descriptors_1.$yh(externalTerminalService_1.$65b));
            }
            else if (platform_1.$j) {
                services.set(externalTerminal_1.$55b, new descriptors_1.$yh(externalTerminalService_1.$75b));
            }
            else if (platform_1.$k) {
                services.set(externalTerminal_1.$55b, new descriptors_1.$yh(externalTerminalService_1.$85b));
            }
            // Backups
            const backupMainService = new backupMainService_1.$L5b(this.m, this.s, this.h, this.t);
            services.set(backup_1.$G5b, backupMainService);
            // Workspaces
            const workspacesManagementMainService = new workspacesManagementMainService_1.$T5b(this.m, this.h, this.y, backupMainService, dialogMainService);
            services.set(workspacesManagementMainService_1.$S5b, workspacesManagementMainService);
            services.set(workspaces_1.$fU, new descriptors_1.$yh(workspacesMainService_1.$Y6b, undefined, false /* proxied to other processes */));
            services.set(workspacesHistoryMainService_1.$p6b, new descriptors_1.$yh(workspacesHistoryMainService_1.$q6b, undefined, false));
            // URL handling
            services.set(url_1.$IT, new descriptors_1.$yh(urlService_1.$KT, undefined, false /* proxied to other processes */));
            // Telemetry
            if ((0, telemetryUtils_1.$ho)(this.w, this.m)) {
                const isInternal = (0, telemetryUtils_1.$mo)(this.w, this.s);
                const channel = (0, ipc_1.$hh)(sharedProcessReady.then(client => client.getChannel('telemetryAppender')));
                const appender = new telemetryIpc_1.$C6b(channel);
                const commonProperties = (0, commonProperties_1.$0n)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, this.w.commit, this.w.version, machineId, isInternal);
                const piiPaths = (0, telemetryUtils_1.$no)(this.m);
                const config = { appenders: [appender], commonProperties, piiPaths, sendErrorTelemetry: true };
                services.set(telemetry_1.$9k, new descriptors_1.$yh(telemetryService_1.$Qq, [config], false));
            }
            else {
                services.set(telemetry_1.$9k, telemetryUtils_1.$bo);
            }
            // Default Extensions Profile Init
            services.set(extensionsProfileScannerService_1.$kp, new descriptors_1.$yh(extensionsProfileScannerService_2.$lN, undefined, true));
            services.set(extensionsScannerService_1.$op, new descriptors_1.$yh(extensionsScannerService_2.$26b, undefined, true));
            // Utility Process Worker
            services.set(utilityProcessWorkerMainService_1.$96b, new descriptors_1.$yh(utilityProcessWorkerMainService_1.$06b, undefined, true));
            // Init services that require it
            await async_1.Promises.settled([
                backupMainService.initialize(),
                workspacesManagementMainService.initialize()
            ]);
            return this.g.createChild(services);
        }
        P(accessor, mainProcessElectronServer, sharedProcessClient) {
            // Channels registered to node.js are exposed to second instances
            // launching because that is the only way the second instance
            // can talk to the first instance. Electron IPC does not work
            // across apps until `requestSingleInstance` APIs are adopted.
            const disposables = this.B(new lifecycle_1.$jc());
            const launchChannel = ipc_1.ProxyChannel.fromService(accessor.get(launchMainService_1.$j6b), disposables, { disableMarshalling: true });
            this.c.registerChannel('launch', launchChannel);
            const diagnosticsChannel = ipc_1.ProxyChannel.fromService(accessor.get(diagnosticsMainService_1.$X5b), disposables, { disableMarshalling: true });
            this.c.registerChannel('diagnostics', diagnosticsChannel);
            // Policies (main & shared process)
            const policyChannel = new policyIpc_1.$Z6b(accessor.get(policy_1.$0m));
            mainProcessElectronServer.registerChannel('policy', policyChannel);
            sharedProcessClient.then(client => client.registerChannel('policy', policyChannel));
            // Local Files
            const diskFileSystemProvider = this.u.getProvider(network_1.Schemas.file);
            (0, types_1.$tf)(diskFileSystemProvider instanceof diskFileSystemProvider_1.$3p);
            const fileSystemProviderChannel = new diskFileSystemProviderServer_1.$95b(diskFileSystemProvider, this.h, this.m);
            mainProcessElectronServer.registerChannel(diskFileSystemProviderClient_1.$7M, fileSystemProviderChannel);
            sharedProcessClient.then(client => client.registerChannel(diskFileSystemProviderClient_1.$7M, fileSystemProviderChannel));
            // User Data Profiles
            const userDataProfilesService = ipc_1.ProxyChannel.fromService(accessor.get(userDataProfile_1.$v5b), disposables);
            mainProcessElectronServer.registerChannel('userDataProfiles', userDataProfilesService);
            sharedProcessClient.then(client => client.registerChannel('userDataProfiles', userDataProfilesService));
            // Request
            const requestService = new requestIpc_1.$Lq(accessor.get(request_1.$Io));
            sharedProcessClient.then(client => client.registerChannel('request', requestService));
            // Update
            const updateChannel = new updateIpc_1.$D6b(accessor.get(update_1.$UT));
            mainProcessElectronServer.registerChannel('update', updateChannel);
            // Issues
            const issueChannel = ipc_1.ProxyChannel.fromService(accessor.get(issue_1.$qtb), disposables);
            mainProcessElectronServer.registerChannel('issue', issueChannel);
            // Encryption
            const encryptionChannel = ipc_1.ProxyChannel.fromService(accessor.get(encryptionService_1.$CT), disposables);
            mainProcessElectronServer.registerChannel('encryption', encryptionChannel);
            // Signing
            const signChannel = ipc_1.ProxyChannel.fromService(accessor.get(sign_1.$Wk), disposables);
            mainProcessElectronServer.registerChannel('sign', signChannel);
            // Keyboard Layout
            const keyboardLayoutChannel = ipc_1.ProxyChannel.fromService(accessor.get(keyboardLayoutMainService_1.$g6b), disposables);
            mainProcessElectronServer.registerChannel('keyboardLayout', keyboardLayoutChannel);
            // Native host (main & shared process)
            this.b = accessor.get(nativeHostMainService_1.$c6b);
            const nativeHostChannel = ipc_1.ProxyChannel.fromService(this.b, disposables);
            mainProcessElectronServer.registerChannel('nativeHost', nativeHostChannel);
            sharedProcessClient.then(client => client.registerChannel('nativeHost', nativeHostChannel));
            // Workspaces
            const workspacesChannel = ipc_1.ProxyChannel.fromService(accessor.get(workspaces_1.$fU), disposables);
            mainProcessElectronServer.registerChannel('workspaces', workspacesChannel);
            // Menubar
            const menubarChannel = ipc_1.ProxyChannel.fromService(accessor.get(menubarMainService_1.$s6b), disposables);
            mainProcessElectronServer.registerChannel('menubar', menubarChannel);
            // URL handling
            const urlChannel = ipc_1.ProxyChannel.fromService(accessor.get(url_1.$IT), disposables);
            mainProcessElectronServer.registerChannel('url', urlChannel);
            // Extension URL Trust
            const extensionUrlTrustChannel = ipc_1.ProxyChannel.fromService(accessor.get(extensionUrlTrust_1.$9kb), disposables);
            mainProcessElectronServer.registerChannel('extensionUrlTrust', extensionUrlTrustChannel);
            // Webview Manager
            const webviewChannel = ipc_1.ProxyChannel.fromService(accessor.get(webviewManagerService_1.$P6b), disposables);
            mainProcessElectronServer.registerChannel('webview', webviewChannel);
            // Storage (main & shared process)
            const storageChannel = this.B(new storageIpc_1.$A6b(this.h, accessor.get(storageMainService_1.$x5b)));
            mainProcessElectronServer.registerChannel('storage', storageChannel);
            sharedProcessClient.then(client => client.registerChannel('storage', storageChannel));
            // Profile Storage Changes Listener (shared process)
            const profileStorageListener = this.B(new userDataProfileStorageIpc_1.$46b(accessor.get(storageMainService_1.$x5b), accessor.get(userDataProfile_1.$v5b), this.h));
            sharedProcessClient.then(client => client.registerChannel('profileStorageListener', profileStorageListener));
            // Terminal
            const ptyHostChannel = ipc_1.ProxyChannel.fromService(accessor.get(terminal_1.$Yq), disposables);
            mainProcessElectronServer.registerChannel(terminal_1.TerminalIpcChannels.LocalPty, ptyHostChannel);
            // External Terminal
            const externalTerminalChannel = ipc_1.ProxyChannel.fromService(accessor.get(externalTerminal_1.$55b), disposables);
            mainProcessElectronServer.registerChannel('externalTerminal', externalTerminalChannel);
            // Logger
            const loggerChannel = new logIpc_1.$76b(accessor.get(loggerService_1.$u6b));
            mainProcessElectronServer.registerChannel('logger', loggerChannel);
            sharedProcessClient.then(client => client.registerChannel('logger', loggerChannel));
            // Extension Host Debug Broadcasting
            const electronExtensionHostDebugBroadcastChannel = new extensionHostDebugIpc_1.$M5b(accessor.get(windows_1.$B5b));
            mainProcessElectronServer.registerChannel('extensionhostdebugservice', electronExtensionHostDebugBroadcastChannel);
            // Extension Host Starter
            const extensionHostStarterChannel = ipc_1.ProxyChannel.fromService(accessor.get(extensionHostStarter_1.$25b), disposables);
            mainProcessElectronServer.registerChannel(extensionHostStarter_1.$35b, extensionHostStarterChannel);
            // Utility Process Worker
            const utilityProcessWorkerChannel = ipc_1.ProxyChannel.fromService(accessor.get(utilityProcessWorkerMainService_1.$96b), disposables);
            mainProcessElectronServer.registerChannel(utilityProcessWorkerService_1.$86b, utilityProcessWorkerChannel);
        }
        async Q(accessor, initialProtocolUrls) {
            const windowsMainService = this.a = accessor.get(windows_1.$B5b);
            const context = (0, argvHelper_1.$Gl)(process.env) ? 0 /* OpenContext.CLI */ : 4 /* OpenContext.DESKTOP */;
            const args = this.m.args;
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
                        urisToOpen: macOpenFiles.map(path => ((0, workspace_1.$7h)(path) ? { workspaceUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })),
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
        R() {
            // Windows: mutex
            this.S();
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
            this.U(this.m.args, process.env, true);
            // Crash reporter
            this.W();
            if (platform_1.$j && electron_1.app.runningUnderARM64Translation) {
                this.a?.sendToFocused('vscode:showTranslatedBuildWarning');
            }
        }
        async S() {
            const win32MutexName = this.w.win32MutexName;
            if (platform_1.$i && win32MutexName) {
                try {
                    const WindowsMutex = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-mutex'], resolve_1, reject_1); });
                    const mutex = new WindowsMutex.Mutex(win32MutexName);
                    (0, functional_1.$bb)(this.n.onWillShutdown)(() => mutex.release());
                }
                catch (error) {
                    this.h.error(error);
                }
            }
        }
        async U(args, env, notifyOnError) {
            try {
                return await (0, shellEnv_1.$Ml)(this.s, this.h, args, env);
            }
            catch (error) {
                const errorMessage = (0, errorMessage_1.$mi)(error);
                if (notifyOnError) {
                    this.a?.sendToFocused('vscode:showResolveShellEnvError', errorMessage);
                }
                else {
                    this.h.error(errorMessage);
                }
            }
            return {};
        }
        async W() {
            // If enable-crash-reporter argv is undefined then this is a fresh start,
            // based on `telemetry.enableCrashreporter` settings, generate a UUID which
            // will be used as crash reporter id and also update the json file.
            try {
                const argvContent = await this.u.readFile(this.m.argvResource);
                const argvString = argvContent.value.toString();
                const argvJSON = JSON.parse((0, json_1.$Tm)(argvString));
                const telemetryLevel = (0, telemetryUtils_1.$jo)(this.s);
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
                        `	"crash-reporter-id": "${(0, uuid_1.$4f)()}"`,
                        '}'
                    ];
                    const newArgvString = argvString.substring(0, argvString.length - 2).concat(',\n', additionalArgvContent.join('\n'));
                    await this.u.writeFile(this.m.argvResource, buffer_1.$Fd.fromString(newArgvString));
                }
                // Subsequent startup: update crash reporter value if changed
                else {
                    const newArgvString = argvString.replace(/"enable-crash-reporter": .*,/, `"enable-crash-reporter": ${enableCrashReporter},`);
                    if (newArgvString !== argvString) {
                        await this.u.writeFile(this.m.argvResource, buffer_1.$Fd.fromString(newArgvString));
                    }
                }
            }
            catch (error) {
                this.h.error(error);
            }
        }
    };
    exports.$c7b = $c7b;
    exports.$c7b = $c7b = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, log_1.$5i),
        __param(4, log_1.$6i),
        __param(5, environmentMainService_1.$n5b),
        __param(6, lifecycleMainService_1.$p5b),
        __param(7, configuration_1.$8h),
        __param(8, state_1.$eN),
        __param(9, files_1.$6j),
        __param(10, productService_1.$kj),
        __param(11, userDataProfile_1.$v5b)
    ], $c7b);
});
//# sourceMappingURL=app.js.map