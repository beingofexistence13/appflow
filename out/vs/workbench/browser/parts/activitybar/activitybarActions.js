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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/compositeBarActions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/theme", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/common/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/hover/browser/hover", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/browser/mouseEvent", "vs/platform/log/common/log", "vs/platform/secrets/common/secrets", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/async", "vs/base/common/lazy", "vs/css!./media/activityaction"], function (require, exports, nls_1, dom_1, keyboardEvent_1, touch_1, actions_1, lifecycle_1, actions_2, contextView_1, telemetry_1, colorRegistry_1, themeService_1, compositeBarActions_1, actionCommonCategories_1, theme_1, layoutService_1, contextkey_1, menuEntryActionViewItem_1, authenticationService_1, authentication_1, environmentService_1, configuration_1, productService_1, storage_1, hover_1, keybinding_1, panecomposite_1, userDataProfile_1, mouseEvent_1, log_1, secrets_1, lifecycle_2, async_1, lazy_1) {
    "use strict";
    var ViewContainerActivityAction_1, AccountsActivityActionViewItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlaceHolderToggleCompositeBadgeAction = exports.PlaceHolderToggleCompositePinnedAction = exports.PlaceHolderViewContainerActivityAction = exports.GlobalActivityActionViewItem = exports.AccountsActivityActionViewItem = exports.ViewContainerActivityAction = void 0;
    let ViewContainerActivityAction = class ViewContainerActivityAction extends compositeBarActions_1.ActivityAction {
        static { ViewContainerActivityAction_1 = this; }
        static { this.preventDoubleClickDelay = 300; }
        constructor(activity, paneCompositePart, layoutService, telemetryService, configurationService) {
            super(activity);
            this.paneCompositePart = paneCompositePart;
            this.layoutService = layoutService;
            this.telemetryService = telemetryService;
            this.configurationService = configurationService;
            this.lastRun = 0;
        }
        updateActivity(activity) {
            this.activity = activity;
        }
        async run(event) {
            if (event instanceof MouseEvent && event.button === 2) {
                return; // do not run on right click
            }
            // prevent accident trigger on a doubleclick (to help nervous people)
            const now = Date.now();
            if (now > this.lastRun /* https://github.com/microsoft/vscode/issues/25830 */ && now - this.lastRun < ViewContainerActivityAction_1.preventDoubleClickDelay) {
                return;
            }
            this.lastRun = now;
            const sideBarVisible = this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const activeViewlet = this.paneCompositePart.getActivePaneComposite();
            const focusBehavior = this.configurationService.getValue('workbench.activityBar.iconClickBehavior');
            const focus = (event && 'preserveFocus' in event) ? !event.preserveFocus : true;
            if (sideBarVisible && activeViewlet?.getId() === this.activity.id) {
                switch (focusBehavior) {
                    case 'focus':
                        this.logAction('refocus');
                        this.paneCompositePart.openPaneComposite(this.activity.id, focus);
                        break;
                    case 'toggle':
                    default:
                        // Hide sidebar if selected viewlet already visible
                        this.logAction('hide');
                        this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                        break;
                }
                return;
            }
            this.logAction('show');
            await this.paneCompositePart.openPaneComposite(this.activity.id, focus);
            return this.activate();
        }
        logAction(action) {
            this.telemetryService.publicLog2('activityBarAction', { viewletId: this.activity.id, action });
        }
    };
    exports.ViewContainerActivityAction = ViewContainerActivityAction;
    exports.ViewContainerActivityAction = ViewContainerActivityAction = ViewContainerActivityAction_1 = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, configuration_1.IConfigurationService)
    ], ViewContainerActivityAction);
    let AbstractGlobalActivityActionViewItem = class AbstractGlobalActivityActionViewItem extends compositeBarActions_1.ActivityActionViewItem {
        constructor(action, contextMenuActionsProvider, options, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
            super(action, options, () => true, themeService, hoverService, configurationService, keybindingService);
            this.contextMenuActionsProvider = contextMenuActionsProvider;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.environmentService = environmentService;
        }
        render(container) {
            super.render(container);
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_DOWN, async (e) => {
                dom_1.EventHelper.stop(e, true);
                const isLeftClick = e?.button !== 2;
                // Left-click run
                if (isLeftClick) {
                    this.run();
                }
            }));
            // The rest of the activity bar uses context menu event for the context menu, so we match this
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.CONTEXT_MENU, async (e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const actions = await this.resolveContextMenuActions(disposables);
                const event = new mouseEvent_1.StandardMouseEvent(e);
                this.contextMenuService.showContextMenu({
                    getAnchor: () => event,
                    getActions: () => actions,
                    onHide: () => disposables.dispose()
                });
            }));
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom_1.EventHelper.stop(e, true);
                    this.run();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.container, touch_1.EventType.Tap, (e) => {
                dom_1.EventHelper.stop(e, true);
                this.run();
            }));
        }
        async resolveContextMenuActions(disposables) {
            return this.contextMenuActionsProvider();
        }
    };
    AbstractGlobalActivityActionViewItem = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, hover_1.IHoverService),
        __param(5, actions_2.IMenuService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, environmentService_1.IWorkbenchEnvironmentService),
        __param(10, keybinding_1.IKeybindingService)
    ], AbstractGlobalActivityActionViewItem);
    let MenuActivityActionViewItem = class MenuActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
        constructor(menuId, action, contextMenuActionsProvider, icon, colors, hoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
            super(action, contextMenuActionsProvider, { draggable: false, colors, icon, hasPopup: true, hoverOptions }, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
            this.menuId = menuId;
        }
        async run() {
            const disposables = new lifecycle_1.DisposableStore();
            const menu = disposables.add(this.menuService.createMenu(this.menuId, this.contextKeyService));
            const actions = await this.resolveMainMenuActions(menu, disposables);
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.container,
                anchorAlignment: this.configurationService.getValue('workbench.sideBar.location') === 'left' ? 1 /* AnchorAlignment.RIGHT */ : 0 /* AnchorAlignment.LEFT */,
                anchorAxisAlignment: 1 /* AnchorAxisAlignment.HORIZONTAL */,
                getActions: () => actions,
                onHide: () => disposables.dispose(),
                menuActionOptions: { renderShortTitle: true },
            });
        }
        async resolveMainMenuActions(menu, _disposable) {
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { renderShortTitle: true }, { primary: [], secondary: actions });
            return actions;
        }
    };
    MenuActivityActionViewItem = __decorate([
        __param(6, themeService_1.IThemeService),
        __param(7, hover_1.IHoverService),
        __param(8, actions_2.IMenuService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, environmentService_1.IWorkbenchEnvironmentService),
        __param(13, keybinding_1.IKeybindingService)
    ], MenuActivityActionViewItem);
    let AccountsActivityActionViewItem = class AccountsActivityActionViewItem extends MenuActivityActionViewItem {
        static { AccountsActivityActionViewItem_1 = this; }
        static { this.ACCOUNTS_VISIBILITY_PREFERENCE_KEY = 'workbench.activity.showAccounts'; }
        constructor(action, contextMenuActionsProvider, colors, activityHoverOptions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, storageService, keybindingService, secretStorageService, logService) {
            super(actions_2.MenuId.AccountsContext, action, contextMenuActionsProvider, true, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
            this.lifecycleService = lifecycleService;
            this.authenticationService = authenticationService;
            this.productService = productService;
            this.storageService = storageService;
            this.secretStorageService = secretStorageService;
            this.logService = logService;
            this.groupedAccounts = new Map();
            this.problematicProviders = new Set();
            this.initialized = false;
            this.sessionFromEmbedder = new lazy_1.Lazy(() => (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.secretStorageService, this.productService));
            this.registerListeners();
            this.initialize();
        }
        registerListeners() {
            this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
                await this.addAccountsFromProvider(e.id);
            }));
            this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
                this.groupedAccounts.delete(e.id);
                this.problematicProviders.delete(e.id);
            }));
            this._register(this.authenticationService.onDidChangeSessions(async (e) => {
                for (const changed of [...e.event.changed, ...e.event.added]) {
                    try {
                        await this.addOrUpdateAccount(e.providerId, changed.account);
                    }
                    catch (e) {
                        this.logService.error(e);
                    }
                }
                for (const removed of e.event.removed) {
                    this.removeAccount(e.providerId, removed.account);
                }
            }));
        }
        // This function exists to ensure that the accounts are added for auth providers that had already been registered
        // before the menu was created.
        async initialize() {
            // Resolving the menu doesn't need to happen immediately, so we can wait until after the workbench has been restored
            // and only run this when the system is idle.
            await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
            const disposable = this._register((0, async_1.runWhenIdle)(async () => {
                await this.doInitialize();
                disposable.dispose();
            }));
        }
        async doInitialize() {
            const providerIds = this.authenticationService.getProviderIds();
            const results = await Promise.allSettled(providerIds.map(providerId => this.addAccountsFromProvider(providerId)));
            // Log any errors that occurred while initializing. We try to be best effort here to show the most amount of accounts
            for (const result of results) {
                if (result.status === 'rejected') {
                    this.logService.error(result.reason);
                }
            }
            this.initialized = true;
        }
        //#region overrides
        async resolveMainMenuActions(accountsMenu, disposables) {
            await super.resolveMainMenuActions(accountsMenu, disposables);
            const providers = this.authenticationService.getProviderIds();
            const otherCommands = accountsMenu.getActions();
            let menus = [];
            for (const providerId of providers) {
                if (!this.initialized) {
                    const noAccountsAvailableAction = disposables.add(new actions_1.Action('noAccountsAvailable', (0, nls_1.localize)('loading', "Loading..."), undefined, false));
                    menus.push(noAccountsAvailableAction);
                    break;
                }
                const providerLabel = this.authenticationService.getLabel(providerId);
                const accounts = this.groupedAccounts.get(providerId);
                if (!accounts) {
                    if (this.problematicProviders.has(providerId)) {
                        const providerUnavailableAction = disposables.add(new actions_1.Action('providerUnavailable', (0, nls_1.localize)('authProviderUnavailable', '{0} is currently unavailable', providerLabel), undefined, false));
                        menus.push(providerUnavailableAction);
                        // try again in the background so that if the failure was intermittent, we can resolve it on the next showing of the menu
                        try {
                            await this.addAccountsFromProvider(providerId);
                        }
                        catch (e) {
                            this.logService.error(e);
                        }
                    }
                    continue;
                }
                for (const account of accounts) {
                    const manageExtensionsAction = disposables.add(new actions_1.Action(`configureSessions${account.label}`, (0, nls_1.localize)('manageTrustedExtensions', "Manage Trusted Extensions"), undefined, true, () => {
                        return this.authenticationService.manageTrustedExtensionsForAccount(providerId, account.label);
                    }));
                    const providerSubMenuActions = [manageExtensionsAction];
                    if (account.canSignOut) {
                        const signOutAction = disposables.add(new actions_1.Action('signOut', (0, nls_1.localize)('signOut', "Sign Out"), undefined, true, async () => {
                            const allSessions = await this.authenticationService.getSessions(providerId);
                            const sessionsForAccount = allSessions.filter(s => s.account.id === account.id);
                            return await this.authenticationService.removeAccountSessions(providerId, account.label, sessionsForAccount);
                        }));
                        providerSubMenuActions.push(signOutAction);
                    }
                    const providerSubMenu = new actions_1.SubmenuAction('activitybar.submenu', `${account.label} (${providerLabel})`, providerSubMenuActions);
                    menus.push(providerSubMenu);
                }
            }
            if (providers.length && !menus.length) {
                const noAccountsAvailableAction = disposables.add(new actions_1.Action('noAccountsAvailable', (0, nls_1.localize)('noAccounts', "You are not signed in to any accounts"), undefined, false));
                menus.push(noAccountsAvailableAction);
            }
            if (menus.length && otherCommands.length) {
                menus.push(new actions_1.Separator());
            }
            otherCommands.forEach((group, i) => {
                const actions = group[1];
                menus = menus.concat(actions);
                if (i !== otherCommands.length - 1) {
                    menus.push(new actions_1.Separator());
                }
            });
            return menus;
        }
        async resolveContextMenuActions(disposables) {
            const actions = await super.resolveContextMenuActions(disposables);
            actions.unshift(...[
                (0, actions_1.toAction)({ id: 'hideAccounts', label: (0, nls_1.localize)('hideAccounts', "Hide Accounts"), run: () => this.storageService.store(AccountsActivityActionViewItem_1.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, false, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */) }),
                new actions_1.Separator()
            ]);
            return actions;
        }
        //#endregion
        //#region groupedAccounts helpers
        async addOrUpdateAccount(providerId, account) {
            let accounts = this.groupedAccounts.get(providerId);
            if (accounts) {
                const existingAccount = accounts.find(a => a.id === account.id);
                if (existingAccount) {
                    // Update the label if it has changed
                    if (existingAccount.label !== account.label) {
                        existingAccount.label = account.label;
                    }
                    return;
                }
            }
            else {
                accounts = [];
                this.groupedAccounts.set(providerId, accounts);
            }
            const sessionFromEmbedder = await this.sessionFromEmbedder.value;
            // If the session stored from the embedder allows sign out, then we can treat it and all others as sign out-able
            let canSignOut = !!sessionFromEmbedder?.canSignOut;
            if (!canSignOut) {
                if (sessionFromEmbedder?.id) {
                    const sessions = (await this.authenticationService.getSessions(providerId)).filter(s => s.account.id === account.id);
                    canSignOut = !sessions.some(s => s.id === sessionFromEmbedder.id);
                }
                else {
                    // The default if we don't have a session from the embedder is to allow sign out
                    canSignOut = true;
                }
            }
            accounts.push({ ...account, canSignOut });
        }
        removeAccount(providerId, account) {
            const accounts = this.groupedAccounts.get(providerId);
            if (!accounts) {
                return;
            }
            const index = accounts.findIndex(a => a.id === account.id);
            if (index === -1) {
                return;
            }
            accounts.splice(index, 1);
            if (accounts.length === 0) {
                this.groupedAccounts.delete(providerId);
            }
        }
        async addAccountsFromProvider(providerId) {
            try {
                const sessions = await this.authenticationService.getSessions(providerId);
                this.problematicProviders.delete(providerId);
                for (const session of sessions) {
                    try {
                        await this.addOrUpdateAccount(providerId, session.account);
                    }
                    catch (e) {
                        this.logService.error(e);
                    }
                }
            }
            catch (e) {
                this.logService.error(e);
                this.problematicProviders.add(providerId);
            }
        }
    };
    exports.AccountsActivityActionViewItem = AccountsActivityActionViewItem;
    exports.AccountsActivityActionViewItem = AccountsActivityActionViewItem = AccountsActivityActionViewItem_1 = __decorate([
        __param(4, themeService_1.IThemeService),
        __param(5, lifecycle_2.ILifecycleService),
        __param(6, hover_1.IHoverService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, actions_2.IMenuService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, authentication_1.IAuthenticationService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService),
        __param(12, productService_1.IProductService),
        __param(13, configuration_1.IConfigurationService),
        __param(14, storage_1.IStorageService),
        __param(15, keybinding_1.IKeybindingService),
        __param(16, secrets_1.ISecretStorageService),
        __param(17, log_1.ILogService)
    ], AccountsActivityActionViewItem);
    let GlobalActivityActionViewItem = class GlobalActivityActionViewItem extends MenuActivityActionViewItem {
        constructor(action, contextMenuActionsProvider, colors, activityHoverOptions, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
            super(actions_2.MenuId.GlobalActivity, action, contextMenuActionsProvider, true, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
            this.userDataProfileService = userDataProfileService;
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.updateProfileBadge()));
        }
        render(container) {
            super.render(container);
            this.profileBadge = (0, dom_1.append)(container, (0, dom_1.$)('.profile-badge'));
            this.profileBadgeContent = (0, dom_1.append)(this.profileBadge, (0, dom_1.$)('.profile-badge-content'));
            this.updateProfileBadge();
        }
        updateProfileBadge() {
            if (!this.profileBadge || !this.profileBadgeContent) {
                return;
            }
            (0, dom_1.clearNode)(this.profileBadgeContent);
            (0, dom_1.hide)(this.profileBadge);
            if (this.userDataProfileService.currentProfile.isDefault) {
                return;
            }
            if (this.action.getBadge()) {
                return;
            }
            this.profileBadgeContent.textContent = this.userDataProfileService.currentProfile.name.substring(0, 2).toUpperCase();
            (0, dom_1.show)(this.profileBadge);
        }
        updateBadge() {
            super.updateBadge();
            this.updateProfileBadge();
        }
        computeTitle() {
            return this.userDataProfileService.currentProfile.isDefault ? super.computeTitle() : (0, nls_1.localize)('manage', "Manage {0} (Profile)", this.userDataProfileService.currentProfile.name);
        }
    };
    exports.GlobalActivityActionViewItem = GlobalActivityActionViewItem;
    exports.GlobalActivityActionViewItem = GlobalActivityActionViewItem = __decorate([
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, themeService_1.IThemeService),
        __param(6, hover_1.IHoverService),
        __param(7, actions_2.IMenuService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService),
        __param(12, keybinding_1.IKeybindingService)
    ], GlobalActivityActionViewItem);
    class PlaceHolderViewContainerActivityAction extends ViewContainerActivityAction {
    }
    exports.PlaceHolderViewContainerActivityAction = PlaceHolderViewContainerActivityAction;
    class PlaceHolderToggleCompositePinnedAction extends compositeBarActions_1.ToggleCompositePinnedAction {
        constructor(id, compositeBar) {
            super({ id, name: id, classNames: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.PlaceHolderToggleCompositePinnedAction = PlaceHolderToggleCompositePinnedAction;
    class PlaceHolderToggleCompositeBadgeAction extends compositeBarActions_1.ToggleCompositeBadgeAction {
        constructor(id, compositeBar) {
            super({ id, name: id, classNames: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.PlaceHolderToggleCompositeBadgeAction = PlaceHolderToggleCompositeBadgeAction;
    class SwitchSideBarViewAction extends actions_2.Action2 {
        constructor(desc, offset) {
            super(desc);
            this.offset = offset;
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const visibleViewletIds = paneCompositeService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
            const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (!activeViewlet) {
                return;
            }
            let targetViewletId;
            for (let i = 0; i < visibleViewletIds.length; i++) {
                if (visibleViewletIds[i] === activeViewlet.getId()) {
                    targetViewletId = visibleViewletIds[(i + visibleViewletIds.length + this.offset) % visibleViewletIds.length];
                    break;
                }
            }
            await paneCompositeService.openPaneComposite(targetViewletId, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    }
    (0, actions_2.registerAction2)(class PreviousSideBarViewAction extends SwitchSideBarViewAction {
        constructor() {
            super({
                id: 'workbench.action.previousSideBarView',
                title: { value: (0, nls_1.localize)('previousSideBarView', "Previous Primary Side Bar View"), original: 'Previous Primary Side Bar View' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            }, -1);
        }
    });
    (0, actions_2.registerAction2)(class NextSideBarViewAction extends SwitchSideBarViewAction {
        constructor() {
            super({
                id: 'workbench.action.nextSideBarView',
                title: { value: (0, nls_1.localize)('nextSideBarView', "Next Primary Side Bar View"), original: 'Next Primary Side Bar View' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            }, 1);
        }
    });
    (0, actions_2.registerAction2)(class FocusActivityBarAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.focusActivityBar',
                title: { value: (0, nls_1.localize)('focusActivityBar', "Focus Activity Bar"), original: 'Focus Activity Bar' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setPartHidden(false, "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            layoutService.focusPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
        }
    });
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const activityBarActiveBorderColor = theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_BORDER);
        if (activityBarActiveBorderColor) {
            collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
        }
        const activityBarActiveFocusBorderColor = theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_FOCUS_BORDER);
        if (activityBarActiveFocusBorderColor) {
            collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${activityBarActiveFocusBorderColor};
			}
		`);
        }
        const activityBarActiveBackgroundColor = theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_BACKGROUND);
        if (activityBarActiveBackgroundColor) {
            collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
        }
        // Styling with Outline color (e.g. high contrast theme)
        const outline = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (outline) {
            collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:before {
				content: "";
				position: absolute;
				top: 8px;
				left: 8px;
				height: 32px;
				width: 32px;
				z-index: 1;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.profile-activity-item:before {
				top: -6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover:before {
				outline: 1px solid;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover:before {
				outline: 1px dashed;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover:before {
				outline-color: ${outline};
			}
		`);
        }
        // Styling without outline color
        else {
            const focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusBorderColor) {
                collector.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
						border-left-color: ${focusBorderColor};
					}
				`);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHliYXJBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvYWN0aXZpdHliYXIvYWN0aXZpdHliYXJBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQ3pGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsb0NBQWM7O2lCQUV0Qyw0QkFBdUIsR0FBRyxHQUFHLEFBQU4sQ0FBTztRQUl0RCxZQUNDLFFBQW1CLEVBQ0YsaUJBQXFDLEVBQzdCLGFBQXVELEVBQzdELGdCQUFvRCxFQUNoRCxvQkFBNEQ7WUFFbkYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBTEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNaLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFQNUUsWUFBTyxHQUFHLENBQUMsQ0FBQztRQVVwQixDQUFDO1FBRUQsY0FBYyxDQUFDLFFBQW1CO1lBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQWlDO1lBQ25ELElBQUksS0FBSyxZQUFZLFVBQVUsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEQsT0FBTyxDQUFDLDRCQUE0QjthQUNwQztZQUVELHFFQUFxRTtZQUNyRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzREFBc0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyw2QkFBMkIsQ0FBQyx1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