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
define(["require", "exports", "child_process", "electron", "os", "util", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/extpath", "vs/base/node/id", "vs/base/node/pfs", "vs/base/node/ports", "vs/nls!vs/platform/native/electron-main/nativeHostMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/theme/electron-main/themeMainService", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/buffer", "vs/platform/remote/node/wsl", "vs/platform/profiling/electron-main/windowProfiling"], function (require, exports, child_process_1, electron_1, os_1, util_1, decorators_1, event_1, lifecycle_1, network_1, path_1, platform_1, uri_1, extpath_1, id_1, pfs_1, ports_1, nls_1, dialogMainService_1, environmentMainService_1, instantiation_1, lifecycleMainService_1, log_1, productService_1, themeMainService_1, windows_1, workspace_1, workspacesManagementMainService_1, buffer_1, wsl_1, windowProfiling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d6b = exports.$c6b = void 0;
    exports.$c6b = (0, instantiation_1.$Bh)('nativeHostMainService');
    let $d6b = class $d6b extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h, j, m) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            //#endregion
            //#region Events
            this.onDidOpenWindow = event_1.Event.map(this.a.onDidOpenWindow, window => window.id);
            this.onDidTriggerSystemContextMenu = event_1.Event.filter(event_1.Event.map(this.a.onDidTriggerSystemContextMenu, ({ window, x, y }) => { return { windowId: window.id, x, y }; }), ({ windowId }) => !!this.a.getWindowById(windowId));
            this.onDidMaximizeWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-maximize', (event, window) => window.id), windowId => !!this.a.getWindowById(windowId));
            this.onDidUnmaximizeWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-unmaximize', (event, window) => window.id), windowId => !!this.a.getWindowById(windowId));
            this.onDidBlurWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', (event, window) => window.id), windowId => !!this.a.getWindowById(windowId));
            this.onDidFocusWindow = event_1.Event.any(event_1.Event.map(event_1.Event.filter(event_1.Event.map(this.a.onDidChangeWindowsCount, () => this.a.getLastActiveWindow()), window => !!window), window => window.id), event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', (event, window) => window.id), windowId => !!this.a.getWindowById(windowId)));
            this.onDidResumeOS = event_1.Event.fromNodeEventEmitter(electron_1.powerMonitor, 'resume');
            this.onDidChangeColorScheme = this.j.onDidChangeColorScheme;
            this.n = this.B(new event_1.$fd());
            this.onDidChangePassword = this.n.event;
            this.onDidChangeDisplay = event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-metrics-changed', (event, display, changedMetrics) => changedMetrics), changedMetrics => {
                // Electron will emit 'display-metrics-changed' events even when actually
                // going fullscreen, because the dock hides. However, we do not want to
                // react on this event as there is no change in display bounds.
                return !(Array.isArray(changedMetrics) && changedMetrics.length === 1 && changedMetrics[0] === 'workArea');
            }), event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-added'), event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-removed')), () => { }, 100);
        }
        //#region Properties
        get windowId() { throw new Error('Not implemented in electron-main'); }
        //#endregion
        //#region Window
        async getWindows() {
            const windows = this.a.getWindows();
            return windows.map(window => ({
                id: window.id,
                workspace: window.openedWorkspace ?? (0, workspace_1.$Ph)(window.backupPath, window.isExtensionDevelopmentHost),
                title: window.win?.getTitle() ?? '',
                filename: window.getRepresentedFilename(),
                dirty: window.isDocumentEdited()
            }));
        }
        async getWindowCount(windowId) {
            return this.a.getWindowCount();
        }
        async getActiveWindowId(windowId) {
            const activeWindow = electron_1.BrowserWindow.getFocusedWindow() || this.a.getLastActiveWindow();
            if (activeWindow) {
                return activeWindow.id;
            }
            return undefined;
        }
        openWindow(windowId, arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.r(windowId, arg1, arg2);
            }
            return this.s(windowId, arg1);
        }
        async r(windowId, toOpen, options = Object.create(null)) {
            if (toOpen.length > 0) {
                await this.a.open({
                    context: 5 /* OpenContext.API */,
                    contextWindowId: windowId,
                    urisToOpen: toOpen,
                    cli: this.f.args,
                    forceNewWindow: options.forceNewWindow,
                    forceReuseWindow: options.forceReuseWindow,
                    preferNewWindow: options.preferNewWindow,
                    diffMode: options.diffMode,
                    mergeMode: options.mergeMode,
                    addMode: options.addMode,
                    gotoLineMode: options.gotoLineMode,
                    noRecentEntry: options.noRecentEntry,
                    waitMarkerFileURI: options.waitMarkerFileURI,
                    remoteAuthority: options.remoteAuthority || undefined,
                    forceProfile: options.forceProfile,
                    forceTempProfile: options.forceTempProfile,
                });
            }
        }
        async s(windowId, options) {
            await this.a.openEmptyWindow({
                context: 5 /* OpenContext.API */,
                contextWindowId: windowId
            }, options);
        }
        async toggleFullScreen(windowId) {
            const window = this.C(windowId);
            window?.toggleFullScreen();
        }
        async handleTitleDoubleClick(windowId) {
            const window = this.C(windowId);
            window?.handleTitleDoubleClick();
        }
        async isMaximized(windowId) {
            const window = this.C(windowId);
            if (window?.win) {
                return window.win.isMaximized();
            }
            return false;
        }
        async maximizeWindow(windowId) {
            const window = this.C(windowId);
            if (window?.win) {
                window.win.maximize();
            }
        }
        async unmaximizeWindow(windowId) {
            const window = this.C(windowId);
            if (window?.win) {
                window.win.unmaximize();
            }
        }
        async minimizeWindow(windowId) {
            const window = this.C(windowId);
            if (window?.win) {
                window.win.minimize();
            }
        }
        async updateWindowControls(windowId, options) {
            const window = this.C(windowId);
            if (window) {
                window.updateWindowControls(options);
            }
        }
        async focusWindow(windowId, options) {
            if (options && typeof options.windowId === 'number') {
                windowId = options.windowId;
            }
            const window = this.C(windowId);
            window?.focus({ force: options?.force ?? false });
        }
        async setMinimumSize(windowId, width, height) {
            const window = this.C(windowId);
            if (window?.win) {
                const [windowWidth, windowHeight] = window.win.getSize();
                const [minWindowWidth, minWindowHeight] = window.win.getMinimumSize();
                const [newMinWindowWidth, newMinWindowHeight] = [width ?? minWindowWidth, height ?? minWindowHeight];
                const [newWindowWidth, newWindowHeight] = [Math.max(windowWidth, newMinWindowWidth), Math.max(windowHeight, newMinWindowHeight)];
                if (minWindowWidth !== newMinWindowWidth || minWindowHeight !== newMinWindowHeight) {
                    window.win.setMinimumSize(newMinWindowWidth, newMinWindowHeight);
                }
                if (windowWidth !== newWindowWidth || windowHeight !== newWindowHeight) {
                    window.win.setSize(newWindowWidth, newWindowHeight);
                }
            }
        }
        async saveWindowSplash(windowId, splash) {
            this.j.saveWindowSplash(windowId, splash);
        }
        //#endregion
        //#region macOS Shell Command
        async installShellCommand(windowId) {
            const { source, target } = await this.t();
            // Only install unless already existing
            try {
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(source);
                if (symbolicLink && !symbolicLink.dangling) {
                    const linkTargetRealPath = await (0, extpath_1.$Wp)(source);
                    if (target === linkTargetRealPath) {
                        return;
                    }
                }
                // Different source, delete it first
                await pfs_1.Promises.unlink(source);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error; // throw on any error but file not found
                }
            }
            try {
                await pfs_1.Promises.symlink(target, source);
            }
            catch (error) {
                if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
                    throw error;
                }
                const { response } = await this.showMessageBox(windowId, {
                    type: 'info',
                    message: (0, nls_1.localize)(0, null, this.h.nameShort),
                    buttons: [
                        (0, nls_1.localize)(1, null),
                        (0, nls_1.localize)(2, null)
                    ]
                });
                if (response === 0 /* OK */) {
                    try {
                        const command = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'${target}\' \'${source}\'\\" with administrator privileges"`;
                        await (0, util_1.promisify)(child_process_1.exec)(command);
                    }
                    catch (error) {
                        throw new Error((0, nls_1.localize)(3, null, source));
                    }
                }
            }
        }
        async uninstallShellCommand(windowId) {
            const { source } = await this.t();
            try {
                await pfs_1.Promises.unlink(source);
            }
            catch (error) {
                switch (error.code) {
                    case 'EACCES': {
                        const { response } = await this.showMessageBox(windowId, {
                            type: 'info',
                            message: (0, nls_1.localize)(4, null, this.h.nameShort),
                            buttons: [
                                (0, nls_1.localize)(5, null),
                                (0, nls_1.localize)(6, null)
                            ]
                        });
                        if (response === 0 /* OK */) {
                            try {
                                const command = `osascript -e "do shell script \\"rm \'${source}\'\\" with administrator privileges"`;
                                await (0, util_1.promisify)(child_process_1.exec)(command);
                            }
                            catch (error) {
                                throw new Error((0, nls_1.localize)(7, null, source));
                            }
                        }
                        break;
                    }
                    case 'ENOENT':
                        break; // ignore file not found
                    default:
                        throw error;
                }
            }
        }
        async t() {
            const target = (0, path_1.$0d)(this.f.appRoot, 'bin', 'code');
            const source = `/usr/local/bin/${this.h.applicationName}`;
            // Ensure source exists
            const sourceExists = await pfs_1.Promises.exists(target);
            if (!sourceExists) {
                throw new Error((0, nls_1.localize)(8, null, target));
            }
            return { source, target };
        }
        //#region Dialog
        async showMessageBox(windowId, options) {
            return this.b.showMessageBox(options, this.u(windowId));
        }
        async showSaveDialog(windowId, options) {
            return this.b.showSaveDialog(options, this.u(windowId));
        }
        async showOpenDialog(windowId, options) {
            return this.b.showOpenDialog(options, this.u(windowId));
        }
        u(windowId) {
            const window = this.C(windowId);
            if (window?.win) {
                return window.win;
            }
            return undefined;
        }
        async pickFileFolderAndOpen(windowId, options) {
            const paths = await this.b.pickFileFolder(options);
            if (paths) {
                await this.w(await Promise.all(paths.map(async (path) => (await pfs_1.SymlinkSupport.existsDirectory(path)) ? { folderUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFolderAndOpen(windowId, options) {
            const paths = await this.b.pickFolder(options);
            if (paths) {
                await this.w(paths.map(path => ({ folderUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFileAndOpen(windowId, options) {
            const paths = await this.b.pickFile(options);
            if (paths) {
                await this.w(paths.map(path => ({ fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickWorkspaceAndOpen(windowId, options) {
            const paths = await this.b.pickWorkspace(options);
            if (paths) {
                await this.w(paths.map(path => ({ workspaceUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async w(openable, options, windowId) {
            await this.a.open({
                context: 3 /* OpenContext.DIALOG */,
                contextWindowId: windowId,
                cli: this.f.args,
                urisToOpen: openable,
                forceNewWindow: options.forceNewWindow,
                /* remoteAuthority will be determined based on openable */
            });
        }
        //#endregion
        //#region OS
        async showItemInFolder(windowId, path) {
            electron_1.shell.showItemInFolder(path);
        }
        async setRepresentedFilename(windowId, path) {
            const window = this.C(windowId);
            window?.setRepresentedFilename(path);
        }
        async setDocumentEdited(windowId, edited) {
            const window = this.C(windowId);
            window?.setDocumentEdited(edited);
        }
        async openExternal(windowId, url) {
            this.f.unsetSnapExportedVariables();
            electron_1.shell.openExternal(url);
            this.f.restoreSnapExportedVariables();
            return true;
        }
        moveItemToTrash(windowId, fullPath) {
            return electron_1.shell.trashItem(fullPath);
        }
        async isAdmin() {
            let isAdmin;
            if (platform_1.$i) {
                isAdmin = (await new Promise((resolve_1, reject_1) => { require(['native-is-elevated'], resolve_1, reject_1); }))();
            }
            else {
                isAdmin = process.getuid?.() === 0;
            }
            return isAdmin;
        }
        async writeElevated(windowId, source, target, options) {
            const sudoPrompt = await new Promise((resolve_2, reject_2) => { require(['@vscode/sudo-prompt'], resolve_2, reject_2); });
            return new Promise((resolve, reject) => {
                const sudoCommand = [`"${this.z}"`];
                if (options?.unlock) {
                    sudoCommand.push('--file-chmod');
                }
                sudoCommand.push('--file-write', `"${source.fsPath}"`, `"${target.fsPath}"`);
                const promptOptions = {
                    name: this.h.nameLong.replace('-', ''),
                    icns: (platform_1.$j && this.f.isBuilt) ? (0, path_1.$9d)((0, path_1.$_d)(this.f.appRoot), `${this.h.nameShort}.icns`) : undefined
                };
                sudoPrompt.exec(sudoCommand.join(' '), promptOptions, (error, stdout, stderr) => {
                    if (stdout) {
                        this.g.trace(`[sudo-prompt] received stdout: ${stdout}`);
                    }
                    if (stderr) {
                        this.g.trace(`[sudo-prompt] received stderr: ${stderr}`);
                    }
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        }
        async isRunningUnderARM64Translation() {
            if (platform_1.$k || platform_1.$i) {
                return false;
            }
            return electron_1.app.runningUnderARM64Translation;
        }
        get z() {
            // Windows
            if (platform_1.$i) {
                if (this.f.isBuilt) {
                    return (0, path_1.$9d)((0, path_1.$_d)(process.execPath), 'bin', `${this.h.applicationName}.cmd`);
                }
                return (0, path_1.$9d)(this.f.appRoot, 'scripts', 'code-cli.bat');
            }
            // Linux
            if (platform_1.$k) {
                if (this.f.isBuilt) {
                    return (0, path_1.$9d)((0, path_1.$_d)(process.execPath), 'bin', `${this.h.applicationName}`);
                }
                return (0, path_1.$9d)(this.f.appRoot, 'scripts', 'code-cli.sh');
            }
            // macOS
            if (this.f.isBuilt) {
                return (0, path_1.$9d)(this.f.appRoot, 'bin', 'code');
            }
            return (0, path_1.$9d)(this.f.appRoot, 'scripts', 'code-cli.sh');
        }
        async getOSStatistics() {
            return {
                totalmem: (0, os_1.totalmem)(),
                freemem: (0, os_1.freemem)(),
                loadavg: (0, os_1.loadavg)()
            };
        }
        async getOSProperties() {
            return {
                arch: (0, os_1.arch)(),
                platform: (0, os_1.platform)(),
                release: (0, os_1.release)(),
                type: (0, os_1.type)(),
                cpus: (0, os_1.cpus)()
            };
        }
        async getOSVirtualMachineHint() {
            return id_1.$Hm.value();
        }
        async getOSColorScheme() {
            return this.j.getColorScheme();
        }
        // WSL
        async hasWSLFeatureInstalled() {
            return platform_1.$i && (0, wsl_1.$a6b)();
        }
        //#endregion
        //#region Process
        async killProcess(windowId, pid, code) {
            process.kill(pid, code);
        }
        //#endregion
        //#region Clipboard
        async readClipboardText(windowId, type) {
            return electron_1.clipboard.readText(type);
        }
        async writeClipboardText(windowId, text, type) {
            return electron_1.clipboard.writeText(text, type);
        }
        async readClipboardFindText(windowId) {
            return electron_1.clipboard.readFindText();
        }
        async writeClipboardFindText(windowId, text) {
            return electron_1.clipboard.writeFindText(text);
        }
        async writeClipboardBuffer(windowId, format, buffer, type) {
            return electron_1.clipboard.writeBuffer(format, Buffer.from(buffer.buffer), type);
        }
        async readClipboardBuffer(windowId, format) {
            return buffer_1.$Fd.wrap(electron_1.clipboard.readBuffer(format));
        }
        async hasClipboard(windowId, format, type) {
            return electron_1.clipboard.has(format, type);
        }
        //#endregion
        //#region macOS Touchbar
        async newWindowTab() {
            await this.a.open({
                context: 5 /* OpenContext.API */,
                cli: this.f.args,
                forceNewTabbedWindow: true,
                forceEmpty: true,
                remoteAuthority: this.f.args.remote || undefined
            });
        }
        async showPreviousWindowTab() {
            electron_1.Menu.sendActionToFirstResponder('selectPreviousTab:');
        }
        async showNextWindowTab() {
            electron_1.Menu.sendActionToFirstResponder('selectNextTab:');
        }
        async moveWindowTabToNewWindow() {
            electron_1.Menu.sendActionToFirstResponder('moveTabToNewWindow:');
        }
        async mergeAllWindowTabs() {
            electron_1.Menu.sendActionToFirstResponder('mergeAllWindows:');
        }
        async toggleWindowTabsBar() {
            electron_1.Menu.sendActionToFirstResponder('toggleTabBar:');
        }
        async updateTouchBar(windowId, items) {
            const window = this.C(windowId);
            window?.updateTouchBar(items);
        }
        //#endregion
        //#region Lifecycle
        async notifyReady(windowId) {
            const window = this.C(windowId);
            window?.setReady();
        }
        async relaunch(windowId, options) {
            return this.c.relaunch(options);
        }
        async reload(windowId, options) {
            const window = this.C(windowId);
            if (window) {
                // Special case: support `transient` workspaces by preventing
                // the reload and rather go back to an empty window. Transient
                // workspaces should never restore, even when the user wants
                // to reload.
                // For: https://github.com/microsoft/vscode/issues/119695
                if ((0, workspace_1.$Qh)(window.openedWorkspace)) {
                    const configPath = window.openedWorkspace.configPath;
                    if (configPath.scheme === network_1.Schemas.file) {
                        const workspace = await this.m.resolveLocalWorkspace(configPath);
                        if (workspace?.transient) {
                            return this.openWindow(window.id, { forceReuseWindow: true });
                        }
                    }
                }
                // Proceed normally to reload the window
                return this.c.reload(window, options?.disableExtensions !== undefined ? { _: [], 'disable-extensions': options.disableExtensions } : undefined);
            }
        }
        async closeWindow(windowId) {
            this.closeWindowById(windowId, windowId);
        }
        async closeWindowById(currentWindowId, targetWindowId) {
            const window = this.C(targetWindowId);
            if (window?.win) {
                return window.win.close();
            }
        }
        async quit(windowId) {
            // If the user selected to exit from an extension development host window, do not quit, but just
            // close the window unless this is the last window that is opened.
            const window = this.a.getLastActiveWindow();
            if (window?.isExtensionDevelopmentHost && this.a.getWindowCount() > 1 && window.win) {
                window.win.close();
            }
            // Otherwise: normal quit
            else {
                this.c.quit();
            }
        }
        async exit(windowId, code) {
            await this.c.kill(code);
        }
        //#endregion
        //#region Connectivity
        async resolveProxy(windowId, url) {
            const window = this.C(windowId);
            const session = window?.win?.webContents?.session;
            return session?.resolveProxy(url);
        }
        findFreePort(windowId, startPort, giveUpAfter, timeout, stride = 1) {
            return (0, ports_1.$6f)(startPort, giveUpAfter, timeout, stride);
        }
        //#endregion
        //#region Development
        async openDevTools(windowId, options) {
            const window = this.C(windowId);
            if (window?.win) {
                window.win.webContents.openDevTools(options);
            }
        }
        async toggleDevTools(windowId) {
            const window = this.C(windowId);
            if (window?.win) {
                const contents = window.win.webContents;
                contents.toggleDevTools();
            }
        }
        async sendInputEvent(windowId, event) {
            const window = this.C(windowId);
            if (window?.win && (event.type === 'mouseDown' || event.type === 'mouseUp')) {
                window.win.webContents.sendInputEvent(event);
            }
        }
        //#endregion
        // #region Performance
        async profileRenderer(windowId, session, duration) {
            const win = this.C(windowId);
            if (!win || !win.win) {
                throw new Error();
            }
            const profiler = new windowProfiling_1.$b6b(win.win, session, this.g);
            const result = await profiler.inspect(duration);
            return result;
        }
        // #endregion
        //#region Registry (windows)
        async windowsGetStringRegKey(windowId, hive, path, name) {
            if (!platform_1.$i) {
                return undefined;
            }
            const Registry = await new Promise((resolve_3, reject_3) => { require(['@vscode/windows-registry'], resolve_3, reject_3); });
            try {
                return Registry.GetStringRegKey(hive, path, name);
            }
            catch {
                return undefined;
            }
        }
        //#endregion
        C(windowId) {
            if (typeof windowId !== 'number') {
                return undefined;
            }
            return this.a.getWindowById(windowId);
        }
    };
    exports.$d6b = $d6b;
    __decorate([
        decorators_1.$6g
    ], $d6b.prototype, "z", null);
    exports.$d6b = $d6b = __decorate([
        __param(0, windows_1.$B5b),
        __param(1, dialogMainService_1.$N5b),
        __param(2, lifecycleMainService_1.$p5b),
        __param(3, environmentMainService_1.$n5b),
        __param(4, log_1.$5i),
        __param(5, productService_1.$kj),
        __param(6, themeMainService_1.$$5b),
        __param(7, workspacesManagementMainService_1.$S5b)
    ], $d6b);
});
//# sourceMappingURL=nativeHostMainService.js.map