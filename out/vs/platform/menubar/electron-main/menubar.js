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
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/common/menubar", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/state/node/state", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows", "vs/platform/workspaces/electron-main/workspacesHistoryMainService"], function (require, exports, electron_1, async_1, cancellation_1, labels_1, platform_1, uri_1, nls, configuration_1, environmentMainService_1, lifecycleMainService_1, log_1, menubar_1, nativeHostMainService_1, productService_1, state_1, telemetry_1, update_1, window_1, windows_1, workspacesHistoryMainService_1) {
    "use strict";
    var Menubar_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Menubar = void 0;
    const telemetryFrom = 'menu';
    let Menubar = class Menubar {
        static { Menubar_1 = this; }
        static { this.lastKnownMenubarStorageKey = 'lastKnownMenubarData'; }
        constructor(updateService, configurationService, windowsMainService, environmentMainService, telemetryService, workspacesHistoryMainService, stateService, lifecycleMainService, logService, nativeHostMainService, productService) {
            this.updateService = updateService;
            this.configurationService = configurationService;
            this.windowsMainService = windowsMainService;
            this.environmentMainService = environmentMainService;
            this.telemetryService = telemetryService;
            this.workspacesHistoryMainService = workspacesHistoryMainService;
            this.stateService = stateService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.nativeHostMainService = nativeHostMainService;
            this.productService = productService;
            this.fallbackMenuHandlers = Object.create(null);
            this.menuUpdater = new async_1.RunOnceScheduler(() => this.doUpdateMenu(), 0);
            this.menuGC = new async_1.RunOnceScheduler(() => { this.oldMenus = []; }, 10000);
            this.menubarMenus = Object.create(null);
            this.keybindings = Object.create(null);
            if (platform_1.isMacintosh || (0, window_1.getTitleBarStyle)(this.configurationService) === 'native') {
                this.restoreCachedMenubarData();
            }
            this.addFallbackHandlers();
            this.closedLastWindow = false;
            this.noActiveWindow = false;
            this.oldMenus = [];
            this.install();
            this.registerListeners();
        }
        restoreCachedMenubarData() {
            const menubarData = this.stateService.getItem(Menubar_1.lastKnownMenubarStorageKey);
            if (menubarData) {
                if (menubarData.menus) {
                    this.menubarMenus = menubarData.menus;
                }
                if (menubarData.keybindings) {
                    this.keybindings = menubarData.keybindings;
                }
            }
        }
        addFallbackHandlers() {
            // File Menu Items
            this.fallbackMenuHandlers['workbench.action.files.newUntitledFile'] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* OpenContext.MENU */, contextWindowId: win?.id });
            this.fallbackMenuHandlers['workbench.action.newWindow'] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* OpenContext.MENU */, contextWindowId: win?.id });
            this.fallbackMenuHandlers['workbench.action.files.openFileFolder'] = (menuItem, win, event) => this.nativeHostMainService.pickFileFolderAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
            this.fallbackMenuHandlers['workbench.action.files.openFolder'] = (menuItem, win, event) => this.nativeHostMainService.pickFolderAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
            this.fallbackMenuHandlers['workbench.action.openWorkspace'] = (menuItem, win, event) => this.nativeHostMainService.pickWorkspaceAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
            // Recent Menu Items
            this.fallbackMenuHandlers['workbench.action.clearRecentFiles'] = () => this.workspacesHistoryMainService.clearRecentlyOpened();
            // Help Menu Items
            const youTubeUrl = this.productService.youTubeUrl;
            if (youTubeUrl) {
                this.fallbackMenuHandlers['workbench.action.openYouTubeUrl'] = () => this.openUrl(youTubeUrl, 'openYouTubeUrl');
            }
            const requestFeatureUrl = this.productService.requestFeatureUrl;
            if (requestFeatureUrl) {
                this.fallbackMenuHandlers['workbench.action.openRequestFeatureUrl'] = () => this.openUrl(requestFeatureUrl, 'openUserVoiceUrl');
            }
            const reportIssueUrl = this.productService.reportIssueUrl;
            if (reportIssueUrl) {
                this.fallbackMenuHandlers['workbench.action.openIssueReporter'] = () => this.openUrl(reportIssueUrl, 'openReportIssues');
            }
            const licenseUrl = this.productService.licenseUrl;
            if (licenseUrl) {
                this.fallbackMenuHandlers['workbench.action.openLicenseUrl'] = () => {
                    if (platform_1.language) {
                        const queryArgChar = licenseUrl.indexOf('?') > 0 ? '&' : '?';
                        this.openUrl(`${licenseUrl}${queryArgChar}lang=${platform_1.language}`, 'openLicenseUrl');
                    }
                    else {
                        this.openUrl(licenseUrl, 'openLicenseUrl');
                    }
                };
            }
            const privacyStatementUrl = this.productService.privacyStatementUrl;
            if (privacyStatementUrl && licenseUrl) {
                this.fallbackMenuHandlers['workbench.action.openPrivacyStatementUrl'] = () => {
                    this.openUrl(privacyStatementUrl, 'openPrivacyStatement');
                };
            }
        }
        registerListeners() {
            // Keep flag when app quits
            this.lifecycleMainService.onWillShutdown(() => this.willShutdown = true);
            // Listen to some events from window service to update menu
            this.windowsMainService.onDidChangeWindowsCount(e => this.onDidChangeWindowsCount(e));
            this.nativeHostMainService.onDidBlurWindow(() => this.onDidChangeWindowFocus());
            this.nativeHostMainService.onDidFocusWindow(() => this.onDidChangeWindowFocus());
        }
        get currentEnableMenuBarMnemonics() {
            const enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
            if (typeof enableMenuBarMnemonics !== 'boolean') {
                return true;
            }
            return enableMenuBarMnemonics;
        }
        get currentEnableNativeTabs() {
            if (!platform_1.isMacintosh) {
                return false;
            }
            const enableNativeTabs = this.configurationService.getValue('window.nativeTabs');
            if (typeof enableNativeTabs !== 'boolean') {
                return false;
            }
            return enableNativeTabs;
        }
        updateMenu(menubarData, windowId) {
            this.menubarMenus = menubarData.menus;
            this.keybindings = menubarData.keybindings;
            // Save off new menu and keybindings
            this.stateService.setItem(Menubar_1.lastKnownMenubarStorageKey, menubarData);
            this.scheduleUpdateMenu();
        }
        scheduleUpdateMenu() {
            this.menuUpdater.schedule(); // buffer multiple attempts to update the menu
        }
        doUpdateMenu() {
            // Due to limitations in Electron, it is not possible to update menu items dynamically. The suggested
            // workaround from Electron is to set the application menu again.
            // See also https://github.com/electron/electron/issues/846
            //
            // Run delayed to prevent updating menu while it is open
            if (!this.willShutdown) {
                setTimeout(() => {
                    if (!this.willShutdown) {
                        this.install();
                    }
                }, 10 /* delay this because there is an issue with updating a menu when it is open */);
            }
        }
        onDidChangeWindowsCount(e) {
            if (!platform_1.isMacintosh) {
                return;
            }
            // Update menu if window count goes from N > 0 or 0 > N to update menu item enablement
            if ((e.oldCount === 0 && e.newCount > 0) || (e.oldCount > 0 && e.newCount === 0)) {
                this.closedLastWindow = e.newCount === 0;
                this.scheduleUpdateMenu();
            }
        }
        onDidChangeWindowFocus() {
            if (!platform_1.isMacintosh) {
                return;
            }
            this.noActiveWindow = !electron_1.BrowserWindow.getFocusedWindow();
            this.scheduleUpdateMenu();
        }
        install() {
            // Store old menu in our array to avoid GC to collect the menu and crash. See #55347
            // TODO@sbatten Remove this when fixed upstream by Electron
            const oldMenu = electron_1.Menu.getApplicationMenu();
            if (oldMenu) {
                this.oldMenus.push(oldMenu);
            }
            // If we don't have a menu yet, set it to null to avoid the electron menu.
            // This should only happen on the first launch ever
            if (Object.keys(this.menubarMenus).length === 0) {
                electron_1.Menu.setApplicationMenu(platform_1.isMacintosh ? new electron_1.Menu() : null);
                return;
            }
            // Menus
            const menubar = new electron_1.Menu();
            // Mac: Application
            let macApplicationMenuItem;
            if (platform_1.isMacintosh) {
                const applicationMenu = new electron_1.Menu();
                macApplicationMenuItem = new electron_1.MenuItem({ label: this.productService.nameShort, submenu: applicationMenu });
                this.setMacApplicationMenu(applicationMenu);
                menubar.append(macApplicationMenuItem);
            }
            // Mac: Dock
            if (platform_1.isMacintosh && !this.appMenuInstalled) {
                this.appMenuInstalled = true;
                const dockMenu = new electron_1.Menu();
                dockMenu.append(new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "New &&Window")), click: () => this.windowsMainService.openEmptyWindow({ context: 1 /* OpenContext.DOCK */ }) }));
                electron_1.app.dock.setMenu(dockMenu);
            }
            // File
            if (this.shouldDrawMenu('File')) {
                const fileMenu = new electron_1.Menu();
                const fileMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File")), submenu: fileMenu });
                this.setMenuById(fileMenu, 'File');
                menubar.append(fileMenuItem);
            }
            // Edit
            if (this.shouldDrawMenu('Edit')) {
                const editMenu = new electron_1.Menu();
                const editMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")), submenu: editMenu });
                this.setMenuById(editMenu, 'Edit');
                menubar.append(editMenuItem);
            }
            // Selection
            if (this.shouldDrawMenu('Selection')) {
                const selectionMenu = new electron_1.Menu();
                const selectionMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mSelection', comment: ['&& denotes a mnemonic'] }, "&&Selection")), submenu: selectionMenu });
                this.setMenuById(selectionMenu, 'Selection');
                menubar.append(selectionMenuItem);
            }
            // View
            if (this.shouldDrawMenu('View')) {
                const viewMenu = new electron_1.Menu();
                const viewMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")), submenu: viewMenu });
                this.setMenuById(viewMenu, 'View');
                menubar.append(viewMenuItem);
            }
            // Go
            if (this.shouldDrawMenu('Go')) {
                const gotoMenu = new electron_1.Menu();
                const gotoMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Go")), submenu: gotoMenu });
                this.setMenuById(gotoMenu, 'Go');
                menubar.append(gotoMenuItem);
            }
            // Debug
            if (this.shouldDrawMenu('Run')) {
                const debugMenu = new electron_1.Menu();
                const debugMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mRun', comment: ['&& denotes a mnemonic'] }, "&&Run")), submenu: debugMenu });
                this.setMenuById(debugMenu, 'Run');
                menubar.append(debugMenuItem);
            }
            // Terminal
            if (this.shouldDrawMenu('Terminal')) {
                const terminalMenu = new electron_1.Menu();
                const terminalMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal")), submenu: terminalMenu });
                this.setMenuById(terminalMenu, 'Terminal');
                menubar.append(terminalMenuItem);
            }
            // Mac: Window
            let macWindowMenuItem;
            if (this.shouldDrawMenu('Window')) {
                const windowMenu = new electron_1.Menu();
                macWindowMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize('mWindow', "Window")), submenu: windowMenu, role: 'window' });
                this.setMacWindowMenu(windowMenu);
            }
            if (macWindowMenuItem) {
                menubar.append(macWindowMenuItem);
            }
            // Help
            if (this.shouldDrawMenu('Help')) {
                const helpMenu = new electron_1.Menu();
                const helpMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")), submenu: helpMenu, role: 'help' });
                this.setMenuById(helpMenu, 'Help');
                menubar.append(helpMenuItem);
            }
            if (menubar.items && menubar.items.length > 0) {
                electron_1.Menu.setApplicationMenu(menubar);
            }
            else {
                electron_1.Menu.setApplicationMenu(null);
            }
            // Dispose of older menus after some time
            this.menuGC.schedule();
        }
        setMacApplicationMenu(macApplicationMenu) {
            const about = this.createMenuItem(nls.localize('mAbout', "About {0}", this.productService.nameLong), 'workbench.action.showAboutDialog');
            const checkForUpdates = this.getUpdateMenuItems();
            let preferences;
            if (this.shouldDrawMenu('Preferences')) {
                const preferencesMenu = new electron_1.Menu();
                this.setMenuById(preferencesMenu, 'Preferences');
                preferences = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences")), submenu: preferencesMenu });
            }
            const servicesMenu = new electron_1.Menu();
            const services = new electron_1.MenuItem({ label: nls.localize('mServices', "Services"), role: 'services', submenu: servicesMenu });
            const hide = new electron_1.MenuItem({ label: nls.localize('mHide', "Hide {0}", this.productService.nameLong), role: 'hide', accelerator: 'Command+H' });
            const hideOthers = new electron_1.MenuItem({ label: nls.localize('mHideOthers', "Hide Others"), role: 'hideOthers', accelerator: 'Command+Alt+H' });
            const showAll = new electron_1.MenuItem({ label: nls.localize('mShowAll', "Show All"), role: 'unhide' });
            const quit = new electron_1.MenuItem(this.likeAction('workbench.action.quit', {
                label: nls.localize('miQuit', "Quit {0}", this.productService.nameLong), click: async (item, window, event) => {
                    const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
                    if (this.windowsMainService.getWindowCount() === 0 || // allow to quit when no more windows are open
                        !!electron_1.BrowserWindow.getFocusedWindow() || // allow to quit when window has focus (fix for https://github.com/microsoft/vscode/issues/39191)
                        lastActiveWindow?.isMinimized() // allow to quit when window has no focus but is minimized (https://github.com/microsoft/vscode/issues/63000)
                    ) {
                        const confirmed = await this.confirmBeforeQuit(event);
                        if (confirmed) {
                            this.nativeHostMainService.quit(undefined);
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
        async confirmBeforeQuit(event) {
            if (this.windowsMainService.getWindowCount() === 0) {
                return true; // never confirm when no windows are opened
            }
            const confirmBeforeClose = this.configurationService.getValue('window.confirmBeforeClose');
            if (confirmBeforeClose === 'always' || (confirmBeforeClose === 'keyboardOnly' && this.isKeyboardEvent(event))) {
                const { response } = await this.nativeHostMainService.showMessageBox(this.windowsMainService.getFocusedWindow()?.id, {
                    type: 'question',
                    buttons: [
                        nls.localize({ key: 'quit', comment: ['&& denotes a mnemonic'] }, "&&Quit"),
                        nls.localize('cancel', "Cancel")
                    ],
                    message: nls.localize('quitMessage', "Are you sure you want to quit?")
                });
                return response === 0;
            }
            return true;
        }
        shouldDrawMenu(menuId) {
            // We need to draw an empty menu to override the electron default
            if (!platform_1.isMacintosh && (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                return false;
            }
            switch (menuId) {
                case 'File':
                case 'Help':
                    if (platform_1.isMacintosh) {
                        return (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) || (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow) || (!!this.menubarMenus && !!this.menubarMenus[menuId]);
                    }
                case 'Window':
                    if (platform_1.isMacintosh) {
                        return (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) || (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow) || !!this.menubarMenus;
                    }
                default:
                    return this.windowsMainService.getWindowCount() > 0 && (!!this.menubarMenus && !!this.menubarMenus[menuId]);
            }
        }
        setMenu(menu, items) {
            items.forEach((item) => {
                if ((0, menubar_1.isMenubarMenuItemSeparator)(item)) {
                    menu.append(__separator__());
                }
                else if ((0, menubar_1.isMenubarMenuItemSubmenu)(item)) {
                    const submenu = new electron_1.Menu();
                    const submenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(item.label), submenu });
                    this.setMenu(submenu, item.submenu.items);
                    menu.append(submenuItem);
                }
                else if ((0, menubar_1.isMenubarMenuItemRecentAction)(item)) {
                    menu.append(this.createOpenRecentMenuItem(item));
                }
                else if ((0, menubar_1.isMenubarMenuItemAction)(item)) {
                    if (item.id === 'workbench.action.showAboutDialog') {
                        this.insertCheckForUpdatesItems(menu);
                    }
                    if (platform_1.isMacintosh) {
                        if ((this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) ||
                            (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow)) {
                            // In the fallback scenario, we are either disabled or using a fallback handler
                            if (this.fallbackMenuHandlers[item.id]) {
                                menu.append(new electron_1.MenuItem(this.likeAction(item.id, { label: this.mnemonicLabel(item.label), click: this.fallbackMenuHandlers[item.id] })));
                            }
                            else {
                                menu.append(this.createMenuItem(item.label, item.id, false, item.checked));
                            }
                        }
                        else {
                            menu.append(this.createMenuItem(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                        }
                    }
                    else {
                        menu.append(this.createMenuItem(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                    }
                }
            });
        }
        setMenuById(menu, menuId) {
            if (this.menubarMenus && this.menubarMenus[menuId]) {
                this.setMenu(menu, this.menubarMenus[menuId].items);
            }
        }
        insertCheckForUpdatesItems(menu) {
            const updateItems = this.getUpdateMenuItems();
            if (updateItems.length) {
                updateItems.forEach(i => menu.append(i));
                menu.append(__separator__());
            }
        }
        createOpenRecentMenuItem(item) {
            const revivedUri = uri_1.URI.revive(item.uri);
            const commandId = item.id;
            const openable = (commandId === 'openRecentFile') ? { fileUri: revivedUri } :
                (commandId === 'openRecentWorkspace') ? { workspaceUri: revivedUri } : { folderUri: revivedUri };
            return new electron_1.MenuItem(this.likeAction(commandId, {
                label: item.label,
                click: async (menuItem, win, event) => {
                    const openInNewWindow = this.isOptionClick(event);
                    const success = (await this.windowsMainService.open({
                        context: 2 /* OpenContext.MENU */,
                        cli: this.environmentMainService.args,
                        urisToOpen: [openable],
                        forceNewWindow: openInNewWindow,
                        gotoLineMode: false,
                        remoteAuthority: item.remoteAuthority
                    })).length > 0;
                    if (!success) {
                        await this.workspacesHistoryMainService.removeRecentlyOpened([revivedUri]);
                    }
                }
            }, false));
        }
        isOptionClick(event) {
            return !!(event && ((!platform_1.isMacintosh && (event.ctrlKey || event.shiftKey)) || (platform_1.isMacintosh && (event.metaKey || event.altKey))));
        }
        isKeyboardEvent(event) {
            return !!(event.triggeredByAccelerator || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
        }
        createRoleMenuItem(label, commandId, role) {
            const options = {
                label: this.mnemonicLabel(label),
                role,
                enabled: true
            };
            return new electron_1.MenuItem(this.withKeybinding(commandId, options));
        }
        setMacWindowMenu(macWindowMenu) {
            const minimize = new electron_1.MenuItem({ label: nls.localize('mMinimize', "Minimize"), role: 'minimize', accelerator: 'Command+M', enabled: this.windowsMainService.getWindowCount() > 0 });
            const zoom = new electron_1.MenuItem({ label: nls.localize('mZoom', "Zoom"), role: 'zoom', enabled: this.windowsMainService.getWindowCount() > 0 });
            const bringAllToFront = new electron_1.MenuItem({ label: nls.localize('mBringToFront', "Bring All to Front"), role: 'front', enabled: this.windowsMainService.getWindowCount() > 0 });
            const switchWindow = this.createMenuItem(nls.localize({ key: 'miSwitchWindow', comment: ['&& denotes a mnemonic'] }, "Switch &&Window..."), 'workbench.action.switchWindow');
            const nativeTabMenuItems = [];
            if (this.currentEnableNativeTabs) {
                nativeTabMenuItems.push(__separator__());
                nativeTabMenuItems.push(this.createMenuItem(nls.localize('mNewTab', "New Tab"), 'workbench.action.newWindowTab'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mShowPreviousTab', "Show Previous Tab"), 'workbench.action.showPreviousWindowTab', 'selectPreviousTab'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mShowNextTab', "Show Next Tab"), 'workbench.action.showNextWindowTab', 'selectNextTab'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mMoveTabToNewWindow', "Move Tab to New Window"), 'workbench.action.moveWindowTabToNewWindow', 'moveTabToNewWindow'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mMergeAllWindows', "Merge All Windows"), 'workbench.action.mergeAllWindowTabs', 'mergeAllWindows'));
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
        getUpdateMenuItems() {
            const state = this.updateService.state;
            switch (state.type) {
                case "idle" /* StateType.Idle */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize('miCheckForUpdates', "Check for &&Updates...")), click: () => setTimeout(() => {
                                this.reportMenuActionTelemetry('CheckForUpdate');
                                this.updateService.checkForUpdates(true);
                            }, 0)
                        })];
                case "checking for updates" /* StateType.CheckingForUpdates */:
                    return [new electron_1.MenuItem({ label: nls.localize('miCheckingForUpdates', "Checking for Updates..."), enabled: false })];
                case "available for download" /* StateType.AvailableForDownload */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize('miDownloadUpdate', "D&&ownload Available Update")), click: () => {
                                this.updateService.downloadUpdate();
                            }
                        })];
                case "downloading" /* StateType.Downloading */:
                    return [new electron_1.MenuItem({ label: nls.localize('miDownloadingUpdate', "Downloading Update..."), enabled: false })];
                case "downloaded" /* StateType.Downloaded */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize('miInstallUpdate', "Install &&Update...")), click: () => {
                                this.reportMenuActionTelemetry('InstallUpdate');
                                this.updateService.applyUpdate();
                            }
                        })];
                case "updating" /* StateType.Updating */:
                    return [new electron_1.MenuItem({ label: nls.localize('miInstallingUpdate', "Installing Update..."), enabled: false })];
                case "ready" /* StateType.Ready */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize('miRestartToUpdate', "Restart to &&Update")), click: () => {
                                this.reportMenuActionTelemetry('RestartToUpdate');
                                this.updateService.quitAndInstall();
                            }
                        })];
                default:
                    return [];
            }
        }
        createMenuItem(arg1, arg2, arg3, arg4) {
            const label = this.mnemonicLabel(arg1);
            const click = (typeof arg2 === 'function') ? arg2 : (menuItem, win, event) => {
                const userSettingsLabel = menuItem ? menuItem.userSettingsLabel : null;
                let commandId = arg2;
                if (Array.isArray(arg2)) {
                    commandId = this.isOptionClick(event) ? arg2[1] : arg2[0]; // support alternative action if we got multiple action Ids and the option key was pressed while invoking
                }
                if (userSettingsLabel && event.triggeredByAccelerator) {
                    this.runActionInRenderer({ type: 'keybinding', userSettingsLabel });
                }
                else {
                    this.runActionInRenderer({ type: 'commandId', commandId });
                }
            };
            const enabled = typeof arg3 === 'boolean' ? arg3 : this.windowsMainService.getWindowCount() > 0;
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
            if (platform_1.isMacintosh) {
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
                    options.click = this.makeContextAwareClickHandler(click, {
                        inDevTools: devTools => devTools.undo(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('undo:')
                    });
                }
                else if (commandId === 'redo') {
                    options.click = this.makeContextAwareClickHandler(click, {
                        inDevTools: devTools => devTools.redo(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('redo:')
                    });
                }
                else if (commandId === 'editor.action.selectAll') {
                    options.click = this.makeContextAwareClickHandler(click, {
                        inDevTools: devTools => devTools.selectAll(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('selectAll:')
                    });
                }
            }
            return new electron_1.MenuItem(this.withKeybinding(commandId, options));
        }
        makeContextAwareClickHandler(click, contextSpecificHandlers) {
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
        runActionInRenderer(invocation) {
            // We make sure to not run actions when the window has no focus, this helps
            // for https://github.com/microsoft/vscode/issues/25907 and specifically for
            // https://github.com/microsoft/vscode/issues/11928
            // Still allow to run when the last active window is minimized though for
            // https://github.com/microsoft/vscode/issues/63000
            let activeBrowserWindow = electron_1.BrowserWindow.getFocusedWindow();
            if (!activeBrowserWindow) {
                const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
                if (lastActiveWindow?.isMinimized()) {
                    activeBrowserWindow = lastActiveWindow.win;
                }
            }
            const activeWindow = activeBrowserWindow ? this.windowsMainService.getWindowById(activeBrowserWindow.id) : undefined;
            if (activeWindow) {
                this.logService.trace('menubar#runActionInRenderer', invocation);
                if (platform_1.isMacintosh && !this.environmentMainService.isBuilt && !activeWindow.isReady) {
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
                this.logService.trace('menubar#runActionInRenderer: no active window found', invocation);
            }
        }
        withKeybinding(commandId, options) {
            const binding = typeof commandId === 'string' ? this.keybindings[commandId] : undefined;
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
        likeAction(commandId, options, setAccelerator = !options.accelerator) {
            if (setAccelerator) {
                options = this.withKeybinding(commandId, options);
            }
            const originalClick = options.click;
            options.click = (item, window, event) => {
                this.reportMenuActionTelemetry(commandId);
                originalClick?.(item, window, event);
            };
            return options;
        }
        openUrl(url, id) {
            this.nativeHostMainService.openExternal(undefined, url);
            this.reportMenuActionTelemetry(id);
        }
        reportMenuActionTelemetry(id) {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: telemetryFrom });
        }
        mnemonicLabel(label) {
            return (0, labels_1.mnemonicMenuLabel)(label, !this.currentEnableMenuBarMnemonics);
        }
    };
    exports.Menubar = Menubar;
    exports.Menubar = Menubar = Menubar_1 = __decorate([
        __param(0, update_1.IUpdateService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, windows_1.IWindowsMainService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, workspacesHistoryMainService_1.IWorkspacesHistoryMainService),
        __param(6, state_1.IStateService),
        __param(7, lifecycleMainService_1.ILifecycleMainService),
        __param(8, log_1.ILogService),
        __param(9, nativeHostMainService_1.INativeHostMainService),
        __param(10, productService_1.IProductService)
    ], Menubar);
    function __separator__() {
        return new electron_1.MenuItem({ type: 'separator' });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL21lbnViYXIvZWxlY3Ryb24tbWFpbi9tZW51YmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQztJQWdCdEIsSUFBTSxPQUFPLEdBQWIsTUFBTSxPQUFPOztpQkFFSywrQkFBMEIsR0FBRyxzQkFBc0IsQUFBekIsQ0FBMEI7UUFvQjVFLFlBQ2lCLGFBQThDLEVBQ3ZDLG9CQUE0RCxFQUM5RCxrQkFBd0QsRUFDcEQsc0JBQWdFLEVBQ3RFLGdCQUFvRCxFQUN4Qyw0QkFBNEUsRUFDNUYsWUFBNEMsRUFDcEMsb0JBQTRELEVBQ3RFLFVBQXdDLEVBQzdCLHFCQUE4RCxFQUNyRSxjQUFnRDtZQVZoQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ25DLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDckQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN2QixpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBQzNFLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDckQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNaLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDcEQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBYmpELHlCQUFvQixHQUFtSCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBZTNLLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXpFLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkMsSUFBSSxzQkFBVyxJQUFJLElBQUEseUJBQWdCLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUM1RSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzthQUNoQztZQUVELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRTNCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFFNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFbkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLHdCQUF3QjtZQUMvQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBZSxTQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNoRyxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO29CQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7aUJBQ3RDO2dCQUVELElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO2lCQUMzQzthQUNEO1FBQ0YsQ0FBQztRQUVPLG1CQUFtQjtZQUUxQixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdDQUF3QyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU8sMEJBQWtCLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLDBCQUFrQixFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyTCxJQUFJLENBQUMsb0JBQW9CLENBQUMsdUNBQXVDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZQLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxtQ0FBbUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL08sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUvTyxvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLG1DQUFtQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFFL0gsa0JBQWtCO1lBQ2xCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO1lBQ2xELElBQUksVUFBVSxFQUFFO2dCQUNmLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQ0FBaUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7YUFDaEg7WUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUM7WUFDaEUsSUFBSSxpQkFBaUIsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdDQUF3QyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2FBQ2hJO1lBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7WUFDMUQsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxvQ0FBb0MsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7YUFDekg7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztZQUNsRCxJQUFJLFVBQVUsRUFBRTtnQkFDZixJQUFJLENBQUMsb0JBQW9CLENBQUMsaUNBQWlDLENBQUMsR0FBRyxHQUFHLEVBQUU7b0JBQ25FLElBQUksbUJBQVEsRUFBRTt3QkFDYixNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLEdBQUcsWUFBWSxRQUFRLG1CQUFRLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUMvRTt5QkFBTTt3QkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUMzQztnQkFDRixDQUFDLENBQUM7YUFDRjtZQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNwRSxJQUFJLG1CQUFtQixJQUFJLFVBQVUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLDBDQUEwQyxDQUFDLEdBQUcsR0FBRyxFQUFFO29CQUM1RSxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQzNELENBQUMsQ0FBQzthQUNGO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QiwyQkFBMkI7WUFDM0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBRXpFLDJEQUEyRDtZQUMzRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELElBQVksNkJBQTZCO1lBQ3hDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBQ25HLElBQUksT0FBTyxzQkFBc0IsS0FBSyxTQUFTLEVBQUU7Z0JBQ2hELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLHNCQUFzQixDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFZLHVCQUF1QjtZQUNsQyxJQUFJLENBQUMsc0JBQVcsRUFBRTtnQkFDakIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2pGLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7Z0JBQzFDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFRCxVQUFVLENBQUMsV0FBeUIsRUFBRSxRQUFnQjtZQUNyRCxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1lBRTNDLG9DQUFvQztZQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFPLENBQUMsMEJBQTBCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFM0UsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUdPLGtCQUFrQjtZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsOENBQThDO1FBQzVFLENBQUM7UUFFTyxZQUFZO1lBRW5CLHFHQUFxRztZQUNyRyxpRUFBaUU7WUFDakUsMkRBQTJEO1lBQzNELEVBQUU7WUFDRix3REFBd0Q7WUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7d0JBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDZjtnQkFDRixDQUFDLEVBQUUsRUFBRSxDQUFDLCtFQUErRSxDQUFDLENBQUM7YUFDdkY7UUFDRixDQUFDO1FBRU8sdUJBQXVCLENBQUMsQ0FBNEI7WUFDM0QsSUFBSSxDQUFDLHNCQUFXLEVBQUU7Z0JBQ2pCLE9BQU87YUFDUDtZQUVELHNGQUFzRjtZQUN0RixJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7YUFDMUI7UUFDRixDQUFDO1FBRU8sc0JBQXNCO1lBQzdCLElBQUksQ0FBQyxzQkFBVyxFQUFFO2dCQUNqQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsd0JBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxPQUFPO1lBQ2Qsb0ZBQW9GO1lBQ3BGLDJEQUEyRDtZQUMzRCxNQUFNLE9BQU8sR0FBRyxlQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQyxJQUFJLE9BQU8sRUFBRTtnQkFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM1QjtZQUVELDBFQUEwRTtZQUMxRSxtREFBbUQ7WUFDbkQsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoRCxlQUFJLENBQUMsa0JBQWtCLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxlQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pELE9BQU87YUFDUDtZQUVELFFBQVE7WUFDUixNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO1lBRTNCLG1CQUFtQjtZQUNuQixJQUFJLHNCQUFnQyxDQUFDO1lBQ3JDLElBQUksc0JBQVcsRUFBRTtnQkFDaEIsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztnQkFDbkMsc0JBQXNCLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUN2QztZQUVELFlBQVk7WUFDWixJQUFJLHNCQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Z0JBRTdCLE1BQU0sUUFBUSxHQUFHLElBQUksZUFBSSxFQUFFLENBQUM7Z0JBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLDBCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFNU8sY0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDM0I7WUFFRCxPQUFPO1lBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO2dCQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDbEssSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDN0I7WUFFRCxPQUFPO1lBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO2dCQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDbEssSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDN0I7WUFFRCxZQUFZO1lBQ1osSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNyQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO2dCQUNqQyxNQUFNLGlCQUFpQixHQUFHLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUN0TCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDN0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsT0FBTztZQUNQLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ2xLLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdCO1lBRUQsS0FBSztZQUNMLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ2hLLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdCO1lBRUQsUUFBUTtZQUNSLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xLLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzlCO1lBRUQsV0FBVztZQUNYLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztnQkFDbEwsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzNDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUNqQztZQUVELGNBQWM7WUFDZCxJQUFJLGlCQUF1QyxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztnQkFDOUIsaUJBQWlCLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN4SSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDbEM7WUFFRCxJQUFJLGlCQUFpQixFQUFFO2dCQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDbEM7WUFFRCxPQUFPO1lBQ1AsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO2dCQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUNoTCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM3QjtZQUVELElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlDLGVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztpQkFBTTtnQkFDTixlQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUI7WUFFRCx5Q0FBeUM7WUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRU8scUJBQXFCLENBQUMsa0JBQXdCO1lBQ3JELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUN6SSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUVsRCxJQUFJLFdBQVcsQ0FBQztZQUNoQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBSSxFQUFFLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNqRCxXQUFXLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7YUFDakw7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO1lBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ3pILE1BQU0sSUFBSSxHQUFHLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzlJLE1BQU0sVUFBVSxHQUFHLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3pJLE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUM5RixNQUFNLElBQUksR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRTtnQkFDbEUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDN0csTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDdkUsSUFDQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFLLDhDQUE4Qzt3QkFDakcsQ0FBQyxDQUFDLHdCQUFhLENBQUMsZ0JBQWdCLEVBQUUsSUFBTyxpR0FBaUc7d0JBQzFJLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxDQUFNLDZHQUE2RztzQkFDako7d0JBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3RELElBQUksU0FBUyxFQUFFOzRCQUNkLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7eUJBQzNDO3FCQUNEO2dCQUNGLENBQUM7YUFDRCxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxDQUFDO1lBRWpDLElBQUksV0FBVyxFQUFFO2dCQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUc7b0JBQ2YsYUFBYSxFQUFFO29CQUNmLFdBQVc7aUJBQ1gsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUc7Z0JBQ2YsYUFBYSxFQUFFO2dCQUNmLFFBQVE7Z0JBQ1IsYUFBYSxFQUFFO2dCQUNmLElBQUk7Z0JBQ0osVUFBVTtnQkFDVixPQUFPO2dCQUNQLGFBQWEsRUFBRTtnQkFDZixJQUFJO2FBQ0osQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBb0I7WUFDbkQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNuRCxPQUFPLElBQUksQ0FBQyxDQUFDLDJDQUEyQzthQUN4RDtZQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBc0MsMkJBQTJCLENBQUMsQ0FBQztZQUNoSSxJQUFJLGtCQUFrQixLQUFLLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixLQUFLLGNBQWMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzlHLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxFQUFFO29CQUNwSCxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsT0FBTyxFQUFFO3dCQUNSLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7d0JBQzNFLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztxQkFDaEM7b0JBQ0QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLGdDQUFnQyxDQUFDO2lCQUN0RSxDQUFDLENBQUM7Z0JBRUgsT0FBTyxRQUFRLEtBQUssQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU8sY0FBYyxDQUFDLE1BQWM7WUFDcEMsaUVBQWlFO1lBQ2pFLElBQUksQ0FBQyxzQkFBVyxJQUFJLElBQUEseUJBQWdCLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUM3RSxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsUUFBUSxNQUFNLEVBQUU7Z0JBQ2YsS0FBSyxNQUFNLENBQUM7Z0JBQ1osS0FBSyxNQUFNO29CQUNWLElBQUksc0JBQVcsRUFBRTt3QkFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7cUJBQ2xOO2dCQUVGLEtBQUssUUFBUTtvQkFDWixJQUFJLHNCQUFXLEVBQUU7d0JBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7cUJBQ2pMO2dCQUVGO29CQUNDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDN0c7UUFDRixDQUFDO1FBR08sT0FBTyxDQUFDLElBQVUsRUFBRSxLQUE2QjtZQUN4RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBcUIsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLElBQUEsb0NBQTBCLEVBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztpQkFDN0I7cUJBQU0sSUFBSSxJQUFBLGtDQUF3QixFQUFDLElBQUksQ0FBQyxFQUFFO29CQUMxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQUksRUFBRSxDQUFDO29CQUMzQixNQUFNLFdBQVcsR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDckYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDekI7cUJBQU0sSUFBSSxJQUFBLHVDQUE2QixFQUFDLElBQUksQ0FBQyxFQUFFO29CQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNqRDtxQkFBTSxJQUFJLElBQUEsaUNBQXVCLEVBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxrQ0FBa0MsRUFBRTt3QkFDbkQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUN0QztvQkFFRCxJQUFJLHNCQUFXLEVBQUU7d0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQzs0QkFDNUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTs0QkFDdkUsK0VBQStFOzRCQUMvRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0NBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxtQkFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUMxSTtpQ0FBTTtnQ0FDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs2QkFDM0U7eUJBQ0Q7NkJBQU07NEJBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3lCQUM3RztxQkFDRDt5QkFBTTt3QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7cUJBQzdHO2lCQUNEO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sV0FBVyxDQUFDLElBQVUsRUFBRSxNQUFjO1lBQzdDLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1FBQ0YsQ0FBQztRQUVPLDBCQUEwQixDQUFDLElBQVU7WUFDNUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUMsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUN2QixXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7YUFDN0I7UUFDRixDQUFDO1FBRU8sd0JBQXdCLENBQUMsSUFBa0M7WUFDbEUsTUFBTSxVQUFVLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMxQixNQUFNLFFBQVEsR0FDYixDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDLFNBQVMsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUM7WUFFbkcsT0FBTyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7Z0JBQzlDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNyQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNsRCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQzt3QkFDbkQsT0FBTywwQkFBa0I7d0JBQ3pCLEdBQUcsRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSTt3QkFDckMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDO3dCQUN0QixjQUFjLEVBQUUsZUFBZTt3QkFDL0IsWUFBWSxFQUFFLEtBQUs7d0JBQ25CLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtxQkFDckMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFFZixJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNiLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLG9CQUFvQixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztxQkFDM0U7Z0JBQ0YsQ0FBQzthQUNELEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUM7UUFFTyxhQUFhLENBQUMsS0FBb0I7WUFDekMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsc0JBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBVyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0gsQ0FBQztRQUVPLGVBQWUsQ0FBQyxLQUFvQjtZQUMzQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0csQ0FBQztRQUVPLGtCQUFrQixDQUFDLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQVM7WUFDckUsTUFBTSxPQUFPLEdBQStCO2dCQUMzQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hDLElBQUk7Z0JBQ0osT0FBTyxFQUFFLElBQUk7YUFDYixDQUFDO1lBRUYsT0FBTyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU8sZ0JBQWdCLENBQUMsYUFBbUI7WUFDM0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkwsTUFBTSxJQUFJLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pJLE1BQU0sZUFBZSxHQUFHLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNLLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsb0JBQW9CLENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1lBRTdLLE1BQU0sa0JBQWtCLEdBQWUsRUFBRSxDQUFDO1lBQzFDLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO2dCQUNqQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFFekMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsK0JBQStCLENBQUMsQ0FBQyxDQUFDO2dCQUVsSCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUMsRUFBRSx3Q0FBd0MsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZLLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLEVBQUUsb0NBQW9DLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDdkosa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLHdCQUF3QixDQUFDLEVBQUUsMkNBQTJDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNuTCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxxQ0FBcUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDbEs7WUFFRDtnQkFDQyxRQUFRO2dCQUNSLElBQUk7Z0JBQ0osYUFBYSxFQUFFO2dCQUNmLFlBQVk7Z0JBQ1osR0FBRyxrQkFBa0I7Z0JBQ3JCLGFBQWEsRUFBRTtnQkFDZixlQUFlO2FBQ2YsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztZQUV2QyxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ25CO29CQUNDLE9BQU8sQ0FBQyxJQUFJLG1CQUFRLENBQUM7NEJBQ3BCLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dDQUNwSCxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQ0FDakQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQzFDLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUw7b0JBQ0MsT0FBTyxDQUFDLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLHlCQUF5QixDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFbkg7b0JBQ0MsT0FBTyxDQUFDLElBQUksbUJBQVEsQ0FBQzs0QkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQ0FDdkcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDckMsQ0FBQzt5QkFDRCxDQUFDLENBQUMsQ0FBQztnQkFFTDtvQkFDQyxPQUFPLENBQUMsSUFBSSxtQkFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsdUJBQXVCLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVoSDtvQkFDQyxPQUFPLENBQUMsSUFBSSxtQkFBUSxDQUFDOzRCQUNwQixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO2dDQUM5RixJQUFJLENBQUMseUJBQXlCLENBQUMsZUFBZSxDQUFDLENBQUM7Z0NBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ2xDLENBQUM7eUJBQ0QsQ0FBQyxDQUFDLENBQUM7Z0JBRUw7b0JBQ0MsT0FBTyxDQUFDLElBQUksbUJBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFOUc7b0JBQ0MsT0FBTyxDQUFDLElBQUksbUJBQVEsQ0FBQzs0QkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQ0FDaEcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0NBQ2xELElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUM7NEJBQ3JDLENBQUM7eUJBQ0QsQ0FBQyxDQUFDLENBQUM7Z0JBRUw7b0JBQ0MsT0FBTyxFQUFFLENBQUM7YUFDWDtRQUNGLENBQUM7UUFJTyxjQUFjLENBQUMsSUFBWSxFQUFFLElBQVMsRUFBRSxJQUFjLEVBQUUsSUFBYztZQUM3RSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sS0FBSyxHQUFlLENBQUMsT0FBTyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUE0QyxFQUFFLEdBQWtCLEVBQUUsS0FBb0IsRUFBRSxFQUFFO2dCQUMxSixNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDckIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUN4QixTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5R0FBeUc7aUJBQ3BLO2dCQUVELElBQUksaUJBQWlCLElBQUksS0FBSyxDQUFDLHNCQUFzQixFQUFFO29CQUN0RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztpQkFDcEU7cUJBQU07b0JBQ04sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRDtZQUNGLENBQUMsQ0FBQztZQUNGLE1BQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFekQsTUFBTSxPQUFPLEdBQStCO2dCQUMzQyxLQUFLO2dCQUNMLEtBQUs7Z0JBQ0wsT0FBTzthQUNQLENBQUM7WUFFRixJQUFJLE9BQU8sRUFBRTtnQkFDWixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7YUFDMUI7WUFFRCxJQUFJLFNBQTZCLENBQUM7WUFDbEMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDakI7aUJBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUMvQixTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BCO1lBRUQsSUFBSSxzQkFBVyxFQUFFO2dCQUVoQix1Q0FBdUM7Z0JBQ3ZDLElBQUksU0FBUyxLQUFLLGtDQUFrQyxFQUFFO29CQUNyRCxPQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztpQkFDckI7cUJBQU0sSUFBSSxTQUFTLEtBQUssbUNBQW1DLEVBQUU7b0JBQzdELE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO2lCQUN0QjtxQkFBTSxJQUFJLFNBQVMsS0FBSyxvQ0FBb0MsRUFBRTtvQkFDOUQsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7aUJBQ3ZCO2dCQUVELCtEQUErRDtnQkFDL0QsSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO29CQUN6QixPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUU7d0JBQ3hELFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7d0JBQ3ZDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxlQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDO3FCQUMxRCxDQUFDLENBQUM7aUJBQ0g7cUJBQU0sSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO29CQUNoQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUU7d0JBQ3hELFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7d0JBQ3ZDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxlQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDO3FCQUMxRCxDQUFDLENBQUM7aUJBQ0g7cUJBQU0sSUFBSSxTQUFTLEtBQUsseUJBQXlCLEVBQUU7b0JBQ25ELE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEtBQUssRUFBRTt3QkFDeEQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTt3QkFDNUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUM7cUJBQy9ELENBQUMsQ0FBQztpQkFDSDthQUNEO1lBRUQsT0FBTyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU8sNEJBQTRCLENBQUMsS0FBNkUsRUFBRSx1QkFBOEM7WUFDakssT0FBTyxDQUFDLFFBQWtCLEVBQUUsR0FBOEIsRUFBRSxLQUFvQixFQUFFLEVBQUU7Z0JBRW5GLG1CQUFtQjtnQkFDbkIsTUFBTSxZQUFZLEdBQUcsd0JBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUNsQixPQUFPLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxDQUFDO2lCQUM1QztnQkFFRCxtQkFBbUI7Z0JBQ25CLElBQUksWUFBWSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRTtvQkFDL0MsWUFBWSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDOUMsT0FBTyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2lCQUN4RjtnQkFFRCxvQ0FBb0M7Z0JBQ3BDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUM7UUFDSCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsVUFBK0I7WUFDMUQsMkVBQTJFO1lBQzNFLDRFQUE0RTtZQUM1RSxtREFBbUQ7WUFDbkQseUVBQXlFO1lBQ3pFLG1EQUFtRDtZQUNuRCxJQUFJLG1CQUFtQixHQUFHLHdCQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzRCxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3pCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3ZFLElBQUksZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLEVBQUU7b0JBQ3BDLG1CQUFtQixHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztpQkFDM0M7YUFDRDtZQUVELE1BQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDckgsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUVqRSxJQUFJLHNCQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRTtvQkFDakYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssaUNBQWlDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsS0FBSyxXQUFXLENBQUMsRUFBRTt3QkFDekwscUdBQXFHO3dCQUNyRyx3R0FBd0c7d0JBQ3hHLG1HQUFtRzt3QkFDbkcsT0FBTztxQkFDUDtpQkFDRDtnQkFFRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO29CQUNwQyxNQUFNLGdCQUFnQixHQUFvQyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDckcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztpQkFDekY7cUJBQU07b0JBQ04sTUFBTSxvQkFBb0IsR0FBd0MsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztvQkFDdEgsWUFBWSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztpQkFDakc7YUFDRDtpQkFBTTtnQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxxREFBcUQsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN6RjtRQUNGLENBQUM7UUFFTyxjQUFjLENBQUMsU0FBNkIsRUFBRSxPQUE2RDtZQUNsSCxNQUFNLE9BQU8sR0FBRyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUV4RixnQ0FBZ0M7WUFDaEMsSUFBSSxPQUFPLEVBQUUsS0FBSyxFQUFFO2dCQUVuQixpREFBaUQ7Z0JBQ2pELElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUU7b0JBQy9CLE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDcEMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztpQkFDdEQ7Z0JBRUQsa0ZBQWtGO2dCQUNsRixrRkFBa0Y7cUJBQzdFLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDM0MsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hELElBQUksWUFBWSxJQUFJLENBQUMsRUFBRTt3QkFDdEIsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsS0FBSyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUM7cUJBQzlFO3lCQUFNO3dCQUNOLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQztxQkFDdEQ7aUJBQ0Q7YUFDRDtZQUVELGtDQUFrQztpQkFDN0I7Z0JBQ0osT0FBTyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7YUFDaEM7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU8sVUFBVSxDQUFDLFNBQWlCLEVBQUUsT0FBbUMsRUFBRSxjQUFjLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVztZQUMvRyxJQUFJLGNBQWMsRUFBRTtnQkFDbkIsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNwQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQztZQUVGLE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFFTyxPQUFPLENBQUMsR0FBVyxFQUFFLEVBQVU7WUFDdEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTyx5QkFBeUIsQ0FBQyxFQUFVO1lBQzNDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQy9KLENBQUM7UUFFTyxhQUFhLENBQUMsS0FBYTtZQUNsQyxPQUFPLElBQUEsMEJBQWlCLEVBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDdEUsQ0FBQzs7SUFueEJXLDBCQUFPO3NCQUFQLE9BQU87UUF1QmpCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSw2QkFBbUIsQ0FBQTtRQUNuQixXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSw0REFBNkIsQ0FBQTtRQUM3QixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDRDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsOENBQXNCLENBQUE7UUFDdEIsWUFBQSxnQ0FBZSxDQUFBO09BakNMLE9BQU8sQ0FveEJuQjtJQUVELFNBQVMsYUFBYTtRQUNyQixPQUFPLElBQUksbUJBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUMifQ==