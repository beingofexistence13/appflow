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
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/window/common/window", "vs/platform/contextkey/common/contextkey", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/workspaces/common/workspaces", "vs/base/common/async", "vs/platform/label/common/label", "vs/platform/update/common/update", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/base/browser/ui/menu/menubar", "vs/base/browser/ui/menu/menu", "vs/base/common/labels", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/layout/browser/layoutService", "vs/base/browser/browser", "vs/workbench/services/host/browser/host", "vs/base/browser/canIUse", "vs/platform/contextkey/common/contextkeys", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/actions/windowActions", "vs/platform/action/common/action", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/menubarControl"], function (require, exports, nls_1, actions_1, window_1, contextkey_1, actions_2, dom_1, keybinding_1, platform_1, configuration_1, event_1, lifecycle_1, workspaces_1, async_1, label_1, update_1, storage_1, notification_1, preferences_1, environmentService_1, menubar_1, menu_1, labels_1, accessibility_1, layoutService_1, browser_1, host_1, canIUse_1, contextkeys_1, commands_1, telemetry_1, windowActions_1, action_1, menuEntryActionViewItem_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomMenubarControl = exports.MenubarControl = void 0;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarFileMenu,
        title: {
            value: 'File',
            original: 'File',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File"),
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarEditMenu,
        title: {
            value: 'Edit',
            original: 'Edit',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarSelectionMenu,
        title: {
            value: 'Selection',
            original: 'Selection',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mSelection', comment: ['&& denotes a mnemonic'] }, "&&Selection")
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarViewMenu,
        title: {
            value: 'View',
            original: 'View',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarGoMenu,
        title: {
            value: 'Go',
            original: 'Go',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Go")
        },
        order: 5
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarTerminalMenu,
        title: {
            value: 'Terminal',
            original: 'Terminal',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal")
        },
        order: 7
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarHelpMenu,
        title: {
            value: 'Help',
            original: 'Help',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")
        },
        order: 8
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarPreferencesMenu,
        title: {
            value: 'Preferences',
            original: 'Preferences',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mPreferences', comment: ['&& denotes a mnemonic'] }, "Preferences")
        },
        when: contextkeys_1.IsMacNativeContext,
        order: 9
    });
    class MenubarControl extends lifecycle_1.Disposable {
        static { this.MAX_MENU_RECENT_ENTRIES = 10; }
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService) {
            super();
            this.menuService = menuService;
            this.workspacesService = workspacesService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.labelService = labelService;
            this.updateService = updateService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.preferencesService = preferencesService;
            this.environmentService = environmentService;
            this.accessibilityService = accessibilityService;
            this.hostService = hostService;
            this.commandService = commandService;
            this.keys = [
                'window.menuBarVisibility',
                'window.enableMenuBarMnemonics',
                'window.customMenuBarAltFocus',
                'workbench.sideBar.location',
                'window.nativeTabs'
            ];
            this.menus = {};
            this.topLevelTitles = {};
            this.recentlyOpened = { files: [], workspaces: [] };
            this.mainMenu = this._register(this.menuService.createMenu(actions_1.MenuId.MenubarMainMenu, this.contextKeyService));
            this.mainMenuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.setupMainMenu();
            this.menuUpdater = this._register(new async_1.RunOnceScheduler(() => this.doUpdateMenubar(false), 200));
            this.notifyUserOfCustomMenubarAccessibility();
        }
        registerListeners() {
            // Listen for window focus changes
            this._register(this.hostService.onDidChangeFocus(e => this.onDidChangeWindowFocus(e)));
            // Update when config changes
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            // Listen to update service
            this.updateService.onStateChange(() => this.onUpdateStateChange());
            // Listen for changes in recently opened menu
            this._register(this.workspacesService.onDidChangeRecentlyOpened(() => { this.onDidChangeRecentlyOpened(); }));
            // Listen to keybindings change
            this._register(this.keybindingService.onDidUpdateKeybindings(() => this.updateMenubar()));
            // Update recent menu items on formatter registration
            this._register(this.labelService.onDidChangeFormatters(() => { this.onDidChangeRecentlyOpened(); }));
            // Listen for changes on the main menu
            this._register(this.mainMenu.onDidChange(() => { this.setupMainMenu(); this.doUpdateMenubar(true); }));
        }
        setupMainMenu() {
            this.mainMenuDisposables.clear();
            this.menus = {};
            this.topLevelTitles = {};
            const [, mainMenuActions] = this.mainMenu.getActions()[0];
            for (const mainMenuAction of mainMenuActions) {
                if (mainMenuAction instanceof actions_1.SubmenuItemAction && typeof mainMenuAction.item.title !== 'string') {
                    this.menus[mainMenuAction.item.title.original] = this.mainMenuDisposables.add(this.menuService.createMenu(mainMenuAction.item.submenu, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
                    this.topLevelTitles[mainMenuAction.item.title.original] = mainMenuAction.item.title.mnemonicTitle ?? mainMenuAction.item.title.value;
                }
            }
        }
        updateMenubar() {
            this.menuUpdater.schedule();
        }
        calculateActionLabel(action) {
            const label = action.label;
            switch (action.id) {
                default:
                    break;
            }
            return label;
        }
        onUpdateStateChange() {
            this.updateMenubar();
        }
        onUpdateKeybindings() {
            this.updateMenubar();
        }
        getOpenRecentActions() {
            if (!this.recentlyOpened) {
                return [];
            }
            const { workspaces, files } = this.recentlyOpened;
            const result = [];
            if (workspaces.length > 0) {
                for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < workspaces.length; i++) {
                    result.push(this.createOpenRecentMenuAction(workspaces[i]));
                }
                result.push(new actions_2.Separator());
            }
            if (files.length > 0) {
                for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < files.length; i++) {
                    result.push(this.createOpenRecentMenuAction(files[i]));
                }
                result.push(new actions_2.Separator());
            }
            return result;
        }
        onDidChangeWindowFocus(hasFocus) {
            // When we regain focus, update the recent menu items
            if (hasFocus) {
                this.onDidChangeRecentlyOpened();
            }
        }
        onConfigurationUpdated(event) {
            if (this.keys.some(key => event.affectsConfiguration(key))) {
                this.updateMenubar();
            }
            if (event.affectsConfiguration('editor.accessibilitySupport')) {
                this.notifyUserOfCustomMenubarAccessibility();
            }
            // Since we try not update when hidden, we should
            // try to update the recently opened list on visibility changes
            if (event.affectsConfiguration('window.menuBarVisibility')) {
                this.onDidChangeRecentlyOpened();
            }
        }
        get menubarHidden() {
            return platform_1.isMacintosh && platform_1.isNative ? false : (0, window_1.getMenuBarVisibility)(this.configurationService) === 'hidden';
        }
        onDidChangeRecentlyOpened() {
            // Do not update recently opened when the menubar is hidden #108712
            if (!this.menubarHidden) {
                this.workspacesService.getRecentlyOpened().then(recentlyOpened => {
                    this.recentlyOpened = recentlyOpened;
                    this.updateMenubar();
                });
            }
        }
        createOpenRecentMenuAction(recent) {
            let label;
            let uri;
            let commandId;
            let openable;
            const remoteAuthority = recent.remoteAuthority;
            if ((0, workspaces_1.isRecentFolder)(recent)) {
                uri = recent.folderUri;
                label = recent.label || this.labelService.getWorkspaceLabel(uri, { verbose: 2 /* Verbosity.LONG */ });
                commandId = 'openRecentFolder';
                openable = { folderUri: uri };
            }
            else if ((0, workspaces_1.isRecentWorkspace)(recent)) {
                uri = recent.workspace.configPath;
                label = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                commandId = 'openRecentWorkspace';
                openable = { workspaceUri: uri };
            }
            else {
                uri = recent.fileUri;
                label = recent.label || this.labelService.getUriLabel(uri);
                commandId = 'openRecentFile';
                openable = { fileUri: uri };
            }
            const ret = (0, actions_2.toAction)({
                id: commandId, label: (0, labels_1.unmnemonicLabel)(label), run: (browserEvent) => {
                    const openInNewWindow = browserEvent && ((!platform_1.isMacintosh && (browserEvent.ctrlKey || browserEvent.shiftKey)) || (platform_1.isMacintosh && (browserEvent.metaKey || browserEvent.altKey)));
                    return this.hostService.openWindow([openable], {
                        forceNewWindow: !!openInNewWindow,
                        remoteAuthority: remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                    });
                }
            });
            return Object.assign(ret, { uri, remoteAuthority });
        }
        notifyUserOfCustomMenubarAccessibility() {
            if (platform_1.isWeb || platform_1.isMacintosh) {
                return;
            }
            const hasBeenNotified = this.storageService.getBoolean('menubar/accessibleMenubarNotified', -1 /* StorageScope.APPLICATION */, false);
            const usingCustomMenubar = (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom';
            if (hasBeenNotified || usingCustomMenubar || !this.accessibilityService.isScreenReaderOptimized()) {
                return;
            }
            const message = (0, nls_1.localize)('menubar.customTitlebarAccessibilityNotification', "Accessibility support is enabled for you. For the most accessible experience, we recommend the custom title bar style.");
            this.notificationService.prompt(notification_1.Severity.Info, message, [
                {
                    label: (0, nls_1.localize)('goToSetting', "Open Settings"),
                    run: () => {
                        return this.preferencesService.openUserSettings({ query: 'window.titleBarStyle' });
                    }
                }
            ]);
            this.storageService.store('menubar/accessibleMenubarNotified', true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    }
    exports.MenubarControl = MenubarControl;
    let CustomMenubarControl = class CustomMenubarControl extends MenubarControl {
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, layoutService, telemetryService, hostService, commandService) {
            super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
            this.layoutService = layoutService;
            this.telemetryService = telemetryService;
            this.alwaysOnMnemonics = false;
            this.focusInsideMenubar = false;
            this.pendingFirstTimeUpdate = false;
            this.visible = true;
            this.webNavigationMenu = this._register(this.menuService.createMenu(actions_1.MenuId.MenubarHomeMenu, this.contextKeyService));
            this.reinstallDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onVisibilityChange = this._register(new event_1.Emitter());
            this._onFocusStateChange = this._register(new event_1.Emitter());
            this.actionRunner = this._register(new actions_2.ActionRunner());
            this.actionRunner.onDidRun(e => {
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'menu' });
            });
            this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
                this.recentlyOpened = recentlyOpened;
            });
            this.registerListeners();
            this.registerActions();
        }
        doUpdateMenubar(firstTime) {
            if (!this.focusInsideMenubar) {
                this.setupCustomMenubar(firstTime);
            }
            if (firstTime) {
                this.pendingFirstTimeUpdate = true;
            }
        }
        registerActions() {
            const that = this;
            if (platform_1.isWeb) {
                this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: `workbench.actions.menubar.focus`,
                            title: { value: (0, nls_1.localize)('focusMenu', "Focus Application Menu"), original: 'Focus Application Menu' },
                            keybinding: {
                                primary: 512 /* KeyMod.Alt */ | 68 /* KeyCode.F10 */,
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when: contextkeys_1.IsWebContext
                            },
                            f1: true
                        });
                    }
                    async run() {
                        that.menubar?.toggleFocus();
                    }
                }));
            }
        }
        getUpdateAction() {
            const state = this.updateService.state;
            switch (state.type) {
                case "idle" /* StateType.Idle */:
                    return new actions_2.Action('update.check', (0, nls_1.localize)({ key: 'checkForUpdates', comment: ['&& denotes a mnemonic'] }, "Check for &&Updates..."), undefined, true, () => this.updateService.checkForUpdates(true));
                case "checking for updates" /* StateType.CheckingForUpdates */:
                    return new actions_2.Action('update.checking', (0, nls_1.localize)('checkingForUpdates', "Checking for Updates..."), undefined, false);
                case "available for download" /* StateType.AvailableForDownload */:
                    return new actions_2.Action('update.downloadNow', (0, nls_1.localize)({ key: 'download now', comment: ['&& denotes a mnemonic'] }, "D&&ownload Update"), undefined, true, () => this.updateService.downloadUpdate());
                case "downloading" /* StateType.Downloading */:
                    return new actions_2.Action('update.downloading', (0, nls_1.localize)('DownloadingUpdate', "Downloading Update..."), undefined, false);
                case "downloaded" /* StateType.Downloaded */:
                    return new actions_2.Action('update.install', (0, nls_1.localize)({ key: 'installUpdate...', comment: ['&& denotes a mnemonic'] }, "Install &&Update..."), undefined, true, () => this.updateService.applyUpdate());
                case "updating" /* StateType.Updating */:
                    return new actions_2.Action('update.updating', (0, nls_1.localize)('installingUpdate', "Installing Update..."), undefined, false);
                case "ready" /* StateType.Ready */:
                    return new actions_2.Action('update.restart', (0, nls_1.localize)({ key: 'restartToUpdate', comment: ['&& denotes a mnemonic'] }, "Restart to &&Update"), undefined, true, () => this.updateService.quitAndInstall());
                default:
                    return null;
            }
        }
        get currentMenubarVisibility() {
            return (0, window_1.getMenuBarVisibility)(this.configurationService);
        }
        get currentDisableMenuBarAltFocus() {
            const settingValue = this.configurationService.getValue('window.customMenuBarAltFocus');
            let disableMenuBarAltBehavior = false;
            if (typeof settingValue === 'boolean') {
                disableMenuBarAltBehavior = !settingValue;
            }
            return disableMenuBarAltBehavior;
        }
        insertActionsBefore(nextAction, target) {
            switch (nextAction.id) {
                case windowActions_1.OpenRecentAction.ID:
                    target.push(...this.getOpenRecentActions());
                    break;
                case 'workbench.action.showAboutDialog':
                    if (!platform_1.isMacintosh && !platform_1.isWeb) {
                        const updateAction = this.getUpdateAction();
                        if (updateAction) {
                            updateAction.label = (0, labels_1.mnemonicMenuLabel)(updateAction.label);
                            target.push(updateAction);
                            target.push(new actions_2.Separator());
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        get currentEnableMenuBarMnemonics() {
            let enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
            if (typeof enableMenuBarMnemonics !== 'boolean') {
                enableMenuBarMnemonics = true;
            }
            return enableMenuBarMnemonics && (!platform_1.isWeb || (0, browser_1.isFullscreen)());
        }
        get currentCompactMenuMode() {
            if (this.currentMenubarVisibility !== 'compact') {
                return undefined;
            }
            // Menu bar lives in activity bar and should flow based on its location
            const currentSidebarLocation = this.configurationService.getValue('workbench.sideBar.location');
            return currentSidebarLocation === 'right' ? menu_1.Direction.Left : menu_1.Direction.Right;
        }
        onDidVisibilityChange(visible) {
            this.visible = visible;
            this.onDidChangeRecentlyOpened();
            this._onVisibilityChange.fire(visible);
        }
        toActionsArray(menu) {
            const result = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result);
            return result;
        }
        setupCustomMenubar(firstTime) {
            // If there is no container, we cannot setup the menubar
            if (!this.container) {
                return;
            }
            if (firstTime) {
                // Reset and create new menubar
                if (this.menubar) {
                    this.reinstallDisposables.clear();
                }
                this.menubar = this.reinstallDisposables.add(new menubar_1.MenuBar(this.container, this.getMenuBarOptions(), defaultStyles_1.defaultMenuStyles));
                this.accessibilityService.alwaysUnderlineAccessKeys().then(val => {
                    this.alwaysOnMnemonics = val;
                    this.menubar?.update(this.getMenuBarOptions());
                });
                this.reinstallDisposables.add(this.menubar.onFocusStateChange(focused => {
                    this._onFocusStateChange.fire(focused);
                    // When the menubar loses focus, update it to clear any pending updates
                    if (!focused) {
                        if (this.pendingFirstTimeUpdate) {
                            this.setupCustomMenubar(true);
                            this.pendingFirstTimeUpdate = false;
                        }
                        else {
                            this.updateMenubar();
                        }
                        this.focusInsideMenubar = false;
                    }
                }));
                this.reinstallDisposables.add(this.menubar.onVisibilityChange(e => this.onDidVisibilityChange(e)));
                // Before we focus the menubar, stop updates to it so that focus-related context keys will work
                this.reinstallDisposables.add((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.FOCUS_IN, () => {
                    this.focusInsideMenubar = true;
                }));
                this.reinstallDisposables.add((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.FOCUS_OUT, () => {
                    this.focusInsideMenubar = false;
                }));
                // Fire visibility change for the first install if menu is shown
                if (this.menubar.isVisible) {
                    this.onDidVisibilityChange(true);
                }
            }
            else {
                this.menubar?.update(this.getMenuBarOptions());
            }
            // Update the menu actions
            const updateActions = (menuActions, target, topLevelTitle) => {
                target.splice(0);
                for (const menuItem of menuActions) {
                    this.insertActionsBefore(menuItem, target);
                    if (menuItem instanceof actions_2.Separator) {
                        target.push(menuItem);
                    }
                    else if (menuItem instanceof actions_1.SubmenuItemAction || menuItem instanceof actions_1.MenuItemAction) {
                        // use mnemonicTitle whenever possible
                        let title = typeof menuItem.item.title === 'string'
                            ? menuItem.item.title
                            : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                        if (menuItem instanceof actions_1.SubmenuItemAction) {
                            const submenuActions = [];
                            updateActions(menuItem.actions, submenuActions, topLevelTitle);
                            if (submenuActions.length > 0) {
                                target.push(new actions_2.SubmenuAction(menuItem.id, (0, labels_1.mnemonicMenuLabel)(title), submenuActions));
                            }
                        }
                        else {
                            if ((0, action_1.isICommandActionToggleInfo)(menuItem.item.toggled)) {
                                title = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                            }
                            const newAction = new actions_2.Action(menuItem.id, (0, labels_1.mnemonicMenuLabel)(title), menuItem.class, menuItem.enabled, () => this.commandService.executeCommand(menuItem.id));
                            newAction.tooltip = menuItem.tooltip;
                            newAction.checked = menuItem.checked;
                            target.push(newAction);
                        }
                    }
                }
                // Append web navigation menu items to the file menu when not compact
                if (topLevelTitle === 'File' && this.currentCompactMenuMode === undefined) {
                    const webActions = this.getWebNavigationActions();
                    if (webActions.length) {
                        target.push(...webActions);
                    }
                }
            };
            for (const title of Object.keys(this.topLevelTitles)) {
                const menu = this.menus[title];
                if (firstTime && menu) {
                    this.reinstallDisposables.add(menu.onDidChange(() => {
                        if (!this.focusInsideMenubar) {
                            const actions = [];
                            updateActions(this.toActionsArray(menu), actions, title);
                            this.menubar?.updateMenu({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                        }
                    }));
                    // For the file menu, we need to update if the web nav menu updates as well
                    if (menu === this.menus.File) {
                        this.reinstallDisposables.add(this.webNavigationMenu.onDidChange(() => {
                            if (!this.focusInsideMenubar) {
                                const actions = [];
                                updateActions(this.toActionsArray(menu), actions, title);
                                this.menubar?.updateMenu({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                            }
                        }));
                    }
                }
                const actions = [];
                if (menu) {
                    updateActions(this.toActionsArray(menu), actions, title);
                }
                if (this.menubar) {
                    if (!firstTime) {
                        this.menubar.updateMenu({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                    }
                    else {
                        this.menubar.push({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                    }
                }
            }
        }
        getWebNavigationActions() {
            if (!platform_1.isWeb) {
                return []; // only for web
            }
            const webNavigationActions = [];
            for (const groups of this.webNavigationMenu.getActions()) {
                const [, actions] = groups;
                for (const action of actions) {
                    if (action instanceof actions_1.MenuItemAction) {
                        const title = typeof action.item.title === 'string'
                            ? action.item.title
                            : action.item.title.mnemonicTitle ?? action.item.title.value;
                        webNavigationActions.push(new actions_2.Action(action.id, (0, labels_1.mnemonicMenuLabel)(title), action.class, action.enabled, async (event) => {
                            this.commandService.executeCommand(action.id, event);
                        }));
                    }
                }
                webNavigationActions.push(new actions_2.Separator());
            }
            if (webNavigationActions.length) {
                webNavigationActions.pop();
            }
            return webNavigationActions;
        }
        getMenuBarOptions() {
            return {
                enableMnemonics: this.currentEnableMenuBarMnemonics,
                disableAltFocus: this.currentDisableMenuBarAltFocus,
                visibility: this.currentMenubarVisibility,
                actionRunner: this.actionRunner,
                getKeybinding: (action) => this.keybindingService.lookupKeybinding(action.id),
                alwaysOnMnemonics: this.alwaysOnMnemonics,
                compactMode: this.currentCompactMenuMode,
                getCompactMenuActions: () => {
                    if (!platform_1.isWeb) {
                        return []; // only for web
                    }
                    return this.getWebNavigationActions();
                }
            };
        }
        onDidChangeWindowFocus(hasFocus) {
            if (!this.visible) {
                return;
            }
            super.onDidChangeWindowFocus(hasFocus);
            if (this.container) {
                if (hasFocus) {
                    this.container.classList.remove('inactive');
                }
                else {
                    this.container.classList.add('inactive');
                    this.menubar?.blur();
                }
            }
        }
        onUpdateStateChange() {
            if (!this.visible) {
                return;
            }
            super.onUpdateStateChange();
        }
        onDidChangeRecentlyOpened() {
            if (!this.visible) {
                return;
            }
            super.onDidChangeRecentlyOpened();
        }
        onUpdateKeybindings() {
            if (!this.visible) {
                return;
            }
            super.onUpdateKeybindings();
        }
        registerListeners() {
            super.registerListeners();
            this._register((0, dom_1.addDisposableListener)(window, dom_1.EventType.RESIZE, () => {
                if (this.menubar && !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)) {
                    this.menubar.blur();
                }
            }));
            // Mnemonics require fullscreen in web
            if (platform_1.isWeb) {
                this._register(this.layoutService.onDidChangeFullscreen(e => this.updateMenubar()));
                this._register(this.webNavigationMenu.onDidChange(() => this.updateMenubar()));
            }
        }
        get onVisibilityChange() {
            return this._onVisibilityChange.event;
        }
        get onFocusStateChange() {
            return this._onFocusStateChange.event;
        }
        getMenubarItemsDimensions() {
            if (this.menubar) {
                return new dom_1.Dimension(this.menubar.getWidth(), this.menubar.getHeight());
            }
            return new dom_1.Dimension(0, 0);
        }
        create(parent) {
            this.container = parent;
            // Build the menubar
            if (this.container) {
                this.doUpdateMenubar(true);
            }
            return this.container;
        }
        layout(dimension) {
            this.menubar?.update(this.getMenuBarOptions());
        }
        toggleFocus() {
            this.menubar?.toggleFocus();
        }
    };
    exports.CustomMenubarControl = CustomMenubarControl;
    exports.CustomMenubarControl = CustomMenubarControl = __decorate([
        __param(0, actions_1.IMenuService),
        __param(1, workspaces_1.IWorkspacesService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, label_1.ILabelService),
        __param(6, update_1.IUpdateService),
        __param(7, storage_1.IStorageService),
        __param(8, notification_1.INotificationService),
        __param(9, preferences_1.IPreferencesService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, accessibility_1.IAccessibilityService),
        __param(12, layoutService_1.IWorkbenchLayoutService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, host_1.IHostService),
        __param(15, commands_1.ICommandService)
    ], CustomMenubarControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhckNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy90aXRsZWJhci9tZW51YmFyQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyQ2hHLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsZUFBZSxFQUFFO1FBQ25ELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGVBQWU7UUFDL0IsS0FBSyxFQUFFO1lBQ04sS0FBSyxFQUFFLE1BQU07WUFDYixRQUFRLEVBQUUsTUFBTTtZQUNoQixhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7U0FDdkY7UUFDRCxLQUFLLEVBQUUsQ0FBQztLQUNSLENBQUMsQ0FBQztJQUVILHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsZUFBZSxFQUFFO1FBQ25ELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGVBQWU7UUFDL0IsS0FBSyxFQUFFO1lBQ04sS0FBSyxFQUFFLE1BQU07WUFDYixRQUFRLEVBQUUsTUFBTTtZQUNoQixhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7U0FDdkY7UUFDRCxLQUFLLEVBQUUsQ0FBQztLQUNSLENBQUMsQ0FBQztJQUVILHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsZUFBZSxFQUFFO1FBQ25ELE9BQU8sRUFBRSxnQkFBTSxDQUFDLG9CQUFvQjtRQUNwQyxLQUFLLEVBQUU7WUFDTixLQUFLLEVBQUUsV0FBVztZQUNsQixRQUFRLEVBQUUsV0FB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