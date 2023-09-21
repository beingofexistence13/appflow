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
define(["require", "exports", "child_process", "electron", "os", "util", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/extpath", "vs/base/node/id", "vs/base/node/pfs", "vs/base/node/ports", "vs/nls", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/theme/electron-main/themeMainService", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/buffer", "vs/platform/remote/node/wsl", "vs/platform/profiling/electron-main/windowProfiling"], function (require, exports, child_process_1, electron_1, os_1, util_1, decorators_1, event_1, lifecycle_1, network_1, path_1, platform_1, uri_1, extpath_1, id_1, pfs_1, ports_1, nls_1, dialogMainService_1, environmentMainService_1, instantiation_1, lifecycleMainService_1, log_1, productService_1, themeMainService_1, windows_1, workspace_1, workspacesManagementMainService_1, buffer_1, wsl_1, windowProfiling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeHostMainService = exports.INativeHostMainService = void 0;
    exports.INativeHostMainService = (0, instantiation_1.createDecorator)('nativeHostMainService');
    let NativeHostMainService = class NativeHostMainService extends lifecycle_1.Disposable {
        constructor(windowsMainService, dialogMainService, lifecycleMainService, environmentMainService, logService, productService, themeMainService, workspacesManagementMainService) {
            super();
            this.windowsMainService = windowsMainService;
            this.dialogMainService = dialogMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.environmentMainService = environmentMainService;
            this.logService = logService;
            this.productService = productService;
            this.themeMainService = themeMainService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            //#endregion
            //#region Events
            this.onDidOpenWindow = event_1.Event.map(this.windowsMainService.onDidOpenWindow, window => window.id);
            this.onDidTriggerSystemContextMenu = event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidTriggerSystemContextMenu, ({ window, x, y }) => { return { windowId: window.id, x, y }; }), ({ windowId }) => !!this.windowsMainService.getWindowById(windowId));
            this.onDidMaximizeWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-maximize', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidUnmaximizeWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-unmaximize', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidBlurWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidFocusWindow = event_1.Event.any(event_1.Event.map(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidChangeWindowsCount, () => this.windowsMainService.getLastActiveWindow()), window => !!window), window => window.id), event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)));
            this.onDidResumeOS = event_1.Event.fromNodeEventEmitter(electron_1.powerMonitor, 'resume');
            this.onDidChangeColorScheme = this.themeMainService.onDidChangeColorScheme;
            this._onDidChangePassword = this._register(new event_1.Emitter());
            this.onDidChangePassword = this._onDidChangePassword.event;
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
            const windows = this.windowsMainService.getWindows();
            return windows.map(window => ({
                id: window.id,
                workspace: window.openedWorkspace ?? (0, workspace_1.toWorkspaceIdentifier)(window.backupPath, window.isExtensionDevelopmentHost),
                title: window.win?.getTitle() ?? '',
                filename: window.getRepresentedFilename(),
                dirty: window.isDocumentEdited()
            }));
        }
        async getWindowCount(windowId) {
            return this.windowsMainService.getWindowCount();
        }
        async getActiveWindowId(windowId) {
            const activeWindow = electron_1.BrowserWindow.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
            if (activeWindow) {
                return activeWindow.id;
            }
            return undefined;
        }
        openWindow(windowId, arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.doOpenWindow(windowId, arg1, arg2);
            }
            return this.doOpenEmptyWindow(windowId, arg1);
        }
        async doOpenWindow(windowId, toOpen, options = Object.create(null)) {
            if (toOpen.length > 0) {
                await this.windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    contextWindowId: windowId,
                    urisToOpen: toOpen,
                    cli: this.environmentMainService.args,
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
        async doOpenEmptyWindow(windowId, options) {
            await this.windowsMainService.openEmptyWindow({
                context: 5 /* OpenContext.API */,
                contextWindowId: windowId
            }, options);
        }
        async toggleFullScreen(windowId) {
            const window = this.windowById(windowId);
            window?.toggleFullScreen();
        }
        async handleTitleDoubleClick(windowId) {
            const window = this.windowById(windowId);
            window?.handleTitleDoubleClick();
        }
        async isMaximized(windowId) {
            const window = this.windowById(windowId);
            if (window?.win) {
                return window.win.isMaximized();
            }
            return false;
        }
        async maximizeWindow(windowId) {
            const window = this.windowById(windowId);
            if (window?.win) {
                window.win.maximize();
            }
        }
        async unmaximizeWindow(windowId) {
            const window = this.windowById(windowId);
            if (window?.win) {
                window.win.unmaximize();
            }
        }
        async minimizeWindow(windowId) {
            const window = this.windowById(windowId);
            if (window?.win) {
                window.win.minimize();
            }
        }
        async updateWindowControls(windowId, options) {
            const window = this.windowById(windowId);
            if (window) {
                window.updateWindowControls(options);
            }
        }
        async focusWindow(windowId, options) {
            if (options && typeof options.windowId === 'number') {
                windowId = options.windowId;
            }
            const window = this.windowById(windowId);
            window?.focus({ force: options?.force ?? false });
        }
        async setMinimumSize(windowId, width, height) {
            const window = this.windowById(windowId);
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
            this.themeMainService.saveWindowSplash(windowId, splash);
        }
        //#endregion
        //#region macOS Shell Command
        async installShellCommand(windowId) {
            const { source, target } = await this.getShellCommandLink();
            // Only install unless already existing
            try {
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(source);
                if (symbolicLink && !symbolicLink.dangling) {
                    const linkTargetRealPath = await (0, extpath_1.realpath)(source);
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
                    message: (0, nls_1.localize)('warnEscalation', "{0} will now prompt with 'osascript' for Administrator privileges to install the shell command.", this.productService.nameShort),
                    buttons: [
                        (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                        (0, nls_1.localize)('cancel', "Cancel")
                    ]
                });
                if (response === 0 /* OK */) {
                    try {
                        const command = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'${target}\' \'${source}\'\\" with administrator privileges"`;
                        await (0, util_1.promisify)(child_process_1.exec)(command);
                    }
                    catch (error) {
                        throw new Error((0, nls_1.localize)('cantCreateBinFolder', "Unable to install the shell command '{0}'.", source));
                    }
                }
            }
        }
        async uninstallShellCommand(windowId) {
            const { source } = await this.getShellCommandLink();
            try {
                await pfs_1.Promises.unlink(source);
            }
            catch (error) {
                switch (error.code) {
                    case 'EACCES': {
                        const { response } = await this.showMessageBox(windowId, {
                            type: 'info',
                            message: (0, nls_1.localize)('warnEscalationUninstall', "{0} will now prompt with 'osascript' for Administrator privileges to uninstall the shell command.", this.productService.nameShort),
                            buttons: [
                                (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                                (0, nls_1.localize)('cancel', "Cancel")
                            ]
                        });
                        if (response === 0 /* OK */) {
                            try {
                                const command = `osascript -e "do shell script \\"rm \'${source}\'\\" with administrator privileges"`;
                                await (0, util_1.promisify)(child_process_1.exec)(command);
                            }
                            catch (error) {
                                throw new Error((0, nls_1.localize)('cantUninstall', "Unable to uninstall the shell command '{0}'.", source));
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
        async getShellCommandLink() {
            const target = (0, path_1.resolve)(this.environmentMainService.appRoot, 'bin', 'code');
            const source = `/usr/local/bin/${this.productService.applicationName}`;
            // Ensure source exists
            const sourceExists = await pfs_1.Promises.exists(target);
            if (!sourceExists) {
                throw new Error((0, nls_1.localize)('sourceMissing', "Unable to find shell script in '{0}'", target));
            }
            return { source, target };
        }
        //#region Dialog
        async showMessageBox(windowId, options) {
            return this.dialogMainService.showMessageBox(options, this.toBrowserWindow(windowId));
        }
        async showSaveDialog(windowId, options) {
            return this.dialogMainService.showSaveDialog(options, this.toBrowserWindow(windowId));
        }
        async showOpenDialog(windowId, options) {
            return this.dialogMainService.showOpenDialog(options, this.toBrowserWindow(windowId));
        }
        toBrowserWindow(windowId) {
            const window = this.windowById(windowId);
            if (window?.win) {
                return window.win;
            }
            return undefined;
        }
        async pickFileFolderAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFileFolder(options);
            if (paths) {
                await this.doOpenPicked(await Promise.all(paths.map(async (path) => (await pfs_1.SymlinkSupport.existsDirectory(path)) ? { folderUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFolderAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFolder(options);
            if (paths) {
                await this.doOpenPicked(paths.map(path => ({ folderUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFileAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFile(options);
            if (paths) {
                await this.doOpenPicked(paths.map(path => ({ fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickWorkspaceAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickWorkspace(options);
            if (paths) {
                await this.doOpenPicked(paths.map(path => ({ workspaceUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async doOpenPicked(openable, options, windowId) {
            await this.windowsMainService.open({
                context: 3 /* OpenContext.DIALOG */,
                contextWindowId: windowId,
                cli: this.environmentMainService.args,
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
            const window = this.windowById(windowId);
            window?.setRepresentedFilename(path);
        }
        async setDocumentEdited(windowId, edited) {
            const window = this.windowById(windowId);
            window?.setDocumentEdited(edited);
        }
        async openExternal(windowId, url) {
            this.environmentMainService.unsetSnapExportedVariables();
            electron_1.shell.openExternal(url);
            this.environmentMainService.restoreSnapExportedVariables();
            return true;
        }
        moveItemToTrash(windowId, fullPath) {
            return electron_1.shell.trashItem(fullPath);
        }
        async isAdmin() {
            let isAdmin;
            if (platform_1.isWindows) {
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
                const sudoCommand = [`"${this.cliPath}"`];
                if (options?.unlock) {
                    sudoCommand.push('--file-chmod');
                }
                sudoCommand.push('--file-write', `"${source.fsPath}"`, `"${target.fsPath}"`);
                const promptOptions = {
                    name: this.productService.nameLong.replace('-', ''),
                    icns: (platform_1.isMacintosh && this.environmentMainService.isBuilt) ? (0, path_1.join)((0, path_1.dirname)(this.environmentMainService.appRoot), `${this.productService.nameShort}.icns`) : undefined
                };
                sudoPrompt.exec(sudoCommand.join(' '), promptOptions, (error, stdout, stderr) => {
                    if (stdout) {
                        this.logService.trace(`[sudo-prompt] received stdout: ${stdout}`);
                    }
                    if (stderr) {
                        this.logService.trace(`[sudo-prompt] received stderr: ${stderr}`);
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
            if (platform_1.isLinux || platform_1.isWindows) {
                return false;
            }
            return electron_1.app.runningUnderARM64Translation;
        }
        get cliPath() {
            // Windows
            if (platform_1.isWindows) {
                if (this.environmentMainService.isBuilt) {
                    return (0, path_1.join)((0, path_1.dirname)(process.execPath), 'bin', `${this.productService.applicationName}.cmd`);
                }
                return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.bat');
            }
            // Linux
            if (platform_1.isLinux) {
                if (this.environmentMainService.isBuilt) {
                    return (0, path_1.join)((0, path_1.dirname)(process.execPath), 'bin', `${this.productService.applicationName}`);
                }
                return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
            }
            // macOS
            if (this.environmentMainService.isBuilt) {
                return (0, path_1.join)(this.environmentMainService.appRoot, 'bin', 'code');
            }
            return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
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
            return id_1.virtualMachineHint.value();
        }
        async getOSColorScheme() {
            return this.themeMainService.getColorScheme();
        }
        // WSL
        async hasWSLFeatureInstalled() {
            return platform_1.isWindows && (0, wsl_1.hasWSLFeatureInstalled)();
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
            return buffer_1.VSBuffer.wrap(electron_1.clipboard.readBuffer(format));
        }
        async hasClipboard(windowId, format, type) {
            return electron_1.clipboard.has(format, type);
        }
        //#endregion
        //#region macOS Touchbar
        async newWindowTab() {
            await this.windowsMainService.open({
                context: 5 /* OpenContext.API */,
                cli: this.environmentMainService.args,
                forceNewTabbedWindow: true,
                forceEmpty: true,
                remoteAuthority: this.environmentMainService.args.remote || undefined
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
            const window = this.windowById(windowId);
            window?.updateTouchBar(items);
        }
        //#endregion
        //#region Lifecycle
        async notifyReady(windowId) {
            const window = this.windowById(windowId);
            window?.setReady();
        }
        async relaunch(windowId, options) {
            return this.lifecycleMainService.relaunch(options);
        }
        async reload(windowId, options) {
            const window = this.windowById(windowId);
            if (window) {
                // Special case: support `transient` workspaces by preventing
                // the reload and rather go back to an empty window. Transient
                // workspaces should never restore, even when the user wants
                // to reload.
                // For: https://github.com/microsoft/vscode/issues/119695
                if ((0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace)) {
                    const configPath = window.openedWorkspace.configPath;
                    if (configPath.scheme === network_1.Schemas.file) {
                        const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(configPath);
                        if (workspace?.transient) {
                            return this.openWindow(window.id, { forceReuseWindow: true });
                        }
                    }
                }
                // Proceed normally to reload the window
                return this.lifecycleMainService.reload(window, options?.disableExtensions !== undefined ? { _: [], 'disable-extensions': options.disableExtensions } : undefined);
            }
        }
        async closeWindow(windowId) {
            this.closeWindowById(windowId, windowId);
        }
        async closeWindowById(currentWindowId, targetWindowId) {
            const window = this.windowById(targetWindowId);
            if (window?.win) {
                return window.win.close();
            }
        }
        async quit(windowId) {
            // If the user selected to exit from an extension development host window, do not quit, but just
            // close the window unless this is the last window that is opened.
            const window = this.windowsMainService.getLastActiveWindow();
            if (window?.isExtensionDevelopmentHost && this.windowsMainService.getWindowCount() > 1 && window.win) {
                window.win.close();
            }
            // Otherwise: normal quit
            else {
                this.lifecycleMainService.quit();
            }
        }
        async exit(windowId, code) {
            await this.lifecycleMainService.kill(code);
        }
        //#endregion
        //#region Connectivity
        async resolveProxy(windowId, url) {
            const window = this.windowById(windowId);
            const session = window?.win?.webContents?.session;
            return session?.resolveProxy(url);
        }
        findFreePort(windowId, startPort, giveUpAfter, timeout, stride = 1) {
            return (0, ports_1.findFreePort)(startPort, giveUpAfter, timeout, stride);
        }
        //#endregion
        //#region Development
        async openDevTools(windowId, options) {
            const window = this.windowById(windowId);
            if (window?.win) {
                window.win.webContents.openDevTools(options);
            }
        }
        async toggleDevTools(windowId) {
            const window = this.windowById(windowId);
            if (window?.win) {
                const contents = window.win.webContents;
                contents.toggleDevTools();
            }
        }
        async sendInputEvent(windowId, event) {
            const window = this.windowById(windowId);
            if (window?.win && (event.type === 'mouseDown' || event.type === 'mouseUp')) {
                window.win.webContents.sendInputEvent(event);
            }
        }
        //#endregion
        // #region Performance
        async profileRenderer(windowId, session, duration) {
            const win = this.windowById(windowId);
            if (!win || !win.win) {
                throw new Error();
            }
            const profiler = new windowProfiling_1.WindowProfiler(win.win, session, this.logService);
            const result = await profiler.inspect(duration);
            return result;
        }
        // #endregion
        //#region Registry (windows)
        async windowsGetStringRegKey(windowId, hive, path, name) {
            if (!platform_1.isWindows) {
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
        windowById(windowId) {
            if (typeof windowId !== 'number') {
                return undefined;
            }
            return this.windowsMainService.getWindowById(windowId);
        }
    };
    exports.NativeHostMainService = NativeHostMainService;
    __decorate([
        decorators_1.memoize
    ], NativeHostMainService.prototype, "cliPath", null);
    exports.NativeHostMainService = NativeHostMainService = __decorate([
        __param(0, windows_1.IWindowsMainService),
        __param(1, dialogMainService_1.IDialogMainService),
        __param(2, lifecycleMainService_1.ILifecycleMainService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, log_1.ILogService),
        __param(5, productService_1.IProductService),
        __param(6, themeMainService_1.IThemeMainService),
        __param(7, workspacesManagementMainService_1.IWorkspacesManagementMainService)
    ], NativeHostMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlSG9zdE1haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbmF0aXZlL2VsZWN0cm9uLW1haW4vbmF0aXZlSG9zdE1haW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJDbkYsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLCtCQUFlLEVBQXlCLHVCQUF1QixDQUFDLENBQUM7SUFFaEcsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQUlwRCxZQUNzQixrQkFBd0QsRUFDekQsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUMxRCxzQkFBZ0UsRUFDNUUsVUFBd0MsRUFDcEMsY0FBZ0QsRUFDOUMsZ0JBQW9ELEVBQ3JDLCtCQUFrRjtZQUVwSCxLQUFLLEVBQUUsQ0FBQztZQVQ4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN6QywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzNELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDcEIsb0NBQStCLEdBQS9CLCtCQUErQixDQUFrQztZQVVySCxZQUFZO1lBR1osZ0JBQWdCO1lBRVAsb0JBQWUsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUYsa0NBQTZCLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxr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