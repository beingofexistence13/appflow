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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/activitybar/activitybarActions", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/compositeBarActions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/theme", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/common/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/hover/browser/hover", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/browser/mouseEvent", "vs/platform/log/common/log", "vs/platform/secrets/common/secrets", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/async", "vs/base/common/lazy", "vs/css!./media/activityaction"], function (require, exports, nls_1, dom_1, keyboardEvent_1, touch_1, actions_1, lifecycle_1, actions_2, contextView_1, telemetry_1, colorRegistry_1, themeService_1, compositeBarActions_1, actionCommonCategories_1, theme_1, layoutService_1, contextkey_1, menuEntryActionViewItem_1, authenticationService_1, authentication_1, environmentService_1, configuration_1, productService_1, storage_1, hover_1, keybinding_1, panecomposite_1, userDataProfile_1, mouseEvent_1, log_1, secrets_1, lifecycle_2, async_1, lazy_1) {
    "use strict";
    var $Txb_1, $Uxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Yxb = exports.$Xxb = exports.$Wxb = exports.$Vxb = exports.$Uxb = exports.$Txb = void 0;
    let $Txb = class $Txb extends compositeBarActions_1.$Ctb {
        static { $Txb_1 = this; }
        static { this.t = 300; }
        constructor(activity, L, M, N, O) {
            super(activity);
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.J = 0;
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
            if (now > this.J /* https://github.com/microsoft/vscode/issues/25830 */ && now - this.J < $Txb_1.t) {
                return;
            }
            this.J = now;
            const sideBarVisible = this.M.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const activeViewlet = this.L.getActivePaneComposite();
            const focusBehavior = this.O.getValue('workbench.activityBar.iconClickBehavior');
            const focus = (event && 'preserveFocus' in event) ? !event.preserveFocus : true;
            if (sideBarVisible && activeViewlet?.getId() === this.activity.id) {
                switch (focusBehavior) {
                    case 'focus':
                        this.P('refocus');
                        this.L.openPaneComposite(this.activity.id, focus);
                        break;
                    case 'toggle':
                    default:
                        // Hide sidebar if selected viewlet already visible
                        this.P('hide');
                        this.M.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                        break;
                }
                return;
            }
            this.P('show');
            await this.L.openPaneComposite(this.activity.id, focus);
            return this.activate();
        }
        P(action) {
            this.N.publicLog2('activityBarAction', { viewletId: this.activity.id, action });
        }
    };
    exports.$Txb = $Txb;
    exports.$Txb = $Txb = $Txb_1 = __decorate([
        __param(2, layoutService_1.$Meb),
        __param(3, telemetry_1.$9k),
        __param(4, configuration_1.$8h)
    ], $Txb);
    let AbstractGlobalActivityActionViewItem = class AbstractGlobalActivityActionViewItem extends compositeBarActions_1.$Dtb {
        constructor(action, gb, options, themeService, hoverService, hb, ib, jb, configurationService, kb, keybindingService) {
            super(action, options, () => true, themeService, hoverService, configurationService, keybindingService);
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
        }
        render(container) {
            super.render(container);
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.MOUSE_DOWN, async (e) => {
                dom_1.$5O.stop(e, true);
                const isLeftClick = e?.button !== 2;
                // Left-click run
                if (isLeftClick) {
                    this.mb();
                }
            }));
            // The rest of the activity bar uses context menu event for the context menu, so we match this
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.CONTEXT_MENU, async (e) => {
                const disposables = new lifecycle_1.$jc();
                const actions = await this.lb(disposables);
                const event = new mouseEvent_1.$eO(e);
                this.ib.showContextMenu({
                    getAnchor: () => event,
                    getActions: () => actions,
                    onHide: () => disposables.dispose()
                });
            }));
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.KEY_UP, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom_1.$5O.stop(e, true);
                    this.mb();
                }
            }));
            this.B((0, dom_1.$nO)(this.c, touch_1.EventType.Tap, (e) => {
                dom_1.$5O.stop(e, true);
                this.mb();
            }));
        }
        async lb(disposables) {
            return this.gb();
        }
    };
    AbstractGlobalActivityActionViewItem = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, hover_1.$zib),
        __param(5, actions_2.$Su),
        __param(6, contextView_1.$WZ),
        __param(7, contextkey_1.$3i),
        __param(8, configuration_1.$8h),
        __param(9, environmentService_1.$hJ),
        __param(10, keybinding_1.$2D)
    ], AbstractGlobalActivityActionViewItem);
    let MenuActivityActionViewItem = class MenuActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
        constructor(nb, action, contextMenuActionsProvider, icon, colors, hoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
            super(action, contextMenuActionsProvider, { draggable: false, colors, icon, hasPopup: true, hoverOptions }, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
            this.nb = nb;
        }
        async mb() {
            const disposables = new lifecycle_1.$jc();
            const menu = disposables.add(this.hb.createMenu(this.nb, this.jb));
            const actions = await this.pb(menu, disposables);
            this.ib.showContextMenu({
                getAnchor: () => this.c,
                anchorAlignment: this.R.getValue('workbench.sideBar.location') === 'left' ? 1 /* AnchorAlignment.RIGHT */ : 0 /* AnchorAlignment.LEFT */,
                anchorAxisAlignment: 1 /* AnchorAxisAlignment.HORIZONTAL */,
                getActions: () => actions,
                onHide: () => disposables.dispose(),
                menuActionOptions: { renderShortTitle: true },
            });
        }
        async pb(menu, _disposable) {
            const actions = [];
            (0, menuEntryActionViewItem_1.$B3)(menu, { renderShortTitle: true }, { primary: [], secondary: actions });
            return actions;
        }
    };
    MenuActivityActionViewItem = __decorate([
        __param(6, themeService_1.$gv),
        __param(7, hover_1.$zib),
        __param(8, actions_2.$Su),
        __param(9, contextView_1.$WZ),
        __param(10, contextkey_1.$3i),
        __param(11, configuration_1.$8h),
        __param(12, environmentService_1.$hJ),
        __param(13, keybinding_1.$2D)
    ], MenuActivityActionViewItem);
    let $Uxb = class $Uxb extends MenuActivityActionViewItem {
        static { $Uxb_1 = this; }
        static { this.ACCOUNTS_VISIBILITY_PREFERENCE_KEY = 'workbench.activity.showAccounts'; }
        constructor(action, contextMenuActionsProvider, colors, activityHoverOptions, themeService, ub, hoverService, contextMenuService, menuService, contextKeyService, vb, environmentService, wb, configurationService, xb, keybindingService, yb, zb) {
            super(actions_2.$Ru.AccountsContext, action, contextMenuActionsProvider, true, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
            this.ub = ub;
            this.vb = vb;
            this.wb = wb;
            this.xb = xb;
            this.yb = yb;
            this.zb = zb;
            this.qb = new Map();
            this.rb = new Set();
            this.sb = false;
            this.tb = new lazy_1.$T(() => (0, authenticationService_1.$QV)(this.yb, this.wb));
            this.Ab();
            this.Bb();
        }
        Ab() {
            this.B(this.vb.onDidRegisterAuthenticationProvider(async (e) => {
                await this.Hb(e.id);
            }));
            this.B(this.vb.onDidUnregisterAuthenticationProvider((e) => {
                this.qb.delete(e.id);
                this.rb.delete(e.id);
            }));
            this.B(this.vb.onDidChangeSessions(async (e) => {
                for (const changed of [...e.event.changed, ...e.event.added]) {
                    try {
                        await this.Fb(e.providerId, changed.account);
                    }
                    catch (e) {
                        this.zb.error(e);
                    }
                }
                for (const removed of e.event.removed) {
                    this.Gb(e.providerId, removed.account);
                }
            }));
        }
        // This function exists to ensure that the accounts are added for auth providers that had already been registered
        // before the menu was created.
        async Bb() {
            // Resolving the menu doesn't need to happen immediately, so we can wait until after the workbench has been restored
            // and only run this when the system is idle.
            await this.ub.when(3 /* LifecyclePhase.Restored */);
            const disposable = this.B((0, async_1.$Wg)(async () => {
                await this.Cb();
                disposable.dispose();
            }));
        }
        async Cb() {
            const providerIds = this.vb.getProviderIds();
            const results = await Promise.allSettled(providerIds.map(providerId => this.Hb(providerId)));
            // Log any errors that occurred while initializing. We try to be best effort here to show the most amount of accounts
            for (const result of results) {
                if (result.status === 'rejected') {
                    this.zb.error(result.reason);
                }
            }
            this.sb = true;
        }
        //#region overrides
        async pb(accountsMenu, disposables) {
            await super.pb(accountsMenu, disposables);
            const providers = this.vb.getProviderIds();
            const otherCommands = accountsMenu.getActions();
            let menus = [];
            for (const providerId of providers) {
                if (!this.sb) {
                    const noAccountsAvailableAction = disposables.add(new actions_1.$gi('noAccountsAvailable', (0, nls_1.localize)(0, null), undefined, false));
                    menus.push(noAccountsAvailableAction);
                    break;
                }
                const providerLabel = this.vb.getLabel(providerId);
                const accounts = this.qb.get(providerId);
                if (!accounts) {
                    if (this.rb.has(providerId)) {
                        const providerUnavailableAction = disposables.add(new actions_1.$gi('providerUnavailable', (0, nls_1.localize)(1, null, providerLabel), undefined, false));
                        menus.push(providerUnavailableAction);
                        // try again in the background so that if the failure was intermittent, we can resolve it on the next showing of the menu
                        try {
                            await this.Hb(providerId);
                        }
                        catch (e) {
                            this.zb.error(e);
                        }
                    }
                    continue;
                }
                for (const account of accounts) {
                    const manageExtensionsAction = disposables.add(new actions_1.$gi(`configureSessions${account.label}`, (0, nls_1.localize)(2, null), undefined, true, () => {
                        return this.vb.manageTrustedExtensionsForAccount(providerId, account.label);
                    }));
                    const providerSubMenuActions = [manageExtensionsAction];
                    if (account.canSignOut) {
                        const signOutAction = disposables.add(new actions_1.$gi('signOut', (0, nls_1.localize)(3, null), undefined, true, async () => {
                            const allSessions = await this.vb.getSessions(providerId);
                            const sessionsForAccount = allSessions.filter(s => s.account.id === account.id);
                            return await this.vb.removeAccountSessions(providerId, account.label, sessionsForAccount);
                        }));
                        providerSubMenuActions.push(signOutAction);
                    }
                    const providerSubMenu = new actions_1.$ji('activitybar.submenu', `${account.label} (${providerLabel})`, providerSubMenuActions);
                    menus.push(providerSubMenu);
                }
            }
            if (providers.length && !menus.length) {
                const noAccountsAvailableAction = disposables.add(new actions_1.$gi('noAccountsAvailable', (0, nls_1.localize)(4, null), undefined, false));
                menus.push(noAccountsAvailableAction);
            }
            if (menus.length && otherCommands.length) {
                menus.push(new actions_1.$ii());
            }
            otherCommands.forEach((group, i) => {
                const actions = group[1];
                menus = menus.concat(actions);
                if (i !== otherCommands.length - 1) {
                    menus.push(new actions_1.$ii());
                }
            });
            return menus;
        }
        async lb(disposables) {
            const actions = await super.lb(disposables);
            actions.unshift(...[
                (0, actions_1.$li)({ id: 'hideAccounts', label: (0, nls_1.localize)(5, null), run: () => this.xb.store($Uxb_1.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, false, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */) }),
                new actions_1.$ii()
            ]);
            return actions;
        }
        //#endregion
        //#region groupedAccounts helpers
        async Fb(providerId, account) {
            let accounts = this.qb.get(providerId);
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
                this.qb.set(providerId, accounts);
            }
            const sessionFromEmbedder = await this.tb.value;
            // If the session stored from the embedder allows sign out, then we can treat it and all others as sign out-able
            let canSignOut = !!sessionFromEmbedder?.canSignOut;
            if (!canSignOut) {
                if (sessionFromEmbedder?.id) {
                    const sessions = (await this.vb.getSessions(providerId)).filter(s => s.account.id === account.id);
                    canSignOut = !sessions.some(s => s.id === sessionFromEmbedder.id);
                }
                else {
                    // The default if we don't have a session from the embedder is to allow sign out
                    canSignOut = true;
                }
            }
            accounts.push({ ...account, canSignOut });
        }
        Gb(providerId, account) {
            const accounts = this.qb.get(providerId);
            if (!accounts) {
                return;
            }
            const index = accounts.findIndex(a => a.id === account.id);
            if (index === -1) {
                return;
            }
            accounts.splice(index, 1);
            if (accounts.length === 0) {
                this.qb.delete(providerId);
            }
        }
        async Hb(providerId) {
            try {
                const sessions = await this.vb.getSessions(providerId);
                this.rb.delete(providerId);
                for (const session of sessions) {
                    try {
                        await this.Fb(providerId, session.account);
                    }
                    catch (e) {
                        this.zb.error(e);
                    }
                }
            }
            catch (e) {
                this.zb.error(e);
                this.rb.add(providerId);
            }
        }
    };
    exports.$Uxb = $Uxb;
    exports.$Uxb = $Uxb = $Uxb_1 = __decorate([
        __param(4, themeService_1.$gv),
        __param(5, lifecycle_2.$7y),
        __param(6, hover_1.$zib),
        __param(7, contextView_1.$WZ),
        __param(8, actions_2.$Su),
        __param(9, contextkey_1.$3i),
        __param(10, authentication_1.$3I),
        __param(11, environmentService_1.$hJ),
        __param(12, productService_1.$kj),
        __param(13, configuration_1.$8h),
        __param(14, storage_1.$Vo),
        __param(15, keybinding_1.$2D),
        __param(16, secrets_1.$FT),
        __param(17, log_1.$5i)
    ], $Uxb);
    let $Vxb = class $Vxb extends MenuActivityActionViewItem {
        constructor(action, contextMenuActionsProvider, colors, activityHoverOptions, sb, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
            super(actions_2.$Ru.GlobalActivity, action, contextMenuActionsProvider, true, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
            this.sb = sb;
            this.B(this.sb.onDidChangeCurrentProfile(() => this.tb()));
        }
        render(container) {
            super.render(container);
            this.qb = (0, dom_1.$0O)(container, (0, dom_1.$)('.profile-badge'));
            this.rb = (0, dom_1.$0O)(this.qb, (0, dom_1.$)('.profile-badge-content'));
            this.tb();
        }
        tb() {
            if (!this.qb || !this.rb) {
                return;
            }
            (0, dom_1.$lO)(this.rb);
            (0, dom_1.$eP)(this.qb);
            if (this.sb.currentProfile.isDefault) {
                return;
            }
            if (this.action.getBadge()) {
                return;
            }
            this.rb.textContent = this.sb.currentProfile.name.substring(0, 2).toUpperCase();
            (0, dom_1.$dP)(this.qb);
        }
        Z() {
            super.Z();
            this.tb();
        }
        cb() {
            return this.sb.currentProfile.isDefault ? super.cb() : (0, nls_1.localize)(6, null, this.sb.currentProfile.name);
        }
    };
    exports.$Vxb = $Vxb;
    exports.$Vxb = $Vxb = __decorate([
        __param(4, userDataProfile_1.$CJ),
        __param(5, themeService_1.$gv),
        __param(6, hover_1.$zib),
        __param(7, actions_2.$Su),
        __param(8, contextView_1.$WZ),
        __param(9, contextkey_1.$3i),
        __param(10, configuration_1.$8h),
        __param(11, environmentService_1.$hJ),
        __param(12, keybinding_1.$2D)
    ], $Vxb);
    class $Wxb extends $Txb {
    }
    exports.$Wxb = $Wxb;
    class $Xxb extends compositeBarActions_1.$Htb {
        constructor(id, compositeBar) {
            super({ id, name: id, classNames: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.$Xxb = $Xxb;
    class $Yxb extends compositeBarActions_1.$Itb {
        constructor(id, compositeBar) {
            super({ id, name: id, classNames: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.$Yxb = $Yxb;
    class SwitchSideBarViewAction extends actions_2.$Wu {
        constructor(desc, b) {
            super(desc);
            this.b = b;
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const visibleViewletIds = paneCompositeService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
            const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (!activeViewlet) {
                return;
            }
            let targetViewletId;
            for (let i = 0; i < visibleViewletIds.length; i++) {
                if (visibleViewletIds[i] === activeViewlet.getId()) {
                    targetViewletId = visibleViewletIds[(i + visibleViewletIds.length + this.b) % visibleViewletIds.length];
                    break;
                }
            }
            await paneCompositeService.openPaneComposite(targetViewletId, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    }
    (0, actions_2.$Xu)(class PreviousSideBarViewAction extends SwitchSideBarViewAction {
        constructor() {
            super({
                id: 'workbench.action.previousSideBarView',
                title: { value: (0, nls_1.localize)(7, null), original: 'Previous Primary Side Bar View' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            }, -1);
        }
    });
    (0, actions_2.$Xu)(class NextSideBarViewAction extends SwitchSideBarViewAction {
        constructor() {
            super({
                id: 'workbench.action.nextSideBarView',
                title: { value: (0, nls_1.localize)(8, null), original: 'Next Primary Side Bar View' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            }, 1);
        }
    });
    (0, actions_2.$Xu)(class FocusActivityBarAction extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.focusActivityBar',
                title: { value: (0, nls_1.localize)(9, null), original: 'Focus Activity Bar' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.setPartHidden(false, "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            layoutService.focusPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
        }
    });
    (0, themeService_1.$mv)((theme, collector) => {
        const activityBarActiveBorderColor = theme.getColor(theme_1.$qab);
        if (activityBarActiveBorderColor) {
            collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
        }
        const activityBarActiveFocusBorderColor = theme.getColor(theme_1.$rab);
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
        const activityBarActiveBackgroundColor = theme.getColor(theme_1.$sab);
        if (activityBarActiveBackgroundColor) {
            collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
        }
        // Styling with Outline color (e.g. high contrast theme)
        const outline = theme.getColor(colorRegistry_1.$Bv);
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
            const focusBorderColor = theme.getColor(colorRegistry_1.$zv);
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
//# sourceMappingURL=activitybarActions.js.map