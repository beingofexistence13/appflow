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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/activitybar/activitybarPart", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/activity", "vs/workbench/browser/part", "vs/workbench/browser/parts/activitybar/activitybarActions", "vs/workbench/services/activity/common/activity", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/workbench/browser/actions/layoutActions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositeBar", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/workbench/browser/parts/compositeBarActions", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/environment/common/environmentService", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/configuration/common/configuration", "vs/platform/window/common/window", "vs/base/common/platform", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/actions", "vs/base/browser/keyboardEvent", "vs/platform/theme/common/iconRegistry", "vs/base/common/hash", "vs/css!./media/activitybarpart"], function (require, exports, nls_1, actionbar_1, activity_1, part_1, activitybarActions_1, activity_2, layoutService_1, instantiation_1, lifecycle_1, layoutActions_1, themeService_1, theme_1, colorRegistry_1, compositeBar_1, dom_1, storage_1, extensions_1, uri_1, compositeBarActions_1, views_1, contextkeys_1, contextkey_1, types_1, environmentService_1, menubarControl_1, configuration_1, window_1, platform_1, codicons_1, themables_1, actions_1, keyboardEvent_1, iconRegistry_1, hash_1) {
    "use strict";
    var $4xb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4xb = void 0;
    let $4xb = class $4xb extends part_1.Part {
        static { $4xb_1 = this; }
        static { this.a = 'workbench.activity.pinnedViewlets2'; }
        static { this.b = 'workbench.activity.placeholderViewlets'; }
        static { this.y = 48; }
        static { this.P = 0; }
        static { this.Q = (0, iconRegistry_1.$9u)('settings-view-bar-icon', codicons_1.$Pj.settingsGear, (0, nls_1.localize)(0, null)); }
        static { this.R = (0, iconRegistry_1.$9u)('accounts-view-bar-icon', codicons_1.$Pj.account, (0, nls_1.localize)(1, null)); }
        constructor(kb, lb, layoutService, themeService, mb, nb, ob, pb, qb, rb) {
            super("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, { hasTitle: false }, themeService, mb, layoutService);
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.rb = rb;
            //#region IView
            this.minimumWidth = 48;
            this.maximumWidth = 48;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.bb = [];
            this.db = [];
            this.eb = new Map();
            this.fb = new Map();
            this.gb = this.B(new lifecycle_1.$jc());
            this.hb = 0 /* ViewContainerLocation.Sidebar */;
            this.ib = false;
            this.jb = new Map();
            this.$b = undefined;
            for (const cachedViewContainer of this.ac) {
                cachedViewContainer.visible = !this.Rb(cachedViewContainer.id, cachedViewContainer);
            }
            this.X = this.sb();
            this.Mb(this.Xb());
            this.vb();
        }
        sb() {
            const cachedItems = this.ac
                .map(container => ({
                id: container.id,
                name: container.name,
                visible: container.visible,
                order: container.order,
                pinned: container.pinned,
            }));
            return this.B(this.lb.createInstance(compositeBar_1.$1xb, cachedItems, {
                icon: true,
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                activityHoverOptions: this.tb(),
                preventLoopNavigation: true,
                openComposite: async (compositeId, preserveFocus) => {
                    return (await this.kb.openPaneComposite(compositeId, !preserveFocus)) ?? null;
                },
                getActivityAction: compositeId => this.Lb(compositeId).activityAction,
                getCompositePinnedAction: compositeId => this.Lb(compositeId).pinnedAction,
                getCompositeBadgeAction: compositeId => this.Lb(compositeId).badgeAction,
                getOnCompositeClickAction: compositeId => (0, actions_1.$li)({ id: compositeId, label: '', run: async () => this.kb.getActivePaneComposite()?.getId() === compositeId ? this.kb.hideActivePaneComposite() : this.kb.openPaneComposite(compositeId) }),
                fillExtraContextMenuActions: (actions, e) => {
                    // Menu
                    const menuBarVisibility = (0, window_1.$TD)(this.qb);
                    if (menuBarVisibility === 'compact' || menuBarVisibility === 'hidden' || menuBarVisibility === 'toggle') {
                        actions.unshift(...[(0, actions_1.$li)({ id: 'toggleMenuVisibility', label: (0, nls_1.localize)(2, null), checked: menuBarVisibility === 'compact', run: () => this.qb.updateValue('window.menuBarVisibility', menuBarVisibility === 'compact' ? 'toggle' : 'compact') }), new actions_1.$ii()]);
                    }
                    if (menuBarVisibility === 'compact' && this.W && e?.target) {
                        if ((0, dom_1.$NO)(e.target, this.W)) {
                            actions.unshift(...[(0, actions_1.$li)({ id: 'hideCompactMenu', label: (0, nls_1.localize)(3, null), run: () => this.qb.updateValue('window.menuBarVisibility', 'toggle') }), new actions_1.$ii()]);
                        }
                    }
                    // Accounts
                    actions.push(new actions_1.$ii());
                    actions.push((0, actions_1.$li)({ id: 'toggleAccountsVisibility', label: (0, nls_1.localize)(4, null), checked: this.oc, run: () => this.oc = !this.oc }));
                    actions.push(new actions_1.$ii());
                    // Toggle Sidebar
                    actions.push((0, actions_1.$li)({ id: layoutActions_1.$Qtb.ID, label: layoutActions_1.$Qtb.getLabel(this.u), run: () => this.lb.invokeFunction(accessor => new layoutActions_1.$Qtb().run(accessor)) }));
                    // Toggle Activity Bar
                    actions.push((0, actions_1.$li)({ id: layoutActions_1.$Ptb.ID, label: (0, nls_1.localize)(5, null), run: () => this.lb.invokeFunction(accessor => new layoutActions_1.$Ptb().run(accessor)) }));
                },
                getContextMenuActionsForComposite: compositeId => this.ub(compositeId),
                getDefaultCompositeId: () => this.ob.getDefaultViewContainer(this.hb)?.id,
                hidePart: () => this.u.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */),
                dndHandler: new compositeBar_1.$Zxb(this.ob, 0 /* ViewContainerLocation.Sidebar */, async (id, focus) => { return await this.kb.openPaneComposite(id, focus) ?? null; }, (from, to, before) => this.X.move(from, to, before?.verticallyBefore), () => this.X.getCompositeBarItems()),
                compositeSize: 52,
                colors: (theme) => this.Vb(theme),
                overflowActionSize: $4xb_1.y
            }));
        }
        tb() {
            return {
                position: () => this.u.getSideBarPosition() === 0 /* Position.LEFT */ ? 1 /* HoverPosition.RIGHT */ : 0 /* HoverPosition.LEFT */,
            };
        }
        ub(compositeId) {
            const actions = [];
            const viewContainer = this.ob.getViewContainerById(compositeId);
            const defaultLocation = this.ob.getDefaultViewContainerLocation(viewContainer);
            if (defaultLocation !== this.ob.getViewContainerLocation(viewContainer)) {
                actions.push((0, actions_1.$li)({ id: 'resetLocationAction', label: (0, nls_1.localize)(6, null), run: () => this.ob.moveViewContainerToLocation(viewContainer, defaultLocation) }));
            }
            else {
                const viewContainerModel = this.ob.getViewContainerModel(viewContainer);
                if (viewContainerModel.allViewDescriptors.length === 1) {
                    const viewToReset = viewContainerModel.allViewDescriptors[0];
                    const defaultContainer = this.ob.getDefaultContainerById(viewToReset.id);
                    if (defaultContainer !== viewContainer) {
                        actions.push((0, actions_1.$li)({ id: 'resetLocationAction', label: (0, nls_1.localize)(7, null), run: () => this.ob.moveViewsToContainer([viewToReset], defaultContainer) }));
                    }
                }
            }
            return actions;
        }
        vb() {
            // View Container Changes
            this.B(this.ob.onDidChangeViewContainers(({ added, removed }) => this.wb(added, removed)));
            this.B(this.ob.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.xb(viewContainer, from, to)));
            // View Container Visibility Changes
            this.kb.onDidPaneCompositeOpen(e => this.yb(e.getId(), true));
            this.kb.onDidPaneCompositeClose(e => this.yb(e.getId(), false));
            // Extension registration
            const disposables = this.B(new lifecycle_1.$jc());
            this.B(this.nb.onDidRegisterExtensions(() => {
                disposables.clear();
                this.zb();
                this.X.onDidChange(() => this.Zb(), this, disposables);
                this.mb.onDidChangeValue(0 /* StorageScope.PROFILE */, $4xb_1.a, disposables)(e => this.Yb(e), this, disposables);
                this.mb.onDidChangeValue(0 /* StorageScope.PROFILE */, activitybarActions_1.$Uxb.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, disposables)(() => this.Kb(), this, disposables);
            }));
            // Register for configuration changes
            this.B(this.qb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.menuBarVisibility')) {
                    if ((0, window_1.$TD)(this.qb) === 'compact') {
                        this.Gb();
                    }
                    else {
                        this.Fb();
                    }
                }
            }));
        }
        wb(added, removed) {
            removed.filter(({ location }) => location === 0 /* ViewContainerLocation.Sidebar */).forEach(({ container }) => this.Nb(container));
            this.Mb(added.filter(({ location }) => location === 0 /* ViewContainerLocation.Sidebar */).map(({ container }) => container));
        }
        xb(container, from, to) {
            if (from === this.hb) {
                this.Nb(container);
            }
            if (to === this.hb) {
                this.Mb([container]);
            }
        }
        yb(id, visible) {
            if (visible) {
                // Activate view container action on opening of a view container
                this.Ab(id);
            }
            else {
                // Deactivate view container action on close
                this.X.deactivateComposite(id);
            }
        }
        zb() {
            this.ib = true;
            // show/hide/remove composites
            for (const { id } of this.ac) {
                const viewContainer = this.Wb(id);
                if (viewContainer) {
                    this.Qb(viewContainer);
                }
                else {
                    if (this.ob.isViewContainerRemovedPermanently(id)) {
                        this.Ub(id);
                    }
                    else {
                        this.Tb(id);
                    }
                }
            }
            this.Zb();
        }
        Ab(id) {
            const viewContainer = this.Wb(id);
            if (viewContainer) {
                // Update the composite bar by adding
                this.Sb(viewContainer);
                this.X.activateComposite(viewContainer.id);
                if (this.Rb(viewContainer)) {
                    const viewContainerModel = this.ob.getViewContainerModel(viewContainer);
                    if (viewContainerModel.activeViewDescriptors.length === 0) {
                        // Update the composite bar by hiding
                        this.Tb(viewContainer.id);
                    }
                }
            }
        }
        showActivity(viewContainerOrActionId, badge, clazz, priority) {
            if (this.Wb(viewContainerOrActionId)) {
                return this.X.showActivity(viewContainerOrActionId, badge, clazz, priority);
            }
            if (viewContainerOrActionId === activity_1.$Atb) {
                return this.Bb(activity_1.$Atb, badge, clazz, priority);
            }
            if (viewContainerOrActionId === activity_1.$Btb) {
                return this.Bb(activity_1.$Btb, badge, clazz, priority);
            }
            return lifecycle_1.$kc.None;
        }
        Bb(activityId, badge, clazz, priority) {
            if (typeof priority !== 'number') {
                priority = 0;
            }
            const activity = { badge, clazz, priority };
            const activityCache = activityId === activity_1.$Atb ? this.bb : this.db;
            for (let i = 0; i <= activityCache.length; i++) {
                if (i === activityCache.length) {
                    activityCache.push(activity);
                    break;
                }
                else if (activityCache[i].priority <= priority) {
                    activityCache.splice(i, 0, activity);
                    break;
                }
            }
            this.Db(activityId);
            return (0, lifecycle_1.$ic)(() => this.Cb(activityId, activity));
        }
        Cb(activityId, activity) {
            const activityCache = activityId === activity_1.$Atb ? this.bb : this.db;
            const index = activityCache.indexOf(activity);
            if (index !== -1) {
                activityCache.splice(index, 1);
                this.Db(activityId);
            }
        }
        Db(activityId) {
            const activityAction = activityId === activity_1.$Atb ? this.Z : this.cb;
            if (!activityAction) {
                return;
            }
            const activityCache = activityId === activity_1.$Atb ? this.bb : this.db;
            if (activityCache.length) {
                const [{ badge, clazz, priority }] = activityCache;
                if (badge instanceof activity_2.$IV && activityCache.length > 1) {
                    const cumulativeNumberBadge = this.Eb(activityCache, priority);
                    activityAction.setBadge(cumulativeNumberBadge);
                }
                else {
                    activityAction.setBadge(badge, clazz);
                }
            }
            else {
                activityAction.setBadge(undefined);
            }
        }
        Eb(activityCache, priority) {
            const numberActivities = activityCache.filter(activity => activity.badge instanceof activity_2.$IV && activity.priority === priority);
            const number = numberActivities.reduce((result, activity) => { return result + activity.badge.number; }, 0);
            const descriptorFn = () => {
                return numberActivities.reduce((result, activity, index) => {
                    result = result + activity.badge.getDescription();
                    if (index < numberActivities.length - 1) {
                        result = `${result}\n`;
                    }
                    return result;
                }, '');
            };
            return new activity_2.$IV(number, descriptorFn);
        }
        Fb() {
            if (this.U) {
                this.U.dispose();
                this.U = undefined;
            }
            if (this.W) {
                this.W.remove();
                this.W = undefined;
                this.Ib();
            }
        }
        Gb() {
            if (this.U) {
                return; // prevent menu bar from installing twice #110720
            }
            this.W = document.createElement('div');
            this.W.classList.add('menubar');
            const content = (0, types_1.$uf)(this.S);
            content.prepend(this.W);
            // Menubar: install a custom menu bar depending on configuration
            this.U = this.B(this.lb.createInstance(menubarControl_1.$3xb));
            this.U.create(this.W);
            this.Ib();
        }
        L(parent) {
            this.element = parent;
            this.S = document.createElement('div');
            this.S.classList.add('content');
            parent.appendChild(this.S);
            // Install menubar if compact
            if ((0, window_1.$TD)(this.qb) === 'compact') {
                this.Gb();
            }
            // View Containers action bar
            this.Y = this.X.create(this.S);
            // Global action bar
            this.ab = document.createElement('div');
            this.S.appendChild(this.ab);
            this.Jb(this.ab);
            // Keyboard Navigation
            this.Ib();
            return this.S;
        }
        Ib() {
            this.gb.clear();
            // Up/Down arrow on compact menu
            if (this.W) {
                this.gb.add((0, dom_1.$nO)(this.W, dom_1.$3O.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.$jO(e);
                    if (kbEvent.equals(18 /* KeyCode.DownArrow */) || kbEvent.equals(17 /* KeyCode.RightArrow */)) {
                        this.X?.focus();
                    }
                }));
            }
            // Up/Down on Activity Icons
            if (this.Y) {
                this.gb.add((0, dom_1.$nO)(this.Y, dom_1.$3O.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.$jO(e);
                    if (kbEvent.equals(18 /* KeyCode.DownArrow */) || kbEvent.equals(17 /* KeyCode.RightArrow */)) {
                        this.$?.focus(true);
                    }
                    else if (kbEvent.equals(16 /* KeyCode.UpArrow */) || kbEvent.equals(15 /* KeyCode.LeftArrow */)) {
                        this.U?.toggleFocus();
                    }
                }));
            }
            // Up arrow on global icons
            if (this.ab) {
                this.gb.add((0, dom_1.$nO)(this.ab, dom_1.$3O.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.$jO(e);
                    if (kbEvent.equals(16 /* KeyCode.UpArrow */) || kbEvent.equals(15 /* KeyCode.LeftArrow */)) {
                        this.X?.focus(this.getVisiblePaneCompositeIds().length - 1);
                    }
                }));
            }
        }
        Jb(container) {
            this.$ = this.B(new actionbar_1.$1P(container, {
                actionViewItemProvider: action => {
                    if (action.id === 'workbench.actions.manage') {
                        return this.lb.createInstance(activitybarActions_1.$Vxb, action, () => this.X.getContextMenuActions(), (theme) => this.Vb(theme), this.tb());
                    }
                    if (action.id === 'workbench.actions.accounts') {
                        return this.lb.createInstance(activitybarActions_1.$Uxb, action, () => this.X.getContextMenuActions(), (theme) => this.Vb(theme), this.tb());
                    }
                    throw new Error(`No view item for action '${action.id}'`);
                },
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                ariaLabel: (0, nls_1.localize)(8, null),
                animated: false,
                preventLoopNavigation: true
            }));
            this.Z = this.B(new compositeBarActions_1.$Ctb({
                id: 'workbench.actions.manage',
                name: (0, nls_1.localize)(9, null),
                classNames: themables_1.ThemeIcon.asClassNameArray($4xb_1.Q),
            }));
            if (this.oc) {
                this.cb = this.B(new compositeBarActions_1.$Ctb({
                    id: 'workbench.actions.accounts',
                    name: (0, nls_1.localize)(10, null),
                    classNames: themables_1.ThemeIcon.asClassNameArray($4xb_1.R)
                }));
                this.$.push(this.cb, { index: $4xb_1.P });
            }
            this.$.push(this.Z);
        }
        Kb() {
            if (!!this.cb === this.oc) {
                return;
            }
            if (this.$) {
                if (this.cb) {
                    this.$.pull($4xb_1.P);
                    this.cb = undefined;
                }
                else {
                    this.cb = this.B(new compositeBarActions_1.$Ctb({
                        id: 'workbench.actions.accounts',
                        name: (0, nls_1.localize)(11, null),
                        classNames: themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.account)
                    }));
                    this.$.push(this.cb, { index: $4xb_1.P });
                }
            }
            this.Db(activity_1.$Btb);
        }
        Lb(compositeId) {
            let compositeActions = this.eb.get(compositeId);
            if (!compositeActions) {
                const viewContainer = this.Wb(compositeId);
                if (viewContainer) {
                    const viewContainerModel = this.ob.getViewContainerModel(viewContainer);
                    compositeActions = {
                        activityAction: this.lb.createInstance(activitybarActions_1.$Txb, this.toActivity(viewContainerModel), this.kb),
                        pinnedAction: new compositeBarActions_1.$Htb(this.toActivity(viewContainerModel), this.X),
                        badgeAction: new compositeBarActions_1.$Itb(this.toActivity(viewContainerModel), this.X)
                    };
                }
                else {
                    const cachedComposite = this.ac.filter(c => c.id === compositeId)[0];
                    compositeActions = {
                        activityAction: this.lb.createInstance(activitybarActions_1.$Wxb, $4xb_1.Pb(compositeId, compositeId, cachedComposite?.icon, undefined), this.kb),
                        pinnedAction: new activitybarActions_1.$Xxb(compositeId, this.X),
                        badgeAction: new activitybarActions_1.$Yxb(compositeId, this.X)
                    };
                }
                this.eb.set(compositeId, compositeActions);
            }
            return compositeActions;
        }
        Mb(viewContainers) {
            for (const viewContainer of viewContainers) {
                this.Sb(viewContainer);
                // Pin it by default if it is new
                const cachedViewContainer = this.ac.filter(({ id }) => id === viewContainer.id)[0];
                if (!cachedViewContainer) {
                    this.X.pin(viewContainer.id);
                }
                // Active
                const visibleViewContainer = this.kb.getActivePaneComposite();
                if (visibleViewContainer?.getId() === viewContainer.id) {
                    this.X.activateComposite(viewContainer.id);
                }
                const viewContainerModel = this.ob.getViewContainerModel(viewContainer);
                this.Ob(viewContainer, viewContainerModel);
                this.Qb(viewContainer);
                const disposables = new lifecycle_1.$jc();
                disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.Ob(viewContainer, viewContainerModel)));
                disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.Qb(viewContainer)));
                this.fb.set(viewContainer.id, disposables);
            }
        }
        Nb(viewContainer) {
            const disposable = this.fb.get(viewContainer.id);
            disposable?.dispose();
            this.fb.delete(viewContainer.id);
            this.Ub(viewContainer.id);
        }
        Ob(viewContainer, viewContainerModel) {
            const activity = this.toActivity(viewContainerModel);
            const { activityAction, pinnedAction } = this.Lb(viewContainer.id);
            activityAction.updateActivity(activity);
            if (pinnedAction instanceof activitybarActions_1.$Xxb) {
                pinnedAction.setActivity(activity);
            }
            this.Zb();
        }
        toActivity(viewContainerModel) {
            return $4xb_1.Pb(viewContainerModel.viewContainer.id, viewContainerModel.title, viewContainerModel.icon, viewContainerModel.keybindingId);
        }
        static Pb(id, name, icon, keybindingId) {
            let classNames = undefined;
            let iconUrl = undefined;
            if (uri_1.URI.isUri(icon)) {
                iconUrl = icon;
                const cssUrl = (0, dom_1.$nP)(icon);
                const hash = new hash_1.$vi();
                hash.update(cssUrl);
                const iconId = `activity-${id.replace(/\./g, '-')}-${hash.digest()}`;
                const iconClass = `.monaco-workbench .activitybar .monaco-action-bar .action-label.${iconId}`;
                classNames = [iconId, 'uri-icon'];
                (0, dom_1.$ZO)(iconClass, `
				mask: ${cssUrl} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${cssUrl} no-repeat 50% 50%;
				-webkit-mask-size: 24px;
			`);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                classNames = themables_1.ThemeIcon.asClassNameArray(icon);
            }
            return { id, name, classNames, iconUrl, keybindingId };
        }
        Qb(viewContainer) {
            let contextKey = this.jb.get(viewContainer.id);
            if (!contextKey) {
                contextKey = this.pb.createKey((0, contextkeys_1.$Jdb)(viewContainer.id), false);
                this.jb.set(viewContainer.id, contextKey);
            }
            if (this.Rb(viewContainer)) {
                contextKey.set(false);
                this.Tb(viewContainer.id);
            }
            else {
                contextKey.set(true);
                this.Sb(viewContainer);
            }
        }
        Rb(viewContainerOrId, cachedViewContainer) {
            const viewContainer = (0, types_1.$jf)(viewContainerOrId) ? this.Wb(viewContainerOrId) : viewContainerOrId;
            const viewContainerId = (0, types_1.$jf)(viewContainerOrId) ? viewContainerOrId : viewContainerOrId.id;
            if (viewContainer) {
                if (viewContainer.hideIfEmpty) {
                    if (this.ob.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            // Check cache only if extensions are not yet registered and current window is not native (desktop) remote connection window
            if (!this.ib && !(this.rb.remoteAuthority && platform_1.$m)) {
                cachedViewContainer = cachedViewContainer || this.ac.find(({ id }) => id === viewContainerId);
                // Show builtin ViewContainer if not registered yet
                if (!viewContainer && cachedViewContainer?.isBuiltin && cachedViewContainer?.visible) {
                    return false;
                }
                if (cachedViewContainer?.views?.length) {
                    return cachedViewContainer.views.every(({ when }) => !!when && !this.pb.contextMatchesRules(contextkey_1.$Ii.deserialize(when)));
                }
            }
            return true;
        }
        Sb(viewContainer) {
            this.X.addComposite({ id: viewContainer.id, name: typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
        }
        Tb(compositeId) {
            this.X.hideComposite(compositeId);
            const compositeActions = this.eb.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.eb.delete(compositeId);
            }
        }
        Ub(compositeId) {
            this.X.removeComposite(compositeId);
            const compositeActions = this.eb.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.eb.delete(compositeId);
            }
        }
        getPinnedPaneCompositeIds() {
            const pinnedCompositeIds = this.X.getPinnedComposites().map(v => v.id);
            return this.Xb()
                .filter(v => this.X.isPinned(v.id))
                .sort((v1, v2) => pinnedCompositeIds.indexOf(v1.id) - pinnedCompositeIds.indexOf(v2.id))
                .map(v => v.id);
        }
        getVisiblePaneCompositeIds() {
            return this.X.getVisibleComposites()
                .filter(v => this.kb.getActivePaneComposite()?.getId() === v.id || this.X.isPinned(v.id))
                .map(v => v.id);
        }
        focus() {
            this.X.focus();
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.$uf)(this.getContainer());
            const background = this.z(theme_1.$mab) || '';
            container.style.backgroundColor = background;
            const borderColor = this.z(theme_1.$pab) || this.z(colorRegistry_1.$Av) || '';
            container.classList.toggle('bordered', !!borderColor);
            container.style.borderColor = borderColor ? borderColor : '';
        }
        Vb(theme) {
            return {
                activeForegroundColor: theme.getColor(theme_1.$nab),
                inactiveForegroundColor: theme.getColor(theme_1.$oab),
                activeBorderColor: theme.getColor(theme_1.$qab),
                activeBackground: theme.getColor(theme_1.$sab),
                badgeBackground: theme.getColor(theme_1.$uab),
                badgeForeground: theme.getColor(theme_1.$vab),
                dragAndDropBorder: theme.getColor(theme_1.$tab),
                activeBackgroundColor: undefined, inactiveBackgroundColor: undefined, activeBorderBottomColor: undefined,
            };
        }
        layout(width, height) {
            if (!this.u.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */)) {
                return;
            }
            // Layout contents
            const contentAreaSize = super.N(width, height).contentSize;
            // Layout composite bar
            let availableHeight = contentAreaSize.height;
            if (this.W) {
                availableHeight -= this.W.clientHeight;
            }
            if (this.$) {
                availableHeight -= (this.$.viewItems.length * $4xb_1.y); // adjust height for global actions showing
            }
            this.X.layout(new dom_1.$BO(width, availableHeight));
        }
        Wb(id) {
            const viewContainer = this.ob.getViewContainerById(id);
            return viewContainer && this.ob.getViewContainerLocation(viewContainer) === this.hb ? viewContainer : undefined;
        }
        Xb() {
            return this.ob.getViewContainersByLocation(this.hb);
        }
        Yb(e) {
            if (this.fc !== this.gc() /* This checks if current window changed the value or not */) {
                this.ec = undefined;
                this.$b = undefined;
                const newCompositeItems = [];
                const compositeItems = this.X.getCompositeBarItems();
                for (const cachedViewContainer of this.ac) {
                    newCompositeItems.push({
                        id: cachedViewContainer.id,
                        name: cachedViewContainer.name,
                        order: cachedViewContainer.order,
                        pinned: cachedViewContainer.pinned,
                        visible: !!compositeItems.find(({ id }) => id === cachedViewContainer.id)
                    });
                }
                for (let index = 0; index < compositeItems.length; index++) {
                    // Add items currently exists but does not exist in new.
                    if (!newCompositeItems.some(({ id }) => id === compositeItems[index].id)) {
                        const viewContainer = this.ob.getViewContainerById(compositeItems[index].id);
                        newCompositeItems.splice(index, 0, {
                            ...compositeItems[index],
                            pinned: true,
                            visible: true,
                            order: viewContainer?.order,
                        });
                    }
                }
                this.X.setCompositeBarItems(newCompositeItems);
            }
        }
        Zb() {
            const state = [];
            const compositeItems = this.X.getCompositeBarItems();
            for (const compositeItem of compositeItems) {
                const viewContainer = this.Wb(compositeItem.id);
                if (viewContainer) {
                    const viewContainerModel = this.ob.getViewContainerModel(viewContainer);
                    const views = [];
                    for (const { when } of viewContainerModel.allViewDescriptors) {
                        views.push({ when: when ? when.serialize() : undefined });
                    }
                    state.push({
                        id: compositeItem.id,
                        name: viewContainerModel.title,
                        icon: uri_1.URI.isUri(viewContainerModel.icon) && this.rb.remoteAuthority ? undefined : viewContainerModel.icon,
                        views,
                        pinned: compositeItem.pinned,
                        order: compositeItem.order,
                        visible: compositeItem.visible,
                        isBuiltin: !viewContainer.extensionId
                    });
                }
                else {
                    state.push({ id: compositeItem.id, pinned: compositeItem.pinned, order: compositeItem.order, visible: false, isBuiltin: false });
                }
            }
            this.bc(state);
        }
        get ac() {
            if (this.$b === undefined) {
                this.$b = this.cc();
                for (const placeholderViewContainer of this.ic()) {
                    const cachedViewContainer = this.$b.filter(cached => cached.id === placeholderViewContainer.id)[0];
                    if (cachedViewContainer) {
                        cachedViewContainer.name = placeholderViewContainer.name;
                        cachedViewContainer.icon = placeholderViewContainer.themeIcon ? placeholderViewContainer.themeIcon :
                            placeholderViewContainer.iconUrl ? uri_1.URI.revive(placeholderViewContainer.iconUrl) : undefined;
                        if (uri_1.URI.isUri(cachedViewContainer.icon) && this.rb.remoteAuthority) {
                            cachedViewContainer.icon = undefined; // Do not cache uri icons with remote connection
                        }
                        cachedViewContainer.views = placeholderViewContainer.views;
                        cachedViewContainer.isBuiltin = placeholderViewContainer.isBuiltin;
                    }
                }
            }
            return this.$b;
        }
        bc(cachedViewContainers) {
            this.dc(cachedViewContainers.map(({ id, pinned, visible, order }) => ({
                id,
                pinned,
                visible,
                order
            })));
            this.jc(cachedViewContainers.map(({ id, icon, name, views, isBuiltin }) => ({
                id,
                iconUrl: uri_1.URI.isUri(icon) ? icon : undefined,
                themeIcon: themables_1.ThemeIcon.isThemeIcon(icon) ? icon : undefined,
                name,
                isBuiltin,
                views
            })));
        }
        cc() {
            return JSON.parse(this.fc);
        }
        dc(pinnedViewContainers) {
            this.fc = JSON.stringify(pinnedViewContainers);
        }
        get fc() {
            if (!this.ec) {
                this.ec = this.gc();
            }
            return this.ec;
        }
        set fc(pinnedViewContainersValue) {
            if (this.fc !== pinnedViewContainersValue) {
                this.ec = pinnedViewContainersValue;
                this.hc(pinnedViewContainersValue);
            }
        }
        gc() {
            return this.mb.get($4xb_1.a, 0 /* StorageScope.PROFILE */, '[]');
        }
        hc(value) {
            this.mb.store($4xb_1.a, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        ic() {
            return JSON.parse(this.lc);
        }
        jc(placeholderViewContainers) {
            this.lc = JSON.stringify(placeholderViewContainers);
        }
        get lc() {
            if (!this.kc) {
                this.kc = this.mc();
            }
            return this.kc;
        }
        set lc(placeholderViewContainesValue) {
            if (this.lc !== placeholderViewContainesValue) {
                this.kc = placeholderViewContainesValue;
                this.nc(placeholderViewContainesValue);
            }
        }
        mc() {
            return this.mb.get($4xb_1.b, 0 /* StorageScope.PROFILE */, '[]');
        }
        nc(value) {
            this.mb.store($4xb_1.b, value, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        get oc() {
            return this.mb.getBoolean(activitybarActions_1.$Uxb.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, 0 /* StorageScope.PROFILE */, true);
        }
        set oc(value) {
            this.mb.store(activitybarActions_1.$Uxb.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        toJSON() {
            return {
                type: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */
            };
        }
    };
    exports.$4xb = $4xb;
    exports.$4xb = $4xb = $4xb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, layoutService_1.$Meb),
        __param(3, themeService_1.$gv),
        __param(4, storage_1.$Vo),
        __param(5, extensions_1.$MF),
        __param(6, views_1.$_E),
        __param(7, contextkey_1.$3i),
        __param(8, configuration_1.$8h),
        __param(9, environmentService_1.$hJ)
    ], $4xb);
});
//# sourceMappingURL=activitybarPart.js.map