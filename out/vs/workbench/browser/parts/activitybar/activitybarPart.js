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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/activity", "vs/workbench/browser/part", "vs/workbench/browser/parts/activitybar/activitybarActions", "vs/workbench/services/activity/common/activity", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/workbench/browser/actions/layoutActions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositeBar", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/workbench/browser/parts/compositeBarActions", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/environment/common/environmentService", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/configuration/common/configuration", "vs/platform/window/common/window", "vs/base/common/platform", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/actions", "vs/base/browser/keyboardEvent", "vs/platform/theme/common/iconRegistry", "vs/base/common/hash", "vs/css!./media/activitybarpart"], function (require, exports, nls_1, actionbar_1, activity_1, part_1, activitybarActions_1, activity_2, layoutService_1, instantiation_1, lifecycle_1, layoutActions_1, themeService_1, theme_1, colorRegistry_1, compositeBar_1, dom_1, storage_1, extensions_1, uri_1, compositeBarActions_1, views_1, contextkeys_1, contextkey_1, types_1, environmentService_1, menubarControl_1, configuration_1, window_1, platform_1, codicons_1, themables_1, actions_1, keyboardEvent_1, iconRegistry_1, hash_1) {
    "use strict";
    var ActivitybarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActivitybarPart = void 0;
    let ActivitybarPart = class ActivitybarPart extends part_1.Part {
        static { ActivitybarPart_1 = this; }
        static { this.PINNED_VIEW_CONTAINERS = 'workbench.activity.pinnedViewlets2'; }
        static { this.PLACEHOLDER_VIEW_CONTAINERS = 'workbench.activity.placeholderViewlets'; }
        static { this.ACTION_HEIGHT = 48; }
        static { this.ACCOUNTS_ACTION_INDEX = 0; }
        static { this.GEAR_ICON = (0, iconRegistry_1.registerIcon)('settings-view-bar-icon', codicons_1.Codicon.settingsGear, (0, nls_1.localize)('settingsViewBarIcon', "Settings icon in the view bar.")); }
        static { this.ACCOUNTS_ICON = (0, iconRegistry_1.registerIcon)('accounts-view-bar-icon', codicons_1.Codicon.account, (0, nls_1.localize)('accountsViewBarIcon', "Accounts icon in the view bar.")); }
        constructor(paneCompositePart, instantiationService, layoutService, themeService, storageService, extensionService, viewDescriptorService, contextKeyService, configurationService, environmentService) {
            super("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.paneCompositePart = paneCompositePart;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.viewDescriptorService = viewDescriptorService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            //#region IView
            this.minimumWidth = 48;
            this.maximumWidth = 48;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.globalActivity = [];
            this.accountsActivity = [];
            this.compositeActions = new Map();
            this.viewContainerDisposables = new Map();
            this.keyboardNavigationDisposables = this._register(new lifecycle_1.DisposableStore());
            this.location = 0 /* ViewContainerLocation.Sidebar */;
            this.hasExtensionsRegistered = false;
            this.enabledViewContainersContextKeys = new Map();
            this._cachedViewContainers = undefined;
            for (const cachedViewContainer of this.cachedViewContainers) {
                cachedViewContainer.visible = !this.shouldBeHidden(cachedViewContainer.id, cachedViewContainer);
            }
            this.compositeBar = this.createCompositeBar();
            this.onDidRegisterViewContainers(this.getViewContainers());
            this.registerListeners();
        }
        createCompositeBar() {
            const cachedItems = this.cachedViewContainers
                .map(container => ({
                id: container.id,
                name: container.name,
                visible: container.visible,
                order: container.order,
                pinned: container.pinned,
            }));
            return this._register(this.instantiationService.createInstance(compositeBar_1.CompositeBar, cachedItems, {
                icon: true,
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                activityHoverOptions: this.getActivityHoverOptions(),
                preventLoopNavigation: true,
                openComposite: async (compositeId, preserveFocus) => {
                    return (await this.paneCompositePart.openPaneComposite(compositeId, !preserveFocus)) ?? null;
                },
                getActivityAction: compositeId => this.getCompositeActions(compositeId).activityAction,
                getCompositePinnedAction: compositeId => this.getCompositeActions(compositeId).pinnedAction,
                getCompositeBadgeAction: compositeId => this.getCompositeActions(compositeId).badgeAction,
                getOnCompositeClickAction: compositeId => (0, actions_1.toAction)({ id: compositeId, label: '', run: async () => this.paneCompositePart.getActivePaneComposite()?.getId() === compositeId ? this.paneCompositePart.hideActivePaneComposite() : this.paneCompositePart.openPaneComposite(compositeId) }),
                fillExtraContextMenuActions: (actions, e) => {
                    // Menu
                    const menuBarVisibility = (0, window_1.getMenuBarVisibility)(this.configurationService);
                    if (menuBarVisibility === 'compact' || menuBarVisibility === 'hidden' || menuBarVisibility === 'toggle') {
                        actions.unshift(...[(0, actions_1.toAction)({ id: 'toggleMenuVisibility', label: (0, nls_1.localize)('menu', "Menu"), checked: menuBarVisibility === 'compact', run: () => this.configurationService.updateValue('window.menuBarVisibility', menuBarVisibility === 'compact' ? 'toggle' : 'compact') }), new actions_1.Separator()]);
                    }
                    if (menuBarVisibility === 'compact' && this.menuBarContainer && e?.target) {
                        if ((0, dom_1.isAncestor)(e.target, this.menuBarContainer)) {
                            actions.unshift(...[(0, actions_1.toAction)({ id: 'hideCompactMenu', label: (0, nls_1.localize)('hideMenu', "Hide Menu"), run: () => this.configurationService.updateValue('window.menuBarVisibility', 'toggle') }), new actions_1.Separator()]);
                        }
                    }
                    // Accounts
                    actions.push(new actions_1.Separator());
                    actions.push((0, actions_1.toAction)({ id: 'toggleAccountsVisibility', label: (0, nls_1.localize)('accounts', "Accounts"), checked: this.accountsVisibilityPreference, run: () => this.accountsVisibilityPreference = !this.accountsVisibilityPreference }));
                    actions.push(new actions_1.Separator());
                    // Toggle Sidebar
                    actions.push((0, actions_1.toAction)({ id: layoutActions_1.ToggleSidebarPositionAction.ID, label: layoutActions_1.ToggleSidebarPositionAction.getLabel(this.layoutService), run: () => this.instantiationService.invokeFunction(accessor => new layoutActions_1.ToggleSidebarPositionAction().run(accessor)) }));
                    // Toggle Activity Bar
                    actions.push((0, actions_1.toAction)({ id: layoutActions_1.ToggleActivityBarVisibilityAction.ID, label: (0, nls_1.localize)('hideActivitBar', "Hide Activity Bar"), run: () => this.instantiationService.invokeFunction(accessor => new layoutActions_1.ToggleActivityBarVisibilityAction().run(accessor)) }));
                },
                getContextMenuActionsForComposite: compositeId => this.getContextMenuActionsForComposite(compositeId),
                getDefaultCompositeId: () => this.viewDescriptorService.getDefaultViewContainer(this.location)?.id,
                hidePart: () => this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */),
                dndHandler: new compositeBar_1.CompositeDragAndDrop(this.viewDescriptorService, 0 /* ViewContainerLocation.Sidebar */, async (id, focus) => { return await this.paneCompositePart.openPaneComposite(id, focus) ?? null; }, (from, to, before) => this.compositeBar.move(from, to, before?.verticallyBefore), () => this.compositeBar.getCompositeBarItems()),
                compositeSize: 52,
                colors: (theme) => this.getActivitybarItemColors(theme),
                overflowActionSize: ActivitybarPart_1.ACTION_HEIGHT
            }));
        }
        getActivityHoverOptions() {
            return {
                position: () => this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? 1 /* HoverPosition.RIGHT */ : 0 /* HoverPosition.LEFT */,
            };
        }
        getContextMenuActionsForComposite(compositeId) {
            const actions = [];
            const viewContainer = this.viewDescriptorService.getViewContainerById(compositeId);
            const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
            if (defaultLocation !== this.viewDescriptorService.getViewContainerLocation(viewContainer)) {
                actions.push((0, actions_1.toAction)({ id: 'resetLocationAction', label: (0, nls_1.localize)('resetLocation', "Reset Location"), run: () => this.viewDescriptorService.moveViewContainerToLocation(viewContainer, defaultLocation) }));
            }
            else {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                if (viewContainerModel.allViewDescriptors.length === 1) {
                    const viewToReset = viewContainerModel.allViewDescriptors[0];
                    const defaultContainer = this.viewDescriptorService.getDefaultContainerById(viewToReset.id);
                    if (defaultContainer !== viewContainer) {
                        actions.push((0, actions_1.toAction)({ id: 'resetLocationAction', label: (0, nls_1.localize)('resetLocation', "Reset Location"), run: () => this.viewDescriptorService.moveViewsToContainer([viewToReset], defaultContainer) }));
                    }
                }
            }
            return actions;
        }
        registerListeners() {
            // View Container Changes
            this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeViewContainers(added, removed)));
            this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeViewContainerLocation(viewContainer, from, to)));
            // View Container Visibility Changes
            this.paneCompositePart.onDidPaneCompositeOpen(e => this.onDidChangeViewContainerVisibility(e.getId(), true));
            this.paneCompositePart.onDidPaneCompositeClose(e => this.onDidChangeViewContainerVisibility(e.getId(), false));
            // Extension registration
            const disposables = this._register(new lifecycle_1.DisposableStore());
            this._register(this.extensionService.onDidRegisterExtensions(() => {
                disposables.clear();
                this.onDidRegisterExtensions();
                this.compositeBar.onDidChange(() => this.saveCachedViewContainers(), this, disposables);
                this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, ActivitybarPart_1.PINNED_VIEW_CONTAINERS, disposables)(e => this.onDidPinnedViewContainersStorageValueChange(e), this, disposables);
                this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, activitybarActions_1.AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, disposables)(() => this.toggleAccountsActivity(), this, disposables);
            }));
            // Register for configuration changes
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.menuBarVisibility')) {
                    if ((0, window_1.getMenuBarVisibility)(this.configurationService) === 'compact') {
                        this.installMenubar();
                    }
                    else {
                        this.uninstallMenubar();
                    }
                }
            }));
        }
        onDidChangeViewContainers(added, removed) {
            removed.filter(({ location }) => location === 0 /* ViewContainerLocation.Sidebar */).forEach(({ container }) => this.onDidDeregisterViewContainer(container));
            this.onDidRegisterViewContainers(added.filter(({ location }) => location === 0 /* ViewContainerLocation.Sidebar */).map(({ container }) => container));
        }
        onDidChangeViewContainerLocation(container, from, to) {
            if (from === this.location) {
                this.onDidDeregisterViewContainer(container);
            }
            if (to === this.location) {
                this.onDidRegisterViewContainers([container]);
            }
        }
        onDidChangeViewContainerVisibility(id, visible) {
            if (visible) {
                // Activate view container action on opening of a view container
                this.onDidViewContainerVisible(id);
            }
            else {
                // Deactivate view container action on close
                this.compositeBar.deactivateComposite(id);
            }
        }
        onDidRegisterExtensions() {
            this.hasExtensionsRegistered = true;
            // show/hide/remove composites
            for (const { id } of this.cachedViewContainers) {
                const viewContainer = this.getViewContainer(id);
                if (viewContainer) {
                    this.showOrHideViewContainer(viewContainer);
                }
                else {
                    if (this.viewDescriptorService.isViewContainerRemovedPermanently(id)) {
                        this.removeComposite(id);
                    }
                    else {
                        this.hideComposite(id);
                    }
                }
            }
            this.saveCachedViewContainers();
        }
        onDidViewContainerVisible(id) {
            const viewContainer = this.getViewContainer(id);
            if (viewContainer) {
                // Update the composite bar by adding
                this.addComposite(viewContainer);
                this.compositeBar.activateComposite(viewContainer.id);
                if (this.shouldBeHidden(viewContainer)) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    if (viewContainerModel.activeViewDescriptors.length === 0) {
                        // Update the composite bar by hiding
                        this.hideComposite(viewContainer.id);
                    }
                }
            }
        }
        showActivity(viewContainerOrActionId, badge, clazz, priority) {
            if (this.getViewContainer(viewContainerOrActionId)) {
                return this.compositeBar.showActivity(viewContainerOrActionId, badge, clazz, priority);
            }
            if (viewContainerOrActionId === activity_1.GLOBAL_ACTIVITY_ID) {
                return this.showGlobalActivity(activity_1.GLOBAL_ACTIVITY_ID, badge, clazz, priority);
            }
            if (viewContainerOrActionId === activity_1.ACCOUNTS_ACTIVITY_ID) {
                return this.showGlobalActivity(activity_1.ACCOUNTS_ACTIVITY_ID, badge, clazz, priority);
            }
            return lifecycle_1.Disposable.None;
        }
        showGlobalActivity(activityId, badge, clazz, priority) {
            if (typeof priority !== 'number') {
                priority = 0;
            }
            const activity = { badge, clazz, priority };
            const activityCache = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivity : this.accountsActivity;
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
            this.updateGlobalActivity(activityId);
            return (0, lifecycle_1.toDisposable)(() => this.removeGlobalActivity(activityId, activity));
        }
        removeGlobalActivity(activityId, activity) {
            const activityCache = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivity : this.accountsActivity;
            const index = activityCache.indexOf(activity);
            if (index !== -1) {
                activityCache.splice(index, 1);
                this.updateGlobalActivity(activityId);
            }
        }
        updateGlobalActivity(activityId) {
            const activityAction = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivityAction : this.accountsActivityAction;
            if (!activityAction) {
                return;
            }
            const activityCache = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivity : this.accountsActivity;
            if (activityCache.length) {
                const [{ badge, clazz, priority }] = activityCache;
                if (badge instanceof activity_2.NumberBadge && activityCache.length > 1) {
                    const cumulativeNumberBadge = this.getCumulativeNumberBadge(activityCache, priority);
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
        getCumulativeNumberBadge(activityCache, priority) {
            const numberActivities = activityCache.filter(activity => activity.badge instanceof activity_2.NumberBadge && activity.priority === priority);
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
            return new activity_2.NumberBadge(number, descriptorFn);
        }
        uninstallMenubar() {
            if (this.menuBar) {
                this.menuBar.dispose();
                this.menuBar = undefined;
            }
            if (this.menuBarContainer) {
                this.menuBarContainer.remove();
                this.menuBarContainer = undefined;
                this.registerKeyboardNavigationListeners();
            }
        }
        installMenubar() {
            if (this.menuBar) {
                return; // prevent menu bar from installing twice #110720
            }
            this.menuBarContainer = document.createElement('div');
            this.menuBarContainer.classList.add('menubar');
            const content = (0, types_1.assertIsDefined)(this.content);
            content.prepend(this.menuBarContainer);
            // Menubar: install a custom menu bar depending on configuration
            this.menuBar = this._register(this.instantiationService.createInstance(menubarControl_1.CustomMenubarControl));
            this.menuBar.create(this.menuBarContainer);
            this.registerKeyboardNavigationListeners();
        }
        createContentArea(parent) {
            this.element = parent;
            this.content = document.createElement('div');
            this.content.classList.add('content');
            parent.appendChild(this.content);
            // Install menubar if compact
            if ((0, window_1.getMenuBarVisibility)(this.configurationService) === 'compact') {
                this.installMenubar();
            }
            // View Containers action bar
            this.compositeBarContainer = this.compositeBar.create(this.content);
            // Global action bar
            this.globalActivitiesContainer = document.createElement('div');
            this.content.appendChild(this.globalActivitiesContainer);
            this.createGlobalActivityActionBar(this.globalActivitiesContainer);
            // Keyboard Navigation
            this.registerKeyboardNavigationListeners();
            return this.content;
        }
        registerKeyboardNavigationListeners() {
            this.keyboardNavigationDisposables.clear();
            // Up/Down arrow on compact menu
            if (this.menuBarContainer) {
                this.keyboardNavigationDisposables.add((0, dom_1.addDisposableListener)(this.menuBarContainer, dom_1.EventType.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (kbEvent.equals(18 /* KeyCode.DownArrow */) || kbEvent.equals(17 /* KeyCode.RightArrow */)) {
                        this.compositeBar?.focus();
                    }
                }));
            }
            // Up/Down on Activity Icons
            if (this.compositeBarContainer) {
                this.keyboardNavigationDisposables.add((0, dom_1.addDisposableListener)(this.compositeBarContainer, dom_1.EventType.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (kbEvent.equals(18 /* KeyCode.DownArrow */) || kbEvent.equals(17 /* KeyCode.RightArrow */)) {
                        this.globalActivityActionBar?.focus(true);
                    }
                    else if (kbEvent.equals(16 /* KeyCode.UpArrow */) || kbEvent.equals(15 /* KeyCode.LeftArrow */)) {
                        this.menuBar?.toggleFocus();
                    }
                }));
            }
            // Up arrow on global icons
            if (this.globalActivitiesContainer) {
                this.keyboardNavigationDisposables.add((0, dom_1.addDisposableListener)(this.globalActivitiesContainer, dom_1.EventType.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (kbEvent.equals(16 /* KeyCode.UpArrow */) || kbEvent.equals(15 /* KeyCode.LeftArrow */)) {
                        this.compositeBar?.focus(this.getVisiblePaneCompositeIds().length - 1);
                    }
                }));
            }
        }
        createGlobalActivityActionBar(container) {
            this.globalActivityActionBar = this._register(new actionbar_1.ActionBar(container, {
                actionViewItemProvider: action => {
                    if (action.id === 'workbench.actions.manage') {
                        return this.instantiationService.createInstance(activitybarActions_1.GlobalActivityActionViewItem, action, () => this.compositeBar.getContextMenuActions(), (theme) => this.getActivitybarItemColors(theme), this.getActivityHoverOptions());
                    }
                    if (action.id === 'workbench.actions.accounts') {
                        return this.instantiationService.createInstance(activitybarActions_1.AccountsActivityActionViewItem, action, () => this.compositeBar.getContextMenuActions(), (theme) => this.getActivitybarItemColors(theme), this.getActivityHoverOptions());
                    }
                    throw new Error(`No view item for action '${action.id}'`);
                },
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                ariaLabel: (0, nls_1.localize)('manage', "Manage"),
                animated: false,
                preventLoopNavigation: true
            }));
            this.globalActivityAction = this._register(new compositeBarActions_1.ActivityAction({
                id: 'workbench.actions.manage',
                name: (0, nls_1.localize)('manage', "Manage"),
                classNames: themables_1.ThemeIcon.asClassNameArray(ActivitybarPart_1.GEAR_ICON),
            }));
            if (this.accountsVisibilityPreference) {
                this.accountsActivityAction = this._register(new compositeBarActions_1.ActivityAction({
                    id: 'workbench.actions.accounts',
                    name: (0, nls_1.localize)('accounts', "Accounts"),
                    classNames: themables_1.ThemeIcon.asClassNameArray(ActivitybarPart_1.ACCOUNTS_ICON)
                }));
                this.globalActivityActionBar.push(this.accountsActivityAction, { index: ActivitybarPart_1.ACCOUNTS_ACTION_INDEX });
            }
            this.globalActivityActionBar.push(this.globalActivityAction);
        }
        toggleAccountsActivity() {
            if (!!this.accountsActivityAction === this.accountsVisibilityPreference) {
                return;
            }
            if (this.globalActivityActionBar) {
                if (this.accountsActivityAction) {
                    this.globalActivityActionBar.pull(ActivitybarPart_1.ACCOUNTS_ACTION_INDEX);
                    this.accountsActivityAction = undefined;
                }
                else {
                    this.accountsActivityAction = this._register(new compositeBarActions_1.ActivityAction({
                        id: 'workbench.actions.accounts',
                        name: (0, nls_1.localize)('accounts', "Accounts"),
                        classNames: themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.account)
                    }));
                    this.globalActivityActionBar.push(this.accountsActivityAction, { index: ActivitybarPart_1.ACCOUNTS_ACTION_INDEX });
                }
            }
            this.updateGlobalActivity(activity_1.ACCOUNTS_ACTIVITY_ID);
        }
        getCompositeActions(compositeId) {
            let compositeActions = this.compositeActions.get(compositeId);
            if (!compositeActions) {
                const viewContainer = this.getViewContainer(compositeId);
                if (viewContainer) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    compositeActions = {
                        activityAction: this.instantiationService.createInstance(activitybarActions_1.ViewContainerActivityAction, this.toActivity(viewContainerModel), this.paneCompositePart),
                        pinnedAction: new compositeBarActions_1.ToggleCompositePinnedAction(this.toActivity(viewContainerModel), this.compositeBar),
                        badgeAction: new compositeBarActions_1.ToggleCompositeBadgeAction(this.toActivity(viewContainerModel), this.compositeBar)
                    };
                }
                else {
                    const cachedComposite = this.cachedViewContainers.filter(c => c.id === compositeId)[0];
                    compositeActions = {
                        activityAction: this.instantiationService.createInstance(activitybarActions_1.PlaceHolderViewContainerActivityAction, ActivitybarPart_1.toActivity(compositeId, compositeId, cachedComposite?.icon, undefined), this.paneCompositePart),
                        pinnedAction: new activitybarActions_1.PlaceHolderToggleCompositePinnedAction(compositeId, this.compositeBar),
                        badgeAction: new activitybarActions_1.PlaceHolderToggleCompositeBadgeAction(compositeId, this.compositeBar)
                    };
                }
                this.compositeActions.set(compositeId, compositeActions);
            }
            return compositeActions;
        }
        onDidRegisterViewContainers(viewContainers) {
            for (const viewContainer of viewContainers) {
                this.addComposite(viewContainer);
                // Pin it by default if it is new
                const cachedViewContainer = this.cachedViewContainers.filter(({ id }) => id === viewContainer.id)[0];
                if (!cachedViewContainer) {
                    this.compositeBar.pin(viewContainer.id);
                }
                // Active
                const visibleViewContainer = this.paneCompositePart.getActivePaneComposite();
                if (visibleViewContainer?.getId() === viewContainer.id) {
                    this.compositeBar.activateComposite(viewContainer.id);
                }
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                this.updateActivity(viewContainer, viewContainerModel);
                this.showOrHideViewContainer(viewContainer);
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.updateActivity(viewContainer, viewContainerModel)));
                disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.showOrHideViewContainer(viewContainer)));
                this.viewContainerDisposables.set(viewContainer.id, disposables);
            }
        }
        onDidDeregisterViewContainer(viewContainer) {
            const disposable = this.viewContainerDisposables.get(viewContainer.id);
            disposable?.dispose();
            this.viewContainerDisposables.delete(viewContainer.id);
            this.removeComposite(viewContainer.id);
        }
        updateActivity(viewContainer, viewContainerModel) {
            const activity = this.toActivity(viewContainerModel);
            const { activityAction, pinnedAction } = this.getCompositeActions(viewContainer.id);
            activityAction.updateActivity(activity);
            if (pinnedAction instanceof activitybarActions_1.PlaceHolderToggleCompositePinnedAction) {
                pinnedAction.setActivity(activity);
            }
            this.saveCachedViewContainers();
        }
        toActivity(viewContainerModel) {
            return ActivitybarPart_1.toActivity(viewContainerModel.viewContainer.id, viewContainerModel.title, viewContainerModel.icon, viewContainerModel.keybindingId);
        }
        static toActivity(id, name, icon, keybindingId) {
            let classNames = undefined;
            let iconUrl = undefined;
            if (uri_1.URI.isUri(icon)) {
                iconUrl = icon;
                const cssUrl = (0, dom_1.asCSSUrl)(icon);
                const hash = new hash_1.StringSHA1();
                hash.update(cssUrl);
                const iconId = `activity-${id.replace(/\./g, '-')}-${hash.digest()}`;
                const iconClass = `.monaco-workbench .activitybar .monaco-action-bar .action-label.${iconId}`;
                classNames = [iconId, 'uri-icon'];
                (0, dom_1.createCSSRule)(iconClass, `
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
        showOrHideViewContainer(viewContainer) {
            let contextKey = this.enabledViewContainersContextKeys.get(viewContainer.id);
            if (!contextKey) {
                contextKey = this.contextKeyService.createKey((0, contextkeys_1.getEnabledViewContainerContextKey)(viewContainer.id), false);
                this.enabledViewContainersContextKeys.set(viewContainer.id, contextKey);
            }
            if (this.shouldBeHidden(viewContainer)) {
                contextKey.set(false);
                this.hideComposite(viewContainer.id);
            }
            else {
                contextKey.set(true);
                this.addComposite(viewContainer);
            }
        }
        shouldBeHidden(viewContainerOrId, cachedViewContainer) {
            const viewContainer = (0, types_1.isString)(viewContainerOrId) ? this.getViewContainer(viewContainerOrId) : viewContainerOrId;
            const viewContainerId = (0, types_1.isString)(viewContainerOrId) ? viewContainerOrId : viewContainerOrId.id;
            if (viewContainer) {
                if (viewContainer.hideIfEmpty) {
                    if (this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            // Check cache only if extensions are not yet registered and current window is not native (desktop) remote connection window
            if (!this.hasExtensionsRegistered && !(this.environmentService.remoteAuthority && platform_1.isNative)) {
                cachedViewContainer = cachedViewContainer || this.cachedViewContainers.find(({ id }) => id === viewContainerId);
                // Show builtin ViewContainer if not registered yet
                if (!viewContainer && cachedViewContainer?.isBuiltin && cachedViewContainer?.visible) {
                    return false;
                }
                if (cachedViewContainer?.views?.length) {
                    return cachedViewContainer.views.every(({ when }) => !!when && !this.contextKeyService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(when)));
                }
            }
            return true;
        }
        addComposite(viewContainer) {
            this.compositeBar.addComposite({ id: viewContainer.id, name: typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
        }
        hideComposite(compositeId) {
            this.compositeBar.hideComposite(compositeId);
            const compositeActions = this.compositeActions.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.compositeActions.delete(compositeId);
            }
        }
        removeComposite(compositeId) {
            this.compositeBar.removeComposite(compositeId);
            const compositeActions = this.compositeActions.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.compositeActions.delete(compositeId);
            }
        }
        getPinnedPaneCompositeIds() {
            const pinnedCompositeIds = this.compositeBar.getPinnedComposites().map(v => v.id);
            return this.getViewContainers()
                .filter(v => this.compositeBar.isPinned(v.id))
                .sort((v1, v2) => pinnedCompositeIds.indexOf(v1.id) - pinnedCompositeIds.indexOf(v2.id))
                .map(v => v.id);
        }
        getVisiblePaneCompositeIds() {
            return this.compositeBar.getVisibleComposites()
                .filter(v => this.paneCompositePart.getActivePaneComposite()?.getId() === v.id || this.compositeBar.isPinned(v.id))
                .map(v => v.id);
        }
        focus() {
            this.compositeBar.focus();
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const background = this.getColor(theme_1.ACTIVITY_BAR_BACKGROUND) || '';
            container.style.backgroundColor = background;
            const borderColor = this.getColor(theme_1.ACTIVITY_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder) || '';
            container.classList.toggle('bordered', !!borderColor);
            container.style.borderColor = borderColor ? borderColor : '';
        }
        getActivitybarItemColors(theme) {
            return {
                activeForegroundColor: theme.getColor(theme_1.ACTIVITY_BAR_FOREGROUND),
                inactiveForegroundColor: theme.getColor(theme_1.ACTIVITY_BAR_INACTIVE_FOREGROUND),
                activeBorderColor: theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_BORDER),
                activeBackground: theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_BACKGROUND),
                badgeBackground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND),
                badgeForeground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_FOREGROUND),
                dragAndDropBorder: theme.getColor(theme_1.ACTIVITY_BAR_DRAG_AND_DROP_BORDER),
                activeBackgroundColor: undefined, inactiveBackgroundColor: undefined, activeBorderBottomColor: undefined,
            };
        }
        layout(width, height) {
            if (!this.layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */)) {
                return;
            }
            // Layout contents
            const contentAreaSize = super.layoutContents(width, height).contentSize;
            // Layout composite bar
            let availableHeight = contentAreaSize.height;
            if (this.menuBarContainer) {
                availableHeight -= this.menuBarContainer.clientHeight;
            }
            if (this.globalActivityActionBar) {
                availableHeight -= (this.globalActivityActionBar.viewItems.length * ActivitybarPart_1.ACTION_HEIGHT); // adjust height for global actions showing
            }
            this.compositeBar.layout(new dom_1.Dimension(width, availableHeight));
        }
        getViewContainer(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            return viewContainer && this.viewDescriptorService.getViewContainerLocation(viewContainer) === this.location ? viewContainer : undefined;
        }
        getViewContainers() {
            return this.viewDescriptorService.getViewContainersByLocation(this.location);
        }
        onDidPinnedViewContainersStorageValueChange(e) {
            if (this.pinnedViewContainersValue !== this.getStoredPinnedViewContainersValue() /* This checks if current window changed the value or not */) {
                this._pinnedViewContainersValue = undefined;
                this._cachedViewContainers = undefined;
                const newCompositeItems = [];
                const compositeItems = this.compositeBar.getCompositeBarItems();
                for (const cachedViewContainer of this.cachedViewContainers) {
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
                        const viewContainer = this.viewDescriptorService.getViewContainerById(compositeItems[index].id);
                        newCompositeItems.splice(index, 0, {
                            ...compositeItems[index],
                            pinned: true,
                            visible: true,
                            order: viewContainer?.order,
                        });
                    }
                }
                this.compositeBar.setCompositeBarItems(newCompositeItems);
            }
        }
        saveCachedViewContainers() {
            const state = [];
            const compositeItems = this.compositeBar.getCompositeBarItems();
            for (const compositeItem of compositeItems) {
                const viewContainer = this.getViewContainer(compositeItem.id);
                if (viewContainer) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    const views = [];
                    for (const { when } of viewContainerModel.allViewDescriptors) {
                        views.push({ when: when ? when.serialize() : undefined });
                    }
                    state.push({
                        id: compositeItem.id,
                        name: viewContainerModel.title,
                        icon: uri_1.URI.isUri(viewContainerModel.icon) && this.environmentService.remoteAuthority ? undefined : viewContainerModel.icon,
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
            this.storeCachedViewContainersState(state);
        }
        get cachedViewContainers() {
            if (this._cachedViewContainers === undefined) {
                this._cachedViewContainers = this.getPinnedViewContainers();
                for (const placeholderViewContainer of this.getPlaceholderViewContainers()) {
                    const cachedViewContainer = this._cachedViewContainers.filter(cached => cached.id === placeholderViewContainer.id)[0];
                    if (cachedViewContainer) {
                        cachedViewContainer.name = placeholderViewContainer.name;
                        cachedViewContainer.icon = placeholderViewContainer.themeIcon ? placeholderViewContainer.themeIcon :
                            placeholderViewContainer.iconUrl ? uri_1.URI.revive(placeholderViewContainer.iconUrl) : undefined;
                        if (uri_1.URI.isUri(cachedViewContainer.icon) && this.environmentService.remoteAuthority) {
                            cachedViewContainer.icon = undefined; // Do not cache uri icons with remote connection
                        }
                        cachedViewContainer.views = placeholderViewContainer.views;
                        cachedViewContainer.isBuiltin = placeholderViewContainer.isBuiltin;
                    }
                }
            }
            return this._cachedViewContainers;
        }
        storeCachedViewContainersState(cachedViewContainers) {
            this.setPinnedViewContainers(cachedViewContainers.map(({ id, pinned, visible, order }) => ({
                id,
                pinned,
                visible,
                order
            })));
            this.setPlaceholderViewContainers(cachedViewContainers.map(({ id, icon, name, views, isBuiltin }) => ({
                id,
                iconUrl: uri_1.URI.isUri(icon) ? icon : undefined,
                themeIcon: themables_1.ThemeIcon.isThemeIcon(icon) ? icon : undefined,
                name,
                isBuiltin,
                views
            })));
        }
        getPinnedViewContainers() {
            return JSON.parse(this.pinnedViewContainersValue);
        }
        setPinnedViewContainers(pinnedViewContainers) {
            this.pinnedViewContainersValue = JSON.stringify(pinnedViewContainers);
        }
        get pinnedViewContainersValue() {
            if (!this._pinnedViewContainersValue) {
                this._pinnedViewContainersValue = this.getStoredPinnedViewContainersValue();
            }
            return this._pinnedViewContainersValue;
        }
        set pinnedViewContainersValue(pinnedViewContainersValue) {
            if (this.pinnedViewContainersValue !== pinnedViewContainersValue) {
                this._pinnedViewContainersValue = pinnedViewContainersValue;
                this.setStoredPinnedViewContainersValue(pinnedViewContainersValue);
            }
        }
        getStoredPinnedViewContainersValue() {
            return this.storageService.get(ActivitybarPart_1.PINNED_VIEW_CONTAINERS, 0 /* StorageScope.PROFILE */, '[]');
        }
        setStoredPinnedViewContainersValue(value) {
            this.storageService.store(ActivitybarPart_1.PINNED_VIEW_CONTAINERS, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        getPlaceholderViewContainers() {
            return JSON.parse(this.placeholderViewContainersValue);
        }
        setPlaceholderViewContainers(placeholderViewContainers) {
            this.placeholderViewContainersValue = JSON.stringify(placeholderViewContainers);
        }
        get placeholderViewContainersValue() {
            if (!this._placeholderViewContainersValue) {
                this._placeholderViewContainersValue = this.getStoredPlaceholderViewContainersValue();
            }
            return this._placeholderViewContainersValue;
        }
        set placeholderViewContainersValue(placeholderViewContainesValue) {
            if (this.placeholderViewContainersValue !== placeholderViewContainesValue) {
                this._placeholderViewContainersValue = placeholderViewContainesValue;
                this.setStoredPlaceholderViewContainersValue(placeholderViewContainesValue);
            }
        }
        getStoredPlaceholderViewContainersValue() {
            return this.storageService.get(ActivitybarPart_1.PLACEHOLDER_VIEW_CONTAINERS, 0 /* StorageScope.PROFILE */, '[]');
        }
        setStoredPlaceholderViewContainersValue(value) {
            this.storageService.store(ActivitybarPart_1.PLACEHOLDER_VIEW_CONTAINERS, value, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        get accountsVisibilityPreference() {
            return this.storageService.getBoolean(activitybarActions_1.AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, 0 /* StorageScope.PROFILE */, true);
        }
        set accountsVisibilityPreference(value) {
            this.storageService.store(activitybarActions_1.AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        toJSON() {
            return {
                type: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */
            };
        }
    };
    exports.ActivitybarPart = ActivitybarPart;
    exports.ActivitybarPart = ActivitybarPart = ActivitybarPart_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, layoutService_1.IWorkbenchLayoutService),
        __param(3, themeService_1.IThemeService),
        __param(4, storage_1.IStorageService),
        __param(5, extensions_1.IExtensionService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, environmentService_1.IWorkbenchEnvironmentService)
    ], ActivitybarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHliYXJQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvYWN0aXZpdHliYXIvYWN0aXZpdHliYXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzRXpGLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsV0FBSTs7aUJBSWhCLDJCQUFzQixHQUFHLG9DQUFvQyxBQUF2QyxDQUF3QztpQkFDOUQsZ0NBQTJCLEdBQUcsd0NBQXdDLEFBQTNDLENBQTRDO2lCQUN2RSxrQkFBYSxHQUFHLEVBQUUsQUFBTCxDQUFNO2lCQUNuQiwwQkFBcUIsR0FBRyxDQUFDLEFBQUosQ0FBSztpQkFFMUIsY0FBUyxHQUFHLElBQUEsMkJBQVksRUFBQyx3QkFBd0IsRUFBRSxrQkFBTyxDQUFDLFlBQVksRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDLEFBQWxJLENBQW1JO2lCQUM1SSxrQkFBYSxHQUFHLElBQUEsMkJBQVksRUFBQyx3QkFBd0IsRUFBRSxrQkFBTyxDQUFDLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDLEFBQTdILENBQThIO1FBc0NuSyxZQUNrQixpQkFBcUMsRUFDL0Isb0JBQTRELEVBQzFELGFBQXNDLEVBQ2hELFlBQTJCLEVBQ3pCLGNBQWdELEVBQzlDLGdCQUFvRCxFQUMvQyxxQkFBOEQsRUFDbEUsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUNyRCxrQkFBaUU7WUFFL0YsS0FBSyw2REFBeUIsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQVgvRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2QseUJB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