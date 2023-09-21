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
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "os", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/node/ps", "vs/nls!vs/platform/issue/electron-main/issueMainService", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/electron-main/diagnosticsMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/log/common/log", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/window/common/window", "vs/base/common/extpath", "vs/platform/state/node/state", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/base/common/cancellation", "vs/base/common/uri", "vs/platform/windows/electron-main/windows", "vs/base/common/async"], function (require, exports, electron_1, ipcMain_1, os_1, lifecycle_1, network_1, platform_1, ps_1, nls_1, diagnostics_1, diagnosticsMainService_1, dialogMainService_1, environmentMainService_1, log_1, nativeHostMainService_1, product_1, productService_1, protocol_1, window_1, extpath_1, state_1, utilityProcess_1, cancellation_1, uri_1, windows_1, async_1) {
    "use strict";
    var $f6b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f6b = void 0;
    const processExplorerWindowState = 'issue.processExplorerWindowState';
    let $f6b = class $f6b {
        static { $f6b_1 = this; }
        static { this.a = '#1E1E1E'; }
        constructor(g, h, i, j, k, l, m, n, o, p, q) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.b = null;
            this.c = null;
            this.d = null;
            this.f = null;
            this.r();
        }
        //#region Register Listeners
        r() {
            ipcMain_1.$US.on('vscode:listProcesses', async (event) => {
                const processes = [];
                try {
                    processes.push({ name: (0, nls_1.localize)(0, null), rootProcess: await (0, ps_1.$sr)(process.pid) });
                    const remoteDiagnostics = await this.k.getRemoteDiagnostics({ includeProcesses: true });
                    remoteDiagnostics.forEach(data => {
                        if ((0, diagnostics_1.$hm)(data)) {
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
                    this.i.error(`Listing processes failed: ${e}`);
                }
                this.t(event, 'vscode:listProcessesResponse', processes);
            });
            ipcMain_1.$US.on('vscode:workbenchCommand', (_, commandInfo) => {
                const { id, from, args } = commandInfo;
                let parentWindow;
                switch (from) {
                    case 'processExplorer':
                        parentWindow = this.f;
                        break;
                    default:
                        // The issue reporter does not use this anymore.
                        throw new Error(`Unexpected command source: ${from}`);
                }
                parentWindow?.webContents.send('vscode:runAction', { id, from, args });
            });
            ipcMain_1.$US.on('vscode:closeProcessExplorer', event => {
                this.d?.close();
            });
            ipcMain_1.$US.on('vscode:pidToNameRequest', async (event) => {
                const mainProcessInfo = await this.k.getMainDiagnostics();
                const pidToNames = [];
                for (const window of mainProcessInfo.windows) {
                    pidToNames.push([window.pid, `window [${window.id}] (${window.title})`]);
                }
                for (const { pid, name } of utilityProcess_1.$U5b.getAll()) {
                    pidToNames.push([pid, name]);
                }
                this.t(event, 'vscode:pidToNameResponse', pidToNames);
            });
        }
        //#endregion
        //#region Used by renderer
        async openReporter(data) {
            if (!this.b) {
                this.c = electron_1.BrowserWindow.getFocusedWindow();
                if (this.c) {
                    const issueReporterDisposables = new lifecycle_1.$jc();
                    const issueReporterWindowConfigUrl = issueReporterDisposables.add(this.n.createIPCObjectUrl());
                    const position = this.v(this.c, 700, 800);
                    this.b = this.u(position, issueReporterWindowConfigUrl, {
                        backgroundColor: data.styles.backgroundColor,
                        title: (0, nls_1.localize)(1, null),
                        zoomLevel: data.zoomLevel,
                        alwaysOnTop: false
                    }, 'issue-reporter');
                    // Store into config object URL
                    issueReporterWindowConfigUrl.update({
                        appRoot: this.h.appRoot,
                        windowId: this.b.id,
                        userEnv: this.g,
                        data,
                        disableExtensions: !!this.h.disableExtensions,
                        os: {
                            type: (0, os_1.type)(),
                            arch: (0, os_1.arch)(),
                            release: (0, os_1.release)(),
                        },
                        product: product_1.default
                    });
                    this.b.loadURL(network_1.$2f.asBrowserUri(`vs/code/electron-sandbox/issue/issueReporter${this.h.isBuilt ? '' : '-dev'}.html`).toString(true));
                    this.b.on('close', () => {
                        this.b = null;
                        issueReporterDisposables.dispose();
                    });
                    this.c.on('closed', () => {
                        if (this.b) {
                            this.b.close();
                            this.b = null;
                            issueReporterDisposables.dispose();
                        }
                    });
                }
            }
            if (this.b) {
                this.s(this.b);
            }
        }
        async openProcessExplorer(data) {
            if (!this.d) {
                this.f = electron_1.BrowserWindow.getFocusedWindow();
                if (this.f) {
                    const processExplorerDisposables = new lifecycle_1.$jc();
                    const processExplorerWindowConfigUrl = processExplorerDisposables.add(this.n.createIPCObjectUrl());
                    const savedPosition = this.p.getItem(processExplorerWindowState, undefined);
                    const position = isStrictWindowState(savedPosition) ? savedPosition : this.v(this.f, 800, 500);
                    this.d = this.u(position, processExplorerWindowConfigUrl, {
                        backgroundColor: data.styles.backgroundColor,
                        title: (0, nls_1.localize)(2, null),
                        zoomLevel: data.zoomLevel,
                        alwaysOnTop: true
                    }, 'process-explorer');
                    // Store into config object URL
                    processExplorerWindowConfigUrl.update({
                        appRoot: this.h.appRoot,
                        windowId: this.d.id,
                        userEnv: this.g,
                        data,
                        product: product_1.default
                    });
                    this.d.loadURL(network_1.$2f.asBrowserUri(`vs/code/electron-sandbox/processExplorer/processExplorer${this.h.isBuilt ? '' : '-dev'}.html`).toString(true));
                    this.d.on('close', () => {
                        this.d = null;
                        processExplorerDisposables.dispose();
                    });
                    this.f.on('close', () => {
                        if (this.d) {
                            this.d.close();
                            this.d = null;
                            processExplorerDisposables.dispose();
                        }
                    });
                    const storeState = () => {
                        if (!this.d) {
                            return;
                        }
                        const size = this.d.getSize();
                        const position = this.d.getPosition();
                        if (!size || !position) {
                            return;
                        }
                        const state = {
                            width: size[0],
                            height: size[1],
                            x: position[0],
                            y: position[1]
                        };
                        this.p.setItem(processExplorerWindowState, state);
                    };
                    this.d.on('moved', storeState);
                    this.d.on('resized', storeState);
                }
            }
            if (this.d) {
                this.s(this.d);
            }
        }
        async stopTracing() {
            if (!this.h.args.trace) {
                return; // requires tracing to be on
            }
            const path = await electron_1.contentTracing.stopRecording(`${(0, extpath_1.$Qf)(this.h.userHome.fsPath, this.o.applicationName)}.trace.txt`);
            // Inform user to report an issue
            await this.l.showMessageBox({
                type: 'info',
                message: (0, nls_1.localize)(3, null),
                detail: (0, nls_1.localize)(4, null, path),
                buttons: [(0, nls_1.localize)(5, null)],
            }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
            // Show item in explorer
            this.m.showItemInFolder(undefined, path);
        }
        async getSystemStatus() {
            const [info, remoteData] = await Promise.all([this.k.getMainDiagnostics(), this.k.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            return this.j.getDiagnostics(info, remoteData);
        }
        //#endregion
        //#region used by issue reporter window
        async $getSystemInfo() {
            const [info, remoteData] = await Promise.all([this.k.getMainDiagnostics(), this.k.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            const msg = await this.j.getSystemInfo(info, remoteData);
            return msg;
        }
        async $getPerformanceInfo() {
            try {
                const [info, remoteData] = await Promise.all([this.k.getMainDiagnostics(), this.k.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
                return await this.j.getPerformanceInfo(info, remoteData);
            }
            catch (error) {
                this.i.warn('issueService#getPerformanceInfo ', error.message);
                throw error;
            }
        }
        async $reloadWithExtensionsDisabled() {
            if (this.c) {
                try {
                    await this.m.reload(this.c.id, { disableExtensions: true });
                }
                catch (error) {
                    this.i.error(error);
                }
            }
        }
        async $showConfirmCloseDialog() {
            if (this.b) {
                const { response } = await this.l.showMessageBox({
                    type: 'warning',
                    message: (0, nls_1.localize)(6, null),
                    buttons: [
                        (0, nls_1.localize)(7, null),
                        (0, nls_1.localize)(8, null)
                    ]
                }, this.b);
                if (response === 0) {
                    if (this.b) {
                        this.b.destroy();
                        this.b = null;
                    }
                }
            }
        }
        async $showClipboardDialog() {
            if (this.b) {
                const { response } = await this.l.showMessageBox({
                    type: 'warning',
                    message: (0, nls_1.localize)(9, null),
                    buttons: [
                        (0, nls_1.localize)(10, null),
                        (0, nls_1.localize)(11, null)
                    ]
                }, this.b);
                return response === 0;
            }
            return false;
        }
        async $getIssueReporterUri(extensionId) {
            if (!this.c) {
                throw new Error('Issue reporter window not available');
            }
            const window = this.q.getWindowById(this.c.id);
            if (!window) {
                throw new Error('Window not found');
            }
            const replyChannel = `vscode:triggerIssueUriRequestHandlerResponse${window.id}`;
            return async_1.Promises.withAsyncBody(async (resolve, reject) => {
                const cts = new cancellation_1.$pd();
                window.sendWhenReady('vscode:triggerIssueUriRequestHandler', cts.token, { replyChannel, extensionId });
                ipcMain_1.$US.once(replyChannel, (_, data) => {
                    resolve(uri_1.URI.parse(data));
                });
                try {
                    await (0, async_1.$Hg)(5000);
                    cts.cancel();
                    reject(new Error('Timed out waiting for issue reporter URI'));
                }
                finally {
                    ipcMain_1.$US.removeHandler(replyChannel);
                }
            });
        }
        async $closeReporter() {
            this.b?.close();
        }
        async closeProcessExplorer() {
            this.d?.close();
        }
        //#endregion
        s(window) {
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }
        t(event, channel, ...args) {
            if (!event.sender.isDestroyed()) {
                event.sender.send(channel, ...args);
            }
        }
        u(position, ipcObjectUrl, options, windowKind) {
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
                backgroundColor: options.backgroundColor || $f6b_1.a,
                webPreferences: {
                    preload: network_1.$2f.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                    additionalArguments: [`--vscode-window-config=${ipcObjectUrl.resource.toString()}`],
                    v8CacheOptions: this.h.useCodeCache ? 'bypassHeatCheck' : 'none',
                    enableWebSQL: false,
                    spellcheck: false,
                    zoomFactor: (0, window_1.$WD)(options.zoomLevel),
                    sandbox: true
                },
                alwaysOnTop: options.alwaysOnTop,
                experimentalDarkMode: true
            });
            window.setMenuBarVisibility(false);
            return window;
        }
        v(parentWindow, defaultWidth, defaultHeight) {
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
                if (platform_1.$j) {
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
    exports.$f6b = $f6b;
    exports.$f6b = $f6b = $f6b_1 = __decorate([
        __param(1, environmentMainService_1.$n5b),
        __param(2, log_1.$5i),
        __param(3, diagnostics_1.$gm),
        __param(4, diagnosticsMainService_1.$X5b),
        __param(5, dialogMainService_1.$N5b),
        __param(6, nativeHostMainService_1.$c6b),
        __param(7, protocol_1.$e6b),
        __param(8, productService_1.$kj),
        __param(9, state_1.$eN),
        __param(10, windows_1.$B5b)
    ], $f6b);
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
//# sourceMappingURL=issueMainService.js.map