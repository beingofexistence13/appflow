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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/actions/common/actions", "vs/platform/window/common/window", "vs/platform/contextkey/common/contextkey", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/workspaces/common/workspaces", "vs/base/common/async", "vs/platform/label/common/label", "vs/platform/update/common/update", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/base/browser/ui/menu/menubar", "vs/base/browser/ui/menu/menu", "vs/base/common/labels", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/layout/browser/layoutService", "vs/base/browser/browser", "vs/workbench/services/host/browser/host", "vs/base/browser/canIUse", "vs/platform/contextkey/common/contextkeys", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/actions/windowActions", "vs/platform/action/common/action", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/menubarControl"], function (require, exports, nls_1, actions_1, window_1, contextkey_1, actions_2, dom_1, keybinding_1, platform_1, configuration_1, event_1, lifecycle_1, workspaces_1, async_1, label_1, update_1, storage_1, notification_1, preferences_1, environmentService_1, menubar_1, menu_1, labels_1, accessibility_1, layoutService_1, browser_1, host_1, canIUse_1, contextkeys_1, commands_1, telemetry_1, windowActions_1, action_1, menuEntryActionViewItem_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3xb = exports.$2xb = void 0;
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarFileMenu,
        title: {
            value: 'File',
            original: 'File',
            mnemonicTitle: (0, nls_1.localize)(0, null),
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarEditMenu,
        title: {
            value: 'Edit',
            original: 'Edit',
            mnemonicTitle: (0, nls_1.localize)(1, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarSelectionMenu,
        title: {
            value: 'Selection',
            original: 'Selection',
            mnemonicTitle: (0, nls_1.localize)(2, null)
        },
        order: 3
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarViewMenu,
        title: {
            value: 'View',
            original: 'View',
            mnemonicTitle: (0, nls_1.localize)(3, null)
        },
        order: 4
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarGoMenu,
        title: {
            value: 'Go',
            original: 'Go',
            mnemonicTitle: (0, nls_1.localize)(4, null)
        },
        order: 5
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarTerminalMenu,
        title: {
            value: 'Terminal',
            original: 'Terminal',
            mnemonicTitle: (0, nls_1.localize)(5, null)
        },
        order: 7
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarHelpMenu,
        title: {
            value: 'Help',
            original: 'Help',
            mnemonicTitle: (0, nls_1.localize)(6, null)
        },
        order: 8
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarMainMenu, {
        submenu: actions_1.$Ru.MenubarPreferencesMenu,
        title: {
            value: 'Preferences',
            original: 'Preferences',
            mnemonicTitle: (0, nls_1.localize)(7, null)
        },
        when: contextkeys_1.$33,
        order: 9
    });
    class $2xb extends lifecycle_1.$kc {
        static { this.m = 10; }
        constructor(n, r, s, t, u, w, y, z, C, D, F, G, H, I) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.a = [
                'window.menuBarVisibility',
                'window.enableMenuBarMnemonics',
                'window.customMenuBarAltFocus',
                'workbench.sideBar.location',
                'window.nativeTabs'
            ];
            this.c = {};
            this.f = {};
            this.h = { files: [], workspaces: [] };
            this.b = this.B(this.n.createMenu(actions_1.$Ru.MenubarMainMenu, this.s));
            this.g = this.B(new lifecycle_1.$jc());
            this.M();
            this.j = this.B(new async_1.$Sg(() => this.J(false), 200));
            this.Z();
        }
        L() {
            // Listen for window focus changes
            this.B(this.H.onDidChangeFocus(e => this.S(e)));
            // Update when config changes
            this.B(this.u.onDidChangeConfiguration(e => this.U(e)));
            // Listen to update service
            this.y.onStateChange(() => this.P());
            // Listen for changes in recently opened menu
            this.B(this.r.onDidChangeRecentlyOpened(() => { this.X(); }));
            // Listen to keybindings change
            this.B(this.t.onDidUpdateKeybindings(() => this.N()));
            // Update recent menu items on formatter registration
            this.B(this.w.onDidChangeFormatters(() => { this.X(); }));
            // Listen for changes on the main menu
            this.B(this.b.onDidChange(() => { this.M(); this.J(true); }));
        }
        M() {
            this.g.clear();
            this.c = {};
            this.f = {};
            const [, mainMenuActions] = this.b.getActions()[0];
            for (const mainMenuAction of mainMenuActions) {
                if (mainMenuAction instanceof actions_1.$Uu && typeof mainMenuAction.item.title !== 'string') {
                    this.c[mainMenuAction.item.title.original] = this.g.add(this.n.createMenu(mainMenuAction.item.submenu, this.s, { emitEventsForSubmenuChanges: true }));
                    this.f[mainMenuAction.item.title.original] = mainMenuAction.item.title.mnemonicTitle ?? mainMenuAction.item.title.value;
                }
            }
        }
        N() {
            this.j.schedule();
        }
        O(action) {
            const label = action.label;
            switch (action.id) {
                default:
                    break;
            }
            return label;
        }
        P() {
            this.N();
        }
        Q() {
            this.N();
        }
        R() {
            if (!this.h) {
                return [];
            }
            const { workspaces, files } = this.h;
            const result = [];
            if (workspaces.length > 0) {
                for (let i = 0; i < $2xb.m && i < workspaces.length; i++) {
                    result.push(this.Y(workspaces[i]));
                }
                result.push(new actions_2.$ii());
            }
            if (files.length > 0) {
                for (let i = 0; i < $2xb.m && i < files.length; i++) {
                    result.push(this.Y(files[i]));
                }
                result.push(new actions_2.$ii());
            }
            return result;
        }
        S(hasFocus) {
            // When we regain focus, update the recent menu items
            if (hasFocus) {
                this.X();
            }
        }
        U(event) {
            if (this.a.some(key => event.affectsConfiguration(key))) {
                this.N();
            }
            if (event.affectsConfiguration('editor.accessibilitySupport')) {
                this.Z();
            }
            // Since we try not update when hidden, we should
            // try to update the recently opened list on visibility changes
            if (event.affectsConfiguration('window.menuBarVisibility')) {
                this.X();
            }
        }
        get W() {
            return platform_1.$j && platform_1.$m ? false : (0, window_1.$TD)(this.u) === 'hidden';
        }
        X() {
            // Do not update recently opened when the menubar is hidden #108712
            if (!this.W) {
                this.r.getRecentlyOpened().then(recentlyOpened => {
                    this.h = recentlyOpened;
                    this.N();
                });
            }
        }
        Y(recent) {
            let label;
            let uri;
            let commandId;
            let openable;
            const remoteAuthority = recent.remoteAuthority;
            if ((0, workspaces_1.$hU)(recent)) {
                uri = recent.folderUri;
                label = recent.label || this.w.getWorkspaceLabel(uri, { verbose: 2 /* Verbosity.LONG */ });
                commandId = 'openRecentFolder';
                openable = { folderUri: uri };
            }
            else if ((0, workspaces_1.$gU)(recent)) {
                uri = recent.workspace.configPath;
                label = recent.label || this.w.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                commandId = 'openRecentWorkspace';
                openable = { workspaceUri: uri };
            }
            else {
                uri = recent.fileUri;
                label = recent.label || this.w.getUriLabel(uri);
                commandId = 'openRecentFile';
                openable = { fileUri: uri };
            }
            const ret = (0, actions_2.$li)({
                id: commandId, label: (0, labels_1.$mA)(label), run: (browserEvent) => {
                    const openInNewWindow = browserEvent && ((!platform_1.$j && (browserEvent.ctrlKey || browserEvent.shiftKey)) || (platform_1.$j && (browserEvent.metaKey || browserEvent.altKey)));
                    return this.H.openWindow([openable], {
                        forceNewWindow: !!openInNewWindow,
                        remoteAuthority: remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                    });
                }
            });
            return Object.assign(ret, { uri, remoteAuthority });
        }
        Z() {
            if (platform_1.$o || platform_1.$j) {
                return;
            }
            const hasBeenNotified = this.z.getBoolean('menubar/accessibleMenubarNotified', -1 /* StorageScope.APPLICATION */, false);
            const usingCustomMenubar = (0, window_1.$UD)(this.u) === 'custom';
            if (hasBeenNotified || usingCustomMenubar || !this.G.isScreenReaderOptimized()) {
                return;
            }
            const message = (0, nls_1.localize)(8, null);
            this.C.prompt(notification_1.Severity.Info, message, [
                {
                    label: (0, nls_1.localize)(9, null),
                    run: () => {
                        return this.D.openUserSettings({ query: 'window.titleBarStyle' });
                    }
                }
            ]);
            this.z.store('menubar/accessibleMenubarNotified', true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    }
    exports.$2xb = $2xb;
    let $3xb = class $3xb extends $2xb {
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, jb, kb, hostService, commandService) {
            super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
            this.jb = jb;
            this.kb = kb;
            this.bb = false;
            this.cb = false;
            this.db = false;
            this.eb = true;
            this.gb = this.B(this.n.createMenu(actions_1.$Ru.MenubarHomeMenu, this.s));
            this.vb = this.B(new lifecycle_1.$jc());
            this.hb = this.B(new event_1.$fd());
            this.ib = this.B(new event_1.$fd());
            this.fb = this.B(new actions_2.$hi());
            this.fb.onDidRun(e => {
                this.kb.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'menu' });
            });
            this.r.getRecentlyOpened().then((recentlyOpened) => {
                this.h = recentlyOpened;
            });
            this.L();
            this.mb();
        }
        J(firstTime) {
            if (!this.cb) {
                this.wb(firstTime);
            }
            if (firstTime) {
                this.db = true;
            }
        }
        mb() {
            const that = this;
            if (platform_1.$o) {
                this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: `workbench.actions.menubar.focus`,
                            title: { value: (0, nls_1.localize)(10, null), original: 'Focus Application Menu' },
                            keybinding: {
                                primary: 512 /* KeyMod.Alt */ | 68 /* KeyCode.F10 */,
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when: contextkeys_1.$23
                            },
                            f1: true
                        });
                    }
                    async run() {
                        that.$?.toggleFocus();
                    }
                }));
            }
        }
        nb() {
            const state = this.y.state;
            switch (state.type) {
                case "idle" /* StateType.Idle */:
                    return new actions_2.$gi('update.check', (0, nls_1.localize)(11, null), undefined, true, () => this.y.checkForUpdates(true));
                case "checking for updates" /* StateType.CheckingForUpdates */:
                    return new actions_2.$gi('update.checking', (0, nls_1.localize)(12, null), undefined, false);
                case "available for download" /* StateType.AvailableForDownload */:
                    return new actions_2.$gi('update.downloadNow', (0, nls_1.localize)(13, null), undefined, true, () => this.y.downloadUpdate());
                case "downloading" /* StateType.Downloading */:
                    return new actions_2.$gi('update.downloading', (0, nls_1.localize)(14, null), undefined, false);
                case "downloaded" /* StateType.Downloaded */:
                    return new actions_2.$gi('update.install', (0, nls_1.localize)(15, null), undefined, true, () => this.y.applyUpdate());
                case "updating" /* StateType.Updating */:
                    return new actions_2.$gi('update.updating', (0, nls_1.localize)(16, null), undefined, false);
                case "ready" /* StateType.Ready */:
                    return new actions_2.$gi('update.restart', (0, nls_1.localize)(17, null), undefined, true, () => this.y.quitAndInstall());
                default:
                    return null;
            }
        }
        get ob() {
            return (0, window_1.$TD)(this.u);
        }
        get pb() {
            const settingValue = this.u.getValue('window.customMenuBarAltFocus');
            let disableMenuBarAltBehavior = false;
            if (typeof settingValue === 'boolean') {
                disableMenuBarAltBehavior = !settingValue;
            }
            return disableMenuBarAltBehavior;
        }
        qb(nextAction, target) {
            switch (nextAction.id) {
                case windowActions_1.$1tb.ID:
                    target.push(...this.R());
                    break;
                case 'workbench.action.showAboutDialog':
                    if (!platform_1.$j && !platform_1.$o) {
                        const updateAction = this.nb();
                        if (updateAction) {
                            updateAction.label = (0, labels_1.$kA)(updateAction.label);
                            target.push(updateAction);
                            target.push(new actions_2.$ii());
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        get rb() {
            let enableMenuBarMnemonics = this.u.getValue('window.enableMenuBarMnemonics');
            if (typeof enableMenuBarMnemonics !== 'boolean') {
                enableMenuBarMnemonics = true;
            }
            return enableMenuBarMnemonics && (!platform_1.$o || (0, browser_1.$3N)());
        }
        get sb() {
            if (this.ob !== 'compact') {
                return undefined;
            }
            // Menu bar lives in activity bar and should flow based on its location
            const currentSidebarLocation = this.u.getValue('workbench.sideBar.location');
            return currentSidebarLocation === 'right' ? menu_1.Direction.Left : menu_1.Direction.Right;
        }
        tb(visible) {
            this.eb = visible;
            this.X();
            this.hb.fire(visible);
        }
        ub(menu) {
            const result = [];
            (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, result);
            return result;
        }
        wb(firstTime) {
            // If there is no container, we cannot setup the menubar
            if (!this.ab) {
                return;
            }
            if (firstTime) {
                // Reset and create new menubar
                if (this.$) {
                    this.vb.clear();
                }
                this.$ = this.vb.add(new menubar_1.$VR(this.ab, this.yb(), defaultStyles_1.$D2));
                this.G.alwaysUnderlineAccessKeys().then(val => {
                    this.bb = val;
                    this.$?.update(this.yb());
                });
                this.vb.add(this.$.onFocusStateChange(focused => {
                    this.ib.fire(focused);
                    // When the menubar loses focus, update it to clear any pending updates
                    if (!focused) {
                        if (this.db) {
                            this.wb(true);
                            this.db = false;
                        }
                        else {
                            this.N();
                        }
                        this.cb = false;
                    }
                }));
                this.vb.add(this.$.onVisibilityChange(e => this.tb(e)));
                // Before we focus the menubar, stop updates to it so that focus-related context keys will work
                this.vb.add((0, dom_1.$nO)(this.ab, dom_1.$3O.FOCUS_IN, () => {
                    this.cb = true;
                }));
                this.vb.add((0, dom_1.$nO)(this.ab, dom_1.$3O.FOCUS_OUT, () => {
                    this.cb = false;
                }));
                // Fire visibility change for the first install if menu is shown
                if (this.$.isVisible) {
                    this.tb(true);
                }
            }
            else {
                this.$?.update(this.yb());
            }
            // Update the menu actions
            const updateActions = (menuActions, target, topLevelTitle) => {
                target.splice(0);
                for (const menuItem of menuActions) {
                    this.qb(menuItem, target);
                    if (menuItem instanceof actions_2.$ii) {
                        target.push(menuItem);
                    }
                    else if (menuItem instanceof actions_1.$Uu || menuItem instanceof actions_1.$Vu) {
                        // use mnemonicTitle whenever possible
                        let title = typeof menuItem.item.title === 'string'
                            ? menuItem.item.title
                            : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                        if (menuItem instanceof actions_1.$Uu) {
                            const submenuActions = [];
                            updateActions(menuItem.actions, submenuActions, topLevelTitle);
                            if (submenuActions.length > 0) {
                                target.push(new actions_2.$ji(menuItem.id, (0, labels_1.$kA)(title), submenuActions));
                            }
                        }
                        else {
                            if ((0, action_1.$Ol)(menuItem.item.toggled)) {
                                title = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                            }
                            const newAction = new actions_2.$gi(menuItem.id, (0, labels_1.$kA)(title), menuItem.class, menuItem.enabled, () => this.I.executeCommand(menuItem.id));
                            newAction.tooltip = menuItem.tooltip;
                            newAction.checked = menuItem.checked;
                            target.push(newAction);
                        }
                    }
                }
                // Append web navigation menu items to the file menu when not compact
                if (topLevelTitle === 'File' && this.sb === undefined) {
                    const webActions = this.xb();
                    if (webActions.length) {
                        target.push(...webActions);
                    }
                }
            };
            for (const title of Object.keys(this.f)) {
                const menu = this.c[title];
                if (firstTime && menu) {
                    this.vb.add(menu.onDidChange(() => {
                        if (!this.cb) {
                            const actions = [];
                            updateActions(this.ub(menu), actions, title);
                            this.$?.updateMenu({ actions: actions, label: (0, labels_1.$kA)(this.f[title]) });
                        }
                    }));
                    // For the file menu, we need to update if the web nav menu updates as well
                    if (menu === this.c.File) {
                        this.vb.add(this.gb.onDidChange(() => {
                            if (!this.cb) {
                                const actions = [];
                                updateActions(this.ub(menu), actions, title);
                                this.$?.updateMenu({ actions: actions, label: (0, labels_1.$kA)(this.f[title]) });
                            }
                        }));
                    }
                }
                const actions = [];
                if (menu) {
                    updateActions(this.ub(menu), actions, title);
                }
                if (this.$) {
                    if (!firstTime) {
                        this.$.updateMenu({ actions: actions, label: (0, labels_1.$kA)(this.f[title]) });
                    }
                    else {
                        this.$.push({ actions: actions, label: (0, labels_1.$kA)(this.f[title]) });
                    }
                }
            }
        }
        xb() {
            if (!platform_1.$o) {
                return []; // only for web
            }
            const webNavigationActions = [];
            for (const groups of this.gb.getActions()) {
                const [, actions] = groups;
                for (const action of actions) {
                    if (action instanceof actions_1.$Vu) {
                        const title = typeof action.item.title === 'string'
                            ? action.item.title
                            : action.item.title.mnemonicTitle ?? action.item.title.value;
                        webNavigationActions.push(new actions_2.$gi(action.id, (0, labels_1.$kA)(title), action.class, action.enabled, async (event) => {
                            this.I.executeCommand(action.id, event);
                        }));
                    }
                }
                webNavigationActions.push(new actions_2.$ii());
            }
            if (webNavigationActions.length) {
                webNavigationActions.pop();
            }
            return webNavigationActions;
        }
        yb() {
            return {
                enableMnemonics: this.rb,
                disableAltFocus: this.pb,
                visibility: this.ob,
                actionRunner: this.fb,
                getKeybinding: (action) => this.t.lookupKeybinding(action.id),
                alwaysOnMnemonics: this.bb,
                compactMode: this.sb,
                getCompactMenuActions: () => {
                    if (!platform_1.$o) {
                        return []; // only for web
                    }
                    return this.xb();
                }
            };
        }
        S(hasFocus) {
            if (!this.eb) {
                return;
            }
            super.S(hasFocus);
            if (this.ab) {
                if (hasFocus) {
                    this.ab.classList.remove('inactive');
                }
                else {
                    this.ab.classList.add('inactive');
                    this.$?.blur();
                }
            }
        }
        P() {
            if (!this.eb) {
                return;
            }
            super.P();
        }
        X() {
            if (!this.eb) {
                return;
            }
            super.X();
        }
        Q() {
            if (!this.eb) {
                return;
            }
            super.Q();
        }
        L() {
            super.L();
            this.B((0, dom_1.$nO)(window, dom_1.$3O.RESIZE, () => {
                if (this.$ && !(platform_1.$q && canIUse_1.$bO.pointerEvents)) {
                    this.$.blur();
                }
            }));
            // Mnemonics require fullscreen in web
            if (platform_1.$o) {
                this.B(this.jb.onDidChangeFullscreen(e => this.N()));
                this.B(this.gb.onDidChange(() => this.N()));
            }
        }
        get onVisibilityChange() {
            return this.hb.event;
        }
        get onFocusStateChange() {
            return this.ib.event;
        }
        getMenubarItemsDimensions() {
            if (this.$) {
                return new dom_1.$BO(this.$.getWidth(), this.$.getHeight());
            }
            return new dom_1.$BO(0, 0);
        }
        create(parent) {
            this.ab = parent;
            // Build the menubar
            if (this.ab) {
                this.J(true);
            }
            return this.ab;
        }
        layout(dimension) {
            this.$?.update(this.yb());
        }
        toggleFocus() {
            this.$?.toggleFocus();
        }
    };
    exports.$3xb = $3xb;
    exports.$3xb = $3xb = __decorate([
        __param(0, actions_1.$Su),
        __param(1, workspaces_1.$fU),
        __param(2, contextkey_1.$3i),
        __param(3, keybinding_1.$2D),
        __param(4, configuration_1.$8h),
        __param(5, label_1.$Vz),
        __param(6, update_1.$UT),
        __param(7, storage_1.$Vo),
        __param(8, notification_1.$Yu),
        __param(9, preferences_1.$BE),
        __param(10, environmentService_1.$hJ),
        __param(11, accessibility_1.$1r),
        __param(12, layoutService_1.$Meb),
        __param(13, telemetry_1.$9k),
        __param(14, host_1.$VT),
        __param(15, commands_1.$Fr)
    ], $3xb);
});
//# sourceMappingURL=menubarControl.js.map