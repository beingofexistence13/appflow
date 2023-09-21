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
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "os", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/node/ps", "vs/nls", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/electron-main/diagnosticsMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/log/common/log", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/window/common/window", "vs/base/common/extpath", "vs/platform/state/node/state", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/base/common/cancellation", "vs/base/common/uri", "vs/platform/windows/electron-main/windows", "vs/base/common/async"], function (require, exports, electron_1, ipcMain_1, os_1, lifecycle_1, network_1, platform_1, ps_1, nls_1, diagnostics_1, diagnosticsMainService_1, dialogMainService_1, environmentMainService_1, log_1, nativeHostMainService_1, product_1, productService_1, protocol_1, window_1, extpath_1, state_1, utilityProcess_1, cancellation_1, uri_1, windows_1, async_1) {
    "use strict";
    var IssueMainService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IssueMainService = void 0;
    const processExplorerWindowState = 'issue.processExplorerWindowState';
    let IssueMainService = class IssueMainService {
        static { IssueMainService_1 = this; }
        static { this.DEFAULT_BACKGROUND_COLOR = '#1E1E1E'; }
        constructor(userEnv, environmentMainService, logService, diagnosticsService, diagnosticsMainService, dialogMainService, nativeHostMainService, protocolMainService, productService, stateService, windowsMainService) {
            this.userEnv = userEnv;
            this.environmentMainService = environmentMainService;
            this.logService = logService;
            this.diagnosticsService = diagnosticsService;
            this.diagnosticsMainService = diagnosticsMainService;
            this.dialogMainService = dialogMainService;
            this.nativeHostMainService = nativeHostMainService;
            this.protocolMainService = protocolMainService;
            this.productService = productService;
            this.stateService = stateService;
            this.windowsMainService = windowsMainService;
            this.issueReporterWindow = null;
            this.issueReporterParentWindow = null;
            this.processExplorerWindow = null;
            this.processExplorerParentWindow = null;
            this.registerListeners();
        }
        //#region Register Listeners
        registerListeners() {
            ipcMain_1.validatedIpcMain.on('vscode:listProcesses', async (event) => {
                const processes = [];
                try {
                    processes.push({ name: (0, nls_1.localize)('local', "Local"), rootProcess: await (0, ps_1.listProcesses)(process.pid) });
                    const remoteDiagnostics = await this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true });
                    remoteDiagnostics.forEach(data => {
                        if ((0, diagnostics_1.isRemoteDiagnosticError)(data)) {
                            processes.push({
                                name: data.hostName,
                                rootProcess: data
                            });
                        }
                        else {
                            if (data.processes) {
                                processes.push({
                                    name: data.hostName,
                                    rootProcess: data.processes
                                });
                            }
                        }
                    });
                }
                catch (e) {
                    this.logService.error(`Listing processes failed: ${e}`);
                }
                this.safeSend(event, 'vscode:listProcessesResponse', processes);
            });
            ipcMain_1.validatedIpcMain.on('vscode:workbenchCommand', (_, commandInfo) => {
                const { id, from, args } = commandInfo;
                let parentWindow;
                switch (from) {
                    case 'processExplorer':
                        parentWindow = this.processExplorerParentWindow;
                        break;
                    default:
                        // The issue reporter does not use this anymore.
                        throw new Error(`Unexpected command source: ${from}`);
                }
                parentWindow?.webContents.send('vscode:runAction', { id, from, args });
            });
            ipcMain_1.validatedIpcMain.on('vscode:closeProcessExplorer', event => {
                this.processExplorerWindow?.close();
            });
            ipcMain_1.validatedIpcMain.on('vscode:pidToNameRequest', async (event) => {
                const mainProcessInfo = await this.diagnosticsMainService.getMainDiagnostics();
                const pidToNames = [];
                for (const window of mainProcessInfo.windows) {
                    pidToNames.push([window.pid, `window [${window.id}] (${window.title})`]);
                }
                for (const { pid, name } of utilityProcess_1.UtilityProcess.getAll()) {
                    pidToNames.push([pid, name]);
                }
                this.safeSend(event, 'vscode:pidToNameResponse', pidToNames);
            });
        }
        //#endregion
        //#region Used by renderer
        async openReporter(data) {
            if (!this.issueReporterWindow) {
                this.issueReporterParentWindow = electron_1.BrowserWindow.getFocusedWindow();
                if (this.issueReporterParentWindow) {
                    const issueReporterDisposables = new lifecycle_1.DisposableStore();
                    const issueReporterWindowConfigUrl = issueReporterDisposables.add(this.protocolMainService.createIPCObjectUrl());
                    const position = this.getWindowPosition(this.issueReporterParentWindow, 700, 800);
                    this.issueReporterWindow = this.createBrowserWindow(position, issueReporterWindowConfigUrl, {
                        backgroundColor: data.styles.backgroundColor,
                        title: (0, nls_1.localize)('issueReporter', "Issue Reporter"),
                        zoomLevel: data.zoomLevel,
                        alwaysOnTop: false
                    }, 'issue-reporter');
                    // Store into config object URL
                    issueReporterWindowConfigUrl.update({
                        appRoot: this.environmentMainService.appRoot,
                        windowId: this.issueReporterWindow.id,
                        userEnv: this.userEnv,
                        data,
                        disableExtensions: !!this.environmentMainService.disableExtensions,
                        os: {
                            type: (0, os_1.type)(),
                            arch: (0, os_1.arch)(),
                            release: (0, os_1.release)(),
                        },
                        product: product_1.default
                    });
                    this.issueReporterWindow.loadURL(network_1.FileAccess.asBrowserUri(`vs/code/electron-sandbox/issue/issueReporter${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                    this.issueReporterWindow.on('close', () => {
                        this.issueReporterWindow = null;
                        issueReporterDisposables.dispose();
                    });
                    this.issueReporterParentWindow.on('closed', () => {
                        if (this.issueReporterWindow) {
                            this.issueReporterWindow.close();
                            this.issueReporterWindow = null;
                            issueReporterDisposables.dispose();
                        }
                    });
                }
            }
            if (this.issueReporterWindow) {
                this.focusWindow(this.issueReporterWindow);
            }
        }
        async openProcessExplorer(data) {
            if (!this.processExplorerWindow) {
                this.processExplorerParentWindow = electron_1.BrowserWindow.getFocusedWindow();
                if (this.processExplorerParentWindow) {
                    const processExplorerDisposables = new lifecycle_1.DisposableStore();
                    const processExplorerWindowConfigUrl = processExplorerDisposables.add(this.protocolMainService.createIPCObjectUrl());
                    const savedPosition = this.stateService.getItem(processExplorerWindowState, undefined);
                    const position = isStrictWindowState(savedPosition) ? savedPosition : this.getWindowPosition(this.processExplorerParentWindow, 800, 500);
                    this.processExplorerWindow = this.createBrowserWindow(position, processExplorerWindowConfigUrl, {
                        backgroundColor: data.styles.backgroundColor,
                        title: (0, nls_1.localize)('processExplorer', "Process Explorer"),
                        zoomLevel: data.zoomLevel,
                        alwaysOnTop: true
                    }, 'process-explorer');
                    // Store into config object URL
                    processExplorerWindowConfigUrl.update({
                        appRoot: this.environmentMainService.appRoot,
                        windowId: this.processExplorerWindow.id,
                        userEnv: this.userEnv,
                        data,
                        product: product_1.default
                    });
                    this.processExplorerWindow.loadURL(network_1.FileAccess.asBrowserUri(`vs/code/electron-sandbox/processExplorer/processExplorer${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                    this.processExplorerWindow.on('close', () => {
                        this.processExplorerWindow = null;
                        processExplorerDisposables.dispose();
                    });
                    this.processExplorerParentWindow.on('close', () => {
                        if (this.processExplorerWindow) {
                            this.processExplorerWindow.close();
                            this.processExplorerWindow = null;
                            processExplorerDisposables.dispose();
                        }
                    });
                    const storeState = () => {
                        if (!this.processExplorerWindow) {
                            return;
                        }
                        const size = this.processExplorerWindow.getSize();
                        const position = this.processExplorerWindow.getPosition();
                        if (!size || !position) {
                            return;
                        }
                        const state = {
                            width: size[0],
                            height: size[1],
                            x: position[0],
                            y: position[1]
                        };
                        this.stateService.setItem(processExplorerWindowState, state);
                    };
                    this.processExplorerWindow.on('moved', storeState);
                    this.processExplorerWindow.on('resized', storeState);
                }
            }
            if (this.processExplorerWindow) {
                this.focusWindow(this.processExplorerWindow);
            }
        }
        async stopTracing() {
            if (!this.environmentMainService.args.trace) {
                return; // requires tracing to be on
            }
            const path = await electron_1.contentTracing.stopRecording(`${(0, extpath_1.randomPath)(this.environmentMainService.userHome.fsPath, this.productService.applicationName)}.trace.txt`);
            // Inform user to report an issue
            await this.dialogMainService.showMessageBox({
                type: 'info',
                message: (0, nls_1.localize)('trace.message', "Successfully created the trace file"),
                detail: (0, nls_1.localize)('trace.detail', "Please create an issue and manually attach the following file:\n{0}", path),
                buttons: [(0, nls_1.localize)({ key: 'trace.ok', comment: ['&& denotes a mnemonic'] }, "&&OK")],
            }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
            // Show item in explorer
            this.nativeHostMainService.showItemInFolder(undefined, path);
        }
        async getSystemStatus() {
            const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            return this.diagnosticsService.getDiagnostics(info, remoteData);
        }
        //#endregion
        //#region used by issue reporter window
        async $getSystemInfo() {
            const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            const msg = await this.diagnosticsService.getSystemInfo(info, remoteData);
            return msg;
        }
        async $getPerformanceInfo() {
            try {
                const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
                return await this.diagnosticsService.getPerformanceInfo(info, remoteData);
            }
            catch (error) {
                this.logService.warn('issueService#getPerformanceInfo ', error.message);
                throw error;
            }
        }
        async $reloadWithExtensionsDisabled() {
            if (this.issueReporterParentWindow) {
                try {
                    await this.nativeHostMainService.reload(this.issueReporterParentWindow.id, { disableExtensions: true });
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
        async $showConfirmCloseDialog() {
            if (this.issueReporterWindow) {
                const { response } = await this.dialogMainService.showMessageBox({
                    type: 'warning',
                    message: (0, nls_1.localize)('confirmCloseIssueReporter', "Your input will not be saved. Are you sure you want to close this window?"),
                    buttons: [
                        (0, nls_1.localize)({ key: 'yes', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                        (0, nls_1.localize)('cancel', "Cancel")
                    ]
                }, this.issueReporterWindow);
                if (response === 0) {
                    if (this.issueReporterWindow) {
                        this.issueReporterWindow.destroy();
                        this.issueReporterWindow = null;
                    }
                }
            }
        }
        async $showClipboardDialog() {
            if (this.issueReporterWindow) {
                const { response } = await this.dialogMainService.showMessageBox({
                    type: 'warning',
                    message: (0, nls_1.localize)('issueReporterWriteToClipboard', "There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),
                    buttons: [
                        (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                        (0, nls_1.localize)('cancel', "Cancel")
                    ]
                }, this.issueReporterWindow);
                return response === 0;
            }
            return false;
        }
        async $getIssueReporterUri(extensionId) {
            if (!this.issueReporterParentWindow) {
                throw new Error('Issue reporter window not available');
            }
            const window = this.windowsMainService.getWindowById(this.issueReporterParentWindow.id);
            if (!window) {
                throw new Error('Window not found');
            }
            const replyChannel = `vscode:triggerIssueUriRequestHandlerResponse${window.id}`;
            return async_1.Promises.withAsyncBody(async (resolve, reject) => {
                const cts = new cancellation_1.CancellationTokenSource();
                window.sendWhenReady('vscode:triggerIssueUriRequestHandler', cts.token, { replyChannel, extensionId });
                ipcMain_1.validatedIpcMain.once(replyChannel, (_, data) => {
                    resolve(uri_1.URI.parse(data));
                });
                try {
                    await (0, async_1.timeout)(5000);
                    cts.cancel();
                    reject(new Error('Timed out waiting for issue reporter URI'));
                }
                finally {
                    ipcMain_1.validatedIpcMain.removeHandler(replyChannel);
                }
            });
        }
        async $closeReporter() {
            this.issueReporterWindow?.close();
        }
        async closeProcessExplorer() {
            this.processExplorerWindow?.close();
        }
        //#endregion
        focusWindow(window) {
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }
        safeSend(event, channel, ...args) {
            if (!event.sender.isDestroyed()) {
                event.sender.send(channel, ...args);
            }
        }
        createBrowserWindow(position, ipcObjectUrl, options, windowKind) {
            const window = new electron_1.BrowserWindow({
                fullscreen: false,
                skipTaskbar: false,
                resizable: true,
                width: position.width,
                height: position.height,
                minWidth: 300,
                minHeight: 200,
                x: position.x,
                y: position.y,
                title: options.title,
                backgroundColor: options.backgroundColor || IssueMainService_1.DEFAULT_BACKGROUND_COLOR,
                webPreferences: {
                    preload: network_1.FileAccess.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                    additionalArguments: [`--vscode-window-config=${ipcObjectUrl.resource.toString()}`],
                    v8CacheOptions: this.environmentMainService.useCodeCache ? 'bypassHeatCheck' : 'none',
                    enableWebSQL: false,
                    spellcheck: false,
                    zoomFactor: (0, window_1.zoomLevelToZoomFactor)(options.zoomLevel),
                    sandbox: true
                },
                alwaysOnTop: options.alwaysOnTop,
                experimentalDarkMode: true
            });
            window.setMenuBarVisibility(false);
            return window;
        }
        getWindowPosition(parentWindow, defaultWidth, defaultHeight) {
            // We want the new window to open on the same display that the parent is in
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
                if (!displayToUse && parentWindow) {
                    displayToUse = electron_1.screen.getDisplayMatching(parentWindow.getBounds());
                }
                // fallback to primary display or first display
                if (!displayToUse) {
                    displayToUse = electron_1.screen.getPrimaryDisplay() || displays[0];
                }
            }
            const displayBounds = displayToUse.bounds;
            const state = {
                width: defaultWidth,
                height: defaultHeight,
                x: displayBounds.x + (displayBounds.width / 2) - (defaultWidth / 2),
                y: displayBounds.y + (displayBounds.height / 2) - (defaultHeight / 2)
            };
            if (displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
                if (state.x < displayBounds.x) {
                    state.x = displayBounds.x; // prevent window from falling out of the screen to the left
                }
                if (state.y < displayBounds.y) {
                    state.y = displayBounds.y; // prevent window from falling out of the screen to the top
                }
                if (state.x > (displayBounds.x + displayBounds.width)) {
                    state.x = displayBounds.x; // prevent window from falling out of the screen to the right
                }
                if (state.y > (displayBounds.y + displayBounds.height)) {
                    state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
                }
                if (state.width > displayBounds.width) {
                    state.width = displayBounds.width; // prevent window from exceeding display bounds width
                }
                if (state.height > displayBounds.height) {
                    state.height = displayBounds.height; // prevent window from exceeding display bounds height
                }
            }
            return state;
        }
    };
    exports.IssueMainService = IssueMainService;
    exports.IssueMainService = IssueMainService = IssueMainService_1 = __decorate([
        __param(1, environmentMainService_1.IEnvironmentMainService),
        __param(2, log_1.ILogService),
        __param(3, diagnostics_1.IDiagnosticsService),
        __param(4, diagnosticsMainService_1.IDiagnosticsMainService),
        __param(5, dialogMainService_1.IDialogMainService),
        __param(6, nativeHostMainService_1.INativeHostMainService),
        __param(7, protocol_1.IProtocolMainService),
        __param(8, productService_1.IProductService),
        __param(9, state_1.IStateService),
        __param(10, windows_1.IWindowsMainService)
    ], IssueMainService);
    function isStrictWindowState(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        return ('x' in obj &&
            'y' in obj &&
            'width' in obj &&
            'height' in obj);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2lzc3VlL2VsZWN0cm9uLW1haW4vaXNzdWVNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLDBCQUEwQixHQUFHLGtDQUFrQyxDQUFDO0lBVy9ELElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCOztpQkFJSiw2QkFBd0IsR0FBRyxTQUFTLEFBQVosQ0FBYTtRQVE3RCxZQUNTLE9BQTRCLEVBQ1gsc0JBQWdFLEVBQzVFLFVBQXdDLEVBQ2hDLGtCQUF3RCxFQUNwRCxzQkFBZ0UsRUFDckUsaUJBQXNELEVBQ2xELHFCQUE4RCxFQUNoRSxtQkFBMEQsRUFDL0QsY0FBZ0QsRUFDbEQsWUFBNEMsRUFDdEMsa0JBQXdEO1lBVnJFLFlBQU8sR0FBUCxPQUFPLENBQXFCO1lBQ00sMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMzRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNuQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQ3BELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDakMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUMvQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzlDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNqQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNyQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBakJ0RSx3QkFBbUIsR0FBeUIsSUFBSSxDQUFDO1lBQ2pELDhCQUF5QixHQUF5QixJQUFJLENBQUM7WUFFdkQsMEJBQXFCLEdBQXlCLElBQUksQ0FBQztZQUNuRCxnQ0FBMkIsR0FBeUIsSUFBSSxDQUFD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