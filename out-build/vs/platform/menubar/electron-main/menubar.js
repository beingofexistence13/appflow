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
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/platform/menubar/electron-main/menubar", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/common/menubar", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/state/node/state", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows", "vs/platform/workspaces/electron-main/workspacesHistoryMainService"], function (require, exports, electron_1, async_1, cancellation_1, labels_1, platform_1, uri_1, nls, configuration_1, environmentMainService_1, lifecycleMainService_1, log_1, menubar_1, nativeHostMainService_1, productService_1, state_1, telemetry_1, update_1, window_1, windows_1, workspacesHistoryMainService_1) {
    "use strict";
    var $r6b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r6b = void 0;
    const telemetryFrom = 'menu';
    let $r6b = class $r6b {
        static { $r6b_1 = this; }
        static { this.a = 'lastKnownMenubarData'; }
        constructor(n, o, p, q, r, s, t, u, v, w, x) {
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.m = Object.create(null);
            this.g = new async_1.$Sg(() => this.E(), 0);
            this.h = new async_1.$Sg(() => { this.j = []; }, 10000);
            this.k = Object.create(null);
            this.l = Object.create(null);
            if (platform_1.$j || (0, window_1.$UD)(this.o) === 'native') {
                this.y();
            }
            this.z();
            this.d = false;
            this.f = false;
            this.j = [];
            this.H();
            this.A();
        }
        y() {
            const menubarData = this.t.getItem($r6b_1.a);
            if (menubarData) {
                if (menubarData.menus) {
                    this.k = menubarData.menus;
                }
                if (menubarData.keybindings) {
                    this.l = menubarData.keybindings;
                }
            }
        }
        z() {
            // File Menu Items
            this.m['workbench.action.files.newUntitledFile'] = (menuItem, win, event) => this.p.openEmptyWindow({ context: 2 /* OpenContext.MENU */, contextWindowId: win?.id });
            this.m['workbench.action.newWindow'] = (menuItem, win, event) => this.p.openEmptyWindow({ context: 2 /* OpenContext.MENU */, contextWindowId: win?.id });
            this.m['workbench.action.files.openFileFolder'] = (menuItem, win, event) => this.w.pickFileFolderAndOpen(undefined, { forceNewWindow: this.P(event), telemetryExtraData: { from: telemetryFrom } });
            this.m['workbench.action.files.openFolder'] = (menuItem, win, event) => this.w.pickFolderAndOpen(undefined, { forceNewWindow: this.P(event), telemetryExtraData: { from: telemetryFrom } });
            this.m['workbench.action.openWorkspace'] = (menuItem, win, event) => this.w.pickWorkspaceAndOpen(undefined, { forceNewWindow: this.P(event), telemetryExtraData: { from: telemetryFrom } });
            // Recent Menu Items
            this.m['workbench.action.clearRecentFiles'] = () => this.s.clearRecentlyOpened();
            // Help Menu Items
            const youTubeUrl = this.x.youTubeUrl;
            if (youTubeUrl) {
                this.m['workbench.action.openYouTubeUrl'] = () => this.Z(youTubeUrl, 'openYouTubeUrl');
            }
            const requestFeatureUrl = this.x.requestFeatureUrl;
            if (requestFeatureUrl) {
                this.m['workbench.action.openRequestFeatureUrl'] = () => this.Z(requestFeatureUrl, 'openUserVoiceUrl');
            }
            const reportIssueUrl = this.x.reportIssueUrl;
            if (reportIssueUrl) {
                this.m['workbench.action.openIssueReporter'] = () => this.Z(reportIssueUrl, 'openReportIssues');
            }
            const licenseUrl = this.x.licenseUrl;
            if (licenseUrl) {
                this.m['workbench.action.openLicenseUrl'] = () => {
                    if (platform_1.$v) {
                        const queryArgChar = licenseUrl.indexOf('?') > 0 ? '&' : '?';
                        this.Z(`${licenseUrl}${queryArgChar}lang=${platform_1.$v}`, 'openLicenseUrl');
                    }
                    else {
                        this.Z(licenseUrl, 'openLicenseUrl');
                    }
                };
            }
            const privacyStatementUrl = this.x.privacyStatementUrl;
            if (privacyStatementUrl && licenseUrl) {
                this.m['workbench.action.openPrivacyStatementUrl'] = () => {
                    this.Z(privacyStatementUrl, 'openPrivacyStatement');
                };
            }
        }
        A() {
            // Keep flag when app quits
            this.u.onWillShutdown(() => this.b = true);
            // Listen to some events from window service to update menu
            this.p.onDidChangeWindowsCount(e => this.F(e));
            this.w.onDidBlurWindow(() => this.G());
            this.w.onDidFocusWindow(() => this.G());
        }
        get B() {
            const enableMenuBarMnemonics = this.o.getValue('window.enableMenuBarMnemonics');
            if (typeof enableMenuBarMnemonics !== 'boolean') {
                return true;
            }
            return enableMenuBarMnemonics;
        }
        get C() {
            if (!platform_1.$j) {
                return false;
            }
            const enableNativeTabs = this.o.getValue('window.nativeTabs');
            if (typeof enableNativeTabs !== 'boolean') {
                return false;
            }
            return enableNativeTabs;
        }
        updateMenu(menubarData, windowId) {
            this.k = menubarData.menus;
            this.l = menubarData.keybindings;
            // Save off new menu and keybindings
            this.t.setItem($r6b_1.a, menubarData);
            this.D();
        }
        D() {
            this.g.schedule(); // buffer multiple attempts to update the menu
        }
        E() {
            // Due to limitations in Electron, it is not possible to update menu items dynamically. The suggested
            // workaround from Electron is to set the application menu again.
            // See also https://github.com/electron/electron/issues/846
            //
            // Run delayed to prevent updating menu while it is open
            if (!this.b) {
                setTimeout(() => {
                    if (!this.b) {
                        this.H();
                    }
                }, 10 /* delay this because there is an issue with updating a menu when it is open */);
            }
        }
        F(e) {
            if (!platform_1.$j) {
                return;
            }
            // Update menu if window count goes from N > 0 or 0 > N to update menu item enablement
            if ((e.oldCount === 0 && e.newCount > 0) || (e.oldCount > 0 && e.newCount === 0)) {
                this.d = e.newCount === 0;
                this.D();
            }
        }
        G() {
            if (!platform_1.$j) {
                return;
            }
            this.f = !electron_1.BrowserWindow.getFocusedWindow();
            this.D();
        }
        H() {
            // Store old menu in our array to avoid GC to collect the menu and crash. See #55347
            // TODO@sbatten Remove this when fixed upstream by Electron
            const oldMenu = electron_1.Menu.getApplicationMenu();
            if (oldMenu) {
                this.j.push(oldMenu);
            }
            // If we don't have a menu yet, set it to null to avoid the electron menu.
            // This should only happen on the first launch ever
            if (Object.keys(this.k).length === 0) {
                electron_1.Menu.setApplicationMenu(platform_1.$j ? new electron_1.Menu() : null);
                return;
            }
            // Menus
            const menubar = new electron_1.Menu();
            // Mac: Application
            let macApplicationMenuItem;
            if (platform_1.$j) {
                const applicationMenu = new electron_1.Menu();
                macApplicationMenuItem = new electron_1.MenuItem({ label: this.x.nameShort, submenu: applicationMenu });
                this.I(applicationMenu);
                menubar.append(macApplicationMenuItem);
            }
            // Mac: Dock
            if (platform_1.$j && !this.c) {
                this.c = true;
                const dockMenu = new electron_1.Menu();
                dockMenu.append(new electron_1.MenuItem({ label: this.ab(nls.localize(0, null)), click: () => this.p.openEmptyWindow({ context: 1 /* OpenContext.DOCK */ }) }));
                electron_1.app.dock.setMenu(dockMenu);
            }
            // File
            if (this.K('File')) {
                const fileMenu = new electron_1.Menu();
                const fileMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(1, null)), submenu: fileMenu });
                this.M(fileMenu, 'File');
                menubar.append(fileMenuItem);
            }
            // Edit
            if (this.K('Edit')) {
                const editMenu = new electron_1.Menu();
                const editMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(2, null)), submenu: editMenu });
                this.M(editMenu, 'Edit');
                menubar.append(editMenuItem);
            }
            // Selection
            if (this.K('Selection')) {
                const selectionMenu = new electron_1.Menu();
                const selectionMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(3, null)), submenu: selectionMenu });
                this.M(selectionMenu, 'Selection');
                menubar.append(selectionMenuItem);
            }
            // View
            if (this.K('View')) {
                const viewMenu = new electron_1.Menu();
                const viewMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(4, null)), submenu: viewMenu });
                this.M(viewMenu, 'View');
                menubar.append(viewMenuItem);
            }
            // Go
            if (this.K('Go')) {
                const gotoMenu = new electron_1.Menu();
                const gotoMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(5, null)), submenu: gotoMenu });
                this.M(gotoMenu, 'Go');
                menubar.append(gotoMenuItem);
            }
            // Debug
            if (this.K('Run')) {
                const debugMenu = new electron_1.Menu();
                const debugMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(6, null)), submenu: debugMenu });
                this.M(debugMenu, 'Run');
                menubar.append(debugMenuItem);
            }
            // Terminal
            if (this.K('Terminal')) {
                const terminalMenu = new electron_1.Menu();
                const terminalMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(7, null)), submenu: terminalMenu });
                this.M(terminalMenu, 'Terminal');
                menubar.append(terminalMenuItem);
            }
            // Mac: Window
            let macWindowMenuItem;
            if (this.K('Window')) {
                const windowMenu = new electron_1.Menu();
                macWindowMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(8, null)), submenu: windowMenu, role: 'window' });
                this.S(windowMenu);
            }
            if (macWindowMenuItem) {
                menubar.append(macWindowMenuItem);
            }
            // Help
            if (this.K('Help')) {
                const helpMenu = new electron_1.Menu();
                const helpMenuItem = new electron_1.MenuItem({ label: this.ab(nls.localize(9, null)), submenu: helpMenu, role: 'help' });
                this.M(helpMenu, 'Help');
                menubar.append(helpMenuItem);
            }
            if (menubar.items && menubar.items.length > 0) {
                electron_1.Menu.setApplicationMenu(menubar);
            }
            else {
                electron_1.Menu.setApplicationMenu(null);
            }
            // Dispose of older menus after some time
            this.h.schedule();
        }
        I(macApplicationMenu) {
            const about = this.U(nls.localize(10, null, this.x.nameLong), 'workbench.action.showAboutDialog');
            const checkForUpdates = this.T();
            let preferences;
            if (this.K('Preferences')) {
                const preferencesMenu = new electron_1.Menu();
                this.M(preferencesMenu, 'Preferences');
                preferences = new electron_1.MenuItem({ label: this.ab(nls.localize(11, null)), submenu: preferencesMenu });
            }
            const servicesMenu = new electron_1.Menu();
            const services = new electron_1.MenuItem({ label: nls.localize(12, null), role: 'services', submenu: servicesMenu });
            const hide = new electron_1.MenuItem({ label: nls.localize(13, null, this.x.nameLong), role: 'hide', accelerator: 'Command+H' });
            const hideOthers = new electron_1.MenuItem({ label: nls.localize(14, null), role: 'hideOthers', accelerator: 'Command+Alt+H' });
            const showAll = new electron_1.MenuItem({ label: nls.localize(15, null), role: 'unhide' });
            const quit = new electron_1.MenuItem(this.Y('workbench.action.quit', {
                label: nls.localize(16, null, this.x.nameLong), click: async (item, window, event) => {
                    const lastActiveWindow = this.p.getLastActiveWindow();
                    if (this.p.getWindowCount() === 0 || // allow to quit when no more windows are open
                        !!electron_1.BrowserWindow.getFocusedWindow() || // allow to quit when window has focus (fix for https://github.com/microsoft/vscode/issues/39191)
                        lastActiveWindow?.isMinimized() // allow to quit when window has no focus but is minimized (https://github.com/microsoft/vscode/issues/63000)
                    ) {
                        const confirmed = await this.J(event);
                        if (confirmed) {
                            this.w.quit(undefined);
                        }
                    }
                }
            }));
            const actions = [about];
            actions.push(...checkForUpdates);
            if (preferences) {
                actions.push(...[
                    __separator__(),
                    preferences
                ]);
            }
            actions.push(...[
                __separator__(),
                services,
                __separator__(),
                hide,
                hideOthers,
                showAll,
                __separator__(),
                quit
            ]);
            actions.forEach(i => macApplicationMenu.append(i));
        }
        async J(event) {
            if (this.p.getWindowCount() === 0) {
                return true; // never confirm when no windows are opened
            }
            const confirmBeforeClose = this.o.getValue('window.confirmBeforeClose');
            if (confirmBeforeClose === 'always' || (confirmBeforeClose === 'keyboardOnly' && this.Q(event))) {
                const { response } = await this.w.showMessageBox(this.p.getFocusedWindow()?.id, {
                    type: 'question',
                    buttons: [
                        nls.localize(17, null),
                        nls.localize(18, null)
                    ],
                    message: nls.localize(19, null)
                });
                return response === 0;
            }
            return true;
        }
        K(menuId) {
            // We need to draw an empty menu to override the electron default
            if (!platform_1.$j && (0, window_1.$UD)(this.o) === 'custom') {
                return false;
            }
            switch (menuId) {
                case 'File':
                case 'Help':
                    if (platform_1.$j) {
                        return (this.p.getWindowCount() === 0 && this.d) || (this.p.getWindowCount() > 0 && this.f) || (!!this.k && !!this.k[menuId]);
                    }
                case 'Window':
                    if (platform_1.$j) {
                        return (this.p.getWindowCount() === 0 && this.d) || (this.p.getWindowCount() > 0 && this.f) || !!this.k;
                    }
                default:
                    return this.p.getWindowCount() > 0 && (!!this.k && !!this.k[menuId]);
            }
        }
        L(menu, items) {
            items.forEach((item) => {
                if ((0, menubar_1.$m6b)(item)) {
                    menu.append(__separator__());
                }
                else if ((0, menubar_1.$l6b)(item)) {
                    const submenu = new electron_1.Menu();
                    const submenuItem = new electron_1.MenuItem({ label: this.ab(item.label), submenu });
                    this.L(submenu, item.submenu.items);
                    menu.append(submenuItem);
                }
                else if ((0, menubar_1.$n6b)(item)) {
                    menu.append(this.O(item));
                }
                else if ((0, menubar_1.$o6b)(item)) {
                    if (item.id === 'workbench.action.showAboutDialog') {
                        this.N(menu);
                    }
                    if (platform_1.$j) {
                        if ((this.p.getWindowCount() === 0 && this.d) ||
                            (this.p.getWindowCount() > 0 && this.f)) {
                            // In the fallback scenario, we are either disabled or using a fallback handler
                            if (this.m[item.id]) {
                                menu.append(new electron_1.MenuItem(this.Y(item.id, { label: this.ab(item.label), click: this.m[item.id] })));
                            }
                            else {
                                menu.append(this.U(item.label, item.id, false, item.checked));
                            }
                        }
                        else {
                            menu.append(this.U(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                        }
                    }
                    else {
                        menu.append(this.U(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                    }
                }
            });
        }
        M(menu, menuId) {
            if (this.k && this.k[menuId]) {
                this.L(menu, this.k[menuId].items);
            }
        }
        N(menu) {
            const updateItems = this.T();
            if (updateItems.length) {
                updateItems.forEach(i => menu.append(i));
                menu.append(__separator__());
            }
        }
        O(item) {
            const revivedUri = uri_1.URI.revive(item.uri);
            const commandId = item.id;
            const openable = (commandId === 'openRecentFile') ? { fileUri: revivedUri } :
                (commandId === 'openRecentWorkspace') ? { workspaceUri: revivedUri } : { folderUri: revivedUri };
            return new electron_1.MenuItem(this.Y(commandId, {
                label: item.label,
                click: async (menuItem, win, event) => {
                    const openInNewWindow = this.P(event);
                    const success = (await this.p.open({
                        context: 2 /* OpenContext.MENU */,
                        cli: this.q.args,
                        urisToOpen: [openable],
                        forceNewWindow: openInNewWindow,
                        gotoLineMode: false,
                        remoteAuthority: item.remoteAuthority
                    })).length > 0;
                    if (!success) {
                        await this.s.removeRecentlyOpened([revivedUri]);
                    }
                }
            }, false));
        }
        P(event) {
            return !!(event && ((!platform_1.$j && (event.ctrlKey || event.shiftKey)) || (platform_1.$j && (event.metaKey || event.altKey))));
        }
        Q(event) {
            return !!(event.triggeredByAccelerator || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
        }
        R(label, commandId, role) {
            const options = {
                label: this.ab(label),
                role,
                enabled: true
            };
            return new electron_1.MenuItem(this.X(commandId, options));
        }
        S(macWindowMenu) {
            const minimize = new electron_1.MenuItem({ label: nls.localize(20, null), role: 'minimize', accelerator: 'Command+M', enabled: this.p.getWindowCount() > 0 });
            const zoom = new electron_1.MenuItem({ label: nls.localize(21, null), role: 'zoom', enabled: this.p.getWindowCount() > 0 });
            const bringAllToFront = new electron_1.MenuItem({ label: nls.localize(22, null), role: 'front', enabled: this.p.getWindowCount() > 0 });
            const switchWindow = this.U(nls.localize(23, null), 'workbench.action.switchWindow');
            const nativeTabMenuItems = [];
            if (this.C) {
                nativeTabMenuItems.push(__separator__());
                nativeTabMenuItems.push(this.U(nls.localize(24, null), 'workbench.action.newWindowTab'));
                nativeTabMenuItems.push(this.R(nls.localize(25, null), 'workbench.action.showPreviousWindowTab', 'selectPreviousTab'));
                nativeTabMenuItems.push(this.R(nls.localize(26, null), 'workbench.action.showNextWindowTab', 'selectNextTab'));
                nativeTabMenuItems.push(this.R(nls.localize(27, null), 'workbench.action.moveWindowTabToNewWindow', 'moveTabToNewWindow'));
                nativeTabMenuItems.push(this.R(nls.localize(28, null), 'workbench.action.mergeAllWindowTabs', 'mergeAllWindows'));
            }
            [
                minimize,
                zoom,
                __separator__(),
                switchWindow,
                ...nativeTabMenuItems,
                __separator__(),
                bringAllToFront
            ].forEach(item => macWindowMenu.append(item));
        }
        T() {
            const state = this.n.state;
            switch (state.type) {
                case "idle" /* StateType.Idle */:
                    return [new electron_1.MenuItem({
                            label: this.ab(nls.localize(29, null)), click: () => setTimeout(() => {
                                this.$('CheckForUpdate');
                                this.n.checkForUpdates(true);
                            }, 0)
                        })];
                case "checking for updates" /* StateType.CheckingForUpdates */:
                    return [new electron_1.MenuItem({ label: nls.localize(30, null), enabled: false })];
                case "available for download" /* StateType.AvailableForDownload */:
                    return [new electron_1.MenuItem({
                            label: this.ab(nls.localize(31, null)), click: () => {
                                this.n.downloadUpdate();
                            }
                        })];
                case "downloading" /* StateType.Downloading */:
                    return [new electron_1.MenuItem({ label: nls.localize(32, null), enabled: false })];
                case "downloaded" /* StateType.Downloaded */:
                    return [new electron_1.MenuItem({
                            label: this.ab(nls.localize(33, null)), click: () => {
                                this.$('InstallUpdate');
                                this.n.applyUpdate();
                            }
                        })];
                case "updating" /* StateType.Updating */:
                    return [new electron_1.MenuItem({ label: nls.localize(34, null), enabled: false })];
                case "ready" /* StateType.Ready */:
                    return [new electron_1.MenuItem({
                            label: this.ab(nls.localize(35, null)), click: () => {
                                this.$('RestartToUpdate');
                                this.n.quitAndInstall();
                            }
                        })];
                default:
                    return [];
            }
        }
        U(arg1, arg2, arg3, arg4) {
            const label = this.ab(arg1);
            const click = (typeof arg2 === 'function') ? arg2 : (menuItem, win, event) => {
                const userSettingsLabel = menuItem ? menuItem.userSettingsLabel : null;
                let commandId = arg2;
                if (Array.isArray(arg2)) {
                    commandId = this.P(event) ? arg2[1] : arg2[0]; // support alternative action if we got multiple action Ids and the option key was pressed while invoking
                }
                if (userSettingsLabel && event.triggeredByAccelerator) {
                    this.W({ type: 'keybinding', userSettingsLabel });
                }
                else {
                    this.W({ type: 'commandId', commandId });
                }
            };
            const enabled = typeof arg3 === 'boolean' ? arg3 : this.p.getWindowCount() > 0;
            const checked = typeof arg4 === 'boolean' ? arg4 : false;
            const options = {
                label,
                click,
                enabled
            };
            if (checked) {
                options.type = 'checkbox';
                options.checked = checked;
            }
            let commandId;
            if (typeof arg2 === 'string') {
                commandId = arg2;
            }
            else if (Array.isArray(arg2)) {
                commandId = arg2[0];
            }
            if (platform_1.$j) {
                // Add role for special case menu items
                if (commandId === 'editor.action.clipboardCutAction') {
                    options.role = 'cut';
                }
                else if (commandId === 'editor.action.clipboardCopyAction') {
                    options.role = 'copy';
                }
                else if (commandId === 'editor.action.clipboardPasteAction') {
                    options.role = 'paste';
                }
                // Add context aware click handlers for special case menu items
                if (commandId === 'undo') {
                    options.click = this.V(click, {
                        inDevTools: devTools => devTools.undo(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('undo:')
                    });
                }
                else if (commandId === 'redo') {
                    options.click = this.V(click, {
                        inDevTools: devTools => devTools.redo(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('redo:')
                    });
                }
                else if (commandId === 'editor.action.selectAll') {
                    options.click = this.V(click, {
                        inDevTools: devTools => devTools.selectAll(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('selectAll:')
                    });
                }
            }
            return new electron_1.MenuItem(this.X(commandId, options));
        }
        V(click, contextSpecificHandlers) {
            return (menuItem, win, event) => {
                // No Active Window
                const activeWindow = electron_1.BrowserWindow.getFocusedWindow();
                if (!activeWindow) {
                    return contextSpecificHandlers.inNoWindow();
                }
                // DevTools focused
                if (activeWindow.webContents.isDevToolsFocused() &&
                    activeWindow.webContents.devToolsWebContents) {
                    return contextSpecificHandlers.inDevTools(activeWindow.webContents.devToolsWebContents);
                }
                // Finally execute command in Window
                click(menuItem, win || activeWindow, event);
            };
        }
        W(invocation) {
            // We make sure to not run actions when the window has no focus, this helps
            // for https://github.com/microsoft/vscode/issues/25907 and specifically for
            // https://github.com/microsoft/vscode/issues/11928
            // Still allow to run when the last active window is minimized though for
            // https://github.com/microsoft/vscode/issues/63000
            let activeBrowserWindow = electron_1.BrowserWindow.getFocusedWindow();
            if (!activeBrowserWindow) {
                const lastActiveWindow = this.p.getLastActiveWindow();
                if (lastActiveWindow?.isMinimized()) {
                    activeBrowserWindow = lastActiveWindow.win;
                }
            }
            const activeWindow = activeBrowserWindow ? this.p.getWindowById(activeBrowserWindow.id) : undefined;
            if (activeWindow) {
                this.v.trace('menubar#runActionInRenderer', invocation);
                if (platform_1.$j && !this.q.isBuilt && !activeWindow.isReady) {
                    if ((invocation.type === 'commandId' && invocation.commandId === 'workbench.action.toggleDevTools') || (invocation.type !== 'commandId' && invocation.userSettingsLabel === 'alt+cmd+i')) {
                        // prevent this action from running twice on macOS (https://github.com/microsoft/vscode/issues/62719)
                        // we already register a keybinding in bootstrap-window.js for opening developer tools in case something
                        // goes wrong and that keybinding is only removed when the application has loaded (= window ready).
                        return;
                    }
                }
                if (invocation.type === 'commandId') {
                    const runActionPayload = { id: invocation.commandId, from: 'menu' };
                    activeWindow.sendWhenReady('vscode:runAction', cancellation_1.CancellationToken.None, runActionPayload);
                }
                else {
                    const runKeybindingPayload = { userSettingsLabel: invocation.userSettingsLabel };
                    activeWindow.sendWhenReady('vscode:runKeybinding', cancellation_1.CancellationToken.None, runKeybindingPayload);
                }
            }
            else {
                this.v.trace('menubar#runActionInRenderer: no active window found', invocation);
            }
        }
        X(commandId, options) {
            const binding = typeof commandId === 'string' ? this.l[commandId] : undefined;
            // Apply binding if there is one
            if (binding?.label) {
                // if the binding is native, we can just apply it
                if (binding.isNative !== false) {
                    options.accelerator = binding.label;
                    options.userSettingsLabel = binding.userSettingsLabel;
                }
                // the keybinding is not native so we cannot show it as part of the accelerator of
                // the menu item. we fallback to a different strategy so that we always display it
                else if (typeof options.label === 'string') {
                    const bindingIndex = options.label.indexOf('[');
                    if (bindingIndex >= 0) {
                        options.label = `${options.label.substr(0, bindingIndex)} [${binding.label}]`;
                    }
                    else {
                        options.label = `${options.label} [${binding.label}]`;
                    }
                }
            }
            // Unset bindings if there is none
            else {
                options.accelerator = undefined;
            }
            return options;
        }
        Y(commandId, options, setAccelerator = !options.accelerator) {
            if (setAccelerator) {
                options = this.X(commandId, options);
            }
            const originalClick = options.click;
            options.click = (item, window, event) => {
                this.$(commandId);
                originalClick?.(item, window, event);
            };
            return options;
        }
        Z(url, id) {
            this.w.openExternal(undefined, url);
            this.$(id);
        }
        $(id) {
            this.r.publicLog2('workbenchActionExecuted', { id, from: telemetryFrom });
        }
        ab(label) {
            return (0, labels_1.$kA)(label, !this.B);
        }
    };
    exports.$r6b = $r6b;
    exports.$r6b = $r6b = $r6b_1 = __decorate([
        __param(0, update_1.$UT),
        __param(1, configuration_1.$8h),
        __param(2, windows_1.$B5b),
        __param(3, environmentMainService_1.$n5b),
        __param(4, telemetry_1.$9k),
        __param(5, workspacesHistoryMainService_1.$p6b),
        __param(6, state_1.$eN),
        __param(7, lifecycleMainService_1.$p5b),
        __param(8, log_1.$5i),
        __param(9, nativeHostMainService_1.$c6b),
        __param(10, productService_1.$kj)
    ], $r6b);
    function __separator__() {
        return new electron_1.MenuItem({ type: 'separator' });
    }
});
//# sourceMappingURL=menubar.js.map